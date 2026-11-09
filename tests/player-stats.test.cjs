const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context=vm.createContext({});context.window=context;vm.runInContext(fs.readFileSync('dist/player-stats.js','utf8'),context);
const stats=context.PlayerStats,empty={version:2,name:'Test',classId:'warrior'};
const plain=object=>JSON.parse(JSON.stringify(object));
test('New and legacy heroes have zero totals without modifying the save',()=>{
  assert.deepEqual(plain(stats.totals(empty)),{battles:0,wins:0,losses:0,missions:0});
  assert.equal(empty.playerStats,undefined);
});
test('Completed fights are counted once at the proper location and outcome',()=>{
  const f={sceneId:'mine',battle:{winner:'hero'}},g={sceneId:'mine',battle:{winner:'enemy'}};
  let hero=stats.recordBattle(empty,f);hero=stats.recordBattle(hero,g);
  hero=stats.recordBattle(hero,{source:'graveyard',sceneId:'graveyard',battle:{winner:'hero'}});
  assert.deepEqual(plain(stats.totals(hero)),{battles:3,wins:2,losses:1,missions:0});
  assert.deepEqual(plain(hero.playerStats.battles.mine),{total:2,wins:1});
  assert.equal(hero.playerStats.battles.graveyard.total,1);
  assert.equal(empty.playerStats,undefined);
});
test('Training dummies are excluded while forest thieves are counted',()=>{
  const dummy={source:'gabriel',stage:'dummies',sceneId:'training',battle:{winner:'hero'}};
  const h=stats.recordBattle(empty,dummy);assert.equal(h,empty);
  const next=stats.recordBattle(h,{source:'gabriel',stage:'recovery',sceneId:'forest',battle:{winner:'hero'}});
  assert.equal(next.playerStats.battles.forest.total,1);
});
test('Timed and story missions are grouped by their true locations',()=>{
  let hero=stats.recordMission(empty,'forest');hero=stats.recordMission(hero,'forest');
  hero=stats.recordMission(hero,'tavern-upstairs');hero=stats.recordMission(hero,'graveyard');
  assert.equal(stats.totals(hero).missions,4);
  assert.equal(hero.playerStats.missions.forest,2);
  const html=stats.markup(hero);assert.match(html,/Mroczny Las/);assert.match(html,/Wykonane misje/);
});
test('Invalid counters are rejected rather than silently reset',()=>{
  assert.throws(()=>stats.read({...empty,playerStats:{version:1,battles:{mine:{total:-1,wins:0}},missions:{}}}));
  assert.throws(()=>stats.recordBattle(empty,{sceneId:'forest',battle:{winner:null}}));
});
