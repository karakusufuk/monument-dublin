# Monument — ikinci kontrol (Claude Code talimatı)

Bu belgenin tamamı tek iştir. Soru sormadan, onay beklemeden baştan sona uygula. Proje: `~/Desktop/portUK/monument-dublin/monument-site/`. Tasarım kaynağı: `~/Desktop/portUK/monument-dublin/monument-paket/` (`PROMPT.md` + `reference/*.dc.html`). PROMPT.md ile reference çelişirse PROMPT.md geçerlidir (ör. telefon numarası, Save düğmesinin olmaması bilinçli).

## Zaten doğrulananlar (tekrar etme)
Metin karşılaştırması yapıldı: reference ekranlarındaki metinler sitede var; eksik görünenler şablon değişkenleri ya da PROMPT.md'nin bilerek çıkardığı şeyler. Yasaklar temiz: özel imleç yok, kaydırma ele geçirilmiyor, gradyan yok, glass sadece açılış header'ında, yasaklı font yok, pembe sadece pin, logo "m" ve vurgu yerlerinde. Her sayfada tek h1, favicon ve og etiketleri var.

## Yapılacaklar

1. **Gözle karşılaştırma (asıl iş).** İlk kontrolde ekran görüntülerinin hepsine bakılmadı. Şimdi 1440×900 ve 390×844'te her sayfanın **görünüm boyu** (tam sayfa değil, kaydırarak ardışık) ekran görüntülerini yeniden al ve **her birini tek tek aç, bak**. Her ekranı `reference/` içindeki karşılığının kaynağındaki ölçü, boşluk, font boyutu/ağırlığı, renk, hizalama ve bölüm sırasıyla karşılaştır (reference dosyalarını çalıştırma, kaynağını oku). Eşleşmeyen her şeyi düzelt, düzeltilen ekranın görüntüsünü yeniden al.
   - Ekran listesi: Main, HeroScroll (durum 2), Properties (+ hover), Listing, Areas, About, Contact, Valuation (adım 1, 4, bitiş), MobileHome, MobileProperties, Banners (alt sayfa başlıkları).
2. **Mobil mini harita.** 390 px'te ana sayfa vitrin listesini gerçek dokunmatik kaydırmayla aşağı kaydır. Haritanın ekrana en yakın karta taşındığını en az 3 kartta doğrula. Çalışmıyorsa düzelt.
3. **Hero sticky.** Tam sayfa görüntüde görünen boşluğun gerçekten sadece yakalama artefaktı olduğunu görünüm boyu görüntülerle doğrula.
4. **Kapsam dışı, yapma:** admin paneli (bilinçli karar, ayrı bir CMS ileride yapılacak). `site` adresi (`monument.example`) yayın adresi belli olunca değişecek; şimdilik dokunma.
5. **Bitiş.** `KONTROL.md` sonuna "İkinci kontrol" bölümü ekle: her ekran için ✓ ya da ✗ + ne düzeltildi. Yeni sapma varsa `SAPMALAR.md`'ye ekle. `npm run build` hatasız geçsin. Değişiklikleri tek commit olarak kaydet.
