const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});try{for(const width of [1280,390]){const p=await b.newPage({viewport:{width,height:850}});await p.route('https://fonts.googleapis.com/**',r=>r.abort());await p.goto(process.argv[2]||'http://127.0.0.1:8020/',{waitUntil:'load'});
for(let i=0;i<7;i++){
 const expected=await p.evaluate(i=>{FateWheel.cancel();document.querySelector('#wheel-test')?.remove();let hero={version:2,name:'Test',classId:'warrior',gender:'female',level:5,xp:0,gold:1000,shards:10,energy:50,nextEnergyResetAt:Date.now()+86400000};window.wheelUpdates=0;crypto.getRandomValues=a=>{a.fill(i);return a;};const root=document.createElement('section');root.id='wheel-test';root.innerHTML=FateWheel.markup(hero);document.body.prepend(root);FateWheel.mount(root,{read:()=>hero,update:fn=>{wheelUpdates++;hero=fn(hero);return hero;}});return FateWheel.REWARDS[i];},i);
 await p.locator('#wheel-test [data-spin-currency="gold"]').click();
 await p.waitForFunction(()=>document.querySelector('#wheel-test .wheel-disc').getAnimations().length>0);
 assert.equal(await p.locator('.wheel-win-dialog').isVisible(),false);
 await p.evaluate(()=>document.querySelector('#wheel-test .wheel-disc').getAnimations()[0].finish());
 const dialog=p.locator('.wheel-win-dialog');await dialog.waitFor({state:'visible'});
 assert.equal(await dialog.locator('h3').innerText(),expected.name);
 const icon=dialog.locator('.wheel-win-icon');assert.equal(await icon.locator(expected.image?'img':'.rpg-icon').count(),1);
 if(expected.image)await icon.locator('img').evaluate(img=>img.decode());
 const box=await dialog.boundingBox();assert.ok(box.width<=300&&box.x>=0&&box.x+box.width<=width);
 await dialog.getByRole('button',{name:'Zamknij',exact:true}).click();assert.equal(await dialog.isVisible(),false);assert.equal(await p.evaluate(()=>wheelUpdates),1);
 console.log(`PASS ${width}px ${expected.id}: only after animation, correct icon/name, close without extra payout`);
}
 await p.close();}}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1)});
