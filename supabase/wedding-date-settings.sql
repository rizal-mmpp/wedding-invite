-- Migration: add wedding_date_settings table for customizable wedding date/time

create table if not exists public.wedding_date_settings (
  id bigint primary key,
  wedding_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists wedding_date_settings_set_updated_at on public.wedding_date_settings;
create trigger wedding_date_settings_set_updated_at
before update on public.wedding_date_settings
for each row
execute function public.set_updated_at();

alter table public.wedding_date_settings enable row level security;

drop policy if exists "wedding_date_settings_select" on public.wedding_date_settings;
create policy "wedding_date_settings_select"
on public.wedding_date_settings
for select
using (true);

drop policy if exists "wedding_date_settings_upsert" on public.wedding_date_settings;
create policy "wedding_date_settings_upsert"
on public.wedding_date_settings
for insert
with check (true);

drop policy if exists "wedding_date_settings_update" on public.wedding_date_settings;
create policy "wedding_date_settings_update"
on public.wedding_date_settings
for update
using (true)
with check (true);
