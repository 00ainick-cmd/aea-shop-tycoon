# Navigation Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the buried "Shop" sub-menus with a persistent bottom tab bar (Floor, Crew, Dealers, Shop, Info) so any management area is one tap away. The job loop is unchanged.

**Architecture:** Single-file `index.html`, vanilla JS. A `TAB_OF` screen->tab map drives a `renderTabBar()` that the main `render()` shows on hub screens and hides on flow screens. Built incrementally so the game stays playable at every commit. Design: `docs/plans/2026-06-29-shop-tycoon-nav-redesign-design.md`.

**Verify:** `?test=1` self-tests (the `check(name,fn)` harness) for routing logic; headless Edge render-and-look at **>=480px wide** (headless crops at 375, do not be fooled). Full suite stays green.

---

## Task 1: Tab bar shell + routing (tabs point to existing screens)

Build the persistent tab bar and wire it into `render()`. Tab roots point at screens that already exist, so the game is fully navigable by tabs immediately; the consolidated hubs come in Tasks 2-3.

**Files:** Modify `index.html` (CSS block near the other bottom-bar rules; the `render()` function and the `#bar` handling; `SCREENS.floor`; add the tab data + `renderTabBar`; add a `#tabbar` element to the HTML shell).

**Steps (TDD):**
1. Add the routing data near the SCREENS section:
   ```js
   var TAB_ROOT={ floor:'floor', crew:'train', dealers:'dealers', shop:'shop', info:'reviews' }; // roots point at existing screens for now
   var TAB_OF={ floor:'floor',
     train:'crew', traintech:'crew', courses:'crew', recruit:'crew', negotiate:'crew', apprentice:'crew', oemcert:'crew',
     dealers:'dealers',
     shop:'shop', hustle:'shop', hustleResult:'shop',
     reviews:'info', reviewRespond:'info', book:'info', manual:'info' };
   var TABS=[ {id:'floor',label:'FLOOR',root:'floor'},{id:'crew',label:'CREW',root:'train'},{id:'dealers',label:'DEALERS',root:'dealers'},{id:'shop',label:'SHOP',root:'shop'},{id:'info',label:'INFO',root:'reviews'} ];
   function tabOf(screen){ return TAB_OF[screen]||null; }
   function screenHasTabs(screen){ return !!TAB_OF[screen]; }
   ```
2. Write failing self-tests near the other checks:
   ```js
   check('nav: tab routing maps screens to tabs', function(){ return tabOf('dealers')==='dealers' && tabOf('reviews')==='info' && tabOf('train')==='crew' && tabOf('shop')==='shop'; });
   check('nav: job-loop screens are flow screens (no tabs)', function(){ return tabOf('quote')===null && tabOf('meet')===null && tabOf('squawk')===null && tabOf('title')===null; });
   check('nav: every tab id has a TAB row', function(){ return TABS.length===5 && TABS.every(function(t){ return t.label && t.root; }); });
   ```
   Run `?test=1`, expect FAIL (tabOf undefined).
3. Implement `renderTabBar()`:
   ```js
   function renderTabBar(){
     var active=tabOf(STATE.screen); if(!active) return '';
     return '<div id="tabbar" role="navigation">'+TABS.map(function(t){
       return '<button class="tab'+(t.id===active?' on':'')+'" data-tab="'+t.root+'">'+t.label+'</button>';
     }).join('')+'</div>';
   }
   ```
4. Add CSS (mirror the `#bar` fixed-bottom pattern; 5 equal tabs; touch target >= 48px; reuse the responsive breakpoints so labels shrink at <=390px):
   ```css
   #tabbar{ position:fixed; left:50%; transform:translateX(-50%); bottom:0; width:100%; max-width:480px; display:flex; gap:4px; z-index:50; padding:6px 8px calc(8px + env(safe-area-inset-bottom)); background:linear-gradient(180deg, rgba(13,19,27,0) 0%, var(--bay) 30%); }
   #tabbar .tab{ flex:1; min-height:50px; font-family:'Press Start 2P',monospace; font-size:8px; color:var(--muted); background:var(--steel); border:3px solid var(--edge); border-radius:6px; box-shadow: inset 0 0 0 2px var(--rivet); }
   #tabbar .tab.on{ color:var(--ink); border-color:var(--amber); box-shadow: inset 0 0 0 2px var(--amber); }
   @media (max-width:390px){ #tabbar .tab{ font-size:6px; } }
   ```
5. Integrate into `render()` and the shell. The shell is `<div class="app" id="app"><div id="hudwrap"></div><div id="stage"></div><div id="bar"></div></div>`; add a sibling `<div id="tabbar"></div>` after `#bar`. In `render()`: render `scr.actions` into `#bar` exactly as today (keep this). Then, if `screenHasTabs(STATE.screen)`, set `#tabbar` to `renderTabBar()`, add class `with-tabs` to `#bar` (CSS lifts `#bar` to sit ABOVE the tab bar), and wire tab clicks `document.querySelectorAll('#tabbar .tab').forEach(el=>el.onclick=function(){ sTab(); go(el.dataset.tab); })`; else clear `#tabbar` and remove `with-tabs`. Hide `#bar` when it has zero buttons (so tab-root screens with no actions show only the tab bar): e.g. `bar.style.display = bar.children.length ? '' : 'none'`. Adjust `.app` bottom padding so content clears whichever bar(s) are present (tabbar ~62px; tabbar+bar ~124px).
6. Update `SCREENS.floor`: remove the `THE SHOP` action (the tab bar replaces it). Keep `RUN A SHIFT` (it renders in `#bar` above the tab bar). Keep the bay taps and Chief tip.
   Result: tab-root screens whose actions are just BACK can drop BACK later; the floor shows RUN A SHIFT above the tabs; child screens (e.g. traintech) keep their BACK/primary above the tabs.
7. Run `?test=1`, expect PASS. Render at 500px: `?screen=floor` (tabs show, RUN A SHIFT in content, active=FLOOR), `?screen=dealers` (active=DEALERS), `?screen=quote` (NO tabs, contextual buttons present). Confirm no double bottom bars and nothing clipped.
8. Commit: `feat(nav): persistent bottom tab bar wired to existing screens`.

## Task 2: CREW hub + re-parent training/recruit; move OEM training to Dealers

**Files:** Modify `index.html` (add `SCREENS.crew`; re-point `TAB_ROOT.crew` and the CREW tab root to `'crew'`; change BACK targets of `train`/`courses`/`recruit`/`apprentice` to `crew`; add an OEM factory training link on `SCREENS.dealers`; set `TAB_OF.oemcert='dealers'`).

**Steps:**
1. Add `SCREENS.crew`: a hub with the technicians roster (name, credential, currency status, top skills) and clear buttons to TRAIN A TECH (go `train`/`traintech`), RECRUIT (go `recruit`), AEA COURSES (go `courses`), APPRENTICESHIP (go `apprentice`). Reuse existing helpers; match the card kit.
2. Point the CREW tab at `crew`: `TABS` row root `'crew'`, `TAB_ROOT.crew='crew'`, `TAB_OF.crew='crew'`.
3. Re-parent: in `courses`/`recruit`/`apprentice`/`train` screens change their BACK action target from `shop`/`training` to `crew`.
4. Move OEM factory training to DEALERS: set `TAB_OF.oemcert='dealers'`, and on `SCREENS.dealers` add a link to `oemcert`; set `oemcert` BACK to `dealers`.
5. Self-test: `check('nav: crew hub owns training and recruiting', ...)` asserting `tabOf('crew')==='crew' && tabOf('courses')==='crew' && tabOf('oemcert')==='dealers'`.
6. Run `?test=1` (PASS) and render `?screen=crew` and `?screen=dealers` at 500px.
7. Commit: `feat(nav): Crew hub consolidates techs, training, recruiting`.

## Task 3: Slim the Shop tab + Info hub

**Files:** Modify `index.html` (`SCREENS.shop`; add `SCREENS.info`; re-point INFO tab root to `info`; re-parent `book`/`reviews`/`manual` BACK to `info`).

**Steps:**
1. `SCREENS.shop`: remove the nav cards that are now tabs (Training, Dealers, Recruit, Manual, Customer Book). Keep the stats dashboard, labor rate, shop Upgrade, and add a DRUM UP BUSINESS button (go `hustle`).
2. Add `SCREENS.info`: a hub linking CUSTOMER BOOK (`book`), REVIEWS (`reviews`), SHOP MANUAL (`manual`). Point INFO tab root at `info` (`TABS` row + `TAB_ROOT.info='info'` + `TAB_OF.info='info'`).
3. Re-parent `book`/`reviews`/`manual` BACK actions to `info`.
4. Self-test: `check('nav: info hub owns book/reviews/manual', ...)`.
5. Run `?test=1` (PASS); render `?screen=shop`, `?screen=info` at 500px.
6. Commit: `feat(nav): slim Shop tab, add Info hub for book/reviews/manual`.

## Task 4: Polish + full verification + push

**Files:** Modify `index.html` as needed (label fit at 375, padding, active states).

**Steps:**
1. Confirm five tab labels fit at narrow width (render at 360-390px true device emulation if possible, else inspect the responsive font sizes); tighten labels/CSS if cramped.
2. Confirm: no screen hides content behind the tab bar; no double bottom bars anywhere; the job loop and modal beats never show tabs; back-navigation inside a tab returns to the tab root.
3. Full `?test=1` (all green) and a render sweep at 500px: floor, crew, dealers, shop, info, plus one job-loop screen (no tabs) and one beat (no tabs).
4. Update the design bible navigation notes if any screen names changed.
5. Commit any polish, then `git push origin main` to update the live demo.

## Notes
- `#bar` is KEPT on tabbed screens, stacked above the tab bar, and hidden when it has no buttons. So tab-root screens with no actions show only the tab bar (single bar); child screens show their actions above the tabs (two compact bars). This avoids refactoring every screen's actions inline.
- Tab-root screens (crew/dealers/shop/info) should drop their BACK action (the tabs handle navigation); child screens keep BACK.
- Do not alter the job loop screens or their actions.
- No em dashes in any new copy. Touch targets >= 44px.
