import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";

// Define the ESLint configuration
export default [
  {
    files: ["**/*.{js,mjs,cjs,ts}"], // Apply to JavaScript and TypeScript files
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parser: "@typescript-eslint/parser",
      parserOptions: {
        ecmaVersion: 2021, // Latest ECMAScript version
        sourceType: "module", // Support for ES Modules
      },
    },
    plugins: ["@typescript-eslint"],
    extends: [
      "eslint:recommended", // Base recommended ESLint rules
      "plugin:@typescript-eslint/recommended", // Recommended TypeScript rules
      pluginJs.configs.recommended, // Recommended JavaScript rules
      ...tseslint.configs.recommended, // Recommended TypeScript-eslint rules
    ],
    rules: {
      // Define custom rules or override existing ones here
    },
  },
];
