import { MonMap, onNear } from './map';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = <T extends HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s)!;
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));

/* ---------- Hero scroll transition (never blocks scrolling) ---------- */
function hero() {
  const sec = $('#hero'), stage = $('#stage'), l1 = $('#l1'), l2 = $('#l2'), bar = $('#sform');
  const t2 = $('.t2', l2);
  const progress = () => {
    const range = sec.offsetHeight - innerHeight;
    return range <= 0 ? 0 : clamp((scrollY - sec.offsetTop) / range);
  };
  const apply = () => {
    const p = progress();
    const a = seg(p, 0, 0.35), b = seg(p, 0.3, 0.6), c = seg(p, 0.4, 0.7);
    l1.style.opacity = String(1 - a); l1.style.transform = `translateY(${-24 * a}px)`;
    t2.style.opacity = String(b); t2.style.transform = `translateY(${24 * (1 - b)}px)`;
    bar.style.opacity = String(c); bar.style.transform = `translateY(${16 * (1 - c)}px) scale(${0.98 + 0.02 * c})`;
    l2.style.opacity = '1';
    l2.style.pointerEvents = c > 0.5 ? 'auto' : 'none';
    l1.style.pointerEvents = 'none';
    stage.style.setProperty('--o', String(0.38 + 0.1 * seg(p, 0, 0.7)));
  };
  if (!reduce) {
    let tick = false;
    addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(() => { tick = false; apply(); }); } }, { passive: true });
    addEventListener('resize', apply);
    apply();
    // keyboard users reaching the search field: bring state 2 into view (a plain scroll, not a lock)
    l2.addEventListener('focusin', () => {
      if (progress() < 0.7) scrollTo({ top: sec.offsetTop + 0.7 * (sec.offsetHeight - innerHeight) });
    });
  }
}

/* ---------- Search suggestions ---------- */
function search() {
  const data = JSON.parse($('#search-data').textContent!) as {
    areas: { slug: string; name: string; district: string; n: number }[];
    listings: { slug: string; address: string; area: string; areaSlug: string; type: string; kind: string; price: string }[];
  };
  const input = $<HTMLInputElement>('#sq'), list = $('#slist'), form = $('#sform');
  const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  type Item = { href: string; html: string };
  let items: Item[] = [], sel = -1;
  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
  const render = () => {
    list.innerHTML = items.map((it, i) => `<li role="option" id="opt-${i}" data-i="${i}" aria-selected="${i === sel}">${it.html}</li>`).join('');
    list.hidden = !items.length;
    input.setAttribute('aria-expanded', String(!!items.length));
    if (sel >= 0) input.setAttribute('aria-activedescendant', `opt-${sel}`); else input.removeAttribute('aria-activedescendant');
  };
  const compute = () => {
    const q = norm(input.value);
    items = []; sel = -1;
    if (q) {
      for (const a of data.areas) {
        if (norm(a.name).includes(q) || norm(a.district).includes(q))
          items.push({ href: `/properties/?area=${a.slug}`, html: `<span>${esc(a.name)}<span class="g">· area</span></span><span class="pr num">${a.n} ${a.n === 1 ? 'home' : 'homes'}</span>` });
      }
      for (const l of data.listings) {
        if ([l.address, l.area, l.type, l.kind].some((f) => norm(f).includes(q)))
          items.push({ href: `/properties/${l.slug}/`, html: `<span>${esc(l.address)}<span class="g">${esc(l.area)}</span></span><span class="pr num">${esc(l.price)}</span>` });
      }
      items = items.slice(0, 6);
    }
    render();
  };
  input.addEventListener('input', compute);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' && items.length) { e.preventDefault(); sel = (sel + 1) % items.length; render(); }
    else if (e.key === 'ArrowUp' && items.length) { e.preventDefault(); sel = (sel - 1 + items.length) % items.length; render(); }
    else if (e.key === 'Escape') { items = []; sel = -1; render(); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (sel >= 0) location.href = items[sel].href;
      else if (input.value.trim()) location.href = `/properties/?q=${encodeURIComponent(input.value.trim())}`;
      else location.href = '/properties/';
    }
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (sel >= 0) location.href = items[sel].href;
    else location.href = input.value.trim() ? `/properties/?q=${encodeURIComponent(input.value.trim())}` : '/properties/';
  });
  list.addEventListener('mousedown', (e) => {
    const li = (e.target as HTMLElement).closest<HTMLElement>('li');
    if (li) { e.preventDefault(); location.href = items[+li.dataset.i!].href; }
  });
  document.addEventListener('click', (e) => { if (!form.contains(e.target as Node)) { items = []; render(); } });
}

/* ---------- Showcase: one shared mini map ---------- */
function showcase() {
  const rows = [...document.querySelectorAll<HTMLElement>('#rows .row')];
  const mini = $('#mini');
  const fine = matchMedia('(hover:hover) and (pointer:fine)');
  let mm: MonMap | null = null, pending: HTMLElement | null = null, current: HTMLElement | null = null;
  const place = (row: HTMLElement) => {
    current = row;
    const slot = $('.slot', row), vis = $('.vis', row);
    mini.hidden = false;
    mini.style.width = `${fine.matches ? (vis.clientWidth - 12) / 2 : slot.clientWidth || 100}px`;
    if (mini.parentElement !== slot) slot.appendChild(mini);
    if (!mm) { pending = row; return; }
    const ll: [number, number] = [+row.dataset.lat!, +row.dataset.lng!];
    mm.resize(); mm.jump(ll);
    mm.pins.get('h')!.m.setLngLat([ll[1], ll[0]]);
  };
  let started = false;
  const start = async () => {
    if (started) return; started = true;
    const r = pending ?? rows[0];
    mm = await MonMap.create({ el: mini, center: [+r.dataset.lat!, +r.dataset.lng!], zoom: 14.5, interactive: false, label: 'Map showing the location of the home' });
    mm.addPin('h', [+r.dataset.lat!, +r.dataset.lng!], 'mini');
    if (pending) place(pending);
  };
  onNear($('#rows'), () => { mini.hidden = false; start(); });
  mini.hidden = true;

  if (fine.matches) {
    rows.forEach((r) => {
      r.addEventListener('mouseenter', () => { start(); place(r); });
      r.addEventListener('focus', () => { start(); place(r); });
    });
  } else {
    // mobile: map follows the card nearest the viewport centre
    let tick = false;
    const pick = () => {
      tick = false;
      let best: HTMLElement | null = null, bd = Infinity;
      for (const r of rows) {
        const b = r.getBoundingClientRect();
        const d = Math.abs(b.top + b.height / 2 - innerHeight / 2);
        if (b.bottom > 0 && b.top < innerHeight && d < bd) { bd = d; best = r; }
      }
      if (best && best !== current) place(best);
    };
    addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(pick); } }, { passive: true });
    pick();
    if (!current) place(rows[0]);
  }
}

/* ---------- Areas band ---------- */
const bz = () => (innerWidth < 768 ? 13 : 13.6); // shows the whole 650-700 m outline in a 520 px map
function band() {
  const d = JSON.parse($('#band-data').textContent!) as {
    areas: { slug: string; name: string; district: string; center: [number, number]; radius: number; text: string; n: number }[];
    listings: { slug: string; area: string; lat: number; lng: number }[];
  };
  const links = [...document.querySelectorAll<HTMLAnchorElement>('#alist a')];
  const el = $('#bmap');
  const mobile = matchMedia('(max-width:768px)');
  let mm: MonMap | null = null;
  let active = d.areas[0].slug;
  const apply = (slug: string, animate: boolean) => {
    active = slug;
    const a = d.areas.find((x) => x.slug === slug)!;
    links.forEach((l) => l.classList.toggle('active', l.dataset.slug === slug));
    $('#icn').textContent = `${a.name} · ${a.district}`;
    $('#ics').textContent = a.text;
    $<HTMLAnchorElement>('#icb').href = `/properties/?area=${slug}`;
    const pr = document.getElementById('aprice');
    if (pr) pr.hidden = false;
    if (!mm) return;
    mm.setCircle(a.center, a.radius);
    for (const l of d.listings) mm.setKind(l.slug, l.area === slug ? 'home' : 'dim');
    if (animate) mm.ease(a.center, bz(), 600); else mm.jump(a.center, bz());
  };
  onNear(el, async () => {
    const a = d.areas.find((x) => x.slug === active)!;
    mm = await MonMap.create({ el, center: a.center, zoom: bz(), label: 'Map of Dublin showing the selected neighbourhood and its homes' });
    for (const l of d.listings) mm.addPin(l.slug, [l.lat, l.lng], l.area === active ? 'home' : 'dim');
    mm.setCircle(a.center, a.radius);
  });
  links.forEach((l) => {
    const s = l.dataset.slug!;
    const hov = () => { if (!mobile.matches && active !== s) apply(s, true); };
    l.addEventListener('mouseenter', hov);
    l.addEventListener('focus', hov);
    l.addEventListener('click', (e) => {
      if (mobile.matches && active !== s) { e.preventDefault(); apply(s, true); l.scrollIntoView({ inline: 'center', block: 'nearest' }); }
    });
  });
  apply(active, false);
}

hero(); search(); showcase(); band();
