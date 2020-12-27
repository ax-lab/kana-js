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
		const IN = 'ヴヽヾヿ'
		const TO = 'ゔゝゞこと'
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
})
