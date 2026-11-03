'use strict';
(() => {
  const LOCATIONS=Object.freeze([
    Object.freeze({id:'graveyard',name:'Cmentarzysko',requiredLevel:10,description:'Między popękanymi nagrobkami snuje się zimna mgła.',icon:'dungeon-graveyard-icon.webp'}),
    Object.freeze({id:'gryphon-hills',name:'Wzgórza Gryfów',requiredLevel:20,description:'Nad skalistymi szczytami krążą strażnicy przestworzy.',icon:'dungeon-gryphon-hills-icon.webp'}),
    Object.freeze({id:'catacombs',name:'Katakumby',requiredLevel:30,description:'Pod zamkiem ciągną się korytarze zapomnianych grobowców.',icon:'dungeon-catacombs-icon.webp'})
  ]);
  function emblem(location){return `<span class="dungeon-emblem" aria-hidden="true"><img src="${location.icon}" alt="" width="384" height="384" decoding="async" draggable="false"></span>`;}
  function markup(){return '<section class="dungeons-panel" aria-label="Wybór Lochów"><div class="dungeons-view"></div><p class="dungeons-message" role="status" aria-live="polite"></p></section>';}
  function mount(root,state){
    const panel=root.querySelector('.dungeons-panel'),view=panel.querySelector('.dungeons-view'),message=panel.querySelector('.dungeons-message');
    let selected=null,disposed=false;
    function render(hero){
      const level=window.Progression.level(hero);
      if(selected&&level<selected.requiredLevel)selected=null;
      state.onTitle?.(selected?.name||'Lochy');
      message.textContent='';
      view.innerHTML=selected?`<div class="dungeon-detail dungeon-${selected.id}">${emblem(selected)}<h3 tabindex="-1">${selected.name}</h3><p>${selected.description}</p><span class="state-badge">W przygotowaniu</span><button type="button" class="secondary" data-dungeons-back>Wróć do wyboru Lochów</button></div>`:`<p class="dungeons-intro">Wybierz loch, do którego chcesz się udać. <span>Twój poziom: ${level}</span></p><div class="dungeons-list">${LOCATIONS.map(location=>{
        const locked=level<location.requiredLevel;
        return `<button type="button" class="dungeon-choice dungeon-${location.id}" data-dungeon="${location.id}" aria-label="${location.name} · Od poziomu ${location.requiredLevel} · ${locked?'Zablokowane':'Dostępne'}" ${locked?'disabled':''}>${emblem(location)}<span class="dungeon-choice-body"><strong>${location.name}</strong><span class="dungeon-required">Od poziomu ${location.requiredLevel}</span><span class="dungeon-availability">${locked?'Zablokowane':'Dostępne'}</span></span></button>`;
      }).join('')}</div>`;
    }
    function read(){
      try{return state.read();}
      catch{
        view.querySelectorAll('button').forEach(button=>button.disabled=true);
        message.textContent='Nie można odczytać poziomu postaci. Zamknij Lochy i spróbuj ponownie.';
        return null;
      }
    }
    function refresh(){if(disposed)return;const hero=read();if(hero)render(hero);}
    function click(event){
      const back=event.target.closest('[data-dungeons-back]'),button=event.target.closest('[data-dungeon]');
      if(!back&&!button)return;
      const hero=read();if(!hero)return;
      if(back){const id=selected?.id;selected=null;render(hero);view.querySelector(`[data-dungeon="${id}"]`)?.focus();return;}
      const location=LOCATIONS.find(location=>location.id===button.dataset.dungeon);if(!location)return;
      if(window.Progression.level(hero)<location.requiredLevel){selected=null;render(hero);message.textContent=`${location.name}: wymagany poziom postaci ${location.requiredLevel}.`;return;}
      selected=location;render(hero);view.querySelector('h3').focus();
    }
    function storage(event){if(event.key==='pustkowie.hero.v2'||event.key===null)refresh();}
    panel.addEventListener('click',click);window.addEventListener('storage',storage);window.addEventListener('focus',refresh);refresh();
    return ()=>{disposed=true;panel.removeEventListener('click',click);window.removeEventListener('storage',storage);window.removeEventListener('focus',refresh);};
  }
  window.DungeonsPanel={LOCATIONS,markup,mount};
})();
