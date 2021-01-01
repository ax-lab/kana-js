import { to_romaji } from './romaji'
import * as testkana from './testkana'
import { describe, expect, test } from './testutil'

describe('to_romaji', () => {
	test('should accept empty string', () => {
		expect(to_romaji('')).toEqual('')
	})

	// spell-checker: ignore kakikukeko gagigugego sashisuseso zajizuzezo tachitsuteto dadidudedo naninuneno
	// spell-checker: ignore hahifuheho babibubebo papipupepo mamimumemo yayuyo rarirurero wawiwewon wakake
	// spell-checker: ignore hahabahaba yoririri kototodotodo masusuzusuzu

	test('should convert from common hiragana', () => {
		const IN =
			'あいうえお　かきくけこ　がぎぐげご　さしすせそ　ざじずぜぞ　たちつてと　だぢづでど　なにぬねの　はひふへほ　ばびぶべぼ　ぱぴぷぺぽ　まみむめも　やゆよ　らりるれろ　わゐゑをん'
		const TO =
			'aiueo kakikukeko gagigugego sashisuseso zajizuzezo tachitsuteto dadidudedo naninuneno hahifuheho babibubebo papipupepo mamimumemo yayuyo rarirurero wawiwewon'
		expect(to_romaji(IN)).toEqual(TO)
	})

	test('should convert from common katakana', () => {
		const IN =
			'アイウエオ　カキクケコ　ガギグゲゴ　サシスセソ　ザジズゼゾ　タチツテト　ダヂヅデド　ナニヌネノ　ハヒフヘホ　バビブベボ　パピプペポ　マミムメモ　ヤユヨ　ラリルレロ　ワヰヱヲン'
		const TO =
			'AIUEO KAKIKUKEKO GAGIGUGEGO SASHISUSESO ZAJIZUZEZO TACHITSUTETO DADIDUDEDO NANINUNENO HAHIFUHEHO BABIBUBEBO PAPIPUPEPO MAMIMUMEMO YAYUYO RARIRURERO WAWIWEWON'
		expect(to_romaji(IN)).toEqual(TO)
	})

	test('should convert from isolated small kana', () => {
		const IN = 'ァィゥェォ ッ ャュョ ヮヵヶ ぁぃぅぇぉ っ ゃゅょ ゎゕゖ'
		const TO = 'AIUEO ~TSU YAYUYO WAKAKE aiueo ~tsu yayuyo wakake'
		expect(to_romaji(IN)).toEqual(TO)
	})

	test('should convert from rare kana', () => {
		const IN = 'ゔ ゟ 〼 ヴ ヿ 𛀀 ヷ ヸ ヹ ヺ わ\u{3099} ゐ\u{3099} ゑ\u{3099} を\u{3099}'
		const TO = 'vu yori masu VU KOTO E VA VI VE VO va vi ve vo'
		expect(to_romaji(IN)).toEqual(TO)
	})

	test('should support iteration marks', () => {
		const IN_A = 'はゝゞゝゞ ゟゝゞ あゝゞ　アゝゞ ハゝゞゝゞ ヿゝゞゝゞ 〼ゝゞゝゞ Xゝゞヽヾ'
		const IN_B = 'はヽヾヽヾ ゟヽヾ あヽヾ　アヽヾ ハヽヾヽヾ ヿヽヾヽヾ 〼ヽヾヽヾ Xゝゞヽヾ'
		const TO = 'hahabahaba yoririri aaa AAA HAHABAHABA KOTOTODOTODO masusuzusuzu Xゝゞヽヾ'
		expect(to_romaji(IN_A)).toEqual(TO)
		expect(to_romaji(IN_B)).toEqual(TO)
	})

	test('should convert from rare small katakana', () => {
		const IN = 'ㇰ ㇱ ㇲ ㇳ ㇴ ㇵ ㇶ ㇷ ㇸ ㇹ ㇺ ㇻ ㇼ ㇽ ㇾ ㇿ'
		const TO = 'KU SHI SU TO NU HA HI FU HE HO MU RA RI RU RE RO'
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
			if (it.from_romaji || !it.r) {
				continue
			}
			const expected = /[Ａ-Ｚａ-ｚ]/.test(it.h) ? it.r : it.r.toLowerCase()
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
			if (it.from_romaji || !it.r) {
				continue
			}
			const expected = /[Ａ-Ｚａ-ｚ]/.test(it.k) ? it.r : it.r.toUpperCase()
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
			if (it.from_romaji) {
				continue
			}
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
			if (it.from_romaji) {
				continue
			}
			const expected = it.r
			const hiragana = it.h
			const katakana = it.k
			check_all(hiragana, katakana, expected)
		}
	})

	test('should convert long double vowel sequences', () => {
		// spell-checker: disable
		expect(to_romaji('あっっっっっっっっっっか')).toEqual('akkkkkkkkkkka')
		expect(to_romaji('アッッッッッッッッッッカ')).toEqual('AKKKKKKKKKKKA')
		expect(to_romaji('あっっっっっっっっっか')).toEqual('akkkkkkkkkka')
		expect(to_romaji('アッッッッッッッッッカ')).toEqual('AKKKKKKKKKKA')
		expect(to_romaji('あっっっっっっっっか')).toEqual('akkkkkkkkka')
		expect(to_romaji('アッッッッッッッッカ')).toEqual('AKKKKKKKKKA')
		expect(to_romaji('あっっっっっっっか')).toEqual('akkkkkkkka')
		expect(to_romaji('アッッッッッッッカ')).toEqual('AKKKKKKKKA')
		expect(to_romaji('あっっっっっっか')).toEqual('akkkkkkka')
		expect(to_romaji('アッッッッッッカ')).toEqual('AKKKKKKKA')
		expect(to_romaji('あっっっっっか')).toEqual('akkkkkka')
		expect(to_romaji('アッッッッッカ')).toEqual('AKKKKKKA')
		expect(to_romaji('あっっっっか')).toEqual('akkkkka')
		expect(to_romaji('アッッッッカ')).toEqual('AKKKKKA')
		expect(to_romaji('あっっっか')).toEqual('akkkka')
		expect(to_romaji('アッッッカ')).toEqual('AKKKKA')
		expect(to_romaji('あっっか')).toEqual('akkka')
		expect(to_romaji('アッッカ')).toEqual('AKKKA')
		expect(to_romaji('あっか')).toEqual('akka')
		expect(to_romaji('アッカ')).toEqual('AKKA')

		// Test the interaction between tsu and iteration marks (due to the way
		// both are implemented, they can interact).
		expect(to_romaji('アッカゝゞ')).toEqual('AKKAKAGA')

		// spell-checker: enable
	})

	test('should convert suffix small tsu', () => {
		// spell-checker: disable
		expect(to_romaji('あっっっっっっっっっっ')).toEqual('a~~~~~~~~~~')
		expect(to_romaji('アッッッッッッッッッッ')).toEqual('A~~~~~~~~~~')

		expect(to_romaji('っっっっっっっっっっっ')).toEqual('~tsu~~~~~~~~~~')
		expect(to_romaji('ッッッッッッッッッッッ')).toEqual('~TSU~~~~~~~~~~')

		expect(to_romaji(' っっっっっっっっっっっ')).toEqual(' ~tsu~~~~~~~~~~')
		expect(to_romaji(' ッッッッッッッッッッッ')).toEqual(' ~TSU~~~~~~~~~~')

		expect(to_romaji('!っっっっっっっっっっっ')).toEqual('!~tsu~~~~~~~~~~')
		expect(to_romaji('!ッッッッッッッッッッッ')).toEqual('!~TSU~~~~~~~~~~')
		// spell-checker: enable
	})

	test('should generate apostrophe for ambiguous romaji', () => {
		// spell-checker: disable

		expect(to_romaji('なんな')).toEqual(`nan'na`)
		expect(to_romaji('ナンナ')).toEqual(`NAN'NA`)

		// But make sure actual double consonants are not affected
		expect(to_romaji('なっな')).toEqual(`nanna`)
		expect(to_romaji('ナッナ')).toEqual(`NANNA`)

		// spell-checker: enable
	})
})
