const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{webcrypto}=require('node:crypto');
const read=name=>fs.readFileSync(`dist/${name}.js`,'utf8');
const plain=value=>JSON.parse(JSON.stringify(value));
function runtime(){const r=vm.createContext({crypto:webcrypto,localStorage:new Proxy({},{get(){throw Error('Prepared content must not read or write saves');}})});r.window=r;for(const name of ['progression','energy','gear-catalog','hero','combat','missions','choices','frontier-bestiary'])vm.runInContext(read(name),r);return r;}
test('Exactly one prepared monster for each level 31–50, five complete locations and no ID collisions',()=>{
  const r=runtime(),b=r.FrontierBestiary,old=['forest','mine','undercity'].flatMap(id=>r.BrandCombat.opponents(id));
  assert.equal(b.STATUS,'prepared');assert.equal(b.MISSION_POOL_ENABLED,false);assert.equal(b.MONSTERS.length,20);assert.equal(b.LOCATIONS.length,5);
  assert.equal(new Set(old.concat(b.MONSTERS).map(e=>e.id)).size,old.length+20);
  assert.deepEqual(plain(b.MONSTERS.map(e=>e.level)),Array.from({length:20},(_,i)=>31+i));
  for(const place of b.LOCATIONS){const group=b.MONSTERS.filter(e=>e.sceneId===place.id);assert.equal(group.length,4);assert.equal(group[0].level,place.levels[0]);assert.equal(group[3].level,place.levels[1]);assert.ok(fs.existsSync('dist/'+place.image));}
  for(const e of b.MONSTERS){assert.ok(e.contractTitle&&e.description&&e.traits);assert.ok(fs.existsSync('dist/'+e.image));assert.ok(e.attack[1]>=e.attack[0]);assert.equal(e.stats.length,4);assert.ok([...e.stats,e.maxHp,...e.attack].every(n=>Number.isSafeInteger(n)&&n>0));assert.ok(Object.isFrozen(e)&&Object.isFrozen(e.reward)&&Object.isFrozen(e.attack));assert.equal(b.atLevel(e.level),e);}
  assert.equal(b.atLevel(30),null);assert.equal(b.atLevel(51),null);assert.throws(()=>b.get('__proto__'));
});
test('Rewards follow real level thresholds, cap weaker targets and preserve exact advancement carry-over',()=>{
  const r=runtime(),b=r.FrontierBestiary,p=r.Progression;
  assert.deepEqual(plain(b.rewardFor(b.atLevel(31).id)),{gold:300,xp:435780});assert.deepEqual(plain(b.rewardFor(b.atLevel(50).id)),{gold:795,xp:2761200});
  for(const enemy of b.MONSTERS){
    assert.equal(enemy.reward.xp,p.required(enemy.level)*18/100);
    assert.equal(Math.ceil(p.required(enemy.level)/enemy.reward.xp),6);
    for(let level=28;level<=53;level++){
      const reward=b.rewardFor(enemy.id,level);assert.equal(reward.xp,Math.floor(Math.min(p.required(level),p.required(enemy.level))*.18));assert.equal(reward.gold,enemy.reward.gold);assert.ok(reward.xp<=p.required(level)*.18);
      const hero={level,xp:p.required(level)-1,gold:123,energy:77},before=JSON.stringify(hero),next=p.award(hero,reward.xp);
      assert.equal(next.level,level+1);assert.equal(next.xp,reward.xp-1);assert.equal(next.gold,123);assert.equal(next.energy,77);assert.equal(JSON.stringify(hero),before);
      reward.xp=1;assert.equal(enemy.reward.xp,p.required(enemy.level)*.18);
    }
  }
  for(const level of [0,-1,31.5,'31',120,250,NaN])assert.throws(()=>b.rewardFor(b.atLevel(31).id,level));
});
test('Prepared content never enters existing Brand/tavern offers, scenes, runtime or saves',()=>{
  const r=runtime(),b=r.FrontierBestiary,ids=new Set(b.MONSTERS.map(e=>e.id));
  for(let level=1;level<=60;level++)for(const scene of ['forest','mine','undercity'])for(const tier of [undefined,'easy','hard'])assert.ok(r.BrandCombat.availableOpponents({level},scene,tier).every(e=>!ids.has(e.id)));
  const sources=['index.html','tavern.js','missions.js','choices.js','combat.js','hub.js'].map(n=>fs.readFileSync('dist/'+n,'utf8'));
  for(const source of sources)assert.ok(!/frontier-bestiary|FrontierBestiary/.test(source));
  for(const place of b.LOCATIONS)assert.throws(()=>r.BrandCombat.opponents(place.id));
});
test('All 20 creatures run in the shared combat engine with deterministic save/resume and lethal resolution',()=>{
  const r=runtime(),c=r.BrandCombat,b=r.FrontierBestiary;
  for(const enemy of b.MONSTERS){
    const target={name:'Cel testowy',classId:'warrior',maxHp:100000,stats:[1,1,1,1],attack:[1,1],armor:5};
    let battle=c.createBattle(target,enemy,'enemy');
    for(let turn=1;turn<=6;turn++){
      const restored=plain(battle),hit=c.advance(battle,actor=>actor.attack[0]),resumed=c.advance(restored,actor=>actor.attack[0]);
      assert.deepEqual(plain(hit),plain(resumed),enemy.id);assert.equal(hit.lastHit.element,enemy.attackElement||'physical');assert.equal(hit.enemy.attackCount,turn);assert.ok(hit.lastHit.damage>0);
      if(enemy.special&&turn%enemy.special.every===0){assert.equal(hit.lastHit.ability,enemy.special.ability,enemy.id);if(enemy.special.type==='dot')assert.equal(hit.hero.poisonEffect.damage,enemy.special.damage);}
      battle=c.advance(hit,actor=>actor.attack[0]);
    }
    const death=c.advance(c.createBattle({...target,maxHp:1},enemy,'enemy'),actor=>actor.attack[0]);assert.equal(death.winner,'enemy');
    const win=c.advance(c.createBattle({...target,attack:[100000,100000]},enemy,'hero'),actor=>actor.attack[0]);assert.equal(win.winner,'hero');
    assert.equal(enemy.hp,undefined);assert.equal(enemy.attackCount,undefined);
  }
});
