/**
 * Methods to test and extract characters from a string.
 *
 * @packageDocumentation
 */

/**
 * Returns the next Unicode character. This deal with UTF-16 surrogate pairs.
 */
export function nextChar(input: string): string {
	const cp = input.codePointAt(0)
	return cp ? String.fromCodePoint(cp) : ''
}
