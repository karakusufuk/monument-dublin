# KONTROL — Monument

Test: Chrome (headless, puppeteer-core) ile `astro preview` üzerinde, 1440×900 ve 390×844 (dokunmatik emülasyon). Ekran görüntüleri `kontrol/` klasöründe. Betikler projeye girmedi.

## Rotalar
✓ `/`, `/properties/`, 12 ilan sayfası, `/areas/`, `/about/`, `/contact/`, `/valuation/`, `/privacy/`, `/terms/` 200; olmayan adres 404 sayfasını gösteriyor.
✓ 1440 ve 390'da yatay taşma yok (21 ekran görüntüsü + ölçüm). Konsolda hata yok (404 sayfası hariç).
✗ Her ekran görüntüsünü tek tek gözle kontrol etmedim; ana sayfa, ilan, Properties kartı, Areas bandı (mobil) ve menü baktım. Tam sayfa görüntülerde ana sayfa hero'su sticky olduğu için boşluk gibi görünüyor, bu yakalama artefaktı.

## Hero ve header
✓ Yavaş kaydırma: p=0 başlık 1; 450px'te başlık 2 %67, arama %33; 700px'te ikisi tam.
✓ Hızlı kaydırma (100ms içinde 1000px): geçiş hemen son duruma geliyor, takılma yok.
✓ Fare tekerleği engellenmiyor (300px delta → scrollY 300).
✓ Header: üstte glass → hero bitince opak + daralmış (56px, "onument" genişlik 0, "m" pembe) → yukarı dönünce glass'a geri.
✓ Hareket azaltma açıkken: hero 100vh, sticky yok, başlık 1 ve arama çubuğu birlikte, başlık 2 gizli.
✓ About bandı hareket azaltmada animasyonsuz, cümle bir kez ortalı.
✓ About bandı normalde akıyor; üstüne gelince duruyor.

## Arama
✓ "ranel" → semt satırı + 2 ilan; "Cottage" → tür/kind eşleşmesi; "clóntarf" aksan duyarsız (3 sonuç).
✓ Ok tuşları, Esc kapatıyor, serbest metin + Enter → `/properties/?q=…`.
✓ Öneriye fareyle tıklama (mousedown): "rathm" → Rathmines önerisi → `/properties/?area=rathmines`.

## Ana sayfa vitrin ve Areas bandı
✓ Satır hover: koyu zemin, görsel ikiye bölünüyor, mini harita beliriyor. Tek MapLibre örneği (4. satıra geçince `maps=1`).
✓ Areas bandı: hover → harita kayıyor, kart metni ve "See homes" linki güncelleniyor; tıklama `/properties/?area=clontarf`.
✓ Mobil: ilk dokunuş semti seçiyor, ikinci dokunuş ilanlara gidiyor.
✗ Mobilde "ekrana en yakın karta mini harita taşınması" kaydırmayla elle denenmedi; kod yazıldı, ilk kart yerleşimi görüldü.

## Properties
✓ Area, Price (min+max), Bedrooms, Type, For sale/To rent, Sort çalışıyor; cümle spec sırasına göre kuruluyor ("1 home for sale in Rathmines between €500,000 and €1,500,000, 3+ bedrooms, houses only").
✓ URL güncelleniyor (`?area=…&min=…&max=…`), yenilenince filtreler geri geliyor, Clear filters varsayılana dönüyor.
✓ Boş sonuç bloğu; klavyeyle dropdown (ok + Enter).
✓ Hover yığını: zemin `--soft`, 01 `scale(.9)`, 02/03 döndürülmüş ve görünür.
✓ Mobil: "Filters · n" paneli açılıyor ("Show 9 homes"), foto şeridi scroll-snap, sağda 22px ipucu.
✓ Mobilde Filters paneli: Area dropdown'ı açılıyor, Rathmines seçilince URL `?area=rathmines`, düğme "Show 1 home".
✓ Mobil menü (375px): tam ekran, Properties/Areas/About/Contact + telefon ve e-posta.
✓ 375px'te 8 sayfanın hiçbirinde yatay taşma yok (ölçüm: scrollWidth 371).

## İlan sayfası
✓ Galeri: ← → , küçük resim, sayaç.
✓ Dokunmatik kaydırma (TouchEvent ile): sola 1→2, sağa 2→1; dikey ve 40px altı hareket slayt değiştirmiyor.
✓ Kat planı sekmeleri, oda ölçüleri doğru ("4.6 × 3.9 m").
✓ Konum: kategori değişince pinler ve liste değişiyor; liste hover → pin 16px (`big`) ve fitBounds.
✓ Viewing formu: boş gönderimde 3 hata + `aria-invalid`; geçerli gönderimde "Request sent." ve "We'll call Aoife to confirm a time on Mon 19." (pazar atlanıyor).
✓ Share: `navigator.share` yokken panoya yazıyor ve "Link copied" bildirimi çıkıyor (yerel sunucuda, pano taklit edilerek).

## Contact ve Valuation
✓ Contact: Selling notu, hata, başarı ("tomorrow morning" 17:00 sonrası).
✓ Valuation: 5 adım, Enter = Continue, hatalı Eircode, seçimsiz Continue pasif, Back cevapları koruyor, "Elsewhere in Dublin" bitiş metni.

## Lighthouse (mobil, yerel)
| Sayfa | Perf | A11y | BP | SEO | LCP |
|---|---|---|---|---|---|
| / | 96 | 100 | 100 | 100 | 2.5 s |
| /properties/ | 96 | 100 | 100 | 100 | 2.5 s |
| ilan (23 Beechwood) | 95 | 100 | 100 | 100 | 2.6 s |
| /areas/ | 98 | 100 | 100 | 100 | 2.3 s |
| /about/ | 98 | 100 | 100 | 100 | 2.2 s |
| /contact/ | 98 | 100 | 100 | 100 | 2.0 s |
| /valuation/ | 99 | 100 | 100 | 100 | 1.7 s |

Not: `/`, `/properties/` ve ilan sayfasında LCP 2.5 s sınırında; hedef <2.5 s. Perf 95+ olduğu için ayrıca optimize etmedim. İlan sayfasında ilk çalıştırmada `aria-allowed-attr` hatası vardı (sekmelerde `aria-pressed`), düzeltildi, yeniden ölçüldü.

## İkinci kontrol

Yöntem: Chrome (headless, puppeteer-core), `astro preview`, 1440×900 ve 390×844 (dokunmatik, 2x). Her sayfanın görünüm boyu ekran görüntüleri (kaydırarak ardışık) alındı, tek tek açılıp `reference/*.dc.html` kaynağındaki ölçü, boşluk, font ve sıra ile karşılaştırıldı. Görüntüler `kontrol/ikinci/` altında (git'e girmiyor). PROMPT.md ile reference çelişince PROMPT.md uygulandı.

| Ekran | 1440 | 390 | Ne düzeltildi |
|---|---|---|---|
| Main (hero, durum 2, Local, vitrin, Areas bandı, footer) | ✓ | ✓ | Mobilde arama placeholder'ı butonun altına taşıyordu, `text-overflow: ellipsis` eklendi. Gerisi eşleşiyor. |
| HeroScroll (durum 2) | ✓ | ✓ | Fark yok. |
| Properties (+ hover) | ✓ | ✓ | **Header fixed olduğu için içerik header'ın altında 96px değil, 8px boşlukla başlıyordu**; `.banner` üst boşluğu header yüksekliği eklenerek 184px (mobilde 108px) yapıldı. Hover: gri zemin, radius 20, döndürülmüş üç foto, kalın yazı reference ile aynı. |
| Listing | ✓ | ✓ | Breadcrumb'un üst boşluğu (34px → 56px), Share chip'i başlık bloğunun altına hizalı (reference), bilgi şeridinde sütun ayracı ve 24px iç boşluk, BER etiketinin yanına "BER D1" yazısı (4.5), şerit/başlık dikey aralıkları reference değerlerine çekildi. |
| Areas | ✓ | ✓ | Üst boşluk banner düzeltmesiyle geldi. "Homes now" ve "Price" yan yana (reference), satır aralıkları 18px, ilan kartı aralığı 10px. **Fiyat sırası ters yazılıyordu** ("€3,450 / month · €1,195,000"); satılık önce, kiralık sonra yapıldı (6.4). |
| About | ✓ | ✓ | Üst boşluk (reference 110px → 198px), eyebrow→h1 18px, Ekip bölümü aralığı 48 → 96px (reference). |
| Contact | ✓ | ✓ | Üst boşluk (198px). Bilgi listesinde etiket solda, değer **sağa hizalı** (reference ve 6.6), 18px. "I'm interested in" chip'leri arasında boşluk yoktu (8px eklendi). "(optional)" ince ve gri. |
| Valuation adım 1 | ✓ | ✓ | Header reference'taki gibi 1180px kenarlıklı hap oldu. İçerik 1180px, alan genişlikleri 560/640px. **Adım 1'de "Back" görünüyordu** (`.btn` `display` değeri `hidden` özelliğini eziyordu); genel `[hidden]{display:none!important}` eklendi. "Your home" Caslon 28px. |
| Valuation adım 4 | ✓ | ✓ | Back/Continue en alta sabitlendi (6.7 "en altta"). Seçenekler radius 18, 17px. |
| Valuation adım 5, bitiş | ✓ | ✓ | Name + Phone yan yana (reference). Kısa sayfalarda footer ekranın altında yüzüyordu (altında beyaz şerit); body min-height 100vh + main esnek, footer en alta yapıştı (Valuation, 404, Privacy, Terms). |
| MobileHome | – | ✓ | Fark yok (hero, vitrin kartları, Areas bandı). |
| MobileProperties | – | ✓ | Fark yok. Filtre paneli ve dropdown'lar daha önce denendi. |
| Banners (Privacy, Terms, 404) | ✓ | ✓ | Üst boşluk banner düzeltmesiyle geldi, footer alta yapıştı. |

### Mobil mini harita (gerçek dokunmatik kaydırma)
✓ 390px'te `Input.synthesizeScrollGesture` (touch) ile 420px'lik altı kaydırma. Harita ekranın ortasına en yakın karta taşındı: Apt 9 Gallery Quay → 118 Clontarf Road → Apt 4 88 Rathmines Road Lower → 6 Chelmsford Lane (4 ardışık kart). Her adımda en yakın kart ile haritanın bulunduğu kart aynıydı.

### Hero sticky boşluğu
✓ Boşluk yakalama artefaktı. Tam sayfa görüntüde hero 200vh (1800px) yer kaplıyor, sticky sahne içinde duruyor; sahne bitince bir sonraki bölüm 140px (spec) boşlukla başlıyor. Görünüm boyu görüntülerde (kaydırma 0, 900, 1650) boşluk yok, hero'nun altı doğrudan Local knowledge'a bağlanıyor. Mobilde 160vh için aynı ölçüm: hero alt kenarı 1350px, sonraki bölüm 72px sonra.

### Kapsam dışı bırakılanlar
Admin paneli ve `site` adresi (`monument.example`) talimat gereği değiştirilmedi.

### Hâlâ elle denenmeyenler
Gerçek bir telefonda (iOS Safari) dokunmatik deneme yapılmadı; testler Chrome'un dokunmatik emülasyonuyla yapıldı.
