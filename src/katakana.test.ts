import { to_katakana } from './katakana'
import * as testkana from './testkana'
import { describe, expect, test } from './testutil'

describe('to_katakana', () => {
	test('should accept empty string', () => {
		expect(to_katakana('')).toEqual('')
	})

	test('should convert from common hiragana', () => {
		const IN =
			'あいうえお かきくけこ がぎぐげご さしすせそ ざじずぜぞ たちつてと だぢづでど なにぬねの はひふへほ ばびぶべぼ ぱぴぷぺぽ まみむめも やゆよ らりるれろ わゐゑをん'
		const TO =
			'アイウエオ　カキクケコ　ガギグゲゴ　サシスセソ　ザジズゼゾ　タチツテト　ダヂヅデド　ナニヌネノ　ハヒフヘホ　バビブベボ　パピプペポ　マミムメモ　ヤユヨ　ラリルレロ　ワヰヱヲン'
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
		const TO = 'バビブベボ　パピプペポ'
		expect(to_katakana(IN)).toEqual(TO)
	})

	test('should convert from hiragana', () => {
		const check = (hiragana: string, expected: string) => {
			const pre = `${hiragana} = `
			expect(pre + to_katakana(hiragana)).toEqual(pre + expected)
		}

		for (const it of testkana.BASIC_KANA) {
			if (it.katakana_only) {
				continue
			}
			const expected = it.k
			const hiragana = it.h
			check(hiragana, expected)
		}
	})

	test('should convert from romaji', () => {
		const check = (romaji: string, expected: string) => {
			const pre = `${romaji} = `
			expect(pre + to_katakana(romaji)).toEqual(pre + expected)
		}

		for (const it of testkana.BASIC_KANA) {
			const expected = it.k
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
			expect(pre + to_katakana(romaji)).toEqual(pre + expected)
		}

		for (const it of testkana.DOUBLE_CONSONANTS) {
			const expected = it.k
			for (const romaji of testkana.romaji_inputs(it)) {
				check(romaji, expected)
				check(romaji.toLowerCase(), expected)
				check(romaji.toUpperCase(), expected)
			}
		}
	})

	test('should convert romaji really long vowels', () => {
		expect(to_katakana('a')).toEqual('ア')
		expect(to_katakana('aa')).toEqual('アー')
		expect(to_katakana('aaa')).toEqual('アアー')
		expect(to_katakana('aaaa')).toEqual('アアアー')

		expect(to_katakana('AAAA')).toEqual('アアアー')
		expect(to_katakana('AaAa')).toEqual('アアアー')
		expect(to_katakana('aAaA')).toEqual('アアアー')

		expect(to_katakana('i')).toEqual('イ')
		expect(to_katakana('ii')).toEqual('イー')
		expect(to_katakana('iii')).toEqual('イイー')
		expect(to_katakana('iiii')).toEqual('イイイー')

		expect(to_katakana('u')).toEqual('ウ')
		expect(to_katakana('uu')).toEqual('ウー')
		expect(to_katakana('uuu')).toEqual('ウウー')
		expect(to_katakana('uuuu')).toEqual('ウウウー')

		expect(to_katakana('e')).toEqual('エ')
		expect(to_katakana('ee')).toEqual('エー')
		expect(to_katakana('eee')).toEqual('エエー')
		expect(to_katakana('eeee')).toEqual('エエエー')

		expect(to_katakana('o')).toEqual('オ')
		expect(to_katakana('oo')).toEqual('オー')
		expect(to_katakana('ooo')).toEqual('オオー')
		expect(to_katakana('oooo')).toEqual('オオオー')
	})

	test('should convert romaji long vowels', () => {
		const check = (romaji: string, expected: string) => {
			const pre = `${romaji} = `
			expect(pre + to_katakana(romaji)).toEqual(pre + expected)
		}

		for (const it of testkana.LONG_VOWELS) {
			const expected = it.k
			for (const romaji of testkana.romaji_inputs(it)) {
				check(romaji, expected)
				check(romaji.toLowerCase(), expected)
				check(romaji.toUpperCase(), expected)
			}
		}
	})
})
