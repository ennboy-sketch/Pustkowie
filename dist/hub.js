'use strict';
(() => {
  const $ = s => document.querySelector(s);
  const ICONS = ['map','tavern','barracks','arena','dungeon','forge','alchemy','market','hero','inventory','journal','guild','coin','shard','energy','help','mount','wheel'];
  const icon = id => `<span class="rpg-icon icon-${ICONS.includes(id) ? id : 'map'}" aria-hidden="true"></span>`;
  const places = {
    map:{name:'Zamek',category:'Świat',icon:'map'},
    hero:{name:'Bohater',category:'Postać',icon:'hero'},
    inventory:{name:'Ekwipunek',category:'Postać',icon:'inventory'},
    journal:{name:'Dziennik',category:'Postać',icon:'journal'},
    tavern:{name:'Karczma',title:'Pod Zgasłą Latarnią',category:'Karczma',icon:'tavern',x:19,y:61,text:'Przy palenisku zbierają się ci, którzy przetrwali noc.',future:'Wyprawy i zlecenia'},
    arena:{name:'Arena',title:'Krąg Żelaza',category:'Walka',icon:'arena',x:81,y:33,text:'Stary kamień pamięta imiona poległych.',future:'Pojedynki'},
    dungeon:{name:'Lochy',title:'Krypta Zapomnianych',category:'Walka',icon:'dungeon',x:14,y:14,text:'Za kamienną bramą nawet cisza ma swoją cenę.',future:'Walka z potworami'},
    barracks:{name:'Koszary',title:'Koszary Żelaznej Przysięgi',category:'Profesje',icon:'barracks',x:16,y:35},
    forge:{name:'Kuźnia',title:'Kuźnia Czarnego Żaru',category:'Handel',icon:'forge',x:47,y:22,text:'Ostatni kowal zamku wciąż podtrzymuje ogień.',future:'Broń i pancerze'},
    alchemy:{name:'Alchemiczka',title:'Wieża Zielonego Płomienia',category:'Handel',icon:'alchemy',x:87,y:64,text:'Za zielonymi szybami coś nigdy nie zasypia.',future:'Mikstury'},
    market:{name:'Targ',title:'Targ Popiołów',category:'Handel',icon:'market',x:48,y:76,text:'Każda rzecz ma tu cenę. Każda moneta swoją historię.',future:'Kupno i sprzedaż'},
    guild:{name:'Gildia',title:'Bastion Przysięgi',category:'Społeczność',icon:'guild',x:77,y:12,text:'Przysięgi złożone w cieniu cytadeli wiążą mocniej niż stal.',future:'Gildie graczy'},
    wheel:{name:'Koło Losu',title:'Koło Losu',category:'Fontanna Czarnej Stali',icon:'wheel',x:50,y:39},
    mount:{name:'Wierzchowiec',category:'Bohater',icon:'mount'},
    help:{name:'Pomoc',category:'Pustkowie',icon:'help'}
  };
  const HERO_KEY = 'pustkowie.hero.v2';
  // Nazwy i umiejętności trzech osobnych profesji każdej klasy ustalimy później.
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
    const updated=change(readCurrentHero());
    localStorage.setItem(HERO_KEY,JSON.stringify(updated));
    hero=updated;updateProfile();return updated;
  }
  let energySyncBusy=false;
  async function refreshEnergy() {
    if(energySyncBusy||!hero||!document.body.classList.contains('playing')||document.hidden)return;
    energySyncBusy=true;
    try {
      const sync=()=>{
        const saved=readSavedHero(),updated=window.EnergyCycle.apply(saved);
        if(updated!==saved)localStorage.setItem(HERO_KEY,JSON.stringify(updated));
        hero=updated;updateProfile();
      };
      if(navigator.locks)await navigator.locks.request('pustkowie-hero-v2',sync);else sync();
    } catch {$('#energy-reset-clock').textContent='Zapis niedostępny';}
    finally {energySyncBusy=false;}
  }
  setInterval(refreshEnergy,1000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)void refreshEnergy();});
  window.addEventListener('focus',()=>void refreshEnergy());
  window.addEventListener('storage',e=>{if(e.key===HERO_KEY)void refreshEnergy();});
  function barracksPanel() {
    const unlocked = level() >= 10;
    const current = profession();
    const canChoose = unlocked && PROFESSIONS[hero.classId].some(p=>!p.pending);
    return `<div class="barracks-banner">${icon('barracks')}<div><h3>Wybierz swoją profesję</h3><p>${unlocked ? 'Poziom wymagany do wyboru został osiągnięty.' : 'Wybór odblokuje się na 10. poziomie.'}</p></div></div>
      <div class="profession-unlock"><div><span>${unlocked ? 'Wymagany poziom osiągnięty' : 'Wymagany poziom 10'}</span><b>Twój poziom: ${level()}</b></div><progress max="10" value="${Math.min(level(),10)}" aria-label="Postęp do odblokowania profesji"></progress></div>
      ${current ? `<p class="current-profession">Obecna profesja: <strong>${current.name}</strong></p>` : ''}
      <form id="profession-form"><fieldset ${canChoose ? '' : 'disabled'}><legend class="sr-only">Profesje dla twojej klasy</legend><div class="profession-grid">${PROFESSIONS[hero.classId].map(p=>`<label class="profession-card"><input type="radio" name="profession" value="${p.id}" ${current?.id===p.id ? 'checked' : ''} ${p.pending ? 'disabled' : ''} required><span class="profession-symbol">${icon(p.icon)}</span><strong>${p.name}</strong><span class="profession-role">${p.role}</span><span class="profession-state">${p.pending ? 'Do ustalenia' : unlocked ? 'Dostępna' : 'Od poziomu 10'}</span></label>`).join('')}</div><button type="submit" class="primary profession-submit">${unlocked ? canChoose ? current ? 'Zmień profesję' : 'Wybierz profesję' : 'Profesje w przygotowaniu' : 'Odblokowanie na poziomie 10'}</button></fieldset><p id="profession-status" role="status" aria-live="polite"></p></form><p class="panel-note">Każda klasa otrzyma trzy własne profesje do wyboru od poziomu 10. Nazwy i umiejętności ustalimy później.</p>`;
  }
  const gear = {warrior:['Wyszczerbiony miecz','Znoszona kolczuga'],mage:['Kostur czarnego jesionu','Szata wygnańca'],elf:['Łuk z martwego cisu','Płaszcz tropiciela'],dwarf:['Żelazny topór','Pancerz wędrowca']};
  const labels = ['Siła','Zręczność','Inteligencja','Wytrzymałość'];
  function toggleMenu(open) {
    $('#sidebar').classList.toggle('is-open',open);
    $('#sidebar-scrim').hidden = !open;
    $('#menu-toggle').setAttribute('aria-expanded',String(open));
  }
  let stopActiveScout=()=>{};
  let stopHeroSheet=()=>{};
  function openPlace(id) {
    if (!places[id] || !hero) return;
    if(['tavern','hero','inventory','market'].includes(id)){try{readCurrentHero();}catch{}}
    stopActiveScout();stopHeroSheet();
    window.FateWheel.cancel();
    window.TavernPanel.cancel();
    window.AlchemistPanel.cancel();
    window.ForgePanel.cancel();
    window.BarracksPanel.cancel();window.MarketPanel.cancel();
    toggleMenu(false);
    requestAnimationFrame(() => { const view = $('.world-viewport'); view.scrollLeft = Math.max(0,(view.scrollWidth-view.clientWidth)/2); });
    document.querySelectorAll('.nav-tile').forEach(el => el.setAttribute('aria-current',el.dataset.place === id ? 'page' : 'false'));
    if (id === 'map') { $('#place-dialog').close(); return; }
    const place = places[id];
    $('#place-title').textContent = place.title || place.name;
    $('#place-category').textContent = place.category;
    let scouting=false;
    if(id==='tavern'){try{scouting=!!window.BrandMissions.status(hero).mission;}catch{}}
    let content;
    if (id === 'hero') {
      content = '<div class="hero-sheet-root"></div>';
    } else if (id === 'tavern') {
      content = scouting?'<div class="scout-active-view" aria-label="Aktywny zwiad"></div>':window.TavernPanel.markup();
    } else if (id === 'alchemy') {
      content = window.AlchemistPanel.markup();
    } else if (id === 'forge') {
      content = window.ForgePanel.markup();
    } else if (id === 'market') {
      content = window.MarketPanel.markup();
    } else if (id === 'barracks') {
      content = window.BarracksPanel.markup();
    } else if (id === 'wheel') {
      content = window.FateWheel.markup(hero);
    } else if (id === 'mount') {
      content = '';
    } else if (id === 'inventory') {
      content = '<div class="backpack-root"></div>';
    } else if (id === 'journal') {
      content = `<div class="journal-entry">${icon('journal')}<div><h3>Przybycie do zamku</h3><p>Twoja postać dotarła do Zamku Czarnej Stali.</p><span class="state-badge">Zapisane</span></div></div>`;
    } else if (id === 'help') {
      content = '<p class="place-text">Wybierz miejsce na mapie lub w bocznym menu. Kliknij portret, aby zobaczyć statystyki bohatera.</p><p class="panel-note">Postać zapisuje się w tej przeglądarce. Wyprawy, handel i walka pojawią się w kolejnych etapach.</p>';
    } else {
      content = `<div class="place-emblem">${icon(place.icon)}</div><p class="place-text">${place.text}</p><div class="coming-soon"><span>${place.future}</span><span class="state-badge">W przygotowaniu</span></div>`;
    }
    $('#place-content').innerHTML = content;
    if (id === 'hero') stopHeroSheet=window.HeroSheet.mount($('.hero-sheet-root'),{read:readCurrentHero,update:updateCurrentHero});
    if (id === 'inventory') stopHeroSheet=window.HeroSheet.mountBag($('.backpack-root'),{read:readCurrentHero,update:updateCurrentHero});
    if (id === 'wheel') window.FateWheel.mount($('#place-content'));
    if (id === 'alchemy') window.AlchemistPanel.mount($('#place-content'));
    if (id === 'forge') window.ForgePanel.mount($('#place-content'));
    if (id === 'market') window.MarketPanel.mount($('#place-content'),{read:readCurrentHero,update:updateCurrentHero});
    if (id === 'barracks') window.BarracksPanel.mount($('#place-content'),{professionMarkup:barracksPanel});
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
    ['ŚWIAT',['map','tavern','barracks','arena','dungeon']],
    ['HANDEL',['forge','alchemy','market']],
    ['BOHATER',['hero','inventory','journal','guild','mount']]
  ].map(([name,ids])=>`<div class="nav-group"><h2>${name}</h2><div class="nav-grid">${ids.map(id=>`<button type="button" class="nav-tile" data-place="${id}" aria-current="${id==='map'?'page':'false'}" title="${places[id].name}">${icon(places[id].icon)}<span>${places[id].name}</span></button>`).join('')}</div></div>`).join('');
  $('#map-pins').innerHTML = Object.entries(places).filter(([,p])=>p.x).map(([id,p])=>`<button type="button" class="map-pin pin-${id}" data-place="${id}" style="--x:${p.x}%;--y:${p.y}%" aria-label="${p.name}"><span class="pin-medallion">${icon(p.icon)}</span><span class="pin-label">${p.name}</span></button>`).join('');
  $('#ready').addEventListener('click',e=>{const button=e.target.closest('[data-place]');if(button)openPlace(button.dataset.place);});
  $('#place-content').addEventListener('submit', e => {
    if (e.target.id !== 'profession-form') return;
    e.preventDefault();
    const status = $('#profession-status');
    if (level() < 10) { status.textContent = 'Wybór profesji wymaga poziomu 10.'; return; }
    if (PROFESSIONS[hero.classId].every(p=>p.pending)) { status.textContent = 'Profesje tej klasy są jeszcze do ustalenia.'; return; }
    const chosen = new FormData(e.target).get('profession');
    if (!PROFESSIONS[hero.classId].some(p=>!p.pending && p.id===chosen)) { status.textContent = 'Wybierz jedną z dostępnych profesji.'; return; }
    const updated = {...hero, level:level(), profession:chosen};
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
    openPlace('barracks');window.BarracksPanel.openProfessions();
    $('#profession-status').textContent = `Wybrano profesję: ${profession().name}.`;
  });
  $('#place-dialog').addEventListener('close', () => {stopHeroSheet();stopActiveScout();window.FateWheel.cancel();window.TavernPanel.cancel();window.AlchemistPanel.cancel();window.ForgePanel.cancel();window.BarracksPanel.cancel();window.MarketPanel.cancel();});
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
