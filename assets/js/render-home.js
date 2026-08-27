/* Portada: hero y grid de tarjetas por categoría */
(function () {
  var strings, sections;
  var categoriesEl = document.getElementById("categories");

  Promise.all([
    fetch("data/strings.json").then(function (r) { return r.json(); }),
    fetch("data/sections.json").then(function (r) { return r.json(); })
  ])
    .then(function (results) {
      strings = results[0];
      sections = results[1];
      window.HE_STRINGS = strings;
      renderChrome();
      renderCategories();
      I18N.onChange(function () {
        renderChrome();
        renderCategories();
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
    var switcher = document.getElementById("lang-switcher");
    if (switcher) I18N.renderSwitcher(switcher);
  }

  function setText(sel, text) {
    var el = document.querySelector(sel);
    if (el) el.textContent = text;
  }

  function renderCategories() {
    var html = "";

    sections.categories.forEach(function (cat) {
      var items = cat.items.filter(function (item) { return item.enabled !== false; });
      if (items.length === 0) return;

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
  }
})();
