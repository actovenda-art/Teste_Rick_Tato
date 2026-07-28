create table if not exists public.project_enquiries (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default now(),
    name text not null check (char_length(name) between 2 and 120),
    business_name text not null check (char_length(business_name) between 2 and 160),
    email text not null check (
        char_length(email) <= 254
        and email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
    ),
    location text not null check (char_length(location) between 2 and 120),
    package text not null check (char_length(package) between 2 and 80),
    timeline text check (timeline is null or char_length(timeline) <= 80),
    message text not null check (char_length(message) between 10 and 5000),
    source text not null default 'website' check (source in ('home', 'contact')),
    status text not null default 'new' check (
        status in ('new', 'contacted', 'qualified', 'closed', 'spam')
    )
);

create index if not exists project_enquiries_created_at_idx
    on public.project_enquiries (created_at desc);

create index if not exists project_enquiries_status_idx
    on public.project_enquiries (status);

alter table public.project_enquiries enable row level security;

revoke all on table public.project_enquiries from anon, authenticated;

grant usage on schema public to anon, authenticated;

grant insert (
    name,
    business_name,
    email,
    location,
    package,
    timeline,
    message,
    source
) on table public.project_enquiries to anon, authenticated;

drop policy if exists "Public visitors can submit project enquiries"
    on public.project_enquiries;

create policy "Public visitors can submit project enquiries"
    on public.project_enquiries
    for insert
    to anon, authenticated
    with check (
        source in ('home', 'contact')
        and status = 'new'
    );

comment on table public.project_enquiries is
    'Project enquiries submitted through the OR Creatives website.';
