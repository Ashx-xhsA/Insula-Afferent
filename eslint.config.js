import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        process: 'readonly',
        console: 'readonly',
        module: 'writable',
        require: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        exports: 'writable',
        global: 'readonly',
      },
    },
    rules: {},
  },
  {
    files: ['client/src/**/*.{js,jsx}'],
    languageOptions: {
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        fetch: 'readonly',
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
  },
];
