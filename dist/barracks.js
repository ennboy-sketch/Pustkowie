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
    return `<section class="barracks-panel" aria-label="Plac treningowy koszar"><div class="barracks-viewport" tabindex="0" role="region" aria-label="Przesuwany widok koszar" aria-describedby="barracks-pan-hint"><div class="barracks-panorama"><img class="barracks-room-art" src="barracks-training.webp?v=realistic-faces-1" decoding="async" alt="Plac treningowy koszar: paladyn Gabriel w lśniącej zbroi bez hełmu, manekiny treningowe, stojaki z bronią oraz drzwi do zbrojowni i do dowódczyni paladynów." draggable="false"><button type="button" class="barracks-hotspot barracks-roland" data-barracks-part="roland" aria-label="Porozmawiaj z Rolandem" hidden><span>Roland</span><small>Zbrojmistrz</small></button><button type="button" class="barracks-hotspot barracks-melody" data-barracks-part="melody" aria-label="Porozmawiaj z Melody" hidden><span>Melody</span><small>Dowódczyni paladynów</small></button><div class="barracks-vignette" aria-hidden="true"></div><button type="button" class="barracks-hotspot barracks-person" data-barracks-part="person"><span>Gabriel</span><small>Paladyn</small></button><button type="button" class="barracks-hotspot barracks-armory" data-barracks-part="armory"><span>Zbrojownia</span></button><button type="button" class="barracks-hotspot barracks-commander" data-barracks-part="commander"><span>Dowódczyni paladynów</span></button></div></div><p class="sr-only" id="barracks-pan-hint">Przesuwaj widok, by obejrzeć plac treningowy, porozmawiać z Gabrielem i sprawdzić drzwi.</p><dialog class="barracks-detail-dialog" aria-labelledby="barracks-detail-title"><h2 id="barracks-detail-title" tabindex="-1"></h2><div class="barracks-detail-content"></div><button type="button" class="secondary" data-close-barracks-detail>Wróć na plac treningowy</button></dialog></section>`;
  }
  function mount(root,{professionMarkup,read,onTitle=()=>{}}={}){
    cancel();
    const panel=root.querySelector('.barracks-panel'),view=panel.querySelector('.barracks-viewport'),scene=panel.querySelector('.barracks-panorama'),art=scene.querySelector('img'),dialog=panel.querySelector('.barracks-detail-dialog');
    let centered=false,disposed=false,room='training',partOpen='';
    const rooms={
      armory:{npc:'roland',title:'Zbrojownia Żelaznej Przysięgi',image:'armory-roland.webp',alt:'Zbrojownia Żelaznej Przysięgi: Roland, zbrojmistrz w ciemnej zbroi i zielonej pelerynie, stoi w kamiennej sali. Wokół stojaki z bronią, święte pancerze Palladynów i ciężkie uzbrojenie Rycerzy.',hint:'Przesuwaj widok palcem lub myszą. Kliknij podpis Roland, aby porozmawiać o ekwipunku.',label:'Przesuwany widok zbrojowni z Rolandem'},
      commander:{npc:'melody',title:'Komnata dowódczyni paladynów',image:'melody-chamber.webp',alt:'Melody, dowódczyni paladynów o jasnych, falowanych włosach, stoi w komnacie z witrażami i czerwono-złotymi chorągwiami. Nosi srebrną zbroję ze złotymi lwami, rubinami i symbolami słońca oraz biały haftowany płaszcz. Dłoń opiera na rękojeści wielkiego miecza. Obok stoją stół z mapą i stojaki z bronią.',hint:'Przesuwaj widok palcem lub myszą. Kliknij podpis Melody, aby porozmawiać z dowódczynią paladynów.',label:'Przesuwany widok komnaty Melody'}
    };
    function fit(){
      if(disposed||!view.isConnected)return;
      const height=Math.max(600,view.clientHeight),ratio=art.naturalWidth&&art.naturalHeight?art.naturalWidth/art.naturalHeight:2;
      scene.style.height=`${height}px`;scene.style.width=`${height*ratio}px`;
      if(!centered&&art.complete&&art.naturalWidth&&view.clientWidth){view.scrollLeft=Math.max(0,scene.clientWidth*.5-view.clientWidth/2);const npc=rooms[room]&&scene.querySelector(`[data-barracks-part=${rooms[room].npc}]`);view.scrollTop=npc?Math.max(0,npc.offsetTop+npc.offsetHeight/2+24-view.clientHeight):0;centered=true;}
    }
    function enterRoom(id){
      if(disposed||!rooms[id])return;
      const destination=rooms[id];
      if(dialog.open)dialog.close();room=id;partOpen='';centered=false;panel.dataset.barracksRoom=room;
      for(const button of scene.querySelectorAll('[data-barracks-part]'))button.hidden=button.dataset.barracksPart!==destination.npc;
      art.src=destination.image;art.alt=destination.alt;
      panel.setAttribute('aria-label',destination.title);panel.querySelector('#barracks-pan-hint').textContent=destination.hint;view.setAttribute('aria-label',destination.label);onTitle(destination.title);
      window.SceneZoom?.reset(view);fit();view.focus({preventScroll:true});
    }
    function show(part){
      if(disposed)return;
      if(part==='armory'||part==='commander'){enterRoom(part);return;}
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
      }else if(part==='melody'){
        title.textContent='Melody';content.innerHTML='<span class="barracks-dialogue-kicker">Dowódczyni paladynów · Żelazna Przysięga</span><p>Witaj w mojej komnacie. Jestem Melody, dowódczyni paladynów. Nasze miecze strzegą Zamku Czarnej Stali, a przysięga przypomina nam, kogo mamy chronić.</p>';
      }else return;
      dialog.querySelector('[data-close-barracks-detail]').textContent=room==='armory'?'Wróć do zbrojowni':room==='commander'?'Wróć do komnaty Melody':'Wróć na plac treningowy';
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
  window.BarracksPanel={markup,mount,cancel,armoryProfession,openProfessions:()=>showProfessions(),openRoom:id=>{const button=document.querySelector(`.barracks-panorama [data-barracks-part=${id}]`);if(button&&!button.hidden)button.click();}};
})();
