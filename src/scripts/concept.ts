// Concept modal: one dialog, opened by final form confirmation or by tel / mailto / address clicks.
export type ConceptKind = 'viewing' | 'valuation' | 'contact' | 'phone' | 'email' | 'address';

const BODY: Record<ConceptKind, string> = {
  viewing: "this request would land in the agent's inbox and calendar, with the home and the chosen day attached",
  valuation: "this request would go to a valuer's calendar, with the address and property details ready for the visit",
  contact: "this message would reach the right negotiator's inbox, and a call back would be booked for you",
  phone: "this would ring the agency's front desk",
  email: "this would open a message to the agency",
  address: "this would open directions to the office",
};

const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
let opener: HTMLElement | null = null;
let after: (() => void) | undefined;
let isOpen = false;
// body overflow before the modal opened (the mobile menu or filter panel may already have locked scrolling)
let prevOverflow = '';

const root = () => document.getElementById('cpt')!;

export function openConcept(kind: ConceptKind, onClose?: () => void) {
  if (isOpen) return;
  const m = root();
  if (!m) { onClose?.(); return; }
  opener = document.activeElement as HTMLElement | null;
  after = onClose;
  m.querySelector('#cpt-body')!.textContent = `In a live build, ${BODY[kind]}.`;
  m.hidden = false;
  isOpen = true;
  prevOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => requestAnimationFrame(() => m.classList.add('show')));
  (m.querySelector('#cpt-close') as HTMLElement).focus();
}

function close() {
  if (!isOpen) return;
  const m = root();
  isOpen = false;
  m.classList.remove('show');
  const done = () => {
    m.hidden = true;
    document.body.style.overflow = prevOverflow;
    if (opener && document.contains(opener)) opener.focus();
    const cb = after; after = undefined; opener = null;
    cb?.();
  };
  if (reduce()) done(); else setTimeout(done, 260);
}

function init() {
  const m = root();
  if (!m) return;
  m.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    if (t === m || t.classList.contains('cpt-scrim') || t.closest('#cpt-close')) close();
  });
  document.addEventListener('keydown', (e) => {
    if (!isOpen) return;
    if (e.key === 'Escape') { e.preventDefault(); return close(); }
    if (e.key !== 'Tab') return;
    const f = [...m.querySelectorAll<HTMLElement>('a[href],button')];
    const first = f[0], last = f[f.length - 1];
    if (!m.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  // Delegated triggers
  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a');
    if (!a || m.contains(a)) return;
    const href = a.getAttribute('href') || '';
    let kind: ConceptKind | null = null;
    if (/^tel:/i.test(href)) kind = 'phone';
    else if (/^mailto:/i.test(href)) kind = 'email';
    else if (a.dataset.concept === 'address') kind = 'address';
    else if (/(google\.[a-z.]+\/maps|maps\.google|maps\.apple|openstreetmap\.org\/(directions|\?)|goo\.gl\/maps)/i.test(href)) kind = 'address';
    if (!kind) return;
    e.preventDefault();
    openConcept(kind);
  });
}
init();
