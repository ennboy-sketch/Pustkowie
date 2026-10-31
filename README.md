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

### Schody na piętro

Karczma ma dwa widoki w poziomo przewijanym panelu: sala główna i schody po prawej. Nawigacja działa gestem na ekranie dotykowym oraz przyciskami lewo/prawo. Wejście na piętro jest obecnie zablokowane; komunikat wskazuje wymóg przyszłej misji Tauriel. Misja, stan jej ukończenia i zawartość piętra nie są jeszcze dodane. Przeglądanie schodów nie zmienia zapisu. Ponowne otwarcie karczmy rozpoczyna się od sali głównej.
