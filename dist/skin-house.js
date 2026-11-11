'use strict';
(()=>{
  const BEDROOM='vespera-bedroom.webp',wardrobe=()=>window.VesperaOutfits;
  let activeOpenRoom=null;
  function artStyle(outfit){return `width:${outfit.columns*100}%;height:${outfit.rows*100}%;transform:translate(${-outfit.col*100/outfit.columns}%,${-outfit.row*100/outfit.rows}%)`;}
  const sceneAsset=(outfit,room)=>room==='bedroom'?outfit.sprite:outfit.image;
  function portrait(outfit){return `<span class="vespera-portrait${outfit.pose==='standing'?' is-standing':''}" style="--cols:${outfit.columns};--rows:${outfit.rows};--col:${outfit.col};--row:${outfit.row}"><img src="${outfit.pose==='standing'?outfit.sprite:outfit.image}" alt="${outfit.name}" draggable="false" loading="lazy"></span>`;}
  function markup(hero={}){
    const outfit=wardrobe().current(hero,'workshop');
    return `<section class="skin-house-panel" data-skin-house-room="workshop" aria-label="Dom Tysiąca Twarzy">
      <div class="skin-house-room-bar"><div><small>DOM TYSIĄCA TWARZY</small><strong data-skin-house-room-title>Pracownia Vespery</strong></div><div class="skin-house-room-actions"><button type="button" data-go-skin-house-room="workshop" hidden>← Wróć do pracowni</button><button type="button" data-go-skin-house-room="bedroom">Sypialnia i garderoba →</button><button type="button" data-open-vespera-outfits>Stroje w pracowni · 5 odłamków</button></div></div>
      <div class="skin-house-viewport" tabindex="0" role="region" aria-label="Przesuwany widok Domu Tysiąca Twarzy" aria-describedby="skin-house-hint">
        <div class="skin-house-panorama">
          <div class="skin-house-art-frame"><img class="skin-house-art" src="${outfit.image}" style="${artStyle(outfit)}" data-vespera-outfit="${outfit.id}" alt="Vespera w stroju: ${outfit.name}. ${outfit.pose==='standing'?'Oryginalne zdjęcie w pełnym kadrze.':'Fioletowowłosa Mistrzyni Przemian siedzi w fotelu w pracowni z kominkiem, maskami, lustrem i tkaninami.'}" draggable="false"></div>
          <div class="skin-house-bedroom-figure" hidden></div>
          <div class="skin-house-vignette" aria-hidden="true"></div>
          <button type="button" class="skin-house-stall" data-open-hero-skins aria-label="Kup stroje bohatera"><span>Stroje bohatera</span><small>Obejrzyj ofertę</small></button>
          <button type="button" class="skin-house-door" data-go-skin-house-room="bedroom" aria-label="Przejdź do sypialni Vespery"><span>Sypialnia Vespery →</span><small>Przejdź do pokoju obok</small></button>
          <button type="button" class="skin-house-bedroom-wardrobe" data-open-vespera-outfits data-bedroom-only hidden><span>Garderoba</span><small>Wybierz strój Vespery</small></button>
          <button type="button" class="skin-house-merchant" data-skin-house-merchant aria-label="Porozmawiaj z Vesperą, Mistrzynią Przemian"><span>Vespera</span><small>Mistrzyni Przemian</small></button>
        </div>
      </div>
      <p id="skin-house-hint" class="sr-only">Przesuwaj widok myszą lub palcem. Przybliżaj kółkiem, dwoma palcami lub klawiszami plus i minus. W pracowni kupisz stroje bohatera. W pracowni wybierzesz strój siedzącej Vespery, a w sypialni osobny strój na stojąco. Wyjście znajduje się pod X w prawym górnym rogu.</p>
      <p class="skin-house-room-message" role="status" aria-live="polite"></p>
      <dialog class="skin-house-dialog" aria-labelledby="skin-house-merchant-title">
        <h3 id="skin-house-merchant-title" tabindex="-1">Vespera — Mistrzyni Przemian</h3>
        <div class="skin-house-intro"><p>Witaj w Domu Tysiąca Twarzy. Jestem Vespera. Tutaj znajdziesz wygląd, który opowie Twoją historię.</p>
        <p class="skin-house-coming">Przy ekspozycji po lewej kupisz skórki postaci za odłamki. W pracowni przymierzam stroje na siedząco. Stroje na stojąco wybierzesz w sypialni obok.</p>
        <button type="button" class="primary" data-open-vespera-outfits>Wybierz strój do pracowni</button></div>
        <div class="vespera-wardrobe" hidden></div>
        <button type="button" class="secondary" data-close-skin-house-merchant>Wróć do pokoju</button>
      </dialog>
      <dialog class="hero-skin-dialog" aria-label="Stroje bohatera"></dialog>
    </section>`;
  }
  function mount(root,state){
    const panel=root.querySelector('.skin-house-panel'),view=panel.querySelector('.skin-house-viewport'),scene=view.firstElementChild,art=scene.querySelector('.skin-house-art'),dialog=panel.querySelector('.skin-house-dialog');
    const heroShop=window.HeroSkins.mountShop(panel.querySelector('.hero-skin-dialog'),state);
    const gallery=panel.querySelector('.vespera-wardrobe'),intro=panel.querySelector('.skin-house-intro'),figure=panel.querySelector('.skin-house-bedroom-figure'),roomMessage=panel.querySelector('.skin-house-room-message');
    let disposed=false,centered=false,busy=false,operation=0,travel=0,room='workshop',selected=art.dataset.vesperaOutfit,expected=selected;
    const preloads=new Map(),cameras=new Map();
    function preload(source){
      if(!preloads.has(source)){
        const image=new Image();image.src=source;
        preloads.set(source,image.decode().then(()=>image).catch(error=>{preloads.delete(source);throw error;}));
      }
      return preloads.get(source);
    }
    function camera(){const scale=Number(view.dataset.zoomScale)||1;return{x:(view.scrollLeft+view.clientWidth/2)/(scene.clientWidth*scale),y:(view.scrollTop+view.clientHeight/2)/(scene.clientHeight*scale),scale};}
    function fit(){
      if(disposed||!view.clientWidth)return;
      const bedroom=room==='bedroom',ratio=bedroom?1672/941:1.95;
      const height=bedroom?Math.max(view.clientHeight,view.clientWidth/ratio):Math.max(600,view.clientHeight,view.clientWidth*1.2/ratio);
      scene.style.width=`${height*ratio}px`;scene.style.height=`${height}px`;
      const merchant=panel.querySelector('.skin-house-merchant');
      if(bedroom){
        figure.style.height=`${height*.82}px`;figure.style.width=`${height*.76}px`;
        merchant.style.cssText='left:60%;top:95%;transform:translate(-50%,-50%);height:44px;min-height:44px';
      }else merchant.style.cssText='';
      if(!centered&&art.complete&&art.naturalWidth){
        view.scrollLeft=Math.max(0,scene.clientWidth*(bedroom?.6:.51)-view.clientWidth/2);
        view.scrollTop=Math.max(0,scene.clientHeight*(bedroom?.5:.55)-view.clientHeight/2);centered=true;
      }
    }
    function showScene(outfit){
      const previous=centered?camera():null,bedroom=room==='bedroom';
      art.src=bedroom?BEDROOM:outfit.image;art.style.cssText=bedroom?'width:100%;height:100%;object-fit:cover':artStyle(outfit);art.dataset.vesperaOutfit=outfit.id;
      panel.dataset.vesperaPose=bedroom?'standing':'seated';
      art.alt=bedroom?'Sypialnia Vespery: łóżko z fioletowym baldachimem, kominek, lustro i szafa ze strojami.':`Vespera siedzi w fotelu w stroju: ${outfit.name}. Pracownia z kominkiem, maskami, lustrem i tkaninami.`;
      figure.hidden=!bedroom;
      figure.innerHTML=bedroom?`<img class="skin-house-standing-character" src="${outfit.sprite}" alt="Vespera stoi w sypialni w stroju: ${outfit.name}" draggable="false">`:'';
      fit();if(previous)window.SceneZoom?.restore(view,previous);
    }
    function openRoom(next,{focus=true}={}){
      if(disposed||!['workshop','bedroom'].includes(next))return false;
      travel++;
      if(next===room)return true;
      if(centered)cameras.set(room,camera());
      if(dialog.open)dialog.close();operation++;
      gallery.replaceChildren();gallery.hidden=true;intro.hidden=false;dialog.classList.remove('shows-outfits');
      room=next;panel.dataset.skinHouseRoom=room;centered=false;
      const bedroom=room==='bedroom',title=bedroom?'Sypialnia Vespery':'Pracownia Vespery';
      panel.querySelector('[data-skin-house-room-title]').textContent=title;
      panel.querySelectorAll('[data-go-skin-house-room]').forEach(button=>{button.hidden=button.dataset.goSkinHouseRoom===room;});
      panel.querySelectorAll('[data-bedroom-only]').forEach(button=>{button.hidden=!bedroom;});
      panel.querySelector('[data-open-hero-skins]').hidden=bedroom;
      panel.querySelector('.skin-house-room-actions [data-open-vespera-outfits]').textContent=bedroom?'Stroje na stojąco · 5 odłamków':'Stroje w pracowni · 5 odłamków';
      intro.querySelector('[data-open-vespera-outfits]').textContent=bedroom?'Wybierz strój na stojąco':'Wybierz strój do pracowni';
      intro.querySelector('.skin-house-coming').textContent=bedroom?'W sypialni przymierzam stroje na stojąco. Wybrany tutaj ubiór zapamiętam osobno.':'Przy ekspozycji po lewej kupisz skórki postaci za odłamki. Tutaj wybierzesz mój strój na siedząco.';
      state.onTitle?.(bedroom?'Sypialnia Vespery':'Dom Tysiąca Twarzy');
      state.onRoom?.(room);
      window.SceneZoom?.reset(view);showScene(wardrobe().current(state.read(),room));
      if(cameras.has(room))window.SceneZoom?.restore(view,cameras.get(room));
      if(focus)view.focus({preventScroll:true});
      view.setAttribute('aria-label',`Przesuwany widok: ${title}`);roomMessage.textContent='';
      return true;
    }
    async function travelTo(next){
      if(disposed)return;
      const attempt=++travel;
      try{
        if(room!==next){const outfit=wardrobe().current(state.read(),next);await Promise.all([preload(next==='bedroom'?BEDROOM:outfit.image),preload(sceneAsset(outfit,next))]);}
        if(disposed||attempt!==travel)return;
        openRoom(next);
      }catch{if(!disposed&&attempt===travel)roomMessage.textContent='Nie udało się wczytać pokoju. Spróbuj ponownie.';}
    }
    function renderWardrobe(message=''){
      if(disposed)return;
      const hero=state.read(),current=wardrobe().current(hero,room),chosen=wardrobe().forRoom(room).find(outfit=>outfit.id===selected)||current,shards=wardrobe().balance(hero);
      const cards=outfits=>outfits.map(outfit=>`<label class="vespera-outfit-card"><input type="radio" name="vespera-outfit" value="${outfit.id}" ${outfit.id===selected?'checked':''}>${portrait(outfit)}<strong>${outfit.name}</strong><small>${outfit.id===current.id?'Aktualny strój':'Zmiana: 5 odłamków'}</small></label>`).join('');
      const bedroom=room==='bedroom';
      gallery.innerHTML=`<p class="vespera-wallet">Posiadasz: <strong>${shards}</strong> odłamków</p><p class="vespera-rule">${bedroom?'Sypialnia · Vespera na stojąco.':'Pracownia · Vespera w fotelu.'} Każda zmiana stroju kosztuje 5 odłamków. Podgląd jest bezpłatny.</p><div class="vespera-preview">${portrait(chosen)}<div><h4>${chosen.name}</h4><p>${chosen.description}</p><small>${bedroom?'Strój w sypialni':'Strój w pracowni'}</small></div></div><fieldset ${busy?'disabled':''}><legend>${bedroom?'Wybierz strój na stojąco':'Wybierz strój na siedząco'}</legend><div class="vespera-outfit-grid">${cards(wardrobe().forRoom(room))}</div></fieldset><div class="vespera-checkout"><strong>${chosen.name}</strong><button type="button" class="primary" data-confirm-vespera-outfit ${busy||chosen.id===current.id||shards<wardrobe().COST?'disabled':''}>${busy?'Zapisywanie…':chosen.id===current.id?'Aktualny strój':shards<wardrobe().COST?'Potrzebujesz 5 odłamków':'Zmień strój · 5 odłamków'}</button><p class="vespera-message" role="status" aria-live="polite"></p></div><button type="button" class="secondary" data-back-vespera>Wróć do rozmowy</button>`;
      gallery.querySelector('.vespera-message').textContent=message;
    }
    async function confirm(){
      if(busy||disposed||!wardrobe().forRoom(room).some(outfit=>outfit.id===selected))return;
      const id=selected,previous=expected,scope=room,token=++operation;busy=true;renderWardrobe();let message='';
      try{
        await preload(sceneAsset(wardrobe().get(id),scope));
        if(disposed||!dialog.open||token!==operation||room!==scope)return;
        const commit=()=>{if(disposed||!dialog.open||token!==operation||room!==scope)return null;return state.update(hero=>wardrobe().change(hero,id,previous,scope));};
        const next=navigator.locks?await navigator.locks.request('pustkowie-hero-v2',commit):commit();
        if(disposed||!next||room!==scope||token!==operation)return;
        const current=wardrobe().current(next,room);showScene(current);expected=current.id;selected=current.id;
        message=`Strój Vespery: ${current.name}. ${previous===current.id?'Ten strój był już wybrany.':'Pobrano 5 odłamków.'}`;
      }catch(error){
        try{const now=wardrobe().current(state.read(),room).id;if(now!==previous){expected=now;selected=now;}}catch{}
        message=error.name==='QuotaExceededError'||error.name==='SecurityError'?'Nie udało się zapisać zmiany. Odłamki nie zostały pobrane.':error.name==='EncodingError'?'Nie udało się wczytać stroju. Odłamki nie zostały pobrane.':error.message;
      }finally{busy=false;if(!disposed&&room===scope)renderWardrobe(message);}
    }
    function openWardrobe(){
      operation++;
      selected=wardrobe().current(state.read(),room).id;expected=selected;
      intro.hidden=true;gallery.hidden=false;dialog.classList.add('shows-outfits');renderWardrobe();
      if(!dialog.open)dialog.showModal();dialog.scrollTop=0;
      dialog.querySelector('h3').focus({preventScroll:true});
    }
    function changeSelection(e){if(e.target.name!=='vespera-outfit'||busy||!wardrobe().forRoom(room).some(outfit=>outfit.id===e.target.value))return;selected=e.target.value;renderWardrobe();gallery.querySelector(`input[value="${selected}"]`)?.focus({preventScroll:true});}
    function click(e){
      if(disposed)return;
      const door=e.target.closest('[data-go-skin-house-room]');
      if(door){void travelTo(door.dataset.goSkinHouseRoom);return;}
      if(e.target.closest('[data-open-hero-skins]')){if(dialog.open)dialog.close();heroShop.open();return;}
      if(e.target.closest('[data-close-skin-house-merchant]')){dialog.close();return;}
      if(e.target.closest('[data-open-vespera-outfits]')){openWardrobe();return;}
      if(e.target.closest('[data-confirm-vespera-outfit]')){void confirm();return;}
      if(e.target.closest('[data-back-vespera]')){operation++;gallery.hidden=true;intro.hidden=false;dialog.classList.remove('shows-outfits');return;}
      if(e.target.closest('[data-skin-house-merchant]')){
        intro.hidden=false;gallery.hidden=true;dialog.classList.remove('shows-outfits');
        if(!dialog.open)dialog.showModal();dialog.querySelector('h3').focus({preventScroll:true});
      }
    }
    async function storage(e){
      if(e.key!=='pustkowie.hero.v2'||disposed)return;
      const scope=room;
      try{
        let current=wardrobe().current(state.read(),room),changed=current.id!==art.dataset.vesperaOutfit;
        if(changed){await preload(sceneAsset(current,room));if(disposed||room!==scope)return;current=wardrobe().current(state.read(),room);showScene(current);}
        if(dialog.open&&!gallery.hidden&&!busy){
          if(current.id!==expected){selected=current.id;expected=current.id;}
          renderWardrobe(changed?'Strój Vespery w tym pokoju został zaktualizowany w innej karcie.':'');
        }
      }catch{}
    }
    function closed(){if(!dialog.open)operation++;}
    dialog.addEventListener('close',closed);
    art.addEventListener('load',fit);panel.addEventListener('click',click);panel.addEventListener('change',changeSelection);window.addEventListener('storage',storage);
    const observer=new ResizeObserver(fit);observer.observe(view);showScene(wardrobe().current(state.read(),room));
    activeOpenRoom=openRoom;
    return ()=>{disposed=true;travel++;operation++;if(activeOpenRoom===openRoom)activeOpenRoom=null;heroShop.stop();observer.disconnect();art.removeEventListener('load',fit);panel.removeEventListener('click',click);panel.removeEventListener('change',changeSelection);window.removeEventListener('storage',storage);dialog.removeEventListener('close',closed);if(dialog.open)dialog.close();};
  }
  window.SkinHouse={markup,mount,openRoom:(...args)=>activeOpenRoom?.(...args)};
})();
