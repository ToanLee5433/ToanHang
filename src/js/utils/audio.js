// Audio Manager for Tetris Multiplayer
class AudioManager {
    constructor() {
        this.sounds = {};
        this.music = null;
        this.musicVolume = 1.0;
        this.sfxVolume = 0.7;
        this.isMuted = false;
        this.audioContext = null;
        this.init();
    }

    init() {
        // Initialize Web Audio API
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
        }

        // Load sound effects
        this.loadSounds();
        
        // Load background music
        this.loadMusic();
        
        // Load settings from localStorage
        this.loadSettings();
    }

    // Load sound effects
    loadSounds() {
        // Check if Howler is available
        if (typeof Howl === 'undefined') {
            console.warn('Howler.js not loaded, audio will be disabled');
            return;
        }

        const soundFiles = {
            'piece-move': 'assets/sounds/piece-move.mp3',
            'piece-rotate': 'assets/sounds/piece-rotate.mp3',
            'piece-drop': 'assets/sounds/piece-drop.mp3',
            'line-clear': 'assets/sounds/line-clear.mp3',
            'tetris': 'assets/sounds/tetris.mp3',
            'level-up': 'assets/sounds/level-up.mp3',
            'game-over': 'assets/sounds/game-over.mp3',
            'button-click': 'assets/sounds/button-click.mp3',
            'menu-select': 'assets/sounds/menu-select.mp3',
            'countdown': 'assets/sounds/countdown.mp3',
            'garbage-receive': 'assets/sounds/garbage-receive.mp3',
            'victory': 'assets/sounds/victory.mp3',
            'defeat': 'assets/sounds/defeat.mp3'
        };

        // Create Howl instances for each sound
        Object.keys(soundFiles).forEach(soundName => {
            try {
                this.sounds[soundName] = new Howl({
                    src: [soundFiles[soundName]],
                    volume: this.sfxVolume,
                    preload: true,
                    html5: true
                });
            } catch (error) {
                console.warn(`Failed to load sound: ${soundName}`, error);
            }
        });
    }

    // Load background music
    loadMusic() {
        // Check if Howler is available
        if (typeof Howl === 'undefined') {
            console.warn('Howler.js not loaded, music will be disabled');
            return;
        }

        try {
            this.music = new Howl({
                src: ['assets/sounds/background-music.mp3'],
                volume: this.musicVolume,
                loop: true,
                html5: true,
                preload: true
            });
        } catch (error) {
            console.warn('Failed to load background music:', error);
        }
    }

    // Play sound effect
    playSound(soundName) {
        if (this.isMuted || !this.sounds[soundName] || typeof Howl === 'undefined') {
            return;
        }

        try {
            this.sounds[soundName].volume(this.sfxVolume);
            this.sounds[soundName].play();
        } catch (error) {
            console.warn('Error playing sound:', soundName, error);
        }
    }

    // Play background music
    playMusic() {
        if (this.isMuted || !this.music || typeof Howl === 'undefined') {
            return;
        }

        try {
            this.music.volume(this.musicVolume);
            this.music.play();
        } catch (error) {
            console.warn('Error playing music:', error);
        }
    }

    // Stop background music
    stopMusic() {
        if (this.music && typeof Howl !== 'undefined') {
            try {
                this.music.stop();
            } catch (error) {
                console.warn('Error stopping music:', error);
            }
        }
    }

    // Pause background music
    pauseMusic() {
        if (this.music && typeof Howl !== 'undefined') {
            try {
                this.music.pause();
            } catch (error) {
                console.warn('Error pausing music:', error);
            }
        }
    }

    // Resume background music
    resumeMusic() {
        if (this.music && !this.isMuted && typeof Howl !== 'undefined') {
            try {
                this.music.play();
            } catch (error) {
                console.warn('Error resuming music:', error);
            }
        }
    }

    // Set music volume
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        
        if (this.music && typeof Howl !== 'undefined') {
            try {
                this.music.volume(this.musicVolume);
            } catch (error) {
                console.warn('Error setting music volume:', error);
            }
        }
        
        this.saveSettings();
    }

    // Set SFX volume
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        
        // Update all sound volumes
        if (typeof Howl !== 'undefined') {
            Object.values(this.sounds).forEach(sound => {
                try {
                    sound.volume(this.sfxVolume);
                } catch (error) {
                    console.warn('Error setting sound volume:', error);
                }
            });
        }
        
        this.saveSettings();
    }

    // Mute/unmute all audio
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            this.pauseMusic();
        } else {
            this.resumeMusic();
        }
        
        this.saveSettings();
    }

    // Set mute state
    setMuted(muted) {
        this.isMuted = muted;
        
        if (this.isMuted) {
            this.pauseMusic();
        } else {
            this.resumeMusic();
        }
        
        this.saveSettings();
    }

    // Get music volume
    getMusicVolume() {
        return this.musicVolume;
    }

    // Get SFX volume
    getSFXVolume() {
        return this.sfxVolume;
    }

    // Check if muted
    isAudioMuted() {
        return this.isMuted;
    }

    // Save settings to localStorage
    saveSettings() {
        try {
            localStorage.setItem('tetris-audio-settings', JSON.stringify({
                musicVolume: this.musicVolume,
                sfxVolume: this.sfxVolume,
                isMuted: this.isMuted
            }));
        } catch (error) {
            console.warn('Error saving audio settings:', error);
        }
    }

    // Load settings from localStorage
    loadSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('tetris-audio-settings'));
            
            if (settings) {
                this.musicVolume = settings.musicVolume || 1.0;
                this.sfxVolume = settings.sfxVolume || 0.7;
                this.isMuted = settings.isMuted || false;
                
                // Apply settings
                this.setMusicVolume(this.musicVolume);
                this.setSFXVolume(this.sfxVolume);
                this.setMuted(this.isMuted);
            }
        } catch (error) {
            console.warn('Error loading audio settings:', error);
        }
    }

    // Generate simple tones for fallback
    generateTone(frequency, duration, type = 'sine') {
        if (!this.audioContext) {
            return;
        }

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(this.sfxVolume * 0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (error) {
            console.warn('Error generating tone:', error);
        }
    }

    // Play fallback sounds using generated tones
    playFallbackSound(soundName) {
        if (this.isMuted) {
            return;
        }

        const tones = {
            'piece-move': { freq: 440, duration: 0.1 },
            'piece-rotate': { freq: 523, duration: 0.1 },
            'piece-drop': { freq: 659, duration: 0.2 },
            'line-clear': { freq: 784, duration: 0.3 },
            'tetris': { freq: 1047, duration: 0.5 },
            'level-up': { freq: 1319, duration: 0.4 },
            'game-over': { freq: 220, duration: 1.0 },
            'button-click': { freq: 330, duration: 0.05 },
            'menu-select': { freq: 440, duration: 0.1 },
            'countdown': { freq: 523, duration: 0.2 },
            'garbage-receive': { freq: 392, duration: 0.3 },
            'victory': { freq: 1047, duration: 0.8 },
            'defeat': { freq: 220, duration: 0.8 }
        };

        const tone = tones[soundName];
        if (tone) {
            this.generateTone(tone.freq, tone.duration);
        }
    }

    // Game-specific sound methods
    playPieceMove() {
        this.playSound('piece-move') || this.playFallbackSound('piece-move');
    }

    playPieceRotate() {
        this.playSound('piece-rotate') || this.playFallbackSound('piece-rotate');
    }

    playPieceDrop() {
        this.playSound('piece-drop') || this.playFallbackSound('piece-drop');
    }

    playLineClear(lines) {
        if (lines >= 4) {
            this.playSound('tetris') || this.playFallbackSound('tetris');
        } else {
            this.playSound('line-clear') || this.playFallbackSound('line-clear');
        }
    }

    playLevelUp() {
        this.playSound('level-up') || this.playFallbackSound('level-up');
    }

    playGameOver() {
        this.playSound('game-over') || this.playFallbackSound('game-over');
    }

    playButtonClick() {
        this.playSound('button-click') || this.playFallbackSound('button-click');
    }

    playMenuSelect() {
        this.playSound('menu-select') || this.playFallbackSound('menu-select');
    }

    playCountdown() {
        this.playSound('countdown') || this.playFallbackSound('countdown');
    }

    playGarbageReceive() {
        this.playSound('garbage-receive') || this.playFallbackSound('garbage-receive');
    }

    playVictory() {
        this.playSound('victory') || this.playFallbackSound('victory');
    }

    playDefeat() {
        this.playSound('defeat') || this.playFallbackSound('defeat');
    }

    // Initialize audio context on user interaction
    initAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    // Cleanup
    destroy() {
        // Stop all sounds
        if (typeof Howl !== 'undefined') {
            Object.values(this.sounds).forEach(sound => {
                try {
                    sound.stop();
                } catch (error) {
                    console.warn('Error stopping sound:', error);
                }
            });
        }
        
        if (this.music && typeof Howl !== 'undefined') {
            try {
                this.music.stop();
            } catch (error) {
                console.warn('Error stopping music:', error);
            }
        }
        
        // Close audio context
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}

// Create global audio manager instance
window.audioManager = new AudioManager();

// Initialize audio context on first user interaction
document.addEventListener('click', () => {
    window.audioManager.initAudioContext();
}, { once: true });

console.log('Audio Manager initialized');
