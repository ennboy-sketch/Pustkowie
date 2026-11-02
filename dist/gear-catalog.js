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
  const PRODUCTS=Object.freeze(products),BY_ID=new Map(PRODUCTS.map(p=>[p.id,p]));
  function productFor(item){const p=BY_ID.get(item?.marketProduct??item?.id);return p&&p.slot===item.slot?p:null;}
  function reason(hero,item){const p=productFor(item);if(!p)return item?.marketProduct?.startsWith('gringo-')?'Nieprawidłowy przedmiot.':'';return !p.classes.includes(hero.classId)?'Przedmiot dla innej klasy.':window.Progression.level(hero)<p.requiredLevel?`Wymagany poziom ${p.requiredLevel}.`:'';}
  function forClass(classId){return PRODUCTS.filter(p=>p.classes.includes(classId)).sort((a,b)=>a.requiredLevel-b.requiredLevel||SLOTS.indexOf(a.slot)-SLOTS.indexOf(b.slot));}
  function iconClass(item){const p=productFor(item);return p?`gear-art catalog-art catalog-${p.iconClass}-${p.iconRow}-${p.iconCol}`:null;}
  function icon(item){const cls=iconClass(item);return cls?`<span class="${cls}" aria-hidden="true"></span>`:'';}
  function details(item){const p=productFor(item);return p?`Poziom ${p.requiredLevel} · ${p.classes.map(c=>CLASS_LABELS[c]).join(' / ')}`:'';}
  window.GearCatalog={LEVELS,PRODUCTS,get:id=>BY_ID.get(id),productFor,reason,forClass,iconClass,icon,details};
})();
