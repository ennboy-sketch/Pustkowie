'use strict';
(() => {
  let stop=()=>{};
  function cancel(){stop();stop=()=>{};}
  function markup(){
    return `<section class="forge-panel" aria-label="Pracownia Gorima Sadzy"><div class="forge-viewport" tabindex="0" role="region" aria-label="Swobodnie przesuwany widok kuźni" aria-describedby="forge-pan-hint"><div class="forge-panorama"><img class="forge-room-art" src="forge-workshop.webp" alt="Kuźnia Czarnego Żaru: potężny, szeroki w barach człowiek Gorim Sadza z młotem przy kowadle, za nim rozpalony piec hutniczy; wokół narzędzia, sztaby metalu i stojaki z bronią." draggable="false"><div class="forge-vignette" aria-hidden="true"></div><button type="button" class="forge-hotspot forge-person" data-forge-part="person" aria-label="Porozmawiaj: Gorim Sadza"><span>Gorim Sadza</span><small>Kowal</small></button></div></div><p class="sr-only" id="forge-pan-hint">Przesuń widok palcem lub przeciągnij myszą. Porozmawiaj z Gorimem Sadzą.</p><dialog class="forge-detail-dialog" aria-labelledby="forge-detail-title"><h2 id="forge-detail-title">Gorim Sadza</h2><div class="forge-detail-content"></div><button type="button" class="secondary" data-close-forge-detail>Wróć do kuźni</button></dialog></section>`;
  }
  const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function mount(root,state){
    cancel();
    const panel=root.querySelector('.forge-panel'),view=panel.querySelector('.forge-viewport'),scene=panel.querySelector('.forge-panorama'),art=scene.querySelector('img'),dialog=panel.querySelector('.forge-detail-dialog');
    let centered=false,disposed=false,busy=false,selected='';
    function fit(){
      if(disposed||!view.isConnected)return;
      const height=Math.max(600,view.clientHeight),ratio=art.naturalWidth&&art.naturalHeight?art.naturalWidth/art.naturalHeight:2;
      scene.style.height=`${height}px`;scene.style.width=`${height*ratio}px`;
      if(!centered&&art.naturalWidth&&view.clientWidth){view.scrollLeft=Math.max(0,scene.clientWidth*.46-view.clientWidth/2);centered=true;}
    }
    function renderCrafting(){
      const root=dialog.querySelector('.forge-crafting');if(!root)return;
      try{
        const hero=state.read(),p=window.WeaponCrafting.recipe(hero),items=window.WeaponCrafting.weapons(hero),worn=new Set(Object.values(window.HeroSheet.equipment(hero)));
        if(!p){root.textContent='Brak receptury dla tej klasy.';return;}
        if(!items.some(i=>i.id===selected&&!worn.has(i.id)))selected=items.find(i=>!worn.has(i.id))?.id||'';
        const blocked=window.WeaponCrafting.reason(hero,selected),stats=p.stats.map((n,i)=>n?`+${n} ${['Siła','Zręczność','Inteligencja','Wytrzymałość'][i]}`:'').filter(Boolean).join(' · ');
        root.innerHTML=`<div class="forge-weapon-preview">${window.GearCatalog.icon(p)}<div><h3>${p.name}</h3><p>Broń · Poziom 35</p><strong>${stats}</strong></div></div><p>Receptura: 10 × Rzadki Materiał, 10 × Kawałek klejnotu, jedna broń na poziom 25 dla Twojej klasy, 5000 złota i 5 odłamków.</p><p>Posiadasz: ${hero.rareMaterial??0} × Rzadki Materiał · ${hero.gemFragments??0} × Kawałek klejnotu · ${hero.gold??0} złota · ${hero.shards??0} odłamków</p><label class="forge-weapon-label">Broń do przekucia<select data-forge-weapon ${busy?'disabled':''}><option value="">Wybierz broń na poziom 25</option>${items.map(i=>`<option value="${escape(i.id)}" ${i.id===selected?'selected':''} ${worn.has(i.id)?'disabled':''}>${window.GearCatalog.productFor(i).name}${worn.has(i.id)?' — założona, najpierw zdejmij':''}</option>`).join('')}</select></label><p class="panel-note">Składniki zostaną zużyte. Nowa broń trafi do plecaka. Opłata: 5000 złota i 5 odłamków.</p>${blocked?`<p class="forge-craft-reason">${blocked}</p>`:''}<button type="button" class="primary" data-forge-craft ${busy||blocked?'disabled':''}>${busy?'Wykuwanie…':'Wykuj broń'}</button>`;
      }catch{root.textContent='Nie można odczytać receptury lub ekwipunku. Otwórz kuźnię ponownie.';}
    }
    function show(part){
      if(part!=='person')return;
      dialog.querySelector('.forge-detail-content').innerHTML='<div class="forge-emblem"><span class="rpg-icon icon-forge" aria-hidden="true"></span></div><span class="forge-dialogue-kicker">Kowal · Kuźnia Czarnego Żaru</span><p>Przynieś mi broń i odpowiednie materiały. Wykuję oręż, który wytrzyma najcięższe starcia.</p><section class="forge-crafting" aria-label="Wytwarzanie broni na poziom 35"></section><p class="forge-craft-message" role="status" aria-live="polite"></p>';
      renderCrafting();if(!dialog.open)dialog.showModal();
    }
    async function craft(){
      if(busy)return;const id=selected;busy=true;renderCrafting();
      const message=dialog.querySelector('.forge-craft-message');message.textContent='';
      try{const change=()=>state.update(hero=>window.WeaponCrafting.craft(hero,id));const next=navigator.locks?await navigator.locks.request('pustkowie-hero-v2',change):change();if(disposed)return;message.textContent=`Wykuto: ${window.WeaponCrafting.recipe(next).name}. Broń czeka w ekwipunku.`;}
      catch(error){if(!disposed)message.textContent=error.name==='QuotaExceededError'||error.name==='SecurityError'?'Nie udało się zapisać broni. Składniki nie zostały zużyte.':error.message;}
      finally{busy=false;if(!disposed)renderCrafting();}
    }
    function click(e){if(e.target.closest('[data-close-forge-detail]')){dialog.close();return;}if(e.target.closest('[data-forge-craft]')){void craft();return;}const target=e.target.closest('[data-forge-part]');if(target)show(target.dataset.forgePart);}
    function change(e){if(e.target.matches('[data-forge-weapon]')){selected=e.target.value;renderCrafting();}}
    panel.addEventListener('change',change);
    art.addEventListener('load',fit);const observer=new ResizeObserver(fit);observer.observe(view);
    panel.addEventListener('click',click);fit();
    stop=()=>{disposed=true;observer.disconnect();art.removeEventListener('load',fit);panel.removeEventListener('click',click);panel.removeEventListener('change',change);if(dialog.open)dialog.close();};
  }
  window.ForgePanel={markup,mount,cancel};
})();
