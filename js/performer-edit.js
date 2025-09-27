import { db, auth } from './firebase-config.js';
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
// --- ▼▼▼ 認証ガード (出演者・管理者用) ▼▼▼ ---
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const idTokenResult = await user.getIdTokenResult();
    const role = idTokenResult.claims.role;
    if (role !== 'editor' && role !== 'admin') {
      // 出演者か管理者でなければハブページへ
      window.location.href = 'main.html';
    }
  } else {
    // 未ログインならログインページへ
    window.location.href = 'index.html';
  }
});
// --- ▲▲▲ 認証ガード (ここまで) ▲▲▲ ---
// HTML上の要素を取得
const form = document.getElementById('edit-comment-form');
const bandNameDisplay = document.getElementById('band-name-display');
const bandTimeDisplay = document.getElementById('band-time-display');
const commentTextarea = document.getElementById('comment');

// URLから編集対象のバンドIDを取得
const urlParams = new URLSearchParams(window.location.search);
const bandId = urlParams.get('id');

if (!bandId) {
  alert("編集するバンドのIDが見つかりません。リストページに戻ります。");
  window.location.href = 'performer-list.html';
}

// 既存のデータを読み込んで表示する
async function loadBandData() {
  try {
    const docRef = doc(db, "4th_lives_bands", bandId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const bandData = docSnap.data();

      const eventDate = bandData.startTime.toDate();
      const dateString = `${eventDate.getFullYear()}/${eventDate.getMonth() + 1}/${eventDate.getDate()}`;
      const startTimeString = eventDate.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
      const endTimeString = bandData.endTime.toDate().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });

      // 読み取り専用の情報を表示
      bandNameDisplay.textContent = bandData.name;
      bandTimeDisplay.textContent = `${dateString} ${startTimeString} - ${endTimeString}`;

      // コメント欄に既存のコメントを表示
      commentTextarea.value = bandData.comment || '';

    } else {
      alert("該当するデータが見つかりませんでした。");
    }
  } catch (error) {
    console.error("データ読み込みエラー:", error);
    alert("データの読み込みに失敗しました。");
  }
}

// フォームの更新ボタンがクリックされたときの処理
form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const newComment = commentTextarea.value;

  try {
    const docRef = doc(db, "4th_lives_bands", bandId);
    // 'comment'フィールドだけを更新する
    await updateDoc(docRef, {
      comment: newComment
    });

    alert("コメントを更新しました！");
    window.location.href = 'performer-list.html';

  } catch (error) {
    console.error("更新エラー:", error);
    alert("更新に失敗しました。");
  }
});

// ページ読み込み時に実行
loadBandData();
