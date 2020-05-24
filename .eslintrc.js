module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ['plugin:vue/essential', 'eslint:recommended'],
  rules: {
    "no-console": "warn"
  },
  parserOptions: {
    parser: 'babel-eslint',
    ecmaVersion: 2018,
    ecmaFeatures: { legacyDecorators: true },
  },
};
