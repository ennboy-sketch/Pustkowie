'use strict';
(() => {
  const LOCATIONS=Object.freeze([
    {id:'forest',label:'Mroczny Las'},
    {id:'mine',label:'Stara Kopalnia'},
    {id:'undercity',label:'Podziemia Miasta'},
    {id:'graveyard',label:'Cmentarzysko'},
    {id:'training',label:'Koszary Gabriela'},
    {id:'tavern-upstairs',label:'Karczma Tauriel'},
    {id:'other',label:'Inna lokacja'}
  ]);
  const IDS=new Set(LOCATIONS.map(place=>place.id));
  function nonnegative(value){return Number.isSafeInteger(value)&&value>=0;}
  function read(hero){
    const saved=hero?.playerStats;
    if(saved===undefined)return {version:1,battles:{},missions:{}};
    if(!saved||saved.version!==1||!saved.battles||!saved.missions||typeof saved.battles!=='object'||typeof saved.missions!=='object'||Array.isArray(saved.battles)||Array.isArray(saved.missions))throw Error('Nieprawidłowy zapis statystyk gracza.');
    for(const [id,b] of Object.entries(saved.battles)){
      if(!IDS.has(id)||!b||!nonnegative(b.total)||!nonnegative(b.wins)||b.wins>b.total)throw Error('Nieprawidłowe statystyki walk.');
    }
    for(const [id,n] of Object.entries(saved.missions))if(!IDS.has(id)||!nonnegative(n))throw Error('Nieprawidłowe statystyki misji.');
    return saved;
  }
  function add(value){if(!nonnegative(value)||value===Number.MAX_SAFE_INTEGER)throw Error('Przekroczono limit licznika statystyk.');return value+1;}
  function where(fight){
    if(fight.source==='graveyard')return 'graveyard';
    if(fight.source==='tauriel')return 'tavern-upstairs';
    if(fight.source==='gabriel')return fight.stage==='dummies'?'training':'forest';
    return IDS.has(fight.sceneId)?fight.sceneId:'other';
  }
  function recordBattle(hero,fight){
    if(!fight?.battle||!['hero','enemy'].includes(fight.battle.winner))throw Error('Nie można zliczyć niezakończonej walki.');
    // Training dummies are not monsters.
    if(fight.source==='gabriel'&&fight.stage==='dummies')return hero;
    const saved=read(hero),id=where(fight),old=saved.battles[id]||{total:0,wins:0};
    return {...hero,playerStats:{...saved,battles:{...saved.battles,[id]:{total:add(old.total),wins:fight.battle.winner==='hero'?add(old.wins):old.wins}}}};
  }
  function recordMission(hero,sceneId){
    const saved=read(hero),id=IDS.has(sceneId)?sceneId:'other';
    return {...hero,playerStats:{...saved,missions:{...saved.missions,[id]:add(saved.missions[id]||0)}}};
  }
  function totals(hero){
    const s=read(hero),battles=Object.values(s.battles).reduce((n,b)=>n+b.total,0),wins=Object.values(s.battles).reduce((n,b)=>n+b.wins,0),missions=Object.values(s.missions).reduce((n,v)=>n+v,0);
    return {battles,wins,losses:battles-wins,missions};
  }
  function markup(hero){
    const s=read(hero),t=totals(hero);
    const cards=[['Stoczone walki',t.battles],['Zwycięstwa',t.wins],['Porażki',t.losses],['Wykonane misje',t.missions]];
    return '<h3>Statystyki gracza</h3><div class="player-stats-totals">'+cards.map(([label,n])=>'<div><strong>'+n+'</strong><span>'+label+'</span></div>').join('')+'</div>'+
      '<h4>Wyniki według lokacji</h4><div class="player-stats-table-wrap"><table class="player-stats-table"><thead><tr><th scope="col">Lokacja</th><th scope="col">Walki</th><th scope="col">Wygrane</th><th scope="col">Misje</th></tr></thead><tbody>'+
      LOCATIONS.map(({id,label})=>{const b=s.battles[id]||{total:0,wins:0};return '<tr><th scope="row">'+label+'</th><td>'+b.total+'</td><td>'+b.wins+'</td><td>'+(s.missions[id]||0)+'</td></tr>';}).join('')+
      '</tbody></table></div><p class="player-stats-note">Liczniki zapisują zakończone walki i ukończone misje od wprowadzenia statystyk. Wcześniejszych zdarzeń nie da się wiarygodnie odtworzyć. Manekiny treningowe nie są liczone jako potwory.</p>';
  }
  window.PlayerStats={LOCATIONS,read,recordBattle,recordMission,totals,markup};
})();
