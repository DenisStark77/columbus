/* Lot map: geometry from data/lots.json, everything about a lot from data/map_public.json,
   joined by lot number. Status wording is keyed, never copied from the JSON strings,
   so the same key can be translated. */
(function () {
  var CENTER = [9.581195, -84.537217];
  var COLORS = { green: '#4c8a5f', yellow: '#d9a441', red: '#b8503f', special: '#9a9a9a', nodata: '#d6d2c9' };
  var SPECIAL_WITH_17 = [18, 19, 20, 21, 22, 23, 24];
  var SPECIAL_MERGED = [63, 64];
  /* Per-lot wording that the public JSON does not carry yet. Lot 180: the parcel itself is clean,
     the owning company has been dissolved. Prefer a status_key field in the data pipeline later. */
  var STATUS_OVERRIDES = { 180: 'yellow_company_dissolved' };
  var LOCALES = { en: 'en-US', es: 'es-CR', ru: 'ru-RU' };

  /* English strings for everything this script writes. ES/RU live in i18n/*.json under the same keys. */
  var EN = {
    'card.empty.title': 'Choose a lot on the map',
    'card.empty.text': 'Each lot shows what the National Registry had on record on the date given, a price range from five comparable closed sales, the area, relief and cover.',
    'card.empty.hint': 'Green: no mortgages, claims or notes. Yellow: entries present. Red: transfers blocked by court order. Grey: not a separate parcel, or no record found.',
    'card.lot': 'Lot {n}',
    'card.area': '{a} m²',
    'card.plano': 'plano {p}',
    'status.green': 'No mortgages, claims or notes in the registry',
    'status.yellow': 'Registry entries present (mortgage, claim or note) — details in the lot report',
    'status.red': 'Transfers blocked by court order',
    'status.special_with_17': 'Not a separate registry parcel: registered as one parcel together with lot 17',
    'status.special_merged': 'Registry parcel closed in 2007 (merged into another parcel)',
    'status.yellow_company_dissolved': 'No entries on the parcel itself; the owning company has been dissolved — details in the lot report',
    'status.nodata': 'No registry record for this lot number in the current snapshot',
    'card.fresh': 'Registry data as of {date}. Records may have changed. An up-to-date check of this lot is part of the paid report.',
    'card.company': 'Registered owner is a company; a company check is part of the report.',
    'card.price.label': 'Price range · land only',
    'card.price.sub': 'median {median} · five comparable closed sales · calculated {date}',
    'card.price.none17': 'No price range: a 5.7 ha parcel (lots 17–24 as one finca) falls outside the standard-lot method.',
    'card.price.none': 'No price range calculated for this lot.',
    'card.special.note17': 'Lots 18–24 are drawn on the map but exist in the registry only as part of the single parcel of lot 17.',
    'card.special.note_merged': 'The map still shows the old outline; the registry has no separate record to check.',
    'card.nodata.note': 'The lot is drawn on the map, but no parcel with this number was found in the registry snapshot. Ask us and we will look it up.',
    'card.relief': 'Relief',
    'card.cover': 'Cover',
    'card.river': 'River',
    'card.river.yes': 'borders a river',
    'card.river.no': 'none on the boundary',
    'relief.flat': 'flat',
    'relief.slope': 'slope',
    'relief.hilltop': 'hilltop',
    'relief.low ground between hills': 'low ground between hills',
    'cover.open field': 'open field',
    'cover.forest': 'forest',
    'cover.mixed': 'mixed',
    'cover.unknown': '—',
    'card.link.method': 'How this estimate was made',
    'card.link.talk': 'Talk to us',
    'card.link.report': 'Order a lot check',
    'card.link.lot17': 'See lot 17',
    'legend.green': 'No entries',
    'legend.yellow': 'Entries present',
    'legend.red': 'Blocked by court',
    'legend.special': 'Not a separate parcel',
    'legend.nodata': 'No record',
    'legend.asof': 'Registry snapshot: {date}'
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
  function fmtNum(n) { return new Intl.NumberFormat(locale(), { maximumFractionDigits: 0 }).format(n); }
  function fmtMoney(n) { return '$' + fmtNum(n); }
  function fmtDate(iso) {
    if (!iso) return '';
    var p = iso.split('-').map(Number);
    var d = new Date(Date.UTC(p[0], p[1] - 1, p[2]));
    if (lang() === 'ru') return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }).format(d);
    return new Intl.DateTimeFormat(locale(), { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(d);
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var map, layers = {}, info = {}, dataAsOf = '', selected = null, labelGroup, cardEl, legendEl;

  function statusKey(lot, rec) {
    if (!rec) return 'nodata';
    if (STATUS_OVERRIDES[lot]) return STATUS_OVERRIDES[lot];
    if (rec.status === 'special') return SPECIAL_WITH_17.indexOf(lot) >= 0 ? 'special_with_17' : 'special_merged';
    return rec.status;
  }
  function colorClass(key) {
    if (key === 'nodata') return 'nodata';
    if (key.indexOf('special') === 0) return 'special';
    if (key.indexOf('yellow') === 0) return 'yellow';
    return COLORS[key] ? key : 'nodata';
  }
  function baseStyle(feature) {
    var lot = feature.properties.lot;
    return { fillColor: COLORS[colorClass(statusKey(lot, info[lot]))], fillOpacity: .55, color: '#ffffff', weight: 1.2, opacity: .9 };
  }

  function renderLegend() {
    if (!legendEl) return;
    var keys = ['green', 'yellow', 'red', 'special', 'nodata'];
    legendEl.innerHTML = keys.map(function (k) {
      return '<span class="legend-item"><span class="legend-swatch" style="background:' + COLORS[k] + '"></span>' + esc(t('legend.' + k)) + '</span>';
    }).join('') + '<span class="legend-asof">' + esc(t('legend.asof', { date: fmtDate(dataAsOf) })) + '</span>';
  }

  function renderEmpty() {
    cardEl.innerHTML = '<div class="lot-empty"><h3>' + esc(t('card.empty.title')) + '</h3><p>' + esc(t('card.empty.text')) + '</p><p>' + esc(t('card.empty.hint')) + '</p></div>';
  }

  function renderCard(lot) {
    var rec = info[lot];
    var key = statusKey(lot, rec);
    var cls = colorClass(key);
    var h = '';

    h += '<div class="lot-head"><h3>' + esc(t('card.lot', { n: lot })) + '</h3><div class="lot-meta">';
    if (rec && rec.area_m2) h += esc(t('card.area', { a: fmtNum(rec.area_m2) }));
    if (rec && rec.plano) h += '<br>' + esc(t('card.plano', { p: rec.plano }));
    h += '</div></div>';

    h += '<div class="lot-status s-' + cls + '"><span class="dot"></span><span>' + esc(t('status.' + key)) + '</span></div>';
    if (rec && rec.checked_on) h += '<p class="lot-fresh">' + esc(t('card.fresh', { date: fmtDate(rec.checked_on) })) + '</p>';

    if (key === 'nodata') {
      h += '<p class="lot-note">' + esc(t('card.nodata.note')) + '</p>';
      h += '<div class="lot-links"><a href="request.html?lot=' + lot + '&service=call">' + esc(t('card.link.talk')) + '</a></div>';
      cardEl.innerHTML = h; return;
    }
    if (key === 'special_with_17') {
      h += '<p class="lot-note">' + esc(t('card.special.note17')) + '</p>';
      h += '<div class="lot-links"><a href="#lot=17" data-lot="17">' + esc(t('card.link.lot17')) + '</a><a href="request.html?lot=' + lot + '&service=call">' + esc(t('card.link.talk')) + '</a></div>';
      cardEl.innerHTML = h; return;
    }
    if (key === 'special_merged') {
      h += '<p class="lot-note">' + esc(t('card.special.note_merged')) + '</p>';
      h += '<div class="lot-links"><a href="request.html?lot=' + lot + '&service=call">' + esc(t('card.link.talk')) + '</a></div>';
      cardEl.innerHTML = h; return;
    }

    if (rec.owner_is_company) h += '<p class="lot-company">' + esc(t('card.company')) + '</p>';

    var pr = rec.price_range_usd;
    h += '<div class="lot-price"><div class="lot-price-label">' + esc(t('card.price.label')) + '</div>';
    if (pr && pr.min != null) {
      h += '<div class="lot-price-range">' + esc(fmtMoney(pr.min)) + ' – ' + esc(fmtMoney(pr.max)) + '</div>';
      h += '<div class="lot-price-sub">' + esc(t('card.price.sub', { median: fmtMoney(pr.median), date: fmtDate(dataAsOf) })) + '</div>';
    } else {
      h += '<div class="lot-price-sub">' + esc(t(lot === 17 ? 'card.price.none17' : 'card.price.none')) + '</div>';
    }
    h += '</div>';

    var relief = rec.relief ? t('relief.' + rec.relief) : t('cover.unknown');
    var cover = rec.cover ? t('cover.' + rec.cover) : t('cover.unknown');
    h += '<dl class="lot-facts"><dt>' + esc(t('card.relief')) + '</dt><dd>' + esc(relief) + '</dd>';
    h += '<dt>' + esc(t('card.cover')) + '</dt><dd>' + esc(cover) + '</dd>';
    h += '<dt>' + esc(t('card.river')) + '</dt><dd>' + esc(t(rec.borders_river ? 'card.river.yes' : 'card.river.no')) + '</dd></dl>';

    h += '<div class="lot-links">';
    h += '<a href="how-we-count.html">' + esc(t('card.link.method')) + '</a>';
    h += '<a href="request.html?lot=' + lot + '&service=call">' + esc(t('card.link.talk')) + '</a>';
    h += '<a href="request.html?lot=' + lot + '&service=report">' + esc(t('card.link.report')) + '</a>';
    h += '</div>';
    cardEl.innerHTML = h;
  }

  function select(lot, opts) {
    opts = opts || {};
    var layer = layers[lot];
    if (!layer) return;
    if (selected && selected !== layer) selected.setStyle(baseStyle(selected.feature));
    selected = layer;
    layer.setStyle({ weight: 3, color: '#1f3a2e', fillOpacity: .78 });
    layer.bringToFront();
    renderCard(lot);
    if (opts.pan) map.panTo(layer.getBounds().getCenter());
    if (location.hash !== '#lot=' + lot) history.replaceState(null, '', '#lot=' + lot);
    if (opts.scroll && window.innerWidth < 900) cardEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function lotFromHash() {
    var m = /^#lot=(\d+)$/.exec(location.hash);
    return m ? parseInt(m[1], 10) : null;
  }

  function addLabels(data) {
    labelGroup = L.layerGroup();
    data.features.forEach(function (f) {
      var center = L.geoJSON(f).getBounds().getCenter();
      L.marker(center, {
        icon: L.divIcon({ className: 'lot-label', html: String(f.properties.lot), iconSize: [22, 16] }),
        interactive: true, keyboard: false
      }).on('click', function () { select(f.properties.lot, { scroll: true }); }).addTo(labelGroup);
    });
    function sync() { if (map.getZoom() >= 16) { if (!map.hasLayer(labelGroup)) labelGroup.addTo(map); } else if (map.hasLayer(labelGroup)) map.removeLayer(labelGroup); }
    map.on('zoomend', sync);
    sync();
  }

  function init() {
    cardEl = document.getElementById('lot-card');
    legendEl = document.getElementById('map-legend');
    if (!document.getElementById('map') || !cardEl) return;

    map = L.map('map', { center: CENTER, zoom: 16, minZoom: 14, maxZoom: 19, scrollWheelZoom: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    map.on('click', function () { /* keep selection; clicks on water/roads do nothing */ });

    renderEmpty();

    Promise.all([
      fetch('data/lots.json').then(function (r) { return r.json(); }),
      fetch('data/map_public.json').then(function (r) { return r.json(); })
    ]).then(function (res) {
      var geo = res[0], pub = res[1];
      dataAsOf = pub.data_as_of || '';
      (pub.lots || []).forEach(function (rec) { info[rec.lot] = rec; });

      var gj = L.geoJSON(geo, {
        style: baseStyle,
        onEachFeature: function (feature, layer) {
          var lot = feature.properties.lot;
          layers[lot] = layer;
          layer.on({
            mouseover: function () { if (layer !== selected) layer.setStyle({ weight: 2.2, fillOpacity: .7 }); },
            mouseout: function () { if (layer !== selected) layer.setStyle(baseStyle(feature)); },
            click: function () { select(lot, { scroll: true }); }
          });
        }
      }).addTo(map);
      map.fitBounds(gj.getBounds(), { padding: [10, 10] });
      addLabels(geo);
      renderLegend();

      var fromHash = lotFromHash();
      if (fromHash && layers[fromHash]) select(fromHash, { pan: true });

      window.addEventListener('hashchange', function () {
        var n = lotFromHash();
        if (n && layers[n]) select(n, { pan: true });
      });
      cardEl.addEventListener('click', function (e) {
        var a = e.target.closest('a[data-lot]');
        if (a) { e.preventDefault(); select(parseInt(a.getAttribute('data-lot'), 10), { pan: true }); }
      });
      document.addEventListener('langchange', function () {
        renderLegend();
        if (selected) renderCard(selected.feature.properties.lot); else renderEmpty();
      });
    }).catch(function (err) {
      console.error('Map data failed to load', err);
      cardEl.innerHTML = '<div class="lot-empty"><p>The map data could not be loaded. Please reload the page.</p></div>';
    });
  }

  document.addEventListener('DOMContentLoaded', init);
  window.CHMap = { select: select };
})();
