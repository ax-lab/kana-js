export function to_voiced(input: string) {
	if (/^[a-z]+$/.test(input)) {
		if (/chi|ti/.test(input)) {
			return 'di'
		} else if (/shi|si|ci/.test(input)) {
			return 'ji'
		} else if (/tsu|tu/.test(input)) {
			return 'du'
		} else if (/ce/.test(input)) {
			return 'ze'
		} else if (input === 'u') {
			return 'vu'
		} else if (input === 'wa') {
			return 'va'
		}
		switch (input[0]) {
			case 'k':
			case 'c':
				return 'g' + input.slice(1)
			case 's':
				return 'z' + input.slice(1)
			case 't':
				return 'd' + input.slice(1)
			case 'h':
				return 'b' + input.slice(1)
		}
	}

	switch (input) {
		case 'か': // ka
		case 'き':
		case 'く':
		case 'け':
		case 'こ':
		case 'カ': // ka
		case 'キ':
		case 'ク':
		case 'ケ':
		case 'コ':
		case 'さ': // sa
		case 'し':
		case 'す':
		case 'せ':
		case 'そ':
		case 'サ': // sa
		case 'シ':
		case 'ス':
		case 'セ':
		case 'ソ':
		case 'た': // ta
		case 'ち':
		case 'つ':
		case 'て':
		case 'と':
		case 'タ': // ta
		case 'チ':
		case 'ツ':
		case 'テ':
		case 'ト':
		case 'は': // ha
		case 'ひ':
		case 'ふ':
		case 'へ':
		case 'ほ':
		case 'ハ': // ha
		case 'ヒ':
		case 'フ':
		case 'ヘ':
		case 'ホ':
		case 'う': // u
		case 'ウ':
		case 'わ': // wa
		case 'ワ':
			return (input + '\u{3099}').normalize()

		// Weird characters and half katakana
		case 'ヵ':
		case 'ヶ':
		case 'ｶ': // ka (halfwidth)
		case 'ｷ':
		case 'ｸ':
		case 'ｹ':
		case 'ｺ':
		case 'ｻ': // sa (halfwidth)
		case 'ｼ':
		case 'ｽ':
		case 'ｾ':
		case 'ｿ':
		case 'ﾀ': // ta (halfwidth)
		case 'ﾁ':
		case 'ﾂ':
		case 'ﾃ':
		case 'ﾄ':
		case 'ﾊ': // ha (halfwidth)
		case 'ﾋ':
		case 'ﾌ':
		case 'ﾍ':
		case 'ﾎ':
		case 'ｳ': // u (halfwidth)
		case 'ﾜ': // wa (halfwidth)
			return input + '\u{3099}'
	}

	return input
}

export function to_semi_voiced(input: string) {
	if (/^[a-z]+$/.test(input)) {
		if (input[0] === 'h') {
			return 'p' + input.slice(1)
		}
	}

	switch (input) {
		case 'は':
		case 'ひ':
		case 'ふ':
		case 'へ':
		case 'ほ':
		case 'ハ':
		case 'ヒ':
		case 'フ':
		case 'ヘ':
		case 'ホ':
		case 'ﾊ':
		case 'ﾋ':
		case 'ﾌ':
		case 'ﾍ':
		case 'ﾎ':
			return (input + '\u{309A}').normalize()
	}

	return input
}
