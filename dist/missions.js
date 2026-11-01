'use strict';
(() => {
  const COST=5;
  const REWARDS={1:{xp:[5,11],gold:[3,5]},5:{xp:[25,44],gold:[7,15]},10:{xp:[77,101],gold:[17,33]},15:{xp:[125,200],gold:[50,100]}};
  function randomInt(min,max){const range=max-min+1,limit=4294967296-(4294967296%range),value=new Uint32Array(1);do{crypto.getRandomValues(value);}while(value[0]>=limit);return min+value[0]%range;}
  function rollReward(duration){const r=REWARDS[duration];if(!r)throw new Error('Nieznany czas misji.');return{xp:randomInt(...r.xp),gold:randomInt(...r.gold)};}
  function validReward(reward,duration){const r=REWARDS[duration];return !!r&&!!reward&&Number.isSafeInteger(reward.xp)&&reward.xp>=r.xp[0]&&reward.xp<=r.xp[1]&&Number.isSafeInteger(reward.gold)&&reward.gold>=r.gold[0]&&reward.gold<=r.gold[1];}
  const SCENES={
    forest:{name:'Zwiad w Mrocznym Lesie',short:'Mroczny Las',image:'scout-forest.webp',description:'Nad Mrocznym Lasem gęstnieje mgła. Między splątanymi korzeniami szukasz śladów i obserwujesz trakt, wsłuchując się w trzask gałęzi. Brand czeka na wieści z tej zapomnianej drogi.'},
    mine:{name:'Przeszukiwanie Starej Kopalni',short:'Stara Kopalnia',image:'scout-mine.webp',description:'W Starej Kopalni powietrze pachnie wilgocią i rdzą. Przy świetle latarni sprawdzasz porzucone tory oraz boczne chodniki. Każdy krok odbija się echem pod spróchniałymi belkami.'},
    undercity:{name:'Sprawdzanie Podziemi Miasta',short:'Podziemia Miasta',image:'scout-undercity.webp',description:'Pod ulicami miasta płynie ciemna woda. Mijasz zardzewiałe kraty i porośnięte mchem schody, szukając przejść pod Zamkiem Czarnej Stali. Z oddali dochodzi miarowy odgłos kapiącej wody.'}
  };
  function drawScene(){const ids=Object.keys(SCENES),random=new Uint32Array(1),limit=4294967296-(4294967296%ids.length);do{crypto.getRandomValues(random);}while(random[0]>=limit);return ids[random[0]%ids.length];}
  function minutes(level) {
    if(!Number.isSafeInteger(level)||level<1||level>25)return null;
    return level>=15?15:level>=8?10:level>=3?5:1;
  }
  function durationFor(level,difficulty){const base=minutes(level);if(!base||difficulty!=='hard')return base;const times=[1,5,10,15];return times[Math.min(3,times.indexOf(base)+1)];}
  const heroLevel=h=>Number.isSafeInteger(h.level)&&h.level>0?h.level:1;
  function active(hero) {
    const m=hero.activeMission;
    if(!m)return null;
    if((m.reward!==undefined&&!validReward(m.reward,m.durationMs/60000))||(m.sceneId!==undefined&&!Object.hasOwn(SCENES,m.sceneId))||m.type!=='scout'||!Number.isSafeInteger(m.startedAt)||!Number.isSafeInteger(m.endsAt)||m.startedAt<0||!Number.isSafeInteger(m.durationMs)||m.durationMs!==durationFor(m.levelAtStart,m.difficulty)*60000||m.endsAt-m.startedAt!==m.durationMs||!minutes(m.levelAtStart))throw new Error('Zapis aktywnej misji jest niezgodny. Nie rozpoczynaj nowej misji przed naprawą zapisu.');
    return m;
  }
  function status(hero,now=Date.now()) {
    const mission=active(hero),duration=minutes(heroLevel(hero));
    return {mission,minutes:duration,energy:window.EnergyCycle.info(hero,now).energy,level:heroLevel(hero),remaining:mission?Math.max(0,mission.endsAt-now):0,ready:!!mission&&now>=mission.endsAt};
  }
  function start(hero,now=Date.now(),draw=drawScene,roll=rollReward,options={}) {
    const cost=options.cost??COST;if(![3,5].includes(cost))throw new Error('Nieprawidłowy koszt misji.');
    hero=window.EnergyCycle.apply(hero,now);
    if(hero.activeCombat)throw new Error('Najpierw zakończ walkę z potworem.');
    if(active(hero))throw new Error('Najpierw zakończ obecny zwiad.');
    const level=heroLevel(hero),duration=durationFor(level,options.difficulty);
    if(!duration)throw new Error('Zwiad powyżej poziomu 25 ustalimy później.');
    if(hero.energy<cost)throw new Error(`Potrzebujesz ${cost} punktów energii.`);
    const sceneId=draw();if(!Object.hasOwn(SCENES,sceneId))throw new Error('Nieznane miejsce zwiadu.');
    const reward=roll(duration);if(!validReward(reward,duration))throw new Error('Nieprawidłowa nagroda zwiadu.');
    return {...hero,energy:hero.energy-cost,brandOffers:null,activeMission:{cost,difficulty:options.difficulty||null,type:'scout',sceneId,reward:{xp:reward.xp,gold:reward.gold},levelAtStart:level,durationMs:duration*60000,startedAt:now,endsAt:now+duration*60000}};
  }
  function finish(hero,now=Date.now(),roll=rollReward) {
    const mission=active(hero);
    if(!mission)throw new Error('Nie masz aktywnego zwiadu.');
    if(now<mission.endsAt)throw new Error('Zwiad jeszcze trwa.');
    const reward=mission.reward||roll(mission.durationMs/60000);
    if(!validReward(reward,mission.durationMs/60000))throw new Error('Nieprawidłowa nagroda zwiadu.');
    const gold=(Number.isSafeInteger(hero.gold)&&hero.gold>=0?hero.gold:25)+reward.gold;
    if(!Number.isSafeInteger(gold))throw new Error('Nie można zapisać tak dużej ilości złota.');
    const progressed=window.Progression.award(hero,reward.xp);
    return {...progressed,gold,activeMission:null,lastScout:{...mission,reward:{xp:reward.xp,gold:reward.gold},reportedAt:now,rewardClaimed:true,levelsGained:progressed.level-window.Progression.level(hero)}};
  }
  function markup() {
    return `<div class="mission-tabs" role="tablist" aria-label="Rodzaj misji"><button type="button" role="tab" id="scout-tab" data-mission-tab="scout" aria-selected="true" aria-controls="scout-panel">Zwiad czasowy</button><button type="button" role="tab" id="combat-tab" data-mission-tab="combat" aria-selected="false" aria-controls="combat-panel" tabindex="-1">Walka z potworami</button></div><section id="scout-panel" role="tabpanel" aria-labelledby="scout-tab"><div class="scout-scene"><div class="scout-heading"><span class="rpg-icon icon-journal" aria-hidden="true"></span><div><h3>Zwiad</h3><p class="scout-duration"></p><p class="scout-cost"></p><p class="scout-reward-preview"></p></div></div><div class="scout-offers"><div class="scout-offer-grid">${Object.entries(SCENES).map(([id,scene])=>`<div class="scout-offer"><img src="${scene.image}" alt="" loading="lazy"><strong>${scene.short}</strong></div>`).join('')}</div></div><p class="scout-narrative">Przed murami Zamku Czarnej Stali zapada mgła. Rozglądasz się uważnie, obserwując ścieżki i nasłuchując odgłosów dochodzących z lasu.</p><div class="scout-progress" hidden><div><span class="scout-phase"></span><strong class="scout-clock" role="timer" aria-label="Pozostały czas zwiadu"></strong></div><progress aria-label="Postęp zwiadu" max="1" value="0"></progress></div><button type="button" class="primary" data-scout-action></button></div><p class="mission-message" role="status" aria-live="polite"></p><p class="scout-history" hidden>Ostatni zwiad został zakończony.</p><p class="mission-note">Nagroda EXP i złota zależy od czasu zwiadu. Rozpoczęcie kosztuje 5 energii. Nagrodę otrzymasz po zgłoszeniu powrotu.</p></section><section id="combat-panel" role="tabpanel" aria-labelledby="combat-tab" hidden><div class="combat-service"></div></section>`;
  }
  function mount(container,state) {
    container.innerHTML=markup();
    const $=s=>container.querySelector(s);
    const stopCombat=window.BrandCombat.mount($('.combat-service'),state);
    let disposed=false,busy=false,message='',leaving=false,actionError=false;
    function refresh() {
      if(disposed)return;
      container.classList.toggle('scout-has-error',actionError);
      try {
        const hero=state.read(),s=status(hero),button=$('[data-scout-action]');
        if(container.classList.contains('scout-active-view')&&!s.mission){if(!leaving){leaving=true;queueMicrotask(()=>{if(!disposed)state.onFinished?.();});}return;}
        container.classList.toggle('scout-ready',s.ready);
        const location=s.mission?.sceneId,scene=location?SCENES[location]:null;
        const key=scene?location:s.mission?'legacy':'preview';
        if($('.scout-scene').dataset.location!==key){$('.scout-scene').dataset.location=key;$('.scout-scene').style.setProperty('--scout-art',`url("${scene?.image||'town.webp'}")`);}
        $('.scout-heading h3').textContent=scene?scene.name:s.mission?'Zwiad':'Losowy zwiad';
        $('.scout-narrative').textContent=scene?scene.description:s.mission?'Trwa wcześniej rozpoczęty zwiad. Zgłoś powrót po upływie czasu.':'Dowódca Brand wyznaczy jedno z trzech miejsc: Mroczny Las, Starą Kopalnię lub Podziemia Miasta.';
        $('.scout-offers').hidden=!!s.mission;
        $('.scout-duration').textContent=s.mission?`Czas przyjętego zwiadu: ${s.mission.durationMs/60000} min`:s.minutes?`Twój poziom: ${s.level} · Czas: ${s.minutes} min`:`Twój poziom: ${s.level} · Czas powyżej 25. poziomu do ustalenia`;
        $('.scout-cost').textContent=`${s.mission?'Koszt został pobrany przy rozpoczęciu':'Koszt: 5 energii'} · Energia: ${s.energy} / 100`;
        const range=REWARDS[s.mission?s.mission.durationMs/60000:s.minutes];
        $('.scout-reward-preview').textContent=range?`Nagroda: ${range.xp[0]}–${range.xp[1]} EXP · ${range.gold[0]}–${range.gold[1]} złota`:'';
        $('.scout-progress').hidden=!s.mission;
        if(s.mission){const sec=Math.ceil(s.remaining/1000);$('.scout-clock').textContent=`${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;$('.scout-phase').textContent=s.ready?'Zwiad zakończony':'Zwiad trwa';const progress=$('.scout-progress progress');progress.max=s.mission.durationMs;progress.value=Math.min(s.mission.durationMs,Math.max(0,Date.now()-s.mission.startedAt));}
        button.dataset.missionAction=s.mission?'finish':'start';
        button.dataset.missionStartedAt=s.mission?String(s.mission.startedAt):'';
        button.dataset.missionEndsAt=s.mission?String(s.mission.endsAt):'';
        button.disabled=busy||(!s.mission&&(!s.minutes||s.energy<COST))||(!!s.mission&&!s.ready);
        button.textContent=busy?'Zapisywanie…':s.ready?'Zgłoś powrót':s.mission?'Zwiad w toku':!s.minutes?'Czas zwiadu do ustalenia':s.energy<COST?'Brak energii · potrzeba 5':'Rozpocznij zwiad · 5 energii';
        $('.mission-message').textContent=message||(s.ready?'Wróć do Branda i zgłoś zakończenie zwiadu.':'');
        $('.scout-history').hidden=!hero.lastScout||!!s.mission;
        if(hero.lastScout)$('.scout-history').textContent=`Ostatni zwiad: ${SCENES[hero.lastScout.sceneId]?.name||'Zwiad'} — zakończony.${hero.lastScout.reward?` +${hero.lastScout.reward.xp} EXP i ${hero.lastScout.reward.gold} złota.`:''}`;
      } catch(error){container.classList.add('scout-has-error');$('[data-scout-action]').disabled=true;$('.mission-message').textContent='Nie można odczytać aktywnej misji. Odśwież grę i sprawdź zapis postaci.';}
    }
    function selectTab(type){container.querySelectorAll('[data-mission-tab]').forEach(el=>{const selected=el.dataset.missionTab===type;el.setAttribute('aria-selected',String(selected));el.tabIndex=selected?0:-1;});$('#scout-panel').hidden=type!=='scout';$('#combat-panel').hidden=type!=='combat';if(type==='combat')void stopCombat.open();}
    async function act(button) {
      if(busy)return;
      const action=button.dataset.missionAction;
      const expectedStart=Number(button.dataset.missionStartedAt),expectedEnd=Number(button.dataset.missionEndsAt);
      busy=true;message='';actionError=false;refresh();
      try {
        const buyer=state.read();let completed=false;
        const change=()=>state.update(current=>{
          if(current.name!==buyer.name||current.classId!==buyer.classId||current.gender!==buyer.gender)throw new Error('Postać zmieniła się. Otwórz panel ponownie.');
          // Recheck the requested action under the shared save lock.
          if(action==='finish'){if(!current.activeMission||current.activeMission.startedAt!==expectedStart||current.activeMission.endsAt!==expectedEnd)throw new Error('Ta misja została już zakończona lub zmieniła się. Otwórz panel ponownie.');completed=true;return finish(current);}
          if(action!=='start')throw new Error('Odśwież panel misji.');
          return start(current);
        });
        const result=navigator.locks?await navigator.locks.request('pustkowie-hero-v2',change):change();
        message=completed?`Otrzymano ${result.lastScout.reward.xp} EXP i ${result.lastScout.reward.gold} złota.`:'Zwiad rozpoczęty. Możesz zamknąć panel — czas nadal upływa.';
        if(!disposed){if(completed)state.onFinished?.(result.lastScout);else state.onStarted?.();}
      } catch(error){actionError=true;message=error.name==='QuotaExceededError'||error.name==='SecurityError'?'Nie udało się zapisać misji. Spróbuj ponownie.':error.message;}
      finally{busy=false;refresh();}
    }
    function click(e){const tab=e.target.closest('[data-mission-tab]');if(tab){selectTab(tab.dataset.missionTab);return;}const action=e.target.closest('[data-scout-action]');if(action)void act(action);}
    function key(e){const tab=e.target.closest('[data-mission-tab]');if(!tab)return;let type;if(['ArrowLeft','ArrowRight'].includes(e.key))type=tab.dataset.missionTab==='scout'?'combat':'scout';else if(e.key==='Home')type='scout';else if(e.key==='End')type='combat';if(type){e.preventDefault();selectTab(type);container.querySelector(`[data-mission-tab="${type}"]`).focus();}}
    container.addEventListener('click',click);container.addEventListener('keydown',key);refresh();const timer=setInterval(refresh,1000);
    return ()=>{disposed=true;stopCombat();clearInterval(timer);container.removeEventListener('click',click);container.removeEventListener('keydown',key);};
  }
  window.BrandMissions={durationFor,minutes,status,start,finish,mount,COST,SCENES,REWARDS,rollReward};
})();
