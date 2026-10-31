'use strict';
(() => {
  const COST=5;
  const SCENES={
    forest:{name:'Zwiad w Mrocznym Lesie',short:'Mroczny Las',image:'scout-forest.webp',description:'Mgła zalega między korzeniami starych drzew. Obserwujesz leśne ścieżki i szukasz śladów prowadzących w głąb Mrocznego Lasu.'},
    mine:{name:'Przeszukiwanie Starej Kopalni',short:'Stara Kopalnia',image:'scout-mine.webp',description:'W opuszczonych chodnikach skrzypią spróchniałe belki. Ostrożnie sprawdzasz dawne tory i boczne tunele Starej Kopalni.'},
    undercity:{name:'Sprawdzanie Podziemi Miasta',short:'Podziemia Miasta',image:'scout-undercity.webp',description:'Pod ulicami miasta ciągną się wilgotne korytarze. Przemierzasz kamienne przejścia i sprawdzasz, dokąd prowadzą stare schody.'}
  };
  function drawScene(){const ids=Object.keys(SCENES),random=new Uint32Array(1),limit=4294967296-(4294967296%ids.length);do{crypto.getRandomValues(random);}while(random[0]>=limit);return ids[random[0]%ids.length];}
  function minutes(level) {
    if(!Number.isSafeInteger(level)||level<1||level>25)return null;
    return level>=15?15:level>=8?10:level>=3?5:1;
  }
  const heroLevel=h=>Number.isSafeInteger(h.level)&&h.level>0?h.level:1;
  function active(hero) {
    const m=hero.activeMission;
    if(!m)return null;
    if((m.sceneId!==undefined&&!Object.hasOwn(SCENES,m.sceneId))||m.type!=='scout'||!Number.isSafeInteger(m.startedAt)||!Number.isSafeInteger(m.endsAt)||m.startedAt<0||!Number.isSafeInteger(m.durationMs)||m.durationMs!==minutes(m.levelAtStart)*60000||m.endsAt-m.startedAt!==m.durationMs||!minutes(m.levelAtStart))throw new Error('Zapis aktywnej misji jest niezgodny. Nie rozpoczynaj nowej misji przed naprawą zapisu.');
    return m;
  }
  function status(hero,now=Date.now()) {
    const mission=active(hero),duration=minutes(heroLevel(hero));
    return {mission,minutes:duration,energy:window.EnergyCycle.info(hero,now).energy,level:heroLevel(hero),remaining:mission?Math.max(0,mission.endsAt-now):0,ready:!!mission&&now>=mission.endsAt};
  }
  function start(hero,now=Date.now(),draw=drawScene) {
    hero=window.EnergyCycle.apply(hero,now);
    if(active(hero))throw new Error('Najpierw zakończ obecny zwiad.');
    const level=heroLevel(hero),duration=minutes(level);
    if(!duration)throw new Error('Zwiad powyżej poziomu 25 ustalimy później.');
    if(hero.energy<COST)throw new Error('Potrzebujesz 5 punktów energii, aby rozpocząć zwiad.');
    const sceneId=draw();if(!Object.hasOwn(SCENES,sceneId))throw new Error('Nieznane miejsce zwiadu.');
    return {...hero,energy:hero.energy-COST,activeMission:{type:'scout',sceneId,levelAtStart:level,durationMs:duration*60000,startedAt:now,endsAt:now+duration*60000}};
  }
  function finish(hero,now=Date.now()) {
    const mission=active(hero);
    if(!mission)throw new Error('Nie masz aktywnego zwiadu.');
    if(now<mission.endsAt)throw new Error('Zwiad jeszcze trwa.');
    return {...hero,activeMission:null,lastScout:{...mission,reportedAt:now}};
  }
  function markup() {
    return `<div class="mission-tabs" role="tablist" aria-label="Rodzaj misji"><button type="button" role="tab" id="scout-tab" data-mission-tab="scout" aria-selected="true" aria-controls="scout-panel">Zwiad czasowy</button><button type="button" role="tab" id="combat-tab" data-mission-tab="combat" aria-selected="false" aria-controls="combat-panel" tabindex="-1">Walka z potworami</button></div><section id="scout-panel" role="tabpanel" aria-labelledby="scout-tab"><div class="scout-scene"><div class="scout-heading"><span class="rpg-icon icon-journal" aria-hidden="true"></span><div><h3>Zwiad</h3><p class="scout-duration"></p><p class="scout-cost"></p></div></div><div class="scout-offers"><span class="scout-offer-label">Brand wylosuje jeden z trzech kierunków</span><div class="scout-offer-grid">${Object.entries(SCENES).map(([id,scene])=>`<div class="scout-offer"><img src="${scene.image}" alt="" loading="lazy"><strong>${scene.short}</strong></div>`).join('')}</div></div><p class="scout-narrative">Przed murami Zamku Czarnej Stali zapada mgła. Rozglądasz się uważnie, obserwując ścieżki i nasłuchując odgłosów dochodzących z lasu.</p><div class="scout-progress" hidden><div><span class="scout-phase"></span><strong class="scout-clock" role="timer" aria-label="Pozostały czas zwiadu"></strong></div><progress aria-label="Postęp zwiadu" max="1" value="0"></progress></div><button type="button" class="primary" data-scout-action></button></div><p class="mission-message" role="status" aria-live="polite"></p><p class="scout-history" hidden>Ostatni zwiad został zakończony.</p><details class="scout-times"><summary>Czas zwiadu według poziomu</summary><ul><li>Poziom 1–2: 1 minuta</li><li>Poziom 3–7: 5 minut</li><li>Poziom 8–14: 10 minut</li><li>Poziom 15–25: 15 minut</li></ul></details><p class="mission-note">Szczegóły zleceń i nagrody ustalimy później. Rozpoczęcie zwiadu kosztuje 5 energii. Zgłoszenie powrotu nie pobiera jej ponownie.</p></section><section id="combat-panel" role="tabpanel" aria-labelledby="combat-tab" hidden><div class="combat-placeholder"><span class="rpg-icon icon-arena" aria-hidden="true"></span><h3>Walka z potworami</h3><p>Potwory i zasady tych misji ustalimy później. Planowany koszt misji: 5 energii.</p><span class="state-badge">W przygotowaniu</span></div></section>`;
  }
  function mount(container,state) {
    container.innerHTML=markup();
    const $=s=>container.querySelector(s);
    let disposed=false,busy=false,message='',leaving=false;
    function refresh() {
      if(disposed)return;
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
        $('.scout-progress').hidden=!s.mission;
        if(s.mission){const sec=Math.ceil(s.remaining/1000);$('.scout-clock').textContent=`${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;$('.scout-phase').textContent=s.ready?'Zwiad zakończony':'Zwiad trwa';const progress=$('.scout-progress progress');progress.max=s.mission.durationMs;progress.value=Math.min(s.mission.durationMs,Math.max(0,Date.now()-s.mission.startedAt));}
        button.disabled=busy||(!s.mission&&(!s.minutes||s.energy<COST))||(!!s.mission&&!s.ready);
        button.textContent=busy?'Zapisywanie…':s.ready?'Zgłoś powrót':s.mission?'Zwiad w toku':!s.minutes?'Czas zwiadu do ustalenia':s.energy<COST?'Brak energii · potrzeba 5':'Rozpocznij zwiad · 5 energii';
        $('.mission-message').textContent=message||(s.ready?'Wróć do Branda i zgłoś zakończenie zwiadu.':'');
        $('.scout-history').hidden=!hero.lastScout||!!s.mission;
        if(hero.lastScout)$('.scout-history').textContent=`Ostatni zwiad: ${SCENES[hero.lastScout.sceneId]?.name||'Zwiad'} — zakończony.`;
      } catch(error){$('[data-scout-action]').disabled=true;$('.mission-message').textContent='Nie można odczytać aktywnej misji. Odśwież grę i sprawdź zapis postaci.';}
    }
    function selectTab(type){container.querySelectorAll('[data-mission-tab]').forEach(el=>{const selected=el.dataset.missionTab===type;el.setAttribute('aria-selected',String(selected));el.tabIndex=selected?0:-1;});$('#scout-panel').hidden=type!=='scout';$('#combat-panel').hidden=type!=='combat';}
    async function act() {
      if(busy)return;
      busy=true;message='';refresh();
      try {
        const buyer=state.read();let completed=false;
        const change=()=>state.update(current=>{
          if(current.name!==buyer.name||current.classId!==buyer.classId||current.gender!==buyer.gender)throw new Error('Postać zmieniła się. Otwórz panel ponownie.');
          // Recheck the requested action under the shared save lock.
          if(buyer.activeMission){if(!current.activeMission||current.activeMission.startedAt!==buyer.activeMission.startedAt||current.activeMission.endsAt!==buyer.activeMission.endsAt)throw new Error('Aktywna misja zmieniła się. Otwórz panel ponownie.');completed=true;return finish(current);}
          return start(current);
        });
        if(navigator.locks)await navigator.locks.request('pustkowie-hero-v2',change);else change();
        message=completed?'Powrót zgłoszony. Nagrody dodamy w późniejszym etapie.':'Zwiad rozpoczęty. Możesz zamknąć panel — czas nadal upływa.';
        if(!disposed){if(completed)state.onFinished?.();else state.onStarted?.();}
      } catch(error){message=error.name==='QuotaExceededError'||error.name==='SecurityError'?'Nie udało się zapisać misji. Spróbuj ponownie.':error.message;}
      finally{busy=false;refresh();}
    }
    function click(e){const tab=e.target.closest('[data-mission-tab]');if(tab){selectTab(tab.dataset.missionTab);return;}if(e.target.closest('[data-scout-action]'))void act();}
    function key(e){const tab=e.target.closest('[data-mission-tab]');if(!tab)return;let type;if(['ArrowLeft','ArrowRight'].includes(e.key))type=tab.dataset.missionTab==='scout'?'combat':'scout';else if(e.key==='Home')type='scout';else if(e.key==='End')type='combat';if(type){e.preventDefault();selectTab(type);container.querySelector(`[data-mission-tab="${type}"]`).focus();}}
    container.addEventListener('click',click);container.addEventListener('keydown',key);refresh();const timer=setInterval(refresh,1000);
    return ()=>{disposed=true;clearInterval(timer);container.removeEventListener('click',click);container.removeEventListener('keydown',key);};
  }
  window.BrandMissions={minutes,status,start,finish,mount,COST,SCENES};
})();
