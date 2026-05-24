import next from "eslint-config-next";

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  ...next,
  {
    ignores: ["dist/**", "coverage/**", "node_modules/**", ".next/**"],
  },
  {
    rules: {
      // Disable experimental rule that flags standard async data-fetching in useEffect
      "react-hooks/set-state-in-effect": "off",
    },
  },
];

export default eslintConfig;
