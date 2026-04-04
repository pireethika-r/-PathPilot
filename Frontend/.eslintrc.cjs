module.exports = {
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module", // ✅ THIS LINE FIXES YOUR ERROR
    ecmaFeatures: {
      jsx: true
    }
  },
  env: {
    browser: true,
    es2021: true
  },
  plugins: ["react", "react-hooks"],
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  settings: {
    react: {
      version: "detect"
    }
  }
};