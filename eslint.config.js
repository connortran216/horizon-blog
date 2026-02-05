import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  // Recommended base configuration
  js.configs.recommended,

  // TypeScript ESLint recommended configuration
  ...tseslint.configs.recommended,

  {
    // Files to lint
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],

    // Language options
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },

    // Rules
    rules: {
      // Possible Problems
      'no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      'no-console': 'off',

      // Suggestions
      'prefer-const': 'warn',
      'no-var': 'error',

      // Layout & Formatting
      'indent': ['error', 2],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
    },
  },

  {
    // TypeScript-specific rules
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Disable base rules that are covered by TypeScript ESLint
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
    },
  },

  {
    // Ignore patterns
    ignores: [
      'node_modules/',
      '.yarn/',
      '.pnp.*',
      'dist/',
      'build/',
      '*.min.js',
    ],
  },
];
