# Pustkowie

Nowy ekran tworzenia postaci w mrocznym klimacie fantasy.

1. Wybór jednej z czterech klas: wojownik, mag, elf, krasnolud.
2. Wybór płci: męska lub żeńska. Każda z ośmiu kombinacji ma własną ilustrację.
3. Przejście przyciskiem „Dalej” do osobnego ekranu nazwy.
4. Utworzenie postaci i zapis w localStorage.

Strzałki pozwalają również przełączać klasy. Powrót z ekranu nazwy zachowuje wybór. Usunięcie zapisanej postaci wymaga potwierdzenia. Nowy zapis v2 jest niezależny od starego prototypu v1.

## Uruchomienie

Otwórz `dist/index.html` lub uruchom `python3 -m http.server 8000 --directory dist` i przejdź do `http://localhost:8000`.

Brak zależności i etapu budowania. Fonty Google są opcjonalne. Ilustracje postaci są oryginalną grafiką wygenerowaną dla Pustkowia; tło i ikony są lokalnymi SVG. Atlas ma 4 kolumny i 2 wiersze: wojownik, mag, elf, krasnolud; najpierw mężczyźni, potem kobiety. Obraz wyświetlany przez CSS bez zewnętrznego serwera.

Zapis jest lokalny dla przeglądarki i adresu strony. Nie ma jeszcze kont, rozgrywki ani synchronizacji między urządzeniami.


## Interfejs zamku

Utworzona lub zapisana postać otwiera bezpośrednio Zamek Czarnej Stali. Autorska mapa ma siedem interaktywnych miejsc, panel zasobów i boczne menu. Na telefonie menu otwiera przycisk w lewym górnym rogu; mapę można przesuwać palcem. Działają karta bohatera, podgląd wyposażenia i dziennik przybycia. Statystyki i zasoby są startowe; walka, handel, gildie i wyprawy mają oznaczenie „W przygotowaniu”.

Żeńskie postacie używają szerszego kadru drugiego rzędu atlasu, aby zachować pełną sylwetkę i głowę. Zapis v2 pozostaje zgodny z poprzednią wersją.

## Koszary i profesje

Koszary Żelaznej Przysięgi znajdują się przy placu treningowym (znacznik na mapie i menu ŚWIAT). Profesję można wybrać od poziomu 10; niższe poziomy widzą zablokowane ścieżki. Blokada obowiązuje także w obsłudze formularza. Każda klasa ma dwie profesje:

- Wojownik: Rycerz Popiołu / Berserker.
- Mag: Piromanta / Czarnoksiężnik.
- Elf: Łowca Cieni / Strażnik Lasu.
- Krasnolud: Runiczny Strażnik / Mistrz Żelaza.

Profesja zapisuje się w istniejącym zapisie v2, pojawia się w panelu i karcie bohatera. Można ją zmienić w koszarach. Stare zapisy bez pola level mają poziom 1. Nowe postacie zaczynają z level: 1 i profession: null. System zdobywania poziomów oraz umiejętności profesji nie jest jeszcze zaimplementowany; odblokowanie poziomu 10 jest fundamentem przyszłej progresji. Nie ma serwera i poziomy nie są autoryzowane po stronie serwera.
