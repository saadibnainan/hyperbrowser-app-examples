-- Tracked URLs
create table if not exists public.tracked_urls (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  url text not null,
  frequency text not null check (frequency in ('hourly', '3-hourly', 'daily')),
  selectors text[] default '{}',
  created_at timestamptz default now()
);

-- Snapshots
create table if not exists public.snapshots (
  id uuid primary key default gen_random_uuid(),
  tracked_url_id uuid references public.tracked_urls(id) on delete cascade,
  html_path text not null,
  image_path text not null,
  created_at timestamptz default now()
);

-- Change events
create table if not exists public.changes (
  id uuid primary key default gen_random_uuid(),
  tracked_url_id uuid references public.tracked_urls(id) on delete cascade,
  snapshot_id uuid references public.snapshots(id) on delete cascade,
  diff_html text,
  pixel_change numeric,
  summary text,
  impact text,
  created_at timestamptz default now()
); 