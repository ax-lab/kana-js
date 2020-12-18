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
type MappingRule = { key: string; out: string }

/**
 * Shorthand to create a MappingRule.
 */
export function m(key: string, out: string): MappingRule {
	return { key, out }
}

/**
 * Union type of all possible rule types.
 */
export type Rule = MappingRule

/**
 * Collection of text transformation rules.
 */
type RuleSet = List<Rule>

/**
 * Shorthand for building a RuleSet from a sequence of Rules or RuleSet.
 *
 * Note that later rules override previous ones, i.e. the sequence is in
 * increasing order of precedence.
 */
export function rules(...set: (Rule | RuleSet)[]): RuleSet {
	return List<Rule>().concat(...set)
}

//============================================================================//
// Transformation
//============================================================================//

type CompiledRuleSet = ReturnType<typeof compile>

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
		.map((_rule, key) => ({
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
 * Converts the input text using the given CompiledRuleSet returned by `compile`.
 */
export function convert(input: string, rules: CompiledRuleSet): string {
	const out = TextBuilder()

	// Note on case-sensitiveness: we want the conversion lookup to be
	// completely case-insensitive, so all keys are lowercased before lookup.
	//
	// At the same time, we don't want to change the case of the passthrough
	// unconverted text, so the lowercase transform is done only to the keys.

	// Scan the input string
	while (input.length) {
		// Lookup what is the maximum possible key length given the next char
		// code. Note that we don't care about Unicode codepoints at this point,
		// as the mapping algorithm will work regardless of them.
		const prefix = input.slice(0, 2).toLowerCase().charCodeAt(0)
		// Note that if length is zero, we simply pass the string through
		// unmodified.
		const length = rules.maxLengthByPrefix[prefix] || 0

		// This will return the string length to skip and if a mapping has been
		// found.
		const [skip, found] = (() => {
			if (length > 0) {
				// Start with the longest possible keys and work downward until
				// we either extract a key from the input or figure out it does
				// not apply.
				for (const keyLength of Range(1, length + 1).reverse()) {
					const key = input.slice(0, keyLength).toLowerCase()
					const rule = rules.mappings[key]
					if (rule) {
						out.push(rule.out)
						return tuple(keyLength, true)
					}
				}
			}
			// No rules applicable, pass through the text unmodified.
			return tuple(1, false)
		})()

		// If no rule was applied, just output the text verbatim.
		if (!found) {
			out.push(input.slice(0, skip))
		}

		// Skip to the next input to process.
		input = input.slice(skip)
	}

	return out.toString()
}
