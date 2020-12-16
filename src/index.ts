export * from './chars'
export * from './katakana'

function answer() {
	return 42
}

export { answer }

console.log('DUMMY')

import { to_katakana } from './katakana'
console.log(to_katakana('かたかな　ありがとう'))
