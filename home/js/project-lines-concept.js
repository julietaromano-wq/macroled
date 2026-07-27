(function (window) {
  "use strict";

  const LINES = [
    {
      id: "street",
      title: "Luz de calle Standard",
      subtitle: "Para proyectos, vías, parques y espacios públicos.",
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

  function template(item, index) {
    return `
      <article class="ml-project-lines-concept__card${index === 0 ? " is-expanded" : ""}"
        data-project-lines-concept-card="${esc(item.id)}"
        tabindex="${index === 0 ? "-1" : "0"}"
        aria-label="${index === 0 ? esc(item.title) : `Expandir ${esc(item.title)}`}">
        <img class="ml-project-lines-concept__ambient" src="${esc(item.ambientImage)}"
          alt="${esc(item.title)} instalada en un proyecto" loading="lazy">
        <span class="ml-project-lines-concept__shade" aria-hidden="true"></span>
        <img class="ml-project-lines-concept__product" src="${esc(item.productImage)}"
          alt="" loading="lazy" aria-hidden="true">
        <div class="ml-project-lines-concept__closed">
          <span>${esc(item.title)}</span>
          <span class="ml-project-lines-concept__arrow" aria-hidden="true">↓</span>
        </div>
        <div class="ml-project-lines-concept__open">
          <h3>${esc(item.title)}</h3>
          <p>${esc(item.subtitle)}</p>
          <a href="${esc(item.href)}">Ver todos los productos <span aria-hidden="true">→</span></a>
        </div>
      </article>`;
  }

  function init(root) {
    const section = root.querySelector("[data-project-lines-concept]");
    const list = section?.querySelector("[data-project-lines-concept-list]");
    if (!list) return;

    list.innerHTML = LINES.map(template).join("");
    const cards = [...list.querySelectorAll("[data-project-lines-concept-card]")];

    const updateTitleAlignment = () => {
      cards.forEach(card => {
        const title = card.querySelector(".ml-project-lines-concept__closed > span:first-child");
        if (!title) return;
        const lineHeight = parseFloat(getComputedStyle(title).lineHeight);
        card.classList.toggle(
          "has-multiline-title",
          Number.isFinite(lineHeight) && title.getBoundingClientRect().height > lineHeight * 1.5
        );
      });
    };

    requestAnimationFrame(updateTitleAlignment);
    document.fonts?.ready.then(updateTitleAlignment);
    if ("ResizeObserver" in window) {
      const titleObserver = new ResizeObserver(() => requestAnimationFrame(updateTitleAlignment));
      titleObserver.observe(list);
    }

    const activate = activeCard => {
      cards.forEach(card => {
        const expanded = card === activeCard;
        card.classList.toggle("is-expanded", expanded);
        card.tabIndex = expanded ? -1 : 0;
        card.setAttribute("aria-label", expanded
          ? card.querySelector(".ml-project-lines-concept__open h3").textContent
          : `Expandir ${card.querySelector(".ml-project-lines-concept__closed span").textContent}`);
      });
    };

    cards.forEach(card => {
      card.addEventListener("click", event => {
        if (!event.target.closest("a")) activate(card);
      });
      card.addEventListener("keydown", event => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        activate(card);
      });
    });
  }

  window.MacroledProjectLinesConcept = { init };
})(window);
