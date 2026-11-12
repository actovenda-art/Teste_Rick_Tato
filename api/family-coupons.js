import Stripe from 'stripe';
import { randomBytes } from 'node:crypto';

const ADULT_PRICE_IN_CENTS = 5000;
const ADMIN_LOGIN = 'Admin';
const ADMIN_PASSWORD = 'Acessoadmin';
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function createCode() {
  const bytes = randomBytes(4);
  return Array.from(bytes, (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join('');
}

function isAdmin(body) {
  return body?.login === ADMIN_LOGIN && body?.password === ADMIN_PASSWORD;
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Método não permitido.' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return response.status(503).json({ error: 'O pagamento ainda não está configurado.' });
  }

  if (!isAdmin(request.body)) return response.status(401).json({ error: 'Acesso não autorizado.' });

  const discountPercent = Number(request.body?.discountPercent);
  if (!Number.isInteger(discountPercent) || discountPercent < 1 || discountPercent > 99) {
    return response.status(400).json({ error: 'Informe um desconto inteiro entre 1% e 99%.' });
  }

  const discountCents = Math.round((ADULT_PRICE_IN_CENTS * discountPercent) / 100);

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-02-25.clover' });
    const coupon = await stripe.coupons.create({
      amount_off: discountCents,
      currency: 'brl',
      duration: 'once',
      name: `CEFLIX família — ${discountPercent}% em um ingresso`,
      metadata: {
        event: 'ceflix-family-2026',
        discount_scope: 'one-adult-ticket',
        discount_percent: String(discountPercent),
      },
    });

    let promotionCode;
    for (let attempt = 0; attempt < 6; attempt += 1) {
      try {
        promotionCode = await stripe.promotionCodes.create({
          coupon: coupon.id,
          code: createCode(),
          max_redemptions: 1,
          metadata: {
            event: 'ceflix-family-2026',
            discount_scope: 'one-adult-ticket',
          },
        });
        break;
      } catch (error) {
        if (error?.code !== 'resource_already_exists' || attempt === 5) throw error;
      }
    }

    return response.status(201).json({
      code: promotionCode.code,
      discountPercent,
      discountCents,
      value: (discountCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      message: `Cupom de ${discountPercent}% gerado para desconto em um ingresso adulto.`,
    });
  } catch (error) {
    console.error('Family coupon creation failed', {
      type: error?.type,
      code: error?.code,
      requestId: error?.requestId,
    });
    return response.status(500).json({ error: 'Não foi possível gerar o cupom agora.' });
  }
}
