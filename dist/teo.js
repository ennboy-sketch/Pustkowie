'use strict';
(()=>{
 const PRICE=100;
 const GOODS=[{key:'deadBones',name:'Kość truposza',art:'material-deadBones'},{key:'blackSteel',name:'Czarny kawałek stali',art:'material-blackSteel'}];
 function stock(h,key){if(!GOODS.some(g=>g.key===key))throw Error('Teo nie skupuje tego przedmiotu.');const n=h[key]??0;if(!Number.isSafeInteger(n)||n<0)throw Error('Nieprawidłowa ilość przedmiotów.');return n;}
 function sell(h,key,quantity){if(!window.TaurielQuest.canEnter(h))throw Error('Najpierw ukończ zadanie Tauriel.');if(!Number.isSafeInteger(quantity)||quantity<1)throw Error('Podaj dodatnią, całkowitą liczbę sztuk.');const count=stock(h,key);if(quantity>count)throw Error('Nie masz tylu przedmiotów.');const gold=h.gold??25,total=quantity*PRICE;if(!Number.isSafeInteger(gold)||gold<0||!Number.isSafeInteger(total)||!Number.isSafeInteger(gold+total))throw Error('Nieprawidłowa ilość złota.');return {...h,gold:gold+total,[key]:count-quantity};}
 function markup(h){return `<p class="teo-price">Cena skupu: <strong>100 złota za sztukę</strong></p><div class="teo-goods">${GOODS.map(g=>{const n=stock(h,g.key);return `<article><span class="gear-art ${g.art}" aria-hidden="true"></span><div><strong>${g.name}</strong><small>Posiadasz: ${n}</small></div><label>Sztuki<input type="number" min="1" max="${Math.max(1,n)}" value="1" step="1" data-teo-quantity="${g.key}" ${!n?'disabled':''}></label><button type="button" class="secondary" data-teo-sell="${g.key}" ${!n?'disabled':''}>Sprzedaj</button></article>`}).join('')}</div>`;}
 window.TeoTrade={PRICE,GOODS,stock,sell,markup};
})();
