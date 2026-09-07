-- Yorum beğeni/dislike (like/dislike) - bug-free, idempotent

create table if not exists public.comment_votes (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.comments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  value smallint not null check (value in (1, -1)),
  created_at timestamptz not null default now(),
  unique(comment_id, user_id)
);
create index if not exists comment_votes_comment_idx on public.comment_votes (comment_id);
create index if not exists comment_votes_user_idx on public.comment_votes (user_id);

create table if not exists public.discussion_comment_votes (
  id uuid primary key default gen_random_uuid(),
  discussion_comment_id uuid not null references public.discussion_comments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  value smallint not null check (value in (1, -1)),
  created_at timestamptz not null default now(),
  unique(discussion_comment_id, user_id)
);
create index if not exists discussion_comment_votes_comment_idx on public.discussion_comment_votes (discussion_comment_id);
create index if not exists discussion_comment_votes_user_idx on public.discussion_comment_votes (user_id);

alter table public.comment_votes enable row level security;
alter table public.discussion_comment_votes enable row level security;

-- Herkes okur (puanlar public)
drop policy if exists "Comment votes are public" on public.comment_votes;
create policy "Comment votes are public" on public.comment_votes for select using (true);
drop policy if exists "Discussion comment votes are public" on public.discussion_comment_votes;
create policy "Discussion comment votes are public" on public.discussion_comment_votes for select using (true);

-- Sadece kendi oyunu ekleyebilir
drop policy if exists "Users insert own comment vote" on public.comment_votes;
create policy "Users insert own comment vote" on public.comment_votes for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "Users insert own discussion vote" on public.discussion_comment_votes;
create policy "Users insert own discussion vote" on public.discussion_comment_votes for insert to authenticated with check (user_id = (select auth.uid()));

-- Sadece kendi oyunu güncelleyebilir (like ↔ dislike arası geçiş)
drop policy if exists "Users update own comment vote" on public.comment_votes;
create policy "Users update own comment vote" on public.comment_votes for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists "Users update own discussion vote" on public.discussion_comment_votes;
create policy "Users update own discussion vote" on public.discussion_comment_votes for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Sadece kendi oyunu silebilir (toggle kapama)
drop policy if exists "Users delete own comment vote" on public.comment_votes;
create policy "Users delete own comment vote" on public.comment_votes for delete to authenticated using (user_id = (select auth.uid()));
drop policy if exists "Users delete own discussion vote" on public.discussion_comment_votes;
create policy "Users delete own discussion vote" on public.discussion_comment_votes for delete to authenticated using (user_id = (select auth.uid()));

grant select on public.comment_votes, public.discussion_comment_votes to anon;
grant select, insert, update, delete on public.comment_votes, public.discussion_comment_votes to authenticated;
