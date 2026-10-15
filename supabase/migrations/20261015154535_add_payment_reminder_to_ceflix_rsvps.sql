alter table public.ceflix_rsvps
    add column payment_reminder_date date,
    add column payment_reminder_phone text,
    add column payment_reminder_status text;

alter table public.ceflix_rsvps
    add constraint ceflix_rsvps_payment_reminder_phone_length
        check (
            payment_reminder_phone is null
            or char_length(payment_reminder_phone) between 10 and 20
        ),
    add constraint ceflix_rsvps_payment_reminder_status_check
        check (
            payment_reminder_status is null
            or payment_reminder_status in ('scheduled', 'sent', 'cancelled')
        ),
    add constraint ceflix_rsvps_payment_reminder_fields_together
        check (
            (payment_reminder_date is null and payment_reminder_phone is null and payment_reminder_status is null)
            or
            (payment_reminder_date is not null and payment_reminder_phone is not null and payment_reminder_status is not null)
        ),
    add constraint ceflix_rsvps_payment_reminder_deadline
        check (
            payment_reminder_date is null
            or payment_reminder_date <= date '2026-10-31'
        );

comment on column public.ceflix_rsvps.payment_reminder_date is
    'Date selected by the guest for a future payment reminder.';

comment on column public.ceflix_rsvps.payment_reminder_phone is
    'Phone or WhatsApp number supplied by the guest for the payment reminder.';

comment on column public.ceflix_rsvps.payment_reminder_status is
    'Reminder lifecycle: scheduled, sent, or cancelled.';
