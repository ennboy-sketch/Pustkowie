'use strict';
(() => {
  const people = {
    tobiasz:{name:'Tobiasz',role:'Karczmarz',line:'Siadaj. Przy ogniu łatwiej zapomnieć o chłodzie.'},
    brand:{name:'Dowódca Brand',role:'Dowódca',line:'Zanim wyruszysz, poznaj ludzi tego zamku.'},
    tauriel:{name:'Tauriel',role:'Elfka',line:'Nie każda historia nadaje się do opowiedzenia przy całej sali.'}
  };
  function markup() {
    return `<section class="tavern-panel" aria-label="Wnętrze karczmy"><div class="tavern-scene"><img class="tavern-art" src="tavern.webp" alt="Mroczna karczma: Tobiasz za ladą po lewej, Dowódca Brand przy stole i elfka Tauriel po prawej."><div class="tavern-vignette" aria-hidden="true"></div>${Object.entries(people).map(([id,p])=>`<button type="button" class="npc-marker npc-${id}" data-npc="${id}" aria-label="Porozmawiaj: ${p.name}" aria-pressed="false"><span>${p.name}</span><small>${p.role}</small></button>`).join('')}</div><div class="tavern-dialogue" role="status" aria-live="polite"><span class="tavern-dialogue-name"></span><p class="tavern-dialogue-line">Wybierz postać, aby porozmawiać.</p></div></section>`;
  }
  function mount(root) {
    root.querySelector('.tavern-panel').addEventListener('click',e=>{
      const button=e.target.closest('[data-npc]');
      if(!button || !people[button.dataset.npc])return;
      const person=people[button.dataset.npc];
      root.querySelectorAll('[data-npc]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));
      root.querySelector('.tavern-dialogue-name').textContent=person.name;
      root.querySelector('.tavern-dialogue-line').textContent=person.line;
    });
  }
  window.TavernPanel={markup,mount};
})();
