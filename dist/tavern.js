'use strict';
(() => {
  const people = {
    tobiasz:{name:'Tobiasz',role:'Karczmarz',line:'Siadaj. Przy ogniu łatwiej zapomnieć o chłodzie.'},
    brand:{name:'Dowódca Brand',role:'Dowódca',line:'Zanim wyruszysz, poznaj ludzi tego zamku.'},
    tauriel:{name:'Tauriel',role:'Elfka',line:'Nie każda historia nadaje się do opowiedzenia przy całej sali.'}
  };
  function markup() {
    return `<section class="tavern-panel" aria-label="Wnętrze karczmy"><div class="tavern-scenes" aria-label="Widoki karczmy"><div class="tavern-scene tavern-main" aria-label="Sala główna"><img class="tavern-art" src="tavern.webp" alt="Mroczna karczma: Tobiasz za ladą po lewej, Dowódca Brand przy stole i elfka Tauriel po prawej." draggable="false"><div class="tavern-vignette" aria-hidden="true"></div>${Object.entries(people).map(([id,p])=>`<button type="button" class="npc-marker npc-${id}" data-npc="${id}" aria-label="Porozmawiaj: ${p.name}" aria-pressed="false"><span>${p.name}</span><small>${p.role}</small></button>`).join('')}</div><div class="tavern-scene tavern-stairs" aria-label="Schody na piętro" aria-hidden="true" inert><img class="tavern-art" src="tavern-stairs.webp" alt="Drewniane schody po prawej stronie karczmy prowadzące do zamkniętych drzwi na piętrze." draggable="false"><div class="tavern-vignette" aria-hidden="true"></div><div class="stairs-lock"><span class="stairs-lock-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 10V7a5 5 0 0110 0v3M5 10h14v12H5zM12 14v4"/></svg></span><button type="button" class="secondary" disabled aria-describedby="stairs-requirement">Wejście na piętro · Zamknięte</button><p id="stairs-requirement">Odblokowanie po wykonaniu misji od Tauriel.</p><small>Misja jeszcze niedostępna.</small></div></div></div><nav class="tavern-navigation" aria-label="Przesuwanie widoku karczmy"><button type="button" data-tavern-page="0" aria-label="Przesuń w lewo: sala główna" disabled>‹</button><span class="tavern-page-label" aria-live="polite">Sala główna <small>1 / 2</small></span><button type="button" data-tavern-page="1" aria-label="Przesuń w prawo: schody">›</button></nav><div class="tavern-dialogue" role="status" aria-live="polite"><span class="tavern-dialogue-name"></span><p class="tavern-dialogue-line">Wybierz postać, aby porozmawiać.</p></div></section>`;
  }
  function mount(root) {
    const panel = root.querySelector('.tavern-panel');
    const view = panel.querySelector('.tavern-scenes');
    let page = 0;
    function showPage(next) {
      if (next === page) return;
      page = next;
      panel.querySelectorAll('.tavern-scene').forEach((el,i)=>{el.inert=i!==page;el.setAttribute('aria-hidden',String(i!==page));});
      panel.querySelectorAll('[data-tavern-page]').forEach(el=>el.disabled=Number(el.dataset.tavernPage)===page);
      panel.querySelector('.tavern-page-label').innerHTML=page===0?'Sala główna <small>1 / 2</small>':'Schody na piętro <small>2 / 2</small>';
      panel.querySelectorAll('[data-npc]').forEach(el=>el.setAttribute('aria-pressed','false'));
      panel.querySelector('.tavern-dialogue-name').textContent=page===0?'':'Wejście zamknięte';
      panel.querySelector('.tavern-dialogue-line').textContent=page===0?'Wybierz postać, aby porozmawiać.':'Piętro odblokujesz po wykonaniu misji od Tauriel. Misja pojawi się w późniejszym etapie.';
    }
    view.addEventListener('scroll',()=>showPage(Math.max(0,Math.min(1,Math.round(view.scrollLeft/view.clientWidth)))),{passive:true});
    panel.addEventListener('click',e=>{
      const navigation=e.target.closest('[data-tavern-page]');
      if(navigation){view.scrollTo({left:Number(navigation.dataset.tavernPage)*view.clientWidth,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});return;}
      const button=e.target.closest('[data-npc]');
      if(!button || !people[button.dataset.npc] || page!==0)return;
      const person=people[button.dataset.npc];
      panel.querySelectorAll('[data-npc]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));
      panel.querySelector('.tavern-dialogue-name').textContent=person.name;
      panel.querySelector('.tavern-dialogue-line').textContent=person.line;
    });
  }
  window.TavernPanel={markup,mount};
})();
