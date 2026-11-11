const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
function runtime(){
 const data=new Map(),session=new Map();let broken=false;
 const r=vm.createContext({crypto,localStorage:{getItem:k=>data.get(k)??null,setItem(k,v){if(broken)throw Error('QuotaExceeded');data.set(k,v);},removeItem:k=>data.delete(k)},sessionStorage:{getItem:k=>session.get(k),setItem:(k,v)=>session.set(k,v),removeItem:k=>session.delete(k)},location:{reload(){}}});r.window=r;
 for(const name of ['progression','energy','gear-catalog','hero','beer','combat','market','hero-skins','profiles'])vm.runInContext(fs.readFileSync(`dist/${name}.js`,'utf8'),r);
 return {r,data,fail:()=>{broken=true;}};
}
const hero=(classId,gender='female')=>({version:2,name:'Test',classId,gender,level:10,xp:15,gold:100,shards:40,energy:100,vesperaOutfit:'queen'});
for(const classId of ['warrior','mage','elf','dwarf'])for(const gender of ['male','female'])test(`${classId} ${gender}: one permanent purchase, free equipping, all gameplay stats unchanged`,()=>{
 const {r}=runtime(),s=r.HeroSkins,h=hero(classId,gender),skin=s.CATALOG.find(s=>s.classId===classId),before=r.BrandCombat.profile(h);
 assert.ok(fs.existsSync('dist/'+s.IMAGE));assert.equal(s.current(h),null);assert.throws(()=>s.equip(h,skin.id));
 const bought=s.purchase(h,skin.id),after=r.BrandCombat.profile(bought);
 assert.equal(bought.shards,40-s.COST);assert.equal(s.current(bought).id,skin.id);assert.equal(s.purchase(bought,skin.id),bought);
 assert.equal(after.appearanceSkin,skin.id);assert.equal(s.battleSuffix(after),' hero-skin');
 for(const key of ['attack','stats','maxHp','maxMana','armor','damageBonus'])assert.deepEqual(after[key],before[key]);
 assert.equal(bought.gold,h.gold);assert.equal(bought.energy,h.energy);assert.equal(bought.xp,h.xp);assert.equal(bought.vesperaOutfit,'queen');
 assert.equal(r.HeroSheet.inventory(bought).length,r.HeroSheet.inventory(h).length);assert.equal(h.shards,40);assert.equal(h.heroSkin,undefined);
 const base=s.equip(bought,null);assert.equal(s.current(base),null);assert.equal(base.shards,bought.shards);
 assert.equal(s.equip(base,skin.id).shards,bought.shards);assert.equal(s.current(s.purchase(base,skin.id)).id,skin.id);assert.equal(s.purchase(base,skin.id).shards,bought.shards);
 for(const other of s.CATALOG.filter(skin=>skin.classId!==classId)){assert.throws(()=>s.purchase(h,other.id));assert.throws(()=>s.equip({...h,ownedHeroSkins:[other.id]},other.id));}
});
test('Missing shards, insufficient funds, malformed choices and forged appearances cannot trigger paid purchase',()=>{
 const {r}=runtime(),s=r.HeroSkins,h=hero('warrior');
 for(const shards of [undefined,0,s.COST-1,-1,1.5,'40',NaN])assert.throws(()=>s.purchase({...h,shards},'ember-steel'));
 assert.equal(s.purchase({...h,shards:s.COST},'ember-steel').shards,0);assert.throws(()=>s.purchase(h,'invalid'));
 assert.equal(s.classSuffix({...h,heroSkin:'ember-steel'}),'');assert.equal(s.battleSuffix({classId:'mage',appearanceSkin:'ember-steel'}),'');
 assert.throws(()=>s.validate({...h,ownedHeroSkins:'ember-steel'}));assert.throws(()=>s.validate({...h,heroSkin:'ember-steel'}));
});
test('Profiles and exports preserve ownership independently; failed storage writes preserve currency and appearance',()=>{
 const {r,data,fail}=runtime(),s=r.HeroSkins,p=r.LocalProfiles,a=p.create(hero('elf')),b=p.create({...hero('elf'),name:'Druga'});
 p.activate(a);p.write(s.purchase(p.read(),'moonwood'));const copied=p.importText(p.exportText(a));p.activate(copied);
 assert.equal(s.current(p.read()).id,'moonwood');assert.equal(p.read().shards,40-s.COST);
 p.activate(b);assert.equal(s.current(p.read()),null);assert.equal(p.read().shards,40);
 const before=JSON.stringify([...data]);fail();assert.throws(()=>p.write(s.purchase(p.read(),'moonwood')),/Quota/);
 assert.equal(JSON.stringify([...data]),before);assert.equal(p.read().shards,40);assert.equal(s.current(p.read()),null);
});
