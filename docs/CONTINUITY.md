# Ciągłość projektu Pustkowie

Repozytorium: https://github.com/ennboy-sketch/Pustkowie, gałąź `main`.
Gra: https://ennboy-sketch.github.io/Pustkowie/dist/.

Repozytorium zawiera kompletną statyczną grę w `dist/`. Wersja `db55730` dodała sklep ze strojami bohatera, a `fd66f7b` dodała sypialnię Vespery oraz pięć jej strojów z oryginalnych zdjęć. Kampania została przygotowana na bazie `fd66f7b`; przy kontynuacji należy pobrać aktualne `main`, ponieważ zawiera również późniejsze wdrożenia.

## Wygląd Vespery w dwóch pomieszczeniach

Pracownia pokazuje wyłącznie siedzącą Vesperę i 13 strojów zapisanych jako `vesperaOutfit`. Sypialnia pokazuje wyłącznie stojącą Vesperę i 5 osobnych strojów zapisanych jako `vesperaStandingOutfit`. Domyślny wariant sypialni to Łuczniczka Leśnego Szlaku z referencyjnego zdjęcia. Sylwetki WebP z kanałem alfa są wkomponowane w pokój bez prostokątnej ramki. Nie przywracać wcześniejszego wspólnego wyboru stroju dla obu miejsc. Starszy stojący wariant zapisany w `vesperaOutfit` odczytuje się jako wybór sypialni bez dodatkowej opłaty.

## Kampania „Pęknięta Przysięga”

Dziesięć misji głównych, w kolejności:

1. Nieproszeni goście.
2. Żelazna Przysięga.
3. Trzy niepokojące raporty.
4. Szept spod korzeni.
5. Ostatnia zmiana górników.
6. Pamięć zamknięta w kości.
7. Cmentarz bez snu.
8. Ślad na ostrzu.
9. Twarz pod maską.
10. Noc Pękniętej Korony.

Zadania poboczne: Trofea i wspomnienia, Towar bez właściciela, Zaginione lustro, Imiona poległych.

Dalsze rozdziały: Ubocze (30), Eldor (50), Lodowe Wzgórza (75), Wrota Piekieł (110). Każdy ma własne świadectwo, warunek odwiedzenia krainy, walkę i jednorazową nagrodę.

Zdrajcą jest Severin, Mistrz Pieczęci. Dokument Tauriel, księga zaginionych górników i list kuriera wskazują ten sam uszkodzony osobisty stempel. Zdrada zostaje ujawniona w dziewiątej misji. Po przerwaniu rytuału Pękniętej Korony Severin pozostaje pod strażą; dalsze rozdziały naprawiają uszkodzone pieczęcie, które nadal zagrażają światu.

Severin przebywa w Archiwum Pieczęci, za prawymi bocznymi drzwiami zamku. Ilustracja komnaty i postaci to `dist/severin-archive.webp`. Powstała od nowa na wyraźną prośbę użytkownika, ponieważ wcześniejszy plik nie był dostępny w tej rozmowie. W bieżącym środowisku dodatkowa kopia PNG znajduje się w `/workspace/scratch/Severin-Archiwum-Pieczeci.png`; plik WebP jest trwałą kopią w repozytorium.

## Zapis i zgodność

Zadania dostępne są przez Dziennik. `campaign.js` zawiera fabułę i czystą logikę stanu, a `campaign-panel.js` interfejs dziennika i spotkań. Pole `hero.campaign` ma wersję 1 i przechowuje przyjęte oraz ukończone zadania, dowody, wygrane walki, wizyty i decyzje.

Stare profile pozostają pod tymi samymi kluczami `pustkowie.hero.v2` i kluczami profili. Brak pola kampanii oznacza nowy dziennik. Dotychczasowe `taurielQuest`, `gabrielQuest` i `graveyardDefeated` zaliczają właściwe cele. Nie należy zerować tych pól ani wymagać powtórnego zdobywania naszyjnika, uzbrojenia czy topora Minotaura. Zrealizowane wyprawy zapisane w statystykach mogą zaliczać raporty.

Wypłata nagrody jest jednym zapisem pod wspólną blokadą Web Locks; ponowne potwierdzenie nie wypłaca jej drugi raz. Walki fabularne korzystają z istniejącego silnika, zapisują się jako `activeCombat.source === 'campaign'` i nie pobierają energii. Nagrody odbiera się w dzienniku po wykonaniu wszystkich celów. Eksport/import obejmuje cały postęp kampanii i aktualną komnatę.

## Sprawdzenie i publikacja

Testy logiki: `node --test tests/*.test.cjs`.

Testy przeglądarkowe przy stronie lokalnej na porcie 8020: `node tests/campaign.browser.cjs`, `node tests/castle.browser.cjs`, `node tests/lyrien-visibility.browser.cjs`, `node tests/profiles.browser.cjs`, `node tests/vespera-bedroom.browser.cjs`.

Publikacja zachowuje GitHub Pages. Jeśli automatyczne wdrożenie utknie, istniejący workflow można wywołać przez `gh workflow run pages.yml --repo ennboy-sketch/Pustkowie --ref main` bez pustych commitów. Zapis nowej wersji na `main` uruchamia istniejący proces publikacji; przed ukończeniem zadania należy sprawdzić wdrożenie i pliki pod publicznym adresem. Nie tworzyć zastępczej witryny w innej usłudze.

## Potwory 31–50 — zlecenia Roderika

Na dalsze polecenie użytkownika katalog FrontierBestiary został podłączony do Roderika. Zawiera 20 przeciwników i 5 terenów; pełna tabela, wzór nagród i opis integracji: [FRONTIER-BESTIARY.md](FRONTIER-BESTIARY.md). Oddzielny podgląd: dist/bestiary-31-50.html. Potwory występują wyłącznie w zleceniach Roderika, poza pulami Branda. Nie dodano nowych wejść na mapie.

## Najemnicy w karczmie na Uboczu

„Pod Złotym Kucem” ma trzech nowych mieszkańców: Roderika Żelaznego Kruka (tarczownik przy piecu), Mirę Szary Szlak (tropicielka przy oknach) i Durgana Krzemienia (krasnolud przy barze). `GoldenPony.PEOPLE` przechowuje ich rozmowy i stałe ID. Przednie prawe krzesło pozostaje wolne dla czwartej osoby: nie zapełniać go bez kolejnego polecenia. Nowa panorama to `golden-pony-mercenaries.webp`; oryginał pustej sali zachowano. Mira i Durgan mają rozmowy. Roderik udostępnia przycisk „Zlecenia Roderika”: łatwiejszy zwiad czasowy za bazowo 10 energii pozostaje wyłączony do późniejszej realizacji, trudniejsza walka za bazowo 15 energii jest aktywna. Zachowano premię profesji zwiadowcy (połowa kosztu). Dobór przeciwników ±3 poziomy, wejście na Ubocze od poziomu 30. Zlecenie nie losuje się ponownie przy ponownym otwarciu, a następne powstaje po rozliczeniu walki.

`roderik-missions.js` zawiera osobną logikę i panel. Pola `roderikOffer`, `activeCombat.source = roderik` i `lastRoderikCombat` przechodzą z całym profilem przez eksport/import. Koszt, konkretna nagroda, poziom gracza i `rewardVersion: 1` są zapisywane przy przyjęciu, a wynik i nagroda atomowo pod wspólną blokadą postaci. Porażka nie wypłaca nagród. Nie zmieniać ofert Branda. Testy: `node --test tests/*.test.cjs`, `node tests/roderik-missions.browser.cjs` (opcjonalnie `GAME_URL` dla opublikowanej wersji), dotychczasowe testy karczmy i Teo.
