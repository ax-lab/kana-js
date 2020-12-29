import { List, Range, Seq } from 'immutable'

import { TextBuilder, tuple } from './util'

//============================================================================//
// Text mapping rules
//----------------------------------------------------------------------------//
//
// We use a generic text conversion engine to convert between romaji, hiragana,
// and katakana. The engine operate on a RuleSet that provides a set of rules
// that describe the expected text output based on the input text at the current
// position.
//
// Rule sets can be combined to achieve different conversion behaviors such as
// IME typing support, romaji lookup key generation, etc.
//
//============================================================================//

/**
 * A simple rule that maps the input to the output, verbatim.
 */
type MappingRule = { key: string; out: string; len?: number; outFn?: MappingRuleFn }

/**
 * Shorthand to create a MappingRule.
 */
export function m(key: string, out: string, len = 0): MappingRule {
	return { key, out, len }
}

type SimpleRuleContext = {
	/** Input to the last rule matched */
	lastInput: string
	/** Output of the last rule matched */
	lastOutput: string
}

export type MappingRuleContext = SimpleRuleContext & {
	/** Current rules being used. */
	rules: CompiledRuleSet
	/** Input for the current rule */
	input: string
	/** Remaining input after this rule */
	nextInput: string
}

type MappingRuleFn = (ctx: MappingRuleContext) => [string, number] | [string, number, string]

export function mFn(key: string, outFn: MappingRuleFn): MappingRule {
	return { key, outFn, out: '' }
}

/**
 * Union type of all possible rule types.
 */
export type Rule = MappingRule

/**
 * Collection of text transformation rules.
 */
export type RuleSet = List<Rule>

/**
 * Shorthand for building a RuleSet from a sequence of Rules or RuleSet.
 *
 * Note that later rules override previous ones, i.e. the sequence is in
 * increasing order of precedence.
 */
export function rules(...set: (Rule | RuleSet)[]): RuleSet {
	return List<Rule>().concat(...set)
}

/**
 * Map every individual rule in the RuleSet using the given mapper and returns
 * a new RuleSet.
 */
export function transform_rules(rules: RuleSet, mapper: (input: Rule) => Rule | Rule[]): RuleSet {
	return rules.flatMap((input) => {
		const output = mapper(input)
		const mapping = Array.isArray(output) ? output : [output]
		return mapping.map((x) => ({
			...input,
			...x,
		}))
	})
}

//============================================================================//
// Transformation
//============================================================================//

export type CompiledRuleSet = ReturnType<typeof compile>

/**
 * Compiles a RuleSet to be used for text conversion with `convert`.
 */
export function compile(rules: RuleSet) {
	// Convert the RuleSet to a map, de-duplicating rules by key. Each key is
	// the expected input text that will be processed by the rule.
	const allByKey = Seq.Keyed(rules.map((x) => [x.key, x])).toMap()

	// Expand all keys to include normalized versions of themselves.
	const mappings = allByKey.flatMap((rule, key) => {
		const nfc = key.normalize('NFC')
		const nfd = key.normalize('NFD')
		if (nfc !== key) {
			if (nfd !== nfc) {
				return [
					[key, rule],
					[nfc, rule],
					[nfd, rule],
				]
			} else {
				return [
					[key, rule],
					[nfc, rule],
				]
			}
		} else if (nfd !== key) {
			return [
				[key, rule],
				[nfd, rule],
			]
		} else {
			return [[key, rule]]
		}
	})

	// Digest the rules and sort them starting with the longest keys.
	const allSorted = mappings
		.map((rule, key) => ({
			// The prefix is used for a quick lookup for the maximum key length
			// given the current point in the input string.
			prefix: key.charCodeAt(0),
			length: key.length,
		}))
		.sort((a, b) => b.length - a.length)

	// From a given rule prefix, find out the maximum length for the input key
	// and build a map for the lookup mentioned above.
	const maxLengthByPrefix = allSorted
		.groupBy((x) => x.prefix)
		.map((x) => x.first({ length: 0 }).length)
		.toMap()

	return {
		mappings: mappings.toJS() as { [key: string]: MappingRule },
		maxLengthByPrefix: maxLengthByPrefix.toJS() as { [key: number]: number },
	}
}

/**
 * Converts the next text in input using the compiled rule set. This applies a
 * single conversion rule to the beginning of the text.
 *
 * Returns a tuple containing:
 * - The generated output for the rule. Empty for no match.
 * - The length of the consumed input. Zero for no match.
 * - Context for the next rule.
 */
export function convert_next(
	input: string,
	rules: CompiledRuleSet,
	context: SimpleRuleContext = { lastInput: '', lastOutput: '' },
): [string, number, SimpleRuleContext] {
	// Lookup what is the maximum possible key length given the next char
	// code. Note that we don't care about Unicode codepoints at this point,
	// as the mapping algorithm will work regardless of them.
	//
	// About case conversion: we first try to lookup keys without converting
	// the case (this is to allow for case-specific rules). If that fails,
	// we fallback to lowercasing the key.
	const prefix = input.slice(0, 2)
	const length =
		(prefix &&
			(rules.maxLengthByPrefix[prefix.charCodeAt(0)] ||
				rules.maxLengthByPrefix[prefix.toLowerCase().charCodeAt(0)])) ||
		0

	// This will return the string length to skip and if a mapping has been
	// found.
	if (length > 0) {
		// Start with the longest possible keys and work downward until
		// we either extract a key from the input or figure out it does
		// not apply.
		for (const keyLength of Range(1, length + 1).reverse()) {
			const chunk = input.slice(0, keyLength)
			const key = chunk
			const rule = rules.mappings[key] || rules.mappings[key.toLowerCase()]
			if (rule) {
				if (rule.outFn) {
					// Rule is a function called with the context.
					const [txt, len, nextOutput] = rule.outFn({
						...context,
						rules: rules,
						input: chunk,
						nextInput: input.slice(keyLength),
					})
					if (len >= 0) {
						const output = txt || rule.out
						const length = len || rule.len || keyLength
						return tuple(output, length, { lastOutput: nextOutput || output, lastInput: chunk })
					}
				} else {
					const output = rule.out
					const length = rule.len || keyLength
					return tuple(output, length, { lastOutput: output, lastInput: chunk })
				}
			}
		}
	}

	// No rules applicable, pass through the text unmodified.
	return tuple('', 0, context)
}

/**
 * Converts the input text using the given CompiledRuleSet returned by `compile`.
 */
export function convert(input: string, rules: CompiledRuleSet): string {
	const out = TextBuilder()

	// eslint-disable-next-line functional/no-let
	let ctx = {
		lastInput: '',
		lastOutput: '',
	}

	// Scan the input string
	while (input.length) {
		const [output, length, next_ctx] = convert_next(input, rules, ctx)
		if (length) {
			out.push(output)
			ctx = next_ctx
			input = input.slice(length)
		} else {
			// If no rule was applied, just output the text verbatim.
			const next = input.charCodeAt(0)
			const surr = next >= 0xd800 && next <= 0xdbff
			const text = surr ? String.fromCodePoint(input.codePointAt(0)!) : input[0]
			out.push(text)
			input = input.slice(text.length)
			ctx = { lastInput: text, lastOutput: text }
		}
	}

	return out.toString()
}
