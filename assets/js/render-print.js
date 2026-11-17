/* Versión completa imprimible / PDF (print.html), con código QR a la web publicada */
(function () {
  var strings, sections, pagesBySlug;
  var contentEl = document.getElementById("print-content");
  var esc = UI.esc;

  Promise.all([UI.fetchJson("data/strings.json"), UI.fetchJson("data/sections.json")])
    .then(function (results) {
      strings = results[0];
      sections = results[1];
      window.HE_STRINGS = strings;
      var slugs = [];
      sections.categories.forEach(function (cat) {
        cat.items.forEach(function (item) { if (item.enabled !== false) slugs.push(item.slug); });
      });
      return Promise.all(
        slugs.map(function (slug) {
          return UI.fetchJson("data/pages/" + slug + ".json").then(function (data) {
            return { slug: slug, data: data };
          });
        })
      );
    })
    .then(function (pages) {
      pagesBySlug = {};
      pages.forEach(function (p) { pagesBySlug[p.slug] = p.data; });
      renderChrome();
      renderAll();
      renderQr();
      I18N.onChange(function () {
        renderChrome();
        renderAll();
      });
      I18N.ready();
    })
    .catch(function (err) {
      contentEl.innerHTML = "<p>No se ha podido generar la versión imprimible.</p>";
      I18N.ready();
      console.error(err);
    });

  function renderChrome() {
    document.title = I18N.t(strings.printTitle);
    UI.setText("#print-title", I18N.t(strings.printTitle));
    UI.setText("#print-intro", I18N.t(strings.printIntro));
    UI.setText("#print-button", I18N.t(strings.printButton));
    UI.setText("#qr-caption", I18N.t(strings.qrCaption));
    UI.applyChrome(strings);
  }

  function renderAll() {
    var html = "";
    sections.categories.forEach(function (cat) {
      var visibleItems = cat.items.filter(function (item) { return item.enabled !== false && pagesBySlug[item.slug]; });
      if (visibleItems.length === 0) return;
      html += '<section class="print-category"><h2>' + esc(I18N.t(cat.name)) + "</h2>";
      visibleItems.forEach(function (item) {
        var page = pagesBySlug[item.slug];
        html += '<article class="print-page">';
        html += "<h3>" + (page.icon || "") + " " + esc(I18N.t(page.title)) + "</h3>";
        (page.blocks || []).forEach(function (block) {
          html += renderPrintBlock(block);
        });
        html += "</article>";
      });
      html += "</section>";
    });
    contentEl.innerHTML = html;
  }

  function renderPrintBlock(block) {
    switch (block.type) {
      case "paragraph":
        return "<p>" + I18N.t(block.text) + "</p>";
      case "info-box":
        return '<div class="info-box"><span class="info-box-icon">' + (block.icon || "💡") + "</span><div>" + I18N.t(block.text) + "</div></div>";
      case "gallery":
        return (
          '<div class="gallery-grid print-gallery">' +
          (block.images || []).map(function (img) { return '<img src="' + esc(img.src) + '" alt="' + esc(I18N.t(img.caption)) + '">'; }).join("") +
          "</div>"
        );
      case "map":
        return '<p class="print-map-note">🗺️ ' + esc(I18N.t(strings.openMapLink)) + "</p>";
      case "wifi":
        return renderPrintWifi(block);
      case "places":
        return renderPrintPlaces(block);
      case "checklist":
        return (
          '<ul class="checklist print-checklist">' +
          (block.items || []).map(function (item) { return "<li>☐ " + I18N.t(item) + "</li>"; }).join("") +
          "</ul>"
        );
      default:
        return "";
    }
  }

  function renderPrintPlaces(block) {
    var html = block.title ? "<h4>" + (block.icon || "") + " " + esc(I18N.t(block.title)) + "</h4>" : "";
    html += '<ul class="print-places">';
    (block.items || []).forEach(function (place) {
      html +=
        "<li><strong>" + esc(I18N.t(place.name)) + "</strong>" +
        (place.tag ? " · " + esc(I18N.t(place.tag)) : "") +
        (place.text ? " — " + I18N.t(place.text) : "") +
        "</li>";
    });
    return html + "</ul>";
  }

  function renderPrintWifi(block) {
    var netLabel = I18N.t(strings.wifiNetworkLabel);
    var passLabel = I18N.t(strings.wifiPasswordLabel);
    var qrHtml = "";
    if (typeof qrcode !== "undefined") {
      var payload =
        "WIFI:T:" + (block.encryption || "WPA") +
        ";S:" + qrEscape(block.ssid) +
        ";P:" + qrEscape(block.password) +
        ";;";
      var qr = qrcode(0, "M");
      qr.addData(payload);
      qr.make();
      qrHtml = qr.createImgTag(5, 12, "QR Wi-Fi");
    }
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

  function qrEscape(value) {
    return String(value).replace(/([\\;,:"])/g, "\\$1");
  }

  function renderQr() {
    var el = document.getElementById("qr-code");
    if (!el || typeof qrcode === "undefined") return;
    var qr = qrcode(0, "L");
    qr.addData(strings.siteUrl);
    qr.make();
    el.innerHTML = qr.createImgTag(4, 8, "QR");
  }
})();
