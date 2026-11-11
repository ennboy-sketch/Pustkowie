'use strict';
(() => {
  const INDEX='pustkowie.profiles.v1',LEGACY='pustkowie.hero.v2',ENTER='pustkowie.profile.enter.v1';
  let active=null;
  const key=id=>id==='legacy'?LEGACY:`${LEGACY}.${id}`;
  function validHero(h){return !!h&&h.version===2&&['warrior','mage','elf','dwarf'].includes(h.classId)&&['male','female'].includes(h.gender)&&typeof h.name==='string'&&h.name.trim().length>=2&&h.name.length<=24;}
  function index(){
    const raw=localStorage.getItem(INDEX),data=raw?JSON.parse(raw):{version:1,ids:[]};
    if(!data||data.version!==1||!Array.isArray(data.ids)||new Set(data.ids).size!==data.ids.length||data.ids.some(id=>typeof id!=='string'||!(/^(legacy|[a-f0-9-]{36})$/i).test(id)))throw Error('Lista profili jest uszkodzona. Nie nadpisano zapisów.');
    const old=localStorage.getItem(LEGACY);
    if(old&&!data.ids.includes('legacy')){
      let hero;try{hero=JSON.parse(old);}catch{}
      if(validHero(hero)){data.ids.unshift('legacy');localStorage.setItem(INDEX,JSON.stringify(data));}
    }
    return data;
  }
  function readId(id){if(!index().ids.includes(id))throw Error('Nie znaleziono profilu.');const h=JSON.parse(localStorage.getItem(key(id)));if(!validHero(h))throw Error('Zapis tej postaci jest uszkodzony.');return h;}
  function view(id=active){if(!id)return null;try{return JSON.parse(localStorage.getItem(key(id)+'.view'));}catch{return null;}}
  function list(){return index().ids.map(id=>{try{return{id,hero:readId(id),location:view(id)};}catch{return{id,error:true};}});}
  function write(hero){if(!active||!validHero(hero))throw Error('Nie można zapisać postaci. Wybierz profil ponownie.');localStorage.setItem(key(active),JSON.stringify(hero));return hero;}
  function create(hero,location=null){
    validate(hero);const data=index(),id=crypto.randomUUID(),saveKey=key(id);
    try{localStorage.setItem(saveKey,JSON.stringify(hero));if(location)localStorage.setItem(saveKey+'.view',JSON.stringify(location));data.ids.push(id);localStorage.setItem(INDEX,JSON.stringify(data));}
    catch(e){localStorage.removeItem(saveKey);localStorage.removeItem(saveKey+'.view');throw e;}
    return id;
  }
  function validate(hero){
    if(!validHero(hero))throw Error('Plik nie zawiera poprawnej postaci Pustkowia.');
    let count=0;
    function walk(v,depth=0){
      if(++count>30000||depth>32)throw Error('Zapis jest zbyt złożony.');
      if(typeof v==='number'&&!Number.isFinite(v))throw Error('Nieprawidłowa liczba w zapisie.');
      if(typeof v==='string'&&(v.length>20000||/[<>]/.test(v)))throw Error('Zapis zawiera niedozwolony tekst.');
      if(v&&typeof v==='object')for(const [k,x] of Object.entries(v)){if(['__proto__','constructor','prototype'].includes(k))throw Error('Nieprawidłowe pole w zapisie.');walk(x,depth+1);}
    }
    walk(hero);
    for(const k of ['level','xp','gold','shards','energy','magicDust','rareMaterial','gemFragments','spellScrolls','deadBones','blackSteel'])if(hero[k]!==undefined&&(!(k==='energy'?typeof hero[k]==='number'&&Number.isSafeInteger(hero[k]*2):Number.isSafeInteger(hero[k]))||hero[k]<(k==='level'?1:0)))throw Error('Nieprawidłowe zasoby lub poziom postaci.');
    window.HeroSkins?.validate(hero);
    window.VesperaOutfits?.validate(hero);
    window.OathCampaign?.validate(hero);
    // Reuse the actual game validators when loaded by the browser.
    window.HeroSheet?.inventory(hero);window.HeroSheet?.bonuses(hero);window.BeerService?.status(hero);window.GabrielTraining?.quest(hero);window.ArmoryRewards?.progress(hero);
    return hero;
  }
  function importText(text){
    if(typeof text!=='string'||text.length>2*1024*1024)throw Error('Plik jest zbyt duży (maksymalnie 2 MB).');
    let data;try{data=JSON.parse(text);}catch{throw Error('Nie można odczytać pliku JSON.');}
    const wrapped=data?.format==='pustkowie-profile';
    if(wrapped&&data.version!==1)throw Error('Nieobsługiwana wersja kopii zapasowej.');
    const hero=validate(wrapped?data.hero:data),location=wrapped?cleanView(data.location):null;
    return create(hero,location);
  }
  function cleanView(v){
    if(!v||!['map','glade','ubocze','hell-gates'].includes(v.world))return null;
    const position=p=>p&&['x','y','scale'].every(k=>typeof p[k]==='number'&&Number.isFinite(p[k]))?{x:Math.max(0,Math.min(1,p.x)),y:Math.max(0,Math.min(1,p.y)),scale:Math.max(1,Math.min(3,p.scale))}:null;
    return {world:v.world,worldView:position(v.worldView),place:typeof v.place==='string'&&/^[a-z0-9-]{1,40}$/.test(v.place)?v.place:null,room:['entrance','throne','school','archive','training','armory','commander','workshop','bedroom'].includes(v.room)?v.room:null,placeView:position(v.placeView)};
  }
  function saveView(location){if(active)localStorage.setItem(key(active)+'.view',JSON.stringify(cleanView(location)));}
  function exportText(id){return JSON.stringify({format:'pustkowie-profile',version:1,exportedAt:new Date().toISOString(),hero:readId(id),location:cleanView(view(id))},null,2);}
  function enter(id){readId(id);sessionStorage.setItem(ENTER,id);location.reload();}
  function consumeEntry(){const id=sessionStorage.getItem(ENTER);sessionStorage.removeItem(ENTER);if(id){readId(id);active=id;return readId(id);}return null;}
  function activate(id){readId(id);active=id;return readId(id);}
  window.addEventListener?.('storage',e=>{if(active&&active!=='legacy'&&e.key===key(active))window.dispatchEvent(new StorageEvent('storage',{key:LEGACY,oldValue:e.oldValue,newValue:e.newValue}));});
  window.LocalProfiles={list,read:()=>readId(active),write,create,importText,exportText,view,saveView,cleanView,enter,consumeEntry,activate,validHero,active:()=>active};
})();
