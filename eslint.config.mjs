import nextConfig from "eslint-config-next";
import prettierConfig from "eslint-config-prettier/flat";

export default [
  {
    ignores: [
      "**/.next/**",
      "**/.turbo/**",
      "**/dist/**",
      "**/node_modules/**",
    ],
  },
  ...nextConfig,
  {
    rules: {
      "@next/next/no-html-link-for-pages": "off",
    },
  },
  prettierConfig,
];
