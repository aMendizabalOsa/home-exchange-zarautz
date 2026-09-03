/* Motor de bloques para page.html: lee ?slug= y pinta data/pages/<slug>.json */
(function () {
  var slug = new URLSearchParams(location.search).get("slug");
  var contentEl = document.getElementById("page-content");
  var headerEl = document.getElementById("page-header");
  var strings, pageData;

  if (!slug) {
    contentEl.innerHTML = "<p>Falta el parámetro ?slug= en la URL.</p>";
    return;
  }

  Promise.all([
    fetch("data/strings.json").then(function (r) { return r.json(); }),
    fetch("data/sections.json").then(function (r) { return r.json(); }),
    fetch("data/pages/" + slug + ".json").then(function (r) {
      if (!r.ok) throw new Error("No existe data/pages/" + slug + ".json");
      return r.json();
    })
  ])
    .then(function (results) {
      strings = results[0];
      window.HE_STRINGS = strings;

      var isDisabled = results[1].categories.some(function (cat) {
        return cat.items.some(function (item) { return item.slug === slug && item.enabled === false; });
      });
      if (isDisabled) {
        renderChrome({ title: strings.notAvailableTitle });
        contentEl.innerHTML = "<p>" + I18N.t(strings.notAvailable) + "</p>";
        I18N.onChange(function () {
          contentEl.innerHTML = "<p>" + I18N.t(strings.notAvailable) + "</p>";
        });
        return;
      }

      pageData = results[2];
      renderChrome();
      renderContent();
      I18N.onChange(function () {
        renderChrome();
        renderContent();
      });
    })
    .catch(function (err) {
      contentEl.innerHTML = "<p>No se ha podido cargar esta sección (" + err.message + ").</p>";
      console.error(err);
    });

  function renderChrome(override) {
    document.title = I18N.t(override ? override.title : pageData.title);
    document.querySelectorAll("[data-nav-home]").forEach(function (el) { el.textContent = I18N.t(strings.navHome); });
    document.querySelectorAll("[data-nav-map]").forEach(function (el) { el.textContent = I18N.t(strings.navMap); });
    document.querySelectorAll("[data-nav-print]").forEach(function (el) { el.textContent = I18N.t(strings.navPrint); });
    document.querySelectorAll("[data-back-link]").forEach(function (el) { el.textContent = I18N.t(strings.backLink); });
    var switcher = document.getElementById("lang-switcher");
    if (switcher) I18N.renderSwitcher(switcher);
  }

  function renderContent() {
    var html = '<div class="subpage-header"><span class="subpage-icon">' + (pageData.icon || "") + "</span><h1>" + I18N.t(pageData.title) + "</h1></div>";
    html += '<div class="content-blocks">';
    (pageData.blocks || []).forEach(function (block, i) {
      html += renderBlock(block, i);
    });
    html += "</div>";
    contentEl.innerHTML = html;

    // Post-procesado: las galerías necesitan JS tras insertar el HTML
    (pageData.blocks || []).forEach(function (block, i) {
      if (block.type === "gallery") wireGallery(block, i);
    });
  }

  function renderBlock(block, i) {
    switch (block.type) {
      case "paragraph":
        return "<p>" + I18N.t(block.text) + "</p>";
      case "info-box":
        return '<div class="info-box"><span class="info-box-icon">' + (block.icon || "💡") + "</span><div>" + I18N.t(block.text) + "</div></div>";
      case "gallery":
        var imgs = (block.images || [])
          .map(function (img, idx) {
            return '<button type="button" class="gallery-thumb" data-block="' + i + '" data-index="' + idx + '"><img src="' + img.src + '" alt="' + I18N.t(img.caption) + '" loading="lazy"></button>';
          })
          .join("");
        return '<div class="gallery-grid">' + imgs + "</div>";
      case "map":
        return '<div class="page-map"><iframe src="' + (block.src || strings.myMapsEmbedUrl) + '" loading="lazy" title="Mapa" allowfullscreen></iframe></div>';
      case "wifi":
        return renderWifi(block);
      default:
        return "";
    }
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
    return qr.createImgTag(5, 12);
  }

  function qrEscape(value) {
    return String(value).replace(/([\\;,:"])/g, "\\$1");
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
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
