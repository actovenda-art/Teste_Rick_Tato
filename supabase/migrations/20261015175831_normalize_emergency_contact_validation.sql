alter table public.ceflix_rsvps
    drop constraint if exists ceflix_rsvps_distinct_guest_and_emergency_phones;

alter table public.ceflix_rsvps
    add constraint ceflix_rsvps_distinct_guest_and_emergency_phones
    check (
        case
            when regexp_replace(phone, '[^0-9]', '', 'g') ~ '^0055[0-9]{10,11}$'
                then substring(regexp_replace(phone, '[^0-9]', '', 'g') from 5)
            when regexp_replace(phone, '[^0-9]', '', 'g') ~ '^55[0-9]{10,11}$'
                then substring(regexp_replace(phone, '[^0-9]', '', 'g') from 3)
            else regexp_replace(phone, '[^0-9]', '', 'g')
        end
        <>
        case
            when regexp_replace(emergency_contact_phone, '[^0-9]', '', 'g') ~ '^0055[0-9]{10,11}$'
                then substring(regexp_replace(emergency_contact_phone, '[^0-9]', '', 'g') from 5)
            when regexp_replace(emergency_contact_phone, '[^0-9]', '', 'g') ~ '^55[0-9]{10,11}$'
                then substring(regexp_replace(emergency_contact_phone, '[^0-9]', '', 'g') from 3)
            else regexp_replace(emergency_contact_phone, '[^0-9]', '', 'g')
        end
    ) not valid;

alter table public.ceflix_rsvps
    add constraint ceflix_rsvps_emergency_relationship_not_self
    check (
        lower(emergency_contact_relationship)
        !~ '(^|[^[:alpha:]])eu([^[:alpha:]]|$)'
    ) not valid;

comment on constraint ceflix_rsvps_distinct_guest_and_emergency_phones
on public.ceflix_rsvps is
    'The emergency contact number must differ from the guest number after Brazilian country-code normalization.';

comment on constraint ceflix_rsvps_emergency_relationship_not_self
on public.ceflix_rsvps is
    'The emergency contact relationship must identify another person and cannot contain the standalone word eu.';
