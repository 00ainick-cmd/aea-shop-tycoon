# Review-driven overhaul: stakes, skill, realism, UX, content

**Date:** 2026-07-28. **What this is:** the record of a five-pass overhaul driven by a full multi-agent review (game design, avionics realism, mobile UX, spec compliance, economy/bugs; every finding adversarially verified against the code) plus a hands-on playtest. Five commits, one per pass.

## Pass 1: Stakes (the economy has teeth)

- Avionics gear carries real COGS. The shop buys the boxes: 80% of list as a walk-in, 70/62/55% at Stocking/Authorized/Premier. A dealership now earns margin on every sale, not just the premium upsell. Non-OEM materials cost 60%, consumables cost 80% of the standard line regardless of what you quote (LEAN undercharges, PADDED is a margin bet).
- Deliveries under 12/30 get 30% of the bill withheld, as its own invoice line.
- The customer ceiling is computed from the job, not your labor rate. Premium rate eats your own headroom; Value rate earns a price-fairness review bonus.
- The quote mood readout is a coarse band that straddles the true ceiling. An over-budget send burns interest; the second balk (or a cold tire-kicker, 50%) walks for good and takes the lead off the board.
- Charisma grows on closed deals, not on pitch matches.
- Wages ~3.3x (1500 + cred*1200 + avgSkill*180), labeled /mo, charged per elapsed 4-week month with multi-tick catch-up, accrued before milestone/era/season beats. Payroll is now THE cost, as in a real shop.
- Review make-good: costs 25% of the job ticket (800 min, 6000 cap), recovers at most +2 stars to a max of 4, twice per year. You cannot scrub your way to the award.
- The job board rolls once per week. Taken and walked leads leave it.
- Poach events skip techs mid-job; a bay stranded with no crew returns its job (-2 rep) instead of softlocking.
- Game-over line moved from -4,000 to -25,000 (the bank carries a rough month, not a rough quarter), with a warning toast at -10,000.

## Pass 2: Skill (the loop's decisions are real)

- The delivery functional test is interactive. Clean-bench chance = 0.35 + best troubleshooting*0.04 + diag/900 (cap 0.90); when a squawk surfaces the player chases it with a job-matched puzzle and the answer decides cleared-on-bench vs slipped (+70/-45 diag).
- Every squawk distractor is a plausible avionics move (swap the good box, treat the symptom, chase the wrong system). Explanations now say why the tempting wrong answer fails.
- Cold walk-ins hide their personality: blurb only; charisma 5+ adds a gut read; returning customers are an open book. A badly pitched cold tire-kicker can walk mid-pitch (35%).

## Pass 3: Realism numbers

- 91.411 base 1,600 / 91.413 base 1,100, one shift each: fast, steady, lower-ceiling work as designed.
- Training currency gates cert and transponder tests (the most regulated work in the building), not just dealer and credentialed jobs.
- Safety culture erodes from choices: risky judgment branches -3 on a bite, -1 even when you get away with it; overtime -1; fatigue persists between jobs (techs recover +15/idle shift, +30 at delivery, never reset to 100). Callbacks, incidents, and FAA enforcement are reachable.
- Eras gate on jobs AND level: 2 at 5 jobs, 3 at 14 jobs + level 2, 4 at 26 jobs + level 3, via thresholds that cannot be missed.
- AOG payout scales with era: (3,000-5,500) * (1 + (era-1)*0.8).

## Pass 4: UX

- One bottom bar ever: tabbed screens render actions in-content; has-tabs padding 150px to 84px.
- Press Start 2P floors at 8px. Small metadata (HUD labels, season date/note) switches to VT323; chips floor at 7px; sound button stays 44px.
- Same-screen re-renders preserve scroll (tier taps, crew picks).
- Dealer signings confirm on a dedicated screen (buy-in, annual fee, your buy price). Dealer cards press like cards.
- Fonts embedded as base64 woff2 (latin subsets, ~41KB). No CDN; the single file is truly self-contained.

## Pass 5: Content

- AEA Show: three era-appropriate reveals, one per tap, headliner last, then a closing beat that pays +3 rep / +4 AEA standing on screen and starts the demand wave.
- Meridian Avionics: ninth line, era 3, steepest reqs (rep 40/70/100), fattest margins, sells navigators via the radio job so sales bank from day one. Chief tip points at the climb.
- Vance Mercer is the named rival in poach events, the circling beat, and Chief's loyal-account warnings.
- Change-order and anxious-owner calls fire during shifts (18%, only when nothing is deliverable). Change orders add COGS with the ticket.
- Customer Book invite-back: 500 calls a Regular+ account in; the lead survives board rerolls until seen or walked (8-week per-customer cooldown).
- Dev-seeded reviews/customers removed (the wall is earned) and the dead hire/training screens deleted.

## Verification

- 48/48 self-tests (7 added: withheld line, Meridian, dealer buy-price curve, show lineup, invite drop, cert sizing, clean opening state).
- tools/economy-trace.mjs re-transcribed to the shipped numbers. Careful vs sloppy now diverges (L5 at job 37 vs 44; stars 4.0 vs 2.67), a small-jobs-only strategy at scale loses money, and the award bottlenecks on the workforce pillar unless you actually develop people, which is the game's thesis.
- Full scripted playtest at 375px: zero console errors; certs net ~1,700; the ~9,700/mo overhead visibly lands inside an invoice; era 2 at job 5.

## Known follow-ups (not blocking)

- Rep from events still accumulates fast; upgrade gates are effectively cash-gated. Revisit if upgrades feel unearned.
- The "push the schedule / cut corners for margin" player-initiated risk levers from spec 3.9 remain unbuilt; today risk lives in the HF branches and overtime.
- Headless Edge screenshots on this machine render a wider-than-375 viewport (tooling artifact only; live browser at 375 measures zero overflow).
