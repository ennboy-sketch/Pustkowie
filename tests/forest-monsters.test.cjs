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
const expected = [
  ["bloodthirsty-flower", 6, 182, [17, 25], 52, 1350],
  ["cursed-stag", 7, 209, [19, 27], 61, 1900],
  ["ancient-forest-spirit", 14, 391, [32, 42], 85, 16400],
  ["birch-werewolf", 6, 193, [22, 25], 53, 1388],
  ["wraith-archer", 13, 363, [33, 46], 75, 10333]
];
const minimumHit = actor => actor.attack[0];
const monster = (c, id) => c.opponents('forest').find(m => m.id === id);

for (const [id, level, hp, attack, gold, xp] of expected) {
  test(id + ': exact stats/rewards, forest only and existing Brand level/difficulty rules', () => {
    const r = runtime(), c = r.BrandCombat, m = monster(c, id);
    assert.equal(m.level, level); assert.equal(m.maxHp, hp);
    assert.deepEqual(plain(m.attack), attack); assert.deepEqual(plain(m.reward), { gold, xp });
    for (const scene of ['mine', 'undercity']) assert.equal(c.opponents(scene).some(m => m.id === id), false);
    for (let level = 1; level <= 26; level++) {
      const hero = { version: 2, name: 'Test', classId: 'warrior', gender: 'male', level, xp: 0, gold: 25, energy: 100,
        brandOffers: [{ id: 'offer', type: 'combat', sceneId: 'forest', tier: 'hard', enemyId: id }] };
      const available = Math.abs(level - m.level) <= 3;
      assert.equal(c.availableOpponents(hero, 'forest').some(m => m.id === id), available);
      const tier = c.availableOpponents(hero, 'forest', 'hard').some(m => m.id === id) ? 'hard' : 'easy';
      hero.brandOffers[0].tier = tier;
      if (!available) { assert.throws(() => r.BrandChoices.accept(hero, 'offer')); continue; }
      const started = r.BrandChoices.accept(hero, 'offer');
      assert.equal(started.energy, tier === 'hard' ? 95 : 97); assert.deepEqual(plain(started.activeCombat.reward), { gold, xp });
    }
  });
}

for (const [id, normal, special, ability] of [
  ['bloodthirsty-flower', 17, 27, 'thorn-grab'], ['cursed-stag', 19, 28, 'cursed-charge']
]) {
  test(id + ': every fourth own attack, before armor, including the next cycle', () => {
    const c = runtime().BrandCombat;
    let b = c.createBattle({ ...player, armor: 3 }, monster(c, id), 'enemy');
    for (let n = 1; n <= 8; n++) {
      b = c.advance(b, minimumHit);
      assert.equal(b.enemy.attackCount, n);
      assert.equal(b.lastHit.damage, (n % 4 === 0 ? special : normal) - 3);
      assert.equal(b.lastHit.ability === ability, n % 4 === 0);
      b = c.advance(b, minimumHit);
    }
    b.next = 'enemy'; b.enemy.attackCount = 3;
    b = c.advance(b, () => b.enemy.attack[1]);
    assert.equal(b.lastHit.damage, id === 'cursed-stag' ? 37 : 32);
  });
}

test('forest spirit: physical reduction, magical vulnerability, rounding and minimum damage', () => {
  const c = runtime().BrandCombat, spirit = monster(c, 'ancient-forest-spirit');
  for (const [raw, damage] of [[100, 85], [29, 24], [1, 1]]) {
    const hit = c.advance(c.createBattle(player, spirit, 'hero'), () => raw);
    assert.equal(hit.lastHit.damage, damage); assert.equal(hit.lastHit.magicBonus, 0);
  }
  for (const element of ['fire', 'water']) {
    const hit = c.advance(c.createBattle({ ...player, attackElement: element }, spirit, 'hero'), () => 100);
    assert.equal(hit.lastHit.damage, 120); assert.equal(hit.lastHit.magicBonus, 20); assert.equal(hit.lastHit.resisted, 0);
  }
  let hit = c.advance(c.createBattle({ ...player, classId: 'mage', maxMana: 10 }, spirit, 'hero'), () => 100);
  assert.equal(hit.lastHit.damage, 120); assert.equal(hit.hero.mana, 0);
  hit.next = 'hero'; hit = c.advance(hit, () => 100);
  assert.equal(hit.lastHit.damage, 85); assert.equal(hit.lastHit.ability, 'wand');
  hit = c.advance(c.createBattle({ ...player, attackType: 'poison' }, spirit, 'hero'), () => 100);
  assert.equal(hit.lastHit.damage, 100); // Poison is not magical or physical.
  hit = c.advance(c.createBattle(player, { ...spirit, armor: 10 }, 'hero'), () => 100);
  assert.equal(hit.lastHit.damage, 76); // Flat armor, then floor(90 * 0.85).
  const poisoned = c.createBattle(player, spirit, 'enemy');
  poisoned.enemy.poisonEffect = { damage: 8, turns: 1, label: 'Trucizna' };
  hit = c.advance(poisoned, minimumHit);
  assert.equal(hit.enemy.hp, 383); // Neither resistance nor vulnerability changes periodic poison.
});

test('werewolf: strict 30% threshold, 20% bonus rounding and recovery above threshold', () => {
  const c = runtime().BrandCombat, wolf = monster(c, 'birch-werewolf');
  for (const [maxHp, hp, raw, damage] of [[175, 53, 20, 20], [175, 52, 20, 24], [175, 52, 22, 26], [100, 30, 20, 20], [100, 29, 20, 24]]) {
    const b = c.createBattle(player, { ...wolf, maxHp }, 'enemy'); b.enemy.hp = hp;
    const before = JSON.stringify(b), hit = c.advance(b, () => raw);
    assert.equal(JSON.stringify(b), before); assert.equal(hit.lastHit.damage, damage);
    assert.equal(hit.lastHit.ragePercent, damage > raw ? 20 : 0);
    hit.enemy.hp = hit.enemy.maxHp; hit.next = 'enemy';
    assert.equal(c.advance(hit, () => raw).lastHit.ragePercent, 0);
  }
  const b = c.createBattle(player, wolf, 'enemy'); b.enemy.hp = 58;
  b.enemy.poisonEffect = { damage: 8, turns: 1, label: 'Trucizna' };
  const hit = c.advance(b, () => 20);
  assert.equal(hit.enemy.hp, 50); assert.equal(hit.lastHit.ragePercent, 20); assert.equal(hit.lastHit.damage, 24);
});

test('archer: every third physical attack ignores 30% of defense, without inventing armor for equipment', () => {
  const c = runtime().BrandCombat, archer = monster(c, 'wraith-archer');
  // Explicit armor fixture: current player equipment grants attributes/HP, not damage reduction.
  let b = c.createBattle({ ...player, armor: 10, physicalArmor: 10, physicalResistance: 20 }, archer, 'enemy');
  for (let n = 1; n <= 6; n++) {
    b = c.advance(b, () => 30);
    assert.equal(b.lastHit.damage, n % 3 === 0 ? 13 : 8);
    assert.equal(b.lastHit.ignoredArmor, n % 3 === 0 ? 6 : 0);
    assert.equal(b.lastHit.resistanceIgnored, n % 3 === 0 ? 6 : 0);
    assert.equal(b.lastHit.ability === 'piercing-arrow', n % 3 === 0);
    b = c.advance(b, minimumHit);
  }
  b.next = 'enemy'; b.enemy.attackCount = 2;
  assert.equal(c.advance(b, () => 41).lastHit.damage, 23);
  b.enemy.attackElement = 'water';
  const magic = c.advance(b, () => 30);
  assert.equal(magic.lastHit.damage, 20); assert.equal(magic.lastHit.ignoredArmor, 0);
  b = c.createBattle(player, archer, 'enemy'); b.enemy.attackCount = 2;
  assert.equal(c.advance(b, () => 30).lastHit.damage, 30);
});

for (const [id, , , , gold, xp] of expected) {
  test(id + ': reload and skip match normal play, with exact once-only rewards and clean next fights', () => {
    const c = runtime().BrandCombat;
    const hero = { version: 2, name: 'Test', classId: 'warrior', gender: 'male', level: monster(c, id).level, xp: 0, gold: 25, shards: 4, energy: 100,
      combatOffer: { sceneId: 'forest', enemyId: id } };
    for (const win of [true, false]) {
      let normal = c.start(hero);
      normal.activeCombat.battle.hero.maxHp = normal.activeCombat.battle.hero.hp = win ? 10000 : 200;
      normal.activeCombat.battle.hero.attack = win ? [10, 10] : [1, 1];
      normal.activeCombat.battle.enemy.attack = [normal.activeCombat.battle.enemy.attack[0], normal.activeCombat.battle.enemy.attack[0]];
      for (let n = 0; n < 8 && !normal.activeCombat.battle.winner; n++) normal = c.tick(normal, normal.activeCombat.nextHitAt);
      const restored = plain(normal), fightId = normal.activeCombat.id;
      let steps = 0;
      while (!normal.activeCombat.battle.winner) { normal = c.tick(normal, normal.activeCombat.nextHitAt); assert.ok(++steps < 1000); }
      const a = c.finish(normal, fightId), b = c.skip(restored, fightId);
      assert.deepEqual(plain(a), plain(b)); assert.equal(a.lastCombat.won, win);
      assert.equal(a.gold, 25 + (win ? gold : 0)); assert.equal(a.xp, win ? xp : 0);
      assert.equal(a.energy, 95); assert.equal(a.shards, 4); assert.equal(a.lastCombat.loot, null); assert.equal(a.activeCombat, null);
      assert.throws(() => c.finish(a, fightId)); assert.throws(() => c.skip(a, fightId));
      const next = c.start({ ...a, combatOffer: { sceneId: 'forest', enemyId: id } });
      assert.equal(next.activeCombat.battle.enemy.attackCount, 0); assert.equal(next.activeCombat.battle.enemy.hp, next.activeCombat.battle.enemy.maxHp);
      assert.equal(next.activeCombat.battle.enemy.poisonEffect, null);
    }
  });
}

test('Brand offers all five new forest monsters through its real random selection', () => {
  for (const [id, level] of expected) {
    const r = runtime();
    const hero = { version: 2, name: 'Test', classId: 'warrior', gender: 'male', level: level - 1, gold: 25, energy: 100 };
    const index = r.BrandCombat.availableOpponents(hero, 'forest', 'hard').findIndex(m => m.id === id);
    assert.ok(index >= 0);
    const values = [99, 0, 0, 0, index];
    r.crypto.getRandomValues = a => { assert.ok(values.length); a[0] = values.shift(); return a; };
    const offer = r.BrandChoices.prepare(hero).brandOffers[1];
    assert.equal(offer.sceneId, 'forest'); assert.equal(offer.type, 'combat'); assert.equal(offer.enemyId, id); assert.equal(values.length, 0);
  }
});
