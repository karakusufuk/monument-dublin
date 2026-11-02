# Demo eylemleri (konsept modalı kaldırıldı, 2026-11-02)

"Concept site by Ufuk Karakuş" modalı (`ConceptModal.astro`, `scripts/concept.ts`, `CASE_STUDY_URL`) tamamen kaldırıldı. Kural: demo eylemi hiçbir mesaj göstermez, hiçbir şey yapmaz.

## Ne oluyor
- `tel:` / `mailto:` bağlantıları ve ofis adresi (`data-demo`): `src/scripts/common.ts` içindeki `demoLinks()` tıklamayı iptal eder. Arama başlamaz, mesaj çıkmaz. `<meta name="format-detection" content="telephone=no">` iOS'un düz metindeki numaraları bağlantıya çevirmesini engeller.
- Son onay düğmeleri görünür, etiketli, soluk (opacity .4) ve pasif (`disabled`); başarı ekranı yok:
  - Görüntüleme talebi: `Request viewing` (`properties/[slug].astro`)
  - Değerleme: 5. adımda `Request valuation` (`scripts/valuation.ts`, `show()`); geri dönünce Continue yeniden etkin
  - İletişim: `Send` (`contact.astro`)
- Hiçbir veri gönderilmez.

## Seçim kutuları
Yerel `<select>` yok. `components/Combo.astro` + `scripts/combo.ts` (Time of day, Area / valuation, Area / contact). Değer: düğmenin `data-value`'su (`comboValue()`), değişince `input` + `change` olayı. Yüklemede hiçbir seçenek seçili değil; placeholder soluk renkte.

## Odak / dokunma
Odak halkası yok (`:focus,:focus-visible{outline:none}`), iOS dokunma vurgusu yok, hover yalnız ince imleçte (`(hover:hover) and (pointer:fine)`). Metin alanları odakta yalnız kendi kenarını hafifçe koyulaştırır (`--line-strong` → `--on-dark-2`).
