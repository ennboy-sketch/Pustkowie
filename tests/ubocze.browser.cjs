const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
  const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  try{
    for(const [width,height] of [[1280,900],[390,844],[360,640]]){
      const p=await browser.newPage({viewport:{width,height},hasTouch:true}),errors=[];
      p.on('pageerror',e=>errors.push(e.message));
      await p.route('https://fonts.googleapis.com/**',r=>r.abort());
      await p.goto(process.argv[2]||'http://127.0.0.1:8020/',{waitUntil:'load'});
      await p.evaluate(()=>localStorage.setItem('pustkowie.hero.v2',JSON.stringify({version:2,name:'Test',classId:'warrior',gender:'female',level:30,xp:0,gold:100,shards:2,energy:80})));
      await p.reload({waitUntil:'load'});await require("./profile-fixture.cjs")(p);
      const view=p.locator('.world-viewport');
      await p.locator('#map-pins [data-place=glade]').scrollIntoViewIfNeeded();
      const castlePosition=await view.evaluate(e=>({left:e.scrollLeft,top:e.scrollTop}));
      await p.locator('#map-pins [data-place=glade]').click();
      await p.locator('[data-place=glade-path-3]').scrollIntoViewIfNeeded();
      const gladePosition=await view.evaluate(e=>({left:e.scrollLeft,top:e.scrollTop}));
      await p.locator('[data-place=glade-path-3]').click();
      await p.waitForFunction(()=>document.querySelector('#town-map').classList.contains('is-ubocze'));
      await p.evaluate(async()=>{const i=new Image();i.src='ubocze.webp';await i.decode();if(i.naturalWidth<1500)throw Error('Missing Ubocze panorama');});
      assert.equal(await p.locator('#settlement-title').innerText(),'Ubocze');
      assert.equal(await p.locator('#place-dialog').isVisible(),false);
      assert.equal(await p.locator('.pin-market').count(),0);
      assert.equal(await p.locator('.glade-path').count(),0);
      await p.locator('.ubocze-path img').evaluate(i=>i.decode());
      const tavern=p.locator('[data-place=ubocze-tavern]');
      const point=await tavern.evaluate(e=>{const r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;return{x,y,hit:e.contains(document.elementFromPoint(x,y))};});
      assert.equal(point.hit,true,'Tavern should be clickable immediately, including on narrow phones');
      await p.screenshot({path:`/tmp/ubocze-${width}-${height}.png`});
      await p.mouse.click(point.x,point.y);
      assert.equal(await p.locator('#place-title').innerText(),'Karczma „Pod Złotym Kucem”');
      assert.equal(await p.locator('.tavern-panel').count(),0,'The new inn must not open the castle tavern');
      await p.locator('#close-place').click();
      const r=await view.boundingBox();
      if(width<700){
        const cdp=await p.context().newCDPSession(p),before=await view.evaluate(e=>e.scrollLeft);
        await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:r.x+r.width*.8,y:r.y+r.height*.75}]});
        for(let i=1;i<=8;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:r.x+r.width*.8-i*18,y:r.y+r.height*.75}]});
        await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
        await p.waitForTimeout(200);
        assert.ok(await view.evaluate(e=>e.scrollLeft)>before,'Touch panning should move the map');
        const x=r.x+r.width/2,y=r.y+r.height*.5;
        await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:x-30,y},{x:x+30,y}]});
        for(let i=1;i<=5;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-30-i*8,y},{x:x+30+i*8,y}]});
        await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
        await p.waitForFunction(()=>Number(document.querySelector('.world-viewport').dataset.zoomScale)>1);
        await cdp.detach();
      }else{
        await view.hover();await p.mouse.wheel(0,-200);
        await p.waitForFunction(()=>Number(document.querySelector('.world-viewport').dataset.zoomScale)>1);
        const before=await view.evaluate(e=>e.scrollLeft);
        await p.mouse.move(r.x+r.width*.7,r.y+r.height*.7);await p.mouse.down();
        await p.mouse.move(r.x+r.width*.5,r.y+r.height*.7,{steps:10});await p.mouse.up();await p.waitForTimeout(150);
        assert.ok(await view.evaluate(e=>e.scrollLeft)>before,'Mouse dragging should move the map');
      }
      assert.equal(await p.locator('#place-dialog').isVisible(),false,'Dragging must not open a destination');
      await p.locator('[data-place=ubocze-path]').click();
      assert.equal(await p.locator('#place-title').innerText(),'Wrota Piekieł');
      await p.locator('#close-place').click();
      await p.locator('.ubocze-return').click();
      await p.waitForFunction(()=>document.querySelector('#town-map').classList.contains('is-glade'));
      const returned=await view.evaluate(e=>({left:e.scrollLeft,top:e.scrollTop}));
      assert.ok(Math.abs(returned.left-gladePosition.left)<=2&&Math.abs(returned.top-gladePosition.top)<=2,'Returning should restore the glade map position');
      await p.locator('.glade-return').click();
      assert.equal(await p.locator('#settlement-title').innerText(),'Zamek Czarnej Stali');
      const returnedCastle=await view.evaluate(e=>({left:e.scrollLeft,top:e.scrollTop}));
      assert.ok(Math.abs(returnedCastle.left-castlePosition.left)<=2&&Math.abs(returnedCastle.top-castlePosition.top)<=2,'Returning should restore the castle map position');
      await p.locator('#map-pins [data-place=glade]').click();
      await p.evaluate(()=>{const h=JSON.parse(localStorage.getItem('pustkowie.hero.v2'));h.level=29;localStorage.setItem('pustkowie.hero.v2',JSON.stringify(h));});
      await p.locator('[data-place=glade-path-3]').click();
      await p.locator('#place-dialog').waitFor({state:'visible'});
      assert.match(await p.locator('#place-content').innerText(),/Wejście jest zablokowane/);
      assert.equal(await p.locator('#town-map').evaluate(e=>e.classList.contains('is-ubocze')),false);
      const h=await p.evaluate(()=>JSON.parse(localStorage.getItem('pustkowie.hero.v2')));
      assert.equal(h.gold,100);assert.equal(h.shards,2);assert.equal(h.energy,80);assert.deepEqual(errors,[]);
      console.log(`PASS ${width}x${height}: Ubocze, distinct inn, path, native pan/zoom, return positions and fresh level-30 gate`);
      await p.close();
    }
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
