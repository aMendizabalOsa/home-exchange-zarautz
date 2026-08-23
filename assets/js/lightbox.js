/* Galería con zoom en vanilla JS, sin dependencias */
var Lightbox = (function () {
  var overlay, imgEl, captionEl, images = [], index = 0;

  function build() {
    overlay = document.createElement("div");
    overlay.className = "lightbox-overlay";
    overlay.innerHTML =
      '<button class="lightbox-close" aria-label="Cerrar">✕</button>' +
      '<button class="lightbox-prev" aria-label="Anterior">‹</button>' +
      '<figure class="lightbox-figure">' +
      '<img class="lightbox-img" alt="">' +
      '<figcaption class="lightbox-caption"></figcaption>' +
      "</figure>" +
      '<button class="lightbox-next" aria-label="Siguiente">›</button>';
    document.body.appendChild(overlay);

    imgEl = overlay.querySelector(".lightbox-img");
    captionEl = overlay.querySelector(".lightbox-caption");

    overlay.querySelector(".lightbox-close").addEventListener("click", close);
    overlay.querySelector(".lightbox-prev").addEventListener("click", function () { show(index - 1); });
    overlay.querySelector(".lightbox-next").addEventListener("click", function () { show(index + 1); });
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) close();
    });
    document.addEventListener("keydown", function (e) {
      if (!overlay.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(index - 1);
      if (e.key === "ArrowRight") show(index + 1);
    });
  }

  function show(i) {
    index = (i + images.length) % images.length;
    var item = images[index];
    imgEl.src = item.src;
    captionEl.textContent = I18N.t(item.caption);
  }

  function open(imgs, startIndex) {
    if (!overlay) build();
    images = imgs;
    show(startIndex || 0);
    overlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function close() {
    overlay.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  return { open: open };
})();
