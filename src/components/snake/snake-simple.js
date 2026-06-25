// Simple Snake Game - Working Version
class SimpleSnakeGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.isGameStarted = false;
        this.isGameRunning = false;
        this.snake = [];
        this.food = null;
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.score = 0;
        this.gameSpeed = 150;
        this.cellSize = 20;
        this.gameLoop = null;
        
        this.init();
    }
    
    init() {
        console.log('Initializing Simple Snake...');
        
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
        
        // Calculate board size
        this.boardWidth = Math.floor(this.canvas.width / this.cellSize);
        this.boardHeight = Math.floor(this.canvas.height / this.cellSize);
        
        // Set up controls
        this.setupControls();
        
        // Draw welcome screen
        this.drawWelcomeScreen();
        
        console.log('Snake ready! Press SPACE to start.');
    }
    
    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.isGameStarted && e.code === 'Space') {
                e.preventDefault();
                this.startGame();
                return;
            }
            
            if (!this.isGameRunning) return;
            
            switch (e.code) {
                case 'ArrowUp':
                    e.preventDefault();
                    if (this.direction.y === 0) {
                        this.nextDirection = { x: 0, y: -1 };
                    }
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    if (this.direction.y === 0) {
                        this.nextDirection = { x: 0, y: 1 };
                    }
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    if (this.direction.x === 0) {
                        this.nextDirection = { x: -1, y: 0 };
                    }
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    if (this.direction.x === 0) {
                        this.nextDirection = { x: 1, y: 0 };
                    }
                    break;
                case 'Space':
                    e.preventDefault();
                    this.togglePause();
                    break;
            }
        });
    }
    
    startGame() {
        console.log('Starting Snake game...');
        this.isGameStarted = true;
        this.isGameRunning = true;
        this.score = 0;
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        
        // Initialize snake in center
        const centerX = Math.floor(this.boardWidth / 2);
        const centerY = Math.floor(this.boardHeight / 2);
        
        this.snake = [
            { x: centerX, y: centerY },
            { x: centerX - 1, y: centerY },
            { x: centerX - 2, y: centerY }
        ];
        
        // Generate first food
        this.generateFood();
        
        // Start game loop
        this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
        
        // Update UI
        this.updateScore();
    }
    
    update() {
        if (!this.isGameRunning) return;
        
        // Update direction
        this.direction = { ...this.nextDirection };
        
        // Get head position
        const head = { ...this.snake[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;
        
        // Check wall collision
        if (head.x < 0 || head.x >= this.boardWidth || 
            head.y < 0 || head.y >= this.boardHeight) {
            this.gameOver();
            return;
        }
        
        // Check self collision
        for (let segment of this.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                this.gameOver();
                return;
            }
        }
        
        // Add new head
        this.snake.unshift(head);
        
        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScore();
            this.generateFood();
            
            // Increase speed slightly
            if (this.gameSpeed > 80) {
                this.gameSpeed -= 2;
                clearInterval(this.gameLoop);
                this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
            }
        } else {
            // Remove tail if no food eaten
            this.snake.pop();
        }
        
        this.draw();
    }
    
    generateFood() {
        do {
            this.food = {
                x: Math.floor(Math.random() * this.boardWidth),
                y: Math.floor(Math.random() * this.boardHeight)
            };
        } while (this.isPositionOnSnake(this.food));
    }
    
    isPositionOnSnake(pos) {
        return this.snake.some(segment => 
            segment.x === pos.x && segment.y === pos.y
        );
    }
    
    togglePause() {
        this.isGameRunning = !this.isGameRunning;
        
        if (this.isGameRunning) {
            document.getElementById('pause-modal')?.classList.add('hidden');
        } else {
            document.getElementById('pause-modal')?.classList.remove('hidden');
        }
    }
    
    gameOver() {
        this.isGameRunning = false;
        this.isGameStarted = false;
        clearInterval(this.gameLoop);
        
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-length').textContent = this.snake.length;
        document.getElementById('game-over-modal')?.classList.remove('hidden');
    }
    
    drawWelcomeScreen() {
        // Clear canvas
        this.ctx.fillStyle = '#2d5016';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.drawGrid();
        
        // Welcome message
        this.ctx.fillStyle = '#8bc34a';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🐍 SNAKE HUNTER 🐍', this.canvas.width / 2, this.canvas.height / 2 - 40);
        
        this.ctx.fillStyle = '#cddc39';
        this.ctx.font = '16px Arial';
        this.ctx.fillText('Nhấn SPACE để bắt đầu', this.canvas.width / 2, this.canvas.height / 2 + 20);
        this.ctx.fillText('← → ↑ ↓ để điều khiển', this.canvas.width / 2, this.canvas.height / 2 + 45);
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#2d5016';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.drawGrid();
        
        // Draw snake
        this.drawSnake();
        
        // Draw food
        this.drawFood();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(139, 195, 74, 0.2)';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x <= this.canvas.width; x += this.cellSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.canvas.height; y += this.cellSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    drawSnake() {
        this.snake.forEach((segment, index) => {
            const x = segment.x * this.cellSize;
            const y = segment.y * this.cellSize;
            
            if (index === 0) {
                // Draw head
                this.ctx.fillStyle = '#8bc34a';
                this.ctx.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
                
                // Draw eyes
                this.ctx.fillStyle = '#2d5016';
                this.ctx.fillRect(x + 4, y + 4, 3, 3);
                this.ctx.fillRect(x + this.cellSize - 7, y + 4, 3, 3);
            } else {
                // Draw body
                this.ctx.fillStyle = '#689f38';
                this.ctx.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
            }
        });
    }
    
    drawFood() {
        if (!this.food) return;
        
        const x = this.food.x * this.cellSize;
        const y = this.food.y * this.cellSize;
        
        this.ctx.fillStyle = '#f44336';
        this.ctx.fillRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
        
        // Food highlight
        this.ctx.fillStyle = '#ff8a80';
        this.ctx.fillRect(x + 4, y + 4, this.cellSize - 8, this.cellSize - 8);
    }
    
    updateScore() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('length').textContent = this.snake.length;
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Creating Snake game instance...');
    window.snakeGame = new SimpleSnakeGame();
});
