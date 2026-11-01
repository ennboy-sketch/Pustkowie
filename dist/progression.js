'use strict';
(() => {
  const MAX_LEVEL=250;
  // EXP wymagane do awansu z danego poziomu. Dalsze progi zostaną dodane później.
  const REQUIREMENTS={
    1:100,2:250,3:500,4:750,5:1000,
    6:1300,7:1700,8:2100,9:2500,10:3000,
    11:3500,12:4000,13:4500,14:5000,15:5500
  };
  function level(hero){return Number.isSafeInteger(hero.level)&&hero.level>0?Math.min(MAX_LEVEL,hero.level):1;}
  function required(atLevel){return atLevel>=MAX_LEVEL?null:REQUIREMENTS[atLevel]??null;}
  function info(hero){const current=level(hero),xp=current===MAX_LEVEL?0:Number.isSafeInteger(hero.xp)&&hero.xp>=0?hero.xp:0,need=required(current);return{level:current,xp,required:need,max:MAX_LEVEL,percent:need?Math.min(100,xp/need*100):0,label:current===MAX_LEVEL?'Maksymalny poziom':need===null?'Próg EXP do ustalenia':`${xp} / ${need} EXP`};}
  function award(hero,amount){if(!Number.isSafeInteger(amount)||amount<0)throw new Error('Nieprawidłowa ilość doświadczenia.');let at=level(hero),xp=(Number.isSafeInteger(hero.xp)&&hero.xp>=0?hero.xp:0)+amount;if(!Number.isSafeInteger(xp))throw new Error('Zbyt duża ilość doświadczenia.');while(at<MAX_LEVEL&&required(at)!==null&&xp>=required(at)){xp-=required(at);at++;}return{...hero,level:at,xp:at===MAX_LEVEL?0:xp};}
  window.Progression={MAX_LEVEL,level,required,info,award};
})();
