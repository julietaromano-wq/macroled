(function (window) {
  "use strict";

  const LINES = [
    {
      id: "street",
      title: "Luz de calle Standard",
      subtitle: "Para proyectos, vías, parques y espacios públicos.",
      badge: "Nueva línea",
      productImage: "assets/images/project-street-product-source.png",
      ambientImage: "assets/images/project-street-ambient-dark.png",
      href: "#ml-section-proyectos"
    },
    {
      id: "invictus",
      title: "Invictus",
      subtitle: "Potencia y precisión para grandes áreas, fachadas y espacios deportivos.",
      productImage: "assets/images/project-invictus-product.png",
      ambientImage: "assets/images/project-invictus-ambient.png",
      href: "#ml-section-proyectos"
    },
    {
      id: "highbay",
      title: "Highbay PRO",
      subtitle: "Iluminación profesional para naves industriales y espacios de gran altura.",
      productImage: "assets/images/project-highbay-product-source.webp",
      ambientImage: "assets/images/project-highbay-ambient.png",
      href: "#ml-section-proyectos"
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
        <div class="ml-project-lines-concept__content">
          <span>${esc(item.title)}</span>
          <span class="ml-project-lines-concept__arrow" aria-hidden="true">&rarr;</span>
          <p>${esc(item.subtitle)}</p>
        </div>
        ${item.badge ? `<span class="ml-project-lines-concept__badge">${esc(item.badge)}</span>` : ""}
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
