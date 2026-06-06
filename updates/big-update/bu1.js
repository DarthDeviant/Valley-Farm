
/* ═══════════════════════════════════════════════════════
   tbu.js — Merged Patch Bundle
   Generated: 2026-06-06
   Sources:   bigupdate_1_grass.js, bigupdate_2_fertilizer.js, bigupdate_3_jobs.js, bigupdate_4_hoe.js, patch_v3.js
   ═══════════════════════════════════════════════════════ */


/* ──────────────────────── bigupdate_1_grass.js ──────────────────────── */
/* ═══════════════════════════════════════════════════════════════
   BIG UPDATE — Part 1: SEAMLESS GRASS FIELD  v1.0
   Removes the tile-grid look and makes the farm feel like a
   continuous, organic patch of land.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── CSS injection ─────────────────────────────────────────── */
  var style = document.createElement('style');
  style.id = 'bigupdate-grass-css';
  style.textContent = [
    /* Collapse the 3px gap to 0 — tiles become adjacent */
    '#farm-grid { gap: 0 !important; border-radius: 12px; overflow: hidden; }',
    '#farm-wrap { border-radius: 14px; overflow: hidden;',
    '             box-shadow: 0 6px 28px rgba(0,0,0,0.22); }',

    /* Remove borders / rounding from ALL tile types */
    '.tile, .tile-tree {',
    '  border: none !important;',
    '  border-radius: 0 !important;',
    '  box-shadow: none !important;',
    '}',

    /* Hover: keep the brightness lift but drop the scale/border */
    '.tile:hover {',
    '  filter: brightness(1.22) !important;',
    '  transform: none !important;',
    '  z-index: 5;',
    '  box-shadow: inset 0 0 0 2px rgba(255,255,255,0.55) !important;',
    '}',

    /* Grass micro-variations (class applied by JS below) */
    '.gv0 { filter: brightness(1.00) saturate(1.00); }',
    '.gv1 { filter: brightness(0.94) saturate(0.93); }',
    '.gv2 { filter: brightness(1.06) saturate(1.06); }',
    '.gv3 { filter: brightness(0.90) saturate(0.88); }',
    '.gv4 { filter: brightness(1.10) saturate(1.10); }',
    /* hover on varied tiles — override the variation temporarily */
    '.gv0:hover, .gv1:hover, .gv2:hover, .gv3:hover, .gv4:hover {',
    '  filter: brightness(1.22) !important;',
    '}',

    /* Tilled soil — inset shadow makes it look embedded in the ground */
    '.tile[data-tilled="1"] {',
    '  box-shadow: inset 0 3px 7px rgba(0,0,0,0.30),',
    '              inset 0 0 0 1px rgba(0,0,0,0.18) !important;',
    '  border-radius: 2px !important;',
    '}',
    '.tile[data-tilled="1"][data-watered="1"] {',
    '  box-shadow: inset 0 3px 9px rgba(0,0,0,0.42),',
    '              inset 0 0 0 1px rgba(30,10,0,0.28) !important;',
    '}',

    /* Decorated tiles — subtle rounding so decos stand out */
    '.tile[data-deco="1"] {',
    '  border-radius: 4px !important;',
    '  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.10) !important;',
    '}',

    /* Harvest-ready glow — nicer pulse */
    '.tile-ready {',
    '  animation: grassReadyPulse 1.6s ease-in-out infinite !important;',
    '}',
    '@keyframes grassReadyPulse {',
    '  0%,100% { filter: brightness(1.0); }',
    '  50%      { filter: brightness(1.20) drop-shadow(0 0 6px rgba(251,191,36,0.55)); }',
    '}',

    /* Grass deco sprite — subtler so it reads as texture, not icon */
    '.grass-deco {',
    '  opacity: 0.38;',
    '  font-size: 15px;',
    '  filter: saturate(0.65);',
    '  pointer-events: none;',
    '  user-select: none;',
    '}',

    /* Crop emoji transition */
    '.crop-em { transition: transform 0.18s ease; }',
  ].join('\n');
  document.head.appendChild(style);

  /* ── Patch renderFarm ──────────────────────────────────────── */
  function applyGrassPatch() {
    if (typeof window.renderFarm !== 'function') {
      return setTimeout(applyGrassPatch, 150);
    }
    var _orig = window.renderFarm;

    window.renderFarm = function () {
      _orig.apply(this, arguments);

      var grid = document.getElementById('farm-grid');
      if (!grid || typeof G === 'undefined' || !G.farm) return;

      var GW_v  = typeof GW !== 'undefined' ? GW : 14;
      var GH_v  = typeof GH !== 'undefined' ? GH : 10;

      /* Build the set of tree-cell keys for the current land */
      var landTrees = [];
      if (typeof LAND_TREES !== 'undefined' && G.currentLand) {
        landTrees = LAND_TREES[G.currentLand] || LAND_TREES.home || [];
      } else if (typeof TREES !== 'undefined') {
        landTrees = TREES;
      }
      var treeKeys = new Set(landTrees.map(function (t) { return t[0] * 100 + t[1]; }));

      var idx = 0;
      for (var r = 0; r < GH_v; r++) {
        for (var c = 0; c < GW_v; c++) {
          var el   = grid.children[idx++];
          if (!el) continue;
          var tkey = r * 100 + c;

          /* Tree cells — no data attributes needed */
          if (treeKeys.has(tkey)) continue;

          var tile = G.farm[r] && G.farm[r][c];
          if (!tile) continue;

          /* Stamp data attributes so CSS selectors work */
          el.dataset.tilled  = tile.tilled  ? '1' : '0';
          el.dataset.watered = tile.watered ? '1' : '0';
          el.dataset.deco    = tile.deco    ? '1' : '0';

          /* Grass micro-variation — deterministic from position */
          if (!tile.tilled && !tile.deco) {
            var v = (r * 7 + c * 13 + r * c * 3) % 5;
            el.classList.add('gv' + v);
          }
        }
      }
    };

    console.log('[BIG UPDATE 1] Seamless Grass Field patch applied.');
  }

  applyGrassPatch();
})();


/* ──────────────────────── bigupdate_2_fertilizer.js ──────────────────────── */
/* ═══════════════════════════════════════════════════════════════
   BIG UPDATE — Part 2: FERTILIZER SYSTEM  v1.0
   Adds four fertilizer types buyable from the Shop (Town Supply).
   Apply to tilled soil with the 🌿 Fert tool — each type gives
   a different bonus: extra growth, speed, or bonus harvest yield.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Fertilizer definitions ─────────────────────────────────── */
  var FERTILIZERS = {
    basic:    { n:'Basic Fertilizer', e:'🌿', cost:50,
                desc:'+1 extra growth per watered day',
                growBonus:1, yieldBonus:0, speedMult:0 },
    compost:  { n:'Rich Compost',     e:'🪱', cost:120,
                desc:'+2 extra growth per watered day',
                growBonus:2, yieldBonus:0, speedMult:0 },
    speedgrow:{ n:'Speed Grow',       e:'⚡', cost:200,
                desc:'Crops advance 2× on every watered day',
                growBonus:0, yieldBonus:0, speedMult:1 },
    mega:     { n:'Mega Fertilizer',  e:'💎', cost:350,
                desc:'+35% bonus yield chance on harvest',
                growBonus:0, yieldBonus:0.35, speedMult:0 },
  };

  /* Expose so other patches can read it */
  window.FERTILIZERS = FERTILIZERS;

  /* ── CSS ────────────────────────────────────────────────────── */
  var css = document.createElement('style');
  css.textContent = [
    /* Badge icon on fertilized tiles */
    '.fert-badge {',
    '  position:absolute; bottom:2px; right:2px;',
    '  font-size:10px; line-height:1; opacity:0.88;',
    '  pointer-events:none; user-select:none; z-index:4;',
    '  text-shadow:0 1px 2px rgba(0,0,0,0.5);',
    '}',
    /* Shop fertilizer card accent */
    '.fert-card { border-left:3px solid #16a34a !important; }',
    '.fert-card:hover { border-color:#22c55e !important; }',
  ].join('\n');
  document.head.appendChild(css);

  /* ── State helpers ──────────────────────────────────────────── */
  function ensureFertInv() {
    if (typeof G !== 'undefined' && !G.fertilizers) G.fertilizers = {};
  }

  /* ── Patch initState ────────────────────────────────────────── */
  var _waitInit = setInterval(function () {
    if (typeof window.initState !== 'function') return;
    clearInterval(_waitInit);
    var _orig = window.initState;
    window.initState = function () {
      _orig.apply(this, arguments);
      if (G) G.fertilizers = {};
    };
  }, 100);

  /* ── Patch loadState ────────────────────────────────────────── */
  var _waitLoad = setInterval(function () {
    if (typeof window.loadState !== 'function') return;
    clearInterval(_waitLoad);
    var _orig = window.loadState;
    window.loadState = function (s) {
      _orig.apply(this, arguments);
      if (G && !G.fertilizers) G.fertilizers = {};
    };
  }, 100);

  /* ── Buy fertilizer (called by event binding in renderSide) ─── */
  window.buyFertilizer = function (id, qty) {
    var f = FERTILIZERS[id];
    if (!f) return;
    ensureFertInv();
    var cost = f.cost * qty;
    if (G.gold < cost) {
      if (typeof toast === 'function') toast('Need ' + cost + 'g! 💸', 'error');
      if (typeof snd  === 'function') snd('error');
      return;
    }
    G.gold -= cost;
    G.fertilizers[id] = (G.fertilizers[id] || 0) + qty;
    if (typeof snd   === 'function') snd('buy');
    if (typeof toast === 'function') toast('Bought ×' + qty + ' ' + f.n + '! ' + f.e, 'success');
    if (typeof render === 'function') render();
  };

  /* ── Fertilizer section HTML ────────────────────────────────── */
  function buildFertSection() {
    ensureFertInv();
    var h = '<div class="s-sec">🌿 Fertilizers <span style="font-size:9px;font-weight:400;opacity:.6">(Town Supply)</span></div>';
    h += '<div style="font-size:10px;color:var(--text-muted);margin:-4px 0 7px;padding:0 2px">Select the 🌿 Fert tool then tap tilled soil to apply. Effects last until harvest.</div>';
    Object.entries(FERTILIZERS).forEach(function (_ref) {
      var id = _ref[0], f = _ref[1];
      var have    = (G.fertilizers && G.fertilizers[id]) || 0;
      var cost1   = f.cost;
      var cost3   = f.cost * 3;
      var canBuy1 = G && G.gold >= cost1;
      var canBuy3 = G && G.gold >= cost3;
      h += '<div class="shop-card fert-card">';
      h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px">';
      h += '<span class="shop-name">' + f.e + ' ' + f.n + '</span>';
      h += '<span class="shop-price">' + cost1 + 'g each</span></div>';
      h += '<div class="shop-meta">' + f.desc + ' &nbsp;·&nbsp; Have: ' + have + '</div>';
      h += '<div class="shop-row">';
      h += '<button class="buy-btn" data-buy-fert="' + id + '" data-qty="1" ' + (canBuy1 ? '' : 'disabled') + '>×1 (' + cost1 + 'g)</button>';
      h += '<button class="buy-btn" data-buy-fert="' + id + '" data-qty="3" ' + (canBuy3 ? '' : 'disabled') + '>×3 (' + cost3 + 'g)</button>';
      h += '</div></div>';
    });
    return h;
  }

  /* ── Patch buildShop to add fertilizer section ──────────────── */
  var _waitShop = setInterval(function () {
    if (typeof window.buildShop !== 'function') return;
    clearInterval(_waitShop);
    var _orig = window.buildShop;
    window.buildShop = function () {
      var base = _orig.apply(this, arguments);
      /* Skip in winter — base already returns the auction screen */
      if (typeof season === 'function' && season() === 'Winter') return base;
      return base + buildFertSection();
    };
  }, 100);

  /* ── Patch renderSide to bind fertilizer buy buttons ────────── */
  var _waitRS = setInterval(function () {
    if (typeof window.renderSide !== 'function') return;
    clearInterval(_waitRS);
    var _origRS = window.renderSide;
    window.renderSide = function () {
      _origRS.apply(this, arguments);
      ['side-content', 'sheet-content'].forEach(function (panelId) {
        var el = document.getElementById(panelId);
        if (!el) return;
        el.querySelectorAll('[data-buy-fert]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            window.buyFertilizer(btn.dataset.buyFert, +btn.dataset.qty || 1);
          });
        });
      });
      updateFertSel();
    };
  }, 100);

  /* ── Fertilize tool button + select ─────────────────────────── */
  function injectFertTool() {
    if (document.getElementById('tool-fert')) return; // already injected
    var seedBtn = document.getElementById('tool-seed');
    if (!seedBtn) return;

    var btn = document.createElement('button');
    btn.className = 'tool-btn';
    btn.id = 'tool-fert';
    btn.title = 'Apply Fertilizer to tilled soil';
    btn.textContent = '🌿 Fert';
    btn.addEventListener('click', function () {
      if (typeof setTool === 'function') setTool('fert');
    });
    seedBtn.insertAdjacentElement('afterend', btn);

    var sel = document.createElement('select');
    sel.id = 'fert-select';
    sel.style.cssText = 'display:none;font-size:11px;padding:4px 7px;border-radius:8px;border:1.5px solid var(--ui-border);background:var(--ui-bg);color:var(--text-primary);font-family:Nunito,sans-serif;font-weight:700';
    sel.addEventListener('change', function () {
      if (typeof G !== 'undefined') G.selectedFert = sel.value;
    });
    btn.insertAdjacentElement('afterend', sel);
    updateFertSel();
  }

  function updateFertSel() {
    var sel = document.getElementById('fert-select');
    if (!sel || typeof G === 'undefined') return;
    ensureFertInv();
    sel.innerHTML = Object.entries(FERTILIZERS).map(function (_ref2) {
      var id = _ref2[0], f = _ref2[1];
      var have = (G.fertilizers && G.fertilizers[id]) || 0;
      return '<option value="' + id + '" ' + (have > 0 ? '' : 'disabled') + '>' +
             f.e + ' ' + f.n + ' (×' + have + ')</option>';
    }).join('');
    /* Prefer current selection; fall back to first available */
    var avail = Object.keys(FERTILIZERS).find(function (id) { return (G.fertilizers[id] || 0) > 0; });
    if (G.selectedFert && (G.fertilizers[G.selectedFert] || 0) > 0) {
      sel.value = G.selectedFert;
    } else if (avail) {
      G.selectedFert = avail; sel.value = avail;
    }
    sel.style.display = (G.tool === 'fert') ? 'inline-block' : 'none';
  }

  /* ── Patch setTool for fert visibility ──────────────────────── */
  var _waitST = setInterval(function () {
    if (typeof window.setTool !== 'function') return;
    clearInterval(_waitST);
    var _orig = window.setTool;
    window.setTool = function (t) {
      _orig.apply(this, arguments);
      var fertBtn = document.getElementById('tool-fert');
      if (fertBtn) fertBtn.classList.toggle('active', t === 'fert');
      var fertSel = document.getElementById('fert-select');
      if (fertSel) fertSel.style.display = (t === 'fert') ? 'inline-block' : 'none';
      if (t === 'fert') updateFertSel();
    };
  }, 100);

  /* ── Patch clickTile — handle 'fert' tool ───────────────────── */
  var _waitCT = setInterval(function () {
    if (typeof window.clickTile !== 'function') return;
    clearInterval(_waitCT);
    var _origCT = window.clickTile;
    window.clickTile = function (r, c) {
      if (typeof G === 'undefined' || G.tool !== 'fert') {
        return _origCT.apply(this, arguments);
      }
      if (G.energy <= 0) {
        if (typeof toast === 'function') toast('Too tired! 😴 Sleep to restore energy.', 'error');
        return;
      }
      var tile = G.farm[r][c];
      if (!tile.tilled) {
        if (typeof toast === 'function') toast('Till the soil first!', 'warn', 1200);
        return;
      }
      ensureFertInv();
      var fertId = (G.selectedFert && (G.fertilizers[G.selectedFert] || 0) > 0)
                  ? G.selectedFert : null;
      if (!fertId) {
        if (typeof toast === 'function') toast('No fertilizer! Buy some from the Shop tab. 🌿', 'warn');
        return;
      }
      if (tile.fertilizer) {
        var existing = FERTILIZERS[tile.fertilizer];
        if (typeof toast === 'function')
          toast('Already fertilized (' + (existing ? existing.n : tile.fertilizer) + ')!', 'info', 1200);
        return;
      }
      G.fertilizers[fertId]--;
      if (!G.fertilizers[fertId]) delete G.fertilizers[fertId];
      G.farm[r][c] = Object.assign({}, tile, { fertilizer: fertId });
      if (typeof S !== 'undefined' && S.energyCost) G.energy = Math.max(0, G.energy - 1);
      if (typeof snd   === 'function') snd('place');
      if (typeof toast === 'function')
        toast(FERTILIZERS[fertId].e + ' ' + FERTILIZERS[fertId].n + ' applied! 🌿', 'success', 1400);
      updateFertSel();
      if (typeof render === 'function') render();
    };
  }, 100);

  /* ── Patch advanceFarmGrid — fertilizer growth bonuses ──────── */
  var _waitAFG = setInterval(function () {
    if (typeof window.advanceFarmGrid !== 'function') return;
    clearInterval(_waitAFG);
    var _origAFG = window.advanceFarmGrid;
    window.advanceFarmGrid = function (farm, hasGreenhouse, hasSprinkler) {
      var result = _origAFG.apply(this, arguments);
      /* Apply fertilizer-specific growth boosts */
      for (var r = 0; r < result.length; r++) {
        for (var c = 0; c < result[r].length; c++) {
          var origTile = farm[r] && farm[r][c];
          var newTile  = result[r] && result[r][c];
          if (!origTile || !newTile || !origTile.fertilizer) continue;
          if (!newTile.crop) continue; /* crop died / wrong season */
          var f = FERTILIZERS[origTile.fertilizer];
          if (!f) continue;
          /* Carry fertilizer forward (it stays until crop is harvested) */
          newTile.fertilizer = origTile.fertilizer;
          /* Only apply bonus on days the crop was watered */
          if (!origTile.watered) continue;
          var maxDays = (typeof CROPS !== 'undefined' && CROPS[newTile.crop.type])
                        ? CROPS[newTile.crop.type].days : 999;
          /* Extra grow progress per watered day */
          if (f.growBonus > 0) {
            newTile.crop.days = Math.min(maxDays, (newTile.crop.days || 0) + f.growBonus);
          }
          /* Speed-grow: one extra advance (net ×2 progress per day) */
          if (f.speedMult > 0) {
            newTile.crop.days = Math.min(maxDays, (newTile.crop.days || 0) + 1);
          }
        }
      }
      return result;
    };
  }, 100);

  /* ── Patch clickTile scythe branch — mega fertilizer yield ──── */
  /* We hook addXP indirectly: after harvest, if tile had mega fert
     we give an extra item to the bag. We do this by wrapping the
     scythe outcome inside clickTile (already wrapped above). */
  var _waitScythe = setInterval(function () {
    if (typeof window.scytheAll !== 'function') return;
    clearInterval(_waitScythe);
    var _origSA = window.scytheAll;
    window.scytheAll = function () {
      /* Before bulk harvest, credit mega-fert bonus items */
      if (typeof G !== 'undefined' && G.farm) {
        G.farm.forEach(function (row) {
          row.forEach(function (tile) {
            if (!tile.crop || !tile.fertilizer) return;
            var f = FERTILIZERS[tile.fertilizer];
            if (!f || !f.yieldBonus) return;
            if (Math.random() < f.yieldBonus) {
              tile._megaBonus = true;
            }
          });
        });
      }
      _origSA.apply(this, arguments);
    };
  }, 100);

  /* ── Patch renderFarm — show fertilizer badge on tiles ──────── */
  var _waitRF = setInterval(function () {
    if (typeof window.renderFarm !== 'function') return;
    clearInterval(_waitRF);
    var _origRF = window.renderFarm;
    window.renderFarm = function () {
      _origRF.apply(this, arguments);
      var grid = document.getElementById('farm-grid');
      if (!grid || typeof G === 'undefined' || !G.farm) return;
      var GW_v = typeof GW !== 'undefined' ? GW : 14;
      var GH_v = typeof GH !== 'undefined' ? GH : 10;
      var landTrees = [];
      if (typeof LAND_TREES !== 'undefined' && G.currentLand) {
        landTrees = LAND_TREES[G.currentLand] || LAND_TREES.home || [];
      }
      var treeKeys = new Set(landTrees.map(function (t) { return t[0] * 100 + t[1]; }));
      var idx = 0;
      for (var r = 0; r < GH_v; r++) {
        for (var c = 0; c < GW_v; c++) {
          var el = grid.children[idx++];
          if (!el) continue;
          if (treeKeys.has(r * 100 + c)) continue;
          var tile = G.farm[r] && G.farm[r][c];
          if (!tile || !tile.fertilizer) continue;
          var f = FERTILIZERS[tile.fertilizer];
          if (!f) continue;
          var badge = document.createElement('span');
          badge.className = 'fert-badge';
          badge.textContent = f.e;
          badge.title = f.n + ' applied';
          el.appendChild(badge);
        }
      }
    };
  }, 100);

  /* ── Inject tool button once toolbar is in DOM ──────────────── */
  var _toolInt = setInterval(function () {
    if (document.getElementById('toolbar')) {
      injectFertTool();
      clearInterval(_toolInt);
    }
  }, 200);

  console.log('[BIG UPDATE 2] Fertilizer System loaded.');
})();


/* ──────────────────────── bigupdate_3_jobs.js ──────────────────────── */
/* ═══════════════════════════════════════════════════════════════
   BIG UPDATE — Part 3: JOBS SYSTEM  v1.0
   Adds a Jobs Board to the Shop tab.  Take one job at a time —
   each grants daily income and a special perk.

   Jobs:
    👷 Construction Worker  — free to hire
         Perk:  Unlocks "⚒ Till Field" button — tills the entire
                farm in one click (costs 15 energy).
         Pay:   +40g / day

    🚚 Delivery Driver       — free to hire
         Perk:  +12% bonus on every Ship-All or auction sale.
         Pay:   +35g / day

    🌱 Apprentice Gardener   — free to hire
         Perk:  +20% XP on all farming/watering/harvesting actions.
         Pay:   +20g / day

    🔭 Field Scout           — costs 80g to hire
         Perk:  Shows tomorrow's weather forecast each morning.
         Pay:   +55g / day (premium position)
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Job definitions ─────────────────────────────────────────── */
  var JOBS = {
    construction: {
      id:'construction', e:'👷', n:'Construction Worker',
      desc:'Hire yourself out as a construction worker. Unlocks the "Till Field" button — tills every untilled grass tile on this farm in one click.',
      perks:['⚒ Till entire field in one click','40g daily wage'],
      dailyPay:40, hireCost:0,
      perkTag:'⚒ Till Field Unlocked',
    },
    driver: {
      id:'driver', e:'🚚', n:'Delivery Driver',
      desc:'Work as a produce delivery driver between seasons. All your crop shipments and auction sales earn +12% more gold.',
      perks:['+12% on all crop sales','35g daily wage'],
      dailyPay:35, hireCost:0,
      perkTag:'📦 +12% Sales Bonus Active',
    },
    gardener: {
      id:'gardener', e:'🌱', n:'Apprentice Gardener',
      desc:'Part-time job at the community garden. You gain +20% XP from tilling, watering, and harvesting on your own farm.',
      perks:['+20% XP from all farm actions','20g daily wage'],
      dailyPay:20, hireCost:0,
      perkTag:'⭐ +20% XP Active',
    },
    scout: {
      id:'scout', e:'🔭', n:'Field Scout',
      desc:'Scout terrain and forecast weather for local farms. Requires an 80g equipment fee. Shows tomorrow\'s weather each morning.',
      perks:['🌤 Tomorrow\'s weather revealed each morning','55g daily wage'],
      dailyPay:55, hireCost:80,
      perkTag:'🌤 Weather Forecast Active',
    },
  };

  /* Expose globally */
  window.JOBS = JOBS;

  /* ── CSS ─────────────────────────────────────────────────────── */
  var css = document.createElement('style');
  css.textContent = [
    '.job-card {',
    '  padding:10px 12px; background:var(--ui-bg2);',
    '  border:1.5px solid var(--ui-border); border-radius:13px;',
    '  margin-bottom:8px; transition:border-color .15s;',
    '}',
    '.job-card:hover { border-color:#86efac; }',
    '.job-card-active { border-color:#22c55e !important;',
    '  background:linear-gradient(135deg,rgba(34,197,94,.06),rgba(34,197,94,.02)) !important; }',
    '.job-title { font-size:13px; font-weight:800; color:var(--text-primary); }',
    '.job-pay   { font-size:11px; color:#16a34a; font-weight:700; }',
    '.job-desc  { font-size:10.5px; color:var(--text-muted); margin:4px 0 6px; line-height:1.5; }',
    '.job-perks { font-size:10px; color:var(--green); font-weight:700; margin-bottom:6px; }',
    '.job-perk-item::before { content:"✓ "; }',
    '.job-btn-row { display:flex; gap:5px; }',
    '.job-hire-btn {',
    '  flex:1; padding:7px 10px; border:none; border-radius:9px;',
    '  background:linear-gradient(135deg,#22c55e,#16a34a); color:#fff;',
    '  font-family:Nunito,sans-serif; font-size:11px; font-weight:800;',
    '  cursor:pointer; transition:opacity .15s;',
    '}',
    '.job-hire-btn:disabled { opacity:.4; cursor:not-allowed; }',
    '.job-hire-btn:not(:disabled):hover { opacity:.85; }',
    '.job-quit-btn {',
    '  padding:7px 10px; border:1.5px solid #ef4444; border-radius:9px;',
    '  background:transparent; color:#ef4444; font-family:Nunito,sans-serif;',
    '  font-size:11px; font-weight:800; cursor:pointer; transition:all .15s;',
    '}',
    '.job-quit-btn:hover { background:rgba(239,68,68,.1); }',
    '.job-active-badge {',
    '  display:inline-block; padding:2px 8px; border-radius:20px;',
    '  background:rgba(34,197,94,.12); color:#16a34a; font-size:10px; font-weight:800;',
    '  border:1px solid rgba(34,197,94,.3); margin-bottom:6px;',
    '}',
    /* Till Field toolbar button */
    '#tool-tillall {',
    '  background:linear-gradient(135deg,#d97706,#b45309) !important;',
    '  color:#fff !important; border-color:#b45309 !important;',
    '  font-weight:800 !important;',
    '}',
    '#tool-tillall:hover { opacity:.88; }',
    /* Job status pill in the job card */
    '.job-income-note {',
    '  font-size:9.5px; color:var(--text-muted); margin-top:4px; font-style:italic;',
    '}',
  ].join('\n');
  document.head.appendChild(css);

  /* ── State helpers ───────────────────────────────────────────── */
  function ensureJob() {
    if (typeof G !== 'undefined' && G.job === undefined) G.job = null;
  }

  /* ── Patch initState ─────────────────────────────────────────── */
  var _wI = setInterval(function () {
    if (typeof window.initState !== 'function') return;
    clearInterval(_wI);
    var _o = window.initState;
    window.initState = function () { _o.apply(this, arguments); if (G) G.job = null; };
  }, 100);

  /* ── Patch loadState ─────────────────────────────────────────── */
  var _wL = setInterval(function () {
    if (typeof window.loadState !== 'function') return;
    clearInterval(_wL);
    var _o = window.loadState;
    window.loadState = function (s) {
      _o.apply(this, arguments);
      if (G && G.job === undefined) G.job = null;
    };
  }, 100);

  /* ── Hire / quit ─────────────────────────────────────────────── */
  window.hireJob = function (id) {
    var job = JOBS[id];
    if (!job) return;
    ensureJob();
    if (G.job === id) { if (typeof toast === 'function') toast('You already have this job!', 'warn'); return; }
    if (G.gold < job.hireCost) {
      if (typeof toast === 'function') toast('Need ' + job.hireCost + 'g to take this job!', 'error');
      if (typeof snd === 'function') snd('error');
      return;
    }
    if (G.job !== null) {
      /* Auto-quit old job */
      var oldJob = JOBS[G.job];
      if (typeof toast === 'function' && oldJob)
        toast('Quit your ' + oldJob.n + ' job.', 'info', 2000);
    }
    G.gold -= job.hireCost;
    G.job = id;
    if (typeof snd   === 'function') snd('buy');
    if (typeof toast === 'function')
      toast(job.e + ' You\'re now a ' + job.n + '! ' + job.perkTag, 'success', 3500);
    updateTillAllBtn();
    if (typeof render === 'function') render();
  };

  window.quitJob = function () {
    ensureJob();
    if (!G.job) { if (typeof toast === 'function') toast('No job to quit!', 'info'); return; }
    var job = JOBS[G.job];
    G.job = null;
    if (typeof toast === 'function' && job)
      toast('You quit your ' + job.n + ' job. Good luck out there!', 'info', 2800);
    updateTillAllBtn();
    if (typeof render === 'function') render();
  };

  /* ── Jobs Board HTML ─────────────────────────────────────────── */
  function buildJobsSection() {
    ensureJob();
    var curJob  = G.job;
    var h = '<div class="s-sec">💼 Jobs Board</div>';
    h += '<div style="font-size:10px;color:var(--text-muted);margin:-4px 0 7px;padding:0 2px">';
    h += 'Hold one job at a time. Daily pay arrives every morning with your sleep. Perks are active immediately.</div>';

    if (curJob) {
      var cj = JOBS[curJob];
      h += '<div style="padding:7px 10px;background:rgba(34,197,94,.08);border:1.5px solid rgba(34,197,94,.3);border-radius:10px;font-size:11px;font-weight:700;color:#16a34a;margin-bottom:8px">';
      h += cj.e + ' Currently employed as: <b>' + cj.n + '</b>';
      h += '<br><span style="font-weight:400;font-size:10px;color:var(--text-muted)">+' + cj.dailyPay + 'g/day · ' + cj.perkTag + '</span>';
      h += '</div>';
    }

    Object.values(JOBS).forEach(function (job) {
      var isActive  = (curJob === job.id);
      var canAfford = G && G.gold >= job.hireCost;
      h += '<div class="job-card' + (isActive ? ' job-card-active' : '') + '">';
      h += '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:3px">';
      h += '<span class="job-title">' + job.e + ' ' + job.n + '</span>';
      h += '<span class="job-pay">+' + job.dailyPay + 'g/day</span>';
      h += '</div>';
      if (isActive) h += '<span class="job-active-badge">✓ Active Job</span><br>';
      h += '<div class="job-desc">' + job.desc + '</div>';
      h += '<div class="job-perks">';
      job.perks.forEach(function (p) {
        h += '<div class="job-perk-item">' + p + '</div>';
      });
      h += '</div>';
      if (job.hireCost > 0 && !isActive) {
        h += '<div class="job-income-note">Hire fee: ' + job.hireCost + 'g (equipment cost)</div>';
      }
      h += '<div class="job-btn-row">';
      if (isActive) {
        h += '<button class="job-quit-btn" onclick="quitJob()">Quit Job</button>';
      } else {
        h += '<button class="job-hire-btn" data-hire-job="' + job.id + '"' + (canAfford ? '' : ' disabled') + '>';
        h += (job.hireCost > 0 ? 'Hire (' + job.hireCost + 'g)' : 'Take Job — Free') + '</button>';
      }
      h += '</div>';
      h += '</div>';
    });
    return h;
  }

  /* ── Patch buildShop ─────────────────────────────────────────── */
  var _wS = setInterval(function () {
    if (typeof window.buildShop !== 'function') return;
    clearInterval(_wS);
    var _o = window.buildShop;
    window.buildShop = function () {
      return _o.apply(this, arguments) + buildJobsSection();
    };
  }, 100);

  /* ── Bind job hire buttons in renderSide ─────────────────────── */
  var _wRS = setInterval(function () {
    if (typeof window.renderSide !== 'function') return;
    clearInterval(_wRS);
    var _o = window.renderSide;
    window.renderSide = function () {
      _o.apply(this, arguments);
      ['side-content', 'sheet-content'].forEach(function (panelId) {
        var el = document.getElementById(panelId);
        if (!el) return;
        el.querySelectorAll('[data-hire-job]').forEach(function (btn) {
          btn.addEventListener('click', function () { window.hireJob(btn.dataset.hireJob); });
        });
      });
    };
  }, 100);

  /* ── Patch doSleep — award daily job pay ─────────────────────── */
  var _wSleep = setInterval(function () {
    if (typeof window.doSleep !== 'function') return;
    clearInterval(_wSleep);
    var _o = window.doSleep;
    window.doSleep = function () {
      ensureJob();
      /* Inject job pay into the morning-message queue after base sleep */
      var ret = _o.apply(this, arguments);
      if (G.job) {
        var job = JOBS[G.job];
        if (job) {
          /* Pay is credited by patching advanceDay, but we show the toast here */
          setTimeout(function () {
            if (typeof toast === 'function')
              toast(job.e + ' Job pay: +' + job.dailyPay + 'g (' + job.n + ')', 'success', 2800);
          }, 2800);
        }
      }
      return ret;
    };
  }, 100);

  /* ── Patch advanceDay — actually add the gold ────────────────── */
  var _wAD = setInterval(function () {
    if (typeof window.advanceDay !== 'function') return;
    clearInterval(_wAD);
    var _o = window.advanceDay;
    window.advanceDay = function () {
      _o.apply(this, arguments);
      ensureJob();
      if (G.job) {
        var job = JOBS[G.job];
        if (job) {
          G.gold += job.dailyPay;
          G.stats.earned = (G.stats.earned || 0) + job.dailyPay;
        }
        /* Field Scout: reveal weather forecast */
        if (G.job === 'scout') {
          var rainChance = {Spring:0.28,Summer:0.22,Fall:0.10,Winter:0}[
            typeof season === 'function' ? season() : 'Spring'] || 0.22;
          var likelyRain = Math.random() < rainChance;
          G._scoutForecast = likelyRain ? 'rainy' : 'sunny';
        }
      }
    };
  }, 100);

  /* ── Patch shipAll and auction for Delivery Driver bonus ──────── */
  var _wShip = setInterval(function () {
    if (typeof window.shipAll !== 'function' || typeof window.auctionSell !== 'function') return;
    clearInterval(_wShip);

    /* shipAll bonus */
    var _oShip = window.shipAll;
    window.shipAll = function () {
      _oShip.apply(this, arguments);
      ensureJob();
      if (G.job === 'driver' && G.pending > 0) {
        var bonus = Math.round(G.pending * 0.12);
        G.pending += bonus;
        if (typeof toast === 'function')
          setTimeout(function () { toast('🚚 Driver bonus: +' + bonus + 'g on shipping!', 'success', 2200); }, 400);
      }
    };

    /* auctionSell bonus */
    var _oAuct = window.auctionSell;
    window.auctionSell = function (type, qty) {
      ensureJob();
      if (G.job !== 'driver') { _oAuct.apply(this, arguments); return; }
      /* Call original, then add 12% on top */
      var goldBefore = G.gold;
      _oAuct.apply(this, arguments);
      var earned = G.gold - goldBefore;
      if (earned > 0) {
        var bonus = Math.round(earned * 0.12);
        G.gold += bonus;
        G.stats.earned = (G.stats.earned || 0) + bonus;
        if (typeof toast === 'function')
          setTimeout(function () { toast('🚚 Driver bonus: +' + bonus + 'g!', 'success', 1800); }, 400);
      }
    };
  }, 100);

  /* ── Patch addXP for Gardener +20% bonus ─────────────────────── */
  var _wXP = setInterval(function () {
    if (typeof window.addXP !== 'function') return;
    clearInterval(_wXP);
    var _o = window.addXP;
    window.addXP = function (skill, amount) {
      ensureJob();
      var finalAmount = amount;
      if (G.job === 'gardener') {
        finalAmount = Math.round(amount * 1.20);
      }
      _o.call(this, skill, finalAmount);
    };
  }, 100);

  /* ── Construction Worker: "Till Field" button ────────────────── */
  function tillEntireField() {
    ensureJob();
    if (G.job !== 'construction') {
      if (typeof toast === 'function') toast('You need to be a Construction Worker!', 'warn'); return;
    }
    if (G.energy < 15) {
      if (typeof toast === 'function') toast('Not enough energy! Need 15 energy.', 'error');
      if (typeof snd === 'function') snd('error');
      return;
    }
    var GW_v = typeof GW !== 'undefined' ? GW : 14;
    var GH_v = typeof GH !== 'undefined' ? GH : 10;
    var landTrees = [];
    if (typeof LAND_TREES !== 'undefined' && G.currentLand) {
      landTrees = LAND_TREES[G.currentLand] || LAND_TREES.home || [];
    }
    var treeKeys = new Set(landTrees.map(function (t) { return t[0] * 100 + t[1]; }));
    var fLv = typeof getLevel === 'function' ? getLevel((G.skills && G.skills.farming && G.skills.farming.xp) || 0) : 1;
    var count = 0;
    for (var r = 0; r < GH_v; r++) {
      for (var c = 0; c < GW_v; c++) {
        if (treeKeys.has(r * 100 + c)) continue;
        var tile = G.farm[r][c];
        if (tile.tilled || tile.deco || tile.crop) continue;
        var newTile = Object.assign({}, tile, { tilled: true, idleDays: 0, deco: null });
        if (fLv >= 10) newTile.watered = true;
        G.farm[r][c] = newTile;
        count++;
      }
    }
    if (count === 0) {
      if (typeof toast === 'function') toast('All tillable soil is already tilled!', 'info'); return;
    }
    if (typeof S !== 'undefined' && S.energyCost) G.energy = Math.max(0, G.energy - 15);
    if (typeof addXP === 'function') addXP('farming', Math.round(count * 2.5));
    if (typeof snd   === 'function') snd('till');
    if (typeof toast === 'function')
      toast('👷 Tilled ' + count + ' tiles! Great work! ⛏', 'success', 2400);
    if (typeof render === 'function') render();
  }
  window.tillEntireField = tillEntireField;

  function updateTillAllBtn() {
    var btn = document.getElementById('tool-tillall');
    if (!btn) return;
    ensureJob();
    btn.style.display = (G.job === 'construction') ? 'inline-flex' : 'none';
  }

  function injectTillAllBtn() {
    if (document.getElementById('tool-tillall')) return;
    var scytheBtn = document.getElementById('tool-scythe');
    if (!scytheBtn) return;
    var btn = document.createElement('button');
    btn.className = 'tool-btn';
    btn.id = 'tool-tillall';
    btn.title = 'Construction Worker: Till entire farm in one go';
    btn.textContent = '⚒ Till Field';
    btn.style.display = 'none';
    btn.addEventListener('click', tillEntireField);
    scytheBtn.insertAdjacentElement('afterend', btn);
  }

  /* ── Patch render — sync Till Field button visibility ─────────── */
  var _wR = setInterval(function () {
    if (typeof window.render !== 'function') return;
    clearInterval(_wR);
    var _o = window.render;
    window.render = function () {
      _o.apply(this, arguments);
      updateTillAllBtn();
      /* Scout forecast pill in HUD */
      if (G.job === 'scout' && G._scoutForecast) {
        var hud = document.getElementById('hud-weather');
        if (hud && hud.parentElement) {
          var pip = hud.parentElement.querySelector('.scout-tomorrow');
          if (!pip) {
            pip = document.createElement('span');
            pip.className = 'scout-tomorrow';
            pip.style.cssText = 'font-size:9px;opacity:.7;margin-left:3px;';
            hud.parentElement.appendChild(pip);
          }
          pip.textContent = '→' + (G._scoutForecast === 'rainy' ? '🌧' : '☀️');
          pip.title = 'Scout forecast: tomorrow will be ' + G._scoutForecast;
        }
      }
    };
  }, 100);

  /* ── Inject button once DOM is ready ────────────────────────── */
  var _tbInt = setInterval(function () {
    if (document.getElementById('toolbar')) {
      injectTillAllBtn();
      clearInterval(_tbInt);
    }
  }, 200);

  console.log('[BIG UPDATE 3] Jobs System loaded.');
})();


/* ──────────────────────── bigupdate_4_hoe.js ──────────────────────── */
/* ═══════════════════════════════════════════════════════════════
   BIG UPDATE — Part 4: HOE AREA UPGRADES  v1.0
   Adds two upgrades to the Upgrades tab that increase the hoe's
   tilling area.

   ⚒️  Iron Hoe Head  (1,200g) — Hoe tills a 3×3 area per swing.
   🔩  Steel Hoe Head (2,500g) — Hoe tills a 4×4 area per swing.
                                   Requires Iron Hoe Head first.

   Both upgrades are per-land (like all other upgrades) so you
   need to buy them separately for each plot you own.
   A subtle preview box appears when hovering over the farm grid
   while the Hoe tool is active.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Register upgrades into the game's UPGRADES object ──────── */
  /* UPGRADES is declared with `const` in script.js but it is an
     object, so adding properties is legal.                        */
  var _waitUpgrades = setInterval(function () {
    if (typeof UPGRADES === 'undefined') return;
    clearInterval(_waitUpgrades);

    UPGRADES.hoe_3x3 = {
      n:'Iron Hoe Head', e:'⚒️',
      desc:'Hoe tills a 3×3 patch of soil in one swing. Dramatically speeds up field preparation!',
      cost:1200, max:1,
    };
    UPGRADES.hoe_4x4 = {
      n:'Steel Hoe Head', e:'🔩',
      desc:'Upgrade to a massive 4×4 tilling area. One swing clears 16 tiles! Requires the Iron Hoe Head.',
      cost:2500, max:1,
    };

    console.log('[BIG UPDATE 4] Hoe upgrades registered in UPGRADES.');
  }, 100);

  /* ── Prerequisite check — block hoe_4x4 without hoe_3x3 ──────── */
  var _waitBU = setInterval(function () {
    if (typeof window.buyUpgrade !== 'function') return;
    clearInterval(_waitBU);
    var _orig = window.buyUpgrade;
    window.buyUpgrade = function (id) {
      if (id === 'hoe_4x4') {
        var upgs = typeof curUpgs === 'function' ? curUpgs() : {};
        if (!(upgs.hoe_3x3 >= 1)) {
          if (typeof toast === 'function')
            toast('🔒 Buy the Iron Hoe Head (3×3) first!', 'warn', 2800);
          if (typeof snd === 'function') snd('error');
          return;
        }
      }
      _orig.apply(this, arguments);
    };
    console.log('[BIG UPDATE 4] buyUpgrade prerequisite check applied.');
  }, 100);

  /* ── CSS ─────────────────────────────────────────────────────── */
  var css = document.createElement('style');
  css.textContent = [
    /* Hover-preview highlight for multi-tile hoe area */
    '.hoe-preview {',
    '  outline: 2.5px dashed rgba(251,146,60,0.80) !important;',
    '  outline-offset: -2px;',
    '  background-color: rgba(251,146,60,0.14) !important;',
    '  z-index: 4;',
    '}',
    /* Corner badge on hoe tool button showing current area */
    '#tool-hoe { position:relative; }',
    '#hoe-area-badge {',
    '  position:absolute; top:-5px; right:-5px;',
    '  font-size:8px; font-weight:900;',
    '  background:#d97706; color:#fff;',
    '  border-radius:20px; padding:1px 5px;',
    '  pointer-events:none; line-height:1.4;',
    '  box-shadow:0 1px 3px rgba(0,0,0,.25);',
    '}',
  ].join('\n');
  document.head.appendChild(css);

  /* ── Helper: get current hoe size ───────────────────────────── */
  function getHoeSize() {
    if (typeof curUpgs !== 'function') return 1;
    var upgs = curUpgs();
    if ((upgs.hoe_4x4 || 0) >= 1 && (upgs.hoe_3x3 || 0) >= 1) return 4;
    if ((upgs.hoe_3x3 || 0) >= 1) return 3;
    return 1;
  }

  /* ── Helper: get tile offsets for a given size & center ──────── */
  function getHoeOffsets(size) {
    /* 1×1 → just [0,0]
       3×3 → -1..+1  (center is clicked tile)
       4×4 → -1..+2  (clicked tile at top-left quadrant) */
    var arr = [];
    var range = size === 4 ? [-1, 0, 1, 2] : size === 3 ? [-1, 0, 1] : [0];
    for (var i = 0; i < range.length; i++) {
      for (var j = 0; j < range.length; j++) {
        arr.push([range[i], range[j]]);
      }
    }
    return arr;
  }

  /* ── Patch clickTile — multi-tile hoe ────────────────────────── */
  var _waitCT = setInterval(function () {
    if (typeof window.clickTile !== 'function') return;
    clearInterval(_waitCT);
    var _orig = window.clickTile;
    window.clickTile = function (r, c) {
      /* Only intercept Hoe with an area upgrade */
      if (typeof G === 'undefined' || G.tool !== 'hoe') {
        return _orig.apply(this, arguments);
      }
      var size = getHoeSize();
      if (size === 1) {
        return _orig.apply(this, arguments);  /* no upgrade — use default */
      }

      /* ---- Multi-tile tilling ----------------------------------- */
      var GW_v = typeof GW !== 'undefined' ? GW : 14;
      var GH_v = typeof GH !== 'undefined' ? GH : 10;
      var landTrees = [];
      if (typeof LAND_TREES !== 'undefined' && G.currentLand) {
        landTrees = LAND_TREES[G.currentLand] || LAND_TREES.home || [];
      }
      var treeKeys = new Set(landTrees.map(function (t) { return t[0] * 100 + t[1]; }));
      var fLv = typeof getLevel === 'function'
        ? getLevel((G.skills && G.skills.farming && G.skills.farming.xp) || 0)
        : 1;
      var offsets = getHoeOffsets(size);
      var count = 0;
      var alreadyDone = 0;

      offsets.forEach(function (off) {
        var nr = r + off[0], nc = c + off[1];
        if (nr < 0 || nr >= GH_v || nc < 0 || nc >= GW_v) return;
        if (treeKeys.has(nr * 100 + nc)) return;
        var tile = G.farm[nr][nc];
        if (tile.tilled) { alreadyDone++; return; }
        if (tile.deco)   return;
        var newTile = Object.assign({}, tile, { tilled:true, idleDays:0, deco:null });
        if (fLv >= 10) newTile.watered = true;
        G.farm[nr][nc] = newTile;
        count++;
        /* Reduced energy cost per tile: area tools cost less */
        if (fLv < 5 && typeof S !== 'undefined' && S.energyCost) {
          G.energy = Math.max(0, G.energy - 0.4);
        }
        /* XP: slightly less per tile to balance the efficiency */
        if (typeof addXP === 'function') addXP('farming', 3);
      });

      if (count === 0) {
        if (alreadyDone > 0) {
          if (typeof toast === 'function') toast('Area already tilled!', 'info', 900);
        }
        return;
      }

      if (typeof snd === 'function') snd('till');
      var label = size + '×' + size;
      if (typeof toast === 'function')
        toast('⚒️ ' + label + ' area tilled! (' + count + ' tiles)', 'success', 1400);

      /* Clamp energy floor */
      if (typeof S !== 'undefined' && S.energyCost && G.energy < 0) G.energy = 0;

      if (typeof render === 'function') render();
    };
    console.log('[BIG UPDATE 4] Multi-tile hoe clickTile patch applied.');
  }, 100);

  /* ── Hoe-preview: highlight affected tiles on mouse-over ─────── */
  var _previewActive = false;
  var _previewTiles  = [];

  function clearPreview() {
    _previewTiles.forEach(function (el) { el.classList.remove('hoe-preview'); });
    _previewTiles = [];
    _previewActive = false;
  }

  function showPreview(r, c) {
    clearPreview();
    if (typeof G === 'undefined' || G.tool !== 'hoe') return;
    var size = getHoeSize();
    if (size === 1) return;
    var GW_v = typeof GW !== 'undefined' ? GW : 14;
    var GH_v = typeof GH !== 'undefined' ? GH : 10;
    var grid = document.getElementById('farm-grid');
    if (!grid) return;
    /* Build tree key set */
    var landTrees = [];
    if (typeof LAND_TREES !== 'undefined' && G.currentLand) {
      landTrees = LAND_TREES[G.currentLand] || LAND_TREES.home || [];
    }
    var treeKeys = new Set(landTrees.map(function (t) { return t[0] * 100 + t[1]; }));
    var offsets = getHoeOffsets(size);
    offsets.forEach(function (off) {
      var nr = r + off[0], nc = c + off[1];
      if (nr < 0 || nr >= GH_v || nc < 0 || nc >= GW_v) return;
      if (treeKeys.has(nr * 100 + nc)) return;
      var tile = G.farm[nr] && G.farm[nr][nc];
      if (!tile || tile.tilled || tile.deco) return;
      /* Tile index in the grid */
      var idx = nr * GW_v + nc;
      /* Count tree tiles before this index */
      var treesBefore = 0;
      landTrees.forEach(function (t) {
        if (t[0] * GW_v + t[1] < idx) treesBefore++;
      });
      var el = grid.children[idx];
      if (el && !el.classList.contains('tile-tree')) {
        el.classList.add('hoe-preview');
        _previewTiles.push(el);
        _previewActive = true;
      }
    });
  }

  /* Attach hover listeners after renderFarm rebuilds the grid */
  function attachHoverListeners() {
    var grid = document.getElementById('farm-grid');
    if (!grid) return;
    var GW_v = typeof GW !== 'undefined' ? GW : 14;
    var GH_v = typeof GH !== 'undefined' ? GH : 10;
    var landTrees = [];
    if (typeof LAND_TREES !== 'undefined' && G && G.currentLand) {
      landTrees = LAND_TREES[G.currentLand] || LAND_TREES.home || [];
    }
    var treeKeys = new Set(landTrees.map(function (t) { return t[0] * 100 + t[1]; }));
    var idx = 0;
    for (var r = 0; r < GH_v; r++) {
      for (var c = 0; c < GW_v; c++) {
        (function (rr, cc, el) {
          if (!el) return;
          if (treeKeys.has(rr * 100 + cc)) return;
          el.addEventListener('mouseenter', function () { showPreview(rr, cc); });
          el.addEventListener('mouseleave', function () { clearPreview(); });
        })(r, c, grid.children[idx]);
        idx++;
      }
    }
  }

  /* ── Patch renderFarm to attach hover listeners & badge ──────── */
  var _waitRF = setInterval(function () {
    if (typeof window.renderFarm !== 'function') return;
    clearInterval(_waitRF);
    var _orig = window.renderFarm;
    window.renderFarm = function () {
      _orig.apply(this, arguments);
      /* Re-attach hover listeners after every DOM rebuild */
      if (getHoeSize() > 1) attachHoverListeners();
      /* Update hoe area badge */
      updateHoeBadge();
    };
    console.log('[BIG UPDATE 4] renderFarm patched for hoe preview.');
  }, 100);

  /* ── Corner badge on hoe button ──────────────────────────────── */
  function updateHoeBadge() {
    var hoeBtn = document.getElementById('tool-hoe');
    if (!hoeBtn) return;
    var size   = getHoeSize();
    var badge  = document.getElementById('hoe-area-badge');
    if (size > 1) {
      if (!badge) {
        badge = document.createElement('span');
        badge.id = 'hoe-area-badge';
        hoeBtn.style.position = 'relative';
        hoeBtn.appendChild(badge);
      }
      badge.textContent = size + '×' + size;
      badge.style.display = 'block';
    } else if (badge) {
      badge.style.display = 'none';
    }
  }

  /* ── Patch render to sync badge ──────────────────────────────── */
  var _waitRend = setInterval(function () {
    if (typeof window.render !== 'function') return;
    clearInterval(_waitRend);
    var _orig = window.render;
    window.render = function () {
      _orig.apply(this, arguments);
      updateHoeBadge();
    };
  }, 100);

  console.log('[BIG UPDATE 4] Hoe Area Upgrades loaded.');
})();


/* ──────────────────────── patch_v3.js ──────────────────────── */
/* ═══════════════════════════════════════════════════════════════════════
   VALLEY FARM — PATCH v3.0  (patch_v3.js)
   ─────────────────────────────────────────────────────────────────────
   Load order: after script.js · winter.js · winterpatch.js · tbu.js
               · mobilepatch.js · mpfix4.js

   What this patch does
   ─────────────────────
   1. MOBILE GRID FIX  — Farm tiles scale to fill viewport width on
                         mobile; no more gaps or horizontal scroll.
                         Tiles stay square via aspect-ratio CSS.
                         JS patch overrides renderFarm's inline
                         grid-template-columns on narrow screens.

   2. HOE UPGRADE NAMES — "Iron Hoe Head" → "Hoe Upgrade" (3×3)
                           "Steel Hoe Head" → "Iron Head" (4×4)

   3. HOE PICKER MENU  — Clicking ⛏ Hoe opens a visual size picker:
                         [ 1×1 ] [ 2×2 ] [ 3×3 🔒 ] [ 4×4 🔒 ]
                         + a [ 🌿 Fert ] switch button.
                         Selecting Fert switches the active tool and
                         changes the Hoe toolbar button to "🌿 Fert".
                         Re-clicking "🌿 Fert" button returns to Hoe.
                         Works on both PC toolbar and mobile dock.

   4. CITY HUB MENU    — Traveling to the City now shows an
                         intermediate hub screen first:
                           📊 Stock Exchange  |  💼 Jobs Board
                         Jobs Board is also added as a tab inside the
                         City screen; it is removed from the Shop tab.

   NOTE: Does NOT modify any source files. Pure monkey-patch.
═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ────────────────────────────────────────────────────────────────────
     SECTION 0  CSS
  ──────────────────────────────────────────────────────────────────── */
  var style = document.createElement('style');
  style.id = 'vf-patchv3-css';
  style.textContent = `
/* ══ MOBILE GRID: fluid tiles that fill viewport ═══════════════════ */
@media (max-width: 680px) {
  #farm-wrap {
    padding: 0 !important;
    overflow: hidden !important;
    align-items: stretch !important;
  }
  #farm-grid {
    gap: 0 !important;
    width: 100vw !important;
    /* columns set dynamically by JS; rows follow naturally */
  }
  /* Fluid tile: width driven by grid column, height = width */
  #farm-grid .tile,
  #farm-grid .tile-tree {
    width: 100% !important;
    height: 0 !important;
    padding-bottom: 100% !important; /* 1:1 aspect via padding trick */
    border: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    font-size: clamp(10px, 3.5vw, 20px) !important;
    position: relative !important;
    /* emoji & child elements must be positioned inside */
  }
  /* Re-centre content that was relying on flex */
  #farm-grid .tile > *,
  #farm-grid .tile-tree > * {
    position: absolute !important;
    top: 50% !important; left: 50% !important;
    transform: translate(-50%, -50%) !important;
    pointer-events: none !important;
  }
  /* Days badge & sparkle position overrides */
  #farm-grid .days-badge {
    top: auto !important; bottom: 1px !important;
    left: 2px !important; transform: none !important;
    font-size: 8px !important;
  }
  #farm-grid .sparkle {
    top: 1px !important; right: 2px !important;
    transform: none !important;
    font-size: 9px !important;
  }
  #farm-grid .water-dot {
    bottom: 2px !important; right: 2px !important;
    transform: none !important;
  }
  #farm-grid .fert-badge {
    bottom: 1px !important; right: 1px !important;
    transform: none !important;
    font-size: 9px !important;
  }
  #farm-grid .lamp-glow-overlay {
    top: 0 !important; left: 0 !important;
    transform: none !important;
    width: 100% !important; height: 100% !important;
  }
  #farm-grid .tile-ready {
    animation: mobileReadyPulse 1.6s ease-in-out infinite !important;
  }
  @keyframes mobileReadyPulse {
    0%,100% { filter: brightness(1.0); }
    50%      { filter: brightness(1.25) drop-shadow(0 0 4px rgba(251,191,36,.6)); }
  }
}

/* ══ HOE PICKER POPUP ═══════════════════════════════════════════════ */
#hoe-picker {
  display: none;
  position: fixed;
  z-index: 600;
  background: var(--ui-bg);
  border: 1.5px solid var(--ui-border);
  border-radius: 16px;
  padding: 10px;
  box-shadow: 0 8px 36px rgba(0,0,0,.18);
  animation: hoepickerIn .18s cubic-bezier(.25,.8,.25,1);
}
@keyframes hoepickerIn {
  from { opacity:0; transform: scale(.92) translateY(6px); }
  to   { opacity:1; transform: scale(1) translateY(0); }
}
#hoe-picker.hp-open { display: flex; flex-direction: column; gap: 8px; }

/* PC: anchored above toolbar */
@media (min-width: 681px) {
  #hoe-picker {
    bottom: 62px;
    left: 50%;
    transform: translateX(-50%);
    flex-direction: row;
    align-items: center;
    gap: 6px;
  }
}
/* Mobile: bottom sheet style above dock */
@media (max-width: 680px) {
  #hoe-picker {
    bottom: 70px;
    left: 0; right: 0;
    border-radius: 18px 18px 0 0;
    border-bottom: none;
    padding: 12px 10px 14px;
    flex-direction: column;
  }
}
#hoe-picker-title {
  font-size: 9px; font-weight: 800; text-transform: uppercase;
  letter-spacing: .8px; color: var(--text-soft);
  font-family: 'Nunito', sans-serif;
  text-align: center;
}
.hp-row { display: flex; gap: 6px; justify-content: center; flex-wrap: wrap; }
.hp-btn {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 8px 6px 6px;
  background: var(--ui-bg2);
  border: 2px solid var(--ui-border);
  border-radius: 12px;
  cursor: pointer;
  min-width: 60px;
  transition: all .14s;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  font-family: 'Nunito', sans-serif;
  position: relative;
}
.hp-btn:active { transform: scale(.9); }
.hp-btn.sel { border-color: #d97706; background: #fff7ed; }
body.dark .hp-btn.sel { background: #1c0d00; border-color: #ea580c; }
.hp-btn.locked { opacity: .45; cursor: not-allowed; }
.hp-btn.locked:active { transform: none; }
.hp-grid { display: grid; gap: 2px; margin: 0 auto 3px; }
.hp-grid .hpc { background: #d97706; border-radius: 2px; }
.hp-btn-label {
  font-size: 9px; font-weight: 700; color: var(--text-muted);
  pointer-events: none;
}
.hp-lock-badge {
  position: absolute; top: 2px; right: 3px;
  font-size: 9px; opacity: .7;
  pointer-events: none;
}
/* Fert switch button */
.hp-fert-btn {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 8px 10px 6px;
  background: #f0fdf4;
  border: 2px solid #86efac;
  border-radius: 12px;
  cursor: pointer;
  font-family: 'Nunito', sans-serif;
  font-size: 9px; font-weight: 700;
  color: #166534;
  transition: all .14s;
  -webkit-tap-highlight-color: transparent;
}
body.dark .hp-fert-btn { background: #0a2016; border-color: #166534; color: #4ade80; }
.hp-fert-btn:active { transform: scale(.9); }
.hp-sep { width: 1px; height: 48px; background: var(--ui-border); flex-shrink: 0; }
@media (max-width: 680px) { .hp-sep { width: 100%; height: 1px; margin: 2px 0; } }

/* Fert active state on hoe toolbar button */
#tool-hoe.fert-active,
#dock-hoe.fert-active { border-color: #86efac !important; color: #166534 !important; }
body.dark #tool-hoe.fert-active,
body.dark #dock-hoe.fert-active { color: #4ade80 !important; border-color: #166534 !important; }

/* ══ CITY HUB OVERLAY ═══════════════════════════════════════════════ */
#city-hub {
  display: none;
  position: fixed; inset: 0; z-index: 1999;
  background: rgba(0,0,0,.6);
  backdrop-filter: blur(4px);
  align-items: center; justify-content: center;
  animation: chubIn .22s ease;
}
#city-hub.chub-open { display: flex; }
@keyframes chubIn { from { opacity:0; } to { opacity:1; } }
.chub-card {
  background: var(--ui-bg);
  border: 1.5px solid var(--ui-border);
  border-radius: 22px;
  padding: 28px 24px 24px;
  max-width: 340px; width: calc(100vw - 40px);
  box-shadow: 0 24px 64px rgba(0,0,0,.32);
  display: flex; flex-direction: column; gap: 14px;
  animation: chubCardIn .28s cubic-bezier(.34,1.56,.64,1);
}
@keyframes chubCardIn {
  from { transform: scale(.88) translateY(14px); opacity:0; }
  to   { transform: scale(1) translateY(0); opacity:1; }
}
.chub-title {
  font-family: 'Baloo 2', cursive; font-size: 22px; font-weight: 800;
  color: var(--text-primary); text-align: center;
}
.chub-sub {
  font-size: 11px; color: var(--text-muted); text-align: center; line-height: 1.6;
  margin-top: -8px;
}
.chub-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.chub-btn {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 18px 10px 14px;
  border-radius: 14px; border: 2px solid;
  cursor: pointer; font-family: 'Baloo 2', cursive;
  font-size: 13px; font-weight: 800;
  transition: all .16s;
  -webkit-tap-highlight-color: transparent;
}
.chub-btn:active { transform: scale(.94); }
.chub-btn-market {
  background: linear-gradient(135deg,#eef2ff,#e0e7ff);
  border-color: #c7d2fe; color: #4338ca;
}
.chub-btn-market:hover { background: linear-gradient(135deg,#e0e7ff,#c7d2fe); }
body.dark .chub-btn-market { background: #1e1b4b; border-color: #3730a3; color: #818cf8; }
.chub-btn-jobs {
  background: linear-gradient(135deg,#f0fdf4,#dcfce7);
  border-color: #86efac; color: #166534;
}
.chub-btn-jobs:hover { background: linear-gradient(135deg,#dcfce7,#bbf7d0); }
body.dark .chub-btn-jobs { background: #0a2016; border-color: #166534; color: #4ade80; }
.chub-btn-em { font-size: 34px; line-height: 1; }
.chub-close {
  align-self: center; background: none; border: none; cursor: pointer;
  color: var(--text-muted); font-size: 12px; font-weight: 600;
  font-family: 'Nunito', sans-serif; padding: 4px 12px;
  border-radius: 8px; transition: color .15s;
}
.chub-close:hover { color: var(--text-primary); }

/* ══ CITY JOBS TAB ══════════════════════════════════════════════════ */
.city-jobs-intro {
  font-size: 11px; color: var(--text-muted); padding: 8px 11px;
  background: var(--ui-bg2); border: 1px solid var(--ui-border);
  border-radius: 9px; line-height: 1.55;
}

/* Retro overrides */
body.retro #hoe-picker { background: #120c00; border: 2px solid #8b6914; border-radius: 4px; }
body.retro .hp-btn { background: #1c1209; border: 1px solid #3e2723; border-radius: 3px; }
body.retro .hp-btn.sel { background: #2d1b00; border-color: #ffd700; }
body.retro .hp-fert-btn { background: #0d2e10; border: 1px solid #1b5e20; border-radius: 3px; }
body.retro #city-hub { backdrop-filter: none; }
body.retro .chub-card { background: #120c00; border: 3px solid #8b6914; border-radius: 4px; }
body.retro .chub-title { color: #ffd700; font-size: 14px; }
`;
  document.head.appendChild(style);

  /* ────────────────────────────────────────────────────────────────────
     SECTION 1  MOBILE GRID FIX
     Patch renderFarm so that on screens ≤ 680 px the grid columns are
     fluid (1fr each) instead of the hardcoded 52 px inline style.
  ──────────────────────────────────────────────────────────────────── */
  function _patchRenderFarmMobile() {
    if (typeof window.renderFarm !== 'function') { setTimeout(_patchRenderFarmMobile, 150); return; }
    var _prev = window.renderFarm;
    window.renderFarm = function () {
      _prev.apply(this, arguments);
      if (window.innerWidth > 680) return;
      var grid = document.getElementById('farm-grid');
      if (!grid) return;
      var GW_v = typeof GW !== 'undefined' ? GW : 14;
      var GH_v = typeof GH !== 'undefined' ? GH : 10;
      var tileSize = Math.floor(window.innerWidth / GW_v);
      /* Override JS-set inline style with fluid columns */
      grid.style.gridTemplateColumns = 'repeat(' + GW_v + ', ' + tileSize + 'px)';
      grid.style.gridTemplateRows   = 'repeat(' + GH_v + ', ' + tileSize + 'px)';
      grid.style.width  = (tileSize * GW_v) + 'px';
      grid.style.height = (tileSize * GH_v) + 'px';
      /* Fix tile sizes */
      Array.from(grid.children).forEach(function (el) {
        el.style.width  = tileSize + 'px';
        el.style.height = tileSize + 'px';
        el.style.padding = '0';
        el.style.fontSize = Math.floor(tileSize * 0.55) + 'px';
      });
    };
    /* Also re-run on window resize */
    window.addEventListener('resize', function () {
      if (window.innerWidth <= 680 && typeof renderFarm === 'function') renderFarm();
    });
    console.log('[PatchV3] Mobile grid fix applied.');
  }
  _patchRenderFarmMobile();

  /* ────────────────────────────────────────────────────────────────────
     SECTION 2  HOE UPGRADE RENAMING
     tbu.js registers hoe_3x3 and hoe_4x4 into UPGRADES.
     We rename them here to match the user-requested labels.
  ──────────────────────────────────────────────────────────────────── */
  function _renameHoeUpgrades() {
    if (typeof UPGRADES === 'undefined') { setTimeout(_renameHoeUpgrades, 200); return; }
    if (UPGRADES.hoe_3x3) {
      UPGRADES.hoe_3x3.n    = 'Hoe Upgrade';
      UPGRADES.hoe_3x3.desc = 'Upgrade your hoe head. Now tills a 3×3 patch per swing — dramatically faster field prep!';
    }
    if (UPGRADES.hoe_4x4) {
      UPGRADES.hoe_4x4.n    = 'Iron Head';
      UPGRADES.hoe_4x4.desc = 'Forge an iron hoe head for massive 4×4 tilling. Requires the Hoe Upgrade first.';
    }
    console.log('[PatchV3] Hoe upgrade names updated.');
  }
  _renameHoeUpgrades();

  /* ────────────────────────────────────────────────────────────────────
     SECTION 3  HOE AREA + 2×2 SUPPORT
     tbu.js's internal getHoeSize() ignores G.hoeSize.  We wrap
     clickTile one more time (outermost = runs first) to intercept
     the hoe tool and use G.hoeSize as the player's chosen size,
     capped by owned upgrades.  The 2×2 case is handled here too.
  ──────────────────────────────────────────────────────────────────── */
  function _getDesiredHoeSize() {
    var desired = (typeof G !== 'undefined' && G.hoeSize) ? G.hoeSize : 1;
    if (typeof curUpgs !== 'function') return Math.min(desired, 1);
    var upgs = curUpgs();
    var has3 = (upgs.hoe_3x3 || 0) >= 1;
    var has4 = has3 && (upgs.hoe_4x4 || 0) >= 1;
    if (desired >= 4 && has4) return 4;
    if (desired >= 3 && has3) return 3;
    if (desired >= 2) return 2;
    return 1;
  }
  window._getDesiredHoeSize = _getDesiredHoeSize;

  /* Offsets for each area size */
  function _hoeOffsets(size) {
    var offsets = [];
    if (size === 1) return [[0,0]];
    if (size === 2) return [[0,0],[0,1],[1,0],[1,1]];
    var range = size === 4 ? [-1,0,1,2] : [-1,0,1];
    for (var i = 0; i < range.length; i++)
      for (var j = 0; j < range.length; j++)
        offsets.push([range[i], range[j]]);
    return offsets;
  }

  function _patchClickTileForHoe() {
    if (typeof window.clickTile !== 'function') { setTimeout(_patchClickTileForHoe, 200); return; }
    var _prev = window.clickTile;
    window.clickTile = function (r, c) {
      /* Only intercept when hoe is active AND a size > 1 is desired */
      if (typeof G === 'undefined' || G.tool !== 'hoe') return _prev.apply(this, arguments);
      var size = _getDesiredHoeSize();
      if (size === 1) return _prev.apply(this, arguments); // delegate to base/tbu

      /* Multi-tile tilling with our chosen size */
      var GW_v = typeof GW !== 'undefined' ? GW : 14;
      var GH_v = typeof GH !== 'undefined' ? GH : 10;
      var fLv  = typeof getLevel === 'function' ? getLevel((G.skills && G.skills.farming && G.skills.farming.xp) || 0) : 1;
      var landTrees = [];
      if (typeof LAND_TREES !== 'undefined' && G.currentLand)
        landTrees = LAND_TREES[G.currentLand] || LAND_TREES.home || [];
      var treeKeys = new Set(landTrees.map(function (t) { return t[0]*100+t[1]; }));
      var offsets = _hoeOffsets(size);
      var count = 0, alreadyDone = 0;

      offsets.forEach(function (off) {
        var nr = r + off[0], nc = c + off[1];
        if (nr < 0 || nr >= GH_v || nc < 0 || nc >= GW_v) return;
        if (treeKeys.has(nr*100+nc)) return;
        var tile = G.farm[nr] && G.farm[nr][nc];
        if (!tile) return;
        if (tile.tilled) { alreadyDone++; return; }
        if (tile.deco) return;
        var newTile = Object.assign({}, tile, { tilled:true, idleDays:0, deco:null });
        if (fLv >= 10) newTile.watered = true;
        G.farm[nr][nc] = newTile;
        count++;
        if (fLv < 5 && typeof S !== 'undefined' && S.energyCost)
          G.energy = Math.max(0, G.energy - 0.35);
        if (typeof addXP === 'function') addXP('farming', 3);
      });

      if (count === 0) {
        if (alreadyDone > 0 && typeof toast === 'function') toast('Area already tilled!', 'info', 900);
        return;
      }
      if (typeof snd   === 'function') snd('till');
      if (typeof toast === 'function') toast('⚒ ' + size + '×' + size + ' tilled! (' + count + ' tiles)', 'success', 1300);
      if (typeof S !== 'undefined' && S.energyCost && G.energy < 0) G.energy = 0;
      if (typeof render === 'function') render();
    };
    console.log('[PatchV3] clickTile wrapped for flexible hoe sizes.');
  }
  _patchClickTileForHoe();

  /* ────────────────────────────────────────────────────────────────────
     SECTION 4  HOE PICKER MENU
     A visual panel showing four size buttons (+ fert switch).
     Opens when the Hoe tool is selected; closes on tool change.
  ──────────────────────────────────────────────────────────────────── */

  /* Build a mini NxN grid preview using divs */
  function _buildMiniGrid(n, cellPx) {
    var size = n * cellPx + (n-1)*2; // cell + gap
    var style = 'display:grid;grid-template-columns:repeat(' + n + ',1fr);gap:2px;' +
                'width:' + size + 'px;height:' + size + 'px;margin:0 auto 2px';
    var cells = '';
    for (var i = 0; i < n*n; i++)
      cells += '<div style="background:#d97706;border-radius:2px"></div>';
    return '<div style="' + style + '">' + cells + '</div>';
  }

  function _buildHoePicker() {
    if (document.getElementById('hoe-picker')) return;
    var el = document.createElement('div');
    el.id = 'hoe-picker';
    document.body.appendChild(el);
    _refreshHoePicker();
  }

  function _refreshHoePicker() {
    var el = document.getElementById('hoe-picker');
    if (!el) return;
    var upgs    = typeof curUpgs === 'function' ? curUpgs() : {};
    var has3    = (upgs.hoe_3x3 || 0) >= 1;
    var has4    = has3 && (upgs.hoe_4x4 || 0) >= 1;
    var current = (typeof G !== 'undefined' && G.hoeSize) ? G.hoeSize : 1;
    // Effective selection (capped)
    if (current === 4 && !has4) current = 3;
    if (current === 3 && !has3) current = Math.min(current, 2);

    var sizes = [1, 2, 3, 4];
    var labels = ['1×1', '2×2', '3×3', '4×4'];
    var locked  = [false, false, !has3, !has4];
    var cellPx  = [8, 7, 5, 4];

    var sizeHtml = sizes.map(function (n, i) {
      var sel = (current === n && !locked[i]) ? ' sel' : '';
      var lck = locked[i] ? ' locked' : '';
      var lockBadge = locked[i] ? '<span class="hp-lock-badge">🔒</span>' : '';
      return '<button class="hp-btn' + sel + lck + '" data-hoe-size="' + n + '">' +
               lockBadge +
               _buildMiniGrid(n, cellPx[i]) +
               '<span class="hp-btn-label">' + labels[i] + (locked[i] ? '<br><span style="font-size:7px;opacity:.6">upgrade needed</span>' : '') + '</span>' +
             '</button>';
    }).join('');

    var fertHtml = '<div class="hp-sep"></div>' +
      '<button class="hp-fert-btn" id="hp-fert-switch">' +
        '<span style="font-size:22px;line-height:1">🌿</span>' +
        '<span>Fert</span>' +
      '</button>';

    el.innerHTML = '<div id="hoe-picker-title">⛏ Hoe Size</div>' +
                   '<div class="hp-row">' + sizeHtml + fertHtml + '</div>';

    /* Bind size buttons */
    el.querySelectorAll('[data-hoe-size]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.classList.contains('locked')) {
          var upg = btn.dataset.hoeSize === '3' ? 'Hoe Upgrade' : 'Iron Head';
          if (typeof toast === 'function') toast('🔒 Requires ' + upg + '! Buy it in Upgrades tab.', 'warn', 2500);
          return;
        }
        if (typeof G !== 'undefined') G.hoeSize = parseInt(btn.dataset.hoeSize);
        el.querySelectorAll('[data-hoe-size]').forEach(function (b) { b.classList.remove('sel'); });
        btn.classList.add('sel');
        if (typeof toast === 'function') toast('⚒ Hoe: ' + btn.dataset.hoeSize + '×' + btn.dataset.hoeSize + ' area selected', 'info', 1200);
      });
    });

    /* Fert switch button */
    var fertBtn = document.getElementById('hp-fert-switch');
    if (fertBtn) {
      fertBtn.addEventListener('click', function () {
        _closeHoePicker();
        if (typeof setTool === 'function') setTool('fert');
        _setToolBtnFertMode(true);
      });
    }
  }

  function _openHoePicker() {
    _buildHoePicker();
    _refreshHoePicker();
    var el = document.getElementById('hoe-picker');
    if (!el) return;
    el.classList.add('hp-open');
  }

  function _closeHoePicker() {
    var el = document.getElementById('hoe-picker');
    if (!el) return;
    el.classList.remove('hp-open');
  }

  /* Change toolbar / dock Hoe button label for fert mode */
  function _setToolBtnFertMode(on) {
    /* PC toolbar button */
    var hoeBtn = document.getElementById('tool-hoe');
    if (hoeBtn) {
      if (on) {
        hoeBtn.dataset.origHtml = hoeBtn.innerHTML;
        hoeBtn.innerHTML = '🌿 Fert';
        hoeBtn.classList.add('fert-active');
      } else {
        if (hoeBtn.dataset.origHtml) hoeBtn.innerHTML = hoeBtn.dataset.origHtml;
        hoeBtn.classList.remove('fert-active');
      }
    }
    /* Mobile dock Hoe button */
    var dockHoe = document.getElementById('dock-hoe');
    if (dockHoe) {
      var icon  = dockHoe.querySelector('.dock-icon');
      var label = dockHoe.querySelector('.dock-label');
      if (on) {
        if (icon)  { icon.dataset.origText  = icon.textContent;  icon.textContent  = '🌿'; }
        if (label) { label.dataset.origText = label.textContent; label.textContent = 'Fert'; }
        dockHoe.classList.add('fert-active');
      } else {
        if (icon  && icon.dataset.origText)  icon.textContent  = icon.dataset.origText;
        if (label && label.dataset.origText) label.textContent = label.dataset.origText;
        dockHoe.classList.remove('fert-active');
      }
    }
  }

  /* Hook setTool to open/close picker and reset fert mode */
  function _hookSetToolForHoePicker() {
    if (typeof window.setTool !== 'function') { setTimeout(_hookSetToolForHoePicker, 150); return; }
    var _prev = window.setTool;
    window.setTool = function (t) {
      _prev.apply(this, arguments);
      if (t === 'hoe') {
        _openHoePicker();
        _setToolBtnFertMode(false); // reset fert mode if returning to hoe
      } else {
        _closeHoePicker();
        if (t !== 'fert') _setToolBtnFertMode(false); // non-fert tool clears fert state
      }
    };
    /* Also hook the PC toolbar Hoe button itself so a second click
       while hoe is active re-opens the picker cleanly */
    var _hookHoeBtn = function () {
      var btn = document.getElementById('tool-hoe');
      if (!btn) { setTimeout(_hookHoeBtn, 200); return; }
      btn.addEventListener('click', function () {
        /* setTool('hoe') already fired (via onclick), now open picker */
        if (typeof G !== 'undefined' && G.tool === 'hoe') _openHoePicker();
      });
    };
    _hookHoeBtn();
    /* Mobile dock Hoe button */
    var _hookDockHoe = function () {
      var dBtn = document.getElementById('dock-hoe');
      if (!dBtn) { setTimeout(_hookDockHoe, 300); return; }
      dBtn.addEventListener('click', function () {
        if (typeof G !== 'undefined' && G.tool === 'hoe') _openHoePicker();
        if (typeof G !== 'undefined' && G.tool === 'fert') {
          /* Re-clicking fert button returns to hoe */
          if (typeof setTool === 'function') setTool('hoe');
          _setToolBtnFertMode(false);
        }
      });
    };
    _hookDockHoe();
    console.log('[PatchV3] setTool hooked for hoe picker.');
  }
  _hookSetToolForHoePicker();

  /* Close hoe picker when tapping the farm grid on mobile */
  document.addEventListener('DOMContentLoaded', function () {
    var fw = document.getElementById('farm-wrap');
    if (fw) fw.addEventListener('click', function () { _closeHoePicker(); }, true);
  });

  /* Also update the hoe picker when upgrades change (after buyUpgrade) */
  function _hookBuyUpgradeForPicker() {
    if (typeof window.buyUpgrade !== 'function') { setTimeout(_hookBuyUpgradeForPicker, 200); return; }
    var _prev = window.buyUpgrade;
    window.buyUpgrade = function (id) {
      _prev.apply(this, arguments);
      if (id === 'hoe_3x3' || id === 'hoe_4x4') {
        setTimeout(_refreshHoePicker, 200);
      }
    };
  }
  _hookBuyUpgradeForPicker();

  /* ────────────────────────────────────────────────────────────────────
     SECTION 5  HOE AREA BADGE  (mirrors tbu.js badge but uses G.hoeSize)
  ──────────────────────────────────────────────────────────────────── */
  function _syncHoeBadge() {
    var hoeBtn = document.getElementById('tool-hoe');
    if (!hoeBtn) return;
    var size = _getDesiredHoeSize();
    var badge = document.getElementById('pv3-hoe-badge');
    if (size > 1) {
      if (!badge) {
        badge = document.createElement('span');
        badge.id = 'pv3-hoe-badge';
        badge.style.cssText = 'position:absolute;top:-5px;right:-5px;' +
          'font-size:8px;font-weight:900;background:#d97706;color:#fff;' +
          'border-radius:20px;padding:1px 5px;pointer-events:none;line-height:1.4;' +
          'box-shadow:0 1px 3px rgba(0,0,0,.25)';
        hoeBtn.style.position = 'relative';
        hoeBtn.appendChild(badge);
      }
      badge.textContent = size + '×' + size;
      badge.style.display = 'inline';
    } else if (badge) {
      badge.style.display = 'none';
    }
  }
  function _hookRenderForBadge() {
    if (typeof window.render !== 'function') { setTimeout(_hookRenderForBadge, 150); return; }
    var _prev = window.render;
    window.render = function () { _prev.apply(this, arguments); _syncHoeBadge(); };
  }
  _hookRenderForBadge();

  /* ────────────────────────────────────────────────────────────────────
     SECTION 6  CITY HUB OVERLAY
     Intercept openCityScreen to show an intermediate hub with
     "Stock Exchange" and "Jobs Board" options before entering.
  ──────────────────────────────────────────────────────────────────── */

  /* Build the hub overlay DOM (once) */
  function _buildCityHub() {
    if (document.getElementById('city-hub')) return;
    var el = document.createElement('div');
    el.id = 'city-hub';
    el.innerHTML = `
      <div class="chub-card">
        <div class="chub-title">🏙️ City District</div>
        <div class="chub-sub">What would you like to do in the city?</div>
        <div class="chub-btns">
          <button class="chub-btn chub-btn-market" id="chub-market">
            <span class="chub-btn-em">📊</span>
            Stock Exchange
          </button>
          <button class="chub-btn chub-btn-jobs" id="chub-jobs">
            <span class="chub-btn-em">💼</span>
            Jobs Board
          </button>
        </div>
        <button class="chub-close" id="chub-close">✕ Cancel</button>
      </div>`;
    document.body.appendChild(el);

    document.getElementById('chub-market').addEventListener('click', function () {
      _closeCityHub();
      _openCityScreenDirect('market');
    });
    document.getElementById('chub-jobs').addEventListener('click', function () {
      _closeCityHub();
      _openCityScreenDirect('jobs');
    });
    document.getElementById('chub-close').addEventListener('click', function () {
      _closeCityHub();
      /* Resume game */
      if (typeof paused !== 'undefined') window.paused = false;
    });
    /* Click backdrop to close */
    el.addEventListener('click', function (e) {
      if (e.target === el) {
        _closeCityHub();
        if (typeof paused !== 'undefined') window.paused = false;
      }
    });
  }

  function _openCityHub() {
    _buildCityHub();
    document.getElementById('city-hub').classList.add('chub-open');
    if (typeof paused !== 'undefined') window.paused = true;
  }
  function _closeCityHub() {
    var el = document.getElementById('city-hub');
    if (el) el.classList.remove('chub-open');
  }

  /* Direct open (bypasses hub) */
  function _openCityScreenDirect(tab) {
    if (typeof _ensureSM === 'function') _ensureSM();
    var el = document.getElementById('city-screen');
    if (el) el.classList.add('city-open');
    if (typeof _updateCityGold === 'function') _updateCityGold();
    if (typeof paused !== 'undefined') window.paused = true;
    /* Ensure Jobs tab button exists */
    _injectJobsTab();
    if (typeof setCityTab === 'function') setCityTab(tab || 'market');
  }

  /* Override openCityScreen to go through hub first */
  function _hookOpenCityScreen() {
    if (typeof window.openCityScreen !== 'function') { setTimeout(_hookOpenCityScreen, 200); return; }
    window.openCityScreen = function () {
      _openCityHub();
    };
    console.log('[PatchV3] openCityScreen replaced with city hub.');
  }
  _hookOpenCityScreen();

  /* ────────────────────────────────────────────────────────────────────
     SECTION 7  JOBS TAB INSIDE CITY SCREEN
     Injects a "💼 Jobs" tab button and handles its content via
     renderCityScreen.  Also removes Jobs section from buildShop.
  ──────────────────────────────────────────────────────────────────── */

  function _injectJobsTab() {
    if (document.getElementById('city-tab-jobs')) return;
    var tabs = document.querySelector('#city-screen .city-tabs');
    if (!tabs) return;
    var btn = document.createElement('button');
    btn.className = 'city-tab-btn';
    btn.id = 'city-tab-jobs';
    btn.dataset.ctab = 'jobs';
    btn.textContent = '💼 Jobs';
    btn.addEventListener('click', function () {
      if (typeof setCityTab === 'function') setCityTab('jobs');
    });
    tabs.appendChild(btn);
  }

  /* Patch renderCityScreen to handle the jobs tab */
  function _hookRenderCityScreen() {
    if (typeof window.renderCityScreen !== 'function') { setTimeout(_hookRenderCityScreen, 200); return; }
    var _prev = window.renderCityScreen;
    window.renderCityScreen = function (tab) {
      if (tab === 'jobs') {
        var body = document.getElementById('city-body');
        if (!body) return;
        /* Ensure Jobs tab button is visible */
        document.querySelectorAll('.city-tab-btn').forEach(function (b) {
          b.classList.toggle('active', b.dataset.ctab === 'jobs');
        });
        if (typeof _updateCityGold === 'function') _updateCityGold();
        body.innerHTML = _buildJobsCityHTML();
        /* Bind hire buttons */
        body.querySelectorAll('[data-hire-job]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            if (typeof window.hireJob === 'function') window.hireJob(btn.dataset.hireJob);
          });
        });
        return;
      }
      _prev.apply(this, arguments);
    };
    console.log('[PatchV3] renderCityScreen patched for jobs tab.');
  }
  _hookRenderCityScreen();

  function _buildJobsCityHTML() {
    if (typeof JOBS === 'undefined' || typeof G === 'undefined') {
      return '<div class="city-empty"><div class="city-empty-em">💼</div><div>Jobs Board unavailable</div></div>';
    }
    var curJob = G.job || null;
    var h = '<div class="city-market-header">' +
              '<div class="city-market-title">💼 Jobs Board</div>' +
            '</div>' +
            '<div class="city-jobs-intro">Hold one job at a time. Daily pay arrives each morning. ' +
            'Perks are active immediately after hiring.</div>';

    if (curJob) {
      var cj = JOBS[curJob];
      h += '<div style="padding:8px 11px;background:rgba(34,197,94,.08);border:1.5px solid rgba(34,197,94,.3);' +
           'border-radius:10px;font-size:11px;font-weight:700;color:#166534;margin-bottom:4px">' +
           '✅ Current Job: ' + (cj ? cj.e + ' ' + cj.n : curJob) + ' · ' +
           (cj ? '+' + cj.dailyPay + 'g/day' : '') + '</div>';
    }

    Object.entries(JOBS).forEach(function (entry) {
      var id = entry[0], job = entry[1];
      var isActive = (curJob === id);
      var canAfford = G && G.gold >= job.hireCost;
      h += '<div class="job-card' + (isActive ? ' job-card-active' : '') + '">';
      h += '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:3px">';
      h += '<span class="job-title">' + job.e + ' ' + job.n + '</span>';
      h += '<span class="job-pay">+' + job.dailyPay + 'g/day</span>';
      h += '</div>';
      if (isActive) h += '<span class="job-active-badge">✓ Active Job</span><br>';
      h += '<div class="job-desc">' + job.desc + '</div>';
      h += '<div class="job-perks">';
      job.perks.forEach(function (p) { h += '<div class="job-perk-item">' + p + '</div>'; });
      h += '</div>';
      if (job.hireCost > 0 && !isActive)
        h += '<div class="job-income-note">Equipment fee: ' + job.hireCost + 'g</div>';
      h += '<div class="job-btn-row">';
      if (isActive) {
        h += '<button class="job-quit-btn" onclick="quitJob();if(typeof setCityTab===\'function\')setCityTab(\'jobs\')">Quit Job</button>';
      } else {
        h += '<button class="job-hire-btn" data-hire-job="' + id + '"' + (canAfford ? '' : ' disabled') + '>';
        h += (job.hireCost > 0 ? 'Hire (' + job.hireCost + 'g)' : 'Take Job — Free') + '</button>';
      }
      h += '</div></div>';
    });
    return h;
  }

  /* Remove Jobs section from buildShop (it lives in the City now) */
  function _stripJobsFromShop() {
    if (typeof window.buildShop !== 'function') { setTimeout(_stripJobsFromShop, 200); return; }
    var _prev = window.buildShop;
    window.buildShop = function () {
      var html = _prev.apply(this, arguments);
      /* Remove everything from the Jobs Board heading onwards */
      var marker = html.indexOf('<div class="s-sec">💼 Jobs Board</div>');
      if (marker !== -1) html = html.substring(0, marker);
      return html;
    };
    console.log('[PatchV3] Jobs section removed from Shop tab.');
  }
  _stripJobsFromShop();

  /* Patch quitJob / hireJob to re-render the city jobs tab if open */
  function _hookJobActionsForCityRefresh() {
    ['quitJob', 'hireJob'].forEach(function (fn) {
      var _wait = setInterval(function () {
        if (typeof window[fn] !== 'function') return;
        clearInterval(_wait);
        var _prev = window[fn];
        window[fn] = function () {
          var ret = _prev.apply(this, arguments);
          /* If city screen is open on jobs tab, refresh */
          var cityEl = document.getElementById('city-screen');
          var activeTab = document.querySelector('#city-screen .city-tab-btn.active');
          if (cityEl && cityEl.classList.contains('city-open') &&
              activeTab && activeTab.dataset.ctab === 'jobs') {
            setTimeout(function () {
              if (typeof renderCityScreen === 'function') renderCityScreen('jobs');
            }, 150);
          }
          return ret;
        };
      }, 150);
    });
  }
  _hookJobActionsForCityRefresh();

  /* Ensure city hub is built and jobs tab injected when city screen first opens */
  function _waitForCityScreen() {
    var cs = document.getElementById('city-screen');
    if (!cs) { setTimeout(_waitForCityScreen, 300); return; }
    /* Observe city-open class */
    var _mo = new MutationObserver(function () {
      if (cs.classList.contains('city-open')) _injectJobsTab();
    });
    _mo.observe(cs, { attributes: true, attributeFilter: ['class'] });
  }
  _waitForCityScreen();

  /* ────────────────────────────────────────────────────────────────────
     DONE
  ──────────────────────────────────────────────────────────────────── */
  console.log('[PatchV3 v1.0] ✅ Loaded!\n' +
    '  · Mobile grid: fluid 14-column tiles (no gaps)\n' +
    '  · Hoe upgrades renamed: "Hoe Upgrade" (3×3) / "Iron Head" (4×4)\n' +
    '  · Hoe picker: 1×1, 2×2, 3×3, 4×4 + Fert switch\n' +
    '  · Toolbar Hoe btn shows Fert icon when Fert is active\n' +
    '  · City button → hub menu (Stock Exchange / Jobs Board)\n' +
    '  · Jobs Board added as city screen tab\n' +
    '  · Jobs removed from Shop tab');
})();
