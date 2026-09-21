-- Follow updates (email subscriptions)
-- Apply with: supabase db reset / migrate

create table if not exists follows (
  id text primary key,
  email text not null,
  entity_type text not null,
  entity_id text not null,
  entity_slug text not null,
  entity_title text not null,
  cadence text not null check (cadence in ('instant', 'weekly')),
  unsubscribe_token text not null unique,
  session_email text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists follows_active_email_entity_uidx
  on follows (email, entity_type, entity_id)
  where active = true;

create index if not exists follows_email_idx on follows (email);
create index if not exists follows_entity_idx on follows (entity_type, entity_id);
create index if not exists follows_cadence_active_idx on follows (cadence) where active = true;

create table if not exists follow_events (
  id text primary key,
  entity_type text not null,
  entity_id text not null,
  kind text not null,
  title text not null,
  summary text not null,
  href text not null,
  created_at timestamptz not null default now()
);

create index if not exists follow_events_entity_created_idx
  on follow_events (entity_type, entity_id, created_at desc);

create table if not exists follow_deliveries (
  id text primary key,
  follow_id text not null references follows(id) on delete cascade,
  event_id text references follow_events(id) on delete set null,
  channel text not null check (channel in ('instant', 'digest', 'ack')),
  sent_at timestamptz not null default now(),
  provider_id text
);

create unique index if not exists follow_deliveries_instant_uidx
  on follow_deliveries (follow_id, event_id)
  where channel = 'instant' and event_id is not null;

create index if not exists follow_deliveries_follow_idx on follow_deliveries (follow_id);
