/* ═══════════════════════════════════════════════════════════════════
   VALLEY FARM — MOBILE PATCH FIX 2  v2.0.0
   ───────────────────────────────────────────────────────────────────
   Load order:
     script.js → winter.js → fall_town.js → mobilepatch.js (v3.0.0)
     → mobilepatchfix.js (v1.0) → THIS FILE

   Changes at a glance
   ───────────────────
   1. More Drawer   — Town 🏘️, City 🏙️, Bag 🎒 and Map 🗺 removed.
                      Drawer now contains ONLY:
                      Shovel · Deco · Help/Tutorial · Pause

   2. Deco Picker   — Tapping 🎨 Deco opens a seed-style slide-up grid
                      showing every DECOS item. Tap to select; all deco
                      placement then uses that type.

   3. City Lock     — City requires Farming Lv.5. Any attempt to open
                      the city while locked shows a modal with a Farming
                      progress bar. Lock is re-evaluated every attempt.

   4. HUD Redesign  — Old mob-hud-strip (Gold · Town · City · Forecast)
                      is hidden. Replaced with #mob-hud-v2:
                        Row 1 › [Season chip · Day] [Gold] [Forecast]
                        Row 2 › Full-width energy bar + % label
                      Season chip accent colour changes with season.
                      Energy bar turns amber at ≤35 %, red + blinks ≤18 %.

   5. Tutorial Fix  — Updates the "Mobile Toolbar" and "Town & City"
                      HELP_STEPS entries to match the new layout.
═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const isMobile = () => window.innerWidth <= 680;

  /* ─────────────────────────────────────────────────────────────────
     SECTION 0 — INJECT CSS
  ───────────────────────────────────────────────────────────────── */
  const CSS = `
/* ── Suppress old HUD strip built by mobilepatchfix v1 ───────────── */
#mob-hud-strip { display: none !important; }

/* ── Kill Town / City dock & strip buttons wherever they exist ───── */
#dock-sec-town,
#dock-sec-city,
#mhs-town,
#mhs-city { display: none !important; }

/* ── Kill Bag / Map from secondary drawer (we pruned them in JS,
      but CSS ensures they stay gone if re-added) ────────────────── */
#dock-sec-bag,
#dock-sec-map { display: none !important; }

/* ═══ NEW MOBILE HUD v2 ══════════════════════════════════════════ */
#mob-hud-v2 {
  display: none;                        /* hidden until body.in-game  */
}

@media (max-width: 680px) {
  body.in-game #mob-hud-v2 {
    display: flex;
    flex-direction: column;
    position: fixed;
    /* Sit flush on top of the primary dock row (62 px)             */
    /* + iOS home-bar safe-area so nothing is hidden by the notch   */
    bottom: calc(62px + env(safe-area-inset-bottom, 0px));
    left: 0; right: 0;
    z-index: 178;
    background: var(--ui-bg);
    border-top: 1.5px solid var(--ui-border);
    box-shadow: 0 -4px 20px rgba(0,0,0,.10);
  }

  /* Give the farm grid enough bottom padding to clear dock + HUD  */
  #farm-wrap { padding-bottom: 116px !important; }
}
@media (max-width: 400px) {
  #farm-wrap { padding-bottom: 110px !important; }
}

/* ── Info row ────────────────────────────────────────────────────── */
.mhv2-row {
  display: flex;
  align-items: center;
  height: 42px;
  padding: 0 7px;
  gap: 0;
}

/* ── Season chip (left) ──────────────────────────────────────────── */
.mhv2-season {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 11px 5px 7px;
  border-radius: 10px;
  flex-shrink: 0;
  background: var(--mhv2-s-bg, rgba(22,163,74,.12));
  border: 1.5px solid var(--mhv2-s-col, #16a34a);
  margin-right: 7px;
  transition: background .45s, border-color .45s;
}
.mhv2-s-emoji { font-size: 17px; line-height: 1; }
.mhv2-s-text  { display: flex; flex-direction: column; line-height: 1.15; }
.mhv2-s-name  {
  font-size: 7px; font-weight: 900; letter-spacing: .7px;
  text-transform: uppercase;
  color: var(--mhv2-s-col, #16a34a);
  font-family: 'Nunito', sans-serif;
  transition: color .45s;
}
.mhv2-s-day   {
  font-size: 12px; font-weight: 900;
  color: var(--text-primary);
  font-family: 'Baloo 2', cursive;
}

/* ── Gold display (flex-grow, centred) ───────────────────────────── */
.mhv2-gold {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 16px;
  font-weight: 900;
  color: var(--gold, #b45309);
  font-family: 'Baloo 2', cursive;
  white-space: nowrap;
}
.mhv2-gold-coin { font-size: 14px; line-height: 1; }

/* ── Forecast chip (right) ───────────────────────────────────────── */
.mhv2-fc {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: 10px;
  background: var(--ui-bg2);
  border: 1.5px solid var(--ui-border);
  flex-shrink: 0;
  margin-left: 7px;
}
.mhv2-fc-icon { font-size: 15px; line-height: 1; }
.mhv2-fc-text {
  font-size: 9px; font-weight: 800;
  color: var(--text-muted);
  font-family: 'Nunito', sans-serif;
  white-space: nowrap;
}

/* ── Energy bar strip ────────────────────────────────────────────── */
.mhv2-ebar-wrap {
  height: 8px;
  background: var(--ui-bg2);
  border-top: 1px solid var(--ui-border);
  overflow: hidden;
  position: relative;
}
.mhv2-ebar-fill {
  height: 100%;
  background: linear-gradient(90deg, #22c55e, #86efac);
  border-radius: 0 4px 4px 0;
  min-width: 3px;
  transition: width .5s cubic-bezier(.25,.8,.25,1),
              background .4s ease;
}
.mhv2-ebar-fill.elv-low  { background: linear-gradient(90deg, #f59e0b, #fcd34d); }
.mhv2-ebar-fill.elv-crit {
  background: linear-gradient(90deg, #ef4444, #fca5a5);
  animation: mhv2EnergyPulse 1.1s ease-in-out infinite;
}
@keyframes mhv2EnergyPulse {
  0%,100% { opacity: 1; }
  50%      { opacity: .28; }
}
.mhv2-ebar-lbl {
  position: absolute;
  right: 6px; top: 50%;
  transform: translateY(-50%);
  font-size: 6.5px; font-weight: 900;
  color: var(--text-muted);
  font-family: 'Nunito', sans-serif;
  line-height: 1;
  pointer-events: none;
}

/* Season CSS custom-property sets ──────────────────────────────── */
#mob-hud-v2.sv-spring {
  --mhv2-s-col: #16a34a;
  --mhv2-s-bg:  rgba(22,163,74,.12);
}
#mob-hud-v2.sv-summer {
  --mhv2-s-col: #d97706;
  --mhv2-s-bg:  rgba(217,119,6,.12);
}
#mob-hud-v2.sv-fall {
  --mhv2-s-col: #c2410c;
  --mhv2-s-bg:  rgba(194,65,12,.12);
}
#mob-hud-v2.sv-winter {
  --mhv2-s-col: #0369a1;
  --mhv2-s-bg:  rgba(3,105,161,.12);
}

/* ═══ DECO PICKER (mirrors seed picker look) ═════════════════════ */
#dock-deco-picker {
  display: none;
  position: fixed;
  bottom: calc(62px + env(safe-area-inset-bottom, 0px));
  left: 0; right: 0;
  z-index: 192;
  background: var(--ui-bg);
  border-top: 1.5px solid var(--ui-border);
  border-radius: 18px 18px 0 0;
  padding: 10px 10px 12px;
  transform: translateY(100%);
  transition: transform .28s cubic-bezier(.25,.8,.25,1);
  box-shadow: 0 -8px 36px rgba(0,0,0,.16);
}
#dock-deco-picker.dp-open {
  transform: translateY(0);
  display: block;
}
#dock-deco-picker-title {
  font-size: 9px; font-weight: 800;
  color: var(--text-soft); text-transform: uppercase;
  letter-spacing: .8px; text-align: center; margin-bottom: 9px;
  font-family: 'Nunito', sans-serif;
}
#dock-deco-list {
  display: flex; gap: 7px; flex-wrap: wrap; justify-content: center;
}
.dp-btn {
  display: flex; flex-direction: column; align-items: center; gap: 3px;
  padding: 9px 7px 8px;
  background: var(--ui-bg2);
  border: 2px solid var(--ui-border);
  border-radius: 12px;
  cursor: pointer; min-width: 58px;
  transition: all .14s;
  -webkit-tap-highlight-color: transparent;
}
.dp-btn.dp-sel      { border-color: #b45309; background: #fef3c7; }
body.dark .dp-btn.dp-sel { background: #2d1b00; }
.dp-btn:active:not(.dp-sel) { transform: scale(.9); background: var(--ui-bg); }
.dp-em   { font-size: 22px; line-height: 1; }
.dp-name { font-size: 8px; font-weight: 700; color: var(--text-muted);
           text-align: center; font-family: 'Nunito', sans-serif; }

/* ═══ CITY LOCK MODAL ════════════════════════════════════════════ */
#city-lock-modal {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 1200;
  background: rgba(0,0,0,.55);
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
  align-items: center;
  justify-content: center;
}
#city-lock-modal.clm-open { display: flex; }
.clm-card {
  background: var(--ui-bg);
  border: 2px solid var(--ui-border);
  border-radius: 24px;
  padding: 28px 24px 22px;
  max-width: 300px;
  width: 88vw;
  text-align: center;
  box-shadow: 0 24px 64px rgba(0,0,0,.3);
  animation: clmPop .25s cubic-bezier(.34,1.56,.64,1);
}
@keyframes clmPop {
  from { opacity:0; transform:scale(.88) translateY(12px); }
  to   { opacity:1; transform:scale(1) translateY(0); }
}
.clm-icon  {
  font-size: 40px; margin-bottom: 10px; line-height: 1;
  display: block;
}
.clm-title {
  font-size: 17px; font-weight: 900;
  color: var(--text-primary);
  font-family: 'Baloo 2', cursive;
  margin-bottom: 7px;
}
.clm-body  {
  font-size: 12px; color: var(--text-muted);
  line-height: 1.65; margin-bottom: 14px;
  font-family: 'Nunito', sans-serif;
}
.clm-bar-wrap {
  height: 10px;
  background: var(--ui-bg2);
  border: 1px solid var(--ui-border);
  border-radius: 6px; overflow: hidden;
  margin-bottom: 5px;
}
.clm-bar-fill {
  height: 100%; border-radius: 6px;
  background: linear-gradient(90deg, #22c55e, #86efac);
  transition: width .55s cubic-bezier(.25,.8,.25,1);
}
.clm-prog {
  font-size: 10px; font-weight: 800;
  color: var(--text-muted);
  font-family: 'Nunito', sans-serif;
  margin-bottom: 16px;
}
.clm-ok {
  padding: 10px 26px;
  background: var(--ui-bg2);
  border: 1.5px solid var(--ui-border);
  border-radius: 10px;
  font-size: 12px; font-weight: 800;
  color: var(--text-primary); cursor: pointer;
  font-family: 'Nunito', sans-serif;
  transition: all .13s;
}
.clm-ok:active { transform: scale(.94); }

/* ═══ RETRO THEME OVERRIDES ══════════════════════════════════════ */
body.retro #mob-hud-v2 {
  background: #120c00;
  border-top: 3px solid #8b6914;
}
body.retro .mhv2-s-name {
  font-family: 'Press Start 2P', monospace;
  font-size: 4.5px;
}
body.retro .mhv2-s-day {
  font-family: 'Press Start 2P', monospace;
  font-size: 7.5px;
}
body.retro .mhv2-season { border-radius: 2px; }
body.retro .mhv2-gold {
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  color: #ffd700;
}
body.retro .mhv2-fc { border-radius: 2px; }
body.retro .mhv2-fc-text {
  font-family: 'Press Start 2P', monospace;
  font-size: 5px;
}
body.retro .mhv2-ebar-fill {
  background: #388e3c !important;
  animation: none !important;
}
body.retro .mhv2-ebar-fill.elv-low  { background: #e65100 !important; }
body.retro .mhv2-ebar-fill.elv-crit {
  background: #b71c1c !important;
  animation: mhv2EnergyPulse 1.1s ease-in-out infinite !important;
}
body.retro #dock-deco-picker {
  background: #120c00;
  border-top: 3px solid #8b6914;
  border-radius: 0;
}
body.retro #dock-deco-picker-title {
  font-family: 'Press Start 2P', monospace;
  font-size: 6px;
  color: #a1887f;
}
body.retro .dp-btn {
  background: #1c1209;
  border: 1px solid #3e2723;
  border-radius: 2px;
}
body.retro .dp-btn.dp-sel { border-color: #ffd700; background: #2d1b00; }
body.retro .dp-name {
  font-family: 'Press Start 2P', monospace;
  font-size: 5px;
}
body.retro .clm-card {
  background: #120c00;
  border: 3px solid #8b6914;
  border-radius: 4px;
}
body.retro .clm-title {
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  color: #f5deb3;
}
body.retro .clm-body {
  font-family: 'Press Start 2P', monospace;
  font-size: 5.5px;
  color: #a1887f;
  line-height: 2.2;
}
body.retro .clm-ok {
  font-family: 'Press Start 2P', monospace;
  font-size: 6px;
  background: #1c1209;
  border: 1px solid #3e2723;
  border-radius: 2px;
}
body.retro .clm-bar-fill { background: #388e3c; }
`;

  const styleEl = document.createElement('style');
  styleEl.id = 'vf-mpfix2-css';
  styleEl.textContent = CSS;
  document.head.appendChild(styleEl);

  /* ─────────────────────────────────────────────────────────────────
     SECTION 1 — CITY LOCK  (Farming Lv.5 gate)
  ───────────────────────────────────────────────────────────────── */
  const CITY_UNLOCK_LV = 5;

  function _farmLv() {
    if (typeof G === 'undefined' || !G.skills) return 0;
    const sk = G.skills.farming || G.skills.Farming || null;
    if (!sk) return 0;
    return (typeof getLevel === 'function') ? getLevel(sk.xp || 0) : 0;
  }

  function _cityLocked() { return _farmLv() < CITY_UNLOCK_LV; }

  /* ── Lock modal DOM ── */
  const lockModal = document.createElement('div');
  lockModal.id = 'city-lock-modal';
  lockModal.innerHTML = `
    <div class="clm-card">
      <span class="clm-icon">🏙️🔒</span>
      <div class="clm-title">City is Locked</div>
      <div class="clm-body">
        The city's Stock Exchange opens its doors at
        <strong>Farming Lv.${CITY_UNLOCK_LV}</strong>.
        Keep planting, watering and harvesting to level up!
      </div>
      <div class="clm-bar-wrap">
        <div class="clm-bar-fill" id="clm-bar-fill" style="width:0%"></div>
      </div>
      <div class="clm-prog" id="clm-prog-lbl">Farming Lv.0 / ${CITY_UNLOCK_LV}</div>
      <button class="clm-ok" id="clm-ok-btn">Keep Farming! 🌱</button>
    </div>`;
  document.body.appendChild(lockModal);

  lockModal.addEventListener('click', e => {
    if (e.target === lockModal) lockModal.classList.remove('clm-open');
  });
  document.getElementById('clm-ok-btn').addEventListener('click', () => {
    lockModal.classList.remove('clm-open');
  });

  function _showCityLock() {
    const lv  = _farmLv();
    const pct = Math.min(100, Math.round((lv / CITY_UNLOCK_LV) * 100));
    document.getElementById('clm-bar-fill').style.width  = pct + '%';
    document.getElementById('clm-prog-lbl').textContent  =
      'Farming Lv.' + lv + ' / ' + CITY_UNLOCK_LV;
    lockModal.classList.add('clm-open');
  }

  /* ── Wrap every city-opening function ── */
  const CITY_FNS = ['_travelAnimThenCity', 'openCityScreen', 'openCity', 'travelToCity'];

  function _hookCityFns() {
    CITY_FNS.forEach(fn => {
      if (typeof window[fn] !== 'function' || window[fn].__mpf2_locked) return;
      const _orig = window[fn];
      window[fn] = function () {
        if (_cityLocked()) { _showCityLock(); return; }
        return _orig.apply(this, arguments);
      };
      window[fn].__mpf2_locked = true;
    });
  }

  /* Poll: city functions might be assigned by other scripts later   */
  let _chTick = 0;
  (function _cityPoll() {
    _hookCityFns();
    if (++_chTick < 40) setTimeout(_cityPoll, 350);
  })();

  console.log('[MobilePatchFix2] City lock ✅ (requires Farming Lv.' + CITY_UNLOCK_LV + ')');

  /* ─────────────────────────────────────────────────────────────────
     SECTION 2 — SECONDARY DRAWER CLEANUP
     Keep : Shovel (#dock-sec-shovel) · Deco (#dock-sec-deco)
            Help   (#dock-sec-help)   · Pause (#dock-sec-pause)
     Kill  : Bag · Map · Town · City  (both by ID and MutationObserver)
  ───────────────────────────────────────────────────────────────── */
  const KILL_SEC = [
    'dock-sec-bag', 'dock-sec-map',
    'dock-sec-town', 'dock-sec-city',
  ];

  function _pruneSecDrawer() {
    KILL_SEC.forEach(id => document.getElementById(id)?.remove());
  }

  function _watchAndPrune() {
    const sec = document.getElementById('dock-secondary');
    if (!sec) { setTimeout(_watchAndPrune, 150); return; }

    /* Prune now, then observe for future re-insertions */
    _pruneSecDrawer();
    const obs = new MutationObserver(_pruneSecDrawer);
    obs.observe(sec, { childList: true });

    console.log('[MobilePatchFix2] Secondary drawer pruned ✅');
  }
  _watchAndPrune();

  /* ─────────────────────────────────────────────────────────────────
     SECTION 3 — DECO PICKER (seed-style slide-up grid)
  ───────────────────────────────────────────────────────────────── */
  const decoPicker = document.createElement('div');
  decoPicker.id = 'dock-deco-picker';
  decoPicker.innerHTML = `
    <div id="dock-deco-picker-title">🎨 Choose Decoration</div>
    <div id="dock-deco-list"></div>`;
  document.body.appendChild(decoPicker);

  let _activeDeco = null;   /* currently selected DECOS key */

  function _refreshDecoPicker() {
    const list = document.getElementById('dock-deco-list');
    if (!list) return;

    /* DECOS is a const in script.js → always available at this point */
    const decos = (typeof DECOS !== 'undefined') ? DECOS : {};
    const keys  = Object.keys(decos);

    if (!keys.length) {
      list.innerHTML = `<p style="font-size:11px;color:var(--text-muted);
        padding:8px 0;text-align:center">No decoration items yet.</p>`;
      return;
    }

    list.innerHTML = keys.map(k => {
      const d   = decos[k];
      const sel = k === _activeDeco;
      return `<button class="dp-btn${sel ? ' dp-sel' : ''}" data-deco="${k}">
        <span class="dp-em">${d.e}</span>
        <span class="dp-name">${d.n}</span>
      </button>`;
    }).join('');

    list.querySelectorAll('.dp-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        _activeDeco = btn.dataset.deco;
        /* Persist to game state so placement logic can read it       */
        if (typeof G !== 'undefined') G.decoType = _activeDeco;
        /* Highlight */
        list.querySelectorAll('.dp-btn').forEach(b => b.classList.remove('dp-sel'));
        btn.classList.add('dp-sel');
        /* Activate the deco tool */
        if (typeof setTool === 'function') setTool('deco');
      });
    });
  }

  function _openDecoPicker() {
    _refreshDecoPicker();
    decoPicker.style.display = 'block';
    void decoPicker.offsetHeight;        /* force reflow for transition */
    decoPicker.classList.add('dp-open');
  }

  function _closeDecoPicker() {
    decoPicker.classList.remove('dp-open');
    setTimeout(() => {
      if (!decoPicker.classList.contains('dp-open')) decoPicker.style.display = 'none';
    }, 320);
  }

  /* ── Intercept #dock-sec-deco to open picker instead ── */
  function _hookDecoBtn() {
    const decoBtn = document.getElementById('dock-sec-deco');
    if (!decoBtn) { setTimeout(_hookDecoBtn, 150); return; }
    if (decoBtn.__mpf2_hooked) return;
    decoBtn.__mpf2_hooked = true;

    /* Clone so we own all event listeners */
    const fresh = decoBtn.cloneNode(true);
    decoBtn.replaceWith(fresh);
    fresh.addEventListener('click', e => {
      e.stopPropagation();
      /* Close secondary drawer first so only the picker slides up   */
      const moreBtn = document.getElementById('dock-more');
      if (moreBtn?.classList.contains('active')) moreBtn.click();
      _openDecoPicker();
    });

    console.log('[MobilePatchFix2] Deco picker hooked ✅');
  }
  _hookDecoBtn();

  /* Close deco picker when user taps the farm grid */
  const farmWrap = document.getElementById('farm-wrap');
  if (farmWrap) farmWrap.addEventListener('click', _closeDecoPicker, { passive: true });

  /* Mutual exclusion: close deco picker when seed picker opens */
  (function _mutexPickerWatch() {
    const sp = document.getElementById('dock-seed-picker');
    if (!sp) { setTimeout(_mutexPickerWatch, 200); return; }
    new MutationObserver(() => {
      if (sp.classList.contains('picker-open')) _closeDecoPicker();
    }).observe(sp, { attributes: true, attributeFilter: ['class'] });
  })();

  /* Also close deco picker when primary dock tool changes */
  const _origSetTool = window.setTool;
  window.setTool = function (t) {
    if (t !== 'deco') _closeDecoPicker();
    return _origSetTool.apply(this, arguments);
  };

  console.log('[MobilePatchFix2] Deco picker ✅');

  /* ─────────────────────────────────────────────────────────────────
     SECTION 4 — FRESH MOBILE HUD  (#mob-hud-v2)
  ───────────────────────────────────────────────────────────────── */
  const hudV2 = document.createElement('div');
  hudV2.id = 'mob-hud-v2';
  hudV2.innerHTML = `
    <div class="mhv2-row">
      <!-- Left: Season chip -->
      <div class="mhv2-season" id="mhv2-season">
        <span class="mhv2-s-emoji" id="mhv2-s-emoji">🌸</span>
        <div class="mhv2-s-text">
          <span class="mhv2-s-name" id="mhv2-s-name">SPRING</span>
          <span class="mhv2-s-day"  id="mhv2-s-day">Day 1</span>
        </div>
      </div>
      <!-- Centre: Gold -->
      <div class="mhv2-gold">
        <span class="mhv2-gold-coin">💰</span>
        <span id="mhv2-gold-val">0g</span>
      </div>
      <!-- Right: Forecast -->
      <div class="mhv2-fc">
        <span class="mhv2-fc-icon" id="mhv2-fc-icon">🌤️</span>
        <span class="mhv2-fc-text" id="mhv2-fc-text">--</span>
      </div>
    </div>
    <!-- Energy bar -->
    <div class="mhv2-ebar-wrap">
      <div class="mhv2-ebar-fill" id="mhv2-ebar-fill" style="width:100%"></div>
      <span class="mhv2-ebar-lbl"  id="mhv2-ebar-lbl">100%⚡</span>
    </div>`;
  document.body.appendChild(hudV2);

  /* Season data */
  const RAIN_PCT = { Spring: 28, Summer: 22, Fall: 10, Winter: 0 };
  const SZ_EMOJI = { Spring: '🌸', Summer: '☀️', Fall: '🍂', Winter: '❄️' };
  const SZ_CLASS = {
    Spring: 'sv-spring', Summer: 'sv-summer',
    Fall: 'sv-fall',     Winter: 'sv-winter',
  };

  function _refreshHudV2() {
    if (!isMobile()) return;
    if (typeof G === 'undefined' || G.day === undefined) return;

    const sz  = (typeof season === 'function') ? season() : 'Spring';
    const szC = SZ_CLASS[sz] || 'sv-spring';

    /* Season chip */
    const eEl   = document.getElementById('mhv2-s-emoji');
    const nEl   = document.getElementById('mhv2-s-name');
    const dayEl = document.getElementById('mhv2-s-day');
    if (eEl)   eEl.textContent   = SZ_EMOJI[sz]   || '🌱';
    if (nEl)   nEl.textContent   = sz.toUpperCase();
    if (dayEl) dayEl.textContent = 'Day ' + (G.day || 1);

    /* Season tint: swap class */
    Object.values(SZ_CLASS).forEach(c => hudV2.classList.remove(c));
    hudV2.classList.add(szC);

    /* Gold — compact thousands format */
    const gEl = document.getElementById('mhv2-gold-val');
    if (gEl) {
      const g = G.gold || 0;
      gEl.textContent = g >= 10000
        ? (g / 1000).toFixed(1).replace(/\.0$/, '') + 'k g'
        : g + 'g';
    }

    /* Forecast chip */
    const fcI = document.getElementById('mhv2-fc-icon');
    const fcT = document.getElementById('mhv2-fc-text');
    if (fcI && fcT) {
      const pct = RAIN_PCT[sz] ?? 0;
      if (pct === 0)    { fcI.textContent = '☀️';  fcT.textContent = 'Dry'; }
      else if (pct < 25){ fcI.textContent = '🌤️'; fcT.textContent = pct + '%'; }
      else              { fcI.textContent = '🌧️'; fcT.textContent = pct + '%'; }
    }

    /* Energy bar */
    const fill = document.getElementById('mhv2-ebar-fill');
    const lbl  = document.getElementById('mhv2-ebar-lbl');
    if (fill) {
      const cur  = G.energy ?? 0;
      const max  = (typeof maxEnergy === 'function') ? maxEnergy() : 100;
      const pct  = max > 0 ? Math.max(0, Math.min(100, Math.round((cur / max) * 100))) : 100;
      fill.style.width = pct + '%';
      if (lbl) lbl.textContent = pct + '%⚡';
      fill.classList.remove('elv-low', 'elv-crit');
      if      (pct <= 18) fill.classList.add('elv-crit');
      else if (pct <= 35) fill.classList.add('elv-low');
    }
  }

  /* ── Wire up hooks so the HUD stays live ── */

  /* renderHUD fires on every gold/energy tick */
  const _origRenderHUD = window.renderHUD;
  window.renderHUD = function () {
    _origRenderHUD.apply(this, arguments);
    _refreshHudV2();
  };

  /* launchGame — initial population once gameplay starts */
  const _origLaunchGame = window.launchGame;
  window.launchGame = function () {
    _origLaunchGame.apply(this, arguments);
    /* Small delay: wait for G.day / season() to be valid             */
    setTimeout(_refreshHudV2, 450);
  };

  /* doSleep — day & season may change after sleeping */
  const _origDoSleep = window.doSleep;
  window.doSleep = function () {
    const r = _origDoSleep?.apply(this, arguments);
    setTimeout(_refreshHudV2, 700);
    return r;
  };

  console.log('[MobilePatchFix2] HUD v2 ✅');

  /* ─────────────────────────────────────────────────────────────────
     SECTION 5 — KILL TOWN / CITY FROM THE DESKTOP HUD TOOLBAR
     hud-town-btn and hud-city-btn are rendered by renderHUD in
     script.js and therefore re-appear on every HUD repaint.
     We hide them on every render call (mobile only) and also on load.
  ───────────────────────────────────────────────────────────────── */
  const KILL_HUD_IDS = ['hud-town-btn', 'hud-city-btn'];

  function _killHudNavBtns() {
    if (!isMobile()) return;
    KILL_HUD_IDS.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.setProperty('display', 'none', 'important');
    });
  }

  /* Wrap render (already chained by mobilepatch & fall_town — safe) */
  const _origRender = window.render;
  window.render = function () {
    _origRender?.apply(this, arguments);
    _killHudNavBtns();
    _refreshHudV2();   /* keep HUD live on full re-renders too        */
  };

  /* Run once immediately in case HUD is already painted */
  _killHudNavBtns();

  /* ─────────────────────────────────────────────────────────────────
     SECTION 6 — UPDATE TUTORIAL STEPS
     Rewrites the two affected HELP_STEPS entries that mobilepatchfix
     v1 inserted, so the text matches the new layout.
  ───────────────────────────────────────────────────────────────── */
  function _patchTutorial() {
    if (typeof HELP_STEPS === 'undefined' || !Array.isArray(HELP_STEPS)) {
      setTimeout(_patchTutorial, 220);
      return;
    }
    /* Don't patch twice */
    if (HELP_STEPS._mpf2Updated) return;
    HELP_STEPS._mpf2Updated = true;

    const toolbar = HELP_STEPS.find(s => s.title === 'Mobile Toolbar');
    if (toolbar) {
      toolbar.body =
        'On mobile your tools live in the bottom dock. ' +
        'Primary row: Hoe · Water · Seeds · Harvest · Sleep. ' +
        'Tap "⋯ More" to reveal Shovel, Deco, Help and Pause.';
      toolbar.tip =
        'Tip: Tap 🎨 Deco to open a grid picker — choose a decoration ' +
        'type, then tap any tile to place it!';
    }

    const tcStep = HELP_STEPS.find(s => s.title === 'Town & City');
    if (tcStep) {
      tcStep.body =
        'The 🏙️ City Stock Exchange unlocks at Farming Lv.5 — ' +
        'keep planting and harvesting to get there. ' +
        'A progress bar shows how far you are when you try to visit.';
      tcStep.tip =
        'Tip: Reach Farming Lv.5 before Fall for the best IPO timing!';
    }

    console.log('[MobilePatchFix2] Tutorial steps updated ✅');
  }
  _patchTutorial();

  /* ─────────────────────────────────────────────────────────────────
     INIT — sync everything if game is already running
  ───────────────────────────────────────────────────────────────── */
  function _init() {
    _pruneSecDrawer();
    _killHudNavBtns();

    /* If game-screen is already active (patch loaded late)          */
    const gs = document.getElementById('game-screen');
    if (gs?.classList.contains('active') || (typeof G !== 'undefined' && G.day !== undefined)) {
      document.body.classList.add('in-game');
      _refreshHudV2();
    }

    console.log(
      '[MobilePatchFix2 v2.0.0] ✅ Fully loaded!\n' +
      '  · More drawer  : Town/City/Bag/Map removed — only Shovel·Deco·Help·Pause\n' +
      '  · Deco Picker  : seed-style slide-up grid (DECOS items)\n' +
      '  · City Lock    : Farming Lv.' + CITY_UNLOCK_LV + ' required, modal + progress bar\n' +
      '  · Mobile HUD v2: Season chip · Gold · Forecast + energy strip\n' +
      '  · Tutorial     : "Mobile Toolbar" and "Town & City" steps updated'
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _init);
  } else {
    _init();
  }

})();