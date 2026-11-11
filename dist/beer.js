'use strict';
(() => {
  const COST=25, REGEN=20, MAX_ENERGY=100, LIMIT=3, WINDOW=8*60*60*1000;
  const nonNegative=(value,fallback)=>Number.isSafeInteger(value)&&value>=0?value:fallback;
  function status(hero,now=Date.now()) {
    const gold=nonNegative(hero.gold,25),energy=Math.min(MAX_ENERGY,typeof hero.energy==='number'&&Number.isSafeInteger(hero.energy*2)&&hero.energy>=0?hero.energy:100);
    const drinks=(Array.isArray(hero.beerDrinks)?hero.beerDrinks:[]).filter(t=>Number.isSafeInteger(t)&&t>=0&&t+WINDOW>now).sort((a,b)=>a-b);
    const remaining=Math.max(0,LIMIT-drinks.length),gain=Math.min(REGEN,MAX_ENERGY-energy);
    const nextAt=drinks.length?drinks[0]+WINDOW:null;
    const reason=remaining===0?'Wykorzystano limit 3 piw w ciągu 8 godzin.':gain===0?'Masz pełną energię.':gold<COST?'Potrzebujesz 25 złota.':'';
    return {gold,energy,drinks,remaining,gain,nextAt,reason};
  }
  function purchase(hero,now=Date.now()) {
    const s=status(hero,now);
    if(s.reason)throw new Error(s.reason);
    return {...hero,gold:s.gold-COST,energy:s.energy+s.gain,beerDrinks:[...s.drinks,now]};
  }
  window.BeerService={status,purchase,COST,REGEN,MAX_ENERGY,LIMIT,WINDOW};
})();
