(function (window) {
  "use strict";

  const PLACEHOLDER = "assets/images/editorial-placeholder.svg";
  const g9 = { typesenseField: "subfamilia", typesenseValue: "G9", productCount: 4 };
  const category = (title, id) => ({ title, image: PLACEHOLDER, href: "#", id });
  const line = (title, description, theme, textColor, layout) => ({
    title,
    description,
    image: PLACEHOLDER,
    href: "#",
    theme,
    textColor,
    layout,
    content: { mode: "typesense", query: { ...g9 } }
  });

  /*
   * CATEGORÍAS MANUALES
   * Editar este bloque cuando una categoría o subfamilia no provenga de Typesense.
   * Cada entrada admite: title, id, image y href.
   * Un mismo grupo puede reutilizarse en la sección de categorías y dentro de
   * una línea configurada con content.mode = "static".
   */
  const MANUAL_CATEGORIES = {
    interior: [
      { ...category("Lineales PRO", "lineales-pro"), href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=Lineales+PRO", image: "https://d1zltvqju4u8ql.cloudfront.net/fit-in/350x350/MACROLED/WEB/PORTADA-LINEALES-PRO.webp", badge: "Nuevo" },
      { ...category("Skyline", "luminarias-skyline"), href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=Rieles+Magn%C3%A9ticos&familia=Luminarias", image: "https://s3.coresagroup.com/MACROLED/250/skyline.png", badge: "Nuevo" },
      { ...category("Artefactos para lámparas", "artefactos-para-lamparas"), href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=Artefactos+para+L%C3%A1mparas", image: "https://s3.coresagroup.com/MACROLED/250/policarbonato-embutir-ar111.png" },
      { ...category("Paneles", "paneles"), href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=Paneles", image: "https://d1zltvqju4u8ql.cloudfront.net/fit-in/250x250/MACROLED/WEB/GRAN-FORMATO-BACKLIGHT.webp" },
      { ...category("Tiras Led", "tiras-led"), href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=Tiras+LED", image: "https://d1zltvqju4u8ql.cloudfront.net/fit-in/250x250/filters:format(png)/MACROLED/1000/0742832556316a.png" },
      { ...category("Lámparas", "lamparas"), href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=L%C3%A1mparas", image: "https://d1zltvqju4u8ql.cloudfront.net/fit-in/250x250/filters:format(png)/MACROLED/1000/7428325565203a.png" }
    ],
    monaco: [
      { ...category("Armadas", "monaco-armadas"), image: "https://s3.coresagroup.com/MACROLED/250/milan.png" },
      { ...category("Despiece", "monaco-bastidor-modulos"), image: "https://s3.coresagroup.com/MACROLED/250/milan-bastidores.png" },
      { ...category("Luz guía", "monaco-luz-pasillo"), image: "https://d1zltvqju4u8ql.cloudfront.net/fit-in/2000x2000/MACROLED/WEB/portada_luz_pasillo.webp" },
      { ...category("Tapas", "monaco-tapas"), image: "https://s3.coresagroup.com/MACROLED/250/milan-tapas.png" }
    ],
    exterior: [
      { ...category("Reflectores", "reflectores"), href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=Reflectores", image: "https://s3.coresagroup.com/MACROLED/250/reflectores-smart.png" },
      { ...category("Tortugas", "tortugas"), href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=Luminarias+Integradas+Exterior&familia=Tortugas", image: "https://s3.coresagroup.com/MACROLED/250/tortugas.png" },
      { ...category("Estacas", "estacas"), href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=Luminarias+Integradas+Exterior&familia=Estacas+M%C3%B3viles", image: "https://s3.coresagroup.com/MACROLED/250/estacas-led-integrado.png" },
      { ...category("Guirnaldas", "guirnaldas"), href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=Artefactos+para+L%C3%A1mparas&familia=Guirnaldas", image: "https://d1zltvqju4u8ql.cloudfront.net/fit-in/250x250/filters:format(png)/MACROLED/1000/7428325574946a.png" }
    ],
    proyectos: [
      { ...category("Luz de calle\nStandard", "proyectos-luz-calle-standard"), href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=Luminarias+de+Proyecto&familia=Luz+de+Calle&subfamilia=Luz+de+Calle+Standard", image: "https://d1zltvqju4u8ql.cloudfront.net/fit-in/250x250/MACROLED/WEB/SLG2-100W-757-CW_FRONT.webp", badge: "Nuevo" },
      { ...category("Highbay PRO", "proyectos-highbay-pro"), href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=Luminarias+de+Proyecto&familia=Galponeras&subfamilia=Highbay+PRO+2026", image: "https://s3.coresagroup.com/MACROLED/250/PHB-200W-90D-857-CW.png" },
      { ...category("Reflectores PRO", "proyectos-reflectores-pro"), href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=Reflectores&familia=Reflectores+PRO+2026&pot_min=0&pot_max=1800", image: "https://d1zltvqju4u8ql.cloudfront.net/fit-in/250x250//MACROLED/WEB/PFL-400W-030D-857-CW_FRONT.webp" },
      { ...category("Olimpus", "proyectos-olimpus"), href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=Luminarias+de+Proyecto&familia=Reflectores&subfamilia=OLIMPUS", image: "https://s3.coresagroup.com/MACROLED/250/olimpus.png" },
      { ...category("Highbay Standard", "proyectos-highbay-standard"), href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=Luminarias+de+Proyecto&familia=Galponeras&subfamilia=Highbay+Standard", image: "https://s3.coresagroup.com/MACROLED/250/SHB-200W.png" },
      { ...category("Focus", "proyectos-focus"), href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=Luminarias+de+Proyecto&familia=Reflectores&subfamilia=Focus", image: "https://s3.coresagroup.com/MACROLED/250/focus.png" }
    ].map((item) => ({
      ...item,
      subtitle: "Proyecto lumínico"
    }))
  };

  window.MACROLED_HOME_CONFIG = {
    assets: { placeholder: PLACEHOLDER },
    manualCategories: MANUAL_CATEGORIES,
    typesense: {
      host: "https://typesense.coresagroup.com",
      apiKey: "g0oiNYY8THGuU9jnCsvqIH1X9HtvYRCR",
      collection: "Macroled_Prueba",
      queryBy: "nombre_typesense,descripcion"
    },
    tabs: {
      interior: {
        title: "Productos para crear ambientes funcionales y únicos",
        subtitle: "",
        cta: { label: "Ver productos", href: "#" },
        categories: MANUAL_CATEGORIES.interior,
        featuredLines: [
          {
            ...line("Línea Mónaco", "Módulos y tomas diseñados con un enfoque en estética, funcionalidad y seguridad. Una propuesta versátil con armadas, conexiones y componentes pensados para adaptarse a instalaciones eléctricas contemporáneas.", "#e9ecef", "#101820", "image-left"),
            id: "monaco",
            image: "https://cdn.prod.website-files.com/65f1fdd7248b6709fdebe904/69a977bb0fe12ec5b81b7e9b_monaco-cover%20copia.webp",
            imageFit: "contain",
            href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=Interruptores+y+Tomas&familia=Monaco",
            titleEmphasis: "Mónaco",
            content: { mode: "static", categoryGroup: "monaco" }
          },
          {
            ...line("Reflectores PRO", "La combinación ideal entre rendimiento y practicidad. Reflectores para exterior pensados para iluminar accesos, fachadas, patios y áreas abiertas con una instalación versátil y una luz confiable.", "#16283a", "#e4ebf0", "image-right"),
            image: "https://cdn.prod.website-files.com/65f1fdd7248b6709fdebe904/699cb28af6cdd53e774759f0_FAMILIA%20REFLECTORES%20PRO.webp",
            imageFit: "contain-right",
            href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=Reflectores&familia=Reflectores+PRO+2026",
            titleEmphasis: "PRO",
            content: {
              mode: "typesense",
              query: {
                typesenseField: "familia",
                typesenseValue: "Reflectores PRO 2026",
                productCount: 4,
                fetchCount: 80,
                randomizeBy: "nombre_typesense"
              }
            }
          },
          {
            ...line("Luminarias Skyline", "Iluminación arquitectónica con rieles magnéticos de 48V que combinan seguridad, versatilidad y estética premium. Luminarias con opciones Smart de blancos dinámicos y automatización.", "#07090c", "#e4ebf0", "image-left"),
            image: "https://s3.coresagroup.com/MACROLED/250/skyline.png",
            imageFit: "contain-centered",
            visualTheme: "silver-dark",
            href: "https://macroled.webflow.io/nuevo-productos?macrofamilia=Rieles+Magn%C3%A9ticos&familia=Luminarias",
            titleEmphasis: "Skyline",
            titleEmphasisWeight: 600,
            content: {
              mode: "typesense",
              query: {
                typesenseFilters: [
                  { field: "macrofamilia", value: "Rieles Magnéticos" },
                  { field: "familia", value: "Luminarias" }
                ],
                productCount: 4,
                fetchCount: 100,
                randomizeBy: "nombre_typesense"
              }
            }
          }
        ]
      }
    },
    categoriesTest: {
      interior: {
        labelActive: "Iluminación interior",
        labelInactive: "Interior",
        color: "#ffffff",
        textColor: "#00152b",
        categories: MANUAL_CATEGORIES.interior
      },
      exterior: {
        labelActive: "Iluminación exterior",
        labelInactive: "Exterior",
        color: "#ffffff",
        textColor: "#00152b",
        categories: MANUAL_CATEGORIES.exterior
      },
      proyectos: {
        labelActive: "Iluminación para proyectos",
        labelActiveMobile: "Iluminación proyectos",
        labelInactive: "Proyectos",
        color: "#ffffff",
        textColor: "#00152b",
        categories: MANUAL_CATEGORIES.proyectos
      }
    },
    news: [
      {
        title: "Casa FOA 2026, Edición Pocito",
        description: "Formamos parte de uno de los eventos de diseño más reconocidos del país, aportando luminarias LED que realzan texturas, colores y ambientes en proyectos de alto nivel estético.",
        href: "/novedades/casa-foa-2026-pocito",
        image: "https://cdn.prod.website-files.com/66298c6904f627b9b69307c7/6a79f74fcfa63a1d3bc495b9_Espacio-13-Casa-FOA-2026-Juan-Cruz-Paredes-1.webp",
        hoverImage: "https://cdn.prod.website-files.com/66298c6904f627b9b69307c7/6a79f7562c2172c4662fdc88_Espacio-26-Casa-FOA-2026-Juan-Cruz-Paredes-1.webp"
      },
      {
        title: "Expo Construir",
        description: "Presentamos nuestros últimos lanzamientos: las líneas Mónaco, Lima, Macroled ARQ, Skyline, Kyo, Taö y Höshi, pensadas para proyectos arquitectónicos.",
        href: "/novedades/expo-construir",
        image: "https://s3.coresagroup.com/MACROLED/WEB/HOME/expo.jpg",
        hoverImage: "https://s3.coresagroup.com/MACROLED/WEB/HOME/expo_hover.jpg",
        zoomDefaultImage: true
      },
      {
        title: "Biel Light 2025",
        description: "Durante cuatro días presentamos nuevas tecnologías, lanzamientos y demostraciones técnicas, con asesoramiento personalizado para distribuidores, instaladores y profesionales del sector.",
        href: "/novedades/biel-light-2025",
        image: "https://cdn.prod.website-files.com/690a24d6bf8e2592b2f29d1f/69bc53bc8148c948726225fa_691b4529bb6b28848a915f53_015.coresa-p-2600-p-2000.webp",
        hoverImage: "https://s3.coresagroup.com/MACROLED/WEB/HOME/biel_hover.jpg"
      }
    ],
    faq: [
      {
        question: "¿Dónde encuentro la información técnica de los productos?",
        answer: "En la ficha de cada producto vas a encontrar todas sus especificaciones técnicas, junto con los archivos disponibles para descargar. También podés consultar la sección Descargas, donde reunimos catálogos y material técnico de nuestros productos. Y si necesitás resolver una consulta puntual, podés usar nuestro Asistente de Productos para encontrar la información que buscás.",
        emphasis: ["ficha de cada producto", "sección Descargas", "Asistente de Productos"]
      },
      {
        question: "¿Cómo puedo comparar distintas alternativas?",
        answer: "Desde nuestra sección de productos podés seleccionar hasta 3 productos y compararlos especificación por especificación. También podés elegir mostrar solo las diferencias para identificar rápidamente qué cambia entre modelos similares.",
        emphasis: ["sección de productos"]
      },
      {
        question: "¿Macroled tiene luminarias para proyectos profesionales?",
        answer: "Sí, contamos con una amplia gama de soluciones destinadas a proyectos lumínicos profesionales. Completá el formulario de contacto y nuestro equipo técnico te va a acompañar en la selección de los productos más adecuados para tu proyecto.",
        emphasis: ["formulario de contacto"]
      },
      {
        question: "¿Macroled vende a profesionales y también a consumidores finales?",
        answer: "Comercializamos nuestros productos a través de una amplia red de distribuidores en todo el país y también contamos con tienda oficial en Mercado Libre, donde podés realizar tus compras como consumidor final.",
        emphasis: ["red de distribuidores", "Mercado Libre"]
      },
      {
        question: "¿Los productos tienen garantía?",
        answer: "Sí, nuestros productos cuentan con garantía ante fallas de fabricación. Para conocer las condiciones y el período de cobertura, consultá la documentación correspondiente o contactanos."
      },
      {
        question: "¿Cómo puedo recibir asesoramiento para un proyecto?",
        answer: "Si estás trabajando en un proyecto y necesitás definir productos, cantidades o alternativas, podés completar el formulario de contacto. Nuestro equipo técnico puede orientarte según las necesidades de cada proyecto.",
        emphasis: ["formulario de contacto"]
      }
    ]
  };
})(window);
