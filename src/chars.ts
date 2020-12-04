/**
 * Methods to test and extract characters from a string.
 *
 * @packageDocumentation
 */

/**
 * Returns the first character in the string.
 *
 * This method handles UTF-16 surrogate pairs and is also aware of combining
 * marks.
 */
export function nextChar(input: string): string {
	const cp = input.codePointAt(0)
	return cp ? String.fromCodePoint(cp) : ''
}

const RE_STRIP_ACCENTS_ASCII = /([A-Za-z])[\p{M}]+/gu
const RE_STRIP_ACCENTS = /([^\p{M}])[\p{M}]+/gu

// U+0302 - Combining Circumflex Accent
// U+0304 - Combining Macron
// U+3099 - Combining Katakana-Hiragana Voiced Sound Mark
// U+309A - Combining Katakana-Hiragana Semi-Voiced Sound Mark
const RE_STRIP_ACCENTS_IGNORE = /[aeiou][\u{0302}\u{0304}]|[\u{3099}\u{309A}]/u

const HIRAGANA_WITH_TENTEN = 'うかきくけこさしすせそたちつてとはひふへほわゐゑをゝ'
const HIRAGANA_WITH_MARU = 'はひふへほ'

const KATAKANA_WITH_TENTEN = 'ウカキクケコサシスセソタチツテトハヒフヘホワヰヱヲヽ'
const KATAKANA_WITH_MARU = 'ハヒフヘホ'

const HALFKANA_WITH_TENTEN = 'ｳｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾊﾋﾌﾍﾎﾜ'
const HALFKANA_WITH_MARU = 'ﾊﾋﾌﾍﾎ'

// ｱｲｳｴｵ ｶｷｸｹｺ ｻｼｽｾｿ ﾀﾁﾂﾃﾄ ﾅﾆﾇﾈﾉ ﾊﾋﾌﾍﾎ ﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ

const KANA_WITH_TENTEN = `${HIRAGANA_WITH_TENTEN}${KATAKANA_WITH_TENTEN}${HALFKANA_WITH_TENTEN}`
const KANA_WITH_MARU = `${HIRAGANA_WITH_MARU}${KATAKANA_WITH_MARU}${HALFKANA_WITH_MARU}`

const RE_STRIP_COMBINING_TENTEN = new RegExp(`(^|[^${KANA_WITH_TENTEN}])\u{3099}`, 'gu')
const RE_STRIP_COMBINING_MARU = new RegExp(`(^|[^${KANA_WITH_MARU}])\u{309A}`, 'gu')

/**
 * Remove any unsupported accented characters from the string and normalizes
 * it. This will:
 *
 * - Strip accents from A-Z characters, except the long vowel accented variants
 *   used by romanization.
 * - Strip incorrect combining voiced `゛` and semi-voiced `゜` sound marks,
 *   while keeping the respective valid marks.
 * - Normalize the string, reducing the accented and combining kana marks to
 *   their minimal variants. This will still keep archaic kana combinations for
 *   which there is no single character (e.g. `わ゙`, `ゐ゙`).
 * - Strip any other accent marks, if and only if, `stripAnyLanguage` is true.
 */
export function removeAccents(input: string, stripAnyLanguage?: boolean): string {
	// strip = (s) => s.normalize('NFD').replace(/([A-Za-z])[\p{Mn}]+/gu, '$1').normalize()
	const expanded = input.normalize('NFD')
	const replacer = (match: string, p0: string) => (RE_STRIP_ACCENTS_IGNORE.test(match) ? match : p0)
	const withoutAccents = stripAnyLanguage
		? expanded.replace(RE_STRIP_ACCENTS, replacer)
		: expanded.replace(RE_STRIP_ACCENTS_ASCII, replacer)
	const output = withoutAccents.replace(RE_STRIP_COMBINING_TENTEN, '$1').replace(RE_STRIP_COMBINING_MARU, '$1')
	return output.normalize()
}
