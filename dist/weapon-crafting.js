'use strict';
(()=>{
 const LEVEL=35,COST=10,GOLD_COST=5000,SHARD_COST=5;
 function recipe(hero){return window.GearCatalog.CRAFTED_WEAPONS.find(p=>p.classes.includes(hero.classId));}
 function weapons(hero){return window.HeroSheet.inventory(hero).filter(item=>{const p=window.GearCatalog.productFor(item);return item.slot==='weapon'&&p?.requiredLevel===25&&p.classes.includes(hero.classId)&&window.HeroSheet.canEquip(hero,item);});}
 function reason(hero,id){
  if(!recipe(hero))return 'Nieznana klasa postaci.';
  if(window.Progression.level(hero)<LEVEL)return 'Wytwarzanie wymaga poziomu 35.';
  if(!Number.isSafeInteger(hero.gold)||hero.gold<GOLD_COST)return 'Potrzebujesz 5000 złota.';
  if(!Number.isSafeInteger(hero.shards)||hero.shards<SHARD_COST)return 'Potrzebujesz 5 odłamków.';
  for(const [key,label]of[['rareMaterial','Rzadki Materiał'],['gemFragments','Kawałek klejnotu']])if(!Number.isSafeInteger(hero[key])||hero[key]<COST)return `Potrzebujesz 10 × ${label}.`;
  const matches=weapons(hero).filter(i=>i.id===id);if(matches.length!==1)return 'Wybierz broń na poziom 25 dla swojej klasy.';
  if(Object.values(window.HeroSheet.equipment(hero)).includes(id))return 'Najpierw zdejmij broń na poziom 25 z postaci.';
  return '';
 }
 function craft(hero,id){
  const blocked=reason(hero,id);if(blocked)throw Error(blocked);
  const p=recipe(hero),items=window.HeroSheet.inventory(hero),item={id:crypto.randomUUID(),slot:'weapon',name:p.name,marketProduct:p.id,requiredLevel:LEVEL};
  const next={...hero,gold:hero.gold-GOLD_COST,shards:hero.shards-SHARD_COST,rareMaterial:hero.rareMaterial-COST,gemFragments:hero.gemFragments-COST,lootInventory:[...items.filter(i=>i.slot!=='material'&&i.id!==id),item]};
  if(window.HeroSheet.bagItems(next).length>25)throw Error('Ekwipunek jest pełny. Zwolnij miejsce.');
  return next;
 }
 window.WeaponCrafting={LEVEL,COST,GOLD_COST,SHARD_COST,recipe,weapons,reason,craft};
})();
