// Particle System for Tetris Multiplayer
class Particle {
    constructor(x, y, vx, vy, color, life, size) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.size = size;
        this.alpha = 1;
        this.gravity = 0.1;
        this.friction = 0.98;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.vx *= this.friction;
        this.vy *= this.friction;
        
        this.life--;
        this.alpha = this.life / this.maxLife;
        
        return this.life > 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.enabled = true;
        this.maxParticles = 200;
    }

    // Create line clear particles
    createLineClearParticles(x, y, width, height, color) {
        if (!this.enabled) return;

        const particleCount = Math.min(50, this.maxParticles - this.particles.length);
        
        for (let i = 0; i < particleCount; i++) {
            const px = x + Math.random() * width;
            const py = y + Math.random() * height;
            const vx = (Math.random() - 0.5) * 8;
            const vy = (Math.random() - 0.5) * 8 - 2;
            const life = 30 + Math.random() * 30;
            const size = 2 + Math.random() * 3;
            
            this.particles.push(new Particle(px, py, vx, vy, color, life, size));
        }
    }

    // Create tetris particles (special effect for 4-line clear)
    createTetrisParticles(x, y, width, height) {
        if (!this.enabled) return;

        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        const particleCount = Math.min(100, this.maxParticles - this.particles.length);
        
        for (let i = 0; i < particleCount; i++) {
            const px = x + Math.random() * width;
            const py = y + Math.random() * height;
            const vx = (Math.random() - 0.5) * 12;
            const vy = (Math.random() - 0.5) * 12 - 4;
            const life = 60 + Math.random() * 60;
            const size = 3 + Math.random() * 4;
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            this.particles.push(new Particle(px, py, vx, vy, color, life, size));
        }
    }

    // Create level up particles
    createLevelUpParticles(x, y) {
        if (!this.enabled) return;

        const particleCount = Math.min(30, this.maxParticles - this.particles.length);
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 3 + Math.random() * 3;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const life = 40 + Math.random() * 20;
            const size = 2 + Math.random() * 2;
            const color = '#ffff00';
            
            this.particles.push(new Particle(x, y, vx, vy, color, life, size));
        }
    }

    // Create game over particles
    createGameOverParticles(x, y) {
        if (!this.enabled) return;

        const particleCount = Math.min(80, this.maxParticles - this.particles.length);
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 6;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const life = 80 + Math.random() * 40;
            const size = 1 + Math.random() * 3;
            const colors = ['#ff0000', '#ff6600', '#ff9900'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            this.particles.push(new Particle(x, y, vx, vy, color, life, size));
        }
    }

    // Create button click particles
    createButtonParticles(x, y) {
        if (!this.enabled) return;

        const particleCount = Math.min(15, this.maxParticles - this.particles.length);
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const life = 20 + Math.random() * 10;
            const size = 1 + Math.random() * 2;
            const color = '#00ffff';
            
            this.particles.push(new Particle(x, y, vx, vy, color, life, size));
        }
    }

    // Create victory particles
    createVictoryParticles(x, y) {
        if (!this.enabled) return;

        const particleCount = Math.min(60, this.maxParticles - this.particles.length);
        
        for (let i = 0; i < particleCount; i++) {
            const px = x + (Math.random() - 0.5) * 200;
            const py = y + (Math.random() - 0.5) * 200;
            const vx = (Math.random() - 0.5) * 4;
            const vy = (Math.random() - 0.5) * 4 - 1;
            const life = 50 + Math.random() * 30;
            const size = 2 + Math.random() * 3;
            const colors = ['#00ff00', '#ffff00', '#00ffff', '#ffffff'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            this.particles.push(new Particle(px, py, vx, vy, color, life, size));
        }
    }

    // Create defeat particles
    createDefeatParticles(x, y) {
        if (!this.enabled) return;

        const particleCount = Math.min(40, this.maxParticles - this.particles.length);
        
        for (let i = 0; i < particleCount; i++) {
            const px = x + (Math.random() - 0.5) * 150;
            const py = y + (Math.random() - 0.5) * 150;
            const vx = (Math.random() - 0.5) * 3;
            const vy = (Math.random() - 0.5) * 3 - 0.5;
            const life = 40 + Math.random() * 20;
            const size = 1 + Math.random() * 2;
            const colors = ['#ff0000', '#ff6600', '#666666'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            this.particles.push(new Particle(px, py, vx, vy, color, life, size));
        }
    }

    // Create garbage line particles
    createGarbageParticles(x, y, width, height) {
        if (!this.enabled) return;

        const particleCount = Math.min(25, this.maxParticles - this.particles.length);
        
        for (let i = 0; i < particleCount; i++) {
            const px = x + Math.random() * width;
            const py = y + Math.random() * height;
            const vx = (Math.random() - 0.5) * 6;
            const vy = (Math.random() - 0.5) * 6 - 1;
            const life = 35 + Math.random() * 25;
            const size = 1 + Math.random() * 2;
            const color = '#ff0066';
            
            this.particles.push(new Particle(px, py, vx, vy, color, life, size));
        }
    }

    // Create countdown particles
    createCountdownParticles(x, y) {
        if (!this.enabled) return;

        const particleCount = Math.min(20, this.maxParticles - this.particles.length);
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 2 + Math.random() * 2;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const life = 30 + Math.random() * 15;
            const size = 1 + Math.random() * 2;
            const color = '#ffff00';
            
            this.particles.push(new Particle(x, y, vx, vy, color, life, size));
        }
    }

    // Create sparkle effect
    createSparkleParticles(x, y, count = 10) {
        if (!this.enabled) return;

        const particleCount = Math.min(count, this.maxParticles - this.particles.length);
        
        for (let i = 0; i < particleCount; i++) {
            const px = x + (Math.random() - 0.5) * 100;
            const py = y + (Math.random() - 0.5) * 100;
            const vx = (Math.random() - 0.5) * 2;
            const vy = (Math.random() - 0.5) * 2;
            const life = 20 + Math.random() * 10;
            const size = 1 + Math.random() * 1;
            const color = '#ffffff';
            
            this.particles.push(new Particle(px, py, vx, vy, color, life, size));
        }
    }

    // Update all particles
    update() {
        this.particles = this.particles.filter(particle => particle.update());
    }

    // Draw all particles
    draw() {
        this.particles.forEach(particle => particle.draw(this.ctx));
    }

    // Clear all particles
    clear() {
        this.particles = [];
    }

    // Enable/disable particle system
    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.clear();
        }
    }

    // Get particle count
    getParticleCount() {
        return this.particles.length;
    }

    // Create explosion effect
    createExplosion(x, y, intensity = 1) {
        if (!this.enabled) return;

        const particleCount = Math.min(30 * intensity, this.maxParticles - this.particles.length);
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = (2 + Math.random() * 4) * intensity;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const life = (30 + Math.random() * 30) * intensity;
            const size = (1 + Math.random() * 3) * intensity;
            const colors = ['#ff0000', '#ff6600', '#ffff00', '#ffffff'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            this.particles.push(new Particle(x, y, vx, vy, color, life, size));
        }
    }

    // Create trail effect
    createTrail(x, y, color = '#00ffff') {
        if (!this.enabled) return;

        const particleCount = Math.min(3, this.maxParticles - this.particles.length);
        
        for (let i = 0; i < particleCount; i++) {
            const px = x + (Math.random() - 0.5) * 10;
            const py = y + (Math.random() - 0.5) * 10;
            const vx = (Math.random() - 0.5) * 1;
            const vy = (Math.random() - 0.5) * 1;
            const life = 10 + Math.random() * 10;
            const size = 1 + Math.random() * 1;
            
            this.particles.push(new Particle(px, py, vx, vy, color, life, size));
        }
    }

    // Create rain effect
    createRain(x, y, width, height, count = 20) {
        if (!this.enabled) return;

        const particleCount = Math.min(count, this.maxParticles - this.particles.length);
        
        for (let i = 0; i < particleCount; i++) {
            const px = x + Math.random() * width;
            const py = y + Math.random() * height;
            const vx = (Math.random() - 0.5) * 1;
            const vy = 2 + Math.random() * 2;
            const life = 30 + Math.random() * 20;
            const size = 1 + Math.random() * 1;
            const color = '#0066ff';
            
            this.particles.push(new Particle(px, py, vx, vy, color, life, size));
        }
    }
}

// Global particle system instance
window.particleSystem = null;

// Initialize particle system when canvas is available
function initParticleSystem(canvas) {
    if (window.particleSystem) {
        window.particleSystem.clear();
    }
    window.particleSystem = new ParticleSystem(canvas);
    console.log('Particle system initialized');
}

// Export for use in other modules
window.initParticleSystem = initParticleSystem;
