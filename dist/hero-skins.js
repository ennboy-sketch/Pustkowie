'use strict';
(()=>{
  const COST=20,IMAGE='hero-skins.webp';
  const CATALOG=Object.freeze([
    {id:'ember-steel',classId:'warrior',name:'Żar Czarnej Stali',description:'Czarna zbroja ze złotymi zdobieniami, żarzące akcenty i bordowy płaszcz.'},
    {id:'astral-wanderer',classId:'mage',name:'Astralny Wędrowiec',description:'Granatowe szaty ze srebrnymi konstelacjami i kostur z błękitnym kryształem.'},
    {id:'moonwood',classId:'elf',name:'Księżycowa Knieja',description:'Srebrzyste zdobienia, ciemny turkus i płaszcz z motywami księżyca.'},
    {id:'mountain-heir',classId:'dwarf',name:'Dziedzic Gór',description:'Miedziano-żelazny pancerz z runami, futro i zdobiony topór.'}
  ].map(Object.freeze));
  const CLASSES={warrior:'Wojownik',mage:'Mag',elf:'Elf',dwarf:'Krasnolud'};
  const get=id=>CATALOG.find(skin=>skin.id===id);
  const owned=hero=>[...new Set((Array.isArray(hero.ownedHeroSkins)?hero.ownedHeroSkins:[]).filter(id=>get(id)?.classId===hero.classId))];
  const current=hero=>owned(hero).includes(hero.heroSkin)?get(hero.heroSkin):null;
  function balance(hero){const n=hero.shards??0;if(!Number.isSafeInteger(n)||n<0)throw Error('Nieprawidłowy zapis odłamków.');return n;}
  function equip(hero,id){
    if(id===null||id==='default')return hero.heroSkin?{...hero,heroSkin:null}:hero;
    const skin=get(id);if(!skin||skin.classId!==hero.classId)throw Error('Strój dla innej klasy postaci.');
    if(!owned(hero).includes(id))throw Error('Najpierw kup ten strój.');
    return hero.heroSkin===id?hero:{...hero,heroSkin:id};
  }
  function purchase(hero,id){
    const skin=get(id);if(!skin||skin.classId!==hero.classId)throw Error('Strój dla innej klasy postaci.');
    if(owned(hero).includes(id))return equip(hero,id);
    const shards=balance(hero);if(shards<COST)throw Error(`Potrzebujesz ${COST} odłamków.`);
    return {...hero,shards:shards-COST,ownedHeroSkins:[...owned(hero),id],heroSkin:id};
  }
  const classSuffix=hero=>current(hero)?' hero-skin':'';
  const battleSuffix=fighter=>get(fighter.appearanceSkin)?.classId===fighter.classId?' hero-skin':'';
  function validate(hero){
    if(hero.ownedHeroSkins!==undefined&&(!Array.isArray(hero.ownedHeroSkins)||hero.ownedHeroSkins.some(id=>typeof id!=='string'||!get(id)||get(id).classId!==hero.classId)))throw Error('Nieprawidłowy zapis kupionych strojów.');
    if(hero.heroSkin!==undefined&&hero.heroSkin!==null&&!current(hero))throw Error('Nieprawidłowy zapis założonego stroju.');
  }
  function mountShop(dialog,state){
    let disposed=false,busy=false,selected='default',token=0,preloaded=null;
    let loadAttempt=0;
    const preload=()=>{if(!preloaded){const image=new Image();image.src=IMAGE+'?v=hero-skins-1&load='+(++loadAttempt);preloaded=image.decode().then(()=>{document.documentElement.style.setProperty('--hero-skins-image',`url("${image.src}")`);}).catch(error=>{preloaded=null;throw error;});}return preloaded;};
    function render(message=''){
      if(disposed)return;
      const hero=state.read(),skin=get(selected),active=current(hero),has=owned(hero).includes(selected),foreign=!!skin&&skin.classId!==hero.classId,shards=balance(hero);
      const can=selected==='default'?!!active:!foreign&&(has?active?.id!==selected:shards>=COST);
      const figure=(s,base=false)=>`<span class="character ${hero.gender} ${s?.classId||hero.classId}${base?'':' hero-skin'}" aria-hidden="true"></span>`;
      dialog.innerHTML=`<h3 tabindex="-1">Stroje bohatera</h3><p class="hero-skin-wallet">Posiadasz: <strong>${shards}</strong> odłamków</p><p class="hero-skin-rule">Zakup za ${COST} odłamków odblokowuje strój na stałe dla tej postaci. Zakładanie kupionego stroju i powrót do podstawowego wyglądu są bezpłatne. Strój nie zmienia statystyk ani wyposażenia.</p><div class="hero-skin-preview"><div>${figure(skin,selected==='default')}</div><section><h4>${skin?.name||'Podstawowy wygląd'}</h4><p>${skin?.description||'Oryginalny wygląd Twojego bohatera.'}</p><small>${CLASSES[skin?.classId||hero.classId]} · ${hero.gender==='female'?'Wersja żeńska':'Wersja męska'}</small></section></div><fieldset ${busy?'disabled':''}><legend>Wybierz strój</legend><div class="hero-skin-grid"><label><input type="radio" name="hero-skin-choice" value="default" ${selected==='default'?'checked':''}><span class="hero-skin-thumb">${figure(null,true)}</span><strong>Podstawowy wygląd</strong><small>Bezpłatny</small></label>${CATALOG.map(s=>`<label><input type="radio" name="hero-skin-choice" value="${s.id}" ${selected===s.id?'checked':''}><span class="hero-skin-thumb">${figure(s)}</span><strong>${s.name}</strong><small>${CLASSES[s.classId]} · ${s.classId!==hero.classId?'Inna klasa':owned(hero).includes(s.id)?'Kupiony':COST+' odłamków'}</small></label>`).join('')}</div></fieldset><div class="hero-skin-checkout"><strong>${skin?.name||'Podstawowy wygląd'}</strong><button type="button" class="primary" data-confirm-hero-skin ${busy||!can?'disabled':''}>${busy?'Zapisywanie…':foreign?'Strój dla innej klasy':selected==='default'?active?'Przywróć podstawowy wygląd':'Aktualny wygląd':has?active?.id===selected?'Aktualny wygląd':'Załóż · bez opłat':shards<COST?'Potrzebujesz '+COST+' odłamków':'Kup i załóż · '+COST+' odłamków'}</button><p class="hero-skin-message" role="status" aria-live="polite"></p></div><button type="button" class="secondary" data-close-hero-skins>Wróć do pracowni</button>`;
      dialog.querySelector('.hero-skin-message').textContent=message;
    }
    async function confirm(){
      if(busy||disposed)return;
      const id=selected,operation=++token;busy=true;render();let message='';
      try{
        if(id!=='default')await preload();
        if(disposed||!dialog.open||operation!==token)return;
        let bought=false;
        const commit=()=>{if(disposed||!dialog.open||operation!==token)return null;return state.update(hero=>{bought=id!=='default'&&!owned(hero).includes(id);return id==='default'?equip(hero,null):purchase(hero,id);});};
        const next=navigator.locks?await navigator.locks.request('pustkowie-hero-v2',commit):commit();
        if(!next||disposed)return;
        message=bought?`Kupiono i założono: ${get(id).name}. Pobrano ${COST} odłamków.`:id==='default'?'Przywrócono podstawowy wygląd.':`Założono: ${get(id).name}. Bez dodatkowej opłaty.`;
      }catch(error){message=error.name==='QuotaExceededError'||error.name==='SecurityError'?'Nie udało się zapisać stroju. Odłamki nie zostały pobrane.':error.name==='EncodingError'?'Nie udało się wczytać stroju. Odłamki nie zostały pobrane.':error.message;}
      finally{busy=false;if(!disposed)render(message);}
    }
    function click(e){if(e.target.closest('[data-close-hero-skins]'))dialog.close();else if(e.target.closest('[data-confirm-hero-skin]'))void confirm();}
    function change(e){if(e.target.name==='hero-skin-choice'&&!busy){selected=e.target.value;render();}}
    function closed(){token++;}
    function storage(e){if(e.key==='pustkowie.hero.v2'&&dialog.open&&!busy)try{render();}catch{}}
    dialog.addEventListener('click',click);dialog.addEventListener('change',change);dialog.addEventListener('close',closed);window.addEventListener('storage',storage);
    return {open(){if(disposed)return;selected=current(state.read())?.id||CATALOG.find(s=>s.classId===state.read().classId)?.id||'default';render();if(!dialog.open)dialog.showModal();dialog.scrollTop=0;dialog.querySelector('h3').focus({preventScroll:true});},stop(){disposed=true;token++;dialog.removeEventListener('click',click);dialog.removeEventListener('change',change);dialog.removeEventListener('close',closed);window.removeEventListener('storage',storage);if(dialog.open)dialog.close();}};
  }
  window.HeroSkins={COST,IMAGE,CATALOG,get,owned,current,balance,equip,purchase,classSuffix,battleSuffix,validate,mountShop};
})();
