'use strict';
(() => {
  const $ = s => document.querySelector(s);
  const ICONS = ['map','tavern','barracks','arena','dungeon','forge','alchemy','market','hero','inventory','journal','guild','coin','shard','energy','help','mount','wheel','castle'];
  const icon = id => `<span class="rpg-icon icon-${ICONS.includes(id) ? id : 'map'}" aria-hidden="true"></span>`;
  const places = {
    map:{name:'Zamek',category:'Świat',icon:'map'},
    hero:{name:'Bohater',category:'Postać',icon:'hero'},
    inventory:{name:'Ekwipunek',category:'Postać',icon:'inventory'},
    journal:{name:'Dziennik',category:'Postać',icon:'journal'},
    tavern:{name:'Karczma',title:'Pod Zgasłą Latarnią',category:'Karczma',icon:'tavern',x:19,y:61,text:'Przy palenisku zbierają się ci, którzy przetrwali noc.',future:'Wyprawy i zlecenia'},
    arena:{name:'Arena',title:'Krąg Żelaza',category:'Walka',icon:'arena',x:81,y:33,text:'Stary kamień pamięta imiona poległych.',future:'Pojedynki'},
    dungeon:{name:'Lochy',title:'Lochy',category:'Walka',icon:'dungeon',x:14,y:14,text:'Za kamienną bramą nawet cisza ma swoją cenę.',future:'Walka z potworami'},
    barracks:{name:'Koszary',title:'Koszary Żelaznej Przysięgi',category:'Profesje',icon:'barracks',x:16,y:35},
    forge:{name:'Kuźnia',title:'Kuźnia Czarnego Żaru',category:'Handel',icon:'forge',x:47,y:22,text:'Ostatni kowal zamku wciąż podtrzymuje ogień.',future:'Broń i pancerze'},
    alchemy:{name:'Alchemiczka',title:'Wieża Zielonego Płomienia',category:'Handel',icon:'alchemy',x:87,y:64,text:'Za zielonymi szybami coś nigdy nie zasypia.',future:'Mikstury'},
    market:{name:'Czarny Targ',title:'Czarny Targ',category:'Handel',icon:'market',x:48,y:76,text:'Każda rzecz ma tu cenę. Każda moneta swoją historię.',future:'Kupno i sprzedaż'},
    guild:{name:'Zamek',title:'Komnaty z Czarnej Stali',category:'Świat',icon:'castle',x:77,y:12},
    wheel:{name:'Koło Losu',title:'Koło Losu',category:'Fontanna Czarnej Stali',icon:'wheel',x:50,y:39},
    glade:{name:'Polana',title:'Polana',category:'Świat',icon:'map',x:65,y:94},
    'glade-path-1':{name:'Lodowe Wzgórza',art:'glade-ice-hills-icon.webp',requiredLevel:75,category:'Polana',icon:'map',text:'W Lodowych Wzgórzach wznosi się zamek krasnoludów. Lokację stworzymy w kolejnym etapie.',future:'Zamek krasnoludów'},
    'glade-path-2':{name:'Eldor',art:'glade-eldor-icon.webp',requiredLevel:10,category:'Polana',icon:'map',text:'Ta ścieżka prowadzi do Eldoru, osady elfów. Eldor będzie lokacją misjową z nowymi postaciami, zadaniami i wyprawami. Mieszkańców i misje dodamy później.',future:'Osada elfów · Misje i wyprawy'},
    'glade-path-3':{name:'Ubocze',art:'glade-ubocze-icon.webp',requiredLevel:30,category:'Polana',icon:'map',text:'Na Uboczu mieści się karczma „Pod złotym Kucem”. Spotkasz tu nowe postacie i otrzymasz nowe misje. Wnętrze, postacie i zadania dodamy później.',future:'Tawerna „Pod złotym Kucem”'},
    mount:{name:'Wierzchowiec',category:'Bohater',icon:'mount'},
    help:{name:'Pomoc',category:'Pustkowie',icon:'help'}
  };
  const HERO_KEY = 'pustkowie.hero.v2';
  const FORGE_LEVEL = 30;
  const DUNGEON_LEVEL = 10;
  // Zachowujemy stałe identyfikatory profesji; nieustalone ścieżki pozostają zablokowane.
  const PROFESSIONS = Object.fromEntries(
    Object.entries({warrior:'arena',mage:'alchemy',elf:'guild',dwarf:'forge'}).map(([classId,symbol]) => [
      classId, [1,2,3].map(slot => ({
        id:`${classId}-profession-${slot}`,
        name:`Profesja ${slot}`,
        role:'Nazwa i umiejętności do ustalenia',
        icon:symbol,
        pending:true
      }))
    ])
  );
  PROFESSIONS.warrior[0]={id:'warrior-profession-1',name:'Palladyn',role:'Święty wojownik walczący wręcz. Może zakładać Święty ekwipunek.',icon:'barracks',pending:false};
  PROFESSIONS.warrior[1]={id:'warrior-profession-2',name:'Rycerz',role:'Wojownik walczący wręcz i obrońca. Pełne odnowienie 100 energii co 6 godzin.',icon:'arena',pending:false};
  PROFESSIONS.mage[0]={id:'mage-profession-1',name:'Nekromanta',role:'Mroczny pocisk: +10% obrażeń poza statystykami. Brak czasu oczekiwania między walkami w lochach.',icon:'dungeon',pending:false};
  PROFESSIONS.mage[1]={id:'mage-profession-2',name:'Alchemik',role:'Tworzenie mikstur i zbieranie ziół — mechaniki dodamy później.',icon:'alchemy',pending:false};
  let hero = null;
  const level = () => window.Progression.level(hero);
  const profession = () => (PROFESSIONS[hero?.classId] || []).find(p=>!p.pending && p.id === hero.profession);
  function updateProfile() {
    const progression=window.Progression.info(hero);
    $('.small-xp i').style.width=`${progression.percent}%`;
    $('.small-xp').setAttribute('role','progressbar');
    $('.small-xp').setAttribute('aria-label',progression.label);
    $('.small-xp').setAttribute('aria-valuemin','0');
    $('.small-xp').setAttribute('aria-valuemax',String(progression.required||1));
    $('.small-xp').setAttribute('aria-valuenow',String(Math.min(progression.xp,progression.required||0)));
    $('.small-xp').title=progression.label;
    const resources = window.BeerService.status(hero);
    $('#gold-balance').textContent = resources.gold;
    const energy=window.EnergyCycle.info(hero);
    $('#energy-balance').textContent = energy.energy;
    $('#energy-reset-clock').textContent = `↻ ${energy.text}`;
    $('#energy-reset-clock').setAttribute('aria-label',`Odnowienie energii za ${energy.text}`);
    $('#shard-balance').textContent = Number.isSafeInteger(hero.shards) && hero.shards >= 0 ? hero.shards : 0;
    $('.avatar .level').textContent = level();
    $('.profile-text small').textContent = `Poziom ${level()}`;
    $('.map-caption small').textContent = `Poziom ${level()}`;
    $('#hero-profession').textContent = profession()?.name || '';
    $('#hero-profession').hidden = !profession();
    for(const [id,requiredLevel] of [['forge',FORGE_LEVEL],['dungeon',DUNGEON_LEVEL]]){
      document.querySelectorAll(`[data-place="${id}"]`).forEach(button=>{
        const name=places[id].name,label=level()<requiredLevel?`${name} · Wymagany poziom ${requiredLevel}`:name;
        button.title=label;button.setAttribute('aria-label',label);
      });
    }
  }
  function readSavedHero() {
    const saved=JSON.parse(localStorage.getItem(HERO_KEY));
    if(!saved || saved.version!==2 || saved.name!==hero.name || saved.classId!==hero.classId || saved.gender!==hero.gender)throw new Error('Zapis postaci zmienił się. Odśwież grę.');
    return saved;
  }
  function readCurrentHero() {
    hero=window.EnergyCycle.apply(readSavedHero());updateProfile();return hero;
  }
  function updateCurrentHero(change) {
    const updated=window.HeroSheet.activatePotion(change(readCurrentHero()));
    localStorage.setItem(HERO_KEY,JSON.stringify(updated));
    hero=updated;updateProfile();return updated;
  }
  let energySyncBusy=false;
  async function refreshEnergy() {
    if(energySyncBusy||!hero||!document.body.classList.contains('playing')||document.hidden)return;
    energySyncBusy=true;
    try {
      const sync=()=>{
        const saved=readSavedHero(),updated=window.HeroSheet.activatePotion(window.EnergyCycle.apply(saved));
        if(updated!==saved)localStorage.setItem(HERO_KEY,JSON.stringify(updated));
        hero=updated;updateProfile();
        if(updated.lootInventory!==saved.lootInventory)window.dispatchEvent(new Event('pustkowie-equipment-updated'));
      };
      if(navigator.locks)await navigator.locks.request('pustkowie-hero-v2',sync);else sync();
    } catch {$('#energy-reset-clock').textContent='Zapis niedostępny';}
    finally {energySyncBusy=false;}
  }
  setInterval(refreshEnergy,1000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)void refreshEnergy();});
  window.addEventListener('focus',()=>void refreshEnergy());
  window.addEventListener('storage',e=>{if(e.key===HERO_KEY)void refreshEnergy();});
  function professionTeacher(){return ['warrior','dwarf'].includes(hero.classId)?'gabriel':hero.classId==='mage'?'alchemist':hero.classId==='elf'?'elven':null;}
  function barracksPanel(trainer='gabriel') {
    try{readCurrentHero();}catch{return '<p role="status">Nie można odczytać postaci. Odśwież grę.</p>';}
    const teacher=professionTeacher();
    if(!teacher)return '<p class="place-text">Nauczyciel profesji tej klasy nie jest jeszcze dostępny.</p>';
    if(teacher!==trainer)return `<p class="place-text">${teacher==='alchemist'?'Mag szkoli się w profesji u Alchemiczki w Wieży Zielonego Płomienia.':teacher==='elven'?'Elf szkoli się u Lyrien w Komnacie Leśnej Przysięgi w głównym zamku. Wejdź do Zamku, a następnie przez lewe drzwi w przedsionku.':'Wojownik i Krasnolud szkolą się w profesji u Paladyna Gabriela w koszarach.'}</p>`;
    const unlocked = level() >= 10;
    const current = profession();
    const canChoose = unlocked && PROFESSIONS[hero.classId].some(p=>!p.pending);
    return `<div class="barracks-banner">${icon(trainer==='alchemist'?'alchemy':trainer==='elven'?'guild':'barracks')}<div><h3>Wybierz swoją profesję</h3><p>${unlocked ? 'Poziom wymagany do wyboru został osiągnięty.' : 'Wybór odblokuje się na 10. poziomie.'}</p></div></div>
      <div class="profession-unlock"><div><span>${unlocked ? 'Wymagany poziom osiągnięty' : 'Wymagany poziom 10'}</span><b>Twój poziom: ${level()}</b></div><progress max="10" value="${Math.min(level(),10)}" aria-label="Postęp do odblokowania profesji"></progress></div>
      ${current ? `<p class="current-profession">Obecna profesja: <strong>${current.name}</strong></p>` : ''}
      <form id="profession-form" data-profession-trainer="${trainer}"><fieldset ${canChoose ? '' : 'disabled'}><legend class="sr-only">Profesje dla twojej klasy</legend><div class="profession-grid">${PROFESSIONS[hero.classId].map(p=>`<label class="profession-card"><input type="radio" name="profession" value="${p.id}" ${current?.id===p.id ? 'checked' : ''} ${p.pending ? 'disabled' : ''} required><span class="profession-symbol">${icon(p.icon)}</span><strong>${p.name}</strong><span class="profession-role">${p.role}</span><span class="profession-state">${p.pending ? 'Do ustalenia' : unlocked ? 'Dostępna' : 'Od poziomu 10'}</span></label>`).join('')}</div><button type="submit" class="primary profession-submit">${unlocked ? canChoose ? current ? 'Zmień profesję' : 'Wybierz profesję' : 'Profesje w przygotowaniu' : 'Odblokowanie na poziomie 10'}</button></fieldset><p id="profession-status" role="status" aria-live="polite"></p></form><p class="panel-note">${trainer==='alchemist'?'Nauczyciel: Alchemiczka.':trainer==='elven'?'Miejsce szkolenia: Komnata Leśnej Przysięgi w Zamku Czarnej Stali. Nauczycielka: Lyrien.':'Nauczyciel: Paladyn Gabriel.'} Szkolenie od poziomu 10. ${hero.classId==='warrior'?'Palladyn i Rycerz są dostępni. Trzecia profesja pozostaje do ustalenia.':hero.classId==='mage'?'Nekromanta i Alchemik są dostępni. Tworzenie mikstur, zioła i trzecia profesja pozostają do ustalenia.':'Nazwy i umiejętności profesji ustalimy później.'}</p>`;
  }
  const labels = ['Siła','Zręczność','Inteligencja','Wytrzymałość'];
  function toggleMenu(open) {
    $('#sidebar').classList.toggle('is-open',open);
    $('#sidebar-scrim').hidden = !open;
    $('#menu-toggle').setAttribute('aria-expanded',String(open));
  }
  let stopActiveScout=()=>{};
  let stopHeroSheet=()=>{};
  let stopDungeons=()=>{};
  let stopCastle=()=>{};
  let worldLocation='map',townPosition=null;
  function showWorld(id){
    const view=$('.world-viewport'),map=$('#town-map'),glade=id==='glade';
    if(glade&&worldLocation==='map')townPosition={left:view.scrollLeft,top:view.scrollTop};
    worldLocation=id;map.classList.toggle('is-glade',glade);
    $('#settlement-title').textContent=glade?'Polana':'Zamek Czarnej Stali';
    $('.world-kicker').textContent=glade?'ZA MURAMI ZAMKU':'OSTATNIE SCHRONIENIE';
    $('.world-bottom>span').innerHTML=glade?'<i></i> Na leśnej polanie':'<i></i> W bezpiecznym zamku';
    $('.map-caption').innerHTML=`<span>✦</span> ${glade?'Polana':'Zamek Czarnej Stali'} <small>Poziom ${level()}</small>`;
    view.setAttribute('aria-label',glade?'Polana z trzema ścieżkami — przeciągnij, aby przesunąć widok':'Mapa zamku — przeciągnij, aby przesunąć widok');
    $('#map-pins').innerHTML=glade?[[1,16,36],[2,51.3,16],[3,78,35]].map(([n,x,y])=>`<button type="button" class="map-pin glade-path ${level()<places['glade-path-'+n].requiredLevel?'is-locked':''}" aria-label="${places['glade-path-'+n].name} · Od poziomu ${places['glade-path-'+n].requiredLevel}" data-place="glade-path-${n}" style="--x:${x}%;--y:${y}%"><span class="pin-medallion"><img class="glade-path-art" src="${places['glade-path-'+n].art}" alt="" width="64" height="64" draggable="false"></span><span class="pin-label">${places['glade-path-'+n].name}</span><span class="glade-level">Od poziomu ${places['glade-path-'+n].requiredLevel}</span></button>`).join('')+'<button type="button" class="map-pin glade-return" data-place="map" style="--x:50%;--y:86%"><span class="pin-medallion">'+icon('castle')+'</span><span class="pin-label">Powrót do zamku</span></button>':townPins();
    window.SceneZoom?.reset(view);
    requestAnimationFrame(()=>{view.scrollLeft=glade?Math.max(0,(view.scrollWidth-view.clientWidth)/2):townPosition?.left??Math.max(0,(view.scrollWidth-view.clientWidth)/2);view.scrollTop=glade?Math.max(0,(view.scrollHeight-view.clientHeight)/2):townPosition?.top??0;});
    $('#place-dialog').close();$('#settlement-title').focus({preventScroll:true});
  }
  function openPlace(id) {
    if (!places[id] || !hero) return;
    if(id==='forge'||id==='dungeon'||places[id].requiredLevel){
      try{readCurrentHero();}
      catch{$('#status').textContent=`Nie można odczytać poziomu postaci. Odśwież grę, aby wejść do ${id==='forge'?'kuźni':id==='dungeon'?'Lochów':places[id].name}.`;return;}
    }
    const forgeLocked=id==='forge'&&level()<FORGE_LEVEL;
    const dungeonLocked=id==='dungeon'&&level()<DUNGEON_LEVEL;
    if(['tavern','hero','inventory','market'].includes(id)){try{readCurrentHero();}catch{}}
    stopActiveScout();stopHeroSheet();stopDungeons();stopCastle();
    window.FateWheel.cancel();
    window.TavernPanel.cancel();
    window.AlchemistPanel.cancel();
    window.ForgePanel.cancel();
    window.BarracksPanel.cancel();window.MarketPanel.cancel();
    toggleMenu(false);
    document.querySelectorAll('.nav-tile').forEach(el => el.setAttribute('aria-current',el.dataset.place === id ? 'page' : 'false'));
    if (id === 'map'||id==='glade') {showWorld(id);return;}
    const place = places[id];
    $('#place-title').textContent = place.title || place.name;
    $('#place-category').textContent = place.category;
    let scouting=false;
    if(id==='tavern'){try{scouting=!!window.BrandMissions.status(hero).mission;}catch{}}
    let content;
    if (place.requiredLevel) {
      const locked=level()<place.requiredLevel;
      content=`<div class="place-emblem"><img class="glade-location-art" src="${place.art}" alt="" width="128" height="128"></div><p class="place-text" role="status">${locked?'Wejście jest zablokowane.':place.text}</p><p class="panel-note">Twój poziom: ${level()} · Wymagany poziom: ${place.requiredLevel}</p><div class="coming-soon"><span>${place.future}</span><span class="state-badge">${locked?'Od poziomu '+place.requiredLevel:'W przygotowaniu'}</span></div>`;
    } else if (id === 'hero') {
      content = '<div class="hero-sheet-root"></div>';
    } else if (id === 'tavern') {
      content = scouting?'<div class="scout-active-view" aria-label="Aktywny zwiad"></div>':window.TavernPanel.markup();
    } else if (id === 'alchemy') {
      content = window.AlchemistPanel.markup();
    } else if (dungeonLocked) {
      content = `<div class="place-emblem">${icon('dungeon')}</div><p class="place-text" role="status">Wejście do Lochów jest dostępne od ${DUNGEON_LEVEL}. poziomu postaci.</p><p class="panel-note">Twój poziom: ${level()} · Wymagany poziom: ${DUNGEON_LEVEL}</p>`;
    } else if (id === 'dungeon') {
      content = window.DungeonsPanel.markup();
    } else if (id === 'forge') {
      content = forgeLocked?`<div class="place-emblem">${icon('forge')}</div><p class="place-text" role="status">Wejście do kuźni jest dostępne od ${FORGE_LEVEL}. poziomu postaci.</p><p class="panel-note">Twój poziom: ${level()} · Wymagany poziom: ${FORGE_LEVEL}</p>`:window.ForgePanel.markup();
    } else if (id === 'market') {
      content = window.MarketPanel.markup();
    } else if (id === 'barracks') {
      content = window.BarracksPanel.markup();
    } else if (id === 'wheel') {
      content = window.FateWheel.markup(hero);
    } else if (id === 'mount') {
      content = window.FateWheel.mountMarkup(readCurrentHero());
    } else if (id === 'guild') {
      content = window.CastlePanel.markup();
    } else if (id === 'inventory') {
      content = '<div class="backpack-root"></div>';
    } else if (id === 'journal') {
      content = `<div class="journal-entry">${icon('journal')}<div><h3>Przybycie do zamku</h3><p>Twoja postać dotarła do Zamku Czarnej Stali.</p><span class="state-badge">Zapisane</span></div></div>`;
    } else if (id === 'help') {
      content = '<p class="place-text">Wybierz miejsce na mapie lub w bocznym menu. Kliknij portret, aby zobaczyć statystyki bohatera.</p><p class="panel-note">Postać zapisuje się w tej przeglądarce. Wyprawy, handel i walka pojawią się w kolejnych etapach.</p>';
    } else {
      content = `<div class="place-emblem">${place.art?`<img class="glade-location-art" src="${place.art}" alt="" width="128" height="128">`:icon(place.icon)}</div><p class="place-text">${place.text}</p><div class="coming-soon"><span>${place.future}</span><span class="state-badge">W przygotowaniu</span></div>`;
    }
    $('#place-content').innerHTML = content;
    if (id === 'guild') stopCastle=window.CastlePanel.mount($('#place-content'),{onTitle:title=>{$('#place-title').textContent=title;},professionMarkup:()=>barracksPanel('elven')});
    if (id === 'hero') stopHeroSheet=window.HeroSheet.mount($('.hero-sheet-root'),{read:readCurrentHero,update:updateCurrentHero});
    if (id === 'inventory') stopHeroSheet=window.HeroSheet.mountBag($('.backpack-root'),{read:readCurrentHero,update:updateCurrentHero});
    if (id === 'dungeon' && !dungeonLocked) stopDungeons=window.DungeonsPanel.mount($('#place-content'),{read:readCurrentHero,update:updateCurrentHero,onTitle:title=>{$('#place-title').textContent=title;}});
    if (id === 'wheel') window.FateWheel.mount($('#place-content'),{read:readCurrentHero,update:updateCurrentHero});
    if (id === 'alchemy') window.AlchemistPanel.mount($('#place-content'),{read:readCurrentHero,update:updateCurrentHero,professionMarkup:()=>barracksPanel('alchemist')});
    if (id === 'forge' && !forgeLocked) window.ForgePanel.mount($('#place-content'));
    if (id === 'market') window.MarketPanel.mount($('#place-content'),{read:readCurrentHero,update:updateCurrentHero});
    if (id === 'barracks') window.BarracksPanel.mount($('#place-content'),{professionMarkup:()=>barracksPanel('gabriel')});
    if(id==='tavern'){
      if(scouting){
        const scene=window.BrandMissions.SCENES[hero.activeMission.sceneId];
        $('#place-title').textContent=scene?.name||'Zwiad';
        stopActiveScout=window.BrandMissions.mount($('.scout-active-view'),{read:readCurrentHero,update:updateCurrentHero,onFinished:completed=>{openPlace('tavern');if(completed?.reward)window.TavernPanel.showReward(completed,level());}});
      }else window.TavernPanel.mount($('#place-content'),{read:readCurrentHero,update:updateCurrentHero,onStarted:()=>{const npc=$('.tavern-npc-dialog');if(npc?.open)npc.close();openPlace('tavern');}});
    }
    const dialog = $('#place-dialog');
    if (!dialog.open) dialog.showModal();
  }
  $('#hub-navigation').innerHTML = [
    ['ŚWIAT',['map','glade','tavern','barracks','arena','dungeon']],
    ['HANDEL',['forge','alchemy','market']],
    ['BOHATER',['hero','inventory','journal','guild','mount']]
  ].map(([name,ids])=>`<div class="nav-group"><h2>${name}</h2><div class="nav-grid">${ids.map(id=>`<button type="button" class="nav-tile" data-place="${id}" aria-current="${id==='map'?'page':'false'}" title="${places[id].name}">${icon(places[id].icon)}<span>${places[id].name}</span></button>`).join('')}</div></div>`).join('');
  function townPins(){return Object.entries(places).filter(([,p])=>p.x).map(([id,p])=>`<button type="button" class="map-pin pin-${id}" data-place="${id}" style="--x:${p.x}%;--y:${p.y}%" aria-label="${p.name}"><span class="pin-medallion">${icon(p.icon)}</span><span class="pin-label">${p.name}</span></button>`).join('');}
  $('#map-pins').innerHTML=townPins();
  $('#ready').addEventListener('click',e=>{const button=e.target.closest('[data-place]');if(button)openPlace(button.dataset.place);});
  $('#place-content').addEventListener('submit', e => {
    if (e.target.id !== 'profession-form') return;
    e.preventDefault();
    const status = $('#profession-status');
    try{readCurrentHero();}catch{status.textContent='Nie można odczytać postaci. Odśwież grę.';return;}
    if(!professionTeacher()||e.target.dataset.professionTrainer!==professionTeacher()){status.textContent='Ta postać szkoli się u innego nauczyciela.';return;}
    if (level() < 10) { status.textContent = 'Wybór profesji wymaga poziomu 10.'; return; }
    if (PROFESSIONS[hero.classId].every(p=>p.pending)) { status.textContent = 'Profesje tej klasy są jeszcze do ustalenia.'; return; }
    const chosen = new FormData(e.target).get('profession');
    if (!PROFESSIONS[hero.classId].some(p=>!p.pending && p.id===chosen)) { status.textContent = 'Wybierz jedną z dostępnych profesji.'; return; }
    const updated = window.EnergyCycle.apply({...hero, level:level(), profession:chosen});
    try {
      const stored = localStorage.getItem(HERO_KEY);
      if (stored) {
        const previous = JSON.parse(stored);
        if (previous.name !== hero.name || previous.classId !== hero.classId || previous.gender !== hero.gender || (Number.isSafeInteger(previous.level) && previous.level > 0 ? previous.level : 1) !== level()) {
          status.textContent = 'Zapis zmienił się w innej karcie. Odśwież grę przed wyborem profesji.'; return;
        }
      }
      localStorage.setItem(HERO_KEY,JSON.stringify(updated));
    } catch { status.textContent = 'Nie udało się zapisać profesji. Sprawdź ustawienia zapisu w przeglądarce.'; return; }
    hero = updated; updateProfile();
    const teacher=professionTeacher();openPlace(teacher==='alchemist'?'alchemy':teacher==='elven'?'guild':'barracks');
    if(teacher==='alchemist')window.AlchemistPanel.openProfessions();else if(teacher==='elven')window.CastlePanel.openSchool();else window.BarracksPanel.openProfessions();
    $('#profession-status').textContent = `Wybrano profesję: ${profession().name}.`;
  });
  $('#place-dialog').addEventListener('close', () => {stopHeroSheet();stopActiveScout();stopDungeons();stopCastle();window.FateWheel.cancel();window.TavernPanel.cancel();window.AlchemistPanel.cancel();window.ForgePanel.cancel();window.BarracksPanel.cancel();window.MarketPanel.cancel();});
  $('#close-place').addEventListener('click',()=>$('#place-dialog').close());
  $('#place-dialog').addEventListener('click',e=>{if(e.target===$('#place-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
  $('#menu-toggle').addEventListener('click',()=>toggleMenu(!$('#sidebar').classList.contains('is-open')));
  $('#close-menu').addEventListener('click',()=>toggleMenu(false));
  $('#sidebar-scrim').addEventListener('click',()=>toggleMenu(false));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')toggleMenu(false);});
  window.mountHub = data => {
    hero = window.EnergyCycle.apply(data);
    updateProfile();
    void refreshEnergy();
    $('#avatar-art').className = `character ${data.gender} ${data.classId}`;
    toggleMenu(false);
    requestAnimationFrame(() => { const view = $('.world-viewport'); view.scrollLeft = Math.max(0,(view.scrollWidth-view.clientWidth)/2); });
    document.querySelectorAll('.nav-tile').forEach(el=>el.setAttribute('aria-current',el.dataset.place==='map'?'page':'false'));
  };
})();
