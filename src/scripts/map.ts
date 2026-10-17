// Shared MapLibre module. maplibre-gl is only imported when a map nears the viewport.
import type { Map as MLMap, Marker } from 'maplibre-gl';

const LAND = '#E9EBED', WATER = '#D5DEE6', PINK = '#C9146C', GREY = '#8F949A';
type LL = [number, number]; // [lat, lng]

export function onNear(el: Element, fn: () => void) {
  if (!('IntersectionObserver' in window)) return fn();
  const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); fn(); } }, { rootMargin: '400px' });
  io.observe(el);
}

let stylePromise: Promise<any> | null = null;
function loadStyle() {
  stylePromise ??= fetch('https://tiles.openfreemap.org/styles/positron').then((r) => r.json()).then(restyle);
  return stylePromise;
}

function restyle(style: any) {
  const layers: any[] = [];
  for (const l of style.layers) {
    const id: string = l.id;
    l.paint ??= {};
    if (l.type === 'background') l.paint['background-color'] = LAND;
    else if (id === 'park') { l.paint['fill-color'] = '#DDE3DC'; l.paint['fill-opacity'] = 1; }
    else if (id === 'water') { l.paint['fill-color'] = WATER; }
    else if (id === 'waterway') l.paint['line-color'] = WATER;
    else if (id === 'building') { l.paint['fill-color'] = '#E1E3E6'; l.paint['fill-outline-color'] = '#E1E3E6'; l.paint['fill-opacity'] = 1; }
    else if (id.startsWith('landcover') || id.startsWith('landuse')) l.paint['fill-opacity'] = 0;
    else if (id.startsWith('boundary') || id.startsWith('aeroway') || id.includes('shield') || id === 'airport') continue;
    else if (l.type === 'line' && l['source-layer'] === 'transportation') {
      if (id.includes('casing')) l.paint['line-opacity'] = 0;
      else if (id.startsWith('railway')) l.paint['line-color'] = '#D5D8DB';
      else { l.paint['line-color'] = '#FFFFFF'; l.paint['line-opacity'] = 1; }
    } else if (l.type === 'fill' && id.startsWith('road')) l.paint['fill-color'] = '#FFFFFF';
    else if (l.type === 'symbol') {
      l.paint['text-color'] = GREY; l.paint['text-halo-color'] = 'rgba(255,255,255,.9)';
      l.layout = { ...l.layout, 'text-size': 11, 'icon-image': undefined };
    }
    layers.push(l);
  }
  style.layers = layers;
  return style;
}

const circlePoly = (c: LL, r: number, n = 48) => {
  const pts: number[][] = [];
  const dLat = r / 111320, dLng = r / (111320 * Math.cos((c[0] * Math.PI) / 180));
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * 2 * Math.PI;
    pts.push([c[1] + dLng * Math.cos(a), c[0] + dLat * Math.sin(a)]);
  }
  return { type: 'Feature' as const, properties: {}, geometry: { type: 'Polygon' as const, coordinates: [pts] } };
};

export type PinKind = 'home' | 'dim' | 'poi' | 'office' | 'mini';
export type Opts = {
  el: HTMLElement; center: LL; zoom: number; label: string;
  interactive?: boolean; controls?: boolean;
};

export class MonMap {
  map!: MLMap;
  ml: any;
  pins = new Map<string, { m: Marker; el: HTMLElement }>();
  static async create(o: Opts) {
    const self = new MonMap();
    const [mod, worker] = await Promise.all([
      import('maplibre-gl'),
      import('maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'),
      import('maplibre-gl/dist/maplibre-gl.css'),
    ]);
    self.ml = (mod as any).default ?? mod;
    self.ml.setWorkerUrl((worker as any).default);
    const style = await loadStyle();
    const coarse = matchMedia('(pointer: coarse)').matches;
    const interactive = o.interactive !== false;
    o.el.setAttribute('role', 'region');
    o.el.setAttribute('aria-label', o.label);
    self.map = new self.ml.Map({
      container: o.el, style: JSON.parse(JSON.stringify(style)),
      center: [o.center[1], o.center[0]], zoom: o.zoom,
      interactive, attributionControl: { compact: true },
      cooperativeGestures: interactive && coarse,
      dragRotate: false, pitchWithRotate: false, touchPitch: false,
    });
    if (interactive) { self.map.scrollZoom.disable(); self.map.keyboard.disable(); self.map.doubleClickZoom.disable(); }
    if (interactive && o.controls !== false) self.map.addControl(new self.ml.NavigationControl({ showCompass: false }), 'bottom-right');
    self.map.touchZoomRotate?.disableRotation?.();
    await new Promise<void>((res) => (self.map.loaded() ? res() : self.map.once('load', () => res())));
    const collapse = () => o.el.querySelectorAll('.maplibregl-ctrl-attrib').forEach((a) => { a.classList.remove('maplibregl-compact-show'); a.removeAttribute('open'); });
    collapse(); setTimeout(collapse, 300);
    return self;
  }

  setCircle(c: LL | null, r = 0) {
    const data: any = c ? circlePoly(c, r) : { type: 'FeatureCollection', features: [] };
    const src: any = this.map.getSource('area');
    if (src) return src.setData(data);
    this.map.addSource('area', { type: 'geojson', data });
    this.map.addLayer({ id: 'area-fill', type: 'fill', source: 'area', paint: { 'fill-color': PINK, 'fill-opacity': 0.1 } });
    this.map.addLayer({ id: 'area-line', type: 'line', source: 'area', paint: { 'line-color': PINK, 'line-width': 2.5 } });
  }

  private pinEl(kind: PinKind) {
    const el = document.createElement('div');
    el.className = `pin pin-${kind}`;
    if (kind === 'home' || kind === 'mini' || kind === 'office') el.innerHTML = '<i></i>';
    return el;
  }

  addPin(id: string, ll: LL, kind: PinKind) {
    this.removePin(id);
    const el = this.pinEl(kind);
    const m = new this.ml.Marker({ element: el, anchor: 'center' }).setLngLat([ll[1], ll[0]]).addTo(this.map);
    this.pins.set(id, { m, el });
    return el;
  }
  setKind(id: string, kind: PinKind) {
    const p = this.pins.get(id);
    if (!p) return;
    p.el.className = `pin pin-${kind}`;
    p.el.innerHTML = kind === 'home' || kind === 'mini' || kind === 'office' ? '<i></i>' : '';
  }
  removePin(id: string) { const p = this.pins.get(id); if (p) { p.m.remove(); this.pins.delete(id); } }
  clearPins(prefix = '') { for (const id of [...this.pins.keys()]) if (id.startsWith(prefix)) this.removePin(id); }

  ease(c: LL, zoom: number, ms = 600) {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.map.easeTo({ center: [c[1], c[0]], zoom, duration: reduce ? 0 : ms, easing: (t: number) => 1 - Math.pow(1 - t, 3) });
  }
  jump(c: LL, zoom?: number) { this.map.jumpTo({ center: [c[1], c[0]], ...(zoom ? { zoom } : {}) }); }
  fit(pts: LL[], padding = 48, ms = 600) {
    const b = new this.ml.LngLatBounds();
    pts.forEach((p) => b.extend([p[1], p[0]]));
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.map.fitBounds(b, { padding, duration: reduce ? 0 : ms, maxZoom: 16, easing: (t: number) => 1 - Math.pow(1 - t, 3) });
  }
  resize() { this.map.resize(); }
}
