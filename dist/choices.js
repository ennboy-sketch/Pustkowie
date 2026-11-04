'use strict';
(() => {
  const TIERS={easy:{name:'Szlak wędrowca',label:'Łatwiejsza misja',cost:3,description:'Spokojniejszy zwiad lub starcie ze słabszym przeciwnikiem.'},hard:{name:'Próba śmiałka',label:'Trudniejsza misja',cost:5,description:'Zwiad w nieznane lub starcie z silniejszym przeciwnikiem.'}};
  function random(max){const a=new Uint32Array(1),limit=4294967296-4294967296%max;do{crypto.getRandomValues(a);}while(a[0]>=limit);return a[0]%max;}
  const OFFERS_VERSION=1,COMBAT_CHANCE=80;
  function makeOffer(hero,tier,wantCombat){
    const ids=Object.keys(window.BrandMissions.SCENES);
    const combatIds=ids.filter(id=>window.BrandCombat.availableOpponents(hero,id,tier).length>0);
    const combat=wantCombat&&combatIds.length>0,locations=combat?combatIds:ids;
    const sceneId=locations[random(locations.length)];
    const pool=combat?window.BrandCombat.availableOpponents(hero,sceneId,tier):[];
    return {id:crypto.randomUUID(),tier,type:combat?'combat':'scout',sceneId,enemyId:combat?pool[random(pool.length)].id:null};
  }
  function currentOffers(hero){
    const offers=hero.brandOffers;
    return hero.brandOffersVersion===OFFERS_VERSION&&hero.brandOffersLevel===window.Progression.level(hero)&&Array.isArray(offers)&&offers.length===2&&offers[0]?.tier==='easy'&&offers[1]?.tier==='hard'&&offers.every(offer=>
      typeof offer?.id==='string'&&Object.hasOwn(window.BrandMissions.SCENES,offer.sceneId)&&(offer.type==='scout'||offer.type==='combat'&&window.BrandCombat.availableOpponents(hero,offer.sceneId,offer.tier).some(enemy=>enemy.id===offer.enemyId)))&&(offers.some(offer=>offer.type==='combat')||!Object.keys(window.BrandMissions.SCENES).some(id=>window.BrandCombat.availableOpponents(hero,id).length));
  }
  function prepare(hero){
    if(hero.activeMission||hero.activeCombat||currentOffers(hero))return hero;
    const offers=Object.keys(TIERS).map(tier=>makeOffer(hero,tier,random(100)<COMBAT_CHANCE));
    if(offers.every(offer=>offer.type==='scout')&&Object.keys(window.BrandMissions.SCENES).some(id=>window.BrandCombat.availableOpponents(hero,id,'hard').length))offers[1]=makeOffer(hero,'hard',true);
    return {...hero,brandOffers:offers,brandOffersVersion:OFFERS_VERSION,brandOffersLevel:window.Progression.level(hero)};
  }
  function accept(hero,id){
    if(hero.activeMission||hero.activeCombat)throw new Error('Najpierw zakończ obecną misję.');
    const offer=hero.brandOffers?.find(o=>o.id===id),tier=offer&&TIERS[offer.tier];
    if(!tier)throw new Error('Oferta została już wykorzystana. Otwórz panel ponownie.');
    if(offer.type==='scout')return window.BrandMissions.start(hero,Date.now(),()=>offer.sceneId,window.BrandMissions.rollReward,{cost:tier.cost,difficulty:offer.tier});
    if(offer.type!=='combat')throw new Error('Nieprawidłowy rodzaj misji.');
    const enemy=window.BrandCombat.availableOpponents(hero,offer.sceneId,offer.tier).find(m=>m.id===offer.enemyId);
    if(!enemy)throw new Error('Nieprawidłowy przeciwnik.');
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
      const level=window.Progression.level(hero),hasCombat=Object.keys(window.BrandMissions.SCENES).some(id=>window.BrandCombat.availableOpponents(hero,id).length);
      const range=`Potwory: poziomy ${Math.max(1,level-3)}–${level+3}.`;
      list.innerHTML=`<p class="brand-matchmaking-note">${range}${hasCombat?'':' Brak przeciwników w tym przedziale.'}</p>`+(hero.brandOffers||[]).map(o=>{
        const t=TIERS[o.tier],scene=window.BrandMissions.SCENES[o.sceneId],enemy=o.type==='combat'?window.BrandCombat.opponents(o.sceneId).find(m=>m.id===o.enemyId):null;
        const duration=window.BrandMissions.durationFor(window.Progression.level(hero),o.tier);
        return `<article class="brand-choice-card"><div class="choice-art" style="background-image:url('${scene.image}')"><span class="rpg-icon icon-${enemy?'arena':'journal'}" aria-hidden="true"></span><span>${t.label}</span></div><div class="choice-body"><h3>${t.name}</h3><p class="choice-location">${scene.short}</p><p class="choice-kind">${enemy?`Walka · ${enemy.name} · Poziom ${enemy.level}`:`Zwiad czasowy · ${duration??'—'} min`}</p><p>${t.description}</p>${!enemy&&duration&&window.Progression.level(hero)>=8?`<p class="choice-location">${window.BrandMissions.shardChance(window.Progression.level(hero))}% szansy na 1 odłamek</p>`:''}${enemy?.reward?`<p class="choice-location">Nagroda: ${enemy.reward.gold} złota · ${enemy.reward.xp} EXP</p>`:''}<button type="button" class="primary" data-accept-choice="${o.id}" ${busy||window.EnergyCycle.info(hero).energy<t.cost||(!enemy&&!duration)?'disabled':''}>Podejmij misję · ${t.cost} energii</button></div></article>`;
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
      finally{busy=false;if(!disposed)await refresh();}
    }
    root.addEventListener('click',click);void refresh();
    function storage(e){if(e.key==='pustkowie.hero.v2'&&!busy)void refresh();}
    window.addEventListener('storage',storage);
    return ()=>{disposed=true;stopCombat();root.removeEventListener('click',click);window.removeEventListener('storage',storage);};
  }
  window.BrandChoices={prepare,accept,mount,TIERS,COMBAT_CHANCE};
})();
