-- Public contributions (arguments, polls, pages, comments, social)
-- Apply with: supabase db reset / migrate

create table if not exists contribution_authors (
  id text primary key,
  display_name text not null,
  email text,
  user_id text,
  created_at timestamptz not null default now()
);

create index if not exists contribution_authors_email_idx on contribution_authors (email);
create index if not exists contribution_authors_user_idx on contribution_authors (user_id);

create table if not exists contribution_arguments (
  id text primary key,
  entity_type text not null,
  entity_id text not null,
  author_id text not null references contribution_authors (id),
  side text not null check (side in ('for', 'against', 'nuance')),
  title text not null,
  body text not null,
  evidence_url text,
  status text not null default 'published' check (status in ('published', 'held', 'removed')),
  created_at timestamptz not null default now()
);

create index if not exists contribution_arguments_entity_idx
  on contribution_arguments (entity_type, entity_id, created_at desc);
create index if not exists contribution_arguments_status_idx on contribution_arguments (status);

create table if not exists argument_replies (
  id text primary key,
  argument_id text not null references contribution_arguments (id) on delete cascade,
  author_id text not null references contribution_authors (id),
  body text not null,
  status text not null default 'published' check (status in ('published', 'held', 'removed')),
  created_at timestamptz not null default now()
);

create index if not exists argument_replies_argument_idx
  on argument_replies (argument_id, created_at);

create table if not exists argument_reactions (
  id text primary key,
  argument_id text not null references contribution_arguments (id) on delete cascade,
  voter_key text not null,
  kind text not null check (kind in ('agree', 'disagree')),
  created_at timestamptz not null default now()
);

create unique index if not exists argument_reactions_voter_uidx
  on argument_reactions (argument_id, voter_key);
create index if not exists argument_reactions_argument_idx on argument_reactions (argument_id);

create table if not exists contribution_polls (
  id text primary key,
  entity_type text not null,
  entity_id text not null,
  author_id text not null references contribution_authors (id),
  question text not null,
  status text not null default 'published' check (status in ('published', 'held', 'removed')),
  created_at timestamptz not null default now()
);

create index if not exists contribution_polls_entity_idx
  on contribution_polls (entity_type, entity_id, created_at desc);

create table if not exists poll_options (
  id text primary key,
  poll_id text not null references contribution_polls (id) on delete cascade,
  label text not null,
  sort_order integer not null default 0
);

create index if not exists poll_options_poll_idx on poll_options (poll_id);

create table if not exists poll_votes (
  id text primary key,
  poll_id text not null references contribution_polls (id) on delete cascade,
  option_id text not null references poll_options (id) on delete cascade,
  voter_key text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists poll_votes_voter_uidx on poll_votes (poll_id, voter_key);
create index if not exists poll_votes_poll_idx on poll_votes (poll_id);

create table if not exists contribution_pages (
  id text primary key,
  entity_type text not null,
  entity_id text not null,
  author_id text not null references contribution_authors (id),
  title text not null,
  body text not null,
  status text not null default 'held' check (status in ('published', 'held', 'removed')),
  created_at timestamptz not null default now()
);

create index if not exists contribution_pages_entity_idx
  on contribution_pages (entity_type, entity_id, created_at desc);

create table if not exists contribution_comments (
  id text primary key,
  entity_type text not null,
  entity_id text not null,
  author_id text not null references contribution_authors (id),
  body text not null,
  parent_id text,
  status text not null default 'published' check (status in ('published', 'held', 'removed')),
  created_at timestamptz not null default now()
);

create index if not exists contribution_comments_entity_idx
  on contribution_comments (entity_type, entity_id, created_at desc);

create table if not exists contribution_social_posts (
  id text primary key,
  entity_type text not null,
  entity_id text not null,
  author_id text not null references contribution_authors (id),
  platform text not null,
  url text not null,
  title text not null,
  snippet text,
  status text not null default 'held' check (status in ('published', 'held', 'removed')),
  created_at timestamptz not null default now()
);

create index if not exists contribution_social_entity_idx
  on contribution_social_posts (entity_type, entity_id, created_at desc);
