'use strict';
(()=>{
  const COST=5;
  const groups=[
    ['a',[
      ['commander','Dowódczyni Ametystowej Przysięgi','Srebrzysta zbroja, złote zdobienia, biel i ametystowe akcenty.'],
      ['queen','Królowa Purpurowego Dworu','Purpurowy aksamit, złote hafty, korona i ciemne futro.'],
      ['sorceress','Czarodziejka Ametystu','Fioletowy strój, skórzane dodatki i ametystowa biżuteria.'],
      ['huntress','Łowczyni Nocnego Szlaku','Ciemna skóra, pasy, sprzączki i wysokie buty.']
    ]],
    ['b',[
      ['priestess','Kapłanka Złotego Świtu','Biel i złoto, delikatne hafty oraz ozdobna opaska.'],
      ['warrior','Wojowniczka Karmazynowej Stali','Bordowo-czarna skóra, naramienniki i pancerne dodatki.'],
      ['druid','Druidka Szmaragdowej Kniei','Leśna zieleń, liście, roślinne hafty i szmaragd.'],
      ['innkeeper','Karczmarka Purpurowej Latarni','Bordowa suknia, kremowe koronki i sznurowany gorset.']
    ]],
    ['c',[
      ['dancer','Tancerka Szafirowego Dworu','Szafirowy błękit, złote ozdoby i zwiewne tkaniny.'],
      ['aristocrat','Arystokratka Różanego Dworu','Różane tkaniny, kwiatowe hafty i ozdoby we włosach.'],
      ['mercenary','Najemniczka Czarnej Stali','Czarna skóra, metalowe sprzączki i pas z sakiewkami.'],
      ['shadow','Czarodziejka Cienia','Karmazyn, czerń i ozdobna opaska z niewielkimi rogami.']
    ]]
  ];
  const standing=[
    ['standing-amethyst','Ametystowy Aksamit','Fioletowa aksamitna suknia z trenem, złote hafty, koronkowy gorset, łańcuszki z ametystami i wysokie skórzane buty.','vespera-standing-amethyst.jpg'],
    ['standing-crimson','Karmazynowy Dwór','Bordowo-fioletowa suknia z odkrytymi ramionami, złote zdobienia gorsetu, drapowane tkaniny i sznurowane botki.','vespera-standing-crimson.jpg'],
    ['standing-enchantress','Ametystowa Czarodziejka','Czarny gorset ze złotym ornamentem, zwiewne fioletowe rękawy, ozdobny pas z łańcuszkami i wysokie haftowane buty.','vespera-standing-enchantress.jpg'],
    ['standing-ranger','Łuczniczka Leśnego Szlaku','Skórzany gorset, pasy i sakiewki, fioletowa szarfa ze złotym haftem, łuk, kołczan i wysokie sznurowane buty.','vespera-standing-ranger.jpg'],
    ['standing-lace','Ametystowa Koronka','Fioletowo-złoty strój z koronką, sznurowany czarny gorset, ametystowa biżuteria, ozdobne karwasze i delikatne łańcuszki.','vespera-standing-lace.jpg']
  ];
  const CATALOG=Object.freeze([
    Object.freeze({id:'default',name:'Strój Mistrzyni Przemian',description:'Oryginalny fioletowy strój Vespery.',image:'skin-house-interior.webp',columns:1,rows:1,col:0,row:0}),
    ...groups.flatMap(([group,entries])=>entries.map(([id,name,description],index)=>Object.freeze({id,name,description,image:`vespera-outfits-${group}.webp`,columns:2,rows:2,col:index%2,row:Math.floor(index/2)}))),
    ...standing.map(([id,name,description,image])=>Object.freeze({id,name,description,image,pose:'standing',columns:1,rows:1,col:0,row:0}))
  ]);
  const get=id=>CATALOG.find(outfit=>outfit.id===id);
  const current=hero=>get(hero?.vesperaOutfit)||CATALOG[0];
  function balance(hero){const n=hero.shards??0;if(!Number.isSafeInteger(n)||n<0)throw Error('Nieprawidłowy zapis odłamków.');return n;}
  function change(hero,id,expected=current(hero).id){
    const outfit=get(id);if(!outfit)throw Error('Nieznany strój Vespery.');
    const previous=current(hero).id;
    if(previous!==expected)throw Error('Strój Vespery zmienił się w innej karcie. Wybierz strój ponownie.');
    if(previous===id)return hero;
    const shards=balance(hero);if(shards<COST)throw Error('Potrzebujesz 5 odłamków.');
    return {...hero,shards:shards-COST,vesperaOutfit:id};
  }
  window.VesperaOutfits={CATALOG,COST,get,current,balance,change};
})();
