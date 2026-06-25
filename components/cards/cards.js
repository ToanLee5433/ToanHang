// Cards Online - Advanced Multiplayer Card Games Platform
class CardsOnline {
    constructor() {
        this.currentGame = null;
        this.gameState = 'selection'; // selection, setup, waiting, playing
        this.isOnline = false;
        this.roomCode = null;
        this.playerName = 'Player1';
        this.playerId = null;
        this.isHost = false;
        this.players = {};
        this.maxPlayers = 4;
        this.isReady = false;
        
        // Firebase
        this.db = null;
        this.roomRef = null;
        this.chatRef = null;
        
        // Game data
        this.deck = [];
        this.playerHands = {};
        this.currentPlayer = null;
        this.gameData = {};
        
        // Chat
        this.isChatOpen = false;
        
        this.init();
    }
    
    init() {
        console.log('Initializing Cards Online...');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    setup() {
        this.initializeFirebase();
        this.setupEventListeners();
        this.setupUsernameAutofill();
        this.showGameSelection();
        console.log('Cards Online ready!');
    }
    
    initializeFirebase() {
        try {
            if (typeof firebase !== 'undefined' && window.firebaseConfig) {
                if (!firebase.apps.length) {
                    firebase.initializeApp(window.firebaseConfig);
                }
                this.db = firebase.database();
                console.log('Firebase initialized successfully');
            } else {
                console.warn('Firebase not available, running in offline mode');
            }
        } catch (error) {
            console.error('Firebase initialization failed:', error);
        }
    }
    
    setupEventListeners() {
        // Game selection
        document.querySelectorAll('.game-mode-card').forEach(card => {
            card.addEventListener('click', (e) => {
                this.selectGame(e.currentTarget.dataset.game);
            });
        });
        
        // Room setup
        document.getElementById('create-room-btn').addEventListener('click', () => this.createRoom());
        document.getElementById('join-room-btn').addEventListener('click', () => this.joinRoom());
        document.getElementById('back-to-selection-btn').addEventListener('click', () => this.showGameSelection());
        
        // Players section
        document.getElementById('ready-btn').addEventListener('click', () => this.toggleReady());
        document.getElementById('start-game-btn').addEventListener('click', () => this.startGame());
        document.getElementById('leave-room-btn').addEventListener('click', () => this.leaveRoom());
        
        // Game controls
        document.getElementById('play-card-btn').addEventListener('click', () => this.playSelectedCards());
        document.getElementById('pass-turn-btn').addEventListener('click', () => this.passTurn());
        document.getElementById('show-rules-btn').addEventListener('click', () => this.showRules());
        document.getElementById('pause-game-btn').addEventListener('click', () => this.pauseGame());
        
        // Chat
        document.getElementById('chat-toggle').addEventListener('click', () => this.toggleChat());
        document.getElementById('chat-float-toggle').addEventListener('click', () => this.toggleChat());
        document.getElementById('chat-send').addEventListener('click', () => this.sendMessage());
        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }
    
    setupUsernameAutofill() {
        if (window.firebaseAuth) {
            window.firebaseAuth.onAuthStateChanged((user) => {
                if (user) {
                    const nameInput = document.getElementById('player-name');
                    if (nameInput) {
                        nameInput.value = user.displayName || '';
                        this.playerName = user.displayName || 'Player1';
                    }
                }
            });
        }
    }
    
    selectGame(gameType) {
        // Remove previous selection
        document.querySelectorAll('.game-mode-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Select new game
        document.querySelector(`[data-game="${gameType}"]`).classList.add('selected');
        this.currentGame = gameType;
        
        // Update max players based on game
        const maxPlayersSelect = document.getElementById('max-players');
        switch (gameType) {
            case 'tienlen':
                maxPlayersSelect.innerHTML = `
                    <option value="2">2 người</option>
                    <option value="3">3 người</option>
                    <option value="4" selected>4 người</option>
                `;
                break;
            case 'loc':
                maxPlayersSelect.innerHTML = `
                    <option value="2">2 người</option>
                    <option value="3">3 người</option>
                    <option value="4">4 người</option>
                    <option value="6" selected>6 người</option>
                `;
                break;
            case 'poker':
                maxPlayersSelect.innerHTML = `
                    <option value="2">2 người</option>
                    <option value="4">4 người</option>
                    <option value="6">6 người</option>
                    <option value="8" selected>8 người</option>
                `;
                break;
            case 'solitaire':
                maxPlayersSelect.innerHTML = `<option value="1" selected>1 người</option>`;
                break;
            default:
                maxPlayersSelect.innerHTML = `
                    <option value="2">2 người</option>
                    <option value="3">3 người</option>
                    <option value="4" selected>4 người</option>
                `;
        }
        
        // Show room setup
        setTimeout(() => {
            this.showRoomSetup();
        }, 300);
    }
    
    showGameSelection() {
        this.gameState = 'selection';
        document.getElementById('game-selection').style.display = 'block';
        document.getElementById('room-setup').classList.remove('active');
        document.getElementById('game-status').classList.remove('active');
        document.getElementById('players-section').classList.remove('active');
        document.getElementById('game-area').classList.remove('active');
    }
    
    showRoomSetup() {
        this.gameState = 'setup';
        document.getElementById('game-selection').style.display = 'none';
        document.getElementById('room-setup').classList.add('active');
    }
    
    async createRoom() {
        const playerName = document.getElementById('player-name').value.trim();
        const maxPlayers = parseInt(document.getElementById('max-players').value);
        const roomPassword = document.getElementById('room-password').value.trim();
        
        if (!playerName) {
            alert('Vui lòng nhập tên của bạn!');
            return;
        }
        
        this.playerName = playerName;
        this.playerId = this.generatePlayerId();
        this.roomCode = this.generateRoomCode();
        this.isHost = true;
        this.maxPlayers = maxPlayers;
        
        if (this.db) {
            try {
                this.roomRef = this.db.ref(`card_rooms/${this.roomCode}`);
                this.chatRef = this.db.ref(`card_chats/${this.roomCode}`);
                
                // Create room
                await this.roomRef.set({
                    gameType: this.currentGame,
                    host: this.playerId,
                    maxPlayers: maxPlayers,
                    password: roomPassword || null,
                    players: {
                        [this.playerId]: {
                            name: this.playerName,
                            ready: false,
                            isHost: true,
                            joinedAt: firebase.database.ServerValue.TIMESTAMP
                        }
                    },
                    gameState: 'waiting',
                    createdAt: firebase.database.ServerValue.TIMESTAMP
                });
                
                this.setupRoomListeners();
                this.showWaitingRoom();
            } catch (error) {
                console.error('Error creating room:', error);
                alert('Không thể tạo phòng. Thử lại sau!');
            }
        } else {
            // Offline mode
            this.simulateOfflineRoom();
        }
    }
    
    async joinRoom() {
        const roomCode = document.getElementById('room-code').value.trim();
        const playerName = document.getElementById('player-name').value.trim();
        const roomPassword = document.getElementById('room-password').value.trim();
        
        if (!roomCode) {
            alert('Vui lòng nhập mã phòng!');
            return;
        }
        
        if (!playerName) {
            alert('Vui lòng nhập tên của bạn!');
            return;
        }
        
        this.playerName = playerName;
        this.playerId = this.generatePlayerId();
        this.roomCode = roomCode.toUpperCase();
        this.isHost = false;
        
        if (this.db) {
            try {
                this.roomRef = this.db.ref(`card_rooms/${this.roomCode}`);
                this.chatRef = this.db.ref(`card_chats/${this.roomCode}`);
                
                // Check room exists
                const snapshot = await this.roomRef.once('value');
                if (!snapshot.exists()) {
                    throw new Error('Phòng không tồn tại');
                }
                
                const roomData = snapshot.val();
                
                // Check password
                if (roomData.password && roomData.password !== roomPassword) {
                    throw new Error('Mật khẩu phòng không đúng');
                }
                
                // Check room full
                const playerCount = Object.keys(roomData.players || {}).length;
                if (playerCount >= roomData.maxPlayers) {
                    throw new Error('Phòng đã đầy');
                }
                
                // Join room
                await this.roomRef.child('players').child(this.playerId).set({
                    name: this.playerName,
                    ready: false,
                    isHost: false,
                    joinedAt: firebase.database.ServerValue.TIMESTAMP
                });
                
                this.currentGame = roomData.gameType;
                this.maxPlayers = roomData.maxPlayers;
                
                this.setupRoomListeners();
                this.showWaitingRoom();
            } catch (error) {
                console.error('Error joining room:', error);
                alert(error.message || 'Không thể tham gia phòng. Thử lại sau!');
            }
        } else {
            // Offline mode
            this.simulateOfflineRoom();
        }
    }
    
    setupRoomListeners() {
        if (!this.roomRef) return;
        
        this.roomRef.on('value', (snapshot) => {
            const data = snapshot.val();
            if (!data) return;
            
            this.players = data.players || {};
            this.gameData = data.gameData || {};
            
            this.updatePlayersDisplay();
            this.updateGameState(data.gameState);
            
            // Check if game should start
            if (data.gameState === 'playing' && this.gameState !== 'playing') {
                this.showGameArea();
            }
        });
        
        // Chat listener
        if (this.chatRef) {
            this.chatRef.on('child_added', (snapshot) => {
                const message = snapshot.val();
                this.displayChatMessage(message);
            });
        }
    }
    
    simulateOfflineRoom() {
        this.roomCode = this.generateRoomCode();
        this.players = {
            [this.playerId]: {
                name: this.playerName,
                ready: false,
                isHost: true
            }
        };
        
        // Add AI players
        for (let i = 1; i < this.maxPlayers; i++) {
            const aiId = `ai_${i}`;
            this.players[aiId] = {
                name: `Bot ${i}`,
                ready: true,
                isHost: false,
                isAI: true
            };
        }
        
        this.showWaitingRoom();
        this.addChatMessage('system', 'Đang chơi offline với bot');
    }
    
    showWaitingRoom() {
        this.gameState = 'waiting';
        this.isOnline = true;
        
        document.getElementById('room-setup').classList.remove('active');
        document.getElementById('game-status').classList.add('active');
        document.getElementById('players-section').classList.add('active');
        
        // Update status
        document.getElementById('status-message').textContent = 'Đang chờ người chơi khác...';
        document.getElementById('current-room').textContent = this.roomCode;
        document.getElementById('current-game').textContent = this.getGameName(this.currentGame);
        
        this.updatePlayersDisplay();
        this.updateStartButton();
        
        // Show chat
        document.getElementById('chat-section').classList.add('active');
        this.addChatMessage('system', `Chào mừng đến với phòng ${this.roomCode}!`);
    }
    
    updatePlayersDisplay() {
        const playersGrid = document.getElementById('players-grid');
        playersGrid.innerHTML = '';
        
        Object.entries(this.players).forEach(([playerId, player]) => {
            const playerCard = document.createElement('div');
            playerCard.className = 'player-card';
            
            if (player.isHost) {
                playerCard.classList.add('host');
            }
            if (player.ready) {
                playerCard.classList.add('ready');
            }
            
            const avatar = player.name.charAt(0).toUpperCase();
            const statusText = player.isHost ? 'Chủ phòng' : player.ready ? 'Sẵn sàng' : 'Chờ';
            const statusClass = player.isHost ? 'host' : player.ready ? 'ready' : 'waiting';
            
            playerCard.innerHTML = `
                <div class="player-avatar">${avatar}</div>
                <div class="player-name">${player.name}</div>
                <div class="player-status ${statusClass}">${statusText}</div>
            `;
            
            playersGrid.appendChild(playerCard);
        });
        
        this.updateStartButton();
    }
    
    updateStartButton() {
        const startBtn = document.getElementById('start-game-btn');
        const readyBtn = document.getElementById('ready-btn');
        
        if (this.isHost) {
            const allReady = Object.values(this.players).every(p => p.ready || p.isHost);
            const minPlayers = this.currentGame === 'solitaire' ? 1 : 2;
            const enoughPlayers = Object.keys(this.players).length >= minPlayers;
            
            if (allReady && enoughPlayers) {
                startBtn.style.display = 'inline-block';
                startBtn.disabled = false;
            } else {
                startBtn.style.display = 'none';
            }
        } else {
            startBtn.style.display = 'none';
        }
        
        // Update ready button
        readyBtn.textContent = this.isReady ? 'Hủy sẵn sàng' : 'Sẵn sàng';
        readyBtn.style.background = this.isReady ? '#dc3545' : '#28a745';
    }
    
    async toggleReady() {
        this.isReady = !this.isReady;
        
        if (this.roomRef) {
            await this.roomRef.child('players').child(this.playerId).child('ready').set(this.isReady);
        } else {
            this.players[this.playerId].ready = this.isReady;
            this.updatePlayersDisplay();
        }
        
        this.addChatMessage('system', `${this.playerName} ${this.isReady ? 'đã sẵn sàng' : 'chưa sẵn sàng'}`);
    }
    
    async startGame() {
        if (!this.isHost) return;
        
        if (this.roomRef) {
            await this.roomRef.update({
                gameState: 'playing',
                gameData: this.initializeGameData()
            });
        } else {
            this.showGameArea();
        }
        
        this.addChatMessage('system', '🎮 Game bắt đầu!');
    }
    
    initializeGameData() {
        // Initialize game-specific data
        const gameData = {
            deck: this.createDeck(),
            currentPlayer: Object.keys(this.players)[0],
            turn: 1,
            gameState: 'playing'
        };
        
        // Deal cards based on game type
        switch (this.currentGame) {
            case 'tienlen':
                gameData.playerHands = this.dealTienLen();
                break;
            case 'loc':
                gameData.playerHands = this.dealLoc();
                break;
            case 'bala':
                gameData.playerHands = this.dealBaLa();
                break;
            case 'poker':
                gameData.playerHands = this.dealPoker();
                break;
            case 'blackjack':
                gameData.playerHands = this.dealBlackjack();
                break;
            case 'solitaire':
                gameData.solitaireLayout = this.setupSolitaire();
                break;
        }
        
        return gameData;
    }
    
    showGameArea() {
        this.gameState = 'playing';
        
        document.getElementById('game-status').classList.remove('active');
        document.getElementById('players-section').classList.remove('active');
        document.getElementById('game-area').classList.add('active');
        
        // Update game title
        document.getElementById('game-title').textContent = this.getGameName(this.currentGame);
        
        // Load game-specific UI
        this.loadGameInterface();
    }
    
    loadGameInterface() {
        const cardsContainer = document.getElementById('cards-container');
        const gameInfo = document.getElementById('game-info');
        
        switch (this.currentGame) {
            case 'tienlen':
                this.loadTienLenInterface();
                break;
            case 'loc':
                this.loadLocInterface();
                break;
            case 'bala':
                this.loadBaLaInterface();
                break;
            case 'poker':
                this.loadPokerInterface();
                break;
            case 'blackjack':
                this.loadBlackjackInterface();
                break;
            case 'solitaire':
                this.loadSolitaireInterface();
                break;
            default:
                cardsContainer.innerHTML = '<p>Game đang được phát triển...</p>';
                gameInfo.textContent = 'Vui lòng chờ cập nhật!';
        }
    }
    
    loadTienLenInterface() {
        const cardsContainer = document.getElementById('cards-container');
        const gameInfo = document.getElementById('game-info');
        
        // Sample hand for demonstration
        const sampleHand = [
            {rank: '3', suit: '♠', color: 'black'},
            {rank: '4', suit: '♥', color: 'red'},
            {rank: '5', suit: '♦', color: 'red'},
            {rank: '6', suit: '♣', color: 'black'},
            {rank: '7', suit: '♠', color: 'black'},
            {rank: '8', suit: '♥', color: 'red'},
            {rank: '9', suit: '♦', color: 'red'},
            {rank: '10', suit: '♣', color: 'black'},
            {rank: 'J', suit: '♠', color: 'black'},
            {rank: 'Q', suit: '♥', color: 'red'},
            {rank: 'K', suit: '♦', color: 'red'},
            {rank: 'A', suit: '♣', color: 'black'},
            {rank: '2', suit: '♠', color: 'black'}
        ];
        
        cardsContainer.innerHTML = '';
        sampleHand.forEach((card, index) => {
            const cardElement = this.createCardElement(card, index);
            cardsContainer.appendChild(cardElement);
        });
        
        gameInfo.innerHTML = `
            <div>Lượt của: <strong style="color: #FFD700;">Player 1</strong></div>
            <div>Bài trên bàn: <strong>Không có</strong></div>
            <div>Số bài còn lại: <strong>${sampleHand.length} lá</strong></div>
        `;
        
        // Enable game controls
        document.getElementById('play-card-btn').disabled = false;
        document.getElementById('pass-turn-btn').disabled = false;
    }
    
    loadLocInterface() {
        const cardsContainer = document.getElementById('cards-container');
        const gameInfo = document.getElementById('game-info');
        
        // Sample smaller hand for Lốc
        const sampleHand = [
            {rank: '7', suit: '♠', color: 'black'},
            {rank: '8', suit: '♥', color: 'red'},
            {rank: '9', suit: '♦', color: 'red'},
            {rank: '10', suit: '♣', color: 'black'},
            {rank: 'J', suit: '♠', color: 'black'}
        ];
        
        cardsContainer.innerHTML = '';
        sampleHand.forEach((card, index) => {
            const cardElement = this.createCardElement(card, index);
            cardsContainer.appendChild(cardElement);
        });
        
        gameInfo.innerHTML = `
            <div>Game: <strong style="color: #FFD700;">Lốc</strong></div>
            <div>Tốc độ: <strong>Nhanh</strong></div>
            <div>Bài còn lại: <strong>${sampleHand.length} lá</strong></div>
        `;
        
        document.getElementById('play-card-btn').disabled = false;
        document.getElementById('pass-turn-btn').disabled = false;
    }
    
    loadBaLaInterface() {
        const cardsContainer = document.getElementById('cards-container');
        const gameInfo = document.getElementById('game-info');
        
        // 3 cards for Ba Lá
        const sampleHand = [
            {rank: 'K', suit: '♠', color: 'black'},
            {rank: 'Q', suit: '♥', color: 'red'},
            {rank: 'J', suit: '♦', color: 'red'}
        ];
        
        cardsContainer.innerHTML = '';
        sampleHand.forEach((card, index) => {
            const cardElement = this.createCardElement(card, index);
            cardsContainer.appendChild(cardElement);
        });
        
        gameInfo.innerHTML = `
            <div>Game: <strong style="color: #FFD700;">Ba Lá</strong></div>
            <div>Tổ hợp: <strong>JQK (Thông)</strong></div>
            <div>Điểm: <strong>30</strong></div>
        `;
        
        document.getElementById('play-card-btn').disabled = false;
    }
    
    loadPokerInterface() {
        const cardsContainer = document.getElementById('cards-container');
        const gameInfo = document.getElementById('game-info');
        
        // 2 hole cards for Texas Hold'em
        const holeCards = [
            {rank: 'A', suit: '♠', color: 'black'},
            {rank: 'K', suit: '♥', color: 'red'}
        ];
        
        // Community cards
        const communityCards = [
            {rank: 'A', suit: '♦', color: 'red'},
            {rank: 'K', suit: '♣', color: 'black'},
            {rank: 'Q', suit: '♠', color: 'black'},
            {rank: 'back', suit: '', color: ''},
            {rank: 'back', suit: '', color: ''}
        ];
        
        cardsContainer.innerHTML = '<div style="margin-bottom: 20px;"><strong>Bài của bạn:</strong></div>';
        holeCards.forEach((card, index) => {
            const cardElement = this.createCardElement(card, index);
            cardsContainer.appendChild(cardElement);
        });
        
        cardsContainer.innerHTML += '<div style="margin: 20px 0;"><strong>Bài chung:</strong></div>';
        communityCards.forEach((card, index) => {
            const cardElement = this.createCardElement(card, index + 100);
            cardsContainer.appendChild(cardElement);
        });
        
        gameInfo.innerHTML = `
            <div>Game: <strong style="color: #FFD700;">Texas Hold'em</strong></div>
            <div>Pot: <strong>$200</strong></div>
            <div>Your Hand: <strong>Pair of Aces</strong></div>
        `;
        
        document.getElementById('play-card-btn').textContent = 'Call';
        document.getElementById('pass-turn-btn').textContent = 'Fold';
        document.getElementById('play-card-btn').disabled = false;
        document.getElementById('pass-turn-btn').disabled = false;
    }
    
    loadBlackjackInterface() {
        const cardsContainer = document.getElementById('cards-container');
        const gameInfo = document.getElementById('game-info');
        
        // Player cards
        const playerCards = [
            {rank: '10', suit: '♠', color: 'black'},
            {rank: 'A', suit: '♥', color: 'red'}
        ];
        
        // Dealer cards
        const dealerCards = [
            {rank: '7', suit: '♦', color: 'red'},
            {rank: 'back', suit: '', color: ''}
        ];
        
        cardsContainer.innerHTML = '<div style="margin-bottom: 15px;"><strong>Bài của bạn (21):</strong></div>';
        playerCards.forEach((card, index) => {
            const cardElement = this.createCardElement(card, index);
            cardsContainer.appendChild(cardElement);
        });
        
        cardsContainer.innerHTML += '<div style="margin: 20px 0 15px;"><strong>Bài của dealer:</strong></div>';
        dealerCards.forEach((card, index) => {
            const cardElement = this.createCardElement(card, index + 100);
            cardsContainer.appendChild(cardElement);
        });
        
        gameInfo.innerHTML = `
            <div>Game: <strong style="color: #FFD700;">Blackjack</strong></div>
            <div>Điểm của bạn: <strong>21 (BLACKJACK!)</strong></div>
            <div>Dealer: <strong>7 + ?</strong></div>
        `;
        
        document.getElementById('play-card-btn').textContent = 'Stand';
        document.getElementById('pass-turn-btn').textContent = 'Hit';
        document.getElementById('play-card-btn').disabled = false;
        document.getElementById('pass-turn-btn').disabled = false;
    }
    
    loadSolitaireInterface() {
        const cardsContainer = document.getElementById('cards-container');
        const gameInfo = document.getElementById('game-info');
        
        // Sample tableau for Klondike Solitaire
        cardsContainer.innerHTML = `
            <div style="text-align: center;">
                <div style="margin-bottom: 20px;"><strong>Klondike Solitaire</strong></div>
                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; max-width: 500px; margin: 0 auto;">
                    ${Array.from({length: 7}, (_, i) => `
                        <div style="display: flex; flex-direction: column; gap: 2px;">
                            ${Array.from({length: i + 1}, (_, j) => `
                                <div class="playing-card ${j === i ? '' : 'card-back'}" style="margin: 0;">
                                    ${j === i ? `<div class="card-rank">K</div><div class="card-suit card-red">♥</div>` : 'BACK'}
                                </div>
                            `).join('')}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        gameInfo.innerHTML = `
            <div>Game: <strong style="color: #FFD700;">Solitaire</strong></div>
            <div>Nước đi: <strong>0</strong></div>
            <div>Thời gian: <strong>00:00</strong></div>
        `;
        
        document.getElementById('play-card-btn').textContent = 'Di chuyển';
        document.getElementById('pass-turn-btn').textContent = 'Gợi ý';
        document.getElementById('play-card-btn').disabled = false;
        document.getElementById('pass-turn-btn').disabled = false;
    }
    
    createCardElement(card, index) {
        const cardElement = document.createElement('div');
        cardElement.className = 'playing-card';
        cardElement.dataset.index = index;
        
        if (card.rank === 'back') {
            cardElement.classList.add('card-back');
            cardElement.innerHTML = 'BACK';
        } else {
            cardElement.classList.add(`card-${card.color}`);
            cardElement.innerHTML = `
                <div class="card-rank">${card.rank}</div>
                <div class="card-suit">${card.suit}</div>
            `;
        }
        
        cardElement.addEventListener('click', () => {
            cardElement.classList.toggle('selected');
        });
        
        return cardElement;
    }
    
    // Game utility functions
    createDeck() {
        const suits = ['♠', '♥', '♦', '♣'];
        const ranks = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];
        const deck = [];
        
        suits.forEach(suit => {
            ranks.forEach(rank => {
                deck.push({
                    rank,
                    suit,
                    color: (suit === '♥' || suit === '♦') ? 'red' : 'black'
                });
            });
        });
        
        return this.shuffleDeck(deck);
    }
    
    shuffleDeck(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }
    
    dealTienLen() {
        // Deal 13 cards to each player
        const hands = {};
        const deck = this.createDeck();
        let cardIndex = 0;
        
        Object.keys(this.players).forEach(playerId => {
            hands[playerId] = deck.slice(cardIndex, cardIndex + 13);
            cardIndex += 13;
        });
        
        return hands;
    }
    
    dealLoc() {
        // Deal 5 cards to each player for Lốc
        const hands = {};
        const deck = this.createDeck();
        let cardIndex = 0;
        
        Object.keys(this.players).forEach(playerId => {
            hands[playerId] = deck.slice(cardIndex, cardIndex + 5);
            cardIndex += 5;
        });
        
        return hands;
    }
    
    dealBaLa() {
        // Deal 3 cards to each player
        const hands = {};
        const deck = this.createDeck();
        let cardIndex = 0;
        
        Object.keys(this.players).forEach(playerId => {
            hands[playerId] = deck.slice(cardIndex, cardIndex + 3);
            cardIndex += 3;
        });
        
        return hands;
    }
    
    dealPoker() {
        // Deal 2 hole cards to each player
        const hands = {};
        const deck = this.createDeck();
        let cardIndex = 0;
        
        Object.keys(this.players).forEach(playerId => {
            hands[playerId] = deck.slice(cardIndex, cardIndex + 2);
            cardIndex += 2;
        });
        
        return hands;
    }
    
    dealBlackjack() {
        // Deal 2 cards to each player and dealer
        const hands = {};
        const deck = this.createDeck();
        let cardIndex = 0;
        
        Object.keys(this.players).forEach(playerId => {
            hands[playerId] = deck.slice(cardIndex, cardIndex + 2);
            cardIndex += 2;
        });
        
        hands.dealer = deck.slice(cardIndex, cardIndex + 2);
        
        return hands;
    }
    
    setupSolitaire() {
        // Setup Klondike Solitaire layout
        const deck = this.createDeck();
        const layout = {
            tableau: Array.from({length: 7}, () => []),
            foundation: Array.from({length: 4}, () => []),
            stock: [],
            waste: []
        };
        
        let cardIndex = 0;
        
        // Deal tableau
        for (let col = 0; col < 7; col++) {
            for (let row = col; row < 7; row++) {
                layout.tableau[row].push({
                    ...deck[cardIndex],
                    faceUp: row === col
                });
                cardIndex++;
            }
        }
        
        // Remaining cards go to stock
        layout.stock = deck.slice(cardIndex);
        
        return layout;
    }
    
    // Game actions
    playSelectedCards() {
        const selectedCards = document.querySelectorAll('.playing-card.selected');
        if (selectedCards.length === 0) {
            alert('Vui lòng chọn bài để đánh!');
            return;
        }
        
        // Game-specific logic would go here
        console.log(`Playing ${selectedCards.length} card(s)`);
        
        // Remove selected cards
        selectedCards.forEach(card => {
            card.style.opacity = '0.5';
            card.classList.remove('selected');
        });
        
        this.addChatMessage('game', `${this.playerName} đã đánh ${selectedCards.length} lá bài`);
    }
    
    passTurn() {
        console.log('Passing turn');
        this.addChatMessage('game', `${this.playerName} đã bỏ lượt`);
    }
    
    showRules() {
        const gameName = this.getGameName(this.currentGame);
        alert(`Luật chơi ${gameName} sẽ được hiển thị ở đây!`);
    }
    
    pauseGame() {
        alert('Game đã tạm dừng!');
    }
    
    async leaveRoom() {
        if (confirm('Bạn có chắc muốn rời phòng?')) {
            if (this.roomRef) {
                await this.roomRef.child('players').child(this.playerId).remove();
                this.roomRef.off();
            }
            if (this.chatRef) {
                this.chatRef.off();
            }
            
            this.resetGameState();
            this.showGameSelection();
        }
    }
    
    resetGameState() {
        this.currentGame = null;
        this.gameState = 'selection';
        this.isOnline = false;
        this.roomCode = null;
        this.isHost = false;
        this.players = {};
        this.isReady = false;
        
        // Hide all sections
        document.getElementById('game-status').classList.remove('active');
        document.getElementById('players-section').classList.remove('active');
        document.getElementById('game-area').classList.remove('active');
        document.getElementById('chat-section').classList.remove('active');
    }
    
    updateGameState(newState) {
        console.log(`Game state changed to: ${newState}`);
    }
    
    // Chat functions
    toggleChat() {
        this.isChatOpen = !this.isChatOpen;
        const chatSection = document.getElementById('chat-section');
        
        if (this.isChatOpen) {
            chatSection.style.display = 'flex';
        } else {
            chatSection.style.display = 'none';
        }
    }
    
    sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        const messageData = {
            sender: this.playerName,
            senderId: this.playerId,
            content: message,
            timestamp: Date.now(),
            type: 'user'
        };
        
        if (this.chatRef) {
            this.chatRef.push(messageData);
        } else {
            this.displayChatMessage(messageData);
        }
        
        input.value = '';
    }
    
    addChatMessage(type, content) {
        const messageData = {
            sender: type === 'system' ? 'Hệ thống' : type === 'game' ? 'Game' : this.playerName,
            content: content,
            timestamp: Date.now(),
            type: type
        };
        
        if (this.chatRef) {
            this.chatRef.push(messageData);
        } else {
            this.displayChatMessage(messageData);
        }
    }
    
    displayChatMessage(messageData) {
        const chatMessages = document.getElementById('chat-messages');
        const messageElement = document.createElement('div');
        
        const time = new Date(messageData.timestamp).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const isOwn = messageData.senderId === this.playerId;
        const isSystem = messageData.type === 'system' || messageData.type === 'game';
        
        if (isSystem) {
            messageElement.innerHTML = `
                <div style="color: #6c757d; font-style: italic; text-align: center; margin: 5px 0; font-size: 0.85rem;">
                    ${messageData.content} <span style="font-size: 0.8rem;">(${time})</span>
                </div>
            `;
        } else {
            messageElement.innerHTML = `
                <div style="background: ${isOwn ? '#e3f2fd' : '#f3e5f5'}; padding: 8px; border-radius: 8px; margin: 5px 0;">
                    <div style="font-weight: 600; font-size: 0.85rem; color: #495057;">${messageData.sender}</div>
                    <div style="margin: 2px 0; font-size: 0.9rem;">${messageData.content}</div>
                    <div style="font-size: 0.75rem; color: #6c757d; text-align: right;">${time}</div>
                </div>
            `;
        }
        
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Utility functions
    getGameName(gameType) {
        const gameNames = {
            'tienlen': 'Tiến Lên Miền Nam',
            'loc': 'Lốc',
            'bala': 'Ba Lá',
            'poker': 'Poker Texas',
            'blackjack': 'Blackjack 21',
            'solitaire': 'Solitaire'
        };
        return gameNames[gameType] || gameType;
    }
    
    generateRoomCode() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    
    generatePlayerId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Creating Cards Online instance...');
    window.cardsOnline = new CardsOnline();
});
