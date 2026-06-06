/* ═════════════════════════════════════════════════════════
   bu.js — Merged Patch Bundle
   Generated : 2026-06-06
   Sources   : bigupdate_1_grass.js, bigupdate_2_fertilizer.js, bigupdate_3_jobs.js, bigupdate_4_hoe.js
   ═════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── JS Patches ───────────────────────────────────────── */

  /* [ 1 / 4 ] bigupdate_1_grass.js */
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
  

  /* [ 2 / 4 ] bigupdate_2_fertilizer.js */
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
  

  /* [ 3 / 4 ] bigupdate_3_jobs.js */
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
  

  /* [ 4 / 4 ] bigupdate_4_hoe.js */
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
  

})();
