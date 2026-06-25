// Caro Game - Advanced Online Multiplayer with Firebase and Chat
class CaroGame {
    constructor() {
        this.boardSize = 15;
        this.board = [];
        this.currentPlayer = 'X';
        this.gameStarted = false;
        this.gameEnded = false;
        this.moveCount = 0;
        this.startTime = null;
        this.timeInterval = null;
        
        // Online multiplayer
        this.isOnline = false;
        this.roomCode = null;
        this.playerName = 'Player1';
        this.playerId = null;
        this.playerSymbol = null;
        this.isHost = false;
        this.opponent = null;
        this.scores = { X: 0, O: 0 };
        
        // Firebase
        this.db = null;
        this.roomRef = null;
        this.chatRef = null;
        
        // Chat
        this.chatMessages = [];
        this.isPlayWithAI = false;
        
        this.init();
    }
    
    init() {
        console.log('Initializing Caro Game...');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    setup() {
        this.initializeFirebase();
        this.setupEventListeners();
        this.initializeBoard();
        this.setupUsernameAutofill();
        this.updateUI();
        console.log('Caro Game ready!');
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
        // Room controls
        document.getElementById('join-room-btn').addEventListener('click', () => this.joinRoom());
        document.getElementById('play-ai-btn')?.addEventListener('click', () => this.playWithAI());
        document.getElementById('play-local-btn')?.addEventListener('click', () => this.playLocal2P());
        
        // Game controls
        document.getElementById('reset-btn').addEventListener('click', () => this.resetGame());
        document.getElementById('new-game-btn').addEventListener('click', () => this.newGame());
        
        // Chat
        document.getElementById('chat-send-btn').addEventListener('click', () => this.sendMessage());
        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        
        // Modal buttons
        document.getElementById('play-again-btn').addEventListener('click', () => this.playAgain());
        document.getElementById('new-room-btn').addEventListener('click', () => this.createNewRoom());
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
    
    initializeBoard() {
        // Initialize empty board
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(''));
        
        // Generate HTML board
        const boardElement = document.getElementById('caro-board');
        boardElement.innerHTML = '';
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const cell = document.createElement('div');
                cell.className = 'caro-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.addEventListener('click', () => this.makeMove(row, col));
                boardElement.appendChild(cell);
            }
        }
    }
    
    async joinRoom() {
        const roomCode = document.getElementById('room-code').value.trim();
        const playerName = document.getElementById('player-name').value.trim();
        
        if (!playerName) {
            alert('Vui lòng nhập tên của bạn!');
            return;
        }
        
        this.playerName = playerName;
        this.playerId = this.generatePlayerId();
        
        if (!this.db) {
            // Offline mode simulation
            this.simulateOfflineGame();
            return;
        }
        
        try {
            if (roomCode) {
                // Join existing room
                await this.joinExistingRoom(roomCode);
            } else {
                // Create new room
                await this.createNewRoom();
            }
        } catch (error) {
            console.error('Error joining room:', error);
            alert('Không thể kết nối. Thử lại sau!');
        }
    }
    
    async createNewRoom() {
        this.roomCode = this.generateRoomCode();
        this.isHost = true;
        this.playerSymbol = 'X';
        
        if (this.db) {
            this.roomRef = this.db.ref(`rooms/${this.roomCode}`);
            this.chatRef = this.db.ref(`chats/${this.roomCode}`);
            
            // Create room data
            await this.roomRef.set({
                host: {
                    id: this.playerId,
                    name: this.playerName,
                    symbol: 'X'
                },
                guest: null,
                board: this.board,
                currentPlayer: 'X',
                gameStarted: false,
                gameEnded: false,
                scores: { X: 0, O: 0 },
                createdAt: firebase.database.ServerValue.TIMESTAMP
            });
            
            this.setupRoomListeners();
        }
        
        this.updateRoomStatus('waiting');
        this.addSystemMessage(`Phòng ${this.roomCode} đã được tạo. Đang chờ người chơi khác...`);
    }
    
    async joinExistingRoom(roomCode) {
        this.roomCode = roomCode;
        this.isHost = false;
        this.playerSymbol = 'O';
        
        if (this.db) {
            this.roomRef = this.db.ref(`rooms/${roomCode}`);
            this.chatRef = this.db.ref(`chats/${roomCode}`);
            
            // Check if room exists
            const snapshot = await this.roomRef.once('value');
            if (!snapshot.exists()) {
                throw new Error('Phòng không tồn tại');
            }
            
            const roomData = snapshot.val();
            if (roomData.guest) {
                throw new Error('Phòng đã đầy');
            }
            
            // Join room
            await this.roomRef.child('guest').set({
                id: this.playerId,
                name: this.playerName,
                symbol: 'O'
            });
            
            await this.roomRef.child('gameStarted').set(true);
            
            this.setupRoomListeners();
        }
        
        this.updateRoomStatus('connected');
        this.startOnlineGame();
    }
    
    playWithAI() {
        const playerName = document.getElementById('player-name').value.trim() || 'Hằng xinh gái';
        this.playerName = playerName;
        this.playerId = this.generatePlayerId();
        this.isOnline = false;
        this.isPlayWithAI = true;
        this.playerSymbol = 'X';
        this.opponent = { name: 'Máy tính (AI)', symbol: 'O' };
        
        this.roomCode = 'AI-MODE';
        this.updateRoomStatus('connected');
        document.getElementById('room-status').textContent = 'Đang chơi với Máy tính';
        
        this.gameStarted = true;
        this.currentPlayer = 'X';
        this.moveCount = 0;
        this.gameEnded = false;
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(''));
        
        this.startTimer();
        this.updatePlayerCards();
        this.updateUI();
        this.updateBoard();
        
        document.getElementById('players-info').style.display = 'grid';
        document.getElementById('room-display').textContent = 'Local (AI)';
        
        document.getElementById('player-x-name').textContent = this.playerName;
        document.getElementById('player-o-name').textContent = 'Máy tính (AI)';
        
        this.clearChat();
        this.displayChatMessage({
            sender: 'Hệ thống',
            senderId: 'system',
            content: 'Bắt đầu chơi với Máy tính! Bạn đi trước (X). Chúc bạn chơi vui vẻ! 💖',
            timestamp: Date.now(),
            type: 'system'
        });
    }
    
    playLocal2P() {
        const playerName = document.getElementById('player-name').value.trim() || 'Người chơi 1';
        this.playerName = playerName;
        this.playerId = this.generatePlayerId();
        this.isOnline = false;
        this.isPlayWithAI = false;
        this.playerSymbol = 'X';
        this.opponent = { name: 'Người chơi 2', symbol: 'O' };
        
        this.roomCode = 'LOCAL-2P';
        this.updateRoomStatus('connected');
        document.getElementById('room-status').textContent = 'Đang chơi 2 người cục bộ';
        
        this.gameStarted = true;
        this.currentPlayer = 'X';
        this.moveCount = 0;
        this.gameEnded = false;
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(''));
        
        this.startTimer();
        this.updatePlayerCards();
        this.updateUI();
        this.updateBoard();
        
        document.getElementById('players-info').style.display = 'grid';
        document.getElementById('room-display').textContent = 'Local (2P)';
        
        document.getElementById('player-x-name').textContent = this.playerName;
        document.getElementById('player-o-name').textContent = 'Người chơi 2';
        
        this.clearChat();
        this.displayChatMessage({
            sender: 'Hệ thống',
            senderId: 'system',
            content: 'Bắt đầu chơi 2 người cục bộ! X đi trước, O đi sau. Luân phiên đi quân trên cùng máy tính! 👥',
            timestamp: Date.now(),
            type: 'system'
        });
    }
    
    setupRoomListeners() {
        if (!this.roomRef) return;
        
        this.roomRef.on('value', (snapshot) => {
            const data = snapshot.val();
            if (!data) return;
            
            // Update game state
            this.board = data.board || this.board;
            this.currentPlayer = data.currentPlayer || 'X';
            this.gameStarted = data.gameStarted || false;
            this.gameEnded = data.gameEnded || false;
            this.scores = data.scores || { X: 0, O: 0 };
            
            // Update opponent info
            if (this.isHost && data.guest) {
                this.opponent = data.guest;
                this.updateRoomStatus('connected');
                this.startOnlineGame();
            } else if (!this.isHost && data.host) {
                this.opponent = data.host;
            }
            
            this.updateBoard();
            this.updateUI();
            
            // Check for game end
            if (data.winner) {
                this.handleGameEnd(data.winner);
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
    
    simulateOfflineGame() {
        this.roomCode = this.generateRoomCode();
        this.isHost = true;
        this.playerSymbol = 'X';
        this.opponent = { name: 'Computer', symbol: 'O' };
        
        this.updateRoomStatus('connected');
        this.startOnlineGame();
        this.addSystemMessage('Đang chơi offline với máy tính');
    }
    
    startOnlineGame() {
        this.isOnline = (!this.isPlayWithAI && this.roomCode !== 'LOCAL-2P' && this.roomCode !== 'AI-MODE');
        this.gameStarted = true;
        this.currentPlayer = 'X';
        this.moveCount = 0;
        this.gameEnded = false;
        
        this.startTimer();
        this.updatePlayerCards();
        this.updateUI();
        
        document.getElementById('players-info').style.display = 'grid';
        document.getElementById('room-display').textContent = this.roomCode;
        
        // Update player names
        if (this.isHost) {
            document.getElementById('player-x-name').textContent = this.playerName;
            document.getElementById('player-o-name').textContent = this.opponent?.name || 'Đang chờ...';
        } else {
            document.getElementById('player-x-name').textContent = this.opponent?.name || 'Host';
            document.getElementById('player-o-name').textContent = this.playerName;
        }
        
        this.addSystemMessage(`Game bắt đầu! ${this.currentPlayer === 'X' ? 'X' : 'O'} đi trước.`);
    }
    
    makeMove(row, col) {
        if (!this.gameStarted || this.gameEnded) return;
        if (this.board[row][col] !== '') return;
        
        // Check if it's player's turn in online mode
        if (this.isOnline && this.currentPlayer !== this.playerSymbol) {
            this.addSystemMessage('Chưa đến lượt của bạn!');
            return;
        }
        
        // In AI mode, do not allow human to click on AI's turn (O)
        if (this.isPlayWithAI && this.currentPlayer === 'O') {
            return;
        }
        
        // Make move
        this.board[row][col] = this.currentPlayer;
        this.moveCount++;
        
        // Update UI
        this.updateBoard();
        
        // Check for win
        if (this.checkWin(row, col)) {
            this.handleWin(this.currentPlayer);
            return;
        }
        
        // Check for draw
        if (this.moveCount === this.boardSize * this.boardSize) {
            this.handleDraw();
            return;
        }
        
        // Switch player
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateUI();
        
        // Update Firebase
        if (this.roomRef) {
            this.roomRef.update({
                board: this.board,
                currentPlayer: this.currentPlayer,
                moveCount: this.moveCount
            });
        }
        
        // AI move in AI mode
        if (this.isPlayWithAI && this.currentPlayer === 'O') {
            setTimeout(() => this.makeAIMove(), 800);
        }
    }
    
    makeAIMove() {
        // Simple AI: random valid move
        const validMoves = [];
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === '') {
                    validMoves.push({ row, col });
                }
            }
        }
        
        if (validMoves.length > 0) {
            const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
            this.makeMove(randomMove.row, randomMove.col);
        }
    }
    
    updateBoard() {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                const value = this.board[row][col];
                
                cell.textContent = value === 'X' ? '❌' : value === 'O' ? '⭕' : '';
                cell.className = 'caro-cell';
                if (value) {
                    cell.classList.add(value.toLowerCase());
                }
            }
        }
    }
    
    checkWin(row, col) {
        const player = this.board[row][col];
        const directions = [
            [0, 1],   // horizontal
            [1, 0],   // vertical
            [1, 1],   // diagonal
            [1, -1]   // anti-diagonal
        ];
        
        for (let [dx, dy] of directions) {
            let count = 1;
            const winningCells = [{ row, col }];
            
            // Check positive direction
            let r = row + dx, c = col + dy;
            while (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize && 
                   this.board[r][c] === player) {
                count++;
                winningCells.push({ row: r, col: c });
                r += dx;
                c += dy;
            }
            
            // Check negative direction
            r = row - dx;
            c = col - dy;
            while (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize && 
                   this.board[r][c] === player) {
                count++;
                winningCells.push({ row: r, col: c });
                r -= dx;
                c -= dy;
            }
            
            if (count >= 5) {
                this.highlightWinningCells(winningCells);
                return true;
            }
        }
        
        return false;
    }
    
    highlightWinningCells(cells) {
        cells.forEach(({ row, col }) => {
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            cell.classList.add('winning');
        });
    }
    
    handleWin(winner) {
        this.gameEnded = true;
        this.scores[winner]++;
        
        clearInterval(this.timeInterval);
        
        // Update Firebase
        if (this.roomRef) {
            this.roomRef.update({
                gameEnded: true,
                winner: winner,
                scores: this.scores
            });
        }
        
        this.showGameResult(winner);
        this.addSystemMessage(`🎉 ${winner === 'X' ? 'X' : 'O'} thắng!`);
    }
    
    handleDraw() {
        this.gameEnded = true;
        clearInterval(this.timeInterval);
        
        if (this.roomRef) {
            this.roomRef.update({
                gameEnded: true,
                winner: 'draw'
            });
        }
        
        this.showGameResult('draw');
        this.addSystemMessage('🤝 Hòa!');
    }
    
    handleGameEnd(winner) {
        if (winner && !this.gameEnded) {
            this.gameEnded = true;
            this.showGameResult(winner);
        }
    }
    
    showGameResult(winner) {
        const modal = document.getElementById('game-result-modal');
        const title = document.getElementById('result-title');
        const symbol = document.getElementById('winner-symbol');
        const message = document.getElementById('result-message');
        
        if (winner === 'draw') {
            title.textContent = '🤝 Hòa!';
            symbol.textContent = '🤝';
            message.textContent = 'Trận đấu kết thúc hòa!';
        } else {
            const isWinner = winner === this.playerSymbol;
            title.textContent = isWinner ? '🎉 Chúc mừng!' : '😢 Bạn thua!';
            symbol.textContent = winner === 'X' ? '❌' : '⭕';
            message.textContent = isWinner ? 'Bạn đã thắng!' : 'Chúc bạn may mắn lần sau!';
        }
        
        modal.classList.remove('hidden');
    }
    
    resetGame() {
        this.gameEnded = false;
        this.currentPlayer = 'X';
        this.moveCount = 0;
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(''));
        
        this.updateBoard();
        this.updateUI();
        this.startTimer();
        
        // Hide modal
        document.getElementById('game-result-modal').classList.add('hidden');
        
        // Update Firebase
        if (this.roomRef) {
            this.roomRef.update({
                board: this.board,
                currentPlayer: 'X',
                gameEnded: false,
                winner: null,
                moveCount: 0
            });
        }
        
        this.addSystemMessage('🔄 Game mới bắt đầu!');
    }
    
    newGame() {
        this.resetGame();
        this.scores = { X: 0, O: 0 };
        this.updateUI();
        
        if (this.roomRef) {
            this.roomRef.update({
                scores: this.scores
            });
        }
    }
    
    playAgain() {
        this.resetGame();
    }
    
    createNewRoom() {
        // Leave current room
        if (this.roomRef) {
            this.roomRef.off();
        }
        if (this.chatRef) {
            this.chatRef.off();
        }
        
        // Reset game state
        this.isOnline = false;
        this.roomCode = null;
        this.opponent = null;
        this.scores = { X: 0, O: 0 };
        
        // Hide UI elements
        document.getElementById('game-result-modal').classList.add('hidden');
        document.getElementById('players-info').style.display = 'none';
        document.getElementById('room-status').style.display = 'none';
        
        // Clear inputs
        document.getElementById('room-code').value = '';
        document.getElementById('room-display').textContent = '-';
        
        this.resetGame();
        this.clearChat();
    }
    
    startTimer() {
        this.startTime = Date.now();
        clearInterval(this.timeInterval);
        
        this.timeInterval = setInterval(() => {
            if (!this.gameEnded) {
                const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
                const minutes = Math.floor(elapsed / 60);
                const seconds = elapsed % 60;
                document.getElementById('game-time').textContent = 
                    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }
    
    updateUI() {
        document.getElementById('current-turn').textContent = this.currentPlayer === 'X' ? '❌' : '⭕';
        document.getElementById('move-count').textContent = this.moveCount;
        document.getElementById('player-x-score').textContent = this.scores.X;
        document.getElementById('player-o-score').textContent = this.scores.O;
        
        this.updatePlayerCards();
    }
    
    updatePlayerCards() {
        const playerXCard = document.getElementById('player-x-card');
        const playerOCard = document.getElementById('player-o-card');
        
        playerXCard.classList.toggle('active', this.currentPlayer === 'X');
        playerOCard.classList.toggle('active', this.currentPlayer === 'O');
    }
    
    updateRoomStatus(status) {
        const statusElement = document.getElementById('room-status');
        statusElement.className = `room-status ${status}`;
        
        if (status === 'waiting') {
            statusElement.textContent = `Phòng ${this.roomCode} - Đang chờ người chơi khác...`;
        } else if (status === 'connected') {
            statusElement.textContent = `Phòng ${this.roomCode} - Đã kết nối thành công!`;
        }
    }
    
    // Chat functions
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
            // Offline mode
            this.displayChatMessage(messageData);
        }
        
        input.value = '';
    }
    
    displayChatMessage(messageData) {
        const chatMessages = document.getElementById('chat-messages');
        const messageElement = document.createElement('div');
        
        const isOwn = messageData.senderId === this.playerId;
        const isSystem = messageData.type === 'system';
        
        messageElement.className = `chat-message ${isSystem ? 'system' : isOwn ? 'own' : 'other'}`;
        
        const time = new Date(messageData.timestamp).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        if (isSystem) {
            messageElement.innerHTML = `
                <div class="message-content">${messageData.content}</div>
                <div class="message-time">${time}</div>
            `;
        } else {
            messageElement.innerHTML = `
                <div class="message-sender">${messageData.sender}</div>
                <div class="message-content">${messageData.content}</div>
                <div class="message-time">${time}</div>
            `;
        }
        
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    addSystemMessage(content) {
        const messageData = {
            content: content,
            timestamp: Date.now(),
            type: 'system'
        };
        
        if (this.chatRef) {
            this.chatRef.push(messageData);
        } else {
            this.displayChatMessage(messageData);
        }
    }
    
    clearChat() {
        document.getElementById('chat-messages').innerHTML = `
            <div class="chat-message system">
                <div class="message-content">Chào mừng đến với Caro Online! 🎉</div>
                <div class="message-time">Hệ thống</div>
            </div>
        `;
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
    console.log('Creating Caro game instance...');
    window.caroGame = new CaroGame();
});
