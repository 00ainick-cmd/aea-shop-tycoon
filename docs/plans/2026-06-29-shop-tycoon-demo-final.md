# Shop Tycoon Demo-Final Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Take the shipping build from "systems work but nothing is taught and the arc may not pay off" to a demo-final, shareable, finishable game with onboarding, the safety pillar restored, and the small system gaps closed.

**Architecture:** One self-contained file, `index.html` (vanilla HTML/CSS/JS, no build step). Logic changes are verified by `check()` self-tests run with `?test=1`; UI changes are verified by headless render-and-look. The design source of truth is `docs/plans/2026-06-29-shop-tycoon-design-bible.md`.

**Tech Stack:** Vanilla JS in one HTML file. Self-test harness `check(name, fn)` plus `runSelfTest()` (near the end of the script). Verification tooling: `?test=1` (self-tests), `?screen=NAME` (jump to a screen), and headless Microsoft Edge screenshots.

---

## Conventions for this codebase (read first)

- **No build step.** Edit `index.html` directly. All JS is in the one `<script>`.
- **House copy rules:** no em dashes in any player-facing string; no version numbers in content.
- **Self-test pattern:** add new checks next to the existing block (near the `Phase F1 self-test checks` comment, before `if (location.search.indexOf('test') >= 0)`). A check is `check('short name', function(){ return <boolean>; });`. Keep checks pure (no DOM).
- **Run the self-tests (PowerShell, headless):**
  ```powershell
  $edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"; if (-not (Test-Path $edge)) { $edge = "C:\Program Files\Microsoft\Edge\Application\msedge.exe" }
  $base = "file:///c:/Users/nickb/OneDrive%20-%20Aircraft%20Electronics%20Association/aea-shop-tycoon/aea-shop-tycoon/index.html"
  & $edge --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --virtual-time-budget=2500 --window-size=375,900 --screenshot="$env:USERPROFILE/Downloads/check.png" ($base + "?test=1")
  ```
  Then Read the PNG and confirm the green PASS banner (red = FAIL). Screenshots save to Downloads (disposable, does not sync).
- **Render a specific screen:** swap `?test=1` for `?screen=quote` (or `floor`, `dealers`, `training`, `manual`, and so on).
- **Commit cadence:** one commit per task (this is a single-file game, so per-task is the right grain). End every commit message with the trailer:
  `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`
- **Branching:** the project's established workflow is direct-to-`main` (Pages serves `index.html` from `main` root). Commit to `main` unless the user asks otherwise. Pushing updates the live demo, so push only when a task is verified.

---

## Task 1: Economy and finishability trace (analysis, no game change)

This answers the one true unknown before we tune anything: how many jobs and minutes to the early milestone and to the full Shop of the Year win.

**Files:**
- Create: `tools/economy-trace.mjs` (dev tool, not part of the shipped game)
- Update (deliverable): append findings to `docs/plans/2026-06-29-shop-tycoon-design-bible.md` section 12

**Step 1: Build the model.** In `tools/economy-trace.mjs`, replicate the documented economy with the bible's numbers (do not import from `index.html`; transcribe the constants so the model is explicit):
- Per job: `base = jobPay x aircraftTier x fit(use 1.0 solid avg) x rateMult`; `payout = quote.total x (0.85 + total/30 x 0.30)` with an assumed average `total` (model two players: a careful one at total ~24, a sloppy one at ~16); `parts = consStd`; net adds the per-4-week overhead share (`accrueOverhead`: rent by level + payroll(2 to 7 techs at ~1200 each) + insurance + dealer fees - grant).
- Track cash, rep (`max(1, round((total-12) x fit))` per job), jobs done; apply era gates (3/7/12 jobs), level gates (rep 12/35/70/110 and cash 20k/60k/150k/320k), and the award (`awardScore >= 85`, culture >= 70, Premier or level 5).

**Step 2: Run it.** `node tools/economy-trace.mjs`. Print, for the careful and sloppy players: jobs to the early milestone (first dealership + level 2), jobs to level 5, jobs to the award, and the limiting factor at each gate (cash vs rep vs culture vs dealer tiers).

**Step 3: Write findings.** Append a "Finishability trace (2026-06-29)" subsection to bible section 12 with the numbers and a concrete tuning recommendation (which gates to lower, whether per-job net needs a lift, whether the award target of 85 is reachable). Assume a job is ~60 to 120 seconds of play to convert jobs to minutes.

**Step 4: Commit.**
```bash
git add tools/economy-trace.mjs "docs/plans/2026-06-29-shop-tycoon-design-bible.md"
git commit -m "chore(balance): economy trace tool + finishability findings"
```

**Gate:** Stop and review the findings with the user before Task 2. Task 2's edits come straight from this recommendation.

---

## Task 2: Apply economy tuning

**Files:** Modify `index.html` (the `UPGRADES` array near line 490 for level rep/cash gates; the `eraGate` map in `finishDeliveries` near line 1088; `AWARD_TARGET` near line 1250; payout/overhead constants only if Task 1 says so).

**Step 1: Write failing checks** for the new target numbers, for example:
```js
check('level gates reachable: L2 rep gate <= 12', function(){ return UPGRADES.filter(function(u){return u.lvl===2;})[0].req <= 12; });
check('award target is the tuned value', function(){ return AWARD_TARGET === <NEW_TARGET_FROM_TASK_1>; });
```
**Step 2: Run `?test=1`, expect FAIL** on the new checks.
**Step 3: Edit the constants** to the Task 1 recommendation.
**Step 4: Run `?test=1`, expect PASS** (all checks green).
**Step 5: Commit.** `feat(balance): tune level/era/award gates for a finishable arc`

---

## Task 3: Map experimental glass to Halcyon Dynamics

Closes the orphan dealer so all eight makers are reachable by use.

**Files:** Modify `index.html` (`JOBS` near line 412, `JOB_SPEC` near 283, `JOB_OEM` near 1135, `SQUAWKS` near 431, optionally `SHOW_PRODUCTS`/`SHOW_JOB` near 1137/1630).

**Step 1: Write the failing test.**
```js
check('halcyon has a job and it maps back', function(){
  return !!JOBS.expglass && JOB_OEM.expglass === 'halcyon' && JOB_SPEC.expglass === 'glass';
});
check('expglass fits experimental aircraft well', function(){ return fitFor('experimental','expglass') === 'amazing'; });
```
**Step 2: Run `?test=1`, expect FAIL** ("Cannot read properties of undefined").

**Step 3: Implement.** Add to `JOBS`:
```js
expglass:{name:'Experimental Glass Panel', era:2, credReq:0, ds:'Non-cert glass for a homebuilt. All the features, none of the cert tax.', w:{work:1.3,diag:0.9,comp:0.6,fin:1.4}, pay:14000, fit:{experimental:'amazing',lsa:'amazing',taildragger:'solid',piston:'risky',twinpiston:'dead',tprop1:'dead',tprop2:'dead',ljet:'dead',mjet:'dead'}},
```
Add `expglass:'glass'` to `JOB_SPEC`; add `expglass:'halcyon'` to `JOB_OEM`; add `SQUAWKS.expglass` (reuse the `glass` squawk text or write a short new one). Optionally add a Halcyon `SHOW_PRODUCTS` entry mapped via `SHOW_JOB` (`efis` already maps to `glass`; add a distinct entry only if you want the show to feature it).

**Step 4: Run `?test=1`, expect PASS.** Then render the board to confirm the job appears: `?screen=board` and look.

**Step 5: Commit.** `feat(content): experimental glass job tied to Halcyon dealer`

---

## Task 4: Wire the specialty quality edge

Higher specialty rank speeds the four-bar fill on that job family (decision 10.8). Small, capped.

**Files:** Modify `index.html` (`runShift` multiplier assembly near lines 937-940; add a helper near `specRank` ~291).

**Step 1: Write the failing test.**
```js
check('specialty edge raises bar fill on its family', function(){
  var c={wiring:6,integ:6,trouble:6,paper:6,power:100};
  var lo=gainFor(c, specMult('glass', 0));   // unrated
  var hi=gainFor(c, specMult('glass', 4));   // authority
  return hi.work > lo.work && hi.work <= lo.work*1.20; // bonus exists but is capped
});
```
(Use a small helper `specMult(jobKey, rankOverride)` so the test does not depend on global state. If you prefer, set `STATE.spec` directly in the test instead.)

**Step 2: Run `?test=1`, expect FAIL.**

**Step 3: Implement.** Add a helper:
```js
function specEdge(jobKey){ var k=JOB_SPEC[jobKey]; return k ? (1 + specRank(k)*0.03) : 1; } // Unrated..Authority => 1.00..1.12
```
In `runShift`, fold it into `mult`:
```js
var mult=FITMULT[bay.job.fit]*credPen*specEdge(bay.job.j);
```
**Step 4: Run `?test=1`, expect PASS.**

**Step 5: Surface it (small UI):** in the bay detail or quote screen, show the specialty rank for the job's family so the bonus is legible (one line, reuse `specName`/`SPEC_RANK`). Render `?screen=quote` and look.

**Step 6: Commit.** `feat(work): specialty rank now gives a capped quality edge`

---

## Task 5: Personality hidden for new, shown for known

Decision 10.6. The board shows personality only for customers already on the book; new walk-ins stay a surprise, and a known customer keeps their stored personality.

**Files:** Modify `index.html` (`SCREENS.board` near 868-876 for display + the pick handler at 875; add a lookup helper near `ensureCustomer` ~1555).

**Step 1: Write the failing test.**
```js
check('known customer reuses stored personality', function(){
  STATE.customers={}; var c=ensureCustomer('Test Pilot','piston','status');
  return customerPersonality('Test Pilot') === 'status' && customerPersonality('Nobody New') === null;
});
```
**Step 2: Run `?test=1`, expect FAIL.**

**Step 3: Implement.** Add:
```js
function customerByName(name){ var ks=Object.keys(STATE.customers); for(var i=0;i<ks.length;i++){ if(STATE.customers[ks[i]].name===name) return STATE.customers[ks[i]]; } return null; }
function customerPersonality(name){ var c=customerByName(name); return c?c.personality:null; }
```
In `SCREENS.board`, for each prospect render a personality chip only when `customerPersonality(b.owner)` is non-null (label it "REGULAR: SAFETY" style). In the pick handler, set `ctype` to the known personality if present, else `pick(CUSTYPES).k`:
```js
var known=customerPersonality(b.owner); STATE.pendingJob={a:b.a,j:b.j,fit:b.fit,owner:b.owner,ctype:known||pick(CUSTYPES).k};
```
**Step 4: Run `?test=1`, expect PASS.** Render `?screen=board` and look (new prospects show no personality chip).

**Step 5: Commit.** `feat(customers): personality hidden for new, shown for returning customers`

---

## Task 6: Re-wire the safety beats (spec pillar)

Decision 10.7. Bring back the orphaned `HF[]` rush/cut-corners/push-through choices as a chance-per-shift beat, using the writing that already exists.

**Files:** Modify `index.html` (`runShift`/`endShift` near 933-958 to trigger; add `SCREENS.hf` and a resolve flow; `STATE.hf`/`recentHF` already exist in `makeState`).

**Step 1: Write the failing test.**
```js
check('HF beat pool is wired and each beat resolves to a toned result', function(){
  return Array.isArray(HF) && HF.length>0 && typeof HF[0].safe.run==='function'
      && ['good','neutral','bad'].indexOf(HF[0].safe.run().tone) >= 0;
});
check('pickHF avoids the recently shown beat', function(){
  var s={recentHF:[0]}; var i=pickHFIndex(s, 1); return i!==0 || HF.length===1;
});
```
**Step 2: Run `?test=1`, expect FAIL** (`pickHFIndex` not defined).

**Step 3: Implement the trigger.** Add `pickHFIndex(state, seedIndexAvoid)` that returns an `HF` index not in `state.recentHF` (fall back to any if all recent). In `runShift`, after bars advance and before `endShift()`, fire with a guard so it does not nag:
```js
if(STATE.bays.some(function(b){return b.job && b.shiftsDone<b.shiftsNeed;}) && Math.random()<0.30){
  var hi=pickHFIndex(STATE); STATE.hf=hi; STATE.recentHF=(STATE.recentHF||[]); STATE.recentHF.push(hi); if(STATE.recentHF.length>4) STATE.recentHF.shift();
  go('hf'); return; // endShift continues after the beat resolves
}
```
**Step 4: Implement `SCREENS.hf`.** Render `HF[STATE.hf].s` (the situation) and two buttons (the safe and risk labels). On tap, call the chosen `.run()`, show its `{t, tone}` result with the matching color, then a CONTINUE that calls `endShift()` (so the post-shift flow resumes exactly where it left off). Match the existing card/button kit. No em dashes.

**Step 5: Run `?test=1`, expect PASS.** Then force the screen and look: temporarily set the trigger chance to 1.0, run a shift via the live game (or `?screen=hf` after seeding `STATE.hf=0`), screenshot, confirm it reads cleanly at 375px, then restore 0.30.

**Step 6: Commit.** `feat(safety): restore rush/cut-corners run-it beats during shifts`

---

## Task 7: Early-climax milestone ("Regional Up-and-Comer")

Decision 10.11. A one-time celebration when the player first holds a dealership and is level 2+.

**Files:** Modify `index.html` (`makeState` ~539 to add `milestoneShown:false`; `finishDeliveries` ~1084 to check before the award check; add `SCREENS.milestone`).

**Step 1: Write the failing test.**
```js
check('early milestone triggers once at first dealership + level 2', function(){
  var s1={milestoneShown:false, level:2, dealers:{vireon:1}}; var s2={milestoneShown:false, level:1, dealers:{vireon:1}}; var s3={milestoneShown:true, level:3, dealers:{vireon:2}};
  return earlyMilestoneDue(s1)===true && earlyMilestoneDue(s2)===false && earlyMilestoneDue(s3)===false;
});
```
**Step 2: Run `?test=1`, expect FAIL.**

**Step 3: Implement.**
```js
function earlyMilestoneDue(s){ return !s.milestoneShown && (s.level||1)>=2 && Object.keys(s.dealers||{}).some(function(o){ return s.dealers[o]>=1; }); }
```
In `finishDeliveries`, before `checkAward()`:
```js
if(earlyMilestoneDue(STATE)){ STATE.milestoneShown=true; go('milestone'); return; }
```
Add `SCREENS.milestone`: a short celebratory beat (Chief acknowledges the shop is on the map, names what is left to reach Shop of the Year), one CONTINUE back to the floor. Reuse the era-event visual treatment.

**Step 4: Run `?test=1`, expect PASS.** Render `?screen=milestone` and look.

**Step 5: Commit.** `feat(progression): Regional Up-and-Comer early-climax milestone`

---

## Task 8: Shop Manual screen (onboarding, the reference half)

Decision 10.4. A persistent plain-language reference, reachable from The Shop.

**Files:** Modify `index.html` (`SCREENS.shop` nav near 1255+ to add a MANUAL card; add `SCREENS.manual`).

**Step 1: Author the content** from bible section 13 ("Shop Manual"): the loop, reading customers, the quote and kickback, the four bars and fit, overtime and fatigue, the squawk test, growing the shop, the one invoice and culture/callbacks, and how to win (five pillars + the early milestone). Short sections, plain words, no em dashes.

**Step 2: Implement `SCREENS.manual`** as scrollable panels using the existing card kit, with a BACK to The Shop. Add the nav entry in `SCREENS.shop`.

**Step 3: Verify** there is no logic to unit-test; instead render `?screen=manual` and look at 375px (readable, scrolls, every section fits, touch targets >= 44px).

**Step 4: Commit.** `feat(onboarding): persistent Shop Manual reference screen`

---

## Task 9: Guided first job (onboarding, the hand-held half)

Decision 10.4. On first run, Chief walks the player through one complete loop, naming each factor; skippable.

**Files:** Modify `index.html` (`makeState` add `tutorial:true` (or a step index); add lightweight first-run callouts keyed by screen; a "skip tutorial" control).

**Step 1: Design the step map.** One callout per loop screen on first pass: board (pick a good fit), meet (match the approach, why match matters), quote (tier + kickback + ceiling), assign (staff a tech), floor/run (the four bars), squawk (the test), review/collect (the single invoice and the relationship payoff). Each callout is a small Chief bubble with NEXT and a global SKIP.

**Step 2: Implement** a `tutorialCallout(screenKey)` that returns the current bubble (or null) based on `STATE.tutorial` step, rendered as an overlay/banner on those screens. Advance the step as the player completes each screen; clear `STATE.tutorial` on completion or skip. Reuse `chiefSprite` and the existing chief-chip styling.

**Step 3: Add a check** for the step machine (pure logic), for example:
```js
check('tutorial advances and ends', function(){ var s={tutorial:{step:0}}; tutorialAdvance(s); return s.tutorial.step===1; });
check('tutorial skip clears it', function(){ var s={tutorial:{step:2}}; tutorialSkip(s); return s.tutorial==null; });
```
**Step 4: Run `?test=1`, expect PASS.** Then play the first loop in the live game and screenshot each callout; confirm it reads at 375px and the SKIP works.

**Step 5: Commit.** `feat(onboarding): skippable guided first job`

---

## Task 10: Verify and repair currency-lapse enforcement

Watch-list item 11.2. The lapse logic exists; confirm a lapsed tech is actually blocked from dealer/cert work in scheduling and the player is told why.

**Files:** Inspect/Modify `index.html` (`SCREENS.assign` near 878-893; `canDoDealerWork`/`isDealerOrCertJob` near 1612-1615).

**Step 1: Write the failing test** (if not already enforced):
```js
check('lapsed tech cannot be scheduled on a dealer/cert job', function(){
  return canDoDealerWork({lastTrain:1}, 60)===false && isDealerOrCertJob({j:'glass'})===true;
});
check('routine job ignores currency', function(){ return isDealerOrCertJob({j:'audio'})===false ? true : true; });
```
**Step 2: Inspect `SCREENS.assign`.** If a lapsed tech can still be selected for a dealer/cert job, gate the selectable crew (disable with a "currency lapsed, send to training" note). If it is already enforced, add only the explanatory copy.
**Step 3: Run `?test=1`, expect PASS.** Render `?screen=assign` against a seeded lapsed tech and look.
**Step 4: Commit.** `fix(training): enforce and explain currency lapse in scheduling`

---

## Task 11: Final self-test and full-playthrough render pass

**Files:** none (verification only), then a final tidy commit if needed.

**Step 1:** Run `?test=1`; confirm the green PASS banner (every check, old and new).
**Step 2:** Render each key screen at 375x900 and look: `title, intro, floor, board, meet, quote, assign, baydetail, squawk, review, dealers, training, manual, milestone, aeaShow`. Confirm one consistent look, no clipping, no em dashes, touch targets comfortable.
**Step 3:** Play one full loop start to finish in the live game (open `index.html`), confirm it feels like one game.
**Step 4:** If all clean, push to update the live demo:
```bash
git push origin main
```
Then open `https://00ainick-cmd.github.io/aea-shop-tycoon/` and confirm the demo updated.

---

## Notes on ordering and risk

- Tasks 1 and 2 (trace then tune) come first so every later number tunes to a known-good arc.
- Tasks 3 to 7 are small, independent, high-confidence edits; each ships behind its own self-test.
- Tasks 8 and 9 (onboarding) come after the systems exist so the manual and the guided job describe the final game (including specialties and the milestone).
- Task 9 (guided first job) is the largest single piece; if it runs long, ship Task 8 (Manual) first so the demo is never without onboarding, and treat the guided job as a fast follow.
