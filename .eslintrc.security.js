/**
 * Configuração ESLint com Regras de Segurança Avançadas
 * Inclui regras específicas para detectar vulnerabilidades comuns
 */

module.exports = {
  extends: [
    './.eslintrc.js', // Configuração base existente
    'plugin:security/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking'
  ],
  plugins: [
    'security',
    'no-secrets',
    'anti-trojan-source'
  ],
  rules: {
    // Regras de segurança críticas
    'security/detect-eval-with-expression': 'error',
    'security/detect-non-literal-fs-filename': 'warn',
    'security/detect-non-literal-regexp': 'warn',
    'security/detect-non-literal-require': 'error',
    'security/detect-possible-timing-attacks': 'warn',
    'security/detect-pseudoRandomBytes': 'error',
    'security/detect-unsafe-regex': 'error',
    'security/detect-buffer-noassert': 'error',
    'security/detect-child-process': 'warn',
    'security/detect-disable-mustache-escape': 'error',
    'security/detect-new-buffer': 'error',
    'security/detect-no-csrf-before-method-override': 'error',
    'security/detect-object-injection': 'error',

    // Prevenir vazamento de informações sensíveis
    'no-secrets/no-secrets': ['error', {
      'tolerance': 5,
      'additionalRegexes': {
        'Firebase API Key': 'AIza[0-9A-Za-z\\-_]{35}',
        'PostgreSQL Connection': 'postgres://[^\\s]*',
        'JWT Token': 'eyJ[A-Za-z0-9-_=]+\\.[A-Za-z0-9-_=]+\\.?[A-Za-z0-9-_.+/=]*',
        'Generic API Key': '[a-zA-Z0-9]{32,}'
      }
    }],

    // Detectar caracteres suspeitos (Trojan Source)
    'anti-trojan-source/no-bidi': 'error',

    // Regras de qualidade de código com foco em segurança
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
    'no-caller': 'error',
    'no-extend-native': 'error',
    'no-extra-bind': 'error',
    'no-invalid-this': 'error',
    'no-multi-spaces': 'error',
    'no-multi-str': 'error',
    'no-new-wrappers': 'error',
    'no-throw-literal': 'error',
    'no-unused-expressions': 'error',
    'no-useless-call': 'error',
    'no-useless-concat': 'error',
    'no-void': 'error',
    'prefer-promise-reject-errors': 'error',

    // Regras específicas para Node.js/Backend
    'no-process-env': 'warn', // Avisar sobre uso direto de process.env
    'no-process-exit': 'warn', // Avisar sobre process.exit()
    'no-sync': 'warn', // Avisar sobre operações síncronas

    // TypeScript específico para segurança
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unsafe-assignment': 'warn',
    '@typescript-eslint/no-unsafe-call': 'warn',
    '@typescript-eslint/no-unsafe-member-access': 'warn',
    '@typescript-eslint/no-unsafe-return': 'warn',
    '@typescript-eslint/restrict-template-expressions': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',

    // Regras customizadas para o projeto
    'no-console': ['warn', { 
      allow: ['warn', 'error'] 
    }],
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-arrow-callback': 'error',
    'prefer-template': 'error',
    'template-curly-spacing': 'error',
    'arrow-spacing': 'error',
    'generator-star-spacing': 'error',
    'yield-star-spacing': 'error',

    // Complexidade e qualidade
    'complexity': ['warn', { max: 10 }],
    'max-depth': ['warn', { max: 4 }],
    'max-lines': ['warn', { max: 300, skipBlankLines: true }],
    'max-lines-per-function': ['warn', { max: 50, skipBlankLines: true }],
    'max-nested-callbacks': ['warn', { max: 3 }],
    'max-params': ['warn', { max: 5 }],
    'max-statements': ['warn', { max: 20 }],

    // Prevenção de bugs comuns
    'array-callback-return': 'error',
    'consistent-return': 'error',
    'default-case': 'error',
    'eqeqeq': ['error', 'always'],
    'guard-for-in': 'error',
    'no-alert': 'error',
    'no-case-declarations': 'error',
    'no-else-return': 'error',
    'no-empty-function': 'warn',
    'no-empty-pattern': 'error',
    'no-fallthrough': 'error',
    'no-floating-decimal': 'error',
    'no-global-assign': 'error',
    'no-implicit-coercion': 'error',
    'no-implicit-globals': 'error',
    'no-lone-blocks': 'error',
    'no-loop-func': 'error',
    'no-magic-numbers': ['warn', { 
      ignore: [-1, 0, 1, 2, 100, 1000],
      ignoreArrayIndexes: true,
      enforceConst: true
    }],
    'no-redeclare': 'error',
    'no-return-assign': 'error',
    'no-self-assign': 'error',
    'no-self-compare': 'error',
    'no-sequences': 'error',
    'no-unmodified-loop-condition': 'error',
    'no-unused-labels': 'error',
    'no-useless-escape': 'error',
    'radix': 'error',
    'require-await': 'error',
    'wrap-iife': 'error',
    'yoda': 'error'
  },
  overrides: [
    {
      // Configurações específicas para arquivos de teste
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      rules: {
        'no-magic-numbers': 'off',
        'max-lines-per-function': 'off',
        'max-statements': 'off',
        'security/detect-non-literal-fs-filename': 'off'
      }
    },
    {
      // Configurações específicas para arquivos de configuração
      files: ['**/*.config.js', '**/*.config.ts', '**/vite.config.ts'],
      rules: {
        'no-process-env': 'off',
        'security/detect-non-literal-require': 'off'
      }
    },
    {
      // Configurações para scripts
      files: ['scripts/**/*.js', 'scripts/**/*.ts'],
      rules: {
        'no-process-env': 'off',
        'no-process-exit': 'off',
        'no-console': 'off',
        'security/detect-child-process': 'off',
        'security/detect-non-literal-fs-filename': 'off'
      }
    }
  ],
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json'
      }
    }
  },
  env: {
    node: true,
    browser: true,
    es2022: true
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json'
  }
};