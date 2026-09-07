# Home

Estructura de archivos de la Home de Macroled y cómo se relacionan con Webflow.

## Archivos editables

- **`home.css`** — todos los estilos exclusivos de la Home (hero, cards de producto,
  categorías, líneas editoriales, banners, asistente, etc.).
- **`home.js`** — toda la lógica de la Home en un solo archivo, organizada en bloques
  delimitados por comentarios `/* ===== nombre ===== */`, en el orden en que se
  inicializan:
  1. `config` — datos editoriales (categorías, líneas, textos) y helpers de
     configuración.
  2. `products` — armado de las cards de producto y sus carruseles.
  3. `featured` — selección y orden de productos destacados/novedades.
  4. `project-lines-concept` — datos manuales de las líneas de proyecto.
  5. `home` — boot general de la página: arma las secciones, banners, categorías,
     fondos por línea y animaciones del hero.
  6. `asistente` — panel del asistente (abrir/cerrar, envío de mensajes).

  No requiere build: se edita y se recarga directo en el navegador.
- **`newsletter.css`** y **`newsletter.js`** — popup de newsletter. Van separados de
  `home.*` a propósito porque también se cargan desde **Global Settings** de Webflow
  (para que el popup aparezca en todas las páginas, no solo en la Home). Nunca deben
  copiarse dentro de `home.js`/`home.css`, o el popup queda duplicado.
- **`newsletter.html`** — única fuente del HTML del popup de newsletter (el
  backdrop y el diálogo con el formulario). Es el código que se pega en el
  componente/símbolo del **footer** en Webflow (o cualquier embed global), para
  que el popup exista una sola vez y aparezca en todas las páginas. Cuando se
  cambie algo del formulario del newsletter (campos, textos, endpoint), se edita
  acá y se vuelve a pegar ese mismo contenido en Webflow.
- **`webflow-embed.html`** — única fuente del HTML propio de la Home (hero,
  categorías, destacados, novedades, asistente). **No incluye** el popup de
  newsletter: eso vive solo en `newsletter.html` para no duplicarlo, ya que el
  footer global ya lo agrega a la Home también.
- **`assets/`** — recursos locales que sí se sirven desde acá (hoy solo
  `images/editorial-placeholder.svg`, usado como fondo de contenido editorial sin
  imagen definitiva todavía). El resto de las imágenes/videos de la Home se sirven
  desde `https://s3.coresagroup.com/...`, no desde esta carpeta.

## Vista previa local

`index.html` es una vista previa **generada**, no se edita a mano.

- `npm run build` — regenera `index.html` a partir de `webflow-embed.html` y
  `newsletter.html`.
- `npm run watch` — regenera automáticamente al guardar `webflow-embed.html` o
  `newsletter.html`.
- `npm run dev` — sirve la vista previa en `http://127.0.0.1:5501/home/index.html`.
- `npm run check` — verifica sintaxis de `home.js`/`newsletter.js`, que el newsletter
  no esté duplicado, que la vista previa esté actualizada, que no haya IDs de widgets
  repetidos y que las rutas locales (imágenes, CSS, JS) existan.

Los cambios de CSS/JS se ven con solo guardar y recargar; el build solo hace falta
si se edita `webflow-embed.html`.

## dist/ (todavía en uso por Webflow)

`dist/` guarda copia de los archivos que los CDN de Webflow consumen **hoy**
(`home/dist/home.css`, `home/dist/home.bundle.js`, `home/dist/newsletter.css`,
`home/dist/newsletter.js`). Se mantiene sin tocar mientras se migra Webflow a los
archivos de arriba (`home.css`, `home.js`, `newsletter.css`, `newsletter.js`).
Una vez que los CDN de la página y de Global Settings apunten a los archivos nuevos
y se confirme que todo funciona en producción, `dist/` se puede eliminar.

## Otros componentes (fuera de esta carpeta)

- `../contactio/` — página de contacto, independiente de la Home.
- `../demos/asistente.html` — demo del asistente sin depender de la Home.
