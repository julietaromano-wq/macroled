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
  function rawSpecs(doc){
    if(Array.isArray(doc.atributos)&&doc.atributos.length) return doc.atributos.map(a=>({label:a.nombre,value:mergeVariantValue(doc,a.nombre,a.valor)}));
    return [{label:doc.nombre_attr1,value:doc.attr_1},{label:doc.nombre_attr2,value:doc.attr_2},{label:doc.nombre_attr3,value:doc.attr_3}].filter(p=>p.label&&p.value).map(p=>({label:p.label,value:mergeVariantValue(doc,p.label,p.value)}));
  }
  const isTemperatureSpec=spec=>/temperatura|luz|kelvin|\bcct\b/i.test(String(spec.label||""))||/\b\d{4}\s*k\b/i.test(String(spec.value||""));
  const isSmartSpec=spec=>/^smart$/i.test(String(spec.value||"").trim())||/\bsmart\b/i.test(String(spec.label||""));
  const normalizedLabel=value=>String(value||"").trim().toLocaleLowerCase("es");
  function variantSpec(doc){
    const label=String(doc.nombre_attr_variantes||"").trim(),value=String(doc.attr_variantes||"").trim();
    return label&&value?{label,value}:null;
  }
  function buildSpecs(doc){
    const variant=variantSpec(doc),variantLabel=normalizedLabel(variant?.label);
    const specs=rawSpecs(doc).filter(spec=>normalizedLabel(spec.label)!==variantLabel&&!isTemperatureSpec(spec)&&!isSmartSpec(spec));
    if(variant&&!isTemperatureSpec(variant)&&!isSmartSpec(variant))specs.unshift(variant);
    return specs.slice(0,2);
  }
  function tempCategoryColor(value){const kelvin=parseInt(value,10);if(kelvin<=3000)return "#fff79b";if(kelvin<=4500)return "#d9d9d9";return "#bce4fa"}
  function buildTempBadge(doc){
    const candidates=[...rawSpecs(doc).filter(isTemperatureSpec).map(spec=>spec.value),doc.rango_temperatura,doc.temperatura_filtro];
    const variant=variantSpec(doc);if(variant&&isTemperatureSpec(variant))candidates.unshift(variant.value);
    const matches=candidates.flatMap(source=>String(source||"").match(/\d{4}\s*K/gi)||[]);
    const tones=[...new Set(matches.map(value=>value.replace(/\s+/g,"").toUpperCase()))].sort((a,b)=>parseInt(a,10)-parseInt(b,10));
    if(!tones.length)return "";
    const label=tones.length===1?tones[0]:`${tones[0]}–${tones[tones.length-1]}`;
    const colors=[...new Set(tones.map(tempCategoryColor))];
    const background=colors.length===1?colors[0]:`linear-gradient(to right, ${colors.map((color,index)=>{const step=100/colors.length;return `${color} ${index*step}%, ${color} ${(index+1)*step}%`}).join(", ")})`;
    return `<span class="ml-product-temp-badge">${escapeHTML(label)}<span class="ml-product-badge-dot${colors.length>1?" is-split":""}" style="background:${background}"></span></span>`;
  }
  function buildVariantBadge(doc){
    const configured=parseInt(doc.cant_variantes,10);
    const fieldCount=variantSpec(doc)?.value.split(";").map(value=>value.trim()).filter(Boolean).length||0;
    const skuCount=Array.isArray(doc.variantes_sku)?doc.variantes_sku.length:0;
    const count=configured>0?configured:Math.max(fieldCount,skuCount);
    return count>1?`<span class="ml-product-variant-badge">${count} variantes</span>`:"";
  }
  function buildSmartBadge(doc){
    const directSmart=doc.smart===true||doc.es_smart===true||[doc.smart,doc.es_smart].some(value=>/^(si|sí|true|1|smart)$/i.test(String(value||"").trim()));
    return directSmart||rawSpecs(doc).some(isSmartSpec)?'<span class="ml-product-smart-badge" aria-label="Producto Smart">SMART</span>':"";
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
    const attrs=specs.length?specs.map(spec=>`<div class="ml-product-attr"><span class="ml-product-attr__label">${escapeHTML(spec.label)}</span><span class="ml-product-attr__value">${escapeHTML(spec.value)}</span></div>`).join(""):`<span class="ml-product-card__note">Sin atributos cargados</span>`;
    const image=imgs.length?`<img src="${escapeHTML(imgs[0])}" alt="${escapeHTML(doc.nombre||"Producto Macroled")}" loading="lazy" width="400" height="400" data-images="${escapeHTML(JSON.stringify(imgs))}" data-index="0">`:`<span class="ml-product-card__note">Sin imagen</span>`;
    const nav=imgs.length>1?`<button type="button" class="ml-product-card__nav ml-product-card__nav--prev" aria-label="Imagen anterior">←</button><button type="button" class="ml-product-card__nav ml-product-card__nav--next" aria-label="Imagen siguiente">→</button>`:"";
    return `<${tag} class="ml-product-card${link?"":" ml-product-card--disabled"}"${link?` href="${escapeHTML(link)}"`:""} data-id="${escapeHTML(doc.id||doc.sku||"")}"><div class="ml-product-card__media">${buildSmartBadge(doc)}${buildVariantBadge(doc)}${buildTempBadge(doc)}${image}${nav}</div><div class="ml-product-card__title">${escapeHTML(doc.nombre||"Producto sin nombre")}</div><div class="ml-product-card__attrs">${attrs}</div></${tag}>`;
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
