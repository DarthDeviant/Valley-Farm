/* ═══════════════════════════════════════════════════════════════════════
   VALLEY FARM — PATCH v3c  (patch_v3c.js)
   ─────────────────────────────────────────────────────────────────────
   Load order: after patch_v3b.js

   Changes
   ───────
   1. SEAMLESS GRASS RESTORED  — Re-enables the bigupdate_1_grass.js look:
                                 gap:0, no tile borders, gv* micro-tints.
                                 Overrides patch_v3b's tile-grid restoration
                                 CSS with higher-priority !important rules.

   2. JOBS BOARD — SHOP CLEAN  — Completely removes the Jobs section from
                                 the Shop tab.  Only appears in City now.

   3. CITY JOBS TAB — ONE ONLY — Removes any duplicate Jobs tab buttons
                                 (from patch_v3 / patch_v3b) and inserts
                                 exactly one clean "💼 Jobs" tab.

   4. DAILY QUESTS REORDERED   — Quest section moved above ⭐ Skills and
                                 just below the Harvested / Pending section.

   5. NEW 10-STEP TUTORIAL     — Replaces the old help steps with a full
                                 10-step guide covering every feature:
                                 hoe picker, size picker, upgrades, fert,
                                 swipe-up bag, city, jobs, seasonal market.
═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ────────────────────────────────────────────────────────────────────
     SECTION 0  CSS — re-assert seamless grass OVER patch_v3b's grid CSS
  ──────────────────────────────────────────────────────────────────── */
  var style = document.createElement('style');
  style.id = 'vf-patchv3c-css';
  style.textContent = `
/* ══ RESTORE SEAMLESS GRASS (overrides patch_v3b's tile-grid CSS) ═══ */
#farm-grid {
  gap: 0 !important;
  border-radius: 12px !important;
  overflow: hidden !important;
}
#farm-wrap {
  border-radius: 14px !important;
  overflow: hidden !important;
  box-shadow: 0 6px 28px rgba(0,0,0,.22) !important;
}
.tile, .tile-tree {
  border: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}
.tile:hover {
  filter: brightness(1.22) !important;
  transform: none !important;
  z-index: 5 !important;
  box-shadow: inset 0 0 0 2px rgba(255,255,255,.55) !important;
}
/* Micro-variation tints (need !important to beat patch_v3b's "filter:none !important") */
.gv0 { filter: brightness(1.00) saturate(1.00) !important; }
.gv1 { filter: brightness(0.94) saturate(0.93) !important; }
.gv2 { filter: brightness(1.06) saturate(1.06) !important; }
.gv3 { filter: brightness(0.90) saturate(0.88) !important; }
.gv4 { filter: brightness(1.10) saturate(1.10) !important; }
.gv0:hover,.gv1:hover,.gv2:hover,.gv3:hover,.gv4:hover {
  filter: brightness(1.22) !important;
}
/* Tilled soil */
.tile[data-tilled="1"] {
  box-shadow: inset 0 3px 7px rgba(0,0,0,.30),
              inset 0 0 0 1px rgba(0,0,0,.18) !important;
  border-radius: 2px !important;
}
.tile[data-tilled="1"][data-watered="1"] {
  box-shadow: inset 0 3px 9px rgba(0,0,0,.42),
              inset 0 0 0 1px rgba(30,10,0,.28) !important;
}
.tile[data-deco="1"] {
  border-radius: 4px !important;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,.10) !important;
}
/* Harvest-ready — grass-style pulse */
.tile-ready {
  animation: grassReadyPulse 1.6s ease-in-out infinite !important;
}
@keyframes grassReadyPulse {
  0%,100% { filter: brightness(1.0) !important; }
  50%     { filter: brightness(1.20) drop-shadow(0 0 6px rgba(251,191,36,.55)) !important; }
}
/* Grass deco sprite */
.grass-deco {
  opacity: .38 !important;
  font-size: 15px !important;
  filter: saturate(.65) !important;
}
/* Hoe pending preview still works in seamless mode */
.hoe-pending-tile {
  outline: 3px solid rgba(255,255,255,.88) !important;
  outline-offset: -1px !important;
  background-color: rgba(255,255,255,.28) !important;
  filter: brightness(1.22) !important;
  z-index: 6 !important;
}
/* Mobile — keep tiles filling width without borders */
@media (max-width: 680px) {
  #farm-grid { gap: 0 !important; border-radius: 8px !important; }
  .tile, .tile-tree { border: none !important; border-radius: 0 !important; }
}
`;
  document.head.appendChild(style);

  /* ────────────────────────────────────────────────────────────────────
     SECTION 1  RE-ADD GV* MICRO-VARIATION CLASSES AFTER EVERY RENDER
     patch_v3b strips them; we wrap renderFarm again (outermost = last
     to call _prev, first to run post-processing) to put them back.
  ──────────────────────────────────────────────────────────────────── */
  function _addGvClasses() {
    var grid = document.getElementById('farm-grid');
    if (!grid || typeof G === 'undefined' || !G.farm) return;
    var GW_v = typeof GW !== 'undefined' ? GW : 14;
    var GH_v = typeof GH !== 'undefined' ? GH : 10;
    var landTrees = [];
    if (typeof LAND_TREES !== 'undefined' && G.currentLand)
      landTrees = LAND_TREES[G.currentLand] || LAND_TREES.home || [];
    var treeKeys = new Set(landTrees.map(function (t) { return t[0]*100+t[1]; }));
    var idx = 0;
    for (var r = 0; r < GH_v; r++) {
      for (var c = 0; c < GW_v; c++) {
        var el = grid.children[idx++];
        if (!el) continue;
        var tkey = r*100+c;
        if (treeKeys.has(tkey)) continue;
        var tile = G.farm[r] && G.farm[r][c];
        if (!tile || tile.tilled || tile.deco) continue;
        /* Remove any existing gv class first, then add fresh */
        el.classList.remove('gv0','gv1','gv2','gv3','gv4');
        var v = (r*7 + c*13 + r*c*3) % 5;
        el.classList.add('gv'+v);
      }
    }
  }

  function _hookRenderFarmGv() {
    if (typeof window.renderFarm !== 'function') { setTimeout(_hookRenderFarmGv, 150); return; }
    var _prev = window.renderFarm;
    window.renderFarm = function () {
      _prev.apply(this, arguments);
      _addGvClasses(); /* runs after patch_v3b has already stripped — puts them back */
    };
    console.log('[PatchV3c] renderFarm hooked to restore gv* classes.');
  }
  _hookRenderFarmGv();

  /* ────────────────────────────────────────────────────────────────────
     SECTION 2  REMOVE JOBS FROM SHOP — robust strip wrapped around
     every existing buildShop wrapper so it always fires last.
  ──────────────────────────────────────────────────────────────────── */
  function _hookBuildShopStripJobs() {
    if (typeof window.buildShop !== 'function') { setTimeout(_hookBuildShopStripJobs, 200); return; }
    var _prev = window.buildShop;
    window.buildShop = function () {
      var html = _prev.apply(this, arguments);
      /* Strip everything from the jobs section header onwards */
      var marker = html.indexOf('💼 Jobs Board');
      if (marker !== -1) {
        /* Walk backwards to the opening <div of the s-sec */
        var cut = html.lastIndexOf('<div', marker);
        if (cut !== -1) html = html.substring(0, cut);
        else             html = html.substring(0, marker);
      }
      return html;
    };
    console.log('[PatchV3c] buildShop wrapped — Jobs Board stripped from Shop tab.');
  }
  /* Run immediately AND after a short delay to beat any late-registering wrappers */
  _hookBuildShopStripJobs();
  setTimeout(_hookBuildShopStripJobs, 600);

  /* ────────────────────────────────────────────────────────────────────
     SECTION 3  CITY JOBS TAB — exactly one, no duplicates
  ──────────────────────────────────────────────────────────────────── */
  function _fixCityJobsTab() {
    var tabs = document.querySelector('#city-screen .city-tabs');
    if (!tabs) { setTimeout(_fixCityJobsTab, 300); return; }

    /* Remove ALL existing jobs tab buttons */
    tabs.querySelectorAll('[data-ctab="jobs"]').forEach(function (b) { b.remove(); });

    /* Insert one clean button */
    var btn = document.createElement('button');
    btn.className    = 'city-tab-btn';
    btn.id           = 'city-tab-jobs-v3c';
    btn.dataset.ctab = 'jobs';
    btn.textContent  = '💼 Jobs';
    btn.addEventListener('click', function () {
      if (typeof setCityTab === 'function') setCityTab('jobs');
    });
    tabs.appendChild(btn);
    console.log('[PatchV3c] Single Jobs tab injected into city screen.');
  }

  /* Run once DOM is ready and again whenever the city screen opens */
  setTimeout(_fixCityJobsTab, 400);
  function _observeCityForJobsTab() {
    var cs = document.getElementById('city-screen');
    if (!cs) { setTimeout(_observeCityForJobsTab, 300); return; }
    new MutationObserver(function () {
      if (cs.classList.contains('city-open')) {
        /* Remove duplicates, keep only our single tab */
        var t = document.querySelector('#city-screen .city-tabs');
        if (!t) return;
        var existing = t.querySelectorAll('[data-ctab="jobs"]');
        if (existing.length !== 1 || !document.getElementById('city-tab-jobs-v3c')) {
          existing.forEach(function (b) { b.remove(); });
          var nb = document.createElement('button');
          nb.className    = 'city-tab-btn';
          nb.id           = 'city-tab-jobs-v3c';
          nb.dataset.ctab = 'jobs';
          nb.textContent  = '💼 Jobs';
          nb.addEventListener('click', function () {
            if (typeof setCityTab === 'function') setCityTab('jobs');
          });
          t.appendChild(nb);
        }
      }
    }).observe(cs, { attributes: true, attributeFilter: ['class'] });
  }
  _observeCityForJobsTab();

  /* ────────────────────────────────────────────────────────────────────
     SECTION 4  DAILY QUESTS — move above ⭐ Skills in the bag tab
     We wrap buildInv and reorder the HTML string.
  ──────────────────────────────────────────────────────────────────── */
  function _hookBuildInvReorderQuests() {
    if (typeof window.buildInv !== 'function') { setTimeout(_hookBuildInvReorderQuests, 200); return; }
    var _prev = window.buildInv;
    window.buildInv = function () {
      var html = _prev.apply(this, arguments);

      /* Find quest section */
      var QUEST_MARKER = '<div class="s-sec">📋 Daily Quests</div>';
      var qIdx = html.indexOf(QUEST_MARKER);
      if (qIdx === -1) return html; /* quests not rendered yet — skip */

      /* Find skills section (comes before quests in original) */
      var SKILLS_MARKER = '<div class="s-sec">⭐ Skills</div>';
      var sIdx = html.indexOf(SKILLS_MARKER);
      if (sIdx === -1 || sIdx >= qIdx) return html; /* order already correct or not found */

      /* Extract quest block from the end */
      var questBlock = html.substring(qIdx);
      var beforeQuests = html.substring(0, qIdx);

      /* Insert quest block just before skills section */
      var sIdxInBefore = beforeQuests.indexOf(SKILLS_MARKER);
      if (sIdxInBefore === -1) return html; /* safety */

      html = beforeQuests.substring(0, sIdxInBefore)
           + questBlock
           + beforeQuests.substring(sIdxInBefore);

      return html;
    };
    console.log('[PatchV3c] buildInv wrapped — Daily Quests moved above Skills.');
  }
  _hookBuildInvReorderQuests();

  /* ────────────────────────────────────────────────────────────────────
     SECTION 5  NEW 10-STEP TUTORIAL
     We override openHelp, helpNav, and renderHelpStep so the new steps
     are used without touching script.js's const HELP_STEPS array.
  ──────────────────────────────────────────────────────────────────── */
  var MY_STEPS = [
    {
      e: '🌾',
      title: 'Welcome to Valley Farm!',
      body: 'Grow crops, earn gold, and build your farming empire across four seasons. Each year has 4 seasons of 28 days each. The game auto-saves every 30 seconds, so your progress is always safe.',
      tip: 'Tip: Come back any day — your crops grow overnight while you sleep!'
    },
    {
      e: '⛏',
      title: 'Tilling with the Hoe',
      body: 'Tap the ⛏ Hoe button to open the Hoe Size Picker. Choose 1×1, 2×2, 3×3 or 4×4. Tap a soil tile to see a glowing white preview of the area. Tap the preview again to confirm and till the land.',
      tip: 'Shortcut: Press H on keyboard. 2×2 is always available — no upgrade needed!'
    },
    {
      e: '⚒',
      title: 'Hoe Upgrades',
      body: 'Open the Bag panel → Upgrades tab. Buy "Hoe Upgrade" (1,200g) to unlock 3×3 tilling. Buy "Iron Head" (2,500g) after that to unlock 4×4. Each swing clears up to 16 tiles at once!',
      tip: 'Tip: Upgrades are per-land — buy them separately for each farm you own.'
    },
    {
      e: '🛒',
      title: 'Buying Seeds',
      body: 'Open the Bag panel and switch to the Shop tab. Seeds are season-specific — you can only buy what grows in the current season. Prices rise a little each year, so stock up early!',
      tip: 'Mobile tip: Swipe UP on the farm, or tap 🎒 Bag in the toolbar, to open the panel.'
    },
    {
      e: '🌱',
      title: 'Planting Seeds',
      body: 'Select the 🌱 Seeds tool. On mobile a seed picker opens automatically — choose a seed type. Then tap any tilled soil tile to plant. Each tap uses one seed from your inventory.',
      tip: 'Shortcut: Press S on keyboard. You can only plant on tilled, unplanted soil!'
    },
    {
      e: '💧',
      title: 'Watering Your Crops',
      body: 'Select the 💧 Water tool and tap planted tiles. Crops ONLY grow on days they are watered — miss a day and that day\'s growth is skipped. Buy a Sprinkler upgrade to auto-water each morning!',
      tip: 'Shortcut: Press W. Rainy days auto-water everything for free.'
    },
    {
      e: '🌿',
      title: 'Using Fertilizer',
      body: 'Buy fertilizers from the Shop tab (Basic, Rich Compost, Speed Grow, Mega). Then tap ⛏ Hoe to open the size picker and hit 🌿 Fert to switch to the Fert tool. Apply to tilled soil before planting for big bonuses!',
      tip: 'Tip: Mega Fertilizer gives +35% bonus yield. Speed Grow advances crops 2× per watered day.'
    },
    {
      e: '✨',
      title: 'Harvesting Crops',
      body: 'When a crop glows ✨ it\'s ready! Use the 🌾 Scythe tool and tap it to harvest into your bag. On mobile, long-press the 🌾 Harvest dock button for instant Harvest All. Ship from the Bag tab — gold arrives next morning.',
      tip: 'Shortcut: Press R for Scythe. Higher Harvesting skill = bonus yield chance!'
    },
    {
      e: '🏙️',
      title: 'The City — Stocks & Jobs',
      body: 'Reach Farming Level 5 to unlock the City (via Map tab). Visit the 📊 Stock Exchange to trade shares in 6 companies and even list your own farm as a business! Visit 💼 Jobs Board to take a job for daily gold and special perks.',
      tip: 'Tip: Companies are HOT 🔥 in their strong seasons — buy before and sell after the peak!'
    },
    {
      e: '🌙',
      title: 'Seasons, Sleep & Winter',
      body: 'Each season lasts 28 days. Press Sleep (or 💤 on mobile) to end the day — crops grow, rent is paid, and job wages arrive. In Winter, planting stops but a live Auction Market opens! Stock up in Fall and sell at peak Winter prices.',
      tip: 'Tip: Buy the Greenhouse upgrade to keep crops alive through Winter. Plan ahead!'
    },
  ];

  var _myHelpStep = 0;

  function _renderMyStep() {
    var step = MY_STEPS[_myHelpStep];
    if (!step) return;
    var emojiEl    = document.getElementById('help-emoji');
    var titleEl    = document.getElementById('help-title');
    var bodyEl     = document.getElementById('help-body');
    var tipEl      = document.getElementById('help-tip');
    var labelEl    = document.getElementById('help-step-label');
    var dotsEl     = document.getElementById('help-dots');
    var prevBtn    = document.getElementById('help-prev');
    var nextBtn    = document.getElementById('help-next');
    if (emojiEl)  emojiEl.textContent  = step.e;
    if (titleEl)  titleEl.textContent  = step.title;
    if (bodyEl)   bodyEl.textContent   = step.body;
    if (tipEl)    tipEl.textContent    = step.tip;
    if (labelEl)  labelEl.textContent  = 'Step ' + (_myHelpStep+1) + ' of ' + MY_STEPS.length;
    if (dotsEl)   dotsEl.innerHTML     = MY_STEPS.map(function(_,i) {
      return '<div class="help-dot' + (i===_myHelpStep?' active':'') + '"></div>';
    }).join('');
    if (prevBtn) prevBtn.style.display = _myHelpStep === 0 ? 'none' : 'block';
    if (nextBtn) {
      var isLast = _myHelpStep === MY_STEPS.length - 1;
      nextBtn.textContent = isLast ? 'Done ✓' : 'Next →';
      nextBtn.onclick = isLast ? _myCloseHelp : function () { _myHelpNav(1); };
    }
  }

  function _myHelpNav(dir) {
    _myHelpStep = Math.max(0, Math.min(MY_STEPS.length-1, _myHelpStep+dir));
    _renderMyStep();
  }

  function _myOpenHelp() {
    _myHelpStep = 0;
    if (typeof paused !== 'undefined') window.paused = true;
    var overlay = document.getElementById('help-overlay');
    if (overlay) overlay.classList.add('show');
    _renderMyStep();
    /* Bind prev button */
    var prevBtn = document.getElementById('help-prev');
    if (prevBtn) prevBtn.onclick = function () { _myHelpNav(-1); };
  }

  function _myCloseHelp() {
    var overlay = document.getElementById('help-overlay');
    if (overlay) overlay.classList.remove('show');
    if (typeof paused !== 'undefined') window.paused = false;
  }

  /* Replace the global functions */
  function _installTutorial() {
    if (typeof window.openHelp !== 'function') { setTimeout(_installTutorial, 200); return; }
    window.openHelp       = _myOpenHelp;
    window.closeHelp      = _myCloseHelp;
    window.helpNav        = _myHelpNav;
    window.renderHelpStep = _renderMyStep;
    console.log('[PatchV3c] Tutorial replaced with 10-step version.');
  }
  _installTutorial();

  /* ────────────────────────────────────────────────────────────────────
     DONE
  ──────────────────────────────────────────────────────────────────── */
  console.log('[PatchV3c v1.0] ✅ Loaded!\n' +
    '  · Seamless grass field restored (gv* tints, no borders, gap:0)\n' +
    '  · Jobs Board removed from Shop tab\n' +
    '  · City screen has exactly one 💼 Jobs tab\n' +
    '  · Daily Quests moved above ⭐ Skills in Bag tab\n' +
    '  · 10-step tutorial installed');
})();