/* Estado de idioma compartido por toda la web (es/en/fr).
   Se carga en el <head> para fijar el idioma antes de pintar nada. */
var I18N = (function () {
  var LANGS = ["es", "en", "fr"];
  var LABELS = { es: "ES", en: "EN", fr: "FR" };
  var NAMES = { es: "Español", en: "English", fr: "Français" };
  var listeners = [];

  function readSaved() {
    try { return localStorage.getItem("lang"); } catch (e) { return null; }
  }

  // Idioma preferido del navegador (p. ej. "fr-FR" -> "fr"), si lo soportamos
  function detectBrowserLang() {
    var prefs = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || ""];
    for (var i = 0; i < prefs.length; i++) {
      var code = String(prefs[i] || "").toLowerCase().split("-")[0];
      if (LANGS.indexOf(code) !== -1) return code;
    }
    return "es";
  }

  var current = (function () {
    var saved = readSaved();
    return LANGS.indexOf(saved) !== -1 ? saved : detectBrowserLang();
  })();

  function getLang() {
    return current;
  }

  function setLang(lang) {
    if (LANGS.indexOf(lang) === -1) return;
    current = lang;
    try { localStorage.setItem("lang", lang); } catch (e) { /* modo privado */ }
    document.documentElement.setAttribute("lang", lang);
    listeners.forEach(function (fn) { fn(lang); });
  }

  function onChange(fn) {
    listeners.push(fn);
  }

  // Traduce un campo tipo {es:"...", en:"...", fr:"..."} al idioma activo
  function t(field) {
    if (!field) return "";
    if (typeof field === "string") return field;
    return field[current] || field.es || field.en || "";
  }

  function renderSwitcher(container) {
    container.innerHTML = "";
    container.setAttribute("role", "group");
    container.setAttribute("aria-label", "Language / Idioma / Langue");
    LANGS.forEach(function (lang) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "lang-btn" + (lang === current ? " is-active" : "");
      btn.textContent = LABELS[lang];
      btn.setAttribute("lang", lang);
      btn.setAttribute("aria-label", NAMES[lang]);
      btn.setAttribute("aria-pressed", lang === current ? "true" : "false");
      btn.addEventListener("click", function () {
        setLang(lang);
        renderSwitcher(container);
      });
      container.appendChild(btn);
    });
  }

  // Mientras se cargan las traducciones, el HTML estático (en español) se
  // oculta para que no aparezca un instante antes de cambiar de idioma.
  var root = document.documentElement;
  root.setAttribute("lang", current);
  root.classList.add("i18n-loading");
  var fallback = setTimeout(ready, 3000);

  function ready() {
    clearTimeout(fallback);
    root.classList.remove("i18n-loading");
  }

  return { getLang: getLang, setLang: setLang, onChange: onChange, t: t, renderSwitcher: renderSwitcher, ready: ready, LANGS: LANGS };
})();
