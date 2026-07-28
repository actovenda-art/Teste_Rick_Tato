(() => {
    const SUPABASE_URL = 'https://gemobwwkeswjtkantogd.supabase.co';
    const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_CZcR0XlqZVTsiOZ5aEViqA_BrPXrATT';
    const forms = document.querySelectorAll('[data-enquiry-form]');

    const setStatus = (element, message, type = '') => {
        if (!element) return;
        element.textContent = message;
        element.classList.toggle('is-success', type === 'success');
        element.classList.toggle('is-error', type === 'error');
    };

    const value = (formData, field, maxLength) =>
        String(formData.get(field) || '').trim().slice(0, maxLength);

    forms.forEach((form) => {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = new FormData(form);
            const status = form.querySelector('[data-form-status]');
            const button = form.querySelector('button[type="submit"]');
            const originalButtonContent = button?.innerHTML;

            if (value(formData, 'website', 200)) {
                form.reset();
                setStatus(status, 'Thank you! Your project enquiry was sent successfully.', 'success');
                return;
            }

            const payload = {
                name: value(formData, 'name', 120),
                business_name: value(formData, 'business', 160),
                email: value(formData, 'email', 254).toLowerCase(),
                location: value(formData, 'location', 120),
                package: value(formData, 'package', 80),
                timeline: value(formData, 'timeline', 80) || null,
                message: value(formData, 'message', 5000) || value(formData, 'project', 5000),
                source: form.dataset.formSource || 'home',
            };

            if (button) {
                button.disabled = true;
                button.textContent = 'Sending...';
            }
            setStatus(status, 'Sending your project enquiry...');

            try {
                const response = await fetch(`${SUPABASE_URL}/rest/v1/project_enquiries`, {
                    method: 'POST',
                    headers: {
                        apikey: SUPABASE_PUBLISHABLE_KEY,
                        'Content-Type': 'application/json',
                        Prefer: 'return=minimal',
                    },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) throw new Error(`Supabase returned ${response.status}`);

                form.reset();
                setStatus(
                    status,
                    'Thank you! Your project enquiry was sent successfully. We will be in touch shortly.',
                    'success',
                );
            } catch (error) {
                console.error('Project enquiry submission failed:', error);
                setStatus(
                    status,
                    'We could not send your enquiry. Please try again or email Commercial@orcreatives.com.',
                    'error',
                );
            } finally {
                if (button) {
                    button.disabled = false;
                    button.innerHTML = originalButtonContent;
                }
            }
        });
    });
})();
