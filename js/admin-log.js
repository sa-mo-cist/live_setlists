import { db } from './firebase-config.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const logList = document.getElementById('log-list');

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

      listItem.innerHTML = `
        <span class="log-time">${logTime}</span>
        <span class="log-details">${logData.details}</span>
      `;
      logList.appendChild(listItem);
    });
  } catch (error) {
    console.error("ログの読み込みに失敗しました: ", error);
  }
}

displayLogs();
