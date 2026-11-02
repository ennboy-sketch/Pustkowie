'use strict';
(() => {
  let stop=()=>{};
  function cancel(){stop();stop=()=>{};}
  function markup(){
    return `<section class="alchemist-panel" aria-label="Pracownia alchemiczki"><div class="alchemist-viewport" tabindex="0" role="region" aria-label="Swobodnie przesuwany widok pracowni" aria-describedby="alchemist-pan-hint"><div class="alchemist-panorama"><img class="alchemist-room-art" src="alchemist-workshop.webp?v=alchemist-reference-1913-1" decoding="async" alt="Pracownia w Wieży Zielonego Płomienia: alchemiczka w czarnej sukni, stół z kolbami i miksturami, regały z ziołami oraz schody na górę." draggable="false"><div class="alchemist-vignette" aria-hidden="true"></div><button type="button" class="alchemist-hotspot alchemist-person" data-alchemist-part="person" aria-label="Porozmawiaj z alchemiczką"><span>Alchemiczka</span><small>Porozmawiaj</small></button><button type="button" class="alchemist-hotspot alchemist-table" data-alchemist-part="table"><span>Stół alchemiczny</span></button><button type="button" class="alchemist-hotspot alchemist-stairs" data-alchemist-part="stairs"><span>Schody na górę</span></button></div></div><p class="sr-only" id="alchemist-pan-hint">Przesuń widok palcem lub przeciągnij myszą. Wybierz alchemiczkę, stół albo schody.</p><dialog class="alchemist-detail-dialog" aria-labelledby="alchemist-detail-title"><h2 id="alchemist-detail-title"></h2><div class="alchemist-detail-content"></div><button type="button" class="secondary" data-close-alchemist-detail>Wróć do pracowni</button></dialog></section>`;
  }
  function mount(root){
    cancel();
    const panel=root.querySelector('.alchemist-panel'),view=panel.querySelector('.alchemist-viewport'),scene=panel.querySelector('.alchemist-panorama'),art=scene.querySelector('img'),dialog=panel.querySelector('.alchemist-detail-dialog');
    let centered=false,disposed=false;
    function fit(){
      if(disposed||!view.isConnected)return;
      const height=Math.max(600,view.clientHeight),ratio=art.naturalWidth&&art.naturalHeight?art.naturalWidth/art.naturalHeight:2;
      scene.style.height=`${height}px`;scene.style.width=`${height*ratio}px`;
      if(!centered&&art.naturalWidth&&view.clientWidth){view.scrollLeft=Math.max(0,scene.clientWidth*.52-view.clientWidth/2);centered=true;}
    }
    function show(part){
      const title=dialog.querySelector('h2'),content=dialog.querySelector('.alchemist-detail-content');
      dialog.classList.toggle('is-alchemist-portrait',part==='person');
      if(part==='person'){
        title.textContent='Alchemiczka';
        content.innerHTML='<div class="alchemist-profile"><img src="alchemist-character.webp?v=alchemist-reference-1913-1" decoding="async" alt="Dorosła alchemiczka o kruczoczarnych włosach, w czarnej sukni ze złotymi zdobieniami, trzymająca zieloną miksturę."><div><span class="alchemist-dialogue-kicker">Wieża Zielonego Płomienia</span><p>Witaj w mojej pracowni. Ostrożnie z tym, czego dotykasz — nie każda iskra gaśnie, gdy zdmuchniesz płomień.</p><p class="alchemist-dialogue-note">W powietrzu unosi się zapach gorzkich ziół, a w kolbach migocze szmaragdowe światło.</p></div></div>';
      }else if(part==='table'){
        title.textContent='Stół alchemiczny';
        content.innerHTML='<div class="alchemist-table-emblem"><span class="rpg-icon icon-alchemy" aria-hidden="true"></span></div><p>Między kolbami i miedzianymi retortami leżą stare receptury, kryształy oraz pęki suszonych ziół. W kamiennym moździerzu połyskuje zielony pył.</p><p class="alchemist-dialogue-note">Alchemiczka czuwa nad miksturami. Bez jej pozwolenia niczego nie mieszaj.</p>';
      }else if(part==='stairs'){
        title.textContent='Wejście na górę';
        content.innerHTML='<p>Schody prowadzą do prywatnej części wieży. Wejście jest na razie zamknięte.</p><p class="alchemist-dialogue-note">Alchemiczka prosi, by pozostać w pracowni.</p>';
      }else return;
      if(!dialog.open)dialog.showModal();
    }
    function click(e){if(e.target.closest('[data-close-alchemist-detail]')){dialog.close();return;}const target=e.target.closest('[data-alchemist-part]');if(target)show(target.dataset.alchemistPart);}
    art.addEventListener('load',fit);const observer=new ResizeObserver(fit);observer.observe(view);
    panel.addEventListener('click',click);fit();
    stop=()=>{disposed=true;observer.disconnect();art.removeEventListener('load',fit);panel.removeEventListener('click',click);if(dialog.open)dialog.close();};
  }
  window.AlchemistPanel={markup,mount,cancel};
})();
