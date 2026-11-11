'use strict';
(() => {
  const ROOMS={
    entrance:{title:'Komnaty z Czarnej Stali',image:'castle-antechamber.webp',alt:'Przedsionek zamku z trzema parami drzwi. Dwóch strażników stoi po bokach środkowych drzwi do sali tronowej. Lewe drzwi prowadzą do Komnaty Leśnej Przysięgi, a prawe do Archiwum Pieczęci.'},
    throne:{title:'Sala tronowa',image:'castle-throne-queen.webp',alt:'Sala tronowa: rudowłosa królowa w złotej koronie z rubinami, bordowych szatach ze złotym haftem i zdobionych butach siedzi na tronie z lwimi podłokietnikami.'},
    school:{title:'Komnata Leśnej Przysięgi',image:'lyrien-chamber.webp',alt:'Lyrien, elfka o srebrzystoliliowych włosach, w zielonych szatach ze złotymi haftami, biżuterią ze szmaragdami i zdobionych butach, stoi w kamiennej komnacie zamku. Wokół zielone chorągwie, łuki, tarcza treningowa, księgi i pochodnie.'},
    archive:{title:'Archiwum Pieczęci',image:'severin-archive.webp',alt:'Severin, siwowłosy Mistrz Pieczęci w czarnozielonych szatach ze złotym łańcuchem urzędu, stoi przy stole w gotyckim archiwum. Wokół księgi, królewskie stemple, zapieczętowane dokumenty, mapa i mosiężne astrolabium.'}
  };
  let openSchool=()=>{};
  function markup(){
    return `<section class="castle-panel" aria-label="Komnaty z Czarnej Stali"><div class="castle-viewport" role="region" tabindex="0" aria-label="Przesuwany widok komnaty zamku" aria-describedby="castle-pan-hint"><div class="castle-panorama"><img class="castle-art" src="${ROOMS.entrance.image}" alt="${ROOMS.entrance.alt}" draggable="false"><button type="button" class="castle-throne-door" data-castle-throne aria-label="Wejdź do sali tronowej"><span>Sala tronowa</span></button><button type="button" class="castle-throne-door castle-school-door" data-castle-school aria-label="Wejdź do Komnaty Leśnej Przysięgi"><span>Komnata Leśnej Przysięgi</span></button><button type="button" class="castle-throne-door castle-archive-door" data-castle-archive aria-label="Wejdź do Archiwum Pieczęci"><span>Archiwum Pieczęci</span></button><button type="button" class="castle-severin" data-castle-severin aria-label="Porozmawiaj z Severinem, Mistrzem Pieczęci" hidden><span>Severin</span><small>Mistrz Pieczęci</small></button><button type="button" class="castle-lyrien" data-castle-lyrien aria-label="Porozmawiaj z Lyrien o profesjach Elfa" hidden><span>Lyrien</span></button></div></div><button type="button" class="castle-return secondary" data-castle-return hidden>Wróć do przedsionka</button><p class="sr-only" id="castle-pan-hint">Przesuwaj widok palcem lub myszą. Przybliżaj dwoma palcami, kółkiem myszy lub klawiszami plus i minus. Środkowe drzwi prowadzą do sali tronowej, lewe do Komnaty Leśnej Przysięgi, a prawe do Archiwum Pieczęci. W komnacie kliknij podpis Lyrien, aby porozmawiać o profesjach.</p><p class="castle-campaign-note" data-castle-message role="status"></p><dialog class="castle-severin-dialog" aria-labelledby="castle-severin-title"><h2 id="castle-severin-title" tabindex="-1">Severin — Mistrz Pieczęci</h2><p class="castle-severin-line"></p><button type="button" class="primary" data-open-campaign>Otwórz dziennik kampanii</button><button type="button" class="secondary" data-close-castle-severin>Wróć do archiwum</button></dialog><dialog class="castle-school-dialog" aria-labelledby="castle-school-title"><h2 id="castle-school-title" tabindex="-1">Lyrien</h2><p>Witaj w Komnacie Leśnej Przysięgi. Jestem Lyrien — uczę Elfy ich profesji. Szkolenie jest dostępne od 10. poziomu.</p><div class="castle-school-content"></div><button type="button" class="secondary" data-close-castle-school>Wróć do komnaty</button></dialog></section>`;
  }
  function mount(root,{read=()=>({}),update=fn=>fn(read()),onTitle=()=>{},professionMarkup=()=>'<p>Profesje w przygotowaniu.</p>'}={}){
    const panel=root.querySelector('.castle-panel'),view=panel.querySelector('.castle-viewport'),scene=panel.querySelector('.castle-panorama'),art=panel.querySelector('.castle-art'),door=panel.querySelector('[data-castle-throne]'),back=panel.querySelector('[data-castle-return]'),schoolDoor=panel.querySelector('[data-castle-school]'),mentor=panel.querySelector('[data-castle-lyrien]'),school=panel.querySelector('.castle-school-dialog');
    let disposed=false,centered=false,room='entrance',stopZoom=window.SceneZoom.mount(view,scene);
    const archiveDoor=panel.querySelector('[data-castle-archive]'),severin=panel.querySelector('[data-castle-severin]'),archive=panel.querySelector('.castle-severin-dialog');
    function remember(place){
      const change=()=>{if(disposed||!window.OathCampaign)return;const h=read();if(window.OathCampaign.visit(h,place)!==h)update(latest=>window.OathCampaign.visit(latest,place));};
      Promise.resolve(navigator.locks?navigator.locks.request('pustkowie-hero-v2',change):change()).catch(()=>{if(!disposed)panel.querySelector('[data-castle-message]').textContent='Nie udało się zapisać wizyty. Spróbuj wejść do komnaty ponownie.';});
    }
    function fit(){
      if(disposed||!view.clientWidth)return;
      const height=Math.max(600,view.clientHeight),ratio=art.naturalWidth&&art.naturalHeight?art.naturalWidth/art.naturalHeight:1.5;
      scene.style.height=`${height}px`;scene.style.width=`${Math.max(view.clientWidth,height*ratio)}px`;
      if(!centered&&art.complete&&art.naturalWidth){view.scrollLeft=Math.max(0,(scene.clientWidth-view.clientWidth)/2);view.scrollTop=room==='school'?Math.max(0,mentor.offsetTop+mentor.offsetHeight/2+24-view.clientHeight):room==='archive'?Math.max(0,severin.offsetTop+severin.offsetHeight+18-view.clientHeight):0;centered=true;}
    }
    function show(next){
      if(disposed||!Object.hasOwn(ROOMS,next))return;
      if(school.open)school.close();
      if(archive.open)archive.close();
      stopZoom();centered=false;room=next;panel.dataset.castleRoom=room;
      door.hidden=room!=='entrance';schoolDoor.hidden=room!=='entrance';archiveDoor.hidden=room!=='entrance';mentor.hidden=room!=='school';severin.hidden=room!=='archive';back.hidden=!['throne','archive'].includes(room);
      art.src=ROOMS[room].image;art.alt=ROOMS[room].alt;
      view.setAttribute('aria-label',`Przesuwany widok: ${ROOMS[room].title}`);
      onTitle(ROOMS[room].title);
      stopZoom=window.SceneZoom.mount(view,scene);fit();
      view.focus({preventScroll:true});
      if(room==='archive'||room==='throne')remember(room);
    }
    function talk(){
      if(disposed)return;
      school.querySelector('.castle-school-content').innerHTML=professionMarkup();
      if(!school.open)school.showModal();
      school.querySelector('h2').focus({preventScroll:true});school.scrollTop=0;
    }
    // Restore the room and conversation after choosing a profession.
    openSchool=()=>{if(room!=='school')show('school');talk();};
    function click(e){
      if(e.target.closest('[data-close-castle-school]')){school.close();return;}
      if(e.target.closest('[data-close-castle-severin]')){archive.close();return;}
      if(e.target.closest('[data-castle-archive]')){show('archive');return;}
      if(e.target.closest('[data-castle-severin]')){archive.querySelector('.castle-severin-line').textContent=window.CampaignPanel.contact(read());if(!archive.open)archive.showModal();archive.querySelector('h2').focus({preventScroll:true});return;}
      if(e.target.closest('[data-castle-school]'))show('school');
      else if(e.target.closest('[data-castle-lyrien]'))talk();
      else if(e.target.closest('[data-castle-throne]'))show('throne');
      else if(e.target.closest('[data-castle-return]'))show('entrance');
    }
    art.addEventListener('load',fit);panel.addEventListener('click',click);
    const observer=new ResizeObserver(fit);observer.observe(view);fit();
    return ()=>{disposed=true;openSchool=()=>{};if(school.open)school.close();if(archive.open)archive.close();observer.disconnect();stopZoom();art.removeEventListener('load',fit);panel.removeEventListener('click',click);};
  }
  window.CastlePanel={openRoom:id=>{const selector={school:'[data-castle-school]',throne:'[data-castle-throne]',archive:'[data-castle-archive]'}[id];if(selector)document.querySelector(selector)?.click();},markup,mount,openSchool:()=>openSchool()};
})();
