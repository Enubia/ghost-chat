module.exports = {
  root: true,
  parserOptions: {
    project: './tsconfig.json',
    extraFileExtensions: ['.vue']
  },
  extends: ['@hokify/eslint-config-vue'],
  rules: {
    'import/extensions': 'off',
    'vue/name-property-casing': 'off',
    'vue/experimental-script-setup-vars': 'off'
  }
};
