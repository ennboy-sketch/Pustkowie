'use strict';
(() => {
  let stop=()=>{};
  function cancel(){stop();stop=()=>{};}
  let showProfessions=()=>{};
  function markup(){
    return `<section class="barracks-panel" aria-label="Plac treningowy koszar"><div class="barracks-viewport" tabindex="0" role="region" aria-label="Przesuwany widok koszar" aria-describedby="barracks-pan-hint"><div class="barracks-panorama"><img class="barracks-room-art" src="barracks-training.webp" alt="Plac treningowy koszar: paladyn Gabriel w lśniącej zbroi bez hełmu, manekiny treningowe, stojaki z bronią oraz drzwi do zbrojowni i do dowódcy paladynów." draggable="false"><div class="barracks-vignette" aria-hidden="true"></div><button type="button" class="barracks-hotspot barracks-person" data-barracks-part="person"><span>Gabriel</span><small>Paladyn</small></button><button type="button" class="barracks-hotspot barracks-armory" data-barracks-part="armory"><span>Zbrojownia</span></button><button type="button" class="barracks-hotspot barracks-commander" data-barracks-part="commander"><span>Dowódca paladynów</span></button></div></div><p class="sr-only" id="barracks-pan-hint">Przesuwaj widok, by obejrzeć plac treningowy, porozmawiać z Gabrielem i sprawdzić drzwi.</p><dialog class="barracks-detail-dialog" aria-labelledby="barracks-detail-title"><h2 id="barracks-detail-title"></h2><div class="barracks-detail-content"></div><button type="button" class="secondary" data-close-barracks-detail>Wróć na plac treningowy</button></dialog></section>`;
  }
  function mount(root,{professionMarkup}={}){
    cancel();
    const panel=root.querySelector('.barracks-panel'),view=panel.querySelector('.barracks-viewport'),scene=panel.querySelector('.barracks-panorama'),art=scene.querySelector('img'),dialog=panel.querySelector('.barracks-detail-dialog');
    let centered=false,disposed=false;
    function fit(){
      if(disposed||!view.isConnected)return;
      const height=Math.max(600,view.clientHeight),ratio=art.naturalWidth&&art.naturalHeight?art.naturalWidth/art.naturalHeight:2;
      scene.style.height=`${height}px`;scene.style.width=`${height*ratio}px`;
      if(!centered&&art.naturalWidth&&view.clientWidth){view.scrollLeft=Math.max(0,scene.clientWidth*.5-view.clientWidth/2);centered=true;}
    }
    function show(part){
      const title=dialog.querySelector('h2'),content=dialog.querySelector('.barracks-detail-content');
      dialog.classList.toggle('shows-professions',part==='professions');
      if(part==='person'){
        title.textContent='Gabriel';
        content.innerHTML='<div class="barracks-emblem"><span class="rpg-icon icon-barracks" aria-hidden="true"></span></div><span class="barracks-dialogue-kicker">Paladyn · Żelazna Przysięga</span><p>Witaj na placu treningowym. Zbroja osłania ciało, lecz to dyscyplina trzyma wojownika na nogach. Rozejrzyj się po koszarach.</p><button type="button" class="secondary" data-barracks-part="professions">Porozmawiaj o profesjach</button>';
      }else if(part==='professions'){
        title.textContent='Profesje';content.innerHTML=professionMarkup?professionMarkup():'<p>Profesje są w przygotowaniu.</p>';
      }else if(part==='armory'){
        title.textContent='Zbrojownia';content.innerHTML='<p>Za okutymi drzwiami przechowywane jest uzbrojenie Żelaznej Przysięgi. Wejście do zbrojowni jest na razie zamknięte.</p>';
      }else if(part==='commander'){
        title.textContent='Dowódca paladynów';content.innerHTML='<p>Te drzwi prowadzą do gabinetu dowódcy paladynów. Gabriel daje znak, aby zaczekać — audiencje nie są jeszcze dostępne.</p>';
      }else return;
      if(!dialog.open)dialog.showModal();
    }
    showProfessions=()=>show('professions');
    function click(e){if(e.target.closest('[data-close-barracks-detail]')){dialog.close();return;}const target=e.target.closest('[data-barracks-part]');if(target)show(target.dataset.barracksPart);}
    art.addEventListener('load',fit);const observer=new ResizeObserver(fit);observer.observe(view);
    panel.addEventListener('click',click);fit();
    stop=()=>{disposed=true;showProfessions=()=>{};observer.disconnect();art.removeEventListener('load',fit);panel.removeEventListener('click',click);if(dialog.open)dialog.close();};
  }
  window.BarracksPanel={markup,mount,cancel,openProfessions:()=>showProfessions()};
})();
