/* Estado de idioma compartido por toda la web (es/en/fr) */
var I18N = (function () {
  var LANGS = ["es", "en", "fr"];
  var LABELS = { es: "ES", en: "EN", fr: "FR" };
  var listeners = [];

  function getLang() {
    var saved = localStorage.getItem("lang");
    return LANGS.indexOf(saved) !== -1 ? saved : "es";
  }

  function setLang(lang) {
    if (LANGS.indexOf(lang) === -1) return;
    localStorage.setItem("lang", lang);
    document.documentElement.setAttribute("lang", lang);
    listeners.forEach(function (fn) { fn(lang); });
  }

  function onChange(fn) {
    listeners.push(fn);
  }

  // Traduce un campo tipo {es:"...", en:"...", fr:"..."} al idioma activo
  function t(field) {
    if (!field) return "";
    var lang = getLang();
    return field[lang] || field.es || field.en || "";
  }

  function renderSwitcher(container) {
    container.innerHTML = "";
    var current = getLang();
    LANGS.forEach(function (lang) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "lang-btn" + (lang === current ? " is-active" : "");
      btn.textContent = LABELS[lang];
      btn.setAttribute("aria-label", "Language: " + LABELS[lang]);
      btn.addEventListener("click", function () {
        setLang(lang);
        renderSwitcher(container);
      });
      container.appendChild(btn);
    });
  }

  document.documentElement.setAttribute("lang", getLang());

  return { getLang: getLang, setLang: setLang, onChange: onChange, t: t, renderSwitcher: renderSwitcher, LANGS: LANGS };
})();
