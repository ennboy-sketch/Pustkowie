'use strict';
(() => {
  const MIN_LEVEL=31;
  const SCOUT_BANDS=Object.freeze([Object.freeze({min:31,max:40,minutes:30,gold:2000,xpBasisPoints:2500}),Object.freeze({min:41,max:50,minutes:45,gold:4000,xpBasisPoints:3500})]);
  function scoutTerms(hero){
    const effective=Math.max(MIN_LEVEL,Math.min(level(hero),50)),band=SCOUT_BANDS.find(b=>effective>=b.min&&effective<=b.max);
    return {minutes:band.minutes,durationMs:band.minutes*60000*(hero.warPony?.9:1),reward:{gold:band.gold,xp:Math.floor(window.Progression.required(effective)*band.xpBasisPoints/10000)}};
  }
  const TIERS=Object.freeze({easy:Object.freeze({cost:10,enabled:true}),hard:Object.freeze({cost:15,enabled:true})});
  const level=hero=>window.Progression.level(hero);
  const places=()=>window.FrontierBestiary.LOCATIONS;
  function random(max){const value=new Uint32Array(1),limit=4294967296-4294967296%max;do{crypto.getRandomValues(value);}while(value[0]>=limit);return value[0]%max;}
  function available(hero){const target=Math.min(level(hero),50);return level(hero)>=MIN_LEVEL?window.FrontierBestiary.MONSTERS.filter(enemy=>Math.abs(enemy.level-target)<=3):[];}
  function rewardFor(enemy,hero){return window.FrontierBestiary.rewardFor(enemy.id,Math.min(level(hero),50));}
  function validOffer(hero){const offer=hero.roderikOffer;return offer?.version===1&&offer.playerLevel===level(hero)&&typeof offer.id==='string'&&available(hero).some(enemy=>enemy.id===offer.enemyId);}
  function validScoutOffer(offer){return offer?.version===1&&typeof offer.id==='string'&&places().some(place=>place.id===offer.sceneId);}
  function prepare(hero){
    if(level(hero)<MIN_LEVEL)return hero;
    let next=hero;
    if(!hero.activeCombat&&!validOffer(hero)){
      const pool=available(hero),enemy=pool[random(pool.length)];
      next={...next,roderikOffer:{version:1,id:crypto.randomUUID(),enemyId:enemy.id,playerLevel:level(hero)}};
    }
    if(!hero.roderikScout&&!validScoutOffer(hero.roderikScoutOffer))next={...next,roderikScoutOffer:{version:1,id:crypto.randomUUID(),sceneId:places()[random(places().length)].id}};
    return next;
  }
  function requireLevel(hero){if(level(hero)<MIN_LEVEL)throw Error('Zlecenia Roderika są dostępne od 31. poziomu.');}
  function start(hero,id,now=Date.now()){
    requireLevel(hero);
    if(hero.activeCombat)throw Error('Najpierw zakończ obecną walkę.');
    if(!validOffer(hero)||hero.roderikOffer.id!==id)throw Error('Zlecenie zmieniło się. Otwórz panel ponownie.');
    const enemy=window.FrontierBestiary.get(hero.roderikOffer.enemyId);
    hero=window.EnergyCycle.apply(hero,now);
    const cost=window.EnergyCycle.cost(hero,TIERS.hard.cost);
    if(hero.energy<cost)throw Error(`Potrzebujesz ${window.EnergyCycle.format(cost)} energii.`);
    return {...hero,energy:hero.energy-cost,roderikOffer:null,activeCombat:{id:crypto.randomUUID(),source:'roderik',difficulty:'hard',cost,sceneId:enemy.sceneId,playerLevel:level(hero),rewardVersion:1,reward:rewardFor(enemy,hero),battle:window.BrandCombat.createBattle(window.BrandCombat.profile(hero),enemy,'hero'),nextHitAt:now+1100}};
  }
  function resolve(hero,id){
    const fight=hero.activeCombat;
    if(fight?.source!=='roderik'||fight.id!==id||!fight.battle.winner)throw Error('Walka trwa lub została już rozliczona.');
    const won=fight.battle.winner==='hero',reward=won?{...fight.reward}:{gold:0,xp:0};
    const next=window.Progression.award(hero,reward.xp),gold=(hero.gold??25)+reward.gold;
    if(!Number.isSafeInteger(gold))throw Error('Nieprawidłowa ilość złota.');
    return {...next,gold,activeCombat:null,lastRoderikCombat:{id,sceneId:fight.sceneId,enemyId:fight.battle.enemy.id,won,reward,levelsGained:level(next)-level(hero)}};
  }
  function readScout(hero){
    const scout=hero.roderikScout;if(!scout)return null;
    const terms=scout.rewardVersion===1?{minutes:20,reward:{xp:150000,gold:500}}:scoutTerms({level:scout.levelAtStart});
    const duration=terms.minutes*60000*(scout.speedBonus===10?.9:1);
    if(scout.version!==1||![1,2].includes(scout.rewardVersion)||(scout.rewardVersion===2&&scout.baseDurationMinutes!==terms.minutes)||typeof scout.id!=='string'||!places().some(p=>p.id===scout.sceneId)||!Number.isSafeInteger(scout.startedAt)||scout.startedAt<0||!Number.isSafeInteger(scout.endsAt)||scout.durationMs!==duration||scout.endsAt!==scout.startedAt+duration||!Number.isSafeInteger(scout.levelAtStart)||scout.levelAtStart<MIN_LEVEL||![0,10].includes(scout.speedBonus)||scout.reward?.xp!==terms.reward.xp||scout.reward?.gold!==terms.reward.gold)throw Error('Nieprawidłowy zapis zwiadu Roderika.');
    return scout;
  }
  function startScout(hero,id,now=Date.now()){
    requireLevel(hero);
    if(readScout(hero))throw Error('Najpierw odbierz nagrodę za obecny zwiad Roderika.');
    if(!validScoutOffer(hero.roderikScoutOffer)||hero.roderikScoutOffer.id!==id)throw Error('Zlecenie zwiadu zmieniło się. Otwórz panel ponownie.');
    hero=window.EnergyCycle.apply(hero,now);
    const cost=window.EnergyCycle.cost(hero,TIERS.easy.cost);
    if(hero.energy<cost)throw Error(`Potrzebujesz ${window.EnergyCycle.format(cost)} energii.`);
    const terms=scoutTerms(hero),durationMs=terms.durationMs;
    return {...hero,energy:hero.energy-cost,roderikScoutOffer:null,roderikScout:{version:1,rewardVersion:2,baseDurationMinutes:terms.minutes,id:crypto.randomUUID(),sceneId:hero.roderikScoutOffer.sceneId,levelAtStart:level(hero),startedAt:now,endsAt:now+durationMs,durationMs,speedBonus:hero.warPony?10:0,cost,reward:{...terms.reward}}};
  }
  function finishScout(hero,id,now=Date.now()){
    const scout=readScout(hero);
    if(!scout||scout.id!==id)throw Error('Ten zwiad został już rozliczony lub zmienił się.');
    if(now<scout.endsAt)throw Error('Zwiad jeszcze trwa.');
    const next=window.Progression.award(hero,scout.reward.xp),gold=(hero.gold??25)+scout.reward.gold;
    if(!Number.isSafeInteger(gold))throw Error('Nieprawidłowa ilość złota.');
    const result={...next,gold,roderikScout:null,lastRoderikScout:{...scout,reportedAt:now,levelsGained:level(next)-level(hero)}};
    return window.PlayerStats?.recordMission(result,scout.sceneId)??result;
  }
  function scene(fight){const place=places().find(p=>p.id===fight.sceneId);if(!place)throw Error('Nieznany teren zlecenia.');return {...place,short:place.name};}
  function atlasStyle(art){return `background-image:url('${art.image}');background-size:${art.columns*100}% ${art.rows*100}%;background-position:${art.tile%art.columns/(art.columns-1)*100}% ${Math.floor(art.tile/art.columns)/(art.rows-1)*100}%`;}
  function mount(root,state){
    root.innerHTML='<div class="roderik-mission-list brand-choice-list"></div><p class="roderik-message brand-choice-message" role="status" aria-live="polite"></p><div class="roderik-combat" hidden></div>';
    const list=root.querySelector('.roderik-mission-list'),message=root.querySelector('.roderik-message');
    let disposed=false,busy=false,renderKey='';
    const locked=fn=>navigator.locks?navigator.locks.request('pustkowie-hero-v2',fn):fn();
    const combat=window.BrandCombat.mount(root.querySelector('.roderik-combat'),{...state,prepareCombat:hero=>hero,onQuestResolved:hero=>{if(disposed)return;const last=hero.lastRoderikCombat;message.textContent=last.won?`Zwycięstwo! Nagroda: ${last.reward.gold} złota · ${last.reward.xp} EXP${last.levelsGained?` · Awans o ${last.levelsGained} poziom(y)`:''}.`:'Porażka. Nie otrzymujesz nagrody. Energia została zużyta przy rozpoczęciu.';void refresh();}});
    function clock(hero){
      const scout=readScout(hero);if(!scout)return;
      const timer=list.querySelector('[data-roderik-clock]'),progress=list.querySelector('progress'),button=list.querySelector('[data-roderik-claim]');if(!timer||!progress||!button)return;
      const remaining=Math.max(0,scout.endsAt-Date.now()),seconds=Math.ceil(remaining/1000);
      timer.textContent=remaining?`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`:'Zwiad zakończony';
      progress.max=scout.durationMs;progress.value=Math.min(scout.durationMs,Math.max(0,Date.now()-scout.startedAt));
      button.disabled=busy||remaining>0;button.textContent=remaining?'Zwiad w toku':'Zgłoś powrót i odbierz nagrodę';
    }
    function render(hero){
      if(disposed)return;
      const scout=readScout(hero),terms=scoutTerms(hero),scoutReward=scout?.reward||terms.reward,energy=window.EnergyCycle.info(hero).energy,cost=window.EnergyCycle.cost(hero,TIERS.hard.cost),easyCost=window.EnergyCycle.cost(hero,TIERS.easy.cost),unlocked=level(hero)>=MIN_LEVEL;
      const active=hero.activeCombat?.source==='roderik',blocked=!!hero.activeCombat;
      const enemy=active?hero.activeCombat.battle.enemy:validOffer(hero)?window.FrontierBestiary.get(hero.roderikOffer.enemyId):null;
      const place=enemy?scene({sceneId:enemy.sceneId}):places()[0],scoutPlace=scene({sceneId:scout?.sceneId||hero.roderikScoutOffer?.sceneId||places()[0].id});
      const reward=enemy?(active?hero.activeCombat.reward:rewardFor(enemy,hero)):null;
      const key=JSON.stringify([level(hero),energy,hero.roderikOffer?.id,hero.roderikScoutOffer?.id,scout?.id,hero.activeCombat?.id,busy]);
      if(key===renderKey){clock(hero);return;}renderKey=key;
      function card(kind,art,title,body,button){return `<article class="roderik-card brand-choice-card" data-choice-type="${kind}"><div class="choice-art"><span class="roderik-atlas" style="${atlasStyle(art)}" aria-hidden="true"></span><span class="rpg-icon icon-${kind==='scout'?'journal':'arena'}" aria-hidden="true"></span><span>${kind==='scout'?'Łatwiejsza misja':'Trudniejsza misja'}</span></div><div class="choice-body"><h4>${title}</h4>${body}${button}</div></article>`;}
      const scoutBody=`<p class="choice-location">${scoutPlace.name}</p><p class="choice-kind">Zwiad czasowy · ${scout?scout.durationMs/60000:terms.durationMs/60000} min</p><p>Sprawdź dawny szlak i przynieś Roderikowi raport. W czasie zwiadu możesz podejmować walki i zadania poboczne.</p><p class="choice-location">Nagroda: ${scoutReward.gold} złota · ${scoutReward.xp} EXP</p>${scout?'<div class="roderik-scout-progress"><strong data-roderik-clock role="timer"></strong><progress aria-label="Postęp zwiadu Roderika" max="1" value="0"></progress></div>':''}`;
      const scoutButton=scout?`<button type="button" class="primary" data-roderik-claim="${scout.id}" disabled>Zwiad w toku</button>`:`<button type="button" class="primary" data-roderik-scout="${hero.roderikScoutOffer?.id||''}" ${busy||!unlocked||energy<easyCost?'disabled':''}>${!unlocked?'Od 31. poziomu':`Podejmij misję · ${window.EnergyCycle.format(easyCost)} energii`}</button>`;
      const combatBody=`<p class="choice-location">${place.name}</p><p class="choice-kind">Walka${enemy?` · ${enemy.name} · Poziom ${enemy.level}`:' z potworem'}</p><p>${enemy?enemy.description:'Dwa rodzaje zleceń są dostępne od 31. poziomu.'}</p>${enemy?`<p class="choice-location">Nagroda za zwycięstwo: ${reward.gold} złota · ${reward.xp} EXP</p>`:''}${blocked&&!active?'<p>Najpierw zakończ obecną walkę. Zwiady i zadania poboczne nie blokują tego zlecenia.</p>':''}`;
      const combatButton=active?'<button type="button" class="primary" data-roderik-resume>Wróć do walki · Bez kolejnej opłaty</button>':`<button type="button" class="primary" data-roderik-start="${hero.roderikOffer?.id||''}" ${busy||!unlocked||blocked||!enemy||energy<cost?'disabled':''}>${!unlocked?'Od 31. poziomu':`Podejmij misję · ${window.EnergyCycle.format(cost)} energii`}</button>`;
      list.innerHTML=`<p class="brand-matchmaking-note">${unlocked?`Zlecenia od 31. poziomu · Energia: ${window.EnergyCycle.format(energy)} / 100<br>${level(hero)>50?'Najsilniejsze potwory pogranicza: poziomy 47–50.':`Potwory: poziomy ${Math.max(31,level(hero)-3)}–${Math.min(50,level(hero)+3)}.`}`:'Oba zlecenia odblokujesz na 31. poziomie postaci.'}</p>`+card('scout',scoutPlace,'Szlak wędrowca',scoutBody,scoutButton)+card('combat',place,enemy?.contractTitle||'Próba śmiałka',combatBody,combatButton);clock(hero);
    }
    async function refresh(){if(disposed||busy)return;try{const hero=await locked(()=>{if(disposed)return null;const h=state.read(),next=prepare(h);return next===h?h:state.update(current=>prepare(current));});if(hero)render(hero);}catch(error){if(!disposed)message.textContent=error.message||'Nie udało się odczytać zleceń.';}}
    async function click(event){
      if(disposed||busy)return;
      if(event.target.closest('[data-roderik-resume]')){await combat.open();return;}
      const button=event.target.closest('[data-roderik-start],[data-roderik-scout],[data-roderik-claim]');if(!button)return;
      const kind=button.hasAttribute('data-roderik-start')?'combat':button.hasAttribute('data-roderik-scout')?'scout':'claim',id=button.dataset.roderikStart||button.dataset.roderikScout||button.dataset.roderikClaim;
      busy=true;button.disabled=true;message.textContent='';
      try{
        const next=await locked(()=>{if(disposed)return null;return state.update(hero=>kind==='combat'?start(hero,id):kind==='scout'?startScout(hero,id):finishScout(hero,id));});
        if(!disposed&&next){render(next);if(kind==='combat')await combat.open();else message.textContent=kind==='scout'?'Zwiad rozpoczęty. Możesz walczyć i wykonywać zadania poboczne.':`Powrót ze zwiadu! Nagroda: ${next.lastRoderikScout.reward.gold} złota · ${next.lastRoderikScout.reward.xp} EXP.`;}
      }catch(error){if(!disposed)message.textContent=['QuotaExceededError','SecurityError'].includes(error.name)?'Nie udało się zapisać misji. Energia nie została pobrana.':error.message;}
      finally{busy=false;renderKey='';if(!disposed)await refresh();}
    }
    function storage(event){if(event.key==='pustkowie.hero.v2'||event.key===null)void refresh();}
    root.addEventListener('click',click);window.addEventListener('storage',storage);const timer=setInterval(refresh,1000);void refresh();
    return()=>{disposed=true;clearInterval(timer);combat();root.removeEventListener('click',click);window.removeEventListener('storage',storage);};
  }
  window.RoderikMissions={MIN_LEVEL,SCOUT_BANDS,scoutTerms,TIERS,available,prepare,start,resolve,readScout,startScout,finishScout,scene,mount};
})();
