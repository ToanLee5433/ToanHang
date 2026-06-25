// Simple Tetris Game - Working Version
class SimpleTetrisGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.isGameStarted = false;
        this.isPaused = false;
        this.board = [];
        this.currentPiece = null;
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameLoop = null;
        this.dropTime = 0;
        this.lastTime = 0;
        
        this.init();
    }
    
    init() {
        console.log('Initializing Simple Tetris...');
        
        // Wait for DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    setup() {
        this.canvas = document.getElementById('game-canvas');
        if (!this.canvas) {
            console.error('Canvas not found!');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        
        // Initialize board
        this.board = Array(20).fill().map(() => Array(10).fill(0));
        
        // Set up controls
        this.setupControls();
        
        // Draw welcome screen
        this.drawWelcomeScreen();
        
        console.log('Tetris ready! Press SPACE to start.');
    }
    
    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.isGameStarted && e.code === 'Space') {
                e.preventDefault();
                this.startGame();
                return;
            }
            
            if (!this.isGameStarted || this.isPaused) return;
            
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
                case 'Escape':
                    e.preventDefault();
                    this.togglePause();
                    break;
            }
        });
        
        // Button handlers
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.togglePause());
        }
    }
    
    startGame() {
        console.log('Starting Tetris game...');
        this.isGameStarted = true;
        this.isPaused = false;
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.dropTime = 0;
        
        // Reset board
        this.board = Array(20).fill().map(() => Array(10).fill(0));
        
        // Create first piece
        this.spawnNewPiece();
        
        // Start game loop
        this.lastTime = performance.now();
        this.gameLoop = requestAnimationFrame((time) => this.update(time));
        
        // Update UI
        this.updateUI();
    }
    
    spawnNewPiece() {
        const pieces = [
            { shape: [[1,1,1,1]], color: '#00f0f0' }, // I
            { shape: [[1,1],[1,1]], color: '#f0f000' }, // O
            { shape: [[0,1,0],[1,1,1]], color: '#a000f0' }, // T
            { shape: [[0,1,1],[1,1,0]], color: '#00f000' }, // S
            { shape: [[1,1,0],[0,1,1]], color: '#f00000' }, // Z
            { shape: [[1,0,0],[1,1,1]], color: '#f0a000' }, // L
            { shape: [[0,0,1],[1,1,1]], color: '#0000f0' }  // J
        ];
        
        const piece = pieces[Math.floor(Math.random() * pieces.length)];
        this.currentPiece = {
            shape: piece.shape,
            color: piece.color,
            x: Math.floor((10 - piece.shape[0].length) / 2),
            y: 0
        };
        
        // Check game over
        if (!this.canMove(this.currentPiece, 0, 0)) {
            this.gameOver();
        }
    }
    
    update(time) {
        if (!this.isGameStarted || this.isPaused) {
            this.gameLoop = requestAnimationFrame((time) => this.update(time));
            return;
        }
        
        const deltaTime = time - this.lastTime;
        this.lastTime = time;
        this.dropTime += deltaTime;
        
        // Auto drop
        const dropInterval = Math.max(50, 1000 - (this.level - 1) * 50);
        if (this.dropTime > dropInterval) {
            this.movePiece(0, 1);
            this.dropTime = 0;
        }
        
        this.draw();
        this.gameLoop = requestAnimationFrame((time) => this.update(time));
    }
    
    movePiece(dx, dy) {
        if (!this.currentPiece) return false;
        
        if (this.canMove(this.currentPiece, dx, dy)) {
            this.currentPiece.x += dx;
            this.currentPiece.y += dy;
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
        
        if (!this.canMove(this.currentPiece, 0, 0)) {
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
        
        while (this.movePiece(0, 1)) {
            // Keep dropping
        }
    }
    
    canMove(piece, dx, dy) {
        const newX = piece.x + dx;
        const newY = piece.y + dy;
        
        for (let r = 0; r < piece.shape.length; r++) {
            for (let c = 0; c < piece.shape[r].length; c++) {
                if (piece.shape[r][c]) {
                    const boardX = newX + c;
                    const boardY = newY + r;
                    
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
            this.score += linesCleared * 100 * this.level;
            this.level = Math.floor(this.lines / 10) + 1;
            this.updateUI();
        }
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            document.getElementById('pause-modal')?.classList.remove('hidden');
        } else {
            document.getElementById('pause-modal')?.classList.add('hidden');
        }
    }
    
    gameOver() {
        this.isGameStarted = false;
        cancelAnimationFrame(this.gameLoop);
        
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-level').textContent = this.level;
        document.getElementById('final-lines').textContent = this.lines;
        
        document.getElementById('game-over-modal')?.classList.remove('hidden');
    }
    
    drawWelcomeScreen() {
        // Clear canvas
        this.ctx.fillStyle = '#f8f9fa';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.drawGrid();
        
        // Welcome message
        this.ctx.fillStyle = '#6f42c1';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🧩 TETRIS 🧩', this.canvas.width / 2, this.canvas.height / 2 - 40);
        
        this.ctx.fillStyle = '#495057';
        this.ctx.font = '14px Arial';
        this.ctx.fillText('Nhấn SPACE để bắt đầu', this.canvas.width / 2, this.canvas.height / 2 + 20);
        this.ctx.fillText('← → di chuyển • ↑ xoay • ↓ rơi nhanh', this.canvas.width / 2, this.canvas.height / 2 + 45);
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#f8f9fa';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.drawGrid();
        
        // Draw board
        this.drawBoard();
        
        // Draw current piece
        this.drawPiece();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#dee2e6';
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
        const cellWidth = this.canvas.width / 10;
        const cellHeight = this.canvas.height / 20;
        
        for (let r = 0; r < this.board.length; r++) {
            for (let c = 0; c < this.board[r].length; c++) {
                if (this.board[r][c]) {
                    this.ctx.fillStyle = this.board[r][c];
                    this.ctx.fillRect(c * cellWidth + 1, r * cellHeight + 1, cellWidth - 2, cellHeight - 2);
                }
            }
        }
    }
    
    drawPiece() {
        if (!this.currentPiece) return;
        
        const cellWidth = this.canvas.width / 10;
        const cellHeight = this.canvas.height / 20;
        
        this.ctx.fillStyle = this.currentPiece.color;
        
        for (let r = 0; r < this.currentPiece.shape.length; r++) {
            for (let c = 0; c < this.currentPiece.shape[r].length; c++) {
                if (this.currentPiece.shape[r][c]) {
                    const x = (this.currentPiece.x + c) * cellWidth;
                    const y = (this.currentPiece.y + r) * cellHeight;
                    this.ctx.fillRect(x + 1, y + 1, cellWidth - 2, cellHeight - 2);
                }
            }
        }
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lines').textContent = this.lines;
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Creating Tetris game instance...');
    window.tetrisGame = new SimpleTetrisGame();
});
