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
      { ...category("Lámparas", "lamparas"), image: "https://d1zltvqju4u8ql.cloudfront.net/fit-in/250x250/filters:format(png)/MACROLED/1000/7428325565203a.png" },
      { ...category("Artefactos para lámparas", "artefactos-para-lamparas"), image: "https://d1zltvqju4u8ql.cloudfront.net/fit-in/250x250/filters:format(png)/MACROLED/1000/7428325574748a.png" },
      { ...category("Interruptores y tomas", "interruptores-y-tomas"), image: "https://d1zltvqju4u8ql.cloudfront.net/fit-in/250x250/MACROLED/WEB/LIMA-1CN-USB-CC-30W-B_FRONT.webp" },
      { ...category("Tiras LED", "tiras-led"), image: "https://d1zltvqju4u8ql.cloudfront.net/fit-in/250x250/filters:format(png)/MACROLED/1000/0742832556316a.png", badge: "Nuevo" }
    ],
    monaco: [
      { ...category("Armadas", "monaco-armadas"), image: "https://s3.coresagroup.com/MACROLED/250/milan.png" },
      { ...category("Bastidor + Módulos", "monaco-bastidor-modulos"), image: "https://s3.coresagroup.com/MACROLED/250/milan-bastidores.png" },
      { ...category("Tapas", "monaco-tapas"), image: "https://s3.coresagroup.com/MACROLED/250/milan-tapas.png" },
      { ...category("Luz de pasillo", "monaco-luz-pasillo"), image: "https://d1zltvqju4u8ql.cloudfront.net/fit-in/2000x2000/MACROLED/WEB/portada_luz_pasillo.webp" }
    ],
    exterior: [
      { ...category("Reflectores", "reflectores"), image: "https://d1zltvqju4u8ql.cloudfront.net/fit-in/250x250/MACROLED/WEB/PFL-400W-060D-857-CW_PERS.webp" },
      { ...category("Solar", "solar"), image: "https://d1zltvqju4u8ql.cloudfront.net/fit-in/250x250/filters:format(png)/MACROLED/1000/7428325578388a.png" },
      { ...category("Tortugas", "tortugas"), image: "https://d1zltvqju4u8ql.cloudfront.net/fit-in/250x250/filters:format(png)/MACROLED/1000/7428325571648a.png" },
      { ...category("Estacas", "estacas"), image: "https://d1zltvqju4u8ql.cloudfront.net/fit-in/250x250/filters:format(png)/MACROLED/1000/7428325575684a.png" }
    ],
    proyectos: [
      { ...category("Luz de calle", "proyectos-01"), image: "https://d1zltvqju4u8ql.cloudfront.net/fit-in/250x250/MACROLED/WEB/SLG2-100W-757-CW_FRONT.webp", badge: "Nuevo" },
      { ...category("Lumax", "proyectos-02"), image: "https://s3.coresagroup.com/MACROLED/250/lumax.png", badge: "Nuevo" },
      { ...category("Highbay Classic", "proyectos-03"), image: "https://s3.coresagroup.com/MACROLED/250/galponeras-eco.webp" },
      { ...category("Highbay Pro", "proyectos-04"), image: "https://s3.coresagroup.com/MACROLED/250/PHB-200W-90D-857-CW.png" }
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
      queryBy: "nombre,descripcion"
    },
    tabs: {
      interior: {
        title: "Productos para crear ambientes funcionales y únicos",
        subtitle: "",
        cta: { label: "Ver productos", href: "#" },
        categories: MANUAL_CATEGORIES.interior,
        featuredLines: [
          {
            ...line("Línea Monaco", "Módulos y tomas diseñados con un enfoque en estética, funcionalidad y seguridad. Una propuesta versátil con armadas, conexiones y componentes pensados para adaptarse a instalaciones eléctricas contemporáneas.", "#e9ecef", "#101820", "image-left"),
            image: "https://cdn.prod.website-files.com/65f1fdd7248b6709fdebe904/69a977bb0fe12ec5b81b7e9b_monaco-cover%20copia.webp",
            imageFit: "contain",
            titleEmphasis: "Monaco",
            content: { mode: "static", categoryGroup: "monaco" }
          },
          {
            ...line("Reflectores PRO", "La combinación ideal entre rendimiento y practicidad. Reflectores para exterior pensados para iluminar accesos, fachadas, patios y áreas abiertas con una instalación versátil y una luz confiable.", "#16283a", "#e4ebf0", "image-right"),
            image: "https://cdn.prod.website-files.com/65f1fdd7248b6709fdebe904/699cb28af6cdd53e774759f0_FAMILIA%20REFLECTORES%20PRO.webp",
            imageFit: "contain-right",
            titleEmphasis: "PRO"
          },
          {
            ...line("Luminarias Skyline", "Iluminación arquitectónica con rieles magnéticos de 48V que combinan seguridad, versatilidad y estética premium. Luminarias con opciones Smart de blancos dinámicos y automatización.", "#07090c", "#e4ebf0", "image-left"),
            image: "https://s3.coresagroup.com/MACROLED/250/skyline.png",
            imageFit: "contain-centered",
            visualTheme: "silver-dark",
            titleEmphasis: "Skyline",
            titleEmphasisWeight: 600,
            content: {
              mode: "typesense",
              query: {
                typesenseFilters: [
                  { field: "subfamilia", value: "Luminarias" },
                  { field: "familia", value: "Skyline" }
                ],
                productCount: 4
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
        href: "/novedades/casa-foa-2026-edicion-pocito",
        image: "https://www.casafoa.com/landing/wp-content/uploads/2026/04/Espacio-21-Casa-FOA-Juan-Cruz-Paredes-2.webp",
        hoverImage: "https://www.casafoa.com/landing/wp-content/uploads/2026/04/Espacio-17-Casa-FOA-Juan-Cruz-Paredes-4.webp"
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
        question: "¿Cómo elijo la iluminación adecuada?",
        answer: "Respuesta definitiva pendiente. El equipo de Macroled puede asesorarte según el uso, las dimensiones y la atmósfera buscada."
      },
      {
        question: "¿Dónde encuentro la información técnica?",
        answer: "Las fichas de los productos disponibles enlazan a su ficha web. También se podrá incorporar un acceso a descargas."
      },
      {
        question: "¿Macroled trabaja con proyectos profesionales?",
        answer: "Sí. Nuestro equipo puede acompañarte en la elección de soluciones de iluminación para proyectos profesionales."
      },
      {
        question: "¿Puedo recibir asesoramiento antes de elegir un producto?",
        answer: "Sí. Contanos las características de tu espacio o proyecto y te ayudaremos a evaluar las alternativas disponibles."
      },
      {
        question: "¿Cómo puedo comparar distintas alternativas?",
        answer: "Podés revisar la información de cada producto y consultar a nuestro equipo para comparar prestaciones según tu necesidad."
      },
      {
        question: "¿Cómo me contacto con el equipo de Macroled?",
        answer: "Ingresá a la sección de contacto y dejanos los datos de tu consulta para que podamos orientarte."
      }
    ]
  };
})(window);
