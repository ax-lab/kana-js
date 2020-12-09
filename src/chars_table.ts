import { CharFlags, CharKind } from './chars_types'

const KANA = CharFlags.CHAR_JAPANESE | CharFlags.IS_LETTER

const H1 = f(CharKind.HIRAGANA, KANA)
const H2 = f(CharKind.HIRAGANA, KANA | CharFlags.IS_SMALL)
const H3 = f(CharKind.HIRAGANA, KANA | CharFlags.IS_SMALL | CharFlags.IS_RARE)
const H4 = f(CharKind.HIRAGANA, KANA | CharFlags.IS_RARE)
const H5 = f(CharKind.HIRAGANA, CharFlags.CHAR_JAPANESE | CharFlags.IS_MARK | CharFlags.IS_RARE)

function f(kind: CharKind, flags: CharFlags): [CharKind, CharFlags] {
	return [kind, flags]
}

export const TABLE: { [key: string]: [CharKind, CharFlags] } = {
	//========================================================================//
	// Hiragana
	//========================================================================//

	// Common Hiragana
	あ: H1,
	い: H1,
	う: H1,
	え: H1,
	お: H1,
	か: H1,
	が: H1,
	き: H1,
	ぎ: H1,
	く: H1,
	ぐ: H1,
	け: H1,
	げ: H1,
	こ: H1,
	ご: H1,
	さ: H1,
	ざ: H1,
	し: H1,
	じ: H1,
	す: H1,
	ず: H1,
	せ: H1,
	ぜ: H1,
	そ: H1,
	ぞ: H1,
	た: H1,
	だ: H1,
	ち: H1,
	ぢ: H1,
	つ: H1,
	づ: H1,
	て: H1,
	で: H1,
	と: H1,
	ど: H1,
	な: H1,
	に: H1,
	ぬ: H1,
	ね: H1,
	の: H1,
	は: H1,
	ば: H1,
	ぱ: H1,
	ひ: H1,
	び: H1,
	ぴ: H1,
	ふ: H1,
	ぶ: H1,
	ぷ: H1,
	へ: H1,
	べ: H1,
	ぺ: H1,
	ほ: H1,
	ぼ: H1,
	ぽ: H1,
	ま: H1,
	み: H1,
	む: H1,
	め: H1,
	も: H1,
	や: H1,
	ゆ: H1,
	よ: H1,
	ら: H1,
	り: H1,
	る: H1,
	れ: H1,
	ろ: H1,
	わ: H1,
	ゐ: H1,
	ゑ: H1,
	を: H1,
	ん: H1,

	// Small Hiragana
	ぁ: H2,
	ぃ: H2,
	ぅ: H2,
	ぇ: H2,
	ぉ: H2,
	っ: H2,
	ゃ: H2,
	ゅ: H2,
	ょ: H2,

	// Rare Hiragana
	ゎ: H3,
	ゕ: H3,
	ゖ: H3,
	ゔ: H4,
	ゟ: H4,
	ゝ: H5,
	ゞ: H5,
}
