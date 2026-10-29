// Cloudflare Worker: BOM live weather observations with CORS, for JJCC Surf Check.
//
// BOM's observation JSON has no CORS headers, so the browser can't read it
// directly. This proxies a fixed allow-list of stations, trims the payload,
// and caches for 10 minutes (BOM updates every 30 min).
//
// Deploy: Cloudflare dashboard → Workers → Create → paste this file → Deploy.
// Then put the worker URL in engine/config.js (OBS_URL).
//
//   GET /            → Aireys Inlet (default)
//   GET /?station=94846

const STATIONS = {
  94846: { name: 'Aireys Inlet', product: 'IDV60801' },
  94842: { name: 'Cape Otway', product: 'IDV60801' },
};
const DEFAULT = 94846;
const CACHE_SECONDS = 600;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

const COMPASS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

// "20261029210000" (UTC) → ms
function utcStamp(s) {
  return Date.UTC(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8), +s.slice(8, 10), +s.slice(10, 12));
}

function row(r) {
  const i = COMPASS.indexOf(r.wind_dir);
  return {
    t: utcStamp(r.aifstime_utc),
    dir: i < 0 ? null : i * 22.5,
    dirText: r.wind_dir,
    spd: r.wind_spd_kmh,
    gust: r.gust_kmh,
    temp: r.air_temp,
  };
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });
    const url = new URL(request.url);
    const id = Number(url.searchParams.get('station')) || DEFAULT;
    const st = STATIONS[id];
    if (!st) return new Response('unknown station', { status: 404, headers: CORS });

    const cache = caches.default;
    const key = new Request(`https://cache.local/obs/${id}`);
    const hit = await cache.match(key);
    if (hit) return hit;

    const res = await fetch(`https://www.bom.gov.au/fwo/${st.product}/${st.product}.${id}.json`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh)' },
    });
    if (!res.ok) return new Response(`BOM ${res.status}`, { status: 502, headers: CORS });
    const data = (await res.json()).observations.data;
    const rows = data.slice(0, 12).map(row); // ~6 hours at 30-min intervals
    const body = JSON.stringify({ station: st.name, id, latest: rows[0], history: rows, source: 'Bureau of Meteorology' });

    const out = new Response(body, {
      headers: { ...CORS, 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${CACHE_SECONDS}` },
    });
    ctx.waitUntil(cache.put(key, out.clone()));
    return out;
  },
};
