module.exports = {
	env: {
		browser: true,
		es2021: true,
		node: true,
	},
	extends: 'eslint:recommended',
	parserOptions: {
		ecmaVersion: 12,
		sourceType: 'module',
	},
	rules: {
		'no-console': 'warn',
		'no-mixed-spaces-and-tabs': ['error', 'smart-tabs'],
	},
}
