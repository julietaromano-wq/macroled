/* Macroled Home · archivo generado. Editar fuentes en /js y regenerar. */
(function (window) {
  "use strict";
  const PLACEHOLDER = "assets/images/editorial-placeholder.svg";
  const g9 = { typesenseField: "subfamilia", typesenseValue: "G9", productCount: 4 };
  const category = (title, id) => ({ title, image: PLACEHOLDER, href: "#", id });
  const line = (title, description, theme, textColor, layout) => ({ title, description, image: PLACEHOLDER, href: "#", theme, textColor, layout, ...g9 });

  window.MACROLED_HOME_CONFIG = {
    assets: { placeholder: PLACEHOLDER },
    typesense: {
      host: "https://typesense.coresagroup.com",
      apiKey: "g0oiNYY8THGuU9jnCsvqIH1X9HtvYRCR",
      collection: "Macroled_Prueba",
      queryBy: "nombre,descripcion"
    },
    tabs: {
      interior: {
        title: "Luz para habitar cada espacio",
        subtitle: "Iluminación interior para crear ambientes cálidos, funcionales y únicos.",
        categories: [
          { ...category("Lámparas", "lamparas"), image: "https://s3.coresagroup.com/MACROLED/250/smartnew.png" },
          { ...category("Interruptores y tomas", "interruptores-y-tomas"), image: "https://s3.coresagroup.com/MACROLED/250/lima.webp" },
          { ...category("Tiras LED", "tiras-led"), image: "https://s3.coresagroup.com/MACROLED/250/smd5050a.png" },
          { ...category("Paneles", "paneles"), image: "https://s3.coresagroup.com/MACROLED/250/7428325570818a.png" },
          category("Sensores", "sensores"),
          category("Artefactos para lámparas", "artefactos-para-lamparas")
        ],
        featuredLines: [
          { ...line("Línea Monaco", "Módulos y tomas diseñados con un enfoque en estética, funcionalidad y seguridad. Incluye una amplia variedad de armadas con diferentes combinaciones de puntos, USB-C, dimmers y conectores multimedia", "#e9ecef", "#101820", "image-left"), titleEmphasis: "Monaco", descriptionEmphasis: "armadas" },
          line("Línea interior 02", "Una composición amplia preparada para presentar la familia.", "#16283a", "#ffffff", "image-right"),
          line("Línea interior 03", "Contenido comercial configurable desde un único archivo.", "#dbe8e5", "#101820", "image-full")
        ]
      },
      exterior: {
        title: "El espacio continúa afuera",
        subtitle: "Iluminación exterior pensada para acompañar cada espacio al aire libre.",
        categories: [
          category("Reflectores", "reflectores"),
          category("Solar", "solar"),
          category("Tortugas", "tortugas"),
          category("Estacas", "estacas")
        ],
        featuredLines: [
          line("Línea exterior 01", "Nombre, imagen y descripción editorial pendientes.", "#d7e0d1", "#102016", "image-right"),
          line("Línea exterior 02", "Preparada para una fotografía de ambiente de gran formato.", "#1b312c", "#ffffff", "image-left"),
          line("Línea exterior 03", "La configuración permite cambiar el universo visual sin reprogramar.", "#e8dfcf", "#1c1812", "image-full")
        ]
      },
      proyectos: {
        title: "Rendimiento a gran escala",
        subtitle: "Productos para proyectos lumínicos que exigen potencia, eficiencia y precisión.",
        categories: ["Highbay Pro", "Luz de calle Standard", "Lumax", "Solar"].map((title, i) => ({ ...category(title, `proyectos-0${i + 1}`), subtitle: "Proyecto lumínico" })),
        featuredLines: [
          line("Highbay Pro", "Potencia y control para espacios de gran altura. Texto final pendiente.", "#00152b", "#ffffff", "image-left"),
          line("Olimpus", "Presentación editorial de línea. Imagen y descripción definitivas pendientes.", "#c9d5dc", "#07141e", "image-right"),
          line("Titan", "Bloque preparado para comunicar prestaciones y aplicaciones.", "#3b4449", "#ffffff", "image-full"),
          line("Invictus", "La consulta de producto es temporalmente G9, como en todo el prototipo.", "#d9c8aa", "#1a1610", "image-left")
        ]
      }
    },
    news: [1, 2, 3].map(n => ({ title: `Novedad editorial 0${n}`, description: "Título, imagen, descripción y vínculo configurables.", image: PLACEHOLDER, href: "#" })),
    faq: [
      { question: "¿Cómo elijo la iluminación adecuada?", answer: "Respuesta definitiva pendiente. El equipo de Macroled puede asesorarte según el uso, las dimensiones y la atmósfera buscada." },
      { question: "¿Dónde encuentro la información técnica?", answer: "Las fichas de los productos disponibles enlazan a su ficha web. También se podrá incorporar un acceso a descargas." },
      { question: "¿Macroled trabaja con proyectos profesionales?", answer: "Sí. Esta respuesta es un placeholder editorial y debe validarse antes de publicar." }
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
  window.MacroledProducts={init,parseImages,mergeVariantValue,buildSpecs,cardTemplate};
})(window);

(function(window){"use strict";
  function quickScrollTo(top){if(matchMedia('(prefers-reduced-motion: reduce)').matches){window.scrollTo(0,top);return}const start=window.scrollY,distance=top-start;if(Math.abs(distance)<2)return;const duration=320,started=performance.now();const tick=now=>{const progress=Math.min((now-started)/duration,1),eased=1-Math.pow(1-progress,3);window.scrollTo(0,start+distance*eased);if(progress<1)requestAnimationFrame(tick)};requestAnimationFrame(tick)}
  function init(root){const tabs=[...root.querySelectorAll('[role="tab"]')],panels=[...root.querySelectorAll('[role="tabpanel"]')],explore=root.querySelector(".ml-explore");
    function activate(tab,{focus=false,scroll=false}={}){tabs.forEach(item=>{const active=item===tab;item.setAttribute("aria-selected",String(active));item.tabIndex=active?0:-1});panels.forEach(panel=>{panel.hidden=panel.dataset.panel!==tab.dataset.tab});window.MacroledHome?.activatePanel(tab.dataset.tab);if(focus)tab.focus({preventScroll:true});if(scroll)quickScrollTo(explore.getBoundingClientRect().top+window.scrollY)}
    tabs.forEach((tab,index)=>{tab.addEventListener("click",()=>activate(tab,{scroll:true}));tab.addEventListener("keydown",event=>{let next;if(event.key==="ArrowRight")next=(index+1)%tabs.length;if(event.key==="ArrowLeft")next=(index-1+tabs.length)%tabs.length;if(event.key==="Home")next=0;if(event.key==="End")next=tabs.length-1;if(next!==undefined){event.preventDefault();activate(tabs[next],{focus:true,scroll:true})}})});activate(tabs.find(tab=>tab.getAttribute("aria-selected")==="true")||tabs[0])}
  window.MacroledTabs={init};
})(window);

(function(window){"use strict";
  const config=window.MACROLED_HOME_CONFIG,root=document.getElementById("macroled-home");if(!config||!root)return;
  const esc=value=>String(value??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
  const emphasize=(value,term)=>{const safe=esc(value);if(!term)return safe;const safeTerm=esc(term);return safe.replace(safeTerm,`<strong>${safeTerm}</strong>`)};
  function categoryTemplate(item){return `<a class="ml-category-card" href="${esc(item.href)}" data-editorial-id="${esc(item.id)}"><div class="ml-category-card__media"><img src="${esc(item.image)}" alt="" loading="lazy" width="800" height="800"></div><h3>${esc(item.title)}</h3></a>`}
  function lineTemplate(item){return `<article class="ml-featured ml-shell" data-theme="${esc(item.theme)}" data-layout="${esc(item.layout)}" style="--line-bg:${esc(item.theme)};--line-color:${esc(item.textColor)}"><div class="ml-featured__story"><div class="ml-featured__media"><img src="${esc(item.image)}" alt="" loading="lazy" width="1600" height="1000"></div><div class="ml-featured__copy"><h3>${emphasize(item.title,item.titleEmphasis)}</h3><p>${emphasize(item.description,item.descriptionEmphasis)}</p><a class="ml-button ml-button--secondary" href="${esc(item.href)}">Ver productos</a></div></div><div class="ml-products-block"><div class="ml-product-grid" data-products-field="${esc(item.typesenseField)}" data-products-value="${esc(item.typesenseValue)}" data-products-count="${Number(item.productCount)}"><div class="ml-product-state">Cargando productos…</div></div></div></article>`}
  function renderPanels(){Object.entries(config.tabs).forEach(([key,data])=>{const panel=root.querySelector(`[data-panel="${key}"]`),hasCarousel=data.categories.length>4,cards=data.categories.map(categoryTemplate).join("");panel.innerHTML=`<div class="ml-categories-zone"><div class="ml-panel__intro ml-shell"><h2>${esc(data.title)}</h2><p class="ml-panel__subtitle">${esc(data.subtitle)}</p></div>${hasCarousel?`<div class="ml-category-carousel ml-shell"><button type="button" class="ml-category-arrow ml-category-arrow--prev" data-category-direction="prev" aria-label="Ver categorías anteriores"><span aria-hidden="true">←</span></button><div class="ml-categories ml-categories--scroll">${cards}</div><button type="button" class="ml-category-arrow ml-category-arrow--next" data-category-direction="next" aria-label="Ver más categorías"><span aria-hidden="true">→</span></button></div>`:`<div class="ml-categories ml-shell">${cards}</div>`}</div><div class="ml-featured-list">${data.featuredLines.map(lineTemplate).join("")}</div>`})}
  function initCategoryCarousels(){root.querySelectorAll(".ml-category-carousel").forEach(carousel=>{const track=carousel.querySelector(".ml-categories--scroll");carousel.querySelectorAll("[data-category-direction]").forEach(button=>button.addEventListener("click",()=>{const card=track.querySelector(".ml-category-card"),gap=parseFloat(getComputedStyle(track).gap)||0,amount=(card?.getBoundingClientRect().width||track.clientWidth)+gap;track.scrollBy({left:button.dataset.categoryDirection==="next"?amount:-amount,behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"})}))})}
  function renderCommon(){root.querySelector("[data-news]").innerHTML=config.news.map(item=>`<a class="ml-news-card" href="${esc(item.href)}"><img class="ml-news-card__image" src="${esc(item.image)}" alt="" loading="lazy" width="700" height="560"><h3>${esc(item.title)}</h3><p>${esc(item.description)}</p></a>`).join("");root.querySelector("[data-faq]").innerHTML=config.faq.map((item,index)=>`<div class="ml-faq__item"><button class="ml-faq__trigger" type="button" aria-expanded="false" aria-controls="ml-faq-answer-${index}"><span>${esc(item.question)}</span><span class="ml-faq__icon" aria-hidden="true">＋</span></button><div class="ml-faq__answer" id="ml-faq-answer-${index}"><div><p>${esc(item.answer)}</p></div></div></div>`).join("");root.querySelectorAll(".ml-faq__trigger").forEach(button=>button.addEventListener("click",()=>button.setAttribute("aria-expanded",String(button.getAttribute("aria-expanded")!=="true"))))}
  let observer;function observeThemes(panel){observer?.disconnect();const stage=root.querySelector(".ml-tab-stage"),lines=[...panel.querySelectorAll(".ml-featured")];observer=new IntersectionObserver(entries=>{const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(visible)stage.style.setProperty("--ml-panel-theme",visible.target.dataset.theme)},{rootMargin:"-25% 0px -45%",threshold:[0,.25,.5,.75]});lines.forEach(line=>observer.observe(line))}
  function activatePanel(key){const panel=root.querySelector(`[data-panel="${key}"]`);if(!panel)return;window.MacroledProducts.init(panel);observeThemes(panel)}
  function handleVideo(){const video=root.querySelector(".ml-hero__video");if(!video)return;if(matchMedia('(prefers-reduced-motion: reduce)').matches){video.pause();video.hidden=true;return}video.play().catch(()=>{video.hidden=true})}
  function animateHeroTitle(){const title=root.querySelector("#ml-hero-title");if(!title||matchMedia("(prefers-reduced-motion: reduce)").matches)return;const text=title.textContent.trim();title.setAttribute("aria-label",text);title.textContent="";[...text].forEach((character,index)=>{const span=document.createElement("span");span.className="ml-hero__letter";span.setAttribute("aria-hidden","true");span.style.setProperty("--letter-delay",`${index*28}ms`);span.textContent=character===" "?"\u00a0":character;title.appendChild(span)});requestAnimationFrame(()=>title.classList.add("is-illuminating"))}
  renderPanels();initCategoryCarousels();renderCommon();window.MacroledHome={activatePanel};window.MacroledTabs.init(root);handleVideo();animateHeroTitle();
})(window);

