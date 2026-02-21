import js from '@eslint/js';
import angular from 'angular-eslint';
import prettier from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    files: ['**/*.ts', '**/*.js'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      angular,
      prettier: prettierPlugin,
      'simple-import-sort': simpleImportSort,
    },
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
      prettier,
    ],
    rules: {
      'prettier/prettier': 'error',
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/consistent-indexed-object-style': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@angular-eslint/no-output-native': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
      '@angular-eslint/no-empty-lifecycle-method': 'off',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-arrow-callback': 'error',
      'sort-imports': 'off',
      'import/order': 'off',
      'simple-import-sort/imports': [
        'off',
        {
          groups: [
            // 1. Side effect imports (ex: import 'reflect-metadata')
            ['^\\u0000'],
            // 2. Framework & Third-party packages (Angular, RxJS, etc.)
            ['^@angular', '^rxjs', '^ngx-mask', '^@?\\w'],
            // 3. Internal absolute imports (aliases like app/...)
            ['^app/'],
            // 4. Relative imports - Parent imports (..) then same-folder imports (.)
            ['^\\.\\.(?!/?$)', '^\\.\\./?$', '^\\./(?=[^/]*$)', '^\\./?$'],
            // 5. Style imports
            ['^.+\\.s?css$'],
          ],
        },
      ],
      'simple-import-sort/exports': 'off',
    },
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
    rules: {
      '@angular-eslint/template/no-negated-async': 'error',
      '@angular-eslint/template/banana-in-box': 'error',
      '@angular-eslint/template/no-call-expression': 'error',
      '@angular-eslint/template/no-duplicate-attributes': 'error',
      '@angular-eslint/template/no-invalid-html': 'error',
      '@angular-eslint/template/no-invalid-attribute': 'error',
      '@angular-eslint/template/no-missing-attribute': 'error',
      '@angular-eslint/template/no-missing-required-input': 'error',
      '@angular-eslint/template/no-missing-required-output': 'error',
    },
  },
  {
    ignores: ['.eslintrc.js', 'dist/', 'node_modules/'],
  },
);
