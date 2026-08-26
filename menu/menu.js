/* MACROLED MENU
   CDN: https://cdn.jsdelivr.net/gh/julietaromano-wq/macroled@main/menu/menu.js
   Cargar despues de: https://cdn.jsdelivr.net/npm/typesense@1.8.2/dist/typesense.min.js
*/
/* =========================================================
   MACROLED MEGAMENU — DATA
   Acá está TODA la info del menú: familias, subfamilias,
   cantidad de productos, imagen y link.
   Para agregar/sacar/reordenar una subfamilia, tocás
   directamente este array. No hay que tocar HTML ni CSS.
   ========================================================= */

const CDN = "https://d1zltvqju4u8ql.cloudfront.net/fit-in";

const MEGAMENU_DATA = [
  {
    id: "lamparas",
    label: "Lámparas",
    viewAllHref: "#",
    promo: {
      tagline: "Iluminá cada ambiente con estilo",
      subtitle: "Línea completa de lámparas para uso residencial y comercial, con diseños que combinan funcionalidad y estética.",
    },
    layout: "flat",
    items: [
      { name: "Bulbos", count: "9 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/bulbosnew.png`, href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=L%C3%A1mparas&familia=Bulbos" },
      { name: "Bulbones", count: "19 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/bulbonesnew.png`, href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=L%C3%A1mparas&familia=Bulbones" },
      { name: "Filamento", count: "29 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/filamentonewn.png`, href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=L%C3%A1mparas&familia=Filamento" },
      { name: "Bipin", count: "8 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/bipinnewn.png`, href: "#" },
      { name: "Par LED", count: "3 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/par-lednewn.png`, href: "#" },
      { name: "Dicroicas", count: "10 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/ar111new.png`, href: "#" },
      { name: "Tubos LED", count: "8 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/tubos.png`, href: "#" },
      { name: "AR111", count: "11 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/dricoicasnewn.png`, href: "#" },
    ],
  },
  {
    id: "artefactos-lamparas",
    label: "Artefactos para Lámparas",
    viewAllHref: "#",
    promo: {
      tagline: "La base perfecta para tu iluminación",
      subtitle: "Portalámparas, estructuras y accesorios pensados para dar soporte y terminación profesional a cada instalación.",
    },
    layout: "grouped",
    groups: [
      { group: "Policarbonato", items: [
        { name: "Embutir Dicroica", count: "28 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/policarbonato-embutir-dicroica.png`, href: "#" },
        { name: "Embutir AR111", count: "28 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/policarbonato-embutir-ar111.png`, href: "#" },
        { name: "Plafón Dicroica", count: "28 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/policarbonato-aplicar-dicroica.png`, href: "#" },
        { name: "Exterior Dicroica", count: "28 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/policarbonato-exterior-dicroica.png`, href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=Artefactos+para+L%C3%A1mparas&familia=Exterior+Dicroica" },
      ]},
      { group: "Acero", items: [
        { name: "Embutir Dicroica", count: "28 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/acero-embutir-dicroica.png`, href: "#" },
        { name: "Embutir AR111", count: "28 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/acero-embutir-ar111.png`, href: "#" },
        { name: "Plafón Dicroica", count: "28 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/acero-aplicar-dicroica.png`, href: "#" },
        { name: "Plafón AR111", count: "28 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/acero-aplicar-ar111.png`, href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=Artefactos+para+L%C3%A1mparas&familia=Plaf%C3%B3n+AR111" },
      ]},
      { group: "Aluminio", items: [
        { name: "Embutir Dicroica", count: "28 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/aluminio-embutir-dicroica.png`, href: "#" },
        { name: "Estacas Móviles", count: "28 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/estacas-moviles.png`, href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=Artefactos+para+L%C3%A1mparas&familia=Estacas+M%C3%B3viles" },
      ]},
      { group: "Otros", items: [
        { name: "Guirnaldas", count: "28 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/guirnaldas.png`, href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=Artefactos+para+L%C3%A1mparas&familia=Guirnaldas" },
        { name: "Portalámparas", count: "28 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/portalamparas.png`, href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=Artefactos+para+L%C3%A1mparas&familia=Portal%C3%A1mparas" },
        { name: "Tubos", count: "28 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/artefactos-tubos.png`, href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=Artefactos+para+L%C3%A1mparas&familia=Artefactos+Tubos" },
      ]},
    ],
  },
  {
    id: "decorativas",
    label: "Decorativas",
    viewAllHref: "#",
    promo: {
      tagline: "Diseño que ilumina, luz que decora",
      subtitle: "Piezas pensadas para ser protagonistas del ambiente, no solo para iluminar.",
    },
    layout: "flat",
    items: [
      { name: "Inalámbricas", count: "28 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/veladores-inalambricos.png`, href: "#" },
      { name: "De Mesa", count: "28 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/veladores2.png`, href: "#" },
      { name: "De Pie", count: "28 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/veladores-de-pie.png`, href: "#" },
    ],
  },
  {
    id: "interruptores-tomas",
    label: "Interruptores y Tomas",
    viewAllHref: "#",
    promo: {
      tagline: "El detalle que hace la diferencia",
      subtitle: "Línea de interruptores y tomas con diseño moderno y terminaciones premium para todo tipo de proyecto.",
    },
    layout: "grouped",
    groups: [
      { group: null, items: [
        { name: "LIMA", count: "61 Productos", img: "https://s3.coresagroup.com/MACROLED/250/lima.webp", href: "#", isNew: true },
        { name: "ROMA", count: "13 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/milan.png`, href: "#" },
        { name: "TOKIO", count: "9 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/milan-bastidores.png`, href: "#" },
        { name: "KINETIC", count: "6 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/kinetic.png`, href: "#", isSmart: true },
      ]},
      { group: "Monaco", items: [
        { name: "Armadas", count: "87 Productos", img: "https://s3.coresagroup.com/MACROLED/250/milan.png", href: "#" },
        { name: "Despiece", count: "25 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/milan-bastidores.png`, href: "#" },
        { name: "Tapas", count: "75 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/milan-tapas.png`, href: "#" },
        { name: "Tapa Exterior", count: "3 Productos", img: `${CDN}/250x250/MACROLED/WEB/M-CR-EXT-B_FRONT.webp`, href: "#", isNew: true },
        { name: "Luz guía", count: "10 Productos", img: `${CDN}/filters:format(webp)/250x250/MACROLED/WEB/portada_luz_pasillo.webp`, href: "#", isNew: true },
      ]},
    ],
  },
  {
    id: "rieles-magneticos",
    label: "Rieles Magnéticos",
    viewAllHref: "#",
    promo: {
      tagline: "Macroled Skyline",
      subtitle: "La línea Macroled Skyline redefine la iluminación arquitectónica con un sistema de rieles magnéticos de 48V, pensado para ofrecer seguridad, versatilidad y una estética premium en cualquier tipo de espacio.",
    },
    layout: "flat",
    items: [
      { name: "Luminarias", count: "28 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/skyline.png`, href: "#" },
      { name: "Rieles y Accesorios", count: "28 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/skyline-rieles.png`, href: "#" },
      { name: "Fuentes", count: "28 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/skyline-fuentes.png`, href: "#" },
    ],
  },
  {
    id: "lineales-pro",
    label: "Lineales PRO",
    viewAllHref: "https://macroled.webflow.io/nuevo-productos?macrofamilia=Lineales+PRO&familia=Lineales+PRO",
    isNew: true,
    promo: {
      tagline: "La nueva generación de iluminación lineal",
      subtitle: "Líneas de luz continua de alto rendimiento, pensadas para proyectos que buscan diseño arquitectónico limpio y potencia lumínica superior.",
    },
    layout: "flat",
    items: [
      { name: "Lineales", count: "6 Productos", img: `${CDN}/250x250/MACROLED/WEB/LP-FCP-1200-30W-B-CCT_FRONT.webp`, href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=Lineales+PRO&familia=Lineales+PRO" },
      { name: "Lente Difusor", count: "9 Productos", img: `${CDN}/180x180/MACROLED/WEB/PORTADA-DIFUSORES-LINEALES-PRO.webp`, href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=Lineales+PRO&familia=Lente+Difusor" },
      { name: "Conectores", count: "3 Productos", img: `${CDN}/140x140/MACROLED/WEB/PORTADA-CONECTORES-LINEALES-PRO.webp`, href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=Lineales+PRO&familia=Conectores" },
      { name: "Accesorios", count: "4 Productos", img: `${CDN}/180x180/MACROLED/WEB/LP-SUSP_PERS.webp`, href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=Lineales+PRO&familia=Accesorios" },
      { name: "Driver", count: "5 Productos", img: `${CDN}/140x140/MACROLED/WEB/PORTADA-DRIVERS-LINEALES-PRO.webp`, href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=Lineales+PRO&familia=Driver" },
    ],
  },
  {
    id: "luminarias-ext",
    label: "Luminarias Integradas Exterior",
    viewAllHref: "#",
    promo: {
      tagline: "Iluminación que resiste todo, en cualquier lugar",
      subtitle: "Soluciones robustas con protección IP para exteriores, fachadas, jardines y espacios públicos.",
    },
    layout: "flat",
    items: [
      { name: "Solar", count: "28 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/solar.png`, href: "#" },
      { name: "Tortugas", count: "28 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/tortugas.png`, href: "#" },
      { name: "Estanco Premium", count: "28 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/lineales.png`, href: "#" },
      { name: "Estacas Móviles", count: "28 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/estacas-led-integrado.png`, href: "#" },
    ],
  },
  {
    id: "luminarias-proyecto",
    label: "Luminarias de Proyecto",
    viewAllHref: "#",
    promo: {
      tagline: "Pensadas a medida de cada obra",
      subtitle: "Línea completa de luminarias profesionales diseñadas para proyectos de iluminación deportiva e industrial, que combinan alto rendimiento, eficiencia energética y durabilidad.",
    },
    layout: "grouped",
    groups: [
      { group: "Reflectores", items: [
        { name: "Invictus", count: "28 Productos", img: `${CDN}/250x250/filters:format(png)/MACROLED/1000/INVICTUS-1000W-10D-857.png`, href: "#" },
        { name: "Titan", count: "28 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/titan.png`, href: "#" },
        { name: "Focus", count: "28 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/focus.png`, href: "#" },
        { name: "Olimpus", count: "28 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/olimpus.png`, href: "#" },
        { name: "Industrial", count: "28 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/industrial.png`, href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=Luminarias+de+Proyecto&familia=Reflector+Industrial" },
      ]},
      { group: "Galponeras", items: [
        { name: "Highbay PRO", count: "28 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/PHB-200W-90D-857-CW.png`, href: "#" },
        { name: "Highbay Standard", count: "28 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/SHB-200W.png`, href: "#" },
        { name: "Highbay Classic", count: "28 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/galponeras-eco.webp`, href: "#" },
      ]},
      { group: "Luz de Calle", items: [
        { name: "Luz de calle Standard", count: "28 Productos", img: `${CDN}/250x250/MACROLED/WEB/SLG2-100W-757-CW_FRONT.webp`, href: "#", isNew: true },
        { name: "Lumax", count: "28 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/lumax.png`, href: "#", isNew: true },
        { name: "Pública", count: "28 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/luz-de-calle.png`, href: "#" },
        { name: "Solar", count: "28 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/proyectoSolar.png`, href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=Luminarias+de+Proyecto&familia=Solar" },
      ]},
      { group: "Farolas", items: [
        { name: "PRO", count: "28 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/farolas.png`, href: "#" },
      ]},
    ],
  },
  {
    id: "luminarias-int",
    label: "Luminarias Integradas Interior",
    viewAllHref: "#",
    promo: {
      tagline: "Confort lumínico para cada espacio interior",
      subtitle: "Soluciones integradas que combinan estética y eficiencia para hogares, oficinas y comercios.",
    },
    layout: "flat",
    items: [
      { name: "Listones LED", count: "28 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/liston-led.png`, href: "#" },
      { name: "Luces de Emergencia", count: "28 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/emergencia.png`, href: "#" },
    ],
  },
  {
    id: "paneles",
    label: "Paneles",
    viewAllHref: "#",
    promo: {
      tagline: "Luz uniforme, diseño minimalista",
      subtitle: "Ideales para oficinas, comercios e instituciones que buscan una iluminación pareja y sin sombras.",
    },
    layout: "grouped",
    groups: [
      { group: "Paneles de 6 a 24W", items: [
        { name: "Embutir Blanco", count: "28 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/embutir-blanco.png`, href: "#" },
        { name: "Embutir Negro", count: "28 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/embutir-negro.png`, href: "#" },
        { name: "Plafón Blanco", count: "28 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/plafon-blanco.png`, href: "#" },
        { name: "Plafón Negro", count: "28 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/plafon-negro.png`, href: "#" },
        { name: "Plafón Platil", count: "28 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/plafon-platil.png`, href: "#" },
      ]},
      { group: "Paneles de 6 a 36W", isNew: true, items: [
        { name: "6 a 36 Backlight CCT", count: "28 Productos", img: `${CDN}/250x250/MACROLED/WEB/GRAN-FORMATO-P40.webp`, href: "#" },
      ]},
      { group: "Gran Formato", items: [
        { name: "Gran Formato 40W", count: "28 Productos", img: `${CDN}/250x250/MACROLED/WEB/GRAN-FORMATO-P40.webp`, href: "#" },
        { name: "Gran Formato 48W", count: "28 Productos", img: `${CDN}/250x250/MACROLED/WEB/GRAN-FORMATO-P40.webp`, href: "#" },
        { name: "Gran Formato Backlight", count: "28 Productos", img: `${CDN}/250x250/MACROLED/WEB/GRAN-FORMATO-P40.webp`, href: "#", isNew: true },
      ]},
      { group: "Móviles y COB", items: [
        { name: "Móviles", count: "28 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/moviles.png`, href: "#" },
        { name: "COB", count: "28 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/premium.png`, href: "#" },
      ]},
      { group: "Otros", items: [
        { name: "Drivers", count: "28 Productos", img: `${CDN}/250x250/MACROLED/WEB/DRIVERS.webp`, href: "#" },
        { name: "Accesorios", count: "28 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/accesorios-paneles.png`, href: "#" },
      ]},
    ],
  },
  {
    id: "reflectores",
    label: "Reflectores",
    viewAllHref: "#",
    promo: {
      tagline: "Potencia lumínica para grandes espacios",
      subtitle: "Ideales para exteriores, canchas, depósitos y fachadas que necesitan alto rendimiento.",
    },
    layout: "flat",
    items: [
      { name: "Reflectores PRO 2026", count: "28 Productos", img: `${CDN}/filters:format(webp)/250x250/MACROLED/WEB/REFLECTORES-PRO.webp`, href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=Reflectores&familia=Reflectores+PRO+2026" },
      { name: "Reflectores PRO 2025", count: "28 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/reflectores-pro.png`, href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=Reflectores&familia=Reflectores+PRO+2025" },
      { name: "Reflectores PRO Smart", count: "28 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/reflectores-smart.png`, href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=Reflectores&familia=Reflectores+PRO+Smart", isSmart: true },
      { name: "Reflectores Standard", count: "28 Productos", img: `${CDN}/filters:format(webp)/250x250/MACROLED/WEB/REFLECTORES-STANDARD.webp`, href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=Reflectores&familia=Reflectores+Standard" },
      { name: "Reflectores Classic", count: "14 Productos", img: `${CDN}/filters:format(webp)/250x250/MACROLED/WEB/REFLECTORES-CLASSIC.webp`, href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=Reflectores&familia=Reflectores+Classic" },
      { name: "Reflectores Solar", count: "14 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/reflector-solar.png`, href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=Reflectores&familia=Reflectores+Solar" },
    ],
  },
  {
    id: "tiras-led",
    label: "Tiras LED",
    viewAllHref: "#",
    promo: {
      tagline: "Flexibilidad infinita para tu proyecto",
      subtitle: "Perfectas para iluminación decorativa, arquitectónica o funcional, adaptándose a cualquier superficie.",
    },
    layout: "flat",
    items: [
      { name: "2835", count: "22 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/smd2835.png`, href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=Tiras+LED&familia=Tiras+SMD&subfamilia=2835" },
      { name: "5050", count: "27 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/smd5050a.png`, href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=Tiras+LED&familia=Tiras+SMD&subfamilia=5050" },
      { name: "2216", count: "1 Producto", img: `${CDN}/filters:format(webp)/MACROLED/250/smd2216.png`, href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=Tiras+LED&familia=Tiras+SMD&subfamilia=2216" },
      { name: "COB", count: "15 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/cob.png`, href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=Tiras+LED&familia=Tiras+COB", isNew: true },
      { name: "NEON", count: "45 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/neon.png`, href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=Tiras+LED&familia=Tiras+Ne%C3%B3n", isNew: true },
      { name: "Perfilería", count: "67 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/perfileria.png`, href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=Tiras+LED&familia=Perfiles+de+Aluminio", isNew: true },
      { name: "Sensores", count: "5 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/sensores.png`, href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=Tiras+LED&familia=Sensores", isNew: true },
      { name: "Accesorios", count: "22 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/conectores-tiras-LED-2.png`, href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=Tiras+LED&familia=Tiras+SMD&subfamilia=Conectores", isNew: true },
      { name: "Controladoras", count: "11 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/controladoras.png`, href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=Tiras+LED&familia=Controladoras", isSmart: true },
      { name: "Fuentes", count: "Powerswicht", img: `${CDN}/filters:format(webp)/MACROLED/250/fuentes.png`, href: "#" },
    ],
  },
  {
    id: "sensores",
    label: "Sensores",
    viewAllHref: "https://macroled.webflow.io/nuevo-productos?macrofamilia=Sensores+y+Fotoc%C3%A9lulas",
    promo: {
      tagline: "Iluminación inteligente, encendido automático",
      subtitle: "Tecnología que suma eficiencia y comodidad, activando la luz solo cuando la necesitás.",
    },
    layout: "flat",
    items: [
      { name: "Smart", count: "8 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/sensores-smart.png`, href: "#", isSmart: true },
      { name: "Sensores", count: "9 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/sensores-y-fotocelulas.png`, href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=Sensores+y+Fotoc%C3%A9lulas&familia=Sensores" },
      { name: "Fotocélulas", count: "5 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/fotocelulas.png`, href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=Sensores+y+Fotoc%C3%A9lulas&familia=Fotoc%C3%A9lulas" },
    ],
  },
  {
    id: "luces-auto",
    label: "Luces de Auto",
    viewAllHref: "#",
    promo: {
      tagline: "Visibilidad y estilo también en la ruta",
      subtitle: "Línea de iluminación automotriz con tecnología LED de alto impacto.",
      partner: {
        text: "*Esta línea de productos es comercializada por nuestro aliado comercial:",
        logo: "https://cdn.prod.website-files.com/65f1fdd7248b6709fdebe904/69eb798acdad6614737fd0fa_em-estrada.svg",
        alt: "EM Estrada",
      },
    },
    layout: "flat",
    items: [
      { name: "Lámparas Principales", count: "35 Productos", img: `${CDN}/filters:format(webp)/250x250/MACROLED/WEB/luces-auto/principales/principales_portada.png`, href: "#" },
      { name: "Lámparas Auxiliares", count: "61 Productos", img: `${CDN}/filters:format(webp)/250x250/MACROLED/WEB/luces-auto/auxiliares/auxiliares-portada.png`, href: "#" },
      { name: "Faros y Barras", count: "33 Productos", img: `${CDN}/filters:format(webp)/250x250/MACROLED/WEB/luces-auto/farosybarras/portada_faros.png`, href: "#" },
    ],
  },
  {
    id: "smart",
    label: "Smart",
    viewAllHref: "#",
    isSmart: true,
    promo: {
      tagline: "Tu iluminación, a un touch de distancia",
      subtitle: "Productos conectados que se controlan desde el celular, para un hogar más inteligente y personalizado.",
    },
    layout: "flat",
    items: [
      { name: "Controladoras RGB", count: "11 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/controladoras.png`, href: "#" },
      { name: "Skyline", count: "126 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/skyline.png`, href: "#" },
      { name: "Lámparas", count: "2 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/smartnew.png`, href: "#" },
      { name: "Reflectores", count: "2 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/reflectores-smart.png`, href: "#" },
      { name: "Teclas y Tomas", count: "20 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/roma.png`, href: "#" },
      { name: "Sensores", count: "8 Productos", img: `${CDN}/filters:format(webp)/MACROLED/250/sensores-smart.png`, href: "#" },
    ],
  },
];

if (typeof window !== "undefined") window.MEGAMENU_DATA = MEGAMENU_DATA;
if (typeof module !== "undefined") module.exports = MEGAMENU_DATA;

(function () {
  var ALL_PRODUCTS_URL = "https://macroled.webflow.io/nuevo-productos";
  var GROUP_AS_FAMILIA = {
    "interruptores-tomas": true,
    "paneles": true,
    "luminarias-proyecto": true
  };
  // En artefactos el grupo es la materialidad (subfamilia), no la familia.
  var GROUP_AS_SUBFAMILIA = {
    "artefactos-lamparas": true
  };
  var FAMILIA_ALIAS = {
    "Titan": "TITAN",
    "Olimpus": "OLIMPUS",
    "Lumax": "Luz de Calle LUMAX",
    "Luz de calle Standard": "Luz de Calle Standard",
    "Highbay PRO": "Highbay PRO 2026",
    "Inalámbricas": "Luminarias Inalámbricas",
    "De Mesa": "Luminarias de Mesa",
    "De Pie": "Luminarias de Pie"
  };
  function aliasName(name) {
    return FAMILIA_ALIAS[name] || name;
  }
  function familiaFromItem(family, item) {
    return aliasName(item.name);
  }
  function catalogUrl(macro, familia, subfamilia) {
    var p = new URLSearchParams();
    if (macro) p.set("macrofamilia", macro);
    if (familia) p.set("familia", familia);
    if (subfamilia) p.set("subfamilia", subfamilia);
    var qs = p.toString();
    return ALL_PRODUCTS_URL + (qs ? "?" + qs : "");
  }
  function hydrateHrefs(data) {
    (data || []).forEach(function (family) {
      if (!family.viewAllHref || family.viewAllHref === "#") {
        family.viewAllHref = catalogUrl(family.label);
      }
      (family.items || []).forEach(function (item) {
        if (!item.href || item.href === "#") {
          item.href = catalogUrl(family.label, familiaFromItem(family, item));
        }
      });
      (family.groups || []).forEach(function (g) {
        (g.items || []).forEach(function (item) {
          if (item.href && item.href !== "#") return;
          if (GROUP_AS_SUBFAMILIA[family.id] && g.group) {
            item.href = catalogUrl(family.label, aliasName(item.name), g.group === "Otros" ? "" : g.group);
          } else if (GROUP_AS_FAMILIA[family.id] && g.group) {
            item.href = catalogUrl(family.label, g.group, aliasName(item.name));
          } else {
            item.href = catalogUrl(family.label, aliasName(item.name));
          }
        });
      });
    });
  }
  if (typeof window !== "undefined" && window.MEGAMENU_DATA) {
    hydrateHrefs(window.MEGAMENU_DATA);
  }
  window.MACROLED_MENU = window.MACROLED_MENU || {};
  window.MACROLED_MENU.catalogUrl = catalogUrl;
  window.MACROLED_MENU.ALL_PRODUCTS_URL = ALL_PRODUCTS_URL;
})();

(function () {
  var lockY = 0;
  var lockCount = 0;
  function lockPageScroll() {
    if (lockCount === 0) {
      lockY = window.scrollY || window.pageYOffset || 0;
      document.documentElement.classList.add("mm-scroll-lock");
      document.body.classList.add("mm-scroll-lock");
      document.body.style.setProperty("position", "fixed", "important");
      document.body.style.setProperty("top", -lockY + "px", "important");
      document.body.style.setProperty("left", "0", "important");
      document.body.style.setProperty("right", "0", "important");
      document.body.style.setProperty("width", "100%", "important");
      document.body.style.setProperty("overflow", "hidden", "important");
      document.documentElement.style.setProperty("overflow", "hidden", "important");
    }
    lockCount++;
  }
  function unlockPageScroll() {
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount === 0) {
      document.documentElement.classList.remove("mm-scroll-lock");
      document.body.classList.remove("mm-scroll-lock");
      document.body.style.removeProperty("position");
      document.body.style.removeProperty("top");
      document.body.style.removeProperty("left");
      document.body.style.removeProperty("right");
      document.body.style.removeProperty("width");
      document.body.style.removeProperty("overflow");
      document.documentElement.style.removeProperty("overflow");
      window.scrollTo(0, lockY);
    }
  }
  window.MACROLED_MENU = window.MACROLED_MENU || {};
  window.MACROLED_MENU.lockPageScroll = lockPageScroll;
  window.MACROLED_MENU.unlockPageScroll = unlockPageScroll;
})();

(function () {
  if (window.__macroledMegamenuInit) return;
  window.__macroledMegamenuInit = true;

  // URL del catálogo completo (todas las macrofamilias, sin filtro)
  var ALL_PRODUCTS_URL = (window.MACROLED_MENU && window.MACROLED_MENU.ALL_PRODUCTS_URL) || "https://macroled.webflow.io/nuevo-productos";

  function escapeHtml(v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function chevronRightSvg() {
    return '<svg viewBox="0 -960 960 960" fill="currentColor"><path d="M647-440H160v-80h487L423-744l57-56 320 320-320 320-57-56 224-224Z"/></svg>';
  }

  function arrowDownSvg() {
    return '<svg xmlns="http://www.w3.org/2000/svg" height="10" viewBox="0 -960 960 960" width="14" fill="currentColor" aria-hidden="true"><path d="m321-80-71-71 329-329-329-329 71-71 400 400L321-80Z"/></svg>';
  }

  function renderTile(item) {
    return `
      <a class="mm-tile" href="${escapeHtml(item.href && item.href !== "#" ? item.href : "#")}">
        <img class="mm-tile-img" src="${escapeHtml(item.img)}" alt="" loading="lazy" />
        <div class="mm-tile-text">
          <h4>${escapeHtml(item.name)}</h4>
          <span>${escapeHtml(item.count)}</span>
        </div>
        ${item.isNew || item.isSmart ? `
        <span class="mm-tile-badges">
          ${item.isNew ? `<span class="mm-tab-new">Nuevo</span>` : ""}
          ${item.isSmart ? `<span class="mm-tab-smart">Smart</span>` : ""}
        </span>` : ""}
      </a>
    `;
  }

  function renderGroupSection(group) {
    return `
      <div class="mm-group-section">
        ${group.group ? `<div class="mm-group-label">${escapeHtml(group.group)}</div>` : ""}
        <div class="mm-tile-grid">${group.items.map((item) => renderTile({
          ...item,
          isNew: item.isNew || group.isNew,
          isSmart: item.isSmart || group.isSmart,
        })).join("")}</div>
        ${
          group.viewAllHref
            ? `<a class="mm-group-viewall" href="${escapeHtml(group.viewAllHref)}">Ver todo</a>`
            : ""
        }
      </div>
    `;
  }

  function getPromo(family) {
    const promo = family.promo || {};
    return {
      eyebrow: family.label,
      title: String(promo.tagline || family.label).replace(/\.+$/, ""),
      subtitle: promo.subtitle || "Conocé cada solución y encontrá la que mejor se adapta a tu proyecto.",
      partner: promo.partner,
      ctaLabel: "Ver línea completa",
      href: family.viewAllHref || "#",
      catalogLabel: "Catálogo",
      catalogHref: ALL_PRODUCTS_URL,
    };
  }

  function renderPromo(family) {
    const p = getPromo(family);
    return `
      <div class="mm-promo">
        <div class="mm-promo-text">
          <div class="mm-promo-eyebrow">${escapeHtml(p.eyebrow)}</div>
          <div class="mm-promo-title">${escapeHtml(p.title)}</div>
          <p class="mm-promo-subtitle">${escapeHtml(p.subtitle)}</p>
        </div>
        <div class="mm-promo-bottom">
          <div class="mm-promo-actions">
            <a class="mm-promo-cta" href="${escapeHtml(p.href)}">${escapeHtml(p.ctaLabel)}</a>
          </div>
          ${p.partner ? `
          <div class="mm-promo-partner">
            <p>${escapeHtml(p.partner.text)}</p>
            <img src="${escapeHtml(p.partner.logo)}" alt="${escapeHtml(p.partner.alt || "")}" />
          </div>` : ""}
        </div>
      </div>
    `;
  }

  function renderContent(family) {
    const groups = family.layout === "grouped"
      ? family.groups
      : [{ group: null, items: family.items, isSmart: family.isSmart, isNew: family.isNew }];

    return `
      <div class="mm-content-wrap">
        <div class="mm-content-col">
          <div class="mm-content">
            <div class="mm-heading-row">
              <h3>${escapeHtml(family.label)}</h3>
            </div>
            <div class="mm-groups">${groups.map(renderGroupSection).join("")}</div>
          </div>
          <div class="mm-scroll-fade" aria-hidden="true"></div>
          <button type="button" class="mm-scroll-hint" aria-label="Desplazar hasta el final">${arrowDownSvg()}</button>
        </div>
        ${renderPromo(family)}
      </div>
    `;
  }

  function buildMegamenu(root) {
    const data = window.MEGAMENU_DATA || [];
    if (!data.length) return;

    root.classList.add("mm-root");
    root.innerHTML = `
      <button class="mm-trigger" type="button" aria-expanded="false">
        Productos ${arrowDownSvg()}
      </button>
      <div class="mm-overlay"></div>
      <div class="mm-panel" role="menu">
        <div class="mm-body">
          <div class="mm-tabs"></div>
          <div class="mm-panel-body"></div>
        </div>
        <div class="mm-all-products-bar">
          <a href="${ALL_PRODUCTS_URL}">Ver todos los productos Macroled ${chevronRightSvg()}</a>
        </div>
      </div>
    `;

    const trigger = root.querySelector(".mm-trigger");
    const overlay = root.querySelector(".mm-overlay");
    const tabsEl = root.querySelector(".mm-tabs");
    const contentEl = root.querySelector(".mm-panel-body");

    let activeId = data[0].id;

    function renderTabs() {
      tabsEl.innerHTML = data
        .map(
          (f) => `
        <button class="mm-tab${f.id === activeId ? " is-active" : ""}" type="button" data-id="${f.id}">
          ${escapeHtml(f.label)}${f.isNew || (f.promo && f.promo.isNew) ? `<span class="mm-tab-new">Nuevo</span>` : ""}
        </button>
      `
        )
        .join("");
    }

    function updateScrollChrome() {
      const content = contentEl.querySelector(".mm-content");
      const fade = contentEl.querySelector(".mm-scroll-fade");
      const hint = contentEl.querySelector(".mm-scroll-hint");
      if (!content || !fade || !hint) return;
      const available = content.scrollHeight - content.clientHeight;
      const meaningful = available >= 64;
      const nearStart = meaningful && content.scrollTop < 28;
      fade.classList.toggle("is-visible", nearStart);
      hint.classList.toggle("is-visible", nearStart);
    }

    function setActive(id) {
      activeId = id;
      const family = data.find((f) => f.id === id);
      if (!family) return;
      renderTabs();
      contentEl.innerHTML = renderContent(family);
      const content = contentEl.querySelector(".mm-content");
      const hint = contentEl.querySelector(".mm-scroll-hint");
      if (content) {
        content.scrollTop = 0;
        content.addEventListener("scroll", updateScrollChrome, { passive: true });
      }
      if (hint) {
        hint.addEventListener("click", () => {
          const el = contentEl.querySelector(".mm-content");
          if (!el) return;
          el.scrollTo({ top: el.scrollHeight - el.clientHeight, behavior: "smooth" });
        });
      }
      requestAnimationFrame(updateScrollChrome);
    }

    function open() {
      if (root.classList.contains("is-open")) return;
      setActive("lamparas");
      if (tabsEl) tabsEl.scrollTop = 0;
      root.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
      if (window.MACROLED_MENU && window.MACROLED_MENU.lockPageScroll) {
        window.MACROLED_MENU.lockPageScroll();
      }
      requestAnimationFrame(updateScrollChrome);
    }

    function close() {
      if (!root.classList.contains("is-open")) return;
      root.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
      if (window.MACROLED_MENU && window.MACROLED_MENU.unlockPageScroll) {
        window.MACROLED_MENU.unlockPageScroll();
      }
    }

    function stopPageScroll(e) {
      if (!root.classList.contains("is-open")) return;
      var target = e.target;
      if (!target || !target.closest) return;
      var area = target.closest(".mm-content, .mm-tabs");
      if (!area) {
        e.preventDefault();
        return;
      }
      if (e.type !== "wheel") return;
      var delta = e.deltaY;
      if (e.deltaMode === 1) delta *= 16;
      if (e.deltaMode === 2) delta *= area.clientHeight;
      var maxScroll = Math.max(0, area.scrollHeight - area.clientHeight);
      if (maxScroll < 8) {
        e.preventDefault();
        return;
      }
      var next = Math.max(0, Math.min(maxScroll, area.scrollTop + delta));
      e.preventDefault();
      area.scrollTop = next;
    }
    document.addEventListener("wheel", stopPageScroll, { passive: false, capture: true });
    document.addEventListener("touchmove", stopPageScroll, { passive: false, capture: true });

    trigger.addEventListener("click", () => {
      root.classList.contains("is-open") ? close() : open();
    });
    overlay.addEventListener("click", close);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });

    // Cambiar de familia al pasar el mouse (desktop) o click (touch)
    tabsEl.addEventListener("click", (e) => {
      const btn = e.target.closest(".mm-tab");
      if (btn) setActive(btn.dataset.id);
    });
    tabsEl.addEventListener(
      "mouseover",
      (e) => {
        if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
        const btn = e.target.closest(".mm-tab");
        if (btn && btn.dataset.id !== activeId) setActive(btn.dataset.id);
      },
      true
    );

    window.addEventListener("resize", updateScrollChrome, { passive: true });

    setActive(activeId);
  }

  function init() {
    document.querySelectorAll("#macroled-menu [data-megamenu-root]").forEach(buildMegamenu);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
  window.Webflow = window.Webflow || [];
  window.Webflow.push(init);
})();

(function () {
  var ALL_PRODUCTS_URL = (window.MACROLED_MENU && window.MACROLED_MENU.ALL_PRODUCTS_URL) || "https://macroled.webflow.io/nuevo-productos";
  var MOBILE_MAX = 1100;

  function esc(v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  var TS_FILTER = "tipo_registro:=producto && es_principal:true";
  var TS_QUERY_BY = "nombre_typesense,sku,descripcion";
  var CDN_HOST = "https://d1zltvqju4u8ql.cloudfront.net";

  function productName(doc) {
    return String((doc && (doc.nombre_typesense || doc.nombre)) || "").trim();
  }

  function optimizeImg(url, size) {
    size = size || "200x200";
    if (!url) return "";
    if (String(url).indexOf("cloudfront.net") !== -1) return url;
    var match = String(url).match(/^https?:\/\/s3\.coresagroup\.com\/(.+)$/);
    if (!match) return url;
    return CDN_HOST + "/fit-in/" + size + "/filters:format(webp)/" + match[1];
  }

  function imageUrlFromItem(item) {
    if (!item) return "";
    if (typeof item === "object") {
      item = item.url || item.src || item.imagen || item.image || "";
    }
    var u = String(item || "").trim().replace(/^["'\[]+|["'\]]+$/g, "").trim();
    if (!u || /^null$/i.test(u) || u === "#") return "";
    if (/\.(mp4|webm|mov|m3u8)(\?|#|$)/i.test(u)) return "";
    if (u.indexOf("//") === 0) u = "https:" + u;
    if (!/^https?:\/\//i.test(u)) return "";
    return u;
  }

  function firstImage(doc) {
    if (!doc) return "";
    var raw = doc.multiimagen || doc.multiimage || doc.imagen || doc.image;
    var i;
    for (i = 0; i < 3 && typeof raw === "string"; i++) {
      var t = raw.trim();
      if (!(t.charAt(0) === "[" || t.charAt(0) === "{" || t.charAt(0) === '"')) break;
      try { raw = JSON.parse(t); } catch (_) { break; }
    }
    var items = [];
    if (Array.isArray(raw)) items = raw;
    else if (raw && typeof raw === "object") items = [raw];
    else if (typeof raw === "string" && raw.trim()) {
      items = raw.split(/[;,|]/).map(function (s) { return s.trim(); }).filter(Boolean);
    }
    for (i = 0; i < items.length; i++) {
      var u = imageUrlFromItem(items[i]);
      if (u) return optimizeImg(u, "200x200");
    }
    return "";
  }

  /* ---- Desktop Typesense (lupa que se desliza al abrir) ---- */
  (function () {
    var wrapper = document.getElementById("mm-ts-search-wrapper");
    var input = document.getElementById("mm-ts-search-input");
    var btn = document.getElementById("mm-ts-search-btn");
    var resultsBox = document.getElementById("mm-ts-search-results");
    if (!wrapper || !input || !btn || !resultsBox) return;
    var searchBox = wrapper.closest(".mm-nav-search");

    var tsClient = null;
    try {
      if (typeof Typesense !== "undefined") {
        tsClient = new Typesense.Client({
          nodes: [{ host: "typesense.coresagroup.com", port: 443, protocol: "https" }],
          apiKey: "g0oiNYY8THGuU9jnCsvqIH1X9HtvYRCR",
          connectionTimeoutSeconds: 3,
        });
      }
    } catch (err) {}

    var debounceTimer = null;
    var PRODUCTS_PAGE_URL = ALL_PRODUCTS_URL;

    function searchResultsPageUrl(query) {
      return PRODUCTS_PAGE_URL + "?q=" + encodeURIComponent(query);
    }

    function isOpen() {
      return wrapper.classList.contains("is-open");
    }

    function openSearch() {
      wrapper.classList.add("is-open");
      if (searchBox) searchBox.classList.add("is-open");
      input.setAttribute("aria-expanded", "true");
      btn.setAttribute("aria-label", "Cerrar búsqueda");
      setTimeout(function () { input.focus(); }, 220);
    }

    function closeSearch() {
      wrapper.classList.remove("is-open");
      wrapper.classList.remove("has-results");
      if (searchBox) searchBox.classList.remove("is-open");
      input.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-label", "Abrir búsqueda");
      input.value = "";
      resultsBox.style.display = "none";
      resultsBox.innerHTML = "";
      input.blur();
    }

    function hideResults() {
      resultsBox.style.display = "none";
      resultsBox.innerHTML = "";
      wrapper.classList.remove("has-results");
    }

    function showResults() {
      if (!isOpen()) return;
      resultsBox.style.display = "block";
      wrapper.classList.add("has-results");
    }

    function runSearch(query) {
      if (!tsClient) {
        resultsBox.innerHTML = '<div style="padding:12px 16px; font-size:13px; color:#8a8580;">Buscador no disponible</div>';
        showResults();
        return;
      }
      tsClient.collections("Macroled_Prueba").documents().search({
        q: query,
        query_by: TS_QUERY_BY,
        filter_by: TS_FILTER,
        per_page: 5,
      }).then(function (result) {
        renderResults(result.hits || [], result.found || 0, query);
      }).catch(function (err) {
        console.error("Error buscando en Typesense:", err);
        resultsBox.innerHTML = '<div style="padding:12px 16px; font-size:13px; color:#8a8580;">Error al buscar</div>';
        showResults();
      });
    }

    function renderResults(hits, found, query) {
      if (!isOpen()) return;
      if (hits.length === 0) {
        resultsBox.innerHTML =
          '<div style="padding:16px;">' +
            '<p style="font-size:13px; color:#8a8580; margin:0; text-align:center;">' +
              'No se encontraron resultados para <strong>&quot;' + esc(query) + '&quot;</strong>' +
            "</p>" +
          "</div>" +
          '<a href="' + searchResultsPageUrl(query) + '" class="ts-row ts-row-footer">' +
            "Explorá nuestros productos" +
            '<span class="ts-arrow"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
              '<line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline>' +
            "</svg></span>" +
          "</a>";
        resultsBox.style.display = "block";
        showResults();
        return;
      }

      var rowsHtml = hits.map(function (hit) {
        var doc = hit.document;
        var href = esc(doc.link_ficha_web || "#");
        var imgSrc = esc(firstImage(doc));
        var nombre = esc(productName(doc));
        var sku = esc(doc.sku || "");
        var nuevoPill = doc.nuevo
          ? '<span class="ts-nuevo">nuevo</span>'
          : "";
        return (
          '<a href="' + href + '" class="ts-row">' +
            (imgSrc
              ? '<img class="ts-thumb" src="' + imgSrc + '" alt="" />'
              : '<span class="ts-thumb" aria-hidden="true"></span>') +
            '<div class="ts-meta">' +
              '<div class="ts-name">' + nombre + nuevoPill + "</div>" +
              '<div class="ts-sku">' + sku + "</div>" +
            "</div>" +
            '<span class="ts-arrow">' +
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                '<line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline>' +
              "</svg>" +
            "</span>" +
          "</a>"
        );
      }).join("");

      rowsHtml +=
        '<a href="' + searchResultsPageUrl(query) + '" class="ts-row ts-row-more">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;">' +
            '<circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>' +
          "</svg>" +
          '<span class="ts-meta">Ver todos los resultados (' + found + ') para <strong>&quot;' + esc(query) + '&quot;</strong></span>' +
          '<span class="ts-arrow">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
              '<line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline>' +
            "</svg>" +
          "</span>" +
        "</a>";

      resultsBox.innerHTML = rowsHtml;
      showResults();
    }

    input.addEventListener("input", function () {
      clearTimeout(debounceTimer);
      var query = input.value.trim();
      if (!query) { hideResults(); return; }
      debounceTimer = setTimeout(function () { runSearch(query); }, 400);
    });

    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        clearTimeout(debounceTimer);
        var query = input.value.trim();
        if (query) window.location.href = searchResultsPageUrl(query);
      }
    });

    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (isOpen()) closeSearch();
      else openSearch();
    });

    document.addEventListener("click", function (e) {
      if (wrapper.contains(e.target)) return;
      resultsBox.style.display = "none";
      if (isOpen() && !input.value.trim()) closeSearch();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isOpen()) closeSearch();
    });
  })();

  function badgesHtml(item) {
    var html = "";
    if (item.isNew) html += '<span class="mm-tab-new">Nuevo</span>';
    if (item.isSmart) html += '<span class="mm-tab-smart">Smart</span>';
    return html;
  }

  function leafFromItem(item, extra) {
    extra = extra || {};
    return {
      label: item.name,
      href: item.href && item.href !== "#" ? item.href : "#",
      isNew: !!(item.isNew || extra.isNew),
      isSmart: !!(item.isSmart || extra.isSmart),
    };
  }

  function familyToItem(family) {
    var items = [];
    if (family.layout === "grouped") {
      (family.groups || []).forEach(function (g) {
        var flags = { isNew: g.isNew, isSmart: g.isSmart };
        if (!g.group) {
          (g.items || []).forEach(function (it) { items.push(leafFromItem(it, flags)); });
        } else {
          items.push({
            label: g.group,
            children: {
              title: g.group,
              items: (g.items || []).map(function (it) { return leafFromItem(it, flags); }),
            },
          });
        }
      });
    } else {
      items = (family.items || []).map(function (it) {
        return leafFromItem(it, { isNew: family.isNew, isSmart: family.isSmart });
      });
    }
    return {
      label: family.label,
      isNew: !!family.isNew,
      isSmart: !!family.isSmart,
      children: {
        title: family.label,
        viewAllHref: family.viewAllHref || ALL_PRODUCTS_URL,
        viewAllLabel: "Ver todo",
        items: items,
      },
    };
  }

  function buildMenuTree() {
    var data = window.MEGAMENU_DATA || [];
    return {
      title: "Menú",
      items: [
        {
          label: "Productos",
          children: {
            title: "Productos",
            viewAllLabel: "Ver todos",
            viewAllHref: ALL_PRODUCTS_URL,
            items: data.map(familyToItem),
          },
        },
        { label: "Proyectos Lumínicos", href: "/proyectos" },
        { label: "Novedades", href: "/novedades" },
        { label: "Descargas", href: "/descargas" },
        { label: "Contacto", href: "/contacto" },
      ],
    };
  }

  var scrollLockY = 0;
  var scrollLockCount = 0;
  function lockBodyScroll() {
    if (window.MACROLED_MENU && window.MACROLED_MENU.lockPageScroll) {
      window.MACROLED_MENU.lockPageScroll();
      return;
    }
    if (scrollLockCount === 0) {
      scrollLockY = window.scrollY || window.pageYOffset || 0;
      document.body.style.position = "fixed";
      document.body.style.top = -scrollLockY + "px";
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
    }
    scrollLockCount++;
  }
  function unlockBodyScroll() {
    if (window.MACROLED_MENU && window.MACROLED_MENU.unlockPageScroll) {
      window.MACROLED_MENU.unlockPageScroll();
      return;
    }
    scrollLockCount = Math.max(0, scrollLockCount - 1);
    if (scrollLockCount === 0) {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollLockY);
    }
  }

  /* ---- Search overlay ---- */
  (function () {
    var TYPESENSE_HOST = "typesense.coresagroup.com";
    var tsClient = null;
    try {
      if (typeof Typesense !== "undefined") {
        tsClient = new Typesense.Client({
          nodes: [{ host: TYPESENSE_HOST, port: 443, protocol: "https" }],
          apiKey: "g0oiNYY8THGuU9jnCsvqIH1X9HtvYRCR",
          connectionTimeoutSeconds: 3,
        });
      }
    } catch (err) {}

    var searchTrigger = document.getElementById("mm-searchTrigger");
    var searchOverlay = document.getElementById("mm-searchOverlay");
    var searchBackBtn = document.getElementById("mm-searchBackBtn");
    var input = document.getElementById("mm-searchOverlayInput");
    var resultsBox = document.getElementById("mm-searchOverlayResults");
    var debounceTimer = null;
    if (!searchTrigger || !searchOverlay || !input) return;

    function openSearch() {
      searchOverlay.classList.add("open");
      lockBodyScroll();
      setTimeout(function () { input.focus(); }, 150);
    }
    function closeSearch() {
      searchOverlay.classList.remove("open");
      unlockBodyScroll();
      input.value = "";
      resultsBox.innerHTML = "";
      input.blur();
    }
    searchTrigger.addEventListener("click", openSearch);
    searchBackBtn.addEventListener("click", closeSearch);

    function runSearch(query) {
      if (!tsClient) {
        resultsBox.innerHTML = '<div class="ts-empty" style="padding:40px 20px;text-align:center;color:#8a94a0;font-size:14px;">Buscador no disponible</div>';
        return;
      }
      tsClient.collections("Macroled_Prueba").documents().search({
        q: query, query_by: TS_QUERY_BY, filter_by: TS_FILTER, per_page: 5,
      }).then(function (result) {
        var hits = result.hits || [];
        var found = result.found || 0;
        if (!hits.length) {
          resultsBox.innerHTML = '<div class="ts-empty" style="padding:40px 20px;text-align:center;color:#8a94a0;font-size:14px;">No se encontraron resultados</div>';
          return;
        }
        resultsBox.innerHTML = hits.map(function (hit) {
          var doc = hit.document;
          var href = doc.link_ficha_web || "";
          var tag = href ? "a" : "div";
          var hrefAttr = href ? ' href="' + esc(href) + '"' : "";
          var imgSrc = firstImage(doc);
          return "<" + tag + hrefAttr + ' class="ts-row" style="display:flex;align-items:center;gap:12px;padding:12px 16px;text-decoration:none;color:inherit;border-bottom:1px solid #ececef;">' +
            (imgSrc
              ? '<img src="' + esc(imgSrc) + '" alt="" style="width:48px;height:48px;object-fit:contain;border-radius:6px;flex-shrink:0;background:#f4f6f8;" />'
              : '<span style="width:48px;height:48px;border-radius:6px;flex-shrink:0;background:#f4f6f8;"></span>') +
            '<div style="flex:1;min-width:0;"><div style="font-size:14px;font-weight:600;color:#1c2530;">' + esc(productName(doc)) + "</div>" +
            '<div style="font-size:12px;color:#8a94a0;margin-top:2px;">' + esc(doc.sku || "") + "</div></div></" + tag + ">";
        }).join("");
      }).catch(function () {
        resultsBox.innerHTML = '<div class="ts-empty" style="padding:40px 20px;text-align:center;color:#8a94a0;font-size:14px;">Error al buscar</div>';
      });
    }

    input.addEventListener("input", function () {
      clearTimeout(debounceTimer);
      var query = input.value.trim();
      if (!query) { resultsBox.innerHTML = ""; return; }
      debounceTimer = setTimeout(function () { runSearch(query); }, 400);
    });
  })();

  /* ---- Drill-down menu ---- */
  var screensEl = document.getElementById("mm-screens");
  var burgerBtn = document.getElementById("mm-burgerBtn");
  var overlay = document.getElementById("mm-menu-overlay");
  var menuPanel = document.getElementById("mm-menuPanel");
  if (!screensEl || !burgerBtn || !menuPanel) return;

  var MENU_TREE = buildMenuTree();
  var stack = [MENU_TREE];

  function renderScreen(node, direction) {
    var screen = document.createElement("div");
    screen.className = "screen";
    if (direction === "forward") screen.classList.add("enter-right");
    if (direction === "back") screen.classList.add("enter-left");
    var isRoot = stack.length === 1;
    screen.innerHTML =
      (isRoot ? "" : (
        '<div class="screen-header">' +
          '<button class="back-btn" type="button" aria-label="Volver">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
            '<span class="screen-title">' + esc(node.title) + "</span>" +
          "</button>" +
          '<a href="' + esc(node.viewAllHref || ALL_PRODUCTS_URL) + '" class="view-all-inline">' + esc(node.viewAllLabel || "Ver todo") + "</a>" +
        "</div>"
      )) +
      '<div class="screen-body"><ul class="menu-list">' +
        (node.items || []).map(function (item, i) {
          var label = '<span class="item-label">' + esc(item.label) + badgesHtml(item) + "</span>";
          if (item.children) {
            return "<li><button type=\"button\" data-action=\"forward\" data-idx=\"" + i + "\">" + label + '<span class="chevron"></span></button></li>';
          }
          return "<li><a href=\"" + esc(item.href || "#") + "\">" + label + "</a></li>";
        }).join("") +
      "</ul></div>";

    var headerBtn = screen.querySelector(".back-btn");
    if (headerBtn) headerBtn.addEventListener("click", goBack);
    screen.querySelectorAll("[data-action=forward]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var item = node.items[Number(btn.getAttribute("data-idx"))];
        if (item && item.children) goForward(item.children);
      });
    });
    return screen;
  }

  function mountInitial() {
    screensEl.innerHTML = "";
    screensEl.appendChild(renderScreen(stack[0], null));
  }

  function goForward(childNode) {
    var current = screensEl.querySelector(".screen");
    stack.push(childNode);
    var next = renderScreen(childNode, "forward");
    screensEl.appendChild(next);
    requestAnimationFrame(function () {
      current.classList.add("exit-left");
      next.classList.remove("enter-right");
    });
    setTimeout(function () { current.remove(); }, 320);
  }

  function goBack() {
    if (stack.length <= 1) return;
    var current = screensEl.querySelector(".screen");
    stack.pop();
    var prev = renderScreen(stack[stack.length - 1], "back");
    screensEl.insertBefore(prev, current);
    requestAnimationFrame(function () {
      current.classList.add("exit-right");
      prev.classList.remove("enter-left");
    });
    setTimeout(function () { current.remove(); }, 320);
  }

  function closeMenu() {
    menuPanel.classList.remove("open");
    overlay.classList.remove("open");
    burgerBtn.classList.remove("active");
    burgerBtn.setAttribute("aria-expanded", "false");
    unlockBodyScroll();
  }

  function toggleMenu() {
    var isOpen = menuPanel.classList.toggle("open");
    overlay.classList.toggle("open", isOpen);
    burgerBtn.classList.toggle("active", isOpen);
    burgerBtn.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) {
      lockBodyScroll();
      MENU_TREE = buildMenuTree();
      stack = [MENU_TREE];
      mountInitial();
    } else {
      unlockBodyScroll();
    }
  }

  burgerBtn.addEventListener("click", toggleMenu);
  overlay.addEventListener("click", closeMenu);

  window.addEventListener("resize", function () {
    if (window.innerWidth > MOBILE_MAX && menuPanel.classList.contains("open")) closeMenu();
  });
})();


