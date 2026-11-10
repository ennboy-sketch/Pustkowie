'use strict';
(() => {
  const SELECTOR='.castle-viewport,.barracks-viewport,.golden-pony-viewport,.tavern-viewport,.alchemist-viewport,.forge-viewport,.market-viewport,.upstairs-viewport';
  let restoring=false,timer=0;
  function position(view){
    if(!view?.clientWidth||!view.firstElementChild?.clientWidth)return null;
    const scene=view.firstElementChild,scale=Number(view.dataset.zoomScale)||1;
    return {x:(view.scrollLeft+view.clientWidth/2)/(scene.clientWidth*scale),y:(view.scrollTop+view.clientHeight/2)/(scene.clientHeight*scale),scale};
  }
  function capture(){
    if(restoring||!document.body.classList.contains('playing')||!window.LocalProfiles?.active())return;
    const dialog=document.querySelector('#place-dialog'),root=document.querySelector('#place-content');
    const place=dialog.open?window.HubNavigation.place():null;
    try{window.LocalProfiles.saveView({world:window.HubNavigation.world(),worldView:position(document.querySelector('.world-viewport')),place,room:place==='barracks'?root.querySelector('.barracks-panel')?.dataset.barracksRoom||'training':place==='guild'?root.querySelector('.castle-panel')?.dataset.castleRoom||'entrance':null,placeView:place?position(root.querySelector(SELECTOR)):null});}
    catch{document.querySelector('#status').textContent='Nie udało się zapisać ostatniego miejsca. Sprawdź miejsce na zapis w przeglądarce.';}
  }
  function schedule(){clearTimeout(timer);timer=setTimeout(capture,400);}
  const frame=()=>new Promise(resolve=>requestAnimationFrame(resolve));
  async function restore(){
    const saved=window.LocalProfiles.cleanView(window.LocalProfiles.view());if(!saved){schedule();return;}
    restoring=true;
    try{
      const currentLevel=window.Progression.level(window.LocalProfiles.read());
      const world=saved.world==='hell-gates'&&currentLevel<110?(currentLevel>=30?'ubocze':'glade'):saved.world==='ubocze'&&currentLevel<30?'glade':saved.world;
      if(['glade','ubocze','hell-gates'].includes(world))window.HubNavigation.open('glade');
      if(world==='ubocze'||world==='hell-gates')window.HubNavigation.open('glade-path-3');
      if(world==='hell-gates')window.HubNavigation.open('ubocze-path');
      await frame();await frame();
      if(world===saved.world)window.SceneZoom.restore(document.querySelector('.world-viewport'),saved.worldView);
      if(saved.place&&world===saved.world){
        window.HubNavigation.open(saved.place);
        if(saved.place==='barracks'&&['armory','commander'].includes(saved.room))window.BarracksPanel.openRoom(saved.room);
        if(saved.place==='guild'&&['throne','school'].includes(saved.room))window.CastlePanel.openRoom(saved.room);
        await Promise.allSettled([...document.querySelectorAll('#place-content img')].map(i=>i.decode()));
        await frame();await frame();
        window.SceneZoom.restore(document.querySelector('#place-content '+SELECTOR.split(',').join(',#place-content ')),saved.placeView);
      }
    }catch{document.querySelector('#status').textContent='Nie udało się przywrócić widoku. Postać pozostaje zapisana.';}
    finally{restoring=false;schedule();}
  }
  document.addEventListener('scroll',schedule,{capture:true,passive:true});
  document.addEventListener('click',schedule);
  new MutationObserver(records=>{if(records.some(r=>r.type==='attributes'||r.target.closest?.('#place-content,#map-pins')))schedule();}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['open','data-barracks-room','data-castle-room','data-zoom-scale']});
  window.addEventListener('pagehide',capture);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)capture();});
  window.GameLocation={restore,flush(){clearTimeout(timer);capture();}};
})();
