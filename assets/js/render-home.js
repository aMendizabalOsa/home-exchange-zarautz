/* Portada: cabecera, bloque "Lo esencial" y tarjetas por categoría */
(function () {
  var strings, sections, wifi;
  var categoriesEl = document.getElementById("categories");
  var essentialsEl = document.getElementById("essentials");
  var esc = UI.esc;
  var mobileQuery = window.matchMedia("(max-width: 640px)");
  var openState = null; // categorías abiertas/cerradas por el usuario en esta visita

  Promise.all([
    UI.fetchJson("data/strings.json"),
    UI.fetchJson("data/sections.json"),
    UI.fetchJson("data/pages/wifi.json").catch(function () { return null; })
  ])
    .then(function (results) {
      strings = results[0];
      sections = results[1];
      wifi = findWifiBlock(results[2]);
      window.HE_STRINGS = strings;
      renderAll();
      I18N.onChange(renderAll);
      // Al pasar de móvil a escritorio (o al revés) se vuelve al estado por defecto
      var onResize = function () {
        openState = null;
        categoriesEl.innerHTML = "";
        renderCategories();
      };
      if (mobileQuery.addEventListener) mobileQuery.addEventListener("change", onResize);
      else if (mobileQuery.addListener) mobileQuery.addListener(onResize);
      I18N.ready();
    })
    .catch(function (err) {
      categoriesEl.innerHTML = "<p>No se ha podido cargar el contenido de la guía.</p>";
      I18N.ready();
      console.error(err);
    });

  function findWifiBlock(page) {
    if (!page) return null;
    var found = null;
    (page.blocks || []).forEach(function (b) { if (b.type === "wifi" && !found) found = b; });
    return found;
  }

  function isEnabled(slug) {
    return sections.categories.some(function (cat) {
      return cat.items.some(function (item) { return item.slug === slug && item.enabled !== false; });
    });
  }

  function renderAll() {
    renderChrome();
    renderEssentials();
    renderCategories();
  }

  function renderChrome() {
    document.title = I18N.t(strings.siteTitle);
    UI.setText("#site-title", I18N.t(strings.siteTitle));
    UI.setText("#site-tagline", I18N.t(strings.tagline));
    UI.setText("#site-footer-text", I18N.t(strings.footer));
    UI.setText("#map-cta-text", I18N.t(strings.mapCta));
    var hero = document.getElementById("hero");
    if (hero && strings.heroImage) {
      hero.classList.add("has-image");
      hero.style.backgroundImage = 'url("' + encodeURI(strings.heroImage) + '")';
    }
    UI.applyChrome(strings);
  }

  function renderEssentials() {
    var e = strings.essentials;
    if (!e || !essentialsEl) return;
    var html = '<h2 class="essentials-title" id="essentials-title">' + esc(I18N.t(e.title)) + "</h2>";
    html += '<div class="essentials-grid">';

    // Dirección + navegación en Google Maps
    html +=
      '<div class="essential">' +
        '<span class="essential-icon" aria-hidden="true">📍</span>' +
        '<div class="essential-body">' +
          '<span class="essential-label">' + esc(I18N.t(e.addressLabel)) + "</span>" +
          '<span class="essential-value">' + esc(I18N.t(e.address)) + "</span>" +
          '<a class="btn btn-primary" href="' + esc(e.directionsUrl) + '" target="_blank" rel="noopener">🧭 ' + esc(I18N.t(e.directionsButton)) + "</a>" +
        "</div>" +
      "</div>";

    // Cómo entrar
    html +=
      '<div class="essential">' +
        '<span class="essential-icon" aria-hidden="true">🔑</span>' +
        '<div class="essential-body">' +
          '<span class="essential-label">' + esc(I18N.t(e.entryLabel)) + "</span>" +
          '<span class="essential-value">' + I18N.t(e.entry) + "</span>" +
          '<a class="essential-more" href="page.html?slug=access">' + esc(I18N.t(e.entryMore)) + " →</a>" +
        "</div>" +
      "</div>";

    // Wi-Fi (se lee de data/pages/wifi.json para no duplicar la clave)
    if (wifi && isEnabled("wifi")) {
      html +=
        '<div class="essential">' +
          '<span class="essential-icon" aria-hidden="true">📶</span>' +
          '<div class="essential-body">' +
            '<span class="essential-label">' + esc(I18N.t(e.wifiLabel)) + "</span>" +
            '<span class="essential-value">' + esc(I18N.t(strings.wifiNetworkLabel)) + ": <code>" + esc(wifi.ssid) + "</code></span>" +
            '<span class="essential-value">' + esc(I18N.t(strings.wifiPasswordLabel)) + ": <code>" + esc(wifi.password) + "</code></span>" +
            '<a class="essential-more" href="page.html?slug=wifi">' + esc(I18N.t(e.wifiMore)) + " →</a>" +
          "</div>" +
        "</div>";
    }

    // Llamar / WhatsApp
    var contacts = (e.contacts || []).map(function (c) {
      var digits = String(c.phone).replace(/[^\d]/g, "");
      return (
        '<div class="contact-row">' +
          '<span class="contact-name">' + esc(c.name) + "</span>" +
          '<a class="btn btn-small" href="tel:' + esc(c.phone) + '" aria-label="' + esc(I18N.t(e.callButton) + " " + c.name) + '">📞 ' + esc(I18N.t(e.callButton)) + "</a>" +
          '<a class="btn btn-small btn-whatsapp" href="https://wa.me/' + digits + '" target="_blank" rel="noopener" aria-label="' + esc("WhatsApp " + c.name) + '">💬 ' + esc(I18N.t(e.whatsappButton)) + "</a>" +
        "</div>"
      );
    }).join("");
    if (contacts) {
      html +=
        '<div class="essential">' +
          '<span class="essential-icon" aria-hidden="true">📱</span>' +
          '<div class="essential-body">' +
            '<span class="essential-label">' + esc(I18N.t(e.contactLabel)) + "</span>" +
            contacts +
          "</div>" +
        "</div>";
    }
    html += "</div>";

    if (isEnabled("checkout")) {
      html += '<a class="essentials-checkout" href="page.html?slug=checkout">' + esc(I18N.t(e.checkoutLink)) + " →</a>";
    }
    essentialsEl.innerHTML = html;
  }

  // Recuerda qué categorías ha abierto/cerrado el usuario (para no perderlo al cambiar de idioma)
  function captureOpenState() {
    var details = categoriesEl.querySelectorAll("details.category");
    if (!details.length) return;
    openState = {};
    details.forEach(function (d) { openState[d.getAttribute("data-id")] = d.open; });
  }

  function renderCategories() {
    captureOpenState();
    var mobile = mobileQuery.matches;
    var html = "";

    sections.categories.forEach(function (cat) {
      var items = cat.items.filter(function (item) { return item.enabled !== false; });
      if (items.length === 0) return;

      var open = !mobile || cat.openOnMobile === true;
      if (openState && cat.id in openState) open = openState[cat.id];

      html += '<details class="category" data-id="' + esc(cat.id) + '"' + (open ? " open" : "") + ">";
      html +=
        '<summary class="category-summary">' +
          '<h2 class="category-title">' + esc(I18N.t(cat.name)) + "</h2>" +
          '<span class="category-count">' + items.length + "</span>" +
        "</summary>";
      html += '<div class="card-grid">';
      items.forEach(function (item) {
        html +=
          '<a class="card" href="page.html?slug=' + encodeURIComponent(item.slug) + '">' +
            '<span class="card-icon" aria-hidden="true">' + item.icon + "</span>" +
            '<span class="card-text">' +
              '<span class="card-title">' + esc(I18N.t(item.title)) + "</span>" +
              '<span class="card-subtitle">' + esc(I18N.t(item.subtitle)) + "</span>" +
            "</span>" +
          "</a>";
      });
      html += "</div></details>";
    });

    categoriesEl.innerHTML = html;
  }
})();
