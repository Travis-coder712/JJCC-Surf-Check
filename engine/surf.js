// ===================================================================
// Surf engine — data fetch, nearshore surf estimate, rating, windows.
//
// Method (see docs/REVIEW_2026-10.md for the why):
//  1. Offshore swell per spot from Météo-France MFWAM (~8 km), split
//     into primary swell, secondary swell and wind-sea.
//  2. Each partition → face height at the break:
//       face = Hs × k(period) × transfer(spot, direction)
//     k(period) grows with period (long-period swell shoals bigger).
//     Partitions combine by energy: sqrt(Σ face²).
//  3. Wind from ECMWF IFS 9 km per area, nudged toward the latest BOM
//     Aireys Inlet observation for the next few hours when available.
//  4. Rating = sizeFit × windFactor × tideFit × periodQuality × suitability.
//     It's multiplicative, so the weakest factor caps the result
//     (no swell = no surf, however nice the wind).
//  5. Everything is evaluated on a 15-minute grid; windows are runs of
//     slots at Fair or better around the day's peak.
// ===================================================================
(function (root) {
  'use strict';

  const { SPOTS, WAVE_CELLS, WIND_AREAS, TIDE_CURVES } = root.SurfSpots;
  const Tides = root.SurfTides;

  const TZ = 'Australia/Melbourne';
  const SLOT = 15 * 60000;
  const FORECAST_DAYS = 7;

  // ── Small helpers ──────────────────────────────────────────────
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const lerp = (a, b, x) => a + (b - a) * x;

  function angleDiff(a, b) {
    const d = Math.abs(a - b) % 360;
    return d > 180 ? 360 - d : d;
  }

  const COMPASS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const compass = deg => COMPASS[Math.round(((deg % 360) + 360) % 360 / 22.5) % 16];
  const compassToDeg = s => { const i = COMPASS.indexOf(s); return i < 0 ? null : i * 22.5; };

  // Piecewise-linear curve [[x, y], ...]
  function curve(points, x) {
    if (x <= points[0][0]) return points[0][1];
    for (let i = 1; i < points.length; i++) {
      if (x <= points[i][0]) {
        const [x0, y0] = points[i - 1], [x1, y1] = points[i];
        return lerp(y0, y1, (x - x0) / (x1 - x0));
      }
    }
    return points[points.length - 1][1];
  }

  // Trapezoid: 0 below a, ramps to 1 at b, 1 until c, ramps to 0 at d.
  function trap(x, a, b, c, d) {
    if (x <= a || x >= d) return 0;
    if (x < b) return (x - a) / (b - a);
    if (x <= c) return 1;
    return (d - x) / (d - c);
  }

  const dateFmt = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
  const dateKey = tMs => dateFmt.format(new Date(tMs));
  const timeFmt = new Intl.DateTimeFormat('en-AU', { timeZone: TZ, hour: 'numeric', minute: '2-digit', hour12: true });
  const fmtTime = tMs => timeFmt.format(new Date(tMs)).replace(' ', '').replace(':00', '');
  const dayFmt = new Intl.DateTimeFormat('en-AU', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'short' });
  function fmtDay(tMs, nowMs = Date.now()) {
    const k = dateKey(tMs);
    if (k === dateKey(nowMs)) return 'Today';
    if (k === dateKey(nowMs + 86400000)) return 'Tomorrow';
    return dayFmt.format(new Date(tMs));
  }

  // ── Fetch ──────────────────────────────────────────────────────
  const MARINE_VARS = [
    'wave_height', 'wave_period', 'wave_direction',
    'swell_wave_height', 'swell_wave_period', 'swell_wave_direction',
    'secondary_swell_wave_height', 'secondary_swell_wave_period', 'secondary_swell_wave_direction',
    'wind_wave_height', 'wind_wave_period', 'wind_wave_direction',
  ];
  const WEATHER_VARS = ['wind_speed_10m', 'wind_direction_10m', 'wind_gusts_10m', 'temperature_2m', 'weather_code', 'precipitation_probability'];

  async function getJson(url, fetchImpl) {
    const res = await fetchImpl(url);
    if (!res.ok) throw new Error(`${res.status} from ${new URL(url).host}`);
    return res.json();
  }

  function asList(x) { return Array.isArray(x) ? x : [x]; }

  async function fetchForecast(fetchImpl = root.fetch.bind(root)) {
    const cellKeys = Object.keys(WAVE_CELLS);
    const areaKeys = Object.keys(WIND_AREAS);
    const coords = (obj, keys) =>
      `latitude=${keys.map(k => obj[k].lat).join(',')}&longitude=${keys.map(k => obj[k].lng).join(',')}`;
    const common = `&timeformat=unixtime&timezone=${encodeURIComponent(TZ)}&forecast_days=${FORECAST_DAYS}`;

    const [mf, ec, wx] = await Promise.all([
      getJson(`https://marine-api.open-meteo.com/v1/marine?${coords(WAVE_CELLS, cellKeys)}&hourly=${MARINE_VARS.join(',')}&models=meteofrance_wave${common}`, fetchImpl),
      getJson(`https://marine-api.open-meteo.com/v1/marine?${coords(WAVE_CELLS, cellKeys)}&hourly=wave_height,wave_period,wave_direction&models=ecmwf_wam025${common}`, fetchImpl).catch(() => null),
      getJson(`https://api.open-meteo.com/v1/forecast?${coords(WIND_AREAS, areaKeys)}&hourly=${WEATHER_VARS.join(',')}&daily=sunrise,sunset${common}`, fetchImpl),
    ]);

    const waves = {};
    asList(mf).forEach((loc, i) => {
      const h = loc.hourly, fb = ec ? asList(ec)[i].hourly : null;
      const pick = (k, j) => h[k][j];
      waves[cellKeys[i]] = {
        t: h.time.map(s => s * 1000),
        parts: h.time.map((_, j) => {
          const parts = [];
          const add = (pre, kind) => {
            const H = pick(`${pre}_height`, j), P = pick(`${pre}_period`, j), D = pick(`${pre}_direction`, j);
            if (H != null && P != null && D != null && H > 0.02 && P > 1) parts.push({ kind, h: H, p: P, d: D });
          };
          add('swell_wave', 'swell'); add('secondary_swell_wave', 'secondary'); add('wind_wave', 'windsea');
          if (!parts.length) {
            // MFWAM gap → ECMWF WAM total sea as a single partition
            const H = pick('wave_height', j) ?? fb?.wave_height[j], P = pick('wave_period', j) ?? fb?.wave_period[j], D = pick('wave_direction', j) ?? fb?.wave_direction[j];
            if (H != null && P != null && D != null) parts.push({ kind: 'total', h: H, p: P, d: D });
          }
          return parts;
        }),
      };
    });

    const wind = {};
    let sun = [];
    asList(wx).forEach((loc, i) => {
      const h = loc.hourly;
      wind[areaKeys[i]] = {
        t: h.time.map(s => s * 1000),
        spd: h.wind_speed_10m, dir: h.wind_direction_10m, gust: h.wind_gusts_10m,
        temp: h.temperature_2m, code: h.weather_code, precip: h.precipitation_probability,
      };
      if (i === 0) {
        sun = loc.daily.time.map((d, j) => ({
          date: dateKey(d * 1000 + 12 * 3600000),
          rise: loc.daily.sunrise[j] * 1000,
          set: loc.daily.sunset[j] * 1000,
        }));
      }
    });

    return { fetchedAt: Date.now(), waves, wind, sun, nowcast: null, obs: null };
  }

  // ── Live observations (BOM Aireys Inlet via the Cloudflare Worker) ──
  // How strongly the Aireys Inlet correction applies to each wind area.
  const OBS_WEIGHT = { aireys: 1, anglesea: 0.9, bells: 0.6, lorne: 0.6, torquay: 0.5, thirteenth: 0.3 };
  const NOWCAST_DECAY = 2 * 3600000;

  async function fetchObs(url, fetchImpl = root.fetch.bind(root)) {
    if (!url) return null;
    const doc = await getJson(url, fetchImpl);
    return doc && doc.latest ? doc : null;
  }

  function uv(spd, dirFrom) {
    const r = dirFrom * Math.PI / 180;
    return [-spd * Math.sin(r), -spd * Math.cos(r)];
  }
  function fromUv(u, v) {
    return { spd: Math.hypot(u, v), dir: (Math.atan2(-u, -v) * 180 / Math.PI + 360) % 360 };
  }

  function attachObs(fc, obs) {
    fc.obs = obs;
    fc.nowcast = null;
    if (!obs || !obs.latest || obs.latest.spd == null) return;
    const t0 = obs.latest.t;
    if (Date.now() - t0 > 3 * 3600000) return; // stale
    const m = rawWind(fc, 'aireys', t0);
    if (!m) return;
    const [mu, mv] = uv(m.spd, m.dir);
    const [ou, ov] = uv(obs.latest.spd, obs.latest.dir ?? m.dir);
    fc.nowcast = { t0, du: ou - mu, dv: ov - mv, gustRatio: obs.latest.gust && obs.latest.spd ? obs.latest.gust / Math.max(obs.latest.spd, 1) : null };
  }

  // ── Series interpolation ───────────────────────────────────────
  function locate(ts, tMs) {
    if (!ts.length || tMs < ts[0] || tMs > ts[ts.length - 1]) return null;
    let lo = 0, hi = ts.length - 1;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (ts[mid] <= tMs) lo = mid; else hi = mid; }
    const x = ts[hi] === ts[lo] ? 0 : (tMs - ts[lo]) / (ts[hi] - ts[lo]);
    return { i: lo, j: hi, x };
  }

  function rawWind(fc, area, tMs) {
    const s = fc.wind[area];
    const L = s && locate(s.t, tMs);
    if (!L) return null;
    const a = uv(s.spd[L.i], s.dir[L.i]), b = uv(s.spd[L.j], s.dir[L.j]);
    const w = fromUv(lerp(a[0], b[0], L.x), lerp(a[1], b[1], L.x));
    w.gust = lerp(s.gust[L.i], s.gust[L.j], L.x);
    const k = L.x < 0.5 ? L.i : L.j;
    w.temp = lerp(s.temp[L.i], s.temp[L.j], L.x);
    w.code = s.code[k];
    w.precip = s.precip[k];
    return w;
  }

  function windAt(fc, area, tMs) {
    const w = rawWind(fc, area, tMs);
    if (!w) return null;
    const nc = fc.nowcast;
    if (nc && tMs >= nc.t0 - 3600000) {
      const k = (OBS_WEIGHT[area] ?? 0.5) * Math.exp(-Math.max(0, tMs - nc.t0) / NOWCAST_DECAY);
      if (k > 0.02) {
        const [u, v] = uv(w.spd, w.dir);
        const c = fromUv(u + nc.du * k, v + nc.dv * k);
        const ratio = w.spd > 1 ? c.spd / w.spd : 1;
        w.spd = c.spd; w.dir = c.dir; w.gust = Math.max(c.spd, w.gust * ratio);
        w.nowcast = k;
      }
    }
    return w;
  }

  function partsAt(fc, cell, tMs) {
    const s = fc.waves[cell];
    const L = s && locate(s.t, tMs);
    if (!L) return null;
    const A = s.parts[L.i], B = s.parts[L.j];
    // interpolate matching partitions by kind; otherwise take the nearer hour
    const near = L.x < 0.5 ? A : B;
    return near.map(p => {
      const q = (L.x < 0.5 ? B : A).find(o => o.kind === p.kind);
      if (!q) return p;
      const x = L.x < 0.5 ? L.x : 1 - L.x; // weight toward q
      const [pu, pv] = uv(1, p.d), [qu, qv] = uv(1, q.d);
      return { kind: p.kind, h: lerp(p.h, q.h, x), p: lerp(p.p, q.p, x), d: fromUv(lerp(pu, qu, x), lerp(pv, qv, x)).dir };
    });
  }

  // ── Nearshore surf estimate ─────────────────────────────────────
  // Face height per metre of offshore Hs, by period. Long-period swell
  // shoals and peaks up more. Heuristic; calibrate with the surf diary.
  const periodGain = T => clamp(0.35 + 0.08 * T, 0.7, 1.6);

  function transfer(spot, dirFrom, period) {
    const pts = spot.swell;
    const first = pts[0][0], last = pts[pts.length - 1][0];
    let t;
    if (dirFrom >= first && dirFrom <= last) t = curve(pts, dirFrom);
    else {
      // fade to ~0 over 35° outside the listed window
      const gap = Math.min(angleDiff(dirFrom, first), angleDiff(dirFrom, last));
      const edge = angleDiff(dirFrom, first) < angleDiff(dirFrom, last) ? pts[0][1] : pts[pts.length - 1][1];
      t = edge * clamp(1 - gap / 35, 0, 1);
    }
    // long-period groundswell bends further into sheltered spots
    const wrap = spot.wrap * clamp((period - 10) / 8, 0, 1) * 0.5;
    return t + (1 - t) * wrap * (t > 0.01 ? 1 : 0.3);
  }

  function surfAt(spot, parts) {
    let e = 0, dom = null, domFace = -1;
    const faces = parts.map(p => {
      const face = p.h * periodGain(p.p) * transfer(spot, p.d, p.p);
      e += face * face;
      if (face > domFace) { domFace = face; dom = p; }
      return { ...p, face };
    });
    return { face: Math.sqrt(e), dominant: dom, parts: faces };
  }

  function windKind(rel, eff) {
    if (eff < 5) return 'glassy';
    if (rel <= 35) return 'offshore';
    if (rel <= 70) return 'cross-offshore';
    if (rel <= 110) return 'cross-shore';
    if (rel <= 145) return 'cross-onshore';
    return 'onshore';
  }

  function shelterFactor(spot, dirFrom) {
    for (const [a, b, f] of spot.shelter || []) {
      const inside = a <= b ? dirFrom >= a && dirFrom <= b : dirFrom >= a || dirFrom <= b;
      if (inside) return f;
    }
    return 1;
  }

  // Raw conditions at a spot and moment (no rating).
  function conditions(fc, spot, tMs) {
    const parts = partsAt(fc, spot.waveCell, tMs);
    const w = windAt(fc, spot.windArea, tMs);
    if (!parts || !w) return null;
    const surf = surfAt(spot, parts);
    const shelter = shelterFactor(spot, w.dir);
    const eff = (0.75 * w.spd + 0.25 * w.gust) * shelter;
    const rel = angleDiff(w.dir, spot.offshore);
    return {
      t: tMs, surf,
      wind: { ...w, eff, rel, shelter, kind: windKind(rel, eff) },
      tide: Tides.at(tMs),
    };
  }

  // ── Rating ─────────────────────────────────────────────────────
  const MODES = {
    surfer: { label: 'Surfer', flatBelow: 0.3, size: [0.25, 0.8, 3.0, 5.5], useSpotRange: true },
    logger: { label: 'Logger', flatBelow: 0.2, size: [0.15, 0.45, 1.3, 2.2], useSpotRange: true },
    family: { label: 'Family', flatBelow: -1, size: null, useSpotRange: false },
  };
  const FAMILY_SUIT = [0, 0.15, 0.35, 0.6, 0.85, 1];
  const LOGGER_SUIT = [0, 0.45, 0.65, 0.82, 0.93, 1];

  const BANDS = [
    { key: 'flat', label: 'Flat', min: -1 },
    { key: 'poor', label: 'Poor', min: 0 },
    { key: 'poor-fair', label: 'Poor to Fair', min: 0.3 },
    { key: 'fair', label: 'Fair', min: 0.45 },
    { key: 'good', label: 'Good', min: 0.6 },
    { key: 'very-good', label: 'Very Good', min: 0.75 },
    { key: 'epic', label: 'Epic', min: 0.88 },
  ];
  const FAIR = 3;

  function bandIndex(q, flat) {
    if (flat) return 0;
    let idx = 1;
    for (let i = 1; i < BANDS.length; i++) if (q >= BANDS[i].min) idx = i;
    return idx;
  }

  function sizeFit(spot, face, mode) {
    const m = MODES[mode];
    if (mode === 'family') {
      // kids & swimming: calm is fine, gentle 0.2–0.6 m best, >1.2 m no go
      return face < 0.15 ? 0.9 : curve([[0.15, 0.8], [0.25, 1], [0.6, 1], [0.9, 0.6], [1.3, 0.2], [1.8, 0.02]], face);
    }
    const [a, b, c, d] = m.size;
    const byMode = trap(face, a, b, c, d);
    // spot: rideable across `works`, at its best only inside `ideal`
    const [lo, hi] = spot.works, [ilo, ihi] = spot.ideal;
    const bySpot = curve([[lo * 0.5, 0], [lo, 0.5], [ilo, 1], [ihi, 1], [hi, 0.6], [hi * 1.5, 0]], face);
    return Math.min(byMode, bySpot);
  }

  function windFactor(rel, eff, mode) {
    if (eff < 5) return 1;
    const on = Math.pow(clamp((rel - 35) / 105, 0, 1), 0.9);
    const sp = clamp((eff - 4) / 12, 0, 1);
    let wf = 1 - 0.85 * on * sp;
    if (rel < 70 && eff > 30) wf *= 1 - clamp((eff - 30) / 40, 0, 0.35); // hard offshore: hard to paddle, spray
    if (mode === 'family') wf = 1 - 0.6 * (1 - wf) - (eff > 25 ? clamp((eff - 25) / 30, 0, 0.4) : 0);
    return clamp(wf, 0.03, 1);
  }

  function tideFit(spot, tide, mode) {
    const w = spot.tide.weight * (mode === 'family' ? 0.3 : 1);
    return 1 - w * (1 - curve(spot.tide.pref, tide.fraction));
  }

  function periodQuality(dom, mode) {
    if (!dom || mode === 'family') return 1;
    // only real groundswell (13 s+) scores full marks
    return curve([[5, 0.6], [7, 0.72], [9, 0.85], [11, 0.93], [13, 1]], dom.p);
  }

  function suitability(spot, mode) {
    if (mode === 'family') return FAMILY_SUIT[spot.family];
    if (mode === 'logger') return LOGGER_SUIT[spot.logger];
    return 1;
  }

  function rate(spot, c, mode) {
    const f = {
      size: sizeFit(spot, c.surf.face, mode),
      wind: windFactor(c.wind.rel, c.wind.eff, mode),
      tide: tideFit(spot, c.tide, mode),
      period: periodQuality(c.surf.dominant, mode),
      suit: suitability(spot, mode),
    };
    const q = f.size * f.wind * f.tide * f.period * f.suit;
    const flat = c.surf.face < MODES[mode].flatBelow;
    const band = bandIndex(q, flat);
    // limiting factor = the one costing the most
    let limiting = null, worst = 1.01;
    for (const k of Object.keys(f)) {
      const v = k === 'period' ? f[k] + 0.1 : f[k]; // period can't change, only flag it when weak
      if (v < worst) { worst = v; limiting = k; }
    }
    if (worst > 0.9) limiting = null;
    return { q, score: Math.round(q * 100) / 10, band, bandKey: BANDS[band].key, label: BANDS[band].label, factors: f, limiting };
  }

  // ── Descriptions ────────────────────────────────────────────────
  function faceLabel(face) {
    if (face < 0.2) return 'Flat';
    if (face < 0.35) return 'Ankle–shin';
    if (face < 0.55) return 'Knee';
    if (face < 0.8) return 'Waist';
    if (face < 1.1) return 'Chest';
    if (face < 1.4) return 'Head high';
    if (face < 1.9) return 'Overhead';
    if (face < 2.6) return 'Well overhead';
    if (face < 3.5) return 'Double overhead';
    return 'Huge';
  }

  function faceRange(face) {
    const lo = Math.max(0, face * 0.85), hi = face * 1.15;
    const r = v => v < 1 ? v.toFixed(1) : (Math.round(v * 2) / 2).toFixed(1).replace('.0', '');
    return face < 0.2 ? '<0.2 m' : `${r(lo)}–${r(hi)} m`;
  }

  function tidePrefName(spot) {
    for (const [k, v] of Object.entries(TIDE_CURVES)) if (v === spot.tide.pref) return k;
    return 'mid';
  }

  function swellWindowText(spot) {
    const best = Math.max(...spot.swell.map(([, t]) => t));
    const good = spot.swell.filter(([, t]) => t >= best * 0.85).map(([d]) => d);
    const a = compass(Math.min(...good)), b = compass(Math.max(...good));
    const dir = a === b ? a : `${a}–${b}`;
    return best < 0.7 ? `a big ${dir} swell` : `more ${dir} swell`;
  }

  const WIND_WORDS = {
    glassy: 'Glassy', offshore: 'Offshore', 'cross-offshore': 'Cross-offshore',
    'cross-shore': 'Cross-shore', 'cross-onshore': 'Cross-onshore', onshore: 'Onshore',
  };

  // ── Timelines & windows ─────────────────────────────────────────
  function daylight(fc, key) {
    const d = fc.sun.find(s => s.date === key);
    if (!d) return null;
    return { first: d.rise - 25 * 60000, last: d.set + 20 * 60000, rise: d.rise, set: d.set };
  }

  // 15-minute slots for one spot over one local day (daylight only).
  function daySlots(fc, spot, key, mode, fromMs = 0) {
    const dl = daylight(fc, key);
    if (!dl) return [];
    const start = Math.ceil(Math.max(dl.first, fromMs) / SLOT) * SLOT;
    const out = [];
    for (let t = start; t <= dl.last; t += SLOT) {
      const c = conditions(fc, spot, t);
      if (c) out.push({ c, r: rate(spot, c, mode) });
    }
    return out;
  }

  function endReason(spot, before, after, mode) {
    if (!after) return { key: 'dark', text: 'last light' };
    const drops = {
      wind: before.r.factors.wind - after.r.factors.wind,
      tide: before.r.factors.tide - after.r.factors.tide,
      size: before.r.factors.size - after.r.factors.size,
    };
    const key = Object.keys(drops).reduce((a, b) => drops[b] > drops[a] ? b : a);
    if (key === 'wind') {
      const w = after.c.wind;
      return { key, text: `wind goes ${WIND_WORDS[w.kind].toLowerCase()} (${compass(w.dir)} ${Math.round(w.spd)} km/h)` };
    }
    if (key === 'tide') return { key, text: `tide gets too ${after.c.tide.fraction > 0.5 ? 'high' : 'low'}` };
    return { key, text: after.c.surf.face < before.c.surf.face ? 'swell fades' : 'swell gets too big' };
  }

  // Windows: every run of slots rated Fair or better. Each run also
  // carries its "prime" stretch — the part within one band of its peak —
  // so a long Fair+ morning still says when it's actually best.
  function expand(slots, i, floor) {
    let a = i, b = i;
    while (a > 0 && slots[a - 1].r.band >= floor) a--;
    while (b < slots.length - 1 && slots[b + 1].r.band >= floor) b++;
    return [a, b];
  }

  function findWindows(spot, slots, mode) {
    const runs = [];
    for (let i = 0; i < slots.length; i++) {
      if (slots[i].r.band < FAIR) continue;
      const [a, b] = expand(slots, i, FAIR);
      let pi = a;
      for (let k = a; k <= b; k++) if (slots[k].r.q > slots[pi].r.q) pi = k;
      const [pa, pb] = expand(slots, pi, Math.max(FAIR, slots[pi].r.band - 1));
      runs.push({
        start: slots[a].c.t, end: slots[b].c.t + SLOT,
        peak: slots[pi],
        prime: { start: slots[pa].c.t, end: slots[pb].c.t + SLOT, band: slots[pi].r.band },
        endReason: endReason(spot, slots[b], slots[b + 1], mode),
        startReason: a > 0 ? endReason(spot, slots[a], slots[a - 1], mode) : null,
        startsAtFirst: a === 0,
      });
      i = b;
    }
    return runs;
  }

  // Best run of the day, or (if nothing reaches Fair) just the best moment.
  function bestWindow(spot, slots, mode) {
    if (!slots.length) return null;
    const runs = findWindows(spot, slots, mode);
    if (runs.length) return runs.reduce((x, y) => y.peak.r.q > x.peak.r.q ? y : x);
    const peak = slots.reduce((x, y) => y.r.q > x.r.q ? y : x);
    return { start: null, end: null, peak, prime: null, endReason: null, startReason: null };
  }

  // ── Advice text ────────────────────────────────────────────────
  // One or two sentences on what's holding the spot back and when it changes.
  function advice(fc, spot, slot, slotsAhead, mode) {
    const { c, r } = slot;
    const lines = [];
    const findAhead = pred => slotsAhead.find(pred);

    switch (r.limiting) {
      case 'tide': {
        const pref = tidePrefName(spot);
        const better = findAhead(s => s.r.factors.tide >= 0.95 && s.c.t > c.t);
        lines.push(`Best on a ${pref} tide. It's ${Tides.describe(c.tide)} now${better ? `, and it's right from ~${fmtTime(better.c.t)}` : ''}.`);
        break;
      }
      case 'wind': {
        const w = c.wind;
        const better = findAhead(s => s.r.factors.wind >= Math.min(0.97, r.factors.wind + 0.15) && s.c.t > c.t);
        const tail = better ? `. It cleans up from ~${fmtTime(better.c.t)}`
          : r.factors.wind < 0.6 ? ', with no let-up in the wind today' : '';
        lines.push(`${compass(w.dir)} ${Math.round(w.spd)} km/h is ${WIND_WORDS[w.kind].toLowerCase()} here${tail}.`);
        break;
      }
      case 'size': {
        if (mode === 'family' && c.surf.face < 0.25) lines.push(`Calm water: good for swimming and paddling, not much for boogie boards.`);
        else if (mode === 'family') lines.push(`${faceLabel(c.surf.face)} waves are a lot for kids here. Stick to the flags or try a sheltered beach.`);
        else if (c.surf.face < spot.works[0]) lines.push(`Too small to break properly here. It needs ${swellWindowText(spot)}.`);
        else if (c.surf.face < spot.ideal[0]) lines.push(`Rideable but small for this spot. It's at its best around ${spot.ideal[0]}–${spot.ideal[1]} m with ${swellWindowText(spot)}.`);
        else if (c.surf.face < spot.works[1]) lines.push(`On the big side for ${spot.short}. Expect some closeouts and a solid paddle.`);
        else lines.push(`Bigger than ${spot.short} handles. Expect closeouts and a hard paddle; look for somewhere more sheltered.`);
        break;
      }
      case 'period': {
        const p = Math.round(c.surf.dominant.p);
        lines.push(p < 8 ? `Short-period wind swell (${p} s), so it'll be weak and lumpy.`
          : `Mid-period swell (${p} s): rideable, but without much push.`);
        break;
      }
      case 'suit':
        lines.push(mode === 'family'
          ? `Not a kids' beach: ${spot.skill === 'advanced' ? 'reef, cliffs and heavy waves' : 'strong rips and a powerful break'}.`
          : `Not a natural longboard wave. It's steep and powerful.`);
        break;
      default: {
        const w = c.wind;
        lines.push(`It all lines up: ${WIND_WORDS[w.kind].toLowerCase()} wind, ${Tides.describe(c.tide)} tide, ${Math.round(c.surf.dominant?.p || 0)} s ${compass(c.surf.dominant?.d || 0)} swell.`);
      }
    }
    return lines.join(' ');
  }

  // ── Public assemblies ───────────────────────────────────────────
  function confidence(tMs, fetchedAt) {
    const h = (tMs - fetchedAt) / 3600000;
    return h < 24 ? 'high' : h < 72 ? 'medium' : 'low';
  }

  // Full read-out for one spot on one day: slots, best window, advice now.
  function spotDay(fc, spot, key, mode, nowMs = Date.now()) {
    const slots = daySlots(fc, spot, key, mode);
    const isToday = key === dateKey(nowMs);
    const remaining = isToday ? slots.filter(s => s.c.t >= nowMs - SLOT) : slots;
    const win = bestWindow(spot, remaining, mode);
    const windows = findWindows(spot, remaining, mode);
    const nowSlot = isToday ? remaining[0] : null;
    return {
      spot, key, slots, remaining, window: win, windows,
      nowRun: nowSlot && windows.length && windows[0].startsAtFirst ? windows[0] : null,
      now: nowSlot ? { ...nowSlot, advice: advice(fc, spot, nowSlot, remaining, mode) } : null,
      peakAdvice: win ? advice(fc, spot, win.peak, remaining, mode) : null,
      confidence: win ? confidence(win.peak.c.t, fc.fetchedAt) : 'low',
    };
  }

  function forecastDays(fc, nowMs = Date.now()) {
    return fc.sun.map(s => s.date).filter(k => k >= dateKey(nowMs));
  }

  // Rank all spots: right now, or by day (best window).
  function rankNow(fc, mode, nowMs = Date.now()) {
    const key = dateKey(nowMs);
    const dl = daylight(fc, key);
    const dark = !dl || nowMs > dl.last || nowMs < dl.first;
    return SPOTS.map(spot => {
      const c = conditions(fc, spot, nowMs);
      if (!c) return null;
      const r = rate(spot, c, mode);
      const day = spotDay(fc, spot, key, mode, nowMs);
      return { spot, c, r, dark, advice: advice(fc, spot, { c, r }, day.remaining, mode), day };
    }).filter(Boolean).sort((a, b) => b.r.q - a.r.q);
  }

  function rankDay(fc, key, mode, nowMs = Date.now()) {
    return SPOTS.map(spot => spotDay(fc, spot, key, mode, nowMs))
      .filter(d => d.window)
      .sort((a, b) => b.window.peak.r.q - a.window.peak.r.q);
  }

  root.SurfEngine = {
    SPOTS, WAVE_CELLS, WIND_AREAS, MODES, BANDS,
    fetchForecast, fetchObs, attachObs,
    conditions, rate, spotDay, rankNow, rankDay, forecastDays, daylight,
    faceLabel, faceRange, compass, compassToDeg, angleDiff, windKind, WIND_WORDS, tidePrefName, swellWindowText,
    dateKey, fmtTime, fmtDay, SLOT,
  };
})(typeof window !== 'undefined' ? window : globalThis);
