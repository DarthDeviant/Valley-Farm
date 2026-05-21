/* ═══════════════════════════════════════════════════════════════════════
   🍂  THE FALL TOWN UPDATE  —  Valley Farm v2.0.0
   ═══════════════════════════════════════════════════════════════════════
   Self-contained patch. Add to index.html AFTER script.js:
     <script src="fall_town.js" defer></script>

   What's new:
     • Explorable Harvest Town with 9 distinct areas
     • 6 unique NPCs with schedules, dialogue & friendship system
     • Quest Board (daily + weekly quests with gold & friendship rewards)
     • Cooking System (8 recipes, energy restore, farming buffs)
     • Artisan Preservation (8 preserved goods, 2–3× sell value)
     • Museum Donations (18 unique items, milestone rewards & lore unlocks)
     • Harvest Festival + Night Market (Fall seasonal events)
     • World Lore (4 atmospheric story fragments)
     • Falling leaf particles + cozy Fall glow (season-aware)
     • Buff indicators in HUD
   ═══════════════════════════════════════════════════════════════════════ */
(function FallTownUpdate() {
  'use strict';

  /* ── Wait for the game engine to be ready ── */
  /* NOTE: G is always defined (let G = {} in script.js), so we must also
     check G.si is a valid number — that only becomes true after initState()
     or loadState() runs on login. Without this, boot() fires immediately at
     page load with G = {} (season() returns undefined, openTownScreen not
     yet assigned), causing the three init bugs fixed in falltownpatch.json. */
  function whenReady(fn) {
    if (typeof G !== 'undefined' && typeof G.si === 'number' &&
        typeof toast === 'function' &&
        typeof snd === 'function' && typeof season === 'function') {
      fn();
    } else {
      setTimeout(() => whenReady(fn), 200);
    }
  }
  whenReady(boot);

  /* ══════════════════════════════════════════════════════════
     DATA — NPCS
  ══════════════════════════════════════════════════════════ */
  const TOWN_NPCS = {
    marina: {
      name: 'Marina', icon: '👩‍🍳', job: 'Baker',
      trait: 'Warm, chatty, and perpetually flour-dusted.',
      location: '☕ Cozy Café',
      gifts: ['strawberry', 'blueberry', 'melon'],
      dialogue: {
        base: [
          'Morning! Fresh honey rolls just out of the oven. 🍞',
          'You know what pairs with a rainy day? My pumpkin scones. 🎃',
          'I\'ve been testing a new jam recipe — your berries would be perfect.',
          'The smell of bread baking always makes me feel safe.',
          'I opened the café windows today. The whole square smells like cinnamon now.',
        ],
        fall: [
          'Fall is my favourite baking season. Everything tastes warmer. 🍂',
          'I need pumpkins for the Harvest Festival pie contest. Can you help me?',
          'The leaves are golden as my pastries this time of year. Almost.',
          'I\'m making cranberry scones for the Night Market. Recipe\'s a secret. 🤫',
        ],
        friend: [
          'I saved a special recipe just for you. Take it — you\'ve earned it. 🎁',
          'You\'re my favourite customer. Don\'t tell Petra I said that.',
          'Come by anytime. There\'s always something warm on the counter for you.',
        ],
      },
    },
    eli: {
      name: 'Eli', icon: '🧑‍🔧', job: 'Blacksmith',
      trait: 'Gruff but fair. Heart of gold beneath the soot.',
      location: '⚒️ Blacksmith',
      gifts: ['potato', 'corn', 'yam'],
      dialogue: {
        base: [
          'Hmph. Good tools don\'t sharpen themselves, you know.',
          'Good steel takes patience. So does good farming.',
          'I respect anyone who works with their hands.',
          'Don\'t bother me when I\'m at the forge. Come back in an hour.',
          'The fire needs tending before conversation. Give me a moment.',
        ],
        fall: [
          'I\'m forging lanterns for the festival. Finest metalwork in the valley.',
          'The chill in the air is good for tempering. Fall is my season.',
          'I fixed three ploughs this week. Harvest time is busy for everyone.',
        ],
        friend: [
          '…I made something for you. Don\'t read too much into it.',
          'I don\'t say this often. You\'re alright, farmer.',
          'I\'ll keep your tools sharp. You keep farming well. Deal.',
        ],
      },
    },
    nora: {
      name: 'Nora', icon: '🧓', job: 'Museum Curator',
      trait: 'Scholarly, dreamy, obsessed with the valley\'s hidden past.',
      location: '🏛️ Museum',
      gifts: ['mushroom', 'cranberry', 'garlic'],
      dialogue: {
        base: [
          'Every artefact tells a story. Even your vegetables!',
          'There was once a great mine in this valley. Long forgotten now…',
          'I found old journals in the cellar last week. Fascinating reading.',
          'Please — bring me anything curious you find. Even odd-shaped crops.',
          'The history of this valley goes back further than anyone realises.',
        ],
        fall: [
          'The harvest was sacred to the original settlers here. Did you know?',
          'Old records mention a lantern festival. Perhaps we can revive it.',
          'I found a journal entry about the autumn fog. It was called "the valley\'s breath."',
        ],
        friend: [
          'You\'ve helped build something real here. The museum lives because of you.',
          'I always save the most interesting finds to show you first.',
          'Come see the new display. I named one exhibit after you — quietly.',
        ],
      },
    },
    theo: {
      name: 'Theo', icon: '🎵', job: 'Wandering Musician',
      trait: 'Carefree, ageless, and impossible to predict.',
      location: '🌳 Town Square',
      gifts: ['tulip', 'strawberry', 'melon'],
      dialogue: {
        base: [
          'Every town has a song. I\'m still learning yours.',
          'The wind through the wheat — that\'s real music. 🌾',
          'I was in three different towns last week. This one has something special.',
          'The seasons change the melody of this valley. Have you noticed?',
          'I\'ll be here until the wind calls me elsewhere. Could be tomorrow. Could be years.',
        ],
        fall: [
          'In fall, everything gets quieter and deeper. Even the music.',
          'I\'m composing something for the Night Market. Come hear it. 🎶',
          'There\'s an old harvest song the villagers used to sing. I\'ve been trying to remember the words…',
          'The leaves remind me of notes falling. Strange thought, maybe.',
        ],
        friend: [
          'I wrote a song about your farm. Want to hear a few bars? 🎶',
          'You\'re one of the few people I always want to return to. That matters.',
          'I\'ll play at your farm someday. When the light is right.',
        ],
      },
    },
    petra: {
      name: 'Petra', icon: '🧑‍🌾', job: 'Rival Farmer',
      trait: 'Fiercely competitive, secretly rooting for you.',
      location: '🏪 General Store',
      gifts: ['pumpkin', 'sunflower', 'corn'],
      dialogue: {
        base: [
          'My turnips are bigger than yours. Just stating facts.',
          'Don\'t get comfortable — I\'m catching up fast.',
          'I upgraded my irrigation last week. How\'s your farm looking?',
          'Fair warning: I\'m entering the Harvest Festival contest too. 🏆',
          'I admire your work ethic. Doesn\'t mean I\'ll go easy on you.',
        ],
        fall: [
          'My pumpkins this year? Enormous. Absolutely enormous.',
          'May the best farmer win at the Harvest Festival. That\'d be me.',
          'I\'ve been drying herbs all week. The whole barn smells amazing.',
        ],
        friend: [
          'Okay, fine — your crops are impressive. Don\'t let it go to your head.',
          'I\'d rather compete against you than anyone else in the valley. You raise the bar.',
          'Friends who farm together, grow together. I think I read that on a seed packet.',
        ],
      },
    },
    sam: {
      name: 'Sam', icon: '🧑‍🎣', job: 'Fisherman',
      trait: 'Patient, philosophical, and full of tall tales.',
      location: '🐟 Fish Shop',
      gifts: ['mushroom', 'carrot', 'cranberry'],
      dialogue: {
        base: [
          'The river knows things. You just have to listen long enough.',
          'I\'ve been fishing this river for forty years. She still surprises me.',
          'A man who can wait can catch anything. Or grow anything, I suppose.',
          'Strange fog this morning. The fish go deep on days like this.',
          'The best things in life require patience. Crops, fish, and people.',
        ],
        fall: [
          'The salmon run in fall. Makes the whole river smell alive. 🐟',
          'I once caught a fish so big it capsized my boat. True story. Mostly.',
          'Fall fishing is the finest kind. Crisp air, coloured leaves, big fish.',
          'The river turns copper in autumn. I never get tired of it.',
        ],
        friend: [
          'Here — take my lucky lure. It\'s brought me forty years of good catches.',
          'I don\'t share my favourite spots with just anyone. Come find me before dawn.',
          'You remind me of myself when I was young. Except you\'re better at farming.',
        ],
      },
    },
  };

  /* ══════════════════════════════════════════════════════════
     DATA — QUEST POOL
  ══════════════════════════════════════════════════════════ */
  const QUEST_POOL = [
    // — Daily quests —
    { id:'q_parsnip_5',  npc:'marina', title:'Pie Filling Needed',     icon:'🥧', type:'daily',
      desc:'Marina needs 5 parsnips for her famous root-vegetable pie.',
      req:{ parsnip:5  }, reward:{ gold:120, friendship:{ marina:1 } } },
    { id:'q_corn_3',     npc:'petra',  title:'Corn Delivery',           icon:'🌽', type:'daily',
      desc:'Petra wants 3 corn cobs to test a new drying recipe.',
      req:{ corn:3    }, reward:{ gold:180, friendship:{ petra:1  } } },
    { id:'q_mushroom_4', npc:'nora',   title:'Museum Specimen',         icon:'🍄', type:'daily',
      desc:'Nora wants 4 mushrooms for a new natural history exhibit.',
      req:{ mushroom:4 }, reward:{ gold:150, friendship:{ nora:1   } } },
    { id:'q_carrot_6',   npc:'sam',    title:'Fish Bait Carrots',       icon:'🥕', type:'daily',
      desc:"Sam swears river trout love the smell of carrot. He needs 6.",
      req:{ carrot:6  }, reward:{ gold:140, friendship:{ sam:1    } } },
    { id:'q_blueberry_5',npc:'marina', title:'Blueberry Jam Batch',     icon:'🫐', type:'daily',
      desc:'Marina is making jam this afternoon. She needs 5 blueberries.',
      req:{ blueberry:5 }, reward:{ gold:200, friendship:{ marina:1 } } },
    { id:'q_potato_4',   npc:'eli',    title:'Forge Fuel Stew',         icon:'🥔', type:'daily',
      desc:"Eli claims potato stew keeps him going all day at the forge. 4 please.",
      req:{ potato:4  }, reward:{ gold:160, friendship:{ eli:1    } } },
    { id:'q_garlic_5',   npc:'nora',   title:'Herb Archive',            icon:'🧄', type:'daily',
      desc:'Nora is documenting old cultivar varieties. She needs 5 garlic.',
      req:{ garlic:5  }, reward:{ gold:170, friendship:{ nora:1   } } },
    { id:'q_eggplant_3', npc:'sam',    title:'Fishing Trip Snacks',     icon:'🍆', type:'daily',
      desc:"Sam's going on a long trip. 3 eggplants for the road.",
      req:{ eggplant:3 }, reward:{ gold:190, friendship:{ sam:1    } } },
    { id:'q_tulip_4',    npc:'theo',   title:'Stage Decoration',        icon:'🌷', type:'daily',
      desc:'Theo wants tulips to decorate his performance corner in the square.',
      req:{ tulip:4   }, reward:{ gold:130, friendship:{ theo:1   } } },
    { id:'q_strawberry_5',npc:'theo',  title:'Sweet Treat',             icon:'🍓', type:'daily',
      desc:'Theo found a street vendor who loves strawberries. 5 please!',
      req:{ strawberry:5 }, reward:{ gold:250, friendship:{ theo:1  } } },
    { id:'q_yam_3',      npc:'marina', title:'Candied Yam Order',       icon:'🍠', type:'daily',
      desc:'A café customer placed a special order. Marina needs 3 yams.',
      req:{ yam:3     }, reward:{ gold:165, friendship:{ marina:1 } } },
    // — Weekly quests (bigger rewards) —
    { id:'q_pumpkin_2',  npc:'marina', title:'Festival Pumpkins',       icon:'🎃', type:'weekly', seasons:['Fall'],
      desc:'Marina needs 2 pumpkins for the Harvest Festival pie contest.',
      req:{ pumpkin:2 }, reward:{ gold:280, friendship:{ marina:2 } } },
    { id:'q_sunflower_3',npc:'petra',  title:'Sunflower Oil Press',     icon:'🌻', type:'weekly',
      desc:'Petra is pressing sunflower oil for competition. 3 sunflowers.',
      req:{ sunflower:3 }, reward:{ gold:240, friendship:{ petra:2  } } },
    { id:'q_cranberry_3',npc:'sam',    title:'River Offering',          icon:'🍒', type:'weekly', seasons:['Fall'],
      desc:"Sam leaves cranberries by the river for luck. Won't say more.",
      req:{ cranberry:3 }, reward:{ gold:320, friendship:{ sam:2    } } },
    { id:'q_yam_4',      npc:'eli',    title:"Smith's Dinner",          icon:'🍠', type:'weekly',
      desc:"Eli is hosting a rare dinner for old friends. He needs 4 yams.",
      req:{ yam:4     }, reward:{ gold:220, friendship:{ eli:2    } } },
    { id:'q_pepper_4',   npc:'marina', title:'Autumn Chilli',           icon:'🌶️', type:'weekly', seasons:['Fall'],
      desc:"Marina is making a spicy autumn chilli for the Night Market. 4 peppers!",
      req:{ pepper:4  }, reward:{ gold:250, friendship:{ marina:2 } } },
    { id:'q_melon_2',    npc:'theo',   title:'Stage Refreshments',      icon:'🍈', type:'weekly',
      desc:"Theo wants to offer melon to the crowd. It's a showbiz thing.",
      req:{ melon:2   }, reward:{ gold:260, friendship:{ theo:2   } } },
  ];

  /* ══════════════════════════════════════════════════════════
     DATA — COOKING RECIPES
  ══════════════════════════════════════════════════════════ */
  const RECIPES = {
    pumpkin_soup:    { name:'Pumpkin Soup',       icon:'🎃', energy:30, buff:'growth',  buffDesc:'+20% faster crop growth today',         ingredients:{ pumpkin:1              }, sellValue:200 },
    mushroom_stew:   { name:'Mushroom Stew',       icon:'🍄', energy:25, buff:'harvest', buffDesc:'+20% chance of double harvest today',    ingredients:{ mushroom:2             }, sellValue:160 },
    berry_jam_toast: { name:'Berry Jam Toast',     icon:'🍓', energy:20, buff:'luck',    buffDesc:'+15% chance of bonus crop yield',        ingredients:{ strawberry:2,blueberry:1}, sellValue:220 },
    harvest_pie:     { name:'Harvest Pie',         icon:'🥧', energy:45, buff:'stamina', buffDesc:'+40 max energy for the day',             ingredients:{ pumpkin:1,corn:1,carrot:1}, sellValue:450 },
    corn_chowder:    { name:'Corn Chowder',        icon:'🌽', energy:30, buff:'growth',  buffDesc:'+15% faster crop growth today',          ingredients:{ corn:2,potato:1        }, sellValue:280 },
    garlic_broth:    { name:'Garlic Herb Broth',   icon:'🧄', energy:18, buff:null,      buffDesc:'Restores 18 energy, nothing more.',      ingredients:{ garlic:2               }, sellValue:120 },
    cranberry_tea:   { name:'Cranberry Tea',       icon:'🍒', energy:35, buff:'luck',    buffDesc:'+25% chance of bonus crop yield today',  ingredients:{ cranberry:2            }, sellValue:350 },
    stuffed_pepper:  { name:'Stuffed Pepper',      icon:'🌶️', energy:28, buff:'stamina', buffDesc:'+25 max energy for the day',            ingredients:{ pepper:1,tomato:1      }, sellValue:300 },
  };

  /* ══════════════════════════════════════════════════════════
     DATA — PRESERVATION RECIPES
  ══════════════════════════════════════════════════════════ */
  const PRESERVED = {
    pickled_carrot:   { name:'Pickled Carrots',         icon:'🥕', base:'carrot',    baseNeeded:3, sellMult:2.2, desc:'Sharp and tangy. Sells above the fresh price.' },
    berry_jam:        { name:'Berry Jam',               icon:'🍓', base:'strawberry', baseNeeded:4, sellMult:2.5, desc:'Sweet, spreadable, premium artisan value.' },
    pumpkin_butter:   { name:'Pumpkin Butter',          icon:'🎃', base:'pumpkin',   baseNeeded:2, sellMult:2.8, desc:'A fall delicacy. Very loved at market.' },
    dried_mushrooms:  { name:'Dried Mushrooms',         icon:'🍄', base:'mushroom',  baseNeeded:5, sellMult:2.0, desc:'Concentrated flavour. Sought-after ingredient.' },
    blueberry_jam:    { name:'Blueberry Jam',           icon:'🫐', base:'blueberry', baseNeeded:5, sellMult:2.4, desc:'Deep and sweet. A market favourite.' },
    cranberry_sauce:  { name:'Cranberry Sauce',         icon:'🍒', base:'cranberry', baseNeeded:4, sellMult:3.0, desc:'Tart and jewel-bright. Festival staple.' },
    garlic_vinegar:   { name:'Garlic Vinegar',          icon:'🧄', base:'garlic',    baseNeeded:4, sellMult:1.8, desc:"Sharp and aromatic. A chef's secret weapon." },
    candied_yam:      { name:'Candied Yam Preserve',    icon:'🍠', base:'yam',       baseNeeded:3, sellMult:2.3, desc:'Sweet and golden. Sells well in all seasons.' },
  };

  /* ══════════════════════════════════════════════════════════
     DATA — MUSEUM
  ══════════════════════════════════════════════════════════ */
  const MUSEUM_CATS = {
    crops:      { label:'Rare Crops',       icon:'🌾', items:['cauliflower','melon','strawberry','blueberry','cranberry','pumpkin','corn','sunflower'] },
    fungi:      { label:'Fungi & Herbs',    icon:'🍄', items:['mushroom','garlic','tulip'] },
    roots:      { label:'Root Vegetables',  icon:'🥕', items:['parsnip','carrot','potato','yam','eggplant'] },
    nightshades:{ label:'Nightshades',      icon:'🌶️', items:['tomato','pepper'] },
  };
  const ALL_MUSEUM_ITEMS = Object.values(MUSEUM_CATS).flatMap(c => c.items);

  const MUSEUM_MILESTONES = [
    { at:3,  gold:200,  text:'Recipe unlocked: Mushroom Stew 🍄',       lore:null },
    { at:6,  gold:400,  text:'Recipe unlocked: Harvest Pie 🥧',          lore:null },
    { at:10, gold:600,  text:'Lore discovered: The Lost Mineshaft ⛏️',    lore:'mineshaft' },
    { at:14, gold:900,  text:'Lore discovered: The River\'s Gift 🌊',     lore:'river_legend' },
    { at:18, gold:2000, text:'🏆 Museum Complete! Legendary Farmer!',     lore:'theo_mystery' },
  ];

  /* ══════════════════════════════════════════════════════════
     DATA — FESTIVALS
  ══════════════════════════════════════════════════════════ */
  const FESTIVALS = {
    harvest: {
      name:'🍂 Harvest Festival', season:'Fall', startDay:14, endDay:16,
      desc:'The whole town gathers to celebrate the harvest. Pie contests, lanterns, and warm cider.',
      activities:[
        { id:'pie_contest',   label:'🥧 Enter Pie Contest',     desc:'Bake a pumpkin pie and compete for the blue ribbon!',  cost:{ pumpkin:2 },           goldCost:0,   reward:600,  friendBonus:{} },
        { id:'lantern_walk',  label:'🏮 Join Lantern Walk',      desc:'Walk through town with glowing lanterns. Everyone loves it.', cost:{},               goldCost:0,   reward:0,    friendBonus:{ marina:2,eli:1,nora:1,theo:2,petra:1,sam:2 } },
        { id:'cider_stall',   label:'🍎 Help at Cider Stall',   desc:'Help press apple cider for the crowd. Earn your share.',  cost:{ corn:3 },            goldCost:0,   reward:300,  friendBonus:{ marina:1 } },
      ],
    },
    night_market: {
      name:'🌕 Night Market', season:'Fall', startDay:24, endDay:26,
      desc:'The last market before winter. Lanterns float, Theo plays, and rare goods change hands.',
      activities:[
        { id:'theo_concert',  label:'🎵 Listen to Theo\'s Concert', desc:'Theo performs under the moon. A moment you won\'t forget.', cost:{},             goldCost:0,   reward:80,   friendBonus:{ theo:3 } },
        { id:'rare_seeds',    label:'🌱 Buy Rare Seeds Bundle',     desc:'A traveling merchant sells a mysterious mix of seeds.',   cost:{},                goldCost:500, reward:0,    friendBonus:{} },
        { id:'help_petra',    label:'🌽 Help Petra\'s Stand',       desc:"Petra runs a corn stand. Helping her earns goodwill.",     cost:{ corn:5 },        goldCost:0,   reward:350,  friendBonus:{ petra:3 } },
      ],
    },
  };

  /* ══════════════════════════════════════════════════════════
     DATA — WORLD LORE
  ══════════════════════════════════════════════════════════ */
  const LORE = [
    { id:'festival_origin', icon:'🏮', title:'Origin of the Lantern Festival',
      text:'The Lantern Festival began as a way to guide lost harvest spirits home. Farmers lit a path from field to town — one lantern per crop harvested that year. The oldest lanterns in the museum cellar still bear faint scorch marks.',
      unlockDefault: true },
    { id:'theo_mystery',    icon:'🎵', title:'The Musician Who Never Ages',
      text:"Old-timers claim a musician matching Theo's description visited this valley fifty years ago. He plays the same songs. He looks exactly the same in photographs from 1974 that Nora found behind the museum staircase. Theo just smiles when asked.",
      unlockDefault: false },
    { id:'mineshaft',       icon:'⛏️', title:'The Lost Mineshaft',
      text:"Old records speak of a silver mine east of town, sealed after a collapse in 1887. Seventeen miners went in. Seventeen came out — but one of them refused to speak again for seven years. The shaft entrance is rumoured to be somewhere beneath the Hill Farm.",
      unlockDefault: false },
    { id:'river_legend',    icon:'🌊', title:'The River\'s Gift',
      text:"Sam's grandfather claimed the river ran gold-tinted in autumn, carrying mineral silt from an upstream source no surveyor has ever found. The local name for that reach of the river is still 'The Giving Stretch.' Sam knows where it is. He hasn't told anyone.",
      unlockDefault: false },
  ];

  /* ══════════════════════════════════════════════════════════
     STATE INITIALISATION
  ══════════════════════════════════════════════════════════ */
  function initTownState() {
    if (!G.town) G.town = {};
    const T = G.town;
    if (!T.friendship)      T.friendship      = {};
    if (!T.lastTalked)      T.lastTalked      = {};
    if (!T.questBoard)      T.questBoard      = [];
    if (!T.completedToday)  T.completedToday  = [];
    if (!T.activeBuffs)     T.activeBuffs     = {};
    if (!T.museumDonated)   T.museumDonated   = [];
    if (!T.museumMilestones)T.museumMilestones= [];
    if (!T.festivalsDone)   T.festivalsDone   = [];
    if (!T.loreDiscovered)  T.loreDiscovered  = ['festival_origin'];
    if (!T.preservedInv)    T.preservedInv    = {};
    if (!T.lastQuestDay)    T.lastQuestDay    = -1;
    // Ensure all NPCs have an entry
    Object.keys(TOWN_NPCS).forEach(k => { if (T.friendship[k] == null) T.friendship[k] = 0; });
    refreshQuestBoard(false);
  }

  /* ══════════════════════════════════════════════════════════
     CSS INJECTION
  ══════════════════════════════════════════════════════════ */
  function injectCSS() {
    if (document.getElementById('fall-town-css')) return;
    const s = document.createElement('style');
    s.id = 'fall-town-css';
    s.textContent = `
/* ─── TOWN SCREEN ─── */
#town-screen{display:none;position:fixed;inset:0;z-index:490;background:var(--bg);flex-direction:column;overflow:hidden}
#town-screen.town-open{display:flex;animation:fdIn .22s ease}
.town-header{background:var(--ui-bg);border-bottom:1.5px solid var(--ui-border);padding:10px 16px;display:flex;align-items:center;gap:10px;flex-shrink:0;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.town-back-btn{background:var(--ui-bg2);border:1.5px solid var(--ui-border);color:var(--text-primary);font-family:'Nunito',sans-serif;font-size:13px;font-weight:700;cursor:pointer;border-radius:8px;padding:7px 14px;transition:all .15s;flex-shrink:0}
.town-back-btn:hover{background:var(--ui-border)}
.town-header-title{font-family:'Baloo 2',cursive;font-size:18px;font-weight:800;color:var(--text-primary);flex:1;text-align:center}
.town-season-tag{font-size:11px;font-weight:700;padding:3px 9px;border-radius:99px;border:1.5px solid;flex-shrink:0}
/* tabs */
.town-tabs{display:flex;gap:0;border-bottom:1.5px solid var(--ui-border);background:var(--ui-bg);overflow-x:auto;flex-shrink:0;scrollbar-width:none}
.town-tabs::-webkit-scrollbar{display:none}
.town-tab-btn{padding:9px 14px;background:none;border:none;border-bottom:2.5px solid transparent;color:var(--text-muted);font-family:'Nunito',sans-serif;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;transition:all .15s}
.town-tab-btn.active{color:var(--text-primary);border-bottom-color:#c2410c}
.town-tab-btn:hover:not(.active){color:var(--text-primary)}
/* body */
.town-body{flex:1;overflow-y:auto;padding:14px 14px 80px}
.town-body::-webkit-scrollbar{width:4px}
.town-body::-webkit-scrollbar-thumb{background:var(--ui-border);border-radius:4px}
/* overview */
.town-map-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px}
.town-area-card{background:var(--ui-bg);border:2px solid var(--ui-border);border-radius:14px;padding:14px 10px;text-align:center;cursor:pointer;transition:all .18s;position:relative}
.town-area-card:hover{border-color:#c2410c;transform:translateY(-2px);box-shadow:0 4px 14px rgba(194,65,12,.15)}
.town-area-card:active{transform:scale(.97)}
.town-area-em{font-size:26px;display:block;margin-bottom:4px}
.town-area-name{font-size:10px;font-weight:800;color:var(--text-primary)}
.town-area-sub{font-size:9px;color:var(--text-muted);margin-top:1px}
.town-area-badge{position:absolute;top:6px;right:6px;background:#c2410c;color:#fff;border-radius:99px;font-size:9px;font-weight:800;padding:1px 5px}
.town-welcome{background:linear-gradient(135deg,#fff7f0,#fef3c7);border:1.5px solid #f97316;border-radius:14px;padding:14px 16px;margin-bottom:14px;display:flex;align-items:center;gap:10px}
body.dark .town-welcome{background:linear-gradient(135deg,#1a0800,#1a1000);border-color:#ea580c}
.town-welcome-text{font-size:12px;color:var(--text-primary);line-height:1.5;flex:1}
.town-welcome-em{font-size:28px;flex-shrink:0}
/* stat row */
.town-stat-row{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px}
.town-stat{background:var(--ui-bg);border:1.5px solid var(--ui-border);border-radius:12px;padding:10px;text-align:center}
.town-stat-val{font-size:20px;font-weight:800;color:#c2410c}
.town-stat-lab{font-size:9px;color:var(--text-muted);font-weight:700;text-transform:uppercase;letter-spacing:.04em;margin-top:2px}
/* npc cards */
.npc-list{display:flex;flex-direction:column;gap:10px}
.npc-card{background:var(--ui-bg);border:1.5px solid var(--ui-border);border-radius:14px;padding:13px 14px;transition:border-color .15s}
.npc-card:hover{border-color:#c2410c}
.npc-top{display:flex;align-items:center;gap:12px;margin-bottom:8px}
.npc-em{font-size:32px;flex-shrink:0}
.npc-name{font-size:14px;font-weight:800;color:var(--text-primary)}
.npc-job{font-size:11px;color:var(--text-muted)}
.npc-loc{font-size:10px;color:var(--text-muted);margin-top:1px}
.npc-trait{font-size:10px;color:var(--text-muted);font-style:italic;margin-bottom:6px}
.friend-bar-wrap{display:flex;align-items:center;gap:6px;margin-bottom:8px}
.friend-bar{flex:1;height:5px;background:var(--ui-border);border-radius:99px;overflow:hidden}
.friend-fill{height:100%;background:linear-gradient(90deg,#f97316,#c2410c);border-radius:99px;transition:width .4s}
.friend-label{font-size:10px;font-weight:700;color:var(--text-muted);white-space:nowrap}
.npc-dialogue{background:var(--ui-bg2);border:1px solid var(--ui-border);border-radius:10px;padding:9px 12px;font-size:12px;color:var(--text-primary);font-style:italic;line-height:1.5;margin-bottom:8px}
.npc-actions{display:flex;gap:6px;flex-wrap:wrap}
.npc-btn{padding:6px 12px;border-radius:8px;border:1.5px solid var(--ui-border);background:var(--ui-bg2);color:var(--text-primary);font-family:'Nunito',sans-serif;font-size:11px;font-weight:700;cursor:pointer;transition:all .14s}
.npc-btn:hover:not(:disabled){border-color:#c2410c;color:#c2410c}
.npc-btn:disabled{opacity:.4;cursor:default}
.npc-btn-gift{border-color:#f97316;color:#c2410c}
body.dark .npc-btn-gift{color:#fb923c;border-color:#ea580c}
/* quest board */
.quest-list{display:flex;flex-direction:column;gap:10px}
.quest-card{background:var(--ui-bg);border:1.5px solid var(--ui-border);border-radius:14px;padding:13px 14px;transition:border-color .15s}
.quest-card.q-done{border-color:#22c55e}
.quest-top{display:flex;align-items:flex-start;gap:10px;margin-bottom:6px}
.quest-icon{font-size:24px;flex-shrink:0}
.quest-title{font-size:13px;font-weight:800;color:var(--text-primary)}
.quest-npc-label{font-size:10px;color:var(--text-muted);margin-top:1px}
.quest-desc{font-size:11px;color:var(--text-muted);line-height:1.4;margin-bottom:8px}
.quest-req{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px}
.q-item{display:flex;align-items:center;gap:4px;padding:3px 8px;background:var(--ui-bg2);border:1px solid var(--ui-border);border-radius:8px;font-size:11px;font-weight:700;color:var(--text-primary)}
.q-item.have{border-color:#22c55e;color:#166534;background:#f0fdf4}
.q-item.need{border-color:#ef4444;color:#991b1b;background:#fff5f5}
body.dark .q-item.have{background:#0a2016;color:#4ade80}
body.dark .q-item.need{background:#2a0a0a;color:#f87171}
.quest-reward-row{font-size:11px;color:var(--text-muted);margin-bottom:8px}
.quest-submit-btn{width:100%;padding:9px;border-radius:10px;border:none;background:linear-gradient(135deg,#f97316,#c2410c);color:#fff;font-family:'Nunito',sans-serif;font-size:13px;font-weight:800;cursor:pointer;transition:all .15s}
.quest-submit-btn:hover:not(:disabled){opacity:.9;transform:translateY(-1px)}
.quest-submit-btn:disabled{background:var(--ui-border);color:var(--text-muted);cursor:default;transform:none}
/* cooking */
.recipe-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
@media(min-width:480px){.recipe-grid{grid-template-columns:repeat(3,1fr)}}
.recipe-card{background:var(--ui-bg);border:1.5px solid var(--ui-border);border-radius:14px;padding:12px 10px;text-align:center;transition:border-color .15s}
.recipe-card.can-cook{border-color:#f97316}
.recipe-em{font-size:28px;display:block;margin-bottom:4px}
.recipe-name{font-size:10px;font-weight:800;color:var(--text-primary);margin-bottom:3px}
.recipe-energy{font-size:10px;color:#f97316;font-weight:700;margin-bottom:3px}
.recipe-buff-desc{font-size:9px;color:var(--text-muted);line-height:1.3;margin-bottom:6px;min-height:24px}
.recipe-ing{font-size:9px;color:var(--text-muted);margin-bottom:8px}
.recipe-cook-btn{width:100%;padding:7px;border-radius:8px;border:none;background:#f97316;color:#fff;font-family:'Nunito',sans-serif;font-size:10px;font-weight:800;cursor:pointer;transition:all .14s}
.recipe-cook-btn:not(:disabled):hover{background:#c2410c}
.recipe-cook-btn:disabled{background:var(--ui-border);color:var(--text-muted);cursor:default}
/* preservation */
.preserve-section-title{font-size:12px;font-weight:800;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin:14px 0 8px;display:flex;align-items:center;gap:5px}
.preserve-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
@media(min-width:480px){.preserve-grid{grid-template-columns:repeat(3,1fr)}}
.preserve-card{background:var(--ui-bg);border:1.5px solid var(--ui-border);border-radius:14px;padding:12px 10px;text-align:center;transition:border-color .15s}
.preserve-card.can-preserve{border-color:#c2410c}
.preserve-em{font-size:24px;display:block;margin-bottom:4px}
.preserve-name{font-size:10px;font-weight:800;color:var(--text-primary);margin-bottom:3px}
.preserve-sell{font-size:10px;color:#f59e0b;font-weight:700;margin-bottom:3px}
.preserve-desc-text{font-size:9px;color:var(--text-muted);line-height:1.3;margin-bottom:6px}
.preserve-btn{width:100%;padding:6px;border-radius:8px;border:none;background:#c2410c;color:#fff;font-family:'Nunito',sans-serif;font-size:10px;font-weight:800;cursor:pointer;transition:all .14s}
.preserve-btn:not(:disabled):hover{background:#9a3412}
.preserve-btn:disabled{background:var(--ui-border);color:var(--text-muted);cursor:default}
.preserve-inv-row{display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:var(--ui-bg);border:1px solid var(--ui-border);border-radius:10px;margin-bottom:6px;font-size:12px;font-weight:700;color:var(--text-primary)}
.p-sell-btn{padding:4px 10px;border-radius:7px;border:1.5px solid #f59e0b;background:#fffbeb;color:#92400e;font-family:'Nunito',sans-serif;font-size:10px;font-weight:700;cursor:pointer;transition:all .14s}
.p-sell-btn:hover{background:#fef3c7}
body.dark .p-sell-btn{background:#1a1000;color:#fbbf24}
/* museum */
.museum-header{background:var(--ui-bg);border:1.5px solid var(--ui-border);border-radius:14px;padding:14px;margin-bottom:12px;display:flex;align-items:center;gap:12px}
.museum-total{font-size:28px;font-weight:800;color:#c2410c}
.museum-total-lab{font-size:10px;color:var(--text-muted);font-weight:700}
.museum-prog-bar{flex:1;height:8px;background:var(--ui-border);border-radius:99px;overflow:hidden}
.museum-prog-fill{height:100%;background:linear-gradient(90deg,#f97316,#c2410c);border-radius:99px;transition:width .5s}
.museum-milestones{display:flex;flex-direction:column;gap:6px;margin-bottom:14px}
.museum-milestone{display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--ui-bg);border:1.5px solid var(--ui-border);border-radius:10px;font-size:11px;font-weight:700;color:var(--text-muted)}
.museum-milestone.done{border-color:#c2410c;color:var(--text-primary);background:#fff7f0}
body.dark .museum-milestone.done{background:#1a0800}
.museum-cat-title{font-size:11px;font-weight:800;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin:12px 0 8px}
.museum-item-grid{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}
.museum-item{display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 6px;border:1.5px solid var(--ui-border);border-radius:10px;background:var(--ui-bg2);width:60px;cursor:pointer;transition:all .15s}
.museum-item.donated{border-color:#c2410c;background:#fff7f0}
body.dark .museum-item.donated{background:#1a0800}
.museum-item:not(.donated):hover{border-color:#c2410c}
.museum-item-em{font-size:20px}
.museum-item-name{font-size:8px;color:var(--text-muted);text-align:center;line-height:1.2}
.museum-item.donated .museum-item-name{color:#c2410c;font-weight:700}
.museum-donate-btn{width:100%;margin-top:2px;padding:3px;border-radius:5px;border:none;background:#c2410c;color:#fff;font-size:8px;font-weight:700;cursor:pointer}
.museum-donate-btn:disabled{background:var(--ui-border);color:var(--text-muted);cursor:default}
/* festival */
.festival-banner{background:linear-gradient(135deg,#c2410c,#9a3412);border-radius:14px;padding:16px;margin-bottom:14px;display:flex;align-items:center;gap:12px;color:#fff}
.festival-banner-em{font-size:36px;flex-shrink:0}
.festival-banner-name{font-size:16px;font-weight:800;margin-bottom:3px}
.festival-banner-desc{font-size:11px;opacity:.85;line-height:1.4}
.festival-banner-date{font-size:10px;opacity:.7;margin-top:4px}
.festival-activity{background:var(--ui-bg);border:1.5px solid var(--ui-border);border-radius:14px;padding:13px 14px;margin-bottom:10px;transition:border-color .15s}
.festival-activity:hover{border-color:#c2410c}
.fest-act-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:5px}
.fest-act-label{font-size:13px;font-weight:800;color:var(--text-primary)}
.fest-act-reward{font-size:11px;font-weight:700;color:#f59e0b}
.fest-act-desc{font-size:11px;color:var(--text-muted);margin-bottom:8px}
.fest-act-btn{width:100%;padding:9px;border-radius:10px;border:none;background:linear-gradient(135deg,#f97316,#c2410c);color:#fff;font-family:'Nunito',sans-serif;font-size:12px;font-weight:800;cursor:pointer;transition:all .15s}
.fest-act-btn:hover:not(:disabled){opacity:.9;transform:translateY(-1px)}
.fest-act-btn:disabled{background:var(--ui-border);color:var(--text-muted);cursor:default;transform:none}
/* lore */
.lore-card{background:var(--ui-bg);border:1.5px solid var(--ui-border);border-radius:14px;padding:13px 14px;margin-bottom:10px}
.lore-card.locked{filter:blur(1.5px);opacity:.45;pointer-events:none}
.lore-top{display:flex;align-items:center;gap:10px;margin-bottom:6px}
.lore-icon{font-size:20px}
.lore-title{font-size:13px;font-weight:800;color:var(--text-primary)}
.lore-text{font-size:12px;color:var(--text-muted);line-height:1.55}
/* HUD town button */
#hud-town-btn{display:flex;align-items:center;gap:4px;background:linear-gradient(135deg,#c2410c,#9a3412);border:1.5px solid #9a3412;border-radius:20px;padding:4px 10px;font-size:11px;font-weight:700;color:#fff;cursor:pointer;white-space:nowrap;font-family:'Nunito',sans-serif;box-shadow:0 2px 8px rgba(194,65,12,.35);transition:opacity .15s,transform .15s;flex-shrink:0}
#hud-town-btn:hover{opacity:.88;transform:scale(1.05)}
#hud-town-btn:active{transform:scale(.95)}
body.dark #hud-town-btn{background:linear-gradient(135deg,#9a3412,#7c2d12);border-color:#7c2d12}
body.retro #hud-town-btn{background:#4a1000!important;border:2px solid #8b2500!important;border-radius:3px!important;font-family:'Press Start 2P',monospace!important;font-size:6.5px!important;box-shadow:none!important;color:#ffd0a0!important;padding:4px 7px!important}
/* Active buff pill */
.town-buff-pill{display:inline-flex;align-items:center;gap:4px;background:#fff7f0;border:1.5px solid #f97316;border-radius:99px;padding:2px 8px;font-size:10px;font-weight:700;color:#c2410c;animation:buffPulse 2s ease-in-out infinite}
body.dark .town-buff-pill{background:#1a0500;color:#fb923c;border-color:#ea580c}
@keyframes buffPulse{0%,100%{opacity:1}50%{opacity:.65}}
/* Falling leaves */
#fall-leaves{pointer-events:none;position:fixed;inset:0;z-index:50;overflow:hidden}
.fall-leaf{position:absolute;top:-30px;animation:leafFall linear infinite;will-change:transform,opacity}
@keyframes leafFall{0%{transform:translateY(0) rotate(0deg) translateX(0);opacity:1}50%{opacity:.75}90%{opacity:.3}100%{transform:translateY(100vh) rotate(380deg) translateX(35px);opacity:0}}
/* Fall atmosphere glow */
#fall-glow{pointer-events:none;position:fixed;inset:0;z-index:1;background:radial-gradient(ellipse 80% 45% at 50% 100%,rgba(194,65,12,.055) 0%,transparent 70%);transition:opacity 1.5s}
/* Section info box */
.town-section-info{font-size:11px;color:var(--text-muted);font-weight:700;margin-bottom:12px;padding:8px 12px;background:var(--ui-bg2);border-radius:10px;border:1px solid var(--ui-border)}
/* Retro overrides */
body.retro #town-screen{background:#120c00}
body.retro .town-header{background:#120c00;border-bottom:3px solid #8b6914}
body.retro .town-header-title{color:#ffd700;font-size:11px;font-family:'Press Start 2P',monospace}
body.retro .town-tab-btn{font-size:7px;font-family:'Press Start 2P',monospace;color:#a1887f}
body.retro .town-tab-btn.active{color:#ffd700;border-bottom-color:#ffd700}
body.retro .npc-card,.npc-card,.quest-card,.recipe-card,.preserve-card,.festival-activity,.lore-card{transition:border-color .15s}
body.retro .npc-name,body.retro .quest-title,body.retro .recipe-name,body.retro .fest-act-label,body.retro .lore-title{font-family:'Press Start 2P',monospace;font-size:7px}
body.retro .quest-submit-btn,body.retro .recipe-cook-btn,body.retro .preserve-btn,body.retro .fest-act-btn{border-radius:2px;font-family:'Press Start 2P',monospace;font-size:7px}
`;
    document.head.appendChild(s);
  }

  /* ══════════════════════════════════════════════════════════
     HTML INJECTION
  ══════════════════════════════════════════════════════════ */
  function injectHTML() {
    // Leaf container
    if (!document.getElementById('fall-leaves')) {
      const lv = document.createElement('div');
      lv.id = 'fall-leaves';
      document.body.appendChild(lv);
    }
    // Fall atmosphere glow
    if (!document.getElementById('fall-glow')) {
      const gw = document.createElement('div');
      gw.id = 'fall-glow';
      gw.style.opacity = '0';
      const gs = document.getElementById('game-screen');
      if (gs) gs.prepend(gw);
    }
    // Town Screen overlay
    if (!document.getElementById('town-screen')) {
      const ts = document.createElement('div');
      ts.id = 'town-screen';
      ts.innerHTML = `
        <div class="town-header">
          <button class="town-back-btn" onclick="closeTownScreen()">← Back to Farm</button>
          <div class="town-header-title">🏘️ Harvest Town</div>
          <div id="town-season-tag" class="town-season-tag" style="border-color:#c2410c;color:#c2410c">🍂 Fall</div>
        </div>
        <div class="town-tabs" id="town-tabs">
          <button class="town-tab-btn active" data-ttab="overview" onclick="setTownTab('overview')">🏘️ Town</button>
          <button class="town-tab-btn" data-ttab="npcs"     onclick="setTownTab('npcs')">👥 Villagers</button>
          <button class="town-tab-btn" data-ttab="quests"   onclick="setTownTab('quests')">📋 Quests</button>
          <button class="town-tab-btn" data-ttab="cooking"  onclick="setTownTab('cooking')">🍳 Cooking</button>
          <button class="town-tab-btn" data-ttab="preserve" onclick="setTownTab('preserve')">🫙 Preserve</button>
          <button class="town-tab-btn" data-ttab="museum"   onclick="setTownTab('museum')">🏛️ Museum</button>
          <button class="town-tab-btn" data-ttab="festival" onclick="setTownTab('festival')">🎉 Festival</button>
          <button class="town-tab-btn" data-ttab="lore"     onclick="setTownTab('lore')">📖 Lore</button>
        </div>
        <div class="town-body" id="town-body"></div>
      `;
      document.body.appendChild(ts);
    }
    // HUD button
    if (!document.getElementById('hud-town-btn')) {
      const btn = document.createElement('button');
      btn.id = 'hud-town-btn';
      btn.title = 'Visit Harvest Town';
      btn.onclick = window.openTownScreen;
      btn.textContent = '🏘️ Town';
      const hud = document.getElementById('hud');
      if (hud) hud.appendChild(btn);
    }
  }

  /* ══════════════════════════════════════════════════════════
     TOWN SCREEN CONTROLLER
  ══════════════════════════════════════════════════════════ */
  let _currentTab = 'overview';

  window.openTownScreen = function () {
    document.getElementById('town-screen').classList.add('town-open');
    _updateSeasonTag();
    setTownTab(_currentTab);
  };

  window.closeTownScreen = function () {
    document.getElementById('town-screen').classList.remove('town-open');
  };

  window.setTownTab = function (tab) {
    _currentTab = tab;
    document.querySelectorAll('.town-tab-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.ttab === tab));
    const body = document.getElementById('town-body');
    if (!body) return;
    switch (tab) {
      case 'overview':  body.innerHTML = _renderOverview();    break;
      case 'npcs':      body.innerHTML = _renderNPCs();        break;
      case 'quests':    body.innerHTML = _renderQuests();      break;
      case 'cooking':   body.innerHTML = _renderCooking();     break;
      case 'preserve':  body.innerHTML = _renderPreservation();break;
      case 'museum':    body.innerHTML = _renderMuseum();      break;
      case 'festival':  body.innerHTML = _renderFestival();    break;
      case 'lore':      body.innerHTML = _renderLore();        break;
    }
  };

  function _updateSeasonTag() {
    const tag = document.getElementById('town-season-tag');
    if (!tag) return;
    const s = season();
    const icons  = { Spring:'🌸', Summer:'☀️', Fall:'🍂', Winter:'❄️' };
    const colors = { Spring:'#16a34a', Summer:'#d97706', Fall:'#c2410c', Winter:'#0369a1' };
    tag.textContent = (icons[s] || '🍂') + ' ' + s;
    tag.style.borderColor = colors[s] || '#c2410c';
    tag.style.color       = colors[s] || '#c2410c';
  }

  /* ══════════════════════════════════════════════════════════
     RENDER — OVERVIEW
  ══════════════════════════════════════════════════════════ */
  const TOWN_AREAS = [
    { em:'☕', name:'Cozy Café',    sub:'Marina bakes here',     tab:'npcs' },
    { em:'🛒', name:'Market',       sub:'Trade goods',            tab:'quests' },
    { em:'⚒️', name:'Blacksmith',   sub:"Eli's forge",            tab:'npcs' },
    { em:'🐟', name:'Fish Shop',    sub:"Sam's fresh catch",      tab:'npcs' },
    { em:'🏛️', name:'Museum',       sub:"Nora's collection",      tab:'museum' },
    { em:'📋', name:'Quest Board',  sub:'Daily requests',         tab:'quests', badgeKey:'quests' },
    { em:'🎪', name:'Festival Area',sub:'Seasonal events',        tab:'festival' },
    { em:'🌳', name:'Town Square',  sub:'Theo plays here',        tab:'npcs' },
    { em:'🫙', name:'Artisan Shop', sub:'Preserved goods',        tab:'preserve' },
  ];

  function _renderOverview() {
    const T = G.town;
    const s = season();
    const greetings = {
      Fall:   '🍂 The air smells of woodsmoke and harvest. Coloured leaves drift past. The whole valley feels golden.',
      Spring: '🌸 Blossoms float through the town square. The villagers are bright-eyed. There\'s planting in the air.',
      Summer: '☀️ The town shimmers in golden heat. Marina sells cold drinks at the café. Sam swears the fishing is exceptional.',
      Winter: '❄️ Lanterns glow warmly along cobblestones. Quieter, but no less welcoming. Cozy fires burn in every window.',
    };

    const pendingQuests = (T.questBoard || []).filter(q =>
      !T.completedToday.includes(q.id)).length;

    const areaCards = TOWN_AREAS.map(a => {
      const badge = a.badgeKey === 'quests' && pendingQuests > 0
        ? `<div class="town-area-badge">${pendingQuests}</div>` : '';
      return `<div class="town-area-card" onclick="setTownTab('${a.tab}')">
        ${badge}
        <span class="town-area-em">${a.em}</span>
        <div class="town-area-name">${a.name}</div>
        <div class="town-area-sub">${a.sub}</div>
      </div>`;
    }).join('');

    // Active buffs
    let buffHtml = '';
    const buffEntries = Object.values(T.activeBuffs || {});
    if (buffEntries.length) {
      buffHtml = `<div style="margin-bottom:12px;padding:10px 12px;background:var(--ui-bg);border:1.5px solid #f97316;border-radius:12px">
        <div style="font-size:11px;font-weight:800;color:#c2410c;margin-bottom:6px">⚡ Active Buffs</div>
        ${buffEntries.map(b => `<span class="town-buff-pill">${b.icon} ${b.name}</span> `).join('')}
      </div>`;
    }

    const donations = (T.museumDonated || []).length;
    const friendTotal = Object.values(T.friendship || {}).reduce((a,b) => a+b, 0);
    const qDone = (T.completedToday || []).length;

    return `
      <div class="town-welcome">
        <span class="town-welcome-em">${{Fall:'🍂',Spring:'🌸',Summer:'☀️',Winter:'❄️'}[s]||'🏘️'}</span>
        <div class="town-welcome-text">${greetings[s] || greetings.Fall}</div>
      </div>
      ${buffHtml}
      <div class="town-map-grid">${areaCards}</div>
      <div class="town-stat-row">
        <div class="town-stat"><div class="town-stat-val">${qDone}</div><div class="town-stat-lab">Quests Done</div></div>
        <div class="town-stat"><div class="town-stat-val">${donations}</div><div class="town-stat-lab">Museum Items</div></div>
        <div class="town-stat"><div class="town-stat-val">${Math.floor(friendTotal)}</div><div class="town-stat-lab">Friendship</div></div>
      </div>
      <div style="font-size:10px;color:var(--text-muted);text-align:center;padding:4px 0">
        💬 Talk to villagers · 📋 Complete quests · 🍳 Cook meals · 🏛️ Donate to the museum
      </div>`;
  }

  /* ══════════════════════════════════════════════════════════
     RENDER — VILLAGERS
  ══════════════════════════════════════════════════════════ */
  function _renderNPCs() {
    const T = G.town;
    const todayKey = (G.day || 1) + '_' + (G.year || 1);
    const s = season();
    return `<div class="npc-list">` + Object.entries(TOWN_NPCS).map(([key, npc]) => {
      const friendship = T.friendship[key] || 0;
      const pct = Math.min(100, (friendship / 10) * 100);
      const lvl = friendship >= 9 ? 'Best Friend ❤️' : friendship >= 6 ? 'Good Friend 💛'
                : friendship >= 3 ? 'Acquaintance 🤝' : 'Stranger 👋';

      // Pick contextual dialogue
      const pool = [
        ...(npc.dialogue.base || []),
        ...(s === 'Fall' ? (npc.dialogue.fall || []) : []),
        ...(friendship >= 6 ? (npc.dialogue.friend || []) : []),
      ];
      const line = pool[Math.floor(Math.random() * pool.length)];
      const alreadyTalked = (T.lastTalked[key] === todayKey);

      // Gift button — show best loved gift in bag
      const bestGift = npc.gifts.find(g => invCount(g) > 0);

      return `<div class="npc-card">
        <div class="npc-top">
          <span class="npc-em">${npc.icon}</span>
          <div>
            <div class="npc-name">${npc.name}</div>
            <div class="npc-job">${npc.job}</div>
            <div class="npc-loc">${npc.location}</div>
          </div>
        </div>
        <div class="npc-trait">${npc.trait}</div>
        <div class="friend-bar-wrap">
          <div class="friend-bar"><div class="friend-fill" style="width:${pct}%"></div></div>
          <div class="friend-label">${lvl} (${friendship.toFixed(1)}/10)</div>
        </div>
        <div class="npc-dialogue">"${line}"</div>
        <div class="npc-actions">
          <button class="npc-btn" onclick="townTalk('${key}')" ${alreadyTalked ? 'disabled' : ''}>
            ${alreadyTalked ? '✓ Talked Today' : '💬 Talk'}
          </button>
          ${bestGift ? `<button class="npc-btn npc-btn-gift" onclick="townGift('${key}','${bestGift}')">
            🎁 Gift ${cropEmoji(bestGift)} (×${invCount(bestGift)})
          </button>` : ''}
        </div>
        ${npc.gifts.length ? `<div style="font-size:10px;color:var(--text-muted);margin-top:6px">💛 Loves: ${npc.gifts.map(cropEmoji).join(' ')}</div>` : ''}
      </div>`;
    }).join('') + `</div>`;
  }

  /* ══════════════════════════════════════════════════════════
     NPC ACTIONS
  ══════════════════════════════════════════════════════════ */
  window.townTalk = function (key) {
    const T = G.town;
    const npc = TOWN_NPCS[key];
    if (!npc) return;
    const todayKey = (G.day || 1) + '_' + (G.year || 1);
    if (T.lastTalked[key] === todayKey) { toast('You already chatted with ' + npc.name + ' today!', 'info'); return; }
    T.lastTalked[key] = todayKey;
    T.friendship[key] = Math.min(10, (T.friendship[key] || 0) + 0.5);
    snd('coin');
    toast('💬 Had a nice chat with ' + npc.name + '! +0.5 friendship 💛', 'success', 2600);
    setTownTab('npcs');
  };

  window.townGift = function (key, cropType) {
    const T = G.town;
    const npc = TOWN_NPCS[key];
    if (!npc || invCount(cropType) < 1) { toast('You don\'t have that item!', 'error'); snd('error'); return; }
    removeInv(cropType, 1);
    const bonus = npc.gifts.includes(cropType) ? 2 : 1;
    T.friendship[key] = Math.min(10, (T.friendship[key] || 0) + bonus);
    snd('levelup');
    toast('🎁 ' + npc.name + ' loved the ' + (CROPS[cropType]?.n || cropType) + '! +' + bonus + ' friendship 💛', 'success', 3200);
    if (typeof renderHUD === 'function') renderHUD();
    setTownTab('npcs');
  };

  /* ══════════════════════════════════════════════════════════
     RENDER — QUEST BOARD
  ══════════════════════════════════════════════════════════ */
  function _renderQuests() {
    const T = G.town;
    refreshQuestBoard(false);
    if (!T.questBoard.length) return `<div style="text-align:center;padding:40px;color:var(--text-muted);font-size:13px;font-weight:700">📋 No quests available. Check back tomorrow!</div>`;

    return `<div class="town-section-info">📋 Daily quests reset each morning. Complete them for gold and friendship rewards!</div>
    <div class="quest-list">${T.questBoard.map(_renderQuestCard).join('')}</div>`;
  }

  function _renderQuestCard(q) {
    const T = G.town;
    const done = T.completedToday.includes(q.id);
    const npc  = TOWN_NPCS[q.npc];
    const canSubmit = !done && Object.entries(q.req || {}).every(([t, n]) => invCount(t) >= n);

    const reqItems = Object.entries(q.req || {}).map(([t, n]) => {
      const have = invCount(t);
      const crop = CROPS[t];
      return `<div class="q-item ${have >= n ? 'have' : 'need'}">${crop?.e || '📦'} ${crop?.n || t} ${have}/${n}</div>`;
    }).join('');

    const rewardParts = [];
    if (q.reward.gold) rewardParts.push('💰 ' + q.reward.gold + 'g');
    if (q.reward.friendship) Object.entries(q.reward.friendship).forEach(([k,p]) => {
      if (TOWN_NPCS[k]) rewardParts.push('💛 +' + p + ' with ' + TOWN_NPCS[k].name);
    });

    return `<div class="quest-card ${done ? 'q-done' : ''}">
      <div class="quest-top">
        <span class="quest-icon">${q.icon}</span>
        <div>
          <div class="quest-title">${q.title}</div>
          <div class="quest-npc-label">${npc?.icon || ''} Requested by ${npc?.name || q.npc} · ${q.type === 'weekly' ? '📅 Weekly' : '🌅 Daily'}</div>
        </div>
      </div>
      <div class="quest-desc">${q.desc}</div>
      <div class="quest-req">${reqItems}</div>
      <div class="quest-reward-row">🎁 Reward: ${rewardParts.join(' · ')}</div>
      ${done
        ? `<div style="text-align:center;font-size:12px;font-weight:800;color:#22c55e;padding:8px">✓ Quest Completed!</div>`
        : `<button class="quest-submit-btn" onclick="townSubmitQuest('${q.id}')" ${canSubmit ? '' : 'disabled'}>
            ${canSubmit ? '✓ Submit Quest' : 'Need More Items'}
          </button>`}
    </div>`;
  }

  window.townSubmitQuest = function (questId) {
    const T = G.town;
    const q = T.questBoard.find(x => x.id === questId);
    if (!q || T.completedToday.includes(q.id)) { toast('Already completed!', 'info'); return; }
    const ok = Object.entries(q.req || {}).every(([t, n]) => invCount(t) >= n);
    if (!ok) { toast('You don\'t have everything needed!', 'error'); snd('error'); return; }
    Object.entries(q.req || {}).forEach(([t, n]) => removeInv(t, n));
    if (q.reward.gold) { G.gold = (G.gold || 0) + q.reward.gold; }
    if (q.reward.friendship) {
      Object.entries(q.reward.friendship).forEach(([k, p]) => {
        T.friendship[k] = Math.min(10, (T.friendship[k] || 0) + p);
      });
    }
    T.completedToday.push(q.id);
    snd('levelup');
    toast('🎉 Quest complete! ' + (q.reward.gold ? '+' + q.reward.gold + 'g ' : '') + '💛', 'success', 3200);
    if (typeof renderHUD === 'function') renderHUD();
    setTownTab('quests');
  };

  /* ══════════════════════════════════════════════════════════
     QUEST BOARD REFRESH
  ══════════════════════════════════════════════════════════ */
  function refreshQuestBoard(force) {
    const T = G.town;
    const todayKey = (G.day || 1) + '_' + (G.year || 1);
    if (!force && T.lastQuestDay === todayKey && T.questBoard.length > 0) return;
    const s = season();
    const daily  = shuffle(QUEST_POOL.filter(q => q.type === 'daily'
      && (!q.seasons || q.seasons.includes(s)))).slice(0, 3);
    const weekly = shuffle(QUEST_POOL.filter(q => q.type === 'weekly'
      && (!q.seasons || q.seasons.includes(s)))).slice(0, 2);
    T.questBoard = [...daily, ...weekly];
    T.completedToday = [];
    T.lastQuestDay = todayKey;
  }

  /* ══════════════════════════════════════════════════════════
     RENDER — COOKING
  ══════════════════════════════════════════════════════════ */
  function _renderCooking() {
    const T = G.town;
    let buffHtml = '';
    const buffs = Object.values(T.activeBuffs || {});
    if (buffs.length) {
      buffHtml = `<div style="margin-bottom:12px;padding:10px 12px;background:#fff7f0;border:1.5px solid #f97316;border-radius:12px">
        <div style="font-size:11px;font-weight:800;color:#c2410c;margin-bottom:5px">⚡ Active Buffs Today</div>
        ${buffs.map(b => `<div style="font-size:11px;color:#c2410c;font-weight:700">${b.icon} ${b.name}: ${b.desc}</div>`).join('')}
      </div>`;
    }
    const cards = Object.entries(RECIPES).map(([key, r]) => {
      const canCook = Object.entries(r.ingredients).every(([t, n]) => invCount(t) >= n);
      const ingList = Object.entries(r.ingredients).map(([t, n]) => {
        const crop = CROPS[t];
        return `${crop?.e || '📦'} ${crop?.n || t}×${n} (have ${invCount(t)})`;
      }).join(', ');
      return `<div class="recipe-card ${canCook ? 'can-cook' : ''}">
        <span class="recipe-em">${r.icon}</span>
        <div class="recipe-name">${r.name}</div>
        <div class="recipe-energy">⚡ +${r.energy} energy</div>
        <div class="recipe-buff-desc">${r.buffDesc || ''}</div>
        <div class="recipe-ing">${ingList}</div>
        <button class="recipe-cook-btn" onclick="townCook('${key}')" ${canCook ? '' : 'disabled'}>
          ${canCook ? '🍳 Cook' : 'Need Ingredients'}
        </button>
      </div>`;
    }).join('');
    return `${buffHtml}
      <div class="town-section-info">🍳 Cook meals from your harvest to restore energy and gain day-long farming buffs!</div>
      <div class="recipe-grid">${cards}</div>`;
  }

  window.townCook = function (key) {
    const T = G.town;
    const r = RECIPES[key];
    if (!r) return;
    const ok = Object.entries(r.ingredients).every(([t, n]) => invCount(t) >= n);
    if (!ok) { toast('Missing ingredients!', 'error'); snd('error'); return; }
    Object.entries(r.ingredients).forEach(([t, n]) => removeInv(t, n));
    // Restore energy
    const me = (typeof maxEnergy === 'function') ? maxEnergy() : 100;
    G.energy = Math.min(me, (G.energy || 0) + r.energy);
    // Apply buff
    if (r.buff) {
      if (!T.activeBuffs) T.activeBuffs = {};
      T.activeBuffs[r.buff] = { icon: r.icon, name: r.name, desc: r.buffDesc, key: r.buff };
    }
    snd('levelup');
    toast('🍳 ' + r.name + ' cooked! +' + r.energy + ' energy' + (r.buff ? ' · ' + r.buffDesc : ''), 'success', 3500);
    if (typeof renderHUD === 'function') renderHUD();
    setTownTab('cooking');
  };

  /* ══════════════════════════════════════════════════════════
     RENDER — PRESERVATION
  ══════════════════════════════════════════════════════════ */
  function _renderPreservation() {
    const T = G.town;
    // Inventory of preserved goods
    const ownedEntries = Object.entries(T.preservedInv || {}).filter(([, q]) => q > 0);
    let invHtml = '';
    if (ownedEntries.length) {
      invHtml = `<div class="preserve-section-title">🫙 Your Preserved Goods</div>`;
      invHtml += ownedEntries.map(([key, qty]) => {
        const p = PRESERVED[key];
        if (!p) return '';
        const sellEach = Math.round((CROPS[p.base]?.sell || 50) * p.sellMult);
        return `<div class="preserve-inv-row">
          <span>${p.icon} ${p.name} ×${qty}</span>
          <div style="display:flex;align-items:center;gap:6px">
            <span style="font-size:10px;color:#f59e0b;font-weight:700">${sellEach}g each</span>
            <button class="p-sell-btn" onclick="townSellPreserved('${key}',1)">Sell 1</button>
            <button class="p-sell-btn" onclick="townSellPreserved('${key}',${qty})">Sell All</button>
          </div>
        </div>`;
      }).join('');
    }

    const makeCards = Object.entries(PRESERVED).map(([key, p]) => {
      const crop = CROPS[p.base];
      const have = invCount(p.base);
      const canPreserve = have >= p.baseNeeded;
      const sellFor = Math.round((crop?.sell || 50) * p.sellMult);
      return `<div class="preserve-card ${canPreserve ? 'can-preserve' : ''}">
        <span class="preserve-em">${p.icon}</span>
        <div class="preserve-name">${p.name}</div>
        <div class="preserve-sell">💰 ${sellFor}g (${p.sellMult}× value)</div>
        <div class="preserve-desc-text">${p.desc}</div>
        <div style="font-size:9px;color:var(--text-muted);margin-bottom:6px">
          Needs: ${crop?.e || '📦'} ×${p.baseNeeded} &nbsp;(have ${have})
        </div>
        <button class="preserve-btn" onclick="townPreserve('${key}')" ${canPreserve ? '' : 'disabled'}>
          ${canPreserve ? '🫙 Preserve' : 'Need ' + p.baseNeeded + '×'}
        </button>
      </div>`;
    }).join('');

    return `${invHtml}
      <div class="preserve-section-title">⚗️ Artisan Preservation</div>
      <div class="town-section-info">Transform your harvest into premium artisan goods worth 2–3× more at market!</div>
      <div class="preserve-grid">${makeCards}</div>`;
  }

  window.townPreserve = function (key) {
    const T = G.town;
    const p = PRESERVED[key];
    if (!p || invCount(p.base) < p.baseNeeded) { toast('Not enough items!', 'error'); snd('error'); return; }
    removeInv(p.base, p.baseNeeded);
    T.preservedInv[key] = (T.preservedInv[key] || 0) + 1;
    snd('levelup');
    toast('🫙 Made ' + p.name + '! Sell it for a premium price.', 'success', 3000);
    setTownTab('preserve');
  };

  window.townSellPreserved = function (key, qty) {
    const T = G.town;
    const p = PRESERVED[key];
    if (!p || !T.preservedInv[key] || T.preservedInv[key] < qty) { toast('Not enough to sell!', 'error'); return; }
    const sellEach = Math.round((CROPS[p.base]?.sell || 50) * p.sellMult);
    const total    = sellEach * qty;
    T.preservedInv[key] -= qty;
    G.gold = (G.gold || 0) + total;
    if (G.stats) G.stats.earned = (G.stats.earned || 0) + total;
    snd('coin');
    toast('💰 Sold ' + qty + '× ' + p.name + ' for ' + total + 'g!', 'success', 2800);
    if (typeof renderHUD === 'function') renderHUD();
    setTownTab('preserve');
  };

  /* ══════════════════════════════════════════════════════════
     RENDER — MUSEUM
  ══════════════════════════════════════════════════════════ */
  function _renderMuseum() {
    const T = G.town;
    const donated = T.museumDonated || [];
    const total   = ALL_MUSEUM_ITEMS.length;
    const pct     = Math.round((donated.length / total) * 100);

    const milestoneHtml = MUSEUM_MILESTONES.map(m => {
      const reached = donated.length >= m.at;
      return `<div class="museum-milestone ${reached ? 'done' : ''}">
        <span>${reached ? '✅' : '🔒'}</span>
        <span style="flex:1">${m.at} donations: ${m.text}</span>
        ${!reached ? `<span style="font-size:10px">${donated.length}/${m.at}</span>` : ''}
      </div>`;
    }).join('');

    const catsHtml = Object.entries(MUSEUM_CATS).map(([, cat]) => {
      const catDonated = cat.items.filter(t => donated.includes(t)).length;
      const itemCards  = cat.items.map(cropType => {
        const crop      = CROPS[cropType];
        const isDonated = donated.includes(cropType);
        const have      = invCount(cropType);
        return `<div class="museum-item ${isDonated ? 'donated' : ''}">
          <span class="museum-item-em">${crop?.e || '📦'}</span>
          <div class="museum-item-name">${crop?.n || cropType}</div>
          ${isDonated
            ? '<div style="font-size:8px;color:#c2410c;font-weight:700">✓ Donated</div>'
            : `<button class="museum-donate-btn" onclick="townDonate('${cropType}')" ${have > 0 ? '' : 'disabled'}>
                ${have > 0 ? 'Donate' : 'Need 1'}
              </button>`}
        </div>`;
      }).join('');
      return `<div class="museum-cat-title">${cat.icon} ${cat.label} (${catDonated}/${cat.items.length})</div>
        <div class="museum-item-grid">${itemCards}</div>`;
    }).join('');

    return `
      <div class="museum-header">
        <div>
          <div class="museum-total">${donated.length}/${total}</div>
          <div class="museum-total-lab">Donations</div>
        </div>
        <div style="flex:1;display:flex;flex-direction:column;gap:4px">
          <div class="museum-prog-bar"><div class="museum-prog-fill" style="width:${pct}%"></div></div>
          <div style="font-size:10px;color:var(--text-muted);font-weight:700">${pct}% complete</div>
        </div>
      </div>
      <div class="town-section-info">🏛️ Donate unique crops to help Nora build the Valley Museum. Each milestone unlocks gold, recipes, and lore.</div>
      <div style="font-size:11px;font-weight:800;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">🎁 Milestones</div>
      <div class="museum-milestones">${milestoneHtml}</div>
      ${catsHtml}`;
  }

  window.townDonate = function (cropType) {
    const T = G.town;
    if ((T.museumDonated || []).includes(cropType)) { toast('Already donated!', 'info'); return; }
    if (invCount(cropType) < 1) { toast('You don\'t have that item!', 'error'); return; }
    removeInv(cropType, 1);
    if (!T.museumDonated) T.museumDonated = [];
    T.museumDonated.push(cropType);
    T.friendship.nora = Math.min(10, (T.friendship.nora || 0) + 0.5);
    snd('levelup');
    toast('🏛️ Donated ' + (CROPS[cropType]?.n || cropType) + '! Nora is delighted.', 'success', 3000);
    // Check milestones
    MUSEUM_MILESTONES.forEach(m => {
      if (T.museumDonated.length === m.at && !(T.museumMilestones || []).includes(m.at)) {
        if (!T.museumMilestones) T.museumMilestones = [];
        T.museumMilestones.push(m.at);
        G.gold = (G.gold || 0) + m.gold;
        if (m.lore && !T.loreDiscovered.includes(m.lore)) T.loreDiscovered.push(m.lore);
        setTimeout(() => toast('🏆 Museum Milestone! ' + m.text + ' +' + m.gold + 'g', 'success', 5000), 900);
      }
    });
    if (typeof renderHUD === 'function') renderHUD();
    setTownTab('museum');
  };

  /* ══════════════════════════════════════════════════════════
     RENDER — FESTIVAL
  ══════════════════════════════════════════════════════════ */
  function _renderFestival() {
    const T  = G.town;
    const s  = season();
    const d  = G.day || 1;
    const activeFests = Object.entries(FESTIVALS).filter(([, f]) => f.season === s);

    if (!activeFests.length) {
      return `<div style="text-align:center;padding:40px 20px;color:var(--text-muted)">
        <div style="font-size:40px;margin-bottom:10px">🎪</div>
        <div style="font-size:13px;font-weight:700">No festivals this season.</div>
        <div style="font-size:11px;margin-top:8px">Festivals happen in Fall: Harvest Festival (Day 14–16) and Night Market (Day 24–26).</div>
      </div>`;
    }

    return activeFests.map(([festKey, fest]) => {
      const isActive = d >= fest.startDay && d <= fest.endDay;
      const isPast   = d > fest.endDay;
      const statusLabel = isActive ? '🎉 Active Now!' : isPast ? '✓ Season Past' : `⏳ Starts Day ${fest.startDay}`;

      const actHtml = fest.activities.map(act => {
        const doneKey = festKey + '_' + act.id;
        const done    = (T.festivalsDone || []).includes(doneKey);
        const costItems = Object.entries(act.cost || {}).map(([t,n]) => {
          const crop = CROPS[t];
          return `${crop?.e||'📦'} ${n}× ${crop?.n||t}`;
        }).join(', ');
        const canDo = !done && isActive
          && Object.entries(act.cost || {}).every(([t, n]) => invCount(t) >= n)
          && (act.goldCost === 0 || (G.gold || 0) >= act.goldCost);

        return `<div class="festival-activity">
          <div class="fest-act-top">
            <div class="fest-act-label">${act.label}</div>
            ${act.reward > 0 ? `<div class="fest-act-reward">💰 +${act.reward}g</div>` : ''}
          </div>
          <div class="fest-act-desc">${act.desc}</div>
          ${costItems ? `<div style="font-size:10px;color:var(--text-muted);margin-bottom:5px">Needs: ${costItems}</div>` : ''}
          ${act.goldCost > 0 ? `<div style="font-size:10px;color:#f59e0b;font-weight:700;margin-bottom:5px">Cost: ${act.goldCost}g</div>` : ''}
          ${done
            ? `<div style="text-align:center;font-size:12px;font-weight:800;color:#22c55e;padding:7px">✓ Done!</div>`
            : `<button class="fest-act-btn" onclick="townFestAct('${festKey}','${act.id}')" ${canDo ? '' : 'disabled'}>
                ${!isActive ? '🔒 ' + statusLabel : !canDo ? 'Not Enough Items' : 'Participate! 🎉'}
              </button>`}
        </div>`;
      }).join('');

      return `<div class="festival-banner">
          <span class="festival-banner-em">🍂</span>
          <div>
            <div class="festival-banner-name">${fest.name}</div>
            <div class="festival-banner-desc">${fest.desc}</div>
            <div class="festival-banner-date">📅 Days ${fest.startDay}–${fest.endDay} of ${fest.season} · ${statusLabel}</div>
          </div>
        </div>
        ${actHtml}`;
    }).join('');
  }

  window.townFestAct = function (festKey, actId) {
    const T    = G.town;
    const fest = FESTIVALS[festKey];
    const act  = fest && fest.activities.find(a => a.id === actId);
    if (!act) return;
    const doneKey = festKey + '_' + actId;
    if ((T.festivalsDone || []).includes(doneKey)) { toast('Already participated!', 'info'); return; }
    if (!Object.entries(act.cost || {}).every(([t, n]) => invCount(t) >= n)) { toast('Not enough items!', 'error'); snd('error'); return; }
    if (act.goldCost > 0 && (G.gold || 0) < act.goldCost) { toast('Need ' + act.goldCost + 'g!', 'error'); snd('error'); return; }
    // Spend
    Object.entries(act.cost || {}).forEach(([t, n]) => removeInv(t, n));
    if (act.goldCost > 0) G.gold = (G.gold || 0) - act.goldCost;
    // Reward
    if (act.reward > 0) G.gold = (G.gold || 0) + act.reward;
    if (act.friendBonus) {
      Object.entries(act.friendBonus).forEach(([k, p]) => {
        T.friendship[k] = Math.min(10, (T.friendship[k] || 0) + p);
      });
    }
    if (!T.festivalsDone) T.festivalsDone = [];
    T.festivalsDone.push(doneKey);
    snd('levelup');
    // Lore unlock for lantern walk
    if (actId === 'lantern_walk' && !T.loreDiscovered.includes('festival_origin'))
      T.loreDiscovered.push('festival_origin');
    const friendMsg = act.friendBonus && Object.keys(act.friendBonus).length
      ? ' 💛 Friendship gained!' : '';
    toast('🎉 ' + (act.label) + '!' + (act.reward > 0 ? ' +' + act.reward + 'g' : '') + friendMsg, 'success', 3500);
    if (typeof renderHUD === 'function') renderHUD();
    setTownTab('festival');
  };

  /* ══════════════════════════════════════════════════════════
     RENDER — LORE
  ══════════════════════════════════════════════════════════ */
  function _renderLore() {
    const T = G.town;
    const discovered = T.loreDiscovered || [];
    return `<div class="town-section-info">📖 Discover the hidden history of Harvest Valley. Unlock more entries through the museum and friendships.</div>` +
      LORE.map(l => {
        const unlocked = l.unlockDefault || discovered.includes(l.id);
        return `<div class="lore-card ${unlocked ? '' : 'locked'}">
          <div class="lore-top">
            <span class="lore-icon">${l.icon}</span>
            <div class="lore-title">${unlocked ? l.title : '🔒 Unknown Entry'}</div>
          </div>
          <div class="lore-text">${unlocked ? l.text : 'Donate more to the museum to unlock this memory.'}</div>
        </div>`;
      }).join('');
  }

  /* ══════════════════════════════════════════════════════════
     FALL ATMOSPHERE
  ══════════════════════════════════════════════════════════ */
  let _leafTimer = null;

  function updateAtmosphere() {
    const s = season();
    if (s === 'Fall') {
      startLeaves();
      setGlow(true);
    } else {
      stopLeaves();
      setGlow(false);
    }
  }

  function startLeaves() {
    const container = document.getElementById('fall-leaves');
    if (!container) return;
    container.innerHTML = '';
    const EMOJIS = ['🍂', '🍁', '🌿'];
    let live = 0;
    function spawn() {
      if (live >= 14) return;
      const el = document.createElement('div');
      el.className = 'fall-leaf';
      el.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
      el.style.left  = Math.random() * 102 + 'vw';
      el.style.fontSize = (9 + Math.random() * 9) + 'px';
      el.style.opacity  = 0.5 + Math.random() * 0.5;
      const dur = 6 + Math.random() * 9;
      el.style.animationDuration = dur + 's';
      container.appendChild(el);
      live++;
      setTimeout(() => { el.remove(); live = Math.max(0, live - 1); }, dur * 1000 + 200);
    }
    clearInterval(_leafTimer);
    spawn(); spawn(); spawn();
    _leafTimer = setInterval(spawn, 1600);
  }

  function stopLeaves() {
    clearInterval(_leafTimer);
    const c = document.getElementById('fall-leaves');
    if (c) c.innerHTML = '';
  }

  function setGlow(on) {
    const g = document.getElementById('fall-glow');
    if (g) g.style.opacity = on ? '1' : '0';
  }

  /* ══════════════════════════════════════════════════════════
     INVENTORY HELPERS
     G.inv  = seeds  (object {type:qty})
     G.bag  = harvested crops (object {type:qty})
  ══════════════════════════════════════════════════════════ */
  function invCount(type) {
    return ((G.bag  && G.bag[type])  || 0)
         + ((G.inv  && G.inv[type])  || 0);
  }

  function removeInv(type, qty) {
    let rem = qty;
    // Remove from bag first (harvested crops)
    if (G.bag && (G.bag[type] || 0) > 0) {
      const take = Math.min(G.bag[type], rem);
      G.bag[type] -= take;
      rem -= take;
    }
    // Then seeds
    if (rem > 0 && G.inv && (G.inv[type] || 0) > 0) {
      const take = Math.min(G.inv[type], rem);
      G.inv[type] -= take;
    }
  }

  function cropEmoji(type) {
    return (typeof CROPS !== 'undefined' && CROPS[type]?.e) || '📦';
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* ══════════════════════════════════════════════════════════
     HOOKS
  ══════════════════════════════════════════════════════════ */
  function hookSleep() {
    const _orig = window.doSleep;
    if (typeof _orig !== 'function') return;
    window.doSleep = function (...args) {
      const T = G.town;
      if (T) {
        T.activeBuffs = {};          // Buffs expire on sleep
        T.lastQuestDay = -1;         // Force quest refresh next morning
      }
      const ret = _orig.apply(this, args);
      setTimeout(updateAtmosphere, 600); // Re-check season after sleep animation
      return ret;
    };
  }

  function hookRenderHUD() {
    const _orig = window.renderHUD;
    if (typeof _orig !== 'function') return;
    window.renderHUD = function (...args) {
      _orig.apply(this, args);
      // Inject/update buff pills in HUD
      const hud = document.getElementById('hud');
      if (!hud) return;
      hud.querySelectorAll('.town-hud-buff').forEach(el => el.remove());
      const buffs = Object.values((G.town && G.town.activeBuffs) || {});
      buffs.forEach(b => {
        const pill = document.createElement('div');
        pill.className = 'hud-pill town-hud-buff';
        pill.title = b.desc;
        pill.innerHTML = `<span class="town-buff-pill">${b.icon} ${b.name}</span>`;
        hud.appendChild(pill);
      });
    };
  }

  /* ══════════════════════════════════════════════════════════
     BOOT
  ══════════════════════════════════════════════════════════ */
  function boot() {
    initTownState();
    injectCSS();
    injectHTML();

    /* Hook initState & loadState so town data is always properly initialised
       on every login — not just the first one. boot() only fires once, so
       subsequent logout → new-farm flows would otherwise skip initTownState. */
    const _origInitState = window.initState;
    if (typeof _origInitState === 'function') {
      window.initState = function (...args) {
        _origInitState.apply(this, args);
        initTownState();
      };
    }
    const _origLoadState = window.loadState;
    if (typeof _origLoadState === 'function') {
      window.loadState = function (...args) {
        _origLoadState.apply(this, args);
        initTownState();
      };
    }

    hookSleep();
    hookRenderHUD();
    updateAtmosphere();

    const s = season();
    const isFirstFall = s === 'Fall';
    setTimeout(() => {
      toast(
        isFirstFall
          ? '🍂 Fall Town Update is here! Visit the 🏘️ Town button to explore.'
          : '🏘️ Fall Town Update loaded! The Town awaits you.',
        'success', 4500
      );
    }, 1800);

    console.log('[FallTownUpdate v2.0.0] 🍂 The Fall Town Update is live!');
  }

})();
