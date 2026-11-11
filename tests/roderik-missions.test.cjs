const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const plain=value=>JSON.parse(JSON.stringify(value));
function runtime(){const r=vm.createContext({crypto});r.window=r;for(const name of ['progression','energy','gear-catalog','hero','combat','missions','choices','player-stats','frontier-bestiary','roderik-missions'])vm.runInContext(fs.readFileSync('dist/'+name+'.js','utf8'),r);return r;}
const hero=level=>({version:2,name:'Weteran',classId:'warrior',gender:'female',level,xp:123,gold:321,shards:17,energy:100,energyCycleHours:12,nextEnergyResetAt:Date.now()+36000000,brandOffers:[{id:'preserve'}],combatOffer:{sceneId:'forest',enemyId:'basilisk'},campaign:{version:1},vesperaOutfit:'queen',lootInventory:[]});
test('All 20 enemies appear only in Roderik contracts within ±3 levels, accessible from Ubocze',()=>{
 const r=runtime(),m=r.RoderikMissions;
 assert.equal(m.TIERS.easy.cost,10);assert.equal(m.TIERS.easy.enabled,false);assert.equal(m.TIERS.hard.cost,15);
 for(let level=1;level<=60;level++){
  const h=hero(level),pool=m.available(h);assert.ok(pool.every(e=>Math.abs(e.level-level)<=3));
  if(level<30||level>53){assert.equal(pool.length,0);assert.equal(m.prepare(h),h);}
  else{assert.ok(pool.length);const next=m.prepare(h);assert.equal(m.prepare(next),next);assert.equal(h.roderikOffer,undefined);assert.ok(pool.some(e=>e.id===next.roderikOffer.enemyId));}
  for(const scene of ['forest','mine','undercity'])assert.ok(r.BrandCombat.availableOpponents(h,scene).every(e=>e.level<=30));
 }
 for(const enemy of r.FrontierBestiary.MONSTERS)assert.ok(m.available(hero(enemy.level)).some(e=>e.id===enemy.id));
});
test('Starting snapshots cost, reward and player level once, preserves other providers and respects blockers',()=>{
 const r=runtime(),m=r.RoderikMissions,h=m.prepare(hero(31)),before=JSON.stringify(h),id=h.roderikOffer.id;
 const next=m.start(h,id),f=next.activeCombat;
 assert.equal(next.energy,85);assert.equal(f.cost,15);assert.equal(f.source,'roderik');assert.equal(f.playerLevel,31);assert.equal(f.rewardVersion,1);
 assert.deepEqual(plain(f.reward),plain(r.FrontierBestiary.rewardFor(f.battle.enemy.id,31)));assert.equal(next.roderikOffer,null);
 for(const key of ['gold','shards','xp','brandOffers','combatOffer','campaign','lootInventory','vesperaOutfit','nextEnergyResetAt'])assert.deepEqual(plain(next[key]),plain(h[key]),key);
 assert.equal(JSON.stringify(h),before);assert.throws(()=>m.start(next,id));assert.throws(()=>m.start(h,'stale'));assert.throws(()=>m.start({...h,level:32},id));
 for(const patch of [{activeMission:{id:'busy'}},{activeCombat:{id:'busy'}},{energy:14.5}])assert.throws(()=>m.start({...h,...patch},id));
 const scout=m.prepare({...hero(31),classId:'elf',profession:'elf-profession-1'}),discount=m.start(scout,scout.roderikOffer.id);assert.equal(discount.energy,92.5);assert.equal(discount.activeCombat.cost,7.5);
 const due={...h,energy:0,nextEnergyResetAt:Date.now()-1};assert.equal(m.start(due,id).energy,85);
});
test('Every monster resumes deterministically and rewards victory exactly once; losses pay nothing',()=>{
 const r=runtime(),m=r.RoderikMissions,c=r.BrandCombat;
 for(const enemy of r.FrontierBestiary.MONSTERS){
  const h={...hero(enemy.level),xp:r.Progression.required(enemy.level)-1,roderikOffer:{version:1,id:'contract',playerLevel:enemy.level,enemyId:enemy.id}},active=m.start(h,'contract'),f=active.activeCombat;
  active.activeCombat.battle.hero.attack=[73,73];
  const tick=c.tick(active,f.nextHitAt),resumed=c.tick(plain(active),f.nextHitAt);assert.deepEqual(plain(tick),plain(resumed));
  assert.equal(m.prepare(active),active);assert.throws(()=>m.resolve(active,f.id));
  const winning=plain(active);winning.activeCombat.battle.hero.attack=[100000,100000];
  const won=c.skip(winning,f.id),reward=f.reward;assert.equal(won.energy,85);assert.equal(won.gold,h.gold+reward.gold);assert.equal(won.level,enemy.level+1);assert.equal(won.xp,reward.xp-1);
  assert.equal(won.lastRoderikCombat.won,true);assert.equal(won.activeCombat,null);assert.equal(r.PlayerStats.totals(won).missions,1);assert.equal(r.PlayerStats.totals(won).wins,1);
  assert.deepEqual(plain(won.combatOffer),plain(h.combatOffer));assert.throws(()=>c.finish(won,f.id));
  const losing=plain(active);losing.activeCombat.battle.winner='enemy';const lost=c.finish(losing,f.id);
  assert.equal(lost.gold,h.gold);assert.equal(lost.xp,h.xp);assert.equal(lost.level,h.level);assert.equal(lost.energy,85);assert.equal(r.PlayerStats.totals(lost).losses,1);assert.equal(r.PlayerStats.totals(lost).missions,0);
 }
});
