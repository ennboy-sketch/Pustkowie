'use strict';
(() => {
  const SLOTS=[['helmet','Hełm'],['armor','Zbroja'],['boots','Buty'],['shield','Tarcza'],['weapon','Broń'],['necklace','Naszyjnik'],['earrings','Kolczyki'],['special','Przedmiot specjalny']];
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
  function bonuses(hero){const a=allocations(hero),gear=window.MarketPanel?.bonuses(hero)||[0,0,0,0];return STATS.slice(0,4).map(([id],i)=>a[id]+gear[i]);}
  function luck(hero){return allocations(hero).luck;}
  function chance(hero){return Math.min(60,10+luck(hero));}
  function allocate(hero,id){
    if(!STATS.some(([key])=>key===id))throw new Error('Nieznana cecha.');
    if(available(hero)<1)throw new Error('Nie masz wolnych punktów cech.');
    const next=allocations(hero);next[id]++;return {...hero,statAllocations:next};
  }
  function inventory(hero){return hero.lootInventory??['weapon','armor'].map((slot,i)=>({id:`starter-${slot}`,slot,name:STARTERS[hero.classId][i]}));}
  function equipment(hero){return hero.equipment??{weapon:'starter-weapon',armor:'starter-armor'};}
  function bagItems(hero){const worn=new Set(Object.values(equipment(hero)));return inventory(hero).filter(item=>!worn.has(item.id));}
  function hpBonus(hero){return equipment(hero).necklace==='tauriel-emerald-necklace'&&inventory(hero).some(i=>i.id==='tauriel-emerald-necklace'&&i.slot==='necklace')?100:0;}
  function equip(hero,slot,id){
    if(!SLOTS.some(([key])=>key===slot))throw new Error('Nieznane miejsce wyposażenia.');
    if(id&&!inventory(hero).some(item=>item.id===id&&item.slot===slot))throw new Error('Nie masz tego przedmiotu.');
    if(!id&&equipment(hero)[slot]&&bagItems(hero).length>=25)throw new Error('Ekwipunek jest pełny. Najpierw zwolnij miejsce.');
    return {...hero,lootInventory:inventory(hero),equipment:{...equipment(hero),[slot]:id||null}};
  }
  function rollLoot(hero,draw=random){
    if(bagItems(hero).length>=25)return null;
    if(draw(10000)>=chance(hero)*100)return null;
    const i=draw(DROPS.length);return {id:crypto.randomUUID(),slot:SLOTS[i][0],name:DROPS[i]};
  }
  function receiveLoot(hero,item){
    if(!item)return hero;
    if(typeof item.name!=='string'||!SLOTS.some(([slot],i)=>slot===item.slot&&DROPS[i]===item.name)||typeof item.id!=='string')throw new Error('Nieprawidłowy przedmiot.');
    const items=inventory(hero);
    if(items.some(i=>i.id===item.id)||bagItems(hero).length>=25)return hero;
    return {...hero,lootInventory:[...items,item]};
  }
  function itemDetails(item){return item?.id==='tauriel-emerald-necklace'?' · +100 HP':window.MarketPanel?.describeItem(item)?' · '+window.MarketPanel.describeItem(item):'';}
  const art=(i,item)=>item?.id==='tauriel-emerald-necklace'?'<span class="gear-art tauriel-necklace" aria-hidden="true"></span>':i===7?'<span class="special-slot-mark" aria-hidden="true"></span>':`<span class="gear-art gear-${i}" aria-hidden="true"></span>`;
  function inventoryMarkup(hero){
    return `<div class="hero-bag">${inventory(hero).map(item=>`<article>${art(SLOTS.findIndex(([slot])=>slot===item.slot),item)}<strong></strong><small>${SLOTS.find(([slot])=>slot===item.slot)?.[1]||''}</small></article>`).join('')}</div><p class="panel-note">Przedmioty zakładasz w oknie Bohater.</p>`;
  }
  function mountBag(root,state){
    root.innerHTML='<div class="backpack-heading"><span class="backpack-icon" aria-hidden="true"></span><div><h3>Ekwipunek</h3><p class="backpack-count"></p></div></div><div class="backpack-grid" aria-label="25 miejsc na przedmioty"></div><div class="backpack-detail"><p>Wybierz przedmiot, aby go obejrzeć lub założyć.</p></div><p class="backpack-pending"></p><p class="backpack-message" role="status" aria-live="polite"></p>';
    let disposed=false,busy=false,selected=null;
    const grid=root.querySelector('.backpack-grid'),detail=root.querySelector('.backpack-detail');
    function render(){
      if(disposed)return;
      const hero=state.read(),items=bagItems(hero),overflow=Math.max(0,items.length-25);
      root.querySelector('.backpack-count').textContent=`Zajęte miejsca: ${Math.min(25,items.length)} / 25`;
      root.querySelector('.backpack-pending').textContent=overflow?`Dodatkowe przedmioty ze starszego zapisu: ${overflow}. Możesz je założyć przez miejsca wyposażenia postaci.`:items.length>=25?'Ekwipunek pełny — zdobywanie przedmiotów jest zablokowane. Złoto i EXP nadal otrzymujesz.':'';
      grid.replaceChildren();
      for(let i=0;i<25;i++){
        const item=items[i],button=document.createElement('button');button.type='button';button.className='backpack-cell';button.dataset.bagIndex=String(i);
        if(item){button.classList.add('has-item');button.innerHTML=art(SLOTS.findIndex(([slot])=>slot===item.slot),item);button.setAttribute('aria-label',`Miejsce ${i+1}: ${item.name}`);button.title=item.name;}
        else{button.innerHTML='<span aria-hidden="true">'+(i+1)+'</span>';button.setAttribute('aria-label',`Miejsce ${i+1}: puste`);button.disabled=true;}
        grid.append(button);
      }
      const item=items.find(i=>i.id===selected);
      if(item){detail.innerHTML='<strong></strong><small></small><button type="button" class="secondary" data-bag-equip>Załóż przedmiot</button>';detail.querySelector('strong').textContent=item.name;detail.querySelector('small').textContent=(SLOTS.find(([slot])=>slot===item.slot)?.[1]||'')+itemDetails(item);detail.querySelector('button').disabled=busy;}
      else{selected=null;detail.innerHTML='<p>Wybierz przedmiot, aby go obejrzeć lub założyć.</p>';}
    }
    async function click(e){
      const cell=e.target.closest('[data-bag-index]');if(cell){selected=bagItems(state.read())[Number(cell.dataset.bagIndex)]?.id;render();return;}
      if(!e.target.closest('[data-bag-equip]')||busy)return;
      const id=selected;busy=true;render();
      try{
        const change=()=>state.update(hero=>{const item=bagItems(hero).find(i=>i.id===id);if(!item)throw new Error('Przedmiot został już przeniesiony.');return equip(hero,item.slot,id);});
        if(navigator.locks)await navigator.locks.request('pustkowie-hero-v2',change);else change();
        if(!disposed)root.querySelector('.backpack-message').textContent='Przedmiot założony.';
      }catch(error){if(!disposed)root.querySelector('.backpack-message').textContent=error.name==='QuotaExceededError'||error.name==='SecurityError'?'Nie udało się zapisać wyposażenia. Spróbuj ponownie.':error.message;}
      finally{busy=false;render();}
    }
    function storage(e){if(e.key==='pustkowie.hero.v2')render();}
    root.addEventListener('click',click);window.addEventListener('storage',storage);render();
    return ()=>{disposed=true;root.removeEventListener('click',click);window.removeEventListener('storage',storage);};
  }
  function mount(root,state){
    root.innerHTML=`<section class="hero-v2"><div class="hero-loadout"><div class="hero-portrait"><div class="character" role="img" aria-label="Twoja postać"></div><div class="hero-identity"><h3></h3><span></span></div></div>${SLOTS.map(([id,label],i)=>`<button type="button" class="hero-gear-slot slot-${id}" data-gear-slot="${id}" aria-label="${label}">${art(i)}<span>${label}</span><small>Puste</small></button>`).join('')}</div><button type="button" class="hero-backpack-button" data-open-backpack><span class="backpack-icon" aria-hidden="true"></span><span>Ekwipunek<small>25 miejsc na przedmioty</small></span></button><div class="hero-xp"><span></span><progress max="100" value="0" aria-label="Postęp poziomu"></progress><small></small></div><div class="hero-vitals"></div><div class="hero-attributes"><div class="hero-points"></div>${STATS.map(([id,label],i)=>`<div class="hero-attribute" data-attribute="${id}"><div><span>${label}</span><small>${id==='luck'?'Szansa na przedmiot':''}</small></div><strong></strong><button type="button" data-stat-add="${id}" aria-label="Zwiększ: ${label}">+</button></div>`).join('')}</div><p class="hero-point-note">5 punktów na start i 3 za każdy kolejny poziom.<br>Szczęście: +1 punkt procentowy szansy na przedmiot za punkt, maks. 60%.</p><p class="hero-message" role="status" aria-live="polite"></p></section>`;
    const picker=document.createElement('dialog');picker.className='hero-gear-picker';picker.setAttribute('aria-label','Wybierz wyposażenie');document.body.append(picker);
    const bag=document.createElement('dialog');bag.className='hero-backpack-dialog';bag.setAttribute('aria-label','Ekwipunek — 25 miejsc');bag.innerHTML='<div class="backpack-root"></div><button type="button" class="secondary" data-close-backpack>Wróć do postaci</button>';document.body.append(bag);
    let stopBag=()=>{};
    let disposed=false,busy=false,selectedSlot=null;
    const locked=fn=>navigator.locks?navigator.locks.request('pustkowie-hero-v2',fn):fn();
    function render(){
      if(disposed)return;
      const hero=state.read(),profile=window.BrandCombat.profile(hero),xp=window.Progression.info(hero);
      const portrait=root.querySelector('.hero-portrait');portrait.querySelector('.character').className=`character ${hero.gender} ${hero.classId}`;portrait.querySelector('h3').textContent=hero.name;portrait.querySelector('.hero-identity>span').textContent=`Poziom ${xp.level}`;
      root.querySelector('.hero-xp>span').textContent=`Poziom ${xp.level} / 250`;root.querySelector('.hero-xp progress').value=xp.percent;root.querySelector('.hero-xp>small').textContent=xp.label;
      root.querySelector('.hero-vitals').textContent=`Życie: ${profile.maxHp} / ${profile.maxHp}`;
      root.querySelector('.hero-points').textContent=`Punkty do rozdania: ${available(hero)}`;
      STATS.forEach(([id],i)=>{const row=root.querySelector(`[data-attribute="${id}"]`);row.querySelector('strong').textContent=i<4?profile.stats[i]:luck(hero);row.querySelector('button').disabled=busy||available(hero)<1;if(id==='luck')row.querySelector('small').textContent=`${chance(hero)}% szansy na przedmiot`;});
      for(const [slot,label] of SLOTS){const button=root.querySelector(`[data-gear-slot="${slot}"]`),item=inventory(hero).find(i=>i.id===equipment(hero)[slot]);button.classList.toggle('is-equipped',!!item);button.querySelector('small').textContent=item?'Założono':'Puste';button.setAttribute('aria-label',`${label}: ${item?.name||'Puste'}`);button.title=(item?.name||label)+itemDetails(item);const icon=button.querySelector('.gear-art');if(icon)icon.className=item?.id==='tauriel-emerald-necklace'?'gear-art tauriel-necklace':`gear-art gear-${SLOTS.findIndex(([id])=>id===slot)}`;}
    }
    function showPicker(slot){
      selectedSlot=slot;const hero=state.read(),items=inventory(hero).filter(i=>i.slot===slot);
      picker.innerHTML=`<h2>${SLOTS.find(([id])=>id===slot)[1]}</h2><div class="gear-pick-list"></div><button type="button" class="secondary" data-unequip>Zdejmij przedmiot</button><button type="button" class="secondary" data-close-gear>Wróć do postaci</button><p role="status"></p>`;
      const list=picker.querySelector('.gear-pick-list');if(!items.length)list.textContent='Nie masz jeszcze przedmiotu do tego miejsca.';
      for(const item of items){const button=document.createElement('button');button.type='button';button.dataset.equipItem=item.id;button.textContent=item.name+itemDetails(item)+(equipment(hero)[slot]===item.id?' · Założono':'');list.append(button);}
      picker.querySelector('[data-unequip]').disabled=!equipment(hero)[slot];if(!picker.open)picker.showModal();
    }
    async function change(fn){
      if(busy)return;busy=true;render();
      try{await locked(()=>state.update(fn));if(picker.open)picker.close();root.querySelector('.hero-message').textContent='Zapisano.';}
      catch(error){const message=error.name==='QuotaExceededError'||error.name==='SecurityError'?'Nie udało się zapisać zmiany. Spróbuj ponownie.':error.message;root.querySelector('.hero-message').textContent=message;if(picker.open)picker.querySelector('[role=status]').textContent=message;}
      finally{busy=false;if(!disposed)render();}
    }
    function click(e){if(e.target.closest('[data-open-backpack]')){stopBag();stopBag=mountBag(bag.querySelector('.backpack-root'),state);if(!bag.open)bag.showModal();return;}const stat=e.target.closest('[data-stat-add]'),slot=e.target.closest('[data-gear-slot]');if(stat)void change(h=>allocate(h,stat.dataset.statAdd));else if(slot)showPicker(slot.dataset.gearSlot);}
    function pick(e){const item=e.target.closest('[data-equip-item]');if(item)void change(h=>equip(h,selectedSlot,item.dataset.equipItem));else if(e.target.closest('[data-unequip]'))void change(h=>equip(h,selectedSlot,null));else if(e.target.closest('[data-close-gear]'))picker.close();}
    function storage(e){if(e.key==='pustkowie.hero.v2')render();}
    function closeBag(e){if(e.target.closest('[data-close-backpack]'))bag.close();}
    bag.addEventListener('click',closeBag);bag.addEventListener('close',()=>{stopBag();if(!disposed)render();});
    root.addEventListener('click',click);picker.addEventListener('click',pick);window.addEventListener('storage',storage);render();
    return ()=>{disposed=true;stopBag();bag.removeEventListener('click',closeBag);if(bag.open)bag.close();bag.remove();root.removeEventListener('click',click);picker.removeEventListener('click',pick);window.removeEventListener('storage',storage);if(picker.open)picker.close();picker.remove();};
  }
  window.HeroSheet={mount,mountBag,bagItems,hpBonus,bonuses,luck,chance,available,allocate,rollLoot,receiveLoot,inventory,equipment,equip,inventoryMarkup,SLOTS};
})();
