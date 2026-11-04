'use strict';
(() => {
  const TITLE='Przepędź nieproszonych gości';
  const NECKLACE={id:'tauriel-emerald-necklace',slot:'necklace',name:'Szmaragdowy naszyjnik Tauriel'};
  const BANDITS=[
    {id:'tauriel-cutthroat',name:'Rozbójnik spod barykady',level:5,maxHp:125,stats:[11,10,3,8],attack:[11,15],tile:0,atlas:'tauriel'},
    {id:'tauriel-bruiser',name:'Rozbójnik Żelazna Pięść',level:5,maxHp:140,stats:[15,5,2,10],attack:[12,17],tile:1,atlas:'tauriel'},
    {id:'tauriel-leader',name:'Przywódca rozbójników',level:5,maxHp:160,stats:[13,12,6,11],attack:[14,19],tile:2,atlas:'tauriel'}
  ];
  function quest(hero){return hero.taurielQuest||null;}
  function count(hero){return quest(hero)?.defeated?.length||0;}
  function canEnter(hero){return count(hero)===3&&['ready','completed'].includes(quest(hero)?.status);}
  function accept(hero){
    if(window.Progression.level(hero)<5)throw new Error('Misja jest dostępna od poziomu 5.');
    if(quest(hero))throw new Error('Ta misja została już przyjęta.');
    if(hero.activeMission||hero.activeCombat)throw new Error('Najpierw zakończ obecną misję.');
    return {...hero,taurielQuest:{status:'active',defeated:[],acceptedAt:Date.now()}};
  }
  function beginFight(hero,index){
    if(window.Progression.level(hero)<5||quest(hero)?.status!=='active')throw new Error('Najpierw przyjmij misję u Tauriel od poziomu 5.');
    if(hero.activeMission||hero.activeCombat)throw new Error('Najpierw zakończ obecną misję.');
    if(index!==count(hero)||!BANDITS[index])throw new Error('Etap misji zmienił się. Otwórz panel ponownie.');
    const player=window.BrandCombat.profile(hero),power=Math.max(...player.stats)+player.level*2+(player.damageBonus||0);
    player.attack=[Math.max(1,power-3),power+3];
    return {...hero,activeCombat:{id:crypto.randomUUID(),source:'tauriel',questIndex:index,cost:0,sceneId:'tavern-upstairs',battle:window.BrandCombat.createBattle(player,BANDITS[index],'hero'),reward:{gold:0,xp:0},loot:null,nextHitAt:Date.now()+1100}};
  }
  function resolve(hero,id){
    const fight=hero.activeCombat,index=count(hero);
    if(!fight||fight.id!==id||fight.source!=='tauriel'||!fight.battle.winner||fight.questIndex!==index||quest(hero)?.status!=='active'||fight.battle.enemy.id!==BANDITS[index]?.id)throw new Error('Ta walka trwa lub została już rozliczona.');
    const won=fight.battle.winner==='hero',defeated=won?[...quest(hero).defeated,BANDITS[index].id]:[...quest(hero).defeated];
    return {...hero,activeCombat:null,taurielQuest:{...quest(hero),defeated,status:defeated.length===3?'ready':'active'},lastTaurielBattle:{id,won,index}};
  }
  function claim(hero){
    if(quest(hero)?.status!=='ready'||!canEnter(hero))throw new Error('Najpierw pokonaj wszystkich trzech rozbójników.');
    if(window.HeroSheet.bagItems(hero).length>=25)throw new Error('Ekwipunek jest pełny. Zwolnij miejsce — Tauriel zachowa Twój naszyjnik.');
    const inventory=window.HeroSheet.inventory(hero);
    return {...hero,lootInventory:inventory.some(i=>i.id===NECKLACE.id)?inventory:[...inventory,{...NECKLACE}],taurielQuest:{...quest(hero),status:'completed',claimedAt:Date.now()}};
  }
  function mount(root,state){
    root.innerHTML='<div class="tauriel-quest-body"></div><p class="tauriel-message" role="status" aria-live="polite"></p><div class="tauriel-combat" hidden></div>';
    const body=root.querySelector('.tauriel-quest-body'),message=root.querySelector('.tauriel-message');
    let disposed=false,busy=false;
    const stopCombat=window.BrandCombat.mount(root.querySelector('.tauriel-combat'),{...state,onQuestResolved:next=>{if(!disposed){message.textContent='';if(canEnter(next)&&state.onRelocated)state.onRelocated();else render();}}});
    const locked=fn=>navigator.locks?navigator.locks.request('pustkowie-hero-v2',fn):fn();
    function render(){
      if(disposed)return;
      const hero=state.read(),q=quest(hero),n=count(hero),eligible=window.Progression.level(hero)>=5,other=!!hero.activeMission||(!!hero.activeCombat&&hero.activeCombat.source!=='tauriel');
      let action='accept',label='Przyjmij misję',disabled=!eligible||other;
      if(q?.status==='completed'){action='';label='Misja ukończona';disabled=true;}
      else if(q?.status==='ready'){action='claim';label='Odbierz szmaragdowy naszyjnik';disabled=false;}
      else if(hero.activeCombat?.source==='tauriel'){action='resume';label='Wróć do walki';disabled=false;}
      else if(q){action='fight';label=`Przepędź rozbójnika ${n+1} / 3`;disabled=other;}
      body.innerHTML=`<h3>${TITLE}</h3><p class="tauriel-story">Trzej rozbójnicy zabarykadowali się na górze. Przepędź ich, aby goście znów mogli bezpiecznie korzystać z pokoi.</p><div class="tauriel-bandits">${BANDITS.map((b,i)=>`<article class="${i<n?'is-defeated':''}"><div class="tauriel-bandit-art" style="background-position:${i*50}% 0"></div><strong>${b.name}</strong><span>${i<n?'Pokonany':`Poziom ${b.level}`}</span></article>`).join('')}</div><p class="tauriel-progress">${eligible?`Pokonani rozbójnicy: ${n} / 3`:'Wymagany poziom postaci: 5'}</p><div class="tauriel-prize"><span class="tauriel-necklace-art" aria-hidden="true"></span><div><strong>Szmaragdowy naszyjnik Tauriel</strong><span>+100 HP po założeniu</span></div></div><p class="tauriel-state">${canEnter(hero)?'Górne piętro odblokowane.':other?'Zakończ obecną misję, aby pomóc Tauriel.':'Nagroda: naszyjnik i dostęp do górnego piętra.'}</p><button type="button" class="primary" data-tauriel-action="${action}" data-quest-index="${n}" ${disabled||busy?'disabled':''}>${label}</button>${q?.status==='completed'?'<p class="tauriel-completed">Tauriel dziękuje Ci za pomoc. Naszyjnik znajdziesz w ekwipunku.</p>':''}`;
    }
    async function click(e){
      const button=e.target.closest('[data-tauriel-action]');if(!button||busy||!button.dataset.taurielAction)return;
      const action=button.dataset.taurielAction,index=Number(button.dataset.questIndex);
      if(action==='resume'){await stopCombat.open();return;}
      busy=true;message.textContent='';render();
      try{
        await locked(()=>state.update(hero=>action==='accept'?accept(hero):action==='claim'?claim(hero):beginFight(hero,index)));
        if(!disposed&&action==='fight')await stopCombat.open();
      }catch(error){if(!disposed)message.textContent=error.name==='QuotaExceededError'||error.name==='SecurityError'?'Nie udało się zapisać misji. Spróbuj ponownie.':error.message;}
      finally{busy=false;render();}
    }
    function storage(e){if(e.key==='pustkowie.hero.v2'&&!busy)render();}
    root.addEventListener('click',click);window.addEventListener('storage',storage);render();
    return ()=>{disposed=true;stopCombat();root.removeEventListener('click',click);window.removeEventListener('storage',storage);};
  }
  function mountUpstairs(root,state){
    root.innerHTML='<dialog class="upstairs-dialog" aria-label="Górne piętro karczmy"><div class="upstairs-top"><h2>Górne piętro</h2><button type="button" data-close-upstairs aria-label="Wróć do sali karczmy">×</button></div><div class="upstairs-viewport" tabindex="0" aria-label="Przesuwany widok górnego piętra"><div class="upstairs-panorama"><img src="tavern-upstairs.webp" alt="Korytarz na piętrze z dwojgiem drzwi do pokoi, drewnianymi belkami i ciepłym światłem latarni" draggable="false"><button class="upstairs-door door-one" type="button" data-upstairs-room="0">Pokój z Zieloną Kotarą</button><button class="upstairs-door door-two" type="button" data-upstairs-room="1">Pokój pod Latarnią</button></div></div><button type="button" class="secondary" data-close-upstairs>Zejdź do karczmy</button></dialog><dialog class="upstairs-room-dialog" aria-labelledby="upstairs-room-title"><h2 id="upstairs-room-title"></h2><div class="upstairs-room-art"><button type="button" class="upstairs-tauriel-marker" data-room-tauriel hidden>Tauriel<small>Elfka</small></button></div><p></p><button type="button" class="secondary" data-close-room>Wróć na korytarz</button></dialog><dialog class="tavern-npc-dialog upstairs-tauriel-dialog" aria-labelledby="upstairs-tauriel-title"><h2 id="upstairs-tauriel-title">Tauriel</h2><p>Dzięki Tobie odzyskałam spokój i mogę wrócić do swojego pokoju.</p><div class="tauriel-service"></div><button type="button" class="secondary" data-close-room-tauriel>Wróć do pokoju</button></dialog>';
    const dialog=root.querySelector('.upstairs-dialog'),room=root.querySelector('.upstairs-room-dialog');
    const tauriel=root.querySelector('.upstairs-tauriel-dialog');
    let stopRoomQuest=()=>{};
    tauriel.addEventListener('close',()=>stopRoomQuest());
    const names=['Pokój z Zieloną Kotarą','Pokój pod Latarnią'],descriptions=['Zielone zasłony tłumią chłód nocy. Przy drewnianym łóżku czeka biurko i cicha latarnia.','W kominku tli się żar. Wełniane koce, podróżny kufer i ciepłe światło dają wytchnienie po trudach drogi.'];
    function openRoom(i){
      if(!canEnter(state.read()))throw new Error('Najpierw przepędź rozbójników.');
      room.querySelector('h2').textContent=names[i];room.querySelector('p').textContent=descriptions[i];
      const scene=room.querySelector('.upstairs-room-art');scene.style.backgroundPosition=`${i*100}% 0`;scene.classList.toggle('has-tauriel',i===0);
      room.querySelector('[data-room-tauriel]').hidden=i!==0;
      if(!dialog.open)dialog.showModal();if(!room.open)room.showModal();
    }
    function click(e){
      if(e.target.closest('[data-close-upstairs]'))dialog.close();
      else if(e.target.closest('[data-close-room]'))room.close();
      else if(e.target.closest('[data-close-room-tauriel]'))tauriel.close();
      else if(e.target.closest('[data-room-tauriel]')){
        if(!canEnter(state.read())||room.querySelector('[data-room-tauriel]').hidden)return;
        stopRoomQuest();stopRoomQuest=mount(tauriel.querySelector('.tauriel-service'),state);if(!tauriel.open)tauriel.showModal();
      }else{const button=e.target.closest('[data-upstairs-room]');if(button)openRoom(Number(button.dataset.upstairsRoom));}
    }
    const view=root.querySelector('.upstairs-viewport'),panorama=root.querySelector('.upstairs-panorama'),art=panorama.querySelector('img');
    function fit(){const height=Math.max(480,view.clientHeight);const ratio=art.naturalWidth&&art.naturalHeight?art.naturalWidth/art.naturalHeight:2.4;panorama.style.height=`${height}px`;panorama.style.width=`${height*ratio}px`;}
    art.addEventListener('load',fit);const observer=new ResizeObserver(fit);observer.observe(view);

    root.addEventListener('click',click);
    return {openRoom,open(){if(!canEnter(state.read()))throw new Error('Najpierw przepędź rozbójników.');if(!dialog.open)dialog.showModal();},dispose(){stopRoomQuest();if(tauriel.open)tauriel.close();observer.disconnect();art.removeEventListener('load',fit);root.removeEventListener('click',click);if(room.open)room.close();if(dialog.open)dialog.close();root.replaceChildren();}};
  }
  window.TaurielQuest={TITLE,NECKLACE,BANDITS,quest,count,canEnter,accept,beginFight,resolve,claim,mount,mountUpstairs};
})();
