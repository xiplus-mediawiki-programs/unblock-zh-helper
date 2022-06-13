/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  root: true,
  extends: ['plugin:vue/vue3-essential', 'eslint:recommended', '@vue/eslint-config-prettier'],
  ignorePatterns: ['*.snap'],
  rules: {
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        printWidth: 120,
      },
    ],
  },
  env: {
    'vue/setup-compiler-macros': true,
  },
  globals: {
    $: 'readonly',
    Morebits: 'readonly',
    mw: 'readonly',
  },
};
