import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // 🔧 Override regole troppo restrittive per il progetto
  {
    rules: {
      // Permetti any (necessario per DB, API, fetch, prototipo)
      "@typescript-eslint/no-explicit-any": "off",

      // Evita warning inutili su setState in useEffect
      "react-hooks/set-state-in-effect": "off",

      // Evita errori su apostrofi e virgolette nel JSX
      "react/no-unescaped-entities": "off",
    },
  },

  // Ignora cartelle di build
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
