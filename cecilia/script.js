const opening = document.querySelector('.opening');
const openingContent = document.querySelector('.opening__content');
const openingVeil = document.querySelector('.opening__veil');

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
const SUPABASE_URL = 'https://gemobwwkeswjtkantogd.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_CZcR0XlqZVTsiOZ5aEViqA_BrPXrATT';
const STORAGE_BUCKET = 'ceflix-private';
const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

// Preencha estes três campos para liberar o QR Code Pix real.
const PIX_CONFIG = Object.freeze({
  key: '',
  recipient: '',
  city: '',
  amount: '40.00',
});

const rsvpForm = document.querySelector('[data-rsvp-form]');

function onlyDigits(value) {
  return String(value || '').replace(/\D/g, '');
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

function normalizePixText(value, maxLength) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9 $%*+\-./:]/g, '')
    .toUpperCase()
    .slice(0, maxLength);
}

function pixField(id, value) {
  const text = String(value);
  return `${id}${String(text.length).padStart(2, '0')}${text}`;
}

function crc16(payload) {
  let result = 0xffff;
  for (let index = 0; index < payload.length; index += 1) {
    result ^= payload.charCodeAt(index) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      result = (result & 0x8000) !== 0 ? ((result << 1) ^ 0x1021) & 0xffff : (result << 1) & 0xffff;
    }
  }
  return result.toString(16).toUpperCase().padStart(4, '0');
}

function buildPixPayload(config) {
  const merchantAccount = pixField('00', 'BR.GOV.BCB.PIX') + pixField('01', config.key.trim()) + pixField('02', 'CEFLIX');
  const additionalData = pixField('05', '***');
  const withoutChecksum = [
    pixField('00', '01'),
    pixField('01', '12'),
    pixField('26', merchantAccount),
    pixField('52', '0000'),
    pixField('53', '986'),
    pixField('54', config.amount),
    pixField('58', 'BR'),
    pixField('59', normalizePixText(config.recipient, 25)),
    pixField('60', normalizePixText(config.city, 15)),
    pixField('62', additionalData),
    '6304',
  ].join('');
  return withoutChecksum + crc16(withoutChecksum);
}

if (rsvpForm) {
  const steps = [...rsvpForm.querySelectorAll('[data-form-step]')];
  const progressSteps = [...rsvpForm.querySelectorAll('[data-progress-step]')];
  const backButton = rsvpForm.querySelector('[data-form-back]');
  const nextButton = rsvpForm.querySelector('[data-form-next]');
  const submitButton = rsvpForm.querySelector('[data-form-submit]');
  const status = rsvpForm.querySelector('[data-form-status]');
  const birthDateInput = rsvpForm.elements.birth_date;
  const guardianPanel = rsvpForm.querySelector('[data-guardian-panel]');
  const guardianInputs = ['guardian_name', 'guardian_authorization', 'guardian_document'].map((name) => rsvpForm.elements[name]);
  const pixPanel = rsvpForm.querySelector('[data-pix-panel]');
  const pixPlaceholder = rsvpForm.querySelector('[data-pix-placeholder]');
  const pixMessage = rsvpForm.querySelector('[data-pix-message]');
  const proofField = rsvpForm.querySelector('[data-proof-field]');
  const proofInput = rsvpForm.elements.payment_proof;
  const pixReady = Boolean(PIX_CONFIG.key && PIX_CONFIG.recipient && PIX_CONFIG.city);
  let currentStep = 0;

  const setStatus = (message = '', type = '') => {
    status.textContent = message;
    status.classList.toggle('is-error', type === 'error');
    status.classList.toggle('is-success', type === 'success');
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

  const renderPix = () => {
    pixPanel.hidden = false;
    if (!pixReady) {
      pixMessage.textContent = 'O QR Code será liberado assim que a chave Pix, o nome e a cidade do recebedor forem configurados.';
      proofField.hidden = true;
      proofInput.required = false;
      return;
    }

    pixPlaceholder.innerHTML = '';
    if (window.QRCode) {
      new window.QRCode(pixPlaceholder, { text: buildPixPayload(PIX_CONFIG), width: 112, height: 112, correctLevel: window.QRCode.CorrectLevel.M });
    }
    pixMessage.textContent = `Escaneie para pagar a contribuição para ${PIX_CONFIG.recipient}. Depois, anexe o comprovante.`;
    proofField.hidden = false;
    proofInput.required = true;
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

  birthDateInput.addEventListener('change', updateGuardianFields);

  rsvpForm.elements.cpf.addEventListener('input', (event) => {
    const digits = onlyDigits(event.target.value).slice(0, 11);
    event.target.setCustomValidity('');
    event.target.value = digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  });

  rsvpForm.querySelectorAll('input, textarea').forEach((input) => {
    input.addEventListener('input', () => {
      input.removeAttribute('aria-invalid');
      if (input.name !== 'cpf') input.setCustomValidity('');
    });
  });

  rsvpForm.querySelectorAll('input[type="file"]').forEach((input) => {
    input.addEventListener('change', () => {
      validateFile(input);
      const label = input.closest('.upload-field');
      const fileName = label?.querySelector('[data-file-name]');
      const file = input.files?.[0];
      label?.classList.toggle('has-file', Boolean(file) && input.validationMessage === '');
      if (fileName && file) fileName.textContent = `${file.name} · ${(file.size / 1024 / 1024).toFixed(1)} MB`;
      if (!input.checkValidity()) input.reportValidity();
    });
  });

  rsvpForm.querySelectorAll('input[name="payment_choice"]').forEach((input) => {
    input.addEventListener('change', () => {
      if (input.value === 'now' && input.checked) renderPix();
      if (input.value === 'later' && input.checked) {
        pixPanel.hidden = true;
        proofField.hidden = true;
        proofInput.required = false;
      }
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
    if (paymentChoice === 'now' && !pixReady) {
      setStatus('O pagamento imediato ainda aguarda a configuração da chave Pix. Escolha “Pagar outro dia” para enviar agora.', 'error');
      return;
    }

    if (!window.supabase?.createClient) {
      setStatus('Não foi possível carregar o envio seguro. Verifique sua conexão e tente novamente.', 'error');
      return;
    }

    submitButton.disabled = true;
    backButton.disabled = true;
    submitButton.textContent = 'Enviando com segurança…';
    setStatus('Criando sua confirmação e protegendo os anexos…');
    const uploadedPaths = [];
    let client;

    try {
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
      const paymentProofPath = paymentChoice === 'now' ? await upload('payment_proof', 'comprovante-pix') : null;

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
        allergy_restrictions: nullableValue('allergy_restrictions'),
        medications: nullableValue('medications'),
        dietary_restrictions: nullableValue('dietary_restrictions'),
        physical_limitations: nullableValue('physical_limitations'),
        health_notes: nullableValue('health_notes'),
        personal_document_path: personalDocumentPath,
        guardian_name: minor ? nullableValue('guardian_name') : null,
        guardian_authorization_path: guardianAuthorizationPath,
        guardian_document_path: guardianDocumentPath,
        payment_choice: paymentChoice,
        payment_status: paymentChoice === 'now' ? 'proof_sent' : 'pending',
        payment_proof_path: paymentProofPath,
        privacy_consent_at: new Date().toISOString(),
      };

      const { error } = await client.from('ceflix_rsvps').upsert(payload, { onConflict: 'user_id' });
      if (error) throw error;

      setStatus(paymentChoice === 'now' ? 'Presença enviada! O comprovante ficará aguardando a conferência da organização.' : 'Presença enviada! Lembre-se de realizar o pagamento até 31/10.', 'success');
      submitButton.textContent = 'Confirmação enviada ✓';
    } catch (error) {
      if (uploadedPaths.length && client) {
        await client.storage.from(STORAGE_BUCKET).remove(uploadedPaths).catch(() => {});
      }
      setStatus(error?.message || 'Não foi possível enviar sua confirmação. Tente novamente.', 'error');
      submitButton.disabled = false;
      backButton.disabled = false;
      submitButton.textContent = 'Enviar confirmação';
    }
  });

  updateGuardianFields();
  showStep(0);
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
