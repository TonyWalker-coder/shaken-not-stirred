export default [
  {
    // 🚫 Ignore EVERYTHING that isn't your project JS
    ignores: [
      ".venv/**",
      "**/site-packages/**",
      "**/django/**",
      "**/django/**/static/admin/**",
      "**/vendor/**",
      "**/jquery/**",
      "**/node_modules/**"
    ]
  },

  {
    // ✅ Only lint YOUR JavaScript files
    files: ["static/js/**/*.js"],

    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        alert: "readonly",
        confirm: "readonly",
        prompt: "readonly",
        fetch: "readonly",
        FormData: "readonly",
        Event: "readonly",
        location: "readonly",
        performance: "readonly",
        requestAnimationFrame: "readonly",
        setTimeout: "readonly"
      }
    },

    rules: {
      "no-unused-vars": "warn",
      "no-undef": "warn"
    }
  }
];
