'use strict';
(() => {
  const LEVELS=Object.freeze([5,15,25]),SLOTS=['weapon','helmet','armor','boots','shield'];
  const NAMES={
    warrior:[
      ['Miecz Straży Zamkowej','Hełm Żelaznej Warty','Zbroja Żelaznej Warty','Buty Zamkowego Wartownika','Tarcza Straży Zamkowej'],
      ['Miecz Czarnej Stali','Hełm Czarnej Warty','Zbroja Czarnej Stali','Buty Czarnego Garnizonu','Tarcza Czarnej Twierdzy'],
      ['Miecz Przysięgi Obrońcy','Hełm Korony Zamku','Zbroja Nieugiętej Przysięgi','Buty Nieugiętego Obrońcy','Tarcza Bastionu Przysięgi']
    ],
    mage:[
      ['Różdżka Żaru','Kaptur Adepta Płomienia','Płaszcz Tkacza Iskier','Buty Zaklinacza','Tarcza Runicznego Kręgu'],
      ['Różdżka Szmaragdowego Żaru','Kaptur Szeptów Wieży','Płaszcz Zielonego Płomienia','Buty Runicznego Szlaku','Tarcza Szmaragdowej Pieczęci'],
      ['Różdżka Serca Płomienia','Kaptur Arcymaga Czarnej Stali','Płaszcz Wiecznego Żaru','Buty Władcy Run','Tarcza Wiecznej Pieczęci']
    ],
    elf:[
      ['Łuk Leśnej Straży','Hełm Zielonego Liścia','Pancerz Leśnego Strażnika','Buty Cichego Szlaku','Tarcza Dębowego Liścia'],
      ['Łuk Nocnej Kniei','Hełm Srebrnego Liścia','Pancerz Szmaragdowej Kniei','Buty Nocnego Tropiciela','Tarcza Starego Dębu'],
      ['Łuk Przysięgi Prastarego Lasu','Hełm Korony Kniei','Pancerz Strażnika Prastarego Lasu','Buty Szeptu Prastarej Kniei','Tarcza Serca Prastarego Dębu']
    ],
    dwarf:[
      ['Topór Kamiennej Straży','Hełm Górskiej Warty','Zbroja Żelaznej Warty','Buty Kamiennego Traktu','Puklerz Górskiej Warty'],
      ['Topór Czarnej Kuźni','Hełm Kamiennej Przysięgi','Zbroja Czarnej Stali','Buty Żelaznego Szybu','Puklerz Runicznej Kuźni'],
      ['Topór Serca Góry','Hełm Władcy Głębin','Zbroja Nieugiętej Przysięgi','Buty Nieugiętej Góry','Puklerz Kamiennego Bastionu']
    ]
  };
  const prices=[[120,80,150,70,100],[420,280,520,240,350],[900,600,1100,550,750]];
  const primary={warrior:0,mage:2,elf:1,dwarf:0},CLASS_LABELS={warrior:'Wojownik',mage:'Mag',elf:'Elf',dwarf:'Krasnolud'};
  const products=[];
  for(const classId of Object.keys(NAMES))for(let row=0;row<3;row++)for(let col=0;col<5;col++){
    const slot=SLOTS[col],shared=slot==='armor'&&['warrior','dwarf'].includes(classId);
    if(shared&&classId==='dwarf')continue;
    const stats=[0,0,0,0],power=[4,10,18][row],support=[1,3,5][row],endurance=[2,5,9][row];
    if(slot==='weapon')stats[primary[classId]]=power;
    if(slot==='helmet'){stats[primary[classId]]=support;stats[3]=endurance;}
    if(slot==='armor')stats[3]=power;
    if(slot==='boots'){stats[1]=endurance;stats[3]=support;}
    if(slot==='shield'){stats[primary[classId]]=support;stats[3]=[3,7,12][row];}
    products.push(Object.freeze({id:`gringo-${shared?'heavy':classId}-${LEVELS[row]}-${slot}`,name:NAMES[classId][row][col],slot,requiredLevel:LEVELS[row],classes:Object.freeze(shared?['warrior','dwarf']:[classId]),price:prices[row][col],stats:Object.freeze(stats),iconClass:classId,iconRow:row,iconCol:col,...(slot==='armor'?{armorType:shared?'heavy':classId==='mage'?'cloak':'light'}:{})}));
  }
  const craftedNames={warrior:'Ostrze Szmaragdowego Zmierzchu',mage:'Różdżka Astralnego Splotu',elf:'Łuk Ametystowego Szeptu',dwarf:'Topór Serca Głębin'};
  const CRAFTED_WEAPONS=Object.freeze(Object.keys(NAMES).map(classId=>{
    const base=products.find(p=>p.id===`gringo-${classId}-25-weapon`),stats=[0,0,0,20];stats[primary[classId]]=20;
    return Object.freeze({...base,id:`forge-${classId}-35-weapon`,name:craftedNames[classId],requiredLevel:35,craftOnly:true,stats:Object.freeze(stats)});
  }));
  const ARMORY_SETS=Object.freeze([
    {profession:'warrior-profession-1',professionName:'Palladyn',name:'Święta Przysięga',key:'paladin',holy:true,names:['Święty Miecz Przysięgi','Hełm Świętej Przysięgi','Zbroja Świętej Przysięgi','Nagolenniki Świętej Przysięgi','Tarcza Świętej Przysięgi','Medalion Świętej Przysięgi','Kolczyki Świętej Przysięgi','Relikwiarz Świętej Przysięgi'],bonuses:[[14,0,0,4],[4,0,0,7],[0,0,0,14],[0,7,0,4],[4,0,0,10],[3,0,0,4],[3,0,0,3],[3,0,0,4]]},
    {profession:'warrior-profession-2',professionName:'Rycerz',name:'Bastion Czarnej Stali',key:'knight',holy:false,names:['Miecz Bastionu Czarnej Stali','Hełm Bastionu Czarnej Stali','Zbroja Bastionu Czarnej Stali','Buty Bastionu Czarnej Stali','Tarcza Bastionu Czarnej Stali','Medalion Bastionu Czarnej Stali','Kolczyki Bastionu Czarnej Stali','Pieczęć Bastionu Czarnej Stali'],bonuses:[[12,0,0,6],[3,0,0,8],[0,0,0,16],[0,6,0,5],[3,0,0,12],[2,0,0,5],[2,0,0,4],[2,0,0,5]]}
  ].map(set=>Object.freeze({...set,items:Object.freeze([...SLOTS,'necklace','earrings','special'].map((slot,i)=>Object.freeze({id:`roland-${set.key}-20-${slot}`,name:set.names[i],slot,requiredLevel:20,classes:Object.freeze(['warrior']),profession:set.profession,professionName:set.professionName,price:[600,400,800,350,500,200,160,200][i],stats:Object.freeze(set.bonuses[i]),rewardOnly:true,holy:set.holy,armory:set.key,iconClass:'warrior',iconRow:1,iconCol:i,...(slot==='armor'?{armorType:'heavy'}:{})}))) })));
  const PRODUCTS=Object.freeze(products),BY_ID=new Map([...PRODUCTS,...CRAFTED_WEAPONS,...ARMORY_SETS.flatMap(s=>s.items)].map(p=>[p.id,p]));
  function productFor(item){const p=BY_ID.get(item?.marketProduct??item?.id);return p&&p.slot===item.slot?p:null;}
  function reason(hero,item){const p=productFor(item),holy=item?.holy===true||p?.holy===true;if(holy&&(hero.classId!=='warrior'||hero.profession!=='warrior-profession-1'||window.Progression.level(hero)<10))return 'Święty ekwipunek wymaga profesji Palladyn i poziomu 10.';if(item?.kind==='minotaur-axe')return window.Progression.level(hero)<20?'Wymagany poziom 20.':'';if(!p)return item?.marketProduct?.startsWith('gringo-')?'Nieprawidłowy przedmiot.':'';if(p.profession&&p.profession!==hero.profession)return `Ten ekwipunek wymaga profesji ${p.professionName}.`;return !p.classes.includes(hero.classId)?'Przedmiot dla innej klasy.':window.Progression.level(hero)<p.requiredLevel?`Wymagany poziom ${p.requiredLevel}.`:'';}
  function forClass(classId){return PRODUCTS.filter(p=>p.classes.includes(classId)).sort((a,b)=>a.requiredLevel-b.requiredLevel||SLOTS.indexOf(a.slot)-SLOTS.indexOf(b.slot));}
  function iconClass(item){const p=productFor(item);if(p?.armory)return `gear-art armory-${p.armory} `+(p.iconCol<5?`catalog-art catalog-warrior-${p.iconRow}-${p.iconCol}`:`gear-${{necklace:5,earrings:6,special:7}[p.slot]}`);return p?(p.craftOnly?`gear-art crafted-weapon-art crafted-${p.iconClass}`:`gear-art catalog-art catalog-${p.iconClass}-${p.iconRow}-${p.iconCol}`):null;}
  function icon(item){const cls=iconClass(item);return cls?`<span class="${cls}" aria-hidden="true"></span>`:'';}
  function details(item){const p=productFor(item);const holy=item?.holy===true||p?.holy===true?'Święty ekwipunek · Tylko Palladyn · Od poziomu '+(p?.requiredLevel??10):'';return p?holy+(holy?' · ':'')+`Poziom ${p.requiredLevel}${p.professionName?' · '+p.professionName:''} · ${p.classes.map(c=>CLASS_LABELS[c]).join(' / ')}`:holy;}
  window.GearCatalog={LEVELS,PRODUCTS,CRAFTED_WEAPONS,ARMORY_SETS,get:id=>BY_ID.get(id),productFor,reason,forClass,iconClass,icon,details};
})();
