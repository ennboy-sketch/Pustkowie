const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const plain=value=>JSON.parse(JSON.stringify(value));
function runtime(){const r=vm.createContext({crypto,localStorage:new Proxy({},{get(){throw Error('Prepared catalog must not access saves');}})});r.window=r;for(const name of ['progression','energy','gear-catalog','hero','combat','missions','choices','frontier-bestiary','roderik-missions','graveyard','gabriel-training','tauriel','campaign','eldor-bestiary'])vm.runInContext(fs.readFileSync('dist/'+name+'.js','utf8'),r);return r;}
test('Exactly 25 unique species, one per level 51–75, five complete connected regions and original art',()=>{
 const r=runtime(),b=r.EldorBestiary;
 assert.equal(b.STATUS,'prepared');assert.equal(b.MISSION_POOL_ENABLED,false);assert.equal(b.MONSTERS.length,25);assert.equal(b.LOCATIONS.length,5);
 assert.deepEqual(plain(b.MONSTERS.map(e=>e.level)),Array.from({length:25},(_,i)=>51+i));assert.equal(new Set(b.MONSTERS.map(e=>e.species)).size,25);
 const old=['forest','mine','undercity'].flatMap(id=>r.BrandCombat.opponents(id)).concat(r.FrontierBestiary.MONSTERS,r.Graveyard.BOSSES,r.TaurielQuest.BANDITS,r.OathCampaign.ACTIVITIES.filter(a=>a.kind==='fight').map(a=>a.enemy));
 for(const field of ['id','name']){const used=new Set(old.map(e=>e[field]));assert.equal(new Set(b.MONSTERS.map(e=>e[field])).size,25);for(const e of b.MONSTERS)assert.ok(!used.has(e[field]),e[field]);}
 for(const place of b.LOCATIONS){const group=b.MONSTERS.filter(e=>e.sceneId===place.id);assert.equal(group.length,5);assert.deepEqual(plain([group[0].level,group[4].level]),plain(place.levels));assert.ok(place.connection&&place.description);assert.ok(fs.existsSync('dist/'+place.image));}
 assert.match(b.LOCATIONS[0].connection,/Eldor/);assert.match(b.LOCATIONS[4].connection,/Lodowe Wzgórza/);
 for(const e of b.MONSTERS){assert.ok(e.contractTitle&&e.description&&e.traits);assert.ok(fs.existsSync('dist/'+e.image));assert.equal(e.columns,3);assert.equal(e.rows,2);assert.ok(e.tile>=0&&e.tile<5);assert.ok(Object.isFrozen(e)&&Object.isFrozen(e.stats)&&Object.isFrozen(e.reward));assert.equal(b.atLevel(e.level),e);assert.ok([e.maxHp,...e.stats,...e.attack].every(n=>Number.isSafeInteger(n)&&n>0));}
 assert.equal(b.atLevel(50),null);assert.equal(b.atLevel(76),null);assert.throws(()=>b.get('__proto__'));
});
test('Planned EXP uses real progression thresholds, caps both sides and carries correctly through advancement',()=>{
 const r=runtime(),b=r.EldorBestiary,p=r.Progression;
 assert.deepEqual(plain(b.atLevel(51).reward),{gold:850,xp:3036600});assert.deepEqual(plain(b.atLevel(75).reward),{gold:2690,xp:24660000});
 for(const e of b.MONSTERS)for(let level=48;level<=78;level++){
  const reward=b.rewardFor(e.id,level);assert.equal(reward.xp,Math.floor(Math.min(p.required(level),p.required(e.level))*18/100));assert.equal(reward.gold,e.reward.gold);
  const h={level,xp:p.required(level)-1,gold:123,energy:77},next=p.award(h,reward.xp);assert.equal(next.level,level+1);assert.equal(next.xp,reward.xp-1);assert.equal(next.gold,123);assert.equal(next.energy,77);
  reward.xp=0;assert.ok(e.reward.xp>0);
 }
 for(const level of [0,-1,51.5,'51',120,250,NaN])assert.throws(()=>b.rewardFor(b.atLevel(51).id,level));
});
test('Prepared content is isolated from active runtime, maps, providers, mission pools and saves',()=>{
 const r=runtime(),b=r.EldorBestiary,ids=new Set(b.MONSTERS.map(e=>e.id));
 for(let level=1;level<=250;level++){
  for(const scene of ['forest','mine','undercity'])assert.ok(r.BrandCombat.availableOpponents({level},scene).every(e=>!ids.has(e.id)));
  assert.ok(r.RoderikMissions.available({level}).every(e=>!ids.has(e.id)));
 }
 for(const file of ['index.html','hub.js','combat.js','missions.js','choices.js','roderik-missions.js','campaign.js'])assert.ok(!/eldor-bestiary|EldorBestiary/.test(fs.readFileSync('dist/'+file,'utf8')),file);
 for(const place of b.LOCATIONS)assert.throws(()=>r.BrandCombat.opponents(place.id));
 assert.equal(b.start,undefined);assert.equal(b.resolve,undefined);assert.equal(b.finish,undefined);
});
test('All creatures use supported combat rules, serialize cleanly and resolve simulations without changing catalogs',()=>{
 const r=runtime(),b=r.EldorBestiary,c=r.BrandCombat;
 for(const e of b.MONSTERS){
  const target={name:'Test',classId:'warrior',maxHp:1000000,stats:[1,1,1,1],attack:[1,1],armor:5};let battle=c.createBattle(target,e,'enemy');
  for(let turn=1;turn<=6;turn++){
   const next=c.advance(battle,actor=>actor.attack[0]),restored=c.advance(plain(battle),actor=>actor.attack[0]);assert.deepEqual(plain(next),plain(restored));assert.ok(next.lastHit.damage>0);assert.equal(next.lastHit.element,e.attackElement||'physical');assert.equal(next.enemy.attackCount,turn);
   if(e.special&&turn%e.special.every===0){assert.equal(next.lastHit.ability,e.special.ability,e.id);if(e.special.type==='dot')assert.equal(next.hero.poisonEffect.damage,e.special.damage);}
   battle=c.advance(next,actor=>actor.attack[0]);
  }
  assert.equal(c.advance(c.createBattle({...target,maxHp:1},e,'enemy'),actor=>actor.attack[0]).winner,'enemy');assert.equal(c.advance(c.createBattle({...target,attack:[100000,100000]},e,'hero'),actor=>actor.attack[0]).winner,'hero');assert.equal(e.hp,undefined);assert.equal(e.attackCount,undefined);
 }
});
