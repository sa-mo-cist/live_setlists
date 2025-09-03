// ページの読み込み完了時に認証処理を開始する
document.addEventListener('DOMContentLoaded', authenticate);

// 認証処理
function authenticate() {
  const correctPassword = "a"; // メインページ用のパスワード
  const inputPassword = prompt("パスワードを入力してください:");

  if (inputPassword === correctPassword) {
    // 認証に成功した場合
    document.body.style.visibility = 'visible'; // 非表示にしていたコンテンツを表示する
    initializeSetlist(); // セットリストを初期化・表示するメイン処理を呼び出す
  } else {
    // 認証に失敗した場合
    alert("パスワードが違います。");
    document.body.innerHTML = '<h1>アクセスが拒否されました</h1>'; // エラーメッセージを表示
    document.body.style.visibility = 'visible'; // エラーメッセージだけを表示
  }
}

// セットリストを初期化・表示するメイン処理
function initializeSetlist() {
  const setlistContainer = document.getElementById('setlist');
  const bands = Array.from(setlistContainer.getElementsByClassName('band'));

  const updateLiveStatus = () => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    let currentBand = null;
    const finishedBands = [];

    bands.forEach(band => {
      const startTime = band.dataset.startTime.split(':');
      const endTime = band.dataset.endTime.split(':');
      const startMinutes = parseInt(startTime[0], 10) * 60 + parseInt(startTime[1], 10);
      const endMinutes = parseInt(endTime[0], 10) * 60 + parseInt(endTime[1], 10);

      band.classList.remove('current-live', 'finished-live');

      if (currentTime >= startMinutes && currentTime < endMinutes) {
        band.classList.add('current-live');
        currentBand = band;
      } else if (currentTime >= endMinutes) {
        band.classList.add('finished-live');
        finishedBands.push(band);
      }
    });

    if (currentBand) {
      setlistContainer.prepend(currentBand);
    }

    finishedBands.forEach(band => {
      setlistContainer.appendChild(band);
    });
  };

  updateLiveStatus();
  setInterval(updateLiveStatus, 60000); // 1分ごとに更新
}
