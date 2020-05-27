module.exports = {
  root: true,
  // extends: ['@hokify/eslint-config-vue'],
  parserOptions: {
    project: './tsconfig.eslint.json',
    extraFileExtensions: ['.vue'],
  },
  rules: {
    'no-console': 0,
    'consistent-return': 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/camelcase': 0,
    '@typescript-eslint/interface-name-prefix': 0,
    '@typescript-eslint/ban-ts-comment': 0,
  },
};
