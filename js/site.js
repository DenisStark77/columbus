/* Small shared behaviours: reveal on scroll, FAQ accordion, current page in the nav. */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var items = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
        });
      }, { threshold: .12 });
      items.forEach(function (el) { io.observe(el); });
    } else {
      items.forEach(function (el) { el.classList.add('visible'); });
    }

    document.querySelectorAll('.faq-item').forEach(function (item) {
      item.addEventListener('click', function () { item.classList.toggle('open'); });
    });

    var here = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      var file = href.split('#')[0] || 'index.html';
      if (file === here && href.indexOf('#') < 0) a.classList.add('active');
    });
  });
})();
