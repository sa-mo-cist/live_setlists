import { auth, functions } from './firebase-config.js';
import { httpsCallable } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-functions.js";
import { signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const passwordInput = document.getElementById('passwordInput');
const loginButton = document.getElementById('loginButton');
const errorMessage = document.getElementById('errorMessage');

// ページ読み込み時に、もし既にログイン済みならmain.htmlに飛ばす
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = 'main.html';
  }
});

// ログインボタンが押されたときの処理
async function login() {
  const password = passwordInput.value;
  if (!password) {
    errorMessage.textContent = 'パスワードを入力してください。';
    return;
  }

  errorMessage.textContent = '認証中...';
  loginButton.disabled = true;

  try {
    // サーバーの 'authenticate' 関数を呼び出す
    const authenticate = httpsCallable(functions, 'authenticate');
    const result = await authenticate({ password: password });

    // 返ってきたカスタムトークンでFirebaseにサインイン
    await signInWithCustomToken(auth, result.data.token);

    // サインイン成功後、main.htmlに移動
    window.location.href = 'main.html';

  } catch (error) {
    console.error("Login Error:", error);
    errorMessage.textContent = error.message || '認証に失敗しました。';
    loginButton.disabled = false;
  }
}

loginButton.addEventListener('click', login);
passwordInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    login();
  }
});
