-- Migration: update old_schema to new schema additions

-- Add guest_slug to rsvp_guests for group RSVP linkage
alter table if exists public.rsvp_guests
  add column if not exists guest_slug text;

-- Add is_group flag to guest_list for group invitations
alter table if exists public.guest_list
  add column if not exists is_group boolean not null default false;
