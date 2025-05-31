import antfu from '@antfu/eslint-config';
import { FlatCompat } from '@eslint/eslintrc';
import oxlint from 'eslint-plugin-oxlint';

const compat = new FlatCompat();
export default antfu(
    {
        formatters: true,
        stylistic: {
            indent: 4,
            semi: true,
        },

        ignores: [
            'out',
            'node_modules',
            'changelog',
        ],

        yaml: false,
    },
    {
        rules: {
            'antfu/no-top-level-await': ['off'],
            'style/max-len': ['error', 150],
            curly: ['error', 'all'],
            'import/order': 'off',
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            'node/no-process-env': 'off',
            'node/prefer-global/process': 'off',
            'perfectionist/sort-imports': ['error', {
                ignoreCase: true,
                newlinesBetween: 'always',
                order: 'asc',
                tsconfigRootDir: '.',
                type: 'alphabetical',
                groups: [
                    'external-type',
                    'builtin-type',
                    'internal-type',
                    'parent-type',
                    'sibling-type',
                    'index-type',
                    'external',
                    'builtin',
                    'internal',
                    ['parent', 'sibling'],
                    'index',
                ],
                internalPattern: ['^#'],
            }],
            'perfectionist/sort-classes': ['error', {
                ignoreCase: true,
                order: 'asc',
                type: 'alphabetical',
                groups: [
                    'index-signature',
                    'static-property',
                    'static-block',
                    ['protected-property', 'protected-accessor-property'],
                    ['private-property', 'private-accessor-property'],
                    ['property', 'accessor-property'],
                    'constructor',
                    'static-method',
                    'protected-method',
                    'private-method',
                    'method',
                    ['get-method', 'set-method'],
                    'unknown',
                ],
            }],
            'style/brace-style': ['error', '1tbs'],
            'style/comma-dangle': ['error', 'always-multiline'],
            'style/eol-last': ['error', 'always'],
            'style/linebreak-style': ['error', 'unix'],
            'style/quote-props': ['error', 'as-needed'],
            'style/quotes': ['error', 'single', { avoidEscape: true }],
            'ts/consistent-type-definitions': 'off',
            'unused-imports/no-unused-imports': 'warn',
        },
    },
    {
        files: ['**/ui/**/*.{ts,vue}', '**/*.json'],

        rules: {
            'style/max-len': 'off',
        },
    },
    ...compat.config({
        extends: ['plugin:tailwindcss/recommended'],

        rules: {
            'tailwindcss/no-custom-classname': 'off',
        },

        ignorePatterns: [
            'out',
            'node_modules',
            'changelog',
        ],
    }),
    ...oxlint.configs['flat/recommended'],
);
