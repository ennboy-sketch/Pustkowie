const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
function runtime(){
 const data=new Map(),session=new Map();let fail=false;
 const storage={getItem:k=>data.get(k)??null,setItem(k,v){if(fail)throw Error('QuotaExceeded');data.set(k,v);},removeItem:k=>data.delete(k)};
 const r=vm.createContext({crypto,localStorage:storage,sessionStorage:{getItem:k=>session.get(k)??null,setItem:(k,v)=>session.set(k,v),removeItem:k=>session.delete(k)},location:{reload(){}}});r.window=r;
 for(const name of ['progression','energy','gear-catalog','hero','beer','combat','missions','gabriel-training','graveyard','tauriel','player-stats','market','hero-skins','campaign','profiles'])vm.runInContext(fs.readFileSync('dist/'+name+'.js','utf8'),r);
 return{r,data,fail:()=>fail=true};
}
function veteran(r){return{version:2,name:'Weteran',classId:'warrior',gender:'female',level:110,xp:123,gold:987,shards:20,energy:65.5,profession:'warrior-profession-2',nextEnergyResetAt:1950000000000,taurielQuest:{status:'completed',defeated:r.TaurielQuest.BANDITS.map(b=>b.id),claimedAt:1},gabrielQuest:{status:'completed',dummies:3,recovered:3},graveyardDefeated:r.Graveyard.BOSSES.map(b=>b.id),dungeonNextFightAt:1950000000000,lootInventory:[{id:'minotaur-axe',name:'Topór Minotaura',kind:'minotaur-axe',slot:'weapon',requiredLevel:20}],equipment:{weapon:'minotaur-axe'},heroSkin:'ember-steel',ownedHeroSkins:['ember-steel'],vesperaOutfit:'standing-ranger'};}
function achieve(r,h,token){
 const c=r.OathCampaign;if(c.condition(h,token).done)return h;
 if(token.startsWith('visit:'))return c.visit(h,token.slice(6));
 const id=token.startsWith('win:')?token.slice(4):token,a=c.activity(id);assert.ok(a,'Real campaign activity: '+token);
 for(const required of a.requires)h=achieve(r,h,required);
 if(a.kind==='inspect')return c.gather(h,id,a.choices[0].id);
 h=c.begin(h,id);h.activeCombat.battle.hero.hp=h.activeCombat.battle.hero.maxHp=10000;h.activeCombat.battle.hero.attack=[10000,10000];
 return r.BrandCombat.skip(h,h.activeCombat.id);
}
function complete(r,h,id){const c=r.OathCampaign;h=c.accept(h,id);for(const token of c.get(id).goals)h=achieve(r,h,token);assert.equal(c.status(h,id).ready,true,id);return c.claim(h,id);}
test('Ten specified main missions, four side quests and four gated chapters have complete assets and encounters',()=>{
 const{r}=runtime(),c=r.OathCampaign;
 assert.deepEqual(Array.from(c.CATALOG.filter(q=>q.kind==='main'),q=>q.title),['Nieproszeni goście','Żelazna Przysięga','Trzy niepokojące raporty','Szept spod korzeni','Ostatnia zmiana górników','Pamięć zamknięta w kości','Cmentarz bez snu','Ślad na ostrzu','Twarz pod maską','Noc Pękniętej Korony']);
 assert.equal(c.CATALOG.filter(q=>q.kind==='side').length,4);assert.equal(new Set(c.CATALOG.map(q=>q.id)).size,18);
 assert.deepEqual(Array.from(c.CATALOG.filter(q=>q.kind==='chapter'),q=>q.level),[30,50,75,110]);
 for(const a of c.ACTIVITIES){assert.ok(c.get(a.quest));assert.ok(fs.existsSync('dist/'+c.SCENES[a.scene].image));if(a.kind==='fight'){assert.ok(a.enemy.id);assert.ok(a.enemy.maxHp>0);assert.equal(a.enemy.stats.length,4);}}
});
test('A veteran receives credit for Tauriel, Gabriel, all five bosses and already reported scouts without replaying or mutating old state',()=>{
 const{r}=runtime(),c=r.OathCampaign,old=veteran(r);old.playerStats={version:1,battles:{},missions:{forest:1,mine:1,undercity:1}};const before=JSON.stringify(old);
 let h=c.accept(old,'uninvited');assert.equal(c.status(h,'uninvited').ready,true);h=c.claim(h,'uninvited');
 h=c.accept(h,'iron-oath');assert.equal(c.status(h,'iron-oath').ready,true);h=c.claim(h,'iron-oath');
 h=c.accept(h,'three-reports');assert.equal(c.status(h,'three-reports').ready,true);h=c.claim(h,'three-reports');
 assert.equal(h.activeCombat,undefined);assert.equal(h.taurielQuest,old.taurielQuest);assert.equal(h.gabrielQuest,old.gabrielQuest);assert.equal(h.graveyardDefeated,old.graveyardDefeated);
 assert.equal(h.lootInventory,old.lootInventory);assert.equal(h.equipment,old.equipment);assert.equal(h.dungeonNextFightAt,old.dungeonNextFightAt);assert.equal(h.energy,65.5);assert.equal(h.vesperaOutfit,'standing-ranger');assert.equal(JSON.stringify(old),before);
 assert.equal(c.condition(h,'boss:5').done,true);
});
test('The entire main story, all side quests and four follow-up chapters are playable and rewards are single-use',()=>{
 const{r}=runtime(),c=r.OathCampaign,old=veteran(r);let h=old,gold=old.gold,shards=old.shards,xp=old.xp;
 for(const q of c.CATALOG){h=complete(r,JSON.parse(JSON.stringify(h)),q.id);gold+=q.reward.gold;shards+=q.reward.shards;xp+=q.reward.xp;assert.equal(h.gold,gold);assert.equal(h.shards,shards);assert.equal(h.xp,xp);assert.throws(()=>c.claim(h,q.id),/już/);}
 assert.equal(c.read(h).completed.length,18);assert.equal(c.current(h),undefined);assert.equal(c.read(h).won.length,9);
 assert.deepEqual(h.graveyardDefeated,JSON.parse(JSON.stringify(old.graveyardDefeated)));assert.deepEqual(h.lootInventory,old.lootInventory);assert.deepEqual(h.equipment,old.equipment);
 assert.equal(h.vesperaOutfit,'standing-ranger');assert.equal(h.heroSkin,'ember-steel');assert.equal(h.energy,65.5);assert.equal(h.dungeonNextFightAt,old.dungeonNextFightAt);assert.equal(h.nextEnergyResetAt,old.nextEnergyResetAt);
 assert.equal(c.validate(JSON.parse(JSON.stringify(h))).campaign.completed.length,18);
});
test('Levels, predecessors, visits, earlier evidence, active scouts and battles enforce the story order',()=>{
 const{r}=runtime(),c=r.OathCampaign;let h=veteran(r);
 assert.throws(()=>c.accept(h,'masked-face'));assert.throws(()=>c.accept({...h,level:4},'uninvited'));assert.throws(()=>c.claim(h,'uninvited'));
 assert.throws(()=>c.accept({...h,activeMission:{type:'scout'}},'uninvited'));h=complete(r,h,'uninvited');h=complete(r,h,'iron-oath');
 h=c.accept(h,'three-reports');assert.equal(c.status(h,'three-reports').ready,false);h=complete(r,h,'three-reports');h=complete(r,h,'root-whisper');h=complete(r,h,'miners-shift');
 h=c.accept(h,'bone-memory');assert.throws(()=>c.gather(h,'bone-remembrance','remember'),/komnatę/);
 h=c.visit(h,'archive');h=c.gather(h,'bone-remembrance','remember');assert.equal(c.gather(h,'bone-remembrance','bind'),h,'A completed decision cannot be changed');h=c.claim(h,'bone-memory');
 for(const id of ['sleepless-graves','blade-trace','masked-face','broken-crown'])h=complete(r,h,id);
 assert.throws(()=>c.accept({...h,level:29},'outskirts-seal'));h=complete(r,{...h,level:30},'outskirts-seal');
 assert.throws(()=>c.accept({...h,level:49},'eldor-seal'));h=complete(r,{...h,level:50},'eldor-seal');
 assert.throws(()=>c.accept({...h,level:74},'ice-seal'));h=complete(r,{...h,level:75},'ice-seal');assert.throws(()=>c.accept({...h,level:109},'hell-seal'));
});
test('Losing and resuming a saved campaign battle cannot grant clues, consume energy or bypass duplicate resolution',()=>{
 const{r}=runtime(),c=r.OathCampaign;let h=veteran(r);for(const id of ['uninvited','iron-oath','three-reports'])h=complete(r,h,id);h=c.accept(h,'root-whisper');
 const active=c.begin(h,'root-warden');assert.equal(active.energy,h.energy);assert.equal(active.activeCombat.cost,0);assert.throws(()=>c.begin(active,'root-warden'));
 const pending=JSON.parse(JSON.stringify(active));pending.activeCombat.battle.winner='enemy';const lost=r.BrandCombat.finish(pending,pending.activeCombat.id);
 assert.equal(lost.gold,h.gold);assert.equal(lost.xp,h.xp);assert.equal(lost.energy,h.energy);assert.equal(c.read(lost).won.length,0);assert.equal(lost.lastCampaignBattle.won,false);assert.throws(()=>c.resolve(lost,pending.activeCombat.id));
 const resumed=JSON.parse(JSON.stringify(c.begin(lost,'root-warden')));c.validate(resumed);resumed.activeCombat.battle.winner='hero';const won=r.BrandCombat.finish(resumed,resumed.activeCombat.id);
 assert.equal(c.read(won).won.includes('root-warden'),true);assert.throws(()=>c.begin(won,'root-warden'));assert.equal(won.gold,h.gold);assert.equal(won.energy,h.energy);
});
test('Profile export/import preserves campaign, decisions and archive view independently; failed storage is atomic',()=>{
 const{r,data,fail}=runtime(),c=r.OathCampaign,p=r.LocalProfiles;let h=veteran(r);for(const id of ['uninvited','iron-oath','three-reports'])h=complete(r,h,id);
 const a=p.create(h),b=p.create({...veteran(r),name:'Nowa Postać'});p.activate(a);p.saveView({world:'map',place:'guild',room:'archive',placeView:{x:.6,y:.4,scale:1.5}});
 const copy=p.importText(p.exportText(a));p.activate(copy);assert.deepEqual(JSON.parse(JSON.stringify(p.read().campaign)),JSON.parse(JSON.stringify(h.campaign)));assert.equal(p.view().room,'archive');
 p.activate(b);assert.equal(p.read().campaign,undefined);assert.equal(p.read().gold,987);
 p.activate(a);const old=JSON.stringify([...data]);fail();assert.throws(()=>p.write(c.accept(p.read(),'root-whisper')),/Quota/);assert.equal(JSON.stringify([...data]),old);
});
test('Malformed and hostile campaign imports and overflow rewards are rejected without modifying a save',()=>{
 const{r}=runtime(),c=r.OathCampaign,p=r.LocalProfiles,h=veteran(r);const active=c.accept(h,'uninvited');
 for(const campaign of [{version:2},{...active.campaign,completed:['broken-crown']},{...active.campaign,clues:['unmasked']},{...active.campaign,visits:['__proto__']},{...active.campaign,accepted:['uninvited','uninvited']},{...active.campaign,decisions:{unknown:'wrong'}}])assert.throws(()=>p.importText(JSON.stringify({...h,campaign})));
 assert.throws(()=>c.gather(active,'report-forest','record'));assert.throws(()=>c.claim({...active,gold:Number.MAX_SAFE_INTEGER},'uninvited'));assert.equal(h.gold,987);
});
