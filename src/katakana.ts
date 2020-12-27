import { compile, convert, m, mFn, rules } from './conversion'
import { tuple } from './util'

const TO_KATAKANA = compile(rules(set_hiragana_to_katakana(), set_romaji_to_katakana(), set_romaji_to_katakana_ime()))

/**
 * Converts the input text to katakana.
 *
 * This works on any mix of romaji and hiragana inputs. It will also convert
 * romaji punctuation and spacing to the Japanese equivalents.
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

// Generate long vowel variations for a syllable
function gen_rules_long_vowels(key: string, out: string, withoutLongBar = false) {
	const A = 'aeiou'
	const B = 'âêîôû'
	const C = 'āēīōū'
	const D = ['ア', 'エ', 'イ', 'オ', 'ウ']
	const pre = key.slice(0, key.length - 1)
	const idx = A.indexOf(key[key.length - 1])
	const chr = withoutLongBar ? D[idx] : 'ー'

	const list = [m(key, out), m(pre + B[idx], out + chr), m(pre + C[idx], out + chr)]
	return rules(...list)
}

function subset_romaji_to_katakana_basics() {
	const extraLong = true

	const l = gen_rules_long_vowels

	// Generate a vowel quote sequence (e.g. "a'a")
	const q = (key: string, out: string) =>
		mFn(`'${key}`, (ctx) => {
			// Only translate a sequence like "a'a"
			const last = ctx.lastInput
			if (last && last[last.length - 1].toLowerCase() === key) {
				return tuple(out, 0)
			}
			return tuple('', -1)
		})

	// Handle a double vowel as a long sequence
	const x = (key: string, out: string) =>
		mFn(key, (ctx) => {
			const last = ctx.lastInput
			const isLongVowel = last && last[last.length - 1].toLowerCase() === key
			const sameVowelNext = ctx.input.slice(0, 1).toLowerCase() === key
			return tuple(isLongVowel && !sameVowelNext ? 'ー' : out, 0)
		})

	return rules(
		m('n', 'ン'),
		m("n'", 'ン'),

		subset_romaji_punctuation(),

		q('a', 'ア'),
		q('i', 'イ'),
		q('u', 'ウ'),
		q('e', 'エ'),
		q('o', 'オ'),

		l('a', 'ア'),
		l('i', 'イ'),
		l('u', 'ウ'),
		l('e', 'エ'),
		l('o', 'オ'),

		extraLong ? rules(x('a', 'ア'), x('i', 'イ'), x('u', 'ウ'), x('e', 'エ'), x('o', 'オ')) : rules(),

		l('ka', 'カ'),
		l('ki', 'キ'),
		l('ku', 'ク'),
		l('ke', 'ケ'),
		l('ko', 'コ'),
		l('ga', 'ガ'),
		l('gi', 'ギ'),
		l('gu', 'グ'),
		l('ge', 'ゲ'),
		l('go', 'ゴ'),

		l('kya', 'キャ'),
		l('kyu', 'キュ'),
		l('kye', 'キェ'),
		l('kyo', 'キョ'),

		l('gya', 'ギャ'),
		l('gyu', 'ギュ'),
		l('gye', 'ギェ'),
		l('gyo', 'ギョ'),

		l('sa', 'サ'),
		l('si', 'シ'),
		l('shi', 'シ'),
		l('su', 'ス'),
		l('se', 'セ'),
		l('so', 'ソ'),
		l('za', 'ザ'),
		l('zi', 'ジ'),
		l('ji', 'ジ'),
		l('zu', 'ズ'),
		l('ze', 'ゼ'),
		l('zo', 'ゾ'),

		l('sha', 'シャ'),
		l('shu', 'シュ'),
		l('she', 'シェ'),
		l('sho', 'ショ'),

		l('ja', 'ジャ'),
		l('ju', 'ジュ'),
		l('je', 'ジェ'),
		l('jo', 'ジョ'),

		l('jya', 'ジャ'),
		l('jyu', 'ジュ'),
		l('jye', 'ジェ'),
		l('jyo', 'ジョ'),

		l('zya', 'ジャ'),
		l('zyu', 'ジュ'),
		l('zye', 'ジェ'),
		l('zyo', 'ジョ'),

		l('ta', 'タ'),
		l('ti', 'チ'),
		l('chi', 'チ'),
		l('tu', 'ツ'),
		l('tsu', 'ツ'),
		l('te', 'テ'),
		l('to', 'ト'),
		l('da', 'ダ'),
		l('di', 'ヂ'),
		l('dji', 'ヂ'),
		l('dzi', 'ヂ'),
		l('du', 'ヅ'),
		l('dzu', 'ヅ'),
		l('de', 'デ'),
		l('do', 'ド'),

		l('cha', 'チャ'),
		l('chu', 'チュ'),
		l('che', 'チェ'),
		l('cho', 'チョ'),

		l('tya', 'チャ'),
		l('tyu', 'チュ'),
		l('tye', 'チェ'),
		l('tyo', 'チョ'),

		l('dja', 'ヂャ'),
		l('dju', 'ヂュ'),
		l('dje', 'ヂェ'),
		l('djo', 'ヂョ'),

		l('dya', 'ヂャ'),
		l('dyu', 'ヂュ'),
		l('dye', 'ヂェ'),
		l('dyo', 'ヂョ'),

		l('dza', 'ヂャ'),
		l('dze', 'ヂェ'),
		l('dzo', 'ヂョ'),

		l('na', 'ナ'),
		l('ni', 'ニ'),
		l('nu', 'ヌ'),
		l('ne', 'ネ'),
		l('no', 'ノ'),

		l('nya', 'ニャ'),
		l('nyu', 'ニュ'),
		l('nye', 'ニェ'),
		l('nyo', 'ニョ'),

		l('ha', 'ハ'),
		l('hi', 'ヒ'),
		l('hu', 'フ'),
		l('fu', 'フ'),
		l('he', 'ヘ'),
		l('ho', 'ホ'),
		l('ba', 'バ'),
		l('bi', 'ビ'),
		l('bu', 'ブ'),
		l('be', 'ベ'),
		l('bo', 'ボ'),
		l('pa', 'パ'),
		l('pi', 'ピ'),
		l('pu', 'プ'),
		l('pe', 'ペ'),
		l('po', 'ポ'),

		l('hya', 'ヒャ'),
		l('hyu', 'ヒュ'),
		l('hye', 'ヒェ'),
		l('hyo', 'ヒョ'),

		l('bya', 'ビャ'),
		l('byu', 'ビュ'),
		l('bye', 'ビェ'),
		l('byo', 'ビョ'),

		l('pya', 'ピャ'),
		l('pyu', 'ピュ'),
		l('pye', 'ピェ'),
		l('pyo', 'ピョ'),

		l('fa', 'ファ'),
		l('fi', 'フィ'),
		l('fe', 'フェ'),
		l('fo', 'フォ'),

		l('ma', 'マ'),
		l('mi', 'ミ'),
		l('mu', 'ム'),
		l('me', 'メ'),
		l('mo', 'モ'),

		l('mya', 'ミャ'),
		l('myu', 'ミュ'),
		l('mye', 'ミェ'),
		l('myo', 'ミョ'),

		l('ya', 'ヤ'),
		l('yu', 'ユ'),
		l('yo', 'ヨ'),

		l('ra', 'ラ'),
		l('ri', 'リ'),
		l('ru', 'ル'),
		l('re', 'レ'),
		l('ro', 'ロ'),

		l('rya', 'リャ'),
		l('ryu', 'リュ'),
		l('rye', 'リェ'),
		l('ryo', 'リョ'),

		l('wa', 'ワ'),
		l('wi', 'ウィ'),
		l('we', 'ウェ'),
		l('wo', 'ヲ'),
		l('wu', 'ウ'),

		l('va', 'ヴァ'),
		l('vi', 'ヴィ'),
		l('vu', 'ヴ'),
		l('ve', 'ヴェ'),
		l('vo', 'ヴォ'),

		// Extra sillables (e.g. for IME)
		l('ca', 'カ'),
		l('ci', 'シ'),
		l('cu', 'ク'),
		l('ce', 'セ'),
		l('co', 'コ'),

		subset_romaji_double_consonants(),
	)
}

function subset_romaji_double_consonants() {
	const CONSONANTS = [
		'b',
		'c',
		'd',
		'f',
		'g',
		'h',
		'j',
		'k',
		'l',
		'm',
		'n',
		'p',
		'q',
		'r',
		's',
		't',
		'v',
		'w',
		'x',
		'y',
		'z',
	]
	const list = CONSONANTS.map((x) => m(x + x, 'ッ', 1))
	return rules(...list)
}

function set_romaji_to_katakana_ime() {
	const l = gen_rules_long_vowels

	return rules(
		l('xa', 'ァ'),
		l('xi', 'ィ'),
		l('xu', 'ゥ'),
		l('xe', 'ェ'),
		l('xo', 'ォ'),

		l('xwe', 'ヱ'),
		l('xwi', 'ヰ'),

		l('xva', 'ヷ'),
		l('xvi', 'ヸ'),
		l('xve', 'ヹ'),
		l('xvo', 'ヺ'),

		l('xya', 'ャ'),
		l('xyu', 'ュ'),
		l('xyo', 'ョ'),

		l('xtu', 'ッ'),
		l('xtsu', 'ッ'),

		l('xdu', 'ドゥ'),
		l('xti', 'ティ'),
		l('xdi', 'ディ'),

		l('xwa', 'ヮ'),
		l('xka', 'ヵ'),
		l('xke', 'ヶ'),

		mFn('nn', (ctx) => {
			if (!/^([aeiou]|ya|yu|ye|yo)/i.test(ctx.input)) {
				// Only generate if we are not in a syllable...
				return tuple('ン', 0)
			}
			// ...otherwise we are a double consonant
			return tuple('ッ', 1)
		}),

		m('/', '・'),
		m('-', 'ー'),
	)
}

function subset_romaji_punctuation() {
	return rules(
		m(' ', '\u{3000}'),
		m('/', '・'),
		m(',', '、'),
		m('.', '。'),
		m('[', '「'),
		m(']', '」'),
		m('«', '《'),
		m('»', '》'),
		m('»', '》'),
		m('!', '！'),
		m('"', '＂'),
		m('#', '＃'),
		m('$', '＄'),
		m('%', '％'),
		m('&', '＆'),
		m(`'`, '＇'),
		m('(', '（'),
		m(')', '）'),
		m('*', '＊'),
		m('+', '＋'),
		m('-', '－'),
		m(':', '：'),
		m(';', '；'),
		m('<', '＜'),
		m('=', '＝'),
		m('>', '＞'),
		m('?', '？'),
		m('@', '＠'),
		m('\\', '＼'),
		m('^', '＾'),
		m('_', '＿'),
		m('`', '｀'),
		m('{', '｛'),
		m('|', '｜'),
		m('}', '｝'),
		m('~', '～'),

		// Monetary symbols
		m('¢', '￠'),
		m('£', '￡'),
		m('¬', '￢'),
		m('¯', '￣'),
		m('¥', '￥'),
		m('₩', '￦'),
	)
}
