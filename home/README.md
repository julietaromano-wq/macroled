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
- **`newsletter.css`** y **`newsletter.js`** — popup de newsletter. Van separados de
  `home.*` a propósito porque también se cargan desde **Global Settings** de Webflow
  (para que el popup aparezca en todas las páginas, no solo en la Home). Nunca deben
  copiarse dentro de `home.js`/`home.css`, o el popup queda duplicado.
- **`newsletter.html`** — única fuente del HTML del popup de newsletter (el
  backdrop y el diálogo con el formulario). Es el código que se pega en el
  componente/símbolo del **footer** en Webflow, para que el popup exista una sola
  vez y aparezca en todas las páginas. Cuando cambie algo del formulario del
  newsletter (campos, textos, endpoint), se edita acá y se vuelve a pegar ese mismo
  contenido en Webflow. También hay que actualizar la copia idéntica que vive
  dentro de `index.html` (ver abajo), y `npm run check` avisa si se olvida.
- **`index.html`** — se edita directamente (no hay build). Cumple doble función:
  1. Vista previa local, abierta con `npm run dev`.
  2. Fuente del HTML de la página Home en Webflow: todo lo que está entre los
     comentarios `<!-- EMBED WEBFLOW: HOME — inicio -->` y
     `<!-- EMBED WEBFLOW: HOME — fin -->` es exactamente lo que se pega en el
     embed del body de la página Home en el Designer. Lo que queda fuera de esos
     comentarios (el popup de newsletter) es solo para esta vista previa; en
     Webflow ese bloque no va en la Home sino en el footer (ver `newsletter.html`).
- **`assets/`** — recursos locales que sí se sirven desde acá (hoy solo
  `images/editorial-placeholder.svg`, usado como fondo de contenido editorial sin
  imagen definitiva todavía). El resto de las imágenes/videos de la Home se sirven
  desde `https://s3.coresagroup.com/...`, no desde esta carpeta.

## Vista previa local

- `npm run dev` — sirve `index.html` en `http://127.0.0.1:5501/home/index.html`.
  Guardar y recargar alcanza para ver cualquier cambio de CSS/JS/HTML.
- `npm run check` — verifica sintaxis de `home.js`/`newsletter.js`, que el
  newsletter no esté duplicado en `home.js`, que `index.html` tenga los
  comentarios de embed y no le falte ni le sobre el popup de `newsletter.html`,
  que no haya IDs de widgets repetidos y que las rutas locales (imágenes, CSS, JS)
  existan.

## Otros componentes (fuera de esta carpeta)

- `../contactio/` — página de contacto, independiente de la Home.
- `../demos/asistente.html` — demo del asistente sin depender de la Home.
