import { getDatabase, ref, onValue, set, update, remove } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

let currentMode = 'sword';
let database;
let tierData = {};

document.addEventListener('DOMContentLoaded', function() {
    // Wait for Firebase to initialize
    if (window.firebaseDB) {
        database = window.firebaseDB;
        initTierList();
    } else {
        // Retry after a short delay
        setTimeout(() => {
            if (window.firebaseDB) {
                database = window.firebaseDB;
                initTierList();
            } else {
                console.error('Firebase not initialized');
                showNotification('Error connecting to database', 'error');
            }
        }, 1000);
    }
});

function initTierList() {
    // Initialize tier list
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

// Admin functions for managing tiers
export function addPlayerToTier(playerName, tier, mode) {
    const playerRef = ref(database, `tiers/${mode}/${playerName}`);
    
    set(playerRef, {
        name: playerName,
        tier: tier,
        avatar: playerName.charAt(0).toUpperCase(),
        timestamp: Date.now()
    }).then(() => {
        showNotification(`Player "${playerName}" added to ${tier.toUpperCase()}`, 'success');
    }).catch((error) => {
        console.error('Error adding player:', error);
        showNotification('Error adding player', 'error');
    });
}

export function removePlayer(playerName, mode) {
    const playerRef = ref(database, `tiers/${mode}/${playerName}`);
    
    remove(playerRef).then(() => {
        showNotification(`Player "${playerName}" removed`, 'success');
    }).catch((error) => {
        console.error('Error removing player:', error);
        showNotification('Error removing player', 'error');
    });
}

export function updatePlayerTier(playerName, newTier, mode) {
    const playerRef = ref(database, `tiers/${mode}/${playerName}`);
    
    update(playerRef, {
        tier: newTier,
        timestamp: Date.now()
    }).then(() => {
        showNotification(`Player "${playerName}" moved to ${newTier.toUpperCase()}`, 'success');
    }).catch((error) => {
        console.error('Error updating player:', error);
        showNotification('Error updating player', 'error');
    });
}

// Make functions available globally
window.addPlayerToTier = addPlayerToTier;
window.removePlayer = removePlayer;
window.updatePlayerTier = updatePlayerTier;