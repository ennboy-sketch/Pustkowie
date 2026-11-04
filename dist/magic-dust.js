'use strict';
(() => {
  const COST=25;
  function count(hero){const value=hero.magicDust??0;if(!Number.isSafeInteger(value)||value<0)throw new Error('Nieprawidłowy zapis magicznego pyłu.');return value;}
  function award(hero,amount){if(!Number.isSafeInteger(amount)||amount<0)throw new Error('Nieprawidłowa ilość pyłu.');const total=count(hero)+amount;if(!Number.isSafeInteger(total))throw new Error('Za dużo magicznego pyłu.');return {...hero,magicDust:total};}
  function exchange(hero){const dust=count(hero),shards=hero.shards??0;if(dust<COST)throw new Error('Potrzebujesz 25 szt. magicznego pyłu.');if(!Number.isSafeInteger(shards)||shards<0||!Number.isSafeInteger(shards+1))throw new Error('Nieprawidłowa liczba odłamków.');return {...hero,magicDust:dust-COST,shards:shards+1};}
  function markup(hero){return `<section class="magic-dust-material" aria-label="Materiały"><img src="magic-dust.webp" alt="" width="72" height="72"><div><strong>Magiczny pył</strong><p>Posiadasz: <b data-magic-dust-count>${count(hero)}</b></p><small>Materiał alchemiczny · 25 szt. = 1 odłamek</small></div></section>`;}
  window.MagicDust={COST,count,award,exchange,markup};
})();
