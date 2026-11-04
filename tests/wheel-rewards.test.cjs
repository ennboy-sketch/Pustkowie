const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),{webcrypto}=require('node:crypto');
function run(){const r=vm.createContext({crypto:webcrypto});r.window=r;for(const n of ['progression','energy','gear-catalog','hero','wheel','combat','missions'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist',n+'.js'),'utf8'),r);return r}
const hero=()=>({version:2,name:'Test',classId:'warrior',gender:'male',level:9,gold:1000,shards:20,energy:50,nextEnergyResetAt:Date.now()+86400000});
function win(r,h,id,currency='shards'){return r.FateWheel.spin(h,currency,()=>r.FateWheel.pool(h).findIndex(x=>x.id===id))}
for(const id of ['energy','pony','rare','potion','gem','xp','scroll'])test('wheel reward '+id+' is saved once with the selected cost',()=>{const r=run(),h=hero(),before=JSON.stringify(h);for(const currency of ['gold','shards']){const n=win(r,h,id,currency);assert.equal(JSON.stringify(h),before);assert.equal(n.gold,h.gold-(currency==='gold'?100:0));assert.equal(n.shards,h.shards-(currency==='shards'?1:0));assert.equal(n.lastWheel.reward,id);if(id==='energy')assert.equal(n.energy,75);if(id==='pony')assert.equal(n.warPony,true);if(id==='rare')assert.equal(n.rareMaterial,1);if(id==='gem')assert.equal(n.gemFragments,1);if(id==='scroll')assert.equal(n.spellScrolls,1);if(id==='xp')assert.equal(n.xp,250);if(id==='potion')assert.equal(n.lootInventory.filter(i=>i.kind==='power-potion').length,1)}});
test('unaffordable spins and invalid draws cannot charge or award',()=>{const r=run();for(const h of [{...hero(),gold:99},{...hero(),shards:0}]){const before=JSON.stringify(h);assert.throws(()=>r.FateWheel.spin(h,h.gold===99?'gold':'shards'));assert.equal(JSON.stringify(h),before)}assert.throws(()=>r.FateWheel.spin(hero(),'gold',()=>999));assert.throws(()=>r.FateWheel.spin(hero(),'wrong'))});
test('owned pony, full energy and full inventory rewards are excluded; energy stays capped',()=>{const r=run(),h={...hero(),warPony:true,energy:100,lootInventory:Array.from({length:25},(_,i)=>({id:'i'+i,slot:'helmet'})),equipment:{}};assert.ok(r.FateWheel.pool(h).every(x=>!['energy','pony','potion'].includes(x.id)));assert.equal(win(r,{...hero(),energy:90},'energy').energy,100)});
test('pony and equipped potion add attack and armor only to new snapshots, with no stacking across reload',()=>{const r=run(),base=hero(),plain=r.BrandCombat.profile(base);let h=win(r,win(r,base,'pony'),'potion');const potion=h.lootInventory.find(i=>i.kind==='power-potion');assert.equal(r.FateWheel.bonuses(h).damage,5);h=r.HeroSheet.equip(h,'special',potion.id);assert.equal(r.FateWheel.bonuses(h).damage,15);assert.equal(r.BrandCombat.profile(h).armor,5);assert.equal(r.BrandCombat.profile(h).damageBonus,15);const old=r.BrandCombat.start({...base,combatOffer:{sceneId:'mine',enemyId:'undead-miner'}});const next=r.BrandCombat.start({...h,combatOffer:{sceneId:'mine',enemyId:'undead-miner'}});assert.equal(next.activeCombat.battle.hero.attack[0]-old.activeCombat.battle.hero.attack[0],15);assert.equal(old.activeCombat.battle.hero.armor,0);assert.equal(r.BrandCombat.profile(JSON.parse(JSON.stringify(h))).damageBonus,15);assert.equal(r.HeroSheet.equip(h,'special',null).equipment.special,null)});
test('pony shortens only new missions by 10%, retains original rewards, survives reload and finishes at its saved deadline',()=>{const r=run(),now=Date.now(),base=hero(),old=r.BrandMissions.start(base,now,()=> 'forest',()=>({xp:77,gold:17}));const n=r.BrandMissions.start({...base,warPony:true},now,()=> 'forest',()=>({xp:77,gold:17}));assert.equal(n.activeMission.durationMs,540000);assert.equal(old.activeMission.durationMs,600000);assert.equal(r.BrandMissions.durationFor(10,'hard',n),9);assert.doesNotThrow(()=>r.BrandMissions.status(JSON.parse(JSON.stringify(n)),now));assert.throws(()=>r.BrandMissions.finish(n,now+539999));assert.equal(r.BrandMissions.finish(n,now+540000).xp,77);assert.equal(r.BrandMissions.status({...old,warPony:true},now).mission.durationMs,600000)});
test('10 scrolls exchange for 1000 EXP preserving leftovers, other currencies, old heroes and level-up logic',()=>{const r=run();assert.throws(()=>r.FateWheel.exchangeScrolls({...hero(),spellScrolls:9}));const h={...hero(),level:1,xp:0,spellScrolls:13},n=r.FateWheel.exchangeScrolls(h);assert.equal(n.spellScrolls,3);assert.equal(n.level,2);assert.equal(n.xp,700);assert.equal(n.gold,h.gold);assert.equal(n.shards,h.shards);assert.equal(h.spellScrolls,13);assert.throws(()=>r.FateWheel.exchangeScrolls(n))});
test('full bags exclude new material stacks but accept existing stacks without consuming another slot',()=>{const r=run(),full={...hero(),lootInventory:Array.from({length:25},(_,i)=>({id:'bag-'+i,slot:'helmet'})),equipment:{}};assert.ok(r.FateWheel.pool(full).every(x=>!['rare','gem','scroll','potion'].includes(x.id)));for(const [id,key] of [['rare','rareMaterial'],['gem','gemFragments'],['scroll','spellScrolls']]){const h={...full,lootInventory:full.lootInventory.slice(0,24),[key]:5};assert.equal(r.HeroSheet.bagItems(h).length,25);const n=win(r,h,id);assert.equal(n[key],6);assert.equal(r.HeroSheet.bagItems(n).length,25)}const empty={...hero(),rareMaterial:1,gemFragments:2,spellScrolls:10};assert.equal(r.HeroSheet.bagItems(empty).length,3);assert.equal(r.HeroSheet.bagItems(r.FateWheel.exchangeScrolls(empty)).length,2)});
test('power potion starts only on equip, expires at exactly three hours and never restarts after reload or unequip',()=>{
 const r=run(),start=1700000000000;r.Date=vm.runInContext('Date',r);r.Date.now=()=>start;
 const won=win(r,hero(),'potion'),id=won.lootInventory.find(i=>i.kind==='power-potion').id;
 assert.equal(won.lootInventory.find(i=>i.id===id).powerExpiresAt,undefined);assert.equal(r.FateWheel.bonuses(won).damage,0);
 let h=r.HeroSheet.equip(won,'special',id);const expiry=start+10800000;
 assert.equal(h.lootInventory.find(i=>i.id===id).powerExpiresAt,expiry);assert.equal(r.FateWheel.bonuses(h).damage,10);
 r.Date.now=()=>start+3600000;h=r.HeroSheet.equip(h,'special',null);assert.equal(r.FateWheel.bonuses(h).damage,0);
 h=r.HeroSheet.equip(JSON.parse(JSON.stringify(h)),'special',id);assert.equal(h.lootInventory.find(i=>i.id===id).powerExpiresAt,expiry);
 r.Date.now=()=>expiry-1;assert.equal(r.FateWheel.bonuses(h).damage,10);
 r.Date.now=()=>expiry;assert.equal(r.FateWheel.bonuses(h).damage,0);assert.throws(()=>r.HeroSheet.equip(h,'special',id),/zużyta/);
 assert.equal(r.HeroSheet.activatePotion(h),h);
});
test('previously equipped potion gets one saved deadline; unused potions remain inactive',()=>{
 const r=run(),item={id:'legacy',kind:'power-potion',slot:'special',name:'Mikstura mocy'},base={...hero(),lootInventory:[item]};
 assert.equal(r.HeroSheet.activatePotion(base,1000),base);
 const worn={...base,equipment:{special:item.id}},next=r.HeroSheet.activatePotion(worn,1000);
 assert.equal(next.lootInventory[0].powerExpiresAt,10801000);assert.equal(item.powerExpiresAt,undefined);
 assert.equal(r.HeroSheet.activatePotion(next,5000),next);
});
test('wheel upgrades five rewards exactly at level 10 and retains costs and inventory stacking',()=>{
 const r=run();for(const level of [9,10,11,119])for(const currency of ['gold','shards']){
  const base={...hero(),level},high=level>=10;
  for(const [id,key,amount] of [['energy','energy',high?40:25],['xp','xp',high?10000:250],['scroll','spellScrolls',high?3:1],['gem','gemFragments',high?3:1],['rare','rareMaterial',high?3:1]]){
   const h=win(r,base,id,currency);assert.equal(h[key],(base[key]||0)+amount);assert.equal(h.gold,base.gold-(currency==='gold'?100:0));assert.equal(h.shards,base.shards-(currency==='shards'?1:0));
   assert.ok(h.lastWheel.name.endsWith(String(amount)));assert.ok(r.FateWheel.markup(base).includes(h.lastWheel.name));
   if(['scroll','gem','rare'].includes(id))assert.equal(r.HeroSheet.bagItems(h).filter(i=>i.slot==='material').length,1);
  }
 }
 assert.equal(win(r,{...hero(),level:10,energy:90},'energy').energy,100);
 const full={...hero(),level:10,spellScrolls:5,lootInventory:Array.from({length:24},(_,i)=>({id:'item'+i,slot:'helmet'})),equipment:{}};
 assert.equal(r.HeroSheet.bagItems(full).length,25);const n=win(r,full,'scroll');assert.equal(n.spellScrolls,8);assert.equal(r.HeroSheet.bagItems(n).length,25);
 const promoted=win(r,{...hero(),level:9,xp:23900},'xp');assert.equal(promoted.level,10);assert.equal(promoted.xp,150);assert.equal(promoted.lastWheel.name,'EXP +250');
 assert.equal(r.FateWheel.rewardsFor(promoted).find(x=>x.id==='xp').amount,10000);
});
