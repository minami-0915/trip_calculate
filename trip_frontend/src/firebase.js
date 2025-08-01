// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ↓ここはFirebase Consoleの設定画面からコピペしてください
const firebaseConfig = {
  apiKey: "AIzaSyBEQzWEbeDQKSaN9xc_GOti6HoOcXFol8E",
  authDomain: "tripcal-291af.firebaseapp.com",
  projectId: "tripcal-291af",
  storageBucket: "tripcal-291af.firebasestorage.app",
  messagingSenderId: "951801505808",
  appId: "1:951801505808:web:9a4b1f2e375e76301ec295",
  measurementId: "G-Q9H7P9ZYVP"
};

// Firebase初期化
const app = initializeApp(firebaseConfig);

// 認証とデータベースをエクスポート
export const auth = getAuth(app);
export const db = getFirestore(app);
