module.exports = {
  "env": {
    "es2021": true,
    "node": true,
  },
  "extends": [
    "eslint:recommended",
    "google",
  ],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
  },
  "rules": {
    "linebreak-style": "off", // 改行コードのチェックを無効化
    "quotes": ["error", "double"],
    "max-len": ["error", {"code": 120}],
    "require-jsdoc": "off",
    "valid-jsdoc": "off",
    "new-cap": "off",
    "camelcase": "off",
    "no-unused-vars": "warn",
    "indent": "off",
  },
};
