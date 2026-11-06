const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');
function runtime() {
  const r = vm.createContext({ crypto: { getRandomValues: a => webcrypto.getRandomValues(a), randomUUID: () => webcrypto.randomUUID() } });
  r.window = r;
  for (const name of ['progression', 'energy', 'gear-catalog', 'hero', 'combat', 'missions', 'choices', 'tauriel']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../dist', name + '.js'), 'utf8'), r, { filename: name + '.js' });
  }
  return r;
}
const plain = value => JSON.parse(JSON.stringify(value));
const hero = level => ({ version: 2, name: 'Test', classId: 'warrior', gender: 'male', level, xp: 0, gold: 25, shards: 4, energy: 100, nextEnergyResetAt: Date.now() + 86400000 });
const scenes = ['forest', 'mine', 'undercity'];
function queue(r, values) {
  r.crypto.getRandomValues = a => { assert.ok(values.length, 'Unexpected extra random draw'); a[0] = values.shift(); return a; };
}
function verifyOffers(r, h) {
  assert.equal(h.brandOffers.length, 2);
  assert.equal(h.brandOffers[0].tier, 'easy'); assert.equal(h.brandOffers[1].tier, 'hard');
  assert.notEqual(h.brandOffers[0].id, h.brandOffers[1].id);
  for (const offer of h.brandOffers) {
    assert.ok(scenes.includes(offer.sceneId));
    if (offer.type !== 'combat') { assert.equal(offer.type, 'scout'); continue; }
    const enemy = r.BrandCombat.opponents(offer.sceneId).find(m => m.id === offer.enemyId);
    assert.ok(enemy); assert.ok(Math.abs(enemy.level - h.level) <= 3);
    assert.ok(r.BrandCombat.availableOpponents(h, offer.sceneId, offer.tier).some(m => m.id === enemy.id));
  }
}

test('level 5 draws monsters 2–8 inclusive; level 10 draws 7–13, excluding both adjacent out-of-range levels', () => {
  const c = runtime().BrandCombat;
  const get = level => scenes.flatMap(scene => c.availableOpponents(hero(level), scene));
  const at5 = get(5), at10 = get(10);
  assert.ok(at5.some(m => m.id === 'wolf' && m.level === 2));
  assert.ok(at5.some(m => m.id === 'tree-whisperer' && m.level === 8));
  assert.ok(!at5.some(m => m.id === 'boar' || m.id === 'forest-demoness'));
  assert.ok(at10.some(m => m.id === 'crystal-scorpion' && m.level === 7));
  assert.ok(at10.some(m => m.id === 'wraith-archer' && m.level === 13));
  assert.ok(!at10.some(m => m.id === 'bloodthirsty-flower' || m.id === 'abyss-bellringer'));
});

test('all player levels 1–250 and all locations obey the same ±3 rule, including low/high boundaries', () => {
  const c = runtime().BrandCombat;
  for (let level = 1; level <= 250; level++) for (const scene of scenes) {
    const h = hero(level), pool = c.availableOpponents(h, scene);
    for (const m of c.opponents(scene)) assert.equal(pool.some(candidate => candidate.id === m.id), m.level >= Math.max(1, level - 3) && m.level <= level + 3);
    for (const tier of ['easy', 'hard']) {
      const chosen = c.availableOpponents(h, scene, tier);
      assert.equal(chosen.length > 0, pool.length > 0);
      for (const m of chosen) assert.ok(Math.abs(m.level - level) <= 3);
    }
  }
  assert.equal(c.availableOpponents(hero(18), 'mine').some(m => m.id === 'magma-golem'), true);
  assert.equal(scenes.flatMap(scene => c.availableOpponents(hero(34), scene)).length, 0);
});

test('difficulty follows the player instead of a permanent level-2 cutoff; sparse pools use their appropriate edge', () => {
  const c = runtime().BrandCombat;
  const easy5 = c.availableOpponents(hero(5), 'forest', 'easy'), hard5 = c.availableOpponents(hero(5), 'forest', 'hard');
  assert.ok(easy5.some(m => m.level === 5)); assert.ok(easy5.every(m => m.level >= 2 && m.level <= 5));
  assert.ok(hard5.every(m => m.level > 5 && m.level <= 8));
  assert.deepEqual(plain(c.availableOpponents(hero(1), 'forest', 'easy').map(m => m.level)), [1]);
  assert.deepEqual(plain(c.availableOpponents(hero(15), 'mine', 'hard').map(m => m.level)), [17]);
  assert.deepEqual(plain(c.availableOpponents(hero(18), 'forest', 'hard').map(m => m.level)), [19,20,21]);
  assert.deepEqual(plain(c.availableOpponents(hero(8), 'undercity', 'hard').map(m => m.level)), [5]);
});

test('every level gets exactly an easy scout and a hard combat offer, even without matching monsters', () => {
  const r=runtime();
  for(let level=1;level<=120;level++)for(let draw=0;draw<10;draw++){
    const h=r.BrandChoices.prepare(hero(level));
    assert.deepEqual(plain(h.brandOffers.map(o=>[o.tier,o.type])),[['easy','scout'],['hard','combat']]);
    if(level<=33)verifyOffers(r,h);else{assert.equal(h.brandOffers[1].enemyId,null);assert.throws(()=>r.BrandChoices.accept(h,h.brandOffers[1].id));}
  }
});

test('normal offers are stable after reopening and JSON reload without any further random draws', () => {
  const r = runtime(); r.crypto.getRandomValues = a => { a[0] = 0; return a; };
  const prepared = r.BrandChoices.prepare(hero(5)), restored = plain(prepared);
  r.crypto.getRandomValues = () => { throw Error('Reopening must not reroll offers'); };
  assert.equal(r.BrandChoices.prepare(prepared), prepared);
  assert.equal(r.BrandChoices.prepare(restored), restored);
  assert.deepEqual(plain(prepared.brandOffers), restored.brandOffers);
});

test('old pending scout-only sets migrate once without consuming resources; changed player levels refresh pending offers', () => {
  const r = runtime(); r.crypto.getRandomValues = a => { a[0] = 0; return a; };
  const old = { ...hero(5), brandOffers: [{ id: 'old-easy', tier: 'easy', type: 'scout', sceneId: 'forest' }, { id: 'old-hard', tier: 'hard', type: 'scout', sceneId: 'mine' }] };
  const before = JSON.stringify(old), migrated = r.BrandChoices.prepare(old);
  assert.equal(JSON.stringify(old), before); verifyOffers(r, migrated);
  assert.ok(migrated.brandOffers.some(o => o.type === 'combat'));
  for (const field of ['gold', 'xp', 'energy', 'shards', 'nextEnergyResetAt']) assert.equal(migrated[field], old[field]);
  const updated = r.BrandChoices.prepare({ ...migrated, level: 10 }); verifyOffers(r, updated);
  assert.equal(updated.brandOffersLevel, 10); assert.notEqual(updated.brandOffers[0].id, migrated.brandOffers[0].id);
  assert.equal(r.BrandChoices.prepare(updated), updated);
  const scoutOnly = { ...migrated, brandOffers: old.brandOffers };
  assert.ok(r.BrandChoices.prepare(scoutOnly).brandOffers.some(o => o.type === 'combat'));
  assert.doesNotThrow(() => r.BrandChoices.prepare({ ...migrated, brandOffers: [null, null] }));
});

test('already active scouts and old out-of-range battles keep their saved progress, cost and reward', () => {
  const r = runtime(), c = r.BrandCombat;
  const scout = r.BrandMissions.start(hero(10), Date.now(), () => 'forest', () => ({ gold: 60, xp: 15400 }), { cost: 3, difficulty: 'easy' });
  assert.equal(r.BrandChoices.prepare(scout), scout);
  const old = { ...hero(5), energy: 95, activeCombat: { id: 'old-fight', cost: 5, sceneId: 'mine', battle: c.createBattle({ name: 'Test', classId: 'warrior', maxHp: 100, attack: [10000, 10000] }, c.opponents('mine').find(m => m.id === 'magma-golem'), 'hero'), reward: { gold: 100, xp: 300 }, nextHitAt: 0 } };
  assert.equal(r.BrandChoices.prepare(old), old);
  const won = c.skip(old, 'old-fight'); assert.equal(won.gold, 125); assert.equal(won.xp, 300); assert.equal(won.energy, 95);
});

test('acceptance enforces both ±3 boundaries before charging energy, including direct legacy combat entry', () => {
  const r = runtime();
  for (const id of ['boar', 'forest-demoness', 'forest-devourer']) {
    const h = { ...hero(5), brandOffers: [{ id: 'bad', tier: 'hard', type: 'combat', sceneId: 'forest', enemyId: id }], combatOffer: { sceneId: 'forest', enemyId: id } };
    const before = JSON.stringify(h);
    assert.throws(() => r.BrandChoices.accept(h, 'bad'));
    assert.throws(() => r.BrandCombat.start(h));
    assert.equal(JSON.stringify(h), before);
  }
  for (const [id, tier, energy] of [['wolf', 'easy', 97], ['tree-whisperer', 'hard', 95]]) {
    const h = { ...hero(5), brandOffers: [{ id: 'good', tier, type: 'combat', sceneId: 'forest', enemyId: id }] };
    const started = r.BrandChoices.accept(h, 'good'); assert.equal(started.energy, energy); assert.equal(started.activeCombat.battle.enemy.id, id);
    assert.throws(() => r.BrandChoices.accept(started, 'good')); assert.equal(started.energy, energy);
  }
});

test('legacy preview rerolls an obsolete enemy inside ±3, preserves a valid one, and never assigns an empty location', () => {
  const r = runtime(); r.crypto.getRandomValues = a => { a[0] = 0; return a; };
  const old = { ...hero(10), combatOffer: { sceneId: 'undercity', enemyId: 'mud-snake' } };
  const prepared = r.BrandCombat.prepare(old), enemy = r.BrandCombat.opponents(prepared.combatOffer.sceneId).find(m => m.id === prepared.combatOffer.enemyId);
  assert.notEqual(prepared.combatOffer.sceneId, 'undercity'); assert.ok(enemy.level >= 7 && enemy.level <= 13);
  assert.equal(r.BrandCombat.prepare(prepared), prepared);
});
test('levels 26–35 retain one easy 20-minute scout with fixed rewards; old extra offers migrate once',()=>{
 const r=runtime();
 for(let level=26;level<=35;level++){
  const ready=r.BrandChoices.prepare(hero(level));assert.equal(ready.brandOffers.length,2);assert.equal(ready.brandTimedOffers,null);
  const offer=ready.brandOffers[0],active=r.BrandChoices.accept(ready,offer.id),m=active.activeMission;
  assert.equal(m.durationMs,1200000);assert.equal(m.reward.xp,150000);assert.equal(m.reward.gold,500);assert.equal(m.shardChance,10);assert.equal(active.energy,97);
  const done=r.BrandMissions.finish(active,m.endsAt);assert.throws(()=>r.BrandChoices.accept(done,offer.id));
 }
 const old={...hero(26),brandOffersVersion:1,brandOffersLevel:26,brandOffers:[{id:'old1',tier:'easy',type:'combat',sceneId:'forest',enemyId:'hill-giant'},{id:'old2',tier:'hard',type:'scout',sceneId:'mine',enemyId:null}],brandTimedOffers:[{id:'extra',tier:'easy',type:'scout',sceneId:'forest',enemyId:null}]};
 const next=r.BrandChoices.prepare(old);assert.equal(next.brandTimedOffers,null);assert.equal(next.brandOffers.length,2);assert.equal(next.brandOffers[0].type,'scout');assert.equal(next.brandOffers[1].type,'combat');assert.equal(next.energy,100);assert.equal(next.gold,25);assert.equal(r.BrandChoices.prepare(next),next);assert.throws(()=>r.BrandChoices.accept(next,'extra'));
});
