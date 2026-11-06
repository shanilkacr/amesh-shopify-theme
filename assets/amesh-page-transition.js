(function () {
  var root = document.documentElement;
  var KEY = 'amesh-pt';
  var MIN_SHOW = 900; // ms the logo stays up on the incoming page
  var LEAVE = 450; // ms for the fade-to-white before navigating

  function clear() {
    root.classList.remove('amesh-pt-on');
    try { sessionStorage.removeItem(KEY); } catch (e) {}
    var el = document.querySelector('.amesh-pt');
    if (el) el.classList.remove('is-active');
  }

  // Incoming page: keep the white screen up until loaded, then fade it out.
  if (root.classList.contains('amesh-pt-on')) {
    var started = performance.now();
    var reveal = function () {
      var wait = Math.max(0, MIN_SHOW - performance.now());
      setTimeout(clear, wait);
    };
    if (document.readyState === 'complete') reveal();
    else window.addEventListener('load', reveal);
    setTimeout(clear, 3000); // heavy pages: do not keep the white screen up waiting for every image
  }

  // Back/forward cache restores the old page with the overlay still up.
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) clear();
  });

  document.addEventListener('click', function (e) {
    if (window.Shopify && Shopify.designMode) return;
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    if (a.target && a.target !== '_self') return;
    if (a.hasAttribute('download') || a.hasAttribute('data-no-transition')) return;
    var u;
    try { u = new URL(a.href, location.href); } catch (err) { return; }
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return;
    if (u.origin !== location.origin) return;
    if (u.pathname === location.pathname && u.search === location.search) return;
    if (/^\/(cart\/(add|change|update|clear)|checkout|account\/logout)/.test(u.pathname)) return;
    var el = document.querySelector('.amesh-pt');
    if (!el) return;
    e.preventDefault();
    try { sessionStorage.setItem(KEY, '1'); } catch (err) {}
    el.classList.add('is-active');
    setTimeout(function () { location.href = u.href; }, LEAVE);
  });
})();
