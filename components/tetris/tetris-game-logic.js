// Simple Tetris Game Logic - No external dependencies
class TetrisGameLogic {
    constructor() {
        // Canvas elements
        this.canvas = null;
        this.ctx = null;
        this.nextCanvas = null;
        this.nextCtx = null;
        this.holdCanvas = null;
        this.holdCtx = null;
        
        // Game state
        this.gameState = 'playing';
        this.gameMode = 'classic';
        
        // Game data
        this.board = [];
        this.currentPiece = null;
        this.nextPiece = null;
        this.heldPiece = null;
        this.canHold = true;
        
        // Scoring and stats
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.combo = 0;
        this.startTime = 0;
        this.gameTime = 0;
        
        // Game mechanics
        this.dropTime = 0;
        this.lastTime = 0;
        this.gameLoop = null;
        this.dropInterval = 1000;
        
        // Tetromino definitions
        this.tetrominos = {
            I: { shape: [[1, 1, 1, 1]], color: '#00f0f0' },
            O: { shape: [[1, 1], [1, 1]], color: '#f0f000' },
            T: { shape: [[0, 1, 0], [1, 1, 1]], color: '#a000f0' },
            S: { shape: [[0, 1, 1], [1, 1, 0]], color: '#00f000' },
            Z: { shape: [[1, 1, 0], [0, 1, 1]], color: '#f00000' },
            J: { shape: [[1, 0, 0], [1, 1, 1]], color: '#0000f0' },
            L: { shape: [[0, 0, 1], [1, 1, 1]], color: '#f0a000' }
        };
        
        this.pieceBag = [];
        this.bagIndex = 0;
        
        this.init();
    }
    
    init() {
        console.log('Initializing Tetris Game Logic...');
        this.setup();
    }
    
    setup() {
        this.setupCanvases();
        this.setupEventListeners();
        this.generatePieceBag();
        this.determineGameMode();
        console.log('Tetris Game Logic ready!');
    }
    
    setupCanvases() {
        // Main game canvas
        this.canvas = document.getElementById('game-canvas') || document.getElementById('player-canvas');
        this.ctx = this.canvas?.getContext('2d');
        
        // Next piece canvas
        this.nextCanvas = document.getElementById('next-canvas');
        this.nextCtx = this.nextCanvas?.getContext('2d');
        
        // Hold piece canvas
        this.holdCanvas = document.getElementById('hold-canvas');
        this.holdCtx = this.holdCanvas?.getContext('2d');
        
        if (!this.canvas || !this.ctx) {
            console.error('Canvas not found!');
            return;
        }
        
        this.resizeCanvases();
        window.addEventListener('resize', () => this.resizeCanvases());
    }
    
    resizeCanvases() {
        if (this.canvas) {
            const container = this.canvas.parentElement;
            const maxWidth = Math.min(380, container.offsetWidth - 20);
            const scale = maxWidth / 300;
            
            this.canvas.style.width = maxWidth + 'px';
            this.canvas.style.height = (600 * scale) + 'px';
        }
        
        if (this.nextCanvas) {
            this.nextCanvas.style.width = '120px';
            this.nextCanvas.style.height = '120px';
        }
        
        if (this.holdCanvas) {
            this.holdCanvas.style.width = '120px';
            this.holdCanvas.style.height = '120px';
        }
    }
    
    setupEventListeners() {
        // Game controls
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // UI buttons
        document.getElementById('pause-btn')?.addEventListener('click', () => this.togglePause());
        document.getElementById('pause-game-btn')?.addEventListener('click', () => this.togglePause());
        document.getElementById('restart-btn')?.addEventListener('click', () => this.restartGame());
        document.getElementById('quit-btn')?.addEventListener('click', () => this.quitGame());
        
        // Modal buttons
        document.getElementById('resume-btn')?.addEventListener('click', () => this.resumeGame());
        document.getElementById('restart-modal-btn')?.addEventListener('click', () => this.restartGame());
        document.getElementById('play-again-btn')?.addEventListener('click', () => this.restartGame());
        document.getElementById('back-to-menu-btn')?.addEventListener('click', () => this.backToMenu());
        document.getElementById('quit-modal-btn')?.addEventListener('click', () => this.quitGame());
    }
    
    determineGameMode() {
        const urlParams = new URLSearchParams(window.location.search);
        this.gameMode = urlParams.get('mode') || 'classic';
        
        // Update UI to show current mode
        const gameModeElement = document.getElementById('game-mode');
        if (gameModeElement) {
            const modeNames = {
                'classic': 'Chế Độ Cổ Điển',
                'speed': 'Chế Độ Tốc Độ',
                'race': 'Chế Độ Chạy Đua'
            };
            gameModeElement.textContent = modeNames[this.gameMode] || 'Chế Độ Cổ Điển';
        }
    }
    
    startGame() {
        console.log(`Starting ${this.gameMode} mode...`);
        
        this.gameState = 'playing';
        
        // Reset game data
        this.board = Array(20).fill().map(() => Array(10).fill(0));
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.combo = 0;
        this.startTime = Date.now();
        this.gameTime = 0;
        this.dropTime = 0;
        this.canHold = true;
        this.heldPiece = null;
        
        // Generate pieces
        this.generatePieceBag();
        this.currentPiece = this.getNextPiece();
        this.nextPiece = this.getNextPiece();
        
        // Apply game mode settings
        this.applyGameMode();
        
        // Start game loop
        this.lastTime = performance.now();
        this.gameLoop = requestAnimationFrame((time) => this.update(time));
        
        // Update UI
        this.updateUI();
        this.draw();
        this.drawNextPiece();
        this.drawHoldPiece();
    }
    
    applyGameMode() {
        switch (this.gameMode) {
            case 'speed':
                this.dropInterval = 300;
                break;
            case 'race':
                this.dropInterval = 800;
                break;
            default:
                this.dropInterval = 1000;
        }
    }
    
    generatePieceBag() {
        const pieces = Object.keys(this.tetrominos);
        this.pieceBag = [];
        
        // Generate 7 pieces (one of each)
        for (let i = 0; i < 7; i++) {
            this.pieceBag.push(...pieces);
        }
        
        // Shuffle the bag
        for (let i = this.pieceBag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.pieceBag[i], this.pieceBag[j]] = [this.pieceBag[j], this.pieceBag[i]];
        }
        
        this.bagIndex = 0;
    }
    
    getNextPiece() {
        if (this.bagIndex >= this.pieceBag.length) {
            this.generatePieceBag();
        }
        
        const pieceType = this.pieceBag[this.bagIndex++];
        const tetromino = this.tetrominos[pieceType];
        
        return {
            type: pieceType,
            shape: tetromino.shape.map(row => [...row]),
            color: tetromino.color,
            x: Math.floor((10 - tetromino.shape[0].length) / 2),
            y: 0,
            rotation: 0
        };
    }
    
    update(time) {
        if (this.gameState !== 'playing') {
            this.gameLoop = requestAnimationFrame((time) => this.update(time));
            return;
        }
        
        const deltaTime = time - this.lastTime;
        this.lastTime = time;
        this.dropTime += deltaTime;
        this.gameTime = Date.now() - this.startTime;
        
        // Auto drop
        if (this.dropTime > this.dropInterval) {
            this.movePiece(0, 1);
            this.dropTime = 0;
        }
        
        // Update timer in UI smoothly on every frame
        const timeEl = document.getElementById('time');
        if (timeEl) {
            timeEl.textContent = this.formatTime(this.gameTime);
        }
        
        this.draw();
        this.gameLoop = requestAnimationFrame((time) => this.update(time));
    }
    
    handleKeyPress(e) {
        if (this.gameState !== 'playing') return;
        
        switch (e.code) {
            case 'ArrowLeft':
                e.preventDefault();
                this.movePiece(-1, 0);
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.movePiece(1, 0);
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.movePiece(0, 1);
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.rotatePiece();
                break;
            case 'Space':
                e.preventDefault();
                this.hardDrop();
                break;
            case 'KeyC':
                e.preventDefault();
                this.holdPiece();
                break;
            case 'KeyP':
            case 'Escape':
                e.preventDefault();
                this.togglePause();
                break;
        }
    }
    
    movePiece(dx, dy) {
        if (!this.currentPiece) return false;
        
        const newX = this.currentPiece.x + dx;
        const newY = this.currentPiece.y + dy;
        
        if (this.isValidPosition(this.currentPiece.shape, newX, newY)) {
            this.currentPiece.x = newX;
            this.currentPiece.y = newY;
            return true;
        } else if (dy > 0) {
            // Piece landed
            this.placePiece();
            this.clearLines();
            this.spawnNewPiece();
        }
        return false;
    }
    
    rotatePiece() {
        if (!this.currentPiece) return;
        
        const rotated = this.rotateMatrix(this.currentPiece.shape);
        const originalShape = this.currentPiece.shape;
        this.currentPiece.shape = rotated;
        
        // Try to place rotated piece
        if (this.isValidPosition(rotated, this.currentPiece.x, this.currentPiece.y)) {
            this.currentPiece.rotation = (this.currentPiece.rotation + 1) % 4;
        } else {
            // If no wall kick works, revert
            this.currentPiece.shape = originalShape;
        }
    }
    
    rotateMatrix(matrix) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const rotated = Array(cols).fill().map(() => Array(rows).fill(0));
        
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                rotated[c][rows - 1 - r] = matrix[r][c];
            }
        }
        return rotated;
    }
    
    hardDrop() {
        if (!this.currentPiece) return;
        
        let dropDistance = 0;
        while (this.movePiece(0, 1)) {
            dropDistance++;
        }
        
        // Bonus points for hard drop
        this.score += dropDistance * 2;
        this.updateUI();
    }
    
    holdPiece() {
        if (!this.canHold || !this.currentPiece) return;
        
        if (this.heldPiece) {
            // Swap pieces
            const temp = this.heldPiece;
            this.heldPiece = {
                type: this.currentPiece.type,
                shape: this.tetrominos[this.currentPiece.type].shape.map(row => [...row]),
                color: this.currentPiece.color,
                x: Math.floor((10 - this.tetrominos[this.currentPiece.type].shape[0].length) / 2),
                y: 0,
                rotation: 0
            };
            this.currentPiece = temp;
        } else {
            // First hold
            this.heldPiece = {
                type: this.currentPiece.type,
                shape: this.tetrominos[this.currentPiece.type].shape.map(row => [...row]),
                color: this.currentPiece.color,
                x: Math.floor((10 - this.tetrominos[this.currentPiece.type].shape[0].length) / 2),
                y: 0,
                rotation: 0
            };
            this.currentPiece = this.nextPiece;
            this.nextPiece = this.getNextPiece();
            this.drawNextPiece();
        }
        
        this.canHold = false;
        this.drawHoldPiece();
    }
    
    isValidPosition(shape, x, y) {
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c]) {
                    const boardX = x + c;
                    const boardY = y + r;
                    
                    if (boardX < 0 || boardX >= 10 || boardY >= 20) {
                        return false;
                    }
                    
                    if (boardY >= 0 && this.board[boardY][boardX]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    
    placePiece() {
        if (!this.currentPiece) return;
        
        for (let r = 0; r < this.currentPiece.shape.length; r++) {
            for (let c = 0; c < this.currentPiece.shape[r].length; c++) {
                if (this.currentPiece.shape[r][c]) {
                    const boardX = this.currentPiece.x + c;
                    const boardY = this.currentPiece.y + r;
                    
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.currentPiece.color;
                    }
                }
            }
        }
    }
    
    clearLines() {
        let linesCleared = 0;
        
        for (let r = this.board.length - 1; r >= 0; r--) {
            if (this.board[r].every(cell => cell !== 0)) {
                this.board.splice(r, 1);
                this.board.unshift(Array(10).fill(0));
                linesCleared++;
                r++; // Check the same row again
            }
        }
        
        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.combo++;
            
            // Fixed scoring system as requested
            const baseScores = [0, 100, 250, 400, 600];
            const baseScore = baseScores[linesCleared];
            const levelMultiplier = this.level;
            const comboBonus = this.combo * 50;
            
            this.score += (baseScore * levelMultiplier) + comboBonus;
            this.level = Math.floor(this.lines / 10) + 1;
            
            // Speed up game based on level
            this.dropInterval = Math.max(50, 1000 - (this.level - 1) * 100);
            
            this.updateUI();
        } else {
            this.combo = 0;
        }
    }
    
    spawnNewPiece() {
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.getNextPiece();
        this.canHold = true;
        
        // Check game over
        if (!this.isValidPosition(this.currentPiece.shape, this.currentPiece.x, this.currentPiece.y)) {
            this.gameOver();
        }
        
        this.drawNextPiece();
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            document.getElementById('pause-modal')?.classList.remove('hidden');
        } else if (this.gameState === 'paused') {
            this.resumeGame();
        }
    }
    
    resumeGame() {
        this.gameState = 'playing';
        document.getElementById('pause-modal')?.classList.add('hidden');
        this.lastTime = performance.now();
    }
    
    restartGame() {
        document.getElementById('game-over-modal')?.classList.add('hidden');
        document.getElementById('pause-modal')?.classList.add('hidden');
        this.startGame();
    }
    
    quitGame() {
        this.gameState = 'menu';
        document.getElementById('game-over-modal')?.classList.add('hidden');
        document.getElementById('pause-modal')?.classList.add('hidden');
        this.backToMenu();
    }
    
    backToMenu() {
        window.location.href = 'tetris-menu.html';
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        cancelAnimationFrame(this.gameLoop);
        
        // Update final stats
        const setElText = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };
        setElText('final-score', this.score);
        setElText('final-level', this.level);
        setElText('final-lines', this.lines);
        setElText('final-time', this.formatTime(this.gameTime));
        
        document.getElementById('game-over-modal')?.classList.remove('hidden');
        
        // Save high score
        this.saveHighScore();
    }
    
    saveHighScore() {
        const highScores = JSON.parse(localStorage.getItem('tetris-high-scores') || '[]');
        highScores.push({
            score: this.score,
            level: this.level,
            lines: this.lines,
            time: this.gameTime,
            mode: this.gameMode,
            date: new Date().toISOString()
        });
        
        highScores.sort((a, b) => b.score - a.score);
        highScores.splice(10); // Keep only top 10
        
        localStorage.setItem('tetris-high-scores', JSON.stringify(highScores));
    }
    
    // Drawing functions
    draw() {
        this.clearCanvas();
        this.drawGrid();
        this.drawBoard();
        this.drawCurrentPiece();
    }
    
    clearCanvas() {
        if (!this.ctx) return;
        this.ctx.fillStyle = '#090514'; // Premium dark background
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawGrid() {
        if (!this.ctx) return;
        
        this.ctx.strokeStyle = 'rgba(184, 41, 255, 0.08)'; // Glowing violet grid lines
        this.ctx.lineWidth = 1;
        
        const cellWidth = this.canvas.width / 10;
        const cellHeight = this.canvas.height / 20;
        
        for (let x = 0; x <= 10; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * cellWidth, 0);
            this.ctx.lineTo(x * cellWidth, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= 20; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * cellHeight);
            this.ctx.lineTo(this.canvas.width, y * cellHeight);
            this.ctx.stroke();
        }
    }
    
    drawBoard() {
        if (!this.ctx) return;
        
        const cellWidth = this.canvas.width / 10;
        const cellHeight = this.canvas.height / 20;
        
        for (let r = 0; r < this.board.length; r++) {
            for (let c = 0; c < this.board[r].length; c++) {
                if (this.board[r][c]) {
                    this.drawCell(c * cellWidth, r * cellHeight, cellWidth, cellHeight, this.board[r][c]);
                }
            }
        }
    }
    
    drawCurrentPiece() {
        if (!this.ctx || !this.currentPiece) return;
        this.drawPiece(this.currentPiece, this.canvas, this.ctx);
    }
    
    drawPiece(piece, canvas, ctx) {
        const isMainCanvas = (canvas === this.canvas);
        const cols = isMainCanvas ? 10 : 4;
        const rows = isMainCanvas ? 20 : 4;
        
        const cellWidth = canvas.width / cols;
        const cellHeight = canvas.height / rows;
        
        for (let r = 0; r < piece.shape.length; r++) {
            for (let c = 0; c < piece.shape[r].length; c++) {
                if (piece.shape[r][c]) {
                    const x = (piece.x + c) * cellWidth;
                    const y = (piece.y + r) * cellHeight;
                    this.drawCell(x, y, cellWidth, cellHeight, piece.color, ctx);
                }
            }
        }
    }
    
    drawCell(x, y, width, height, color, ctx) {
        const drawCtx = ctx || this.ctx;
        if (!drawCtx) return;
        
        // Create premium gradient for the cell
        const grad = drawCtx.createLinearGradient(x, y, x + width, y + height);
        grad.addColorStop(0, color);
        // Slightly darken the bottom-right corner for 3D look
        grad.addColorStop(1, this.adjustColorBrightness(color, -20));
        
        drawCtx.fillStyle = grad;
        drawCtx.fillRect(x + 1, y + 1, width - 2, height - 2);
        
        // Add glossy top-left highlight
        drawCtx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        drawCtx.fillRect(x + 2, y + 2, width - 4, 3);
        drawCtx.fillRect(x + 2, y + 2, 3, height - 4);
        
        // Add subtle bottom-right shadow inside the block
        drawCtx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        drawCtx.fillRect(x + width - 4, y + 2, 2, height - 4);
        drawCtx.fillRect(x + 2, y + height - 4, width - 4, 2);
        
        // Draw thin dark outline around the block
        drawCtx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
        drawCtx.lineWidth = 1;
        drawCtx.strokeRect(x + 1, y + 1, width - 2, height - 2);
    }
    
    // Helper to darken/lighten hex colors for 3D gradient effect
    adjustColorBrightness(hex, percent) {
        let num = parseInt(hex.replace("#", ""), 16),
            amt = Math.round(2.55 * percent),
            R = (num >> 16) + amt,
            G = (num >> 8 & 0x00FF) + amt,
            B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 0 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 0 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 0 ? 0 : B : 255)).toString(16).slice(1);
    }
    
    drawNextPiece() {
        if (!this.nextCtx || !this.nextPiece) return;
        
        this.nextCtx.fillStyle = '#090514'; // Premium dark background
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        // Draw subtle preview grid (4x4)
        this.nextCtx.strokeStyle = 'rgba(184, 41, 255, 0.04)';
        this.nextCtx.lineWidth = 1;
        const cellW = this.nextCanvas.width / 4;
        const cellH = this.nextCanvas.height / 4;
        for (let i = 1; i < 4; i++) {
            this.nextCtx.beginPath();
            this.nextCtx.moveTo(i * cellW, 0);
            this.nextCtx.lineTo(i * cellW, this.nextCanvas.height);
            this.nextCtx.stroke();
            this.nextCtx.beginPath();
            this.nextCtx.moveTo(0, i * cellH);
            this.nextCtx.lineTo(this.nextCanvas.width, i * cellH);
            this.nextCtx.stroke();
        }
        
        // Center the piece in the next canvas
        const piece = { ...this.nextPiece };
        const pieceWidth = piece.shape[0].length;
        const pieceHeight = piece.shape.length;
        
        // Use floating point division for smoother centering on the 4x4 preview grid
        piece.x = (4 - pieceWidth) / 2;
        piece.y = (4 - pieceHeight) / 2;
        
        this.drawPiece(piece, this.nextCanvas, this.nextCtx);
    }
    
    drawHoldPiece() {
        if (!this.holdCtx) return;
        
        this.holdCtx.fillStyle = '#090514'; // Premium dark background
        this.holdCtx.fillRect(0, 0, this.holdCanvas.width, this.holdCanvas.height);
        
        // Draw subtle hold grid (4x4)
        this.holdCtx.strokeStyle = 'rgba(184, 41, 255, 0.04)';
        this.holdCtx.lineWidth = 1;
        const cellW = this.holdCanvas.width / 4;
        const cellH = this.holdCanvas.height / 4;
        for (let i = 1; i < 4; i++) {
            this.holdCtx.beginPath();
            this.holdCtx.moveTo(i * cellW, 0);
            this.holdCtx.lineTo(i * cellW, this.holdCanvas.height);
            this.holdCtx.stroke();
            this.holdCtx.beginPath();
            this.holdCtx.moveTo(0, i * cellH);
            this.holdCtx.lineTo(this.holdCanvas.width, i * cellH);
            this.holdCtx.stroke();
        }
        
        if (!this.heldPiece) {
            // Draw a beautiful glowing placeholder text "GIỮ"
            this.holdCtx.fillStyle = 'rgba(184, 41, 255, 0.2)';
            this.holdCtx.font = 'bold 16px "Roboto", sans-serif';
            this.holdCtx.textAlign = 'center';
            this.holdCtx.textBaseline = 'middle';
            this.holdCtx.fillText('GIỮ', this.holdCanvas.width / 2, this.holdCanvas.height / 2);
            return;
        }
        
        // Center the piece in the hold canvas
        const piece = { ...this.heldPiece };
        const pieceWidth = piece.shape[0].length;
        const pieceHeight = piece.shape.length;
        
        piece.x = (4 - pieceWidth) / 2;
        piece.y = (4 - pieceHeight) / 2;
        
        this.drawPiece(piece, this.holdCanvas, this.holdCtx);
    }
    
    // Utility functions
    updateUI() {
        const setElText = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };
        // Update player stats
        setElText('score', this.score.toLocaleString());
        setElText('level', this.level);
        setElText('lines', this.lines);
        setElText('time', this.formatTime(this.gameTime));
        setElText('combo', this.combo);
        
        // Update player stats for online mode
        setElText('player-score', this.score.toLocaleString());
        setElText('player-level', this.level);
        setElText('player-lines', this.lines);
    }
    
    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}

// Initialize game when page loads (only on game pages)
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on game pages, not menu page
    if (!window.location.pathname.includes('tetris-menu.html')) {
        console.log('Creating Tetris Game Logic instance...');
        window.tetrisGame = new TetrisGameLogic();
        
        // Auto-start game after a short delay
        setTimeout(() => {
            if (window.tetrisGame) {
                window.tetrisGame.startGame();
            }
        }, 1000);
    }
});

