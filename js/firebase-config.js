// =================================================================
// QUICK LOAN DESK - FIREBASE CONFIGURATION MODULE
// =================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

// Secure Firebase Project Credentials
const firebaseConfig = {
    apiKey: "AIzaSyCeveAnUHz6X_0tj9mEegPAp0Tn6sJ9RPA",
    authDomain: "quickloan-desk.firebaseapp.com",
    projectId: "quickloan-desk",
    storageBucket: "quickloan-desk.firebasestorage.app",
    messagingSenderId: "573253537243",
    appId: "1:573253537243:web:5a0325635c38a4369cebfe"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Export Firestore Database Instance
export const db = getFirestore(app);
