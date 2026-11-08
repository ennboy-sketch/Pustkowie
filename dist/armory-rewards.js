'use strict';
(()=>{
 function profession(h){if(!h||h.classId!=='warrior'||window.Progression.level(h)<10)return null;return window.GearCatalog.ARMORY_SETS.find(s=>s.profession===h.profession)||null;}
 function progress(h){const s=h.melodyArmory;if(s===undefined)return null;if(!s||s.unlocked!==true||typeof s.claimed!=='boolean'||!window.GearCatalog.ARMORY_SETS.some(p=>p.profession===s.profession))throw Error('Nieprawidłowy zapis dostępu do zbrojowni.');return s;}
 function unlocked(h){const p=profession(h),s=progress(h);return !!p&&!!s&&s.profession===p.profession;}
 function handoverReason(h){
  if(!profession(h))return 'Zbrojownia Rolanda służy Palladynom i Rycerzom. Wymagana jest jedna z tych profesji.';
  if(progress(h))return 'Melody przyjęła już Twój topór. Zbrojownia jest odblokowana.';
  if(window.Graveyard.count(h)!==window.Graveyard.BOSSES.length)return 'Najpierw ukończ całe Cmentarzysko i pokonaj Minotaura.';
  if(h.activeCombat||h.activeMission)return 'Najpierw zakończ obecną walkę lub misję.';
  const axes=window.HeroSheet.inventory(h).filter(i=>i.id==='minotaur-axe'&&i.kind==='minotaur-axe'&&i.slot==='weapon');
  if(axes.length!==1)return 'Przynieś Topór Minotaura zdobyty na Cmentarzysku.';
  if(!window.HeroSheet.bagItems(h).some(i=>i.id===axes[0].id))return 'Najpierw zdejmij Topór Minotaura z postaci i przenieś go do plecaka.';
  return '';
 }
 function handover(h){const reason=handoverReason(h);if(reason)throw Error(reason);return {...h,lootInventory:window.HeroSheet.inventory(h).filter(i=>i.id!=='minotaur-axe'),melodyArmory:{unlocked:true,claimed:false,profession:profession(h).profession}};}
 function claim(h){
  if(!unlocked(h))throw Error('Najpierw oddaj Topór Minotaura dowódczyni Melody.');
  if(progress(h).claimed)throw Error('Zestaw od Rolanda został już odebrany.');
  if(h.activeCombat||h.activeMission)throw Error('Najpierw zakończ obecną walkę lub misję.');
  const set=profession(h),items=window.HeroSheet.inventory(h);
  if(window.HeroSheet.bagItems(h).length+set.items.length>25)throw Error(`Zwolnij ${set.items.length} miejsc w plecaku na pełny zestaw od Rolanda.`);
  if(set.items.some(p=>items.some(i=>i.marketProduct===p.id||i.id===p.id)))throw Error('Przedmioty z tego zestawu są już w Twoim zapisie.');
  const reward=set.items.map(p=>({id:p.id,marketProduct:p.id,name:p.name,slot:p.slot,requiredLevel:p.requiredLevel,...(p.armorType?{armorType:p.armorType}:{}),...(p.holy?{holy:true}:{})}));
  return {...h,lootInventory:[...items,...reward],melodyArmory:{...progress(h),claimed:true}};
 }
 window.ArmoryRewards={profession,progress,unlocked,handoverReason,handover,claim};
})();
