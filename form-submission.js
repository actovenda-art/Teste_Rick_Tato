(() => {
    const SUPABASE_URL = 'https://gemobwwkeswjtkantogd.supabase.co';
    const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_CZcR0XlqZVTsiOZ5aEViqA_BrPXrATT';
    const WHATSAPP_NUMBER = '353899829356';
    const forms = document.querySelectorAll('[data-enquiry-form]');

    const locationLabels = {
        ireland: 'Ireland',
        'united-states': 'United States',
        other: 'Other',
    };

    const packageLabels = {
        starter: 'Starter — €150 / $170',
        business: 'Business — €400 / $450',
        premium: 'Premium — €900 / $1,025',
        'not-sure': 'Not sure yet',
        custom: 'Custom project',
    };

    const setStatus = (element, message, type = '') => {
        if (!element) return;
        element.textContent = message;
        element.classList.toggle('is-success', type === 'success');
        element.classList.toggle('is-error', type === 'error');
    };

    const value = (formData, field, maxLength) =>
        String(formData.get(field) || '').trim().slice(0, maxLength);

    const labelFor = (labels, rawValue) => labels[rawValue] || rawValue;

    const buildWhatsAppMessage = (details) => [
        `Hello, my name is "*${details.name}*", "*${details.message.replace(/\s+/g, ' ')}*".`,
        '',
        '*Form:*',
        `> *My full name:* "*${details.name}*"`,
        `> *My company name:* "*${details.businessName}*"`,
        `> *My email address:* "*${details.email}*"`,
        `> *My location:* "*${details.location}*"`,
        `> *Preferred plan:* "*${details.packageName}*"`,
    ].join('\n');

    forms.forEach((form) => {
        form.addEventListener('submit', (event) => {
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

            const name = value(formData, 'name', 120);
            const businessName = value(formData, 'business', 160);
            const email = value(formData, 'email', 254);
            const location = value(formData, 'location', 120);
            const packageName = value(formData, 'package', 80);
            const projectMessage = value(formData, 'message', 5000) || value(formData, 'project', 5000);

            const payload = {
                name,
                business_name: businessName,
                email: email.toLowerCase(),
                location,
                package: packageName,
                timeline: value(formData, 'timeline', 80) || null,
                message: projectMessage,
                source: form.dataset.formSource || 'home',
            };

            const whatsappMessage = buildWhatsAppMessage({
                name,
                businessName,
                email,
                location: labelFor(locationLabels, location),
                packageName: labelFor(packageLabels, packageName),
                message: projectMessage,
            });
            const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

            if (button) {
                button.disabled = true;
                button.textContent = 'Opening WhatsApp...';
            }
            setStatus(status, 'Opening WhatsApp with your completed enquiry...', 'success');

            fetch(`${SUPABASE_URL}/rest/v1/project_enquiries`, {
                method: 'POST',
                headers: {
                    apikey: SUPABASE_PUBLISHABLE_KEY,
                    'Content-Type': 'application/json',
                    Prefer: 'return=minimal',
                },
                body: JSON.stringify(payload),
                keepalive: true,
            })
                .then((response) => {
                    if (!response.ok) throw new Error(`Supabase returned ${response.status}`);
                })
                .catch((error) => {
                    console.error('Project enquiry storage failed:', error);
                });

            window.location.assign(whatsappUrl);

            window.setTimeout(() => {
                if (button) {
                    button.disabled = false;
                    button.innerHTML = originalButtonContent;
                }
            }, 1500);
        });
    });
})();
