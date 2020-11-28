import { expect, test } from '@jest/globals'

import { answer } from './index'

test('answer to everything should be 42', () => {
	expect(answer()).toBe(42)
})
