import type { ImageMetadata } from 'astro';
const mods = import.meta.glob<{ default: ImageMetadata }>('../assets/photos/*.webp', { eager: true });
const map: Record<string, ImageMetadata> = {};
for (const [p, m] of Object.entries(mods)) map[p.split('/').pop()!] = m.default;
export const photo = (file: string): ImageMetadata => {
  if (!map[file]) throw new Error('Missing photo ' + file);
  return map[file];
};
