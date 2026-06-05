/* ═══════════════════════════════════════════════════════════════════
   VALLEY FARM — MOBILE PATCH FIX 3  (mpfix3.js)  v1.0
   ───────────────────────────────────────────────────────────────────
   Load order: after script.js · winter.js · mobilepatch.js · mobilepatchfix.js

   What this fixes (MOBILE ONLY — zero PC-side changes)
   ─────────────────────────────────────────────────────
   1. Seed / Deco Toggle
      Tapping 🌱 Seeds again (while picker is already open) now
      CLOSES the picker instead of re-opening it.
      Tapping 🎨 Deco again (while deco tool is active) de-selects
      deco and reverts to the Hoe tool.
      Tapping ⋯ More while the seed picker is visible also closes it.

   2. Top-bar Redesign
      The mobile HUD strip above the dock now shows only what the
      user asked for: 📆 Year · 🕐 Clock · ☀️ Weather · 🏘️ Town.
      The 🏙️ City button is hidden by default and appears only once
      the player's Farming skill reaches Lv 5 (mirrors the desktop
      requirement described in the game design).

   3. Winter Hub swap
      During Winter the rain-forecast slot is replaced by an ❄️ Hub
      button that opens the Winter Hub directly — rain chance is
      always 0 % in Winter anyway so it was useless information.
═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const isMobile = () => window.innerWidth <= 680;

  /* ─────────────────────────────────────────────────────────────────
     SECTION 0 — CSS  (mobile-only via @media)
  ───────────────────────────────────────────────────────────────── */
  const CSS = `
/* ══ HUD strip layout override ═════════════════════════════════════ */
@media (max-width: 680px) {
  /* Strip sits just above the dock primary row */
  body.in-game #mob-hud-strip {
    display: flex !important;
    align-items: center;
    gap: 4px;
    padding: 3px 7px;
    /* height is naturally set by content */
    overflow: hidden;
  }
}

/* ── Pill text (year / clock / weather) ─────────────────────────── */
.mhs3-pill {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 10px;
  font-weight: 700;
  color: var(--text-muted);
  white-space: nowrap;
  flex-shrink: 0;
  font-family: 'Nunito', sans-serif;
}

/* ── Action buttons (Town / City / Winter Hub) ───────────────────── */
.mhs3-btn {
  flex-shrink: 0;
  padding: 4px 7px;
  border: 1.5px solid var(--ui-border);
  border-radius: 9px;
  background: var(--ui-bg2);
  font-size: 10px;
  font-weight: 800;
  color: var(--text-primary);
  font-family: 'Nunito', sans-serif;
  cursor: pointer;
  white-space: nowrap;
  -webkit-tap-highlight-color: transparent;
  transition: background .12s, transform .1s;
  line-height: 1.3;
}
.mhs3-btn:active { transform: scale(.93); background: var(--ui-bg); }

/* Town button — always visible */
#mhs3-town {
  background: linear-gradient(135deg,#16a34a,#15803d);
  border-color: #15803d;
  color: #fff;
}
body.dark #mhs3-town {
  background: linear-gradient(135deg,#15803d,#166534);
  border-color: #166534;
}
body.season-fall  #mhs3-town { background: linear-gradient(135deg,#c2410c,#9a3412); border-color:#9a3412; }
body.season-winter #mhs3-town { background: linear-gradient(135deg,#0369a1,#075985); border-color:#075985; }
body.season-summer #mhs3-town { background: linear-gradient(135deg,#d97706,#b45309); border-color:#b45309; }

/* City button — hidden until Farming Lv 5 */
#mhs3-city {
  display: none;
  background: linear-gradient(135deg,#7c3aed,#6d28d9);
  border-color:#6d28d9;
  color:#fff;
}
body.farming-lv5 #mhs3-city { display: inline-flex; }

/* Winter Hub button — shown only during Winter; hides weather pill */
#mhs3-winter-hub {
  display: none;
  background: linear-gradient(135deg,#0369a1,#075985);
  border-color:#075985;
  color:#fff;
}
body.season-winter #mhs3-winter-hub { display: inline-flex; }
body.season-winter #mhs3-weather    { display: none !important; }

/* Spacer pushes Town/City/Hub to the right */
.mhs3-spacer { flex: 1; min-width: 0; }

/* ── Retro overrides ─────────────────────────────────────────────── */
body.retro .mhs3-pill {
  font-family: 'Press Start 2P', monospace !important;
  font-size: 5px !important;
  color: #a1887f !important;
}
body.retro .mhs3-btn {
  background: #1c1209 !important;
  border: 1px solid #3e2723 !important;
  color: #f5deb3 !important;
  font-family: 'Press Start 2P', monospace !important;
  font-size: 5px !important;
  border-radius: 2px !important;
  padding: 4px 5px !important;
}
body.retro #mhs3-town,
body.retro #mhs3-city,
body.retro #mhs3-winter-hub {
  color: #ffd700 !important;
  border-color: #8b6914 !important;
}
`;

  const styleEl = document.createElement('style');
  styleEl.id = 'vf-mpfix3-css';
  styleEl.textContent = CSS;
  document.head.appendChild(styleEl);

  /* ─────────────────────────────────────────────────────────────────
     SECTION 1 — SEED PICKER TOGGLE
     Tapping 🌱 Seeds while picker is already open → close it.
     Tapping ⋯ More while picker open → close picker.
  ───────────────────────────────────────────────────────────────── */
  function _closeSeedPicker () {
    const picker = document.getElementById('dock-seed-picker');
    if (!picker) return;
    picker.classList.remove('picker-open');
    setTimeout(() => {
      if (!picker.classList.contains('picker-open')) picker.style.display = 'none';
    }, 320);
  }

  function _patchSeedToggle () {
    const btn = document.getElementById('dock-seed');
    if (!btn) { setTimeout(_patchSeedToggle, 150); return; }

    /* Clone removes all existing addEventListener listeners so we
       can install our own without a double-fire.                  */
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    newBtn.addEventListener('click', () => {
      if (!isMobile()) {
        if (typeof setTool === 'function') setTool('seed');
        return;
      }
      const picker = document.getElementById('dock-seed-picker');
      const pickerOpen = picker && picker.classList.contains('picker-open');
      const seedActive = typeof G !== 'undefined' && G.tool === 'seed';

      if (pickerOpen && seedActive) {
        /* Second tap → toggle picker OFF (keep seed as active tool) */
        _closeSeedPicker();
      } else {
        /* First tap → normal setTool flow, which opens the picker  */
        if (typeof setTool === 'function') setTool('seed');
      }
    });

    console.log('[mpfix3] Seed toggle patched.');
  }

  /* Also close seed picker when ⋯ More is tapped */
  function _patchMoreButtonClosesPickerAndDeco () {
    const moreBtn = document.getElementById('dock-more');
    if (!moreBtn) { setTimeout(_patchMoreButtonClosesPickerAndDeco, 150); return; }

    /* Capture phase so we run BEFORE mobilepatch toggleDockSec     */
    moreBtn.addEventListener('click', () => {
      _closeSeedPicker();
    }, true /* capture */);

    console.log('[mpfix3] More button now closes seed picker.');
  }

  /* ─────────────────────────────────────────────────────────────────
     SECTION 2 — DECO TOGGLE
     Tapping 🎨 Deco while deco is already the active tool reverts
     to Hoe and closes the secondary drawer.
  ───────────────────────────────────────────────────────────────── */
  function _patchDecoToggle () {
    const btn = document.getElementById('dock-sec-deco');
    if (!btn) { setTimeout(_patchDecoToggle, 150); return; }

    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    newBtn.addEventListener('click', () => {
      const decoActive = typeof G !== 'undefined' && G.tool === 'deco';
      if (decoActive) {
        /* De-select: revert to hoe */
        if (typeof setTool === 'function') setTool('hoe');
        /* Close secondary drawer */
        const moreBtn = document.getElementById('dock-more');
        if (moreBtn && moreBtn.classList.contains('active')) moreBtn.click();
      } else {
        if (typeof setTool === 'function') setTool('deco');
      }
    });

    console.log('[mpfix3] Deco toggle patched.');
  }

  /* ─────────────────────────────────────────────────────────────────
     SECTION 3 — REBUILD MOBILE HUD STRIP
     New layout: [📆 Yr.X]  [🕐 HH:MM]  [☀️ Weather]  ·spacer·
                 [🏘️ Town]  [🏙️ City¹]  [❄️ Hub²]
                 ¹ only when Farming ≥ Lv 5
                 ² only during Winter (replaces weather pill)
  ───────────────────────────────────────────────────────────────── */
  function _rebuildHudStrip () {
    const strip = document.getElementById('mob-hud-strip');
    if (!strip) { setTimeout(_rebuildHudStrip, 200); return; }

    /* Replace whatever mobilepatchfix injected */
    strip.innerHTML = `
      <span class="mhs3-pill" id="mhs3-year">📆 Yr.1</span>
      <span class="mhs3-pill" id="mhs3-clock">☀️ 6:00 AM</span>
      <span class="mhs3-pill" id="mhs3-weather">☀️ Sunny</span>
      <span class="mhs3-spacer"></span>
      <button class="mhs3-btn" id="mhs3-winter-hub">❄️ Hub</button>
      <button class="mhs3-btn" id="mhs3-town">🏘️ Town</button>
      <button class="mhs3-btn" id="mhs3-city">🏙️ City</button>
    `;

    /* Town button */
    document.getElementById('mhs3-town').addEventListener('click', () => {
      if (typeof openTownScreen === 'function') openTownScreen();
    });

    /* City button */
    document.getElementById('mhs3-city').addEventListener('click', () => {
      if      (typeof _travelAnimThenCity === 'function') _travelAnimThenCity();
      else if (typeof openCityScreen      === 'function') openCityScreen();
    });

    /* Winter Hub button — tries several entry points winter.js may expose */
    document.getElementById('mhs3-winter-hub').addEventListener('click', () => {
      /* Option A: direct function */
      if (typeof openWinterHub === 'function') { openWinterHub(); return; }
      /* Option B: click the HUD button winter.js injects */
      const injBtn = document.getElementById('hud-winter-hub-btn')
                  || document.querySelector('[onclick*="openWinterHub"]')
                  || document.querySelector('[onclick*="winterHub"]');
      if (injBtn) { injBtn.click(); return; }
      /* Option C: click the first ❄️-labelled element in the HUD */
      const hudEl = document.querySelector('#hud [data-winter-hub], #hud .winter-hub-btn');
      if (hudEl) hudEl.click();
    });

    console.log('[mpfix3] HUD strip rebuilt.');
    /* Immediately populate with current game state */
    _refreshHudStrip3();
  }

  /* ── Values refresh ─────────────────────────────────────────────── */
  function _refreshHudStrip3 () {
    if (!isMobile()) return;
    if (typeof G === 'undefined') return;

    /* Year */
    const yearEl = document.getElementById('mhs3-year');
    if (yearEl) {
      const yr = (G.year !== undefined) ? G.year : 1;
      yearEl.textContent = '📆 Yr.' + yr;
    }

    /* Clock — mirror the live DOM values renderHUD already populated */
    const clockEl = document.getElementById('mhs3-clock');
    if (clockEl) {
      const dnIcon  = document.getElementById('dn-icon');
      const hudTime = document.getElementById('hud-time');
      const icon    = (dnIcon  ? dnIcon.textContent  : '☀️').trim();
      const time    = (hudTime ? hudTime.textContent : '6:00 AM').trim();
      clockEl.textContent = icon + ' ' + time;
    }

    /* Today's weather */
    const wxEl = document.getElementById('mhs3-weather');
    if (wxEl) {
      const wEm  = document.getElementById('weather-em');
      const wTxt = document.getElementById('hud-weather');
      const em   = (wEm  ? wEm.textContent  : '☀️').trim();
      const txt  = (wTxt ? wTxt.textContent : 'Sunny').trim();
      wxEl.textContent = em + ' ' + txt;
    }

    /* City visibility — Farming Lv 5+ */
    if (G.skills && typeof getLevel === 'function') {
      const farmXP = (G.skills.farming && G.skills.farming.xp) || 0;
      const lv     = getLevel(farmXP);
      document.body.classList.toggle('farming-lv5', lv >= 5);
    } else if (G.skills && G.skills.farming) {
      /* Fallback if getLevel isn't global: approximate via XP thresholds
         (mirrors the XP_LEVELS table common in this codebase)            */
      const farmXP = G.skills.farming.xp || 0;
      /* XP for Lv 5 in a typical 0,50,150,300,500,750,… table is 500  */
      document.body.classList.toggle('farming-lv5', farmXP >= 500);
    }

    /* Season body class — drives Town button colour + Winter Hub visibility */
    if (typeof season === 'function') {
      const s = season();
      ['season-spring','season-summer','season-fall','season-winter']
        .forEach(c => document.body.classList.remove(c));
      const map = { Spring:'season-spring', Summer:'season-summer',
                    Fall:'season-fall',     Winter:'season-winter' };
      if (map[s]) document.body.classList.add(map[s]);
    }
  }

  /* ─────────────────────────────────────────────────────────────────
     SECTION 4 — HOOK renderHUD
     Chain on top of whatever mobilepatchfix already chained.
  ───────────────────────────────────────────────────────────────── */
  function _hookRenderHUD () {
    if (typeof window.renderHUD !== 'function') {
      setTimeout(_hookRenderHUD, 100);
      return;
    }
    const _prev = window.renderHUD;
    window.renderHUD = function () {
      _prev.apply(this, arguments);
      _refreshHudStrip3();
    };
    console.log('[mpfix3] renderHUD hooked for strip refresh.');
  }

  /* ─────────────────────────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────────────────────────── */
  function init () {
    _patchSeedToggle();
    _patchMoreButtonClosesPickerAndDeco();
    _patchDecoToggle();
    _rebuildHudStrip();
    _hookRenderHUD();

    /* If the game screen is already active when this patch loads late */
    const gs = document.getElementById('game-screen');
    if (gs && gs.classList.contains('active')) {
      document.body.classList.add('in-game');
      setTimeout(_refreshHudStrip3, 400);
    }

    console.log('[mpfix3 v1.0] ✅ Loaded!\n' +
      '  · Seeds: tap again to close picker\n' +
      '  · Deco: tap again to de-select\n' +
      '  · More: tap closes seed picker too\n' +
      '  · Top bar: Year · Clock · Weather · Town [· City @ Farming Lv5]\n' +
      '  · Winter: ❄️ Hub replaces rain forecast in the strip');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();