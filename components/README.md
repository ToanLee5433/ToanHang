# Game Components Structure

## 📁 Cấu trúc thư mục

```
src/components/
├── shared/
│   └── GameComponent.js          # Base class cho tất cả game components
├── tetris/
│   ├── TetrisComponent.js        # Tetris game component
│   ├── game.js                   # Tetris game logic
│   ├── board.js                  # Tetris board logic
│   ├── tetromino.js              # Tetris piece logic
│   ├── tetris.html               # Tetris game page
│   └── tetris-menu.html          # Tetris menu page
├── snake/
│   ├── SnakeComponent.js         # Snake game component
│   ├── snake.js                  # Snake game logic
│   ├── snake.html                # Snake game page
│   └── snake-menu.html           # Snake menu page
└── README.md                     # This file
```

## 🎯 Component Architecture

### GameComponent (Base Class)
- **File**: `shared/GameComponent.js`
- **Mục đích**: Class cơ sở cho tất cả game components
- **Tính năng**:
  - Quản lý trạng thái game (running, paused, game over)
  - Xử lý settings và localStorage
  - Quản lý score, level, lines, time
  - High score system
  - Sound và effects management
  - Lifecycle methods (init, start, pause, stop, destroy)

### TetrisComponent
- **File**: `tetris/TetrisComponent.js`
- **Kế thừa**: GameComponent
- **Tính năng**:
  - Tetris-specific game logic
  - Piece movement và rotation
  - Line clearing
  - Hold piece functionality
  - Touch controls cho mobile
  - Game over modal

### SnakeComponent
- **File**: `snake/SnakeComponent.js`
- **Kế thừa**: GameComponent
- **Tính năng**:
  - Snake-specific game logic
  - Movement và collision detection
  - Food generation và eating
  - Speed progression
  - Touch controls cho mobile
  - Game over modal

## 🚀 Cách sử dụng

### 1. Tạo game component mới

```javascript
// Tạo component mới kế thừa từ GameComponent
class NewGameComponent extends GameComponent {
    constructor(config = {}) {
        super('newgame', config);
        // Game-specific properties
    }

    init() {
        super.init();
        // Game-specific initialization
    }

    setupEventListeners() {
        // Game-specific event listeners
    }

    update() {
        super.update();
        // Game-specific update logic
    }

    render() {
        // Game-specific rendering
    }
}
```

### 2. Sử dụng trong HTML

```html
<!DOCTYPE html>
<html>
<head>
    <title>New Game</title>
</head>
<body>
    <!-- Game UI -->
    
    <script src="../shared/GameComponent.js"></script>
    <script src="NewGameComponent.js"></script>
    <script>
        window.addEventListener('load', () => {
            window.newGameComponent = new NewGameComponent();
            window.newGameComponent.init();
        });
    </script>
</body>
</html>
```

## 🔧 Tính năng chung

### Settings Management
```javascript
// Load settings
this.loadSettings();

// Save settings
this.saveSettings();

// Access settings
console.log(this.config.playerName);
console.log(this.config.soundEnabled);
```

### Score System
```javascript
// Update score
this.updateScore(100);

// Update level
this.updateLevel();

// Update lines
this.updateLines(4);
```

### High Score System
```javascript
// Save high score (tự động khi game over)
this.saveHighScore();

// Get high scores
const highScores = this.getHighScores();
```

### Sound & Effects
```javascript
// Play sound
this.playSound('move');

// Show effect
this.showEffect('line-clear');
```

## 📱 Mobile Support

Tất cả components đều hỗ trợ:
- **Touch controls** với swipe gestures
- **Responsive design**
- **Touch-friendly UI**

## 🎮 Game Controls

### Tetris Controls
- **Arrow Keys**: Move piece
- **Up Arrow/Space**: Rotate piece
- **C Key**: Hold piece
- **P/Escape**: Pause
- **Touch**: Swipe gestures

### Snake Controls
- **Arrow Keys**: Change direction
- **Space**: Pause
- **R Key**: Restart
- **Touch**: Swipe gestures

## 🔄 Lifecycle Methods

```javascript
// Initialize component
component.init();

// Start game
component.start();

// Pause game
component.pause();

// Resume game
component.resume();

// Stop game
component.stop();

// Cleanup resources
component.destroy();
```

## 📊 State Management

Mỗi component quản lý:
- `isRunning`: Game đang chạy
- `isPaused`: Game đang pause
- `score`: Điểm số hiện tại
- `level`: Level hiện tại
- `lines`: Số dòng đã clear (Tetris) / Độ dài rắn (Snake)
- `gameTime`: Thời gian chơi

## 🎯 Best Practices

1. **Luôn kế thừa từ GameComponent** cho game mới
2. **Override các methods cần thiết** (setupEventListeners, update, render)
3. **Sử dụng super.init()** trong init method
4. **Cleanup resources** trong destroy method
5. **Handle errors gracefully** với try-catch
6. **Log important events** để debug

## 🔧 Development

### Thêm game mới:
1. Tạo thư mục `src/components/newgame/`
2. Tạo `NewGameComponent.js` kế thừa GameComponent
3. Tạo HTML files cho game và menu
4. Cập nhật Game Hub để link đến game mới
5. Test trên desktop và mobile

### Debug:
```javascript
// Enable debug logging
console.log('Game state:', this.isRunning, this.isPaused);
console.log('Score:', this.score, 'Level:', this.level);
console.log('Settings:', this.config);
```

## 📝 Notes

- Tất cả components đều sử dụng ES6 classes
- Hỗ trợ module system (import/export)
- Fallback cho browsers cũ (window object)
- Responsive và mobile-first design
- Consistent API across all games












