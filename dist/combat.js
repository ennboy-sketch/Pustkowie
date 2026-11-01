'use strict';
(() => {
  const BASE_STATS={warrior:[12,5,3,10],mage:[3,5,12,6],elf:[5,12,4,7],dwarf:[10,3,4,12]};
  const LABELS=['Siła','Zręczność','Inteligencja','Wytrzymałość'];
  // Each location will receive its own opponents later. No sample monsters ship in the game.
  const ROSTERS=Object.freeze({forest:Object.freeze([]),mine:Object.freeze([]),undercity:Object.freeze([])});
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
    return '<p class="combat-availability">Brand wyznacza teren walki automatycznie. Potwory pojawią się później. Podgląd nie kosztuje energii.</p><p class="combat-entry-error" role="status"></p>';
  }
  function mount(container,state){
    container.innerHTML=markup();
    const dialog=document.createElement('dialog');
    dialog.className='combat-dialog';dialog.setAttribute('aria-labelledby','combat-location');
    dialog.innerHTML=`<div class="combat-stage"><div class="combat-top"><div><span>Dowódca Brand · Walka z potworami</span><h2 id="combat-location"></h2></div><button type="button" data-close-combat aria-label="Wróć do Branda">×</button></div><div class="combat-battlefield"><div class="combat-round">Przygotowanie do walki</div><div class="combat-fighters">${fighterMarkup('hero')}<span class="combat-versus" aria-hidden="true">⚔</span>${fighterMarkup('enemy')}</div></div><div class="combat-bottom"><p class="combat-status" role="status" aria-live="polite"></p><div class="combat-actions"><button type="button" class="primary" disabled>Walka niedostępna</button></div><small>Rozpoczęcie misji: 5 energii · Podgląd jest bezpłatny</small></div></div>`;
    document.body.append(dialog);
    let disposed=false,busy=false;
    async function preview(){
      if(disposed||busy)return;
      busy=true;
      try{
        const assign=()=>{
          const current=state.read();
          if(current.activeMission)throw new Error('Najpierw zakończ aktywny zwiad.');
          if(current.combatOffer){opponents(current.combatOffer.sceneId);return current;}
          return state.update(hero=>{
            if(hero.activeMission)throw new Error('Najpierw zakończ aktywny zwiad.');
            if(hero.combatOffer){opponents(hero.combatOffer.sceneId);return hero;}
            return {...hero,combatOffer:{sceneId:drawLocation()}};
          });
        };
        const hero=navigator.locks?await navigator.locks.request('pustkowie-hero-v2',assign):assign();
        if(disposed)return;
        const id=hero.combatOffer.sceneId,scene=window.BrandMissions.SCENES[id];
        opponents(id);
        dialog.querySelector('.combat-stage').style.setProperty('--combat-art',`url("${scene.image}")`);
        dialog.querySelector('#combat-location').textContent=scene.short;
        renderFighter(dialog.querySelector('[data-fighter="hero"]'),profile(hero));
        renderFighter(dialog.querySelector('[data-fighter="enemy"]'),null);
        dialog.querySelector('.combat-status').textContent=`${scene.short} — na tym terenie nie ma jeszcze dostępnych potworów.`;
        if(!dialog.open)dialog.showModal();
      }catch(error){if(!disposed)container.querySelector('.combat-entry-error').textContent=error.name==='QuotaExceededError'||error.name==='SecurityError'?'Nie udało się zapisać terenu walki. Spróbuj ponownie.':error.message;if(dialog.open)dialog.close();}
      finally{busy=false;}
    }
    function click(e){if(e.target.closest('[data-close-combat]'))dialog.close();}
    dialog.addEventListener('click',click);
    const dispose=()=>{disposed=true;dialog.removeEventListener('click',click);if(dialog.open)dialog.close();dialog.remove();};
    dispose.open=preview;
    return dispose;
  }
  window.BrandCombat={profile,opponents,drawLocation,createBattle,advance,play,mount};
})();
