type SomeEnum = {
	[key: string]: number | string
	[key: number]: number | string
}

/**
 * Returns the string representation of an enumeration value. This relies on
 * the way TypeScript generates the enum code.
 *
 * Supports string enums, numeric enums, and bit flags (`isFlag` must be true).
 *
 * This handles `null`, `undefined`, empty, and invalid values.
 *
 * @param enumType
 * The enumeration type itself.
 *
 * @param value
 * The enumeration value to print.
 *
 * @param isFlag
 * If true, the function will handle numeric enums as bitflags.
 *
 * @returns A string representation of the enumeration value, suited for
 * debugging.
 */
export function enumToString(enumType: SomeEnum, value: number | string | null | undefined, isFlag = false): string {
	// Trivial cases:
	if (value === undefined) {
		return '(undefined)'
	}
	if (value === null) {
		return '(null)'
	}
	if (value === '') {
		return '(empty)'
	}

	// Handles a simple value for a numeric enum:
	const valueName = enumType[value]
	if (typeof valueName === 'string') {
		return valueName
	}

	// Handles a direct string value (e.g. string enum or invalid enum flag):
	if (typeof value === 'string') {
		return value
	}

	// For bitflags we need to isolate the individual bits
	if (isFlag) {
		// Array that we'll build with all the flags set in the value
		const flags: string[] = []

		// Retrieve all numeric enum entries (ignore the reverse mapping)
		const keys = Object.keys(enumType).filter((x) => typeof enumType[x] === 'number')

		// Build a map of key => value
		const values: { [key: string]: number } = {}
		for (const key of keys) {
			// eslint-disable-next-line functional/immutable-data
			values[key] = +enumType[key]
		}

		// Sort the keys. We want individual bit flags to be sorted by
		// increasing value, but we want composites to come first and be
		// sorted decreasing.
		//
		// This weird sort order makes sure that when a composite flag is used
		// it will actually appear in the output, with more complete flags being
		// considered first.

		// Check if `key` is a composite flag. This is true if any other
		// flag bits are a subset of `key`.
		const isComposite = (key: string) => {
			const val = values[key]
			for (const k of keys) {
				const v = values[k]

				// `v` is a subset of `val` if:
				// - it is not the empty flag;
				// - any bit set in `v` is also set in `val`;
				// - and `v` is not equal to `val`.
				if (v !== 0 && (v & val) === v && v < val) {
					return true
				}
			}
			return false
		}

		// eslint-disable-next-line functional/immutable-data
		keys.sort((a, b) => {
			const cA = isComposite(a)
			const cB = isComposite(b)
			if (cA !== cB) {
				// Composite keys come first
				return cA ? -1 : +1
			} else if (cA) {
				// Between composites, we sort in decreasing order
				return values[b] - values[a]
			} else {
				// Between non-composites, we sort in increasing order
				return values[a] - values[b]
			}
		})

		// eslint-disable-next-line functional/no-let
		let remaining = value
		for (const key of keys) {
			const val = +enumType[key]
			if (val !== 0 && (remaining & val) === val) {
				// eslint-disable-next-line functional/immutable-data
				flags.push(key)
				remaining = remaining - val
			}
		}
		if (remaining !== 0) {
			// eslint-disable-next-line functional/immutable-data
			flags.push(remaining.toString())
		}
		if (!flags.length) {
			// eslint-disable-next-line functional/immutable-data
			flags.push('0')
		}
		return flags.join('+')
	}

	return value.toString()
}
