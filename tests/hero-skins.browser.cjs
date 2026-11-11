const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{for(const width of [1280,390])for(const classId of ['warrior','mage','elf','dwarf'])for(const gender of ['male','female']){
  const context=await browser.newContext({viewport:{width,height:900}}),p=await context.newPage(),errors=[];
  p.on('pageerror',e=>errors.push(e.message));await p.route('https://fonts.googleapis.com/**',r=>r.abort());await p.goto('http://127.0.0.1:8020/');
  await p.evaluate(({classId,gender})=>localStorage.setItem('pustkowie.hero.v2',JSON.stringify({version:2,name:'Test',classId,gender,level:10,xp:0,gold:200,shards:40,energy:80})),{classId,gender});
  await p.reload({waitUntil:'load'});await require('./profile-fixture.cjs')(p);
  const id=await p.evaluate(()=>HeroSkins.CATALOG.find(s=>s.classId===LocalProfiles.read().classId).id),cost=await p.evaluate(()=>HeroSkins.COST);
  async function open(page=p){await page.evaluate(()=>HubNavigation.open('skin-house'));await page.locator('.skin-house-art').evaluate(i=>i.decode());await page.locator('[data-open-hero-skins] span').click();}
  const balance=()=>p.evaluate(()=>LocalProfiles.read().shards);
  if(width===1280&&classId==='warrior'&&gender==='male')await p.route('**/hero-skins.webp*',r=>r.abort());
  await open();assert.equal(await p.locator('.hero-skin-grid label').count(),5);assert.equal(await balance(),40);
  const foreign=await p.evaluate(()=>HeroSkins.CATALOG.find(s=>s.classId!==LocalProfiles.read().classId).id);
  await p.locator(`[name=hero-skin-choice][value="${foreign}"]`).check();assert.equal(await p.locator('[data-confirm-hero-skin]').isDisabled(),true);
  await p.locator(`[name=hero-skin-choice][value="${id}"]`).check();assert.equal(await balance(),40);
  if(width===1280&&classId==='warrior'&&gender==='male'){
   await p.locator('[data-confirm-hero-skin]').click();await p.waitForFunction(()=>document.querySelector('.hero-skin-message').textContent.includes('Nie udało się wczytać'));assert.equal(await balance(),40);await p.unroute('**/hero-skins.webp*');
   await p.evaluate(()=>{window.saveItem=Storage.prototype.setItem;Storage.prototype.setItem=function(key,v){if(key==='pustkowie.hero.v2')throw new DOMException('test','QuotaExceededError');return window.saveItem.call(this,key,v);};});
   await p.locator('[data-confirm-hero-skin]').click();await p.waitForFunction(()=>document.querySelector('.hero-skin-message').textContent.includes('Nie udało się zapisać'));assert.equal(await balance(),40);
   await p.evaluate(()=>Storage.prototype.setItem=window.saveItem);
   const q=await context.newPage();q.on('pageerror',e=>errors.push(e.message));await q.route('https://fonts.googleapis.com/**',r=>r.abort());await q.goto('http://127.0.0.1:8020/');await require('./profile-fixture.cjs')(q);await open(q);
   await q.evaluate(()=>{window.decodeImage=Image.prototype.decode;window.gate=new Promise(resolve=>window.release=resolve);Image.prototype.decode=function(){return window.gate.then(()=>window.decodeImage.call(this));};});
   await q.locator('[data-confirm-hero-skin]').click();await q.waitForFunction(()=>document.querySelector('.hero-skin-dialog fieldset').disabled);
   await p.locator('[data-confirm-hero-skin]').click();await p.waitForFunction(()=>!!HeroSkins.current(LocalProfiles.read()));
   await q.evaluate(()=>{Image.prototype.decode=window.decodeImage;window.release();});await q.waitForFunction(()=>!document.querySelector('.hero-skin-dialog fieldset').disabled);
   assert.equal(await balance(),40-cost);assert.equal(await q.evaluate(()=>LocalProfiles.read().shards),40-cost);await q.close();
  }else{await p.locator('[data-confirm-hero-skin]').click();await p.waitForFunction(()=>!!HeroSkins.current(LocalProfiles.read()));}
  assert.equal(await balance(),40-cost);assert.equal(await p.locator('[data-confirm-hero-skin]').isDisabled(),true);assert.ok(await p.locator('.hero-skin-preview .character').evaluate(e=>e.getBoundingClientRect().height)>80);await p.locator('.hero-skin-preview .character').evaluate(async e=>{const url=getComputedStyle(e).backgroundImage.match(/url\(["']?(.*?)["']?\)/)[1],i=new Image();i.src=url;await i.decode();});
  assert.equal(await p.locator('#avatar-art').evaluate(e=>e.classList.contains('hero-skin')),true);
  await p.evaluate(async()=>{const i=new Image();i.src=HeroSkins.IMAGE;await i.decode();if(i.naturalWidth!==1536)throw Error('Missing skin atlas');});
  await p.screenshot({path:`/tmp/hero-skin-shop-${width}-${classId}-${gender}.png`});
  await p.locator('[name=hero-skin-choice][value=default]').check();await p.locator('[data-confirm-hero-skin]').click();await p.waitForFunction(()=>!HeroSkins.current(LocalProfiles.read()));assert.equal(await balance(),40-cost);
  await p.locator(`[name=hero-skin-choice][value="${id}"]`).check();assert.match(await p.locator('[data-confirm-hero-skin]').innerText(),/bez opłat/);await p.locator('[data-confirm-hero-skin]').click();await p.waitForFunction(()=>!!HeroSkins.current(LocalProfiles.read()));assert.equal(await balance(),40-cost);
  await p.evaluate(()=>HubNavigation.open('hero'));assert.equal(await p.locator('.hero-portrait .character').evaluate(e=>e.classList.contains('hero-skin')),true);
  assert.match(await p.locator('.hero-portrait .character').evaluate(e=>getComputedStyle(e).backgroundImage),/hero-skins.webp/);
  await p.screenshot({path:`/tmp/hero-skin-equipped-${width}-${classId}-${gender}.png`});
  await p.evaluate(()=>GameLocation.flush());await p.reload({waitUntil:'load'});assert.equal(await p.locator('.profile-portrait .character.hero-skin').count(),1);
  await Promise.all([p.waitForNavigation({waitUntil:'load'}),p.locator('[data-play-profile=legacy]').click()]);await p.locator('#ready').waitFor({state:'visible'});await p.evaluate(()=>GameLocation.ready);
  assert.equal(await p.locator('#avatar-art').evaluate(e=>e.classList.contains('hero-skin')),true);assert.equal(await balance(),40-cost);
  const saved=await p.evaluate(()=>LocalProfiles.read());assert.equal(saved.ownedHeroSkins.length,1);assert.equal(saved.heroSkin,id);assert.equal(saved.vesperaOutfit,undefined);assert.equal(saved.gold,200);assert.equal(saved.energy,80);
  await p.evaluate(()=>{LocalProfiles.write(BrandCombat.start(BrandCombat.prepare(LocalProfiles.read())));HubNavigation.open('tavern');});await p.locator('[data-npc=brand]').click();await p.locator('[data-resume-combat]').click();await p.locator('.combat-dialog').waitFor({state:'visible'});
  assert.equal(await p.locator('[data-fighter=hero] .combat-figure.hero-skin').count(),1);assert.equal(await p.evaluate(()=>LocalProfiles.read().activeCombat.battle.hero.appearanceSkin),id);
  assert.deepEqual(errors,[]);console.log(`PASS ${width}px ${classId} ${gender}: display shop, class guard, purchase once, free equip, portraits, profile resume and combat skin`);await context.close();
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
