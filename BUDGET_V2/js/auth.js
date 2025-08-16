// js/auth.js
const APP_PASSWORD = '21_qpZM_21!'; // Change this to your desired password

function handleLogin(e) {
    e.preventDefault();
    const passwordInput = document.getElementById('password-input');
    const loginError = document.getElementById('login-error');
    const loginForm = document.getElementById('login-form');

    if (passwordInput.value === APP_PASSWORD) {
        sessionStorage.setItem('isLoggedIn', 'true');
        document.getElementById('login-screen').classList.add('visually-hidden');
        document.querySelector('.container').classList.add('visible');
        // Initialize the main app after successful login (from app.js)
        initializeApp();
    } else {
        loginError.textContent = 'Incorrect Password';
        loginForm.classList.add('shake');
        passwordInput.value = '';
        setTimeout(() => {
            loginForm.classList.remove('shake');
            loginError.textContent = '';
        }, 1000);
    }
}

function logout() {
    sessionStorage.removeItem('isLoggedIn');
    window.location.reload();
}

function checkAuth() {
    if (sessionStorage.getItem('isLoggedIn') === 'true') {
         document.getElementById('login-screen').classList.add('hidden');
         document.querySelector('.container').classList.add('visible');
         initializeApp(); // from app.js
    }
}

// Initial check when the page loads
document.addEventListener('DOMContentLoaded', checkAuth);