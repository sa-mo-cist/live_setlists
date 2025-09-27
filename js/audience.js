// --- ▼▼▼ 修正箇所（すべてのインポートをここに集約） ▼▼▼ ---
import { db, auth, functions } from './firebase-config.js';
import { onAuthStateChanged, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { httpsCallable } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-functions.js";
import { collection, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
// --- ▲▲▲ 修正箇所 (ここまで) ▲▲▲ ---

// --- ▼▼▼ HTML要素の取得（コードの先頭に移動） ▼▼▼ ---
const liveBandContainer = document.getElementById('live-band-section');
const nextBandContainer = document.getElementById('next-band-section');
const upcomingList = document.getElementById('upcoming-bands-list');
const finishedList = document.getElementById('finished-bands-list');
const timetableContainer = document.getElementById('timetable-container');
// --- ▲▲▲ HTML要素の取得 (ここまで) ▲▲▲ ---


// --- ▼▼▼ 認証ガード (ここから) ▼▼▼ ---
async function handleAuthentication() {
  const urlParams = new URLSearchParams(window.location.search);
  // QRコードから渡されるパスワード（event-qr-code）を'token'として受け取る
  const passwordFromQR = urlParams.get('token');

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // すでにログインしている場合（管理者などが確認するケース）
      const idTokenResult = await user.getIdTokenResult();
      const role = idTokenResult.claims.role;
      if (role === 'audience' || role === 'admin') {
        // 観客か管理者ならアクセスを許可し、タイムテーブルを表示
        await updateTimetable();
        setupToggles();
      } else {
        // それ以外の権限ならメインメニューへ（観客には見えない）
        window.location.href = 'main.html';
      }
    } else if (passwordFromQR) {
      // 未ログインだがQRコードのパスワードがある場合
      try {
        const authenticate = httpsCallable(functions, 'authenticate');
        // サーバーにパスワードを渡して認証
        const result = await authenticate({ password: passwordFromQR });
        // 返ってきたカスタムトークンでサインイン
        await signInWithCustomToken(auth, result.data.token);
        // URLからパスワード情報を消してページをリロード（セキュリティのため）
        window.location.search = '';
      } catch (e) {
        // パスワードが不正な場合はログインページへ
        window.location.href = 'index.html';
      }
    } else {
      // 未ログインかつパスワードもない場合はログインページへ
      window.location.href = 'index.html';
    }
  });
}
// --- ▲▲▲ 認証ガード (ここまで) ▲▲▲ ---


// --- ▼▼▼ これ以降は、あなたの既存のコードです（変更なし） ▼▼▼ ---
async function updateTimetable() {
  try {
    const now = new Date();
    const bandsCollectionRef = collection(db, "4th_lives_bands");
    const q = query(bandsCollectionRef, where("isPublished", "==", true), orderBy("order", "asc"));
    const querySnapshot = await getDocs(q);

    let allBands = [];
    querySnapshot.forEach(doc => {
      allBands.push({ id: doc.id, ...doc.data() });
    });

    const liveBands = [];
    const upcomingBands = [];
    const finishedBands = [];

    allBands.forEach(band => {
      const startTime = band.startTime.toDate();
      const endTime = band.endTime.toDate();
      if (now >= startTime && now < endTime) {
        liveBands.push(band);
      } else if (now < startTime) {
        upcomingBands.push(band);
      } else {
        finishedBands.push(band);
      }
    });

    const liveBand = liveBands.length > 0 ? liveBands[0] : null;
    const nextBand = upcomingBands.length > 0 ? upcomingBands[0] : null;
    const otherUpcomingBands = upcomingBands.slice(1);

    renderLiveBand(liveBand);
    renderNextBand(nextBand);
    renderBandList(upcomingList, otherUpcomingBands, false);
    renderBandList(finishedList, finishedBands.reverse(), true);

  } catch (error) {
    console.error("タイムテーブルの更新中にエラーが発生しました: ", error);
  }
}

function renderLiveBand(band) {
  liveBandContainer.innerHTML = '<h3>演奏中</h3>';
  if (band) {
    liveBandContainer.innerHTML += createBandCardHTML(band, 'live', false);
  } else {
    liveBandContainer.innerHTML += '<p class="no-band-message">少々お待ちください...</p>';
  }
}

function renderNextBand(band) {
  nextBandContainer.innerHTML = '<h3>次のバンド</h3>';
  if (band) {
    nextBandContainer.innerHTML += createBandCardHTML(band, 'next', false);
  } else {
    nextBandContainer.innerHTML += '<p class="no-band-message">少々お待ちください...</p>';
  }
}

function renderBandList(container, bands, showSetlist) {
  container.innerHTML = '';
  if (bands.length > 0) {
    bands.forEach(band => {
      container.innerHTML += createBandCardHTML(band, 'default', showSetlist);
    });
  } else {
    container.innerHTML = '<p class="no-band-message">該当するバンドはありません</p>';
  }
}

function createBandCardHTML(band, status, showSetlist) {
  const startTime = band.startTime.toDate().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  const endTime = band.endTime.toDate().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });

  let contentHTML = `<p class="comment">${band.comment}</p>`;
  if (showSetlist) {
    const setlistItems = band.setlist && band.setlist.length > 0
      ? band.setlist.map(song => `<li>${song}</li>`).join('')
      : '<li>(セットリスト情報なし)</li>';
    contentHTML = `<ul class="setlist">${setlistItems}</ul>`;
  }

  return `
    <div class="band-item status-${status}">
      <h2>${band.name}</h2>
      <p class="time">${startTime} - ${endTime}</p>
      ${contentHTML}
    </div>
  `;
}

function setupToggles() {
  timetableContainer.addEventListener('click', (event) => {
    const button = event.target.closest('.toggle-button');
    if (button) {
      const targetId = button.dataset.target;
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        // is-hiddenクラスを付け外しして、表示・非表示を切り替える
        targetElement.classList.toggle('is-hidden');

        // 表示状態に合わせてボタンのテキストとクラスを変更
        if (targetElement.classList.contains('is-hidden')) {
          // 閉じている場合
          button.innerHTML = `► ${button.innerText.substring(2)}`; //
          button.classList.remove('is-open');
        } else {
          // 開いている場合
          button.innerHTML = `▼ ${button.innerText.substring(2)}`;
          button.classList.add('is-open');
        }
      }
    }
  });
}

// --- 実行処理 ---
// 認証ガードが成功した場合にのみ、タイムテーブルが表示されるように変更
handleAuthentication();
