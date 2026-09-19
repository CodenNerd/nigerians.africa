-- Nigerians.africa initial schema (TDD-aligned)
-- Run with Supabase CLI when available: supabase db reset

create extension if not exists postgis;
create extension if not exists vector;
create extension if not exists pg_trgm;

create type verification_status as enum (
  'verified',
  'official_record',
  'reported',
  'unverified',
  'disputed',
  'corrected',
  'ai_generated',
  'insufficient_evidence',
  'under_review',
  'withdrawn'
);

create type entity_type as enum (
  'person', 'office', 'institution', 'problem', 'project', 'money',
  'place', 'organization', 'evidence', 'report', 'response', 'event', 'claim', 'source'
);

create table sources (
  id text primary key,
  type text not null,
  title text not null,
  publisher text not null,
  url text,
  publication_date date,
  description text,
  reliability text,
  created_at timestamptz default now()
);

create table locations (
  id text primary key,
  slug text unique not null,
  name text not null,
  type text not null,
  parent_id text references locations(id),
  lat double precision,
  lng double precision,
  geom geography(point),
  summary text,
  population text,
  created_at timestamptz default now()
);

create table people (
  id text primary key,
  slug text unique not null,
  full_name text not null,
  aliases text[] default '{}',
  bio text,
  photo_initials text,
  is_public_personality boolean default false,
  classification text,
  published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table government_institutions (
  id text primary key,
  slug text unique not null,
  name text not null,
  type text not null,
  level text not null,
  parent_id text references government_institutions(id),
  mandate text,
  description text,
  website text,
  location_id text references locations(id),
  published boolean default true,
  created_at timestamptz default now()
);

create table government_offices (
  id text primary key,
  slug text unique not null,
  institution_id text references government_institutions(id),
  name text not null,
  title text,
  mandate text,
  responsibilities text[] default '{}',
  level text,
  published boolean default true,
  created_at timestamptz default now()
);

create table office_tenures (
  id text primary key,
  person_id text references people(id),
  office_id text references government_offices(id),
  start_date date,
  end_date date,
  appointment_type text,
  source_id text references sources(id)
);

create table problems (
  id text primary key,
  slug text unique not null,
  title text not null,
  category text,
  description text,
  severity text,
  urgency text,
  status text,
  first_reported_at date,
  verification_status verification_status default 'unverified',
  published boolean default true,
  created_at timestamptz default now()
);

create table projects (
  id text primary key,
  slug text unique not null,
  name text not null,
  description text,
  problem_id text references problems(id),
  location_id text references locations(id),
  responsible_office_id text references government_offices(id),
  funding_source text,
  approved_amount numeric,
  released_amount numeric,
  reported_spend numeric,
  start_date date,
  expected_end_date date,
  status text,
  verification_status verification_status default 'unverified',
  published boolean default true,
  created_at timestamptz default now()
);

create table budgets (
  id text primary key,
  slug text unique not null,
  title text not null,
  government_level text,
  institution_id text references government_institutions(id),
  fiscal_year int,
  amount numeric,
  description text
);

create table allocations (
  id text primary key,
  slug text unique not null,
  budget_id text references budgets(id),
  program text,
  amount numeric,
  recipient text,
  project_id text references projects(id),
  released boolean default false,
  released_amount numeric default 0,
  gap_note text,
  source_id text references sources(id)
);

create table evidence (
  id text primary key,
  slug text,
  type text,
  title text not null,
  description text,
  source_id text references sources(id),
  captured_at date,
  location_id text references locations(id),
  verification_status verification_status default 'unverified',
  related_entity_type entity_type,
  related_entity_id text,
  file_path text,
  file_hash text,
  published boolean default true,
  created_at timestamptz default now()
);

create table citizen_reports (
  id text primary key,
  slug text unique,
  title text,
  description text not null,
  location_id text references locations(id),
  captured_at timestamptz,
  submitted_at timestamptz default now(),
  status text default 'submitted',
  verification_status verification_status default 'reported',
  problem_id text references problems(id),
  project_id text references projects(id),
  office_id text references government_offices(id),
  privacy_level text default 'community',
  published boolean default false,
  submitter_user_id uuid,
  created_at timestamptz default now()
);

create table official_responses (
  id text primary key,
  statement text not null,
  responding_institution_id text references government_institutions(id),
  responding_person_id text references people(id),
  target_type entity_type,
  target_id text,
  published_at timestamptz,
  source_id text references sources(id)
);

create table entity_relationships (
  id text primary key,
  from_entity_type entity_type not null,
  from_entity_id text not null,
  relationship_type text not null,
  to_entity_type entity_type not null,
  to_entity_id text not null,
  source_id text references sources(id),
  confidence real default 1
);

create table memory_events (
  id text primary key,
  event_type text,
  entity_type entity_type,
  entity_id text,
  date date,
  description text,
  source_id text references sources(id)
);

create table organizations (
  id text primary key,
  slug text unique not null,
  name text not null,
  type text,
  mission text,
  description text,
  registration_number text,
  website text,
  location_id text references locations(id),
  funding_received numeric,
  funding_spent numeric,
  transparency_notes text,
  published boolean default true
);

create table claims (
  id text primary key,
  slug text unique,
  statement text not null,
  kind text,
  person_id text references people(id),
  date date,
  context text,
  status verification_status default 'unverified'
);

create table civic_events (
  id text primary key,
  slug text unique not null,
  title text not null,
  type text,
  date date,
  location_id text references locations(id),
  summary text,
  status text
);

create table election_results (
  id text primary key,
  election_id text references civic_events(id),
  polling_unit_id text references locations(id),
  candidate text,
  party text,
  official_votes int,
  observer_votes int
);

create table result_discrepancies (
  id text primary key,
  election_id text references civic_events(id),
  polling_unit_id text references locations(id),
  description text,
  official_total int,
  observer_total int,
  difference int,
  status text,
  note text
);

create table civic_guidance_topics (
  id text primary key,
  slug text unique not null,
  title text not null,
  category text,
  situation text,
  rights text[] default '{}',
  evidence_to_keep text[] default '{}',
  report_paths text[] default '{}',
  next_steps text[] default '{}'
);

create table record_versions (
  id bigserial primary key,
  entity_type entity_type,
  entity_id text,
  version int,
  payload jsonb,
  reason text,
  actor_id uuid,
  created_at timestamptz default now()
);

create table audit_logs (
  id bigserial primary key,
  actor_id uuid,
  action text,
  entity_type entity_type,
  entity_id text,
  before jsonb,
  after jsonb,
  reason text,
  created_at timestamptz default now()
);

create table embeddings (
  id bigserial primary key,
  entity_type entity_type,
  entity_id text,
  content text,
  embedding vector(1536),
  created_at timestamptz default now()
);

create index locations_geom_idx on locations using gist (geom);
create index problems_title_trgm on problems using gin (title gin_trgm_ops);
create index projects_name_trgm on projects using gin (name gin_trgm_ops);
create index people_name_trgm on people using gin (full_name gin_trgm_ops);

alter table problems enable row level security;
alter table projects enable row level security;
alter table people enable row level security;
alter table evidence enable row level security;
alter table citizen_reports enable row level security;
alter table organizations enable row level security;

create policy "Public read published problems" on problems for select using (published = true);
create policy "Public read published projects" on projects for select using (published = true);
create policy "Public read published people" on people for select using (published = true);
create policy "Public read published evidence" on evidence for select using (published = true);
create policy "Public read published reports" on citizen_reports for select using (published = true);
create policy "Public read published orgs" on organizations for select using (published = true);
