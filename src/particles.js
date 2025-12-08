export class ParticleSystem {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.targetMouseX = 0;
        this.targetMouseY = 0;
        this.currentMouseX = 0;
        this.currentMouseY = 0;
        this.time = 0;

        this.init();
    }

    init() {
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '0';
        this.canvas.style.pointerEvents = 'none';
        document.body.appendChild(this.canvas);

        this.resize();
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.targetMouseX = e.clientX;
            this.targetMouseY = e.clientY;
        });

        this.createParticles();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.createParticles();
    }

    createParticles() {
        this.particles = [];
        const spacing = 60;
        const rows = Math.ceil(this.canvas.height / spacing);
        const cols = Math.ceil(this.canvas.width / spacing);

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                this.particles.push({
                    originX: i * spacing,
                    originY: j * spacing,
                    size: 3,
                    color: Math.random() > 0.5 ? '#646cff' : '#9089fc',
                    // Composite wave properties for complex non-looping motion
                    // We use two different frequencies and phases per axis to create chaotic "heartbeat" like wandering
                    fx1: 0.01 + Math.random() * 0.04,
                    fx2: 0.01 + Math.random() * 0.04,
                    fy1: 0.01 + Math.random() * 0.04,
                    fy2: 0.01 + Math.random() * 0.04,
                    phaseX1: Math.random() * Math.PI * 2,
                    phaseX2: Math.random() * Math.PI * 2,
                    phaseY1: Math.random() * Math.PI * 2,
                    phaseY2: Math.random() * Math.PI * 2,
                    amp: 10 + Math.random() * 10 // Larger amplitude for "big" movement
                });
            }
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.time += 1;

        // LERP for mouse
        this.currentMouseX += (this.targetMouseX - this.currentMouseX) * 0.1;
        this.currentMouseY += (this.targetMouseY - this.currentMouseY) * 0.1;

        const visibilityRadius = 750;
        const pushRadius = 600;

        this.particles.forEach(p => {
            const dx = this.currentMouseX - p.originX;
            const dy = this.currentMouseY - p.originY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < visibilityRadius) {
                // Calculate base opacity based on distance
                let opacity = Math.max(0, 1 - Math.pow(distance / visibilityRadius, 2));
                // Reduce global alpha as requested (dimmer particles)
                opacity *= 0.5;

                // --- Complex Organic Motion ---
                // Summing multiple sine waves creates a pattern that takes a very long time to repeat (pseudo-random)
                // This simulates "brownian" or "organic" float better than a single loop.
                const waveX = (Math.sin(this.time * p.fx1 + p.phaseX1) + Math.cos(this.time * p.fx2 + p.phaseX2)) * p.amp;
                const waveY = (Math.sin(this.time * p.fy1 + p.phaseY1) + Math.cos(this.time * p.fy2 + p.phaseY2)) * p.amp;

                // --- Repulsion Effect ---
                let pushX = 0;
                let pushY = 0;

                if (distance < pushRadius) {
                    const angleToParticle = Math.atan2(-dy, -dx);
                    const force = (1 - distance / pushRadius) * 120;

                    pushX = Math.cos(angleToParticle) * force;
                    pushY = Math.sin(angleToParticle) * force;
                }

                const currentX = p.originX + waveX + pushX;
                const currentY = p.originY + waveY + pushY;

                const particleDx = this.currentMouseX - currentX;
                const particleDy = this.currentMouseY - currentY;
                const particleAngle = Math.atan2(particleDy, particleDx);

                this.ctx.save();
                this.ctx.translate(currentX, currentY);
                this.ctx.rotate(particleAngle);

                // --- Scale Effect ---
                let scale = 1;
                if (distance < pushRadius) {
                    scale = 0.1 + (distance / pushRadius) * 0.9;
                }

                this.ctx.beginPath();
                this.ctx.moveTo(-p.size * 2 * scale, 0);
                this.ctx.lineTo(p.size * 2 * scale, 0);

                this.ctx.globalAlpha = opacity;
                this.ctx.strokeStyle = p.color;
                this.ctx.lineWidth = 3 * scale;
                this.ctx.lineCap = 'round';
                this.ctx.stroke();
                this.ctx.restore();
            }
        });

        requestAnimationFrame(() => this.animate());
    }
}
