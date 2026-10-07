create table public.ceflix_rsvps (
    id bigint generated always as identity primary key,
    user_id uuid not null references auth.users (id) on delete cascade,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    full_name text not null check (char_length(full_name) between 3 and 160),
    birth_date date not null,
    is_minor boolean generated always as (birth_date > date '2008-11-28') stored,
    cpf text not null check (cpf ~ '^[0-9]{11}$'),
    phone text not null check (char_length(phone) between 10 and 20),
    email text check (
        email is null
        or (
            char_length(email) <= 254
            and email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
        )
    ),
    emergency_contact_name text not null check (char_length(emergency_contact_name) between 3 and 160),
    emergency_contact_relationship text not null check (char_length(emergency_contact_relationship) between 2 and 80),
    emergency_contact_phone text not null check (char_length(emergency_contact_phone) between 10 and 20),
    address text not null check (char_length(address) between 10 and 500),
    allergy_restrictions text check (allergy_restrictions is null or char_length(allergy_restrictions) <= 2000),
    medications text check (medications is null or char_length(medications) <= 2000),
    dietary_restrictions text check (dietary_restrictions is null or char_length(dietary_restrictions) <= 2000),
    physical_limitations text check (physical_limitations is null or char_length(physical_limitations) <= 2000),
    health_notes text check (health_notes is null or char_length(health_notes) <= 3000),
    personal_document_path text not null check (char_length(personal_document_path) between 10 and 500),
    guardian_name text check (guardian_name is null or char_length(guardian_name) between 3 and 160),
    guardian_authorization_path text check (guardian_authorization_path is null or char_length(guardian_authorization_path) between 10 and 500),
    guardian_document_path text check (guardian_document_path is null or char_length(guardian_document_path) between 10 and 500),
    payment_choice text not null check (payment_choice in ('now', 'later')),
    payment_status text not null default 'pending' check (payment_status in ('pending', 'proof_sent', 'confirmed')),
    payment_proof_path text check (payment_proof_path is null or char_length(payment_proof_path) between 10 and 500),
    privacy_consent_at timestamptz not null,
    constraint ceflix_rsvps_one_per_user unique (user_id),
    constraint ceflix_rsvps_guardian_files_for_minors check (
        not is_minor
        or (
            guardian_name is not null
            and guardian_authorization_path is not null
            and guardian_document_path is not null
        )
    ),
    constraint ceflix_rsvps_payment_proof_when_paying_now check (
        payment_choice = 'later'
        or payment_proof_path is not null
    )
);

comment on table public.ceflix_rsvps is
    'Private RSVPs for Cecilia''s 18th birthday on 2026-11-28.';

create or replace function public.ceflix_set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger ceflix_rsvps_set_updated_at
before update on public.ceflix_rsvps
for each row execute function public.ceflix_set_updated_at();

alter table public.ceflix_rsvps enable row level security;

revoke all on table public.ceflix_rsvps from anon, authenticated;
grant select, insert, update on table public.ceflix_rsvps to authenticated;

create policy "Guests can read their own CEFLIX RSVP"
on public.ceflix_rsvps
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Guests can create their own CEFLIX RSVP"
on public.ceflix_rsvps
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Guests can update their own CEFLIX RSVP"
on public.ceflix_rsvps
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'ceflix-private',
    'ceflix-private',
    false,
    8388608,
    array['image/jpeg', 'image/png', 'application/pdf']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "Guests can upload their own CEFLIX documents"
on storage.objects
for insert
to authenticated
with check (
    bucket_id = 'ceflix-private'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "Guests can read their own CEFLIX documents"
on storage.objects
for select
to authenticated
using (
    bucket_id = 'ceflix-private'
    and owner_id = (select auth.uid()::text)
);

create policy "Guests can remove their own CEFLIX documents"
on storage.objects
for delete
to authenticated
using (
    bucket_id = 'ceflix-private'
    and owner_id = (select auth.uid()::text)
);
