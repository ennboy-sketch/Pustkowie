'use strict';
(()=>{
 const game=()=>window.OathCampaign;
 let selectActive=()=>{};
 const reward=q=>`${q.reward.gold} złota · ${q.reward.xp.toLocaleString('pl-PL')} EXP${q.reward.shards?' · '+q.reward.shards+' odłamków':''}`;
 function markup(){return `<section class="campaign-panel" aria-label="Kampania Pęknięta Przysięga"><header class="campaign-heading"><span class="rpg-icon icon-journal" aria-hidden="true"></span><div><small>KRONIKI ZAMKU CZARNEJ STALI</small><h3>Pęknięta Przysięga</h3><p>Ślady skradzionych rozkazów prowadzą coraz bliżej królewskiego tronu.</p></div></header><div class="campaign-overview"></div><div class="campaign-tabs" role="group" aria-label="Rodzaj zadań"><button type="button" data-campaign-tab="main" aria-pressed="true">Główna historia</button><button type="button" data-campaign-tab="side" aria-pressed="false">Zadania poboczne</button><button type="button" data-campaign-tab="chapter" aria-pressed="false">Dalsze rozdziały</button></div><p class="campaign-message" role="status" aria-live="polite"></p><div class="campaign-grid"><div class="campaign-quests" aria-label="Lista zadań"></div><article class="campaign-detail" aria-live="polite"></article></div><details class="campaign-evidence"><summary>Dowody i zapisane decyzje</summary><div></div></details><details class="campaign-arrival"><summary>Przybycie do zamku</summary><p>Twoja postać dotarła do Zamku Czarnej Stali. Jej dotychczasowe dokonania pozostają częścią tej historii.</p></details><div class="campaign-combat"></div><dialog class="campaign-encounter" aria-labelledby="campaign-encounter-title"><img alt="" class="campaign-encounter-art"><div class="campaign-encounter-body"><small>WYDARZENIE FABULARNE</small><h3 id="campaign-encounter-title" tabindex="-1"></h3><p class="campaign-encounter-story"></p><div class="campaign-encounter-choices"></div><p class="campaign-encounter-message" role="status" aria-live="polite"></p><button type="button" class="secondary" data-close-campaign-encounter>Wróć do dziennika</button></div></dialog></section>`;}
 function mount(root,state){
  const panel=root.matches('.campaign-panel')?root:root.querySelector('.campaign-panel'),list=panel.querySelector('.campaign-quests'),detail=panel.querySelector('.campaign-detail'),message=panel.querySelector('.campaign-message'),dialog=panel.querySelector('.campaign-encounter');
  let selected=game().current(state.read())?.id||'broken-crown',tab=game().get(selected).kind,disposed=false,busy=false,encounter=null;
  const locked=fn=>navigator.locks?navigator.locks.request('pustkowie-hero-v2',fn):Promise.resolve().then(fn);
  const combat=window.BrandCombat.mount(panel.querySelector('.campaign-combat'),{...state,onQuestResolved:next=>{if(disposed)return;const last=next.lastCampaignBattle;message.textContent=last?.won?'Zwycięstwo. Cel został zapisany w dzienniku.':'Porażka. Możesz wrócić do tej walki bez dodatkowej opłaty.';render();}});
  function render(){
   if(disposed)return;
   try{
    const h=state.read(),saved=game().read(h),p=game().status(h,selected),q=p.quest,other=!!h.activeMission||!!h.activeCombat;
    panel.querySelector('.campaign-overview').innerHTML=`<span>Główna historia: <strong>${game().CATALOG.filter(q=>q.kind==='main'&&saved.completed.includes(q.id)).length} / 10</strong></span><span>Odłamki: <strong>${Number.isSafeInteger(h.shards)?h.shards:0}</strong></span>${h.activeCombat?.source==='campaign'?'<button type="button" data-campaign-resume>Wróć do trwającej walki</button>':''}`;
    panel.querySelectorAll('[data-campaign-tab]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.campaignTab===tab)));
    list.innerHTML=game().CATALOG.filter(q=>q.kind===tab).map((entry,i)=>{const s=game().status(h,entry.id);return `<button type="button" class="campaign-quest${entry.id===selected?' is-selected':''}" data-campaign-select="${entry.id}" aria-pressed="${entry.id===selected}"><span class="campaign-step">${s.completed?'✓':i+1}</span><span><strong>${entry.title}</strong><small>${s.completed?'Ukończono':s.ready?'Nagroda do odebrania':s.accepted?'W toku':s.unlocked?'Dostępne':'Od poziomu '+entry.level+(s.missing.length?' · poprzedni etap wymagany':'')}</small></span></button>`;}).join('');
    const permitted=p.unlocked||p.accepted||p.completed,available=game().ACTIVITIES.filter(a=>a.quest===q.id),missing=q.requires.filter(id=>!saved.completed.includes(id));
    detail.innerHTML=`<div class="campaign-detail-kicker">${q.kind==='main'?'MISJA GŁÓWNA':q.kind==='side'?'ZADANIE POBOCZNE':'DALSZY ROZDZIAŁ'} · POZIOM ${q.level}</div><h3 tabindex="-1">${q.title}</h3><p class="campaign-giver">${q.giver}</p><p>${permitted?(p.completed?q.ending:q.story):'Ten fragment historii odsłoni się po ukończeniu poprzedniego etapu i osiągnięciu wymaganego poziomu.'}</p>${missing.length?`<p class="campaign-lock">Najpierw: ${missing.map(id=>game().get(id).title).join(', ')}.</p>`:''}<p class="campaign-reward">Nagroda: ${reward(q)}</p>${permitted?`<ol class="campaign-objectives">${p.goals.map(g=>`<li class="${g.done?'is-done':''}"><span aria-label="${g.done?'Zaliczono':'Do wykonania'}">${g.done?'✓':'○'}</span><div>${g.label}${g.progress?`<small>${g.progress}</small>`:''}${g.place&&!g.done&&p.accepted?`<button type="button" data-campaign-travel="${g.place}">Przejdź do lokacji →</button>`:''}</div></li>`).join('')}</ol>`:''}${q.id==='uninvited'||q.id==='iron-oath'||q.id==='sleepless-graves'?'<p class="campaign-legacy">Wcześniejsze zadania i zwycięstwa są zaliczane z zapisu postaci.</p>':''}${!p.accepted?`<button type="button" class="primary" data-campaign-accept="${q.id}" ${!p.unlocked||busy||other?'disabled':''}>${p.unlocked?'Przyjmij zadanie':'Zadanie zablokowane'}</button>`:p.completed?'<p class="campaign-complete">Zadanie ukończone · nagroda odebrana</p>':`<button type="button" class="primary" data-campaign-claim="${q.id}" ${!p.ready||busy||other?'disabled':''}>${p.ready?'Odbierz nagrodę':'Najpierw wykonaj cele zadania'}</button>`}${p.accepted&&!p.completed?`<div class="campaign-activities">${available.map(a=>{const token=a.kind==='fight'?'win:'+a.id:a.id,finished=game().condition(h,token).done,needs=a.requires.filter(c=>!game().condition(h,c).done);return `<div><button type="button" class="secondary" data-campaign-activity="${a.id}" ${finished||busy||other||needs.length?'disabled':''}>${finished?'✓ ':a.kind==='fight'?'⚔ ':'◇ '}${a.title}</button>${!finished&&needs.length?`<small>Najpierw: ${needs.map(c=>game().condition(h,c).label).join('; ')}.</small>`:''}${!finished?needs.filter(c=>c.startsWith('visit:')).map(c=>`<button type="button" class="campaign-location-link" data-campaign-travel="${c.slice(6)}">Przejdź do lokacji →</button>`).join(''):''}</div>`;}).join('')}</div>`:''}${['tavern','training','dungeon','archive','throne','vespera-bedroom','ubocze','eldor','ice-hills','hell-gates'].includes(q.destination)&&permitted?`<button type="button" class="campaign-location-link" data-campaign-travel="${q.destination}">Odwiedź miejsce zadania →</button>`:''}${other?'<p class="campaign-lock">Masz trwającą walkę lub zwiad. Zakończ je przed rozpoczęciem kolejnego działania.</p>':''}`;
    const evidence=panel.querySelector('.campaign-evidence>div');evidence.replaceChildren();
    if(!saved.clues.length)evidence.textContent='Zebrane dowody i Twoje decyzje będą tutaj zapisywane.';
    for(const id of saved.clues){const a=game().activity(id),choice=a.choices.find(c=>c.id===saved.decisions[id]),entry=document.createElement('p'),title=document.createElement('strong');title.textContent=a.title;entry.append(title,document.createElement('br'),document.createTextNode(choice.result));evidence.append(entry);}
   }catch(error){message.textContent=error.message;detail.replaceChildren();}
  }
  function select(id){if(disposed||!game().get(id))return;selected=id;tab=game().get(id).kind;render();}
  function openEncounter(id){
   const a=game().activity(id);if(!a||a.kind!=='inspect')return;
   const h=state.read(),p=game().status(h,a.quest);if(!p.accepted||p.completed||a.requires.some(c=>!game().condition(h,c).done))return;
   encounter=id;const scene=game().SCENES[a.scene],img=dialog.querySelector('img');img.src=scene.image;img.alt=scene.short;
   dialog.querySelector('h3').textContent=a.title;dialog.querySelector('.campaign-encounter-story').textContent=a.text;dialog.querySelector('.campaign-encounter-message').textContent='';
   dialog.querySelector('.campaign-encounter-choices').innerHTML=a.choices.map(c=>`<button type="button" class="primary" data-campaign-decision="${c.id}">${c.label}</button>`).join('');
   if(!dialog.open)dialog.showModal();dialog.querySelector('h3').focus({preventScroll:true});
  }
  async function change(action,id,choice){
   if(busy||disposed)return;const activityId=encounter;busy=true;message.textContent='';render();
   dialog.querySelectorAll('[data-campaign-decision]').forEach(b=>b.disabled=true);
   try{
    const saved=await locked(()=>{if(disposed||action==='gather'&&(!dialog.open||encounter!==activityId))return;return state.update(h=>action==='accept'?game().accept(h,id):action==='claim'?game().claim(h,id):action==='fight'?game().begin(h,id):game().gather(h,id,choice));});
    if(disposed||!saved)return;
    if(action==='gather'){dialog.close();encounter=null;message.textContent=game().activity(id).choices.find(c=>c.id===choice).result;}
    else if(action==='claim')message.textContent='Zadanie ukończone. Otrzymano: '+reward(game().get(id))+'.';
    else if(action==='accept')message.textContent='Zadanie przyjęte. Dotychczasowe dokonania zostały uwzględnione.';
    else if(action==='fight')await combat.open();
   }catch(error){if(!disposed){const text=error.name==='QuotaExceededError'||error.name==='SecurityError'?'Nie udało się zapisać. Postęp i nagrody pozostały bez zmian.':error.message;message.textContent=text;if(dialog.open)dialog.querySelector('.campaign-encounter-message').textContent=text;}}
   finally{busy=false;if(!disposed){dialog.querySelectorAll('[data-campaign-decision]').forEach(b=>b.disabled=false);render();}}
  }
  function click(e){
   const button=e.target.closest('button');if(!button||button.disabled)return;
   if(button.matches('[data-close-campaign-encounter]')){dialog.close();encounter=null;return;}
   if(busy)return;
   if(button.dataset.campaignTab){tab=button.dataset.campaignTab;selected=game().CATALOG.find(q=>q.kind===tab&&!game().done(state.read(),q.id))?.id||game().CATALOG.find(q=>q.kind===tab).id;render();}
   else if(button.dataset.campaignSelect){select(button.dataset.campaignSelect);detail.querySelector('h3')?.focus({preventScroll:true});}
   else if(button.dataset.campaignAccept)void change('accept',button.dataset.campaignAccept);
   else if(button.dataset.campaignClaim)void change('claim',button.dataset.campaignClaim);
   else if(button.dataset.campaignTravel)state.navigate?.(button.dataset.campaignTravel);
   else if(button.hasAttribute('data-campaign-resume'))void combat.open();
   else if(button.dataset.campaignActivity){const a=game().activity(button.dataset.campaignActivity);if(a.kind==='fight')void change('fight',a.id);else openEncounter(a.id);}
   else if(button.dataset.campaignDecision)void change('gather',encounter,button.dataset.campaignDecision);
  }
  const refresh=e=>{if(!busy&&(!e.key||e.key==='pustkowie.hero.v2'))render();};
  panel.addEventListener('click',click);window.addEventListener('storage',refresh);window.addEventListener('focus',refresh);selectActive=select;render();
  return()=>{disposed=true;if(selectActive===select)selectActive=()=>{};combat();panel.removeEventListener('click',click);window.removeEventListener('storage',refresh);window.removeEventListener('focus',refresh);if(dialog.open)dialog.close();};
 }
 function contact(h){const s=game().read(h);return s.completed.includes('broken-crown')?'Severin pozostaje pod strażą. Jego mapy wskazują cztery odległe pieczęcie, którym wciąż zagraża rozpoczęty rytuał.':s.clues.includes('unmasked')?'Severin nie zaprzecza już dowodom. W siedmiu pierścieniach jego łańcucha drży chłodne światło.':s.completed.includes('blade-trace')?'Na biurku czekają urzędowe wzorce. Severin mówi niewiele, gdy kładziesz obok nich dokumenty z wypraw.':'Jestem Severin, Mistrz Pieczęci. Strzegę królewskich rozkazów i pamięci tego zamku. Jeśli znajdziesz ślad odwróconej pieczęci, przynieś go do archiwum.';}
 window.CampaignPanel={markup,mount,select:id=>selectActive(id),contact};
})();
