-- migrate:up
create table runs (
  id uuid primary key,
  engagement_id uuid not null references engagements(id) on delete cascade,
  status text not null,
  reason text,
  solc_matrix text[] not null default '{}',
  deterministic boolean,
  artifact_volume text not null,
  attempts jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create index runs_engagement_id_idx on runs (engagement_id);

-- migrate:down
drop table runs;
