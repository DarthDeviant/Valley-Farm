/* ═══════════════════════════════════════════════════════════════════
   VALLEY FARM — MOBILE PATCH FIX 4  (mpfix4.js)  v1.0
   ───────────────────────────────────────────────────────────────────
   Load order: after script.js · winter.js · mobilepatch.js
               · mobilepatchfix.js · mobilepatchfix2.js · mpfix3.js

   What this does (MOBILE ONLY — zero PC-side changes)
   ─────────────────────────────────────────────────────
   1. Layout Overhaul
      Hides the scrolling #hud top bar entirely on mobile — all that
      info is already in the HUD strip. Repositions #mob-hud-strip
      from "above the dock" to the very top of the screen (like a
      proper status bar). farm-wrap gains top padding to clear it.

   2. Deco Picker  (FIXES deco menu not showing)
      The 🎨 Deco button now opens a grid picker overlay — identical
      in style to the seed picker — showing all 7 decoration types.
      Tap a type to select it; the change is synced to the hidden
      #deco-select so the game engine picks it up immediately.
      Tap 🎨 Deco again to close the picker and revert to Hoe.
      Switching to any other tool also closes the picker.

   3. Crop Ready Badge
      A red pill badge with a count appears on the 🌾 Harvest dock
      button whenever ≥ 1 crop is ready to harvest. It disappears
      after scytheAll or when no crops remain ready.

   4. Season Progress Bar
      A 3 px coloured bar at the bottom of the top strip fills from
      left to right as the season advances (Day 1 → Day 28).
      Colour matches the season: 🌸 green · ☀️ amber · 🍂 red · ❄️ blue.

   5. Morning Weather Toast
      After each sleep a brief toast shows: current day, season, and
      tonight's rain chance — gives the player a quick daily briefing.

   6. Sleep Nudge for Unwatered Crops
      If ≥ 3 planted tiles are unwatered when Sleep is tapped, a
      one-off toast fires to remind the player before the night ends.

   7. Low-Energy Sleep Button Glow
      When energy drops to ≤ 18 % the 💤 Sleep dock button pulses
      with a soft indigo glow, hinting "maybe it's time to rest".
═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const isMobile = () => window.innerWidth <= 680;

  /* ─────────────────────────────────────────────────────────────────
     SECTION 0 — CSS
  ───────────────────────────────────────────────────────────────── */
  const CSS = `
/* ══ HIDE original top HUD bar on mobile ════════════════════════════
   All the same info lives in the HUD strip; the bar wastes vertical
   space and confuses the layout when the strip moves to the top.
══════════════════════════════════════════════════════════════════ */
@media (max-width: 680px) {
  body.in-game #hud {
    display: none !important;
  }
}

/* ══ MOVE mob-hud-strip to the very top ══════════════════════════════
   Override the mobilepatchfix/mpfix3 bottom:62px positioning.
══════════════════════════════════════════════════════════════════ */
@media (max-width: 680px) {
  body.in-game #mob-hud-strip {
    position: fixed !important;
    top: 0 !important;
    bottom: auto !important;
    left: 0 !important;
    right: 0 !important;
    z-index: 200 !important;
    border-top: none !important;
    border-bottom: 1.5px solid var(--ui-border) !important;
    box-shadow: 0 2px 14px rgba(0,0,0,.12) !important;
    padding: 5px 8px 8px !important; /* extra bottom padding for the progress bar */
    min-height: 36px;
  }

  /* Main content area clears the fixed top strip (~38 px) */
  body.in-game #main {
    padding-top: 42px !important;
  }

  /* farm-wrap: only dock bottom padding (strip is now at top) */
  body.in-game #farm-wrap {
    padding-top: 0 !important;
    padding-bottom: 76px !important;
  }
}
@media (max-width: 400px) {
  body.in-game #farm-wrap { padding-bottom: 70px !important; }
}

/* ══ SEASON PROGRESS BAR — sits at the bottom of the top strip ══════ */
#mhf4-season-bar-wrap {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 3px;
  background: var(--ui-border);
  overflow: hidden;
  border-radius: 0 0 0 0;
}
#mhf4-season-bar {
  height: 100%;
  width: 0%;
  transition: width .7s ease;
  border-radius: 0 2px 2px 0;
}
/* Season tint colours */
body.season-spring  #mhf4-season-bar,
body:not([class*="season-"]) #mhf4-season-bar { background: #22c55e; }
body.season-summer  #mhf4-season-bar           { background: #f59e0b; }
body.season-fall    #mhf4-season-bar           { background: #ef4444; }
body.season-winter  #mhf4-season-bar           { background: #60a5fa; }

/* ══ DECO PICKER ════════════════════════════════════════════════════ */
#dock-deco-picker {
  display: none;
  position: fixed;
  bottom: 68px; left: 0; right: 0;
  z-index: 191;
  background: var(--ui-bg);
  border-top: 1.5px solid var(--ui-border);
  border-radius: 18px 18px 0 0;
  padding: 10px 10px 12px;
  transform: translateY(100%);
  transition: transform .28s cubic-bezier(.25,.8,.25,1);
  box-shadow: 0 -8px 36px rgba(0,0,0,.15);
}
#dock-deco-picker.picker-open {
  transform: translateY(0);
}
#dock-deco-picker-title {
  font-size: 9px;
  font-weight: 800;
  color: var(--text-soft);
  text-transform: uppercase;
  letter-spacing: .8px;
  text-align: center;
  margin-bottom: 8px;
  font-family: 'Nunito', sans-serif;
}
#dock-deco-list {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
}
.deco-pick-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 9px 5px 7px;
  background: var(--ui-bg2);
  border: 2px solid var(--ui-border);
  border-radius: 12px;
  cursor: pointer;
  min-width: 58px;
  transition: all .14s;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
.deco-pick-btn:active { transform: scale(.9); }
.deco-pick-btn.sel {
  border-color: #c2410c;
  background: #fff7ed;
}
body.dark .deco-pick-btn.sel { background: #1c0d00; border-color: #ea580c; }
.dp-em   { font-size: 22px; line-height: 1; pointer-events: none; }
.dp-name {
  font-size: 8px; font-weight: 700;
  color: var(--text-muted); text-align: center;
  font-family: 'Nunito', sans-serif;
  pointer-events: none;
}

/* ══ CROP READY BADGE on Harvest button ════════════════════════════ */
#mhf4-crop-badge {
  display: none;
  position: absolute;
  top: 3px; right: 2px;
  min-width: 17px; height: 17px;
  background: #ef4444;
  color: #fff;
  font-size: 9px;
  font-weight: 900;
  font-family: 'Nunito', sans-serif;
  border-radius: 10px;
  padding: 0 4px;
  text-align: center;
  line-height: 17px;
  pointer-events: none;
  z-index: 5;
  box-shadow: 0 1px 5px rgba(239,68,68,.5);
  animation: mhf4BadgePop .22s cubic-bezier(.34,1.56,.64,1);
}
@keyframes mhf4BadgePop {
  from { transform: scale(0); }
  to   { transform: scale(1); }
}

/* ══ LOW-ENERGY GLOW on Sleep dock button ════════════════════════════ */
.dock-btn-sleep.mhf4-sleep-warn .dock-icon {
  animation: mhf4SleepGlow 1.4s ease-in-out infinite;
}
@keyframes mhf4SleepGlow {
  0%,100% { filter: none; }
  50%      { filter: drop-shadow(0 0 8px #818cf8); }
}

/* ══ RETRO overrides ═══════════════════════════════════════════════ */
body.retro #dock-deco-picker {
  background: #120c00;
  border-top: 3px solid #8b6914;
  border-radius: 0;
  box-shadow: none;
}
body.retro #dock-deco-picker-title {
  font-family: 'Press Start 2P', monospace !important;
  font-size: 6px !important;
  color: #a1887f !important;
}
body.retro .deco-pick-btn {
  background: #1c1209;
  border: 1px solid #3e2723;
  border-radius: 2px;
  min-width: 50px;
}
body.retro .deco-pick-btn.sel {
  border-color: #ffd700;
  background: #2d1b00;
}
body.retro .dp-em  { font-size: 18px; }
body.retro .dp-name {
  font-family: 'Press Start 2P', monospace !important;
  font-size: 5px !important;
  color: #a1887f !important;
}
body.retro #mhf4-crop-badge {
  background: #8b0000;
  border-radius: 2px;
  font-family: 'Press Start 2P', monospace;
  font-size: 6px;
  box-shadow: none;
  animation: none;
}
body.retro #mhf4-season-bar-wrap { background: #3e2723; }
body.retro #mhf4-season-bar { background: #ffd700 !important; }
`;

  const styleEl = document.createElement('style');
  styleEl.id = 'vf-mpfix4-css';
  styleEl.textContent = CSS;
  document.head.appendChild(styleEl);

  /* ─────────────────────────────────────────────────────────────────
     SECTION 1 — SEASON PROGRESS BAR
     Appended to the bottom of #mob-hud-strip. Waits for mpfix3 to
     finish rebuilding the strip (it uses setTimeout ~200 ms) before
     injecting, so we delay to 650 ms.
  ───────────────────────────────────────────────────────────────── */
  function _injectSeasonBar () {
    const strip = document.getElementById('mob-hud-strip');
    if (!strip) { setTimeout(_injectSeasonBar, 200); return; }
    if (document.getElementById('mhf4-season-bar-wrap')) return;

    const wrap = document.createElement('div');
    wrap.id = 'mhf4-season-bar-wrap';
    const bar = document.createElement('div');
    bar.id = 'mhf4-season-bar';
    wrap.appendChild(bar);
    strip.appendChild(wrap);

    console.log('[mpfix4] Season progress bar injected.');
  }

  function _updateSeasonBar () {
    const bar = document.getElementById('mhf4-season-bar');
    if (!bar || typeof G === 'undefined') return;
    const SEASON_LEN = 28;
    const dayInSeason = ((G.day - 1) % SEASON_LEN) + 1;
    bar.style.width = Math.min(100, Math.round((dayInSeason / SEASON_LEN) * 100)) + '%';
  }

  /* ─────────────────────────────────────────────────────────────────
     SECTION 2 — DECO PICKER
     Mirrors the seed picker pattern from mobilepatch.js v3.0.0.
     Opens when 🎨 Deco is tapped; each option syncs to G.deco and
     the hidden #deco-select so clickTile places the right deco.
  ───────────────────────────────────────────────────────────────── */
  const DECO_TYPES = [
    { value: 'path',      e: '🟫', n: 'Path'      },
    { value: 'fence',     e: '🪵', n: 'Fence'     },
    { value: 'flower',    e: '🌸', n: 'Flowers'   },
    { value: 'lamp',      e: '🏮', n: 'Lamp'      },
    { value: 'sign',      e: '🪧', n: 'Sign'      },
    { value: 'rock',      e: '🪨', n: 'Rock'      },
    { value: 'scarecrow', e: '🧍', n: 'Scarecrow' },
  ];

  let _decoPicker = null;

  function _buildDecoPicker () {
    if (document.getElementById('dock-deco-picker')) {
      _decoPicker = document.getElementById('dock-deco-picker');
      return;
    }
    const picker = document.createElement('div');
    picker.id = 'dock-deco-picker';
    picker.innerHTML = `
      <div id="dock-deco-picker-title">🎨 Choose Decoration</div>
      <div id="dock-deco-list"></div>`;
    document.body.appendChild(picker);
    _decoPicker = picker;
    _refreshDecoPicker();
    console.log('[mpfix4] Deco picker built.');
  }

  function _refreshDecoPicker () {
    const list = document.getElementById('dock-deco-list');
    if (!list) return;
    const cur = (typeof G !== 'undefined' && G.deco) ? G.deco : 'path';
    list.innerHTML = DECO_TYPES.map(d =>
      `<button class="deco-pick-btn${d.value === cur ? ' sel' : ''}" data-deco="${d.value}">
         <span class="dp-em">${d.e}</span>
         <span class="dp-name">${d.n}</span>
       </button>`
    ).join('');
    list.querySelectorAll('.deco-pick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.deco;
        if (typeof G !== 'undefined') G.deco = val;
        /* Sync to the hidden desktop <select> so the game engine
           registers the change exactly as if the user used it.   */
        const sel = document.getElementById('deco-select');
        if (sel) { sel.value = val; sel.dispatchEvent(new Event('change')); }
        list.querySelectorAll('.deco-pick-btn').forEach(b => b.classList.remove('sel'));
        btn.classList.add('sel');
        /* Keep picker open — player may want to swap types mid-session */
      });
    });
  }

  function _openDecoPicker () {
    if (!_decoPicker) _buildDecoPicker();
    _refreshDecoPicker();
    _decoPicker.style.display = 'block';
    void _decoPicker.offsetHeight; // force reflow so transition fires
    _decoPicker.classList.add('picker-open');

    /* Close seed picker if accidentally open */
    const sp = document.getElementById('dock-seed-picker');
    if (sp && sp.classList.contains('picker-open')) {
      sp.classList.remove('picker-open');
      setTimeout(() => {
        if (!sp.classList.contains('picker-open')) sp.style.display = 'none';
      }, 320);
    }
  }

  function _closeDecoPicker () {
    if (!_decoPicker) return;
    _decoPicker.classList.remove('picker-open');
    /* Hide after transition completes */
    setTimeout(() => {
      if (_decoPicker && !_decoPicker.classList.contains('picker-open'))
        _decoPicker.style.display = 'none';
    }, 320);
  }

  /* ── Patch the Deco secondary-dock button ───────────────────────── */
  function _patchDecoButton () {
    const btn = document.getElementById('dock-sec-deco');
    if (!btn) { setTimeout(_patchDecoButton, 150); return; }

    /* Clone removes ALL prior listeners (mobilepatch, mpfix3, etc.)
       so we start with a clean slate.                              */
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    newBtn.addEventListener('click', () => {
      if (!isMobile()) {
        if (typeof setTool === 'function') setTool('deco');
        return;
      }
      const decoActive = typeof G !== 'undefined' && G.tool === 'deco';
      if (decoActive) {
        /* Second tap → close picker and revert to Hoe */
        _closeDecoPicker();
        if (typeof setTool === 'function') setTool('hoe');
        /* Close the secondary drawer too */
        const moreBtn = document.getElementById('dock-more');
        if (moreBtn && moreBtn.classList.contains('active')) moreBtn.click();
      } else {
        /* First tap → activate deco tool AND show the picker */
        if (typeof setTool === 'function') setTool('deco');
        _openDecoPicker();
      }
    });

    console.log('[mpfix4] Deco button patched (picker enabled).');
  }

  /* ── Wrap setTool so switching away closes the deco picker ───────── */
  function _hookSetToolCloseDeco () {
    if (typeof window.setTool !== 'function') {
      setTimeout(_hookSetToolCloseDeco, 100);
      return;
    }
    const _prev = window.setTool;
    window.setTool = function (t) {
      _prev.apply(this, arguments);
      if (t !== 'deco') _closeDecoPicker();
    };
    console.log('[mpfix4] setTool hooked to auto-close deco picker.');
  }

  /* ─────────────────────────────────────────────────────────────────
     SECTION 3 — CROP READY BADGE on 🌾 Harvest dock button
  ───────────────────────────────────────────────────────────────── */
  function _injectCropBadge () {
    const btn = document.getElementById('dock-scythe');
    if (!btn) { setTimeout(_injectCropBadge, 200); return; }
    if (document.getElementById('mhf4-crop-badge')) return;
    const badge = document.createElement('span');
    badge.id = 'mhf4-crop-badge';
    btn.style.position = 'relative'; // ensure badge positions relative to button
    btn.appendChild(badge);
    console.log('[mpfix4] Crop ready badge injected.');
  }

  function _countReadyCrops () {
    if (typeof G === 'undefined' || !G.farm) return 0;
    let count = 0;
    for (let r = 0; r < GH; r++) {
      for (let c = 0; c < GW; c++) {
        const tile = G.farm[r] && G.farm[r][c];
        if (tile && tile.crop && typeof cropStage === 'function' && cropStage(tile.crop) === 3)
          count++;
      }
    }
    return count;
  }

  function _updateCropBadge () {
    const badge = document.getElementById('mhf4-crop-badge');
    if (!badge) return;
    const count = _countReadyCrops();
    if (count > 0) {
      const label = count > 9 ? '9+' : String(count);
      if (badge.textContent !== label) {
        badge.textContent = label;
        /* Re-trigger pop animation */
        badge.style.animation = 'none';
        void badge.offsetHeight;
        badge.style.animation = '';
      }
      badge.style.display = 'block';
    } else {
      badge.style.display = 'none';
    }
  }

  /* ─────────────────────────────────────────────────────────────────
     SECTION 4 — LOW-ENERGY SLEEP BUTTON GLOW
  ───────────────────────────────────────────────────────────────── */
  function _updateSleepGlow () {
    const btn = document.getElementById('dock-sleep');
    if (!btn || typeof G === 'undefined') return;
    const maxE = (typeof maxEnergy === 'function') ? maxEnergy() : 100;
    const low  = maxE > 0 && (G.energy / maxE) <= 0.18 && G.energy > 0;
    btn.classList.toggle('mhf4-sleep-warn', low);
  }

  /* ─────────────────────────────────────────────────────────────────
     SECTION 5 — MORNING WEATHER TOAST  (fires after sleep)
  ───────────────────────────────────────────────────────────────── */
  const RAIN_PCT   = { Spring: 28, Summer: 22, Fall: 10, Winter: 0 };
  const SEASON_EM  = { Spring: '🌸', Summer: '☀️', Fall: '🍂', Winter: '❄️' };

  function _morningToast () {
    if (!isMobile() || typeof G === 'undefined' || typeof season !== 'function') return;
    const s   = season();
    const pct = RAIN_PCT[s] ?? 0;
    const em  = SEASON_EM[s] || '🌾';
    /* Use first word of farmer name or fall back to 'Farmer' */
    const name = (G.name ? G.name.split(' ')[0] : 'Farmer');
    const wxStr = pct === 0
      ? 'No rain tonight ☀️'
      : (pct >= 25 ? `🌧️ ${pct}% rain tonight!` : `🌤️ ${pct}% rain tonight`);
    if (typeof toast === 'function') {
      toast(`${em} Good morning, ${name}! Day ${G.day} · ${s} · ${wxStr}`);
    }
  }

  /* ─────────────────────────────────────────────────────────────────
     SECTION 6 — UNWATERED CROPS NUDGE  (fires just before sleep)
  ───────────────────────────────────────────────────────────────── */
  let _nudgeFiredToday = false;

  function _countUnwateredCrops () {
    if (typeof G === 'undefined' || !G.farm) return 0;
    let n = 0;
    for (let r = 0; r < GH; r++) {
      for (let c = 0; c < GW; c++) {
        const t = G.farm[r] && G.farm[r][c];
        if (t && t.tilled && t.crop && !t.watered) n++;
      }
    }
    return n;
  }

  function _hookDoSleep () {
    if (typeof window.doSleep !== 'function') {
      setTimeout(_hookDoSleep, 200);
      return;
    }
    const _prev = window.doSleep;
    window.doSleep = function () {
      /* Pre-sleep nudge (fires synchronously before overnight calc) */
      if (isMobile() && !_nudgeFiredToday) {
        const unwatered = _countUnwateredCrops();
        if (unwatered >= 3 && typeof toast === 'function') {
          _nudgeFiredToday = true;
          toast(`🌵 ${unwatered} crops weren't watered — they'll grow slower overnight!`);
        }
      }

      const ret = _prev.apply(this, arguments);

      /* Post-sleep: reset flag + fire morning briefing */
      _nudgeFiredToday = false;
      setTimeout(() => {
        _morningToast();
        _updateCropBadge();
        _updateSeasonBar();
        _updateSleepGlow();
      }, 950); /* after sleep animation finishes */

      return ret;
    };
    console.log('[mpfix4] doSleep hooked for nudge + morning toast.');
  }

  /* ─────────────────────────────────────────────────────────────────
     SECTION 7 — HOOK renderHUD
     Chain after whatever mpfix3 already chained.
  ───────────────────────────────────────────────────────────────── */
  function _hookRenderHUD () {
    if (typeof window.renderHUD !== 'function') {
      setTimeout(_hookRenderHUD, 100);
      return;
    }
    const _prev = window.renderHUD;
    window.renderHUD = function () {
      _prev.apply(this, arguments);
      if (!isMobile()) return;
      _updateCropBadge();
      _updateSeasonBar();
      _updateSleepGlow();
    };
    console.log('[mpfix4] renderHUD hooked for badge / bar / glow updates.');
  }

  /* ─────────────────────────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────────────────────────── */
  function init () {
    _buildDecoPicker();
    _patchDecoButton();
    _hookSetToolCloseDeco();
    _injectCropBadge();
    _hookDoSleep();
    _hookRenderHUD();

    /* Season bar: wait 650 ms so mpfix3's _rebuildHudStrip (200 ms)
       has definitely fired before we append to the strip.         */
    setTimeout(_injectSeasonBar, 650);

    /* If the game screen is already active when this patch loads late */
    const gs = document.getElementById('game-screen');
    if (gs && gs.classList.contains('active')) {
      document.body.classList.add('in-game');
      setTimeout(() => {
        _updateCropBadge();
        _updateSeasonBar();
        _updateSleepGlow();
      }, 700);
    }

    console.log('[mpfix4 v1.0] ✅ Loaded!\n' +
      '  · Top #hud bar hidden on mobile\n' +
      '  · #mob-hud-strip repositioned to screen TOP\n' +
      '  · 🎨 Deco button now opens a full deco-type picker\n' +
      '  · 🌾 Harvest button shows red crop-ready badge\n' +
      '  · Season progress bar in top strip (Day X/28)\n' +
      '  · Morning weather toast after each sleep\n' +
      '  · Unwatered-crops nudge before sleep (≥3 tiles)\n' +
      '  · 💤 Sleep button glows when energy ≤ 18%');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();