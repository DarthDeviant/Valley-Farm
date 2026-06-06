/* ═══════════════════════════════════════════════════════
   tbu5.js — Merged Patch Bundle
   Generated: 2026-06-06
   Sources:   patch_v3.js, patch_v3b.js
   ═══════════════════════════════════════════════════════ */


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


/* ──────────────────────── patch_v3b.js ──────────────────────── */
/* ═══════════════════════════════════════════════════════════════════════
   VALLEY FARM — PATCH v3b  (patch_v3b.js)
   ─────────────────────────────────────────────────────────────────────
   Load order: after patch_v3.js

   Fixes / changes on top of patch_v3:
   1. HOE PICKER TOGGLE  — Clicking ⛏ Hoe again while picker is open
                           now CLOSES it (toggle, not re-open).

   2. CITY HUB REMOVED   — City button goes straight to the City screen
                           (original behaviour).  Jobs Board tab is
                           still added to the City screen tabs.

   3. HOE TILE PREVIEW   — With size > 1 selected: first click on a
                           tile shows a white-highlight preview box of
                           the exact area that would be tilled.
                           Clicking any highlighted tile confirms and
                           tills.  Clicking elsewhere moves the preview.
                           1×1 still tills immediately (no preview).

   4. RESTORE TILE GRID  — Undoes the tbu.js seamless-grass CSS so tiles
                           have their original borders, rounded corners,
                           and 3px gaps.  Micro-variation (gv*) classes
                           are also removed after every render.

   5. TOAST OPACITY 72%  — Toast notification backgrounds and the
                           achievement popup background are set to
                           72 % opacity via rgba().
═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ────────────────────────────────────────────────────────────────────
     SECTION 0  CSS
  ──────────────────────────────────────────────────────────────────── */
  var style = document.createElement('style');
  style.id = 'vf-patchv3b-css';
  style.textContent = `

/* ══ RESTORE TILE GRID LOOK ═════════════════════════════════════════
   Counter the tbu.js bigupdate-grass-css rules with !important.
   ─────────────────────────────────────────────────────────────────── */
#farm-grid {
  gap: 3px !important;
  border-radius: 0 !important;
  overflow: visible !important;
}
#farm-wrap {
  box-shadow: none !important;
  border-radius: 0 !important;
  overflow: auto !important;
}
.tile {
  border: 2px solid rgba(0,0,0,.13) !important;
  border-radius: 7px !important;
  box-shadow: none !important;
  /* Remove the inset-shadow trick tbu adds on tilled tiles */
}
.tile[data-tilled="1"] {
  box-shadow: none !important;
  border-radius: 7px !important;
}
.tile[data-tilled="1"][data-watered="1"] {
  box-shadow: none !important;
}
.tile[data-deco="1"] {
  border-radius: 7px !important;
  box-shadow: none !important;
}
.tile:hover {
  filter: brightness(1.25) !important;
  transform: scale(1.1) !important;
  z-index: 5;
  border-color: rgba(255,255,255,.75) !important;
  box-shadow: 0 4px 14px rgba(0,0,0,.18) !important;
}
/* cancel any gv-class brightness/sat filters */
.gv0,.gv1,.gv2,.gv3,.gv4 { filter: none !important; }
.gv0:hover,.gv1:hover,.gv2:hover,.gv3:hover,.gv4:hover {
  filter: brightness(1.25) !important;
}
.tile-tree {
  border: 2px solid rgba(0,0,0,.13) !important;
  border-radius: 7px !important;
  box-shadow: none !important;
}
/* Restore original ready-pulse */
.tile-ready {
  animation: readypulse 1.4s ease-in-out infinite !important;
  filter: none !important;
}
@keyframes readypulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(250,204,21,.7) !important; }
  50%      { box-shadow: 0 0 12px 6px rgba(250,204,21,.22) !important; }
}
/* Restore grass-deco opacity */
.grass-deco { opacity: .22 !important; font-size: 13px !important; filter: none !important; }

/* Mobile: keep original CSS scaling (from style.css) */
@media (max-width: 680px) {
  #farm-grid { gap: 2px !important; }
  .tile, .tile-tree { width: 45px !important; height: 45px !important; font-size: 19px !important; border-radius: 5px !important; }
}
@media (max-width: 400px) {
  .tile, .tile-tree { width: 38px !important; height: 38px !important; font-size: 16px !important; }
}

/* ══ HOE TILE PREVIEW ═══════════════════════════════════════════════ */
.hoe-pending-tile {
  outline: 3px solid rgba(255,255,255,.88) !important;
  outline-offset: -2px !important;
  background-color: rgba(255,255,255,.30) !important;
  filter: brightness(1.15) !important;
  z-index: 6 !important;
  transition: none !important;
}
/* Slight pulse so player knows to click again */
@keyframes pendingPulse {
  0%,100% { outline-color: rgba(255,255,255,.88); }
  50%     { outline-color: rgba(255,165,0,.95); }
}
.hoe-pending-tile { animation: pendingPulse 1s ease-in-out infinite !important; }

/* ══ TOAST & NOTIFICATION BACKGROUNDS — 72 % OPACITY ═══════════════ */
.toast {
  background: rgba(255,255,255,.72) !important;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
body.dark .toast {
  background: rgba(30,42,30,.72) !important;
}
.toast.t-success { background: rgba(240,253,244,.72) !important; }
body.dark .toast.t-success { background: rgba(10,32,22,.72) !important; }
.toast.t-warn    { background: rgba(255,251,235,.72) !important; }
body.dark .toast.t-warn    { background: rgba(30,24,0,.72) !important; }
.toast.t-error   { background: rgba(254,242,242,.72) !important; }
body.dark .toast.t-error   { background: rgba(30,8,8,.72) !important; }
.toast.t-info    { background: rgba(255,255,255,.72) !important; }
body.dark .toast.t-info    { background: rgba(20,30,20,.72) !important; }

/* Achievement popup */
#achieve-popup {
  background: rgba(255,255,255,.72) !important;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
body.dark #achieve-popup {
  background: rgba(30,42,30,.72) !important;
}

/* Season banner */
.season-banner {
  background: rgba(255,255,255,.72) !important;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}
body.dark .season-banner {
  background: rgba(30,42,30,.72) !important;
}

/* Retro — keep solid for pixel-art feel */
body.retro .toast             { background: rgba(18,12,0,.88) !important; backdrop-filter: none !important; }
body.retro #achieve-popup     { background: rgba(18,12,0,.88) !important; backdrop-filter: none !important; }
body.retro .season-banner     { background: rgba(18,12,0,.88) !important; backdrop-filter: none !important; }
`;
  document.head.appendChild(style);

  /* ────────────────────────────────────────────────────────────────────
     SECTION 1  RESTORE TILE GRID — remove tbu.js's CSS injection
  ──────────────────────────────────────────────────────────────────── */
  function _removeTbuGrassCSS () {
    var el = document.getElementById('bigupdate-grass-css');
    if (el) { el.remove(); console.log('[PatchV3b] Removed bigupdate-grass-css.'); }
    else     { setTimeout(_removeTbuGrassCSS, 100); }
  }
  _removeTbuGrassCSS();

  /* Strip gv* classes after every renderFarm so micro-variation
     tinting is gone (the CSS already zeroes the filter, but
     removing the class keeps things tidy).                       */
  function _hookRenderFarmStripGv () {
    if (typeof window.renderFarm !== 'function') { setTimeout(_hookRenderFarmStripGv, 150); return; }
    var _prev = window.renderFarm;
    window.renderFarm = function () {
      _prev.apply(this, arguments);
      var grid = document.getElementById('farm-grid');
      if (!grid) return;
      Array.from(grid.children).forEach(function (el) {
        el.classList.remove('gv0','gv1','gv2','gv3','gv4');
      });
      /* Also undo any JS-forced tile sizes from patch_v3 mobile grid
         (we want the CSS-driven sizes back on mobile too)         */
      if (window.innerWidth <= 680) {
        Array.from(grid.children).forEach(function (el) {
          el.style.removeProperty('width');
          el.style.removeProperty('height');
          el.style.removeProperty('padding');
          el.style.removeProperty('font-size');
        });
        grid.style.removeProperty('width');
        grid.style.removeProperty('height');
      }
    };
    console.log('[PatchV3b] renderFarm patched to strip gv classes.');
  }
  _hookRenderFarmStripGv();

  /* ────────────────────────────────────────────────────────────────────
     SECTION 2  HOE PICKER TOGGLE
     The patch_v3 setTool hook always opens the picker when t==='hoe'.
     We track a global flag _hoePickerOpen and, if the hoe button is
     clicked while picker is already open, close it instead.
  ──────────────────────────────────────────────────────────────────── */
  window._hoePickerOpen = false;

  /* Override the open/close helpers defined in patch_v3 so we can
     track the flag properly.                                       */
  var _origOpen3  = window._openHoePicker  || function(){};
  var _origClose3 = window._closeHoePicker || function(){};

  window._openHoePicker = function () {
    _origOpen3();
    window._hoePickerOpen = true;
  };
  window._closeHoePicker = function () {
    _origClose3();
    window._hoePickerOpen = false;
  };

  /* Patch the PC toolbar hoe button for toggle */
  function _patchHoeBtnToggle () {
    var btn = document.getElementById('tool-hoe');
    if (!btn) { setTimeout(_patchHoeBtnToggle, 200); return; }
    btn.addEventListener('click', function () {
      if (typeof G === 'undefined') return;
      /* If hoe is already active and picker is open → close */
      if (G.tool === 'hoe' && window._hoePickerOpen) {
        if (typeof window._closeHoePicker === 'function') window._closeHoePicker();
      }
      /* (patch_v3 setTool hook handles the open side) */
    }, true); /* capture so this fires before patch_v3's listener */
    console.log('[PatchV3b] Hoe button toggle patched (PC).');
  }
  _patchHoeBtnToggle();

  /* Patch the mobile dock hoe button for toggle */
  function _patchDockHoeBtnToggle () {
    var btn = document.getElementById('dock-hoe');
    if (!btn) { setTimeout(_patchDockHoeBtnToggle, 300); return; }
    btn.addEventListener('click', function () {
      if (typeof G === 'undefined') return;
      if (G.tool === 'hoe' && window._hoePickerOpen) {
        if (typeof window._closeHoePicker === 'function') window._closeHoePicker();
      }
    }, true);
    console.log('[PatchV3b] Dock hoe button toggle patched (mobile).');
  }
  _patchDockHoeBtnToggle();

  /* ────────────────────────────────────────────────────────────────────
     SECTION 3  CITY HUB REMOVED — restore original openCityScreen
     patch_v3 replaced openCityScreen with the hub overlay.  We put
     back the original behaviour: open city-screen, go to market tab,
     but also inject the Jobs tab while we're at it.
  ──────────────────────────────────────────────────────────────────── */
  function _restoreOpenCityScreen () {
    if (typeof _ensureSM !== 'function' || typeof setCityTab !== 'function') {
      setTimeout(_restoreOpenCityScreen, 200); return;
    }
    window.openCityScreen = function () {
      if (typeof _ensureSM       === 'function') _ensureSM();
      var el = document.getElementById('city-screen');
      if (el) el.classList.add('city-open');
      if (typeof _updateCityGold === 'function') _updateCityGold();
      window.paused = true;
      /* Inject Jobs tab if not already there, then go to market */
      _injectJobsCityTab();
      if (typeof setCityTab      === 'function') setCityTab('market');
    };

    /* Also close the city-hub overlay if it was left open */
    var hub = document.getElementById('city-hub');
    if (hub) hub.style.display = 'none';

    console.log('[PatchV3b] openCityScreen restored to original behaviour.');
  }
  _restoreOpenCityScreen();

  /* Inject a "💼 Jobs" tab into the city screen (idempotent) */
  function _injectJobsCityTab () {
    if (document.getElementById('city-tab-jobs-v3b')) return;
    var tabs = document.querySelector('#city-screen .city-tabs');
    if (!tabs) return;
    var btn = document.createElement('button');
    btn.className  = 'city-tab-btn';
    btn.id         = 'city-tab-jobs-v3b';
    btn.dataset.ctab = 'jobs';
    btn.textContent  = '💼 Jobs';
    btn.addEventListener('click', function () {
      if (typeof setCityTab === 'function') setCityTab('jobs');
    });
    tabs.appendChild(btn);
  }

  /* Make sure the tab appears whenever city screen opens */
  function _observeCityScreen () {
    var cs = document.getElementById('city-screen');
    if (!cs) { setTimeout(_observeCityScreen, 300); return; }
    var mo = new MutationObserver(function () {
      if (cs.classList.contains('city-open')) _injectJobsCityTab();
    });
    mo.observe(cs, { attributes: true, attributeFilter: ['class'] });
  }
  _observeCityScreen();

  /* ────────────────────────────────────────────────────────────────────
     SECTION 4  HOE TILE PREVIEW
     State:  window._hoePending = null | { r, c }
             window._hoePendingEls = []  (highlighted DOM elements)
     Logic:
       • size === 1   → till immediately (delegate to lower patch)
       • size > 1, no pending  → show preview, set pending
       • size > 1, pending, click IN preview area → till, clear
       • size > 1, pending, click OUTSIDE         → move preview
  ──────────────────────────────────────────────────────────────────── */
  window._hoePending    = null;
  window._hoePendingEls = [];

  function _clearHoePending () {
    window._hoePendingEls.forEach(function (el) {
      el.classList.remove('hoe-pending-tile');
    });
    window._hoePendingEls = [];
    window._hoePending    = null;
  }

  function _showHoePendingAt (r, c, size) {
    _clearHoePending();
    var grid = document.getElementById('farm-grid');
    if (!grid) return;
    var GW_v = typeof GW !== 'undefined' ? GW : 14;
    var GH_v = typeof GH !== 'undefined' ? GH : 10;
    var offsets = _v3bHoeOffsets(size);
    offsets.forEach(function (off) {
      var nr = r + off[0], nc = c + off[1];
      if (nr < 0 || nr >= GH_v || nc < 0 || nc >= GW_v) return;
      /* Only highlight non-tilled, non-deco, non-crop, non-tree tiles */
      if (typeof G !== 'undefined' && G.farm) {
        var tile = G.farm[nr] && G.farm[nr][nc];
        if (tile && (tile.tilled || tile.deco)) return;
      }
      var el = grid.children[nr * GW_v + nc];
      if (!el) return;
      el.classList.add('hoe-pending-tile');
      window._hoePendingEls.push(el);
    });
    window._hoePending = { r: r, c: c };
  }

  function _v3bHoeOffsets (size) {
    if (size === 1) return [[0,0]];
    if (size === 2) return [[0,0],[0,1],[1,0],[1,1]];
    var range = size === 4 ? [-1,0,1,2] : [-1,0,1];
    var arr = [];
    for (var i = 0; i < range.length; i++)
      for (var j = 0; j < range.length; j++)
        arr.push([range[i], range[j]]);
    return arr;
  }

  function _isInPendingArea (r, c) {
    if (!window._hoePending) return false;
    var size = (typeof window._getDesiredHoeSize === 'function')
               ? window._getDesiredHoeSize() : 1;
    var pr = window._hoePending.r, pc = window._hoePending.c;
    var offsets = _v3bHoeOffsets(size);
    for (var i = 0; i < offsets.length; i++) {
      if (pr + offsets[i][0] === r && pc + offsets[i][1] === c) return true;
    }
    return false;
  }

  /* Wrap clickTile one more time (outermost) to add preview logic */
  function _hookClickTilePreview () {
    if (typeof window.clickTile !== 'function') { setTimeout(_hookClickTilePreview, 250); return; }
    var _prev = window.clickTile;

    window.clickTile = function (r, c) {
      /* Only intercept hoe with area > 1 */
      if (typeof G === 'undefined' || G.tool !== 'hoe') {
        _clearHoePending();
        return _prev.apply(this, arguments);
      }
      var size = (typeof window._getDesiredHoeSize === 'function')
                 ? window._getDesiredHoeSize() : 1;
      if (size === 1) {
        _clearHoePending();
        return _prev.apply(this, arguments); /* till immediately */
      }

      if (window._hoePending) {
        if (_isInPendingArea(r, c)) {
          /* Second click inside preview → confirm till */
          var pr = window._hoePending.r, pc = window._hoePending.c;
          _clearHoePending();
          /* Delegate to patch_v3 clickTile wrapper which handles multi-till */
          return _prev.call(this, pr, pc);
        } else {
          /* Clicked outside → move preview */
          _showHoePendingAt(r, c, size);
          if (typeof toast === 'function') toast('⚒ Click highlighted tiles to till', 'info', 1000);
        }
      } else {
        /* First click → show preview */
        _showHoePendingAt(r, c, size);
        var label = size + '×' + size;
        if (typeof toast === 'function') toast('⚒ ' + label + ' preview — click again to till', 'info', 1500);
      }
    };

    console.log('[PatchV3b] clickTile hooked for hoe tile preview.');
  }
  _hookClickTilePreview();

  /* Clear pending preview when tool changes */
  function _hookSetToolClearPending () {
    if (typeof window.setTool !== 'function') { setTimeout(_hookSetToolClearPending, 200); return; }
    var _prev = window.setTool;
    window.setTool = function (t) {
      if (t !== 'hoe') _clearHoePending();
      _prev.apply(this, arguments);
    };
  }
  _hookSetToolClearPending();

  /* Clear pending preview after sleep */
  function _hookDoSleepClearPending () {
    if (typeof window.doSleep !== 'function') { setTimeout(_hookDoSleepClearPending, 200); return; }
    var _prev = window.doSleep;
    window.doSleep = function () {
      _clearHoePending();
      return _prev.apply(this, arguments);
    };
  }
  _hookDoSleepClearPending();

  /* ────────────────────────────────────────────────────────────────────
     DONE
  ──────────────────────────────────────────────────────────────────── */
  console.log('[PatchV3b v1.0] ✅ Loaded!\n' +
    '  · Tile grid restored (borders + gaps, no seamless grass)\n' +
    '  · Hoe picker: clicking again now closes it (toggle)\n' +
    '  · City hub removed — goes straight to City screen\n' +
    '  · Hoe size > 1: first click previews area, second confirms\n' +
    '  · Toast + achievement backgrounds at 72% opacity');
})();
