// Menu UI Manager
class MenuManager {
    constructor() {
        this.currentScreen = 'main-menu';
        this.menuHistory = [];
        
        this.init();
    }

    // Initialize menu
    init() {
        this.setupMenuAnimations();
        this.setupMenuSounds();
        console.log('Menu manager initialized');
    }

    // Set up menu animations
    setupMenuAnimations() {
        // Add hover effects to menu buttons
        const menuButtons = document.querySelectorAll('.menu-btn');
        menuButtons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                this.playButtonHoverSound();
                this.addButtonGlow(button);
            });
            
            button.addEventListener('mouseleave', () => {
                this.removeButtonGlow(button);
            });
            
            button.addEventListener('click', () => {
                this.playButtonClickSound();
                this.addButtonClickEffect(button);
            });
        });
    }

    // Set up menu sounds
    setupMenuSounds() {
        // Preload menu sounds
        if (window.audioManager) {
            window.audioManager.loadSound('menu-hover', 'assets/sounds/menu-hover.mp3');
            window.audioManager.loadSound('menu-click', 'assets/sounds/menu-click.mp3');
            window.audioManager.loadSound('menu-select', 'assets/sounds/menu-select.mp3');
        }
    }

    // Play button hover sound
    playButtonHoverSound() {
        if (window.audioManager) {
            window.audioManager.playSound('menu-hover');
        }
    }

    // Play button click sound
    playButtonClickSound() {
        if (window.audioManager) {
            window.audioManager.playSound('menu-click');
        }
    }

    // Play menu select sound
    playMenuSelectSound() {
        if (window.audioManager) {
            window.audioManager.playSound('menu-select');
        }
    }

    // Add button glow effect
    addButtonGlow(button) {
        button.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.6)';
        button.style.transform = 'scale(1.05)';
    }

    // Remove button glow effect
    removeButtonGlow(button) {
        button.style.boxShadow = '';
        button.style.transform = '';
    }

    // Add button click effect
    addButtonClickEffect(button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }

    // Show screen with animation
    showScreen(screenId) {
        const currentScreen = document.querySelector('.screen.active');
        const targetScreen = document.getElementById(screenId);
        
        if (currentScreen && targetScreen) {
            // Add to history
            this.menuHistory.push(this.currentScreen);
            this.currentScreen = screenId;
            
            // Fade out current screen
            currentScreen.style.opacity = '0';
            currentScreen.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                currentScreen.classList.remove('active');
                
                // Fade in target screen
                targetScreen.classList.add('active');
                targetScreen.style.opacity = '0';
                targetScreen.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    targetScreen.style.opacity = '1';
                    targetScreen.style.transform = 'translateY(0)';
                }, 50);
            }, 300);
        }
    }

    // Go back to previous screen
    goBack() {
        if (this.menuHistory.length > 0) {
            const previousScreen = this.menuHistory.pop();
            this.showScreen(previousScreen);
        } else {
            this.showScreen('main-menu');
        }
    }

    // Show modal with animation
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            modal.style.opacity = '0';
            modal.style.transform = 'scale(0.8)';
            
            setTimeout(() => {
                modal.style.opacity = '1';
                modal.style.transform = 'scale(1)';
            }, 50);
        }
    }

    // Hide modal with animation
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.opacity = '0';
            modal.style.transform = 'scale(0.8)';
            
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 300);
        }
    }

    // Update menu UI based on game state
    updateMenuUI(gameState) {
        // Update version number
        const versionEl = document.querySelector('.version');
        if (versionEl) {
            versionEl.textContent = 'v1.0.0';
        }
        
        // Update user info if logged in
        if (window.firebaseAuth && window.firebaseAuth.currentUser) {
            const userInfo = document.getElementById('user-info');
            const userName = document.getElementById('user-name');
            
            if (userInfo && userName) {
                userInfo.classList.remove('hidden');
                userName.textContent = window.firebaseAuth.currentUser.displayName || 'Người chơi';
            }
        }
    }

    // Show loading screen
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.remove('hidden');
        }
    }

    // Hide loading screen
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 50);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Show error notification
    showError(message) {
        this.showNotification(message, 'error');
    }

    // Show success notification
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    // Show warning notification
    showWarning(message) {
        this.showNotification(message, 'warning');
    }

    // Update button states
    updateButtonStates() {
        // Update multiplayer button based on connection status
        const multiplayerBtn = document.getElementById('multiplayer-btn');
        if (multiplayerBtn && window.socketManager) {
            if (window.socketManager.isConnected) {
                multiplayerBtn.disabled = false;
                multiplayerBtn.textContent = 'Chơi Đôi';
            } else {
                multiplayerBtn.disabled = true;
                multiplayerBtn.textContent = 'Đang kết nối...';
            }
        }
        
        // Update auth buttons based on login status
        const loginBtn = document.getElementById('login-btn');
        const logoutBtn = document.getElementById('logout-btn');
        
        if (window.firebaseAuth && window.firebaseAuth.currentUser) {
            if (loginBtn) loginBtn.classList.add('hidden');
            if (logoutBtn) logoutBtn.classList.remove('hidden');
        } else {
            if (loginBtn) loginBtn.classList.remove('hidden');
            if (logoutBtn) logoutBtn.classList.add('hidden');
        }
    }

    // Handle keyboard navigation
    handleKeyboardNavigation(event) {
        const activeElement = document.activeElement;
        const menuButtons = document.querySelectorAll('.menu-btn:not([disabled])');
        
        if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
            event.preventDefault();
            this.navigateToNextButton(menuButtons, activeElement, 1);
        } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
            event.preventDefault();
            this.navigateToNextButton(menuButtons, activeElement, -1);
        } else if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (activeElement && activeElement.classList.contains('menu-btn')) {
                activeElement.click();
            }
        }
    }

    // Navigate to next/previous button
    navigateToNextButton(buttons, currentElement, direction) {
        const currentIndex = Array.from(buttons).indexOf(currentElement);
        const nextIndex = (currentIndex + direction + buttons.length) % buttons.length;
        buttons[nextIndex].focus();
    }

    // Set up keyboard navigation
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (event) => {
            this.handleKeyboardNavigation(event);
        });
    }
}

// Global menu manager instance
window.menuManager = new MenuManager();
