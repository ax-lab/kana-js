import { to_hiragana } from './hiragana'
import * as testkana from './testkana'
import { describe, expect, test } from './testutil'

describe('to_hiragana', () => {
	test('should accept empty string', () => {
		expect(to_hiragana('')).toEqual('')
	})

	test('should convert from common katakana', () => {
		const IN =
			'アイウエオ カキクケコ ガギグゲゴ サシスセソ ザジズゼゾ タチツテト ダヂヅデド ナニヌネノ ハヒフヘホ バビブベボ パピプペポ マミムメモ ヤユヨ ラリルレロ ワヰヱヲン'
		const TO =
			'あいうえお　かきくけこ　がぎぐげご　さしすせそ　ざじずぜぞ　たちつてと　だぢづでど　なにぬねの　はひふへほ　ばびぶべぼ　ぱぴぷぺぽ　まみむめも　やゆよ　らりるれろ　わゐゑをん'
		expect(to_hiragana(IN)).toEqual(TO)
	})

	test('should convert from small katakana', () => {
		const IN = 'ァィゥェォッャュョヮヵヶ'
		const TO = 'ぁぃぅぇぉっゃゅょゎゕゖ'
		expect(to_hiragana(IN)).toEqual(TO)
	})

	test('should convert from rare katakana', () => {
		const IN = 'ヴヽヾヿ𛀀ヷヸヹヺ'
		const TO = `ゔゝゞことえわ\u{3099}ゐ\u{3099}ゑ\u{3099}を\u{3099}`
		expect(to_hiragana(IN)).toEqual(TO)
	})

	test('should convert from rare small katakana', () => {
		const IN = 'ㇰㇱㇲㇳㇴㇵㇶㇷㇸㇹㇺㇻㇼㇽㇾㇿ'
		const TO = 'くしすとぬはひふへほむらりるれろ'
		expect(to_hiragana(IN)).toEqual(TO)
	})

	test('should support combining marks', () => {
		const B = '\u{3099}' // Combining Katakana-Hiragana Voiced Sound Mark
		const P = '\u{309A}' // Combining Katakana-Hiragana Semi-Voiced Sound Mark
		const IN = `ハ${B}ヒ${B}フ${B}ヘ${B}ホ${B} ハ${P}ヒ${P}フ${P}ヘ${P}ホ${P}`
		const TO = 'ばびぶべぼ　ぱぴぷぺぽ'
		expect(to_hiragana(IN)).toEqual(TO)
	})

	test('should convert from katakana', () => {
		const check = (katakana: string, expected: string) => {
			const pre = `${katakana} = `
			expect(pre + to_hiragana(katakana)).toEqual(pre + expected)
		}

		for (const it of testkana.BASIC_KANA) {
			if (it.hiragana_only) {
				continue
			}
			const expected = it.h
			const katakana = it.k
			check(katakana, expected)
		}
	})

	test('should convert from romaji', () => {
		const check = (romaji: string, expected: string) => {
			const pre = `${romaji} = `
			expect(pre + to_hiragana(romaji)).toEqual(pre + expected)
		}

		for (const it of testkana.BASIC_KANA) {
			const expected = it.h
			for (const romaji of testkana.romaji_inputs(it)) {
				check(romaji, expected)
				check(romaji.toLowerCase(), expected)
				check(romaji.toUpperCase(), expected)
			}
		}
	})

	test('should convert romaji double consonants', () => {
		const check = (romaji: string, expected: string) => {
			const pre = `${romaji} = `
			expect(pre + to_hiragana(romaji)).toEqual(pre + expected)
		}

		for (const it of testkana.DOUBLE_CONSONANTS) {
			const expected = it.h
			for (const romaji of testkana.romaji_inputs(it)) {
				check(romaji, expected)
				check(romaji.toLowerCase(), expected)
				check(romaji.toUpperCase(), expected)
			}
		}
	})

	test('should convert romaji long vowels', () => {
		const check = (romaji: string, expected: string) => {
			const pre = `${romaji} = `
			expect(pre + to_hiragana(romaji)).toEqual(pre + expected)
		}

		for (const it of testkana.LONG_VOWELS) {
			const expected = it.h
			for (const romaji of testkana.romaji_inputs(it)) {
				check(romaji, expected)
				check(romaji.toLowerCase(), expected)
				check(romaji.toUpperCase(), expected)
			}
		}
	})

	test('should convert long double vowel sequences', () => {
		// spell-checker: disable
		expect(to_hiragana('akkkkkkkkkkka')).toEqual('あっっっっっっっっっっか')
		expect(to_hiragana('akkkkkkkkkka')).toEqual('あっっっっっっっっっか')
		expect(to_hiragana('akkkkkkkkka')).toEqual('あっっっっっっっっか')
		expect(to_hiragana('akkkkkkkka')).toEqual('あっっっっっっっか')
		expect(to_hiragana('akkkkkkka')).toEqual('あっっっっっっか')
		expect(to_hiragana('akkkkkka')).toEqual('あっっっっっか')
		expect(to_hiragana('akkkkka')).toEqual('あっっっっか')
		expect(to_hiragana('akkkka')).toEqual('あっっっか')
		expect(to_hiragana('akkka')).toEqual('あっっか')
		expect(to_hiragana('akka')).toEqual('あっか')
		// spell-checker: enable
	})

	// Reverse from the romaji tests.
	test('should convert from ambiguous romaji', () => {
		// spell-checker: disable

		// nn sequences
		expect(to_hiragana(`n'na`)).toEqual('んな')
		expect(to_hiragana(`N'NA`)).toEqual('んな')

		// ny sequences
		expect(to_hiragana(`n'ya`)).toEqual('んや')
		expect(to_hiragana(`N'YA`)).toEqual('んや')

		// n + vowel sequences
		expect(to_hiragana(`n'a`)).toEqual('んあ')
		expect(to_hiragana(`n'e`)).toEqual('んえ')
		expect(to_hiragana(`n'i`)).toEqual('んい')
		expect(to_hiragana(`n'o`)).toEqual('んお')
		expect(to_hiragana(`n'u`)).toEqual('んう')

		expect(to_hiragana(`N'A`)).toEqual('んあ')
		expect(to_hiragana(`N'E`)).toEqual('んえ')
		expect(to_hiragana(`N'I`)).toEqual('んい')
		expect(to_hiragana(`N'O`)).toEqual('んお')
		expect(to_hiragana(`N'U`)).toEqual('んう')

		// spell-checker: enable
	})
})
