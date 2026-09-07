# Supabase kurulum sırası

1. Supabase projesinde `001_initial_schema.sql` dosyasını SQL Editor üzerinden **tek sefer** çalıştırın.
2. Migration `avatars` ve `article-covers` adlı iki public-okunabilir Storage bucket'ını otomatik oluşturur. Dashboard'da bucketlar önceden yaratılmışsa migration onları değiştirmez.
3. Auth > Users'dan ana yönetici ve test yöneticisi hesaplarını normal şekilde oluşturun. İki Auth UUID'sini aşağıdaki komutta kullanın:

```sql
update public.profiles
set role = 'admin'
where id in ('ANA_ADMIN_AUTH_UUID', 'TEST_ADMIN_AUTH_UUID');
```

Bu iki hesabı migration içine gömmeyin; UUID'ler proje başına farklıdır. Tüm yeni kayıtlar tetikleyiciyle `user` rolü alır. Migration örnek makale, yorum veya kullanıcı içeriği eklemez.

4. Auth > URL Configuration alanında üretim URL'sini `Site URL` olarak girin ve şu iki adresi `Redirect URLs` listesine ekleyin:

```text
https://alanadiniz.com/auth/confirm
https://alanadiniz.com/sifre-yenile
```

Yerelde bunların `http://localhost:3000/...` karşılıklarını ekleyin. E-posta doğrulaması ve şifre yenileme bu güvenli dönüş akışını kullanır.
