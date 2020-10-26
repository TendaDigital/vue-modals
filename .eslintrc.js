module.exports = {
    env: {
      browser: true,
      es2020: true
    },
    extends: ['plugin:vue/essential', 'standard', 'plugin:prettier/recommended'],
    parserOptions: {
      ecmaVersion: 11,
      parser: '@typescript-eslint/parser',
      sourceType: 'module'
    },
    plugins: ['vue', '@typescript-eslint', 'prettier'],
    rules: {
      'prettier/prettier': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error']
    },
    ignorePatterns: ['node_modules', 'dist']
  };
  