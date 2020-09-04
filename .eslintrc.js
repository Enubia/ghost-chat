module.exports = {
  root: true,
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    extraFileExtensions: ['.vue'],
    project: './tsconfig.eslint.json',
    parser: '@typescript-eslint/parser',
  },
  plugins: ['@typescript-eslint', 'unicorn', 'mocha', 'import', 'prettier', 'vue'],
  env: {
    jest: true,
    mocha: true,
    browser: true,
    node: true,
  },
  globals: {
    $nuxt: true,
  },
  extends: [
    'airbnb-typescript/base',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/strongly-recommended',
    'plugin:vue-scoped-css/recommended',
    'prettier',
    'prettier/standard',
    'prettier/@typescript-eslint',
    'prettier/vue',
  ],
  settings: {
    'import/core-modules': ['vue'],
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
      webpack: {},
    },
    'import/ignore': ['node_modules', '\\.(coffee|scss|css|less|hbs|svg|json)$'],
  },
  rules: {
    'prettier/prettier': ['error'],
    'max-len': 0,
    'import/order': 'error',
    'import/first': 'error',
    'import/no-mutable-exports': 'error',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-console': 'warn',
    'prefer-const': [
      'error',
      {
        destructuring: 'any',
        ignoreReadBeforeAssign: false,
      },
    ],
    'no-lonely-if': 'error',
    'import/no-unresolved': 'off',
    'no-underscore-dangle': 0,
    'object-curly-spacing': 0,
    'prefer-object-spread': 'error',
    'no-param-reassign': [
      'off',
      {
        props: true,
        ignorePropertyModificationsFor: [
          'state',
          'acc',
          'e',
          'ctx',
          'req',
          'request',
          'res',
          'response',
          '$scope',
        ],
      },
    ],
    'no-throw-literal': 'warn',
    curly: ['error', 'all'],
    'dot-notation': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'no-useless-rename': 'error',
    'no-restricted-syntax': ['error', 'ForInStatement', 'LabeledStatement', 'WithStatement'],
    'require-atomic-updates': 0,
    'no-await-in-loop': 0,
    'class-methods-use-this': 0,
    'no-useless-constructor': 0,
    'import/prefer-default-export': 0,
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-parameter-properties': 0,
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'interface',
        format: ['PascalCase'],
        prefix: ['I'],
        filter: {
          regex:
            '^(Window|Vue|Context|NuxtAppOptions|VueConstructor|Navigator|Process|AxiosRequestConfig|Chainable)$',
          match: false,
        },
      },
    ],
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/explicit-member-accessibility': 0,
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        mjs: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],

    /**********************/
    /*   Vue Rules    */
    /**********************/
    'vue-scoped-css/require-scoped': ['error'],
    'vue/require-default-prop': 'warn',
    'vue/no-unused-components': [
      'warn',
      {
        ignoreWhenBindingPresent: true,
      },
    ],
    'vue/attributes-order': 'error',
    'vue/name-property-casing': ['error', 'PascalCase'],
    'vue/component-name-in-template-casing': [
      'error',
      'PascalCase',
      {
        ignores: ['nuxt-link', 'nuxt', 'no-ssr', 'nuxt-child', 'nuxt-error', 'nuxt-loading'],
      },
    ],

    /**********************/
    /*   Unicorn Rules    */
    /**********************/
    'unicorn/error-message': 'error',
    'unicorn/escape-case': 'error',
    'unicorn/no-array-instanceof': 'error',
    'unicorn/no-new-buffer': 'error',
    'unicorn/no-unsafe-regex': 'off',
    'unicorn/number-literal-case': 'error',
    'unicorn/prefer-exponentiation-operator': 'error',
    'unicorn/prefer-includes': 'error',
    'unicorn/prefer-starts-ends-with': 'error',
    'unicorn/prefer-text-content': 'error',
    'unicorn/prefer-type-error': 'error',
    'unicorn/throw-new-error': 'error',
  },
};
