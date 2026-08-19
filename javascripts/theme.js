/* Previo Purple (fialová varianta) — malé doplnky k hlavičke, ktoré sa nedajú spraviť čistým CSS.
   Zhodné so témou `previo`; keď sa niečo opraví tam, oprav to aj tu.
   Redmine načíta tento súbor automaticky (`themes/<téma>/javascripts/theme.js`).
   Všetko je v try/catch a nič nie je povinné — keby to zlyhalo, hlavička ostane funkčná. */
(function () {
  'use strict';

  /* Login stránka: prihlásenie ide cez Google SSO, takže formulár s heslom je
     v CSS skrytý. Núdzový vstup `/login?nosso=1` ho vráti — plugin redmine_oauth
     túto adresu podporuje priamo a téma na nej obnoví pôvodný vzhľad.
     Beží HNEĎ, nie v `init()`: theme.js je v <head>, takže sa atribút nastaví
     ešte pred vykreslením formulára a nič neblikne. */
  try {
    if (/[?&]nosso(=|&|$)/.test(window.location.search)) {
      document.documentElement.setAttribute('data-previo-nosso', '1');
    }
  } catch (e) {}

  var MOBILE = 899; // rovnaký breakpoint ako responsive.css jadra

  function header() { return document.getElementById('header'); }
  function searchInput() { return document.getElementById('q'); }

  /* 1) placeholder „Search…" — v Redmine je popisok mimo poľa (`<label>Search</label>`),
        my z neho urobili lupu vnútri poľa, takže pole potrebuje placeholder. */
  function setPlaceholder() {
    var q = searchInput();
    if (!q || q.getAttribute('placeholder')) return;
    var label = document.querySelector('#quick-search form label a');
    q.setAttribute('placeholder', ((label && label.textContent.trim()) || 'Search') + '…');
  }

  /* 2) mobil: lupa v lište otvorí vyhľadávacie pole (jadro ho na mobile skrýva), krížik ho zavrie */
  function wireMobileSearch() {
    var h = header();
    if (!h || h.dataset.previoSearch) return;
    h.dataset.previoSearch = '1';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'previo-search-toggle';
    btn.setAttribute('aria-label', 'Search');
    btn.setAttribute('aria-expanded', 'false');

    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'previo-search-close';
    close.setAttribute('aria-label', 'Close search');

    var form = document.querySelector('#quick-search form');
    if (form) form.appendChild(close);

    // hamburger je v DOM prvý; lupu dáme pred neho (poradie riešime aj cez CSS `order`)
    var toggleBtn = h.querySelector('a.mobile-toggle-button');
    if (toggleBtn) h.insertBefore(btn, toggleBtn); else h.appendChild(btn);

    /* Keď je nasadený plugin redmine_command_palette, vyhľadávanie NA TEJTO Redmine = paleta
       (klik do poľa ju otvára aj na desktope). Na mobile preto lupa otvorí priamo paletu —
       inak by sa prekrývali dve vyhľadávacie plochy a krížik pod paletou by sa nedal kliknúť.
       Bez pluginu odkryjeme natívne pole s krížikom. */
    function openPalette() {
      if (!window.RCP_CONFIG) return false;
      try {
        document.dispatchEvent(new KeyboardEvent('keydown', {
          key: 'K', code: 'KeyK', ctrlKey: true, shiftKey: true, bubbles: true, cancelable: true
        }));
        return !!document.getElementById('rcp-overlay');
      } catch (e) { return false; }
    }

    function open() {
      if (openPalette()) return;
      h.classList.add('previo-search-open');
      btn.setAttribute('aria-expanded', 'true');
      var q = searchInput();
      if (q) q.focus();
    }
    function shut() {
      h.classList.remove('previo-search-open');
      btn.setAttribute('aria-expanded', 'false');
    }
    btn.addEventListener('click', open);
    close.addEventListener('click', shut);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && h.classList.contains('previo-search-open')) shut();
    });
    // pri prechode na desktop nech neostane „otvorený" stav
    window.addEventListener('resize', function () {
      if (window.innerWidth > MOBILE) shut();
    });
  }

  /* Núdzový režim si musí prežiť zlyhané prihlásenie: Redmine po nesprávnom hesle
     vráti login stránku na adrese `/login` BEZ `?nosso=1`, takže by sa formulár
     znova skryl a zostala by len chybová hláška bez toho, kam ju napraviť.
     Preto sa `nosso=1` doplní do cieľa formulára. Poradie je v poriadku aj s jadrovým
     `keepAnchorOnSignIn`, ktoré na konec action prilepí `#hash` — query ide pred fragment. */
  function keepNossoOnSubmit() {
    if (!document.documentElement.hasAttribute('data-previo-nosso')) return;
    var form = document.querySelector('#login-form form');
    if (!form || form.dataset.previoNosso) return;
    form.dataset.previoNosso = '1';
    var action = form.getAttribute('action') || '';
    if (/[?&]nosso(=|&|$)/.test(action)) return;
    form.setAttribute('action', action + (action.indexOf('?') === -1 ? '?' : '&') + 'nosso=1');
  }

  function init() {
    try { setPlaceholder(); } catch (e) {}
    try { keepNossoOnSubmit(); } catch (e) {}
    try { wireMobileSearch(); } catch (e) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}());
