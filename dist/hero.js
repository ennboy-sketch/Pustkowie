'use strict';
(() => {
  const SLOTS=[['helmet','Hełm'],['armor','Zbroja'],['boots','Buty'],['shield','Tarcza'],['weapon','Broń'],['necklace','Naszyjnik'],['earrings','Kolczyki']];
  const STATS=[['strength','Siła'],['agility','Zręczność'],['intelligence','Inteligencja'],['endurance','Wytrzymałość'],['luck','Szczęście']];
  const DROPS=['Hełm żelaznej straży','Zbroja wędrowca','Buty tropiciela','Tarcza czarnej stali','Ostrze wygnańca','Naszyjnik zielonego płomienia','Kolczyki starego srebra'];
  const STARTERS={warrior:['Wyszczerbiony miecz','Znoszona kolczuga'],mage:['Kostur czarnego jesionu','Szata wygnańca'],elf:['Łuk z martwego cisu','Płaszcz tropiciela'],dwarf:['Żelazny topór','Pancerz wędrowca']};
  function random(max){const a=new Uint32Array(1),limit=4294967296-4294967296%max;do{crypto.getRandomValues(a);}while(a[0]>=limit);return a[0]%max;}
  function allocations(hero){
    const out=Object.fromEntries(STATS.map(([id])=>[id,hero.statAllocations?.[id]??0]));
    if(Object.values(out).some(n=>!Number.isSafeInteger(n)||n<0)||Object.values(out).reduce((a,b)=>a+b,0)>(5+(window.Progression.level(hero)-1)*3))throw new Error('Nieprawidłowy zapis punktów cech.');
    return out;
  }
  function available(hero){return (5+(window.Progression.level(hero)-1)*3)-Object.values(allocations(hero)).reduce((a,b)=>a+b,0);}
  function bonuses(hero){const a=allocations(hero);return STATS.slice(0,4).map(([id])=>a[id]);}
  function luck(hero){return allocations(hero).luck;}
  function chance(hero){return Math.min(60,10+luck(hero));}
  function allocate(hero,id){
    if(!STATS.some(([key])=>key===id))throw new Error('Nieznana cecha.');
    if(available(hero)<1)throw new Error('Nie masz wolnych punktów cech.');
    const next=allocations(hero);next[id]++;return {...hero,statAllocations:next};
  }
  function inventory(hero){return hero.lootInventory??['weapon','armor'].map((slot,i)=>({id:`starter-${slot}`,slot,name:STARTERS[hero.classId][i]}));}
  function equipment(hero){return hero.equipment??{weapon:'starter-weapon',armor:'starter-armor'};}
  function equip(hero,slot,id){
    if(!SLOTS.some(([key])=>key===slot))throw new Error('Nieznane miejsce wyposażenia.');
    if(id&&!inventory(hero).some(item=>item.id===id&&item.slot===slot))throw new Error('Nie masz tego przedmiotu.');
    return {...hero,lootInventory:inventory(hero),equipment:{...equipment(hero),[slot]:id||null}};
  }
  function rollLoot(hero,draw=random){
    if(draw(10000)>=chance(hero)*100)return null;
    const i=draw(SLOTS.length);return {id:crypto.randomUUID(),slot:SLOTS[i][0],name:DROPS[i]};
  }
  function receiveLoot(hero,item){
    if(!item)return hero;
    if(!SLOTS.some(([slot],i)=>slot===item.slot&&DROPS[i]===item.name)||typeof item.id!=='string')throw new Error('Nieprawidłowy przedmiot.');
    const items=inventory(hero);return items.some(i=>i.id===item.id)?hero:{...hero,lootInventory:[...items,item]};
  }
  const art=i=>`<span class="gear-art gear-${i}" aria-hidden="true"></span>`;
  function inventoryMarkup(hero){
    return `<div class="hero-bag">${inventory(hero).map(item=>`<article>${art(SLOTS.findIndex(([slot])=>slot===item.slot))}<strong></strong><small>${SLOTS.find(([slot])=>slot===item.slot)?.[1]||''}</small></article>`).join('')}</div><p class="panel-note">Przedmioty zakładasz w oknie Bohater.</p>`;
  }
  function mount(root,state){
    root.innerHTML=`<section class="hero-v2"><div class="hero-loadout"><div class="hero-portrait"><div class="character" role="img" aria-label="Twoja postać"></div><div class="hero-identity"><h3></h3><span></span></div></div><div class="hero-luck-seal" title="Szansa na znalezienie przedmiotu">${art(7)}<span></span></div>${SLOTS.map(([id,label],i)=>`<button type="button" class="hero-gear-slot slot-${id}" data-gear-slot="${id}" aria-label="${label}">${art(i)}<span>${label}</span><small>Puste</small></button>`).join('')}</div><div class="hero-xp"><span></span><progress max="100" value="0" aria-label="Postęp poziomu"></progress><small></small></div><div class="hero-vitals"></div><div class="hero-attributes"><div class="hero-points"></div>${STATS.map(([id,label],i)=>`<div class="hero-attribute" data-attribute="${id}"><div><span>${label}</span><small>${id==='luck'?'Szansa na przedmiot':''}</small></div><strong></strong><button type="button" data-stat-add="${id}" aria-label="Zwiększ: ${label}">+</button></div>`).join('')}</div><p class="hero-point-note">5 punktów na start i 3 za każdy kolejny poziom.<br>Szczęście: +1 punkt procentowy szansy na przedmiot za punkt, maks. 60%.</p><p class="hero-message" role="status" aria-live="polite"></p></section>`;
    const picker=document.createElement('dialog');picker.className='hero-gear-picker';picker.setAttribute('aria-label','Wybierz wyposażenie');document.body.append(picker);
    let disposed=false,busy=false,selectedSlot=null;
    const locked=fn=>navigator.locks?navigator.locks.request('pustkowie-hero-v2',fn):fn();
    function render(){
      if(disposed)return;
      const hero=state.read(),profile=window.BrandCombat.profile(hero),xp=window.Progression.info(hero);
      const portrait=root.querySelector('.hero-portrait');portrait.querySelector('.character').className=`character ${hero.gender} ${hero.classId}`;portrait.querySelector('h3').textContent=hero.name;portrait.querySelector('.hero-identity>span').textContent=`Poziom ${xp.level}`;
      root.querySelector('.hero-xp>span').textContent=`Poziom ${xp.level} / 250`;root.querySelector('.hero-xp progress').value=xp.percent;root.querySelector('.hero-xp>small').textContent=xp.label;
      root.querySelector('.hero-luck-seal>span:last-child').textContent=`${chance(hero)}%`;
      root.querySelector('.hero-vitals').textContent=`Życie: ${profile.maxHp} / ${profile.maxHp}`;
      root.querySelector('.hero-points').textContent=`Punkty do rozdania: ${available(hero)}`;
      STATS.forEach(([id],i)=>{const row=root.querySelector(`[data-attribute="${id}"]`);row.querySelector('strong').textContent=i<4?profile.stats[i]:luck(hero);row.querySelector('button').disabled=busy||available(hero)<1;if(id==='luck')row.querySelector('small').textContent=`${chance(hero)}% szansy na przedmiot`;});
      for(const [slot,label] of SLOTS){const button=root.querySelector(`[data-gear-slot="${slot}"]`),item=inventory(hero).find(i=>i.id===equipment(hero)[slot]);button.classList.toggle('is-equipped',!!item);button.querySelector('small').textContent=item?'Założono':'Puste';button.setAttribute('aria-label',`${label}: ${item?.name||'Puste'}`);button.title=item?.name||label;}
    }
    function showPicker(slot){
      selectedSlot=slot;const hero=state.read(),items=inventory(hero).filter(i=>i.slot===slot);
      picker.innerHTML=`<h2>${SLOTS.find(([id])=>id===slot)[1]}</h2><div class="gear-pick-list"></div><button type="button" class="secondary" data-unequip>Zdejmij przedmiot</button><button type="button" class="secondary" data-close-gear>Wróć do postaci</button><p role="status"></p>`;
      const list=picker.querySelector('.gear-pick-list');if(!items.length)list.textContent='Nie masz jeszcze przedmiotu do tego miejsca.';
      for(const item of items){const button=document.createElement('button');button.type='button';button.dataset.equipItem=item.id;button.textContent=item.name+(equipment(hero)[slot]===item.id?' · Założono':'');list.append(button);}
      picker.querySelector('[data-unequip]').disabled=!equipment(hero)[slot];if(!picker.open)picker.showModal();
    }
    async function change(fn){
      if(busy)return;busy=true;render();
      try{await locked(()=>state.update(fn));if(picker.open)picker.close();root.querySelector('.hero-message').textContent='Zapisano.';}
      catch(error){const message=error.name==='QuotaExceededError'||error.name==='SecurityError'?'Nie udało się zapisać zmiany. Spróbuj ponownie.':error.message;root.querySelector('.hero-message').textContent=message;if(picker.open)picker.querySelector('[role=status]').textContent=message;}
      finally{busy=false;if(!disposed)render();}
    }
    function click(e){const stat=e.target.closest('[data-stat-add]'),slot=e.target.closest('[data-gear-slot]');if(stat)void change(h=>allocate(h,stat.dataset.statAdd));else if(slot)showPicker(slot.dataset.gearSlot);}
    function pick(e){const item=e.target.closest('[data-equip-item]');if(item)void change(h=>equip(h,selectedSlot,item.dataset.equipItem));else if(e.target.closest('[data-unequip]'))void change(h=>equip(h,selectedSlot,null));else if(e.target.closest('[data-close-gear]'))picker.close();}
    function storage(e){if(e.key==='pustkowie.hero.v2')render();}
    root.addEventListener('click',click);picker.addEventListener('click',pick);window.addEventListener('storage',storage);render();
    return ()=>{disposed=true;root.removeEventListener('click',click);picker.removeEventListener('click',pick);window.removeEventListener('storage',storage);if(picker.open)picker.close();picker.remove();};
  }
  window.HeroSheet={mount,bonuses,luck,chance,available,allocate,rollLoot,receiveLoot,inventory,equipment,equip,inventoryMarkup,SLOTS};
})();
