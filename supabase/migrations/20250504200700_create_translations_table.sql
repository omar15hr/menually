create table if not exists public.translations (
  id uuid default gen_random_uuid() primary key,
  menu_id uuid not null references public.menus(id) on delete cascade,
  entity_type text not null check (entity_type in ('product', 'category', 'promotion')),
  entity_id uuid not null,
  field text not null check (field in ('name', 'description', 'title')),
  language text not null check (language in ('en', 'pt')),
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (entity_id, entity_type, field, language)
);

-- Index for efficient batch fetching by menu
create index if not exists idx_translations_menu_language
  on public.translations(menu_id, language);

-- Enable RLS
alter table public.translations enable row level security;

-- Policy: anyone can read translations (public menu view)
create policy "Translations are viewable by everyone"
  on public.translations
  for select
  to anon, authenticated
  using (true);

-- Policy: only menu owner can insert/update
create policy "Translations are insertable by menu owner"
  on public.translations
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.menus
      where id = translations.menu_id
        and user_id = auth.uid()
    )
  );

create policy "Translations are updatable by menu owner"
  on public.translations
  for update
  to authenticated
  using (
    exists (
      select 1 from public.menus
      where id = translations.menu_id
        and user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.menus
      where id = translations.menu_id
        and user_id = auth.uid()
    )
  );

create policy "Translations are deletable by menu owner"
  on public.translations
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.menus
      where id = translations.menu_id
        and user_id = auth.uid()
    )
  );
