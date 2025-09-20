//データベースの情報を表示する機能をつかさどる
import { db } from './firebase-config.js';
import { collection, getDocs, query, orderBy, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// IDを `band-list-container` に変更
const bandListContainer = document.getElementById('band-list-container');

async function displayBandList() {
  try {
    const bandsCollectionRef = collection(db, "4th_lives_bands"); // ご自身のコレクションID
    const q = query(bandsCollectionRef, orderBy("order", "asc"));

    const querySnapshot = await getDocs(q);

    // コンテナの中身を一度空にする
    bandListContainer.innerHTML = '';

    querySnapshot.forEach((doc) => {
      const bandData = doc.data();

      // カード全体を囲むdiv要素を作成
      const card = document.createElement('div');
      card.className = 'band-card'; // CSSで定義したクラスを適用

      // カードの中身のHTMLを組み立てる
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
            <strong>時間:</strong>
            <p>${bandData.startTime.toDate().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })} - ${bandData.endTime.toDate().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <div class="info-group">
            <strong>コメント:</strong>
            <p>${bandData.comment}</p>
          </div>
          <div class="info-group">
            <strong>セットリスト:</strong>
            <p>${bandData.setlist ? bandData.setlist.join('\n') : '(未登録)'}</p>
          </div>
        </div>
        <div class="band-card-actions">
          <button class="edit-btn" data-id="${doc.id}">編集</button>
          <button class="delete-btn" data-id="${doc.id}">削除</button>
        </div>
      `;

      // 組み立てたカードをコンテナに追加
      bandListContainer.appendChild(card);
    });

  } catch (error) {
    console.error("データの取得中にエラーが発生しました: ", error);
    alert("リストの表示に失敗しました。");
  }
}

displayBandList();


// --- 削除・編集ボタンの機能（ここは変更なし） ---
bandListContainer.addEventListener('click', async (event) => {
  if (event.target.classList.contains('delete-btn')) {
    const isConfirmed = confirm("本当にこのバンドの情報を削除しますか？\nこの操作は元に戻せません。");
    if (isConfirmed) {
      const docIdToDelete = event.target.dataset.id;
      try {
        await deleteDoc(doc(db, "4th_lives_bands", docIdToDelete)); // ご自身のコレクションID
        alert("データを削除しました。");
        displayBandList();
      } catch (error) {
        console.error("削除中にエラーが発生しました: ", error);
      }
    }
  }

  if (event.target.classList.contains('edit-btn')) {
    const docIdToEdit = event.target.dataset.id;
    window.location.href = `admin-edit.html?id=${docIdToEdit}`;
  }
});
