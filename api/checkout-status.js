import Stripe from 'stripe';

const FAMILY_ADULT_PRICE_IN_CENTS = 5000;

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: 'Método não permitido.' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return response.status(503).json({ error: 'O pagamento ainda não está configurado.' });
  }

  const sessionId = Array.isArray(request.query?.session_id) ? request.query.session_id[0] : request.query?.session_id;
  if (typeof sessionId !== 'string' || !/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) {
    return response.status(400).json({ error: 'Sessão de pagamento inválida.' });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-02-25.clover' });
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const rsvpId = session.client_reference_id;
    const isCeflixPayment = session.metadata?.event === 'ceflix-2026'
      && session.metadata?.rsvp_id === rsvpId
      && /^\d{1,20}$/.test(rsvpId || '')
      && session.amount_total === 4000
      && session.currency === 'brl';

    const adultCount = Number(session.metadata?.adult_count);
    const discountCents = Number(session.metadata?.discount_cents || 0);
    const isFamilyPayment = session.metadata?.event === 'ceflix-family-2026'
      && session.metadata?.payment_reference === rsvpId
      && /^[0-9a-f-]{36}$/i.test(rsvpId || '')
      && Number.isInteger(adultCount)
      && adultCount >= 1
      && adultCount <= 21
      && Number.isInteger(discountCents)
      && discountCents >= 0
      && discountCents < FAMILY_ADULT_PRICE_IN_CENTS
      && session.amount_total === (adultCount * FAMILY_ADULT_PRICE_IN_CENTS) - discountCents
      && session.currency === 'brl';

    if (!isCeflixPayment && !isFamilyPayment) {
      return response.status(404).json({ error: 'Esta sessão não pertence ao pagamento do CEFLIX.' });
    }

    return response.status(200).json({
      paid: session.status === 'complete' && session.payment_status === 'paid',
      paymentStatus: session.payment_status,
      status: session.status,
      kind: isFamilyPayment ? 'family' : 'rsvp',
      rsvpId: isCeflixPayment ? rsvpId : undefined,
      paymentReference: isFamilyPayment ? rsvpId : undefined,
      adultCount: isFamilyPayment ? adultCount : undefined,
      discountCents: isFamilyPayment ? discountCents : undefined,
      couponCode: isFamilyPayment ? (session.metadata?.coupon_code || null) : undefined,
    });
  } catch (error) {
    console.error('Stripe Checkout status lookup failed', {
      type: error?.type,
      code: error?.code,
      requestId: error?.requestId,
    });
    return response.status(404).json({ error: 'Não foi possível confirmar este pagamento.' });
  }
}
