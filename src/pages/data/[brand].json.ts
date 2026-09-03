// Олекотените данни за калкулатора: теглят се по марка, само при нужда (план, стр. 24).
import type { APIRoute } from 'astro';
import { brands, engineLabel } from '@/lib/catalog';
export function getStaticPaths() { return brands.map((b) => ({ params: { brand: b.slug }, props: { b } })); }
export const GET: APIRoute = ({ props }) => {
  const b = props.b as (typeof brands)[number];
  const out = { slug: b.slug, name: b.name, models: b.models.map((m) => ({ slug: m.slug, name: m.name, gens: m.generations.map((g) => ({ slug: g.slug, from: g.from, to: g.to, engines: g.engines.map((e) => ({ path: e.path, name: engineLabel(e), fuel: e.fuel, hp: [e.hpStock, e.hpTuned], nm: e.nmStock != null && e.nmTuned != null ? [e.nmStock, e.nmTuned] : null })) })) })) };
  return new Response(JSON.stringify(out), { headers: { 'content-type': 'application/json; charset=utf-8' } });
};
