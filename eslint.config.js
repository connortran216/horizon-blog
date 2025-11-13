import js from '@eslint/js';
import globals from 'globals';

export default [
  // Recommended base configuration
  js.configs.recommended,
  
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
    // Ignore patterns
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      '*.min.js',
    ],
  },
];