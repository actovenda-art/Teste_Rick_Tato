(() => {
    const navList = document.querySelector('header ul');
    const indicator = navList?.querySelector('.nav-indicator');
    const activeLink = navList?.querySelector('a[aria-current="page"]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let navigationTimer;

    if (!navList || !indicator || !activeLink) return;

    function moveIndicator(link, animate = true) {
        const listRect = navList.getBoundingClientRect();
        const linkRect = link.getBoundingClientRect();

        if (!animate) indicator.style.transition = 'none';
        indicator.style.width = `${linkRect.width}px`;
        indicator.style.transform = `translateX(${linkRect.left - listRect.left}px)`;

        if (!animate) {
            requestAnimationFrame(() => indicator.style.removeProperty('transition'));
        }
    }

    function initializeIndicator() {
        moveIndicator(activeLink, false);
        navList.classList.add('indicator-ready');
    }

    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    fontsReady.then(initializeIndicator);

    navList.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', event => {
            const destination = new URL(link.href, window.location.href);
            const isModifiedClick = event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
            const isSamePage = destination.pathname === window.location.pathname;
            const isDesktop = window.innerWidth > 768;

            if (isModifiedClick || isSamePage || destination.origin !== window.location.origin || reducedMotion.matches || !isDesktop) {
                return;
            }

            event.preventDefault();
            clearTimeout(navigationTimer);
            moveIndicator(link);
            navigationTimer = window.setTimeout(() => {
                window.location.assign(destination.href);
            }, 360);
        });
    });

    window.addEventListener('resize', () => moveIndicator(activeLink, false));
})();
