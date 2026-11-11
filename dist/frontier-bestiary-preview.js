'use strict';
(() => {
  const catalog=window.FrontierBestiary,number=new Intl.NumberFormat('pl-PL');
  const format=n=>number.format(n);
  const atlas=(item,label,className)=>{const rect=item.crop||{x:item.tile%item.columns/item.columns,y:Math.floor(item.tile/item.columns)/item.rows,width:1/item.columns,height:1/item.rows};return `<div class="atlas ${className}" role="img" aria-label="${label}" style="--atlas:url('${item.image}');--cols:${1/rect.width};--rows:${1/rect.height};--x:${rect.x/(1-rect.width)*100}%;--y:${rect.y/(1-rect.height)*100}%"></div>`;};
  document.querySelector('#region-links').innerHTML=catalog.LOCATIONS.map(place=>`<a href="#${place.id}">${place.name}</a>`).join('');
  document.querySelector('#bestiary-regions').innerHTML=catalog.LOCATIONS.map(place=>`<section class="region" id="${place.id}"><div class="region-heading">${atlas(place,place.name,'region-art')}<div><p class="eyebrow">POZIOMY ${place.levels.join('–')}</p><h2>${place.name}</h2><p>${place.description}</p></div></div><div class="monster-grid">${catalog.MONSTERS.filter(enemy=>enemy.sceneId===place.id).map(enemy=>`<article class="monster" data-monster="${enemy.id}">${atlas(enemy,enemy.name,'monster-portrait')}<div class="monster-body"><span class="level-tag">Poziom ${enemy.level}</span><h3>${enemy.name}</h3><p class="contract">Zlecenie: ${enemy.contractTitle}</p><p>${enemy.description}</p><dl><div><dt>Życie</dt><dd>${format(enemy.maxHp)} HP</dd></div><div><dt>Atak</dt><dd>${enemy.attack.join('–')}</dd></div><div><dt>Rodzaj</dt><dd>${({fire:'Ogień',magic:'Magia'})[enemy.attackElement]||'Fizyczny'}</dd></div><div><dt>Złoto</dt><dd>${format(enemy.reward.gold)}</dd></div></dl><div class="reward"><span>Nagroda przy Twoim poziomie</span><strong data-xp></strong><small data-share></small></div><p class="traits">${enemy.traits}</p></div></article>`).join('')}</div></section>`).join('');
  const input=document.querySelector('#player-level');
  function update(){
    const level=Number(input.value);if(!Number.isInteger(level)||level<31||level>50){document.querySelector('#balance-note').textContent='Wybierz poziom od 31 do 50.';return;}
    const need=window.Progression.required(level);document.querySelector('#balance-note').textContent=`Poziom ${level} → ${level+1}: ${format(need)} EXP. Potwór na równym poziomie: ${format(catalog.rewardFor(catalog.atLevel(level).id,level).xp)} EXP.`;
    for(const article of document.querySelectorAll('[data-monster]')){
      const enemy=catalog.get(article.dataset.monster),reward=catalog.rewardFor(enemy.id,level),share=reward.xp/need*100;
      article.querySelector('[data-xp]').textContent=`${format(reward.xp)} EXP`;
      article.querySelector('[data-share]').textContent=`${share.toLocaleString('pl-PL',{maximumFractionDigits:2})}% progu gracza · ${Math.abs(level-enemy.level)<=3?'W planowanym zakresie ±3 poziomów':'Poza planowanym zakresem ±3 poziomów'}`;
    }
  }
  input.addEventListener('input',update);update();
})();
