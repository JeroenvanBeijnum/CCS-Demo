// Authentication functionality for Fruit Shop

class AuthManager {
  constructor() {
    this.currentUser = null;
    this.init();
  }

  init() {
    // Load user from localStorage if exists
    this.loadCurrentUser();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Update UI based on auth state
    this.updateAuthUI();
  }

  setupEventListeners() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterBtn = document.getElementById('show-register');
    const showLoginBtn = document.getElementById('show-login');

    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    if (registerForm) {
      registerForm.addEventListener('submit', (e) => this.handleRegister(e));
    }

    if (showRegisterBtn) {
      showRegisterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleForms('register');
      });
    }

    if (showLoginBtn) {
      showLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleForms('login');
      });
    }

    // Set up logout functionality for all pages
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('logout-btn')) {
        e.preventDefault();
        this.logout();
      }
    });
  }

  toggleForms(formType) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const formTitle = document.getElementById('form-title');
    const formSubtitle = document.getElementById('form-subtitle');

    if (formType === 'register') {
      loginForm.style.display = 'none';
      registerForm.style.display = 'block';
      formTitle.textContent = 'Create Account';
      formSubtitle.textContent = 'Join our fruit community';
    } else {
      loginForm.style.display = 'block';
      registerForm.style.display = 'none';
      formTitle.textContent = 'Welcome Back!';
      formSubtitle.textContent = 'Sign in to your account';
    }

    this.clearMessage();
  }

  handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!this.validateEmail(email)) {
      this.showMessage('Please enter a valid email address', 'error');
      return;
    }

    if (!password) {
      this.showMessage('Please enter your password', 'error');
      return;
    }

    // Check if user exists in localStorage
    const users = this.getStoredUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
      this.showMessage('No account found with this email address', 'error');
      return;
    }

    if (user.password !== password) {
      this.showMessage('Incorrect password', 'error');
      return;
    }

    // Login successful
    this.currentUser = user;
    this.saveCurrentUser();
    this.showMessage('Login successful! Redirecting...', 'success');
    
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1500);
  }

  handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const address = document.getElementById('register-address').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm').value;

    // Validation
    if (!name.trim()) {
      this.showMessage('Please enter your full name', 'error');
      return;
    }

    if (!this.validateEmail(email)) {
      this.showMessage('Please enter a valid email address', 'error');
      return;
    }

    if (!address.trim()) {
      this.showMessage('Please enter your address', 'error');
      return;
    }

    if (password.length < 6) {
      this.showMessage('Password must be at least 6 characters long', 'error');
      return;
    }

    if (password !== confirmPassword) {
      this.showMessage('Passwords do not match', 'error');
      return;
    }

    // Check if user already exists
    const users = this.getStoredUsers();
    if (users.find(u => u.email === email)) {
      this.showMessage('An account with this email already exists', 'error');
      return;
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email,
      address: address.trim(),
      password: password,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    this.saveUsers(users);

    // Auto-login the new user
    this.currentUser = newUser;
    this.saveCurrentUser();
    
    this.showMessage('Account created successfully! Redirecting...', 'success');
    
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1500);
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
    this.updateAuthUI();
    
    // If on login page, just update UI, otherwise redirect
    if (window.location.pathname.includes('login.html')) {
      this.showMessage('You have been logged out', 'success');
    } else {
      window.location.href = 'login.html';
    }
  }

  updateAuthUI() {
    // Update navigation based on auth state
    this.updateNavigation();
  }

  updateNavigation() {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    // Remove existing auth links
    const existingAuthLinks = navLinks.querySelectorAll('.auth-link, .user-info');
    existingAuthLinks.forEach(link => link.remove());

    if (this.currentUser) {
      // User is logged in - show profile link and user info
      const profileLink = document.createElement('a');
      profileLink.href = 'profile.html';
      profileLink.className = 'auth-link';
      profileLink.textContent = 'My Profile';
      
      // Add active class if on profile page
      if (window.location.pathname.includes('profile.html')) {
        profileLink.classList.add('active');
      }
      
      const userInfo = document.createElement('div');
      userInfo.className = 'user-info auth-link';
      userInfo.innerHTML = `
        <span class="user-welcome">Hi, ${this.currentUser.name.split(' ')[0]}!</span>
        <button class="logout-btn">Logout</button>
      `;
      
      navLinks.appendChild(profileLink);
      navLinks.appendChild(userInfo);
    } else {
      // User is not logged in - show login link
      const loginLink = document.createElement('a');
      loginLink.href = 'login.html';
      loginLink.className = 'auth-link';
      loginLink.textContent = 'Login';
      
      // Add active class if on login page
      if (window.location.pathname.includes('login.html')) {
        loginLink.classList.add('active');
      }
      
      navLinks.appendChild(loginLink);
    }
  }

  // Utility methods
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  getStoredUsers() {
    const users = localStorage.getItem('fruitShopUsers');
    return users ? JSON.parse(users) : [];
  }

  saveUsers(users) {
    localStorage.setItem('fruitShopUsers', JSON.stringify(users));
  }

  loadCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      this.currentUser = JSON.parse(userData);
    }
  }

  saveCurrentUser() {
    if (this.currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    }
  }

  showMessage(text, type = 'info') {
    const messageDiv = document.getElementById('message');
    if (!messageDiv) return;

    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';

    // Auto-hide error messages after 5 seconds
    if (type === 'error') {
      setTimeout(() => {
        this.clearMessage();
      }, 5000);
    }
  }

  clearMessage() {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
      messageDiv.style.display = 'none';
      messageDiv.textContent = '';
      messageDiv.className = 'message';
    }
  }

  // Public method to check if user is logged in
  isLoggedIn() {
    return this.currentUser !== null;
  }

  // Public method to get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Public method to update user profile
  updateUserProfile(updatedData) {
    if (!this.currentUser) {
      return false;
    }

    const users = this.getStoredUsers();
    const userIndex = users.findIndex(u => u.id === this.currentUser.id);
    
    if (userIndex === -1) {
      return false;
    }

    // Update user in storage
    users[userIndex] = { ...users[userIndex], ...updatedData };
    this.saveUsers(users);

    // Update current user session
    this.currentUser = { ...this.currentUser, ...updatedData };
    this.saveCurrentUser();

    // Update navigation
    this.updateNavigation();

    return true;
  }
}

// Initialize auth manager when DOM is loaded
let authManager;

function initializeAuthManager() {
  authManager = new AuthManager();
  window.authManager = authManager;
  
  // Fire a custom event to let other scripts know authManager is ready
  document.dispatchEvent(new CustomEvent('authManagerReady', {
    detail: { authManager: authManager }
  }));
  
  console.log('AuthManager initialized and ready');
}

if (document.readyState !== 'loading') {
  initializeAuthManager();
} else {
  document.addEventListener('DOMContentLoaded', initializeAuthManager);
}
