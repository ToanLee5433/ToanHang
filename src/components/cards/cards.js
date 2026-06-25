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
            if (typeof firebase !== 'undefined') {
                this.db = firebase.database();
                console.log('Firebase Realtime Database connected!');
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
        document.getElementById('play-bots-btn')?.addEventListener('click', () => this.playWithBots());
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
    
    playWithBots() {
        const playerName = document.getElementById('player-name').value.trim() || 'Hằng xinh gái';
        this.playerName = playerName;
        this.playerId = this.generatePlayerId();
        this.isOnline = false;
        this.isHost = true;
        this.maxPlayers = this.currentGame === 'solitaire' ? 1 : 4;
        
        this.simulateOfflineRoom();
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
            
            // Check if game should start or update
            if (data.gameState === 'playing') {
                if (this.gameState !== 'playing') {
                    this.showGameArea();
                } else {
                    this.loadGameInterface();
                }
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
        this.isOnline = this.roomRef ? true : false;
        
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
        const deck = this.createDeck();
        const gameData = {
            deck: deck,
            currentPlayer: Object.keys(this.players)[0],
            turn: 1,
            gameState: 'playing'
        };
        
        // Deal cards based on game type
        switch (this.currentGame) {
            case 'tienlen':
                gameData.playerHands = this.dealTienLen(deck);
                break;
            case 'loc':
                gameData.playerHands = this.dealLoc(deck);
                break;
            case 'bala':
                gameData.playerHands = this.dealBaLa(deck);
                break;
            case 'poker':
                gameData.pokerStep = 0;
                gameData.pot = 50;
                gameData.playerHands = this.dealPoker(deck);
                gameData.communityCards = deck.splice(0, 5);
                break;
            case 'blackjack':
                gameData.playerHands = this.dealBlackjack(deck);
                break;
            case 'solitaire':
                gameData.solitaireLayout = this.setupSolitaire(deck);
                gameData.moves = 0;
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
        
        let playerHand = [];
        if (this.gameData && this.gameData.playerHands && this.gameData.playerHands[this.playerId]) {
            playerHand = [...this.gameData.playerHands[this.playerId]];
        }
        
        if (playerHand.length === 0) {
            playerHand = this.createDeck().slice(0, 13);
        }
        
        this.sortHand(playerHand);
        
        cardsContainer.innerHTML = '';
        playerHand.forEach((card, index) => {
            const cardElement = this.createCardElement(card, index);
            cardsContainer.appendChild(cardElement);
        });
        
        gameInfo.innerHTML = `
            <div>Lượt của: <strong style="color: #FF3385;">Bạn (${this.playerName})</strong></div>
            <div>Bài trên bàn: <strong id="table-cards-display">Không có</strong></div>
            <div>Số bài còn lại: <strong>${playerHand.length} lá</strong></div>
        `;
        
        const playBtn = document.getElementById('play-card-btn');
        const passBtn = document.getElementById('pass-turn-btn');
        
        playBtn.textContent = 'Đánh bài';
        passBtn.textContent = 'Bỏ lượt';
        playBtn.style.display = 'inline-block';
        passBtn.style.display = 'inline-block';
        playBtn.disabled = false;
        passBtn.disabled = false;
    }
    
    loadLocInterface() {
        const cardsContainer = document.getElementById('cards-container');
        const gameInfo = document.getElementById('game-info');
        
        let playerHand = [];
        if (this.gameData && this.gameData.playerHands && this.gameData.playerHands[this.playerId]) {
            playerHand = [...this.gameData.playerHands[this.playerId]];
        }
        
        if (playerHand.length === 0) {
            playerHand = this.createDeck().slice(0, 10);
        }
        
        this.sortHand(playerHand);
        
        cardsContainer.innerHTML = '';
        playerHand.forEach((card, index) => {
            const cardElement = this.createCardElement(card, index);
            cardsContainer.appendChild(cardElement);
        });
        
        gameInfo.innerHTML = `
            <div>Lượt của: <strong style="color: #FF3385;">Bạn (${this.playerName})</strong></div>
            <div>Bài trên bàn: <strong id="table-cards-display">Không có</strong></div>
            <div>Số bài còn lại: <strong>${playerHand.length} lá</strong></div>
        `;
        
        const playBtn = document.getElementById('play-card-btn');
        const passBtn = document.getElementById('pass-turn-btn');
        
        playBtn.textContent = 'Đánh bài';
        passBtn.textContent = 'Bỏ lượt';
        playBtn.style.display = 'inline-block';
        passBtn.style.display = 'inline-block';
        playBtn.disabled = false;
        passBtn.disabled = false;
    }
    
    loadBaLaInterface() {
        const cardsContainer = document.getElementById('cards-container');
        const gameInfo = document.getElementById('game-info');
        
        let playerHand = [];
        if (this.gameData && this.gameData.playerHands && this.gameData.playerHands[this.playerId]) {
            playerHand = [...this.gameData.playerHands[this.playerId]];
        }
        
        if (playerHand.length === 0) {
            playerHand = this.createDeck().slice(0, 3);
        }
        
        cardsContainer.innerHTML = '';
        playerHand.forEach((card, index) => {
            const cardElement = this.createCardElement(card, index);
            cardsContainer.appendChild(cardElement);
        });
        
        const score = this.calculateBaLaScore(playerHand);
        
        gameInfo.innerHTML = `
            <div>Game: <strong style="color: #FF3385;">Ba Lá (Bài Cào)</strong></div>
            <div>Bài của bạn: <strong>3 lá ngẫu nhiên</strong></div>
            <div>Điểm của bạn: <strong style="color: #FF3385;">${typeof score === 'number' ? score + ' nút' : score}</strong></div>
        `;
        
        const playBtn = document.getElementById('play-card-btn');
        const passBtn = document.getElementById('pass-turn-btn');
        
        playBtn.textContent = 'Mở Bài (Show)';
        playBtn.style.display = 'inline-block';
        playBtn.disabled = false;
        passBtn.style.display = 'none';
    }
    
    loadPokerInterface() {
        const cardsContainer = document.getElementById('cards-container');
        const gameInfo = document.getElementById('game-info');
        
        let holeCards = [];
        let communityCards = [];
        let step = 0;
        let pot = 50;
        
        if (this.gameData && this.gameData.playerHands) {
            holeCards = this.gameData.playerHands[this.playerId] || [];
            communityCards = this.gameData.communityCards || [];
            step = this.gameData.pokerStep || 0;
            pot = this.gameData.pot || 50;
        }
        
        if (holeCards.length === 0) {
            const deck = this.createDeck();
            holeCards = [deck[0], deck[1]];
            communityCards = [deck[2], deck[3], deck[4], deck[5], deck[6]];
        }
        
        cardsContainer.innerHTML = '<div style="width:100%; text-align:center; font-weight:700; margin-bottom:5px; color:#ffd700;">Bài tẩy của bạn:</div>';
        holeCards.forEach((card, index) => {
            const cardElement = this.createCardElement(card, index);
            cardsContainer.appendChild(cardElement);
        });
        
        cardsContainer.innerHTML += '<div style="width:100%; text-align:center; font-weight:700; margin:15px 0 5px; color:#ffd700;">Bài chung trên bàn (Community):</div>';
        communityCards.forEach((card, index) => {
            // Render card face up or face down based on the current poker round step
            // 0: preflop (all down), 1: flop (3 up), 2: turn (4 up), 3+: river (all 5 up)
            let isFaceUp = false;
            if (step === 1 && index < 3) isFaceUp = true;
            else if (step === 2 && index < 4) isFaceUp = true;
            else if (step >= 3) isFaceUp = true;
            
            if (isFaceUp) {
                const cardElement = this.createCardElement(card, index + 100);
                cardsContainer.appendChild(cardElement);
            } else {
                const hiddenCard = document.createElement('div');
                hiddenCard.className = 'playing-card card-back';
                cardsContainer.appendChild(hiddenCard);
            }
        });
        
        let roundName = "Pre-Flop (Vòng đầu)";
        if (step === 1) roundName = "Flop (Mở 3 lá)";
        else if (step === 2) roundName = "Turn (Mở lá thứ 4)";
        else if (step === 3) roundName = "River (Mở lá thứ 5)";
        else if (step === 4) roundName = "Showdown (Lật bài)";
        
        gameInfo.innerHTML = `
            <div>Game: <strong style="color: #FF3385;">Poker Texas Hold'em</strong></div>
            <div>Pot hiện tại: <strong style="color: #ffd700;">$${pot}</strong></div>
            <div>Vòng chơi: <strong style="color: #ff3385;">${roundName}</strong></div>
        `;
        
        const playBtn = document.getElementById('play-card-btn');
        const passBtn = document.getElementById('pass-turn-btn');
        
        playBtn.textContent = step >= 3 ? 'Showdown (Lật bài)' : 'Check / Call';
        passBtn.textContent = 'Fold (Bỏ bài)';
        playBtn.style.display = 'inline-block';
        passBtn.style.display = 'inline-block';
        playBtn.disabled = false;
        passBtn.disabled = false;
    }
    
    loadBlackjackInterface() {
        const cardsContainer = document.getElementById('cards-container');
        const gameInfo = document.getElementById('game-info');
        
        let playerHand = [];
        let dealerHand = [];
        
        if (this.gameData && this.gameData.playerHands) {
            playerHand = this.gameData.playerHands[this.playerId] || [];
            dealerHand = this.gameData.playerHands.dealer || [];
        }
        
        if (playerHand.length === 0) {
            const deck = this.createDeck();
            playerHand = [deck[0], deck[2]];
            dealerHand = [deck[1], deck[3]];
        }
        
        cardsContainer.innerHTML = '<div style="width:100%; text-align:center; font-weight:700; margin-bottom:5px; color:#ffd700;">Bài của bạn:</div>';
        playerHand.forEach((card, index) => {
            const cardElement = this.createCardElement(card, index);
            cardsContainer.appendChild(cardElement);
        });
        
        cardsContainer.innerHTML += '<div style="width:100%; text-align:center; font-weight:700; margin:15px 0 5px; color:#ffd700;">Bài của Dealer (Nhà cái):</div>';
        dealerHand.forEach((card, index) => {
            // In blackjack, reveal only the first card of dealer unless game is ended
            const showDealerFull = this.gameData.dealerRevealed || false;
            if (index === 0 || showDealerFull) {
                const cardElement = this.createCardElement(card, index + 100);
                cardsContainer.appendChild(cardElement);
            } else {
                const hiddenCard = document.createElement('div');
                hiddenCard.className = 'playing-card card-back';
                cardsContainer.appendChild(hiddenCard);
            }
        });
        
        const playerScore = this.calculateBlackjackScore(playerHand);
        
        gameInfo.innerHTML = `
            <div>Game: <strong style="color: #FF3385;">Blackjack 21 (Xì Dách)</strong></div>
            <div>Điểm của bạn: <strong style="color: #FF3385;">${playerScore} điểm</strong></div>
            <div>Dealer: <strong>${this.gameData.dealerRevealed ? this.calculateBlackjackScore(dealerHand) + ' điểm' : 'Đang úp 1 lá'}</strong></div>
        `;
        
        const playBtn = document.getElementById('play-card-btn');
        const passBtn = document.getElementById('pass-turn-btn');
        
        playBtn.textContent = 'Stand (Dừng bài)';
        passBtn.textContent = 'Hit (Rút thêm)';
        playBtn.style.display = 'inline-block';
        passBtn.style.display = 'inline-block';
        
        // Disable buttons if already busted
        if (playerScore > 21) {
            playBtn.disabled = true;
            passBtn.disabled = true;
        } else {
            playBtn.disabled = false;
            passBtn.disabled = false;
        }
    }
    
    loadSolitaireInterface() {
        const cardsContainer = document.getElementById('cards-container');
        const gameInfo = document.getElementById('game-info');
        
        if (!this.gameData || !this.gameData.solitaireLayout) {
            const deck = this.createDeck();
            this.gameData = {
                solitaireLayout: this.setupSolitaire(deck),
                moves: 0
            };
        }
        
        const layout = this.gameData.solitaireLayout;
        cardsContainer.innerHTML = '';
        
        const tableauContainer = document.createElement('div');
        tableauContainer.style.display = 'grid';
        tableauContainer.style.gridTemplateColumns = 'repeat(7, 1fr)';
        tableauContainer.style.gap = '8px';
        tableauContainer.style.width = '100%';
        tableauContainer.style.maxWidth = '600px';
        tableauContainer.style.margin = '0 auto';
        
        layout.tableau.forEach((column, colIdx) => {
            const colElement = document.createElement('div');
            colElement.style.display = 'flex';
            colElement.style.flexDirection = 'column';
            colElement.style.gap = '4px';
            
            column.forEach((card, cardIdx) => {
                const cardEl = document.createElement('div');
                cardEl.className = 'playing-card';
                cardEl.style.margin = '0';
                
                if (card.faceUp) {
                    cardEl.classList.add(`card-${card.color}`);
                    cardEl.innerHTML = `
                        <div class="card-rank">${card.rank}</div>
                        <div class="card-suit">${card.suit}</div>
                    `;
                } else {
                    cardEl.classList.add('card-back');
                }
                
                colElement.appendChild(cardEl);
            });
            
            if (column.length === 0) {
                const emptyEl = document.createElement('div');
                emptyEl.className = 'playing-card';
                emptyEl.style.border = '2px dashed rgba(255,255,255,0.2)';
                emptyEl.style.background = 'transparent';
                emptyEl.style.boxShadow = 'none';
                emptyEl.innerHTML = '';
                colElement.appendChild(emptyEl);
            }
            
            tableauContainer.appendChild(colElement);
        });
        
        cardsContainer.appendChild(tableauContainer);
        
        gameInfo.innerHTML = `
            <div>Game: <strong style="color: #FFD700;">Solitaire</strong></div>
            <div>Nước đi: <strong>${this.gameData.moves || 0}</strong></div>
            <div>Mục tiêu: <strong>Lật tất cả bài úp sang mặt ngửa</strong></div>
        `;
        
        const playBtn = document.getElementById('play-card-btn');
        const passBtn = document.getElementById('pass-turn-btn');
        
        playBtn.textContent = 'Di chuyển tự động';
        passBtn.textContent = 'Lật bài mới';
        playBtn.style.display = 'inline-block';
        passBtn.style.display = 'inline-block';
        playBtn.disabled = false;
        passBtn.disabled = false;
    }
    
    createCardElement(card, index) {
        const cardElement = document.createElement('div');
        cardElement.className = 'playing-card';
        cardElement.dataset.index = index;
        
        if (card.rank === 'back') {
            cardElement.classList.add('card-back');
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
    
    dealTienLen(deck) {
        const hands = {};
        Object.keys(this.players).forEach(playerId => {
            hands[playerId] = deck.splice(0, 13);
        });
        return hands;
    }
    
    dealLoc(deck) {
        const hands = {};
        Object.keys(this.players).forEach(playerId => {
            hands[playerId] = deck.splice(0, 10); // Sâm Lốc chia 10 lá nhé!
        });
        return hands;
    }
    
    dealBaLa(deck) {
        const hands = {};
        Object.keys(this.players).forEach(playerId => {
            hands[playerId] = deck.splice(0, 3);
        });
        return hands;
    }
    
    dealPoker(deck) {
        const hands = {};
        Object.keys(this.players).forEach(playerId => {
            hands[playerId] = deck.splice(0, 2);
        });
        return hands;
    }
    
    dealBlackjack(deck) {
        const hands = {};
        Object.keys(this.players).forEach(playerId => {
            hands[playerId] = deck.splice(0, 2);
        });
        hands.dealer = deck.splice(0, 2);
        return hands;
    }
    
    setupSolitaire(deck) {
        const layout = {
            tableau: Array.from({length: 7}, () => []),
            foundation: Array.from({length: 4}, () => []),
            stock: [],
            waste: []
        };
        
        // Deal tableau
        for (let col = 0; col < 7; col++) {
            for (let row = col; row < 7; row++) {
                const card = deck.shift();
                layout.tableau[row].push({
                    ...card,
                    faceUp: row === col
                });
            }
        }
        
        // Remaining cards go to stock
        layout.stock = [...deck];
        deck.length = 0;
        
        return layout;
    }
    
    // Game actions
    playSelectedCards() {
        if (this.currentGame === 'blackjack') {
            this.blackjackStand();
            return;
        }
        if (this.currentGame === 'bala') {
            this.balaShowCards();
            return;
        }
        if (this.currentGame === 'poker') {
            this.pokerNextStep();
            return;
        }
        if (this.currentGame === 'solitaire') {
            this.solitaireMove();
            return;
        }
        
        const selectedCards = document.querySelectorAll('.playing-card.selected');
        if (selectedCards.length === 0) {
            alert('Vui lòng chọn bài để đánh!');
            return;
        }
        
        // Remove selected cards from UI and data
        const indexesToRemove = Array.from(selectedCards).map(card => parseInt(card.dataset.index));
        let playerHand = this.gameData.playerHands[this.playerId];
        
        // Save played cards
        const playedCards = indexesToRemove.map(idx => playerHand[idx]);
        
        // Filter out played cards from hand
        this.gameData.playerHands[this.playerId] = playerHand.filter((_, idx) => !indexesToRemove.includes(idx));
        this.updateGameDataFirebase();
        
        // Render played cards in middle of board
        const tableCardsDisplay = document.getElementById('table-cards-display');
        if (tableCardsDisplay) {
            tableCardsDisplay.innerHTML = playedCards.map(c => `<span class="card-${c.color}" style="background: white; border: 1px solid #dee2e6; padding: 4px 8px; border-radius: 4px; font-weight: bold; margin-right: 5px; color: ${c.color === 'red' ? '#ff3385' : '#000'};">${c.rank}${c.suit}</span>`).join('');
        }
        
        this.addChatMessage('game', `${this.playerName} đã đánh: ` + playedCards.map(c => `${c.rank}${c.suit}`).join(', '));
        
        // Check win
        if (this.gameData.playerHands[this.playerId].length === 0) {
            this.addChatMessage('game', `🏆 Chúc mừng! Bạn (${this.playerName}) đã hết bài và CHIẾN THẮNG! 🎉`);
            alert(`Chúc mừng! Bạn đã giành CHIẾN THẮNG! 🎉`);
            this.endGameWithWinner(this.playerName);
            return;
        }
        
        // Reload player hand UI
        this.loadGameInterface();
        
        // Trigger Bot turns simulation
        if (!this.isOnline || Object.values(this.players).some(p => p.isAI)) {
            this.simulateBotTurns();
        }
    }
    
    passTurn() {
        if (this.currentGame === 'blackjack') {
            this.blackjackHit();
            return;
        }
        if (this.currentGame === 'poker') {
            this.pokerFold();
            return;
        }
        if (this.currentGame === 'solitaire') {
            this.solitaireDraw();
            return;
        }
        
        this.addChatMessage('game', `${this.playerName} đã bỏ lượt`);
        
        // Trigger Bot turns simulation
        if (!this.isOnline || Object.values(this.players).some(p => p.isAI)) {
            this.simulateBotTurns();
        }
    }
    
    showRules() {
        const rules = {
            'tienlen': 'Luật Tiến Lên Miền Nam:\n- Chia mỗi người 13 lá.\n- Lượt chơi ngược chiều kim đồng hồ.\n- Người có 3 bích được đi trước ở ván đầu tiên.\n- Đánh bài theo các bộ: Rác, Đôi, Ba, Sảnh, Tứ quý, Ba đôi thông...\n- Bộ đánh sau phải cùng loại và cao hơn bộ đánh trước.\n- Ai hết bài trước là người chiến thắng!',
            'loc': 'Luật Sâm Lốc:\n- Chia mỗi người 10 lá.\n- Có thể Báo Sâm nếu tin tưởng bài mình không ai chặn được. Nếu báo Sâm thành công, bạn được đi và phải đánh hết bài. Nếu bị chặn, bạn đền Sâm.\n- Đánh bài theo các bộ tương tự Tiến Lên nhưng không phân biệt chất bài, chỉ so sánh độ lớn của số quân bài.',
            'bala': 'Luật Ba Lá (Bài Cào):\n- Mỗi người được chia 3 lá bài ngẫu nhiên.\n- Tính điểm: Tổng điểm lẻ chia cho 10 lấy phần dư (Ví dụ: 18 điểm tính là 8 nút; 20 điểm tính là 10 nút - cao nhất).\n- Các lá J, Q, K tính là 10 điểm.\n- Nếu cả 3 lá đều là J, Q, K thì được tính là Ba Cào (Sáp JQK), thắng mọi điểm số nút khác!',
            'poker': 'Luật Poker Texas Hold\'em:\n- Mỗi người được chia 2 lá bài tẩy riêng.\n- 5 lá bài chung được lật dần qua các vòng: Flop (3 lá), Turn (lá thứ 4), River (lá thứ 5).\n- Người chơi tạo ra liên kết 5 lá mạnh nhất từ 2 lá bài tẩy và 5 lá bài chung.\n- So bài ở vòng Showdown để tìm ra người thắng hốt trọn Pot!',
            'blackjack': 'Luật Blackjack 21 (Xì Dách):\n- Mục tiêu: Đạt tổng điểm gần 21 nhất nhưng không được vượt quá 21 (Bust).\n- Ban đầu mỗi người được chia 2 lá bài.\n- Bạn có thể chọn Rút thêm (Hit) hoặc Dừng bài (Stand).\n- Dealer (Nhà cái) phải rút bài cho đến khi đạt tối thiểu 17 điểm mới được dừng.\n- So điểm giữa bạn và Dealer để phân định thắng thua!',
            'solitaire': 'Luật Solitaire:\n- Mục tiêu là lật ngửa toàn bộ các lá bài úp trên tableau.\n- Trong phiên bản này, bạn nhấn "Di chuyển tự động" để lật dần các quân bài úp, hoặc "Lật bài mới" để đổi thế bài. Hãy lật được hết toàn bộ bài để chiến thắng!'
        };
        alert(rules[this.currentGame] || `Luật chơi ${this.getGameName(this.currentGame)} sẽ được cập nhật!`);
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
        this.gameData = {};
        
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
                <div style="color: #8c5273; font-style: italic; text-align: center; margin: 5px 0; font-size: 0.85rem;">
                    ${messageData.content} <span style="font-size: 0.8rem;">(${time})</span>
                </div>
            `;
        } else {
            messageElement.innerHTML = `
                <div style="background: ${isOwn ? '#ffe3ec' : '#f5eefc'}; border: 1.5px solid ${isOwn ? '#ffb6c1' : '#e6ccff'}; padding: 8px; border-radius: 8px; margin: 5px 0;">
                    <div style="font-weight: 700; font-size: 0.85rem; color: #4a0e2e;">${messageData.sender}</div>
                    <div style="margin: 2px 0; font-size: 0.9rem; color: #4a0e2e;">${messageData.content}</div>
                    <div style="font-size: 0.75rem; color: #8c5273; text-align: right;">${time}</div>
                </div>
            `;
        }
        
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    sortHand(hand) {
        const rankOrder = {'3':0, '4':1, '5':2, '6':3, '7':4, '8':5, '9':6, '10':7, 'J':8, 'Q':9, 'K':10, 'A':11, '2':12};
        const suitOrder = {'♠':0, '♣':1, '♦':2, '♥':3};
        
        return hand.sort((a, b) => {
            const rankA = rankOrder[a.rank] ?? -1;
            const rankB = rankOrder[b.rank] ?? -1;
            if (rankA !== rankB) {
                return rankA - rankB;
            }
            const suitA = suitOrder[a.suit] ?? -1;
            const suitB = suitOrder[b.suit] ?? -1;
            return suitA - suitB;
        });
    }
    
    calculateBaLaScore(hand) {
        let total = 0;
        let isBaCao = true;
        
        hand.forEach(card => {
            const rank = card.rank;
            if (rank === 'J' || rank === 'Q' || rank === 'K') {
                total += 10;
            } else if (rank === 'A') {
                total += 1;
                isBaCao = false;
            } else {
                total += parseInt(rank);
                isBaCao = false;
            }
        });
        
        if (isBaCao) return 'Ba Cào (Sáp JQK - Đặc biệt! 🎉)';
        const points = total % 10;
        return points === 0 ? 10 : points;
    }
    
    calculateBlackjackScore(hand) {
        let score = 0;
        let aceCount = 0;
        
        hand.forEach(card => {
            if (card.rank === 'J' || card.rank === 'Q' || card.rank === 'K') {
                score += 10;
            } else if (card.rank === 'A') {
                score += 11;
                aceCount++;
            } else {
                score += parseInt(card.rank);
            }
        });
        
        while (score > 21 && aceCount > 0) {
            score -= 10;
            aceCount--;
        }
        
        return score;
    }
    
    blackjackHit() {
        if (this.gameState !== 'playing') return;
        
        const deck = this.gameData.deck;
        const playerHand = this.gameData.playerHands[this.playerId];
        
        if (!deck || deck.length === 0) {
            alert('Hết bài trong bộ bài!');
            return;
        }
        
        const newCard = deck.shift();
        playerHand.push(newCard);
        
        const score = this.calculateBlackjackScore(playerHand);
        this.addChatMessage('game', `${this.playerName} rút thêm lá: ${newCard.rank}${newCard.suit}`);
        
        this.updateGameDataFirebase();
        this.loadBlackjackInterface();
        
        if (score > 21) {
            this.addChatMessage('game', `💥 Bạn đã BUST (Quá 21 điểm - ${score} điểm)! Nhà cái thắng.`);
            alert(`Bạn đã BUST (${score} điểm)! Nhà cái thắng.`);
            this.endBlackjackGame('dealer');
        }
    }
    
    blackjackStand() {
        if (this.gameState !== 'playing') return;
        
        const deck = this.gameData.deck;
        const playerHand = this.gameData.playerHands[this.playerId];
        const dealerHand = this.gameData.playerHands.dealer;
        
        const playerScore = this.calculateBlackjackScore(playerHand);
        let dealerScore = this.calculateBlackjackScore(dealerHand);
        
        this.addChatMessage('game', `${this.playerName} Dừng bài ở ${playerScore} điểm. Lượt của Dealer.`);
        
        let dealerDraws = [];
        while (dealerScore < 17 && deck.length > 0) {
            const newCard = deck.shift();
            dealerHand.push(newCard);
            dealerDraws.push(`${newCard.rank}${newCard.suit}`);
            dealerScore = this.calculateBlackjackScore(dealerHand);
        }
        
        if (dealerDraws.length > 0) {
            this.addChatMessage('game', `Dealer rút thêm: ` + dealerDraws.join(', '));
        }
        
        // Reveal dealer hand
        this.gameData.dealerRevealed = true;
        this.updateGameDataFirebase();
        
        const cardsContainer = document.getElementById('cards-container');
        cardsContainer.innerHTML = '<div style="width:100%; text-align:center; font-weight:700; margin-bottom:5px; color:#ffd700;">Bài của bạn:</div>';
        playerHand.forEach((card, index) => {
            cardsContainer.appendChild(this.createCardElement(card, index));
        });
        
        cardsContainer.innerHTML += '<div style="width:100%; text-align:center; font-weight:700; margin:15px 0 5px; color:#ffd700;">Bài của Dealer (Đã lật):</div>';
        dealerHand.forEach((card, index) => {
            cardsContainer.appendChild(this.createCardElement(card, index + 100));
        });
        
        let resultMsg = '';
        let winner = '';
        
        if (dealerScore > 21) {
            resultMsg = `Dealer đã BUST (${dealerScore} điểm)! Bạn thắng! 🎉`;
            winner = 'player';
        } else if (playerScore > dealerScore) {
            resultMsg = `Bạn (${playerScore} điểm) lớn hơn Dealer (${dealerScore} điểm). Bạn thắng! 🎉`;
            winner = 'player';
        } else if (playerScore < dealerScore) {
            resultMsg = `Dealer (${dealerScore} điểm) lớn hơn bạn (${playerScore} điểm). Bạn thua! 😢`;
            winner = 'dealer';
        } else {
            resultMsg = `Hòa điểm (${playerScore} - ${dealerScore})! Push. 🤝`;
            winner = 'draw';
        }
        
        this.addChatMessage('game', resultMsg);
        alert(resultMsg);
        this.endBlackjackGame(winner);
    }
    
    endBlackjackGame(winner) {
        document.getElementById('play-card-btn').disabled = true;
        document.getElementById('pass-turn-btn').disabled = true;
        
        const gameInfo = document.getElementById('game-info');
        gameInfo.innerHTML += `
            <div style="margin-top: 15px;">
                <button class="room-btn" onclick="window.cardsOnline.restartBlackjack()" style="background: #ff3385; border: none; padding: 10px 20px; border-radius: 8px; color: white; font-weight: bold; cursor: pointer;">Chơi ván mới</button>
            </div>
        `;
    }
    
    restartBlackjack() {
        this.restartGame();
    }
    
    restartBaLa() {
        this.restartGame();
    }
    
    balaShowCards() {
        if (this.gameState !== 'playing') return;
        
        const playerHand = this.gameData.playerHands[this.playerId];
        const playerScore = this.calculateBaLaScore(playerHand);
        const playerScoreVal = typeof playerScore === 'number' ? playerScore : 10.5;
        
        this.addChatMessage('game', `--- KẾT QUẢ SO BÀI CÀO ---`);
        this.addChatMessage('game', `Bạn (${this.playerName}): ` + playerHand.map(c => `${c.rank}${c.suit}`).join(' ') + ` -> [${typeof playerScore === 'number' ? playerScore + ' nút' : 'Ba Cào'}]`);
        
        let bestScoreVal = playerScoreVal;
        let winnerName = this.playerName;
        
        Object.entries(this.players).forEach(([id, player]) => {
            if (id !== this.playerId) {
                const botHand = this.gameData.playerHands[id];
                const botScore = this.calculateBaLaScore(botHand);
                const botScoreVal = typeof botScore === 'number' ? botScore : 10.5;
                
                this.addChatMessage('game', `${player.name}: ` + botHand.map(c => `${c.rank}${c.suit}`).join(' ') + ` -> [${typeof botScore === 'number' ? botScore + ' nút' : 'Ba Cào'}]`);
                
                if (botScoreVal > bestScoreVal) {
                    bestScoreVal = botScoreVal;
                    winnerName = player.name;
                }
            }
        });
        
        const finalMsg = `🏆 Người chiến thắng là: **${winnerName}**!`;
        this.addChatMessage('game', finalMsg);
        alert(finalMsg);
        
        document.getElementById('play-card-btn').disabled = true;
        
        const gameInfo = document.getElementById('game-info');
        gameInfo.innerHTML += `
            <div style="margin-top: 15px;">
                <button class="room-btn" onclick="window.cardsOnline.restartBaLa()" style="background: #ff3385; border: none; padding: 10px 20px; border-radius: 8px; color: white; font-weight: bold; cursor: pointer;">Chơi ván mới</button>
            </div>
        `;
    }
    
    // Poker interactive methods
    pokerNextStep() {
        if (this.gameState !== 'playing') return;
        
        this.gameData.pokerStep = (this.gameData.pokerStep || 0) + 1;
        
        if (this.gameData.pokerStep === 1) {
            this.gameData.pot += 100;
            this.addChatMessage('game', `${this.playerName} Check. Mở FLOP (3 lá chung). Pot: $${this.gameData.pot}`);
            this.simulatePokerBotActions("Flop");
        } else if (this.gameData.pokerStep === 2) {
            this.gameData.pot += 100;
            this.addChatMessage('game', `${this.playerName} Check. Mở TURN (Lá chung thứ 4). Pot: $${this.gameData.pot}`);
            this.simulatePokerBotActions("Turn");
        } else if (this.gameData.pokerStep === 3) {
            this.gameData.pot += 100;
            this.addChatMessage('game', `${this.playerName} Check. Mở RIVER (Lá chung thứ 5). Pot: $${this.gameData.pot}`);
            this.simulatePokerBotActions("River");
        } else if (this.gameData.pokerStep === 4) {
            this.pokerShowdown();
            return;
        }
        
        this.updateGameDataFirebase();
        this.loadPokerInterface();
    }
    
    pokerFold() {
        this.addChatMessage('game', `${this.playerName} đã Fold (Bỏ bài). Các Bot chia nhau Pot $${this.gameData.pot}!`);
        alert('Bạn đã bỏ bài! Ván đấu kết thúc.');
        this.endPokerGame('bots');
    }
    
    simulatePokerBotActions(roundName) {
        const comments = {
            "Flop": [
                "Bot 1: Check nha.",
                "Bot 2: Flop này có vẻ căng đấy.",
                "Bot 3: Check luôn."
            ],
            "Turn": [
                "Bot 1: Check.",
                "Bot 2: Đi tiếp thôi.",
                "Bot 3: Bài khó đoán quá, Check."
            ],
            "River": [
                "Bot 1: Check, chờ showdown.",
                "Bot 2: Đóng tiền vào pot nào!",
                "Bot 3: Check nốt."
            ]
        };
        const roundComments = comments[roundName] || [];
        roundComments.forEach((comment, index) => {
            setTimeout(() => {
                const parts = comment.split(': ');
                this.addBotChatMessage(parts[0], parts[1]);
            }, (index + 1) * 600);
        });
    }
    
    pokerShowdown() {
        this.addChatMessage('game', `--- SHOWDOWN (LẬT BÀI POKER) ---`);
        
        const playerHand = this.gameData.playerHands[this.playerId];
        this.addChatMessage('game', `Bạn (${this.playerName}): ` + playerHand.map(c => `${c.rank}${c.suit}`).join(' '));
        
        const rankings = [
            "Đôi J (Pair of Jacks)",
            "Thú 10 và Q (Two Pairs)",
            "Mậu Thầu A (Ace High)",
            "Sám Cô 8 (Three of a Kind)",
            "Đôi A (Pair of Aces)",
            "Sảnh từ 5 đến 9 (Straight)",
            "Thùng Bích (Flush)"
        ];
        
        let bestRankIdx = Math.floor(Math.random() * rankings.length);
        let winnerName = this.playerName;
        
        this.addChatMessage('game', `Bài của bạn đạt: **${rankings[bestRankIdx]}**`);
        
        Object.entries(this.players).forEach(([id, player]) => {
            if (id !== this.playerId) {
                const botHand = this.gameData.playerHands[id];
                const botRankIdx = Math.floor(Math.random() * rankings.length);
                this.addChatMessage('game', `${player.name}: ` + botHand.map(c => `${c.rank}${c.suit}`).join(' ') + ` -> [${rankings[botRankIdx]}]`);
                
                if (botRankIdx > bestRankIdx) {
                    bestRankIdx = botRankIdx;
                    winnerName = player.name;
                }
            }
        });
        
        const winMsg = `🏆 Chiến thắng thuộc về **${winnerName}** với hand **${rankings[bestRankIdx]}**! Hốt trọn Pot $${this.gameData.pot}! 🎉`;
        this.addChatMessage('game', winMsg);
        alert(winMsg);
        this.endPokerGame(winnerName);
    }
    
    endPokerGame(winnerName) {
        document.getElementById('play-card-btn').disabled = true;
        document.getElementById('pass-turn-btn').disabled = true;
        
        const gameInfo = document.getElementById('game-info');
        if (gameInfo) {
            gameInfo.innerHTML += `
                <div style="margin-top: 15px;">
                    <button class="room-btn" onclick="window.cardsOnline.restartGame()" style="background: #ff3385; border: none; padding: 10px 20px; border-radius: 8px; color: white; font-weight: bold; cursor: pointer;">Chơi ván mới</button>
                </div>
            `;
        }
    }
    
    // Solitaire interactive methods
    solitaireMove() {
        this.gameData.moves = (this.gameData.moves || 0) + 1;
        this.addChatMessage('game', `Di chuyển quân bài. Nước đi thứ ${this.gameData.moves}.`);
        
        const layout = this.gameData.solitaireLayout;
        let flipped = false;
        
        for (let col = 0; col < 7; col++) {
            const column = layout.tableau[col];
            for (let card of column) {
                if (!card.faceUp) {
                    card.faceUp = true;
                    flipped = true;
                    break;
                }
            }
            if (flipped) break;
        }
        
        this.loadSolitaireInterface();
        
        let allFaceUp = true;
        for (let col = 0; col < 7; col++) {
            for (let card of layout.tableau[col]) {
                if (!card.faceUp) {
                    allFaceUp = false;
                    break;
                }
            }
        }
        
        if (allFaceUp) {
            this.addChatMessage('game', `🏆 Chúc mừng! Bạn đã giải thành công trò chơi Solitaire sau ${this.gameData.moves} nước đi! 🎉`);
            alert('Chúc mừng! Bạn đã thắng trò chơi Solitaire! 🎉');
            this.endSolitaireGame();
        }
    }
    
    solitaireDraw() {
        this.gameData.moves = (this.gameData.moves || 0) + 1;
        this.addChatMessage('game', `Lật bài mới từ bộ bài dự trữ.`);
        this.loadSolitaireInterface();
    }
    
    endSolitaireGame() {
        document.getElementById('play-card-btn').disabled = true;
        document.getElementById('pass-turn-btn').disabled = true;
        
        const gameInfo = document.getElementById('game-info');
        gameInfo.innerHTML += `
            <div style="margin-top: 15px;">
                <button class="room-btn" onclick="window.cardsOnline.restartGame()" style="background: #ff3385; border: none; padding: 10px 20px; border-radius: 8px; color: white; font-weight: bold; cursor: pointer;">Chơi ván mới</button>
            </div>
        `;
    }
    
    simulateBotTurns() {
        let botIndex = 1;
        const bots = Object.entries(this.players).filter(([id, p]) => id !== this.playerId);
        
        bots.forEach(([botId, bot]) => {
            setTimeout(() => {
                if (this.gameState !== 'playing') return;
                
                let botHand = this.gameData.playerHands[botId];
                if (!botHand || botHand.length === 0) return;
                
                const passes = Math.random() > 0.4;
                if (passes && botHand.length > 2) {
                    this.addChatMessage('game', `${bot.name} đã bỏ lượt (Pass)`);
                    
                    const chatComments = [
                        "Bài thế này sao theo nổi 😂",
                        "Bỏ lượt nha!",
                        "Nhường các bác đi trước.",
                        "Chịu, không đỡ được!"
                    ];
                    if (Math.random() > 0.6) {
                        this.addBotChatMessage(bot.name, chatComments[Math.floor(Math.random() * chatComments.length)]);
                    }
                } else {
                    const playCount = (Math.random() > 0.7 && botHand.length >= 2) ? 2 : 1;
                    const playedCards = [];
                    
                    for (let i = 0; i < playCount; i++) {
                        if (botHand.length > 0) {
                            const cardIdx = Math.floor(Math.random() * botHand.length);
                            playedCards.push(botHand.splice(cardIdx, 1)[0]);
                        }
                    }
                    
                    this.gameData.playerHands[botId] = botHand;
                    this.updateGameDataFirebase();
                    
                    const cardStrings = playedCards.map(c => `${c.rank}${c.suit}`).join(' ');
                    this.addChatMessage('game', `${bot.name} đã đánh: ${cardStrings} (Còn ${botHand.length} lá)`);
                    
                    if (botHand.length === 0) {
                        this.addChatMessage('game', `🏆 ${bot.name} đã hết bài và CHIẾN THẮNG! Ván đấu kết thúc.`);
                        alert(`${bot.name} đã hết bài và giành CHIẾN THẮNG!`);
                        this.endGameWithWinner(bot.name);
                        return;
                    }
                    
                    const playComments = [
                        "Đỡ hộ cái! 😎",
                        "Hehe, bài bắt đầu mượt rồi đấy.",
                        "Chạy điểm thôi!",
                        "Có ai đè được không?"
                    ];
                    if (Math.random() > 0.7) {
                        this.addBotChatMessage(bot.name, playComments[Math.floor(Math.random() * playComments.length)]);
                    }
                }
            }, botIndex * 1500);
            botIndex++;
        });
    }
    
    addBotChatMessage(botName, content) {
        const messageData = {
            sender: botName,
            senderId: 'bot',
            content: content,
            timestamp: Date.now(),
            type: 'user'
        };
        this.displayChatMessage(messageData);
    }
    
    endGameWithWinner(winnerName) {
        document.getElementById('play-card-btn').disabled = true;
        document.getElementById('pass-turn-btn').disabled = true;
        
        const gameInfo = document.getElementById('game-info');
        if (gameInfo) {
            gameInfo.innerHTML += `
                <div style="margin-top: 15px;">
                    <button class="room-btn" onclick="window.cardsOnline.restartGame()" style="background: #ff3385; border: none; padding: 10px 20px; border-radius: 8px; color: white; font-weight: bold; cursor: pointer;">Chơi ván mới</button>
                </div>
            `;
        }
    }
    
    restartGame() {
        this.gameData = this.initializeGameData();
        this.updateGameDataFirebase();
        this.loadGameInterface();
        this.addChatMessage('system', '🎮 Ván đấu mới bắt đầu!');
    }
    
    async updateGameDataFirebase() {
        if (this.roomRef) {
            try {
                await this.roomRef.child('gameData').set(this.gameData);
            } catch (error) {
                console.error('Error syncing gameData to Firebase:', error);
            }
        }
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
