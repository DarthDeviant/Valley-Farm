"tok-comment">/* ═════════════════════════════════════════════════════════
   bu.js — Merged Patch Bundle
   Generated : 2026-06-06
   Sources   : bigupdate_1_grass.js, bigupdate_2_fertilizer.js, bigupdate_3_jobs.js, bigupdate_4_hoe.js
   ═════════════════════════════════════════════════════════ */
("tok-keyword">function () {
  'use strict';

  "tok-comment">/* ── JS Patches ───────────────────────────────────────── */

  "tok-comment">/* [ 1 / 4 ] bigupdate_1_grass.js */
  "tok-comment">/* ═══════════════════════════════════════════════════════════════
     BIG UPDATE — Part 1: SEAMLESS GRASS FIELD  v1.0
     Removes the tile-grid look and makes the farm feel like a
     continuous, organic patch of land.
     ═══════════════════════════════════════════════════════════════ */
  ("tok-keyword">function () {
    'use strict';
  
    "tok-comment">/* ── CSS injection ─────────────────────────────────────────── */
    "tok-keyword">var style = document.createElement('style');
    style.id = 'bigupdate-grass-css';
    style.textContent = [
      "tok-comment">/* Collapse the 3px gap to 0 — tiles become adjacent */
      '#farm-grid { gap: 0 !important; border-radius: 12px; overflow: hidden; }',
      '#farm-wrap { border-radius: 14px; overflow: hidden;',
      '             box-shadow: 0 6px 28px rgba(0,0,0,0.22); }',
  
      "tok-comment">/* Remove borders / rounding from ALL tile types */
      '.tile, .tile-tree {',
      '  border: none !important;',
      '  border-radius: 0 !important;',
      '  box-shadow: none !important;',
      '}',
  
      "tok-comment">/* Hover: keep the brightness lift but drop the scale/border */
      '.tile:hover {',
      '  filter: brightness(1.22) !important;',
      '  transform: none !important;',
      '  z-index: 5;',
      '  box-shadow: inset 0 0 0 2px rgba(255,255,255,0.55) !important;',
      '}',
  
      "tok-comment">/* Grass micro-variations (class applied by JS below) */
      '.gv0 { filter: brightness(1.00) saturate(1.00); }',
      '.gv1 { filter: brightness(0.94) saturate(0.93); }',
      '.gv2 { filter: brightness(1.06) saturate(1.06); }',
      '.gv3 { filter: brightness(0.90) saturate(0.88); }',
      '.gv4 { filter: brightness(1.10) saturate(1.10); }',
      "tok-comment">/* hover on varied tiles — override the variation temporarily */
      '.gv0:hover, .gv1:hover, .gv2:hover, .gv3:hover, .gv4:hover {',
      '  filter: brightness(1.22) !important;',
      '}',
  
      "tok-comment">/* Tilled soil — inset shadow makes it look embedded in the ground */
      '.tile[data-tilled="1"] {',
      '  box-shadow: inset 0 3px 7px rgba(0,0,0,0.30),',
      '              inset 0 0 0 1px rgba(0,0,0,0.18) !important;',
      '  border-radius: 2px !important;',
      '}',
      '.tile[data-tilled="1"][data-watered="1"] {',
      '  box-shadow: inset 0 3px 9px rgba(0,0,0,0.42),',
      '              inset 0 0 0 1px rgba(30,10,0,0.28) !important;',
      '}',
  
      "tok-comment">/* Decorated tiles — subtle rounding so decos stand out */
      '.tile[data-deco="1"] {',
      '  border-radius: 4px !important;',
      '  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.10) !important;',
      '}',
  
      "tok-comment">/* Harvest-ready glow — nicer pulse */
      '.tile-ready {',
      '  animation: grassReadyPulse 1.6s ease-in-out infinite !important;',
      '}',
      '@keyframes grassReadyPulse {',
      '  0%,100% { filter: brightness(1.0); }',
      '  50%      { filter: brightness(1.20) drop-shadow(0 0 6px rgba(251,191,36,0.55)); }',
      '}',
  
      "tok-comment">/* Grass deco sprite — subtler so it reads as texture, not icon */
      '.grass-deco {',
      '  opacity: 0.38;',
      '  font-size: 15px;',
      '  filter: saturate(0.65);',
      '  pointer-events: none;',
      '  user-select: none;',
      '}',
  
      "tok-comment">/* Crop emoji transition */
      '.crop-em { transition: transform 0.18s ease; }',
    ].join('\n');
    document.head.appendChild(style);
  
    "tok-comment">/* ── Patch renderFarm ──────────────────────────────────────── */
    "tok-keyword">function applyGrassPatch() {
      "tok-keyword">if ("tok-keyword">typeof window.renderFarm !== 'function') {
        "tok-keyword">return "tok-keyword">setTimeout(applyGrassPatch, 150);
      }
      "tok-keyword">var _orig = window.renderFarm;
  
      window.renderFarm = "tok-keyword">function () {
        _orig.apply("tok-keyword">this, arguments);
  
        "tok-keyword">var grid = document.getElementById('farm-grid');
        "tok-keyword">if (!grid || "tok-keyword">typeof G === 'undefined' || !G.farm) "tok-keyword">return;
  
        "tok-keyword">var GW_v  = "tok-keyword">typeof GW !== 'undefined' ? GW : 14;
        "tok-keyword">var GH_v  = "tok-keyword">typeof GH !== 'undefined' ? GH : 10;
  
        "tok-comment">/* Build the set of tree-cell keys "tok-keyword">for the current land */
        "tok-keyword">var landTrees = [];
        "tok-keyword">if ("tok-keyword">typeof LAND_TREES !== 'undefined' && G.currentLand) {
          landTrees = LAND_TREES[G.currentLand] || LAND_TREES.home || [];
        } "tok-keyword">else "tok-keyword">if ("tok-keyword">typeof TREES !== 'undefined') {
          landTrees = TREES;
        }
        "tok-keyword">var treeKeys = "tok-keyword">new Set(landTrees.map("tok-keyword">function (t) { "tok-keyword">return t[0] * 100 + t[1]; }));
  
        "tok-keyword">var idx = 0;
        "tok-keyword">for ("tok-keyword">var r = 0; r < GH_v; r++) {
          "tok-keyword">for ("tok-keyword">var c = 0; c < GW_v; c++) {
            "tok-keyword">var el   = grid.children[idx++];
            "tok-keyword">if (!el) continue;
            "tok-keyword">var tkey = r * 100 + c;
  
            "tok-comment">/* Tree cells — no data attributes needed */
            "tok-keyword">if (treeKeys.has(tkey)) continue;
  
            "tok-keyword">var tile = G.farm[r] && G.farm[r][c];
            "tok-keyword">if (!tile) continue;
  
            "tok-comment">/* Stamp data attributes so CSS selectors work */
            el.dataset.tilled  = tile.tilled  ? '1' : '0';
            el.dataset.watered = tile.watered ? '1' : '0';
            el.dataset.deco    = tile.deco    ? '1' : '0';
  
            "tok-comment">/* Grass micro-variation — deterministic from position */
            "tok-keyword">if (!tile.tilled && !tile.deco) {
              "tok-keyword">var v = (r * 7 + c * 13 + r * c * 3) % 5;
              el.classList.add('gv' + v);
            }
          }
        }
      };
  
      console.log('[BIG UPDATE 1] Seamless Grass Field patch applied.');
    }
  
    applyGrassPatch();
  })();
  

  "tok-comment">/* [ 2 / 4 ] bigupdate_2_fertilizer.js */
  "tok-comment">/* ═══════════════════════════════════════════════════════════════
     BIG UPDATE — Part 2: FERTILIZER SYSTEM  v1.0
     Adds four fertilizer types buyable from the Shop (Town Supply).
     Apply to tilled soil with the 🌿 Fert tool — each type gives
     a different bonus: extra growth, speed, or bonus harvest yield.
     ═══════════════════════════════════════════════════════════════ */
  ("tok-keyword">function () {
    'use strict';
  
    "tok-comment">/* ── Fertilizer definitions ─────────────────────────────────── */
    "tok-keyword">var FERTILIZERS = {
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
  
    "tok-comment">/* Expose so other patches can read it */
    window.FERTILIZERS = FERTILIZERS;
  
    "tok-comment">/* ── CSS ────────────────────────────────────────────────────── */
    "tok-keyword">var css = document.createElement('style');
    css.textContent = [
      "tok-comment">/* Badge icon on fertilized tiles */
      '.fert-badge {',
      '  position:absolute; bottom:2px; right:2px;',
      '  font-size:10px; line-height:1; opacity:0.88;',
      '  pointer-events:none; user-select:none; z-index:4;',
      '  text-shadow:0 1px 2px rgba(0,0,0,0.5);',
      '}',
      "tok-comment">/* Shop fertilizer card accent */
      '.fert-card { border-left:3px solid #16a34a !important; }',
      '.fert-card:hover { border-color:#22c55e !important; }',
    ].join('\n');
    document.head.appendChild(css);
  
    "tok-comment">/* ── State helpers ──────────────────────────────────────────── */
    "tok-keyword">function ensureFertInv() {
      "tok-keyword">if ("tok-keyword">typeof G !== 'undefined' && !G.fertilizers) G.fertilizers = {};
    }
  
    "tok-comment">/* ── Patch initState ────────────────────────────────────────── */
    "tok-keyword">var _waitInit = "tok-keyword">setInterval("tok-keyword">function () {
      "tok-keyword">if ("tok-keyword">typeof window.initState !== 'function') "tok-keyword">return;
      "tok-keyword">clearInterval(_waitInit);
      "tok-keyword">var _orig = window.initState;
      window.initState = "tok-keyword">function () {
        _orig.apply("tok-keyword">this, arguments);
        "tok-keyword">if (G) G.fertilizers = {};
      };
    }, 100);
  
    "tok-comment">/* ── Patch loadState ────────────────────────────────────────── */
    "tok-keyword">var _waitLoad = "tok-keyword">setInterval("tok-keyword">function () {
      "tok-keyword">if ("tok-keyword">typeof window.loadState !== 'function') "tok-keyword">return;
      "tok-keyword">clearInterval(_waitLoad);
      "tok-keyword">var _orig = window.loadState;
      window.loadState = "tok-keyword">function (s) {
        _orig.apply("tok-keyword">this, arguments);
        "tok-keyword">if (G && !G.fertilizers) G.fertilizers = {};
      };
    }, 100);
  
    "tok-comment">/* ── Buy fertilizer (called by event binding in renderSide) ─── */
    window.buyFertilizer = "tok-keyword">function (id, qty) {
      "tok-keyword">var f = FERTILIZERS[id];
      "tok-keyword">if (!f) "tok-keyword">return;
      ensureFertInv();
      "tok-keyword">var cost = f.cost * qty;
      "tok-keyword">if (G.gold < cost) {
        "tok-keyword">if ("tok-keyword">typeof toast === 'function') toast('Need ' + cost + 'g! 💸', 'error');
        "tok-keyword">if ("tok-keyword">typeof snd  === 'function') snd('error');
        "tok-keyword">return;
      }
      G.gold -= cost;
      G.fertilizers[id] = (G.fertilizers[id] || 0) + qty;
      "tok-keyword">if ("tok-keyword">typeof snd   === 'function') snd('buy');
      "tok-keyword">if ("tok-keyword">typeof toast === 'function') toast('Bought ×' + qty + ' ' + f.n + '! ' + f.e, 'success');
      "tok-keyword">if ("tok-keyword">typeof render === 'function') render();
    };
  
    "tok-comment">/* ── Fertilizer section HTML ────────────────────────────────── */
    "tok-keyword">function buildFertSection() {
      ensureFertInv();
      "tok-keyword">var h = '<div class="s-sec">🌿 Fertilizers <span style="font-size:9px;font-weight:400;opacity:.6">(Town Supply)</span></div>';
      h += '<div style="font-size:10px;color:var(--text-muted);margin:-4px 0 7px;padding:0 2px">Select the 🌿 Fert tool then tap tilled soil to apply. Effects last until harvest.</div>';
      Object.entries(FERTILIZERS)."tok-keyword">forEach("tok-keyword">function (_ref) {
        "tok-keyword">var id = _ref[0], f = _ref[1];
        "tok-keyword">var have    = (G.fertilizers && G.fertilizers[id]) || 0;
        "tok-keyword">var cost1   = f.cost;
        "tok-keyword">var cost3   = f.cost * 3;
        "tok-keyword">var canBuy1 = G && G.gold >= cost1;
        "tok-keyword">var canBuy3 = G && G.gold >= cost3;
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
      "tok-keyword">return h;
    }
  
    "tok-comment">/* ── Patch buildShop to add fertilizer section ──────────────── */
    "tok-keyword">var _waitShop = "tok-keyword">setInterval("tok-keyword">function () {
      "tok-keyword">if ("tok-keyword">typeof window.buildShop !== 'function') "tok-keyword">return;
      "tok-keyword">clearInterval(_waitShop);
      "tok-keyword">var _orig = window.buildShop;
      window.buildShop = "tok-keyword">function () {
        "tok-keyword">var base = _orig.apply("tok-keyword">this, arguments);
        "tok-comment">/* Skip in winter — base already returns the auction screen */
        "tok-keyword">if ("tok-keyword">typeof season === 'function' && season() === 'Winter') "tok-keyword">return base;
        "tok-keyword">return base + buildFertSection();
      };
    }, 100);
  
    "tok-comment">/* ── Patch renderSide to bind fertilizer buy buttons ────────── */
    "tok-keyword">var _waitRS = "tok-keyword">setInterval("tok-keyword">function () {
      "tok-keyword">if ("tok-keyword">typeof window.renderSide !== 'function') "tok-keyword">return;
      "tok-keyword">clearInterval(_waitRS);
      "tok-keyword">var _origRS = window.renderSide;
      window.renderSide = "tok-keyword">function () {
        _origRS.apply("tok-keyword">this, arguments);
        ['side-content', 'sheet-content']."tok-keyword">forEach("tok-keyword">function (panelId) {
          "tok-keyword">var el = document.getElementById(panelId);
          "tok-keyword">if (!el) "tok-keyword">return;
          el.querySelectorAll('[data-buy-fert]')."tok-keyword">forEach("tok-keyword">function (btn) {
            btn.addEventListener('click', "tok-keyword">function () {
              window.buyFertilizer(btn.dataset.buyFert, +btn.dataset.qty || 1);
            });
          });
        });
        updateFertSel();
      };
    }, 100);
  
    "tok-comment">/* ── Fertilize tool button + select ─────────────────────────── */
    "tok-keyword">function injectFertTool() {
      "tok-keyword">if (document.getElementById('tool-fert')) "tok-keyword">return; "tok-comment">// already injected
      "tok-keyword">var seedBtn = document.getElementById('tool-seed');
      "tok-keyword">if (!seedBtn) "tok-keyword">return;
  
      "tok-keyword">var btn = document.createElement('button');
      btn.className = 'tool-btn';
      btn.id = 'tool-fert';
      btn.title = 'Apply Fertilizer to tilled soil';
      btn.textContent = '🌿 Fert';
      btn.addEventListener('click', "tok-keyword">function () {
        "tok-keyword">if ("tok-keyword">typeof setTool === 'function') setTool('fert');
      });
      seedBtn.insertAdjacentElement('afterend', btn);
  
      "tok-keyword">var sel = document.createElement('select');
      sel.id = 'fert-select';
      sel.style.cssText = 'display:none;font-size:11px;padding:4px 7px;border-radius:8px;border:1.5px solid var(--ui-border);background:var(--ui-bg);color:var(--text-primary);font-family:Nunito,sans-serif;font-weight:700';
      sel.addEventListener('change', "tok-keyword">function () {
        "tok-keyword">if ("tok-keyword">typeof G !== 'undefined') G.selectedFert = sel.value;
      });
      btn.insertAdjacentElement('afterend', sel);
      updateFertSel();
    }
  
    "tok-keyword">function updateFertSel() {
      "tok-keyword">var sel = document.getElementById('fert-select');
      "tok-keyword">if (!sel || "tok-keyword">typeof G === 'undefined') "tok-keyword">return;
      ensureFertInv();
      sel.innerHTML = Object.entries(FERTILIZERS).map("tok-keyword">function (_ref2) {
        "tok-keyword">var id = _ref2[0], f = _ref2[1];
        "tok-keyword">var have = (G.fertilizers && G.fertilizers[id]) || 0;
        "tok-keyword">return '<option value="' + id + '" ' + (have > 0 ? '' : 'disabled') + '>' +
               f.e + ' ' + f.n + ' (×' + have + ')</option>';
      }).join('');
      "tok-comment">/* Prefer current selection; fall back to first available */
      "tok-keyword">var avail = Object.keys(FERTILIZERS).find("tok-keyword">function (id) { "tok-keyword">return (G.fertilizers[id] || 0) > 0; });
      "tok-keyword">if (G.selectedFert && (G.fertilizers[G.selectedFert] || 0) > 0) {
        sel.value = G.selectedFert;
      } "tok-keyword">else "tok-keyword">if (avail) {
        G.selectedFert = avail; sel.value = avail;
      }
      sel.style.display = (G.tool === 'fert') ? 'inline-block' : 'none';
    }
  
    "tok-comment">/* ── Patch setTool "tok-keyword">for fert visibility ──────────────────────── */
    "tok-keyword">var _waitST = "tok-keyword">setInterval("tok-keyword">function () {
      "tok-keyword">if ("tok-keyword">typeof window.setTool !== 'function') "tok-keyword">return;
      "tok-keyword">clearInterval(_waitST);
      "tok-keyword">var _orig = window.setTool;
      window.setTool = "tok-keyword">function (t) {
        _orig.apply("tok-keyword">this, arguments);
        "tok-keyword">var fertBtn = document.getElementById('tool-fert');
        "tok-keyword">if (fertBtn) fertBtn.classList.toggle('active', t === 'fert');
        "tok-keyword">var fertSel = document.getElementById('fert-select');
        "tok-keyword">if (fertSel) fertSel.style.display = (t === 'fert') ? 'inline-block' : 'none';
        "tok-keyword">if (t === 'fert') updateFertSel();
      };
    }, 100);
  
    "tok-comment">/* ── Patch clickTile — handle 'fert' tool ───────────────────── */
    "tok-keyword">var _waitCT = "tok-keyword">setInterval("tok-keyword">function () {
      "tok-keyword">if ("tok-keyword">typeof window.clickTile !== 'function') "tok-keyword">return;
      "tok-keyword">clearInterval(_waitCT);
      "tok-keyword">var _origCT = window.clickTile;
      window.clickTile = "tok-keyword">function (r, c) {
        "tok-keyword">if ("tok-keyword">typeof G === 'undefined' || G.tool !== 'fert') {
          "tok-keyword">return _origCT.apply("tok-keyword">this, arguments);
        }
        "tok-keyword">if (G.energy <= 0) {
          "tok-keyword">if ("tok-keyword">typeof toast === 'function') toast('Too tired! 😴 Sleep to restore energy.', 'error');
          "tok-keyword">return;
        }
        "tok-keyword">var tile = G.farm[r][c];
        "tok-keyword">if (!tile.tilled) {
          "tok-keyword">if ("tok-keyword">typeof toast === 'function') toast('Till the soil first!', 'warn', 1200);
          "tok-keyword">return;
        }
        ensureFertInv();
        "tok-keyword">var fertId = (G.selectedFert && (G.fertilizers[G.selectedFert] || 0) > 0)
                    ? G.selectedFert : "tok-keyword">null;
        "tok-keyword">if (!fertId) {
          "tok-keyword">if ("tok-keyword">typeof toast === 'function') toast('No fertilizer! Buy some from the Shop tab. 🌿', 'warn');
          "tok-keyword">return;
        }
        "tok-keyword">if (tile.fertilizer) {
          "tok-keyword">var existing = FERTILIZERS[tile.fertilizer];
          "tok-keyword">if ("tok-keyword">typeof toast === 'function')
            toast('Already fertilized (' + (existing ? existing.n : tile.fertilizer) + ')!', 'info', 1200);
          "tok-keyword">return;
        }
        G.fertilizers[fertId]--;
        "tok-keyword">if (!G.fertilizers[fertId]) delete G.fertilizers[fertId];
        G.farm[r][c] = Object.assign({}, tile, { fertilizer: fertId });
        "tok-keyword">if ("tok-keyword">typeof S !== 'undefined' && S.energyCost) G.energy = Math.max(0, G.energy - 1);
        "tok-keyword">if ("tok-keyword">typeof snd   === 'function') snd('place');
        "tok-keyword">if ("tok-keyword">typeof toast === 'function')
          toast(FERTILIZERS[fertId].e + ' ' + FERTILIZERS[fertId].n + ' applied! 🌿', 'success', 1400);
        updateFertSel();
        "tok-keyword">if ("tok-keyword">typeof render === 'function') render();
      };
    }, 100);
  
    "tok-comment">/* ── Patch advanceFarmGrid — fertilizer growth bonuses ──────── */
    "tok-keyword">var _waitAFG = "tok-keyword">setInterval("tok-keyword">function () {
      "tok-keyword">if ("tok-keyword">typeof window.advanceFarmGrid !== 'function') "tok-keyword">return;
      "tok-keyword">clearInterval(_waitAFG);
      "tok-keyword">var _origAFG = window.advanceFarmGrid;
      window.advanceFarmGrid = "tok-keyword">function (farm, hasGreenhouse, hasSprinkler) {
        "tok-keyword">var result = _origAFG.apply("tok-keyword">this, arguments);
        "tok-comment">/* Apply fertilizer-specific growth boosts */
        "tok-keyword">for ("tok-keyword">var r = 0; r < result.length; r++) {
          "tok-keyword">for ("tok-keyword">var c = 0; c < result[r].length; c++) {
            "tok-keyword">var origTile = farm[r] && farm[r][c];
            "tok-keyword">var newTile  = result[r] && result[r][c];
            "tok-keyword">if (!origTile || !newTile || !origTile.fertilizer) continue;
            "tok-keyword">if (!newTile.crop) continue; "tok-comment">/* crop died / wrong season */
            "tok-keyword">var f = FERTILIZERS[origTile.fertilizer];
            "tok-keyword">if (!f) continue;
            "tok-comment">/* Carry fertilizer forward (it stays until crop is harvested) */
            newTile.fertilizer = origTile.fertilizer;
            "tok-comment">/* Only apply bonus on days the crop was watered */
            "tok-keyword">if (!origTile.watered) continue;
            "tok-keyword">var maxDays = ("tok-keyword">typeof CROPS !== 'undefined' && CROPS[newTile.crop.type])
                          ? CROPS[newTile.crop.type].days : 999;
            "tok-comment">/* Extra grow progress per watered day */
            "tok-keyword">if (f.growBonus > 0) {
              newTile.crop.days = Math.min(maxDays, (newTile.crop.days || 0) + f.growBonus);
            }
            "tok-comment">/* Speed-grow: one extra advance (net ×2 progress per day) */
            "tok-keyword">if (f.speedMult > 0) {
              newTile.crop.days = Math.min(maxDays, (newTile.crop.days || 0) + 1);
            }
          }
        }
        "tok-keyword">return result;
      };
    }, 100);
  
    "tok-comment">/* ── Patch clickTile scythe branch — mega fertilizer yield ──── */
    "tok-comment">/* We hook addXP indirectly: after harvest, "tok-keyword">if tile had mega fert
       we give an extra item to the bag. We do "tok-keyword">this by wrapping the
       scythe outcome inside clickTile (already wrapped above). */
    "tok-keyword">var _waitScythe = "tok-keyword">setInterval("tok-keyword">function () {
      "tok-keyword">if ("tok-keyword">typeof window.scytheAll !== 'function') "tok-keyword">return;
      "tok-keyword">clearInterval(_waitScythe);
      "tok-keyword">var _origSA = window.scytheAll;
      window.scytheAll = "tok-keyword">function () {
        "tok-comment">/* Before bulk harvest, credit mega-fert bonus items */
        "tok-keyword">if ("tok-keyword">typeof G !== 'undefined' && G.farm) {
          G.farm."tok-keyword">forEach("tok-keyword">function (row) {
            row."tok-keyword">forEach("tok-keyword">function (tile) {
              "tok-keyword">if (!tile.crop || !tile.fertilizer) "tok-keyword">return;
              "tok-keyword">var f = FERTILIZERS[tile.fertilizer];
              "tok-keyword">if (!f || !f.yieldBonus) "tok-keyword">return;
              "tok-keyword">if (Math.random() < f.yieldBonus) {
                tile._megaBonus = "tok-keyword">true;
              }
            });
          });
        }
        _origSA.apply("tok-keyword">this, arguments);
      };
    }, 100);
  
    "tok-comment">/* ── Patch renderFarm — show fertilizer badge on tiles ──────── */
    "tok-keyword">var _waitRF = "tok-keyword">setInterval("tok-keyword">function () {
      "tok-keyword">if ("tok-keyword">typeof window.renderFarm !== 'function') "tok-keyword">return;
      "tok-keyword">clearInterval(_waitRF);
      "tok-keyword">var _origRF = window.renderFarm;
      window.renderFarm = "tok-keyword">function () {
        _origRF.apply("tok-keyword">this, arguments);
        "tok-keyword">var grid = document.getElementById('farm-grid');
        "tok-keyword">if (!grid || "tok-keyword">typeof G === 'undefined' || !G.farm) "tok-keyword">return;
        "tok-keyword">var GW_v = "tok-keyword">typeof GW !== 'undefined' ? GW : 14;
        "tok-keyword">var GH_v = "tok-keyword">typeof GH !== 'undefined' ? GH : 10;
        "tok-keyword">var landTrees = [];
        "tok-keyword">if ("tok-keyword">typeof LAND_TREES !== 'undefined' && G.currentLand) {
          landTrees = LAND_TREES[G.currentLand] || LAND_TREES.home || [];
        }
        "tok-keyword">var treeKeys = "tok-keyword">new Set(landTrees.map("tok-keyword">function (t) { "tok-keyword">return t[0] * 100 + t[1]; }));
        "tok-keyword">var idx = 0;
        "tok-keyword">for ("tok-keyword">var r = 0; r < GH_v; r++) {
          "tok-keyword">for ("tok-keyword">var c = 0; c < GW_v; c++) {
            "tok-keyword">var el = grid.children[idx++];
            "tok-keyword">if (!el) continue;
            "tok-keyword">if (treeKeys.has(r * 100 + c)) continue;
            "tok-keyword">var tile = G.farm[r] && G.farm[r][c];
            "tok-keyword">if (!tile || !tile.fertilizer) continue;
            "tok-keyword">var f = FERTILIZERS[tile.fertilizer];
            "tok-keyword">if (!f) continue;
            "tok-keyword">var badge = document.createElement('span');
            badge.className = 'fert-badge';
            badge.textContent = f.e;
            badge.title = f.n + ' applied';
            el.appendChild(badge);
          }
        }
      };
    }, 100);
  
    "tok-comment">/* ── Inject tool button once toolbar is in DOM ──────────────── */
    "tok-keyword">var _toolInt = "tok-keyword">setInterval("tok-keyword">function () {
      "tok-keyword">if (document.getElementById('toolbar')) {
        injectFertTool();
        "tok-keyword">clearInterval(_toolInt);
      }
    }, 200);
  
    console.log('[BIG UPDATE 2] Fertilizer System loaded.');
  })();
  

  "tok-comment">/* [ 3 / 4 ] bigupdate_3_jobs.js */
  "tok-comment">/* ═══════════════════════════════════════════════════════════════
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
        desc:'Hire yourself out as a construction worker. Unlocks the "Till Field" button — tills every untilled grass tile on "tok-keyword">this farm in one click.',
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
        desc:'Scout terrain and forecast weather "tok-keyword">for local farms. Requires an 80g equipment fee. Shows tomorrow\'s weather each morning.',
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
      '  padding:10px 12px; background:"tok-keyword">var(--ui-bg2);',
      '  border:1.5px solid "tok-keyword">var(--ui-border); border-radius:13px;',
      '  margin-bottom:8px; transition:border-color .15s;',
      '}',
      '.job-card:hover { border-color:#86efac; }',
      '.job-card-active { border-color:#22c55e !important;',
      '  background:linear-gradient(135deg,rgba(34,197,94,.06),rgba(34,197,94,.02)) !important; }',
      '.job-title { font-size:13px; font-weight:800; color:"tok-keyword">var(--text-primary); }',
      '.job-pay   { font-size:11px; color:#16a34a; font-weight:700; }',
      '.job-desc  { font-size:10.5px; color:"tok-keyword">var(--text-muted); margin:4px 0 6px; line-height:1.5; }',
      '.job-perks { font-size:10px; color:"tok-keyword">var(--green); font-weight:700; margin-bottom:6px; }',
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
      '  font-size:9.5px; color:"tok-keyword">var(--text-muted); margin-top:4px; font-style:italic;',
      '}',
    ].join('\n');
    document.head.appendChild(css);
  
    /* ── State helpers ───────────────────────────────────────────── */
    function ensureJob() {
      if (typeof G !== '"tok-keyword">undefined' && G.job === undefined) G.job = null;
    }
  
    /* ── Patch initState ─────────────────────────────────────────── */
    var _wI = setInterval(function () {
      if (typeof window.initState !== '"tok-keyword">function') return;
      clearInterval(_wI);
      var _o = window.initState;
      window.initState = function () { _o.apply(this, arguments); if (G) G.job = null; };
    }, 100);
  
    /* ── Patch loadState ─────────────────────────────────────────── */
    var _wL = setInterval(function () {
      if (typeof window.loadState !== '"tok-keyword">function') return;
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
      if (G.job === id) { if (typeof toast === '"tok-keyword">function') toast('You already have "tok-keyword">this job!', 'warn'); return; }
      if (G.gold < job.hireCost) {
        if (typeof toast === '"tok-keyword">function') toast('Need ' + job.hireCost + 'g to take "tok-keyword">this job!', 'error');
        if (typeof snd === '"tok-keyword">function') snd('error');
        return;
      }
      if (G.job !== null) {
        /* Auto-quit old job */
        var oldJob = JOBS[G.job];
        if (typeof toast === '"tok-keyword">function' && oldJob)
          toast('Quit your ' + oldJob.n + ' job.', 'info', 2000);
      }
      G.gold -= job.hireCost;
      G.job = id;
      if (typeof snd   === '"tok-keyword">function') snd('buy');
      if (typeof toast === '"tok-keyword">function')
        toast(job.e + ' You\'re now a ' + job.n + '! ' + job.perkTag, 'success', 3500);
      updateTillAllBtn();
      "tok-keyword">if ("tok-keyword">typeof render === 'function') render();
    };
  
    window.quitJob = "tok-keyword">function () {
      ensureJob();
      "tok-keyword">if (!G.job) { "tok-keyword">if ("tok-keyword">typeof toast === 'function') toast('No job to quit!', 'info'); "tok-keyword">return; }
      "tok-keyword">var job = JOBS[G.job];
      G.job = "tok-keyword">null;
      "tok-keyword">if ("tok-keyword">typeof toast === 'function' && job)
        toast('You quit your ' + job.n + ' job. Good luck out there!', 'info', 2800);
      updateTillAllBtn();
      "tok-keyword">if ("tok-keyword">typeof render === 'function') render();
    };
  
    "tok-comment">/* ── Jobs Board HTML ─────────────────────────────────────────── */
    "tok-keyword">function buildJobsSection() {
      ensureJob();
      "tok-keyword">var curJob  = G.job;
      "tok-keyword">var h = '<div class="s-sec">💼 Jobs Board</div>';
      h += '<div style="font-size:10px;color:var(--text-muted);margin:-4px 0 7px;padding:0 2px">';
      h += 'Hold one job at a time. Daily pay arrives every morning with your sleep. Perks are active immediately.</div>';
  
      "tok-keyword">if (curJob) {
        "tok-keyword">var cj = JOBS[curJob];
        h += '<div style="padding:7px 10px;background:rgba(34,197,94,.08);border:1.5px solid rgba(34,197,94,.3);border-radius:10px;font-size:11px;font-weight:700;color:#16a34a;margin-bottom:8px">';
        h += cj.e + ' Currently employed as: <b>' + cj.n + '</b>';
        h += '<br><span style="font-weight:400;font-size:10px;color:var(--text-muted)">+' + cj.dailyPay + 'g/day · ' + cj.perkTag + '</span>';
        h += '</div>';
      }
  
      Object.values(JOBS)."tok-keyword">forEach("tok-keyword">function (job) {
        "tok-keyword">var isActive  = (curJob === job.id);
        "tok-keyword">var canAfford = G && G.gold >= job.hireCost;
        h += '<div class="job-card' + (isActive ? ' job-card-active' : '') + '">';
        h += '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:3px">';
        h += '<span class="job-title">' + job.e + ' ' + job.n + '</span>';
        h += '<span class="job-pay">+' + job.dailyPay + 'g/day</span>';
        h += '</div>';
        "tok-keyword">if (isActive) h += '<span class="job-active-badge">✓ Active Job</span><br>';
        h += '<div class="job-desc">' + job.desc + '</div>';
        h += '<div class="job-perks">';
        job.perks."tok-keyword">forEach("tok-keyword">function (p) {
          h += '<div class="job-perk-item">' + p + '</div>';
        });
        h += '</div>';
        "tok-keyword">if (job.hireCost > 0 && !isActive) {
          h += '<div class="job-income-note">Hire fee: ' + job.hireCost + 'g (equipment cost)</div>';
        }
        h += '<div class="job-btn-row">';
        "tok-keyword">if (isActive) {
          h += '<button class="job-quit-btn" onclick="quitJob()">Quit Job</button>';
        } "tok-keyword">else {
          h += '<button class="job-hire-btn" data-hire-job="' + job.id + '"' + (canAfford ? '' : ' disabled') + '>';
          h += (job.hireCost > 0 ? 'Hire (' + job.hireCost + 'g)' : 'Take Job — Free') + '</button>';
        }
        h += '</div>';
        h += '</div>';
      });
      "tok-keyword">return h;
    }
  
    "tok-comment">/* ── Patch buildShop ─────────────────────────────────────────── */
    "tok-keyword">var _wS = "tok-keyword">setInterval("tok-keyword">function () {
      "tok-keyword">if ("tok-keyword">typeof window.buildShop !== 'function') "tok-keyword">return;
      "tok-keyword">clearInterval(_wS);
      "tok-keyword">var _o = window.buildShop;
      window.buildShop = "tok-keyword">function () {
        "tok-keyword">return _o.apply("tok-keyword">this, arguments) + buildJobsSection();
      };
    }, 100);
  
    "tok-comment">/* ── Bind job hire buttons in renderSide ─────────────────────── */
    "tok-keyword">var _wRS = "tok-keyword">setInterval("tok-keyword">function () {
      "tok-keyword">if ("tok-keyword">typeof window.renderSide !== 'function') "tok-keyword">return;
      "tok-keyword">clearInterval(_wRS);
      "tok-keyword">var _o = window.renderSide;
      window.renderSide = "tok-keyword">function () {
        _o.apply("tok-keyword">this, arguments);
        ['side-content', 'sheet-content']."tok-keyword">forEach("tok-keyword">function (panelId) {
          "tok-keyword">var el = document.getElementById(panelId);
          "tok-keyword">if (!el) "tok-keyword">return;
          el.querySelectorAll('[data-hire-job]')."tok-keyword">forEach("tok-keyword">function (btn) {
            btn.addEventListener('click', "tok-keyword">function () { window.hireJob(btn.dataset.hireJob); });
          });
        });
      };
    }, 100);
  
    "tok-comment">/* ── Patch doSleep — award daily job pay ─────────────────────── */
    "tok-keyword">var _wSleep = "tok-keyword">setInterval("tok-keyword">function () {
      "tok-keyword">if ("tok-keyword">typeof window.doSleep !== 'function') "tok-keyword">return;
      "tok-keyword">clearInterval(_wSleep);
      "tok-keyword">var _o = window.doSleep;
      window.doSleep = "tok-keyword">function () {
        ensureJob();
        "tok-comment">/* Inject job pay into the morning-message queue after base sleep */
        "tok-keyword">var ret = _o.apply("tok-keyword">this, arguments);
        "tok-keyword">if (G.job) {
          "tok-keyword">var job = JOBS[G.job];
          "tok-keyword">if (job) {
            "tok-comment">/* Pay is credited by patching advanceDay, but we show the toast here */
            "tok-keyword">setTimeout("tok-keyword">function () {
              "tok-keyword">if ("tok-keyword">typeof toast === 'function')
                toast(job.e + ' Job pay: +' + job.dailyPay + 'g (' + job.n + ')', 'success', 2800);
            }, 2800);
          }
        }
        "tok-keyword">return ret;
      };
    }, 100);
  
    "tok-comment">/* ── Patch advanceDay — actually add the gold ────────────────── */
    "tok-keyword">var _wAD = "tok-keyword">setInterval("tok-keyword">function () {
      "tok-keyword">if ("tok-keyword">typeof window.advanceDay !== 'function') "tok-keyword">return;
      "tok-keyword">clearInterval(_wAD);
      "tok-keyword">var _o = window.advanceDay;
      window.advanceDay = "tok-keyword">function () {
        _o.apply("tok-keyword">this, arguments);
        ensureJob();
        "tok-keyword">if (G.job) {
          "tok-keyword">var job = JOBS[G.job];
          "tok-keyword">if (job) {
            G.gold += job.dailyPay;
            G.stats.earned = (G.stats.earned || 0) + job.dailyPay;
          }
          "tok-comment">/* Field Scout: reveal weather forecast */
          "tok-keyword">if (G.job === 'scout') {
            "tok-keyword">var rainChance = {Spring:0.28,Summer:0.22,Fall:0.10,Winter:0}[
              "tok-keyword">typeof season === 'function' ? season() : 'Spring'] || 0.22;
            "tok-keyword">var likelyRain = Math.random() < rainChance;
            G._scoutForecast = likelyRain ? 'rainy' : 'sunny';
          }
        }
      };
    }, 100);
  
    "tok-comment">/* ── Patch shipAll and auction "tok-keyword">for Delivery Driver bonus ──────── */
    "tok-keyword">var _wShip = "tok-keyword">setInterval("tok-keyword">function () {
      "tok-keyword">if ("tok-keyword">typeof window.shipAll !== 'function' || "tok-keyword">typeof window.auctionSell !== 'function') "tok-keyword">return;
      "tok-keyword">clearInterval(_wShip);
  
      "tok-comment">/* shipAll bonus */
      "tok-keyword">var _oShip = window.shipAll;
      window.shipAll = "tok-keyword">function () {
        _oShip.apply("tok-keyword">this, arguments);
        ensureJob();
        "tok-keyword">if (G.job === 'driver' && G.pending > 0) {
          "tok-keyword">var bonus = Math.round(G.pending * 0.12);
          G.pending += bonus;
          "tok-keyword">if ("tok-keyword">typeof toast === 'function')
            "tok-keyword">setTimeout("tok-keyword">function () { toast('🚚 Driver bonus: +' + bonus + 'g on shipping!', 'success', 2200); }, 400);
        }
      };
  
      "tok-comment">/* auctionSell bonus */
      "tok-keyword">var _oAuct = window.auctionSell;
      window.auctionSell = "tok-keyword">function (type, qty) {
        ensureJob();
        "tok-keyword">if (G.job !== 'driver') { _oAuct.apply("tok-keyword">this, arguments); "tok-keyword">return; }
        "tok-comment">/* Call original, then add 12% on top */
        "tok-keyword">var goldBefore = G.gold;
        _oAuct.apply("tok-keyword">this, arguments);
        "tok-keyword">var earned = G.gold - goldBefore;
        "tok-keyword">if (earned > 0) {
          "tok-keyword">var bonus = Math.round(earned * 0.12);
          G.gold += bonus;
          G.stats.earned = (G.stats.earned || 0) + bonus;
          "tok-keyword">if ("tok-keyword">typeof toast === 'function')
            "tok-keyword">setTimeout("tok-keyword">function () { toast('🚚 Driver bonus: +' + bonus + 'g!', 'success', 1800); }, 400);
        }
      };
    }, 100);
  
    "tok-comment">/* ── Patch addXP "tok-keyword">for Gardener +20% bonus ─────────────────────── */
    "tok-keyword">var _wXP = "tok-keyword">setInterval("tok-keyword">function () {
      "tok-keyword">if ("tok-keyword">typeof window.addXP !== 'function') "tok-keyword">return;
      "tok-keyword">clearInterval(_wXP);
      "tok-keyword">var _o = window.addXP;
      window.addXP = "tok-keyword">function (skill, amount) {
        ensureJob();
        "tok-keyword">var finalAmount = amount;
        "tok-keyword">if (G.job === 'gardener') {
          finalAmount = Math.round(amount * 1.20);
        }
        _o.call("tok-keyword">this, skill, finalAmount);
      };
    }, 100);
  
    "tok-comment">/* ── Construction Worker: "Till Field" button ────────────────── */
    "tok-keyword">function tillEntireField() {
      ensureJob();
      "tok-keyword">if (G.job !== 'construction') {
        "tok-keyword">if ("tok-keyword">typeof toast === 'function') toast('You need to be a Construction Worker!', 'warn'); "tok-keyword">return;
      }
      "tok-keyword">if (G.energy < 15) {
        "tok-keyword">if ("tok-keyword">typeof toast === 'function') toast('Not enough energy! Need 15 energy.', 'error');
        "tok-keyword">if ("tok-keyword">typeof snd === 'function') snd('error');
        "tok-keyword">return;
      }
      "tok-keyword">var GW_v = "tok-keyword">typeof GW !== 'undefined' ? GW : 14;
      "tok-keyword">var GH_v = "tok-keyword">typeof GH !== 'undefined' ? GH : 10;
      "tok-keyword">var landTrees = [];
      "tok-keyword">if ("tok-keyword">typeof LAND_TREES !== 'undefined' && G.currentLand) {
        landTrees = LAND_TREES[G.currentLand] || LAND_TREES.home || [];
      }
      "tok-keyword">var treeKeys = "tok-keyword">new Set(landTrees.map("tok-keyword">function (t) { "tok-keyword">return t[0] * 100 + t[1]; }));
      "tok-keyword">var fLv = "tok-keyword">typeof getLevel === 'function' ? getLevel((G.skills && G.skills.farming && G.skills.farming.xp) || 0) : 1;
      "tok-keyword">var count = 0;
      "tok-keyword">for ("tok-keyword">var r = 0; r < GH_v; r++) {
        "tok-keyword">for ("tok-keyword">var c = 0; c < GW_v; c++) {
          "tok-keyword">if (treeKeys.has(r * 100 + c)) continue;
          "tok-keyword">var tile = G.farm[r][c];
          "tok-keyword">if (tile.tilled || tile.deco || tile.crop) continue;
          "tok-keyword">var newTile = Object.assign({}, tile, { tilled: "tok-keyword">true, idleDays: 0, deco: "tok-keyword">null });
          "tok-keyword">if (fLv >= 10) newTile.watered = "tok-keyword">true;
          G.farm[r][c] = newTile;
          count++;
        }
      }
      "tok-keyword">if (count === 0) {
        "tok-keyword">if ("tok-keyword">typeof toast === 'function') toast('All tillable soil is already tilled!', 'info'); "tok-keyword">return;
      }
      "tok-keyword">if ("tok-keyword">typeof S !== 'undefined' && S.energyCost) G.energy = Math.max(0, G.energy - 15);
      "tok-keyword">if ("tok-keyword">typeof addXP === 'function') addXP('farming', Math.round(count * 2.5));
      "tok-keyword">if ("tok-keyword">typeof snd   === 'function') snd('till');
      "tok-keyword">if ("tok-keyword">typeof toast === 'function')
        toast('👷 Tilled ' + count + ' tiles! Great work! ⛏', 'success', 2400);
      "tok-keyword">if ("tok-keyword">typeof render === 'function') render();
    }
    window.tillEntireField = tillEntireField;
  
    "tok-keyword">function updateTillAllBtn() {
      "tok-keyword">var btn = document.getElementById('tool-tillall');
      "tok-keyword">if (!btn) "tok-keyword">return;
      ensureJob();
      btn.style.display = (G.job === 'construction') ? 'inline-flex' : 'none';
    }
  
    "tok-keyword">function injectTillAllBtn() {
      "tok-keyword">if (document.getElementById('tool-tillall')) "tok-keyword">return;
      "tok-keyword">var scytheBtn = document.getElementById('tool-scythe');
      "tok-keyword">if (!scytheBtn) "tok-keyword">return;
      "tok-keyword">var btn = document.createElement('button');
      btn.className = 'tool-btn';
      btn.id = 'tool-tillall';
      btn.title = 'Construction Worker: Till entire farm in one go';
      btn.textContent = '⚒ Till Field';
      btn.style.display = 'none';
      btn.addEventListener('click', tillEntireField);
      scytheBtn.insertAdjacentElement('afterend', btn);
    }
  
    "tok-comment">/* ── Patch render — sync Till Field button visibility ─────────── */
    "tok-keyword">var _wR = "tok-keyword">setInterval("tok-keyword">function () {
      "tok-keyword">if ("tok-keyword">typeof window.render !== 'function') "tok-keyword">return;
      "tok-keyword">clearInterval(_wR);
      "tok-keyword">var _o = window.render;
      window.render = "tok-keyword">function () {
        _o.apply("tok-keyword">this, arguments);
        updateTillAllBtn();
        "tok-comment">/* Scout forecast pill in HUD */
        "tok-keyword">if (G.job === 'scout' && G._scoutForecast) {
          "tok-keyword">var hud = document.getElementById('hud-weather');
          "tok-keyword">if (hud && hud.parentElement) {
            "tok-keyword">var pip = hud.parentElement.querySelector('.scout-tomorrow');
            "tok-keyword">if (!pip) {
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
  
    "tok-comment">/* ── Inject button once DOM is ready ────────────────────────── */
    "tok-keyword">var _tbInt = "tok-keyword">setInterval("tok-keyword">function () {
      "tok-keyword">if (document.getElementById('toolbar')) {
        injectTillAllBtn();
        "tok-keyword">clearInterval(_tbInt);
      }
    }, 200);
  
    console.log('[BIG UPDATE 3] Jobs System loaded.');
  })();
  

  "tok-comment">/* [ 4 / 4 ] bigupdate_4_hoe.js */
  "tok-comment">/* ═══════════════════════════════════════════════════════════════
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
    "tok-comment">/* UPGRADES is declared with "tok-string">`"tok-keyword">const` in script.js but it is an
       object, so adding properties is legal.                        */
    "tok-keyword">var _waitUpgrades = "tok-keyword">setInterval("tok-keyword">function () {
      "tok-keyword">if ("tok-keyword">typeof UPGRADES === 'undefined') "tok-keyword">return;
      "tok-keyword">clearInterval(_waitUpgrades);
  
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
  
    "tok-comment">/* ── Prerequisite check — block hoe_4x4 without hoe_3x3 ──────── */
    "tok-keyword">var _waitBU = "tok-keyword">setInterval("tok-keyword">function () {
      "tok-keyword">if ("tok-keyword">typeof window.buyUpgrade !== 'function') "tok-keyword">return;
      "tok-keyword">clearInterval(_waitBU);
      "tok-keyword">var _orig = window.buyUpgrade;
      window.buyUpgrade = "tok-keyword">function (id) {
        "tok-keyword">if (id === 'hoe_4x4') {
          "tok-keyword">var upgs = "tok-keyword">typeof curUpgs === 'function' ? curUpgs() : {};
          "tok-keyword">if (!(upgs.hoe_3x3 >= 1)) {
            "tok-keyword">if ("tok-keyword">typeof toast === 'function')
              toast('🔒 Buy the Iron Hoe Head (3×3) first!', 'warn', 2800);
            "tok-keyword">if ("tok-keyword">typeof snd === 'function') snd('error');
            "tok-keyword">return;
          }
        }
        _orig.apply("tok-keyword">this, arguments);
      };
      console.log('[BIG UPDATE 4] buyUpgrade prerequisite check applied.');
    }, 100);
  
    "tok-comment">/* ── CSS ─────────────────────────────────────────────────────── */
    "tok-keyword">var css = document.createElement('style');
    css.textContent = [
      "tok-comment">/* Hover-preview highlight "tok-keyword">for multi-tile hoe area */
      '.hoe-preview {',
      '  outline: 2.5px dashed rgba(251,146,60,0.80) !important;',
      '  outline-offset: -2px;',
      '  background-color: rgba(251,146,60,0.14) !important;',
      '  z-index: 4;',
      '}',
      "tok-comment">/* Corner badge on hoe tool button showing current area */
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
  
    "tok-comment">/* ── Helper: get current hoe size ───────────────────────────── */
    "tok-keyword">function getHoeSize() {
      "tok-keyword">if ("tok-keyword">typeof curUpgs !== 'function') "tok-keyword">return 1;
      "tok-keyword">var upgs = curUpgs();
      "tok-keyword">if ((upgs.hoe_4x4 || 0) >= 1 && (upgs.hoe_3x3 || 0) >= 1) "tok-keyword">return 4;
      "tok-keyword">if ((upgs.hoe_3x3 || 0) >= 1) "tok-keyword">return 3;
      "tok-keyword">return 1;
    }
  
    "tok-comment">/* ── Helper: get tile offsets "tok-keyword">for a given size & center ──────── */
    "tok-keyword">function getHoeOffsets(size) {
      "tok-comment">/* 1×1 → just [0,0]
         3×3 → -1..+1  (center is clicked tile)
         4×4 → -1..+2  (clicked tile at top-left quadrant) */
      "tok-keyword">var arr = [];
      "tok-keyword">var range = size === 4 ? [-1, 0, 1, 2] : size === 3 ? [-1, 0, 1] : [0];
      "tok-keyword">for ("tok-keyword">var i = 0; i < range.length; i++) {
        "tok-keyword">for ("tok-keyword">var j = 0; j < range.length; j++) {
          arr.push([range[i], range[j]]);
        }
      }
      "tok-keyword">return arr;
    }
  
    "tok-comment">/* ── Patch clickTile — multi-tile hoe ────────────────────────── */
    "tok-keyword">var _waitCT = "tok-keyword">setInterval("tok-keyword">function () {
      "tok-keyword">if ("tok-keyword">typeof window.clickTile !== 'function') "tok-keyword">return;
      "tok-keyword">clearInterval(_waitCT);
      "tok-keyword">var _orig = window.clickTile;
      window.clickTile = "tok-keyword">function (r, c) {
        "tok-comment">/* Only intercept Hoe with an area upgrade */
        "tok-keyword">if ("tok-keyword">typeof G === 'undefined' || G.tool !== 'hoe') {
          "tok-keyword">return _orig.apply("tok-keyword">this, arguments);
        }
        "tok-keyword">var size = getHoeSize();
        "tok-keyword">if (size === 1) {
          "tok-keyword">return _orig.apply("tok-keyword">this, arguments);  "tok-comment">/* no upgrade — use default */
        }
  
        "tok-comment">/* ---- Multi-tile tilling ----------------------------------- */
        "tok-keyword">var GW_v = "tok-keyword">typeof GW !== 'undefined' ? GW : 14;
        "tok-keyword">var GH_v = "tok-keyword">typeof GH !== 'undefined' ? GH : 10;
        "tok-keyword">var landTrees = [];
        "tok-keyword">if ("tok-keyword">typeof LAND_TREES !== 'undefined' && G.currentLand) {
          landTrees = LAND_TREES[G.currentLand] || LAND_TREES.home || [];
        }
        "tok-keyword">var treeKeys = "tok-keyword">new Set(landTrees.map("tok-keyword">function (t) { "tok-keyword">return t[0] * 100 + t[1]; }));
        "tok-keyword">var fLv = "tok-keyword">typeof getLevel === 'function'
          ? getLevel((G.skills && G.skills.farming && G.skills.farming.xp) || 0)
          : 1;
        "tok-keyword">var offsets = getHoeOffsets(size);
        "tok-keyword">var count = 0;
        "tok-keyword">var alreadyDone = 0;
  
        offsets."tok-keyword">forEach("tok-keyword">function (off) {
          "tok-keyword">var nr = r + off[0], nc = c + off[1];
          "tok-keyword">if (nr < 0 || nr >= GH_v || nc < 0 || nc >= GW_v) "tok-keyword">return;
          "tok-keyword">if (treeKeys.has(nr * 100 + nc)) "tok-keyword">return;
          "tok-keyword">var tile = G.farm[nr][nc];
          "tok-keyword">if (tile.tilled) { alreadyDone++; "tok-keyword">return; }
          "tok-keyword">if (tile.deco)   "tok-keyword">return;
          "tok-keyword">var newTile = Object.assign({}, tile, { tilled:"tok-keyword">true, idleDays:0, deco:"tok-keyword">null });
          "tok-keyword">if (fLv >= 10) newTile.watered = "tok-keyword">true;
          G.farm[nr][nc] = newTile;
          count++;
          "tok-comment">/* Reduced energy cost per tile: area tools cost less */
          "tok-keyword">if (fLv < 5 && "tok-keyword">typeof S !== 'undefined' && S.energyCost) {
            G.energy = Math.max(0, G.energy - 0.4);
          }
          "tok-comment">/* XP: slightly less per tile to balance the efficiency */
          "tok-keyword">if ("tok-keyword">typeof addXP === 'function') addXP('farming', 3);
        });
  
        "tok-keyword">if (count === 0) {
          "tok-keyword">if (alreadyDone > 0) {
            "tok-keyword">if ("tok-keyword">typeof toast === 'function') toast('Area already tilled!', 'info', 900);
          }
          "tok-keyword">return;
        }
  
        "tok-keyword">if ("tok-keyword">typeof snd === 'function') snd('till');
        "tok-keyword">var label = size + '×' + size;
        "tok-keyword">if ("tok-keyword">typeof toast === 'function')
          toast('⚒️ ' + label + ' area tilled! (' + count + ' tiles)', 'success', 1400);
  
        "tok-comment">/* Clamp energy floor */
        "tok-keyword">if ("tok-keyword">typeof S !== 'undefined' && S.energyCost && G.energy < 0) G.energy = 0;
  
        "tok-keyword">if ("tok-keyword">typeof render === 'function') render();
      };
      console.log('[BIG UPDATE 4] Multi-tile hoe clickTile patch applied.');
    }, 100);
  
    "tok-comment">/* ── Hoe-preview: highlight affected tiles on mouse-over ─────── */
    "tok-keyword">var _previewActive = "tok-keyword">false;
    "tok-keyword">var _previewTiles  = [];
  
    "tok-keyword">function clearPreview() {
      _previewTiles."tok-keyword">forEach("tok-keyword">function (el) { el.classList.remove('hoe-preview'); });
      _previewTiles = [];
      _previewActive = "tok-keyword">false;
    }
  
    "tok-keyword">function showPreview(r, c) {
      clearPreview();
      "tok-keyword">if ("tok-keyword">typeof G === 'undefined' || G.tool !== 'hoe') "tok-keyword">return;
      "tok-keyword">var size = getHoeSize();
      "tok-keyword">if (size === 1) "tok-keyword">return;
      "tok-keyword">var GW_v = "tok-keyword">typeof GW !== 'undefined' ? GW : 14;
      "tok-keyword">var GH_v = "tok-keyword">typeof GH !== 'undefined' ? GH : 10;
      "tok-keyword">var grid = document.getElementById('farm-grid');
      "tok-keyword">if (!grid) "tok-keyword">return;
      "tok-comment">/* Build tree key set */
      "tok-keyword">var landTrees = [];
      "tok-keyword">if ("tok-keyword">typeof LAND_TREES !== 'undefined' && G.currentLand) {
        landTrees = LAND_TREES[G.currentLand] || LAND_TREES.home || [];
      }
      "tok-keyword">var treeKeys = "tok-keyword">new Set(landTrees.map("tok-keyword">function (t) { "tok-keyword">return t[0] * 100 + t[1]; }));
      "tok-keyword">var offsets = getHoeOffsets(size);
      offsets."tok-keyword">forEach("tok-keyword">function (off) {
        "tok-keyword">var nr = r + off[0], nc = c + off[1];
        "tok-keyword">if (nr < 0 || nr >= GH_v || nc < 0 || nc >= GW_v) "tok-keyword">return;
        "tok-keyword">if (treeKeys.has(nr * 100 + nc)) "tok-keyword">return;
        "tok-keyword">var tile = G.farm[nr] && G.farm[nr][nc];
        "tok-keyword">if (!tile || tile.tilled || tile.deco) "tok-keyword">return;
        "tok-comment">/* Tile index in the grid */
        "tok-keyword">var idx = nr * GW_v + nc;
        "tok-comment">/* Count tree tiles before "tok-keyword">this index */
        "tok-keyword">var treesBefore = 0;
        landTrees."tok-keyword">forEach("tok-keyword">function (t) {
          "tok-keyword">if (t[0] * GW_v + t[1] < idx) treesBefore++;
        });
        "tok-keyword">var el = grid.children[idx];
        "tok-keyword">if (el && !el.classList.contains('tile-tree')) {
          el.classList.add('hoe-preview');
          _previewTiles.push(el);
          _previewActive = "tok-keyword">true;
        }
      });
    }
  
    "tok-comment">/* Attach hover listeners after renderFarm rebuilds the grid */
    "tok-keyword">function attachHoverListeners() {
      "tok-keyword">var grid = document.getElementById('farm-grid');
      "tok-keyword">if (!grid) "tok-keyword">return;
      "tok-keyword">var GW_v = "tok-keyword">typeof GW !== 'undefined' ? GW : 14;
      "tok-keyword">var GH_v = "tok-keyword">typeof GH !== 'undefined' ? GH : 10;
      "tok-keyword">var landTrees = [];
      "tok-keyword">if ("tok-keyword">typeof LAND_TREES !== 'undefined' && G && G.currentLand) {
        landTrees = LAND_TREES[G.currentLand] || LAND_TREES.home || [];
      }
      "tok-keyword">var treeKeys = "tok-keyword">new Set(landTrees.map("tok-keyword">function (t) { "tok-keyword">return t[0] * 100 + t[1]; }));
      "tok-keyword">var idx = 0;
      "tok-keyword">for ("tok-keyword">var r = 0; r < GH_v; r++) {
        "tok-keyword">for ("tok-keyword">var c = 0; c < GW_v; c++) {
          ("tok-keyword">function (rr, cc, el) {
            "tok-keyword">if (!el) "tok-keyword">return;
            "tok-keyword">if (treeKeys.has(rr * 100 + cc)) "tok-keyword">return;
            el.addEventListener('mouseenter', "tok-keyword">function () { showPreview(rr, cc); });
            el.addEventListener('mouseleave', "tok-keyword">function () { clearPreview(); });
          })(r, c, grid.children[idx]);
          idx++;
        }
      }
    }
  
    "tok-comment">/* ── Patch renderFarm to attach hover listeners & badge ──────── */
    "tok-keyword">var _waitRF = "tok-keyword">setInterval("tok-keyword">function () {
      "tok-keyword">if ("tok-keyword">typeof window.renderFarm !== 'function') "tok-keyword">return;
      "tok-keyword">clearInterval(_waitRF);
      "tok-keyword">var _orig = window.renderFarm;
      window.renderFarm = "tok-keyword">function () {
        _orig.apply("tok-keyword">this, arguments);
        "tok-comment">/* Re-attach hover listeners after every DOM rebuild */
        "tok-keyword">if (getHoeSize() > 1) attachHoverListeners();
        "tok-comment">/* Update hoe area badge */
        updateHoeBadge();
      };
      console.log('[BIG UPDATE 4] renderFarm patched for hoe preview.');
    }, 100);
  
    "tok-comment">/* ── Corner badge on hoe button ──────────────────────────────── */
    "tok-keyword">function updateHoeBadge() {
      "tok-keyword">var hoeBtn = document.getElementById('tool-hoe');
      "tok-keyword">if (!hoeBtn) "tok-keyword">return;
      "tok-keyword">var size   = getHoeSize();
      "tok-keyword">var badge  = document.getElementById('hoe-area-badge');
      "tok-keyword">if (size > 1) {
        "tok-keyword">if (!badge) {
          badge = document.createElement('span');
          badge.id = 'hoe-area-badge';
          hoeBtn.style.position = 'relative';
          hoeBtn.appendChild(badge);
        }
        badge.textContent = size + '×' + size;
        badge.style.display = 'block';
      } "tok-keyword">else "tok-keyword">if (badge) {
        badge.style.display = 'none';
      }
    }
  
    "tok-comment">/* ── Patch render to sync badge ──────────────────────────────── */
    "tok-keyword">var _waitRend = "tok-keyword">setInterval("tok-keyword">function () {
      "tok-keyword">if ("tok-keyword">typeof window.render !== 'function') "tok-keyword">return;
      "tok-keyword">clearInterval(_waitRend);
      "tok-keyword">var _orig = window.render;
      window.render = "tok-keyword">function () {
        _orig.apply("tok-keyword">this, arguments);
        updateHoeBadge();
      };
    }, 100);
  
    console.log('[BIG UPDATE 4] Hoe Area Upgrades loaded.');
  })();
  

})();
