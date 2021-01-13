module.exports = {
  root: true,
  parserOptions: {
    project: './tsconfig.json',
    extraFileExtensions: ['.vue']
  },
  extends: ['@hokify/eslint-config-vue'],
};
