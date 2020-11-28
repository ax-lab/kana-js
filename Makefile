.PHONY: run build test clean lint check

# Run the TypeScript application directly,
run:
	@npm start -s

# Build output files in `build`,
build:
	npm run build

# Run tests
test:
	npm test

# Delete build directory and files,
clean:
	rm -rf build

# Runs eslint on TypeScript files.
lint:
	npm run lint

# Runs all available checks, including linting.
check:
	npm run check
