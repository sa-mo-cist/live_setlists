const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// "authenticate"という名前で、パスワードをチェックする関数を作成
exports.authenticate = functions.https.onCall(async (data, context) => {
  // Webサイトから送られてきたパスワードを受け取る
  const password = data.password;

  // ▼▼▼ パスワードと役割(role)の対応表 ▼▼▼
  // この部分はサーバーにしかないので安全です。ご自身の好きなパスワードに変更してください。
  const passwords = {
    "admin-pass-123": "admin", // 管理者用のパスワード
    "performer-pass-456": "editor", // 出演者用のパスワード
    // "audience-pass-789": "audience", // 観客用パスワードは不要なら消してもOK
    "event-qr-code": "audience", // QRコード用の合言葉
  };

  const role = passwords[password];

  // もしパスワードが対応表になかったら、エラーを返す
  if (!role) {
    throw new functions.https.HttpsError(
        "unauthenticated", // エラーの種類
        "パスワードが正しくありません。", // エラーメッセージ
    );
  }

  // パスワードが正しければ、その人専用の一時的な通行証（カスタムトークン）を発行
  const uid = `user_${Date.now()}`; // ユーザーを識別するための一時的なID
  const customToken = await admin.auth().createCustomToken(uid, {role: role});

  // 通行証をWebサイト側に返す
  return {token: customToken};
});
