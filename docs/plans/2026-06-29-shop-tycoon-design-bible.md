# AEA Member Shop Tycoon: Design Bible

The single source of truth for how the game actually works. Every factor, every number, and the intent behind it. Written from the shipping build (`index.html`) so it matches reality, not just the spec.

## 0. How to use this doc

- Sections 1 to 9 document what the game does **today**, with the real numbers from the code. If a number here is wrong, the code is right and this doc is stale; fix the doc.
- Section 10 is the set of design decisions locked in the mapping session of 2026-06-29.
- Section 11 is the open questions that still need a call before the game is demo-final.
- Section 12 is the balance work to validate (especially finishability, since the demo is a shareable play-anytime link).
- Section 13 is the player-facing instruction layer we will derive from all of the above.

Two house rules carry into the game copy (not this doc): no em dashes anywhere in player-facing text, and no version numbers in file names or content.

---

## 1. The fantasy and the core loop

You run a Business and General Aviation avionics shop. You are equal parts salesman, estimator, shop foreman, and craftsman. You grow one bay into the AEA Shop of the Year.

The loop, exactly as built:

1. **Floor** (hub): your bays, your standing, the season banner, a contextual Chief tip.
2. **Get Work**: a board of three prospects, or Drum Up Business (outbound).
3. **Meet the Customer**: read the personality, pick one of three approaches, warm them up.
4. **Build the Quote**: line items, the avionics tier, the live total versus a hidden budget ceiling.
5. **Schedule**: assign free techs to the bay.
6. **Run a Shift**: every staffed in-progress bay advances, filling four quality bars.
7. **Functional Test**: a squawk puzzle gates whether a defect slips to the test flight.
8. **Delivery**: three reviewer scores out of 30.
9. **Collect Payment**: one invoice, the only place cash moves.
10. The customer leaves a **review** that moves a relationship and can refer a friend.

Spring interrupts with the **AEA Show**. Fall offers the **conference**. Eras advance as you complete jobs.

---

## 2. The owner and shop stats (the factors)

These are the live numbers the simulation tracks. Most are currently invisible to the player; section 13 decides which to surface.

| Factor | Range / start | What moves it | What it does |
|---|---|---|---|
| **Cash** | starts $6,000 | the invoice (once per job), purchases | lose if it falls below -$4,000 |
| **Field Rep** | starts 0 | job delivery (`(total-12) x fit`), events, hustle | gates shop upgrades and dealer tiers |
| **AEA standing** (`aeaRep`) | starts 0 | courses, certs, scholarships, conventions, the Show | flavor and award color; soft prestige track |
| **Star rating** | starts ~4.5 (seeded) | every review, recency-weighted | the visible scoreboard; heaviest award term |
| **Safety culture** | starts 68 (0 to 100) | crew fatigue, overtime, HF course, overhead tick | low culture causes callbacks; gates Premier and the award |
| **Charisma** | starts 3 (to 10) | +0.1 per matched approach, +2 from Business course | raises customer interest and the price ceiling |
| **Warmth** (`warm`) | transient | Drum Up Business, referrals | one-shot boost to the next customer's interest |
| **Fans** | starts 0 | +1 on every "hit" job | vanity counter shown by Rep (no other effect today) |
| **Overtime tokens** | starts 3, cap 3 | +1 on a hit; spent on the Overtime beat | burn one to slam +110 into one quality bar |

Calendar: `week` starts at 1 and ticks +1 per shift. Year and season derive from week. Seasons drive the Show (spring), conference (fall), and banner copy.

---

## 3. Get Work and the Customer

### 3.1 The board (inbound)
`newBoard()` generates three prospects. Each prospect = an aircraft + a job + the resulting fit + a named owner. Rules:
- Job pick is biased: during a demand wave the wave's job is 3x more likely; otherwise about 32% chance of an inspection (`cert`/`xpdr`), else a weighted unlocked job.
- The board is guaranteed at least one amazing-or-solid fit.
- After ad spend (`hotBoard`), dead/risky fits are rerolled toward good fits once.
- **Personality is rolled randomly the moment you pick a prospect** (`pick(CUSTYPES)`), not shown on the board.

### 3.2 Drum Up Business (outbound)
| Option | Cost | Effect |
|---|---|---|
| Work the Ramp | free, once per week | success chance `clamp(0.40 + charisma x 0.05, 0, 0.92)`; on success warmth = 22 |
| Fly-in Booth | $1,800 | warmth = 30, +2 rep, +1 AEA standing |
| Local Ad Spend | $1,200 | warmth = 16, next board biased to good fits, +1 rep |

### 3.3 The four personalities
| Personality | Wants (approach match) | Price tolerance | Notes |
|---|---|---|---|
| Budget-minded | rapport (Talk Shop) | 1.05 | watches every dollar; price weighs 2.2x in their review |
| Status-seeker | premium (Sell the Dream Panel) | 1.36 | wants the best, will pay; price weighs only 0.5x |
| Safety-minded | safety (Lead with Safety) | 1.20 | wants it right and legal |
| Tire-kicker | rapport | 1.02 | hard to close cold |

### 3.4 The Meet beat
Pick one of three approaches. Interest is set as:

`interest = clamp(26 + (match ? 34 : 8) + round(charisma x 4) + round(random x 8) + warmth, 0, 100)`

Warmth is then consumed (reset to 0). A matched approach nudges charisma +0.1. Interest feeds both the price ceiling and the review's persona-match term.

---

## 4. The Quote (money-in)

### 4.1 The base
`base = jobPay x aircraftTier x fitMult x laborRateMult x adsbRush(1.15 if adsb during the mandate) x demandWave(1.15 if the wave matches this job)`

- **Job base pay**: audio 6,000 / elt 5,000 / cert 4,800 / xpdr 3,600 / harness 7,000 / radio 5,000 / glass 24,000 / ap 17,000 / eis 9,000 / adsb 9,000 / datalink 32,000 / radar 21,000 / traffic 11,000.
- **Aircraft tier**: lsa 0.7 / taildragger 0.75 / experimental 0.85 / piston 1.0 / warbird 1.1 / twinpiston 1.15 / floatplane 1.2 / heli 1.3 / tprop1 1.7 / tprop2 1.9 / ljet 2.6 / mjet 3.2.
- **Fit**: amazing 1.4 / solid 1.0 (default) / risky 0.7 / dead 0.4.
- **Labor rate lever**: Value 0.88 / Standard 1.0 / Premium 1.28. Premium also raises customer expectations (see scoring).

### 4.2 The line items
- If the job has an OEM: gear = 35% of base; else (shop-supplied materials) = 12% of base.
- Consumables = 12% of base. Dealer fee = 3% of base on OEM jobs, else 0.
- Labor = base minus gear minus consumables minus dealer fee.
- Player levers: **avionics tier** Budget 0.8 / Standard 1.0 / Premium 1.5 on the gear line (OEM jobs only); **consumables** Lean 0.6 / Standard 1.0 / Padded 1.5.
- Labor displays as hours x rate: `hrRate = round(95 x laborRateMult)`, `hrs = max(1, round(labor / hrRate))`.

### 4.3 The kickback (the upsell)
`kickback = (OEM job AND you are a dealer AND tier = Premium) ? gear x (margin[dealerTier] - 1) : 0`

The kickback is the reason to steer a warm customer to the Premium panel. It is income, shown as a positive line.

### 4.4 The hidden ceiling and the outcome
`ceiling = base x personalityTolerance x (1 + interest/200) x (1 + charisma x 0.01)`

If `total <= ceiling` the job sells; otherwise they balk and you trim or sell harder. The quote also sets a **price-fairness** value (`priceFair`, -1 to 1) that feeds the review later: tight pricing (ratio <= 0.85) is +0.5, near the ceiling (ratio >= 0.99) is -0.2, plus personality nudges (a budget customer hates a premium panel and padded consumables; a status customer likes premium; a safety customer dislikes lean consumables).

---

## 5. Doing the Work

### 5.1 Schedule and shifts
Assign up to the level's crew-slot count of free techs to the bay. Shift count per job: most are 4 shifts; inspections (`cert`, `xpdr`) are 2. Each "Run a Shift" advances every staffed in-progress bay at once and ticks the week +1.

### 5.2 The four quality bars and what fills them
Per tech per shift (`gainFor`), with `powerFactor = 0.55 + 0.45 x (power/100)`:
- **Workmanship** = (wiring x 3 + integration x 1.4) x mult x powerFactor x tooling x wiringCourse
- **Diagnostics** = (troubleshooting x 3 + wiring x 0.5) x mult x powerFactor x tooling
- **Compliance** = (paper x 3 + integration x 0.5) x mult x powerFactor x tooling x complianceCourse
- **Finish** = (integration x 3 + wiring x 0.5) x mult x powerFactor x tooling

Each gain also gets a random jitter of 0.9 to 1.2. Multipliers:
- `mult = fitMult x credPenalty(0.7 if best crew credential < job credReq, else 1) x oemCertBonus(1.12 if a staffed tech is OEM-certified for the job) x courseBonus(1.08 for pitot on inspections, 1.08 for cyber on datalink/traffic)`.
- Tooling upgrade = 1.08. Wiring/Compliance courses = 1.10 on their bar.
- Each shift drains crew power by 12. On-the-job skill growth: each skill creeps up by `0.40 x (jobWeight / totalWeight)`, capped at 10.

### 5.3 Aircraft-to-job fit
`amazing / solid / risky / dead`. Dead means the shop has no business taking it (no STC), and the 0.4 multiplier makes it a money-loser and a quality trap. The board can still offer dead fits; taking one is the player's mistake to make.

### 5.4 Overtime (the surviving run-it choice)
On a bay's detail screen, "Call Overtime" burns one token to add +110 to a chosen bar and drains every staffed tech's power by 15. Fatigue is the cost: techs at power <= 40 at end of shift lower safety culture by 0.7 each.

### 5.5 The functional-test squawk puzzle
At delivery, a defect either clears on the bench or slips to the test flight:
`okChance = clamp(0.45 + maxTroubleshooting x 0.05 + diagBar/700, 0.25, 0.96)`.
The player is shown a job-specific squawk and four options; the correct call adds +70 to Diagnostics, a wrong call subtracts 45. The squawk is a real avionics-knowledge beat (alternator whine, AHRS alignment, static leak, and so on).

### 5.6 Scoring (out of 30)
Target scales with length: `target = 210 x (shiftsNeed / 4)`. `score10(weighted, target) = clamp(round(weighted/target x 10), 1, 10)`.
- **Customer** = `score10(barsWeightedByJobProfile) - laborRateExpectation` (Premium rate subtracts ~1.4, Value adds 1.0).
- **Inspector** = `score10(bars weighted comp 1.6 / work 1.2 / fin 0.5 / diag 0.4)`.
- **Pilot** = `score10(bars weighted fin 1.5 / work 1 / diag 0.8 / comp 0.4) + (squawk cleared ? +1 : -1)`.
- **Total** out of 30. A "hit" is total >= 24 (gives +1 token, +1 fan).
- **Payout** = `quote.total x (0.85 + total/30 x 0.30)`, so 85% to 115% of the quote based on quality.
- **Rep gain** = `max(1, round((total - 12) x fitMult))`.

---

## 6. Dealers and OEMs

Eight fictional makers, each with three dealer tiers above None.

| Maker | Domain | First era | Job(s) |
|---|---|---|---|
| Larkfield Audio | audio panels | 1 | audio |
| Kestrel Instruments | engine monitors | 1 | eis |
| Vireon Avionics | integrated decks | 2 | radio, glass |
| Tindall Aerosystems | autopilots | 2 | ap |
| Halcyon Dynamics | experimental glass | 2 | experimental glass (job to be added, see decision 10.10) |
| Quanta Avionics | surveillance | 3 | adsb, traffic |
| Stratoline | cabin datalink | 4 | datalink |
| Tempest Systems | weather radar | 4 | radar |

Tiers: None, Stocking Dealer, Authorized Dealer, Premier Dealer. To buy a tier you must meet **all** of: cumulative sales of that maker's gear >= salesReq, field rep >= repReq, count of techs certified on that maker >= certReq, and (Premier only) culture >= 70. Then pay the buy-in. Each held tier also charges an annual fee (folded into overhead).

The **kickback margin** climbs with tier (example, Vireon: Stocking 1.10, Authorized 1.22, Premier 1.38). Holding a dealership unlocks the Premium upsell and pays that margin on Premium gear. A staffed OEM-certified tech also gives a 1.12 quality multiplier on that maker's jobs.

Note: the Stocking tier's cert requirement is forced to 0 in code, so the first tier of any maker needs no certified tech (you bootstrap with sales + rep).

---

## 7. Crew and Training

### 7.1 Technicians
Each tech has four skills (wiring, integration, troubleshooting, paper), a credential, loyalty (0 to 100), power/fatigue (15 to 100), a quarterly wage, OEM certs, and a training-currency clock. Starting crew: Dana (bench vet) and Gary (fresh CAET grad).

### 7.2 The credential ladder
Apprentice (0), CAET (1), CAET Advanced (2), Master (3). A tech becomes **eligible** when their average skill crosses the threshold (CAET 4.0, Advanced 6.5, Master 8.5). To certify: pay the fee (CAET 3,000, Advanced 6,000, Master 10,000) and sit a **practical exam** (a squawk puzzle).
- Intent vs reality: the narrative is "earned on the bench, not bought." Today the fee is required and the exam is **soft** (you get the credential regardless of pass/fail; passing only adds +1 AEA standing). Decision 10.9 keeps it soft for the play-anytime demo.
- Graduating an apprentice to CAET while the apprenticeship program is active is a milestone: +5 AEA standing, +3 rep, the tech becomes "homegrown," loyalty +20, grad count +1.

### 7.3 Buying skills directly
On a tech's training screen each skill can be bought up +1 for `1000 + currentValue x 200`. So skills rise both on the job and by paid training. Training refreshes currency.

### 7.4 AEA courses (shop-wide, one-time)
Compliance 4,000 (+10% Compliance fill, better audits), Wiring 4,500 (+10% Workmanship fill), Human Factors 5,000 (raises the culture floor to 55, +60 immediate), Pitot-Static 3,500 (+8% on inspections), Cyber 6,000 (+8% on datalink/traffic), Business 7,000 (cuts overhead 20%, charisma +2). Each course also adds +3 AEA standing.

### 7.5 Recruiting and loyalty
Recruit sources: College Open House (5,000), High School CTE (2,500, half price with an apprenticeship), Military Transition (11,000), Poach a Competitor (20,000). A negotiation beat sets wage and starting loyalty (lowball risks a walk; pay above market locks them in). A fixed "job board" of named hires (Reroute, Sparks, Ledger, Echo) unlocks by level.

Loyalty drifts every overhead tick based on the wage gap to market and culture. Underpaid, low-loyalty techs trigger a personnel event: a rival poach (match, one-time bonus, or let them go and lose their certs) or a raise request. Homegrown techs do not trigger poaching.

### 7.6 Training currency (recurrent)
A 48-week clock (`trainedThrough`). Refreshed by any training, course, OEM cert, or the fall conference. If it lapses, the tech is meant to be off dealer and certified work until refreshed (`canDoDealerWork`). Status shows current / soon (within 4 weeks) / lapsed.

### 7.7 The apprenticeship program
One-time 8,000 setup, requires a CAET+ tech to mentor. Turns on grant funding (folded into invoices) and half-price CTE hires, and is a heavy term in the Shop of the Year award (apprentices graduated).

---

## 8. Finances (the single invoice)

The hard rule from the spec: **money settles once per job, at Collect Payment, as one invoice.** No periodic statements. The build honors this.

The invoice lines (positive = income, negative = cost):
- **Labor** = the quality-adjusted payout plus any passive income per job.
- **Parts** = the consumables cost (negative).
- **Premium kickback** (if Premium gear was sold as a dealer).
- **Job hit** (if a mid-job event added a cost or change-order income).
- **Shop overhead** = accrued rent + payroll + insurance + dealer annual fees, minus grant funding, since the last settle.

Net is the sum; cash changes exactly once here. Overhead accrues silently every 4 weeks (`accrueOverhead`) and waits inside the next invoice, so it never becomes its own popup. Overhead components: rent by level (600 / 1,400 / 2,800 / 5,000 / 8,000), payroll = sum of wages, insurance `clamp(1200 - culture x 10, 300, 1300)`, dealer fees, all reduced 20% with the Business course; grant = 2,500 + 1,200 per apprentice if the program is active.

Callback risk: if culture < 45, with probability `0.45 - culture/100`, a job comes back for `round(payout x 0.10) + 300` and -1 rep. This is the teeth behind safety culture.

Other income: a flying-club contract event adds passive income per job; an STC line at level 4 is described as passive income.

---

## 9. Progression, beats, and endgame

### 9.1 Shop levels
Five levels. Upgrade requires rep and cash: L2 (rep 12, 20,000), L3 (rep 35, 60,000), L4 (rep 70, 150,000), L5 (rep 110, 180,000). Levels set bays (1/2/3/4/5) and crew slots (2/4/5/6/7) and unlock aircraft classes and dealer authorizations.

### 9.2 Eras
Four eras: Steam & Retrofit, The Glass Wave, The ADS-B Mandate, The Connected Cockpit. Era advances are gated on jobs completed: era 2 at 3 jobs, era 3 at 7, era 4 at 12. Each era unlocks new jobs and raises the credential expectations. The ADS-B era starts a 4-job rush (adsb pays +15%).

### 9.3 Demand waves
The AEA Show kicks off a 6-week wave: the board biases 3x toward one job type and that job pays +15% (early-adopter pricing). Ticks down per shift.

### 9.4 The AEA Show (spring, interactive)
Once per spring, a convention-stage popup unveils one era-appropriate product with pixel art and a one-line hype, sets the demand wave, gives +3 rep and +4 AEA standing, and points the player to the right next move (become that maker's dealer, or book training).

### 9.5 Fall conference and events
The fall conference is a batch-training and currency-refresh beat. Between jobs, random Events can fire (AOG emergency, FAA audit, backordered part, manufacturer call, new grad, warranty callback, magazine feature, tooling for sale, flying-club contract, scholarship, veteran hire, competitor poaching, plus the mid-job change-order and anxious-owner calls when a bay is in progress).

### 9.6 The award (the win) and game over
You cannot buy Shop of the Year. The award score (target 85) sums five capped pillars:
- **Reputation** (max 30): star rating and loyal accounts.
- **Workforce** (max 30): apprentices graduated, advanced techs, total credentials.
- **Safety** (max 18): culture.
- **Dealers** (max 14): sum of dealer tiers.
- **Business** (max 8): cash (capped low) and level.

Winning also requires culture >= 70 and a structural gate: **a Premier dealer OR level 4** (`awardLevelGate()`). Game over if cash < -$4,000.

The structural gate was lowered from level 5 to level 4 on 2026-06-30 after an automated playthrough (see section 12) showed the merit score reaches 85 around job 45 but the level-5 climb did not finish until job ~95, leaving a ~50-job anticlimactic tail where the shop was award-worthy on merit but could not be crowned. Level 4 (a four-bay Regional Powerhouse) arrives near merit-max, so the crown now lands when it is earned. Level 5 remains the optional max-shop flex.

---

## 10. Locked decisions (mapping session, 2026-06-29)

1. **Documentation order**: write this bible first, then derive player instructions from it.
2. **Demo context**: a shareable, play-anytime link. Implies real onboarding and a finishable arc.
3. **Endgame**: keep the full Shop of the Year win, and add an **early climax milestone** that lands as "a win" earlier in the climb (candidate: first New Era reached plus first dealership signed plus Level 2 to 3). Both must be reachable; validate by tracing the economy.
4. **Onboarding**: build **both** a guided first job (Chief walks the player through one full loop) and a persistent **Shop Manual** reference screen. Keep the existing contextual Chief tips.
5. **Specialties**: **wire them to a real edge.** Higher specialty rank gives a small quality or pay bonus on that job family, so focusing the shop pays off. (Today they are decorative.)
6. **Customer personality**: **hidden for new walk-ins, shown for known customers.** New prospects stay a read-the-room surprise in the Meet beat; customers already on the book show their personality on the board.
7. **Safety-as-consequence beats (spec pillar)**: **re-wire the `HF[]` choice beats as a real shift beat.** Bring back rush / cut-corners / push-through during shifts, with the rewards and punishments already written, so the spec's explicit "your call on the floor" lands. Tune frequency so it does not fire every shift.
8. **Specialty bonus**: a **quality edge.** Higher specialty rank speeds the four-bar fill on that job family, so a focused shop builds cleaner and faster. Per-rank magnitude is small and tuned in the balance pass to avoid snowballing.
9. **Credential exam**: **keep it soft** (a teaching beat that never blocks). Passing still rewards AEA standing. Friendly for a play-anytime link.
10. **Halcyon Dynamics**: **map experimental glass to it** so all eight dealers are reachable by use and the experimental-aircraft path gets its own maker. Add the job (non-cert experimental glass) and wire `JOB_OEM`.
11. **Early-climax milestone**: a named "Regional Up-and-Comer" beat fires the first time the player simultaneously holds at least one dealership and is Level 2 or higher (era 2 arrives by job 3, so the trio lands naturally). Tunable after the economy trace.
12. **Fans**: leave as a cosmetic counter for now and document it as such. Easy to give a small effect later if the demo wants it.

---

## 11. Validation and implementation watch-list

These are not open design questions; they are things to verify while building.

1. **Finishability trace** (the big one): see section 12.
2. **Currency lapse enforcement**: confirm a lapsed tech is actually blocked from dealer and certified work in the schedule flow, and that the player is told why. The logic exists; verify the wiring.
3. **Specialty bonus tuning**: keep the per-rank quality edge small enough that a maxed specialty does not trivialize its job family.
4. **Safety beat cadence**: pick a fire rate (for example a chance per shift, not every shift) so the rush/corners choice stays meaningful and not nagging.

---

## 12. Balance and finishability to validate

Because the demo is a play-anytime link, the arc has to actually pay off. To validate:
- Trace the economy from a fresh start: how many jobs and how many minutes to reach the early-climax milestone, and to the full award. Confirm both are reachable and neither drags.
- Confirm the level cash gates (up to 320,000) are reachable given per-job net after overhead.
- Confirm the award is winnable: culture >= 70 is gated by courses and fatigue management; Premier needs sales + rep + certs + culture. Walk one full path end to end.
- Sanity-check that a careless player can lose (cash < -$4,000) without it being punishing on a first sitting.

### Finishability trace (2026-06-29)

Simulation tool: `tools/economy-trace.mjs`. Run with `node tools/economy-trace.mjs`. The model is self-contained with all constants transcribed literally from `index.html` as of this date.

**Simplifying assumptions in the model (stated for auditability):**
- Standard labor rate, standard consumables, no AEA courses purchased.
- Job mix per era: audio on piston (era 1), glass on twinpiston (era 2), ADS-B on piston (era 3), radar on tprop1 (era 4). All amazing fit (the board guarantees at least one good fit).
- Overhead accrues every 4 shifts (one tick per standard non-inspection job).
- Starting crew: Dana (CAET Adv, wage ~$1,605/qtr) and Gary (CAET, wage ~$1,105/qtr).
- Culture holds at 68 + 1 per job (no HF events, no fatigue loops).
- Dealer buys use only Stocking tier (certReq forced to 0). No OEM cert purchases for higher tiers.
- No random events, no AEA Show wave multiplier, no personnel events.
- Star rating approximated as decaying average drifting toward (avgScore/30) x 5 at 15% weight per job.
- Award workforce pillar uses starting crew creds only (sumCreds = 3, advTechs = 1, gradCount = 0).

**Headline numbers:**

| Milestone | Careful player (24/30 avg) | Sloppy player (16/30 avg) |
|---|---|---|
| Early milestone (Lv2 + first dealer) | job 4 (4 to 8 min at 1-2 min/job) | job 4 (4 to 8 min) |
| Level 5 reached | job 22 (22 to 44 min) | job 23 (23 to 46 min) |
| Shop of the Year award | NOT REACHED in 120 jobs | NOT REACHED in 120 jobs |

Real play (with events, training, hiring decisions) runs 3 to 5 min per job, so those job counts translate to roughly 12 to 20 min for the early milestone and 66 to 110 min for Level 5 under realistic pacing.

**Limiting factors at each gate:**

- **Early milestone (Level 2 + first dealer):** Rep is the binding constraint. Level 2 requires rep 12 and $20,000. The rep threshold (not the cash gate) is what the player hits first. With amazing-fit era-1 jobs, rep builds to 12 in about 3 jobs. The first Larkfield dealer requires only 2 audio sales plus rep 8, both of which happen before the Level 2 rep gate. So the effective limiting factor is rep-to-Level-2.
- **Level 5:** CASH. Rep races ahead of the cash gates at every level because the era-2 glass jobs ($24k x 1.15 aircraft x 1.4 fit = $38,640 base quote, ~$34k payout) generate large rep gains but also expensive upgrades. Level 5 costs $320,000. The player accumulates enough cash to buy it around job 22, but rep is already at 374 by then (well above the 110 requirement). Cash, not rep, gates Level 5.
- **Shop of the Year award (NOT REACHED):** The award plateau is at roughly 67.7/85 for the careful player and 48.4/85 for the sloppy player, both stuck far below the 85 target regardless of how many more jobs are run. The simulation flatlines because:
  1. **Workforce pillar (max 30) is nearly empty.** With no apprentices graduated, no advanced-cert purchases, and only starting crew (sumCreds = 3, advTechs = 1), the workforce pillar peaks at `0*3 + 1*3 + 3*0.5 = 4.5 out of 30`. This alone makes 85 mathematically impossible. The pillar needs at least 3 grad-to-CAET apprentices (9 pts), 2 or more advanced techs (6 pts), and more cred accumulation (say 12 creds = 6 pts) to get to 21+ points, which is the minimum needed for the score to touch 85.
  2. **Dealer pillar (max 14) stalls at 7.2.** The model only buys Stocking tier (tier 1) for four makers (dealerScore = 4, pillar = 4 x 1.8 = 7.2). To reach 14 the player needs a dealerScore of ~8, which means either 8 Stocking deals or a mix including higher tiers. More importantly, the award win condition requires a Premier dealer OR Level 5. Level 5 is reachable in 22 jobs, but Premier requires culture >= 70 plus sales, rep, and certified techs that the simple trace does not model.
  3. **Rep pillar (max 30) is capped by star rating.** The star rating drifts toward exactly 4.0 for the careful player and plateaus near 2.7 for the sloppy player. The rep pillar formula is `min(30, starRating/5*20 + loyalAccounts*2.2)`. A 4.0 star rating gives only 16 rep-pillar points. The pillar maxes out at 30 only at a 5-star rating (16 pts from rating) plus 6+ loyal accounts (13 pts). Neither happens without actively building customer relationships and repeating great jobs.

**Concrete tuning recommendations:**

The award is currently unreachable without active workforce development and dealer climbing. The gap is structural, not a payout calibration issue. Specific changes:

1. **Lower the Level 5 cash gate from $320,000 to $180,000.** Cash races ahead after Level 4 anyway (the radar-on-tprop1 job nets roughly $46,000 per job at standard rate and amazing fit). The $320k gate serves no real purpose since rep (at 374 vs. required 110) is already trivially met. Lowering to $180k moves Level 5 from job 22 to approximately job 16, which puts it inside a 45-to-80-minute real-play session.

2. **Give the workforce pillar minimum credit for starting crew.** Today a fresh shop with two certified techs (sumCreds = 3) scores only 4.5/30 on workforce. A starting floor of 6 to 8 points (or equivalently, reduce sumCreds weight from 0.5 to something where 3 creds = 3 pts and one advTech = 5 pts) makes the award feel earnable without an apprenticeship grind on a first sitting.

3. **Add a Premier dealer shortcut or lower the Premier culture gate.** Premier currently requires culture >= 70, a certified tech, rep 60+, and 12 sales for Larkfield. Culture reaches 70 around job 2 in the trace, but tech certs and 12 sales are the real wall. A simpler path: allow one Premier deal to be purchased at Level 4 with rep 70 and 6 sales (half the current 12), so a focused player can satisfy the award win condition at Level 4 without needing Level 5.

4. **Raise the payout floor from 0.85 to 0.90.** Current formula: `payout = quoteTotal x (0.85 + total/30 x 0.30)`. At a score of 16/30 the sloppy player earns only 0.85 + 0.16 = 1.01x of quote, meaning sloppy play barely covers the quote. Raising the floor to 0.90 gives a $0 to $3,000 cash buffer per job at low scores, reducing the risk of going negative before the player understands the loop. The careful player at 24/30 earns 0.85 + 0.24 = 1.09x (or 0.90 + 0.24 = 1.14x with the raised floor) -- a modest increase.

5. **Cap the minimum jobs-to-award at roughly 35 to 50 by design.** The award needs workforce points that can only come from explicit player actions (training, apprenticeship, hiring). None of those are modeled in the baseline trace because they are not forced. This is a session-design observation: the award must be preceded by onboarding that makes workforce development obvious. Chief tips and the Shop Manual should call out the workforce pillar explicitly, or the player will grind era-4 jobs forever wondering why the score is stuck.

**Sanity check on early game solvency:** The careful player starts with $6,000, earns roughly $10,300 net on job 1, and has $10,646 after buying the first Larkfield dealer at job 2. Cash never goes below $1,000 in the first 6 jobs (baseline scenario). The sloppy player runs similarly. Neither player comes close to the $-4,000 game-over threshold in the opening acts, which confirms the early game is not punishingly tight for a first-time player who picks any non-dead fit job.

**Review verdict and decision (2026-06-29).** The trace passed an independent spec review: every constant was verified against `index.html` and the model is faithful. The review separated model-backed findings from inferences, and we decided "minimal and honest":

- **Act on (recommendation 1):** lower the Level 5 cash gate from $320,000 to $180,000. This is the one simulated, real bottleneck (rep is at 374 vs the required 110 when cash finally clears the gate).
- **Handle via onboarding, not math (recommendations 2 and 5):** the "award stalls near 68/85" result is a modeling artifact. The model holds workforce at starting values (no courses, no grads, no certs) and builds no loyal accounts, so it never fills the award's two heaviest pillars. The award is reachable for an engaged player by ceiling math (Reputation 30 + Workforce 30 + Safety 18 + Dealers 14 + Business 8 = 110 vs an 85 target). The real gap is discoverability, so the Shop Manual and Chief tips will teach that the win needs workforce development and loyal customers. The award weights are intentional and stay as built.
- **Hold for the Task 11 playthrough (recommendations 3 and 4):** lowering the Premier sales requirement and raising the payout floor were inferences, not simulated outputs (the model never chased Premier and no player went broke). Revisit only if the real end-to-end playthrough shows them as walls.

---

### Automated playthrough validation (2026-06-30)

A headless auto-player drove the REAL game (clicking through every screen), which the earlier trace could not do. Findings:

- **Robustness:** a full 80-job reactive run completed with ZERO JavaScript errors, zero crashes, zero stuck states, and cash never went negative. The core loop is solid end to end.
- **The award cannot be cheesed:** a player who only runs the job loop (no upgrades, dealers, or training) plateaus around 58/85 and never wins. Confirmed by design.
- **The win is reachable:** an engaged driver that also plays the management side (upgrades, dealers, training, apprenticeship) reaches Shop of the Year reproducibly (job ~93 to ~106 across runs), maxing all five pillars (100/85), with no errors.
- **The fix that shipped:** the merit score crossed 85 around job ~45, but the old level-5 win gate delayed the crown to job ~95, a ~50-job anticlimactic tail. Lowering the structural gate to level 4 (`awardLevelGate`) aligns the crown with the achievement. See section 9.6.
- The auto-player harness is a throwaway in the session scratchpad (`autoplay.html`); it does not ship.

## 13. Player-facing instructions plan (derived)

Built from the sections above, scoped to the locked onboarding decision (guided first job + Shop Manual).

**Guided first job (first run only):** Chief walks the player through one complete loop, naming the factor at each step: pick a prospect, read the personality, match the approach (and why match matters), set the avionics tier and consumables (and what the kickback is), schedule a tech, run shifts (and what the four bars mean), the squawk test, the single invoice, and the review-and-relationship payoff. Skippable.

**Shop Manual (always available from The Shop):** a plain reference covering, in the player's language:
- The loop in one screen.
- Reading customers: the four personalities and which approach each wants.
- The quote: what raises the ceiling (warmth, charisma), what the avionics tier and kickback do, why padding can cost you in the review.
- The work: what fills each of the four bars, what fit means, overtime and fatigue, the squawk test.
- Growing the shop: credentials, courses, dealers and the kickback, the apprenticeship.
- Money: the one invoice, overhead, and how culture causes callbacks.
- Winning: the five pillars of Shop of the Year and the early milestone.

**Keep:** the contextual Chief tips already in the build, expanded to cover any factor the manual introduces.
