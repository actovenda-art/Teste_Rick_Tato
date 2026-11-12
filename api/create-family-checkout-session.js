import Stripe from 'stripe';
import { randomUUID } from 'node:crypto';

const ADULT_PRICE_IN_CENTS = 5000;
const DEFAULT_ORIGIN = 'https://orcreatives.com';
const MAX_ADULTS = 21;

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
    // Use the production domain when the incoming origin is not trusted.
  }

  return DEFAULT_ORIGIN;
}

function normalizeName(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

function parseAdults(value) {
  if (!Array.isArray(value) || value.length < 1 || value.length > MAX_ADULTS) return null;
  const adults = value.map(normalizeName);
  if (adults.some((name) => name.length < 3 || name.length > 160)) return null;
  return adults;
}

async function findEligiblePromotionCode(stripe, rawCode) {
  const code = String(rawCode || '').trim().toUpperCase();
  if (!code) return null;
  if (!/^[A-Z0-9]{4}$/.test(code)) throw new Error('O cupom deve ter quatro letras ou números.');

  const promotionCodes = await stripe.promotionCodes.list({ code, active: true, limit: 10 });
  const promotionCode = promotionCodes.data.find((item) => (
    item.active
    && item.metadata?.event === 'ceflix-family-2026'
    && item.metadata?.discount_scope === 'one-adult-ticket'
    && item.coupon?.valid
    && item.coupon?.currency === 'brl'
    && Number.isInteger(item.coupon?.amount_off)
    && item.coupon.amount_off > 0
    && item.coupon.amount_off < ADULT_PRICE_IN_CENTS
  ));

  if (!promotionCode) throw new Error('Cupom inválido, expirado ou já utilizado.');
  return promotionCode;
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Método não permitido.' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return response.status(503).json({ error: 'O pagamento ainda não está configurado.' });
  }

  const adults = parseAdults(request.body?.adults);
  if (!adults) return response.status(400).json({ error: 'Informe os nomes de todos os adultos da família.' });

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-02-25.clover' });
    const promotionCode = await findEligiblePromotionCode(stripe, request.body?.couponCode);
    const discountCents = promotionCode?.coupon?.amount_off || 0;
    const paymentReference = randomUUID();
    const origin = getSafeOrigin(request);
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      locale: 'pt-BR',
      client_reference_id: paymentReference,
      metadata: {
        event: 'ceflix-family-2026',
        payment_reference: paymentReference,
        adult_count: String(adults.length),
        discount_cents: String(discountCents),
        coupon_code: promotionCode?.code || '',
      },
      line_items: [
        {
          quantity: adults.length,
          price_data: {
            currency: 'brl',
            unit_amount: ADULT_PRICE_IN_CENTS,
            product_data: {
              name: 'CEFLIX — Presença familiar',
              description: 'Ingresso de adulto para o aniversário da Cecilia em 28 de novembro de 2026',
            },
          },
        },
      ],
      discounts: promotionCode ? [{ promotion_code: promotionCode.id }] : [],
      success_url: `${origin}/cecilia-familia/?pagamento=sucesso&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cecilia-familia/?pagamento=cancelado`,
    });

    return response.status(200).json({
      url: session.url,
      paymentReference,
      adultCount: adults.length,
      discountCents,
      couponCode: promotionCode?.code || null,
    });
  } catch (error) {
    console.error('Family Stripe Checkout session creation failed', {
      type: error?.type,
      code: error?.code,
      requestId: error?.requestId,
    });
    return response.status(400).json({ error: error?.message || 'Não foi possível abrir o pagamento. Tente novamente.' });
  }
}
