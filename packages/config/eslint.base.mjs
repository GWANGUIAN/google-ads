// Shared ESLint flat config base for all apps in this monorepo.
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.worker },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["**/*.config.{js,mjs,cjs,ts}", "**/wrangler.config.*"],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    ignores: ["dist/**", ".astro/**", "node_modules/**"],
  },
];
