// ===================================================================
// JJCC Surf Check — Torquay Coast
// Real-time surf conditions & recommendations
// ===================================================================
(function () {
  'use strict';

  // ── Beach database ─────────────────────────────────────────────
  // facing: compass direction the beach faces (where you look out to sea)
  // idealOffshore: the wind direction that blows offshore for this beach
  // swellWindow: [min, max] compass range of swell directions that reach it
  // swellExposure: 0-1 how much open-ocean swell reaches the beach (1 = fully exposed)
  // familySafety: 1-5 how safe for families (5 = very safe)
  const BEACHES = [
    {
      id: 'torquay-front',
      name: 'Torquay Front Beach',
      location: 'Torquay',
      lat: -38.3310, lng: 144.3260,
      facing: 135, idealOffshore: 315,
      swellWindow: [90, 200],
      swellExposure: 0.35,
      familySafety: 5,
      type: 'Beach break', bottom: 'Sand',
      description: 'A sheltered, east-facing beach tucked inside the bay. Small, gentle waves make it perfect for kids and learners. Lifeguard patrolled in summer.',
      bestFor: 'Beginners, young children, swimming',
      driveMinutes: 8,
    },
    {
      id: 'torquay-surf',
      name: 'Torquay Surf Beach',
      location: 'Torquay',
      lat: -38.3400, lng: 144.3150,
      facing: 190, idealOffshore: 10,
      swellWindow: [160, 250],
      swellExposure: 0.85,
      familySafety: 3,
      type: 'Beach break', bottom: 'Sand',
      description: 'Also called Back Beach. A south-facing surf beach that picks up most swells. Can be powerful on bigger days but has plenty of room to spread out. Patrolled.',
      bestFor: 'Intermediate surfers, confident beginners on small days',
      driveMinutes: 5,
    },
    {
      id: 'jan-juc',
      name: 'Jan Juc',
      location: 'Jan Juc',
      lat: -38.3530, lng: 144.2980,
      facing: 200, idealOffshore: 20,
      swellWindow: [170, 260],
      swellExposure: 0.9,
      familySafety: 2,
      type: 'Reef & beach break', bottom: 'Rock/Sand',
      description: 'A quality wave that breaks over reef and sand. The bowl section is well-known among locals. Rocky entry in places — boots can help. Not ideal for young kids.',
      bestFor: 'Intermediate to advanced surfers',
      driveMinutes: 2,
    },
    {
      id: 'bells',
      name: 'Bells Beach',
      location: 'Bells Beach',
      lat: -38.3690, lng: 144.2810,
      facing: 225, idealOffshore: 45,
      swellWindow: [190, 280],
      swellExposure: 1.0,
      familySafety: 1,
      type: 'Reef break', bottom: 'Rock reef',
      description: 'World-famous reef break home to the Rip Curl Pro. Powerful, long walls requiring experience. Steep cliff access. Best left to experienced surfers.',
      bestFor: 'Experienced surfers',
      driveMinutes: 6,
    },
    {
      id: 'point-addis',
      name: 'Point Addis',
      location: 'Anglesea',
      lat: -38.3960, lng: 144.2600,
      facing: 220, idealOffshore: 40,
      swellWindow: [180, 270],
      swellExposure: 0.95,
      familySafety: 1,
      type: 'Reef break', bottom: 'Rock reef',
      description: 'A beautiful and remote reef break in a marine sanctuary. Long walk down cliffs. Powerful on its day. For experienced surfers comfortable in isolated conditions.',
      bestFor: 'Advanced surfers',
      driveMinutes: 12,
    },
    {
      id: 'anglesea',
      name: 'Anglesea Main Beach',
      location: 'Anglesea',
      lat: -38.4080, lng: 144.1920,
      facing: 185, idealOffshore: 5,
      swellWindow: [150, 250],
      swellExposure: 0.7,
      familySafety: 4,
      type: 'Beach break', bottom: 'Sand',
      description: 'A friendly beach break at the mouth of the Anglesea River. Partially sheltered by headlands on each side, keeping waves more manageable. Patrolled and great for families.',
      bestFor: 'Families, beginners, bodyboarding',
      driveMinutes: 18,
    },
    {
      id: 'roadknight',
      name: 'Point Roadknight',
      location: 'Anglesea',
      lat: -38.4010, lng: 144.1960,
      facing: 100, idealOffshore: 280,
      swellWindow: [50, 180],
      swellExposure: 0.25,
      familySafety: 5,
      type: 'Beach break', bottom: 'Sand',
      description: 'A small, east-facing cove extremely sheltered from the prevailing southwest swell. Waves are gentle and the water is calm. One of the safest spots on the coast for young children.',
      bestFor: 'Young children, swimming, bodyboarding',
      driveMinutes: 17,
    },
    {
      id: 'fairhaven',
      name: 'Fairhaven Beach',
      location: 'Fairhaven',
      lat: -38.4750, lng: 144.0920,
      facing: 195, idealOffshore: 15,
      swellWindow: [160, 260],
      swellExposure: 0.85,
      familySafety: 3,
      type: 'Beach break', bottom: 'Sand',
      description: 'A long stretch of beach between Aireys Inlet and Eastern View. Consistent surf with multiple peaks. Less crowded than Torquay beaches. Patrolled in summer.',
      bestFor: 'All levels depending on conditions',
      driveMinutes: 28,
    },
    {
      id: 'lorne',
      name: 'Lorne',
      location: 'Lorne',
      lat: -38.5420, lng: 143.9750,
      facing: 155, idealOffshore: 335,
      swellWindow: [120, 220],
      swellExposure: 0.45,
      familySafety: 4,
      type: 'Beach break', bottom: 'Sand',
      description: 'A charming seaside town beach sheltered by the Otway ranges. Picks up less swell than beaches to the east, making it calmer on bigger days. Patrolled and family friendly.',
      bestFor: 'Families, beginners, bodyboarding on small days',
      driveMinutes: 45,
    },
    {
      id: 'thirteenth',
      name: '13th Beach',
      location: 'Barwon Heads',
      lat: -38.2980, lng: 144.5050,
      facing: 175, idealOffshore: 355,
      swellWindow: [140, 240],
      swellExposure: 0.80,
      familySafety: 3,
      type: 'Beach break', bottom: 'Sand',
      description: 'A long exposed beach east of Torquay near Barwon Heads. Multiple peaks spread along the beach mean it rarely gets crowded. Can be powerful on bigger swells.',
      bestFor: 'Intermediate surfers looking for uncrowded waves',
      driveMinutes: 25,
    },
  ];

  // API groups — beaches share wave data from the nearest point
  const API_GROUPS = [
    { lat: -38.335, lng: 144.320, beaches: ['torquay-front', 'torquay-surf', 'jan-juc', 'thirteenth'] },
    { lat: -38.383, lng: 144.270, beaches: ['bells', 'point-addis'] },
    { lat: -38.450, lng: 144.130, beaches: ['anglesea', 'roadknight', 'fairhaven', 'lorne'] },
  ];

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

  // ── Logger-friendly ratings (1-5) ──────────────────────────────
  const LOGGER_FRIENDLY = {
    'torquay-front': 5,
    'torquay-surf': 4,
    'jan-juc': 3,
    'bells': 2,
    'point-addis': 1,
    'anglesea': 5,
    'roadknight': 4,
    'fairhaven': 4,
    'lorne': 4,
    'thirteenth': 4,
  };

  // ── State ──────────────────────────────────────────────────────
  let state = {
    mode: 'family',
    weather: null,
    marine: null,
    scores: null,
    map: null,
    markers: [],
    loading: true,
    error: null,
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
  function angleDiff(a, b) {
    let d = Math.abs(a - b) % 360;
    return d > 180 ? 360 - d : d;
  }

  function degToCompass(deg) {
    const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
    return dirs[Math.round(deg / 22.5) % 16];
  }

  function windArrow(deg) {
    // Arrow points in the direction the wind is GOING (i.e. opposite of "from")
    // We rotate an up-arrow by the "from" direction + 180
    const rotation = (deg + 180) % 360;
    return `<span class="wind-arrow" style="transform:rotate(${rotation}deg)" aria-hidden="true">↑</span>`;
  }

  function scoreColor(score) {
    if (score >= 65) return 'green';
    if (score >= 40) return 'yellow';
    return 'red';
  }

  function scoreLabel(score) {
    if (score >= 80) return 'Excellent';
    if (score >= 65) return 'Great';
    if (score >= 50) return 'Good';
    if (score >= 40) return 'Fair';
    if (score >= 25) return 'Poor';
    return 'Not ideal';
  }

  // ── Wave condition (clean/choppy) ───────────────────────────────
  function getWaveCondition(s) {
    const windDiff = angleDiff(s.windDir, s.beach.idealOffshore);
    let cs = 0;

    // Wind direction effect on surface texture
    if (windDiff <= 25) cs += 40;       // offshore — glass
    else if (windDiff <= 50) cs += 30;  // cross-offshore
    else if (windDiff <= 80) cs += 15;  // cross-shore
    else if (windDiff <= 110) cs += 5;  // cross-onshore
    // else 0 — full onshore

    // Wind speed effect
    if (s.windSpeed < 8) cs += 30;
    else if (s.windSpeed < 15) cs += 22;
    else if (s.windSpeed < 22) cs += 12;
    else if (s.windSpeed < 30) cs += 5;

    // Swell period effect
    if (s.wavePeriod >= 12) cs += 30;
    else if (s.wavePeriod >= 10) cs += 25;
    else if (s.wavePeriod >= 8) cs += 18;
    else if (s.wavePeriod >= 6) cs += 10;
    else cs += 3;

    if (cs >= 80) return { label: 'Clean', emoji: '✨', cls: 'cond-clean' };
    if (cs >= 60) return { label: 'Mostly Clean', emoji: '👍', cls: 'cond-mostly-clean' };
    if (cs >= 40) return { label: 'Moderate Chop', emoji: '🌊', cls: 'cond-moderate' };
    if (cs >= 20) return { label: 'Choppy', emoji: '💨', cls: 'cond-choppy' };
    return { label: 'Messy', emoji: '🌬️', cls: 'cond-messy' };
  }

  // ── Wave size labels (all modes) ──────────────────────────────
  function getWaveSizeLabel(effectiveH, mode) {
    mode = mode || state.mode;

    if (mode === 'family') {
      if (effectiveH < 0.15) return { label: 'Flat', emoji: '😴', cls: 'small', warning: null };
      if (effectiveH < 0.3) return { label: 'Very calm', emoji: '😊', cls: 'fun', warning: null };
      if (effectiveH < 0.6) return { label: 'Gentle', emoji: '👌', cls: 'pumping', warning: null };
      if (effectiveH < 1.0) return { label: 'Fun waves', emoji: '🏄', cls: 'pumping', warning: null };
      if (effectiveH < 1.5) return { label: 'Getting big', emoji: '⚠️', cls: 'small', warning: 'May be too much for young kids' };
      return { label: 'Too big for families', emoji: '🚫', cls: 'heavy', warning: 'Very powerful — try a sheltered beach' };
    }

    if (mode === 'logger') {
      if (effectiveH < 0.2) return { label: 'Flat', emoji: '😐', cls: 'flat', warning: 'No waves — time to wax the board' };
      if (effectiveH < 0.4) return { label: 'Ankle high', emoji: '🤏', cls: 'tiny', warning: 'Barely rideable even on a log' };
      if (effectiveH < 0.8) return { label: 'Perfect log waves', emoji: '🤙', cls: 'fun', warning: null };
      if (effectiveH < 1.2) return { label: 'Fun & clean', emoji: '🏄', cls: 'pumping', warning: null };
      if (effectiveH < 1.8) return { label: 'Solid', emoji: '💪', cls: 'solid', warning: null };
      return { label: 'Too heavy for a log', emoji: '⚠️', cls: 'heavy', warning: 'Probably shortboard territory today' };
    }

    // Surfer mode
    if (effectiveH < 0.2) return { label: 'Flat', emoji: '😐', cls: 'flat', warning: 'No waves — lake-like conditions' };
    if (effectiveH < 0.5) return { label: 'Barely breaking', emoji: '😕', cls: 'tiny', warning: 'Not enough swell for a proper surf' };
    if (effectiveH < 0.8) return { label: 'Small', emoji: '🤏', cls: 'small', warning: null };
    if (effectiveH < 1.2) return { label: 'Fun size', emoji: '🤙', cls: 'fun', warning: null };
    if (effectiveH < 2.0) return { label: 'Pumping', emoji: '🔥', cls: 'pumping', warning: null };
    if (effectiveH < 3.0) return { label: 'Solid', emoji: '💪', cls: 'solid', warning: null };
    return { label: 'Heavy', emoji: '⚠️', cls: 'heavy', warning: 'Very large — experienced surfers only' };
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

  function formatHour(isoStr) {
    const d = new Date(isoStr);
    return d.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  function formatDay(isoStr) {
    const d = new Date(isoStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return d.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'short' });
  }

  function isDaylight(hourStr, sunrise, sunset) {
    if (!sunrise || !sunset) return true;
    const h = new Date(hourStr).getHours();
    const sunriseH = new Date(sunrise).getHours();
    const sunsetH = new Date(sunset).getHours();
    return h >= sunriseH && h <= sunsetH;
  }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function randomPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function getEat(beachId) {
    const list = LOCAL_EATS[beachId];
    return list ? randomPick(list) : null;
  }

  function getRandomMovie() {
    return randomPick(SURF_MOVIES);
  }

  // ── Tide approximation ────────────────────────────────────────
  // Simplified harmonic model for Port Phillip / Western Victoria coast
  function estimateTide(date) {
    const M2_PERIOD = 12.4206 * 3600000;
    const S2_PERIOD = 12.0 * 3600000;
    const epoch = new Date('2024-01-01T00:00:00+11:00').getTime();
    const elapsed = date.getTime() - epoch;
    const m2 = 0.38 * Math.cos(2 * Math.PI * elapsed / M2_PERIOD + 1.8);
    const s2 = 0.14 * Math.cos(2 * Math.PI * elapsed / S2_PERIOD + 2.1);
    return 0.80 + m2 + s2; // approximate metres above datum
  }

  function tideState(date) {
    const now = estimateTide(date);
    const soon = estimateTide(new Date(date.getTime() + 30 * 60000));
    const level = now > 1.0 ? 'High' : now < 0.6 ? 'Low' : 'Mid';
    const trend = soon > now + 0.01 ? 'Rising' : soon < now - 0.01 ? 'Falling' : 'Slack';

    // Find time to next tide turn (high or low)
    const step = 10 * 60000; // 10 min steps
    let prevH = now;
    let direction = null;
    let nextExtreme = null;

    for (let i = 1; i <= 48; i++) { // look ahead ~8 hours
      const t = new Date(date.getTime() + i * step);
      const h = estimateTide(t);
      const delta = h - prevH;

      if (direction === null) {
        if (delta > 0.003) direction = 'up';
        else if (delta < -0.003) direction = 'down';
      } else {
        if (direction === 'up' && delta < -0.003) {
          const hrs = Math.round(((i - 1) * step) / 3600000 * 2) / 2;
          nextExtreme = { type: 'high', hoursAway: hrs };
          break;
        } else if (direction === 'down' && delta > 0.003) {
          const hrs = Math.round(((i - 1) * step) / 3600000 * 2) / 2;
          nextExtreme = { type: 'low', hoursAway: hrs };
          break;
        }
      }
      prevH = h;
    }

    let nextLabel = '';
    if (nextExtreme) {
      if (nextExtreme.hoursAway <= 0.5) {
        nextLabel = `At ${nextExtreme.type} tide now`;
      } else {
        nextLabel = `~${nextExtreme.hoursAway}hrs to ${nextExtreme.type} tide`;
      }
    }

    return { height: now, level, trend, label: `${level} (${trend})`, nextExtreme, nextLabel };
  }

  // ── Tide helpers for spot recommendations ─────────────────────
  function matchesTide(bestTide, tideLevel) {
    if (!bestTide || bestTide === 'All tides') return true;
    const bt = bestTide.toLowerCase();
    const tl = tideLevel.toLowerCase();
    if (bt.includes('low') && tl === 'low') return true;
    if (bt.includes('mid') && tl === 'mid') return true;
    if (bt.includes('high') && tl === 'high') return true;
    return false;
  }

  function nextGoodTide(bestTide) {
    if (!bestTide || bestTide === 'All tides') return null;
    const now = new Date();
    const step = 15 * 60000; // 15-minute steps
    for (let i = 1; i <= 48; i++) { // look ahead 12 hours
      const t = new Date(now.getTime() + i * step);
      const h = estimateTide(t);
      const level = h > 1.0 ? 'High' : h < 0.6 ? 'Low' : 'Mid';
      if (matchesTide(bestTide, level)) {
        const hrs = Math.round((i * step) / 3600000 * 2) / 2;
        return hrs;
      }
    }
    return null;
  }

  function tideBadgeHtml(bestTide) {
    const tide = tideState(new Date());
    if (!bestTide || bestTide === 'All tides') {
      return `<span class="tide-badge tide-good">🌊 All tides — ${tide.label}</span>`;
    }
    if (matchesTide(bestTide, tide.level)) {
      return `<span class="tide-badge tide-good">✅ ${tide.label} — suits this spot</span>`;
    }
    const hrs = nextGoodTide(bestTide);
    if (hrs) {
      return `<span class="tide-badge tide-wait">⏳ Best at ${bestTide} tide — ~${hrs}hrs away</span>`;
    }
    return `<span class="tide-badge tide-wait">⏳ Best at ${bestTide} tide</span>`;
  }

  // ── Top contributing factors ──────────────────────────────────
  function getTopFactors(s, mode) {
    const factors = [];
    const windDiff = angleDiff(s.windDir, s.beach.idealOffshore);

    // Wind direction
    if (windDiff <= 30) {
      factors.push({ weight: 95, icon: '✅', label: 'Offshore wind', positive: true });
    } else if (windDiff <= 70) {
      factors.push({ weight: 70, icon: '✅', label: 'Cross-offshore wind', positive: true });
    } else if (windDiff <= 110) {
      factors.push({ weight: 60, icon: '⚠️', label: 'Cross-shore wind', positive: false });
    } else {
      factors.push({ weight: 90, icon: '❌', label: 'Onshore wind', positive: false });
    }

    // Wind speed
    if (s.windSpeed < 10) {
      factors.push({ weight: 75, icon: '✅', label: 'Light winds', positive: true });
    } else if (s.windSpeed > 30) {
      factors.push({ weight: 80, icon: '❌', label: 'Strong winds', positive: false });
    } else if (s.windSpeed > 20 && windDiff > 90) {
      factors.push({ weight: 70, icon: '⚠️', label: 'Moderate onshore wind', positive: false });
    }

    // Wave height
    if (mode === 'family') {
      if (s.effectiveH >= 0.3 && s.effectiveH <= 1.0) {
        factors.push({ weight: 85, icon: '✅', label: 'Fun-sized waves', positive: true });
      } else if (s.effectiveH < 0.2) {
        factors.push({ weight: 65, icon: '⚠️', label: 'Very flat / no waves', positive: false });
      } else if (s.effectiveH > 1.5) {
        factors.push({ weight: 85, icon: '❌', label: 'Waves too big for families', positive: false });
      }
    } else if (mode === 'logger') {
      if (s.effectiveH >= 0.4 && s.effectiveH <= 1.2) {
        factors.push({ weight: 88, icon: '✅', label: 'Perfect longboard waves', positive: true });
      } else if (s.effectiveH < 0.2) {
        factors.push({ weight: 70, icon: '❌', label: 'Too flat even for a log', positive: false });
      } else if (s.effectiveH > 2.0) {
        factors.push({ weight: 75, icon: '⚠️', label: 'Heavy for a longboard', positive: false });
      }
      // Logger beach suitability
      const lf = LOGGER_FRIENDLY[s.beach.id] || 3;
      if (lf >= 4) {
        factors.push({ weight: 65, icon: '✅', label: 'Great logging beach', positive: true });
      } else if (lf <= 2) {
        factors.push({ weight: 68, icon: '⚠️', label: 'Not ideal for longboards', positive: false });
      }
    } else {
      if (s.effectiveH >= 0.8 && s.effectiveH <= 2.5) {
        factors.push({ weight: 90, icon: '✅', label: 'Great wave size', positive: true });
      } else if (s.effectiveH < 0.5) {
        factors.push({ weight: 80, icon: '❌', label: 'Too flat to surf', positive: false });
      } else if (s.effectiveH > 3.0) {
        factors.push({ weight: 60, icon: '⚠️', label: 'Very large swell', positive: false });
      }
    }

    // Period
    if (s.wavePeriod >= 10) {
      factors.push({ weight: 68, icon: '✅', label: 'Clean long-period swell', positive: true });
    } else if (s.wavePeriod < 7) {
      factors.push({ weight: 55, icon: '⚠️', label: 'Short choppy wind swell', positive: false });
    }

    // Beach safety (family mode)
    if (mode === 'family' && s.beach.familySafety >= 4) {
      factors.push({ weight: 65, icon: '✅', label: 'Family-safe beach', positive: true });
    } else if (mode === 'family' && s.beach.familySafety <= 2) {
      factors.push({ weight: 72, icon: '⚠️', label: 'Advanced / rocky spot', positive: false });
    }

    // Sort: if overall is good, show positive first; otherwise negative first
    const isGood = s.overall >= 50;
    factors.sort((a, b) => {
      if (isGood) {
        if (a.positive !== b.positive) return b.positive ? 1 : -1;
      } else {
        if (a.positive !== b.positive) return a.positive ? 1 : -1;
      }
      return b.weight - a.weight;
    });

    return factors.slice(0, 2);
  }

  // ── Good window calculator ──────────────────────────────────
  // Looks ahead hour-by-hour to find when conditions drop significantly
  function getGoodWindow(beach, currentHourIdx, currentOverall) {
    if (!state.weather || !state.marine) return null;
    const times = state.weather.hourly.time;
    const maxHours = Math.min(currentHourIdx + 12, times.length); // look up to 12 hours ahead

    // What constitutes a "significant" drop?
    const dropThreshold = Math.max(currentOverall - 15, currentOverall >= 65 ? 64 : currentOverall >= 40 ? 39 : 0);

    for (let h = currentHourIdx + 1; h < maxHours; h++) {
      const dt = new Date(times[h]);
      const hour = dt.getHours();
      if (hour < 6 || hour > 20) continue; // skip nighttime

      const future = scoreBeach(beach, h, state.weather, state.marine, state.mode);

      if (future.overall <= dropThreshold) {
        const hoursAway = h - currentHourIdx;
        // Determine what changed
        const curWindSpeed = state.weather.hourly.windspeed_10m[currentHourIdx] ?? 0;
        const futWindSpeed = state.weather.hourly.windspeed_10m[h] ?? 0;
        const curWindDir = state.weather.hourly.winddirection_10m[currentHourIdx] ?? 0;
        const futWindDir = state.weather.hourly.winddirection_10m[h] ?? 0;
        const curDirDiff = angleDiff(curWindDir, beach.idealOffshore);
        const futDirDiff = angleDiff(futWindDir, beach.idealOffshore);

        let reason = '';
        if (futWindSpeed > curWindSpeed + 10 && futDirDiff > 90) {
          reason = 'wind picks up onshore';
        } else if (futDirDiff > curDirDiff + 30 && futDirDiff > 90) {
          reason = 'wind swings onshore';
        } else if (futWindSpeed > curWindSpeed + 12) {
          reason = 'wind picks up';
        } else if (futDirDiff > curDirDiff + 40) {
          reason = 'wind direction shifts';
        } else {
          // Check swell changes
          const curH = future.effectiveH;
          const prevH = scoreBeach(beach, currentHourIdx, state.weather, state.marine, state.mode).effectiveH;
          if (state.mode === 'family' && curH > prevH + 0.5) {
            reason = 'swell builds';
          } else if (curH < prevH - 0.3) {
            reason = 'swell drops';
          } else {
            reason = 'conditions change';
          }
        }

        return {
          hoursGood: hoursAway,
          changeTime: formatHour(times[h]),
          reason,
        };
      }
    }

    // Score stays good for the entire look-ahead window
    const remainingHours = maxHours - currentHourIdx - 1;
    if (remainingHours > 1) {
      return { hoursGood: remainingHours, changeTime: null, reason: null };
    }
    return null;
  }

  // ── Scoring modal ──────────────────────────────────────────
  function renderScoringModal() {
    const modal = document.getElementById('scoring-modal');
    if (!modal) return;
    const modeLabel = state.mode === 'family' ? 'Family' : state.mode === 'logger' ? 'Logger' : 'Surfer';
    const heightRange = state.mode === 'family' ? '0.3 – 1.0m' : state.mode === 'logger' ? '0.3 – 1.5m' : '0.8 – 2.5m';

    modal.querySelector('.modal-body').innerHTML = `
      <h3>How the Surf Rating works</h3>
      <p>Each beach gets a rating from <strong>0 to 100</strong> based on current and forecast conditions. The rating is tailored to your <strong>${modeLabel}</strong> mode.</p>

      <div class="score-breakdown">
        <div class="score-factor">
          <div class="factor-bar" style="width:42%">
            <span class="factor-pct">42%</span>
          </div>
          <div class="factor-detail">
            <strong>🌬️ Wind Quality</strong>
            <p>Is the wind blowing offshore (from land to sea)? That's ideal — it grooms the waves. Onshore wind makes them messy. Each beach faces a different direction, so the same wind can be great for one beach and poor for another. Light winds are almost always good.</p>
          </div>
        </div>
        <div class="score-factor">
          <div class="factor-bar" style="width:42%">
            <span class="factor-pct">42%</span>
          </div>
          <div class="factor-detail">
            <strong>🌊 Wave Quality</strong>
            <p>Three things matter: <em>height</em> (${heightRange} is ideal in ${modeLabel} mode), <em>period</em> (longer = cleaner, 10+ seconds is great), and <em>direction</em> (does the swell actually reach this beach?).</p>
          </div>
        </div>
        <div class="score-factor">
          <div class="factor-bar" style="width:16%">
            <span class="factor-pct">16%</span>
          </div>
          <div class="factor-detail">
            <strong>🏖️ Beach Safety & Weather</strong>
            <p>${state.mode === 'family' ? 'Sheltered, sandy beaches like Point Roadknight get a boost. Rocky, powerful spots like Bells get a penalty.' : state.mode === 'logger' ? 'Mellow, sandy beaches like Torquay Front and Anglesea get a boost. Heavy, reefbreak spots like Bells and Point Addis get a penalty — not ideal for longboarding.' : 'Minor adjustment for heavy rain. Beach type doesn\'t affect the surfer score.'} Heavy rain is a small negative.</p>
          </div>
        </div>
      </div>

      <h3>What the colours mean</h3>
      <div class="color-ranges">
        <div class="color-range green-range">
          <span class="range-dot green"></span>
          <div>
            <strong>65 – 100 &nbsp;Great to Excellent</strong>
            <p>Conditions are well-suited — go enjoy it!</p>
          </div>
        </div>
        <div class="color-range yellow-range">
          <span class="range-dot yellow"></span>
          <div>
            <strong>40 – 64 &nbsp;Fair to Good</strong>
            <p>Rideable but with compromises — maybe some onshore wind or the swell isn't ideal.</p>
          </div>
        </div>
        <div class="color-range red-range">
          <span class="range-dot red"></span>
          <div>
            <strong>0 – 39 &nbsp;Poor to Not Ideal</strong>
            <p>Conditions don't suit this beach right now. Try a different spot or time.</p>
          </div>
        </div>
      </div>

      <h3>🚗 Drive times</h3>
      <p>All drive times are estimated from the <strong>Jan Juc Caravan Park</strong> via the Great Ocean Road.</p>
    `;
  }

  window.openScoringModal = function () {
    renderScoringModal();
    document.getElementById('scoring-modal').classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  window.closeScoringModal = function () {
    document.getElementById('scoring-modal').classList.remove('open');
    document.body.style.overflow = '';
  };

  // ── API fetching ───────────────────────────────────────────────
  async function fetchWeather() {
    const lat = -38.38, lng = 144.25;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}`
      + `&hourly=temperature_2m,apparent_temperature,weathercode,windspeed_10m,windgusts_10m,winddirection_10m,precipitation_probability`
      + `&daily=sunrise,sunset&timezone=Australia%2FMelbourne&forecast_days=3`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Weather API failed');
    return res.json();
  }

  async function fetchMarine() {
    // Batch request for all API groups
    const lats = API_GROUPS.map(g => g.lat).join(',');
    const lngs = API_GROUPS.map(g => g.lng).join(',');
    const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lats}&longitude=${lngs}`
      + `&hourly=wave_height,wave_direction,wave_period,swell_wave_height,swell_wave_direction,swell_wave_period`
      + `&timezone=Australia%2FMelbourne&forecast_days=3`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Marine API failed');
    return res.json();
  }

  // ── Scoring engine ─────────────────────────────────────────────

  function scoreWind(windDir, windSpeed, beach, mode) {
    const diff = angleDiff(windDir, beach.idealOffshore);

    // Direction score
    let dirScore;
    if (diff <= 25) dirScore = 100;
    else if (diff <= 50) dirScore = 82;
    else if (diff <= 80) dirScore = 55;
    else if (diff <= 110) dirScore = 28;
    else dirScore = 8;

    // Speed modifier
    let speedMod = 1;
    if (windSpeed < 5) {
      // Very light — almost always fine
      speedMod = 0.92;
    } else if (windSpeed < 12) {
      speedMod = 1.0; // ideal light breeze
    } else if (windSpeed < 20) {
      speedMod = diff > 90 ? 0.55 : 0.90; // moderate — matters if onshore
    } else if (windSpeed < 30) {
      speedMod = diff > 90 ? 0.30 : 0.75;
    } else {
      speedMod = diff > 90 ? 0.15 : 0.50; // strong
    }

    // Family mode: penalise strong wind regardless of direction
    if (mode === 'family' && windSpeed > 25) {
      speedMod *= 0.6;
    }

    return Math.round(clamp(dirScore * speedMod, 0, 100));
  }

  function scoreSwell(waveH, wavePeriod, waveDir, beach, mode) {
    // Effective height at this beach
    const effectiveH = waveH * beach.swellExposure;

    // — Height score —
    let heightScore;
    if (mode === 'family') {
      // Families want gentle waves: 0.2–1.0 m effective
      if (effectiveH < 0.15)      heightScore = 20;
      else if (effectiveH < 0.3)  heightScore = 55;
      else if (effectiveH <= 0.6) heightScore = 100;
      else if (effectiveH <= 1.0) heightScore = 85;
      else if (effectiveH <= 1.5) heightScore = 40;
      else if (effectiveH <= 2.0) heightScore = 15;
      else                        heightScore = 5;
    } else if (mode === 'logger') {
      // Loggers want small-medium clean waves: 0.3–1.5m
      if (effectiveH < 0.15)      heightScore = 10;
      else if (effectiveH < 0.3)  heightScore = 35;
      else if (effectiveH < 0.5)  heightScore = 70;
      else if (effectiveH <= 1.0) heightScore = 100;
      else if (effectiveH <= 1.5) heightScore = 85;
      else if (effectiveH <= 2.0) heightScore = 50;
      else if (effectiveH <= 2.5) heightScore = 25;
      else                        heightScore = 10;
    } else {
      // Surfers want rideable waves: 0.6–2.5 m
      if (effectiveH < 0.25)      heightScore = 5;
      else if (effectiveH < 0.5)  heightScore = 25;
      else if (effectiveH < 0.8)  heightScore = 55;
      else if (effectiveH <= 1.5) heightScore = 95;
      else if (effectiveH <= 2.5) heightScore = 100;
      else if (effectiveH <= 3.5) heightScore = 70;
      else                        heightScore = 40;
    }

    // — Period score —
    let periodScore;
    if (wavePeriod < 5)        periodScore = 20;
    else if (wavePeriod < 7)   periodScore = 40;
    else if (wavePeriod < 9)   periodScore = 60;
    else if (wavePeriod < 12)  periodScore = 85;
    else if (wavePeriod <= 16) periodScore = 100;
    else                       periodScore = 90;

    // — Direction score (does swell reach beach?) —
    let dirScore;
    if (waveDir === undefined || waveDir === null) {
      dirScore = 60; // unknown, assume moderate
    } else {
      const diffFromFacing = angleDiff(waveDir, beach.facing);
      if (diffFromFacing <= 40)       dirScore = 100;
      else if (diffFromFacing <= 75)  dirScore = 70;
      else if (diffFromFacing <= 110) dirScore = 35;
      else                            dirScore = 10;
    }

    return Math.round(clamp(heightScore * 0.50 + periodScore * 0.25 + dirScore * 0.25, 0, 100));
  }

  function scoreBeach(beach, hourIndex, weather, marine, mode) {
    // Find which API group this beach belongs to
    let marineData = marine;
    if (Array.isArray(marine)) {
      const groupIdx = API_GROUPS.findIndex(g => g.beaches.includes(beach.id));
      marineData = marine[groupIdx] || marine[0];
    }

    const windDir = weather.hourly.winddirection_10m[hourIndex] ?? 0;
    const windSpeed = weather.hourly.windspeed_10m[hourIndex] ?? 0;
    const windGust = weather.hourly.windgusts_10m[hourIndex] ?? windSpeed;
    const waveH = marineData.hourly.wave_height[hourIndex] ?? 0;
    const wavePeriod = marineData.hourly.wave_period[hourIndex] ?? 0;
    const waveDir = marineData.hourly.wave_direction[hourIndex];
    const swellH = marineData.hourly.swell_wave_height?.[hourIndex] ?? waveH;
    const swellDir = marineData.hourly.swell_wave_direction?.[hourIndex] ?? waveDir;
    const swellPeriod = marineData.hourly.swell_wave_period?.[hourIndex] ?? wavePeriod;
    const temp = weather.hourly.temperature_2m[hourIndex] ?? 20;
    const weatherCode = weather.hourly.weathercode[hourIndex] ?? 0;
    const precip = weather.hourly.precipitation_probability[hourIndex] ?? 0;
    const timeStr = weather.hourly.time[hourIndex];

    const windScore = scoreWind(windDir, windSpeed, beach, mode);
    const swellScore = scoreSwell(swellH || waveH, swellPeriod || wavePeriod, swellDir ?? waveDir, beach, mode);

    // Beach suitability bonus/penalty
    let safetyMod = 0;
    if (mode === 'family') {
      safetyMod = (beach.familySafety - 3) * 6; // -12 to +12
    } else if (mode === 'logger') {
      const lf = LOGGER_FRIENDLY[beach.id] || 3;
      safetyMod = (lf - 3) * 5; // -10 to +10
    }

    // Weather minor modifier
    let weatherMod = 0;
    if (precip > 60) weatherMod = -5;
    if (weatherCode >= 80) weatherMod = -8;

    const overall = Math.round(clamp(
      windScore * 0.42 + swellScore * 0.42 + safetyMod + weatherMod + 16, // 16 baseline
      0, 100
    ));

    const effectiveH = (swellH || waveH) * beach.swellExposure;
    const tide = tideState(new Date(timeStr));

    return {
      beach,
      hourIndex,
      time: timeStr,
      overall,
      windScore,
      swellScore,
      windDir,
      windSpeed,
      windGust,
      waveH: swellH || waveH,
      effectiveH,
      wavePeriod: swellPeriod || wavePeriod,
      waveDir: swellDir ?? waveDir,
      temp,
      weatherCode,
      precip,
      tide,
    };
  }

  // ── Explanation generator ──────────────────────────────────────
  function generateExplanation(s, mode) {
    const parts = [];
    const diff = angleDiff(s.windDir, s.beach.idealOffshore);
    const windType =
      diff <= 30 ? 'offshore' :
      diff <= 70 ? 'cross-offshore' :
      diff <= 110 ? 'cross-shore' : 'onshore';

    const windQual =
      windType === 'offshore' ? 'ideal — blowing from land to sea, grooming the wave faces for clean rides' :
      windType === 'cross-offshore' ? 'mostly favourable — slightly angled offshore, still keeping waves fairly clean' :
      windType === 'cross-shore' ? 'not ideal — blowing across the beach, creating some chop on the waves' :
      'unfavourable — blowing straight onto the beach, making waves messy and harder to ride';

    parts.push(`<strong>Wind:</strong> ${Math.round(s.windSpeed)} km/h from the ${degToCompass(s.windDir)} — that's ${windQual} for this ${degToCompass(s.beach.facing)}-facing beach.`);

    const hDesc = s.effectiveH < 0.3 ? 'very small' :
      s.effectiveH < 0.6 ? 'small and gentle' :
      s.effectiveH < 1.0 ? 'a fun size' :
      s.effectiveH < 1.5 ? 'moderate' :
      s.effectiveH < 2.0 ? 'solid' : 'large';

    const pDesc = s.wavePeriod < 7 ? 'short-period wind swell (choppy)' :
      s.wavePeriod < 10 ? 'moderate period' :
      s.wavePeriod < 13 ? 'nicely spaced, well-organised swell' : 'long-range groundswell, powerful and clean';

    parts.push(`<strong>Waves:</strong> ${s.effectiveH.toFixed(1)}m (${hDesc}) with a ${Math.round(s.wavePeriod)}s period — ${pDesc}.`);

    if (mode === 'family') {
      if (s.beach.familySafety >= 4) {
        parts.push(`<strong>Safety:</strong> ${s.beach.name} is one of the safer spots on this coast — sandy bottom, generally gentle conditions${s.beach.familySafety === 5 ? ', and very sheltered' : ''}.`);
      } else if (s.beach.familySafety <= 2) {
        parts.push(`<strong>Caution:</strong> This spot can be challenging — ${s.beach.bottom.toLowerCase().includes('rock') ? 'rocky bottom, ' : ''}potentially powerful waves. Better suited to confident swimmers and experienced surfers.`);
      }
    } else if (mode === 'logger') {
      const lf = LOGGER_FRIENDLY[s.beach.id] || 3;
      if (lf >= 4) {
        parts.push(`<strong>Longboard:</strong> ${s.beach.name} is a great logging spot — ${lf === 5 ? 'mellow waves, sandy bottom, perfect for nose-riding' : 'gentle slope and friendly waves suit a longboard well'}.`);
      } else if (lf <= 2) {
        parts.push(`<strong>Longboard:</strong> This spot is ${lf === 1 ? 'really not suited to longboarding — heavy, powerful waves on reef' : 'tricky on a log — the wave has more power than most longboard-friendly spots'}.`);
      }
    }

    const tideExtra = s.tide.nextLabel ? ` ${s.tide.nextLabel}.` : '.';
    parts.push(`<strong>Tide:</strong> Currently ${s.tide.label.toLowerCase()} (≈${s.tide.height.toFixed(1)}m).${tideExtra}`);

    return parts.join(' ');
  }

  // ── Compute all scores ─────────────────────────────────────────
  function computeAllScores() {
    const weather = state.weather;
    const marine = state.marine;
    if (!weather || !marine) return [];

    const hoursCount = weather.hourly.time.length;
    const allScores = [];

    for (let h = 0; h < hoursCount; h++) {
      const timeStr = weather.hourly.time[h];
      const dt = new Date(timeStr);
      const hour = dt.getHours();

      // Only score daylight hours (6 AM – 8 PM)
      if (hour < 6 || hour > 20) continue;

      // Find sunrise/sunset for this day
      const dayIndex = weather.daily.time.findIndex(d => d === timeStr.slice(0, 10));
      const sunrise = dayIndex >= 0 ? weather.daily.sunrise[dayIndex] : null;
      const sunset = dayIndex >= 0 ? weather.daily.sunset[dayIndex] : null;

      if (sunrise && sunset && !isDaylight(timeStr, sunrise, sunset)) continue;

      for (const beach of BEACHES) {
        allScores.push(scoreBeach(beach, h, weather, marine, state.mode));
      }
    }
    return allScores;
  }

  // ── Recommendations ────────────────────────────────────────────
  function getCurrentHourIndex(weather) {
    const now = new Date();
    const times = weather.hourly.time;
    let best = 0, bestDiff = Infinity;
    for (let i = 0; i < times.length; i++) {
      const d = Math.abs(new Date(times[i]).getTime() - now.getTime());
      if (d < bestDiff) { bestDiff = d; best = i; }
    }
    return best;
  }

  function getGoNow(scores) {
    const now = new Date();
    // Find scores for the current hour
    const currentScores = scores.filter(s => {
      const diff = Math.abs(new Date(s.time).getTime() - now.getTime());
      return diff < 45 * 60000; // within 45 minutes
    });
    if (!currentScores.length) return null;
    currentScores.sort((a, b) => b.overall - a.overall);
    return currentScores[0];
  }

  function getBestToday(scores) {
    const today = new Date().toISOString().slice(0, 10);
    const now = new Date();
    const todayScores = scores.filter(s =>
      s.time.startsWith(today) && new Date(s.time) >= new Date(now.getTime() - 60 * 60000)
    );
    // Group by beach, pick best hour per beach
    const byBeach = {};
    for (const s of todayScores) {
      if (!byBeach[s.beach.id] || s.overall > byBeach[s.beach.id].overall) {
        byBeach[s.beach.id] = s;
      }
    }
    return Object.values(byBeach).sort((a, b) => b.overall - a.overall).slice(0, 5);
  }

  function getNextDays(scores) {
    const today = new Date().toISOString().slice(0, 10);
    const futureDays = {};
    for (const s of scores) {
      const day = s.time.slice(0, 10);
      if (day === today) continue;
      if (!futureDays[day]) futureDays[day] = [];
      futureDays[day].push(s);
    }
    const result = [];
    for (const [day, dayScores] of Object.entries(futureDays)) {
      // Group by beach, find best hour per beach
      const byBeach = {};
      for (const s of dayScores) {
        if (!byBeach[s.beach.id] || s.overall > byBeach[s.beach.id].overall) {
          byBeach[s.beach.id] = s;
        }
      }
      const top = Object.values(byBeach).sort((a, b) => b.overall - a.overall).slice(0, 4);
      result.push({ day, label: formatDay(day + 'T12:00'), beaches: top });
    }
    return result.sort((a, b) => a.day.localeCompare(b.day));
  }

  // ── Map ────────────────────────────────────────────────────────
  function initMap() {
    const map = L.map('map', {
      zoomControl: false,
      attributionControl: false,
    }).setView([-38.40, 144.22], 11);

    L.control.zoom({ position: 'topright' }).addTo(map);
    L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 16,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    }).addTo(map);

    state.map = map;
    return map;
  }

  function updateMapMarkers(currentScores) {
    state.markers.forEach(m => m.remove());
    state.markers = [];

    for (const s of currentScores) {
      const color = s.overall >= 65 ? '#22c55e' : s.overall >= 40 ? '#eab308' : '#ef4444';
      const marker = L.circleMarker([s.beach.lat, s.beach.lng], {
        radius: 14,
        fillColor: color,
        fillOpacity: 0.9,
        color: '#fff',
        weight: 3,
        className: 'map-marker',
      }).addTo(state.map);

      marker.bindTooltip(`${s.beach.name} — ${s.overall}`, {
        direction: 'top',
        className: 'surf-tooltip',
      });

      marker.on('click', () => openBeachModal(s.beach.id));
      state.markers.push(marker);
    }
  }

  // ── UI Rendering — Choice-based flow ────────────────────────────

  function windQualityBadge(s) {
    const diff = angleDiff(s.windDir, s.beach.idealOffshore);
    if (diff <= 30) return `<span class="wind-qual wind-offshore">🟢 Offshore</span>`;
    if (diff <= 70) return `<span class="wind-qual wind-cross-off">🟡 Cross-offshore</span>`;
    if (diff <= 110) return `<span class="wind-qual wind-cross">🟠 Cross-shore</span>`;
    return `<span class="wind-qual wind-onshore">🔴 Onshore</span>`;
  }

  function renderResultCard(s, opts = {}) {
    const col = scoreColor(s.overall);
    const cond = getWaveCondition(s);
    const explanation = generateExplanation(s, state.mode);
    const factors = getTopFactors(s, state.mode);
    const window_ = getGoodWindow(s.beach, s.hourIndex, s.overall);
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${s.beach.lat},${s.beach.lng}&origin=-38.352,144.296`;

    // Wave hero — big prominent wave height (all modes)
    const ws = getWaveSizeLabel(s.effectiveH);
    const waveHeroHtml = `<div class="wave-hero ${ws.warning ? 'wave-hero-warning' : 'wave-hero-' + ws.cls}" style="margin:0 16px 10px">
      <div class="wave-hero-height">${s.effectiveH.toFixed(1)}<span>m</span></div>
      <div class="wave-hero-label">${ws.emoji} ${ws.label}</div>
      ${ws.warning ? `<div class="wave-hero-note">${ws.warning}</div>` : ''}
    </div>`;

    // Eat recommendation (random pick from options)
    const eat = getEat(s.beach.id);
    const eatHtml = eat ? `<div class="eat-recommendation" style="margin:0 16px 10px"><span class="eat-emoji">${eat.emoji}</span><div><span class="eat-name">${eat.name}</span><span class="eat-desc">${eat.desc}</span></div></div>` : '';

    // Random movie suggestion
    const movie = getRandomMovie();
    const movieHtml = `<div class="eat-recommendation movie-rec" style="margin:0 16px 10px"><span class="eat-emoji">🎬</span><div><span class="eat-name">${movie.title} (${movie.year})</span><span class="eat-desc">${movie.desc} · <em>${movie.stream}</em></span></div></div>`;

    let windowHtml = '';
    if (window_) {
      windowHtml = window_.reason
        ? `<div class="good-window" style="margin:0 16px 8px"><span class="window-icon">⏰</span><div><span class="window-hours">~${window_.hoursGood}hr${window_.hoursGood > 1 ? 's' : ''}</span> of good conditions<div class="window-detail">${window_.reason} around ${window_.changeTime}</div></div></div>`
        : `<div class="good-window good" style="margin:0 16px 8px"><span class="window-icon">⏰</span><div><span class="window-hours">${window_.hoursGood}+ hrs</span> of great conditions<div class="window-detail">Staying good all session</div></div></div>`;
    }

    const rankBadge = opts.rank ? `<div class="result-rank">#${opts.rank}</div>` : '';
    const dayBadge = opts.dayLabel ? `<div class="result-day-label">${opts.dayLabel}</div>` : '';
    const timeNote = opts.showTime ? ` · Best at ${formatHour(s.time)}` : '';
    const expanded = opts.expanded ? ' expanded' : '';

    // Collapsed header conditions line
    const condLine = `<span class="result-header-conditions">${s.effectiveH.toFixed(1)}m · ${windQualityBadge(s)} · ${Math.round(s.windSpeed)}km/h</span>`;

    return `
      <div class="result-card score-${col}${expanded}" onclick="this.classList.toggle('expanded')">
        <div class="result-card-header">
          ${rankBadge}${dayBadge}
          <div class="rec-score-ring ${col}" style="width:48px;height:48px;font-size:1.1rem">${s.overall}</div>
          <div class="result-info">
            <h4>${s.beach.name}</h4>
            <span>${s.beach.location} · ${scoreLabel(s.overall)}${timeNote}</span>
            ${condLine}
          </div>
          <span class="result-chevron">▼</span>
        </div>
        <div class="result-card-body">
          <div class="rec-meta-row" style="padding:0 16px 10px">
            <span class="drive-chip">🚗 ${s.beach.driveMinutes} min from Jan Juc</span>
            ${factors.map(f => `<span class="factor-chip ${f.positive ? 'pos' : 'neg'}">${f.icon} ${f.label}</span>`).join('')}
          </div>
          ${waveHeroHtml}
          <div class="wave-snapshot wave-snapshot-sm" style="margin:0 16px 10px">
            <div class="wave-snap-item wave-snap-height">
              <span class="wave-snap-val">${s.effectiveH.toFixed(1)}m</span>
              <span class="wave-snap-lbl">Waves</span>
            </div>
            <div class="wave-snap-item wave-snap-cond ${cond.cls}">
              <span class="wave-snap-val">${cond.emoji} ${cond.label}</span>
              <span class="wave-snap-lbl">Conditions</span>
            </div>
            <div class="wave-snap-item wave-snap-tide">
              <span class="wave-snap-val">${s.tide.trend === 'Rising' ? '↗️' : s.tide.trend === 'Falling' ? '↘️' : '➡️'} ${s.tide.level}</span>
              <span class="wave-snap-lbl">${s.tide.nextLabel || s.tide.label}</span>
            </div>
          </div>
          ${windowHtml}
          ${eatHtml}
          ${movieHtml}
          <div class="rec-explanation" style="margin:0 16px;border-radius:var(--radius-sm)">${explanation}</div>
          <div class="rec-actions" style="padding:14px 16px">
            <a href="${mapsUrl}" target="_blank" rel="noopener" class="nav-btn" onclick="event.stopPropagation()">📍 Navigate from Jan Juc</a>
          </div>
        </div>
      </div>`;
  }

  let activeChoiceType = null;

  function renderChoiceCards() {
    const cardsDiv = document.getElementById('choice-cards');
    activeChoiceType = null;

    const goNow = state.goNow;
    const bestToday = state.bestTodayList[0];
    const bestFutureDay = state.nextDaysList[0];
    const bestFuture = bestFutureDay?.beaches[0];

    // Get good-window for the "right now" pick
    let nowWindowPreview = '';
    if (goNow) {
      const w = getGoodWindow(goNow.beach, goNow.hourIndex, goNow.overall);
      if (w) {
        nowWindowPreview = w.reason
          ? ` · ⏰ ~${w.hoursGood}hr${w.hoursGood > 1 ? 's' : ''} good`
          : ` · ⏰ ${w.hoursGood}+ hrs good`;
      }
    }

    // Build preview strings
    let nowPreview = 'Checking...';
    if (goNow) {
      const ws = getWaveSizeLabel(goNow.effectiveH);
      nowPreview = `${goNow.beach.name} — ${goNow.effectiveH.toFixed(1)}m ${ws.emoji} ${ws.label}${nowWindowPreview}`;
    }

    let todayPreview = 'No more daylight';
    if (bestToday) {
      const ws = getWaveSizeLabel(bestToday.effectiveH);
      todayPreview = `${bestToday.beach.name} — ${bestToday.effectiveH.toFixed(1)}m ${ws.emoji} at ${formatHour(bestToday.time)}`;
    }

    let forecastPreview = 'No forecast';
    if (bestFuture) {
      const ws = getWaveSizeLabel(bestFuture.effectiveH);
      forecastPreview = `${bestFutureDay.label}: ${bestFuture.effectiveH.toFixed(1)}m ${ws.emoji} at ${bestFuture.beach.name}`;
    }

    // Flat day callout
    let flatCallout = '';
    if (goNow && goNow.effectiveH < 0.2) {
      const randomMovie = SURF_MOVIES[Math.floor(Math.random() * SURF_MOVIES.length)];
      flatCallout = `<div class="flat-day-callout"><span class="flat-emoji">😴</span><div><strong>It's flat out there today</strong><p>Maybe throw on a surf movie instead? Try <em>${randomMovie.title}</em> (${randomMovie.year}) — ${randomMovie.desc}</p></div></div>`;
    }

    cardsDiv.innerHTML = `${flatCallout}
      <div class="choice-card" id="choice-card-now" onclick="selectChoice('now')">
        <div class="choice-card-left">
          <div class="choice-emoji">🏄</div>
          <div>
            <h3 class="choice-title">Hit the waves right now</h3>
            <p class="choice-preview">${nowPreview}</p>
          </div>
        </div>
        ${goNow ? `<div class="choice-score ${scoreColor(goNow.overall)}">${goNow.overall}</div>` : ''}
      </div>
      <div class="choice-results-inline" id="choice-inline-now"></div>
      <div class="choice-card" id="choice-card-today" onclick="selectChoice('today')">
        <div class="choice-card-left">
          <div class="choice-emoji">☀️</div>
          <div>
            <h3 class="choice-title">Best time & spot today</h3>
            <p class="choice-preview">${todayPreview}</p>
          </div>
        </div>
        ${bestToday ? `<div class="choice-score ${scoreColor(bestToday.overall)}">${bestToday.overall}</div>` : ''}
      </div>
      <div class="choice-results-inline" id="choice-inline-today"></div>
      <div class="choice-card" id="choice-card-forecast" onclick="selectChoice('forecast')">
        <div class="choice-card-left">
          <div class="choice-emoji">📅</div>
          <div>
            <h3 class="choice-title">Pick of the next few days</h3>
            <p class="choice-preview">${forecastPreview}</p>
          </div>
        </div>
        ${bestFuture ? `<div class="choice-score ${scoreColor(bestFuture.overall)}">${bestFuture.overall}</div>` : ''}
      </div>
      <div class="choice-results-inline" id="choice-inline-forecast"></div>
    `;
  }

  function getInlineResults(type) {
    if (type === 'now') {
      const sorted = [...state.currentScores].sort((a, b) => b.overall - a.overall).slice(0, 3);
      return sorted.map((s, i) => renderResultCard(s, { rank: i + 1 })).join('');
    } else if (type === 'today') {
      const top3 = state.bestTodayList.slice(0, 3);
      return top3.map((s, i) => renderResultCard(s, { rank: i + 1, showTime: true })).join('');
    } else {
      // Forecast — best 2 spots per day, 3 days
      const days = state.nextDaysList.slice(0, 3);
      return days.map(day => {
        const top2 = day.beaches.slice(0, 2);
        if (top2.length === 0) return '';
        return top2.map((s, i) => {
          const timeNote = top2.length > 1 && top2[0].time !== top2[1].time;
          return renderResultCard(s, { dayLabel: i === 0 ? day.label : '', showTime: true });
        }).join('');
      }).join('');
    }
  }

  window.selectChoice = function (type) {
    haptic(15); playClick();

    const types = ['now', 'today', 'forecast'];
    // If clicking the same one that's open, collapse it
    if (activeChoiceType === type) {
      const container = document.getElementById(`choice-inline-${type}`);
      const card = document.getElementById(`choice-card-${type}`);
      container.innerHTML = '';
      container.classList.remove('open');
      card.classList.remove('choice-expanded');
      activeChoiceType = null;
      return;
    }

    // Collapse any currently open
    if (activeChoiceType) {
      const oldContainer = document.getElementById(`choice-inline-${activeChoiceType}`);
      const oldCard = document.getElementById(`choice-card-${activeChoiceType}`);
      if (oldContainer) { oldContainer.innerHTML = ''; oldContainer.classList.remove('open'); }
      if (oldCard) oldCard.classList.remove('choice-expanded');
    }

    // Expand the new one
    const container = document.getElementById(`choice-inline-${type}`);
    const card = document.getElementById(`choice-card-${type}`);
    container.innerHTML = getInlineResults(type);
    container.classList.add('open');
    card.classList.add('choice-expanded');
    activeChoiceType = type;

    // Smooth scroll to show results
    requestAnimationFrame(() => {
      container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  };

  // ── Beach Detail Modal (from map) ──────────────────────────────

  function renderBeachSummaryCard(s) {
    const col = scoreColor(s.overall);
    const cond = getWaveCondition(s);
    const wsLabel = getWaveSizeLabel(s.effectiveH);
    return `
      <div class="summary-card">
        <div class="summary-header">
          <div class="rec-score-ring ${col}" style="width:44px;height:44px;font-size:1rem">${s.overall}</div>
          <div>
            <span class="rec-badge ${col}">${scoreLabel(s.overall)}</span>
            <span class="wave-size-tag ${wsLabel.warning ? 'wave-size-warn' : ''}">${wsLabel.emoji} ${wsLabel.label}</span>
          </div>
        </div>
        <div class="wave-snapshot wave-snapshot-sm" style="margin-top:10px">
          <div class="wave-snap-item wave-snap-height">
            <span class="wave-snap-val">${s.effectiveH.toFixed(1)}m</span>
            <span class="wave-snap-lbl">Waves</span>
          </div>
          <div class="wave-snap-item wave-snap-cond ${cond.cls}">
            <span class="wave-snap-val">${cond.emoji} ${cond.label}</span>
            <span class="wave-snap-lbl">Conditions</span>
          </div>
          <div class="wave-snap-item wave-snap-tide">
            <span class="wave-snap-val">${s.tide.trend === 'Rising' ? '↗️' : s.tide.trend === 'Falling' ? '↘️' : '➡️'} ${s.tide.level}</span>
            <span class="wave-snap-lbl">${s.tide.nextLabel || s.tide.label}</span>
          </div>
        </div>
        <div class="summary-details">
          ${windArrow(s.windDir)} ${Math.round(s.windSpeed)}km/h ${degToCompass(s.windDir)} · ⏱️ ${Math.round(s.wavePeriod)}s period · ${weatherIcon(s.weatherCode)} ${Math.round(s.temp)}°C
        </div>
      </div>`;
  }

  window.openBeachModal = function (beachId) {
    haptic(15); playClick();
    const beach = BEACHES.find(b => b.id === beachId);
    if (!beach) return;

    const nowIdx = getCurrentHourIndex(state.weather);
    const nowScore = scoreBeach(beach, nowIdx, state.weather, state.marine, state.mode);

    const today = new Date().toISOString().slice(0, 10);
    const todayScores = (state.scores || []).filter(s => s.beach.id === beachId && s.time.startsWith(today));
    const bestToday = todayScores.length ? [...todayScores].sort((a, b) => b.overall - a.overall)[0] : null;

    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    const tmrwStr = tmrw.toISOString().slice(0, 10);
    const tmrwScores = (state.scores || []).filter(s => s.beach.id === beachId && s.time.startsWith(tmrwStr));
    const bestTmrw = tmrwScores.length ? [...tmrwScores].sort((a, b) => b.overall - a.overall)[0] : null;

    const laterScores = (state.scores || []).filter(s =>
      s.beach.id === beachId && !s.time.startsWith(today) && !s.time.startsWith(tmrwStr)
    );
    const bestLater = laterScores.length ? [...laterScores].sort((a, b) => b.overall - a.overall)[0] : null;

    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${beach.lat},${beach.lng}&origin=-38.352,144.296`;
    const explanation = generateExplanation(nowScore, state.mode);

    document.getElementById('beach-modal-title').textContent = `🏖️ ${beach.name}`;
    document.getElementById('beach-modal-body').innerHTML = `
      <p class="beach-modal-about">${beach.description}</p>
      <div class="beach-modal-tags">
        <span class="beach-tag">${beach.type}</span>
        <span class="beach-tag">${beach.bottom}</span>
        <span class="beach-tag">🚗 ${beach.driveMinutes} min from Jan Juc</span>
        <span class="beach-tag">Faces ${degToCompass(beach.facing)}</span>
      </div>

      <div class="beach-summary-block">
        <h3>🏄 Right Now</h3>
        ${renderBeachSummaryCard(nowScore)}
      </div>

      ${bestToday ? `
      <div class="beach-summary-block">
        <h3>☀️ Best Today <span class="summary-time">at ${formatHour(bestToday.time)}</span></h3>
        ${renderBeachSummaryCard(bestToday)}
      </div>` : ''}

      ${bestTmrw ? `
      <div class="beach-summary-block">
        <h3>📅 Tomorrow <span class="summary-time">at ${formatHour(bestTmrw.time)}</span></h3>
        ${renderBeachSummaryCard(bestTmrw)}
      </div>` : ''}

      ${bestLater ? `
      <div class="beach-summary-block">
        <h3>🌟 Best Upcoming <span class="summary-time">${formatDay(bestLater.time)} at ${formatHour(bestLater.time)}</span></h3>
        ${renderBeachSummaryCard(bestLater)}
      </div>` : ''}

      <div class="rec-explanation" style="border-radius:var(--radius-sm);margin-bottom:12px">${explanation}</div>
      ${(() => { const eat = getEat(beach.id); return eat ? `<div class="eat-recommendation" style="margin-bottom:12px"><span class="eat-emoji">${eat.emoji}</span><div><span class="eat-name">${eat.name}</span><span class="eat-desc">${eat.desc}</span></div></div>` : ''; })()}
      ${(() => { const m = getRandomMovie(); return `<div class="eat-recommendation movie-rec" style="margin-bottom:12px"><span class="eat-emoji">🎬</span><div><span class="eat-name">${m.title} (${m.year})</span><span class="eat-desc">${m.desc} · <em>${m.stream}</em></span></div></div>`; })()}
      <a href="${mapsUrl}" target="_blank" rel="noopener" class="nav-btn">📍 Navigate from Jan Juc</a>
    `;

    document.getElementById('beach-modal').classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  window.closeBeachModal = function () {
    document.getElementById('beach-modal').classList.remove('open');
    document.body.style.overflow = '';
  };


  // ── Mode toggle ────────────────────────────────────────────────
  function setupModeToggle() {
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        if (mode === state.mode) return;
        state.mode = mode;
        document.body.classList.toggle('surfer-mode', mode === 'surfer' || mode === 'logger');
        document.body.classList.toggle('logger-mode', mode === 'logger');
        haptic([15, 50, 15]);
        playModeSwitch(mode === 'surfer' || mode === 'logger');
        document.querySelectorAll('.mode-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.mode === mode);
          b.setAttribute('aria-pressed', b.dataset.mode === mode);
        });
        refreshUI();
      });
    });
  }

  // ── Refresh UI with current data ───────────────────────────────
  function refreshUI() {
    if (!state.weather || !state.marine) return;

    const allScores = computeAllScores();
    state.scores = allScores;

    // Current scores for "right now"
    const nowIdx = getCurrentHourIndex(state.weather);
    state.currentScores = BEACHES.map(b =>
      scoreBeach(b, nowIdx, state.weather, state.marine, state.mode)
    );

    state.goNow = getGoNow(allScores) ||
      ([...state.currentScores].sort((a, b) => b.overall - a.overall)[0]);
    state.bestTodayList = getBestToday(allScores);
    state.nextDaysList = getNextDays(allScores);

    renderChoiceCards();
    updateMapMarkers(state.currentScores);
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
            <span class="spot-group-chevron">▼</span>
          </button>
          <div class="spot-group-body open">
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

  function renderExtrasContent(el) {
    cleanupExtrasMaps();
    const section = el || document.getElementById('extras-section');
    if (!section) return;

    const tabs = [
      { id: 'movies', icon: '🎬', label: 'Surf Movies' },
      { id: 'snorkel', icon: '🤿', label: 'Snorkelling' },
      { id: 'deeper', icon: '🗺️', label: 'Go Deeper' },
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
      html += `<div class="movie-grid" id="movie-list">`;
      html += SURF_MOVIES.map((m, i) => `
        <div class="movie-card${i >= 5 ? ' movie-hidden' : ''}">
          <div class="movie-rank">#${i + 1}</div>
          <div class="movie-info">
            <strong>${m.title}</strong>
            <span class="movie-year">${m.year}</span>
            <p>${m.desc}</p>
            <span class="movie-stream">📺 ${m.stream}</span>
          </div>
        </div>
      `).join('');
      html += `</div>`;
      html += `<button class="movie-toggle-btn" id="movie-toggle" onclick="toggleMovieList()">Show all 20 movies ▼</button>`;
    } else if (extrasTab === 'snorkel') {
      html += `<p class="section-subtitle">When the surf's flat or you just want to explore under the surface.</p>`;
      html += renderGroupedSpots(SNORKEL_SPOT_GROUPS, SNORKEL_SPOTS, 'snorkel');
    } else if (extrasTab === 'deeper') {
      html += `<p class="section-subtitle">The local breaks, secret reefs and hidden gems that don't make the tourist maps.</p>`;
      html += renderGroupedSpots(SECRET_SPOT_GROUPS, SECRET_SPOTS, 'deeper');
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

  // ── Initialisation ─────────────────────────────────────────────
  async function init() {
    setupModeToggle();

    try {
      const [weather, marine] = await Promise.all([fetchWeather(), fetchMarine()]);
      state.weather = weather;
      // Marine API returns array for batch request
      state.marine = Array.isArray(marine) ? marine : [marine];

      // Hide loading, show content
      document.getElementById('loading').style.display = 'none';
      document.getElementById('app-content').style.display = 'block';

      // Init map
      initMap();

      // Render everything
      refreshUI();
      renderExtras();

      // Update timestamp
      document.getElementById('last-updated').textContent =
        `Updated ${new Date().toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit', hour12: true })}`;

    } catch (err) {
      console.error('Init error:', err);
      document.getElementById('loading').style.display = 'none';
      document.getElementById('error-screen').style.display = 'flex';
      document.getElementById('error-message').textContent = err.message || 'Unable to load surf data.';
    }
  }

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  // Go
  init();
})();
