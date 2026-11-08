const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const url=process.argv[2]||'http://127.0.0.1:8000/';
(async()=>{
  const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  try{for(const width of [1280,390]){
    const page=await browser.newPage({viewport:{width,height:1100}}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.route('https://fonts.googleapis.com/**',r=>r.abort());
    await page.goto(url,{waitUntil:'load'});
    await page.evaluate(()=>localStorage.setItem('pustkowie.hero.v2',JSON.stringify({version:2,name:'Import',classId:'warrior',gender:'female',level:5,statAllocations:{endurance:17},gold:25,xp:0,energy:100,nextEnergyResetAt:Date.now()+86400000})));
    await page.reload({waitUntil:'load'});await require("./profile-fixture.cjs")(page);
    if(width===390)await page.locator('#menu-toggle').click();
    await page.locator('#hub-navigation [data-place="tavern"]').click();
    await page.locator('[data-npc="tauriel"]').click();
    await page.locator('[data-tauriel-action="accept"]').click();
    const rewards=[{gold:50,xp:1200},{gold:100,xp:1500},{gold:50,xp:1000}];
    let gold=25,xp=0;
    for(let i=0;i<3;i++){
      assert.match(await page.locator('.tauriel-bandits article').nth(i).innerText(),new RegExp(`${rewards[i].gold} złota · ${rewards[i].xp} EXP`));
      await page.locator('[data-tauriel-action="fight"]').click();
      await page.locator('.combat-dialog').waitFor({state:'visible'});
      const started=await page.evaluate(()=>JSON.parse(localStorage.getItem('pustkowie.hero.v2')).activeCombat);
      assert.deepEqual(started.reward,rewards[i]);
      await page.getByRole('button',{name:'Przewiń walkę',exact:true}).click();
      await page.waitForFunction(()=>!JSON.parse(localStorage.getItem('pustkowie.hero.v2')).activeCombat);
      const done=await page.evaluate(()=>JSON.parse(localStorage.getItem('pustkowie.hero.v2')));
      gold+=rewards[i].gold;xp+=rewards[i].xp;
      assert.equal(done.lastTaurielBattle.won,true);assert.equal(done.gold,gold);assert.equal(done.xp,xp);
      assert.equal(done.energy,100);assert.equal(done.taurielQuest.defeated.length,i+1);
      if(i<2)assert.match(await page.locator('.tauriel-quest-body').innerText(),new RegExp(`Ostatnia wygrana: \\+${rewards[i].gold} złota · \\+${rewards[i].xp} EXP`));
    }
    assert.equal(await page.locator('[data-npc=teo]').isVisible(),true);
    assert.equal(await page.locator('[data-npc=tauriel]').isVisible(),false);
    assert.deepEqual(errors,[]);console.log(`PASS ${width}px: all three Tauriel wins, rewards in UI and saved gold/EXP`);
    await page.close();
  }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
