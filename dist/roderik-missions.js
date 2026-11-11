'use strict';
(() => {
  const TIERS=Object.freeze({easy:Object.freeze({cost:10,enabled:false}),hard:Object.freeze({cost:15,enabled:true})});
  const level=hero=>window.Progression.level(hero);
  function available(hero){return level(hero)>=30?window.FrontierBestiary.MONSTERS.filter(enemy=>Math.abs(enemy.level-level(hero))<=3):[];}
  function validOffer(hero){const offer=hero.roderikOffer;return offer?.version===1&&offer.playerLevel===level(hero)&&typeof offer.id==='string'&&available(hero).some(enemy=>enemy.id===offer.enemyId);}
  function prepare(hero){
    if(hero.activeMission||hero.activeCombat||validOffer(hero))return hero;
    const pool=available(hero);if(!pool.length)return hero;
    const value=new Uint32Array(1),limit=4294967296-4294967296%pool.length;
    do{crypto.getRandomValues(value);}while(value[0]>=limit);
    const enemy=pool[value[0]%pool.length];
    return {...hero,roderikOffer:{version:1,id:crypto.randomUUID(),enemyId:enemy.id,playerLevel:level(hero)}};
  }
  function start(hero,id,now=Date.now()){
    if(hero.activeMission||hero.activeCombat)throw Error('Najpierw zakończ obecną misję.');
    if(!validOffer(hero)||hero.roderikOffer.id!==id)throw Error('Zlecenie zmieniło się. Otwórz panel ponownie.');
    const enemy=window.FrontierBestiary.get(hero.roderikOffer.enemyId);
    hero=window.EnergyCycle.apply(hero,now);
    const cost=window.EnergyCycle.cost(hero,TIERS.hard.cost);
    if(hero.energy<cost)throw Error(`Potrzebujesz ${window.EnergyCycle.format(cost)} energii.`);
    return {...hero,energy:hero.energy-cost,roderikOffer:null,activeCombat:{id:crypto.randomUUID(),source:'roderik',difficulty:'hard',cost,sceneId:enemy.sceneId,playerLevel:level(hero),rewardVersion:1,reward:window.FrontierBestiary.rewardFor(enemy.id,level(hero)),battle:window.BrandCombat.createBattle(window.BrandCombat.profile(hero),enemy,'hero'),nextHitAt:now+1100}};
  }
  function resolve(hero,id){
    const fight=hero.activeCombat;
    if(fight?.source!=='roderik'||fight.id!==id||!fight.battle.winner)throw Error('Walka trwa lub została już rozliczona.');
    const won=fight.battle.winner==='hero',reward=won?{...fight.reward}:{gold:0,xp:0};
    const next=window.Progression.award(hero,reward.xp),gold=(hero.gold??25)+reward.gold;
    if(!Number.isSafeInteger(gold))throw Error('Nieprawidłowa ilość złota.');
    return {...next,gold,activeCombat:null,lastRoderikCombat:{id,sceneId:fight.sceneId,enemyId:fight.battle.enemy.id,won,reward,levelsGained:level(next)-level(hero)}};
  }
  function scene(fight){const place=window.FrontierBestiary.LOCATIONS.find(p=>p.id===fight.sceneId);if(!place)throw Error('Nieznany teren zlecenia.');return {...place,short:place.name};}
  function atlasStyle(art){const cols=art.columns,rows=art.rows;return `background-image:url('${art.image}');background-size:${cols*100}% ${rows*100}%;background-position:${art.tile%cols/(cols-1)*100}% ${Math.floor(art.tile/cols)/(rows-1)*100}%`;}
  function mount(root,state){
    root.innerHTML='<div class="roderik-mission-list"></div><p class="roderik-message" role="status" aria-live="polite"></p><div class="roderik-combat" hidden></div>';
    const list=root.querySelector('.roderik-mission-list'),message=root.querySelector('.roderik-message');
    let disposed=false,busy=false;
    const locked=fn=>navigator.locks?navigator.locks.request('pustkowie-hero-v2',fn):fn();
    const combat=window.BrandCombat.mount(root.querySelector('.roderik-combat'),{...state,prepareCombat:hero=>hero,onQuestResolved:hero=>{if(disposed)return;const last=hero.lastRoderikCombat;message.textContent=last.won?`Zwycięstwo! Nagroda: ${last.reward.gold} złota · ${last.reward.xp} EXP${last.levelsGained?` · Awans o ${last.levelsGained} poziom(y)`:''}.`:'Porażka. Nie otrzymujesz nagrody. Energia została zużyta przy rozpoczęciu.';void refresh();}});
    function render(hero){
      if(disposed)return;
      const energy=window.EnergyCycle.info(hero).energy,cost=window.EnergyCycle.cost(hero,TIERS.hard.cost),easyCost=window.EnergyCycle.cost(hero,TIERS.easy.cost);
      const active=hero.activeCombat?.source==='roderik',blocked=!!hero.activeMission||!!hero.activeCombat;
      const enemy=validOffer(hero)?window.FrontierBestiary.get(hero.roderikOffer.enemyId):null;
      const place=enemy&&scene({sceneId:enemy.sceneId}),reward=enemy&&window.FrontierBestiary.rewardFor(enemy.id,level(hero));
      list.innerHTML=`<h4>Zlecenia Roderika</h4><p>Potwory z pogranicza · poziomy 31–50 · dobór ±3 poziomy. Twoja energia: ${window.EnergyCycle.format(energy)}.</p>${blocked&&!active?'<p role="status">Najpierw zakończ obecną misję.</p>':''}<article class="roderik-card"><span class="roderik-tier">Łatwiejsza misja</span><h4>Zwiad czasowy</h4><p>W przygotowaniu. Misje czasowe dodamy później.</p><button type="button" class="secondary" disabled>Wkrótce · ${window.EnergyCycle.format(easyCost)} energii</button></article><article class="roderik-card">${place?`<div class="roderik-scene" role="img" aria-label="${place.name}" style="${atlasStyle(place)}"></div>`:''}<span class="roderik-tier">Trudniejsza misja · Walka z potworem</span><h4>${enemy?enemy.contractTitle:active?'Walka w toku':'Zlecenie bojowe'}</h4><p>${enemy?`${place.name} · ${enemy.name} · Poziom ${enemy.level}`:active?'Możesz wrócić do rozpoczętej walki bez kolejnej opłaty.':blocked?'Najpierw zakończ obecną misję.':'Brak przeciwników w zakresie Twojego poziomu.'}</p>${enemy?`<p>${enemy.description}</p><p>${enemy.traits}</p><p class="roderik-reward">Nagroda za zwycięstwo: ${reward.gold} złota · ${reward.xp} EXP</p>`:''}${active?'<button type="button" class="primary" data-roderik-resume>Wróć do walki</button>':`<button type="button" class="primary" data-roderik-start="${hero.roderikOffer?.id||''}" ${busy||blocked||!enemy||energy<cost?'disabled':''}>Podejmij misję · ${window.EnergyCycle.format(cost)} energii</button>`}</article>`;
    }
    async function refresh(){try{const hero=await locked(()=>{const h=state.read(),next=prepare(h);return next===h?h:state.update(current=>prepare(current));});render(hero);}catch{if(!disposed)message.textContent='Nie udało się zapisać zlecenia. Spróbuj ponownie.';}}
    async function click(event){
      if(disposed||busy)return;
      if(event.target.closest('[data-roderik-resume]')){await combat.open();return;}
      const button=event.target.closest('[data-roderik-start]');if(!button)return;
      busy=true;button.disabled=true;message.textContent='';
      try{await locked(()=>{if(disposed)return;return state.update(hero=>start(hero,button.dataset.roderikStart));});if(!disposed){render(state.read());await combat.open();}}
      catch(error){if(!disposed)message.textContent=['QuotaExceededError','SecurityError'].includes(error.name)?'Nie udało się zapisać misji. Energia nie została pobrana.':error.message;}
      finally{busy=false;if(!disposed)await refresh();}
    }
    function storage(event){if(!busy&&(event.key==='pustkowie.hero.v2'||event.key===null))void refresh();}
    root.addEventListener('click',click);window.addEventListener('storage',storage);void refresh();
    return()=>{disposed=true;combat();root.removeEventListener('click',click);window.removeEventListener('storage',storage);};
  }
  window.RoderikMissions={TIERS,available,prepare,start,resolve,scene,mount};
})();
