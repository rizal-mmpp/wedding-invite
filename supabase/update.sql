-- Migration: update old_schema to new schema additions

-- Add guest_slug to rsvp_guests for group RSVP linkage
alter table if exists public.rsvp_guests
  add column if not exists guest_slug text;

-- Add is_group flag to guest_list for group invitations
alter table if exists public.guest_list
  add column if not exists is_group boolean not null default false;

-- Add live_stream_settings table for livestream link
create table if not exists public.live_stream_settings (
  id bigint primary key,
  url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists live_stream_settings_set_updated_at on public.live_stream_settings;
create trigger live_stream_settings_set_updated_at
before update on public.live_stream_settings
for each row
execute function public.set_updated_at();

alter table public.live_stream_settings enable row level security;

drop policy if exists "live_stream_settings_select" on public.live_stream_settings;
create policy "live_stream_settings_select"
on public.live_stream_settings
for select
using (true);

drop policy if exists "live_stream_settings_upsert" on public.live_stream_settings;
create policy "live_stream_settings_upsert"
on public.live_stream_settings
for insert
with check (true);

drop policy if exists "live_stream_settings_update" on public.live_stream_settings;
create policy "live_stream_settings_update"
on public.live_stream_settings
for update
using (true)
with check (true);
