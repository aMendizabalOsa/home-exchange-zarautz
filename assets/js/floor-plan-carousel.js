/* Carrusel de imágenes de la portada (plano de la casa / plano del garaje):
   puntos para seleccionar y deslizar con el dedo en móvil */
(function () {
  var carousel = document.getElementById("floor-plan-carousel");
  if (!carousel) return;

  var viewport = carousel.querySelector(".carousel-viewport");
  var track = carousel.querySelector(".carousel-track");
  var images = carousel.querySelectorAll(".carousel-track img");
  var dots = carousel.querySelectorAll(".carousel-dot");
  var index = 0;
  var startX = null;

  function applyHeight() {
    var img = images[index];
    var ratio = img.naturalWidth / img.naturalHeight;
    if (ratio) viewport.style.height = viewport.clientWidth / ratio + "px";
  }

  function updateHeight() {
    var img = images[index];
    if (img.complete && img.naturalWidth) applyHeight();
    else img.addEventListener("load", applyHeight, { once: true });
  }

  function goTo(i) {
    index = Math.max(0, Math.min(i, dots.length - 1));
    track.style.transform = "translateX(-" + index * 100 + "%)";
    dots.forEach(function (dot, di) {
      dot.classList.toggle("is-active", di === index);
    });
    updateHeight();
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      goTo(parseInt(dot.getAttribute("data-index"), 10));
    });
  });

  track.addEventListener("touchstart", function (e) {
    startX = e.touches[0].clientX;
  });

  track.addEventListener("touchend", function (e) {
    if (startX === null) return;
    var delta = e.changedTouches[0].clientX - startX;
    startX = null;
    if (Math.abs(delta) < 40) return;
    goTo(delta < 0 ? index + 1 : index - 1);
  });

  window.addEventListener("resize", updateHeight);

  updateHeight();
})();
