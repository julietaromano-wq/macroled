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
      { ...category("Lámparas", "lamparas"), image: "https://s3.coresagroup.com/MACROLED/250/smartnew.png" },
      { ...category("Artefactos para lámparas", "artefactos-para-lamparas"), image: "https://s3.coresagroup.com/MACROLED/250/policarbonato-aplicar-dicroica.png" },
      { ...category("Interruptores y tomas", "interruptores-y-tomas"), image: "https://s3.coresagroup.com/MACROLED/250/lima.webp" },
      { ...category("Tiras LED", "tiras-led"), image: "https://s3.coresagroup.com/MACROLED/250/neon.png", badge: "Nuevo" }
    ],
    monaco: [
      { ...category("Armadas", "monaco-armadas"), image: "https://s3.coresagroup.com/MACROLED/250/milan.png" },
      { ...category("Bastidor + Módulos", "monaco-bastidor-modulos"), image: "https://s3.coresagroup.com/MACROLED/250/milan-bastidores.png" },
      { ...category("Tapas", "monaco-tapas"), image: "https://s3.coresagroup.com/MACROLED/250/milan-tapas.png" },
      { ...category("Luz de pasillo", "monaco-luz-pasillo"), image: "https://d1zltvqju4u8ql.cloudfront.net/fit-in/2000x2000/MACROLED/WEB/portada_luz_pasillo.webp" }
    ],
    exterior: [
      { ...category("Reflectores", "reflectores"), image: "https://s3.coresagroup.com/MACROLED/250/reflectores-smart.png" },
      { ...category("Solar", "solar"), image: "https://s3.coresagroup.com/MACROLED/250/solar.png" },
      { ...category("Tortugas", "tortugas"), image: "https://s3.coresagroup.com/MACROLED/250/tortugas.png" },
      { ...category("Estacas", "estacas"), image: "https://s3.coresagroup.com/MACROLED/250/estacas-led-integrado.png" }
    ],
    proyectos: [
      { ...category("Luz de calle", "proyectos-01"), image: "https://d1zltvqju4u8ql.cloudfront.net/fit-in/1000x1000/MACROLED/WEB/SLG2-100W-757-CW_FRONT.webp", badge: "Nuevo" },
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
            imageFit: "contain-right"
          },
          {
            ...line("Luminarias Skyline", "Iluminación arquitectónica con rieles magnéticos de 48V que combinan seguridad, versatilidad y estética premium. Luminarias con opciones Smart de blancos dinámicos y automatización.", "#07090c", "#e4ebf0", "image-left"),
            image: "https://s3.coresagroup.com/MACROLED/250/skyline.png",
            imageFit: "contain-centered",
            visualTheme: "silver-dark",
            titleEmphasis: "Luminarias",
            titleEmphasisWeight: 700,
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
    news: [1, 2, 3].map(number => ({
      title: `Novedad editorial 0${number}`,
      description: "Título, imagen, descripción y vínculo configurables.",
      image: PLACEHOLDER,
      href: "#"
    })),
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
        answer: "Sí. Esta respuesta es un placeholder editorial y debe validarse antes de publicar."
      }
    ]
  };
})(window);
