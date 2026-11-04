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

Koszary Żelaznej Przysięgi znajdują się przy placu treningowym (znacznik na mapie i menu ŚWIAT). Każda klasa (wojownik, mag, elf, krasnolud) ma trzy osobne miejsca na profesje, łącznie 12. Nazwy i umiejętności ustalimy później. Robocze etykiety to Profesja 1, Profesja 2 i Profesja 3; identyfikatory są osobne dla każdej klasy.

Wymagany poziom to 10. Dopóki profesje mają pending: true, wybór jest niedostępny również po osiągnięciu tego poziomu. Blokada działa w interfejsie i obsłudze formularza. Poprzednie robocze nazwy zostały usunięte; istniejące zapisy postaci nie są nadpisywane podczas wczytywania. Wybrana docelowo profesja będzie zapisywana w istniejącym zapisie v2. Stare zapisy bez pola level mają poziom 1. System zdobywania poziomów i umiejętności pozostaje w przygotowaniu.

## Ikony interfejsu

Menu, znaczniki mapy i panele korzystają z lokalnego atlasu `dist/rpg-icons.webp` (4 × 4). Kolejność: zamek, karczma, koszary, arena / lochy, kuźnia, alchemik, targ / bohater, ekwipunek, dziennik, gildia / złoto, odłamki, energia, pomoc. `dist/icons.css` ustawia kadry i rozmiary. Ikony są dekoracyjne; nazwy przycisków pozostają dostępne dla czytników ekranu.

## Koło Losu przy fontannie

Centralna fontanna ma znacznik Koło Losu. Panel zawiera 12 nieodkrytych pól, animowany obrót podglądowy i koszt obrotu: 1 odłamek lub 100 złota, z osobnymi przyciskami obu opcji i saldami walut. Nagrody nie są jeszcze zdefiniowane, dlatego płatny obrót pozostaje zablokowany. Darmowy podgląd nie pobiera złota ani odłamków, nie przyznaje nagród i nie zmienia zapisu postaci. Zamknięcie panelu przerywa animację. Ceny definiuje stała `FateWheel.COSTS` w `wheel.js` (odłamki: 1, złoto: 100); pole `hero.shards` (nieujemna liczba całkowita) określa saldo wyświetlane w kole, starsze zapisy domyślnie mają 0.

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


## Dzienne odnowienie energii

Energia odnawia się do 100 punktów w stałym cyklu co 24 godziny. Nowa postać ma termin `nextEnergyResetAt` liczony od utworzenia; stary zapis otrzymuje termin 24 godziny po pierwszym wczytaniu po aktualizacji, z zachowaniem obecnej energii. Powrót po dłuższej przerwie uzupełnia energię raz, bez sumowania ponad 100. Termin przesuwa się o pełne doby, zachowując cykl. Zakupy piwa i misje nie przesuwają odnowienia. Limit piwa pozostaje niezależny.

Panel energii pokazuje czas do odnowienia. Gra sprawdza termin podczas działania, po powrocie do karty i przy operacjach na postaci. Aktualizacja energii korzysta z tej samej blokady zapisu co piwo i misje; przy błędzie zapisu surowe dane pozostają bez zmian. Czas pochodzi z zegara urządzenia. Reguły są w `energy.js`.


## Poziomy i EXP

Limit postaci wynosi 250 poziomów. `progression.js` określa wymagania EXP na awans z danego poziomu na kolejny:

| Poziom | EXP do następnego poziomu |
| --- | ---: |
| 1 | 100 |
| 2 | 250 |
| 3 | 500 |
| 4 | 750 |
| 5 | 1000 |
| 6 | 1300 |
| 7 | 1700 |
| 8 | 2100 |
| 9 | 2500 |
| 10 | 3000 |
| 11 | 3500 |
| 12 | 4000 |
| 13 | 4500 |
| 14 | 5000 |
| 15 | 5500 |

Progi nie są sumą EXP od początku gry. Nadwyżka przechodzi na kolejny poziom, a duża nagroda może dać kilka awansów. Na poziomie 16 i wyższych dalsze wymagania pozostają do ustalenia; EXP jest zachowywane bez automatycznych awansów ponad znane progi. Wczytanie istniejącej postaci nie resetuje jej poziomu ani EXP. Paski doświadczenia i nagrody zwiadu oraz walk korzystają z tego samego modułu.

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
| 1 minuta | 5–11 | 3–5 |
| 5 minut | 25–44 | 7–15 |
| 10 minut | 77–101 | 17–33 |
| 15 minut | 125–200 | 50–100 |

Losowania są niezależne i obejmują obie granice przedziałów. Nowa misja zapisuje nagrodę w `activeMission.reward` przy rozpoczęciu; tytuł, czas, lokacja i nagroda nie zmieniają się po odświeżeniu. Przy zgłoszeniu powrotu EXP, poziom, złoto i usunięcie aktywnej misji zapisują się w jednej transakcji, pod wspólną blokadą Web Locks. Nie ma dodatkowego kosztu energii ani podwójnego odbioru. Podsumowanie nagrody pojawia się po powrocie do karczmy i pozostaje w `lastScout`. Stary zwiad bez zapisanej nagrody otrzymuje ją przy pierwszym skutecznie zapisanym zakończeniu, według swojego czasu. Błąd zapisu nie przyznaje częściowej nagrody ani nie usuwa misji.


## Automatyczna walka u Branda

Zakładka „Walka z potworami” pozwala wylosować teren i otworzyć pełnoekranowy podgląd pola walki: Mroczny Las, Starą Kopalnię albo Podziemia Miasta. Po lewej są portret, poziom, życie i cztery startowe statystyki bohatera, zgodne z kartą postaci. Po prawej pozostaje puste miejsce przeciwnika. Wspólne statystyki początkowe i dotychczasowy wzór życia przeniesiono do `BrandCombat.profile`. Kliknięcie zakładki od razu otwiera wylosowany teren. Podgląd nie pobiera energii i nie przyznaje nagród. Teren jest zapisywany jako `combatOffer.sceneId` pod wspólną blokadą Web Locks, więc ponowne otwarcie, odświeżenie i inna karta zachowują ten sam przydział. Nie ma przycisków losowania ani ponownego losowania. Po dodaniu potworów przydział będzie zużywany przez zakończoną walkę.

`combat.js` ma oddzielne, puste pule potworów dla trzech terenów. Przycisk rozpoczęcia jest zablokowany; nie dodano żadnych potworów ani zasad ich obrażeń, inicjatywy i nagród. Docelowy koszt misji u Branda wynosi 5 energii. W czasie aktywnego zwiadu nie można otworzyć podglądu walki. Zamknięcie pełnoekranowego podglądu wraca do Branda, a zamknięcie rozmowy usuwa jego okno.

Mechanizm `createBattle(hero, enemy, first)` i `advance(battle, resolveHit)` obsługuje naprzemienne ataki, obniżanie życia bez wartości ujemnych i zakończenie po pokonaniu jednej ze stron. Kolejność pierwszego ataku i funkcję obrażeń trzeba jawnie dostarczyć po ustaleniu reguł. `play(root, battle, resolveHit)` pokazuje automatycznie pojedynczy cios co 1,1 sekundy, uaktualnia paski życia, liczby obrażeń, turę i wynik; zwraca funkcję zatrzymania. Nie jest uruchamiany dla pustych pul przeciwników i nie zmienia zapisu postaci. Nagrody zwiadowcze nie są używane jako nagrody walki.


### Okno nagrody za misję

Po odebraniu zwiadu otwiera się ramka „Nagroda za misję” z ornamentami z ciemnej stali i starego złota. Dwa pola pokazują ikonę monet z liczbą złota oraz autorski runiczny medalion EXP (`exp-icon.webp`) z liczbą doświadczenia. Osobno pojawia się informacja o awansie, jeśli nastąpił. Okno korzysta z już zapisanej nagrody; jego zamykanie i wyświetlanie nie przyznaje jej ponownie. Po powrocie do rozmowy z NPC przywracany jest zwykły widok dialogu.


## Potwory Mrocznego Lasu

W podstawowej puli lasu dostępny jest Dzik (1), Wilk (2), Driada (3) lub Goblin (5). Portrety znajdują się w atlasie `forest-monsters.webp` (2×2: dzik, wilk / driada, goblin). Każdy teren ma obecnie własną pulę; nowe walki korzystają wyłącznie z przeciwników w zakresie ±3 poziomów postaci. Przeciwnik jest zapisywany w `combatOffer.enemyId` i nie zmienia się przy ponownym otwarciu.

Koszt rozpoczęcia to 5 energii. Walka pokazuje naprzemienne ciosy co 1,1 sekundy; każdy zapisany cios i aktualne życie znajdują się w `activeCombat`. Zamknięta walka czeka na ponowne otwarcie; odświeżenie nie zmienia przeciwnika ani nagrody. Zwiadu nie można rozpocząć przed rozliczeniem walki. Zwycięstwo daje niezależnie losowane 10–30 złota i 33–55 EXP, porażka nie daje nagród. Rozliczenie atomowo zapisuje nagrodę i usuwa walkę oraz ofertę pod blokadą Web Locks; błąd zapisu nie przyznaje częściowej nagrody.

Początkowy balans do dalszego dostrojenia: życie potworów 70/90/110/135; obrażenia odpowiednio 7–10/9–13/11–16/13–19. Bohater zaczyna, a jego bazowe obrażenia to najwyższa statystyka + 2×poziom, z losowym odchyleniem ±3. Życie i statystyki bohatera są zgodne z kartą postaci. Nagroda jest losowana przy rozpoczęciu i wypłacana tylko raz po zgłoszeniu wyniku.


## Potwory Starej Kopalni

Do podstawowej puli Kopalni dodano Ducha (1), Rozbójnika (2), Ogromnego szczura (3) i Kryształowego ogra (5). Atlas `mine-monsters.webp` ma układ 2×2: duch, rozbójnik / ogromny szczur, kryształowy ogr. Każdy przeciwnik używa własnego awatara również po odświeżeniu walki. Początkowy balans życia i obrażeń według poziomu jest taki sam jak dla potworów lasu.

Nowa oferta losuje jeden z dwóch dostępnych terenów (Mroczny Las albo Stara Kopalnia), a potem jednego z czterech przeciwników danego terenu. Zapisane oferty i rozpoczęte walki pozostają bez zmian. Stary przydział kopalni bez przeciwnika otrzymuje potwora z kopalni; podziemia czekają na własną pulę. Nie ma ręcznego ponawiania losowania. Koszt rozpoczęcia nadal wynosi 5 energii; nagroda za zwycięstwo to niezależnie losowane 10–30 złota i 33–55 EXP. Porażka nie daje nagrody. Odbiór pozostaje jednorazowy i atomowy, pod wspólną blokadą zapisu.


## Potwory Podziemi Miasta

Do podstawowej puli Podziemi dodano Węża błotnego (1), Dzikiego Psa (2), Zbłąkanego człowieka (3) i Trolgotytę (5), zachowując podaną nazwę. Atlas `undercity-monsters.webp` ma układ 2×2: wąż, pies / człowiek, Trolgotyta. Portrety pokazują przeciwników na tle wilgotnych kanałów i podziemnych kamiennych korytarzy. Życie i zakresy obrażeń według poziomu odpowiadają początkowemu balansowi pozostałych terenów.

Nowe oferty losują teraz jeden z trzech terenów, a następnie potwora z jego własnej puli. Istniejące oferty i aktywne walki nie są ponownie losowane. Dawny pusty przydział Podziemi otrzymuje potwora z tej lokacji. Nadal obowiązują koszt 5 energii, automatyczne tury, zapis postępu i jednorazowa nagroda za zwycięstwo: niezależnie losowane 10–30 złota i 33–55 EXP.


### Proporcje awatarów potworów

Każdy kwadratowy kadr atlasu jest wyświetlany w oryginalnych proporcjach i w całości, z dopasowaniem do miejsca nad podpisem. Nazwa i poziom mają osobny obszar poniżej grafiki. W prostokątnej ramce pozostaje neutralne tło po bokach albo nad i pod portretem, zamiast rozciągania ilustracji. Dotyczy wszystkich trzech atlasów, również podczas aktywnej walki.


## Dwie oferty Branda

Rozmowa z Brandem pokazuje dwie pionowe karty misji: Szlak wędrowca (łatwiejsza, 3 energii) i Próba śmiałka (trudniejsza, 5 energii). Każda losuje walkę z prawdopodobieństwem 80%. Jeśli oba losowania wskażą zwiad, trudniejsza oferta zostaje zamieniona na walkę, o ile istnieje pasujący przeciwnik. W rezultacie zawsze jest co najmniej jedna oferta walki, gdy aktualny zestaw potworów na to pozwala. Teren walki jest losowany wyłącznie spośród miejsc z pasującymi przeciwnikami; zwiady nadal mogą prowadzić do wszystkich trzech lokacji.

Na każdym poziomie postaci przeciwnik musi mieścić się w zakresie ±3 poziomów, z dolną granicą 1. Przykłady: gracz 5 → potwory 2–8, gracz 10 → 7–13, gracz 15 → 12–18. Łatwiejsza oferta wybiera potwory nie silniejsze poziomem od gracza; trudniejsza preferuje silniejsze. Jeśli dany teren nie ma potworów w preferowanej części zakresu, łatwiejsza oferta korzysta z najniższego, a trudniejsza z najwyższego dostępnego poziomu w zakresie ±3. Reguły zastępują dawne stałe przedziały 1–5 i 5–15 oraz podział potworów 1–2 / 3+. Poziomy, statystyki i nagrody samych potworów nie są skalowane ani zmieniane. Obecne potwory mają najwyżej poziom 15, więc od poziomu gracza 19 nie ma pasujących przeciwników; oferowane są wtedy wyłącznie dostępne zwiady (czas zwiadów powyżej poziomu 25 nadal jest do ustalenia).

Oferty zapisują się w `brandOffers`, z `brandOffersVersion` i `brandOffersLevel`. Stare, jeszcze nieprzyjęte oferty są jednorazowo zastępowane nowymi po aktualizacji zasad, a zmiana poziomu postaci odświeża zestaw. Ponowne otwarcie, odświeżenie lub druga karta nie zmieniają aktualnych ofert na tym samym poziomie. Przyjęcie jednej zużywa cały zestaw i atomowo pobiera jej koszt. Aktywne walki i zwiady zachowują zapisany przebieg, termin, koszt oraz nagrodę. Przyjęcie walki ponownie sprawdza aktualny poziom i odrzuca niepasującego przeciwnika bez pobrania energii. Łatwe i trudne zwiady na tym samym poziomie mają taki sam czas; różni je koszt energii.

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

Tauriel oferuje od poziomu 5 jednorazową misję „Przepędź nieproszonych gości”. Trzej odrębni rozbójnicy mają własne awatary w atlasie `tauriel-bandits.webp` (3×1): Rozbójnik spod barykady, Rozbójnik Żelazna Pięść i Przywódca rozbójników. Każdy ma poziom 5; początkowo życie 125/140/160 i obrażenia 11–15/12–17/14–19. Walki korzystają z automatycznych tur i zapisu `activeCombat`, oznaczonego `source: 'tauriel'`. Nie pobierają energii i nie przyznają nagród Branda ani losowych przedmiotów. Nie można prowadzić równolegle drugiej aktywnej walki lub zwiadu.

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

Jedyną interaktywną postacią i znacznikiem w pracowni jest Gorim Sadza. Kliknięcie otwiera rozmowę i informację o przyszłym wytwarzaniu rzadkiego ekwipunku. Kowadło, piec i pozostałe wyposażenie są częścią ilustracji. Nie dodano receptur, cen, kosztów ani możliwości wytwarzania przedmiotów. Oglądanie kuźni i rozmowa nie zmieniają zapisu postaci.


## Przybliżanie lokacji

Wspólne przybliżanie (100–300%) obejmuje mapę zamku, karczmę, pracownię alchemiczki, kuźnię, korytarz piętra i oba pokoje. Ekranowe przyciski +/− i procentowy reset skali zostały usunięte. Działa również kółko myszy, gest dwóch palców oraz klawisze +/−/0 przy skupieniu na widoku. Po powiększeniu można przesuwać widok palcem i myszą; znaczniki postaci i drzwi pozostają przy ilustracji.

Podczas zwiadu i walki przycisk lupy otwiera osobny pełnoekranowy podgląd lokacji z tą samą obsługą przybliżania. Mechanika i czas misji działają dalej; nie powiększa się odliczanie, statystyki ani przyciski odbioru nagrody. Zmiany skali nie zapisują danych postaci. Obsługa jest usuwana po opuszczeniu lokacji.


## Gabriel i plac treningowy koszar

Koszary Żelaznej Przysięgi otwierają panoramiczny plac treningowy (`barracks-training.webp`). Paladyn Gabriel jest człowiekiem w lśniącej srebrnej zbroi ze złotymi detalami, bez hełmu. Otaczają go manekiny, stojaki z bronią, tarcze i sztandary. Plac obsługuje przesuwanie i wspólne przybliżanie 100–300%.

Kliknięcie Gabriela otwiera powitanie i dostęp do wcześniejszego panelu profesji; zachowane są jego wymagania poziomu 10 i blokada profesji czekających na ustalenie. Drzwi do zbrojowni oraz gabinetu dowódcy paladynów mają osobne znaczniki i informują o zamkniętym wejściu. Nie dodano jeszcze postaci dowódcy, wnętrz ani mechaniki treningu. Oglądanie placu i rozmowy nie pobierają zasobów i nie zmieniają zapisu postaci.


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

Nowy przeciwnik poziomu 8 pojawia się w zleceniach walki Branda przy różnicy do 3 poziomów między nim a postacią, wyłącznie w Mrocznym Lesie. Ma 210 HP, cechy 18/8/16/14 oraz obrażenia 18–25. Zwycięstwo daje dokładnie 25 złota i 150 EXP, bez przedmiotów; porażka nie daje nagrody. Awatar `tree-whisperer.webp` przedstawia spróchniałe drzewo z twarzami w korze i pnączami przypominającymi ramiona. Wszystkie potwory są teraz dobierane w zakresie ±3 poziomów postaci. Rozpoczęte walki zachowują zapis przeciwnika i nagrody.


## Demonica Puszczy — Mroczny Las

Przeciwniczka poziomu 9 występuje w misjach Branda przy różnicy do 3 poziomów między przeciwnikiem a postacią, wyłącznie w Mrocznym Lesie. Ma 235 HP, cechy 15/22/20/16 oraz obrażenia 20–27. Zwycięstwo daje dokładnie 35 złota i 190 EXP, bez przedmiotów; porażka nie daje nagrody. Awatar `forest-demoness.webp` przedstawia dorosłą błękitnoskórą demonicę o czarnych chitynowych rogach, w czarnej łuskowej zbroi i ze złożonymi skórzastymi skrzydłami.


## Widmowy Rycerz — Mroczny Las

Przeciwnik poziomu 10 występuje w misjach Branda przy różnicy do 3 poziomów między przeciwnikiem a postacią, wyłącznie w Mrocznym Lesie. Ma 260 HP, cechy 24/20/12/18 oraz obrażenia 23–30. Zwycięstwo daje dokładnie 55 złota i 230 EXP, bez przedmiotów; porażka nie daje nagrody. Awatar `spectral-knight.webp` przedstawia pustą, zniszczoną zbroję pełną czerwonego dymu i iskier oraz wyszczerbiony miecz dwuręczny.


## Leśny Pożeracz — Mroczny Las

Przeciwnik poziomu 15 występuje w misjach Branda przy różnicy do 3 poziomów między przeciwnikiem a postacią, wyłącznie w Mrocznym Lesie. Ma 400 HP, cechy 32/12/25/30 oraz obrażenia 30–40. Zwycięstwo daje dokładnie 99 złota i 500 EXP, bez przedmiotów; porażka nie daje nagrody. Awatar `forest-devourer.webp` przedstawia bezkształtną masę czarnego szlamu i gnijących liści, z czaszkami i kośćmi zawieszonymi wewnątrz półprzezroczystego ciała.


## Aelira — Mroczny Las

Czarodziejka poziomu 14 występuje w misjach Branda przy różnicy do 3 poziomów między przeciwnikiem a postacią, wyłącznie w Mrocznym Lesie. Ma 360 HP, cechy 16/26/34/24 oraz obrażenia 28–38. Zwycięstwo daje dokładnie 75 złota i 450 EXP, bez przedmiotów; porażka nie daje nagrody. Awatar `aelira.webp` przedstawia dorosłą czarodziejkę o oliwkowozielonej skórze, bursztynowych oczach, ciemnych włosach z mchem i kwiatami, organicznych szatach, paprociowej pelerynie oraz sękatym kosturze z leśnym ognikiem.


## Odłamki ze zwiadów od poziomu 8

Nowy zwiad czasowy przyjęty na poziomie 8–11 ma 3% szansy na dodatkowy 1 odłamek, a od poziomu 12 — 6%, niezależnie od miejsca i wariantu kosztu energii. Poziom, szansa oraz wynik losowania są zapisywane przy przyjęciu zlecenia; odświeżenie, ponowna próba zapisu i późniejszy awans nie losują nagrody ponownie. Odłamek trafia do salda razem ze złotem i EXP po zgłoszeniu powrotu i pojawia się w oknie nagród. Starsze trwające zwiady bez zapisanego losowania zachowują dotychczasowe nagrody. Walki z potworami nie przyznają odłamków ani przedmiotów.


## Kryształowy Skorpion — Stara Kopalnia

Przeciwnik poziomu 7 występuje w misjach Branda przy różnicy do 3 poziomów między przeciwnikiem a postacią, wyłącznie w Starej Kopalni. Ma 195 HP, cechy 16/12/4/22 i żądło zadające 25–30 obrażeń od trucizny. Kryształowy pancerz pochłania 2 punkty obrażeń przy każdym trafieniu; trafienie zawsze zadaje co najmniej 1 obrażenie. Zwycięstwo daje dokładnie 15 złota i 100 EXP, bez przedmiotów i odłamków; porażka nie daje nagrody. Awatar `crystal-scorpion.webp` przedstawia skorpiona o kryształowym pancerzu i jadowitym żądle. Pancerz, rodzaj ataku, obrażenia i wynik są zapisywane w migawce walki; przewijanie korzysta z tych samych zasad.


## Nieumarły Górnik — Stara Kopalnia

Przeciwnik poziomu 9 występuje w misjach Branda przy różnicy do 3 poziomów między przeciwnikiem a postacią, wyłącznie w Starej Kopalni. Ma 230 HP, cechy 24/10/5/20 i kilof zadający 26–35 obrażeń. Cios ignoruje 50% redukcji obrażeń z pancerza celu (pomijana wartość jest zaokrąglana w dół); pozostały pancerz nadal działa, a trafienie zadaje co najmniej 1 obrażenie. Zwycięstwo daje dokładnie 25 złota i 150 EXP, bez przedmiotów i odłamków; porażka nie daje nagrody. Awatar `undead-miner.webp` przedstawia szkielet dawnego górnika z kilofem. Przebicie pancerza, obrażenia i nagroda są zapisywane w migawce walki i stosowane również przy przewijaniu. Ekwipunek bohatera obecnie zwiększa cechy i HP, a nie pole redukcji `armor`; przebicie działa na redukcję pancerza, gdy cel ją posiada.


## Golem Magmowy — Stara Kopalnia

Przeciwnik poziomu 15 występuje w misjach Branda przy różnicy do 3 poziomów między przeciwnikiem a postacią, wyłącznie w Starej Kopalni. Ma 480 HP, cechy 38/8/20/36 oraz obrażenia 39–55. Pochłania 8 obrażeń fizycznych z trafienia (minimum 1 obrażenie); ten pancerz nie redukuje magii. Otrzymuje +50% bazowych obrażeń od wody, z premią zaokrągloną w dół. Zwycięstwo daje dokładnie 100 złota i 300 EXP, bez przedmiotów i odłamków; porażka nie daje nagrody. Awatar `magma-golem.webp` przedstawia olbrzyma z rozgrzanej skały i lawy. Typ ataku (`attackElement`), pancerz i podatność są obsługiwane w migawce walki oraz przy przewijaniu. Kula ognia z maną ma typ ognia; atak różdżką bez many jest fizyczny. Mag obecnie nie ma dostępnego w interfejsie zaklęcia wodnego — podatność jest przygotowana pod przyszłe dodanie takiego ataku.


## Specjalne ataki nowych potworów Kopalni

W misjach Starej Kopalni, z doborem przeciwników w zakresie ±3 poziomów postaci, pojawiają się trzy nowe potwory z osobnymi awatarami:

| Przeciwnik | Poziom | HP | Obrażenia | EXP | Złoto | Zdolność |
| --- | ---: | ---: | --- | ---: | ---: | --- |
| Jadowity Stonóg | 8 | 210 | 18–25 | 90 | 65 | Co 3. własny atak: trucizna 8 × 3 tury; pancerz pochłania 2 obrażenia z trafienia, min. 1 obrażenie. |
| Łańcuchowy Troll | 13 | 420 | 30–42 | 190 | 155 | Co 5. własny atak: 150% bazowych obrażeń, zaokrąglone w dół przed redukcją pancerza. |
| Zarodnikowy Pełzacz | 14 | 320 | 28–36 | 205 | 165 | Co 4. własny atak: zarodniki 12 × 2 tury. |

Zatrucie działa na początku kolejnych tur celu i omija pancerz. Sam atak nakładający efekt nadal zadaje zwykłe obrażenia. Ponowne nałożenie odświeża czas, bez kumulowania. Śmierć od zatrucia kończy walkę przed atakiem i zużyciem many zatrutej postaci. Licznik liczy rzeczywiste ataki danego wojownika, nie łączną liczbę tur. Liczniki i efekty pozostają w migawce walki przy zamknięciu i odświeżeniu; przewijanie stosuje te same zasady. Zakończenie walki usuwa efekty razem z jej stanem. Nagrody pozostają w złocie i EXP, bez przedmiotów i odłamków.

Testy mechaniki walki można uruchomić poleceniem `node --test tests/*.test.cjs` z katalogu repozytorium; nie wymagają instalowania pakietów.


## Kolejni przeciwnicy Mrocznego Lasu

Pięć nowych potworów z osobnymi awatarami występuje w zleceniach Branda z doborem ±3 poziomy postaci:

| Potwór | Poziom | HP | Atak | Złoto | EXP | Zdolność |
| --- | ---: | ---: | --- | ---: | ---: | --- |
| Krwiożerczy Kwiat | 6 | 165 | 15–22 | 20 | 90 | Ciernisty Chwyt: +10 bazowych obrażeń co 4. własny atak. |
| Przeklęty Jeleń | 7 | 190 | 17–24 | 25 | 110 | Szarża co 4. własny atak: 150% bazowych obrażeń. |
| Duch Starego Boru | 14 | 355 | 29–38 | 85 | 420 | −15% obrażeń fizycznych, +20% obrażeń magicznych (ogień/woda). |
| Wilkołak Brzeziny | 6 | 175 | 20–22 | 15 | 90 | +20% obrażeń wyłącznie poniżej 30% HP. |
| Upiorny Łucznik | 13 | 330 | 30–41 | 75 | 370 | Przeszywająca Strzała co 3. własny atak: pomija 30% pancerza i odporności fizycznej celu. |

Premie do ataku są naliczane przed obroną; procentowe zwiększenia i końcowe obrażenia po odporności są zaokrąglane w dół, z minimum 1 obrażeniem. Odporność procentowa działa po redukcji pancerza. Furia jest obliczana z aktualnego HP na początku ataku, także po obrażeniach od zatrucia; dokładnie 30% HP nie uruchamia furii. Przebicie pomija zaokrągloną w dół część pancerza i odporności. Obecne wyposażenie bohatera zwiększa cechy i HP, a nie redukcję pancerza — dodatkowy efekt Przeszywającej Strzały ma znaczenie, gdy cel taką redukcję posiada. Liczniki i cechy pozostają w migawce walki przy odświeżeniu oraz przewijaniu. Nagrody obejmują wyłącznie podane złoto i EXP.


## Dzwonnik Otchłani — Stara Kopalnia

Przeciwnik poziomu 14 występuje w misjach Branda przy różnicy do 3 poziomów między przeciwnikiem a postacią, wyłącznie w Starej Kopalni. Ma 390 HP, cechy 34/10/24/30 i atak fizyczny 32–43. Nagroda za zwycięstwo: dokładnie 90 złota i 280 EXP, bez przedmiotów i odłamków; porażka nie daje nagrody. Awatar `abyss-bellringer.webp` przedstawia przygarbionego olbrzyma z czarną szczeliną zamiast twarzy i pękniętym dzwonem przykutym do pleców.

Echo Zagłady co czwarty własny atak dodaje osobną falę 12 bazowych obrażeń magicznych (bez kosztu many). Bez obrony czwarty cios zadaje łącznie 44–55 obrażeń. Podstawowy cios jest fizyczny; fala omija `physicalArmor` i procentową `physicalResistance`, lecz nadal podlega ogólnej redukcji `armor` oraz podatności `magicVulnerability`. Ogólny pancerz działa osobno na oba składniki, z minimum 1 obrażeniem na składnik. Fala nie zadaje obrażeń celowi już zabitemu przez podstawowy cios; komunikat i liczba nad portretem pokazują faktyczną utratę HP. Licznik ataków i zasady fali zapisują się z walką, a przewijanie korzysta z tego samego silnika. HP i podstawowy atak są niższe niż u Golema Magmowego; premia do czwartego ciosu wyróżnia Dzwonnika na tle Trolla i Pełzacza.


## Lochy od poziomu 10

Wejście do Lochów z mapy oraz menu wymaga co najmniej 10. poziomu postaci. Poniżej tego progu wyświetla się informacja o wymaganym i obecnym poziomie. Etykiety przycisków w menu i na mapie wskazują wymaganie. Poziom jest odczytywany z aktualnego zapisu przy każdej próbie wejścia; brak lub nieprawidłowy poziom jest traktowany jako poziom 1, a błąd odczytu zapisu blokuje wejście. Po osiągnięciu poziomu 10 otwiera się okno wyboru trzech Lochów.


## Wybór Lochów

Kliknięcie Lochów na mapie lub w menu otwiera wybór trzech lokacji:

| Loch | Wymagany poziom postaci |
| --- | ---: |
| Cmentarzysko | 10 |
| Wzgórza Gryfów | 20 |
| Katakumby | 30 |

Każda pozycja ma osobny emblemat, wymagany poziom oraz informację o dostępności. Przyciski lokacji powyżej poziomu bohatera są zablokowane. Wybór dostępnej lokacji otwiera jej nazwany widok z przyciskiem powrotu; wnętrza i walki w tych Lochach pozostają w przygotowaniu. Przy każdej próbie wyboru poziom jest odczytywany z aktualnego zapisu. Zmiany zapisu w innej karcie oraz powrót do okna odświeżają dostępność, a błąd odczytu blokuje wybór. Oglądanie i wybór Lochów nie zmieniają postaci, energii ani nagród.


## Ikony trzech Lochów

Okno wyboru i widoki lokacji korzystają z osobnych malowanych ikon w stylistyce medalionów Pustkowia: czarna stal, stare złoto i ciemna zieleń. Cmentarzysko przedstawia omszały nagrobek we mgle (`dungeon-graveyard-icon.webp`), Wzgórza Gryfów — gryfa na skalistym szczycie (`dungeon-gryphon-hills-icon.webp`), a Katakumby — wejście do podziemnego grobowca (`dungeon-catacombs-icon.webp`). Grafiki WebP mają 384 × 384 px i przezroczyste tło poza medalionem. Zastępują robocze symbole SVG, zachowują proporcje i są dekoracyjne dla czytników ekranu. Zablokowane lokacje mają przygaszoną ikonę oraz tekst o wymaganym poziomie; wymagania 10/20/30 i zasady wyboru pozostają bez zmian.

## Magiczny pył i wymiana u alchemiczki

Magiczny pył ma osobną ikonę `magic-dust.webp` i licznik `hero.magicDust` (starsze zapisy: 0). Jest zbieranym w stos materiałem widocznym w sekcji materiałów Ekwipunku, również w plecaku otwieranym z karty Bohatera; nie jest wyposażeniem i nie zajmuje jednego z 25 miejsc na uzbrojenie. `MagicDust.award(hero, amount)` przygotowuje dopisanie nagrody do zapisu; nie dodaje niczego automatycznie. Lochy nie mają jeszcze walk ani tabel nagród, dlatego zdobywanie pyłu w Lochach wymaga późniejszego podłączenia ich nagród — nie dodano nieustalonych szans ani darmowego odbierania pyłu.

Stół alchemiczki wymienia dokładnie 25 pyłu na 1 odłamek, jedną wymianę na kliknięcie. Reszta materiału pozostaje w ekwipunku. Przycisk jest blokowany poniżej 25 sztuk i podczas operacji. Odczyt aktualnego zapisu, odjęcie pyłu i dodanie odłamka odbywają się pod wspólną blokadą Web Locks z innymi operacjami postaci. Nieudany zapis nie zużywa materiałów; błędne i przepełnione liczniki są odrzucane. Zmiana zapisu w innej karcie aktualizuje stół, a saldo odłamków w menu odświeża się od razu po wymianie.
