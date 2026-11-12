create table public.ceflix_family_adults (
    id bigint generated always as identity primary key,
    user_id uuid not null references auth.users (id) on delete cascade,
    created_at timestamptz not null default now(),
    paid_at timestamptz not null default now(),
    full_name text not null check (char_length(full_name) between 3 and 160),
    payment_status text not null default 'paid' check (payment_status = 'paid'),
    checkout_session_id text not null check (checkout_session_id ~ '^cs_(test|live)_[A-Za-z0-9]+$'),
    ticket_position smallint not null check (ticket_position between 1 and 21),
    unit_amount_cents integer not null default 5000 check (unit_amount_cents = 5000),
    discount_cents integer not null default 0 check (discount_cents between 0 and 4950),
    amount_paid_cents integer not null check (amount_paid_cents between 50 and 5000),
    coupon_code text check (coupon_code is null or coupon_code ~ '^[A-Z0-9]{4}$'),
    constraint ceflix_family_adults_checkout_ticket_unique unique (checkout_session_id, ticket_position),
    constraint ceflix_family_adults_amount_matches check (
        amount_paid_cents = unit_amount_cents - discount_cents
    )
);

comment on table public.ceflix_family_adults is
    'One paid CEFLIX family ticket per adult. Rows are created only after Stripe confirms payment.';

create index ceflix_family_adults_paid_at_idx
on public.ceflix_family_adults (paid_at desc);

alter table public.ceflix_family_adults enable row level security;

revoke all on table public.ceflix_family_adults from anon, authenticated;
grant select, insert on table public.ceflix_family_adults to authenticated;

create policy "Family guests can read their own paid CEFLIX tickets"
on public.ceflix_family_adults
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Family guests can save their own paid CEFLIX tickets"
on public.ceflix_family_adults
for insert
to authenticated
with check ((select auth.uid()) = user_id and payment_status = 'paid');
