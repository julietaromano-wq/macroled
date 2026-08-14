(function (window) {
  "use strict";

  const FEATURED_FIELD = "destacados_en";
  const FEATURED_COUNT = 250;
  let currentSpace = null;
  let isFetching = false;

  async function fetchFeatured(space) {
    const cfg = window.MACROLED_HOME_CONFIG.typesense;
    const params = new URLSearchParams({
      q: "*",
      query_by: cfg.queryBy || "nombre_typesense,descripcion",
      filter_by: space
        ? `${FEATURED_FIELD}:=${space}`
        : `${FEATURED_FIELD}:=[interior,exterior,proyectos]`,
      per_page: String(FEATURED_COUNT),
      page: "1"
    });
    const url = `${cfg.host}/collections/${encodeURIComponent(cfg.collection)}/documents/search?${params}`;
    const response = await fetch(url, { headers: { "X-TYPESENSE-API-KEY": cfg.apiKey } });
    if (!response.ok) throw new Error(`Typesense ${response.status}: ${await response.text()}`);
    return response.json();
  }

  function setupTrackControls(root, track, options = {}) {
    const controls = root.querySelector(".ml-featured-products__controls");
    const progressBar = root.querySelector(".ml-featured-products__progress");
    const progress = root.querySelector("[data-featured-progress]");
    const prev = root.querySelector("[data-featured-prev]");
    const next = root.querySelector("[data-featured-next]");
    const arrows = root.querySelector(".ml-featured-products__arrows");
    const viewport = root.querySelector(".ml-featured-products__viewport");
    const cardSelector = options.cardSelector || ".ml-product-card";
    const mobile = matchMedia("(max-width: 640px)");
    if (!controls || !progressBar || !progress || !prev || !next || !arrows) return;

    const getCards = () => [...track.querySelectorAll(cardSelector)];

    const update = () => {
      const enabled = !options.mobileOnly || mobile.matches;
      const needsScroll = enabled && track.scrollWidth > track.clientWidth + 4;
      controls.hidden = !needsScroll;
      arrows.hidden = !needsScroll;
      if (!needsScroll) return;
      const arrowsTarget = mobile.matches || !viewport ? controls : viewport;
      if (arrows.parentElement !== arrowsTarget) arrowsTarget.prepend(arrows);

      const max = track.scrollWidth - track.clientWidth;
      prev.disabled = track.scrollLeft <= 4;
      next.disabled = track.scrollLeft >= max - 4;
      const visibleRatio = Math.min(1, track.clientWidth / track.scrollWidth);
      const progressRatio = max > 0 ? Math.max(0, Math.min(1, track.scrollLeft / max)) : 0;
      const barWidth = progressBar.clientWidth;
      const hasProgress = track.scrollLeft > 4;
      progressBar.classList.toggle("has-progress", hasProgress);
      progress.style.width = hasProgress ? `${visibleRatio * 100}%` : "0";
      progress.style.transform = `translateX(${progressRatio * barWidth * (1 - visibleRatio)}px)`;
    };
    track.onscroll = update;
    const moveToCard = direction => {
      const cards = getCards();
      if (!cards.length) return;
      const firstLeft = cards[0].getBoundingClientRect().left;
      const positions = cards.map(card => card.getBoundingClientRect().left - firstLeft);
      const current = positions.reduce((closest, position, index) =>
        Math.abs(position - track.scrollLeft) < Math.abs(positions[closest] - track.scrollLeft) ? index : closest, 0);
      const target = Math.max(0, Math.min(cards.length - 1, current + direction));
      track.scrollTo({ left: positions[target], behavior: "smooth" });
    };
    prev.onclick = () => moveToCard(-1);
    next.onclick = () => moveToCard(1);

    let dragStartX = 0;
    let dragStartScroll = 0;
    let dragged = false;

    track.onpointerdown = event => {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      dragStartX = event.clientX;
      dragStartScroll = track.scrollLeft;
      dragged = false;
      track.setPointerCapture(event.pointerId);
    };
    track.onpointermove = event => {
      if (!track.hasPointerCapture(event.pointerId)) return;
      const distance = event.clientX - dragStartX;
      if (Math.abs(distance) > 4 && !dragged) {
        dragged = true;
        track.classList.add("is-dragging");
      }
      track.scrollLeft = dragStartScroll - distance;
    };
    const stopDragging = event => {
      if (!track.hasPointerCapture(event.pointerId)) return;
      track.releasePointerCapture(event.pointerId);
      track.classList.remove("is-dragging");
    };
    track.onpointerup = stopDragging;
    track.onpointercancel = stopDragging;
    track.ondragstart = () => false;
    track.onclick = event => {
      if (!dragged) return;
      event.preventDefault();
      event.stopPropagation();
      dragged = false;
    };

    track._featuredResizeObserver?.disconnect();
    track._featuredResizeObserver = new ResizeObserver(update);
    track._featuredResizeObserver.observe(track);
    if (track._featuredControlsMedia && track._featuredControlsMediaHandler) {
      track._featuredControlsMedia.removeEventListener("change", track._featuredControlsMediaHandler);
    }
    track._featuredControlsMedia = mobile;
    track._featuredControlsMediaHandler = update;
    mobile.addEventListener("change", update);
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
        track.innerHTML = '<div class="ml-featured-products__state">Todavía no hay productos destacados cargados.</div>';
        return;
      }
      track.innerHTML = data.hits.map(hit => window.MacroledProducts.cardTemplate(hit.document)).join("");
      window.MacroledProducts.wireCarousels(track);
      track.scrollLeft = 0;
      setupTrackControls(root, track);
    } catch (error) {
      const filter = space ? `${FEATURED_FIELD}=${space}` : `${FEATURED_FIELD} no vacío`;
      console.error(`Macroled Home · Error consultando Typesense (${filter})`, error);
      track.innerHTML = `<div class="ml-featured-products__state">No se pudieron cargar los productos destacados. Revisá que el campo “${FEATURED_FIELD}” exista.</div>`;
    } finally {
      isFetching = false;
      track.setAttribute("aria-busy", "false");
    }
  }

  function init(root = document) {
    const section = root.querySelector("#productos-destacados");
    if (!section) return;
    const tabs = [...root.querySelectorAll("[data-featured-filter-tabs] .ml-featured-products__tab")];
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
    render(section, null);
  }

  window.MacroledFeatured = { init, setupTrackControls };
})(window);
