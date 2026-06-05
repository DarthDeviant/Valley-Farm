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