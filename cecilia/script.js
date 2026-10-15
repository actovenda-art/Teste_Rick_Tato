const opening = document.querySelector('.opening');
const openingContent = document.querySelector('.opening__content');
const openingVeil = document.querySelector('.opening__veil');

const preventGestureZoom = (event) => event.preventDefault();
document.addEventListener('gesturestart', preventGestureZoom, { passive: false });
document.addEventListener('gesturechange', preventGestureZoom, { passive: false });
document.addEventListener('gestureend', preventGestureZoom, { passive: false });

let lastTouchEnd = 0;
document.addEventListener('touchend', (event) => {
  const now = Date.now();
  if (now - lastTouchEnd <= 300) event.preventDefault();
  lastTouchEnd = now;
}, { passive: false });

let ticking = false;

function updateOpening() {
  if (!opening || !openingContent || !openingVeil) return;

  const progress = Math.min(1, Math.max(0, window.scrollY / Math.max(opening.offsetHeight, 1)));
  const eased = progress * progress * (3 - 2 * progress);

  openingContent.style.opacity = String(Math.max(0, 1 - progress * 1.55));
  openingContent.style.transform = `translateY(${(-1 - eased * 5).toFixed(2)}rem) scale(${(1 - eased * 0.045).toFixed(3)})`;
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

const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });

reveals.forEach((element) => observer.observe(element));
window.addEventListener('scroll', requestOpeningUpdate, { passive: true });
window.addEventListener('resize', requestOpeningUpdate, { passive: true });
updateOpening();

const EVENT_DATE = new Date('2026-11-28T12:00:00-03:00');
const PAYMENT_DEADLINE = '2026-10-31';
const SUPABASE_URL = 'https://gemobwwkeswjtkantogd.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_CZcR0XlqZVTsiOZ5aEViqA_BrPXrATT';
const STORAGE_BUCKET = 'ceflix-private';
const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

const rsvpForm = document.querySelector('[data-rsvp-form]');

function onlyDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

function normalizeBrazilianPhone(value) {
  const digits = onlyDigits(value);
  if (/^0055\d{10,11}$/.test(digits)) return digits.slice(4);
  if (/^55\d{10,11}$/.test(digits)) return digits.slice(2);
  return digits;
}

function containsStandaloneWord(value, word) {
  const normalizedWords = String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .split(/[^a-z]+/)
    .filter(Boolean);
  return normalizedWords.includes(word);
}

function isValidCpf(value) {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  const calculateDigit = (length) => {
    let sum = 0;
    for (let index = 0; index < length; index += 1) {
      sum += Number(cpf[index]) * (length + 1 - index);
    }
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  return calculateDigit(9) === Number(cpf[9]) && calculateDigit(10) === Number(cpf[10]);
}

function isMinorOnEventDate(birthDate) {
  if (!birthDate) return false;
  const eighteenthBirthday = new Date(`${birthDate}T12:00:00`);
  eighteenthBirthday.setFullYear(eighteenthBirthday.getFullYear() + 18);
  return eighteenthBirthday > EVENT_DATE;
}

if (rsvpForm) {
  const steps = [...rsvpForm.querySelectorAll('[data-form-step]')];
  const progressSteps = [...rsvpForm.querySelectorAll('[data-progress-step]')];
  const backButton = rsvpForm.querySelector('[data-form-back]');
  const nextButton = rsvpForm.querySelector('[data-form-next]');
  const submitButton = rsvpForm.querySelector('[data-form-submit]');
  const status = rsvpForm.querySelector('[data-form-status]');
  const birthDateInput = rsvpForm.elements.birth_date;
  const guestPhoneInput = rsvpForm.elements.phone;
  const emergencyPhoneInput = rsvpForm.elements.emergency_contact_phone;
  const emergencyRelationshipInput = rsvpForm.elements.emergency_contact_relationship;
  const personalDocumentInput = rsvpForm.elements.personal_document;
  const documentReview = rsvpForm.querySelector('[data-document-review]');
  const guardianPanel = rsvpForm.querySelector('[data-guardian-panel]');
  const guardianInputs = ['guardian_name', 'guardian_authorization', 'guardian_document'].map((name) => rsvpForm.elements[name]);
  const stripePanel = rsvpForm.querySelector('[data-stripe-panel]');
  const reminderPanel = rsvpForm.querySelector('[data-reminder-panel]');
  const reminderDateInput = rsvpForm.elements.payment_reminder_date;
  const reminderPhoneInput = rsvpForm.elements.payment_reminder_phone;
  let currentStep = 0;

  const setStatus = (message = '', type = '') => {
    status.textContent = message;
    status.classList.toggle('is-error', type === 'error');
    status.classList.toggle('is-success', type === 'success');
  };

  const setDocumentReview = (message, type = '') => {
    documentReview.textContent = message;
    documentReview.classList.toggle('is-checking', type === 'checking');
    documentReview.classList.toggle('is-error', type === 'error');
    documentReview.classList.toggle('is-success', type === 'success');
  };

  const showStep = (index) => {
    currentStep = Math.max(0, Math.min(index, steps.length - 1));
    steps.forEach((step, stepIndex) => {
      const active = stepIndex === currentStep;
      step.hidden = !active;
      step.classList.toggle('is-active', active);
    });
    progressSteps.forEach((item, stepIndex) => {
      item.classList.toggle('is-active', stepIndex === currentStep);
      item.classList.toggle('is-complete', stepIndex < currentStep);
    });
    backButton.hidden = currentStep === 0;
    nextButton.hidden = currentStep === steps.length - 1;
    submitButton.hidden = currentStep !== steps.length - 1;
    setStatus();
  };

  const updateGuardianFields = () => {
    const minor = isMinorOnEventDate(birthDateInput.value);
    guardianPanel.hidden = !minor;
    guardianInputs.forEach((input) => {
      input.required = minor;
      if (!minor) input.setCustomValidity('');
    });
  };

  const validateFile = (input) => {
    const file = input.files?.[0];
    input.setCustomValidity('');
    if (!file) return !input.required;
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      input.setCustomValidity('Envie um arquivo JPG, PNG ou PDF.');
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      input.setCustomValidity('O arquivo deve ter no máximo 8 MB.');
      return false;
    }
    return true;
  };

  const validateStep = (index) => {
    if (index === 0) {
      validateDistinctPhones();
      validateEmergencyRelationship();
    }
    const fields = [...steps[index].querySelectorAll('input, textarea, select')].filter((input) => !input.disabled);
    for (const input of fields) {
      if (input.type === 'file') validateFile(input);
      if (!input.checkValidity()) {
        input.setAttribute('aria-invalid', 'true');
        input.reportValidity();
        return false;
      }
      input.removeAttribute('aria-invalid');
    }

    if (index === 0 && !isValidCpf(rsvpForm.elements.cpf.value)) {
      rsvpForm.elements.cpf.setCustomValidity('Digite um CPF válido.');
      rsvpForm.elements.cpf.reportValidity();
      return false;
    }
    return true;
  };

  const sanitizeFileName = (name) => {
    const pieces = String(name || 'arquivo').split('.');
    const extension = pieces.length > 1 ? `.${pieces.pop().toLowerCase().replace(/[^a-z0-9]/g, '')}` : '';
    const base = pieces.join('.').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 48) || 'arquivo';
    return `${base}${extension}`;
  };

  const nullableValue = (name) => {
    const text = String(rsvpForm.elements[name]?.value || '').trim();
    return text || null;
  };

  const validateDistinctPhones = () => {
    const guestPhone = normalizeBrazilianPhone(guestPhoneInput.value);
    const emergencyPhone = normalizeBrazilianPhone(emergencyPhoneInput.value);
    const duplicated = Boolean(guestPhone && emergencyPhone && guestPhone === emergencyPhone);
    emergencyPhoneInput.setCustomValidity(duplicated ? 'O contato de emergência deve ter um número diferente do convidado.' : '');
    return !duplicated;
  };

  const validateEmergencyRelationship = () => {
    const selfRelationship = containsStandaloneWord(emergencyRelationshipInput.value, 'eu');
    emergencyRelationshipInput.setCustomValidity(selfRelationship ? 'Informe o vínculo com outra pessoa. Não use “eu” ou “eu mesmo”.' : '');
    return !selfRelationship;
  };

  const textContainsCpf = (text, cpf) => onlyDigits(text).includes(cpf);

  const imageFileToCanvas = async (file) => {
    let image;
    let objectUrl;
    if (window.createImageBitmap) {
      image = await createImageBitmap(file);
    } else {
      objectUrl = URL.createObjectURL(file);
      image = new Image();
      image.src = objectUrl;
      await image.decode();
    }
    const sourceWidth = image.width || image.naturalWidth;
    const sourceHeight = image.height || image.naturalHeight;
    const scale = Math.min(3, Math.max(1, 1800 / sourceWidth), 2400 / sourceWidth);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(sourceWidth * scale));
    canvas.height = Math.max(1, Math.round(sourceHeight * scale));
    const context = canvas.getContext('2d', { alpha: false });
    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    image.close?.();
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    return canvas;
  };

  const pdfPagesForReview = async (file, cpf) => {
    if (!window.pdfjsLib?.getDocument) throw new Error('Não foi possível abrir o PDF para conferir o CPF. Envie uma imagem nítida ou tente novamente.');
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
    const pdf = await window.pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
    const canvases = [];
    try {
      const pagesToCheck = Math.min(pdf.numPages, 2);
      for (let pageNumber = 1; pageNumber <= pagesToCheck; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str || '').join(' ');
        if (textContainsCpf(pageText, cpf)) return { found: true, canvases: [] };

        const baseViewport = page.getViewport({ scale: 1 });
        const scale = Math.min(3, Math.max(1.6, 2200 / baseViewport.width));
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        await page.render({ canvasContext: canvas.getContext('2d', { alpha: false }), viewport }).promise;
        canvases.push(canvas);
      }
      return { found: false, canvases };
    } finally {
      await pdf.destroy();
    }
  };

  const verifyPersonalDocumentCpf = async () => {
    const file = personalDocumentInput.files?.[0];
    const cpf = onlyDigits(rsvpForm.elements.cpf.value);
    if (!file || !isValidCpf(cpf)) throw new Error('Confira o CPF e selecione o documento pessoal novamente.');
    if (!window.Tesseract?.createWorker) throw new Error('A leitura segura do documento não carregou. Verifique sua conexão e tente novamente.');

    setDocumentReview('Preparando o documento para conferir o CPF…', 'checking');
    let reviewTargets;
    if (file.type === 'application/pdf') {
      const pdfReview = await pdfPagesForReview(file, cpf);
      if (pdfReview.found) {
        setDocumentReview('CPF localizado no documento. Arquivo pronto para envio. ✓', 'success');
        return true;
      }
      reviewTargets = pdfReview.canvases;
    } else {
      reviewTargets = [await imageFileToCanvas(file)];
    }

    const worker = await window.Tesseract.createWorker('eng', 1, {
      logger: (message) => {
        if (message.status !== 'recognizing text') return;
        const progress = Math.max(1, Math.round((message.progress || 0) * 100));
        setDocumentReview(`Lendo o documento no seu navegador… ${progress}%`, 'checking');
      },
    });

    try {
      await worker.setParameters({
        tessedit_char_whitelist: '0123456789.-/ ',
        preserve_interword_spaces: '1',
      });
      for (const target of reviewTargets) {
        const result = await worker.recognize(target);
        if (textContainsCpf(result.data.text, cpf)) {
          setDocumentReview('CPF localizado no documento. Arquivo pronto para envio. ✓', 'success');
          return true;
        }
      }
    } finally {
      await worker.terminate();
    }

    setDocumentReview('O CPF informado não foi localizado. Envie uma foto nítida do documento correto, com o CPF legível.', 'error');
    personalDocumentInput.setCustomValidity('O documento precisa exibir o mesmo CPF informado no cadastro.');
    throw new Error('O CPF informado não foi localizado no documento pessoal. Confira o arquivo e tente novamente.');
  };

  const localIsoDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const updatePaymentFields = () => {
    const paymentChoice = rsvpForm.elements.payment_choice.value;
    const payingNow = paymentChoice === 'now';
    const payingLater = paymentChoice === 'later';

    stripePanel.hidden = !payingNow;
    reminderPanel.hidden = !payingLater;
    reminderDateInput.disabled = !payingLater;
    reminderPhoneInput.disabled = !payingLater;
    reminderDateInput.required = payingLater;
    reminderPhoneInput.required = payingLater;

    if (payingLater) {
      reminderDateInput.min = localIsoDate(new Date());
      reminderDateInput.max = PAYMENT_DEADLINE;
      if (!reminderPhoneInput.value.trim()) reminderPhoneInput.value = rsvpForm.elements.phone.value;
    } else {
      reminderDateInput.setCustomValidity('');
      reminderPhoneInput.setCustomValidity('');
    }
  };

  birthDateInput.addEventListener('change', updateGuardianFields);

  rsvpForm.elements.cpf.addEventListener('input', (event) => {
    const digits = onlyDigits(event.target.value).slice(0, 11);
    event.target.setCustomValidity('');
    event.target.value = digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  });

  rsvpForm.querySelectorAll('input, textarea, select').forEach((input) => {
    input.addEventListener('input', () => {
      input.removeAttribute('aria-invalid');
      if (input.name === 'phone' || input.name === 'emergency_contact_phone') {
        validateDistinctPhones();
      } else if (input.name === 'emergency_contact_relationship') {
        validateEmergencyRelationship();
      } else if (input.name !== 'cpf') {
        input.setCustomValidity('');
      }
    });
  });

  rsvpForm.querySelectorAll('input[type="file"]').forEach((input) => {
    input.addEventListener('change', () => {
      validateFile(input);
      const label = input.closest('.upload-field');
      const fileName = label?.querySelector('[data-file-name]');
      const file = input.files?.[0];
      if (input.name === 'personal_document') {
        input.setCustomValidity('');
        setDocumentReview(file ? 'Arquivo selecionado. O CPF será conferido antes do envio.' : 'A conferência do CPF acontecerá antes do envio.');
      }
      label?.classList.toggle('has-file', Boolean(file) && input.validationMessage === '');
      if (fileName && file) fileName.textContent = `${file.name} · ${(file.size / 1024 / 1024).toFixed(1)} MB`;
      if (!input.checkValidity()) input.reportValidity();
    });
  });

  rsvpForm.querySelectorAll('input[name="payment_choice"]').forEach((input) => {
    input.addEventListener('change', () => {
      updatePaymentFields();
      setStatus();
    });
  });

  nextButton.addEventListener('click', () => {
    if (!validateStep(currentStep)) return;
    if (currentStep === 0) updateGuardianFields();
    showStep(currentStep + 1);
  });

  backButton.addEventListener('click', () => showStep(currentStep - 1));

  rsvpForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!validateStep(currentStep) || !rsvpForm.checkValidity()) {
      rsvpForm.reportValidity();
      return;
    }

    const paymentChoice = rsvpForm.elements.payment_choice.value;
    if (!window.supabase?.createClient) {
      setStatus('Não foi possível carregar o envio seguro. Verifique sua conexão e tente novamente.', 'error');
      return;
    }

    submitButton.disabled = true;
    backButton.disabled = true;
    submitButton.textContent = 'Conferindo documento…';
    setStatus('Conferindo o CPF no documento antes do envio…');
    const uploadedPaths = [];
    let client;
    let rsvpSaved = false;

    try {
      await verifyPersonalDocumentCpf();
      setStatus('CPF conferido. Criando sua confirmação e protegendo os anexos…');
      client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
      let { data: sessionData } = await client.auth.getSession();
      let user = sessionData.session?.user;
      if (!user) {
        const { data, error } = await client.auth.signInAnonymously();
        if (error) throw new Error(error.code === 'anonymous_provider_disabled' ? 'O envio seguro precisa ser ativado pelo organizador.' : error.message);
        user = data.user;
      }
      if (!user) throw new Error('Não foi possível criar a sessão segura.');

      const upload = async (inputName, category) => {
        const file = rsvpForm.elements[inputName]?.files?.[0];
        if (!file) return null;
        if (!validateFile(rsvpForm.elements[inputName])) throw new Error(`Arquivo inválido em ${category}.`);
        const uniquePart = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        const path = `${user.id}/${category}/${uniquePart}-${sanitizeFileName(file.name)}`;
        const { error } = await client.storage.from(STORAGE_BUCKET).upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type });
        if (error) throw error;
        uploadedPaths.push(path);
        return path;
      };

      const minor = isMinorOnEventDate(birthDateInput.value);
      const personalDocumentPath = await upload('personal_document', 'documento-pessoal');
      const guardianAuthorizationPath = minor ? await upload('guardian_authorization', 'autorizacao-responsavel') : null;
      const guardianDocumentPath = minor ? await upload('guardian_document', 'documento-responsavel') : null;
      const payload = {
        user_id: user.id,
        full_name: nullableValue('full_name'),
        birth_date: birthDateInput.value,
        cpf: onlyDigits(rsvpForm.elements.cpf.value),
        phone: nullableValue('phone'),
        email: nullableValue('email')?.toLowerCase() || null,
        emergency_contact_name: nullableValue('emergency_contact_name'),
        emergency_contact_relationship: nullableValue('emergency_contact_relationship'),
        emergency_contact_phone: nullableValue('emergency_contact_phone'),
        address: nullableValue('address'),
        blood_type: nullableValue('blood_type'),
        allergy_restrictions: nullableValue('allergy_restrictions'),
        medications: nullableValue('medications'),
        dietary_restrictions: nullableValue('dietary_restrictions'),
        physical_limitations: nullableValue('physical_limitations'),
        health_notes: nullableValue('health_notes'),
        personal_document_path: personalDocumentPath,
        guardian_name: minor ? nullableValue('guardian_name') : null,
        guardian_authorization_path: guardianAuthorizationPath,
        guardian_document_path: guardianDocumentPath,
        // Keep the draft compatible with the currently deployed schema. A successful
        // Stripe return promotes it to "now/confirmed" below.
        payment_choice: 'later',
        payment_status: 'pending',
        payment_proof_path: null,
        payment_reminder_date: paymentChoice === 'later' ? reminderDateInput.value : null,
        payment_reminder_phone: paymentChoice === 'later' ? reminderPhoneInput.value.trim() : null,
        payment_reminder_status: paymentChoice === 'later' ? 'scheduled' : null,
        privacy_consent_at: new Date().toISOString(),
      };

      const { data: savedRsvp, error } = await client.from('ceflix_rsvps').upsert(payload, { onConflict: 'user_id' }).select('id').single();
      if (error) throw error;
      rsvpSaved = true;

      if (paymentChoice === 'now') {
        setStatus('Confirmação salva. Abrindo o checkout seguro da Stripe…');
        submitButton.textContent = 'Abrindo pagamento…';
        const checkoutResponse = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rsvpId: savedRsvp.id }),
        });
        const checkout = await checkoutResponse.json().catch(() => ({}));
        if (!checkoutResponse.ok || !checkout.url) throw new Error(checkout.error || 'Não foi possível abrir o pagamento.');
        window.location.assign(checkout.url);
        return;
      }

      const reminderDate = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo' }).format(new Date(`${reminderDateInput.value}T12:00:00-03:00`));
      setStatus(`Presença confirmada! Seu pedido de lembrete de pagamento para ${reminderDate} foi registrado. ✓`, 'success');
      submitButton.textContent = 'Presença confirmada ✓';
    } catch (error) {
      if (!rsvpSaved && uploadedPaths.length && client) {
        await client.storage.from(STORAGE_BUCKET).remove(uploadedPaths).catch(() => {});
      }
      setStatus(error?.message || 'Não foi possível enviar sua confirmação. Tente novamente.', 'error');
      submitButton.disabled = false;
      backButton.disabled = false;
      submitButton.textContent = 'Enviar confirmação';
    }
  });

  updateGuardianFields();
  updatePaymentFields();
  showStep(0);

  const checkoutParams = new URLSearchParams(window.location.search);
  const checkoutResult = checkoutParams.get('pagamento');
  const checkoutSessionId = checkoutParams.get('session_id');

  if (checkoutResult === 'cancelado') {
    showStep(steps.length - 1);
    setStatus('Pagamento cancelado. Sua confirmação foi salva e continua aguardando pagamento.', 'error');
    history.replaceState({}, '', `${window.location.pathname}#confirmar-presenca`);
  }

  if (checkoutResult === 'sucesso' && checkoutSessionId) {
    showStep(steps.length - 1);
    setStatus('Confirmando o pagamento com a Stripe…');
    fetch(`/api/checkout-status?session_id=${encodeURIComponent(checkoutSessionId)}`)
      .then(async (response) => {
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || 'Não foi possível confirmar o pagamento.');
        if (!result.paid) {
          setStatus('Pagamento recebido e ainda em processamento. A confirmação será atualizada assim que a Stripe concluir.', 'success');
          return;
        }

        setStatus('Pagamento confirmado! Sua presença no CEFLIX está garantida. ✓', 'success');
        if (!window.supabase?.createClient || !result.rsvpId) return;
        const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
        const { data: sessionData } = await client.auth.getSession();
        if (sessionData.session?.user) {
          try {
            const { error: updateError } = await client.from('ceflix_rsvps').update({
              payment_choice: 'now',
              payment_status: 'confirmed',
              payment_proof_path: `stripe-checkout:${checkoutSessionId}`,
            }).eq('id', result.rsvpId);
            if (updateError) console.warn('Pagamento confirmado; sincronização da presença pendente.', updateError);
          } catch (error) {
            console.warn('Pagamento confirmado; sincronização da presença pendente.', error);
          }
        }
      })
      .catch((error) => setStatus(error?.message || 'Não foi possível confirmar o pagamento.', 'error'))
      .finally(() => history.replaceState({}, '', `${window.location.pathname}#confirmar-presenca`));
  }
}

const galleryDialog = document.querySelector('[data-gallery-dialog]');
const galleryImage = document.querySelector('[data-gallery-image]');
const galleryCaption = document.querySelector('[data-gallery-caption]');
const galleryItems = [
  { src: '/cecilia/assets/chacara/chacara-03.jpeg', alt: 'Piscina da Chácara Miracatu com salão de festas ao fundo', caption: 'Piscina e salão — o cenário da Sunshine Party.' },
  { src: '/cecilia/assets/chacara/chacara-02.jpeg', alt: 'Jardim arborizado com lago e ponte de madeira', caption: 'Jardim com lago, ponte e muito verde.' },
  { src: '/cecilia/assets/chacara/chacara-01.jpeg', alt: 'Área coberta com mesas de bilhar e pebolim', caption: 'Área de jogos com bilhar e pebolim.' },
  { src: '/cecilia/assets/chacara/chacara-04.jpeg', alt: 'Vista da varanda de madeira para a piscina e as palmeiras', caption: 'Vista da varanda para a piscina.' },
  { src: '/cecilia/assets/chacara/chacara-05.jpeg', alt: 'Salão coberto com churrasqueira e balcão de tijolos', caption: 'Salão coberto com churrasqueira.' },
];

if (galleryDialog && galleryImage && galleryCaption) {
  let galleryIndex = 0;

  const renderGalleryItem = (index) => {
    galleryIndex = (index + galleryItems.length) % galleryItems.length;
    const item = galleryItems[galleryIndex];
    galleryImage.src = item.src;
    galleryImage.alt = item.alt;
    galleryCaption.textContent = `${galleryIndex + 1} de ${galleryItems.length} · ${item.caption}`;
  };

  document.querySelectorAll('[data-gallery-open]').forEach((button) => {
    button.addEventListener('click', () => {
      renderGalleryItem(Number(button.dataset.galleryOpen));
      if (typeof galleryDialog.showModal === 'function') galleryDialog.showModal();
      else window.open(galleryImage.src, '_blank', 'noopener');
    });
  });

  galleryDialog.querySelector('[data-gallery-close]').addEventListener('click', () => galleryDialog.close());
  galleryDialog.querySelector('[data-gallery-previous]').addEventListener('click', () => renderGalleryItem(galleryIndex - 1));
  galleryDialog.querySelector('[data-gallery-next]').addEventListener('click', () => renderGalleryItem(galleryIndex + 1));
  galleryDialog.addEventListener('click', (event) => {
    if (event.target === galleryDialog) galleryDialog.close();
  });
  galleryDialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') renderGalleryItem(galleryIndex - 1);
    if (event.key === 'ArrowRight') renderGalleryItem(galleryIndex + 1);
  });
}

window.addEventListener('load', () => {
  if (!window.location.hash) return;
  const target = document.querySelector(window.location.hash);
  if (!target) return;
  const previousBehavior = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = 'auto';
  target.scrollIntoView({ block: 'start' });
  document.documentElement.style.scrollBehavior = previousBehavior;
});
