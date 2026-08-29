/* Página de mapa completo (map.html): incrusta el Google My Maps del usuario */
(function () {
  var strings;

  fetch("data/strings.json")
    .then(function (r) { return r.json(); })
    .then(function (s) {
      strings = s;
      window.HE_STRINGS = strings;
      renderChrome();
      renderMap();
      I18N.onChange(renderChrome);
    })
    .catch(function (err) {
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

  function renderMap() {
    var el = document.getElementById("full-map");
    if (!el || !strings.myMapsEmbedUrl) return;
    el.innerHTML = '<iframe src="' + strings.myMapsEmbedUrl + '" loading="lazy" title="Mapa" allowfullscreen></iframe>';
  }
})();
