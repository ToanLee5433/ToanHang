// Room Service for Game Hub
import { 
    realtimeDb, 
    dbRef, 
    set, 
    get, 
    push, 
    onValue, 
    off,
    serverTimestamp 
} from '../config/firebase.js';

class RoomService {
    constructor() {
        this.currentRoom = null;
        this.roomListeners = [];
        this.gameListeners = [];
        this.roomsRef = dbRef(realtimeDb, 'rooms');
        this.activeRooms = new Map();
    }

    // Create a new room
    async createRoom(roomData) {
        try {
            const roomRef = push(this.roomsRef);
            const roomId = roomRef.key;
            
            const room = {
                id: roomId,
                name: roomData.name || `Phòng ${roomId.slice(-6)}`,
                gameType: roomData.gameType || 'tetris',
                maxPlayers: roomData.maxPlayers || 2,
                isPrivate: roomData.isPrivate || false,
                password: roomData.password || null,
                status: 'waiting', // waiting, playing, finished
                createdAt: serverTimestamp(),
                createdBy: roomData.createdBy,
                players: [{
                    id: roomData.createdBy,
                    name: roomData.playerName,
                    isHost: true,
                    isReady: false,
                    joinedAt: serverTimestamp()
                }],
                settings: {
                    gameMode: roomData.gameMode || 'classic',
                    difficulty: roomData.difficulty || 'normal',
                    timeLimit: roomData.timeLimit || null,
                    customRules: roomData.customRules || {}
                },
                gameState: null,
                chat: []
            };

            await set(roomRef, room);
            
            // Listen to room updates
            this.listenToRoom(roomId);
            
            this.currentRoom = roomId;
            return { success: true, roomId, room };
        } catch (error) {
            console.error('Error creating room:', error);
            return { success: false, error: error.message };
        }
    }

    // Join an existing room
    async joinRoom(roomId, playerData) {
        try {
            const roomRef = dbRef(realtimeDb, `rooms/${roomId}`);
            const roomSnapshot = await get(roomRef);
            
            if (!roomSnapshot.exists()) {
                throw new Error('Room not found');
            }

            const room = roomSnapshot.val();
            
            // Check if room is full
            if (room.players.length >= room.maxPlayers) {
                throw new Error('Room is full');
            }

            // Check if room is private and password is correct
            if (room.isPrivate && room.password !== playerData.password) {
                throw new Error('Incorrect password');
            }

            // Add player to room
            const newPlayer = {
                id: playerData.id,
                name: playerData.name,
                isHost: false,
                isReady: false,
                joinedAt: serverTimestamp()
            };

            room.players.push(newPlayer);
            await set(roomRef, room);

            // Listen to room updates
            this.listenToRoom(roomId);
            
            this.currentRoom = roomId;
            return { success: true, room };
        } catch (error) {
            console.error('Error joining room:', error);
            return { success: false, error: error.message };
        }
    }

    // Leave room
    async leaveRoom(roomId, playerId) {
        try {
            const roomRef = dbRef(realtimeDb, `rooms/${roomId}`);
            const roomSnapshot = await get(roomRef);
            
            if (!roomSnapshot.exists()) {
                return { success: true };
            }

            const room = roomSnapshot.val();
            
            // Remove player from room
            room.players = room.players.filter(p => p.id !== playerId);
            
            // If no players left, delete room
            if (room.players.length === 0) {
                await set(roomRef, null);
            } else {
                // If host left, assign new host
                if (room.players.every(p => !p.isHost)) {
                    room.players[0].isHost = true;
                }
                await set(roomRef, room);
            }

            // Stop listening to room
            this.stopListeningToRoom(roomId);
            
            if (this.currentRoom === roomId) {
                this.currentRoom = null;
            }

            return { success: true };
        } catch (error) {
            console.error('Error leaving room:', error);
            return { success: false, error: error.message };
        }
    }

    // Get available rooms
    async getAvailableRooms(gameType = null) {
        try {
            const roomsSnapshot = await get(this.roomsRef);
            const rooms = [];
            
            if (roomsSnapshot.exists()) {
                roomsSnapshot.forEach((childSnapshot) => {
                    const room = childSnapshot.val();
                    
                    // Filter by game type if specified
                    if (gameType && room.gameType !== gameType) {
                        return;
                    }
                    
                    // Only show public rooms that aren't full
                    if (!room.isPrivate && room.players.length < room.maxPlayers) {
                        rooms.push({
                            id: room.id,
                            name: room.name,
                            gameType: room.gameType,
                            playerCount: room.players.length,
                            maxPlayers: room.maxPlayers,
                            status: room.status,
                            createdAt: room.createdAt
                        });
                    }
                });
            }

            return { success: true, rooms };
        } catch (error) {
            console.error('Error getting available rooms:', error);
            return { success: false, error: error.message };
        }
    }

    // Update player ready status
    async updatePlayerReady(roomId, playerId, isReady) {
        try {
            const roomRef = dbRef(realtimeDb, `rooms/${roomId}`);
            const roomSnapshot = await get(roomRef);
            
            if (!roomSnapshot.exists()) {
                throw new Error('Room not found');
            }

            const room = roomSnapshot.val();
            
            // Update player ready status
            const playerIndex = room.players.findIndex(p => p.id === playerId);
            if (playerIndex !== -1) {
                room.players[playerIndex].isReady = isReady;
                
                // Check if all players are ready
                const allReady = room.players.length >= 2 && 
                               room.players.every(p => p.isReady);
                
                if (allReady && room.status === 'waiting') {
                    room.status = 'starting';
                    // Auto-start game after 3 seconds
                    setTimeout(() => {
                        this.startGame(roomId);
                    }, 3000);
                }
                
                await set(roomRef, room);
            }

            return { success: true };
        } catch (error) {
            console.error('Error updating player ready:', error);
            return { success: false, error: error.message };
        }
    }

    // Start game
    async startGame(roomId) {
        try {
            const roomRef = dbRef(realtimeDb, `rooms/${roomId}`);
            const roomSnapshot = await get(roomRef);
            
            if (!roomSnapshot.exists()) {
                throw new Error('Room not found');
            }

            const room = roomSnapshot.val();
            room.status = 'playing';
            room.gameStartTime = serverTimestamp();
            
            // Initialize game state based on game type
            room.gameState = this.initializeGameState(room.gameType, room.players);
            
            await set(roomRef, room);
            
            // Notify game listeners
            this.notifyGameListeners('gameStart', { roomId, gameState: room.gameState });
            
            return { success: true };
        } catch (error) {
            console.error('Error starting game:', error);
            return { success: false, error: error.message };
        }
    }

    // Update game state
    async updateGameState(roomId, playerId, gameState) {
        try {
            const roomRef = dbRef(realtimeDb, `rooms/${roomId}`);
            const roomSnapshot = await get(roomRef);
            
            if (!roomSnapshot.exists()) {
                throw new Error('Room not found');
            }

            const room = roomSnapshot.val();
            
            if (!room.gameState) {
                room.gameState = {};
            }
            
            // Update player's game state
            room.gameState[playerId] = {
                ...gameState,
                lastUpdate: serverTimestamp()
            };
            
            await set(roomRef, room);
            
            // Notify other players
            this.notifyGameListeners('gameStateUpdate', { 
                roomId, 
                playerId, 
                gameState: room.gameState[playerId] 
            });
            
            return { success: true };
        } catch (error) {
            console.error('Error updating game state:', error);
            return { success: false, error: error.message };
        }
    }

    // Send chat message
    async sendChatMessage(roomId, playerId, message) {
        try {
            const roomRef = dbRef(realtimeDb, `rooms/${roomId}`);
            const roomSnapshot = await get(roomRef);
            
            if (!roomSnapshot.exists()) {
                throw new Error('Room not found');
            }

            const room = roomSnapshot.val();
            const player = room.players.find(p => p.id === playerId);
            
            if (!player) {
                throw new Error('Player not found in room');
            }

            const chatMessage = {
                id: Date.now().toString(),
                playerId: playerId,
                playerName: player.name,
                message: message,
                timestamp: serverTimestamp()
            };

            if (!room.chat) {
                room.chat = [];
            }
            
            room.chat.push(chatMessage);
            
            // Keep only last 50 messages
            if (room.chat.length > 50) {
                room.chat = room.chat.slice(-50);
            }
            
            await set(roomRef, room);
            
            // Notify chat listeners
            this.notifyRoomListeners('chatMessage', { roomId, message: chatMessage });
            
            return { success: true };
        } catch (error) {
            console.error('Error sending chat message:', error);
            return { success: false, error: error.message };
        }
    }

    // Listen to room updates
    listenToRoom(roomId) {
        const roomRef = dbRef(realtimeDb, `rooms/${roomId}`);
        
        onValue(roomRef, (snapshot) => {
            if (snapshot.exists()) {
                const room = snapshot.val();
                this.activeRooms.set(roomId, room);
                this.notifyRoomListeners('roomUpdate', { roomId, room });
            } else {
                this.activeRooms.delete(roomId);
                this.notifyRoomListeners('roomDeleted', { roomId });
            }
        });
    }

    // Stop listening to room
    stopListeningToRoom(roomId) {
        const roomRef = dbRef(realtimeDb, `rooms/${roomId}`);
        off(roomRef);
        this.activeRooms.delete(roomId);
    }

    // Initialize game state based on game type
    initializeGameState(gameType, players) {
        const gameState = {};
        
        players.forEach(player => {
            switch (gameType) {
                case 'tetris':
                    gameState[player.id] = {
                        board: Array(20).fill().map(() => Array(10).fill(0)),
                        score: 0,
                        level: 1,
                        lines: 0,
                        currentPiece: null,
                        nextPiece: null,
                        gameOver: false
                    };
                    break;
                    
                case 'snake':
                    gameState[player.id] = {
                        snake: [{x: 5, y: 5}],
                        food: {x: 10, y: 10},
                        direction: {x: 1, y: 0},
                        score: 0,
                        gameOver: false
                    };
                    break;
                    
                case 'memory':
                    gameState[player.id] = {
                        cards: [],
                        flippedCards: [],
                        score: 0,
                        moves: 0,
                        gameOver: false
                    };
                    break;
                    
                case 'caro':
                    gameState[player.id] = {
                        board: Array(15).fill().map(() => Array(15).fill(null)),
                        currentPlayer: 'X',
                        gameOver: false,
                        winner: null
                    };
                    break;
                    
                default:
                    gameState[player.id] = {
                        score: 0,
                        gameOver: false
                    };
            }
        });
        
        return gameState;
    }

    // Add room listener
    onRoomUpdate(callback) {
        this.roomListeners.push(callback);
        
        return () => {
            const index = this.roomListeners.indexOf(callback);
            if (index > -1) {
                this.roomListeners.splice(index, 1);
            }
        };
    }

    // Add game listener
    onGameUpdate(callback) {
        this.gameListeners.push(callback);
        
        return () => {
            const index = this.gameListeners.indexOf(callback);
            if (index > -1) {
                this.gameListeners.splice(index, 1);
            }
        };
    }

    // Notify room listeners
    notifyRoomListeners(event, data) {
        this.roomListeners.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('Room listener error:', error);
            }
        });
    }

    // Notify game listeners
    notifyGameListeners(event, data) {
        this.gameListeners.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('Game listener error:', error);
            }
        });
    }

    // Get current room
    getCurrentRoom() {
        return this.currentRoom ? this.activeRooms.get(this.currentRoom) : null;
    }

    // Get all active rooms
    getActiveRooms() {
        return Array.from(this.activeRooms.values());
    }
}

// Create singleton instance
const roomService = new RoomService();
export default roomService;
