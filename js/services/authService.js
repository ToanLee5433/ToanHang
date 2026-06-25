// Authentication Service for Game Hub
import {
    auth,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    updateProfile,
    db,
    doc,
    setDoc,
    updateDoc,
    getDoc
} from '../config/firebase.js';
import { signInWithRedirect, getRedirectResult } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js';

class AuthService {
    constructor() {
        this.currentUser = null;
        this.authStateListeners = [];
        this.googleProvider = new GoogleAuthProvider();
        this.googleProvider.addScope('profile');
        this.googleProvider.addScope('email');
        this.googleProvider.setCustomParameters({ prompt: 'select_account' });
        this.init();
        // Check for redirect result
        this.checkRedirectResult();
    }

    init() {
        // Listen for auth state changes
        onAuthStateChanged(auth, (user) => {
            this.currentUser = user;
            this.notifyAuthStateListeners(user);
            
            if (user) {
                console.log('User signed in:', user.displayName);
                this.createUserProfileIfNotExists(user);
            } else {
                console.log('User signed out');
            }
        });
    }

    // Sign in with Google
    async signInWithGoogle() {
        try {
            console.log('🔐 Attempting Google sign-in with popup...');
            const result = await signInWithPopup(auth, this.googleProvider);
            console.log('✅ Google sign-in successful:', result.user.displayName);
            return result.user;
        } catch (error) {
            console.error('Google popup sign-in error:', error.code, error.message);
            // If popup is blocked or fails, try redirect
            if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
                console.log('🔄 Popup failed, falling back to redirect...');
                await signInWithRedirect(auth, this.googleProvider);
                return null; // Will be handled by checkRedirectResult after redirect
            }
            throw error;
        }
    }

    // Check for redirect result (called on page load)
    async checkRedirectResult() {
        try {
            const result = await getRedirectResult(auth);
            if (result && result.user) {
                console.log('✅ Google redirect sign-in successful:', result.user.displayName);
            }
        } catch (error) {
            if (error.code !== 'auth/no-current-user') {
                console.error('Redirect result error:', error);
            }
        }
    }

    // Sign out
    async signOut() {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Sign out error:', error);
            throw error;
        }
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user is signed in
    isSignedIn() {
        return !!this.currentUser;
    }

    // Add auth state listener
    onAuthStateChanged(callback) {
        this.authStateListeners.push(callback);
        // Call immediately if user is already signed in
        if (this.currentUser) {
            callback(this.currentUser);
        }
    }

    // Notify all auth state listeners
    notifyAuthStateListeners(user) {
        this.authStateListeners.forEach(callback => {
            try {
                callback(user);
            } catch (error) {
                console.error('Auth state listener error:', error);
            }
        });
    }

    // Create user profile if it doesn't exist
    async createUserProfileIfNotExists(user) {
        try {
            const userRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                const userData = {
                    uid: user.uid,
                    displayName: user.displayName || 'Anonymous',
                    email: user.email,
                    photoURL: user.photoURL,
                    createdAt: new Date(),
                    lastLogin: new Date(),
                    stats: {
                        totalGames: 0,
                        totalScore: 0,
                        achievements: []
                    },
                    gameStats: {}
                };

                await setDoc(userRef, userData);
                console.log('User profile created');
            } else {
                // Update last login
                await updateDoc(userRef, {
                    lastLogin: new Date()
                });
            }
        } catch (error) {
            console.error('Error creating/updating user profile:', error);
        }
    }

    // Update user profile
    async updateUserProfile(updates) {
        try {
            if (!this.currentUser) {
                throw new Error('No user signed in');
            }

            const userRef = doc(db, 'users', this.currentUser.uid);
            await updateDoc(userRef, updates);
            console.log('User profile updated');
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    }

    // Get user profile
    async getUserProfile() {
        try {
            if (!this.currentUser) {
                return null;
            }

            const userRef = doc(db, 'users', this.currentUser.uid);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
                return userDoc.data();
            }

            return null;
        } catch (error) {
            console.error('Error getting user profile:', error);
            return null;
        }
    }

    // Update user status
    async updateUserStatus(status) {
        try {
            await this.updateUserProfile({
                status: status,
                lastStatusUpdate: new Date()
            });
        } catch (error) {
            console.error('Error updating user status:', error);
        }
    }
}

// Create singleton instance
const authService = new AuthService();
export default authService;
