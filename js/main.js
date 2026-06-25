// Game Hub - Main Application
import authService from './services/authService.js';
import roomService from './services/roomService.js';
import leaderboardService from './services/leaderboardService.js';
import onlineUI from './ui/onlineUI.js';

class GameHubApp {
    constructor() {
        this.currentScreen = 'main-hub';
        this.user = null;
        this.settings = this.loadSettings();
        this.init();
    }

    async init() {
        try {
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize UI
            this.initializeUI();
            
            // Listen for auth state changes asynchronously (resolves race condition)
            authService.onAuthStateChanged((user) => {
                this.handleAuthStateChange(user);
            });
            
            console.log('🎮 Game Hub initialized successfully!');
        } catch (error) {
            console.error('Error initializing Game Hub:', error);
            this.showError('Không thể khởi tạo ứng dụng. Vui lòng thử lại.');
            this.hideLoadingScreen();
        }
    }

    async handleAuthStateChange(user) {
        try {
            if (user) {
                console.log('👤 User logged in:', user.displayName || user.email);
                this.user = user;
                this.updateUserInterface();
                await this.loadUserProfile();
                // Automatically sync offline high scores to cloud
                await this.syncOfflineScoresToCloud();
            } else {
                console.log('👤 Running in Guest mode (Khách)');
                this.user = null;
                this.updateUserInterface();
                this.loadGuestProfile();
            }
        } catch (error) {
            console.error('Error handling auth state change:', error);
        } finally {
            this.hideLoadingScreen();
        }
    }

    setupEventListeners() {
        // Navigation buttons
        document.getElementById('settings-btn')?.addEventListener('click', () => this.showScreen('settings'));
        document.getElementById('leaderboard-btn')?.addEventListener('click', () => this.showScreen('leaderboard'));
        document.getElementById('profile-btn')?.addEventListener('click', () => this.showScreen('profile'));
        document.getElementById('about-btn')?.addEventListener('click', () => this.showScreen('about'));

        // Back buttons
        document.getElementById('settings-back-btn')?.addEventListener('click', () => this.showScreen('main-hub'));
        document.getElementById('leaderboard-back-btn')?.addEventListener('click', () => this.showScreen('main-hub'));
        document.getElementById('profile-back-btn')?.addEventListener('click', () => this.showScreen('main-hub'));
        document.getElementById('about-back-btn')?.addEventListener('click', () => this.showScreen('main-hub'));

        // Settings controls
        this.setupSettingsListeners();
        
        // Leaderboard controls
        this.setupLeaderboardListeners();
        
        // Online features
        this.setupOnlineListeners();
        
        // Game cards
        this.setupGameCardListeners();
    }

    setupSettingsListeners() {
        const soundEnabled = document.getElementById('sound-enabled');
        const soundVolume = document.getElementById('sound-volume');
        const themeSelect = document.getElementById('theme-select');
        const effectsEnabled = document.getElementById('effects-enabled');
        const defaultDifficulty = document.getElementById('default-difficulty');
        const autoSave = document.getElementById('auto-save');
        const chatNotifications = document.getElementById('chat-notifications');
        const autoJoinRoom = document.getElementById('auto-join-room');

        if (soundEnabled) {
            soundEnabled.addEventListener('change', (e) => {
                this.settings.sound.enabled = e.target.checked;
                this.saveSettings();
            });
        }

        if (soundVolume) {
            soundVolume.addEventListener('input', (e) => {
                this.settings.sound.volume = e.target.value;
                this.saveSettings();
            });
        }

        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.settings.theme = e.target.value;
                this.applyTheme(e.target.value);
                this.saveSettings();
            });
        }

        if (effectsEnabled) {
            effectsEnabled.addEventListener('change', (e) => {
                this.settings.effects = e.target.checked;
                this.saveSettings();
            });
        }

        if (defaultDifficulty) {
            defaultDifficulty.addEventListener('change', (e) => {
                this.settings.game.defaultDifficulty = e.target.value;
                this.saveSettings();
            });
        }

        if (autoSave) {
            autoSave.addEventListener('change', (e) => {
                this.settings.game.autoSave = e.target.checked;
                this.saveSettings();
            });
        }

        if (chatNotifications) {
            chatNotifications.addEventListener('change', (e) => {
                this.settings.online.chatNotifications = e.target.checked;
                this.saveSettings();
            });
        }

        if (autoJoinRoom) {
            autoJoinRoom.addEventListener('change', (e) => {
                this.settings.online.autoJoinRoom = e.target.checked;
                this.saveSettings();
            });
        }
    }

    setupLeaderboardListeners() {
        // Leaderboard tabs
        document.querySelectorAll('.leaderboard-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const gameType = e.target.dataset.game;
                this.loadLeaderboard(gameType);
                
                // Update active tab
                document.querySelectorAll('.leaderboard-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Leaderboard filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const period = e.target.dataset.period;
                this.loadLeaderboard(null, period);
                
                // Update active filter
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }

    setupOnlineListeners() {
        // Online feature buttons
        document.querySelectorAll('.online-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handleOnlineAction(action);
            });
        });
    }

    setupGameCardListeners() {
        // Game card hover effects
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                if (this.settings.effects) {
                    card.style.transform = 'translateY(-10px) scale(1.02)';
                }
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    async loadUserProfile() {
        if (!this.user) return;

        try {
            const userStats = await leaderboardService.getUserStats(this.user.uid);
            if (userStats) {
                this.updateProfileUI(userStats);
            } else {
                this.updateProfileUI({
                    totalGames: 0,
                    totalScore: 0,
                    achievements: [],
                    gameStats: {}
                });
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    }

    loadGuestProfile() {
        try {
            // Read local stats from localStorage for Tetris, Snake, and Wood Block Puzzle
            const tetrisStats = JSON.parse(localStorage.getItem('tetris-stats') || '{}');
            const snakeStats = JSON.parse(localStorage.getItem('snake-stats') || '{}');
            const puzzleStats = JSON.parse(localStorage.getItem('puzzle-stats') || '{}');

            const totalGames = (tetrisStats.gamesPlayed || 0) + 
                               (snakeStats.gamesPlayed || 0) + 
                               (puzzleStats.gamesPlayed || 0);

            const totalScore = (tetrisStats.bestScore || 0) + 
                              (snakeStats.highScore || 0) + 
                              (puzzleStats.highScore || 0);

            const gameStats = {
                'tetris': {
                    gamesPlayed: tetrisStats.gamesPlayed || 0,
                    bestScore: tetrisStats.bestScore || 0,
                    totalScore: tetrisStats.totalScore || 0,
                    totalLines: tetrisStats.totalLines || 0
                },
                'snake': {
                    gamesPlayed: snakeStats.gamesPlayed || 0,
                    bestScore: snakeStats.highScore || 0,
                    totalScore: snakeStats.highScore || 0
                },
                'puzzle': {
                    gamesPlayed: puzzleStats.gamesPlayed || 0,
                    bestScore: puzzleStats.highScore || 0,
                    totalScore: puzzleStats.highScore || 0
                }
            };

            const guestStats = {
                totalGames,
                totalScore,
                achievements: [],
                gameStats
            };

            this.updateProfileUI(guestStats);
        } catch (error) {
            console.error('Error loading guest profile:', error);
        }
    }

    async syncOfflineScoresToCloud() {
        if (!this.user) return;

        try {
            console.log('🔄 Checking for offline scores to sync...');
            const cloudStats = await leaderboardService.getUserStats(this.user.uid) || { gameStats: {} };
            
            // 1. Tetris Sync
            const tetrisStats = JSON.parse(localStorage.getItem('tetris-stats') || '{}');
            const tetrisHighScores = JSON.parse(localStorage.getItem('tetris-high-scores') || '[]');
            const localTetrisBest = Math.max(tetrisStats.bestScore || 0, tetrisHighScores[0]?.score || 0);
            const cloudTetrisBest = cloudStats.gameStats?.tetris?.bestScore || 0;

            if (localTetrisBest > cloudTetrisBest) {
                console.log(`📈 Syncing Tetris score: local ${localTetrisBest} > cloud ${cloudTetrisBest}`);
                await leaderboardService.saveScore('tetris', {
                    userId: this.user.uid,
                    userName: this.user.displayName || 'Hằng xinh gái',
                    userEmail: this.user.email || '',
                    score: localTetrisBest,
                    level: tetrisStats.bestLevel || 1,
                    lines: tetrisStats.totalLines || 0,
                    time: tetrisStats.totalPlayTime || 0,
                    gameMode: 'single',
                    metadata: { syncedFromOffline: true }
                });
            }

            // 2. Snake Sync
            const snakeStats = JSON.parse(localStorage.getItem('snake-stats') || '{}');
            const localSnakeBest = snakeStats.highScore || 0;
            const cloudSnakeBest = cloudStats.gameStats?.snake?.bestScore || 0;

            if (localSnakeBest > cloudSnakeBest) {
                console.log(`📈 Syncing Snake score: local ${localSnakeBest} > cloud ${cloudSnakeBest}`);
                await leaderboardService.saveScore('snake', {
                    userId: this.user.uid,
                    userName: this.user.displayName || 'Hằng xinh gái',
                    userEmail: this.user.email || '',
                    score: localSnakeBest,
                    level: 1,
                    lines: 0,
                    time: snakeStats.totalTime || 0,
                    gameMode: 'single',
                    metadata: { syncedFromOffline: true }
                });
            }

            // 3. Wood Block Puzzle Sync
            const puzzleStats = JSON.parse(localStorage.getItem('puzzle-stats') || '{}');
            const localPuzzleBest = puzzleStats.highScore || 0;
            const cloudPuzzleBest = cloudStats.gameStats?.puzzle?.bestScore || 0;

            if (localPuzzleBest > cloudPuzzleBest) {
                console.log(`📈 Syncing Wood Block Puzzle score: local ${localPuzzleBest} > cloud ${cloudPuzzleBest}`);
                await leaderboardService.saveScore('puzzle', {
                    userId: this.user.uid,
                    userName: this.user.displayName || 'Hằng xinh gái',
                    userEmail: this.user.email || '',
                    score: localPuzzleBest,
                    level: 1,
                    lines: puzzleStats.totalLinesCleared || 0,
                    time: 0,
                    gameMode: 'single',
                    metadata: { syncedFromOffline: true }
                });
            }
            
            console.log('✅ Offline scores check and sync complete.');
            // Reload profile stats to reflect any synced changes
            await this.loadUserProfile();
        } catch (error) {
            console.error('Error syncing offline scores to cloud:', error);
        }
    }

    updateUserInterface() {
        const profileBtn = document.getElementById('profile-btn');
        const profileName = document.getElementById('profile-display-name');
        const profileEmail = document.getElementById('profile-email');
        const profileAvatar = document.getElementById('profile-avatar');

        if (this.user) {
            // Logged in
            if (profileBtn) {
                profileBtn.innerHTML = `👤 ${this.user.displayName || 'Hồ sơ'}`;
                profileBtn.classList.remove('hidden');
            }
            if (profileName) profileName.textContent = this.user.displayName || 'Hằng xinh gái';
            if (profileEmail) profileEmail.textContent = this.user.email || '';
            if (profileAvatar) profileAvatar.src = this.user.photoURL || 'assets/images/default-avatar.png';
        } else {
            // Guest
            if (profileBtn) {
                profileBtn.innerHTML = `👤 Khách (Guest)`;
                profileBtn.classList.remove('hidden');
            }
            if (profileName) profileName.textContent = 'Khách (Guest)';
            if (profileEmail) profileEmail.textContent = 'Chơi offline - Đăng nhập để đồng bộ';
            if (profileAvatar) profileAvatar.src = 'assets/images/default-avatar.png';
        }

        // Show user info in header
        this.updateHeaderUserInfo();
    }

    updateHeaderUserInfo() {
        const header = document.querySelector('.hub-header');
        if (!header) return;

        // Remove existing user-info if it exists to prevent duplicates
        const existingUserInfo = header.querySelector('.user-info');
        if (existingUserInfo) {
            existingUserInfo.remove();
        }

        const userInfo = document.createElement('div');
        userInfo.className = 'user-info';

        if (this.user) {
            userInfo.innerHTML = `
                <div class="user-avatar">
                    <img src="${this.user.photoURL || 'assets/images/default-avatar.png'}" alt="Avatar">
                </div>
                <div class="user-details">
                    <span class="user-name">${this.user.displayName || 'Người chơi'}</span>
                    <span class="user-status">🟢 Online</span>
                </div>
                <button id="header-auth-btn" class="header-logout-btn">Đăng xuất</button>
            `;
        } else {
            userInfo.innerHTML = `
                <div class="user-avatar">
                    <img src="assets/images/default-avatar.png" alt="Avatar">
                </div>
                <div class="user-details">
                    <span class="user-name">Khách (Guest)</span>
                    <span class="user-status offline" style="color: var(--text-muted);">⚪ Offline</span>
                </div>
                <button id="header-auth-btn" class="header-login-btn">Đăng nhập</button>
            `;
        }
        header.appendChild(userInfo);

        // Add event listener to the button
        const authBtn = document.getElementById('header-auth-btn');
        if (authBtn) {
            authBtn.addEventListener('click', async () => {
                if (this.user) {
                    try {
                        await authService.signOut();
                    } catch (error) {
                        console.error('Error signing out:', error);
                        this.showError('Đăng xuất thất bại.');
                    }
                } else {
                    this.showLoginPrompt();
                }
            });
        }
    }

    updateProfileUI(userStats) {
        // Update profile stats
        const totalGames = document.getElementById('total-games');
        const totalScore = document.getElementById('total-score');
        const achievements = document.getElementById('achievements');

        if (totalGames) totalGames.textContent = userStats.totalGames || 0;
        if (totalScore) totalScore.textContent = userStats.totalScore || 0;
        if (achievements) achievements.textContent = userStats.achievements?.length || 0;

        // Update game stats
        this.updateGameStats(userStats.gameStats || {});
        
        // Update achievements
        this.updateAchievements(userStats.achievements || []);
    }

    updateGameStats(gameStats) {
        const gameStatsContainer = document.getElementById('game-stats');
        if (!gameStatsContainer) return;

        const gameNames = {
            'tetris': '🧩 Tetris',
            'snake': '🐍 Snake',
            'puzzle': '🪵 Puzzle',
            'memory': '🧠 Memory',
            'caro': '⭕ Caro',
            'cards': '🃏 Cards'
        };

        gameStatsContainer.innerHTML = Object.entries(gameStats).map(([gameType, stats]) => `
            <div class="game-stat-item">
                <div class="game-stat-header">
                    <span class="game-stat-name">${gameNames[gameType] || gameType}</span>
                </div>
                <div class="game-stat-details">
                    <span class="stat">🎮 ${stats.gamesPlayed || 0} trận</span>
                    <span class="stat">🏆 ${stats.bestScore || 0} điểm cao nhất</span>
                    <span class="stat">⭐ ${stats.wins || 0} thắng</span>
                </div>
            </div>
        `).join('');
    }

    updateAchievements(achievements) {
        const achievementsContainer = document.getElementById('achievements-list');
        if (!achievementsContainer) return;

        if (achievements.length === 0) {
            achievementsContainer.innerHTML = '<p class="no-achievements" style="color: var(--text-muted); font-size: 0.9rem; text-align: center; width: 100%; grid-column: 1/-1; padding: 1rem;">Chưa có thành tựu nào. Hãy chơi game để mở khóa!</p>';
            return;
        }
        
        achievementsContainer.innerHTML = achievements.map(achievement => `
            <div class="achievement-item unlocked">
                <div class="achievement-icon">🏆</div>
                <div class="achievement-content">
                    <div class="achievement-title">${achievement.title}</div>
                    <div class="achievement-description">${achievement.description}</div>
                </div>
            </div>
        `).join('');
    }

    async loadLeaderboard(gameType = 'tetris', period = 'all-time') {
        const leaderboardList = document.getElementById('leaderboard-list');
        if (!leaderboardList) return;

        try {
            leaderboardList.innerHTML = '<div class="loading">Đang tải bảng xếp hạng...</div>';

            const result = await leaderboardService.getLeaderboard(gameType, period);
            
            if (result.success) {
                this.renderLeaderboard(result.scores);
            } else {
                leaderboardList.innerHTML = '<div class="error">Không thể tải bảng xếp hạng</div>';
            }
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            leaderboardList.innerHTML = '<div class="error">Lỗi khi tải bảng xếp hạng</div>';
        }
    }

    renderLeaderboard(scores) {
        const leaderboardList = document.getElementById('leaderboard-list');
        if (!leaderboardList) return;

        if (scores.length === 0) {
            leaderboardList.innerHTML = '<div class="no-scores">Chưa có điểm số nào</div>';
            return;
        }

        leaderboardList.innerHTML = scores.map((score, index) => `
            <div class="leaderboard-item ${index < 3 ? 'top-' + (index + 1) : ''}">
                <div class="rank">${score.rank}</div>
                <div class="player-info">
                    <div class="player-name">${score.userName}</div>
                    <div class="player-score">${score.score.toLocaleString()} điểm</div>
                </div>
                <div class="score-details">
                    <span class="level">Cấp ${score.level}</span>
                    <span class="lines">${score.lines} hàng</span>
                </div>
            </div>
        `).join('');
    }

    async handleOnlineAction(action) {
        if (!this.user) {
            this.showLoginPrompt();
            return;
        }

        switch (action) {
            case 'create-room':
                onlineUI.showCreateRoomModal();
                break;
            case 'join-room':
                onlineUI.showJoinRoomModal();
                break;
            case 'quick-match':
                await onlineUI.quickMatch();
                break;
            default:
                console.log('Unknown online action:', action);
        }
    }

    showLoginPrompt() {
        const loginModal = this.createModal('login-modal', `
            <div class="modal-header">
                <h2>🔐 Đăng Nhập</h2>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <p>Đăng nhập để sử dụng tính năng online và lưu tiến độ game!</p>
                <div class="login-options">
                    <button class="btn btn-primary" id="google-login-btn">
                        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Đăng nhập với Google
                    </button>
                </div>
            </div>
        `);

        document.getElementById('google-login-btn')?.addEventListener('click', async () => {
            try {
                const user = await authService.signInWithGoogle();
                if (user) {
                    this.closeModal(loginModal);
                }
            } catch (error) {
                console.error('Login error:', error);
                this.showError('Đăng nhập thất bại. Vui lòng thử lại.');
            }
        });

        this.showModal(loginModal);
    }

    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Show target screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenId;

            // Load screen-specific content
            this.loadScreenContent(screenId);
        }
    }

    loadScreenContent(screenId) {
        switch (screenId) {
            case 'leaderboard':
                this.loadLeaderboard();
                break;
            case 'profile':
                this.loadUserProfile();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('gameHubSettings');
        if (savedSettings) {
            return JSON.parse(savedSettings);
        }

        // Default settings
        return {
            sound: {
                enabled: true,
                volume: 50
            },
            theme: 'default',
            effects: true,
            game: {
                defaultDifficulty: 'normal',
                autoSave: true
            },
            online: {
                chatNotifications: true,
                autoJoinRoom: false
            }
        };
    }

    saveSettings() {
        localStorage.setItem('gameHubSettings', JSON.stringify(this.settings));
    }

    applyTheme(theme) {
        document.body.className = `theme-${theme}`;
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    showModal(modal) {
        document.body.appendChild(modal);
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
    }

    closeModal(modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }

    createModal(id, content) {
        const modal = document.createElement('div');
        modal.id = id;
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    ${content}
                </div>
            </div>
        `;

        // Add close functionality
        modal.querySelector('.modal-close')?.addEventListener('click', () => {
            this.closeModal(modal);
        });

        modal.querySelector('.modal-overlay')?.addEventListener('click', (e) => {
            if (e.target === modal.querySelector('.modal-overlay')) {
                this.closeModal(modal);
            }
        });

        return modal;
    }

    showError(message) {
        const errorModal = this.createModal('error-modal', `
            <div class="modal-header">
                <h2>❌ Lỗi</h2>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <p>${message}</p>
                <div class="form-actions">
                    <button class="btn btn-primary modal-close">OK</button>
                </div>
            </div>
        `);
        this.showModal(errorModal);
    }

    initializeUI() {
        // Apply current theme
        this.applyTheme(this.settings.theme);

        // Load settings into UI
        this.loadSettingsIntoUI();

        // Initialize animations
        this.initializeAnimations();
    }

    loadSettingsIntoUI() {
        // Sound settings
        const soundEnabled = document.getElementById('sound-enabled');
        const soundVolume = document.getElementById('sound-volume');
        const themeSelect = document.getElementById('theme-select');
        const effectsEnabled = document.getElementById('effects-enabled');
        const defaultDifficulty = document.getElementById('default-difficulty');
        const autoSave = document.getElementById('auto-save');
        const chatNotifications = document.getElementById('chat-notifications');
        const autoJoinRoom = document.getElementById('auto-join-room');

        if (soundEnabled) soundEnabled.checked = this.settings.sound.enabled;
        if (soundVolume) soundVolume.value = this.settings.sound.volume;
        if (themeSelect) themeSelect.value = this.settings.theme;
        if (effectsEnabled) effectsEnabled.checked = this.settings.effects;
        if (defaultDifficulty) defaultDifficulty.value = this.settings.game.defaultDifficulty;
        if (autoSave) autoSave.checked = this.settings.game.autoSave;
        if (chatNotifications) chatNotifications.checked = this.settings.online.chatNotifications;
        if (autoJoinRoom) autoJoinRoom.checked = this.settings.online.autoJoinRoom;
    }

    initializeAnimations() {
        // Add entrance animations to game cards
        const gameCards = document.querySelectorAll('.game-card');
        gameCards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
        });

        // Add hover effects
        if (this.settings.effects) {
            this.addHoverEffects();
        }
    }

    addHoverEffects() {
        // Add particle effects on hover
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.createParticles(card);
            });
        });
    }

    createParticles(element) {
        // Simple particle effect
        for (let i = 0; i < 5; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: var(--purple);
                border-radius: 50%;
                pointer-events: none;
                animation: particle-float 1s ease-out forwards;
            `;
            
            const rect = element.getBoundingClientRect();
            particle.style.left = rect.left + Math.random() * rect.width + 'px';
            particle.style.top = rect.top + Math.random() * rect.height + 'px';
            
            document.body.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
        }, 1000);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.gameHubApp = new GameHubApp();
});

// Add particle animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes particle-float {
        0% {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
        100% {
            opacity: 0;
            transform: translateY(-50px) scale(0);
        }
    }
`;
document.head.appendChild(style);

export default GameHubApp;
