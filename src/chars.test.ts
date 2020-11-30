import { describe, expect, test } from '@jest/globals'

import * as chars from './chars'

describe('chars', () => {
	test('nextChar should return first character in a string', () => {
		expect(chars.nextChar('abc')).toEqual('a')
	})

	test('nextChar should return empty for empty string', () => {
		expect(chars.nextChar('')).toEqual('')
	})

	test('nextChar should support UTF-16 surrogate pairs', () => {
		expect(chars.nextChar('\u{24B62}!')).toEqual('𤭢')
		expect(chars.nextChar('𤭢!')).toEqual('𤭢')

		expect(chars.nextChar('\u{1F600}!')).toEqual('😀')
		expect(chars.nextChar('😀!')).toEqual('😀')
	})
})
