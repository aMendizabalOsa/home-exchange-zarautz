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

- `data/strings.json` — textos fijos de la interfaz (título del sitio, botones, etc.), `siteUrl` (la URL final de tu web, usada para el código QR de `print.html`) y `myMapsEmbedUrl` (el mapa de Google My Maps que se muestra en toda la guía — ver punto 4).
- `data/sections.json` — categorías y tarjetas de la portada. Cada tarjeta apunta a un `slug`.
- `data/pages/<slug>.json` — el contenido de cada página de detalle (icono, título y una lista de `blocks`).

Todos los textos siguen el mismo patrón: `{ "es": "...", "en": "...", "fr": "..." }`.

## 3. Añadir o editar una sección existente

Abre `data/pages/<slug>.json` y edita los textos de los bloques. Tipos de bloque disponibles:

- `paragraph` — un párrafo de texto: `{ "type": "paragraph", "text": { "es": "...", "en": "...", "fr": "..." } }`
- `info-box` — un aviso destacado con icono: `{ "type": "info-box", "icon": "💡", "text": {...} }`
- `gallery` — galería de fotos con zoom: `{ "type": "gallery", "images": [{ "src": "assets/images/kitchen/foto1.jpg", "caption": {...} }] }`
- `map` — inserta tu mapa de Google My Maps: `{ "type": "map" }` (no lleva más campos; ver punto 4).

## 4. El mapa (Google My Maps)

Toda la guía usa un único mapa de [Google My Maps](https://www.google.com/mymaps), guardado en `myMapsEmbedUrl` dentro de `data/strings.json`. Aparece tanto en la página "Mapa" como en cualquier bloque `{ "type": "map" }` de una sección.

- **Para añadir o mover puntos** (playa, restaurantes, Getaria...): edita el mapa directamente en [Google My Maps](https://www.google.com/mymaps) con tu cuenta de Google — los cambios se reflejan solos en la web, sin tocar ningún archivo.
- **Importante**: el mapa debe seguir compartido como "Cualquier persona con el enlace puede ver" (o público). Si lo pones en privado, a los huéspedes les aparecerá un error o un aviso para iniciar sesión en vez del mapa.
- **Si alguna vez creas un mapa nuevo** en My Maps, coge el `mid` de su URL de edición (`.../edit?mid=XXXXX&usp=sharing`) y actualiza `myMapsEmbedUrl` en `data/strings.json` con `https://www.google.com/maps/d/embed?mid=XXXXX`.

## 5. Añadir una sección completamente nueva

1. Crea `data/pages/mi-seccion.json` siguiendo el mismo formato que las demás.
2. Añade una tarjeta en `data/sections.json`, dentro de la categoría que corresponda:
   ```json
   { "slug": "mi-seccion", "icon": "🎉", "title": {...}, "subtitle": {...} }
   ```
3. Listo — aparecerá automáticamente en la portada.

## 6. Añadir fotos

Sube tus imágenes a `assets/images/<seccion>/` (crea la carpeta si no existe) y referencia la ruta en el bloque `gallery` del JSON correspondiente. Las imágenes de ejemplo en `assets/images/placeholders/` son solo marcadores de posición — puedes borrarlas cuando ya no las uses. El plano de la casa que aparece en la portada es `assets/images/plano-casa.png`; para cambiarlo, sustituye ese archivo por otro con el mismo nombre.

## 7. Activar o desactivar secciones según el intercambio

Algunas cosas (coche, bicis, tablas de surf...) no están disponibles en todos los intercambios. En `data/sections.json`, cualquier tarjeta puede llevar `"enabled": false` para ocultarla temporalmente:

```json
{ "slug": "car", "enabled": false, "icon": "🚙", "title": {...}, "subtitle": {...} }
```

Al ponerlo en `false`:
- Desaparece de la portada y de la versión imprimible/PDF.
- Si alguien entra directamente a su enlace (por ejemplo, un huésped anterior con la página guardada), verá un aviso de "no disponible" en vez del contenido.
- El archivo `data/pages/<slug>.json` no se borra: basta con volver a poner `"enabled": true` para reactivarlo en el próximo intercambio.

Si un elemento no lleva el campo `enabled`, se considera activado por defecto.

## 8. Publicar en GitHub Pages (gratis)

1. Sube esta carpeta a un repositorio de GitHub (puede ser público; los repos privados requieren un plan de pago para usar Pages).
2. En el repo: **Settings → Pages → Deploy from a branch**, elige la rama `main` y la carpeta `/ (root)`.
3. En unos minutos tu web estará en `https://TU-USUARIO.github.io/NOMBRE-REPO/`.
4. Actualiza `siteUrl` en `data/strings.json` con esa URL para que el QR de `print.html` apunte bien, y vuelve a publicar (`git commit` + `git push`).

## 9. Nota sobre privacidad

GitHub Pages gratis publica el sitio de forma **pública**: cualquiera con el enlace puede verlo. Ya se incluyen `robots.txt` y una etiqueta `noindex` para que no aparezca en buscadores, pero la URL en sí no es secreta. Como pediste, el código de la puerta y el wifi están escritos tal cual en `data/pages/access.json` y `data/pages/wifi.json` — recuerda sustituir los valores de ejemplo por los reales, y comparte el enlace solo con tus huéspedes.

Si en algún momento quieres añadir un filtro extra (no es seguridad real, solo disuade a curiosos), tienes listo `assets/js/access-gate.js`: cambia `PASSPHRASE` por el código que quieras y añade `<script src="assets/js/access-gate.js"></script>` como primer `<script>` en `index.html`, `page.html`, `map.html` y `print.html`.

Tu mapa de Google My Maps sigue la misma lógica: para que se vea en la web tiene que estar compartido como público/"cualquiera con el enlace", así que evita poner ahí datos que no quieras que sean accesibles para quien encuentre la URL de la guía.

## 10. Idiomas

El selector ES/EN/FR guarda la preferencia en el navegador del huésped (`localStorage`). Si algún campo se deja vacío en un idioma, la web usará automáticamente el texto en español como alternativa.
