import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Add version control
const APP_VERSION = '1.0.0'; // Increment this when deploying new versions
const CACHE_NAME = `note-app-cache-v${APP_VERSION}`;

// Check for app updates
async function checkForUpdates() {
    const lastVersion = localStorage.getItem('app_version');
    if (lastVersion !== APP_VERSION) {
        console.log('New version detected, clearing caches...');
        await clearAllCaches();
        localStorage.setItem('app_version', APP_VERSION);
        // Reload the page to apply updates
        window.location.reload(true);
    }
}

// Clear all caches
async function clearAllCaches() {
    try {
        // Clear application cache
        if ('caches' in window) {
            const cacheKeys = await caches.keys();
            await Promise.all(
                cacheKeys.map(key => caches.delete(key))
            );
        }

        // Clear local storage except for critical items
        const criticalItems = ['sessionToken', 'tracking_user'];
        const itemsToKeep = {};
        criticalItems.forEach(item => {
            const value = localStorage.getItem(item);
            if (value) itemsToKeep[item] = value;
        });
        
        localStorage.clear();
        
        // Restore critical items
        Object.entries(itemsToKeep).forEach(([key, value]) => {
            localStorage.setItem(key, value);
        });

        // Clear session storage
        sessionStorage.clear();

        console.log('All caches cleared successfully');
    } catch (error) {
        console.error('Error clearing caches:', error);
    }
}

const firebaseConfig = {
    apiKey: "AIzaSyBdVgeMqQKtuJEQxrPFz8xB7XmUN6cFlMQ",
    authDomain: "kh-donghua.firebaseapp.com",
    databaseURL: "https://kh-donghua-default-rtdb.firebaseio.com",
    projectId: "kh-donghua",
    storageBucket: "kh-donghua.appspot.com",
    messagingSenderId: "119897892431",
    appId: "1:119897892431:web:ad31196e8a9692b63e6c3a"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);

const SERVICE_WORKER_REFRESH_INTERVAL = 3600000; // 1 hour in milliseconds
