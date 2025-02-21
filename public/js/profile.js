
import { auth, db } from './config/firebase.js';
import { updateProfile, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// DOM Elements
const userAvatar = document.getElementById('userAvatar');
const displayName = document.getElementById('displayName');
const displayNameLabel = document.getElementById('displayNameLabel');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const changePasswordBtn = document.getElementById('changePasswordBtn');
const moreBtn = document.querySelector('.more-btn');
const moreMenu = document.getElementById('moreMenu');
const logoutBtn = document.getElementById('logoutBtn');

// Tab switching functionality
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        
        // Remove active class from all buttons and contents
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked button and corresponding content
        btn.classList.add('active');
        document.getElementById(`${tabId}Tab`).classList.add('active');
    });
});

// Toggle more menu
moreBtn.addEventListener('click', () => {
    moreMenu.style.display = moreMenu.style.display === 'none' ? 'block' : 'none';
});

// Close more menu when clicking outside
document.addEventListener('click', (e) => {
    if (!moreBtn.contains(e.target) && !moreMenu.contains(e.target)) {
        moreMenu.style.display = 'none';
    }
});

// Logout functionality
logoutBtn.addEventListener('click', () => {
    auth.signOut().then(() => {
        window.location.href = '/auth.html';
    });
});

// Change password functionality
changePasswordBtn.addEventListener('click', async () => {
    const user = auth.currentUser;
    if (user) {
        try {
            const result = await Swal.fire({
                title: 'Change Password',
                text: 'Are you sure you want to change your password? An email will be sent to reset your password.',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, send email'
            });

            if (result.isConfirmed) {
                await sendPasswordResetEmail(auth, user.email);
                await Swal.fire(
                    'Email Sent!',
                    'Check your email for password reset instructions.',
                    'success'
                );
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire(
                'Error',
                'Failed to send password reset email. Please try again.',
                'error'
            );
        }
    }
});

// Load user data
auth.onAuthStateChanged(async (user) => {
    if (user) {
        try {
            // Set default avatar
            userAvatar.src = '/images/profile.png';
            
            // Get user data from Firestore
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                displayName.value = userData.displayName || '';
                displayNameLabel.textContent = userData.displayName || 'Username';
            }
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
                Swal.fire('Error', 'Display name cannot be empty', 'error');
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
            await Swal.fire('Success', 'Profile updated successfully!', 'success');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        await Swal.fire('Error', 'Failed to update profile. Please try again.', 'error');
    }
});
