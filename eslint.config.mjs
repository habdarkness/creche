import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",       // ignora uso de 'any'
      "@typescript-eslint/no-unused-vars": "warn",      // apenas aviso, não erro
      "react-hooks/exhaustive-deps": "warn",            // aviso sobre useEffect
      "@typescript-eslint/ban-ts-comment": "off",       // se usar ts-ignore
      "@typescript-eslint/no-non-null-assertion": "off" // se usar !
    },
  },
];

export default eslintConfig;
