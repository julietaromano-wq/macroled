/* Macroled Home · archivo generado. Editar fuentes en /js y regenerar. */
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

(function (window) {
  "use strict";
  const CCT_DOT={"2000K":"#ff8a00","2700K":"#ffab40","3000K":"#ffb84d","4000K":"#cfe8ff","4500K":"#bfe3ff","5000K":"#5ec8f2","5700K":"#29b6f6","6500K":"#3b82f6"};
  const cache=new Map();
  const escapeHTML=value=>String(value??"").replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));
  const safeUrl=value=>{try{const url=new URL(String(value),window.location.href);return ["http:","https:"].includes(url.protocol)?url.href:""}catch(_){return ""}};

  function parseImages(doc){
    const raw=doc.multiimage||doc.multiimagen;let imgs=[];
    if(Array.isArray(raw)) imgs=raw;
    else if(raw){try{const parsed=JSON.parse(raw);if(Array.isArray(parsed)) imgs=parsed}catch(_){imgs=String(raw).split(/[,|]/).map(s=>s.trim()).filter(Boolean)}}
    if(!imgs.length&&doc.imagen) imgs=[doc.imagen];
    return imgs.map(safeUrl).filter(Boolean);
  }
  function mergeVariantValue(doc,nombre,baseValor){
    const base=String(baseValor??"");if(!Array.isArray(doc.atributo_variante)) return base;
    const existing=base.split(";").map(s=>s.trim());
    const extras=doc.atributo_variante.filter(v=>String(v.nombre||"").toLowerCase()===String(nombre||"").toLowerCase()&&v.valor&&!existing.includes(String(v.valor))).map(v=>String(v.valor));
    return extras.length?[base,...extras].filter(Boolean).join(" ; "):base;
  }
  function buildSpecs(doc){
    if(Array.isArray(doc.atributos)&&doc.atributos.length) return doc.atributos.slice(0,3).map(a=>({label:a.nombre,value:mergeVariantValue(doc,a.nombre,a.valor)}));
    return [{label:doc.nombre_attr1,value:doc.attr_1},{label:doc.nombre_attr2,value:doc.attr_2},{label:doc.nombre_attr3,value:doc.attr_3}].filter(p=>p.label&&p.value).slice(0,3).map(p=>({label:p.label,value:mergeVariantValue(doc,p.label,p.value)}));
  }
  async function fetchProducts(field,value,count){
    const cfg=window.MACROLED_HOME_CONFIG.typesense;
    if(!cfg.host||!cfg.apiKey||!cfg.collection) throw new Error("Configuración Typesense incompleta");
    const key=[field,value,count].join("|");if(cache.has(key)) return cache.get(key);
    const params=new URLSearchParams({q:"*",query_by:cfg.queryBy||"nombre,descripcion",filter_by:`${field}:=${value}`,per_page:String(count),page:"1"});
    const request=fetch(`${cfg.host}/collections/${encodeURIComponent(cfg.collection)}/documents/search?${params}`,{headers:{"X-TYPESENSE-API-KEY":cfg.apiKey}}).then(async res=>{if(!res.ok) throw new Error(`Typesense ${res.status}: ${await res.text()}`);return res.json()}).catch(error=>{cache.delete(key);throw error});
    cache.set(key,request);return request;
  }
  function cardTemplate(doc){
    const imgs=parseImages(doc),specs=buildSpecs(doc),link=safeUrl(doc.link_ficha_web),tag=link?"a":"div";
    const attrs=specs.length?specs.map(spec=>{const value=String(spec.value||""),token=value.split(";")[0].trim(),dot=/luz|temperatura/i.test(spec.label)&&CCT_DOT[token]?`<span class="ml-product-dot" style="background:${CCT_DOT[token]}"></span>`:"";return `<div class="ml-product-attr"><span class="ml-product-attr__label">${escapeHTML(spec.label)}</span><span class="ml-product-attr__value">${dot}${escapeHTML(value)}</span></div>`}).join(""):`<span class="ml-product-card__note">Sin atributos cargados</span>`;
    const image=imgs.length?`<img src="${escapeHTML(imgs[0])}" alt="${escapeHTML(doc.nombre||"Producto Macroled")}" loading="lazy" width="400" height="400" data-images="${escapeHTML(JSON.stringify(imgs))}" data-index="0">`:`<span class="ml-product-card__note">Sin imagen</span>`;
    const nav=imgs.length>1?`<button type="button" class="ml-product-card__nav ml-product-card__nav--prev" aria-label="Imagen anterior">←</button><button type="button" class="ml-product-card__nav ml-product-card__nav--next" aria-label="Imagen siguiente">→</button>`:"";
    return `<${tag} class="ml-product-card${link?"":" ml-product-card--disabled"}"${link?` href="${escapeHTML(link)}"`:""} data-id="${escapeHTML(doc.id||doc.sku||"")}"><div class="ml-product-card__media">${image}${nav}</div><div class="ml-product-card__title">${escapeHTML(doc.nombre||"Producto sin nombre")}</div><div class="ml-product-card__attrs">${attrs}</div></${tag}>`;
  }
  function wireCarousels(grid){
    grid.querySelectorAll(".ml-product-card__media").forEach(media=>{const img=media.querySelector("img[data-images]");if(!img)return;let images=[];try{images=JSON.parse(img.dataset.images)}catch(_){return}const move=direction=>{let index=Number(img.dataset.index||0);index=(index+direction+images.length)%images.length;img.dataset.index=String(index);img.src=images[index]};media.querySelector(".ml-product-card__nav--prev")?.addEventListener("click",event=>{event.preventDefault();event.stopPropagation();move(-1)});media.querySelector(".ml-product-card__nav--next")?.addEventListener("click",event=>{event.preventDefault();event.stopPropagation();move(1)})});
  }
  async function renderGrid(grid){
    const field=grid.dataset.productsField,value=grid.dataset.productsValue,count=Number(grid.dataset.productsCount||4);
    grid.setAttribute("aria-busy","true");
    try{const data=await fetchProducts(field,value,count);if(!data.hits?.length){grid.innerHTML=`<div class="ml-product-state">No hay productos para “${escapeHTML(value)}”.</div>`;return}grid.innerHTML=data.hits.map(hit=>cardTemplate(hit.document)).join("");wireCarousels(grid)}catch(error){console.error(`Macroled Home · Error consultando Typesense (${field}=${value})`,error);grid.innerHTML=`<div class="ml-product-state">No se pudieron cargar los productos. Verificá la configuración de Typesense y que “${escapeHTML(value)}” exista.</div>`}finally{grid.setAttribute("aria-busy","false")}
  }
  function init(root=document){root.querySelectorAll(".ml-product-grid:not([data-products-ready])").forEach(grid=>{grid.dataset.productsReady="true";renderGrid(grid)})}
  window.MacroledProducts={init,parseImages,mergeVariantValue,buildSpecs,cardTemplate,wireCarousels};
})(window);

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

(function (window) {
  "use strict";

  const config = window.MACROLED_HOME_CONFIG;
  const root = document.getElementById("macroled-home");
  if (!config || !root) return;

  const esc = value => String(value ?? "").replace(/[&<>'"]/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  })[character]);

  const emphasize = (value, term) => {
    const safe = esc(value);
    if (!term) return safe;
    const safeTerm = esc(term);
    return safe.replace(safeTerm, `<strong>${safeTerm}</strong>`);
  };

  function categoryTemplate(item) {
    return `<a class="ml-category-card" href="${esc(item.href)}" data-editorial-id="${esc(item.id)}"><div class="ml-category-card__media"><img src="${esc(item.image)}" alt="" loading="lazy" width="800" height="800"></div><h3>${esc(item.title)}</h3></a>`;
  }

  function lineContentTemplate(item) {
    const content = item.content || {};

    if (content.mode === "static") {
      const categories = config.manualCategories?.[content.categoryGroup] || content.items || [];
      return `<div class="ml-line-content ml-line-content--static"><div class="ml-categories ml-line-subfamilies">${categories.map(categoryTemplate).join("")}</div></div>`;
    }

    const query = content.query || item;
    return `<div class="ml-products-block"><div class="ml-product-grid" data-products-field="${esc(query.typesenseField)}" data-products-value="${esc(query.typesenseValue)}" data-products-count="${Number(query.productCount || 4)}"><div class="ml-product-state">Cargando productos…</div></div></div>`;
  }

  function lineTemplate(item) {
    const mode = item.content?.mode || "typesense";
    return `<article class="ml-featured ml-shell" data-theme="${esc(item.theme)}" data-layout="${esc(item.layout)}" data-content-mode="${esc(mode)}" style="--line-bg:${esc(item.theme)};--line-color:${esc(item.textColor)}"><div class="ml-featured__story"><div class="ml-featured__media"><img src="${esc(item.image)}" alt="" loading="lazy" width="1600" height="1000"></div><div class="ml-featured__copy"><h3>${emphasize(item.title, item.titleEmphasis)}</h3><p>${emphasize(item.description, item.descriptionEmphasis)}</p><a class="ml-button ml-button--secondary" href="${esc(item.href)}">Ver productos</a></div></div>${lineContentTemplate(item)}</article>`;
  }

  function renderSections() {
    const container = root.querySelector("[data-home-sections]");
    container.innerHTML = Object.entries(config.tabs).map(([key, data]) => {
      const hasCarousel = data.categories.length > 4;
      const cards = data.categories.map(categoryTemplate).join("");
      const categories = hasCarousel
        ? `<div class="ml-category-carousel ml-shell"><button type="button" class="ml-category-arrow ml-category-arrow--prev" data-category-direction="prev" aria-label="Ver categorías anteriores"><span aria-hidden="true">←</span></button><div class="ml-categories ml-categories--scroll">${cards}</div><button type="button" class="ml-category-arrow ml-category-arrow--next" data-category-direction="next" aria-label="Ver más categorías"><span aria-hidden="true">→</span></button></div>`
        : `<div class="ml-categories ml-shell">${cards}</div>`;
      const subtitle = data.subtitle ? `<p class="ml-panel__subtitle">${esc(data.subtitle)}</p>` : "";
      const cta = data.cta
        ? `<a class="ml-button ml-button--primary ml-panel__cta" href="${esc(data.cta.href)}">${esc(data.cta.label)}</a>`
        : "";
      return `<section class="ml-home-section" data-section="${esc(key)}" aria-labelledby="ml-section-${esc(key)}"><div class="ml-categories-zone"><div class="ml-panel__intro ml-shell"><div class="ml-panel__heading"><div><h4 id="ml-section-${esc(key)}">${esc(data.title)}</h4>${subtitle}</div>${cta}</div></div>${categories}</div><div class="ml-featured-list">${data.featuredLines.map(lineTemplate).join("")}</div></section>`;
    }).join("");
  }

  function initCategoryCarousels() {
    root.querySelectorAll(".ml-category-carousel").forEach(carousel => {
      const track = carousel.querySelector(".ml-categories--scroll");
      carousel.querySelectorAll("[data-category-direction]").forEach(button => button.addEventListener("click", () => {
        const card = track.querySelector(".ml-category-card");
        const gap = parseFloat(getComputedStyle(track).gap) || 0;
        const amount = (card?.getBoundingClientRect().width || track.clientWidth) + gap;
        track.scrollBy({
          left: button.dataset.categoryDirection === "next" ? amount : -amount,
          behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
        });
      }));
    });
  }

  function initLineBackgrounds() {
    root.querySelectorAll(".ml-featured-list").forEach(list => {
      const lines = [...list.querySelectorAll(".ml-featured[data-theme]")];
      if (!lines.length) return;

      const setBackground = line => {
        list.style.setProperty("--ml-panel-theme", line.dataset.theme);
      };
      setBackground(lines[0]);

      if (!("IntersectionObserver" in window)) return;
      const observer = new IntersectionObserver(entries => {
        const active = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (active) setBackground(active.target);
      }, {
        rootMargin: "-38% 0px -38% 0px",
        threshold: [0, .25, .5, .75, 1]
      });
      lines.forEach(line => observer.observe(line));
    });
  }

  function renderCommon() {
    root.querySelector("[data-news]").innerHTML = config.news.map(item => `<a class="ml-news-card" href="${esc(item.href)}"><img class="ml-news-card__image" src="${esc(item.image)}" alt="" loading="lazy" width="700" height="560"><h3>${esc(item.title)}</h3><p>${esc(item.description)}</p></a>`).join("");
    root.querySelector("[data-faq]").innerHTML = config.faq.map((item, index) => `<div class="ml-faq__item"><button class="ml-faq__trigger" type="button" aria-expanded="false" aria-controls="ml-faq-answer-${index}"><span>${esc(item.question)}</span><span class="ml-faq__icon" aria-hidden="true">＋</span></button><div class="ml-faq__answer" id="ml-faq-answer-${index}"><div><p>${esc(item.answer)}</p></div></div></div>`).join("");
    root.querySelectorAll(".ml-faq__trigger").forEach(button => button.addEventListener("click", () => {
      button.setAttribute("aria-expanded", String(button.getAttribute("aria-expanded") !== "true"));
    }));
  }

  function handleVideo() {
    const video = root.querySelector(".ml-hero__video");
    if (!video) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.pause();
      video.hidden = true;
      return;
    }
    video.play().catch(() => { video.hidden = true; });
  }

  function animateHeroTitle() {
    const title = root.querySelector("#ml-hero-title");
    if (!title || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const text = title.textContent.trim();
    title.setAttribute("aria-label", text);
    title.textContent = "";
    let letterIndex = 0;
    text.split(/(\s+)/).forEach(part => {
      if (/^\s+$/.test(part)) {
        title.appendChild(document.createTextNode(" "));
        return;
      }

      const word = document.createElement("span");
      word.className = "ml-hero__word";
      word.setAttribute("aria-hidden", "true");
      [...part].forEach(character => {
        const letter = document.createElement("span");
        letter.className = "ml-hero__letter";
        letter.style.setProperty("--letter-delay", `${letterIndex * 28}ms`);
        letter.textContent = character;
        word.appendChild(letter);
        letterIndex += 1;
      });
      title.appendChild(word);
    });
    requestAnimationFrame(() => title.classList.add("is-illuminating"));
  }

  renderSections();
  initCategoryCarousels();
  initLineBackgrounds();
  renderCommon();
  window.MacroledProducts.init(root);
  window.MacroledFeatured.init(root);
  window.MacroledProjectLines.init(root);
  handleVideo();
  animateHeroTitle();
})(window);

