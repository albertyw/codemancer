import globals from 'globals';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';

let globalVars = globals.browser;
globalVars = {...globalVars, ...{
  'context': true,
  'describe': true,
  'it': true,
  'before': true,
  'after': true,
  'beforeEach': true,
  'afterEach': true,
  'beforeAll': true,
  'afterAll': true,
}};

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    'plugins': {
      '@stylistic': stylistic,
    },
    'rules': {
      'indent': [
        'error',
        2
      ],
      'linebreak-style': [
        'error',
        'unix'
      ],
      'quotes': [
        'error',
        'single'
      ],
      'semi': [
        'error',
        'always'
      ],
    },
  },
  {
    'linterOptions': {
      'reportUnusedDisableDirectives': 'error',
    },
    'rules': {
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
    'languageOptions': {
      'ecmaVersion': 2022,
      'sourceType': 'module',
      'globals': globalVars,
    },
  },
  {
    // Global ignores
    'ignores': [
      'built',
      '**/*.min.js',
      'dist',
      '.coverage',
    ],
  },
);
