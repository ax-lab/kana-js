import { to_katakana } from './katakana'
import { describe, expect, test } from './testutil'

describe('to_katakana', () => {
	test('should accept empty string', () => {
		expect(to_katakana('')).toEqual('')
	})

	test('should convert from common hiragana', () => {
		const IN =
			'あいうえお かきくけこ がぎぐげご さしすせそ ざじずぜぞ たちつてと だぢづでど なにぬねの はひふへほ ばびぶべぼ ぱぴぷぺぽ まみむめも やゆよ らりるれろ わゐゑをん'
		const TO =
			'アイウエオ カキクケコ ガギグゲゴ サシスセソ ザジズゼゾ タチツテト ダヂヅデド ナニヌネノ ハヒフヘホ バビブベボ パピプペポ マミムメモ ヤユヨ ラリルレロ ワヰヱヲン'
		expect(to_katakana(IN)).toEqual(TO)
	})

	test('should convert from small hiragana', () => {
		const IN = 'ぁぃぅぇぉっゃゅょゎゕゖ'
		const TO = 'ァィゥェォッャュョヮヵヶ'
		expect(to_katakana(IN)).toEqual(TO)
	})

	test('should convert from rare hiragana', () => {
		const IN = 'ゔゝゞゟ'
		const TO = 'ヴヽヾヨリ'
		expect(to_katakana(IN)).toEqual(TO)
	})

	test('should support combining marks', () => {
		const B = '\u{3099}' // Combining Katakana-Hiragana Voiced Sound Mark
		const P = '\u{309A}' // Combining Katakana-Hiragana Semi-Voiced Sound Mark
		const IN = `は${B}ひ${B}ふ${B}へ${B}ほ${B} は${P}ひ${P}ふ${P}へ${P}ほ${P}`
		const TO = 'バビブベボ パピプペポ'
		expect(to_katakana(IN)).toEqual(TO)
	})
})
