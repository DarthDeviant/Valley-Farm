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