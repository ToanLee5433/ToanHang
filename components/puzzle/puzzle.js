// Enhanced Wood Block Puzzle Game with Modern Features
class WoodBlockPuzzle {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.boardSize = 8;
        this.cellSize = 40;
        this.board = [];
        this.currentPieces = [];
        this.draggedPiece = null;
        this.dragOffset = { x: 0, y: 0 };
        this.score = 0;
        this.linesCleared = 0;
        this.piecesPlaced = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.isPaused = false;
        this.isGameOver = false;
        this.gameMode = '8x8';
        this.piecesPlacedThisRound = 0;
        
        // Enhanced game features
        this.gameStats = {
            gamesPlayed: 0,
            totalScore: 0,
            bestScore: 0,
            totalLinesCleared: 0,
            totalPiecesPlaced: 0,
            bestCombo: 0,
            totalPlayTime: 0
        };
        this.startTime = null;
        this.particles = [];
        this.soundEnabled = true;
        this.effectsEnabled = true;
        
        // Special game modes
        this.fogMode = false;
        this.fogPosition = 'top';
        this.surpriseMode = false;
        this.surpriseObstacles = [];
        this.timeChallengeMode = false;
        this.timeLimit = 300; // 5 minutes
        this.timeRemaining = this.timeLimit;
        
        // Visual enhancements
        this.glowEffect = { active: false, intensity: 0 };
        this.screenShake = { intensity: 0, duration: 0 };
        this.backgroundPattern = 'wood';
        
        // Hint system
        this.hintEnabled = true;
        this.hintHighlight = null;
        this.autoHintTimer = null;
        
        // Enhanced piece definitions with larger and more complex pieces
        this.pieceTypes = [
            // Mega pieces (16+ blocks)
            { name: '4x4Square', blocks: this.generateSquareBlocks(4, 4), rarity: 'legendary' },
            { name: '5x3Rectangle', blocks: this.generateSquareBlocks(5, 3), rarity: 'epic' },
            { name: '3x5Rectangle', blocks: this.generateSquareBlocks(3, 5), rarity: 'epic' },
            
            // Large pieces (9-15 blocks)
            { name: '3x3Square', blocks: this.generateSquareBlocks(3, 3), rarity: 'rare' },
            { name: 'LargeL', blocks: [[0,0], [0,1], [0,2], [0,3], [1,3], [2,3], [3,3]], rarity: 'rare' },
            { name: 'LargeT', blocks: [[1,0], [1,1], [0,1], [2,1], [1,2], [1,3], [1,4]], rarity: 'rare' },
            { name: 'LargeU', blocks: [[0,0], [2,0], [0,1], [2,1], [0,2], [1,2], [2,2]], rarity: 'rare' },
            { name: 'Cross', blocks: [[1,0], [0,1], [1,1], [2,1], [1,2]], rarity: 'rare' },
            
            // Medium pieces (4-8 blocks)
            { name: 'Line4', blocks: [[0,0], [1,0], [2,0], [3,0]], rarity: 'common' },
            { name: 'LShape', blocks: [[0,0], [0,1], [1,1], [2,1]], rarity: 'common' },
            { name: 'TShape', blocks: [[1,0], [0,1], [1,1], [2,1]], rarity: 'common' },
            { name: 'Square2x2', blocks: [[0,0], [1,0], [0,1], [1,1]], rarity: 'common' },
            { name: 'ZShape', blocks: [[0,0], [1,0], [1,1], [2,1]], rarity: 'common' },
            { name: 'SShape', blocks: [[1,0], [2,0], [0,1], [1,1]], rarity: 'common' },
            
            // Small pieces (1-3 blocks)
            { name: 'Line3', blocks: [[0,0], [1,0], [2,0]], rarity: 'common' },
            { name: 'Line2', blocks: [[0,0], [1,0]], rarity: 'common' },
            { name: 'Corner', blocks: [[0,0], [1,0], [1,1]], rarity: 'common' },
            { name: 'Single', blocks: [[0,0]], rarity: 'common' },
            
            // Special shaped pieces
            { name: 'Plus', blocks: [[1,0], [0,1], [1,1], [2,1], [1,2]], rarity: 'uncommon' },
            { name: 'Stairs', blocks: [[0,0], [0,1], [1,1], [1,2], [2,2]], rarity: 'uncommon' },
            { name: 'Arrow', blocks: [[1,0], [0,1], [1,1], [2,1], [1,2], [1,3]], rarity: 'uncommon' },
            { name: 'Hook', blocks: [[0,0], [0,1], [0,2], [1,2], [2,2]], rarity: 'uncommon' }
        ];
        
        this.init();
    }
    
    generateSquareBlocks(width, height) {
        const blocks = [];
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                blocks.push([x, y]);
            }
        }
        return blocks;
    }
    
    
    init() {
        console.log('Enhanced Wood Block Puzzle initializing...');
        
        // Load game data
        this.loadSettings();
        this.loadStats();
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupGame());
        } else {
            this.setupGame();
        }
    }
    
    setupGame() {
        console.log('Setting up Enhanced Wood Block Puzzle...');
        
        this.canvas = document.getElementById('game-board');
        if (!this.canvas) {
            console.error('Game board canvas not found!');
            this.showErrorMessage('Không tìm thấy game board!');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('Canvas context not supported!');
            this.showErrorMessage('Trình duyệt không hỗ trợ Canvas!');
            return;
        }
        
        // Apply enhanced settings
        this.applySettings();
        
        // Update canvas size based on board size
        this.canvas.width = this.boardSize * this.cellSize;
        this.canvas.height = this.boardSize * this.cellSize;
        
        // Initialize enhanced board
        this.initializeBoard();
        
        // Generate enhanced pieces
        this.generateNewRound();
        
        // Set up enhanced event listeners
        this.setupEventListeners();
        this.setupAdvancedControls();
        
        // Add visual enhancements
        this.setupVisualEnhancements();
        
        // Start enhanced game
        this.startGame();
    }
    
    setupVisualEnhancements() {
        // Add wood texture and grain
        this.canvas.style.background = this.getWoodTexture();
        this.canvas.style.borderRadius = '12px';
        this.canvas.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)';
        
        // Enhanced board container
        const boardContainer = this.canvas.parentElement;
        if (boardContainer) {
            boardContainer.style.background = 'rgba(139, 69, 19, 0.1)';
            boardContainer.style.borderRadius = '16px';
            boardContainer.style.padding = '25px';
            boardContainer.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)';
        }
        
        // Enhanced piece slots
        this.enhancePieceSlots();
        
        // Add button enhancements
        this.addButtonEnhancements();
    }
    
    getWoodTexture() {
        return `
            linear-gradient(45deg, #DEB887 0%, #D2B48C 25%, #F5DEB3 50%, #DEB887 75%, #CD853F 100%),
            repeating-linear-gradient(90deg, 
                transparent, 
                transparent 2px, 
                rgba(139, 69, 19, 0.1) 2px, 
                rgba(139, 69, 19, 0.1) 3px
            )
        `;
    }
    
    enhancePieceSlots() {
        const piecesTray = document.getElementById('pieces-tray');
        if (piecesTray) {
            piecesTray.style.background = 'rgba(139, 69, 19, 0.05)';
            piecesTray.style.borderRadius = '15px';
            piecesTray.style.padding = '20px';
        }
    }
    
    addButtonEnhancements() {
        const buttons = document.querySelectorAll('.control-btn, .modal-btn');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'translateY(-3px) scale(1.05)';
                button.style.boxShadow = '0 12px 30px rgba(139, 69, 19, 0.3)';
                this.playSound('buttonHover');
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translateY(0) scale(1)';
                button.style.boxShadow = '0 8px 25px rgba(139, 69, 19, 0.2)';
            });
            
            button.addEventListener('click', () => {
                this.playSound('buttonClick');
                this.animateButtonPress(button);
            });
        });
    }
    
    setupAdvancedControls() {
        // Enhanced keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            switch (e.key.toLowerCase()) {
                case 'h':
                    this.showHint();
                    break;
                case 'r':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.restartGame();
                    }
                    break;
                case 'u':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.undoLastMove();
                    }
                    break;
                case 'm':
                    this.toggleSound();
                    break;
                case 'f':
                    this.toggleFullscreen();
                    break;
            }
        });
        
        // Enhanced touch controls
        this.setupEnhancedTouchControls();
        
        // Gesture recognition
        this.setupGestureRecognition();
    }
    
    setupEnhancedTouchControls() {
        let touchStartTime = 0;
        let touchStartPos = { x: 0, y: 0 };
        
        this.canvas.addEventListener('touchstart', (e) => {
            touchStartTime = Date.now();
            const touch = e.touches[0];
            touchStartPos.x = touch.clientX;
            touchStartPos.y = touch.clientY;
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            const touchDuration = Date.now() - touchStartTime;
            if (touchDuration > 500) { // Long press
                this.showHint();
                this.createLongPressEffect(touchStartPos.x, touchStartPos.y);
            }
        });
    }
    
    setupGestureRecognition() {
        // Double tap to restart
        let lastTapTime = 0;
        this.canvas.addEventListener('touchend', (e) => {
            const currentTime = Date.now();
            if (currentTime - lastTapTime < 300) { // Double tap
                this.showConfirmDialog('Bạn có muốn chơi lại không?', () => {
                    this.restartGame();
                });
            }
            lastTapTime = currentTime;
        });
    }
    
    loadSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('puzzle-settings') || '{}');
            this.gameMode = settings.gameMode || 'classic';
            
            // Set board size based on settings
            const boardSize = parseInt(settings.boardSize) || 8;
            this.boardSize = boardSize;
            
            // Adjust cell size based on board size
            if (this.boardSize === 12) {
                this.cellSize = 30; // Smaller cells for 12x12
            } else if (this.boardSize === 10) {
                this.cellSize = 35; // Medium cells for 10x10
            } else {
                this.cellSize = 40; // Larger cells for 8x8
            }
            
            // Set game mode specific features
            if (this.gameMode === 'fog') {
                this.fogMode = true;
                this.fogPosition = 'top';
            } else if (this.gameMode === 'surprise') {
                this.surpriseMode = true;
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }
    
    initializeBoard() {
        this.board = [];
        for (let y = 0; y < this.boardSize; y++) {
            this.board[y] = [];
            for (let x = 0; x < this.boardSize; x++) {
                this.board[y][x] = 0;
            }
        }
    }
    
    generateNewRound() {
        this.currentPieces = [];
        this.piecesPlacedThisRound = 0;
        
        // Generate exactly 3 pieces for this round
        for (let i = 0; i < 3; i++) {
            this.currentPieces.push(this.createRandomPiece());
        }
        this.updatePiecesTray();
    }
    
    createRandomPiece() {
        const pieceType = this.pieceTypes[Math.floor(Math.random() * this.pieceTypes.length)];
        return {
            ...pieceType,
            id: Date.now() + Math.random(),
            rotation: 0,
            blocks: [...pieceType.blocks]
        };
    }
    
    updatePiecesTray() {
        const tray = document.getElementById('pieces-tray');
        tray.innerHTML = '';
        
        this.currentPieces.forEach((piece, index) => {
            const slot = document.createElement('div');
            slot.className = 'piece-slot';
            slot.dataset.pieceIndex = index;
            
            const pieceCanvas = document.createElement('canvas');
            pieceCanvas.width = 120;
            pieceCanvas.height = 120;
            const pieceCtx = pieceCanvas.getContext('2d');
            
            this.drawPiecePreview(pieceCtx, piece);
            slot.appendChild(pieceCanvas);
            tray.appendChild(slot);
        });
    }
    
    drawPiecePreview(ctx, piece) {
        const blockSize = 18;
        const offsetX = 60 - (piece.blocks.length * blockSize) / 2;
        const offsetY = 60 - (piece.blocks.length * blockSize) / 2;
        
        // All pieces have the same wood color
        ctx.fillStyle = '#8B4513';
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        
        piece.blocks.forEach(block => {
            const x = offsetX + block[0] * blockSize;
            const y = offsetY + block[1] * blockSize;
            ctx.fillRect(x, y, blockSize, blockSize);
            ctx.strokeRect(x, y, blockSize, blockSize);
        });
    }
    
    setupEventListeners() {
        // Mouse events for dragging
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        
        // Control buttons - only pause button
        document.getElementById('pause-btn').addEventListener('click', () => this.togglePause());
        
        // Modal buttons
        document.getElementById('play-again-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('resume-btn').addEventListener('click', () => this.togglePause());
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
        

        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Add click events to piece slots
        this.addPieceSlotEvents();
    }
    

    
    addPieceSlotEvents() {
        const tray = document.getElementById('pieces-tray');
        tray.addEventListener('click', (e) => {
            const slot = e.target.closest('.piece-slot');
            if (slot) {
                const pieceIndex = parseInt(slot.dataset.pieceIndex);
                this.selectPiece(pieceIndex);
            }
        });
        
        // Add visual feedback for piece selection
        tray.addEventListener('mousedown', (e) => {
            const slot = e.target.closest('.piece-slot');
            if (slot) {
                slot.classList.add('piece-selected');
            }
        });
        
        tray.addEventListener('mouseup', (e) => {
            const slot = e.target.closest('.piece-slot');
            if (slot) {
                slot.classList.remove('piece-selected');
            }
        });
    }
    
    selectPiece(pieceIndex) {
        if (pieceIndex >= 0 && pieceIndex < this.currentPieces.length) {
            this.draggedPiece = this.currentPieces[pieceIndex];
            console.log('Selected piece:', this.draggedPiece.name);
            
            // Add visual feedback
            this.updatePieceSelectionUI(pieceIndex);
        }
    }
    
    updatePieceSelectionUI(selectedIndex) {
        // Remove selection from all slots
        const slots = document.querySelectorAll('.piece-slot');
        slots.forEach(slot => slot.classList.remove('piece-selected'));
        
        // Add selection to current slot
        if (selectedIndex >= 0 && selectedIndex < slots.length) {
            slots[selectedIndex].classList.add('piece-selected');
        }
    }
    
    handleMouseDown(e) {
        if (this.isPaused || this.isGameOver) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Check if clicking on a piece in the tray
        const pieceIndex = this.getPieceAtPosition(x, y);
        if (pieceIndex !== -1) {
            this.startDragging(pieceIndex, x, y);
        }
    }
    
    handleMouseMove(e) {
        if (this.isPaused || this.isGameOver || !this.draggedPiece) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.updateDragPosition(x, y);
    }
    
    handleMouseUp(e) {
        if (this.isPaused || this.isGameOver || !this.draggedPiece) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.endDragging(x, y);
    }
    
    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        const pieceIndex = this.getPieceAtPosition(x, y);
        if (pieceIndex !== -1) {
            this.startDragging(pieceIndex, x, y);
        }
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        if (!this.draggedPiece) return;
        
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        this.updateDragPosition(x, y);
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        if (!this.draggedPiece) return;
        
        const touch = e.changedTouches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        this.endDragging(x, y);
    }
    
    getPieceAtPosition(x, y) {
        // Check if position is within pieces tray area
        const tray = document.getElementById('pieces-tray');
        const trayRect = tray.getBoundingClientRect();
        
        // Convert canvas coordinates to page coordinates
        const canvasRect = this.canvas.getBoundingClientRect();
        const pageX = canvasRect.left + x;
        const pageY = canvasRect.top + y;
        
        // Check if click is within tray area
        if (pageX >= trayRect.left && pageX <= trayRect.right &&
            pageY >= trayRect.top && pageY <= trayRect.bottom) {
            
            const slots = tray.querySelectorAll('.piece-slot');
            for (let i = 0; i < slots.length; i++) {
                const slotRect = slots[i].getBoundingClientRect();
                if (pageX >= slotRect.left && pageX <= slotRect.right &&
                    pageY >= slotRect.top && pageY <= slotRect.bottom) {
                    return i;
                }
            }
        }
        
        return -1;
    }
    
    startDragging(pieceIndex, x, y) {
        this.draggedPiece = this.currentPieces[pieceIndex];
        this.dragOffset.x = x;
        this.dragOffset.y = y;
        
        // Add dragging class to piece slot
        const slots = document.querySelectorAll('.piece-slot');
        if (slots[pieceIndex]) {
            slots[pieceIndex].classList.add('dragging');
        }
        
        // Create floating piece element for better visual feedback
        this.createFloatingPiece();
        
        console.log('Started dragging piece:', this.draggedPiece.name);
    }
    
    updateDragPosition(x, y) {
        if (!this.draggedPiece) return;
        
        // Update drag position for visual feedback
        this.dragOffset.x = x;
        this.dragOffset.y = y;
        
        // Update floating piece position
        this.updateFloatingPiece(x, y);
        
        this.draw();
    }
    
    endDragging(x, y) {
        if (!this.draggedPiece) return;
        
        // Remove dragging class
        const slots = document.querySelectorAll('.piece-slot');
        slots.forEach(slot => slot.classList.remove('dragging'));
        
        // Remove floating piece
        this.removeFloatingPiece();
        
        // Check if piece can be placed on board
        const boardX = Math.floor(x / this.cellSize);
        const boardY = Math.floor(y / this.cellSize);
        
        if (this.canPlacePiece(this.draggedPiece, boardX, boardY)) {
            this.placePiece(this.draggedPiece, boardX, boardY);
            this.removePieceFromTray(this.draggedPiece);
            this.piecesPlacedThisRound++;
            
            // Add placement effect
            this.addPlacementEffect(boardX, boardY);
            
            // Check if all 3 pieces have been placed
            if (this.piecesPlacedThisRound >= 3) {
                this.checkLines();
                this.generateNewRound();
            }
        } else {
            // Add bounce back effect
            this.addBounceBackEffect();
        }
        
        this.draggedPiece = null;
        this.draw();
    }
    
    canPlacePiece(piece, boardX, boardY) {
        if (!piece) return false;
        
        for (let block of piece.blocks) {
            const x = boardX + block[0];
            const y = boardY + block[1];
            
            // Check bounds
            if (x < 0 || x >= this.boardSize || y < 0 || y >= this.boardSize) {
                return false;
            }
            
            // Check if cell is occupied
            if (this.board[y][x] !== 0) {
                return false;
            }
        }
        
        return true;
    }
    
    placePiece(piece, boardX, boardY) {
        for (let block of piece.blocks) {
            const x = boardX + block[0];
            const y = boardY + block[1];
            this.board[y][x] = 1; // Use 1 instead of color
        }
        
        this.piecesPlaced++;
        this.score += piece.blocks.length * 10;
        this.updateStats();
        
        // Play placement sound
        this.playSound('place');
    }
    
    removePieceFromTray(piece) {
        const index = this.currentPieces.findIndex(p => p.id === piece.id);
        if (index !== -1) {
            this.currentPieces.splice(index, 1);
            this.updatePiecesTray();
        }
    }
    
    checkLines() {
        let linesToClear = [];
        
        // Check rows
        for (let y = 0; y < this.boardSize; y++) {
            if (this.board[y].every(cell => cell !== 0)) {
                linesToClear.push({ type: 'row', index: y });
            }
        }
        
        // Check columns
        for (let x = 0; x < this.boardSize; x++) {
            let fullColumn = true;
            for (let y = 0; y < this.boardSize; y++) {
                if (this.board[y][x] === 0) {
                    fullColumn = false;
                    break;
                }
            }
            if (fullColumn) {
                linesToClear.push({ type: 'column', index: x });
            }
        }
        
        // Clear lines
        if (linesToClear.length > 0) {
            this.clearLines(linesToClear);
            this.linesCleared += linesToClear.length;
            this.combo++;
            this.maxCombo = Math.max(this.maxCombo, this.combo);
            
            // Calculate score
            const baseScore = linesToClear.length * 100;
            const comboBonus = this.combo * 50;
            this.score += baseScore + comboBonus;
            
            this.updateStats();
            
            // Play sound effect
            this.playSound('clear');
            
            // Handle game mode specific effects
            if (this.fogMode) {
                // Switch fog position
                this.fogPosition = this.fogPosition === 'top' ? 'bottom' : 'top';
            }
            
            if (this.surpriseMode) {
                // Add random obstacle
                this.addSurpriseObstacle();
            }
        } else {
            this.combo = 0;
            this.updateStats();
        }
    }
    
    clearLines(linesToClear) {
        for (let line of linesToClear) {
            if (line.type === 'row') {
                this.board[line.index] = new Array(this.boardSize).fill(0);
            } else if (line.type === 'column') {
                for (let y = 0; y < this.boardSize; y++) {
                    this.board[y][line.index] = 0;
                }
            }
        }
        
        // Add particles effect
        this.addClearEffect(linesToClear);
    }
    
    addClearEffect(linesToClear) {
        // Simple visual effect - could be enhanced with particles
        this.canvas.style.filter = 'brightness(1.5)';
        setTimeout(() => {
            this.canvas.style.filter = 'none';
        }, 200);
    }
    
    addSurpriseObstacle() {
        // Add a random obstacle to the board
        let attempts = 0;
        const maxAttempts = 50;
        
        while (attempts < maxAttempts) {
            const x = Math.floor(Math.random() * this.boardSize);
            const y = Math.floor(Math.random() * this.boardSize);
            
            if (this.board[y][x] === 0) {
                this.surpriseObstacles.push({ x, y });
                break;
            }
            attempts++;
        }
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.showModal('pause-modal');
        } else {
            this.hideModal('pause-modal');
        }
    }
    
    restartGame() {
        this.initializeBoard();
        this.generateNewRound();
        this.score = 0;
        this.linesCleared = 0;
        this.piecesPlaced = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.isPaused = false;
        this.isGameOver = false;
        this.piecesPlacedThisRound = 0;
        this.surpriseObstacles = []; // Clear surprise obstacles
        
        this.hideModal('pause-modal');
        this.hideModal('game-over-modal');
        
        this.updateStats();
        this.draw();
    }
    
    gameOver() {
        this.isGameOver = true;
        
        // Update final stats
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-lines').textContent = this.linesCleared;
        document.getElementById('final-pieces').textContent = this.piecesPlaced;
        document.getElementById('final-combo').textContent = this.maxCombo;
        
        this.showModal('game-over-modal');
        this.playSound('gameover');
        
        // Save stats
        this.saveStats();
    }
    
    saveStats() {
        try {
            const stats = JSON.parse(localStorage.getItem('puzzle-stats') || '{}');
            
            // Update high score
            if (this.score > (stats.highScore || 0)) {
                stats.highScore = this.score;
            }
            
            // Update games played
            stats.gamesPlayed = (stats.gamesPlayed || 0) + 1;
            
            // Update total lines cleared
            stats.totalLinesCleared = (stats.totalLinesCleared || 0) + this.linesCleared;
            
            // Update total pieces placed
            stats.totalPiecesPlaced = (stats.totalPiecesPlaced || 0) + this.piecesPlaced;
            
            localStorage.setItem('puzzle-stats', JSON.stringify(stats));
        } catch (error) {
            console.error('Error saving stats:', error);
        }
    }
    
    handleKeyPress(e) {
        if (this.isPaused || this.isGameOver) return;
        
        switch (e.key) {
            case ' ':
                e.preventDefault();
                this.togglePause();
                break;
        }
    }
    
    updateStats() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lines-cleared').textContent = this.linesCleared;
        document.getElementById('pieces-placed').textContent = this.piecesPlaced;
        document.getElementById('combo').textContent = this.combo;
    }
    
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
        }
    }
    
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
        }
    }
    
    playSound(type) {
        // Simple sound effects using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            switch (type) {
                case 'clear':
                    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
                    break;
                case 'place':
                    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
                    break;
                case 'bounce':
                    oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.2);
                    break;
                case 'gameover':
                    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.5);
                    break;
            }
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
            console.log('Audio not supported');
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#F5DEB3';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.drawGrid();
        
        // Draw board
        this.drawBoard();
        
        // Draw fog if in fog mode
        if (this.fogMode) {
            this.drawFog();
        }
        
        // Draw surprise obstacles if in surprise mode
        this.drawSurpriseObstacles();
        
        // Draw dragged piece
        if (this.draggedPiece) {
            this.drawDraggedPiece();
        }
    }
    
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(139, 69, 19, 0.3)';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i <= this.boardSize; i++) {
            // Vertical lines
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.cellSize, 0);
            this.ctx.lineTo(i * this.cellSize, this.canvas.height);
            this.ctx.stroke();
            
            // Horizontal lines
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.cellSize);
            this.ctx.lineTo(this.canvas.width, i * this.cellSize);
            this.ctx.stroke();
        }
    }
    
    drawBoard() {
        for (let y = 0; y < this.boardSize; y++) {
            for (let x = 0; x < this.boardSize; x++) {
                if (this.board[y][x] !== 0) {
                    this.drawBlock(x, y);
                }
            }
        }
    }
    
    drawFog() {
        const fogHeight = this.canvas.height / 2;
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        
        if (this.fogPosition === 'top') {
            gradient.addColorStop(0, 'rgba(169, 169, 169, 0.8)');
            gradient.addColorStop(0.5, 'rgba(169, 169, 169, 0.4)');
            gradient.addColorStop(1, 'rgba(169, 169, 169, 0)');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.canvas.width, fogHeight);
        } else {
            gradient.addColorStop(0, 'rgba(169, 169, 169, 0)');
            gradient.addColorStop(0.5, 'rgba(169, 169, 169, 0.4)');
            gradient.addColorStop(1, 'rgba(169, 169, 169, 0.8)');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, fogHeight, this.canvas.width, fogHeight);
        }
    }
    
    drawSurpriseObstacles() {
        if (!this.surpriseMode) return;
        
        this.ctx.fillStyle = '#FF6B6B';
        this.ctx.strokeStyle = '#E74C3C';
        this.ctx.lineWidth = 2;
        
        for (let obstacle of this.surpriseObstacles) {
            const x = obstacle.x * this.cellSize;
            const y = obstacle.y * this.cellSize;
            
            this.ctx.fillRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
            this.ctx.strokeRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
        }
    }
    
    drawBlock(x, y) {
        const pixelX = x * this.cellSize;
        const pixelY = y * this.cellSize;
        
        // Create wood gradient for 3D effect
        const gradient = this.ctx.createLinearGradient(
            pixelX, pixelY, 
            pixelX + this.cellSize, pixelY + this.cellSize
        );
        gradient.addColorStop(0, '#A0522D');   // Light wood
        gradient.addColorStop(0.3, '#8B4513'); // Medium wood
        gradient.addColorStop(0.7, '#654321'); // Dark wood
        gradient.addColorStop(1, '#8B4513');   // Medium wood
        
        // Draw main block with gradient
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(pixelX + 1, pixelY + 1, this.cellSize - 2, this.cellSize - 2);
        
        // Draw wood grain lines
        this.ctx.strokeStyle = 'rgba(101, 67, 33, 0.4)';
        this.ctx.lineWidth = 1;
        
        // Multiple grain lines for realistic wood texture
        for (let i = 0; i < 3; i++) {
            const offset = 2 + i * 3;
            this.ctx.beginPath();
            this.ctx.moveTo(pixelX + 2, pixelY + offset);
            this.ctx.lineTo(pixelX + this.cellSize - 2, pixelY + offset);
            this.ctx.stroke();
        }
        
        // Draw 3D highlight effect
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(pixelX + 1, pixelY + 1, this.cellSize - 2, this.cellSize - 2);
        
        // Add subtle inner shadow
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(pixelX + 2, pixelY + 2, this.cellSize - 4, this.cellSize - 4);
    }
    
    drawDraggedPiece() {
        if (!this.draggedPiece) return;
        
        const boardX = Math.floor(this.dragOffset.x / this.cellSize);
        const boardY = Math.floor(this.dragOffset.y / this.cellSize);
        
        // Check if piece can be placed at current position
        const canPlace = this.canPlacePiece(this.draggedPiece, boardX, boardY);
        
        // Draw piece at drag position with enhanced effects
        this.ctx.globalAlpha = 0.8;
        
        // Add glow effect based on placement possibility
        if (canPlace) {
            this.ctx.shadowColor = 'rgba(76, 175, 80, 0.6)';
            this.ctx.shadowBlur = 10;
        } else {
            this.ctx.shadowColor = 'rgba(244, 67, 54, 0.6)';
            this.ctx.shadowBlur = 8;
        }
        
        for (let block of this.draggedPiece.blocks) {
            const x = boardX + block[0];
            const y = boardY + block[1];
            
            if (x >= 0 && x < this.boardSize && y >= 0 && y < this.boardSize) {
                this.drawBlock(x, y);
            }
        }
        
        // Reset shadow and alpha
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.globalAlpha = 1.0;
        
        // Draw placement indicator
        if (canPlace) {
            this.drawPlacementIndicator(boardX, boardY);
        }
    }
    
    drawPlacementIndicator(x, y) {
        // Draw a subtle placement indicator
        this.ctx.strokeStyle = 'rgba(76, 175, 80, 0.8)';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([5, 5]);
        
        for (let block of this.draggedPiece.blocks) {
            const blockX = x + block[0];
            const blockY = y + block[1];
            
            if (blockX >= 0 && blockX < this.boardSize && blockY >= 0 && blockY < this.boardSize) {
                const pixelX = blockX * this.cellSize;
                const pixelY = blockY * this.cellSize;
                this.ctx.strokeRect(pixelX + 2, pixelY + 2, this.cellSize - 4, this.cellSize - 4);
            }
        }
        
        this.ctx.setLineDash([]);
    }
    
    startGame() {
        this.draw();
        this.updateStats();
        
        // Check for game over condition
        this.checkGameOver();
    }
    
    createFloatingPiece() {
        // Remove existing floating piece
        this.removeFloatingPiece();
        
        // Create floating piece element
        this.floatingPiece = document.createElement('div');
        this.floatingPiece.className = 'floating-piece';
        this.floatingPiece.style.position = 'fixed';
        this.floatingPiece.style.pointerEvents = 'none';
        this.floatingPiece.style.zIndex = '1000';
        this.floatingPiece.style.transform = 'translate(-50%, -50%)';
        this.floatingPiece.style.transition = 'none';
        
        // Create canvas for floating piece
        const canvas = document.createElement('canvas');
        canvas.width = 120;
        canvas.height = 120;
        const ctx = canvas.getContext('2d');
        
        // Draw piece with enhanced styling
        this.drawFloatingPiece(ctx, this.draggedPiece);
        
        this.floatingPiece.appendChild(canvas);
        document.body.appendChild(this.floatingPiece);
    }
    
    drawFloatingPiece(ctx, piece) {
        const blockSize = 18;
        const offsetX = 60 - (piece.blocks.length * blockSize) / 2;
        const offsetY = 60 - (piece.blocks.length * blockSize) / 2;
        
        // Enhanced wood texture with shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 4;
        
        // Wood color with gradient
        const gradient = ctx.createLinearGradient(0, 0, blockSize, blockSize);
        gradient.addColorStop(0, '#8B4513');
        gradient.addColorStop(0.5, '#A0522D');
        gradient.addColorStop(1, '#8B4513');
        
        ctx.fillStyle = gradient;
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        
        piece.blocks.forEach(block => {
            const x = offsetX + block[0] * blockSize;
            const y = offsetY + block[1] * blockSize;
            
            // Draw with rounded corners
            this.drawRoundedRect(ctx, x, y, blockSize, blockSize, 4);
            ctx.strokeRect(x, y, blockSize, blockSize);
        });
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }
    
    drawRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
    }
    
    updateFloatingPiece(x, y) {
        if (this.floatingPiece) {
            this.floatingPiece.style.left = x + 'px';
            this.floatingPiece.style.top = y + 'px';
            
            // Add rotation effect based on movement
            const rotation = Math.sin(Date.now() * 0.01) * 2;
            this.floatingPiece.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
        }
    }
    
    removeFloatingPiece() {
        if (this.floatingPiece) {
            this.floatingPiece.remove();
            this.floatingPiece = null;
        }
    }
    
    addPlacementEffect(x, y) {
        // Create placement particles
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'placement-particle';
            particle.style.position = 'absolute';
            particle.style.left = (x * this.cellSize + this.cellSize / 2) + 'px';
            particle.style.top = (y * this.cellSize + this.cellSize / 2) + 'px';
            particle.style.width = '4px';
            particle.style.height = '4px';
            particle.style.backgroundColor = '#FFD700';
            particle.style.borderRadius = '50%';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '999';
            
            const angle = (i / 8) * Math.PI * 2;
            const velocity = 50;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            
            this.canvas.parentElement.appendChild(particle);
            
            // Animate particle
            let startTime = Date.now();
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = elapsed / 500; // 500ms duration
                
                if (progress >= 1) {
                    particle.remove();
                    return;
                }
                
                const currentX = parseFloat(particle.style.left) + vx * 0.016; // 60fps
                const currentY = parseFloat(particle.style.top) + vy * 0.016;
                const opacity = 1 - progress;
                const scale = 1 - progress * 0.5;
                
                particle.style.left = currentX + 'px';
                particle.style.top = currentY + 'px';
                particle.style.opacity = opacity;
                particle.style.transform = `scale(${scale})`;
                
                requestAnimationFrame(animate);
            };
            
            requestAnimationFrame(animate);
        }
    }
    
    addBounceBackEffect() {
        // Add bounce back animation to piece slot
        const slots = document.querySelectorAll('.piece-slot');
        slots.forEach(slot => {
            if (slot.classList.contains('dragging')) {
                slot.style.animation = 'bounceBack 0.3s ease-out';
                setTimeout(() => {
                    slot.style.animation = '';
                }, 300);
            }
        });
        
        // Play bounce back sound
        this.playSound('bounce');
    }
    
    checkGameOver() {
        // Check if any remaining pieces can be placed
        for (let piece of this.currentPieces) {
            for (let y = 0; y < this.boardSize; y++) {
                for (let x = 0; x < this.boardSize; x++) {
                    if (this.canPlacePiece(piece, x, y)) {
                        return; // Found a valid move
                    }
                }
            }
        }
        
        // No valid moves found - game over
        this.gameOver();
    }
    
    showHint() {
        if (!this.settings.hintsEnabled || this.stats.hintsUsed >= this.stats.maxHints) {
            this.playSound('error');
            this.showMessage('Không còn gợi ý nào!', 'error');
            return;
        }
        
        this.playSound('hint');
        this.stats.hintsUsed++;
        this.updateStats();
        
        // Find best placement for current pieces
        const bestMove = this.findBestPlacement();
        
        if (bestMove) {
            // Highlight the best position
            this.highlightPosition(bestMove.row, bestMove.col, bestMove.piece);
            this.showMessage('Đặt miếng ghép vào vị trí được tô sáng!', 'info');
            
            // Remove highlight after 3 seconds
            setTimeout(() => {
                this.clearHighlight();
            }, 3000);
        } else {
            this.showMessage('Không tìm thấy vị trí phù hợp!', 'warning');
        }
    }
    
    findBestPlacement() {
        for (const piece of this.currentPieces) {
            if (!piece.placed) {
                for (let row = 0; row <= this.boardSize - piece.shape.length; row++) {
                    for (let col = 0; col <= this.boardSize - piece.shape[0].length; col++) {
                        if (this.canPlacePiece(piece, col, row)) {
                            // Calculate score for this placement
                            const score = this.calculatePlacementScore(piece, row, col);
                            return { row, col, piece, score };
                        }
                    }
                }
            }
        }
        return null;
    }
    
    calculatePlacementScore(piece, row, col) {
        let score = 0;
        
        // Prefer placements that create more complete rows/columns
        for (let r = 0; r < piece.shape.length; r++) {
            for (let c = 0; c < piece.shape[r].length; c++) {
                if (piece.shape[r][c]) {
                    const boardRow = row + r;
                    const boardCol = col + c;
                    
                    // Check row completion potential
                    let rowCount = 0;
                    for (let i = 0; i < this.boardSize; i++) {
                        if (this.board[boardRow][i] || (i === boardCol)) rowCount++;
                    }
                    score += rowCount * 10;
                    
                    // Check column completion potential
                    let colCount = 0;
                    for (let i = 0; i < this.boardSize; i++) {
                        if (this.board[i][boardCol] || (i === boardRow)) colCount++;
                    }
                    score += colCount * 10;
                }
            }
        }
        
        return score;
    }
    
    highlightPosition(row, col, piece) {
        this.hintHighlight = { row, col, piece };
        this.draw();
    }
    
    clearHighlight() {
        this.hintHighlight = null;
        this.draw();
    }
    
    undoLastMove() {
        if (this.moveHistory.length === 0) {
            this.playSound('error');
            this.showMessage('Không có nước đi nào để hoàn tác!', 'error');
            return;
        }
        
        const lastMove = this.moveHistory.pop();
        
        // Restore board state
        this.board = this.deepCopy(lastMove.boardState);
        
        // Restore piece
        lastMove.piece.placed = false;
        
        // Update stats
        this.stats.score = lastMove.score;
        this.stats.movesCount--;
        
        this.playSound('undo');
        this.updateStats();
        this.draw();
        this.showMessage('Đã hoàn tác nước đi!', 'success');
    }
    
    saveMove(piece, boardState, score) {
        this.moveHistory.push({
            piece: this.deepCopy(piece),
            boardState: this.deepCopy(boardState),
            score: score,
            timestamp: Date.now()
        });
        
        // Keep only last 10 moves
        if (this.moveHistory.length > 10) {
            this.moveHistory.shift();
        }
    }
    
    deepCopy(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => {
                this.playSound('buttonClick');
                this.showMessage('Chế độ toàn màn hình bật!', 'success');
            });
        } else {
            document.exitFullscreen().then(() => {
                this.playSound('buttonClick');
                this.showMessage('Thoát chế độ toàn màn hình!', 'info');
            });
        }
    }
    
    showConfirmDialog(message, onConfirm) {
        // Create modal dialog
        const dialog = document.createElement('div');
        dialog.className = 'confirm-dialog-overlay';
        dialog.innerHTML = `
            <div class="confirm-dialog">
                <h3>${message}</h3>
                <div class="dialog-buttons">
                    <button class="modal-btn confirm-btn">Có</button>
                    <button class="modal-btn cancel-btn">Không</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        const confirmBtn = dialog.querySelector('.confirm-btn');
        const cancelBtn = dialog.querySelector('.cancel-btn');
        
        confirmBtn.addEventListener('click', () => {
            onConfirm();
            document.body.removeChild(dialog);
            this.playSound('buttonClick');
        });
        
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(dialog);
            this.playSound('buttonClick');
        });
        
        // Add styles if not exist
        if (!document.querySelector('#confirm-dialog-styles')) {
            const styles = document.createElement('style');
            styles.id = 'confirm-dialog-styles';
            styles.textContent = `
                .confirm-dialog-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.7);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 10000;
                }
                .confirm-dialog {
                    background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%);
                    padding: 30px;
                    border-radius: 15px;
                    text-align: center;
                    color: white;
                    box-shadow: 0 15px 50px rgba(0,0,0,0.3);
                    max-width: 400px;
                    margin: 20px;
                }
                .confirm-dialog h3 {
                    margin: 0 0 20px 0;
                    font-size: 18px;
                }
                .dialog-buttons {
                    display: flex;
                    gap: 15px;
                    justify-content: center;
                }
                .dialog-buttons .modal-btn {
                    padding: 12px 24px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: all 0.2s ease;
                }
                .confirm-btn {
                    background: #4CAF50;
                    color: white;
                }
                .cancel-btn {
                    background: #f44336;
                    color: white;
                }
            `;
            document.head.appendChild(styles);
        }
    }
    
    createLongPressEffect(x, y) {
        // Create ripple effect for long press
        const ripple = document.createElement('div');
        ripple.style.position = 'fixed';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.width = '20px';
        ripple.style.height = '20px';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 215, 0, 0.6)';
        ripple.style.transform = 'translate(-50%, -50%)';
        ripple.style.pointerEvents = 'none';
        ripple.style.zIndex = '9999';
        ripple.style.animation = 'longPressRipple 0.6s ease-out forwards';
        
        document.body.appendChild(ripple);
        
        setTimeout(() => {
            document.body.removeChild(ripple);
        }, 600);
        
        // Add animation if not exist
        if (!document.querySelector('#long-press-styles')) {
            const styles = document.createElement('style');
            styles.id = 'long-press-styles';
            styles.textContent = `
                @keyframes longPressRipple {
                    to {
                        transform: translate(-50%, -50%) scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(styles);
        }
    }
    
    animateButtonPress(button) {
        button.style.transform = 'translateY(-3px) scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'translateY(-3px) scale(1.05)';
        }, 100);
    }
}

// Initialize Wood Block Puzzle when page loads
window.addEventListener('load', () => {
    window.puzzleGame = new WoodBlockPuzzle();
});
