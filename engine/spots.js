// ===================================================================
// Spot profiles — the knowledge base behind every rating.
//
// Geometry (lat/lng on the break, `facing`) was checked against the
// OpenStreetMap coastline in Oct 2026 — see docs/REVIEW_2026-10.md.
// Wind/swell/tide behaviour is local knowledge; anything marked
// `// CHECK` is a best estimate that should be confirmed by someone
// who surfs the spot.
//
// facing     compass bearing you look out to sea (shore-normal)
// offshore   wind direction (FROM) that is dead offshore. Usually
//            facing+180, nudged where local knowledge says otherwise.
// shelter    [fromDeg, toDeg, factor]: wind from this sector is
//            reduced to `factor` × speed by a headland/cliff
// swell      [directionFrom, transfer] points; how much of the
//            offshore swell from that direction reaches the break
//            (interpolated, ~0 outside the listed range)
// wrap       0..1 how much extra long-period swell bends in (points,
//            sheltered coves pick up more on 13s+ groundswell)
// works      [min, max] face height (m) where the break works for
//            board riders; below min it barely breaks, above max it
//            closes out / gets dangerous
// ideal      [lo, hi] face height (m) where the spot is at its best
// tide       { pref, weight, note } — pref is a curve over the tide
//            fraction (0 = low, 1 = high); weight 0..1 is how much
//            the spot cares
// family     1..5 suitability for kids / swimming (5 = safest)
// logger     1..5 suitability for longboards
// skill      'beginner' | 'intermediate' | 'advanced'
// waveCell   key into WAVE_CELLS (Météo-France MFWAM ~8 km grid)
// windArea   key into WIND_AREAS (ECMWF IFS 9 km grid)
// ===================================================================
(function (root) {
  'use strict';

  const TIDE_CURVES = {
    all:      [[0, 1], [1, 1]],
    low:      [[0, 1], [0.3, 0.9], [0.6, 0.6], [1, 0.35]],
    'low-mid': [[0, 0.9], [0.35, 1], [0.65, 0.8], [1, 0.5]],
    mid:      [[0, 0.6], [0.5, 1], [1, 0.6]],
    'mid-high': [[0, 0.4], [0.35, 0.75], [0.6, 1], [1, 0.95]],
    high:     [[0, 0.35], [0.4, 0.6], [0.75, 1], [1, 1]],
  };

  // One deep-water point per distinct MFWAM cell. Breaks sharing a cell see the
  // same offshore swell — the per-spot `swell` transfer is what separates them.
  const WAVE_CELLS = {
    zeally:   { lat: -38.375, lng: 144.375, label: 'off Torquay / Zeally Bay' },
    juc:      { lat: -38.375, lng: 144.292, label: 'off Jan Juc – Bells' },
    anglesea: { lat: -38.458, lng: 144.208, label: 'off Anglesea' },
    aireys:   { lat: -38.542, lng: 144.125, label: 'off Aireys Inlet' },
    lorne:    { lat: -38.625, lng: 144.042, label: 'off Lorne' },
    thirteenth: { lat: -38.292, lng: 144.458, label: 'off 13th Beach' },
  };

  const WIND_AREAS = {
    torquay:  { lat: -38.345, lng: 144.315, label: 'Torquay' },
    bells:    { lat: -38.372, lng: 144.280, label: 'Bells' },
    anglesea: { lat: -38.415, lng: 144.185, label: 'Anglesea' },
    aireys:   { lat: -38.468, lng: 144.090, label: 'Aireys Inlet' },
    lorne:    { lat: -38.540, lng: 143.975, label: 'Lorne' },
    thirteenth: { lat: -38.288, lng: 144.490, label: 'Barwon Heads' },
  };

  const SPOTS = [
    {
      id: 'torquay-front', name: 'Torquay Front Beach', short: 'Front Beach', location: 'Torquay',
      lat: -38.3305, lng: 144.3275, facing: 113, offshore: 293,
      shelter: [],
      swell: [[110, 0.55], [140, 0.5], [170, 0.35], [200, 0.18], [230, 0.1], [260, 0.04]],
      wrap: 0.4, works: [0.3, 1.2], ideal: [0.5, 0.9],
      tide: { pref: TIDE_CURVES.mid, weight: 0.25, note: 'Works on all tides; mid is easiest for learners.' },
      family: 5, logger: 3, skill: 'beginner',
      type: 'Beach break', bottom: 'Sand', driveMinutes: 8, patrolled: true,
      waveCell: 'zeally', windArea: 'torquay',
      description: 'Sheltered, ESE-facing beach inside Point Danger. Point Danger and the reef block most of the SW swell, so it stays small and gentle when the open beaches are big.',
      bestFor: 'Young kids, learners, swimming',
      firesWhen: 'Only gets real waves on a big S–SE swell. In SW–W winds it is glassy when everywhere else is choppy.',
    },
    {
      id: 'torquay-surf', name: 'Torquay Surf Beach', short: 'Torquay Surf Beach', location: 'Torquay',
      lat: -38.3458, lng: 144.3125, facing: 165, offshore: 345,
      shelter: [],
      swell: [[130, 0.6], [160, 0.85], [190, 0.85], [215, 0.7], [240, 0.5], [270, 0.2]],
      wrap: 0.1, works: [0.4, 2.2], ideal: [0.8, 1.6],
      tide: { pref: TIDE_CURVES['low-mid'], weight: 0.5, note: 'Best low to mid. High tide with any size gets fat or closes out.' },
      family: 3, logger: 3, skill: 'beginner',
      type: 'Beach break', bottom: 'Sand', driveMinutes: 5, patrolled: true,
      waveCell: 'juc', windArea: 'torquay',
      description: 'Also called Back Beach. South-facing open beach with shifting sandbanks. Patrolled and roomy; the go-to learner surf beach when it is small.',
      bestFor: 'Learners on small days, intermediates',
      firesWhen: 'Small to mid S–SW swell with N–NNW winds on a low-mid tide.',
    },
    {
      id: 'jan-juc', name: 'Jan Juc', short: 'Jan Juc', location: 'Jan Juc',
      lat: -38.3509, lng: 144.3009, facing: 140, offshore: 330, // CHECK: N–NW is the classic offshore
      shelter: [],
      swell: [[130, 0.45], [160, 0.75], [190, 0.95], [215, 0.95], [240, 0.75], [265, 0.4]],
      wrap: 0.1, works: [0.5, 2.5], ideal: [1.0, 2.0],
      tide: { pref: TIDE_CURVES['low-mid'], weight: 0.6, note: 'Low to mid on the push. Gets fat and sluggish on high.' }, // CHECK
      family: 2, logger: 2, skill: 'intermediate',
      type: 'Reef & beach break', bottom: 'Sand over reef', driveMinutes: 2, patrolled: true,
      waveCell: 'juc', windArea: 'torquay',
      description: 'The home break. Sand banks over reef along a SE-facing beach between Rocky Point and Bird Rock. The Bowl is the heavier, hollower section. Rips run along the reef edges.',
      bestFor: 'Intermediate to advanced surfers',
      firesWhen: 'S–SW swell in the 1–2 m range, N to NW winds, low-mid incoming tide.',
    },
    {
      id: 'bells', name: 'Bells Beach', short: 'Bells', location: 'Bells Beach',
      lat: -38.3697, lng: 144.2818, facing: 137, offshore: 310,
      shelter: [],
      swell: [[150, 0.55], [180, 0.8], [205, 0.95], [225, 1.0], [250, 0.9], [275, 0.55]],
      wrap: 0.15, works: [1.0, 4.5], ideal: [1.8, 3.5],
      tide: { pref: TIDE_CURVES['mid-high'], weight: 0.45, note: 'Mid to high. Low tide gets shallow and sectiony on the reef.' },
      family: 1, logger: 1, skill: 'advanced',
      type: 'Reef break', bottom: 'Rock reef', driveMinutes: 6, patrolled: false,
      waveCell: 'juc', windArea: 'bells',
      description: 'The world-famous right-hand reef: long walls off the Bowl in a cliff-lined amphitheatre. Needs size to work. Heavy and crowded; steep stairs in.',
      bestFor: 'Experienced surfers',
      firesWhen: 'Solid long-period SW groundswell (2 m+ offshore, 12 s+), W–NW winds, mid tide.',
    },
    {
      id: 'point-addis', name: 'Point Addis', short: 'Point Addis', location: 'Anglesea',
      lat: -38.3935, lng: 144.2560, facing: 130, offshore: 300, // CHECK
      shelter: [[230, 285, 0.5]], // the point blocks some W–WSW wind
      swell: [[150, 0.5], [180, 0.7], [210, 0.8], [235, 0.75], [260, 0.5]],
      wrap: 0.35, works: [1.0, 4.0], ideal: [1.6, 3.0],
      tide: { pref: TIDE_CURVES['mid-high'], weight: 0.35, note: 'Works most tides; mid to high is safest over the reef.' },
      family: 1, logger: 2, skill: 'advanced',
      type: 'Point & reef break', bottom: 'Rock reef', driveMinutes: 12, patrolled: false,
      waveCell: 'juc', windArea: 'bells',
      description: 'Remote right-hand point in the Point Addis Marine National Park. Long walk down from the car park. Handles size and some westerly wind when Bells is messy.',
      bestFor: 'Advanced surfers',
      firesWhen: 'Big SW swell with W–NW winds. The point takes the edge off a westerly.',
    },
    {
      id: 'anglesea', name: 'Anglesea Main Beach', short: 'Anglesea', location: 'Anglesea',
      lat: -38.4100, lng: 144.1930, facing: 145, offshore: 335,
      shelter: [],
      swell: [[130, 0.55], [160, 0.75], [190, 0.75], [220, 0.6], [245, 0.4], [270, 0.15]],
      wrap: 0.15, works: [0.3, 1.8], ideal: [0.6, 1.3],
      tide: { pref: TIDE_CURVES['low-mid'], weight: 0.4, note: 'Low to mid. The river-mouth banks shift after rain.' },
      family: 4, logger: 4, skill: 'beginner',
      type: 'Beach break', bottom: 'Sand', driveMinutes: 18, patrolled: true,
      waveCell: 'anglesea', windArea: 'anglesea',
      description: 'Friendly, patrolled beach break at the mouth of the Anglesea River. The headlands keep it a bit smaller than the open beaches.',
      bestFor: 'Families, learners, bodyboarding, longboards',
      firesWhen: 'Small to mid S swell with N–NW winds.',
    },
    {
      id: 'roadknight', name: 'Point Roadknight', short: 'Roadknight', location: 'Anglesea',
      lat: -38.4180, lng: 144.1815, facing: 125, offshore: 305,
      shelter: [[195, 270, 0.4]], // the point blocks SW–W wind
      swell: [[100, 0.45], [130, 0.4], [160, 0.25], [190, 0.12], [220, 0.06], [250, 0.03]],
      wrap: 0.5, works: [0.2, 1.0], ideal: [0.3, 0.7],
      tide: { pref: TIDE_CURVES.all, weight: 0.1, note: 'All tides. Rock pools on the point at low.' },
      family: 5, logger: 4, skill: 'beginner',
      type: 'Sheltered beach', bottom: 'Sand', driveMinutes: 17, patrolled: true,
      waveCell: 'anglesea', windArea: 'anglesea',
      description: 'The sheltered beach inside the point at the south end of Anglesea. The point blocks the SW swell and wind, so it is usually calm. One of the safest spots on the coast for kids.',
      bestFor: 'Young kids, swimming, first waves',
      firesWhen: 'Gets gentle peelers on a big S swell. Its best trick is staying calm in SW winds.',
    },
    {
      id: 'fairhaven', name: 'Fairhaven', short: 'Fairhaven', location: 'Fairhaven',
      lat: -38.4686, lng: 144.0911, facing: 175, offshore: 355,
      shelter: [],
      swell: [[130, 0.6], [160, 0.9], [190, 1.0], [220, 0.9], [250, 0.65], [275, 0.3]],
      wrap: 0.05, works: [0.4, 2.0], ideal: [0.8, 1.5],
      tide: { pref: TIDE_CURVES['low-mid'], weight: 0.55, note: 'Low to mid. High tide gets a heavy shorebreak.' },
      family: 2, logger: 2, skill: 'intermediate',
      type: 'Beach break', bottom: 'Sand', driveMinutes: 28, patrolled: true,
      waveCell: 'aireys', windArea: 'aireys',
      description: 'Long, fully exposed south-facing beach with many peaks. Picks up everything; powerful with strong rips. Patrolled at the club in summer.',
      bestFor: 'Intermediates; strong swimmers only',
      firesWhen: 'Small to mid swell with N winds. It maxes out quickly when the swell is big.',
    },
    {
      id: 'lorne', name: 'Lorne', short: 'Lorne', location: 'Lorne',
      lat: -38.5418, lng: 143.9770, facing: 85, offshore: 270,
      shelter: [[200, 330, 0.6]], // the Otways take the edge off W–NW
      swell: [[90, 0.4], [120, 0.5], [150, 0.5], [180, 0.4], [210, 0.28], [240, 0.12]],
      wrap: 0.6, works: [0.3, 1.6], ideal: [0.6, 1.2],
      tide: { pref: TIDE_CURVES['low-mid'], weight: 0.35, note: 'Low to mid for surfing; the point on the south end likes mid.' },
      family: 4, logger: 4, skill: 'beginner',
      type: 'Beach & point', bottom: 'Sand / rock point', driveMinutes: 45, patrolled: true,
      waveCell: 'lorne', windArea: 'lorne',
      description: 'East-facing Louttit Bay is sheltered from the prevailing SW. It is usually much smaller and cleaner than the east coast. The point at the south end throws up fun rights on a big S swell.',
      bestFor: 'Families, learners, longboards',
      firesWhen: 'Big S–SW swell with W winds; it is offshore here when the Torquay beaches are blown out.',
    },
    {
      id: 'thirteenth', name: '13th Beach', short: '13th Beach', location: 'Barwon Heads',
      lat: -38.2885, lng: 144.4890, facing: 190, offshore: 10,
      shelter: [],
      swell: [[140, 0.65], [170, 0.95], [195, 1.0], [220, 0.85], [245, 0.6], [270, 0.3]],
      wrap: 0.05, works: [0.4, 2.2], ideal: [0.9, 1.7],
      tide: { pref: TIDE_CURVES['low-mid'], weight: 0.5, note: 'Low to mid. Banks shift regularly along the 6 km stretch.' },
      family: 2, logger: 3, skill: 'intermediate',
      type: 'Beach break', bottom: 'Sand (reef at Beacon)', driveMinutes: 25, patrolled: true,
      waveCell: 'thirteenth', windArea: 'thirteenth',
      description: 'Long, exposed beach between Barwon Heads and Breamlea. Lots of peaks, and Beacon at the eastern end. Strong rips.',
      bestFor: 'Intermediates after uncrowded peaks',
      firesWhen: 'N to NE winds. It is the classic escape when a NE wind is side-shore at Bells and Jan Juc.',
    },
  ];

  root.SurfSpots = { SPOTS, WAVE_CELLS, WIND_AREAS, TIDE_CURVES };
})(typeof window !== 'undefined' ? window : globalThis);
