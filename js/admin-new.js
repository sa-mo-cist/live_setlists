import { db } from './firebase-config.js';
import { collection, addDoc, Timestamp, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const form = document.getElementById('add-band-form');

document.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.getElementById('event-date');
  if (dateInput) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    dateInput.value = `${year}-${month}-${day}`;
  }
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    const displayOrder = Number(form['display-order'].value);
    const bandsRef = collection(db, "4th_lives_bands");
    const q = query(bandsRef, where("order", "==", displayOrder));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      alert("エラー：この表示順は既に使用されています。別の番号を入力してください。");
      return;
    }

    const eventDateStr = form['event-date'].value;
    const bandName = form['band-name'].value;
    const startTimeStr = form['start-time'].value;
    const endTimeStr = form['end-time'].value;
    const comment = form['comment'].value;
    const setlist = form['setlist'].value.split('\n').filter(song => song.trim() !== '');
    const isPublished = form['is-published'].checked;

    const startTime = new Date(`${eventDateStr}T${startTimeStr}:00`);
    const endTime = new Date(`${eventDateStr}T${endTimeStr}:00`);

    const newBandData = {
      name: bandName,
      order: displayOrder,
      startTime: Timestamp.fromDate(startTime),
      endTime: Timestamp.fromDate(endTime),
      comment: comment,
      setlist: setlist,
      isPublished: isPublished
    };

    await addDoc(bandsRef, newBandData);

    const logData = {
      action: "登録",
      bandName: bandName,
      details: `バンド「${bandName}」を新規登録しました。`,
      timestamp: Timestamp.now()
    };
    await addDoc(collection(db, "updateLogs"), logData);

    alert(`バンド「${bandName}」を登録しました！`);
    form.reset();
    document.getElementById('event-date').value = eventDateStr;

  } catch (error) {
    console.error("登録中にエラーが発生しました: ", error);
    alert("エラーが発生しました。コンソールを確認してください。");
  }
});
