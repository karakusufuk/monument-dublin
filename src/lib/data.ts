import listingsJson from '../data/listings.json';
import areasJson from '../data/areas.json';

export type Photo = { file: string; alt: string };
export type Room = { name: string; w: number; d: number };
export type Listing = {
  code: string; slug: string; address: string; area: string; district: string;
  status: 'sale' | 'rent'; type: 'house' | 'apartment'; kind: string; price: number;
  beds: number; baths: number; size: number; ber: string; listed: string;
  lat: number; lng: number; photos: Photo[]; description: string[]; features: string[];
  floors: { name: string; rooms: Room[] }[];
};
export type Poi = { cat: 'transport' | 'parks' | 'shops' | 'schools'; name: string; sub: string; lat: number; lng: number };
export type Area = {
  slug: string; name: string; district: string; center: [number, number]; radius: number;
  photo: string; photoAlt: string; short: string; note: string; pois: Poi[];
};

export const listings = listingsJson.listings as Listing[];
export const areas = areasJson.areas as Area[];
export const office = areasJson.office as { address: string; lat: number; lng: number };

export const areaBySlug = (s: string) => areas.find((a) => a.slug === s)!;
export const listingsIn = (slug: string) => listings.filter((l) => l.area === slug);
export const newest = [...listings].sort((a, b) => b.listed.localeCompare(a.listed));

const nf = new Intl.NumberFormat('en-IE');
export const eur = (n: number) => '€' + nf.format(n);
export const priceText = (l: Pick<Listing, 'price' | 'status'>) =>
  l.status === 'rent' ? `${eur(l.price)} / month` : eur(l.price);

const words = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
  'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
export const numWord = (n: number) => (n <= 20 ? words[n] : String(n));
export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const countText = (n: number) => `${n} ${n === 1 ? 'home' : 'homes'}`;
export const splitText = (list: Listing[]) => {
  const s = list.filter((l) => l.status === 'sale').length;
  const r = list.length - s;
  return `${countText(list.length)}${s || r ? ' · ' : ''}${[s ? `${s} for sale` : '', r ? `${r} to rent` : ''].filter(Boolean).join(', ')}`;
};
export const areaPriceRange = (slug: string) => {
  const ls = listingsIn(slug);
  const part = (st: 'sale' | 'rent') => {
    const p = ls.filter((l) => l.status === st).map((l) => l.price);
    if (!p.length) return '';
    const lo = Math.min(...p), hi = Math.max(...p);
    const f = (n: number) => (st === 'rent' ? `${eur(n)} / month` : eur(n));
    return lo === hi ? f(lo) : `${f(lo)} – ${f(hi)}`;
  };
  return [part('rent'), part('sale')].filter(Boolean).join(' · ');
};

export const haversine = (a: [number, number], b: [number, number]) => {
  const R = 6371000, r = Math.PI / 180;
  const dLat = (b[0] - a[0]) * r, dLng = (b[1] - a[1]) * r;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
};
export const walkMin = (a: [number, number], b: [number, number]) =>
  Math.max(1, Math.ceil((haversine(a, b) * 1.35) / 80));

export const similar = (l: Listing, n = 3) => {
  const rank = (o: Listing) =>
    (o.area === l.area ? 0 : 1e9) + (o.type === l.type ? 0 : 1e8) + Math.abs(o.price - l.price) / (l.status === o.status ? 1 : 1e-3);
  return listings.filter((o) => o.slug !== l.slug).sort((a, b) => rank(a) - rank(b)).slice(0, n);
};

export const berColor = (ber: string) => `var(--ber-${ber[0].toLowerCase()})`;
export const berDark = (ber: string) => 'ABFG'.includes(ber[0]);
