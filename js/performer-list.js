import { db, auth } from './firebase-config.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
// --- ▼▼▼ 認証ガード (出演者・管理者用) ▼▼▼ ---
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const idTokenResult = await user.getIdTokenResult();
    const role = idTokenResult.claims.role;
    if (role !== 'editor' && role !== 'admin') {
      // 出演者か管理者でなければハブページへ
      window.location.href = 'main.html';
    }
  } else {
    // 未ログインならログインページへ
    window.location.href = 'index.html';
  }
});
// --- ▲▲▲ 認証ガード (ここまで) ▲▲▲ ---
const bandListContainer = document.getElementById('band-list-container');

async function displayBandList() {
  try {
    const bandsCollectionRef = collection(db, "4th_lives_bands"); // ご自身のコレクションID
    const q = query(bandsCollectionRef, orderBy("order", "asc"));
    const querySnapshot = await getDocs(q);

    bandListContainer.innerHTML = '';

    querySnapshot.forEach((doc) => {
      const bandData = doc.data();
      const card = document.createElement('div');
      card.className = 'band-card';

      const eventDate = bandData.startTime.toDate();
      const dateString = `${eventDate.getFullYear()}/${eventDate.getMonth() + 1}/${eventDate.getDate()}`;

      // 削除ボタンを削除し、編集ボタンのみにする
      card.innerHTML = `
        <div class="band-card-header">
          <h2>
            <span style="font-size: 0.8em; color: #888;">${bandData.order}.</span>
            ${bandData.name}
          </h2>
          <span class="status ${bandData.isPublished ? 'status-published' : 'status-draft'}">
            ${bandData.isPublished ? '公開中' : '下書き'}
          </span>
        </div>
        <div class="band-card-body">
          <div class="info-group">
            <strong>日時:</strong>
            <p>${dateString} ${eventDate.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })} - ${bandData.endTime.toDate().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <div class="info-group">
            <strong>コメント:</strong>
            <p>${bandData.comment}</p>
          </div>
        </div>
        <div class="band-card-actions">
          <button class="edit-btn" data-id="${doc.id}">編集</button>
        </div>
      `;
      bandListContainer.appendChild(card);
    });
  } catch (error) {
    console.error("データの取得中にエラーが発生しました: ", error);
  }
}

// 編集ボタンのクリックイベントリスナー
bandListContainer.addEventListener('click', (event) => {
  if (event.target.classList.contains('edit-btn')) {
    const docIdToEdit = event.target.dataset.id;
    window.location.href = `performer-edit.html?id=${docIdToEdit}`;
  }
});

// 実行処理
displayBandList();
