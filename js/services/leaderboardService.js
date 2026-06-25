// Leaderboard Service for Game Hub
import { 
    db, 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    addDoc, 
    updateDoc, 
    query, 
    where, 
    orderBy, 
    limit, 
    onSnapshot,
    serverTimestamp 
} from '../config/firebase.js';

class LeaderboardService {
    constructor() {
        this.leaderboardsRef = collection(db, 'leaderboards');
        this.achievementsRef = collection(db, 'achievements');
        this.userStatsRef = collection(db, 'userStats');
        this.tournamentsRef = collection(db, 'tournaments');
    }

    // Save score to leaderboard
    async saveScore(gameType, scoreData) {
        try {
            const score = {
                gameType: gameType,
                userId: scoreData.userId,
                userName: scoreData.userName,
                userEmail: scoreData.userEmail,
                score: scoreData.score,
                level: scoreData.level || 1,
                lines: scoreData.lines || 0,
                time: scoreData.time || 0,
                gameMode: scoreData.gameMode || 'single',
                timestamp: serverTimestamp(),
                date: new Date().toISOString().split('T')[0],
                metadata: scoreData.metadata || {}
            };

            const docRef = await addDoc(this.leaderboardsRef, score);
            
            // Update user stats
            await this.updateUserStats(gameType, scoreData);
            
            // Check for achievements
            await this.checkAchievements(gameType, scoreData);
            
            return { success: true, scoreId: docRef.id };
        } catch (error) {
            console.error('Error saving score:', error);
            return { success: false, error: error.message };
        }
    }

    // Get leaderboard
    async getLeaderboard(gameType, mode = 'all-time', limitCount = 50) {
        try {
            let q;
            
            switch (mode) {
                case 'daily':
                    const today = new Date().toISOString().split('T')[0];
                    q = query(
                        this.leaderboardsRef,
                        where('gameType', '==', gameType),
                        where('date', '==', today),
                        orderBy('score', 'desc'),
                        limit(limitCount)
                    );
                    break;
                    
                case 'weekly':
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    q = query(
                        this.leaderboardsRef,
                        where('gameType', '==', gameType),
                        where('timestamp', '>=', weekAgo),
                        orderBy('score', 'desc'),
                        limit(limitCount)
                    );
                    break;
                    
                case 'monthly':
                    const monthAgo = new Date();
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    q = query(
                        this.leaderboardsRef,
                        where('gameType', '==', gameType),
                        where('timestamp', '>=', monthAgo),
                        orderBy('score', 'desc'),
                        limit(limitCount)
                    );
                    break;
                    
                case 'all-time':
                default:
                    q = query(
                        this.leaderboardsRef,
                        where('gameType', '==', gameType),
                        orderBy('score', 'desc'),
                        limit(limitCount)
                    );
                    break;
            }

            const querySnapshot = await getDocs(q);
            const scores = [];
            let rank = 1;
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                scores.push({
                    id: doc.id,
                    rank: rank++,
                    userName: data.userName,
                    score: data.score,
                    level: data.level,
                    lines: data.lines,
                    time: data.time,
                    gameMode: data.gameMode,
                    timestamp: data.timestamp?.toDate() || new Date(),
                    date: data.date
                });
            });

            return { success: true, scores };
        } catch (error) {
            console.error('Error getting leaderboard:', error);
            return { success: false, error: error.message };
        }
    }

    // Get user's best score
    async getUserBestScore(gameType, gameMode = 'single') {
        try {
            const q = query(
                this.leaderboardsRef,
                where('gameType', '==', gameType),
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
            return null;
        }
    }

    // Get user's rank
    async getUserRank(gameType, score, gameMode = 'single') {
        try {
            const q = query(
                this.leaderboardsRef,
                where('gameType', '==', gameType),
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
            return null;
        }
    }

    // Update user statistics
    async updateUserStats(gameType, scoreData) {
        try {
            const statsRef = doc(this.userStatsRef, scoreData.userId);
            const statsDoc = await getDoc(statsRef);
            
            let stats = statsDoc.exists() ? statsDoc.data() : {
                userId: scoreData.userId,
                userName: scoreData.userName,
                totalGames: 0,
                totalScore: 0,
                achievements: [],
                gameStats: {}
            };

            // Update general stats
            stats.totalGames++;
            stats.totalScore += scoreData.score;
            stats.lastPlayed = serverTimestamp();

            // Update game-specific stats
            if (!stats.gameStats[gameType]) {
                stats.gameStats[gameType] = {
                    gamesPlayed: 0,
                    totalScore: 0,
                    bestScore: 0,
                    totalLines: 0,
                    totalTime: 0,
                    wins: 0,
                    losses: 0
                };
            }

            const gameStats = stats.gameStats[gameType];
            gameStats.gamesPlayed++;
            gameStats.totalScore += scoreData.score;
            gameStats.totalLines += scoreData.lines || 0;
            gameStats.totalTime += scoreData.time || 0;

            if (scoreData.score > gameStats.bestScore) {
                gameStats.bestScore = scoreData.score;
            }

            // Update win/loss stats for multiplayer games
            if (scoreData.gameMode === 'multiplayer') {
                if (scoreData.winner) {
                    gameStats.wins++;
                } else {
                    gameStats.losses++;
                }
            }

            await setDoc(statsRef, stats);
            return { success: true };
        } catch (error) {
            console.error('Error updating user stats:', error);
            return { success: false, error: error.message };
        }
    }

    // Get user statistics
    async getUserStats(userId) {
        try {
            const statsRef = doc(this.userStatsRef, userId);
            const statsDoc = await getDoc(statsRef);
            
            if (statsDoc.exists()) {
                return statsDoc.data();
            }
            
            return null;
        } catch (error) {
            console.error('Error getting user stats:', error);
            return null;
        }
    }

    // Check and award achievements
    async checkAchievements(gameType, scoreData) {
        try {
            const achievements = await this.getAchievements(gameType);
            const userStats = await this.getUserStats(scoreData.userId);
            
            if (!userStats) return;

            const newAchievements = [];
            
            for (const achievement of achievements) {
                if (userStats.achievements.includes(achievement.id)) {
                    continue; // Already earned
                }

                let earned = false;
                
                switch (achievement.type) {
                    case 'score':
                        earned = scoreData.score >= achievement.requirement;
                        break;
                        
                    case 'lines':
                        earned = (scoreData.lines || 0) >= achievement.requirement;
                        break;
                        
                    case 'level':
                        earned = (scoreData.level || 1) >= achievement.requirement;
                        break;
                        
                    case 'games_played':
                        const gameStats = userStats.gameStats[gameType];
                        earned = gameStats && gameStats.gamesPlayed >= achievement.requirement;
                        break;
                        
                    case 'total_score':
                        const totalScore = userStats.gameStats[gameType]?.totalScore || 0;
                        earned = totalScore >= achievement.requirement;
                        break;
                        
                    case 'wins':
                        const wins = userStats.gameStats[gameType]?.wins || 0;
                        earned = wins >= achievement.requirement;
                        break;
                }

                if (earned) {
                    newAchievements.push(achievement);
                }
            }

            // Award new achievements
            if (newAchievements.length > 0) {
                await this.awardAchievements(scoreData.userId, newAchievements);
            }

            return newAchievements;
        } catch (error) {
            console.error('Error checking achievements:', error);
            return [];
        }
    }

    // Get achievements for a game type
    async getAchievements(gameType) {
        try {
            const q = query(
                this.achievementsRef,
                where('gameType', '==', gameType),
                orderBy('requirement', 'asc')
            );

            const querySnapshot = await getDocs(q);
            const achievements = [];
            
            querySnapshot.forEach((doc) => {
                achievements.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return achievements;
        } catch (error) {
            console.error('Error getting achievements:', error);
            return [];
        }
    }

    // Award achievements to user
    async awardAchievements(userId, achievements) {
        try {
            const statsRef = doc(this.userStatsRef, userId);
            const statsDoc = await getDoc(statsRef);
            
            if (!statsDoc.exists()) return;

            const stats = statsDoc.data();
            const newAchievementIds = achievements.map(a => a.id);
            
            stats.achievements = [...new Set([...stats.achievements, ...newAchievementIds])];
            
            await setDoc(statsRef, stats);
            
            // Notify user about new achievements
            this.notifyAchievements(achievements);
            
            return { success: true };
        } catch (error) {
            console.error('Error awarding achievements:', error);
            return { success: false, error: error.message };
        }
    }

    // Create tournament
    async createTournament(tournamentData) {
        try {
            const tournament = {
                name: tournamentData.name,
                gameType: tournamentData.gameType,
                startDate: tournamentData.startDate,
                endDate: tournamentData.endDate,
                maxParticipants: tournamentData.maxParticipants || 100,
                entryFee: tournamentData.entryFee || 0,
                prizePool: tournamentData.prizePool || [],
                status: 'registration', // registration, active, finished
                participants: [],
                leaderboard: [],
                createdBy: tournamentData.createdBy,
                createdAt: serverTimestamp(),
                rules: tournamentData.rules || {}
            };

            const docRef = await addDoc(this.tournamentsRef, tournament);
            return { success: true, tournamentId: docRef.id };
        } catch (error) {
            console.error('Error creating tournament:', error);
            return { success: false, error: error.message };
        }
    }

    // Get active tournaments
    async getActiveTournaments() {
        try {
            const q = query(
                this.tournamentsRef,
                where('status', 'in', ['registration', 'active']),
                orderBy('startDate', 'asc')
            );

            const querySnapshot = await getDocs(q);
            const tournaments = [];
            
            querySnapshot.forEach((doc) => {
                tournaments.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return { success: true, tournaments };
        } catch (error) {
            console.error('Error getting tournaments:', error);
            return { success: false, error: error.message };
        }
    }

    // Join tournament
    async joinTournament(tournamentId, userId, userName) {
        try {
            const tournamentRef = doc(this.tournamentsRef, tournamentId);
            const tournamentDoc = await getDoc(tournamentRef);
            
            if (!tournamentDoc.exists()) {
                throw new Error('Tournament not found');
            }

            const tournament = tournamentDoc.data();
            
            if (tournament.status !== 'registration') {
                throw new Error('Tournament registration is closed');
            }

            if (tournament.participants.length >= tournament.maxParticipants) {
                throw new Error('Tournament is full');
            }

            if (tournament.participants.some(p => p.userId === userId)) {
                throw new Error('Already registered for this tournament');
            }

            tournament.participants.push({
                userId: userId,
                userName: userName,
                joinedAt: serverTimestamp(),
                score: 0
            });

            await setDoc(tournamentRef, tournament);
            return { success: true };
        } catch (error) {
            console.error('Error joining tournament:', error);
            return { success: false, error: error.message };
        }
    }

    // Notify user about achievements
    notifyAchievements(achievements) {
        // Create achievement notification
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        
        achievements.forEach(achievement => {
            const achievementEl = document.createElement('div');
            achievementEl.className = 'achievement-item';
            achievementEl.innerHTML = `
                <div class="achievement-icon">🏆</div>
                <div class="achievement-content">
                    <div class="achievement-title">${achievement.title}</div>
                    <div class="achievement-description">${achievement.description}</div>
                </div>
            `;
            notification.appendChild(achievementEl);
        });

        document.body.appendChild(notification);
        
        // Remove notification after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    // Get global statistics
    async getGlobalStats() {
        try {
            const stats = {
                totalPlayers: 0,
                totalGames: 0,
                totalScore: 0,
                topGames: []
            };

            // Get all user stats
            const statsSnapshot = await getDocs(this.userStatsRef);
            const users = [];
            
            statsSnapshot.forEach((doc) => {
                const userData = doc.data();
                users.push(userData);
                stats.totalPlayers++;
                stats.totalGames += userData.totalGames;
                stats.totalScore += userData.totalScore;
            });

            // Calculate top games
            const gameCounts = {};
            users.forEach(user => {
                Object.keys(user.gameStats || {}).forEach(gameType => {
                    gameCounts[gameType] = (gameCounts[gameType] || 0) + user.gameStats[gameType].gamesPlayed;
                });
            });

            stats.topGames = Object.entries(gameCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([gameType, count]) => ({ gameType, count }));

            return { success: true, stats };
        } catch (error) {
            console.error('Error getting global stats:', error);
            return { success: false, error: error.message };
        }
    }
}

// Create singleton instance
const leaderboardService = new LeaderboardService();
export default leaderboardService;
