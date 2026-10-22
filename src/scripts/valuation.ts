import { openConcept } from './concept';
const $ = <T extends HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s)!;
const areas = JSON.parse($('#vareas').textContent!) as { slug: string; name: string }[];
const steps = [...document.querySelectorAll<HTMLElement>('.vs')];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const ans: Record<string, string> = { type: '', beds: '', plan: '' };
let cur = 1;

// Close returns to the page the visitor came from, else home
try {
  const ref = document.referrer && new URL(document.referrer);
  if (ref && ref.origin === location.origin && ref.pathname !== location.pathname) $<HTMLAnchorElement>('#vclose').href = ref.pathname + ref.search;
} catch { /* keep default */ }

const errs = (id: string, msg: string, field: string) => { $(`#e-${id}`).textContent = msg; $(field).setAttribute('aria-invalid', String(!!msg)); };
const chosen = () => (cur === 2 ? ans.type : cur === 3 ? ans.beds : cur === 4 ? ans.plan : 'x');

function summary() {
  const set = (id: string, v: string) => ($(id).textContent = v || '—');
  const addr = $<HTMLInputElement>('#va').value.trim();
  const area = $<HTMLSelectElement>('#vr');
  const aname = area.value === 'elsewhere' ? 'Elsewhere in Dublin' : areas.find((a) => a.slug === area.value)?.name;
  set('#s-addr', [addr, aname].filter(Boolean).join(', '));
  set('#s-type', ans.type); set('#s-beds', ans.beds); set('#s-plan', ans.plan);
}

function show(n: number) {
  cur = n;
  steps.forEach((s) => {
    const on = +s.dataset.step! === n;
    if (on && s.hidden) { s.hidden = false; if (!reduce) { s.style.opacity = '0'; requestAnimationFrame(() => requestAnimationFrame(() => (s.style.opacity = '1'))); } }
    else if (!on) s.hidden = true;
  });
  $('#vstep').textContent = `Step ${n} of 5`;
  $('#vfill').style.width = `${n * 20}%`;
  $('#vback').hidden = n === 1;
  $('#vnext').textContent = n === 5 ? 'Request valuation' : 'Continue';
  const off = n > 1 && n < 5 && !chosen();
  $('#vnext').setAttribute('aria-disabled', String(off));
  const first = steps.find((s) => +s.dataset.step! === n)!.querySelector<HTMLElement>('input,select,.vopt');
  first?.focus({ preventScroll: true });
  scrollTo(0, 0);
}

function validate(): boolean {
  if (cur === 1) {
    const a = $<HTMLInputElement>('#va').value.trim(), r = $<HTMLSelectElement>('#vr').value, c = $<HTMLInputElement>('#vc').value.trim();
    errs('va', a ? '' : 'Please add the street address.', '#va');
    errs('vr', r ? '' : 'Please choose an area.', '#vr');
    const cOk = !c || /^[A-Z]\d{2}\s?[A-Z0-9]{4}$/i.test(c);
    errs('vc', cOk ? '' : "That Eircode doesn't look right (for example D06 X123).", '#vc');
    if (!a) { $('#va').focus(); return false; }
    if (!r) { $('#vr').focus(); return false; }
    if (!cOk) { $('#vc').focus(); return false; }
    return true;
  }
  if (cur < 5) return !!chosen();
  const n = $<HTMLInputElement>('#vn').value.trim(), p = $<HTMLInputElement>('#vp').value.trim(), e = $<HTMLInputElement>('#ve').value.trim();
  const pOk = p.replace(/\D/g, '').length >= 7, eOk = /^\S+@\S+\.\S+$/.test(e);
  errs('vn', n ? '' : 'Please tell us your name.', '#vn');
  errs('vp', pOk || eOk ? '' : 'Add a phone number or an email so we can reach you.', '#vp');
  errs('ve', !e || eOk ? '' : "That email address doesn't look right.", '#ve');
  if (!n) { $('#vn').focus(); return false; }
  if (!pOk && !eOk) { $('#vp').focus(); return false; }
  if (e && !eOk) { $('#ve').focus(); return false; }
  return true;
}

function finish() {
  const r = $<HTMLSelectElement>('#vr').value;
  const el = r === 'elsewhere';
  const area = areas.find((a) => a.slug === r);
  $('#vdone-t').textContent = el
    ? "We'll call to see if we can help in your area."
    : `Someone who sells homes in ${area!.name} will ring you to arrange a time to see the house. The valuation is free and you are under no obligation.`;
  const a = $<HTMLAnchorElement>('#vdone-a');
  a.textContent = el ? 'See our areas' : `What's selling in ${area!.name}`;
  a.href = el ? '/areas/' : `/areas/#${r}`;
  $('#vform').hidden = true; $('#vdone').hidden = false;
  $('.vprog')?.setAttribute('hidden', '');
  scrollTo(0, 0);
}

$('#vform').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validate()) return;
  if (cur === 5) openConcept('valuation', finish); else show(cur + 1);
});
$('#vnext').addEventListener('click', (e) => { if ($('#vnext').getAttribute('aria-disabled') === 'true') e.preventDefault(); });
$('#vback').addEventListener('click', () => show(cur - 1));
document.querySelectorAll<HTMLElement>('.vopt').forEach((b) => b.addEventListener('click', () => {
  ans[b.dataset.key!] = b.dataset.v!;
  b.parentElement!.querySelectorAll('.vopt').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
  $('#vnext').setAttribute('aria-disabled', 'false');
  summary();
}));
['#va', '#vr'].forEach((s) => $(s).addEventListener('input', summary));
$('#vform').addEventListener('change', summary);
show(1);
