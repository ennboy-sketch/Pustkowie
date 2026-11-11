const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{for(const [width,height] of [[1280,900],[390,844],[360,640]]){
  const context=await browser.newContext({viewport:{width,height}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8020/bestiary-31-50.html');
  assert.equal(await page.locator('.monster').count(),20);assert.equal(await page.locator('.region').count(),5);
  assert.match(await page.locator('.notice').innerText(),/nie występują jeszcze/);
  const assets=await page.evaluate(async()=>{const b=FrontierBestiary,paths=[...new Set(b.MONSTERS.concat(b.LOCATIONS).map(x=>x.image))];return Promise.all(paths.map(async path=>{const i=new Image();i.src=path;await i.decode();return{path,width:i.naturalWidth,height:i.naturalHeight};}));});assert.equal(assets.length,6);assert.ok(assets.every(x=>x.width>=1024&&x.height>=1024));
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.locator('#player-level').fill('50');assert.match(await page.locator('#balance-note').innerText(),/15\D?340\D?000/);
  assert.match(await page.locator('[data-monster=foregate-sentinel] [data-xp]').innerText(),/2\D?761\D?200 EXP/);
  assert.match(await page.locator('[data-monster=ember-wolf] [data-xp]').innerText(),/435\D?780 EXP/);
  assert.match(await page.locator('[data-monster=foregate-sentinel] [data-share]').innerText(),/^18%/);
  await page.locator('#player-level').fill('31');assert.match(await page.locator('[data-monster=foregate-sentinel] [data-xp]').innerText(),/435\D?780 EXP/);
  await page.locator('#player-level').fill('');assert.match(await page.locator('#balance-note').innerText(),/Wybierz poziom/);
  assert.equal(await page.evaluate(()=>localStorage.length),0);assert.deepEqual(errors,[]);
  fs.mkdirSync('outputs',{recursive:true});await page.screenshot({path:`outputs/frontier-bestiary-${width}.png`});await page.locator('#hell-approach').scrollIntoViewIfNeeded();await page.screenshot({path:`outputs/frontier-hell-approach-${width}.png`});
  console.log(`PASS ${width}x${height}: 20 portraits, 5 locations, all images decode, level-based reward previews, no overflow or saved-state writes`);await context.close();
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
