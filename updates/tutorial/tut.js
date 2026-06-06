/* ═══════════════════════════════════════════════════════════════════════
   VALLEY FARM — TUTORIAL PATCH  (tutorial_patch.js)  v1.0
   ─────────────────────────────────────────────────────────────────────
   Load order: after script.js (any position — uses a MutationObserver
   so it doesn't care about exact timing).

   Strategy
   ─────────
   • HELP_STEPS, helpStep and paused are let/const closure variables
     inside script.js — they are NOT reachable via window.
   • openHelp() and closeHelp() ARE window properties (function
     declarations) so we leave them alone; openHelp() still handles
     pausing and closeHelp() still unpauses — we don't touch that.
   • We override window.renderHelpStep and window.helpNav only.
     Both are function declarations → window properties → overridable.
   • A MutationObserver fires the moment the overlay gains class "show"
     (i.e. immediately after openHelp runs), resets our step counter,
     and renders step 0 with our content.  Rock-solid regardless of
     timing.
═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── 10 Tutorial Steps ─────────────────────────────────────── */
  var STEPS = [
    {
      e: '🌾',
      title: 'Welcome to Valley Farm!',
      body: 'Grow crops, earn gold, and build your farm across four seasons. Each year has 4 seasons × 28 days. Your game auto-saves every 30 seconds — nothing is lost when you close the tab.',
      tip: '💡 New here? Follow these 10 steps and you\'ll be a master farmer in no time!'
    },
    {
      e: '⛏',
      title: 'Tilling with the Hoe',
      body: 'Tap the ⛏ Hoe button to open the Size Picker. Pick 1×1, 2×2, 3×3 or 4×4. Now tap a grass tile — a glowing white preview appears showing exactly which tiles will be tilled. Tap any highlighted tile to confirm and till the whole area.',
      tip: '⌨ Keyboard: H selects the Hoe. 2×2 is always available — no upgrade needed!'
    },
    {
      e: '⚒',
      title: 'Hoe Upgrades (3×3 & 4×4)',
      body: 'Open the Bag panel → Upgrades tab. "Hoe Upgrade" (1,200g) unlocks 3×3 tilling — 9 tiles per click. "Iron Head" (2,500g) unlocks 4×4 — 16 tiles at once! The size picker in the Hoe menu automatically unlocks these options after purchase.',
      tip: '💡 Buying upgrades early pays off fast — fewer clicks means more crops!'
    },
    {
      e: '🛒',
      title: 'Buying Seeds',
      body: 'Open the Bag panel and tap the Shop tab. Seeds are season-specific — only crops that can grow right now are listed. Stock up at the start of each season before prices tick up. Fertilizers are also sold here.',
      tip: '📱 Mobile: Swipe UP on the farm field, or tap the 🎒 Bag toolbar button, to open the panel.'
    },
    {
      e: '🌱',
      title: 'Planting Seeds',
      body: 'Select the 🌱 Seeds tool. On mobile a seed picker slides up automatically — choose your crop. Then tap any tilled tile to plant. Each tap plants one seed from your inventory into that spot.',
      tip: '⌨ Keyboard: S switches to Seeds. Only tilled, empty soil can be planted!'
    },
    {
      e: '💧',
      title: 'Watering Your Crops',
      body: 'Select the 💧 Water tool and tap each planted tile. Crops only grow on days they are watered — miss a day and that day\'s progress is skipped. Buy the Sprinkler upgrade from the Upgrades tab to auto-water every morning.',
      tip: '⌨ Keyboard: W switches to Water. Rainy days water everything for free automatically!'
    },
    {
      e: '🌿',
      title: 'Fertilizer',
      body: 'Buy fertilizers from the Shop tab (Basic, Rich Compost, Speed Grow, Mega). To apply: tap the ⛏ Hoe button to open the Size Picker, then tap the 🌿 Fert button. The toolbar icon switches to Fert. Apply to tilled soil before planting for bonuses — faster growth or bigger yield.',
      tip: '💡 Mega Fertilizer gives +35% bonus yield. Speed Grow makes crops advance 2× per watered day!'
    },
    {
      e: '✨',
      title: 'Harvesting & Shipping',
      body: 'When a crop glows ✨ it\'s ready! Switch to the 🌾 Scythe tool and tap it to harvest into your bag. On mobile, long-press the 🌾 Harvest dock button for instant Harvest All. Open the Bag panel and tap Ship All — gold arrives the next morning after you sleep.',
      tip: '⌨ Keyboard: R switches to Scythe. Higher Harvesting skill = a chance at bonus items!'
    },
    {
      e: '🎒',
      title: 'The Bag Panel',
      body: 'Swipe UP on the farm (mobile) or tap 🎒 Bag to open your panel. Tabs inside: Bag (inventory + ship), Shop (seeds & ferts & upgrades), Skills (your XP levels), and 📋 Daily Quests — 3 tasks refresh each morning for bonus gold and XP.',
      tip: '💡 Check Daily Quests each morning — they\'re easy gold while you farm normally!'
    },
    {
      e: '🏙️',
      title: 'City, Jobs & Seasons',
      body: 'Reach Farming Level 5 to unlock the City (via the Map). The 📊 Stock Exchange lets you trade shares and list your own farm. The 💼 Jobs Board gives a daily wage + special perks. In Winter, farming stops — use the live Auction Market to sell stored crops at peak prices!',
      tip: '💡 Buy a Greenhouse upgrade so your crops survive through Winter. Plan ahead every Fall!'
    }
  ];

  /* ── Step counter (separate from script.js's closure "helpStep") ─ */
  var _step = 0;

  /* ── Render a step into the existing help overlay DOM ─────────── */
  function _render() {
    var s = STEPS[_step];
    if (!s) return;

    var get = function (id) { return document.getElementById(id); };

    /* Content */
    if (get('help-emoji'))      get('help-emoji').textContent      = s.e;
    if (get('help-title'))      get('help-title').textContent      = s.title;
    if (get('help-body'))       get('help-body').textContent       = s.body;
    if (get('help-tip'))        get('help-tip').textContent        = s.tip;

    /* Step counter label */
    if (get('help-step-label'))
      get('help-step-label').textContent = 'Step ' + (_step + 1) + ' of ' + STEPS.length;

    /* Progress dots */
    if (get('help-dots'))
      get('help-dots').innerHTML = STEPS.map(function (_, i) {
        return '<div class="help-dot' + (i === _step ? ' active' : '') + '"></div>';
      }).join('');

    /* Prev button */
    var prevBtn = get('help-prev');
    if (prevBtn) {
      prevBtn.style.display = _step === 0 ? 'none' : 'block';
      prevBtn.onclick = function () { window.helpNav(-1); };
    }

    /* Next / Done button */
    var nextBtn = get('help-next');
    if (nextBtn) {
      var isLast = (_step === STEPS.length - 1);
      nextBtn.textContent = isLast ? 'Done ✓' : 'Next →';
      /* closeHelp is a function declaration in script.js → window property
         so calling window.closeHelp() correctly unpauses the game via its
         own closure access to the script.js "paused" variable.          */
      nextBtn.onclick = isLast
        ? function () { if (typeof closeHelp === 'function') closeHelp(); }
        : function () { window.helpNav(1); };
    }
  }

  /* ── Override window.renderHelpStep ───────────────────────────── */
  /* This is a function declaration in script.js → lives on window.
     Replacing it means our content shows whenever renderHelpStep()
     is called (including from inside openHelp()).                   */
  function _install() {
    if (typeof window.renderHelpStep !== 'function' ||
        typeof window.helpNav        !== 'function') {
      setTimeout(_install, 150);
      return;
    }

    window.renderHelpStep = _render;

    window.helpNav = function (dir) {
      _step = Math.max(0, Math.min(STEPS.length - 1, _step + dir));
      _render();
    };

    console.log('[TutorialPatch] renderHelpStep + helpNav overridden.');
  }
  _install();

  /* ── MutationObserver: reset to step 0 whenever overlay opens ─── */
  /* This fires AFTER openHelp() adds class "show", ensuring our
     content is always correct even if openHelp called renderHelpStep
     before our override was in place.                               */
  function _observeOverlay() {
    var overlay = document.getElementById('help-overlay');
    if (!overlay) { setTimeout(_observeOverlay, 200); return; }

    var _wasShowing = overlay.classList.contains('show');
    new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        var nowShowing = overlay.classList.contains('show');
        if (nowShowing && !_wasShowing) {
          /* Overlay just became visible — reset and render our step 0 */
          _step = 0;
          _render();
        }
        _wasShowing = nowShowing;
      });
    }).observe(overlay, { attributes: true, attributeFilter: ['class'] });

    console.log('[TutorialPatch] Overlay observer active.');
  }
  _observeOverlay();

  console.log('[TutorialPatch v1.0] Loaded — 10 custom tutorial steps ready.');
})();