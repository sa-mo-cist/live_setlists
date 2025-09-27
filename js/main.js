import { auth } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const welcomeMessage = document.getElementById('welcome-message');
const linkAudience = document.getElementById('link-audience');
const linkAdmin = document.getElementById('link-admin');
const linkEditor = document.getElementById('link-editor');
const logoutButton = document.getElementById('logoutButton');

// --- ▼▼▼ 認証ガード ▼▼▼ ---
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // ログインしている場合
    const idTokenResult = await user.getIdTokenResult();
    const role = idTokenResult.claims.role;

    // 役割に応じて表示するリンクを切り替える
    if (role === 'admin') {
      welcomeMessage.textContent = '管理者メニュー';
      linkAudience.style.display = 'block';
      linkAdmin.style.display = 'block';
      linkEditor.style.display = 'block';
    } else if (role === 'editor') {
      welcomeMessage.textContent = '出演者メニュー';
      linkEditor.style.display = 'block';
    } else {
      // --- ▼▼▼ 修正箇所 ▼▼▼ ---
      // 'audience'ロール、または予期せぬロールの場合は、
      // time.html ではなく、新しい audience.html に直接飛ばす
      window.location.href = 'audience.html';
      // --- ▲▲▲ 修正箇所 (ここまで) ▲▲▲ ---
    }

  } else {
    // 未ログインならログインページへ
    window.location.href = 'index.html';
  }
});

// ログアウトボタンの処理
logoutButton.addEventListener('click', () => {
  signOut(auth).then(() => {
    // ログアウト成功後、ログインページに移動
    window.location.href = 'index.html';
  }).catch((error) => {
    console.error('Logout Error', error);
    alert('ログアウトに失敗しました。');
  });
});
