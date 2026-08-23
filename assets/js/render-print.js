/* Versión completa imprimible / PDF (print.html), con código QR a la web publicada */
(function () {
  var strings, sections;
  var contentEl = document.getElementById("print-content");

  fetch("data/strings.json")
    .then(function (r) { return r.json(); })
    .then(function (s) {
      strings = s;
      window.HE_STRINGS = strings;
      return fetch("data/sections.json").then(function (r) { return r.json(); });
    })
    .then(function (sec) {
      sections = sec;
      var slugs = [];
      sections.categories.forEach(function (cat) {
        cat.items.forEach(function (item) { slugs.push(item.slug); });
      });
      return Promise.all(
        slugs.map(function (slug) {
          return fetch("data/pages/" + slug + ".json").then(function (r) { return r.json(); }).then(function (data) {
            return { slug: slug, data: data };
          });
        })
      );
    })
    .then(function (pages) {
      var pagesBySlug = {};
      pages.forEach(function (p) { pagesBySlug[p.slug] = p.data; });
      renderChrome();
      renderAll(pagesBySlug);
      renderQr();
      I18N.onChange(function () {
        renderChrome();
        renderAll(pagesBySlug);
      });
    })
    .catch(function (err) {
      contentEl.innerHTML = "<p>No se ha podido generar la versión imprimible.</p>";
      console.error(err);
    });

  function renderChrome() {
    document.title = I18N.t(strings.printTitle);
    setText("#print-title", I18N.t(strings.printTitle));
    setText("#print-intro", I18N.t(strings.printIntro));
    setText("#print-button", I18N.t(strings.printButton));
    setText("#qr-caption", I18N.t(strings.qrCaption));
    document.querySelectorAll("[data-nav-home]").forEach(function (el) { el.textContent = I18N.t(strings.navHome); });
    document.querySelectorAll("[data-nav-map]").forEach(function (el) { el.textContent = I18N.t(strings.navMap); });
    var switcher = document.getElementById("lang-switcher");
    if (switcher) I18N.renderSwitcher(switcher);
  }

  function setText(sel, text) {
    var el = document.querySelector(sel);
    if (el) el.textContent = text;
  }

  function renderAll(pagesBySlug) {
    var html = "";
    sections.categories.forEach(function (cat) {
      html += '<section class="print-category"><h2>' + I18N.t(cat.name) + "</h2>";
      cat.items.forEach(function (item) {
        var page = pagesBySlug[item.slug];
        if (!page) return;
        html += '<article class="print-page">';
        html += "<h3>" + (page.icon || "") + " " + I18N.t(page.title) + "</h3>";
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
          (block.images || []).map(function (img) { return '<img src="' + img.src + '" alt="' + I18N.t(img.caption) + '">'; }).join("") +
          "</div>"
        );
      case "map":
        return '<p class="print-map-note">🗺️ ' + I18N.t(window.HE_STRINGS.openMapLink) + "</p>";
      default:
        return "";
    }
  }

  function renderQr() {
    var el = document.getElementById("qr-code");
    if (!el || typeof qrcode === "undefined") return;
    var qr = qrcode(0, "L");
    qr.addData(strings.siteUrl);
    qr.make();
    el.innerHTML = qr.createImgTag(4, 8);
  }
})();
