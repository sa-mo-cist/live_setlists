import { db } from './firebase-config.js';
// Firestoreの機能を、URLを指定してインポート
import { addDoc, collection, Timestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const form = document.getElementById('add-band-form');

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
    const newBandData = {
      name: bandName,
      order: displayOrder,
      startTime: Timestamp.fromDate(startTime),
      endTime: Timestamp.fromDate(endTime),
      comment: comment,
      setlist: setlist,
      isPublished: isPublished
    };

    const docRef = await addDoc(collection(db, "4th_lives_bands"), newBandData);

    alert(`バンド「${bandName}」を登録しました！ (ID: ${docRef.id})`);
    form.reset();

  } catch (error) {
    console.error("データベースへの書き込み中にエラーが発生しました: ", error);
    alert("エラーが発生しました。コンソールを確認してください。");
  }
});
