'use strict';
(() => {
  const DAY=24*60*60*1000,MAX=100;
  function apply(hero,now=Date.now()) {
    const energy=Number.isSafeInteger(hero.energy)&&hero.energy>=0?Math.min(MAX,hero.energy):MAX;
    const valid=Number.isSafeInteger(hero.nextEnergyResetAt)&&hero.nextEnergyResetAt>0;
    if(!valid)return {...hero,energy,nextEnergyResetAt:now+DAY};
    if(now>=hero.nextEnergyResetAt){const periods=Math.floor((now-hero.nextEnergyResetAt)/DAY)+1;return {...hero,energy:MAX,nextEnergyResetAt:hero.nextEnergyResetAt+periods*DAY};}
    return hero.energy===energy?hero:{...hero,energy};
  }
  function info(hero,now=Date.now()) {
    const normalized=apply(hero,now),seconds=Math.max(0,Math.ceil((normalized.nextEnergyResetAt-now)/1000));
    return {energy:normalized.energy,nextAt:normalized.nextEnergyResetAt,seconds,text:[Math.floor(seconds/3600),Math.floor(seconds/60)%60,seconds%60].map(n=>String(n).padStart(2,'0')).join(':')};
  }
  window.EnergyCycle={apply,info,DAY,MAX};
})();
