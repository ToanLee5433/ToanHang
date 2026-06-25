// Socket.io Client for Multiplayer
class SocketManager {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.roomId = null;
        this.playerId = null;
        this.opponentId = null;
        
        this.onConnect = () => {};
        this.onDisconnect = () => {};
        this.onJoinRoom = () => {};
        this.onLeaveRoom = () => {};
        this.onPlayerJoined = () => {};
        this.onPlayerLeft = () => {};
        this.onGameStart = () => {};
        this.onGameState = () => {};
        this.onGarbageLines = () => {};
        this.onGameEnd = () => {};
        this.onError = () => {};
    }

    // Connect to server
    connect(serverUrl = 'http://localhost:3001') {
        try {
            this.socket = io(serverUrl);
            this.setupEventListeners();
            console.log('Connecting to server...');
        } catch (error) {
            console.error('Failed to connect to server:', error);
            this.onError('Không thể kết nối đến máy chủ');
        }
    }

    // Set up socket event listeners
    setupEventListeners() {
        this.socket.on('connect', () => {
            this.isConnected = true;
            this.playerId = this.socket.id;
            console.log('Connected to server');
            this.onConnect();
        });

        this.socket.on('disconnect', () => {
            this.isConnected = false;
            console.log('Disconnected from server');
            this.onDisconnect();
        });

        this.socket.on('roomJoined', (data) => {
            this.roomId = data.roomId;
            console.log('Joined room:', data.roomId);
            this.onJoinRoom(data);
        });

        this.socket.on('roomLeft', () => {
            this.roomId = null;
            console.log('Left room');
            this.onLeaveRoom();
        });

        this.socket.on('playerJoined', (data) => {
            this.opponentId = data.playerId;
            console.log('Player joined:', data.playerId);
            this.onPlayerJoined(data);
        });

        this.socket.on('playerLeft', (data) => {
            this.opponentId = null;
            console.log('Player left:', data.playerId);
            this.onPlayerLeft(data);
        });

        this.socket.on('gameStart', (data) => {
            console.log('Game starting');
            this.onGameStart(data);
        });

        this.socket.on('gameState', (data) => {
            this.onGameState(data);
        });

        this.socket.on('garbageLines', (data) => {
            console.log('Received garbage lines:', data.lines);
            this.onGarbageLines(data);
        });

        this.socket.on('gameEnd', (data) => {
            console.log('Game ended:', data);
            this.onGameEnd(data);
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
            this.onError(error);
        });
    }

    // Join a room
    joinRoom(roomId) {
        if (this.isConnected) {
            this.socket.emit('joinRoom', { roomId });
        }
    }

    // Create a room
    createRoom() {
        if (this.isConnected) {
            this.socket.emit('createRoom');
        }
    }

    // Leave current room
    leaveRoom() {
        if (this.isConnected && this.roomId) {
            this.socket.emit('leaveRoom', { roomId: this.roomId });
        }
    }

    // Send game state
    sendGameState(gameState) {
        if (this.isConnected && this.roomId) {
            this.socket.emit('gameState', {
                roomId: this.roomId,
                gameState: gameState
            });
        }
    }

    // Send garbage lines to opponent
    sendGarbageLines(lines) {
        if (this.isConnected && this.roomId) {
            this.socket.emit('garbageLines', {
                roomId: this.roomId,
                lines: lines
            });
        }
    }

    // Send game end
    sendGameEnd(result) {
        if (this.isConnected && this.roomId) {
            this.socket.emit('gameEnd', {
                roomId: this.roomId,
                result: result
            });
        }
    }

    // Disconnect from server
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            this.roomId = null;
            this.playerId = null;
            this.opponentId = null;
        }
    }
}

// Global socket manager instance
window.socketManager = new SocketManager();
