'use strict';
(() => {
  const people = {
    tobiasz:{name:'Tobiasz',role:'Karczmarz',line:'Siadaj. Przy ogniu łatwiej zapomnieć o chłodzie.'},
    brand:{name:'Dowódca Brand',role:'Dowódca',line:'Zanim wyruszysz, poznaj ludzi tego zamku.'},
    tauriel:{name:'Tauriel',role:'Elfka',line:'Nie każda historia nadaje się do opowiedzenia przy całej sali.'}
  };
  let resizeObserver = null;
  function cancel() { if(resizeObserver){resizeObserver.disconnect();resizeObserver=null;} }
  function markup() {
    return `<section class="tavern-panel" aria-label="Wnętrze karczmy"><div class="tavern-viewport" tabindex="0" role="region" aria-label="Swobodnie przesuwany widok karczmy" aria-describedby="tavern-pan-hint"><div class="tavern-panorama"><img class="tavern-art" src="tavern-panorama.webp" alt="Jedno wnętrze karczmy: Tobiasz za ladą po lewej, Dowódca Brand przy stole, Tauriel pośrodku i schody po prawej." draggable="false"><div class="tavern-vignette" aria-hidden="true"></div>${Object.entries(people).map(([id,p])=>`<button type="button" class="npc-marker npc-${id}" data-npc="${id}" aria-label="Porozmawiaj: ${p.name}" aria-pressed="false"><span>${p.name}</span><small>${p.role}</small></button>`).join('')}<button type="button" class="stairs-hotspot" aria-label="Wejście na piętro"><span>Schody na piętro</span></button></div></div><p class="sr-only" id="tavern-pan-hint">Przesuń widok palcem lub przeciągnij myszą, aby rozejrzeć się po karczmie.</p><dialog class="tavern-npc-dialog" aria-labelledby="tavern-speaker"><h2 class="tavern-dialogue-name" id="tavern-speaker"></h2><p class="tavern-dialogue-line"></p><button type="button" class="secondary" data-close-npc autofocus>Wróć do karczmy</button></dialog><dialog class="tavern-lock-dialog" aria-labelledby="stairs-lock-title"><h2 id="stairs-lock-title">Wejście zablokowane</h2><p>Wejście na piętro odblokujesz po wykonaniu misji od Tauriel.</p><p class="panel-note">Misja jeszcze niedostępna.</p><button type="button" class="secondary" data-close-stairs autofocus>Wróć do karczmy</button></dialog></section>`;
  }
  function mount(root) {
    cancel();
    const panel = root.querySelector('.tavern-panel');
    const view = panel.querySelector('.tavern-viewport');
    const lock = panel.querySelector('.tavern-lock-dialog');
    const conversation = panel.querySelector('.tavern-npc-dialog');
    const panorama = panel.querySelector('.tavern-panorama');
    const art = panel.querySelector('.tavern-art');
    function fitPanorama() {
      if(!view.isConnected)return;
      const height = Math.max(625,view.clientHeight);
      const ratio = art.naturalWidth && art.naturalHeight ? art.naturalWidth/art.naturalHeight : 1.6;
      panorama.style.height = `${height}px`;
      panorama.style.width = `${height*ratio}px`;
    }
    art.addEventListener('load',fitPanorama);
    resizeObserver = new ResizeObserver(fitPanorama);
    resizeObserver.observe(view);
    let drag = null;
    let suppressClick = false;
    view.addEventListener('pointerdown',e=>{
      if(e.pointerType!=='mouse' || e.button!==0)return;
      suppressClick=false;
      drag={id:e.pointerId,x:e.clientX,y:e.clientY,left:view.scrollLeft,top:view.scrollTop,moved:false};
    });
    view.addEventListener('pointermove',e=>{
      if(!drag || drag.id!==e.pointerId)return;
      const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
      if(!drag.moved && Math.hypot(dx,dy)<6)return;
      if(!drag.moved){drag.moved=true;view.setPointerCapture(e.pointerId);view.classList.add('is-dragging');}
      e.preventDefault();view.scrollLeft=drag.left-dx;view.scrollTop=drag.top-dy;
    });
    function endDrag(e){
      if(!drag || drag.id!==e.pointerId)return;
      suppressClick=drag.moved;drag=null;view.classList.remove('is-dragging');
      if(view.hasPointerCapture(e.pointerId))view.releasePointerCapture(e.pointerId);
    }
    view.addEventListener('pointerup',endDrag);
    view.addEventListener('pointercancel',endDrag);
    view.addEventListener('pointerleave',e=>{if(drag && !drag.moved)endDrag(e);});
    view.addEventListener('click',e=>{if(suppressClick){e.preventDefault();e.stopImmediatePropagation();suppressClick=false;}},true);
    panel.addEventListener('click',e=>{
      if(e.target.closest('[data-close-npc]')){conversation.close();return;}
      if(e.target.closest('[data-close-stairs]')){lock.close();return;}
      if(e.target.closest('.stairs-hotspot')){if(!lock.open)lock.showModal();return;}
      const button=e.target.closest('[data-npc]');
      if(!button || !people[button.dataset.npc])return;
      const person=people[button.dataset.npc];
      panel.querySelectorAll('[data-npc]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));
      panel.querySelector('.tavern-dialogue-name').textContent=person.name;
      panel.querySelector('.tavern-dialogue-line').textContent=person.line;
      if(!conversation.open)conversation.showModal();
    });
  }
  window.TavernPanel={markup,mount,cancel};
})();
