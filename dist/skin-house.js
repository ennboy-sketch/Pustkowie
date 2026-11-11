'use strict';
(()=>{
  const wardrobe=()=>window.VesperaOutfits;
  function artStyle(outfit){return `width:${outfit.columns*100}%;height:${outfit.rows*100}%;transform:translate(${-outfit.col*100/outfit.columns}%,${-outfit.row*100/outfit.rows}%)`;}
  function portrait(outfit){return `<span class="vespera-portrait" style="--cols:${outfit.columns};--rows:${outfit.rows};--col:${outfit.col};--row:${outfit.row}"><img src="${outfit.image}" alt="" draggable="false" loading="lazy"></span>`;}
  function markup(hero={}){
    const outfit=wardrobe().current(hero);
    return `<section class="skin-house-panel" aria-label="Dom Tysiąca Twarzy">
      <div class="skin-house-viewport" tabindex="0" role="region" aria-label="Przesuwany widok Domu Tysiąca Twarzy" aria-describedby="skin-house-hint">
        <div class="skin-house-panorama">
          <div class="skin-house-art-frame"><img class="skin-house-art" src="${outfit.image}" style="${artStyle(outfit)}" data-vespera-outfit="${outfit.id}" alt="Vespera w stroju: ${outfit.name}. Fioletowowłosa Mistrzyni Przemian siedzi w fotelu w pracowni z kominkiem, maskami, lustrem i tkaninami." draggable="false"></div>
          <div class="skin-house-vignette" aria-hidden="true"></div>
          <button type="button" class="skin-house-merchant" data-skin-house-merchant aria-label="Porozmawiaj z Vesperą, Mistrzynią Przemian"><span>Vespera</span><small>Mistrzyni Przemian</small></button>
        </div>
      </div>
      <p id="skin-house-hint" class="sr-only">Przesuwaj widok myszą lub palcem. Przybliżaj kółkiem, dwoma palcami lub klawiszami plus i minus. Kliknij Vesperę, aby porozmawiać. Wyjście znajduje się pod X w prawym górnym rogu.</p>
      <dialog class="skin-house-dialog" aria-labelledby="skin-house-merchant-title">
        <h3 id="skin-house-merchant-title" tabindex="-1">Vespera — Mistrzyni Przemian</h3>
        <div class="skin-house-intro"><p>Witaj w Domu Tysiąca Twarzy. Jestem Vespera. Tutaj znajdziesz wygląd, który opowie Twoją historię.</p>
        <p class="skin-house-coming">Wkrótce pojawią się tu skórki postaci za odłamki.</p>
        <button type="button" class="primary" data-open-vespera-outfits>Zmień strój Vespery · 5 odłamków</button></div>
        <div class="vespera-wardrobe" hidden></div>
        <button type="button" class="secondary" data-close-skin-house-merchant>Wróć do pracowni</button>
      </dialog>
    </section>`;
  }
  function mount(root,state){
    const panel=root.querySelector('.skin-house-panel'),view=panel.querySelector('.skin-house-viewport'),scene=view.firstElementChild,art=scene.querySelector('img'),dialog=panel.querySelector('.skin-house-dialog');
    const gallery=panel.querySelector('.vespera-wardrobe'),intro=panel.querySelector('.skin-house-intro');
    let disposed=false,centered=false,busy=false,operation=0,selected=art.dataset.vesperaOutfit,expected=selected;
    const preloads=new Map(),sizes=new Map();
    function preload(source){
      if(!preloads.has(source)){
        const image=new Image();image.src=source;
        preloads.set(source,image.decode().then(()=>{sizes.set(source,image.naturalWidth/image.naturalHeight);return image;}).catch(error=>{preloads.delete(source);throw error;}));
      }
      return preloads.get(source);
    }
    function fit(){
      if(disposed||!view.clientWidth)return;
      const ratio=sizes.get(art.getAttribute('src'))||(art.naturalWidth?art.naturalWidth/art.naturalHeight:1.95);
      const height=Math.max(600,view.clientHeight,view.clientWidth*1.2/ratio);
      scene.style.width=`${height*ratio}px`;scene.style.height=`${height}px`;
      if(!centered&&art.complete&&art.naturalWidth){
        view.scrollLeft=Math.max(0,scene.clientWidth*.51-view.clientWidth/2);
        view.scrollTop=Math.max(0,scene.clientHeight*.55-view.clientHeight/2);
        centered=true;
      }
    }
    function showScene(outfit){
      const scale=Number(view.dataset.zoomScale)||1,camera=centered?{x:(view.scrollLeft+view.clientWidth/2)/(scene.clientWidth*scale),y:(view.scrollTop+view.clientHeight/2)/(scene.clientHeight*scale),scale}:null;
      art.src=outfit.image;art.style.cssText=artStyle(outfit);art.dataset.vesperaOutfit=outfit.id;
      art.alt=`Vespera w stroju: ${outfit.name}. Pracownia z kominkiem, maskami, lustrem i tkaninami.`;
      fit();if(camera)window.SceneZoom.restore(view,camera);
    }
    function renderWardrobe(message=''){
      if(disposed)return;
      const hero=state.read(),current=wardrobe().current(hero),chosen=wardrobe().get(selected)||current,shards=wardrobe().balance(hero);
      gallery.innerHTML=`<p class="vespera-wallet">Posiadasz: <strong>${shards}</strong> odłamków</p><p class="vespera-rule">Każda zmiana stroju Vespery kosztuje 5 odłamków. Podgląd jest bezpłatny. Zmieniasz wygląd Vespery w pracowni, a nie swojej postaci.</p><div class="vespera-preview">${portrait(chosen)}<div><h4>${chosen.name}</h4><p>${chosen.description}</p><small>Vespera zachowuje swoją twarz i fioletowe włosy.</small></div></div><fieldset ${busy?'disabled':''}><legend>Wybierz strój Vespery</legend><div class="vespera-outfit-grid">${wardrobe().CATALOG.map(outfit=>`<label class="vespera-outfit-card"><input type="radio" name="vespera-outfit" value="${outfit.id}" ${outfit.id===selected?'checked':''}>${portrait(outfit)}<strong>${outfit.name}</strong><small>${outfit.id===current.id?'Aktualny strój':'Zmiana: 5 odłamków'}</small></label>`).join('')}</div></fieldset><div class="vespera-checkout"><strong>${chosen.name}</strong><button type="button" class="primary" data-confirm-vespera-outfit ${busy||chosen.id===current.id||shards<wardrobe().COST?'disabled':''}>${busy?'Zapisywanie…':chosen.id===current.id?'Aktualny strój':shards<wardrobe().COST?'Potrzebujesz 5 odłamków':'Zmień strój · 5 odłamków'}</button><p class="vespera-message" role="status" aria-live="polite"></p></div><button type="button" class="secondary" data-back-vespera>Wróć do rozmowy</button>`;
      gallery.querySelector('.vespera-message').textContent=message;
    }
    async function confirm(){
      if(busy||disposed)return;
      const id=selected,previous=expected,token=++operation;busy=true;renderWardrobe();let message='';
      try{
        await preload(wardrobe().get(id).image);
        if(disposed||!dialog.open||token!==operation)return;
        const commit=()=>{if(disposed||!dialog.open||token!==operation)return null;return state.update(hero=>wardrobe().change(hero,id,previous));};
        const next=navigator.locks?await navigator.locks.request('pustkowie-hero-v2',commit):commit();
        if(disposed||!next)return;
        const current=wardrobe().current(next);showScene(current);expected=current.id;selected=current.id;
        message=`Strój Vespery: ${current.name}. ${previous===current.id?'Ten strój był już wybrany.':'Pobrano 5 odłamków.'}`;
      }catch(error){
        try{const now=wardrobe().current(state.read()).id;if(now!==previous){expected=now;selected=now;}}catch{}
        message=error.name==='QuotaExceededError'||error.name==='SecurityError'?'Nie udało się zapisać zmiany. Odłamki nie zostały pobrane.':error.name==='EncodingError'?'Nie udało się wczytać stroju. Odłamki nie zostały pobrane.':error.message;
      }finally{busy=false;if(!disposed)renderWardrobe(message);}
    }
    function openWardrobe(){
      selected=wardrobe().current(state.read()).id;expected=selected;
      intro.hidden=true;gallery.hidden=false;dialog.classList.add('shows-outfits');renderWardrobe();dialog.scrollTop=0;
    }
    function changeSelection(e){if(e.target.name!=='vespera-outfit'||busy)return;selected=e.target.value;renderWardrobe();}
    function click(e){
      if(disposed)return;
      if(e.target.closest('[data-close-skin-house-merchant]')){dialog.close();return;}
      if(e.target.closest('[data-open-vespera-outfits]')){openWardrobe();return;}
      if(e.target.closest('[data-confirm-vespera-outfit]')){void confirm();return;}
      if(e.target.closest('[data-back-vespera]')){gallery.hidden=true;intro.hidden=false;dialog.classList.remove('shows-outfits');return;}
      if(e.target.closest('[data-skin-house-merchant]')){
        intro.hidden=false;gallery.hidden=true;dialog.classList.remove('shows-outfits');
        if(!dialog.open)dialog.showModal();
        dialog.querySelector('h3').focus({preventScroll:true});
      }
    }
    async function storage(e){
      if(e.key!=='pustkowie.hero.v2'||disposed)return;
      try{const current=wardrobe().current(state.read());if(current.id===art.dataset.vesperaOutfit)return;await preload(current.image);if(disposed)return;showScene(wardrobe().current(state.read()));if(dialog.open&&!gallery.hidden&&!busy){selected=current.id;expected=current.id;renderWardrobe('Strój Vespery został zaktualizowany w innej karcie.');}}catch{}
    }
    function closed(){operation++;}
    dialog.addEventListener('close',closed);
    art.addEventListener('load',fit);panel.addEventListener('click',click);panel.addEventListener('change',changeSelection);window.addEventListener('storage',storage);
    const observer=new ResizeObserver(fit);observer.observe(view);fit();
    return ()=>{disposed=true;observer.disconnect();art.removeEventListener('load',fit);panel.removeEventListener('click',click);panel.removeEventListener('change',changeSelection);window.removeEventListener('storage',storage);dialog.removeEventListener('close',closed);if(dialog.open)dialog.close();};
  }
  window.SkinHouse={markup,mount};
})();
