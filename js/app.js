class GauntletApp {
    constructor() {
        this.currentUser = null;
        this.isAdmin = false;
        this.init();
    }

    init() {
        this.checkAuth();
        this.initParticles();
        this.updateStats();
        this.setupMobileMenu();
        
        // Global data storage key
        this.DATA_KEY = 'gauntlet_tiers_data';
        this.USERS_KEY = 'gauntlet_users';
        this.CURRENT_USER_KEY = 'gauntlet_current_user';
        
        // Initialize data if not exists
        if (!localStorage.getItem(this.DATA_KEY)) {
            this.initializeDefaultData();
        }
    }

    initializeDefaultData() {
        const defaultData = {
            players: [
                { id: 1, name: 'ExamplePlayer1', tier: 'HT1', mode: 'sword', rating: 2850, tournaments: 15, wins: 12 },
                { id: 2, name: 'ExamplePlayer2', tier: 'HT2', mode: 'sword', rating: 2720, tournaments: 22, wins: 18 },
                { id: 3, name: 'ExamplePlayer3', tier: 'HT3', mode: 'axe', rating: 2650, tournaments: 18, wins: 14 },
                { id: 4, name: 'ExamplePlayer4', tier: 'LT1', mode: 'uhc', rating: 2580, tournaments: 20, wins: 15 },
                { id: 5, name: 'ExamplePlayer5', tier: 'LT2', mode: 'pot', rating: 2450, tournaments: 12, wins: 8 },
            ],
            tournaments: [
                { id: 1, name: 'Gauntlet Open #1', date: '2026-04-01', mode: 'sword', participants: 64, status: 'completed' },
                { id: 2, name: 'Spring Championship', date: '2026-04-15', mode: 'uhc', participants: 32, status: 'ongoing' }
            ],
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem(this.DATA_KEY, JSON.stringify(defaultData));
    }

    checkAuth() {
        const user = localStorage.getItem('gauntlet_current_user');
        if (user) {
            this.currentUser = JSON.parse(user);
            this.isAdmin = this.currentUser.email === 'support.gauntlettiers@gmail.com';
            this.updateUIForUser();
        }
    }

    updateUIForUser() {
        const authLinks = document.getElementById('auth-links');
        const userMenu = document.getElementById('user-menu');
        const userEmail = document.getElementById('user-email');
        const adminLink = document.getElementById('admin-link');

        if (authLinks && userMenu) {
            authLinks.classList.add('hidden');
            userMenu.classList.remove('hidden');
            userEmail.textContent = this.currentUser.email;
            
            if (this.isAdmin && adminLink) {
                adminLink.classList.remove('hidden');
            }
        }
    }

    initParticles() {
        const container = document.getElementById('particles');
        if (!container) return;

        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 20 + 's';
            particle.style.animationDuration = (15 + Math.random() * 10) + 's';
            container.appendChild(particle);
        }
    }

    updateStats() {
        const data = JSON.parse(localStorage.getItem(this.DATA_KEY) || '{}');
        const players = data.players || [];
        const tournaments = data.tournaments || [];

        const playersEl = document.getElementById('stat-players');
        const tournamentsEl = document.getElementById('stat-tournaments');

        if (playersEl) {
            this.animateNumber(playersEl, players.length);
        }
        if (tournamentsEl) {
            this.animateNumber(tournamentsEl, tournaments.length);
        }
    }

    animateNumber(element, target) {
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 30);
    }

    setupMobileMenu() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');

        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            });

            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                });
            });
        }
    }

    // Data Management for Cross-Device Sync
    exportData() {
        const data = {
            tierData: localStorage.getItem(this.DATA_KEY),
            users: localStorage.getItem(this.USERS_KEY),
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gauntlet-tiers-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        return true;
    }

    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.tierData) localStorage.setItem(this.DATA_KEY, data.tierData);
                    if (data.users) localStorage.setItem(this.USERS_KEY, data.users);
                    resolve(true);
                } catch (err) {
                    reject(err);
                }
            };
            reader.readAsText(file);
        });
    }

    // Cloud sync simulation using a simple backend API endpoint
    // In production, replace with actual Firebase/Supabase calls
    async syncToCloud() {
        // Simulated cloud sync - in real implementation, this would POST to your API
        console.log('Syncing to cloud...');
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({ success: true, timestamp: new Date().toISOString() });
            }, 1000);
        });
    }
}

// Initialize app
const app = new GauntletApp();

// Logout function (global scope for onclick)
function logout() {
    localStorage.removeItem('gauntlet_current_user');
    window.location.href = 'index.html';
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GauntletApp;
}