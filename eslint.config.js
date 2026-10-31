// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/**', 'test-results/**', 'playwright-report/**'],
  },
  {
    files: ['src/app/**/*.tsx', 'src/hooks/useExpenseForm.ts'],
    rules: {
      // SDK 58 adds this compiler recommendation. Existing forms synchronize
      // query results into editable state; keep it visible without blocking migration.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
]);
