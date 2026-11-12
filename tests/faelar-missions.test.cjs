const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const plain=value=>JSON.parse(JSON.stringify(value));
function runtime(){const r=vm.createContext({crypto});r.window=r;for(const n of['progression','energy','gear-catalog','hero','combat','missions','choices','player-stats','frontier-bestiary','roderik-missions','eldor-bestiary','faelar-missions'])vm.runInContext(fs.readFileSync('dist/'+n+'.js','utf8'),r);return r;}
const hero=level=>({version:2,name:'Weteran',classId:'warrior',gender:'female',level,xp:123,gold:321,shards:17,energy:100,energyCycleHours:12,nextEnergyResetAt:Date.now()+36000000,brandOffers:[{id:'brand'}],combatOffer:{id:'old'},roderikOffer:{id:'roderik'},roderikScout:{id:'timer'},activeMission:{id:'side-scout'},campaign:{accepted:['trophies']},heroSkin:'ember-steel',ownedHeroSkins:['ember-steel'],vesperaOutfit:'queen',lootInventory:[]});
test('Faelar offers the 25 Eldor monsters only, matched within three levels with a level-50 gate and a retained highest band',()=>{
 const r=runtime(),m=r.FaelarMissions;assert.equal(m.MIN_LEVEL,50);assert.equal(m.COST,15);
 for(let level=1;level<=250;level++){const h=hero(level),pool=m.available(h);if(level<50){assert.equal(pool.length,0);assert.equal(m.prepare(h),h);continue;}assert.ok(pool.length);assert.ok(pool.every(e=>e.level>=51&&e.level<=75&&Math.abs(e.level-Math.min(level,75))<=3));const next=m.prepare(h);assert.ok(pool.some(e=>e.id===next.faelarOffer.enemyId));assert.equal(m.prepare(next),next);assert.equal(h.faelarOffer,undefined);assert.equal(next.activeMission,h.activeMission);assert.equal(next.roderikScout,h.roderikScout);}
 assert.deepEqual(plain(m.available(hero(50)).map(e=>e.level)),[51,52,53]);assert.deepEqual(plain(m.available(hero(250)).map(e=>e.level)),[72,73,74,75]);
 for(const e of r.EldorBestiary.MONSTERS){assert.ok(m.available(hero(e.level)).some(enemy=>enemy.id===e.id));assert.ok(r.RoderikMissions.available(hero(e.level)).every(enemy=>enemy.id!==e.id));}
});
test('Starting pays exactly once and snapshots rewards, while preserving side quests, scouts, Brand/Roderik offers and saved appearance',()=>{
 const r=runtime(),m=r.FaelarMissions,h=m.prepare(hero(51)),before=JSON.stringify(h),id=h.faelarOffer.id,next=m.start(h,id),fight=next.activeCombat;
 assert.equal(next.energy,85);assert.equal(fight.source,'faelar');assert.equal(fight.cost,15);assert.equal(fight.rewardVersion,1);assert.equal(fight.playerLevel,51);assert.deepEqual(plain(fight.reward),plain(r.EldorBestiary.rewardFor(fight.battle.enemy.id,51)));assert.equal(next.faelarOffer,null);assert.equal(JSON.stringify(h),before);
 for(const key of ['gold','xp','shards','brandOffers','combatOffer','roderikOffer','roderikScout','activeMission','campaign','heroSkin','ownedHeroSkins','vesperaOutfit','lootInventory'])assert.deepEqual(plain(next[key]),plain(h[key]),key);
 assert.throws(()=>m.start(next,id));assert.throws(()=>m.start(h,'stale'));assert.throws(()=>m.start({...h,level:52},id));assert.throws(()=>m.start({...h,level:49},id));assert.throws(()=>m.start({...h,energy:14.5},id));
 const scout=m.prepare({...hero(51),classId:'elf',profession:'elf-profession-1'}),discount=m.start(scout,scout.faelarOffer.id);assert.equal(discount.energy,92.5);assert.equal(discount.activeCombat.cost,7.5);
 assert.equal(m.start({...h,energy:0,nextEnergyResetAt:Date.now()-1},id).energy,85);
 for(const level of[75,76,119,120,250]){const veteran=m.prepare(hero(level));assert.ok(m.start(veteran,veteran.faelarOffer.id).activeCombat.reward.xp>0);}
});
test('All 25 saved battles resume, award fixed rewards once, count statistics and give zero resources after defeat',()=>{
 const r=runtime(),m=r.FaelarMissions,c=r.BrandCombat;
 for(const e of r.EldorBestiary.MONSTERS){
  const h={...hero(e.level),xp:r.Progression.required(e.level)-1,faelarOffer:{version:1,id:'contract',playerLevel:e.level,enemyId:e.id}},active=m.start(h,'contract'),f=active.activeCombat;active.activeCombat.battle.hero.attack=[73,73];assert.deepEqual(plain(c.tick(active,f.nextHitAt)),plain(c.tick(plain(active),f.nextHitAt)));assert.equal(m.prepare(active),active);assert.throws(()=>m.resolve(active,f.id));
  const winning=plain(active);winning.activeCombat.battle.hero.hp=winning.activeCombat.battle.hero.maxHp=1000000;winning.activeCombat.battle.hero.attack=[100000,100000];const won=c.skip(winning,f.id);assert.equal(won.gold,h.gold+f.reward.gold);assert.equal(won.level,e.level+1);assert.equal(won.xp,f.reward.xp-1);assert.equal(won.energy,85);assert.equal(won.activeCombat,null);assert.equal(won.lastFaelarCombat.enemyName,e.name);assert.equal(r.PlayerStats.totals(won).wins,1);assert.equal(r.PlayerStats.totals(won).missions,1);assert.throws(()=>c.finish(won,f.id));assert.deepEqual(plain(won.roderikScout),plain(h.roderikScout));
  const losing=plain(active);losing.activeCombat.battle.winner='enemy';const lost=c.finish(losing,f.id);assert.equal(lost.gold,h.gold);assert.equal(lost.xp,h.xp);assert.equal(lost.energy,85);assert.deepEqual(plain(lost.lastFaelarCombat.reward),{gold:0,xp:0});assert.equal(r.PlayerStats.totals(lost).losses,1);assert.equal(r.PlayerStats.totals(lost).missions,0);
 }
});
