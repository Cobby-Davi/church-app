import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { initializeFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDNPgb33xb2q1mBvxvEiRTADDzG9AAoFyU",
  authDomain: "church-4feb9.firebaseapp.com",
  projectId: "church-4feb9",
  storageBucket: "church-4feb9.firebasestorage.app",
  messagingSenderId: "731603531979",
  appId: "1:731603531979:web:962ace3624cb2a7e8b034e",
  measurementId: "G-FC2D4X47PL"
};

const app = initializeApp(firebaseConfig);

export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
});