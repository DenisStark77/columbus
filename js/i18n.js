/* Language switching: EN is baked into the HTML; ES and RU come from i18n/<lang>.json.
   Elements opt in with data-i18n="key" (text) or data-i18n-html="key" (markup, e.g. <em>).
   Scripts that build their own strings read window.I18N.dict and listen for 'langchange'. */
(function () {
  var SUPPORTED = ['en', 'es', 'ru'];
  var originals = new Map();

  function detect() {
    var q = new URLSearchParams(location.search).get('lang');
    if (q && SUPPORTED.indexOf(q) >= 0) return q;
    var saved = null;
    try { saved = localStorage.getItem('lang'); } catch (e) {}
    if (saved && SUPPORTED.indexOf(saved) >= 0) return saved;
    var nav = (navigator.language || 'en').slice(0, 2).toLowerCase();
    return SUPPORTED.indexOf(nav) >= 0 ? nav : 'en';
  }

  function snapshot() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      if (!originals.has(el)) originals.set(el, { kind: 'text', value: el.textContent });
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      if (!originals.has(el)) originals.set(el, { kind: 'html', value: el.innerHTML });
    });
  }

  function apply(dict) {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      var o = originals.get(el);
      if (dict && dict[k] != null) el.textContent = dict[k];
      else if (o) el.textContent = o.value;
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var k = el.getAttribute('data-i18n-html');
      var o = originals.get(el);
      if (dict && dict[k] != null) el.innerHTML = dict[k];
      else if (o) el.innerHTML = o.value;
    });
  }

  function t(key, vars) {
    var d = window.I18N.dict || {};
    var s = d[key];
    if (s == null) return null;
    if (vars) Object.keys(vars).forEach(function (k) { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  }

  function markButtons(lang) {
    document.querySelectorAll('[data-lang]').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-lang') === lang);
      b.setAttribute('aria-pressed', b.getAttribute('data-lang') === lang ? 'true' : 'false');
    });
  }

  function finish(lang, dict) {
    window.I18N.lang = lang;
    window.I18N.dict = dict || {};
    document.documentElement.lang = lang;
    try { localStorage.setItem('lang', lang); } catch (e) {}
    snapshot();
    apply(window.I18N.dict);
    markButtons(lang);
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: lang } }));
  }

  function setLang(lang) {
    if (SUPPORTED.indexOf(lang) < 0) lang = 'en';
    if (lang === 'en') { finish('en', {}); return Promise.resolve(); }
    return fetch('i18n/' + lang + '.json', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (dict) { finish(lang, dict); })
      .catch(function () { finish('en', {}); });
  }

  window.I18N = { lang: 'en', dict: {}, t: t, setLang: setLang, supported: SUPPORTED };

  document.addEventListener('DOMContentLoaded', function () {
    snapshot();
    document.querySelectorAll('[data-lang]').forEach(function (b) {
      b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
    });
    setLang(detect());
  });
})();
