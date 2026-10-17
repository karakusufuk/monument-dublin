type S = { status: 'sale' | 'rent'; area: string; min: string; max: string; beds: string; type: string; sort: string; q: string };
const $ = <T extends HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s)!;
const cfg = JSON.parse($('#pcfg').textContent!) as { areas: { v: string; t: string }[] };
const DEF: S = { status: 'sale', area: '', min: '', max: '', beds: '', type: '', sort: 'newest', q: '' };
const eur = (n: number | string) => '€' + new Intl.NumberFormat('en-IE').format(+n);
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const PRICES = {
  sale: [300000, 400000, 500000, 600000, 750000, 1000000, 1250000, 1500000, 2000000, 3000000],
  rent: [1500, 2000, 2500, 3000, 3500, 4000],
};
const state: S = { ...DEF };
const rows = [...document.querySelectorAll<HTMLAnchorElement>('#plist .prow')];
const plist = $('#plist');

/* ---------- URL ---------- */
function readURL() {
  const p = new URLSearchParams(location.search);
  const g = (k: string) => p.get(k) ?? '';
  state.status = g('status') === 'rent' ? 'rent' : 'sale';
  state.area = cfg.areas.some((a) => a.v === g('area')) ? g('area') : '';
  state.min = /^\d+$/.test(g('min')) ? g('min') : '';
  state.max = /^\d+$/.test(g('max')) ? g('max') : '';
  state.beds = /^[1-5]$/.test(g('beds')) ? g('beds') : '';
  state.type = ['house', 'apartment'].includes(g('type')) ? g('type') : '';
  state.sort = ['price-asc', 'price-desc'].includes(g('sort')) ? g('sort') : 'newest';
  state.q = g('q');
}
function writeURL() {
  const p = new URLSearchParams();
  (Object.keys(DEF) as (keyof S)[]).forEach((k) => { if (state[k] !== DEF[k]) p.set(k, state[k]); });
  const s = p.toString();
  history.replaceState(null, '', location.pathname + (s ? '?' + s : ''));
}

/* ---------- Dropdowns ---------- */
type Opt = { v: string; t: string };
type Group = { key: keyof S; label?: string; opts: () => Opt[] };
type DD = { label: string; groups: Group[]; text: () => string; isSet: () => boolean; keepOpen?: boolean };
const arrow = '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 6l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
const priceOpts = (): Opt[] => [{ v: '', t: 'Any' }, ...PRICES[state.status].map((n) => ({ v: String(n), t: eur(n) }))];
const dds: DD[] = [
  { label: 'Area', groups: [{ key: 'area', opts: () => [{ v: '', t: 'All areas' }, ...cfg.areas.map((a) => ({ v: a.v, t: a.t }))] }],
    text: () => cfg.areas.find((a) => a.v === state.area)?.t ?? 'All areas', isSet: () => !!state.area },
  { label: 'Price', groups: [{ key: 'min', label: 'Min', opts: priceOpts }, { key: 'max', label: 'Max', opts: priceOpts }],
    text: () => (state.min && state.max ? `${eur(state.min)} – ${eur(state.max)}` : state.max ? `Up to ${eur(state.max)}` : state.min ? `From ${eur(state.min)}` : 'Any'),
    isSet: () => !!(state.min || state.max), keepOpen: true },
  { label: 'Bedrooms', groups: [{ key: 'beds', opts: () => [{ v: '', t: 'Any' }, ...[1, 2, 3, 4, 5].map((n) => ({ v: String(n), t: n + '+' }))] }],
    text: () => (state.beds ? state.beds + '+' : 'Any'), isSet: () => !!state.beds },
  { label: 'Type', groups: [{ key: 'type', opts: () => [{ v: '', t: 'House or apartment' }, { v: 'house', t: 'House' }, { v: 'apartment', t: 'Apartment' }] }],
    text: () => (state.type ? (state.type === 'house' ? 'House' : 'Apartment') : 'House or apartment'), isSet: () => !!state.type },
];

let openDD: HTMLElement | null = null;
function closeAll(focusBtn = false) {
  if (!openDD) return;
  const btn = $('.dd-btn', openDD), panel = $('.dd-panel', openDD);
  panel.hidden = true; btn.setAttribute('aria-expanded', 'false');
  if (focusBtn) btn.focus();
  openDD = null;
}
const root = $('#fdd');
const ddEls = dds.map((d, di) => {
  const wrap = document.createElement('div');
  wrap.className = 'dd';
  wrap.innerHTML = `<button type="button" class="dd-btn" aria-haspopup="listbox" aria-expanded="false" id="ddb${di}"><span><span class="l">${d.label}</span><span class="v"></span></span>${arrow}</button><div class="dd-panel" hidden></div>`;
  root.appendChild(wrap);
  const btn = $('.dd-btn', wrap), panel = $('.dd-panel', wrap);
  const fill = () => {
    panel.innerHTML = d.groups.map((g, gi) => `<div class="dd-grp">${g.label ? `<div class="gl">${g.label}</div>` : ''}<div role="listbox" aria-label="${g.label ?? d.label}" data-g="${gi}">${g.opts().map((o) => `<button type="button" role="option" tabindex="-1" class="dd-opt" data-v="${o.v}" aria-selected="${state[g.key] === o.v}">${o.t}</button>`).join('')}</div></div>`).join('');
  };
  const open = () => {
    closeAll(); fill(); panel.hidden = false; btn.setAttribute('aria-expanded', 'true'); openDD = wrap;
    const sel = panel.querySelector<HTMLElement>('[aria-selected=true]') ?? panel.querySelector<HTMLElement>('.dd-opt');
    sel?.focus();
  };
  btn.addEventListener('click', () => (openDD === wrap ? closeAll() : open()));
  btn.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown') { e.preventDefault(); open(); } });
  panel.addEventListener('click', (e) => {
    const o = (e.target as HTMLElement).closest<HTMLElement>('.dd-opt');
    if (!o) return;
    const gi = +o.closest<HTMLElement>('[data-g]')!.dataset.g!;
    (state as any)[d.groups[gi].key] = o.dataset.v!;
    update();
    if (d.keepOpen) { fill(); panel.querySelectorAll<HTMLElement>('.dd-opt').forEach((x) => { if (x.dataset.v === o.dataset.v && x.closest('[data-g]') === o.closest('[data-g]')) x.focus(); }); }
    else closeAll(true);
  });
  panel.addEventListener('keydown', (e) => {
    const cur = document.activeElement as HTMLElement;
    const grp = cur.closest<HTMLElement>('[data-g]');
    if (!grp) return;
    const list = [...grp.querySelectorAll<HTMLElement>('.dd-opt')];
    const i = list.indexOf(cur);
    if (e.key === 'ArrowDown') { e.preventDefault(); list[(i + 1) % list.length].focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); list[(i - 1 + list.length) % list.length].focus(); }
    else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const grps = [...panel.querySelectorAll<HTMLElement>('[data-g]')];
      const ng = grps[grps.indexOf(grp) + (e.key === 'ArrowRight' ? 1 : -1)];
      if (ng) { e.preventDefault(); (ng.querySelector<HTMLElement>('[aria-selected=true]') ?? ng.querySelector<HTMLElement>('.dd-opt'))!.focus(); }
    } else if (e.key === 'Escape') { e.preventDefault(); closeAll(true); }
    else if (e.key === 'Tab') closeAll();
  });
  return { d, btn };
});
document.addEventListener('click', (e) => { if (openDD && !openDD.contains(e.target as Node)) closeAll(); });

/* ---------- Filtering ---------- */
function resultText(n: number) {
  const a = cfg.areas.find((x) => x.v === state.area);
  let t = `<b>${n} ${n === 1 ? 'home' : 'homes'}</b> ${state.status === 'sale' ? 'for sale' : 'to rent'}`;
  if (a) t += ` in ${a.t}`;
  if (state.min && state.max) t += ` between ${eur(state.min)} and ${eur(state.max)}`;
  else if (state.max) t += ` up to ${eur(state.max)}`;
  else if (state.min) t += ` from ${eur(state.min)}`;
  if (state.beds) t += `, ${state.beds}+ bedrooms`;
  if (state.type) t += state.type === 'house' ? ', houses only' : ', apartments only';
  if (state.q) t += ` matching "${state.q.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)}"`;
  return t;
}
const filterCount = () => [state.area, state.min || state.max, state.beds, state.type].filter(Boolean).length;
const anyFilter = () => !!(filterCount() || state.q);

function update() {
  // status change invalidates price bounds
  const opts = PRICES[state.status].map(String);
  if (state.min && !opts.includes(state.min)) state.min = '';
  if (state.max && !opts.includes(state.max)) state.max = '';
  const words = norm(state.q).split(/\s+/).filter(Boolean);
  let shown = 0;
  rows.forEach((r) => {
    const d = r.dataset, price = +d.price!;
    const ok = d.status === state.status && (!state.area || d.area === state.area) &&
      (!state.min || price >= +state.min) && (!state.max || price <= +state.max) &&
      (!state.beds || +d.beds! >= +state.beds) && (!state.type || d.type === state.type) &&
      words.every((w) => norm(d.search!).includes(w));
    r.hidden = !ok;
    if (ok) shown++;
  });
  const sorted = [...rows].sort((a, b) =>
    state.sort === 'price-asc' ? +a.dataset.price! - +b.dataset.price! :
    state.sort === 'price-desc' ? +b.dataset.price! - +a.dataset.price! :
    b.dataset.listed!.localeCompare(a.dataset.listed!));
  sorted.forEach((r) => plist.appendChild(r));
  $('#rtext').innerHTML = resultText(shown);
  $('#clear').hidden = !anyFilter();
  $('#empty').hidden = shown > 0;
  document.querySelectorAll<HTMLElement>('[data-status]').forEach((b) => { if (b.tagName === 'BUTTON') b.setAttribute('aria-pressed', String(b.dataset.status === state.status)); });
  document.querySelectorAll<HTMLElement>('[data-sort]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.sort === state.sort)));
  ddEls.forEach(({ d, btn }) => { $('.v', btn).textContent = d.text(); btn.classList.toggle('set', d.isSet()); });
  const n = filterCount();
  $('#fopen').textContent = n ? `Filters · ${n}` : 'Filters';
  $('#fshow').textContent = `Show ${shown} ${shown === 1 ? 'home' : 'homes'}`;
  writeURL();
}

document.querySelectorAll<HTMLElement>('button[data-status]').forEach((b) => b.addEventListener('click', () => { state.status = b.dataset.status as S['status']; update(); }));
document.querySelectorAll<HTMLElement>('button[data-sort]').forEach((b) => b.addEventListener('click', () => { state.sort = b.dataset.sort!; update(); }));
const clear = () => { Object.assign(state, { area: '', min: '', max: '', beds: '', type: '', q: '' }); update(); };
$('#clear').addEventListener('click', clear);
$('#clear2').addEventListener('click', clear);

/* mobile filter panel */
const panel = $('#filters'), openBtn = $('#fopen');
const setPanel = (o: boolean) => {
  panel.classList.toggle('open', o); openBtn.setAttribute('aria-expanded', String(o));
  document.body.style.overflow = o ? 'hidden' : ''; closeAll();
  if (o) $('#fclose').focus(); else openBtn.focus();
};
openBtn.addEventListener('click', () => setPanel(true));
$('#fclose').addEventListener('click', () => setPanel(false));
$('#fshow').addEventListener('click', () => setPanel(false));
panel.addEventListener('keydown', (e) => { if (e.key === 'Escape' && panel.classList.contains('open') && !openDD) setPanel(false); });

/* mobile photo strip dots */
rows.forEach((r) => {
  const strip = $('.strip', r), dots = [...r.querySelectorAll<HTMLElement>('.dots i')];
  strip.addEventListener('scroll', () => {
    const i = Math.round(strip.scrollLeft / (strip.scrollWidth / 3));
    dots.forEach((d, k) => d.classList.toggle('on', k === i));
  }, { passive: true });
});

readURL();
update();
