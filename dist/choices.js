'use strict';
(() => {
  const TIERS={easy:{name:'Szlak wędrowca',label:'Łatwiejsza misja',cost:3,description:'Zwiad czasowy z nagrodą za powrót.'},hard:{name:'Próba śmiałka',label:'Trudniejsza misja',cost:5,description:'Walka z potworem dopasowanym do poziomu postaci.'}};
  function random(max){const a=new Uint32Array(1),limit=4294967296-4294967296%max;do{crypto.getRandomValues(a);}while(a[0]>=limit);return a[0]%max;}
  const OFFERS_VERSION=2;
  function makeOffer(hero,tier,wantCombat){
    const ids=Object.keys(window.BrandMissions.SCENES);
    const combatIds=ids.filter(id=>window.BrandCombat.availableOpponents(hero,id,tier).length>0);
    const combat=wantCombat&&combatIds.length>0,locations=combat?combatIds:ids;
    const sceneId=locations[random(locations.length)];
    const pool=combat?window.BrandCombat.availableOpponents(hero,sceneId,tier):[];
    return {id:crypto.randomUUID(),tier,type:wantCombat?'combat':'scout',sceneId,enemyId:combat?pool[random(pool.length)].id:null};
  }
  function currentOffers(hero){
    const offers=hero.brandOffers;
    return hero.brandOffersVersion===OFFERS_VERSION&&hero.brandOffersLevel===window.Progression.level(hero)&&Array.isArray(offers)&&offers.length===2&&offers[0]?.tier==='easy'&&offers[0]?.type==='scout'&&offers[0]?.enemyId===null&&offers[1]?.tier==='hard'&&offers[1]?.type==='combat'&&offers.every(offer=>
      typeof offer?.id==='string'&&Object.hasOwn(window.BrandMissions.SCENES,offer.sceneId)&&(offer.type==='scout'||window.BrandCombat.availableOpponents(hero,offer.sceneId,'hard').some(enemy=>enemy.id===offer.enemyId)||offer.enemyId===null&&!Object.keys(window.BrandMissions.SCENES).some(id=>window.BrandCombat.availableOpponents(hero,id,'hard').length)));
  }
  function prepare(hero){
    if(hero.activeMission||hero.activeCombat)return hero;
    if(currentOffers(hero))return hero;
    const offers=[makeOffer(hero,'easy',false),makeOffer(hero,'hard',true)];
    return {...hero,brandOffers:offers,brandOffersVersion:OFFERS_VERSION,brandOffersLevel:window.Progression.level(hero),brandTimedOffers:null,brandTimedOffersLevel:null};
  }
  function consumeTimed(next){return next.brandTimedOffers?{...next,brandTimedOffers:null,brandTimedOffersLevel:null}:next;}
  function accept(hero,id){
    if(hero.activeMission||hero.activeCombat)throw new Error('Najpierw zakończ obecną misję.');
    const offer=hero.brandOffers?.find(o=>o.id===id),tier=offer&&TIERS[offer.tier];
    if(!tier)throw new Error('Oferta została już wykorzystana. Otwórz panel ponownie.');
    if(offer.type==='scout')return consumeTimed(window.BrandMissions.start(hero,Date.now(),()=>offer.sceneId,window.BrandMissions.rollReward,{cost:tier.cost,difficulty:offer.tier}));
    if(offer.type!=='combat')throw new Error('Nieprawidłowy rodzaj misji.');
    const enemy=window.BrandCombat.availableOpponents(hero,offer.sceneId,offer.tier).find(m=>m.id===offer.enemyId);
    if(!enemy)throw new Error('Nieprawidłowy przeciwnik.');
    return consumeTimed(window.BrandCombat.start({...hero,combatOffer:{sceneId:offer.sceneId,enemyId:offer.enemyId}},Date.now(),{cost:tier.cost,difficulty:offer.tier}));
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
      const offers=hero.brandOffers||[];
      list.innerHTML=`<p class="brand-matchmaking-note">${range}${hasCombat?'':' Brak przeciwników w tym przedziale.'}</p>`+offers.map(o=>{
        const t=TIERS[o.tier],scene=window.BrandMissions.SCENES[o.sceneId],enemy=o.type==='combat'?window.BrandCombat.opponents(o.sceneId).find(m=>m.id===o.enemyId):null;
        const isCombat=o.type==='combat',duration=window.BrandMissions.durationFor(window.Progression.level(hero),o.tier,hero);
        const cost=window.EnergyCycle.cost(hero,t.cost),costLabel=window.EnergyCycle.format(cost);
        return `<article class="brand-choice-card" data-choice-type="${o.type}"><div class="choice-art" style="background-image:url('${scene.image}')"><span class="rpg-icon icon-${isCombat?'arena':'journal'}" aria-hidden="true"></span><span>${t.label}</span></div><div class="choice-body"><h3>${t.name}</h3><p class="choice-location">${scene.short}</p><p class="choice-kind">${isCombat?(enemy?`Walka · ${enemy.name} · Poziom ${enemy.level}`:'Walka z potworem · Brak przeciwników w przedziale poziomów'):`Zwiad czasowy · ${duration??'—'} min`}</p><p>${t.description}</p>${!isCombat&&duration&&window.Progression.level(hero)>=8?`<p class="choice-location">${window.BrandMissions.shardChance(window.Progression.level(hero))}% szansy na 1 odłamek</p>`:''}${!isCombat&&level>=26&&duration?'<p class="choice-location">Nagroda: 500 złota · 150000 EXP</p>':''}${enemy?.reward?`<p class="choice-location">Nagroda: ${enemy.reward.gold} złota · ${enemy.reward.xp} EXP</p>`:''}<button type="button" class="primary" data-accept-choice="${o.id}" ${busy||window.EnergyCycle.info(hero).energy<cost||(isCombat?!enemy:!duration)?'disabled':''}>Podejmij misję · ${costLabel} energii</button></div></article>`;
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
  window.BrandChoices={prepare,accept,mount,TIERS};
})();
