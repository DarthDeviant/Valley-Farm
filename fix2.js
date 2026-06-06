/* ═══════════════════════════════════════════════════════════════════════
   VALLEY FARM — PATCH v3c  (patch_v3c.js)  v1.0
   ─────────────────────────────────────────────────────────────────────
   Load order: after script.js · tbu.js · mobilepatch.js · patch_v3.js
               · patch_v3b.js  (tutorial_patch.js is independent)

   Three focused fixes
   ───────────────────
   1. JOBS OUT OF SHOP     — Strips the 💼 Jobs Board section from the
                             Shop tab entirely.  Jobs only live in City.

   2. CITY — ONE JOBS TAB  — Collapses any duplicate Jobs tab buttons
                             injected by earlier patches into exactly one,
                             and ensures the tab renders correctly.

   3. QUESTS ABOVE SKILLS  — Moves the 📋 Daily Quests block (appended
                             at the end of buildInv by mobilepatch.js)
                             to just above the ⭐ Skills section, which
                             is below 🧺 Harvested — exactly where the
                             player checks it most.
═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ────────────────────────────────────────────────────────────────────
     1. STRIP JOBS BOARD FROM SHOP TAB
     tbu.js appends buildJobsSection() to buildShop().
     We wrap buildShop one more time (running after all prior wrappers)
     and cut everything from the Jobs section header onwards.
     We wrap TWICE with a short delay so we always run after any
     late-registering interval-based wrappers in tbu.js.
  ──────────────────────────────────────────────────────────────────── */
  function _stripJobsFromShop() {
    if (typeof window.buildShop !== 'function') {
      setTimeout(_stripJobsFromShop, 150);
      return;
    }
    var _prev = window.buildShop;
    window.buildShop = function () {
      var html = _prev.apply(this, arguments);
      var idx = html.indexOf('💼 Jobs Board');
      if (idx !== -1) {
        var cut = html.lastIndexOf('<div', idx);
        html = html.substring(0, cut !== -1 ? cut : idx);
      }
      return html;
    };
    console.log('[PatchV3c] buildShop wrapped — Jobs Board stripped.');
  }

  _stripJobsFromShop();
  setTimeout(_stripJobsFromShop, 700);

  /* ────────────────────────────────────────────────────────────────────
     2. EXACTLY ONE JOBS TAB IN THE CITY SCREEN
  ──────────────────────────────────────────────────────────────────── */
  function _ensureSingleJobsTab() {
    var tabBar = document.querySelector('#city-screen .city-tabs');
    if (!tabBar) return;

    tabBar.querySelectorAll('[data-ctab="jobs"]').forEach(function (b) { b.remove(); });

    var btn = document.createElement('button');
    btn.className    = 'city-tab-btn';
    btn.id           = 'city-tab-jobs-canonical';
    btn.dataset.ctab = 'jobs';
    btn.textContent  = '💼 Jobs';
    btn.addEventListener('click', function () {
      if (typeof setCityTab === 'function') setCityTab('jobs');
    });
    tabBar.appendChild(btn);
  }

  function _observeCity() {
    var cs = document.getElementById('city-screen');
    if (!cs) { setTimeout(_observeCity, 300); return; }
    _ensureSingleJobsTab();
    new MutationObserver(function () {
      if (cs.classList.contains('city-open')) _ensureSingleJobsTab();
    }).observe(cs, { attributes: true, attributeFilter: ['class'] });
    console.log('[PatchV3c] City Jobs tab observer active.');
  }
  _observeCity();

  /* Patch renderCityScreen to handle the jobs tab */
  function _hookRenderCityScreen() {
    if (typeof window.renderCityScreen !== 'function') {
      setTimeout(_hookRenderCityScreen, 200);
      return;
    }
    var _prev = window.renderCityScreen;
    window.renderCityScreen = function (tab) {
      if (tab !== 'jobs') { _prev.apply(this, arguments); return; }

      document.querySelectorAll('#city-screen .city-tab-btn').forEach(function (b) {
        b.classList.toggle('active', b.dataset.ctab === 'jobs');
      });
      if (typeof _updateCityGold === 'function') _updateCityGold();

      var body = document.getElementById('city-body');
      if (!body) return;
      body.innerHTML = _buildJobsHTML();

      body.querySelectorAll('[data-hire-job]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (typeof window.hireJob === 'function') window.hireJob(btn.dataset.hireJob);
          setTimeout(function () {
            if (typeof setCityTab === 'function') setCityTab('jobs');
          }, 120);
        });
      });
    };
    console.log('[PatchV3c] renderCityScreen patched for jobs tab.');
  }
  _hookRenderCityScreen();

  function _buildJobsHTML() {
    if (typeof JOBS === 'undefined' || typeof G === 'undefined') {
      return '<div style="padding:20px;text-align:center;color:var(--text-muted)">💼 Jobs Board unavailable</div>';
    }
    var curJob = G.job || null;
    var h = '';

    if (curJob && JOBS[curJob]) {
      var cj = JOBS[curJob];
      h += '<div style="padding:8px 11px;background:rgba(34,197,94,.08);border:1.5px solid rgba(34,197,94,.3);' +
           'border-radius:10px;font-size:11px;font-weight:700;color:#16a34a;margin-bottom:8px">' +
           cj.e + ' Currently employed as: <b>' + cj.n + '</b>' +
           '<br><span style="font-weight:400;font-size:10px;color:var(--text-muted)">+' + cj.dailyPay +
           'g/day · ' + (cj.perkTag || '') + '</span></div>';
    }

    h += '<div style="font-size:10px;color:var(--text-muted);margin:0 0 8px;padding:0 2px;line-height:1.55">' +
         'Hold one job at a time. Daily pay arrives every morning. Perks are active immediately.</div>';

    Object.values(JOBS).forEach(function (job) {
      var isActive  = (curJob === job.id);
      var canAfford = (G.gold >= job.hireCost);
      h += '<div class="job-card' + (isActive ? ' job-card-active' : '') + '">';
      h += '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:3px">';
      h += '<span class="job-title">' + job.e + ' ' + job.n + '</span>';
      h += '<span class="job-pay">+' + job.dailyPay + 'g/day</span>';
      h += '</div>';
      if (isActive) h += '<span class="job-active-badge">✓ Active Job</span><br>';
      h += '<div class="job-desc">' + job.desc + '</div>';
      h += '<div class="job-perks">';
      (job.perks || []).forEach(function (p) { h += '<div class="job-perk-item">' + p + '</div>'; });
      h += '</div>';
      if (job.hireCost > 0 && !isActive)
        h += '<div class="job-income-note">Hire fee: ' + job.hireCost + 'g (equipment cost)</div>';
      h += '<div class="job-btn-row">';
      if (isActive) {
        h += '<button class="job-quit-btn" onclick="if(typeof quitJob===\'function\')quitJob();' +
             'setTimeout(function(){if(typeof setCityTab===\'function\')setCityTab(\'jobs\');},120)">Quit Job</button>';
      } else {
        h += '<button class="job-hire-btn" data-hire-job="' + job.id + '"' +
             (canAfford ? '' : ' disabled') + '>' +
             (job.hireCost > 0 ? 'Hire (' + job.hireCost + 'g)' : 'Take Job — Free') + '</button>';
      }
      h += '</div></div>';
    });
    return h;
  }

  /* ────────────────────────────────────────────────────────────────────
     3. MOVE DAILY QUESTS ABOVE SKILLS IN BAG TAB
  ──────────────────────────────────────────────────────────────────── */
  var QUEST_MARKER  = '<div class="s-sec">📋 Daily Quests</div>';
  var SKILLS_MARKER = '<div class="s-sec">⭐ Skills</div>';

  function _hookBuildInv() {
    if (typeof window.buildInv !== 'function') {
      setTimeout(_hookBuildInv, 150);
      return;
    }
    var _prev = window.buildInv;
    window.buildInv = function () {
      var html = _prev.apply(this, arguments);

      var qIdx = html.indexOf(QUEST_MARKER);
      var sIdx = html.indexOf(SKILLS_MARKER);

      /* Only reorder if both present and quests are currently after skills */
      if (qIdx === -1 || sIdx === -1 || qIdx <= sIdx) return html;

      var questBlock  = html.substring(qIdx);
      var beforeQuest = html.substring(0, qIdx);
      var sInBefore   = beforeQuest.indexOf(SKILLS_MARKER);

      if (sInBefore === -1) return html;

      return beforeQuest.substring(0, sInBefore) +
             questBlock +
             beforeQuest.substring(sInBefore);
    };
    console.log('[PatchV3c] buildInv wrapped — Daily Quests moved above Skills.');
  }
  _hookBuildInv();

  console.log('[PatchV3c v1.0] Loaded — jobs/quests/city-tab fixes applied.');
})();