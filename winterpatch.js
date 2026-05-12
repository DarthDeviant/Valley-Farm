/* ═══════════════════════════════════════════════════════════
   VALLEY FARM — SKILLS PATCH  v1.0
   Adds Fishing, Mining, Crafting, Foraging skills to the
   Skill menu — visible only during Winter (Winter Hub season).
   Farming / Watering / Harvesting remain year-round.
═══════════════════════════════════════════════════════════ */
(function(){
'use strict';

/* ── WINTER SKILL DEFINITIONS ────────────────────────────── */
const WINTER_SKILL_META = {
  fishing:  { e:'🎣', n:'Fishing',  col:'#0369a1',
    bonuses:{ 5:'Fishing zone widens +10%', 10:'Always catch on zone hit!' } },
  mining:   { e:'⛏️', n:'Mining',   col:'#78716c',
    bonuses:{ 5:'Mine tiles cost 1 less energy', 10:'+30% chance of double ore' } },
  crafting: { e:'🔨', n:'Crafting', col:'#b45309',
    bonuses:{ 5:'Crafting restores +5 energy', 10:'Unlock advanced recipes' } },
  foraging: { e:'🌿', n:'Foraging', col:'#16a34a',
    bonuses:{ 5:'Forage yields +1 extra item', 10:'Rare items appear +20% more' } },
};

/* ── XP TABLE (mirrors the main game's XP_LEVELS) ──────── */
// We reuse the global XP_LEVELS / getLevel / getXPPct from script.js

/* ── ENSURE STATE ────────────────────────────────────────── */
function ensureWinterSkills() {
  if (!G || !G.skills) return;
  Object.keys(WINTER_SKILL_META).forEach(k => {
    if (!G.skills[k]) G.skills[k] = { xp: 0 };
  });
}

/* ── PATCH initState ─────────────────────────────────────── */
if (typeof window.initState === 'function') {
  const _origInit = window.initState;
  window.initState = function() {
    _origInit();
    ensureWinterSkills();
  };
}

/* ── PATCH loadState ─────────────────────────────────────── */
if (typeof window.loadState === 'function') {
  const _origLoad = window.loadState;
  window.loadState = function(s) {
    _origLoad(s);
    ensureWinterSkills();
  };
}

/* ── PATCH buildSkillSection ─────────────────────────────── */
if (typeof window.buildSkillSection === 'function') {
  const _origBSS = window.buildSkillSection;
  window.buildSkillSection = function() {
    let base = _origBSS();

    // Only inject winter skills section during Winter
    if (typeof season !== 'function' || season() !== 'Winter') return base;

    ensureWinterSkills();

    let h = '<div class="s-sec" style="color:#0369a1;border-color:#7dd3fc">❄️ Winter Skills</div>';
    h += '<div style="font-size:10px;color:var(--text-muted);margin:-4px 0 6px;padding:0 2px">Available while the Winter Hub is open</div>';

    Object.entries(WINTER_SKILL_META).forEach(([key, meta]) => {
      const sk = (G.skills && G.skills[key]) || { xp: 0 };
      const lv = (typeof getLevel === 'function') ? getLevel(sk.xp) : 1;
      const pct = (typeof getXPPct === 'function') ? getXPPct(sk.xp) : 0;
      const bonus = meta.bonuses[lv];
      h += `<div class="skill-item">
        <div class="skill-header">
          <span class="skill-name">${meta.e} ${meta.n}</span>
          <span class="skill-level">Lv.${lv}${lv >= 10 ? '★' : ''}</span>
        </div>
        <div class="skill-bar-outer">
          <div class="skill-bar-inner" style="width:${pct}%;background:${meta.col}"></div>
        </div>
        ${bonus ? `<span class="skill-bonus-tag">✓ ${bonus}</span>` : ''}
      </div>`;
    });

    return base + h;
  };
}

/* ── PATCH checkFishCatch → award fishing XP ─────────────── */
// winter.js currently calls addXP('harvesting', 8) on a catch.
// We intercept the global addXP only for fishing context by
// patching checkFishCatch after winter.js has defined it.
function patchFishCatch() {
  if (typeof window.checkFishCatch === 'undefined') return;
  // checkFishCatch is a module-level closure inside winter.js IIFE,
  // so it isn't directly on window. Instead we hook addXP during the
  // window.doFishCast flow by temporarily redirecting harvesting XP.
  // A cleaner approach: wrap the entire fishing outcome via a
  // MutationObserver on the fish-result element.
  const resultObserver = new MutationObserver(() => {
    const res = document.getElementById('fish-result');
    if (!res) return;
    const text = res.textContent || '';
    // A successful catch always contains "Caught" in the result text
    if (text.includes('Caught')) {
      ensureWinterSkills();
      if (typeof addXP === 'function') addXP('fishing', 10);
    }
  });
  // Observe once the DOM node exists
  const tryObserve = setInterval(() => {
    const el = document.getElementById('fish-result');
    if (el) {
      resultObserver.observe(el, { childList: true, characterData: true, subtree: true });
      clearInterval(tryObserve);
    }
  }, 500);
}

/* ── PATCH doMineTile → award mining XP ─────────────────── */
// doMineTile is also inside winter.js's IIFE. We wrap addXP at the
// game level: whenever addXP('farming', 6) is called from inside
// a mine action, we also credit mining XP.
// Strategy: patch addXP itself and detect the mining context by
// checking whether the winter hub mining tab is visible/active.
function patchMiningXP() {
  if (typeof window.addXP !== 'function') return;
  const _origAddXP = window.addXP;
  window.addXP = function(skill, amount) {
    _origAddXP(skill, amount);
    // When addXP('farming',6) is called AND the mining tab is the
    // active Winter Hub tab, also credit mining skill.
    if (skill === 'farming' && amount === 6) {
      const hub = document.getElementById('winter-hub');
      const miningTabActive = hub &&
        hub.classList.contains('wh-open') &&
        document.getElementById('wht-mining') &&
        document.getElementById('wht-mining').classList.contains('wh-active');
      if (miningTabActive) {
        ensureWinterSkills();
        _origAddXP('mining', 8);
      }
    }
    // When addXP('harvesting',8) is called AND fishing tab active, credit fishing
    if (skill === 'harvesting' && amount === 8) {
      const hub = document.getElementById('winter-hub');
      const fishingTabActive = hub &&
        hub.classList.contains('wh-open') &&
        document.getElementById('wht-fishing') &&
        document.getElementById('wht-fishing').classList.contains('wh-active');
      if (fishingTabActive) {
        ensureWinterSkills();
        _origAddXP('fishing', 10);
      }
    }
  };
}

/* ── PATCH doCraft → award crafting XP ──────────────────── */
// doCraft calls snd('levelup') after every successful craft.
// We wrap snd to detect this context.
function patchCraftingXP() {
  if (typeof window.snd !== 'function') return;
  const _origSnd = window.snd;
  window.snd = function(type) {
    _origSnd(type);
    if (type === 'levelup') {
      const hub = document.getElementById('winter-hub');
      const craftTabActive = hub &&
        hub.classList.contains('wh-open') &&
        document.getElementById('wht-crafting') &&
        document.getElementById('wht-crafting').classList.contains('wh-active');
      if (craftTabActive) {
        ensureWinterSkills();
        if (typeof addXP === 'function') addXP('crafting', 12);
      }
    }
  };
}

/* ── PATCH foraging → award foraging XP ─────────────────── */
// Foraging gives toast messages. Hook via addMat being called
// inside the foraging tab context.
function patchForagingXP() {
  if (typeof window.addMat !== 'function') return;
  // addMat is inside the winter.js IIFE so not on window directly.
  // Instead we watch the activities tab (Events) for forage_gift, or
  // use the buildActivitiesTab forage btn.
  // Best approach: monitor wh-body for forage action results.
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-forage]');
    if (!btn) return;
    const hub = document.getElementById('winter-hub');
    if (!hub || !hub.classList.contains('wh-open')) return;
    // Forage action — award XP after a short delay (after outcome)
    setTimeout(() => {
      ensureWinterSkills();
      if (typeof addXP === 'function') addXP('foraging', 8);
    }, 300);
  });
}

/* ── LEVEL-UP NOTIFICATIONS FOR WINTER SKILLS ────────────── */
// The main addXP already handles level-up toasts for known skills
// (farming/watering/harvesting) but will fall back to a generic
// message for winter skills — that's fine and intentional.
// We enrich the bonuses map so the toast message is meaningful.
function patchAddXPNames() {
  // After patchMiningXP wraps addXP, the inner _origAddXP reference
  // points to the original. We just need the names/bonuses tables
  // inside addXP to know about winter skills.
  // addXP in script.js does:
  //   const names = {farming:'Farming', watering:'Watering', harvesting:'Harvesting'}
  //   const bonuses = { farming:{...}, watering:{...}, harvesting:{...} }
  // Since those are local variables, we can't patch them directly.
  // The fallback branch already says "${names[skill]} skill up!" which
  // will render as "undefined skill up!" for unknown keys.
  // To fix that without touching script.js, we intercept at the
  // showAchievement level.
  if (typeof window.showAchievement !== 'function') return;
  const _origShow = window.showAchievement;
  window.showAchievement = function(icon, name, desc) {
    // Replace "undefined Lv.X!" with the proper winter skill name
    if (typeof name === 'string' && name.startsWith('undefined Lv.')) {
      const lvMatch = name.match(/Lv\.(\d+)/);
      const lv = lvMatch ? parseInt(lvMatch[1]) : 1;
      // Determine which winter skill just levelled by checking which
      // skills' XP changed most recently — we track via a side-channel.
      const key = window._lastWinterSkillUp;
      if (key && WINTER_SKILL_META[key]) {
        const meta = WINTER_SKILL_META[key];
        name = `${meta.e} ${meta.n} Lv.${lv}!`;
        desc = meta.bonuses[lv] || `${meta.n} skill up!`;
      }
    }
    _origShow(icon, name, desc);
  };

  // Track which winter skill is levelling up
  if (typeof window.addXP === 'function') {
    const _wrappedAddXP = window.addXP;
    window.addXP = function(skill, amount) {
      if (WINTER_SKILL_META[skill]) window._lastWinterSkillUp = skill;
      _wrappedAddXP(skill, amount);
    };
  }
}

/* ── INIT ────────────────────────────────────────────────── */
function init() {
  // Run after both script.js and winter.js are fully loaded
  ensureWinterSkills();
  patchFishCatch();
  patchMiningXP();
  patchCraftingXP();
  patchForagingXP();
  patchAddXPNames();
  console.log('[Skills Patch v1.0] ✅ Winter skills injected!');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
