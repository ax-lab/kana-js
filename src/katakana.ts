import { compile, convert, m, rules } from './conversion'

const TO_KATAKANA = compile(rules(set_hiragana_to_katakana(), set_romaji_to_katakana(), set_romaji_to_katakana_ime()))

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
function set_hiragana_to_katakana() {
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

/**
 * RuleSet for converting romaji to katakana.
 */
function set_romaji_to_katakana() {
	return rules(subset_romaji_to_katakana_basics())
}

function subset_romaji_to_katakana_basics() {
	return rules(
		m('a', 'ア'),
		m('i', 'イ'),
		m('u', 'ウ'),
		m('e', 'エ'),
		m('o', 'オ'),

		m('n', 'ン'),
		m("n'", 'ン'),

		m('ka', 'カ'),
		m('ki', 'キ'),
		m('ku', 'ク'),
		m('ke', 'ケ'),
		m('ko', 'コ'),
		m('ga', 'ガ'),
		m('gi', 'ギ'),
		m('gu', 'グ'),
		m('ge', 'ゲ'),
		m('go', 'ゴ'),

		m('kya', 'キャ'),
		m('kyu', 'キュ'),
		m('kye', 'キェ'),
		m('kyo', 'キョ'),

		m('gya', 'ギャ'),
		m('gyu', 'ギュ'),
		m('gye', 'ギェ'),
		m('gyo', 'ギョ'),

		m('sa', 'サ'),
		m('si', 'シ'),
		m('shi', 'シ'),
		m('su', 'ス'),
		m('se', 'セ'),
		m('so', 'ソ'),
		m('za', 'ザ'),
		m('zi', 'ジ'),
		m('ji', 'ジ'),
		m('zu', 'ズ'),
		m('ze', 'ゼ'),
		m('zo', 'ゾ'),

		m('sha', 'シャ'),
		m('shu', 'シュ'),
		m('she', 'シェ'),
		m('sho', 'ショ'),

		m('ja', 'ジャ'),
		m('ju', 'ジュ'),
		m('je', 'ジェ'),
		m('jo', 'ジョ'),

		m('ta', 'タ'),
		m('ti', 'チ'),
		m('chi', 'チ'),
		m('tu', 'ツ'),
		m('tsu', 'ツ'),
		m('te', 'テ'),
		m('to', 'ト'),
		m('da', 'ダ'),
		m('di', 'ヂ'),
		m('dji', 'ヂ'),
		m('dzi', 'ヂ'),
		m('du', 'ヅ'),
		m('dzu', 'ヅ'),
		m('de', 'デ'),
		m('do', 'ド'),

		m('cha', 'チャ'),
		m('chu', 'チュ'),
		m('che', 'チェ'),
		m('cho', 'チョ'),

		m('dja', 'ヂャ'),
		m('dju', 'ヂュ'),
		m('dje', 'ヂェ'),
		m('djo', 'ヂョ'),

		m('dya', 'ヂャ'),
		m('dyu', 'ヂュ'),
		m('dye', 'ヂェ'),
		m('dyo', 'ヂョ'),

		m('na', 'ナ'),
		m('ni', 'ニ'),
		m('nu', 'ヌ'),
		m('ne', 'ネ'),
		m('no', 'ノ'),

		m('nya', 'ニャ'),
		m('nyu', 'ニュ'),
		m('nye', 'ニェ'),
		m('nyo', 'ニョ'),

		m('ha', 'ハ'),
		m('hi', 'ヒ'),
		m('hu', 'フ'),
		m('fu', 'フ'),
		m('he', 'ヘ'),
		m('ho', 'ホ'),
		m('ba', 'バ'),
		m('bi', 'ビ'),
		m('bu', 'ブ'),
		m('be', 'ベ'),
		m('bo', 'ボ'),
		m('pa', 'パ'),
		m('pi', 'ピ'),
		m('pu', 'プ'),
		m('pe', 'ペ'),
		m('po', 'ポ'),

		m('hya', 'ヒャ'),
		m('hyu', 'ヒュ'),
		m('hye', 'ヒェ'),
		m('hyo', 'ヒョ'),

		m('bya', 'ビャ'),
		m('byu', 'ビュ'),
		m('bye', 'ビェ'),
		m('byo', 'ビョ'),

		m('pya', 'ピャ'),
		m('pyu', 'ピュ'),
		m('pye', 'ピェ'),
		m('pyo', 'ピョ'),

		m('fa', 'ファ'),
		m('fi', 'フィ'),
		m('fe', 'フェ'),
		m('fo', 'フォ'),

		m('ma', 'マ'),
		m('mi', 'ミ'),
		m('mu', 'ム'),
		m('me', 'メ'),
		m('mo', 'モ'),

		m('mya', 'ミャ'),
		m('myu', 'ミュ'),
		m('mye', 'ミェ'),
		m('myo', 'ミョ'),

		m('ya', 'ヤ'),
		m('yu', 'ユ'),
		m('yo', 'ヨ'),

		m('ra', 'ラ'),
		m('ri', 'リ'),
		m('ru', 'ル'),
		m('re', 'レ'),
		m('ro', 'ロ'),

		m('rya', 'リャ'),
		m('ryu', 'リュ'),
		m('rye', 'リェ'),
		m('ryo', 'リョ'),

		m('wa', 'ワ'),
		m('wi', 'ウィ'),
		m('we', 'ウェ'),
		m('wo', 'ヲ'),
		m('wu', 'ウ'),

		m('va', 'ヴァ'),
		m('vi', 'ヴィ'),
		m('vu', 'ヴ'),
		m('ve', 'ヴェ'),
		m('vo', 'ヴォ'),
	)
}

function set_romaji_to_katakana_ime() {
	return rules(
		m('xa', 'ァ'),
		m('xi', 'ィ'),
		m('xu', 'ゥ'),
		m('xe', 'ェ'),
		m('xo', 'ォ'),

		m('xwe', 'ヱ'),
		m('xwi', 'ヰ'),

		m('xva', 'ヷ'),
		m('xvi', 'ヸ'),
		m('xve', 'ヹ'),
		m('xvo', 'ヺ'),

		m('xya', 'ャ'),
		m('xyu', 'ュ'),
		m('xyo', 'ョ'),

		m('xtu', 'ッ'),
		m('xtsu', 'ッ'),

		m('nn', 'ン'),
		m('xwa', 'ヮ'),
		m('xka', 'ヵ'),
		m('xke', 'ヶ'),

		m('/', '・'),
		m('-', 'ー'),
	)
}
