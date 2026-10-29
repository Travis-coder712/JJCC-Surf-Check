// ===================================================================
// JJCC Surf Check — Torquay Coast
// Real-time surf conditions & recommendations
// ===================================================================
(function () {
  'use strict';

  const APP_VERSION = '2.0.0';

  // ── Spots ──────────────────────────────────────────────────────
  // Profiles, geometry and the rating engine live in engine/*.js
  // (see docs/REVIEW_2026-10.md for the method).
  const E = window.SurfEngine;
  const Tides = window.SurfTides;
  const BEACHES = E.SPOTS;

  // ── Beach intel ─────────────────────────────────────────────
  // Detailed surf knowledge for each spot, sourced from web references
  const BEACH_INTEL = {
    'torquay-front': {
      swell: 'Picks up small easterly wind swells and refracted southerly swell. Needs bigger conditions to get going.',
      tide: 'Works on all tides. Best at mid-tide for beginners.',
      hazards: 'Generally safe. Occasional rip near the rocks on the south end.',
      season: 'Year-round for learners. Summer for families (patrolled).',
      local_tip: 'When it\'s too big everywhere else, Front Beach usually has something manageable. Great for after-school sessions.',
      sources: [
        { name: 'Surf-Forecast.com', url: 'https://www.surf-forecast.com/breaks/Torquay-Front-Beach' },
        { name: 'BeachSafe', url: 'https://beachsafe.org.au/beach/vic/surf-coast/torquay/front-beach' },
      ],
    },
    'torquay-surf': {
      swell: 'Exposed to south and south-west swells. Consistent and picks up most available swell energy along this stretch.',
      tide: 'Best at low to mid tide. Can close out on high tide with bigger swells.',
      hazards: 'Strong rips on bigger days, especially near the rocks. Watch the channel rip on the eastern end.',
      season: 'Year-round. Autumn/winter brings the best and most consistent swell.',
      local_tip: 'Also called "Back Beach". Walk east along the beach to find less crowded peaks. The car park break can get very busy.',
      sources: [
        { name: 'Surf-Forecast.com', url: 'https://www.surf-forecast.com/breaks/Torquay' },
        { name: 'Swellnet', url: 'https://www.swellnet.com/surfing/australia/victoria/torquay' },
      ],
    },
    'jan-juc': {
      swell: 'Handles south-west through to southerly swells well. The reef section (the Bowl) needs a solid 3ft+ to start working.',
      tide: 'Best on incoming mid tide. The Bowl works best at low to mid tide. Can get fat and sluggish at high tide.',
      hazards: 'Sharp reef and rocks throughout. Sea urchins. Rips form along the reef edges. Localised — be respectful.',
      season: 'Autumn and winter for more consistent swell. Spring can be good with lighter winds.',
      local_tip: 'The Bowl section is a heavy, hollow wave — know your limits. Booties recommended for the reef walk. Locals are protective of this spot.',
      sources: [
        { name: 'Surf-Forecast.com', url: 'https://www.surf-forecast.com/breaks/Jan-Juc' },
        { name: 'WannaSurf', url: 'https://www.wannasurf.com/spot/Australia_Pacific/Australia/Victoria/Torquay/jan_juc/' },
      ],
    },
    'bells': {
      swell: 'Needs solid south-west to south swell, ideally 4–8ft. Long-period groundswells from the Southern Ocean produce the classic Bells walls.',
      tide: 'Best from mid to high tide. At low tide the reef is too shallow and the wave sections. High tide fills in the bowl nicely.',
      hazards: 'Powerful reef break with heavy wipeouts. Steep cliff access. Strong currents and rips. Not suitable for inexperienced surfers.',
      season: 'March through September (autumn–winter) for the best and biggest swells. The Rip Curl Pro is held at Easter.',
      local_tip: 'NW is the magic wind here — NNW also works. True northerly winds can create a "devil wind" effect where turbulence off the cliffs makes conditions bumpy despite being technically offshore. Rincon section inside Bells is more sheltered.',
      sources: [
        { name: 'Surf-Forecast.com', url: 'https://www.surf-forecast.com/breaks/Bells-Beach' },
        { name: 'Surfline', url: 'https://www.surfline.com/surf-report/bells-beach/584204204e65fad6a77097c5' },
        { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Bells_Beach,_Victoria' },
      ],
    },
    'point-addis': {
      swell: 'Needs a solid south-west to south swell. Being a point/reef break, it handles bigger swells well and the wave wraps around the headland.',
      tide: 'Works on most tides but best at mid to high tide. Low tide can be shallow and risky over the reef.',
      hazards: 'Remote location — long walk down steep cliffs. No mobile reception in spots. Rocks and reef. Strong currents. Sharks have been sighted.',
      season: 'Autumn and winter for consistent swell. Can fire in spring with the right conditions.',
      local_tip: 'Part of the Point Addis Marine National Park. The walk in is 15–20 minutes. Check conditions before committing. A great alternative when Bells is too crowded.',
      sources: [
        { name: 'Surf-Forecast.com', url: 'https://www.surf-forecast.com/breaks/Addis' },
        { name: 'BeachSafe', url: 'https://beachsafe.org.au/beach/vic/surf-coast/anglesea/point-addis' },
      ],
    },
    'anglesea': {
      swell: 'Picks up south and south-west swell but the headlands provide some protection, keeping waves smaller than more exposed beaches.',
      tide: 'Best at low to mid tide. The river mouth creates sandbars that shift seasonally.',
      hazards: 'Rips near the river mouth. Occasional bluebottles in summer. Generally one of the safer surf beaches in the area.',
      season: 'Year-round. A great spot when bigger swells make other beaches too powerful.',
      local_tip: 'The Anglesea River mouth creates interesting sandbanks that can produce fun waves. Watch for the changing banks after rain.',
      sources: [
        { name: 'Surf-Forecast.com', url: 'https://www.surf-forecast.com/breaks/Anglesea' },
        { name: 'BeachSafe', url: 'https://beachsafe.org.au/beach/vic/surf-coast/anglesea/main-beach' },
      ],
    },
    'roadknight': {
      swell: 'Heavily sheltered from prevailing south-west swell. Needs a strong easterly or north-east swell, or a huge south swell to wrap in.',
      tide: 'Works on all tides. Higher tides bring calmer conditions for swimming.',
      hazards: 'Very safe for families. Rocky platforms at the edges. Gentle shore break.',
      season: 'Summer is best for families (patrolled). Rarely produces surfable waves — it\'s a swimming and paddling spot.',
      local_tip: 'The perfect hideaway when everywhere else is blown out or too big. Calm, warm, and great for kids. Rock pools on the western headland are fun to explore at low tide.',
      sources: [
        { name: 'BeachSafe', url: 'https://beachsafe.org.au/beach/vic/surf-coast/anglesea/point-roadknight' },
        { name: 'Surf-Forecast.com', url: 'https://www.surf-forecast.com/breaks/Point-Roadknight' },
      ],
    },
    'fairhaven': {
      swell: 'Very consistent — picks up all south and south-west swells. Multiple peaks along the long beach mean you can usually find a wave.',
      tide: 'Works on all tides. Low tide can produce hollow, punchy beach break waves.',
      hazards: 'Strong rips, especially on bigger days. The beach is long and can be isolated. Bluebottles in summer easterly winds.',
      season: 'Year-round. Less crowded than Torquay area even in summer.',
      local_tip: 'Walk south along the beach from the car park to find your own peak. The surf is often similar quality to Torquay but with a fraction of the crowd.',
      sources: [
        { name: 'Surf-Forecast.com', url: 'https://www.surf-forecast.com/breaks/Fairhaven' },
        { name: 'Surfline', url: 'https://www.surfline.com/surf-report/fairhaven/584204204e65fad6a77097dd' },
      ],
    },
    'lorne': {
      swell: 'Sheltered by the Otway headlands. Needs a large south or south-east swell to wrap into the bay. Smaller and mellower than beaches further east.',
      tide: 'Best at low to mid tide for surfing. The point on the southern end can produce fun right-handers.',
      hazards: 'Generally safe. Rips near the pier and point. Can get some current from the Erskine River.',
      season: 'Winter and autumn for the biggest swells to wrap in. A great summer destination for families.',
      local_tip: 'When everywhere east is maxing out, Lorne is often 2–3ft smaller and clean. The point at the south end of the beach can have fun rights on a solid south swell.',
      sources: [
        { name: 'Surf-Forecast.com', url: 'https://www.surf-forecast.com/breaks/Lorne' },
        { name: 'BeachSafe', url: 'https://beachsafe.org.au/beach/vic/surf-coast/lorne/main-beach' },
      ],
    },
    'thirteenth': {
      swell: 'Well exposed to south and south-west swells. The Beacon break at the eastern end is the most popular section.',
      tide: 'Best at low to mid tide. Sandbars shift regularly creating different peaks.',
      hazards: 'Strong rips, especially near the rocks at Beacon. Long walk from the car park. Isolated — limited mobile reception in places.',
      season: 'Year-round. Great in north-east winds when Bells and Jan Juc are blown out — this is the go-to alternative.',
      local_tip: 'When the wind swings NE and ruins Bells, head to 13th Beach — it\'ll be offshore and often uncrowded. The walk from the car park is 10–15 minutes. Multiple peaks along the 6km stretch.',
      sources: [
        { name: 'Surf-Forecast.com', url: 'https://www.surf-forecast.com/breaks/Thirteenth-Beach' },
        { name: 'Swellnet', url: 'https://www.swellnet.com/surfing/australia/victoria/barwon-heads' },
      ],
    },
  };

  // ── Local Eats ────────────────────────────────────────────────
  // Each beach has an array of eat options — one is picked at random
  const LOCAL_EATS = {
    'torquay-front': [
      { name: 'Torquay Bakery', emoji: '🥖', desc: 'Sausage rolls are elite' },
      { name: 'Freshwater Creek', emoji: '🥧', desc: 'Shepherd\'s pie on the way home — unreal' },
    ],
    'torquay-surf': [
      { name: 'Torquay Bakery', emoji: '🥖', desc: 'Sausage rolls before or after your surf' },
      { name: 'Freshwater Creek', emoji: '🍰', desc: 'Grab a yo-yo or passionfruit sponge on the way' },
    ],
    'jan-juc': [
      { name: 'Swell', emoji: '☕', desc: 'Great coffee right in Jan Juc' },
      { name: 'Freshwater Creek', emoji: '🥧', desc: 'Shepherd\'s pie from Freshwater Creek is a must' },
    ],
    'bells': [
      { name: 'Swell', emoji: '☕', desc: 'Pop into Jan Juc for a coffee on the way' },
      { name: 'Freshwater Creek', emoji: '🍰', desc: 'Yo-yo\'s and passionfruit sponge from Freshwater Creek' },
    ],
    'point-addis': [
      { name: 'Anglesea Bakery', emoji: '🥖', desc: 'Best sandwiches on the coast' },
    ],
    'anglesea': [
      { name: 'Anglesea Bakery', emoji: '🥖', desc: 'A sandwich from the bakery is a must' },
    ],
    'roadknight': [
      { name: 'Anglesea Canoli Shop', emoji: '🍩', desc: 'Treat yourself to a canoli' },
    ],
    'fairhaven': [
      { name: 'Anglesea Bakery', emoji: '🥖', desc: 'Worth the drive back for a sandwich' },
    ],
    'lorne': [
      { name: 'Fish & chips on the foreshore', emoji: '🐟', desc: 'Classic seaside fish & chips' },
    ],
    'thirteenth': [
      { name: 'Fried chicken from Anglesea', emoji: '🍗', desc: 'Hit the fried chicken on the way home' },
      { name: 'Freshwater Creek', emoji: '🥧', desc: 'Shepherd\'s pie from Freshwater Creek — worth the detour' },
    ],
  };

  // ── Surf Movies ───────────────────────────────────────────────
  const SURF_MOVIES = [
    { title: 'The Endless Summer', year: 1966, desc: 'The OG surf film — two surfers chase summer around the world', stream: 'DocPlay / Apple TV' },
    { title: 'Point Break', year: 1991, desc: 'Keanu, Swayze, and the most iconic surf heist ever', stream: 'SBS On Demand (free)' },
    { title: 'Morning of the Earth', year: 1972, desc: 'Aussie surf classic — pure soul surfing at its best', stream: 'Apple TV (rent)' },
    { title: 'Riding Giants', year: 2004, desc: 'The history of big wave surfing, beautifully told', stream: 'Apple TV / Prime Video' },
    { title: 'Big Wednesday', year: 1978, desc: 'Coming-of-age drama set against the California surf scene', stream: 'Apple TV (rent)' },
    { title: 'Blue Crush', year: 2002, desc: 'Female surfer takes on Pipeline — surprisingly solid', stream: 'Apple TV / Amazon' },
    { title: 'Step Into Liquid', year: 2003, desc: 'Global surf documentary exploring every kind of wave', stream: 'Apple TV (rent)' },
    { title: 'Bra Boys', year: 2007, desc: 'Gritty Aussie doco about the Maroubra surf crew', stream: 'Stan / Netflix / DocPlay' },
    { title: 'Storm Surfers 3D', year: 2012, desc: 'Aussie big wave legends tackle the heaviest waves down under', stream: 'Foxtel / Beamafilm' },
    { title: 'North Shore', year: 1987, desc: 'Classic 80s surf movie — cheesy, fun, and totally quotable', stream: 'Apple TV (rent)' },
    { title: 'Gidget', year: 1959, desc: 'The one that kicked off surf culture — total classic vibes', stream: 'Apple TV (rent)' },
    { title: 'Soul Surfer', year: 2011, desc: 'Bethany Hamilton loses her arm to a shark and paddles back out', stream: 'Apple TV / Fetch TV' },
    { title: 'Chasing Mavericks', year: 2012, desc: 'Young Jay Moriarity chases the gnarliest cold-water wave', stream: 'Apple TV / Prime Video' },
    { title: 'Puberty Blues', year: 1981, desc: 'Two Aussie girls fight their way into the Cronulla surf tribe', stream: 'SBS On Demand (free)' },
    { title: 'Bustin\' Down the Door', year: 2008, desc: 'Aussie and SA surfers storm Hawaii in the 70s — game changers', stream: 'DocPlay / Foxtel' },
    { title: 'Momentum Generation', year: 2018, desc: 'Kelly Slater\'s North Shore crew — rivalry and epic 90s barrels', stream: 'Apple TV / Amazon' },
    { title: 'Facing Monsters', year: 2021, desc: 'West Aussie Kerby Brown chases terrifying slab waves solo', stream: 'DocPlay / Prime Video' },
    { title: 'Breath', year: 2017, desc: 'Two groms in 70s WA get mentored by a wild, mysterious surfer', stream: 'SBS On Demand (free)' },
    { title: 'Drift', year: 2013, desc: 'Aussie brothers build a surf brand from nothing in 1970s WA', stream: 'Tubi (free) / Prime Video' },
    { title: 'View from a Blue Moon', year: 2015, desc: 'John John Florence in the first-ever 4K surf film — pure stoke', stream: 'Apple TV (rent)' },
  ];

  const MOVIE_CATEGORIES = [
    { name: 'The OGs', icon: '🎞️', desc: 'Where it all began', movies: [0, 2, 10, 4] },
    { name: 'Hollywood Gets Wet', icon: '🎬', desc: 'When Tinseltown tried surfing', movies: [1, 5, 9, 11] },
    { name: 'True Blue Aussie', icon: '🇦🇺', desc: 'Our backyard legends', movies: [7, 13, 17, 18] },
    { name: 'Send It', icon: '🌊', desc: 'Big wave madness', movies: [3, 8, 12, 16] },
    { name: 'Pure Stoke', icon: '🤙', desc: 'Just good vibes', movies: [6, 14, 15, 19] },
  ];

  // ── Snorkelling Spots ────────────────────────────────────────
  const SNORKEL_SPOT_GROUPS = ['Torquay & Jan Juc', 'Bells to Anglesea', 'Anglesea & South', 'Aireys Inlet & Lorne'];
  const SNORKEL_SPOTS = [
    { id: 'snork-point-danger', name: 'Point Danger Marine Sanctuary', location: 'Torquay / Jan Juc', lat: -38.3407, lng: 144.3269, desc: 'A 21-hectare sanctuary around a limestone headland with reefs to 7m depth. Home to 96+ species of sea slugs, abundant fish and invertebrates on shallow reef platforms.', driveMinutes: 3, group: 'Torquay & Jan Juc', bestTide: 'Low to Mid', gettingThere: 'Drive to Point Danger car park between Torquay and Jan Juc, walk down to the rock platforms' },
    { id: 'snork-barwon-bluff', name: 'Barwon Bluff Marine Sanctuary', location: 'Barwon Heads', lat: -38.2908, lng: 144.5017, desc: 'Kelp forests, sandstone arches, sponge gardens and shipwreck remains. Great for rays, varied carpetsharks and schools of fish in relatively sheltered waters.', driveMinutes: 20, group: 'Torquay & Jan Juc', bestTide: 'Low to Mid', gettingThere: 'Drive to Barwon Heads, park near the Bluff lookout, walk down to the shore platforms' },
    { id: 'snork-jarosite', name: 'Jarosite Reef (Point Addis MNP)', location: 'Between Bells & Anglesea', lat: -38.3614, lng: 144.2785, desc: 'Within the 4600-hectare marine park — sponge gardens, weedy seadragons, giant cuttlefish and blue devil fish under limestone ledges. Best Dec to May.', driveMinutes: 10, group: 'Bells to Anglesea', bestTide: 'Low to Mid', gettingThere: 'Park at the Point Addis car park, follow the track down to the reef platform' },
    { id: 'snork-addiscot', name: 'Addiscot Beach Rockpools', location: 'Point Addis', lat: -38.3690, lng: 144.2680, desc: 'Secluded beach with beautiful low-tide rock pools filled with coralline algae, urchins, crabs and marine invertebrates. Few visitors, within the marine national park.', driveMinutes: 12, group: 'Bells to Anglesea', bestTide: 'Low', gettingThere: 'Take the Surf Coast Walk from Bells through Ironbark Basin — access at low tide only' },
    { id: 'snork-roadknight', name: 'Point Roadknight', location: 'Anglesea', lat: -38.4105, lng: 144.2070, desc: 'Naturally sheltered bay with calm, shallow waters and rock pools teeming with life. The headland blocks westerly swells — ideal for families and beginner snorkellers.', driveMinutes: 15, group: 'Anglesea & South', bestTide: 'All tides', gettingThere: 'Drive to Point Roadknight in Anglesea, enter from the sheltered bay' },
    { id: 'snork-urquhart', name: 'Soapy Rocks & Urquhart Bluff', location: 'Between Anglesea & Aireys', lat: -38.4350, lng: 144.1650, desc: 'Lesser-known spot with intriguing rock formations and intertidal platforms. Peaceful, uncrowded and photogenic with diverse algae and invertebrate communities.', driveMinutes: 18, group: 'Anglesea & South', bestTide: 'Low to Mid', gettingThere: 'Drive to the pullover between Anglesea and Aireys Inlet, short walk to platforms' },
    { id: 'snork-eagle-rock', name: 'Eagle Rock Marine Sanctuary', location: 'Aireys Inlet', lat: -38.4671, lng: 144.1051, desc: 'Dramatic sanctuary beneath Split Point Lighthouse with volcanic rock stacks, limestone caves, rays, Port Jackson sharks and octopuses. Experienced swimmers only.', driveMinutes: 22, group: 'Aireys Inlet & Lorne', bestTide: 'Low to Mid', gettingThere: 'Park at Split Point Lighthouse in Aireys Inlet, walk down the track to the sanctuary' },
    { id: 'snork-lorne-pier', name: 'Lorne Pier & Shelley Beach', location: 'Lorne', lat: -38.5420, lng: 143.9790, desc: 'Pier pylons attract pot-bellied seahorses, cowfish, thornfish and smooth rays. Nearby Shelley Beach has accessible rock pools in sheltered Loutit Bay.', driveMinutes: 35, group: 'Aireys Inlet & Lorne', bestTide: 'All tides', gettingThere: 'Drive to Lorne, enter from the pier or walk around to Shelley Beach' },
  ];

  // ── Secret / Local Surf Spots ───────────────────────────────────
  const SECRET_SPOT_GROUPS = ['Torquay', 'Jan Juc to Bells Cliffs', 'Bells & Winkipop', 'Point Addis & Beyond', 'Anglesea & South'];
  const SECRET_SPOTS = [
    { id: 'sec-haystacks', name: 'Haystacks (Torquay Point)', location: 'Eastern end of Back Beach', lat: -38.3417, lng: 144.3311, desc: 'Reef and point break beside Rocky Point with lefts and rights over reef. Consistent year-round surf with the iconic limestone Haystacks jutting from the water.', level: 'Intermediate-Advanced', waveType: 'Left & right reef break', group: 'Torquay', bestTide: 'All tides', gettingThere: 'Drive to Back Beach car park, walk east along the rocks past Rocky Point' },
    { id: 'sec-fishos', name: "Fisho's", location: 'Near Torquay boat ramp', lat: -38.3380, lng: 144.3380, desc: 'Point break over uneven reef and sand producing predominantly right-handers on mid to high tide. Can get crowded when on.', level: 'Intermediate', waveType: 'Right-hand point break', group: 'Torquay', bestTide: 'Mid to High', gettingThere: 'Head to the Torquay boat ramp car park, paddle out from the rocks' },
    { id: 'sec-bird-rock', name: 'Bird Rock', location: 'Western end of Jan Juc', lat: -38.3573, lng: 144.3124, desc: 'Short, sucky right-hand reef break producing quick barrels on mid to high tide. Historically one of the most localised waves in Victoria.', level: 'Advanced', waveType: 'Right-hand reef break', group: 'Jan Juc to Bells Cliffs', bestTide: 'Mid to High', gettingThere: 'Walk west from Jan Juc beach along the cliff path, scramble down at the marker' },
    { id: 'sec-sparrows', name: 'Sparrows (Sparras)', location: 'Between Bird Rock & Steps', lat: -38.3562, lng: 144.2986, desc: 'Right-hand reef/point break working in NW offshores, surfable at all tides. One of several cliff-base breaks in the Jan Juc to Bells sequence.', level: 'Intermediate-Advanced', waveType: 'Right-hand point break', group: 'Jan Juc to Bells Cliffs', bestTide: 'All tides', gettingThere: 'Take the Surf Coast Walk west from Jan Juc, look for the access track past Bird Rock' },
    { id: 'sec-steps', name: 'Steps', location: 'Below Ocean Boulevard cliffs', lat: -38.3661, lng: 144.3009, desc: 'Right-hand reef break over limestone reef and gullies below 30-40m limestone bluffs. A popular access point for the string of cliff-base breaks.', level: 'Intermediate-Advanced', waveType: 'Right-hand reef break', group: 'Jan Juc to Bells Cliffs', bestTide: 'Mid to High', gettingThere: 'Drive to Ocean Boulevard, park at the cliff lookout, take the steep steps down' },
    { id: 'sec-boobs', name: 'Boobs', location: 'Cliffs between Jan Juc & Winki', lat: -38.3692, lng: 144.2977, desc: 'Reef break offering lefts and rights, named after local landowner Bobby Johnson who caught the first wave here in the early 1960s. Best at high tide with SW swell.', level: 'Intermediate-Advanced', waveType: 'Left & right reef break', group: 'Jan Juc to Bells Cliffs', bestTide: 'High', gettingThere: 'Continue past Steps on the cliff path toward Bells, access via rock scramble' },
    { id: 'sec-winkipop', name: 'Winkipop', location: 'East of Bells Beach', lat: -38.3686, lng: 144.2863, desc: 'World-class right-hand reef/point break producing 200m rides with fast, hollow walls over shallow reef. Often works under more diverse conditions than neighbouring Bells.', level: 'Advanced', waveType: 'Right-hand reef break', group: 'Bells & Winkipop', bestTide: 'Mid to High', gettingThere: 'Park at Bells Beach car park, walk east along the cliff top to the second set of stairs' },
    { id: 'sec-bells-bowl', name: 'Bells Bowl', location: 'Main break at Bells Beach', lat: -38.3707, lng: 144.2827, desc: 'The crown jewel — a huge open-face right breaking over rock platform. On big days the Bowl connects through multiple sections all the way to the beach.', level: 'Advanced', waveType: 'Right-hand reef break', group: 'Bells & Winkipop', bestTide: 'All tides', gettingThere: 'Park at Bells Beach car park, take the main staircase down' },
    { id: 'sec-rincon', name: 'Rincon', location: 'Outer Bells reef', lat: -38.3723, lng: 144.2823, desc: 'The outermost takeoff zone at Bells that catches raw SW groundswell first. On huge days a wave can be ridden from Rincon all the way through to Winkipop.', level: 'Advanced', waveType: 'Right-hand reef break', group: 'Bells & Winkipop', bestTide: 'Mid to High', gettingThere: 'Same access as Bells Bowl — paddle further out past the main takeoff zone' },
    { id: 'sec-centreside', name: 'Centreside', location: 'West of Bells Bowl', lat: -38.3741, lng: 144.2801, desc: 'A section of the Bells reef producing excellent right-handers that connect with the main wave on bigger swells. Usually less crowded than the Bowl.', level: 'Advanced', waveType: 'Right-hand reef break', group: 'Bells & Winkipop', bestTide: 'Mid to High', gettingThere: 'Walk west past the Bowl along the cliff track, scramble down' },
    { id: 'sec-southside', name: 'Southside', location: 'Western side of Bells headland', lat: -38.3743, lng: 144.2789, desc: 'One of the few left-handers in the predominantly right-breaking Bells area. Picks up south-southeast swells and works best at high tide with NNW winds.', level: 'Advanced', waveType: 'Left-hand reef break', group: 'Bells & Winkipop', bestTide: 'High', gettingThere: 'Continue west past Centreside to the western side of the Bells headland' },
    { id: 'sec-point-addis', name: 'Point Addis', location: 'Point Addis headland', lat: -38.4000, lng: 144.2627, desc: 'Slow-breaking right about 300m off the point producing long 100m+ rides. Less crowded than Bells, rewards with fun carving walls ideal for longboarding.', level: 'Intermediate-Advanced', waveType: 'Right-hand reef break', group: 'Point Addis & Beyond', bestTide: 'Mid to High', gettingThere: 'Drive to Point Addis car park off the Great Ocean Road, walk down the long track' },
    { id: 'sec-jarosites', name: 'Jarosites', location: 'Between Southside & Addiscot', lat: -38.3780, lng: 144.2760, desc: 'Lesser-known reef break tucked between Southside and Addiscot along the cliff-lined coast. Rarely crowded due to difficult access.', level: 'Advanced', waveType: 'Reef break', group: 'Point Addis & Beyond', bestTide: 'Mid to High', gettingThere: 'Accessed via the cliffs between Southside and Addiscot on the Surf Coast Walk' },
    { id: 'sec-addiscot', name: 'Addiscot', location: 'Between Bells & Anglesea', lat: -38.3850, lng: 144.2700, desc: 'Secluded reef break accessed via the Surf Coast Walk through Ironbark Basin forest. Remote and uncrowded, picks up solid SW swell.', level: 'Advanced', waveType: 'Reef break', group: 'Point Addis & Beyond', bestTide: 'Low to Mid', gettingThere: 'Take the Surf Coast Walk from Bells, head through Ironbark Basin' },
    { id: 'sec-roadknight-reef', name: 'Point Roadknight', location: 'South end of Anglesea', lat: -38.4316, lng: 144.1828, desc: 'Sheltered point break producing smaller, manageable waves in the protected bay. Works with SSE swells and WSW winds. Popular with longboarders.', level: 'Intermediate', waveType: 'Right-hand point break', group: 'Anglesea & South', bestTide: 'Mid to High', gettingThere: 'Drive to Point Roadknight car park in Anglesea, paddle out from the south end' },
    { id: 'sec-guvvos', name: 'Guvvos', location: 'Between Roadknight & Urquhart Bluff', lat: -38.4335, lng: 144.1570, desc: 'A well-known local reef break south of Anglesea producing quality right-handers over a shallow rock shelf. Works best with a solid SW swell and NW winds. Localised but rewarding.', level: 'Intermediate-Advanced', waveType: 'Right-hand reef break', group: 'Anglesea & South', bestTide: 'Mid to High', gettingThere: 'Drive past Point Roadknight towards Urquhart Bluff, look for the pull-off between the two headlands' },
    { id: 'sec-rivermouth', name: 'Anglesea Rivermouth', location: 'Southern Anglesea main beach', lat: -38.4200, lng: 144.1860, desc: 'Inconsistent reef break at the river mouth producing a nice left when conditions align. Requires solid SSE groundswell and NW offshores.', level: 'Intermediate-Advanced', waveType: 'Left-hand reef break', group: 'Anglesea & South', bestTide: 'Mid to High', gettingThere: 'Park at Anglesea main beach, walk south to the river mouth' },
    { id: 'sec-urquhart', name: 'Urquhart Bluff', location: 'Between Anglesea & Aireys Inlet', lat: -38.4360, lng: 144.1320, desc: 'Reef-influenced break below eroding limestone bluffs with steep medium-sized waves. The territory of experienced locals.', level: 'Intermediate-Advanced', waveType: 'Reef-influenced beach break', group: 'Anglesea & South', bestTide: 'All tides', gettingThere: 'Drive to the Urquhart Bluff car park between Anglesea and Aireys Inlet' },
    { id: 'sec-sunnymead', name: 'Sunnymead', location: 'Between Urquhart & Aireys Inlet', lat: -38.4450, lng: 144.1150, desc: 'Secluded stretch of sand flanked by rugged cliffs. Accessed through coastal bushland on the Surf Coast Walk — remote and uncrowded.', level: 'Intermediate', waveType: 'Beach break', group: 'Anglesea & South', bestTide: 'All tides', gettingThere: 'Access via the Surf Coast Walk between Urquhart Bluff and Aireys Inlet' },
  ];

  // ── State ──────────────────────────────────────────────────────
  let state = {
    mode: 'surfer',
    fc: null,
    now: [],
    today: [],
    days: [],
    map: null,
    markers: [],
  };

  // ── Sound & Haptic feedback ────────────────────────────────────
  let _audioCtx = null;
  function getAudioCtx() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!_audioCtx && Ctx) _audioCtx = new Ctx();
    if (_audioCtx && _audioCtx.state === 'suspended') _audioCtx.resume();
    return _audioCtx;
  }

  function haptic(pattern) {
    try { navigator.vibrate(pattern || 10); } catch(e) {}
  }

  function playClick() {
    try {
      const ctx = getAudioCtx(); if (!ctx) return;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = 660; o.type = 'sine';
      g.gain.setValueAtTime(0.08, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      o.start(); o.stop(ctx.currentTime + 0.08);
    } catch(e) {}
  }

  function playModeSwitch(toSurfer) {
    try {
      const ctx = getAudioCtx(); if (!ctx) return;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = 'sine';
      if (toSurfer) {
        // Deep power-up sweep
        o.frequency.setValueAtTime(300, ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.15);
        o.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.3);
      } else {
        // Bright chime up
        o.frequency.setValueAtTime(500, ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.2);
      }
      g.gain.setValueAtTime(0.1, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      o.start(); o.stop(ctx.currentTime + 0.35);
    } catch(e) {}
  }

  function playWaveSound() {
    try {
      const ctx = getAudioCtx(); if (!ctx) return;
      const dur = 2.0;
      const sz = Math.floor(ctx.sampleRate * dur);
      const buf = ctx.createBuffer(1, sz, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < sz; i++) {
        const t = i / sz;
        d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * t) * 0.5;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.setValueAtTime(120, ctx.currentTime);
      f.frequency.linearRampToValueAtTime(450, ctx.currentTime + dur * 0.3);
      f.frequency.linearRampToValueAtTime(80, ctx.currentTime + dur);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.4);
      g.gain.linearRampToValueAtTime(0, ctx.currentTime + dur);
      src.connect(f); f.connect(g); g.connect(ctx.destination);
      src.start();
    } catch(e) {}
  }

  // ── Utility helpers ────────────────────────────────────────────
  function angleDiff(a, b) { return E.angleDiff(a, b); }
  function degToCompass(deg) { return E.compass(deg); }

  function windArrow(deg) {
    // Arrow points where the wind is GOING (from-direction + 180)
    const rotation = (deg + 180) % 360;
    return `<span class="wind-arrow" style="transform:rotate(${rotation}deg)" aria-hidden="true">↑</span>`;
  }

  function weatherIcon(code) {
    if (code <= 1) return '☀️';
    if (code <= 3) return '⛅';
    if (code <= 48) return '🌫️';
    if (code <= 67) return '🌧️';
    if (code <= 77) return '🌨️';
    if (code <= 82) return '🌦️';
    if (code <= 99) return '⛈️';
    return '☀️';
  }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function randomPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function getEat(beachId) {
    const list = LOCAL_EATS[beachId];
    return list ? randomPick(list) : null;
  }
  function getRandomMovie() { return randomPick(SURF_MOVIES); }

  // Ring colour for a rating band (Flat/Poor → red, Poor-Fair/Fair → yellow, Good+ → green)
  function bandColor(band) { return band >= 4 ? 'green' : band >= 2 ? 'yellow' : 'red'; }
  const fmt = E.fmtTime;

  // ── Tide helpers (snorkel / secret-spot badges) ────────────────
  function tideBucket(state) { return state.fraction < 0.35 ? 'Low' : state.fraction > 0.65 ? 'High' : 'Mid'; }

  function matchesTide(bestTide, bucket) {
    if (!bestTide || bestTide === 'All tides') return true;
    return bestTide.toLowerCase().includes(bucket.toLowerCase());
  }

  function nextGoodTide(bestTide) {
    const now = Date.now();
    for (let t = now + E.SLOT; t <= now + 12 * 3600000; t += E.SLOT) {
      if (matchesTide(bestTide, tideBucket(Tides.at(t)))) return t;
    }
    return null;
  }

  function tideBadgeHtml(bestTide) {
    const tide = Tides.at(Date.now());
    const now = Tides.describe(tide);
    if (!bestTide || bestTide === 'All tides') return `<span class="tide-badge tide-good">All tides · ${now} now</span>`;
    if (matchesTide(bestTide, tideBucket(tide))) return `<span class="tide-badge tide-good">✓ ${now}: suits this spot</span>`;
    const t = nextGoodTide(bestTide);
    return `<span class="tide-badge tide-wait">Best ${bestTide.toLowerCase()} tide${t ? ` · from ~${fmt(t)}` : ''}</span>`;
  }

  // ── Rating explainer modals ────────────────────────────────────
  function renderScoringModal() {
    const modal = document.getElementById('scoring-modal');
    if (!modal) return;
    modal.querySelector('.modal-header h2').textContent = 'How the rating works';
    modal.querySelector('.modal-body').innerHTML = `
      <p>Each spot gets a rating on the scale surfers already use, plus a score out of 10:</p>
      <div class="band-scale">
        ${E.BANDS.map(b => `<span class="band-chip band-${b.key}">${b.label}</span>`).join('')}
      </div>
      <p>The rating multiplies five factors, so <strong>the weakest one caps the result</strong>. Good swell can't make up for an onshore wind, and perfect wind can't make up for no swell.</p>
      <ul class="method-list">
        <li><strong>Size</strong>: estimated wave face at the break vs the size where that spot works best.</li>
        <li><strong>Wind</strong>: speed and gusts by angle to that spot's offshore direction, allowing for headland shelter.</li>
        <li><strong>Tide</strong>: where we are between this tide's low and high, against the spot's preferred tide.</li>
        <li><strong>Swell quality</strong>: groundswell (13 s+) beats short wind swell.</li>
        <li><strong>Suitability</strong>: in Family and Logger modes, how well the spot suits kids or longboards.</li>
      </ul>
      <p>The line under each rating names whatever is holding the spot back and when that changes. Times are calculated every 15 minutes.</p>
      <p style="font-size:0.85rem;opacity:0.75">Tap <strong>Method & sources</strong> for the full detail.</p>`;
  }

  function renderScoringGuide() {
    const modal = document.getElementById('scoring-modal');
    modal.querySelector('.modal-header h2').textContent = 'Method & sources';
    const tideMeta = Tides.meta;
    const obs = state.fc && state.fc.obs;
    modal.querySelector('.modal-body').innerHTML = `
      <h3>Surf size</h3>
      <p>Offshore swell comes from Météo-France's MFWAM wave model (~8 km grid), split into primary swell, secondary swell and wind-sea. Each part becomes a face height at the break:</p>
      <p class="method-formula">face = height × period gain × spot transfer</p>
      <p>Long-period swell gains more height as it shoals. The <em>spot transfer</em> is how much swell from that direction actually reaches the break. Bells takes nearly all of a SW swell, while Roadknight, tucked behind its point, gets about 6%. The parts combine by energy. Sizes are shown as a face-height range in metres, plus a body reference (waist, head high, overhead).</p>

      <h3>Wind</h3>
      <p>ECMWF IFS (9 km), sampled separately for Torquay, Bells, Anglesea, Aireys, Lorne and Barwon Heads. Over a test week it matched the Aireys Inlet station to within about 3.5 km/h and 21°. ${obs ? `For the next couple of hours it is nudged toward the latest <strong>BOM Aireys Inlet</strong> observation (${obs.latest.dirText} ${obs.latest.spd} km/h at ${fmt(obs.latest.t)}).` : 'Live BOM observations switch on once the observations Worker is deployed.'} Each spot has its own offshore direction and shelter sectors, checked against the real coastline.</p>

      <h3>Tide</h3>
      <p>Official BOM predictions for <strong>Point Lonsdale</strong>, the nearest open-coast port, with the curve interpolated between each high and low. ${tideMeta ? `Loaded through ${E.fmtDay(Tides.validUntil)} ${new Date(Tides.validUntil).getFullYear()}.` : ''} Tide stage is measured within each tide's own range, so a small neap high still reads as "high".</p>

      <h3>Rating</h3>
      <p>size × wind × tide × swell quality × suitability. Each factor runs 0–1; the product maps to Flat → Epic. Windows are runs of 15-minute slots rated Fair or better. Each one shows its best stretch and what ends it.</p>

      <h3>Confidence</h3>
      <p>Wind timing is the least certain input. Sea breezes can arrive an hour either side of the forecast, so treat window edges as ±30–60 min. Beyond two days, use the forecast to plan rather than to pick a time.</p>

      <h3>Sources</h3>
      <p>Open-Meteo (MFWAM, ECMWF WAM, ECMWF IFS) · Bureau of Meteorology tide predictions and observations · coastline geometry from OpenStreetMap.</p>`;
  }

  window.openScoringModal = function () {
    renderScoringModal();
    document.getElementById('scoring-modal').classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  window.openScoringGuide = function () {
    renderScoringGuide();
    document.getElementById('scoring-modal').classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  window.closeScoringModal = function () {
    document.getElementById('scoring-modal').classList.remove('open');
    document.body.style.overflow = '';
  };

  // ── Map ────────────────────────────────────────────────────────
  function initMap() {
    const map = L.map('map', { zoomControl: false, attributionControl: false }).setView([-38.40, 144.22], 11);
    L.control.zoom({ position: 'topright' }).addTo(map);
    L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 16,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    }).addTo(map);
    state.map = map;
    return map;
  }

  function updateMapMarkers(ranked) {
    state.markers.forEach(m => m.remove());
    state.markers = [];
    for (const x of ranked) {
      const color = { green: '#22c55e', yellow: '#eab308', red: '#ef4444' }[bandColor(x.r.band)];
      const marker = L.circleMarker([x.spot.lat, x.spot.lng], {
        radius: 14, fillColor: color, fillOpacity: 0.9, color: '#fff', weight: 3, className: 'map-marker',
      }).addTo(state.map);
      marker.bindTooltip(`${x.spot.name}: ${x.r.label} ${x.r.score.toFixed(1)}`, { direction: 'top', offset: [0, -14] });
      marker.on('click', () => openBeachModal(x.spot.id));
      state.markers.push(marker);
    }
  }

  // ── Building blocks ────────────────────────────────────────────
  function windChip(c) {
    const w = c.wind;
    const cls = { glassy: 'wind-offshore', offshore: 'wind-offshore', 'cross-offshore': 'wind-cross-off', 'cross-shore': 'wind-cross', 'cross-onshore': 'wind-onshore', onshore: 'wind-onshore' }[w.kind];
    return `<span class="wind-qual ${cls}">${E.WIND_WORDS[w.kind]}</span>`;
  }

  function surfLine(c) {
    return `${E.faceLabel(c.surf.face)} · ${E.faceRange(c.surf.face)}`;
  }

  function swellText(c) {
    const parts = c.surf.parts.filter(p => p.h >= 0.15).sort((a, b) => b.face - a.face).slice(0, 2);
    if (!parts.length) return 'No meaningful swell';
    return parts.map(p => `${p.h.toFixed(1)} m @ ${Math.round(p.p)} s ${degToCompass(p.d)}${p.kind === 'windsea' ? ' (wind-sea)' : ''}`).join(' + ');
  }

  function tideText(c) {
    const t = c.tide;
    const next = t.next;
    return `${Tides.describe(t)} · ${next.high ? 'high' : 'low'} ${fmt(next.t)} (${next.h.toFixed(1)} m)`;
  }

  function runText(run) {
    if (!run || !run.start) return '';
    const prime = run.prime && (run.prime.start !== run.start || run.prime.end !== run.end)
      ? ` · best ${fmt(run.prime.start)}–${fmt(run.prime.end)} (${E.BANDS[run.prime.band].label})` : '';
    const ends = run.endReason && run.endReason.key !== 'dark' ? `, then ${run.endReason.text}` : '';
    return `<strong>Fair or better ${fmt(run.start)}–${fmt(run.end)}</strong>${prime}${ends}.`;
  }

  // Colour strip of the day's 15-minute slots, with a "now" marker
  function timelineStrip(slots, highlight) {
    if (!slots || slots.length < 2) return '';
    const t0 = slots[0].c.t, t1 = slots[slots.length - 1].c.t + E.SLOT;
    const pct = t => ((t - t0) / (t1 - t0) * 100).toFixed(2);
    const cells = slots.map(s => `<span class="tl-cell band-${s.r.bandKey}" title="${fmt(s.c.t)} · ${s.r.label}"></span>`).join('');
    const ticks = [];
    for (let h = Math.ceil(t0 / 10800000) * 10800000; h < t1; h += 10800000) ticks.push(`<span class="tl-tick" style="left:${pct(h)}%">${fmt(h)}</span>`);
    const now = Date.now();
    const nowMark = now >= t0 && now <= t1 ? `<span class="tl-now" style="left:${pct(now)}%"></span>` : '';
    const hl = highlight && highlight.start ? `<span class="tl-window" style="left:${pct(highlight.start)}%;width:${(pct(highlight.end) - pct(highlight.start)).toFixed(2)}%"></span>` : '';
    return `<div class="timeline"><div class="tl-bar">${cells}${hl}${nowMark}</div><div class="tl-ticks">${ticks.join('')}</div></div>`;
  }

  // ── Result card ────────────────────────────────────────────────
  // item: { spot, c, r, advice, run, slots, dayLabel, timeLabel, rank }
  function renderResultCard(item, opts = {}) {
    const { spot, c, r } = item;
    const col = bandColor(r.band);
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}&origin=-38.352,144.296`;
    const eat = getEat(spot.id);
    const eatHtml = eat ? `<div class="eat-recommendation" style="margin:0 16px 10px"><span class="eat-emoji">${eat.emoji}</span><div><span class="eat-name">${eat.name}</span><span class="eat-desc">${eat.desc}</span></div></div>` : '';
    const rankBadge = item.rank ? `<div class="result-rank">#${item.rank}</div>` : '';
    const dayBadge = item.dayLabel ? `<div class="result-day-label">${item.dayLabel}</div>` : '';
    const when = item.timeLabel ? ` · ${item.timeLabel}` : '';
    const nowcast = c.wind.nowcast ? ' <span class="obs-tag">obs-adjusted</span>' : '';
    const conf = item.confidence && item.confidence !== 'high' ? `<span class="conf-tag conf-${item.confidence}">${item.confidence} confidence</span>` : '';

    return `
      <div class="result-card score-${col}${opts.expanded ? ' expanded' : ''}" onclick="this.classList.toggle('expanded')">
        <div class="result-card-header">
          ${rankBadge}${dayBadge}
          <div class="rec-score-ring ${col}" style="width:48px;height:48px;font-size:1.05rem">${r.score.toFixed(1)}</div>
          <div class="result-info">
            <h4>${spot.name}</h4>
            <span>${r.label}${when}</span>
            <span class="result-header-conditions">${surfLine(c)} · ${windChip(c)} ${Math.round(c.wind.spd)} km/h</span>
          </div>
          <span class="result-chevron">▼</span>
        </div>
        <p class="rating-why">${item.advice}</p>
        <div class="result-card-body">
          ${item.run && item.run.start ? `<div class="good-window" style="margin:0 16px 8px"><div>${runText(item.run)}</div></div>` : ''}
          ${timelineStrip(item.slots, item.run)}
          <div class="cond-grid">
            <div><span class="cond-k">Surf</span><span class="cond-v">${surfLine(c)}</span></div>
            <div><span class="cond-k">Swell</span><span class="cond-v">${swellText(c)}</span></div>
            <div><span class="cond-k">Wind</span><span class="cond-v">${windArrow(c.wind.dir)} ${degToCompass(c.wind.dir)} ${Math.round(c.wind.spd)} km/h, gusts ${Math.round(c.wind.gust)} · ${E.WIND_WORDS[c.wind.kind].toLowerCase()}${c.wind.shelter < 1 ? ' (sheltered)' : ''}${nowcast}</span></div>
            <div><span class="cond-k">Tide</span><span class="cond-v">${tideText(c)}</span></div>
            <div><span class="cond-k">Weather</span><span class="cond-v">${weatherIcon(c.wind.code)} ${Math.round(c.wind.temp)}°C${c.wind.precip > 30 ? ` · ${c.wind.precip}% rain` : ''}</span></div>
          </div>
          <div class="rec-meta-row" style="padding:0 16px 10px">
            <span class="drive-chip">🚗 ${spot.driveMinutes} min from Jan Juc</span>
            <span class="drive-chip">${spot.type}</span>
            ${conf}
          </div>
          ${eatHtml}
          <div class="rec-actions" style="padding:6px 16px 14px">
            <a href="${mapsUrl}" target="_blank" rel="noopener" class="nav-btn" onclick="event.stopPropagation()">📍 Navigate from Jan Juc</a>
            <button class="nav-btn nav-btn-ghost" onclick="event.stopPropagation();openBeachModal('${spot.id}')">Spot details</button>
          </div>
        </div>
      </div>`;
  }

  // Item for "right now"
  function nowItem(x, rank) {
    const run = x.day.nowRun || x.day.window;
    return { spot: x.spot, c: x.c, r: x.r, advice: x.advice, run, slots: x.day.slots, rank, confidence: 'high' };
  }

  // Item for a day's best window (shows conditions at the window's peak)
  function dayItem(d, extra = {}) {
    const w = d.window;
    const timeLabel = w.start ? `${fmt(w.start)}–${fmt(w.end)}` : `best ~${fmt(w.peak.c.t)}`;
    return { spot: d.spot, c: w.peak.c, r: w.peak.r, advice: d.peakAdvice, run: w, slots: d.slots, timeLabel, confidence: d.confidence, ...extra };
  }

  // ── Tide banner ────────────────────────────────────────────────
  function updateTideBanner() {
    const banner = document.getElementById('tide-banner');
    if (!banner) return;
    const now = Date.now();
    const tide = Tides.at(now);
    const ex = Tides.extremesBetween(now, now + 26 * 3600000).slice(0, 4);
    const bucket = tideBucket(tide);
    banner.className = `tide-banner tide-${bucket.toLowerCase()}`;
    banner.style.display = '';
    banner.innerHTML = `
      <div class="tide-banner-main">
        <span class="tide-banner-level">Tide: ${tide.stage}</span>
        <span class="tide-banner-trend">${tide.rising ? '↗ Rising' : '↘ Falling'} · ${tide.h.toFixed(1)} m</span>
      </div>
      <div class="tide-banner-detail">${ex.map(e => `${e.high ? 'High' : 'Low'} ${fmt(e.t)} ${e.h.toFixed(1)} m`).join(' · ')}</div>`;
  }

  function nextFirstLight() {
    const now = Date.now();
    for (const k of E.forecastDays(state.fc, now)) {
      const dl = E.daylight(state.fc, k);
      if (dl && dl.first > now) return dl.first;
    }
    return null;
  }

  // ── Choice cards ───────────────────────────────────────────────
  let activeChoiceType = null;

  function renderChoiceCards() {
    updateTideBanner();
    const cardsDiv = document.getElementById('choice-cards');
    activeChoiceType = null;

    const top = state.now[0];
    const today = state.today[0];
    const nextDay = state.days.find(d => d.list.length);
    const future = nextDay && nextDay.list[0];

    let nowPreview = 'No data';
    if (top) {
      const fl = nextFirstLight();
      nowPreview = top.dark ? `Dark now${fl ? `. First light ${E.fmtDay(fl).toLowerCase()} ${fmt(fl)}` : ''}`
        : `${top.spot.name}: ${top.r.label}, ${E.faceLabel(top.c.surf.face).toLowerCase()}`;
      const run = top.day.nowRun;
      if (!top.dark && run && run.end) nowPreview += ` · until ~${fmt(run.end)}`;
    }
    const todayPreview = today
      ? `${today.spot.name}: ${today.window.peak.r.label} ${today.window.start ? `${fmt(today.window.start)}–${fmt(today.window.end)}` : `~${fmt(today.window.peak.c.t)}`}`
      : 'No more daylight today';
    const forecastPreview = future
      ? `${nextDay.label}: ${future.spot.name}, ${future.window.peak.r.label}`
      : 'No forecast';

    let flatCallout = '';
    if (top && !top.dark && top.r.band <= 1 && (!today || today.window.peak.r.band <= 2)) {
      const m = randomPick(SURF_MOVIES);
      flatCallout = `<div class="flat-day-callout"><div><strong>Not much on today</strong><p>Nowhere gets above ${top.r.label.toLowerCase()} right now. Movie option: <em>${m.title}</em> (${m.year}).</p></div></div>`;
    }

    const scoreBox = (r) => r ? `<div class="choice-score ${bandColor(r.band)}">${r.score.toFixed(1)}</div>` : '';
    cardsDiv.innerHTML = `${flatCallout}
      <div class="choice-card" id="choice-card-now" onclick="selectChoice('now')">
        <div class="choice-card-left"><div>
          <h3 class="choice-title">Right now</h3>
          <p class="choice-preview">${nowPreview}</p>
          ${top && !top.dark ? `<p class="choice-why">${top.advice}</p>` : ''}
        </div></div>
        ${top && !top.dark ? scoreBox(top.r) : ''}
      </div>
      <div class="choice-results-inline" id="choice-inline-now"></div>
      <div class="choice-card" id="choice-card-today" onclick="selectChoice('today')">
        <div class="choice-card-left"><div>
          <h3 class="choice-title">Best of today</h3>
          <p class="choice-preview">${todayPreview}</p>
        </div></div>
        ${today ? scoreBox(today.window.peak.r) : ''}
      </div>
      <div class="choice-results-inline" id="choice-inline-today"></div>
      <div class="choice-card" id="choice-card-forecast" onclick="selectChoice('forecast')">
        <div class="choice-card-left"><div>
          <h3 class="choice-title">Next few days</h3>
          <p class="choice-preview">${forecastPreview}</p>
        </div></div>
        ${future ? scoreBox(future.window.peak.r) : ''}
      </div>
      <div class="choice-results-inline" id="choice-inline-forecast"></div>`;

    if (top && !top.dark && top.r.band >= 4) showBeachCelebration(top);
  }

  // ── Beach celebrations ───────────────────────────────────────
  const CELEBRATIONS = {
    'torquay-front': { title: 'Cosy Corner', subtitle: 'A Harry Classic', emoji: '☀️', bg: 'linear-gradient(135deg, #f59e0b, #f97316, #ef4444)', confetti: ['🏖️', '☀️', '🐚', '🦀', '🌴'] },
    'roadknight': { title: 'A Classic Day Beckons', subtitle: 'Cannoli on the way home', emoji: '🤌', bg: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)', confetti: ['🤌', '🍨', '🌊', '✨', '🎉'] },
    'jan-juc': { title: 'Home Break', subtitle: "Let's Rock", emoji: '🤙', bg: 'linear-gradient(135deg, #22c55e, #06b6d4, #3b82f6)', confetti: ['🤙', '🏄', '🔥', '💪', '🌊'] },
  };

  let celebrationShownForSession = null;

  function showBeachCelebration(x) {
    const c = CELEBRATIONS[x.spot.id];
    if (!c || celebrationShownForSession === x.spot.id) return;
    celebrationShownForSession = x.spot.id;

    let confettiHTML = '';
    for (let i = 0; i < 40; i++) {
      const emoji = c.confetti[i % c.confetti.length];
      confettiHTML += `<span class="celeb-confetti" style="left:${Math.random() * 100}%;animation-delay:${Math.random() * 0.8}s;animation-duration:${1.8 + Math.random() * 1.5}s;font-size:${0.8 + Math.random() * 1.2}rem;--drift:${(Math.random() - 0.5) * 120}px">${emoji}</span>`;
    }
    const overlay = document.createElement('div');
    overlay.className = 'celeb-overlay';
    overlay.onclick = () => dismissCelebration(overlay);
    overlay.innerHTML = `
      <div class="celeb-bg" style="background:${c.bg}"></div>
      <div class="celeb-confetti-wrap">${confettiHTML}</div>
      <div class="celeb-content">
        <div class="celeb-emoji">${c.emoji}</div>
        <h2 class="celeb-title">${c.title}</h2>
        <p class="celeb-subtitle">${c.subtitle}</p>
        <div class="celeb-score"><span class="celeb-score-num">${x.r.score.toFixed(1)}</span><span class="celeb-score-label">${x.r.label}</span></div>
        <p class="celeb-beach">${x.spot.name} is on right now</p>
        <button class="celeb-dismiss" onclick="event.stopPropagation()">🏄 Let's Go!</button>
      </div>`;
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => overlay.classList.add('celeb-active'));
    overlay.querySelector('.celeb-dismiss').onclick = (e) => { e.stopPropagation(); dismissCelebration(overlay); };
    setTimeout(() => dismissCelebration(overlay), 6000);
  }

  function dismissCelebration(overlay) {
    if (!overlay.parentNode) return;
    overlay.classList.add('celeb-leaving');
    setTimeout(() => { overlay.remove(); document.body.style.overflow = ''; }, 500);
  }

  function getInlineResults(type) {
    if (type === 'now') {
      if (state.now[0] && state.now[0].dark) {
        return `<p class="inline-note">It's dark. Here's the pick for first light:</p>` +
          state.today.concat(state.days[0] ? state.days[0].list : []).slice(0, 3).map((d, i) => renderResultCard(dayItem(d, { rank: i + 1 }))).join('');
      }
      return state.now.slice(0, 3).map((x, i) => renderResultCard(nowItem(x, i + 1))).join('');
    }
    if (type === 'today') {
      if (!state.today.length) return `<p class="inline-note">No daylight left today. Check the next few days.</p>`;
      return state.today.slice(0, 3).map((d, i) => renderResultCard(dayItem(d, { rank: i + 1 }))).join('');
    }
    return state.days.slice(0, 3).map(day =>
      day.list.slice(0, 2).map((d, i) => renderResultCard(dayItem(d, { dayLabel: i === 0 ? day.label : '' }))).join('')
    ).join('');
  }

  window.selectChoice = function (type) {
    haptic(15); playClick();
    if (activeChoiceType === type) {
      const container = document.getElementById(`choice-inline-${type}`);
      container.innerHTML = '';
      container.classList.remove('open');
      document.getElementById(`choice-card-${type}`).classList.remove('choice-expanded');
      activeChoiceType = null;
      return;
    }
    if (activeChoiceType) {
      const oldContainer = document.getElementById(`choice-inline-${activeChoiceType}`);
      const oldCard = document.getElementById(`choice-card-${activeChoiceType}`);
      if (oldContainer) { oldContainer.innerHTML = ''; oldContainer.classList.remove('open'); }
      if (oldCard) oldCard.classList.remove('choice-expanded');
    }
    const container = document.getElementById(`choice-inline-${type}`);
    container.innerHTML = getInlineResults(type);
    container.classList.add('open');
    document.getElementById(`choice-card-${type}`).classList.add('choice-expanded');
    activeChoiceType = type;
    requestAnimationFrame(() => container.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
  };

  // ── Beach Detail Modal ─────────────────────────────────────────
  window.openBeachModal = function (beachId) {
    haptic(15); playClick();
    const spot = BEACHES.find(b => b.id === beachId);
    if (!spot) return;
    const now = Date.now();
    const nowX = state.now.find(x => x.spot.id === beachId);
    const days = E.forecastDays(state.fc, now).slice(0, 4).map(k => E.spotDay(state.fc, spot, k, state.mode, now));
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}&origin=-38.352,144.296`;

    const dayBlocks = days.map(d => {
      if (!d.window) return '';
      const label = E.fmtDay(d.window.peak.c.t, now);
      return `<div class="beach-summary-block">
        <h3>${label}</h3>
        ${renderResultCard(dayItem(d), { expanded: true })}
      </div>`;
    }).join('');

    document.getElementById('beach-modal-title').textContent = spot.name;
    document.getElementById('beach-modal-body').innerHTML = `
      <p class="beach-modal-about">${spot.description}</p>
      <div class="beach-modal-tags">
        <span class="beach-tag">${spot.type}</span>
        <span class="beach-tag">${spot.bottom}</span>
        <span class="beach-tag">Faces ${degToCompass(spot.facing)}</span>
        <span class="beach-tag">Offshore: ${degToCompass(spot.offshore)}</span>
        <span class="beach-tag">🚗 ${spot.driveMinutes} min</span>
      </div>
      <div class="spot-know">
        <p><strong>Fires when:</strong> ${spot.firesWhen}</p>
        <p><strong>Tide:</strong> ${spot.tide.note}</p>
        <p><strong>Size:</strong> works ${spot.works[0]}–${spot.works[1]} m faces, best ${spot.ideal[0]}–${spot.ideal[1]} m. Best swell: ${E.swellWindowText(spot).replace(/^(more|a big) /, '')}.</p>
      </div>
      ${nowX && !nowX.dark ? `<div class="beach-summary-block"><h3>Right now</h3>${renderResultCard(nowItem(nowX), { expanded: true })}</div>` : ''}
      ${dayBlocks}
      <a href="${mapsUrl}" target="_blank" rel="noopener" class="nav-btn">📍 Navigate from Jan Juc</a>`;

    document.getElementById('beach-modal').classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  window.closeBeachModal = function () {
    document.getElementById('beach-modal').classList.remove('open');
    document.body.style.overflow = '';
  };

  // ── Mode toggle ────────────────────────────────────────────────
  function applyModeClasses() {
    document.body.classList.toggle('surfer-mode', state.mode === 'surfer' || state.mode === 'logger');
    document.body.classList.toggle('logger-mode', state.mode === 'logger');
    document.querySelectorAll('.mode-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.mode === state.mode);
      b.setAttribute('aria-pressed', b.dataset.mode === state.mode);
    });
  }

  function setupModeToggle() {
    applyModeClasses();
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        if (mode === state.mode) return;
        state.mode = mode;
        try { localStorage.setItem('surf-mode', mode); } catch (e) {}
        applyModeClasses();
        haptic([15, 50, 15]);
        playModeSwitch(mode === 'surfer' || mode === 'logger');
        refreshUI();
      });
    });
  }

  // ── Refresh UI with current data ───────────────────────────────
  function refreshUI() {
    if (!state.fc) return;
    const now = Date.now();
    state.now = E.rankNow(state.fc, state.mode, now);
    const keys = E.forecastDays(state.fc, now);
    state.today = E.rankDay(state.fc, keys[0], state.mode, now);
    state.days = keys.slice(1, 4).map(k => ({ key: k, label: E.fmtDay(Date.parse(k + 'T12:00:00+10:00'), now), list: E.rankDay(state.fc, k, state.mode, now) }));
    renderChoiceCards();
    updateMapMarkers(state.now);
  }

  // ── Extras section (tabbed: Movies / Snorkelling / Go Deeper) ───
  let extrasTab = 'movies';
  let extrasMaps = [];

  function cleanupExtrasMaps() {
    extrasMaps.forEach(m => { try { m.remove(); } catch (e) {} });
    extrasMaps = [];
  }

  function initGroupMap(containerId, spots) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const map = L.map(el, {
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      scrollWheelZoom: false,
    });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 16,
      attribution: '&copy; OSM &copy; CARTO',
    }).addTo(map);

    const bounds = [];
    spots.forEach(s => {
      const marker = L.circleMarker([s.lat, s.lng], {
        radius: 7, fillColor: '#00b4d8', color: '#fff',
        weight: 2, fillOpacity: 0.9,
      }).addTo(map);
      marker.bindTooltip(s.name, { permanent: spots.length <= 4, direction: 'top', offset: [0, -8], className: 'group-map-tooltip' });
      bounds.push([s.lat, s.lng]);
    });
    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 14);
    }
    extrasMaps.push(map);
  }

  function renderGroupedSpots(groupOrder, spots, type) {
    let html = '';
    groupOrder.forEach((groupName, gi) => {
      const groupSpots = spots.filter(s => s.group === groupName);
      if (groupSpots.length === 0) return;
      const mapId = `${type}-map-${gi}`;

      html += `
        <div class="spot-group" data-group="${gi}">
          <button class="spot-group-header" onclick="toggleSpotGroup(this)">
            <div class="spot-group-title">
              <span>${groupName}</span>
              <span class="spot-group-count">${groupSpots.length} spot${groupSpots.length > 1 ? 's' : ''}</span>
            </div>
            <span class="spot-group-chevron">▶</span>
          </button>
          <div class="spot-group-body">
            <div class="spot-group-map" id="${mapId}"></div>${groupName === 'Bells & Winkipop' ? '<a class="spot-group-maplink" href="http://www.guyssurfarimaps.com/shop/bells-beach-torquay-to-point-addis" target="_blank" rel="noopener">🗺️ See detailed surf map by Guy\'s Surfari Maps</a>' : ''}
            <div class="${type === 'snorkel' ? 'snorkel-grid' : 'secret-grid'}">`;

      groupSpots.forEach(s => {
        if (type === 'snorkel') {
          html += `
              <div class="snorkel-card">
                <div class="snorkel-header">
                  <span class="snorkel-icon">🤿</span>
                  <div>
                    <strong>${s.name}</strong>
                    <span class="snorkel-location">${s.location} · ${s.driveMinutes} min drive</span>
                  </div>
                </div>
                ${tideBadgeHtml(s.bestTide)}
                <p>${s.desc}</p>
                <div class="spot-getting-there">
                  <span class="getting-there-icon">🚗</span>
                  <span class="getting-there-text">${s.gettingThere}</span>
                </div>
              </div>`;
        } else {
          const levelClass = s.level === 'Advanced' ? 'level-adv' : s.level === 'Intermediate' ? 'level-int' : 'level-intadv';
          html += `
              <div class="secret-card">
                <div class="secret-header">
                  <strong>${s.name}</strong>
                  <span class="secret-level ${levelClass}">${s.level}</span>
                </div>
                <span class="secret-location">${s.location}</span>
                <span class="secret-wave">${s.waveType}</span>
                ${tideBadgeHtml(s.bestTide)}
                <p>${s.desc}</p>
                <div class="spot-getting-there">
                  <span class="getting-there-icon">🚗</span>
                  <span class="getting-there-text">${s.gettingThere}</span>
                </div>
              </div>`;
        }
      });

      html += `
            </div>
          </div>
        </div>`;
    });
    return html;
  }

  function renderExtras() {
    if (document.getElementById('extras-section')) return;
    const learnSection = document.getElementById('learn-section');
    if (!learnSection) return;

    const section = document.createElement('section');
    section.className = 'section';
    section.id = 'extras-section';
    renderExtrasContent(section);
    learnSection.parentNode.insertBefore(section, learnSection);
  }

  // Point `metres` from [lat, lng] along a compass bearing
  function offsetLatLng(lat, lng, bearing, metres) {
    const r = bearing * Math.PI / 180;
    return [lat + (metres * Math.cos(r)) / 110540, lng + (metres * Math.sin(r)) / (111320 * Math.cos(lat * Math.PI / 180))];
  }

  // Arrow showing wind blowing FROM `fromDeg` toward the break
  function windArrowLayer(spot, fromDeg, color, len) {
    const tail = offsetLatLng(spot.lat, spot.lng, fromDeg, len);
    const tip = offsetLatLng(spot.lat, spot.lng, fromDeg, len * 0.18);
    const toward = (fromDeg + 180) % 360;
    const headL = offsetLatLng(tip[0], tip[1], (toward + 150) % 360, len * 0.22);
    const headR = offsetLatLng(tip[0], tip[1], (toward + 210) % 360, len * 0.22);
    return L.layerGroup([
      L.polyline([tail, tip], { color, weight: 5, opacity: 0.95 }),
      L.polygon([tip, headL, headR], { color, fillColor: color, fillOpacity: 1, weight: 1 }),
    ]);
  }

  // Wedge showing a sector of wind directions (offshore = good, onshore = bad)
  function sectorLayer(spot, centreDeg, halfWidth, color, len) {
    const pts = [[spot.lat, spot.lng]];
    for (let a = -halfWidth; a <= halfWidth; a += 5) pts.push(offsetLatLng(spot.lat, spot.lng, (centreDeg + a + 360) % 360, len));
    return L.polygon(pts, { color, weight: 1, fillColor: color, fillOpacity: 0.18 });
  }

  function initExplainerMap(containerId, spot) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const zoom = spot.mapZoom || 15;
    const map = L.map(el, {
      zoomControl: false, attributionControl: false, dragging: false,
      scrollWheelZoom: false, doubleClickZoom: false, touchZoom: false,
    }).setView([spot.lat, spot.lng], zoom);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 18 }).addTo(map);
    const len = 520 * Math.pow(2, 15 - zoom);
    sectorLayer(spot, spot.offshore, 35, '#22c55e', len).addTo(map);
    sectorLayer(spot, (spot.offshore + 180) % 360, 35, '#ef4444', len).addTo(map);
    windArrowLayer(spot, spot.offshore, '#22c55e', len).addTo(map);
    windArrowLayer(spot, (spot.offshore + 180) % 360, '#ef4444', len).addTo(map);
    const nowX = state.now && state.now.find(x => x.spot.id === spot.id);
    if (nowX) windArrowLayer(spot, nowX.c.wind.dir, '#38bdf8', len * 0.8).addTo(map);
    L.circleMarker([spot.lat, spot.lng], { radius: 6, fillColor: '#fff', color: '#0b1d3a', weight: 2, fillOpacity: 1 }).addTo(map);
    extrasMaps.push(map);
  }

  function renderBeachExplainers() {
    let html = '';
    BEACHES.forEach((b, i) => {
      const intel = BEACH_INTEL[b.id];
      const nowX = state.now && state.now.find(x => x.spot.id === b.id);
      html += `
        <div class="beach-explainer-card">
          <h4>${b.name}</h4>
          <p class="beach-explainer-sub">${b.location} · ${b.type}, ${b.bottom.toLowerCase()} · faces ${degToCompass(b.facing)}</p>
          <div class="beach-explainer-map-wrap">
            <div class="beach-explainer-map" id="explainer-map-${i}"></div>
          </div>
          <div class="beach-explainer-legend">
            <span class="legend-offshore">Green = offshore (good): wind from the ${degToCompass(b.offshore)}</span>
            <span class="legend-onshore">Red = onshore (poor): wind from the ${degToCompass((b.offshore + 180) % 360)}</span>
            ${nowX ? `<span class="legend-now">Blue = wind now: ${degToCompass(nowX.c.wind.dir)} ${Math.round(nowX.c.wind.spd)} km/h, ${E.WIND_WORDS[nowX.c.wind.kind].toLowerCase()} here</span>` : ''}
          </div>
          <p class="beach-explainer-desc">${b.description}</p>
          <p class="beach-explainer-best"><strong>Fires when:</strong> ${b.firesWhen}</p>
          <p class="beach-explainer-best"><strong>Best for:</strong> ${b.bestFor}</p>
          ${intel ? `
          <div class="beach-intel-section">
            <button class="beach-intel-toggle" onclick="toggleBeachIntel(this)">
              <span>Spot intel</span>
              <span class="spot-group-chevron">▶</span>
            </button>
            <div class="beach-intel-body">
              <div class="beach-intel-grid">
                <div class="beach-intel-item"><div><strong>Swell</strong><br>${intel.swell}</div></div>
                <div class="beach-intel-item"><div><strong>Tide</strong><br>${b.tide.note}</div></div>
                <div class="beach-intel-item"><div><strong>Hazards</strong><br>${intel.hazards}</div></div>
                <div class="beach-intel-item"><div><strong>Best season</strong><br>${intel.season}</div></div>
                <div class="beach-intel-item"><div><strong>Local tip</strong><br>${intel.local_tip}</div></div>
              </div>
              <div class="beach-intel-sources">
                <span class="intel-sources-label">Sources:</span>
                ${intel.sources.map(s => `<a href="${s.url}" target="_blank" rel="noopener" class="intel-source-link">${s.name}</a>`).join('')}
              </div>
            </div>
          </div>` : ''}
        </div>`;
    });
    return html;
  }

  function renderMovieCategories() {
    let html = '';
    MOVIE_CATEGORIES.forEach((cat, ci) => {
      const isOpen = ci === 0;
      html += `
        <div class="movie-category">
          <button class="movie-category-header" onclick="toggleMovieCategory(this)">
            <div class="movie-category-title">
              <span>${cat.icon} ${cat.name}</span>
              <span class="movie-category-desc">${cat.desc}</span>
            </div>
            <span class="movie-category-count">${cat.movies.length}</span>
            <span class="spot-group-chevron">${isOpen ? '▼' : '▶'}</span>
          </button>
          <div class="movie-category-body${isOpen ? ' open' : ''}">
            <div class="movie-grid">
              ${cat.movies.map(idx => {
                const m = SURF_MOVIES[idx];
                return `<div class="movie-card">
                  <div class="movie-info">
                    <strong>${m.title}</strong>
                    <span class="movie-year">${m.year}</span>
                    <p>${m.desc}</p>
                    <span class="movie-stream">📺 ${m.stream}</span>
                  </div>
                </div>`;
              }).join('')}
            </div>
          </div>
        </div>`;
    });
    return html;
  }

  function renderExtrasContent(el) {
    cleanupExtrasMaps();
    const section = el || document.getElementById('extras-section');
    if (!section) return;

    const tabs = [
      { id: 'movies', icon: '🎬', label: 'Surf Movies' },
      { id: 'snorkel', icon: '🤿', label: 'Snorkelling' },
      { id: 'deeper', icon: '🗺️', label: 'Go Deeper' },
      { id: 'beaches', icon: '🏖️', label: 'Beach Guide' },
    ];

    let html = `
      <h2 class="section-title">
        <span class="section-icon">🏖️</span> Beyond the Surf
      </h2>
      <div class="extras-tabs">
        ${tabs.map(t => `<button class="extras-tab${extrasTab === t.id ? ' active' : ''}" onclick="switchExtrasTab('${t.id}')"><span>${t.icon}</span> ${t.label}</button>`).join('')}
      </div>
      <div class="extras-body">
    `;

    if (extrasTab === 'movies') {
      html += `<p class="section-subtitle">For flat days, rainy arvo's, or when you just need a surf fix.</p>`;
      html += renderMovieCategories();
    } else if (extrasTab === 'snorkel') {
      html += `<p class="section-subtitle">When the surf's flat or you just want to explore under the surface.</p>`;
      html += renderGroupedSpots(SNORKEL_SPOT_GROUPS, SNORKEL_SPOTS, 'snorkel');
    } else if (extrasTab === 'deeper') {
      html += `<p class="section-subtitle">The local breaks, secret reefs and hidden gems that don't make the tourist maps.</p>`;
      html += renderGroupedSpots(SECRET_SPOT_GROUPS, SECRET_SPOTS, 'deeper');
    } else if (extrasTab === 'beaches') {
      html += `<p class="section-subtitle">How each beach works — wind directions, wave types, and what to expect.</p>`;
      html += renderBeachExplainers();
    }

    html += `</div>`;
    section.innerHTML = html;

    // Init maps after DOM is ready
    if (extrasTab === 'snorkel' || extrasTab === 'deeper') {
      const groups = extrasTab === 'snorkel' ? SNORKEL_SPOT_GROUPS : SECRET_SPOT_GROUPS;
      const spots = extrasTab === 'snorkel' ? SNORKEL_SPOTS : SECRET_SPOTS;
      const prefix = extrasTab === 'snorkel' ? 'snorkel' : 'deeper';
      requestAnimationFrame(() => {
        groups.forEach((groupName, gi) => {
          const groupSpots = spots.filter(s => s.group === groupName);
          if (groupSpots.length > 0) {
            initGroupMap(`${prefix}-map-${gi}`, groupSpots);
          }
        });
      });
    } else if (extrasTab === 'beaches') {
      requestAnimationFrame(() => {
        BEACHES.forEach((b, i) => {
          initExplainerMap(`explainer-map-${i}`, b);
        });
      });
    }
  }

  window.switchExtrasTab = function (tab) {
    cleanupExtrasMaps();
    extrasTab = tab;
    renderExtrasContent();
    haptic(10);
    playClick();
  };

  window.toggleSpotGroup = function (headerEl) {
    const body = headerEl.nextElementSibling;
    const chevron = headerEl.querySelector('.spot-group-chevron');
    const isOpen = body.classList.toggle('open');
    chevron.textContent = isOpen ? '▼' : '▶';
    if (isOpen) {
      // Fix map tiles for maps that were hidden
      requestAnimationFrame(() => {
        extrasMaps.forEach(m => { try { m.invalidateSize(); } catch (e) {} });
      });
    }
    haptic(10);
    playClick();
  };

  window.toggleMovieList = function () {
    const list = document.getElementById('movie-list');
    const btn = document.getElementById('movie-toggle');
    if (!list || !btn) return;
    const isExpanded = list.classList.toggle('movie-list-expanded');
    btn.textContent = isExpanded ? 'Show less ▲' : 'Show all 20 movies ▼';
    haptic(10);
    playClick();
  };

  window.toggleMovieCategory = function (headerEl) {
    const body = headerEl.nextElementSibling;
    const chevron = headerEl.querySelector('.spot-group-chevron');
    const isOpen = body.classList.toggle('open');
    chevron.textContent = isOpen ? '▼' : '▶';
    haptic(10);
    playClick();
  };

  window.toggleBeachIntel = function (btnEl) {
    const body = btnEl.nextElementSibling;
    const chevron = btnEl.querySelector('.spot-group-chevron');
    const isOpen = body.classList.toggle('open');
    chevron.textContent = isOpen ? '▼' : '▶';
    haptic(10);
    playClick();
  };

  // ── Initialisation ─────────────────────────────────────────────
  async function loadTides() {
    const res = await fetch('data/tides.json');
    if (!res.ok) throw new Error('Tide table missing');
    Tides.load(await res.json());
  }

  async function loadForecast() {
    const cfg = window.SurfConfig || {};
    const [fc, obs] = await Promise.all([
      E.fetchForecast(),
      E.fetchObs(cfg.OBS_URL).catch(err => { console.warn('Obs unavailable:', err); return null; }),
    ]);
    E.attachObs(fc, obs);
    state.fc = fc;
  }

  function stampUpdated() {
    const obs = state.fc.obs;
    document.getElementById('last-updated').textContent =
      `Forecast updated ${fmt(state.fc.fetchedAt)}` + (obs ? ` · Aireys Inlet obs ${fmt(obs.latest.t)}` : '');
  }

  async function init() {
    try { state.mode = localStorage.getItem('surf-mode') || state.mode; } catch (e) {}
    setupModeToggle();
    try {
      await loadTides();
      await loadForecast();
      document.getElementById('loading').style.display = 'none';
      document.getElementById('app-content').style.display = 'block';
      initMap();
      refreshUI();
      renderExtras();
      stampUpdated();
      // Re-rank every 15 minutes; refetch hourly
      setInterval(refreshUI, E.SLOT);
      setInterval(() => loadForecast().then(() => { refreshUI(); stampUpdated(); }).catch(() => {}), 3600000);
    } catch (err) {
      console.error('Init error:', err);
      document.getElementById('loading').style.display = 'none';
      document.getElementById('error-screen').style.display = 'flex';
      document.getElementById('error-message').textContent = err.message || 'Unable to load surf data.';
    }
  }

  // ── Version display & update detection ────────────────────────
  function showVersion() {
    const el = document.getElementById('app-version');
    if (el) el.textContent = 'v' + APP_VERSION;
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(reg => {
      // Check for updates every 5 minutes
      setInterval(() => reg.update(), 5 * 60 * 1000);

      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateBanner();
          }
        });
      });
    }).catch(() => {});

    // If a new SW took over, reload
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }

  function showUpdateBanner() {
    if (document.getElementById('update-banner')) return;
    const banner = document.createElement('div');
    banner.id = 'update-banner';
    banner.innerHTML = `
      <span>🆕 Update available!</span>
      <button onclick="document.getElementById('update-banner').remove();navigator.serviceWorker.getRegistration().then(r=>{if(r&&r.waiting)r.waiting.postMessage({type:'SKIP_WAITING'})})">Update Now</button>
      <button class="update-dismiss" onclick="this.parentNode.remove()">✕</button>
    `;
    document.body.appendChild(banner);
    requestAnimationFrame(() => banner.classList.add('update-visible'));
  }

  // Go
  showVersion();
  init();
})();
