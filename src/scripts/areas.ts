import { MonMap, onNear } from './map';
const pins = JSON.parse(document.getElementById('apins')!.textContent!) as { slug: string; center: [number, number]; radius: number; name: string; homes: [number, number][] }[];
document.querySelectorAll<HTMLElement>('.amap').forEach((el) => {
  const p = pins.find((x) => x.slug === el.dataset.slug)!;
  onNear(el, async () => {
    const mm = await MonMap.create({ el, center: p.center, zoom: 13.4, interactive: false, label: `Map of ${p.name} showing the approximate area and its homes` });
    mm.setCircle(p.center, p.radius);
    p.homes.forEach((h, i) => mm.addPin('h' + i, h, 'home'));
  });
});
