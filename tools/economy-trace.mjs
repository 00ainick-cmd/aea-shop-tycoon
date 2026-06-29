/**
 * economy-trace.mjs
 * Dev tool -- NOT part of the shipped game.
 * Run with: node tools/economy-trace.mjs
 *
 * PURPOSE: Replicate the documented economy with real numbers transcribed
 * from index.html so we can trace how many jobs each player archetype needs
 * to reach (a) the early-climax milestone and (b) the full Shop of the Year win.
 *
 * All constants below are LITERAL COPIES from index.html -- do not import
 * from index.html. This self-contained model is intentionally auditable.
 *
 * SIMPLIFYING ASSUMPTIONS (stated explicitly for review):
 *   1. We pick the "best" board offer every job: amazing-fit piston/EIS job in
 *      era 1, amazing-fit glass/AP in era 2, amazing-fit ADS-B in era 3, etc.
 *   2. Labor rate stays at Standard (mult 1.0) throughout -- the most common
 *      default. A value-rate run would earn rep faster; a premium-rate run
 *      earns more cash but slower rep.
 *   3. Avionics gear selection: Standard for era-1 OEM jobs, Premium once the
 *      shop is a Stocking Dealer (so the kickback line fires). Consumables: Standard.
 *   4. Overhead accrues every 4 shifts. A typical 4-shift job advances the week
 *      counter by 4, so we accrue overhead after every single job that is not
 *      an inspection (inspections are 2 shifts).
 *   5. Starting crew: Dana (CAET Adv, avg skill ~6.75, wage ~$1,600/qtr) and
 *      Gary (CAET, avg skill ~4.25, wage ~$1,000/qtr). Starting wages are
 *      computed from the mkCrew formula: wage = round(500 + cred*350 + avgSkill*60).
 *   6. Safety culture stays at 68 (no overtime, no HF events, no fatigue loops).
 *      Culture drifts +1 per overhead tick (no HF course). Culture gate for
 *      Premier dealer (>=70) is therefore reachable after ~2 overhead ticks.
 *   7. Dealer timeline: we assume the player becomes a Larkfield Stocking Dealer
 *      (the cheapest first-era OEM) as soon as req is met:
 *        salesReq=2, repReq=8, certReq=0, buyin=$4,000.
 *      The "early milestone" is defined here as Level 2 + first dealer signed.
 *   8. The "careful" player averages a delivery total of 24/30.
 *      The "sloppy" player averages 16/30.
 *   9. We do NOT model personnel events, random events, or the AEA Show wave
 *      multiplier (those are stochastic; we note their upside in findings).
 *  10. Star rating is approximated: it drifts toward (total/30)*5 stars per job.
 *      Award rep pillar = min(30, starRating/5*20 + loyalAccounts*2.2).
 *      We count one loyal account per 4 hits (>= 24/30) -- rough approximation.
 *  11. Award workforce pillar: no apprentices, no advanced certs beyond starting
 *      crew in the base trace. sumCreds starts at Dana(2)+Gary(1)=3.
 *  12. Award safety pillar: min(18, culture*0.18). We hold culture at 68+ticks.
 *  13. Award dealer pillar: min(14, dealerScore*1.8). Each dealer tier held
 *      contributes to dealerScore.
 *  14. Award biz pillar: min(8, clamp(cash/8000,0,5) + level*0.6).
 */

// ---- CONSTANTS FROM index.html ----

const JOBS = {
  audio:   { era:1, credReq:0, pay:6000,  shifts:4, fit:{piston:'amazing',lsa:'amazing'} },
  elt:     { era:1, credReq:0, pay:5000,  shifts:4, fit:{} },
  cert:    { era:1, credReq:0, pay:4800,  shifts:2, fit:{} },
  xpdr:    { era:1, credReq:0, pay:3600,  shifts:2, fit:{} },
  harness: { era:1, credReq:0, pay:7000,  shifts:4, fit:{experimental:'amazing',warbird:'amazing'} },
  radio:   { era:1, credReq:0, pay:5000,  shifts:4, fit:{} },
  glass:   { era:2, credReq:1, pay:24000, shifts:4, fit:{tprop1:'amazing',tprop2:'amazing',twinpiston:'amazing',taildragger:'dead',experimental:'risky',warbird:'risky'} },
  ap:      { era:2, credReq:1, pay:17000, shifts:4, fit:{tprop1:'amazing',tprop2:'amazing',twinpiston:'amazing',ljet:'amazing',mjet:'amazing',taildragger:'risky',experimental:'risky'} },
  eis:     { era:2, credReq:0, pay:9000,  shifts:4, fit:{piston:'amazing',experimental:'amazing',twinpiston:'amazing'} },
  adsb:    { era:3, credReq:1, pay:9000,  shifts:4, fit:{piston:'amazing',lsa:'amazing',floatplane:'amazing',taildragger:'risky'} },
  datalink:{ era:4, credReq:2, pay:32000, shifts:4, fit:{ljet:'amazing',mjet:'amazing'} },
  radar:   { era:4, credReq:2, pay:21000, shifts:4, fit:{tprop1:'amazing',tprop2:'amazing',ljet:'amazing',mjet:'amazing'} },
  traffic: { era:4, credReq:1, pay:11000, shifts:4, fit:{ljet:'amazing',mjet:'amazing',tprop1:'amazing',tprop2:'amazing'} },
};

const AIRCRAFT = {
  piston:     { tier:1.0,  lvl:1 },
  lsa:        { tier:0.7,  lvl:1 },
  taildragger:{ tier:0.75, lvl:1 },
  experimental:{ tier:0.85,lvl:1 },
  twinpiston: { tier:1.15, lvl:1 },
  warbird:    { tier:1.1,  lvl:1 },
  heli:       { tier:1.3,  lvl:1 },
  floatplane: { tier:1.2,  lvl:2 },
  tprop1:     { tier:1.7,  lvl:2 },
  tprop2:     { tier:1.9,  lvl:2 },
  ljet:       { tier:2.6,  lvl:3 },
  mjet:       { tier:3.2,  lvl:3 },
};

const FITMULT = { amazing:1.4, solid:1.0, risky:0.7, dead:0.4 };

// Labor rate Standard (index 1) -- the default
const RATES = [
  { k:'value',    mult:0.88, expect:-1.0 },
  { k:'standard', mult:1.0,  expect: 0   },  // <-- we use this
  { k:'premium',  mult:1.28, expect: 1.4 },
];
const RATE_MULT = 1.0; // standard

// Gear multipliers for OEM jobs (budget=0.8, standard=1.0, premium=1.5)
const GEAR_MUL = { budget:0.8, standard:1.0, premium:1.5 };
// Consumables multipliers
const CONS_MUL = { lean:0.6, standard:1.0, padded:1.5 };

// OEMs -- only the fields we need for the trace
const OEMS = {
  larkfield: { era:1, buyin:[0,4000,9000,16000],  annual:[0,500,1100,2000],   salesReq:[0,2,6,12],  repReq:[0,8,28,60],    certReq:[0,0,1,2], margin:[1,1.08,1.16,1.26] },
  kestrel:   { era:1, buyin:[0,4500,10000,18000], annual:[0,500,1200,2200],   salesReq:[0,2,7,14],  repReq:[0,10,30,62],   certReq:[0,0,1,2], margin:[1,1.08,1.17,1.28] },
  vireon:    { era:2, buyin:[0,9000,20000,40000], annual:[0,1000,2200,4000],  salesReq:[0,3,9,18],  repReq:[0,22,48,85],   certReq:[0,1,2,3], margin:[1,1.10,1.22,1.38] },
  tindall:   { era:2, buyin:[0,7000,16000,32000], annual:[0,900,2000,3600],   salesReq:[0,3,8,16],  repReq:[0,20,45,80],   certReq:[0,1,2,3], margin:[1,1.10,1.20,1.34] },
  quanta:    { era:3, buyin:[0,6000,14000,26000], annual:[0,800,1700,3000],   salesReq:[0,4,10,20], repReq:[0,18,42,75],   certReq:[0,1,2,2], margin:[1,1.10,1.20,1.32] },
  stratoline:{ era:4, buyin:[0,12000,26000,50000],annual:[0,1400,2800,5000],  salesReq:[0,2,6,12],  repReq:[0,30,55,92],   certReq:[0,1,2,3], margin:[1,1.12,1.24,1.40] },
  tempest:   { era:4, buyin:[0,10000,22000,42000],annual:[0,1200,2500,4400],  salesReq:[0,2,6,12],  repReq:[0,26,52,88],   certReq:[0,1,2,3], margin:[1,1.11,1.22,1.36] },
};
// Stocking cert req forced to 0 in code: OEM_ORDER.forEach(o => OEMS[o].certReq[1]=0)
Object.values(OEMS).forEach(o => o.certReq[1] = 0);

const JOB_OEM = {
  audio:'larkfield', elt:null, cert:null, xpdr:null, harness:null, radio:'vireon',
  glass:'vireon', ap:'tindall', eis:'kestrel', adsb:'quanta',
  datalink:'stratoline', radar:'tempest', traffic:'quanta',
};

// Shop upgrades
const UPGRADES = [
  { lvl:2, req:12, cost:20000 },
  { lvl:3, req:35, cost:60000 },
  { lvl:4, req:70, cost:150000 },
  { lvl:5, req:110, cost:320000 },
];

// Overhead constants
// Rent by level [unused, 600, 1400, 2800, 5000, 8000]
const RENT = [0, 600, 1400, 2800, 5000, 8000];

// Starting crew wages (from mkCrew formula: wage = round(500 + cred*350 + avgSkill*60))
// Dana: wiring=8, integ=6, trouble=9, paper=4, cred=2
//   avgSkill = (8+6+9+4)/4 = 6.75  wage = round(500 + 2*350 + 6.75*60) = round(500+700+405) = 1605
// Gary: wiring=4, integ=4, trouble=3, paper=6, cred=1
//   avgSkill = (4+4+3+6)/4 = 4.25  wage = round(500 + 1*350 + 4.25*60) = round(500+350+255) = 1105
const STARTING_PAYROLL = 1605 + 1105; // 2710/qtr per crew at start

// Insurance formula: clamp(round(1200 - culture*10), 300, 1300)
function insurance(culture) {
  return Math.max(300, Math.min(1300, Math.round(1200 - culture * 10)));
}

// Era gates (jobsDone -> era)
const ERA_GATE = { 3:2, 7:3, 12:4 };

// Award target
const AWARD_TARGET = 85;

// ---- SIMULATION CORE ----

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

// Compute quote total for a given job/aircraft/fit combo
// Returns { base, gearCost, consCost, feeAmt, total, kickback }
function computeQuote(jobKey, aircraftKey, fitKey, dealerTier, gearSel = 'standard', consSel = 'standard') {
  const j = JOBS[jobKey];
  const a = AIRCRAFT[aircraftKey];
  const base = Math.round(j.pay * a.tier * FITMULT[fitKey] * RATE_MULT);
  // no adsbRush, no waveMult in baseline

  const oem = JOB_OEM[jobKey];
  const gearStd = oem ? Math.round(base * 0.35) : Math.round(base * 0.12);
  const consStd = Math.round(base * 0.12);
  const feeAmt  = oem ? Math.round(base * 0.03) : 0;
  const labor   = base - gearStd - consStd - feeAmt;

  const gear    = Math.round(gearStd * (oem ? GEAR_MUL[gearSel] : 1));
  const cons    = Math.round(consStd * CONS_MUL[consSel]);
  const total   = labor + gear + cons + feeAmt;

  let kickback = 0;
  if (oem && dealerTier > 0 && gearSel === 'premium') {
    kickback = Math.round(gear * (OEMS[oem].margin[dealerTier] - 1));
  }

  return { base, gearCost: gear, consCost: cons, feeAmt, total, kickback, partsCost: cons };
}

// Payout from quality score (0.85 to 1.15 of quote total)
function payout(quoteTotal, total) {
  return Math.round(quoteTotal * (0.85 + (total / 30) * 0.30));
}

// Rep gain formula
function repGain(total, fitMult) {
  return Math.max(1, Math.round((total - 12) * fitMult));
}

// Compute overhead for one accrual tick (every 4 shifts = 1 job for 4-shift jobs)
function overheadTick(level, payroll, culture, dealers) {
  const rent = RENT[level] || 600;
  let fees = 0;
  for (const [oem, tier] of Object.entries(dealers)) {
    if (tier > 0) fees += OEMS[oem].annual[tier];
  }
  const ins = insurance(culture);
  // No Business course, no grant in baseline
  return -(rent + payroll + ins + fees);  // negative = cost
}

// awardParts from the game's formula
function awardParts(state) {
  const rep  = Math.min(30, (state.starRating / 5) * 20 + state.loyalAccounts * 2.2);
  const work = Math.min(30, state.gradCount * 3 + state.advTechs * 3 + state.sumCreds * 0.5);
  const safe = Math.min(18, state.culture * 0.18);
  const deal = Math.min(14, state.dealerScore * 1.8);
  const biz  = Math.min(8, clamp(state.cash / 8000, 0, 5) + state.level * 0.6);
  const total = rep + work + safe + deal + biz;
  return { rep, work, safe, deal, biz, total };
}

// ---- JOB MIX BY ERA ----
// For each era, pick the best available amazing-fit job and aircraft.
// Era 1: audio on piston (amazing, pay=6000, OEM=larkfield)
// Era 2: glass on twinpiston (amazing, pay=24000, OEM=vireon)
// Era 3: adsb on piston (amazing, pay=9000, OEM=quanta)
// Era 4: radar on tprop1 (amazing, pay=21000, OEM=tempest)
const ERA_JOB_MIX = {
  1: { job:'audio',  aircraft:'piston',    fit:'amazing' },
  2: { job:'glass',  aircraft:'twinpiston',fit:'amazing' },
  3: { job:'adsb',   aircraft:'piston',    fit:'amazing' },
  4: { job:'radar',  aircraft:'tprop1',    fit:'amazing' },
};

// ---- SIMULATE ----

function simulate(label, avgScore) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`PLAYER: ${label.toUpperCase()} (avg delivery score ${avgScore}/30)`);
  console.log(`${'='.repeat(60)}`);

  // State
  let cash     = 6000;
  let rep      = 0;
  let jobsDone = 0;
  let culture  = 68;
  let level    = 1;
  let era      = 1;
  let dealers  = {};      // { larkfield: 1, vireon: 2, ... }
  let oemSales = {};      // { larkfield: 3, ... }
  let dealerScore = 0;    // sum of dealer tier numbers
  let hasPremier = false;

  // Payroll grows as we hire; start with the base two.
  let payroll  = STARTING_PAYROLL;  // per overhead tick (per-job approximation)

  // Award tracking approximations
  let starRating    = 4.0;   // seeded from opening reviews
  let loyalAccounts = 0;     // incremented every 4 hits
  let hitCount      = 0;
  let sumCreds      = 3;     // Dana(2) + Gary(1)
  let advTechs      = 1;     // Dana is CAET Adv
  let gradCount     = 0;

  // Milestones
  let earlyMilestoneJob = null;
  let earlyMilestoneCash = null;
  let earlyMilestoneRep = null;
  let earlyMilestoneLimitFactor = null;

  let l5Job = null;
  let l5LimitFactor = null;

  let awardJob = null;
  let awardLimitFactor = null;

  const MAX_JOBS = 120;
  let limitingFactor = null;

  // track pending overhead -- accrues every 4 shifts
  // Inspection jobs (cert, xpdr) are 2 shifts: we accrue every OTHER inspection
  let pendingOverhead = 0;
  let shiftClock = 0;       // total shifts run so far (accrues every 4 shifts)
  let overheadAccruedAt = 0;

  // Track whether first dealer has been signed
  let firstDealerSigned = false;

  console.log(`\n  Start: cash=$${cash} rep=${rep} level=${level}\n`);

  for (let n = 1; n <= MAX_JOBS; n++) {
    // 1. Determine era for this job
    const jobEra = era;
    const mix = ERA_JOB_MIX[era] || ERA_JOB_MIX[1];
    const { job: jobKey, aircraft: acKey, fit: fitKey } = mix;
    const shifts = JOBS[jobKey].shifts || 4;

    // 2. Determine dealer tier for this OEM
    const oem = JOB_OEM[jobKey];
    const dt = oem ? (dealers[oem] || 0) : 0;

    // 3. Gear selection: standard until we are a stocking dealer, then premium
    const gearSel = (oem && dt > 0) ? 'premium' : 'standard';

    // 4. Compute quote
    const q = computeQuote(jobKey, acKey, fitKey, dt, gearSel, 'standard');

    // 5. Simulate payout from avgScore
    const pay = payout(q.total, avgScore);

    // 6. Net cash this job = pay - parts cost + kickback + pending overhead
    // Accrue overhead if 4+ shifts have elapsed since last accrual
    shiftClock += shifts;
    if (shiftClock - overheadAccruedAt >= 4) {
      // Accrue one overhead tick
      const tick = overheadTick(level, payroll, culture, dealers);
      pendingOverhead += tick;
      overheadAccruedAt = shiftClock;
    }

    const netJob = pay - q.partsCost + q.kickback + pendingOverhead;
    cash += netJob;
    pendingOverhead = 0;

    // 7. Rep gain (amazing fit mult = 1.4)
    const rg = repGain(avgScore, FITMULT[fitKey]);
    rep += rg;

    // 8. Track OEM sales (every job using that OEM adds 1 sale)
    if (oem) {
      oemSales[oem] = (oemSales[oem] || 0) + 1;
    }

    // 9. Culture drift (no HF course, no fatigue): +1 per overhead tick (once per 4-shift job)
    if (shifts === 4) {
      culture = Math.min(100, culture + 1);
    }

    // 10. Star rating approximation: drifts toward (avgScore/30)*5
    const newStar = (avgScore / 30) * 5;
    starRating = starRating * 0.85 + newStar * 0.15;

    // 11. Hit tracking (careful player >= 24, sloppy player <= 23)
    if (avgScore >= 24) {
      hitCount++;
      if (hitCount % 4 === 0) loyalAccounts++;
    }

    jobsDone = n;

    // 12. Buy dealer authorizations as soon as requirements are met and cash allows
    // Check each available OEM in era order
    const ERA_OEMS = {
      1: ['larkfield', 'kestrel'],
      2: ['vireon', 'tindall'],
      3: ['quanta'],
      4: ['stratoline', 'tempest'],
    };
    for (let eraNum = 1; eraNum <= era; eraNum++) {
      for (const oemKey of (ERA_OEMS[eraNum] || [])) {
        const currentTier = dealers[oemKey] || 0;
        if (currentTier >= 3) continue;
        const nextTier = currentTier + 1;
        const O = OEMS[oemKey];
        const salesOk  = (oemSales[oemKey] || 0) >= O.salesReq[nextTier];
        const repOk    = rep >= O.repReq[nextTier];
        const certOk   = oemCertsMet(nextTier, O);  // certReq[1]=0 always
        const cultureOk = nextTier < 3 || culture >= 70;
        const canBuy    = salesOk && repOk && certOk && cultureOk && cash >= O.buyin[nextTier];
        if (canBuy) {
          cash -= O.buyin[nextTier];
          dealers[oemKey] = nextTier;
          dealerScore++;
          if (nextTier === 3) hasPremier = true;
          if (!firstDealerSigned && nextTier >= 1) firstDealerSigned = true;
          console.log(`  [Job ${n}] Bought ${oemKey} tier ${nextTier} (${['','Stocking','Authorized','Premier'][nextTier]}). Cash now $${Math.round(cash)}.`);
        }
      }
    }

    // 13. Buy level upgrades as soon as rep AND cash allow
    for (const u of UPGRADES) {
      if (level >= u.lvl) continue;
      if (level + 1 !== u.lvl) continue;  // only next level
      if (rep >= u.req && cash >= u.cost) {
        cash -= u.cost;
        level = u.lvl;
        // payroll grows roughly $800/qtr per new crew member hired at upgrade
        // (rough -- one new hire at market wage for cred=1, avg skill=5: ~1000+350+300=1650 => split over 2 hires ~825 each)
        payroll += 825;
        console.log(`  [Job ${n}] Upgraded to Level ${level}. Cash now $${Math.round(cash)}. Rep=${rep}.`);
        if (u.lvl === 5) {
          l5Job = n;
          l5LimitFactor = determineLimitFactor(rep, cash, u);
          console.log(`  [Job ${n}] *** REACHED LEVEL 5 ***`);
        }
      }
    }

    // 14. Check early milestone: Level 2 + at least one dealer signed
    if (!earlyMilestoneJob && level >= 2 && firstDealerSigned) {
      earlyMilestoneJob = n;
      earlyMilestoneCash = Math.round(cash);
      earlyMilestoneRep  = rep;
      // What bound it? The later of Level 2 or first dealer
      earlyMilestoneLimitFactor = earlyLimitFactor(rep, cash, dealers, oemSales);
      console.log(`\n  *** EARLY MILESTONE REACHED at job ${n}: Level ${level}, first dealer signed ***`);
      console.log(`      Cash=$${earlyMilestoneCash}, Rep=${rep}, Culture=${Math.round(culture)}`);
      console.log(`      Limiting factor: ${earlyMilestoneLimitFactor}\n`);
    }

    // 15. Check era advance
    if (ERA_GATE[jobsDone] && era < ERA_GATE[jobsDone]) {
      era = ERA_GATE[jobsDone];
      console.log(`  [Job ${n}] Era advanced to ${era}.`);
    }

    // 16. Check award
    const av = awardParts({
      starRating, loyalAccounts, gradCount, advTechs, sumCreds, culture, dealerScore, cash, level,
    });
    const awardOk = av.total >= AWARD_TARGET && culture >= 70 && (hasPremier || level >= 5);
    if (!awardJob && awardOk) {
      awardJob = n;
      awardLimitFactor = awardLimiter(av, culture, hasPremier, level);
      console.log(`\n  *** AWARD REACHED at job ${n} ***`);
      console.log(`      Score=${av.total.toFixed(1)} (rep=${av.rep.toFixed(1)}, work=${av.work.toFixed(1)}, safe=${av.safe.toFixed(1)}, deal=${av.deal.toFixed(1)}, biz=${av.biz.toFixed(1)})`);
      console.log(`      Cash=$${Math.round(cash)}, Rep=${rep}, Culture=${Math.round(culture)}, hasPremier=${hasPremier}, Level=${level}`);
      console.log(`      Limiting factor: ${awardLimitFactor}\n`);
    }

    // Print periodic status
    if (n <= 20 || n % 10 === 0) {
      const av2 = awardParts({ starRating, loyalAccounts, gradCount, advTechs, sumCreds, culture, dealerScore, cash, level });
      console.log(`  Job ${String(n).padStart(3)}: cash=$${String(Math.round(cash)).padStart(8)} rep=${String(rep).padStart(4)} lv=${level} era=${era} award=${av2.total.toFixed(1)}/85 culture=${Math.round(culture)} star=${starRating.toFixed(2)} dealer=${JSON.stringify(dealers)}`);
    }

    // Stop once we have all milestones
    if (earlyMilestoneJob && awardJob) break;
  }

  // Summary
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`SUMMARY: ${label}`);
  console.log(`${'─'.repeat(60)}`);
  if (earlyMilestoneJob) {
    const minMins = earlyMilestoneJob * 1;  // 60 seconds per job
    const maxMins = earlyMilestoneJob * 2;  // 120 seconds per job
    console.log(`Early milestone (Lv2 + first dealer): job ${earlyMilestoneJob} (~${minMins}-${maxMins} min)`);
    console.log(`  Limiting factor: ${earlyMilestoneLimitFactor}`);
    console.log(`  Cash at gate=$${earlyMilestoneCash}, Rep=${earlyMilestoneRep}`);
  } else {
    console.log(`Early milestone: NOT REACHED in ${MAX_JOBS} jobs`);
  }
  if (l5Job) {
    const minMins = l5Job * 1;
    const maxMins = l5Job * 2;
    console.log(`Level 5: job ${l5Job} (~${minMins}-${maxMins} min)`);
    console.log(`  Limiting factor: ${l5LimitFactor}`);
  } else {
    console.log(`Level 5: NOT REACHED in ${MAX_JOBS} jobs`);
  }
  if (awardJob) {
    const minMins = awardJob * 1;
    const maxMins = awardJob * 2;
    console.log(`Shop of the Year award: job ${awardJob} (~${minMins}-${maxMins} min)`);
    console.log(`  Limiting factor: ${awardLimitFactor}`);
  } else {
    const av2 = awardParts({ starRating, loyalAccounts, gradCount, advTechs, sumCreds, culture, dealerScore, cash, level });
    console.log(`Shop of the Year: NOT REACHED in ${MAX_JOBS} jobs`);
    console.log(`  Final award score: ${av2.total.toFixed(1)} / 85`);
    console.log(`  Score breakdown: rep=${av2.rep.toFixed(1)} work=${av2.work.toFixed(1)} safe=${av2.safe.toFixed(1)} deal=${av2.deal.toFixed(1)} biz=${av2.biz.toFixed(1)}`);
    console.log(`  Culture=${Math.round(culture)}, hasPremier=${hasPremier}, Level=${level}`);
    // Identify the bottleneck
    const bottleneck = awardBottleneck(av2, culture, hasPremier, level);
    console.log(`  Bottleneck: ${bottleneck}`);
  }

  return { earlyMilestoneJob, awardJob, l5Job };
}

// -- Helper functions for limit factor diagnosis --

function oemCertsMet(tier, O) {
  // Assume certReq[1] is 0 (forced in code). For higher tiers, we simplify:
  // assume the player has NOT spent on OEM certs (worst case, unless tier=1).
  if (tier === 1) return true;  // certReq forced to 0
  return false; // tier 2+ needs certs we have not paid for in this trace
}

function determineLimitFactor(rep, cash, upgrade) {
  if (rep < upgrade.req && cash < upgrade.cost) return 'BOTH rep and cash insufficient';
  if (rep < upgrade.req) return `REP (need ${upgrade.req}, have ${rep})`;
  if (cash < upgrade.cost) return `CASH (need $${upgrade.cost}, have $${Math.round(cash)})`;
  return 'none (just reached)';
}

function earlyLimitFactor(rep, cash, dealers, oemSales) {
  // What came last: level 2 (rep 12 / $20k) or first dealer (rep 8 / $4k + 2 sales)?
  const larkSales = oemSales['larkfield'] || 0;
  const larkDealer = dealers['larkfield'] || 0;
  const factors = [];
  if (larkDealer < 1) {
    if (larkSales < 2) factors.push(`dealer: needs ${2 - larkSales} more Larkfield sales`);
    if (rep < 8)       factors.push(`dealer: needs rep ${8 - rep} more`);
  }
  return factors.length ? factors.join('; ') : 'rep gate (rep 12 for Lv2)';
}

function awardLimiter(av, culture, hasPremier, level) {
  const parts = [];
  if (av.total < AWARD_TARGET)   parts.push(`score (${av.total.toFixed(1)}/85)`);
  if (culture < 70)               parts.push(`culture (${Math.round(culture)}/70)`);
  if (!hasPremier && level < 5)   parts.push('no Premier dealer and not Level 5');
  return parts.join('; ') || 'all conditions met simultaneously';
}

function awardBottleneck(av, culture, hasPremier, level) {
  const shortfalls = [
    { name:'rep pillar',      gap: 30 - av.rep  },
    { name:'workforce pillar',gap: 30 - av.work },
    { name:'safety pillar',   gap: 18 - av.safe },
    { name:'dealer pillar',   gap: 14 - av.deal },
    { name:'biz pillar',      gap:  8 - av.biz  },
    { name:'total score',     gap: AWARD_TARGET - av.total },
  ];
  const gapped = shortfalls.filter(s => s.gap > 0).sort((a,b)=>b.gap-a.gap);
  const extras = [];
  if (culture < 70) extras.push(`culture ${Math.round(culture)} < 70`);
  if (!hasPremier && level < 5) extras.push('no Premier dealer, not Level 5');
  const top = gapped.slice(0,3).map(s=>`${s.name} (gap ${s.gap.toFixed(1)})`).join(', ');
  return [top, ...extras].join(' | ');
}

// ---- RUN ----

console.log('AEA Shop Tycoon -- Economy Finishability Trace');
console.log('Transcribed from index.html. Self-contained. Run: node tools/economy-trace.mjs');
console.log('\nSIMPLIFYING ASSUMPTIONS:');
console.log('  - Standard labor rate (1.0x), Standard consumables, no AEA courses');
console.log('  - Era job mix: audio/piston (era1), glass/twinpiston (era2), adsb/piston (era3), radar/tprop1 (era4)');
console.log('  - All amazing fit (guaranteed to appear on board at least once per board)');
console.log('  - Overhead accrues every 4 shifts (every job for non-inspection jobs)');
console.log('  - Dealer: Larkfield Stocking bought as soon as possible (2 sales + rep 8 + $4k)');
console.log('  - No random events, no AEA Show wave bonus, no personnel events');
console.log('  - No OEM cert purchases for tier 2+ dealers (cert cost not in scope for this trace)');
console.log('  - Star rating approximated: drifts toward (avgScore/30)*5 with 15% weight per job');
console.log('  - Loyal accounts: 1 per 4 hit-jobs (score >= 24) for careful player; 0 for sloppy');
console.log('  - sumCreds starts at 3 (Dana=2, Gary=1); no additional certs purchased in trace');
console.log('  - advTechs stays at 1 (Dana); culture drifts +1/4-shift-job from 68');
console.log('  - Payroll grows by ~$825/qtr at each upgrade (one rough new hire approximation)');

const careful = simulate('careful player (avg score 24/30)', 24);
const sloppy  = simulate('sloppy player (avg score 16/30)', 16);

console.log('\n');
console.log('=' .repeat(60));
console.log('COMPARISON TABLE');
console.log('='.repeat(60));
console.log(`                          CAREFUL     SLOPPY`);
console.log(`Early milestone (jobs):   ${String(careful.earlyMilestoneJob || 'N/A').padStart(8)}   ${String(sloppy.earlyMilestoneJob || 'N/A').padStart(6)}`);
console.log(`Early milestone (mins):   ${careful.earlyMilestoneJob ? `~${careful.earlyMilestoneJob*1}-${careful.earlyMilestoneJob*2}` : 'N/A'}    ${sloppy.earlyMilestoneJob ? `~${sloppy.earlyMilestoneJob*1}-${sloppy.earlyMilestoneJob*2}` : 'N/A'}`);
console.log(`Level 5 reached (jobs):   ${String(careful.l5Job || 'N/A').padStart(8)}   ${String(sloppy.l5Job || 'N/A').padStart(6)}`);
console.log(`Award reached (jobs):     ${String(careful.awardJob || 'N/A').padStart(8)}   ${String(sloppy.awardJob || 'N/A').padStart(6)}`);
console.log(`Award reached (mins):     ${careful.awardJob ? `~${careful.awardJob*1}-${careful.awardJob*2}` : 'N/A'}    ${sloppy.awardJob ? `~${sloppy.awardJob*1}-${sloppy.awardJob*2}` : 'N/A'}`);
console.log('');
console.log('NOTE: 1 min per job is the absolute minimum (speed-run). 2 min is a comfortable pace.');
console.log('      Real play including events, training, hiring will be 3-5 min per job.');
