// Gauntlet Tiers - Tier List JavaScript with Firebase

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

let currentMode = 'sword';
let database;
let tierData = {};

document.addEventListener('DOMContentLoaded', function() {
    // Check if Firebase config exists
    if (!window.firebaseConfig) {
        console.error('Firebase config not found!');
        showNotification('Error: Firebase not configured', 'error');
        return;
    }
    
    // Initialize Firebase
    const app = initializeApp(window.firebaseConfig);
    database = getDatabase(app);
    
    // Initialize tier list
    initTierList();
});

function initTierList() {
    // Load initial tier list
    loadTierList(currentMode);
    
    // Mode selector
    const modeButtons = document.querySelectorAll('.mode-btn');
    modeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            modeButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            currentMode = this.dataset.mode;
            loadTierList(currentMode);
        });
    });
}

function loadTierList(mode) {
    const tierListRef = ref(database, `tiers/${mode}`);
    
    onValue(tierListRef, (snapshot) => {
        const data = snapshot.val() || {};
        tierData[mode] = data;
        renderTierList(mode, data);
    }, (error) => {
        console.error('Error loading tier list:', error);
        showNotification('Error loading tier list', 'error');
    });
}

function renderTierList(mode, data) {
    const players = Object.values(data);
    
    // Clear all tiers
    const tiers = ['ht1', 'lt1', 'ht2', 'lt2', 'ht3', 'lt3', 'ht4', 'lt4', 'ht5', 'lt5'];
    tiers.forEach(tier => {
        const container = document.getElementById(`${tier}-players`);
        if (container) {
            const tierPlayers = players.filter(p => p.tier === tier);
            
            if (tierPlayers.length === 0) {
                container.innerHTML = '<div class="tier-placeholder">No players ranked yet</div>';
            } else {
                container.innerHTML = tierPlayers.map(player => createPlayerCard(player)).join('');
            }
        }
    });
}

function createPlayerCard(player) {
    return `
        <div class="player-card" onclick="showPlayerDetails('${player.name}')">
            <div class="player-avatar">${player.avatar}</div>
            <span class="player-name">${player.name}</span>
        </div>
    `;
}

function showPlayerDetails(playerName) {
    showNotification(`Viewing profile: ${playerName}`, 'info');
}
