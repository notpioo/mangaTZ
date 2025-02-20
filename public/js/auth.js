import { auth, db } from './config/firebase.js';
import { 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    sendPasswordResetEmail
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

document.getElementById('loginButton').addEventListener('click', showAuthModal);

const auth = getAuth();
const db = getFirestore();
const googleProvider = new GoogleAuthProvider();

// DOM Elements
const authModal = document.getElementById('authModal');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const authTabs = document.querySelectorAll('.auth-tab');
const googleAuthBtn = document.querySelector('.google-auth-button');
const forgotPasswordLink = document.getElementById('forgotPassword');

// Show/Hide Auth Modal
export function showAuthModal() {
    authModal.classList.add('active');
}

export function hideAuthModal() {
    authModal.classList.remove('active');
}

// Tab Switching
authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;
        
        // Update active tab
        authTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Show corresponding form
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        document.getElementById(`${targetTab}Form`).classList.add('active');
    });
});

// Login Form Submit
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        hideAuthModal();
        // Additional success handling
    } catch (error) {
        console.error('Login error:', error);
        // Show error to user
    }
});

// Register Form Submit
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Create user document in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
            username,
            email,
            createdAt: serverTimestamp(),
            history: [],
            bookmarks: []
        });
        
        hideAuthModal();
        // Additional success handling
    } catch (error) {
        console.error('Registration error:', error);
        // Show error to user
    }
});

// Google Sign In
googleAuthBtn.addEventListener('click', async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        
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
    } catch (error) {
        console.error('Google sign in error:', error);
        // Show error to user
    }
});

// Forgot Password
forgotPasswordLink.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    
    if (!email) {
        alert('Please enter your email address');
        return;
    }
    
    try {
        await sendPasswordResetEmail(auth, email);
        alert('Password reset email sent!');
    } catch (error) {
        console.error('Password reset error:', error);
        // Show error to user
    }
});

// Auth State Observer
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        document.body.classList.add('user-logged-in');
        // Update UI for logged in state
    } else {
        // User is signed out
        document.body.classList.remove('user-logged-in');
        // Update UI for logged out state
    }
});