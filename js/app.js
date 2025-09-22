import { db } from './firebase-config.js';
import { collection, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const liveBandContainer = document.getElementById('live-band-section');
const nextBandContainer = document.getElementById('next-band-section');
const upcomingList = document.getElementById('upcoming-bands-list');
const finishedList = document.getElementById('finished-bands-list');
const timetableContainer = document.getElementById('timetable-container');

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
        const isOpening = targetElement.classList.toggle('is-hidden');

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
// ページ読み込み時に一度だけ実行
updateTimetable();
setupToggles();

// 1分ごとの自動更新はコメントアウト（手動更新ボタンがあるため）
// もし自動更新もさせたい場合は、以下の行のコメントを外してください。
// setInterval(updateTimetable, 60000);
