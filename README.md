# Pustkowie

Nowy ekran tworzenia postaci w mrocznym klimacie fantasy.

1. Wybór jednej z czterech klas: wojownik, mag, elf, krasnolud.
2. Wybór płci: męska lub żeńska. Każda z ośmiu kombinacji ma własną ilustrację.
3. Przejście przyciskiem „Dalej” do osobnego ekranu nazwy.
4. Utworzenie postaci i zapis w localStorage.

Strzałki pozwalają również przełączać klasy. Powrót z ekranu nazwy zachowuje wybór. Usunięcie zapisanej postaci wymaga potwierdzenia. Nowy zapis v2 jest niezależny od starego prototypu v1.

## Uruchomienie

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

Centralna fontanna ma znacznik Koło Losu. Panel zawiera 12 nieodkrytych pól, animowany obrót podglądowy i roboczy koszt 10 odłamków. Nagrody nie są jeszcze zdefiniowane, dlatego płatny obrót pozostaje zablokowany. Darmowy podgląd nie pobiera waluty, nie przyznaje nagród i nie zmienia zapisu postaci. Zamknięcie panelu przerywa animację. Koszt w `wheel.js` można zmienić po ustaleniu zasad; pole `hero.shards` (nieujemna liczba całkowita) określa saldo wyświetlane w kole, starsze zapisy domyślnie mają 0.

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

Limit postaci wynosi 250 poziomów. W `progression.js` skonfigurowano podane wymagania na kolejny awans: poziom 1 — 100 EXP, 2 — 250 EXP, 3 — 500 EXP. Wzór i dalsze progi do poziomu 100 wymagają ustalenia. Powyżej nich wymagania pozostają nieokreślone; EXP jest zachowywane bez automatycznych awansów. Nagrody zwiadu przyznają EXP zgodnie z ustalonymi progami; ponad nie punkty są przechowywane do ustalenia dalszych wymagań. Moduł obsługuje dodawanie EXP i nadwyżki przy awansie, z ograniczeniem do poziomu 250.

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

Dla postaci poziomu 1–5 losowany jest Dzik (1), Wilk (2), Driada (3) lub Goblin (5). Portrety znajdują się w atlasie `forest-monsters.webp` (2×2: dzik, wilk / driada, goblin). Pozostałe tereny nie mają jeszcze potworów; dawne puste przydziały dla poziomów 1–5 są jednorazowo zastępowane dostępną walką w lesie. Przeciwnik jest zapisywany w `combatOffer.enemyId` i nie zmienia się przy ponownym otwarciu.

Koszt rozpoczęcia to 5 energii. Walka pokazuje naprzemienne ciosy co 1,1 sekundy; każdy zapisany cios i aktualne życie znajdują się w `activeCombat`. Zamknięta walka czeka na ponowne otwarcie; odświeżenie nie zmienia przeciwnika ani nagrody. Zwiadu nie można rozpocząć przed rozliczeniem walki. Zwycięstwo daje niezależnie losowane 10–30 złota i 33–55 EXP, porażka nie daje nagród. Rozliczenie atomowo zapisuje nagrodę i usuwa walkę oraz ofertę pod blokadą Web Locks; błąd zapisu nie przyznaje częściowej nagrody.

Początkowy balans do dalszego dostrojenia: życie potworów 70/90/110/135; obrażenia odpowiednio 7–10/9–13/11–16/13–19. Bohater zaczyna, a jego bazowe obrażenia to najwyższa statystyka + 2×poziom, z losowym odchyleniem ±3. Życie i statystyki bohatera są zgodne z kartą postaci. Nagroda jest losowana przy rozpoczęciu i wypłacana tylko raz po zgłoszeniu wyniku.


## Potwory Starej Kopalni

Dla postaci poziomu 1–5 dodano Ducha (1), Rozbójnika (2), Ogromnego szczura (3) i Kryształowego ogra (5). Atlas `mine-monsters.webp` ma układ 2×2: duch, rozbójnik / ogromny szczur, kryształowy ogr. Każdy przeciwnik używa własnego awatara również po odświeżeniu walki. Początkowy balans życia i obrażeń według poziomu jest taki sam jak dla potworów lasu.

Nowa oferta losuje jeden z dwóch dostępnych terenów (Mroczny Las albo Stara Kopalnia), a potem jednego z czterech przeciwników danego terenu. Zapisane oferty i rozpoczęte walki pozostają bez zmian. Stary przydział kopalni bez przeciwnika otrzymuje potwora z kopalni; podziemia czekają na własną pulę. Nie ma ręcznego ponawiania losowania. Koszt rozpoczęcia nadal wynosi 5 energii; nagroda za zwycięstwo to niezależnie losowane 10–30 złota i 33–55 EXP. Porażka nie daje nagrody. Odbiór pozostaje jednorazowy i atomowy, pod wspólną blokadą zapisu.


## Potwory Podziemi Miasta

Dla postaci poziomu 1–5 dodano Węża błotnego (1), Dzikiego Psa (2), Zbłąkanego człowieka (3) i Trolgotytę (5), zachowując podaną nazwę. Atlas `undercity-monsters.webp` ma układ 2×2: wąż, pies / człowiek, Trolgotyta. Portrety pokazują przeciwników na tle wilgotnych kanałów i podziemnych kamiennych korytarzy. Życie i zakresy obrażeń według poziomu odpowiadają początkowemu balansowi pozostałych terenów.

Nowe oferty losują teraz jeden z trzech terenów, a następnie potwora z jego własnej puli. Istniejące oferty i aktywne walki nie są ponownie losowane. Dawny pusty przydział Podziemi otrzymuje potwora z tej lokacji. Nadal obowiązują koszt 5 energii, automatyczne tury, zapis postępu i jednorazowa nagroda za zwycięstwo: niezależnie losowane 10–30 złota i 33–55 EXP.


### Proporcje awatarów potworów

Każdy kwadratowy kadr atlasu jest wyświetlany w oryginalnych proporcjach i w całości, z dopasowaniem do miejsca nad podpisem. Nazwa i poziom mają osobny obszar poniżej grafiki. W prostokątnej ramce pozostaje neutralne tło po bokach albo nad i pod portretem, zamiast rozciągania ilustracji. Dotyczy wszystkich trzech atlasów, również podczas aktywnej walki.


## Dwie oferty Branda

Rozmowa z Brandem pokazuje dwie pionowe karty misji: Szlak wędrowca (łatwiejsza, 3 energii) i Próba śmiałka (trudniejsza, 5 energii). Każda niezależnie losuje zwiad lub walkę, teren i odpowiedniego przeciwnika. Oferty zapisują się w `brandOffers`; ponowne otwarcie, odświeżenie lub druga karta przeglądarki ich nie zmieniają. Przyjęcie jednej zużywa cały zestaw i atomowo pobiera jej koszt. Kolejny zestaw pojawia się dopiero po zakończeniu obecnej misji.

Łatwe walki losują przeciwników poziomu 1–2, trudne poziomu 3–5. Obowiązują wcześniejsze nagrody za walkę. Łatwy zwiad korzysta z dotychczasowego czasu dla poziomu gracza; trudny z kolejnego ustalonego przedziału czasu (1→5→10→15 minut, maksymalnie 15). Nagrody zwiadu pozostają zgodne z tabelą dla jego rzeczywistego czasu. Powyżej poziomu 5, do ustalenia dalszych potworów, losowane są zwiady; powyżej 25 czasu nadal nie określono. Stare aktywne misje zachowują swój czas, przeciwnika i już opłacony koszt.

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
