-- migrate:up
create table engagements (
  id uuid primary key default gen_random_uuid(),
  repo_url text not null,
  commit_sha text not null,
  scope_globs text[] not null default '{}',
  docs_links text[] not null default '{}',
  deadline date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- migrate:down
drop table engagements;
