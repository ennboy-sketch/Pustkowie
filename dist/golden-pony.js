'use strict';
(()=>{
 const PEOPLE=Object.freeze([
  Object.freeze({id:'roderik',name:'Roderik Żelazny Kruk',shortName:'Roderik',role:'Najemnik · Tarczownik',x:51,y:81,portrait:[51,50],line:'Siadaj, jeśli szukasz spokojnej rozmowy. Tarczę odkładam dopiero wtedy, gdy wiem, kto stoi za moimi plecami.',description:'Siwowłosy weteran w zużytej brygantynie. Przy jego krześle spoczywa okrągła tarcza ze znakiem kruka, a miecz pozostaje w pochwie.',topics:Object.freeze([
   Object.freeze({label:'Zapytaj o jego fach',reply:'Przez dwadzieścia zim osłaniałem karawany. Dobra tarcza nie służy do popisów. Ma dać komuś za tobą czas, żeby wrócił do domu.'}),
   Object.freeze({label:'Zapytaj o pogranicze',reply:'W Popielnym Borze znalazłem ślady wilków, które wypalały ziemię. Nie rozbijaj tam obozu przy martwych drzewach. I zawsze zostaw sobie drogę odwrotu.'})
  ])}),
  Object.freeze({id:'mira',name:'Mira Szary Szlak',shortName:'Mira',role:'Najemniczka · Tropicielka',x:76,y:68,portrait:[79,39],line:'Przy oknie łatwiej widzieć drogę. Jeśli ktoś przyjdzie z lasu, wolę dostrzec go przed otwarciem drzwi.',description:'Tropicielka o kasztanowym warkoczu, w zielonym płaszczu i praktycznym skórzanym rynsztunku. Kuszę trzyma blisko, lecz nie celuje w gości.',topics:Object.freeze([
   Object.freeze({label:'Zapytaj o jej fach',reply:'Prowadzę ludzi tam, gdzie kończą się drogowskazy. Czytam błoto, złamane gałązki i ciszę między odgłosami lasu. Kusza przydaje się dopiero, gdy zawiedzie reszta.'}),
   Object.freeze({label:'Zapytaj o rozlewiska',reply:'Na Martwych Rozlewiskach nie podążaj za zielonym światłem. Kamienie grobli są pewniejsze od ogników, nawet kiedy prawie nie widać ich pod wodą.'})
  ])}),
  Object.freeze({id:'durgan',name:'Durgan Krzemień',shortName:'Durgan',role:'Najemnik · Łamacz tarcz',x:24,y:87,portrait:[18,50],line:'Dobry młot, suchy płaszcz i pełny kufel. Na dziś nie potrzebuję więcej. No, może jeszcze kogoś, kto umie słuchać.',description:'Krępy krasnolud z rudą brodą spiętą brązowymi obręczami. Nosi kolczugę pod skórzanym kaftanem, a ciężki młot wisi bezpiecznie przy pasie.',topics:Object.freeze([
   Object.freeze({label:'Zapytaj o jego fach',reply:'Rozbijam to, co staje na drodze drużynie. Drzwi, tarcze, czasem kamienne strażniki. Najpierw jednak sprawdzam, czy ktoś nie zostawił zwykłej klamki.'}),
   Object.freeze({label:'Zapytaj o kopalnie',reply:'W Kopalniach Czarnego Żaru ruda grzeje, choć piece dawno wygasły. Kiedy skała oddycha cieplej od kowalskiego paleniska, lepiej nie pchać kilofa zbyt głęboko.'})
  ])})
 ]);
 function markup(){return `<section class="golden-pony-panel" aria-label="Wnętrze karczmy Pod Złotym Kucem">
  <div class="golden-pony-people" aria-label="Rozmówcy w karczmie"><span>Przy wspólnym stole</span><div>${PEOPLE.map(person=>`<button type="button" data-pony-npc="${person.id}" aria-label="Porozmawiaj: ${person.name}" aria-haspopup="dialog" aria-pressed="false">${person.shortName}</button>`).join('')}</div></div>
  <div class="golden-pony-viewport" tabindex="0" role="region" aria-label="Przesuwany widok karczmy Pod Złotym Kucem" aria-describedby="golden-pony-hint"><div class="golden-pony-panorama"><img class="golden-pony-art" src="golden-pony-mercenaries.webp" alt="Drewniana sala Pod Złotym Kucem. Roderik Żelazny Kruk siedzi przy stole obok zielonego pieca, Mira Szary Szlak stoi przy oknach, a Durgan Krzemień odpoczywa przy barze. Przy przednim stole po prawej jedno krzesło pozostaje puste." draggable="false"><div class="golden-pony-vignette" aria-hidden="true"></div>${PEOPLE.map(person=>`<button type="button" class="pony-npc-marker" style="left:${person.x}%;top:${person.y}%" data-pony-npc="${person.id}" aria-label="Porozmawiaj: ${person.name}" aria-haspopup="dialog" aria-pressed="false"><span>${person.name}</span><small>${person.role}</small></button>`).join('')}<span class="pony-reserved-seat" data-pony-reserved-seat="fourth" role="note">Wolne miejsce</span></div></div>
  <p id="golden-pony-hint" class="sr-only">Przeciągaj widok myszą lub palcem. Przybliżaj kółkiem, gestem dwóch palców lub klawiszami plus i minus. Kliknij imię najemnika w sali lub nad widokiem, aby porozmawiać. Przy przednim stole po prawej czeka jedno wolne krzesło. Wyjście z karczmy znajduje się pod X w prawym górnym rogu.</p>
  <dialog class="pony-npc-dialog" aria-labelledby="pony-speaker"><h3 id="pony-speaker" tabindex="-1"></h3><div class="pony-npc-profile"><div class="pony-npc-portrait" role="img"></div><div><p class="pony-npc-role"></p><p class="pony-npc-description"></p></div></div><p class="pony-npc-line"></p><div class="pony-npc-topics"></div><p class="pony-npc-reply" role="status" aria-live="polite"></p><button type="button" class="secondary" data-close-pony-npc>Wróć do sali</button></dialog>
 </section>`;}
 function mount(root){
  const panel=root.querySelector('.golden-pony-panel'),view=panel.querySelector('.golden-pony-viewport'),scene=view.firstElementChild,art=scene.querySelector('img'),dialog=panel.querySelector('.pony-npc-dialog');
  let disposed=false,centered=false,speaker=null;
  function fit(){if(disposed||!view.clientWidth)return;const ratio=art.naturalWidth?art.naturalWidth/art.naturalHeight:1.5,height=Math.max(600,view.clientHeight,view.clientWidth/ratio);scene.style.width=`${height*ratio}px`;scene.style.height=`${height}px`;if(!centered&&art.complete&&art.naturalWidth){view.scrollLeft=Math.max(0,(scene.clientWidth-view.clientWidth)/2);view.scrollTop=Math.max(0,(scene.clientHeight-view.clientHeight)/2);centered=true;}}
  function open(id){
   const person=PEOPLE.find(person=>person.id===id);if(disposed||!person)return;speaker=person;
   dialog.querySelector('h3').textContent=person.name;dialog.querySelector('.pony-npc-role').textContent=person.role;dialog.querySelector('.pony-npc-description').textContent=person.description;
   const portrait=dialog.querySelector('.pony-npc-portrait');portrait.setAttribute('aria-label',person.description);portrait.style.backgroundPosition=`${person.portrait[0]}% ${person.portrait[1]}%`;
   dialog.querySelector('.pony-npc-line').textContent=person.line;dialog.querySelector('.pony-npc-reply').textContent='';
   dialog.querySelector('.pony-npc-topics').innerHTML=person.topics.map((topic,index)=>`<button type="button" class="secondary" data-pony-topic="${index}">${topic.label}</button>`).join('');
   panel.querySelectorAll('[data-pony-npc]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.ponyNpc===id)));
   if(!dialog.open)dialog.showModal();dialog.scrollTop=0;dialog.querySelector('h3').focus({preventScroll:true});
  }
  function click(event){if(disposed)return;const npc=event.target.closest('[data-pony-npc]');if(npc){open(npc.dataset.ponyNpc);return;}if(event.target.closest('[data-close-pony-npc]')){dialog.close();return;}const topic=event.target.closest('[data-pony-topic]');if(topic&&speaker&&dialog.open){const reply=speaker.topics[Number(topic.dataset.ponyTopic)];if(reply)dialog.querySelector('.pony-npc-reply').textContent=reply.reply;}}
  function closed(){if(dialog.open)return;speaker=null;panel.querySelectorAll('[data-pony-npc]').forEach(button=>button.setAttribute('aria-pressed','false'));}
  art.addEventListener('load',fit);panel.addEventListener('click',click);dialog.addEventListener('close',closed);
  const observer=new ResizeObserver(fit);observer.observe(view);fit();
  return()=>{disposed=true;speaker=null;observer.disconnect();art.removeEventListener('load',fit);panel.removeEventListener('click',click);dialog.removeEventListener('close',closed);if(dialog.open)dialog.close();};
 }
 window.GoldenPony={PEOPLE,markup,mount};
})();
