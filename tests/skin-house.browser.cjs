const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{for(const [width,height] of [[1280,900],[390,844],[360,640]]){
  const p=await browser.newPage({viewport:{width,height},hasTouch:true}),errors=[];
  p.on('pageerror',e=>errors.push(e.message));await p.route('https://fonts.googleapis.com/**',r=>r.abort());
  await p.goto('http://127.0.0.1:8020/');
  await p.evaluate(()=>localStorage.setItem('pustkowie.hero.v2',JSON.stringify({version:2,name:'Test',classId:'warrior',gender:'female',level:1,xp:0,gold:200,shards:7,energy:80})));
  await p.reload({waitUntil:'load'});await require('./profile-fixture.cjs')(p);
  await p.evaluate(async()=>{const i=new Image();i.src='town-skins-cottage.webp';await i.decode();if(i.naturalWidth!==1536||i.naturalHeight!==1024)throw Error('Wrong castle map dimensions');});
  assert.match(await p.locator('#town-map').evaluate(e=>getComputedStyle(e).backgroundImage),/town-skins-cottage/);
  const pin=p.locator('#map-pins [data-place=skin-house]');await pin.scrollIntoViewIfNeeded();
  assert.equal(await pin.evaluate(e=>{const r=e.getBoundingClientRect();return e.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}),true);
  const mapPosition=await p.locator('.world-viewport').evaluate(v=>({x:v.scrollLeft,y:v.scrollTop}));
  await p.screenshot({path:`/tmp/skin-house-map-${width}-${height}.png`});
  await pin.click();await p.locator('.skin-house-art').evaluate(i=>i.decode());
  assert.equal(await p.locator('#place-title').innerText(),'Dom Tysiąca Twarzy');
  const view=p.locator('.skin-house-viewport');await p.waitForFunction(()=>document.querySelector('.skin-house-viewport').dataset.zoomScale==='1');
  const merchant=p.getByRole('button',{name:'Porozmawiaj ze sprzedawczynią skórek',exact:true});
  const visible=await merchant.evaluate(e=>{const r=e.getBoundingClientRect(),v=e.closest('.skin-house-viewport').getBoundingClientRect();return r.width>=44&&r.height>=44&&r.left>=v.left&&r.right<=v.right&&r.bottom<=v.bottom;});
  assert.equal(visible,true,'Merchant must be visible and clickable immediately');
  await p.screenshot({path:`/tmp/skin-house-room-${width}-${height}.png`});
  if(width<700)await merchant.tap();else await merchant.click();
  await p.locator('.skin-house-dialog').waitFor({state:'visible'});
  assert.match(await p.locator('.skin-house-coming').innerText(),/skórki postaci za odłamki/);
  assert.equal(await p.locator('.skin-house-dialog button').count(),1);
  await p.locator('[data-close-skin-house-merchant]').click();
  const box=await view.boundingBox(),before=await view.evaluate(v=>v.scrollLeft);
  if(width<700){
   const c=await p.context().newCDPSession(p);
   await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width*.8,y:box.y+box.height*.5}]});
   for(let i=1;i<=8;i++)await c.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:box.x+box.width*.8-i*14,y:box.y+box.height*.5}]});
   await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await p.waitForTimeout(150);
   assert.ok(await view.evaluate(v=>v.scrollLeft)>before);
   const x=box.x+box.width/2,y=box.y+box.height*.4;
   await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:x-25,y},{x:x+25,y}]});
   for(let i=1;i<=5;i++)await c.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-25-i*7,y},{x:x+25+i*7,y}]});
   await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await c.detach();
  }else{
   await view.hover();await p.mouse.wheel(0,-200);await p.waitForFunction(()=>Number(document.querySelector('.skin-house-viewport').dataset.zoomScale)>1);
   await p.mouse.move(box.x+box.width*.7,box.y+box.height*.5);await p.mouse.down();await p.mouse.move(box.x+box.width*.5,box.y+box.height*.5,{steps:12});await p.mouse.up();await p.waitForTimeout(100);
   assert.ok(await view.evaluate(v=>v.scrollLeft)>before);
  }
  assert.equal(await p.locator('.skin-house-dialog').isVisible(),false,'Dragging should not open conversation');
  await view.focus();await p.keyboard.press('+');await p.waitForTimeout(150);
  const saved=await p.evaluate(()=>{GameLocation.flush();return LocalProfiles.view();});assert.equal(saved.place,'skin-house');assert.ok(saved.placeView.scale>1);
  await p.reload({waitUntil:'load'});assert.match(await p.locator('.profile-card').innerText(),/Dom Tysiąca Twarzy/);
  await Promise.all([p.waitForNavigation({waitUntil:'load'}),p.locator('[data-play-profile=legacy]').click()]);await p.locator('#ready').waitFor({state:'visible'});await p.evaluate(()=>GameLocation.ready);
  assert.equal(await p.locator('#place-title').innerText(),'Dom Tysiąca Twarzy');
  const restored=await view.evaluate(v=>({scale:Number(v.dataset.zoomScale),x:(v.scrollLeft+v.clientWidth/2)/(v.firstElementChild.clientWidth*Number(v.dataset.zoomScale))}));
  assert.ok(Math.abs(restored.scale-saved.placeView.scale)<.01);assert.ok(Math.abs(restored.x-saved.placeView.x)<.02);
  const close=await p.locator('#close-place').boundingBox();assert.ok(close.x>width*.6&&close.y<height*.25);
  await p.locator('#close-place').click();assert.equal(await p.locator('#settlement-title').innerText(),'Zamek Czarnej Stali');
  const returned=await p.locator('.world-viewport').evaluate(v=>({x:v.scrollLeft,y:v.scrollTop}));assert.ok(Math.abs(returned.x-mapPosition.x)<=2&&Math.abs(returned.y-mapPosition.y)<=2);
  await p.locator('#map-pins [data-place=market]').click();assert.equal(await p.locator('.market-panel').count(),1);await p.locator('#close-place').click();
  if(width<700)await p.locator('#menu-toggle').click();await p.locator('#hub-navigation [data-place=skin-house]').click();
  await p.locator('.skin-house-art').evaluate(i=>i.decode());await merchant.click();await p.keyboard.press('Escape');assert.equal(await p.locator('.skin-house-dialog').isVisible(),false);await p.locator('#close-place').click();
  const h=await p.evaluate(()=>LocalProfiles.read());assert.equal(h.gold,200);assert.equal(h.shards,7);assert.equal(h.energy,80);assert.equal(h.classId,'warrior');assert.equal(h.gender,'female');assert.equal(h.skin,undefined);
  assert.deepEqual(errors,[]);console.log(`PASS ${width}x${height}: cottage entrance, merchant, native pan/zoom, profile resume, X, market and unchanged resources`);await p.close();
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
