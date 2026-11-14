'use strict';
(() => {
  const MIN_LEVEL=50,COST=15;
  const level=hero=>window.Progression.level(hero);
  function available(hero){const target=Math.min(level(hero),75);return level(hero)>=MIN_LEVEL?window.EldorBestiary.MONSTERS.filter(enemy=>Math.abs(enemy.level-target)<=3):[];}
  function rewardFor(enemy,hero){return window.EldorBestiary.rewardFor(enemy.id,Math.min(level(hero),75));}
  function validOffer(hero){const offer=hero.faelarOffer;return offer?.version===1&&offer.playerLevel===level(hero)&&typeof offer.id==='string'&&available(hero).some(enemy=>enemy.id===offer.enemyId);}
  function prepare(hero){
    if(level(hero)<MIN_LEVEL||hero.activeCombat||validOffer(hero))return hero;
    const pool=available(hero),value=new Uint32Array(1),limit=4294967296-4294967296%pool.length;
    do{crypto.getRandomValues(value);}while(value[0]>=limit);
    return {...hero,faelarOffer:{version:1,id:crypto.randomUUID(),playerLevel:level(hero),enemyId:pool[value[0]%pool.length].id}};
  }
  function start(hero,id,now=Date.now()){
    if(level(hero)<MIN_LEVEL)throw Error('Zlecenia Faelara są dostępne od 50. poziomu.');
    if(hero.activeCombat)throw Error('Najpierw zakończ obecną walkę.');
    if(!validOffer(hero)||hero.faelarOffer.id!==id)throw Error('Zlecenie zmieniło się. Otwórz panel ponownie.');
    const enemy=window.EldorBestiary.get(hero.faelarOffer.enemyId);
    hero=window.EnergyCycle.apply(hero,now);const cost=window.EnergyCycle.cost(hero,COST);
    if(hero.energy<cost)throw Error(`Potrzebujesz ${window.EnergyCycle.format(cost)} energii.`);
    return {...hero,energy:hero.energy-cost,faelarOffer:null,activeCombat:{id:crypto.randomUUID(),source:'faelar',difficulty:'hard',cost,sceneId:enemy.sceneId,playerLevel:level(hero),rewardVersion:1,reward:rewardFor(enemy,hero),battle:window.BrandCombat.createBattle(window.BrandCombat.profile(hero),enemy,'hero'),nextHitAt:now+1100}};
  }
  function resolve(hero,id){
    const fight=hero.activeCombat;
    if(fight?.source!=='faelar'||fight.id!==id||!['hero','enemy'].includes(fight.battle.winner))throw Error('Walka trwa lub została już rozliczona.');
    const won=fight.battle.winner==='hero',reward=won?{...fight.reward}:{gold:0,xp:0},next=window.Progression.award(hero,reward.xp),gold=(hero.gold??25)+reward.gold;
    if(!Number.isSafeInteger(gold)||!Number.isSafeInteger(reward.gold)||reward.gold<0)throw Error('Nieprawidłowa ilość złota.');
    return {...next,gold,activeCombat:null,lastFaelarCombat:{id,sceneId:fight.sceneId,enemyId:fight.battle.enemy.id,enemyName:fight.battle.enemy.name,won,reward,levelsGained:level(next)-level(hero),levelAfter:level(next)}};
  }
  function scene(fight){const place=window.EldorBestiary.LOCATIONS.find(place=>place.id===fight.sceneId);if(!place)throw Error('Nieznany teren zlecenia Faelara.');return {...place,short:place.name};}
  let resultDialog=null;
  function cancelResult(){const dialog=resultDialog;if(!dialog)return;resultDialog=null;if(dialog.open)dialog.close();dialog.remove();}
  function showResult(hero){
    const last=hero.lastFaelarCombat;if(!last)return;cancelResult();
    const dialog=document.createElement('dialog');resultDialog=dialog;dialog.className='roderik-result-dialog faelar-result-dialog';dialog.setAttribute('aria-labelledby','faelar-result-title');dialog.dataset.fightId=last.id;dialog.dataset.won=String(last.won);
    dialog.innerHTML='<button type="button" class="roderik-result-close" data-close-faelar-result aria-label="Zamknij podsumowanie walki">×</button><p class="roderik-result-eyebrow">Zamek Elfów · Podsumowanie walki</p><span class="roderik-result-ornament" aria-hidden="true">◆</span><h3 id="faelar-result-title"></h3><p class="roderik-result-enemy"></p><p class="roderik-result-description"></p><dl class="roderik-result-rewards"><div><dt><span class="rpg-icon icon-coin" aria-hidden="true"></span>Złoto</dt><dd data-faelar-result-gold></dd></div><div><dt><span class="rpg-icon icon-exp" aria-hidden="true"></span>EXP</dt><dd data-faelar-result-xp></dd></div></dl><p class="roderik-result-level" hidden></p><button type="button" class="primary" data-close-faelar-result>Wróć do zleceń</button>';
    dialog.querySelector('h3').textContent=last.won?'Zwycięstwo!':'Porażka';dialog.querySelector('.roderik-result-enemy').textContent=last.enemyName||window.EldorBestiary.get(last.enemyId).name;dialog.querySelector('.roderik-result-description').textContent=last.won?'Nagroda za pokonanego przeciwnika została już przyznana.':'Tym razem nie otrzymujesz nagrody. Możesz podjąć kolejne zlecenie.';
    const format=value=>new Intl.NumberFormat('pl-PL').format(value);dialog.querySelector('[data-faelar-result-gold]').textContent=format(last.reward.gold);dialog.querySelector('[data-faelar-result-xp]').textContent=format(last.reward.xp);
    const advancement=dialog.querySelector('.roderik-result-level');advancement.hidden=!(last.levelsGained>0);advancement.textContent=last.levelsGained>0?(last.levelAfter?`Awans! Osiągasz poziom ${last.levelAfter}.`:`Zdobyte poziomy: ${last.levelsGained}.`):'';
    dialog.addEventListener('click',event=>{if(event.target.closest('[data-close-faelar-result]'))cancelResult();});dialog.addEventListener('close',()=>{if(resultDialog===dialog)cancelResult();});document.body.append(dialog);dialog.showModal();dialog.querySelector('.primary').focus({preventScroll:true});
  }
  function mount(root,state){
    root.innerHTML='<div class="faelar-offers brand-choice-list"></div><button type="button" class="secondary" data-faelar-last-result aria-haspopup="dialog" hidden>Ostatnia walka · Pokaż podsumowanie</button><p class="faelar-message brand-choice-message" role="status" aria-live="polite"></p><div class="faelar-combat" hidden></div>';
    const list=root.querySelector('.faelar-offers'),message=root.querySelector('.faelar-message');let disposed=false,busy=false,renderKey='';
    const locked=fn=>navigator.locks?navigator.locks.request('pustkowie-hero-v2',fn):fn();
    const combat=window.BrandCombat.mount(root.querySelector('.faelar-combat'),{...state,prepareCombat:hero=>hero,onFaelarResolved:hero=>{if(disposed)return;const last=hero.lastFaelarCombat;message.textContent=last.won?`Zwycięstwo! ${last.reward.gold} złota · ${last.reward.xp} EXP.`:'Porażka. Nie otrzymujesz nagrody.';void refresh();}});
    function render(hero){
      if(disposed)return;root.querySelector('[data-faelar-last-result]').hidden=!hero.lastFaelarCombat;const active=hero.activeCombat?.source==='faelar',blocked=!!hero.activeCombat,energy=window.EnergyCycle.info(hero).energy,cost=window.EnergyCycle.cost(hero,COST),unlocked=level(hero)>=MIN_LEVEL;
      const enemy=active?hero.activeCombat.battle.enemy:validOffer(hero)?window.EldorBestiary.get(hero.faelarOffer.enemyId):null,place=scene({sceneId:enemy?.sceneId||window.EldorBestiary.LOCATIONS[0].id}),reward=enemy?(active?hero.activeCombat.reward:rewardFor(enemy,hero)):null;
      const key=JSON.stringify([level(hero),energy,hero.faelarOffer?.id,hero.activeCombat?.id,busy]);if(key===renderKey)return;renderKey=key;
      const target=Math.min(level(hero),75),range=level(hero)>75?'Najsilniejsze zlecenia: poziomy 72–75.':`Potwory: poziomy ${Math.max(51,target-3)}–${Math.min(75,target+3)}.`;
      list.innerHTML=`<p class="brand-matchmaking-note">Faelar · Potwory Eldoru i Lodowych Wzgórz · 51–75<br>${unlocked?range:'Zlecenia od 50. poziomu.'} Energia: ${window.EnergyCycle.format(energy)} / 100</p><article class="brand-choice-card faelar-card" data-choice-type="combat"><div class="choice-art"><span class="roderik-atlas" style="background-image:url('${place.image}');background-size:300% 200%;background-position:${place.tile%3*50}% ${Math.floor(place.tile/3)*100}%" aria-hidden="true"></span><span class="rpg-icon icon-arena" aria-hidden="true"></span><span>Walka z potworem</span></div><div class="choice-body"><h4>${enemy?.contractTitle||'Zlecenie straży Eldoru'}</h4><p class="choice-location">${place.name}</p><p class="choice-kind">${enemy?`${enemy.name} · Poziom ${enemy.level}`:'Wybór przeciwnika dopasowanego do poziomu.'}</p>${enemy?`<p>${enemy.description}</p><p class="choice-location">Nagroda za zwycięstwo: ${reward.gold} złota · ${reward.xp} EXP</p>`:''}<p>Zwiady i zadania poboczne nie blokują walk. ${blocked&&!active?'Najpierw zakończ obecną walkę.':''}</p>${active?'<button type="button" class="primary" data-faelar-resume>Wróć do walki · Bez kolejnej opłaty</button>':`<button type="button" class="primary" data-faelar-start="${hero.faelarOffer?.id||''}" ${busy||!unlocked||blocked||!enemy||energy<cost?'disabled':''}>${unlocked?`Podejmij misję · ${window.EnergyCycle.format(cost)} energii`:'Od 50. poziomu'}</button>`}</div></article>`;
    }
    async function refresh(){if(disposed||busy)return;try{const hero=await locked(()=>{if(disposed)return null;const h=state.read(),next=prepare(h);return h===next?h:state.update(current=>prepare(current));});if(hero)render(hero);}catch(error){if(!disposed)message.textContent=error.message;}}
    async function click(event){
      if(disposed||busy)return;if(event.target.closest('[data-faelar-last-result]')){showResult(state.read());return;}if(event.target.closest('[data-faelar-resume]')){await combat.open();return;}
      const button=event.target.closest('[data-faelar-start]');if(!button)return;const id=button.dataset.faelarStart;busy=true;button.disabled=true;message.textContent='';
      try{const next=await locked(()=>{if(disposed)return null;return state.update(hero=>start(hero,id));});if(next&&!disposed){render(next);await combat.open();}}
      catch(error){if(!disposed)message.textContent=['QuotaExceededError','SecurityError'].includes(error.name)?'Nie udało się zapisać misji. Energia nie została pobrana.':error.message;}
      finally{busy=false;renderKey='';if(!disposed)await refresh();}
    }
    function storage(event){if(event.key==='pustkowie.hero.v2'||event.key===null)void refresh();}
    root.addEventListener('click',click);window.addEventListener('storage',storage);const timer=setInterval(refresh,1000);void refresh();
    return()=>{disposed=true;clearInterval(timer);combat();cancelResult();root.removeEventListener('click',click);window.removeEventListener('storage',storage);};
  }
  window.FaelarMissions={MIN_LEVEL,COST,available,prepare,start,resolve,scene,mount,showResult,cancelResult};
})();
