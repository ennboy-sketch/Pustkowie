const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{for(const [width,height] of [[1280,900],[390,844],[360,640]]){
  const context=await browser.newContext({viewport:{width,height}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://fonts.googleapis.com/**',r=>r.abort());await page.goto('http://127.0.0.1:8020/');
  await page.evaluate(()=>localStorage.setItem('pustkowie.hero.v2',JSON.stringify({version:2,name:'Test',classId:'warrior',gender:'female',level:31,xp:1234,gold:321,shards:17,energy:77,nextEnergyResetAt:Date.now()+86400000,vesperaOutfit:'queen',vesperaStandingOutfit:'standing-amethyst'})));
  await page.reload({waitUntil:'load'});await require('./profile-fixture.cjs')(page);await page.evaluate(()=>HubNavigation.open('glade'));await page.locator('[data-place=glade-path-3]').click();await page.locator('[data-place=ubocze-tavern]').click();
  await page.locator('.golden-pony-art').evaluate(i=>i.decode());const before=await page.evaluate(()=>JSON.stringify(LocalProfiles.read()));
  assert.equal(await page.locator('.pony-npc-marker').count(),3);assert.equal(await page.locator('.golden-pony-people [data-pony-npc]').count(),3);
  const reserved=page.locator('[data-pony-reserved-seat=fourth]');assert.equal(await reserved.count(),1);assert.equal(await reserved.getAttribute('role'),'note');assert.equal(await reserved.getAttribute('data-pony-npc'),null);assert.equal(await reserved.innerText(),'Wolne miejsce');
  const people=await page.evaluate(()=>GoldenPony.PEOPLE.map(p=>({id:p.id,name:p.name,role:p.role,topics:p.topics.map(t=>t.reply)})));assert.equal(people.length,3);
  fs.mkdirSync('outputs',{recursive:true});await page.screenshot({path:`outputs/mercenary-inn-${width}.png`});
  for(const person of people){
   await page.locator(`.golden-pony-people [data-pony-npc=${person.id}]`).click();const dialog=page.locator('.pony-npc-dialog');assert.equal(await dialog.isVisible(),true);assert.equal(await page.locator('#pony-speaker').innerText(),person.name);assert.equal(await page.locator('.pony-npc-role').innerText(),person.role);
   assert.match(await page.locator('.pony-npc-portrait').evaluate(e=>getComputedStyle(e).backgroundImage),/golden-pony-mercenaries.webp/);assert.equal(await page.locator('.pony-npc-reply').innerText(),'');
   for(let index=0;index<2;index++){await page.locator(`[data-pony-topic="${index}"]`).click();assert.equal(await page.locator('.pony-npc-reply').innerText(),person.topics[index]);}
   if(person.id==='roderik')await page.screenshot({path:`outputs/mercenary-dialog-${width}.png`});
   await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});await page.waitForFunction(()=>[...document.querySelectorAll('[data-pony-npc]')].every(b=>b.getAttribute('aria-pressed')==='false'));
   await page.locator(`.pony-npc-marker[data-pony-npc=${person.id}]`).click();assert.equal(await page.locator('#pony-speaker').innerText(),person.name);assert.equal(await page.locator('.pony-npc-reply').innerText(),'');await page.locator('[data-close-pony-npc]').click();
  }
  assert.equal(await page.evaluate(()=>JSON.stringify(LocalProfiles.read())),before);assert.equal(await page.locator('[data-open-campaign],[data-brand-offer],[data-mission-action]').count(),0);
  // Disposing the parent with a conversation open must not leave an orphaned modal.
  await page.locator('.golden-pony-people [data-pony-npc=mira]').click();await page.evaluate(()=>HubNavigation.open('map'));assert.equal(await page.locator('.pony-npc-dialog').getAttribute('open'),null);assert.equal(await page.locator('.pony-npc-dialog').isVisible(),false);
  await page.locator('.golden-pony-people [data-pony-npc=mira]').evaluate(button=>button.click());assert.equal(await page.locator('.pony-npc-dialog').getAttribute('open'),null);
  await page.evaluate(()=>HubNavigation.open('tavern'));assert.equal(await page.locator('.tavern-panel').count(),1);assert.equal(await page.locator('[data-npc=tobiasz]').count(),1);assert.equal(await page.locator('[data-npc=brand]').count(),1);assert.equal(await page.locator('[data-pony-npc]').count(),0);
  assert.equal(await page.evaluate(()=>JSON.stringify(LocalProfiles.read())),before);assert.deepEqual(errors,[]);
  console.log(`PASS ${width}x${height}: three named mercenaries, portraits, six dialogue topics, scene and toolbar controls, reserved empty fourth seat, cleanup and unchanged hero/mission pools`);await context.close();
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
