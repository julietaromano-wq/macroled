# Home de Macroled

## Archivos

- `index.html`: estructura de la Home y vista previa local. El contenido entre `<!-- EMBED WEBFLOW: HOME — inicio -->` y `<!-- EMBED WEBFLOW: HOME — fin -->` se pega en el embed de la Home en Webflow. Incluye además una copia del popup de newsletter para verlo localmente, fuera de ese bloque.
- `home.css`: estilos de la Home.
- `home.js`: lógica de la Home, productos, carruseles y asistente.
- `newsletter.html`: archivo principal del HTML del popup de novedades; se pega en el footer compartido de Webflow.
- `newsletter.css`: estilos del popup.
- `newsletter.js`: apertura, cierre, validación y envío del formulario del popup.
- `design-system.md`: referencia de diseño visual.
- `assets/`: recursos locales, como imágenes.
- `.agents/skills/`: instrucciones y recursos de las skills de diseño.
- `package.json`: comandos para la vista previa y las verificaciones.
- `scripts/serve.mjs`: servidor de vista previa local.
- `scripts/verify.mjs`: verifica sintaxis, rutas, IDs y sincronización del newsletter.

## Al editar el newsletter

1. Editar su HTML en `newsletter.html` y actualizar la copia en `index.html` para que ambas queden idénticas. No editar únicamente la copia local.
2. Hacer los cambios de estilos y comportamiento en `newsletter.css` y `newsletter.js`. Mantenerlos separados de `home.css` y `home.js`.
3. Ejecutar `npm run check` desde `home`; detecta si las copias del HTML no coinciden.

En Webflow, el HTML del popup va en el footer compartido y su CSS y JS se cargan desde Global Settings. Los cambios locales no actualizan Webflow automáticamente: hay que actualizar allí los archivos o referencias correspondientes y reemplazar el embed si cambió el HTML.

## Comandos locales

Desde la carpeta `home`:

- `npm run dev`: inicia el servidor de vista previa en `http://127.0.0.1:5501/home/index.html`.
- `npm run check`: ejecuta las verificaciones del proyecto.
