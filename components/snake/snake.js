// Enhanced Snake Hunter - Advanced Snake Game with Modern Features
class SnakeHunter {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gridSize = 30;
        this.tileCount = 20;
        this.snake = [];
        this.foods = [];
        this.obstacles = [];
        this.particles = [];
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.level = 1;
        this.gameTime = 0;
        this.startTime = null;
        this.isRunning = false;
        this.isPaused = false;
        this.gameLoop = null;
        
        // Enhanced power-ups system
        this.powerUps = {
            speed: { count: 0, active: false, duration: 0, cooldown: 0 },
            shield: { count: 0, active: false, duration: 0, cooldown: 0 },
            double: { count: 0, active: false, duration: 0, cooldown: 0 },
            magnet: { count: 0, active: false, duration: 0, cooldown: 0 },
            x10: { count: 0, active: false, duration: 0, cooldown: 0 },
            shrink: { count: 0, active: false, duration: 0, cooldown: 0 },
            ghost: { count: 0, active: false, duration: 0, cooldown: 0 },
            freeze: { count: 0, active: false, duration: 0, cooldown: 0 },
            rainbow: { count: 0, active: false, duration: 0, cooldown: 0 }
        };
        
        // Enhanced game settings
        this.baseSpeed = 120;
        this.currentSpeed = this.baseSpeed;
        this.scoreMultiplier = 1;
        this.isInvincible = false;
        this.canPassWalls = false;
        this.timeFreezed = false;
        this.rainbowMode = false;
        
        // Game statistics
        this.gameStats = {
            gamesPlayed: 0,
            totalScore: 0,
            bestScore: 0,
            totalFoodsEaten: 0,
            totalPlayTime: 0,
            longestSnake: 0
        };
        
        // Visual effects
        this.trail = [];
        this.screenShake = { intensity: 0, duration: 0 };
        this.backgroundPattern = 'dots'; // dots, grid, waves
        
        // Game mode and settings
        this.gameMode = 'classic';
        this.settings = {};
        
        // Input handling
        this.inputQueue = [];
        this.lastInputTime = 0;
        this.inputCooldown = 100; // ms
        
        // Audio system
        this.audioContext = null;
        this.soundEnabled = true;
        this.musicEnabled = true;
        
        // Enhanced food types with special effects
        this.foodTypes = {
            normal: { emoji: '🍎', points: 10, color: '#ff6b6b', probability: 0.5, effect: 'none' },
            golden: { emoji: '🍊', points: 25, color: '#feca57', probability: 0.2, effect: 'bonus' },
            diamond: { emoji: '💎', points: 50, color: '#4ecdc4', probability: 0.1, effect: 'mega' },
            power: { emoji: '⚡', points: 15, color: '#ff9ff3', probability: 0.08, effect: 'powerup' },
            mystery: { emoji: '🎁', points: 30, color: '#9b59b6', probability: 0.05, effect: 'random' },
            rainbow: { emoji: '🌈', points: 100, color: '#e67e22', probability: 0.02, effect: 'rainbow' },
            time: { emoji: '⏰', points: 20, color: '#3498db', probability: 0.03, effect: 'timefreeze' },
            bomb: { emoji: '💣', points: -10, color: '#e74c3c', probability: 0.02, effect: 'bomb' }
        };
        
        // Enhanced obstacle types
        this.obstacleTypes = {
            wall: { emoji: '🧱', color: '#95a5a6', destructible: false },
            spike: { emoji: '🌵', color: '#e74c3c', destructible: false },
            bomb: { emoji: '💣', color: '#2c3e50', destructible: true },
            ice: { emoji: '🧊', color: '#74b9ff', destructible: true },
            fire: { emoji: '🔥', color: '#fd79a8', destructible: false }
        };
        
        this.init();
    }
    
    
    init() {
        console.log('Enhanced Snake Hunter initializing...');
        
        // Load game data
        this.loadSettings();
        this.loadStats();
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupGame());
        } else {
            this.setupGame();
        }
    }
    
    setupGame() {
        console.log('Setting up Enhanced Snake Hunter...');
        
        this.canvas = document.getElementById('snake-canvas');
        if (!this.canvas) {
            console.error('Snake canvas not found!');
            this.showErrorMessage('Không tìm thấy game canvas!');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('Canvas context not supported!');
            this.showErrorMessage('Trình duyệt không hỗ trợ Canvas!');
            return;
        }
        
        // Apply enhanced settings
        this.applySettings();
        
        // Set canvas size based on tileCount and gridSize
        this.canvas.width = this.tileCount * this.gridSize;
        this.canvas.height = this.tileCount * this.gridSize;
        
        // Set up enhanced event listeners
        this.setupEventListeners();
        this.setupAdvancedControls();
        
        // Add visual enhancements
        this.setupVisualEnhancements();
        
        // Initialize enhanced game
        this.initializeGame();
    }
    
    setupVisualEnhancements() {
        // Add dynamic background pattern
        this.canvas.style.background = this.getBackgroundPattern();
        this.canvas.style.borderRadius = '20px';
        this.canvas.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)';
        
        // Add glow effect to sidebar
        const sidebar = document.querySelector('.snake-sidebar');
        if (sidebar) {
            sidebar.style.background = 'rgba(255, 255, 255, 0.1)';
            sidebar.style.backdropFilter = 'blur(15px)';
            sidebar.style.border = '2px solid rgba(255, 255, 255, 0.2)';
        }
        
        // Enhanced button animations
        this.addButtonEnhancements();
    }
    
    getBackgroundPattern() {
        switch (this.backgroundPattern) {
            case 'grid':
                return `
                    linear-gradient(145deg, #1a1a2e, #16213e),
                    repeating-linear-gradient(90deg, transparent, transparent 29px, rgba(255,255,255,0.05) 29px, rgba(255,255,255,0.05) 30px),
                    repeating-linear-gradient(0deg, transparent, transparent 29px, rgba(255,255,255,0.05) 29px, rgba(255,255,255,0.05) 30px)
                `;
            case 'waves':
                return `
                    linear-gradient(145deg, #1a1a2e, #16213e),
                    radial-gradient(circle at 25% 25%, rgba(78, 205, 196, 0.1) 0%, transparent 50%),
                    radial-gradient(circle at 75% 75%, rgba(255, 107, 107, 0.1) 0%, transparent 50%)
                `;
            default: // dots
                return `
                    linear-gradient(145deg, #1a1a2e, #16213e),
                    radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 1px, transparent 1px),
                    radial-gradient(circle at 80% 80%, rgba(255,255,255,0.05) 1px, transparent 1px)
                `;
        }
    }
    
    addButtonEnhancements() {
        const buttons = document.querySelectorAll('.game-btn, .modal-btn');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'translateY(-3px) scale(1.05)';
                button.style.boxShadow = '0 15px 35px rgba(0,0,0,0.3)';
                this.playSound('buttonHover');
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translateY(0) scale(1)';
                button.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
            });
            
            button.addEventListener('click', () => {
                this.playSound('buttonClick');
                this.animateButtonPress(button);
            });
        });
    }
    
    animateButtonPress(button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 150);
    }
    
    setupAdvancedControls() {
        // Mouse controls for mobile
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        
        // Gesture controls
        this.setupGestureControls();
        
        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
    }
    
    setupGestureControls() {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            this.handleGesture(touchStartX, touchStartY, touchEndX, touchEndY);
        });
    }
    
    handleGesture(startX, startY, endX, endY) {
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const minSwipeDistance = 50;
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            if (Math.abs(deltaX) > minSwipeDistance) {
                if (deltaX > 0) {
                    this.changeDirection('right');
                } else {
                    this.changeDirection('left');
                }
            }
        } else {
            // Vertical swipe
            if (Math.abs(deltaY) > minSwipeDistance) {
                if (deltaY > 0) {
                    this.changeDirection('down');
                } else {
                    this.changeDirection('up');
                }
            }
        }
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Power-up shortcuts (1-9)
            if (e.key >= '1' && e.key <= '9') {
                const powerUpIndex = parseInt(e.key) - 1;
                const powerUpNames = Object.keys(this.powerUps);
                if (powerUpIndex < powerUpNames.length) {
                    this.activatePowerUp(powerUpNames[powerUpIndex]);
                }
            }
            
            // Special keys
            switch (e.key.toLowerCase()) {
                case 'p':
                    this.togglePause();
                    break;
                case 'r':
                    if (this.isRunning) this.restartGame();
                    break;
                case 'm':
                    this.toggleSound();
                    break;
                case 'f':
                    this.toggleFullscreen();
                    break;
                case 'h':
                    this.showHelp();
                    break;
            }
        });
    }
    
    
    setupEventListeners() {
        // Enhanced button controls with feedback
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.togglePause());
        }
        
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => this.restartGame());
        }
        
        // Enhanced modal buttons
        const resumeBtn = document.getElementById('resume-btn');
        if (resumeBtn) {
            resumeBtn.addEventListener('click', () => {
                this.hideModal('pause-modal');
                this.togglePause();
            });
        }
        
        const restartModalBtn = document.getElementById('restart-modal-btn');
        if (restartModalBtn) {
            restartModalBtn.addEventListener('click', () => {
                this.hideModal('pause-modal');
                this.restartGame();
            });
        }
        
        const quitBtn = document.getElementById('quit-btn');
        if (quitBtn) {
            quitBtn.addEventListener('click', () => {
                this.hideModal('pause-modal');
                this.quitGame();
            });
        }
        
        const playAgainBtn = document.getElementById('play-again-btn');
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => {
                this.hideModal('game-over-modal');
                this.restartGame();
            });
        }
        
        const backToHubBtn = document.getElementById('back-to-hub-btn');
        if (backToHubBtn) {
            backToHubBtn.addEventListener('click', () => {
                this.hideModal('game-over-modal');
                this.quitGame();
            });
        }
    }
    
    changeDirection(direction) {
        const now = Date.now();
        if (now - this.lastInputTime < this.inputCooldown) return;
        
        let newDx = this.dx, newDy = this.dy;
        let validDirection = false;
        
        switch (direction) {
            case 'up':
                if (this.dy !== 1) {
                    newDx = 0; newDy = -1;
                    validDirection = true;
                }
                break;
            case 'down':
                if (this.dy !== -1) {
                    newDx = 0; newDy = 1;
                    validDirection = true;
                }
                break;
            case 'left':
                if (this.dx !== 1) {
                    newDx = -1; newDy = 0;
                    validDirection = true;
                }
                break;
            case 'right':
                if (this.dx !== -1) {
                    newDx = 1; newDy = 0;
                    validDirection = true;
                }
                break;
        }
        
        if (validDirection) {
            this.inputQueue.push({ dx: newDx, dy: newDy });
            this.lastInputTime = now;
            
            // Immediate visual feedback
            if (this.dx !== 0 || this.dy !== 0) {
                this.dx = newDx;
                this.dy = newDy;
            } else {
                this.dx = newDx;
                this.dy = newDy;
            }
            
            this.playSound('move');
            this.createDirectionParticles(direction);
        }
    }
    
    createDirectionParticles(direction) {
        if (!this.settings.effects) return;
        
        const head = this.snake[0];
        if (!head) return;
        
        const centerX = head.x * this.gridSize + this.gridSize / 2;
        const centerY = head.y * this.gridSize + this.gridSize / 2;
        
        for (let i = 0; i < 3; i++) {
            const particle = {
                x: centerX + (Math.random() - 0.5) * 10,
                y: centerY + (Math.random() - 0.5) * 10,
                vx: 0, vy: 0,
                life: 15,
                color: '#4ecdc4',
                size: 3
            };
            
            switch (direction) {
                case 'up': particle.vy = -2; break;
                case 'down': particle.vy = 2; break;
                case 'left': particle.vx = -2; break;
                case 'right': particle.vx = 2; break;
            }
            
            this.particles.push(particle);
        }
    }
    
    
    initializeGame() {
        console.log('Initializing Enhanced Snake Hunter...');
        
        // Reset enhanced game state
        this.score = 0;
        this.level = 1;
        this.gameTime = 0;
        this.startTime = Date.now();
        this.currentSpeed = this.baseSpeed;
        this.scoreMultiplier = 1;
        this.isInvincible = false;
        this.canPassWalls = false;
        this.timeFreezed = false;
        this.rainbowMode = false;
        
        // Reset input handling
        this.inputQueue = [];
        this.lastInputTime = 0;
        
        // Reset visual effects
        this.trail = [];
        this.screenShake = { intensity: 0, duration: 0 };
        
        // Initialize enhanced power-ups
        this.initializePowerUps();
        
        // Clear arrays
        this.foods = [];
        this.obstacles = [];
        this.particles = [];
        
        // Generate enhanced obstacles
        this.generateObstacles();
        
        // Initialize snake in safe position
        this.snake = [this.findSafePosition()];
        
        // Initialize direction
        this.dx = 0;
        this.dy = 0;
        
        // Generate enhanced food
        this.generateFood();
        
        // Start enhanced game
        this.isRunning = true;
        this.isPaused = false;
        this.startGameLoop();
        
        // Update UI
        this.updateUI();
        
        // Show start message
        this.showGameMessage('🐍 Chúc Hằng chơi vui vẻ! 🐍', 2000);
        this.playSound('gameStart');
        this.createStartGameEffect();
        
        // Update stats
        this.gameStats.gamesPlayed++;
        this.saveStats();
        
        console.log('Enhanced Snake Hunter initialized successfully!');
    }
    
    createStartGameEffect() {
        // Rainbow particle explosion
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const velocity = 50 + Math.random() * 50;
            const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#feca57', '#ff9ff3'];
            
            this.particles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                life: 30,
                color: colors[i % colors.length],
                size: 4 + Math.random() * 3
            });
        }
    }
    
    showGameMessage(message, duration = 3000) {
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            padding: 20px 30px;
            border-radius: 15px;
            font-weight: 700;
            font-size: 1.2rem;
            z-index: 10000;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            animation: messagePopIn 0.5s ease-out forwards;
            text-align: center;
        `;
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.style.animation = 'messagePopOut 0.3s ease-in forwards';
            setTimeout(() => {
                messageDiv.remove();
            }, 300);
        }, duration);
    }
    
    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(231, 76, 60, 0.95);
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
    
    startGameLoop() {
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
        }
        
        let lastTime = 0;
        const gameLoop = (currentTime) => {
            if (!this.isPaused && this.isRunning) {
                // Process input queue for responsive controls
                if (this.inputQueue.length > 0) {
                    const { dx, dy } = this.inputQueue.shift(); // Get latest direction
                    this.dx = dx;
                    this.dy = dy;
                }
                
                if (currentTime - lastTime >= this.currentSpeed) {
                    this.update();
                    this.draw();
                    lastTime = currentTime;
                }
                this.gameLoop = requestAnimationFrame(gameLoop);
            }
        };
        
        this.gameLoop = requestAnimationFrame(gameLoop);
    }
    
    update() {
        // Update game time
        if (this.startTime) {
            this.gameTime = Math.floor((Date.now() - this.startTime) / 1000);
        }
        
        // Update enhanced power-ups duration
        this.updatePowerUps();
        
        // Update screen shake
        this.updateScreenShake();
        
        // Don't move if snake hasn't started moving yet
        if (this.dx === 0 && this.dy === 0) {
            // Update particles and effects
            this.updateParticles();
            this.updateTrail();
            this.updateUI();
            return;
        }
        
        // Move snake with enhanced collision detection
        const head = {x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy};
        
        // Enhanced wall collision handling
        if (!this.canPassWalls && (head.x < 0 || head.x >= this.cols || head.y < 0 || head.y >= this.rows)) {
            if (this.settings.wallWrapping) {
                head.x = (head.x + this.cols) % this.cols;
                head.y = (head.y + this.rows) % this.rows;
            } else {
                this.gameOver();
                return;
            }
        }
        
        // Handle wall wrapping or ghost mode
        if (this.canPassWalls || this.settings.wallWrapping) {
            head.x = (head.x + this.cols) % this.cols;
            head.y = (head.y + this.rows) % this.rows;
        }
        
        // Enhanced self-collision detection
        if (!this.isInvincible) {
            for (let i = 0; i < this.snake.length; i++) {
                if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                    this.gameOver();
                    return;
                }
            }
        }
        
        // Enhanced obstacle collision
        if (!this.isInvincible) {
            for (let obstacle of this.obstacles) {
                if (head.x === obstacle.x && head.y === obstacle.y) {
                    this.gameOver();
                    return;
                }
            }
        }
        
        // Add head to snake
        this.snake.unshift(head);
        
        // Enhanced food consumption system
        let foodEaten = false;
        for (let i = this.foods.length - 1; i >= 0; i--) {
            const food = this.foods[i];
            if (head.x === food.x && head.y === food.y) {
                this.consumeEnhancedFood(food);
                this.foods.splice(i, 1);
                foodEaten = true;
                break;
            }
        }
        
        // Remove tail only if no food was eaten
        if (!foodEaten) {
            const tail = this.snake.pop();
            this.addTrailSegment(tail);
        }
        
        // Update enhanced effects
        this.updateParticles();
        this.updateTrail();
        
        // Generate new food if needed
        if (this.foods.length < this.maxFoods) {
            this.generateFood();
        }
        
        // Enhanced level progression
        this.checkLevelProgression();
        
        // Update enhanced UI
        this.updateUI();
    }
    
    consumeEnhancedFood(food) {
        // Calculate enhanced score with combos and multipliers
        let points = food.points || 10;
        
        // Apply score multiplier
        points *= this.scoreMultiplier;
        
        // Bonus for consecutive special foods
        if (food.type !== 'normal') {
            this.specialFoodCombo = (this.specialFoodCombo || 0) + 1;
            points *= (1 + this.specialFoodCombo * 0.1);
            this.createStatusEffect(`🔥 Combo x${this.specialFoodCombo}!`, '#FF6B6B');
        } else {
            this.specialFoodCombo = 0;
        }
        
        // Level bonus
        points *= (1 + this.level * 0.05);
        
        this.score += Math.floor(points);
        
        // Enhanced food effects
        this.applyEnhancedFoodEffects(food);
        
        // Create consumption effect
        this.createFoodConsumptionEffect(food);
        
        // Play enhanced sound
        this.playSound(food.type === 'normal' ? 'eat' : 'powerUp');
        
        // Update statistics
        this.gameStats.totalFood++;
        if (food.type !== 'normal') {
            this.gameStats.specialFood++;
        }
        this.gameStats.bestScore = Math.max(this.gameStats.bestScore, this.score);
        this.saveStats();
        
        // Check achievements
        this.checkFoodAchievements();
    }
    
    applyEnhancedFoodEffects(food) {
        switch (food.type) {
            case 'speed':
                this.currentSpeed = Math.max(50, this.currentSpeed - 15);
                this.createStatusEffect('⚡ Tăng Tốc!', '#FFD700');
                this.addScreenShake(3, 100);
                break;
                
            case 'slow':
                this.currentSpeed = Math.min(300, this.currentSpeed + 25);
                this.createStatusEffect('🐌 Chậm Lại!', '#87CEEB');
                break;
                
            case 'invincible':
                this.activateInvincibility(5000);
                break;
                
            case 'ghost':
                this.activateGhostMode(7000);
                break;
                
            case 'rainbow':
                this.activateRainbowMode(10000);
                break;
                
            case 'freeze':
                this.activateTimeFreeze(3000);
                break;
                
            case 'shrink':
                if (this.snake.length > 3) {
                    const removeCount = Math.min(3, this.snake.length - 1);
                    for (let i = 0; i < removeCount; i++) {
                        const removedSegment = this.snake.pop();
                        this.createShrinkEffect(removedSegment);
                    }
                    this.createStatusEffect('✂️ Thu Nhỏ!', '#FF6B6B');
                    this.addScreenShake(5, 200);
                }
                break;
                
            case 'bomb':
                this.explodeBomb(food.x, food.y);
                break;
                
            case 'teleport':
                this.teleportSnake();
                break;
                
            case 'multiply':
                this.scoreMultiplier = Math.min(5, this.scoreMultiplier + 0.5);
                this.createStatusEffect(`💰 Nhân Điểm x${this.scoreMultiplier}!`, '#FFD700');
                break;
        }
    }
    
    activateInvincibility(duration) {
        this.isInvincible = true;
        this.invincibilityEndTime = Date.now() + duration;
        this.createStatusEffect('🛡️ Bất Tử!', '#FFD700');
        this.addScreenShake(2, 150);
        
        setTimeout(() => {
            this.isInvincible = false;
            this.createStatusEffect('🛡️ Hết Bất Tử!', '#FFA500');
        }, duration);
    }
    
    activateGhostMode(duration) {
        this.canPassWalls = true;
        this.ghostModeEndTime = Date.now() + duration;
        this.createStatusEffect('👻 Xuyên Tường!', '#9370DB');
        
        setTimeout(() => {
            this.canPassWalls = false;
            this.createStatusEffect('👻 Hết Xuyên Tường!', '#DDA0DD');
        }, duration);
    }
    
    activateRainbowMode(duration) {
        this.rainbowMode = true;
        this.rainbowModeEndTime = Date.now() + duration;
        this.scoreMultiplier = Math.max(this.scoreMultiplier, 2);
        this.createStatusEffect('🌈 Cầu Vồng!', '#FF69B4');
        
        setTimeout(() => {
            this.rainbowMode = false;
            if (this.scoreMultiplier === 2) {
                this.scoreMultiplier = 1;
            }
            this.createStatusEffect('🌈 Hết Cầu Vồng!', '#FFB6C1');
        }, duration);
    }
    
    activateTimeFreeze(duration) {
        this.timeFreezed = true;
        this.timeFreezeEndTime = Date.now() + duration;
        this.createStatusEffect('❄️ Đóng Băng!', '#87CEEB');
        
        // Stop game loop temporarily
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
        }
        
        setTimeout(() => {
            this.timeFreezed = false;
            this.createStatusEffect('❄️ Hết Đóng Băng!', '#B0E0E6');
            this.startGameLoop(); // Restart game loop
        }, duration);
    }
    
    teleportSnake() {
        const safePosition = this.findSafePosition();
        if (safePosition) {
            // Create teleport effect at current position
            const currentHead = this.snake[0];
            this.createTeleportEffect(currentHead.x, currentHead.y);
            
            // Move snake to new position
            this.snake[0] = safePosition;
            
            // Create arrival effect
            this.createTeleportEffect(safePosition.x, safePosition.y);
            this.createStatusEffect('🌟 Dịch Chuyển!', '#FF1493');
            this.addScreenShake(8, 300);
            this.playSound('teleport');
        }
    }
    
    explodeBomb(x, y) {
        this.createExplosionEffect(x, y);
        this.addScreenShake(15, 500);
        this.playSound('explosion');
        
        // Remove obstacles in explosion radius
        const radius = 2;
        this.obstacles = this.obstacles.filter(obstacle => {
            const distance = Math.abs(obstacle.x - x) + Math.abs(obstacle.y - y);
            return distance > radius;
        });
        
        // Extra points for cleared obstacles
        this.score += 50;
        this.createStatusEffect('💥 Nổ Tung!', '#FF4500');
    }
    
    eatFood(food, index) {
        // Calculate points
        let points = food.points * this.scoreMultiplier;
        this.score += points;
        
        // Level up - slower progression
        this.level = Math.floor(this.score / 200) + 1; // Changed from 100 to 200 for slower progression
        
        // Remove food
        this.foods.splice(index, 1);
        
        // Add particles
        this.addParticles(food.x, food.y, food.color);
        
        // Generate new food
        this.generateFood();
        
        // Restart game loop with new speed
        this.startGameLoop();
        
        // Play sound effect
        this.playSound('eat');
    }
    
    applyMagnetEffect() {
        const head = this.snake[0];
        const magnetRange = 3;
        
        for (let food of this.foods) {
            const distance = Math.abs(head.x - food.x) + Math.abs(head.y - food.y);
            if (distance <= magnetRange && distance > 0) {
                // Move food towards snake
                if (food.x < head.x) food.x++;
                if (food.x > head.x) food.x--;
                if (food.y < head.y) food.y++;
                if (food.y > head.y) food.y--;
            }
        }
    }
    
    updatePowerUps() {
        const now = Date.now();
        
        for (let powerUp in this.powerUps) {
            if (this.powerUps[powerUp].active && now > this.powerUps[powerUp].duration) {
                this.powerUps[powerUp].active = false;
                this.deactivatePowerUp(powerUp);
            }
        }
    }
    
    activatePowerUp(type) {
        if (this.powerUps[type].count > 0) {
            this.powerUps[type].count--;
            this.powerUps[type].active = true;
            
            switch (type) {
                case 'speed':
                    this.currentSpeed = Math.max(50, this.baseSpeed - 50);
                    this.powerUps[type].duration = Date.now() + 10000; // 10 seconds
                    break;
                case 'shield':
                    this.isInvincible = true;
                    this.powerUps[type].duration = Date.now() + 30000; // 30 seconds
                    break;
                case 'double':
                    this.scoreMultiplier = 2;
                    this.powerUps[type].duration = Date.now() + 10000; // 10 seconds
                    break;
                case 'magnet':
                    this.powerUps[type].duration = Date.now() + 10000; // 10 seconds
                    break;
                case 'x10':
                    this.scoreMultiplier = 10;
                    this.powerUps[type].duration = Date.now() + 15000; // 15 seconds
                    break;
                case 'shrink':
                    // Shrink snake to half length
                    const targetLength = Math.max(1, Math.floor(this.snake.length / 2));
                    while (this.snake.length > targetLength) {
                        this.snake.pop();
                    }
                    this.powerUps[type].duration = Date.now() + 10000; // 10 seconds
                    break;
                case 'ghost':
                    this.canPassWalls = true;
                    this.powerUps[type].duration = Date.now() + 10000; // 10 seconds
                    break;
            }
            
            this.startGameLoop();
            this.updateUI();
            this.playSound('powerup');
        }
    }
    
    deactivatePowerUp(type) {
        switch (type) {
            case 'speed':
                this.currentSpeed = this.baseSpeed;
                break;
            case 'shield':
                this.isInvincible = false;
                break;
            case 'double':
                this.scoreMultiplier = 1;
                break;
            case 'x10':
                this.scoreMultiplier = 1;
                break;
            case 'ghost':
                this.canPassWalls = false;
                break;
        }
        
        this.startGameLoop();
        this.updateUI();
    }
    
    generateFood() {
        // Generate multiple foods based on level and game mode
        let baseFoodCount = Math.min(1 + Math.floor(this.level / 2), 6);
        
        // Adjust based on game mode
        switch (this.gameMode) {
            case 'challenge':
                baseFoodCount = Math.max(1, baseFoodCount - 1); // Fewer food
                break;
            case 'relax':
                baseFoodCount = Math.min(8, baseFoodCount + 1); // More food
                break;
        }
        
        const foodCount = Math.min(baseFoodCount, 8);
        
        while (this.foods.length < foodCount) {
            const food = this.generateSingleFood();
            if (food) {
                this.foods.push(food);
            }
        }
    }
    
    generateSingleFood() {
        let attempts = 0;
        const maxAttempts = 100;
        
        while (attempts < maxAttempts) {
            const x = Math.floor(Math.random() * this.tileCount);
            const y = Math.floor(Math.random() * this.tileCount);
            
            // Check if position is free
            if (!this.isPositionOccupied(x, y)) {
                // Choose food type based on probability
                const rand = Math.random();
                let cumulative = 0;
                
                for (let type in this.foodTypes) {
                    cumulative += this.foodTypes[type].probability;
                    if (rand <= cumulative) {
                        return {
                            x: x,
                            y: y,
                            type: type,
                            emoji: this.foodTypes[type].emoji,
                            points: this.foodTypes[type].points,
                            color: this.foodTypes[type].color
                        };
                    }
                }
            }
            attempts++;
        }
        return null;
    }
    
    generateObstacles() {
        // Generate obstacles based on level and game mode
        let baseObstacleCount = Math.max(0, Math.min(Math.floor((this.level - 1) / 2), 5));
        
        // Adjust based on game mode
        switch (this.gameMode) {
            case 'challenge':
                baseObstacleCount = Math.max(2, baseObstacleCount + 2); // More obstacles
                break;
            case 'relax':
                baseObstacleCount = Math.max(0, baseObstacleCount - 1); // Fewer obstacles
                break;
        }
        
        const obstacleCount = Math.min(baseObstacleCount, 8);
        
        for (let i = 0; i < obstacleCount; i++) {
            const obstacle = this.generateSingleObstacle();
            if (obstacle) {
                this.obstacles.push(obstacle);
            }
        }
    }
    
    generateSingleObstacle() {
        let attempts = 0;
        const maxAttempts = 50;
        
        while (attempts < maxAttempts) {
            const x = Math.floor(Math.random() * this.tileCount);
            const y = Math.floor(Math.random() * this.tileCount);
            
            // Check if position is free
            if (!this.isPositionOccupied(x, y)) {
                const types = Object.keys(this.obstacleTypes);
                const type = types[Math.floor(Math.random() * types.length)];
                
                return {
                    x: x,
                    y: y,
                    type: type,
                    emoji: this.obstacleTypes[type].emoji,
                    color: this.obstacleTypes[type].color
                };
            }
            attempts++;
        }
        return null;
    }
    
    isPositionOccupied(x, y) {
        // Check snake
        for (let segment of this.snake) {
            if (segment.x === x && segment.y === y) return true;
        }
        
        // Check foods
        for (let food of this.foods) {
            if (food.x === x && food.y === y) return true;
        }
        
        // Check obstacles
        for (let obstacle of this.obstacles) {
            if (obstacle.x === x && obstacle.y === y) return true;
        }
        
        return false;
    }
    
    findSafePosition() {
        let attempts = 0;
        const maxAttempts = 100;
        
        while (attempts < maxAttempts) {
            const x = Math.floor(Math.random() * this.tileCount);
            const y = Math.floor(Math.random() * this.tileCount);
            
            if (!this.isPositionOccupied(x, y)) {
                return {x: x, y: y};
            }
            attempts++;
        }
        
        // Fallback to center if no safe position found
        return {x: Math.floor(this.tileCount / 2), y: Math.floor(this.tileCount / 2)};
    }
    
    loadSettings() {
        try {
            const savedSettings = JSON.parse(localStorage.getItem('snake-settings') || '{}');
            this.settings = savedSettings;
            this.gameMode = savedSettings.gameMode || 'classic';
            console.log('Loaded settings:', this.settings);
        } catch (error) {
            console.error('Error loading settings:', error);
            this.settings = {};
            this.gameMode = 'classic';
        }
    }
    
    applySettings() {
        // Apply board size
        if (this.settings.boardSize) {
            switch (this.settings.boardSize) {
                case 'small':
                    this.tileCount = 15;
                    this.gridSize = 40;
                    break;
                case 'large':
                    this.tileCount = 25;
                    this.gridSize = 24;
                    break;
                default:
                    this.tileCount = 20;
                    this.gridSize = 30;
            }
        }
        
        // Apply speed
        if (this.settings.speed) {
            switch (this.settings.speed) {
                case 'slow':
                    this.baseSpeed = 200;
                    break;
                case 'fast':
                    this.baseSpeed = 100;
                    break;
                default:
                    this.baseSpeed = 150;
            }
        }
        
        // Apply game mode specific settings
        this.applyGameModeSettings();
        
        console.log('Applied settings - Board:', this.tileCount + 'x' + this.tileCount, 'Speed:', this.baseSpeed, 'Mode:', this.gameMode);
    }
    
    applyGameModeSettings() {
        switch (this.gameMode) {
            case 'challenge':
                // Challenge mode: faster, more obstacles, double points
                this.baseSpeed = Math.max(80, this.baseSpeed - 20); // Balanced speed
                this.scoreMultiplier = 2;
                break;
            case 'relax':
                // Relax mode: slower, fewer obstacles, more power-ups
                this.baseSpeed = Math.min(200, this.baseSpeed + 50); // Not too slow
                this.scoreMultiplier = 1;
                break;
            default:
                // Classic mode: balanced
                this.baseSpeed = 100; // Consistent base speed
                this.scoreMultiplier = 1;
        }
        this.currentSpeed = this.baseSpeed;
    }
    
    initializePowerUps() {
        this.powerUps = {
            speed: { count: 0, active: false, duration: 0 },
            shield: { count: 0, active: false, duration: 0 },
            double: { count: 0, active: false, duration: 0 },
            magnet: { count: 0, active: false, duration: 0 },
            x10: { count: 0, active: false, duration: 0 },
            shrink: { count: 0, active: false, duration: 0 },
            ghost: { count: 0, active: false, duration: 0 }
        };
        
        // Give initial power-ups based on game mode
        if (this.gameMode === 'relax') {
            this.powerUps.speed.count = 2;
            this.powerUps.shield.count = 1;
            this.powerUps.ghost.count = 1;
        } else if (this.gameMode === 'challenge') {
            this.powerUps.shield.count = 1;
            this.powerUps.x10.count = 1;
        }
    }
    
    addParticles(x, y, color) {
        // Check if effects are enabled in settings
        if (this.settings.effects === 'off') {
            return;
        }
        
        // Optimized: reduced particle count for better performance
        for (let i = 0; i < 4; i++) { // Reduced from 8 to 4 particles
            this.particles.push({
                x: x * this.gridSize + this.gridSize / 2,
                y: y * this.gridSize + this.gridSize / 2,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 20, // Reduced from 30 to 20 for faster cleanup
                color: color
            });
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.drawGrid();
        
        // Draw obstacles
        this.drawObstacles();
        
        // Draw foods
        this.drawFoods();
        
        // Draw snake
        this.drawSnake();
        
        // Draw particles
        this.drawParticles();
        
        // Draw power-up effects
        this.drawPowerUpEffects();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i <= this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }
    }
    
    drawSnake() {
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            
            // Draw snake body
            if (i === 0) {
                // Head
                this.ctx.fillStyle = this.isInvincible ? '#ff6b6b' : '#4ecdc4';
                this.ctx.shadowColor = this.isInvincible ? '#ff6b6b' : '#4ecdc4';
                this.ctx.shadowBlur = 10;
            } else {
                // Body
                this.ctx.fillStyle = '#45b7d1';
                this.ctx.shadowColor = '#45b7d1';
                this.ctx.shadowBlur = 5;
            }
            
            this.ctx.fillRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4);
            
            // Draw eyes for head
            if (i === 0) {
                this.ctx.fillStyle = '#000';
                this.ctx.shadowBlur = 0;
                
                // Eye positions based on direction
                let eyeX1, eyeY1, eyeX2, eyeY2;
                if (this.dx === 1) { // Right
                    eyeX1 = x + this.gridSize - 8; eyeY1 = y + 8;
                    eyeX2 = x + this.gridSize - 8; eyeY2 = y + this.gridSize - 12;
                } else if (this.dx === -1) { // Left
                    eyeX1 = x + 6; eyeY1 = y + 8;
                    eyeX2 = x + 6; eyeY2 = y + this.gridSize - 12;
                } else if (this.dy === -1) { // Up
                    eyeX1 = x + 8; eyeY1 = y + 6;
                    eyeX2 = x + this.gridSize - 12; eyeY2 = y + 6;
                } else { // Down or stationary
                    eyeX1 = x + 8; eyeY1 = y + this.gridSize - 8;
                    eyeX2 = x + this.gridSize - 12; eyeY2 = y + this.gridSize - 8;
                }
                
                this.ctx.fillRect(eyeX1, eyeY1, 4, 4);
                this.ctx.fillRect(eyeX2, eyeY2, 4, 4);
            }
        }
        
        this.ctx.shadowBlur = 0;
    }
    
    drawFoods() {
        for (let food of this.foods) {
            const x = food.x * this.gridSize;
            const y = food.y * this.gridSize;
            
            // Draw food background
            this.ctx.fillStyle = food.color;
            this.ctx.shadowColor = food.color;
            this.ctx.shadowBlur = 10;
            this.ctx.fillRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4);
            
            // Draw emoji
            this.ctx.font = `${this.gridSize - 8}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(food.emoji, x + this.gridSize / 2, y + this.gridSize / 2);
            
            this.ctx.shadowBlur = 0;
        }
    }
    
    drawObstacles() {
        for (let obstacle of this.obstacles) {
            const x = obstacle.x * this.gridSize;
            const y = obstacle.y * this.gridSize;
            
            // Draw obstacle background
            this.ctx.fillStyle = obstacle.color;
            this.ctx.shadowColor = obstacle.color;
            this.ctx.shadowBlur = 5;
            this.ctx.fillRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4);
            
            // Draw emoji
            this.ctx.font = `${this.gridSize - 8}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(obstacle.emoji, x + this.gridSize / 2, y + this.gridSize / 2);
            
            this.ctx.shadowBlur = 0;
        }
    }
    
    drawParticles() {
        for (let particle of this.particles) {
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.life / 30;
            this.ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
        }
        this.ctx.globalAlpha = 1;
    }
    
    drawPowerUpEffects() {
        if (this.isInvincible) {
            // Draw shield effect
            const head = this.snake[0];
            const x = head.x * this.gridSize;
            const y = head.y * this.gridSize;
            
            this.ctx.strokeStyle = '#ff6b6b';
            this.ctx.lineWidth = 3;
            this.ctx.globalAlpha = 0.5;
            this.ctx.beginPath();
            this.ctx.arc(x + this.gridSize / 2, y + this.gridSize / 2, this.gridSize / 2 + 5, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.globalAlpha = 1;
        }
    }
    
    handleKeyPress(e) {
        if (!this.isRunning || this.isPaused) return;
        
        let newDx = this.dx, newDy = this.dy;
        let directionChanged = false;
        
        switch (e.key) {
            case 'ArrowUp':
                if (this.dy !== 1) {
                    newDx = 0;
                    newDy = -1;
                    directionChanged = true;
                }
                break;
            case 'ArrowDown':
                if (this.dy !== -1) {
                    newDx = 0;
                    newDy = 1;
                    directionChanged = true;
                }
                break;
            case 'ArrowLeft':
                if (this.dx !== 1) {
                    newDx = -1;
                    newDy = 0;
                    directionChanged = true;
                }
                break;
            case 'ArrowRight':
                if (this.dx !== -1) {
                    newDx = 1;
                    newDy = 0;
                    directionChanged = true;
                }
                break;
            case ' ':
                e.preventDefault();
                this.togglePause();
                break;
            case 'r':
            case 'R':
                this.restartGame();
                break;
            case '1':
                this.activatePowerUp('speed');
                break;
            case '2':
                this.activatePowerUp('shield');
                break;
            case '3':
                this.activatePowerUp('double');
                break;
            case '4':
                this.activatePowerUp('magnet');
                break;
            case '5':
                this.activatePowerUp('x10');
                break;
            case '6':
                this.activatePowerUp('shrink');
                break;
            case '7':
                this.activatePowerUp('ghost');
                break;
        }
        
        // Add new direction to input queue if changed
        if (directionChanged) {
            this.inputQueue.push({ dx: newDx, dy: newDy });
            
            // Immediate update for instant response (only if snake has started moving)
            if (this.dx !== 0 || this.dy !== 0) {
                this.dx = newDx;
                this.dy = newDy;
                this.update();
                this.draw();
            } else {
                // Just update direction for first move
                this.dx = newDx;
                this.dy = newDy;
            }
        }
    }
    
    togglePause() {
        if (!this.isRunning) return;
        
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.showModal('pause-modal');
        } else {
            this.hideModal('pause-modal');
            // Restart game loop when resuming
            this.startGameLoop();
        }
    }
    
    restartGame() {
        this.isRunning = false;
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
        }
        
        setTimeout(() => {
            this.initializeGame();
        }, 100);
    }
    
    gameOver() {
        this.isRunning = false;
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
        }
        
        // Update final stats
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-level').textContent = this.level;
        document.getElementById('final-length').textContent = this.snake.length;
        document.getElementById('final-time').textContent = this.formatTime(this.gameTime);
        
        // Save stats to localStorage
        this.saveStats();
        
        // Show game over modal
        this.showModal('game-over-modal');
        
        // Play game over sound
        this.playSound('gameover');
    }
    
    saveStats() {
        try {
            const stats = JSON.parse(localStorage.getItem('snake-stats') || '{}');
            
            // Update high score
            if (this.score > (stats.highScore || 0)) {
                stats.highScore = this.score;
            }
            
            // Update games played
            stats.gamesPlayed = (stats.gamesPlayed || 0) + 1;
            
            // Update total time
            stats.totalTime = (stats.totalTime || 0) + this.gameTime;
            
            // Update foods eaten (count all foods eaten during this game)
            const foodsEaten = this.score / 10; // Rough estimate based on average food points
            stats.foodsEaten = (stats.foodsEaten || 0) + Math.floor(foodsEaten);
            
            localStorage.setItem('snake-stats', JSON.stringify(stats));
            console.log('Stats saved:', stats);
        } catch (error) {
            console.error('Error saving stats:', error);
        }
    }
    
    quitGame() {
        this.isRunning = false;
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
        }
        window.location.href = '../../index.html';
    }
    
    updateUI() {
        document.getElementById('snake-score').textContent = this.score;
        document.getElementById('snake-level').textContent = this.level;
        document.getElementById('snake-time').textContent = this.formatTime(this.gameTime);
        document.getElementById('snake-length').textContent = this.snake.length;
        
        // Update power-up counts
        document.getElementById('speed-count').textContent = this.powerUps.speed.count;
        document.getElementById('shield-count').textContent = this.powerUps.shield.count;
        document.getElementById('double-count').textContent = this.powerUps.double.count;
        document.getElementById('magnet-count').textContent = this.powerUps.magnet.count;
        
        // Update new power-up counts if elements exist
        const x10Count = document.getElementById('x10-count');
        const shrinkCount = document.getElementById('shrink-count');
        const ghostCount = document.getElementById('ghost-count');
        
        if (x10Count) x10Count.textContent = this.powerUps.x10.count;
        if (shrinkCount) shrinkCount.textContent = this.powerUps.shrink.count;
        if (ghostCount) ghostCount.textContent = this.powerUps.ghost.count;
    }
    
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
        }
    }
    
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
        }
    }
    
    playSound(type) {
        // Check if sound is enabled in settings
        if (this.settings.sound === 'off') {
            return;
        }
        
        // Initialize audio context if not exists
        if (!this.audioContext) {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            } catch (error) {
                console.log('Audio not supported');
                return;
            }
        }
        
        // Simple sound effects using Web Audio API
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            switch (type) {
                case 'eat':
                    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.1);
                    break;
                case 'powerup':
                    oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.2);
                    break;
                case 'gameover':
                    oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.5);
                    break;
            }
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.1);
        } catch (error) {
            console.log('Audio error:', error);
        }
    }
    
    // Add power-ups randomly
    addRandomPowerUp() {
        const types = ['speed', 'shield', 'double', 'magnet'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        this.powerUps[randomType].count++;
        this.updateUI();
    }
    
    // Add power-ups based on game mode
    addPowerUpByMode() {
        const types = ['speed', 'shield', 'double', 'magnet', 'x10', 'shrink', 'ghost'];
        let selectedType;
        
        switch (this.gameMode) {
            case 'relax':
                // Relax mode: more frequent power-ups, prefer speed and shield
                if (Math.random() < 0.5) { // Reduced from 0.6 for better balance
                    selectedType = Math.random() < 0.5 ? 'speed' : 'shield';
                } else {
                    selectedType = types[Math.floor(Math.random() * types.length)];
                }
                break;
            case 'challenge':
                // Challenge mode: rare but powerful power-ups
                if (Math.random() < 0.4) { // Increased from 0.3 for better balance
                    selectedType = Math.random() < 0.7 ? 'shield' : 'x10';
                } else {
                    selectedType = types[Math.floor(Math.random() * types.length)];
                }
                break;
            default:
                // Classic mode: balanced
                selectedType = types[Math.floor(Math.random() * types.length)];
        }
        
        this.powerUps[selectedType].count++;
        this.updateUI();
    }
}

// Initialize Snake Hunter when page loads
window.addEventListener('load', () => {
    console.log('Page loaded, initializing Snake Hunter...');
    window.snakeGame = new SnakeHunter();
    
    // Add power-ups periodically based on game mode
    setInterval(() => {
        if (window.snakeGame && window.snakeGame.isRunning && !window.snakeGame.isPaused) {
            let chance = 0.08; // Reduced default chance for better balance
            
            // Adjust chance based on game mode
            switch (window.snakeGame.gameMode) {
                case 'relax':
                    chance = 0.15; // Reduced from 0.2 for better balance
                    break;
                case 'challenge':
                    chance = 0.06; // Slightly increased from 0.05
                    break;
            }
            
            if (Math.random() < chance) {
                window.snakeGame.addPowerUpByMode();
            }
        }
    }, 10000); // Every 10 seconds
});

