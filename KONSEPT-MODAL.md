# Konsept modalı

Bileşen: `src/components/ConceptModal.astro` (Base.astro'da bir kez), mantık: `src/scripts/concept.ts` (`openConcept(kind, onClose)` + olay delegasyonu). Bağlantı: `CASE_STUDY_URL` in `src/config/site.ts`. Modal DOM id'leri `cpt*` (contact sayfasında `#cm` zaten bir input'tu).

## Tetikleyiciler
- Görüntüleme talebi (son onay): `src/scripts/listing.ts` (`#bform` submit) -> `viewing`
- Değerleme / offer (yalnız 5. adım submit): `src/scripts/valuation.ts` (`openConcept('valuation', finish)`) -> `valuation`
- İletişim formu: `src/scripts/contact.ts` (`#cform` submit) -> `contact`
- `tel:` linkleri (Header mobil menü, Footer, contact.astro, properties/[slug].astro) -> delegasyon, `phone`
- `mailto:` linkleri (Header, Footer, contact.astro) -> `email`
- Adres: Footer ve contact.astro'daki ofis adresi `data-concept="address"` link oldu; ayrıca Google/Apple/OSM harita bağlantıları delegasyonla yakalanır -> `address`
Onay -> modal -> kapanınca mevcut başarı ekranı (callback) çalışır. Hiçbir veri gönderilmez.

## Gövde metinleri ("In a live build, ...")
- viewing: this request would land in the agent's inbox and calendar, with the home and the chosen day attached.
- valuation: this request would go to a valuer's calendar, with the address and property details ready for the visit.
- contact: this message would reach the right negotiator's inbox, and a call back would be booked for you.
- phone: this would ring the agency's front desk.
- email: this would open a message to the agency.
- address: this would open directions to the office.

## Diğer
- Telefon: `+353 1 555 0147` -> `+353 1 234 5018` (`src/config/site.ts`, tek kaynak). Başka yerde sabit numara yok.
- `public/robots.txt`: `User-agent: *` + `Disallow: /`. Layout'taki noindex meta duruyor.
- Girişteki şerit (Base.astro) kaldırıldı; Footer altına `Portfolio demo, not a real business.` ve `Designed by Ufuk Karakuş` eklendi (eski "Concept site · Design by Ufuk Karakuş" kaldırıldı). Terms/privacy sayfalarındaki "fictional concept" metinlerine dokunulmadı.

## Belirsiz / eksik
- Sitede ayrı "offer" formu yok; "Get an offer" = valuation akışı, aynı modal metni.
- Harita bileşeni (contact) etkileşimsiz ve "get directions" bağlantısı yok; adres metni tetikleyici oldu.
- Instagram/LinkedIn bağlantıları zaten pasif (`#`).
- Odak tetikleyiciye dönüşü kod olarak var; arka plan sekmesinde otomatik testte `focus()` çalışmadığı için orada doğrulanamadı. Esc/Close/arka plan, focus trap, mobil bottom sheet ve üç form akışı tarayıcıda test edildi.
