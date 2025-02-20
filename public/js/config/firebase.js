// /public/js/config/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCszicewcL5M-nyhL3MXHJdjoObnVPK9Qg",
  authDomain: "mangatz-da6a4.firebaseapp.com",
  projectId: "mangatz-da6a4",
  storageBucket: "mangatz-da6a4.firebasestorage.app",
  messagingSenderId: "510033714996",
  appId: "1:510033714996:web:39ed57a20169be5e25cf61"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };