// Node smoke test: node tools/engine_check.mjs [mode]
import fs from 'node:fs';
import vm from 'node:vm';
const ctx = { console, fetch, Intl, Date, Math, URL, Promise, JSON };
ctx.globalThis = ctx; vm.createContext(ctx);
for (const f of ['engine/spots.js', 'engine/tides.js', 'engine/surf.js']) vm.runInContext(fs.readFileSync(f, 'utf8'), ctx, { filename: f });
ctx.SurfTides.load(JSON.parse(fs.readFileSync('data/tides.json', 'utf8')));
const E = ctx.SurfEngine, mode = process.argv[2] || 'surfer';
const fc = await E.fetchForecast(fetch);
const now = Date.now();
console.log('mode', mode, 'now', E.fmtTime(now), 'tide', ctx.SurfTides.describe(ctx.SurfTides.at(now)), ctx.SurfTides.at(now).h.toFixed(2));
for (const x of E.rankNow(fc, mode, now)) {
  const w = x.day.window;
  console.log(`${x.spot.short.padEnd(18)} ${x.r.label.padEnd(12)} ${x.r.score.toFixed(1).padStart(4)}  ${E.faceRange(x.c.surf.face).padEnd(10)} ${E.compass(x.c.wind.dir)} ${Math.round(x.c.wind.spd)}km/h ${x.c.wind.kind.padEnd(14)} lim=${x.r.limiting}`);
  console.log(`   ${x.advice}`);
  for (const r of x.day.windows) console.log(`   Fair+ ${E.fmtTime(r.start)}–${E.fmtTime(r.end)} · best ${E.fmtTime(r.prime.start)}–${E.fmtTime(r.prime.end)} ${r.peak.r.label} · ends: ${r.endReason.text}`);
  if (w && !w.start) console.log(`   no Fair window; best ${w.peak.r.label} ~${E.fmtTime(w.peak.c.t)}`);
}
for (const key of E.forecastDays(fc, now).slice(1, 4)) {
  const top = E.rankDay(fc, key, mode, now).slice(0, 3);
  console.log('\n', key, top.map(d => `${d.spot.short}: ${d.window.peak.r.label} ${d.window.start ? E.fmtTime(d.window.start) + '–' + E.fmtTime(d.window.end) : '~' + E.fmtTime(d.window.peak.c.t)}`).join(' | '));
}
if (process.env.OBS_FILE) {
  const obs = JSON.parse(fs.readFileSync(process.env.OBS_FILE, 'utf8'));
  const before = ctx.SurfEngine.conditions(fc, E.SPOTS.find(s => s.id === 'anglesea'), obs.latest.t);
  E.attachObs(fc, obs);
  const after = ctx.SurfEngine.conditions(fc, E.SPOTS.find(s => s.id === 'anglesea'), obs.latest.t);
  console.log('\nobs', obs.latest.dirText, obs.latest.spd, '| model', E.compass(before.wind.dir), before.wind.spd.toFixed(1), '→ nudged', E.compass(after.wind.dir), after.wind.spd.toFixed(1), 'nowcast', JSON.stringify(fc.nowcast));
}
