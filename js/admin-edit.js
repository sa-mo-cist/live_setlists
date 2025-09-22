import { db } from './firebase-config.js';
import { doc, getDoc, updateDoc, Timestamp, addDoc, collection } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const form = document.getElementById('edit-band-form');
const urlParams = new URLSearchParams(window.location.search);
const bandId = urlParams.get('id');

if (!bandId) {
  alert("編集するバンドのIDが見つかりません。リストページに戻ります。");
  window.location.href = 'admin-list.html';
}

// YYYY-MM-DD 形式の文字列を返すヘルパー関数
function toDateInputString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function loadBandData() {
  try {
    const docRef = doc(db, "4th_lives_bands", bandId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const bandData = docSnap.data();

      const startTimeDate = bandData.startTime.toDate();

      // フォームの各入力欄に既存のデータをセットする
      form['event-date'].value = toDateInputString(startTimeDate); // ← 日付をセット
      form['band-name'].value = bandData.name;
      form['display-order'].value = bandData.order;
      form['start-time'].value = startTimeDate.toTimeString().substring(0, 5);
      form['end-time'].value = bandData.endTime.toDate().toTimeString().substring(0, 5);
      form['comment'].value = bandData.comment;
      form['setlist'].value = bandData.setlist ? bandData.setlist.join('\n') : '';
      form['is-published'].checked = bandData.isPublished;

    } else {
      alert("該当するデータが見つかりませんでした。");
    }
  } catch (error) {
    console.error("データ読み込みエラー:", error);
    alert("データの読み込みに失敗しました。");
  }
}

loadBandData();

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  // フォームから更新後の値を取得
  const eventDateStr = form['event-date'].value; // ← 日付を取得
  const bandName = form['band-name'].value;
  const displayOrder = Number(form['display-order'].value);
  const startTimeStr = form['start-time'].value;
  const endTimeStr = form['end-time'].value;
  const comment = form['comment'].value;
  const setlist = form['setlist'].value.split('\n').filter(song => song.trim() !== '');
  const isPublished = form['is-published'].checked;

  // 取得した日付と時刻を組み合わせてTimestampを作成
  const startTime = new Date(`${eventDateStr}T${startTimeStr}:00`);
  const endTime = new Date(`${eventDateStr}T${endTimeStr}:00`);

  try {
    const updatedData = {
      name: bandName,
      order: displayOrder,
      startTime: Timestamp.fromDate(startTime),
      endTime: Timestamp.fromDate(endTime),
      comment: comment,
      setlist: setlist,
      isPublished: isPublished
    };

    const docRef = doc(db, "4th_lives_bands", bandId);
    await updateDoc(docRef, updatedData);

    const logData = {
      action: "更新",
      bandName: bandName,
      details: `バンド「${bandName}」の情報を更新しました。`,
      timestamp: Timestamp.now()
    };
    await addDoc(collection(db, "updateLogs"), logData);

    alert("バンド情報を更新しました！");
    window.location.href = 'admin-list.html';

  } catch (error) {
    console.error("更新エラー:", error);
    alert("更新に失敗しました。");
  }
});
