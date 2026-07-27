(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotion.matches) return;

    const gsapApi = window.gsap;
    const scrollTriggerApi = window.ScrollTrigger;

    if (gsapApi && scrollTriggerApi) {
        gsapApi.registerPlugin(scrollTriggerApi);

        const activeViewTransition = document.activeViewTransition;
        const heroContainer = document.querySelector('.hero > .container, .page-hero-content');
        const heroTargets = heroContainer ? [...heroContainer.children] : [];
        let heroAnimation;

        const showHero = () => {
            heroAnimation?.kill();
            heroAnimation = gsapApi.fromTo(
                heroTargets,
                { autoAlpha: 0, y: 24 },
                {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.72,
                    stagger: 0.08,
                    ease: 'power3.out',
                    clearProps: 'opacity,visibility,transform'
                }
            );
        };

        const hideHero = () => {
            heroAnimation?.kill();
            heroAnimation = gsapApi.to(heroTargets, {
                autoAlpha: 0,
                y: -18,
                duration: 0.3,
                stagger: 0.03,
                ease: 'power2.in'
            });
        };

        if (heroContainer && !activeViewTransition) {
            showHero();
        }

        if (heroContainer) {
            scrollTriggerApi.create({
                trigger: heroContainer.closest('section'),
                start: 'top top',
                end: 'bottom 18%',
                onLeave: hideHero,
                onEnterBack: showHero
            });
        }

        document.querySelectorAll('main > section:not(:first-child)').forEach(section => {
            const container = section.querySelector(':scope > .container, :scope > .narrow');
            if (!container) return;

            const targets = [...container.children];
            if (!targets.length) return;

            gsapApi.fromTo(
                targets,
                { autoAlpha: 0, y: 30 },
                {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.78,
                    stagger: 0.1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: section,
                        start: 'top 82%',
                        end: 'bottom 18%',
                        toggleActions: 'restart reverse restart reverse'
                    }
                }
            );
        });

        window.addEventListener('load', () => scrollTriggerApi.refresh(), { once: true });
    }

    const animeApi = window.anime;
    if (!animeApi?.animate || !animeApi?.stagger) return;

    const { animate, stagger } = animeApi;
    const iconSelector = '.service-icon, .detail-icon, .contact-method-icon, .step-number';
    const animationGroups = document.querySelectorAll(
        '.services-grid, .detail-grid, .contact-methods, .process-grid, .pricing-grid, .pricing-detail-grid, .result-grid'
    );

    const iconObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            const isVisible = entry.isIntersecting && entry.intersectionRatio >= 0.25;

            const icons = entry.target.querySelectorAll(iconSelector);
            if (icons.length) {
                animate(
                    icons,
                    isVisible
                        ? {
                            opacity: [0, 1],
                            scale: [0.78, 1],
                            rotate: ['-7deg', '0deg'],
                            delay: stagger(70),
                            duration: 620,
                            ease: 'out(3)'
                        }
                        : {
                            opacity: 0,
                            scale: 0.78,
                            rotate: '-7deg',
                            duration: 220,
                            ease: 'in(2)'
                        }
                );
            }

            const values = entry.target.querySelectorAll('.price, .result strong');
            if (values.length) {
                animate(
                    values,
                    isVisible
                        ? {
                            opacity: [0, 1],
                            scale: [0.84, 1],
                            delay: stagger(80),
                            duration: 540,
                            ease: 'out(4)'
                        }
                        : {
                            opacity: 0,
                            scale: 0.84,
                            duration: 200,
                            ease: 'in(2)'
                        }
                );
            }
        });
    }, { threshold: 0.25 });

    animationGroups.forEach(group => iconObserver.observe(group));

    document.querySelectorAll(iconSelector).forEach(icon => {
        icon.addEventListener('pointerenter', () => {
            animate(icon, {
                scale: 1.12,
                rotate: '5deg',
                duration: 280,
                ease: 'out(3)'
            });
        });

        icon.addEventListener('pointerleave', () => {
            animate(icon, {
                scale: 1,
                rotate: '0deg',
                duration: 340,
                ease: 'out(4)'
            });
        });
    });

    document.querySelectorAll('.eyebrow, .tag, .portfolio-tag').forEach(badge => {
        badge.addEventListener('pointerenter', () => {
            animate(badge, {
                scale: 1.04,
                duration: 220,
                ease: 'out(3)'
            });
        });

        badge.addEventListener('pointerleave', () => {
            animate(badge, {
                scale: 1,
                duration: 280,
                ease: 'out(4)'
            });
        });
    });

    document.querySelectorAll('.case-image img').forEach(image => {
        image.addEventListener('pointerenter', () => {
            animate(image, {
                scale: 1.035,
                duration: 480,
                ease: 'out(3)'
            });
        });

        image.addEventListener('pointerleave', () => {
            animate(image, {
                scale: 1,
                duration: 520,
                ease: 'out(4)'
            });
        });
    });

    document.querySelectorAll('.ba-btn').forEach(button => {
        button.addEventListener('click', () => {
            const content = button.closest('.portfolio-item')?.querySelector('.ba-content');
            if (!content) return;

            requestAnimationFrame(() => {
                animate(content, {
                    opacity: [0, 1],
                    y: [10, 0],
                    duration: 380,
                    ease: 'out(3)'
                });
            });
        });
    });
})();
