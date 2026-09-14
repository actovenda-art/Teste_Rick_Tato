const opening = document.querySelector('.opening');
const openingContent = document.querySelector('.opening__content');
const openingVeil = document.querySelector('.opening__veil');
const detailsButton = document.querySelector('[data-details]');

let ticking = false;

function updateOpening() {
  const progress = Math.min(1, Math.max(0, window.scrollY / Math.max(opening.offsetHeight, 1)));
  const eased = progress * progress * (3 - 2 * progress);

  openingContent.style.opacity = String(Math.max(0, 1 - progress * 1.6));
  openingContent.style.transform = `translateY(${(-1.3 - eased * 5).toFixed(2)}rem) scale(${(1 - eased * 0.045).toFixed(3)})`;
  openingVeil.style.opacity = String(Math.min(1, progress * 2.2));
  openingVeil.style.transform = `translateY(${Math.max(0, 80 - progress * 125).toFixed(1)}%)`;
  ticking = false;
}

function requestOpeningUpdate() {
  if (!ticking) {
    requestAnimationFrame(updateOpening);
    ticking = true;
  }
}

window.addEventListener('scroll', requestOpeningUpdate, { passive: true });
window.addEventListener('resize', requestOpeningUpdate, { passive: true });

detailsButton?.addEventListener('click', () => {
  document.querySelector('#detalhes')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

updateOpening();
