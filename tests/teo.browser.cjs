const{chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});try{for(const width of[1280,390]){const page=await browser.newPage({viewport:{width,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.googleapis.com/**',r=>r.abort());await page.goto(process.argv[2]||'http://127.0.0.1:8020/',{waitUntil:'load'});
 for(const state of['none','accepted','two-wins','ready','completed']){
  const unlocked=['ready','completed'].includes(state);
  await page.evaluate(state=>{const hero={version:2,name:'Test',classId:'warrior',gender:'female',level:5,xp:0,gold:100,energy:100};if(state!=='none')hero.taurielQuest={status:state==='two-wins'||state==='accepted'?'active':state,defeated:TaurielQuest.BANDITS.slice(0,state==='accepted'?0:state==='two-wins'?2:3).map(x=>x.id),acceptedAt:Date.now()};localStorage.setItem('pustkowie.hero.v2',JSON.stringify(hero));},state);
  await page.reload({waitUntil:'load'});await require("./profile-fixture.cjs")(page);if(width===390)await page.locator('#menu-toggle').click();await page.locator('#hub-navigation [data-place="tavern"]').click();
  assert.equal(await page.locator('[data-npc="teo"]').isVisible(),unlocked);assert.equal(await page.locator('[data-npc="tauriel"]').isVisible(),!unlocked);
  if(unlocked){
   await page.locator('[data-npc="teo"]').scrollIntoViewIfNeeded();await page.locator('[data-npc="teo"]').click();assert.equal(await page.locator('#tavern-speaker').innerText(),'Myśliwy Teo');assert.equal(await page.locator('.teo-service').isVisible(),true);assert.match(await page.locator('.teo-service').innerText(),/100 złota za sztukę/);
   await page.evaluate(async()=>{const img=new Image();img.src='tavern-with-teo.webp';await img.decode();if(!img.naturalWidth)throw Error('Missing Teo art');});
   if(state==='completed')await page.screenshot({path:`/tmp/teo-${width}.png`});await page.locator('[data-close-npc]').click();
   await page.locator('[data-npc="brand"]').click();assert.equal(await page.locator('.teo-service').isVisible(),false);await page.locator('[data-close-npc]').click();
   await page.locator('.stairs-hotspot').evaluate(e=>e.click());await page.locator('.door-one').click();await page.locator('[data-room-tauriel]').click();assert.equal(await page.locator('#upstairs-tauriel-title').innerText(),'Tauriel');
  }else{
   await page.locator('[data-npc="teo"]').evaluate(e=>e.click());assert.equal(await page.locator('.tavern-npc-dialog[aria-labelledby=tavern-speaker]').isVisible(),false);
  }
  const h=await page.evaluate(()=>JSON.parse(localStorage.getItem('pustkowie.hero.v2')));assert.equal(h.gold,100);assert.equal(h.energy,100);assert.equal(h.xp,0);
  console.log(`PASS ${width}px ${state}: Teo unlock, conversation, existing NPCs and unchanged resources`);
 }
 assert.deepEqual(errors,[]);await page.close();}}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
