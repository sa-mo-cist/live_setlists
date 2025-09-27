// 修正箇所１：'./firebase-config.js' から auth もインポートする
import { db, auth } from './firebase-config.js';

// 修正箇所２：Firestoreのインポートに加えて、Authの機能もインポートする
import { collection, addDoc, Timestamp, query, where, getDocs, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
// --- ▼▼▼ 認証ガード (管理者用) ▼▼▼ ---
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const idTokenResult = await user.getIdTokenResult();
    if (idTokenResult.claims.role !== 'admin') {
      // 管理者でなければハブページへ
      window.location.href = 'main.html';
    }
  } else {
    // 未ログインならログインページへ
    window.location.href = 'index.html';
  }
});
// --- ▲▲▲ 認証ガード (ここまで) ▲▲▲ ---
const form = document.getElementById('add-band-form');

// ページが読み込まれたときに実行される処理
document.addEventListener('DOMContentLoaded', async () => {
  // --- 1. 日付入力欄に今日の日付をデフォルトで設定 ---
  const dateInput = document.getElementById('event-date');
  if (dateInput) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    dateInput.value = `${year}-${month}-${day}`;
  }

  // --- 2. 表示順の最大値+1をデフォルトで設定 ---
  const orderInput = document.getElementById('display-order');
  if (orderInput) {
    try {
      const bandsRef = collection(db, "4th_lives_bands");
      // 'order'フィールドで降順（大きい順）に並べ替え、最初の1件だけ取得するクエリ
      const q = query(bandsRef, orderBy("order", "desc"), limit(1));
      const querySnapshot = await getDocs(q);

      let nextOrder = 1; // デフォルトは1
      if (!querySnapshot.empty) {
        // データが存在する場合、最大のorderを取得して+1する
        const lastBand = querySnapshot.docs[0].data();
        nextOrder = lastBand.order + 1;
      }
      orderInput.value = nextOrder;

    } catch (error) {
      console.error("表示順の取得に失敗しました:", error);
      orderInput.value = 1; // エラー時は1にフォールバック
    }
  }
});


// フォームの登録ボタンがクリックされたときの処理
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

    // フォームリセット後に、再度、日付と次の表示順をセットする
    document.dispatchEvent(new Event('DOMContentLoaded'));

  } catch (error) {
    console.error("登録中にエラーが発生しました: ", error);
    alert("エラーが発生しました。コンソールを確認してください。");
  }
});
