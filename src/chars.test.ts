import { describe, expect, test } from '@jest/globals'

import * as chars from './chars'

describe('chars', () => {
	describe('chars.nextChar', () => {
		test('should return first character in a string', () => {
			expect(chars.nextChar('abc')).toEqual('a')
		})

		test('should return empty for empty string', () => {
			expect(chars.nextChar('')).toEqual('')
		})

		test('should support UTF-16 surrogate pairs', () => {
			expect(chars.nextChar('\u{24B62}!')).toEqual('𤭢')
			expect(chars.nextChar('𤭢!')).toEqual('𤭢')

			expect(chars.nextChar('\u{1F600}!')).toEqual('😀')
			expect(chars.nextChar('😀!')).toEqual('😀')
		})

		test('should handle line breaks', () => {
			expect(chars.nextChar('\r\r')).toEqual('\r')
			expect(chars.nextChar('\n\n')).toEqual('\n')
			expect(chars.nextChar('\r\n')).toEqual('\r')
		})

		test('should handle combining marks', () => {
			expect(chars.nextChar('c\u{0327}').normalize()).toEqual('ç')
			expect(chars.nextChar('c\u{0327}\u{0304}').normalize()).toEqual('ç̄'.normalize())

			expect(chars.nextChar('は\u{3099}').normalize()).toEqual('ば')
			expect(chars.nextChar('は\u{309A}').normalize()).toEqual('ぱ')
			expect(chars.nextChar('ゝ\u{3099}').normalize()).toEqual('ゞ')
			expect(chars.nextChar('ヽ\u{3099}').normalize()).toEqual('ヾ')

			expect(chars.nextChar('ワ\u{3099}').normalize()).toEqual('ヷ')
			expect(chars.nextChar('ヰ\u{3099}').normalize()).toEqual('ヸ')
			expect(chars.nextChar('ヱ\u{3099}').normalize()).toEqual('ヹ')
			expect(chars.nextChar('ヲ\u{3099}').normalize()).toEqual('ヺ')

			expect(chars.nextChar('わ\u{3099}')).toEqual('わ゙')
			expect(chars.nextChar('ゐ\u{3099}')).toEqual('ゐ゙')
			expect(chars.nextChar('ゑ\u{3099}')).toEqual('ゑ゙')
			expect(chars.nextChar('を\u{3099}')).toEqual('を゙')
		})

		test('should always return a string prefix', () => {
			const check = (input: string) => {
				const output = chars.nextChar(input)
				expect(output).toBeTruthy()
				expect(output.length).toBeLessThanOrEqual(input.length)
				expect(output).toStrictEqual(input.slice(0, output.length))
			}
			check('a')
			check('abc')
			check('\u{24B62}!')
			check('𤭢!')
			check('\u{1F600}!')
			check('😀')
			check('😀!')
			check('c\u{0327}')
			check('c\u{0327}\u{0304}')
			check('は\u{3099}')
			check('は\u{309A}')
			check('ゝ\u{3099}')
			check('ヽ\u{3099}')
			check('ワ\u{3099}')
			check('ヰ\u{3099}')
			check('ヱ\u{3099}')
			check('ヲ\u{3099}')
			check('わ\u{3099}')
			check('ゐ\u{3099}')
			check('ゑ\u{3099}')
			check('を\u{3099}')
		})
	})

	describe('chars.removeAccents', () => {
		test('should strip combining diacritics from A-Z characters', () => {
			// Test text, courtesy of https://onlineunicodetools.com/add-combining-characters
			//
			// (space for rendering)
			const WEIRD = ['c̥͛ḁ͛r̥͛p̥͛e̥͛ d̥͛i̥͛e̥͛m̥͛', 'l̡̟̖̟᷿̣̖̮͊̎᷄̈̉̍ͯ︡͜ơ͖̺͖͖̭̘̝̟̈̿ͫ͌̏͘͟͠v̧̨̡̦᷿᷂̣͕̐᷇ͣ︠᷇̏͜͝͡ȅ̫͉̺̖̙͕̯͒̃᷆ͨ᷅͘͢ͅ', 's̶t̶r̶o̶k̶e̶d̶ t̶e̶x̶t̶']

			expect(chars.removeAccents(WEIRD[0])).toEqual('carpe diem')
			expect(chars.removeAccents(WEIRD[1])).toEqual('love')
			expect(chars.removeAccents(WEIRD[2])).toEqual('stroked text')
		})

		test('should preserve romaji long vowels', () => {
			const INPUT_A = 'āīūēō'.normalize('NFD')
			const INPUT_B = 'ĀĪŪĒŌ'.normalize('NFD')
			const INPUT_C = 'āb̄c̄d̄ēf̄ḡh̄īj̄k̄l̄m̄n̄ōp̄q̄r̄s̄t̄ūv̄w̄x̄ȳz̄'.normalize('NFD')
			const INPUT_D = 'ĀB̄C̄D̄ĒF̄ḠH̄ĪJ̄K̄L̄M̄N̄ŌP̄Q̄R̄S̄T̄ŪV̄W̄X̄ȲZ̄'.normalize('NFD')

			const OUTPUT_A = 'āīūēō'.normalize('NFC')
			const OUTPUT_B = 'ĀĪŪĒŌ'.normalize('NFC')
			const OUTPUT_C = 'ābcdēfghījklmnōpqrstūvwxyz'.normalize('NFC')
			const OUTPUT_D = 'ĀBCDĒFGHĪJKLMNŌPQRSTŪVWXYZ'.normalize('NFC')

			expect(chars.removeAccents(INPUT_A)).toEqual(OUTPUT_A)
			expect(chars.removeAccents(INPUT_A, true)).toEqual(OUTPUT_A)
			expect(chars.removeAccents(INPUT_A, false)).toEqual(OUTPUT_A)

			expect(chars.removeAccents(INPUT_B)).toEqual(OUTPUT_B)
			expect(chars.removeAccents(INPUT_B, true)).toEqual(OUTPUT_B)
			expect(chars.removeAccents(INPUT_B, false)).toEqual(OUTPUT_B)

			expect(chars.removeAccents(INPUT_C)).toEqual(OUTPUT_C)
			expect(chars.removeAccents(INPUT_C, true)).toEqual(OUTPUT_C)
			expect(chars.removeAccents(INPUT_C, false)).toEqual(OUTPUT_C)

			expect(chars.removeAccents(INPUT_D)).toEqual(OUTPUT_D)
			expect(chars.removeAccents(INPUT_D, true)).toEqual(OUTPUT_D)
			expect(chars.removeAccents(INPUT_D, false)).toEqual(OUTPUT_D)
		})

		test('should remove invalid voiced sound marks', () => {
			const baseInput = '_(a_ あ_ _ は_ [_])_'

			const inputA = baseInput.replace(/_/g, '\u{3099}')
			const inputB = baseInput.replace(/_/g, '\u{309A}')
			const inputC = baseInput.replace(/_/g, '\u{3099}\u{309A}\u{309A}')
			const outputA = '(a あ  ば [])'.normalize('NFC')
			const outputB = '(a あ  ぱ [])'.normalize('NFC')
			const outputC = outputA

			expect(chars.removeAccents(inputA)).toEqual(outputA)
			expect(chars.removeAccents(inputA, true)).toEqual(outputA)
			expect(chars.removeAccents(inputA, false)).toEqual(outputA)

			expect(chars.removeAccents(inputB)).toEqual(outputB)
			expect(chars.removeAccents(inputB, true)).toEqual(outputB)
			expect(chars.removeAccents(inputB, false)).toEqual(outputB)

			expect(chars.removeAccents(inputC)).toEqual(outputC)
			expect(chars.removeAccents(inputC, true)).toEqual(outputC)
			expect(chars.removeAccents(inputC, false)).toEqual(outputC)
		})

		test('should preserve valid voiced sound marks', () => {
			const H1 =
				'あ゙い゙ゔえ゙お゙がぎぐげござじずぜぞだぢづでどな゙に゙ぬ゙ね゙の゙ばびぶべぼま゙み゙む゙め゙も゙や゙ゆ゙よ゙ら゙り゙る゙れ゙ろ゙わ゙ゐ゙ゑ゙を゙ん゙ゞ'
			const H2 =
				'あ゚い゚う゚え゚お゚か゚き゚く゚け゚こ゚さ゚し゚す゚せ゚そ゚た゚ち゚つ゚て゚と゚な゚に゚ぬ゚ね゚の゚ぱぴぷぺぽま゚み゚む゚め゚も゚や゚ゆ゚よ゚ら゚り゚る゚れ゚ろ゚わ゚ゐ゚ゑ゚を゚ん゚ゝ゚'
			const K1 =
				'ア゙イ゙ヴエ゙オ゙ガギグゲゴザジズゼゾダヂヅデドナ゙ニ゙ヌ゙ネ゙ノ゙バビブベボマ゙ミ゙ム゙メ゙モ゙ヤ゙ユ゙ヨ゙ラ゙リ゙ル゙レ゙ロ゙ヮ゙ヷヸヹヺン゙ヾ'
			const K2 =
				'ア゚イ゚ウ゚エ゚オ゚カ゚キ゚ク゚ケ゚コ゚サ゚シ゚ス゚セ゚ソ゚タ゚チ゚ツ゚テ゚ト゚ナ゚ニ゚ヌ゚ネ゚ノ゚パピプペポマ゚ミ゚ム゚メ゚モ゚ヤ゚ユ゚ヨ゚ラ゚リ゚ル゚レ゚ロ゚ヮ゚ワ゚ヰ゚ヱ゚ヲ゚ン゚ヽ゚'
			const K3 =
				'ｦ゙ｧ゙ｨ゙ｩ゙ｪ゙ｫ゙ｬ゙ｭ゙ｮ゙ｯ゙ｱ゙ｲ゙ｳ゙ｴ゙ｵ゙ｶ゙ｷ゙ｸ゙ｹ゙ｺ゙ｻ゙ｼ゙ｽ゙ｾ゙ｿ゙ﾀ゙ﾁ゙ﾂ゙ﾃ゙ﾄ゙ﾅ゙ﾆ゙ﾇ゙ﾈ゙ﾉ゙ﾊ゙ﾋ゙ﾌ゙ﾍ゙ﾎ゙ﾏ゙ﾐ゙ﾑ゙ﾒ゙ﾓ゙ﾔ゙ﾕ゙ﾖ゙ﾗ゙ﾘ゙ﾙ゙ﾚ゙ﾛ゙ﾜ゙ﾝ゙'
			const K4 =
				'ｦ゚ｧ゚ｨ゚ｩ゚ｪ゚ｫ゚ｬ゚ｭ゚ｮ゚ｯ゚ｱ゚ｲ゚ｳ゚ｴ゚ｵ゚ｶ゚ｷ゚ｸ゚ｹ゚ｺ゚ｻ゚ｼ゚ｽ゚ｾ゚ｿ゚ﾀ゚ﾁ゚ﾂ゚ﾃ゚ﾄ゚ﾅ゚ﾆ゚ﾇ゚ﾈ゚ﾉ゚ﾊ゚ﾋ゚ﾌ゚ﾍ゚ﾎ゚ﾏ゚ﾐ゚ﾑ゚ﾒ゚ﾓ゚ﾔ゚ﾕ゚ﾖ゚ﾗ゚ﾘ゚ﾙ゚ﾚ゚ﾛ゚ﾜ゚ﾝ゚'
			const K5 =
				'ヵ゙ヶ゙ヷ゙ヸ゙ヹ゙ヺ゙ヿ゙𛀀゙ㇰ゙ㇱ゙ㇲ゙ㇳ゙ㇴ゙ㇵ゙ㇶ゙ㇷ゙ㇸ゙ㇹ゙ㇺ゙ㇻ゙ㇼ゙ㇽ゙ㇾ゙ㇿ゙'
			const K6 =
				'ヵ゚ヶ゚ヷ゚ヸ゚ヹ゚ヺ゚ヿ゚𛀀゚ㇰ゚ㇱ゚ㇲ゚ㇳ゚ㇴ゚ㇵ゚ㇶ゚ㇷ゚ㇸ゚ㇹ゚ㇺ゚ㇻ゚ㇼ゚ㇽ゚ㇾ゚ㇿ゚'

			const HA =
				'あいゔえおがぎぐげござじずぜぞだぢづでどなにぬねのばびぶべぼまみむめもやゆよらりるれろわ゙ゐ゙ゑ゙を゙んゞ'

			const HB =
				'あいうえおかきくけこさしすせそたちつてとなにぬねのぱぴぷぺぽまみむめもやゆよらりるれろわゐゑをんゝ'

			const KA =
				'アイヴエオガギグゲゴザジズゼゾダヂヅデドナニヌネノバビブベボマミムメモヤユヨラリルレロヮヷヸヹヺンヾ'

			const KB =
				'アイウエオカキクケコサシスセソタチツテトナニヌネノパピプペポマミムメモヤユヨラリルレロヮワヰヱヲンヽ'

			const KC =
				'ｦｧｨｩｪｫｬｭｮｯｱｲｳ゙ｴｵｶ゙ｷ゙ｸ゙ｹ゙ｺ゙ｻ゙ｼ゙ｽ゙ｾ゙ｿ゙ﾀ゙ﾁ゙ﾂ゙ﾃ゙ﾄ゙ﾅﾆﾇﾈﾉﾊ゙ﾋ゙ﾌ゙ﾍ゙ﾎ゙ﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜ゙ﾝ'
			const KD = 'ｦｧｨｩｪｫｬｭｮｯｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊ゚ﾋ゚ﾌ゚ﾍ゚ﾎ゚ﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ'
			const KE = 'ヵヶヷヸヹヺヿ𛀀ㇰㇱㇲㇳㇴㇵㇶㇷㇸㇹㇺㇻㇼㇽㇾㇿ'
			const KF = 'ヵヶヷヸヹヺヿ𛀀ㇰㇱㇲㇳㇴㇵㇶㇷㇸㇹㇺㇻㇼㇽㇾㇿ'

			const TESTS = [
				{ a: H1, b: HA },
				{ a: H2, b: HB },
				{ a: K1, b: KA },
				{ a: K2, b: KB },
				{ a: K3, b: KC },
				{ a: K4, b: KD },
				{ a: K5, b: KE },
				{ a: K6, b: KF },
			]

			for (const it of TESTS) {
				const input = it.a.normalize('NFD')
				const output = it.b.normalize('NFC')
				expect(chars.removeAccents(input)).toEqual(output)
				expect(chars.removeAccents(input, true)).toEqual(output)
				expect(chars.removeAccents(input, false)).toEqual(output)
			}
		})

		test('should strip diacritics if stripAnyLanguage is true', () => {
			const input = '𝘤̥͛𝘢̥͛𝘳̥͛𝘱̥͛𝘦̥͛ 𝘥̥͛𝘪̥͛𝘦̥͛𝘮̥͛'.normalize('NFD')
			const output = '𝘤𝘢𝘳𝘱𝘦 𝘥𝘪𝘦𝘮'.normalize('NFC')
			expect(chars.removeAccents(input)).toEqual(input.normalize('NFC'))
			expect(chars.removeAccents(input, false)).toEqual(input.normalize('NFC'))
			expect(chars.removeAccents(input, true)).toEqual(output)
		})
	})
})
