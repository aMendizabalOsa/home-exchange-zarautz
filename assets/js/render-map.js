/* Mapa interactivo con Leaflet + OpenStreetMap (gratis, sin API key) */
var HEMap = (function () {

  // Crea un mapa Leaflet dentro de containerEl y añade marcadores.
  // points: [{lat, lng, icon, label:{es,en,fr}, slug?}]
  // linkBase: si se indica, cada marcador enlaza a linkBase + slug (p.ej. "page.html?slug=")
  function renderMap(containerEl, points, opts) {
    opts = opts || {};
    var center = opts.center || (points[0] ? [points[0].lat, points[0].lng] : [43.2833, -2.1667]);
    var zoom = opts.zoom || 13;

    var map = L.map(containerEl, { scrollWheelZoom: opts.scrollWheelZoom !== false }).setView(center, zoom);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    var markers = points.map(function (p) {
      var divIcon = L.divIcon({
        html: '<span class="map-pin">' + (p.icon || "📍") + "</span>",
        className: "map-pin-wrapper",
        iconSize: [34, 34],
        iconAnchor: [17, 32]
      });
      var marker = L.marker([p.lat, p.lng], { icon: divIcon }).addTo(map);
      marker._heData = p;
      bindPopup(marker, opts.linkBase);
      return marker;
    });

    I18N.onChange(function () {
      markers.forEach(function (m) { bindPopup(m, opts.linkBase); });
    });

    setTimeout(function () { map.invalidateSize(); }, 200);
    return map;
  }

  function bindPopup(marker, linkBase) {
    var p = marker._heData;
    var html = "<strong>" + (p.icon || "") + " " + I18N.t(p.label) + "</strong>";
    if (linkBase && p.slug) {
      html += '<br><a href="' + linkBase + p.slug + '">' + I18N.t(window.HE_STRINGS.viewPageLink) + "</a>";
    }
    marker.bindPopup(html);
  }

  return { renderMap: renderMap };
})();
