# Pustkowie

Nowy ekran tworzenia postaci w mrocznym klimacie fantasy.

1. Wybór jednej z czterech klas: wojownik, mag, elf, krasnolud.
2. Wybór płci: męska lub żeńska. Każda z ośmiu kombinacji ma własną ilustrację.
3. Przejście przyciskiem „Dalej” do osobnego ekranu nazwy.
4. Utworzenie postaci i zapis w localStorage.

Strzałki pozwalają również przełączać klasy. Powrót z ekranu nazwy zachowuje wybór. Usunięcie zapisanej postaci wymaga potwierdzenia. Nowy zapis v2 jest niezależny od starego prototypu v1.

## Uruchomienie

Gra online: [Pustkowie](https://ennboy-sketch.github.io/Pustkowie/dist/). Adres główny `https://ennboy-sketch.github.io/Pustkowie/` automatycznie przekierowuje do gry w `dist/` dzięki plikowi `index.html` w katalogu głównym repozytorium. Plik jest również punktem wejścia GitHub Pages, aby serwis nie wyświetlał README zamiast gry. Przekierowanie zachowuje parametry i fragment adresu, zastępuje wpis w historii oraz nie zmienia domeny ani zapisu postaci w localStorage.

Otwórz `dist/index.html` lub uruchom `python3 -m http.server 8000 --directory dist` i przejdź do `http://localhost:8000`.

Brak zależności i etapu budowania. Fonty Google są opcjonalne. Ilustracje postaci i ikony są oryginalnymi grafikami wygenerowanymi dla Pustkowia; tło kreatora jest lokalnym SVG. Atlas ma 4 kolumny i 2 wiersze: wojownik, mag, elf, krasnolud; najpierw mężczyźni, potem kobiety. Obraz wyświetlany przez CSS bez zewnętrznego serwera.

Zapis jest lokalny dla przeglądarki i adresu strony. Nie ma jeszcze kont, rozgrywki ani synchronizacji między urządzeniami.


## Interfejs zamku

Utworzona lub zapisana postać otwiera bezpośrednio Zamek Czarnej Stali. Autorska mapa ma siedem interaktywnych miejsc, panel zasobów i boczne menu. Na telefonie menu otwiera przycisk w lewym górnym rogu; mapę można przesuwać palcem. Działają karta bohatera, podgląd wyposażenia i dziennik przybycia. Statystyki i zasoby są startowe; walka, handel, gildie i wyprawy mają oznaczenie „W przygotowaniu”.

Żeńskie postacie używają szerszego kadru drugiego rzędu atlasu, aby zachować pełną sylwetkę i głowę. Zapis v2 pozostaje zgodny z poprzednią wersją.

## Koszary i profesje

Koszary Żelaznej Przysięgi znajdują się przy placu treningowym (znacznik na mapie i menu ŚWIAT). Każda klasa (wojownik, mag, elf, krasnolud) ma dwa osobne miejsca na profesje, łącznie 8. Nazwy i umiejętności ustalimy później. Robocze etykiety to Profesja 1 i Profesja 2; identyfikatory są osobne dla każdej klasy.

Wymagany poziom to 10. Dopóki profesje mają pending: true, wybór jest niedostępny również po osiągnięciu tego poziomu. Blokada działa w interfejsie i obsłudze formularza. Poprzednie robocze nazwy zostały usunięte; istniejące zapisy postaci nie są nadpisywane podczas wczytywania. Wybrana docelowo profesja będzie zapisywana w istniejącym zapisie v2. Stare zapisy bez pola level mają poziom 1. System zdobywania poziomów i umiejętności pozostaje w przygotowaniu.

## Ikony interfejsu

Menu, znaczniki mapy i panele korzystają z lokalnego atlasu `dist/rpg-icons.webp` (4 × 4). Kolejność: zamek, karczma, koszary, arena / lochy, kuźnia, alchemik, targ / bohater, ekwipunek, dziennik, gildia / złoto, odłamki, energia, pomoc. `dist/icons.css` ustawia kadry i rozmiary. Ikony są dekoracyjne; nazwy przycisków pozostają dostępne dla czytników ekranu.

## Koło Losu przy fontannie

Centralna fontanna otwiera Koło Losu z siedmioma nagrodami. Obrót kosztuje 1 odłamek lub 100 złota, z osobnymi przyciskami i saldami obu walut. Nagroda i koszt zapisują się atomowo przed animacją pod wspólną blokadą postaci: zamknięcie okna lub odświeżenie nie kasuje nagrody ani nie przyznaje jej ponownie. Ostatni wynik jest widoczny po powrocie do koła. Płatne obroty są aktywne; dawny darmowy podgląd został zastąpiony grą o nagrody.

## Karczma

Kliknięcie Karczmy na mapie lub w menu otwiera autorską ilustrację wnętrza: Tobiasz za ladą po lewej, Dowódca Brand przy stole, dorosła elfka Tauriel po prawej. Podpisy są przyciskami wyświetlającymi krótkie powitania. Panel nie uruchamia wypraw ani zakupów i nie zmienia zapisu postaci. Cała ilustracja pozostaje widoczna na telefonie i komputerze; obsługę panelu i styl określają `tavern.js` oraz `tavern.css`.

### Swobodne przesuwanie i schody

Karczma ma szeroki widok sali i schodów po prawej, przewijany swobodnie w obu osiach jak mapa zamku. Można przesuwać go palcem, gładzikiem, paskiem przewijania lub przeciągnięciem myszy; nie ma stron ani przyciągania do kadrów. Kliknięcie schodów otwiera osobne okno z informacją o wymaganej misji Tauriel. Przeciąganie przez schody nie otwiera komunikatu. Wejście na piętro odblokowuje misja Tauriel opisana poniżej.

Karczma wypełnia panel aż do dolnej krawędzi: paski przewijania oraz stałe pole instrukcji i rozmów są ukryte. Rozmowa z NPC otwiera osobne okno tylko po kliknięciu postaci. Rozmiar panoramy dopasowuje się do wysokości okna.

Sala i schody korzystają teraz z jednej spójnej ilustracji `tavern-panorama.webp`. Panorama jest skalowana z zachowaniem proporcji pliku; w przesuwanym widoku nie są łączone dwa oddzielne obrazy.

## Piwo u Tobiasza

Kliknięcie Tobiasza otwiera zakup piwa: koszt 25 złota, regeneracja do 20 energii (maksymalnie 100 energii). Przy pełnej energii, braku złota lub wykorzystanym limicie zakup jest zablokowany. Panel pokazuje faktyczną regenerację, środki, pozostałe piwa i licznik czasu.

Limit to 3 zakupy w ruchomym oknie ostatnich 8 godzin. Każdy wpis w `hero.beerDrinks` zwalnia miejsce dokładnie po 8 godzinach. Limitu nie resetuje zamknięcie karczmy ani odświeżenie strony. Nowe postacie mają `gold: 25`, `energy: 100`, `beerDrinks: []`; starsze zapisy przyjmują te wartości domyślne bez automatycznego nadpisywania.

Zakup sprawdza najnowszy zapis i zapisuje złoto, energię i czas piwa w jednej operacji localStorage. Przy nieudanym zapisie nie następuje pobranie waluty. Web Locks zabezpiecza zakupy równoległe w kartach wspierających tę funkcję. Panel główny i ekwipunek odczytują aktualne zasoby. Reguły znajdują się w `beer.js`. Gra nadal zapisuje dane wyłącznie lokalnie, a czas odnowienia opiera się na zegarze urządzenia.

## Misje Dowódcy Branda

Brand ma dwie zakładki: Zwiad czasowy i Walka z potworami. Zwiad można rozpocząć, a po upływie czasu zgłosić powrót. Jedna postać ma jeden aktywny zwiad; zapis obejmuje czas rozpoczęcia, zakończenia i poziom przy przyjęciu. Zamknięcie panelu, opuszczenie gry i odświeżenie nie resetują czasu. Ostatni ukończony zwiad jest zapisywany jako `lastScout`.

Przedziały z nakładającymi się granicami zostały zinterpretowane jako zmiana czasu od poziomu 3, 8 i 15: poziomy 1–2 → 1 minuta, 3–7 → 5 minut, 8–14 → 10 minut, 15–25 → 15 minut. Czas powyżej poziomu 25 pozostaje do ustalenia. Zmiana poziomu podczas aktywnej misji nie zmienia jej czasu.

Widok walki i mechanizm tur są przygotowane; listy potworów pozostają puste. Rozpoczęcie zwiadu kosztuje 5 energii, a zgłoszenie powrotu nie kosztuje dodatkowej energii. Zwiad przyznaje losowe złoto i EXP po zgłoszeniu powrotu. Reguły i panel znajdują się w `missions.js` oraz `missions.css`; zapis korzysta z tej samej transakcji localStorage i blokady Web Locks co zakupy piwa. Ukończenie zwiadu Branda nie odblokowuje schodów związanych z osobną misją Tauriel.


## Odnowienie energii co 12 godzin

Energia odnawia się do 100 punktów w stałym cyklu co 12 godzin. Nowa postać ma termin liczony od utworzenia. Starszy zapis cyklu 24-godzinnego jednorazowo przesuwa termin o 12 godzin wcześniej, zachowując rytm odnowienia. Jeżeli skrócony termin już upłynął, energia odnawia się przy wczytaniu. Zapis bez terminu rozpoczyna cykl 12-godzinny z zachowaniem posiadanej energii. Powrót po dłuższej przerwie uzupełnia energię raz, bez sumowania ponad 100. Pole `energyCycleHours: 12` zapobiega ponownej migracji. Zakupy piwa i misje nie przesuwają terminu, a limit piwa jest niezależny.

Panel energii pokazuje czas do odnowienia. Gra sprawdza termin podczas działania, po powrocie do karty i przy operacjach na postaci. Aktualizacja energii korzysta z tej samej blokady zapisu co piwo i misje; przy błędzie zapisu surowe dane pozostają bez zmian. Czas pochodzi z zegara urządzenia. Reguły są w `energy.js`.


## Poziomy i EXP

Limit postaci wynosi 250 poziomów. `progression.js` określa wymagania EXP na awans z danego poziomu na kolejny:

| Poziom | EXP do następnego poziomu |
| --- | ---: |
| 1 | 300 |
| 2 | 800 |
| 3 | 1 500 |
| 4 | 2 500 |
| 5 | 4 300 |
| 6 | 7 200 |
| 7 | 11 000 |
| 8 | 17 000 |
| 9 | 24 000 |
| 10 | 33 000 |
| 11 | 43 000 |
| 12 | 58 000 |
| 13 | 76 000 |
| 14 | 100 000 |
| 15 | 130 000 |
| 16 | 169 000 |
| 17 | 219 000 |
| 18 | 283 000 |
| 19 | 365 000 |
| 20 | 472 000 |
| 21 | 610 000 |
| 22 | 705 000 |
| 23 | 813 000 |
| 24 | 937 000 |
| 25 | 1 077 000 |
| 26 | 1 237 000 |
| 27 | 1 418 000 |
| 28 | 1 624 000 |
| 29 | 1 857 000 |
| 30 | 2 122 000 |
| 31 | 2 421 000 |
| 32 | 2 761 000 |
| 33 | 3 145 000 |
| 34 | 3 580 000 |
| 35 | 4 073 000 |
| 36 | 4 632 000 |
| 37 | 5 194 000 |
| 38 | 5 717 000 |
| 39 | 6 264 000 |
| 40 | 6 837 000 |
| 41 | 7 600 000 |
| 42 | 8 274 000 |
| 43 | 8 990 000 |
| 44 | 9 753 000 |
| 45 | 10 560 000 |
| 46 | 11 410 000 |
| 47 | 12 320 000 |
| 48 | 13 270 000 |
| 49 | 14 280 000 |
| 50 | 15 340 000 |
| 51 | 16 870 000 |
| 52 | 18 960 000 |
| 53 | 19 980 000 |
| 54 | 21 420 000 |
| 55 | 22 930 000 |
| 56 | 24 580 000 |
| 57 | 26 200 000 |
| 58 | 27 960 000 |
| 59 | 29 800 000 |
| 60 | 32 780 000 |
| 61 | 36 060 000 |
| 62 | 39 670 000 |
| 63 | 43 640 000 |
| 64 | 48 000 000 |
| 65 | 52 800 000 |
| 66 | 58 080 000 |
| 67 | 63 890 000 |
| 68 | 70 280 000 |
| 69 | 77 310 000 |
| 70 | 85 040 000 |
| 71 | 93 540 000 |
| 72 | 102 900 000 |
| 73 | 113 200 000 |
| 74 | 121 000 000 |
| 75 | 137 000 000 |
| 76 | 150 700 000 |
| 77 | 165 700 000 |
| 78 | 236 990 000 |
| 79 | 260 650 000 |
| 80 | 286 780 000 |
| 81 | 315 000 000 |
| 82 | 346 970 000 |
| 83 | 381 680 000 |
| 84 | 419 770 000 |
| 85 | 461 760 000 |
| 86 | 508 040 000 |
| 87 | 558 740 000 |
| 88 | 614 640 000 |
| 89 | 676 130 000 |
| 90 | 743 130 000 |
| 91 | 1 041 222 000 |
| 92 | 1 145 344 200 |
| 93 | 1 259 878 620 |
| 94 | 1 385 866 482 |
| 95 | 1 524 453 130 |
| 96 | 1 676 898 443 |
| 97 | 1 844 588 288 |
| 98 | 2 029 047 116 |
| 99 | 2 050 000 000 |
| 100 | 2 150 000 000 |
| 101 | 2 210 000 000 |
| 102 | 2 250 000 000 |
| 103 | 2 280 000 000 |
| 104 | 2 310 000 000 |
| 105 | 2 330 000 000 |
| 106 | 2 350 000 000 |
| 107 | 2 370 000 000 |
| 108 | 2 390 000 000 |
| 109 | 2 400 000 000 |
| 110 | 2 410 000 000 |
| 111 | 2 420 000 000 |
| 112 | 2 430 000 000 |
| 113 | 2 440 000 000 |
| 114 | 2 450 000 000 |
| 115 | 2 460 000 000 |
| 116 | 2 470 000 000 |
| 117 | 2 480 000 000 |
| 118 | 2 490 000 000 |
| 119 | 2 500 000 000 |

Progi nie są sumą EXP od początku gry. Nadwyżka przechodzi na kolejny poziom, a duża nagroda może dać kilka awansów. Na poziomie 120 i wyższych dalsze wymagania pozostają do ustalenia; EXP jest zachowywane bez automatycznych awansów ponad znane progi. Wczytanie istniejącej postaci nie resetuje jej poziomu ani EXP. Paski doświadczenia i nagrody zwiadu oraz walk korzystają z tego samego modułu.

### Trzy losowe miejsca zwiadu

Nowy zwiad Branda losuje jedno z trzech miejsc: Mroczny Las (`forest`), Stara Kopalnia (`mine`) lub Podziemia Miasta (`undercity`). Każde ma własny tytuł, opis i oryginalną ilustrację `scout-*.webp`. Wybór jest losowany raz przy rozpoczęciu, zapisany jako `activeMission.sceneId` i kopiowany do `lastScout` po powrocie. Odświeżenie lub ponowne otwarcie panelu nie losuje miejsca ponownie. Przed przyjęciem panel pokazuje podgląd trzech kierunków. Starsza aktywna misja bez `sceneId` zachowuje dotychczasowy czas i neutralny widok.

Koszt nadal wynosi 5 energii, czasy zależą od poziomu według poprzedniej tabeli. Po zgłoszeniu powrotu przyznawana jest zapisana nagroda złota i EXP zgodnie z czasem przyjętej misji.


### Pełnoekranowy aktywny zwiad

Po przyjęciu misji oraz po kliknięciu Karczmy w czasie aktywnego zwiadu otwiera się sama lokacja na całe okno przeglądarki. Widoczne są mały tytuł, przycisk zamknięcia i zegar na środku u dołu. Opis lokacji znajduje się nad paskiem postępu. Podczas misji nie są widoczne koszty, zakładki ani przycisk powrotu do sali. Zwiad można zamknąć do mapy i otworzyć ponownie bez zmiany czasu lub miejsca. Po upływie czasu pojawia się przycisk Zgłoś powrót; zapis zakończenia otwiera zwykłą karczmę, bez nagród i dodatkowego kosztu.

Pełnoekranowy zwiad pokazuje u dołu szeroki pasek postępu w metalowo-złotej ramie z odliczaniem pośrodku. Wypełnienie rośnie zgodnie z faktycznie upływającym czasem zapisanej misji, także po odświeżeniu; kończy na 100% po upływie zwiadu.

Opis wylosowanego obszaru zwiadu jest widoczny w półprzezroczystej, złoto obramowanej ramce nad paskiem postępu. Po zakończeniu misji ramka przesuwa się ponad przycisk zgłoszenia powrotu. Każda z trzech lokacji ma osobny tekst, bez deklarowania nagród.


## Nagrody zwiadowcze

| Czas | EXP | Złoto |
| --- | --- | --- |
| 1 minuta | 1000–2200 | 11–18 |
| 5 minut | 5000–8800 | 25–53 |
| 10 minut | 15400–20200 | 60–116 |
| 15 minut | 25000–40000 | 175–350 |
| 20 minut (poziomy 26–35) | 150000 | 500 |

Losowania są niezależne i obejmują obie granice przedziałów. Nowa misja zapisuje nagrodę w `activeMission.reward` przy rozpoczęciu; tytuł, czas, lokacja i nagroda nie zmieniają się po odświeżeniu. Przy zgłoszeniu powrotu EXP, poziom, złoto i usunięcie aktywnej misji zapisują się w jednej transakcji, pod wspólną blokadą Web Locks. Nie ma dodatkowego kosztu energii ani podwójnego odbioru. Podsumowanie nagrody pojawia się po powrocie do karczmy i pozostaje w `lastScout`. Stary zwiad bez zapisanej nagrody otrzymuje ją przy pierwszym skutecznie zapisanym zakończeniu, według swojego czasu. Błąd zapisu nie przyznaje częściowej nagrody ani nie usuwa misji.


## Automatyczna walka u Branda

Zakładka „Walka z potworami” pozwala wylosować teren i otworzyć pełnoekranowy podgląd pola walki: Mroczny Las, Starą Kopalnię albo Podziemia Miasta. Po lewej są portret, poziom, życie i cztery startowe statystyki bohatera, zgodne z kartą postaci. Po prawej pozostaje puste miejsce przeciwnika. Wspólne statystyki początkowe i dotychczasowy wzór życia przeniesiono do `BrandCombat.profile`. Kliknięcie zakładki od razu otwiera wylosowany teren. Podgląd nie pobiera energii i nie przyznaje nagród. Teren jest zapisywany jako `combatOffer.sceneId` pod wspólną blokadą Web Locks, więc ponowne otwarcie, odświeżenie i inna karta zachowują ten sam przydział. Nie ma przycisków losowania ani ponownego losowania. Po dodaniu potworów przydział będzie zużywany przez zakończoną walkę.

`combat.js` ma oddzielne, puste pule potworów dla trzech terenów. Przycisk rozpoczęcia jest zablokowany; nie dodano żadnych potworów ani zasad ich obrażeń, inicjatywy i nagród. Docelowy koszt misji u Branda wynosi 5 energii. W czasie aktywnego zwiadu nie można otworzyć podglądu walki. Zamknięcie pełnoekranowego podglądu wraca do Branda, a zamknięcie rozmowy usuwa jego okno.

Mechanizm `createBattle(hero, enemy, first)` i `advance(battle, resolveHit)` obsługuje naprzemienne ataki, obniżanie życia bez wartości ujemnych i zakończenie po pokonaniu jednej ze stron. Kolejność pierwszego ataku i funkcję obrażeń trzeba jawnie dostarczyć po ustaleniu reguł. `play(root, battle, resolveHit)` pokazuje automatycznie pojedynczy cios co 1,1 sekundy, uaktualnia paski życia, liczby obrażeń, turę i wynik; zwraca funkcję zatrzymania. Nie jest uruchamiany dla pustych pul przeciwników i nie zmienia zapisu postaci. Nagrody zwiadowcze nie są używane jako nagrody walki.


### Okno nagrody za misję

Po odebraniu zwiadu otwiera się ramka „Nagroda za misję” z ornamentami z ciemnej stali i starego złota. Dwa pola pokazują ikonę monet z liczbą złota oraz autorski runiczny medalion EXP (`exp-icon.webp`) z liczbą doświadczenia. Osobno pojawia się informacja o awansie, jeśli nastąpił. Okno korzysta z już zapisanej nagrody; jego zamykanie i wyświetlanie nie przyznaje jej ponownie. Po powrocie do rozmowy z NPC przywracany jest zwykły widok dialogu.


## Potwory Mrocznego Lasu

W podstawowej puli lasu dostępny jest Dzik (1), Wilk (2), Driada (3) lub Goblin (5). Portrety znajdują się w atlasie `forest-monsters.webp` (2×2: dzik, wilk / driada, goblin). Każdy teren ma obecnie własną pulę; nowe walki korzystają wyłącznie z przeciwników w zakresie ±3 poziomów postaci. Przeciwnik jest zapisywany w `combatOffer.enemyId` i nie zmienia się przy ponownym otwarciu.

Koszt rozpoczęcia to 5 energii. Walka pokazuje naprzemienne ciosy co 1,1 sekundy; każdy zapisany cios i aktualne życie znajdują się w `activeCombat`. Zamknięta walka czeka na ponowne otwarcie; odświeżenie nie zmienia przeciwnika ani nagrody. Zwiadu nie można rozpocząć przed rozliczeniem walki. Zwycięstwo daje stałe złoto i EXP przypisane do przeciwnika w aktualnej tabeli balansu, porażka nie daje nagród. Rozliczenie atomowo zapisuje nagrodę i usuwa walkę oraz ofertę pod blokadą Web Locks; błąd zapisu nie przyznaje częściowej nagrody.

Aktualne życie podstawowych potworów: 77/99/121/149; obrażenia odpowiednio 8–11/10–15/13–18/15–21. Bohater zaczyna, a jego bazowe obrażenia to najwyższa statystyka + 2×poziom, z losowym odchyleniem ±3. Życie i statystyki bohatera są zgodne z kartą postaci. Nagroda przeciwnika jest zapisywana przy rozpoczęciu i wypłacana tylko raz po zgłoszeniu wyniku.


## Potwory Starej Kopalni

Do podstawowej puli Kopalni dodano Ducha (1), Rozbójnika (2), Ogromnego szczura (3) i Kryształowego ogra (5). Atlas `mine-monsters.webp` ma układ 2×2: duch, rozbójnik / ogromny szczur, kryształowy ogr. Każdy przeciwnik używa własnego awatara również po odświeżeniu walki. Początkowy balans życia i obrażeń według poziomu jest taki sam jak dla potworów lasu.

Nowa oferta losuje jeden z dwóch dostępnych terenów (Mroczny Las albo Stara Kopalnia), a potem jednego z czterech przeciwników danego terenu. Zapisane oferty i rozpoczęte walki pozostają bez zmian. Stary przydział kopalni bez przeciwnika otrzymuje potwora z kopalni; podziemia czekają na własną pulę. Nie ma ręcznego ponawiania losowania. Koszt rozpoczęcia nadal wynosi 5 energii; nagroda za zwycięstwo to stałe złoto i EXP przypisane do przeciwnika w aktualnej tabeli balansu. Porażka nie daje nagrody. Odbiór pozostaje jednorazowy i atomowy, pod wspólną blokadą zapisu.


## Potwory Podziemi Miasta

Do podstawowej puli Podziemi dodano Węża błotnego (1), Dzikiego Psa (2), Zbłąkanego człowieka (3) i Trolgotytę (5), zachowując podaną nazwę. Atlas `undercity-monsters.webp` ma układ 2×2: wąż, pies / człowiek, Trolgotyta. Portrety pokazują przeciwników na tle wilgotnych kanałów i podziemnych kamiennych korytarzy. Życie i zakresy obrażeń według poziomu odpowiadają początkowemu balansowi pozostałych terenów.

Nowe oferty losują teraz jeden z trzech terenów, a następnie potwora z jego własnej puli. Istniejące oferty i aktywne walki nie są ponownie losowane. Dawny pusty przydział Podziemi otrzymuje potwora z tej lokacji. Nadal obowiązują koszt 5 energii, automatyczne tury, zapis postępu i jednorazowa nagroda za zwycięstwo: stałe złoto i EXP przypisane do przeciwnika w aktualnej tabeli balansu.


### Proporcje awatarów potworów

Każdy kwadratowy kadr atlasu jest wyświetlany w oryginalnych proporcjach i w całości, z dopasowaniem do miejsca nad podpisem. Nazwa i poziom mają osobny obszar poniżej grafiki. W prostokątnej ramce pozostaje neutralne tło po bokach albo nad i pod portretem, zamiast rozciągania ilustracji. Dotyczy wszystkich trzech atlasów, również podczas aktywnej walki.


## Dwie oferty Branda

Rozmowa z Brandem zawsze pokazuje dokładnie dwie karty: Szlak wędrowca (łatwiejszy zwiad czasowy, 3 energii) i Próba śmiałka (trudniejsza walka z potworem, 5 energii). Rodzaje misji nie są losowane; teren zwiadu i przeciwnik walki nadal są losowe. Teren walki jest wybierany spośród miejsc z pasującymi przeciwnikami.

Przeciwnik musi mieścić się w zakresie ±3 poziomów postaci, z dolną granicą 1. Trudniejsza oferta preferuje silniejszych przeciwników, a gdy takich nie ma, najwyższy dostępny poziom w zakresie. Jeśli w całej grze nie ma pasującego potwora (obecnie od poziomu postaci 34), karta walki pozostaje widoczna z informacją o braku przeciwników i zablokowanym przyciskiem. Nie zastępuje jej drugi zwiad. Poziomy, statystyki i nagrody potworów nie są skalowane.

Oferty zapisują się w `brandOffers`, z `brandOffersVersion` i `brandOffersLevel`. Stare, jeszcze nieprzyjęte oferty są jednorazowo zastępowane nowymi po aktualizacji zasad, a zmiana poziomu postaci odświeża zestaw. Ponowne otwarcie, odświeżenie lub druga karta nie zmieniają aktualnych ofert na tym samym poziomie. Przyjęcie jednej zużywa cały zestaw i atomowo pobiera jej koszt. Aktywne walki i zwiady zachowują zapisany przebieg, termin, koszt oraz nagrodę. Przyjęcie walki ponownie sprawdza aktualny poziom i odrzuca niepasującego przeciwnika bez pobrania energii. Wersja ofert 2 zastępuje stare nieprzyjęte zestawy i usuwa dodatkowe `brandTimedOffers`.

Usunięto ręczny wybór typu misji, napis o losowaniu kierunków oraz rozwijaną tabelę czasu według poziomu. Aktywny zwiad i walka zachowują dotychczasowe pełnoekranowe widoki i jednorazowe nagrody.


## Nowa karta postaci, cechy i Szczęście

Karta pokazuje postać między siedmioma miejscami wyposażenia: hełm, zbroja, buty, tarcza, broń, naszyjnik i kolczyki. Lokalne ikony pochodzą z atlasu `gear-icons.webp`. Kliknięcie miejsca otwiera wybór posiadanych przedmiotów pasujących do danego slotu oraz zdejmowanie. Broń i pancerz startowy ze starego podglądu są dostępne także w istniejących zapisach. Puste miejsca mają przygaszone ikony, założone rzeczy — kolorowe. Panel Ekwipunek wyświetla teraz rzeczywisty stan torby. Podstawowe losowe przedmioty nie mają jeszcze premii do statystyk. Naszyjnik z misji Tauriel ma opisany niżej bonus +100 HP.

Zgodnie z ustaleniem gracz otrzymuje 5 punktów na start i 3 za każdy kolejny poziom. Budżet wynosi `5 + 3 × (poziom − 1)`, także dla istniejących postaci. Punkty rozdziela się między Siłę, Zręczność, Inteligencję, Wytrzymałość i Szczęście. Przydziały są zapisywane w `statAllocations`; pozostałe punkty wylicza się z budżetu, więc odświeżanie nie przyznaje ich ponownie. Wydawanie korzysta ze wspólnej blokady zapisu; brak punktów i błędy zapisu nie zmieniają cech. Podstawowe cechy uwzględniają przydziały w nowych walkach, a Wytrzymałość zwiększa maksymalne życie zgodnie z wcześniejszym wzorem. Już rozpoczęte walki zachowują zapisane statystyki.

Początkowe Szczęście wynosi 0. Szansa zdobycia przedmiotu to 10% + 1 punkt procentowy za punkt Szczęścia, maksymalnie 60%. Wyświetla się przy cesze i symbolu koniczyny. Szczęście nie zwiększa obrażeń ani szansy krytycznej. Każdy nowy zwiad i walka zapisuje osobny wynik losowania przedmiotu (`loot`, obiekt albo null) przy rozpoczęciu; zmiana cech i odświeżenie w trakcie misji nie zmieniają tego wyniku. Wcześniejsza aktywna misja bez tego pola losuje przedmiot przy skutecznym zakończeniu.

Zwiad oraz zwycięska walka mogą dać jeden z siedmiu podstawowych przedmiotów, po jednym rodzaju dla każdego slotu. Porażka nie daje przedmiotu. Rzecz trafia do `lootInventory` w tym samym zapisie co złoto, EXP i usunięcie aktywnej misji, a okno nagrody pokazuje jej ikonę i nazwę. Wyposażenie zapisuje się w `equipment` jako identyfikatory rzeczy z torby. Nie ma podwójnego odbioru ani częściowego zapisu.


## Plecak z 25 miejscami

Przycisk Ekwipunek przy portrecie otwiera osobne okno z siatką 5×5, nową ikoną skórzanego plecaka (`inventory-icon.webp`) i licznikiem zajętych miejsc. Ten sam widok jest dostępny z menu Ekwipunek. Każde puste pole pozostaje widoczne; kliknięcie zajętego pokazuje nazwę i przycisk założenia przedmiotu. Zamknięcie wraca do postaci. Ikona jest też używana w menu zamku.

Limit 25 dotyczy przedmiotów w plecaku, poza siedmioma miejscami założonego wyposażenia. Założenie rzeczy w pustym miejscu zwalnia pole plecaka. Wymiana założonego przedmiotu przenosi poprzedni do plecaka, zachowując liczbę zajętych pól; zdjęcie rzeczy przy pełnym plecaku jest zablokowane. Wyposażenie zapisuje się atomowo pod dotychczasową blokadą Web Locks.

Zgodnie z wyborem użytkownika pełny plecak blokuje zdobywanie nowych przedmiotów. Losowanie przedmiotu nie zachodzi przy rozpoczęciu misji z pełnym plecakiem. Jeżeli plecak zapełni się przed odbiorem wcześniej wylosowanej rzeczy, rzecz nie zostaje przyznana ani pokazana jako zdobyta. Złoto, EXP i zakończenie misji pozostają dostępne. Nie ma kolejki oczekujących zdobyczy. Istniejące przedmioty nie są automatycznie usuwane; jeżeli starszy zapis przekracza limit, nadmiar pozostaje zachowany i dostępny z wyboru rzeczy przy miejscach wyposażenia, a plecak wyświetla informację o tym stanie.


### Miejsce na przedmiot specjalny

Pole nad bronią, wcześniej pokazujące koniczynę i szansę na przedmiot, jest teraz ósmym miejscem wyposażenia: `special` — Przedmiot specjalny. Pozostaje puste do dodania takich przedmiotów, a kliknięcie otwiera zwykły wybór rzeczy pasujących do slotu. Nie dodano nowych przedmiotów ani nie rozszerzono puli losowych zdobyczy: wciąż losowane jest siedem dotychczasowych rodzajów. Szczęście i procent szansy pozostają widoczne w statystykach i działają jak wcześniej.


## Misja Tauriel i górne piętro

Tauriel oferuje od poziomu 5 jednorazową misję „Przepędź nieproszonych gości”. Trzej odrębni rozbójnicy mają własne awatary w atlasie `tauriel-bandits.webp` (3×1): Rozbójnik spod barykady, Rozbójnik Żelazna Pięść i Przywódca rozbójników. Każdy ma poziom 5; życie 138/154/176 i obrażenia 13–17/14–19/16–21. Walki korzystają z automatycznych tur i zapisu `activeCombat`, oznaczonego `source: 'tauriel'`. Nie pobierają energii. Za zwycięstwa dają odpowiednio 50/100/50 złota i 1200/1500/1000 EXP; nie przyznają losowych przedmiotów. Nie można prowadzić równolegle drugiej aktywnej walki lub zwiadu.

Przyjęcie, rozliczanie kolejnych starć i odbiór nagrody zapisują się pod wspólną blokadą Web Locks. Postęp w `taurielQuest.defeated` jest trwały; porażka nie usuwa wcześniejszych zwycięstw i pozwala ponowić ten sam etap. Ten sam wynik walki można rozliczyć tylko raz. Po trzecim zwycięstwie status `ready` odblokowuje schody. Naszyjnik odbiera się osobno u Tauriel; status `completed` blokuje ponowną wypłatę. Pełny plecak nie usuwa nagrody — Tauriel zachowuje ją do zwolnienia miejsca.

Szmaragdowy naszyjnik Tauriel ma stały identyfikator `tauriel-emerald-necklace`, miejsce `necklace` i osobną ilustrację `tauriel-necklace.webp`. Daje dokładnie +100 maksymalnego HP wyłącznie po założeniu. Zdjęcie lub wymiana odbiera bonus, ponowne zakładanie nie kumuluje go. Premia jest widoczna na karcie postaci i trafia do statystyk nowych walk; już rozpoczęte starcia zachowują swój zapis. Naszyjnik nie trafia do puli losowych łupów.

Schody po odblokowaniu otwierają przesuwany korytarz `tavern-upstairs.webp`, z drzwiami do Pokoju z Zieloną Kotarą i Pokoju pod Latarnią. Oba pokoje mają oddzielne kadry atlasu `tavern-rooms.webp`. Widok można przesuwać palcem i myszą; przyciski pozwalają wracać na korytarz i do sali karczmy. Pokoje są miejscami do oglądania; nie dodano opłat, regeneracji ani dodatkowych nagród.


### Tauriel po przepędzeniu rozbójników

Po trzecim zaliczonym zwycięstwie (status `ready`, także przed odebraniem naszyjnika) Tauriel przechodzi do Pokoju z Zieloną Kotarą. Jej znacznik i postać znikają z dolnej sali; używana jest osobna panorama `tavern-after-tauriel.webp`. Lewy pokój korzysta z atlasu `tavern-rooms-tauriel.webp`, przedstawiającego Tauriel w jej pokoju. W drugim pokoju nie ma Tauriel. Rozmowa z przyciskiem Tauriel w pokoju pozwala odebrać zachowaną nagrodę, także po ponownym otwarciu gry. Status `completed` zachowuje tę samą lokalizację. Przed ukończeniem trzech walk Tauriel nadal przebywa na dole, gdzie można przyjąć i kontynuować zadanie.


## Pracownia alchemiczki

Alchemiczka na mapie i w menu zamku otwiera Wieżę Zielonego Płomienia. Lokal ma własną panoramę `alchemist-workshop.webp`: dorosła, czarnowłosa alchemiczka w dopasowanej czarnej sukni ze złotymi detalami, stół alchemiczny, kolby, zioła, regały i schody na prywatne piętro. Bohaterka ma osobną ilustrację `alchemist-character.webp`, widoczną w rozmowie.

Widok przesuwa się swobodnie palcem, gładzikiem lub myszą, bez widocznych pasków przewijania i bez stałego panelu zasłaniającego ilustrację. Początkowy kadr kieruje się na alchemiczkę. Kliknięcie jej znacznika otwiera portret i powitanie; stół pokazuje opis wyposażenia pracowni, a schody informują o zamkniętym na razie prywatnym piętrze. Nie dodano jeszcze receptur, warzenia, zakupów, kosztów ani nowej misji. Oglądanie pracowni nie zmienia zapisu postaci. Zamknięcie lub zmiana miejsca usuwa obsługę przeciągania, obserwator rozmiaru i okno rozmowy.


## Gorim Sadza i Kuźnia Czarnego Żaru

Kuźnia na mapie i w menu zamku otwiera panoramiczną pracownię `forge-workshop.webp`. Gorim Sadza jest potężnym, szerokim w barach człowiekiem z młotem, stojącym przy kowadle na tle rozpalonego pieca hutniczego. Otoczenie uzupełniają narzędzia, sztaby metalu i stojaki z uzbrojeniem. Widok przesuwa się palcem i myszą, z zachowaniem proporcji obrazu i początkowym kadrem na kowala.

Jedyną interaktywną postacią i znacznikiem w pracowni jest Gorim Sadza. Kliknięcie otwiera rozmowę oraz recepturę broni na poziom 35. Kowadło, piec i pozostałe wyposażenie są częścią ilustracji. Oglądanie kuźni i rozmowa nie zmieniają zapisu postaci; dopiero zatwierdzenie wytwarzania zużywa składniki i dodaje broń.


## Przybliżanie lokacji

Wspólne przybliżanie (100–300%) obejmuje mapę zamku, karczmę, pracownię alchemiczki, kuźnię, korytarz piętra i oba pokoje. Ekranowe przyciski +/− i procentowy reset skali zostały usunięte. Działa również kółko myszy, gest dwóch palców oraz klawisze +/−/0 przy skupieniu na widoku. Po powiększeniu można przesuwać widok palcem i myszą; znaczniki postaci i drzwi pozostają przy ilustracji.

Podczas zwiadu i walki przycisk lupy otwiera osobny pełnoekranowy podgląd lokacji z tą samą obsługą przybliżania. Mechanika i czas misji działają dalej; nie powiększa się odliczanie, statystyki ani przyciski odbioru nagrody. Zmiany skali nie zapisują danych postaci. Obsługa jest usuwana po opuszczeniu lokacji.


## Gabriel i plac treningowy koszar

Koszary Żelaznej Przysięgi otwierają panoramiczny plac treningowy (`barracks-training.webp`). Paladyn Gabriel jest człowiekiem w lśniącej srebrnej zbroi ze złotymi detalami, bez hełmu. Otaczają go manekiny, stojaki z bronią, tarcze i sztandary. Plac obsługuje przesuwanie i wspólne przybliżanie 100–300%.

Kliknięcie Gabriela otwiera powitanie i panel profesji Wojownika oraz Krasnoluda; pozostałe klasy otrzymują wskazówkę o swoim nauczycielu; zachowane są jego wymagania poziomu 10 i blokada profesji czekających na ustalenie. Drzwi do zbrojowni otwierają panoramiczną salę z Rolandem. Gabinet dowódcy paladynów pozostaje zamknięty; postać dowódcy i jego wnętrze dodamy później. Oglądanie placu i rozmowy nie pobierają zasobów i nie zmieniają zapisu postaci.


## Gringo i Czarny Targ

Panoramiczny plac targowy (`market-square.webp`) ma stragan Gringa, pulchnego kupca uzbrojenia, oraz puste boczne stragany na przyszłe postacie. Obsługuje przesuwanie i przybliżanie 100–300%. Kliknięcie Gringa otwiera sklep z ośmioma podstawowymi przedmiotami: czterema rodzajami broni, hełmem, zbroją, butami i tarczą. Ceny wynoszą 20–45 złota; premie są widoczne przed zakupem i działają po założeniu, także podczas walki. Nie są to rzadkie przedmioty z przyszłego rzemiosła Gorima.

Zakup atomowo zapisuje odjęcie złota i nowy przedmiot z unikalnym ID w istniejącym ekwipunku. Używa wspólnej blokady `pustkowie-hero-v2` oraz ponownie sprawdza bieżący zapis, złoto i limit 25 niezałożonych przedmiotów. Pełny ekwipunek lub brak złota blokują zakup. Założone przedmioty nie zajmują miejsc plecaka; zakupy nie zakładają się automatycznie. Zamknięcie targu usuwa obsługę i nie zużywa energii.


## Płynne przesuwanie lokacji

Wszystkie panoramy, mapa, piętro, pokoje i podglądy walk/zwiadu korzystają ze wspólnej obsługi w `scene-zoom.js`. Ruch palcem, piórem i myszą jest przetwarzany raz na klatkę animacji; po puszczeniu szybkiego przeciągnięcia widok łagodnie wyhamowuje. Nowy dotyk, kółko, utrata aktywności lub zamknięcie widoku zatrzymują ruch. Przy preferencji ograniczonego ruchu wyhamowanie jest wyłączone. Przeciągnięcie nie uruchamia znaczników postaci i drzwi.

Usunięto wszystkie ekranowe przyciski skali, w tym procentowy reset. Pozostają gest dwóch palców, kółko myszy oraz klawisze +/−/0 (0 przywraca skalę 100%). Obsługa gestów i animacje są usuwane przy opuszczeniu lokacji.


## Mana Maga i broń adepta

Wyłącznie Mag ma niebieski pasek many pod paskiem życia, w karcie bohatera i w widoku walki. Maksymalna mana to 10 × Inteligencja, z uwzględnieniem rozdanych punktów i premii założonego wyposażenia. Pod Inteligencją Maga znajduje się informacja o przeliczniku. Zmiana cechy lub założonego ekwipunku odświeża pojemność many. Mag automatycznie używa Kuli ognia za 10 many za uderzenie; po wyczerpaniu many atakuje różdżką.

Nowe walki zachowują pojemność i pełny początkowy zasób many w migawce Maga. Starsze zapisane walki bez pól many wyświetlają ją na podstawie Inteligencji zapisanej w walce, bez zmiany trwającego starcia.

Broń początkowa: Wojownik — Miecz adepta, Mag — Różdżka adepta, Elf — Łuk adepta, Krasnolud — Topór adepta. Istniejące przedmioty o ID `starter-weapon` i dawnej standardowej nazwie są odczytywane pod nową nazwą; identyfikatory i założenie pozostają zachowane, bez dodawania przedmiotów. Broń kupiona, zdobyta i przedmioty z własnymi nazwami pozostają bez zmian.


## Ochrona ciała zależna od klasy

Wspólny slot `armor` ma nazwę i zasady właściwe klasie: Wojownik i Krasnolud używają tych samych zbroi, tylko Mag zakłada płaszcze, a tylko Elf zakłada pancerze. Walidacja działa w obu sposobach zakładania (karta bohatera i plecak), niezależnie od interfejsu. Obce typy nie dają premii, nawet jeśli starszy zapis ma je jako założone; przedmiot pozostaje w ekwipunku. Starszy pełny plecak może przez to mieć nadmiarowy zachowany przedmiot, obsługiwany tak samo jak pozostałe przedmioty ze starszych zapisów.

Standardowe przedmioty startowe są odczytywane jako: Znoszona kolczuga (Wojownik i Krasnolud), Płaszcz wygnańca (Mag), Pancerz tropiciela (Elf). Migracja zachowuje ID i nie dodaje duplikatów. Nowe losowe zdobycze ochrony ciała pasują do klasy. Wcześniej wylosowane nagrody nadal można odebrać, z zachowaniem ograniczeń zakładania.

Gringo pokazuje właściwy typ ochrony ciała dla danej postaci: Nitowaną zbroję dla Wojownika i Krasnoluda, Płaszcz wędrownego maga dla Maga, Pancerz leśnego strażnika dla Elfa. Wszystkie trzy kosztują 45 złota i dają dotychczasowe +3 Wytrzymałości po założeniu. Zakup obcego typu jest blokowany także w regule transakcji.


## Wyraźniejsze postacie alchemiczki, Gringa i Gabriela

Odnowiono cztery ilustracje z zachowaniem układu lokacji, tożsamości postaci i stylu gry: pracownię i portret alchemiczki, plac targowy Gringa oraz plac treningowy Gabriela. Twarze, włosy, tkaniny i zbroja mają czytelniejsze szczegóły i oświetlenie. Ilustracje są eksportowane do WebP w pełnej rozdzielczości generowanych źródeł, z jakością 94 zamiast wcześniejszego pomniejszania panoram do 1536 px i silniejszej kompresji.

Rozmiary: pracownia 1774×887, portret 1024×1536, targ 1983×793, koszary 1915×821 px. Zachowano proporcje obrazów i istniejące pozycje znaczników. Wersjonowanie adresów tych czterech grafik wymusza pobranie nowych plików zamiast starych kopii z pamięci podręcznej; dekodowanie jest asynchroniczne. Przybliżanie, przesuwanie, rozmowy, zakupy i profesje korzystają z dotychczasowych zasad.


## Naturalniejsze twarze alchemiczki i Gabriela

Skorygowano oczy i anatomię twarzy alchemiczki (portret oraz pracownia) i Gabriela w koszarach: naturalne rozmiary oczu, spójny kierunek spojrzenia, realistyczna skóra i proporcje twarzy. Portret alchemiczki posłużył za wzór dla jej twarzy w pracowni. Zachowano stroje, pozy, proporcje panoram i położenie znaczników. Nowe adresy grafik (`realistic-faces-1`) odświeżają kopie w pamięci podręcznej. Mechanika gry pozostaje bez zmian.


## Startowe zaklęcie Maga: Kula ognia

Każdy Mag, także wcześniej zapisany, zna Kulę ognia od poziomu 1. Automatyczny atak Maga zużywa 10 many, jeśli ma co najmniej 10. Przy mniejszej ilości many atakuje różdżką bez kosztu many. Obrażenia pozostają według dotychczasowych zasad; nie zmieniono balansu przeciwników ani nagród. Nowa walka zaczyna się z pełną maną. Reguła obowiązuje także w misji Tauriel, która używa wspólnego mechanizmu tur.

Ubytek many, obrażenia, nazwa ataku i następna tura są zapisywane razem w `activeCombat.battle`. Odczyt i ponowne otwarcie nie odnawiają many. Starsza walka bez pola many inicjuje ją na podstawie Inteligencji zapisanej w migawce przy pierwszym ciosie Maga, a następnie zapisuje jej zużycie. Tura przeciwnika nie pobiera many Maga. Karta postaci pokazuje pozostałą manę trwającej walki; opis zaklęcia i koszt są widoczne w karcie oraz podglądzie walki.


## Alchemiczka zgodna ze zdjęciem 1000001913

Na życzenie przywrócono oryginalny wygląd alchemiczki sprzed zmian twarzy, zgodny z dostarczonym zdjęciem: oryginalną pracownię oraz portret. Wykorzystano zachowane pierwotne pliki źródłowe, bez ponownej generacji postaci. Eksport pozostaje w pełnej rozdzielczości (1774×887 i 1024×1536) i jakości WebP 94. Wersja adresów `alchemist-reference-1913-1` odświeża pobierane grafiki.


## Zestawy Gringa: poziomy 5, 15 i 25

Oferta na Czarnym Targu w Zamku Czarnej Stali ma 57 unikalnych przedmiotów i po 15 pasujących pozycji dla każdej klasy. Trzy zbroje są wspólne dla Wojownika i Krasnoluda. Każda klasa ma broń, hełm/kaptur, zbroję/płaszcz/pancerz, buty i tarczę na każdym progu. Nie ma kolczyków, naszyjników ani przedmiotów specjalnych. Ikony pochodzą z czterech atlasów 5×3; są wspólne dla sklepu, plecaka i założonego wyposażenia.

| Klasa | Poziom | Broń | Hełm / kaptur | Ochrona ciała | Buty | Tarcza |
| --- | ---: | --- | --- | --- | --- | --- |
| Wojownik | 5 | Miecz Straży Zamkowej | Hełm Żelaznej Warty | Zbroja Żelaznej Warty | Buty Zamkowego Wartownika | Tarcza Straży Zamkowej |
| Wojownik | 15 | Miecz Czarnej Stali | Hełm Czarnej Warty | Zbroja Czarnej Stali | Buty Czarnego Garnizonu | Tarcza Czarnej Twierdzy |
| Wojownik | 25 | Miecz Przysięgi Obrońcy | Hełm Korony Zamku | Zbroja Nieugiętej Przysięgi | Buty Nieugiętego Obrońcy | Tarcza Bastionu Przysięgi |
| Mag | 5 | Różdżka Żaru | Kaptur Adepta Płomienia | Płaszcz Tkacza Iskier | Buty Zaklinacza | Tarcza Runicznego Kręgu |
| Mag | 15 | Różdżka Szmaragdowego Żaru | Kaptur Szeptów Wieży | Płaszcz Zielonego Płomienia | Buty Runicznego Szlaku | Tarcza Szmaragdowej Pieczęci |
| Mag | 25 | Różdżka Serca Płomienia | Kaptur Arcymaga Czarnej Stali | Płaszcz Wiecznego Żaru | Buty Władcy Run | Tarcza Wiecznej Pieczęci |
| Elf | 5 | Łuk Leśnej Straży | Hełm Zielonego Liścia | Pancerz Leśnego Strażnika | Buty Cichego Szlaku | Tarcza Dębowego Liścia |
| Elf | 15 | Łuk Nocnej Kniei | Hełm Srebrnego Liścia | Pancerz Szmaragdowej Kniei | Buty Nocnego Tropiciela | Tarcza Starego Dębu |
| Elf | 25 | Łuk Przysięgi Prastarego Lasu | Hełm Korony Kniei | Pancerz Strażnika Prastarego Lasu | Buty Szeptu Prastarej Kniei | Tarcza Serca Prastarego Dębu |
| Krasnolud | 5 | Topór Kamiennej Straży | Hełm Górskiej Warty | Zbroja Żelaznej Warty | Buty Kamiennego Traktu | Puklerz Górskiej Warty |
| Krasnolud | 15 | Topór Czarnej Kuźni | Hełm Kamiennej Przysięgi | Zbroja Czarnej Stali | Buty Żelaznego Szybu | Puklerz Runicznej Kuźni |
| Krasnolud | 25 | Topór Serca Góry | Hełm Władcy Głębin | Zbroja Nieugiętej Przysięgi | Buty Nieugiętej Góry | Puklerz Kamiennego Bastionu |

Ceny (broń / hełm / ochrona ciała / buty / tarcza): poziom 5 — 120/80/150/70/100 złota; 15 — 420/280/520/240/350; 25 — 900/600/1100/550/750. Premie do cech rosną z poziomem; są pokazane przed zakupem i działają po założeniu. Główna cecha broni to Siła Wojownika i Krasnoluda, Inteligencja Maga, Zręczność Elfa.

Wymagania klasy i poziomu są sprawdzane ponownie przy zakupie i zakładaniu; zapis przedmiotu odwołuje się do kanonicznego katalogu. Nie można obejść reguł przez zmianę opisowych pól przedmiotu. Starsze zakupy nadal mają swoje premie i mogą być używane według wcześniejszych zasad, lecz poprzednia podstawowa oferta nie jest już sprzedawana. Limit 25 miejsc, aktualny zapis i Web Locks nadal chronią transakcje. Nie dopisano nieustalonych progów EXP powyżej poziomu 15: zestaw na poziom 25 jest przygotowany na dalszy rozwój gry.


## Ikony adeptów i sprzedaż u Gringa

Broń startowa ma osobne ikony: miecz Wojownika, krótka różdżka Maga, łuk ze struną Elfa i topór Krasnoluda. Dodano też ikony początkowej kolczugi, płaszcza i pancerza; kolczuga Wojownika i Krasnoluda ma wspólną grafikę. Ikony są dobierane po istniejącym ID przedmiotu i klasie lub typie ochrony, bez zmian zapisu i bez duplikowania przedmiotów. Widać je w karcie postaci, plecaku i na liście sprzedaży.

Zakładka Sprzedaż u Gringa pokazuje wszystkie niezałożone przedmioty z plecaka, ich wartość bazową i kwotę sprzedaży: `floor(wartość × 3 / 5)`. Wartość nowych i dawnych zakupów odpowiada cenie katalogowej. Broń startowa ma wartość 30 złota, ochrona startowa 45. Pozostałe przedmioty mają wycenę według typu: hełm 50, ochrona ciała 90, buty 40, tarcza 60, broń 75, naszyjnik 100, kolczyki 80, przedmiot specjalny 100; naszyjnik Tauriel 250. Dane o cenie wpisane do przedmiotu nie zmieniają wyceny.

Przycisk sprzedaży działa na jeden konkretny przedmiot. Pod wspólną blokadą Web Locks odczytywany jest aktualny zapis, następnie atomowo zapisuje się usunięcie przedmiotu i dodanie złota. Założonych przedmiotów nie można sprzedać. Ponowna sprzedaż tego samego ID, zduplikowane ID, brak wyceny i przepełnienie liczby złota są blokowane. Błąd zapisu nie zabiera przedmiotu ani nie przyznaje częściowej wypłaty. Sprzedaż zwalnia miejsce także przy pełnym plecaku.


## Przewijanie walki

Podczas walki przycisk „Przewiń walkę” rozgrywa pozostałe tury bez oczekiwania na animacje. Zachowuje zasady obrażeń, zużycia many i wyniku walki. Po zwycięstwie od razu otwiera okno nagród; po porażce pokazuje wynik bez nagrody. Rozliczenie i zapis odbywają się razem, bez ponownego kosztu energii ani podwójnego przyznawania nagród. W misji Tauriel przewijanie kończy bieżący pojedynek; naszyjnik nadal odbiera się po pokonaniu trzech rozbójników.


## Kuźnia od poziomu 30

Wejście do Kuźni Czarnego Żaru z mapy oraz menu wymaga co najmniej 30. poziomu postaci. Poniżej tego progu wyświetla się informacja o wymaganym i obecnym poziomie, bez dostępu do wnętrza ani rozmowy z Gorimem. Poziom jest odczytywany z aktualnego zapisu przy każdej próbie wejścia.


## Nagrody Dowódcy Branda

Zwiady i walki z potworami u Branda przyznają wyłącznie złoto i EXP. Nie losują ani nie dodają przedmiotów, również przy rozliczaniu misji zapisanych przed tą zmianą. Przedmioty już posiadane pozostają w ekwipunku; nagroda z osobnej misji Tauriel pozostaje bez zmian.


## Jednakowy czas obu wariantów zwiadu Branda

Nowe zwiady łatwiejsze i trudniejsze trwają tyle samo na danym poziomie: 1–2 → 1 minuta, 3–7 → 5 minut, 8–14 → 10 minut, 15–25 → 15 minut. Oba warianty korzystają z tych samych zakresów nagród dla tego czasu; koszt wynosi odpowiednio 3 lub 5 energii. Trwające zwiady ze starszych zapisów zachowują ustalony wcześniej termin i nagrodę.


## Szeptun drzewny — Mroczny Las

Nowy przeciwnik poziomu 8 pojawia się w zleceniach walki Branda przy różnicy do 3 poziomów między nim a postacią, wyłącznie w Mrocznym Lesie. Ma 231 HP, cechy 18/8/16/14 oraz obrażenia 20–28. Zwycięstwo daje dokładnie 25 złota i 2500 EXP, bez przedmiotów; porażka nie daje nagrody. Awatar `tree-whisperer.webp` przedstawia spróchniałe drzewo z twarzami w korze i pnączami przypominającymi ramiona. Wszystkie potwory są teraz dobierane w zakresie ±3 poziomów postaci. Rozpoczęte walki zachowują zapis przeciwnika i nagrody.


## Demonica Puszczy — Mroczny Las

Przeciwniczka poziomu 9 występuje w misjach Branda przy różnicy do 3 poziomów między przeciwnikiem a postacią, wyłącznie w Mrocznym Lesie. Ma 259 HP, cechy 15/22/20/16 oraz obrażenia 22–30. Zwycięstwo daje dokładnie 35 złota i 3300 EXP, bez przedmiotów; porażka nie daje nagrody. Awatar `forest-demoness.webp` przedstawia dorosłą błękitnoskórą demonicę o czarnych chitynowych rogach, w czarnej łuskowej zbroi i ze złożonymi skórzastymi skrzydłami.


## Widmowy Rycerz — Mroczny Las

Przeciwnik poziomu 10 występuje w misjach Branda przy różnicy do 3 poziomów między przeciwnikiem a postacią, wyłącznie w Mrocznym Lesie. Ma 286 HP, cechy 24/20/12/18 oraz obrażenia 26–33. Zwycięstwo daje dokładnie 55 złota i 5100 EXP, bez przedmiotów; porażka nie daje nagrody. Awatar `spectral-knight.webp` przedstawia pustą, zniszczoną zbroję pełną czerwonego dymu i iskier oraz wyszczerbiony miecz dwuręczny.


## Leśny Pożeracz — Mroczny Las

Przeciwnik poziomu 15 występuje w misjach Branda przy różnicy do 3 poziomów między przeciwnikiem a postacią, wyłącznie w Mrocznym Lesie. Ma 440 HP, cechy 32/12/25/30 oraz obrażenia 33–44. Zwycięstwo daje dokładnie 99 złota i 25000 EXP, bez przedmiotów; porażka nie daje nagrody. Awatar `forest-devourer.webp` przedstawia bezkształtną masę czarnego szlamu i gnijących liści, z czaszkami i kośćmi zawieszonymi wewnątrz półprzezroczystego ciała.


## Aelira — Mroczny Las

Czarodziejka poziomu 14 występuje w misjach Branda przy różnicy do 3 poziomów między przeciwnikiem a postacią, wyłącznie w Mrocznym Lesie. Ma 396 HP, cechy 16/26/34/24 oraz obrażenia 31–42. Zwycięstwo daje dokładnie 75 złota i 15300 EXP, bez przedmiotów; porażka nie daje nagrody. Awatar `aelira.webp` przedstawia dorosłą czarodziejkę o oliwkowozielonej skórze, bursztynowych oczach, ciemnych włosach z mchem i kwiatami, organicznych szatach, paprociowej pelerynie oraz sękatym kosturze z leśnym ognikiem.


## Odłamki ze zwiadów od poziomu 8

Nowy zwiad czasowy przyjęty na poziomie 8–11 ma 3% szansy na dodatkowy 1 odłamek, a od poziomu 12 — 6%, niezależnie od miejsca i wariantu kosztu energii. Poziom, szansa oraz wynik losowania są zapisywane przy przyjęciu zlecenia; odświeżenie, ponowna próba zapisu i późniejszy awans nie losują nagrody ponownie. Odłamek trafia do salda razem ze złotem i EXP po zgłoszeniu powrotu i pojawia się w oknie nagród. Starsze trwające zwiady bez zapisanego losowania zachowują dotychczasowe nagrody. Walki z potworami nie przyznają odłamków ani przedmiotów.


## Kryształowy Skorpion — Stara Kopalnia

Przeciwnik poziomu 7 występuje w misjach Branda przy różnicy do 3 poziomów między przeciwnikiem a postacią, wyłącznie w Starej Kopalni. Ma 215 HP, cechy 16/12/4/22 i żądło zadające 28–33 obrażeń od trucizny. Kryształowy pancerz pochłania 2 punkty obrażeń przy każdym trafieniu; trafienie zawsze zadaje co najmniej 1 obrażenie. Zwycięstwo daje dokładnie 60 złota i 1700 EXP, bez przedmiotów i odłamków; porażka nie daje nagrody. Awatar `crystal-scorpion.webp` przedstawia skorpiona o kryształowym pancerzu i jadowitym żądle. Pancerz, rodzaj ataku, obrażenia i wynik są zapisywane w migawce walki; przewijanie korzysta z tych samych zasad.


## Nieumarły Górnik — Stara Kopalnia

Przeciwnik poziomu 9 występuje w misjach Branda przy różnicy do 3 poziomów między przeciwnikiem a postacią, wyłącznie w Starej Kopalni. Ma 253 HP, cechy 24/10/5/20 i kilof zadający 29–39 obrażeń. Cios ignoruje 50% redukcji obrażeń z pancerza celu (pomijana wartość jest zaokrąglana w dół); pozostały pancerz nadal działa, a trafienie zadaje co najmniej 1 obrażenie. Zwycięstwo daje dokładnie 25 złota i 3500 EXP, bez przedmiotów i odłamków; porażka nie daje nagrody. Awatar `undead-miner.webp` przedstawia szkielet dawnego górnika z kilofem. Przebicie pancerza, obrażenia i nagroda są zapisywane w migawce walki i stosowane również przy przewijaniu. Ekwipunek bohatera obecnie zwiększa cechy i HP, a nie pole redukcji `armor`; przebicie działa na redukcję pancerza, gdy cel ją posiada.


## Golem Magmowy — Stara Kopalnia

Przeciwnik poziomu 15 występuje w misjach Branda przy różnicy do 3 poziomów między przeciwnikiem a postacią, wyłącznie w Starej Kopalni. Ma 528 HP, cechy 38/8/20/36 oraz obrażenia 43–61. Pochłania 8 obrażeń fizycznych z trafienia (minimum 1 obrażenie); ten pancerz nie redukuje magii. Otrzymuje +50% bazowych obrażeń od wody, z premią zaokrągloną w dół. Zwycięstwo daje dokładnie 100 złota i 25000 EXP, bez przedmiotów i odłamków; porażka nie daje nagrody. Awatar `magma-golem.webp` przedstawia olbrzyma z rozgrzanej skały i lawy. Typ ataku (`attackElement`), pancerz i podatność są obsługiwane w migawce walki oraz przy przewijaniu. Kula ognia z maną ma typ ognia; atak różdżką bez many jest fizyczny. Mag obecnie nie ma dostępnego w interfejsie zaklęcia wodnego — podatność jest przygotowana pod przyszłe dodanie takiego ataku.


## Specjalne ataki nowych potworów Kopalni

W misjach Starej Kopalni, z doborem przeciwników w zakresie ±3 poziomów postaci, pojawiają się trzy nowe potwory z osobnymi awatarami:

| Przeciwnik | Poziom | HP | Obrażenia | EXP | Złoto | Zdolność |
| --- | ---: | ---: | --- | ---: | ---: | --- |
| Jadowity Stonóg | 8 | 231 | 20–28 | 2777 | 65 | Co 3. własny atak: trucizna 8 × 3 tury; pancerz pochłania 2 obrażenia z trafienia, min. 1 obrażenie. |
| Łańcuchowy Troll | 13 | 462 | 33–47 | 9200 | 155 | Co 5. własny atak: 150% bazowych obrażeń, zaokrąglone w dół przed redukcją pancerza. |
| Zarodnikowy Pełzacz | 14 | 352 | 31–40 | 17000 | 165 | Co 4. własny atak: zarodniki 12 × 2 tury. |

Zatrucie działa na początku kolejnych tur celu i omija pancerz. Sam atak nakładający efekt nadal zadaje zwykłe obrażenia. Ponowne nałożenie odświeża czas, bez kumulowania. Śmierć od zatrucia kończy walkę przed atakiem i zużyciem many zatrutej postaci. Licznik liczy rzeczywiste ataki danego wojownika, nie łączną liczbę tur. Liczniki i efekty pozostają w migawce walki przy zamknięciu i odświeżeniu; przewijanie stosuje te same zasady. Zakończenie walki usuwa efekty razem z jej stanem. Nagrody pozostają w złocie i EXP, bez przedmiotów i odłamków.

Testy mechaniki walki można uruchomić poleceniem `node --test tests/*.test.cjs` z katalogu repozytorium; nie wymagają instalowania pakietów.


## Kolejni przeciwnicy Mrocznego Lasu

Pięć nowych potworów z osobnymi awatarami występuje w zleceniach Branda z doborem ±3 poziomy postaci:

| Potwór | Poziom | HP | Atak | Złoto | EXP | Zdolność |
| --- | ---: | ---: | --- | ---: | ---: | --- |
| Krwiożerczy Kwiat | 6 | 182 | 17–25 | 52 | 1350 | Ciernisty Chwyt: +10 bazowych obrażeń co 4. własny atak. |
| Przeklęty Jeleń | 7 | 209 | 19–27 | 61 | 1900 | Szarża co 4. własny atak: 150% bazowych obrażeń. |
| Duch Starego Boru | 14 | 391 | 32–42 | 85 | 16400 | −15% obrażeń fizycznych, +20% obrażeń magicznych (ogień/woda). |
| Wilkołak Brzeziny | 6 | 193 | 22–25 | 53 | 1388 | +20% obrażeń wyłącznie poniżej 30% HP. |
| Upiorny Łucznik | 13 | 363 | 33–46 | 75 | 10333 | Przeszywająca Strzała co 3. własny atak: pomija 30% pancerza i odporności fizycznej celu. |

Premie do ataku są naliczane przed obroną; procentowe zwiększenia i końcowe obrażenia po odporności są zaokrąglane w dół, z minimum 1 obrażeniem. Odporność procentowa działa po redukcji pancerza. Furia jest obliczana z aktualnego HP na początku ataku, także po obrażeniach od zatrucia; dokładnie 30% HP nie uruchamia furii. Przebicie pomija zaokrągloną w dół część pancerza i odporności. Obecne wyposażenie bohatera zwiększa cechy i HP, a nie redukcję pancerza — dodatkowy efekt Przeszywającej Strzały ma znaczenie, gdy cel taką redukcję posiada. Liczniki i cechy pozostają w migawce walki przy odświeżeniu oraz przewijaniu. Nagrody obejmują wyłącznie podane złoto i EXP.


## Dzwonnik Otchłani — Stara Kopalnia

Przeciwnik poziomu 14 występuje w misjach Branda przy różnicy do 3 poziomów między przeciwnikiem a postacią, wyłącznie w Starej Kopalni. Ma 429 HP, cechy 34/10/24/30 i atak fizyczny 36–48. Nagroda za zwycięstwo: dokładnie 90 złota i 17555 EXP, bez przedmiotów i odłamków; porażka nie daje nagrody. Awatar `abyss-bellringer.webp` przedstawia przygarbionego olbrzyma z czarną szczeliną zamiast twarzy i pękniętym dzwonem przykutym do pleców.

Echo Zagłady co czwarty własny atak dodaje osobną falę 12 bazowych obrażeń magicznych (bez kosztu many). Bez obrony czwarty cios zadaje łącznie 48–60 obrażeń. Podstawowy cios jest fizyczny; fala omija `physicalArmor` i procentową `physicalResistance`, lecz nadal podlega ogólnej redukcji `armor` oraz podatności `magicVulnerability`. Ogólny pancerz działa osobno na oba składniki, z minimum 1 obrażeniem na składnik. Fala nie zadaje obrażeń celowi już zabitemu przez podstawowy cios; komunikat i liczba nad portretem pokazują faktyczną utratę HP. Licznik ataków i zasady fali zapisują się z walką, a przewijanie korzysta z tego samego silnika. HP i podstawowy atak są niższe niż u Golema Magmowego; premia do czwartego ciosu wyróżnia Dzwonnika na tle Trolla i Pełzacza.


## Lochy od poziomu 10

Wejście do Lochów z mapy oraz menu wymaga co najmniej 10. poziomu postaci. Poniżej tego progu wyświetla się informacja o wymaganym i obecnym poziomie. Etykiety przycisków w menu i na mapie wskazują wymaganie. Poziom jest odczytywany z aktualnego zapisu przy każdej próbie wejścia; brak lub nieprawidłowy poziom jest traktowany jako poziom 1, a błąd odczytu zapisu blokuje wejście. Po osiągnięciu poziomu 10 otwiera się okno wyboru trzech Lochów.


## Wybór Lochów

Kliknięcie Lochów na mapie lub w menu otwiera wybór trzech lokacji:

| Loch | Wymagany poziom postaci |
| --- | ---: |
| Cmentarzysko | 10 |
| Wzgórza Gryfów | 30 |
| Katakumby | 50 |

Każda pozycja ma osobny emblemat, wymagany poziom oraz informację o dostępności. Przyciski lokacji powyżej poziomu bohatera są zablokowane. Wybór dostępnej lokacji otwiera jej nazwany widok z przyciskiem powrotu; wnętrza i walki w tych Lochach pozostają w przygotowaniu. Przy każdej próbie wyboru poziom jest odczytywany z aktualnego zapisu. Zmiany zapisu w innej karcie oraz powrót do okna odświeżają dostępność, a błąd odczytu blokuje wybór. Oglądanie i wybór Lochów nie zmieniają postaci, energii ani nagród.


## Ikony trzech Lochów

Okno wyboru i widoki lokacji korzystają z osobnych malowanych ikon w stylistyce medalionów Pustkowia: czarna stal, stare złoto i ciemna zieleń. Cmentarzysko przedstawia omszały nagrobek we mgle (`dungeon-graveyard-icon.webp`), Wzgórza Gryfów — gryfa na skalistym szczycie (`dungeon-gryphon-hills-icon.webp`), a Katakumby — wejście do podziemnego grobowca (`dungeon-catacombs-icon.webp`). Grafiki WebP mają 384 × 384 px i przezroczyste tło poza medalionem. Zastępują robocze symbole SVG, zachowują proporcje i są dekoracyjne dla czytników ekranu. Zablokowane lokacje mają przygaszoną ikonę oraz tekst o wymaganym poziomie; wymagania 10/30/50 i zasady wyboru pozostają bez zmian.

## Magiczny pył i wymiana u alchemiczki

Magiczny pył ma osobną ikonę `magic-dust.webp` i licznik `hero.magicDust` (starsze zapisy: 0). Jest zbierany w jednym stosie, który po zdobyciu zajmuje jedno z 25 miejsc w siatce Ekwipunku, również w plecaku z karty Bohatera. Ilość jest pokazana na ikonie; materiału nie można założyć. Po zużyciu całego stosu slot się zwalnia. Dotychczasowy licznik magicDust jest zachowany bez resetowania; przy starym pełnym plecaku nie usuwa się istniejących przedmiotów, a nadmiar pozostaje dostępny przez miejsca wyposażenia. Nowy stos wymaga wolnego miejsca, dopisywanie do istniejącego stosu nie wymaga kolejnego slotu. `MagicDust.award(hero, amount)` przygotowuje dopisanie nagrody do zapisu; nie dodaje niczego automatycznie. Lochy nie mają jeszcze walk ani tabel nagród, dlatego zdobywanie pyłu w Lochach wymaga późniejszego podłączenia ich nagród — nie dodano nieustalonych szans ani darmowego odbierania pyłu.

Stół alchemiczki wymienia dokładnie 25 pyłu na 1 odłamek, jedną wymianę na kliknięcie. Reszta materiału pozostaje w ekwipunku. Przycisk jest blokowany poniżej 25 sztuk i podczas operacji. Odczyt aktualnego zapisu, odjęcie pyłu i dodanie odłamka odbywają się pod wspólną blokadą Web Locks z innymi operacjami postaci. Nieudany zapis nie zużywa materiałów; błędne i przepełnione liczniki są odrzucane. Zmiana zapisu w innej karcie aktualizuje stół, a saldo odłamków w menu odświeża się od razu po wymianie.


## Nauczyciele profesji według klasy

Wojownik i Krasnolud szkolą się u Paladyna Gabriela w koszarach, Mag u Alchemiczki w Wieży Zielonego Płomienia. Obie rozmowy mają przycisk „Porozmawiaj o profesjach”. Niewłaściwy nauczyciel wskazuje właściwą postać, bez dostępu do formularza szkolenia. Elf szkoli się u Lyrien w Komnacie Leśnej Przysięgi w głównym zamku. Wymagany poziom 10 zostaje zachowany. Wojownik i Wojowniczka mogą od poziomu 10 wybrać Palladyna lub Rycerza. Pozostałe nieustalone profesje pozostają zablokowane. Obsługa formularza ponownie odczytuje zapis i sprawdza klasę, nauczyciela oraz poziom. Nie zmieniono istniejących profesji w zapisie ani walut.


## Siedem nagród Koła Losu

- Energia +25, do obecnego limitu 100.
- Kuc Bojowy: jednorazowe odblokowanie, awatar w oknie Wierzchowiec, automatycznie +5 obrażeń i +5 ogólnej obrony w nowych walkach (także Tauriel), nowe zwiady krótsze o 10%.
- Rzadki Materiał ×1: materiał w ekwipunku do przyszłego wytwarzania rzadkiego sprzętu.
- Mikstura mocy: czerwony flakon, przedmiot do slotu specjalnego, +10 obrażeń wyłącznie po założeniu; kolejne mikstury nie zwiększają premii jednocześnie.
- Kawałek klejnotu ×1: materiał do przyszłego wytwarzania biżuterii.
- EXP +250: natychmiast przyznawane postaci, z normalnymi awansami.
- Zwój zaklęć ×1: materiał; stół Lilith wymienia 10 zwojów na 1000 EXP.

Dostępne nagrody mają równe szanse. Z puli odpada już zdobyty kuc, energia przy pełnym pasku i mikstura przy pełnym plecaku, aby nie pobierać opłaty za niedostępną nagrodę. Każdy zdobyty rodzaj materiału zajmuje jeden slot w siatce ekwipunku, z ilością w stosie; niezdobyte materiały nie są wyświetlane. Przy pełnym plecaku koło pomija materiały wymagające nowego slotu, ale dopisuje kolejne sztuki do istniejących stosów. Wytwarzanie sprzętu i biżuterii nie jest jeszcze aktywne. Materiały mają osobne grafiki WebP: rare-material, power-potion, gem-fragment, spell-scroll; awatar kuca: war-pony.webp.

Bonusy walki są utrwalane w nowej migawce walki; zdobycie kuca lub zmiana mikstury nie zmienia już trwającej walki. Przyspieszony zwiad zapisuje durationVersion 3, bazowy czas i premię; nagroda nadal odpowiada bazowemu czasowi, a dawne aktywne misje zachowują termin. Testy obejmują wszystkie nagrody, obie waluty, niedostateczne środki, pojemność plecaka, bonusy wyposażenia, zapis skróconych misji i wymianę zwojów.


## Podsumowanie porażki u Branda

Po rozliczeniu przegranej walki zamykane jest pole walki, a rozmowa z Brandem pokazuje tytuł „Porażka” i informację o braku nagrody. Nie otwiera się ponownie pusty podgląd po wyczyszczeniu activeCombat/combatOffer. Dzięki temu cykliczne odświeżanie nie zastępuje wyniku komunikatem „Brak dostępnych przeciwników”. Przy ponownym wejściu do Branda powstają normalne nowe oferty zgodnie z zakresem ±3 poziomów; porażka nie dodaje nagród ani nie pobiera energii ponownie.

Test przeglądarkowy wszystkich przeciwników Branda i regresji porażki: `node tests/all-monsters.browser.cjs http://127.0.0.1:8000/` przy lokalnym serwerze katalogu `dist`. Wymaga Playwright i Chromium (`/usr/bin/chromium`). Sprawdza portrety, zwycięstwa, nagrody, kolejne oferty oraz porażki ze wszystkich terenów na szerokościach 1280 i 390 px. Osobno dostępne są testy mechaniki `node --test tests/*.test.cjs`.


## Materiały w slotach ekwipunku

Magiczny pył, Rzadki Materiał, Kawałek klejnotu i Zwój zaklęć działają jednakowo: pojawiają się w jednym slocie po zdobyciu, z ikoną i licznikiem ilości. Ilość 0 nie tworzy slotu ani osobnego panelu. Wszystkie stare ilości są zachowane. Wymiana ostatnich zwojów lub pyłu zwalnia miejsce; pozostałość nadal zajmuje jeden slot. Materiałów nie można zakładać jako uzbrojenia. Mikstura mocy pozostaje przedmiotem do slotu specjalnego, a Kuc Bojowy pozostaje w oknie Wierzchowiec.


Tabela EXP obejmuje wymagania do awansu z poziomów 1–119 (1→2: 300, 2→3: 800, 119→120: 2 500 000 000). Nie są to progi skumulowane. Wartości przepisano zgodnie z podaną listą, również skoki na poziomach 78 i 91. Poziom i EXP zapisanych postaci pozostają zachowane; nowe progi są używane przez pasek postępu oraz wszystkie kolejne nagrody i wymiany.


## Aktualny balans potworów po imporcie arkusza

Nagrody EXP i złota dla wszystkich 32 przeciwników przepisano według ID z przesłanego `Pustkowie_potwory.xlsx`. Każdy przeciwnik ma stałą nagrodę. Bazowe HP i obie granice ataku z arkusza zwiększono jednokrotnie o 10%, zaokrąglając w górę do pełnego punktu. Stałe dodatki zdolności, trucizny, pancerz i poziomy pozostają takie same. Rozpoczęte wcześniej walki zachowują zapisany stan i nagrodę; nowy balans obowiązuje w nowych walkach.

Rozbójnicy Tauriel przyznają teraz także złoto i EXP za każdy nowy wygrany pojedynek, jednorazowo. Naszyjnik i odblokowanie piętra nadal wymagają pokonania całej trójki. Porażka nie daje nagrody.

| Poziom | Potwór | Lokalizacja | HP | Atak | Złoto | EXP |
| ---: | --- | --- | ---: | --- | ---: | ---: |
| 1 | Duch | Stara Kopalnia | 77 | 8–11 | 18 | 100 |
| 1 | Dzik | Mroczny Las | 77 | 8–11 | 18 | 100 |
| 1 | Wąż błotny | Podziemia Miasta | 77 | 8–11 | 18 | 100 |
| 2 | Dziki Pies | Podziemia Miasta | 99 | 10–15 | 30 | 200 |
| 2 | Rozbójnik | Stara Kopalnia | 99 | 10–15 | 35 | 250 |
| 2 | Wilk | Mroczny Las | 99 | 10–15 | 34 | 233 |
| 3 | Driada | Mroczny Las | 121 | 13–18 | 36 | 500 |
| 3 | Ogromny szczur | Stara Kopalnia | 121 | 13–18 | 33 | 550 |
| 3 | Zbłąkany człowiek | Podziemia Miasta | 121 | 13–18 | 40 | 489 |
| 5 | Goblin | Mroczny Las | 149 | 15–21 | 40 | 820 |
| 5 | Kryształowy ogr | Stara Kopalnia | 149 | 15–21 | 40 | 900 |
| 5 | Przywódca rozbójników | Zadanie Tauriel | 176 | 16–21 | 50 | 1000 |
| 5 | Rozbójnik spod barykady | Zadanie Tauriel | 138 | 13–17 | 50 | 1200 |
| 5 | Rozbójnik Żelazna Pięść | Zadanie Tauriel | 154 | 14–19 | 100 | 1500 |
| 5 | Trolgotyta | Podziemia Miasta | 149 | 15–21 | 50 | 920 |
| 6 | Krwiożerczy Kwiat | Mroczny Las | 182 | 17–25 | 52 | 1350 |
| 6 | Wilkołak Brzeziny | Mroczny Las | 193 | 22–25 | 53 | 1388 |
| 7 | Kryształowy Skorpion | Stara Kopalnia | 215 | 28–33 | 60 | 1700 |
| 7 | Przeklęty Jeleń | Mroczny Las | 209 | 19–27 | 61 | 1900 |
| 8 | Jadowity Stonóg | Stara Kopalnia | 231 | 20–28 | 65 | 2777 |
| 8 | Szeptun drzewny | Mroczny Las | 231 | 20–28 | 25 | 2500 |
| 9 | Demonica Puszczy | Mroczny Las | 259 | 22–30 | 35 | 3300 |
| 9 | Nieumarły Górnik | Stara Kopalnia | 253 | 29–39 | 25 | 3500 |
| 10 | Widmowy Rycerz | Mroczny Las | 286 | 26–33 | 55 | 5100 |
| 13 | Łańcuchowy Troll | Stara Kopalnia | 462 | 33–47 | 155 | 9200 |
| 13 | Upiorny Łucznik | Mroczny Las | 363 | 33–46 | 75 | 10333 |
| 14 | Aelira | Mroczny Las | 396 | 31–42 | 75 | 15300 |
| 14 | Duch Starego Boru | Mroczny Las | 391 | 32–42 | 85 | 16400 |
| 14 | Dzwonnik Otchłani | Stara Kopalnia | 429 | 36–48 | 90 | 17555 |
| 14 | Zarodnikowy Pełzacz | Stara Kopalnia | 352 | 31–40 | 165 | 17000 |
| 15 | Golem Magmowy | Stara Kopalnia | 528 | 43–61 | 100 | 25000 |
| 15 | Leśny Pożeracz | Mroczny Las | 440 | 33–44 | 99 | 25000 |

Dane kontrolne importu: `tests/monster-balance.expected.json`; testy porównują każdy ID, obliczenie premii oraz wypłaty po zwycięstwie i porażce.
Test interfejsu nagród Tauriel: `node tests/tauriel-rewards.browser.cjs http://127.0.0.1:8000/`. Sprawdza trzy kolejne walki na komputerze i telefonie.

## Okno wygranej w Kole Losu

Po zakończeniu animacji obrotu małe okno pokazuje ikonę i nazwę wylosowanej nagrody. Przycisk „Zamknij” wraca do koła; nagroda jest już zapisana i zamknięcie nie przyznaje jej ponownie. Wyjście z koła usuwa też okno wygranej. Test siedmiu nagród na komputerze i telefonie: `node tests/wheel-win.browser.cjs http://127.0.0.1:8000/`.

## Mikstura mocy — 3 godziny

Pierwsze założenie mikstury do slotu specjalnego zapisuje jej termin ważności: 3 godziny czasu rzeczywistego. W plecaku nieużywana mikstura nie traci czasu. Zdjęcie, ponowne założenie i odświeżenie nie przedłużają działania. Po terminie premia +10 obrażeń znika, zużyta mikstura jest automatycznie usuwana z ekwipunku, a slot specjalny zostaje opróżniony. Nowe walki odczytują bieżącą premię, rozpoczęte zachowują zapisane parametry. Mikstura założona w starszym zapisie otrzymuje termin przy pierwszej synchronizacji postaci po aktualizacji.

## Większe nagrody koła od poziomu 10

Poziom jest odczytywany przy opłaceniu obrotu. Od poziomu 10 nagrody wynoszą: 10 000 EXP, 3 zwoje zaklęć, 3 kawałki klejnotu, 3 rzadkie materiały lub 40 energii (do limitu 100). Poniżej poziomu 10 pozostają 250 EXP, materiały po 1 sztuce i 25 energii. Kuc i mikstura zachowują swoje zasady. Lista nagród oraz okienko wygranej pokazują właściwe ilości; awans uzyskany z obrotu nie zmienia już przyznanej nagrody.

## Wymiana zwojów u Lilith według poziomu

Koszt jednej wymiany nadal wynosi 10 zwojów. Nagroda EXP zależy od poziomu postaci przed wymianą: poziomy 1–9 → 1000 EXP, 10–19 → 30 000 EXP, od 20 → 120 000 EXP. Awans po wymianie aktualizuje stawkę następnej wymiany. Opis w ekwipunku, stół alchemiczny i komunikat potwierdzenia korzystają z tych samych zasad.

## Polana — przejście za mury

Na mapie zamku pod Czarnym Targiem i dolnymi schodami znajduje się przejście „Polana” (65%, 94%). Jest też dostępne w menu ŚWIAT. Przenosi do pełnego widoku nowej lokacji z autorską panoramą `glade.webp`, trzema ścieżkami I–III oraz powrotem do zamku. Ścieżka I nosi nazwę „Lodowe Wzgórza” i prowadzi w góry, II — „Eldor” (osada elfów), III — „Ubocze” (tawerna „Pod złotym Kucem”). Podpisy mapy i tytuły okien używają tych nazw; dalsze lokacje pozostają do stworzenia. Samo wejście nie pobiera energii.

Polana używa tego samego mechanizmu przeciągania, bezwładności, gestów dotykowych i przybliżania co miasto. Panorama zachowuje proporcje, a powrót odtwarza położenie mapy zamku. Zmiana mapy resetuje przybliżenie i usuwa poprzedni kontroler gestów. Test: `node tests/glade.browser.cjs http://127.0.0.1:8000/` — wejście z mapy, grafika, ścieżki, przesuwanie, zoom i powrót na szerokościach 1280 i 390 px.

## Myśliwy Teo po zadaniu Tauriel

Po trzech zwycięstwach w zadaniu Tauriel (status `ready` lub `completed`) jej miejsce przy filarze w dolnej sali zajmuje Myśliwy Teo w skórzanym stroju, z łukiem i kołczanem. Wnętrze zmienia ilustrację na `tavern-with-teo.webp`. Teo ma znacznik rozmowy, portret i skup nagród przedmiotowych z Cmentarzyska. Za każdą kość truposza i czarny kawałek stali płaci 100 złota. Nagrody Branda nie zmieniają się. Przed ukończeniem zadania Teo jest ukryty i niedostępny. Tauriel pozostaje na piętrze, gdzie można odebrać naszyjnik.

Test stanów zadania i rozmów: `node tests/teo.browser.cjs http://127.0.0.1:8000/`. Test pełnej misji `tests/tauriel-rewards.browser.cjs` sprawdza też pojawienie się Teo bez przeładowania po trzecim zwycięstwie.

## Bossowie Cmentarzyska

Od poziomu 10 Cmentarzysko udostępnia jednorazową kolejność: Upiór → Szkielet → Licz → Czarny Rycerz → Minotaur. Kolejny boss odblokowuje się po zwycięstwie. Porażka pozwala ponowić starcie, bez nagrody. Próby nie kosztują energii. Stan starcia i postęp pozostają po odświeżeniu, a przewijanie używa wspólnego silnika walki.

| Boss | Poziom | HP | Obrażenia | Złoto | EXP | Pozostałe nagrody |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Upiór | 10 | 500 | 60 | 500 | 11100 | Pył ×10, Kość truposza ×1 |
| Szkielet | 13 | 700 | 50 | 500 | 22000 | Pył ×20, Rzadki Materiał ×5, Kość truposza ×5 |
| Licz | 15 | 700 | 80 | 500 | 50000 | Pył ×30, Kość truposza ×5 |
| Czarny Rycerz | 18 | 1000 | 99 | 1000 | 100000 | Pył ×50, Czarny kawałek stali ×5 |
| Minotaur | 20 | 1200 | 150 | 2000 | 250000 | Odłamki ×10, Topór Minotaura ×1 |

Kości i stal są stosami zajmującymi po jednym miejscu w plecaku. Nagrody są zapisywane atomowo, bez powtórnego odbioru. Pełny plecak blokuje rozpoczęcie, jeśli brakuje miejsca na nagrody; w przypadku zapełnienia podczas walki wynik pozostaje do odbioru po zwolnieniu miejsca. Topór jest bronią od poziomu 20 i po założeniu daje +10 siły oraz +10 wytrzymałości. Bonus obejmuje też wcześniej zdobyte egzemplarze, nie kumuluje się po ponownym założeniu i znika po zdjęciu broni. Ilustracje bossów i przedmiotów są zapisane w atlasach `graveyard-bosses.webp` oraz `graveyard-items.webp`. Testy: `node --test tests/*.test.cjs` oraz `node tests/graveyard.browser.cjs http://127.0.0.1:8000/`.

## Okno nagród po walce z bossem

Po rozliczeniu walki Cmentarzyska, również po przewinięciu, otwiera się osobne okno z nazwą bossa, ikonami, nazwami i ilościami wszystkich zapisanych nagród oraz informacją o awansie. Po porażce pokazuje wynik bez nagród. Przycisk „Wróć do Cmentarzyska” zamyka okno; wyświetlanie i zamknięcie nie naliczają niczego ponownie. Starsze podsumowanie nie otwiera się samo przy ponownym wejściu do Lochów. Test przeglądarkowy pięciu bossów obejmuje oba sposoby zakończenia, wznowienie, zawartość okienka i porażkę na komputerze i telefonie.


## Ikona i automatyczne usunięcie mikstury

Założona mikstura pokazuje czerwoną ikonę w slocie specjalnym na karcie postaci. Po upływie zapisanych 3 godzin znika ze slotu i plecaka również przy otwartym oknie postaci. Synchronizacja zapisuje usunięcie pod wspólną blokadą i odświeża widok. Nieużywane mikstury oraz inne przedmioty pozostają bez zmian. Test: `node tests/potion-slot.browser.cjs http://127.0.0.1:8000/`.


## Nowe potwory z arkusza — poziomy 16–30

Dodano 15 przeciwników Branda z przesłanego arkusza. HP, bazowe obrażenia i stałe nagrody są dokładnie takie jak w nowych wierszach; wcześniejsze 32 wpisy zachowują dotychczasowy balans, w tym wcześniejsze zwiększenie HP i ataku o 10%. Nowym wpisom nadano stałe identyfikatory. Dobór nadal ogranicza się do ±3 poziomów postaci, a rozpoczęte walki zachowują zapisany przebieg. Ork Szaman rzuca magiczny pocisk: pocisk omija obronę fizyczną, lecz ogólny pancerz nadal redukuje jego obrażenia. Nie dodano losowych przedmiotów do nagród Branda.

| Poziom | Potwór | Lokalizacja | HP | Obrażenia | EXP | Złoto |
| ---: | --- | --- | ---: | --- | ---: | ---: |
| 16 | Mroczny Rozpruwacz | Mroczny Las | 550 | 88–88 | 48000 | 150 |
| 17 | Nefrytowa Jaszczurka | Stara Kopalnia | 589 | 88–88 | 55000 | 130 |
| 18 | Golem | Podziemia Miasta | 599 | 90–90 | 52999 | 166 |
| 19 | Ent | Mroczny Las | 660 | 90–90 | 75000 | 179 |
| 20 | Drzewiec | Mroczny Las | 750 | 100–100 | 99000 | 188 |
| 21 | Zabłąkany Elf | Mroczny Las | 750 | 100–100 | 101000 | 200 |
| 22 | Leśny Elf | Mroczny Las | 760 | 105–105 | 105000 | 200 |
| 23 | Mroczny Elf | Mroczny Las | 770 | 110–110 | 130000 | 200 |
| 24 | Ork | Stara Kopalnia | 800 | 115–115 | 170000 | 200 |
| 25 | Ork Tropiciel | Stara Kopalnia | 830 | 120–120 | 200000 | 210 |
| 26 | Ork Szaman | Stara Kopalnia | 845 | 125–125 | 230000 | 250 |
| 27 | Zombie | Podziemia Miasta | 750 | 100–100 | 270000 | 150 |
| 28 | Upiór z Bagien | Mroczny Las | 700 | 130–130 | 310000 | 100 |
| 29 | Gorgon | Podziemia Miasta | 800 | 150–150 | 350000 | 250 |
| 30 | Bazyliszek | Podziemia Miasta | 900 | 150–150 | 400000 | 250 |

Awatary są zapisane w trzech atlasach 3×2: `monsters-level-16.webp`, `monsters-level-21.webp`, `monsters-level-26.webp`. Testy importu, zakresów poziomów, magii oraz normalnej i przewiniętej walki: `node --test tests/*.test.cjs`. Test przeglądarkowy nowych przeciwników na komputerze i telefonie, z regresjami porażek: `node tests/all-monsters.browser.cjs http://127.0.0.1:8000/ --new-monsters`.

## Lochy — wspólne odnowienie walk co 3 godziny

Każde nowe rozliczenie walki z bossem, wygrane lub przegrane, zapisuje `dungeonNextFightAt` na 3 godziny od zakończenia. Zwycięstwo zachowuje postęp i blokuje kolejną walkę; porażka blokuje ponowną próbę na ten sam czas. Nie resetuje to pokonanych bossów. Termin jest wspólny dla walk w lochach i pozostaje po zamknięciu gry oraz odświeżeniu. Wznowienie już rozpoczętego starcia jest dozwolone. Lista bossów i okno wyniku pokazują pozostały czas, a przycisk odblokowuje się automatycznie po terminie. Stare zapisy bez tego pola nie otrzymują wstecznej blokady.


## Większe nagrody za zwiady czasowe

Nowe misje czasowe przyznają zakresy złota zwiększone o 250% (×3,5, końce zakresów zaokrąglone w górę) i czterokrotnie większe zakresy EXP. Misja zapisuje wersję nagród przy rozpoczęciu. Starsze zwiady zachowują zapisane nagrody i pozostają prawidłowe; przy dawnym zapisie bez nagrody losowanie używa wcześniejszych zakresów. Odbiór nie mnoży nagród ponownie. Czasy, koszty energii, szansa odłamka i premia wierzchowca pozostają takie same. Testy: `node --test tests/*.test.cjs` i `node tests/scout-rewards.browser.cjs http://127.0.0.1:8000/`.


## EXP ×50 za wszystkie misje czasowe

Bieżące nagrody EXP zwiadów zwiększono jeszcze 50-krotnie: 1 minuta → 1000–2200, 5 minut → 5000–8800, 10 minut → 15400–20200, 15 minut → 25000–40000 EXP. Złoto, czas, koszt energii, szanse odłamków i premia wierzchowca pozostają takie same. Nowe misje zapisują `rewardVersion: 2`. Starsze misje wersji 0 i 1 nadal odczytują wcześniejsze zakresy i zachowują zapisane nagrody; odbiór nie mnoży ich ponownie.


## Zwiady czasowe na poziomach 26–35

Na poziomach 26–35 Brand pokazuje jeden łatwiejszy zwiad czasowy i jedną trudniejszą ofertę walki, tak samo jak na pozostałych poziomach. Nowy przedział trwa 20 minut i daje zawsze 150 000 EXP oraz 500 złota. Szansa na dodatkowy 1 odłamek wynosi 10%, z losowaniem zapisywanym przy rozpoczęciu. Zwiad kosztuje 3 energii; Kuc Bojowy skraca czas do 18 minut. Poziomy 1–25 zachowują dotychczasowe wartości. Od poziomu 36 czas i nagrody pozostają do ustalenia.


## Sprzedaż u Myśliwego Teo

Skup obejmuje wyłącznie kości truposza i czarne kawałki stali. Teo nie kupuje magicznego pyłu, rzadkiego materiału ani Topora Minotaura. Gracz wybiera liczbę sztuk, a Teo płaci 100 złota za każdą sztukę. Cena dotyczy typu przedmiotu niezależnie od źródła zdobycia; odłamki pozostają walutą. Sprzedaż pod blokadą Web Locks ponownie sprawdza aktualny zapis i zapisuje usunięcie przedmiotów ze złotem w jednej operacji. Błąd zapisu nie zabiera przedmiotów ani nie dopisuje złota. Zużycie ostatniej sztuki materiału zwalnia jego miejsce w plecaku. Teo pozostaje dostępny dopiero po wykonaniu zadania Tauriel. Testy: `node --test tests/*.test.cjs`, `node tests/teo-trade.browser.cjs http://127.0.0.1:8000/`.

## Przedsionek zamku i sala tronowa

Wejście „Zamek” na mapie i w menu otwiera Komnaty z Czarnej Stali: panoramiczny przedsionek z trzema parami drzwi. Środkowe prowadzą do sali tronowej z rudowłosą królową siedzącą na tronie; przycisk powrotu przenosi do przedsionka. Przy głównych drzwiach stoi dwóch strażników, po jednym z każdej strony, bez podpisów i interakcji. Lewe boczne drzwi prowadzą do Komnaty Leśnej Przysięgi; prawe pozostają bez funkcji. Oba wnętrza mają oryginalne ilustracje `castle-antechamber.webp` i `castle-throne-queen.webp`, przesuwanie z bezwładnością i przybliżanie korzystające z tego samego `SceneZoom.mount` co karczma. Widok początkowo centruje główne drzwi lub tron. Zmiana komnaty i zamknięcie panelu usuwają obserwatory i obsługę gestów. Nawigacja nie zmienia zasobów ani zapisu postaci. Test przeglądarkowy: `node tests/castle.browser.cjs http://127.0.0.1:8020/` (1280 i 390 px, gest dotykowy, mysz, przybliżanie, przejścia, ponowne otwarcie).

Postać na tronie odtworzono na podstawie przesłanej ilustracji: korona i biżuteria z rubinami, bordowe szaty ze złotym haftem, zdobione buty, skrzyżowane nogi oraz tron z lwimi podłokietnikami i futrem. Kompozycja zachowuje panoramiczną salę, centrowanie i obsługę przybliżania; postać nie ma jeszcze interakcji.


## Medaliony ścieżek Polany

Znaczniki i okna kierunków używają osobnych ikon WebP 384 × 384 px z przezroczystym tłem: Lodowe Wzgórza — lodowe szczyty (`glade-ice-hills-icon.webp`), Eldor — elficka osada w koronach drzew (`glade-eldor-icon.webp`), Ubocze — szyld złotego kuca i tawerna (`glade-ubocze-icon.webp`). Okrągłe obramowanie z czarnej stali i starego złota pasuje do medalionów lochów. Na mapie ikony mają 64 px, w oknie kierunku 128 px. Zastępują cyfry I–III; nazwy, opisy i przesuwanie Polany działają jak dotychczas.


## Poziomy dostępu do kierunków Polany

Eldor od poziomu 50 będzie osadą elfów przeznaczoną do misji i wypraw. Ubocze od poziomu 30 będzie karczmą „Pod złotym Kucem” z nowymi postaciami i misjami. Lodowe Wzgórza od poziomu 75 będą siedzibą zamku krasnoludów. Nazwy i umiejętności profesji, nauczyciele, zadania i wnętrza pozostają do stworzenia. Znaczniki pokazują wyłącznie nazwy lokacji; wymagany poziom jest widoczny po kliknięciu. Zamknięte kierunki mają przygaszone ikony. Kliknięcie ponownie odczytuje aktualny zapis postaci: poniżej progu pokazuje blokadę, od progu opis przygotowywanej lokacji. Dostęp do Eldoru nie jest ograniczony klasą, szkolenie Elfów znajduje się w głównym zamku.


## Profesje Elfów w głównym zamku

Lewe boczne drzwi w przedsionku Zamku Czarnej Stali otwierają Komnatę Leśnej Przysięgi z panelem profesji klasy Elf. Szkolenie wymaga poziomu 10; dwie istniejące profesje pozostają wyłączone jako „Do ustalenia” do czasu ustalenia nazw i umiejętności. W komnacie stoi Lyrien, nauczycielka profesji Elfa, odtworzona na podstawie przesłanej ilustracji. Inne klasy otrzymują informację o własnym nauczycielu. Eldor ma próg 50 i jest lokacją misjową, bez szkolenia profesji. Pozostałe drzwi i władczyni nie zmieniają się.

Ilustracja nauczycielki `elf-profession-teacher.jpg` jest niezmienioną kopią przesłanego zdjęcia: zachowuje pełny kadr, szczegóły postaci i oryginalną rozdzielczość 960 × 1280. Oryginalna ilustracja pozostaje zachowana jako wzorzec wyglądu Lyrien; obecny widok używa panoramy komnaty. Wymóg poziomu 10 i blokady nieustalonych profesji pozostają zachowane.


## Profesje Wojownika i Wojowniczki

Od poziomu 10 u Paladyna Gabriela można wybrać Palladyna (`warrior-profession-1`) lub Rycerza (`warrior-profession-2`). Palladyn może zakładać przedmioty oznaczone `holy: true`; konkretne Święte przedmioty dodamy później. Rycerz odnawia pełne 100 energii co 6 godzin, również po nieobecności. Pozostałe klasy i profesje zachowują 12 godzin. Wybrana profesja jest stała. Pierwszy wybór Rycerza zachowuje początek bieżącego cyklu energii. Każda klasa ma tylko dwie profesje. Nieustalone profesje pozostałych klas są nadal zablokowane.


## Profesje Maga i Magini

Od poziomu 10 u Lilith można wybrać Nekromantę (`mage-profession-1`) lub Alchemika (`mage-profession-2`). Nekromanta zastępuje Kulę ognia Mrocznym pociskiem: 10 many, magiczne obrażenia z dodatkową premią 10% (zaokrąglenie w dół) przed redukcją pancerza. Cechy nie zmieniają się, bez many pozostaje atak różdżką. Nowe walki zapisują efekt w migawce; rozpoczęte wcześniej pozostają bez zmian. Nekromanta ignoruje oczekiwanie w lochach, także po porażce. Kolejność bossów, pojedyncze zwycięstwa i nagrody nie zmieniają się. Rzeczywisty termin 3 godzin nadal zapisuje się po walce i obowiązuje po zmianie profesji. Alchemik jest dostępny do wyboru; tworzenie mikstur i zbieranie ziół dodamy później. Mag i Magini mają tylko te dwie profesje.


## Panoramiczna Komnata Leśnej Przysięgi

Lewe drzwi zamku otwierają pełny widok pomieszczenia `lyrien-chamber.webp`: kamienne sklepienia, pochodnie, zielone chorągwie, wyposażenie treningowe i Lyrien stojąca swobodnie w komnacie. Podpis „Lyrien” otwiera rozmowę i istniejący panel profesji Elfa; blokada poziomu 10 i nieustalonych profesji pozostają zachowane. Pokój korzysta ze wspólnego `SceneZoom.mount`: przeciąganie myszą i palcem, bezwładność, kółko, gest szczypania i klawiatura. Zamknięcie rozmowy pozostawia widok pokoju. Wyjście z komnaty odbywa się przez X w prawym górnym rogu, jak w koszarach. Dolny przycisk powrotu jest widoczny tylko w sali tronowej. Na niskich ekranach początkowe przesunięcie pokazuje cały przycisk Lyrien z zapasem miejsca. Zmiana pomieszczenia odtwarza obsługę gestów; zamknięcie zamku usuwa ją wraz z obserwatorem rozmiaru. Testy: `node tests/lyrien-panorama.browser.cjs http://127.0.0.1:8020/` i `node tests/elf-school.browser.cjs http://127.0.0.1:8020/`.


## Przekuwanie broni na poziom 35

Gorim Sadza w kuźni wytwarza broń na poziom 35 z 10 Rzadkich Materiałów, 10 Kawałków klejnotu i jednej zdjętej z postaci broni na poziom 25 dla tej samej klasy. Wytwarzanie wymaga poziomu 35 oraz dodatkowej opłaty 5000 złota i 5 odłamków. Wojownik otrzymuje Ostrze Szmaragdowego Zmierzchu (+20 Siła, +20 Wytrzymałość), Krasnolud Topór Serca Głębin (+20 Siła, +20 Wytrzymałość), Mag Różdżkę Astralnego Splotu (+20 Inteligencja, +20 Wytrzymałość), Elf Łuk Ametystowego Szeptu (+20 Zręczność, +20 Wytrzymałość). Premie działają po założeniu. Broń trafia do plecaka, a wybrany składnik i materiały są usuwane w tej samej operacji zapisu. Wytwarzanie może zastąpić składnik także w pełnym plecaku. Błąd zapisu nie zużywa składników. Nowy oręż jest dostępny wyłącznie przez wytwarzanie, bez dodawania go do oferty Gringa. Cztery unikalne ikony z atlasu `forged-weapons-35.webp` przedstawiają metal z zielonymi żyłami Rzadkiego Materiału, złotymi akcentami oraz fioletowo-błękitnymi kryształami Kawałka klejnotu. Nowa nazwa i grafika obejmują także wcześniej wykute egzemplarze; poziom i statystyki pozostają takie same. Opłata, materiały i broń są zużywane atomowo. Model: `weapon-crafting.js`; testy `node --test tests/*.test.cjs` i `node tests/weapon-crafting.browser.cjs http://127.0.0.1:8020/`.


## Nieodwracalny wybór profesji

Każda postać może wybrać profesję tylko raz. Zasada obejmuje wcześniejsze zapisy oraz wszystkie klasy i płcie. Przed zatwierdzeniem panel wyraźnie informuje o nieodwracalności. Po zapisaniu pola i przycisk wyboru są zablokowane, a profesja pozostaje widoczna. Obsługa formularza ponownie odczytuje zapis pod wspólną blokadą Web Locks, odrzuca drugi wybór i sprawdza zapis tuż przed nadpisaniem. Błąd zapisu nie zatwierdza profesji i pozwala spróbować ponownie.


## Zbrojownia i Roland

W Koszarach drzwi „Zbrojownia” otwierają nową panoramiczną kamienną salę `armory-roland.webp` ze stojakami na broń, świętymi pancerzami Palladynów i ciężkim uzbrojeniem Rycerzy. Roland stoi pośrodku jako zbrojmistrz; podpis z jego imieniem otwiera rozmowę. Pokój używa wspólnego przesuwania, bezwładności i przybliżania `SceneZoom`, jak karczma; na krótkich ekranach początkowy kadr zapewnia widoczny i klikalny podpis. Wyjście przez górny X, ponowne wejście do Koszar przywraca plac treningowy z Gabrielem.

Panel ekwipunku Rolanda jest udostępniany wyłącznie Wojownikowi/Wojowniczce od poziomu 10 z zapisaną profesją Palladyn lub Rycerz. Pozostałe klasy i postacie bez profesji mogą obejrzeć salę, ale otrzymują komunikat o ograniczeniu. Dostęp jest sprawdzany z aktualnego zapisu podczas rozmowy oraz po zdarzeniu storage/focus. Konkretne przedmioty, statystyki, ceny i sposób ich zdobywania ustalimy później; nie są przyznawane żadne przedmioty ani pobierane waluty. Testy: `node --test tests/*.test.cjs`, `node tests/armory-roland.browser.cjs http://127.0.0.1:8020/`.

## Mapa Ubocza

Ścieżka „Ubocze” na polanie od poziomu 30 otwiera pełną mapę `ubocze.webp`. Po lewej stoi odrębna, drewniano-kamienna karczma „Pod Złotym Kucem”, po prawej biegnie leśna ścieżka z mostkiem i własną ikoną. Znacznik karczmy znajduje się na jej drzwiach. Ścieżka prowadzi do krainy zła, której nazwa pozostaje do ustalenia. Oba miejsca mają osobne punkty interakcji; ich wnętrza, mieszkańcy i dalsze kierunki pozostają do ustalenia. Karczma nie otwiera istniejącej karczmy zamkowej. Początkowy kadr na telefonie pokazuje jej podpis. Przesuwanie myszą i dotykiem, bezwładność i przybliżanie korzystają ze wspólnego `SceneZoom`. Powrót prowadzi na polanę; przejścia między trzema mapami przywracają środek poprzedniego widoku. Wejście ponownie sprawdza poziom z zapisu i nie zużywa zasobów. Testy: `node tests/ubocze.browser.cjs`, `node tests/glade.browser.cjs`, `node tests/glade-levels.browser.cjs` przy lokalnej stronie na porcie 8020.
