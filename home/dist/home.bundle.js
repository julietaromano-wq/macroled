/* Generated file. Edit the sources in home/js and run npm run build. */

/* Source: home/js/config.js */
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
      { ...category("Lámparas", "lamparas"), image: "https://s3.coresagroup.com/MACROLED/1000/7428325565203a.png" },
      { ...category("Artefactos para lámparas", "artefactos-para-lamparas"), image: "https://s3.coresagroup.com/MACROLED/1000/7428325574748a.png" },
      { ...category("Interruptores y tomas", "interruptores-y-tomas"), image: "https://d1zltvqju4u8ql.cloudfront.net/fit-in/2000x2000/MACROLED/WEB/LIMA-1CN-USB-CC-30W-B_FRONT.webp" },
      { ...category("Tiras LED", "tiras-led"), image: "https://s3.coresagroup.com/MACROLED/1000/0742832556316a.png", badge: "Nuevo" }
    ],
    monaco: [
      { ...category("Armadas", "monaco-armadas"), image: "https://s3.coresagroup.com/MACROLED/250/milan.png" },
      { ...category("Bastidor + Módulos", "monaco-bastidor-modulos"), image: "https://s3.coresagroup.com/MACROLED/250/milan-bastidores.png" },
      { ...category("Tapas", "monaco-tapas"), image: "https://s3.coresagroup.com/MACROLED/250/milan-tapas.png" },
      { ...category("Luz de pasillo", "monaco-luz-pasillo"), image: "https://d1zltvqju4u8ql.cloudfront.net/fit-in/2000x2000/MACROLED/WEB/portada_luz_pasillo.webp" }
    ],
    exterior: [
      { ...category("Reflectores", "reflectores"), image: "https://d1zltvqju4u8ql.cloudfront.net/fit-in/2000x2000/MACROLED/WEB/PFL-400W-060D-857-CW_PERS.webp" },
      { ...category("Solar", "solar"), image: "https://s3.coresagroup.com/MACROLED/1000/7428325578388a.png" },
      { ...category("Tortugas", "tortugas"), image: "https://s3.coresagroup.com/MACROLED/1000/7428325571648a.png" },
      { ...category("Estacas", "estacas"), image: "https://s3.coresagroup.com/MACROLED/1000/7428325575684a.png" }
    ],
    proyectos: [
      { ...category("Luz de calle", "proyectos-01"), image: "https://d1zltvqju4u8ql.cloudfront.net/fit-in/1000x1000/MACROLED/WEB/SLG2-100W-757-CW_FRONT.webp", badge: "Nuevo" },
      { ...category("Lumax", "proyectos-02"), image: "https://s3.coresagroup.com/MACROLED/250/lumax.png", badge: "Nuevo" },
      { ...category("Highbay Classic", "proyectos-03"), image: "https://s3.coresagroup.com/MACROLED/250/galponeras-eco.webp" },
      { ...category("Highbay Pro", "proyectos-04"), image: "https://s3.coresagroup.com/MACROLED/250/PHB-200W-90D-857-CW.png" }
    ].map((item) => ({
      ...item,
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
          {
            ...line("Reflectores PRO", "La combinación ideal entre rendimiento y practicidad. Reflectores para exterior pensados para iluminar accesos, fachadas, patios y áreas abiertas con una instalación versátil y una luz confiable.", "#16283a", "#e4ebf0", "image-right"),
            image: "https://cdn.prod.website-files.com/65f1fdd7248b6709fdebe904/699cb28af6cdd53e774759f0_FAMILIA%20REFLECTORES%20PRO.webp",
            imageFit: "contain-right",
            titleEmphasis: "PRO"
          },
          {
            ...line("Luminarias Skyline", "Iluminación arquitectónica con rieles magnéticos de 48V que combinan seguridad, versatilidad y estética premium. Luminarias con opciones Smart de blancos dinámicos y automatización.", "#07090c", "#e4ebf0", "image-left"),
            image: "https://s3.coresagroup.com/MACROLED/250/skyline.png",
            imageFit: "contain-centered",
            visualTheme: "silver-dark",
            titleEmphasis: "Skyline",
            titleEmphasisWeight: 600,
            content: {
              mode: "typesense",
              query: {
                typesenseFilters: [
                  { field: "subfamilia", value: "Luminarias" },
                  { field: "familia", value: "Skyline" }
                ],
                productCount: 4
              }
            }
          }
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
    news: [
      {
        title: "Casa FOA 2026, Edición Pocito",
        description: "Formamos parte de uno de los eventos de diseño más reconocidos del país, aportando luminarias LED que realzan texturas, colores y ambientes en proyectos de alto nivel estético.",
        image: "https://www.casafoa.com/landing/wp-content/uploads/2026/04/Espacio-21-Casa-FOA-Juan-Cruz-Paredes-2.webp",
        hoverImage: "https://www.casafoa.com/landing/wp-content/uploads/2026/04/Espacio-17-Casa-FOA-Juan-Cruz-Paredes-4.webp"
      },
      {
        title: "Expo Construir",
        description: "Presentamos nuestros últimos lanzamientos: las líneas Mónaco, Lima, Macroled ARQ, Skyline, Kyo, Taö y Höshi, pensadas para proyectos arquitectónicos.",
        image: "https://s3.coresagroup.com/NUEVO_MACROLED/expo2.jpg",
        hoverImage: "https://s3.coresagroup.com/NUEVO_MACROLED/expo_hover.jpg",
        zoomDefaultImage: true
      },
      {
        title: "Biel Light 2025",
        description: "Durante cuatro días presentamos nuevas tecnologías, lanzamientos y demostraciones técnicas, con asesoramiento personalizado para distribuidores, instaladores y profesionales del sector.",
        image: "https://cdn.prod.website-files.com/690a24d6bf8e2592b2f29d1f/69bc53bc8148c948726225fa_691b4529bb6b28848a915f53_015.coresa-p-2600-p-2000.webp",
        hoverImage: "https://s3.coresagroup.com/NUEVO_MACROLED/biel_hover.jpg"
      }
    ],
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
        answer: "Sí. Nuestro equipo puede acompañarte en la elección de soluciones de iluminación para proyectos profesionales."
      },
      {
        question: "¿Puedo recibir asesoramiento antes de elegir un producto?",
        answer: "Sí. Contanos las características de tu espacio o proyecto y te ayudaremos a evaluar las alternativas disponibles."
      },
      {
        question: "¿Cómo puedo comparar distintas alternativas?",
        answer: "Podés revisar la información de cada producto y consultar a nuestro equipo para comparar prestaciones según tu necesidad."
      },
      {
        question: "¿Cómo me contacto con el equipo de Macroled?",
        answer: "Ingresá a la sección de contacto y dejanos los datos de tu consulta para que podamos orientarte."
      }
    ]
  };
})(window);

/* Source: home/js/products.js */
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
  const filterValue=value=>String(value??"").replace(/`/g,"\\`");
  const buildFilter=(field,value,filters)=>{
    if(Array.isArray(filters)&&filters.length) return filters.map(filter=>`${filter.field}:=\`${filterValue(filter.value)}\``).join(" && ");
    return `${field}:=\`${filterValue(value)}\``;
  };
  async function fetchProducts(field,value,count,filters){
    const cfg=window.MACROLED_HOME_CONFIG.typesense;
    if(!cfg.host||!cfg.apiKey||!cfg.collection) throw new Error("Configuración Typesense incompleta");
    const filterBy=buildFilter(field,value,filters);
    const key=[filterBy,count].join("|");if(cache.has(key)) return cache.get(key);
    const params=new URLSearchParams({q:"*",query_by:cfg.queryBy||"nombre,descripcion",filter_by:filterBy,per_page:String(count),page:"1"});
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
    const field=grid.dataset.productsField,value=grid.dataset.productsValue,configuredCount=Number(grid.dataset.productsCount||4);
    const count=matchMedia("(max-width: 640px), (min-width: 1601px)").matches?Math.max(configuredCount,5):configuredCount;let filters=[];
    try{filters=JSON.parse(grid.dataset.productsFilters||"[]")}catch(_){filters=[]}
    grid.setAttribute("aria-busy","true");
    const label=filters.length?filters.map(filter=>filter.value).join(" / "):value;
    try{const data=await fetchProducts(field,value,count,filters);if(!data.hits?.length){grid.innerHTML=`<div class="ml-product-state">No hay productos para “${escapeHTML(label)}”.</div>`;return}grid.innerHTML=data.hits.map(hit=>cardTemplate(hit.document)).join("");wireCarousels(grid);const block=grid.closest(".ml-products-block");if(block)window.MacroledFeatured?.setupTrackControls(block,grid,{mobileOnly:true})}catch(error){console.error(`Macroled Home · Error consultando Typesense (${buildFilter(field,value,filters)})`,error);grid.innerHTML=`<div class="ml-product-state">No se pudieron cargar los productos. Verificá la configuración de Typesense y que “${escapeHTML(label)}” exista.</div>`}finally{grid.setAttribute("aria-busy","false")}
  }
  function init(root=document){root.querySelectorAll(".ml-product-grid:not([data-products-ready])").forEach(grid=>{grid.dataset.productsReady="true";renderGrid(grid)})}
  window.MacroledProducts={init,parseImages,mergeVariantValue,buildSpecs,cardTemplate,wireCarousels};
})(window);

/* Source: home/js/featured.js */
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
      query_by: cfg.queryBy || "nombre,descripcion",
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
    const mobile = matchMedia("(max-width: 640px)");
    if (!controls || !progressBar || !progress || !prev || !next || !arrows) return;

    const cards = [...track.querySelectorAll(".ml-product-card")];

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
      track.classList.add("is-dragging");
      track.setPointerCapture(event.pointerId);
    };
    track.onpointermove = event => {
      if (!track.hasPointerCapture(event.pointerId)) return;
      const distance = event.clientX - dragStartX;
      if (Math.abs(distance) > 4) dragged = true;
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

/* Source: home/js/project-lines-concept.js */
(function (window) {
  "use strict";

  const LINES = [
    {
      id: "street",
      title: "Luz de calle Standard",
      subtitle: "Para proyectos, vías, parques y espacios públicos.",
      badge: "Nueva línea",
      productImage: "https://s3.coresagroup.com/MACROLED/1000/7428325578647a.png",
      ambientImage: "https://s3.coresagroup.com/NUEVO_MACROLED/street_ambient.png",
      href: "#ml-section-proyectos"
    },
    {
      id: "invictus",
      title: "Invictus",
      subtitle: "Para grandes áreas, fachadas y espacios deportivos.",
      productImage: "https://s3.coresagroup.com/MACROLED/1000/INVICTUS-1500W-10D-857.png",
      ambientImage: "https://s3.coresagroup.com/NUEVO_MACROLED/invictus_ambient.png",
      href: "#ml-section-proyectos"
    },
    {
      id: "highbay",
      title: "Highbay PRO",
      subtitle: "Para naves industriales y espacios de gran altura.",
      productImage: "https://d1zltvqju4u8ql.cloudfront.net/fit-in/1000x1000/MACROLED/WEB/PHB-100W-90D-857-CW_FRONT.webp",
      ambientImage: "https://s3.coresagroup.com.s3/NUEVO_MACROLED/highbay_ambient.png",
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
          ${item.badge ? `<span class="ml-highlight-badge ml-project-lines-concept__badge">${esc(item.badge)}</span>` : ""}
        </div>
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

/* Source: home/js/home.js */
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
    const badge = item.badge ? `<span class="ml-highlight-badge ml-category-card__badge">${esc(item.badge)}</span>` : "";
    return `<a class="ml-category-card" href="${esc(item.href)}" data-editorial-id="${esc(item.id)}"><h3>${esc(item.title)}</h3>${badge}<div class="ml-category-card__media"><img src="${esc(item.image)}" alt="" loading="lazy" width="800" height="800"></div></a>`;
  }

  function productControlsTemplate() {
    return `<div class="ml-featured-products__controls ml-product-grid__controls" data-product-controls hidden><div class="ml-featured-products__arrows"><button class="ml-featured-products__nav" type="button" data-featured-prev aria-label="Producto anterior"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m6-6-6 6 6 6"/></svg></button><button class="ml-featured-products__nav" type="button" data-featured-next aria-label="Producto siguiente"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></button></div><div class="ml-featured-products__progress" aria-hidden="true"><span data-featured-progress></span></div></div>`;
  }

  function lineContentTemplate(item) {
    const content = item.content || {};

    if (content.mode === "static") {
      const categories = config.manualCategories?.[content.categoryGroup] || content.items || [];
      return `<div class="ml-line-content ml-line-content--static"><div class="ml-categories ml-line-subfamilies">${categories.map(categoryTemplate).join("")}</div></div>`;
    }

    const query = content.query || item;
    const filters = Array.isArray(query.typesenseFilters) ? JSON.stringify(query.typesenseFilters) : "";
    return `<div class="ml-products-block"><div class="ml-product-grid" data-products-field="${esc(query.typesenseField)}" data-products-value="${esc(query.typesenseValue)}" data-products-filters="${esc(filters)}" data-products-count="${Number(query.productCount || 4)}"><div class="ml-product-state">Cargando productos…</div></div>${productControlsTemplate()}</div>`;
  }

  function lineTemplate(item) {
    const mode = item.content?.mode || "typesense";
    return `<article class="ml-featured ml-shell" data-theme="${esc(item.theme)}" data-visual-theme="${esc(item.visualTheme || "solid")}" data-layout="${esc(item.layout)}" data-image-fit="${esc(item.imageFit || "cover")}" data-description-lines="${Number(item.descriptionLines || 0)}" data-button-tone="${buttonTone(item.textColor)}" data-content-mode="${esc(mode)}" style="--line-bg:${esc(item.theme)};--line-color:${esc(item.textColor)};--title-emphasis-weight:${Number(item.titleEmphasisWeight || 600)}"><div class="ml-featured__story"><div class="ml-featured__media"><img src="${esc(item.image)}" alt="" loading="lazy" width="1600" height="1000"></div><div class="ml-featured__copy"><h3>${emphasize(item.title, item.titleEmphasis)}</h3><p>${emphasize(item.description, item.descriptionEmphasis)}</p><div class="ml-featured__actions"><a class="ml-button ml-button--primary" href="${esc(item.href)}">Ver productos</a><a class="ml-button--tertiary" href="${esc(item.catalogHref || "#")}">Ver catálogo <span aria-hidden="true">→</span></a></div></div></div>${lineContentTemplate(item)}</article>`;
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
      let activeBackground = "";
      let activeLayer = null;

      const setBackground = line => {
        const background = !line
          ? "#fff"
          : line.dataset.visualTheme === "silver-dark"
          ? "radial-gradient(circle at 16% 12%, rgba(214, 220, 226, 0.24), transparent 34%), linear-gradient(125deg, #030405 0%, #101318 56%, #3d444b 100%)"
          : line.dataset.theme;
        if (background === activeBackground) return;
        activeBackground = background;
        const previousLayer = activeLayer;
        const layer = document.createElement("div");
        layer.className = "ml-line-theme-layer";
        layer.setAttribute("aria-hidden", "true");
        layer.style.setProperty("--ml-layer-background", background);
        list.prepend(layer);
        activeLayer = layer;
        requestAnimationFrame(() => {
          layer.classList.add("is-visible");
          previousLayer?.classList.remove("is-visible");
        });
        if (previousLayer) {
          const removePrevious = () => previousLayer.remove();
          previousLayer.addEventListener("transitionend", removePrevious, { once: true });
          setTimeout(removePrevious, 2900);
        }
        const theme = line?.dataset.theme || "#fff";
        list.style.setProperty("--ml-panel-theme", theme);
        list.style.setProperty("--ml-panel-background", background);
        section?.style.setProperty("--ml-section-theme", theme);
        section?.style.setProperty("--ml-section-background", background);
      };
      /* Start with Monaco's theme so the categories gradient and the first
         editorial line meet on the exact same surface color. */
      setBackground(lines[0]);

      if (!("IntersectionObserver" in window)) return;
      const sectionObserver = new IntersectionObserver(entries => {
        section?.classList.toggle("is-line-theme-active", entries[0]?.isIntersecting === true);
      }, {
        rootMargin: "-35% 0px -35% 0px",
        threshold: 0
      });
      sectionObserver.observe(list);

      let scrollFrame = 0;
      const updateStoryIntegration = () => {
        scrollFrame = 0;
        const viewportBottom = window.innerHeight || document.documentElement.clientHeight;
        let integratedLine = lines[0];
        lines.forEach(line => {
          const story = line.querySelector(".ml-featured__story");
          if (!story) return;
          const bounds = story.getBoundingClientRect();
          const visibleProgress = Math.min(
            1,
            Math.max(0, (viewportBottom - bounds.top) / Math.max(bounds.height, 1))
          );
          const isIntegrated = visibleProgress >= 0.06;
          line.classList.toggle("is-story-integrated", isIntegrated);
          if (isIntegrated) integratedLine = line;
        });
        setBackground(integratedLine);
      };
      const requestStoryUpdate = () => {
        if (!scrollFrame) scrollFrame = requestAnimationFrame(updateStoryIntegration);
      };
      window.addEventListener("scroll", requestStoryUpdate, { passive: true });
      window.addEventListener("resize", requestStoryUpdate);
      updateStoryIntegration();
    });
  }

  function renderCommon() {
    root.querySelector("[data-news]").innerHTML = config.news.map(item => {
      const tag = item.href ? "a" : "article";
      const href = item.href ? ` href="${esc(item.href)}"` : "";
      const hoverImage = item.hoverImage || item.image;
      const defaultImageClass = item.zoomDefaultImage ? " ml-news-card__image--zoomed" : "";
      return `<${tag} class="ml-news-card"${href}><div class="ml-news-card__media"><img class="ml-news-card__image ml-news-card__image--default${defaultImageClass}" src="${esc(item.image)}" alt="${esc(item.title)}" loading="lazy" width="700" height="560"><img class="ml-news-card__image ml-news-card__image--hover" src="${esc(hoverImage)}" alt="" aria-hidden="true" loading="lazy" width="700" height="560"></div><h3>${esc(item.title)}</h3><p>${esc(item.description)}</p></${tag}>`;
    }).join("");
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

  function animateCategoriesTitle() {
    const title = root.querySelector("#ml-categories-test-title");
    if (!title || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const text = title.textContent.trim();
    title.setAttribute("aria-label", text);
    title.textContent = "";
    let letterIndex = 0;
    const letterCount = [...text.replace(/\s/g, "")].length;

    text.split(/(\s+)/).forEach(part => {
      if (/^\s+$/.test(part)) {
        title.appendChild(document.createTextNode(" "));
        return;
      }

      const word = document.createElement("span");
      word.className = "ml-categories-title__word";
      word.setAttribute("aria-hidden", "true");
      [...part].forEach(character => {
        const letter = document.createElement("span");
        letter.className = "ml-categories-title__letter";
        letter.style.setProperty("--letter-delay", `${letterIndex * 24}ms`);
        const progress = letterCount > 1
          ? Math.round((letterIndex / (letterCount - 1)) * 100)
          : 100;
        letter.style.setProperty(
          "--letter-color",
          `color-mix(in srgb, var(--ml-light-blue-500) ${100 - progress}%, var(--ml-dark-blue-700) ${progress}%)`
        );
        letter.textContent = character;
        word.appendChild(letter);
        letterIndex += 1;
      });
      title.appendChild(word);
    });

    const illuminate = () => title.classList.add("is-illuminating");
    if (!("IntersectionObserver" in window)) {
      requestAnimationFrame(illuminate);
      return;
    }

    const observer = new IntersectionObserver(entries => {
      if (!entries[0]?.isIntersecting) return;
      illuminate();
      observer.disconnect();
    }, { threshold: 0.35, rootMargin: "0px 0px -8% 0px" });
    observer.observe(title);
  }

  function initSectionMotion() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const projectSection = root.querySelector("[data-project-lines-concept]");
    const featuredSection = root.querySelector("#productos-destacados");
    const categoriesSection = root.querySelector("[data-categories-test]");
    const foaSection = root.querySelector("[data-foa]");
    const newsletterBanner = root.querySelector(".ml-newsletter-banner");
    const featuredTrack = featuredSection?.querySelector("[data-featured-track]");
    const categoriesGrid = categoriesSection?.querySelector("[data-categories-test-grid]");
    const pendingSections = new Set();
    let motionArmed = false;

    const prepareCards = (container, selector) => {
      if (!container) return;
      [...container.querySelectorAll(selector)].forEach((card, index) => {
        card.style.setProperty("--motion-order", index);
      });
    };

    const reveal = section => {
      prepareCards(
        section,
        section === projectSection
          ? ".ml-project-lines-concept__card"
          : section === featuredSection
            ? ".ml-product-card"
            : section.matches(".ml-featured")
              ? section.dataset.contentMode === "static"
                ? ".ml-category-card"
                : ".ml-product-card"
              : ".ml-category-card"
      );
      clearTimeout(section._motionSettleTimer);
      section.classList.remove("is-motion-settled");
      requestAnimationFrame(() => {
        section.classList.add("is-motion-visible");
        section._motionSettleTimer = setTimeout(() => {
          section.classList.add("is-motion-settled");
        }, 1500);
      });
    };

    const revealPendingSections = () => {
      if (!motionArmed) return;
      pendingSections.forEach(section => reveal(section));
      pendingSections.clear();
    };

    const armMotion = () => {
      if (motionArmed) return;
      motionArmed = true;
      revealPendingSections();
    };

    window.addEventListener("wheel", armMotion, { passive: true, once: true });
    window.addEventListener("touchmove", armMotion, { passive: true, once: true });
    window.addEventListener("keydown", event => {
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) {
        armMotion();
      }
    });

    [projectSection, featuredSection, categoriesSection, foaSection, newsletterBanner].forEach(section => {
      if (!section) return;
      section.classList.add("ml-motion-ready");
      const observer = new IntersectionObserver(entries => {
        if (!entries[0]?.isIntersecting) return;
        if (motionArmed) reveal(section);
        else pendingSections.add(section);
        observer.disconnect();
      }, { threshold: 0.13, rootMargin: "0px 0px -8% 0px" });
      observer.observe(section);
    });

    root.querySelectorAll(".ml-featured[data-content-mode]").forEach(line => {
      const cardSelector = line.dataset.contentMode === "static"
        ? ".ml-category-card"
        : ".ml-product-card";
      const content = line.querySelector(
        line.dataset.contentMode === "static"
          ? ".ml-line-content--static"
          : ".ml-product-grid"
      );
      line.classList.add("ml-content-motion-ready");
      prepareCards(line, cardSelector);

      const observer = new IntersectionObserver(entries => {
        if (!entries[0]?.isIntersecting) return;
        if (motionArmed) reveal(line);
        else pendingSections.add(line);
        observer.disconnect();
      }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
      observer.observe(line);

      if (content) {
        new MutationObserver(() => {
          prepareCards(line, cardSelector);
          if (!line.classList.contains("is-motion-visible")) return;
          line.classList.remove("is-motion-visible");
          requestAnimationFrame(() => requestAnimationFrame(() => line.classList.add("is-motion-visible")));
        }).observe(content, { childList: true });
      }
    });

    const refreshDynamicCards = (section, container, selector) => {
      if (!section || !container) return;
      new MutationObserver(() => {
        prepareCards(container, selector);
        if (!section.classList.contains("is-motion-visible")) return;
        clearTimeout(container._cardsMotionTimer);
        container.classList.remove("is-cards-visible");
        container.classList.add("is-cards-refreshing");
        requestAnimationFrame(() => requestAnimationFrame(() => {
          container.classList.add("is-cards-visible");
          container._cardsMotionTimer = setTimeout(() => {
            container.classList.remove("is-cards-refreshing", "is-cards-visible");
          }, 1000);
        }));
      }).observe(container, { childList: true });
    };

    refreshDynamicCards(featuredSection, featuredTrack, ".ml-product-card");
    refreshDynamicCards(categoriesSection, categoriesGrid, ".ml-category-card");
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
  animateCategoriesTitle();
  initSectionMotion();
})(window);

