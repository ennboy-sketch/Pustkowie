'use strict';
(() => {
  const MAX_LEVEL=250;
  // EXP wymagane do awansu z danego poziomu. Dalsze progi zostaną dodane później.
  const REQUIREMENTS={
    1:300,2:800,3:1500,4:2500,5:4300,
    6:7200,7:11000,8:17000,9:24000,10:33000,
    11:43000,12:58000,13:76000,14:100000,15:130000,
    16:169000,17:219000,18:283000,19:365000,20:472000,
    21:610000,22:705000,23:813000,24:937000,25:1077000,
    26:1237000,27:1418000,28:1624000,29:1857000,30:2122000,
    31:2421000,32:2761000,33:3145000,34:3580000,35:4073000,
    36:4632000,37:5194000,38:5717000,39:6264000,40:6837000,
    41:7600000,42:8274000,43:8990000,44:9753000,45:10560000,
    46:11410000,47:12320000,48:13270000,49:14280000,50:15340000,
    51:16870000,52:18960000,53:19980000,54:21420000,55:22930000,
    56:24580000,57:26200000,58:27960000,59:29800000,60:32780000,
    61:36060000,62:39670000,63:43640000,64:48000000,65:52800000,
    66:58080000,67:63890000,68:70280000,69:77310000,70:85040000,
    71:93540000,72:102900000,73:113200000,74:121000000,75:137000000,
    76:150700000,77:165700000,78:236990000,79:260650000,80:286780000,
    81:315000000,82:346970000,83:381680000,84:419770000,85:461760000,
    86:508040000,87:558740000,88:614640000,89:676130000,90:743130000,
    91:1041222000,92:1145344200,93:1259878620,94:1385866482,95:1524453130,
    96:1676898443,97:1844588288,98:2029047116,99:2050000000,100:2150000000,
    101:2210000000,102:2250000000,103:2280000000,104:2310000000,105:2330000000,
    106:2350000000,107:2370000000,108:2390000000,109:2400000000,110:2410000000,
    111:2420000000,112:2430000000,113:2440000000,114:2450000000,115:2460000000,
    116:2470000000,117:2480000000,118:2490000000,119:2500000000
  };
  function level(hero){return Number.isSafeInteger(hero.level)&&hero.level>0?Math.min(MAX_LEVEL,hero.level):1;}
  function required(atLevel){return atLevel>=MAX_LEVEL?null:REQUIREMENTS[atLevel]??null;}
  function info(hero){const current=level(hero),xp=current===MAX_LEVEL?0:Number.isSafeInteger(hero.xp)&&hero.xp>=0?hero.xp:0,need=required(current);return{level:current,xp,required:need,max:MAX_LEVEL,percent:need?Math.min(100,xp/need*100):0,label:current===MAX_LEVEL?'Maksymalny poziom':need===null?'Próg EXP do ustalenia':`${xp} / ${need} EXP`};}
  function award(hero,amount){if(!Number.isSafeInteger(amount)||amount<0)throw new Error('Nieprawidłowa ilość doświadczenia.');let at=level(hero),xp=(Number.isSafeInteger(hero.xp)&&hero.xp>=0?hero.xp:0)+amount;if(!Number.isSafeInteger(xp))throw new Error('Zbyt duża ilość doświadczenia.');while(at<MAX_LEVEL&&required(at)!==null&&xp>=required(at)){xp-=required(at);at++;}return{...hero,level:at,xp:at===MAX_LEVEL?0:xp};}
  window.Progression={MAX_LEVEL,level,required,info,award};
})();
