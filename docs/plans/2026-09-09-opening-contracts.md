# Shop Tycoon: opening contracts and trustworthy invoices

2026-09-09. Owner approved continuing from the gameplay audit. Implemented in the existing self-contained index.html on codex/shop-tycoon-economy; no new app, bank, account system or save store.

## Player-visible changes
- Three introductory contracts use existing transponder, audio and harness job definitions. Completed contracts leave the opening board. A repeat customer connects the work; a recap shows invoice results and promises kept before open-ended play continues.
- Audio contract triggers a supplier delay after its first shift. Expedite for 650 charged as invoice COGS; agree another week for a 5% ticket discount; or wait a week without moving the promise. Each decision resolves once.
- Every staffed job gets a promised completion week, shown in the quote, active bay and delivery. Reviews use actual completion versus that promise, independently of diagnostic correctness. Agreed change orders extend both work and the promised date.
- Random HF interruptions removed from runShift, matching the original brief. Other random job/events are suppressed during the three-contract opening. Existing technical questions remain unchanged.
- Floor shows cash after accrued operating costs and monthly operating balance. Quotes show contribution after parts, before overhead, with estimate limitations stated.
- Annual dealer fees are prorated across twelve game months. Elapsed costs accrue before composing the current invoice. Re-rendering and multiple ready bays cannot accrue the same month twice.
- Charisma progression moves from accepting a quote to committing a staffed job, with repeat protection.
- Job/crew/bay cards and sound are native keyboard controls. Improved shop-name wrapping, Chief contrast and readable financial text. Toasts no longer intercept pointer input; scroll margins keep actions clear of fixed navigation.

## Verification
- tools/verify-economy.cjs: 14 new actual-engine checks, all 48 existing self-tests, and keyboard startup/sound/bay/prospect/quote/assignment path pass.
- tools/play-opening.cjs: completed each of expedite, reschedule and wait through the real phone UI. Assertions verify three completed contracts, recap reached, no random HF screen, correct delivery-timing result and no page errors. Desktop 1366x768 and phone 390x844 screenshots inspected.
- Full in-game-year fee test verifies exactly 500 in annual incremental Larkfield costs, including real accrual calls. Regression cases include zero elapsed time, repeated accrual, current invoice and two ready bays.
- git diff --check passes. No production deployment or main push.

Run tests with an installed Playwright module, Microsoft Edge (or BROWSER_CHANNEL), and Node:

    node tools/verify-economy.cjs
    node tools/play-opening.cjs

Set PLAYWRIGHT_MODULE to an absolute Playwright module path if not installed in local node_modules. CONTRACT_CHOICE selects expedite, reschedule or wait; default reschedule. Optional SCREENSHOT_DIR saves captures to an existing folder.

## Remaining audit work
This implements the first improvement pass and a playable three-contract opening, not the whole audit backlog. Rival account competition, deeper crew-capacity decisions, training-driven diagnostic choices and campaign save/resume decisions remain. Session-only state is preserved per the locked spec. The campaign still needs full award-completion and AEA member playtesting before claims about balance or engagement. Monthly operating estimates use current shop rates, not a historical accounting ledger. The old economy-trace script remains an approximation and is not the verification source for this pass.
