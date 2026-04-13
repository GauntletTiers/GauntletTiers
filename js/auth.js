const Auth = {
    isLoggedIn: false,
    isAdmin: false,
    user: null,
    
    init() {
        // Check localStorage for session
        this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        this.isAdmin = localStorage.getItem('isAdmin') === 'true';
        this.user = localStorage.getItem('userEmail');
        
        return this;
    },
    
    login(email, password) {
        // Admin authentication
        if (email === 'support.gauntlettiers@gmail.com') {
            this.isAdmin = true;
            this.isLoggedIn = true;
            this.user = email;
            
            localStorage.setItem('isAdmin', 'true');
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userEmail', email);
            
            return { success: true, isAdmin: true };
        }
        
        // Regular user authentication (mock)
        if (email && password.length >= 6) {
            this.isLoggedIn = true;
            this.user = email;
            
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userEmail', email);
            
            return { success: true, isAdmin: false };
        }
        
        return { success: false, error: 'Invalid credentials' };
    },
    
    signup(username, email, password) {
        // Mock signup - in production, this would create a database entry
        if (username && email && password.length >= 6) {
            this.isLoggedIn = true;
            this.user = email;
            
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userEmail', email);
            localStorage.setItem('username', username);
            
            return { success: true };
        }
        
        return { success: false, error: 'Invalid registration data' };
    },
    
    logout() {
        this.isLoggedIn = false;
        this.isAdmin = false;
        this.user = null;
        
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('username');
        
        return true;
    },
    
    requireAuth() {
        if (!this.isLoggedIn) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    },
    
    requireAdmin() {
        if (!this.isAdmin) {
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }
};

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', function() {
    Auth.init();
    
    // Update navigation based on auth state
    updateNavigation();
    
    // Handle login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Handle signup form
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
});

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const remember = document.querySelector('input[name="remember"]')?.checked;
    
    const result = Auth.login(email, password);
    
    if (result.success) {
        showNotification('Login successful!', 'success');
        
        setTimeout(() => {
            if (result.isAdmin) {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'index.html';
            }
        }, 1000);
    } else {
        showNotification(result.error, 'error');
    }
}

function handleSignup(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match!', 'error');
        return;
    }
    
    const result = Auth.signup(username, email, password);
    
    if (result.success) {
        showNotification('Account created successfully!', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } else {
        showNotification(result.error, 'error');
    }
}

function updateNavigation() {
    const navAuth = document.querySelector('.nav-auth');
    if (!navAuth) return;
    
    if (Auth.isLoggedIn) {
        const displayName = Auth.user === 'support.gauntlettiers@gmail.com' ? 'Admin' : Auth.user;
        navAuth.innerHTML = `
            <div class="user-menu">
                <span class="user-email">${displayName}</span>
                <button class="btn btn-outline" onclick="handleLogout()">Logout</button>
            </div>
        `;
    } else {
        navAuth.innerHTML = `
            <a href="login.html" class="btn btn-outline">Log In</a>
            <a href="signup.html" class="btn btn-primary">Sign Up</a>
        `;
    }
}

function handleLogout() {
    Auth.logout();
    showNotification('Logged out successfully', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Password strength indicator
function checkPasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/\\d/)) strength++;
    if (password.match(/[^a-zA-Z\\d]/)) strength++;
    
    return strength;
}

// Social login handlers
function loginWithDiscord() {
    // In production, this would redirect to Discord OAuth
    showNotification('Discord login coming soon!', 'info');
}

// Export for global access
window.Auth = Auth;
window.handleLogout = handleLogout;