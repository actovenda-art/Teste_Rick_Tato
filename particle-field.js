(() => {
    'use strict';

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    if (reducedMotion || !finePointer) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'particle-field';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);

    const context = canvas.getContext('2d', { alpha: true });
    if (!context) {
        canvas.remove();
        return;
    }

    const pointer = {
        x: window.innerWidth * 0.78,
        y: window.innerHeight * 0.5,
        targetX: window.innerWidth * 0.78,
        targetY: window.innerHeight * 0.5,
        strength: 0,
        active: false,
    };

    let width = window.innerWidth;
    let height = window.innerHeight;
    let pixelRatio = 1;
    let particles = [];
    let animationFrame = 0;
    let lastTime = performance.now();
    let pageProgress = 0;

    const randomBetween = (min, max) => min + Math.random() * (max - min);

    const createParticles = () => {
        const count = Math.max(260, Math.min(680, Math.round((width * height) / 2200)));

        particles = Array.from({ length: count }, (_, index) => {
            const position = index / Math.max(1, count - 1);
            const x = width * 0.8 + randomBetween(-70, 70);
            const y = height * (0.08 + position * 0.84) + randomBetween(-28, 28);

            return {
                x,
                y,
                velocityX: 0,
                velocityY: 0,
                position,
                offsetX: randomBetween(-42, 42),
                offsetY: randomBetween(-20, 20),
                phase: randomBetween(0, Math.PI * 2),
                size: randomBetween(0.45, 1.65),
                warmth: Math.random(),
            };
        });
    };

    const resize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        pixelRatio = Math.min(window.devicePixelRatio || 1, 1.6);
        canvas.width = Math.round(width * pixelRatio);
        canvas.height = Math.round(height * pixelRatio);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        createParticles();
    };

    const updatePageProgress = () => {
        const scrollRange = Math.max(1, document.documentElement.scrollHeight - height);
        pageProgress = window.scrollY / scrollRange;
    };

    const movePointer = (event) => {
        pointer.targetX = event.clientX;
        pointer.targetY = event.clientY;
        pointer.active = true;
    };

    const releasePointer = () => {
        pointer.active = false;
    };

    const drawPointerGlow = () => {
        if (pointer.strength < 0.01) return;

        const radius = 118 + pointer.strength * 32;
        const glow = context.createRadialGradient(
            pointer.x,
            pointer.y,
            radius * 0.28,
            pointer.x,
            pointer.y,
            radius,
        );

        glow.addColorStop(0, 'rgba(6, 10, 14, 0)');
        glow.addColorStop(0.58, `rgba(245, 168, 36, ${0.035 * pointer.strength})`);
        glow.addColorStop(0.78, `rgba(135, 118, 255, ${0.085 * pointer.strength})`);
        glow.addColorStop(1, 'rgba(135, 118, 255, 0)');

        context.fillStyle = glow;
        context.beginPath();
        context.arc(pointer.x, pointer.y, radius, 0, Math.PI * 2);
        context.fill();
    };

    const render = (now) => {
        const elapsed = Math.min(32, now - lastTime) / 16.6667;
        const time = now * 0.001;
        lastTime = now;

        pointer.x += (pointer.targetX - pointer.x) * 0.13 * elapsed;
        pointer.y += (pointer.targetY - pointer.y) * 0.13 * elapsed;
        pointer.strength += ((pointer.active ? 1 : 0) - pointer.strength) * 0.08 * elapsed;

        context.clearRect(0, 0, width, height);
        context.save();
        context.globalCompositeOperation = 'lighter';

        const ribbonCenter = width * (0.79 + Math.sin(pageProgress * Math.PI * 3) * 0.035);
        const ribbonTilt = Math.sin(pageProgress * Math.PI * 5) * 84;
        const interactionRadius = Math.min(168, Math.max(120, width * 0.105));
        const ringRadius = 76 + Math.sin(time * 1.4) * 8;

        particles.forEach((particle) => {
            const verticalPosition = height * (0.06 + particle.position * 0.88);
            const curve =
                Math.sin(particle.position * Math.PI * 4.2 + time * 0.42 + pageProgress * 8) * 38 +
                Math.sin(particle.position * Math.PI * 9 + particle.phase) * 12;
            const targetX =
                ribbonCenter +
                curve +
                particle.offsetX +
                (particle.position - 0.5) * ribbonTilt;
            const targetY =
                verticalPosition +
                particle.offsetY +
                Math.sin(time * 0.7 + particle.phase) * 5;

            particle.velocityX += (targetX - particle.x) * 0.012 * elapsed;
            particle.velocityY += (targetY - particle.y) * 0.012 * elapsed;

            if (pointer.strength > 0.01) {
                const distanceX = particle.x - pointer.x;
                const distanceY = particle.y - pointer.y;
                const distance = Math.hypot(distanceX, distanceY) || 0.001;

                if (distance < interactionRadius) {
                    const influence = (1 - distance / interactionRadius) * pointer.strength;
                    const directionX = distanceX / distance;
                    const directionY = distanceY / distance;
                    const ringForce = (ringRadius - distance) * 0.023 * influence * elapsed;
                    const swirlForce = 0.19 * influence * elapsed;

                    particle.velocityX += directionX * ringForce - directionY * swirlForce;
                    particle.velocityY += directionY * ringForce + directionX * swirlForce;
                }
            }

            particle.velocityX *= Math.pow(0.91, elapsed);
            particle.velocityY *= Math.pow(0.91, elapsed);
            particle.x += particle.velocityX * elapsed;
            particle.y += particle.velocityY * elapsed;

            const pulse = 0.58 + Math.sin(time * 1.8 + particle.phase) * 0.2;
            const alpha = Math.max(0.12, pulse) * (0.42 + particle.size * 0.2);
            const red = particle.warmth > 0.78 ? 245 : 132;
            const green = particle.warmth > 0.78 ? 168 : 126;
            const blue = particle.warmth > 0.78 ? 36 : 255;

            context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
            context.beginPath();
            context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            context.fill();
        });

        drawPointerGlow();
        context.restore();
        animationFrame = requestAnimationFrame(render);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('scroll', updatePageProgress, { passive: true });
    window.addEventListener('pointermove', movePointer, { passive: true });
    document.documentElement.addEventListener('pointerleave', releasePointer);
    window.addEventListener('blur', releasePointer);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animationFrame);
        } else {
            lastTime = performance.now();
            animationFrame = requestAnimationFrame(render);
        }
    });

    resize();
    updatePageProgress();
    animationFrame = requestAnimationFrame(render);
})();
