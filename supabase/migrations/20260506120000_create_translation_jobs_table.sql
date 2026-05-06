create table if not exists public.translation_jobs (
  id uuid default gen_random_uuid() primary key,
  menu_id uuid not null references public.menus(id) on delete cascade,
  entity_type text not null check (entity_type in ('product', 'category', 'promotion')),
  entity_id uuid not null,
  fields jsonb not null default '{}'::jsonb,
  target_languages text[] not null default array['en', 'pt'],
  status text not null default 'pending' check (status in ('pending', 'processing', 'done', 'failed')),
  retries integer not null default 0 check (retries >= 0),
  error_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  processed_at timestamptz,
  unique (entity_id, entity_type)
);

create index if not exists idx_translation_jobs_menu_status
  on public.translation_jobs(menu_id, status);

create index if not exists idx_translation_jobs_status_created
  on public.translation_jobs(status, created_at)
  where status in ('pending', 'failed');

alter table public.translation_jobs enable row level security;

create policy "Translation jobs are viewable by menu owner"
  on public.translation_jobs
  for select
  to authenticated
  using (
    exists (
      select 1 from public.menus
      where id = translation_jobs.menu_id
        and user_id = auth.uid()
    )
  );

create policy "Translation jobs are insertable by menu owner"
  on public.translation_jobs
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.menus
      where id = translation_jobs.menu_id
        and user_id = auth.uid()
    )
  );

create policy "Translation jobs are updatable by menu owner"
  on public.translation_jobs
  for update
  to authenticated
  using (
    exists (
      select 1 from public.menus
      where id = translation_jobs.menu_id
        and user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.menus
      where id = translation_jobs.menu_id
        and user_id = auth.uid()
    )
  );

create policy "Translation jobs are deletable by menu owner"
  on public.translation_jobs
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.menus
      where id = translation_jobs.menu_id
        and user_id = auth.uid()
    )
  );
