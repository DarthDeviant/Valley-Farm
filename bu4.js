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