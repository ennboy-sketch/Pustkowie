'use strict';
(() => {
  const COSTS = Object.freeze({shards:1,gold:100});
  const SLOTS = 12;
  let activeAnimation = null;
  function cancel() { if (activeAnimation) { activeAnimation.cancel(); activeAnimation = null; } }
  function markup(hero) {
    const shards = Number.isSafeInteger(hero.shards) && hero.shards >= 0 ? hero.shards : 0;
    const gold = Number.isSafeInteger(hero.gold) && hero.gold >= 0 ? hero.gold : 25;
    return `<section class="fate-wheel" aria-label="Koło Losu przy fontannie"><div class="wheel-balances"><span>Twoje odłamki <b><i class="rpg-icon icon-shard" aria-hidden="true"></i> ${shards}</b></span><span>Twoje złoto <b><i class="rpg-icon icon-coin" aria-hidden="true"></i> ${gold}</b></span></div><div class="wheel-board" role="img" aria-label="Koło z dwunastoma nieodkrytymi polami nagród"><div class="wheel-pointer" aria-hidden="true"></div><div class="wheel-rim" aria-hidden="true"></div><div class="wheel-disc" aria-hidden="true">${Array.from({length:SLOTS},(_,i)=>`<span class="wheel-slot" style="--angle:${i*30+15}deg">?</span>`).join('')}</div><div class="wheel-hub" aria-hidden="true"><span>✦</span></div></div><p class="wheel-caption">Nagrody ustalimy później</p><p class="wheel-cost">Koszt obrotu: ${COSTS.shards} odłamek lub ${COSTS.gold} złota</p><button class="primary paid-spin" type="button" data-spin-currency="shards" disabled>Zakręć · ${COSTS.shards} odłamek</button><button class="primary paid-spin" type="button" data-spin-currency="gold" disabled>Zakręć · ${COSTS.gold} złota</button><button class="secondary preview-spin" type="button">Obróć podgląd za darmo</button><p class="wheel-result" role="status" aria-live="polite"></p><p class="panel-note wheel-note">Płatne obroty będą dostępne po dodaniu nagród. Podgląd nie pobiera złota ani odłamków i nie przyznaje nagród.</p></section>`;
  }
  function mount(container) {
    cancel();
    const button = container.querySelector('.preview-spin');
    const disc = container.querySelector('.wheel-disc');
    const status = container.querySelector('.wheel-result');
    let rotation = 0;
    button.addEventListener('click', () => {
      if (button.disabled || activeAnimation) return;
      button.disabled = true; status.textContent = 'Koło się obraca…';
      const random = new Uint32Array(1); crypto.getRandomValues(random);
      const sector = Math.floor(random[0] / 4294967296 * SLOTS);
      const end = Math.ceil(rotation/360)*360+5*360+360-(sector*30+15);
      const duration = matchMedia('(prefers-reduced-motion: reduce)').matches ? 120 : 3200;
      const animation = disc.animate([{transform:`rotate(${rotation}deg)`},{transform:`rotate(${end}deg)`}],{duration,easing:'cubic-bezier(.12,.65,.15,1)',fill:'forwards'});
      activeAnimation = animation;
      animation.finished.then(() => {
        if (activeAnimation !== animation || !disc.isConnected) return;
        rotation = end; disc.style.transform = `rotate(${end}deg)`;
        activeAnimation = null; animation.cancel(); button.disabled = false;
        status.textContent = 'Podgląd zakończony. Nie pobrano złota ani odłamków.';
      }, () => { if (activeAnimation === animation) activeAnimation = null; });
    });
  }
  window.FateWheel = {markup,mount,cancel,COSTS};
})();
