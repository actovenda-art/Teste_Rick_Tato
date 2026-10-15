alter table public.ceflix_rsvps
    drop constraint if exists ceflix_rsvps_payment_proof_when_paying_now;

alter table public.ceflix_rsvps
    drop constraint if exists ceflix_rsvps_payment_status_check;

alter table public.ceflix_rsvps
    add constraint ceflix_rsvps_payment_status_check
    check (
        payment_status in (
            'pending',
            'checkout_pending',
            'paid',
            'failed',
            'canceled',
            'proof_sent',
            'confirmed'
        )
    );

comment on column public.ceflix_rsvps.payment_status is
    'Payment state. Supports Stripe Checkout states and preserves the legacy confirmation states.';
