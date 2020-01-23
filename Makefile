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

.PHONY: test
test: node_modules/mocha
	export NODE_PATH=$(shell pwd)/lib \
	&& npm test

.PHONY: test-all
test-all: test-format test

.PHONY: test-format
test-format: node_modules/prettier
	npm run test:format