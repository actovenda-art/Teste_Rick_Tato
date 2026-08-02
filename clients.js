(() => {
    'use strict';

    document.querySelectorAll('[data-client-preview]').forEach((preview) => {
        const stage = preview.querySelector('[data-preview-stage]');
        const buttons = [...preview.querySelectorAll('[data-preview-device]')];

        if (!stage || !buttons.length) return;

        buttons.forEach((button) => {
            button.addEventListener('click', () => {
                const device = button.dataset.previewDevice;
                stage.dataset.previewStage = device;

                buttons.forEach((candidate) => {
                    const isActive = candidate === button;
                    candidate.classList.toggle('is-active', isActive);
                    candidate.setAttribute('aria-pressed', String(isActive));
                });
            });
        });
    });
})();
