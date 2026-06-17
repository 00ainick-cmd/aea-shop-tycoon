# AEA Member Shop Tycoon: The Business, the OEMs, and the Training
### Systems design, companion to the design bible

This game showcases four things: what it takes to own a business, how avionics evolved, what an avionics technician actually does, and why training is the whole ballgame. The business simulation is the engine that carries all four. This document designs that engine.

The mark of a great sim is that every choice has a second cost somewhere else, and there is no single dominant strategy. That is the bar here. Train a tech and you raise their value, their wage, and the odds a competitor poaches them. Land a dealer and you owe annual fees and minimum sales. Chase a bizjet field and you trade cheap rent for brutal competition. The fun is in the squeeze.

---

## The reframe: from tycoon to sim

Right now the player watches one number, cash. A sim gives them a dashboard worth watching. Five things move, and they pull against each other:

- **Cash and the P&L.** Revenue minus the real costs of running a shop, period over period.
- **Reputation**, in more than one flavor (see below).
- **The bench**, your technicians and their credentials.
- **The book**, your customers and contracts.
- **The portfolio**, your OEM dealer authorizations.

The whole game is keeping these five healthy at once, in an industry that keeps changing the rules under you. The AEA Shop of the Year award is the score that says you did.

---

## The business layer

### The profit and loss

Money stops being a single pile and becomes a flow you manage. Revenue comes in, costs go out, and the gap is what you live on and reinvest.

| Revenue lines | Where it comes from |
| --- | --- |
| Labor billed | Hours your techs put on jobs, at your shop rate |
| Parts margin | Markup on the boxes and hardware you install |
| Dealer margin | Better markup on lines you are authorized to sell |
| Service contracts | Recurring money from clubs, schools, and fleets |
| AOG premiums | Rush money for dropping everything on a stranded aircraft |
| Co-op marketing | OEM dollars that offset your advertising (a dealer perk) |
| Volume bonuses and rebates | OEM checks for hitting sales thresholds |
| Grant funding | Workforce grants that offset an apprenticeship program |

| Cost lines | What drives it |
| --- | --- |
| Hangar rent | The airport you operate at, and how many bays |
| Payroll and benefits | Crew count, and credentials raise wages |
| Tooling and test equipment | Capital you spend to raise quality and unlock work |
| Dealer fees | Buy-ins, annual fees, and stocking inventory minimums |
| Training | Tuition, travel, and the bench time a tech is off the floor |
| Advertising | What you spend to pull leads and lift your name |
| Insurance | Premiums that rise or fall with your safety record |
| Parts inventory | Carrying cost of stock you have to keep on the shelf |
| Warranty and rework | The price of work that comes back |
| Certification upkeep | Keeping credentials and dealer status current |

This is the spine. Once the player feels a P&L, every other system has teeth, because every system shows up as a line on it.

### Reputation is not one number

Reputation should be a small set of currencies, each unlocking different things. This is what stops the game from being a single rep-grind.

- **Local rep**, your name on the field. Drives walk-ins and small-owner work.
- **Operator rep**, your standing with fleets and charter. Gates the big recurring contracts, and it is unforgiving about quality and schedule.
- **OEM standing**, how the manufacturers see you. Gates dealer tiers.
- **AEA standing**, your standing in the association. Built by training, apprentices, and showing up. A heavy input to the award.
- **Safety record**, covered in its own section. Gates the top dealer tiers and the award, and sets your insurance bill.

A shop can be beloved locally and invisible to fleets. A shop can sell a ton and still be locked out of Premier dealer status because its safety record is a mess. That spread is where strategy lives.

---

## Location and the airport

Where you set up is a real decision, and opening a second and third location is the mid-to-late game. Each location is an airport with a personality.

| Airport archetype | Aircraft and work | Money ceiling | Costs | Labor pool | The catch |
| --- | --- | --- | --- | --- | --- |
| Rural GA strip | Piston, experimental, ag, taildraggers | Low | Cheap rent | Thin | Loyal locals, but you will plateau |
| Regional reliever | Mixed GA, light turboprop | Medium | Moderate | Decent | The balanced starter field |
| Bizjet hub | Jets, connectivity, radar | High | Brutal rent | Competitive | Big money, demanding clients, sharp rivals |
| Bush and float base | Floatplanes, utility, remote ops | Medium | Moderate, logistics-heavy | Scarce | Comms and ADS-B bread and butter, hard to staff |
| College-town field | Mixed GA near a Part 147 school | Medium | Moderate | Deep and green | A recruiting goldmine for apprentices |

Opening a new location is a capital decision and a staffing decision. You diversify your aircraft and your risk, you reach new customers, and you need someone to run it. The best location managers are the apprentices and techs you grew yourself, which ties the empire straight back to training and legacy. A shop near the college feeds your whole network with talent. A shop at the jet hub feeds it with money. Building the right map of locations is its own puzzle.

---

## Customers and the book of business

Customers are not anonymous job tickets. They are relationships that compound.

- **One-off owners.** Walk-in work. Win them and some become repeat.
- **Repeat owners.** They come back and they upgrade through the eras. The doctor who buys an audio panel in the 80s is your glass retrofit in the 2000s and your traffic system in the 2010s, if you keep earning it.
- **Clubs and flight schools.** Volume and a service contract. Steady, price-sensitive, forgiving.
- **Charter and fleet operators.** Big recurring money, and merciless about quality, schedule, and paperwork. Lose one over a blown job and the whole field hears.
- **Warbird and experimental enthusiasts.** Niche, passionate, and the best word of mouth in the business.

Satisfaction comes from quality, on-time delivery, fair price, and clean records. Satisfaction builds loyalty, loyalty builds repeat work and referrals, and referrals plus advertising plus awards drive your local rep. A blown job or a safety incident loses the account and dents the name. The mid-game pursuit is assembling a book: a roster of loyal accounts and standing contracts that pays you whether or not a walk-in shows up that week. The book is also a Shop of the Year input, because a great shop is measured by who keeps coming back.

---

## The OEMs and the dealer ladder

This is the progression layer you asked for. You sell and install manufacturers' products. Sell enough, with enough reputation and enough certified techs, and you earn dealer authorizations. Dealers are the path to the top, and the top is Shop of the Year.

All brand names below are original and fictional, built to evoke a category, not any real company.

| OEM (fictional) | Product domain | Personality and niche | Rises in era | Dealer payoff |
| --- | --- | --- | --- | --- |
| Vireon Avionics | Integrated flight decks, PFD and MFD | The giant. Hard to land, biggest money | Glass wave on | The flagship dealer, the prestige line |
| Tindall Aerosystems | Autopilots and flight control | Engineering-driven, demands real training | Glass wave on | High-margin, training-heavy |
| Kestrel Instruments | Engine monitors and EIS | Grassroots GA and experimental favorite | Early, grows | Approachable entry dealer, volume in GA |
| Quanta Avionics | Transponders, ADS-B, surveillance | Rode the mandate wave hard | Mandate era boom | Gold-rush volume when the deadline hits |
| Larkfield Audio | Audio panels and intercoms | Small, beloved, niche | Early on | Easy first dealer, loyal customers |
| Stratoline | Cabin connectivity and datalink | Premium, subscription-tied, jet-focused | Connected cockpit | Recurring subscription money, top-tier only |
| Halcyon Dynamics | Experimental and non-certified glass | Cheap, fast-moving, drives innovation | Glass wave on | Volume in the homebuilt market |
| Tempest Systems | Weather radar and hazard awareness | Turbine-focused, technical | Connected cockpit | High-ticket, demanding, jet and turboprop |

The product lines arrive on the era clock, which is how the OEM system carries the avionics-evolution pillar. Larkfield and Kestrel are there from the start. Vireon and Halcyon glass show up in the glass wave. Quanta explodes during the mandate. Stratoline and Tempest define the connected-cockpit era. Which OEMs you bet on, and when, is a real strategic fork, the same one the rival makes the opposite way.

### Dealer tiers

Each OEM offers the same three-rung ladder. You climb it per manufacturer.

| Tier | Requirements | Benefits | Ongoing cost |
| --- | --- | --- | --- |
| Stocking Dealer | Low OEM standing, one willing tech, a buy-in | Can sell and install, basic margin | Buy-in fee, some shelf stock |
| Authorized Dealer | Minimum annual sales, one OEM-certified tech, solid rep | Better margin, listed on the OEM locator (lead referrals), a demo unit, training seats | Annual fee, sales minimum, stocking minimum |
| Premier Dealer | High volume, multiple certified techs, strong rep and a clean safety record | Best margin, co-op marketing dollars, volume rebates and sales incentives, priority support, early product access | Higher annual fee, hard sales floor, certification upkeep |

The dealer economy is full of the tensions a sim wants. To reach Authorized you need a certified tech, which means tuition and bench time off the floor. To hold a tier you have to keep selling, so a dealer you cannot feed becomes a money-losing annual fee. Premier pays the best margins and co-op marketing, but it demands volume, multiple trained people, and a safety record you cannot fake. Dealer bonuses (volume rebates, promotional sales incentives, warranty labor reimbursement) are real revenue that rewards leaning into a line, and the buy-ins and annual fees are real costs that punish collecting authorizations you cannot support. Picking the two or three OEMs you go deep on, instead of half-committing to all eight, is a core decision.

---

## Training: the heart of the game

Training is not a side menu. It is the system that feeds every other system. Your techs do the work, so their skill is your product. Certifications gate the jobs you can take, the dealers you can land, and the award you can win. This is the pillar the whole game is built to showcase, and it should be the deepest thing in it.

Two tracks run in parallel.

### The AEA track, the backbone

Credentials are earned, never bought. A technician moves up by doing three things: accumulating skill on the bench (the work itself teaches), taking AEA coursework (tuition and time off the floor), and passing the credential. The ladder is Foundations, then CAET, then CAET Advanced, then Master, and each rung opens heavier work and higher dealer eligibility.

Around the ladder sits a catalog of AEA courses the owner chooses to invest in:

- **Compliance and Recordkeeping.** Lifts your paperwork and your odds in an audit.
- **Pitot-Static and Transponder authority.** Unlocks and improves certification work.
- **Wiring and EWIS.** The craft course. Raises workmanship across the bench.
- **Human Factors and SMS.** Raises your shop's safety-culture baseline (see the next section). This is where the safety system and the training system meet.
- **Connected Aircraft Cybersecurity.** Gates and improves the modern connectivity work.
- **Business of the Shop.** The owner's own course. Lowers overhead, improves margins, and unlocks management perks. The owner is a student too.

And the recurring beat: **AEA Connect**, the annual convention. You pay to go, and it bundles training seats, dealer meetings that advance your OEM relationships, recruiting leads, a reputation bump, and the networking that opens doors. Skipping it saves money and bench time. Going to every one is expensive but compounds. That is a clean recurring decision.

### OEM factory training, dealer-gated

Each manufacturer certifies techs on its products. A Vireon Flight Deck certification lets a tech install and sign off Vireon's integrated decks without the under-qualified penalty, and it boosts quality and margin on that line. These certifications are required to climb the dealer ladder, so the dealer system and the training system are locked together. OEM training costs tuition, travel, and bench time, but at higher dealer tiers some seats are comped, which is a real reason to commit to a line.

### The apprenticeship program, your flagship

This is the mechanic that should make the game feel like it stands for something, and it is the one that mirrors the real industry most closely.

You start a registered apprenticeship program. It is an investment: standards to set up, a certified tech committed as a mentor, and structured on-the-job training plus related instruction. In return:

- You recruit apprentices cheaply and they are low-cost labor that grows fast through structured OJT and coursework.
- They graduate into CAET technicians who are loyal to your shop, because you made them. Low turnover.
- The program lifts your AEA standing and is a major Shop of the Year input.
- It can draw workforce grant funding, which offsets the cost and shows up as revenue.

The catch is real: apprentices need a certified tech's supervision, which spends bench time, and not every apprentice finishes. But growing your own bench is far cheaper than buying it, and it is the only talent strategy that scales as you open new locations. This is build-versus-buy talent, the exact debate the real industry is living, made into a game mechanic.

### The recruiting pipeline

You do not just post a job and wait. You go find people, and the source you choose is a tradeoff between cost, speed, and loyalty.

| Source | Cost | Yield and quality | Loyalty | Notes |
| --- | --- | --- | --- | --- |
| Walk-ins and the AEA job board | Cheap | Random | Low | The default trickle |
| College open house booth | Moderate | Green grads, good volume | Medium | Apprentice and CAET-track talent |
| High school CTE and skills competitions | Cheapest | Rawest, long game | Highest | Feeds the apprenticeship, best retention |
| Military transition | Moderate | Strong fundamentals, near-ready | Medium-high | Disciplined, mid-tier out of the gate |
| Poach a competitor | Expensive | Instantly skilled and certified | Low, flight risk | Fast fix, costs rep, and they can be poached back |

This makes recruiting a strategy in itself. The cheap, slow path is to grow your own through CTE and the apprenticeship. The expensive, instant path is to poach certified techs. Most shops do some of both, and the player has to read their situation. And because poaching cuts both ways, retention becomes its own game: pay, culture, and training are what keep the people you invested in from walking across the field.

---

## Shop culture and safety, the system that replaces the popup

The human-factors flashcard is gone. In its place is a real system, because safety in a shop is not a quiz, it is a culture that pays you back or costs you, every period.

### The Safety Culture meter

A persistent meter, built from three things:

- **Training.** Taking the AEA Human Factors and SMS course raises your baseline. This is the hook that makes that course worth buying.
- **How you run the shop.** Constant overtime, chronic understaffing, and corner-cutting erode it. A rested, well-staffed, well-led crew lifts it. This is where everyday human-factors pressure lives, modeled passively, so it is always in play without nagging you.
- **Your people.** Disciplined hires (the vet, the well-trained tech) raise it. Churn and green crews strain it.

### What the meter actually does

This is the part that was missing. Safety culture is wired into the dollars and the people:

- **Insurance premiums.** A recurring cost that rises as culture falls and drops as it climbs. A direct line on your P&L, every period.
- **Rework and warranty rate.** Poor culture means more comebacks, which is lost money and lost reputation. Good culture means work that stays fixed.
- **Crew morale and retention.** A strong safety culture keeps and attracts technicians. A bad one drives turnover, and turnover means losing the exact people you spent money training. That is the cruelest cost in the game, and it should be.
- **Incidents.** At low culture, the dice get dangerous: a damaged aircraft you have to make right, an injury that costs downtime, or an FAA enforcement action with fines and scrutiny. At high culture, you can earn an industry safety award that lifts reputation, helps the Shop of the Year score, and discounts your insurance.
- **The gates.** Premier dealer tiers and Shop of the Year both require a clean safety record. Culture gates the endgame.

### The decision moments, now rare and heavy

The discrete near-miss decisions still exist, but they become rare and consequential instead of constant and cheap. A real fork shows up only at a real moment, the stakes are shown on screen (this aircraft, this account, your record, your people), and the outcome visibly moves the dashboards: the insurance line, the culture meter, the account's loyalty, the rep. Because everyday pressure is handled by the passive meter, a decision moment lands like a decision instead of a speed bump. Source these from real near-miss material so they ring true. That is how this stops being something that seems stupid to add and starts being a system the player respects.

---

## The AEA Shop of the Year award

The award is the score that ties every system together. It is not one stat, it is a weighted composite, so winning it means you ran a genuinely great shop, not that you optimized a single number. Illustrative weighting:

| Award input | Why it counts |
| --- | --- |
| Business scale and health | A real shop is a real business |
| Reputation across the board | Local, operator, OEM, and AEA standing |
| Dealer portfolio | Count and tier of your authorizations |
| Workforce development | Apprentices enrolled and graduated, techs certified and advanced |
| Safety record | A clean, strong safety culture |
| Industry involvement | Scholarships, conference participation, mentoring |

Workforce development and safety carry real weight, on purpose. The association that hands out this award cares about the people and the culture of the trade, not just the till. A shop that prints money on the backs of an exhausted, untrained crew does not win. A shop that grows its own people, runs clean, sells well, and shows up does. That is the statement the endgame should make.

---

## How this serves the four pillars

- **Owning a business.** The P&L, the dealer fees and bonuses, the location bets, the book of business, and the build-versus-buy talent decisions are the business, in the player's hands.
- **The evolution of avionics.** The era clock drives the work, and the OEM product lines arrive on it, so the player lives the change from steam gauges to the connected cockpit by deciding which wave to ride.
- **What a technician does.** The squawk troubleshooting, the four craft skills, the shift work, and the safety calls show the actual job, and training deepens the player's feel for it.
- **The importance of training.** It is the deepest system in the game, it feeds every other system, and it is the heaviest single thing the award measures.

---

## What I would build first

The core loop and the credential ladder already work. From here, in order of impact:

1. **The P&L and the cost lines.** Give the player a real budget to manage. Everything else gets teeth once money flows instead of sitting in a pile.
2. **The OEM and dealer system.** The roster, the three-tier ladder, the fees and bonuses. This is the progression spine that points at the award.
3. **The training overhaul.** The AEA course catalog, OEM factory certs, and the apprenticeship program with its recruiting pipeline.
4. **Shop culture and safety.** The meter, the insurance and retention and incident wiring, and the rare heavy decisions.
5. **Locations and the customer book.** The airport map, opening new shops, and the loyal accounts that make the empire real.
6. **The award scoring.** The composite that reads all of it back and crowns the run.

We build the business the way a real one grows. One system at a time, each one earning its place before the next goes in.

---

## Three questions for you

1. **How hard should the money be?** A forgiving builder where you almost always grow, or a real sim where a bad season of dealer fees and overtime can put you in the red and force hard cuts? The second is more award-worthy and more stressful.
2. **The apprenticeship program.** You live this in real life. Do you want it modeled close to the real registered-apprenticeship structure, with standards, RTI, and grant funding, or a streamlined version that captures the spirit without the paperwork detail?
3. **Failure of a technician.** Should techs you train be able to leave, wash out, or get poached, so retention is a real pressure, or do your people stay once you have them? Loss makes the training investment mean more, but it stings.
