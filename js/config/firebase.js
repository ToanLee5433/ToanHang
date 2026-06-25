// Firebase Configuration for Game Hub
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js';
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider, 
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js';
import { 
    getFirestore, 
    collection, 
    addDoc, 
    query, 
    orderBy, 
    limit, 
    getDocs,
    where,
    serverTimestamp,
    updateDoc,
    doc,
    setDoc,
    getDoc,
    onSnapshot
} from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js';
import { 
    getDatabase, 
    ref as dbRef, 
    set, 
    get, 
    push, 
    onValue, 
    off 
} from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js';
import { 
    getStorage, 
    ref as storageRef, 
    uploadBytes, 
    getDownloadURL 
} from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-storage.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-analytics.js';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDwIekGMPWyR-cExKVwe5xXWEIF3P9OMhQ",
    authDomain: "gamechohangham.firebaseapp.com",
    projectId: "gamechohangham",
    storageBucket: "gamechohangham.firebasestorage.app",
    messagingSenderId: "756408901257",
    appId: "1:756408901257:web:6af134916d555bd61b3058",
    measurementId: "G-ECNQQN35XG",
    databaseURL: "https://gamechohangham-default-rtdb.firebaseio.com"
};

// Export config globally for compat scripts
window.firebaseConfig = firebaseConfig;

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const realtimeDb = getDatabase(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

// Export all Firebase functions
export {
    // Auth functions
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    updateProfile,
    
    // Firestore functions
    collection,
    addDoc,
    query,
    orderBy,
    limit,
    getDocs,
    where,
    serverTimestamp,
    updateDoc,
    doc,
    setDoc,
    getDoc,
    onSnapshot,
    
    // Realtime Database functions
    dbRef,
    set,
    get,
    push,
    onValue,
    off,
    
    // Storage functions
    storageRef,
    uploadBytes,
    getDownloadURL
};

// Google Auth Provider with custom settings
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

// Firebase Auth Class
class FirebaseAuth {
    constructor() {
        this.currentUser = null;
        this.authStateListeners = [];
        this.init();
    }

    init() {
        // Listen for auth state changes
        onAuthStateChanged(auth, (user) => {
            this.currentUser = user;
            this.notifyAuthStateListeners(user);
            
            if (user) {
                console.log('User signed in:', user.displayName);
            } else {
                console.log('User signed out');
            }
        }, (error) => {
            console.error('Auth state change error:', error);
        });
    }

    // Sign in with Google
    async signInWithGoogle() {
        try {
            console.log('Attempting Google sign-in...');
            const result = await signInWithPopup(auth, googleProvider);
            console.log('Google sign-in successful:', result.user.displayName);
            return result.user;
        } catch (error) {
            console.error('Google sign-in error:', error);
            
            // Provide user-friendly error messages
            let errorMessage = 'Đăng nhập thất bại. Vui lòng thử lại.';
            
            switch (error.code) {
                case 'auth/popup-closed-by-user':
                    errorMessage = 'Đăng nhập bị hủy. Vui lòng thử lại.';
                    break;
                case 'auth/popup-blocked':
                    errorMessage = 'Popup bị chặn. Vui lòng cho phép popup và thử lại.';
                    break;
                case 'auth/cancelled-popup-request':
                    errorMessage = 'Đăng nhập bị hủy. Vui lòng thử lại.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại.';
                    break;
                case 'auth/operation-not-allowed':
                    errorMessage = 'Đăng nhập Google chưa được bật. Vui lòng liên hệ admin.';
                    break;
                default:
                    errorMessage = `Lỗi đăng nhập: ${error.message}`;
            }
            
            throw new Error(errorMessage);
        }
    }

    // Sign out
    async signOut() {
        try {
            await signOut(auth);
            console.log('User signed out successfully');
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
}

// Firebase Database Class
class FirebaseDB {
    constructor() {
        this.scoresCollection = collection(db, 'scores');
        this.usersCollection = collection(db, 'users');
    }

    // Save score to leaderboard
    async saveScore(score, level, lines, gameMode = 'single') {
        try {
            if (!auth.currentUser) {
                throw new Error('User must be signed in to save score');
            }

            const scoreData = {
                userId: auth.currentUser.uid,
                userName: auth.currentUser.displayName || 'Anonymous',
                userEmail: auth.currentUser.email,
                score: score,
                level: level,
                lines: lines,
                gameMode: gameMode,
                timestamp: serverTimestamp(),
                date: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
            };

            const docRef = await addDoc(this.scoresCollection, scoreData);
            console.log('Score saved with ID:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Error saving score:', error);
            throw error;
        }
    }

    // Get leaderboard data
    async getLeaderboard(mode = 'all-time', limit = 10) {
        try {
            let q;
            
            switch (mode) {
                case 'daily':
                    const today = new Date().toISOString().split('T')[0];
                    q = query(
                        this.scoresCollection,
                        where('date', '==', today),
                        orderBy('score', 'desc'),
                        limit(limit)
                    );
                    break;
                    
                case 'weekly':
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    q = query(
                        this.scoresCollection,
                        where('timestamp', '>=', weekAgo),
                        orderBy('score', 'desc'),
                        limit(limit)
                    );
                    break;
                    
                case 'all-time':
                default:
                    q = query(
                        this.scoresCollection,
                        orderBy('score', 'desc'),
                        limit(limit)
                    );
                    break;
            }

            const querySnapshot = await getDocs(q);
            const scores = [];
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                scores.push({
                    id: doc.id,
                    userName: data.userName,
                    score: data.score,
                    level: data.level,
                    lines: data.lines,
                    gameMode: data.gameMode,
                    timestamp: data.timestamp?.toDate() || new Date(),
                    date: data.date
                });
            });

            return scores;
        } catch (error) {
            console.error('Error getting leaderboard:', error);
            throw error;
        }
    }

    // Get user's best score
    async getUserBestScore(gameMode = 'single') {
        try {
            if (!auth.currentUser) {
                return null;
            }

            const q = query(
                this.scoresCollection,
                where('userId', '==', auth.currentUser.uid),
                where('gameMode', '==', gameMode),
                orderBy('score', 'desc'),
                limit(1)
            );

            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                const data = doc.data();
                return {
                    id: doc.id,
                    score: data.score,
                    level: data.level,
                    lines: data.lines,
                    timestamp: data.timestamp?.toDate() || new Date()
                };
            }

            return null;
        } catch (error) {
            console.error('Error getting user best score:', error);
            throw error;
        }
    }

    // Get user's rank
    async getUserRank(score, gameMode = 'single') {
        try {
            const q = query(
                this.scoresCollection,
                where('gameMode', '==', gameMode),
                orderBy('score', 'desc')
            );

            const querySnapshot = await getDocs(q);
            let rank = 1;
            
            for (const doc of querySnapshot.docs) {
                const data = doc.data();
                if (data.score > score) {
                    rank++;
                } else {
                    break;
                }
            }

            return rank;
        } catch (error) {
            console.error('Error getting user rank:', error);
            throw error;
        }
    }

    // Save user profile
    async saveUserProfile(profile) {
        try {
            if (!auth.currentUser) {
                throw new Error('User must be signed in to save profile');
            }

            const userData = {
                uid: auth.currentUser.uid,
                displayName: auth.currentUser.displayName,
                email: auth.currentUser.email,
                photoURL: auth.currentUser.photoURL,
                ...profile,
                lastUpdated: serverTimestamp()
            };

            // Check if user document exists
            const userQuery = query(
                this.usersCollection,
                where('uid', '==', auth.currentUser.uid)
            );
            const userSnapshot = await getDocs(userQuery);

            if (userSnapshot.empty) {
                // Create new user document
                await addDoc(this.usersCollection, userData);
            } else {
                // Update existing user document
                const userDoc = userSnapshot.docs[0];
                await updateDoc(doc(db, 'users', userDoc.id), userData);
            }

            console.log('User profile saved');
        } catch (error) {
            console.error('Error saving user profile:', error);
            throw error;
        }
    }

    // Get user profile
    async getUserProfile() {
        try {
            if (!auth.currentUser) {
                return null;
            }

            const q = query(
                this.usersCollection,
                where('uid', '==', auth.currentUser.uid)
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                return doc.data();
            }

            return null;
        } catch (error) {
            console.error('Error getting user profile:', error);
            throw error;
        }
    }
}

// Analytics Class
class FirebaseAnalytics {
    constructor() {
        this.events = [];
    }

    // Track game event
    trackEvent(eventName, parameters = {}) {
        try {
            const event = {
                name: eventName,
                parameters: {
                    ...parameters,
                    timestamp: new Date().toISOString(),
                    userId: auth.currentUser?.uid || 'anonymous'
                }
            };

            this.events.push(event);
            console.log('Analytics event:', event);

            // Send to Firebase Analytics if available
            if (analytics && window.gtag) {
                window.gtag('event', eventName, parameters);
            }
        } catch (error) {
            console.error('Error tracking event:', error);
        }
    }

    // Track game start
    trackGameStart(gameMode) {
        this.trackEvent('game_start', { gameMode });
    }

    // Track game end
    trackGameEnd(gameMode, score, level, lines) {
        this.trackEvent('game_end', { 
            gameMode, 
            score, 
            level, 
            lines 
        });
    }

    // Track line clear
    trackLineClear(linesCleared, level) {
        this.trackEvent('line_clear', { 
            linesCleared, 
            level 
        });
    }

    // Track multiplayer event
    trackMultiplayerEvent(eventType, roomCode) {
        this.trackEvent('multiplayer_event', { 
            eventType, 
            roomCode 
        });
    }
}

// Export Firebase instances
window.FirebaseAuth = FirebaseAuth;
window.FirebaseDB = FirebaseDB;
window.FirebaseAnalytics = FirebaseAnalytics;

// Create global instances
window.firebaseAuth = new FirebaseAuth();
window.firebaseDB = new FirebaseDB();
window.firebaseAnalytics = new FirebaseAnalytics();

console.log('🔥 Firebase initialized successfully for Game Hub');
