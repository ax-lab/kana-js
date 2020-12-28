import { m, mFn, rules, RuleSet, transform_rules } from './conversion'
import { tuple } from './util'
import { to_semi_voiced, to_voiced } from './voiced'

/** Main rule set to convert from any input to katakana. */
export function rules_to_katakana() {
	return rules(
		set_hiragana_to_katakana(),
		set_romaji_to_katakana(),
		set_romaji_double_vowels_as_prolonged_sound_mark(),
	)
}

/** Main rule set to convert from any input to hiragana. */
export function rules_to_hiragana() {
	return rules(set_katakana_to_hiragana(), set_romaji_to_hiragana())
}

/** Main rule set to convert kana to romaji. */
export function rules_to_romaji() {
	return rules()
}

//============================================================================//
// Mappers
//============================================================================//

function map_rules_for_long_vowels(rules: RuleSet) {
	const I = 'aeiouAEIOU'
	const A = 'âêîôûÂÊÎÔÛ'
	const B = 'āēīōūĀĒĪŌŪ'

	const RE_VOWEL = /[aeiou]$/i

	const replace = (input: string, table: string) =>
		input.replace(RE_VOWEL, (key) => {
			const index = I.indexOf(key)
			return table[index]
		})

	return transform_rules(rules, (input) => {
		if (RE_VOWEL.test(input.key)) {
			return [
				input,
				{ key: replace(input.key, A), out: input.out + 'ー' },
				{ key: replace(input.key, B), out: input.out + 'ー' },
			]
		}
		return input
	})
}

//============================================================================//
// Rule sets
//============================================================================//

/** All rules to convert katakana to hiragana. */
function set_katakana_to_hiragana() {
	const ls = [
		// Basic letters
		...map_kana((h, k) => m(k, h)),
		...map_small_kana((h, k) => m(k, h)),

		// Rare and weird characters
		m('ヽ', 'ゝ'), // Iteration Mark
		m('ヾ', 'ゞ'), // Voiced Iteration Mark
		m('ヿ', 'こと'), // Digraph Koto
		m('ｰ', 'ー'), // Halfwidth Katakana-Hiragana Prolonged Sound Mark
		...map_rare_katakana((h, k) => m(k, h)),
		...map_halfwidth_katakana((h, k) => m(k, h)),
	]
	return rules(...ls)
}

/** All rules to convert hiragana to katakana. */
function set_hiragana_to_katakana() {
	const ls = [
		// Basic letters
		...map_kana((h, k) => m(h, k)),
		...map_small_kana((h, k) => m(h, k)),

		// Missing hiragana characters

		// Rare and weird characters
		m('ゝ', 'ヽ'), // Iteration Mark
		m('ゞ', 'ヾ'), // Voiced Iteration Mark
		m('ゟ', 'ヨリ'), // Digraph Yori
	]
	return rules(...ls)
}

/** All rules to convert romaji to hiragana. */
function set_romaji_to_hiragana() {
	return set_romaji_to_kana(true)
}

/** All rules to convert romaji to katakana. */
function set_romaji_to_katakana() {
	return set_romaji_to_kana(false)
}

/** Compiles all rules from romaji to hiragana or katakana. */
function set_romaji_to_kana(hiragana: boolean, ime = true) {
	const mapper = (h: string, k: string, r: string) => (hiragana ? m(r, h) : m(r, k))
	const ls = [
		...map_kana(mapper),
		...map_digraphs(mapper), // This must come after map_kana
		...map_romaji_punctuation(mapper),
	]
	const output = rules(
		...ls,
		...set_romaji_double_consonants(hiragana),
		...set_romaji_quoted_long_vowels(hiragana),
		!ime
			? rules()
			: rules(
					...map_romaji_ime(mapper),
					mFn('nn', (ctx) => {
						if (!/^([aeiou]|ya|yu|ye|yo)/i.test(ctx.input)) {
							// Only generate if we are not in a syllable...
							return tuple(hiragana ? 'ん' : 'ン', 0)
						}
						// ...otherwise we are a double consonant
						return tuple(hiragana ? 'っ' : 'ッ', 1)
					}),
			  ),
	)

	return map_rules_for_long_vowels(output)
}

/** Conversion for the double consonants using っ or ッ */
function set_romaji_double_consonants(hiragana: boolean) {
	const CONSONANTS = [
		'b',
		'c',
		'd',
		'f',
		'g',
		'h',
		'j',
		'k',
		// 'l',
		'm',
		'n',
		'p',
		// 'q',
		'r',
		's',
		't',
		'v',
		'w',
		// 'x',
		'y',
		'z',
	]
	const list = CONSONANTS.map((x) => m(x + x, hiragana ? 'っ' : 'ッ', 1))
	return rules(...list)
}

/** Conversion rules for sequences like "ka'a" to "かあ" or "カア" */
function set_romaji_quoted_long_vowels(hiragana: boolean) {
	// Generate the quoted sequence (e.g. `'a` => `あ` for the key `a`).
	const q = (key: string, out: string) =>
		mFn(`'${key}`, (ctx) => {
			// Only translate a sequence like `a'a`, this is to avoid messing
			// up random quoted text.
			const last = ctx.lastInput
			if (last && last[last.length - 1].toLowerCase() === key) {
				return tuple(out, 0)
			}
			return tuple('', -1)
		})
	return rules(
		// Generate a quoted rule for each of the vowels
		q('a', hiragana ? 'あ' : 'ア'),
		q('i', hiragana ? 'い' : 'イ'),
		q('u', hiragana ? 'う' : 'ウ'),
		q('e', hiragana ? 'え' : 'エ'),
		q('o', hiragana ? 'お' : 'オ'),
	)
}

/**
 * Handle romaji double vowels with a prolonged sound mark (e.g. `aa` => `アー`)
 */
function set_romaji_double_vowels_as_prolonged_sound_mark() {
	const q = (key: string, out: string) =>
		mFn(key, (ctx) => {
			const last = ctx.lastInput
			const isLongVowel = last && last[last.length - 1].toLowerCase() === key
			const sameVowelNext = ctx.input.slice(0, 1).toLowerCase() === key
			return tuple(isLongVowel && !sameVowelNext ? 'ー' : out, 0)
		})
	return rules(
		// generate one rule for each vowel
		q('a', 'ア'),
		q('i', 'イ'),
		q('u', 'ウ'),
		q('e', 'エ'),
		q('o', 'オ'),
	)
}

//============================================================================//
// Character mappings
//============================================================================//

type MapFn<T> = (hiragana: string, katakana: string, romaji: string, special?: boolean) => T

function map_small_kana<T>(m: MapFn<T>): T[] {
	return [
		m('ぁ', 'ァ', 'a', true),
		m('ぃ', 'ィ', 'i', true),
		m('ぅ', 'ゥ', 'u', true),
		m('ぇ', 'ェ', 'e', true),
		m('ぉ', 'ォ', 'o', true),
		m('っ', 'ッ', 'tsu', true),
		m('ゃ', 'ャ', 'ya', true),
		m('ゅ', 'ュ', 'yu', true),
		m('ょ', 'ョ', 'yo', true),
	]
}

/** Katakana only characters that are rarely used. */
function map_rare_katakana<T>(m: MapFn<T>): T[] {
	return [
		// Those are rarely and don't have a corresponding hiragana, so we need
		// to use the combining mark.
		m('わ\u{3099}', 'ヷ', 'va'),
		m('ゐ\u{3099}', 'ヸ', 'vi'),
		m('ゑ\u{3099}', 'ヹ', 've'),
		m('を\u{3099}', 'ヺ', 'vo'),
	]
}

/** All common kana letters, except small digraph letters. */
function map_kana<T>(m: MapFn<T>): T[] {
	return [
		// Those are small but don't participate in any digraph. We need those
		// first to be overridden by later rules (e.g. for romaji)
		m('ゎ', 'ヮ', 'wa'),
		m('ゕ', 'ヵ', 'ka'),
		m('ゖ', 'ヶ', 'ke'),

		// "N" mappings
		m('ん', 'ン', 'n'),
		m('ん', 'ン', `n'`),

		// Non-standard romaji mappings (those must come before so they are
		// overridden when mapping from kana)

		m('か', 'カ', 'ca'),
		m('し', 'シ', 'ci'),
		m('く', 'ク', 'cu'),
		m('せ', 'セ', 'ce'),
		m('こ', 'コ', 'co'),

		m('し', 'シ', 'si'),
		m('じ', 'ジ', 'zi'),

		m('ち', 'チ', 'ti'),
		m('ぢ', 'ヂ', 'dji'),
		m('ぢ', 'ヂ', 'dzi'),

		m('つ', 'ツ', 'tu'),
		m('づ', 'ヅ', 'dzu'),

		m('ふ', 'フ', 'hu'),

		m('う', 'ウ', 'wu'),

		// Normal syllables

		m('あ', 'ア', 'a'),
		m('い', 'イ', 'i'),
		m('う', 'ウ', 'u'),
		m('え', 'エ', 'e'),
		m('お', 'オ', 'o'),
		m('か', 'カ', 'ka'),
		m('き', 'キ', 'ki'),
		m('く', 'ク', 'ku'),
		m('け', 'ケ', 'ke'),
		m('こ', 'コ', 'ko'),
		m('が', 'ガ', 'ga'),
		m('ぎ', 'ギ', 'gi'),
		m('ぐ', 'グ', 'gu'),
		m('げ', 'ゲ', 'ge'),
		m('ご', 'ゴ', 'go'),
		m('さ', 'サ', 'sa'),
		m('し', 'シ', 'shi'),
		m('す', 'ス', 'su'),
		m('せ', 'セ', 'se'),
		m('そ', 'ソ', 'so'),
		m('ざ', 'ザ', 'za'),
		m('じ', 'ジ', 'ji'),
		m('ず', 'ズ', 'zu'),
		m('ぜ', 'ゼ', 'ze'),
		m('ぞ', 'ゾ', 'zo'),
		m('た', 'タ', 'ta'),
		m('ち', 'チ', 'chi'),
		m('つ', 'ツ', 'tsu'),
		m('て', 'テ', 'te'),
		m('と', 'ト', 'to'),
		m('だ', 'ダ', 'da'),
		m('ぢ', 'ヂ', 'di'),
		m('づ', 'ヅ', 'du'),
		m('で', 'デ', 'de'),
		m('ど', 'ド', 'do'),
		m('な', 'ナ', 'na'),
		m('に', 'ニ', 'ni'),
		m('ぬ', 'ヌ', 'nu'),
		m('ね', 'ネ', 'ne'),
		m('の', 'ノ', 'no'),
		m('は', 'ハ', 'ha'),
		m('ひ', 'ヒ', 'hi'),
		m('ふ', 'フ', 'fu'),
		m('へ', 'ヘ', 'he'),
		m('ほ', 'ホ', 'ho'),
		m('ば', 'バ', 'ba'),
		m('び', 'ビ', 'bi'),
		m('ぶ', 'ブ', 'bu'),
		m('べ', 'ベ', 'be'),
		m('ぼ', 'ボ', 'bo'),
		m('ぱ', 'パ', 'pa'),
		m('ぴ', 'ピ', 'pi'),
		m('ぷ', 'プ', 'pu'),
		m('ぺ', 'ペ', 'pe'),
		m('ぽ', 'ポ', 'po'),
		m('ま', 'マ', 'ma'),
		m('み', 'ミ', 'mi'),
		m('む', 'ム', 'mu'),
		m('め', 'メ', 'me'),
		m('も', 'モ', 'mo'),
		m('や', 'ヤ', 'ya'),
		m('ゆ', 'ユ', 'yu'),
		m('よ', 'ヨ', 'yo'),
		m('ら', 'ラ', 'ra'),
		m('り', 'リ', 'ri'),
		m('る', 'ル', 'ru'),
		m('れ', 'レ', 're'),
		m('ろ', 'ロ', 'ro'),
		m('わ', 'ワ', 'wa'),
		m('ゐ', 'ヰ', 'wi'),
		m('ゑ', 'ヱ', 'we'),
		m('を', 'ヲ', 'wo'),
		m('ゔ', 'ヴ', 'vu'),
	]
}

/** Map syllables made from combination of kana and small letters */
function map_digraphs<T>(m: MapFn<T>): T[] {
	return [
		// Non-default combinations first, so they are overridden when
		// generating romaji

		m('じゃ', 'ジャ', 'jya'),
		m('じゅ', 'ジュ', 'jyu'),
		m('じぇ', 'ジェ', 'jye'),
		m('じょ', 'ジョ', 'jyo'),

		m('じゃ', 'ジャ', 'zya'),
		m('じゅ', 'ジュ', 'zyu'),
		m('じぇ', 'ジェ', 'zye'),
		m('じょ', 'ジョ', 'zyo'),

		m('ちゃ', 'チャ', 'tya'),
		m('ちゅ', 'チュ', 'tyu'),
		m('ちぇ', 'チェ', 'tye'),
		m('ちょ', 'チョ', 'tyo'),

		m('ぢゃ', 'ヂャ', 'dya'),
		m('ぢゅ', 'ヂュ', 'dyu'),
		m('ぢぇ', 'ヂェ', 'dye'),
		m('ぢょ', 'ヂョ', 'dyo'),

		m('ぢゃ', 'ヂャ', 'dza'),
		m('ぢぇ', 'ヂェ', 'dze'),
		m('ぢょ', 'ヂョ', 'dzo'),

		// Default combinations

		m('きゃ', 'キャ', 'kya'),
		m('きゅ', 'キュ', 'kyu'),
		m('きぇ', 'キェ', 'kye'),
		m('きょ', 'キョ', 'kyo'),

		m('ぎゃ', 'ギャ', 'gya'),
		m('ぎゅ', 'ギュ', 'gyu'),
		m('ぎぇ', 'ギェ', 'gye'),
		m('ぎょ', 'ギョ', 'gyo'),

		m('しゃ', 'シャ', 'sha'),
		m('しゅ', 'シュ', 'shu'),
		m('しぇ', 'シェ', 'she'),
		m('しょ', 'ショ', 'sho'),

		m('じゃ', 'ジャ', 'ja'),
		m('じゅ', 'ジュ', 'ju'),
		m('じぇ', 'ジェ', 'je'),
		m('じょ', 'ジョ', 'jo'),

		m('ちゃ', 'チャ', 'cha'),
		m('ちゅ', 'チュ', 'chu'),
		m('ちぇ', 'チェ', 'che'),
		m('ちょ', 'チョ', 'cho'),

		m('ぢゃ', 'ヂャ', 'dja'),
		m('ぢゅ', 'ヂュ', 'dju'),
		m('ぢぇ', 'ヂェ', 'dje'),
		m('ぢょ', 'ヂョ', 'djo'),

		m('にゃ', 'ニャ', 'nya'),
		m('にゅ', 'ニュ', 'nyu'),
		m('にぇ', 'ニェ', 'nye'),
		m('にょ', 'ニョ', 'nyo'),

		m('ひゃ', 'ヒャ', 'hya'),
		m('ひゅ', 'ヒュ', 'hyu'),
		m('ひぇ', 'ヒェ', 'hye'),
		m('ひょ', 'ヒョ', 'hyo'),

		m('びゃ', 'ビャ', 'bya'),
		m('びゅ', 'ビュ', 'byu'),
		m('びぇ', 'ビェ', 'bye'),
		m('びょ', 'ビョ', 'byo'),

		m('ぴゃ', 'ピャ', 'pya'),
		m('ぴゅ', 'ピュ', 'pyu'),
		m('ぴぇ', 'ピェ', 'pye'),
		m('ぴょ', 'ピョ', 'pyo'),

		m('ふぁ', 'ファ', 'fa'),
		m('ふぃ', 'フィ', 'fi'),
		m('ふぇ', 'フェ', 'fe'),
		m('ふぉ', 'フォ', 'fo'),

		m('みゃ', 'ミャ', 'mya'),
		m('みゅ', 'ミュ', 'myu'),
		m('みぇ', 'ミェ', 'mye'),
		m('みょ', 'ミョ', 'myo'),

		m('りゃ', 'リャ', 'rya'),
		m('りゅ', 'リュ', 'ryu'),
		m('りぇ', 'リェ', 'rye'),
		m('りょ', 'リョ', 'ryo'),

		// Override the archaic and rare characters with combinations

		m('うぃ', 'ウィ', 'wi'),
		m('うぇ', 'ウェ', 'we'),

		m('ゔぁ', 'ヴァ', 'va'),
		m('ゔぃ', 'ヴィ', 'vi'),
		m('ゔぇ', 'ヴェ', 've'),
		m('ゔぉ', 'ヴォ', 'vo'),
	]
}

/** Halfwidth katakana characters. */
function map_halfwidth_katakana<T>(m: MapFn<T>): T[] {
	const d = (h: string, k: string, r: string) => [
		m(h, k, r),
		m(to_voiced(h), to_voiced(k), to_voiced(r)), // voiced (e.g. が)
	]

	const h = (h: string, k: string, r: string) => [
		m(h, k, r),
		m(to_voiced(h), to_voiced(k), to_voiced(r)), // voiced (e.g. ば)
		m(to_semi_voiced(h), to_semi_voiced(k), to_semi_voiced(r)), // semi-voiced (e.g. ぱ)
	]

	return [
		m('ー', 'ｰ', '-', true), // Prolonged Sound Mark

		m('ぁ', 'ｧ', 'a', true), // Halfwidth Katakana Letter Small A
		m('ぃ', 'ｨ', 'i', true), // Halfwidth Katakana Letter Small I
		m('ぅ', 'ｩ', 'u', true), // Halfwidth Katakana Letter Small U
		m('ぇ', 'ｪ', 'e', true), // Halfwidth Katakana Letter Small E
		m('ぉ', 'ｫ', 'o', true), // Halfwidth Katakana Letter Small O

		m('ゃ', 'ｬ', 'ya', true), // Halfwidth Katakana Letter Small Ya
		m('ゅ', 'ｭ', 'yu', true), // Halfwidth Katakana Letter Small Yu
		m('ょ', 'ｮ', 'yo', true), // Halfwidth Katakana Letter Small Yo
		m('っ', 'ｯ', 'tsu', true), // Halfwidth Katakana Letter Small Tu

		m('を', 'ｦ', 'wo'), // Halfwidth Katakana Letter Wo
		m('あ', 'ｱ', 'a'), // Halfwidth Katakana Letter A
		m('い', 'ｲ', 'i'), // Halfwidth Katakana Letter I
		...d('う', 'ｳ', 'u'), // Halfwidth Katakana Letter U
		m('え', 'ｴ', 'e'), // Halfwidth Katakana Letter E
		m('お', 'ｵ', 'o'), // Halfwidth Katakana Letter O

		...d('か', 'ｶ', 'ka'), // Halfwidth Katakana Letter Ka
		...d('き', 'ｷ', 'ki'), // Halfwidth Katakana Letter Ki
		...d('く', 'ｸ', 'ku'), // Halfwidth Katakana Letter Ku
		...d('け', 'ｹ', 'ke'), // Halfwidth Katakana Letter Ke
		...d('こ', 'ｺ', 'ko'), // Halfwidth Katakana Letter Ko

		...d('さ', 'ｻ', 'sa'), // Halfwidth Katakana Letter Sa
		...d('し', 'ｼ', 'shi'), // Halfwidth Katakana Letter Si
		...d('す', 'ｽ', 'su'), // Halfwidth Katakana Letter Su
		...d('せ', 'ｾ', 'se'), // Halfwidth Katakana Letter Se
		...d('そ', 'ｿ', 'so'), // Halfwidth Katakana Letter So

		...d('た', 'ﾀ', 'ta'), // Halfwidth Katakana Letter Ta
		...d('ち', 'ﾁ', 'chi'), // Halfwidth Katakana Letter Ti
		...d('つ', 'ﾂ', 'tsu'), // Halfwidth Katakana Letter Tu
		...d('て', 'ﾃ', 'te'), // Halfwidth Katakana Letter Te
		...d('と', 'ﾄ', 'to'), // Halfwidth Katakana Letter To

		m('な', 'ﾅ', 'na'), // Halfwidth Katakana Letter Na
		m('に', 'ﾆ', 'ni'), // Halfwidth Katakana Letter Ni
		m('ぬ', 'ﾇ', 'nu'), // Halfwidth Katakana Letter Nu
		m('ね', 'ﾈ', 'ne'), // Halfwidth Katakana Letter Ne
		m('の', 'ﾉ', 'no'), // Halfwidth Katakana Letter No

		...h('は', 'ﾊ', 'ha'), // Halfwidth Katakana Letter Ha
		...h('ひ', 'ﾋ', 'hi'), // Halfwidth Katakana Letter Hi
		...h('ふ', 'ﾌ', 'hu'), // Halfwidth Katakana Letter Hu
		...h('へ', 'ﾍ', 'he'), // Halfwidth Katakana Letter He
		...h('ほ', 'ﾎ', 'ho'), // Halfwidth Katakana Letter Ho

		m('ま', 'ﾏ', 'ma'), // Halfwidth Katakana Letter Ma
		m('み', 'ﾐ', 'mi'), // Halfwidth Katakana Letter Mi
		m('む', 'ﾑ', 'mu'), // Halfwidth Katakana Letter Mu
		m('め', 'ﾒ', 'me'), // Halfwidth Katakana Letter Me
		m('も', 'ﾓ', 'mo'), // Halfwidth Katakana Letter Mo
		m('や', 'ﾔ', 'ya'), // Halfwidth Katakana Letter Ya
		m('ゆ', 'ﾕ', 'yu'), // Halfwidth Katakana Letter Yu
		m('よ', 'ﾖ', 'yo'), // Halfwidth Katakana Letter Yo
		m('ら', 'ﾗ', 'ra'), // Halfwidth Katakana Letter Ra
		m('り', 'ﾘ', 'ri'), // Halfwidth Katakana Letter Ri
		m('る', 'ﾙ', 'ru'), // Halfwidth Katakana Letter Ru
		m('れ', 'ﾚ', 're'), // Halfwidth Katakana Letter Re
		m('ろ', 'ﾛ', 'ro'), // Halfwidth Katakana Letter Ro
		...d('わ', 'ﾜ', 'wa'), // Halfwidth Katakana Letter Wa
		m('ん', 'ﾝ', 'n'), // Halfwidth Katakana Letter N
	]
}

/** Extra romaji triples for IME input only. */
function map_romaji_ime<T>(m: MapFn<T>): T[] {
	return [
		m('ぁ', 'ァ', 'xa'),
		m('ぃ', 'ィ', 'xi'),
		m('ぅ', 'ゥ', 'xu'),
		m('ぇ', 'ェ', 'xe'),
		m('ぉ', 'ォ', 'xo'),

		m('ゐ', 'ヰ', 'xwi'),
		m('ゑ', 'ヱ', 'xwe'),

		m('わ\u{3099}', 'ヷ', 'xva'),
		m('ゐ\u{3099}', 'ヸ', 'xvi'),
		m('ゑ\u{3099}', 'ヹ', 'xve'),
		m('を\u{3099}', 'ヺ', 'xvo'),

		m('ゃ', 'ャ', 'xya'),
		m('ゅ', 'ュ', 'xyu'),
		m('ょ', 'ョ', 'xyo'),

		m('っ', 'ッ', 'xtu'),
		m('っ', 'ッ', 'xtsu'),

		m('どぅ', 'ドゥ', 'xdu'),
		m('てぃ', 'ティ', 'xti'),
		m('でぃ', 'ディ', 'xdi'),

		m('ゎ', 'ヮ', 'xwa'),
		m('ゕ', 'ヵ', 'xka'),
		m('ゖ', 'ヶ', 'xke'),

		m('・', '・', '/'),
		m('ー', 'ー', '-'),
	]
}

/** Romaji punctuation */
function map_romaji_punctuation<T>(mFn: MapFn<T>): T[] {
	const m = (r: string, k: string) => mFn(k, k, r)
	return [
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
	]
}
