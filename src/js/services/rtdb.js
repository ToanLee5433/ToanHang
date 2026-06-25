// ==========================================
// FIREBASE RTDB SERVICE - Dùng chung cho tất cả game online
// Realtime Database Multiplayer Service
// ==========================================

/**
 * Sử dụng Firebase Compat SDK (đã được init trong các HTML page)
 * Gọi: window.rtdbService.createRoom(...)
 */
class RTDBService {
    constructor() {
        this.db = null;
        this.currentRoomId = null;
        this.currentPlayerId = null;
        this.currentPlayerName = null;
        this.listeners = {};
        this.init();
    }

    init() {
        if (typeof firebase !== 'undefined') {
            try {
                this.db = firebase.database();
                console.log('✅ RTDBService: Firebase Realtime Database connected');
            } catch (e) {
                console.warn('⚠️ RTDBService: Firebase not initialized yet, will retry');
                setTimeout(() => this.init(), 500);
            }
        } else {
            console.warn('⚠️ RTDBService: Firebase SDK not loaded');
        }
    }

    isReady() { return this.db !== null; }

    /** Tạo room ID ngẫu nhiên 6 chữ số */
    generateRoomId() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    /** Tạo phòng mới */
    async createRoom(gameType, hostName, gameSettings = {}) {
        if (!this.isReady()) throw new Error('Firebase chưa kết nối');
        const roomId = this.generateRoomId();
        const playerId = 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        const roomData = {
            id: roomId,
            gameType,
            status: 'waiting', // waiting | playing | finished
            host: playerId,
            hostName,
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            settings: gameSettings,
            players: {
                [playerId]: {
                    id: playerId,
                    name: hostName,
                    isHost: true,
                    score: 0,
                    ready: true,
                    joinedAt: firebase.database.ServerValue.TIMESTAMP
                }
            },
            moves: {},
            messages: {},
            gameData: {}
        };

        await this.db.ref(`rooms/${gameType}/${roomId}`).set(roomData);
        this.currentRoomId = roomId;
        this.currentPlayerId = playerId;
        this.currentPlayerName = hostName;
        console.log(`✅ Room ${roomId} created for ${gameType}`);
        return { roomId, playerId };
    }

    /** Vào phòng có sẵn */
    async joinRoom(gameType, roomId, playerName) {
        if (!this.isReady()) throw new Error('Firebase chưa kết nối');
        const roomRef = this.db.ref(`rooms/${gameType}/${roomId}`);
        const snapshot = await roomRef.once('value');
        if (!snapshot.exists()) throw new Error('Phòng không tồn tại');
        const room = snapshot.val();
        if (room.status !== 'waiting') throw new Error('Phòng đã bắt đầu hoặc đã đóng');
        const playerCount = Object.keys(room.players || {}).length;
        const maxPlayers = room.settings?.maxPlayers || 2;
        if (playerCount >= maxPlayers) throw new Error('Phòng đã đầy');

        const playerId = 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        await roomRef.child(`players/${playerId}`).set({
            id: playerId,
            name: playerName,
            isHost: false,
            score: 0,
            ready: false,
            joinedAt: firebase.database.ServerValue.TIMESTAMP
        });

        this.currentRoomId = roomId;
        this.currentPlayerId = playerId;
        this.currentPlayerName = playerName;
        console.log(`✅ Joined room ${roomId} as ${playerName}`);
        return { roomId, playerId, room };
    }

    /** Lắng nghe thay đổi toàn bộ room */
    listenRoom(gameType, roomId, callback) {
        const ref = this.db.ref(`rooms/${gameType}/${roomId}`);
        const handler = ref.on('value', (snap) => {
            if (snap.exists()) callback(snap.val());
            else callback(null);
        });
        this.listeners[`room_${roomId}`] = { ref, handler, type: 'value' };
        return () => ref.off('value', handler);
    }

    /** Lắng nghe players */
    listenPlayers(gameType, roomId, callback) {
        const ref = this.db.ref(`rooms/${gameType}/${roomId}/players`);
        const handler = ref.on('value', (snap) => callback(snap.val() || {}));
        this.listeners[`players_${roomId}`] = { ref, handler, type: 'value' };
    }

    /** Lắng nghe moves mới */
    listenMoves(gameType, roomId, callback) {
        const ref = this.db.ref(`rooms/${gameType}/${roomId}/moves`);
        const handler = ref.on('child_added', (snap) => callback(snap.val(), snap.key));
        this.listeners[`moves_${roomId}`] = { ref, handler, type: 'child_added' };
    }

    /** Lắng nghe gameData */
    listenGameData(gameType, roomId, callback) {
        const ref = this.db.ref(`rooms/${gameType}/${roomId}/gameData`);
        const handler = ref.on('value', (snap) => callback(snap.val() || {}));
        this.listeners[`gameData_${roomId}`] = { ref, handler, type: 'value' };
    }

    /** Gửi nước đi */
    async sendMove(gameType, roomId, moveData) {
        if (!this.isReady()) return;
        const moveRef = this.db.ref(`rooms/${gameType}/${roomId}/moves`).push();
        await moveRef.set({
            playerId: this.currentPlayerId,
            playerName: this.currentPlayerName,
            ...moveData,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
    }

    /** Cập nhật gameData (trạng thái board...) */
    async updateGameData(gameType, roomId, data) {
        if (!this.isReady()) return;
        await this.db.ref(`rooms/${gameType}/${roomId}/gameData`).update(data);
    }

    /** Gửi tin nhắn chat */
    async sendMessage(gameType, roomId, message) {
        if (!this.isReady()) return;
        const msgRef = this.db.ref(`rooms/${gameType}/${roomId}/messages`).push();
        await msgRef.set({
            playerId: this.currentPlayerId,
            playerName: this.currentPlayerName,
            text: message,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
    }

    /** Lắng nghe chat */
    listenMessages(gameType, roomId, callback) {
        const ref = this.db.ref(`rooms/${gameType}/${roomId}/messages`);
        ref.on('child_added', (snap) => callback(snap.val()));
        this.listeners[`msg_${roomId}`] = { ref, type: 'child_added' };
    }

    /** Cập nhật trạng thái room */
    async updateRoomStatus(gameType, roomId, status) {
        if (!this.isReady()) return;
        await this.db.ref(`rooms/${gameType}/${roomId}/status`).set(status);
    }

    /** Cập nhật điểm người chơi */
    async updateScore(gameType, roomId, score) {
        if (!this.isReady() || !this.currentPlayerId) return;
        await this.db.ref(`rooms/${gameType}/${roomId}/players/${this.currentPlayerId}/score`).set(score);
    }

    /** Đánh dấu ready */
    async setReady(gameType, roomId, ready = true) {
        if (!this.isReady() || !this.currentPlayerId) return;
        await this.db.ref(`rooms/${gameType}/${roomId}/players/${this.currentPlayerId}/ready`).set(ready);
    }

    /** Lấy danh sách phòng đang chờ */
    async getAvailableRooms(gameType) {
        if (!this.isReady()) return [];
        const snap = await this.db.ref(`rooms/${gameType}`).orderByChild('status').equalTo('waiting').once('value');
        if (!snap.exists()) return [];
        const rooms = [];
        snap.forEach(child => rooms.push(child.val()));
        return rooms;
    }

    /** Xóa room khi host rời */
    async deleteRoom(gameType, roomId) {
        if (!this.isReady()) return;
        await this.db.ref(`rooms/${gameType}/${roomId}`).remove();
    }

    /** Rời phòng */
    async leaveRoom(gameType, roomId) {
        if (!this.isReady() || !this.currentPlayerId) return;
        this.removeAllListeners();
        const roomSnap = await this.db.ref(`rooms/${gameType}/${roomId}`).once('value');
        if (!roomSnap.exists()) return;
        const room = roomSnap.val();
        if (room.host === this.currentPlayerId) {
            await this.deleteRoom(gameType, roomId);
        } else {
            await this.db.ref(`rooms/${gameType}/${roomId}/players/${this.currentPlayerId}`).remove();
        }
        this.currentRoomId = null;
        this.currentPlayerId = null;
    }

    /** Gỡ bỏ tất cả listeners */
    removeAllListeners() {
        Object.values(this.listeners).forEach(({ ref, handler, type }) => {
            if (ref && handler) ref.off(type, handler);
        });
        this.listeners = {};
    }

    /** Format danh sách phòng ra HTML */
    renderRoomList(rooms, onJoin) {
        if (rooms.length === 0) return '<p style="text-align:center;color:#aaa;">Chưa có phòng nào. Hãy tạo phòng mới!</p>';
        return rooms.map(room => {
            const playerCount = Object.keys(room.players || {}).length;
            const maxPlayers = room.settings?.maxPlayers || 2;
            return `
                <div style="display:flex;align-items:center;justify-content:space-between;
                    padding:12px 16px;margin:8px 0;border-radius:10px;
                    background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);">
                    <div>
                        <div style="font-weight:700;font-size:1rem;">Phòng #${room.id}</div>
                        <div style="font-size:0.85rem;color:#ccc;">Host: ${room.hostName} • ${playerCount}/${maxPlayers} người</div>
                    </div>
                    <button onclick="(${onJoin.toString()})('${room.id}')"
                        style="background:linear-gradient(135deg,#ff3385,#d633ff);color:#fff;border:none;
                        padding:8px 18px;border-radius:8px;cursor:pointer;font-weight:700;font-size:0.85rem;">
                        Vào phòng
                    </button>
                </div>`;
        }).join('');
    }
}

// Global singleton
window.rtdbService = new RTDBService();
