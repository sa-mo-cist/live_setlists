import { db } from './firebase-config.js';
import { collection, getDocs, query, orderBy, doc, deleteDoc, addDoc, Timestamp, writeBatch } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const bandListContainer = document.getElementById('band-list-container');
const reorderByTimeBtn = document.getElementById('reorder-by-time-btn');

// データベースからバンドリストを取得して画面に表示するメイン関数
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

  } catch (error) {
    console.error("データの取得中にエラーが発生しました: ", error);
  }
}

// --- 「日時順に表示順を修正」ボタンの処理 ---
reorderByTimeBtn.addEventListener('click', async () => {
  const isConfirmed = confirm("現在の表示順を破棄し、日時の早い順に強制的に修正します。よろしいですか？");
  if (!isConfirmed) return;

  try {
    // 1. 全データを日時順で取得
    const bandsRef = collection(db, "4th_lives_bands");
    const q = query(bandsRef, orderBy("startTime", "asc"));
    const snapshot = await getDocs(q);

    // 2. データベースの'order'を書き換えるバッチ処理を準備
    const batch = writeBatch(db);
    let newOrder = 1;
    snapshot.forEach(doc => {
      const docRef = doc.ref;
      batch.update(docRef, { order: newOrder });
      newOrder++;
    });

    // 3. バッチ処理を実行してデータベースを更新
    await batch.commit();

    alert("表示順を日時順に更新しました。");

    // 4. 画面を再読み込みして最新の状態を表示
    displayBandList();

  } catch (error) {
    console.error("表示順の更新中にエラーが発生しました: ", error);
    alert("更新に失敗しました。");
  }
});


// ドラッグ＆ドロップ機能
Sortable.create(bandListContainer, {
  animation: 150,
  onEnd: async (event) => {
    const cards = bandListContainer.querySelectorAll('.band-card');
    const batch = writeBatch(db);

    cards.forEach((card, index) => {
      const docId = card.dataset.id;
      const newOrder = index + 1;
      const docRef = doc(db, "4th_lives_bands", docId);
      batch.update(docRef, { order: newOrder });
      card.querySelector('.order-number').innerText = `${newOrder}.`;
    });

    try {
      await batch.commit();
      console.log("順番の更新が完了しました。");
      const logData = {
        action: "並べ替え",
        details: "バンドの表示順を更新しました。",
        timestamp: Timestamp.now()
      };
      await addDoc(collection(db, "updateLogs"), logData);
    } catch (error) {
      console.error("順番の更新中にエラーが発生しました: ", error);
    }
  }
});

// 編集・削除ボタンのクリックイベントリスナー
bandListContainer.addEventListener('click', async (event) => {
  if (event.target.classList.contains('delete-btn')) {
    const isConfirmed = confirm("本当にこのバンドの情報を削除しますか？\nこの操作は元に戻せません。");
    if (isConfirmed) {
      const docIdToDelete = event.target.dataset.id;
      const bandNameToDelete = event.target.closest('.band-card').querySelector('h2').innerText.split('. ')[1];
      try {
        await deleteDoc(doc(db, "4th_lives_bands", docIdToDelete));
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

  if (event.target.classList.contains('edit-btn')) {
    const docIdToEdit = event.target.dataset.id;
    window.location.href = `admin-edit.html?id=${docIdToEdit}`;
  }
});

// 実行処理
displayBandList();
