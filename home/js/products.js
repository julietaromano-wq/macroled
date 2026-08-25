(function (window) {
  "use strict";
  const cache=new Map();
  const escapeHTML=value=>String(value??"").replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));
  const safeUrl=value=>{try{const url=new URL(String(value),window.location.href);return ["http:","https:"].includes(url.protocol)?url.href:""}catch(_){return ""}};

  function parseImages(doc){
    const raw=doc.multiimagen;let imgs=[];
    if(Array.isArray(raw)) imgs=raw;
    else if(raw){try{const parsed=JSON.parse(raw);if(Array.isArray(parsed)) imgs=parsed}catch(_){imgs=String(raw).split(/[;,|]/).map(s=>s.trim()).filter(Boolean)}}
    return imgs.map(safeUrl).filter(Boolean);
  }
  function mergeVariantValue(doc,nombre,baseValor){
    const base=String(baseValor??"");if(!Array.isArray(doc.atributo_variante)) return base;
    const existing=base.split(";").map(s=>s.trim());
    const extras=doc.atributo_variante.filter(v=>String(v.nombre||"").toLowerCase()===String(nombre||"").toLowerCase()&&v.valor&&!existing.includes(String(v.valor))).map(v=>String(v.valor));
    return extras.length?[base,...extras].filter(Boolean).join(" ; "):base;
  }
  function rawSpecs(doc){
    if(Array.isArray(doc.atributos)&&doc.atributos.length){
      return doc.atributos.map(a=>({label:a.nombre,value:mergeVariantValue(doc,a.nombre,a.valor)}));
    }
    return [
      {label:doc.nombre_attr1,value:doc.attr1},
      {label:doc.nombre_attr2,value:doc.attr2},
      {label:doc.nombre_attr3,value:doc.attr3}
    ].filter(p=>p.label&&p.value).map(p=>({label:p.label,value:mergeVariantValue(doc,p.label,p.value)}));
  }
  const isTemperatureSpec=spec=>/temperatura|luz|kelvin|\bcct\b/i.test(String(spec.label||""))||/\b\d{4}\s*k\b/i.test(String(spec.value||""));
  const isSmartSpec=spec=>/^smart$/i.test(String(spec.value||"").trim())||/\bsmart\b/i.test(String(spec.label||""));
  const normalizedLabel=value=>String(value||"").trim().toLocaleLowerCase("es");
  function variantSpec(doc){
    const label=String(doc.nombre_attr_variantes||"").trim();
    const value=String(doc.attr_variantes||"").trim();
    return label&&value?{label,value}:null;
  }
  function buildSpecs(doc){
    const variant=variantSpec(doc);
    const variantLabel=normalizedLabel(variant?.label);
    const specs=rawSpecs(doc).filter(spec=>normalizedLabel(spec.label)!==variantLabel&&!isTemperatureSpec(spec)&&!isSmartSpec(spec));
    if(variant&&!isTemperatureSpec(variant)&&!isSmartSpec(variant)) specs.unshift(variant);
    return specs.slice(0,2);
  }
  const ICON_BULB='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V17h6v-.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z"/></svg>';
  const TEMP_TONES={calido:{color:"#fff79b",label:"Cálido"},neutro:{color:"#d9d9d9",label:"Neutro"},frio:{color:"#bce4fa",label:"Frío"}};
  function tempCategoryKey(value){
    const raw=String(value||"").trim().toLowerCase();
    if(/c[aá]lido/.test(raw))return "calido";
    if(/neutro/.test(raw))return "neutro";
    if(/fr[ií]o/.test(raw))return "frio";
    const kelvin=parseInt(value,10);
    if(Number.isNaN(kelvin))return null;
    if(kelvin<=3000)return "calido";
    if(kelvin<=4500)return "neutro";
    return "frio";
  }
  function buildLuzCategoryKeys(doc){
    const isVariantLuz=String(doc.nombre_attr_variantes||"").trim().toLowerCase()==="luz"&&doc.attr_variantes;
    const sources=[
      isVariantLuz?doc.attr_variantes:"",
      doc.attr3,
      doc.rango_temperatura,
      ...(rawSpecs(doc).filter(isTemperatureSpec).map(spec=>spec.value)),
      ...(Array.isArray(doc.variante_temperatura_filtro)?doc.variante_temperatura_filtro:[])
    ];
    const bestKelvinByKey=new Map();
    sources.filter(Boolean).forEach(source=>{
      String(source).split(/[;,|]/).map(tone=>tone.trim()).filter(Boolean).forEach(tone=>{
        const key=tempCategoryKey(tone);
        if(!key) return;
        const parsed=parseInt(tone,10);
        const sortKelvin=Number.isNaN(parsed)?(key==="calido"?2700:key==="neutro"?4000:6500):parsed;
        if(!bestKelvinByKey.has(key)||sortKelvin<bestKelvinByKey.get(key)) bestKelvinByKey.set(key,sortKelvin);
      });
    });
    return [...bestKelvinByKey.entries()].sort((a,b)=>a[1]-b[1]).map(([key])=>key);
  }
  function buildTempBadge(doc){
    const keys=buildLuzCategoryKeys(doc);
    if(!keys.length) return "";
    const rows=keys.map(key=>{
      const {color,label}=TEMP_TONES[key];
      return `<span class="temp-dots-row"><span class="temp-dots-label">${label}</span><span class="dot luz-dot" style="background:${color}" title="${label}" aria-label="${label}"></span></span>`;
    }).join("");
    return `<span class="temp-dots${keys.length>=2?" is-collapsed":""}" tabindex="0" aria-label="Temperatura de luz"><span class="temp-dots-icon" aria-hidden="true">${ICON_BULB}</span>${rows}</span>`;
  }
  function buildVariantBadge(doc){
    const configured=parseInt(doc.cant_variantes,10);
    const fieldCount=variantSpec(doc)?.value.split(";").map(value=>value.trim()).filter(Boolean).length||0;
    const skuCount=Array.isArray(doc.variantes_sku)?doc.variantes_sku.length:0;
    const count=configured>0?configured:Math.max(fieldCount,skuCount);
    return count>1?`<span class="badge">${count} variantes</span>`:"";
  }
  function buildSmartBadge(doc){
    const directSmart=doc.smart===true||doc.es_smart===true||[doc.smart,doc.es_smart].some(value=>/^(si|sí|true|1|smart)$/i.test(String(value||"").trim()));
    return directSmart||rawSpecs(doc).some(isSmartSpec)?'<span class="ml-product-smart-badge" aria-label="Producto Smart">SMART</span>':"";
  }
  const filterValue=value=>String(value??"").replace(/`/g,"\\`");
  const shuffled=items=>{const copy=[...items];for(let index=copy.length-1;index>0;index--){const swap=Math.floor(Math.random()*(index+1));[copy[index],copy[swap]]=[copy[swap],copy[index]]}return copy};
  function pickRandomByField(hits,field,count){
    if(!field)return hits.slice(0,count);
    const groups=new Map();
    shuffled(hits).forEach(hit=>{const raw=hit.document?.[field],values=Array.isArray(raw)?raw:[raw],key=values.map(value=>String(value||"").trim()).filter(Boolean).join(" | ")||"Sin categoría";if(!groups.has(key))groups.set(key,[]);groups.get(key).push(hit)});
    const selected=shuffled([...groups.values()]).map(group=>shuffled(group)[0]).slice(0,count),selectedSet=new Set(selected);
    if(selected.length<count)selected.push(...shuffled(hits.filter(hit=>!selectedSet.has(hit))).slice(0,count-selected.length));
    return selected;
  }
  const buildFilter=(field,value,filters)=>{
    if(Array.isArray(filters)&&filters.length) return filters.map(filter=>`${filter.field}:=\`${filterValue(filter.value)}\``).join(" && ");
    return `${field}:=\`${filterValue(value)}\``;
  };
  async function fetchProducts(field,value,count,filters){
    const cfg=window.MACROLED_HOME_CONFIG.typesense;
    if(!cfg.host||!cfg.apiKey||!cfg.collection) throw new Error("Configuración Typesense incompleta");
    const filterBy=buildFilter(field,value,filters);
    const key=[filterBy,count].join("|");if(cache.has(key)) return cache.get(key);
    const params=new URLSearchParams({q:"*",query_by:cfg.queryBy||"nombre_typesense,descripcion",filter_by:filterBy,per_page:String(count),page:"1"});
    const request=fetch(`${cfg.host}/collections/${encodeURIComponent(cfg.collection)}/documents/search?${params}`,{headers:{"X-TYPESENSE-API-KEY":cfg.apiKey}}).then(async res=>{if(!res.ok) throw new Error(`Typesense ${res.status}: ${await res.text()}`);return res.json()}).catch(error=>{cache.delete(key);throw error});
    cache.set(key,request);return request;
  }
  function cardTemplate(doc){
    const imgs=parseImages(doc),specs=buildSpecs(doc),link=safeUrl(doc.link_ficha_web),tag=link?"a":"div";
    const attrs=specs.length
      ?specs.map(spec=>`<div class="ml-product-attr"><span class="ml-product-attr__label">${escapeHTML(spec.label)}</span><span class="ml-product-attr__value">${escapeHTML(spec.value)}</span></div>`).join("")
      :'<span class="ml-product-card__note">Sin atributos cargados</span>';
    const image=imgs.length
      ?`<img src="${escapeHTML(imgs[0])}" alt="${escapeHTML(doc.nombre_typesense||"Producto Macroled")}" loading="lazy" width="400" height="400">`
      :'<span class="ml-product-card__note">Sin imagen</span>';
    const linkAttrs=link?` href="${escapeHTML(link)}" data-href="${escapeHTML(link)}"`:"";
    return `<${tag} class="ml-product-card${link?"":" ml-product-card--disabled"}"${linkAttrs} data-id="${escapeHTML(doc.id||doc.sku||"")}"><div class="ml-product-card__media">${buildSmartBadge(doc)}${buildVariantBadge(doc)}${buildTempBadge(doc)}${image}</div><div class="ml-product-card__title">${escapeHTML(doc.nombre_typesense||"Producto sin nombre")}</div><div class="ml-product-card__attrs">${attrs}</div></${tag}>`;
  }
  function loadingSkeletons(count=5){
    const total=Math.max(1,Number(count)||5);
    return `<span class="ml-product-loading-label">Cargando productos…</span>${Array.from({length:total},(_,index)=>`<div class="ml-product-skeleton" aria-hidden="true" style="--skeleton-order:${index}"><div class="ml-product-skeleton__media"></div><div class="ml-product-skeleton__line ml-product-skeleton__line--title"></div><div class="ml-product-skeleton__attrs"><span></span><span></span></div></div>`).join("")}`;
  }
  function wireCarousels(grid){
    grid.querySelectorAll(".ml-product-card__media").forEach(media=>{const img=media.querySelector("img[data-images]");if(!img)return;let images=[];try{images=JSON.parse(img.dataset.images)}catch(_){return}const move=direction=>{let index=Number(img.dataset.index||0);index=(index+direction+images.length)%images.length;img.dataset.index=String(index);img.src=images[index]};media.querySelector(".ml-product-card__nav--prev")?.addEventListener("click",event=>{event.preventDefault();event.stopPropagation();move(-1)});media.querySelector(".ml-product-card__nav--next")?.addEventListener("click",event=>{event.preventDefault();event.stopPropagation();move(1)})});
  }
  async function renderGrid(grid){
    const field=grid.dataset.productsField,value=grid.dataset.productsValue,configuredCount=Number(grid.dataset.productsCount||4);
    const count=matchMedia("(min-width: 1601px)").matches?Math.max(configuredCount,5):configuredCount,fetchCount=Math.max(count,Number(grid.dataset.productsFetchCount||count)),randomizeBy=grid.dataset.productsRandomizeBy||"";let filters=[];
    try{filters=JSON.parse(grid.dataset.productsFilters||"[]")}catch(_){filters=[]}
    grid.setAttribute("aria-busy","true");
    const label=filters.length?filters.map(filter=>filter.value).join(" / "):value;
    try{const data=await fetchProducts(field,value,fetchCount,filters);if(!data.hits?.length){grid.innerHTML=`<div class="ml-product-state">No hay productos para “${escapeHTML(label)}”.</div>`;return}const hits=pickRandomByField(data.hits,randomizeBy,count);grid.innerHTML=hits.map(hit=>cardTemplate(hit.document)).join("");wireCarousels(grid);const block=grid.closest(".ml-products-block");if(block)window.MacroledFeatured?.setupTrackControls(block,grid,{mobileOnly:true})}catch(error){console.error(`Macroled Home · Error consultando Typesense (${buildFilter(field,value,filters)})`,error);grid.innerHTML=`<div class="ml-product-state">No se pudieron cargar los productos. Verificá la configuración de Typesense y que “${escapeHTML(label)}” exista.</div>`}finally{grid.setAttribute("aria-busy","false")}
  }
  function init(root=document){root.querySelectorAll(".ml-product-grid:not([data-products-ready])").forEach(grid=>{grid.dataset.productsReady="true";renderGrid(grid)})}
  window.MacroledProducts={init,parseImages,mergeVariantValue,buildSpecs,cardTemplate,loadingSkeletons,wireCarousels,pickRandomByField};
})(window);
