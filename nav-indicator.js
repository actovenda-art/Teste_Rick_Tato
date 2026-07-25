(() => {
    const navList = document.querySelector('header ul');
    const indicator = navList?.querySelector('.nav-indicator');
    const activeLink = navList?.querySelector('a[aria-current="page"]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const previousPageKey = 'ro-creative-nav-previous-page';

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
        let previousPath = null;
        try {
            previousPath = sessionStorage.getItem(previousPageKey);
            sessionStorage.removeItem(previousPageKey);
        } catch {
            previousPath = null;
        }

        const previousLink = [...navList.querySelectorAll('a')].find(link => {
            return new URL(link.href, window.location.href).pathname === previousPath;
        });

        const shouldSlide = previousLink && previousLink !== activeLink && !reducedMotion.matches && window.innerWidth > 768;
        moveIndicator(shouldSlide ? previousLink : activeLink, false);
        navList.classList.add('indicator-ready');

        if (shouldSlide) {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => moveIndicator(activeLink));
            });
        }
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

            try {
                sessionStorage.setItem(previousPageKey, new URL(activeLink.href, window.location.href).pathname);
            } catch {
                // Navigation remains immediate when transient storage is unavailable.
            }
        });
    });

    window.addEventListener('resize', () => moveIndicator(activeLink, false));
})();
