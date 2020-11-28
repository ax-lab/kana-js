# Project Configuration

Configuration based on template by https://github.com/bitjson/typescript-starter
and other sources.

## Formatting and Linting

ESLint: https://github.com/typescript-eslint/typescript-eslint#readme

* Functional programming:
	* https://github.com/jonaskello/eslint-plugin-functional
* Import/Export linting:
	* https://github.com/benmosher/eslint-plugin-import
* Prettier support:
	* https://github.com/prettier/eslint-config-prettier

The secondary `tsconfig.eslint.json` is required to lint additional files
that are not part of the compilation (e.g. test files). Files on the linter's
path that are not part of the project, and are not ignored by `ignorePatterns` 
in `.eslintrc` will generate a linting error.

## Web Packing

https://webpack.js.org/guides/typescript/

## Unit Testing & Code Coverage

Unit tests and code coverageuse [Jest](https://jestjs.io/en/). Babel is required
for TypeScript support.

Note that tests must manually include Jest globals to avoid linting errors:

```typescript
import { expect, test } from '@jest/globals'
```

For some reason Eslint will not resolve Jest globals otherwise. This will result
in spurious errors about unsafe calls and member access to the `Any` type.
