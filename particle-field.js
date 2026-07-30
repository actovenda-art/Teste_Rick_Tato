(() => {
    'use strict';

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const mapSection = document.querySelector('[data-particle-map]');
    const mapVisual = document.querySelector('[data-particle-map-visual]');

    if (reducedMotion) {
        mapSection?.classList.add('is-static');
        return;
    }

    const canvas = document.createElement('canvas');
    canvas.className = 'particle-field';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);
    document.documentElement.classList.add('particle-field-ready');

    const context = canvas.getContext('2d', { alpha: true });
    if (!context) {
        canvas.remove();
        document.documentElement.classList.remove('particle-field-ready');
        mapSection?.classList.add('is-static');
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

    const mapPolygons = [
        [
            [0.01, 0.30], [0.03, 0.24], [0.07, 0.22], [0.08, 0.17], [0.13, 0.13],
            [0.17, 0.16], [0.20, 0.13], [0.24, 0.14], [0.28, 0.11], [0.33, 0.15],
            [0.36, 0.20], [0.33, 0.24], [0.34, 0.28], [0.30, 0.31], [0.29, 0.36],
            [0.25, 0.38], [0.23, 0.42], [0.20, 0.43], [0.18, 0.47], [0.15, 0.46],
            [0.13, 0.42], [0.10, 0.43], [0.08, 0.39], [0.05, 0.39], [0.04, 0.35],
            [0.01, 0.33],
        ],
        [
            [0.14, 0.43], [0.18, 0.41], [0.23, 0.43], [0.26, 0.47], [0.25, 0.50],
            [0.22, 0.49], [0.20, 0.53], [0.18, 0.51], [0.17, 0.48], [0.14, 0.47],
        ],
        [
            [0.21, 0.50], [0.26, 0.47], [0.31, 0.50], [0.35, 0.56], [0.36, 0.63],
            [0.33, 0.69], [0.32, 0.77], [0.29, 0.83], [0.27, 0.91], [0.24, 0.96],
            [0.22, 0.89], [0.21, 0.80], [0.19, 0.72], [0.20, 0.64], [0.18, 0.58],
            [0.19, 0.53],
        ],
        [
            [0.34, 0.09], [0.37, 0.04], [0.42, 0.03], [0.46, 0.08], [0.45, 0.14],
            [0.42, 0.18], [0.37, 0.17], [0.33, 0.13],
        ],
        [
            [0.42, 0.27], [0.45, 0.22], [0.48, 0.20], [0.50, 0.17], [0.53, 0.19],
            [0.55, 0.22], [0.58, 0.23], [0.57, 0.27], [0.54, 0.28], [0.55, 0.32],
            [0.51, 0.34], [0.49, 0.31], [0.46, 0.34], [0.44, 0.31], [0.41, 0.30],
        ],
        [
            [0.46, 0.20], [0.47, 0.13], [0.50, 0.09], [0.53, 0.12], [0.52, 0.18],
            [0.50, 0.22], [0.48, 0.24],
        ],
        [
            [0.43, 0.37], [0.48, 0.34], [0.54, 0.35], [0.58, 0.40], [0.60, 0.47],
            [0.57, 0.54], [0.56, 0.62], [0.53, 0.69], [0.51, 0.79], [0.47, 0.85],
            [0.44, 0.79], [0.43, 0.70], [0.40, 0.64], [0.39, 0.54], [0.40, 0.45],
        ],
        [
            [0.52, 0.22], [0.58, 0.16], [0.65, 0.11], [0.73, 0.12], [0.80, 0.10],
            [0.88, 0.14], [0.95, 0.21], [0.98, 0.28], [0.96, 0.34], [0.91, 0.34],
            [0.93, 0.40], [0.88, 0.45], [0.84, 0.43], [0.80, 0.50], [0.76, 0.48],
            [0.73, 0.53], [0.69, 0.51], [0.66, 0.46], [0.62, 0.45], [0.60, 0.39],
            [0.55, 0.36], [0.56, 0.31], [0.52, 0.28],
        ],
        [
            [0.66, 0.44], [0.70, 0.43], [0.73, 0.48], [0.72, 0.56], [0.69, 0.63],
            [0.67, 0.56], [0.65, 0.49],
        ],
        [
            [0.75, 0.48], [0.80, 0.49], [0.84, 0.54], [0.82, 0.59], [0.77, 0.57],
            [0.73, 0.53],
        ],
        [
            [0.78, 0.61], [0.82, 0.59], [0.87, 0.62], [0.90, 0.65], [0.87, 0.68],
            [0.82, 0.66],
        ],
        [
            [0.86, 0.31], [0.88, 0.28], [0.90, 0.32], [0.89, 0.37], [0.87, 0.41],
            [0.86, 0.37],
        ],
        [
            [0.76, 0.68], [0.80, 0.64], [0.87, 0.63], [0.93, 0.68], [0.95, 0.75],
            [0.92, 0.82], [0.86, 0.86], [0.80, 0.84], [0.75, 0.78], [0.73, 0.72],
        ],
        [
            [0.58, 0.67], [0.60, 0.65], [0.61, 0.72], [0.60, 0.80], [0.58, 0.84],
            [0.57, 0.76],
        ],
        [
            [0.96, 0.84], [0.98, 0.82], [0.99, 0.86], [0.97, 0.90], [0.95, 0.89],
        ],
        [
            [0.435, 0.235], [0.445, 0.215], [0.455, 0.225], [0.454, 0.255],
            [0.442, 0.270], [0.432, 0.252],
        ],
    ];

    let width = window.innerWidth;
    let height = window.innerHeight;
    let pixelRatio = 1;
    let particles = [];
    let animationFrame = 0;
    let lastTime = performance.now();
    let pageProgress = 0;
    let mapReveal = mapSection ? 0 : 1;
    let ribbonProgress = mapSection ? 0 : 1;
    let fieldOpacity = mapSection ? 0 : 1;
    let mapBounds = {
        left: width * 0.26,
        top: height * 0.18,
        width: width * 0.68,
        height: height * 0.64,
    };

    const clamp = (value, minimum = 0, maximum = 1) =>
        Math.max(minimum, Math.min(maximum, value));

    const randomBetween = (minimum, maximum) =>
        minimum + Math.random() * (maximum - minimum);

    const pointInPolygon = (point, polygon) => {
        let inside = false;

        for (let current = 0, previous = polygon.length - 1; current < polygon.length; previous = current++) {
            const currentX = polygon[current][0];
            const currentY = polygon[current][1];
            const previousX = polygon[previous][0];
            const previousY = polygon[previous][1];
            const intersects =
                currentY > point.y !== previousY > point.y &&
                point.x <
                    ((previousX - currentX) * (point.y - currentY)) /
                        (previousY - currentY || 0.0001) +
                        currentX;

            if (intersects) inside = !inside;
        }

        return inside;
    };

    const polygonBounds = (polygon) => {
        const horizontal = polygon.map((point) => point[0]);
        const vertical = polygon.map((point) => point[1]);

        return {
            left: Math.min(...horizontal),
            right: Math.max(...horizontal),
            top: Math.min(...vertical),
            bottom: Math.max(...vertical),
        };
    };

    const weightedPolygons = mapPolygons.map((polygon) => {
        const bounds = polygonBounds(polygon);
        const weight = (bounds.right - bounds.left) * (bounds.bottom - bounds.top);
        const edges = polygon.map((point, index) => {
            const nextPoint = polygon[(index + 1) % polygon.length];
            return {
                start: point,
                end: nextPoint,
                length: Math.hypot(nextPoint[0] - point[0], nextPoint[1] - point[1]),
            };
        });
        const perimeter = edges.reduce((sum, edge) => sum + edge.length, 0);
        return { polygon, bounds, edges, perimeter, weight };
    });

    const totalPolygonWeight = weightedPolygons.reduce((sum, item) => sum + item.weight, 0);

    const selectWeightedPolygon = () => {
        let selection = Math.random() * totalPolygonWeight;
        let selected = weightedPolygons[0];

        for (const item of weightedPolygons) {
            selection -= item.weight;
            if (selection <= 0) {
                selected = item;
                break;
            }
        }

        return selected;
    };

    const createOutlinePoint = (selected) => {
        let edgeSelection = Math.random() * selected.perimeter;
        let selectedEdge = selected.edges[0];

        for (const edge of selected.edges) {
            edgeSelection -= edge.length;
            if (edgeSelection <= 0) {
                selectedEdge = edge;
                break;
            }
        }

        const progress = Math.random();
        const edgeX = selectedEdge.end[0] - selectedEdge.start[0];
        const edgeY = selectedEdge.end[1] - selectedEdge.start[1];
        const edgeLength = selectedEdge.length || 0.0001;
        const jitter = randomBetween(-0.006, 0.006);

        return {
            x: clamp(
                selectedEdge.start[0] + edgeX * progress - (edgeY / edgeLength) * jitter,
            ),
            y: clamp(
                selectedEdge.start[1] + edgeY * progress + (edgeX / edgeLength) * jitter,
            ),
            outline: true,
        };
    };

    const createMapPoint = (forcedPolygonIndex = null) => {
        const selected = forcedPolygonIndex === null
            ? selectWeightedPolygon()
            : weightedPolygons[forcedPolygonIndex];

        if (forcedPolygonIndex !== null || Math.random() < 0.18) {
            return createOutlinePoint(selected);
        }

        for (let attempt = 0; attempt < 50; attempt += 1) {
            const point = {
                x: randomBetween(selected.bounds.left, selected.bounds.right),
                y: randomBetween(selected.bounds.top, selected.bounds.bottom),
                outline: false,
            };

            if (pointInPolygon(point, selected.polygon)) return point;
        }

        return {
            x: (selected.bounds.left + selected.bounds.right) / 2,
            y: (selected.bounds.top + selected.bounds.bottom) / 2,
            outline: false,
        };
    };

    const createParticles = () => {
        const divisor = finePointer ? 720 : 1450;
        const minimum = finePointer ? 1100 : 600;
        const maximum = finePointer ? 1900 : 1000;
        const count = Math.max(minimum, Math.min(maximum, Math.round((width * height) / divisor)));
        const guaranteedOutlinePoints = weightedPolygons.length * 10;

        particles = Array.from({ length: count }, (_, index) => {
            const position = index / Math.max(1, count - 1);
            const forcedPolygonIndex = index < guaranteedOutlinePoints
                ? index % weightedPolygons.length
                : null;
            const mapPoint = createMapPoint(forcedPolygonIndex);
            const x = mapBounds.left + mapPoint.x * mapBounds.width + randomBetween(-90, 90);
            const y = mapBounds.top + mapPoint.y * mapBounds.height + randomBetween(-70, 70);

            return {
                x,
                y,
                velocityX: 0,
                velocityY: 0,
                position,
                mapX: mapPoint.x,
                mapY: mapPoint.y,
                outline: mapPoint.outline,
                offsetX: randomBetween(-42, 42),
                offsetY: randomBetween(-20, 20),
                scatterX: randomBetween(-190, 190),
                scatterY: randomBetween(-150, 150),
                phase: randomBetween(0, Math.PI * 2),
                size: mapPoint.outline
                    ? randomBetween(0.52, 1.45)
                    : randomBetween(0.42, 1.14),
                warmth: Math.random(),
            };
        });
    };

    const updateMapBounds = () => {
        if (!mapVisual) return;

        const bounds = mapVisual.getBoundingClientRect();
        mapBounds = {
            left: bounds.left,
            top: bounds.top + bounds.height * 0.04,
            width: bounds.width,
            height: bounds.height * 0.9,
        };
    };

    const updatePageState = () => {
        const scrollRange = Math.max(1, document.documentElement.scrollHeight - height);
        pageProgress = window.scrollY / scrollRange;

        if (!mapSection) {
            mapReveal = 0;
            ribbonProgress = 1;
            fieldOpacity = 1;
            return;
        }

        const sectionBounds = mapSection.getBoundingClientRect();
        const entering = clamp((height * 0.96 - sectionBounds.top) / (height * 0.5));
        const leaving = clamp((height * 0.58 - sectionBounds.bottom) / (height * 0.54));

        mapReveal = entering * (1 - leaving);
        ribbonProgress = leaving;
        fieldOpacity = clamp(Math.max(mapReveal, ribbonProgress));
        mapSection.classList.toggle('is-active', mapReveal > 0.6 && ribbonProgress < 0.24);
        updateMapBounds();
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
        updateMapBounds();
        createParticles();
        updatePageState();
    };

    const movePointer = (event) => {
        if (!finePointer) return;
        pointer.targetX = event.clientX;
        pointer.targetY = event.clientY;
        pointer.active = true;
    };

    const releasePointer = () => {
        pointer.active = false;
    };

    const drawPointerGlow = () => {
        if (pointer.strength < 0.01 || fieldOpacity < 0.01) return;

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
        const easedRibbon = ribbonProgress * ribbonProgress * (3 - 2 * ribbonProgress);
        const gathering = clamp(mapReveal * 1.35);

        particles.forEach((particle) => {
            const verticalPosition = height * (0.06 + particle.position * 0.88);
            const curve =
                Math.sin(particle.position * Math.PI * 4.2 + time * 0.42 + pageProgress * 8) * 38 +
                Math.sin(particle.position * Math.PI * 9 + particle.phase) * 12;
            const ribbonX =
                ribbonCenter +
                curve +
                particle.offsetX +
                (particle.position - 0.5) * ribbonTilt;
            const ribbonY =
                verticalPosition +
                particle.offsetY +
                Math.sin(time * 0.7 + particle.phase) * 5;
            const scatter = 1 - gathering;
            const mapX =
                mapBounds.left +
                particle.mapX * mapBounds.width +
                particle.scatterX * scatter;
            const mapY =
                mapBounds.top +
                particle.mapY * mapBounds.height +
                particle.scatterY * scatter;
            const targetX = mapX + (ribbonX - mapX) * easedRibbon;
            const targetY = mapY + (ribbonY - mapY) * easedRibbon;

            particle.velocityX += (targetX - particle.x) * 0.014 * elapsed;
            particle.velocityY += (targetY - particle.y) * 0.014 * elapsed;

            if (pointer.strength > 0.01 && finePointer) {
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
            const contourEmphasis = 1 + mapReveal * (particle.outline ? 0.68 : -0.2);
            const alpha =
                Math.max(0.12, pulse) *
                (0.42 + particle.size * 0.2) *
                contourEmphasis *
                fieldOpacity;
            const red = particle.warmth > 0.8 ? 245 : 132;
            const green = particle.warmth > 0.8 ? 168 : 126;
            const blue = particle.warmth > 0.8 ? 36 : 255;

            context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
            context.beginPath();
            context.arc(
                particle.x,
                particle.y,
                particle.size * (1 + mapReveal * (particle.outline ? 0.22 : 0)),
                0,
                Math.PI * 2,
            );
            context.fill();
        });

        drawPointerGlow();
        context.restore();
        animationFrame = requestAnimationFrame(render);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('scroll', updatePageState, { passive: true });

    if (finePointer) {
        window.addEventListener('pointermove', movePointer, { passive: true });
        document.documentElement.addEventListener('pointerleave', releasePointer);
        window.addEventListener('blur', releasePointer);
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animationFrame);
        } else {
            lastTime = performance.now();
            animationFrame = requestAnimationFrame(render);
        }
    });

    resize();
    animationFrame = requestAnimationFrame(render);
})();
