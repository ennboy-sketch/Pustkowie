'use strict';
(() => {
  const $ = s => document.querySelector(s);
  const glyphs = {
    map:'<path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15M15 6v15"/>',
    hero:'<circle cx="12" cy="7" r="4"/><path d="M4 22v-4a8 8 0 0116 0v4M7 15l5 4 5-4"/>',
    tavern:'<path d="M5 7h12v14H5zM17 9h3a2 2 0 012 2v4a2 2 0 01-2 2h-3M8 10v7M13 10v7M7 3v1M12 2v2M17 3v1"/>',
    arena:'<path d="M4 3l17 18M20 3L3 20M3 3l2 6 4-4zM21 3l-2 6-4-4M14 18l4-4M6 14l4 4"/>',
    dungeon:'<path d="M4 22V11a8 8 0 0116 0v11M8 22V11a4 4 0 018 0v11M12 7V3M4 11H1M20 11h3M2 17h3M19 17h3"/>',
    forge:'<path d="M3 10h18l-5 5H8zM8 15l-2 6h13M10 7V2h8v5zM4 4l5 3"/>',
    alchemy:'<path d="M9 2h6M10 2v7L4 19a2 2 0 002 3h12a2 2 0 002-3L14 9V2M7 15h10M10 18h.1M14 19h.1"/>',
    market:'<path d="M3 10l2-7h14l2 7M3 10q3 5 6 0 3 5 6 0 3 5 6 0M4 13v9h16v-9M9 22v-7h6v7"/>',
    guild:'<path d="M12 2l9 4v7c0 5-9 9-9 9s-9-4-9-9V6zM8 9h8M12 5v12M8 13h8"/>',
    inventory:'<path d="M4 8h16v14H4zM8 8V4h8v4M4 13h16M10 12v4h4v-4"/>',
    journal:'<path d="M4 3h15v19H4zM7 3v19M10 8h6M10 12h6M10 16h4"/>',
    help:'<circle cx="12" cy="12" r="10"/><path d="M9 8a3 3 0 116 0c0 3-3 2-3 6M12 18h.1"/>'
  };
  const icon = id => `<svg viewBox="0 0 24 24" aria-hidden="true">${glyphs[id] || glyphs.map}</svg>`;
  const places = {
    map:{name:'Osada',category:'Świat',icon:'map'},
    hero:{name:'Bohater',category:'Postać',icon:'hero'},
    inventory:{name:'Ekwipunek',category:'Postać',icon:'inventory'},
    journal:{name:'Dziennik',category:'Postać',icon:'journal'},
    tavern:{name:'Karczma',title:'Pod Zgasłą Latarnią',category:'Wyprawy',icon:'tavern',x:19,y:61,text:'Przy palenisku zbierają się ci, którzy przetrwali noc.',future:'Wyprawy i zlecenia'},
    arena:{name:'Arena',title:'Krąg Żelaza',category:'Walka',icon:'arena',x:81,y:33,text:'Stary kamień pamięta imiona poległych.',future:'Pojedynki'},
    dungeon:{name:'Lochy',title:'Krypta Zapomnianych',category:'Walka',icon:'dungeon',x:14,y:14,text:'Za kamienną bramą nawet cisza ma swoją cenę.',future:'Walka z potworami'},
    forge:{name:'Kuźnia',title:'Kuźnia Czarnego Żaru',category:'Handel',icon:'forge',x:47,y:22,text:'Ostatni kowal osady wciąż podtrzymuje ogień.',future:'Broń i pancerze'},
    alchemy:{name:'Alchemik',title:'Wieża Zielonego Płomienia',category:'Handel',icon:'alchemy',x:87,y:64,text:'Za zielonymi szybami coś nigdy nie zasypia.',future:'Mikstury'},
    market:{name:'Targ',title:'Targ Popiołów',category:'Handel',icon:'market',x:48,y:76,text:'Każda rzecz ma tu cenę. Każda moneta swoją historię.',future:'Kupno i sprzedaż'},
    guild:{name:'Gildia',title:'Bastion Przysięgi',category:'Społeczność',icon:'guild',x:77,y:12,text:'Przysięgi złożone w cieniu cytadeli wiążą mocniej niż stal.',future:'Gildie graczy'},
    help:{name:'Pomoc',category:'Pustkowie',icon:'help'}
  };
  let hero = null;
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
      content = `<div class="hero-sheet"><div class="sheet-art"><div id="ready-art" class="character ${hero.gender} ${hero.classId}" role="img" aria-label="Twoja postać"></div></div><div class="sheet-stats"><h3 id="sheet-name"></h3><p>Poziom 1</p><div class="health-label">Życie <b>${50+stats[hero.classId][3]*10} / ${50+stats[hero.classId][3]*10}</b></div><div class="health-bar"></div>${labels.map((name,i)=>`<div class="stat-row"><span>${name}</span><strong>${stats[hero.classId][i]}</strong></div>`).join('')}<div class="xp-info">Doświadczenie <span>0 / 100</span></div></div></div>`;
    } else if (id === 'inventory') {
      content = `<div class="equipment-grid">${gear[hero.classId].map((name,i)=>`<div class="equipment-slot">${icon(i ? 'hero':'arena')}<h3>${name}</h3><span>Przedmiot startowy</span></div>`).join('')}</div><p class="panel-note">Złoto: 25 · Odłamki: 0</p>`;
    } else if (id === 'journal') {
      content = `<div class="journal-entry">${icon('journal')}<div><h3>Przybycie do osady</h3><p>Twoja postać dotarła do Osady Popiołów.</p><span class="state-badge">Zapisane</span></div></div>`;
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
    ['ŚWIAT',['map','tavern','arena','dungeon']],
    ['HANDEL',['forge','alchemy','market']],
    ['BOHATER',['hero','inventory','journal','guild']]
  ].map(([name,ids])=>`<div class="nav-group"><h2>${name}</h2><div class="nav-grid">${ids.map(id=>`<button type="button" class="nav-tile" data-place="${id}" aria-current="${id==='map'?'page':'false'}" title="${places[id].name}">${icon(places[id].icon)}<span>${places[id].name}</span></button>`).join('')}</div></div>`).join('');
  $('#map-pins').innerHTML = Object.entries(places).filter(([,p])=>p.x).map(([id,p])=>`<button type="button" class="map-pin pin-${id}" data-place="${id}" style="--x:${p.x}%;--y:${p.y}%" aria-label="${p.name}"><span class="pin-medallion">${icon(p.icon)}</span><span class="pin-label">${p.name}</span></button>`).join('');
  $('#ready').addEventListener('click',e=>{const button=e.target.closest('[data-place]');if(button)openPlace(button.dataset.place);});
  $('#close-place').addEventListener('click',()=>$('#place-dialog').close());
  $('#place-dialog').addEventListener('click',e=>{if(e.target===$('#place-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
  $('#menu-toggle').addEventListener('click',()=>toggleMenu(!$('#sidebar').classList.contains('is-open')));
  $('#close-menu').addEventListener('click',()=>toggleMenu(false));
  $('#sidebar-scrim').addEventListener('click',()=>toggleMenu(false));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')toggleMenu(false);});
  window.mountHub = data => {
    hero = data;
    $('#avatar-art').className = `character ${data.gender} ${data.classId}`;
    toggleMenu(false);
    requestAnimationFrame(() => { const view = $('.world-viewport'); view.scrollLeft = Math.max(0,(view.scrollWidth-view.clientWidth)/2); });
    document.querySelectorAll('.nav-tile').forEach(el=>el.setAttribute('aria-current',el.dataset.place==='map'?'page':'false'));
  };
})();
