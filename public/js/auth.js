import { 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signInAnonymously,
    signOut,
    sendPasswordResetEmail
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from './config/firebase.js';

// DOM Elements
const authModal = document.getElementById('authModal');
const openAuthModalBtn = document.getElementById('openAuthModal');
const closeAuthModalBtn = document.getElementById('closeAuthModal');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const authTabs = document.querySelectorAll('.auth-tab');
const googleAuthBtn = document.querySelector('.google-auth-button');
const anonymousAuthBtn = document.querySelector('.anonymous-auth-button');
const forgotPasswordLink = document.getElementById('forgotPassword');

// Show/Hide Modal
function showAuthModal() {
    authModal.classList.add('active');
}

function hideAuthModal() {
    authModal.classList.remove('active');
    // Reset forms
    loginForm.reset();
    registerForm.reset();
}

// Event Listeners
openAuthModalBtn.addEventListener('click', showAuthModal);
closeAuthModalBtn.addEventListener('click', hideAuthModal);

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === authModal) hideAuthModal();
});

// Tab Switching
authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;
        
        authTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        document.getElementById(`${targetTab}Form`).classList.add('active');
    });
});

// Login Form Handler
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        await signInWithEmailAndPassword(auth, email, password);
        hideAuthModal();
        showToast('Successfully logged in!');
    } catch (error) {
        showToast(error.message, 'error');
    }
});

// Register Form Handler
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }
    
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Create user document
        await setDoc(doc(db, 'users', userCredential.user.uid), {
            username,
            email,
            createdAt: serverTimestamp(),
            history: [],
            bookmarks: []
        });
        
        hideAuthModal();
        showToast('Account created successfully!');
    } catch (error) {
        showToast(error.message, 'error');
    }
});

// Google Sign In
googleAuthBtn.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        
        // Check if new user
        if (result._tokenResponse.isNewUser) {
            await setDoc(doc(db, 'users', result.user.uid), {
                username: result.user.displayName,
                email: result.user.email,
                createdAt: serverTimestamp(),
                history: [],
                bookmarks: []
            });
        }
        
        hideAuthModal();
        showToast('Successfully logged in with Google!');
    } catch (error) {
        showToast(error.message, 'error');
    }
});

// Anonymous Sign In
anonymousAuthBtn.addEventListener('click', async () => {
    try {
        const result = await signInAnonymously(auth);
        
        await setDoc(doc(db, 'users', result.user.uid), {
            username: 'Anonymous User',
            createdAt: serverTimestamp(),
            history: [],
            bookmarks: []
        });
        
        hideAuthModal();
        showToast('Logged in anonymously!');
    } catch (error) {
        showToast(error.message, 'error');
    }
});

// Forgot Password
forgotPasswordLink.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    
    if (!email) {
        showToast('Please enter your email address', 'error');
        return;
    }
    
    try {
        await sendPasswordResetEmail(auth, email);
        showToast('Password reset email sent!');
    } catch (error) {
        showToast(error.message, 'error');
    }
});

// Toast notification function
function showToast(message, type = 'success') {
    // You can implement your own toast notification system here
    alert(message); // Temporary simple alert, replace with proper toast
}

// Auth State Observer
auth.onAuthStateChanged((user) => {
    const authButton = document.getElementById('openAuthModal');
    
    if (user) {
        // Update button for logged in state
        authButton.innerHTML = `
            <i class="fas fa-user"></i>
            <span>${user.displayName || 'Profile'}</span>
        `;
        document.body.classList.add('user-logged-in');
    } else {
        // Reset button to default state
        authButton.innerHTML = `
            <i class="fas fa-user"></i>
            <span>Login</span>
        `;
        document.body.classList.remove('user-logged-in');
    }
});