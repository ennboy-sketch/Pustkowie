'use strict';
(() => {
  const LOCATIONS=Object.freeze([
    Object.freeze({id:'graveyard',name:'Cmentarzysko',requiredLevel:10,description:'Między popękanymi nagrobkami snuje się zimna mgła.',icon:'dungeon-graveyard-icon.webp'}),
    Object.freeze({id:'gryphon-hills',name:'Wzgórza Gryfów',requiredLevel:30,description:'Nad skalistymi szczytami krążą strażnicy przestworzy.',icon:'dungeon-gryphon-hills-icon.webp'}),
    Object.freeze({id:'catacombs',name:'Katakumby',requiredLevel:50,description:'Pod zamkiem ciągną się korytarze zapomnianych grobowców.',icon:'dungeon-catacombs-icon.webp'})
  ]);
  function emblem(location){return `<span class="dungeon-emblem" aria-hidden="true"><img src="${location.icon}" alt="" width="384" height="384" decoding="async" draggable="false"></span>`;}
  function markup(){return '<section class="dungeons-panel" aria-label="Wybór Lochów"><div class="dungeons-view"></div><div class="dungeon-combat"></div><p class="dungeons-message" role="status" aria-live="polite"></p></section>';}
  function mount(root,state){
    const panel=root.querySelector('.dungeons-panel'),view=panel.querySelector('.dungeons-view'),message=panel.querySelector('.dungeons-message');
    let selected=state.read().activeCombat?.source==='graveyard'?LOCATIONS[0]:null,disposed=false,busy=false;
    const result=document.createElement('dialog');result.className='grave-result-dialog';result.setAttribute('aria-labelledby','grave-result-title');document.body.append(result);
    const labels={gold:'Złoto',xp:'EXP',shards:'Odłamki',magicDust:'Magiczny pył',rareMaterial:'Rzadki Materiał',deadBones:'Kość truposza',blackSteel:'Czarny kawałek stali',axe:'Topór Minotaura'};
    function rewardIcon(key){if(['gold','xp','shards'].includes(key))return `<span class="rpg-icon icon-${{gold:'coin',xp:'exp',shards:'shard'}[key]}" aria-hidden="true"></span>`;if(['magicDust','rareMaterial'].includes(key))return `<img src="${key==='magicDust'?'magic-dust.webp':'rare-material.webp'}" alt="">`;return `<span class="gear-art ${key==='axe'?'minotaur-axe-art':'material-'+key}" aria-hidden="true"></span>`;}
    function showResult(last){if(!last)return;result.innerHTML=`<h2 id="grave-result-title">${last.won?'Nagroda za pokonanie bossa':'Porażka'}</h2><p class="grave-result-boss">${window.Graveyard.BOSSES[last.index].name}</p>${last.won?`<dl class="grave-result-items">${Object.entries(last.reward).filter(([,amount])=>amount>0).map(([key,amount])=>`<div data-boss-reward="${key}"><dt>${rewardIcon(key)}<span>${labels[key]}</span></dt><dd>${amount}</dd></div>`).join('')}</dl>${last.levelsGained>0?`<p>Awans! Zdobyte poziomy: ${last.levelsGained}</p>`:''}`:(window.BrandCombat.isNecromancer(state.read())?'<p>Nie otrzymujesz nagrody. Możesz walczyć ponownie bez czekania.</p>':'<p>Nie otrzymujesz nagrody. Kolejna próba po 3 godzinach.</p>')}<p class="dungeon-cooldown" data-dungeon-cooldown></p><button type="button" class="primary" data-close-grave-result autofocus>Wróć do Cmentarzyska</button>`;refreshCooldown();if(!result.open)result.showModal();}
    function closeResult(e){if(e.target.closest('[data-close-grave-result]'))result.close();}result.addEventListener('click',closeResult);
    const combat=window.BrandCombat.mount(panel.querySelector('.dungeon-combat'),{...state,onQuestResolved:next=>{render(next);showResult(next.lastGraveyard);}});
    function render(hero){
      const level=window.Progression.level(hero);
      if(selected&&level<selected.requiredLevel)selected=null;
      state.onTitle?.(selected?.name||'Lochy');
      message.textContent='';
      view.innerHTML=selected?`<div class="dungeon-detail dungeon-${selected.id}">${emblem(selected)}<h3 tabindex="-1">${selected.name}</h3><p>${selected.description}</p>${selected.id==='graveyard'?window.Graveyard.markup(hero):'<span class="state-badge">W przygotowaniu</span>'}<button type="button" class="secondary" data-dungeons-back>Wróć do wyboru Lochów</button></div>`:`<p class="dungeons-intro">Wybierz loch, do którego chcesz się udać. <span>Twój poziom: ${level}</span></p><div class="dungeons-list">${LOCATIONS.map(location=>{
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
    function refreshCooldown(){
      if(disposed)return;
      try{const h=state.read(),clock=window.Graveyard.cooldown(h),n=window.Graveyard.count(h);for(const container of [panel,result])container.querySelectorAll('[data-dungeon-cooldown]').forEach(el=>el.textContent=clock.remaining?'Kolejna walka w lochach za '+clock.text:'Walka w lochach dostępna.');view.querySelectorAll('[data-grave-boss]').forEach(button=>button.disabled=busy||Number(button.dataset.graveBoss)!==n||!!h.activeCombat||!!h.activeMission||clock.remaining>0);}
      catch{view.querySelectorAll('[data-grave-boss]').forEach(button=>button.disabled=true);}
    }
    const cooldownTimer=setInterval(refreshCooldown,1000);
    function refresh(){if(disposed)return;const hero=read();if(hero)render(hero);}
    async function click(event){
      const boss=event.target.closest('[data-grave-boss]'),resume=event.target.closest('[data-resume-graveyard]');
      if(boss||resume){if(busy)return;busy=true;try{if(boss){const change=()=>state.update(h=>window.Graveyard.start(h,Number(boss.dataset.graveBoss)));const next=navigator.locks?await navigator.locks.request('pustkowie-hero-v2',change):change();if(disposed)return;render(next);}await combat.open();}catch(error){if(!disposed)message.textContent=error.message;}finally{busy=false;}return;}

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
    return ()=>{disposed=true;clearInterval(cooldownTimer);combat();result.removeEventListener('click',closeResult);if(result.open)result.close();result.remove();panel.removeEventListener('click',click);window.removeEventListener('storage',storage);window.removeEventListener('focus',refresh);};
  }
  window.DungeonsPanel={LOCATIONS,markup,mount};
})();
