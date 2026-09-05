import base from "@repo/config/eslint.base.mjs";

export default [
  ...base,
  {
    ignores: ["dist/**", ".astro/**"],
  },
];
