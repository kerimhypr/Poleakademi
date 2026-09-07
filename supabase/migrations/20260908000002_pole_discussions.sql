-- Pole tartışmaları: herkesin açabildiği başlıklar
-- Pole'nin yazıları (articles) sadece admin tarafından oluşturulur ve resmi kalır

create table if not exists public.discussions (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 5 and 180),
  content jsonb not null default '{"type":"doc","content":[]}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists discussions_created_idx on public.discussions (created_at desc);
create index if not exists discussions_author_idx on public.discussions (author_id);

create table if not exists public.discussion_comments (
  id uuid primary key default gen_random_uuid(),
  discussion_id uuid not null references public.discussions(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.discussion_comments(id) on delete set null,
  body text not null check (char_length(trim(body)) between 1 and 3000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists discussion_comments_discussion_idx on public.discussion_comments (discussion_id, created_at);
create index if not exists discussion_comments_parent_idx on public.discussion_comments (parent_id);

-- updated_at trigger
drop trigger if exists discussions_updated_at on public.discussions;
create trigger discussions_updated_at before update on public.discussions
  for each row execute procedure public.set_updated_at();
drop trigger if exists discussion_comments_updated_at on public.discussion_comments;
create trigger discussion_comments_updated_at before update on public.discussion_comments
  for each row execute procedure public.set_updated_at();

-- parent aynı discussion içinde olmalı
create or replace function public.validate_discussion_comment_parent()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.parent_id is not null and not exists (
    select 1 from public.discussion_comments c where c.id = new.parent_id and c.discussion_id = new.discussion_id
  ) then
    raise exception 'A reply parent must belong to the same discussion';
  end if;
  return new;
end;
$$;
drop trigger if exists discussion_comments_validate_parent on public.discussion_comments;
create trigger discussion_comments_validate_parent before insert or update on public.discussion_comments
  for each row execute procedure public.validate_discussion_comment_parent();

-- RLS
alter table public.discussions enable row level security;
alter table public.discussion_comments enable row level security;

drop policy if exists "Discussions are public" on public.discussions;
create policy "Discussions are public" on public.discussions for select using (true);

drop policy if exists "Authenticated creates discussions" on public.discussions;
create policy "Authenticated creates discussions" on public.discussions for insert
  to authenticated with check (author_id = (select auth.uid()));

drop policy if exists "Authors update own discussions" on public.discussions;
create policy "Authors update own discussions" on public.discussions for update
  to authenticated using (author_id = (select auth.uid()) or private.is_admin())
  with check (author_id = (select auth.uid()) or private.is_admin());

drop policy if exists "Authors delete own discussions" on public.discussions;
create policy "Authors delete own discussions" on public.discussions for delete
  to authenticated using (author_id = (select auth.uid()) or private.is_admin());

drop policy if exists "Discussion comments are public" on public.discussion_comments;
create policy "Discussion comments are public" on public.discussion_comments for select using (true);

drop policy if exists "Authenticated comment on discussions" on public.discussion_comments;
create policy "Authenticated comment on discussions" on public.discussion_comments for insert
  to authenticated with check (author_id = (select auth.uid()));

drop policy if exists "Authors edit own discussion comments" on public.discussion_comments;
create policy "Authors edit own discussion comments" on public.discussion_comments for update
  to authenticated using (author_id = (select auth.uid()) or private.is_admin())
  with check (author_id = (select auth.uid()) or private.is_admin());

drop policy if exists "Authors delete own discussion comments" on public.discussion_comments;
create policy "Authors delete own discussion comments" on public.discussion_comments for delete
  to authenticated using (author_id = (select auth.uid()) or private.is_admin());

grant usage on schema public to anon, authenticated;
grant select on public.discussions, public.discussion_comments to anon;
grant select, insert, update, delete on public.discussions, public.discussion_comments to authenticated;
