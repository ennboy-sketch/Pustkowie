'use strict';
const CLASSES = {
  warrior: { name: 'Wojownik', role: 'ŻELAZO I KREW', description: 'Gdy tarcze pękają, ty wciąż stoisz. Ostatni bastion przeciw nadciągającej ciemności.', stats: [12, 5, 3, 10], weapon: 'Wyszczerbiony miecz', armor: 'Znoszona kolczuga', hp: 150 },
  mage: { name: 'Mag', role: 'POPIÓŁ I TAJEMNICE', description: 'Słyszysz szepty, których inni nie słyszą. Za każdą iskrę mocy przyjdzie zapłacić.', stats: [3, 5, 12, 6], weapon: 'Kostur z czarnego jesionu', armor: 'Szata wygnańca', hp: 90 },
  ranger: { name: 'Zwiadowca', role: 'CIEŃ I CISZA', description: 'Znasz ścieżki, z których nikt nie wraca. Twój cel poznaje cię po ostatnim oddechu.', stats: [5, 12, 4, 7], weapon: 'Łuk z martwego cisu', armor: 'Skórzany płaszcz tropiciela', hp: 110 }
};
const KEY = 'pustkowie.hero.v1';
let selected = 'warrior';
const $ = (selector) => document.querySelector(selector);
const labels = ['Siła', 'Zręczność', 'Inteligencja', 'Wytrzymałość'];
// Własna ilustracja SVG: ruiny i sylwetka bohatera, bez zewnętrznych zasobów.
function artwork(type) {
  const mage = type === 'mage', ranger = type === 'ranger';
  const weapon = mage ? '<path d="M241 260L254 76" stroke="#827c66" stroke-width="6"/><path d="M254 76l-13-21 16-22 12 24z" fill="#91acaa"/><circle cx="256" cy="57" r="22" fill="#91acaa" opacity=".12"/>' : ranger ? '<path d="M251 67Q315 170 247 275" fill="none" stroke="#9c8865" stroke-width="6"/><path d="M251 67L247 275" stroke="#bbb191" fill="none"/>' : '<path d="M252 42l7 22-5 151h-8l-3-151z" fill="#a4a69a"/><path d="M229 213h42v7h-42z" fill="#af9770"/><path d="M250 217v37" stroke="#554b3a" stroke-width="9"/>';
  return `<svg viewBox="0 0 360 300" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="180" cy="94" r="60" fill="#babba2" opacity=".08"/><circle cx="180" cy="94" r="42" fill="none" stroke="#babba2" opacity=".12"/><path d="M0 55L22 60V144H38V85H56V32L75 13V132H91V78H108V205H0Z M360 70H332V127H314V31L300 8L281 31V166H261V101H246V213H360Z" fill="#101814" opacity=".62"/><path d="M0 269L58 236L100 253L140 230L202 260L291 228L360 250V300H0Z" fill="#111914"/>${weapon}<path d="M161 93Q180 62 201 94L216 143L236 174L245 290H110L120 175L146 140Z" fill="${mage ? '#202b2b' : ranger ? '#283024' : '#30332d'}" stroke="#747461" stroke-width="1"/><path d="M161 95Q181 76 201 96L207 126L178 153L152 126Z" fill="#111813"/><path d="M167 106L178 101L191 106L188 129L180 138L169 129Z" fill="${ranger || mage ? '#47483b' : '#7b7d6b'}"/><path d="M179 107V130M169 114H190" stroke="#141c18" stroke-width="4"/><path d="M147 142L180 155L213 142L220 168L181 183L139 166Z" fill="#55594c"/><path d="M147 172L136 241L180 270L223 241L211 172L180 187Z" fill="${mage ? '#293633' : '#3b4135'}"/><path d="M179 185V270M143 217L215 231" stroke="#78745c" stroke-width="2"/><path d="M137 161L113 183L99 238L118 248L148 180M216 161L237 180L252 236L234 247L205 184" fill="#414a3b" stroke="#626855"/><path d="M110 279L142 250L177 272L215 252L249 283" fill="none" stroke="#77725b" opacity=".4"/><path d="M0 288Q88 255 171 288T360 275V300H0Z" fill="#171d16"/><g fill="#c3a572" opacity=".6"><circle cx="70" cy="194" r="1"/><circle cx="284" cy="139" r="1.3"/><circle cx="101" cy="64" r="1"/><circle cx="310" cy="242" r="1"/></g></svg>`;
}
function renderChoices() {
  $('.classes').innerHTML = Object.entries(CLASSES).map(([id,c]) => `<button type="button" class="class-card" data-class="${id}" aria-pressed="${selected === id}"><div class="art">${artwork(id)}</div><span class="choice" aria-hidden="true">✓</span><div class="card-content"><div class="card-top"><h3>${c.name}</h3><span class="role">${c.role}</span></div><p>${c.description}</p><div class="class-stats"><span>Siła <b>${c.stats[0]}</b></span><span>Zręczność <b>${c.stats[1]}</b></span><span>Inteligencja <b>${c.stats[2]}</b></span></div></div></button>`).join('');
}
function validHero(hero) { return hero && hero.version === 1 && Object.hasOwn(CLASSES, hero.classId) && typeof hero.name === 'string' && hero.name.trim().length >= 2 && hero.name.length <= 24; }
function showHero(hero) {
  if (!validHero(hero)) return;
  const c = CLASSES[hero.classId];
  $('#creation').hidden = true;
  $('#hero').hidden = false;
  $('#hero-title').textContent = hero.name;
  $('#hero-class').textContent = c.name + ' / ' + c.role;
  $('#hero-lore').textContent = c.description;
  $('#hero-art').innerHTML = artwork(hero.classId);
  $('#hp').textContent = `${c.hp} / ${c.hp}`;
  $('#attributes').innerHTML = labels.map((label,i) => `<div class="attribute"><span>${label}</span><b>${c.stats[i]}</b></div>`).join('');
  $('#weapon').textContent = c.weapon;
  $('#armor').textContent = c.armor;
  document.title = `${hero.name} — Pustkowie`;
}
renderChoices();
$('.classes').addEventListener('click', event => {
  const card = event.target.closest('[data-class]');
  if (!card) return;
  selected = card.dataset.class;
  document.querySelectorAll('[data-class]').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.class === selected)));
});
$('#hero-name').addEventListener('input', () => $('#hero-name').setCustomValidity(''));
$('#create-form').addEventListener('submit', event => {
  event.preventDefault();
  const name = $('#hero-name').value.trim();
  if (name.length < 2) { $('#hero-name').setCustomValidity('Podaj imię mające co najmniej 2 znaki.'); $('#hero-name').reportValidity(); return; }
  const hero = { version: 1, name, classId: selected };
  try { localStorage.setItem(KEY, JSON.stringify(hero)); $('#status').textContent = 'Bohater zapisany. Twój płomień wciąż płonie.'; }
  catch { $('#status').textContent = 'Bohater utworzony, ale przeglądarka blokuje zapis. Po odświeżeniu postęp zniknie.'; }
  showHero(hero);
  $('#hero-title').setAttribute('tabindex','-1');
  $('#hero-title').focus();
});
$('#new-hero').addEventListener('click', () => $('#reset-dialog').showModal());
$('#cancel-reset').addEventListener('click', () => $('#reset-dialog').close());
$('#confirm-reset').addEventListener('click', () => {
  try { localStorage.removeItem(KEY); } catch { $('#status').textContent = 'Nie udało się usunąć zapisu. Sprawdź ustawienia przeglądarki.'; $('#reset-dialog').close(); return; }
  $('#hero').hidden = true; $('#creation').hidden = false; $('#reset-dialog').close(); $('#create-form').reset(); $('#hero-name').setCustomValidity(''); $('#status').textContent = ''; document.title = 'Pustkowie — narodziny bohatera'; $('#hero-name').focus();
});
try {
  const saved = localStorage.getItem(KEY);
  if (saved) { const hero = JSON.parse(saved); if (validHero(hero)) showHero(hero); else $('#status').textContent = 'Poprzedni zapis jest niezgodny. Możesz stworzyć nowego bohatera.'; }
} catch { $('#status').textContent = 'Nie można odczytać zapisu. Możesz grać, ale zapis może być niedostępny.'; }
