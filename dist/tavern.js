'use strict';
(() => {
  const people = {
    tobiasz:{name:'Tobiasz',role:'Karczmarz',line:'Siadaj. Przy ogniu łatwiej zapomnieć o chłodzie.'},
    brand:{name:'Dowódca Brand',role:'Dowódca',line:'Wybierz zlecenie odpowiednie do swoich sił.'},
    tauriel:{name:'Tauriel',role:'Elfka',line:'Trzej rozbójnicy zajęli górne piętro. Pomożesz mi ich przepędzić?'}
  };
  let resizeObserver = null;
  let beerTimer = null;
  let stopMissions = () => {};
  let stopQuest = () => {};
  let stopUpstairs = () => {};
  let stopLocation = () => {};
  function showReward(completed,currentLevel) {
    const dialog=document.querySelector('.tavern-npc-dialog');
    if(!dialog||!completed?.reward)return;
    dialog.classList.add('is-mission-reward');
    dialog.querySelector('.brand-service').hidden=true;
    dialog.querySelector('.beer-service').hidden=true;
    dialog.querySelector('.tauriel-service').hidden=true;
    dialog.querySelector('#tavern-speaker').textContent='Nagroda za misję';
    dialog.querySelector('.tavern-dialogue-line').hidden=true;
    const reward=dialog.querySelector('.mission-reward');
    reward.hidden=false;
    reward.querySelector('[data-reward-gold]').textContent=completed.reward.gold;
    reward.querySelector('[data-reward-xp]').textContent=completed.reward.xp;
    const advancement=reward.querySelector('.mission-reward-level');
    advancement.hidden=!(completed.levelsGained>0);
    advancement.textContent=completed.levelsGained>0?`Awans! Poziom ${currentLevel}`:'';
    const loot=reward.querySelector('.mission-reward-loot');
    loot.hidden=!completed.loot;
    if(completed.loot){const i=window.HeroSheet.SLOTS.findIndex(([slot])=>slot===completed.loot.slot);loot.querySelector('.gear-art').className=`gear-art gear-${i}`;loot.querySelector('strong').textContent=completed.loot.name;}
    if(!dialog.open)dialog.showModal();
  }
  function stopBeerTimer(){if(beerTimer){clearInterval(beerTimer);beerTimer=null;}}
  function cancel() { stopBeerTimer(); stopMissions(); stopQuest(); stopUpstairs(); stopLocation(); if(resizeObserver){resizeObserver.disconnect();resizeObserver=null;} }
  function markup() {
    return `<section class="tavern-panel" aria-label="Wnętrze karczmy"><div class="tavern-viewport" tabindex="0" role="region" aria-label="Swobodnie przesuwany widok karczmy" aria-describedby="tavern-pan-hint"><div class="tavern-panorama"><img class="tavern-art" src="tavern-panorama.webp" alt="Jedno wnętrze karczmy: Tobiasz za ladą po lewej, Dowódca Brand przy stole, Tauriel pośrodku i schody po prawej." draggable="false"><div class="tavern-vignette" aria-hidden="true"></div>${Object.entries(people).map(([id,p])=>`<button type="button" class="npc-marker npc-${id}" data-npc="${id}" aria-label="Porozmawiaj: ${p.name}" aria-pressed="false"><span>${p.name}</span><small>${p.role}</small></button>`).join('')}<button type="button" class="stairs-hotspot" aria-label="Wejście na piętro"><span>Schody na piętro</span></button></div></div><p class="sr-only" id="tavern-pan-hint">Przesuń widok palcem lub przeciągnij myszą, aby rozejrzeć się po karczmie.</p><dialog class="tavern-npc-dialog" aria-labelledby="tavern-speaker"><h2 class="tavern-dialogue-name" id="tavern-speaker"></h2><p class="tavern-dialogue-line"></p><div class="mission-reward" hidden><span class="reward-ornament" aria-hidden="true">◆</span><dl class="mission-reward-items"><div class="mission-reward-item"><dt><span class="rpg-icon icon-coin" aria-hidden="true"></span><span>Złoto</span></dt><dd data-reward-gold></dd></div><div class="mission-reward-item"><dt><span class="rpg-icon icon-exp" aria-hidden="true"></span><span>EXP</span></dt><dd data-reward-xp></dd></div></dl><div class="mission-reward-loot" hidden><span class="gear-art" aria-hidden="true"></span>Zdobyty przedmiot<br><strong></strong></div><p class="mission-reward-level" role="status" hidden></p></div><div class="beer-service" hidden></div><div class="brand-service" hidden></div><div class="tauriel-service" hidden></div><button type="button" class="secondary" data-close-npc autofocus>Wróć do karczmy</button></dialog><dialog class="tavern-lock-dialog" aria-labelledby="stairs-lock-title"><h2 id="stairs-lock-title">Wejście zablokowane</h2><p>Wejście na piętro odblokujesz po wykonaniu misji od Tauriel.</p><p class="panel-note">Porozmawiaj z Tauriel. Misja „Przepędź nieproszonych gości” jest dostępna od poziomu 5.</p><button type="button" class="secondary" data-close-stairs autofocus>Wróć do karczmy</button></dialog><div class="upstairs-service"></div></section>`;
  }
  function mount(root,state) {
    cancel();
    const panel = root.querySelector('.tavern-panel');
    const upstairs=window.TaurielQuest.mountUpstairs(panel.querySelector('.upstairs-service'),state);
    stopUpstairs=()=>upstairs.dispose();
    const view = panel.querySelector('.tavern-viewport');
    const lock = panel.querySelector('.tavern-lock-dialog');
    const conversation = panel.querySelector('.tavern-npc-dialog');
    const panorama = panel.querySelector('.tavern-panorama');
    const art = panel.querySelector('.tavern-art');
    function fitPanorama() {
      if(!view.isConnected)return;
      const height = Math.max(625,view.clientHeight);
      const ratio = art.naturalWidth && art.naturalHeight ? art.naturalWidth/art.naturalHeight : 1.6;
      panorama.style.height = `${height}px`;
      panorama.style.width = `${height*ratio}px`;
    }
    art.addEventListener('load',fitPanorama);
    resizeObserver = new ResizeObserver(fitPanorama);
    resizeObserver.observe(view);
    function syncLocation(){
      if(!panel.isConnected)return;
      const moved=window.TaurielQuest.canEnter(state.read());
      panel.querySelector('[data-npc=tauriel]').hidden=moved;
      const file=moved?'tavern-after-tauriel.webp':'tavern-panorama.webp';
      if(art.getAttribute('src')!==file)art.src=file;
      art.alt=moved?'Wnętrze karczmy: Tobiasz za ladą, Dowódca Brand przy stole i schody na piętro. Tauriel przebywa w Pokoju z Zieloną Kotarą.':'Wnętrze karczmy: Tobiasz, Dowódca Brand, Tauriel i schody na piętro.';
    }
    function locationStorage(e){if(e.key==='pustkowie.hero.v2'){syncLocation();if(conversation.open&&panel.querySelector('.tavern-dialogue-name').textContent==='Tauriel'&&window.TaurielQuest.canEnter(state.read())){conversation.close();upstairs.openRoom(0);}}}
    window.addEventListener('storage',locationStorage);stopLocation=()=>window.removeEventListener('storage',locationStorage);syncLocation();

    const beerPanel=panel.querySelector('.beer-service');
    let buying=false;
    let beerMessage='';
    function renderBeer() {
      if(beerPanel.hidden)return;
      let s;
      try {s=window.BeerService.status(state.read());}
      catch {beerPanel.innerHTML='<p role="status">Nie można odczytać zapisu postaci. Zakup jest niedostępny.</p>';return;}
      const seconds=s.nextAt?Math.max(0,Math.ceil((s.nextAt-Date.now())/1000)):0;
      const countdown=[Math.floor(seconds/3600),Math.floor(seconds/60)%60,seconds%60].map(n=>String(n).padStart(2,'0')).join(':');
      if(!beerPanel.querySelector('[data-buy-beer]'))beerPanel.innerHTML=`<div class="beer-heading"><span class="rpg-icon icon-tavern" aria-hidden="true"></span><div><h3>Piwo Tobiasza</h3><p>+20 energii · 25 złota</p></div></div><div class="beer-numbers"><span>Złoto <b class="beer-gold"></b></span><span>Energia <b class="beer-energy"></b></span><span>Pozostało piw <b class="beer-left"></b></span></div><p class="beer-limit">Maksymalnie 3 piwa w ciągu ostatnich 8 godzin.<span class="beer-reset"><br>Następne zużycie odnowi się za <span class="beer-timer"></span>.</span></p><button type="button" class="primary" data-buy-beer></button><p class="beer-gain"></p><p class="beer-message" role="status" aria-live="polite"></p>`;
      beerPanel.querySelector('.beer-gold').textContent=s.gold;
      beerPanel.querySelector('.beer-energy').textContent=`${s.energy} / 100`;
      beerPanel.querySelector('.beer-left').textContent=`${s.remaining} / 3`;
      beerPanel.querySelector('.beer-reset').hidden=!s.nextAt;
      beerPanel.querySelector('.beer-timer').textContent=countdown;
      beerPanel.querySelector('[data-buy-beer]').disabled=buying||!!s.reason;
      beerPanel.querySelector('[data-buy-beer]').textContent=buying?'Zapisywanie…':'Wypij piwo · 25 złota';
      beerPanel.querySelector('.beer-gain').textContent=s.gain?`Przywróci ${s.gain} energii. Maksymalna energia: 100.`:'Energia jest pełna.';
      beerPanel.querySelector('.beer-message').textContent=beerMessage||s.reason;
    }
    async function buyBeer() {
      if(buying)return;
      buying=true;beerMessage='';renderBeer();
      try {
        let gain=0;
        const buyer=state.read();
        const buy=()=>state.update(current=>{if(current.name!==buyer.name||current.classId!==buyer.classId||current.gender!==buyer.gender)throw new Error('Postać zmieniła się. Otwórz karczmę ponownie.');const next=window.BeerService.purchase(current);gain=next.energy-window.BeerService.status(current).energy;return next;});
        if(navigator.locks)await navigator.locks.request('pustkowie-hero-v2',buy);else buy();
        beerMessage=`Wypito piwo. Energia +${gain}, złoto −25.`;
      } catch(error) {beerMessage=error.name==='QuotaExceededError'||error.name==='SecurityError'?'Nie udało się zapisać zakupu. Nie pobrano złota.':error.message;}
      finally{buying=false;renderBeer();}
    }
    conversation.addEventListener('close',()=>{stopBeerTimer();stopMissions();stopQuest();});
    panel.addEventListener('click',e=>{
      if(e.target.closest('[data-buy-beer]')){void buyBeer();return;}
      if(e.target.closest('[data-close-npc]')){conversation.close();return;}
      if(e.target.closest('[data-close-stairs]')){lock.close();return;}
      if(e.target.closest('.stairs-hotspot')){if(window.TaurielQuest.canEnter(state.read()))upstairs.open();else if(!lock.open)lock.showModal();return;}
      const button=e.target.closest('[data-npc]');
      if(!button || !people[button.dataset.npc])return;
      if(button.dataset.npc==='tauriel'&&window.TaurielQuest.canEnter(state.read())){upstairs.openRoom(0);return;}
      const person=people[button.dataset.npc];
      conversation.classList.remove('is-mission-reward');
      conversation.querySelector('.mission-reward').hidden=true;
      conversation.querySelector('.tavern-dialogue-line').hidden=false;
      stopMissions();stopQuest();
      const questPanel=panel.querySelector('.tauriel-service');
      questPanel.hidden=button.dataset.npc!=='tauriel';
      if(!questPanel.hidden)stopQuest=window.TaurielQuest.mount(questPanel,{...state,onRelocated:()=>{syncLocation();conversation.close();upstairs.openRoom(0);}});
      const brandPanel=panel.querySelector('.brand-service');
      brandPanel.hidden=button.dataset.npc!=='brand';
      if(!brandPanel.hidden)stopMissions=window.BrandChoices.mount(brandPanel,state);
      stopBeerTimer();beerMessage='';beerPanel.hidden=button.dataset.npc!=='tobiasz';
      if(!beerPanel.hidden){renderBeer();beerTimer=setInterval(renderBeer,1000);}
      panel.querySelectorAll('[data-npc]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));
      panel.querySelector('.tavern-dialogue-name').textContent=person.name;
      panel.querySelector('.tavern-dialogue-line').textContent=button.dataset.npc==='tauriel'&&window.TaurielQuest.canEnter(state.read())?'Dzięki Tobie na piętrze znów jest spokojnie. Dziękuję za pomoc.':person.line;
      if(!conversation.open)conversation.showModal();
    });
  }
  window.TavernPanel={markup,mount,cancel,showReward};
})();
