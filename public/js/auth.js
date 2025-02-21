
import { auth, db } from './config/firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const googleProvider = new GoogleAuthProvider();
let isLoginMode = true;

// Check auth state
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is logged in, redirect to home if on auth page
        if (window.location.pathname === '/auth.html') {
            window.location.href = '/';
        }
    }
});

// Only initialize auth form if we're on the auth page
if (window.location.pathname === '/auth.html') {
    const authForm = document.getElementById('authForm');
    const authTitle = document.getElementById('authTitle');
    const authSubtitle = document.getElementById('authSubtitle');
    const switchText = document.getElementById('switchText');
    const switchAuth = document.getElementById('switchAuth');
    const authSubmit = document.getElementById('authSubmit');

    // Switch between login and register
    switchAuth.addEventListener('click', (e) => {
        e.preventDefault();
        isLoginMode = !isLoginMode;
        if (isLoginMode) {
            authTitle.textContent = 'Login';
            authSubtitle.textContent = 'Welcome back to MangaTZ!';
            authSubmit.textContent = 'Login';
            switchText.textContent = "Don't have an account?";
            switchAuth.textContent = 'Register';
        } else {
            authTitle.textContent = 'Register';
            authSubtitle.textContent = 'Create your MangaTZ account';
            authSubmit.textContent = 'Register';
            switchText.textContent = 'Already have an account?';
            switchAuth.textContent = 'Login';
        }
    });

    // Handle form submission
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            if (isLoginMode) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await setDoc(doc(db, 'users', userCredential.user.uid), {
                    email: email,
                    createdAt: new Date().toISOString(),
                    history: [],
                    favorites: [],
                    bookmarks: []
                });
            }
            window.location.href = '/';
        } catch (error) {
            alert(error.message);
        }
    });

    // Google Auth
    document.getElementById('googleAuth').addEventListener('click', async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            await setDoc(doc(db, 'users', result.user.uid), {
                email: result.user.email,
                createdAt: new Date().toISOString(),
                history: [],
                favorites: [],
                bookmarks: []
            }, { merge: true });
            window.location.href = '/';
        } catch (error) {
            alert(error.message);
        }
    });
}

// Handle auth state for nav button
const updateAuthButton = (user) => {
    const authButton = document.getElementById('authButton');
    if (!authButton) return;
    
    if (user) {
        const avatarUrl = user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`;
        authButton.innerHTML = `<img src="${avatarUrl}" alt="Profile" style="width: 24px; height: 24px; border-radius: 50%;">`;
        authButton.href = '/profile.html';
    } else {
        authButton.innerHTML = '<i class="fas fa-user"></i>';
        authButton.href = '/auth.html';
    }
};

// Listen for auth state changes
auth.onAuthStateChanged(updateAuthButton);

export { auth };
