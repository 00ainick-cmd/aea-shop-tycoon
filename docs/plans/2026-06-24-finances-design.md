# The Books: Making the Money Real

**Date:** 2026-06-24
**Status:** Approved design. Source for the build plan.
**Game:** AEA Member Shop Tycoon (single-file `index.html`, now ~1700 lines, Phases 1 to 6 built).

---

## Locked decisions

1. **Difficulty: real but recoverable.** Costs bite and a bad stretch can put you in the red and force cuts, but a line of credit gives a recovery path so you rarely hard-fail unless reckless.
2. **Surfacing: annual reckoning + a clean Books page.** Money mostly settles at each job's invoice (clear line items). One felt yearly beat ("Books Day") brings AEA dues and the year summary. A read-only Books page is openable anytime. No nagging quarterly statements.
3. **Iron-out scope: economics now, clarity in the UI pass.** Fix how dealers/training/apprenticeship hit the money (fees, tuition, grants, dues unlocks) and balance them this pass. Their screen layout/clarity cleanup is deferred to the UI categorization pass.

## Approach

Build ON the existing cost engine, do not replace it. The game already has `quarterCosts()` (rent by level, payroll from crew wages, culture-driven insurance, OEM dealer annual fees), `quarterRevenue()` (apprenticeship grant), and `accrueOverhead()` (nets costs vs revenue every ~4 weeks into `STATE.pendingOverhead`, folded into the next invoice). The costs are correct but invisible. The work is to surface them, add AEA dues + the line of credit, enrich the hits, and balance.

Carry over all tech constraints: one self-contained `index.html`, vanilla JS, no build step, mobile-first portrait, no localStorage, no em-dashes, 44px taps. Verify by rendering and looking; logic via the in-page `?test=1` self-test harness.

---

## A. The invoice gets honest (the main money moment, every job)

Collect Payment shows a real line-item invoice the player reads:
- Labor (hours x rate)
- Parts and consumables
- Dealer fee or kickback (if premium gear sold)
- minus: any unexpected hit that happened on this job (callback, fried box, rush shipping)
- minus: shop overhead since the last job (the accrued rent/payroll/insurance/fees, shown as a visible line, not hidden in the net)
- = Net to the shop

The costs the player already pays become visible at the moment money moves. Builds on the existing `accrueOverhead`/`pendingOverhead`, surfaced as a line instead of folded silently.

## B. Annual AEA membership + Books Day (the one felt yearly beat)

Once a year (winter settle season), a single interactive screen, not a recurring statement:
- **AEA dues come due:** a real bill (scales modestly with shop size). Paying keeps AEA benefits active: training seats/discounts, the spring show, credential eligibility, dealer standing.
- **Year summary:** revenue, costs by line (rent, payroll, insurance, dealer fees, dues), net for the year, cash position.
- **Small-business move:** spend before year-end on training/a bay/tooling to invest, or bank it.
- If cash is short, the line of credit surfaces here.

**Lapse rule:** can't or won't pay dues -> AEA benefits suspend until current again (training discounts gone, show access limited, dealer standing frozen). Nothing lost permanently, fully recoverable. Dues get real teeth and reinforce AEA value. This is "more AEA influence" as economics.

## C. Unexpected hits, richer and legible (consequence, not random noise)

Expand the single low-culture callback into a small weighted set, each shown plainly with its cause:
- **Fried / DOA box** on install: eat the part cost or take an RMA delay.
- **Warranty callback** (rushed or low culture): rework cost + small rep ding.
- **Parts backorder:** delay a shift or pay rush shipping.
- **AOG call** (the good surprise): drop everything for a stranded aircraft = premium money, but it bumps the current job.

Odds tied to how the shop is run (rushing, overtime, low culture raise bad-hit odds; good culture and slack lower them). Safety/culture pays off in dollars. Also seeds the next pass (between-shift variety).

## D. Line of credit (the recovery path)

Borrow against the shop to survive a brutal stretch or fund a big move (a bay, a dealer buy-in), repaid with interest folded into overhead. Replaces the current hard game-over at low cash (`STATE.cash < -4000`) with a managed decision and a way back. Available when cash is low and at Books Day.

## E. The Books page (see your money anytime, calm and read-only)

A clean Finance screen in the Shop hub: cash on hand, this year's revenue and costs by line, dealer fees, dues coming, credit balance, and a one-line "what's coming" (dues in N weeks, next bay cost). The legibility layer and the anchor for the later UI categorization pass. No nagging, purely reference.

## F. Dealer / training / apprenticeship economics (the iron-out, money side only)

Make the numbers real, balanced, and clearly worth it:
- **Dealers:** annual fees heavy enough that a line you cannot feed is a money-loser, so going deep on 2-3 is a real choice. Premier tiers pay co-op marketing / volume rebates back as revenue that rewards leaning in.
- **Training:** tuition + bench-time cost (a tech off the floor) shown clearly against the payoff (heavier, better-paying work + dealer eligibility). Active membership gives a tuition discount (dues paying back).
- **Apprenticeship:** grant funding shown as visible revenue offsetting cheap-but-growing labor. The build-vs-buy talent math made clear in dollars.

Their screen layouts/clarity are the later UI pass; here we only make the money right and felt.

## Balance target: the squeeze

A scrappy startup feels the pinch. A bad run (overtime + dealer fees + a fried box + dues) can put you in the red and force cuts. Smart play (good culture, fed dealers, grown apprentices, paid dues) compounds. No single dominant strategy. Win condition unchanged (Shop of the Year); money is now a system you feel.

---

## What exists already (do not rebuild, extend)

- `collect()` (per-job invoice settle, review heartbeat, low-culture callback).
- `quarterCosts()`, `quarterRevenue()`, `accrueOverhead()` (the cost engine).
- `SCREENS.result` (invoice display), `SCREENS.aeaShow`, `SCREENS.fallconf`, `SCREENS.dealers`, `SCREENS.training`, `SCREENS.courses`, `SCREENS.oemcert`, `SCREENS.apprentice`, `SCREENS.shop`.
- `rollEvent()` / `personnelEvent()` (between-job events, the hook for richer hits).
- The era clock (`gYear()`, `seasonKey()`), the dealer ladder (`OEMS`, `dealerTier`), the credential ladder.

## What this pass adds or changes

- AEA membership dues + the Books Day yearly beat + lapse/benefit-suspend logic.
- The honest line-item invoice (surface `pendingOverhead` and per-job hits).
- The richer unexpected-hit set.
- The line of credit (and soften the hard game-over).
- The read-only Books page in the Shop.
- Economic balance/wiring for dealers, training, apprenticeship (numbers, not layouts).
