/* ═══════════════════════════════════════════════════════════════════
   VALLEY FARM — MOBILE PATCH FIX  v1.0
   ───────────────────────────────────────────────────────────────────
   Load order: after mobilepatch.js (v3.0.0)

   What this patch fixes / adds
   ────────────────────────────
   1. Dock Visibility   — Mobile dock now hidden on main menu & pause.
                          Only shows during active gameplay via
                          body.in-game class management.

   2. Tutorial Button   — ❓ Help re-added to dock secondary drawer
                          (was removed by mobilepatch hiding #toolbar).
                          Town 🏘️ and City 🏙️ shortcut buttons also
                          added to the secondary drawer.

   3. Auto Tutorial     — Brand-new games automatically open the
                          tutorial (openHelp) 800 ms after launch so
                          first-time players get guided immediately.

   4. Updated Tutorial  — Six new help steps appended (before the
                          final Save step) covering: Mobile Dock,
                          Seed Quick-Pick, Crop Inspector, Daily
                          Quests, Rain Forecast, Town & City.

   5. Mobile HUD Strip  — A compact fixed bar above the dock shows
                          💰 gold, 🏘️ Town, 🏙️ City, and 🌤️ forecast
                          on mobile — elements mobilepatch v3 hid or
                          made inaccessible on small screens.

   6. HUD Scrollable    — Overrides mobilepatch's overflow:hidden on
                          #hud so all pills remain accessible via
                          horizontal scroll (hidden scrollbar).
═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────────
     SECTION 0 — INJECT CSS
  ───────────────────────────────────────────────────────────────── */
  const FIX_CSS = `
/* ══ DOCK: only during gameplay ════════════════════════════════════ */
/* Override mobilepatch v3 which shows dock on ALL screens */
@media (max-width: 680px) {
  #mobile-dock {
    display: none !important;
  }
  body.in-game #mobile-dock {
    display: flex !important;
  }
}

/* ══ HUD: scrollable instead of overflow:hidden ════════════════════ */
@media (max-width: 680px) {
  #hud {
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    -webkit-overflow-scrolling: touch !important;
    scrollbar-width: none !important;     /* Firefox */
    padding: 4px 6px 4px 6px !important;
    gap: 4px !important;
  }
  #hud::-webkit-scrollbar { display: none !important; }

  /* Keep the gold pill prominent */
  #hud .gold-pill {
    font-size: 12px !important;
    font-weight: 900 !important;
    flex-shrink: 0 !important;
    order: -1;
  }

  /* Season pill — keep visible */
  #hud #season-pill { flex-shrink: 0 !important; order: 0; }

  /* Energy pill — keep visible */
  #hud .hud-pill:has(#energy-bar) { flex-shrink: 0 !important; }
}

/* ══ MOBILE HUD STRIP ═══════════════════════════════════════════════
   Fixed bar above the mobile dock: Gold · Town · City · Weather.
   Only shown on mobile during gameplay.
═══════════════════════════════════════════════════════════════════ */
#mob-hud-strip {
  display: none;
}
@media (max-width: 680px) {
  body.in-game #mob-hud-strip {
    display: flex;
    position: fixed;
    bottom: 62px;          /* just above dock-primary (62px) */
    left: 0; right: 0;
    z-index: 179;
    background: var(--ui-bg);
    border-top: 1px solid var(--ui-border);
    border-bottom: 1px solid var(--ui-border);
    padding: 4px 6px;
    gap: 5px;
    align-items: center;
    box-shadow: 0 -2px 10px rgba(0,0,0,.08);
  }

  /* Adjust farm wrap to clear both dock and strip */
  #farm-wrap {
    padding-bottom: 108px !important; /* 62 dock + 33 strip + 13 slack */
  }

  /* When secondary drawer is open the strip needs to slide up with it */
  .dock-secondary.dock-sec-open ~ * #mob-hud-strip,
  body.dock-sec-open #mob-hud-strip {
    bottom: 120px;
  }
}
@media (max-width: 400px) {
  #farm-wrap { padding-bottom: 102px !important; }
}

/* Strip child styles */
#mob-hud-strip .mhs-gold {
  font-size: 13px;
  font-weight: 900;
  color: var(--gold);
  white-space: nowrap;
  flex-shrink: 0;
  padding: 0 2px;
}
#mob-hud-strip .mhs-btn {
  flex: 1;
  min-width: 0;
  padding: 5px 2px;
  border: 1.5px solid var(--ui-border);
  border-radius: 9px;
  background: var(--ui-bg2);
  font-size: 10px;
  font-weight: 800;
  color: var(--text-primary);
  font-family: 'Nunito', sans-serif;
  cursor: pointer;
  text-align: center;
  white-space: nowrap;
  -webkit-tap-highlight-color: transparent;
  transition: all .12s;
}
#mob-hud-strip .mhs-btn:active { transform: scale(.93); background: var(--ui-bg); }
#mob-hud-strip .mhs-forecast {
  font-size: 9px;
  font-weight: 700;
  color: var(--text-muted);
  white-space: nowrap;
  flex-shrink: 0;
  padding: 0 2px;
}

/* ══ RETRO OVERRIDES ════════════════════════════════════════════════ */
body.retro #mob-hud-strip {
  background: #120c00;
  border-color: #8b6914;
}
body.retro #mob-hud-strip .mhs-gold {
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  color: #ffd700;
}
body.retro #mob-hud-strip .mhs-btn {
  background: #1c1209;
  border: 1px solid #3e2723;
  color: #f5deb3;
  font-family: 'Press Start 2P', monospace;
  font-size: 5px;
  border-radius: 2px;
}
body.retro #mob-hud-strip .mhs-forecast {
  font-family: 'Press Start 2P', monospace;
  font-size: 5px;
  color: #a1887f;
}
`;

  const styleEl = document.createElement('style');
  styleEl.id = 'vf-mpfix-css';
  styleEl.textContent = FIX_CSS;
  document.head.appendChild(styleEl);

  /* ─────────────────────────────────────────────────────────────────
     SECTION 1 — DOCK VISIBILITY: body.in-game management
  ───────────────────────────────────────────────────────────────── */

  /* Wrap launchGame: add in-game class + handle new-game tutorial */
  const _origLaunchGame = window.launchGame;
  window.launchGame = function () {
    /* Capture new-game flag synchronously BEFORE original runs */
    const isNewGame = !!window._vf_isNewGame;

    _origLaunchGame.apply(this, arguments);

    /* Activate gameplay mode */
    document.body.classList.add('in-game');

    setTimeout(() => {
      _buildHudStrip();
      _refreshHudStrip();

      /* Auto-open tutorial for brand new games */
      if (isNewGame && typeof openHelp === 'function') {
        openHelp();
      }
    }, 350);
  };

  /* Wrap doLogout: remove in-game class */
  const _origDoLogout = window.doLogout;
  window.doLogout = function () {
    _origDoLogout.apply(this, arguments);
    document.body.classList.remove('in-game');
  };

  /* ─────────────────────────────────────────────────────────────────
     SECTION 2 — NEW GAME DETECTION
     Wrap createFarm to set a synchronous flag that launchGame reads.
  ───────────────────────────────────────────────────────────────── */
  /* Poll for createFarm in case this patch loads before script.js */
  function _hookCreateFarm () {
    if (typeof window.createFarm !== 'function') {
      setTimeout(_hookCreateFarm, 80);
      return;
    }
    const _origCreateFarm = window.createFarm;
    window.createFarm = function () {
      window._vf_isNewGame = true;
      _origCreateFarm.apply(this, arguments);
      /* Clear after launchGame (which runs synchronously inside)
         has had a chance to capture it; use microtask delay.    */
      Promise.resolve().then(() => { window._vf_isNewGame = false; });
    };
    console.log('[MobilePatchFix] createFarm hooked for new-game detection.');
  }
  _hookCreateFarm();

  /* ─────────────────────────────────────────────────────────────────
     SECTION 3 — SECONDARY DOCK: add Help / Town / City buttons
  ───────────────────────────────────────────────────────────────── */
  function _addSecondaryDockButtons () {
    const sec = document.getElementById('dock-secondary');
    if (!sec) {
      /* Dock not yet in DOM — retry */
      setTimeout(_addSecondaryDockButtons, 150);
      return;
    }
    if (document.getElementById('dock-sec-help')) return; // already done

    /* Helper to create a secondary dock button */
    function mkSecBtn (id, label, handler) {
      const btn = document.createElement('button');
      btn.className = 'dock-sec-btn';
      btn.id = id;
      btn.textContent = label;
      btn.addEventListener('click', () => {
        /* Close secondary drawer first */
        const moreBtn = document.getElementById('dock-more');
        if (moreBtn && moreBtn.classList.contains('active')) {
          moreBtn.click();
        }
        handler();
      });
      return btn;
    }

    /* Town button */
    sec.appendChild(mkSecBtn('dock-sec-town', '🏘️ Town', () => {
      if (typeof openTownScreen === 'function') openTownScreen();
    }));

    /* City button */
    sec.appendChild(mkSecBtn('dock-sec-city', '🏙️ City', () => {
      if (typeof _travelAnimThenCity === 'function') _travelAnimThenCity();
    }));

    /* Help / Tutorial button */
    sec.appendChild(mkSecBtn('dock-sec-help', '❓ Help', () => {
      if (typeof openHelp === 'function') openHelp();
    }));

    console.log('[MobilePatchFix] Secondary dock: Town, City, Help buttons added.');
  }
  _addSecondaryDockButtons();

  /* ─────────────────────────────────────────────────────────────────
     SECTION 4 — MOBILE HUD STRIP
     Fixed bar above the dock showing Gold · Town · City · Forecast.
  ───────────────────────────────────────────────────────────────── */
  const RAIN_CHANCE = { Spring: 28, Summer: 22, Fall: 10, Winter: 0 };

  function _buildHudStrip () {
    if (document.getElementById('mob-hud-strip')) return;
    const strip = document.createElement('div');
    strip.id = 'mob-hud-strip';
    strip.innerHTML = `
      <span class="mhs-gold" id="mhs-gold">💰 0g</span>
      <button class="mhs-btn" id="mhs-town"
        onclick="if(typeof openTownScreen==='function')openTownScreen()">🏘️ Town</button>
      <button class="mhs-btn" id="mhs-city"
        onclick="if(typeof _travelAnimThenCity==='function')_travelAnimThenCity()">🏙️ City</button>
      <span class="mhs-forecast" id="mhs-forecast">🌤️ --</span>`;
    document.body.appendChild(strip);
  }

  function _refreshHudStrip () {
    const goldEl = document.getElementById('mhs-gold');
    if (goldEl && typeof G !== 'undefined' && G.gold !== undefined) {
      goldEl.textContent = '💰 ' + G.gold + 'g';
    }
    const fcEl = document.getElementById('mhs-forecast');
    if (fcEl && typeof season === 'function') {
      const pct = RAIN_CHANCE[season()] ?? 0;
      fcEl.textContent = pct === 0
        ? '☀️ No rain'
        : (pct >= 25 ? '🌧️ ' : '🌤️ ') + pct + '% rain';
    }
  }

  /* Sync strip values whenever HUD re-renders */
  const _origRenderHUD = window.renderHUD;
  window.renderHUD = function () {
    _origRenderHUD.apply(this, arguments);
    _refreshHudStrip();
  };

  /* ─────────────────────────────────────────────────────────────────
     SECTION 5 — UPDATED TUTORIAL CONTENT
     Appends mobile-aware steps to HELP_STEPS before the final step.
  ───────────────────────────────────────────────────────────────── */
  const NEW_HELP_STEPS = [
    {
      e: '📱',
      title: 'Mobile Toolbar',
      body: 'On mobile your tools live in the bottom dock. Primary row: Hoe · Water · Seeds · Harvest · Sleep. Tap "⋯ More" to reveal Shovel, Deco, Bag, Map, Pause, Town, City and Help.',
      tip: 'Tip: Long-press the Harvest (🌾) button for 0.5 s to scythe all ready crops instantly!'
    },
    {
      e: '🌱',
      title: 'Seed Quick-Pick',
      body: 'Tapping Seeds in the dock opens a grid picker instead of a tiny dropdown. Each seed shows your current quantity. Tap a seed to select it — tap elsewhere or the farm grid to close.',
      tip: 'Tip: Seeds with zero stock appear faded and can\'t be selected — buy more from the Shop tab!'
    },
    {
      e: '🔍',
      title: 'Crop Inspector',
      body: 'Double-tap any planted tile to see a stat card: growth stage, days remaining, watered status, sell price with barn bonus, harvest XP bonus, and valid seasons.',
      tip: 'Tip: The inspector auto-dismisses after 5 seconds, or tap the ✕ button to close it early.'
    },
    {
      e: '📋',
      title: 'Daily Quests',
      body: 'Three randomised quests refresh each morning. Open your Bag tab to see progress. Completing them awards bonus gold and XP. Tasks include tilling, watering, planting, harvesting, and shipping.',
      tip: 'Tip: Quests reset at sunrise — check the Bag tab each morning for a fresh set!'
    },
    {
      e: '📊',
      title: 'Rain Forecast',
      body: 'A rain chance indicator sits in the HUD strip above the dock. Spring: 28%, Summer: 22%, Fall: 10%, Winter: 0%. A rainy night auto-waters all tilled soil — great for saving energy!',
      tip: 'Tip: If rain is likely tonight, skip manual watering and use that energy on tilling more tiles.'
    },
    {
      e: '🏘️',
      title: 'Town & City',
      body: 'Tap 🏘️ Town in the strip or dock to attend seasonal events and local trade. Tap 🏙️ City to reach the Stock Exchange — buy shares in NPC companies or IPO your own farm!',
      tip: 'Tip: City share prices update every season. Farm a lot in Fall to boost your company\'s value!'
    },
  ];

  function _patchHelpSteps () {
    /* HELP_STEPS is a const array in script.js — mutable via splice */
    if (typeof HELP_STEPS === 'undefined' || !Array.isArray(HELP_STEPS)) {
      setTimeout(_patchHelpSteps, 200);
      return;
    }
    /* Guard: don't inject twice */
    if (HELP_STEPS.some(s => s.title === 'Mobile Toolbar')) return;

    /* Insert before the last step ("Save & Export") */
    const insertAt = Math.max(0, HELP_STEPS.length - 1);
    HELP_STEPS.splice(insertAt, 0, ...NEW_HELP_STEPS);
    console.log('[MobilePatchFix] Tutorial updated: +' + NEW_HELP_STEPS.length + ' steps (total: ' + HELP_STEPS.length + ')');
  }

  /* ─────────────────────────────────────────────────────────────────
     SECTION 6 — DOCK SECONDARY SLIDE-UP: sync body class
     Used by CSS to lift the HUD strip when secondary drawer opens.
  ───────────────────────────────────────────────────────────────── */
  function _watchSecondaryDrawer () {
    const sec = document.getElementById('dock-secondary');
    if (!sec) { setTimeout(_watchSecondaryDrawer, 200); return; }

    const obs = new MutationObserver(() => {
      document.body.classList.toggle(
        'dock-sec-open',
        sec.classList.contains('dock-sec-open')
      );
    });
    obs.observe(sec, { attributes: true, attributeFilter: ['class'] });
  }
  _watchSecondaryDrawer();

  /* ─────────────────────────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────────────────────────── */
  function init () {
    _patchHelpSteps();

    /* If game screen is already active (patch loaded late) */
    const gs = document.getElementById('game-screen');
    if (gs && gs.classList.contains('active')) {
      document.body.classList.add('in-game');
      _buildHudStrip();
      _refreshHudStrip();
    }

    console.log('[MobilePatchFix v1.0] ✅ Loaded!\n' +
      '  · Mobile dock: gameplay-only visibility\n' +
      '  · Secondary dock: Town 🏘️, City 🏙️, Help ❓ buttons\n' +
      '  · Auto-tutorial on new game\n' +
      '  · Tutorial expanded with 6 new mobile steps\n' +
      '  · Mobile HUD strip: Gold · Town · City · Forecast\n' +
      '  · HUD horizontally scrollable (no overflow cut-off)');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();