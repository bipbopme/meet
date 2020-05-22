module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  rules: {
    // disable the rule for all files
    '@typescript-eslint/explicit-function-return-type': 'off'
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
};
