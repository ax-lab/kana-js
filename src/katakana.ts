import { compile, convert, m, rules } from './conversion'

const TO_KATAKANA = compile(hiragana_to_katakana())

/**
 * Converts the input text to katakana.
 *
 * This works on any mix of romaji and hiragana inputs. On romaji it will
 * convert text and punctuation.
 */
export function to_katakana(input: string) {
	return convert(input, TO_KATAKANA)
}

/**
 * RuleSet for converting hiragana to katakana.
 */
function hiragana_to_katakana() {
	return rules(
		m('ぁ', 'ァ'), // Letter Small A
		m('あ', 'ア'), // Letter A
		m('ぃ', 'ィ'), // Letter Small I
		m('い', 'イ'), // Letter I
		m('ぅ', 'ゥ'), // Letter Small U
		m('う', 'ウ'), // Letter U
		m('ぇ', 'ェ'), // Letter Small E
		m('え', 'エ'), // Letter E
		m('ぉ', 'ォ'), // Letter Small O
		m('お', 'オ'), // Letter O
		m('か', 'カ'), // Letter Ka
		m('が', 'ガ'), // Letter Ga
		m('き', 'キ'), // Letter Ki
		m('ぎ', 'ギ'), // Letter Gi
		m('く', 'ク'), // Letter Ku
		m('ぐ', 'グ'), // Letter Gu
		m('け', 'ケ'), // Letter Ke
		m('げ', 'ゲ'), // Letter Ge
		m('こ', 'コ'), // Letter Ko
		m('ご', 'ゴ'), // Letter Go
		m('さ', 'サ'), // Letter Sa
		m('ざ', 'ザ'), // Letter Za
		m('し', 'シ'), // Letter Si
		m('じ', 'ジ'), // Letter Zi
		m('す', 'ス'), // Letter Su
		m('ず', 'ズ'), // Letter Zu
		m('せ', 'セ'), // Letter Se
		m('ぜ', 'ゼ'), // Letter Ze
		m('そ', 'ソ'), // Letter So
		m('ぞ', 'ゾ'), // Letter Zo
		m('た', 'タ'), // Letter Ta
		m('だ', 'ダ'), // Letter Da
		m('ち', 'チ'), // Letter Ti
		m('ぢ', 'ヂ'), // Letter Di
		m('っ', 'ッ'), // Letter Small Tu
		m('つ', 'ツ'), // Letter Tu
		m('づ', 'ヅ'), // Letter Du
		m('て', 'テ'), // Letter Te
		m('で', 'デ'), // Letter De
		m('と', 'ト'), // Letter To
		m('ど', 'ド'), // Letter Do
		m('な', 'ナ'), // Letter Na
		m('に', 'ニ'), // Letter Ni
		m('ぬ', 'ヌ'), // Letter Nu
		m('ね', 'ネ'), // Letter Ne
		m('の', 'ノ'), // Letter No
		m('は', 'ハ'), // Letter Ha
		m('ば', 'バ'), // Letter Ba
		m('ぱ', 'パ'), // Letter Pa
		m('ひ', 'ヒ'), // Letter Hi
		m('び', 'ビ'), // Letter Bi
		m('ぴ', 'ピ'), // Letter Pi
		m('ふ', 'フ'), // Letter Hu
		m('ぶ', 'ブ'), // Letter Bu
		m('ぷ', 'プ'), // Letter Pu
		m('へ', 'ヘ'), // Letter He
		m('べ', 'ベ'), // Letter Be
		m('ぺ', 'ペ'), // Letter Pe
		m('ほ', 'ホ'), // Letter Ho
		m('ぼ', 'ボ'), // Letter Bo
		m('ぽ', 'ポ'), // Letter Po
		m('ま', 'マ'), // Letter Ma
		m('み', 'ミ'), // Letter Mi
		m('む', 'ム'), // Letter Mu
		m('め', 'メ'), // Letter Me
		m('も', 'モ'), // Letter Mo
		m('ゃ', 'ャ'), // Letter Small Ya
		m('や', 'ヤ'), // Letter Ya
		m('ゅ', 'ュ'), // Letter Small Yu
		m('ゆ', 'ユ'), // Letter Yu
		m('ょ', 'ョ'), // Letter Small Yo
		m('よ', 'ヨ'), // Letter Yo
		m('ら', 'ラ'), // Letter Ra
		m('り', 'リ'), // Letter Ri
		m('る', 'ル'), // Letter Ru
		m('れ', 'レ'), // Letter Re
		m('ろ', 'ロ'), // Letter Ro
		m('ゎ', 'ヮ'), // Letter Small Wa
		m('わ', 'ワ'), // Letter Wa
		m('ゐ', 'ヰ'), // Letter Wi
		m('ゑ', 'ヱ'), // Letter We
		m('を', 'ヲ'), // Letter Wo
		m('ん', 'ン'), // Letter N
		m('ゔ', 'ヴ'), // Letter Vu
		m('ゕ', 'ヵ'), // Letter Small Ka
		m('ゖ', 'ヶ'), // Letter Small Ke
		m('ゝ', 'ヽ'), // Iteration Mark
		m('ゞ', 'ヾ'), // Voiced Iteration Mark
		m('ゟ', 'ヨリ'), // Digraph Yori
	)
}
