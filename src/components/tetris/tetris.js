// Enhanced Tetris Game Initialization with Modern Features
class TetrisGame {
    constructor() {
        this.game = null;
        this.settings = {};
        this.gameStats = {
            gamesPlayed: 0,
            totalScore: 0,
            totalLines: 0,
            bestScore: 0,
            bestLevel: 0,
            totalPlayTime: 0
        };
        this.currentGameStartTime = null;
        this.particles = [];
        this.soundEnabled = true;
        this.effectsEnabled = true;
        this.isGameStarted = false;
        this.isPaused = false;
        this.keyboardControls = {
            moveLeft: 'ArrowLeft',
            moveRight: 'ArrowRight',
            softDrop: 'ArrowDown',
            hardDrop: 'Space',
            rotateCW: 'ArrowUp',
            rotateCCW: 'KeyZ',
            hold: 'KeyC',
            pause: 'Escape'
        };
        
        this.init();
    }
    
    init() {
        console.log('Initializing Enhanced Tetris Game...');
        this.loadSettings();
        this.loadStats();
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupGame());
        } else {
            this.setupGame();
        }
    }
    
    setupGame() {
        console.log('Setting up Tetris game elements...');
        
        // Get game elements
        this.canvas = document.getElementById('game-canvas');
        this.nextCanvas = document.getElementById('next-canvas');
        this.holdCanvas = document.getElementById('hold-canvas');
        
        if (!this.canvas) {
            console.error('Game canvas not found!');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.nextCtx = this.nextCanvas?.getContext('2d');
        this.holdCtx = this.holdCanvas?.getContext('2d');
        
        // Initialize game components
        this.initializeGameComponents();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Draw initial state
        this.drawWelcomeScreen();
        
        console.log('Tetris game setup complete! Press Space to start.');
    }
    
    initializeGameComponents() {
        // Initialize game board
        this.board = Array(20).fill().map(() => Array(10).fill(0));
        this.currentPiece = null;
        this.nextPiece = null;
        this.holdPiece = null;
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.dropTime = 0;
        this.dropInterval = 1000;
    }
    
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // Button event listeners
        const pauseBtn = document.getElementById('pause-btn');
        const resumeBtn = document.getElementById('resume-btn');
        const restartBtn = document.getElementById('restart-btn');
        const quitBtn = document.getElementById('quit-btn');
        const playAgainBtn = document.getElementById('play-again-btn');
        const backToHubBtn = document.getElementById('back-to-hub-btn');
        
        if (pauseBtn) pauseBtn.addEventListener('click', () => this.togglePause());
        if (resumeBtn) resumeBtn.addEventListener('click', () => this.togglePause());
        if (restartBtn) restartBtn.addEventListener('click', () => this.restartGame());
        if (quitBtn) quitBtn.addEventListener('click', () => this.quitGame());
        if (playAgainBtn) playAgainBtn.addEventListener('click', () => this.restartGame());
        if (backToHubBtn) backToHubBtn.addEventListener('click', () => this.quitGame());
    }
    
    handleKeyDown(e) {
        if (!this.isGameStarted && (e.code === 'Space' || e.key === ' ')) {
            e.preventDefault();
            this.startGame();
            return;
        }
        
        if (!this.isGameStarted || this.isPaused) return;
        
        switch (e.code) {
            case 'ArrowLeft':
                e.preventDefault();
                this.movePiece(-1, 0);
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.movePiece(1, 0);
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.movePiece(0, 1);
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.rotatePiece();
                break;
            case 'Space':
                e.preventDefault();
                this.hardDrop();
                break;
            case 'KeyC':
                e.preventDefault();
                this.holdCurrentPiece();
                break;
            case 'Escape':
                e.preventDefault();
                this.togglePause();
                break;
        }
    }
    
    startGame() {
        console.log('Starting Tetris game...');
        this.isGameStarted = true;
        this.isPaused = false;
        this.currentGameStartTime = Date.now();
        
        // Initialize game state
        this.initializeGameComponents();
        
        // Generate first pieces
        this.spawnNewPiece();
        this.generateNextPiece();
        
        // Start game loop
        this.gameLoop();
        
        // Play start sound
        this.playSound('gameStart');
        
        // Update UI
        this.updateUI();
        
        console.log('Tetris game started!');
    }
    
    drawWelcomeScreen() {
        // Clear canvas
        this.ctx.fillStyle = '#f8f9fa';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.drawGrid();
        
        // Draw welcome message
        this.ctx.fillStyle = '#6f42c1';
        this.ctx.font = 'bold 24px Press Start 2P';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('TETRIS', this.canvas.width / 2, this.canvas.height / 2 - 40);
        
        this.ctx.font = '16px Roboto';
        this.ctx.fillStyle = '#495057';
        this.ctx.fillText('Nhấn SPACE để bắt đầu', this.canvas.width / 2, this.canvas.height / 2 + 20);
        this.ctx.fillText('↑ xoay • ←→ di chuyển • ↓ rơi nhanh', this.canvas.width / 2, this.canvas.height / 2 + 50);
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#dee2e6';
        this.ctx.lineWidth = 1;
        
        const cellWidth = this.canvas.width / 10;
        const cellHeight = this.canvas.height / 20;
        
        // Vertical lines
        for (let x = 0; x <= 10; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * cellWidth, 0);
            this.ctx.lineTo(x * cellWidth, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= 20; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * cellHeight);
            this.ctx.lineTo(this.canvas.width, y * cellHeight);
            this.ctx.stroke();
        }
    }    
    // ================== SOUND EFFECTS ==================
    
    playSound(type) {
        if (!this.soundEnabled) return;
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Enhanced sound effects with multiple frequencies
            switch (type) {
                case 'gameStart':
                    this.playChord(audioContext, [523.25, 659.25, 783.99], 0.8); // C-E-G chord
                    break;
                case 'pause':
                    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(220, audioContext.currentTime + 0.2);
                    break;
                case 'resume':
                    oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.2);
                    break;
                case 'restart':
                    this.playChord(audioContext, [261.63, 329.63, 392.00], 0.5); // C-E-G chord lower
                    break;
                case 'quit':
                    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(110, audioContext.currentTime + 0.4);
                    break;
                case 'gameOver':
                    this.playChord(audioContext, [207.65, 246.94, 277.18], 1.0); // G#-B-C# (sad chord)
                    break;
                case 'levelUp':
                    this.playMelody(audioContext, [523.25, 659.25, 783.99, 1046.50], 0.6); // C-E-G-C ascending
                    break;
                case 'lineClear':
                    this.playChord(audioContext, [659.25, 783.99, 987.77], 0.4); // E-G-B chord
                    break;
                case 'pieceLand':
                    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.1);
                    break;
                case 'pieceRotate':
                    oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
                    oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.05);
                    break;
                case 'pieceHold':
                    oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
                    break;
                default:
                    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
            }
            
            // Set gain envelope for smooth sound
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
            
        } catch (error) {
            console.log('Audio not supported:', error);
        }
    }
    
    playChord(audioContext, frequencies, duration) {
        frequencies.forEach((freq, index) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.05, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        });
    }
    
    playMelody(audioContext, frequencies, noteDuration) {
        frequencies.forEach((freq, index) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            const startTime = audioContext.currentTime + (index * noteDuration / 2);
            
            oscillator.frequency.setValueAtTime(freq, startTime);
            oscillator.type = 'square';
            
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(0.08, startTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration / 2);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + noteDuration / 2);
        });
    }
    
    // ================== MODAL MANAGEMENT ==================
    
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            
            // Add entrance animation
            const content = modal.querySelector('.modal-content');
            if (content) {
                content.style.transform = 'scale(0.8) translateY(-50px)';
                content.style.opacity = '0';
                
                setTimeout(() => {
                    content.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
                    content.style.transform = 'scale(1) translateY(0)';
                    content.style.opacity = '1';
                }, 10);
            }
        }
    }log('Enhanced Tetris Game initializing...');
        
        // Load settings and stats
        this.loadSettings();
        this.loadStats();
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupGame());
        } else {
            this.setupGame();
        }
    }
    
    
    setupGame() {
        console.log('Setting up Enhanced Tetris game...');
        
        // Initialize particle system
        this.initParticleSystem();
        
        // Set up enhanced event listeners
        this.setupEventListeners();
        this.setupKeyboardControls();
        
        // Add visual enhancements
        this.setupVisualEnhancements();
        
        // Initialize game after a short delay for smooth loading
        setTimeout(() => {
            this.initializeGame();
        }, 300);
    }
    
    initParticleSystem() {
        // Create particle container
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer && !document.getElementById('particles-container')) {
            const particlesContainer = document.createElement('div');
            particlesContainer.id = 'particles-container';
            particlesContainer.style.position = 'absolute';
            particlesContainer.style.top = '0';
            particlesContainer.style.left = '0';
            particlesContainer.style.width = '100%';
            particlesContainer.style.height = '100%';
            particlesContainer.style.pointerEvents = 'none';
            particlesContainer.style.zIndex = '1000';
            gameContainer.style.position = 'relative';
            gameContainer.appendChild(particlesContainer);
        }
    }
    
    setupVisualEnhancements() {
        // Add dynamic background effects
        const gameBoard = document.querySelector('.game-board');
        if (gameBoard) {
            gameBoard.style.background = 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)';
            gameBoard.style.borderRadius = '16px';
            gameBoard.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)';
        }
        
        // Add glow effects to UI elements
        const gameInfo = document.querySelector('.game-info');
        if (gameInfo) {
            const infoItems = gameInfo.querySelectorAll('div');
            infoItems.forEach(item => {
                item.style.transition = 'all 0.3s ease';
                item.addEventListener('mouseenter', () => {
                    item.style.transform = 'scale(1.05)';
                    item.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';
                });
                item.addEventListener('mouseleave', () => {
                    item.style.transform = 'scale(1)';
                    item.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                });
            });
        }
    }
    
    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.game || !this.game.isRunning) return;
            
            // Prevent default for game keys
            const gameKeys = Object.values(this.keyboardControls);
            if (gameKeys.includes(e.code) || gameKeys.includes(e.key)) {
                e.preventDefault();
            }
            
            // Handle game controls
            switch (e.code || e.key) {
                case this.keyboardControls.moveLeft:
                    this.game.movePiece(-1, 0);
                    this.createMoveParticles('left');
                    break;
                case this.keyboardControls.moveRight:
                    this.game.movePiece(1, 0);
                    this.createMoveParticles('right');
                    break;
                case this.keyboardControls.softDrop:
                    this.game.movePiece(0, 1);
                    break;
                case this.keyboardControls.hardDrop:
                    this.game.hardDrop();
                    this.createDropParticles();
                    break;
                case this.keyboardControls.rotateCW:
                    this.game.rotatePiece();
                    this.createRotateParticles();
                    break;
                case this.keyboardControls.rotateCCW:
                    this.game.rotatePieceCCW();
                    this.createRotateParticles();
                    break;
                case this.keyboardControls.hold:
                    this.game.holdPiece();
                    this.createHoldParticles();
                    break;
                case this.keyboardControls.pause:
                    this.pauseGame();
                    break;
            }
        });
    }
    
    
    setupEventListeners() {
        // Enhanced pause button with animation
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                this.pauseGame();
                this.animateButtonPress(pauseBtn);
            });
        }
        
        // Enhanced modal buttons with animations
        const resumeBtn = document.getElementById('resume-btn');
        if (resumeBtn) {
            resumeBtn.addEventListener('click', () => {
                this.hideModal('pause-modal');
                this.resumeGame();
                this.animateButtonPress(resumeBtn);
            });
        }
        
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                this.hideModal('pause-modal');
                this.restartGame();
                this.animateButtonPress(restartBtn);
            });
        }
        
        const quitBtn = document.getElementById('quit-btn');
        if (quitBtn) {
            quitBtn.addEventListener('click', () => {
                this.hideModal('pause-modal');
                this.quitGame();
                this.animateButtonPress(quitBtn);
            });
        }
        
        // Game over modal buttons with enhanced feedback
        const playAgainBtn = document.getElementById('play-again-btn');
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => {
                this.hideModal('game-over-modal');
                this.restartGame();
                this.animateButtonPress(playAgainBtn);
            });
        }
        
        const backToHubBtn = document.getElementById('back-to-hub-btn');
        if (backToHubBtn) {
            backToHubBtn.addEventListener('click', () => {
                this.hideModal('game-over-modal');
                this.quitGame();
                this.animateButtonPress(backToHubBtn);
            });
        }
        
        // Add hover effects to all buttons
        this.addButtonHoverEffects();
    }
    
    addButtonHoverEffects() {
        const buttons = document.querySelectorAll('.game-btn, .modal-btn');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'translateY(-3px) scale(1.05)';
                button.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translateY(0) scale(1)';
                button.style.boxShadow = 'none';
            });
        });
    }
    
    animateButtonPress(button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 150);
    }
    
    
    initializeGame() {
        console.log('Initializing Enhanced Tetris game...');
        
        const canvas = document.getElementById('game-canvas');
        if (!canvas) {
            console.error('Game canvas not found!');
            this.showErrorMessage('Không tìm thấy game canvas!');
            return;
        }
        
        // Check if required classes are available
        if (typeof Game === 'undefined') {
            console.error('Game class not available!');
            this.showErrorMessage('Game engine chưa được tải!');
            return;
        }
        
        try {
            // Record game start time
            this.currentGameStartTime = Date.now();
            
            // Create enhanced game instance
            this.game = new Game(canvas, {
                width: 10,
                height: 20,
                blockSize: 30,
                gameMode: this.settings.mode || 'single',
                difficulty: this.settings.difficulty || 'normal',
                playerName: this.settings.playerName || 'Hằng xinh gái',
                soundEnabled: this.soundEnabled,
                effectsEnabled: this.effectsEnabled,
                ghostPiece: this.settings.ghostPiece !== false,
                holdEnabled: this.settings.holdEnabled !== false,
                nextPieceCount: this.settings.nextPieceCount || 1,
                
                // Enhanced callbacks
                onGameOver: (score, level, lines, playTime) => {
                    console.log('Game over:', { score, level, lines, playTime });
                    this.handleGameOver(score, level, lines, playTime);
                },
                onScoreUpdate: (score, level, lines, combo) => {
                    this.updateScore(score, level, lines, combo);
                },
                onLevelUp: (level, speed) => {
                    console.log('Level up to:', level, 'Speed:', speed);
                    this.handleLevelUp(level, speed);
                },
                onLineClear: (lines, combo, points) => {
                    console.log('Line clear:', { lines, combo, points });
                    this.handleLineClear(lines, combo, points);
                },
                onPieceLand: (piece, position) => {
                    this.handlePieceLand(piece, position);
                },
                onPieceRotate: (piece, direction) => {
                    this.handlePieceRotate(piece, direction);
                },
                onPieceHold: (piece) => {
                    this.handlePieceHold(piece);
                }
            });
            
            console.log('Enhanced Tetris game initialized successfully!');
            
            // Start the game with fanfare
            this.startGameWithFanfare();
            
        } catch (error) {
            console.error('Error initializing Enhanced Tetris game:', error);
            this.showErrorMessage('Lỗi khởi tạo game: ' + error.message);
        }
    }
    
    startGameWithFanfare() {
        // Create start game particles
        this.createStartGameParticles();
        
        // Play start sound
        this.playSound('gameStart');
        
        // Start the game
        this.game.start();
        
        // Show motivational message
        this.showMessage('Chúc Hằng chơi vui vẻ! ❤️', 2000);
        
        // Update stats
        this.gameStats.gamesPlayed++;
        this.saveStats();
    }
    
    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(244, 67, 54, 0.9);
            color: white;
            padding: 20px 30px;
            border-radius: 12px;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
    
    showMessage(message, duration = 3000) {
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(76, 175, 80, 0.9);
            color: white;
            padding: 15px 25px;
            border-radius: 12px;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            animation: slideInRight 0.5s ease-out;
        `;
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.style.animation = 'slideOutRight 0.5s ease-in';
            setTimeout(() => {
                messageDiv.remove();
            }, 500);
        }, duration);
    }
    
    
    loadSettings() {
        try {
            const settings = localStorage.getItem('tetris-settings');
            this.settings = settings ? JSON.parse(settings) : {
                mode: 'single',
                difficulty: 'normal',
                playerName: 'Hằng xinh gái',
                sound: 'on',
                effects: 'on',
                ghostPiece: true,
                holdEnabled: true,
                nextPieceCount: 1
            };
            
            this.soundEnabled = this.settings.sound !== 'off';
            this.effectsEnabled = this.settings.effects !== 'off';
            
            return this.settings;
        } catch (error) {
            console.error('Error loading settings:', error);
            return {
                mode: 'single',
                difficulty: 'normal',
                playerName: 'Hằng xinh gái',
                sound: 'on',
                effects: 'on'
            };
        }
    }
    
    saveSettings() {
        try {
            localStorage.setItem('tetris-settings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }
    
    loadStats() {
        try {
            const stats = localStorage.getItem('tetris-stats');
            this.gameStats = stats ? JSON.parse(stats) : {
                gamesPlayed: 0,
                totalScore: 0,
                totalLines: 0,
                bestScore: 0,
                bestLevel: 0,
                totalPlayTime: 0
            };
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }
    
    saveStats() {
        try {
            localStorage.setItem('tetris-stats', JSON.stringify(this.gameStats));
        } catch (error) {
            console.error('Error saving stats:', error);
        }
    }
    
    
    pauseGame() {
        if (this.game && this.game.isRunning) {
            this.game.pause();
            this.showModal('pause-modal');
            this.createPauseParticles();
            this.playSound('pause');
        }
    }
    
    resumeGame() {
        if (this.game) {
            this.game.resume();
            this.createResumeParticles();
            this.playSound('resume');
        }
    }
    
    restartGame() {
        if (this.game) {
            this.game.stop();
            
            // Add restart effect
            this.createRestartParticles();
            this.playSound('restart');
            
            setTimeout(() => {
                this.initializeGame();
            }, 300);
        }
    }
    
    quitGame() {
        if (this.game) {
            // Save final stats
            if (this.currentGameStartTime) {
                const playTime = Math.floor((Date.now() - this.currentGameStartTime) / 1000);
                this.gameStats.totalPlayTime += playTime;
                this.saveStats();
            }
            
            this.game.stop();
            this.createQuitParticles();
            this.playSound('quit');
        }
        
        // Smooth transition back to hub
        setTimeout(() => {
            window.location.href = '../../index.html';
        }, 500);
    }
    
    handleGameOver(score, level, lines, playTime) {
        // Calculate play time if not provided
        if (!playTime && this.currentGameStartTime) {
            playTime = Math.floor((Date.now() - this.currentGameStartTime) / 1000);
        }
        
        // Update stats
        this.gameStats.totalScore += score;
        this.gameStats.totalLines += lines;
        this.gameStats.totalPlayTime += playTime || 0;
        
        if (score > this.gameStats.bestScore) {
            this.gameStats.bestScore = score;
            this.showMessage('🎉 Kỷ lục mới! ' + score + ' điểm! 🎉', 4000);
        }
        
        if (level > this.gameStats.bestLevel) {
            this.gameStats.bestLevel = level;
        }
        
        this.saveStats();
        
        // Update modal with enhanced stats
        document.getElementById('final-score').textContent = score.toLocaleString();
        document.getElementById('final-level').textContent = level;
        document.getElementById('final-lines').textContent = lines;
        
        // Add additional stats if elements exist
        const finalTime = document.getElementById('final-time');
        if (finalTime && playTime) {
            finalTime.textContent = this.formatTime(playTime);
        }
        
        // Show game over modal with particles
        this.showModal('game-over-modal');
        this.createGameOverParticles();
        this.playSound('gameOver');
        
        // Check for achievements
        this.checkAchievements(score, level, lines);
    }
    
    checkAchievements(score, level, lines) {
        const achievements = [];
        
        if (score >= 10000) achievements.push('🏆 Điểm số cao!');
        if (level >= 10) achievements.push('🚀 Tốc độ cao!');
        if (lines >= 100) achievements.push('💎 Xóa nhiều hàng!');
        if (this.gameStats.gamesPlayed >= 10) achievements.push('🎮 Game thủ chuyên nghiệp!');
        if (this.gameStats.gamesPlayed >= 50) achievements.push('👑 Bậc thầy Tetris!');
        
        if (achievements.length > 0) {
            setTimeout(() => {
                this.showMessage(achievements.join(' '), 5000);
            }, 1000);
        }
    }
    
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    
    updateScore(score, level, lines, combo) {
        // Update basic stats with animations
        this.animateCounterUpdate('score', score.toLocaleString());
        this.animateCounterUpdate('level', level);
        this.animateCounterUpdate('lines', lines);
        
        // Update time if game is running
        if (this.game && this.game.isRunning && this.currentGameStartTime) {
            const playTime = Math.floor((Date.now() - this.currentGameStartTime) / 1000);
            const timeElement = document.getElementById('time');
            if (timeElement) {
                timeElement.textContent = this.formatTime(playTime);
            }
        }
        
        // Show combo if exists
        if (combo && combo > 1) {
            this.showComboEffect(combo);
        }
    }
    
    animateCounterUpdate(elementId, newValue) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.transform = 'scale(1.2)';
            element.style.color = '#4ecdc4';
            element.textContent = newValue;
            
            setTimeout(() => {
                element.style.transform = 'scale(1)';
                element.style.color = '';
            }, 200);
        }
    }
    
    showComboEffect(combo) {
        const comboDiv = document.createElement('div');
        comboDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            color: white;
            padding: 20px 30px;
            border-radius: 50%;
            font-weight: 900;
            font-size: 2rem;
            z-index: 10000;
            animation: comboPopIn 0.6s ease-out forwards;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        `;
        comboDiv.innerHTML = `${combo}x<br><span style="font-size: 0.6em;">COMBO!</span>`;
        document.body.appendChild(comboDiv);
        
        setTimeout(() => {
            comboDiv.style.animation = 'comboPopOut 0.4s ease-in forwards';
            setTimeout(() => {
                comboDiv.remove();
            }, 400);
        }, 1500);
    }
    
    handleLevelUp(level, speed) {
        this.updateLevel(level);
        this.createLevelUpParticles();
        this.playSound('levelUp');
        this.showMessage(`🆙 Level ${level}! Tốc độ tăng! 🆙`, 3000);
        
        // Screen flash effect
        this.createScreenFlash('#4ecdc4');
    }
    
    handleLineClear(lines, combo, points) {
        this.createLineClearParticles(lines);
        this.playSound('lineClear');
        
        // Show line clear message
        let message = '';
        switch (lines) {
            case 1: message = '✨ Single! ✨'; break;
            case 2: message = '🔥 Double! 🔥'; break;
            case 3: message = '💥 Triple! 💥'; break;
            case 4: message = '🌟 TETRIS! 🌟'; break;
            default: message = `🎯 ${lines} hàng! 🎯`;
        }
        
        if (combo > 1) {
            message += ` ${combo}x Combo!`;
        }
        
        this.showMessage(message, 2000);
        
        // Screen flash effect based on line count
        const colors = ['#feca57', '#ff6b6b', '#ff9ff3', '#4ecdc4'];
        this.createScreenFlash(colors[Math.min(lines - 1, 3)]);
    }
    
    handlePieceLand(piece, position) {
        this.createLandParticles(position);
        this.playSound('pieceLand');
    }
    
    handlePieceRotate(piece, direction) {
        this.createRotateParticles();
        this.playSound('pieceRotate');
    }
    
    handlePieceHold(piece) {
        this.createHoldParticles();
        this.playSound('pieceHold');
    }
    
    updateLevel(level) {
        this.animateCounterUpdate('level', level);
    }
    
    
    // ================== PARTICLE EFFECTS ==================
    
    createStartGameParticles() {
        if (!this.effectsEnabled) return;
        this.createParticleExplosion(window.innerWidth / 2, window.innerHeight / 2, '#4ecdc4', 20);
    }
    
    createPauseParticles() {
        if (!this.effectsEnabled) return;
        this.createParticleExplosion(window.innerWidth / 2, window.innerHeight / 2, '#feca57', 10);
    }
    
    createResumeParticles() {
        if (!this.effectsEnabled) return;
        this.createParticleExplosion(window.innerWidth / 2, window.innerHeight / 2, '#4ecdc4', 10);
    }
    
    createRestartParticles() {
        if (!this.effectsEnabled) return;
        this.createParticleExplosion(window.innerWidth / 2, window.innerHeight / 2, '#ff6b6b', 15);
    }
    
    createQuitParticles() {
        if (!this.effectsEnabled) return;
        this.createParticleExplosion(window.innerWidth / 2, window.innerHeight / 2, '#95a5a6', 8);
    }
    
    createGameOverParticles() {
        if (!this.effectsEnabled) return;
        this.createParticleExplosion(window.innerWidth / 2, window.innerHeight / 2, '#e74c3c', 25);
    }
    
    createLevelUpParticles() {
        if (!this.effectsEnabled) return;
        this.createParticleExplosion(window.innerWidth / 2, window.innerHeight / 2, '#f39c12', 15);
    }
    
    createLineClearParticles(lineCount) {
        if (!this.effectsEnabled) return;
        const colors = ['#feca57', '#ff6b6b', '#ff9ff3', '#4ecdc4'];
        const color = colors[Math.min(lineCount - 1, 3)];
        this.createParticleExplosion(window.innerWidth / 2, window.innerHeight / 2, color, lineCount * 5);
    }
    
    createLandParticles(position) {
        if (!this.effectsEnabled) return;
        const canvas = document.getElementById('game-canvas');
        if (canvas) {
            const rect = canvas.getBoundingClientRect();
            const x = rect.left + (position.x * 30) + 15;
            const y = rect.top + (position.y * 30) + 15;
            this.createParticleExplosion(x, y, '#4ecdc4', 5);
        }
    }
    
    createRotateParticles() {
        if (!this.effectsEnabled) return;
        const canvas = document.getElementById('game-canvas');
        if (canvas) {
            const rect = canvas.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            this.createParticleExplosion(x, y, '#ff9ff3', 8);
        }
    }
    
    createHoldParticles() {
        if (!this.effectsEnabled) return;
        const holdCanvas = document.getElementById('hold-canvas');
        if (holdCanvas) {
            const rect = holdCanvas.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            this.createParticleExplosion(x, y, '#feca57', 6);
        }
    }
    
    createMoveParticles(direction) {
        if (!this.effectsEnabled) return;
        const canvas = document.getElementById('game-canvas');
        if (canvas && this.game && this.game.currentPiece) {
            const rect = canvas.getBoundingClientRect();
            const piece = this.game.currentPiece;
            const x = rect.left + (piece.x * 30) + 15;
            const y = rect.top + (piece.y * 30) + 15;
            this.createParticleTrail(x, y, direction === 'left' ? -1 : 1, 0, '#4ecdc4', 3);
        }
    }
    
    createDropParticles() {
        if (!this.effectsEnabled) return;
        const canvas = document.getElementById('game-canvas');
        if (canvas && this.game && this.game.currentPiece) {
            const rect = canvas.getBoundingClientRect();
            const piece = this.game.currentPiece;
            const x = rect.left + (piece.x * 30) + 15;
            const y = rect.top + (piece.y * 30) + 15;
            this.createParticleTrail(x, y, 0, 1, '#ff6b6b', 8);
        }
    }
    
    createParticleExplosion(x, y, color, count) {
        const container = document.getElementById('particles-container');
        if (!container) return;
        
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                left: ${x}px;
                top: ${y}px;
                width: 6px;
                height: 6px;
                background: ${color};
                border-radius: 50%;
                pointer-events: none;
                z-index: 1001;
            `;
            
            container.appendChild(particle);
            
            const angle = (i / count) * Math.PI * 2;
            const velocity = 50 + Math.random() * 100;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            
            this.animateParticle(particle, vx, vy, 1000);
        }
    }
    
    createParticleTrail(x, y, dirX, dirY, color, count) {
        const container = document.getElementById('particles-container');
        if (!container) return;
        
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                left: ${x}px;
                top: ${y}px;
                width: 4px;
                height: 4px;
                background: ${color};
                border-radius: 50%;
                pointer-events: none;
                z-index: 1001;
            `;
            
            container.appendChild(particle);
            
            const vx = dirX * (20 + Math.random() * 30);
            const vy = dirY * (20 + Math.random() * 30);
            
            this.animateParticle(particle, vx, vy, 500);
        }
    }
    
    animateParticle(particle, vx, vy, duration) {
        const startTime = Date.now();
        const startX = parseFloat(particle.style.left);
        const startY = parseFloat(particle.style.top);
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;
            
            if (progress >= 1) {
                particle.remove();
                return;
            }
            
            const currentX = startX + (vx * progress);
            const currentY = startY + (vy * progress) + (0.5 * 9.8 * progress * progress * 10); // gravity
            const opacity = 1 - progress;
            const scale = 1 - progress * 0.5;
            
            particle.style.left = currentX + 'px';
            particle.style.top = currentY + 'px';
            particle.style.opacity = opacity;
            particle.style.transform = `scale(${scale})`;
            
            requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
    }
    
    createScreenFlash(color) {
        if (!this.effectsEnabled) return;
        
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: ${color};
            opacity: 0.3;
            pointer-events: none;
            z-index: 9999;
            animation: screenFlash 0.3s ease-out;
        `;
        
        document.body.appendChild(flash);
        
        setTimeout(() => {
            flash.remove();
        }, 300);
    }
    
    
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            // Add exit animation
            const content = modal.querySelector('.modal-content');
            if (content) {
                content.style.transition = 'all 0.2s ease-in';
                content.style.transform = 'scale(0.8) translateY(50px)';
                content.style.opacity = '0';
                
                setTimeout(() => {
                    modal.classList.add('hidden');
                    // Reset styles for next time
                    content.style.transform = '';
                    content.style.opacity = '';
                    content.style.transition = '';
                }, 200);
            } else {
                modal.classList.add('hidden');
            }
        }
    }
}

// Add CSS animations for enhanced effects
const style = document.createElement('style');
style.textContent = `
    @keyframes comboPopIn {
        0% { transform: translate(-50%, -50%) scale(0) rotate(-180deg); }
        70% { transform: translate(-50%, -50%) scale(1.2) rotate(0deg); }
        100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); }
    }
    
    @keyframes comboPopOut {
        0% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(0.5) rotate(180deg); opacity: 0; }
    }
    
    @keyframes screenFlash {
        0% { opacity: 0; }
        50% { opacity: 0.4; }
        100% { opacity: 0; }
    }
    
    @keyframes slideInRight {
        0% { transform: translateX(100%); opacity: 0; }
        100% { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        0% { transform: translateX(0); opacity: 1; }
        100% { transform: translateX(100%); opacity: 0; }
    }
    
    /* Enhanced button styles */
    .game-btn, .modal-btn {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        position: relative;
        overflow: hidden;
    }
    
    .game-btn:hover, .modal-btn:hover {
        transform: translateY(-3px) scale(1.05) !important;
        box-shadow: 0 10px 25px rgba(0,0,0,0.3) !important;
    }
    
    .game-btn:active, .modal-btn:active {
        transform: translateY(-1px) scale(1.02) !important;
    }
    
    /* Enhanced game info animations */
    .game-info div {
        transition: all 0.3s ease !important;
    }
    
    .game-info div:hover {
        transform: scale(1.05) !important;
        box-shadow: 0 8px 20px rgba(0,0,0,0.2) !important;
    }
    
    /* Enhanced modal animations */
    .modal {
        backdrop-filter: blur(5px);
        transition: backdrop-filter 0.3s ease;
    }
    
    .modal-content {
        box-shadow: 0 25px 50px rgba(0,0,0,0.5) !important;
    }
`;
document.head.appendChild(style);

// Initialize Enhanced Tetris game when page loads
window.addEventListener('load', () => {
    console.log('Page loaded, initializing Enhanced Tetris game...');
    try {
        window.tetrisGame = new TetrisGame();
        console.log('Enhanced Tetris game instance created successfully');
    } catch (error) {
        console.error('Failed to create Enhanced Tetris game instance:', error);
    }
});

// Handle page unload to save stats
window.addEventListener('beforeunload', () => {
    if (window.tetrisGame && window.tetrisGame.currentGameStartTime) {
        const playTime = Math.floor((Date.now() - window.tetrisGame.currentGameStartTime) / 1000);
        window.tetrisGame.gameStats.totalPlayTime += playTime;
        window.tetrisGame.saveStats();
    }
});

// Handle visibility change to auto-pause
document.addEventListener('visibilitychange', () => {
    if (window.tetrisGame && window.tetrisGame.game) {
        if (document.hidden && window.tetrisGame.game.isRunning && !window.tetrisGame.game.isPaused) {
            window.tetrisGame.pauseGame();
        }
    }
});

console.log('Enhanced Tetris Game script loaded successfully! 🎮✨');

