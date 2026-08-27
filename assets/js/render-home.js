/* Portada: hero, grid de tarjetas por categoría y buscador en vivo */
(function () {
  var strings, sections;
  var categoriesEl = document.getElementById("categories");
  var searchInput = document.getElementById("search-input");
  var noResultsEl = document.getElementById("no-results");

  Promise.all([
    fetch("data/strings.json").then(function (r) { return r.json(); }),
    fetch("data/sections.json").then(function (r) { return r.json(); })
  ])
    .then(function (results) {
      strings = results[0];
      sections = results[1];
      window.HE_STRINGS = strings;
      renderChrome();
      renderCategories("");
      wireFloorPlan();
      I18N.onChange(function () {
        renderChrome();
        renderCategories(searchInput.value);
      });
      searchInput.addEventListener("input", function () {
        renderCategories(searchInput.value);
      });
    })
    .catch(function (err) {
      categoriesEl.innerHTML = "<p>No se ha podido cargar el contenido de la guía.</p>";
      console.error(err);
    });

  function renderChrome() {
    document.title = I18N.t(strings.siteTitle);
    setText("#site-title", I18N.t(strings.siteTitle));
    setText("#site-tagline", I18N.t(strings.tagline));
    setText("#site-footer", I18N.t(strings.footer));
    setText("#floor-plan-title", I18N.t(strings.floorPlanTitle));
    setText("#floor-plan-caption", I18N.t(strings.floorPlanCaption));
    searchInput.placeholder = I18N.t(strings.searchPlaceholder);
    noResultsEl.textContent = I18N.t(strings.noResults);
    document.querySelectorAll("[data-nav-map]").forEach(function (el) { el.textContent = I18N.t(strings.navMap); });
    document.querySelectorAll("[data-nav-print]").forEach(function (el) { el.textContent = I18N.t(strings.navPrint); });
    var switcher = document.getElementById("lang-switcher");
    if (switcher) I18N.renderSwitcher(switcher);
  }

  function setText(sel, text) {
    var el = document.querySelector(sel);
    if (el) el.textContent = text;
  }

  function wireFloorPlan() {
    var trigger = document.getElementById("floor-plan-trigger");
    if (!trigger) return;
    trigger.addEventListener("click", function () {
      Lightbox.open([{ src: "assets/images/plano-casa.png", caption: strings.floorPlanTitle }], 0);
    });
  }

  function renderCategories(query) {
    var q = (query || "").trim().toLowerCase();
    var totalMatches = 0;
    var html = "";

    sections.categories.forEach(function (cat) {
      var items = cat.items.filter(function (item) {
        if (item.enabled === false) return false;
        if (!q) return true;
        var haystack = (I18N.t(item.title) + " " + I18N.t(item.subtitle)).toLowerCase();
        return haystack.indexOf(q) !== -1;
      });
      if (items.length === 0) return;
      totalMatches += items.length;

      html += '<section class="category">';
      html += '<h2 class="category-title">' + I18N.t(cat.name) + "</h2>";
      html += '<div class="card-grid">';
      items.forEach(function (item) {
        html +=
          '<a class="card" href="page.html?slug=' + item.slug + '">' +
          '<span class="card-icon">' + item.icon + "</span>" +
          '<span class="card-title">' + I18N.t(item.title) + "</span>" +
          '<span class="card-subtitle">' + I18N.t(item.subtitle) + "</span>" +
          "</a>";
      });
      html += "</div></section>";
    });

    categoriesEl.innerHTML = html;
    noResultsEl.hidden = totalMatches !== 0 || !q;
  }
})();
