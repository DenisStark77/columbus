/* Market page: charts drawn as inline SVG from data/stats_public.json. One hue, thin bars,
   annotated periods as bands, the number of sales next to every figure, tables beside charts. */
(function () {
  var LOCALES = { en: 'en-US', es: 'es-CR', ru: 'ru-RU' };
  var EN = {
    'mk.band.cadastral': 'Includes transfers at cadastral value',
    'mk.band.nogrid': 'No grid electricity',
    'mk.tip.sales': '{year}: {n} purchases, {o} other transfers',
    'mk.tip.price': '{year}: median {median} from {n} purchases ({min} – {max})',
    'mk.n': 'n = {n}',
    'mk.own.juridica': 'Companies',
    'mk.own.fisica_cr': 'Costa Rican individuals',
    'mk.own.extranjero': 'Foreign individuals',
    'mk.own.mixto': 'Mixed',
    'mk.own.unknown': 'Not identified',
    'mk.st.lots_without_any_flag': 'No entries',
    'mk.st.lots_with_mortgage_or_tax_lien': 'Mortgage or tax lien',
    'mk.st.lots_in_foreclosure_proceedings': 'Foreclosure proceedings',
    'mk.st.lots_with_fraud_prevention_note': 'Preventive note',
    'mk.st.lots_frozen_by_court': 'Transfers blocked by court',
    'mk.tip.count': '{label}: {n} lots',
    'mk.unit.purchases': 'purchases'
  };
  function lang() { return (window.I18N && window.I18N.lang) || 'en'; }
  function t(key, vars) {
    var s = null;
    if (window.I18N && window.I18N.dict && window.I18N.dict[key] != null) s = window.I18N.dict[key];
    if (s == null) s = EN[key] != null ? EN[key] : key;
    if (vars) Object.keys(vars).forEach(function (k) { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  }
  function locale() { return LOCALES[lang()] || 'en-US'; }
  function fmtNum(n, d) { return new Intl.NumberFormat(locale(), { maximumFractionDigits: d || 0 }).format(n); }
  function fmtMoney(n) { return '$' + fmtNum(n); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  function barPath(x, y, w, h, r) {
    if (h <= 0) return '';
    r = Math.min(r, w / 2, h);
    var y0 = y + h;
    return 'M' + x + ',' + y0 + ' V' + (y + r) + ' a' + r + ',' + r + ' 0 0 1 ' + r + ',-' + r + ' h' + (w - 2 * r) + ' a' + r + ',' + r + ' 0 0 1 ' + r + ',' + r + ' V' + y0 + ' Z';
  }
  function hbarPath(x, y, w, h, r) {
    if (w <= 0) return '';
    r = Math.min(r, h / 2, w);
    return 'M' + x + ',' + y + ' h' + (w - r) + ' a' + r + ',' + r + ' 0 0 1 ' + r + ',' + r + ' v' + (h - 2 * r) + ' a' + r + ',' + r + ' 0 0 1 -' + r + ',' + r + ' h-' + (w - r) + ' Z';
  }
  function niceMax(v, step) { return Math.ceil(v / step) * step; }

  /* tooltip: one element per chart container */
  function attachTips(container) {
    var tip = container.querySelector('.chart-tip');
    if (!tip) { tip = document.createElement('div'); tip.className = 'chart-tip'; container.appendChild(tip); }
    container.querySelectorAll('[data-tip]').forEach(function (el) {
      el.addEventListener('mouseenter', function () { tip.textContent = el.getAttribute('data-tip'); tip.style.display = 'block'; });
      el.addEventListener('mousemove', function (e) {
        var r = container.getBoundingClientRect();
        tip.style.left = Math.min(e.clientX - r.left + 12, r.width - tip.offsetWidth - 4) + 'px';
        tip.style.top = (e.clientY - r.top - 34) + 'px';
      });
      el.addEventListener('mouseleave', function () { tip.style.display = 'none'; });
    });
  }

  var stats = null;

  function salesChart() {
    var el = document.getElementById('chart-sales');
    if (!el || !stats) return;
    var rows = stats.sales_per_year.slice();
    var byYear = {}; rows.forEach(function (r) { byYear[r.year] = r; });
    var y0 = rows[0].year, y1 = rows[rows.length - 1].year;
    var years = []; for (var y = y0; y <= y1; y++) years.push(y);
    var W = 720, H = 300, mL = 34, mR = 10, mT = 34, mB = 34;
    var pw = W - mL - mR, ph = H - mT - mB;
    var gap = 3, bw = pw / years.length - gap;
    var maxV = niceMax(Math.max.apply(null, rows.map(function (r) { return r.compraventas; })), 20);
    var sy = function (v) { return mT + ph - (v / maxV) * ph; };
    var sx = function (i) { return mL + i * (bw + gap) + gap / 2; };
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Purchases per year">';
    // bands
    var bands = [[2019, 2021, 'mk.band.cadastral'], [2025, 2026, 'mk.band.nogrid']];
    bands.forEach(function (b) {
      var i0 = years.indexOf(b[0]), i1 = years.indexOf(b[1]);
      if (i0 < 0 || i1 < 0) return;
      var x0 = sx(i0) - gap / 2, x1 = sx(i1) + bw + gap / 2;
      s += '<rect class="band" x="' + x0 + '" y="' + (mT - 18) + '" width="' + (x1 - x0) + '" height="' + (ph + 18) + '"/>';
      s += '<text x="' + ((x0 + x1) / 2) + '" y="' + (mT - 6) + '" text-anchor="middle" font-size="10">' + esc(t(b[2])) + '</text>';
    });
    // grid + axis labels
    for (var g = 0; g <= maxV; g += 20) {
      s += '<line class="axis" x1="' + mL + '" x2="' + (W - mR) + '" y1="' + sy(g) + '" y2="' + sy(g) + '"/>';
      s += '<text x="' + (mL - 6) + '" y="' + (sy(g) + 4) + '" text-anchor="end">' + g + '</text>';
    }
    var labelYears = [2019, 2020, 2021, 2024, 2025, 2026];
    years.forEach(function (yr, i) {
      var r = byYear[yr] || { year: yr, compraventas: 0, other_transfers: 0 };
      var h = (r.compraventas / maxV) * ph;
      var tip = t('mk.tip.sales', { year: yr, n: r.compraventas, o: r.other_transfers });
      s += '<g data-tip="' + esc(tip) + '">';
      s += '<rect x="' + sx(i) + '" y="' + mT + '" width="' + bw + '" height="' + ph + '" fill="transparent"/>';
      s += '<path class="bar" d="' + barPath(sx(i), sy(r.compraventas), bw, h, 4) + '"/>';
      if (labelYears.indexOf(yr) >= 0 && r.compraventas > 0) s += '<text class="val" x="' + (sx(i) + bw / 2) + '" y="' + (sy(r.compraventas) - 5) + '" text-anchor="middle">' + r.compraventas + '</text>';
      s += '</g>';
      if (yr % 2 === 0) s += '<text x="' + (sx(i) + bw / 2) + '" y="' + (H - 12) + '" text-anchor="middle">' + yr + '</text>';
    });
    s += '</svg>';
    el.innerHTML = s;
    attachTips(el);
  }

  function priceChart() {
    var el = document.getElementById('chart-prices');
    if (!el || !stats) return;
    var rows = stats.usd_purchase_prices_by_year;
    var W = 720, H = 320, mL = 52, mR = 16, mT = 34, mB = 48;
    var pw = W - mL - mR, ph = H - mT - mB;
    var maxV = niceMax(Math.max.apply(null, rows.map(function (r) { return r.max_usd; })), 20000);
    var sy = function (v) { return mT + ph - (v / maxV) * ph; };
    var step = pw / rows.length;
    var sx = function (i) { return mL + step * (i + .5); };
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Declared purchase prices by year">';
    var i0 = rows.findIndex(function (r) { return r.year === 2025; });
    if (i0 >= 0) {
      var x0 = mL + step * i0, x1 = W - mR;
      s += '<rect class="band" x="' + x0 + '" y="' + (mT - 18) + '" width="' + (x1 - x0) + '" height="' + (ph + 18) + '"/>';
      s += '<text x="' + ((x0 + x1) / 2) + '" y="' + (mT - 6) + '" text-anchor="middle" font-size="10">' + esc(t('mk.band.nogrid')) + '</text>';
    }
    for (var g = 0; g <= maxV; g += 20000) {
      s += '<line class="axis" x1="' + mL + '" x2="' + (W - mR) + '" y1="' + sy(g) + '" y2="' + sy(g) + '"/>';
      s += '<text x="' + (mL - 8) + '" y="' + (sy(g) + 4) + '" text-anchor="end">' + (g / 1000) + 'k</text>';
    }
    rows.forEach(function (r, i) {
      var x = sx(i);
      var tip = t('mk.tip.price', { year: r.year, median: fmtMoney(r.median_usd), n: r.n, min: fmtMoney(r.min_usd), max: fmtMoney(r.max_usd) });
      s += '<g data-tip="' + esc(tip) + '">';
      s += '<rect x="' + (x - step / 2) + '" y="' + mT + '" width="' + step + '" height="' + ph + '" fill="transparent"/>';
      s += '<line class="range" x1="' + x + '" x2="' + x + '" y1="' + sy(r.min_usd) + '" y2="' + sy(r.max_usd) + '" stroke-linecap="round"/>';
      s += '<circle cx="' + x + '" cy="' + sy(r.median_usd) + '" r="7" fill="#fff"/>';
      s += '<circle class="median" cx="' + x + '" cy="' + sy(r.median_usd) + '" r="5"/>';
      s += '<text class="val" x="' + (x + 10) + '" y="' + (sy(r.median_usd) + 4) + '">' + esc(fmtMoney(r.median_usd)) + '</text>';
      s += '</g>';
      s += '<text x="' + x + '" y="' + (H - 26) + '" text-anchor="middle">' + r.year + '</text>';
      s += '<text x="' + x + '" y="' + (H - 10) + '" text-anchor="middle" font-size="10">' + esc(t('mk.n', { n: r.n })) + '</text>';
    });
    s += '</svg>';
    el.innerHTML = s;
    attachTips(el);
  }

  function hbarChart(id, items, ariaLabel) {
    var el = document.getElementById(id);
    if (!el) return;
    var W = 720, rowH = 30, mL = 200, mR = 60, mT = 6;
    var H = mT + items.length * rowH + 6;
    var pw = W - mL - mR;
    var maxV = Math.max.apply(null, items.map(function (i) { return i.value; }));
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(ariaLabel) + '">';
    items.forEach(function (it, i) {
      var y = mT + i * rowH;
      var w = (it.value / maxV) * pw;
      var tip = t('mk.tip.count', { label: it.label, n: it.value });
      s += '<g data-tip="' + esc(tip) + '">';
      s += '<rect x="0" y="' + y + '" width="' + W + '" height="' + rowH + '" fill="transparent"/>';
      s += '<text x="' + (mL - 10) + '" y="' + (y + rowH / 2 + 4) + '" text-anchor="end">' + esc(it.label) + '</text>';
      s += '<path class="bar" d="' + hbarPath(mL, y + 7, w, rowH - 14, 4) + '"/>';
      s += '<text class="val" x="' + (mL + w + 8) + '" y="' + (y + rowH / 2 + 4) + '">' + it.value + '</text>';
      s += '</g>';
    });
    s += '</svg>';
    el.innerHTML = s;
    attachTips(el);
  }

  function ownershipChart() {
    if (!stats) return;
    var c = stats.ownership.owner_type_counts;
    var order = ['juridica', 'fisica_cr', 'extranjero', 'mixto', 'unknown'];
    hbarChart('chart-ownership', order.filter(function (k) { return c[k] != null; }).map(function (k) { return { label: t('mk.own.' + k), value: c[k] }; }), 'Registered owners by type');
  }
  function statusChart() {
    if (!stats) return;
    var c = stats.registry_status_summary;
    var order = ['lots_without_any_flag', 'lots_with_mortgage_or_tax_lien', 'lots_in_foreclosure_proceedings', 'lots_with_fraud_prevention_note', 'lots_frozen_by_court'];
    hbarChart('chart-status', order.filter(function (k) { return c[k] != null; }).map(function (k) { return { label: t('mk.st.' + k), value: c[k] }; }), 'Registry entries, lots by kind');
  }

  function fillTables() {
    if (!stats) return;
    var tb = document.getElementById('table-sales');
    if (tb) tb.innerHTML = stats.sales_per_year.map(function (r) {
      return '<tr><td>' + r.year + '</td><td class="num">' + r.compraventas + '</td><td class="num">' + r.other_transfers + '</td></tr>';
    }).join('');
    var tp = document.getElementById('table-prices');
    if (tp) tp.innerHTML = stats.usd_purchase_prices_by_year.map(function (r) {
      return '<tr><td>' + r.year + '</td><td class="num">' + r.n + '</td><td class="num">' + esc(fmtMoney(r.median_usd)) + '</td><td class="num">' + esc(fmtMoney(r.min_usd)) + '</td><td class="num">' + esc(fmtMoney(r.max_usd)) + '</td></tr>';
    }).join('');
    var set = function (id, v) { var e = document.getElementById(id); if (e) e.textContent = v; };
    var tt = stats.totals, p = stats.usd_purchase_prices_2021_2026;
    set('v-fincas', fmtNum(tt.fincas));
    set('v-area', fmtNum(tt.total_area_ha, 1));
    set('v-median-lot', fmtNum(Math.round(tt.median_lot_m2)));
    set('v-std-lots', fmtNum(tt.lots_5000_to_6000_m2));
    set('v-n', fmtNum(p.n));
    set('v-median', fmtMoney(p.median_usd));
    set('v-iqr', fmtMoney(p.q1_usd) + ' – ' + fmtMoney(p.q3_usd));
    set('v-asof', stats.as_of);
    set('v-original', fmtNum(stats.ownership.still_in_original_2006_company));
  }

  function renderAll() { salesChart(); priceChart(); ownershipChart(); statusChart(); fillTables(); }

  document.addEventListener('DOMContentLoaded', function () {
    fetch('data/stats_public.json').then(function (r) { return r.json(); }).then(function (d) {
      stats = d; renderAll();
      document.addEventListener('langchange', renderAll);
    }).catch(function (e) { console.error('stats failed', e); });
  });
})();
