/**
 * Pantalla opcional de código de acceso (NO es seguridad real).
 *
 * GitHub Pages gratis solo publica sitios públicos, así que cualquiera con
 * el enlace puede llegar a ver el HTML/JS aunque esta pantalla esté activa
 * (basta con mirar el código fuente). Sirve solo como filtro básico para
 * que no cualquiera que pase por la URL vea el contenido a simple vista.
 *
 * Para activarla:
 *  1. Cambia PASSPHRASE por el código que quieras compartir con tus huéspedes.
 *  2. Añade <script src="assets/js/access-gate.js"></script> antes del
 *     resto de scripts en index.html, page.html, map.html y print.html.
 */
(function () {
  var PASSPHRASE = "zarautz2024"; // cámbialo por tu propio código
  var STORAGE_KEY = "he-access-granted";

  if (sessionStorage.getItem(STORAGE_KEY) === "1") return;

  document.documentElement.style.visibility = "hidden";

  document.addEventListener("DOMContentLoaded", function () {
    var overlay = document.createElement("div");
    overlay.className = "access-gate-overlay";
    overlay.innerHTML =
      '<form class="access-gate-form">' +
      '<p>🔒 Introduce el código que te hemos compartido</p>' +
      '<input type="password" autocomplete="off" required>' +
      '<button type="submit">Entrar</button>' +
      '<p class="access-gate-error" hidden>Código incorrecto, inténtalo de nuevo.</p>' +
      "</form>";
    document.body.appendChild(overlay);
    document.documentElement.style.visibility = "visible";

    var form = overlay.querySelector("form");
    var input = overlay.querySelector("input");
    var error = overlay.querySelector(".access-gate-error");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (input.value === PASSPHRASE) {
        sessionStorage.setItem(STORAGE_KEY, "1");
        overlay.remove();
      } else {
        error.hidden = false;
        input.value = "";
        input.focus();
      }
    });
  });
})();
