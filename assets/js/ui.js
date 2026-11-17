/* Utilidades compartidas: escape de HTML, barra superior y mapas incrustados */
var UI = (function () {
  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function setText(sel, text) {
    var el = document.querySelector(sel);
    if (el) el.textContent = text;
  }

  function fetchJson(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error("No existe " + url);
      return r.json();
    });
  }

  // Textos de navegación comunes (barra superior, pie) y selector de idioma
  function applyChrome(strings) {
    var map = {
      "[data-nav-home]": strings.navHome,
      "[data-nav-map]": strings.navMap,
      "[data-nav-print]": strings.navPrint,
      "[data-back-link]": strings.backLink
    };
    Object.keys(map).forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) { el.textContent = I18N.t(map[sel]); });
    });
    var switcher = document.getElementById("lang-switcher");
    if (switcher) I18N.renderSwitcher(switcher);
  }

  // URL del visor a pantalla completa de un mapa de Google My Maps
  function mapViewerUrl(embedSrc) {
    return String(embedSrc || "").replace("/maps/d/embed", "/maps/d/viewer");
  }

  // Mapa incrustado + escudo táctil (evita que atrape el scroll en móvil)
  // + botón para abrirlo en Google Maps (por si el iframe se queda en blanco)
  function mapHtml(src, strings, extraClass) {
    return (
      '<div class="map-block ' + (extraClass || "") + '">' +
        '<div class="map-frame">' +
          '<iframe src="' + esc(src) + '" loading="lazy" title="' + esc(I18N.t(strings.navMap)) + '" allowfullscreen></iframe>' +
          '<button type="button" class="map-shield">' + esc(I18N.t(strings.mapTapToUse)) + "</button>" +
        "</div>" +
        '<a class="map-open" href="' + esc(mapViewerUrl(src)) + '" target="_blank" rel="noopener">' + esc(I18N.t(strings.mapOpenButton)) + "</a>" +
      "</div>"
    );
  }

  function wireMaps(container) {
    container.querySelectorAll(".map-shield").forEach(function (btn) {
      btn.addEventListener("click", function () { btn.remove(); });
    });
  }

  return { esc: esc, setText: setText, fetchJson: fetchJson, applyChrome: applyChrome, mapHtml: mapHtml, wireMaps: wireMaps, mapViewerUrl: mapViewerUrl };
})();
