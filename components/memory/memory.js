// Memory Game - Advanced Version with Single and Online Multiplayer
class MemoryGame {
    constructor() {
        this.isGameStarted = false;
        this.isPaused = false;
        this.currentMode = 'single'; // 'single' or 'online'
        this.currentLevel = 1;
        this.score = 0;
        this.moves = 0;
        this.startTime = null;
        this.gameTime = 0;
        this.timeInterval = null;
        
        // Game board state
        this.boardSize = 2; // 2x2, 4x4, 6x6
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.totalPairs = 0;
        
        // Online multiplayer
        this.isOnlineMode = false;
        this.roomCode = null;
        this.playerName = 'Player1';
        this.isHost = false;
        this.currentPlayer = 1;
        this.players = {
            player1: { name: 'Player 1', score: 0 },
            player2: { name: 'Player 2', score: 0 }
        };
        
        // Card symbols for different levels
        this.symbols = {
            2: ['🐶', '🐱'], // 2x2 = 4 cards, 2 pairs
            4: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'], // 4x4 = 16 cards, 8 pairs
            6: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦'] // 6x6 = 36 cards, 18 pairs
        };
        
        this.levelInfo = {
            1: { size: 2, title: 'Cấp độ 1 - Mẫu giáo 👶', description: 'Bảng 2x2 - Tìm 2 cặp thẻ giống nhau' },
            2: { size: 4, title: 'Cấp độ 2 - Tiểu học 🎒', description: 'Bảng 4x4 - Tìm 8 cặp thẻ giống nhau' },
            3: { size: 6, title: 'Cấp độ 3 - Trung học 🎓', description: 'Bảng 6x6 - Tìm 18 cặp thẻ giống nhau' }
        };
        
        this.init();
    }
    
    init() {
        console.log('Initializing Memory Game...');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    setup() {
        this.setupEventListeners();
        this.updateUI();
        this.generateBoard();
        console.log('Memory Game ready!');
    }
    
    setupEventListeners() {
        // Mode selection
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentMode = e.target.dataset.mode;
                this.toggleOnlineSection();
            });
        });
        
        // Control buttons
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('pause-btn').addEventListener('click', () => this.togglePause());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetGame());
        
        // Modal buttons
        document.getElementById('resume-btn').addEventListener('click', () => this.togglePause());
        document.getElementById('restart-btn').addEventListener('click', () => this.resetGame());
        document.getElementById('next-level-btn').addEventListener('click', () => this.nextLevel());
        document.getElementById('replay-level-btn').addEventListener('click', () => this.replayLevel());
        document.getElementById('play-again-btn').addEventListener('click', () => this.playAgain());
        document.getElementById('back-to-hub-btn').addEventListener('click', () => {
            window.location.href = '../../index.html';
        });
        
        // Online controls
        document.getElementById('join-room-btn').addEventListener('click', () => this.joinRoom());
    }
    
    toggleOnlineSection() {
        const onlineSection = document.getElementById('online-section');
        if (this.currentMode === 'online') {
            onlineSection.classList.add('active');
            this.isOnlineMode = true;
        } else {
            onlineSection.classList.remove('active');
            this.isOnlineMode = false;
        }
    }
    
    startGame() {
        if (this.isOnlineMode && !this.roomCode) {
            alert('Vui lòng tham gia phòng trước!');
            return;
        }
        
        this.isGameStarted = true;
        this.isPaused = false;
        this.score = 0;
        this.moves = 0;
        this.matchedPairs = 0;
        this.flippedCards = [];
        
        this.startTime = Date.now();
        this.startTimer();
        
        this.generateBoard();
        this.updateUI();
        
        console.log('Memory game started!');
    }
    
    startTimer() {
        this.timeInterval = setInterval(() => {
            if (!this.isPaused && this.isGameStarted) {
                this.gameTime = Math.floor((Date.now() - this.startTime) / 1000);
                this.updateTimeDisplay();
            }
        }, 1000);
    }
    
    updateTimeDisplay() {
        const minutes = Math.floor(this.gameTime / 60);
        const seconds = this.gameTime % 60;
        document.getElementById('time').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    generateBoard() {
        const board = document.getElementById('memory-board');
        const levelData = this.levelInfo[this.currentLevel];
        this.boardSize = levelData.size;
        
        // Update board CSS class
        board.className = `memory-board size-${this.boardSize}x${this.boardSize}`;
        
        // Calculate number of pairs needed
        const totalCards = this.boardSize * this.boardSize;
        this.totalPairs = totalCards / 2;
        
        // Get symbols for this level
        const availableSymbols = this.symbols[this.boardSize];
        const selectedSymbols = availableSymbols.slice(0, this.totalPairs);
        
        // Create pairs
        this.cards = [];
        selectedSymbols.forEach(symbol => {
            this.cards.push({ symbol, matched: false, flipped: false, id: this.cards.length });
            this.cards.push({ symbol, matched: false, flipped: false, id: this.cards.length });
        });
        
        // Shuffle cards
        this.shuffleArray(this.cards);
        
        // Generate HTML
        board.innerHTML = '';
        this.cards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'memory-card';
            cardElement.dataset.index = index;
            cardElement.innerHTML = `<div class="card-content">${card.symbol}</div>`;
            cardElement.addEventListener('click', () => this.flipCard(index));
            board.appendChild(cardElement);
        });
        
        // Update level info
        this.updateLevelInfo();
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    flipCard(index) {
        if (!this.isGameStarted || this.isPaused) return;
        if (this.cards[index].flipped || this.cards[index].matched) return;
        if (this.flippedCards.length >= 2) return;
        
        // In online mode, check if it's player's turn
        if (this.isOnlineMode && !this.isPlayerTurn()) {
            alert('Chưa đến lượt của bạn!');
            return;
        }
        
        // Flip card
        this.cards[index].flipped = true;
        this.flippedCards.push(index);
        
        const cardElement = document.querySelector(`[data-index="${index}"]`);
        cardElement.classList.add('flipped');
        
        // Check if two cards are flipped
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateUI();
            
            setTimeout(() => {
                this.checkMatch();
            }, 1000);
        }
    }
    
    checkMatch() {
        const [first, second] = this.flippedCards;
        const firstCard = this.cards[first];
        const secondCard = this.cards[second];
        
        if (firstCard.symbol === secondCard.symbol) {
            // Match found!
            firstCard.matched = true;
            secondCard.matched = true;
            this.matchedPairs++;
            
            const firstElement = document.querySelector(`[data-index="${first}"]`);
            const secondElement = document.querySelector(`[data-index="${second}"]`);
            firstElement.classList.add('matched');
            secondElement.classList.add('matched');
            
            // Add score
            const baseScore = this.boardSize === 2 ? 10 : this.boardSize === 4 ? 20 : 30;
            this.score += baseScore;
            
            if (this.isOnlineMode) {
                this.updatePlayerScore();
            }
            
            // Check if level complete
            if (this.matchedPairs === this.totalPairs) {
                setTimeout(() => {
                    this.levelComplete();
                }, 500);
            }
        } else {
            // No match
            firstCard.flipped = false;
            secondCard.flipped = false;
            
            const firstElement = document.querySelector(`[data-index="${first}"]`);
            const secondElement = document.querySelector(`[data-index="${second}"]`);
            
            firstElement.classList.add('wrong');
            secondElement.classList.add('wrong');
            
            setTimeout(() => {
                firstElement.classList.remove('flipped', 'wrong');
                secondElement.classList.remove('flipped', 'wrong');
            }, 500);
            
            if (this.isOnlineMode) {
                this.switchPlayer();
            }
        }
        
        this.flippedCards = [];
        this.updateUI();
    }
    
    levelComplete() {
        this.isGameStarted = false;
        clearInterval(this.timeInterval);
        
        // Calculate bonus score
        const timeBonus = Math.max(0, 300 - this.gameTime) * this.currentLevel;
        const moveBonus = Math.max(0, (this.totalPairs * 3 - this.moves)) * 5;
        this.score += timeBonus + moveBonus;
        
        // Show level complete modal
        document.getElementById('level-score').textContent = this.score;
        document.getElementById('level-time').textContent = document.getElementById('time').textContent;
        document.getElementById('level-moves').textContent = this.moves;
        
        if (this.currentLevel < 3) {
            document.getElementById('level-complete-modal').classList.remove('hidden');
        } else {
            this.gameComplete();
        }
    }
    
    gameComplete() {
        document.getElementById('total-score').textContent = this.score;
        document.getElementById('total-time').textContent = document.getElementById('time').textContent;
        document.getElementById('game-complete-modal').classList.remove('hidden');
    }
    
    nextLevel() {
        document.getElementById('level-complete-modal').classList.add('hidden');
        this.currentLevel++;
        this.resetGame();
        this.startGame();
    }
    
    replayLevel() {
        document.getElementById('level-complete-modal').classList.add('hidden');
        this.resetGame();
        this.startGame();
    }
    
    playAgain() {
        document.getElementById('game-complete-modal').classList.add('hidden');
        this.currentLevel = 1;
        this.resetGame();
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            document.getElementById('pause-modal').classList.remove('hidden');
        } else {
            document.getElementById('pause-modal').classList.add('hidden');
        }
    }
    
    resetGame() {
        this.isGameStarted = false;
        this.isPaused = false;
        this.score = 0;
        this.moves = 0;
        this.gameTime = 0;
        this.matchedPairs = 0;
        this.flippedCards = [];
        
        clearInterval(this.timeInterval);
        
        // Hide all modals
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
        
        this.generateBoard();
        this.updateUI();
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('moves').textContent = this.moves;
        document.getElementById('level').textContent = this.currentLevel;
    }
    
    updateLevelInfo() {
        const levelData = this.levelInfo[this.currentLevel];
        document.querySelector('.level-title').textContent = levelData.title;
        document.querySelector('.level-description').textContent = levelData.description;
    }
    
    // Online Multiplayer Functions
    joinRoom() {
        const roomCode = document.getElementById('room-code').value.trim();
        const playerName = document.getElementById('player-name').value.trim();
        
        if (!playerName) {
            alert('Vui lòng nhập tên của bạn!');
            return;
        }
        
        this.playerName = playerName;
        
        if (roomCode) {
            // Join existing room
            this.roomCode = roomCode;
            this.isHost = false;
        } else {
            // Create new room
            this.roomCode = this.generateRoomCode();
            this.isHost = true;
        }
        
        this.connectToRoom();
    }
    
    generateRoomCode() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    
    connectToRoom() {
        // Simulate room connection (replace with actual Firebase implementation)
        document.getElementById('room-status').textContent = 
            this.isHost ? `Phòng ${this.roomCode} đã tạo. Đang chờ người chơi...` : `Đang kết nối phòng ${this.roomCode}...`;
        document.getElementById('room-status').classList.remove('hidden');
        
        // Simulate finding another player after 2 seconds
        setTimeout(() => {
            this.onPlayerJoined();
        }, 2000);
    }
    
    onPlayerJoined() {
        document.getElementById('room-status').textContent = 'Đã kết nối thành công!';
        document.getElementById('room-status').classList.add('connected');
        document.getElementById('players-info').style.display = 'flex';
        
        // Update player names
        document.getElementById('player1-name').textContent = this.isHost ? this.playerName : 'Đối thủ';
        document.getElementById('player2-name').textContent = this.isHost ? 'Đối thủ' : this.playerName;
        
        this.updatePlayerTurn();
    }
    
    isPlayerTurn() {
        return (this.isHost && this.currentPlayer === 1) || (!this.isHost && this.currentPlayer === 2);
    }
    
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        this.updatePlayerTurn();
    }
    
    updatePlayerTurn() {
        document.getElementById('player1-card').classList.toggle('active', this.currentPlayer === 1);
        document.getElementById('player2-card').classList.toggle('active', this.currentPlayer === 2);
    }
    
    updatePlayerScore() {
        if (this.isHost) {
            if (this.currentPlayer === 1) {
                this.players.player1.score += 10;
                document.getElementById('player1-score').textContent = this.players.player1.score;
            } else {
                this.players.player2.score += 10;
                document.getElementById('player2-score').textContent = this.players.player2.score;
            }
        } else {
            if (this.currentPlayer === 2) {
                this.players.player2.score += 10;
                document.getElementById('player2-score').textContent = this.players.player2.score;
            } else {
                this.players.player1.score += 10;
                document.getElementById('player1-score').textContent = this.players.player1.score;
            }
        }
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Creating Memory game instance...');
    window.memoryGame = new MemoryGame();
});
