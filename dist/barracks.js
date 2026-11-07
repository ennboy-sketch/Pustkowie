'use strict';
(() => {
  let stop=()=>{};
  function cancel(){stop();stop=()=>{};}
  let showProfessions=()=>{};
  function armoryProfession(hero){
    if(!hero||hero.classId!=='warrior'||window.Progression.level(hero)<10)return null;
    if(hero.profession==='warrior-profession-1')return {id:hero.profession,name:'Palladyn',equipment:'Święty ekwipunek Palladyna'};
    if(hero.profession==='warrior-profession-2')return {id:hero.profession,name:'Rycerz',equipment:'Ekwipunek Rycerza'};
    return null;
  }
  function markup(){
    return `<section class="barracks-panel" aria-label="Plac treningowy koszar"><div class="barracks-viewport" tabindex="0" role="region" aria-label="Przesuwany widok koszar" aria-describedby="barracks-pan-hint"><div class="barracks-panorama"><img class="barracks-room-art" src="barracks-training.webp?v=realistic-faces-1" decoding="async" alt="Plac treningowy koszar: paladyn Gabriel w lśniącej zbroi bez hełmu, manekiny treningowe, stojaki z bronią oraz drzwi do zbrojowni i do dowódcy paladynów." draggable="false"><button type="button" class="barracks-hotspot barracks-roland" data-barracks-part="roland" aria-label="Porozmawiaj z Rolandem" hidden><span>Roland</span><small>Zbrojmistrz</small></button><div class="barracks-vignette" aria-hidden="true"></div><button type="button" class="barracks-hotspot barracks-person" data-barracks-part="person"><span>Gabriel</span><small>Paladyn</small></button><button type="button" class="barracks-hotspot barracks-armory" data-barracks-part="armory"><span>Zbrojownia</span></button><button type="button" class="barracks-hotspot barracks-commander" data-barracks-part="commander"><span>Dowódca paladynów</span></button></div></div><p class="sr-only" id="barracks-pan-hint">Przesuwaj widok, by obejrzeć plac treningowy, porozmawiać z Gabrielem i sprawdzić drzwi.</p><dialog class="barracks-detail-dialog" aria-labelledby="barracks-detail-title"><h2 id="barracks-detail-title" tabindex="-1"></h2><div class="barracks-detail-content"></div><button type="button" class="secondary" data-close-barracks-detail>Wróć na plac treningowy</button></dialog></section>`;
  }
  function mount(root,{professionMarkup,read,onTitle=()=>{}}={}){
    cancel();
    const panel=root.querySelector('.barracks-panel'),view=panel.querySelector('.barracks-viewport'),scene=panel.querySelector('.barracks-panorama'),art=scene.querySelector('img'),dialog=panel.querySelector('.barracks-detail-dialog');
    let centered=false,disposed=false,room='training',partOpen='';
    const roland=panel.querySelector('[data-barracks-part=roland]');
    function fit(){
      if(disposed||!view.isConnected)return;
      const height=Math.max(600,view.clientHeight),ratio=art.naturalWidth&&art.naturalHeight?art.naturalWidth/art.naturalHeight:2;
      scene.style.height=`${height}px`;scene.style.width=`${height*ratio}px`;
      if(!centered&&art.complete&&art.naturalWidth&&view.clientWidth){view.scrollLeft=Math.max(0,scene.clientWidth*.5-view.clientWidth/2);view.scrollTop=room==='armory'?Math.max(0,roland.offsetTop+roland.offsetHeight/2+24-view.clientHeight):0;centered=true;}
    }
    function enterArmory(){
      if(disposed)return;
      if(dialog.open)dialog.close();room='armory';partOpen='';centered=false;panel.dataset.barracksRoom=room;
      for(const button of scene.querySelectorAll('[data-barracks-part]'))button.hidden=button.dataset.barracksPart!=='roland';
      art.src='armory-roland.webp';art.alt='Zbrojownia Żelaznej Przysięgi: Roland, zbrojmistrz w ciemnej zbroi i zielonej pelerynie, stoi w kamiennej sali. Wokół stojaki z bronią, święte pancerze Palladynów i ciężkie uzbrojenie Rycerzy.';
      panel.setAttribute('aria-label','Zbrojownia Żelaznej Przysięgi');panel.querySelector('#barracks-pan-hint').textContent='Przesuwaj widok palcem lub myszą. Kliknij podpis Roland, aby porozmawiać o ekwipunku.';view.setAttribute('aria-label','Przesuwany widok zbrojowni z Rolandem');onTitle('Zbrojownia Żelaznej Przysięgi');
      window.SceneZoom?.reset(view);fit();view.focus({preventScroll:true});
    }
    function show(part){
      if(disposed)return;
      if(part==='armory'){enterArmory();return;}
      partOpen=part;
      const title=dialog.querySelector('h2'),content=dialog.querySelector('.barracks-detail-content');
      dialog.classList.toggle('shows-professions',part==='professions');
      if(part==='person'){
        title.textContent='Gabriel';
        content.innerHTML='<div class="barracks-emblem"><span class="rpg-icon icon-barracks" aria-hidden="true"></span></div><span class="barracks-dialogue-kicker">Paladyn · Żelazna Przysięga</span><p>Witaj na placu treningowym. Zbroja osłania ciało, lecz to dyscyplina trzyma wojownika na nogach. Rozejrzyj się po koszarach.</p><button type="button" class="secondary" data-barracks-part="professions">Porozmawiaj o profesjach</button>';
      }else if(part==='professions'){
        title.textContent='Profesje';content.innerHTML=professionMarkup?professionMarkup():'<p>Profesje są w przygotowaniu.</p>';
      }else if(part==='roland'){
        title.textContent='Roland';
        let allowed=null,failed=false;try{allowed=armoryProfession(read?.());}catch{failed=true;}
        content.innerHTML='<div class="barracks-emblem"><span class="rpg-icon icon-inventory" aria-hidden="true"></span></div><span class="barracks-dialogue-kicker">Zbrojmistrz · Żelazna Przysięga</span><p>Witaj w zbrojowni. Odpowiadam za uzbrojenie Palladynów i Rycerzy.</p>'+(allowed?`<section class="roland-service" data-armory-profession="${allowed.id}"><h3>${allowed.equipment}</h3><p>Twoja profesja: <strong>${allowed.name}</strong>. Roland przygotuje dla niej odpowiedni ekwipunek.</p><p class="panel-note">Oferta przedmiotów i zasady ich zdobywania są do ustalenia.</p></section>`:`<p class="roland-access-note" role="status">${failed?'Nie można odczytać postaci. Otwórz zbrojownię ponownie.':'Ekwipunek Rolanda jest dostępny wyłącznie dla Palladynów i Rycerzy od poziomu 10.'}</p>`);
      }else if(part==='commander'){
        title.textContent='Dowódca paladynów';content.innerHTML='<p>Te drzwi prowadzą do gabinetu dowódcy paladynów. Gabriel daje znak, aby zaczekać — audiencje nie są jeszcze dostępne.</p>';
      }else return;
      dialog.querySelector('[data-close-barracks-detail]').textContent=room==='armory'?'Wróć do zbrojowni':'Wróć na plac treningowy';
      if(!dialog.open)dialog.showModal();dialog.querySelector('h2').focus({preventScroll:true});dialog.scrollTop=0;
    }
    showProfessions=()=>show('professions');
    function click(e){if(e.target.closest('[data-close-barracks-detail]')){dialog.close();return;}const target=e.target.closest('[data-barracks-part]');if(target)show(target.dataset.barracksPart);}
    function refreshAccess(e){if(!disposed&&dialog.open&&partOpen==='roland'&&(!e.key||e.key==='pustkowie.hero.v2'))show('roland');}
    window.addEventListener('storage',refreshAccess);window.addEventListener('focus',refreshAccess);
    art.addEventListener('load',fit);const observer=new ResizeObserver(fit);observer.observe(view);
    panel.addEventListener('click',click);fit();
    stop=()=>{disposed=true;showProfessions=()=>{};window.removeEventListener('storage',refreshAccess);window.removeEventListener('focus',refreshAccess);observer.disconnect();art.removeEventListener('load',fit);panel.removeEventListener('click',click);if(dialog.open)dialog.close();};
  }
  window.BarracksPanel={markup,mount,cancel,armoryProfession,openProfessions:()=>showProfessions()};
})();
