import { auth } from './firebase-config.js';
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// HTMLからログアウトボタンを取得
const logoutButton = document.getElementById('logoutButton');

// ログアウトボタンがクリックされたときの処理
logoutButton.addEventListener('click', () => {
  signOut(auth).then(() => {
    // ログアウト成功後、ログインページに移動
    window.location.href = 'index.html';
  }).catch((error) => {
    console.error('Logout Error', error);
    alert('ログアウトに失敗しました。');
  });
});
