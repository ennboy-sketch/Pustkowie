'use strict';
(() => {
  let stop=()=>{};
  function cancel(){stop();stop=()=>{};}
  function markup(){
    return `<section class="forge-panel" aria-label="Pracownia Gorima Sadzy"><div class="forge-viewport" tabindex="0" role="region" aria-label="Swobodnie przesuwany widok kuźni" aria-describedby="forge-pan-hint"><div class="forge-panorama"><img class="forge-room-art" src="forge-workshop.webp" alt="Kuźnia Czarnego Żaru: potężny, szeroki w barach człowiek Gorim Sadza z młotem przy kowadle, za nim rozpalony piec hutniczy; wokół narzędzia, sztaby metalu i stojaki z bronią." draggable="false"><div class="forge-vignette" aria-hidden="true"></div><button type="button" class="forge-hotspot forge-person" data-forge-part="person" aria-label="Porozmawiaj: Gorim Sadza"><span>Gorim Sadza</span><small>Kowal</small></button></div></div><p class="sr-only" id="forge-pan-hint">Przesuń widok palcem lub przeciągnij myszą. Porozmawiaj z Gorimem Sadzą.</p><dialog class="forge-detail-dialog" aria-labelledby="forge-detail-title"><h2 id="forge-detail-title">Gorim Sadza</h2><div class="forge-detail-content"></div><button type="button" class="secondary" data-close-forge-detail>Wróć do kuźni</button></dialog></section>`;
  }
  function mount(root){
    cancel();
    const panel=root.querySelector('.forge-panel'),view=panel.querySelector('.forge-viewport'),scene=panel.querySelector('.forge-panorama'),art=scene.querySelector('img'),dialog=panel.querySelector('.forge-detail-dialog');
    let centered=false,disposed=false;
    function fit(){
      if(disposed||!view.isConnected)return;
      const height=Math.max(600,view.clientHeight),ratio=art.naturalWidth&&art.naturalHeight?art.naturalWidth/art.naturalHeight:2;
      scene.style.height=`${height}px`;scene.style.width=`${height*ratio}px`;
      if(!centered&&art.naturalWidth&&view.clientWidth){view.scrollLeft=Math.max(0,scene.clientWidth*.46-view.clientWidth/2);centered=true;}
    }
    function show(part){
      if(part!=='person')return;
      dialog.querySelector('.forge-detail-content').innerHTML='<div class="forge-emblem"><span class="rpg-icon icon-forge" aria-hidden="true"></span></div><span class="forge-dialogue-kicker">Kowal · Kuźnia Czarnego Żaru</span><p>Dobry młot nie pyta, jak twarda jest stal. Siadaj z dala od iskier — ogień musi dziś pracować.</p><div class="forge-future"><strong>Rzadki ekwipunek</strong><p>W przyszłości Gorim wykuje dla Ciebie rzadkie uzbrojenie. Wytwarzanie będzie dostępne później.</p></div>';
      if(!dialog.open)dialog.showModal();
    }
    function click(e){if(e.target.closest('[data-close-forge-detail]')){dialog.close();return;}const target=e.target.closest('[data-forge-part]');if(target)show(target.dataset.forgePart);}
    art.addEventListener('load',fit);const observer=new ResizeObserver(fit);observer.observe(view);
    panel.addEventListener('click',click);fit();
    stop=()=>{disposed=true;observer.disconnect();art.removeEventListener('load',fit);panel.removeEventListener('click',click);if(dialog.open)dialog.close();};
  }
  window.ForgePanel={markup,mount,cancel};
})();
