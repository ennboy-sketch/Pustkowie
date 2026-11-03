const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');

function runtime() {
  const ctx = vm.createContext({ crypto: { getRandomValues: a => webcrypto.getRandomValues(a), randomUUID: () => webcrypto.randomUUID() } });
  ctx.window = ctx;
  for (const name of ['progression', 'energy', 'gear-catalog', 'hero', 'combat', 'missions', 'choices', 'tauriel']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../dist', name + '.js'), 'utf8'), ctx, { filename: name + '.js' });
  }
  return ctx;
}
const plain = value => JSON.parse(JSON.stringify(value));
const player = { name: 'Bohater', classId: 'warrior', maxHp: 10000, attack: [1, 1], stats: [12, 5, 3, 10] };
const monster = c => c.opponents('mine').find(m => m.id === 'abyss-bellringer');
const minimumHit = actor => actor.attack[0];
function fourthAttack(c, target = player, raw = 32) {
  const b = c.createBattle(target, monster(c), 'enemy');
  b.enemy.attackCount = 3;
  const before = JSON.stringify(b), result = c.advance(b, () => raw);
  assert.equal(JSON.stringify(b), before);
  return result;
}

test('bellringer: balanced stats, fixed rewards and existing mine/level/difficulty rules', () => {
  const r = runtime(), c = r.BrandCombat, m = monster(c);
  assert.equal(m.name, 'Dzwonnik Otchłani'); assert.equal(m.level, 14); assert.equal(m.maxHp, 390);
  assert.deepEqual(plain(m.attack), [32, 43]); assert.deepEqual(plain(m.reward), { gold: 90, xp: 280 });
  for (const scene of ['forest', 'undercity']) assert.equal(c.opponents(scene).some(m => m.id === 'abyss-bellringer'), false);
  for (let level = 1; level <= 26; level++) {
    const hero = { version: 2, name: 'Test', classId: 'warrior', gender: 'male', level, gold: 25, energy: 100,
      brandOffers: [{ id: 'offer', type: 'combat', sceneId: 'mine', tier: 'hard', enemyId: m.id }] };
    const available = level >= 5 && level <= 15;
    assert.equal(c.availableOpponents(hero, 'mine', 'hard').some(m => m.id === 'abyss-bellringer'), available);
    assert.equal(c.availableOpponents(hero, 'mine', 'easy').some(m => m.id === 'abyss-bellringer'), false);
    if (!available) { assert.throws(() => r.BrandChoices.accept(hero, 'offer')); continue; }
    const started = r.BrandChoices.accept(hero, 'offer');
    assert.equal(started.energy, 95); assert.deepEqual(plain(started.activeCombat.reward), { gold: 90, xp: 280 });
  }
});

test('echo: every fourth own attack adds exactly 12 magic damage without another attack or mana cost', () => {
  const c = runtime().BrandCombat;
  for (const first of ['hero', 'enemy']) {
    let b = c.createBattle({ ...player, classId: 'mage', maxMana: 120 }, monster(c), first);
    if (first === 'hero') b = c.advance(b, minimumHit);
    for (let n = 1; n <= 12; n++) {
      const manaBefore = b.hero.mana, hpBefore = b.hero.hp;
      b = c.advance(b, minimumHit);
      assert.equal(b.enemy.attackCount, n); assert.equal(b.hero.mana, manaBefore);
      assert.equal(b.lastHit.damage, n % 4 === 0 ? 44 : 32);
      assert.equal(b.hero.hp, hpBefore - b.lastHit.damage);
      assert.equal(b.lastHit.magicWave?.damage ?? 0, n % 4 === 0 ? 12 : 0);
      assert.equal(b.lastHit.ability === 'abyss-echo', n % 4 === 0);
      b = c.advance(b, minimumHit);
    }
  }
  assert.equal(fourthAttack(c, player, 43).lastHit.damage, 55);
});

test('echo: bypasses physical armor/resistance, while general armor reduces each component separately', () => {
  const c = runtime().BrandCombat;
  let hit = fourthAttack(c, { ...player, physicalArmor: 20, physicalResistance: 25 });
  assert.equal(hit.lastHit.damage, 21); assert.equal(hit.lastHit.magicWave.damage, 12); // floor((32-20)*0.75)+12.
  hit = fourthAttack(c, { ...player, armor: 5, physicalArmor: 10, physicalResistance: 20 });
  assert.equal(hit.lastHit.damage, 20); assert.equal(hit.lastHit.absorbed, 15);
  assert.equal(hit.lastHit.magicWave.absorbed, 5); assert.equal(hit.lastHit.magicWave.damage, 7);
  hit = fourthAttack(c, { ...player, armor: 999 });
  assert.equal(hit.lastHit.damage, 2); assert.equal(hit.lastHit.magicWave.damage, 1);
});

test('echo: magical vulnerability affects only the wave, physical resistance only the ordinary hit', () => {
  const hit = fourthAttack(runtime().BrandCombat, { ...player, physicalResistance: 15, magicVulnerability: 20 });
  assert.equal(hit.lastHit.damage, 41); // floor(32*0.85) + 12 + floor(12*0.2).
  assert.equal(hit.lastHit.magicWave.damage, 14); assert.equal(hit.lastHit.magicWave.bonus, 2);
  assert.equal(hit.lastHit.resisted, 5);
});

test('echo: actual damage is capped at remaining HP and the wave cannot hit an already dead target', () => {
  const c = runtime().BrandCombat;
  for (const [hp, wave] of [[35, 3], [32, 0], [30, 0], [1, 0]]) {
    const hit = fourthAttack(c, { ...player, maxHp: hp });
    assert.equal(hit.hero.hp, 0); assert.equal(hit.winner, 'enemy');
    assert.equal(hit.lastHit.damage, hp); assert.equal(hit.lastHit.magicWave.damage, wave);
    assert.equal(c.advance(hit, minimumHit), hit);
  }
});

test('echo: poison resolves first and can prevent the fourth attack entirely', () => {
  const c = runtime().BrandCombat;
  let b = c.createBattle(player, monster(c), 'enemy'); b.enemy.attackCount = 3;
  b.enemy.hp = 5; b.enemy.poisonEffect = { damage: 3, turns: 2, label: 'Trucizna' };
  let hit = c.advance(b, minimumHit);
  assert.equal(hit.enemy.hp, 2); assert.equal(hit.enemy.attackCount, 4);
  assert.equal(hit.lastHit.magicWave.damage, 12); assert.equal(hit.lastHit.poisonTick.damage, 3);
  b.enemy.hp = 3;
  hit = c.advance(b, () => { throw Error('Dead bellringer cannot attack'); });
  assert.equal(hit.enemy.hp, 0); assert.equal(hit.winner, 'hero'); assert.equal(hit.enemy.attackCount, 3);
  assert.equal(hit.lastHit.ability, 'poison-tick'); assert.equal(hit.lastHit.magicWave, undefined);
});

test('bellringer: saving before/after the echo, normal play and skip agree on wins/losses and exact once-only rewards', () => {
  const c = runtime().BrandCombat;
  for (const win of [true, false]) for (const stopAfter of [6, 8]) {
    const hero = { version: 2, name: 'Test', classId: 'warrior', gender: 'male', level: 8, xp: 0, gold: 25, shards: 4, energy: 100,
      combatOffer: { sceneId: 'mine', enemyId: 'abyss-bellringer' } };
    let normal = c.start(hero), b = normal.activeCombat.battle;
    b.hero.maxHp = b.hero.hp = win ? 10000 : 150;
    b.hero.attack = win ? [20, 20] : [1, 1]; b.enemy.attack = [32, 32];
    for (let n = 0; n < stopAfter; n++) normal = c.tick(normal, normal.activeCombat.nextHitAt);
    assert.equal(normal.activeCombat.battle.enemy.attackCount, stopAfter / 2);
    const restored = plain(normal), fightId = normal.activeCombat.id;
    let steps = 0;
    while (!normal.activeCombat.battle.winner) { normal = c.tick(normal, normal.activeCombat.nextHitAt); assert.ok(++steps < 1000); }
    const a = c.finish(normal, fightId), skipped = c.skip(restored, fightId);
    assert.deepEqual(plain(a), plain(skipped)); assert.equal(a.lastCombat.won, win);
    assert.equal(a.gold, 25 + (win ? 90 : 0)); assert.equal(a.xp, win ? 280 : 0);
    assert.equal(a.energy, 95); assert.equal(a.shards, 4); assert.equal(a.lastCombat.loot, null); assert.equal(a.activeCombat, null);
    assert.throws(() => c.finish(a, fightId)); assert.throws(() => c.skip(a, fightId));
    const next = c.start({ ...a, combatOffer: { sceneId: 'mine', enemyId: 'abyss-bellringer' } });
    assert.equal(next.activeCombat.battle.enemy.attackCount, 0); assert.equal(next.activeCombat.battle.enemy.hp, 390);
    assert.equal(next.activeCombat.battle.lastHit, null);
  }
});

test('Brand can select the bellringer through the real mission offer generator', () => {
  const r = runtime(), hero = { version: 2, name: 'Test', classId: 'warrior', gender: 'male', level: 15, gold: 25, energy: 100 };
  const index = r.BrandCombat.availableOpponents(hero, 'mine', 'hard').findIndex(m => m.id === 'abyss-bellringer');
  const values = [1, 1, 1, index];
  r.crypto.getRandomValues = a => { assert.ok(values.length); a[0] = values.shift(); return a; };
  const offer = r.BrandChoices.prepare(hero).brandOffers[1];
  assert.equal(offer.sceneId, 'mine'); assert.equal(offer.type, 'combat'); assert.equal(offer.enemyId, 'abyss-bellringer');
  assert.equal(values.length, 0);
});
