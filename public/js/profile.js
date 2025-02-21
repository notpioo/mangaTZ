import { auth, db } from './config/firebase.js';
import { updateProfile } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// DOM Elements
const userAvatar = document.getElementById('userAvatar');
const displayName = document.getElementById('displayName');
const email = document.getElementById('email');
const displayNameLabel = document.getElementById('displayNameLabel');
const saveProfileBtn = document.getElementById('saveProfileBtn');

// Tab switching functionality
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;
        
        // Update active tab button
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Show correct content
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === `${tabId}Tab`) {
                content.classList.add('active');
            }
        });
    });
});

// Load user data
auth.onAuthStateChanged(async (user) => {
    if (user) {
        try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            const userData = userDoc.data() || {};
            
            // Set display name
            displayName.value = userData.displayName || user.displayName || '';
            displayNameLabel.textContent = userData.displayName || user.displayName || 'Username';
            
            // Set email
            email.value = user.email || '';
            
            // Set avatar with fallback
            if (userData.photoURL || user.photoURL) {
                userAvatar.src = userData.photoURL || user.photoURL;
            } else {
                userAvatar.src = '/images/profile.png';
            }

            // Handle avatar load error
            userAvatar.onerror = () => {
                userAvatar.src = '/images/profile.png';
            };
            
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    } else {
        window.location.href = '/auth.html';
    }
});

// Save profile changes
saveProfileBtn.addEventListener('click', async () => {
    try {
        const user = auth.currentUser;
        if (user) {
            const newDisplayName = displayName.value.trim();
            
            // Validate display name
            if (!newDisplayName) {
                alert('Display name cannot be empty');
                return;
            }
            
            const userData = {
                displayName: newDisplayName,
                updatedAt: new Date().toISOString()
            };
            
            // Update both auth profile and firestore document
            await Promise.all([
                updateProfile(user, { displayName: newDisplayName }),
                setDoc(doc(db, 'users', user.uid), userData, { merge: true })
            ]);
            
            displayNameLabel.textContent = newDisplayName;
            alert('Profile updated successfully!');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Failed to update profile. Please try again.');
    }
});