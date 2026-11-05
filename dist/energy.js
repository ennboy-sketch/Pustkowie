'use strict';
(() => {
  const INTERVAL=12*60*60*1000,MAX=100;
  function apply(hero,now=Date.now()) {
    const energy=Number.isSafeInteger(hero.energy)&&hero.energy>=0?Math.min(MAX,hero.energy):MAX;
    const valid=Number.isSafeInteger(hero.nextEnergyResetAt)&&hero.nextEnergyResetAt>0;
    if(!valid)return {...hero,energy,energyCycleHours:12,nextEnergyResetAt:now+INTERVAL};
    // Old deadlines belong to a 24-hour cycle. Move to its 12-hour midpoint once.
    const migrated=hero.energyCycleHours!==12,deadline=hero.nextEnergyResetAt-(migrated?INTERVAL:0);
    if(now>=deadline){const periods=Math.floor((now-deadline)/INTERVAL)+1;return {...hero,energy:MAX,energyCycleHours:12,nextEnergyResetAt:deadline+periods*INTERVAL};}
    return !migrated&&hero.energy===energy?hero:{...hero,energy,energyCycleHours:12,nextEnergyResetAt:deadline};
  }
  function info(hero,now=Date.now()) {
    const normalized=apply(hero,now),seconds=Math.max(0,Math.ceil((normalized.nextEnergyResetAt-now)/1000));
    return {energy:normalized.energy,nextAt:normalized.nextEnergyResetAt,seconds,text:[Math.floor(seconds/3600),Math.floor(seconds/60)%60,seconds%60].map(n=>String(n).padStart(2,'0')).join(':')};
  }
  window.EnergyCycle={apply,info,INTERVAL,DAY:INTERVAL,MAX};
})();
