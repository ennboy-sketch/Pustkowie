const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
function runtime(){
  const data=new Map(),session=new Map(),storage=map=>({getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)});
  const r=vm.createContext({crypto,localStorage:storage(data),sessionStorage:storage(session),location:{reload(){}}});r.window=r;
  for(const name of ['progression','energy','gear-catalog','hero','beer','combat','missions','choices','market','profiles'])vm.runInContext(fs.readFileSync(`dist/${name}.js`,'utf8'),r);
  return r;
}
const hero=()=>({version:2,name:'Elf',classId:'elf',gender:'female',level:10,xp:0,gold:10000,energy:100,profession:'elf-profession-1',energyCycleHours:12,nextEnergyResetAt:Date.now()+43200000});
test('Scout halves actual paid scout and combat costs once, including insufficient-energy boundaries',()=>{
  const r=runtime(),h=hero();
  for(const base of [3,5]){
    const scout=r.BrandMissions.start(h,Date.now(),()=> 'forest',r.BrandMissions.rollReward,{cost:base});
    assert.equal(scout.energy,100-base/2);assert.equal(scout.activeMission.cost,base/2);
    const offer=r.BrandCombat.prepare(h),fight=r.BrandCombat.start(offer,Date.now(),{cost:base});
    assert.equal(fight.energy,100-base/2);assert.equal(fight.activeCombat.cost,base/2);
    const ended=r.BrandCombat.skip(fight,fight.activeCombat.id);assert.equal(ended.energy,fight.energy);
  }
  assert.equal(h.energy,100);
  const exact=r.BrandCombat.prepare({...h,energy:2.5});assert.equal(r.BrandCombat.start(exact).energy,0);
  assert.throws(()=>r.BrandCombat.start({...exact,energy:2}),/Potrzebujesz/);
  assert.equal(r.BrandMissions.start({...h,energy:1.5},Date.now(),()=> 'forest',r.BrandMissions.rollReward,{cost:3}).energy,0);
  for(const patch of [{profession:'elf-profession-2'},{profession:null},{classId:'warrior'},{classId:'mage'},{level:9}]){
    const other={...h,...patch};assert.equal(r.EnergyCycle.cost(other,3),3);assert.equal(r.EnergyCycle.cost(other,5),5);
  }
  assert.equal(r.EnergyCycle.cost(h,0),0);assert.throws(()=>r.EnergyCycle.cost(h,1.5));
});
test('Half energy survives refresh, beer, wheel-compatible additions and profile export/import without free refills',()=>{
  const r=runtime(),h={...hero(),energy:97.5},deadline=h.nextEnergyResetAt;
  assert.equal(r.EnergyCycle.apply(h).energy,97.5);assert.equal(r.BeerService.status(h).energy,97.5);
  assert.equal(r.BeerService.purchase({...h,energy:1.5}).energy,21.5);
  assert.equal(r.BeerService.purchase(h).energy,100);
  assert.equal(r.EnergyCycle.apply({...h,energy:Math.min(100,1.5+40)}).energy,41.5);
  const id=r.LocalProfiles.create(h);r.LocalProfiles.activate(id);
  const imported=r.LocalProfiles.importText(r.LocalProfiles.exportText(id));r.LocalProfiles.activate(imported);
  assert.equal(r.LocalProfiles.read().energy,97.5);assert.equal(r.LocalProfiles.read().nextEnergyResetAt,deadline);
  assert.equal(r.EnergyCycle.apply(r.LocalProfiles.read(),deadline).energy,100);
  for(const energy of [1.25,'1.5',true,null,-.5])assert.throws(()=>r.LocalProfiles.importText(JSON.stringify({...h,energy})));
});
test('Scout buys and equips short daggers or bows with agility damage; other professions cannot use daggers',()=>{
  const r=runtime(),h=hero();assert.equal(r.GearCatalog.SCOUT_DAGGERS.length,3);
  for(const dagger of r.GearCatalog.SCOUT_DAGGERS){
    const level=Math.max(10,dagger.requiredLevel),ready={...h,level};
    const bought=r.MarketPanel.purchase(ready,dagger.id),item=r.HeroSheet.inventory(bought).find(i=>i.marketProduct===dagger.id);
    const equipped=r.HeroSheet.equip(bought,'weapon',item.id),profile=r.BrandCombat.profile(equipped);
    assert.equal(profile.weaponType,'dagger');assert.equal(r.HeroSheet.bonuses(equipped)[1],dagger.stats[1]);
    const bow=r.GearCatalog.get(`gringo-elf-${dagger.requiredLevel}-weapon`),withBow=r.MarketPanel.purchase(ready,bow.id),bowItem=r.HeroSheet.inventory(withBow).find(i=>i.marketProduct===bow.id);
    const bowProfile=r.BrandCombat.profile(r.HeroSheet.equip(withBow,'weapon',bowItem.id));
    assert.equal(bowProfile.weaponType,'bow');assert.deepEqual([...profile.attack],[...bowProfile.attack]);
    const enemy={name:'Cel',maxHp:1000,attack:[1,1],stats:[1,1,1,1]};
    assert.equal(r.BrandCombat.advance(r.BrandCombat.createBattle(profile,enemy,'hero'),()=>20).lastHit.ability,'dagger');
    for(const patch of [{profession:'elf-profession-2'},{profession:null},{classId:'warrior'},{level:9}]){
      const other={...ready,...patch};assert.equal(r.HeroSheet.canEquip(other,item),false);assert.throws(()=>r.MarketPanel.purchase(other,dagger.id));
    }
  }
});
