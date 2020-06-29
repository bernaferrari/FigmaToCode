module.exports = {
    parser: "@typescript-eslint/parser",
    env: {
        "browser": true
    },
    plugins: [
        "@typescript-eslint", "prettier", "jest"
    ],
    extends: [
        "plugin:jest/recommended",
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended", // Uses the recommended rules from the @typescript-eslint/eslint-plugin
        "prettier", // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
        "plugin:prettier/recommended" // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
    ],
    parserOptions: {
        "ecmaVersion": 11,
        "sourceType": "module"
    },
    rules: {
        "prettier/prettier": "error",
        "@typescript-eslint/ban-ts-comment": 0,
        "@typescript-eslint/no-inferrable-types": 0,
    }
};
