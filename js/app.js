import { db } from './firebase-config.js';
import { collection, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// HTML上の各セクションのコンテナ要素を取得
const liveBandContainer = document.getElementById('live-band-section');
const nextBandContainer = document.getElementById('next-band-section');
const upcomingList = document.getElementById('upcoming-bands-list');
const finishedList = document.getElementById('finished-bands-list');
const timetableContainer = document.getElementById('timetable-container');

// タイムテーブルを更新するメインの関数
async function updateTimetable() {
  try {
    const now = new Date(); // 現在時刻

    // Firestoreから公開中のバンドデータを'order'順で取得
    const bandsCollectionRef = collection(db, "4th_lives_bands"); // ご自身のコレクションID
    const q = query(bandsCollectionRef, where("isPublished", "==", true), orderBy("order", "asc"));
    const querySnapshot = await getDocs(q);

    // 取得した全バンドを一時的に格納するリスト
    let allBands = [];
    querySnapshot.forEach(doc => {
      allBands.push({ id: doc.id, ...doc.data() });
    });

    // 4つの状態にバンドを分類する
    let liveBand = null;
    let nextBand = null;
    const upcomingBands = [];
    const finishedBands = [];
    let foundLive = false;

    allBands.forEach(band => {
      const startTime = band.startTime.toDate();
      const endTime = band.endTime.toDate();

      if (now >= startTime && now < endTime) {
        liveBand = band;
        foundLive = true;
      } else if (now < startTime) {
        if (!foundLive && !nextBand) {
          nextBand = band; // まだライブが始まっていない場合、最初のupcomingがnextになる
        } else {
          upcomingBands.push(band);
        }
      } else {
        finishedBands.push(band);
      }
    });

    // ライブ中のバンドが見つかった場合、その次のバンドをnextBandに設定
    if (liveBand) {
      const liveBandIndex = allBands.findIndex(b => b.id === liveBand.id);
      if (liveBandIndex + 1 < allBands.length) {
        nextBand = allBands[liveBandIndex + 1];
      }
    }

    // HTMLを組み立てて表示
    renderLiveBand(liveBand);
    renderNextBand(nextBand);
    renderBandList(upcomingList, upcomingBands, false); // false = セットリスト非表示
    renderBandList(finishedList, finishedBands.reverse(), true); // true = セットリスト表示、逆順で最新の終了バンドが上

  } catch (error) {
    console.error("タイムテーブルの更新中にエラーが発生しました: ", error);
  }
}


// --- 表示用HTMLを生成する関数群 ---

function renderLiveBand(band) {
  liveBandContainer.innerHTML = '<h3>演奏中</h3>';
  if (band) {
    liveBandContainer.innerHTML += createBandCardHTML(band, 'live', true);
  } else {
    liveBandContainer.innerHTML += '<p class="no-band-message">現在演奏中のバンドはいません</p>';
  }
}

function renderNextBand(band) {
  nextBandContainer.innerHTML = '<h3>次のバンド</h3>';
  if (band) {
    nextBandContainer.innerHTML += createBandCardHTML(band, 'next', false);
  } else {
    nextBandContainer.innerHTML += '<p class="no-band-message">次に演奏予定のバンドはありません</p>';
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


// --- トグル機能 ---
function setupToggles() {
  timetableContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('toggle-button')) {
      const targetId = event.target.dataset.target;
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.classList.toggle('is-hidden');
      }
    }
  });
}


// --- 実行処理 ---
updateTimetable(); // 初回実行
setInterval(updateTimetable, 60000); // 1分ごとに更新
setupToggles(); // トグル機能の有効化
