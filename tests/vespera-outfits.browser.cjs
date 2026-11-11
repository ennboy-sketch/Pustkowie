const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{for(const width of [1280,390]){
  const context=await browser.newContext({viewport:{width,height:900}}),p=await context.newPage(),errors=[];
  p.on('pageerror',e=>errors.push(e.message));await p.route('https://fonts.googleapis.com/**',r=>r.abort());
  await p.goto('http://127.0.0.1:8020/');await p.evaluate(()=>localStorage.setItem('pustkowie.hero.v2',JSON.stringify({version:2,name:'Test',classId:'warrior',gender:'female',level:1,xp:0,gold:200,shards:20,energy:80})));
  await p.reload({waitUntil:'load'});await require('./profile-fixture.cjs')(p);
  const value=()=>p.evaluate(()=>({shards:LocalProfiles.read().shards,id:VesperaOutfits.current(LocalProfiles.read()).id}));
  async function open(page=p){await page.evaluate(()=>HubNavigation.open('skin-house'));await page.locator('.skin-house-art').evaluate(i=>i.decode());await page.locator('[data-skin-house-merchant]').click();await page.locator('.skin-house-dialog [data-open-vespera-outfits]').click();await page.locator('.vespera-wardrobe').waitFor({state:'visible'});}
  async function choose(id,page=p){await page.locator(`[name=vespera-outfit][value="${id}"]`).check();}
  await open();assert.equal(await p.locator('.vespera-outfit-card').count(),13);
  await choose('commander');assert.deepEqual(await value(),{shards:20,id:'default'});
  await p.evaluate(()=>{window.saveItem=Storage.prototype.setItem;Storage.prototype.setItem=function(key,v){if(key==='pustkowie.hero.v2')throw new DOMException('test','QuotaExceededError');return window.saveItem.call(this,key,v);};});
  await p.locator('[data-confirm-vespera-outfit]').click();await p.waitForFunction(()=>document.querySelector('.vespera-message').textContent.includes('Nie udało'));
  assert.deepEqual(await value(),{shards:20,id:'default'});assert.equal(await p.locator('.skin-house-art').getAttribute('data-vespera-outfit'),'default');
  await p.evaluate(()=>{Storage.prototype.setItem=window.saveItem;const click=()=>document.querySelector('[data-confirm-vespera-outfit]').dispatchEvent(new MouseEvent('click',{bubbles:true}));click();click();});
  await p.waitForFunction(()=>VesperaOutfits.current(LocalProfiles.read()).id==='commander');assert.deepEqual(await value(),{shards:15,id:'commander'});
  assert.equal(await p.locator('[data-confirm-vespera-outfit]').isDisabled(),true);
  await p.evaluate(()=>document.querySelector('[data-confirm-vespera-outfit]').dispatchEvent(new MouseEvent('click',{bubbles:true})));
  await p.waitForFunction(()=>document.querySelector('.vespera-message').textContent.includes('już wybrany'));assert.deepEqual(await value(),{shards:15,id:'commander'});
  await choose('queen');await p.keyboard.press('Escape');assert.deepEqual(await value(),{shards:15,id:'commander'});
  await p.locator('[data-skin-house-merchant]').click();await p.locator('.skin-house-dialog [data-open-vespera-outfits]').click();
  await choose('priestess');
  await p.evaluate(()=>{window.originalDecode=Image.prototype.decode;window.loadGate=new Promise(resolve=>window.releaseLoad=resolve);Image.prototype.decode=function(){return window.loadGate.then(()=>window.originalDecode.call(this));};});
  await p.locator('[data-confirm-vespera-outfit]').click();await p.keyboard.press('Escape');await p.locator('[data-skin-house-merchant]').click();
  await p.evaluate(()=>{Image.prototype.decode=window.originalDecode;window.releaseLoad();});
  await p.waitForFunction(()=>!document.querySelector('.vespera-wardrobe fieldset').disabled);assert.deepEqual(await value(),{shards:15,id:'commander'});
  await p.locator('.skin-house-dialog [data-open-vespera-outfits]').click();await choose('queen');await p.locator('[data-confirm-vespera-outfit]').click();
  await p.waitForFunction(()=>VesperaOutfits.current(LocalProfiles.read()).id==='queen');assert.deepEqual(await value(),{shards:10,id:'queen'});
  await p.keyboard.press('Escape');await p.locator('.skin-house-art').evaluate(i=>i.decode());
  await p.screenshot({path:`/tmp/vespera-queen-${width}.png`});await p.evaluate(()=>GameLocation.flush());
  await p.reload({waitUntil:'load'});await Promise.all([p.waitForNavigation({waitUntil:'load'}),p.locator('[data-play-profile=legacy]').click()]);await p.locator('#ready').waitFor({state:'visible'});await p.evaluate(()=>GameLocation.ready);
  assert.equal(await p.locator('.skin-house-art').getAttribute('data-vespera-outfit'),'queen');assert.deepEqual(await value(),{shards:10,id:'queen'});
  await p.locator('[data-skin-house-merchant]').click();await p.locator('.skin-house-dialog [data-open-vespera-outfits]').click();
  for(const id of ['sorceress','huntress','priestess','warrior','druid','innkeeper','dancer','aristocrat','mercenary','shadow']){await choose(id);await p.locator('.vespera-preview img').evaluate(i=>i.decode());assert.deepEqual(await value(),{shards:10,id:'queen'});}
  await p.screenshot({path:`/tmp/vespera-wardrobe-${width}.png`});
  const q=await p.context().newPage();q.on('pageerror',e=>errors.push(e.message));await q.route('https://fonts.googleapis.com/**',r=>r.abort());await q.goto('http://127.0.0.1:8020/');await require('./profile-fixture.cjs')(q);await open(q);
  await choose('dancer');await choose('shadow',q);
  for(const page of [p,q])await page.evaluate(()=>{window.originalDecode=Image.prototype.decode;window.gate=new Promise(resolve=>window.release=resolve);Image.prototype.decode=function(){return window.gate.then(()=>window.originalDecode.call(this));};});
  await Promise.all([p.locator('[data-confirm-vespera-outfit]').click(),q.locator('[data-confirm-vespera-outfit]').click()]);
  await Promise.all([p.evaluate(()=>{Image.prototype.decode=window.originalDecode;window.release();}),q.evaluate(()=>{Image.prototype.decode=window.originalDecode;window.release();})]);
  await p.waitForFunction(()=>LocalProfiles.read().shards===5);await Promise.all([p.waitForFunction(()=>!document.querySelector('.vespera-wardrobe fieldset').disabled),q.waitForFunction(()=>!document.querySelector('.vespera-wardrobe fieldset').disabled)]);
  assert.equal((await value()).shards,5);assert.ok(['dancer','shadow'].includes((await value()).id));
  const paid=(await value()).id;await q.close();
  await p.route('**/vespera-outfits-b.webp',r=>r.abort());await p.reload({waitUntil:'load'});await require('./profile-fixture.cjs')(p);await open();await choose('priestess');await p.locator('[data-confirm-vespera-outfit]').click();
  await p.waitForFunction(()=>document.querySelector('.vespera-message').textContent.includes('Nie udało się wczytać'));assert.deepEqual(await value(),{shards:5,id:paid});
  await p.unroute('**/vespera-outfits-b.webp');await p.locator('[data-confirm-vespera-outfit]').click();await p.waitForFunction(()=>VesperaOutfits.current(LocalProfiles.read()).id==='priestess');assert.deepEqual(await value(),{shards:0,id:'priestess'});
  await choose('queen');assert.equal(await p.locator('[data-confirm-vespera-outfit]').isDisabled(),true);
  await p.evaluate(()=>document.querySelector('[data-confirm-vespera-outfit]').dispatchEvent(new MouseEvent('click',{bubbles:true})));await p.waitForFunction(()=>document.querySelector('.vespera-message').textContent.includes('Potrzebujesz 5'));assert.deepEqual(await value(),{shards:0,id:'priestess'});
  await Promise.all([p.waitForNavigation({waitUntil:'load'}),p.evaluate(()=>{const id=LocalProfiles.create({version:2,name:'Druga',classId:'mage',gender:'male',level:1,xp:0,gold:25,energy:100,shards:20});LocalProfiles.enter(id);})]);await p.locator('#ready').waitFor({state:'visible'});await p.evaluate(()=>GameLocation.ready);await open();assert.deepEqual(await value(),{shards:20,id:'default'});
  const previous=await p.evaluate(()=>JSON.parse(localStorage.getItem('pustkowie.hero.v2')));assert.equal(previous.vesperaOutfit,'priestess');assert.equal(previous.shards,0);assert.equal(previous.gold,200);assert.equal(previous.energy,80);assert.equal(previous.classId,'warrior');assert.equal(previous.gender,'female');assert.equal(previous.skin,undefined);
  assert.deepEqual(errors,[]);console.log(`PASS ${width}px: 13 seated previews, exact charge, no double charge, cancellation, failed save/image, reload, competing tabs and profile isolation`);await context.close();
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
