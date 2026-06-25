// Simple Wood Block Puzzle Game - Working Version
class SimpleWoodBlockPuzzle {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.isGameStarted = false;
        this.score = 0;
        this.board = [];
        this.currentPieces = [];
        this.selectedPiece = null;
        this.dragOffset = { x: 0, y: 0 };
        this.isDragging = false;
        this.cellSize = 30;
        this.boardSize = 10;
        
        this.init();
    }
    
    init() {
        console.log('Initializing Simple Wood Block Puzzle...');
        
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
        
        // Initialize empty board
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(0));
        
        // Set up controls
        this.setupControls();
        
        // Draw welcome screen
        this.drawWelcomeScreen();
        
        console.log('Wood Block Puzzle ready! Press SPACE to start.');
    }
    
    setupControls() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (!this.isGameStarted && e.code === 'Space') {
                e.preventDefault();
                this.startGame();
                return;
            }
        });
        
        // Mouse controls
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        
        // Touch controls
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    }
    
    startGame() {
        console.log('Starting Wood Block Puzzle...');
        this.isGameStarted = true;
        this.score = 0;
        
        // Reset board
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(0));
        
        // Generate initial pieces
        this.generateNewPieces();
        
        // Update UI
        this.updateScore();
        this.draw();
    }
    
    generateNewPieces() {
        this.currentPieces = [];
        
        // Simple piece shapes
        const pieceShapes = [
            [[1]], // 1x1
            [[1, 1]], // 1x2
            [[1], [1]], // 2x1
            [[1, 1], [1, 1]], // 2x2
            [[1, 1, 1]], // 1x3
            [[1], [1], [1]], // 3x1
            [[1, 1, 1], [1, 0, 0]], // L shape
            [[1, 1, 1], [0, 0, 1]], // reverse L
            [[1, 1, 0], [0, 1, 1]] // Z shape
        ];
        
        // Generate 3 random pieces
        for (let i = 0; i < 3; i++) {
            const shape = pieceShapes[Math.floor(Math.random() * pieceShapes.length)];
            const piece = {
                shape: shape,
                x: 50 + i * 150,
                y: 450,
                color: this.getRandomColor(),
                placed: false,
                originalX: 50 + i * 150,
                originalY: 450
            };
            this.currentPieces.push(piece);
        }
    }
    
    getRandomColor() {
        const colors = ['#8B4513', '#A0522D', '#CD853F', '#D2691E', '#DEB887'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    handleMouseDown(e) {
        if (!this.isGameStarted) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Check if clicking on a piece
        for (let piece of this.currentPieces) {
            if (!piece.placed && this.isPointInPiece(x, y, piece)) {
                this.selectedPiece = piece;
                this.isDragging = true;
                this.dragOffset.x = x - piece.x;
                this.dragOffset.y = y - piece.y;
                break;
            }
        }
    }
    
    handleMouseMove(e) {
        if (!this.isDragging || !this.selectedPiece) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.selectedPiece.x = x - this.dragOffset.x;
        this.selectedPiece.y = y - this.dragOffset.y;
        
        this.draw();
    }
    
    handleMouseUp(e) {
        if (!this.isDragging || !this.selectedPiece) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Try to place piece on board
        const boardX = Math.floor(x / this.cellSize);
        const boardY = Math.floor(y / this.cellSize);
        
        if (this.canPlacePiece(this.selectedPiece, boardX, boardY)) {
            this.placePiece(this.selectedPiece, boardX, boardY);
            this.selectedPiece.placed = true;
            this.score += this.calculatePieceScore(this.selectedPiece);
            this.updateScore();
            this.checkForCompleteLines();
            
            // Check if all pieces are placed
            if (this.currentPieces.every(piece => piece.placed)) {
                this.generateNewPieces();
            }
        } else {
            // Return piece to original position
            this.selectedPiece.x = this.selectedPiece.originalX;
            this.selectedPiece.y = this.selectedPiece.originalY;
        }
        
        this.isDragging = false;
        this.selectedPiece = null;
        this.draw();
    }
    
    // Touch event handlers
    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.handleMouseDown({
            clientX: touch.clientX,
            clientY: touch.clientY
        });
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.handleMouseMove({
            clientX: touch.clientX,
            clientY: touch.clientY
        });
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        const touch = e.changedTouches[0];
        this.handleMouseUp({
            clientX: touch.clientX,
            clientY: touch.clientY
        });
    }
    
    isPointInPiece(x, y, piece) {
        const pieceWidth = piece.shape[0].length * this.cellSize;
        const pieceHeight = piece.shape.length * this.cellSize;
        
        return x >= piece.x && x <= piece.x + pieceWidth &&
               y >= piece.y && y <= piece.y + pieceHeight;
    }
    
    canPlacePiece(piece, boardX, boardY) {
        for (let r = 0; r < piece.shape.length; r++) {
            for (let c = 0; c < piece.shape[r].length; c++) {
                if (piece.shape[r][c]) {
                    const newX = boardX + c;
                    const newY = boardY + r;
                    
                    if (newX < 0 || newX >= this.boardSize || 
                        newY < 0 || newY >= this.boardSize ||
                        this.board[newY][newX]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    
    placePiece(piece, boardX, boardY) {
        for (let r = 0; r < piece.shape.length; r++) {
            for (let c = 0; c < piece.shape[r].length; c++) {
                if (piece.shape[r][c]) {
                    this.board[boardY + r][boardX + c] = piece.color;
                }
            }
        }
    }
    
    calculatePieceScore(piece) {
        let cells = 0;
        for (let r = 0; r < piece.shape.length; r++) {
            for (let c = 0; c < piece.shape[r].length; c++) {
                if (piece.shape[r][c]) cells++;
            }
        }
        return cells * 10;
    }
    
    checkForCompleteLines() {
        let clearedLines = 0;
        
        // Check rows
        for (let r = this.boardSize - 1; r >= 0; r--) {
            if (this.board[r].every(cell => cell !== 0)) {
                this.board.splice(r, 1);
                this.board.unshift(Array(this.boardSize).fill(0));
                clearedLines++;
                r++; // Check same row again
            }
        }
        
        // Check columns
        for (let c = 0; c < this.boardSize; c++) {
            let columnFull = true;
            for (let r = 0; r < this.boardSize; r++) {
                if (this.board[r][c] === 0) {
                    columnFull = false;
                    break;
                }
            }
            if (columnFull) {
                for (let r = 0; r < this.boardSize; r++) {
                    this.board[r][c] = 0;
                }
                clearedLines++;
            }
        }
        
        if (clearedLines > 0) {
            this.score += clearedLines * 100;
            this.updateScore();
        }
    }
    
    drawWelcomeScreen() {
        // Clear canvas
        this.ctx.fillStyle = '#f5f5dc';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw board grid
        this.drawBoard();
        
        // Welcome message
        this.ctx.fillStyle = '#8B4513';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🧩 WOOD BLOCK PUZZLE 🧩', this.canvas.width / 2, this.canvas.height / 2 + 150);
        
        this.ctx.fillStyle = '#A0522D';
        this.ctx.font = '14px Arial';
        this.ctx.fillText('Nhấn SPACE để bắt đầu', this.canvas.width / 2, this.canvas.height / 2 + 180);
        this.ctx.fillText('Kéo thả khối gỗ vào bảng', this.canvas.width / 2, this.canvas.height / 2 + 200);
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#f5f5dc';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw board
        this.drawBoard();
        
        // Draw pieces
        this.drawPieces();
    }
    
    drawBoard() {
        // Draw grid
        this.ctx.strokeStyle = '#D2691E';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x <= this.boardSize; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.cellSize, 0);
            this.ctx.lineTo(x * this.cellSize, this.boardSize * this.cellSize);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.boardSize; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.cellSize);
            this.ctx.lineTo(this.boardSize * this.cellSize, y * this.cellSize);
            this.ctx.stroke();
        }
        
        // Draw placed blocks
        for (let r = 0; r < this.boardSize; r++) {
            for (let c = 0; c < this.boardSize; c++) {
                if (this.board[r][c]) {
                    this.ctx.fillStyle = this.board[r][c];
                    this.ctx.fillRect(c * this.cellSize + 1, r * this.cellSize + 1, 
                                    this.cellSize - 2, this.cellSize - 2);
                    
                    // Wood texture
                    this.ctx.strokeStyle = '#654321';
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(c * this.cellSize + 1, r * this.cellSize + 1, 
                                      this.cellSize - 2, this.cellSize - 2);
                }
            }
        }
    }
    
    drawPieces() {
        for (let piece of this.currentPieces) {
            if (!piece.placed) {
                this.drawPiece(piece);
            }
        }
    }
    
    drawPiece(piece) {
        this.ctx.fillStyle = piece.color;
        
        for (let r = 0; r < piece.shape.length; r++) {
            for (let c = 0; c < piece.shape[r].length; c++) {
                if (piece.shape[r][c]) {
                    const x = piece.x + c * this.cellSize;
                    const y = piece.y + r * this.cellSize;
                    
                    this.ctx.fillRect(x, y, this.cellSize - 2, this.cellSize - 2);
                    
                    // Wood texture
                    this.ctx.strokeStyle = '#654321';
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeRect(x, y, this.cellSize - 2, this.cellSize - 2);
                }
            }
        }
    }
    
    updateScore() {
        document.getElementById('score').textContent = this.score;
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Creating Wood Block Puzzle game instance...');
    window.puzzleGame = new SimpleWoodBlockPuzzle();
});
