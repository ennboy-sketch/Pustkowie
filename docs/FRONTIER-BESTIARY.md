# Pogranicze Wrót — potwory 31–50 u Roderika

20 przeciwników, dokładnie jeden na poziom. Aktywne zlecenia Roderika w karczmie Pod Złotym Kucem na Uboczu. Nie rejestrować w ofertach Branda, zwiadach ani jako wejścia na mapie.

Podgląd: [bestiariusz](https://ennboy-sketch.github.io/Pustkowie/dist/bestiary-31-50.html). Podgląd nie korzysta z magazynu zapisów, nie rozpoczyna walk i nie wypłaca nagród.

## Tereny

- **Popielny Bór (31–34)** — Spalony bór na dawnym szlaku z Ubocza. Pod korą drzew tli się obcy żar, a zwierzęta noszą ślady skażenia z południowych szczelin.
- **Martwe Rozlewiska (35–38)** — Zatopiony trakt karawan. Zielone ogniki prowadzą między groblami, gdzie osiadł popiół niesiony od wulkanicznych pustkowi.
- **Kopalnie Czarnego Żaru (39–42)** — Opuszczone sztolnie na skraju wulkanicznego pasma. Górnicy przebili warstwę czarnej rudy, która nadal zasila wygasłe piece.
- **Ruiny Spalonej Przysięgi (43–46)** — Ruiny strażnicy przy dawnym trakcie ku Wrotom. Pęknięte kamienie przysięgi budzą zbroje i przyciągają istoty żywiące się magią pieczęci.
- **Przedpola Piekielnych Wrót (47–50)** — Zewnętrzne bazaltowe pustkowia, daleko przed właściwą bramą. Zwiadowcy spotykają tu pomniejsze istoty żaru; same Wrota pozostają krainą od poziomu 110.

## Nagrody i trudność

Próg to EXP wymagany do następnego poziomu, odczytany z Progression.required, nie suma doświadczenia od początku gry. Wzór: floor(min(próg poziomu gracza, próg poziomu potwora) × 18%). Na równym poziomie potrzeba sześciu zwycięstw od pustego paska EXP. Słabszy przeciwnik nie zwiększa swojej nagrody, gdy gracz awansuje. Silniejszy nie daje więcej niż 18% bieżącego progu gracza. Dobór: ±3 poziomy, jak u Branda; jego pule pozostają nietknięte.

Złoto jest stałe dla gatunku: 300 + 25 × (poziom − 31) + 5 × floor((poziom − 31) / 4). Bez dodatkowych przedmiotów i odłamków. Przy przyjęciu misji Roderika zapisuje się konkretną nagrodę, poziom gracza i rewardVersion: 1; przy odbiorze nie przelicza się ich ponownie. Porażka nie wypłaca nagrody. Walka kosztuje bazowo 15 energii (z premią profesji zwiadowcy: 7,5). Łatwiejszy zwiad za bazowo 10 energii pozostaje wyłączony do późniejszego dodania.

HP rośnie od 960 do 2500 względem 900 HP Bazyliszka (30). Bazowy atak rośnie od 157–177 do 290–329. Zdolności korzystają wyłącznie z istniejących mechanik: mocniejszy cios, przebicie, jad, magiczna fala, pancerz, podatności i furia. Zachowano przygotowane parametry potworów; trudniejsze zlecenia wymagają rozwiniętej i wyposażonej postaci.

| Poz. | Potwór | Teren | HP | Atak | EXP na równym poziomie | Złoto | Próg awansu |
| ---: | --- | --- | ---: | --- | ---: | ---: | ---: |
| 31 | Żarłacz Popiołu | Popielny Bór | 960 | 157–177 | 435780 | 300 | 2421000 |
| 32 | Jeleń Spopielonych Rogów | Popielny Bór | 1020 | 164–185 | 496980 | 325 | 2761000 |
| 33 | Ciernisty Pogorzelec | Popielny Bór | 1100 | 171–193 | 566100 | 350 | 3145000 |
| 34 | Strażnik Ostatniego Żaru | Popielny Bór | 1200 | 178–201 | 644400 | 375 | 3580000 |
| 35 | Utopiony Przewoźnik | Martwe Rozlewiska | 1260 | 185–209 | 733140 | 405 | 4073000 |
| 36 | Hydra Martwej Grobli | Martwe Rozlewiska | 1340 | 192–217 | 833760 | 430 | 4632000 |
| 37 | Żałobnica Rozlewisk | Martwe Rozlewiska | 1400 | 199–225 | 934920 | 455 | 5194000 |
| 38 | Torfowy Kolos | Martwe Rozlewiska | 1510 | 206–233 | 1029060 | 480 | 5717000 |
| 39 | Żużlowy Skorpion | Kopalnie Czarnego Żaru | 1580 | 213–241 | 1127520 | 510 | 6264000 |
| 40 | Zakuty Nadzorca | Kopalnie Czarnego Żaru | 1650 | 220–249 | 1230660 | 535 | 6837000 |
| 41 | Golem Czarnej Rudy | Kopalnie Czarnego Żaru | 1760 | 227–257 | 1368000 | 560 | 7600000 |
| 42 | Żywy Piec | Kopalnie Czarnego Żaru | 1840 | 234–265 | 1489320 | 585 | 8274000 |
| 43 | Rycerz Złamanych Ślubów | Ruiny Spalonej Przysięgi | 1910 | 241–273 | 1618200 | 615 | 8990000 |
| 44 | Pożeracz Pieczęci | Ruiny Spalonej Przysięgi | 1990 | 248–281 | 1755540 | 640 | 9753000 |
| 45 | Widmo Spalonego Chóru | Ruiny Spalonej Przysięgi | 2070 | 255–289 | 1900800 | 665 | 10560000 |
| 46 | Upadły Kustosz Przysięgi | Ruiny Spalonej Przysięgi | 2180 | 262–297 | 2053800 | 690 | 11410000 |
| 47 | Ogar Piekielnego Pogranicza | Przedpola Piekielnych Wrót | 2240 | 269–305 | 2217600 | 720 | 12320000 |
| 48 | Bazaltowy Gargulec | Przedpola Piekielnych Wrót | 2330 | 276–313 | 2388600 | 745 | 13270000 |
| 49 | Przywoływacz Popiołów | Przedpola Piekielnych Wrót | 2410 | 283–321 | 2570400 | 770 | 14280000 |
| 50 | Strażnik Przedbramia | Przedpola Piekielnych Wrót | 2500 | 290–329 | 2761200 | 795 | 15340000 |

## Integracja z Roderikiem

Plik dist/frontier-bestiary.js udostępnia FrontierBestiary: LOCATIONS, MONSTERS, get(id), atLevel(level), rewardFor(id, poziomGracza). STATUS = available-at-roderik i MISSION_POOL_ENABLED = true. Katalog jest głęboko zamrożony; funkcje nagród zwracają świeże obiekty. Nie ma funkcji zapisu ani odbioru nagród. index.html ładuje katalog i osobny moduł roderik-missions.js.

Stałe ID potworów i terenów są niezależne od polskich nazw. MONSTERS mają format danych zgodny z BrandCombat.createBattle i BrandCombat.advance, lecz nie są zarejestrowane w jego aktywnych ROSTERS. Renderer walki obsługuje nowe atlasy (w tym nierówne kadry ruin) i tereny. Nie wolno po prostu dopisać potworów do Branda.

Grafiki: pięć atlasów frontier-monsters-*.webp z czterema przeciwnikami oraz frontier-locations.webp (3 kolumny, 2 wiersze: pięć terenów i widok pogranicza w szóstym polu). Portrety wybiera tile w kolejności wierszowej. W atlasie ruin wiersze mają różne wysokości; podane crop (znormalizowane x, y, width, height) ma pierwszeństwo przed siatką columns/rows. Oryginały PNG są lokalnie w generated_images; repozytorium zawiera komplet WebP.

Wrota Piekieł na mapie wciąż wymagają poziomu 110. Przedpola 47–50 są nowym, odrębnym terenem zewnętrznym, a Strażnik Przedbramia nie jest władcą ani bossem właściwych Wrót.

Walidacja: node --test tests/*.test.cjs; node tests/frontier-bestiary.browser.cjs przy lokalnym serwerze na porcie 8020. Obejmuje dokładność progów i limitów, przenoszenie EXP przy awansie, izolację pul i zapisów, wznowienie symulacji wszystkich potworów, ich zdolności, zwycięstwo i porażkę oraz podgląd na komputerze i telefonie.
