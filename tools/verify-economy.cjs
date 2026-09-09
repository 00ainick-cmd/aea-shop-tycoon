/* Run with PLAYWRIGHT_MODULE pointing to an installed Playwright module, or npm-installed playwright. */
const assert = require('node:assert/strict');
const {pathToFileURL} = require('node:url');
const path = require('node:path');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async () => {
 const browser = await chromium.launch({headless:true, channel:process.env.BROWSER_CHANNEL || 'msedge'});
 try {
 const page = await browser.newPage({viewport:{width:390,height:844}});
 await page.goto(pathToFileURL(path.join(__dirname,'../index.html')).href);
 const results = await page.evaluate(() => {
  const results=[]; const original=STATE;
  function check(name,fn){ STATE=makeState(); try{results.push({name,pass:!!fn()});}catch(e){results.push({name,pass:false,error:e.message});} }
  function job(){ const b=freshBay(); b.job={a:'piston',j:'audio',fit:'solid',matched:true,owner:'Test owner',ctype:'status',quote:{total:6000,cogs:2000,kickback:0}};b.owner='Test owner';b.bars={work:200,diag:200,comp:200,fin:200};b.shiftsDone=4;return b; }
  check('Annual dealership fee spread across twelve months',()=>{STATE.dealers={larkfield:1};return Math.abs(quarterCosts().fees*12-500)<0.01;});
  check('No elapsed month means no accrual',()=>{accrueOverhead();return STATE.pendingOverhead===0&&STATE.lastStmt===1;});
  check('Accrual catches up once and is idempotent',()=>{STATE.week=9;accrueOverhead();const once=STATE.pendingOverhead;accrueOverhead();return once<0&&STATE.pendingOverhead===once&&STATE.lastStmt===9;});
  check('Current month included before first invoice; render does not double charge',()=>{STATE.bays=[job()];STATE.week=5;computeScores(0,true);SCREENS.review();const first=STATE._invoice.net;const due=STATE.pendingOverhead;SCREENS.review();return due<0&&first<STATE.lastPayout-2000&&STATE._invoice.net===first;});
  check('Two bays share one monthly overhead charge',()=>{STATE.bays=[job(),job()];STATE.week=5;STATE.deliverQueue=[0,1];computeScores(0,true);SCREENS.review();const due=STATE.pendingOverhead;collect();STATE.activeBay=1;computeScores(1,true);SCREENS.review();return due<0&&STATE.pendingOverhead===0&&STATE._invoice.net===STATE.lastPayout-2000;});
  check('Quote acceptance alone cannot farm charisma',()=>{STATE.pendingJob={a:'piston',j:'audio',fit:'amazing',owner:'Test',ctype:'status',interest:80,matched:true};for(let i=0;i<5;i++)SCREENS.quote().actions[1].on();return STATE.charisma===3&&STATE.jobsDone===0;});
  check('One committed job earns charisma once',()=>{STATE.pendingJob={a:'piston',j:'audio',fit:'amazing',owner:'Test',ctype:'status',interest:80,matched:true};SCREENS.quote().actions[1].on();STATE.sel=[0];const start=SCREENS.assign().actions[1].on;start();start();return Math.abs(STATE.charisma-3.1)<0.00001;});
  check('Opening offers three distinct existing job types',()=>{newBoard();return STATE.board.length===3&&new Set(STATE.board.map(b=>b.openingId)).size===3&&STATE.board.every(b=>JOBS[b.j]);});
  check('Completed opening contract cannot be offered again',()=>{STATE.openingDone=['first-inspection'];newBoard();return STATE.board.length===2&&!STATE.board.some(b=>b.openingId==='first-inspection');});
  check('Expediting adds one invoice cost without delaying delivery',()=>{STATE.bays=[job()];STATE.bays[0].dueWeek=5;STATE.contractBay=0;const cogs=STATE.bays[0].job.quote.cogs;applyContractDecision('expedite');applyContractDecision('expedite');return STATE.bays[0].job.quote.cogs===cogs+650&&STATE.bays[0].shiftsNeed===4&&STATE.cash===6000;});
  check('Agreed delay extends promise and discounts ticket once',()=>{STATE.bays=[job()];STATE.bays[0].dueWeek=5;STATE.contractBay=0;applyContractDecision('reschedule');applyContractDecision('reschedule');return STATE.bays[0].dueWeek===6&&STATE.bays[0].shiftsNeed===5&&STATE.bays[0].job.quote.total===5700;});
  check('Unannounced delay misses the original promise',()=>{STATE.bays=[job()];STATE.bays[0].dueWeek=5;STATE.contractBay=0;applyContractDecision('wait');STATE.week=6;STATE.scores={total:30,squawkOk:true};return STATE.bays[0].dueWeek===5&&!jobOutcome(STATE.bays[0]).onTime;});
  check('Failed diagnostic answer is not automatically a late delivery',()=>{STATE.week=5;STATE.scores={total:20,squawkOk:false};const b=job();b.dueWeek=5;return jobOutcome(b).onTime;});
  check('Twelve real accruals charge exactly one annual line fee',()=>{
    function year(withDealer){STATE=makeState();if(withDealer)STATE.dealers={larkfield:1};for(let month=1;month<=12;month++){STATE.week=1+month*4;accrueOverhead();}return STATE.pendingOverhead;}
    const plain=year(false),dealer=year(true);return Math.abs(plain-dealer-500)<0.01;
  });
  STATE=original;render();return results;
 });
 results.forEach(r=>console.log((r.pass?'PASS':'FAIL')+' '+r.name+(r.error?' '+r.error:'')));
 assert.equal(results.filter(r=>!r.pass).length,0,'Economy regressions');
 await page.goto(pathToFileURL(path.join(__dirname,'../index.html')).href+'?test=1');
 assert.match(await page.locator('body').innerText(),/SELFTEST PASS\s+48\/48/);
 console.log('PASS existing 48 self-tests');
 await page.goto(pathToFileURL(path.join(__dirname,'../index.html')).href);
 await page.getByRole('button',{name:'PRESS START',exact:true}).focus();await page.keyboard.press('Enter');
 await page.getByRole('button',{name:/OPEN THE DOORS/}).focus();await page.keyboard.press('Enter');
 const soundBefore=await page.evaluate(()=>musicOn);await page.locator('#soundbtn').focus();await page.keyboard.press('Space');
 assert.notEqual(await page.evaluate(()=>musicOn),soundBefore);
 await page.locator('[data-fill]').first().focus();await page.keyboard.press('Enter');
 assert.equal(await page.evaluate(()=>STATE.screen),'board');
 await page.locator('[data-i]').first().focus();await page.keyboard.press('Enter');
 await page.locator('[data-ap="rapport"]').focus();await page.keyboard.press('Enter');
 await page.getByRole('button',{name:/SEND QUOTE/}).focus();await page.keyboard.press('Enter');
 await page.locator('[data-c="0"]').focus();await page.keyboard.press('Space');
 assert.deepEqual(await page.evaluate(()=>STATE.sel),[0]);
 await page.getByRole('button',{name:'START THE JOB',exact:true}).focus();await page.keyboard.press('Enter');
 assert.ok(await page.evaluate(()=>STATE.bays[0].job));
 assert.ok(await page.locator('.cash-forecast').count());
 console.log('PASS keyboard start, sound, bay, prospect, quote and crew assignment');
 } finally {await browser.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
