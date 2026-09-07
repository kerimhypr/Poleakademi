# Poleakademi

Next.js App Router, Tailwind CSS ve Supabase ile hazırlanmış; felsefe, din ve eleştirel düşünce odaklı bir yayın ve tartışma platformu.

## Başlatma

```bash
npm install
cp .env.example .env.local
npm run dev
```

`.env.local` dosyasına Supabase proje URL'si ve anon key girilmelidir. Ardından [Supabase kurulum notlarını](./supabase/README.md) takip edin ve `supabase/migrations/001_initial_schema.sql` migration'ını çalıştırın.

## Bilinçli ürün kararları

- Seed, dummy makale ve örnek yorum **yoktur**. Ana sayfa, içerik yokken de tasarlanmış boş durum gösterir.
- Başlangıç adminleri Auth Dashboard'dan normal hesaplar olarak oluşturulur; UUID'leriyle tek seferlik SQL komutu çalıştırılarak role yükseltilir. Hiçbir admin kimliği kaynak kodda tutulmaz.
- Tiptap içeriği HTML yerine JSONB olarak saklanır. Makale çıktısı React bileşenleriyle üretilir; `dangerouslySetInnerHTML` kullanılmaz.
- Realtime aboneliği yoktur. Yorum ekleme server action ile yapılır ve yalnızca ilgili makale rotası tekrar doğrulanır.
- Route koruması kullanıcı deneyimi içindir; asıl yetki sınırı RLS politikaları, `is_admin()` ve tetikleyicilerdir.

## Güvenlik özeti

RLS, üyelerin rol ve unvan alanlarını doğrudan değiştirmesini engelleyen bir trigger ve Storage klasör politikaları migration içinde yer alır. `service_role` anahtarı bu uygulamada istemciye veya uygulama koduna verilmez. Supabase Auth e-posta doğrulamasını Dashboard'da açık tutmanız önerilir.

`NEXT_PUBLIC_SITE_URL` değerini canlı alan adınıza ayarlayın ve [Supabase kurulum notlarındaki](./supabase/README.md) Auth Redirect URL listesini uygulayın.
