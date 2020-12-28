import { to_romaji } from './romaji'
import * as testkana from './testkana'
import { describe, expect, test } from './testutil'

describe('to_hiragana', () => {
	test('should accept empty string', () => {
		expect(to_romaji('')).toEqual('')
	})

	// spell-checker: ignore kakikukeko gagigugego sashisuseso zajizuzezo tachitsuteto dadidudedo naninuneno
	// spell-checker: ignore hahifuheho babibubebo papipupepo mamimumemo yayuyo rarirurero wawewiwon wakake
	// spell-checker: ignore vuvubu

	test('should convert from common hiragana', () => {
		const IN =
			'あいうえお かきくけこ がぎぐげご さしすせそ ざじずぜぞ たちつてと だぢづでど なにぬねの はひふへほ ばびぶべぼ ぱぴぷぺぽ まみむめも やゆよ らりるれろ わゐゑをん'
		const TO =
			'aiueo　kakikukeko gagigugego sashisuseso zajizuzezo tachitsuteto dadidudedo naninuneno hahifuheho babibubebo papipupepo mamimumemo yayuyo rarirurero wawewiwon'
		expect(to_romaji(IN)).toEqual(TO)
	})

	test('should convert from common katakana', () => {
		const IN =
			'アイウエオ カキクケコ ガギグゲゴ サシスセソ ザジズゼゾ タチツテト ダヂヅデド ナニヌネノ ハヒフヘホ バビブベボ パピプペポ マミムメモ ヤユヨ ラリルレロ ワヰヱヲン'
		const TO =
			'AIUEO　KAKIKUKEKO GAGIGUGEGO SASHISUSESO ZAJIZUZEZO TACHITSUTETO DADIDUDEDO NANINUNENO HAHIFUHEHO BABIBUBEBO PAPIPUPEPO MAMIMUMEMO YAYUYO RARIRURERO WAWEWIWON'
		expect(to_romaji(IN)).toEqual(TO)
	})

	test('should convert from isolated small kana', () => {
		const IN = 'ァィゥェォ ッ ャュョ ヮヵヶ ぁぃぅぇぉ っ ゃゅょ ゎゕゖ'
		const TO = 'AIUEO TSU YAYUYO WAKAKE aiueo tsu yayuyo wakake'
		expect(to_romaji(IN)).toEqual(TO)
	})

	test('should convert from rare kana', () => {
		const IN = 'ゔゝゞ ゟ ヴヽヾ ヿ'
		const TO = 'vuvubu yori VUVUBU KOTO'
		expect(to_romaji(IN)).toEqual(TO)
	})

	test('should support combining marks', () => {
		const B = '\u{3099}' // Combining Katakana-Hiragana Voiced Sound Mark
		const P = '\u{309A}' // Combining Katakana-Hiragana Semi-Voiced Sound Mark
		const IN_A = `は${B} ひ${B} ふ${B} へ${B} ほ${B} は${P} ひ${P} ふ${P} へ${P} ほ${P}`
		const IN_B = `ハ${B} ヒ${B} フ${B} ヘ${B} ホ${B} ハ${P} ヒ${P} フ${P} ヘ${P} ホ${P}`
		const TO = 'ba bi bu be bo pa pi pu pe po'
		expect(to_romaji(`${IN_A} ${IN_B}`)).toEqual(`${TO} ${TO.toUpperCase()}`)
	})

	test('should convert from hiragana', () => {
		const check = (hiragana: string, expected: string) => {
			const pre = `${hiragana} = `
			expect(pre + to_romaji(hiragana)).toEqual(pre + expected)
		}

		for (const it of testkana.BASIC_KANA) {
			if (it.from_romaji) {
				continue
			}
			const expected = it.r.toLowerCase()
			const hiragana = it.h
			check(hiragana, expected)
		}
	})

	test('should convert from katakana', () => {
		const check = (katakana: string, expected: string) => {
			const pre = `${katakana} = `
			expect(pre + to_romaji(katakana)).toEqual(pre + expected)
		}

		for (const it of testkana.BASIC_KANA) {
			if (it.from_romaji) {
				continue
			}
			const expected = it.r.toUpperCase()
			const katakana = it.k
			check(katakana, expected)
		}
	})

	test('should convert to double consonants', () => {
		const check = (kana: string, expected: string) => {
			const pre = `${kana} = `
			expect(pre + to_romaji(kana)).toEqual(pre + expected)
		}

		const check_all = (hiragana: string, katakana: string, expected: string) => {
			check(hiragana, expected.toLowerCase())
			check(katakana, expected.toUpperCase())
		}

		for (const it of testkana.DOUBLE_CONSONANTS) {
			const expected = it.r.toLowerCase()
			const hiragana = it.h
			const katakana = it.k
			check_all(hiragana, katakana, expected)
		}
	})

	test('should convert to long vowels', () => {
		const check = (kana: string, expected: string) => {
			const pre = `${kana} = `
			expect(pre + to_romaji(kana)).toEqual(pre + expected)
		}

		const check_all = (hiragana: string, katakana: string, expected: string) => {
			check(hiragana, expected.toLowerCase())
			check(katakana, expected.toUpperCase())
		}

		for (const it of testkana.LONG_VOWELS) {
			const expected = it.r
			const hiragana = it.h
			const katakana = it.k
			check_all(hiragana, katakana, expected)
		}
	})
})
