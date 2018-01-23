module.exports = {
  "env": {
    "browser": true,
    "jquery": true
  },
  "globals": {
    "chrome": false,
  },
  "extends": "eslint:recommended",
  "rules": {
    "indent": [
      "error",
      2
    ],
    "no-console": "off",
    "linebreak-style": [
      "error",
      "unix"
    ],
    "quotes": [
      "error",
      "single"
    ],
    "semi": [
      "error",
      "always"
    ],
    "no-unused-vars": [
      "error",
      { "vars": "local", "args": "all", "argsIgnorePattern": "^_" }
    ]
  }
};
