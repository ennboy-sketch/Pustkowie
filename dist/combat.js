'use strict';
(() => {
  const BASE_STATS={warrior:[12,5,3,10],mage:[3,5,12,6],elf:[5,12,4,7],dwarf:[10,3,4,12]};
  const FIREBALL=Object.freeze({id:'fireball',name:'Kula ognia',manaCost:10});
  function manaInfo(fighter){const max=fighter.maxMana??window.HeroSheet.manaCapacity(fighter.classId,fighter.stats?.[2]??0);return {max,current:Number.isSafeInteger(fighter.mana)?Math.max(0,Math.min(max,fighter.mana)):max};}
  const LABELS=['Siła','Zręczność','Inteligencja','Wytrzymałość'];
  const ROSTERS={forest:[
    {id:'boar',name:'Dzik',level:1,maxHp:77,stats:[7,4,1,5],attack:[8,11],reward:{gold:18,xp:100},tile:0},
    {id:'wolf',name:'Wilk',level:2,maxHp:99,stats:[8,10,2,6],attack:[10,15],reward:{gold:34,xp:233},tile:1},
    {id:'dryad',name:'Driada',level:3,maxHp:121,stats:[5,8,13,7],attack:[13,18],reward:{gold:36,xp:500},tile:2},
    {id:'goblin',name:'Goblin',level:5,maxHp:149,stats:[11,12,5,9],attack:[15,21],reward:{gold:40,xp:820},tile:3},
    {id:'tree-whisperer',name:'Szeptun drzewny',level:8,maxHp:231,stats:[18,8,16,14],attack:[20,28],tile:0,atlas:'whisperer',reward:{gold:25,xp:2500}},
    {id:'forest-demoness',name:'Demonica Puszczy',level:9,maxHp:259,stats:[15,22,20,16],attack:[22,30],tile:0,atlas:'demoness',reward:{gold:35,xp:3300}},
    {id:'spectral-knight',name:'Widmowy Rycerz',level:10,maxHp:286,stats:[24,20,12,18],attack:[26,33],tile:0,atlas:'spectral-knight',reward:{gold:55,xp:5100}},
    {id:'aelira',name:'Aelira',level:14,maxHp:396,stats:[16,26,34,24],attack:[31,42],tile:0,atlas:'aelira',reward:{gold:75,xp:15300}},
    {id:'forest-devourer',name:'Leśny Pożeracz',level:15,maxHp:440,stats:[32,12,25,30],attack:[33,44],tile:0,atlas:'devourer',reward:{gold:99,xp:25000}},
    {id:'bloodthirsty-flower',name:'Krwiożerczy Kwiat',level:6,maxHp:182,stats:[17,8,4,15],attack:[17,25],tile:0,atlas:'bloodthirsty-flower',special:{type:'flat',every:4,bonus:10,ability:'thorn-grab'},traits:'Ciernisty Chwyt: co czwarty atak zadaje dodatkowe 10 bazowych obrażeń.',reward:{gold:52,xp:1350}},
    {id:'cursed-stag',name:'Przeklęty Jeleń',level:7,maxHp:209,stats:[18,20,6,16],attack:[19,27],tile:0,atlas:'cursed-stag',special:{type:'power',every:4,multiplier:150,ability:'cursed-charge'},traits:'Co czwarty atak: szarża zadaje 150% bazowych obrażeń (zaokrąglenie w dół).',reward:{gold:61,xp:1900}},
    {id:'ancient-forest-spirit',name:'Duch Starego Boru',level:14,maxHp:391,stats:[15,18,32,26],attack:[32,42],tile:0,atlas:'ancient-forest-spirit',physicalResistance:15,magicVulnerability:20,traits:'Odporność: otrzymuje 15% mniej obrażeń fizycznych. Podatność: otrzymuje 20% więcej obrażeń magicznych (ogień i woda).',reward:{gold:85,xp:16400}},
    {id:'birch-werewolf',name:'Wilkołak Brzeziny',level:6,maxHp:193,stats:[22,25,4,16],attack:[22,25],tile:0,atlas:'birch-werewolf',enrage:{threshold:30,bonus:20},traits:'Furia: poniżej 30% HP zadaje o 20% więcej bazowych obrażeń (zaokrąglenie w dół).',reward:{gold:53,xp:1388}},
    {id:'wraith-archer',name:'Upiorny Łucznik',level:13,maxHp:363,stats:[14,32,15,24],attack:[33,46],tile:0,atlas:'wraith-archer',special:{type:'piercing',every:3,piercing:30,ability:'piercing-arrow'},traits:'Przeszywająca Strzała: co trzeci atak ignoruje 30% redukcji pancerza i odporności fizycznej celu.',reward:{gold:75,xp:10333}},
    {"id":"dark-ripper","name":"Mroczny Rozpruwacz","level":16,"maxHp":550,"attack":[88,88],"reward":{"gold":150,"xp":48000},"atlas":"level-16","tile":0,"stats":[32,16,16,55]},
    {"id":"ancient-ent","name":"Ent","level":19,"maxHp":660,"attack":[90,90],"reward":{"gold":179,"xp":75000},"atlas":"level-16","tile":3,"stats":[38,19,19,66]},
    {"id":"oak-treant","name":"Drzewiec","level":20,"maxHp":750,"attack":[100,100],"reward":{"gold":188,"xp":99000},"atlas":"level-16","tile":4,"stats":[40,20,20,75]},
    {"id":"lost-elf","name":"Zabłąkany Elf","level":21,"maxHp":750,"attack":[100,100],"reward":{"gold":200,"xp":101000},"atlas":"level-21","tile":0,"stats":[42,21,21,75]},
    {"id":"forest-elf","name":"Leśny Elf","level":22,"maxHp":760,"attack":[105,105],"reward":{"gold":200,"xp":105000},"atlas":"level-21","tile":1,"stats":[44,22,22,76]},
    {"id":"dark-elf","name":"Mroczny Elf","level":23,"maxHp":770,"attack":[110,110],"reward":{"gold":200,"xp":130000},"atlas":"level-21","tile":2,"stats":[46,23,23,77]},
    {"id":"swamp-wraith","name":"Upiór z Bagien","level":28,"maxHp":700,"attack":[130,130],"reward":{"gold":100,"xp":310000},"atlas":"level-26","tile":2,"stats":[56,28,28,70]}
  ],mine:[
    {id:'ghost',name:'Duch',level:1,maxHp:77,stats:[2,6,9,5],attack:[8,11],reward:{gold:18,xp:100},tile:0,atlas:'mine'},
    {id:'bandit',name:'Rozbójnik',level:2,maxHp:99,stats:[9,8,3,6],attack:[10,15],reward:{gold:35,xp:250},tile:1,atlas:'mine'},
    {id:'giant-rat',name:'Ogromny szczur',level:3,maxHp:121,stats:[10,12,1,7],attack:[13,18],reward:{gold:33,xp:550},tile:2,atlas:'mine'},
    {id:'crystal-ogre',name:'Kryształowy ogr',level:5,maxHp:149,stats:[16,4,5,9],attack:[15,21],reward:{gold:40,xp:900},tile:3,atlas:'mine'},
    {id:'crystal-scorpion',name:'Kryształowy Skorpion',level:7,maxHp:215,stats:[16,12,4,22],attack:[28,33],tile:0,atlas:'scorpion',armor:2,attackType:'poison',traits:'Kryształowy pancerz: pochłania 2 obrażenia z trafienia (minimum 1 obrażenie). Zatrute żądło: 28–33 obrażeń od trucizny.',reward:{gold:60,xp:1700}},
    {id:'undead-miner',name:'Nieumarły Górnik',level:9,maxHp:253,stats:[24,10,5,20],attack:[29,39],tile:0,atlas:'undead-miner',armorPiercing:50,traits:'Potężny cios kilofem: 29–39 obrażeń. Ignoruje 50% redukcji obrażeń z pancerza.',reward:{gold:25,xp:3500}},
    {id:'venom-centipede',name:'Jadowity Stonóg',level:8,maxHp:231,stats:[18,20,3,20],attack:[20,28],tile:0,atlas:'centipede',armor:2,special:{type:'dot',every:3,damage:8,turns:3,label:'Trucizna',ability:'venom-bite'},traits:'Twardy pancerz: pochłania 2 obrażenia z trafienia. Co trzeci atak zatruwa: 8 obrażeń na początku 3 kolejnych tur celu.',reward:{gold:65,xp:2777}},
    {id:'chain-troll',name:'Łańcuchowy Troll',level:13,maxHp:462,stats:[36,10,4,32],attack:[33,47],tile:0,atlas:'chain-troll',special:{type:'power',every:5,multiplier:150,ability:'chain-slam'},traits:'Co piąty atak: potężne uderzenie łańcuchami zadaje 150% bazowych obrażeń (zaokrąglenie w dół).',reward:{gold:155,xp:9200}},
    {id:'spore-crawler',name:'Zarodnikowy Pełzacz',level:14,maxHp:352,stats:[20,12,28,24],attack:[31,40],tile:0,atlas:'spore-crawler',special:{type:'dot',every:4,damage:12,turns:2,label:'Trujące zarodniki',ability:'spores'},traits:'Co czwarty atak: trujące zarodniki zadają 12 obrażeń na początku 2 kolejnych tur celu.',reward:{gold:165,xp:17000}},
    {id:'abyss-bellringer',name:'Dzwonnik Otchłani',level:14,maxHp:429,stats:[34,10,24,30],attack:[36,48],tile:0,atlas:'abyss-bellringer',special:{type:'magic-wave',every:4,damage:12,ability:'abyss-echo'},traits:'Echo Zagłady: co czwarty atak dodaje falę zadającą 12 bazowych obrażeń magicznych. Fala omija obronę fizyczną.',reward:{gold:90,xp:17555}},
    {id:'magma-golem',name:'Golem Magmowy',level:15,maxHp:528,stats:[38,8,20,36],attack:[43,61],tile:0,atlas:'magma-golem',physicalArmor:8,waterWeakness:50,traits:'Skalna obrona: pochłania 8 obrażeń fizycznych (minimum 1 obrażenie). Podatność na magię wody: +50% obrażeń.',reward:{gold:100,xp:25000}},
    {"id":"jade-lizard","name":"Nefrytowa Jaszczurka","level":17,"maxHp":589,"attack":[88,88],"reward":{"gold":130,"xp":55000},"atlas":"level-16","tile":1,"stats":[34,17,17,59]},
    {"id":"mine-orc","name":"Ork","level":24,"maxHp":800,"attack":[115,115],"reward":{"gold":200,"xp":170000},"atlas":"level-21","tile":3,"stats":[48,24,24,80]},
    {"id":"orc-tracker","name":"Ork Tropiciel","level":25,"maxHp":830,"attack":[120,120],"reward":{"gold":210,"xp":200000},"atlas":"level-21","tile":4,"stats":[50,25,25,83]},
    {"id":"orc-shaman","name":"Ork Szaman","level":26,"maxHp":845,"attack":[125,125],"reward":{"gold":250,"xp":230000},"atlas":"level-26","tile":0,"stats":[52,26,52,85],"attackElement":"magic","traits":"Atakuje magicznym pociskiem. Obrażenia magiczne omijają obronę fizyczną."}
  ],undercity:[
    {id:'mud-snake',name:'Wąż błotny',level:1,maxHp:77,stats:[6,8,1,5],attack:[8,11],reward:{gold:18,xp:100},tile:0,atlas:'undercity'},
    {id:'wild-dog',name:'Dziki Pies',level:2,maxHp:99,stats:[8,10,2,6],attack:[10,15],reward:{gold:30,xp:200},tile:1,atlas:'undercity'},
    {id:'lost-human',name:'Zbłąkany człowiek',level:3,maxHp:121,stats:[11,8,4,7],attack:[13,18],reward:{gold:40,xp:489},tile:2,atlas:'undercity'},
    {id:'trolgotyta',name:'Trolgotyta',level:5,maxHp:149,stats:[15,6,3,9],attack:[15,21],reward:{gold:50,xp:920},tile:3,atlas:'undercity'},
    {"id":"sewer-golem","name":"Golem","level":18,"maxHp":599,"attack":[90,90],"reward":{"gold":166,"xp":52999},"atlas":"level-16","tile":2,"stats":[36,18,18,60]},
    {"id":"sewer-zombie","name":"Zombie","level":27,"maxHp":750,"attack":[100,100],"reward":{"gold":150,"xp":270000},"atlas":"level-26","tile":1,"stats":[54,27,27,75]},
    {"id":"gorgon","name":"Gorgon","level":29,"maxHp":800,"attack":[150,150],"reward":{"gold":250,"xp":350000},"atlas":"level-26","tile":3,"stats":[58,29,29,80]},
    {"id":"basilisk","name":"Bazyliszek","level":30,"maxHp":900,"attack":[150,150],"reward":{"gold":250,"xp":400000},"atlas":"level-26","tile":4,"stats":[60,30,30,90]}
  ]};
  function random(min,max){const a=new Uint32Array(1),range=max-min+1,limit=4294967296-4294967296%range;do{crypto.getRandomValues(a);}while(a[0]>=limit);return min+a[0]%range;}
  function availableOpponents(hero,sceneId,tier){
    const level=window.Progression.level(hero);
    const pool=opponents(sceneId).filter(enemy=>Math.abs(enemy.level-level)<=3);
    if(!tier||!pool.length)return pool;
    if(!['easy','hard'].includes(tier))return [];
    const preferred=pool.filter(enemy=>tier==='easy'?enemy.level<=level:enemy.level>level);
    if(preferred.length)return preferred;
    // A sparse roster must not remove all combat offers for one difficulty.
    const edge=tier==='easy'?Math.min(...pool.map(enemy=>enemy.level)):Math.max(...pool.map(enemy=>enemy.level));
    return pool.filter(enemy=>enemy.level===edge);
  }
  function eligible(hero){return Object.keys(ROSTERS).some(id=>availableOpponents(hero,id).length>0);}
  function prepare(hero){
    if(hero.activeMission)throw new Error('Najpierw zakończ aktywny zwiad.');
    if(hero.activeCombat)return hero;
    const old=hero.combatOffer;
    if(!eligible(hero))return hero;
    if(old&&Object.hasOwn(ROSTERS,old.sceneId)&&availableOpponents(hero,old.sceneId).some(m=>m.id===old.enemyId))return hero;
    // Preserve a previously assigned playable terrain; new offers draw from populated locations.
    const sceneId=old&&Object.hasOwn(ROSTERS,old.sceneId)&&availableOpponents(hero,old.sceneId).length?old.sceneId:drawLocation(hero);
    const pool=availableOpponents(hero,sceneId);
    return {...hero,combatOffer:{sceneId,enemyId:pool[random(0,pool.length-1)].id}};
  }
  function start(hero,now=Date.now(),options={}){
    const cost=options.cost??5;if(![3,5].includes(cost))throw new Error('Nieprawidłowy koszt misji.');
    hero=window.EnergyCycle.apply(hero,now);
    if(hero.activeMission||hero.activeCombat)throw new Error('Najpierw zakończ obecną misję.');
    if(!eligible(hero))throw new Error('Brak potworów dostępnych na Twoim poziomie.');
    const sceneId=hero.combatOffer?.sceneId;
    const enemy=sceneId&&Object.hasOwn(ROSTERS,sceneId)?availableOpponents(hero,sceneId).find(m=>m.id===hero.combatOffer.enemyId):null;
    if(!enemy)throw new Error('Brak przydzielonego przeciwnika.');
    if(hero.energy<cost)throw new Error(`Potrzebujesz ${cost} energii.`);
    const player=profile(hero),power=Math.max(...player.stats)+player.level*2+(player.damageBonus||0);
    player.attack=[Math.max(1,power-3),power+3];
    return {...hero,energy:hero.energy-cost,brandOffers:null,activeCombat:{cost,difficulty:options.difficulty||null,id:crypto.randomUUID(),sceneId,battle:createBattle(player,enemy,'hero'),loot:null,reward:enemy.reward?{...enemy.reward}:{gold:random(10,30),xp:random(33,55)},nextHitAt:now+1100}};
  }
  function tick(hero,now=Date.now()){
    const fight=hero.activeCombat;
    if(!fight||fight.battle.winner||now<fight.nextHitAt)return hero;
    return {...hero,activeCombat:{...fight,battle:advance(fight.battle,actor=>random(...actor.attack)),nextHitAt:now+1100}};
  }
  function skip(hero,id){
    const fight=hero.activeCombat;
    if(!fight||fight.id!==id)throw new Error('Walka została już rozliczona lub zmieniła się.');
    let battle=fight.battle;
    while(!battle.winner)battle=advance(battle,actor=>random(...actor.attack));
    return finish({...hero,activeCombat:{...fight,battle}},id);
  }
  function finish(hero,id){
    const fight=hero.activeCombat;
    if(!fight||fight.id!==id||!fight.battle.winner)throw new Error('Walka trwa lub została już rozliczona.');
    if(fight.source==='graveyard')return window.Graveyard.resolve(hero,id);
    if(fight.source==='tauriel')return window.TaurielQuest.resolve(hero,id);
    const won=fight.battle.winner==='hero',reward=won?fight.reward:{gold:0,xp:0};
    const next=window.Progression.award(hero,reward.xp),gold=(hero.gold??25)+reward.gold;
    if(!Number.isSafeInteger(gold))throw new Error('Nieprawidłowa ilość złota.');
    // Brand grants only gold and EXP, including fights saved with pending loot.
    return {...next,gold,activeCombat:null,combatOffer:null,lastCombat:{id,sceneId:fight.sceneId,enemyId:fight.battle.enemy.id,won,reward,loot:null,levelsGained:next.level-window.Progression.level(hero)}};
  }
  function profile(hero){
    const base=BASE_STATS[hero.classId];
    if(!base)throw new Error('Nieznana klasa postaci.');
    const added=window.HeroSheet.bonuses(hero),stats=base.map((n,i)=>n+added[i]);
    const bonuses=window.FateWheel?.bonuses(hero)||{damage:0,armor:0};
    return {damageBonus:bonuses.damage,armor:bonuses.armor,name:hero.name,level:window.Progression.level(hero),maxHp:50+stats[3]*10+window.HeroSheet.hpBonus(hero),maxMana:window.HeroSheet.manaCapacity(hero.classId,stats[2]),stats:[...stats],classId:hero.classId,gender:hero.gender};
  }
  function drawLocation(hero){
    const ids=Object.keys(ROSTERS).filter(id=>hero?availableOpponents(hero,id).length:ROSTERS[id].length),value=new Uint32Array(1),limit=4294967296-(4294967296%ids.length);
    do{crypto.getRandomValues(value);}while(value[0]>=limit);
    return ids[value[0]%ids.length];
  }
  function opponents(sceneId){if(!Object.hasOwn(ROSTERS,sceneId))throw new Error('Nieznany teren walki.');return ROSTERS[sceneId];}
  function createBattle(hero,enemy,first){
    if(!['hero','enemy'].includes(first))throw new Error('Ustal kolejność ataków.');
    for(const fighter of [hero,enemy])if(!fighter||typeof fighter.name!=='string'||!Number.isSafeInteger(fighter.maxHp)||fighter.maxHp<1)throw new Error('Brak statystyk do rozpoczęcia walki.');
    const snapshot=f=>{
      const mana=f.classId==='mage'?{maxMana:f.maxMana??window.HeroSheet.manaCapacity(f.classId,f.stats?.[2]??0),mana:f.maxMana??window.HeroSheet.manaCapacity(f.classId,f.stats?.[2]??0)}:{};
      return {...f,...mana,attackCount:0,poisonEffect:null,stats:f.stats?[...f.stats]:undefined,hp:f.maxHp};
    };
    return {hero:snapshot(hero),enemy:snapshot(enemy),next:first,hits:0,winner:null,lastHit:null};
  }
  function ragePercent(fighter){
    const rule=fighter?.enrage;
    return rule&&fighter.hp>0&&fighter.hp*100<fighter.maxHp*rule.threshold?rule.bonus:0;
  }
  // Status damage resolves at the start of the affected fighter's turn.
  function advance(battle,resolveHit){
    if(battle.winner)return battle;
    if(typeof resolveHit!=='function')throw new Error('Zasady obrażeń nie zostały ustalone.');
    const actor=battle.next,target=actor==='hero'?'enemy':'hero';
    let current=battle,poisonTick=null;
    const effect=battle[actor].poisonEffect;
    if(effect){
      if(!Number.isSafeInteger(effect.damage)||effect.damage<1||!Number.isSafeInteger(effect.turns)||effect.turns<1)throw new Error('Nieprawidłowy zapis zatrucia.');
      const hp=Math.max(0,battle[actor].hp-effect.damage),turns=effect.turns-1;
      poisonTick={target:actor,damage:Math.min(effect.damage,battle[actor].hp),label:effect.label||'Trucizna'};
      current={...battle,[actor]:{...battle[actor],hp,poisonEffect:hp>0&&turns>0?{...effect,turns}:null}};
      if(hp===0)return {...current,next:target,hits:battle.hits+1,winner:target,lastHit:{actor:target,target:actor,damage:poisonTick.damage,ability:'poison-tick',element:'poison',poisonName:poisonTick.label,manaCost:0}};
    }
    const copy=f=>({...f,stats:f.stats?[...f.stats]:undefined,poisonEffect:f.poisonEffect?{...f.poisonEffect}:null});
    const rawDamage=resolveHit(copy(current[actor]),copy(current[target]),battle.hits+1);
    if(!Number.isSafeInteger(rawDamage)||rawDamage<1)throw new Error('Nieprawidłowe obrażenia.');
    const previousCount=Number.isSafeInteger(current[actor].attackCount)&&current[actor].attackCount>=0?current[actor].attackCount:Math.floor(battle.hits/2);
    const attackCount=previousCount+1;
    if(!Number.isSafeInteger(attackCount))throw new Error('Nieprawidłowy licznik ataków.');
    const special=current[actor].special;
    const triggered=!!special&&Number.isSafeInteger(special.every)&&special.every>0&&attackCount%special.every===0;
    const powerBonus=triggered?(special.type==='power'?Math.floor(rawDamage*(special.multiplier-100)/100):special.type==='flat'?special.bonus:0):0;
    const rage=ragePercent(current[actor]),rageBonus=Math.floor((rawDamage+powerBonus)*rage/100);
    const poweredDamage=rawDamage+powerBonus+rageBonus;
    if(!Number.isSafeInteger(poweredDamage)||poweredDamage<1)throw new Error('Nieprawidłowe obrażenia specjalne.');
    const poison=current[actor].attackType==='poison';
    const mage=actor==='hero'&&current[actor].classId==='mage',mana=mage?manaInfo(current[actor]):null;
    const selectedElement=['physical','fire','water','poison','magic'].includes(current[actor].attackElement)?current[actor].attackElement:null;
    const fireball=!!mana&&mana.current>=FIREBALL.manaCost&&!selectedElement;
    const element=selectedElement??(fireball?'fire':poison?'poison':'physical');
    const weakness=element==='water'&&Number.isSafeInteger(current[target].waterWeakness)?Math.max(0,current[target].waterWeakness):0;
    const magicVulnerability=['fire','water','magic'].includes(element)&&Number.isSafeInteger(current[target].magicVulnerability)?Math.max(0,current[target].magicVulnerability):0;
    const magicBonus=Math.floor(poweredDamage*magicVulnerability/100);
    const weaknessBonus=Math.floor(poweredDamage*weakness/100),elementalDamage=poweredDamage+weaknessBonus+magicBonus;
    if(!Number.isSafeInteger(elementalDamage))throw new Error('Nieprawidłowe obrażenia żywiołu.');
    const generalArmor=Number.isSafeInteger(current[target].armor)?Math.max(0,current[target].armor):0;
    const physicalArmor=element==='physical'&&Number.isSafeInteger(current[target].physicalArmor)?Math.max(0,current[target].physicalArmor):0;
    const armor=generalArmor+physicalArmor;
    const specialPiercing=triggered&&special.type==='piercing'&&element==='physical'?special.piercing:0;
    const piercing=Math.min(100,Math.max(0,Number.isSafeInteger(current[actor].armorPiercing)?current[actor].armorPiercing:0,specialPiercing));
    const ignoredArmor=Math.floor(armor*piercing/100);
    const absorbed=Math.min(elementalDamage-1,armor-ignoredArmor),afterArmor=elementalDamage-absorbed;
    const resistance=element==='physical'&&Number.isSafeInteger(current[target].physicalResistance)?Math.min(100,Math.max(0,current[target].physicalResistance)):0;
    const resistanceIgnored=Math.floor(resistance*piercing/100);
    const damage=Math.max(1,Math.floor(afterArmor*(100-resistance+resistanceIgnored)/100)),resisted=afterArmor-damage;
    let magicWave=null;
    if(triggered&&special.type==='magic-wave'){
      if(!Number.isSafeInteger(special.damage)||special.damage<1)throw new Error('Nieprawidłowe obrażenia fali magicznej.');
      const vulnerability=Number.isSafeInteger(current[target].magicVulnerability)?Math.max(0,current[target].magicVulnerability):0;
      const bonus=Math.floor(special.damage*vulnerability/100),waveRaw=special.damage+bonus;
      if(!Number.isSafeInteger(waveRaw))throw new Error('Nieprawidłowe obrażenia fali magicznej.');
      const waveAbsorbed=Math.min(waveRaw-1,generalArmor),remainingHp=Math.max(0,current[target].hp-damage);
      magicWave={damage:Math.min(waveRaw-waveAbsorbed,remainingHp),absorbed:remainingHp>0?waveAbsorbed:0,bonus:remainingHp>0?bonus:0};
    }
    const totalDamage=Math.min(damage,current[target].hp)+(magicWave?.damage||0);
    const attacker={...current[actor],attackCount,...(mana?{maxMana:mana.max,mana:mana.current-(fireball?FIREBALL.manaCost:0)}:{})};
    const hp=Math.max(0,current[target].hp-totalDamage);
    const poisonApplied=triggered&&special.type==='dot'&&hp>0?{damage:special.damage,turns:special.turns,label:special.label}:null;
    const defender={...current[target],hp,poisonEffect:hp===0?null:poisonApplied||current[target].poisonEffect||null};
    const ability=triggered?special.ability:fireball?'fireball':element==='magic'?'magic-missile':element==='water'?'water':mage?'wand':poison?'poison':piercing?'piercing':'attack';
    return {...current,[actor]:attacker,[target]:defender,next:target,hits:battle.hits+1,winner:hp===0?actor:null,lastHit:{actor,target,damage:totalDamage,magicWave,ability,absorbed,ignoredArmor,element,weaknessBonus,magicBonus,resisted,resistanceIgnored,powerBonus,rageBonus,ragePercent:rage,poisonTick,poisonApplied,manaCost:fireball?FIREBALL.manaCost:0}};
  }
  function fighterMarkup(side){return `<article class="combat-fighter" data-fighter="${side}"><div class="combat-portrait"><div class="combat-figure"></div><span class="combat-empty-icon rpg-icon icon-arena" aria-hidden="true"></span><span class="combat-damage" aria-hidden="true"></span><div class="combat-identity"><h3></h3><span class="combat-level"></span></div></div><div class="combat-health"><progress max="1" value="0" aria-label="Punkty życia"></progress><strong></strong></div><div class="combat-mana" hidden><progress max="1" value="0" aria-label="Punkty many"></progress><strong></strong></div><dl class="combat-stats">${LABELS.map(label=>`<div><dt>${label}</dt><dd>—</dd></div>`).join('')}</dl><p class="combat-traits" hidden></p><p class="combat-effects" hidden role="status"></p></article>`;}
  function renderFighter(root,fighter){
    root.querySelector('h3').textContent=fighter?.name||'Przeciwnik';
    root.querySelector('.combat-level').textContent=fighter?`Poziom ${fighter.level||1}`:'Oczekuje na odkrycie';
    const figure=root.querySelector('.combat-figure');
    figure.className='combat-figure';
    figure.style.cssText='';
    if(Number.isInteger(fighter?.tile)){figure.classList.add('monster-avatar');if(fighter.atlas==='abyss-bellringer')figure.classList.add('monster-abyss-bellringer');if(fighter.atlas==='bloodthirsty-flower')figure.classList.add('monster-bloodthirsty-flower');if(fighter.atlas==='cursed-stag')figure.classList.add('monster-cursed-stag');if(fighter.atlas==='ancient-forest-spirit')figure.classList.add('monster-ancient-forest-spirit');if(fighter.atlas==='birch-werewolf')figure.classList.add('monster-birch-werewolf');if(fighter.atlas==='wraith-archer')figure.classList.add('monster-wraith-archer');if(fighter.atlas==='centipede')figure.classList.add('monster-centipede');if(fighter.atlas==='chain-troll')figure.classList.add('monster-chain-troll');if(fighter.atlas==='spore-crawler')figure.classList.add('monster-spore-crawler');if(fighter.atlas==='magma-golem')figure.classList.add('monster-magma-golem');if(fighter.atlas==='undead-miner')figure.classList.add('monster-undead-miner');if(fighter.atlas==='scorpion')figure.classList.add('monster-scorpion');if(fighter.atlas==='aelira')figure.classList.add('monster-aelira');if(fighter.atlas==='devourer')figure.classList.add('monster-devourer');if(fighter.atlas==='spectral-knight')figure.classList.add('monster-spectral-knight');if(fighter.atlas==='demoness')figure.classList.add('monster-demoness');if(fighter.atlas==='whisperer')figure.classList.add('monster-whisperer');if(fighter.atlas==='mine')figure.classList.add('monster-mine');if(fighter.atlas==='undercity')figure.classList.add('monster-undercity');if(/^level-(16|21|26)$/.test(fighter.atlas))figure.classList.add('monster-'+fighter.atlas);if(fighter.atlas==='graveyard')figure.classList.add('monster-graveyard');if(fighter.atlas==='tauriel')figure.classList.add('monster-tauriel');figure.style.setProperty('--monster-position',(fighter.atlas==='graveyard'||/^level-(16|21|26)$/.test(fighter.atlas))?`${fighter.tile%3*50}% ${Math.floor(fighter.tile/3)*100}%`:fighter.atlas==='tauriel'?`${fighter.tile*50}% 0%`:`${fighter.tile%2*100}% ${Math.floor(fighter.tile/2)*100}%`);}
    if(fighter&&Object.hasOwn(BASE_STATS,fighter.classId)&&['male','female'].includes(fighter.gender))figure.className+=` character ${fighter.gender} ${fighter.classId}`;
    root.classList.toggle('combat-empty',!fighter);
    const hp=fighter?(fighter.hp??fighter.maxHp):0,bar=root.querySelector('progress');
    bar.max=fighter?.maxHp||1;bar.value=hp;bar.setAttribute('aria-label',fighter?`Życie: ${fighter.name}`:'Życie przeciwnika — brak danych');
    root.querySelector('.combat-health strong').textContent=fighter?`${hp} / ${fighter.maxHp}`:'— / —';
    const mana=root.querySelector('.combat-mana');mana.hidden=fighter?.classId!=='mage';
    if(!mana.hidden){
      const resource=manaInfo(fighter),bar=mana.querySelector('progress');bar.max=resource.max||1;bar.value=resource.current;bar.setAttribute('aria-label',`Mana: ${fighter.name}`);mana.querySelector('strong').textContent=`${resource.current} / ${resource.max}`;
    }
    root.querySelectorAll('dd').forEach((el,i)=>{el.textContent=fighter?.stats?.[i]??'—';});
    const traits=root.querySelector('.combat-traits');traits.hidden=!fighter?.traits;traits.textContent=fighter?.traits||'';
    const effects=root.querySelector('.combat-effects'),messages=[];
    if(fighter?.poisonEffect)messages.push(`${fighter.poisonEffect.label}: ${fighter.poisonEffect.damage} obrażeń na początku kolejnych tur. Pozostało: ${fighter.poisonEffect.turns}.`);
    if(ragePercent(fighter))messages.push(`Furia aktywna: +${ragePercent(fighter)}% obrażeń (HP poniżej ${fighter.enrage.threshold}%).`);
    root.classList.toggle('combat-enraged',ragePercent(fighter)>0);
    if(fighter?.special)messages.push(`Atak specjalny za ${fighter.special.every-((fighter.attackCount||0)%fighter.special.every)} ataków.`);
    effects.hidden=!messages.length;effects.textContent=messages.join(' ');
  }
  function renderBattle(root,battle){
    for(const side of ['hero','enemy']){
      const card=root.querySelector(`[data-fighter="${side}"]`);
      renderFighter(card,battle[side]);
      card.classList.toggle('casting-fireball',battle.lastHit?.actor===side&&battle.lastHit?.ability==='fireball');
      card.classList.toggle('combat-attacking',!battle.winner&&battle.lastHit?.actor===side);
      card.classList.toggle('combat-struck',battle.lastHit?.target===side||battle.lastHit?.poisonTick?.target===side);
      card.classList.toggle('combat-poison-hit',(battle.lastHit?.target===side&&['poison','poison-tick'].includes(battle.lastHit?.ability))||battle.lastHit?.poisonTick?.target===side);
      card.classList.toggle('combat-piercing-hit',battle.lastHit?.target===side&&['piercing','piercing-arrow'].includes(battle.lastHit?.ability));
      card.classList.toggle('combat-echo-hit',battle.lastHit?.target===side&&battle.lastHit?.magicWave?.damage>0);
      card.classList.toggle('combat-water-hit',battle.lastHit?.target===side&&battle.lastHit?.element==='water');
      const damage=(battle.lastHit?.target===side?battle.lastHit.damage:0)+(battle.lastHit?.poisonTick?.target===side?battle.lastHit.poisonTick.damage:0);
      card.querySelector('.combat-damage').textContent=damage?`−${damage}`:'';
    }
    root.querySelector('.combat-round').textContent=battle.winner?(battle.winner==='hero'?'Zwycięstwo':'Porażka'):`Tura ${Math.floor(battle.hits/2)+1}`;
    const hit=battle.lastHit;
    let message='Przeciwnicy stają naprzeciw siebie.';
    if(hit?.ability==='poison-tick')message=`${hit.poisonName}: ${battle[hit.target].name} otrzymuje ${hit.damage} obrażeń.`;
    else if(hit){
      const verbs={'magic-missile':'rzuca magiczny pocisk i zadaje',fireball:'rzuca Kulę ognia (−10 many) i zadaje',water:'atakuje magią wody i zadaje',wand:'atakuje różdżką i zadaje',poison:'uderza zatrutym żądłem i zadaje',piercing:'wyprowadza potężny cios kilofem i zadaje','venom-bite':'wykonuje jadowite ukąszenie i zadaje',spores:'wypuszcza trujące zarodniki i zadaje','chain-slam':'wykonuje potężne uderzenie łańcuchami (150%) i zadaje','thorn-grab':'wykonuje Ciernisty Chwyt (+10) i zadaje','cursed-charge':'wykonuje szarżę (150%) i zadaje','piercing-arrow':'wypuszcza Przeszywającą Strzałę i zadaje','abyss-echo':'wywołuje Echo Zagłady i zadaje'};
      message=`${battle[hit.actor].name} ${verbs[hit.ability]||'zadaje'} ${hit.damage} obrażeń${hit.ability==='poison'?' od trucizny':''}.`;
      if(hit.poisonTick)message=`${hit.poisonTick.label}: ${battle[hit.poisonTick.target].name} otrzymuje ${hit.poisonTick.damage} obrażeń. `+message;
      if(hit.poisonApplied)message+=` ${hit.poisonApplied.label}: ${hit.poisonApplied.damage} obrażeń przez ${hit.poisonApplied.turns} tury celu.`;
      if(hit.magicWave){message+=` W tym ${hit.damage-hit.magicWave.damage} obrażeń fizycznych i ${hit.magicWave.damage} magicznych od fali.`;if(hit.magicWave.bonus)message+=` Podatność na magię fali: +${hit.magicWave.bonus} obrażeń.`;if(hit.magicWave.absorbed)message+=` Pancerz pochłania ${hit.magicWave.absorbed} obrażenia fali.`;}
      if(hit.ragePercent)message+=` Furia: +${hit.ragePercent}% obrażeń.`;
      if(hit.magicBonus)message+=` Podatność na magię: +${hit.magicBonus} obrażeń.`;
      if(hit.resisted)message+=` Odporność fizyczna pochłania ${hit.resisted} obrażeń.`;
      if(hit.resistanceIgnored)message+=' Cios częściowo pomija odporność fizyczną.';
      if(hit.weaknessBonus)message+=` Podatność na wodę: +${hit.weaknessBonus} obrażeń.`;
      if(hit.ignoredArmor)message+=` Cios pomija ${hit.ignoredArmor} pancerza.`;
      if(hit.absorbed)message+=` Pancerz pochłania ${hit.absorbed} obrażenia.`;
    }
    root.querySelector('.combat-status').textContent=message+(battle.winner?' Walka zakończona.':'');
  }
  function play(root,battle,resolveHit,{delay=1100}={}){
    if(!Number.isFinite(delay)||delay<100)throw new Error('Nieprawidłowe tempo walki.');
    let current=battle,stopped=false,timer=null;
    const schedule=()=>{if(!stopped&&!current.winner)timer=setTimeout(step,delay);};
    function step(){
      if(stopped)return;
      try{current=advance(current,resolveHit);renderBattle(root,current);schedule();}
      catch(error){stop();root.querySelector('.combat-status').textContent=error.message;}
    }
    function stop(){stopped=true;clearTimeout(timer);}
    renderBattle(root,current);schedule();
    return stop;
  }
  function markup(){
    return '<p class="combat-availability">Brand dobiera przeciwników maksymalnie 3 poziomy słabszych lub silniejszych od Twojej postaci. Losuje tylko tereny z pasującymi potworami. Podgląd jest bezpłatny.</p><p class="combat-entry-error" role="status"></p>';
  }
  function mount(container,state){
    container.innerHTML=markup();
    const dialog=document.createElement('dialog');
    dialog.className='combat-dialog';dialog.setAttribute('aria-labelledby','combat-location');
    dialog.innerHTML=`<div class="combat-stage"><div class="combat-top"><div><span>Dowódca Brand · Walka z potworami</span><h2 id="combat-location"></h2></div><button type="button" data-close-combat aria-label="Wróć do Branda">×</button></div><div class="combat-battlefield"><div class="combat-round">Przygotowanie do walki</div><div class="combat-fighters">${fighterMarkup('hero')}<span class="combat-versus" aria-hidden="true">⚔</span>${fighterMarkup('enemy')}</div></div><div class="combat-bottom"><p class="combat-status" role="status" aria-live="polite"></p><div class="combat-actions"><button type="button" class="primary" disabled>Walka niedostępna</button></div><small>Rozpoczęcie misji: 5 energii · Podgląd jest bezpłatny</small></div></div>`;
    document.body.append(dialog);
    let disposed=false,busy=false,shownId=null,timer=null;
    const action=dialog.querySelector('.combat-actions button');
    action.removeAttribute('disabled');
    const locked=fn=>navigator.locks?navigator.locks.request('pustkowie-hero-v2',fn):fn();
    function render(hero){
      const fight=hero.activeCombat,offer=hero.combatOffer;
      dialog.querySelector('.combat-top>div>span').textContent=fight?.source==='graveyard'?'Cmentarzysko · Bossowie':fight?.source==='tauriel'?'Tauriel · Przepędź nieproszonych gości':'Dowódca Brand · Walka z potworami';
      dialog.querySelector('[data-close-combat]').setAttribute('aria-label',fight?.source==='graveyard'?'Wróć do Cmentarzyska':fight?.source==='tauriel'?'Wróć do Tauriel':'Wróć do Branda');
      dialog.querySelector('.combat-bottom>small').textContent=fight?.source==='graveyard'?'Cmentarzysko · Bez kosztu energii':fight?.source==='tauriel'?'Misja Tauriel · Bez kosztu energii':fight?`Koszt misji: ${fight.cost??5} energii · Opłacono przy rozpoczęciu`:'Wybierz zlecenie u Branda.';
      const sceneId=fight?.sceneId||offer?.sceneId||'forest',scene=fight?.source==='graveyard'?{image:'scout-forest.webp',short:'Cmentarzysko'}:fight?.source==='tauriel'?{image:'tavern-upstairs.webp',short:'Górne piętro · Barykada'}:window.BrandMissions.SCENES[sceneId];
      dialog.querySelector('.combat-stage').style.setProperty('--combat-art',`url("${scene.image}")`);
      dialog.querySelector('#combat-location').textContent=scene.short;
      if(fight){
        renderBattle(dialog,fight.battle);shownId=fight.id;
        action.textContent=fight.battle.winner?'Zgłoś wynik walki':'Przewiń walkę';action.disabled=busy;
        action.dataset.action=fight.battle.winner?'finish':'skip';action.dataset.fightId=fight.id;
      }else{
        const enemy=availableOpponents(hero,sceneId).find(m=>m.id===offer?.enemyId);
        renderFighter(dialog.querySelector('[data-fighter="hero"]'),profile(hero));
        renderFighter(dialog.querySelector('[data-fighter="enemy"]'),enemy);
        dialog.querySelector('.combat-round').textContent='Przygotowanie do walki';
        const rewardText=enemy?.reward?`Nagroda za zwycięstwo: ${enemy.reward.gold} złota · ${enemy.reward.xp} EXP`:'Nagroda za zwycięstwo: 10–30 złota · 33–55 EXP';
        dialog.querySelector('.combat-status').textContent=enemy?rewardText+(hero.classId==='mage'?' · Kula ognia: 10 many za uderzenie. Bez many: atak różdżką.':''):eligible(hero)?'Brak dostępnych przeciwników.':'Brak potworów dostępnych na Twoim poziomie.';
        action.textContent=enemy?'Rozpocznij walkę · 5 energii':'Walka niedostępna';action.disabled=!enemy||busy;action.dataset.action='start';
      }
    }
    async function preview(){
      if(disposed||busy)return;busy=true;
      try{
        const hero=await locked(()=>{
          const current=state.read();if(current.activeMission)throw new Error('Najpierw zakończ aktywny zwiad.');
          const next=prepare(current);return next===current?current:state.update(latest=>prepare(latest));
        });
        if(disposed)return;busy=false;render(hero);if(!dialog.open)dialog.showModal();
      }catch(error){if(!disposed)container.querySelector('.combat-entry-error').textContent=error.message;}
      finally{busy=false;}
    }
    async function update(){
      if(disposed||busy||!dialog.open)return;
      try{const hero=await locked(()=>{const current=state.read(),next=tick(current);return next===current?current:state.update(latest=>tick(latest));});if(!disposed){if(shownId&&!hero.activeCombat){dialog.close();shownId=null;}else render(hero);}}
      catch(error){if(!disposed)dialog.querySelector('.combat-status').textContent='Nie udało się zapisać walki. Spróbuj ponownie.';}
    }
    async function act(){
      if(busy)return;const intent=action.dataset.action,id=action.dataset.fightId,isQuest=['tauriel','graveyard'].includes(state.read().activeCombat?.source);busy=true;action.disabled=true;
      try{
        const next=await locked(()=>state.update(hero=>intent==='skip'?skip(hero,id):intent==='finish'?finish(hero,id):start(hero)));
        if(disposed)return;
        if(intent==='finish'||intent==='skip'){
          dialog.close();shownId=null;
          if(isQuest){state.onQuestResolved?.(next);return;}
          window.TavernPanel.showReward(next.lastCombat,window.Progression.level(next));
        }else{busy=false;render(next);}
      }catch(error){if(!disposed)dialog.querySelector('.combat-status').textContent=error.message;}
      finally{busy=false;if(!disposed){const current=state.read();action.disabled=current.activeCombat?false:!current.combatOffer?.enemyId||!eligible(current);}}
    }
    function click(e){if(e.target.closest('[data-close-combat]'))dialog.close();else if(e.target.closest('.combat-actions button'))void act();}
    dialog.addEventListener('click',click);timer=setInterval(update,500);
    const dispose=()=>{disposed=true;clearInterval(timer);dialog.removeEventListener('click',click);if(dialog.open)dialog.close();dialog.remove();};
    dispose.open=preview;
    return dispose;
  }
  window.BrandCombat={FIREBALL,manaInfo,profile,opponents,availableOpponents,drawLocation,createBattle,advance,play,mount,prepare,start,tick,skip,finish};
})();
