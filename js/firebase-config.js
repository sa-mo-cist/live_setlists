//今回用いたデータベースとの連携をつかさどる
// Firebase SDKから必要な機能を、URLを指定してインポートする
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// あなたのウェブアプリのFirebase設定情報
const firebaseConfig = {
  apiKey: "AIzaSyCk0cePo8CJJ_4gZtgX3b-A0ryeoq2F4",
  authDomain: "live-setlist-da06c.firebaseapp.com",
  projectId: "live-setlist-da06c",
  storageBucket: "live-setlist-da06c.appspot.com",
  messagingSenderId: "938093022761",
  appId: "1:938093022761:web:e955cd290b9a461e8c1638"
};

// Firebaseを初期化
const app = initializeApp(firebaseConfig);

// Firestoreデータベースへの参照をエクスポート
export const db = getFirestore(app);
