import { MonMap, onNear } from './map';
const $ = <T extends HTMLElement>(s: string) => document.querySelector<T>(s)!;

const mapEl = $('#ctmap');
onNear(mapEl, async () => {
  const ll: [number, number] = [+mapEl.dataset.lat!, +mapEl.dataset.lng!];
  const mm = await MonMap.create({ el: mapEl, center: ll, zoom: 15, interactive: false, label: 'Map showing the Monument office on Herbert Street' });
  mm.addPin('o', ll, 'office');
});

let interest = 'Buying';
const chips = [...document.querySelectorAll<HTMLElement>('#ints .chip')];
chips.forEach((c) => c.addEventListener('click', () => {
  interest = c.dataset.v!;
  chips.forEach((x) => x.setAttribute('aria-checked', String(x === c)));
  $('#selnote').hidden = interest !== 'Selling';
}));

const err = (id: string, m: string, field?: string) => {
  $(`#e-${id}`).textContent = m;
  if (field) $(field).setAttribute('aria-invalid', String(!!m));
};
$('#cform').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = $<HTMLInputElement>('#cn').value.trim(), ph = $<HTMLInputElement>('#cp').value.trim(), em = $<HTMLInputElement>('#ce').value.trim();
  const phOk = ph.replace(/\D/g, '').length >= 7, emOk = /^\S+@\S+\.\S+$/.test(em);
  err('cn', name ? '' : 'Please tell us your name.', '#cn');
  err('cp', phOk || emOk ? '' : 'Add a phone number or an email so we can reach you.', '#cp');
  err('ce', !em || emOk ? '' : "That email address doesn't look right.", '#ce');
  if (!name) return $('#cn').focus();
  if (!phOk && !emOk) return $('#cp').focus();
  if (em && !emOk) return $('#ce').focus();
  const now = new Date();
  const today = now.getHours() < 17 && now.getDay() !== 0;
  $('#cdone-h').textContent = `Thank you, ${name}.`;
  $('#cdone-t').textContent = `We'll call you back ${today ? 'today' : 'tomorrow morning'}.`;
  $('#cin').hidden = true; $('#cdone').hidden = false;
  $('#cdone-h').setAttribute('tabindex', '-1'); $('#cdone-h').focus();
});
