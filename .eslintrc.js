module.exports = {
  env: {
    browser: true,
    es2020: true,
  },
  extends: ["airbnb-base", "prettier"],
  parserOptions: {
    ecmaVersion: 11,
    sourceType: "module",
  },
  rules: {
    "no-console": "off",
    "no-underscore-dangle": "off",
    "import/prefer-default-export": "off",
    "dot-notation": "off",
    "consistent-return": "off",
    "prefer-destructuring": "off",
  },
};
