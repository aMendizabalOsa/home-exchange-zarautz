/* Página de mapa completo (map.html): incrusta el Google My Maps del usuario */
(function () {
  var strings;
  var mapEl = document.getElementById("full-map");

  UI.fetchJson("data/strings.json")
    .then(function (s) {
      strings = s;
      window.HE_STRINGS = strings;
      render();
      I18N.onChange(render);
      I18N.ready();
    })
    .catch(function (err) {
      mapEl.innerHTML = "<p>No se ha podido cargar el mapa.</p>";
      I18N.ready();
      console.error(err);
    });

  function render() {
    document.title = I18N.t(strings.mapTitle);
    UI.setText("#map-title", I18N.t(strings.mapTitle));
    UI.setText("#map-intro", I18N.t(strings.mapIntro));
    UI.applyChrome(strings);
    if (strings.myMapsEmbedUrl) {
      mapEl.innerHTML = UI.mapHtml(strings.myMapsEmbedUrl, strings, "full-map");
      UI.wireMaps(mapEl);
    }
  }
})();
