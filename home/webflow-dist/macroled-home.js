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
    monaco: [
      { ...category("Armadas", "monaco-armadas"), image: "https://s3.coresagroup.com/MACROLED/250/milan.png" },
      { ...category("Bastidor + Módulos", "monaco-bastidor-modulos"), image: "https://s3.coresagroup.com/MACROLED/250/milan-bastidores.png" },
      { ...category("Tapas", "monaco-tapas"), image: "https://s3.coresagroup.com/MACROLED/250/milan-tapas.png" },
      { ...category("Luz de pasillo", "monaco-luz-pasillo"), image: "https://d1zltvqju4u8ql.cloudfront.net/fit-in/2000x2000/MACROLED/WEB/portada_luz_pasillo.webp" }
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
            ...line("Línea Monaco", "Módulos y tomas diseñados con un enfoque en estética, funcionalidad y seguridad. Una propuesta versátil con armadas, conexiones y componentes pensados para adaptarse a instalaciones eléctricas contemporáneas.", "#e9ecef", "#101820", "image-left"),
            image: "https://cdn.prod.website-files.com/65f1fdd7248b6709fdebe904/69a977bb0fe12ec5b81b7e9b_monaco-cover%20copia.webp",
            imageFit: "contain",
            titleEmphasis: "Monaco",
            content: { mode: "static", categoryGroup: "monaco" }
          },
          line("Línea interior 02", "Una composición amplia preparada para presentar la familia.", "#16283a", "#ffffff", "image-right"),
          line("Línea interior 03", "Contenido comercial configurable desde un único archivo.", "#dbe8e5", "#101820", "image-full")
        ]
      }
    },
    categoriesTest: {
      interior: {
        labelActive: "Iluminación interior",
        labelInactive: "Interior",
        color: "#ffffff",
        textColor: "#00152b",
        categories: MANUAL_CATEGORIES.interior
      },
      exterior: {
        labelActive: "Iluminación exterior",
        labelInactive: "Exterior",
        color: "#ffffff",
        textColor: "#00152b",
        categories: MANUAL_CATEGORIES.exterior
      },
      proyectos: {
        labelActive: "Iluminación para proyectos",
        labelInactive: "Proyectos",
        color: "#ffffff",
        textColor: "#00152b",
        categories: MANUAL_CATEGORIES.proyectos
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
  const FEATURED_COUNT = 250;
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

  const buttonTone = color => {
    const hex = String(color || "").trim().replace(/^#/, "");
    if (!/^[\da-f]{3}$|^[\da-f]{6}$/i.test(hex)) return "dark";
    const normalized = hex.length === 3
      ? hex.split("").map(character => character + character).join("")
      : hex;
    const [red, green, blue] = [0, 2, 4].map(index => parseInt(normalized.slice(index, index + 2), 16));
    const luminance = (red * 0.299 + green * 0.587 + blue * 0.114) / 255;
    return luminance > 0.55 ? "light" : "dark";
  };

  function categoryTemplate(item) {
    return `<a class="ml-category-card" href="${esc(item.href)}" data-editorial-id="${esc(item.id)}"><h3>${esc(item.title)}</h3><div class="ml-category-card__media"><img src="${esc(item.image)}" alt="" loading="lazy" width="800" height="800"></div></a>`;
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
    return `<article class="ml-featured ml-shell" data-theme="${esc(item.theme)}" data-layout="${esc(item.layout)}" data-image-fit="${esc(item.imageFit || "cover")}" data-button-tone="${buttonTone(item.textColor)}" data-content-mode="${esc(mode)}" style="--line-bg:${esc(item.theme)};--line-color:${esc(item.textColor)}"><div class="ml-featured__story"><div class="ml-featured__media"><img src="${esc(item.image)}" alt="" loading="lazy" width="1600" height="1000"></div><div class="ml-featured__copy"><h3>${emphasize(item.title, item.titleEmphasis)}</h3><p>${emphasize(item.description, item.descriptionEmphasis)}</p><div class="ml-featured__actions"><a class="ml-button ml-button--primary" href="${esc(item.href)}">Ver productos</a><a class="ml-button--tertiary" href="${esc(item.catalogHref || "#")}">Ver catálogo <span aria-hidden="true">→</span></a></div></div></div>${lineContentTemplate(item)}</article>`;
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
      return `<section class="ml-home-section" data-section="${esc(key)}" aria-label="${esc(data.title)}"><div class="ml-featured-list">${data.featuredLines.map(lineTemplate).join("")}</div></section>`;
    }).join("");
  }

  function placeFeaturedProducts() {
    const featuredProducts = root.querySelector("#productos-destacados");
    const professionalLighting = root.querySelector("[data-project-lines-concept]");
    if (!featuredProducts || !professionalLighting) return;
    professionalLighting.insertAdjacentElement("afterend", featuredProducts);
  }

  function placePrimarySections() {
    const professionalLighting = root.querySelector("[data-project-lines-concept]");
    const categoriesTest = root.querySelector("[data-categories-test]");
    if (!professionalLighting || !categoriesTest) return;
    professionalLighting.insertAdjacentElement("afterend", categoriesTest);
  }

  function renderCategoriesTest() {
    const section = root.querySelector("[data-categories-test]");
    const tabs = section?.querySelector("[data-categories-test-tabs]");
    const grid = section?.querySelector("[data-categories-test-grid]");
    const entries = Object.entries(config.categoriesTest || {});
    if (!section || !tabs || !grid || !entries.length) return;

    grid.id = "ml-categories-test-panel";
    tabs.innerHTML = entries.map(([key, item], index) => `
      <button class="ml-categories-test__tab ml-featured-products__tab${index === 0 ? " is-active" : ""}"
        id="ml-categories-test-tab-${esc(key)}"
        type="button"
        role="tab"
        aria-controls="${grid.id}"
        aria-selected="${index === 0}"
        tabindex="${index === 0 ? "0" : "-1"}"
        data-categories-test-tab="${esc(key)}">${esc(index === 0 ? item.labelActive : item.labelInactive)}</button>
    `).join("");
    const activate = key => {
      const item = config.categoriesTest[key];
      if (!item) return;
      section.dataset.activeCategory = key;
      section.style.setProperty("--categories-test-color", item.color);
      section.style.setProperty("--categories-test-text", item.textColor);
      grid.innerHTML = item.categories.map(categoryTemplate).join("");
      grid.setAttribute("aria-labelledby", `ml-categories-test-tab-${key}`);
      tabs.querySelectorAll("[data-categories-test-tab]").forEach(button => {
        const active = button.dataset.categoriesTestTab === key;
        const buttonConfig = config.categoriesTest[button.dataset.categoriesTestTab];
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-selected", String(active));
        button.tabIndex = active ? 0 : -1;
        button.textContent = active ? buttonConfig.labelActive : buttonConfig.labelInactive;
      });
    };

    tabs.addEventListener("click", event => {
      const button = event.target.closest("[data-categories-test-tab]");
      if (button) activate(button.dataset.categoriesTestTab);
    });
    tabs.addEventListener("keydown", event => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      const buttons = [...tabs.querySelectorAll("[data-categories-test-tab]")];
      const current = buttons.indexOf(document.activeElement);
      if (current < 0) return;
      event.preventDefault();
      const next = event.key === "Home"
        ? 0
        : event.key === "End"
          ? buttons.length - 1
          : (current + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length;
      buttons[next].focus();
      activate(buttons[next].dataset.categoriesTestTab);
    });

    activate(entries[0][0]);
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
      const section = list.closest(".ml-home-section");

      const setBackground = line => {
        list.style.setProperty("--ml-panel-theme", line.dataset.theme);
        section?.style.setProperty("--ml-section-theme", line.dataset.theme);
      };
      setBackground(lines[0]);

      if (!("IntersectionObserver" in window)) return;
      const sectionObserver = new IntersectionObserver(entries => {
        section?.classList.toggle("is-line-theme-active", entries[0]?.isIntersecting === true);
      }, {
        rootMargin: "-35% 0px -35% 0px",
        threshold: 0
      });
      sectionObserver.observe(list);

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
  placePrimarySections();
  placeFeaturedProducts();
  renderCategoriesTest();
  initCategoryCarousels();
  initLineBackgrounds();
  renderCommon();
  window.MacroledProducts.init(root);
  window.MacroledFeatured.init(root);
  window.MacroledProjectLinesConcept.init(root);
  handleVideo();
  animateHeroTitle();
})(window);

