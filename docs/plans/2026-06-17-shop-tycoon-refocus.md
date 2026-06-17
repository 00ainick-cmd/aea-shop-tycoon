# Shop-First Refocus Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reshape the working AEA Member Shop Tycoon prototype into a shop-first game where customer relationships, customer reviews, a mentor Chief, deep training, and AEA influence form one self-reinforcing loop.

**Architecture:** Keep the prototype's single-file `SCREENS = {}` dispatch engine, hangar SVG, Web Audio chiptune, seasons, dealer/credential ladders, and P&L plumbing. Add five new systems as new state fields + new screen functions, reweight the Shop-of-the-Year award, then do one art-polish pass. Verify pure logic with an in-page `?test=1` self-test harness (PASS/FAIL banner, ships dormant) and verify every screen by rendering to PNG with headless Edge and looking.

**Tech Stack:** One self-contained HTML file, vanilla HTML/CSS/JS, no build step, no localStorage/sessionStorage. Mobile-first portrait. Headless Microsoft Edge for render verification.

**Design source:** `docs/plans/2026-06-17-shop-tycoon-refocus-design.md`. Read it before starting.

---

## Conventions (read once, apply to every task)

**Files.**
- BUILD TARGET (all edits go here): `aea-shop-tycoon/index.html` (the shipping game; created in Task 0, originally named "AEA Member Shop Tycoon.html", renamed to index.html for web deploy).
- REFERENCE ONLY (never edit): `prototype/AEA Member Shop Tycoon.html`.
- Paths are relative to the game folder root: `c:/Users/nickb/OneDrive - Aircraft Electronics Association/aea-shop-tycoon/aea-shop-tycoon/`.

**Constraints that fail the task if broken.** One HTML file, vanilla JS, no build. No localStorage/sessionStorage (session memory only). Flexbox + min-height, page must scroll, never a fixed viewport-height cap. Touch targets >= 44px, no hover-only controls. No em-dashes in any copy. No version numbers in file names or content. Write large changes in chunked append/edit passes (the file is ~1200+ lines; do not attempt one giant full-file Write, it exceeds the output cap and kills the build).

**The in-page self-test harness (logic verification).** A `runSelfTest()` function plus a `?test=1` mode. When the URL has `test`, the page renders only a test panel listing each check as PASS (green) or FAIL (red), with a single overall banner at top. Each logic task adds checks here first (they FAIL because the function does not exist yet), then implements until they PASS. The harness is inert in normal play.

**Render verification command (PowerShell, primary shell).** Replace OUT and optional QUERY each time:
```powershell
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"; if (-not (Test-Path $edge)) { $edge = "C:\Program Files\Microsoft\Edge\Application\msedge.exe" }
$game = "c:/Users/nickb/OneDrive - Aircraft Electronics Association/aea-shop-tycoon/aea-shop-tycoon/index.html"
& $edge --headless --disable-gpu --hide-scrollbars --window-size=412,915 --screenshot="c:/Users/nickb/Downloads/shoptycoon_OUT.png" ("file:///$game" + "QUERY")
```
Then Read the PNG and actually look at it. Phone size is 412x915; for the desktop check use `--window-size=1366,768`. For a self-test screenshot, set QUERY to `?test=1`.

**Commit cadence.** Commit after each task with a clear message. Do NOT push. (Nick commits/pushes only on request; commits are fine, pushes are not.) Use a commit-message file with `git commit -F` if the message has characters that PowerShell would mangle.

**Reference data to reuse from the prototype** (open it, copy the definitions): customer personalities + approach matching, the quote/kickback math, 91.411/91.413 inspections, the credential ladder (`CRED_SKILL`, `credName`), the dealer ladder, `SPECS`/specialty thresholds, the squawk troubleshooting bank (`SQUAWKS`), `mkCrew`, `makeState`, the `SCREENS`/`go()`/`render()` flow, and the seasonal calendar helpers (`gMonth`, `seasonKey`, `season`).

---

## Phase 0: Setup and the test harness

### Task 0: Seed the shipping game file from the prototype

**Files:**
- Create: `aea-shop-tycoon/index.html` (copy of the prototype)

**Step 1:** Copy the prototype to the build target verbatim.
```powershell
Copy-Item "c:/Users/nickb/OneDrive - Aircraft Electronics Association/aea-shop-tycoon/aea-shop-tycoon/prototype/AEA Member Shop Tycoon.html" "c:/Users/nickb/OneDrive - Aircraft Electronics Association/aea-shop-tycoon/aea-shop-tycoon/index.html"
```
**Step 2:** Render the build target at phone size (no query). Expected: the title screen draws, no console-blocking errors, page scrolls.
**Step 3:** Commit. `feat(game): seed shipping file from prototype`

### Task 1: Add the in-page self-test harness shell

**Files:** Modify the build target (add near the end of the `<script>`, before the initial `render()` call).

**Step 1 (write the harness):** Add:
```javascript
var SELFTESTS = [];
function check(name, fn){ SELFTESTS.push({name:name, fn:fn}); }
function runSelfTest(){
  var rows='', pass=0, fail=0;
  SELFTESTS.forEach(function(t){
    var ok=false, msg='';
    try { ok = !!t.fn(); } catch(e){ ok=false; msg=String(e&&e.message||e); }
    if(ok) pass++; else fail++;
    rows += '<div style="padding:6px 10px;font-family:monospace;color:'+(ok?'#36e0a0':'#ff5a5f')+'">'+(ok?'PASS':'FAIL')+'  '+t.name+(msg?'  ('+msg+')':'')+'</div>';
  });
  var banner = fail===0 ? '<div style="background:#0b6b3a;color:#fff;padding:14px;font:700 20px monospace">SELFTEST PASS  '+pass+'/'+(pass+fail)+'</div>'
                        : '<div style="background:#7a1f22;color:#fff;padding:14px;font:700 20px monospace">SELFTEST FAIL  '+fail+' of '+(pass+fail)+'</div>';
  document.body.innerHTML = '<div style="min-height:100vh;background:#0a0f15">'+banner+rows+'</div>';
}
if (location.search.indexOf('test') >= 0) { runSelfTest(); } else { render(); }
```
Find the existing trailing `render();` call and replace it with this guarded block (so normal play is unchanged).

**Step 2 (add one trivial check so the harness is exercised):**
```javascript
check('harness wired', function(){ return 1+1===2; });
```
**Step 3:** Render with QUERY `?test=1`. Expected: green `SELFTEST PASS 1/1` banner with one PASS row.
**Step 4:** Render with no query. Expected: the normal title screen (unchanged).
**Step 5:** Commit. `feat(game): in-page self-test harness`

---

## Phase 1: The loop made visible (Customer Book, Reviews wall, star rating)

This phase makes the new heartbeat exist and show on screen, using seeded sample data. Wiring reviews to real job outcomes is Phase 2.

### Task 2: Customer data model + star average (pure logic, TDD)

**Files:** Modify build target (state + helpers).

**Step 1 (failing checks):** Add to the harness:
```javascript
check('relStep clamps 0..4', function(){ return relStep(4)===4 && relStep(-1)===0 && relStep(2)===3; });
check('starAvg recency-weighted', function(){
  // newer reviews weigh more; all-5 -> 5, all-1 -> 1
  return starAvg([{stars:5,week:1}])===5 && starAvg([{stars:1,week:1}])===1
      && starAvg([{stars:1,week:1},{stars:5,week:10}]) > 3; // recent 5 pulls it above midpoint
});
check('REL_RANKS has five tiers', function(){ return REL_RANKS.length===5 && REL_RANKS[4]==='Champion'; });
```
**Step 2:** Render `?test=1`. Expected: three FAIL rows (functions/constants undefined).
**Step 3 (implement):** Add:
```javascript
var REL_RANKS = ['Cold','Acquaintance','Regular','Loyal','Champion'];
function relStep(r){ return clamp(rnd(r),0,4); }
function starAvg(reviews){
  if(!reviews || !reviews.length) return 0;
  var wSum=0, sSum=0;
  reviews.forEach(function(rv){ var w = 1 + (rv.week||0)*0.15; wSum+=w; sSum+=rv.stars*w; });
  return wSum ? sSum/wSum : 0;
}
```
Add to `makeState()` return object: `customers:{}, reviewsFeed:[], starRating:0, custSeq:0`. Add a helper `function ensureCustomer(name, aircraft, personality){ ... }` that creates/returns a customer record `{id, name, aircraft, personality, rel:0, ltv:0, lastWeek:STATE.week, reviews:[], jobsDone:0}` keyed by an incrementing `custSeq`.
**Step 4:** Render `?test=1`. Expected: all PASS.
**Step 5:** Commit. `feat(game): customer model + recency-weighted star average`

### Task 3: Seed sample customers and reviews for visual development

**Files:** Modify build target (`makeState`).

**Step 1:** In `makeState`, after creating the empty maps, seed 4-5 named customers across the relationship tiers and 4-5 sample reviews in `reviewsFeed` (realistic avionics voices, no em-dashes), and set `starRating = starAvg(reviewsFeed)`. This is temporary scaffolding for Phases 1; Phase 2 generates these for real, at which point trim the seed to a small believable starting book.
**Step 2:** Render no-query. Expected: game still loads (data present, not yet shown).
**Step 3:** Commit. `chore(game): seed sample customers and reviews for UI dev`

### Task 4: Reviews wall on the Floor

**Files:** Modify build target (`SCREENS.floor`, CSS).

**Step 1:** Add a Reviews wall block to the Floor: the shop star rating (rounded to one decimal + five pixel stars) and the 3 most recent reviews as cards (star row, one-line text, customer name + aircraft). Add a "See all" button routing to a new `reviews` screen. Match the existing console-panel CSS (beveled metal, oscilloscope green). Keep copy tight.
**Step 2 (render phone):** Expected: rating and recent reviews visible on the Floor, tap targets >= 44px, page scrolls, no layout overflow.
**Step 3 (render desktop 1366x768):** Expected: still coherent, no clipping.
**Step 4:** Commit. `feat(game): reviews wall and star rating on the Floor`

### Task 5: The Customer Book screen

**Files:** Modify build target (new `SCREENS.book`, add a nav button from The Shop).

**Step 1:** Add `SCREENS.book`: a scrollable list of customer cards (name, aircraft, personality chip, relationship rank badge using `REL_RANKS` + the existing rank color classes `c0..c3`, lifetime value, last-visit, review count). Add a back button (no dead ends) and a nav entry from `SCREENS.shop`.
**Step 2 (render):** open `?` not available for deep screens via URL, so verify by temporarily setting `STATE.screen='book'` in `makeState`, render, then revert. Expected: readable roster, badges colored by tier, scrolls, back button present.
**Step 3:** Revert the temporary screen override. Commit. `feat(game): Customer Book screen`

---

## Phase 2: Reviews wired to real job outcomes + recovery

### Task 6: The review generator (pure logic, TDD)

**Files:** Modify build target.

**Step 1 (failing checks):** Add:
```javascript
check('review: clean job from happy fit -> high stars', function(){
  var r = computeReview({quality:0.95, onTime:true, priceFair:1, persoMatch:true}, {personality:'safety'});
  return r.stars>=4 && r.text.length>0;
});
check('review: gouged budget customer -> low even if quality high', function(){
  var r = computeReview({quality:0.95, onTime:true, priceFair:-1, persoMatch:false}, {personality:'budget'});
  return r.stars<=2;
});
check('review: rushed sloppy -> low', function(){
  var r = computeReview({quality:0.4, onTime:false, priceFair:0, persoMatch:true}, {personality:'status'});
  return r.stars<=2;
});
check('stars always 1..5 integer', function(){
  var r = computeReview({quality:0, onTime:false, priceFair:-1, persoMatch:false}, {personality:'tire'});
  return r.stars>=1 && r.stars<=5 && r.stars===Math.round(r.stars);
});
```
**Step 2:** Render `?test=1`. Expected: four FAIL.
**Step 3 (implement `computeReview(outcome, customer)`):** Score from a base, weighted by `quality` (the dominant term), `onTime`, `priceFair` (-1 gouged .. +1 generous), and `persoMatch`. Clamp to 1..5 integer. Pick the review text from a small bank keyed by `customer.personality` and the star band (e.g., 5, 3-4, 1-2), written in that persona's voice, no em-dashes. Return `{stars, text}`. Put the full scoring and the text banks here.
**Step 4:** Render `?test=1`. Expected: all PASS.
**Step 5:** Commit. `feat(game): review generator from job outcome`

### Task 7: Wire reviews into Collect Payment + relationship/referral effects

**Files:** Modify build target (`SCREENS.result`/Collect Payment + the review screen).

**Step 1:** At Collect Payment, build the `outcome` from the just-scored job (map the four quality bars to `quality`, rushed/overtime flags to `onTime`, the quote-vs-budget to `priceFair`, the approach-vs-personality to `persoMatch`), call `computeReview`, push to `reviewsFeed` (cap length, keep recent), recompute `STATE.starRating = starAvg(reviewsFeed)`, update that customer's `reviews`, `ltv`, `jobsDone`, `lastWeek`, and step `rel` up on a good review / down on a bad one. On a 4-5 star result from a Loyal/Champion, roll a referral that adds a warm prospect to the next board.
**Step 2:** Show the new review on the Collect Payment screen as the closing beat (the customer's voice), then it appears on the Floor wall afterward.
**Step 3 (render):** play a job through to Collect (or drive state directly) and render. Expected: a review appears, star rating updates, no statement popup anywhere.
**Step 4:** Confirm no periodic/quarterly statement popup remains anywhere (grep the file for the old statement screen and remove its trigger). Commit. `feat(game): reviews settle at Collect Payment with relationship and referral effects`

### Task 8: Respond-to-review recovery beat

**Files:** Modify build target (new `SCREENS.reviewRespond`, button on low reviews).

**Step 1:** On any 1-2 star review in the feed, show a "Respond" button. `SCREENS.reviewRespond` offers: own it + free rework (costs one bay-shift of capacity now or next job, recovers the customer's relationship by one step, flips the review to answered with an improved star and a recovery line), or let it ride (no cost, review stands). Mark `answered:true`. Recompute star rating.
**Step 2 (render):** drive a 1-star into the feed, render the respond screen, choose rework, render the feed. Expected: review shows answered + recovered, rating recomputed, back button present.
**Step 3:** Commit. `feat(game): respond-to-review recovery loop`

---

## Phase 3: Chief the mentor (contextual advisor)

### Task 9: Chief rules engine (pure logic, TDD)

**Files:** Modify build target.

**Step 1 (failing checks):** Add:
```javascript
check('chief: dealer-wave tip fires when wave up and not a dealer', function(){
  var s = {demandWave:{brand:'Meridian',product:'SkyNav 750'}, dealers:{}, _seenTips:{}};
  var t = pickChiefTip(s); return t && t.id==='dealerWave';
});
check('chief: rating-slip tip fires below 3.9', function(){
  var s = {starRating:3.7, demandWave:null, dealers:{}, _seenTips:{}};
  var t = pickChiefTip(s); return t && t.id==='ratingSlip';
});
check('chief: no tip when nothing applies', function(){
  var s = {starRating:4.8, demandWave:null, dealers:{}, _seenTips:{}, crew:[], customers:{}};
  return pickChiefTip(s)===null;
});
check('chief: once-tips not repeated', function(){
  var s = {starRating:3.7, demandWave:null, dealers:{}, _seenTips:{ratingSlip:true}, crew:[], customers:{}};
  var t = pickChiefTip(s); return !t || t.id!=='ratingSlip';
});
```
**Step 2:** Render `?test=1`. Expected: FAIL.
**Step 3 (implement):** Add `_seenTips:{}` to `makeState`. Build `CHIEF_TIPS = [{id, priority, when(s)->bool, text(s)->string, once?}]` covering at least: `dealerWave` (the SkyNav 750 example, the full road in Chief's voice), `ratingSlip` (below 3.9), `trainingLapse` (a tech's `trainedThrough` within ~1 month of now), `coldLoyals` (Loyal/Champion customers not served in N weeks), `apprenticeReady` (program available, not started), `eraTurn` (new era arriving). `pickChiefTip(s)` returns the highest-priority tip whose `when` is true and not already in `_seenTips` (for `once`), else null. Put the full tip copy here, plain language, no em-dashes.
**Step 4:** Render `?test=1`. Expected: all PASS.
**Step 5:** Commit. `feat(game): Chief advisor rules engine`

### Task 10: Chief chip on the Floor + tip modal

**Files:** Modify build target (`SCREENS.floor`, new `SCREENS.chief`, CSS, `renderHUD` maybe).

**Step 1:** When `pickChiefTip(STATE)` is non-null, show a glowing "Chief" chip on the Floor. Tapping opens `SCREENS.chief`: Chief portrait/sprite, the tip text, and where relevant a "Flag the steps" action that stores a short checklist (e.g., on `dealerWave`) the player can revisit. Dismissing marks `once` tips seen. Use the existing `sHF`/tone for a soft cue.
**Step 2 (render):** set a state that triggers `dealerWave`, render the Floor (chip visible), render the chief screen (tip readable, steps flaggable, back button).
**Step 3:** Commit. `feat(game): Chief chip and contextual tip on the Floor`

---

## Phase 4: Training as the big focus

### Task 11: Annual training currency (pure logic, TDD)

**Files:** Modify build target.

**Step 1 (failing checks):**
```javascript
check('currency lapses after a year', function(){ return isLapsed({lastTrain:1}, 60)===true && isLapsed({lastTrain:50}, 60)===false; });
check('lapsed tech blocked from dealer work', function(){ return canDoDealerWork({lastTrain:1}, 60)===false; });
```
(Assume ~48 weeks/year; tune the threshold in the impl.)
**Step 2:** Render `?test=1`. Expected: FAIL.
**Step 3 (implement):** `isLapsed(tech, week)` true when `week - tech.lastTrain` exceeds the yearly window; `canDoDealerWork(tech, week)` false when lapsed. Surface a "current / lapses soon / lapsed" status on the crew roster (Shop screen) and block assigning a lapsed tech to dealer/certified jobs in Schedule with a clear message.
**Step 4:** Render `?test=1`. Expected: PASS. Then render the crew roster, look. 
**Step 5:** Commit. `feat(game): annual training currency with dealer-work gating`

### Task 12: Apprenticeship program as the flagship

**Files:** Modify build target (`SCREENS.apprentice` exists; deepen it + new recruit/graduate flow).

**Step 1:** Make starting a registered apprenticeship a real decision: requires a certified mentor tech (spends some bench time), unlocks cheap apprentice recruiting, grant funding flag (offsets cost, shows as revenue at Collect/finance), and a structured growth path (apprentices gain skill faster via OJT + coursework). Add graduation events: an apprentice reaching CAET fires a ceremony beat, bumps AEA standing + reputation, and the grad becomes a loyal, low-poach tech. Track `gradCount` (already in state) and feed it to the award.
**Step 2:** Teaching-through-play: when training a tech (formal or OJT milestone), surface the existing squawk mini-game (`SQUAWKS`) plus a one-line real avionics fact, so the player learns the trade while their tech levels.
**Step 3 (render):** drive the apprenticeship flow, render the program screen and a graduation beat. Look.
**Step 4:** Commit. `feat(game): apprenticeship flagship with graduation beats and teach-through-play`

### Task 13: Fall conference as the batch training refresh

**Files:** Modify build target (fall seasonal event).

**Step 1:** Make the fall conference the efficient way to refresh currency for a batch of techs: choose how many to send, see cost + downtime (those bays idle that week) + payoff (currency refreshed, skill gain, AEA standing, a networking perk). Sets `lastTrain = STATE.week` for those sent. No periodic statement; costs settle in the normal money flow.
**Step 2 (render):** trigger the fall event, render the decision screen, look. Confirm tradeoff is legible.
**Step 3:** Commit. `feat(game): fall conference batch training refresh`

---

## Phase 5: Slim AEA Show, demand waves, award reweight

### Task 14: Demand wave bias (pure logic, TDD)

**Files:** Modify build target.

**Step 1 (failing checks):**
```javascript
check('demand wave biases board toward the product domain', function(){
  var withWave = boardBiasWeight('glass', {demandWave:{domain:'glass'}});
  var noWave   = boardBiasWeight('glass', {demandWave:null});
  return withWave > noWave;
});
check('demand wave decrements and clears', function(){
  var s={demandWave:{domain:'glass',weeksLeft:1}}; tickDemandWave(s); return s.demandWave===null;
});
```
**Step 2:** Render `?test=1`. Expected: FAIL.
**Step 3 (implement):** `boardBiasWeight(domain, s)` returns a higher weight for jobs matching the active wave's domain; wire it into the board generator so a live wave fills the board with owners wanting that work. `tickDemandWave(s)` decrements `weeksLeft` and clears at 0. Call the tick on week advance.
**Step 4:** Render `?test=1`. Expected: PASS.
**Step 5:** Commit. `feat(game): demand wave board bias`

### Task 15: Slim the AEA Show to one modal + the move

**Files:** Modify build target (replace the multi-step `SCREENS.aeaShow`).

**Step 1:** Replace the multi-tap reveal with one compact modal: the year's headline new product (one pixel-art reveal, era-appropriate, fictional brand), a one-line hype, the demand wave it sets (`STATE.demandWave = {...}`), and ONE actionable move (grab the dealer opportunity OR book training seats) with a clear close. Fewer taps, real consequence. Keep the buzz/AEA-standing bump.
**Step 2 (render):** trigger spring, render the show modal at phone size. Expected: single focused screen, the move is tappable, closes to Floor, demand wave now active.
**Step 3:** Commit. `feat(game): slim AEA Show with demand wave and one actionable move`

### Task 16: Reweight the Shop-of-the-Year award (pure logic, TDD)

**Files:** Modify build target (`SCREENS.awardeval` / scoring).

**Step 1 (failing checks):**
```javascript
check('award: reputation + workforce dominate', function(){
  var loved = awardScore({starRating:4.8, gradCount:6, culture:90, dealerScore:1, cash:20000});
  var rich  = awardScore({starRating:3.0, gradCount:0, culture:50, dealerScore:1, cash:500000});
  return loved > rich; // you cannot buy the award
});
```
**Step 2:** Render `?test=1`. Expected: FAIL.
**Step 3 (implement):** `awardScore(s)` is a weighted composite with customer reputation (star rating + loyal-account count) and workforce development (grads + advanced techs) as the heaviest terms, safety/quality high, dealer portfolio medium, cash necessary-but-capped. Wire into the award evaluation screen and the win gate.
**Step 4:** Render `?test=1`. Expected: PASS. Render the award screen, look.
**Step 5:** Commit. `feat(game): reweight Shop-of-the-Year toward customers and workforce`

---

## Phase 6: Art-polish pass (one elevated-Genesis sweep)

### Task 17: Cohesion sweep across every screen

**Files:** Modify build target (CSS + screen markup).

**Step 1:** One pass for a single consistent look: same header treatment, the same card and button kit, consistent spacing, the beveled riveted metal panels, oscilloscope-green readouts, amber for warnings/prestige, badge chips for dealers/specialties/relationship ranks, the season banner as a real status device. Spend the boldness on the hangar hero; keep menus calm. Respect reduced-motion.
**Step 2 (render every screen at phone size):** title, Floor, Get Work, Meet, Quote, Schedule, Bay, Collect Payment + review, Reviews wall, Customer Book, Chief, The Shop, Training, Apprenticeship, Dealers, Recruiting, Fall Conference, AEA Show, Award. For each: read the PNG and fix label collisions, clipping, tiny taps, and any screen that looks like a different app. (Apply the SVG label rule: never a label sitting on a line/shape; give every label a clear lane.)
**Step 3 (render desktop 1366x768):** spot-check the main screens for clipping.
**Step 4:** Commit. `style(game): elevated-Genesis cohesion pass`

### Task 18: Final full-playthrough verification

**Files:** None (verification only).

**Step 1:** Play a full loop end to end in a real browser window: find work, win a customer, quote, schedule, run shifts, collect, read the review, watch the rating move, get a referral, hit a Chief tip, train a tech, run the apprenticeship, attend the slim show and ride the wave, reach an award evaluation. Confirm the loop in the design doc actually pays back.
**Step 2:** Render `?test=1` one last time. Expected: all checks PASS.
**Step 3:** Confirm no dead-end screens (every screen has a back/exit path) and no banned patterns remain (no periodic statement, no random HF popup, no multi-tap slideshow).
**Step 4:** Commit. `chore(game): full playthrough verification pass`

---

## Done means

The five pillars are live and interlock: customers are named people whose relationships climb, every job ends in a review that moves a visible star rating and can be answered, Chief speaks contextually off real state, training (currency + apprenticeship + teach-through-play) is the deepest system, AEA is the engine and the show is one slim consequential modal, and the award rewards a shop people love and the people it grew. All self-tests PASS, every screen renders clean on phone and desktop, and the file still obeys every tech constraint.
