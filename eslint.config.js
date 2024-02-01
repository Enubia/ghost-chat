const antfu = require('@antfu/eslint-config').default;

module.exports = antfu({
    rules: {
        'style/comma-dangle': ['error', 'always-multiline'],
        'no-console': ['warn', { allow: ['warn', 'error'] }],
        'node/prefer-global/process': 'off',
        'style/brace-style': ['error', '1tbs'],
        'style/eol-last': ['error', 'always'],
        'style/quote-props': ['error', 'as-needed'],
        'style/quotes': ['error', 'single', { avoidEscape: true }],
        'vue/block-order': ['error', {
            order: [['template', 'script'], 'style'],
        }],
        curly: ['error', 'all'],
    },

    stylistic: {
        indent: 4,
        semi: true,
    },

    ignores: [
        '.vscode',
        '.husky',
        'dist-electron',
    ],

    formatters: {
        css: true,
        html: true,
    },

    yaml: false,
});
