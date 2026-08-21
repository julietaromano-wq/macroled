---
name: macroled-design-system
description: Sistema de diseño de Macroled (marca, colores, tipografía, espaciado, radios, componentes reutilizables). Usar SIEMPRE que se cree, revise o refactorice HTML/CSS/JS dentro de home/, incluso para cambios chicos (ej. "cambiá el color de este botón"), para mantener consistencia visual y evitar que el agente invente valores o patrones nuevos sin justificación. Fuente de verdad: home/index.html, home/css/home.css, home/js/ y DESIGN.md (Figma).
---

# Macroled Design System

## Marca y sensación

**[CONFIRMADO]** — Definido en base a catálogo general, sitio web y
cuenta de Instagram (@macroled.ar). Falta cerrar solo el moodboard.

### Qué es la marca

Macroled es una marca registrada de Coresa Group SRL, líder en
tecnología LED en Argentina, con presencia regional también en Perú. El
catálogo es de escala industrial — lámparas, artefactos interior/exterior,
soluciones solares, luces de emergencia, sistemas smart, accesorios
metálicos/plásticos y sensores/fotocélulas de automatización — dirigido a
**profesionales y distribuidores**, no a consumidor final directo.

Conviven dos capas en la marca, y es intencional que el diseño las
sostenga a ambas en tensión, no que elija una:

- **Capa técnica/industrial**: materiales eléctricos y soluciones para
  grandes proyectos, líneas PRO de alto rendimiento (Highbay, Reflectores),
  catálogo B2B denso pensado para instaladores y distribuidores.
- **Capa diseño/arquitectura**: Macroled es sponsor oficial de
  iluminación en Casa FOA, acompañando activamente a arquitectos y
  diseñadores de interiores en Argentina; los lanzamientos de línea se
  comunican casi como piezas editoriales (ej. "Mónaco. Mismo origen,
  nueva identidad").

El Instagram usa un tono más emocional/consumer ("Líder en iluminación
led con una trayectoria marcada por la calidad y el compromiso",
testimonios de hogar). Ese tono **no** es el de la Home: la Home es B2B y
debe sostener el registro profesional/editorial, no el consumer de redes.

### Sensación buscada

**Profesional/técnico + Premium/exclusivo.** Confiable y de escala
industrial, pero con ambición de diseño — no un catálogo genérico de
materiales eléctricos, sino una marca técnica que también compite en el
terreno del diseño (la asociación con Casa FOA es la prueba de esa
ambición). Evitar explícitamente el registro "cálido/hogareño" (es el
tono de Instagram, no del sitio) y evitar "accesible/simple" como eje
principal (subestima la escala técnica real del catálogo).

### Usuario target de la Home

**[CONFIRMADO]** Mix real, sin uno dominante: la Home tiene que hablarle
tanto a arquitectos/diseñadores (ángulo Casa FOA, más editorial) como a
distribuidores/instaladores (ángulo técnico, más catálogo) por igual. No
priorizar un ángulo sobre el otro en decisiones de layout o copy — si un
componente nuevo fuerza a elegir uno de los dos públicos, consultarlo
antes de resolverlo por criterio propio.

### Moodboard / referencias

**[CONFIRMADO]**

- **Layout dinámico**: [Biograph](https://www.biograph.com/),
  [Rivian](https://rivian.com/),
  [Samsung — Vision AI TV](https://www.samsung.com/ar/tvs/vision-ai-tv/).
- **Comunicación/redacción de marca de iluminación**:
  [iGuzzini](https://www.iguzzini.com/es/).

Los elementos puntuales ya traducidos a reglas concretas de estos sitios
están documentados en "Patrones de referencia (elementos puntuales)" más
abajo — escalas tipográficas y secciones dark de Biograph, espaciado/
radio de botones de Rivian y Biograph, radio de cards de Biograph,
indicador de scroll y botón circular de Biograph, efecto shimmer de
títulos de Samsung, transición imagen+gradiente de Biograph/Rivian, y
redacción de iGuzzini. No se copiaron colores literales de ningún sitio
de referencia — solo espaciado, tipografía, motion y estructura de
componentes puntuales.

## Fuente de verdad

Trabajar en este orden:

1. Inspeccionar el componente existente en `home/index.html`,
   `home/css/home.css` y `home/js/`.
2. Respetar la implementación efectiva al final de la cascada, no una
   declaración anterior luego sobrescrita.
3. Usar los tokens primitivos de este documento al crear o refactorizar
   estilos.
4. Mantener los valores editoriales reales documentados cuando no exista
   todavía un token equivalente.

La home usa el namespace `.ml-home` / `.ml-*`. Mantenerlo para evitar
colisiones con Webflow.

## Tokens primitivos oficiales

### Color

Usar estos nombres para toda implementación nueva. Los nombres vienen del
sistema de variables de Figma; los valores están verificados contra
`DESIGN.md`.

| Escala | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 |
|---|---|---|---|---|---|---|---|---|---|---|
| Grey | `#FFFFFF` | `#FAFAFA` | `#F5F5F5` | `#EDEDED` | `#D7D7D7` | `#7A7A78` | `#5D5C5C` | `#2C2B2B` | `#1C1C1A` | `#0A0A0A` |
| Blue | `#E6EFF6` | `#B0CEE4` | `#8AB6D7` | `#5494C5` | `#3380B9` | `#006EA5` | `#005799` | `#004477` | `#00355C` | `#002847` |
| Dark blue | `#E6E9EC` | `#B0B9C3` | `#8A98A5` | `#54687C` | `#334B63` | `#001E3C` | `#001B37` | `#00152B` | `#001121` | `#000D19` |
| Light blue | `#E6F8FF` | `#B0EBFF` | `#8AE1FF` | `#54D3FF` | `#33CAFF` | `#00BDFF` | `#00ACE8` | `#0086B5` | `#00688C` | `#004F6B` |

**Regla dura**: no introducir colores nuevos fuera de esta paleta sin
consultarlo antes.

#### Variables CSS disponibles

La paleta anterior es la referencia completa. La fuente de verdad ejecutable
para los colores que ya consume la home está en el bloque `.ml-home` de
`home/css/home.css`. Usar siempre estos nombres exactos desde los componentes:

```css
/* Neutros */
--ml-grey-50: #ffffff;
--ml-grey-100: #fafafa;
--ml-grey-200: #f5f5f5;
--ml-grey-300: #ededed;
--ml-grey-400: #d7d7d7;
--ml-grey-500: #7a7a78;
--ml-grey-600: #5d5c5c;
--ml-grey-700: #2c2b2b;
--ml-grey-800: #1c1c1a;
--ml-grey-900: #0a0a0a;

/* Azul oscuro */
--ml-dark-blue-50: #e6e9ec;
--ml-dark-blue-100: #b0b9c3;
--ml-dark-blue-200: #8a98a5;
--ml-dark-blue-300: #54687c;
--ml-dark-blue-400: #334b63;
--ml-dark-blue-500: #001e3c;
--ml-dark-blue-600: #001b37;
--ml-dark-blue-700: #00152b;
--ml-dark-blue-800: #001121;
--ml-dark-blue-900: #000d19;

/* Azul luminoso: subconjunto actualmente exportado */
--ml-light-blue-50: #e6f8ff;
--ml-light-blue-400: #4dccff;
--ml-light-blue-500: #00bdff;
--ml-light-blue-600: #00ace8;
--ml-light-blue-700: #0086b5;
--ml-light-blue-800: #00688c;
```

Los niveles Blue y los niveles `100`, `200`, `300` y `900` de Light blue
pertenecen a la paleta de referencia, pero todavía no están exportados como
variables CSS. No asumir que existen hasta declararlos en el bloque canónico.

Aliases semánticos disponibles:

```css
--ml-action-primary: var(--ml-light-blue-700);
--ml-action-primary-hover: var(--ml-light-blue-800);
--ml-text-primary: var(--ml-grey-800);
--ml-text-secondary: var(--ml-grey-600);
--ml-text-inverse: var(--ml-grey-100);
```

Tokens locales de sección, como `--ml-monaco-tone`, `--ml-solutions-fade`,
`--line-bg` y `--line-color`, no forman parte de la paleta global. Se usan
únicamente dentro del componente o contenido que los declara.

### Espaciado

Usar una única escala para `gap`, `margin`, `padding` y separación
espacial.

| Token | Valor | Token | Valor |
|---|---:|---|---:|
| `space-0` | `0` | `space-8` | `24px` |
| `space-1` | `2px` | `space-9` | `32px` |
| `space-2` | `4px` | `space-10` | `40px` |
| `space-3` | `8px` | `space-11` | `48px` |
| `space-4` | `10px` | `space-12` | `64px` |
| `space-5` | `12px` | `space-13` | `80px` |
| `space-6` | `16px` | `space-14` | `96px` |
| `space-7` | `20px` | `space-15` | `120px` |

Aliases exportados por Figma: `tiny` 2px, `xxxsmall` 4px, `xxsmall` 8px,
`xsmall` 10px, `small` 12px, `medium` 16px, `large` 20px, `xlarge` 24px,
`xxlarge` 32px, `xxxlarge` 40px, `huge` 48px, `xhuge` 64px, `xxhuge` 80px,
`xxxhuge` 96px, `xxxxhuge` 120px. Aplicar el prefijo `gap-`, `margin-` o
`padding-` según la propiedad. El export usa `padding-xxxxlarge` para
120px; tratarlo como alias histórico de `space-15`.

### Radios

| Token | Valor | Token | Valor |
|---|---:|---|---:|
| `radius-tiny` | `2px` | `radius-xlarge` | `24px` |
| `radius-xxxsmall` | `4px` | `radius-xxlarge` | `32px` |
| `radius-xxsmall` | `8px` | `radius-xxxlarge` | `40px` |
| `radius-xsmall` | `10px` | `radius-huge` | `48px` |
| `radius-small` | `12px` | `radius-xhuge` | `64px` |
| `radius-medium` | `16px` | `radius-xxhuge` | `80px` |
| `radius-large` | `20px` | `radius-full` | `96px` |
| `radius-xxxhuge` | `120px` | `radius-xxxxhuge` | `99999px` |

Usar `99999px` para pills. La home conserva `999px` como equivalente
práctico en controles existentes y `50%` para círculos.

## Uso semántico de la paleta en la home

La home utiliza directamente los tokens canónicos de color de la paleta.
La raíz `.ml-home` conserva `--ml-radius: 1.25rem` como alias local de
`radius-large`.

| Uso | Valor efectivo |
|---|---|
| Texto/tinta principal | `grey-800` (`#1C1C1A`) |
| Texto secundario azul | `dark-blue-400` (`#334B63`) |
| Fondo azul de marca | `dark-blue-700` (`#00152B`) |
| Acento luminoso/focus | `light-blue-500` (`#00BDFF`) |
| **Acción primaria (confirmado)** | `#0086B5` (`light-blue-700`) |
| Acción primaria hover | `#006F98` (valor real legado; al refactorizar evaluar `light-blue-800` `#00688C`) |
| Acción/tab alternativo | `#00ACE8` (`light-blue-600`) |
| Superficie base | `#FFFFFF` (`grey-50`) |
| Superficie suave | `#F5F5F5` (`grey-200`) |
| Hover de superficie | `#E6F8FF` (`light-blue-50`) |
| Texto secundario | `#53606A` o `#5B6472` (valores editoriales actuales fuera de paleta) |
| Línea/progreso inactivo | `#DFE4E7` (valor editorial actual fuera de paleta) |
| Fondo gris claro | `grey-200` (`#F5F5F5`) |

No reemplazar silenciosamente valores editoriales por el color primitivo
"más cercano" si cambia contraste o jerarquía. Proponer la migración y
verificarla visualmente.

Las líneas editoriales configurables reciben `--line-bg` y `--line-color`
desde `home/js/config.js`. Sus colores son contenido, no tokens globales.
El fondo del listado cambia con `--ml-panel-theme` mediante
`IntersectionObserver`.

## Tipografía

Usar `"Noto Sans", Arial, sans-serif`. La home carga Noto Sans en pesos
300, 400, 500, 600, 700 y 800.

La fuente de verdad ejecutable es la sección `Canonical typography scale`
de `home/css/home.css`. Este documento registra el contrato del sistema;
los componentes siempre deben consumir las variables `--ml-type-*` y no
declarar escalas tipográficas paralelas.

Reglas:

- La escala principal contiene H1–H6. H7 es la variante compacta reservada
  para los títulos de category cards del carrusel de Soluciones y de las
  subfamilias en líneas destacadas.
- H1 se reserva para el hero y H2 para los títulos principales de sección.
- H3 se reserva para títulos editoriales de líneas destacadas. Su texto
  base usa peso 300 y la parte enfatizada conserva el peso fuerte definido
  por el contenido (`--title-emphasis-weight`, con fallback 600).
- H4 queda reservado para encabezados intermedios.
- H5 reúne los títulos de cards; reemplaza, entre otras, la antigua variante
  `ml-type-heading-card-large`.
- Peso 500 se usa en H1, H2 y H4. Peso 600 se usa para énfasis y controles.
- Pesos 700/800 quedan reservados para énfasis puntual.
- Los cuerpos usan interlíneas entre `1.55` y `1.6`.
- Solo existe una adaptación tipográfica exclusiva para mobile:
  H1 cambia a `clamp(2.5rem, 10vw, 2.75rem)` hasta 640px.

Escala oficial:

Cada nivel expone `size`, `weight`, `leading` y `tracking` mediante esta
nomenclatura estable:

```css
--ml-type-h1-size;       --ml-type-h1-weight;       --ml-type-h1-leading;       --ml-type-h1-tracking;
--ml-type-h2-size;       --ml-type-h2-weight;       --ml-type-h2-leading;       --ml-type-h2-tracking;
--ml-type-h3-size;       --ml-type-h3-weight;       --ml-type-h3-leading;       --ml-type-h3-tracking;
--ml-type-h4-size;       --ml-type-h4-weight;       --ml-type-h4-leading;       --ml-type-h4-tracking;
--ml-type-h5-size;       --ml-type-h5-weight;       --ml-type-h5-leading;       --ml-type-h5-tracking;
--ml-type-h6-size;       --ml-type-h6-weight;       --ml-type-h6-leading;       --ml-type-h6-tracking;
--ml-type-h7-size;       --ml-type-h7-weight;       --ml-type-h7-leading;       --ml-type-h7-tracking;
--ml-type-body-l-size;   --ml-type-body-l-weight;   --ml-type-body-l-leading;
--ml-type-body-m-size;   --ml-type-body-m-weight;   --ml-type-body-m-leading;
--ml-type-body-s-size;   --ml-type-body-s-weight;   --ml-type-body-s-leading;
```

H3 suma `--ml-type-h3-emphasis-weight` para la parte destacada del título.

| Rol | Tamaño | Peso | Interlínea | Tracking |
|---|---|---:|---:|---:|
| H1 | `clamp(2.25rem, calc(1.85rem + 2vw), 4.25rem)` | 500 | `1.02` | `-0.04em` |
| H2 | `clamp(2rem, calc(1.4rem + 1.6vw), 3.25rem)` | 500 | `1.15` | `-0.04em` |
| H3 | `clamp(1.8rem, calc(1.45rem + 1.5vw), 3rem)` | 300 / énfasis 600 | `1.08` | `-0.025em` |
| H4 | `clamp(1.75rem, calc(1.5rem + 1vw), 2.25rem)` | 500 | `1.15` | `-0.01em` |
| H5 | `clamp(1.25rem, calc(1.05rem + 0.8vw), 1.75rem)` | 400 | `1.2` | `-0.01em` |
| H6 | `clamp(1.2rem, calc(1.1rem + 0.5vw), 1.4rem)` | 500 | `1.3` | `0` |
| H7 | `1.05rem` | 500 | `1.25` | `-0.01em` |
| Body L | `clamp(1rem, calc(0.95rem + 0.25vw), 1rem)` | 400 | `1.6` | `0` |
| Body M | `1rem` | 400 | `1.6` | `0` |
| Body S | `0.875rem` | 400 | `1.55` | `0` |

Mapeo principal:

| Rol | Componentes |
|---|---|
| H1 | Título del hero |
| H2 | Productos destacados, líneas profesionales, soluciones, Casa FOA, novedades, FAQ y newsletter |
| H3 | Títulos editoriales de líneas destacadas |
| H4 | Encabezados intermedios; reservado para futuras asignaciones |
| H5 | Títulos de tarjetas de líneas profesionales |
| H6 | Títulos de tarjetas de novedades |
| H7 | Títulos de category cards del carrusel de Soluciones y de subfamilias en líneas destacadas |
| Body L | Subtítulos de sección, descripciones editoriales y textos introductorios |
| Body M | Estados de carga y mensajes generales |
| Body S | Descripciones de novedades, respuestas FAQ y valores de atributos |

Las tipografías de labels, badges, botones, tabs y acciones pertenecen a sus
componentes y no forman parte de la escala global H1–H7 / Body L–S.

El título de las cards de producto es una excepción de componente: usa
`1.05rem`, peso `600`, interlínea `1.3` y tracking `0`. No consume H5 porque
su escala compacta forma parte del layout interno de la card.

Todas las cards de producto —tanto en Destacados como dentro de las líneas—
comparten el mismo componente y la misma jerarquía de color, sin overrides por
contexto:

- `.ml-product-card__title`: `--ml-grey-800`.
- `.ml-product-attr__label`: `#94989c`.
- `.ml-product-attr__value`: `--ml-grey-600`.

Las cards se estiran a la altura de su fila o track. El área de
`.ml-product-card__title` reserva siempre dos líneas (`min-height: 2.6em`) para
que los atributos comiencen alineados y las cards con títulos de una o dos
líneas conserven la misma altura.

## Layout y responsive

- Usar `.ml-shell` para el ancho común: `width: min(100% - 2rem, 90rem)`
  y centrado.
- Cortes reales: 1389px para grilla de destacados; 980px y 900px para
  tablet; 700px y 640px para mobile.
- En carruseles, usar `scroll-snap`, ocultar scrollbar y conservar
  controles por teclado.
- A 640px, márgenes laterales de 16px y tarjetas de carrusel cercanas a
  `78vw`.
- Secciones editoriales amplias: bloques principales entre 48px y 120px
  según viewport.

## Componentes

### Botones

**[CONFIRMADO] Jerarquía y regla de iconos — actualizado en este chat**

Existen tres niveles de énfasis. La regla dura es: **el ícono de flecha
solo puede aparecer en botones de solo texto (terciario). Ningún botón
con fill o con borde lleva flecha.**

1. **Primario (fill)** — máximo énfasis, base `.ml-button--primary`:
   - Variante default: fill `light-blue-700` (`#0086B5`), texto blanco.
     Hover `#006F98`.
   - Variante fill negro: fill `dark-blue-700` (`#00152B`), texto blanco.
     Usar sobre fondos claros que necesiten más contraste/seriedad que el
     azul de marca.
   - Variante fill blanco: fill `grey-100` (`#FAFAFA`), texto `grey-800`
     o `dark-blue-700`. Usar sobre fondos oscuros (hero, secciones tipo
     Casa FOA).
   - Las tres comparten forma: padding 16px 32px, radio 8px, texto
     `1rem`/600 en desktop grande y `0.875rem`/600 hasta 1360px, sin sombra.
   - **Sin ícono de flecha en ninguna variante fill.**
2. **Secundario (border)** — énfasis medio, `.ml-button--secondary`:
   - Sin fill, solo borde. Mantener contraste respecto de `--line-bg` /
     `--line-color` cuando se usa dentro de líneas editoriales.
   - En hover pasa a fill completo con `--line-color` y usa
     `--line-bg` para el texto. No usar un tinte parcial.
   - No competir visualmente con la acción primaria del mismo bloque.
   - **Sin ícono de flecha.**
3. **Terciario (solo texto)** — mínimo énfasis,
   `.ml-button--tertiary`:
   - Clase canónica compartida por `.ml-project-line-card__cta` y el CTA
     “Conocer más” de Casa FOA.
   - Sin fill ni borde, texto `1rem`/600 en desktop grande y
     `0.875rem`/600 hasta 1360px.
   - Padding vertical `0.75rem`, gap `0.6rem`, color heredado de la
     superficie donde se usa.
   - **Único nivel que puede llevar ícono de flecha**, con el
     desplazamiento de 4px en hover.

```html
<a class="ml-button--tertiary" href="#">
  Conocer más <span aria-hidden="true">→</span>
</a>
```

No agregar flecha a botones primarios o secundarios existentes ni a
nuevos que se creen, aunque el pedido puntual no lo aclare — es una regla
de sistema, no una preferencia por pieza.

### Segmented control de productos destacados

**[EN REVISIÓN]** — confirmado como estado actual real, pero la usuaria
puede cambiarlo más adelante.

Estructura:

```html
<div class="ml-featured-products__tabs" role="tablist">
  <button class="ml-featured-products__tab is-active"
    role="tab" aria-selected="true">…</button>
</div>
```

Estilo efectivo:

- Contenedor `display:flex`, gap 5.6px (`0.35rem`), padding 4px, pill,
  fondo `grey-200`.
- Tab: padding 10.4px 17.6px, pill, 14px/600, texto `#5B6472`.
- Activo: fondo blanco, texto `light-blue-500`, sin sombra.
- Focus: outline `3px solid light-blue-500`, offset 3px.
- En <=900px ocupa el ancho disponible y permite scroll horizontal.

Comportamiento:

- Mantener `role="tablist"`, `role="tab"` y `aria-selected`.
- La selección alterna `.is-active`, cambia la etiqueta activa y consulta
  Typesense por `destacados_en`.
- No permitir una segunda consulta mientras `isFetching` sea verdadero.
- Tras actualizar, volver el carrusel a `scrollLeft = 0`.

### Carrusel de productos destacados

- Mostrar 5 tarjetas a >=1390px, 4 entre 901–1389px, 2 entre 641–900px y
  tarjetas de `78vw` en mobile.
- Track: ancho máximo 90rem, gap 16px, padding vertical 48px/32px,
  `scroll-snap-type:x mandatory`.
- Tarjeta con sombra sutil `2px 3px 20px 2px rgba(0,17,33,.04)`.
- Media `grey-200`; hover `light-blue-50`; imagen escala a 1.08.
- Mostrar barra de progreso y flechas sólo si existe overflow.
- Flechas: 44px circulares, borde y texto `light-blue-700`; invertir a
  fondo azul y texto blanco en hover; disabled opacity .28.
- Comunicar carga, vacío y error mediante
  `.ml-featured-products__state` y `aria-busy`.

### Tarjeta de producto

Composición:

1. Media cuadrada con imagen `object-fit: contain`.
2. Flechas circulares superpuestas sólo cuando hay más de una imagen.
3. Título.
4. Hasta tres atributos.
5. Estado sin imagen, sin atributos o sin enlace.

Reglas:

- Usar `<a>` cuando exista `link_ficha_web`; usar
  `<div class="ml-product-card--disabled">` cuando no exista.
- Sanitizar texto y aceptar sólo URLs HTTP/HTTPS.
- Mantener zoom de imagen en hover y bloquear el hover transform en
  tarjeta disabled.
- Para temperatura de color, mostrar el dot sólo si el label contiene
  "luz" o "temperatura" y el valor coincide con el mapa CCT.

### Tarjeta de categoría

- Superficie `grey-200`, hover `light-blue-50`.
- Radio efectivo 12px en la capa base.
- Imagen cuadrada, `object-fit: contain`; hover scale 1.04.
- Título 600, `clamp(1.1rem, 1.5vw, 1.3rem)`.
- Usar carrusel con flechas cuando existan más de cuatro categorías.
- En subfamilias dentro de una línea, usar fondo blanco y sombra sutil.

### Líneas editoriales

Cada `.ml-featured` combina:

- Historia con imagen y copy.
- Layout configurable `image-left`, `image-right` o `image-full`.
- Tema de contenido por `--line-bg` y `--line-color`.
- Contenido `static` de subfamilias o grilla dinámica consultada a
  Typesense.

En `image-full`, proteger la legibilidad del copy con overlay. En fondos
cambiantes, mantener la transición de `.ml-featured-list` en 800ms con
`cubic-bezier(.22,1,.36,1)`.

### Tarjetas de líneas de proyecto

Usar tres tarjetas en desktop dentro de `.ml-project-lines__cards`:

- Sección: fondo efectivo
  `linear-gradient(90deg, #020202 0%, #111923 48%, #28303F 100%)`, texto
  blanco.
- Contenedor: flex, gap 16px, alto 560px.
- Tarjeta expandida: ancho 60%; colapsadas: 20% cada una.
- Tarjeta: radio 16px, fondo fallback `#07111D`, borde blanco al 10%,
  sin sombra efectiva.
- Expandida: imagen ambient al 100%, scale 1.035; overlay negro
  horizontal final de `.94` a transparente; título 38px (`2.375rem`)/600.
- Colapsada: imagen opacity .42, hover .9; overlay vertical oscuro;
  título 24px/500 y flecha simple sin círculo. *(Esta flecha es el CTA
  terciario del componente, no un botón fill/border — respeta la regla
  de iconos de arriba.)*
- Trigger expandido: padding 48px. Colapsado: padding 24px.
- Copy expandido: subtítulo 18px/400/1.5; CTA 16px/600 con flecha que
  avanza 4px.
- Interacción: click, Enter o Space expanden una tarjeta; no colapsar la
  activa; no interceptar clicks en enlaces.
- Estado: usar `.is-expanded` y `.is-collapsed`; mantener `tabindex`,
  `aria-label` y foco cian de 3px.
- Transición de layout: FLIP con Web Animations, 680ms,
  `cubic-bezier(.22,1,.36,1)`.
- Reveal inicial: opacity/translate escalonado por
  `--project-card-index`, 600ms con delay de 90ms.
- <=900px: apilar; colapsadas de 176px, expandida de 480px.
- <=640px: expandida de 432px; título expandido 32px.
- Con `prefers-reduced-motion: reduce`, eliminar transiciones y aplicar
  estado inmediatamente.

No reintroducir estilos históricos de estas tarjetas que quedaron
sobrescritos: grilla 3.1fr/1fr, producto aislado sobre fondo negro, radio
24px, sombras pesadas o el badge
`.ml-project-line-card__state`.

### FAQ

- Trigger de ancho completo con pregunta e icono.
- Alternar `aria-expanded`.
- Abrir/cerrar con transición de `grid-template-rows` y rotación del
  icono.
- Mantener focus visible.

### Hero

- Video full-bleed con poster y fallback.
- Overlay oscuro para contraste.
- Título máximo 46rem y subtítulo máximo 41rem.
- Animación de iluminación letra por letra: 650ms, delay incremental de
  28ms.
- Si el usuario prefiere movimiento reducido, pausar y ocultar video, y
  no separar/animar letras.

## Movimiento y estados

- Microinteracciones: 150–300ms.
- Hover de media: 250–350ms.
- Transiciones editoriales/layout: 600–900ms con
  `cubic-bezier(.22,1,.36,1)` o `cubic-bezier(.2,.8,.2,1)`.
- Usar transform y opacity siempre que sea posible.
- Definir hover, focus-visible, active, disabled, loading, empty y error
  según corresponda.
- Incluir siempre un bloque `prefers-reduced-motion: reduce` para
  animaciones nuevas.

## Accesibilidad

- Conservar landmarks, headings y relaciones `aria-labelledby`.
- Marcar imágenes decorativas con `alt=""`; describir imágenes
  funcionales.
- No usar color como único indicador de estado.
- Mantener navegación por teclado en tabs, tarjetas expandibles, flechas
  y FAQ.
- Aplicar foco visible cian de 3px.
- Usar `aria-live="polite"` y `aria-busy` en contenido cargado de forma
  asíncrona.
- Sanitizar contenido inyectado y validar URLs antes de renderizar.

## Reglas de implementación

- Reutilizar componentes `.ml-*` antes de crear variantes.
- Preferir token semántico; luego primitivo; usar un valor editorial
  nuevo sólo con motivo explícito.
- No hardcodear un valor que ya tenga token.
- No usar gradientes decorativos genéricos: los gradientes existentes
  cumplen funciones concretas de fondo o legibilidad.
- Evitar sombras fuertes. La versión efectiva de las tarjetas de proyecto
  no usa sombra.
- No agregar múltiples acciones de alto énfasis en el mismo bloque.
- Mantener configuración editorial en `home/js/config.js` y datos
  manuales de proyectos en `home/js/project-lines.js`.
- Regenerar y verificar el bundle Webflow después de cambios en fuentes.
- Probar al menos desktop, 900px y 640px; teclado; carga/error; y
  reduced motion.

## Patrones de referencia (elementos puntuales)

**[REFERENCIA — validar contra el sitio real antes de fijar valores en
píxeles exactos]**. Esto no son reglas estructurales nuevas ni un cambio
de layout: son elementos puntuales tomados de capturas de Biograph,
Rivian, Samsung e iGuzzini para replicar en componentes ya existentes o
nuevos de Macroled.

### Escala tipográfica (de Biograph, secciones dark — ids `scroll02` y `scroll04`)

- **Eyebrow/microlabel**: todo mayúsculas, tracking amplio, tamaño chico
  (~12-13px), color gris apagado sobre fondo oscuro (ej. "OUR CLINICS").
  Macroled no tiene este token documentado todavía — sumarlo como
  `.ml-eyebrow` para usar en secciones de impacto (hero oscuro, section
  dark de líneas de proyecto), no en todos lados.
- **Prohibido en cards de conversión**: no agregar eyebrows, microlabels,
  categorías en mayúsculas ni texto introductorio sobre el título de cards
  de contacto, newsletter, suscripción o CTA comercial. En estos componentes
  la jerarquía comienza directamente con el título; usar contraste de fill,
  escala tipográfica y posición para diferenciar acciones. Esta regla también
  aplica a variantes futuras de `.ml-conversion`.
- **H2 de impacto centrado**: dos líneas, centrado, peso normal/medium
  (no 700/800), tamaño grande (~48-56px en desktop), line-height ajustado
  (~1.1). Coincide en rango con el token `h2 global` que Macroled ya
  tiene (`clamp(2rem, 4.4vw, 3.75rem)`, peso 500) — no crear token nuevo,
  usar el existente centrado cuando la sección lo pida.
- **Subtítulo centrado**: texto gris/muted, centrado, ancho máximo
  acotado (~600-700px), tamaño ~18-20px, line-height 1.5. Coincide con
  el token `Subtítulo hero/panel` ya documentado.

### Secciones dark mode (Biograph `scroll02`, `scroll04`)

- Fondo oscuro con imagen o video full-bleed de baja saturación, overlay
  para legibilidad del texto.
- Padding vertical generoso, contenido centrado en columna angosta.
- En la sección de tarjetas (`scroll04`): tarjetas con fondo levemente
  más claro que el fondo de la sección, borde 1px sutil en blanco a baja
  opacidad, sin sombra dura.

### Espaciado y radio de botones (Rivian + Biograph)

- Botón pill blanco sobre fondo oscuro: padding generoso horizontal
  (~28-32px) y vertical (~14-16px), radio full pill.
- Esto **confirma** la variante "fill blanco" ya definida en la sección
  de Botones de este documento (`grey-100`, texto oscuro, sobre fondos
  oscuros) — no es un componente nuevo, es evidencia a favor del que ya
  se definió.

### Radio de componentes y cards (Biograph `scroll04`)

- Cards oscuras con radio visualmente entre 16-20px — coincide con los
  tokens ya existentes `radius-medium` (16px) y `radius-large` (20px).
  Usar estos tokens para cualquier card nueva en secciones dark, no
  valores sueltos.

### Indicador de scroll horizontal (línea sutil)

Patrón nuevo a documentar como componente: track de línea fina (~2px de
alto), color `grey-800` al 14% o equivalente en baja opacidad, con un segmento
"activo" más brillante/blanco que indica la posición actual dentro de un
carrusel horizontal. Usar como alternativa a dots o a flechas cuando el
carrusel es largo y el usuario necesita noción de progreso, no solo de
paso a paso.

### Botón circular de navegación sobre fondo oscuro

Mismo patrón que las flechas circulares ya documentadas en el carrusel
de productos destacados (44px, circular), pero en variante para fondos
oscuros: fondo translúcido (blanco a ~10-15% opacidad) en vez de borde
sólido, ícono blanco. Reutilizar el componente existente con esta
variante de superficie, no crear uno nuevo desde cero.

### Efecto shimmer en títulos ligado al scroll (Samsung)

Texto con gradiente animado tipo "reflejo" que atraviesa el titular a
medida que se scrollea (patrón visto en `vd-ai-key-message` de Samsung):
`background: linear-gradient(...)` sobre el texto con
`background-clip: text`, y la posición del gradiente atada al progreso
de scroll (no a un loop automático de tiempo fijo). Reservar para un
titular de alto impacto puntual, no aplicar a headings en general —
sería ruido si se repite en cada sección.

### Transición de sección con imagen + gradiente (Biograph + Rivian)

Imagen o video full-bleed en la parte superior de una sección, con un
gradiente que va desde transparente hasta el color de fondo sólido de la
sección siguiente, de forma que la imagen "se funde" con el contenido de
abajo sin un corte duro. Usar en transiciones hero → sección oscura, o
entre bloques editoriales con fondo de color distinto.

### Redacción (solo iGuzzini)

- Una oración corta por bloque, no párrafos de venta.
- Eyebrow editorial corto antes del título de sección (ver arriba).
- El producto/imagen es protagonista; el copy acompaña, no explica de
  más.
- Evitar el tono técnico-enumerativo del catálogo en textos de Home —
  eso queda para las fichas de producto, no para el copy editorial.

## Reglas de comportamiento para el agente

1. Antes de crear un componente nuevo, revisar si ya existe un patrón
   similar en la lista de arriba y reutilizarlo/adaptarlo — no inventar
   uno nuevo desde cero salvo que el pedido lo requiera explícitamente.
2. **Pedidos chicos y puntuales** (ej. "cambiá el color de este botón",
   "hacé más grande este título") tienen que resolverse tocando SOLO la
   propiedad pedida — no reestructurar el componente, no tocar otros
   estilos, no "aprovechar" para cambiar cosas no solicitadas.
3. Cualquier color, tipografía o espaciado que no esté en esta lista debe
   consultarse antes de aplicarse, no asumirse por criterio propio.
4. Si el pedido es ambiguo, preguntar antes de decidir — no rellenar el
   vacío con la opción "más genérica de IA" (fondos degradados sin
   justificación, iconografía genérica, layouts simétricos por defecto
   sin razón de diseño).
5. Respetar la regla de iconos de botones: flecha solo en terciario/solo
   texto, nunca en fill ni en border, incluso si el pedido puntual no lo
   menciona.
6. Si hay otra skill instalada con lineamientos de diseño más genéricos
   (por ejemplo Taste Skill), las reglas de ESTE documento tienen
   prioridad en cualquier punto donde se pisen — esta skill define lo
   específico de la marca Macroled, la otra aporta criterio general de
   calidad visual por encima, no al revés.
