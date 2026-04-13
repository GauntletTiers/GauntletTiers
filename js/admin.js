// Gauntlet Tiers - Admin Panel JavaScript with Firebase

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, onValue, set, update, remove } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

let database;
let currentEditMode = 'sword';

document.addEventListener('DOMContentLoaded', function() {
    // Check admin access
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const userEmail = localStorage.getItem('userEmail');
    
    const loginWarning = document.getElementById('admin-login-warning');
    const adminDashboard = document.getElementById('admin-dashboard');
    
    if (isAdmin && userEmail === 'support.gauntlettiers@gmail.com') {
        if (loginWarning) loginWarning.style.display = 'none';
        if (adminDashboard) adminDashboard.style.display = 'grid';
        
        // Check if Firebase config exists
        if (!window.firebaseConfig) {
            console.error('Firebase config not found!');
            showNotification('Error: Firebase not configured', 'error');
            return;
        }
        
        // Initialize Firebase
        const app = initializeApp(window.firebaseConfig);
        database = getDatabase(app);
        
        // Initialize admin features
        initAdminTabs();
        initTierEditor();
        loadAdminData();
        setupEventListeners();
    } else {
        if (loginWarning) loginWarning.style.display = 'block';
        if (adminDashboard) adminDashboard.style.display = 'none';
    }
});

function setupEventListeners() {
    // Add player form
    const addPlayerForm = document.getElementById('add-player-form');
    if (addPlayerForm) {
        addPlayerForm.addEventListener('submit', handleAddPlayer);
    }
    
    // Modal close on outside click
    const modal = document.getElementById('add-player-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeAddPlayerModal();
            }
        });
    }
}

function handleAddPlayer(e) {
    e.preventDefault();
    
    const name = document.getElementById('new-player-name').value;
    const mode = document.getElementById('new-player-mode').value;
    const tier = document.getElementById('new-player-tier').value;
    
    addPlayer(name, mode, tier);
    closeAddPlayerModal();
    e.target.reset();
}

// Admin tab navigation
function initAdminTabs() {
    const navItems = document.querySelectorAll('.admin-nav-item');
    const tabs = document.querySelectorAll('.admin-tab');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetTab = this.dataset.tab;
            
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            tabs.forEach(tab => {
                tab.classList.remove('active');
                if (tab.id === `tab-${targetTab}`) {
                    tab.classList.add('active');
                }
            });
        });
    });
}

// Tier editor functionality
function initTierEditor() {
    const modeButtons = document.querySelectorAll('.tier-editor .mode-btn');
    
    modeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            modeButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            currentEditMode = this.dataset.mode;
            loadTierEditorData(currentEditMode);
        });
    });
    
    // Initialize with first mode
    if (modeButtons.length > 0) {
        currentEditMode = modeButtons[0].dataset.mode;
        loadTierEditorData(currentEditMode);
    }
}

function loadTierEditorData(mode) {
    const tierListRef = ref(database, `tiers/${mode}`);
    
    onValue(tierListRef, (snapshot) => {
        const data = snapshot.val() || {};
        const players = Object.values(data);
        
        // Clear all drop zones
        const dropZones = document.querySelectorAll('.drop-zone');
        dropZones.forEach(zone => {
            const tier = zone.dataset.tier;
            const tierPlayers = players.filter(p => p.tier === tier);
            
            if (tierPlayers.length === 0) {
                zone.innerHTML = '<span class="drop-hint">Drop players here or click to add</span>';
            } else {
                zone.innerHTML = tierPlayers.map(player => `
                    <div class="player-chip" data-player="${player.name}">
                        ${player.name}
                        <button onclick="removePlayerFromTier('${player.name}', '${mode}')">&times;</button>
                    </div>
                `).join('');
            }
        });
    });
}

// Modal functions
window.openAddPlayerModal = function() {
    const modal = document.getElementById('add-player-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

window.closeAddPlayerModal = function() {
    const modal = document.getElementById('add-player-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Player management functions
window.addPlayer = function(name, mode, tier) {
    const playerRef = ref(database, `tiers/${mode}/${name}`);
    
    set(playerRef, {
        name: name,
        tier: tier,
        avatar: name.charAt(0).toUpperCase(),
        timestamp: Date.now()
    }).then(() => {
        showNotification(`Player "${name}" added to ${tier.toUpperCase()} in ${mode} mode`, 'success');
        loadAdminData();
    }).catch((error) => {
        console.error('Error adding player:', error);
        showNotification('Error adding player: ' + error.message, 'error');
    });
}

window.removePlayerFromTier = function(playerName, mode) {
    if (!confirm(`Are you sure you want to remove ${playerName}?`)) return;
    
    const playerRef = ref(database, `tiers/${mode}/${playerName}`);
    
    remove(playerRef).then(() => {
        showNotification(`Player "${playerName}" removed`, 'success');
        loadAdminData();
    }).catch((error) => {
        console.error('Error removing player:', error);
        showNotification('Error removing player: ' + error.message, 'error');
    });
}

window.deletePlayer = function(name, mode) {
    removePlayerFromTier(name, mode);
}

function loadAdminData() {
    const playersRef = ref(database, 'tiers');
    
    onValue(playersRef, (snapshot) => {
        const allData = snapshot.val() || {};
        let allPlayers = [];
        
        Object.keys(allData).forEach(mode => {
            const modeData = allData[mode];
            if (modeData) {
                Object.values(modeData).forEach(player => {
                    allPlayers.push({
                        ...player,
                        mode: mode,
                        lastUpdated: new Date(player.timestamp || Date.now()).toLocaleDateString()
                    });
                });
            }
        });
        
        renderPlayersTable(allPlayers);
    });
}

function renderPlayersTable(players) {
    const tbody = document.getElementById('admin-players-list');
    if (!tbody) return;
    
    if (players.length === 0) {
        tbody.innerHTML = `
            <tr class="empty-state">
                <td colspan="5">No players added yet. Click "Add Player" to get started.</td>
            </tr>
        `;
    } else {
        tbody.innerHTML = players.map(player => `
            <tr>
                <td>
                    <div class="player-cell">
                        <div class="player-avatar">${player.avatar}</div>
                        <span>${player.name}</span>
                    </div>
                </td>
                <td><span class="tier-badge tier-${player.tier}">${player.tier.toUpperCase()}</span></td>
                <td>${player.mode.charAt(0).toUpperCase() + player.mode.slice(1)}</td>
                <td>${player.lastUpdated}</td>
                <td>
                    <button class="btn btn-small btn-danger" onclick="deletePlayer('${player.name}', '${player.mode}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
}

window.resetTiers = function() {
    if (!confirm('Are you sure you want to reset all tier data? This cannot be undone.')) return;
    
    const tiersRef = ref(database, 'tiers');
    remove(tiersRef).then(() => {
        showNotification('All tier data reset successfully', 'success');
    }).catch((error) => {
        console.error('Error resetting tiers:', error);
        showNotification('Error resetting tiers: ' + error.message, 'error');
    });
}

window.saveTiers = function() {
    showNotification('Changes saved to database!', 'success');
}

// Add tier badge styles
const tierBadgeStyle = document.createElement('style');
tierBadgeStyle.textContent = `
    .player-cell {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .tier-badge {
        padding: 5px 10px;
        border-radius: 4px;
        font-weight: 700;
        font-size: 0.85rem;
        color: white;
    }
    
    .tier-ht1 { background: var(--ht1); }
    .tier-lt1 { background: var(--lt1); }
    .tier-ht2 { background: var(--ht2); }
    .tier-lt2 { background: var(--lt2); }
    .tier-ht3 { background: var(--ht3); color: #000; }
    .tier-lt3 { background: var(--lt3); color: #000; }
    .tier-ht4 { background: var(--ht4); }
    .tier-lt4 { background: var(--lt4); }
    .tier-ht5 { background: var(--ht5); }
    .tier-lt5 { background: var(--lt5); }
    
    .btn-small {
        padding: 5px 10px;
        font-size: 0.8rem;
    }
    
    .btn-danger {
        background: var(--error);
        color: white;
    }
    
    .btn-danger:hover {
        background: #dc2626;
    }
    
    .player-chip {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 5px 10px;
        background: var(--surface);
        border-radius: 4px;
        margin: 2px;
        font-size: 0.85rem;
    }
    
    .player-chip button {
        background: none;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        font-size: 1rem;
        line-height: 1;
    }
    
    .player-chip button:hover {
        color: var(--error);
    }
`;
document.head.appendChild(tierBadgeStyle);
