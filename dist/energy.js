'use strict';
(() => {
  const INTERVAL=12*60*60*1000,MAX=100;
  const validAmount=value=>typeof value==='number'&&Number.isSafeInteger(value*2)&&value>=0;
  const isScout=hero=>hero.classId==='elf'&&hero.profession==='elf-profession-1'&&(window.Progression?.level(hero)??hero.level)>=10;
  function cost(hero,base){if(!Number.isSafeInteger(base)||base<0)throw new Error('Nieprawidłowy koszt energii.');return isScout(hero)?base/2:base;}
  const format=value=>String(value).replace('.',',');
  function cycleHours(hero){return hero.classId==='warrior'&&hero.profession==='warrior-profession-2'&&(window.Progression?.level(hero)??hero.level)>=10?6:12;}
  function apply(hero,now=Date.now()) {
    const hours=cycleHours(hero),interval=hours*60*60*1000;
    const energy=validAmount(hero.energy)?Math.min(MAX,hero.energy):MAX;
    const valid=Number.isSafeInteger(hero.nextEnergyResetAt)&&hero.nextEnergyResetAt>0;
    if(!valid)return {...hero,energy,energyCycleHours:hours,nextEnergyResetAt:now+interval};
    const oldHours=[6,12].includes(hero.energyCycleHours)?hero.energyCycleHours:24;
    // Preserve the cycle start when migrating old saves or changing profession.
    const migrated=oldHours!==hours,deadline=hero.nextEnergyResetAt+(hours-oldHours)*60*60*1000;
    if(now>=deadline){const periods=Math.floor((now-deadline)/interval)+1;return {...hero,energy:MAX,energyCycleHours:hours,nextEnergyResetAt:deadline+periods*interval};}
    return !migrated&&hero.energy===energy?hero:{...hero,energy,energyCycleHours:hours,nextEnergyResetAt:deadline};
  }
  function info(hero,now=Date.now()) {
    const normalized=apply(hero,now),seconds=Math.max(0,Math.ceil((normalized.nextEnergyResetAt-now)/1000));
    return {energy:normalized.energy,nextAt:normalized.nextEnergyResetAt,seconds,text:[Math.floor(seconds/3600),Math.floor(seconds/60)%60,seconds%60].map(n=>String(n).padStart(2,'0')).join(':')};
  }
  window.EnergyCycle={apply,info,cycleHours,cost,isScout,valid:validAmount,format,INTERVAL,DAY:INTERVAL,MAX};
})();
