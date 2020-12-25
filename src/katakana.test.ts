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

	test('should convert from romaji syllables', () => {
		const INPUT = katakana_and_romaji(x)

		for (const { katakana, romaji } of INPUT) {
			const pre = `${romaji} = `
			expect(pre + to_katakana(romaji)).toEqual(pre + katakana)
			expect(pre + to_katakana(romaji.toUpperCase())).toEqual(pre + katakana)
			expect(pre + to_katakana(romaji.toLowerCase())).toEqual(pre + katakana)
		}

		function x(katakana: string, romaji: string, extra: boolean) {
			return extra ? undefined : { katakana, romaji }
		}
	})

	test('should convert romaji double consonants', () => {
		// Sample input => { input: "KaKKa", output: "カッカ" }
		const INPUT = katakana_and_romaji(x)
		for (const { input, output } of INPUT) {
			expect(to_katakana(input)).toEqual(output)
			expect(to_katakana(input.toUpperCase())).toEqual(output)
			expect(to_katakana(input.toLowerCase())).toEqual(output)
		}
		function x(katakana: string, romaji: string, extra: boolean) {
			// Ignore vowel syllables and the 'ン' (n)
			if (extra || /^([aeiou]|x|n|nn|[^a-z])/i.test(romaji)) {
				return undefined
			}
			return { input: romaji + romaji[0] + romaji, output: katakana + 'ッ' + katakana }
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
		// Sample input => {
		//     inputLong     : ["Kaa", "Kâ", "Kā"],
		//     inputNotLong  : "Ka'a",
		//     outputLong    : "カー",
		//     outputNotLong : "カア",
		// }
		const INPUT = katakana_and_romaji(x)
		for (const it of INPUT) {
			for (const inputLong of it.inputLong) {
				const pre = `${inputLong} = `
				expect(pre + to_katakana(inputLong)).toEqual(pre + it.outputLong)
				expect(pre.toLowerCase() + to_katakana(inputLong.toLowerCase())).toEqual(
					pre.toLowerCase() + it.outputLong,
				)
				expect(pre.toUpperCase() + to_katakana(inputLong.toUpperCase())).toEqual(
					pre.toUpperCase() + it.outputLong,
				)
			}

			const pre = `${it.inputNotLong} = `
			expect(pre + to_katakana(it.inputNotLong)).toEqual(pre + it.outputNotLong)
			expect(pre.toLowerCase() + to_katakana(it.inputNotLong.toLowerCase())).toEqual(
				pre.toLowerCase() + it.outputNotLong,
			)
			expect(pre.toUpperCase() + to_katakana(it.inputNotLong.toUpperCase())).toEqual(
				pre.toUpperCase() + it.outputNotLong,
			)
		}

		function x(katakana: string, romaji: string, extra: boolean) {
			if (extra || !/[aeiou]/i.test(romaji)) {
				return undefined
			}

			const TB_INPUT = 'AEIOU aeiou'
			const TB_LONG_A = 'ÂÊÎÔÛ âêîôû'
			const TB_LONG_B = 'ĀĒĪŌŪ āēīōū'
			const TB_KATAKANA = 'アエイオウ アエイオウ'

			const RE_VOWEL = /[aeiou]/gi

			const replace = (input: string, tbOutput: string) => {
				return input.replace(RE_VOWEL, (s) => {
					const index = TB_INPUT.indexOf(s)
					return tbOutput[index]
				})
			}

			return {
				inputNotLong: romaji.replace(RE_VOWEL, (s) => s + `'` + s),
				inputLong: [
					romaji.replace(RE_VOWEL, (s) => s + s),
					replace(romaji, TB_LONG_A),
					replace(romaji, TB_LONG_B),
				],
				outputLong: katakana + 'ー',
				outputNotLong: katakana + replace(romaji[romaji.length - 1], TB_KATAKANA),
			}
		}
	})
})

// Calls the given constructor function with all (KATAKANA, ROMAJI) pairs.
function katakana_and_romaji<T>(x: (katana: string, romaji: string, extra?: boolean) => T | undefined): T[] {
	const OUTPUT = [
		// Plain syllables
		x('ア', 'A'),
		x('イ', 'I'),
		x('ウ', 'U'),
		x('エ', 'E'),
		x('オ', 'O'),
		x('カ', 'Ka'),
		x('ガ', 'Ga'),
		x('キ', 'Ki'),
		x('ギ', 'Gi'),
		x('ク', 'Ku'),
		x('グ', 'Gu'),
		x('ケ', 'Ke'),
		x('ゲ', 'Ge'),
		x('コ', 'Ko'),
		x('ゴ', 'Go'),
		x('サ', 'Sa'),
		x('ザ', 'Za'),
		x('シ', 'Si'),
		x('シ', 'Shi'),
		x('ジ', 'Zi'),
		x('ジ', 'Ji'),
		x('ス', 'Su'),
		x('ズ', 'Zu'),
		x('セ', 'Se'),
		x('ゼ', 'Ze'),
		x('ソ', 'So'),
		x('ゾ', 'Zo'),
		x('タ', 'Ta'),
		x('ダ', 'Da'),
		x('チ', 'Ti'),
		x('チ', 'Chi'),
		x('ヂ', 'Di'),
		x('ヂ', 'Dji'),
		x('ヂ', 'Dzi'),
		x('ツ', 'Tsu'),
		x('ヅ', 'Du'),
		x('ヅ', 'Dzu'),
		x('テ', 'Te'),
		x('デ', 'De'),
		x('ト', 'To'),
		x('ド', 'Do'),
		x('ナ', 'Na'),
		x('ニ', 'Ni'),
		x('ヌ', 'Nu'),
		x('ネ', 'Ne'),
		x('ノ', 'No'),
		x('ハ', 'Ha'),
		x('バ', 'Ba'),
		x('パ', 'Pa'),
		x('ヒ', 'Hi'),
		x('ビ', 'Bi'),
		x('ピ', 'Pi'),
		x('フ', 'Hu'),
		x('フ', 'Fu'),
		x('ブ', 'Bu'),
		x('プ', 'Pu'),
		x('ヘ', 'He'),
		x('ベ', 'Be'),
		x('ペ', 'Pe'),
		x('ホ', 'Ho'),
		x('ボ', 'Bo'),
		x('ポ', 'Po'),
		x('マ', 'Ma'),
		x('ミ', 'Mi'),
		x('ム', 'Mu'),
		x('メ', 'Me'),
		x('モ', 'Mo'),
		x('ヤ', 'Ya'),
		x('ユ', 'Yu'),
		x('ヨ', 'Yo'),
		x('ラ', 'Ra'),
		x('リ', 'Ri'),
		x('ル', 'Ru'),
		x('レ', 'Re'),
		x('ロ', 'Ro'),
		x('ワ', 'Wa'),
		x('ヰ', 'Wi', true),
		x('ヱ', 'We', true),
		x('ヲ', 'Wo'),
		x('ン', 'N'),
		x('ヴ', 'Vu'),

		// Small and weird letters
		x('ァ', 'xA'),
		x('ィ', 'xI'),
		x('ゥ', 'xU'),
		x('ェ', 'xE'),
		x('ォ', 'xO'),
		x('ッ', 'xtsu'),
		x('ャ', 'xYa'),
		x('ュ', 'xYu'),
		x('ョ', 'xYo'),
		x('ヮ', 'xWa'),
		x('ヵ', 'xKa'),
		x('ヶ', 'xKe'),

		// Common Digraphs

		x('ン', "N'"),
		x('ン', 'Nn'),

		x('キャ', 'Kya'), // ki
		x('キュ', 'Kyu'),
		x('キェ', 'Kye'),
		x('キョ', 'Kyo'),
		x('ギャ', 'Gya'), // gi
		x('ギュ', 'Gyu'),
		x('ギェ', 'Gye'),
		x('ギョ', 'Gyo'),
		x('シャ', 'Sha'), // shi
		x('シュ', 'Shu'),
		x('シェ', 'She'),
		x('ショ', 'Sho'),
		x('ジャ', 'Ja'), // ji
		x('ジュ', 'Ju'),
		x('ジェ', 'Je'),
		x('ジョ', 'Jo'),
		x('チャ', 'Cha'), // chi
		x('チュ', 'Chu'),
		x('チェ', 'Che'),
		x('チョ', 'Cho'),
		x('ヂャ', 'Dya'), // di
		x('ヂュ', 'Dyu'),
		x('ヂェ', 'Dye'),
		x('ヂョ', 'Dyo'),
		x('ヂャ', 'Dja'), // dj
		x('ヂュ', 'Dju'),
		x('ヂェ', 'Dje'),
		x('ヂョ', 'Djo'),
		x('ニャ', 'Nya'), // ni
		x('ニュ', 'Nyu'),
		x('ニェ', 'Nye'),
		x('ニョ', 'Nyo'),
		x('ヒャ', 'Hya'), // hi
		x('ヒュ', 'Hyu'),
		x('ヒェ', 'Hye'),
		x('ヒョ', 'Hyo'),
		x('ビャ', 'Bya'), // bi
		x('ビュ', 'Byu'),
		x('ビェ', 'Bye'),
		x('ビョ', 'Byo'),
		x('ピャ', 'Pya'), // pi
		x('ピュ', 'Pyu'),
		x('ピェ', 'Pye'),
		x('ピョ', 'Pyo'),
		x('ミャ', 'Mya'), // mi
		x('ミュ', 'Myu'),
		x('ミェ', 'Mye'),
		x('ミョ', 'Myo'),
		x('リャ', 'Rya'), // ri
		x('リュ', 'Ryu'),
		x('リェ', 'Rye'),
		x('リョ', 'Ryo'),

		x('ファ', 'Fa'),
		x('フィ', 'Fi'),
		x('フ', 'Fu'),
		x('フェ', 'Fe'),
		x('フォ', 'Fo'),

		x('ヴァ', 'Va'),
		x('ヴィ', 'Vi'),
		x('ヴ', 'Vu'),
		x('ヴェ', 'Ve'),
		x('ヴォ', 'Vo'),

		x('ワ', 'Wa'),
		x('ウィ', 'Wi'),
		x('ウ', 'Wu'),
		x('ウェ', 'We'),
		x('ヲ', 'Wo'),

		x('ドゥ', 'Du', true),
		x('ティ', 'Ti', true),
		x('ディ', 'Di', true),

		// Obsolete
		x('ヰ', 'xWi'),
		x('ヱ', 'xWe'),

		x('ヷ', 'xVa'),
		x('ヸ', 'xVi'),
		x('ヹ', 'xVe'),
		x('ヺ', 'xVo'),

		// Katakana symbols
		x('・', '/'),
		x('ー', '-'),

		// Extra IME
		x('カ', 'ca'),
		x('シ', 'ci'),
		x('セ', 'ce'),
		x('コ', 'co'),
		x('ク', 'cu'),
	]
	return OUTPUT.filter((x) => !!x)
}
