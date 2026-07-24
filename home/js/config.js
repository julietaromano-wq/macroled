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
      { ...category("Artefactos para lámparas", "artefactos-para-lamparas"), image: "https://s3.coresagroup.com/MACROLED/250/7428325570818a.png" },
      { ...category("Interruptores y tomas", "interruptores-y-tomas"), image: "https://s3.coresagroup.com/MACROLED/250/lima.webp" },
      { ...category("Tiras LED", "tiras-led"), image: "https://s3.coresagroup.com/MACROLED/250/smd5050a.png" }
    ],
    exterior: [
      category("Reflectores", "reflectores"),
      category("Solar", "solar"),
      category("Tortugas", "tortugas"),
      category("Estacas", "estacas")
    ],
    proyectos: ["Highbay Pro", "Luz de calle Standard", "Lumax", "Solar"].map((title, index) => ({
      ...category(title, `proyectos-0${index + 1}`),
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
            ...line("Línea Monaco", "Módulos para", "#e9ecef", "#101820", "image-left"),
            titleEmphasis: "Monaco",
            content: { mode: "static", categoryGroup: "interior" }
          },
          line("Línea interior 02", "Una composición amplia preparada para presentar la familia.", "#16283a", "#ffffff", "image-right"),
          line("Línea interior 03", "Contenido comercial configurable desde un único archivo.", "#dbe8e5", "#101820", "image-full")
        ]
      },
      exterior: {
        title: "El espacio continúa afuera",
        subtitle: "Iluminación exterior pensada para acompañar cada espacio al aire libre.",
        categories: MANUAL_CATEGORIES.exterior,
        featuredLines: [
          line("Línea exterior 01", "Nombre, imagen y descripción editorial pendientes.", "#d7e0d1", "#102016", "image-right"),
          line("Línea exterior 02", "Preparada para una fotografía de ambiente de gran formato.", "#1b312c", "#ffffff", "image-left"),
          line("Línea exterior 03", "La configuración permite cambiar el universo visual sin reprogramar.", "#e8dfcf", "#1c1812", "image-full")
        ]
      },
      proyectos: {
        title: "Rendimiento a gran escala",
        subtitle: "Productos para proyectos lumínicos que exigen potencia, eficiencia y precisión.",
        categories: MANUAL_CATEGORIES.proyectos,
        featuredLines: [
          line("Highbay Pro", "Potencia y control para espacios de gran altura. Texto final pendiente.", "#00152b", "#ffffff", "image-left"),
          line("Olimpus", "Presentación editorial de línea. Imagen y descripción definitivas pendientes.", "#c9d5dc", "#07141e", "image-right"),
          line("Titan", "Bloque preparado para comunicar prestaciones y aplicaciones.", "#3b4449", "#ffffff", "image-full"),
          line("Invictus", "La consulta de producto es temporalmente G9, como en todo el prototipo.", "#d9c8aa", "#1a1610", "image-left")
        ]
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
