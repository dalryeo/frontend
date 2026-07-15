// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const reactCompiler = require('eslint-plugin-react-compiler');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');
const tsEslint = require('@typescript-eslint/eslint-plugin');

module.exports = defineConfig([
  expoConfig,
  reactCompiler.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    ignores: ['dist/**', 'plugin/build/**'],
    plugins: {
      '@typescript-eslint': tsEslint,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'import/no-unresolved': 'off',
    },
  },
]);
