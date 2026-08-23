# Guía de contenidos — cómo actualizar tu web

Toda la información de la guía vive en archivos `.json` dentro de la carpeta `data/`. Para actualizar contenido **no hace falta tocar HTML, CSS ni JS**: basta con editar estos archivos de texto. Puedes hacerlo con cualquier editor, o directamente en el navegador desde el propio GitHub (botón del lápiz ✏️ al ver el archivo en github.com), incluso desde el móvil.

## 1. Ver los cambios en tu ordenador antes de publicar

Los navegadores bloquean `fetch()` sobre archivos abiertos directamente con doble clic (`file://`). Para previsualizar la web necesitas un servidor local muy simple. Desde la carpeta del proyecto:

```bash
npx serve .
```

o, si tienes Python instalado:

```bash
python -m http.server 8000
```

y abre `http://localhost:3000` (o `:8000`) en el navegador.

## 2. Estructura del contenido

- `data/strings.json` — textos fijos de la interfaz (título del sitio, botones, etc.) y `siteUrl` (la URL final de tu web, usada para el código QR de `print.html`; actualízala tras el primer despliegue).
- `data/sections.json` — categorías y tarjetas de la portada. Cada tarjeta apunta a un `slug`.
- `data/pages/<slug>.json` — el contenido de cada página de detalle (icono, título y una lista de `blocks`).
- `data/map-points.json` — puntos que aparecen en el mapa (`map.html`).

Todos los textos siguen el mismo patrón: `{ "es": "...", "en": "...", "fr": "..." }`.

## 3. Añadir o editar una sección existente

Abre `data/pages/<slug>.json` y edita los textos de los bloques. Tipos de bloque disponibles:

- `paragraph` — un párrafo de texto: `{ "type": "paragraph", "text": { "es": "...", "en": "...", "fr": "..." } }`
- `info-box` — un aviso destacado con icono: `{ "type": "info-box", "icon": "💡", "text": {...} }`
- `gallery` — galería de fotos con zoom: `{ "type": "gallery", "images": [{ "src": "assets/images/kitchen/foto1.jpg", "caption": {...} }] }`
- `map` — mini-mapa embebido: `{ "type": "map", "zoom": 15, "points": [{ "lat": 43.28, "lng": -2.16, "icon": "🏠", "label": {...} }] }`

## 4. Añadir una sección completamente nueva

1. Crea `data/pages/mi-seccion.json` siguiendo el mismo formato que las demás.
2. Añade una tarjeta en `data/sections.json`, dentro de la categoría que corresponda:
   ```json
   { "slug": "mi-seccion", "icon": "🎉", "title": {...}, "subtitle": {...} }
   ```
3. Listo — aparecerá automáticamente en la portada, en el buscador y (si añades coordenadas) en el mapa.

## 5. Añadir fotos

Sube tus imágenes a `assets/images/<seccion>/` (crea la carpeta si no existe) y referencia la ruta en el bloque `gallery` del JSON correspondiente. Las imágenes de ejemplo en `assets/images/placeholders/` son solo marcadores de posición — puedes borrarlas cuando ya no las uses.

## 6. Publicar en GitHub Pages (gratis)

1. Sube esta carpeta a un repositorio de GitHub (puede ser público; los repos privados requieren un plan de pago para usar Pages).
2. En el repo: **Settings → Pages → Deploy from a branch**, elige la rama `main` y la carpeta `/ (root)`.
3. En unos minutos tu web estará en `https://TU-USUARIO.github.io/NOMBRE-REPO/`.
4. Actualiza `siteUrl` en `data/strings.json` con esa URL para que el QR de `print.html` apunte bien, y vuelve a publicar (`git commit` + `git push`).

## 7. Nota sobre privacidad

GitHub Pages gratis publica el sitio de forma **pública**: cualquiera con el enlace puede verlo. Ya se incluyen `robots.txt` y una etiqueta `noindex` para que no aparezca en buscadores, pero la URL en sí no es secreta. Como pediste, el código de la puerta y el wifi están escritos tal cual en `data/pages/access.json` y `data/pages/wifi.json` — recuerda sustituir los valores de ejemplo por los reales, y comparte el enlace solo con tus huéspedes.

Si en algún momento quieres añadir un filtro extra (no es seguridad real, solo disuade a curiosos), tienes listo `assets/js/access-gate.js`: cambia `PASSPHRASE` por el código que quieras y añade `<script src="assets/js/access-gate.js"></script>` como primer `<script>` en `index.html`, `page.html`, `map.html` y `print.html`.

## 8. Idiomas

El selector ES/EN/FR guarda la preferencia en el navegador del huésped (`localStorage`). Si algún campo se deja vacío en un idioma, la web usará automáticamente el texto en español como alternativa.
