const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
function runtime(){
 const data=new Map(),session=new Map();let fail=false;
 const localStorage={getItem:k=>data.get(k)??null,setItem(k,v){if(fail)throw Error('QuotaExceeded');data.set(k,v);},removeItem:k=>data.delete(k)};
 const r=vm.createContext({crypto,localStorage,sessionStorage:{getItem:k=>session.get(k),setItem:(k,v)=>session.set(k,v),removeItem:k=>session.delete(k)},location:{reload(){}}});r.window=r;
 for(const name of ['vespera-outfits','profiles'])vm.runInContext(fs.readFileSync(`dist/${name}.js`,'utf8'),r);
 return {r,data,fail:()=>{fail=true;}};
}
const hero=()=>({version:2,name:'Test',classId:'elf',gender:'female',level:20,xp:123,gold:400,shards:100,energy:65.5,profession:'elf-profession-1',equipment:{weapon:'sword'},lootInventory:[{id:'sword',slot:'weapon',name:'Broń'}]});
test('All seventeen costumes and original have valid unique assets and charge exactly five per actual change',()=>{
 const {r}=runtime(),v=r.VesperaOutfits;let h=hero();const original=h;
 assert.equal(v.CATALOG.length,18);assert.equal(new Set(v.CATALOG.map(o=>o.id)).size,18);
 for(const outfit of v.CATALOG){
  const room=outfit.pose==='standing'?'bedroom':'workshop',other=room==='bedroom'?'workshop':'bedroom',otherBefore=v.current(h,other).id;
  assert.ok(fs.existsSync('dist/'+outfit.image));if(outfit.sprite)assert.ok(fs.existsSync('dist/'+outfit.sprite));assert.ok(outfit.col>=0&&outfit.col<outfit.columns);assert.ok(outfit.row>=0&&outfit.row<outfit.rows);
  const previous=v.current(h,room).id,before=h.shards;h=v.change(h,outfit.id,previous,room);
  assert.equal(h.shards,before-(previous===outfit.id?0:5));assert.equal(v.current(h,room).id,outfit.id);assert.equal(v.current(h,other).id,otherBefore);
  assert.equal(v.change(h,outfit.id,undefined,room),h);assert.equal(h.gold,original.gold);assert.equal(h.energy,original.energy);assert.equal(h.xp,original.xp);
  assert.equal(h.lootInventory,original.lootInventory);assert.equal(h.equipment,original.equipment);assert.equal(h.classId,original.classId);assert.equal(h.gender,original.gender);
 }
 assert.equal(original.shards,100);assert.equal(original.vesperaOutfit,undefined);
 const back=v.change(h,'default');assert.equal(back.shards,h.shards-5);assert.equal(v.current(back).id,'default');
});
test('Standing outfits preserve all five uploaded JPEG files byte for byte',()=>{
 const {r}=runtime(),standing=r.VesperaOutfits.CATALOG.filter(o=>o.pose==='standing');
 const hashes=[
  'cb2d16df372d6b61e642f57a0f7a010ead57be5e17f1b4e3773aa55d5c09bf9a',
  '5ab6db792c5a84ae74c46099203e5cb54c81bf2140f7e61672bab586f3712f2f',
  'd687c66bc9806d97fb4ed763c8ef5df1af5d23abc9134a06701831774b88e782',
  '99e13259fd3dfcf4435abad8c6199e8b219b9eb27464ca416ba46fd5fd407671',
  'b2eac66a11121a2fff0e0c30b0e02f2567195a8b16ad9e7f0a374f30d0dc4607'
 ];
 assert.equal(standing.length,5);
 standing.forEach((outfit,i)=>{assert.equal(crypto.createHash('sha256').update(fs.readFileSync('dist/'+outfit.image)).digest('hex'),hashes[i]);});
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
test('Workshop and bedroom accept only their own poses and retain independent paid looks',()=>{
 const {r}=runtime(),v=r.VesperaOutfits;let h=hero();
 assert.equal(v.forRoom('workshop').length,13);assert.equal(v.forRoom('bedroom').length,5);
 assert.equal(v.current(h,'workshop').id,'default');assert.equal(v.current(h,'bedroom').id,'standing-ranger');
 assert.throws(()=>v.change(h,'standing-amethyst',undefined,'workshop'));
 assert.throws(()=>v.change(h,'queen',undefined,'bedroom'));
 assert.throws(()=>v.forRoom('other'));
 h=v.change(h,'queen','default','workshop');h=v.change(h,'standing-amethyst','standing-ranger','bedroom');
 assert.equal(h.shards,90);assert.equal(h.vesperaOutfit,'queen');assert.equal(h.vesperaStandingOutfit,'standing-amethyst');
 h=v.change(h,'standing-crimson','standing-amethyst','bedroom');
 assert.equal(v.current(h,'workshop').id,'queen');assert.equal(v.current(h,'bedroom').id,'standing-crimson');
 assert.throws(()=>v.change(h,'standing-enchantress','standing-amethyst','bedroom'),/innej karcie/);
 assert.equal(h.shards,85);
});
test('Legacy standing selections migrate without a charge or a standing image in the workshop',()=>{
 const {r}=runtime(),v=r.VesperaOutfits,old={...hero(),vesperaOutfit:'standing-crimson'},before=JSON.stringify(old);
 assert.equal(v.current(old,'workshop').id,'default');assert.equal(v.current(old,'bedroom').id,'standing-crimson');
 assert.equal(JSON.stringify(old),before);
 const seated=v.change(old,'queen','default','workshop');
 assert.equal(seated.vesperaOutfit,'queen');assert.equal(seated.vesperaStandingOutfit,'standing-crimson');assert.equal(seated.shards,95);
 const p=r.LocalProfiles,id=p.create(seated);p.activate(id);const copy=p.importText(p.exportText(id));p.activate(copy);
 assert.equal(v.current(p.read(),'workshop').id,'queen');assert.equal(v.current(p.read(),'bedroom').id,'standing-crimson');
 assert.throws(()=>p.importText(JSON.stringify({...hero(),vesperaStandingOutfit:'queen'})),/stojącego/);
});
