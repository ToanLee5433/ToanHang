// Settings Manager
class SettingsManager {
    constructor() {
        this.settings = {
            audio: {
                musicVolume: 50,
                sfxVolume: 70,
                musicEnabled: true,
                sfxEnabled: true
            },
            game: {
                ghostPiece: true,
                holdPiece: true,
                previewLines: 3,
                dropSpeed: 'normal',
                keyBindings: {
                    left: ['ArrowLeft', 'KeyA'],
                    right: ['ArrowRight', 'KeyD'],
                    down: ['ArrowDown', 'KeyS'],
                    rotate: ['ArrowUp', 'KeyW', 'Space'],
                    hold: ['KeyC'],
                    drop: ['Space']
                }
            },
            display: {
                theme: 'neon',
                particleEffects: true,
                screenShake: true,
                fps: 60
            },
            controls: {
                touchEnabled: true,
                swipeSensitivity: 50,
                tapToRotate: true
            }
        };
        
        this.init();
    }

    // Initialize settings
    init() {
        this.loadSettings();
        this.setupSettingsHandlers();
        this.applySettings();
        console.log('Settings manager initialized');
    }

    // Load settings from localStorage
    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('tetris-settings');
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                this.settings = { ...this.settings, ...parsed };
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }

    // Save settings to localStorage
    saveSettings() {
        try {
            localStorage.setItem('tetris-settings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }

    // Set up settings event handlers
    setupSettingsHandlers() {
        // Audio settings
        this.setupAudioHandlers();
        
        // Game settings
        this.setupGameHandlers();
        
        // Display settings
        this.setupDisplayHandlers();
        
        // Control settings
        this.setupControlHandlers();
        
        // Reset button
        this.setupResetButton();
    }

    // Set up audio settings handlers
    setupAudioHandlers() {
        const musicVolume = document.getElementById('music-volume');
        const sfxVolume = document.getElementById('sfx-volume');
        const musicToggle = document.getElementById('music-toggle');
        const sfxToggle = document.getElementById('sfx-toggle');
        
        if (musicVolume) {
            musicVolume.addEventListener('input', (e) => {
                this.settings.audio.musicVolume = parseInt(e.target.value);
                this.updateMusicVolume();
                this.saveSettings();
            });
        }
        
        if (sfxVolume) {
            sfxVolume.addEventListener('input', (e) => {
                this.settings.audio.sfxVolume = parseInt(e.target.value);
                this.updateSFXVolume();
                this.saveSettings();
            });
        }
        
        if (musicToggle) {
            musicToggle.addEventListener('change', (e) => {
                this.settings.audio.musicEnabled = e.target.checked;
                this.updateMusicEnabled();
                this.saveSettings();
            });
        }
        
        if (sfxToggle) {
            sfxToggle.addEventListener('change', (e) => {
                this.settings.audio.sfxEnabled = e.target.checked;
                this.updateSFXEnabled();
                this.saveSettings();
            });
        }
    }

    // Set up game settings handlers
    setupGameHandlers() {
        const ghostPiece = document.getElementById('ghost-piece');
        const holdPiece = document.getElementById('hold-piece');
        const previewLines = document.getElementById('preview-lines');
        const dropSpeed = document.getElementById('drop-speed');
        
        if (ghostPiece) {
            ghostPiece.addEventListener('change', (e) => {
                this.settings.game.ghostPiece = e.target.checked;
                this.saveSettings();
            });
        }
        
        if (holdPiece) {
            holdPiece.addEventListener('change', (e) => {
                this.settings.game.holdPiece = e.target.checked;
                this.saveSettings();
            });
        }
        
        if (previewLines) {
            previewLines.addEventListener('change', (e) => {
                this.settings.game.previewLines = parseInt(e.target.value);
                this.saveSettings();
            });
        }
        
        if (dropSpeed) {
            dropSpeed.addEventListener('change', (e) => {
                this.settings.game.dropSpeed = e.target.value;
                this.saveSettings();
            });
        }
    }

    // Set up display settings handlers
    setupDisplayHandlers() {
        const theme = document.getElementById('theme-select');
        const particleEffects = document.getElementById('particle-effects');
        const screenShake = document.getElementById('screen-shake');
        const fps = document.getElementById('fps-select');
        
        if (theme) {
            theme.addEventListener('change', (e) => {
                this.settings.display.theme = e.target.value;
                this.applyTheme();
                this.saveSettings();
            });
        }
        
        if (particleEffects) {
            particleEffects.addEventListener('change', (e) => {
                this.settings.display.particleEffects = e.target.checked;
                this.saveSettings();
            });
        }
        
        if (screenShake) {
            screenShake.addEventListener('change', (e) => {
                this.settings.display.screenShake = e.target.checked;
                this.saveSettings();
            });
        }
        
        if (fps) {
            fps.addEventListener('change', (e) => {
                this.settings.display.fps = parseInt(e.target.value);
                this.saveSettings();
            });
        }
    }

    // Set up control settings handlers
    setupControlHandlers() {
        const touchEnabled = document.getElementById('touch-enabled');
        const swipeSensitivity = document.getElementById('swipe-sensitivity');
        const tapToRotate = document.getElementById('tap-to-rotate');
        
        if (touchEnabled) {
            touchEnabled.addEventListener('change', (e) => {
                this.settings.controls.touchEnabled = e.target.checked;
                this.saveSettings();
            });
        }
        
        if (swipeSensitivity) {
            swipeSensitivity.addEventListener('input', (e) => {
                this.settings.controls.swipeSensitivity = parseInt(e.target.value);
                this.saveSettings();
            });
        }
        
        if (tapToRotate) {
            tapToRotate.addEventListener('change', (e) => {
                this.settings.controls.tapToRotate = e.target.checked;
                this.saveSettings();
            });
        }
    }

    // Set up reset button
    setupResetButton() {
        const resetBtn = document.getElementById('reset-settings');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetSettings();
            });
        }
    }

    // Apply settings to UI
    applySettings() {
        // Apply audio settings
        this.applyAudioSettings();
        
        // Apply game settings
        this.applyGameSettings();
        
        // Apply display settings
        this.applyDisplaySettings();
        
        // Apply control settings
        this.applyControlSettings();
    }

    // Apply audio settings to UI
    applyAudioSettings() {
        const musicVolume = document.getElementById('music-volume');
        const sfxVolume = document.getElementById('sfx-volume');
        const musicToggle = document.getElementById('music-toggle');
        const sfxToggle = document.getElementById('sfx-toggle');
        
        if (musicVolume) {
            musicVolume.value = this.settings.audio.musicVolume;
            musicVolume.nextElementSibling.textContent = this.settings.audio.musicVolume + '%';
        }
        
        if (sfxVolume) {
            sfxVolume.value = this.settings.audio.sfxVolume;
            sfxVolume.nextElementSibling.textContent = this.settings.audio.sfxVolume + '%';
        }
        
        if (musicToggle) {
            musicToggle.checked = this.settings.audio.musicEnabled;
        }
        
        if (sfxToggle) {
            sfxToggle.checked = this.settings.audio.sfxEnabled;
        }
    }

    // Apply game settings to UI
    applyGameSettings() {
        const ghostPiece = document.getElementById('ghost-piece');
        const holdPiece = document.getElementById('hold-piece');
        const previewLines = document.getElementById('preview-lines');
        const dropSpeed = document.getElementById('drop-speed');
        
        if (ghostPiece) {
            ghostPiece.checked = this.settings.game.ghostPiece;
        }
        
        if (holdPiece) {
            holdPiece.checked = this.settings.game.holdPiece;
        }
        
        if (previewLines) {
            previewLines.value = this.settings.game.previewLines;
        }
        
        if (dropSpeed) {
            dropSpeed.value = this.settings.game.dropSpeed;
        }
    }

    // Apply display settings to UI
    applyDisplaySettings() {
        const theme = document.getElementById('theme-select');
        const particleEffects = document.getElementById('particle-effects');
        const screenShake = document.getElementById('screen-shake');
        const fps = document.getElementById('fps-select');
        
        if (theme) {
            theme.value = this.settings.display.theme;
        }
        
        if (particleEffects) {
            particleEffects.checked = this.settings.display.particleEffects;
        }
        
        if (screenShake) {
            screenShake.checked = this.settings.display.screenShake;
        }
        
        if (fps) {
            fps.value = this.settings.display.fps;
        }
    }

    // Apply control settings to UI
    applyControlSettings() {
        const touchEnabled = document.getElementById('touch-enabled');
        const swipeSensitivity = document.getElementById('swipe-sensitivity');
        const tapToRotate = document.getElementById('tap-to-rotate');
        
        if (touchEnabled) {
            touchEnabled.checked = this.settings.controls.touchEnabled;
        }
        
        if (swipeSensitivity) {
            swipeSensitivity.value = this.settings.controls.swipeSensitivity;
        }
        
        if (tapToRotate) {
            tapToRotate.checked = this.settings.controls.tapToRotate;
        }
    }

    // Update music volume
    updateMusicVolume() {
        if (window.audioManager) {
            window.audioManager.setMusicVolume(this.settings.audio.musicVolume / 100);
        }
    }

    // Update SFX volume
    updateSFXVolume() {
        if (window.audioManager) {
            window.audioManager.setSFXVolume(this.settings.audio.sfxVolume / 100);
        }
    }

    // Update music enabled state
    updateMusicEnabled() {
        if (window.audioManager) {
            if (this.settings.audio.musicEnabled) {
                window.audioManager.resumeMusic();
            } else {
                window.audioManager.pauseMusic();
            }
        }
    }

    // Update SFX enabled state
    updateSFXEnabled() {
        if (window.audioManager) {
            window.audioManager.setSFXEnabled(this.settings.audio.sfxEnabled);
        }
    }

    // Apply theme
    applyTheme() {
        const body = document.body;
        body.className = `theme-${this.settings.display.theme}`;
    }

    // Reset settings to defaults
    resetSettings() {
        if (confirm('Bạn có chắc muốn đặt lại tất cả cài đặt về mặc định?')) {
            this.settings = {
                audio: {
                    musicVolume: 50,
                    sfxVolume: 70,
                    musicEnabled: true,
                    sfxEnabled: true
                },
                game: {
                    ghostPiece: true,
                    holdPiece: true,
                    previewLines: 3,
                    dropSpeed: 'normal',
                    keyBindings: {
                        left: ['ArrowLeft', 'KeyA'],
                        right: ['ArrowRight', 'KeyD'],
                        down: ['ArrowDown', 'KeyS'],
                        rotate: ['ArrowUp', 'KeyW', 'Space'],
                        hold: ['KeyC'],
                        drop: ['Space']
                    }
                },
                display: {
                    theme: 'neon',
                    particleEffects: true,
                    screenShake: true,
                    fps: 60
                },
                controls: {
                    touchEnabled: true,
                    swipeSensitivity: 50,
                    tapToRotate: true
                }
            };
            
            this.applySettings();
            this.saveSettings();
            
            // Show success message
            if (window.menuManager) {
                window.menuManager.showSuccess('Đã đặt lại cài đặt về mặc định');
            }
        }
    }

    // Get setting value
    getSetting(path) {
        const keys = path.split('.');
        let value = this.settings;
        
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return undefined;
            }
        }
        
        return value;
    }

    // Set setting value
    setSetting(path, value) {
        const keys = path.split('.');
        let current = this.settings;
        
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!(key in current) || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key];
        }
        
        current[keys[keys.length - 1]] = value;
        this.saveSettings();
    }

    // Export settings
    exportSettings() {
        const data = {
            settings: this.settings,
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `tetris-settings-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Import settings
    importSettings(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.settings) {
                    this.settings = { ...this.settings, ...data.settings };
                    this.applySettings();
                    this.saveSettings();
                    
                    if (window.menuManager) {
                        window.menuManager.showSuccess('Đã nhập cài đặt thành công');
                    }
                }
            } catch (error) {
                console.error('Failed to import settings:', error);
                if (window.menuManager) {
                    window.menuManager.showError('Không thể nhập cài đặt');
                }
            }
        };
        reader.readAsText(file);
    }
}

// Global settings manager instance
window.settingsManager = new SettingsManager();
