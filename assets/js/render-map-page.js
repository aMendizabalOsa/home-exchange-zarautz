/* Página de mapa completo (map.html) */
(function () {
  var strings, mapData;
  var legendEl = document.getElementById("map-legend");

  Promise.all([
    fetch("data/strings.json").then(function (r) { return r.json(); }),
    fetch("data/map-points.json").then(function (r) { return r.json(); })
  ]).then(function (results) {
    strings = results[0];
    mapData = results[1];
    window.HE_STRINGS = strings;
    renderChrome();
    HEMap.renderMap(document.getElementById("full-map"), mapData.points, {
      center: [mapData.center.lat, mapData.center.lng],
      zoom: mapData.zoom || 13,
      linkBase: "page.html?slug="
    });
    renderLegend();
    I18N.onChange(function () {
      renderChrome();
      renderLegend();
    });
  }).catch(function (err) {
    document.getElementById("full-map").innerHTML = "<p>No se ha podido cargar el mapa.</p>";
    console.error(err);
  });

  function renderChrome() {
    document.title = I18N.t(strings.mapTitle);
    setText("#map-title", I18N.t(strings.mapTitle));
    setText("#map-intro", I18N.t(strings.mapIntro));
    document.querySelectorAll("[data-nav-home]").forEach(function (el) { el.textContent = I18N.t(strings.navHome); });
    document.querySelectorAll("[data-nav-print]").forEach(function (el) { el.textContent = I18N.t(strings.navPrint); });
    var switcher = document.getElementById("lang-switcher");
    if (switcher) I18N.renderSwitcher(switcher);
  }

  function setText(sel, text) {
    var el = document.querySelector(sel);
    if (el) el.textContent = text;
  }

  function renderLegend() {
    legendEl.innerHTML = mapData.points
      .map(function (p) {
        return (
          '<a class="legend-item" href="page.html?slug=' + p.slug + '">' +
          '<span class="legend-icon">' + p.icon + "</span>" +
          "<span>" + I18N.t(p.label) + "</span></a>"
        );
      })
      .join("");
  }
})();
