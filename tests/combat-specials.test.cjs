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
  ['venom-centipede', 8, 210, [18, 25], 65, 90],
  ['chain-troll', 13, 420, [30, 42], 155, 190],
  ['spore-crawler', 14, 320, [28, 36], 165, 205]
];
const minimumHit = actor => actor.attack[0];

for (const [id, level, hp, attack, gold, xp] of expected) {
  test(id + ': stats, player range, location, cost and rewards', () => {
    const r = runtime(), c = r.BrandCombat, monster = c.opponents('mine').find(m => m.id === id);
    assert.equal(monster.level, level); assert.equal(monster.maxHp, hp); assert.deepEqual(plain(monster.attack), attack);
    assert.deepEqual(plain(monster.reward), { gold, xp });
    for (let atLevel = 1; atLevel <= 26; atLevel++) {
      const hero = { version: 2, name: 'Test', classId: 'warrior', gender: 'male', level: atLevel, xp: 0, gold: 25, energy: 100 };
      const available = atLevel >= 5 && atLevel <= 15;
      assert.equal(c.availableOpponents(hero, 'mine', 'hard').some(m => m.id === id), available);
      for (const scene of ['forest', 'undercity']) assert.equal(c.opponents(scene).some(m => m.id === id), false);
      assert.equal(c.availableOpponents(hero, 'mine', 'easy').some(m => m.id === id), false);
      hero.brandOffers = [{ id: 'offer', type: 'combat', sceneId: 'mine', tier: 'hard', enemyId: id }];
      if (!available) { assert.throws(() => r.BrandChoices.accept(hero, 'offer')); continue; }
      const started = r.BrandChoices.accept(hero, 'offer');
      assert.equal(started.energy, 95); assert.deepEqual(plain(started.activeCombat.reward), { gold, xp });
    }
  });
}

for (const [id, every, damage, turns] of [['venom-centipede', 3, 8, 3], ['spore-crawler', 4, 12, 2]]) {
  test(id + ': uses its own attack count and poison lasts exactly the specified target turns', () => {
    const c = runtime().BrandCombat;
    let b = c.createBattle(player, c.opponents('mine').find(m => m.id === id), 'enemy');
    for (let n = 1; n <= every; n++) {
      b = c.advance(b, minimumHit);
      assert.equal(b.enemy.attackCount, n);
      assert.equal(!!b.hero.poisonEffect, n === every);
      if (n < every) { b = c.advance(b, minimumHit); assert.equal(b.lastHit.poisonTick, null); }
    }
    // Applying poison does not immediately deal its periodic damage.
    assert.equal(b.hero.hp, player.maxHp - every * b.enemy.attack[0]);
    assert.deepEqual(plain(b.hero.poisonEffect), { damage, turns, label: b.enemy.special.label });
    b.enemy = { ...b.enemy, special: null }; // Isolate expiry from later applications.
    for (let n = 1; n <= turns; n++) {
      const before = b.hero.hp;
      b = c.advance(b, minimumHit);
      assert.equal(b.lastHit.poisonTick.damage, damage);
      assert.equal(b.hero.hp, before - damage);
      assert.equal(b.hero.poisonEffect?.turns ?? 0, turns - n);
      b = c.advance(b, minimumHit);
    }
    b = c.advance(b, minimumHit);
    assert.equal(b.lastHit.poisonTick, null);
    assert.equal(b.hero.poisonEffect, null);
  });
}

test('troll: every fifth own attack does 150%, rounding down before armor', () => {
  const c = runtime().BrandCombat, troll = c.opponents('mine').find(m => m.id === 'chain-troll');
  let b = c.createBattle({ ...player, armor: 10 }, { ...troll, attack: [31, 31] }, 'enemy');
  for (let n = 1; n <= 10; n++) {
    b = c.advance(b, minimumHit);
    assert.equal(b.enemy.attackCount, n);
    assert.equal(b.lastHit.damage, n % 5 === 0 ? 36 : 21);
    assert.equal(b.lastHit.ability === 'chain-slam', n % 5 === 0);
    b = c.advance(b, minimumHit);
  }
  b.next = 'enemy'; b.enemy.attackCount = 4; b.enemy.attack = [42, 42];
  b = c.advance(b, minimumHit);
  assert.equal(b.lastHit.damage, 53); // 42 * 1.5 - 10 armor.
});

test('lethal poison stops the turn before attack, mana spend or counter increment', () => {
  const c = runtime().BrandCombat;
  let b = c.createBattle({ ...player, classId: 'mage', maxHp: 8, maxMana: 30 }, c.opponents('mine')[0], 'hero');
  b.hero.attackCount = 2; b.hero.poisonEffect = { damage: 8, turns: 3, label: 'Trucizna' };
  const before = JSON.stringify(b);
  const done = c.advance(b, () => { throw Error('Dead fighter must not attack'); });
  assert.equal(JSON.stringify(b), before);
  assert.equal(done.winner, 'enemy'); assert.equal(done.hero.hp, 0); assert.equal(done.hero.mana, 30);
  assert.equal(done.hero.attackCount, 2); assert.equal(done.lastHit.ability, 'poison-tick');
  assert.equal(c.advance(done, minimumHit), done);
});

test('surviving poison bypasses armor, consumes one turn, then allows one mage attack', () => {
  const c = runtime().BrandCombat;
  const b = c.createBattle({ ...player, classId: 'mage', maxMana: 30, armor: 100 }, c.opponents('mine')[0], 'hero');
  b.hero.poisonEffect = { damage: 8, turns: 3, label: 'Trucizna' };
  const before = JSON.stringify(b), hit = c.advance(b, () => 20);
  assert.equal(JSON.stringify(b), before); assert.equal(hit.hero.hp, player.maxHp - 8);
  assert.equal(hit.hero.mana, 20); assert.equal(hit.hero.attackCount, 1); assert.equal(hit.hero.poisonEffect.turns, 2);
  assert.equal(hit.enemy.hp, 50); assert.equal(hit.lastHit.ability, 'fireball');
});

test('reapplying the same poison refreshes its duration without stacking damage', () => {
  const c = runtime().BrandCombat;
  let b = c.createBattle(player, c.opponents('mine').find(m => m.id === 'venom-centipede'), 'enemy');
  b.hero.poisonEffect = { damage: 8, turns: 1, label: 'Trucizna' }; b.enemy.attackCount = 2;
  b = c.advance(b, minimumHit); assert.equal(b.hero.poisonEffect.turns, 3);
  const before = b.hero.hp; b = c.advance(b, minimumHit);
  assert.equal(b.hero.hp, before - 8); assert.equal(b.hero.poisonEffect.turns, 2);
});

for (const [id, , , , gold, xp] of expected) {
  test(id + ': reloading, normal play and skip retain effects and pay only once', () => {
    const r = runtime(), c = r.BrandCombat;
    const hero = { version: 2, name: 'Test', classId: 'warrior', gender: 'male', level: 8, xp: 0, gold: 25, shards: 4, energy: 100, combatOffer: { sceneId: 'mine', enemyId: id } };
    for (const win of [true, false]) {
      let normal = c.start(hero);
      normal.activeCombat.battle.hero.maxHp = normal.activeCombat.battle.hero.hp = win ? 10000 : 160;
      normal.activeCombat.battle.hero.attack = win ? [25, 25] : [3, 3];
      const damage = normal.activeCombat.battle.enemy.attack[0];
      normal.activeCombat.battle.enemy.attack = [damage, damage];
      // Stop after the first special attack, preserving its actual in-flight state.
      const every = normal.activeCombat.battle.enemy.special.every;
      for (let i = 0; i < every * 2 && !normal.activeCombat.battle.winner; i++) normal = c.tick(normal, normal.activeCombat.nextHitAt);
      const restored = plain(normal), fightId = normal.activeCombat.id;
      assert.deepEqual(plain(restored.activeCombat.battle), plain(normal.activeCombat.battle));
      let steps = 0;
      while (!normal.activeCombat.battle.winner) { normal = c.tick(normal, normal.activeCombat.nextHitAt); assert.ok(++steps < 1000); }
      const a = c.finish(normal, fightId), b = c.skip(restored, fightId);
      assert.deepEqual(plain(a), plain(b));
      assert.equal(a.lastCombat.won, win);
      assert.equal(a.gold, 25 + (win ? gold : 0)); assert.equal(a.xp, win ? xp : 0);
      assert.equal(a.energy, 95); assert.equal(a.shards, 4); assert.equal(a.lastCombat.loot, null);
      assert.equal(a.activeCombat, null); assert.equal(a.poisonEffect, undefined);
      assert.throws(() => c.finish(a, fightId)); assert.throws(() => c.skip(a, fightId));
      const next = c.start({ ...a, combatOffer: { sceneId: 'mine', enemyId: id } });
      assert.equal(next.activeCombat.battle.hero.poisonEffect, null);
      assert.equal(next.activeCombat.battle.enemy.attackCount, 0);
    }
  });
}

test('old saves without counters remain playable; existing armor, piercing and elements still work', () => {
  const c = runtime().BrandCombat;
  const golem = c.opponents('mine').find(m => m.id === 'magma-golem');
  let hit = c.advance(c.createBattle({ ...player, attackElement: 'water' }, golem, 'hero'), () => 40);
  assert.equal(hit.lastHit.damage, 60); assert.equal(hit.lastHit.weaknessBonus, 20);
  hit = c.advance(c.createBattle(player, golem, 'hero'), () => 40); assert.equal(hit.lastHit.damage, 32);
  const miner = c.opponents('mine').find(m => m.id === 'undead-miner');
  hit = c.advance(c.createBattle({ ...player, armor: 10 }, miner, 'enemy'), () => 26);
  assert.equal(hit.lastHit.damage, 21); assert.equal(hit.lastHit.ignoredArmor, 5);
  const scorpion = c.opponents('mine').find(m => m.id === 'crystal-scorpion');
  hit = c.advance(c.createBattle(player, scorpion, 'enemy'), () => 25); assert.equal(hit.lastHit.ability, 'poison');
  const old = c.createBattle(player, c.opponents('mine')[0], 'hero');
  delete old.hero.attackCount; delete old.enemy.attackCount; delete old.hero.poisonEffect; delete old.enemy.poisonEffect;
  hit = c.advance(old, () => 20); assert.equal(hit.enemy.hp, 50); assert.equal(hit.hero.attackCount, 1);
});

test('Brand can randomly offer all three new monsters in the mine', () => {
  for (const [index, id] of [[2, 'venom-centipede'], [3, 'chain-troll'], [4, 'spore-crawler']]) {
    const r = runtime(), values = [1, 1, 1, index];
    r.crypto.getRandomValues = a => { assert.ok(values.length); a[0] = values.shift(); return a; };
    const hero = { version: 2, name: 'Test', classId: 'warrior', gender: 'male', level: 15, gold: 25, energy: 100 };
    const offer = r.BrandChoices.prepare(hero).brandOffers[1];
    assert.equal(offer.sceneId, 'mine'); assert.equal(offer.type, 'combat'); assert.equal(offer.enemyId, id);
    assert.equal(values.length, 0);
  }
});
