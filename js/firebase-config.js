//今回用いたデータベースとの連携をつかさどる
// Firebase SDKから必要な機能を、URLを指定してインポートする
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFunctions } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-functions.js";

// あなたのウェブアプリのFirebase設定情報
const firebaseConfig = {
  apiKey: "AIzaSyC6ck0cePo8CJJ_4gZtgX3b-AOryeoq2f4",
  authDomain: "live-setlist-da06c.firebaseapp.com",
  projectId: "live-setlist-da06c",
  storageBucket: "live-setlist-da06c.firebasestorage.app",
  messagingSenderId: "938093022761",
  appId: "1:938093022761:web:e955cd290b9a461e8c1638"
};

const app = initializeApp(firebaseConfig);
// 各機能への参照をエクスポートする
export const db = getFirestore(app);
export const auth = getAuth(app);
export const functions = getFunctions(app, 'us-central1');
