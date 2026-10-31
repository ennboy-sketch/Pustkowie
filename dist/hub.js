'use strict';
(() => {
  const $ = s => document.querySelector(s);
  const ICONS = ['map','tavern','barracks','arena','dungeon','forge','alchemy','market','hero','inventory','journal','guild','coin','shard','energy','help'];
  const icon = id => `<span class="rpg-icon icon-${ICONS.includes(id) ? id : 'map'}" aria-hidden="true"></span>`;
  const places = {
    map:{name:'Zamek',category:'Świat',icon:'map'},
    hero:{name:'Bohater',category:'Postać',icon:'hero'},
    inventory:{name:'Ekwipunek',category:'Postać',icon:'inventory'},
    journal:{name:'Dziennik',category:'Postać',icon:'journal'},
    tavern:{name:'Karczma',title:'Pod Zgasłą Latarnią',category:'Wyprawy',icon:'tavern',x:19,y:61,text:'Przy palenisku zbierają się ci, którzy przetrwali noc.',future:'Wyprawy i zlecenia'},
    arena:{name:'Arena',title:'Krąg Żelaza',category:'Walka',icon:'arena',x:81,y:33,text:'Stary kamień pamięta imiona poległych.',future:'Pojedynki'},
    dungeon:{name:'Lochy',title:'Krypta Zapomnianych',category:'Walka',icon:'dungeon',x:14,y:14,text:'Za kamienną bramą nawet cisza ma swoją cenę.',future:'Walka z potworami'},
    barracks:{name:'Koszary',title:'Koszary Żelaznej Przysięgi',category:'Profesje',icon:'barracks',x:16,y:35},
    forge:{name:'Kuźnia',title:'Kuźnia Czarnego Żaru',category:'Handel',icon:'forge',x:47,y:22,text:'Ostatni kowal zamku wciąż podtrzymuje ogień.',future:'Broń i pancerze'},
    alchemy:{name:'Alchemik',title:'Wieża Zielonego Płomienia',category:'Handel',icon:'alchemy',x:87,y:64,text:'Za zielonymi szybami coś nigdy nie zasypia.',future:'Mikstury'},
    market:{name:'Targ',title:'Targ Popiołów',category:'Handel',icon:'market',x:48,y:76,text:'Każda rzecz ma tu cenę. Każda moneta swoją historię.',future:'Kupno i sprzedaż'},
    guild:{name:'Gildia',title:'Bastion Przysięgi',category:'Społeczność',icon:'guild',x:77,y:12,text:'Przysięgi złożone w cieniu cytadeli wiążą mocniej niż stal.',future:'Gildie graczy'},
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
  const level = () => Number.isSafeInteger(hero?.level) && hero.level > 0 ? hero.level : 1;
  const profession = () => (PROFESSIONS[hero?.classId] || []).find(p=>!p.pending && p.id === hero.profession);
  function updateProfile() {
    $('.avatar .level').textContent = level();
    $('.profile-text small').textContent = `Poziom ${level()}`;
    $('.map-caption small').textContent = `Poziom ${level()}`;
    $('#hero-profession').textContent = profession()?.name || '';
    $('#hero-profession').hidden = !profession();
  }
  function barracksPanel() {
    const unlocked = level() >= 10;
    const current = profession();
    const canChoose = unlocked && PROFESSIONS[hero.classId].some(p=>!p.pending);
    return `<div class="barracks-banner">${icon('barracks')}<div><h3>Wybierz swoją profesję</h3><p>${unlocked ? 'Poziom wymagany do wyboru został osiągnięty.' : 'Wybór odblokuje się na 10. poziomie.'}</p></div></div>
      <div class="profession-unlock"><div><span>${unlocked ? 'Wymagany poziom osiągnięty' : 'Wymagany poziom 10'}</span><b>Twój poziom: ${level()}</b></div><progress max="10" value="${Math.min(level(),10)}" aria-label="Postęp do odblokowania profesji"></progress></div>
      ${current ? `<p class="current-profession">Obecna profesja: <strong>${current.name}</strong></p>` : ''}
      <form id="profession-form"><fieldset ${canChoose ? '' : 'disabled'}><legend class="sr-only">Profesje dla twojej klasy</legend><div class="profession-grid">${PROFESSIONS[hero.classId].map(p=>`<label class="profession-card"><input type="radio" name="profession" value="${p.id}" ${current?.id===p.id ? 'checked' : ''} ${p.pending ? 'disabled' : ''} required><span class="profession-symbol">${icon(p.icon)}</span><strong>${p.name}</strong><span class="profession-role">${p.role}</span><span class="profession-state">${p.pending ? 'Do ustalenia' : unlocked ? 'Dostępna' : 'Od poziomu 10'}</span></label>`).join('')}</div><button type="submit" class="primary profession-submit">${unlocked ? canChoose ? current ? 'Zmień profesję' : 'Wybierz profesję' : 'Profesje w przygotowaniu' : 'Odblokowanie na poziomie 10'}</button></fieldset><p id="profession-status" role="status" aria-live="polite"></p></form><p class="panel-note">Każda klasa otrzyma trzy własne profesje do wyboru od poziomu 10. Nazwy i umiejętności ustalimy później.</p>`;
  }
  const stats = {warrior:[12,5,3,10],mage:[3,5,12,6],elf:[5,12,4,7],dwarf:[10,3,4,12]};
  const gear = {warrior:['Wyszczerbiony miecz','Znoszona kolczuga'],mage:['Kostur czarnego jesionu','Szata wygnańca'],elf:['Łuk z martwego cisu','Płaszcz tropiciela'],dwarf:['Żelazny topór','Pancerz wędrowca']};
  const labels = ['Siła','Zręczność','Inteligencja','Wytrzymałość'];
  function toggleMenu(open) {
    $('#sidebar').classList.toggle('is-open',open);
    $('#sidebar-scrim').hidden = !open;
    $('#menu-toggle').setAttribute('aria-expanded',String(open));
  }
  function openPlace(id) {
    if (!places[id] || !hero) return;
    toggleMenu(false);
    requestAnimationFrame(() => { const view = $('.world-viewport'); view.scrollLeft = Math.max(0,(view.scrollWidth-view.clientWidth)/2); });
    document.querySelectorAll('.nav-tile').forEach(el => el.setAttribute('aria-current',el.dataset.place === id ? 'page' : 'false'));
    if (id === 'map') { $('#place-dialog').close(); return; }
    const place = places[id];
    $('#place-title').textContent = place.title || place.name;
    $('#place-category').textContent = place.category;
    let content;
    if (id === 'hero') {
      content = `<div class="hero-sheet"><div class="sheet-art"><div id="ready-art" class="character ${hero.gender} ${hero.classId}" role="img" aria-label="Twoja postać"></div></div><div class="sheet-stats"><h3 id="sheet-name"></h3><p>Poziom ${level()}</p><p class="sheet-profession">${profession()?.name || 'Bez profesji'}</p><div class="health-label">Życie <b>${50+stats[hero.classId][3]*10} / ${50+stats[hero.classId][3]*10}</b></div><div class="health-bar"></div>${labels.map((name,i)=>`<div class="stat-row"><span>${name}</span><strong>${stats[hero.classId][i]}</strong></div>`).join('')}<div class="xp-info">Doświadczenie <span>0 / 100</span></div></div></div>`;
    } else if (id === 'barracks') {
      content = barracksPanel();
    } else if (id === 'inventory') {
      content = `<div class="equipment-grid">${gear[hero.classId].map((name,i)=>`<div class="equipment-slot">${icon(i ? 'hero':'arena')}<h3>${name}</h3><span>Przedmiot startowy</span></div>`).join('')}</div><p class="panel-note">Złoto: 25 · Odłamki: 0</p>`;
    } else if (id === 'journal') {
      content = `<div class="journal-entry">${icon('journal')}<div><h3>Przybycie do zamku</h3><p>Twoja postać dotarła do Zamku Czarnej Stali.</p><span class="state-badge">Zapisane</span></div></div>`;
    } else if (id === 'help') {
      content = '<p class="place-text">Wybierz miejsce na mapie lub w bocznym menu. Kliknij portret, aby zobaczyć statystyki bohatera.</p><p class="panel-note">Postać zapisuje się w tej przeglądarce. Wyprawy, handel i walka pojawią się w kolejnych etapach.</p>';
    } else {
      content = `<div class="place-emblem">${icon(place.icon)}</div><p class="place-text">${place.text}</p><div class="coming-soon"><span>${place.future}</span><span class="state-badge">W przygotowaniu</span></div>`;
    }
    $('#place-content').innerHTML = content;
    if (id === 'hero') $('#sheet-name').textContent = hero.name;
    const dialog = $('#place-dialog');
    if (!dialog.open) dialog.showModal();
  }
  $('#hub-navigation').innerHTML = [
    ['ŚWIAT',['map','tavern','barracks','arena','dungeon']],
    ['HANDEL',['forge','alchemy','market']],
    ['BOHATER',['hero','inventory','journal','guild']]
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
    openPlace('barracks');
    $('#profession-status').textContent = `Wybrano profesję: ${profession().name}.`;
  });
  $('#close-place').addEventListener('click',()=>$('#place-dialog').close());
  $('#place-dialog').addEventListener('click',e=>{if(e.target===$('#place-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
  $('#menu-toggle').addEventListener('click',()=>toggleMenu(!$('#sidebar').classList.contains('is-open')));
  $('#close-menu').addEventListener('click',()=>toggleMenu(false));
  $('#sidebar-scrim').addEventListener('click',()=>toggleMenu(false));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')toggleMenu(false);});
  window.mountHub = data => {
    hero = data;
    updateProfile();
    $('#avatar-art').className = `character ${data.gender} ${data.classId}`;
    toggleMenu(false);
    requestAnimationFrame(() => { const view = $('.world-viewport'); view.scrollLeft = Math.max(0,(view.scrollWidth-view.clientWidth)/2); });
    document.querySelectorAll('.nav-tile').forEach(el=>el.setAttribute('aria-current',el.dataset.place==='map'?'page':'false'));
  };
})();
