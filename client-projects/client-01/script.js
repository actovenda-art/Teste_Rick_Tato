(() => {
    'use strict';

    const menuButton = document.querySelector('.menu-toggle');
    const navigation = document.querySelector('.site-nav');

    const closeMenu = () => {
        navigation?.classList.remove('is-open');
        menuButton?.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
    };

    menuButton?.addEventListener('click', () => {
        const willOpen = !navigation?.classList.contains('is-open');
        navigation?.classList.toggle('is-open', willOpen);
        menuButton.setAttribute('aria-expanded', String(willOpen));
        document.body.classList.toggle('menu-open', willOpen);
    });

    navigation?.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeMenu();
    });

    document.querySelectorAll('[data-year]').forEach((element) => {
        element.textContent = String(new Date().getFullYear());
    });

    const observer = 'IntersectionObserver' in window
        ? new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) entry.target.classList.add('is-visible');
            });
        }, { threshold: 0.12 })
        : null;

    document.querySelectorAll('.reveal').forEach((element) => {
        if (observer) observer.observe(element);
        else element.classList.add('is-visible');
    });

    document.querySelector('[data-contact-form]')?.addEventListener('submit', (event) => {
        event.preventDefault();
        const status = event.currentTarget.querySelector('.form-status');
        if (status) status.textContent = 'Thank you — this presentation form is ready to be connected before launch.';
    });
})();
