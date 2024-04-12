const antfu = require('@antfu/eslint-config').default;

module.exports = antfu({
    rules: {
        'no-console': ['warn', { allow: ['warn', 'error'] }],
        'node/prefer-global/process': 'off',
        'style/brace-style': ['error', '1tbs'],
        'style/comma-dangle': ['error', 'always-multiline'],
        'style/eol-last': ['error', 'always'],
        'style/linebreak-style': ['error', 'unix'],
        'style/quote-props': ['error', 'as-needed'],
        'style/quotes': ['error', 'single', { avoidEscape: true }],
        curly: ['error', 'all'],
        'no-new': 'off',
        'unused-imports/no-unused-imports': 'warn',
    },

    stylistic: {
        indent: 4,
        semi: true,
    },

    ignores: [
        '.vscode',
        '.husky',
        'dist',
        'dist-electron',
        'node_modules',
    ],

    yaml: false,
});
