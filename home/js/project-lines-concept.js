(function (window) {
  "use strict";

  const LINES = [
    {
      id: "street",
      title: "Luz de calle Standard",
      subtitle: "Para proyectos, vías, parques y espacios públicos.",
      badge: "Nueva línea",
      productImage: "https://d1zltvqju4u8ql.cloudfront.net/fit-in/1000x1000/MACROLED/WEB/SLG2-200W-757-NM3-CW_FRONT.webp",
      ambientImage: "https://s3.coresagroup.com/MACROLED/WEB/HOME/streetlight_ambient.png",
      href: "https://www.macroled.com.ar/productos?macrofamilia=Luminarias+de+Proyecto&familia=Luz+de+Calle&subfamilia=Standard"
    },
    {
      id: "invictus",
      title: "Invictus",
      subtitle: "Para grandes áreas, fachadas y espacios deportivos.",
      productImage: "https://s3.coresagroup.com/MACROLED/WEB/HOME/invictus.png?v=20260821-1",
      ambientImage: "https://s3.coresagroup.com/MACROLED/WEB/HOME/invictus_ambient.png",
      href: "https://www.macroled.com.ar/productos?macrofamilia=Luminarias+de+Proyecto&familia=Reflectores&subfamilia=Invictus"
    },
    {
      id: "highbay",
      title: "Highbay PRO",
      subtitle: "Para naves industriales y espacios de gran altura.",
      productImage: "https://d1zltvqju4u8ql.cloudfront.net/fit-in/1000x1000/MACROLED/WEB/PHB-100W-90D-857-CW_FRONT.webp",
      ambientImage: "https://s3.coresagroup.com/MACROLED/WEB/HOME/highbay_ambient.png",
      href: "https://www.macroled.com.ar/productos?macrofamilia=Luminarias+de+Proyecto&familia=Galponeras&subfamilia=Highbay+PRO+2026"
    }
  ];

  const esc = value => String(value ?? "").replace(/[&<>'"]/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  })[character]);

  function template(item) {
    return `
      <a class="ml-project-lines-concept__card"
        data-project-lines-concept-card="${esc(item.id)}"
        href="${esc(item.href)}"
        aria-label="${esc(item.title)}: ${esc(item.subtitle)}">
        <img class="ml-project-lines-concept__ambient" src="${esc(item.ambientImage)}"
          alt="${esc(item.title)} instalada en un proyecto" loading="lazy">
        <span class="ml-project-lines-concept__shade" aria-hidden="true"></span>
        <img class="ml-project-lines-concept__product" src="${esc(item.productImage)}"
          alt="" loading="lazy" aria-hidden="true">
        <div class="ml-project-lines-concept__cta-wrap" aria-hidden="true">
          <span class="ml-project-lines-concept__cta ml-project-lines-concept__cta--outline">Ver productos</span>
        </div>
        <div class="ml-project-lines-concept__content">
          <span>${esc(item.title)}</span>
          <span class="ml-project-lines-concept__arrow" aria-hidden="true">&rarr;</span>
          <p>${esc(item.subtitle)}</p>
          ${item.badge ? `<span class="ml-highlight-badge ml-project-lines-concept__badge">${esc(item.badge)}</span>` : ""}
        </div>
      </a>`;
  }

  function init(root) {
    const section = root.querySelector("[data-project-lines-concept]");
    const list = section?.querySelector("[data-project-lines-concept-list]");
    if (!list) return;

    list.innerHTML = LINES.map(template).join("");
  }

  window.MacroledProjectLinesConcept = { init };
})(window);
