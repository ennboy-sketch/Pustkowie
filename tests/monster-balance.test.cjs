const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{webcrypto}=require('node:crypto');
// Values imported by ID from the user's workbook. Base stats retain the pre-boost cells.
const expected=require('./monster-balance.expected.json');
const plain=v=>JSON.parse(JSON.stringify(v));
function runtime(){const r=vm.createContext({crypto:webcrypto});r.window=r;for(const n of ['progression','energy','gear-catalog','hero','combat','missions','choices','tauriel'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist',n+'.js'),'utf8'),r);return r;}
const scenes={'Mroczny Las':'forest','Stara Kopalnia':'mine','Podziemia Miasta':'undercity'};
test('all 32 workbook IDs have exact fixed rewards and precisely one 10% boost, rounded up',()=>{
  const r=runtime(),actual=[...Object.values(scenes).flatMap(s=>r.BrandCombat.opponents(s)),...r.TaurielQuest.BANDITS];
  assert.equal(actual.length,32);assert.equal(new Set(actual.map(m=>m.id)).size,32);
  assert.deepEqual(actual.map(m=>m.id).sort(),expected.map(m=>m.id).sort());
  for(const row of expected){
    const m=actual.find(m=>m.id===row.id);
    assert.equal(m.name,row.name);assert.equal(m.level,row.level);
    assert.equal(m.maxHp,row.hp,row.id+' HP');assert.equal(m.maxHp,Math.ceil(row.baseHp*11/10));
    assert.deepEqual(plain(m.attack),row.attack,row.id+' attack');
    assert.deepEqual(plain(m.attack),row.baseAttack.map(v=>Math.ceil(v*11/10)));
    assert.deepEqual(plain(m.reward),row.reward,row.id+' reward');
    if(scenes[row.location])assert.equal(r.BrandCombat.opponents(scenes[row.location]).some(m=>m.id===row.id),true);
  }
});
test('every Brand monster pays the workbook rewards exactly once after a win and nothing after defeat',()=>{
  const r=runtime(),c=r.BrandCombat;
  for(const row of expected.filter(row=>scenes[row.location]))for(const won of [true,false]){
    const h={version:2,name:'Import',classId:'warrior',gender:'female',level:row.level,xp:0,gold:25,energy:100,combatOffer:{sceneId:scenes[row.location],enemyId:row.id}};
    const started=c.start(h),id=started.activeCombat.id;
    assert.deepEqual(plain(started.activeCombat.reward),row.reward);
    started.activeCombat.battle.hero.maxHp=started.activeCombat.battle.hero.hp=won?10000:1;
    started.activeCombat.battle.hero.attack=won?[1000,1000]:[1,1];
    started.activeCombat.battle.next=won?'hero':'enemy';
    const done=c.skip(started,id);
    assert.equal(done.lastCombat.won,won,row.id);
    assert.equal(done.gold,25+(won?row.reward.gold:0));assert.equal(done.xp,won?row.reward.xp:0);
    assert.equal(done.activeCombat,null);assert.throws(()=>c.skip(done,id));assert.throws(()=>c.finish(done,id));
  }
});
