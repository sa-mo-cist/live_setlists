const {onCall, HttpsError} = require("firebase-functions/v2/https");
const {initializeApp} = require("firebase-admin/app");
const {getAuth} = require("firebase-admin/auth");

initializeApp();

exports.authenticate = onCall(async (request) => {
  const password = request.data.password;
  const passwords = {
    "admin": "admin",
    "performer": "editor",
    "event-qr-code": "audience",
  };
  const role = passwords[password];
  if (!role) {
    throw new HttpsError("unauthenticated", "パスワードが正しくありません。");
  }
  const uid = `user_${Date.now()}`;
  const customToken = await getAuth().createCustomToken(uid, {role});
  return {token: customToken};
});
