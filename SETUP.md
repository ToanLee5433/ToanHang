# 🚀 Hướng Dẫn Setup Tetris Multiplayer

## 📋 Yêu Cầu Hệ Thống

- **Node.js**: phiên bản 16.0.0 trở lên
- **npm**: phiên bản 8.0.0 trở lên
- **Git**: để clone repository
- **Trình duyệt**: Chrome, Firefox, Safari (hỗ trợ ES6+)

## 🛠️ Cài Đặt

### 1. Clone Repository

```bash
git clone <repository-url>
cd tetris-multiplayer
```

### 2. Cài Đặt Dependencies

```bash
npm install
```

### 3. Cấu Hình Firebase (Tùy chọn)

Nếu bạn muốn sử dụng Firebase cho authentication và leaderboard:

1. Tạo project trên [Firebase Console](https://console.firebase.google.com/)
2. Bật Authentication với Google Sign-in
3. Tạo Firestore Database
4. Cập nhật config trong `src/js/config/firebase.js`:

```javascript
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};
```

### 4. Chạy Dự Án

#### Development Mode

```bash
# Chạy cả client và server
npm run dev

# Hoặc chạy riêng lẻ
npm run server  # Chạy server trên port 3001
npm run client  # Chạy client trên port 3000
```

#### Production Mode

```bash
# Build dự án
npm run build

# Chạy server production
npm start
```

## 🎮 Cách Chơi

### Điều Khiển

#### Desktop
- **Mũi tên/WASD**: Di chuyển khối
- **Space/W**: Xoay khối
- **C**: Giữ khối
- **Z**: Xoay ngược chiều
- **↓/S**: Rơi nhanh

#### Mobile
- **Vuốt trái/phải**: Di chuyển khối
- **Tap**: Xoay khối
- **Vuốt xuống**: Hard drop

### Chế Độ Chơi

#### Single Player
- Chơi đơn với hệ thống điểm
- Level tăng theo số hàng đã xóa
- Tốc độ tăng dần theo level

#### Multiplayer
- Chơi 1v1 với đối thủ
- Thời gian: 5 phút
- Garbage lines: gửi rác cho đối thủ khi xóa nhiều hàng

## 🔧 Cấu Trúc Dự Án

```
tetris-multiplayer/
├── src/
│   ├── js/
│   │   ├── config/
│   │   │   └── firebase.js      # Firebase configuration
│   │   ├── game/
│   │   │   ├── tetromino.js     # Tetromino logic
│   │   │   ├── board.js         # Game board
│   │   │   └── game.js          # Main game logic
│   │   ├── multiplayer/
│   │   │   ├── socket.js        # Socket.io client
│   │   │   └── multiplayer.js   # Multiplayer logic
│   │   ├── ui/
│   │   │   ├── menu.js          # Menu management
│   │   │   ├── leaderboard.js   # Leaderboard UI
│   │   │   └── settings.js      # Settings UI
│   │   ├── utils/
│   │   │   ├── audio.js         # Audio management
│   │   │   └── particles.js     # Particle effects
│   │   └── main.js              # Main application
│   ├── css/
│   │   └── main.css             # Styles
│   ├── assets/
│   │   ├── images/              # Game assets
│   │   ├── sounds/              # Audio files
│   │   └── fonts/               # Custom fonts
│   └── index.html               # Main HTML
├── server/
│   └── index.js                 # Socket.io server
├── package.json
├── vercel.json                  # Vercel deployment
└── README.md
```

## 🌐 Deployment

### Vercel (Khuyến nghị)

1. Cài đặt Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Hoặc deploy qua GitHub:
- Push code lên GitHub
- Kết nối với Vercel
- Auto-deploy khi có thay đổi

### Firebase Hosting

1. Cài đặt Firebase CLI:
```bash
npm i -g firebase-tools
```

2. Login và init:
```bash
firebase login
firebase init hosting
```

3. Deploy:
```bash
firebase deploy
```

### Netlify

1. Build dự án:
```bash
npm run build
```

2. Upload thư mục `dist/` lên Netlify

## 🎨 Tùy Chỉnh

### Thay Đổi Theme

Chỉnh sửa CSS variables trong `src/css/main.css`:

```css
:root {
    --neon-cyan: #00ffff;
    --neon-magenta: #ff00ff;
    --neon-yellow: #ffff00;
    /* ... */
}
```

### Thêm Âm Thanh

1. Thêm file âm thanh vào `src/assets/sounds/`
2. Cập nhật `src/js/utils/audio.js`:

```javascript
const soundFiles = {
    'new-sound': 'assets/sounds/new-sound.mp3',
    // ...
};
```

### Thay Đổi Game Logic

Chỉnh sửa các file trong `src/js/game/`:
- `tetromino.js`: Logic khối Tetris
- `board.js`: Logic bảng chơi
- `game.js`: Logic game chính

## 🐛 Troubleshooting

### Lỗi Thường Gặp

#### 1. "Module not found"
```bash
npm install
```

#### 2. "Port already in use"
```bash
# Tìm và kill process
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

#### 3. "Firebase not initialized"
- Kiểm tra config Firebase
- Đảm bảo đã bật Authentication và Firestore

#### 4. "Socket connection failed"
- Kiểm tra server có đang chạy không
- Kiểm tra firewall/antivirus

### Debug Mode

Thêm vào URL để debug:
```
http://localhost:3000?debug=true
```

## 📱 Mobile Optimization

### Responsive Design
- Tự động scale theo màn hình
- Touch controls cho mobile
- Optimized cho màn hình nhỏ

### Performance
- 60 FPS trên desktop
- 30 FPS trên mobile
- Lazy loading assets

## 🔒 Security

### Firebase Security Rules
```javascript
// Firestore rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /scores/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Input Validation
- Validate tất cả input từ client
- Sanitize data trước khi lưu
- Rate limiting cho API calls

## 📊 Analytics

### Firebase Analytics
- Track game events
- User behavior analysis
- Performance monitoring

### Custom Events
```javascript
// Track custom events
window.firebaseAnalytics.trackEvent('custom_event', {
    parameter: 'value'
});
```

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push và tạo Pull Request

## 📄 License

MIT License - xem file LICENSE để biết thêm chi tiết.

## 🆘 Support

- **Issues**: Tạo issue trên GitHub
- **Discussions**: Thảo luận trên GitHub Discussions
- **Email**: [your-email@example.com]

---

**Chúc bạn chơi game vui vẻ! 🎮**
