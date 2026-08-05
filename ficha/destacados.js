(() => {
  "use strict";

  const TYPESENSE = {
    host: "https://typesense.coresagroup.com",
    apiKey: "g0oiNYY8THGuU9jnCsvqIH1X9HtvYRCR",
    collection: "Macroled_Prueba",
    queryBy: "nombre,descripcion",
  };
  const RELATED_COUNT = 8;
  const MIN_RESULTS_BEFORE_FALLBACK = 4;

  const section = document.getElementById("productos-relacionados");
  const viewport = document.querySelector("[data-related-viewport]");
  const track = document.querySelector("[data-related-track]");
  if (!section || !viewport || !track) return;

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
      { label: doc.nombre_attr1, value: doc.attr_1 },
      { label: doc.nombre_attr2, value: doc.attr_2 },
      { label: doc.nombre_attr3, value: doc.attr_3 },
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

  function tempCategoryColor(value) {
    const kelvin = parseInt(value, 10);
    if (kelvin <= 3000) return "#fff79b";
    if (kelvin <= 4500) return "#d9d9d9";
    return "#bce4fa";
  }

  function buildTempBadge(doc) {
    const candidates = [
      ...rawSpecs(doc)
        .filter(isTemperatureSpec)
        .map((spec) => spec.value),
      doc.rango_temperatura,
      doc.temperatura_filtro,
    ];
    const variant = variantSpec(doc);
    if (variant && isTemperatureSpec(variant)) candidates.unshift(variant.value);
    const matches = candidates.flatMap(
      (source) => String(source || "").match(/\d{4}\s*K/gi) || []
    );
    const tones = [
      ...new Set(matches.map((value) => value.replace(/\s+/g, "").toUpperCase())),
    ].sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    if (!tones.length) return "";
    const label =
      tones.length === 1 ? tones[0] : `${tones[0]}–${tones[tones.length - 1]}`;
    const colors = [...new Set(tones.map(tempCategoryColor))];
    const background =
      colors.length === 1
        ? colors[0]
        : `linear-gradient(to right, ${colors
            .map((color, index) => {
              const step = 100 / colors.length;
              return `${color} ${index * step}%, ${color} ${(index + 1) * step}%`;
            })
            .join(", ")})`;
    return `<span class="ml-product-temp-badge">${escapeHTML(label)}<span class="ml-product-badge-dot${
      colors.length > 1 ? " is-split" : ""
    }" style="background:${background}"></span></span>`;
  }

  function buildVariantBadge(doc) {
    const configured = parseInt(doc.cant_variantes, 10);
    const fieldCount =
      variantSpec(doc)
        ?.value.split(";")
        .map((value) => value.trim())
        .filter(Boolean).length || 0;
    const skuCount = Array.isArray(doc.variantes_sku)
      ? doc.variantes_sku.length
      : 0;
    const count = configured > 0 ? configured : Math.max(fieldCount, skuCount);
    return count > 1
      ? `<span class="ml-product-variant-badge">${count} variantes</span>`
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
    const attrs = specs.length
      ? specs
          .map(
            (spec) =>
              `<div class="ml-product-attr"><span class="ml-product-attr__label">${escapeHTML(
                spec.label
              )}</span><span class="ml-product-attr__value">${escapeHTML(
                spec.value
              )}</span></div>`
          )
          .join("")
      : '<span class="ml-product-card__note">Sin atributos cargados</span>';
    const image = imgs.length
      ? `<img src="${escapeHTML(imgs[0])}" alt="${escapeHTML(
          doc.nombre || "Producto Macroled"
        )}" loading="lazy" width="400" height="400">`
      : '<span class="ml-product-card__note">Sin imagen</span>';
    return `<${tag} class="ml-product-card${
      link ? "" : " ml-product-card--disabled"
    }"${link ? ` href="${escapeHTML(link)}"` : ""} data-id="${escapeHTML(
      doc.id || doc.sku || ""
    )}"><div class="ml-product-card__media">${buildSmartBadge(
      doc
    )}${buildVariantBadge(doc)}${buildTempBadge(
      doc
    )}${image}</div><div class="ml-product-card__title">${escapeHTML(
      doc.nombre || "Producto sin nombre"
    )}</div><div class="ml-product-card__attrs">${attrs}</div></${tag}>`;
  }

  function setupTrackControls() {
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

    track.onpointerdown = (event) => {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      dragStartX = event.clientX;
      dragStartScroll = track.scrollLeft;
      dragged = false;
      track.setPointerCapture(event.pointerId);
    };
    track.onpointermove = (event) => {
      if (!track.hasPointerCapture(event.pointerId)) return;
      const distance = event.clientX - dragStartX;
      if (Math.abs(distance) > 4 && !dragged) {
        dragged = true;
        track.classList.add("is-dragging");
      }
      track.scrollLeft = dragStartScroll - distance;
    };
    const stopDragging = (event) => {
      if (!track.hasPointerCapture(event.pointerId)) return;
      track.releasePointerCapture(event.pointerId);
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
    /* Preferí el SKU ya hidratado en #ficha-sku; si sigue el placeholder y hay CMS, usá CMS */
    if (fromDom && fromCms && fromDom !== fromCms) {
      /* Si el CMS ya está y el texto aún no matchea, priorizar CMS (boot race) */
      const heroSynced = document.getElementById("stageImg")?.getAttribute("src");
      if (!heroSynced) return fromCms;
    }
    return fromDom || fromCms;
  }

  function fb(value) {
    return String(value).replace(/`/g, "").replace(/"/g, '\\"');
  }

  async function searchProducts(filterBy, perPage) {
    const params = new URLSearchParams({
      q: "*",
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

  async function findSelf(sku) {
    const data = await searchProducts(
      `sku:="${fb(sku)}" || variantes_sku:="${fb(sku)}"`,
      1
    );
    return data?.hits?.[0]?.document || null;
  }

  function hideSection() {
    section.hidden = true;
  }

  let loadToken = 0;

  async function loadRelatedProducts() {
    const token = ++loadToken;
    const sku = readCurrentSku();
    console.log("[relacionados] SKU leído de la ficha:", JSON.stringify(sku));

    if (!sku) {
      console.warn(
        "[relacionados] falta el sku en la ficha, no se puede identificar el producto."
      );
      hideSection();
      return;
    }

    track.setAttribute("aria-busy", "true");
    track.innerHTML =
      '<div class="ml-related-products__state">Cargando productos relacionados…</div>';

    try {
      const self = await findSelf(sku);
      if (token !== loadToken) return;
      console.log("[relacionados] documento propio encontrado en Typesense:", self);

      if (!self) {
        console.warn(
          `[relacionados] no se encontró ningún documento en Typesense para el sku "${sku}".`
        );
        hideSection();
        return;
      }

      const exclude = `sku:!="${fb(self.sku)}" && variantes_sku:!="${fb(
        self.sku
      )}"`;

      const levels = [
        self.subfamilia && { field: "subfamilia", value: self.subfamilia },
        self.familia && { field: "familia", value: self.familia },
        self.macrofamilia && { field: "macrofamilia", value: self.macrofamilia },
      ].filter(Boolean);

      console.log("[relacionados] niveles a probar:", levels);

      if (!levels.length) {
        console.warn(
          "[relacionados] el documento propio no tiene subfamilia/familia/macrofamilia cargada."
        );
        hideSection();
        return;
      }

      let data = null;
      for (const level of levels) {
        const filterBy = `${level.field}:="${fb(level.value)}" && ${exclude}`;
        data = await searchProducts(filterBy, RELATED_COUNT);
        if (token !== loadToken) return;
        console.log(
          `[relacionados] nivel "${level.field}"="${level.value}" -> found:`,
          data.found,
          "filter_by:",
          filterBy
        );
        if (data.found >= MIN_RESULTS_BEFORE_FALLBACK) break;
      }

      if (!data?.hits?.length) {
        console.warn(
          "[relacionados] ningún nivel de la cascada trajo resultados."
        );
        hideSection();
        return;
      }

      track.innerHTML = data.hits
        .map((hit) => cardTemplate(hit.document))
        .join("");
      section.hidden = false;
      section.classList.add("is-in");
      track.scrollLeft = 0;
      setupTrackControls();
    } catch (error) {
      if (token !== loadToken) return;
      console.error("[relacionados] Error cargando productos relacionados:", error);
      hideSection();
    } finally {
      if (token === loadToken) track.setAttribute("aria-busy", "false");
    }
  }

  /* Esperar CMS + SKU hidratado (mismo race que script.js en Webflow). */
  function waitAndLoadRelated() {
    let tries = 0;
    const maxTries = 50;
    const tick = () => {
      const hasCms = !!document.querySelector(".cms-product-item[data-sku]");
      const sku = readCurrentSku();
      const heroReady = !!document.getElementById("stageImg")?.getAttribute("src");
      if ((hasCms && (heroReady || tries > 15) && sku) || tries >= maxTries) {
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

  window.addEventListener("ml-product-changed", (event) => {
    const sku = event?.detail?.sku || readCurrentSku();
    if (!sku) return;
    loadRelatedProducts();
  });

  window.MacroledRelatedProducts = { reload: loadRelatedProducts };
})();
