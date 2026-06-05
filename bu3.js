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