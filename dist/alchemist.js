'use strict';
(() => {
  let stop=()=>{};
  let showProfessions=()=>{};
  function cancel(){stop();stop=()=>{};}
  function markup(){
    return `<section class="alchemist-panel" aria-label="Pracownia alchemiczki"><div class="alchemist-viewport" tabindex="0" role="region" aria-label="Swobodnie przesuwany widok pracowni" aria-describedby="alchemist-pan-hint"><div class="alchemist-panorama"><img class="alchemist-room-art" src="alchemist-workshop.webp?v=alchemist-reference-1913-1" decoding="async" alt="Pracownia w Wieży Zielonego Płomienia: alchemiczka w czarnej sukni, stół z kolbami i miksturami, regały z ziołami oraz schody na górę." draggable="false"><div class="alchemist-vignette" aria-hidden="true"></div><button type="button" class="alchemist-hotspot alchemist-person" data-alchemist-part="person" aria-label="Porozmawiaj z Lilith"><span>Lilith</span><small>Porozmawiaj</small></button><button type="button" class="alchemist-hotspot alchemist-table" data-alchemist-part="table"><span>Stół alchemiczny</span></button><button type="button" class="alchemist-hotspot alchemist-stairs" data-alchemist-part="stairs"><span>Schody na górę</span></button></div></div><p class="sr-only" id="alchemist-pan-hint">Przesuń widok palcem lub przeciągnij myszą. Wybierz alchemiczkę, stół albo schody.</p><dialog class="alchemist-detail-dialog" aria-labelledby="alchemist-detail-title"><h2 id="alchemist-detail-title"></h2><div class="alchemist-detail-content"></div><button type="button" class="secondary" data-close-alchemist-detail>Wróć do pracowni</button></dialog></section>`;
  }
  function mount(root,state){
    cancel();
    const panel=root.querySelector('.alchemist-panel'),view=panel.querySelector('.alchemist-viewport'),scene=panel.querySelector('.alchemist-panorama'),art=scene.querySelector('img'),dialog=panel.querySelector('.alchemist-detail-dialog');
    let centered=false,disposed=false,busy=false;
    function fit(){
      if(disposed||!view.isConnected)return;
      const height=Math.max(600,view.clientHeight),ratio=art.naturalWidth&&art.naturalHeight?art.naturalWidth/art.naturalHeight:2;
      scene.style.height=`${height}px`;scene.style.width=`${height*ratio}px`;
      if(!centered&&art.naturalWidth&&view.clientWidth){view.scrollLeft=Math.max(0,scene.clientWidth*.52-view.clientWidth/2);centered=true;}
    }
    function show(part){
      const title=dialog.querySelector('h2'),content=dialog.querySelector('.alchemist-detail-content');
      dialog.classList.toggle('is-alchemist-portrait',part==='person');
      dialog.classList.toggle('shows-professions',part==='professions');
      if(part==='person'){
        title.textContent='Alchemiczka';
        content.innerHTML='<div class="alchemist-profile"><img src="alchemist-character.webp?v=alchemist-reference-1913-1" decoding="async" alt="Dorosła alchemiczka o kruczoczarnych włosach, w czarnej sukni ze złotymi zdobieniami, trzymająca zieloną miksturę."><div><span class="alchemist-dialogue-kicker">Wieża Zielonego Płomienia</span><p>Witaj w mojej pracowni. Ostrożnie z tym, czego dotykasz — nie każda iskra gaśnie, gdy zdmuchniesz płomień.</p><p class="alchemist-dialogue-note">W powietrzu unosi się zapach gorzkich ziół, a w kolbach migocze szmaragdowe światło.</p></div></div>';
        content.insertAdjacentHTML('beforeend','<button type="button" class="secondary" data-alchemist-part="professions">Porozmawiaj o profesjach</button>');
      }else if(part==='professions'){
        title.textContent='Profesje';content.innerHTML=state.professionMarkup();
      }else if(part==='table'){
        title.textContent='Stół alchemiczny';
        content.innerHTML=window.MagicDust.markup(state.read())+'<p>Wymień 25 szt. magicznego pyłu na 1 odłamek.</p><button type="button" class="primary" data-exchange-dust>Wymień 25 pyłu → 1 odłamek</button><p class="dust-exchange-message" role="status" aria-live="polite"></p>';
        content.insertAdjacentHTML('beforeend',`<section class="magic-dust-material"><img src="spell-scroll.webp" alt=""><div><strong>Zwój zaklęć</strong><p>Posiadasz: <b data-scroll-count>${window.FateWheel.count(state.read(),'spellScrolls')}</b></p><small>10 zwojów = 1000 EXP</small></div></section><button type="button" class="primary" data-exchange-scrolls>Wymień 10 zwojów → 1000 EXP</button><p class="scroll-exchange-message" role="status"></p>`);
        refreshTable();
      }else if(part==='stairs'){
        title.textContent='Wejście na górę';
        content.innerHTML='<p>Schody prowadzą do prywatnej części wieży. Wejście jest na razie zamknięte.</p><p class="alchemist-dialogue-note">Alchemiczka prosi, by pozostać w pracowni.</p>';
      }else return;
      if(!dialog.open)dialog.showModal();
    }
    showProfessions=()=>show('professions');
    function refreshTable(){
      const button=panel.querySelector('[data-exchange-dust]');if(!button)return;
      try{const h=state.read(),amount=window.MagicDust.count(h);const scroll=panel.querySelector('[data-exchange-scrolls]');if(scroll){scroll.disabled=busy||window.FateWheel.count(h,'spellScrolls')<10;panel.querySelector('[data-scroll-count]').textContent=window.FateWheel.count(h,'spellScrolls');}panel.querySelector('[data-magic-dust-count]').textContent=amount;button.disabled=busy||amount<window.MagicDust.COST;}
      catch{button.disabled=true;panel.querySelector('.dust-exchange-message').textContent='Nie udało się odczytać materiałów. Zamknij okno i spróbuj ponownie.';}
    }
    async function click(e){
      if(e.target.closest('[data-exchange-dust]')||e.target.closest('[data-exchange-scrolls]')){
        const scrolls=!!e.target.closest('[data-exchange-scrolls]');
        if(busy)return;busy=true;refreshTable();const message=panel.querySelector(scrolls?'.scroll-exchange-message':'.dust-exchange-message');message.textContent='';
        try{const change=()=>state.update(hero=>scrolls?window.FateWheel.exchangeScrolls(hero):window.MagicDust.exchange(hero));if(navigator.locks)await navigator.locks.request('pustkowie-hero-v2',change);else change();if(!disposed)message.textContent=scrolls?'Wymieniono 10 zwojów. Otrzymujesz 1000 EXP.':'Wymieniono 25 szt. magicznego pyłu. Otrzymujesz 1 odłamek.';}
        catch(error){if(!disposed)message.textContent=error.name==='QuotaExceededError'||error.name==='SecurityError'?'Nie udało się zapisać wymiany. Materiały nie zostały pobrane.':error.message;}
        finally{busy=false;if(!disposed)refreshTable();}return;
      }
      if(e.target.closest('[data-close-alchemist-detail]')){dialog.close();return;}
      const target=e.target.closest('[data-alchemist-part]');if(target)show(target.dataset.alchemistPart);
    }
    function storage(e){if(e.key==='pustkowie.hero.v2')refreshTable();}
    window.addEventListener('storage',storage);
    art.addEventListener('load',fit);const observer=new ResizeObserver(fit);observer.observe(view);
    panel.addEventListener('click',click);fit();
    stop=()=>{disposed=true;showProfessions=()=>{};window.removeEventListener('storage',storage);observer.disconnect();art.removeEventListener('load',fit);panel.removeEventListener('click',click);if(dialog.open)dialog.close();};
  }
  window.AlchemistPanel={markup,mount,cancel,openProfessions:()=>showProfessions()};
})();
