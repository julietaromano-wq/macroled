(function (window) {
  "use strict";

  /**
   * ================================================================
   * CONFIGURACIÓN MANUAL — LÍNEAS DESTACADAS PARA PROYECTOS
   *
   * Reemplazar aquí las imágenes, textos y enlaces reales.
   * ambientImage: fotografía del producto instalado y en uso.
   * title/subtitle: contenido visible al expandir la tarjeta.
   * href: destino de “Ver todos los productos”.
   * ================================================================
   */
  const PROJECT_LINES = [
    {
      id: "luz-calle-standard",
      title: "Luz de calle Standard",
      subtitle: "Para proyectos, vías, parques y espacios públicos.",
      ambientImage: "assets/images/project-street-ambient-dark.png",
      href: "#"
    },
    {
      id: "invictus",
      title: "Invictus",
      subtitle: "Potencia y precisión para grandes áreas, fachadas y espacios deportivos.",
      ambientImage: "assets/images/project-invictus-ambient.png",
      href: "#"
    },
    {
      id: "highbay-pro",
      title: "Highbay PRO",
      subtitle: "Iluminación profesional para naves industriales y espacios de gran altura.",
      ambientImage: "assets/images/project-highbay-ambient.png",
      href: "#"
    }
  ];

  const esc = value => String(value ?? "").replace(/[&<>'"]/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  })[character]);

  function cardTemplate(item, index) {
    const expanded = index === 0;
    return `
      <article class="ml-project-line-card ${expanded ? "is-expanded" : "is-collapsed"}"
        data-project-line-card="${esc(item.id)}"
        style="--project-card-index:${index};view-transition-name:project-${esc(item.id)}"
        tabindex="${expanded ? "-1" : "0"}"
        aria-label="${expanded ? esc(item.title) : `Abrir ${esc(item.title)}`}">
        <div class="ml-project-line-card__trigger">
          <span class="ml-project-line-card__media" aria-hidden="true">
            <img class="ml-project-line-card__ambient" src="${esc(item.ambientImage)}" alt="" loading="lazy">
          </span>
          <span class="ml-project-line-card__shade" aria-hidden="true"></span>
          <div class="ml-project-line-card__collapsed-content">
            <span class="ml-project-line-card__collapsed-title">${esc(item.title)}</span>
            <span class="ml-project-line-card__open-icon" aria-hidden="true">→</span>
          </div>
          <div class="ml-project-line-card__content">
            <h3 class="ml-project-line-card__title">${esc(item.title)}</h3>
            <div class="ml-project-line-card__details">
              <p class="ml-project-line-card__subtitle">${esc(item.subtitle)}</p>
              <a class="ml-project-line-card__cta" href="${esc(item.href)}">
                Ver todos los productos <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </article>`;
  }

  function applyActive(container, activeCard) {
    container.querySelectorAll("[data-project-line-card]").forEach(card => {
      const expanded = card === activeCard;
      card.classList.toggle("is-expanded", expanded);
      card.classList.toggle("is-collapsed", !expanded);
      card.tabIndex = expanded ? -1 : 0;
      card.setAttribute("aria-label", expanded ? card.dataset.projectLineCard : `Abrir ${card.dataset.projectLineCard}`);
    });
  }

  function setActive(container, activeCard, reduceMotion) {
    if (reduceMotion) {
      applyActive(container, activeCard);
      return;
    }

    const cards = [...container.querySelectorAll("[data-project-line-card]")];
    const previousRects = new Map(cards.map(card => [card, card.getBoundingClientRect()]));
    applyActive(container, activeCard);

    requestAnimationFrame(() => {
      cards.forEach(card => {
        const previous = previousRects.get(card);
        const next = card.getBoundingClientRect();
        if (!previous || !next.width || !next.height) return;
        card.animate([
          {
            transform: `translate(${previous.left - next.left}px,${previous.top - next.top}px) scale(${previous.width / next.width},${previous.height / next.height})`,
            transformOrigin: "top left"
          },
          { transform: "none", transformOrigin: "top left" }
        ], {
          duration: 680,
          easing: "cubic-bezier(.22,1,.36,1)"
        });
      });
    });
  }

  function init(root) {
    const section = root.querySelector("[data-project-lines]");
    const list = section?.querySelector("[data-project-lines-list]");
    if (!list) return;

    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    list.classList.add("is-awaiting-reveal");
    list.innerHTML = PROJECT_LINES.map(cardTemplate).join("");

    list.querySelectorAll("[data-project-line-card]").forEach(card => {
      card.addEventListener("click", event => {
        if (event.target.closest("a") || card.classList.contains("is-expanded")) return;
        setActive(list, card, reduceMotion);
      });
      card.addEventListener("keydown", event => {
        if ((event.key !== "Enter" && event.key !== " ") || card.classList.contains("is-expanded")) return;
        event.preventDefault();
        setActive(list, card, reduceMotion);
      });
    });

    if (reduceMotion || !("IntersectionObserver" in window)) {
      list.classList.remove("is-awaiting-reveal");
      return;
    }

    const revealObserver = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      requestAnimationFrame(() => list.classList.remove("is-awaiting-reveal"));
      revealObserver.disconnect();
    }, { threshold: .14 });
    revealObserver.observe(section);
  }

  window.MacroledProjectLines = { init };
})(window);
