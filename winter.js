/* ═══════════════════════════════════════════════════════════
   VALLEY FARM — WINTER EXPANSION  v2.0
   ❄️ Ice Fishing  ⛏️ Mining  🔨 Crafting  🌿 Foraging
   🐄 Animals  🌨️ Events  🔥 Survival  ✨ Atmosphere
═══════════════════════════════════════════════════════════ */
(function(){
'use strict';

/* ══════════════════════════════════════════════════════════
   1.  WINTER CROP DEFINITIONS (injected into CROPS)
══════════════════════════════════════════════════════════ */
const WINTER_CROP_DEFS={
  cabbage:       {n:'Cabbage',        e:'🥬',days:6, buy:40,  sell:120, seasons:['Fall','Winter'],winterNative:true},
  leek:          {n:'Leek',           e:'🌿',days:5, buy:35,  sell:100, seasons:['Winter'],windowNative:true},
  winter_berry:  {n:'Winter Berry',   e:'🫐',days:8, buy:60,  sell:180, seasons:['Winter'],winterNative:true},
  frost_melon:   {n:'Frost Melon',    e:'🍈',days:12,buy:90,  sell:300, seasons:['Winter'],winterNative:true},
  crystal_flower:{n:'Crystal Flower', e:'🌸',days:10,buy:120, sell:450, seasons:['Winter'],winterNative:true},
};

/* ══════════════════════════════════════════════════════════
   2.  MATERIAL DEFINITIONS (fish / ore / forage / crafted)
══════════════════════════════════════════════════════════ */
const MAT={
  // 🐟 Fish
  ice_trout:    {n:'Ice Trout',      e:'🐟',sell:45, cat:'fish'},
  frozen_carp:  {n:'Frozen Carp',    e:'🐠',sell:70, cat:'fish'},
  arctic_perch: {n:'Arctic Perch',   e:'🐡',sell:120,cat:'fish',rare:true},
  swamp_eel:    {n:'Swamp Eel',      e:'🐍',sell:55, cat:'fish'},
  mudfish:      {n:'Mudfish',        e:'🐟',sell:40, cat:'fish'},
  cave_bass:    {n:'Cave Bass',      e:'🐠',sell:90, cat:'fish',rare:true},
  lava_koi:     {n:'Lava Koi',       e:'🐡',sell:165,cat:'fish',rare:true},
  thermal_pike: {n:'Thermal Pike',   e:'🐟',sell:110,cat:'fish'},
  // ⛏️ Ore & Gems
  iron_ore:     {n:'Iron Ore',       e:'🪨',sell:60, cat:'ore'},
  coal:         {n:'Coal',           e:'⬛',sell:40, cat:'fuel'},
  gold_ore:     {n:'Gold Ore',       e:'🌕',sell:160,cat:'ore', rare:true},
  crystal:      {n:'Crystal',        e:'💎',sell:230,cat:'gem', rare:true},
  vol_shard:    {n:'Volcanic Shard', e:'🔴',sell:290,cat:'gem', rare:true},
  fossil:       {n:'Fossil',         e:'🦕',sell:420,cat:'artifact',rare:true},
  // 🌿 Forage
  winter_herb:  {n:'Winter Herb',    e:'🌿',sell:30, cat:'herb'},
  snow_shroom:  {n:'Snow Mushroom',  e:'🍄',sell:50, cat:'herb'},
  frost_berry:  {n:'Frost Berry',    e:'🍒',sell:40, cat:'herb'},
  frozen_relic: {n:'Frozen Relic',   e:'🏺',sell:180,cat:'artifact',rare:true},
  pine_branch:  {n:'Pine Branch',    e:'🌲',sell:20, cat:'wood'},
  firewood:     {n:'Firewood',       e:'🪵',sell:15, cat:'fuel'},
  // 🐄 Animal products
  egg:          {n:'Egg',            e:'🥚',sell:25, cat:'animal'},
  milk:         {n:'Milk',           e:'🥛',sell:40, cat:'animal'},
  wool:         {n:'Wool',           e:'🧶',sell:55, cat:'animal'},
  // 🔨 Crafted
  warm_meal:    {n:'Warm Meal',      e:'🍲',sell:80, cat:'crafted',consume:true,energyRestore:30},
  hot_cocoa:    {n:'Hot Cocoa',      e:'☕',sell:60, cat:'crafted',consume:true,energyRestore:20},
  crystal_gem:  {n:'Crystal Gem',    e:'✨',sell:500,cat:'crafted'},
  fossil_piece: {n:'Fossil Piece',   e:'🦴',sell:700,cat:'crafted'},
  wool_blanket: {n:'Wool Blanket',   e:'🧣',sell:120,cat:'crafted'},
};

/* ══════════════════════════════════════════════════════════
   3.  CRAFTING RECIPES
══════════════════════════════════════════════════════════ */
const RECIPES=[
  {id:'warm_meal',   n:'Warm Meal',    e:'🍲',desc:'Consume to restore +30 energy.',
   ing:{ice_trout:1,winter_herb:1},    out:'warm_meal',   outQty:1,eff:{type:'energy',val:30}},
  {id:'hot_cocoa',   n:'Hot Cocoa',    e:'☕',desc:'Consume to restore +20 energy.',
   ing:{milk:1,frost_berry:1},         out:'hot_cocoa',   outQty:1,eff:{type:'energy',val:20}},
  {id:'crystal_gem', n:'Crystal Gem',  e:'✨',desc:'Polished gem worth 500g.',
   ing:{crystal:2,coal:1},             out:'crystal_gem', outQty:1,eff:null},
  {id:'fossil_piece',n:'Fossil Piece', e:'🦴',desc:'Museum-quality fossil worth 700g.',
   ing:{fossil:1,iron_ore:2},          out:'fossil_piece',outQty:1,eff:null},
  {id:'wool_blanket',n:'Wool Blanket', e:'🧣',desc:'Adds +20 max fuel capacity.',
   ing:{wool:3},                        out:'wool_blanket',outQty:1,eff:{type:'fuel_max',val:20}},
  {id:'coal_fuel',   n:'Coal Fuel',    e:'🔥',desc:'Immediately adds +50 heating fuel.',
   ing:{coal:3},                        out:null,          outQty:0,eff:{type:'fuel',val:50}},
  {id:'fish_stew',   n:'Fish Stew',    e:'🍜',desc:'Hearty stew — restores +35 energy.',
   ing:{swamp_eel:1,snow_shroom:1},    out:'warm_meal',   outQty:1,eff:{type:'energy',val:35}},
  {id:'iron_pick',   n:'Iron Pickaxe', e:'⛏️',desc:'Upgrade: mine tiles yield 1 extra ore.',
   ing:{iron_ore:4,pine_branch:2},     out:null,          outQty:0,eff:{type:'mine_upgrade',val:1}},
];

/* ══════════════════════════════════════════════════════════
   4.  ANIMAL TYPES
══════════════════════════════════════════════════════════ */
const ANIMALS={
  chicken:{n:'Chicken',e:'🐔',cost:300,feed:10,produce:'egg',  qty:2,desc:'Lays 2 eggs when fed'},
  cow:    {n:'Cow',    e:'🐄',cost:800,feed:25,produce:'milk', qty:1,desc:'Produces 1 milk when fed'},
  sheep:  {n:'Sheep',  e:'🐑',cost:600,feed:20,produce:'wool', qty:1,desc:'Produces 1 wool when fed'},
};

/* ══════════════════════════════════════════════════════════
   5.  SEASONAL EVENTS
══════════════════════════════════════════════════════════ */
const EVENTS=[
  {id:'blizzard',   n:'❄️ Blizzard!',          w:14,
   msg:'A fierce blizzard strikes! You recover 20 less energy tonight.',
   eff:'energy_penalty'},
  {id:'merchant',   n:'🛒 Traveling Merchant',  w:10,
   msg:'A hooded merchant appeared! Visit Winter Hub → Activities.',
   eff:'merchant'},
  {id:'treasure',   n:'💰 Frozen Treasure',     w:8,
   msg:'You found a frozen chest half-buried in the snow!',
   eff:'gold'},
  {id:'aurora',     n:'🌌 Aurora Night',        w:10,
   msg:'Aurora borealis fills the sky — all skills gain bonus XP!',
   eff:'xp_boost'},
  {id:'wolf',       n:'🐺 Wolf Sighting',       w:16,
   msg:'A lone wolf was spotted near the fence. Stay close to home.',
   eff:'atmosphere'},
  {id:'cabin',      n:'🏚️ Abandoned Cabin',     w:8,
   msg:'You found an old cabin! Collected firewood and winter herbs.',
   eff:'forage_gift'},
  {id:'ice_spirit', n:'✨ Ice Spirit',          w:9,
   msg:'A glittering ice spirit visited your farm, leaving crystal gifts!',
   eff:'crystal_gift'},
  {id:'cold_snap',  n:'🥶 Cold Snap',           w:12,
   msg:'Extreme cold tonight! Heating fuel burns 10 extra.',
   eff:'fuel_drain'},
  {id:'mkt_surge',  n:'📈 Market Surge',        w:8,
   msg:'Word of your quality goods spread! All materials sell for +25% today.',
   eff:'price_boost'},
  {id:'snow_hare',  n:'🐇 Snow Hare',           w:5,
   msg:'A snow hare darted across your farm, dropping some wool!',
   eff:'wool_gift'},
];

/* ══════════════════════════════════════════════════════════
   6.  FISHING POOLS (per land)
══════════════════════════════════════════════════════════ */
const FISH_POOLS={
  riverbank:[{t:'ice_trout',w:50},{t:'frozen_carp',w:35},{t:'arctic_perch',w:15}],
  lowland:  [{t:'swamp_eel',w:45},{t:'mudfish',w:40},{t:'cave_bass',w:15}],
  volcanic: [{t:'thermal_pike',w:40},{t:'lava_koi',w:30},{t:'arctic_perch',w:30}],
  home:     [{t:'ice_trout',w:60},{t:'frozen_carp',w:40}],
  meadow:   [{t:'ice_trout',w:55},{t:'mudfish',w:45}],
  hillfarm: [{t:'ice_trout',w:60},{t:'frozen_carp',w:40}],
};

/* ══════════════════════════════════════════════════════════
   7.  MINE POOLS (per land)
══════════════════════════════════════════════════════════ */
const MINE_POOLS={
  hillfarm: [{t:'iron_ore',w:38},{t:'coal',w:33},{t:'gold_ore',w:12},{t:'crystal',w:9},{t:'fossil',w:8}],
  volcanic: [{t:'vol_shard',w:25},{t:'gold_ore',w:22},{t:'crystal',w:22},{t:'coal',w:16},{t:'iron_ore',w:15}],
  _def:     [{t:'iron_ore',w:55},{t:'coal',w:36},{t:'crystal',w:6},{t:'gold_ore',w:3}],
};

/* ══════════════════════════════════════════════════════════
   8.  FORAGE POOLS (per land)
══════════════════════════════════════════════════════════ */
const FORAGE_POOLS={
  meadow:   [{t:'winter_herb',w:40},{t:'pine_branch',w:35},{t:'frost_berry',w:20},{t:'frozen_relic',w:5}],
  riverbank:[{t:'snow_shroom',w:40},{t:'frost_berry',w:35},{t:'winter_herb',w:20},{t:'frozen_relic',w:5}],
  hillfarm: [{t:'pine_branch',w:45},{t:'winter_herb',w:30},{t:'fossil',w:15},{t:'frozen_relic',w:10}],
  lowland:  [{t:'snow_shroom',w:42},{t:'winter_herb',w:38},{t:'frost_berry',w:15},{t:'frozen_relic',w:5}],
  volcanic: [{t:'vol_shard',w:30},{t:'crystal',w:25},{t:'pine_branch',w:30},{t:'frozen_relic',w:15}],
  home:     [{t:'pine_branch',w:40},{t:'winter_herb',w:35},{t:'frost_berry',w:20},{t:'frozen_relic',w:5}],
};

/* ══════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════ */
function isWinter(){return typeof season==='function'&&season()==='Winter';}
function wdata(){if(!G.winter)G.winter={};return G.winter;}
function mats(){if(!G.materials)G.materials={};return G.materials;}

function pickPool(pool){
  const tot=pool.reduce((s,i)=>s+(i.w||1),0);
  let r=Math.random()*tot;
  for(const i of pool){r-=(i.w||1);if(r<=0)return i.t;}
  return pool[pool.length-1].t;
}
function addMat(t,q=1){mats()[t]=(mats()[t]||0)+q;}
function rmMat(t,q=1){mats()[t]=Math.max(0,(mats()[t]||0)-q);if(!mats()[t])delete mats()[t];}
function hasMat(t,q=1){return((mats()[t])||0)>=q;}

function matSellPrice(t){
  const m=MAT[t];if(!m)return 0;
  const boost=wdata().priceBoost?1.25:1;
  return Math.round(m.sell*boost);
}

function sellMat(t,q=1){
  if(!hasMat(t,q)){wToast('Not enough '+MAT[t].n+'!','error');return;}
  const earned=matSellPrice(t)*q;
  rmMat(t,q);G.gold+=earned;G.stats.earned+=earned;G.yearEarned=(G.yearEarned||0)+earned;
  wToast('Sold '+q+'× '+(MAT[t].e)+' '+(MAT[t].n)+' for '+earned+'g! 💰','success');
  if(typeof renderHUD==='function')renderHUD();
  refreshWinterHub();
}

function wToast(msg,type,dur){if(typeof toast==='function')toast(msg,type||'info',dur||2600);}

/* ══════════════════════════════════════════════════════════
   STATE INITIALIZER / MIGRATION
══════════════════════════════════════════════════════════ */
function ensureWinterState(){
  const w=wdata();
  if(w.fuel===undefined)    w.fuel=60;
  if(w.fuelMax===undefined) w.fuelMax=100;
  if(!w.animals)            w.animals={};   // {chicken:2, cow:0}
  if(!w.animalFed)          w.animalFed={}; // {chicken:false}
  if(!w.eventLog)           w.eventLog=[];
  if(w.eventToday===undefined) w.eventToday=null;
  if(w.priceBoost===undefined) w.priceBoost=false;
  if(w.priceDaysLeft===undefined) w.priceDaysLeft=0;
  if(w.merchantDay===undefined) w.merchantDay=-999;
  if(!w.merchantItems)      w.merchantItems=null;
  if(w.mineGrid===undefined) w.mineGrid=null;
  if(w.mineDepth===undefined) w.mineDepth=0;
  if(w.pickUpgrade===undefined) w.pickUpgrade=false;
  if(!w.forage)             w.forage=[];    // [{r,c,type}] placed on farm grid
  mats(); // ensure G.materials exists
}

/* ══════════════════════════════════════════════════════════
   INJECT WINTER CROPS INTO GLOBAL CROPS OBJECT
══════════════════════════════════════════════════════════ */
function injectWinterCrops(){
  if(typeof CROPS==='undefined')return;
  Object.entries(WINTER_CROP_DEFS).forEach(([k,v])=>{
    if(!CROPS[k])CROPS[k]=v;
  });
}

/* ══════════════════════════════════════════════════════════
   INJECT CSS STYLES
══════════════════════════════════════════════════════════ */
function injectStyles(){
  const css=`
/* ─── WINTER HUB OVERLAY ─── */
#winter-hub{display:none;position:fixed;inset:0;z-index:900;background:rgba(0,0,0,.55);
  align-items:flex-end;justify-content:center;backdrop-filter:blur(3px)}
#winter-hub.wh-open{display:flex;animation:wh-in .25s ease}
@keyframes wh-in{from{opacity:0}to{opacity:1}}
.wh-panel{background:var(--ui-bg);border-radius:20px 20px 0 0;width:100%;max-width:540px;
  max-height:88vh;display:flex;flex-direction:column;overflow:hidden;
  border-top:2px solid #7dd3fc;box-shadow:0 -8px 40px rgba(125,211,252,.15)}
body.retro .wh-panel{border-radius:4px 4px 0 0;border-top:3px solid #7dd3fc;background:var(--ui-bg)}
.wh-header{display:flex;align-items:center;justify-content:space-between;
  padding:14px 16px 10px;border-bottom:1.5px solid var(--ui-border);flex-shrink:0}
.wh-title{font-family:'Baloo 2',cursive;font-size:18px;font-weight:800;color:#0369a1}
body.dark .wh-title{color:#7dd3fc}
body.retro .wh-title{font-family:'Press Start 2P',monospace;font-size:10px;color:#7dd3fc}
.wh-close{background:none;border:none;font-size:20px;cursor:pointer;color:var(--text-muted);
  line-height:1;padding:4px 8px;border-radius:8px;transition:background .15s}
.wh-close:hover{background:var(--ui-bg2)}
.wh-tabs{display:flex;gap:4px;padding:8px 12px 0;flex-shrink:0;overflow-x:auto;
  -webkit-overflow-scrolling:touch}
.wh-tab{background:var(--ui-bg2);border:1.5px solid var(--ui-border);color:var(--text-muted);
  font-size:11px;font-weight:700;padding:6px 12px;border-radius:20px;cursor:pointer;
  white-space:nowrap;transition:all .15s;font-family:'Nunito',sans-serif}
.wh-tab.wh-active{background:#e0f2fe;border-color:#7dd3fc;color:#0369a1}
body.dark .wh-tab.wh-active{background:#0c2d48;border-color:#0369a1;color:#7dd3fc}
body.retro .wh-tab{font-family:'Press Start 2P',monospace;font-size:7px;border-radius:3px}
body.retro .wh-tab.wh-active{background:#0c2d48;border-color:#7dd3fc;color:#7dd3fc}
.wh-body{flex:1;overflow-y:auto;padding:12px 14px 20px}
.wh-body::-webkit-scrollbar{width:4px}
.wh-body::-webkit-scrollbar-thumb{background:var(--ui-border);border-radius:4px}

/* ─── FUEL GAUGE (HUD) ─── */
.fuel-hud-pill{display:none}
.wh-fuel-row{display:flex;align-items:center;gap:6px;margin-bottom:10px;
  background:rgba(125,211,252,.08);border:1px solid rgba(125,211,252,.25);
  border-radius:10px;padding:7px 10px}
.fuel-bar-wrap{flex:1;height:7px;background:var(--ui-bg2);border-radius:4px;overflow:hidden;border:1px solid var(--ui-border)}
.fuel-bar-fill{height:100%;border-radius:4px;transition:width .4s;background:linear-gradient(90deg,#f97316,#ef4444)}
.fuel-ok .fuel-bar-fill{background:linear-gradient(90deg,#22c55e,#16a34a)}
.fuel-warn .fuel-bar-fill{background:linear-gradient(90deg,#f59e0b,#d97706)}

/* ─── FISHING MINIGAME ─── */
.fish-scene{text-align:center;padding:10px 0 6px}
.fish-hole{font-size:48px;margin-bottom:4px;animation:fishBob 2s ease-in-out infinite}
@keyframes fishBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
.fish-land-tag{display:inline-block;font-size:10px;font-weight:700;background:#e0f2fe;
  color:#0369a1;border-radius:12px;padding:2px 10px;margin-bottom:8px}
body.dark .fish-land-tag{background:#0c2d48;color:#7dd3fc}
.fish-attempts{font-size:11px;color:var(--text-muted);margin-bottom:10px;font-weight:700}
.fish-bar-wrap{position:relative;height:36px;background:var(--ui-bg2);border-radius:12px;
  overflow:hidden;border:2px solid #7dd3fc;margin:0 4px 10px;cursor:pointer;touch-action:none}
.fish-zone{position:absolute;top:0;height:100%;background:rgba(34,197,94,.25);
  border-left:2px solid #22c55e;border-right:2px solid #22c55e;transition:left .2s}
.fish-indicator{position:absolute;top:50%;transform:translate(-50%,-50%);
  font-size:20px;transition:left .08s linear;pointer-events:none}
.fish-btn{width:100%;padding:12px;border:none;border-radius:12px;font-size:15px;font-weight:800;
  background:linear-gradient(135deg,#0369a1,#0ea5e9);color:#fff;cursor:pointer;
  font-family:'Baloo 2',cursive;transition:transform .1s,box-shadow .1s;
  box-shadow:0 4px 12px rgba(3,105,161,.3)}
.fish-btn:active{transform:scale(.96)}
.fish-result{font-size:28px;text-align:center;margin:6px 0;min-height:40px;animation:fishPop .4s ease}
@keyframes fishPop{from{transform:scale(0.5);opacity:0}to{transform:scale(1);opacity:1}}
.fish-pool-list{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.fish-pool-item{font-size:11px;background:var(--ui-bg2);border:1px solid var(--ui-border);
  border-radius:8px;padding:4px 8px;color:var(--text-muted)}
.fish-pool-item.rare{border-color:#f59e0b;color:#d97706;background:#fef9c3}
body.dark .fish-pool-item.rare{background:#451a03;border-color:#b45309;color:#fbbf24}

/* ─── MINE GRID ─── */
.mine-info{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;
  font-size:11px;font-weight:700;color:var(--text-muted)}
.mine-depth{color:#0369a1;font-weight:800}
body.dark .mine-depth{color:#7dd3fc}
.mine-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:5px;margin-bottom:10px}
.mine-tile{aspect-ratio:1;border-radius:10px;border:2px solid var(--ui-border);
  background:var(--ui-bg2);display:flex;align-items:center;justify-content:center;
  font-size:20px;cursor:pointer;transition:transform .12s,box-shadow .12s;
  user-select:none;-webkit-tap-highlight-color:transparent}
.mine-tile:hover:not(.mined){transform:scale(1.06);box-shadow:0 2px 8px rgba(0,0,0,.15)}
.mine-tile.mined{background:transparent;border-color:transparent;cursor:default}
.mine-tile.mined-ore{animation:mineReveal .3s ease}
.mine-tile.empty-rock{background:rgba(0,0,0,.04);cursor:default}
@keyframes mineReveal{from{transform:scale(1.3);opacity:0}to{transform:scale(1);opacity:1}}
.mine-refresh-btn{width:100%;padding:9px;border:none;border-radius:10px;
  background:linear-gradient(135deg,#374151,#1f2937);color:#fff;font-size:12px;
  font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif;margin-top:4px}
.mine-stat-row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px}
.mine-stat{flex:1;min-width:80px;background:var(--ui-bg2);border:1px solid var(--ui-border);
  border-radius:8px;padding:5px 8px;font-size:10px;font-weight:700;
  color:var(--text-muted);text-align:center}
.mine-stat span{display:block;font-size:14px;color:var(--text-primary)}

/* ─── CRAFTING ─── */
.craft-recipe{background:var(--ui-bg2);border:1.5px solid var(--ui-border);
  border-radius:12px;padding:10px 12px;margin-bottom:8px;transition:border-color .15s}
.craft-recipe.can-craft{border-color:#22c55e}
body.dark .craft-recipe.can-craft{border-color:#16a34a}
.craft-recipe-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px}
.craft-recipe-name{font-size:13px;font-weight:800;color:var(--text-primary)}
.craft-recipe-desc{font-size:10px;color:var(--text-muted);margin-bottom:6px;line-height:1.4}
.craft-ing{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px}
.craft-ing-tag{font-size:10px;padding:2px 7px;border-radius:8px;font-weight:700;
  background:var(--ui-bg);border:1px solid var(--ui-border);color:var(--text-muted)}
.craft-ing-tag.have{border-color:#86efac;color:#16a34a;background:#f0fdf4}
body.dark .craft-ing-tag.have{background:#0d2a14;border-color:#166534;color:#4ade80}
.craft-ing-tag.miss{border-color:#fca5a5;color:#dc2626;background:#fef2f2}
body.dark .craft-ing-tag.miss{background:#2d0a0a;border-color:#991b1b;color:#f87171}
.craft-btn{width:100%;padding:7px;border:none;border-radius:8px;font-size:12px;font-weight:700;
  cursor:pointer;font-family:'Nunito',sans-serif;transition:transform .1s}
.craft-btn:not(:disabled){background:linear-gradient(135deg,#16a34a,#22c55e);color:#fff}
.craft-btn:not(:disabled):active{transform:scale(.97)}
.craft-btn:disabled{background:var(--ui-bg);color:var(--text-muted);cursor:not-allowed;border:1px solid var(--ui-border)}

/* ─── ANIMALS ─── */
.animal-card{background:var(--ui-bg2);border:1.5px solid var(--ui-border);
  border-radius:12px;padding:10px 12px;margin-bottom:8px}
.animal-card.owned{border-color:#86efac}
body.dark .animal-card.owned{border-color:#166534}
.animal-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px}
.animal-name{font-size:13px;font-weight:800}
.animal-count{font-size:20px}
.animal-desc{font-size:10px;color:var(--text-muted);margin-bottom:6px}
.animal-btn-row{display:flex;gap:6px}
.animal-btn{flex:1;padding:6px;border:none;border-radius:8px;font-size:11px;font-weight:700;
  cursor:pointer;font-family:'Nunito',sans-serif;transition:background .15s}
.animal-buy-btn{background:#0369a1;color:#fff}
.animal-buy-btn:disabled{background:var(--ui-bg);color:var(--text-muted);cursor:not-allowed;border:1px solid var(--ui-border)}
.animal-feed-btn{background:#16a34a;color:#fff}
.animal-feed-btn:disabled{background:var(--ui-bg2);color:var(--text-muted);cursor:not-allowed;border:1px solid var(--ui-border)}
.animal-fed-badge{display:inline-block;background:#dcfce7;color:#16a34a;font-size:9px;
  font-weight:700;border-radius:8px;padding:2px 7px;border:1px solid #86efac}
body.dark .animal-fed-badge{background:#0d2a14;border-color:#166534;color:#4ade80}

/* ─── ACTIVITIES (Forage / Events) ─── */
.w-section-hd{font-size:11px;font-weight:800;color:#0369a1;text-transform:uppercase;
  letter-spacing:.6px;margin:12px 0 6px;padding-bottom:4px;border-bottom:1.5px solid #e0f2fe}
body.dark .w-section-hd{color:#7dd3fc;border-color:#0c2d48}
body.retro .w-section-hd{color:#7dd3fc;font-family:'Press Start 2P',monospace;font-size:7px}
.w-event-card{background:linear-gradient(135deg,rgba(125,211,252,.08),rgba(99,102,241,.06));
  border:1.5px solid #bae6fd;border-radius:12px;padding:10px 12px;margin-bottom:8px}
body.dark .w-event-card{background:rgba(12,45,72,.4);border-color:#0369a1}
.w-event-name{font-size:13px;font-weight:800;color:var(--text-primary);margin-bottom:3px}
.w-event-msg{font-size:11px;color:var(--text-muted);line-height:1.45}

/* ─── MATERIALS INVENTORY ─── */
.mat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:6px;margin-bottom:8px}
.mat-card{background:var(--ui-bg2);border:1.5px solid var(--ui-border);border-radius:10px;
  padding:6px 8px;text-align:center;font-size:10px;font-weight:700;color:var(--text-muted)}
.mat-card-em{font-size:20px;display:block;margin-bottom:2px}
.mat-card-name{color:var(--text-primary);font-size:10px;margin-bottom:2px}
.mat-card.rare-mat{border-color:#f59e0b}
.mat-sell-btn{display:block;width:100%;margin-top:4px;padding:3px;background:#0369a1;color:#fff;
  border:none;border-radius:6px;font-size:9px;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif}
body.dark .mat-sell-btn{background:#0284c7}

/* ─── MERCHANT ─── */
.merchant-item{background:linear-gradient(135deg,rgba(245,158,11,.08),rgba(239,68,68,.06));
  border:1.5px solid #fcd34d;border-radius:12px;padding:10px 12px;margin-bottom:8px;
  display:flex;justify-content:space-between;align-items:center;gap:8px}
body.dark .merchant-item{background:rgba(69,26,3,.4);border-color:#b45309}
.merchant-buy-btn{background:#f59e0b;color:#fff;border:none;border-radius:8px;padding:6px 12px;
  font-size:11px;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif;flex-shrink:0}
.merchant-buy-btn:disabled{background:var(--ui-bg2);color:var(--text-muted);cursor:not-allowed;border:1px solid var(--ui-border)}

/* ─── WINTER TOOLBAR BUTTON ─── */
#winter-hub-btn{display:none;background:linear-gradient(135deg,#0369a1,#0ea5e9);
  color:#fff;border:none;padding:8px 14px;border-radius:10px;font-size:13px;font-weight:800;
  cursor:pointer;font-family:'Baloo 2',cursive;box-shadow:0 2px 10px rgba(3,105,161,.3);
  white-space:nowrap;animation:winterPulse 2.5s ease-in-out infinite}
@keyframes winterPulse{0%,100%{box-shadow:0 2px 10px rgba(3,105,161,.3)}50%{box-shadow:0 2px 20px rgba(3,105,161,.55)}}
body.retro #winter-hub-btn{font-family:'Press Start 2P',monospace;font-size:7px;border-radius:3px}

/* ─── FORAGE TILE GLOW ─── */
.forage-tile{animation:forageGlow 1.8s ease-in-out infinite;cursor:pointer}
@keyframes forageGlow{0%,100%{filter:drop-shadow(0 0 4px rgba(125,211,252,.6))}50%{filter:drop-shadow(0 0 10px rgba(125,211,252,.9))}}

/* ─── AURORA OVERLAY ─── */
#aurora-overlay{display:none;position:fixed;inset:0;pointer-events:none;z-index:50;
  background:linear-gradient(180deg,rgba(16,185,129,.12) 0%,rgba(99,102,241,.08) 40%,transparent 70%);
  animation:auroraWave 8s ease-in-out infinite}
#aurora-overlay.aurora-on{display:block}
@keyframes auroraWave{0%,100%{opacity:.6;transform:scaleX(1)}50%{opacity:1;transform:scaleX(1.05)}}

/* ─── WINTER BG SNOWFLAKES ─── */
#snow-layer{display:none;position:fixed;inset:0;pointer-events:none;z-index:45;overflow:hidden}
#snow-layer.snow-on{display:block}

/* ─── WINTER COMPACT FUEL IN INV ─── */
.winter-fuel-block{background:linear-gradient(135deg,rgba(14,165,233,.08),rgba(99,102,241,.06));
  border:1.5px solid #7dd3fc;border-radius:12px;padding:10px 12px;margin-bottom:8px}
body.dark .winter-fuel-block{background:rgba(12,45,72,.5)}
.wfb-row{display:flex;align-items:center;gap:8px;margin-bottom:6px}
.wfb-label{font-size:11px;font-weight:800;color:#0369a1}
body.dark .wfb-label{color:#7dd3fc}
.wfb-val{font-size:11px;color:var(--text-muted);margin-left:auto}
.wfb-bar{flex:1;height:8px;background:var(--ui-bg2);border-radius:4px;overflow:hidden;border:1px solid var(--ui-border);max-width:120px}
.wfb-fill{height:100%;border-radius:4px;transition:width .4s,background .4s}
.wfb-tip{font-size:10px;color:var(--text-muted);line-height:1.4}
.wfb-add-btn{margin-top:6px;width:100%;padding:6px;border:none;border-radius:8px;
  background:#0369a1;color:#fff;font-size:11px;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif}
`;
  const el=document.createElement('style');
  el.id='winter-styles';
  el.textContent=css;
  document.head.appendChild(el);
}

/* ══════════════════════════════════════════════════════════
   INJECT HTML OVERLAYS
══════════════════════════════════════════════════════════ */
function injectHTML(){
  // Aurora
  const aurora=document.createElement('div');
  aurora.id='aurora-overlay';
  document.body.appendChild(aurora);

  // Snow layer (for dense snowflake effects)
  const snow=document.createElement('div');
  snow.id='snow-layer';
  document.body.appendChild(snow);

  // Winter Hub Modal
  const hub=document.createElement('div');
  hub.id='winter-hub';
  hub.innerHTML=`
  <div class="wh-panel" id="wh-panel">
    <div class="wh-header">
      <div class="wh-title">❄️ Winter Hub</div>
      <button class="wh-close" onclick="closeWinterHub()">✕</button>
    </div>
    <div class="wh-tabs" id="wh-tabs">
      <button class="wh-tab wh-active" onclick="setWHTab('fishing')" id="wht-fishing">🎣 Fishing</button>
      <button class="wh-tab" onclick="setWHTab('mining')" id="wht-mining">⛏️ Mining</button>
      <button class="wh-tab" onclick="setWHTab('crafting')" id="wht-crafting">🔨 Crafting</button>
      <button class="wh-tab" onclick="setWHTab('animals')" id="wht-animals">🐄 Animals</button>
      <button class="wh-tab" onclick="setWHTab('activities')" id="wht-activities">📋 Events</button>
      <button class="wh-tab" onclick="setWHTab('materials')" id="wht-materials">🎒 Stash</button>
    </div>
    <div class="wh-body" id="wh-body"></div>
  </div>`;
  hub.addEventListener('click',e=>{if(e.target===hub)closeWinterHub();});
  document.body.appendChild(hub);

  // Winter Hub Button in toolbar
  const toolbar=document.getElementById('toolbar');
  if(toolbar){
    const btn=document.createElement('button');
    btn.id='winter-hub-btn';
    btn.textContent='❄️ Winter Hub';
    btn.onclick=openWinterHub;
    // Insert before the spacer or at start
    const spacer=toolbar.querySelector('.spacer');
    if(spacer)toolbar.insertBefore(btn,spacer);
    else toolbar.prepend(btn);
  }
}

/* ══════════════════════════════════════════════════════════
   WINTER HUB UI CONTROLLER
══════════════════════════════════════════════════════════ */
let _whTab='fishing';

window.openWinterHub=function(){
  if(!isWinter()){wToast('❄️ The Winter Hub opens in Winter!','info');return;}
  ensureWinterState();
  document.getElementById('winter-hub').classList.add('wh-open');
  setWHTab(_whTab);
};
window.closeWinterHub=function(){
  document.getElementById('winter-hub').classList.remove('wh-open');
};
window.setWHTab=function(tab){
  _whTab=tab;
  document.querySelectorAll('.wh-tab').forEach(b=>b.classList.remove('wh-active'));
  const active=document.getElementById('wht-'+tab);
  if(active)active.classList.add('wh-active');
  renderWHContent(tab);
};

function refreshWinterHub(){
  if(document.getElementById('winter-hub').classList.contains('wh-open')){
    renderWHContent(_whTab);
  }
}

function renderWHContent(tab){
  const body=document.getElementById('wh-body');
  if(!body)return;
  if(tab==='fishing') body.innerHTML=buildFishingTab();
  else if(tab==='mining')   body.innerHTML=buildMiningTab();
  else if(tab==='crafting') body.innerHTML=buildCraftingTab();
  else if(tab==='animals')  body.innerHTML=buildAnimalsTab();
  else if(tab==='activities')body.innerHTML=buildActivitiesTab();
  else if(tab==='materials') body.innerHTML=buildMaterialsTab();
  // Bind interactive elements after render
  bindMineClicks();
  bindFishBar();
  bindSellBtns();
}

/* ══════════════════════════════════════════════════════════
   🎣 FISHING TAB
══════════════════════════════════════════════════════════ */
let _fishState={active:false,pos:0,dir:1,speed:1.2,zone:{start:0.35,end:0.65},
  timer:null,attempts:3,result:''};

function buildFishingTab(){
  const land=G.currentLand||'home';
  const pool=FISH_POOLS[land]||FISH_POOLS.home;
  const landName=(typeof LAND_TERRAIN!=='undefined'&&LAND_TERRAIN[land])||{label:'Home Farm',icon:'🏡'};
  const energyCost=4;

  let h=`<div class="fish-scene">
    <div class="fish-hole">🧊</div>
    <div class="fish-land-tag">${landName.icon} ${landName.label} — Ice Fishing</div>
    <div class="fish-attempts" id="fish-attempts">Attempts left: <b>${_fishState.attempts}</b> · Costs ${energyCost}⚡ each</div>
    <div style="font-size:11px;color:var(--text-muted);margin-bottom:8px">Tap the bar when 🪝 is in the green zone!</div>
    <div class="fish-bar-wrap" id="fish-bar-wrap">
      <div class="fish-zone" id="fish-zone" style="left:${_fishState.zone.start*100}%;width:${(_fishState.zone.end-_fishState.zone.start)*100}%"></div>
      <div class="fish-indicator" id="fish-indicator" style="left:${_fishState.pos*100}%">🪝</div>
    </div>
    <div class="fish-result" id="fish-result">${_fishState.result}</div>
    <button class="fish-btn" id="fish-cast-btn" onclick="doFishCast(${energyCost})">
      ${_fishState.attempts>0?'🎣 Cast Line!':'😔 Out of attempts — sleep to reset'}
    </button>
  </div>
  <div class="w-section-hd" style="margin-top:12px">Possible Catch at this location</div>
  <div class="fish-pool-list">`;

  pool.forEach(p=>{
    const m=MAT[p.t];
    if(!m)return;
    const isRare=m.rare;
    h+=`<div class="fish-pool-item${isRare?' rare':''}">${m.e} ${m.n} · ${m.sell}g${isRare?' ⭐':''}</div>`;
  });
  h+=`</div>`;

  // Show fish in stash
  const fishInStash=Object.entries(mats()).filter(([k])=>MAT[k]&&MAT[k].cat==='fish');
  if(fishInStash.length){
    h+=`<div class="w-section-hd" style="margin-top:12px">Fish in Stash</div>
    <div class="mat-grid">`;
    fishInStash.forEach(([k,q])=>{
      const m=MAT[k];
      const price=matSellPrice(k);
      h+=`<div class="mat-card${m.rare?' rare-mat':''}">
        <span class="mat-card-em">${m.e}</span>
        <div class="mat-card-name">${m.n}</div>
        <div>×${q}</div>
        <button class="mat-sell-btn" data-sell-mat="${k}" data-sell-qty="1">Sell 1 · ${price}g</button>
      </div>`;
    });
    h+=`</div>`;
  }
  return h;
}

function bindFishBar(){
  const wrap=document.getElementById('fish-bar-wrap');
  if(!wrap)return;
  wrap.addEventListener('click',()=>checkFishCatch());
  wrap.addEventListener('touchstart',e=>{e.preventDefault();checkFishCatch();},{passive:false});
}

window.doFishCast=function(energyCost){
  if(!isWinter()){wToast('❄️ Ice fishing only in Winter!','info');return;}
  if(_fishState.attempts<=0){wToast('No attempts left! Sleep to reset.','warn');return;}
  if(G.energy<energyCost){wToast('Not enough energy!','error');return;}
  if(_fishState.active)return;

  G.energy=Math.max(0,G.energy-(S.energyCost?energyCost:0));
  _fishState.attempts--;
  _fishState.active=true;
  _fishState.pos=Math.random();
  _fishState.dir=Math.random()>0.5?1:-1;
  _fishState.speed=0.8+Math.random()*1.4;
  // Randomize zone
  const zw=0.18+Math.random()*0.18;
  const zs=Math.random()*(0.85-zw);
  _fishState.zone={start:zs,end:zs+zw};
  _fishState.result='';

  const fz=document.getElementById('fish-zone');
  const fi=document.getElementById('fish-indicator');
  const attEl=document.getElementById('fish-attempts');
  const btn=document.getElementById('fish-cast-btn');
  if(fz)fz.style.cssText=`left:${_fishState.zone.start*100}%;width:${(_fishState.zone.end-_fishState.zone.start)*100}%`;
  if(btn)btn.disabled=true;
  if(attEl)attEl.innerHTML=`Attempts left: <b>${_fishState.attempts}</b> · Now — CATCH IT!`;

  clearInterval(_fishState.timer);
  _fishState.timer=setInterval(()=>{
    _fishState.pos+=_fishState.dir*_fishState.speed*0.018;
    if(_fishState.pos>=1){_fishState.pos=1;_fishState.dir=-1;}
    if(_fishState.pos<=0){_fishState.pos=0;_fishState.dir=1;}
    // small random jitter
    _fishState.speed+=((Math.random()-0.5)*0.08);
    _fishState.speed=Math.max(0.6,Math.min(2.2,_fishState.speed));
    if(fi)fi.style.left=((_fishState.pos)*100)+'%';
  },40);

  // Auto-fail after 4 seconds
  setTimeout(()=>{
    if(_fishState.active){
      _fishState.active=false;
      clearInterval(_fishState.timer);
      _fishState.result='💨 Got away!';
      if(typeof renderHUD==='function')renderHUD();
      renderWHContent('fishing');
    }
  },4000);
};

function checkFishCatch(){
  if(!_fishState.active)return;
  _fishState.active=false;
  clearInterval(_fishState.timer);

  const hit=_fishState.pos>=_fishState.zone.start&&_fishState.pos<=_fishState.zone.end;
  const res=document.getElementById('fish-result');
  if(hit){
    const land=G.currentLand||'home';
    const pool=FISH_POOLS[land]||FISH_POOLS.home;
    const caught=pickPool(pool);
    addMat(caught,1);
    const m=MAT[caught];
    _fishState.result=`${m.e} Caught ${m.n}! (+${m.sell}g value)`;
    if(typeof snd==='function')snd('harvest');
    wToast(`🎣 Caught ${m.e} ${m.n}!`,'success',2400);
    if(typeof addXP==='function')addXP('harvesting',8);
  } else {
    _fishState.result='💨 Missed! Try again.';
    if(typeof snd==='function')snd('error');
  }
  if(res)res.textContent=_fishState.result;
  if(typeof renderHUD==='function')renderHUD();
  setTimeout(()=>renderWHContent('fishing'),600);
}

/* ══════════════════════════════════════════════════════════
   ⛏️ MINING TAB
══════════════════════════════════════════════════════════ */
const MINE_ROWS=4,MINE_COLS=5;

function genMineGrid(land){
  const pool=MINE_POOLS[land]||MINE_POOLS._def;
  const grid=[];
  for(let r=0;r<MINE_ROWS;r++){
    const row=[];
    for(let c=0;c<MINE_COLS;c++){
      // 60% chance of ore, 40% empty rock
      const hasOre=Math.random()<0.62;
      row.push({type:hasOre?pickPool(pool):null,mined:false});
    }
    grid.push(row);
  }
  return grid;
}

function buildMiningTab(){
  const land=G.currentLand||'home';
  const w=wdata();
  const canMine=['hillfarm','volcanic','home','meadow','riverbank','lowland'].includes(land);
  const energyCost=3;

  if(!canMine)return`<div style="text-align:center;padding:24px;font-size:13px;color:var(--text-muted)">
    ⛏️ No cave access at this location. Travel to Hill Farm or Volcanic Ridge for the best ore!</div>`;

  if(!w.mineGrid||w.mineGrid.every(row=>row.every(t=>t.mined))){
    w.mineGrid=genMineGrid(land);
    w.mineDepth=(w.mineDepth||0)+1;
  }

  const grid=w.mineGrid;
  const remaining=grid.flat().filter(t=>!t.mined).length;
  const landLabel=(typeof LAND_TERRAIN!=='undefined'&&LAND_TERRAIN[land])||{label:'Farm',icon:'⛏️'};
  const bonusNote=w.mineBonus?'<span style="color:#22c55e;font-weight:700"> ✨ Ice Spirit Bonus!</span>':'';

  let h=`<div class="mine-info">
    <span class="mine-depth">⛏️ Depth ${w.mineDepth||1} · ${landLabel.icon} ${landLabel.label}</span>
    <span>${remaining}/${MINE_ROWS*MINE_COLS} tiles · ${energyCost}⚡ each${bonusNote}</span>
  </div>`;

  h+=`<div class="mine-stat-row">`;
  // Quick summary of ore in stash
  ['iron_ore','coal','gold_ore','crystal','vol_shard','fossil'].forEach(k=>{
    const q=mats()[k]||0;
    if(q>0||['iron_ore','coal'].includes(k)){
      const m=MAT[k];
      h+=`<div class="mine-stat">${m.e}<span>${q}</span>${m.n.split(' ')[0]}</div>`;
    }
  });
  h+=`</div>`;

  h+=`<div class="mine-grid">`;
  grid.forEach((row,r)=>{
    row.forEach((tile,c)=>{
      if(tile.mined){
        const em=tile.type?MAT[tile.type]?.e||'🪨':'·';
        h+=`<div class="mine-tile mined${tile.type?' mined-ore':' empty-rock'}">${em}</div>`;
      } else {
        h+=`<div class="mine-tile" data-mine-r="${r}" data-mine-c="${c}">🪨</div>`;
      }
    });
  });
  h+=`</div>`;

  h+=`<div style="font-size:10px;color:var(--text-muted);text-align:center;margin-bottom:8px">
    Tap a rock to mine it (costs ${energyCost}⚡). Ore goes to your Stash.</div>`;

  if(remaining===0){
    h+=`<button class="mine-refresh-btn" onclick="refreshMineGrid()">⛏️ Dig Deeper (new grid)</button>`;
  }

  // Show mineable ores in stash
  const oresInStash=Object.entries(mats()).filter(([k])=>MAT[k]&&['ore','gem','artifact','fuel'].includes(MAT[k].cat));
  if(oresInStash.length){
    h+=`<div class="w-section-hd" style="margin-top:12px">Ore & Gems in Stash</div>
    <div class="mat-grid">`;
    oresInStash.forEach(([k,q])=>{
      const m=MAT[k];if(!m)return;
      const price=matSellPrice(k);
      h+=`<div class="mat-card${m.rare?' rare-mat':''}">
        <span class="mat-card-em">${m.e}</span>
        <div class="mat-card-name">${m.n}</div>
        <div>×${q}</div>
        <button class="mat-sell-btn" data-sell-mat="${k}" data-sell-qty="1">Sell 1 · ${price}g</button>
      </div>`;
    });
    h+=`</div>`;
  }
  return h;
}

function bindMineClicks(){
  document.querySelectorAll('[data-mine-r]').forEach(el=>{
    el.addEventListener('click',()=>{
      const r=parseInt(el.dataset.mineR);
      const c=parseInt(el.dataset.mineC);
      doMineTile(r,c);
    });
  });
}

window.refreshMineGrid=function(){
  wdata().mineGrid=null;
  renderWHContent('mining');
};

function doMineTile(r,c){
  const w=wdata();
  if(!w.mineGrid||!w.mineGrid[r]||w.mineGrid[r][c].mined)return;
  const cost=3;
  if(G.energy<cost&&S.energyCost){wToast('Need '+cost+' energy!','error');return;}
  if(S.energyCost)G.energy=Math.max(0,G.energy-cost);
  const tile=w.mineGrid[r][c];
  tile.mined=true;
  if(tile.type){
    const qty=(w.pickUpgrade&&Math.random()<0.35)?2:1;
    const extraBonus=w.mineBonus&&Math.random()<0.3?1:0;
    const total=qty+extraBonus;
    addMat(tile.type,total);
    const m=MAT[tile.type];
    if(typeof snd==='function')snd('till');
    wToast(`⛏️ Found ${m.e} ${m.n}${total>1?' ×'+total:''}!`,m.rare?'success':'info',1800);
    if(typeof addXP==='function')addXP('farming',6);
  } else {
    if(typeof snd==='function')snd('till');
  }
  if(typeof renderHUD==='function')renderHUD();
  renderWHContent('mining');
}

/* ══════════════════════════════════════════════════════════
   🔨 CRAFTING TAB
══════════════════════════════════════════════════════════ */
function buildCraftingTab(){
  let h=`<div style="font-size:11px;color:var(--text-muted);margin-bottom:10px;line-height:1.5">
    Combine materials from fishing, mining, foraging & animals to craft useful items and consumables!</div>`;

  RECIPES.forEach(recipe=>{
    const canCraft=Object.entries(recipe.ing).every(([t,q])=>hasMat(t,q));
    h+=`<div class="craft-recipe${canCraft?' can-craft':''}">
      <div class="craft-recipe-top">
        <div class="craft-recipe-name">${recipe.e} ${recipe.n}</div>
        ${recipe.out?`<div style="font-size:10px;color:var(--text-muted)">${MAT[recipe.out]?matSellPrice(recipe.out)+'g':'—'}</div>`:''}
      </div>
      <div class="craft-recipe-desc">${recipe.desc}</div>
      <div class="craft-ing">`;
    Object.entries(recipe.ing).forEach(([t,q])=>{
      const m=MAT[t];if(!m)return;
      const have=hasMat(t,q);
      const owned=(mats()[t]||0);
      h+=`<div class="craft-ing-tag ${have?'have':'miss'}">${m.e} ${m.n} ×${q} (have ${owned})</div>`;
    });
    h+=`</div>
      <button class="craft-btn" data-craft="${recipe.id}" ${canCraft?'':'disabled'}>
        ${canCraft?`🔨 Craft ${recipe.e} ${recipe.n}`:'Missing ingredients'}
      </button>
    </div>`;
  });
  return h;
}

document.addEventListener('click',e=>{
  const craftBtn=e.target.closest('[data-craft]');
  if(craftBtn)doCraft(craftBtn.dataset.craft);
});

function doCraft(recipeId){
  const recipe=RECIPES.find(r=>r.id===recipeId);
  if(!recipe)return;
  const canCraft=Object.entries(recipe.ing).every(([t,q])=>hasMat(t,q));
  if(!canCraft){wToast('Missing ingredients!','error');return;}
  // Deduct ingredients
  Object.entries(recipe.ing).forEach(([t,q])=>rmMat(t,q));
  // Apply effect
  const eff=recipe.eff;
  if(eff){
    if(eff.type==='energy'){
      G.energy=Math.min(maxEnergy(),G.energy+eff.val);
      wToast(`${recipe.e} Used! Restored +${eff.val} energy ⚡`,'success');
      if(typeof renderHUD==='function')renderHUD();
    } else if(eff.type==='fuel'){
      const w=wdata();
      w.fuel=Math.min(w.fuelMax,w.fuel+eff.val);
      wToast(`🔥 Added +${eff.val} heating fuel!`,'success');
    } else if(eff.type==='fuel_max'){
      wdata().fuelMax=(wdata().fuelMax||100)+eff.val;
      wToast(`🧣 Max fuel capacity increased to ${wdata().fuelMax}!`,'success');
    } else if(eff.type==='mine_upgrade'){
      wdata().pickUpgrade=true;
      wToast('⛏️ Iron Pickaxe crafted! Mining yields +1 ore chance!','success',3500);
    }
  }
  // Add output item
  if(recipe.out&&recipe.outQty>0){
    addMat(recipe.out,recipe.outQty);
    const m=MAT[recipe.out];
    if(m&&!eff){
      wToast(`🔨 Crafted ${m.e} ${m.n}! (${matSellPrice(recipe.out)}g)`,'success');
    }
  }
  if(typeof snd==='function')snd('levelup');
  refreshWinterHub();
}

/* ══════════════════════════════════════════════════════════
   🐄 ANIMALS TAB
══════════════════════════════════════════════════════════ */
function buildAnimalsTab(){
  const w=wdata();
  let h=`<div style="font-size:11px;color:var(--text-muted);margin-bottom:10px;line-height:1.5">
    Buy animals to produce resources daily. Feed them each morning to earn produce!</div>`;

  // Heating note if fuel low
  if(w.fuel<25){
    h+=`<div style="background:#fef2f2;border:1.5px solid #fca5a5;border-radius:10px;padding:8px 10px;
      font-size:11px;font-weight:700;color:#dc2626;margin-bottom:10px">
      🥶 Fuel is low — animals may not produce if heating fails!</div>`;
  }

  Object.entries(ANIMALS).forEach(([k,a])=>{
    const count=w.animals[k]||0;
    const fed=w.animalFed[k]||false;
    const canBuy=G.gold>=a.cost;
    h+=`<div class="animal-card${count>0?' owned':''}">
      <div class="animal-header">
        <div class="animal-name">${a.e} ${a.n}</div>
        <div class="animal-count">${count>0?'×'.repeat(count):''}</div>
      </div>
      <div class="animal-desc">${a.desc} · Costs ${a.feed}g/day to feed</div>
      ${count>0&&fed?`<div class="animal-fed-badge">✓ Fed today</div>`:
        count>0?`<div style="font-size:10px;color:#dc2626;font-weight:700">😔 Not fed today — no produce!</div>`:''}
      <div class="animal-btn-row" style="margin-top:8px">
        <button class="animal-btn animal-buy-btn" data-buy-animal="${k}" ${canBuy?'':'disabled'}>
          ${count>0?`Buy More · ${a.cost}g`:`Buy ${a.e} · ${a.cost}g`}
        </button>
        ${count>0?`<button class="animal-btn animal-feed-btn" data-feed-animal="${k}" ${fed||G.gold<a.feed?'disabled':''}>
          ${fed?'✓ Fed':'Feed · '+a.feed+'g'}
        </button>`:''}
      </div>
    </div>`;
  });

  // Animal products in stash
  const prodInStash=Object.entries(mats()).filter(([k])=>MAT[k]&&MAT[k].cat==='animal');
  if(prodInStash.length){
    h+=`<div class="w-section-hd" style="margin-top:12px">Animal Products in Stash</div>
    <div class="mat-grid">`;
    prodInStash.forEach(([k,q])=>{
      const m=MAT[k];if(!m)return;
      const price=matSellPrice(k);
      h+=`<div class="mat-card">
        <span class="mat-card-em">${m.e}</span>
        <div class="mat-card-name">${m.n}</div>
        <div>×${q}</div>
        <button class="mat-sell-btn" data-sell-mat="${k}" data-sell-qty="1">Sell 1 · ${price}g</button>
      </div>`;
    });
    h+=`</div>`;
  }
  return h;
}

document.addEventListener('click',e=>{
  const buyBtn=e.target.closest('[data-buy-animal]');
  if(buyBtn)doBuyAnimal(buyBtn.dataset.buyAnimal);
  const feedBtn=e.target.closest('[data-feed-animal]');
  if(feedBtn)doFeedAnimal(feedBtn.dataset.feedAnimal);
});

function doBuyAnimal(k){
  const a=ANIMALS[k];if(!a)return;
  if(G.gold<a.cost){wToast('Need '+a.cost+'g!','error');return;}
  G.gold-=a.cost;
  const w=wdata();
  w.animals[k]=(w.animals[k]||0)+1;
  if(typeof snd==='function')snd('buy');
  wToast(`${a.e} ${a.n} purchased! Feed them daily for produce.`,'success',3000);
  if(typeof renderHUD==='function')renderHUD();
  refreshWinterHub();
}
function doFeedAnimal(k){
  const a=ANIMALS[k];if(!a)return;
  if(G.gold<a.feed){wToast('Need '+a.feed+'g to feed!','error');return;}
  G.gold-=a.feed;
  wdata().animalFed[k]=true;
  if(typeof snd==='function')snd('buy');
  wToast(`🌾 ${ANIMALS[k].e} ${ANIMALS[k].n} fed! They'll produce tomorrow.`,'success',2200);
  if(typeof renderHUD==='function')renderHUD();
  refreshWinterHub();
}

/* ══════════════════════════════════════════════════════════
   📋 ACTIVITIES / EVENTS TAB
══════════════════════════════════════════════════════════ */
function buildActivitiesTab(){
  const w=wdata();
  let h='';

  // Fuel block
  const pct=Math.round((w.fuel/(w.fuelMax||100))*100);
  const fuelColor=pct>50?'#22c55e':pct>25?'#f59e0b':'#ef4444';
  h+=`<div class="w-section-hd">🔥 Winter Heating</div>
  <div class="winter-fuel-block">
    <div class="wfb-row">
      <span class="wfb-label">🔥 Fuel</span>
      <div class="wfb-bar" style="flex:1;height:8px;background:var(--ui-bg2);border-radius:4px;overflow:hidden;border:1px solid var(--ui-border);margin:0 8px">
        <div class="wfb-fill" style="width:${pct}%;background:${fuelColor}"></div>
      </div>
      <span class="wfb-val">${w.fuel}/${w.fuelMax||100}</span>
    </div>
    <div class="wfb-tip">Fuel depletes ${w.fuelDrain||5}/day. Below 20: energy penalty! Craft Coal Fuel to refill.
    ${(mats().coal||0)>0?`<br>💡 You have ${mats().coal||0} coal — craft Coal Fuel in Crafting tab!`:''}</div>
  </div>`;

  // Today's event
  if(w.eventToday){
    const ev=EVENTS.find(e=>e.id===w.eventToday);
    if(ev){
      h+=`<div class="w-section-hd">Today's Event</div>
      <div class="w-event-card">
        <div class="w-event-name">${ev.n}</div>
        <div class="w-event-msg">${ev.msg}</div>
      </div>`;
    }
  }

  // Merchant stock
  if(w.merchantDay===G.day&&w.merchantItems&&w.merchantItems.length){
    h+=`<div class="w-section-hd">🛒 Traveling Merchant</div>`;
    w.merchantItems.forEach((item,idx)=>{
      const m=MAT[item.type];if(!m)return;
      h+=`<div class="merchant-item">
        <div>
          <div style="font-size:14px;font-weight:800">${m.e} ${m.n}</div>
          <div style="font-size:10px;color:var(--text-muted)">×${item.qty} offered</div>
        </div>
        <button class="merchant-buy-btn" data-merch="${idx}" ${G.gold>=item.price?'':'disabled'}>
          Buy · ${item.price}g
        </button>
      </div>`;
    });
  }

  // Forageables on current farm
  h+=`<div class="w-section-hd" style="margin-top:12px">🌿 Forage (collect on farm grid)</div>`;
  const forageOnFarm=w.forage&&w.forage.filter(f=>!f.collected&&f.land===(G.currentLand||'home'));
  if(forageOnFarm&&forageOnFarm.length){
    h+=`<div style="font-size:11px;color:var(--text-muted);margin-bottom:6px">Glowing items on your farm grid — tap them to collect!</div>`;
    forageOnFarm.forEach(f=>{
      const m=MAT[f.type];if(!m)return;
      h+=`<div style="font-size:11px;font-weight:700;color:var(--text-primary);margin-bottom:3px">${m.e} ${m.n} at row ${f.r+1}, col ${f.c+1} · ${m.sell}g</div>`;
    });
  } else {
    h+=`<div style="font-size:11px;color:var(--text-muted)">No forage items right now. Sleep to find new ones each morning!</div>`;
  }

  // Event log
  if(w.eventLog&&w.eventLog.length){
    h+=`<div class="w-section-hd" style="margin-top:12px">Recent Events</div>`;
    w.eventLog.slice(-5).reverse().forEach(entry=>{
      h+=`<div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;border-bottom:1px solid var(--ui-border);padding-bottom:4px">
        <b style="color:var(--text-primary)">Day ${entry.day}:</b> ${entry.n} — ${entry.msg.substring(0,60)}${entry.msg.length>60?'…':''}</div>`;
    });
  }
  return h;
}

document.addEventListener('click',e=>{
  const mb=e.target.closest('[data-merch]');
  if(mb)doMerchantBuy(parseInt(mb.dataset.merch));
});
function doMerchantBuy(idx){
  const w=wdata();
  const item=w.merchantItems&&w.merchantItems[idx];
  if(!item)return;
  if(G.gold<item.price){wToast('Need '+item.price+'g!','error');return;}
  G.gold-=item.price;
  addMat(item.type,item.qty);
  w.merchantItems.splice(idx,1);
  if(typeof snd==='function')snd('buy');
  const m=MAT[item.type];
  wToast(`Bought ${m.e} ${m.n} ×${item.qty} from merchant!`,'success',2600);
  if(typeof renderHUD==='function')renderHUD();
  refreshWinterHub();
}

/* ══════════════════════════════════════════════════════════
   🎒 MATERIALS STASH TAB
══════════════════════════════════════════════════════════ */
function buildMaterialsTab(){
  const allMats=Object.entries(mats()).filter(([,q])=>q>0);
  if(!allMats.length){
    return`<div style="text-align:center;padding:24px;font-size:13px;color:var(--text-muted)">
      Your stash is empty! Go fishing, mining, or foraging to fill it up.</div>`;
  }
  const cats={fish:'🐟 Fish',ore:'⛏️ Ore',gem:'💎 Gems',artifact:'🏺 Artifacts',
    herb:'🌿 Herbs',wood:'🪵 Wood',fuel:'🔥 Fuel',animal:'🐄 Animal Products',crafted:'🔨 Crafted'};
  let h='';
  Object.entries(cats).forEach(([cat,label])=>{
    const catMats=allMats.filter(([k])=>MAT[k]&&MAT[k].cat===cat);
    if(!catMats.length)return;
    h+=`<div class="w-section-hd">${label}</div>
    <div class="mat-grid">`;
    catMats.forEach(([k,q])=>{
      const m=MAT[k];if(!m)return;
      const price=matSellPrice(k);
      const isConsume=m.consume;
      h+=`<div class="mat-card${m.rare?' rare-mat':''}">
        <span class="mat-card-em">${m.e}</span>
        <div class="mat-card-name">${m.n}</div>
        <div>×${q}</div>
        ${isConsume
          ?`<button class="mat-sell-btn" style="background:#16a34a" data-consume-mat="${k}">Use (+${m.energyRestore}⚡)</button>`
          :`<button class="mat-sell-btn" data-sell-mat="${k}" data-sell-qty="1">Sell 1 · ${price}g</button>`
        }
      </div>`;
    });
    h+=`</div>`;
  });

  // Sell all button
  const totalVal=allMats.reduce((s,[k,q])=>{
    const m=MAT[k];
    if(!m||m.consume)return s;
    return s+matSellPrice(k)*q;
  },0);
  if(totalVal>0){
    h+=`<button onclick="sellAllMats()" style="width:100%;padding:10px;border:none;border-radius:10px;
      background:linear-gradient(135deg,#16a34a,#22c55e);color:#fff;font-size:13px;font-weight:800;
      cursor:pointer;margin-top:6px;font-family:'Baloo 2',cursive">
      💰 Sell Everything · ${totalVal}g</button>`;
  }
  return h;
}

window.sellAllMats=function(){
  const all=Object.entries(mats()).filter(([k,q])=>q>0&&MAT[k]&&!MAT[k].consume);
  let total=0;
  all.forEach(([k,q])=>{
    total+=matSellPrice(k)*q;
    delete mats()[k];
  });
  if(!total){wToast('Nothing to sell!','warn');return;}
  G.gold+=total;G.stats.earned+=total;G.yearEarned=(G.yearEarned||0)+total;
  if(typeof snd==='function')snd('coin');
  wToast(`💰 Sold all materials for ${total}g!`,'success',3200);
  if(typeof renderHUD==='function')renderHUD();
  refreshWinterHub();
};

function bindSellBtns(){
  document.querySelectorAll('[data-sell-mat]').forEach(btn=>{
    btn.addEventListener('click',()=>sellMat(btn.dataset.sellMat,parseInt(btn.dataset.sellQty)||1));
  });
  document.querySelectorAll('[data-consume-mat]').forEach(btn=>{
    btn.addEventListener('click',()=>consumeMat(btn.dataset.consumeMat));
  });
}
function consumeMat(k){
  const m=MAT[k];if(!m||!m.consume)return;
  if(!hasMat(k,1)){wToast('None left!','error');return;}
  rmMat(k,1);
  if(m.energyRestore){
    G.energy=Math.min(maxEnergy(),G.energy+m.energyRestore);
    if(typeof renderHUD==='function')renderHUD();
    wToast(`${m.e} Consumed! Restored +${m.energyRestore} energy ⚡`,'success');
  }
  refreshWinterHub();
}

/* ══════════════════════════════════════════════════════════
   🌿 FORAGE SYSTEM (tiles on farm grid)
══════════════════════════════════════════════════════════ */
function spawnForageItems(){
  if(!isWinter())return;
  const w=wdata();
  if(!w.forage)w.forage=[];
  // Remove old uncollected items (max age 2 days)
  w.forage=w.forage.filter(f=>!f.collected&&(G.day-f.day)<=1);

  const land=G.currentLand||'home';
  const pool=FORAGE_POOLS[land]||FORAGE_POOLS.home;
  const numSpawn=w.forageBonus?3:(1+Math.floor(Math.random()*2));

  for(let i=0;i<numSpawn;i++){
    // Find a random empty, non-tilled, non-tree tile
    let attempts=0;
    while(attempts<30){
      const r=1+Math.floor(Math.random()*(GH-2));
      const c=1+Math.floor(Math.random()*(GW-2));
      const tile=G.farm[r][c];
      const alreadySpawned=w.forage.some(f=>f.r===r&&f.c===c&&!f.collected&&f.land===land);
      if(!tile.tilled&&!tile.crop&&!tile.deco&&!alreadySpawned){
        w.forage.push({r,c,type:pickPool(pool),day:G.day,land,collected:false});
        break;
      }
      attempts++;
    }
  }
  w.forageBonus=false;
}

function renderForageOnGrid(){
  if(!isWinter())return;
  const w=wdata();
  if(!w.forage)return;
  const land=G.currentLand||'home';
  const grid=document.getElementById('farm-grid');
  if(!grid)return;
  w.forage.filter(f=>!f.collected&&f.land===land).forEach(f=>{
    const idx=f.r*GW+f.c;
    const el=grid.children[idx];
    if(!el||el.classList.contains('tile-tree'))return;
    const m=MAT[f.type];if(!m)return;
    // Overlay a forage emoji on top
    if(!el.querySelector('.forage-mark')){
      const mark=document.createElement('span');
      mark.className='forage-mark forage-tile';
      mark.textContent=m.e;
      mark.style.cssText='position:absolute;top:1px;right:1px;font-size:14px;pointer-events:none;z-index:5';
      el.style.position='relative';
      el.appendChild(mark);
      // On click, try to collect
      const oldClick=el.onclick;
      el._forageHandler=function(ev){
        collectForage(f.r,f.c,land);
      };
      el.addEventListener('click',el._forageHandler,{once:true});
    }
  });
}

function collectForage(r,c,land){
  const w=wdata();
  if(!w.forage)return;
  const idx=w.forage.findIndex(f=>f.r===r&&f.c===c&&f.land===land&&!f.collected);
  if(idx===-1)return;
  const item=w.forage[idx];
  item.collected=true;
  addMat(item.type,1);
  const m=MAT[item.type];
  if(typeof snd==='function')snd('harvest');
  wToast(`🌿 Found ${m.e} ${m.n}! (${m.sell}g)`,m.rare?'success':'info',2200);
  if(typeof addXP==='function')addXP('harvesting',5);
  if(typeof render==='function')render();
}

/* ══════════════════════════════════════════════════════════
   🌨️ EVENTS SYSTEM
══════════════════════════════════════════════════════════ */
function rollDailyEvent(){
  if(!isWinter())return;
  // ~60% chance of event per day in winter
  if(Math.random()>0.60)return;
  const total=EVENTS.reduce((s,e)=>s+e.w,0);
  let r=Math.random()*total;
  let ev=null;
  for(const e of EVENTS){r-=e.w;if(r<=0){ev=e;break;}}
  if(!ev)return;
  applyEvent(ev);
}

function applyEvent(ev){
  const w=wdata();
  w.eventToday=ev.id;
  if(!w.eventLog)w.eventLog=[];
  w.eventLog.push({id:ev.id,n:ev.n,msg:ev.msg,day:G.day});
  if(w.eventLog.length>10)w.eventLog.shift();

  // Delayed toast for events
  setTimeout(()=>{
    wToast(ev.n+' — '+ev.msg.substring(0,50),'warn',4500);
  },1800);

  switch(ev.eff){
    case'energy_penalty':
      w.energyPenalty=20;
      break;
    case'merchant':
      // Generate 3 random merchant items
      const pool=['iron_ore','coal','crystal','vol_shard','fossil','winter_herb','frozen_relic','pine_branch'];
      w.merchantItems=pool.sort(()=>Math.random()-.5).slice(0,3).map(t=>{
        const m=MAT[t];
        return{type:t,qty:1+Math.floor(Math.random()*2),price:Math.round(m.sell*0.7)};
      });
      w.merchantDay=G.day;
      break;
    case'gold':
      const bonus=50+Math.floor(Math.random()*120);
      setTimeout(()=>{
        G.gold+=bonus;
        if(typeof renderHUD==='function')renderHUD();
        wToast(`💰 Found ${bonus}g in the frozen chest!`,'success',3000);
      },2200);
      break;
    case'xp_boost':
      if(typeof addXP==='function'){
        addXP('farming',30);addXP('harvesting',30);addXP('watering',30);
      }
      break;
    case'forage_gift':
      addMat('firewood',2);addMat('winter_herb',1+Math.floor(Math.random()*2));
      setTimeout(()=>wToast('🏚️ Gathered 2× firewood & herbs from old cabin!','success',3000),2000);
      break;
    case'crystal_gift':
      addMat('crystal',1);if(Math.random()<0.4)addMat('vol_shard',1);
      setTimeout(()=>wToast('✨ Ice spirit left crystals on your doorstep!','success',3000),2000);
      break;
    case'fuel_drain':
      w.fuel=Math.max(0,(w.fuel||60)-10);
      break;
    case'price_boost':
      w.priceBoost=true;w.priceDaysLeft=1;
      setTimeout(()=>wToast('📈 Material prices are +25% today!','success',3000),2000);
      break;
    case'atmosphere':
      // Just a visual/flavor event
      break;
    case'wool_gift':
      addMat('wool',1);
      setTimeout(()=>wToast('🐇 Snow hare left a tuft of wool!','success',2500),1800);
      break;
  }
}

/* ══════════════════════════════════════════════════════════
   🔥 SURVIVAL: FUEL SYSTEM
══════════════════════════════════════════════════════════ */
function processFuel(){
  if(!isWinter())return;
  const w=wdata();
  const drain=w.fuelDrain||5;
  w.fuel=Math.max(0,(w.fuel||60)-drain);
  if(w.fuel<=0){
    // Energy penalty
    const penalty=w.energyPenalty||0;
    G.energy=Math.max(10,G.energy-20-penalty);
    setTimeout(()=>wToast('🥶 No heating fuel! Energy reduced overnight. Mine coal or craft fuel!','error',4000),2400);
  } else if(w.fuel<=20){
    setTimeout(()=>wToast('⚠️ Heating fuel is very low ('+w.fuel+')! Craft Coal Fuel soon.','warn',3500),2500);
  }
  // Clear blizzard energy penalty for next day
  w.energyPenalty=0;
}

function processAnimals(){
  if(!isWinter())return;
  const w=wdata();
  Object.entries(w.animals||{}).forEach(([k,count])=>{
    if(count<=0)return;
    const a=ANIMALS[k];if(!a)return;
    if(w.animalFed[k]){
      // Produce goods (only if has fuel)
      if((w.fuel||0)>0){
        const qty=a.qty*count;
        addMat(a.produce,qty);
        setTimeout(()=>wToast(`${a.e} Your ${a.n}s produced ${qty}× ${MAT[a.produce]?.e||''} ${MAT[a.produce]?.n||a.produce}!`,'info',2600),3000);
      }
    }
    // Reset fed status
    w.animalFed[k]=false;
  });
}

function processPriceBoost(){
  const w=wdata();
  if(w.priceBoost){
    w.priceDaysLeft=(w.priceDaysLeft||0)-1;
    if(w.priceDaysLeft<=0){w.priceBoost=false;w.priceDaysLeft=0;}
  }
}

/* ══════════════════════════════════════════════════════════
   AURORA & SNOWFLAKE ATMOSPHERE
══════════════════════════════════════════════════════════ */
function updateAtmosphere(){
  const auroraEl=document.getElementById('aurora-overlay');
  const snowEl=document.getElementById('snow-layer');
  const w=wdata();
  const inWinter=isWinter();
  const auroraOn=inWinter&&w.eventToday==='aurora';

  if(auroraEl)auroraEl.classList.toggle('aurora-on',auroraOn);
  if(snowEl)snowEl.classList.toggle('snow-on',inWinter);

  // Heavy snow during blizzard
  if(inWinter&&snowEl){
    if(!snowEl._spawning){
      snowEl._spawning=true;
      spawnSnowflakes(snowEl,w.eventToday==='blizzard'?12:5);
    }
  }

  // Show winter hub button
  const btn=document.getElementById('winter-hub-btn');
  if(btn)btn.style.display=inWinter?'block':'none';
}

function spawnSnowflakes(container,count){
  const flakes=['❄️','🌨','❅','❆'];
  // Clear old flakes if too many
  if(container.children.length>60)container.innerHTML='';
  for(let i=0;i<count;i++){
    const f=document.createElement('span');
    f.textContent=flakes[Math.floor(Math.random()*flakes.length)];
    f.style.cssText=`
      position:absolute;font-size:${8+Math.random()*14}px;
      left:${Math.random()*100}%;top:-20px;
      opacity:${0.2+Math.random()*0.4};
      animation:ambientFall ${6000+Math.random()*10000}ms ${Math.random()*5000}ms linear infinite;
      pointer-events:none`;
    container.appendChild(f);
  }
  // Only spawn once per day (flag will be reset on season change)
}

/* ══════════════════════════════════════════════════════════
   PATCH: advanceFarmGrid — allow native winter crops
══════════════════════════════════════════════════════════ */
(function patchFarmGrid(){
  if(typeof advanceFarmGrid==='undefined')return;
  const _orig=window.advanceFarmGrid;
  window.advanceFarmGrid=function(farm,hasGreenhouse,hasSprinkler){
    // Pre-process: tag winter-native crops so they don't die in winter
    const patched=farm.map(row=>row.map(tile=>{
      if(tile.crop&&CROPS&&CROPS[tile.crop.type]&&CROPS[tile.crop.type].winterNative){
        // Temporarily mark greenhouse true for winter native crops in winter
        return tile;
      }
      return tile;
    }));

    // Run original with adjusted logic
    const s=typeof season==='function'?season():'Spring';
    if(s!=='Winter')return _orig(farm,hasGreenhouse,hasSprinkler);

    // In winter: native winter crops grow without greenhouse; others need it
    return patched.map(row=>row.map(tile=>{
      if(!tile.crop){
        if(!tile.tilled)return{tilled:false,watered:false,crop:null,idleDays:0,deco:tile.deco||null};
        const idle=(tile.idleDays||0)+1;
        if(idle>=2)return{tilled:false,watered:false,crop:null,idleDays:0,deco:null};
        return{...tile,watered:false,idleDays:idle};
      }
      const cr=CROPS[tile.crop.type];
      if(!cr)return tile;
      const isNative=cr.winterNative;
      if(!isNative&&!hasGreenhouse)return{tilled:true,watered:false,crop:null,idleDays:0,deco:null};
      const newDays=tile.watered?tile.crop.days+1:tile.crop.days;
      return{...tile,watered:false,crop:{...tile.crop,days:newDays},idleDays:0};
    }));
  };
})();

/* ══════════════════════════════════════════════════════════
   PATCH: clickTile — allow winter crops in winter (seed tool)
══════════════════════════════════════════════════════════ */
(function patchClickTile(){
  if(typeof clickTile==='undefined')return;
  const _orig=window.clickTile;
  window.clickTile=function(r,c){
    // Intercept forage collection first
    const land=G.currentLand||'home';
    const w=wdata();
    if(w.forage){
      const forageItem=w.forage.find(f=>f.r===r&&f.c===c&&f.land===land&&!f.collected);
      if(forageItem){
        collectForage(r,c,land);
        return;
      }
    }
    // For seed tool in winter: allow planting winter-native crops
    if(G.tool==='seed'&&typeof season==='function'&&season()==='Winter'){
      const cr=CROPS&&CROPS[G.seed];
      if(cr&&cr.winterNative){
        // Allow without greenhouse check
        const tile=G.farm[r][c];
        if(!tile.tilled){wToast('Till first!','warn',1100);return;}
        if(tile.crop){wToast('Already planted!','warn',1100);return;}
        if(!(G.inv[G.seed]||0)){wToast('No '+cr.n+' seeds!','error');return;}
        G.farm[r][c]={...tile,crop:{type:G.seed,days:0},idleDays:0};
        G.inv[G.seed]--;
        if(typeof snd==='function')snd('place');
        spawnTileEffect&&spawnTileEffect(r,c,'❄️');
        wToast('Planted ❄️ '+cr.n+'!','success');
        render&&render();
        return;
      }
    }
    _orig(r,c);
  };
})();

/* ══════════════════════════════════════════════════════════
   PATCH: advanceDay — inject winter logic
══════════════════════════════════════════════════════════ */
(function patchAdvanceDay(){
  if(typeof advanceDay==='undefined')return;
  const _orig=window.advanceDay;
  window.advanceDay=function(){
    _orig();
    // Winter-specific daily logic
    if(isWinter()){
      ensureWinterState();
      processFuel();
      processAnimals();
      spawnForageItems();
      rollDailyEvent();
      processPriceBoost();
      _fishState.attempts=3; // Reset fishing attempts
    }
    // Season changed to winter? Reset state
    if(season()==='Winter'&&!wdata()._winterStarted){
      wdata()._winterStarted=true;
      wdata().fuel=wdata().fuelMax||100;
      spawnSnowflakesReset();
      setTimeout(()=>wToast('❄️ Winter is here! Use the Winter Hub for fishing, mining & crafting.','info',5000),3500);
    }
    if(season()!=='Winter'){
      if(wdata()._winterStarted)wdata()._winterStarted=false;
      wdata().eventToday=null;
      wdata().priceBoost=false;
    }
    updateAtmosphere();
  };
})();

function spawnSnowflakesReset(){
  const el=document.getElementById('snow-layer');
  if(el){el.innerHTML='';el._spawning=false;}
}

/* ══════════════════════════════════════════════════════════
   PATCH: render — add winter rendering hooks
══════════════════════════════════════════════════════════ */
(function patchRender(){
  if(typeof render==='undefined')return;
  const _orig=window.render;
  window.render=function(){
    _orig();
    updateAtmosphere();
    // Render forage items on grid after farm render
    setTimeout(renderForageOnGrid,50);
    // Update winter hub button visibility
    const btn=document.getElementById('winter-hub-btn');
    if(btn)btn.style.display=isWinter()?'block':'none';
  };
})();

/* ══════════════════════════════════════════════════════════
   PATCH: initState & loadState
══════════════════════════════════════════════════════════ */
(function patchState(){
  const patchInit=typeof initState==='function';
  const patchLoad=typeof loadState==='function';
  if(patchInit){
    const _origInit=window.initState;
    window.initState=function(){
      _origInit();
      injectWinterCrops();
      ensureWinterState();
    };
  }
  if(patchLoad){
    const _origLoad=window.loadState;
    window.loadState=function(s){
      _origLoad(s);
      injectWinterCrops();
      ensureWinterState();
    };
  }
})();

/* ══════════════════════════════════════════════════════════
   PATCH: buildWinterMarket — add crafting section & fuel
══════════════════════════════════════════════════════════ */
(function patchWinterMarket(){
  if(typeof buildWinterMarket==='undefined')return;
  const _orig=window.buildWinterMarket;
  window.buildWinterMarket=function(){
    const base=_orig();
    const w=wdata();
    const pct=Math.round((w.fuel/(w.fuelMax||100))*100);
    const fuelColor=pct>50?'#22c55e':pct>25?'#f59e0b':'#ef4444';
    const fuelBlock=`<div class="winter-fuel-block" style="margin-top:4px">
      <div class="wfb-row">
        <span class="wfb-label">🔥 Heating Fuel</span>
        <div style="flex:1;height:7px;background:var(--ui-bg);border-radius:4px;overflow:hidden;border:1px solid var(--ui-border);margin:0 8px">
          <div style="width:${pct}%;height:100%;background:${fuelColor};border-radius:4px;transition:width .4s"></div>
        </div>
        <span class="wfb-val" style="font-size:11px;color:var(--text-muted);font-weight:700">${w.fuel}/${w.fuelMax||100}</span>
      </div>
      <div class="wfb-tip">Craft <b>Coal Fuel</b> in Winter Hub to refill. Low fuel = energy penalty!</div>
    </div>`;

    // Materials sell section
    const hasMaterials=Object.keys(mats()).length>0;
    let matsSection='';
    if(hasMaterials){
      const totalMatVal=Object.entries(mats()).reduce((s,[k,q])=>{
        const m=MAT[k];if(!m||m.consume)return s;
        return s+matSellPrice(k)*q;
      },0);
      matsSection=`<div class="s-sec" style="margin-top:8px">🎒 Sell Winter Materials</div>
      <div class="market-header">Fish, ore, gems & forage — sell directly or craft first!</div>
      ${totalMatVal>0?`<button class="mkt-sell-all" onclick="sellAllMats()">💰 Sell All Materials · ${totalMatVal}g</button>`:''}`;
    }

    return fuelBlock+base+matsSection;
  };
})();

/* ══════════════════════════════════════════════════════════
   PATCH: buildInv — show crafted/consumable items
══════════════════════════════════════════════════════════ */
(function patchBuildInv(){
  if(typeof buildInv==='undefined')return;
  const _orig=window.buildInv;
  window.buildInv=function(){
    let base=_orig();
    // Append consumables in stash
    const consumables=Object.entries(mats()).filter(([k])=>MAT[k]&&MAT[k].consume&&mats()[k]>0);
    if(consumables.length){
      let h=`<div class="s-sec">🍲 Consumables</div>`;
      consumables.forEach(([k,q])=>{
        const m=MAT[k];
        h+=`<div class="inv-row"><span>${m.e} ${m.n}</span>
          <span class="inv-val">×${q}
            <button onclick="consumeMat('${k}')" style="margin-left:6px;padding:2px 7px;border:none;border-radius:5px;
              background:#16a34a;color:#fff;font-size:9px;font-weight:700;cursor:pointer">Use</button>
          </span></div>`;
      });
      base=base+h;
    }
    return base;
  };
})();

/* ══════════════════════════════════════════════════════════
   WINTER SHOP: Winter Crop Seeds Tab in Shop
══════════════════════════════════════════════════════════ */
(function patchBuildShop(){
  if(typeof buildShop==='undefined')return;
  const _orig=window.buildShop;
  window.buildShop=function(){
    const s=typeof season==='function'?season():'Spring';
    if(s!=='Winter')return _orig();
    // In winter: show winter market + winter seed shop
    const base=_orig(); // This returns buildWinterMarket()
    // Add winter crop seeds
    let seedSection=`<div class="s-sec" style="margin-top:8px">❄️ Winter Crop Seeds</div>
    <div class="market-header">Winter-native crops grow without a Greenhouse! Regular crops still need it.</div>`;
    Object.entries(WINTER_CROP_DEFS).forEach(([type,crop])=>{
      const bp=typeof seedBuyPrice==='function'?seedBuyPrice(type):crop.buy;
      const c5=bp*5,c10=bp*10,hv=G.inv[type]||0;
      seedSection+=`<div class="shop-card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px">
          <span class="shop-name">${crop.e} ${crop.n}</span><span class="shop-price">${bp}g</span>
        </div>
        <div class="shop-meta">⏱ ${crop.days}d · sells ${crop.sell}g · have: ${hv} ❄️ Winter Native</div>
        <div class="shop-row">
          <button class="buy-btn" data-buy="${type}" data-qty="5" ${G.gold<c5?'disabled':''}>×5 (${c5}g)</button>
          <button class="buy-btn" data-buy="${type}" data-qty="10" ${G.gold<c10?'disabled':''}>×10 (${c10}g)</button>
        </div></div>`;
    });
    return base+seedSection;
  };
})();

/* ══════════════════════════════════════════════════════════
   ENHANCED WINTER STOCK MARKET
══════════════════════════════════════════════════════════ */
(function patchTickStockMarket(){
  if(typeof tickStockMarket==='undefined')return;
  const _orig=window.tickStockMarket;
  window.tickStockMarket=function(){
    _orig();
    if(typeof season==='function'&&season()==='Winter'){
      // Winter has higher volatility — add an extra price shock for some companies
      if(G.stockMarket&&Math.random()<0.4){
        const tickers=Object.keys(G.stockMarket);
        const target=tickers[Math.floor(Math.random()*tickers.length)];
        const mkt=G.stockMarket[target];
        if(mkt){
          const shock=(Math.random()>0.5?1:-1)*Math.round(mkt.price*(0.08+Math.random()*0.12));
          mkt.price=Math.max(10,mkt.price+shock);
          mkt.history.push(mkt.price);
          if(mkt.history.length>12)mkt.history.shift();
        }
      }
      // Winter market news event (low chance)
      if(Math.random()<0.12){
        const news=['📰 Cold weather boosts IPR stock!','📰 Supply chain freeze — markets volatile!',
          '📰 Seasonal spending surges VTK!','📰 IcePeak posts record winter sales!'];
        setTimeout(()=>wToast(news[Math.floor(Math.random()*news.length)],'info',4000),3500);
      }
    }
  };
})();

/* ══════════════════════════════════════════════════════════
   LAUNCH
══════════════════════════════════════════════════════════ */
function init(){
  injectStyles();
  injectHTML();
  injectWinterCrops();
  ensureWinterState();
  // If game is already running (rare case), run atmosphere
  updateAtmosphere();
  console.log('[Winter Expansion v2.0] ❄️ Loaded successfully!');
}

// Run on DOM ready (deferred scripts run after DOM is complete)
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',init);
} else {
  init();
}

// Make consumeMat globally accessible (used in inline onclick)
window.consumeMat=consumeMat;

})(); // end IIFE
