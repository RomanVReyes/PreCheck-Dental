import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs, deleteDoc, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDfjWWw2dW4mEhgLG_7wSKmQQCh4gck6lU",
    authDomain: "precheck-dental.firebaseapp.com",
    projectId: "precheck-dental",
    storageBucket: "precheck-dental.firebasestorage.app",
    messagingSenderId: "893834959540",
    appId: "1:893834959540:web:84cd5fcbd1489d398e95e1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Exportamos lo necesario para que los "services" lo usen
export { db, collection, addDoc, query, where, getDocs, deleteDoc, doc, setDoc, getDoc };