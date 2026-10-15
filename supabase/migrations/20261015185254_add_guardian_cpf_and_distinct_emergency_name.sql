alter table public.ceflix_rsvps
    add column guardian_cpf text;

alter table public.ceflix_rsvps
    add constraint ceflix_rsvps_guardian_cpf_format
    check (guardian_cpf is null or guardian_cpf ~ '^[0-9]{11}$'),
    add constraint ceflix_rsvps_guardian_cpf_for_minors
    check (not is_minor or guardian_cpf is not null) not valid,
    add constraint ceflix_rsvps_distinct_guest_and_emergency_names
    check (
        translate(
            lower(regexp_replace(btrim(full_name), '[[:space:]]+', ' ', 'g')),
            'áàâãäéèêëíìîïóòôõöúùûüç',
            'aaaaaeeeeiiiiooooouuuuc'
        )
        <>
        translate(
            lower(regexp_replace(btrim(emergency_contact_name), '[[:space:]]+', ' ', 'g')),
            'áàâãäéèêëíìîïóòôõöúùûüç',
            'aaaaaeeeeiiiiooooouuuuc'
        )
    ) not valid;

comment on column public.ceflix_rsvps.guardian_cpf is
    'Digits-only CPF of the legal guardian, required when the guest is a minor.';

comment on constraint ceflix_rsvps_distinct_guest_and_emergency_names
on public.ceflix_rsvps is
    'The emergency contact must be a different person from the guest after case, spacing, and accent normalization.';
