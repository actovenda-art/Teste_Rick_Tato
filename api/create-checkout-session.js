import Stripe from 'stripe';

const EVENT_PRICE_IN_CENTS = 4000;
const DEFAULT_ORIGIN = 'https://orcreatives.com';

function getSafeOrigin(request) {
  const forwardedHost = request.headers['x-forwarded-host'];
  const host = forwardedHost || request.headers.host;
  const forwardedProtocol = request.headers['x-forwarded-proto'];
  const candidate = request.headers.origin || (host ? `${forwardedProtocol || 'https'}://${host}` : DEFAULT_ORIGIN);

  try {
    const url = new URL(candidate);
    const isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    const isProjectHost = url.hostname === 'orcreatives.com' || url.hostname === 'www.orcreatives.com' || url.hostname.endsWith('.vercel.app');
    if ((url.protocol === 'https:' && isProjectHost) || (url.protocol === 'http:' && isLocal)) return url.origin;
  } catch {
    // Fall back to the canonical production domain.
  }

  return DEFAULT_ORIGIN;
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Método não permitido.' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return response.status(503).json({ error: 'O pagamento ainda não está configurado.' });
  }

  const rsvpId = String(request.body?.rsvpId || '');
  if (!/^\d{1,20}$/.test(rsvpId)) {
    return response.status(400).json({ error: 'Confirmação de presença inválida.' });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-02-25.clover' });
    const origin = getSafeOrigin(request);
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      locale: 'pt-BR',
      client_reference_id: rsvpId,
      metadata: { rsvp_id: rsvpId, event: 'ceflix-2026' },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'brl',
            unit_amount: EVENT_PRICE_IN_CENTS,
            product_data: {
              name: 'CEFLIX — Aniversário da Cecilia',
              description: 'Contribuição individual para o evento de 28 de novembro de 2026',
            },
          },
        },
      ],
      success_url: `${origin}/cecilia/?pagamento=sucesso&session_id={CHECKOUT_SESSION_ID}#confirmar-presenca`,
      cancel_url: `${origin}/cecilia/?pagamento=cancelado#confirmar-presenca`,
    });

    return response.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe Checkout session creation failed', {
      type: error?.type,
      code: error?.code,
      requestId: error?.requestId,
    });
    return response.status(500).json({ error: 'Não foi possível abrir o pagamento. Tente novamente.' });
  }
}
