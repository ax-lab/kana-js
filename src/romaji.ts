import { compile, convert } from './conversion'
import { rules_to_romaji } from './kana_rules'

const TO_ROMAJI = compile(rules_to_romaji())

/**
 * Converts any kana in the input text to romaji.
 *
 * This works on any mix of hiragana and katakana inputs. It will also convert
 * any Japanese punctuation and spacing to latin equivalents (mostly ASCII).
 */
export function to_romaji(input: string) {
	return convert(input, TO_ROMAJI)
}
