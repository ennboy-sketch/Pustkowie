const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{webcrypto}=require('node:crypto');
function runtime(){
 const r=vm.createContext({crypto:webcrypto});r.window=r;
 for(const n of ['progression','energy','gear-catalog','hero','wheel','combat','missions','gabriel-training','graveyard','tauriel'])
   vm.runInContext(fs.readFileSync('dist/'+n+'.js','utf8'),r,{filename:n+'.js'});
 return r;
}
const plain=value=>JSON.parse(JSON.stringify(value));
const hero=classId=>({version:2,name:'Bohater',classId,gender:'male',level:10,xp:0,gold:100,energy:100,shards:0,nextEnergyResetAt:Date.now()+86400000});
test('Main attributes grant exactly +1 damage per point for warrior, dwarf, elf and mage',()=>{
 const r=runtime();
 for(const [classId,key] of [['warrior','strength'],['dwarf','strength'],['elf','agility'],['mage','intelligence']]){
  const h=hero(classId),before=r.BrandCombat.profile(h),after=r.BrandCombat.profile({...h,statAllocations:{[key]:1}});
  assert.deepEqual(plain(after.attack),before.attack.map(n=>n+1),classId);
  const wrong=key==='strength'?'agility':'strength';
  assert.deepEqual(plain(r.BrandCombat.profile({...h,statAllocations:{[wrong]:1}}).attack),plain(before.attack),classId);
 }
});
test('Endurance grants +10 HP in every class; intelligence grants +10 mana and +1 magic damage in mage',()=>{
 const r=runtime();
 for(const classId of ['warrior','dwarf','elf','mage']){
  const h=hero(classId),before=r.BrandCombat.profile(h);
  const after=r.BrandCombat.profile({...h,statAllocations:{endurance:1}});
  assert.equal(after.maxHp-before.maxHp,10,classId);
  assert.deepEqual(plain(after.attack),plain(before.attack),classId);
 }
 const h=hero('mage'),base=r.BrandCombat.profile(h),buffed=r.BrandCombat.profile({...h,statAllocations:{intelligence:1}});
 assert.equal(buffed.maxMana-base.maxMana,10);
 assert.deepEqual(plain(buffed.attack),base.attack.map(n=>n+1));
});
test('Mage with insufficient mana uses the strength-based wand attack; with mana uses intelligence-based spells',()=>{
 const r=runtime(),c=r.BrandCombat;
 const p=c.profile(hero('mage')),enemy={name:'Tarcza testowa',maxHp:9999,attack:[1,1],stats:[1,1,1,1]};
 const battle=c.createBattle(p,enemy,'hero');
 battle.hero.attack=[80,80];battle.hero.meleeAttack=[9,9];
 const without={...battle,hero:{...battle.hero,mana:0}},h=hero('mage');
 const done=c.tick({...h,activeCombat:{id:'test',battle:without,nextHitAt:0}},0).activeCombat.battle;
 assert.equal(done.lastHit.element,'physical');
 assert.equal(done.lastHit.ability,'wand');
 assert.equal(done.lastHit.damage,9);
 assert.equal(done.hero.mana,0);
 const cast=c.tick({...h,activeCombat:{id:'test',battle,nextHitAt:0}},0).activeCombat.battle;
 assert.equal(cast.lastHit.element,'fire');
 assert.equal(cast.lastHit.damage,80);
 assert.equal(cast.hero.mana,battle.hero.mana-10);
 const boosted=c.profile({...h,statAllocations:{strength:1}});
 assert.deepEqual(plain(boosted.meleeAttack),p.meleeAttack.map(n=>n+1));
 assert.deepEqual(plain(boosted.attack),plain(p.attack));
});
test('All four encounter sources use the same primary-attribute attack ranges',()=>{
 const r=runtime(),c=r.BrandCombat;
 for(const classId of ['warrior','dwarf','elf','mage']){
  const h=hero(classId),expected=plain(c.profile(h).attack),enemy=c.availableOpponents(h,'forest')[0];
  const brand=c.start({...h,combatOffer:{sceneId:'forest',enemyId:enemy.id}});
  const gabriel=r.GabrielTraining.begin(r.GabrielTraining.accept(h));
  const tauriel=r.TaurielQuest.beginFight(r.TaurielQuest.accept(h),0);
  const graveyard=r.Graveyard.start({...h,gabrielQuest:{status:'completed',dummies:3,recovered:3}},0);
  for(const fight of [brand,gabriel,tauriel,graveyard])assert.deepEqual(plain(fight.activeCombat.battle.hero.attack),expected,classId);
 }
});
test('Legacy saved fights without new wand fields remain playable with existing damage',()=>{
 const r=runtime(),c=r.BrandCombat,enemy={name:'Cel',maxHp:9999,attack:[1,1]};
 const fight=c.createBattle({name:'Mag',classId:'mage',maxHp:100,stats:[3,5,12,6],maxMana:120,attack:[15,15]},enemy,'hero');
 fight.hero.mana=0;
 const result=c.tick({...hero('mage'),activeCombat:{id:'legacy',battle:fight,nextHitAt:0}},0);
 assert.equal(result.activeCombat.battle.lastHit.damage,15);
 assert.equal(result.activeCombat.battle.lastHit.ability,'wand');
});
