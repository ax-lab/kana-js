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

/**
 * Removes any unsupported combining marks from the Unicode string, effectively
 * stripping accents and other decoration from characters, while keeping valid
 * marks for Japanese/Romaji text.
 *
 * Returns a normalized NFC string.
 *
 * This will:
 *
 * - Strip combining marks from A-Z characters, except the long vowel accented
 *   variants used by romanization (e.g. `āīūēō` and `âîûêô`).
 * - Strip invalid combining voiced `゛` and semi-voiced `゜` sound marks from
 *   the text, while keeping it for valid hiragana/katakana combinations.
 * - If and only if `stripAnyLanguage` is true, this will also strip combining
 *   marks from all other Unicode characters. Otherwise, only A-Z character
 *   will be affected.
 */
export function removeAccents(input: string, stripAnyLanguage?: boolean): string {
	// Relevant Unicode characters:
	//
	// U+0302 - Combining Circumflex Accent
	// U+0304 - Combining Macron
	// U+3099 - Combining Katakana-Hiragana Voiced Sound Mark (tenten)
	// U+309A - Combining Katakana-Hiragana Semi-Voiced Sound Mark (maru)

	const RE_VOWEL = /^[AEIOUaeiou]/

	const firstMatchChar = (s: string, re: RegExp) => {
		const index = s.search(re)
		return index >= 0 ? s[index] : ''
	}
	const expanded = input.normalize('NFD')

	// If stripAnyLanguage is true we strip all marks, except for the combining
	// voiced marks used in hiragana/katakana and marks from vowels. Those get
	// processed below.
	const strippedAll = stripAnyLanguage
		? expanded.replace(/(^|[^\p{M}]?)([\p{M}]+)/gu, (match, p0: string, p1: string) => {
				// Vowels need special processing to preserve long vowel
				// variants used in romanization.
				if (RE_VOWEL.test(p0)) {
					return match
				}

				// Strip any marks, while preserving combining voiced sound
				// marks since those get processed later.
				const marks = p1.replace(/[^\u{3099}\u{309A}]/gu, '')
				return p0 + marks
		  })
		: expanded

	// Match all A-Z character followed by a sequence of marks. Strip all marks
	// except for a single combining U+0302 (circumflex accent) or U+0304 (macron).
	const strippedAZ = strippedAll.replace(/([A-Za-z])([\p{M}]+)/gu, (match, p0: string, p1: string) =>
		RE_VOWEL.test(p0) ? p0 + firstMatchChar(p1, /[\u{0302}\u{0304}]/u) : p0
	)

	// At this point, the only combining marks left to process should be the
	// kana voiced/semi-voiced sound marks:

	const HIRAGANA_WITH_TENTEN = 'うかきくけこさしすせそたちつてとはひふへほわゐゑをゝ'
	const HIRAGANA_WITH_MARU = 'はひふへほ'

	const KATAKANA_WITH_TENTEN = 'ウカキクケコサシスセソタチツテトハヒフヘホワヰヱヲヽ'
	const KATAKANA_WITH_MARU = 'ハヒフヘホ'

	const HALFKANA_WITH_TENTEN = 'ｳｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾊﾋﾌﾍﾎﾜ'
	const HALFKANA_WITH_MARU = 'ﾊﾋﾌﾍﾎ'

	const KANA_WITH_TENTEN = `${HIRAGANA_WITH_TENTEN}${KATAKANA_WITH_TENTEN}${HALFKANA_WITH_TENTEN}`
	const KANA_WITH_MARU = `${HIRAGANA_WITH_MARU}${KATAKANA_WITH_MARU}${HALFKANA_WITH_MARU}`

	const COMBINING_TENTEN = '\u{3099}'
	const COMBINING_MARU = '\u{309A}'

	// Match all kana voiced marks, optionally preceded by a non-mark character.
	//
	// We match the preceding character to the valid kana combinations.
	const output = strippedAZ.replace(/([^\p{M}]?)([\u{3099}\u{309A}]+)/gu, (match, p0: string, p1: string) => {
		const mark = p1[0]
		const keep =
			(mark == COMBINING_TENTEN && KANA_WITH_TENTEN.indexOf(p0) >= 0) ||
			(mark == COMBINING_MARU && KANA_WITH_MARU.indexOf(p0) >= 0)
		if (keep && p0) {
			return p0 + mark
		} else {
			return p0
		}
	})

	return output.normalize()
}
