# Resume here: AEA Member Shop Tycoon (shop-first refocus)

**Last worked:** 2026-06-17. **Where we are:** Phase 1 of 6 is built and verified. Phases 2 to 6 are planned and not yet built.

---

## How to pick up on your laptop

1. This whole folder lives in OneDrive, so it syncs to any device signed into the same OneDrive account. On the laptop, wait for OneDrive to finish syncing, then open this same folder:
   `OneDrive - Aircraft Electronics Association\aea-shop-tycoon\aea-shop-tycoon`
2. Open Claude Code in that folder and say:
   > Continue the AEA Member Shop Tycoon shop-first refocus. Read RESUME-HERE.md and docs/plans/2026-06-17-shop-tycoon-refocus.md, then build Phase 2 next, phase by phase, and let me review each phase before moving on.
3. To just play the current game, double-click `AEA Member Shop Tycoon.html` to open it in a browser.

---

## The plan (read these two files)

- **Design (the vision):** `docs/plans/2026-06-17-shop-tycoon-refocus-design.md`
- **Build plan (18 tasks, 6 phases):** `docs/plans/2026-06-17-shop-tycoon-refocus.md`

The game is one self-contained file: **`AEA Member Shop Tycoon.html`** (this is the shipping game; the `prototype/` folder is the original reference, do not edit it).

The big idea: the game now centers on running a great shop. One loop ties it together: train your people, do better work, earn better reviews, reviews build reputation and referrals, loyal customers fund more training and unlock dealers, repeat. AEA is the engine in the middle, Chief is the coach, reviews are the visible scoreboard.

---

## What is DONE (Phase 1: the heartbeat made visible)

- Customer model with relationships that climb (Cold, Acquaintance, Regular, Loyal, Champion).
- Recency-weighted shop star rating.
- A live Reviews wall and star rating on the Floor.
- A Customer Book screen (roster of named customers with relationship badges, personality, lifetime value, visit history).
- A built-in self-test (open the game with `?test=1` to see a green PASS / red FAIL banner).
- A mobile fix so it renders clean down to 375px (real iPhone width). Verified by rendering and looking.

## What is NEXT (still to build)

- **Phase 2:** Reviews wired to real job outcomes, plus the respond-to-review recovery beat.
- **Phase 3:** Chief becomes a contextual mentor on the Floor (the dealer-wave coaching example).
- **Phase 4:** Training depth: annual currency, the apprenticeship flagship, teaching-through-play.
- **Phase 5:** Slim the AEA Show to one consequential modal, demand waves, reweight the Shop-of-the-Year award.
- **Phase 6:** One art-polish cohesion pass, then a full playthrough.

---

## For the next Claude Code session (working notes)

- Build phase by phase. Nick reviews each phase before the next. Award-winning bar.
- Delegate the mechanical build to a Sonnet subagent (Nick is credit-conscious); keep design and quality judgment at the top level.
- ALWAYS verify visuals by rendering to PNG and looking, not by trusting code review. Fast render command (PowerShell):
  ```
  $edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"; if (-not (Test-Path $edge)) { $edge = "C:\Program Files\Microsoft\Edge\Application\msedge.exe" }
  $base = "file:///c:/Users/nickb/OneDrive%20-%20Aircraft%20Electronics%20Association/aea-shop-tycoon/aea-shop-tycoon/AEA%20Member%20Shop%20Tycoon.html"
  & $edge --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --virtual-time-budget=2500 --window-size=375,900 --screenshot="$env:USERPROFILE/Downloads/check.png" "$base"
  ```
  (On the laptop the path will differ if the OneDrive folder is in a different location; adjust the `$base` path. Use `?screen=NAME` to jump to a screen and `?test=1` to run the self-tests.)
- Verification screenshots get saved to the Downloads folder, which does NOT sync. That is fine; they are disposable. Everything that matters is in this game folder.
- Decisions locked: refocus on the shop (board-campaign endgame deferred), fictional brands (Meridian, not Garmin), real FAA references kept, north star is fun and award-winning.
- Git note: the machine's git repo root is the whole home directory, so do not commit/push there. Back up via OneDrive. Only set up a dedicated game repo if Nick asks.
