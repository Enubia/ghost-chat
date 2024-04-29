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
        'unused-imports/no-unused-imports': 'warn',
        'perfectionist/sort-imports': ['error', {
            type: 'natural',
            order: 'asc',
            groups: [
                'customTypes',
                ['builtin-type', 'type'],
                'builtin',
                'external',
                'internal-type',
                'internal',
                ['parent-type', 'sibling-type', 'index-type'],
                ['parent', 'sibling', 'index'],
                'side-effect',
                'object',
                'style',
                'unknown',
            ],
            'newlines-between': 'always',
            'internal-pattern': [
                '@components/**',
                '@shared/**',
                '@utils/**',
            ],
        }],
    },

    stylistic: {
        indent: 4,
        semi: true,
    },

    ignores: [
        '.vscode',
        'out',
        'node_modules',
    ],

    yaml: false,
});
