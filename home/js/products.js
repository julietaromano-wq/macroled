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
