import { MonMap, onNear } from './map';
const $ = <T extends HTMLElement>(s: string) => document.querySelector<T>(s)!;

const mapEl = $('#ctmap');
onNear(mapEl, async () => {
  const ll: [number, number] = [+mapEl.dataset.lat!, +mapEl.dataset.lng!];
  const mm = await MonMap.create({ el: mapEl, center: ll, zoom: 15, interactive: false, label: 'Map showing the Monument office on Herbert Street' });
  mm.addPin('o', ll, 'office');
});

const chips = [...document.querySelectorAll<HTMLElement>('#ints .chip')];
chips.forEach((c) => c.addEventListener('click', () => {
  chips.forEach((x) => x.setAttribute('aria-checked', String(x === c)));
  $('#selnote').hidden = c.dataset.v !== 'Selling';
}));

// Send is a demo action: the button stays visible, faded and inactive (disabled in the markup); nothing is sent
$('#cform').addEventListener('submit', (e) => e.preventDefault());
