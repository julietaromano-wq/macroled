(() => {
  "use strict";

  const TYPESENSE = {
    host: "https://typesense.coresagroup.com",
    apiKey: "g0oiNYY8THGuU9jnCsvqIH1X9HtvYRCR",
    collection: "Macroled_Prueba",
    queryBy: "nombre_typesense,descripcion",
  };
  const RELATED_COUNT = 8;
  const RELATED_FALLBACK_POOL = 50;

  /* Webflow re-renderiza embeds: NUNCA cachear section/track al inicio. */
  function resolveRelatedTargets() {
    const roots = Array.prototype.slice.call(
      document.querySelectorAll(
        "#productos-relacionados, .ml-related-products, [data-related-viewport]"
      )
    );
    const seen = new Set();
    const targets = [];

    roots.forEach((node) => {
      const viewport = node.matches?.("[data-related-viewport]")
        ? node
        : node.querySelector?.("[data-related-viewport]");
      const track =
        (viewport && viewport.querySelector("[data-related-track]")) ||
        node.querySelector?.("[data-related-track]");
      if (!viewport || !track || !track.isConnected) return;

      const section =
        track.closest("#productos-relacionados, .ml-related-products") ||
        viewport.closest("#productos-relacionados, .ml-related-products") ||
        viewport;

      if (seen.has(section)) return;
      seen.add(section);
      if (!section.isConnected) return;
      targets.push({ section, viewport, track });
    });

    if (targets.length > 1) {
      console.warn(
        "[relacionados] hay",
        targets.length,
        "bloques de relacionados. Dejá solo uno."
      );
    }
    return targets;
  }

  const escapeHTML = (value) =>
    String(value ?? "").replace(
      /[&<>'"]/g,
      (char) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
          char
        ]
    );

  function safeUrl(value) {
    try {
      const url = new URL(String(value), window.location.href);
      return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch (_) {
      return "";
    }
  }

  function parseImages(doc) {
    const raw = doc.multiimage || doc.multiimagen;
    let imgs = [];
    if (Array.isArray(raw)) imgs = raw;
    else if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) imgs = parsed;
      } catch (_) {
        imgs = String(raw)
          .split(/[;,|]/)
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }
    if (!imgs.length && doc.imagen) imgs = [doc.imagen];
    return imgs.map(safeUrl).filter(Boolean);
  }

  function mergeVariantValue(doc, nombre, baseValor) {
    const base = String(baseValor ?? "");
    if (!Array.isArray(doc.atributo_variante)) return base;
    const existing = base.split(";").map((s) => s.trim());
    const extras = doc.atributo_variante
      .filter(
        (v) =>
          String(v.nombre || "").toLowerCase() ===
            String(nombre || "").toLowerCase() &&
          v.valor &&
          !existing.includes(String(v.valor))
      )
      .map((v) => String(v.valor));
    return extras.length ? [base, ...extras].filter(Boolean).join(" ; ") : base;
  }

  function rawSpecs(doc) {
    if (Array.isArray(doc.atributos) && doc.atributos.length) {
      return doc.atributos.map((a) => ({
        label: a.nombre,
        value: mergeVariantValue(doc, a.nombre, a.valor),
      }));
    }
    return [
      { label: doc.nombre_attr1, value: doc.attr1 },
      { label: doc.nombre_attr2, value: doc.attr2 },
      { label: doc.nombre_attr3, value: doc.attr3 },
    ]
      .filter((p) => p.label && p.value)
      .map((p) => ({
        label: p.label,
        value: mergeVariantValue(doc, p.label, p.value),
      }));
  }

  const isTemperatureSpec = (spec) =>
    /temperatura|luz|kelvin|\bcct\b/i.test(String(spec.label || "")) ||
    /\b\d{4}\s*k\b/i.test(String(spec.value || ""));
  const isSmartSpec = (spec) =>
    /^smart$/i.test(String(spec.value || "").trim()) ||
    /\bsmart\b/i.test(String(spec.label || ""));
  const normalizedLabel = (value) =>
    String(value || "")
      .trim()
      .toLocaleLowerCase("es");

  function variantSpec(doc) {
    const label = String(doc.nombre_attr_variantes || "").trim();
    const value = String(doc.attr_variantes || "").trim();
    return label && value ? { label, value } : null;
  }

  function buildSpecs(doc) {
    const variant = variantSpec(doc);
    const variantLabel = normalizedLabel(variant?.label);
    const specs = rawSpecs(doc).filter(
      (spec) =>
        normalizedLabel(spec.label) !== variantLabel &&
        !isTemperatureSpec(spec) &&
        !isSmartSpec(spec)
    );
    if (variant && !isTemperatureSpec(variant) && !isSmartSpec(variant)) {
      specs.unshift(variant);
    }
    return specs.slice(0, 2);
  }

  const ICON_BULB =
    '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V17h6v-.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z"/></svg>';
  const TEMP_TONES = {
    calido: { color: "#fff79b", label: "Cálido" },
    neutro: { color: "#d9d9d9", label: "Neutro" },
    frio: { color: "#bce4fa", label: "Frío" },
  };

  function tempCategoryKey(value) {
    const raw = String(value || "").trim().toLowerCase();
    if (/c[aá]lido/.test(raw)) return "calido";
    if (/neutro/.test(raw)) return "neutro";
    if (/fr[ií]o/.test(raw)) return "frio";
    const kelvin = parseInt(value, 10);
    if (Number.isNaN(kelvin)) return null;
    if (kelvin <= 3000) return "calido";
    if (kelvin <= 4500) return "neutro";
    return "frio";
  }

  function buildLuzCategoryKeys(doc) {
    const candidates = [
      ...rawSpecs(doc)
        .filter(isTemperatureSpec)
        .map((spec) => spec.value),
      doc.rango_temperatura,
      doc.temperatura_filtro,
    ];
    const variant = variantSpec(doc);
    if (variant && isTemperatureSpec(variant)) candidates.unshift(variant.value);
    const bestKelvinByKey = new Map();
    candidates.filter(Boolean).forEach((source) => {
      String(source)
        .split(/[;,|]/)
        .map((tone) => tone.trim())
        .filter(Boolean)
        .forEach((tone) => {
          const key = tempCategoryKey(tone);
          if (!key) return;
          const parsed = parseInt(tone, 10);
          const sortKelvin = Number.isNaN(parsed)
            ? key === "calido"
              ? 2700
              : key === "neutro"
              ? 4000
              : 6500
            : parsed;
          if (!bestKelvinByKey.has(key) || sortKelvin < bestKelvinByKey.get(key)) {
            bestKelvinByKey.set(key, sortKelvin);
          }
        });
    });
    return [...bestKelvinByKey.entries()]
      .sort((a, b) => a[1] - b[1])
      .map(([key]) => key);
  }

  function buildTempBadge(doc) {
    const keys = buildLuzCategoryKeys(doc);
    if (!keys.length) return "";
    const rows = keys
      .map((key) => {
        const { color, label } = TEMP_TONES[key];
        return `<span class="temp-dots-row"><span class="temp-dots-label">${label}</span><span class="luz-dot" style="background:${color}" title="${label}" aria-label="${label}"></span></span>`;
      })
      .join("");
    return `<span class="temp-dots${
      keys.length >= 2 ? " is-collapsed" : ""
    }" tabindex="0" aria-label="Temperatura de luz"><span class="temp-dots-icon" aria-hidden="true">${ICON_BULB}</span>${rows}</span>`;
  }

  function isProductNuevo(doc) {
    const raw = doc.nuevo;
    if (raw === true || raw === 1) return true;
    const value = String(raw ?? "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    return (
      value === "si" ||
      value === "true" ||
      value === "1" ||
      value === "yes" ||
      value === "nuevo"
    );
  }

  function buildNuevoBadge(doc) {
    return isProductNuevo(doc)
      ? `<span class="ml-product-nuevo-badge" aria-label="Producto nuevo">Nuevo</span>`
      : "";
  }

  function buildSmartBadge(doc) {
    const directSmart =
      doc.smart === true ||
      doc.es_smart === true ||
      [doc.smart, doc.es_smart].some((value) =>
        /^(si|sí|true|1|smart)$/i.test(String(value || "").trim())
      );
    return directSmart || rawSpecs(doc).some(isSmartSpec)
      ? '<span class="ml-product-smart-badge" aria-label="Producto Smart">SMART</span>'
      : "";
  }

  function cardTemplate(doc) {
    const imgs = parseImages(doc);
    const specs = buildSpecs(doc);
    const link = safeUrl(doc.link_ficha_web);
    const tag = link ? "a" : "div";
    const specsHtml = specs.length
      ? specs
          .map(
            (spec) =>
              `<div class="ml-product-card__spec"><span class="ml-product-card__spec-label">${escapeHTML(
                spec.label
              )}</span><span class="ml-product-card__spec-value">${escapeHTML(
                spec.value
              )}</span></div>`
          )
          .join("")
      : '<span class="ml-product-card__note">Sin atributos cargados</span>';
    const image = imgs.length
      ? `<img src="${escapeHTML(imgs[0])}" alt="${escapeHTML(
          doc.nombre_typesense || "Producto Macroled"
        )}" loading="lazy" width="400" height="400">`
      : '<span class="ml-product-card__note">Sin imagen</span>';
    const badgesLeft = buildNuevoBadge(doc);
    const badgesRight = buildSmartBadge(doc);
    return `<${tag} class="ml-product-card${
      link ? "" : " ml-product-card--disabled"
    }"${link ? ` href="${escapeHTML(link)}"` : ""} data-id="${escapeHTML(
      doc.id || doc.sku || ""
    )}"><div class="media">${
      badgesLeft ? `<div class="media-badges-left">${badgesLeft}</div>` : ""
    }${
      badgesRight ? `<div class="media-badges-right">${badgesRight}</div>` : ""
    }<div class="card-overlays">${buildTempBadge(
      doc
    )}</div><div class="media-frame">${image}</div></div><div class="ml-product-card__title">${escapeHTML(
      doc.nombre_typesense || "Producto sin nombre"
    )}</div><div class="ml-product-card__specs">${specsHtml}</div></${tag}>`;
  }

  function setupTrackControls(section, viewport, track) {
    const controls = section.querySelector(".ml-related-products__controls");
    const progressBar = section.querySelector(".ml-related-products__progress");
    const progress = section.querySelector("[data-related-progress]");
    const prev = section.querySelector("[data-related-prev]");
    const next = section.querySelector("[data-related-next]");
    const arrows = section.querySelector(".ml-related-products__arrows");
    const mobile = matchMedia("(max-width: 640px)");
    if (!controls || !progressBar || !progress || !prev || !next || !arrows)
      return;

    const cards = [...track.querySelectorAll(".ml-product-card")];

    const update = () => {
      if (!track.isConnected) return;
      const needsScroll = track.scrollWidth > track.clientWidth + 4;
      controls.hidden = !needsScroll;
      arrows.hidden = !needsScroll;
      if (!needsScroll) return;

      const arrowsTarget = mobile.matches ? controls : viewport;
      if (arrows.parentElement !== arrowsTarget) arrowsTarget.prepend(arrows);

      const max = track.scrollWidth - track.clientWidth;
      prev.disabled = track.scrollLeft <= 4;
      next.disabled = track.scrollLeft >= max - 4;
      const visibleRatio = Math.min(1, track.clientWidth / track.scrollWidth);
      const progressRatio =
        max > 0 ? Math.max(0, Math.min(1, track.scrollLeft / max)) : 0;
      const barWidth = progressBar.clientWidth;
      const hasProgress = track.scrollLeft > 4;
      progressBar.classList.toggle("has-progress", hasProgress);
      progress.style.width = hasProgress ? `${visibleRatio * 100}%` : "0";
      progress.style.transform = `translateX(${
        progressRatio * barWidth * (1 - visibleRatio)
      }px)`;
    };

    track.onscroll = update;
    const moveToCard = (direction) => {
      if (!cards.length) return;
      const firstLeft = cards[0].getBoundingClientRect().left;
      const positions = cards.map(
        (card) => card.getBoundingClientRect().left - firstLeft
      );
      const current = positions.reduce(
        (closest, position, index) =>
          Math.abs(position - track.scrollLeft) <
          Math.abs(positions[closest] - track.scrollLeft)
            ? index
            : closest,
        0
      );
      const target = Math.max(
        0,
        Math.min(cards.length - 1, current + direction)
      );
      track.scrollTo({ left: positions[target], behavior: "smooth" });
    };
    prev.onclick = () => moveToCard(-1);
    next.onclick = () => moveToCard(1);

    let dragStartX = 0;
    let dragStartScroll = 0;
    let dragged = false;

    // OJO: la captura del puntero se toma solo cuando se confirma arrastre real
    // (>6px de movimiento), nunca en pointerdown — capturarla antes rompe la
    // navegación del <a> y la selección de texto en un click normal sobre la card.
    track.onpointerdown = (event) => {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      dragStartX = event.clientX;
      dragStartScroll = track.scrollLeft;
      dragged = false;
    };
    track.onpointermove = (event) => {
      if (event.pointerType !== "mouse" || event.buttons !== 1) return;
      const distance = event.clientX - dragStartX;
      if (!dragged && Math.abs(distance) <= 6) return;
      if (!dragged) {
        dragged = true;
        track.classList.add("is-dragging");
        try {
          track.setPointerCapture(event.pointerId);
        } catch (_) {
          /* ignore */
        }
      }
      track.scrollLeft = dragStartScroll - distance;
    };
    const stopDragging = (event) => {
      if (event.pointerType && event.pointerType !== "mouse") return;
      if (track.hasPointerCapture?.(event.pointerId)) {
        track.releasePointerCapture(event.pointerId);
      }
      track.classList.remove("is-dragging");
    };
    track.onpointerup = stopDragging;
    track.onpointercancel = stopDragging;
    track.ondragstart = () => false;
    track.onclick = (event) => {
      if (!dragged) return;
      event.preventDefault();
      event.stopPropagation();
      dragged = false;
    };

    track._relatedResizeObserver?.disconnect();
    track._relatedResizeObserver = new ResizeObserver(update);
    track._relatedResizeObserver.observe(track);
    if (track._relatedControlsMedia && track._relatedControlsMediaHandler) {
      track._relatedControlsMedia.removeEventListener(
        "change",
        track._relatedControlsMediaHandler
      );
    }
    track._relatedControlsMedia = mobile;
    track._relatedControlsMediaHandler = update;
    mobile.addEventListener("change", update);
    update();
  }

  function readCurrentSku() {
    const fromDom = document.getElementById("ficha-sku")?.textContent.trim() || "";
    const fromCms =
      document.querySelector(".cms-product-item[data-sku]")?.getAttribute("data-sku")?.trim() ||
      "";
    if (fromDom && fromCms && fromDom !== fromCms) {
      const heroSynced = document.getElementById("stageImg")?.getAttribute("src");
      if (!heroSynced) return fromCms;
    }
    return fromDom || fromCms;
  }

  function readCmsContext() {
    const el =
      document.querySelector(".cms-product-item[data-hero][data-sku]") ||
      document.querySelector(".cms-product-item[data-sku]");
    if (!el) return null;
    return {
      sku: (el.getAttribute("data-sku") || "").trim(),
      nombre: (el.getAttribute("data-name") || "").trim(),
      familia: (el.getAttribute("data-family") || "").trim(),
      macrofamilia: (el.getAttribute("data-macrofamilia") || "").trim(),
      subfamilia: (el.getAttribute("data-subfamilia") || "").trim(),
    };
  }

  function fb(value) {
    return String(value).replace(/`/g, "").replace(/"/g, '\\"');
  }

  function nameTokens(value) {
    const ignored = new Set(["de", "del", "la", "las", "el", "los", "y", "para", "con"]);
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("es")
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
      .split(/\s+/)
      .filter((token) => token && !ignored.has(token));
  }

  /* Typesense prioriza coincidencias con el nombre. Este ranking local mantiene
     el orden estable y también ordena el fallback q="*" por parecido. */
  function nameSimilarity(reference, candidate) {
    const ref = nameTokens(reference);
    const other = nameTokens(candidate);
    if (!ref.length || !other.length) return 0;

    const refSet = new Set(ref);
    const otherSet = new Set(other);
    let shared = 0;
    refSet.forEach((token) => {
      if (otherSet.has(token)) shared += 1;
    });

    const union = new Set([...refSet, ...otherSet]).size || 1;
    const tokenScore = shared / union;
    let prefix = 0;
    while (prefix < ref.length && prefix < other.length && ref[prefix] === other[prefix]) {
      prefix += 1;
    }
    const prefixScore = prefix / Math.max(ref.length, other.length);
    return tokenScore * 4 + prefixScore;
  }

  function sortByNameSimilarity(docs, currentName) {
    return docs.sort((a, b) => {
      const score = nameSimilarity(currentName, b.nombre_typesense) - nameSimilarity(currentName, a.nombre_typesense);
      if (score) return score;
      return String(a.nombre_typesense || "").localeCompare(String(b.nombre_typesense || ""), "es", {
        numeric: true,
        sensitivity: "base",
      });
    });
  }

  async function searchProducts(filterBy, perPage, query = "*") {
    const params = new URLSearchParams({
      q: query || "*",
      query_by: TYPESENSE.queryBy,
      filter_by: filterBy,
      per_page: String(perPage),
      page: "1",
    });
    const url = `${TYPESENSE.host}/collections/${encodeURIComponent(
      TYPESENSE.collection
    )}/documents/search?${params}`;
    const response = await fetch(url, {
      headers: { "X-TYPESENSE-API-KEY": TYPESENSE.apiKey },
    });
    if (!response.ok) {
      throw new Error(`Typesense ${response.status}: ${await response.text()}`);
    }
    return response.json();
  }

  /* Prioridad: misma familia dentro de la misma macrofamilia; luego completar
     solo con productos de esa macrofamilia. */
  function buildRelatedFilters(ctx, sku) {
    /* Sin este filtro, dos variantes (color/temperatura) del mismo modelo
       pueden ocupar dos slots del carrusel en vez de sugerir productos
       distintos. es_principal:true deja pasar solo el SKU representante
       de cada familia de variantes. */
    const excludeParts = ["es_principal:=true"];
    if (sku) {
      excludeParts.push(`sku:!="${fb(sku)}"`);
      excludeParts.push(`variantes_sku:!="${fb(sku)}"`);
    }
    const exclude = excludeParts.join(" && ");
    const familia = ctx.familia;
    const macro = ctx.macrofamilia;
    const nombre = ctx.nombre || "";
    const filters = [];

    if (familia && macro) {
      if (nombre) {
        filters.push({
          label: "familia+macrofamilia por nombre",
          query: nombre,
          perPage: RELATED_COUNT,
          filterBy: `familia:="${fb(familia)}" && macrofamilia:="${fb(macro)}"${
            exclude ? ` && ${exclude}` : ""
          }`,
        });
      }
      filters.push({
        label: "familia+macrofamilia",
        query: "*",
        perPage: RELATED_COUNT,
        filterBy: `familia:="${fb(familia)}" && macrofamilia:="${fb(macro)}"${
          exclude ? ` && ${exclude}` : ""
        }`,
      });
    }
    if (macro) {
      if (nombre) {
        filters.push({
          label: "macrofamilia por nombre",
          query: nombre,
          perPage: RELATED_COUNT,
          filterBy: `macrofamilia:="${fb(macro)}"${exclude ? ` && ${exclude}` : ""}`,
        });
      }
      filters.push({
        label: "macrofamilia",
        query: "*",
        perPage: RELATED_FALLBACK_POOL,
        filterBy: `macrofamilia:="${fb(macro)}"${exclude ? ` && ${exclude}` : ""}`,
      });
    }
    /* La misma familia puede consultarse por nombre y como fallback general. */
    const seen = new Set();
    return filters.filter((f) => {
      const signature = `${f.query}|${f.filterBy}`;
      if (seen.has(signature)) return false;
      seen.add(signature);
      return true;
    });
  }

  function hideSection(section) {
    if (!section) return;
    section.hidden = true;
    section.setAttribute("hidden", "");
    section.style.display = "none";
  }

  function forceLayoutVisible(el) {
    let node = el;
    const chain = [];
    while (node && node !== document.documentElement) {
      chain.push(node);
      node = node.parentElement;
    }
    chain.forEach((n) => {
      const cs = getComputedStyle(n);
      if (cs.display === "none") {
        n.style.setProperty("display", "block", "important");
      }
      if (cs.visibility === "hidden" || cs.visibility === "collapse") {
        n.style.setProperty("visibility", "visible", "important");
      }
      if (cs.opacity === "0") {
        n.style.setProperty("opacity", "1", "important");
      }
      if (n.classList?.contains("w-embed") || n.classList?.contains("w-dyn-bind-empty")) {
        n.style.setProperty("display", "block", "important");
        n.style.setProperty("height", "auto", "important");
        n.style.setProperty("min-height", "360px", "important");
        n.style.setProperty("overflow", "visible", "important");
      }
    });
  }

  function showSection(section) {
    if (!section) return;
    section.hidden = false;
    section.removeAttribute("hidden");
    section.style.setProperty("display", "block", "important");
    section.style.setProperty("visibility", "visible", "important");
    section.style.setProperty("opacity", "1", "important");
    section.style.setProperty("height", "auto", "important");
    section.style.setProperty("min-height", "360px", "important");
    section.style.transform = "none";
    section.classList.add("is-in");
    forceLayoutVisible(section);
  }

  function paintCards(targets, html) {
    let cardCount = 0;
    targets.forEach(({ section, viewport, track }) => {
      if (!track.isConnected || !section.isConnected) return;
      track.innerHTML = html;
      track.style.setProperty("display", "flex", "important");
      track.style.setProperty("min-height", "280px", "important");
      track.querySelectorAll(".ml-product-card").forEach((card) => {
        card.style.setProperty("min-height", "260px", "important");
        card.style.setProperty("display", "flex", "important");
      });
      if (viewport) {
        viewport.style.setProperty("display", "block", "important");
        viewport.style.setProperty("min-height", "280px", "important");
        viewport.style.setProperty("width", "100%", "important");
      }
      cardCount = Math.max(
        cardCount,
        track.querySelectorAll(".ml-product-card").length
      );
      showSection(section);
      track.scrollLeft = 0;
      track.setAttribute("aria-busy", "false");
      setupTrackControls(section, viewport, track);
    });
    return cardCount;
  }

  let loadToken = 0;
  let reloadTimer = 0;
  let isLoading = false;

  function scheduleReload(reason) {
    if (isLoading) return;
    if (reason) console.log("[relacionados] reintento:", reason);
    window.clearTimeout(reloadTimer);
    reloadTimer = window.setTimeout(() => {
      loadRelatedProducts();
    }, 400);
  }

  let paintedOk = false;

  async function loadRelatedProducts() {
    if (paintedOk && resolveRelatedTargets().some(({ track }) => track.querySelector(".ml-product-card"))) {
      return;
    }
    const token = ++loadToken;
    isLoading = true;
    const targets = resolveRelatedTargets();
    if (!targets.length) {
      isLoading = false;
      console.warn(
        "[relacionados] no hay markup de relacionados en el DOM. Pegá 2b-EMBED-RELACIONADOS.html completo (HTML + script) en un Embed de esta plantilla.",
        {
          porId: !!document.getElementById("productos-relacionados"),
          porViewport: !!document.querySelector("[data-related-viewport]"),
          porTrack: !!document.querySelector("[data-related-track]"),
        }
      );
      return;
    }

    const ctx = readCmsContext() || {};
    const sku = readCurrentSku() || ctx.sku || "";
    const nombre = ctx.nombre || "";
    const familia = ctx.familia || "";
    const macrofamilia = ctx.macrofamilia || "";

    console.log("[relacionados] contexto CMS:", {
      sku,
      nombre,
      familia,
      macrofamilia,
    });

    if (!familia && !macrofamilia) {
      console.warn(
        "[relacionados] faltan data-family / data-macrofamilia en .cms-product-item."
      );
      targets.forEach(({ section }) => hideSection(section));
      isLoading = false;
      return;
    }

    targets.forEach(({ track }) => {
      track.setAttribute("aria-busy", "true");
      track.innerHTML =
        '<div class="ml-related-products__state">Cargando productos relacionados…</div>';
    });

    try {
      const filters = buildRelatedFilters(
        { nombre, familia, macrofamilia },
        sku
      );
      console.log("[relacionados] filtros Typesense a probar:", filters);

      /* Acumulamos de lo mas especifico a lo mas general hasta llenar el
         carrusel. Antes se elegia un solo nivel, asi que una familia chica
         (ej. Highbay PRO tiene 3 SKU) dejaba 2 cards y nunca completaba. */
      const skuKey = String(sku || "").trim().toUpperCase();
      const picked = new Map();

      for (const step of filters) {
        const data = await searchProducts(step.filterBy, step.perPage, step.query);
        if (token !== loadToken) return;

        let added = 0;
        const ranked = sortByNameSimilarity(
          (data.hits || []).map((hit) => hit.document || {}),
          nombre
        );
        ranked.forEach((doc) => {
          const key = String(doc.sku || "").trim().toUpperCase();
          if (!key || key === skuKey || picked.has(key)) return;
          picked.set(key, doc);
          added += 1;
        });

        console.log(
          `[relacionados] ${step.label} -> found: ${data.found}, nuevos: ${added}, acumulado: ${picked.size}`,
          "q:",
          step.query
        );
        if (picked.size >= RELATED_COUNT) break;
      }

      const docs = Array.from(picked.values()).slice(0, RELATED_COUNT);

      if (!docs.length) {
        console.warn("[relacionados] Typesense no trajo productos relacionados.");
        resolveRelatedTargets().forEach(({ section }) => hideSection(section));
        return;
      }

      const liveTargets = resolveRelatedTargets();
      if (!liveTargets.length) {
        console.warn(
          "[relacionados] el bloque HTML desapareció durante la carga; reintento."
        );
        isLoading = false;
        scheduleReload("dom perdido tras fetch");
        return;
      }

      const html = docs.map((doc) => cardTemplate(doc)).join("");
      const cardCount = paintCards(liveTargets, html);
      paintedOk = cardCount > 0;
      console.log(
        "[relacionados] cards inyectadas:",
        cardCount,
        "en",
        liveTargets.length,
        "bloque(s)"
      );
      const first = liveTargets[0]?.track?.querySelector(".ml-product-card");
      if (first) {
        const r = first.getBoundingClientRect();
        console.log("[relacionados] primera card rect:", {
          w: Math.round(r.width),
          h: Math.round(r.height),
          top: Math.round(r.top),
          sectionDisplay: getComputedStyle(liveTargets[0].section).display,
        });
      }
    } catch (error) {
      if (token !== loadToken) return;
      console.error("[relacionados] Error cargando productos relacionados:", error);
      resolveRelatedTargets().forEach(({ section }) => hideSection(section));
    } finally {
      if (token === loadToken) {
        isLoading = false;
        resolveRelatedTargets().forEach(({ track }) =>
          track.setAttribute("aria-busy", "false")
        );
      }
    }
  }

  /* Esperar sección + familia/macro del CMS (Webflow monta embeds tarde). */
  function waitAndLoadRelated() {
    let tries = 0;
    const maxTries = 80;
    const tick = () => {
      const targets = resolveRelatedTargets();
      const ctx = readCmsContext();
      const hasTaxonomy = !!(ctx && (ctx.familia || ctx.macrofamilia));
      if (
        (targets.length && hasTaxonomy) ||
        tries >= maxTries
      ) {
        if (!targets.length) {
          console.warn(
            "[relacionados] timeout: no apareció #productos-relacionados. Pegá 2b-EMBED-RELACIONADOS."
          );
          return;
        }
        loadRelatedProducts();
        return;
      }
      tries += 1;
      setTimeout(tick, 100);
    };
    tick();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", waitAndLoadRelated);
  } else {
    waitAndLoadRelated();
  }

  /* Sin MutationObserver: en Webflow re-disparaba carga y borraba las cards. */
  window.addEventListener("ml-product-changed", () => {
    paintedOk = false;
    scheduleReload("ml-product-changed");
  });

  window.MacroledRelatedProducts = { reload: loadRelatedProducts };
})();
