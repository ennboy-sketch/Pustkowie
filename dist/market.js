'use strict';
(() => {
  let stop=()=>{};
  function cancel(){stop();stop=()=>{};}
  const LEGACY_PRODUCTS=[
    {id:'guard-sword',name:'Miecz strażnika',slot:'weapon',price:30,stats:[2,0,0,0]},
    {id:'iron-axe',name:'Topór żelazny',slot:'weapon',price:30,stats:[2,0,0,0]},
    {id:'ash-bow',name:'Łuk jesionowy',slot:'weapon',price:30,stats:[0,2,0,0]},
    {id:'oak-staff',name:'Kostur dębowy',slot:'weapon',price:30,stats:[0,0,2,0]},
    {id:'guard-helmet',name:'Hełm wartownika',slot:'helmet',price:20,stats:[0,0,0,1]},
    {id:'riveted-armor',name:'Nitowana zbroja',slot:'armor',armorType:'heavy',price:45,stats:[0,0,0,3]},
    {id:'mage-cloak',name:'Płaszcz wędrownego maga',slot:'armor',armorType:'cloak',price:45,stats:[0,0,0,3]},
    {id:'forest-armor',name:'Pancerz leśnego strażnika',slot:'armor',armorType:'light',price:45,stats:[0,0,0,3]},
    {id:'traveler-boots',name:'Buty podróżnika',slot:'boots',price:20,stats:[0,1,0,0]},
    {id:'oak-shield',name:'Tarcza dębowa',slot:'shield',price:25,stats:[0,0,0,2]}
  ];
  function productFor(item){return window.GearCatalog.productFor(item)||LEGACY_PRODUCTS.find(p=>p.id===item?.marketProduct&&p.slot===item.slot);}
  function describeItem(item){const p=productFor(item);return p?p.stats.map((n,i)=>n?`+${n} ${['Siła','Zręczność','Inteligencja','Wytrzymałość'][i]}`:'').filter(Boolean).join(' · '):'';}
  function bonuses(hero){
    const inventory=window.HeroSheet.inventory(hero),worn=window.HeroSheet.equipment(hero),out=[0,0,0,0];
    for(const [slot,id] of Object.entries(worn)){const item=inventory.find(i=>i.id===id&&i.slot===slot),p=productFor(item);if(p)p.stats.forEach((n,i)=>out[i]+=n);}
    return out;
  }
  function purchase(hero,id){
    const p=window.GearCatalog.get(id);if(!p)throw new Error('Nieznany przedmiot.');
    const blocked=window.GearCatalog.reason(hero,p);if(blocked)throw new Error(blocked);
    if(!window.HeroSheet.canEquip(hero,p))throw new Error('Ten przedmiot nie jest przeznaczony dla Twojej klasy.');
    if(window.HeroSheet.bagItems(hero).length>=25)throw new Error('Ekwipunek pełny. Zwolnij miejsce przed zakupem.');
    const gold=window.BeerService.status(hero).gold;
    if(gold<p.price)throw new Error(`Potrzebujesz ${p.price} złota.`);
    return {...hero,gold:gold-p.price,lootInventory:[...window.HeroSheet.inventory(hero),{id:crypto.randomUUID(),slot:p.slot,name:p.name,marketProduct:p.id,requiredLevel:p.requiredLevel,...(p.armorType?{armorType:p.armorType}:{})}]};
  }
  function markup(){
    return `<section class="market-panel" aria-label="Plac targowy"><div class="market-viewport" tabindex="0" role="region" aria-label="Przesuwany widok placu targowego" aria-describedby="market-pan-hint"><div class="market-panorama"><img class="market-room-art" src="market-square.webp?v=npc-clarity-1" decoding="async" alt="Czarny Targ: pulchny kupiec Gringo przy straganie z bronią i pancerzami. Wokół puste stragany pod zielonymi płóciennymi dachami, skrzynie, beczki i kamienna zabudowa zamku." draggable="false"><div class="market-vignette" aria-hidden="true"></div><button type="button" class="market-hotspot market-person" data-market-part="person"><span>Gringo</span><small>Kupiec uzbrojenia</small></button></div></div><p class="sr-only" id="market-pan-hint">Przesuwaj i przybliżaj widok, aby obejrzeć stragany. U Gringa możesz kupić broń i pancerze.</p><dialog class="market-detail-dialog" aria-labelledby="market-detail-title"><h2 id="market-detail-title">Gringo · Uzbrojenie</h2><p class="market-welcome">Solidne żelazo, uczciwa cena. Rozejrzyj się, wędrowcze.</p><div class="market-detail-content"></div><p class="market-message" role="status" aria-live="polite"></p><button type="button" class="secondary" data-close-market-detail>Wróć na plac targowy</button></dialog></section>`;
  }
  function mount(root,state){
    cancel();
    const panel=root.querySelector('.market-panel'),view=panel.querySelector('.market-viewport'),scene=panel.querySelector('.market-panorama'),art=scene.querySelector('img'),dialog=panel.querySelector('.market-detail-dialog');
    let centered=false,disposed=false;
    function fit(){
      if(disposed||!view.isConnected)return;
      const height=Math.max(600,view.clientHeight),ratio=art.naturalWidth&&art.naturalHeight?art.naturalWidth/art.naturalHeight:2;
      scene.style.height=`${height}px`;scene.style.width=`${height*ratio}px`;
      if(!centered&&art.naturalWidth&&view.clientWidth){view.scrollLeft=Math.max(0,scene.clientWidth*.5-view.clientWidth/2);centered=true;}
    }
    let busy=false,selectedTier=null;
    function renderShop(){
      if(disposed||!dialog.open)return;
      let hero;try{hero=state.read();}catch{dialog.querySelector('.market-detail-content').replaceChildren();dialog.querySelector('.market-message').textContent='Nie udało się odczytać postaci. Odśwież grę.';return;}
      const gold=window.BeerService.status(hero).gold,full=window.HeroSheet.bagItems(hero).length>=25;
      const content=dialog.querySelector('.market-detail-content');
      if(selectedTier===null)selectedTier=[...window.GearCatalog.LEVELS].reverse().find(n=>n<=window.Progression.level(hero))||5;
      const stock=window.GearCatalog.forClass(hero.classId).filter(p=>p.requiredLevel===selectedTier);
      content.innerHTML=`<div class="market-wallet"><span>Złoto: <strong>${gold}</strong></span><span>Ekwipunek: ${window.HeroSheet.bagItems(hero).length} / 25</span></div><p class="market-help">Uzbrojenie Zamku Czarnej Stali dla Twojej klasy. Premie działają po założeniu. Zakupy trafiają do ekwipunku.</p><nav class="market-tiers" aria-label="Poziom uzbrojenia">${window.GearCatalog.LEVELS.map(n=>`<button type="button" data-market-tier="${n}" aria-pressed="${n===selectedTier}">Poziom ${n}</button>`).join('')}</nav>${full?'<p class="market-full">Ekwipunek pełny — zakupy zablokowane.</p>':''}<div class="market-stock">${stock.map(p=>{const reason=window.GearCatalog.reason(hero,p),blocked=busy||full||!!reason||gold<p.price;return `<article class="market-product ${reason?'is-level-locked':''}">${window.GearCatalog.icon(p)}<div><h3>${p.name}</h3><small>${window.HeroSheet.itemSlotLabel(p)} · ${window.GearCatalog.details(p)}</small><small>${describeItem({marketProduct:p.id,slot:p.slot})}</small><strong>${p.price} złota</strong></div><button type="button" data-buy-market="${p.id}" aria-label="Kup: ${p.name}, ${p.price} złota" ${blocked?'disabled':''}>${busy?'Zapisywanie…':full?'Brak miejsca':reason?`Wymagany poziom ${p.requiredLevel}`:gold<p.price?'Brak złota':'Kup'}</button></article>`;}).join('')}</div>`;
    }
    function show(part){
      if(part!=='person')return;
      dialog.querySelector('.market-message').textContent='';
      if(!dialog.open)dialog.showModal();
      try{renderShop();}catch{dialog.querySelector('.market-message').textContent='Nie udało się odczytać postaci. Odśwież grę.';}
    }
    async function buy(id){
      if(busy||disposed)return;busy=true;renderShop();
      const status=dialog.querySelector('.market-message');status.textContent='';
      try{
        const change=()=>{if(disposed)return;state.update(hero=>purchase(hero,id));};
        if(navigator.locks)await navigator.locks.request('pustkowie-hero-v2',change);else change();
        if(!disposed)status.textContent=`Kupiono: ${window.GearCatalog.get(id)?.name}. Przedmiot czeka w ekwipunku.`;
      }catch(error){if(!disposed)status.textContent=error.name==='QuotaExceededError'||error.name==='SecurityError'?'Nie udało się zapisać zakupu. Złoto nie zostało pobrane. Spróbuj ponownie.':error.message;}
      finally{busy=false;if(!disposed)renderShop();}
    }
    function storage(e){if(e.key==='pustkowie.hero.v2'&&dialog.open){try{renderShop();}catch{dialog.querySelector('.market-message').textContent='Zapis postaci zmienił się. Odśwież grę.';}}}
    function click(e){const tier=e.target.closest('[data-market-tier]');if(tier){const value=Number(tier.dataset.marketTier);if(window.GearCatalog.LEVELS.includes(value)){selectedTier=value;renderShop();dialog.querySelector(`[data-market-tier="${value}"]`).focus();}return;}const buyButton=e.target.closest('[data-buy-market]');if(buyButton){void buy(buyButton.dataset.buyMarket);return;}if(e.target.closest('[data-close-market-detail]')){dialog.close();return;}const target=e.target.closest('[data-market-part]');if(target)show(target.dataset.marketPart);}
    art.addEventListener('load',fit);const observer=new ResizeObserver(fit);observer.observe(view);
    panel.addEventListener('click',click);window.addEventListener('storage',storage);fit();
    stop=()=>{disposed=true;observer.disconnect();art.removeEventListener('load',fit);panel.removeEventListener('click',click);window.removeEventListener('storage',storage);if(dialog.open)dialog.close();};
  }
  window.MarketPanel={armorType:item=>productFor(item)?.armorType,markup,mount,cancel,purchase,bonuses,describeItem};
})();
