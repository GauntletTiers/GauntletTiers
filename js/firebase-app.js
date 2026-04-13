import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, onValue, set, update, remove, get } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

// Check if config exists
if (!window.firebaseConfig) {
    console.error('Firebase config not found! Make sure firebaseConfig is defined before importing this module.');
}

// Initialize Firebase
const app = initializeApp(window.firebaseConfig);
const database = getDatabase(app);

// Export for use in other modules
export { app, database, ref, onValue, set, update, remove, get };

// Also make available globally for non-module scripts
window.firebaseApp = app;
window.firebaseDB = database;
window.dbRefs = { ref, onValue, set, update, remove, get };

console.log('Firebase initialized successfully');
