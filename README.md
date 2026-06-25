# 🎮 Tetris Multiplayer - HTML5 Game

Một game Tetris multiplayer hiện đại được xây dựng bằng HTML5, Canvas và WebSocket với hỗ trợ leaderboard và chơi online.

## 🚀 Tính năng

### ✅ Đã hoàn thành
- [x] Gameplay Tetris cơ bản (7 Tetromino, 7-bag RNG)
- [x] Chế độ chơi đơn (Endless mode)
- [x] Hệ thống điểm và xóa hàng
- [x] UI/UX responsive cho desktop và mobile
- [x] Hệ thống âm thanh (SFX + Background music)
- [x] Leaderboard với Firebase
- [x] Multiplayer 1v1 với garbage lines
- [x] Lobby system với quick match và room code
- [x] Particle effects và animations

### 🔄 Đang phát triển
- [ ] Tournament mode
- [ ] Custom themes và skins
- [ ] Mobile app (Capacitor)
- [ ] Social features (friends, chat)

## 🎯 Mục tiêu kỹ thuật

- **Performance**: 60 FPS trên desktop, 30 FPS trên mobile
- **Responsive**: Hỗ trợ màn hình 4:3 (mobile) và 16:9 (desktop)
- **Multiplayer**: Real-time với WebSocket, ping < 100ms
- **Cross-platform**: Web (HTML5), Mobile (Capacitor)

## 🛠️ Tech Stack

### Frontend
- **HTML5 Canvas** - Game rendering
- **Vanilla JavaScript** - Game logic
- **CSS3** - UI/UX và animations
- **GSAP** - Advanced animations

### Backend
- **Firebase** - Authentication, Database, Hosting
- **Socket.io** - Real-time multiplayer
- **Node.js** - Game server

### Deployment
- **Vercel** - Web hosting
- **Firebase Hosting** - Alternative hosting

## 📁 Cấu trúc dự án

```
tetris-multiplayer/
├── src/
│   ├── js/
│   │   ├── game/          # Game logic
│   │   ├── multiplayer/   # Multiplayer features
│   │   ├── ui/           # UI components
│   │   └── utils/        # Utilities
│   ├── css/              # Stylesheets
│   ├── assets/
│   │   ├── images/       # Sprites và UI
│   │   ├── sounds/       # SFX và music
│   │   └── fonts/        # Custom fonts
│   └── index.html        # Main entry point
├── server/               # Socket.io server
├── docs/                 # Documentation
└── deployment/           # Build scripts
```

## 🎨 Art Style

- **Theme**: Neon/Retro với particle effects
- **Colors**: Neon palette (cyan, magenta, yellow)
- **Typography**: Pixel font cho retro vibe
- **Animations**: Smooth transitions và particle effects

## 🎵 Audio Design

- **Background Music**: Chiptune/Electronic loopable
- **SFX**: Khối rơi, xoay, xóa hàng, game over
- **Volume Balance**: SFX 70%, Music 100%

## 🚀 Quick Start

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd tetris-multiplayer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   ```
   http://localhost:3000
   ```

## 📊 Game Design

### Single Player
- **Mode**: Endless
- **Scoring**: Points per line clear
- **Speed**: Progressive difficulty

### Multiplayer
- **Mode**: 1v1 competitive
- **Duration**: 5 minutes
- **Garbage Lines**: 
  - 2 lines → +1 garbage
  - 3 lines → +2 garbage  
  - 4 lines → +4 garbage
- **Win Condition**: Top-out hoặc hết thời gian

### Controls
- **Desktop**: Arrow keys/WASD
- **Mobile**: Swipe gestures + tap
- **Rotation**: Spacebar (desktop), tap (mobile)

## 🔧 Development Phases

### Phase 1: MVP (4-6 weeks)
- [x] Core gameplay
- [x] Single player mode
- [x] Basic UI
- [x] Leaderboard

### Phase 2: Multiplayer (2-3 weeks)
- [x] Socket.io integration
- [x] 1v1 gameplay
- [x] Lobby system
- [x] Garbage lines

### Phase 3: Polish (2-3 weeks)
- [x] UI/UX improvements
- [x] Animations
- [x] Sound effects
- [x] Mobile optimization

### Phase 4: Launch (1-2 weeks)
- [x] Deployment
- [x] Testing
- [x] Marketing materials

## 📈 Analytics & Metrics

- **Player Retention**: Daily/Monthly active users
- **Performance**: FPS, load times, ping
- **Engagement**: Session duration, multiplayer usage
- **Technical**: Error rates, crash reports

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Tetris Company for the original game concept
- OpenGameArt.org for free game assets
- FreeSound.org for audio resources
- Firebase for backend services

---

**Made with ❤️ for the Tetris community**
