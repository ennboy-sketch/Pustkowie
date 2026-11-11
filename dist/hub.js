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
    'skin-house':{name:'Dom Tysiąca Twarzy',title:'Dom Tysiąca Twarzy',category:'Pracownia wyglądu',icon:'market',x:64,y:81},
    guild:{name:'Zamek',title:'Komnaty z Czarnej Stali',category:'Świat',icon:'castle',x:77,y:12},
    wheel:{name:'Koło Losu',title:'Koło Losu',category:'Fontanna Czarnej Stali',icon:'wheel',x:50,y:39},
    glade:{name:'Polana',title:'Polana',category:'Świat',icon:'map',x:65,y:94},
    'glade-path-1':{name:'Lodowe Wzgórza',art:'glade-ice-hills-icon.webp',requiredLevel:75,category:'Polana',icon:'map',text:'W Lodowych Wzgórzach wznosi się zamek krasnoludów. Lokację stworzymy w kolejnym etapie.',future:'Zamek krasnoludów'},
    'glade-path-2':{name:'Eldor',art:'glade-eldor-icon.webp',requiredLevel:50,category:'Polana',icon:'map',text:'Ta ścieżka prowadzi do Eldoru, osady elfów. Eldor będzie lokacją misjową z nowymi postaciami, zadaniami i wyprawami. Mieszkańców i misje dodamy później.',future:'Osada elfów · Misje i wyprawy'},
    'glade-path-3':{name:'Ubocze',art:'glade-ubocze-icon.webp',requiredLevel:30,category:'Polana',icon:'map',text:'Na Uboczu mieści się karczma „Pod złotym Kucem”. Spotkasz tu nowe postacie i otrzymasz nowe misje. Wnętrze, postacie i zadania dodamy później.',future:'Tawerna „Pod złotym Kucem”'},
    'ubocze-tavern':{name:'Pod Złotym Kucem',title:'Karczma „Pod Złotym Kucem”',requiredLevel:30,category:'Ubocze',icon:'tavern',art:'glade-ubocze-icon.webp',text:'Przydrożna karczma z ciepłym piecem kaflowym i drewnianą salą.',future:'Nowe postacie i misje'},
    'ubocze-path':{name:'Wrota Piekieł',art:'hell-gates-icon.webp',requiredLevel:110,category:'Ubocze',icon:'map',text:'Za mostkiem ścieżka prowadzi do ognistej krainy Wrót Piekieł. W oddali wznosi się zamek zła.',future:'Wrota Piekieł · Kraina zła'},
    'hell-mercenary-camp':{name:'Obóz najemników',requiredLevel:110,category:'Wrota Piekieł',icon:'barracks',art:'mercenary-camp.webp'},
    mount:{name:'Wierzchowiec',category:'Bohater',icon:'mount'},
    help:{name:'Pomoc',category:'Pustkowie',icon:'help'}
  };
  const HERO_KEY = 'pustkowie.hero.v2';
  const FORGE_LEVEL = 30;
  const DUNGEON_LEVEL = 10;
  // Zachowujemy stałe identyfikatory profesji; nieustalone ścieżki pozostają zablokowane.
  const PROFESSIONS = Object.fromEntries(
    Object.entries({warrior:'arena',mage:'alchemy',elf:'guild',dwarf:'forge'}).map(([classId,symbol]) => [
      classId, [1,2].map(slot => ({
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
  PROFESSIONS.elf[0]={id:'elf-profession-1',name:'Zwiadowca',role:'Zużywa o 50% mniej energii podczas walk i płatnych podróży (zwiadów). Może walczyć łukiem lub krótkimi sztyletami.',icon:'arena',pending:false};
  PROFESSIONS.elf[1]={id:'elf-profession-2',name:'Leśna Straż',role:'W przyszłości: specjalny ekwipunek w Eldorze po wykonaniu odpowiednich misji oraz możliwość dołączenia do Specjalnych Najemników Elfickich. Te misje, ekwipunek i oddział dodamy później.',icon:'guild',pending:false};
  let hero = null;
  const level = () => window.Progression.level(hero);
  const hasProfession = () => typeof hero?.profession==='string'&&hero.profession.length>0;
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
    $('#energy-balance').textContent = window.EnergyCycle.format(energy.energy);
    $('#energy-reset-clock').textContent = `↻ ${energy.text}`;
    $('#energy-reset-clock').setAttribute('aria-label',`Odnowienie energii za ${energy.text}`);
    $('#shard-balance').textContent = Number.isSafeInteger(hero.shards) && hero.shards >= 0 ? hero.shards : 0;
    $('.avatar .level').textContent = level();
    $('.profile-text small').textContent = `Poziom ${level()}`;
    $('.map-caption small').textContent = `Poziom ${level()}`;
    $('#avatar-art').classList.toggle('hero-skin',!!window.HeroSkins?.current(hero));
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
    const saved=window.LocalProfiles.read();
    if(!saved || saved.version!==2 || saved.name!==hero.name || saved.classId!==hero.classId || saved.gender!==hero.gender)throw new Error('Zapis postaci zmienił się. Odśwież grę.');
    return saved;
  }
  function readCurrentHero() {
    hero=window.EnergyCycle.apply(readSavedHero());updateProfile();return hero;
  }
  function updateCurrentHero(change) {
    const updated=window.HeroSheet.activatePotion(change(readCurrentHero()));
    window.LocalProfiles.write(updated);
    hero=updated;updateProfile();return updated;
  }
  function markCampaignVisit(place){
    const change=()=>{const h=readCurrentHero();if(window.OathCampaign.visit(h,place)!==h)updateCurrentHero(latest=>window.OathCampaign.visit(latest,place));};
    Promise.resolve(navigator.locks?navigator.locks.request('pustkowie-hero-v2',change):change()).catch(()=>{$('#status').textContent='Nie udało się zapisać wizyty do kampanii. Spróbuj wejść ponownie.';});
  }
  function travelCampaign(place){
    if(place==='archive'||place==='throne'){openPlace('guild');window.CastlePanel.openRoom(place);}
    else if(place==='training'){openPlace('barracks');window.BarracksPanel.openTraining();}
    else if(place==='vespera-bedroom'){openPlace('skin-house');window.SkinHouse.openRoom('bedroom');}
    else if(['ubocze','eldor','ice-hills','hell-gates'].includes(place)){
      openPlace('glade');openPlace(place==='eldor'?'glade-path-2':place==='ice-hills'?'glade-path-1':'glade-path-3');if(place==='hell-gates'&&level()>=30)openPlace('ubocze-path');
    }else if(['tavern','dungeon'].includes(place))openPlace(place);
  }
  let energySyncBusy=false;
  async function refreshEnergy() {
    if(energySyncBusy||!hero||!document.body.classList.contains('playing')||document.hidden)return;
    energySyncBusy=true;
    try {
      const sync=()=>{
        const saved=readSavedHero(),updated=window.HeroSheet.activatePotion(window.EnergyCycle.apply(saved));
        if(updated!==saved)window.LocalProfiles.write(updated);
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
    const canChoose = unlocked && !hasProfession() && PROFESSIONS[hero.classId].some(p=>!p.pending);
    return `<div class="barracks-banner">${icon(trainer==='alchemist'?'alchemy':trainer==='elven'?'guild':'barracks')}<div><h3>Wybierz swoją profesję</h3><p>${unlocked ? 'Poziom wymagany do wyboru został osiągnięty.' : 'Wybór odblokuje się na 10. poziomie.'}</p></div></div>
      <div class="profession-unlock"><div><span>${unlocked ? 'Wymagany poziom osiągnięty' : 'Wymagany poziom 10'}</span><b>Twój poziom: ${level()}</b></div><progress max="10" value="${Math.min(level(),10)}" aria-label="Postęp do odblokowania profesji"></progress></div>
      ${hasProfession()?`<p class="current-profession">Wybrana profesja: <strong>${current?.name||'Wybrana profesja'}</strong>. Wybór jest stały i nie można go zmienić.</p>`:'<p class="profession-permanent-note">Wybór profesji jest nieodwracalny. Po zatwierdzeniu nie można jej zmienić.</p>'}
      <form id="profession-form" data-profession-trainer="${trainer}"><fieldset ${canChoose ? '' : 'disabled'}><legend class="sr-only">Profesje dla twojej klasy</legend><div class="profession-grid">${PROFESSIONS[hero.classId].map(p=>`<label class="profession-card"><input type="radio" name="profession" value="${p.id}" ${current?.id===p.id ? 'checked' : ''} ${p.pending ? 'disabled' : ''} required><span class="profession-symbol">${icon(p.icon)}</span><strong>${p.name}</strong><span class="profession-role">${p.role}</span><span class="profession-state">${hasProfession()?(p.id===hero.profession?'Wybrana na stałe':'Niedostępna'):p.pending?'Do ustalenia':unlocked?'Dostępna':'Od poziomu 10'}</span></label>`).join('')}</div><button type="submit" class="primary profession-submit">${hasProfession()?'Profesja wybrana na stałe':unlocked?canChoose?'Wybierz profesję':'Profesje w przygotowaniu':'Odblokowanie na poziomie 10'}</button></fieldset><p id="profession-status" role="status" aria-live="polite"></p></form><p class="panel-note">${trainer==='alchemist'?'Nauczyciel: Alchemiczka.':trainer==='elven'?'Miejsce szkolenia: Komnata Leśnej Przysięgi w Zamku Czarnej Stali. Nauczycielka: Lyrien.':'Nauczyciel: Paladyn Gabriel.'} Szkolenie od poziomu 10. ${hero.classId==='warrior'?'Dostępne profesje: Palladyn i Rycerz.':hero.classId==='mage'?'Dostępne profesje: Nekromanta i Alchemik. Tworzenie mikstur i zioła dodamy później.':hero.classId==='elf'?'Dostępne profesje: Zwiadowca i Leśna Straż. Krótkie sztylety Zwiadowcy kupisz u Gringa. Zawartość Leśnej Straży w Eldorze i elficki oddział dodamy później.':'Nazwy i umiejętności profesji ustalimy później.'}</p>`;
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
  let stopGoldenPony=()=>{};
  let stopSkinHouse=()=>{};
  let stopCampaign=()=>{};
  let worldLocation='map',openPlaceId=null;
  const worldPositions=new Map();
  function showWorld(id){
    const view=$('.world-viewport'),map=$('#town-map'),glade=id==='glade',ubocze=id==='ubocze',hell=id==='hell-gates';
    const scale=Number(view.dataset.zoomScale)||1;
    worldPositions.set(worldLocation,{x:(view.scrollLeft+view.clientWidth/2)/(map.clientWidth*scale),y:(view.scrollTop+view.clientHeight/2)/(map.clientHeight*scale)});
    worldLocation=id;openPlaceId=null;map.classList.toggle('is-glade',glade);map.classList.toggle('is-ubocze',ubocze);map.classList.toggle('is-hell-gates',hell);
    const name=hell?'Wrota Piekieł':ubocze?'Ubocze':glade?'Polana':'Zamek Czarnej Stali';
    $('#settlement-title').textContent=name;
    $('.world-kicker').textContent=hell?'KRAINA OGNIA I POPIOŁU':ubocze?'PRZY LEŚNYM TRAKCIE':glade?'ZA MURAMI ZAMKU':'OSTATNIE SCHRONIENIE';
    $('.world-bottom>span').innerHTML='<i></i> '+(hell?'Za Wrotami Piekieł':ubocze?'Na Uboczu':glade?'Na leśnej polanie':'W bezpiecznym zamku');
    $('.map-caption').innerHTML=`<span>✦</span> ${name} <small>Poziom ${level()}</small>`;
    view.setAttribute('aria-label',`${name} — przeciągnij, aby przesunąć widok`);
    if(hell){
      $('#map-pins').innerHTML='<button type="button" class="map-pin hell-mercenary-camp" data-place="hell-mercenary-camp" aria-label="Obóz najemników — wejdź" style="--x:42%;--y:54.5%"><span class="pin-label">Obóz najemników</span></button><button type="button" class="map-pin hell-return" data-place="glade-path-3" style="--x:50%;--y:86%"><span class="pin-medallion">'+icon('map')+'</span><span class="pin-label">Powrót na Ubocze</span></button>';
    }else if(ubocze){
      $('#map-pins').innerHTML='<button type="button" class="map-pin ubocze-tavern" data-place="ubocze-tavern" style="--x:37.5%;--y:51%"><span class="pin-medallion"><img class="glade-path-art" src="glade-ubocze-icon.webp" alt="" width="64" height="64" draggable="false"></span><span class="pin-label">Pod Złotym Kucem</span></button><button type="button" class="map-pin ubocze-path" aria-label="Wrota Piekieł" data-place="ubocze-path" style="--x:81%;--y:46%"><span class="pin-medallion"><img class="glade-path-art" src="hell-gates-icon.webp" alt="" width="64" height="64" draggable="false"></span><span class="pin-label">Wrota Piekieł</span></button><button type="button" class="map-pin ubocze-return" data-place="glade" style="--x:50%;--y:86%"><span class="pin-medallion">'+icon('map')+'</span><span class="pin-label">Powrót na polanę</span></button>';
    }else{
      $('#map-pins').innerHTML=glade?[[1,16,36],[2,51.3,16],[3,78,35]].map(([n,x,y])=>`<button type="button" class="map-pin glade-path ${level()<places['glade-path-'+n].requiredLevel?'is-locked':''}" aria-label="${places['glade-path-'+n].name}" data-place="glade-path-${n}" style="--x:${x}%;--y:${y}%"><span class="pin-medallion"><img class="glade-path-art" src="${places['glade-path-'+n].art}" alt="" width="64" height="64" draggable="false"></span><span class="pin-label">${places['glade-path-'+n].name}</span></button>`).join('')+'<button type="button" class="map-pin glade-return" data-place="map" style="--x:50%;--y:86%"><span class="pin-medallion">'+icon('castle')+'</span><span class="pin-label">Powrót do zamku</span></button>':townPins();
    }
    window.SceneZoom?.reset(view);
    requestAnimationFrame(()=>{
      if(worldLocation!==id)return;
      const position=worldPositions.get(id)||{x:hell ? .55 : ubocze ? .37 : .5,y:.5};
      view.scrollLeft=Math.max(0,map.clientWidth*position.x-view.clientWidth/2);
      view.scrollTop=Math.max(0,map.clientHeight*position.y-view.clientHeight/2);
    });
    $('#place-dialog').close();$('#settlement-title').focus({preventScroll:true});
    if(id==='ubocze'||id==='hell-gates')markCampaignVisit(id);
  }
  function openPlace(id) {
    if (!places[id] || !hero) return;
    if(id==='forge'||id==='dungeon'||places[id].requiredLevel){
      try{readCurrentHero();}
      catch{$('#status').textContent=`Nie można odczytać poziomu postaci. Odśwież grę, aby wejść do ${id==='forge'?'kuźni':id==='dungeon'?'Lochów':places[id].name}.`;return;}
    }
    const forgeLocked=id==='forge'&&level()<FORGE_LEVEL;
    const dungeonLocked=id==='dungeon'&&level()<DUNGEON_LEVEL;
    const dungeonTrainingLocked=id==='dungeon'&&!window.GabrielTraining.unlocked(hero)&&hero.activeCombat?.source!=='graveyard';
    if(['tavern','hero','inventory','market','skin-house','journal','guild'].includes(id)){try{readCurrentHero();}catch{}}
    stopActiveScout();stopHeroSheet();stopDungeons();stopCastle();stopGoldenPony();stopSkinHouse();stopCampaign();
    window.FateWheel.cancel();
    window.TavernPanel.cancel();
    window.AlchemistPanel.cancel();
    window.ForgePanel.cancel();
    window.BarracksPanel.cancel();window.MarketPanel.cancel();
    toggleMenu(false);
    document.querySelectorAll('.nav-tile').forEach(el => el.setAttribute('aria-current',el.dataset.place === id ? 'page' : 'false'));
    if (id === 'map'||id==='glade') {showWorld(id);return;}
    if(id==='glade-path-3'&&level()>=places[id].requiredLevel){showWorld('ubocze');return;}
    if(id==='ubocze-path'&&level()>=places[id].requiredLevel){showWorld('hell-gates');return;}
    const place = places[id];
    $('#place-title').textContent = place.title || place.name;
    $('#place-category').textContent = place.category;
    let scouting=false;
    if(id==='tavern'){try{scouting=!!window.BrandMissions.status(hero).mission;}catch{}}
    let content;
    if(id==='skin-house'){
      content=window.SkinHouse.markup(hero);
    } else if(id==='ubocze-tavern'&&level()>=place.requiredLevel){
      content=window.GoldenPony.markup();
    } else if(id==='hell-mercenary-camp'&&level()>=place.requiredLevel){
      content='<section class="mercenary-camp-panel" aria-label="Obóz najemników"><img src="mercenary-camp.webp" alt="Mały obóz z trzema ciemnymi namiotami, drewnianą palisadą i ogniskiem na wulkanicznej ziemi." width="1254" height="1254" draggable="false"><p class="place-text">Przy kamiennym trakcie najemnicy rozbili niewielki obóz. Pomiędzy namiotami płonie ognisko, a drewniana palisada osłania zapasy przed pustkowiem.</p><p class="panel-note">Postacie i misje dodamy później.</p></section>';
    } else if (place.requiredLevel) {
      const locked=level()<place.requiredLevel;
      content=`<div class="place-emblem">${place.art?`<img class="glade-location-art" src="${place.art}" alt="" width="128" height="128">`:icon(place.icon)}</div><p class="place-text" role="status">${locked?'Wejście jest zablokowane.':place.text}</p><p class="panel-note">Twój poziom: ${level()} · Wymagany poziom: ${place.requiredLevel}</p><div class="coming-soon"><span>${place.future}</span><span class="state-badge">${locked?'Od poziomu '+place.requiredLevel:'W przygotowaniu'}</span></div>`;
      if(!locked&&['glade-path-1','glade-path-2'].includes(id)){
        const chapter=id==='glade-path-1'?'ice-seal':'eldor-seal';
        content=`<div class="place-emblem"><img class="glade-location-art" src="${place.art}" alt="" width="128" height="128"></div><h3 class="place-text">${window.OathCampaign.get(chapter).title}</h3><p class="place-text">Ślad odwróconych pieczęci prowadzi do tej krainy. Dalszy rozdział kampanii czeka w dzienniku po ukończeniu poprzedniego etapu.</p><p class="panel-note">Twój poziom: ${level()} · Wymagany poziom: ${place.requiredLevel}</p><button type="button" class="primary campaign-chapter-link" data-open-campaign="${chapter}">Otwórz rozdział w dzienniku</button>`;
      }
    } else if (id === 'hero') {
      content = '<div class="hero-sheet-root"></div>';
    } else if (id === 'tavern') {
      content = scouting?'<div class="scout-active-view" aria-label="Aktywny zwiad"></div>':window.TavernPanel.markup();
    } else if (id === 'alchemy') {
      content = window.AlchemistPanel.markup();
    } else if (dungeonTrainingLocked) {
      content='<p class="place-text">Aby wejść do lochów, ukończ misje treningowe u Gabriela: pokonaj 3 manekiny, odzyskaj od goblinów skradzioną broń, tarczę i hełm, a następnie oddaj uzbrojenie. Wymagany jest również poziom 10.</p><button type="button" class="primary" id="go-gabriel">Idź do Gabriela</button>';
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
      content = window.CampaignPanel.markup();
    } else if (id === 'help') {
      content = '<p class="place-text">Wybierz miejsce na mapie lub w bocznym menu. Kliknij portret, aby zobaczyć statystyki bohatera.</p><p class="panel-note">Postać zapisuje się w tej przeglądarce. Wyprawy, handel i walka pojawią się w kolejnych etapach.</p>';
    } else {
      content = `<div class="place-emblem">${place.art?`<img class="glade-location-art" src="${place.art}" alt="" width="128" height="128">`:icon(place.icon)}</div><p class="place-text">${place.text}</p><div class="coming-soon"><span>${place.future}</span><span class="state-badge">W przygotowaniu</span></div>`;
    }
    openPlaceId=id;
    $('#place-content').innerHTML = content;
    if(id==='skin-house')stopSkinHouse=window.SkinHouse.mount($('#place-content'),{read:readCurrentHero,update:updateCurrentHero,onTitle:title=>{$('#place-title').textContent=title;},onRoom:room=>{if(room==='bedroom')markCampaignVisit('vespera-bedroom');}});
    if(id==='journal')stopCampaign=window.CampaignPanel.mount($('#place-content'),{read:readCurrentHero,update:updateCurrentHero,navigate:travelCampaign});
    if(level()>=place.requiredLevel&&id==='glade-path-1')markCampaignVisit('ice-hills');
    if(level()>=place.requiredLevel&&id==='glade-path-2')markCampaignVisit('eldor');
    if(id==='ubocze-tavern'&&level()>=place.requiredLevel)stopGoldenPony=window.GoldenPony.mount($('#place-content'),{read:readCurrentHero,update:updateCurrentHero});
    if (id === 'guild') stopCastle=window.CastlePanel.mount($('#place-content'),{read:readCurrentHero,update:updateCurrentHero,onTitle:title=>{$('#place-title').textContent=title;},professionMarkup:()=>barracksPanel('elven')});
    if (id === 'hero') stopHeroSheet=window.HeroSheet.mount($('.hero-sheet-root'),{read:readCurrentHero,update:updateCurrentHero});
    if (id === 'inventory') stopHeroSheet=window.HeroSheet.mountBag($('.backpack-root'),{read:readCurrentHero,update:updateCurrentHero});
    if (id === 'dungeon' && !dungeonLocked && !dungeonTrainingLocked) stopDungeons=window.DungeonsPanel.mount($('#place-content'),{read:readCurrentHero,update:updateCurrentHero,onTitle:title=>{$('#place-title').textContent=title;}});
    if (id === 'wheel') window.FateWheel.mount($('#place-content'),{read:readCurrentHero,update:updateCurrentHero});
    if (id === 'alchemy') window.AlchemistPanel.mount($('#place-content'),{read:readCurrentHero,update:updateCurrentHero,professionMarkup:()=>barracksPanel('alchemist')});
    if (id === 'forge' && !forgeLocked) window.ForgePanel.mount($('#place-content'),{read:readCurrentHero,update:updateCurrentHero});
    if (id === 'market') window.MarketPanel.mount($('#place-content'),{read:readCurrentHero,update:updateCurrentHero});
    if (id === 'barracks') window.BarracksPanel.mount($('#place-content'),{read:readCurrentHero,update:updateCurrentHero,onTitle:title=>{$('#place-title').textContent=title;},professionMarkup:()=>barracksPanel('gabriel')});
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
    ['HANDEL',['forge','alchemy','market','skin-house']],
    ['BOHATER',['hero','inventory','journal','guild','mount']]
  ].map(([name,ids])=>`<div class="nav-group"><h2>${name}</h2><div class="nav-grid">${ids.map(id=>`<button type="button" class="nav-tile" data-place="${id}" aria-current="${id==='map'?'page':'false'}" title="${places[id].name}">${icon(places[id].icon)}<span>${places[id].name}</span></button>`).join('')}</div></div>`).join('');
  function townPins(){return Object.entries(places).filter(([,p])=>p.x).map(([id,p])=>`<button type="button" class="map-pin pin-${id}" data-place="${id}" style="--x:${p.x}%;--y:${p.y}%" aria-label="${p.name}"><span class="pin-medallion">${icon(p.icon)}</span><span class="pin-label">${p.name}</span></button>`).join('');}
  $('#map-pins').innerHTML=townPins();
  $('#ready').addEventListener('click',e=>{const button=e.target.closest('[data-place]');if(button)openPlace(button.dataset.place);});
  let professionBusy=false;
  $('#place-content').addEventListener('submit', async e => {
    if(e.target.id!=='profession-form')return;
    e.preventDefault();if(professionBusy)return;
    const form=e.target,chosen=new FormData(form).get('profession');
    let message='',saved=false;professionBusy=true;
    const commit=()=>{
      try{readCurrentHero();}catch{message='Nie można odczytać postaci. Odśwież grę.';return;}
      if(hasProfession()){message='Profesja została już wybrana na stałe. Nie można jej zmienić.';return;}
      if(!professionTeacher()||form.dataset.professionTrainer!==professionTeacher()){message='Ta postać szkoli się u innego nauczyciela.';return;}
      if(level()<10){message='Wybór profesji wymaga poziomu 10.';return;}
      if(PROFESSIONS[hero.classId].every(p=>p.pending)){message='Profesje tej klasy są jeszcze do ustalenia.';return;}
      if(!PROFESSIONS[hero.classId].some(p=>!p.pending&&p.id===chosen)){message='Wybierz jedną z dostępnych profesji.';return;}
      const updated=window.EnergyCycle.apply({...hero,level:level(),profession:chosen});
      try{
        const previous=readSavedHero();
        if(typeof previous.profession==='string'&&previous.profession.length>0){message='Profesja została już wybrana na stałe. Nie można jej zmienić.';return;}
        if(window.Progression.level(previous)!==level()){message='Zapis zmienił się w innej karcie. Otwórz panel ponownie.';return;}
        window.LocalProfiles.write(updated);
      }catch{message='Nie udało się zapisać profesji. Spróbuj ponownie.';return;}
      hero=updated;updateProfile();saved=true;
    };
    try{
      if(navigator.locks)await navigator.locks.request('pustkowie-hero-v2',commit);else commit();
      if(saved){
        const teacher=professionTeacher();openPlace(teacher==='alchemist'?'alchemy':teacher==='elven'?'guild':'barracks');
        if(teacher==='alchemist')window.AlchemistPanel.openProfessions();else if(teacher==='elven')window.CastlePanel.openSchool();else window.BarracksPanel.openProfessions();
        message=`Wybrano profesję na stałe: ${profession().name}. Nie można jej zmienić.`;
      }
      const status=$('#profession-status');if(status)status.textContent=message;
    }catch{const status=$('#profession-status');if(status)status.textContent='Nie udało się zapisać profesji. Spróbuj ponownie.';}
    finally{professionBusy=false;}
  });
  $('#place-dialog').addEventListener('close', () => {if($('#place-dialog').open)return;openPlaceId=null;stopHeroSheet();stopActiveScout();stopDungeons();stopCastle();stopGoldenPony();stopSkinHouse();stopCampaign();window.FateWheel.cancel();window.TavernPanel.cancel();window.AlchemistPanel.cancel();window.ForgePanel.cancel();window.BarracksPanel.cancel();window.MarketPanel.cancel();});
  $('#place-content').addEventListener('click',e=>{const story=e.target.closest('[data-open-campaign]');if(story){const id=story.dataset.openCampaign;openPlace('journal');if(id)window.CampaignPanel.select(id);return;}if(e.target.closest('#go-gabriel')){openPlace('barracks');window.BarracksPanel.openTraining();}});
  $('#close-place').addEventListener('click',()=>$('#place-dialog').close());
  $('#place-dialog').addEventListener('click',e=>{if(e.target===$('#place-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
  $('#menu-toggle').addEventListener('click',()=>toggleMenu(!$('#sidebar').classList.contains('is-open')));
  $('#close-menu').addEventListener('click',()=>toggleMenu(false));
  $('#sidebar-scrim').addEventListener('click',()=>toggleMenu(false));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')toggleMenu(false);});
  window.HubNavigation={open:openPlace,world:()=>worldLocation,place:()=>openPlaceId};
  window.mountHub = data => {
    hero = window.EnergyCycle.apply(data);
    updateProfile();
    void refreshEnergy();
    $('#avatar-art').className = `character ${data.gender} ${data.classId}${window.HeroSkins?.classSuffix(data)||''}`;
    toggleMenu(false);
    requestAnimationFrame(() => { const view = $('.world-viewport'); view.scrollLeft = Math.max(0,(view.scrollWidth-view.clientWidth)/2); });
    document.querySelectorAll('.nav-tile').forEach(el=>el.setAttribute('aria-current',el.dataset.place==='map'?'page':'false'));
  };
})();
