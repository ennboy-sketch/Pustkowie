const{chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});fs.mkdirSync('outputs',{recursive:true});
 async function seed(p,scouts=true){
  await p.route('https://fonts.googleapis.com/**',r=>r.abort());await p.goto('http://127.0.0.1:8020/');
  await p.evaluate(scouts=>{const h={version:2,name:'Weteran',classId:'warrior',gender:'female',level:110,xp:0,gold:5000,shards:30,energy:80,energyCycleHours:6,nextEnergyResetAt:Date.now()+1000000,profession:'warrior-profession-2',statAllocations:{strength:30,endurance:30},taurielQuest:{status:'completed',defeated:TaurielQuest.BANDITS.map(b=>b.id)},gabrielQuest:{status:'completed',dummies:3,recovered:3},graveyardDefeated:Graveyard.BOSSES.map(b=>b.id),dungeonNextFightAt:Date.now()+1000000,lootInventory:[{id:'minotaur-axe',name:'Topór Minotaura',kind:'minotaur-axe',slot:'weapon',requiredLevel:20}],equipment:{weapon:'minotaur-axe'},ownedHeroSkins:['ember-steel'],heroSkin:'ember-steel',vesperaOutfit:'standing-ranger'};if(scouts)h.playerStats={version:1,battles:{},missions:{forest:1,mine:1,undercity:1}};localStorage.setItem('pustkowie.hero.v2',JSON.stringify(h));},scouts);
  await p.reload({waitUntil:'load'});await require('./profile-fixture.cjs')(p);
 }
 async function journal(p,id){await p.evaluate(id=>{HubNavigation.open('journal');if(id)CampaignPanel.select(id);},id);await p.locator('.campaign-panel').waitFor({state:'visible'});}
 async function accept(p,id){await journal(p,id);await p.locator(`[data-campaign-accept="${id}"]`).click();await p.waitForFunction(id=>OathCampaign.read(LocalProfiles.read()).accepted.includes(id),id);}
 async function visit(p,place,qid){
  await p.locator(`.campaign-detail [data-campaign-travel="${place}"]`).first().click();
  await p.waitForFunction(place=>OathCampaign.read(LocalProfiles.read()).visits.includes(place),place);
  if(['archive','throne'].includes(place)){assert.equal(await p.locator('.castle-panel').getAttribute('data-castle-room'),place);await p.locator('.castle-art').evaluate(i=>i.decode());}
  if(place==='vespera-bedroom'){assert.equal(await p.locator('.skin-house-panel').getAttribute('data-skin-house-room'),'bedroom');}
  if(place==='ubocze'||place==='hell-gates')assert.equal(await p.evaluate(()=>HubNavigation.world()),place);
  if(place==='eldor'||place==='ice-hills'){await p.locator(`[data-open-campaign="${qid}"]`).click();return;}
  await journal(p,qid);
 }
 async function fulfill(p,token,qid){
  if(await p.evaluate(token=>OathCampaign.condition(LocalProfiles.read(),token).done,token))return;
  if(token.startsWith('visit:')){await visit(p,token.slice(6),qid);return;}
  const a=await p.evaluate(token=>OathCampaign.activity(token.startsWith('win:')?token.slice(4):token),token);assert.ok(a);
  for(const required of a.requires)await fulfill(p,required,qid);
  await p.locator(`[data-campaign-activity="${a.id}"]`).click();
  if(a.kind==='inspect'){
   await p.locator('.campaign-encounter').waitFor({state:'visible'});await p.locator('.campaign-encounter-art').evaluate(i=>i.decode());
   const choice=a.id==='ownerless-crate'?'healers':a.id==='bone-remembrance'?'bind':a.choices[0].id;
   await p.locator(`[data-campaign-decision="${choice}"]`).click();
  }else{
   await p.locator('.combat-dialog').waitFor({state:'visible'});assert.match(await p.locator('.combat-top>div>span').innerText(),/Pęknięta Przysięga/);
   if(a.id==='severin-oath')assert.equal(await p.locator('[data-fighter=enemy] .campaign-severin').count(),1);
   await p.locator('.combat-actions button').click();
  }
  await p.waitForFunction(token=>OathCampaign.condition(LocalProfiles.read(),token).done,token);
 }
 async function complete(p,id){await accept(p,id);const goals=await p.evaluate(id=>OathCampaign.get(id).goals,id);for(const token of goals)await fulfill(p,token,id);await p.locator(`[data-campaign-claim="${id}"]`).click();await p.waitForFunction(id=>OathCampaign.done(LocalProfiles.read(),id),id);}
 try{
  for(const[width,height]of[[1280,900],[390,844]]){
   const context=await browser.newContext({viewport:{width,height}}),p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await seed(p);
   const old=await p.evaluate(()=>{const h=LocalProfiles.read();return{gold:h.gold,shards:h.shards,tauriel:h.taurielQuest,gabriel:h.gabrielQuest,bosses:h.graveyardDefeated,inventory:h.lootInventory,equipment:h.equipment,cooldown:h.dungeonNextFightAt};});
   await journal(p);assert.equal(await p.locator('.campaign-quest').count(),10);
   await p.locator('[data-campaign-tab=side]').click();assert.equal(await p.locator('.campaign-quest').count(),4);await p.locator('[data-campaign-tab=chapter]').click();assert.equal(await p.locator('.campaign-quest').count(),4);
   for(const id of ['uninvited','iron-oath','three-reports'])await complete(p,id);
   assert.equal(await p.evaluate(()=>LocalProfiles.read().activeCombat??null),null,'Legacy quests need no repeat fights');
   await complete(p,'root-whisper');await complete(p,'miners-shift');await accept(p,'bone-memory');
   assert.equal(await p.locator('[data-campaign-activity=bone-remembrance]').isDisabled(),true);
   await p.locator('.campaign-detail [data-campaign-travel=archive]').first().click();await p.waitForFunction(()=>OathCampaign.read(LocalProfiles.read()).visits.includes('archive'));await p.locator('.castle-art').evaluate(i=>i.decode());
   const view=p.locator('.castle-viewport');await view.focus();await p.keyboard.press('+');await p.waitForFunction(()=>Number(document.querySelector('.castle-viewport').dataset.zoomScale)>1);
   const pos=await p.evaluate(()=>{GameLocation.flush();return LocalProfiles.view();});assert.equal(pos.room,'archive');
   await p.screenshot({path:`outputs/severin-archive-${width}.png`});
   await p.reload({waitUntil:'load'});assert.match(await p.locator('.profile-card').innerText(),/Archiwum Pieczęci/);
   await Promise.all([p.waitForNavigation({waitUntil:'load'}),p.locator('[data-play-profile=legacy]').click()]);await p.waitForFunction(()=>document.querySelector('.castle-panel')?.dataset.castleRoom==='archive');
   await p.waitForFunction(scale=>Math.abs(Number(document.querySelector('.castle-viewport').dataset.zoomScale)-scale)<.01,pos.placeView.scale);
   await p.locator('[data-castle-severin]').click();assert.match(await p.locator('.castle-severin-line').innerText(),/Mistrz Pieczęci/);await p.locator('[data-open-campaign]').click();
   await fulfill(p,'bone-remembrance','bone-memory');await p.locator('[data-campaign-claim=bone-memory]').click();await p.waitForFunction(()=>OathCampaign.done(LocalProfiles.read(),'bone-memory'));
   for(const id of ['sleepless-graves','blade-trace','masked-face','broken-crown'])await complete(p,id);
   assert.match(await p.locator('.campaign-overview').innerText(),/10 \/ 10/);await p.screenshot({path:`outputs/campaign-main-complete-${width}.png`});
   for(const id of ['trophies','ownerless-cargo','lost-mirror','fallen-names','outskirts-seal','eldor-seal','ice-seal','hell-seal'])await complete(p,id);
   const h=await p.evaluate(()=>LocalProfiles.read()),expected=await p.evaluate(()=>OathCampaign.CATALOG.reduce((r,q)=>({gold:r.gold+q.reward.gold,shards:r.shards+q.reward.shards}),{gold:5000,shards:30}));
   assert.equal(h.campaign.completed.length,18);assert.equal(h.gold,expected.gold);assert.equal(h.shards,expected.shards);assert.equal(h.energy,80);assert.deepEqual(h.taurielQuest,old.tauriel);assert.deepEqual(h.gabrielQuest,old.gabriel);assert.deepEqual(h.graveyardDefeated,old.bosses);assert.deepEqual(h.lootInventory,old.inventory);assert.deepEqual(h.equipment,old.equipment);assert.equal(h.dungeonNextFightAt,old.cooldown);assert.equal(h.heroSkin,'ember-steel');assert.equal(h.vesperaOutfit,'standing-ranger');assert.equal(h.campaign.decisions['ownerless-crate'],'healers');assert.equal(h.campaign.decisions['bone-remembrance'],'bind');
   assert.deepEqual(errors,[]);console.log(`PASS ${width}x${height}: 10 main, 4 side, 4 chapters, real campaign battles, existing quests credited, room/zoom resume, decisions and exact rewards`);await context.close();
  }
  const context=await browser.newContext({viewport:{width:390,height:844}}),p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await seed(p,false);
  await complete(p,'uninvited');await complete(p,'iron-oath');await accept(p,'three-reports');await p.locator('[data-campaign-activity=report-forest]').click();await p.locator('.campaign-encounter').waitFor({state:'visible'});await p.keyboard.press('Escape');assert.equal(await p.evaluate(()=>OathCampaign.read(LocalProfiles.read()).clues.length),0);
  await p.locator('[data-campaign-activity=report-forest]').click();await p.evaluate(()=>{window.originalSave=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='pustkowie.hero.v2')throw new DOMException('test','QuotaExceededError');return window.originalSave.call(this,k,v);};});
  await p.locator('[data-campaign-decision=record]').click();await p.waitForFunction(()=>document.querySelector('.campaign-encounter-message').textContent.includes('Nie udało'));assert.equal(await p.evaluate(()=>OathCampaign.read(LocalProfiles.read()).clues.length),0);
  await p.evaluate(()=>Storage.prototype.setItem=window.originalSave);await p.locator('[data-campaign-decision=record]').click();await p.waitForFunction(()=>OathCampaign.read(LocalProfiles.read()).clues.includes('report-forest'));
  await p.screenshot({path:'outputs/campaign-journal-390.png'});assert.deepEqual(errors,[]);await context.close();
  const shared=await browser.newContext(),a=await shared.newPage();await seed(a);await accept(a,'uninvited');
  const b=await shared.newPage();await b.route('https://fonts.googleapis.com/**',r=>r.abort());await b.goto('http://127.0.0.1:8020/');await require('./profile-fixture.cjs')(b);await journal(b,'uninvited');
  await Promise.all([a,b].map(p=>p.evaluate(()=>document.querySelector('[data-campaign-claim=uninvited]').click())));
  await a.waitForFunction(()=>OathCampaign.done(LocalProfiles.read(),'uninvited'));await b.waitForFunction(()=>LocalProfiles.read().gold===5080);assert.equal(await a.evaluate(()=>LocalProfiles.read().gold),5080);assert.equal(await a.evaluate(()=>OathCampaign.read(LocalProfiles.read()).completed.length),1);await shared.close();
  console.log('PASS cancellation, failed storage and competing tabs preserve progress and award only once');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
