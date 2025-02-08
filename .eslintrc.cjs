const pluginJs = require("@eslint/js");
const globals = require("globals");

module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:prettier/recommended",
    "standard"
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["react", "jsx-a11y", "import", "prettier"],
  rules: {
    "prettier/prettier": ["error"],
    "react/react-in-jsx-scope": "off",
    "no-console": "warn",
  },
};
