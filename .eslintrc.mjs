/** ====================================================================================
 *  FICHIER          : .eslintrc.mjs
 *  AUTEUR           : Trackozor
 *  VERSION          : 1.3
 *  DATE DE CRÉATION : 12/02/2025
 *  DERNIÈRE MODIF.  : 26/02/2025
 *  DESCRIPTION      : Configuration ESLint optimisée pour un projet en mode ESM.
 *                     - Compatible avec ES Modules (`.mjs`).
 *                     - Intégration de Prettier, React, JSX-A11y, et Import.
 *                     - Gestion des imports absolus.
 * ==================================================================================== */

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  env: {
    browser: true, // Active les variables globales du navigateur (`window`, `document`, etc.)
    es2021: true,  // Active ES2021
    node: true     // Active les variables globales de Node.js
  },
  extends: [
    "eslint:recommended",         // Règles de base d'ESLint
    "plugin:react/recommended",   // Règles recommandées pour React
    "plugin:jsx-a11y/recommended", // Accessibilité JSX
    "plugin:import/errors",       // Vérification des erreurs d'import
    "plugin:import/warnings",     // Vérification des avertissements d'import
    "plugin:prettier/recommended" // Intégration de Prettier
  ],
  parserOptions: {
    ecmaVersion: "latest",  // Utilise la dernière version de JavaScript
    sourceType: "module",   // Active l'utilisation des imports `import/export`
  },
  settings: {
    react: {
      version: "detect" // Auto-détection de la version de React utilisée
    },
    "import/resolver": {
      node: {
        paths: [path.resolve(__dirname, "src")], // Gestion des imports absolus
        extensions: [".js", ".jsx", ".ts", ".tsx"]
      },
    },
  },
  plugins: ["react", "jsx-a11y", "import", "prettier"],
  rules: {
    "prettier/prettier": ["error"],     // Force le respect des règles Prettier
    "react/react-in-jsx-scope": "off",  // Désactive l'obligation d'importer `React` (React 17+)
    "no-console": "warn",               // Affiche un warning si `console.log` est utilisé
    "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }], // Ignore les variables inutilisées commençant par `_`
    "import/order": [
      "error",
      {
        "groups": ["builtin", "external", "internal"],
        "pathGroups": [
          {
            "pattern": "react",
            "group": "external",
            "position": "before"
          }
        ],
        "pathGroupsExcludedImportTypes": ["react"],
        "newlines-between": "always",
        "alphabetize": { "order": "asc", "caseInsensitive": true }
      }
    ],
  },
};
