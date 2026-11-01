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

Karczma ma szeroki widok sali i schodów po prawej, przewijany swobodnie w obu osiach jak mapa zamku. Można przesuwać go palcem, gładzikiem, paskiem przewijania lub przeciągnięciem myszy; nie ma stron ani przyciągania do kadrów. Kliknięcie schodów otwiera osobne okno z informacją o wymaganej misji Tauriel. Przeciąganie przez schody nie otwiera komunikatu. Wejście na piętro pozostaje zablokowane, bez dodanej misji i bez zmiany zapisu postaci.

Karczma wypełnia panel aż do dolnej krawędzi: paski przewijania oraz stałe pole instrukcji i rozmów są ukryte. Rozmowa z NPC otwiera osobne okno tylko po kliknięciu postaci. Rozmiar panoramy dopasowuje się do wysokości okna.

Sala i schody korzystają teraz z jednej spójnej ilustracji `tavern-panorama.webp`. Panorama jest skalowana z zachowaniem proporcji pliku; w przesuwanym widoku nie są łączone dwa oddzielne obrazy.

## Piwo u Tobiasza

Kliknięcie Tobiasza otwiera zakup piwa: koszt 25 złota, regeneracja do 20 energii (maksymalnie 100 energii). Przy pełnej energii, braku złota lub wykorzystanym limicie zakup jest zablokowany. Panel pokazuje faktyczną regenerację, środki, pozostałe piwa i licznik czasu.

Limit to 3 zakupy w ruchomym oknie ostatnich 8 godzin. Każdy wpis w `hero.beerDrinks` zwalnia miejsce dokładnie po 8 godzinach. Limitu nie resetuje zamknięcie karczmy ani odświeżenie strony. Nowe postacie mają `gold: 25`, `energy: 100`, `beerDrinks: []`; starsze zapisy przyjmują te wartości domyślne bez automatycznego nadpisywania.

Zakup sprawdza najnowszy zapis i zapisuje złoto, energię i czas piwa w jednej operacji localStorage. Przy nieudanym zapisie nie następuje pobranie waluty. Web Locks zabezpiecza zakupy równoległe w kartach wspierających tę funkcję. Panel główny i ekwipunek odczytują aktualne zasoby. Reguły znajdują się w `beer.js`. Gra nadal zapisuje dane wyłącznie lokalnie, a czas odnowienia opiera się na zegarze urządzenia.

## Misje Dowódcy Branda

Brand ma dwie zakładki: Zwiad czasowy i Walka z potworami. Zwiad można rozpocząć, a po upływie czasu zgłosić powrót. Jedna postać ma jeden aktywny zwiad; zapis obejmuje czas rozpoczęcia, zakończenia i poziom przy przyjęciu. Zamknięcie panelu, opuszczenie gry i odświeżenie nie resetują czasu. Ostatni ukończony zwiad jest zapisywany jako `lastScout`.

Przedziały z nakładającymi się granicami zostały zinterpretowane jako zmiana czasu od poziomu 3, 8 i 15: poziomy 1–2 → 1 minuta, 3–7 → 5 minut, 8–14 → 10 minut, 15–25 → 15 minut. Czas powyżej poziomu 25 pozostaje do ustalenia. Zmiana poziomu podczas aktywnej misji nie zmienia jej czasu.

Potwory, walka, nagrody i szczegóły misji nie są jeszcze dodane. Rozpoczęcie zwiadu kosztuje 5 energii, a zgłoszenie powrotu nie kosztuje dodatkowej energii. Zwiad nie zmienia złota ani doświadczenia. Reguły i panel znajdują się w `missions.js` oraz `missions.css`; zapis korzysta z tej samej transakcji localStorage i blokady Web Locks co zakupy piwa. Ukończenie zwiadu Branda nie odblokowuje schodów związanych z przyszłą misją Tauriel.


## Dzienne odnowienie energii

Energia odnawia się do 100 punktów w stałym cyklu co 24 godziny. Nowa postać ma termin `nextEnergyResetAt` liczony od utworzenia; stary zapis otrzymuje termin 24 godziny po pierwszym wczytaniu po aktualizacji, z zachowaniem obecnej energii. Powrót po dłuższej przerwie uzupełnia energię raz, bez sumowania ponad 100. Termin przesuwa się o pełne doby, zachowując cykl. Zakupy piwa i misje nie przesuwają odnowienia. Limit piwa pozostaje niezależny.

Panel energii pokazuje czas do odnowienia. Gra sprawdza termin podczas działania, po powrocie do karty i przy operacjach na postaci. Aktualizacja energii korzysta z tej samej blokady zapisu co piwo i misje; przy błędzie zapisu surowe dane pozostają bez zmian. Czas pochodzi z zegara urządzenia. Reguły są w `energy.js`.


## Poziomy i EXP

Limit postaci wynosi 250 poziomów. W `progression.js` skonfigurowano podane wymagania na kolejny awans: poziom 1 — 100 EXP, 2 — 250 EXP, 3 — 500 EXP. Wzór i dalsze progi do poziomu 100 wymagają ustalenia. Powyżej nich wymagania pozostają nieokreślone; EXP jest zachowywane bez automatycznych awansów. Nagrody misji nadal nie przyznają EXP. Moduł obsługuje dodawanie EXP i nadwyżki przy awansie, z ograniczeniem do poziomu 250.

### Trzy losowe miejsca zwiadu

Nowy zwiad Branda losuje jedno z trzech miejsc: Mroczny Las (`forest`), Stara Kopalnia (`mine`) lub Podziemia Miasta (`undercity`). Każde ma własny tytuł, opis i oryginalną ilustrację `scout-*.webp`. Wybór jest losowany raz przy rozpoczęciu, zapisany jako `activeMission.sceneId` i kopiowany do `lastScout` po powrocie. Odświeżenie lub ponowne otwarcie panelu nie losuje miejsca ponownie. Przed przyjęciem panel pokazuje podgląd trzech kierunków. Starsza aktywna misja bez `sceneId` zachowuje dotychczasowy czas i neutralny widok.

Koszt nadal wynosi 5 energii, czasy zależą od poziomu według poprzedniej tabeli. Nagrody nie są ustalone: zakończenie nie dodaje złota, EXP, przedmiotów ani innych zasobów.


### Pełnoekranowy aktywny zwiad

Po przyjęciu misji oraz po kliknięciu Karczmy w czasie aktywnego zwiadu otwiera się sama lokacja na całe okno przeglądarki. Widoczne są mały tytuł, przycisk zamknięcia i zegar na środku u dołu. Brak opisów, kosztów, zakładek i przycisku powrotu do sali w trakcie misji. Zwiad można zamknąć do mapy i otworzyć ponownie bez zmiany czasu lub miejsca. Po upływie czasu pojawia się przycisk Zgłoś powrót; zapis zakończenia otwiera zwykłą karczmę, bez nagród i dodatkowego kosztu.

Pełnoekranowy zwiad pokazuje u dołu szeroki pasek postępu w metalowo-złotej ramie z odliczaniem pośrodku. Wypełnienie rośnie zgodnie z faktycznie upływającym czasem zapisanej misji, także po odświeżeniu; kończy na 100% po upływie zwiadu.
