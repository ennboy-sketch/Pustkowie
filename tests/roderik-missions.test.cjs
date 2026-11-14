const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const plain=value=>JSON.parse(JSON.stringify(value));
function runtime(){const r=vm.createContext({crypto});r.window=r;for(const name of ['progression','energy','gear-catalog','hero','combat','missions','choices','player-stats','frontier-bestiary','roderik-missions'])vm.runInContext(fs.readFileSync('dist/'+name+'.js','utf8'),r);return r;}
const hero=level=>({version:2,name:'Weteran',classId:'warrior',gender:'female',level,xp:123,gold:321,shards:17,energy:100,energyCycleHours:12,nextEnergyResetAt:Date.now()+36000000,brandOffers:[{id:'preserve'}],combatOffer:{sceneId:'forest',enemyId:'basilisk'},campaign:{version:1},vesperaOutfit:'queen',lootInventory:[]});
test('All 20 enemies appear only in Roderik contracts from level 31 onward, with the highest band retained above level 50',()=>{
 const r=runtime(),m=r.RoderikMissions;
 assert.equal(m.TIERS.easy.cost,10);assert.equal(m.TIERS.easy.enabled,true);assert.equal(m.TIERS.hard.cost,15);
 for(let level=1;level<=250;level++){
  const h=hero(level),pool=m.available(h);assert.ok(pool.every(e=>Math.abs(e.level-Math.min(level,50))<=3));
  if(level<31){assert.equal(pool.length,0);assert.equal(m.prepare(h),h);}
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
 const side={...h,activeMission:{id:'other-scout'},campaign:{accepted:['trophies']}},parallel=m.start(side,id);assert.equal(parallel.activeMission,side.activeMission);assert.equal(parallel.campaign,side.campaign);
 assert.equal(JSON.stringify(h),before);assert.throws(()=>m.start(next,id));assert.throws(()=>m.start(h,'stale'));assert.throws(()=>m.start({...h,level:32},id));
 for(const patch of [{activeCombat:{id:'busy'}},{energy:14.5}])assert.throws(()=>m.start({...h,...patch},id));
 const scout=m.prepare({...hero(31),classId:'elf',profession:'elf-profession-1'}),discount=m.start(scout,scout.roderikOffer.id);assert.equal(discount.energy,92.5);assert.equal(discount.activeCombat.cost,7.5);
 const due={...h,energy:0,nextEnergyResetAt:Date.now()-1};assert.equal(m.start(due,id).energy,85);
});
test('Every monster resumes deterministically and rewards victory exactly once; losses pay nothing',()=>{
 const r=runtime(),m=r.RoderikMissions,c=r.BrandCombat;
 for(const enemy of r.FrontierBestiary.MONSTERS){
  const h={...hero(enemy.level),xp:r.Progression.required(enemy.level)-1,roderikOffer:{version:1,id:'contract',playerLevel:enemy.level,enemyId:enemy.id}},active=m.start(h,'contract'),f=active.activeCombat;
  active.activeCombat.battle.hero.attack=[73,73];
  const tick=c.tick(active,f.nextHitAt),resumed=c.tick(plain(active),f.nextHitAt);assert.deepEqual(plain(tick),plain(resumed));
  assert.equal(m.prepare(active).activeCombat,active.activeCombat);assert.throws(()=>m.resolve(active,f.id));
  const winning=plain(active);winning.activeCombat.battle.hero.attack=[100000,100000];
  const won=c.skip(winning,f.id),reward=f.reward;assert.equal(won.energy,85);assert.equal(won.gold,h.gold+reward.gold);assert.equal(won.level,enemy.level+1);assert.equal(won.xp,reward.xp-1);
  assert.equal(won.lastRoderikCombat.won,true);assert.equal(won.lastRoderikCombat.enemyName,enemy.name);assert.equal(won.lastRoderikCombat.levelAfter,enemy.level+1);assert.deepEqual(plain(m.prepare({...won,level:90}).lastRoderikCombat),plain(won.lastRoderikCombat));assert.equal(won.activeCombat,null);assert.equal(r.PlayerStats.totals(won).missions,1);assert.equal(r.PlayerStats.totals(won).wins,1);
  assert.deepEqual(plain(won.combatOffer),plain(h.combatOffer));assert.throws(()=>c.finish(won,f.id));
  const losing=plain(active);losing.activeCombat.battle.winner='enemy';const lost=c.finish(losing,f.id);
  assert.equal(lost.gold,h.gold);assert.equal(lost.xp,h.xp);assert.equal(lost.level,h.level);assert.equal(lost.energy,85);assert.equal(r.PlayerStats.totals(lost).losses,1);assert.equal(r.PlayerStats.totals(lost).missions,0);
 }
});
test('Timed contracts persist through battles and side quests, preserve discounts, and reward exactly once after the deadline',()=>{
 const r=runtime(),m=r.RoderikMissions,now=Date.now(),h=m.prepare({...hero(31),activeMission:{id:'brand-scout'},campaign:{accepted:['trophies']}}),id=h.roderikScoutOffer.id;
 const scouting=m.startScout(h,id,now),s=scouting.roderikScout;assert.equal(s.durationMs,30*60000);assert.equal(scouting.energy,90);assert.deepEqual(plain(s.reward),{xp:605250,gold:2000});assert.equal(m.readScout(plain(scouting)).id,s.id);assert.equal(scouting.activeMission,h.activeMission);assert.equal(scouting.campaign,h.campaign);
 assert.throws(()=>m.startScout(scouting,id,now));assert.throws(()=>m.finishScout(scouting,s.id,s.endsAt-1));assert.throws(()=>m.finishScout(scouting,'stale',s.endsAt));
 const fighting=m.start(scouting,scouting.roderikOffer.id,now),fightId=fighting.activeCombat.id;assert.equal(fighting.energy,75);assert.equal(fighting.roderikScout.id,s.id);
 const returned=m.finishScout(plain(fighting),s.id,s.endsAt);assert.equal(returned.energy,75);assert.equal(returned.gold,h.gold+2000);assert.equal(returned.xp,h.xp+605250);assert.equal(returned.activeCombat.id,fightId);assert.equal(returned.activeMission.id,'brand-scout');assert.equal(returned.roderikScout,null);assert.equal(r.PlayerStats.totals(returned).missions,1);assert.throws(()=>m.finishScout(returned,s.id,s.endsAt));
 const next=m.prepare(returned);assert.ok(next.roderikScoutOffer);assert.equal(m.prepare(next),next);assert.equal(next.activeCombat.id,fightId);
 const again=m.startScout(next,next.roderikScoutOffer.id,s.endsAt);assert.equal(again.activeCombat.id,fightId);assert.equal(again.energy,65);
 const speedy=m.prepare({...hero(31),classId:'elf',profession:'elf-profession-1',warPony:true});const fast=m.startScout(speedy,speedy.roderikScoutOffer.id,now);assert.equal(fast.energy,95);assert.equal(fast.roderikScout.durationMs,27*60000);
 for(const changed of [{endsAt:s.endsAt+1},{reward:{xp:150001,gold:500}},{speedBonus:25},{levelAtStart:30}])assert.throws(()=>m.readScout({...scouting,roderikScout:{...s,...changed}}));
 assert.throws(()=>m.startScout({...h,level:30},id));assert.throws(()=>m.start({...h,level:30},h.roderikOffer.id));
 for(const level of [54,119,120,250]){const veteran=m.prepare(hero(level));assert.ok(m.start(veteran,veteran.roderikOffer.id).activeCombat.reward.xp>0);assert.ok(m.startScout(veteran,veteran.roderikScoutOffer.id).roderikScout);}
});

test('Scout duration increases at level 41 and generous rewards are fixed at acceptance, including legacy saves',()=>{
 const r=runtime(),m=r.RoderikMissions;
 for(const level of [31,40,41,50,51,120,250]){const h=m.prepare(hero(level)),s=m.startScout(h,h.roderikScoutOffer.id).roderikScout;assert.equal(s.durationMs,(level<=40?30:45)*60000);assert.equal(s.reward.gold,level<=40?2000:4000);assert.equal(s.reward.xp,Math.floor(r.Progression.required(Math.min(level,50))*(level<=40?.25:.35)));assert.equal(s.rewardVersion,2);}
 let h=m.prepare(hero(40));h=m.startScout(h,h.roderikScoutOffer.id);const s=h.roderikScout;assert.equal(m.readScout({...h,level:41}).durationMs,30*60000);const next=m.finishScout({...h,level:41},s.id,s.endsAt);assert.equal(next.gold,h.gold+s.reward.gold);assert.equal(next.xp,h.xp+s.reward.xp);
 const legacy={version:1,rewardVersion:1,id:'old',sceneId:'ash-wood',levelAtStart:31,startedAt:1,endsAt:1200001,durationMs:1200000,speedBonus:0,cost:10,reward:{xp:150000,gold:500}};const old={...hero(31),roderikScout:legacy};assert.equal(m.readScout(old),legacy);assert.equal(m.finishScout(old,'old',legacy.endsAt).gold,old.gold+500);
});
