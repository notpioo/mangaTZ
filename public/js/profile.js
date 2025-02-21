
import { auth, db } from './config/firebase.js';
import { signOut, updateProfile } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// DOM Elements
const userAvatar = document.getElementById('userAvatar');
const displayName = document.getElementById('displayName');
const logoutBtn = document.getElementById('logoutBtn');
const saveProfileBtn = document.getElementById('saveProfileBtn');
let selectedAvatarUrl = '';

// Generate random avatars
function generateAvatars() {
    const avatarGrid = document.getElementById('avatarGrid');
    avatarGrid.innerHTML = '';
    
    // Generate 12 different avatar options
    const styles = ['avataaars', 'bottts', 'fun-emoji'];
    styles.forEach(style => {
        for (let i = 0; i < 2; i++) {
            const seed = Math.random().toString(36).substring(7);
            const avatarUrl = `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
            
            const avatarContainer = document.createElement('div');
            avatarContainer.className = 'avatar-option';
            
            const avatar = document.createElement('img');
            avatar.src = avatarUrl;
            avatar.alt = 'Avatar option';
            
            avatarContainer.appendChild(avatar);
            avatarContainer.addEventListener('click', () => {
                document.querySelectorAll('.avatar-option').forEach(a => a.classList.remove('selected'));
                avatarContainer.classList.add('selected');
                selectedAvatarUrl = avatarUrl;
                userAvatar.src = avatarUrl;
            });
            
            avatarGrid.appendChild(avatarContainer);
        }
    });
}

// Load user data
auth.onAuthStateChanged(async (user) => {
    if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data() || {};
        
        displayName.value = userData.displayName || user.displayName || '';
        displayNameLabel.textContent = displayName.value || 'User';
        userAvatar.src = userData.photoURL || user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`;
        selectedAvatarUrl = userData.photoURL || user.photoURL || userAvatar.src;
        
        // Update display name when input changes
        displayName.addEventListener('input', () => {
            displayNameLabel.textContent = displayName.value || 'User';
        });
    } else {
        window.location.href = '/auth.html';
    }
});

// Save profile changes
saveProfileBtn.addEventListener('click', async () => {
    try {
        const user = auth.currentUser;
        if (user) {
            const userData = {
                displayName: displayName.value,
                photoURL: selectedAvatarUrl,
                updatedAt: new Date().toISOString()
            };
            
            await Promise.all([
                updateProfile(user, userData),
                setDoc(doc(db, 'users', user.uid), userData, { merge: true })
            ]);
            
            alert('Profile updated successfully!');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Failed to update profile');
    }
});

// Save profile changes
saveProfileBtn.addEventListener('click', async () => {
    try {
        const user = auth.currentUser;
        if (user) {
            await updateProfile(user, {
                displayName: displayName.value,
                photoURL: selectedAvatarUrl
            });
            alert('Profile updated successfully!');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Failed to update profile');
    }
});

// Logout function
logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
        window.location.href = '/';
    } catch (error) {
        console.error('Error signing out:', error);
        alert('Failed to sign out');
    }
});

// Initialize avatars on page load
generateAvatars();
