import { openConcept } from './concept';
import { toast } from './common';
import { MonMap, onNear } from './map';

const $ = <T extends HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s)!;
const $$ = <T extends HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];

/* share */
$('#share').addEventListener('click', async () => {
  try {
    if (navigator.share) { await navigator.share({ title: document.title, url: location.href }); return; }
    await navigator.clipboard.writeText(location.href);
    toast('Link copied');
  } catch { /* cancelled */ }
});

/* gallery */
(() => {
  const imgs = $$('.gimg'), thumbs = $$('.th[data-i]'), gal = $('#gal'), count = $('#gcount');
  let i = 0;
  const show = (n: number) => {
    i = (n + imgs.length) % imgs.length;
    imgs.forEach((im, k) => im.classList.toggle('on', k === i));
    thumbs.forEach((t, k) => t.classList.toggle('on', k === i));
    count.textContent = `${i + 1} / ${imgs.length}`;
  };
  $('#gprev').addEventListener('click', () => show(i - 1));
  $('#gnext').addEventListener('click', () => show(i + 1));
  thumbs.forEach((t) => t.addEventListener('click', () => show(+t.dataset.i!)));
  gal.addEventListener('keydown', (e) => {
    if ((e.target as HTMLElement).closest('input,select,textarea')) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(i - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(i + 1); }
  });
  let sx = 0, sy = 0;
  const main = $('.gal-main');
  main.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  main.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) show(i + (dx < 0 ? 1 : -1));
  }, { passive: true });
})();

/* floor plan tabs */
(() => {
  const tabs = $$('[role=tab]');
  const sel = (k: number) => tabs.forEach((t, n) => {
    t.setAttribute('aria-selected', String(n === k)); t.tabIndex = n === k ? 0 : -1;
    $(`#pl${n}`).hidden = n !== k;
  });
  tabs.forEach((t, k) => {
    t.addEventListener('click', () => sel(k));
    t.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (d) { e.preventDefault(); const n = (k + d + tabs.length) % tabs.length; sel(n); tabs[n].focus(); }
    });
  });
})();

/* location */
(() => {
  const d = JSON.parse($('#ldata').textContent!) as { lat: number; lng: number; address: string; pois: { i: number; cat: string; lat: number; lng: number }[] };
  const el = $('#locmap'), items = $$('#poil li'), chips = $$('#cats [data-cat]');
  let mm: MonMap | null = null, cat = 'transport';
  const home: [number, number] = [d.lat, d.lng];
  const inCat = () => d.pois.filter((p) => p.cat === cat);
  const draw = () => {
    if (!mm) return;
    mm.clearPins('p');
    inCat().forEach((p) => mm!.addPin('p' + p.i, [p.lat, p.lng], 'poi'));
    mm.fit([home, ...inCat().map((p) => [p.lat, p.lng] as [number, number])], 48);
  };
  onNear(el, async () => {
    mm = await MonMap.create({ el, center: home, zoom: 14.5, label: `Map showing ${d.address} and nearby places` });
    mm.addPin('home', home, 'home');
    draw();
  });
  chips.forEach((c) => c.addEventListener('click', () => {
    cat = c.dataset.cat!;
    chips.forEach((x) => x.setAttribute('aria-pressed', String(x === c)));
    items.forEach((li) => (li.hidden = li.dataset.cat !== cat));
    draw();
  }));
  const hl = (li: HTMLElement, on: boolean) => {
    const p = mm?.pins.get('p' + li.dataset.i);
    if (!p || !mm) return;
    p.el.classList.toggle('big', on);
    if (on) { const q = d.pois.find((x) => x.i === +li.dataset.i!)!; mm.fit([home, [q.lat, q.lng]], 48); }
  };
  items.forEach((li) => {
    li.addEventListener('mouseenter', () => hl(li, true));
    li.addEventListener('mouseleave', () => hl(li, false));
    li.addEventListener('focus', () => hl(li, true));
    li.addEventListener('blur', () => hl(li, false));
  });
})();

/* booking form */
(() => {
  const days = $('#days');
  const fmt = new Intl.DateTimeFormat('en-IE', { weekday: 'short', day: 'numeric' });
  const list: string[] = [];
  for (let n = 1; list.length < 4 && n < 14; n++) {
    const dt = new Date(); dt.setDate(dt.getDate() + n);
    if (dt.getDay() === 0) continue;
    list.push(fmt.format(dt).replace(/^(\w+)\s+(\d+)$/, '$1 $2').replace(/^(\d+)\s+(\w+)$/, '$2 $1'));
  }
  let day = '';
  days.innerHTML = list.map((t) => `<button type="button" class="chip" role="radio" aria-checked="false" data-d="${t}">${t}</button>`).join('');
  const chips = $$('#days .chip');
  chips.forEach((c) => c.addEventListener('click', () => {
    day = c.dataset.d!; chips.forEach((x) => x.setAttribute('aria-checked', String(x === c)));
    setErr('day', '');
  }));
  const setErr = (k: string, msg: string) => {
    const e = $(`#e-${k}`); e.textContent = msg;
    const f = k === 'day' ? null : $<HTMLInputElement>({ name: '#bn', phone: '#bp', email: '#be' }[k]!);
    f?.setAttribute('aria-invalid', String(!!msg));
  };
  $('#bform').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $<HTMLInputElement>('#bn').value.trim(), ph = $<HTMLInputElement>('#bp').value.trim(), em = $<HTMLInputElement>('#be').value.trim();
    let bad: string | null = null;
    const check = (k: string, msg: string, ok: boolean) => { setErr(k, ok ? '' : msg); if (!ok && !bad) bad = k; };
    check('day', 'Please choose a day.', !!day);
    check('name', 'Please tell us your name.', !!name);
    const phOk = ph.replace(/\D/g, '').length >= 7, emOk = /^\S+@\S+\.\S+$/.test(em);
    check('phone', 'Add a phone number or an email so we can reach you.', phOk || emOk);
    check('email', 'That email address doesn\'t look right.', !em || emOk);
    if (bad) { (bad === 'day' ? chips[0] : $<HTMLInputElement>({ name: '#bn', phone: '#bp', email: '#be' }[bad as string]!)).focus(); return; }
    openConcept('viewing', () => {
      $('#bdone-t').textContent = `We'll call ${name} to confirm a time on ${day}.`;
      $('#bform-in').hidden = true; $('#bdone').hidden = false;
    });
  });
  $('#mbook').addEventListener('click', (e) => { e.preventDefault(); $('#book').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); });
})();
