const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
function runtime(){
 const data=new Map(),session=new Map();let fail=false;
 const localStorage={getItem:k=>data.get(k)??null,setItem(k,v){if(fail)throw Error('QuotaExceeded');data.set(k,v);},removeItem:k=>data.delete(k)};
 const r=vm.createContext({crypto,localStorage,sessionStorage:{getItem:k=>session.get(k),setItem:(k,v)=>session.set(k,v),removeItem:k=>session.delete(k)},location:{reload(){}}});r.window=r;
 for(const name of ['vespera-outfits','profiles'])vm.runInContext(fs.readFileSync(`dist/${name}.js`,'utf8'),r);
 return {r,data,fail:()=>{fail=true;}};
}
const hero=()=>({version:2,name:'Test',classId:'elf',gender:'female',level:20,xp:123,gold:400,shards:100,energy:65.5,profession:'elf-profession-1',equipment:{weapon:'sword'},lootInventory:[{id:'sword',slot:'weapon',name:'Broń'}]});
test('All twelve new costumes and original have valid unique assets and charge exactly five per actual change',()=>{
 const {r}=runtime(),v=r.VesperaOutfits;let h=hero();const original=h;
 assert.equal(v.CATALOG.length,13);assert.equal(new Set(v.CATALOG.map(o=>o.id)).size,13);
 for(const outfit of v.CATALOG){
  assert.ok(fs.existsSync('dist/'+outfit.image));assert.ok(outfit.col>=0&&outfit.col<outfit.columns);assert.ok(outfit.row>=0&&outfit.row<outfit.rows);
  const previous=v.current(h).id,before=h.shards;h=v.change(h,outfit.id,previous);
  assert.equal(h.shards,before-(previous===outfit.id?0:5));assert.equal(v.current(h).id,outfit.id);
  assert.equal(v.change(h,outfit.id),h);assert.equal(h.gold,original.gold);assert.equal(h.energy,original.energy);assert.equal(h.xp,original.xp);
  assert.equal(h.lootInventory,original.lootInventory);assert.equal(h.equipment,original.equipment);assert.equal(h.classId,original.classId);assert.equal(h.gender,original.gender);
 }
 assert.equal(original.shards,100);assert.equal(original.vesperaOutfit,undefined);
 const back=v.change(h,'default');assert.equal(back.shards,h.shards-5);assert.equal(v.current(back).id,'default');
});
test('Insufficient funds, invalid outfits, stale confirmation and corrupt balances cannot change the hero',()=>{
 const {r}=runtime(),v=r.VesperaOutfits,h=hero(),before=JSON.stringify(h);
 for(const shards of [0,4,-1,1.5,'20',NaN])assert.throws(()=>v.change({...h,shards},'commander'));
 assert.throws(()=>v.change(h,'not-an-outfit'));assert.throws(()=>v.change(h,'__proto__'));
 const first=v.change(h,'commander','default');assert.throws(()=>v.change(first,'queen','default'),/innej karcie/);assert.equal(first.shards,95);
 assert.equal(v.change({...h,shards:5},'commander').shards,0);assert.equal(v.current({}).id,'default');
 assert.equal(JSON.stringify(h),before);
});
test('Profiles preserve independent Vespera looks through export/import; a failed save preserves shards and outfit',()=>{
 const {r,data,fail}=runtime(),p=r.LocalProfiles,v=r.VesperaOutfits,a=p.create(hero()),b=p.create({...hero(),name:'Druga'});
 p.activate(a);p.write(v.change(p.read(),'queen'));assert.equal(p.read().shards,95);
 const imported=p.importText(p.exportText(a));p.activate(imported);assert.equal(v.current(p.read()).id,'queen');assert.equal(p.read().shards,95);
 p.activate(b);assert.equal(v.current(p.read()).id,'default');assert.equal(p.read().shards,100);
 p.activate(a);const before=JSON.stringify([...data]);fail();assert.throws(()=>p.write(v.change(p.read(),'huntress')),/Quota/);
 assert.equal(JSON.stringify([...data]),before);assert.equal(v.current(p.read()).id,'queen');assert.equal(p.read().shards,95);
});
