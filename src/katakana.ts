import { compile, convert } from './conversion'
import { rules_to_katakana } from './kana_rules'

const TO_KATAKANA = compile(rules_to_katakana())

/**
 * Converts the input text to katakana.
 *
 * This works on any mix of romaji and hiragana inputs. It will also convert
 * romaji punctuation and spacing to the Japanese equivalents.
 */
export function to_katakana(input: string) {
	return convert(input, TO_KATAKANA)
}
