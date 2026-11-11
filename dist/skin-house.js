'use strict';
(()=>{
  function markup(){
    return `<section class="skin-house-panel" aria-label="Dom Tysiąca Twarzy">
      <div class="skin-house-viewport" tabindex="0" role="region" aria-label="Przesuwany widok Domu Tysiąca Twarzy" aria-describedby="skin-house-hint">
        <div class="skin-house-panorama">
          <img class="skin-house-art" src="skin-house-interior.webp" alt="Przytulna kamienno-drewniana pracownia: fioletowowłosa sprzedawczyni z ametystowym naszyjnikiem, skórzanymi bransoletami i wysokimi butami siedzi w fotelu przy kominku. Po lewej wiszą ozdobne maski i płaszcze, po prawej stoją lustro, szafa i bele tkanin." draggable="false">
          <div class="skin-house-vignette" aria-hidden="true"></div>
          <button type="button" class="skin-house-merchant" data-skin-house-merchant aria-label="Porozmawiaj ze sprzedawczynią skórek"><span>Sprzedawczyni</span><small>Porozmawiaj</small></button>
        </div>
      </div>
      <p id="skin-house-hint" class="sr-only">Przesuwaj widok myszą lub palcem. Przybliżaj kółkiem, dwoma palcami lub klawiszami plus i minus. Kliknij sprzedawczynię, aby porozmawiać. Wyjście znajduje się pod X w prawym górnym rogu.</p>
      <dialog class="skin-house-dialog" aria-labelledby="skin-house-merchant-title">
        <h3 id="skin-house-merchant-title" tabindex="-1">Sprzedawczyni skórek</h3>
        <p>Witaj w Domu Tysiąca Twarzy. Tutaj znajdziesz wygląd, który opowie Twoją historię.</p>
        <p class="skin-house-coming">Wkrótce pojawią się tu skórki postaci za odłamki.</p>
        <button type="button" class="secondary" data-close-skin-house-merchant>Wróć do pracowni</button>
      </dialog>
    </section>`;
  }
  function mount(root){
    const panel=root.querySelector('.skin-house-panel'),view=panel.querySelector('.skin-house-viewport'),scene=view.firstElementChild,art=scene.querySelector('img'),dialog=panel.querySelector('.skin-house-dialog');
    let disposed=false,centered=false;
    function fit(){
      if(disposed||!view.clientWidth)return;
      const ratio=art.naturalWidth?art.naturalWidth/art.naturalHeight:1.95;
      const height=Math.max(600,view.clientHeight,view.clientWidth*1.2/ratio);
      scene.style.width=`${height*ratio}px`;scene.style.height=`${height}px`;
      if(!centered&&art.complete&&art.naturalWidth){
        view.scrollLeft=Math.max(0,scene.clientWidth*.51-view.clientWidth/2);
        view.scrollTop=Math.max(0,scene.clientHeight*.55-view.clientHeight/2);
        centered=true;
      }
    }
    function click(e){
      if(disposed)return;
      if(e.target.closest('[data-close-skin-house-merchant]')){dialog.close();return;}
      if(e.target.closest('[data-skin-house-merchant]')){
        if(!dialog.open)dialog.showModal();
        dialog.querySelector('h3').focus({preventScroll:true});
      }
    }
    art.addEventListener('load',fit);panel.addEventListener('click',click);
    const observer=new ResizeObserver(fit);observer.observe(view);fit();
    return ()=>{disposed=true;observer.disconnect();art.removeEventListener('load',fit);panel.removeEventListener('click',click);if(dialog.open)dialog.close();};
  }
  window.SkinHouse={markup,mount};
})();
