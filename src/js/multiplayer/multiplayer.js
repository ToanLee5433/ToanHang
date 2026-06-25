// Multiplayer Game Manager
class MultiplayerGame {
    constructor() {
        this.game = null;
        this.opponentGame = null;
        this.isHost = false;
        this.roomId = null;
        this.opponentId = null;
        this.gameState = 'waiting'; // waiting, starting, playing, finished
        
        this.onGameStart = () => {};
        this.onOpponentUpdate = () => {};
        this.onGameEnd = () => {};
        this.onError = () => {};
        
        this.setupSocketHandlers();
    }

    // Set up socket event handlers
    setupSocketHandlers() {
        if (window.socketManager) {
            window.socketManager.onGameStart = (data) => {
                this.startGame(data);
            };
            
            window.socketManager.onGameState = (data) => {
                this.updateOpponentState(data);
            };
            
            window.socketManager.onGarbageLines = (data) => {
                this.receiveGarbageLines(data);
            };
            
            window.socketManager.onGameEnd = (data) => {
                this.handleGameEnd(data);
            };
            
            window.socketManager.onError = (error) => {
                this.onError(error);
            };
        }
    }

    // Start multiplayer game
    startMultiplayerGame(canvas, options = {}) {
        this.showScreen('multiplayer-game');
        
        // Initialize particle system
        if (window.initParticleSystem) {
            window.initParticleSystem(canvas);
        }
        
        // Create game instance
        this.game = new Game(canvas, {
            width: 10,
            height: 20,
            blockSize: 30,
            gameMode: 'multiplayer',
            onGameOver: (score, level, lines) => {
                this.handleGameOver(score, level, lines);
            },
            onScoreUpdate: (score, level, lines) => {
                this.updateScore(score, level, lines);
            },
            onLevelUp: (level) => {
                this.updateLevel(level);
            },
            onLineClear: (lines, combo) => {
                this.handleLineClear(lines, combo);
            }
        });
        
        // Connect to server
        if (window.socketManager) {
            window.socketManager.connect();
        }
    }

    // Create a room
    createRoom() {
        if (window.socketManager) {
            window.socketManager.createRoom();
            this.isHost = true;
        }
    }

    // Join a room
    joinRoom(roomId) {
        if (window.socketManager) {
            window.socketManager.joinRoom(roomId);
            this.isHost = false;
            this.roomId = roomId;
        }
    }

    // Start the game
    startGame(data) {
        this.gameState = 'playing';
        this.roomId = data.roomId;
        
        // Start the game
        this.game.start();
        
        // Update UI
        this.updateMultiplayerUI();
        
        this.onGameStart(data);
    }

    // Update opponent's game state
    updateOpponentState(data) {
        if (data.playerId !== window.socketManager.playerId) {
            // Update opponent's board display
            this.updateOpponentBoard(data.gameState);
            this.onOpponentUpdate(data);
        }
    }

    // Handle line clear and send garbage lines
    handleLineClear(lines, combo) {
        if (lines > 1) {
            const garbageLines = this.calculateGarbageLines(lines, combo);
            if (window.socketManager) {
                window.socketManager.sendGarbageLines(garbageLines);
            }
        }
    }

    // Calculate garbage lines based on lines cleared and combo
    calculateGarbageLines(lines, combo) {
        let garbageLines = 0;
        
        switch (lines) {
            case 2: // Double
                garbageLines = 1;
                break;
            case 3: // Triple
                garbageLines = 2;
                break;
            case 4: // Tetris
                garbageLines = 4;
                break;
        }
        
        // Add combo bonus
        if (combo > 0) {
            garbageLines += Math.floor(combo / 2);
        }
        
        return garbageLines;
    }

    // Receive garbage lines from opponent
    receiveGarbageLines(data) {
        if (this.game && this.game.isRunning) {
            this.game.addGarbageLines(data.lines);
        }
    }

    // Handle game over
    handleGameOver(score, level, lines) {
        this.gameState = 'finished';
        
        const result = {
            score: score,
            level: level,
            lines: lines,
            winner: false
        };
        
        // Send game end to opponent
        if (window.socketManager) {
            window.socketManager.sendGameEnd(result);
        }
        
        // Show game over modal
        this.showGameOverModal(result);
    }

    // Handle opponent's game end
    handleGameEnd(data) {
        this.gameState = 'finished';
        
        // Determine winner
        const isWinner = data.result.score < this.game.score;
        
        // Show game over modal
        this.showGameOverModal({
            score: this.game.score,
            level: this.game.level,
            lines: this.game.lines,
            winner: isWinner,
            opponentScore: data.result.score
        });
    }

    // Show game over modal
    showGameOverModal(result) {
        const modal = document.getElementById('game-over-modal');
        const title = document.getElementById('game-over-title');
        
        if (result.winner) {
            title.textContent = 'Chiến Thắng!';
            title.className = 'winner';
        } else {
            title.textContent = 'Thua Cuộc!';
            title.className = 'loser';
        }
        
        document.getElementById('final-score').textContent = result.score;
        document.getElementById('final-level').textContent = result.level;
        document.getElementById('final-lines').textContent = result.lines;
        
        if (result.opponentScore !== undefined) {
            const opponentScoreEl = document.getElementById('opponent-score');
            if (opponentScoreEl) {
                opponentScoreEl.textContent = result.opponentScore;
            }
        }
        
        this.showModal('game-over-modal');
    }

    // Update multiplayer UI
    updateMultiplayerUI() {
        // Update room info
        const roomInfo = document.getElementById('room-info');
        if (roomInfo) {
            roomInfo.textContent = `Phòng: ${this.roomId}`;
        }
        
        // Update player status
        const playerStatus = document.getElementById('player-status');
        if (playerStatus) {
            playerStatus.textContent = this.isHost ? 'Chủ phòng' : 'Người chơi';
        }
    }

    // Update opponent board display
    updateOpponentBoard(gameState) {
        const opponentCanvas = document.getElementById('opponent-canvas');
        if (opponentCanvas && gameState.board) {
            const ctx = opponentCanvas.getContext('2d');
            // Draw opponent's board state
            this.drawBoard(ctx, gameState.board, 20);
        }
    }

    // Draw board on canvas
    drawBoard(ctx, board, blockSize) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        for (let y = 0; y < board.length; y++) {
            for (let x = 0; x < board[y].length; x++) {
                if (board[y][x]) {
                    ctx.fillStyle = board[y][x];
                    ctx.fillRect(x * blockSize, y * blockSize, blockSize - 1, blockSize - 1);
                }
            }
        }
    }

    // Show screen
    showScreen(screenId) {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => screen.classList.remove('active'));
        
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
    }

    // Show modal
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    // Hide modal
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    // End multiplayer game
    endGame() {
        if (this.game) {
            this.game.stop();
        }
        
        if (window.socketManager) {
            window.socketManager.leaveRoom();
        }
        
        this.showScreen('main-menu');
    }
}

// Global multiplayer game instance
window.multiplayerGame = new MultiplayerGame();
