
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCszicewcL5M-nyhL3MXHJdjoObnVPK9Qg",
  authDomain: "mangatz-da6a4.firebaseapp.com",
  projectId: "mangatz-da6a4",
  storageBucket: "mangatz-da6a4.firebasestorage.app",
  messagingSenderId: "510033714996",
  appId: "1:510033714996:web:39ed57a20169be5e25cf61"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
