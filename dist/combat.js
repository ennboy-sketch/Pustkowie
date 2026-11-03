'use strict';
(() => {
  const BASE_STATS={warrior:[12,5,3,10],mage:[3,5,12,6],elf:[5,12,4,7],dwarf:[10,3,4,12]};
  const FIREBALL=Object.freeze({id:'fireball',name:'Kula ognia',manaCost:10});
  function manaInfo(fighter){const max=fighter.maxMana??window.HeroSheet.manaCapacity(fighter.classId,fighter.stats?.[2]??0);return {max,current:Number.isSafeInteger(fighter.mana)?Math.max(0,Math.min(max,fighter.mana)):max};}
  const LABELS=['Siła','Zręczność','Inteligencja','Wytrzymałość'];
  const ROSTERS={forest:[
    {id:'boar',name:'Dzik',level:1,maxHp:70,stats:[7,4,1,5],attack:[7,10],tile:0},
    {id:'wolf',name:'Wilk',level:2,maxHp:90,stats:[8,10,2,6],attack:[9,13],tile:1},
    {id:'dryad',name:'Driada',level:3,maxHp:110,stats:[5,8,13,7],attack:[11,16],tile:2},
    {id:'goblin',name:'Goblin',level:5,maxHp:135,stats:[11,12,5,9],attack:[13,19],tile:3},
    {id:'tree-whisperer',name:'Szeptun drzewny',level:8,maxHp:210,stats:[18,8,16,14],attack:[18,25],tile:0,atlas:'whisperer',minPlayerLevel:5,maxPlayerLevel:15,reward:{gold:25,xp:150}},
    {id:'forest-demoness',name:'Demonica Puszczy',level:9,maxHp:235,stats:[15,22,20,16],attack:[20,27],tile:0,atlas:'demoness',minPlayerLevel:5,maxPlayerLevel:15,reward:{gold:35,xp:190}}
  ],mine:[
    {id:'ghost',name:'Duch',level:1,maxHp:70,stats:[2,6,9,5],attack:[7,10],tile:0,atlas:'mine'},
    {id:'bandit',name:'Rozbójnik',level:2,maxHp:90,stats:[9,8,3,6],attack:[9,13],tile:1,atlas:'mine'},
    {id:'giant-rat',name:'Ogromny szczur',level:3,maxHp:110,stats:[10,12,1,7],attack:[11,16],tile:2,atlas:'mine'},
    {id:'crystal-ogre',name:'Kryształowy ogr',level:5,maxHp:135,stats:[16,4,5,9],attack:[13,19],tile:3,atlas:'mine'}
  ],undercity:[
    {id:'mud-snake',name:'Wąż błotny',level:1,maxHp:70,stats:[6,8,1,5],attack:[7,10],tile:0,atlas:'undercity'},
    {id:'wild-dog',name:'Dziki Pies',level:2,maxHp:90,stats:[8,10,2,6],attack:[9,13],tile:1,atlas:'undercity'},
    {id:'lost-human',name:'Zbłąkany człowiek',level:3,maxHp:110,stats:[11,8,4,7],attack:[11,16],tile:2,atlas:'undercity'},
    {id:'trolgotyta',name:'Trolgotyta',level:5,maxHp:135,stats:[15,6,3,9],attack:[13,19],tile:3,atlas:'undercity'}
  ]};
  function random(min,max){const a=new Uint32Array(1),range=max-min+1,limit=4294967296-4294967296%range;do{crypto.getRandomValues(a);}while(a[0]>=limit);return min+a[0]%range;}
  function availableOpponents(hero,sceneId,tier){
    const level=window.Progression.level(hero);
    return opponents(sceneId).filter(enemy=>level>=(enemy.minPlayerLevel??1)&&level<=(enemy.maxPlayerLevel??5)&&(!tier||(tier==='easy'?enemy.level<=2:enemy.level>=3)));
  }
  function eligible(hero){return Object.keys(ROSTERS).some(id=>availableOpponents(hero,id).length>0);}
  function prepare(hero){
    if(hero.activeMission)throw new Error('Najpierw zakończ aktywny zwiad.');
    if(hero.activeCombat)return hero;
    const old=hero.combatOffer;
    if(!eligible(hero))return hero;
    if(old&&Object.hasOwn(ROSTERS,old.sceneId)&&availableOpponents(hero,old.sceneId).some(m=>m.id===old.enemyId))return hero;
    // Preserve a previously assigned playable terrain; new offers draw from populated locations.
    const sceneId=old&&Object.hasOwn(ROSTERS,old.sceneId)&&availableOpponents(hero,old.sceneId).length?old.sceneId:drawLocation(hero);
    const pool=availableOpponents(hero,sceneId);
    return {...hero,combatOffer:{sceneId,enemyId:pool[random(0,pool.length-1)].id}};
  }
  function start(hero,now=Date.now(),options={}){
    const cost=options.cost??5;if(![3,5].includes(cost))throw new Error('Nieprawidłowy koszt misji.');
    hero=window.EnergyCycle.apply(hero,now);
    if(hero.activeMission||hero.activeCombat)throw new Error('Najpierw zakończ obecną misję.');
    if(!eligible(hero))throw new Error('Brak potworów dostępnych na Twoim poziomie.');
    const sceneId=hero.combatOffer?.sceneId;
    const enemy=sceneId&&Object.hasOwn(ROSTERS,sceneId)?availableOpponents(hero,sceneId).find(m=>m.id===hero.combatOffer.enemyId):null;
    if(!enemy)throw new Error('Brak przydzielonego przeciwnika.');
    if(hero.energy<cost)throw new Error(`Potrzebujesz ${cost} energii.`);
    const player=profile(hero),power=Math.max(...player.stats)+player.level*2;
    player.attack=[Math.max(1,power-3),power+3];
    return {...hero,energy:hero.energy-cost,brandOffers:null,activeCombat:{cost,difficulty:options.difficulty||null,id:crypto.randomUUID(),sceneId,battle:createBattle(player,enemy,'hero'),loot:null,reward:enemy.reward?{...enemy.reward}:{gold:random(10,30),xp:random(33,55)},nextHitAt:now+1100}};
  }
  function tick(hero,now=Date.now()){
    const fight=hero.activeCombat;
    if(!fight||fight.battle.winner||now<fight.nextHitAt)return hero;
    return {...hero,activeCombat:{...fight,battle:advance(fight.battle,actor=>random(...actor.attack)),nextHitAt:now+1100}};
  }
  function skip(hero,id){
    const fight=hero.activeCombat;
    if(!fight||fight.id!==id)throw new Error('Walka została już rozliczona lub zmieniła się.');
    let battle=fight.battle;
    while(!battle.winner)battle=advance(battle,actor=>random(...actor.attack));
    return finish({...hero,activeCombat:{...fight,battle}},id);
  }
  function finish(hero,id){
    const fight=hero.activeCombat;
    if(!fight||fight.id!==id||!fight.battle.winner)throw new Error('Walka trwa lub została już rozliczona.');
    if(fight.source==='tauriel')return window.TaurielQuest.resolve(hero,id);
    const won=fight.battle.winner==='hero',reward=won?fight.reward:{gold:0,xp:0};
    const next=window.Progression.award(hero,reward.xp),gold=(hero.gold??25)+reward.gold;
    if(!Number.isSafeInteger(gold))throw new Error('Nieprawidłowa ilość złota.');
    // Brand grants only gold and EXP, including fights saved with pending loot.
    return {...next,gold,activeCombat:null,combatOffer:null,lastCombat:{id,sceneId:fight.sceneId,enemyId:fight.battle.enemy.id,won,reward,loot:null,levelsGained:next.level-window.Progression.level(hero)}};
  }
  function profile(hero){
    const base=BASE_STATS[hero.classId];
    if(!base)throw new Error('Nieznana klasa postaci.');
    const added=window.HeroSheet.bonuses(hero),stats=base.map((n,i)=>n+added[i]);
    return {name:hero.name,level:window.Progression.level(hero),maxHp:50+stats[3]*10+window.HeroSheet.hpBonus(hero),maxMana:window.HeroSheet.manaCapacity(hero.classId,stats[2]),stats:[...stats],classId:hero.classId,gender:hero.gender};
  }
  function drawLocation(hero){
    const ids=Object.keys(ROSTERS).filter(id=>hero?availableOpponents(hero,id).length:ROSTERS[id].length),value=new Uint32Array(1),limit=4294967296-(4294967296%ids.length);
    do{crypto.getRandomValues(value);}while(value[0]>=limit);
    return ids[value[0]%ids.length];
  }
  function opponents(sceneId){if(!Object.hasOwn(ROSTERS,sceneId))throw new Error('Nieznany teren walki.');return ROSTERS[sceneId];}
  function createBattle(hero,enemy,first){
    if(!['hero','enemy'].includes(first))throw new Error('Ustal kolejność ataków.');
    for(const fighter of [hero,enemy])if(!fighter||typeof fighter.name!=='string'||!Number.isSafeInteger(fighter.maxHp)||fighter.maxHp<1)throw new Error('Brak statystyk do rozpoczęcia walki.');
    const snapshot=f=>{
      const mana=f.classId==='mage'?{maxMana:f.maxMana??window.HeroSheet.manaCapacity(f.classId,f.stats?.[2]??0),mana:f.maxMana??window.HeroSheet.manaCapacity(f.classId,f.stats?.[2]??0)}:{};
      return {...f,...mana,stats:f.stats?[...f.stats]:undefined,hp:f.maxHp};
    };
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
    const mage=actor==='hero'&&battle[actor].classId==='mage',mana=mage?manaInfo(battle[actor]):null;
    const fireball=!!mana&&mana.current>=FIREBALL.manaCost;
    const attacker=mana?{...battle[actor],maxMana:mana.max,mana:mana.current-(fireball?FIREBALL.manaCost:0)}:battle[actor];
    const hp=Math.max(0,battle[target].hp-damage);
    return {...battle,[actor]:attacker,[target]:{...battle[target],hp},next:target,hits:battle.hits+1,winner:hp===0?actor:null,lastHit:{actor,target,damage:Math.min(damage,battle[target].hp),ability:fireball?'fireball':mage?'wand':'attack',manaCost:fireball?FIREBALL.manaCost:0}};
  }
  function fighterMarkup(side){return `<article class="combat-fighter" data-fighter="${side}"><div class="combat-portrait"><div class="combat-figure"></div><span class="combat-empty-icon rpg-icon icon-arena" aria-hidden="true"></span><span class="combat-damage" aria-hidden="true"></span><div class="combat-identity"><h3></h3><span class="combat-level"></span></div></div><div class="combat-health"><progress max="1" value="0" aria-label="Punkty życia"></progress><strong></strong></div><div class="combat-mana" hidden><progress max="1" value="0" aria-label="Punkty many"></progress><strong></strong></div><dl class="combat-stats">${LABELS.map(label=>`<div><dt>${label}</dt><dd>—</dd></div>`).join('')}</dl></article>`;}
  function renderFighter(root,fighter){
    root.querySelector('h3').textContent=fighter?.name||'Przeciwnik';
    root.querySelector('.combat-level').textContent=fighter?`Poziom ${fighter.level||1}`:'Oczekuje na odkrycie';
    const figure=root.querySelector('.combat-figure');
    figure.className='combat-figure';
    figure.style.cssText='';
    if(Number.isInteger(fighter?.tile)){figure.classList.add('monster-avatar');if(fighter.atlas==='demoness')figure.classList.add('monster-demoness');if(fighter.atlas==='whisperer')figure.classList.add('monster-whisperer');if(fighter.atlas==='mine')figure.classList.add('monster-mine');if(fighter.atlas==='undercity')figure.classList.add('monster-undercity');if(fighter.atlas==='tauriel')figure.classList.add('monster-tauriel');figure.style.setProperty('--monster-position',fighter.atlas==='tauriel'?`${fighter.tile*50}% 0%`:`${fighter.tile%2*100}% ${Math.floor(fighter.tile/2)*100}%`);}
    if(fighter&&Object.hasOwn(BASE_STATS,fighter.classId)&&['male','female'].includes(fighter.gender))figure.className+=` character ${fighter.gender} ${fighter.classId}`;
    root.classList.toggle('combat-empty',!fighter);
    const hp=fighter?(fighter.hp??fighter.maxHp):0,bar=root.querySelector('progress');
    bar.max=fighter?.maxHp||1;bar.value=hp;bar.setAttribute('aria-label',fighter?`Życie: ${fighter.name}`:'Życie przeciwnika — brak danych');
    root.querySelector('.combat-health strong').textContent=fighter?`${hp} / ${fighter.maxHp}`:'— / —';
    const mana=root.querySelector('.combat-mana');mana.hidden=fighter?.classId!=='mage';
    if(!mana.hidden){
      const resource=manaInfo(fighter),bar=mana.querySelector('progress');bar.max=resource.max||1;bar.value=resource.current;bar.setAttribute('aria-label',`Mana: ${fighter.name}`);mana.querySelector('strong').textContent=`${resource.current} / ${resource.max}`;
    }
    root.querySelectorAll('dd').forEach((el,i)=>{el.textContent=fighter?.stats?.[i]??'—';});
  }
  function renderBattle(root,battle){
    for(const side of ['hero','enemy']){
      const card=root.querySelector(`[data-fighter="${side}"]`);
      renderFighter(card,battle[side]);
      card.classList.toggle('casting-fireball',battle.lastHit?.actor===side&&battle.lastHit?.ability==='fireball');
      card.classList.toggle('combat-attacking',!battle.winner&&battle.lastHit?.actor===side);
      card.classList.toggle('combat-struck',battle.lastHit?.target===side);
      card.querySelector('.combat-damage').textContent=battle.lastHit?.target===side?`−${battle.lastHit.damage}`:'';
    }
    root.querySelector('.combat-round').textContent=battle.winner?(battle.winner==='hero'?'Zwycięstwo':'Porażka'):`Tura ${Math.floor(battle.hits/2)+1}`;
    root.querySelector('.combat-status').textContent=battle.winner?'Walka zakończona.':battle.lastHit?`${battle[battle.lastHit.actor].name} ${battle.lastHit.ability==='fireball'?'rzuca Kulę ognia (−10 many) i zadaje':battle.lastHit.ability==='wand'?'atakuje różdżką i zadaje':'zadaje'} ${battle.lastHit.damage} obrażeń.`:'Przeciwnicy stają naprzeciw siebie.';
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
    return '<p class="combat-availability">Potwory podstawowe: poziomy postaci 1–5. Szeptun drzewny i Demonica Puszczy w Mrocznym Lesie: poziomy postaci 5–15. Brand przydziela przeciwnika automatycznie. Podgląd jest bezpłatny.</p><p class="combat-entry-error" role="status"></p>';
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
      dialog.querySelector('.combat-top>div>span').textContent=fight?.source==='tauriel'?'Tauriel · Przepędź nieproszonych gości':'Dowódca Brand · Walka z potworami';
      dialog.querySelector('[data-close-combat]').setAttribute('aria-label',fight?.source==='tauriel'?'Wróć do Tauriel':'Wróć do Branda');
      dialog.querySelector('.combat-bottom>small').textContent=fight?.source==='tauriel'?'Misja Tauriel · Bez kosztu energii':fight?`Koszt misji: ${fight.cost??5} energii · Opłacono przy rozpoczęciu`:'Wybierz zlecenie u Branda.';
      const sceneId=fight?.sceneId||offer?.sceneId||'forest',scene=fight?.source==='tauriel'?{image:'tavern-upstairs.webp',short:'Górne piętro · Barykada'}:window.BrandMissions.SCENES[sceneId];
      dialog.querySelector('.combat-stage').style.setProperty('--combat-art',`url("${scene.image}")`);
      dialog.querySelector('#combat-location').textContent=scene.short;
      if(fight){
        renderBattle(dialog,fight.battle);shownId=fight.id;
        action.textContent=fight.battle.winner?'Zgłoś wynik walki':'Przewiń walkę';action.disabled=busy;
        action.dataset.action=fight.battle.winner?'finish':'skip';action.dataset.fightId=fight.id;
      }else{
        const enemy=availableOpponents(hero,sceneId).find(m=>m.id===offer?.enemyId);
        renderFighter(dialog.querySelector('[data-fighter="hero"]'),profile(hero));
        renderFighter(dialog.querySelector('[data-fighter="enemy"]'),enemy);
        dialog.querySelector('.combat-round').textContent='Przygotowanie do walki';
        const rewardText=enemy?.reward?`Nagroda za zwycięstwo: ${enemy.reward.gold} złota · ${enemy.reward.xp} EXP`:'Nagroda za zwycięstwo: 10–30 złota · 33–55 EXP';
        dialog.querySelector('.combat-status').textContent=enemy?rewardText+(hero.classId==='mage'?' · Kula ognia: 10 many za uderzenie. Bez many: atak różdżką.':''):eligible(hero)?'Brak dostępnych przeciwników.':'Brak potworów dostępnych na Twoim poziomie.';
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
      if(busy)return;const intent=action.dataset.action,id=action.dataset.fightId,isQuest=state.read().activeCombat?.source==='tauriel';busy=true;action.disabled=true;
      try{
        const next=await locked(()=>state.update(hero=>intent==='skip'?skip(hero,id):intent==='finish'?finish(hero,id):start(hero)));
        if(disposed)return;
        if(intent==='finish'||intent==='skip'){
          dialog.close();shownId=null;
          if(isQuest){state.onQuestResolved?.(next);return;}
          if(next.lastCombat.won)window.TavernPanel.showReward(next.lastCombat,window.Progression.level(next));
          else{dialog.querySelector('.combat-status').textContent='Porażka. Nie otrzymujesz nagrody.';render(next);dialog.querySelector('.combat-status').textContent='Porażka. Nie otrzymujesz nagrody.';dialog.showModal();}
        }else{busy=false;render(next);}
      }catch(error){if(!disposed)dialog.querySelector('.combat-status').textContent=error.message;}
      finally{busy=false;if(!disposed){const current=state.read();action.disabled=current.activeCombat?false:!current.combatOffer?.enemyId||!eligible(current);}}
    }
    function click(e){if(e.target.closest('[data-close-combat]'))dialog.close();else if(e.target.closest('.combat-actions button'))void act();}
    dialog.addEventListener('click',click);timer=setInterval(update,500);
    const dispose=()=>{disposed=true;clearInterval(timer);dialog.removeEventListener('click',click);if(dialog.open)dialog.close();dialog.remove();};
    dispose.open=preview;
    return dispose;
  }
  window.BrandCombat={FIREBALL,manaInfo,profile,opponents,availableOpponents,drawLocation,createBattle,advance,play,mount,prepare,start,tick,skip,finish};
})();
