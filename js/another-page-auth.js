// ページの読み込み完了時に認証処理を開始する
document.addEventListener('DOMContentLoaded', authenticate);

function authenticate() {
  const correctPassword = "q"; // 別ページ用のパスワード
  const inputPassword = prompt("このページを閲覧するにはパスワードが必要です:");

  if (inputPassword === correctPassword) {
    // 認証に成功した場合
    document.body.style.visibility = 'visible'; // コンテンツを表示
  } else {
    // 認証に失敗した場合
    alert("パスワードが違います。");
    document.body.innerHTML = '<h1>アクセスが拒否されました</h1>';
    document.body.style.visibility = 'visible';
  }
}
