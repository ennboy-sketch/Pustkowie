'use strict';
const CLASSES = {
  warrior: { name: 'Wojownik', female: 'Wojowniczka', icon: '<path d="M12 4l4 4-14 14-4-4z" transform="translate(9 0)"/><path d="M10 18l8 8M8 25l4 4M10 27l5-5"/>' },
  mage: { name: 'Mag', female: 'Magini', icon: '<path d="M10 29L24 8M20 4l7-1 4 6-6 5-6-4zM6 8v6M3 11h6M28 23v6M25 26h6"/>' },
  elf: { name: 'Elf', female: 'Elfka', icon: '<path d="M12 3q23 14 0 28M12 3v28M5 17h26M25 12l6 5-6 5"/>' },
  dwarf: { name: 'Krasnolud', female: 'Krasnoludka', icon: '<path d="M17 5v27M7 5q10 5 20 0l4 12q-9 1-14-4-5 5-14 4zM13 30h8"/>' }
};
const IDS = Object.keys(CLASSES);
const KEY = 'pustkowie.hero.v2';
const $ = selector => document.querySelector(selector);
let classId = 'warrior';
let gender = 'male';
let step = 'choose';
function art(target) {
  const el = $(target);
  el.className = `character ${gender} ${classId}`;
  el.setAttribute('aria-label', `${CLASSES[classId].name}, płeć ${gender === 'male' ? 'męska' : 'żeńska'}`);
}
function render() {
  document.querySelectorAll('[data-class]').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.class === classId)));
  document.querySelectorAll('[data-gender]').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.gender === gender)));
  $('#class-name').textContent = gender === 'female' ? CLASSES[classId].female : CLASSES[classId].name;
  art('#choice-art'); art('#name-art'); art('#ready-art');
}
function show(next) {
  step = next;
  for (const id of ['choose', 'naming', 'ready']) $(`#${id}`).hidden = id !== next;
}
function validHero(hero) {
  return hero && hero.version === 2 && Object.hasOwn(CLASSES,hero.classId) && ['male','female'].includes(hero.gender) && typeof hero.name === 'string' && hero.name.trim().length >= 2 && hero.name.length <= 24;
}
function showSaved(hero) {
  classId = hero.classId; gender = hero.gender; render(); show('ready');
  $('#ready-name').textContent = hero.name;
  $('#identity').textContent = `${CLASSES[classId].name} · ${gender === 'male' ? 'Męska' : 'Żeńska'}`;
}
$('#classes').innerHTML = IDS.map(id => `<button type="button" class="class-option" data-class="${id}" aria-pressed="${id === classId}"><span class="medallion"><svg viewBox="0 0 36 36" aria-hidden="true">${CLASSES[id].icon}</svg></span>${CLASSES[id].name}</button>`).join('');
$('#classes').addEventListener('click', e => { const button = e.target.closest('[data-class]'); if (button) { classId = button.dataset.class; render(); } });
$('.gender').addEventListener('click', e => { const button = e.target.closest('[data-gender]'); if (button) { gender = button.dataset.gender; render(); } });
function cycle(direction) { classId = IDS[(IDS.indexOf(classId) + direction + IDS.length) % IDS.length]; render(); }
$('#previous').addEventListener('click', () => cycle(-1));
$('#following').addEventListener('click', () => cycle(1));
$('#next').addEventListener('click', () => { show('naming'); $('#hero-name').focus(); });
$('#back').addEventListener('click', () => { show('choose'); $('#next').focus(); });
$('#hero-name').addEventListener('input', () => { $('#hero-name').setCustomValidity(''); $('#name-error').textContent = ''; });
$('#name-form').addEventListener('submit', e => {
  e.preventDefault();
  const name = $('#hero-name').value.trim();
  if (name.length < 2 || name.length > 24) { $('#name-error').textContent = 'Nazwa musi mieć od 2 do 24 znaków.'; $('#hero-name').focus(); return; }
  const hero = {version:2,classId,gender,name};
  try { localStorage.setItem(KEY,JSON.stringify(hero)); $('#status').textContent = ''; }
  catch { $('#status').textContent = 'Przeglądarka blokuje zapis. Postać zniknie po odświeżeniu.'; }
  showSaved(hero); $('#ready-name').focus();
});
$('#restart').addEventListener('click', () => $('#reset-dialog').showModal());
$('#cancel-reset').addEventListener('click', () => $('#reset-dialog').close());
$('#confirm-reset').addEventListener('click', () => {
  try { localStorage.removeItem(KEY); }
  catch { $('#status').textContent = 'Nie udało się usunąć zapisu.'; $('#reset-dialog').close(); return; }
  $('#reset-dialog').close(); $('#name-form').reset(); $('#name-error').textContent = ''; $('#status').textContent = ''; show('choose'); $('#next').focus();
});
render();
try { const raw = localStorage.getItem(KEY); if (raw) { const hero = JSON.parse(raw); if (validHero(hero)) showSaved(hero); else $('#status').textContent = 'Nie można odczytać zapisanej postaci. Stwórz nową.'; } }
catch { $('#status').textContent = 'Zapis postaci jest niedostępny. Możesz stworzyć nową.'; }
