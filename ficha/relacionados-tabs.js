/*
  Tabs "Productos armados" / "Despiece" (familia Interruptores y Tomas) y
  "Productos compatibles" (familia Tiras LED) en la ficha de producto.

  Fuente de datos: campos de CMS bindeados en cms-source-embed.html como
  data-relacionados-armados / data-relacionados-despiece / data-compatibles
  en .cms-product-item (mismo patrón que "Variantes del producto SKU").

  IMPORTANTE: esos campos no necesitan estar indexados en Typesense
  (colección Macroled_Prueba) para que esto funcione. Solo necesitan
  existir como documentos los SKU listados en cada campo — no el campo
  de relación en sí. Si un SKU listado todavía no está en Typesense, esa
  card simplemente no aparece; y si NINGUNO de los SKU del grupo resuelve
  (dato roto o incompleto en el CMS), el tab entero queda oculto en vez
  de mostrarse vacío.

  Si el SKU actual no tiene datos cargados en ninguno de los campos, el
  tab correspondiente queda oculto (atributo hidden en el HTML por default).

  El carrusel (flechas, drag, barra de progreso) reutiliza el mismo
  comportamiento que "También te puede interesar" (ver setupTrackControls
  en destacados.js), aplicado a los contenedores .ml-rel-carousel__*.
*/
(() => {
  "use strict";

  const TYPESENSE = {
    host: "https://typesense.coresagroup.com",
    apiKey: "g0oiNYY8THGuU9jnCsvqIH1X9HtvYRCR",
    collection: "Macroled_Prueba",
    queryBy: "descripcion",
  };

  const GROUPS = [
    { key: "armados", role: "Armado", roleClass: "is-armado", attr: "data-relacionados-armados" },
    { key: "despiece", role: "Despiece", roleClass: "is-despiece", attr: "data-relacionados-despiece" },
    { key: "compatibles", role: "Compatible", roleClass: "is-compatible", attr: "data-compatibles" },
  ];

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

  function firstImage(doc) {
    const raw = doc.multiimagen || doc.multiimage || doc.imagen || "";
    const first = Array.isArray(raw)
      ? raw[0]
      : String(raw).split(/[;,|]/)[0];
    return safeUrl((first || "").trim());
  }

  /* Badges y specs: mismo criterio que cardTemplate() en destacados.js,
     para que estas cards tengan el mismo nivel de información. */
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

  function variantSpec(doc) {
    const label = String(doc.nombre_attr_variantes || "").trim();
    const value = String(doc.attr_variantes || "").trim();
    return label && value ? { label, value } : null;
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

  /* "sku-a ; sku-b" (case que sea) -> ["SKU-A","SKU-B"], sin vacíos ni duplicados */
  function parseSkuList(raw) {
    const seen = new Set();
    return String(raw || "")
      .split(/[;,]/)
      .map((s) => s.trim().toUpperCase())
      .filter((s) => {
        if (!s || seen.has(s)) return false;
        seen.add(s);
        return true;
      });
  }

  function readContext() {
    const el =
      document.querySelector(".cms-product-item[data-hero][data-sku]") ||
      document.querySelector(".cms-product-item[data-sku]");
    if (!el) return null;
    const ctx = { sku: (el.getAttribute("data-sku") || "").trim().toUpperCase() };
    GROUPS.forEach((group) => {
      ctx[group.key] = parseSkuList(el.getAttribute(group.attr));
    });
    return ctx;
  }

  async function fetchBySkus(skuList) {
    if (!skuList.length) return [];
    const inList = skuList.map((sku) => `"${sku.replace(/"/g, '\\"')}"`).join(",");
    const params = new URLSearchParams({
      q: "*",
      query_by: TYPESENSE.queryBy,
      filter_by: `sku:=[${inList}]`,
      per_page: String(Math.min(skuList.length, 250)),
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
    const data = await response.json();
    const docs = (data.hits || []).map((hit) => hit.document);
    // Mantiene el orden en que el CMS listó los SKU, no el orden de Typesense.
    docs.sort((a, b) => skuList.indexOf(a.sku) - skuList.indexOf(b.sku));
    return docs;
  }

  function cardTemplate(doc, group) {
    const link = safeUrl(doc.link_ficha_web);
    const tag = link ? "a" : "div";
    const image = firstImage(doc);
    const media = image
      ? `<img src="${escapeHTML(image)}" alt="${escapeHTML(
          doc.nombre_typesense || doc.sku || ""
        )}" loading="lazy" width="300" height="300">`
      : '<span class="ml-product-card__note">Sin imagen</span>';
    const badgesLeft = `<span class="ml-product-role-badge ${group.roleClass}">${
      group.role
    }</span>`;
    const badgesRight = buildSmartBadge(doc);
    return `<${tag} class="ml-product-card${
      link ? "" : " ml-product-card--disabled"
    }"${link ? ` href="${escapeHTML(link)}"` : ""}><div class="media"><div class="media-badges-left">${badgesLeft}</div>${
      badgesRight ? `<div class="media-badges-right">${badgesRight}</div>` : ""
    }<div class="card-overlays">${buildTempBadge(
      doc
    )}</div><div class="media-frame">${media}</div></div><div class="ml-product-card__title">${escapeHTML(
      doc.nombre_typesense || doc.descripcion || "Producto sin nombre"
    )}</div><span class="ml-product-card__sku">${escapeHTML(
      doc.sku || ""
    )}</span></${tag}>`;
  }

  /* Mismo comportamiento que setupTrackControls() en destacados.js
     (flechas, progreso, drag-to-scroll), aplicado a un carrusel propio. */
  function setupCarousel(root, track) {
    const viewport = root.querySelector(".ml-rel-carousel__viewport");
    const controls = root.querySelector(".ml-rel-carousel__controls");
    const progressBar = root.querySelector(".ml-rel-carousel__progress");
    const progress = root.querySelector("[data-rel-progress]");
    const prev = root.querySelector("[data-rel-prev]");
    const next = root.querySelector("[data-rel-next]");
    const arrows = root.querySelector(".ml-rel-carousel__arrows");
    const mobile = matchMedia("(max-width: 640px)");
    if (!viewport || !controls || !progressBar || !progress || !prev || !next || !arrows)
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
    // navegación del <a> en un click normal sobre la card.
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

    track._relResizeObserver?.disconnect();
    track._relResizeObserver = new ResizeObserver(update);
    track._relResizeObserver.observe(track);
    if (track._relControlsMedia && track._relControlsMediaHandler) {
      track._relControlsMedia.removeEventListener(
        "change",
        track._relControlsMediaHandler
      );
    }
    track._relControlsMedia = mobile;
    track._relControlsMediaHandler = update;
    mobile.addEventListener("change", update);

    update();
  }

  // Solo revela el botón del tab. El panel arranca "hidden" en el HTML y lo
  // maneja el switch genérico de .tab en script.js cuando el usuario lo clickea.
  function showTab(group, count) {
    const tab = document.getElementById(`tab-${group.key}`);
    const countEl = document.getElementById(`tab-${group.key}-count`);
    if (tab) tab.hidden = false;
    if (countEl) countEl.textContent = count > 0 ? String(count) : "";
  }

  // Ninguno de los SKU listados resolvió en Typesense (dato roto/incompleto
  // en el CMS): se oculta el tab en vez de mostrarlo con un estado vacío.
  function hideTab(group) {
    const tab = document.getElementById(`tab-${group.key}`);
    if (tab) tab.hidden = true;
  }

  function renderGroup(group, docs) {
    const track = document.getElementById(`${group.key}-grid`);
    if (!track) return;
    track.setAttribute("aria-busy", "false");
    if (!docs.length) {
      track.innerHTML = "";
      hideTab(group);
      return;
    }
    track.innerHTML = docs.map((doc) => cardTemplate(doc, group)).join("");
    showTab(group, docs.length);
    const root = track.closest(".ml-rel-carousel");
    if (root) setupCarousel(root, track);
  }

  async function loadGroup(group, ctx) {
    const skuList = ctx[group.key];
    if (!skuList.length) return; // tab queda oculto, tal como viene en el HTML
    try {
      const docs = await fetchBySkus(
        skuList.filter((sku) => sku !== ctx.sku)
      );
      renderGroup(group, docs);
    } catch (err) {
      console.warn(`[relacionados-tabs] error resolviendo "${group.key}":`, err);
      renderGroup(group, []);
    }
  }

  async function loadRelated() {
    const ctx = readContext();
    if (!ctx) return;
    for (const group of GROUPS) await loadGroup(group, ctx);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadRelated);
  } else {
    loadRelated();
  }
})();
