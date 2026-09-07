-- Poleakademi complete schema - idempotent, extends existing Akayroom DB
-- Ensures clean Poleakademi platform on top of shared Supabase project
create extension if not exists "pgcrypto";
create schema if not exists private;
revoke all on schema private from public;

-- Types (idempotent)
do $$ begin
  create type public.user_role as enum ('user', 'admin');
exception when duplicate_object then null;
end $$;
do $$ begin
  create type public.article_status as enum ('draft', 'published');
exception when duplicate_object then null;
end $$;

-- Profiles: ensure table exists (may already exist from Akayroom with different columns)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  bio text not null default '',
  avatar_path text,
  title text,
  role public.user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- Add missing columns if table already existed with old schema
alter table public.profiles add column if not exists display_name text;
alter table public.profiles add column if not exists bio text not null default '';
alter table public.profiles add column if not exists avatar_path text;
alter table public.profiles add column if not exists title text check (char_length(title) <= 80);
alter table public.profiles add column if not exists role public.user_role not null default 'user';
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();
-- Backfill constraints: ensure display_name not null with check, but if existing rows have null, set default
update public.profiles set display_name = coalesce(nullif(trim(display_name), ''), coalesce(username, 'Yeni üye')) where display_name is null;
-- Try to add check constraints if not exists (ignore errors)
do $$ begin
  alter table public.profiles add constraint profiles_display_name_check check (char_length(display_name) between 2 and 60);
exception when duplicate_object then null;
end $$;
do $$ begin
  alter table public.profiles add constraint profiles_bio_check check (char_length(bio) <= 500);
exception when duplicate_object then null;
end $$;

-- Articles
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete restrict,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 5 and 180),
  excerpt text not null default '' check (char_length(excerpt) <= 350),
  cover_path text,
  content jsonb not null default '{"type":"doc","content":[]}'::jsonb,
  status public.article_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint published_has_date check ((status = 'draft') or published_at is not null)
);
create index if not exists articles_public_feed_idx on public.articles (published_at desc) where status = 'published';
-- Ensure slug unique etc already

-- Comments
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete set null,
  body text not null check (char_length(trim(body)) between 1 and 3000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists comments_article_created_idx on public.comments(article_id, created_at);
create index if not exists comments_parent_idx on public.comments(parent_id);

-- Private helper
create or replace function private.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), coalesce(nullif(trim(new.raw_user_meta_data ->> 'username'), ''), split_part(new.email, '@', 1), 'Yeni üye')))
  on conflict (id) do update set display_name = excluded.display_name;
  return new;
end;
$$;

create or replace function public.protect_profile_privileges()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not private.is_admin() and (new.role is distinct from old.role or new.title is distinct from old.title) then
    raise exception 'Role and title can only be changed by an administrator';
  end if;
  return new;
end;
$$;

create or replace function public.validate_comment_parent()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.parent_id is not null and not exists (
    select 1 from public.comments c where c.id = new.parent_id and c.article_id = new.article_id
  ) then
    raise exception 'A reply parent must belong to the same article';
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute procedure public.handle_new_user();
drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();
drop trigger if exists profiles_protect_privileges on public.profiles;
create trigger profiles_protect_privileges before update on public.profiles
  for each row execute procedure public.protect_profile_privileges();
drop trigger if exists articles_updated_at on public.articles;
create trigger articles_updated_at before update on public.articles
  for each row execute procedure public.set_updated_at();
drop trigger if exists comments_updated_at on public.comments;
create trigger comments_updated_at before update on public.comments
  for each row execute procedure public.set_updated_at();
drop trigger if exists comments_validate_parent on public.comments;
create trigger comments_validate_parent before insert or update on public.comments
  for each row execute procedure public.validate_comment_parent();

-- RLS
alter table public.profiles enable row level security;
alter table public.articles enable row level security;
alter table public.comments enable row level security;

drop policy if exists "Public profiles are readable" on public.profiles;
create policy "Public profiles are readable" on public.profiles for select using (true);
drop policy if exists "Members update only their profile" on public.profiles;
create policy "Members update only their profile" on public.profiles for update
  to authenticated using (id = (select auth.uid()) or private.is_admin())
  with check (id = (select auth.uid()) or private.is_admin());

drop policy if exists "Published articles are public; admins see all" on public.articles;
create policy "Published articles are public; admins see all" on public.articles for select
  using (status = 'published' or private.is_admin());
drop policy if exists "Admins create articles" on public.articles;
create policy "Admins create articles" on public.articles for insert
  to authenticated with check (private.is_admin() and author_id = (select auth.uid()));
drop policy if exists "Admins update articles" on public.articles;
create policy "Admins update articles" on public.articles for update
  to authenticated using (private.is_admin()) with check (private.is_admin());
drop policy if exists "Admins delete articles" on public.articles;
create policy "Admins delete articles" on public.articles for delete to authenticated using (private.is_admin());

drop policy if exists "Comments on published articles are readable" on public.comments;
create policy "Comments on published articles are readable" on public.comments for select
  using (exists (select 1 from public.articles a where a.id = article_id and (a.status = 'published' or private.is_admin())));
drop policy if exists "Members comment on published articles" on public.comments;
create policy "Members comment on published articles" on public.comments for insert
  to authenticated
  with check (
    author_id = (select auth.uid())
    and exists (select 1 from public.articles a where a.id = article_id and a.status = 'published')
  );
drop policy if exists "Authors edit own comments; admins edit all" on public.comments;
create policy "Authors edit own comments; admins edit all" on public.comments for update
  to authenticated using (author_id = (select auth.uid()) or private.is_admin())
  with check (author_id = (select auth.uid()) or private.is_admin());
drop policy if exists "Authors delete own comments; admins delete all" on public.comments;
create policy "Authors delete own comments; admins delete all" on public.comments for delete
  to authenticated using (author_id = (select auth.uid()) or private.is_admin());

-- Storage buckets
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true), ('article-covers', 'article-covers', true)
on conflict (id) do nothing;
drop policy if exists "Public avatar reads" on storage.objects;
create policy "Public avatar reads" on storage.objects for select using (bucket_id = 'avatars');
drop policy if exists "User uploads own avatar folder" on storage.objects;
create policy "User uploads own avatar folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "User updates own avatar folder" on storage.objects;
create policy "User updates own avatar folder" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "User deletes own avatar folder" on storage.objects;
create policy "User deletes own avatar folder" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "Public cover reads" on storage.objects;
create policy "Public cover reads" on storage.objects for select using (bucket_id = 'article-covers');
drop policy if exists "Admins upload covers" on storage.objects;
create policy "Admins upload covers" on storage.objects for insert to authenticated
  with check (bucket_id = 'article-covers' and private.is_admin());
drop policy if exists "Admins update covers" on storage.objects;
create policy "Admins update covers" on storage.objects for update to authenticated
  using (bucket_id = 'article-covers' and private.is_admin()) with check (private.is_admin());
drop policy if exists "Admins delete covers" on storage.objects;
create policy "Admins delete covers" on storage.objects for delete to authenticated
  using (bucket_id = 'article-covers' and private.is_admin());

grant usage on schema public to anon, authenticated;
grant select on public.profiles, public.articles, public.comments to anon;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.articles, public.comments to authenticated;
grant usage on schema private to anon, authenticated;
grant execute on function private.is_admin() to anon, authenticated;
revoke execute on function public.handle_new_user(), public.protect_profile_privileges(), public.validate_comment_parent(), public.set_updated_at() from public, anon, authenticated;
