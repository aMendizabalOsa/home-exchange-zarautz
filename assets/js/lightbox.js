/* Galería con zoom en vanilla JS, sin dependencias: teclado, botones y deslizar con el dedo */
var Lightbox = (function () {
  var overlay, imgEl, captionEl, counterEl, fullLink, prevBtn, nextBtn, closeBtn;
  var images = [], index = 0, lastFocus = null, touchX = null, touchY = null;

  function label(key, fallback) {
    var s = window.HE_STRINGS;
    return s && s[key] ? I18N.t(s[key]) : fallback;
  }

  function build() {
    overlay = document.createElement("div");
    overlay.className = "lightbox-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.innerHTML =
      '<button type="button" class="lightbox-close">✕</button>' +
      '<button type="button" class="lightbox-prev">‹</button>' +
      '<figure class="lightbox-figure">' +
      '<img class="lightbox-img" alt="">' +
      '<figcaption class="lightbox-caption"><span class="lightbox-text"></span> <span class="lightbox-counter"></span>' +
      '<a class="lightbox-full" target="_blank" rel="noopener"></a></figcaption>' +
      "</figure>" +
      '<button type="button" class="lightbox-next">›</button>';
    document.body.appendChild(overlay);

    imgEl = overlay.querySelector(".lightbox-img");
    captionEl = overlay.querySelector(".lightbox-text");
    counterEl = overlay.querySelector(".lightbox-counter");
    fullLink = overlay.querySelector(".lightbox-full");
    closeBtn = overlay.querySelector(".lightbox-close");
    prevBtn = overlay.querySelector(".lightbox-prev");
    nextBtn = overlay.querySelector(".lightbox-next");

    closeBtn.addEventListener("click", close);
    prevBtn.addEventListener("click", function () { show(index - 1); });
    nextBtn.addEventListener("click", function () { show(index + 1); });
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) close();
    });
    document.addEventListener("keydown", function (e) {
      if (!overlay.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(index - 1);
      if (e.key === "ArrowRight") show(index + 1);
    });

    // Deslizar con el dedo: izquierda/derecha cambia de foto, hacia abajo cierra
    overlay.addEventListener("touchstart", function (e) {
      if (e.touches.length !== 1) { touchX = null; return; }
      touchX = e.touches[0].clientX;
      touchY = e.touches[0].clientY;
    }, { passive: true });
    overlay.addEventListener("touchend", function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      var dy = e.changedTouches[0].clientY - touchY;
      touchX = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) && images.length > 1) {
        show(dx < 0 ? index + 1 : index - 1);
      } else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) {
        close();
      }
    });
  }

  function applyLabels() {
    closeBtn.setAttribute("aria-label", label("lightboxClose", "Cerrar"));
    prevBtn.setAttribute("aria-label", label("lightboxPrev", "Anterior"));
    nextBtn.setAttribute("aria-label", label("lightboxNext", "Siguiente"));
    fullLink.textContent = label("lightboxFull", "Ver a tamaño completo ↗");
  }

  function show(i) {
    index = (i + images.length) % images.length;
    var item = images[index];
    var caption = I18N.t(item.caption);
    imgEl.src = item.src;
    imgEl.alt = caption;
    captionEl.textContent = caption;
    counterEl.textContent = images.length > 1 ? "(" + (index + 1) + "/" + images.length + ")" : "";
    fullLink.href = item.src;
  }

  function open(imgs, startIndex) {
    if (!overlay) build();
    images = imgs;
    applyLabels();
    overlay.classList.toggle("is-single", images.length < 2);
    show(startIndex || 0);
    lastFocus = document.activeElement;
    overlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }

  function close() {
    overlay.classList.remove("is-open");
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  return { open: open };
})();
