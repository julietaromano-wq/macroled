# Instalar la Home de Macroled en Webflow

Esta entrega usa Webflow como plataforma de publicación. La Home vive dentro de `#macroled-home`; no hace falta reconstruir sus secciones en el Designer ni usar CMS o Tabs de Webflow.

## Opción sin CDN: un único Embed

Si no podés publicar archivos externos, copiá todo el contenido de `macroled-home-all-in-one.html` dentro de un único **Code Embed**. Ya contiene HTML, CSS, JavaScript, poster y placeholders. No hace falta agregar nada en el `<head>` ni antes de `</body>`.

El video final no está incluido porque todavía no existe. Cuando esté disponible, subilo a Webflow y reemplazá las rutas `assets/video/macroled-hero.webm` y `assets/video/macroled-hero.mp4` por las URLs que entregue Webflow.

Si Webflow informa que el Embed supera su límite de caracteres, será necesario dividirlo en dos o tres bloques de Custom Code, o usar archivos externos. La implementación sigue siendo la misma.

## 1. Publicar los archivos externos

Los archivos `macroled-home.css` y `macroled-home.js` deben tener una URL HTTPS pública. Webflow no funciona como alojamiento general de `.css` y `.js`; se recomienda un CDN estático (por ejemplo Cloudflare Pages, Netlify, GitHub Pages o el hosting habitual de la empresa). Publicá también las carpetas `assets/images` y `assets/video`.

Para una prueba rápida se pueden pegar CSS y JS en Custom Code, pero no es recomendable para mantenimiento ni por los límites de tamaño de Webflow.

## 2. Cargar el CSS en el `<head>`

En **Site settings → Custom code → Head code**, o en los ajustes de Custom Code de esta página, pegá:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://TU-CDN/macroled-home.css">
```

Reemplazá `https://TU-CDN/` por la URL pública real.

## 3. Pegar el markup

En la página Home agregá un único **Code Embed**. Copiá dentro todo el contenido de `macroled-home-embed.html`. Ese archivo no contiene `<html>`, `<head>` ni `<body>`.

## 4. Cargar JavaScript antes de `</body>`

En **Page settings → Custom code → Before `</body>` tag** pegá:

```html
<script src="https://TU-CDN/macroled-home.js" defer></script>
```

Publicá el sitio; el Designer no siempre ejecuta el código de la misma manera que la URL publicada.

## 5. Reemplazar imágenes y video

Todas las rutas que empiezan con `assets/` necesitan una URL pública en Webflow. La opción más simple es conservar la misma estructura de carpetas junto al CSS y el JS y reemplazar las rutas en `js/config.js` por URLs absolutas.

- Hero MP4: `assets/video/macroled-hero.mp4`
- Hero WebM opcional: `assets/video/macroled-hero.webm`
- Poster: `assets/images/hero-poster.webp`
- Imágenes editoriales: cambiar cada propiedad `image` de la configuración.

Mientras el video no existe se ve un fondo de reserva. Cuando esté listo, conviene exportar MP4 H.264 y WebM comprimidos, sin audio, y un poster WebP con el mismo encuadre. La reducción de movimiento muestra el poster y no reproduce el video.

En la versión Webflow, las rutas del video están en `macroled-home-embed.html`. Reemplazalas allí por sus URLs HTTPS. La ruta del placeholder CSS también debe actualizarse en `macroled-home.css` si no se conserva la estructura relativa.

## 6. Comprobar Typesense

Abrí la Home publicada, elegí Interior, Exterior y Proyectos, y verificá que cada línea muestre cuatro productos. Es correcto que todas muestren los mismos cuatro productos G9 en este prototipo.

En Chrome: clic derecho → **Inspeccionar** → **Console**. No debería aparecer `Macroled Home · Error consultando Typesense`. En **Network**, filtrá por `typesense`; la petición debe responder `200`.

La key incluida proviene del código entregado. Antes de publicar, confirmá en Typesense que sea una **Search-only API key**, restringida a la colección `Macroled_Prueba` y sólo a la acción de búsqueda. No puede confirmarse el permiso mirando la cadena. Nunca publiques una Admin API Key.

## 7. Editar contenido

La fuente central es `js/config.js`:

- `tabs.interior.categories`: las cuatro cards de Interior.
- `tabs.exterior.categories`: las cuatro cards de Exterior.
- `tabs.proyectos.categories`: las cuatro cards de Proyectos Lumínicos.
- `featuredLines`: título, descripción, imagen, vínculo, color y layout de cada línea.
- `typesenseValue`: hoy es `G9` en todas; en el futuro cambiá sólo el valor de cada línea.
- `theme` y `textColor`: ambiente y color de texto.
- `layout`: `image-left`, `image-right` o `image-full`.
- `news` y `faq`: novedades y preguntas comunes.

Después de editar una fuente ejecutá desde la carpeta del proyecto:

```bash
node scripts/build-webflow.mjs
```

Volvé a publicar `macroled-home.js` y, si corresponde, CSS o markup. Para evitar caché del CDN, agregá una versión al enlace: `macroled-home.js?v=2`.

## 8. Evitar conflictos

- Conservá un solo elemento con id `macroled-home`.
- No cargues dos veces `macroled-home.js`.
- Los estilos están prefijados con `ml-` y encapsulados bajo `.ml-home`.
- El JavaScript está encerrado y sólo expone tres nombres intencionales: `MACROLED_HOME_CONFIG`, `MacroledProducts`, `MacroledTabs` y `MacroledHome`.
- Si Webflow tiene una barra fija, ajustá `top` en `.ml-tabs-wrap` para sumar su altura.
- Probá siempre la versión publicada en desktop y mobile.

## 9. Desarrollo local

Desde la raíz del proyecto:

```bash
python3 -m http.server 8080
```

Abrí `http://localhost:8080`. No abras `index.html` con doble clic: un servidor local reproduce mejor las condiciones reales y permite revisar las peticiones de red.
