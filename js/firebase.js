import { initializeApp } from
"https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import { getDatabase } from
"https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";


const firebaseConfig = {
    apiKey: "AIzaSyBgxCOk1C2Bd_AVcOm0ReTSFdqIIU9BGsc",
    authDomain: "grocery-billing-system-4ac26.firebaseapp.com",
    projectId: "grocery-billing-system-4ac26",
    storageBucket: "grocery-billing-system-4ac26.firebasestorage.app",
    messagingSenderId: "403302025042",
    appId: "1:403302025042:web:012c16450cc008f1141c8b"
};


const app = initializeApp(firebaseConfig);

const db = getDatabase(app);

export { db };