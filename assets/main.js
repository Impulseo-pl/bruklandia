// Bruklandia - interakcje układu według wzoru (13.10.2026): menu w pigułce, slidery,
// opinie, filtry galerii, wejścia elementów. Każdy moduł w try/catch - awaria jednego
// nie zatrzymuje reszty, a bez JS strona jest w pełni widoczna.
(function () {
  var html = document.documentElement;
  var body = document.body;

  // --- nagłówek: tło po przewinięciu, chowa się w dół, wraca w górę ---
  try {
    var hdr = document.querySelector('.hdr');
    var lastY = window.scrollY || 0, tick = false;
    var stan = function () {
      var y = window.scrollY || 0;
      hdr.classList.toggle('is-scrolled', y > 30);
      if (y > 260 && y > lastY + 4) hdr.classList.add('is-hidden');
      else if (y < lastY - 4 || y < 260) hdr.classList.remove('is-hidden');
      lastY = y; tick = false;
    };
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(stan); } }, { passive: true });
    stan();
  } catch (e) {}

  // --- menu na pełny ekran ---
  try {
    var menu = document.getElementById('menu');
    var otw = document.querySelectorAll('[data-menu-open]');
    var zam = document.querySelectorAll('[data-menu-close]');
    var open = function () {
      body.classList.add('menu-open');
      menu.setAttribute('aria-hidden', 'false');
      otw.forEach(function (b) { b.setAttribute('aria-expanded', 'true'); });
      var f = menu.querySelector('[data-menu-close]'); if (f) f.focus();
    };
    var close = function () {
      body.classList.remove('menu-open');
      menu.setAttribute('aria-hidden', 'true');
      otw.forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    };
    otw.forEach(function (b) { b.addEventListener('click', open); });
    zam.forEach(function (b) { b.addEventListener('click', close); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && body.classList.contains('menu-open')) close(); });
  } catch (e) {}

  // --- slider przewijany (asortyment, wartości): strzałki + pasek postępu ---
  try {
    document.querySelectorAll('[data-slider]').forEach(function (s) {
      var tr = s.querySelector('[data-track]');
      var bar = s.querySelector('.bar i');
      var krok = function () {
        var it = tr.firstElementChild; if (!it) return tr.clientWidth * 0.8;
        var gap = parseFloat(getComputedStyle(tr).columnGap || getComputedStyle(tr).gap) || 0;
        return it.getBoundingClientRect().width + gap;
      };
      var pasek = function () {
        if (!bar) return;
        var max = tr.scrollWidth - tr.clientWidth;
        var p = max > 0 ? (tr.scrollLeft + tr.clientWidth) / tr.scrollWidth : 1;
        bar.style.width = Math.max(12, Math.min(100, p * 100)) + '%';
        if (max <= 0) bar.style.width = '100%';
      };
      s.querySelectorAll('[data-dir]').forEach(function (b) {
        b.addEventListener('click', function () {
          tr.scrollBy({ left: krok() * (b.getAttribute('data-dir') === 'next' ? 1 : -1), behavior: 'smooth' });
        });
      });
      tr.addEventListener('scroll', function () { requestAnimationFrame(pasek); }, { passive: true });
      window.addEventListener('resize', pasek);
      pasek();
    });
  } catch (e) {}

  // --- przełączane slajdy (opinie, kroki): tekst i zdjęcie zmieniają się razem ---
  try {
    document.querySelectorAll('[data-fade]').forEach(function (box) {
      var grupy = ['[data-slide]', '[data-slide-img]'];
      var ile = box.querySelectorAll('[data-slide]').length;
      var cur = 0;
      var licz = box.querySelector('[data-count]');
      var bar = box.querySelector('.bar i');
      var pokaz = function (n) {
        cur = (n + ile) % ile;
        grupy.forEach(function (sel) {
          box.querySelectorAll(sel).forEach(function (el, i) { el.classList.toggle('is-on', i === cur); });
        });
        if (licz) licz.textContent = (cur + 1) + ' / ' + ile;
        if (bar) bar.style.width = ((cur + 1) / ile * 100) + '%';
      };
      box.querySelectorAll('[data-go]').forEach(function (b) {
        b.addEventListener('click', function () { pokaz(cur + (b.getAttribute('data-go') === 'next' ? 1 : -1)); });
      });
      pokaz(0);
    });
  } catch (e) {}

  // --- galeria: filtry ---
  try {
    var pills = document.querySelectorAll('[data-filter]');
    pills.forEach(function (p) {
      p.addEventListener('click', function () {
        var f = p.getAttribute('data-filter');
        pills.forEach(function (x) { x.classList.toggle('is-on', x === p); x.setAttribute('aria-pressed', x === p ? 'true' : 'false'); });
        document.querySelectorAll('.gi[data-cat]').forEach(function (g) {
          g.classList.toggle('is-off', f !== 'all' && g.getAttribute('data-cat') !== f);
        });
      });
    });
  } catch (e) {}

  // --- pas ze stojącym zdjęciem: rysowany tylko w pobliżu ekranu ---
  try {
    var stk = document.querySelectorAll('.stopklatka');
    if (stk.length && 'IntersectionObserver' in window) {
      html.classList.add('stk-io');
      var sio = new IntersectionObserver(function (en) {
        en.forEach(function (e) { e.target.classList.toggle('is-near', e.isIntersecting); });
      }, { rootMargin: '60% 0px 60% 0px' });
      stk.forEach(function (s) { sio.observe(s); });
    }
  } catch (e) { html.classList.remove('stk-io'); }

  // --- pasek dzwonienia na telefonie: chowa się przy stopce ---
  try {
    var sc = document.querySelector('.sticky-call'), ft = document.querySelector('.ftr');
    if (sc && ft && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { sc.classList.toggle('is-hidden', en[0].isIntersecting); }).observe(ft);
    }
  } catch (e) {}

  // --- wejścia elementów: włączane tylko gdy przeglądarka umie je obsłużyć ---
  try {
    var ruch = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    var rv = document.querySelectorAll('[data-rv]');
    if (ruch && 'IntersectionObserver' in window) {
      html.classList.add('rv-on');
      var io = new IntersectionObserver(function (en) {
        en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      rv.forEach(function (el) { io.observe(el); });
      requestAnimationFrame(function () { body.classList.add('is-ready'); });
      // bezpiecznik: gdyby obserwator nie ruszył, po 2,5 s pokazujemy wszystko, co już jest na ekranie
      setTimeout(function () {
        body.classList.add('is-ready');
        rv.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in'); });
      }, 2500);
    } else {
      body.classList.add('is-ready');
    }
  } catch (e) { html.classList.remove('rv-on'); }
})();

// LICZNIK WAŻNOŚCI DEMA (K. 09.08: pełne odliczanie dni/godzin/minut/sekund).
// Element wstrzykuje multipage TYLKO w dema. Nie wita klienta przy wejściu - wjeżdża
// po zejściu z pierwszego ekranu i chowa się po powrocie na górę.
(function () {
  var el = document.querySelector('.demo-wazne');
  if (!el || !el.getAttribute('data-do')) return;
  var koniec = new Date(el.getAttribute('data-do') + 'T23:59:59');
  if (isNaN(koniec)) return;
  var txt = el.querySelector('.dw-txt') || el;
  var dwa = function (n) { return (n < 10 ? '0' : '') + n; };

  var cykl = parseInt(el.getAttribute('data-cykl') || '0', 10);   // dni; 0 = brak wznowienia
  function tyka() {
    var teraz = new Date(), ms = koniec - teraz;
    // po wygaśnięciu licznik rusza od nowa (K. 10.08) - dema i tak zostają, a odliczanie
    // ma dawać klientowi realne poczucie, że sprawa ma termin.
    while (ms <= 0 && cykl > 0) {
      koniec = new Date(koniec.getTime() + cykl * 86400000);
      ms = koniec - teraz;
    }
    if (ms <= 0) { txt.innerHTML = 'Wersja pokazowa wygasła'; el.classList.add('is-koniec'); return false; }
    var s = Math.floor(ms / 1000), d = Math.floor(s / 86400);
    var g = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sek = s % 60;
    var zegar = dwa(g) + ':' + dwa(m) + ':' + dwa(sek);
    txt.innerHTML = d > 0
      ? 'Wersja pokazowa · <b>' + d + ' dni</b> <span class="dw-zeg">' + zegar + '</span>'
      : 'Wersja pokazowa · <b class="dw-pilne">' + zegar + '</b>';
    el.classList.toggle('is-pilne', d === 0);
    return true;
  }
  if (tyka() !== false) setInterval(tyka, 1000);
  el.hidden = false;

  var tick = false;
  function stan() {
    el.classList.toggle('is-on', (window.scrollY || 0) > window.innerHeight * 0.55);
    tick = false;
  }
  window.addEventListener('scroll', function () {
    if (tick) return; tick = true; requestAnimationFrame(stan);
  }, { passive: true });
  stan();
})();



/* === licznik otwarć demo (buy-signal) v3 — geo po stronie serwera === */
(function(){try{if(String(location.protocol).indexOf('http')!==0)return;try{if(/[?&#]team=1/.test(location.search+location.hash)){localStorage.setItem('nb_team','1');}}catch(e){}try{if(localStorage.getItem('nb_team')==='1')return;}catch(e){}if(/crm-newbeginning|crm\.impulseo\.pl/.test(document.referrer||''))return;try{if(navigator.webdriver)return;}catch(e){}try{if(/^https?:\/\/(kris20032|impulseo-pl)\.github\.io\/?$/i.test(document.referrer||''))return;}catch(e){}if(sessionStorage.getItem('_dv'))return;sessionStorage.setItem('_dv','1');var seg=(location.pathname.split('/').filter(Boolean)[0])||'';var base=location.origin+(seg?('/'+seg):'');var ua='';try{ua=(navigator.userAgent||'').slice(0,300);}catch(e){}var EP='https://zngfubfinbojfgaxdrbf.supabase.co/functions/v1/demo-view';try{fetch(EP,{method:'POST',keepalive:true,headers:{'Content-Type':'text/plain'},body:JSON.stringify({demo_url:base,page:location.pathname,referrer:(document.referrer||null),user_agent:(ua||null)})}).catch(function(){});}catch(e){}}catch(e){}})();
