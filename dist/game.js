'use strict';
const CLASSES = {
  warrior: { name: 'Wojownik', female: 'Wojowniczka' },
  mage: { name: 'Mag', female: 'Magini' },
  elf: { name: 'Elf', female: 'Elfka' },
  dwarf: { name: 'Krasnolud', female: 'Krasnoludka' }
};
const IDS = Object.keys(CLASSES);
const $ = selector => document.querySelector(selector);
let classId = 'warrior';
let gender = 'male';
let step = 'choose';
function art(target) {
  const el = $(target);
  el.className = `character ${gender} ${classId}`;
  el.setAttribute('aria-label', `${CLASSES[classId].name}, płeć ${gender === 'male' ? 'męska' : 'żeńska'}`);
}
function render() {
  document.querySelectorAll('[data-class]').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.class === classId)));
  document.querySelectorAll('[data-gender]').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.gender === gender)));
  $('#class-name').textContent = gender === 'female' ? CLASSES[classId].female : CLASSES[classId].name;
  art('#choice-art'); art('#name-art');
}
function show(next) {
  step = next;
  document.body.classList.toggle('playing', next === 'ready');
  for (const id of ['profiles','choose', 'naming', 'ready']) $(`#${id}`).hidden = id !== next;
}
function showSaved(hero) {
  classId = hero.classId; gender = hero.gender; render(); show('ready');
  $('#ready-name').textContent = hero.name;
  $('#identity').textContent = gender === 'female' ? CLASSES[classId].female : CLASSES[classId].name;
  window.mountHub(hero);
  window.GameLocation.ready=window.GameLocation.restore();
}
$('#classes').innerHTML = IDS.map(id => `<button type="button" class="class-option" data-class="${id}" aria-pressed="${id === classId}"><span class="medallion" aria-hidden="true"></span>${CLASSES[id].name}</button>`).join('');
$('#classes').addEventListener('click', e => { const button = e.target.closest('[data-class]'); if (button) { classId = button.dataset.class; render(); } });
$('.gender').addEventListener('click', e => { const button = e.target.closest('[data-gender]'); if (button) { gender = button.dataset.gender; render(); } });
function cycle(direction) { classId = IDS[(IDS.indexOf(classId) + direction + IDS.length) % IDS.length]; render(); }
$('#previous').addEventListener('click', () => cycle(-1));
$('#following').addEventListener('click', () => cycle(1));
$('#next').addEventListener('click', () => { show('naming'); $('#hero-name').focus(); });
$('#back').addEventListener('click', () => { show('choose'); $('#next').focus(); });
$('#hero-name').addEventListener('input', () => { $('#hero-name').setCustomValidity(''); $('#name-error').textContent = ''; });
let creating=false;
$('#name-form').addEventListener('submit', async e => {
  e.preventDefault();if(creating)return;
  const name = $('#hero-name').value.trim();
  if (name.length < 2 || name.length > 24) { $('#name-error').textContent = 'Nazwa musi mieć od 2 do 24 znaków.'; $('#hero-name').focus(); return; }
  const hero = {version:2,classId,gender,name,level:1,xp:0,profession:null,gold:25,energy:100,beerDrinks:[],energyCycleHours:12,nextEnergyResetAt:Date.now()+window.EnergyCycle.INTERVAL};
  creating=true;$('#name-form button[type=submit]').disabled=true;
  try { const id=await locked(()=>window.LocalProfiles.create(hero));window.LocalProfiles.activate(id);$('#status').textContent='';showSaved(hero);$('#settlement-title').focus(); }
  catch(error) { $('#status').textContent = 'Nie udało się zapisać nowej postaci. '+error.message; }
  finally{creating=false;$('#name-form button[type=submit]').disabled=false;}
});
function profileMessage(error){$('#profiles-status').textContent='Nie udało się wykonać operacji. '+error.message;}
const locked=fn=>navigator.locks?navigator.locks.request('pustkowie-hero-v2',fn):Promise.resolve().then(fn);
function renderProfiles(){
  show('profiles');const list=$('#profiles-list');list.replaceChildren();
  try{
    const profiles=window.LocalProfiles.list();
    if(!profiles.length){const p=document.createElement('p');p.textContent='Nie masz jeszcze profili. Stwórz swoją pierwszą postać lub zaimportuj kopię zapisu.';list.append(p);}
    for(const profile of profiles){
      const card=document.createElement('article');card.className='profile-card';
      if(profile.error){card.textContent='Nie można odczytać jednego z profili. Zachowano jego zapis.';list.append(card);continue;}
      const {hero,id,location}=profile;
      const portrait=document.createElement('div');portrait.className='profile-portrait';portrait.setAttribute('aria-hidden','true');
      const figure=document.createElement('span');figure.className=`character ${hero.gender} ${hero.classId}${window.HeroSkins?.classSuffix(hero)||''}`;portrait.append(figure);
      const info=document.createElement('div'),name=document.createElement('h2'),description=document.createElement('p'),where=document.createElement('small');
      name.textContent=hero.name;description.textContent=`${hero.gender==='female'?CLASSES[hero.classId].female:CLASSES[hero.classId].name} · Poziom ${window.Progression.level(hero)}`;
      const roomName=location?.place==='skin-house'?(location.room==='bedroom'?'Sypialnia Vespery':'Dom Tysiąca Twarzy'):location?.place==='barracks'?{commander:'Komnata Melody',armory:'Zbrojownia Rolanda'}[location.room]:location?.place==='guild'?{throne:'Sala tronowa',school:'Komnata Leśnej Przysięgi'}[location.room]:null;
      where.textContent='Ostatnie miejsce: '+(roomName||{map:'Zamek Czarnej Stali',glade:'Polana',ubocze:'Ubocze','hell-gates':'Wrota Piekieł'}[location?.world]||'Zamek Czarnej Stali');
      info.append(name,description,where);
      const buttons=document.createElement('div');buttons.className='profile-buttons';
      const play=document.createElement('button');play.type='button';play.className='primary';play.dataset.playProfile=id;play.textContent='Graj';play.setAttribute('aria-label',`Graj: ${hero.name}`);
      play.addEventListener('click',()=>{try{window.LocalProfiles.enter(id);}catch(e){profileMessage(e);}});
      const backup=document.createElement('button');backup.type='button';backup.className='secondary';backup.textContent='Eksportuj';backup.setAttribute('aria-label',`Eksportuj: ${hero.name}`);
      backup.addEventListener('click',()=>{try{const blob=new Blob([window.LocalProfiles.exportText(id)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`Pustkowie-${hero.name.replace(/[^\p{L}\p{N}_-]/gu,'_')}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(e){profileMessage(e);}});
      buttons.append(play,backup);card.append(portrait,info,buttons);list.append(card);
    }
  }catch(e){profileMessage(e);}
}
$('#restart').addEventListener('click',()=>{window.GameLocation.flush();location.reload();});
$('#new-profile').addEventListener('click',()=>{$('#name-form').reset();$('#name-error').textContent='';show('choose');$('#next').focus();});
$('#back-profiles').addEventListener('click',renderProfiles);
$('#import-profile').addEventListener('click',()=>$('#profile-file').click());
$('#profile-file').addEventListener('change',async e=>{
  const file=e.target.files[0];if(!file)return;
  try{
    if(file.size>2*1024*1024)throw Error('Plik jest zbyt duży (maksymalnie 2 MB).');
    const text=await file.text();await locked(()=>window.LocalProfiles.importText(text));renderProfiles();$('#profiles-status').textContent='Zaimportowano nowy profil. Pozostałe postacie są zachowane.';
  }catch(error){profileMessage(error);}finally{e.target.value='';}
});
render();
try{const hero=window.LocalProfiles.consumeEntry();if(hero)showSaved(hero);else renderProfiles();}
catch(error){renderProfiles();profileMessage(error);}
