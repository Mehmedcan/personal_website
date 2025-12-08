// Circle radius multiplier - adjust this to change circle size
const CIRCLE_RADIUS_MULTIPLIER = 0.8; // 0.8 = 80% of button width
// Enable smooth lerp transition for circle animation
const ENABLE_CIRCLE_LERP = true; // true = smooth transition, false = instant transition
// Lerp speed for smooth transition into/out of circle animation (0-1, higher = faster)
const CIRCLE_LERP_SPEED = 0.15; // 0.08 = smooth transition over ~12-13 frames

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
        // Detect mobile devices
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

        // If mobile, don't initialize particles
        if (this.isMobile) {
            // Make all social buttons always visible on mobile
            const buttons = document.querySelectorAll('.social-links a');
            buttons.forEach(btn => {
                btn.style.opacity = '1';
                btn.style.pointerEvents = 'auto';
            });
            return; // Exit early, no particles on mobile
        }

        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '0';
        this.canvas.style.pointerEvents = 'none';
        document.body.appendChild(this.canvas);

        // Select buttons for the flashlight masking effect
        this.buttons = Array.from(document.querySelectorAll('.social-links a'));
        this.buttonsData = [];

        // Add hover listeners for 'gathering' effect - track each button individually
        this.isHovering = false;
        this.buttons.forEach((btn, index) => {
            btn.addEventListener('mouseenter', () => { 
                this.isHovering = true;
                if (this.buttonsData[index]) {
                    this.buttonsData[index].isHovered = true;
                }
            });
            btn.addEventListener('mouseleave', () => { 
                this.isHovering = false;
                if (this.buttonsData[index]) {
                    this.buttonsData[index].isHovered = false;
                    // Reset circleState for particles in this button's circle
                    this.particles.forEach(p => {
                        if (p.circleState && p.circleState.buttonIndex === index) {
                            p.circleState = null;
                        }
                    });
                }
            });
        });

        this.forceMultiplier = 1; // 1 = repulsion, negative = attraction
        this.currentVisibilityRadius = 750; // Dynamic visibility radius
        
        // Scroll-based visibility control
        this.containerElement = document.querySelector('.container');
        this.resumeSectionElement = document.querySelector('.resume-section');
        this.scrollVisibilityMultiplier = 1.0; // 0-1, controls particle visibility based on scroll
        this.targetScrollVisibility = 1.0;

        this.resize();
        this.updateButtonPositions();
        window.addEventListener('resize', () => {
            this.resize();
            this.updateButtonPositions();
        });
        window.addEventListener('mousemove', (e) => {
            this.targetMouseX = e.clientX;
            this.targetMouseY = e.clientY;
        });
        window.addEventListener('scroll', () => {
            this.updateScrollVisibility();
        });
        
        // Initial visibility check
        this.updateScrollVisibility();

        this.createParticles();
        this.animate();
    }

    updateButtonPositions() {
        this.buttonsData = this.buttons.map(btn => {
            const rect = btn.getBoundingClientRect();
            // Calculate circle radius: button width = radius (as per plan)
            const radius = rect.width;
            return {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
                radius: radius,
                isHovered: false,
                element: btn
            };
        });
    }

    updateScrollVisibility() {
        if (!this.containerElement || !this.resumeSectionElement) {
            this.targetScrollVisibility = 1.0;
            return;
        }

        const containerRect = this.containerElement.getBoundingClientRect();
        const resumeRect = this.resumeSectionElement.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        // Check if container is still visible in viewport
        const containerBottom = containerRect.bottom;
        const resumeTop = resumeRect.top;
        
        // Start fading when resume section starts entering viewport
        // Fade out completely when resume section reaches middle of viewport
        const fadeStartPoint = viewportHeight * 0.7; // Start fading when resume is 70% from top
        const fadeEndPoint = viewportHeight * 0.5; // Fully faded when resume reaches middle of viewport (50%)
        
        if (resumeTop < fadeStartPoint) {
            // Resume section is entering viewport, fade out particles
            if (resumeTop <= fadeEndPoint) {
                // Fully faded out
                this.targetScrollVisibility = 0;
            } else {
                // Calculate fade progress (0 = fully visible, 1 = fully hidden)
                const fadeRange = fadeStartPoint - fadeEndPoint;
                const fadeProgress = (fadeStartPoint - resumeTop) / fadeRange;
                this.targetScrollVisibility = Math.max(0, 1 - fadeProgress);
            }
        } else {
            // Container area is visible, particles should be fully visible
            this.targetScrollVisibility = 1.0;
        }
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.createParticles();
        this.updateButtonPositions();
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
                    fx1: 0.01 + Math.random() * 0.04,
                    fx2: 0.01 + Math.random() * 0.04,
                    fy1: 0.01 + Math.random() * 0.04,
                    fy2: 0.01 + Math.random() * 0.04,
                    phaseX1: Math.random() * Math.PI * 2,
                    phaseX2: Math.random() * Math.PI * 2,
                    phaseY1: Math.random() * Math.PI * 2,
                    phaseY2: Math.random() * Math.PI * 2,
                    amp: 10 + Math.random() * 10,
                    circleState: null, // null = outside circle, {buttonIndex, angle, targetRadius} = inside circle
                    // Circle offset for polish: small variations in radius and angle
                    circleRadiusOffset: (Math.random() - 0.5) * 8, // -4 to +4 pixels offset from circle edge
                    circleAngleOffset: (Math.random() - 0.5) * 0.15, // -0.075 to +0.075 radians offset
                    circleScale: 0.3 + Math.random() * 0.5, // Random scale between 0.3 and 0.8 for circle animation
                    circleLerpProgress: 0 // 0-1, lerp progress for smooth transition into/out of circle animation
                });
            }
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.time += 1;

        // Update scroll visibility multiplier with smooth lerp
        this.scrollVisibilityMultiplier += (this.targetScrollVisibility - this.scrollVisibilityMultiplier) * 0.1;

        this.currentMouseX += (this.targetMouseX - this.currentMouseX) * 0.1;
        this.currentMouseY += (this.targetMouseY - this.currentMouseY) * 0.1;

        const pushRadius = 600;

        const targetVisibilityRadius = this.isHovering ? 450 : 750;
        this.currentVisibilityRadius += (targetVisibilityRadius - this.currentVisibilityRadius) * 0.1;

        const targetMultiplier = this.isHovering ? -2.5 : 1.0;
        this.forceMultiplier += (targetMultiplier - this.forceMultiplier) * 0.1;

        const buttonVisibilityRadius = 550;

        if (this.buttonsData) {
            this.buttonsData.forEach(btnData => {
                const dx = this.currentMouseX - btnData.x;
                const dy = this.currentMouseY - btnData.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                let opacity = 0;
                if (dist < buttonVisibilityRadius) {
                    opacity = Math.max(0, 1 - Math.pow(dist / buttonVisibilityRadius, 2));
                    opacity = Math.pow(opacity, 0.5);
                }

                btnData.element.style.opacity = opacity;
                btnData.element.style.pointerEvents = opacity < 0.1 ? 'none' : 'auto';
            });
        }

        // Rotation speed: approximately 0.5-1 second per full rotation (0.015 rad/frame at 60fps)
        const rotationSpeed = 0.015;

        this.particles.forEach(p => {
            const dx = this.currentMouseX - p.originX;
            const dy = this.currentMouseY - p.originY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.currentVisibilityRadius) {
                // Calculate current animation position (for circle detection)
                const waveX = (Math.sin(this.time * p.fx1 + p.phaseX1) + Math.cos(this.time * p.fx2 + p.phaseX2)) * p.amp;
                const waveY = (Math.sin(this.time * p.fy1 + p.phaseY1) + Math.cos(this.time * p.fy2 + p.phaseY2)) * p.amp;

                let pushX = 0;
                let pushY = 0;

                if (distance < pushRadius) {
                    const angleToParticle = Math.atan2(-dy, -dx);
                    const force = (1 - distance / pushRadius) * 120 * this.forceMultiplier;

                    pushX = Math.cos(angleToParticle) * force;
                    pushY = Math.sin(angleToParticle) * force;
                }

                const currentAnimX = p.originX + waveX + pushX;
                const currentAnimY = p.originY + waveY + pushY;

                // Check if particle is inside any hovered button's circle (using current animation position)
                // Calculate button position in real-time for accurate circle detection
                let insideCircle = false;
                let hoveredButtonData = null;
                let buttonIndex = -1;

                if (this.buttons) {
                    for (let i = 0; i < this.buttons.length; i++) {
                        const btn = this.buttons[i];
                        // Check if button is hovered by checking if it has the hover state
                        // We'll use the buttonsData for hover state, but calculate position in real-time
                        if (this.buttonsData[i] && this.buttonsData[i].isHovered) {
                            // Get real-time button position (accounts for transforms, scroll, etc.)
                            const btnRect = btn.getBoundingClientRect();
                            const btnCenterX = btnRect.left + btnRect.width / 2;
                            const btnCenterY = btnRect.top + btnRect.height / 2;
                            const btnRadius = btnRect.width * CIRCLE_RADIUS_MULTIPLIER;
                            
                            const btnDx = currentAnimX - btnCenterX;
                            const btnDy = currentAnimY - btnCenterY;
                            const btnDistance = Math.sqrt(btnDx * btnDx + btnDy * btnDy);
                            
                            if (btnDistance <= btnRadius) {
                                insideCircle = true;
                                hoveredButtonData = {
                                    x: btnCenterX,
                                    y: btnCenterY,
                                    radius: btnRadius
                                };
                                buttonIndex = i;
                                break;
                            }
                        }
                    }
                }

                // Update circleState and lerp progress
                if (insideCircle && hoveredButtonData) {
                    // Particle enters or is inside circle
                    if (!p.circleState || p.circleState.buttonIndex !== buttonIndex) {
                        // Calculate initial angle based on particle's current animation position relative to button center
                        const btnDx = currentAnimX - hoveredButtonData.x;
                        const btnDy = currentAnimY - hoveredButtonData.y;
                        const initialAngle = Math.atan2(btnDy, btnDx);
                        
                        p.circleState = {
                            buttonIndex: buttonIndex,
                            angle: initialAngle,
                            targetRadius: hoveredButtonData.radius
                        };
                        // Reset lerp progress when entering new circle
                        p.circleLerpProgress = 0;
                    } else {
                        // Update angle for rotation (clockwise = increasing angle)
                        p.circleState.angle += rotationSpeed;
                        if (p.circleState.angle > Math.PI * 2) {
                            p.circleState.angle -= Math.PI * 2;
                        }
                    }
                    // Lerp progress towards 1 (fully in circle animation)
                    if (ENABLE_CIRCLE_LERP) {
                        p.circleLerpProgress = Math.min(1, p.circleLerpProgress + CIRCLE_LERP_SPEED);
                    } else {
                        p.circleLerpProgress = 1; // Instant transition
                    }
                } else {
                    // Particle is outside all circles
                    if (p.circleState) {
                        // Lerp progress towards 0 (back to normal animation)
                        if (ENABLE_CIRCLE_LERP) {
                            p.circleLerpProgress = Math.max(0, p.circleLerpProgress - CIRCLE_LERP_SPEED);
                            // Remove circleState when lerp is complete
                            if (p.circleLerpProgress <= 0) {
                                p.circleState = null;
                            }
                        } else {
                            p.circleLerpProgress = 0; // Instant transition
                            p.circleState = null;
                        }
                    } else {
                        // Ensure lerp progress is 0 when not in circle
                        p.circleLerpProgress = 0;
                    }
                }
                
                // Get real-time button position for circle animation (if particle is in circle)
                let realTimeButtonData = null;
                if (p.circleState && this.buttons[p.circleState.buttonIndex]) {
                    const btn = this.buttons[p.circleState.buttonIndex];
                    const btnRect = btn.getBoundingClientRect();
                    realTimeButtonData = {
                        x: btnRect.left + btnRect.width / 2,
                        y: btnRect.top + btnRect.height / 2,
                        radius: btnRect.width * CIRCLE_RADIUS_MULTIPLIER
                    };
                }

                let opacity = Math.max(0, 1 - Math.pow(distance / this.currentVisibilityRadius, 2));
                opacity *= 0.5;
                // Apply scroll-based visibility multiplier
                opacity *= this.scrollVisibilityMultiplier;

                // Calculate normal animation position
                const normalX = currentAnimX;
                const normalY = currentAnimY;
                const normalDx = this.currentMouseX - normalX;
                const normalDy = this.currentMouseY - normalY;
                const normalAngle = Math.atan2(normalDy, normalDx);

                // Calculate circle animation position (if applicable)
                let circleX = normalX;
                let circleY = normalY;
                let circleAngle = normalAngle;
                
                if (p.circleState && realTimeButtonData) {
                    // Circle animation: place particle on circle edge and rotate with polish offsets
                    // Use real-time button position for accurate circle positioning
                    const effectiveRadius = realTimeButtonData.radius + p.circleRadiusOffset;
                    const effectiveAngle = p.circleState.angle + p.circleAngleOffset;
                    
                    circleX = realTimeButtonData.x + effectiveRadius * Math.cos(effectiveAngle);
                    circleY = realTimeButtonData.y + effectiveRadius * Math.sin(effectiveAngle);
                    
                    // Particle should point tangentially to the circle (perpendicular to radius)
                    circleAngle = effectiveAngle + Math.PI / 2; // 90 degrees offset for tangent
                }

                // Lerp between normal and circle animation based on lerp progress
                const lerp = p.circleLerpProgress;
                const currentX = normalX + (circleX - normalX) * lerp;
                const currentY = normalY + (circleY - normalY) * lerp;
                
                // Lerp angle (handle angle wrapping)
                let particleAngle;
                let angleDiff = circleAngle - normalAngle;
                // Normalize angle difference to -PI to PI range
                while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
                particleAngle = normalAngle + angleDiff * lerp;

                this.ctx.save();
                this.ctx.translate(currentX, currentY);
                this.ctx.rotate(particleAngle);

                let scale = 1;
                if (p.circleState) {
                    // Circle animation: use random scale for variety
                    scale = p.circleScale;
                } else if (distance < pushRadius) {
                    // Normal animation: scale based on distance from mouse
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
