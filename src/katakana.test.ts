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

	test('should convert manual cases', () => {
		// spell-checker: disable

		const check = (input: string, expected: string) => {
			const pre = `${input} = `
			expect(pre + to_katakana(input)).toEqual(pre + expected)
		}

		check('quaqqua', 'クァックァ')

		// spell-checker: enable
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

	test('should convert long double vowel sequences', () => {
		// spell-checker: disable
		expect(to_katakana('akkkkkkkkkkka')).toEqual('アッッッッッッッッッッカ')
		expect(to_katakana('akkkkkkkkkka')).toEqual('アッッッッッッッッッカ')
		expect(to_katakana('akkkkkkkkka')).toEqual('アッッッッッッッッカ')
		expect(to_katakana('akkkkkkkka')).toEqual('アッッッッッッッカ')
		expect(to_katakana('akkkkkkka')).toEqual('アッッッッッッカ')
		expect(to_katakana('akkkkkka')).toEqual('アッッッッッカ')
		expect(to_katakana('akkkkka')).toEqual('アッッッッカ')
		expect(to_katakana('akkkka')).toEqual('アッッッカ')
		expect(to_katakana('akkka')).toEqual('アッッカ')
		expect(to_katakana('akka')).toEqual('アッカ')
		// spell-checker: enable
	})

	// Reverse from the romaji tests.
	test('should convert from ambiguous romaji', () => {
		// spell-checker: disable

		// nn sequences
		expect(to_katakana(`n'na`)).toEqual('ンナ')
		expect(to_katakana(`N'NA`)).toEqual('ンナ')

		// ny sequences
		expect(to_katakana(`n'ya`)).toEqual('ンヤ')
		expect(to_katakana(`N'YA`)).toEqual('ンヤ')

		// n + vowel sequences
		expect(to_katakana(`n'a`)).toEqual('ンア')
		expect(to_katakana(`n'e`)).toEqual('ンエ')
		expect(to_katakana(`n'i`)).toEqual('ンイ')
		expect(to_katakana(`n'o`)).toEqual('ンオ')
		expect(to_katakana(`n'u`)).toEqual('ンウ')

		expect(to_katakana(`N'A`)).toEqual('ンア')
		expect(to_katakana(`N'E`)).toEqual('ンエ')
		expect(to_katakana(`N'I`)).toEqual('ンイ')
		expect(to_katakana(`N'O`)).toEqual('ンオ')
		expect(to_katakana(`N'U`)).toEqual('ンウ')

		// spell-checker: enable
	})
})
