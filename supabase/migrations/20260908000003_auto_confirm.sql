-- E-posta doğrulaması devre dışı: yeni kayıtlar otomatik onaylanır
create or replace function public.handle_auto_confirm()
returns trigger language plpgsql security definer set search_path = auth, public as $$
begin
  update auth.users set email_confirmed_at = now() where id = new.id and email_confirmed_at is null;
  return new;
end;
$$;
drop trigger if exists auto_confirm_user on auth.users;
create trigger auto_confirm_user after insert on auth.users for each row execute procedure public.handle_auto_confirm();
-- Mevcut bekleyenleri onayla
update auth.users set email_confirmed_at = now() where email_confirmed_at is null;
