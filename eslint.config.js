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
