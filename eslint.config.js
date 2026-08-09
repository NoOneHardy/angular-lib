// @ts-check
/* eslint-disable @typescript-eslint/no-require-imports */
const eslint = require('@eslint/js')
const tslint = require('typescript-eslint')
const angular = require('angular-eslint')

module.exports = tslint.config({
  files: ['**/*.ts', '**/*.js'],
  extends: [
    eslint.configs.recommended,
    ...tslint.configs.recommended, ...tslint.configs.stylistic,
    ...angular.configs.tsRecommended
  ],
  processor: angular.processInlineTemplates,
  rules: {
    '@angular-eslint/component-class-suffix': [
      'error', {
        suffixes: ['Component']
      }
    ],
    '@angular-eslint/component-selector': [
      'error', {
        type: 'element',
        prefix: 'n1h',
        style: 'kebab-case'
      }
    ],
    '@angular-eslint/directive-selector': [
      'error', {
        type: 'attribute',
        prefix: 'n1h',
        style: 'camelCase'
      }
    ],
    semi: [
      'error',
      'never'
    ],
    quotes: [
      'error',
      'single'
    ],
    indent: [
      'error',
      2,
      {
        SwitchCase: 1
      }
    ],
    '@typescript-eslint/no-unused-vars': [
      'error', {
        argsIgnorePattern: '^_'
      }
    ]
  }
}, {
  files: ['**/*.html'],
  extends: [
    angular.configs.templateRecommended
  ]
})
