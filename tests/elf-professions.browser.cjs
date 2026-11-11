const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{for(const width of [1280,390])for(const gender of ['female','male'])for(const slot of [1,2]){
  const p=await browser.newPage({viewport:{width,height:1000}}),errors=[];
  p.on('pageerror',e=>errors.push(e.message));await p.route('https://fonts.googleapis.com/**',r=>r.abort());
  await p.goto('http://127.0.0.1:8020/');
  await p.evaluate(gender=>localStorage.setItem('pustkowie.hero.v2',JSON.stringify({version:2,name:'Test',classId:'elf',gender,level:9,xp:0,profession:null,gold:10000,energy:5,energyCycleHours:12,nextEnergyResetAt:Date.now()+43200000})),gender);
  await p.reload({waitUntil:'load'});await require('./profile-fixture.cjs')(p);
  async function school(){
   await p.evaluate(()=>HubNavigation.open('guild'));
   await p.locator('[data-castle-school] span').click();await p.locator('[data-castle-lyrien]').click();
  }
  await school();assert.equal(await p.locator('.profession-card').count(),2);assert.equal(await p.locator('.profession-submit').isDisabled(),true);
  await p.evaluate(()=>{LocalProfiles.write({...LocalProfiles.read(),level:10});HubNavigation.open('guild');});
  await p.locator('[data-castle-school] span').click();await p.locator('[data-castle-lyrien]').click();
  await p.locator(`[value=elf-profession-${slot}]`).check();await p.locator('.profession-submit').click();
  const name=slot===1?'Zwiadowca':'Leśna Straż';
  await p.waitForFunction(name=>document.querySelector('#hero-profession').textContent===name,name);
  assert.equal(await p.evaluate(()=>LocalProfiles.read().energy),5);
  await p.screenshot({path:`/tmp/elf-profession-${width}-${slot}.png`});
  await p.reload({waitUntil:'load'});await require('./profile-fixture.cjs')(p);assert.equal(await p.locator('#hero-profession').innerText(),name);
  await school();assert.equal(await p.locator('.profession-submit').isDisabled(),true);
  await p.locator('#profession-form').evaluate(f=>{f.querySelector('fieldset').disabled=false;const inputs=f.querySelectorAll('input');inputs.forEach(i=>{i.disabled=false;i.checked=!i.checked;});f.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));});
  await p.waitForFunction(()=>document.querySelector('#profession-status').textContent.includes('Nie można'));
  assert.equal(await p.evaluate(()=>LocalProfiles.read().profession),`elf-profession-${slot}`);
  await p.evaluate(()=>HubNavigation.open('market'));await p.locator('[data-market-part=person]').click();await p.locator('[data-market-tier="5"]').click();
  const buy=p.locator('[data-buy-market="gringo-elf-5-dagger"]');
  if(slot===1){
   await buy.click();await p.waitForFunction(()=>HeroSheet.inventory(LocalProfiles.read()).some(i=>i.marketProduct==='gringo-elf-5-dagger'));
   await p.evaluate(()=>HubNavigation.open('inventory'));
   await p.getByRole('button',{name:/Miejsce .*Krótki Sztylet Zwiadowcy/}).click();await p.locator('[data-bag-equip]').click();
   await p.waitForFunction(()=>BrandCombat.profile(LocalProfiles.read()).weaponType==='dagger');
  }else assert.equal(await buy.count(),0);
  await p.evaluate(()=>HubNavigation.open('tavern'));await p.locator('[data-npc=brand]').click();
  const easy=p.locator('[data-choice-type=scout] [data-accept-choice]'),hard=p.locator('[data-choice-type=combat] [data-accept-choice]');
  assert.match(await easy.innerText(),slot===1?/1,5 energii/:/3 energii/);assert.match(await hard.innerText(),slot===1?/2,5 energii/:/5 energii/);
  if(slot===1){
   await easy.click();await p.locator('.scout-clock').waitFor();assert.equal(await p.evaluate(()=>LocalProfiles.read().energy),3.5);
   await p.reload({waitUntil:'load'});await require('./profile-fixture.cjs')(p);
   assert.equal(await p.evaluate(()=>LocalProfiles.read().energy),3.5);assert.equal(await p.locator('#energy-balance').innerText(),'3,5');
   await p.evaluate(()=>HubNavigation.open('tavern'));
   await p.evaluate(()=>{const ends=LocalProfiles.read().activeMission.endsAt,realNow=Date.now.bind(Date),offset=ends-realNow();Date.now=()=>realNow()+offset;});
   await p.getByRole('button',{name:'Zgłoś powrót',exact:true}).click();await p.locator('.mission-reward').waitFor({state:'visible'});
   await p.evaluate(()=>HubNavigation.open('tavern'));await p.locator('[data-npc=brand]').click();
   await p.locator('[data-choice-type=combat] [data-accept-choice]').click();await p.locator('.combat-dialog').waitFor({state:'visible'});
   assert.equal(await p.evaluate(()=>LocalProfiles.read().energy),1);
   await p.waitForFunction(()=>document.querySelector('.combat-status').textContent.includes('krótkim sztyletem'));
  }
  assert.deepEqual(errors,[]);console.log(`PASS ${width}px ${gender} ${name}: Lyrien selection, permanent save, weapon access and actual mission costs`);await p.close();
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
