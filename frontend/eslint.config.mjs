import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';
import prettier from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';

export default tseslint.config(
  {
    // Configurações globais para todos os arquivos
    files: ['**/*.ts', '**/*.js'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname, // Usa import.meta.dirname para ESM
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest, // Se você usa Jest
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
      js.configs.recommended, // Regras JS recomendadas
      ...tseslint.configs.recommended, // Regras TS recomendadas
      ...tseslint.configs.stylistic, // Regras de estilo TS
      ...angular.configs.tsRecommended, // Regras Angular para TypeScript
      prettier, // Desativa regras ESLint que conflitam com Prettier
    ],
    rules: {
      // Regras de Prettier (garante que o Prettier seja aplicado)
      'prettier/prettier': 'error',

      // Regras TypeScript
      '@typescript-eslint/interface-name-prefix': 'off', // Geralmente não é uma boa prática forçar prefixos em interfaces
      '@typescript-eslint/explicit-function-return-type': 'off', // Pode ser útil em projetos grandes, mas desativado para flexibilidade
      '@typescript-eslint/explicit-module-boundary-types': 'off', // Mesma razão que a anterior
      '@typescript-eslint/no-explicit-any': 'off', // Cuidado: 'any' deve ser evitado, mas pode ser permitido em casos específicos
      '@typescript-eslint/no-non-null-assertion': 'off', // Pode ser útil em certos cenários, mas cuidado
      '@typescript-eslint/no-inferrable-types': 'off', // Pode ser útil para clareza, mas desativado por padrão
      '@typescript-eslint/no-empty-function': 'off', // Permite funções vazias
      '@typescript-eslint/consistent-indexed-object-style': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // Avisa sobre variáveis não usadas (ignorando aquelas que começam com '_')

      // Regras Angular
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app', // Prefixo padrão para diretivas
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app', // Prefixo padrão para componentes
          style: 'kebab-case',
        },
      ],
      '@angular-eslint/no-empty-lifecycle-method': 'off', // Pode ser útil para prototipagem rápida

      // Regras gerais
      'no-console': ['warn', { allow: ['warn', 'error'] }], // Permite console.warn e console.error, mas adverte sobre outros
      'prefer-arrow-callback': 'error', // Garante o uso de arrow functions para callbacks
      'sort-imports': 'off', // Desativado em favor de simple-import-sort
      'import/order': 'off', // Desativado em favor de simple-import-sort

      // Regras de ordenação de importações com simple-import-sort
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // Pacotes 'angular' primeiro
            ['^@angular', '^angular', '^rxjs', '^zone.js'],
            // Pacotes externos
            ['^@?\\w'],
            // Aliases de caminho (ex: @app/, @shared/)
            ['^(@app|@env|@core|@shared)(/.*|$)', '^\\.'],
            // Importações relativas
            ['^\\.\\.(?!/?$)', '^\\.\\./?$', '^\\./(?=[^/]*$)', '^\\./'],
            // CSS/SCSS
            ['^.+\\.s?css$'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error', // Ordena exports
    },
  },
  {
    // Configurações para arquivos de template HTML
    files: ['**/*.html'],
    extends: [
      ...angular.configs.templateRecommended, // Regras recomendadas para templates Angular
      ...angular.configs.templateAccessibility, // Regras de acessibilidade para templates Angular
    ],
    rules: {
      // Regras específicas para HTML aqui
      '@angular-eslint/template/no-negated-async': 'error', // Boa prática para evitar ! (async pipe)
      '@angular-eslint/template/banana-in-box': 'error', // Garante que [(bananaInBox)] seja usado corretamente
      '@angular-eslint/template/no-call-expression': 'error', // Evita chamadas de função complexas em templates
      '@angular-eslint/template/no-duplicate-attributes': 'error', // Evita atributos duplicados
      '@angular-eslint/template/no-invalid-html': 'error', // Evita HTML inválido
      '@angular-eslint/template/no-invalid-attribute': 'error', // Evita atributos inválidos
      '@angular-eslint/template/no-missing-attribute': 'error', // Evita atributos faltantes
      '@angular-eslint/template/no-missing-required-input': 'error', // Evita inputs obrigatórios faltantes
      '@angular-eslint/template/no-missing-required-output': 'error', // Evita outputs obrigatórios faltantes
    },
  },
  {
    // Ignorar arquivos de configuração ESLint e Node.js
    ignores: ['.eslintrc.js', 'dist/', 'node_modules/'],
  },
);
