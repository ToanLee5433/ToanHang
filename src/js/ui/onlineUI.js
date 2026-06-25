// Online UI Component for Game Hub
import authService from '../services/authService.js';
import roomService from '../services/roomService.js';
import leaderboardService from '../services/leaderboardService.js';

class OnlineUI {
    constructor() {
        this.currentGame = null;
        this.currentRoom = null;
        this.isHost = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupRoomListeners();
        this.setupGameListeners();
    }

    setupEventListeners() {
        // Online menu buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="create-room"]')) {
                this.showCreateRoomModal();
            }
            
            if (e.target.matches('[data-action="join-room"]')) {
                this.showJoinRoomModal();
            }
            
            if (e.target.matches('[data-action="quick-match"]')) {
                this.quickMatch();
            }
            
            if (e.target.matches('[data-action="leave-room"]')) {
                this.leaveRoom();
            }
            
            if (e.target.matches('[data-action="ready"]')) {
                this.toggleReady();
            }
            
            if (e.target.matches('[data-action="send-chat"]')) {
                this.sendChatMessage();
            }
        });

        // Modal close buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.modal-close') || e.target.matches('.modal-overlay')) {
                this.closeModal(e.target.closest('.modal'));
            }
        });
    }

    setupRoomListeners() {
        roomService.onRoomUpdate((event, data) => {
            switch (event) {
                case 'roomUpdate':
                    this.updateRoomUI(data.room);
                    break;
                    
                case 'roomDeleted':
                    this.handleRoomDeleted(data.roomId);
                    break;
                    
                case 'chatMessage':
                    this.addChatMessage(data.message);
                    break;
            }
        });
    }

    setupGameListeners() {
        roomService.onGameUpdate((event, data) => {
            switch (event) {
                case 'gameStart':
                    this.startGame(data.gameState);
                    break;
                    
                case 'gameStateUpdate':
                    this.updateOpponentState(data.playerId, data.gameState);
                    break;
            }
        });
    }

    // Show create room modal
    showCreateRoomModal() {
        const modal = this.createModal('create-room-modal', `
            <div class="modal-header">
                <h2>🏠 Tạo Phòng Chơi</h2>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <form id="create-room-form">
                    <div class="form-group">
                        <label for="room-name">Tên phòng:</label>
                        <input type="text" id="room-name" placeholder="Nhập tên phòng..." required>
                    </div>
                    
                    <div class="form-group">
                        <label for="game-type">Loại game:</label>
                        <select id="game-type" required>
                            <option value="tetris">🧩 Tetris</option>
                            <option value="snake">🐍 Snake</option>
                            <option value="memory">🧠 Memory</option>
                            <option value="caro">⭕ Caro</option>
                            <option value="cards">🃏 Cards</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="max-players">Số người chơi:</label>
                        <select id="max-players" required>
                            <option value="2">2 người</option>
                            <option value="4">4 người</option>
                            <option value="8">8 người</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="is-private">
                            Phòng riêng tư
                        </label>
                    </div>
                    
                    <div class="form-group" id="password-group" style="display: none;">
                        <label for="room-password">Mật khẩu:</label>
                        <input type="password" id="room-password" placeholder="Nhập mật khẩu...">
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">Tạo phòng</button>
                        <button type="button" class="btn btn-secondary modal-close">Hủy</button>
                    </div>
                </form>
            </div>
        `);

        // Show password field when private is checked
        const isPrivateCheckbox = modal.querySelector('#is-private');
        const passwordGroup = modal.querySelector('#password-group');
        
        isPrivateCheckbox.addEventListener('change', () => {
            passwordGroup.style.display = isPrivateCheckbox.checked ? 'block' : 'none';
        });

        // Handle form submission
        const form = modal.querySelector('#create-room-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.createRoom(form);
        });

        this.showModal(modal);
    }

    // Show join room modal
    showJoinRoomModal() {
        const modal = this.createModal('join-room-modal', `
            <div class="modal-header">
                <h2>🚪 Vào Phòng</h2>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="join-options">
                    <div class="join-option">
                        <h3>🔍 Tìm phòng</h3>
                        <div id="available-rooms" class="rooms-list">
                            <div class="loading">Đang tải...</div>
                        </div>
                    </div>
                    
                    <div class="join-option">
                        <h3>🔗 Vào bằng mã</h3>
                        <form id="join-room-form">
                            <div class="form-group">
                                <label for="room-code">Mã phòng:</label>
                                <input type="text" id="room-code" placeholder="Nhập mã phòng..." required>
                            </div>
                            
                            <div class="form-group" id="join-password-group" style="display: none;">
                                <label for="join-password">Mật khẩu:</label>
                                <input type="password" id="join-password" placeholder="Nhập mật khẩu...">
                            </div>
                            
                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary">Vào phòng</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `);

        // Load available rooms
        this.loadAvailableRooms(modal.querySelector('#available-rooms'));

        // Handle form submission
        const form = modal.querySelector('#join-room-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.joinRoom(form);
        });

        this.showModal(modal);
    }

    // Create room
    async createRoom(form) {
        const formData = new FormData(form);
        const roomData = {
            name: formData.get('room-name') || form.querySelector('#room-name').value,
            gameType: formData.get('game-type') || form.querySelector('#game-type').value,
            maxPlayers: parseInt(formData.get('max-players') || form.querySelector('#max-players').value),
            isPrivate: formData.get('is-private') || form.querySelector('#is-private').checked,
            password: formData.get('room-password') || form.querySelector('#room-password').value,
            createdBy: authService.getCurrentUser()?.uid,
            playerName: authService.getCurrentUser()?.displayName || 'Anonymous'
        };

        const result = await roomService.createRoom(roomData);
        
        if (result.success) {
            this.currentRoom = result.roomId;
            this.isHost = true;
            this.showRoomLobby(result.room);
            this.closeModal(form.closest('.modal'));
        } else {
            this.showError(result.error);
        }
    }

    // Join room
    async joinRoom(form) {
        const roomCode = form.querySelector('#room-code').value;
        const password = form.querySelector('#join-password').value;
        
        const playerData = {
            id: authService.getCurrentUser()?.uid,
            name: authService.getCurrentUser()?.displayName || 'Anonymous',
            password: password
        };

        const result = await roomService.joinRoom(roomCode, playerData);
        
        if (result.success) {
            this.currentRoom = roomCode;
            this.isHost = false;
            this.showRoomLobby(result.room);
            this.closeModal(form.closest('.modal'));
        } else {
            this.showError(result.error);
        }
    }

    // Quick match
    async quickMatch() {
        const user = authService.getCurrentUser();
        if (!user) {
            this.showError('Vui lòng đăng nhập để chơi online');
            return;
        }

        // Find available room or create new one
        const availableRooms = await roomService.getAvailableRooms();
        
        if (availableRooms.success && availableRooms.rooms.length > 0) {
            // Join first available room
            const room = availableRooms.rooms[0];
            const playerData = {
                id: user.uid,
                name: user.displayName || 'Anonymous'
            };

            const result = await roomService.joinRoom(room.id, playerData);
            if (result.success) {
                this.currentRoom = room.id;
                this.isHost = false;
                this.showRoomLobby(result.room);
            }
        } else {
            // Create new room for quick match
            const roomData = {
                name: 'Quick Match',
                gameType: 'tetris',
                maxPlayers: 2,
                isPrivate: false,
                createdBy: user.uid,
                playerName: user.displayName || 'Anonymous'
            };

            const result = await roomService.createRoom(roomData);
            if (result.success) {
                this.currentRoom = result.roomId;
                this.isHost = true;
                this.showRoomLobby(result.room);
            }
        }
    }

    // Show room lobby
    showRoomLobby(room) {
        const lobby = this.createModal('room-lobby', `
            <div class="modal-header">
                <h2>🏠 ${room.name}</h2>
                <button class="modal-close" data-action="leave-room">&times;</button>
            </div>
            <div class="modal-body">
                <div class="room-info">
                    <div class="room-details">
                        <span class="game-type">🎮 ${this.getGameName(room.gameType)}</span>
                        <span class="player-count">👥 ${room.players.length}/${room.maxPlayers}</span>
                        <span class="room-status">${this.getStatusText(room.status)}</span>
                    </div>
                    
                    <div class="room-code">
                        <span>Mã phòng: <strong>${room.id}</strong></span>
                        <button class="btn btn-small" onclick="navigator.clipboard.writeText('${room.id}')">
                            📋 Copy
                        </button>
                    </div>
                </div>
                
                <div class="players-list">
                    <h3>Người chơi</h3>
                    <div id="players-container">
                        ${this.renderPlayersList(room.players)}
                    </div>
                </div>
                
                <div class="chat-section">
                    <h3>💬 Chat</h3>
                    <div id="chat-messages" class="chat-messages"></div>
                    <div class="chat-input">
                        <input type="text" id="chat-input" placeholder="Nhập tin nhắn...">
                        <button data-action="send-chat">Gửi</button>
                    </div>
                </div>
                
                <div class="room-actions">
                    ${this.isHost ? `
                        <button class="btn btn-primary" data-action="start-game" ${room.players.length < 2 ? 'disabled' : ''}>
                            Bắt đầu game
                        </button>
                    ` : `
                        <button class="btn btn-primary" data-action="ready" data-ready="false">
                            Sẵn sàng
                        </button>
                    `}
                </div>
            </div>
        `);

        this.showModal(lobby);
        this.currentRoom = room.id;
    }

    // Update room UI
    updateRoomUI(room) {
        const lobby = document.querySelector('#room-lobby');
        if (!lobby) return;

        // Update player count and status
        const playerCount = lobby.querySelector('.player-count');
        if (playerCount) {
            playerCount.textContent = `👥 ${room.players.length}/${room.maxPlayers}`;
        }

        const roomStatus = lobby.querySelector('.room-status');
        if (roomStatus) {
            roomStatus.textContent = this.getStatusText(room.status);
        }

        // Update players list
        const playersContainer = lobby.querySelector('#players-container');
        if (playersContainer) {
            playersContainer.innerHTML = this.renderPlayersList(room.players);
        }

        // Update start button
        const startButton = lobby.querySelector('[data-action="start-game"]');
        if (startButton) {
            startButton.disabled = room.players.length < 2;
        }
    }

    // Render players list
    renderPlayersList(players) {
        return players.map(player => `
            <div class="player-item ${player.isReady ? 'ready' : ''}">
                <div class="player-info">
                    <span class="player-name">${player.name}</span>
                    ${player.isHost ? '<span class="host-badge">👑</span>' : ''}
                </div>
                <div class="player-status">
                    ${player.isReady ? '<span class="ready-badge">✅</span>' : '<span class="waiting-badge">⏳</span>'}
                </div>
            </div>
        `).join('');
    }

    // Toggle ready status
    async toggleReady() {
        const user = authService.getCurrentUser();
        if (!user || !this.currentRoom) return;

        const button = document.querySelector('[data-action="ready"]');
        const isReady = button.getAttribute('data-ready') === 'true';
        
        const result = await roomService.updatePlayerReady(this.currentRoom, user.uid, !isReady);
        
        if (result.success) {
            button.setAttribute('data-ready', (!isReady).toString());
            button.textContent = isReady ? 'Sẵn sàng' : 'Chưa sẵn sàng';
            button.classList.toggle('ready', !isReady);
        }
    }

    // Send chat message
    async sendChatMessage() {
        const user = authService.getCurrentUser();
        if (!user || !this.currentRoom) return;

        const input = document.querySelector('#chat-input');
        const message = input.value.trim();
        
        if (!message) return;

        const result = await roomService.sendChatMessage(this.currentRoom, user.uid, message);
        
        if (result.success) {
            input.value = '';
        }
    }

    // Add chat message to UI
    addChatMessage(message) {
        const chatMessages = document.querySelector('#chat-messages');
        if (!chatMessages) return;

        const messageEl = document.createElement('div');
        messageEl.className = 'chat-message';
        messageEl.innerHTML = `
            <span class="message-time">${new Date().toLocaleTimeString()}</span>
            <span class="message-author">${message.playerName}:</span>
            <span class="message-text">${message.message}</span>
        `;

        chatMessages.appendChild(messageEl);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Start game
    startGame(gameState) {
        this.closeModal(document.querySelector('#room-lobby'));
        
        // Initialize game based on game type
        const room = roomService.getCurrentRoom();
        if (!room) return;

        this.currentGame = room.gameType;
        
        // Start the appropriate game
        switch (room.gameType) {
            case 'tetris':
                this.startTetrisGame(gameState);
                break;
            case 'snake':
                this.startSnakeGame(gameState);
                break;
            case 'memory':
                this.startMemoryGame(gameState);
                break;
            case 'caro':
                this.startCaroGame(gameState);
                break;
            case 'cards':
                this.startCardsGame(gameState);
                break;
        }
    }

    // Leave room
    async leaveRoom() {
        const user = authService.getCurrentUser();
        if (!user || !this.currentRoom) return;

        await roomService.leaveRoom(this.currentRoom, user.uid);
        this.currentRoom = null;
        this.isHost = false;
        
        this.closeModal(document.querySelector('#room-lobby'));
        this.showMainMenu();
    }

    // Load available rooms
    async loadAvailableRooms(container) {
        const result = await roomService.getAvailableRooms();
        
        if (result.success && result.rooms.length > 0) {
            container.innerHTML = result.rooms.map(room => `
                <div class="room-item" data-room-id="${room.id}">
                    <div class="room-name">${room.name}</div>
                    <div class="room-details">
                        <span class="game-type">${this.getGameName(room.gameType)}</span>
                        <span class="player-count">${room.playerCount}/${room.maxPlayers}</span>
                    </div>
                    <button class="btn btn-small join-room-btn" data-room-id="${room.id}">
                        Vào phòng
                    </button>
                </div>
            `).join('');

            // Add click handlers for join buttons
            container.querySelectorAll('.join-room-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const roomId = btn.getAttribute('data-room-id');
                    this.joinRoomById(roomId);
                });
            });
        } else {
            container.innerHTML = '<div class="no-rooms">Không có phòng nào khả dụng</div>';
        }
    }

    // Join room by ID
    async joinRoomById(roomId) {
        const user = authService.getCurrentUser();
        if (!user) return;

        const playerData = {
            id: user.uid,
            name: user.displayName || 'Anonymous'
        };

        const result = await roomService.joinRoom(roomId, playerData);
        
        if (result.success) {
            this.currentRoom = roomId;
            this.isHost = false;
            this.showRoomLobby(result.room);
            this.closeModal(document.querySelector('#join-room-modal'));
        } else {
            this.showError(result.error);
        }
    }

    // Utility methods
    getGameName(gameType) {
        const gameNames = {
            'tetris': '🧩 Tetris',
            'snake': '🐍 Snake',
            'memory': '🧠 Memory',
            'caro': '⭕ Caro',
            'cards': '🃏 Cards'
        };
        return gameNames[gameType] || gameType;
    }

    getStatusText(status) {
        const statusTexts = {
            'waiting': '⏳ Chờ người chơi',
            'starting': '🚀 Chuẩn bị bắt đầu',
            'playing': '🎮 Đang chơi',
            'finished': '🏁 Kết thúc'
        };
        return statusTexts[status] || status;
    }

    // Modal utilities
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
        return modal;
    }

    showModal(modal) {
        document.body.appendChild(modal);
        modal.classList.add('active');
    }

    closeModal(modal) {
        if (modal && modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
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

    showMainMenu() {
        // Show main menu or game hub
        const mainHub = document.getElementById('main-hub');
        if (mainHub) {
            mainHub.classList.add('active');
        }
    }

    // Game start methods (to be implemented per game)
    startTetrisGame(gameState) {
        // Initialize Tetris multiplayer
        console.log('Starting Tetris multiplayer game');
    }

    startSnakeGame(gameState) {
        // Initialize Snake multiplayer
        console.log('Starting Snake multiplayer game');
    }

    startMemoryGame(gameState) {
        // Initialize Memory multiplayer
        console.log('Starting Memory multiplayer game');
    }

    startCaroGame(gameState) {
        // Initialize Caro multiplayer
        console.log('Starting Caro multiplayer game');
    }

    startCardsGame(gameState) {
        // Initialize Cards multiplayer
        console.log('Starting Cards multiplayer game');
    }

    // Handle room deleted
    handleRoomDeleted(roomId) {
        if (this.currentRoom === roomId) {
            this.currentRoom = null;
            this.isHost = false;
            this.closeModal(document.querySelector('#room-lobby'));
            this.showError('Phòng đã bị xóa');
        }
    }

    // Update opponent state
    updateOpponentState(playerId, gameState) {
        // Update opponent's game state in the current game
        console.log('Opponent state updated:', playerId, gameState);
    }
}

// Create singleton instance
const onlineUI = new OnlineUI();
export default onlineUI;
