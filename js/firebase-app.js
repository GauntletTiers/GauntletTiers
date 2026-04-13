import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, onValue, set, update, remove, get } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

// Initialize Firebase with config from window
const app = initializeApp(window.firebaseConfig);
const database = getDatabase(app);

// Make Firebase available globally
window.firebaseApp = app;
window.firebaseDB = database;
window.firebaseRefs = { ref, onValue, set, update, remove, get };

console.log('Firebase initialized successfully');