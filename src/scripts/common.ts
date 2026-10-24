// Header states, mobile menu, reveal, toast. Loaded on every page.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

export function toast(msg: string) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.setAttribute('role', 'status');
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2000);
}

function header() {
  const h = document.getElementById('hdr');
  if (!h) return;
  const hero = document.getElementById('hero');
  const home = h.hasAttribute('data-home') && hero;
  let ticking = false;
  const update = () => {
    ticking = false;
    if (home) {
      const inHero = hero!.getBoundingClientRect().bottom > 90;
      h.classList.toggle('glass', inHero);
      h.classList.toggle('compact', !inHero);
    } else {
      h.classList.toggle('compact', scrollY > 80);
    }
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();
}

function menu() {
  const m = document.getElementById('mnav');
  const openBtn = document.getElementById('menu-open');
  const closeBtn = document.getElementById('menu-close');
  if (!m || !openBtn || !closeBtn) return;
  const focusables = () => [...m.querySelectorAll<HTMLElement>('a,button')];
  const close = () => {
    m.classList.remove('show');
    setTimeout(() => m.classList.remove('open'), reduce ? 0 : 200);
    openBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    openBtn.focus();
  };
  openBtn.addEventListener('click', () => {
    m.classList.add('open');
    requestAnimationFrame(() => m.classList.add('show'));
    openBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  });
  closeBtn.addEventListener('click', close);
  m.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') return close();
    if (e.key !== 'Tab') return;
    const f = focusables();
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  // links that leave the page release the scroll lock; phone / email links open the concept modal over the menu instead
  m.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => { if (!/^(tel|mailto):/i.test(a.getAttribute('href') || '')) document.body.style.overflow = ''; }));
}

function reveal() {
  const els = [...document.querySelectorAll<HTMLElement>('[data-reveal]')];
  if (!els.length) return;
  if (reduce || !('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return; }
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (!en.isIntersecting) continue;
      const el = en.target as HTMLElement;
      const sibs = [...(el.parentElement?.children ?? [])].filter((c) => (c as HTMLElement).hasAttribute('data-reveal'));
      el.style.setProperty('--i', String(Math.min(sibs.indexOf(el), 5)));
      el.classList.add('in');
      io.unobserve(el);
    }
  }, { threshold: 0.15 });
  els.forEach((e) => io.observe(e));
}

header(); menu(); reveal();
