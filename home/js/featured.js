(function (window) {
  "use strict";

  const FEATURED_FIELD = "destacados_en";
  const DEFAULT_SPACE = "interior";
  const FEATURED_COUNT = 8;
  let currentSpace = DEFAULT_SPACE;
  let isFetching = false;

  async function fetchFeatured(space) {
    const cfg = window.MACROLED_HOME_CONFIG.typesense;
    const params = new URLSearchParams({
      q: "*",
      query_by: cfg.queryBy || "nombre,descripcion",
      filter_by: `${FEATURED_FIELD}:=${space}`,
      per_page: String(FEATURED_COUNT),
      page: "1"
    });
    const url = `${cfg.host}/collections/${encodeURIComponent(cfg.collection)}/documents/search?${params}`;
    const response = await fetch(url, { headers: { "X-TYPESENSE-API-KEY": cfg.apiKey } });
    if (!response.ok) throw new Error(`Typesense ${response.status}: ${await response.text()}`);
    return response.json();
  }

  function setupTrackControls(root, track) {
    const controls = root.querySelector(".ml-featured-products__controls");
    const progressBar = root.querySelector(".ml-featured-products__progress");
    const progress = root.querySelector("[data-featured-progress]");
    const prev = root.querySelector("[data-featured-prev]");
    const next = root.querySelector("[data-featured-next]");
    const needsScroll = track.scrollWidth > track.clientWidth + 4;
    controls.hidden = !needsScroll;
    if (!needsScroll) return;

    const cards = [...track.querySelectorAll(".ml-product-card")];
    const firstLeft = cards[0].getBoundingClientRect().left;
    const positions = cards.map(card => card.getBoundingClientRect().left - firstLeft);

    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      prev.disabled = track.scrollLeft <= 4;
      next.disabled = track.scrollLeft >= max - 4;
      const visibleRatio = Math.min(1, track.clientWidth / track.scrollWidth);
      const progressRatio = max > 0 ? Math.max(0, Math.min(1, track.scrollLeft / max)) : 0;
      const barWidth = progressBar.clientWidth;
      progress.style.width = `${visibleRatio * 100}%`;
      progress.style.transform = `translateX(${progressRatio * barWidth * (1 - visibleRatio)}px)`;
    };
    track.onscroll = update;
    const moveToCard = direction => {
      const current = positions.reduce((closest, position, index) =>
        Math.abs(position - track.scrollLeft) < Math.abs(positions[closest] - track.scrollLeft) ? index : closest, 0);
      const target = Math.max(0, Math.min(cards.length - 1, current + direction));
      track.scrollTo({ left: positions[target], behavior: "smooth" });
    };
    prev.onclick = () => moveToCard(-1);
    next.onclick = () => moveToCard(1);
    track._featuredResizeObserver?.disconnect();
    track._featuredResizeObserver = new ResizeObserver(update);
    track._featuredResizeObserver.observe(track);
    update();
  }

  async function render(root, space) {
    if (isFetching) return;
    isFetching = true;
    const track = root.querySelector("[data-featured-track]");
    track.setAttribute("aria-busy", "true");
    track.innerHTML = '<div class="ml-featured-products__state">Cargando destacados…</div>';

    try {
      const data = await fetchFeatured(space);
      if (!data.hits?.length) {
        track.innerHTML = '<div class="ml-featured-products__state">Todavía no hay productos destacados cargados para este ambiente.</div>';
        return;
      }
      track.innerHTML = data.hits.map(hit => window.MacroledProducts.cardTemplate(hit.document)).join("");
      window.MacroledProducts.wireCarousels(track);
      track.scrollLeft = 0;
      setupTrackControls(root, track);
    } catch (error) {
      console.error(`Macroled Home · Error consultando Typesense (${FEATURED_FIELD}=${space})`, error);
      track.innerHTML = `<div class="ml-featured-products__state">No se pudieron cargar los productos. Revisá que el campo “${FEATURED_FIELD}” exista y tenga el valor “${space}”.</div>`;
    } finally {
      isFetching = false;
      track.setAttribute("aria-busy", "false");
    }
  }

  function init(root = document) {
    const section = root.querySelector("#productos-destacados");
    if (!section) return;
    const tabs = [...section.querySelectorAll(".ml-featured-products__tab")];
    tabs.forEach(tab => tab.addEventListener("click", () => {
      const space = tab.dataset.space;
      if (space === currentSpace || isFetching) return;
      currentSpace = space;
      tabs.forEach(item => {
        const active = item === tab;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-selected", String(active));
        item.textContent = active ? item.dataset.labelActive : item.dataset.labelInactive;
      });
      render(section, currentSpace);
    }));
    render(section, currentSpace);
  }

  window.MacroledFeatured = { init };
})(window);
