import eslint from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import prettier from "eslint-plugin-prettier";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  // 基础 ESLint 配置
  eslint.configs.recommended,

  // Prettier 配置
  eslintConfigPrettier,

  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      prettier: prettier,
    },
    rules: {
      "prettier/prettier": "error",
      "no-case-declarations": "off",
      "no-constant-condition": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-var-requires": "off",
        "react/react-in-jsx-scope": "off",
      'prettier/prettier': ['error', {
      // 方案1：完全忽略换行符检查
      endOfLine: 'auto',
      
      // 或者方案2：明确指定使用 windows 风格的换行符
      // endOfLine: 'crlf',
    }],
    },
  },
];
