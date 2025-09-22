import { db } from './firebase-config.js';
import { collection, getDocs, query, orderBy, doc, deleteDoc, addDoc, Timestamp, writeBatch } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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
      card.dataset.id = doc.id;

      const eventDate = bandData.startTime.toDate();
      const dateString = `${eventDate.getFullYear()}/${eventDate.getMonth() + 1}/${eventDate.getDate()}`;

      card.innerHTML = `
        <div class="band-card-header">
          <h2>
            <span class="order-number" style="font-size: 0.8em; color: #888;">${bandData.order}.</span>
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

      bandListContainer.appendChild(card);
    });

  } catch (error)
  {
    console.error("データの取得中にエラーが発生しました: ", error);
    alert("リストの表示に失敗しました。");
  }
}

// ドラッグ＆ドロップ機能の初期化と処理
function initializeDragAndDrop() {
  Sortable.create(bandListContainer, {
    animation: 150, // ドラッグ中のアニメーション
    onEnd: async (event) => { // ドラッグ終了時の処理
      const cards = bandListContainer.querySelectorAll('.band-card');
      const batch = writeBatch(db); // 複数の書き込みをまとめるためのバッチ処理

      cards.forEach((card, index) => {
        const docId = card.dataset.id;
        const newOrder = index + 1;
        const docRef = doc(db, "4th_lives_bands", docId); // ご自身のコレクションID

        // バッチに「このドキュメントのorderフィールドを新しい順番で更新する」という命令を追加
        batch.update(docRef, { order: newOrder });

        // 見た目の順番表示も即座に更新
        card.querySelector('.order-number').innerText = `${newOrder}.`;
      });

      try {
        // バッチ処理を一度に実行して、データベースを更新
        await batch.commit();
        console.log("順番の更新が完了しました。");
        // 更新ログを記録
        const logData = {
          action: "並べ替え",
          details: "バンドの表示順を更新しました。",
          timestamp: Timestamp.now()
        };
        await addDoc(collection(db, "updateLogs"), logData);
      } catch (error) {
        console.error("順番の更新中にエラーが発生しました: ", error);
        alert("順番の更新に失敗しました。");
      }
    }
  });
}

// 既存のクリックイベントリスナー
bandListContainer.addEventListener('click', async (event) => {
  // 削除ボタンの処理
  if (event.target.classList.contains('delete-btn')) {
    const isConfirmed = confirm("本当にこのバンドの情報を削除しますか？\nこの操作は元に戻せません。");
    if (isConfirmed) {
      const docIdToDelete = event.target.dataset.id;
      const bandNameToDelete = event.target.closest('.band-card').querySelector('h2').innerText.split('. ')[1];
      try {
        await deleteDoc(doc(db, "4th_lives_bands", docIdToDelete)); // ご自身のコレクションID
        const logData = {
          action: "削除",
          bandName: bandNameToDelete,
          details: `バンド「${bandNameToDelete}」を削除しました。`,
          timestamp: Timestamp.now()
        };
        await addDoc(collection(db, "updateLogs"), logData);
        alert("データを削除しました。");
        displayBandList();
      } catch (error) {
        console.error("削除中にエラーが発生しました: ", error);
      }
    }
  }

  // 編集ボタンの処理
  if (event.target.classList.contains('edit-btn')) {
    const docIdToEdit = event.target.dataset.id;
    window.location.href = `admin-edit.html?id=${docIdToEdit}`;
  }
});

// 実行処理
async function main() {
  await displayBandList(); // 最初にリストを表示
  initializeDragAndDrop(); // その後、ドラッグ＆ドロップ機能を有効化
}

main();
