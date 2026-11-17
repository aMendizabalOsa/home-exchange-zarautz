/* Motor de bloques para page.html: lee ?slug= y pinta data/pages/<slug>.json */
(function () {
  var slug = new URLSearchParams(location.search).get("slug");
  var contentEl = document.getElementById("page-content");
  var pagerEl = document.getElementById("page-pager");
  var strings, sections, pageData;
  var esc = UI.esc;

  if (!slug) {
    contentEl.innerHTML = "<p>Falta el parámetro ?slug= en la URL.</p>";
    I18N.ready();
    return;
  }

  Promise.all([
    UI.fetchJson("data/strings.json"),
    UI.fetchJson("data/sections.json"),
    UI.fetchJson("data/pages/" + slug + ".json")
  ])
    .then(function (results) {
      strings = results[0];
      sections = results[1];
      window.HE_STRINGS = strings;

      var isDisabled = sections.categories.some(function (cat) {
        return cat.items.some(function (item) { return item.slug === slug && item.enabled === false; });
      });
      if (isDisabled) {
        var renderDisabled = function () {
          renderChrome({ title: strings.notAvailableTitle });
          contentEl.innerHTML = "<p>" + I18N.t(strings.notAvailable) + "</p>";
        };
        renderDisabled();
        I18N.onChange(renderDisabled);
        I18N.ready();
        return;
      }

      pageData = results[2];
      renderAll();
      I18N.onChange(renderAll);
      I18N.ready();
    })
    .catch(function (err) {
      contentEl.innerHTML = "<p>No se ha podido cargar esta sección (" + esc(err.message) + ").</p>";
      I18N.ready();
      console.error(err);
    });

  function renderAll() {
    renderChrome();
    renderContent();
    renderPager();
  }

  function renderChrome(override) {
    document.title = I18N.t(override ? override.title : pageData.title);
    UI.applyChrome(strings);
  }

  // Lista ordenada de secciones activas, tal y como aparecen en la portada
  function orderedItems() {
    var list = [];
    sections.categories.forEach(function (cat) {
      cat.items.forEach(function (item) { if (item.enabled !== false) list.push(item); });
    });
    return list;
  }

  function renderPager() {
    if (!pagerEl) return;
    var list = orderedItems();
    var pos = list.map(function (it) { return it.slug; }).indexOf(slug);
    if (pos === -1) { pagerEl.innerHTML = ""; return; }
    var prev = list[pos - 1], next = list[pos + 1];
    function link(item, cls, labelKey) {
      if (!item) return '<span class="pager-spacer"></span>';
      return (
        '<a class="pager-link ' + cls + '" href="page.html?slug=' + encodeURIComponent(item.slug) + '">' +
          '<span class="pager-label">' + esc(I18N.t(strings[labelKey])) + "</span>" +
          '<span class="pager-title">' + (cls === "pager-prev" ? "← " : "") + item.icon + " " + esc(I18N.t(item.title)) + (cls === "pager-next" ? " →" : "") + "</span>" +
        "</a>"
      );
    }
    pagerEl.innerHTML = link(prev, "pager-prev", "prevLabel") + link(next, "pager-next", "nextLabel");
  }

  function renderContent() {
    var html = '<div class="subpage-header"><span class="subpage-icon" aria-hidden="true">' + (pageData.icon || "") + "</span><h1>" + I18N.t(pageData.title) + "</h1></div>";
    html += '<div class="content-blocks">';
    (pageData.blocks || []).forEach(function (block, i) {
      html += renderBlock(block, i);
    });
    html += "</div>";
    contentEl.innerHTML = html;

    // Post-procesado: galerías, mapas y listas necesitan JS tras insertar el HTML
    (pageData.blocks || []).forEach(function (block, i) {
      if (block.type === "gallery") wireGallery(block, i);
      if (block.type === "checklist") wireChecklist(i);
    });
    UI.wireMaps(contentEl);
  }

  function renderBlock(block, i) {
    switch (block.type) {
      case "paragraph":
        return "<p>" + I18N.t(block.text) + "</p>";
      case "info-box":
        return '<div class="info-box"><span class="info-box-icon" aria-hidden="true">' + (block.icon || "💡") + "</span><div>" + I18N.t(block.text) + "</div></div>";
      case "gallery":
        return renderGallery(block, i);
      case "map":
        return UI.mapHtml(block.src || strings.myMapsEmbedUrl, strings, "page-map");
      case "wifi":
        return renderWifi(block);
      case "places":
        return renderPlaces(block);
      case "checklist":
        return renderChecklist(block, i);
      default:
        return "";
    }
  }

  function renderGallery(block, i) {
    var images = block.images || [];
    var imgs = images
      .map(function (img, idx) {
        var caption = I18N.t(img.caption);
        return (
          '<button type="button" class="gallery-thumb" data-block="' + i + '" data-index="' + idx + '" aria-label="' + esc(caption) + '">' +
            '<img src="' + esc(img.src) + '" alt="' + esc(caption) + '" loading="lazy">' +
            (block.layout === "full" ? '<span class="gallery-caption">' + esc(caption) + "</span>" : "") +
          "</button>"
        );
      })
      .join("");
    var cls = "gallery-grid";
    if (images.length === 1) cls += " gallery-single";
    if (block.layout === "full") cls += " gallery-full";
    return '<div class="' + cls + '">' + imgs + "</div>";
  }

  // Tarjetas de sitios (restaurantes, excursiones...): nombre, etiqueta, texto y enlaces
  function renderPlaces(block) {
    var html = '<section class="places">';
    if (block.title) {
      html += '<h2 class="block-title">' + (block.icon ? '<span aria-hidden="true">' + block.icon + "</span> " : "") + esc(I18N.t(block.title)) + "</h2>";
    }
    html += '<ul class="place-list">';
    (block.items || []).forEach(function (place) {
      var links = (place.links || []).map(function (l) {
        var external = /^https?:/.test(l.href);
        return '<a href="' + esc(l.href) + '"' + (external ? ' target="_blank" rel="noopener"' : "") + ">" + esc(I18N.t(l.label)) + "</a>";
      });
      if (place.maps) {
        links.unshift(
          '<a href="https://www.google.com/maps/search/?api=1&amp;query=' + encodeURIComponent(place.maps) + '" target="_blank" rel="noopener">' +
          esc(I18N.t(strings.placeMapLink)) + "</a>"
        );
      }
      html +=
        '<li class="place-card">' +
          '<div class="place-head">' +
            '<h3 class="place-name">' + esc(I18N.t(place.name)) + "</h3>" +
            (place.tag ? '<span class="place-tag">' + esc(I18N.t(place.tag)) + "</span>" : "") +
          "</div>" +
          (place.text ? '<p class="place-text">' + I18N.t(place.text) + "</p>" : "") +
          (links.length ? '<div class="place-links">' + links.join("") + "</div>" : "") +
        "</li>";
    });
    html += "</ul></section>";
    return html;
  }

  // Lista de comprobación; las marcas se guardan en este navegador
  function checklistKey(i) {
    return "checklist:" + slug + ":" + i;
  }

  function readChecks(i) {
    try { return JSON.parse(localStorage.getItem(checklistKey(i)) || "[]"); } catch (e) { return []; }
  }

  function renderChecklist(block, i) {
    var checked = readChecks(i);
    var html = '<ul class="checklist" data-checklist="' + i + '">';
    (block.items || []).forEach(function (item, idx) {
      var id = "chk-" + i + "-" + idx;
      var on = checked.indexOf(idx) !== -1;
      html +=
        '<li class="checklist-item' + (on ? " is-done" : "") + '">' +
          '<input type="checkbox" id="' + id + '" data-index="' + idx + '"' + (on ? " checked" : "") + ">" +
          '<label for="' + id + '">' + I18N.t(item) + "</label>" +
        "</li>";
    });
    html += "</ul>";
    html += '<p class="checklist-hint">' + esc(I18N.t(strings.checklistHint)) + "</p>";
    return html;
  }

  function wireChecklist(i) {
    var list = contentEl.querySelector('[data-checklist="' + i + '"]');
    if (!list) return;
    list.addEventListener("change", function () {
      var done = [];
      list.querySelectorAll("input[type=checkbox]").forEach(function (box) {
        box.closest(".checklist-item").classList.toggle("is-done", box.checked);
        if (box.checked) done.push(parseInt(box.getAttribute("data-index"), 10));
      });
      try { localStorage.setItem(checklistKey(i), JSON.stringify(done)); } catch (e) { /* sin almacenamiento */ }
    });
  }

  function renderWifi(block) {
    var netLabel = I18N.t(strings.wifiNetworkLabel);
    var passLabel = I18N.t(strings.wifiPasswordLabel);
    var qrHtml = wifiQrImg(block);
    return (
      '<div class="wifi-card">' +
        '<div class="wifi-card-info">' +
          '<div class="wifi-field"><span class="wifi-label">' + esc(netLabel) + '</span><span class="wifi-value">' + esc(block.ssid) + "</span></div>" +
          '<div class="wifi-field"><span class="wifi-label">' + esc(passLabel) + '</span><span class="wifi-value">' + esc(block.password) + "</span></div>" +
        "</div>" +
        (qrHtml ? '<div class="wifi-card-qr">' + qrHtml + "</div>" : "") +
      "</div>"
    );
  }

  // Genera el <img> del código QR "WIFI:" (formato estándar que leen las cámaras)
  function wifiQrImg(block) {
    if (typeof qrcode === "undefined") return "";
    var payload =
      "WIFI:T:" + (block.encryption || "WPA") +
      ";S:" + qrEscape(block.ssid) +
      ";P:" + qrEscape(block.password) +
      ";;";
    var qr = qrcode(0, "M");
    qr.addData(payload);
    qr.make();
    return qr.createImgTag(5, 12, "QR Wi-Fi");
  }

  function qrEscape(value) {
    return String(value).replace(/([\\;,:"])/g, "\\$1");
  }

  function wireGallery(block, i) {
    var buttons = contentEl.querySelectorAll('.gallery-thumb[data-block="' + i + '"]');
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        Lightbox.open(block.images, parseInt(btn.getAttribute("data-index"), 10));
      });
    });
  }
})();
