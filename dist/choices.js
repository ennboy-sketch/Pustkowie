'use strict';
(() => {
  const TIERS={easy:{name:'Szlak wędrowca',label:'Łatwiejsza misja',cost:3,description:'Spokojniejszy zwiad lub starcie ze słabszym przeciwnikiem.'},hard:{name:'Próba śmiałka',label:'Trudniejsza misja',cost:5,description:'Zwiad w nieznane lub starcie z silniejszym przeciwnikiem.'}};
  function random(max){const a=new Uint32Array(1),limit=4294967296-4294967296%max;do{crypto.getRandomValues(a);}while(a[0]>=limit);return a[0]%max;}
  function prepare(hero){
    if(hero.activeMission||hero.activeCombat||hero.brandOffers)return hero;
    const ids=Object.keys(window.BrandMissions.SCENES),level=window.Progression.level(hero);
    const offers=Object.keys(TIERS).map(tier=>{
      const sceneId=ids[random(ids.length)],combat=level<=5&&random(2)===1;
      const pool=window.BrandCombat.opponents(sceneId).filter(m=>tier==='easy'?m.level<=2:m.level>=3);
      return {id:crypto.randomUUID(),tier,type:combat?'combat':'scout',sceneId,enemyId:combat?pool[random(pool.length)].id:null};
    });
    return {...hero,brandOffers:offers};
  }
  function accept(hero,id){
    if(hero.activeMission||hero.activeCombat)throw new Error('Najpierw zakończ obecną misję.');
    const offer=hero.brandOffers?.find(o=>o.id===id),tier=offer&&TIERS[offer.tier];
    if(!tier)throw new Error('Oferta została już wykorzystana. Otwórz panel ponownie.');
    if(offer.type==='scout')return window.BrandMissions.start(hero,Date.now(),()=>offer.sceneId,window.BrandMissions.rollReward,{cost:tier.cost,difficulty:offer.tier});
    if(offer.type!=='combat')throw new Error('Nieprawidłowy rodzaj misji.');
    const enemy=window.BrandCombat.opponents(offer.sceneId).find(m=>m.id===offer.enemyId);
    if(!enemy||(offer.tier==='easy'?enemy.level>2:enemy.level<3))throw new Error('Nieprawidłowy przeciwnik.');
    return window.BrandCombat.start({...hero,combatOffer:{sceneId:offer.sceneId,enemyId:offer.enemyId}},Date.now(),{cost:tier.cost,difficulty:offer.tier});
  }
  function mount(root,state){
    root.innerHTML='<div class="brand-choice-list"></div><p class="brand-choice-message" role="status" aria-live="polite"></p><div class="choice-combat" hidden></div>';
    const list=root.querySelector('.brand-choice-list'),message=root.querySelector('.brand-choice-message');
    const stopCombat=window.BrandCombat.mount(root.querySelector('.choice-combat'),state);
    let disposed=false,busy=false;
    const locked=fn=>navigator.locks?navigator.locks.request('pustkowie-hero-v2',fn):fn();
    function render(hero){
      if(disposed)return;
      if(hero.activeCombat){list.innerHTML='<button type="button" class="primary" data-resume-combat>Wróć do walki</button>';return;}
      if(hero.activeMission){list.textContent='Zwiad jest w toku.';return;}
      list.innerHTML=(hero.brandOffers||[]).map(o=>{
        const t=TIERS[o.tier],scene=window.BrandMissions.SCENES[o.sceneId],enemy=o.type==='combat'?window.BrandCombat.opponents(o.sceneId).find(m=>m.id===o.enemyId):null;
        const duration=window.BrandMissions.durationFor(window.Progression.level(hero),o.tier);
        return `<article class="brand-choice-card"><div class="choice-art" style="background-image:url('${scene.image}')"><span class="rpg-icon icon-${enemy?'arena':'journal'}" aria-hidden="true"></span><span>${t.label}</span></div><div class="choice-body"><h3>${t.name}</h3><p class="choice-location">${scene.short}</p><p class="choice-kind">${enemy?`Walka · ${enemy.name} · Poziom ${enemy.level}`:`Zwiad czasowy · ${duration??'—'} min`}</p><p>${t.description}</p><button type="button" class="primary" data-accept-choice="${o.id}" ${busy||window.EnergyCycle.info(hero).energy<t.cost||(!enemy&&!duration)?'disabled':''}>Podejmij misję · ${t.cost} energii</button></div></article>`;
      }).join('');
    }
    async function refresh(){
      try{const hero=await locked(()=>{const h=state.read(),next=prepare(h);return h===next?h:state.update(latest=>prepare(latest));});render(hero);}
      catch(e){if(!disposed)message.textContent='Nie udało się odczytać lub zapisać ofert. Spróbuj ponownie.';}
    }
    async function click(e){
      if(e.target.closest('[data-resume-combat]')){void stopCombat.open();return;}
      const button=e.target.closest('[data-accept-choice]');if(!button||busy)return;
      busy=true;message.textContent='';root.querySelectorAll('[data-accept-choice]').forEach(b=>b.disabled=true);
      try{
        const hero=await locked(()=>state.update(current=>accept(current,button.dataset.acceptChoice)));
        if(disposed)return;
        if(hero.activeMission)state.onStarted?.();else{render(hero);await stopCombat.open();}
      }catch(error){if(!disposed){message.textContent=error.name==='QuotaExceededError'||error.name==='SecurityError'?'Nie udało się zapisać misji. Energia nie została pobrana.':error.message;}}
      finally{busy=false;if(!disposed)render(state.read());}
    }
    root.addEventListener('click',click);void refresh();
    function storage(e){if(e.key==='pustkowie.hero.v2'&&!busy)void refresh();}
    window.addEventListener('storage',storage);
    return ()=>{disposed=true;stopCombat();root.removeEventListener('click',click);window.removeEventListener('storage',storage);};
  }
  window.BrandChoices={prepare,accept,mount,TIERS};
})();
