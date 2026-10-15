alter table public.ceflix_rsvps
    add column blood_type text
    check (
        blood_type is null
        or blood_type in ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown')
    );

comment on column public.ceflix_rsvps.blood_type is
    'Guest blood type, or unknown when the guest does not know it.';
