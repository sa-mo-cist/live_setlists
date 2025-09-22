import { db } from './firebase-config.js';
import { collection, getDocs, query, orderBy, doc, writeBatch } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const logList = document.getElementById('log-list');
const selectAllCheckbox = document.getElementById('select-all-logs');
const deleteSelectedButton = document.getElementById('delete-selected-logs-btn');

async function displayLogs() {
  try {
    const logsRef = collection(db, "updateLogs");
    const q = query(logsRef, orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);

    logList.innerHTML = '';
    querySnapshot.forEach((doc) => {
      const logData = doc.data();
      const listItem = document.createElement('li');
      listItem.className = 'log-item';

      const logTime = logData.timestamp.toDate().toLocaleString('ja-JP');

      // 各ログ項目にチェックボックスを追加
      listItem.innerHTML = `
        <input type="checkbox" class="log-checkbox" data-id="${doc.id}">
        <div>
          <span class="log-time">${logTime}</span>
          <span class="log-details">${logData.details}</span>
        </div>
      `;
      logList.appendChild(listItem);
    });
  } catch (error) {
    console.error("ログの読み込みに失敗しました: ", error);
  }
}

// 「すべて選択」チェックボックスの処理
selectAllCheckbox.addEventListener('change', (event) => {
  const allCheckboxes = document.querySelectorAll('.log-checkbox');
  allCheckboxes.forEach(checkbox => {
    checkbox.checked = event.target.checked;
  });
});

// 「選択した項目を削除」ボタンの処理
deleteSelectedButton.addEventListener('click', async () => {
  const selectedCheckboxes = document.querySelectorAll('.log-checkbox:checked');

  if (selectedCheckboxes.length === 0) {
    alert("削除する項目が選択されていません。");
    return;
  }

  const isConfirmed = confirm(`選択された ${selectedCheckboxes.length} 件の履歴を削除しますか？`);
  if (!isConfirmed) return;

  try {
    const batch = writeBatch(db);
    selectedCheckboxes.forEach(checkbox => {
      const docId = checkbox.dataset.id;
      const docRef = doc(db, "updateLogs", docId);
      batch.delete(docRef);
    });

    await batch.commit();
    alert("選択された履歴を削除しました。");

    // リストを再表示
    displayLogs();
    selectAllCheckbox.checked = false; // 「すべて選択」をリセット

  } catch (error) {
    console.error("削除中にエラーが発生しました: ", error);
    alert("削除に失敗しました。");
  }
});

// 初期表示
displayLogs();
