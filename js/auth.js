// /**
//  * ページをパスワードで保護する
//  * @param {string} authKey - localStorageに保存するためのユニークなキー
//  * @param {string} correctPassword - 正しいパスワード
//  * @param {function} successCallback - 認証成功時に実行される関数
//  */
// function handleAuth(authKey, correctPassword, successCallback) {
//   // 1. 認証済みの情報がlocalStorageに保存されているか確認
//   if (localStorage.getItem(authKey) === 'true') {
//     document.body.style.visibility = 'visible';
//     successCallback();
//     return; // 認証済みならパスワード入力は不要
//   }
//
//   // 2. 認証情報がない場合、パスワード入力を求める
//   const inputPassword = prompt("パスワードを入力してください:");
//
//   if (inputPassword === correctPassword) {
//     // 3. 認証成功時、localStorageに認証済みの情報を保存
//     localStorage.setItem(authKey, 'true');
//     document.body.style.visibility = 'visible';
//     successCallback();
//   } else {
//     // 認証失敗
//     alert("パスワードが違います。");
//     document.body.innerHTML = '<h1>アクセスが拒否されました</h1>';
//     document.body.style.visibility = 'visible';
//   }
// }
/**
 * ページをパスワードで保護する
 * @param {string} authKey - (このバージョンでは未使用)
 * @param {string} correctPassword - 正しいパスワード
 * @param {function} successCallback - 認証成功時に実行される関数
 */
function handleAuth(authKey, correctPassword, successCallback) {
  // 認証情報がない場合、パスワード入力を求める
  const inputPassword = prompt("パスワードを入力してください:");

  if (inputPassword === correctPassword) {
    // 認証成功
    document.body.style.visibility = 'visible';
    successCallback();
  } else {
    // 認証失敗
    alert("パスワードが違います。");
    document.body.innerHTML = '<h1>アクセスが拒否されました</h1>';
    document.body.style.visibility = 'visible';
  }
}
