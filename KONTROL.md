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
✗ Fareyle öneri tıklama (mousedown) elle denenmedi, kod yolu klavyeyle aynı.

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
✗ Mobilde paneldeki dropdown'ların dokunmatikle kullanımı denenmedi.

## İlan sayfası
✓ Galeri: ← → , küçük resim, sayaç.
✗ Dokunmatik kaydırma (swipe) test edilmedi (kod touchstart/touchend).
✓ Kat planı sekmeleri, oda ölçüleri doğru ("4.6 × 3.9 m").
✓ Konum: kategori değişince pinler ve liste değişiyor; liste hover → pin 16px (`big`) ve fitBounds.
✓ Viewing formu: boş gönderimde 3 hata + `aria-invalid`; geçerli gönderimde "Request sent." ve "We'll call Aoife to confirm a time on Mon 19." (pazar atlanıyor).
✗ Share (navigator.share / panoya kopyalama) denenmedi.

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
