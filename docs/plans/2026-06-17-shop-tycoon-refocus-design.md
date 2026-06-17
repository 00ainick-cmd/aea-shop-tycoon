# AEA Member Shop Tycoon: The Shop-First Refocus

**Date:** 2026-06-17
**Status:** Approved design. Source for the build plan.
**Supersedes (in focus, not in canon):** the board-campaign endgame as the primary arc. The cast, OEM names, FAA references, eras, and tech constraints from the existing docs still hold.

---

## Locked decisions

1. **Focus: refocus on the shop.** The moment-to-moment game is running a great shop (customers, reviews, training, AEA payoff). Era progression stays as backdrop flavor. The 40-year bench-to-board saga and board-campaign endgame are set aside for a later chapter, not built now.
2. **Brands: fictional.** Keep Meridian (the Garmin-class prize), Vireon, Kestrel, Quanta, Tindall, Larkfield, Stratoline, Halcyon, Tempest. Winks at real houses, trademark-safe, vendor-neutral. Real FAA references stay (91.411, 91.413, ADS-B, Part 145).
3. **North star: fun and award-winning.** Do not design around "what it's for." Make the best game; the recruiting value follows from quality, not from being told.

## Build approach

Reshape the working prototype in place. Do not rebuild from zero. Keep the proven `SCREENS = {}` engine, the hangar SVG, the Web Audio chiptune, the money math, the seasons, the dealer ladders, and the training scaffold. Add the five new systems as new state fields + new screen functions, reweight the award, and finish with one art-polish pass. The three patterns the old spec rejected (passive product slideshow, periodic financial statements, random human-factors popups) are exactly what this refocus replaces, so they are removed as part of the work.

Carry over all tech constraints unchanged: one self-contained HTML file, vanilla HTML/CSS/JS, no build step, mobile-first portrait, no localStorage/sessionStorage (session memory only), flexbox with min-height (page must scroll, never a fixed viewport-height cap), 44px touch targets, no hover-only controls, no em-dashes in copy, no version numbers in file names or content. Per the repo build-standards: write the file in chunked append passes, not one giant write.

---

## The new center of gravity: one loop that pays back

The engine moves from "climb to the AEA board" to "build the shop everyone on the field wants to fly to." The whole design in one breath:

> **Train your people -> do better work -> earn better reviews -> reviews build reputation and bring referrals -> referrals bring better customers and deeper relationships -> loyal customers fund more training and unlock dealers -> repeat.**

- **AEA is the engine in the middle:** credentials, courses, the apprenticeship, the convention. Every meaningful upgrade traces back to AEA.
- **Chief is the coach** narrating the loop and pointing to the next right move.
- **Reviews are the visible scoreboard.**

No single number wins the game; each system feeds the next.

---

## Pillar 1 - Customers become people (the Book of Business)

Customers stop being anonymous tickets. Each is a named person with an aircraft, a personality (budget / status / safety / tire-kicker, already in the prototype), and a relationship that climbs:

`Cold -> Acquaintance -> Regular -> Loyal -> Champion`

- **New screen: the Customer Book.** Roster of everyone served. Per customer: name, aircraft, personality, relationship rank, lifetime value, last visit (week), review history.
- **Three acquisition channels:** walk-ins (the job board), Drum Up Business (ramp / fly-in booth / ads, already present), and the new compounding one, **Referrals** - Loyal and Champion customers send warm prospects for free, which lessens the need for ad spend.
- **Relationships compound across eras.** A Regular returns and upgrades through the panel generations (steam -> glass -> ADS-B). Higher relationship = closes easier, accepts the premium upsell, tolerates a fair-but-higher quote, forgives one slip. Neglect (declining their work, sloppy delivery) churns them; a churned Champion leaves a brutal review.

**State additions:** a `customers` map keyed by id `{name, aircraft, personality, rel (0-4), ltv, lastWeek, reviews:[], jobsDone}`. Prospects on the board reference an existing or new customer id. Relationship deltas applied at Collect Payment.

## Pillar 2 - Reviews are the heartbeat

After Collect Payment, the customer leaves a **star rating (1-5) and a one-line review in their own voice.** Computed from how the job actually ran:

- The four quality bars (Workmanship, Diagnostics, Compliance, Finish).
- On-time vs. rushed.
- Fair price vs. gouged (relative to their budget and personality).
- Personality match (gouging a budget flyer on premium drops the rating even with perfect work).

Mechanics:

- **Live Reviews wall** on the Floor: recent reviews scroll like a public review page for the shop. Emotional payoff: you see what the field says.
- **Running star rating IS local reputation.** It gates walk-in volume, prospect quality, and referral rate, and is a top Shop-of-the-Year input. Recent-weighted average so recovery is possible.
- **Bad reviews bite and can be answered.** A 1-star tanks the average and scares prospects. **Respond to a review** is a charisma beat: own it and offer free rework (costs a bay-shift, recovers the customer, flips the review) or let it ride. A relationship-recovery loop.

Reviews replace the banned random popups: a review is the direct, earned consequence of the player's own choices, not a random interruption.

**State additions:** `reviewsFeed:[{cust, stars, text, week, answered}]`, `starRating` (recent-weighted), review generator that reads the just-scored job + customer.

## Pillar 3 - Chief becomes your mentor, on the floor

Chief becomes a persistent advisor who reads game state and speaks at the right moments. Never random, always specific and actionable. A "Chief" chip on the Floor lights up when he has something worth saying.

Reference line (the dealer example, in his voice):

> "Meridian's launching the SkyNav 750 this spring. Fifteen thousand on order, they say. That's a wave. But we're not a Meridian dealer yet. Here's the road: get Dana her factory cert, hold a sales floor on two other lines, keep the safety record clean. Then they invite you. Want me to flag the steps?"

Other triggers, each off a real state threshold so it always feels earned:

- Star rating slipped -> why, and what it will cost (walk-ins).
- A tech's training currency lapses soon -> point at the fall conference.
- Loyal customers going cold -> nudge a ramp pass before the rival gets them.
- Apprenticeship available and unstarted -> the case for growing your own.
- New era arriving -> what the wave means and how to ride it.

Chief is the teaching layer and the strategy layer in one. Skeptical of hype, right about fundamentals, his quiet nod is a soft reward.

**Implementation:** a `chiefTips` rules table of `{id, condition(STATE)->bool, priority, text(STATE), once?}`. Each render, evaluate; surface the highest-priority unseen tip on the chip. Optional "flag the steps" expands a short checklist the player can track.

## Pillar 4 - AEA is the engine, and the show gets slim

**More AEA influence:** AEA is visibly the source of every meaningful upgrade. Credentials, courses, the apprenticeship, AEA standing, and the convention are how the shop and its people get better. AEA standing gates the best work and is a heavy award input.

**The product launch, slimmed.** The spring AEA Show stops being a multi-tap slideshow. It becomes one compact, punchy modal:

- The year's headline new product: one reveal, pixel art, era-appropriate.
- The **demand wave** it kicks off: the board fills with owners who all want it at once, at early-adopter prices.
- **One move you can make right there:** grab a dealer opportunity or book training seats.

Fewer taps, more game. The launch matters because it changes the board and offers a decision, not because cards flip.

**State additions:** `demandWave:{product, brand, weeksLeft, premium}` that biases board generation; a single-modal show screen replacing the multi-step reveal.

## Pillar 5 - Training is the big focus

Techs are the product, so making them better is the deepest system.

- **Techs are characters who grow.** Skills (wiring, integration, troubleshooting, paperwork), a credential (Apprentice -> CAET -> CAET Advanced -> Master), **annual training currency** (lapse and they cannot do dealer/certified work until refreshed; the fall conference is the efficient fix), loyalty, and poach risk. The player watches Rook grow green -> CAET -> Master across the game.
- **The Apprenticeship Program is the flagship.** Start a registered program -> recruit apprentices cheap -> grow them fast through OJT + coursework -> they graduate into loyal CAET techs the player made. Slow, but highest loyalty and lowest poach risk, draws grant funding (AEA), and graduating apprentices is a major reputation + AEA-standing + award input. The real build-vs-buy-talent debate as a mechanic.
- **Teaching through play.** Training a tech surfaces the squawk-troubleshooting mini-game already in the prototype plus a one-line real avionics fact. Training the tech quietly teaches the player the trade. Authentic and fun, no lecture.

**State additions:** per-tech `trainedThrough` (week/year), a currency tracker in the training hub, apprenticeship program state with grant flag and graduation events tied to rep/standing/award.

---

## The win condition, reweighted

Still **AEA Shop of the Year**, reweighted to match the refocus:

| Award input | New weight |
| --- | --- |
| Customer reputation (star rating + book of loyal accounts) | Highest |
| Workforce development (apprentices graduated, techs advanced) | Highest |
| Safety / quality record | High |
| Dealer portfolio (count and tier) | Medium |
| Business scale and health (cash) | Necessary, not sufficient |

You cannot buy the award. You earn it by running a shop people love and growing the people who run it.

---

## Build order

1. **The loop made visible** - Reviews wall + star rating on the Floor, and the Customer Book. The new heartbeat; make it feel good first.
2. **Reviews wired to job outcomes** + the respond-to-review recovery beat.
3. **Chief's advisor system** - the trigger->tip rules table, starting with the dealer example.
4. **Training depth** - recurring currency, the apprenticeship flagship, teaching-through-play.
5. **The slim AEA Show + demand waves**, and reweighting the award.
6. **One art-polish pass** to the elevated Genesis bar across every screen.

## What stays from the prototype

Reused as foundation, not reference: the `SCREENS` engine and `go()/render()` flow, the hangar scene, the audio engine, the seasons/calendar, the quote line-item + dealer-kickback math, the 91.411/91.413 inspections, the credential and dealer ladders, the squawk troubleshooting, recruiting with wages and poaching, the P&L plumbing (kept, but no periodic statement popups), and the safety-culture meter. The cast (Chief, Rook, Vance Mercer) and OEM names stay.

## What gets removed

The passive multi-tap product slideshow (replaced by the slim show), any periodic/quarterly financial statement popups (money settles per job at Collect Payment), and random human-factors popups (replaced by reviews-as-consequence and the rare, heavy, contextual safety fork).
