import { db } from './firebase-config.js';
// Firestoreの機能を、URLを指定してインポート
import { doc, getDoc, updateDoc, Timestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const form = document.getElementById('edit-band-form');
const urlParams = new URLSearchParams(window.location.search);
const bandId = urlParams.get('id');

if (!bandId) {
  alert("編集するバンドのIDが見つかりません。リストページに戻ります。");
  window.location.href = 'admin-list.html';
}

async function loadBandData() {
  try {
    const docRef = doc(db, "4th_lives_bands", bandId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const bandData = docSnap.data();

      form['band-name'].value = bandData.name;
      form['display-order'].value = bandData.order;
      form['start-time'].value = bandData.startTime.toDate().toTimeString().substring(0, 5);
      form['end-time'].value = bandData.endTime.toDate().toTimeString().substring(0, 5);
      form['comment'].value = bandData.comment;

      // --- ↓↓↓ ここが修正箇所 ↓↓↓ ---
      // setlistが存在する場合のみjoinを実行し、存在しない場合は空文字を設定
      form['setlist'].value = bandData.setlist ? bandData.setlist.join('\n') : '';
      // --- ↑↑↑ ここまで ↑↑↑ ---

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

  const bandName = form['band-name'].value;
  const displayOrder = Number(form['display-order'].value);
  const startTimeStr = form['start-time'].value;
  const endTimeStr = form['end-time'].value;
  const comment = form['comment'].value;
  const setlist = form['setlist'].value.split('\n').filter(song => song.trim() !== '');
  const isPublished = form['is-published'].checked;

  const eventDate = new Date();
  const [startHour, startMinute] = startTimeStr.split(':');
  const startTime = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), startHour, startMinute);
  const [endHour, endMinute] = endTimeStr.split(':');
  const endTime = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), endHour, endMinute);

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

    alert("バンド情報を更新しました！");
    window.location.href = 'admin-list.html';

  } catch (error) {
    console.error("更新エラー:", error);
    alert("更新に失敗しました。");
  }
});
