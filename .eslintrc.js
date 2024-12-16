const config = {
  extends: ["kentcdodds"],
  rules: {
    "valid-jsdoc": "off",
    "max-len": "off",
    "no-negated-condition": "off",
    complexity: "off",
    "default-case": "off",
    "no-use-before-define": "off",
    "@typescript-eslint/no-use-before-define": "off",
    "@typescript-eslint/no-unnecessary-condition": "off",
    "space-before-function-paren": [
      "error",
      {
        anonymous: "never",
        named: "never",
        asyncArrow: "always",
      },
    ],
    "import/no-import-module-exports": "off",
  },
};

module.exports = config;
