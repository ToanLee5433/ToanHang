// Leaderboard Manager
class LeaderboardManager {
    constructor() {
        this.currentTab = 'daily';
        this.scores = {
            daily: [],
            weekly: [],
            allTime: []
        };
        
        this.init();
    }

    // Initialize leaderboard
    init() {
        this.setupTabHandlers();
        this.setupRefreshButton();
        console.log('Leaderboard manager initialized');
    }

    // Set up tab handlers
    setupTabHandlers() {
        const tabs = document.querySelectorAll('.leaderboard-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabType = tab.dataset.tab;
                this.switchTab(tabType);
            });
        });
    }

    // Set up refresh button
    setupRefreshButton() {
        const refreshBtn = document.getElementById('refresh-leaderboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshLeaderboard();
            });
        }
    }

    // Switch between leaderboard tabs
    switchTab(tabType) {
        // Update active tab
        const tabs = document.querySelectorAll('.leaderboard-tab');
        tabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === tabType) {
                tab.classList.add('active');
            }
        });
        
        this.currentTab = tabType;
        this.loadLeaderboard(tabType);
    }

    // Load leaderboard data
    async loadLeaderboard(type = 'daily') {
        try {
            this.showLoading();
            
            if (window.firebaseDB) {
                const scores = await window.firebaseDB.getLeaderboard(type);
                this.scores[type] = scores;
                this.displayScores(scores, type);
            } else {
                // Fallback to mock data
                this.loadMockData(type);
            }
            
            this.hideLoading();
        } catch (error) {
            console.error('Failed to load leaderboard:', error);
            this.showError('Không thể tải bảng xếp hạng');
            this.hideLoading();
        }
    }

    // Display scores in the leaderboard
    displayScores(scores, type) {
        const leaderboardList = document.getElementById('leaderboard-list');
        if (!leaderboardList) return;
        
        leaderboardList.innerHTML = '';
        
        if (scores.length === 0) {
            leaderboardList.innerHTML = '<div class="no-scores">Chưa có điểm số nào</div>';
            return;
        }
        
        scores.forEach((score, index) => {
            const scoreItem = this.createScoreItem(score, index + 1);
            leaderboardList.appendChild(scoreItem);
        });
    }

    // Create a score item element
    createScoreItem(score, rank) {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        
        // Add special styling for top 3
        if (rank <= 3) {
            item.classList.add(`rank-${rank}`);
        }
        
        // Check if this is the current user's score
        const isCurrentUser = window.firebaseAuth && 
                            window.firebaseAuth.currentUser && 
                            score.userId === window.firebaseAuth.currentUser.uid;
        
        if (isCurrentUser) {
            item.classList.add('current-user');
        }
        
        item.innerHTML = `
            <div class="rank">${rank}</div>
            <div class="player-info">
                <div class="player-name">${score.playerName || 'Người chơi'}</div>
                <div class="player-level">Cấp ${score.level}</div>
            </div>
            <div class="score-info">
                <div class="score-value">${this.formatScore(score.score)}</div>
                <div class="score-lines">${score.lines} hàng</div>
            </div>
            <div class="score-date">${this.formatDate(score.timestamp)}</div>
        `;
        
        return item;
    }

    // Format score with commas
    formatScore(score) {
        return score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    // Format date
    formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            return 'Hôm nay';
        } else if (diffDays === 2) {
            return 'Hôm qua';
        } else if (diffDays <= 7) {
            return `${diffDays - 1} ngày trước`;
        } else {
            return date.toLocaleDateString('vi-VN');
        }
    }

    // Load mock data for testing
    loadMockData(type) {
        const mockScores = [
            {
                playerName: 'Người chơi 1',
                score: 150000,
                level: 15,
                lines: 150,
                timestamp: Date.now() - 3600000,
                userId: 'user1'
            },
            {
                playerName: 'Người chơi 2',
                score: 120000,
                level: 12,
                lines: 120,
                timestamp: Date.now() - 7200000,
                userId: 'user2'
            },
            {
                playerName: 'Người chơi 3',
                score: 100000,
                level: 10,
                lines: 100,
                timestamp: Date.now() - 10800000,
                userId: 'user3'
            },
            {
                playerName: 'Người chơi 4',
                score: 80000,
                level: 8,
                lines: 80,
                timestamp: Date.now() - 14400000,
                userId: 'user4'
            },
            {
                playerName: 'Người chơi 5',
                score: 60000,
                level: 6,
                lines: 60,
                timestamp: Date.now() - 18000000,
                userId: 'user5'
            }
        ];
        
        this.scores[type] = mockScores;
        this.displayScores(mockScores, type);
    }

    // Save score to leaderboard
    async saveScore(score, level, lines) {
        try {
            if (window.firebaseDB && window.firebaseAuth.currentUser) {
                await window.firebaseDB.saveScore({
                    score: score,
                    level: level,
                    lines: lines,
                    timestamp: Date.now(),
                    playerName: window.firebaseAuth.currentUser.displayName || 'Người chơi',
                    userId: window.firebaseAuth.currentUser.uid
                });
                
                // Refresh current leaderboard
                this.loadLeaderboard(this.currentTab);
                
                return true;
            } else {
                console.warn('Firebase not available or user not logged in');
                return false;
            }
        } catch (error) {
            console.error('Failed to save score:', error);
            return false;
        }
    }

    // Refresh leaderboard
    refreshLeaderboard() {
        this.loadLeaderboard(this.currentTab);
    }

    // Show loading state
    showLoading() {
        const leaderboardList = document.getElementById('leaderboard-list');
        if (leaderboardList) {
            leaderboardList.innerHTML = '<div class="loading">Đang tải...</div>';
        }
    }

    // Hide loading state
    hideLoading() {
        // Loading state is cleared when scores are displayed
    }

    // Show error message
    showError(message) {
        const leaderboardList = document.getElementById('leaderboard-list');
        if (leaderboardList) {
            leaderboardList.innerHTML = `<div class="error">${message}</div>`;
        }
    }

    // Get user's best score
    async getUserBestScore() {
        try {
            if (window.firebaseDB && window.firebaseAuth.currentUser) {
                const userScores = await window.firebaseDB.getUserScores(window.firebaseAuth.currentUser.uid);
                if (userScores.length > 0) {
                    return userScores[0]; // Highest score is first
                }
            }
        } catch (error) {
            console.error('Failed to get user best score:', error);
        }
        return null;
    }

    // Get user's rank
    async getUserRank(score) {
        try {
            if (window.firebaseDB) {
                const allScores = await window.firebaseDB.getLeaderboard('allTime');
                const rank = allScores.findIndex(s => s.score <= score) + 1;
                return rank > 0 ? rank : null;
            }
        } catch (error) {
            console.error('Failed to get user rank:', error);
        }
        return null;
    }

    // Update leaderboard display
    updateDisplay() {
        // Update tab labels with counts
        const tabs = document.querySelectorAll('.leaderboard-tab');
        tabs.forEach(tab => {
            const type = tab.dataset.tab;
            const count = this.scores[type] ? this.scores[type].length : 0;
            const countEl = tab.querySelector('.tab-count');
            if (countEl) {
                countEl.textContent = count;
            }
        });
    }

    // Export leaderboard data
    exportLeaderboard() {
        const data = {
            type: this.currentTab,
            scores: this.scores[this.currentTab],
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `tetris-leaderboard-${this.currentTab}-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Global leaderboard manager instance
window.leaderboardManager = new LeaderboardManager();
