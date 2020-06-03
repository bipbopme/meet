module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "prettier", "sort-imports-es6-autofix"],
  env: {
    browser: true,
    node: true
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
    "prettier/@typescript-eslint"
  ],
  ignorePatterns: ["dist/*"],
  rules: {
    "prettier/prettier": "error",
    "no-trailing-spaces": "error",
    "eol-last": ["error", "always"],
    "sort-imports-es6-autofix/sort-imports-es6": "error"
  },
  overrides: [
    {
      files: ["*.js"],
      rules: {
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-var-requires": "off"
      }
    }
  ],
  settings: {
    react: {
      version: "detect"
    }
  }
};
