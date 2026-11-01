'use strict';
(() => {
  const BASE_STATS={warrior:[12,5,3,10],mage:[3,5,12,6],elf:[5,12,4,7],dwarf:[10,3,4,12]};
  const LABELS=['Siła','Zręczność','Inteligencja','Wytrzymałość'];
  const ROSTERS={forest:[
    {id:'boar',name:'Dzik',level:1,maxHp:70,stats:[7,4,1,5],attack:[7,10],tile:0},
    {id:'wolf',name:'Wilk',level:2,maxHp:90,stats:[8,10,2,6],attack:[9,13],tile:1},
    {id:'dryad',name:'Driada',level:3,maxHp:110,stats:[5,8,13,7],attack:[11,16],tile:2},
    {id:'goblin',name:'Goblin',level:5,maxHp:135,stats:[11,12,5,9],attack:[13,19],tile:3}
  ],mine:[],undercity:[]};
  function random(min,max){const a=new Uint32Array(1),range=max-min+1,limit=4294967296-4294967296%range;do{crypto.getRandomValues(a);}while(a[0]>=limit);return min+a[0]%range;}
  function eligible(hero){return window.Progression.level(hero)<=5;}
  function prepare(hero){
    if(hero.activeMission)throw new Error('Najpierw zakończ aktywny zwiad.');
    if(hero.activeCombat)return hero;
    const old=hero.combatOffer;
    if(!eligible(hero))return hero;
    if(old?.sceneId==='forest'&&ROSTERS.forest.some(m=>m.id===old.enemyId))return hero;
    // Previously empty previews become a playable forest assignment once.
    return {...hero,combatOffer:{sceneId:'forest',enemyId:ROSTERS.forest[random(0,3)].id}};
  }
  function start(hero,now=Date.now()){
    hero=window.EnergyCycle.apply(hero,now);
    if(hero.activeMission||hero.activeCombat)throw new Error('Najpierw zakończ obecną misję.');
    if(!eligible(hero))throw new Error('Te potwory są dostępne dla poziomów 1–5.');
    const enemy=ROSTERS.forest.find(m=>hero.combatOffer?.sceneId==='forest'&&m.id===hero.combatOffer.enemyId);
    if(!enemy)throw new Error('Brak przydzielonego przeciwnika.');
    if(hero.energy<5)throw new Error('Potrzebujesz 5 energii.');
    const player=profile(hero),power=Math.max(...player.stats)+player.level*2;
    player.attack=[Math.max(1,power-3),power+3];
    return {...hero,energy:hero.energy-5,activeCombat:{id:crypto.randomUUID(),sceneId:'forest',battle:createBattle(player,enemy,'hero'),reward:{gold:random(10,30),xp:random(33,55)},nextHitAt:now+1100}};
  }
  function tick(hero,now=Date.now()){
    const fight=hero.activeCombat;
    if(!fight||fight.battle.winner||now<fight.nextHitAt)return hero;
    return {...hero,activeCombat:{...fight,battle:advance(fight.battle,actor=>random(...actor.attack)),nextHitAt:now+1100}};
  }
  function finish(hero,id){
    const fight=hero.activeCombat;
    if(!fight||fight.id!==id||!fight.battle.winner)throw new Error('Walka trwa lub została już rozliczona.');
    const won=fight.battle.winner==='hero',reward=won?fight.reward:{gold:0,xp:0};
    const next=window.Progression.award(hero,reward.xp),gold=(hero.gold??25)+reward.gold;
    if(!Number.isSafeInteger(gold))throw new Error('Nieprawidłowa ilość złota.');
    return {...next,gold,activeCombat:null,combatOffer:null,lastCombat:{id,sceneId:fight.sceneId,enemyId:fight.battle.enemy.id,won,reward,levelsGained:next.level-window.Progression.level(hero)}};
  }
  function profile(hero){
    const stats=BASE_STATS[hero.classId];
    if(!stats)throw new Error('Nieznana klasa postaci.');
    return {name:hero.name,level:window.Progression.level(hero),maxHp:50+stats[3]*10,stats:[...stats],classId:hero.classId,gender:hero.gender};
  }
  function drawLocation(){
    const ids=Object.keys(ROSTERS),value=new Uint32Array(1),limit=4294967296-(4294967296%ids.length);
    do{crypto.getRandomValues(value);}while(value[0]>=limit);
    return ids[value[0]%ids.length];
  }
  function opponents(sceneId){if(!Object.hasOwn(ROSTERS,sceneId))throw new Error('Nieznany teren walki.');return ROSTERS[sceneId];}
  function createBattle(hero,enemy,first){
    if(!['hero','enemy'].includes(first))throw new Error('Ustal kolejność ataków.');
    for(const fighter of [hero,enemy])if(!fighter||typeof fighter.name!=='string'||!Number.isSafeInteger(fighter.maxHp)||fighter.maxHp<1)throw new Error('Brak statystyk do rozpoczęcia walki.');
    const snapshot=f=>({...f,stats:f.stats?[...f.stats]:undefined,hp:f.maxHp});
    return {hero:snapshot(hero),enemy:snapshot(enemy),next:first,hits:0,winner:null,lastHit:null};
  }
  // Damage and initiative must be supplied by future combat rules, never inferred from scouting rewards.
  function advance(battle,resolveHit){
    if(battle.winner)return battle;
    if(typeof resolveHit!=='function')throw new Error('Zasady obrażeń nie zostały ustalone.');
    const actor=battle.next,target=actor==='hero'?'enemy':'hero';
    const copy=f=>({...f,stats:f.stats?[...f.stats]:undefined});
    const damage=resolveHit(copy(battle[actor]),copy(battle[target]),battle.hits+1);
    if(!Number.isSafeInteger(damage)||damage<1)throw new Error('Nieprawidłowe obrażenia.');
    const hp=Math.max(0,battle[target].hp-damage);
    return {...battle,[target]:{...battle[target],hp},next:target,hits:battle.hits+1,winner:hp===0?actor:null,lastHit:{actor,target,damage:Math.min(damage,battle[target].hp)}};
  }
  function fighterMarkup(side){return `<article class="combat-fighter" data-fighter="${side}"><div class="combat-portrait"><div class="combat-figure"></div><span class="combat-empty-icon rpg-icon icon-arena" aria-hidden="true"></span><span class="combat-damage" aria-hidden="true"></span><div class="combat-identity"><h3></h3><span class="combat-level"></span></div></div><div class="combat-health"><progress max="1" value="0" aria-label="Punkty życia"></progress><strong></strong></div><dl class="combat-stats">${LABELS.map(label=>`<div><dt>${label}</dt><dd>—</dd></div>`).join('')}</dl></article>`;}
  function renderFighter(root,fighter){
    root.querySelector('h3').textContent=fighter?.name||'Przeciwnik';
    root.querySelector('.combat-level').textContent=fighter?`Poziom ${fighter.level||1}`:'Oczekuje na odkrycie';
    const figure=root.querySelector('.combat-figure');
    figure.className='combat-figure';
    figure.style.cssText='';
    if(Number.isInteger(fighter?.tile)){figure.classList.add('monster-avatar');figure.style.backgroundPosition=`${fighter.tile%2*100}% ${Math.floor(fighter.tile/2)*100}%`;}
    if(fighter&&Object.hasOwn(BASE_STATS,fighter.classId)&&['male','female'].includes(fighter.gender))figure.className+=` character ${fighter.gender} ${fighter.classId}`;
    root.classList.toggle('combat-empty',!fighter);
    const hp=fighter?(fighter.hp??fighter.maxHp):0,bar=root.querySelector('progress');
    bar.max=fighter?.maxHp||1;bar.value=hp;bar.setAttribute('aria-label',fighter?`Życie: ${fighter.name}`:'Życie przeciwnika — brak danych');
    root.querySelector('.combat-health strong').textContent=fighter?`${hp} / ${fighter.maxHp}`:'— / —';
    root.querySelectorAll('dd').forEach((el,i)=>{el.textContent=fighter?.stats?.[i]??'—';});
  }
  function renderBattle(root,battle){
    for(const side of ['hero','enemy']){
      const card=root.querySelector(`[data-fighter="${side}"]`);
      renderFighter(card,battle[side]);
      card.classList.toggle('combat-attacking',!battle.winner&&battle.lastHit?.actor===side);
      card.classList.toggle('combat-struck',battle.lastHit?.target===side);
      card.querySelector('.combat-damage').textContent=battle.lastHit?.target===side?`−${battle.lastHit.damage}`:'';
    }
    root.querySelector('.combat-round').textContent=battle.winner?(battle.winner==='hero'?'Zwycięstwo':'Porażka'):`Tura ${Math.floor(battle.hits/2)+1}`;
    root.querySelector('.combat-status').textContent=battle.winner?'Walka zakończona.':battle.lastHit?`${battle[battle.lastHit.actor].name} zadaje ${battle.lastHit.damage} obrażeń.`:'Przeciwnicy stają naprzeciw siebie.';
  }
  function play(root,battle,resolveHit,{delay=1100}={}){
    if(!Number.isFinite(delay)||delay<100)throw new Error('Nieprawidłowe tempo walki.');
    let current=battle,stopped=false,timer=null;
    const schedule=()=>{if(!stopped&&!current.winner)timer=setTimeout(step,delay);};
    function step(){
      if(stopped)return;
      try{current=advance(current,resolveHit);renderBattle(root,current);schedule();}
      catch(error){stop();root.querySelector('.combat-status').textContent=error.message;}
    }
    function stop(){stopped=true;clearTimeout(timer);}
    renderBattle(root,current);schedule();
    return stop;
  }
  function markup(){
    return '<p class="combat-availability">Mroczny Las: Dzik, Wilk, Driada i Goblin dla postaci poziomu 1–5. Brand przydziela przeciwnika automatycznie. Podgląd jest bezpłatny.</p><p class="combat-entry-error" role="status"></p>';
  }
  function mount(container,state){
    container.innerHTML=markup();
    const dialog=document.createElement('dialog');
    dialog.className='combat-dialog';dialog.setAttribute('aria-labelledby','combat-location');
    dialog.innerHTML=`<div class="combat-stage"><div class="combat-top"><div><span>Dowódca Brand · Walka z potworami</span><h2 id="combat-location"></h2></div><button type="button" data-close-combat aria-label="Wróć do Branda">×</button></div><div class="combat-battlefield"><div class="combat-round">Przygotowanie do walki</div><div class="combat-fighters">${fighterMarkup('hero')}<span class="combat-versus" aria-hidden="true">⚔</span>${fighterMarkup('enemy')}</div></div><div class="combat-bottom"><p class="combat-status" role="status" aria-live="polite"></p><div class="combat-actions"><button type="button" class="primary" disabled>Walka niedostępna</button></div><small>Rozpoczęcie misji: 5 energii · Podgląd jest bezpłatny</small></div></div>`;
    document.body.append(dialog);
    let disposed=false,busy=false,shownId=null,timer=null;
    const action=dialog.querySelector('.combat-actions button');
    action.removeAttribute('disabled');
    const locked=fn=>navigator.locks?navigator.locks.request('pustkowie-hero-v2',fn):fn();
    function render(hero){
      const fight=hero.activeCombat,offer=hero.combatOffer;
      const sceneId=fight?.sceneId||offer?.sceneId||'forest',scene=window.BrandMissions.SCENES[sceneId];
      dialog.querySelector('.combat-stage').style.setProperty('--combat-art',`url("${scene.image}")`);
      dialog.querySelector('#combat-location').textContent=scene.short;
      if(fight){
        renderBattle(dialog,fight.battle);shownId=fight.id;
        action.textContent=fight.battle.winner?'Zgłoś wynik walki':'Walka trwa';action.disabled=!fight.battle.winner||busy;
        action.dataset.action='finish';action.dataset.fightId=fight.id;
      }else{
        const enemy=eligible(hero)?ROSTERS[sceneId].find(m=>m.id===offer?.enemyId):null;
        renderFighter(dialog.querySelector('[data-fighter="hero"]'),profile(hero));
        renderFighter(dialog.querySelector('[data-fighter="enemy"]'),enemy);
        dialog.querySelector('.combat-round').textContent='Przygotowanie do walki';
        dialog.querySelector('.combat-status').textContent=enemy?'Nagroda za zwycięstwo: 10–30 złota · 33–55 EXP':eligible(hero)?'Brak dostępnych przeciwników.':'Potwory Mrocznego Lasu: poziomy postaci 1–5.';
        action.textContent=enemy?'Rozpocznij walkę · 5 energii':'Walka niedostępna';action.disabled=!enemy||busy;action.dataset.action='start';
      }
    }
    async function preview(){
      if(disposed||busy)return;busy=true;
      try{
        const hero=await locked(()=>{
          const current=state.read();if(current.activeMission)throw new Error('Najpierw zakończ aktywny zwiad.');
          const next=prepare(current);return next===current?current:state.update(latest=>prepare(latest));
        });
        if(disposed)return;busy=false;render(hero);if(!dialog.open)dialog.showModal();
      }catch(error){if(!disposed)container.querySelector('.combat-entry-error').textContent=error.message;}
      finally{busy=false;}
    }
    async function update(){
      if(disposed||busy||!dialog.open)return;
      try{const hero=await locked(()=>{const current=state.read(),next=tick(current);return next===current?current:state.update(latest=>tick(latest));});if(!disposed){if(shownId&&!hero.activeCombat){dialog.close();shownId=null;}else render(hero);}}
      catch(error){if(!disposed)dialog.querySelector('.combat-status').textContent='Nie udało się zapisać walki. Spróbuj ponownie.';}
    }
    async function act(){
      if(busy)return;const intent=action.dataset.action,id=action.dataset.fightId;busy=true;action.disabled=true;
      try{
        const next=await locked(()=>state.update(hero=>intent==='finish'?finish(hero,id):start(hero)));
        if(disposed)return;
        if(intent==='finish'){
          dialog.close();shownId=null;
          if(next.lastCombat.won)window.TavernPanel.showReward(next.lastCombat,window.Progression.level(next));
          else{dialog.querySelector('.combat-status').textContent='Porażka. Nie otrzymujesz nagrody.';render(next);dialog.querySelector('.combat-status').textContent='Porażka. Nie otrzymujesz nagrody.';dialog.showModal();}
        }else{busy=false;render(next);}
      }catch(error){if(!disposed)dialog.querySelector('.combat-status').textContent=error.message;}
      finally{busy=false;if(!disposed){const current=state.read();action.disabled=current.activeCombat?!current.activeCombat.battle.winner:!current.combatOffer?.enemyId||!eligible(current);}}
    }
    function click(e){if(e.target.closest('[data-close-combat]'))dialog.close();else if(e.target.closest('.combat-actions button'))void act();}
    dialog.addEventListener('click',click);timer=setInterval(update,500);
    const dispose=()=>{disposed=true;clearInterval(timer);dialog.removeEventListener('click',click);if(dialog.open)dialog.close();dialog.remove();};
    dispose.open=preview;
    return dispose;
  }
  window.BrandCombat={profile,opponents,drawLocation,createBattle,advance,play,mount,prepare,start,tick,finish};
})();
