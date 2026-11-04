const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),{webcrypto}=require('node:crypto');
function runtime(){const r=vm.createContext({crypto:webcrypto});r.window=r;for(const n of ['progression','energy','gear-catalog','hero','wheel','combat','missions','choices','tauriel'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist',n+'.js'),'utf8'),r);return r;}
const hero=()=>({version:2,name:'Test',classId:'warrior',gender:'female',level:5,statAllocations:{endurance:17},gold:25,xp:0,energy:100,nextEnergyResetAt:Date.now()+86400000});
test('all three Tauriel enemies pay wins once, pay nothing on losses, preserve energy and unlock the necklace only after three wins',()=>{
  const r=runtime();let h=r.TaurielQuest.accept(hero()),gold=25,xp=0;
  for(let i=0;i<3;i++){
    const active=r.TaurielQuest.beginFight(h,i),lost=JSON.parse(JSON.stringify(active));
    const reward=r.TaurielQuest.BANDITS[i].reward;
    assert.equal(active.activeCombat.battle.enemy.id,r.TaurielQuest.BANDITS[i].id);
    assert.deepEqual(JSON.parse(JSON.stringify(active.activeCombat.reward)),JSON.parse(JSON.stringify(reward)));
    lost.activeCombat.battle.hero.hp=1;lost.activeCombat.battle.next='enemy';
    const loss=r.BrandCombat.skip(lost,lost.activeCombat.id);
    assert.equal(loss.lastTaurielBattle.won,false);assert.equal(loss.taurielQuest.defeated.length,i);
    assert.equal(loss.energy,100);assert.equal(loss.gold,gold);assert.equal(loss.xp,xp);assert.equal(loss.activeCombat,null);
    assert.throws(()=>r.BrandCombat.skip(loss,lost.activeCombat.id));
    h=r.BrandCombat.skip(active,active.activeCombat.id);gold+=reward.gold;xp+=reward.xp;
    assert.equal(h.lastTaurielBattle.won,true);assert.equal(h.taurielQuest.defeated.length,i+1);
    assert.equal(h.energy,100);assert.equal(h.gold,gold);assert.equal(h.xp,xp);
    assert.deepEqual(JSON.parse(JSON.stringify(h.lastTaurielBattle.reward)),JSON.parse(JSON.stringify(reward)));
    assert.throws(()=>r.BrandCombat.skip(h,active.activeCombat.id));
  }
  assert.equal(gold,225);assert.equal(xp,3700);assert.equal(r.TaurielQuest.canEnter(h),true);
  const claimed=r.TaurielQuest.claim(h);
  assert.equal(claimed.lootInventory.filter(x=>x.id==='tauriel-emerald-necklace').length,1);
  assert.equal(claimed.gold,gold);assert.equal(claimed.xp,xp);assert.throws(()=>r.TaurielQuest.claim(claimed));
});
test('a Tauriel fight saved before the balance update keeps its original zero reward',()=>{
  const r=runtime(),h=r.TaurielQuest.beginFight(r.TaurielQuest.accept(hero()),0);
  h.activeCombat.reward={gold:0,xp:0};
  const done=r.BrandCombat.skip(h,h.activeCombat.id);
  assert.equal(done.lastTaurielBattle.won,true);assert.equal(done.gold,25);assert.equal(done.xp,0);
});
test('Tauriel victory uses normal level-up rules and keeps EXP overflow',()=>{
  const r=runtime(),base={...hero(),xp:4200},active=r.TaurielQuest.beginFight(r.TaurielQuest.accept(base),0);
  const done=r.BrandCombat.skip(active,active.activeCombat.id);
  assert.equal(done.lastTaurielBattle.won,true);assert.equal(done.level,6);assert.equal(done.xp,1100);
  assert.equal(done.gold,75);assert.equal(base.xp,4200);assert.equal(active.activeCombat.reward.xp,1200);
});
