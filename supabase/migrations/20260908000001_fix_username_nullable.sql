-- Fix: allow profiles without username (Poleakademi uses display_name)
alter table public.profiles alter column username drop not null;
-- Update handle_new_user to set both username and display_name for compatibility
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare uname text;
begin
  uname := coalesce(nullif(trim(new.raw_user_meta_data ->> 'username'), ''), nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), split_part(new.email, '@', 1));
  if uname is null or char_length(uname) < 3 then uname := 'user_' || substring(md5(random()::text), 1, 6); end if;
  if exists (select 1 from public.profiles where username = uname) then
    uname := uname || '_' || substring(md5(random()::text), 1, 4);
  end if;
  insert into public.profiles (id, username, display_name, bio)
  values (new.id, uname, coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), uname), '')
  on conflict (id) do update set display_name = excluded.display_name;
  return new;
end;
$$;
