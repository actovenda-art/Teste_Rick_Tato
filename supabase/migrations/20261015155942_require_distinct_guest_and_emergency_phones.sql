alter table public.ceflix_rsvps
    add constraint ceflix_rsvps_distinct_guest_and_emergency_phones
    check (
        regexp_replace(phone, '[^0-9]', '', 'g')
        <>
        regexp_replace(emergency_contact_phone, '[^0-9]', '', 'g')
    ) not valid;

comment on constraint ceflix_rsvps_distinct_guest_and_emergency_phones
on public.ceflix_rsvps is
    'The emergency contact number must differ from the guest number within the same RSVP.';
