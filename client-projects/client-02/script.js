(() => {
  'use strict';

  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.nav-links');

  const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 24);
  const closeMenu = () => {
    menu?.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  };

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
  toggle?.addEventListener('click', () => {
    const open = !menu?.classList.contains('open');
    menu?.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
  });
  menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
  });
  const parts = Object.fromEntries(formatter.formatToParts(new Date()).map((part) => [part.type, part.value]));
  const minutes = Number(parts.hour) * 60 + Number(parts.minute);
  const schedule = { Wed: [[660, 870]], Thu: [[660, 870]], Fri: [[660, 870]], Sat: [[660, 960], [1080, 1320]], Sun: [[660, 960]] };
  const openNow = (schedule[parts.weekday] || []).some(([start, end]) => minutes >= start && minutes < end);
  document.querySelectorAll('[data-open-status]').forEach((badge) => {
    badge.textContent = openNow ? 'Aberto agora · vem pra roça' : 'Fechado agora · confira os horários';
    badge.classList.toggle('is-open', openNow);
  });

  document.querySelectorAll('[data-year]').forEach((year) => { year.textContent = String(new Date().getFullYear()); });

  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.target.classList.toggle('visible', entry.isIntersecting));
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
  } else {
    document.querySelectorAll('.reveal').forEach((element) => element.classList.add('visible'));
  }
})();
