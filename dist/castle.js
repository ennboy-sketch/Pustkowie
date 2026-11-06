'use strict';
(() => {
  function markup(){
    return `<section class="castle-panel" aria-label="Komnaty z Czarnej Stali"><div class="castle-viewport" role="region" tabindex="0" aria-label="Przesuwany widok komnaty zamku" aria-describedby="castle-pan-hint"><div class="castle-panorama"><img class="castle-art" src="castle-antechamber.webp" alt="Przedsionek zamku z trzema parami drzwi. Przy środkowych drzwiach do sali tronowej stoi dwóch strażników w czarnej zbroi, po jednym z każdej strony." draggable="false"><button type="button" class="castle-throne-door" data-castle-throne aria-label="Wejdź do sali tronowej"><span>Sala tronowa</span></button></div></div><button type="button" class="castle-return secondary" data-castle-return hidden>Wróć do przedsionka</button><p class="sr-only" id="castle-pan-hint">Przesuwaj widok palcem lub myszą. Przybliżaj dwoma palcami, kółkiem myszy lub klawiszami plus i minus. Środkowe drzwi prowadzą do sali tronowej.</p></section>`;
  }
  function mount(root,{onTitle=()=>{}}={}){
    const panel=root.querySelector('.castle-panel'),view=panel.querySelector('.castle-viewport'),scene=panel.querySelector('.castle-panorama'),art=panel.querySelector('.castle-art'),door=panel.querySelector('[data-castle-throne]'),back=panel.querySelector('[data-castle-return]');
    let disposed=false,centered=false,stopZoom=window.SceneZoom.mount(view,scene);
    function fit(){
      if(disposed||!view.clientWidth)return;
      const height=Math.max(600,view.clientHeight),ratio=art.naturalWidth&&art.naturalHeight?art.naturalWidth/art.naturalHeight:1.5;
      scene.style.height=`${height}px`;scene.style.width=`${Math.max(view.clientWidth,height*ratio)}px`;
      if(!centered&&art.complete&&art.naturalWidth){view.scrollLeft=Math.max(0,(scene.clientWidth-view.clientWidth)/2);view.scrollTop=0;centered=true;}
    }
    function show(throne){
      stopZoom();centered=false;
      door.hidden=throne;back.hidden=!throne;
      art.src=throne?'castle-throne.webp':'castle-antechamber.webp';
      art.alt=throne?'Sala tronowa: pusty tron z czarnej stali na podwyższeniu, kamienne kolumny, zielone chorągwie i płonące pochodnie.':'Przedsionek zamku z trzema parami drzwi. Dwóch strażników stoi po bokach środkowych drzwi do sali tronowej.';
      onTitle(throne?'Sala tronowa':'Komnaty z Czarnej Stali');
      stopZoom=window.SceneZoom.mount(view,scene);fit();
      (throne?back:view).focus({preventScroll:true});
    }
    function click(e){if(e.target.closest('[data-castle-throne]'))show(true);else if(e.target.closest('[data-castle-return]'))show(false);}
    art.addEventListener('load',fit);panel.addEventListener('click',click);
    const observer=new ResizeObserver(fit);observer.observe(view);fit();
    return ()=>{disposed=true;observer.disconnect();stopZoom();art.removeEventListener('load',fit);panel.removeEventListener('click',click);};
  }
  window.CastlePanel={markup,mount};
})();
