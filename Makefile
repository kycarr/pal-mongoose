.PHONY: clean
clean:
	rm -rf node_modules

.PHONY: format
format: node_modules/prettier
	npm run format

node_modules/mocha:
	npm ci

node_modules/prettier:
	npm ci

node_modules/eslint:
	npm ci

.PHONY: test
test: node_modules/mocha
	export NODE_PATH=$(shell pwd)/lib \
	&& npm test

.PHONY: test-all
test-all: test-audit test-format test-lint test

PHONY: test-audit
test-audit:
	npm run test:audit

.PHONY: test-format
test-format: node_modules/prettier
	npm run test:format

.PHONY: test-lint
test-lint: node_modules/eslint
	npm run test:lint