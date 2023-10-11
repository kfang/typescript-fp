/* eslint-env node */
module.exports = {
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended-type-checked',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      project: './tsconfig.eslint.json',
    },
    plugins: ['@typescript-eslint'],
    root: true,
    rules: {
      '@typescript-eslint/restrict-plus-operands': 'warn',
      '@typescript-eslint/unbound-method': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
    },
};
