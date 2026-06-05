/* ═══════════════════════════════════════════════════════════════════
   VALLEY FARM — MOBILE UI OVERHAUL + CONTENT PATCH  v3.0.0
   ───────────────────────────────────────────────────────────────────
   Load order: after script.js, winter.js, fall_town.js, any v1.x patches

   What this patch adds
   ────────────────────
   1. Mobile Dock       — Fixed 6-button bottom bar replaces scrolling
                          toolbar. Primary row: Hoe · Water · Seeds ·
                          Harvest · Sleep · More. Secondary drawer
                          (slide-up): Shovel · Deco · Bag · Map · Pause.
                          Long-press Harvest = scythe all (≥550 ms).

   2. Seed Quick-Pick   — Tapping Seeds on mobile opens a grid picker
                          overlay instead of the tiny dropdown. Tap again
                          to close; tapping the farm grid also closes it.

   3. Yield Preview     — While Scythe is active, a floating badge shows
                          how many crops are ready and their total sell
                          value (barn-adjusted, winter-auction-aware).

   4. Crop Inspector    — Double-tap any planted crop tile to see a stat
                          card: stage, days left, watered state, sell
                          price, harvest bonus %, and valid seasons.
                          Auto-dismisses after 5 s or on next farm tap.

   5. Daily Quests      — 3 randomised tasks refresh each morning.
                          Progress is tracked via action hooks (till,
                          water, plant, harvest, ship, auction). On
                          completion: gold + XP awarded, achievement
                          popup fires. Shown at bottom of the Bag tab.

   6. Rain Forecast     — A small desktop HUD pill ("28% rain tmrw")
                          derived from the current season's base rate.

   7. Energy Warning    — Energy bar blinks when ≤ 20 % remains.

   8. Retro theme       — All new elements carry retro overrides.
═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const isMobile = () => window.innerWidth <= 680;

  /* ─────────────────────────────────────────────────────────────────
     SECTION 0 — INJECT CSS
  ───────────────────────────────────────────────────────────────── */
  const PATCH_CSS = `
/* ── Hide scrolling toolbar on mobile; show dock instead ── */
@media (max-width: 680px) {
  #toolbar { display: none !important; }
  #mobile-dock { display: flex !important; }
  #farm-wrap { padding-bottom: 76px; }
  /* Suppress less-critical HUD pills to save horizontal room */
  #hud-land-pill,
  #hud-forecast { display: none !important; }
  #hud { flex-wrap: nowrap; overflow: hidden; padding: 4px 8px; gap: 4px; }
}
@media (max-width: 400px) {
  #farm-wrap { padding-bottom: 70px; }
}

/* ═══ MOBILE DOCK ═══════════════════════════════════════════ */
#mobile-dock {
  display: none;
  position: fixed;
  bottom: 0; left: 0; right: 0;
  z-index: 180;
  flex-direction: column;
  background: var(--ui-bg);
  border-top: 1.5px solid var(--ui-border);
  box-shadow: 0 -4px 28px rgba(0,0,0,.13);
  /* Respect iOS home-bar safe area */
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

/* ── Secondary drawer (slides up above primary row) ── */
.dock-secondary {
  display: flex;
  gap: 5px;
  padding: 0 10px;
  overflow: hidden;
  max-height: 0;
  opacity: 0;
  transition: max-height .3s cubic-bezier(.25,.8,.25,1),
              opacity .22s ease,
              padding .3s cubic-bezier(.25,.8,.25,1);
}
.dock-secondary.dock-sec-open {
  max-height: 58px;
  opacity: 1;
  padding: 6px 10px 8px;
  border-top: 1px solid var(--ui-border);
}
.dock-sec-btn {
  flex: 1;
  padding: 7px 2px;
  background: var(--ui-bg2);
  border: 1.5px solid var(--ui-border);
  border-radius: 10px;
  font-size: 10px;
  font-weight: 800;
  color: var(--text-primary);
  cursor: pointer;
  font-family: 'Nunito', sans-serif;
  transition: all .14s;
  white-space: nowrap;
  text-align: center;
  -webkit-tap-highlight-color: transparent;
}
.dock-sec-btn:active { transform: scale(.93); background: var(--ui-bg); }
.dock-sec-btn.dock-sec-active {
  border-color: var(--green);
  color: var(--green);
  background: #f0fdf4;
}
body.dark .dock-sec-btn.dock-sec-active { background: #0a2016; }

/* ── Primary tool row ── */
.dock-primary {
  display: flex;
  align-items: stretch;
  height: 62px;
  padding: 0 2px;
  gap: 1px;
}

.dock-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 10px;
  margin: 4px 1px;
  position: relative;
  overflow: hidden;
  transition: background .12s, transform .1s;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
.dock-btn:active { transform: scale(.9); background: var(--ui-bg2); }

.dock-icon {
  font-size: 22px;
  line-height: 1;
  transition: transform .14s;
  pointer-events: none;
}
.dock-label {
  font-size: 9px;
  font-weight: 800;
  color: var(--text-muted);
  font-family: 'Nunito', sans-serif;
  letter-spacing: .2px;
  pointer-events: none;
}

/* Active tool indicator */
.dock-btn.active .dock-icon { transform: scale(1.18); }
.dock-btn.active .dock-label { color: var(--green); }
.dock-btn.active::after {
  content: '';
  position: absolute;
  bottom: 4px; left: 50%;
  transform: translateX(-50%);
  width: 22px; height: 3px;
  background: var(--green);
  border-radius: 2px;
}

/* Sleep button accent */
.dock-btn-sleep .dock-label { color: #6366f1; }

/* More/ellipsis button */
.dock-btn-more { border-left: 1px solid var(--ui-border); }
.dock-btn-more .dock-icon { font-size: 20px; font-family: 'Nunito', sans-serif; font-weight: 900; color: var(--text-muted); }
.dock-btn-more.active .dock-icon { color: var(--text-primary); transform: rotate(90deg); }
.dock-btn-more.active::after { display: none; }

/* Harvest-all pulse on Scythe when crops ready */
.dock-btn.dock-harvest-ready .dock-icon {
  animation: dockHarvestGlow 1.5s ease-in-out infinite;
}
@keyframes dockHarvestGlow {
  0%,100% { filter: none; }
  50%      { filter: drop-shadow(0 0 7px #f59e0b); }
}

/* ═══ SEED QUICK-PICKER ════════════════════════════════════ */
#dock-seed-picker {
  display: none;
  position: fixed;
  bottom: 68px; left: 0; right: 0;
  z-index: 190;
  background: var(--ui-bg);
  border-top: 1.5px solid var(--ui-border);
  border-radius: 18px 18px 0 0;
  padding: 10px 10px 10px;
  transform: translateY(100%);
  transition: transform .28s cubic-bezier(.25,.8,.25,1);
  box-shadow: 0 -8px 36px rgba(0,0,0,.15);
}
#dock-seed-picker.picker-open { transform: translateY(0); display: block; }
#dock-seed-picker-title {
  font-size: 9px;
  font-weight: 800;
  color: var(--text-soft);
  text-transform: uppercase;
  letter-spacing: .8px;
  text-align: center;
  margin-bottom: 8px;
}
#dock-seed-list {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
}
.seed-pick-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 5px;
  background: var(--ui-bg2);
  border: 2px solid var(--ui-border);
  border-radius: 12px;
  cursor: pointer;
  min-width: 54px;
  transition: all .14s;
  -webkit-tap-highlight-color: transparent;
}
.seed-pick-btn.sel  { border-color: var(--green); background: #f0fdf4; }
body.dark .seed-pick-btn.sel { background: #0a2016; }
.seed-pick-btn.empty { opacity: .38; cursor: not-allowed; }
.seed-pick-btn:active:not(.empty) { transform: scale(.9); }
.sp-em  { font-size: 24px; line-height: 1; }
.sp-name { font-size: 8px; font-weight: 700; color: var(--text-muted); text-align: center; }
.sp-qty  { font-size: 9px; font-weight: 800; color: var(--gold); }

/* ═══ YIELD PREVIEW BADGE ══════════════════════════════════ */
#yield-preview {
  display: none;
  position: fixed;
  bottom: 80px; left: 50%;
  transform: translateX(-50%);
  z-index: 170;
  background: rgba(245,158,11,.95);
  color: #fff;
  font-family: 'Baloo 2', cursive;
  font-size: 13px;
  font-weight: 800;
  padding: 6px 18px;
  border-radius: 22px;
  box-shadow: 0 4px 18px rgba(245,158,11,.42);
  white-space: nowrap;
  pointer-events: none;
  animation: yieldIn .2s ease;
}
@keyframes yieldIn {
  from { opacity:0; transform: translateX(-50%) translateY(6px); }
  to   { opacity:1; transform: translateX(-50%) translateY(0); }
}
@media (min-width: 681px) {
  #yield-preview { bottom: 14px; font-size: 12px; padding: 5px 14px; }
}

/* ═══ CROP INSPECTOR ════════════════════════════════════════ */
#crop-inspector {
  position: fixed;
  bottom: 82px; left: 50%;
  transform: translateX(-50%) translateY(14px);
  z-index: 310;
  background: var(--ui-bg);
  border: 1.5px solid var(--ui-border);
  border-radius: 18px;
  padding: 14px 16px 12px;
  min-width: 250px;
  max-width: min(340px, 94vw);
  box-shadow: 0 12px 50px rgba(0,0,0,.22);
  opacity: 0;
  pointer-events: none;
  transition: opacity .22s ease,
              transform .25s cubic-bezier(.34,1.56,.64,1);
}
#crop-inspector.ci-show {
  opacity: 1;
  pointer-events: all;
  transform: translateX(-50%) translateY(0);
}
@media (min-width: 681px) {
  #crop-inspector { bottom: auto; top: 80px; }
}
.ci-header {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-bottom: 10px;
  padding-right: 28px;
}
.ci-em   { font-size: 34px; line-height: 1; flex-shrink: 0; }
.ci-name { font-size: 15px; font-weight: 800; color: var(--text-primary); }
.ci-stage { font-size: 11px; font-weight: 700; color: var(--text-muted); margin-top: 2px; }
.ci-stage.ci-ready { color: var(--green); }
.ci-stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 5px;
  margin-bottom: 8px;
}
.ci-stat {
  background: var(--ui-bg2);
  border: 1px solid var(--ui-border);
  border-radius: 10px;
  padding: 7px 3px;
  text-align: center;
}
.ci-val { font-size: 13px; font-weight: 800; color: var(--text-primary); }
.ci-lab { font-size: 8px; color: var(--text-muted); font-weight: 600; margin-top: 2px; text-transform: uppercase; letter-spacing: .3px; }
.ci-seasons {
  font-size: 10px;
  color: var(--text-soft);
  text-align: center;
  line-height: 1.7;
  border-top: 1px solid var(--ui-border);
  padding-top: 7px;
}
.ci-hint {
  font-size: 9px;
  color: var(--text-soft);
  text-align: center;
  margin-top: 4px;
  font-style: italic;
}
.ci-close {
  position: absolute;
  top: 11px; right: 13px;
  background: var(--ui-bg2);
  border: 1px solid var(--ui-border);
  border-radius: 6px;
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
  padding: 2px 8px;
  font-family: 'Nunito', sans-serif;
  line-height: 1.6;
  transition: all .14s;
}
.ci-close:hover { color: #991b1b; border-color: #fca5a5; background: #fef2f2; }
body.dark .ci-close:hover { background: #2a0d0d; color: #f87171; border-color: #7f1d1d; }

/* ═══ DAILY QUESTS ══════════════════════════════════════════ */
.quest-row {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 9px 10px;
  background: var(--ui-bg2);
  border: 1px solid var(--ui-border);
  border-radius: 12px;
  margin-bottom: 5px;
  transition: border-color .15s;
}
.quest-row.quest-done {
  border-color: #86efac;
  background: #f0fdf4;
  opacity: .85;
}
body.dark .quest-row.quest-done { background: #0a2016; border-color: #166534; }
.quest-icon { font-size: 20px; flex-shrink: 0; margin-top: 1px; }
.quest-info  { flex: 1; min-width: 0; }
.quest-desc  {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.4;
  margin-bottom: 5px;
}
.quest-bar-wrap {
  height: 5px;
  background: var(--ui-border);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 4px;
}
.quest-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #22c55e, #86efac);
  border-radius: 4px;
  transition: width .45s cubic-bezier(.25,.8,.25,1);
  min-width: 3px;
}
.quest-prog { font-size: 9px; font-weight: 700; color: var(--text-muted); }
.quest-reward-done { font-size: 10px; font-weight: 800; color: var(--green); margin-top: 2px; }
.quest-refresh-note {
  font-size: 9px;
  color: var(--text-soft);
  text-align: center;
  margin-top: 3px;
  font-style: italic;
  padding-bottom: 2px;
}
.quest-all-done {
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  color: var(--green);
  padding: 10px;
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 12px;
  margin-bottom: 6px;
}
body.dark .quest-all-done { background: #0a2016; border-color: #166534; }

/* ═══ RAIN FORECAST PILL (desktop HUD) ═════════════════════ */
#hud-forecast {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 700;
  color: var(--text-muted);
  background: var(--ui-bg2);
  border: 1.5px solid var(--ui-border);
  border-radius: 20px;
  padding: 3px 10px;
  white-space: nowrap;
  flex-shrink: 0;
}

/* ═══ LOW ENERGY BAR BLINK ══════════════════════════════════ */
#energy-bar.energy-critical {
  animation: energyBlink 1.1s ease-in-out infinite;
}
@keyframes energyBlink {
  0%,100% { opacity: 1; }
  50%      { opacity: .25; }
}

/* ═══ RETRO OVERRIDES ═══════════════════════════════════════ */
body.retro #mobile-dock { background: #120c00; border-top: 3px solid #8b6914; }
body.retro .dock-primary { height: 56px; }
body.retro .dock-label { font-family: 'Press Start 2P', monospace !important; font-size: 5.5px; color: #a1887f; }
body.retro .dock-icon  { font-size: 18px; }
body.retro .dock-btn.active .dock-label { color: #ffd700; }
body.retro .dock-btn.active::after { background: #ffd700; }
body.retro .dock-btn:active { background: #1c1209; }
body.retro .dock-secondary { border-top: 1px solid #3e2723; }
body.retro .dock-secondary.dock-sec-open { border-top: 2px solid #8b6914; }
body.retro .dock-sec-btn {
  background: #1c1209; border: 1px solid #3e2723; color: #f5deb3;
  font-family: 'Press Start 2P', monospace; font-size: 5.5px; border-radius: 2px;
}
body.retro .dock-sec-btn.dock-sec-active { border-color: #ffd700; color: #ffd700; background: #2d1b00; }
body.retro .dock-btn-more { border-left: 1px solid #3e2723; }
body.retro #dock-seed-picker { background: #120c00; border-top: 3px solid #8b6914; border-radius: 0; }
body.retro #dock-seed-picker-title { font-family: 'Press Start 2P', monospace; font-size: 6px; color: #a1887f; }
body.retro .seed-pick-btn { background: #1c1209; border: 1px solid #3e2723; border-radius: 2px; min-width: 48px; }
body.retro .seed-pick-btn.sel { border-color: #ffd700; background: #2d1b00; }
body.retro .sp-name { font-family: 'Press Start 2P', monospace; font-size: 5px; }
body.retro .sp-qty  { font-family: 'Press Start 2P', monospace; font-size: 6px; color: #ffd700; }
body.retro #yield-preview {
  background: #b8860b; border: 2px solid #ffd700; border-radius: 3px;
  font-family: 'Press Start 2P', monospace; font-size: 7.5px;
  box-shadow: 3px 3px 0 rgba(0,0,0,.8); animation: none;
}
body.retro #crop-inspector { background: #120c00; border: 3px solid #8b6914; border-radius: 4px; box-shadow: 6px 6px 0 rgba(0,0,0,.8); }
body.retro .ci-name  { color: #f5deb3; font-size: 12px; }
body.retro .ci-stage { color: #a1887f; font-size: 7px; font-family: 'Press Start 2P', monospace; }
body.retro .ci-stage.ci-ready { color: #69f0ae; }
body.retro .ci-stat  { background: #1c1209; border: 1px solid #3e2723; border-radius: 2px; }
body.retro .ci-val   { color: #f5deb3; font-size: 11px; }
body.retro .ci-lab   { color: #5d4037; font-size: 6px; font-family: 'Press Start 2P', monospace; }
body.retro .ci-seasons { color: #5d4037; font-size: 7px; font-family: 'Press Start 2P', monospace; border-top: 1px solid #3e2723; }
body.retro .ci-close { background: #1c1209; border: 1px solid #3e2723; color: #a1887f; border-radius: 2px; font-family: 'Press Start 2P', monospace; font-size: 8px; }
body.retro .quest-row { background: #1c1209; border: 1px solid #3e2723; border-radius: 3px; }
body.retro .quest-row.quest-done { border-color: #388e3c; background: #0d2010; }
body.retro .quest-desc { font-family: 'Press Start 2P', monospace; font-size: 6px; color: #f5deb3; line-height: 1.9; }
body.retro .quest-prog { font-family: 'Press Start 2P', monospace; font-size: 5.5px; }
body.retro .quest-bar-fill { background: #388e3c; }
body.retro .quest-reward-done { font-family: 'Press Start 2P', monospace; font-size: 6px; color: #69f0ae; }
body.retro .quest-refresh-note { font-family: 'Press Start 2P', monospace; font-size: 5px; }
body.retro .quest-all-done { background: #0d2010; border: 1px solid #388e3c; color: #69f0ae; font-family: 'Press Start 2P', monospace; font-size: 7px; border-radius: 3px; }
body.retro #hud-forecast { background: transparent; border: none; font-family: 'Press Start 2P', monospace; font-size: 7px; color: #a1887f; }
`;

  const styleEl = document.createElement('style');
  styleEl.id = 'vf-patch-v3-css';
  styleEl.textContent = PATCH_CSS;
  document.head.appendChild(styleEl);

  /* ─────────────────────────────────────────────────────────────────
     SECTION 1 — MOBILE DOCK
  ───────────────────────────────────────────────────────────────── */

  /* ── Build DOM ── */
  const dock = document.createElement('div');
  dock.id = 'mobile-dock';
  dock.innerHTML = `
    <div class="dock-secondary" id="dock-secondary">
      <button class="dock-sec-btn" id="dock-sec-shovel">🪱 Shovel</button>
      <button class="dock-sec-btn" id="dock-sec-deco">🎨 Deco</button>
      <button class="dock-sec-btn" id="dock-sec-bag">🎒 Bag</button>
      <button class="dock-sec-btn" id="dock-sec-map">🗺 Map</button>
      <button class="dock-sec-btn" id="dock-sec-pause">⏸ Pause</button>
    </div>
    <div class="dock-primary">
      <button class="dock-btn dock-btn-tool active" id="dock-hoe"    title="Hoe (H)">
        <span class="dock-icon">⛏️</span><span class="dock-label">Hoe</span>
      </button>
      <button class="dock-btn dock-btn-tool" id="dock-water"  title="Water (W)">
        <span class="dock-icon">💧</span><span class="dock-label">Water</span>
      </button>
      <button class="dock-btn dock-btn-tool" id="dock-seed"   title="Seeds (S)">
        <span class="dock-icon">🌱</span><span class="dock-label">Seeds</span>
      </button>
      <button class="dock-btn dock-btn-tool" id="dock-scythe" title="Harvest (R) · long-press = scythe all">
        <span class="dock-icon">🌾</span><span class="dock-label">Harvest</span>
      </button>
      <button class="dock-btn dock-btn-sleep" id="dock-sleep" title="Sleep / Next day (Space)">
        <span class="dock-icon">💤</span><span class="dock-label">Sleep</span>
      </button>
      <button class="dock-btn dock-btn-more" id="dock-more" title="More tools">
        <span class="dock-icon" id="dock-more-icon">⋯</span><span class="dock-label">More</span>
      </button>
    </div>`;
  document.body.appendChild(dock);

  /* ── Seed picker overlay ── */
  const seedPicker = document.createElement('div');
  seedPicker.id = 'dock-seed-picker';
  seedPicker.innerHTML = `
    <div id="dock-seed-picker-title">🌱 Choose Seed to Plant</div>
    <div id="dock-seed-list"></div>`;
  document.body.appendChild(seedPicker);

  /* ── Yield preview badge ── */
  const yieldBadge = document.createElement('div');
  yieldBadge.id = 'yield-preview';
  document.body.appendChild(yieldBadge);

  /* ── Crop inspector card ── */
  const cropInspector = document.createElement('div');
  cropInspector.id = 'crop-inspector';
  cropInspector.innerHTML = `
    <button class="ci-close" id="ci-close-btn">✕</button>
    <div id="ci-body"></div>`;
  document.body.appendChild(cropInspector);
  document.getElementById('ci-close-btn').addEventListener('click', () => {
    cropInspector.classList.remove('ci-show');
    clearTimeout(cropInspector._timer);
  });

  /* ─── Dock state ─── */
  let dockSecOpen = false;

  function openDockSec() {
    dockSecOpen = true;
    document.getElementById('dock-secondary').classList.add('dock-sec-open');
    document.getElementById('dock-more-icon').textContent = '✕';
    document.getElementById('dock-more').classList.add('active');
  }
  function closeDockSec() {
    dockSecOpen = false;
    document.getElementById('dock-secondary').classList.remove('dock-sec-open');
    document.getElementById('dock-more-icon').textContent = '⋯';
    document.getElementById('dock-more').classList.remove('active');
  }
  function toggleDockSec() { dockSecOpen ? closeDockSec() : openDockSec(); }

  /* ─── Sync dock highlights with active tool ─── */
  const PRIMARY_IDS  = { hoe: 'dock-hoe', water: 'dock-water', seed: 'dock-seed', scythe: 'dock-scythe' };
  const SECONDARY_IDS = { shovel: 'dock-sec-shovel', deco: 'dock-sec-deco' };

  function syncDockHighlight(tool) {
    document.querySelectorAll('#mobile-dock .dock-btn-tool').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('#mobile-dock .dock-sec-btn').forEach(b => b.classList.remove('dock-sec-active'));
    const pid = PRIMARY_IDS[tool];
    if (pid) document.getElementById(pid)?.classList.add('active');
    const sid = SECONDARY_IDS[tool];
    if (sid) document.getElementById(sid)?.classList.add('dock-sec-active');
  }

  /* ─── Seed picker helpers ─── */
  function refreshSeedPicker() {
    const list = document.getElementById('dock-seed-list');
    if (!list || typeof sCrops !== 'function') return;
    const av = sCrops();
    list.innerHTML = av.map(([t, c]) => {
      const qty = (G.inv && G.inv[t]) || 0;
      const sel = t === G.seed;
      return `<button class="seed-pick-btn${sel ? ' sel' : ''}${!qty ? ' empty' : ''}"
        data-seed="${t}" ${!qty ? 'disabled' : ''}>
        <span class="sp-em">${c.e}</span>
        <span class="sp-name">${c.n}</span>
        <span class="sp-qty">×${qty}</span>
      </button>`;
    }).join('');
    list.querySelectorAll('.seed-pick-btn:not([disabled])').forEach(btn => {
      btn.addEventListener('click', () => {
        G.seed = btn.dataset.seed;
        if (typeof updateSeedSel === 'function') updateSeedSel();
        list.querySelectorAll('.seed-pick-btn').forEach(b => b.classList.remove('sel'));
        btn.classList.add('sel');
      });
    });
  }

  function openSeedPicker() {
    refreshSeedPicker();
    seedPicker.style.display = 'block';
    // Force reflow before adding class so transition fires
    void seedPicker.offsetHeight;
    seedPicker.classList.add('picker-open');
  }

  function closeSeedPicker() {
    seedPicker.classList.remove('picker-open');
    setTimeout(() => {
      if (!seedPicker.classList.contains('picker-open')) seedPicker.style.display = 'none';
    }, 320);
  }

  /* ─── Yield preview ─── */
  function refreshYieldPreview() {
    if (typeof G === 'undefined' || !G.farm || G.tool !== 'scythe') {
      yieldBadge.style.display = 'none';
      return;
    }
    let gold = 0, count = 0;
    const isWinter = (typeof season === 'function') && season() === 'Winter';
    const bm = (typeof barnMult === 'function') ? barnMult() : 1;
    for (let r = 0; r < GH; r++) {
      for (let c = 0; c < GW; c++) {
        const tile = G.farm[r][c];
        if (tile && tile.crop && (typeof cropStage === 'function') && cropStage(tile.crop) === 3) {
          const cr = CROPS[tile.crop.type];
          if (cr) {
            const p = (isWinter && G.market?.prices?.[tile.crop.type]) || cr.sell;
            gold += Math.round(p * bm);
            count++;
          }
        }
      }
    }
    if (!count) { yieldBadge.style.display = 'none'; return; }
    yieldBadge.style.display = 'block';
    yieldBadge.textContent = `🌾 ${count} ready · ~${gold}g`;
  }

  /* ─── Wrap setTool ─── */
  const _origSetTool = window.setTool;
  window.setTool = function (t) {
    _origSetTool(t);
    syncDockHighlight(t);
    refreshYieldPreview();
    if (t === 'seed' && isMobile()) {
      openSeedPicker();
    } else {
      closeSeedPicker();
    }
    // Close secondary only when picking a tool NOT in the secondary drawer
    if (!['shovel', 'deco'].includes(t)) closeDockSec();
  };

  /* ─── Bind dock primary buttons ─── */
  document.getElementById('dock-hoe')   .addEventListener('click', () => setTool('hoe'));
  document.getElementById('dock-water') .addEventListener('click', () => setTool('water'));
  document.getElementById('dock-seed')  .addEventListener('click', () => setTool('seed'));
  document.getElementById('dock-scythe').addEventListener('click', () => setTool('scythe'));
  document.getElementById('dock-sleep') .addEventListener('click', () => { if (typeof doSleep === 'function') doSleep(); });
  document.getElementById('dock-more')  .addEventListener('click', toggleDockSec);

  /* ─── Bind dock secondary buttons ─── */
  document.getElementById('dock-sec-shovel').addEventListener('click', () => setTool('shovel'));
  document.getElementById('dock-sec-deco')  .addEventListener('click', () => setTool('deco'));
  document.getElementById('dock-sec-bag')   .addEventListener('click', () => {
    closeDockSec();
    if (typeof toggleBag === 'function') toggleBag();
  });
  document.getElementById('dock-sec-map').addEventListener('click', () => {
    closeDockSec();
    if (typeof openMapScreen === 'function') openMapScreen();
  });
  document.getElementById('dock-sec-pause').addEventListener('click', () => {
    closeDockSec();
    if (typeof openPause === 'function') openPause();
  });

  /* ─── Long-press Scythe = Harvest All ─── */
  let scytheTimer = null;
  const scytheBtn = document.getElementById('dock-scythe');
  scytheBtn.addEventListener('touchstart', () => {
    scytheTimer = setTimeout(() => {
      scytheTimer = null;
      if (typeof scytheAll === 'function') scytheAll();
    }, 550);
  }, { passive: true });
  ['touchend', 'touchmove', 'touchcancel'].forEach(ev =>
    scytheBtn.addEventListener(ev, () => clearTimeout(scytheTimer), { passive: true })
  );

  /* ─── Close overlays on farm tap ─── */
  const farmWrap = document.getElementById('farm-wrap');
  if (farmWrap) {
    farmWrap.addEventListener('click', () => {
      closeDockSec();
      closeSeedPicker();
    });
  }

  /* ─── Sync dock on each full render ─── */
  const _origRender = window.render;
  window.render = function () {
    _origRender();
    if (typeof G === 'undefined') return;
    syncDockHighlight(G.tool);
    refreshYieldPreview();
    // Pulse scythe when harvest is ready
    const ready = (typeof allCropsReady === 'function') && allCropsReady();
    scytheBtn.classList.toggle('dock-harvest-ready', ready);
    // Refresh seed picker tiles if open
    if (seedPicker.classList.contains('picker-open')) refreshSeedPicker();
  };

  console.log('[Patch v3.0.0] Mobile dock ✅');

  /* ─────────────────────────────────────────────────────────────────
     SECTION 2 — CROP INSPECTOR (double-tap)
  ───────────────────────────────────────────────────────────────── */
  let lastTap = { r: -1, c: -1, ts: 0 };

  function showInspector(r, c) {
    const tile = G.farm[r] && G.farm[r][c];
    if (!tile || !tile.crop) return;
    const cr = CROPS[tile.crop.type];
    if (!cr) return;

    const stg = (typeof cropStage === 'function') ? cropStage(tile.crop) : 0;
    const stageLabel = ['🌱 Seedling', '🌿 Growing', '🌿 Maturing', '✨ Ready!'][Math.max(0, stg)];

    const effDays = (typeof getEffectiveDays === 'function')
      ? getEffectiveDays(tile.crop.type, G.currentLand || 'home')
      : cr.days;
    const daysLeft = Math.max(0, effDays - tile.crop.days);

    const isWinter = (typeof season === 'function') && season() === 'Winter';
    const basePrice = (isWinter && G.market?.prices?.[tile.crop.type]) || cr.sell;
    const sellPrice = Math.round(basePrice * ((typeof barnMult === 'function') ? barnMult() : 1));

    const hLv = (typeof getLevel === 'function') ? getLevel(G.skills?.harvesting?.xp || 0) : 1;
    const bonus = hLv >= 10 ? 25 : hLv >= 5 ? 15 : 0;

    const SEM = { Spring: '🌸', Summer: '☀️', Fall: '🍂', Winter: '❄️' };
    const seasons = cr.seasons.map(s => (SEM[s] || '') + ' ' + s).join('  ');

    document.getElementById('ci-body').innerHTML = `
      <div class="ci-header">
        <span class="ci-em">${cr.e}</span>
        <div>
          <div class="ci-name">${cr.n}</div>
          <div class="ci-stage${stg === 3 ? ' ci-ready' : ''}">${stageLabel}</div>
        </div>
      </div>
      <div class="ci-stat-grid">
        <div class="ci-stat">
          <div class="ci-val">${stg === 3 ? '✅' : daysLeft + 'd'}</div>
          <div class="ci-lab">${stg === 3 ? 'Ready' : 'Days left'}</div>
        </div>
        <div class="ci-stat">
          <div class="ci-val">${tile.watered ? '💧' : '🏜️'}</div>
          <div class="ci-lab">${tile.watered ? 'Watered' : 'Dry'}</div>
        </div>
        <div class="ci-stat">
          <div class="ci-val">${sellPrice}g</div>
          <div class="ci-lab">Sell price</div>
        </div>
        <div class="ci-stat">
          <div class="ci-val">${bonus > 0 ? '+' + bonus + '%' : '—'}</div>
          <div class="ci-lab">Yield bonus</div>
        </div>
      </div>
      <div class="ci-seasons">${seasons}</div>
      <div class="ci-hint">Double-tap any crop tile to inspect</div>`;

    cropInspector.classList.add('ci-show');
    clearTimeout(cropInspector._timer);
    cropInspector._timer = setTimeout(() => cropInspector.classList.remove('ci-show'), 5000);
  }

  /* ─── Close inspector on farm tap ─── */
  if (farmWrap) {
    farmWrap.addEventListener('click', () => {
      clearTimeout(cropInspector._timer);
      cropInspector.classList.remove('ci-show');
    });
  }

  console.log('[Patch v3.0.0] Crop inspector ✅');

  /* ─────────────────────────────────────────────────────────────────
     SECTION 3 — DAILY QUESTS
  ───────────────────────────────────────────────────────────────── */
  const QUEST_POOL = [
    { id: 'till5',     desc: 'Till 5 soil tiles',       target: 5,   stat: 'tills',    icon: '⛏️', reward: { gold: 20, xp: 'farming',    amt: 30 } },
    { id: 'till12',    desc: 'Till 12 soil tiles',       target: 12,  stat: 'tills',    icon: '⛏️', reward: { gold: 50, xp: 'farming',    amt: 70 } },
    { id: 'water5',    desc: 'Water 5 crops',            target: 5,   stat: 'waters',   icon: '💧', reward: { gold: 20, xp: 'watering',   amt: 30 } },
    { id: 'water12',   desc: 'Water 12 crops',           target: 12,  stat: 'waters',   icon: '💧', reward: { gold: 50, xp: 'watering',   amt: 70 } },
    { id: 'harvest3',  desc: 'Harvest 3 crops',          target: 3,   stat: 'harvests', icon: '🌾', reward: { gold: 35, xp: 'harvesting', amt: 50 } },
    { id: 'harvest8',  desc: 'Harvest 8 crops',          target: 8,   stat: 'harvests', icon: '🌾', reward: { gold: 85, xp: 'harvesting', amt: 110} },
    { id: 'plant5',    desc: 'Plant 5 seeds',            target: 5,   stat: 'planted',  icon: '🌱', reward: { gold: 28, xp: 'farming',    amt: 25 } },
    { id: 'plant10',   desc: 'Plant 10 seeds',           target: 10,  stat: 'planted',  icon: '🌱', reward: { gold: 55, xp: 'farming',    amt: 55 } },
    { id: 'earn100',   desc: 'Earn 100g from crops',     target: 100, stat: 'goldEarned', icon: '💰', reward: { gold: 30 } },
    { id: 'earn400',   desc: 'Earn 400g from crops',     target: 400, stat: 'goldEarned', icon: '💰', reward: { gold: 100} },
    { id: 'till_water',desc: 'Till & water 6 tiles',     target: 6,   stat: 'tillWater',  icon: '🚜', reward: { gold: 45, xp: 'farming', amt: 40 } },
  ];

  /* Shuffle helper */
  function _shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function _ensureQuests() {
    if (typeof G === 'undefined' || G.day === undefined) return;
    if (!G.vf_quests) G.vf_quests = { day: -1, active: [], prog: {} };
    const q = G.vf_quests;
    if (q.day !== G.day) {
      q.day = G.day;
      q.prog = {};
      q.active = _shuffle(QUEST_POOL).slice(0, 3).map(qd => ({ ...qd, done: false }));
      console.log('[Patch v3.0.0] Fresh quests for Day ' + G.day + ':', q.active.map(x => x.id).join(', '));
    }
  }

  function _trackQuest(stat, amount) {
    if (typeof G === 'undefined') return;
    _ensureQuests();
    const q = G.vf_quests;
    if (!q) return;
    let anyCompleted = false;
    q.active.forEach((quest, i) => {
      if (quest.done || quest.stat !== stat) return;
      q.prog[i] = (q.prog[i] || 0) + amount;
      if (q.prog[i] >= quest.target) {
        quest.done = true;
        anyCompleted = true;
        if (quest.reward.gold) G.gold = (G.gold || 0) + quest.reward.gold;
        if (quest.reward.xp && typeof addXP === 'function') addXP(quest.reward.xp, quest.reward.amt);
        if (typeof snd === 'function') snd('levelup');
        const rewardStr = [
          quest.reward.gold ? `+${quest.reward.gold}g` : '',
          quest.reward.xp   ? `+${quest.reward.amt} ${quest.reward.xp} XP` : ''
        ].filter(Boolean).join('  ');
        setTimeout(() => {
          if (typeof showAchievement === 'function') {
            showAchievement('📋', 'Quest Complete!', quest.desc + ' — ' + rewardStr);
          }
        }, 250);
      }
    });
    if (anyCompleted && typeof saveAll === 'function') saveAll();
  }

  /* Build quest HTML for the bag tab */
  function _buildQuestSection() {
    _ensureQuests();
    if (!G.vf_quests) return '';
    const q = G.vf_quests;
    const allDone = q.active.every(x => x.done);
    let h = '<div class="s-sec">📋 Daily Quests</div>';
    if (allDone) {
      h += `<div class="quest-all-done">🎉 All quests complete for today! Great work, farmer!</div>`;
    }
    q.active.forEach((quest, i) => {
      const prog = Math.min(q.prog[i] || 0, quest.target);
      const pct  = Math.round((prog / quest.target) * 100);
      const rewardLabel = [
        quest.reward.gold ? `+${quest.reward.gold}g` : '',
        quest.reward.xp   ? `+${quest.reward.amt} XP` : ''
      ].filter(Boolean).join('  ');

      if (quest.done) {
        h += `<div class="quest-row quest-done">
          <span class="quest-icon">✅</span>
          <div class="quest-info">
            <div class="quest-desc">${quest.icon} ${quest.desc}</div>
            <div class="quest-reward-done">Complete! ${rewardLabel}</div>
          </div>
        </div>`;
      } else {
        h += `<div class="quest-row">
          <span class="quest-icon">${quest.icon}</span>
          <div class="quest-info">
            <div class="quest-desc">${quest.desc}</div>
            <div class="quest-bar-wrap"><div class="quest-bar-fill" style="width:${pct}%"></div></div>
            <div class="quest-prog">${prog} / ${quest.target} · ${rewardLabel}</div>
          </div>
        </div>`;
      }
    });
    h += `<div class="quest-refresh-note">Resets at sunrise each day 🌅</div>`;
    return h;
  }

  /* Inject quest section into bag tab (bottom of buildInv) */
  const _origBuildInv = window.buildInv;
  window.buildInv = function () {
    return _origBuildInv() + _buildQuestSection();
  };

  /* Track shipping earnings */
  const _origShipAll = window.shipAll;
  window.shipAll = function () {
    let earned = 0;
    if (G.bag) {
      const bm = (typeof barnMult === 'function') ? barnMult() : 1;
      Object.entries(G.bag).forEach(([t, qty]) => {
        if (CROPS[t]) earned += Math.round(CROPS[t].sell * qty * bm);
      });
    }
    _origShipAll();
    if (earned > 0) _trackQuest('goldEarned', earned);
  };

  /* Track auction sell earnings */
  const _origAuctionSell = window.auctionSell;
  window.auctionSell = function (type, qty) {
    const bm = (typeof barnMult === 'function') ? barnMult() : 1;
    const price = (G.market?.prices?.[type]) || (CROPS[type]?.sell) || 0;
    const earned = Math.round(price * Math.min(qty, (G.bag && G.bag[type]) || 0) * bm);
    _origAuctionSell(type, qty);
    if (earned > 0) _trackQuest('goldEarned', earned);
  };

  /* Refresh quest pool each day via advanceDay */
  const _origAdvanceDay = window.advanceDay;
  window.advanceDay = function () {
    _origAdvanceDay();
    // After day ticks, day has changed — ensureQuests on next render will detect
  };

  /* Bootstrap quests if game already running */
  if (typeof G !== 'undefined' && G.day !== undefined) _ensureQuests();

  console.log('[Patch v3.0.0] Daily quests ✅');

  /* ─────────────────────────────────────────────────────────────────
     SECTION 4 — WRAP clickTile (quest tracking + crop inspector)
     Must come AFTER both systems are set up above.
  ───────────────────────────────────────────────────────────────── */
  const _origClickTile = window.clickTile;
  window.clickTile = function (r, c) {
    /* Capture pre-action tile state */
    const pre = G.farm[r] && G.farm[r][c]
      ? { tilled: G.farm[r][c].tilled, watered: G.farm[r][c].watered, crop: G.farm[r][c].crop }
      : { tilled: false, watered: false, crop: null };

    /* Run original action */
    _origClickTile(r, c);

    /* Post-action tile state */
    const post = G.farm[r] && G.farm[r][c] ? G.farm[r][c] : null;

    /* Quest tracking */
    if (post) {
      const t = G.tool;
      if (t === 'hoe'    && post.tilled   && !pre.tilled)  { _trackQuest('tills', 1); _trackQuest('tillWater', 1); }
      if (t === 'water'  && post.watered  && !pre.watered) { _trackQuest('waters', 1); _trackQuest('tillWater', 1); }
      if (t === 'seed'   && post.crop     && !pre.crop)    _trackQuest('planted', 1);
      if (t === 'scythe' && !post.crop    && pre.crop) {
        _trackQuest('harvests', 1);
        if (pre.crop && CROPS[pre.crop.type]) {
          const sellVal = Math.round(CROPS[pre.crop.type].sell * ((typeof barnMult === 'function') ? barnMult() : 1));
          _trackQuest('goldEarned', sellVal);
        }
      }
    }

    /* Update yield badge */
    refreshYieldPreview();

    /* Double-tap → crop inspector */
    const now = Date.now();
    const isDoubleTap = lastTap.r === r && lastTap.c === c && (now - lastTap.ts) < 480;
    lastTap = { r, c, ts: now };
    if (isDoubleTap && G.farm[r]?.[c]?.crop) showInspector(r, c);
  };

  /* Also wrap scytheAll for harvest quest tracking */
  const _origScytheAll = window.scytheAll;
  window.scytheAll = function () {
    let count = 0;
    if (G.farm) {
      for (let r = 0; r < GH; r++) for (let c = 0; c < GW; c++) {
        const tile = G.farm[r][c];
        if (tile?.crop && (typeof cropStage === 'function') && cropStage(tile.crop) === 3) count++;
      }
    }
    _origScytheAll();
    if (count > 0) _trackQuest('harvests', count);
    refreshYieldPreview();
  };

  /* ─────────────────────────────────────────────────────────────────
     SECTION 5 — RAIN FORECAST PILL + ENERGY WARNING (renderHUD patch)
  ───────────────────────────────────────────────────────────────── */

  /* Inject forecast pill once into the HUD */
  function injectForecastPill() {
    if (document.getElementById('hud-forecast')) return;
    const hud = document.getElementById('hud');
    if (!hud) return;
    const pill = document.createElement('div');
    pill.id = 'hud-forecast';
    hud.appendChild(pill);
  }

  const RAIN_CHANCE = { Spring: 28, Summer: 22, Fall: 10, Winter: 0 };

  function updateForecast() {
    const pill = document.getElementById('hud-forecast');
    if (!pill || typeof season !== 'function') return;
    const pct = RAIN_CHANCE[season()] ?? 0;
    if (pct === 0) {
      pill.textContent = '☀️ No rain tmrw';
    } else {
      pill.textContent = (pct >= 25 ? '🌧️ ' : '🌤️ ') + pct + '% rain tmrw';
    }
  }

  injectForecastPill();

  const _origRenderHUD = window.renderHUD;
  window.renderHUD = function () {
    _origRenderHUD();
    updateForecast();

    /* Energy blink when critically low */
    const eb = document.getElementById('energy-bar');
    if (eb && typeof G !== 'undefined' && typeof maxEnergy === 'function') {
      const pct = G.energy / maxEnergy();
      eb.classList.toggle('energy-critical', pct > 0 && pct <= 0.18);
    }

    /* Keep dock in sync on HUD repaints */
    if (isMobile() && typeof G !== 'undefined' && G.tool) syncDockHighlight(G.tool);
  };

  console.log('[Patch v3.0.0] Forecast + energy warning ✅');

  /* ─────────────────────────────────────────────────────────────────
     SECTION 6 — LAUNCH HOOK (sync everything when game loads/reloads)
  ───────────────────────────────────────────────────────────────── */
  const _origLaunchGame = window.launchGame;
  window.launchGame = function () {
    _origLaunchGame();
    setTimeout(() => {
      injectForecastPill();
      updateForecast();
      if (typeof G !== 'undefined') {
        _ensureQuests();
        if (G.tool) syncDockHighlight(G.tool);
        refreshYieldPreview();
      }
    }, 250);
  };

  /* Sync dock immediately if game is already active (patch loaded late) */
  if (typeof G !== 'undefined' && G.tool) {
    syncDockHighlight(G.tool);
    refreshYieldPreview();
  }

  console.log('[Patch v3.0.0] ✅ Mobile UI Overhaul + Content patch fully loaded!\n' +
    '  · Mobile Dock (no-scroll toolbar, expandable secondary drawer)\n' +
    '  · Seed Quick-Pick grid overlay\n' +
    '  · Yield Preview badge (scythe mode)\n' +
    '  · Crop Inspector (double-tap any crop tile)\n' +
    '  · Daily Quests (3 tasks/day, auto-refresh each morning)\n' +
    '  · Rain Forecast HUD pill\n' +
    '  · Energy blink warning at ≤18%\n' +
    '  · Retro theme overrides for all new elements');

})();