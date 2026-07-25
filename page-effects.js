const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const backgroundLayers = [...document.querySelectorAll('.scroll-bg-layer')];
const backgroundSections = [...document.querySelectorAll('[data-scroll-bg]')];
let activeBackground = -1;
let scrollFrame;

function updateScrollBackground() {
    if (!backgroundSections.length || !backgroundLayers.length) return;

    const viewportFocus = window.innerHeight * 0.45;
    let closestSection = backgroundSections[0];
    let closestDistance = Infinity;

    backgroundSections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const distance = Math.abs(rect.top + rect.height / 2 - viewportFocus);
        if (distance < closestDistance) {
            closestDistance = distance;
            closestSection = section;
        }
    });

    const nextBackground = Number(closestSection.dataset.scrollBg);
    if (nextBackground !== activeBackground) {
        backgroundLayers.forEach((layer, index) => {
            layer.classList.toggle('active', index === nextBackground);
        });
        activeBackground = nextBackground;
    }

    if (!prefersReducedMotion.matches) {
        const rect = closestSection.getBoundingClientRect();
        const offset = Math.max(-32, Math.min(32, (rect.top + rect.height / 2 - window.innerHeight / 2) * -0.035));
        document.documentElement.style.setProperty('--parallax-offset', `${offset}px`);
    }

    scrollFrame = null;
}

function requestScrollUpdate() {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScrollBackground);
}

const revealElements = document.querySelectorAll(
    '.section-heading, .detail-card, .step-card, .case-study, .pricing-detail, .comparison-wrap, .faq-list details, .contact-panel, .contact-form, .info-panel'
);

revealElements.forEach((element, index) => {
    element.classList.add('reveal-on-scroll');
    element.style.setProperty('--reveal-delay', `${(index % 3) * 90}ms`);
});

if ('IntersectionObserver' in window && !prefersReducedMotion.matches) {
    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });

    revealElements.forEach(element => revealObserver.observe(element));
} else {
    revealElements.forEach(element => element.classList.add('is-visible'));
}

document.querySelectorAll('[data-demo-form]').forEach(form => {
    form.addEventListener('submit', event => {
        event.preventDefault();
        alert('Thanks! Your project brief is ready. Form delivery will be connected in the next integration step.');
    });
});

const requestedPlan = new URLSearchParams(window.location.search).get('plan');
const planSelect = document.querySelector('[name="package"]');
if (requestedPlan && planSelect && [...planSelect.options].some(option => option.value === requestedPlan)) {
    planSelect.value = requestedPlan;
}

const menuToggle = document.querySelector('.menu-toggle');
const siteMenu = document.querySelector('#site-menu');
if (menuToggle && siteMenu) {
    const closeMenu = () => {
        siteMenu.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
    };

    menuToggle.addEventListener('click', () => {
        const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
        siteMenu.classList.toggle('open', !isOpen);
        menuToggle.setAttribute('aria-expanded', String(!isOpen));
    });

    siteMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') closeMenu();
    });
}

window.addEventListener('scroll', requestScrollUpdate, { passive: true });
window.addEventListener('resize', requestScrollUpdate);
if (typeof prefersReducedMotion.addEventListener === 'function') {
    prefersReducedMotion.addEventListener('change', requestScrollUpdate);
}
updateScrollBackground();
