// Combobox behaviour for components/Combo.astro (select-only pattern).
// Tap / click: opens, a tap on an option picks it and closes, a tap outside closes. Nothing is highlighted on open.
// Keyboard: Enter / Space / ↓ / ↑ open; ↑ ↓ Home End and a typed letter move; Enter / Space pick; Esc and Tab close.
let openBtn: HTMLButtonElement | null = null;
// pointer position (last seen, and when the list opened): a list scrolled under a resting cursor must not light up an option
let lastX = -1, lastY = -1, px = -1, py = -1;

export const comboValue = (el: HTMLElement) => el.dataset.value ?? '';

function parts(btn: HTMLButtonElement) {
  const lb = document.getElementById(btn.getAttribute('aria-controls')!) as HTMLUListElement;
  return { lb, opts: [...lb.querySelectorAll<HTMLLIElement>('[role=option]')] };
}

function setActive(btn: HTMLButtonElement, i: number) {
  const { lb, opts } = parts(btn);
  opts.forEach((o, k) => o.classList.toggle('act', k === i));
  if (i < 0) { btn.removeAttribute('aria-activedescendant'); return; }
  btn.setAttribute('aria-activedescendant', opts[i].id);
  const o = opts[i];
  if (o.offsetTop < lb.scrollTop) lb.scrollTop = o.offsetTop - 6;
  else if (o.offsetTop + o.offsetHeight > lb.scrollTop + lb.clientHeight) lb.scrollTop = o.offsetTop + o.offsetHeight - lb.clientHeight + 6;
}

const activeIndex = (btn: HTMLButtonElement) => parts(btn).opts.findIndex((o) => o.classList.contains('act'));

// keep the open list clear of the fixed bars at the bottom of phone screens (Book / Continue)
function reveal(lb: HTMLElement) {
  const r = lb.getBoundingClientRect();
  let limit = innerHeight;
  document.querySelectorAll<HTMLElement>('.mbar,.vnav').forEach((b) => {
    if (getComputedStyle(b).position !== 'fixed') return;
    const t = b.getBoundingClientRect().top;
    if (t > 0 && t < limit) limit = t;
  });
  const over = r.bottom + 12 - limit;
  if (over > 0) scrollBy({ top: over, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}

function open(btn: HTMLButtonElement, active = -1) {
  if (openBtn && openBtn !== btn) close(openBtn);
  const { lb } = parts(btn);
  lb.hidden = false;
  lb.classList.add('still');
  px = lastX; py = lastY;
  btn.setAttribute('aria-expanded', 'true');
  openBtn = btn;
  setActive(btn, active);
  reveal(lb);
}

function close(btn: HTMLButtonElement) {
  const { lb } = parts(btn);
  lb.hidden = true;
  btn.setAttribute('aria-expanded', 'false');
  setActive(btn, -1);
  if (openBtn === btn) openBtn = null;
}

function pick(btn: HTMLButtonElement, i: number) {
  const { opts } = parts(btn);
  const o = opts[i];
  opts.forEach((x) => x.setAttribute('aria-selected', String(x === o)));
  const cv = btn.querySelector('.cv')!;
  cv.textContent = o.textContent;
  cv.classList.remove('ph');
  const changed = btn.dataset.value !== o.dataset.v;
  btn.dataset.value = o.dataset.v!;
  close(btn);
  if (changed) {
    btn.dispatchEvent(new Event('input', { bubbles: true }));
    btn.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

function init(root: HTMLElement) {
  const btn = root.querySelector<HTMLButtonElement>('.combo-btn')!;
  const { lb, opts } = parts(btn);
  const selected = () => opts.findIndex((o) => o.getAttribute('aria-selected') === 'true');
  let typed = '', typedAt = 0;

  btn.addEventListener('click', () => (btn.getAttribute('aria-expanded') === 'true' ? close(btn) : open(btn)));
  // the label works like a <label for>: it opens the list
  document.getElementById(`${btn.id}-l`)?.addEventListener('click', () => { btn.focus(); open(btn, selected()); });

  // hover shows only once the pointer itself moves over the list (not when the page scrolls the list under it)
  lb.addEventListener('pointermove', (e) => { if (Math.abs(e.clientX - px) + Math.abs(e.clientY - py) > 2) lb.classList.remove('still'); });

  // listener on the list itself (not delegated to document) so iOS fires it on the first tap
  lb.addEventListener('click', (e) => {
    const o = (e.target as HTMLElement).closest<HTMLLIElement>('[role=option]');
    if (o) pick(btn, opts.indexOf(o));
  });

  btn.addEventListener('keydown', (e) => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    const cur = activeIndex(btn), n = opts.length;
    const k = e.key;
    if (!isOpen) {
      if (k === 'ArrowDown' || k === 'ArrowUp' || k === 'Enter' || k === ' ') {
        e.preventDefault();
        const s = selected();
        open(btn, s >= 0 ? s : k === 'ArrowUp' ? n - 1 : 0);
      }
      return;
    }
    if (k === 'ArrowDown') { e.preventDefault(); setActive(btn, Math.min(n - 1, cur + 1)); }
    else if (k === 'ArrowUp') { e.preventDefault(); setActive(btn, cur < 0 ? n - 1 : Math.max(0, cur - 1)); }
    else if (k === 'Home') { e.preventDefault(); setActive(btn, 0); }
    else if (k === 'End') { e.preventDefault(); setActive(btn, n - 1); }
    else if (k === 'Enter' || k === ' ') { e.preventDefault(); if (cur >= 0) pick(btn, cur); else close(btn); }
    else if (k === 'Escape') { e.preventDefault(); close(btn); }
    else if (k === 'Tab') close(btn);
    else if (k.length === 1 && /\S/.test(k)) {
      const now = performance.now();
      typed = now - typedAt > 700 ? k.toLowerCase() : typed + k.toLowerCase();
      typedAt = now;
      const i = opts.findIndex((o) => o.textContent!.trim().toLowerCase().startsWith(typed));
      if (i >= 0) setActive(btn, i);
    }
  });
}

document.querySelectorAll<HTMLElement>('[data-combo]').forEach(init);
const track = (e: PointerEvent) => { lastX = e.clientX; lastY = e.clientY; };
addEventListener('pointerdown', track, { capture: true, passive: true });
addEventListener('pointermove', track, { capture: true, passive: true });
document.addEventListener('click', (e) => {
  if (openBtn && !openBtn.closest('[data-combo]')!.contains(e.target as Node) && (e.target as HTMLElement).id !== `${openBtn.id}-l`) close(openBtn);
});
