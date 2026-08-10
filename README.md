# previo-purple — fialová téma pre Redmine 6.1

Alternatívna („fialová") varianta témy Previo pre Redmine 6.1. Hlavička je plochá fialová,
značka Previa je v nej prekreslená do bielej monochromatickej podoby a leží priamo na fialovej
ploche — bez bielej dlaždice.

| | |
|---|---|
| Hlavná lišta hlavičky | `#6D29A0` |
| Horný utility pruh (Home / My page / …) | `#4E1C74` |
| Hover / akcent | `#8A4FB8` |
| Stlmené položky menu | `#DCC6EF` |
| Font | Inter Variable (súčasť témy) |

Sesterská téma je červená **`previo`**, ktorá žije v repozitári lokálneho klonu
(`previo-redmine/server-files/themes/previo`). Táto téma je jej **plná samostatná kópia**, nie
nadstavba — nič z nej neimportuje, takže sa dajú v Redmine prepínať a navzájom sa neovplyvňujú.
Cena za to je duplikát: **oprava v jednej téme sa musí urobiť aj v druhej.**

## Inštalácia

Téma je bežná Redmine téma — stačí ju položiť do priečinka `themes` a reštartovať Redmine.
Od Redmine 6.0 sú témy v **koreňovom** `/themes`, nie v `public/themes`.

```bash
cd /usr/src/redmine/themes          # alebo ./data/themes, ak je to docker volume
git clone https://github.com/martinkopac19/redmine-theme-previo-purple.git previo-purple
```

Potom reštart aplikácie (`docker compose restart redmine`) a v Administration → Settings →
Display → **Theme** vybrať `previo-purple`. Propshaft si assety fingerprintuje sám pri boote,
ručný `assets:precompile` netreba.

Že je téma zaregistrovaná, sa dá overiť aj bez prepnutia:

```ruby
Redmine::Themes.themes.map(&:dir)   # => [..., "previo", "previo-purple"]
```

## Čo téma robí

- **Hlavička** má dve lišty: tmavší utility pruh (navigácia + účet) a hlavnú fialovú s logom,
  názvom z `h1`, vyhľadávacím poľom a prepínačom projektu. Diagonálna grafika („vlna") je zrušená.
- **Názov aplikácie nie je nikde natvrdo** — `h1` renderuje Redmine (v projekte názov projektu,
  mimo projektu `Setting.app_title`), takže premenovanie v Settings funguje samo.
- **Vyhľadávanie**: biele pole, fialová lupa vnútri, „Search…" ako placeholder (nie popisok vedľa).
- **„Jump to a project"**: priesvitné biele tlačidlo (18 % biela, rámik 55 % biela).
- **Fialová preberá celú brandovú rolu** — nielen hlavičku, ale aj primárne tlačidlá, focus polí
  a aktívnu záložku. Sémantické farby (flash hlášky, priority) zostávajú nedotknuté.
- **Mobil** (≤ 899 px): logo + názov + lupa + hamburger; lupa rozbalí pole cez celú šírku.
  Breakpoint je zámerne 899 px, nie 768 px — presne tam prepína `responsive.css` jadra na mobilný
  layout a pridáva hamburger.
- Mimo hlavičky sú tu ešte jednotné výšky polí a tlačidiel, naštýlované filtre (CSS subgrid),
  karty a tabuľky — všetko rovnaké ako v téme `previo`.

`javascripts/theme.js` dopĺňa dve veci, ktoré čistým CSS nejdú: placeholder vo vyhľadávacom poli
a mobilné otváranie vyhľadávania. Redmine si ho načíta sám, len tým, že súbor existuje.

## Gotchas (overené, netreba na ne prísť znova)

- **Logo je vektor, a to zámerne.** Lákavý trik „vezmi favicon a prefarbi ho na bielo cez
  `filter: brightness(0) invert(1)`" tu nefunguje: zdrojový `previo-mark.png` má nepriehľadné biele
  pozadie, takže výsledkom je plný biely štvorec, nie silueta.
- **V XML komentári v SVG nesmie byť dvojitý spojovník.** Stačí do komentára napísať názov CSS
  premennej (`--nieco`) a celý súbor je neplatný XML → prehliadač nevykreslí nič, pričom asset
  vráti 200 a v konzole nie je žiadna chyba. Ladí sa to zle, tak na to pozor.
- **Výrez v logu je vyfarbený farbou hlavičky** (`#6D29A0`), nie priehľadný. Keď sa zmení farba
  hlavičky, treba prefarbiť aj druhý `path` v `images/previo-mark-white.svg`.
- **`#main-menu` (záložky projektu) je `position: absolute; bottom: 0` vnútri `#header`** → nie je
  flex item a hlavička mu musí nechať `padding-bottom`.
- **`responsive.css` jadra sa načítava PO téme** → mobilné pravidlá treba prebíjať vyššou
  špecificitou (`html #header`) a v tej istej media query.
- **Ikony neber zo spritu jadra** (`/assets/icons-<hash>.svg`) — hash sa mení pri každom
  precompile. Téma používa inline `data:` URI.
- Padding na `#top-menu a` rozbije skrytie textu zvončeka notifikácií (`text-indent: 110 %` sa
  počíta z vnútornej šírky), preto má `.notification-filter` explicitne `padding: 0`.
