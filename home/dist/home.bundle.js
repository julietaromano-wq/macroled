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
      { ...category("Lineales PRO", "lineales-pro"), href: "https://www.macroled.com.ar/productos?macrofamilia=Lineales+PRO", image: "https://d1zltvqju4u8ql.cloudfront.net/fit-in/350x350/MACROLED/WEB/PORTADA-LINEALES-PRO.webp", badge: "Nuevo" },
      { ...category("Skyline", "luminarias-skyline"), href: "https://www.macroled.com.ar/productos?macrofamilia=Skyline&familia=Luminarias", image: "https://s3.coresagroup.com/MACROLED/250/skyline.png", badge: "Nuevo" },
      { ...category("Artefactos para lámparas", "artefactos-para-lamparas"), href: "https://www.macroled.com.ar/productos?macrofamilia=Artefactos+para+L%C3%A1mparas", image: "https://s3.coresagroup.com/MACROLED/250/policarbonato-embutir-ar111.png" },
      { ...category("Paneles", "paneles"), href: "https://www.macroled.com.ar/productos?macrofamilia=Paneles", image: "https://d1zltvqju4u8ql.cloudfront.net/fit-in/250x250/MACROLED/WEB/GRAN-FORMATO-BACKLIGHT.webp" },
      { ...category("Tiras Led", "tiras-led"), href: "https://www.macroled.com.ar/productos?macrofamilia=Tiras+LED", image: "https://d1zltvqju4u8ql.cloudfront.net/fit-in/250x250/filters:format(png)/MACROLED/1000/0742832556316a.png" },
      { ...category("Lámparas", "lamparas"), href: "https://www.macroled.com.ar/productos?macrofamilia=L%C3%A1mparas", image: "https://d1zltvqju4u8ql.cloudfront.net/fit-in/250x250/filters:format(png)/MACROLED/1000/7428325565203a.png" }
    ],
    monaco: [
      { ...category("Armadas", "monaco-armadas"), href: "https://www.macroled.com.ar/productos?macrofamilia=Interruptores+y+Tomas&familia=Monaco&subfamilia=Armadas", image: "https://s3.coresagroup.com/MACROLED/250/milan.png" },
      { ...category("Despiece", "monaco-bastidor-modulos"), href: "https://www.macroled.com.ar/productos?macrofamilia=Interruptores+y+Tomas&familia=Monaco&subfamilia=Despiece", image: "https://s3.coresagroup.com/MACROLED/250/milan-bastidores.png" },
      { ...category("Tapas", "monaco-tapas"), href: "https://www.macroled.com.ar/productos?macrofamilia=Interruptores+y+Tomas&familia=Monaco&subfamilia=Tapas", image: "https://s3.coresagroup.com/MACROLED/250/milan-tapas.png" },
      { ...category("Luz guía", "monaco-luz-pasillo"), href: "https://www.macroled.com.ar/productos?macrofamilia=Interruptores+y+Tomas&familia=Monaco&subfamilia=Luz+gu%C3%ADa", image: "https://d1zltvqju4u8ql.cloudfront.net/fit-in/2000x2000/MACROLED/WEB/portada_luz_pasillo.webp" }
    ],
    exterior: [
      { ...category("Reflectores", "reflectores"), href: "https://www.macroled.com.ar/productos?macrofamilia=Reflectores", image: "https://s3.coresagroup.com/MACROLED/250/reflectores-smart.png" },
      { ...category("Tortugas", "tortugas"), href: "https://www.macroled.com.ar/productos?macrofamilia=Luminarias+Integradas+Exterior&familia=Tortugas", image: "https://s3.coresagroup.com/MACROLED/250/tortugas.png" },
      { ...category("Estacas", "estacas"), href: "https://www.macroled.com.ar/productos?macrofamilia=Luminarias+Integradas+Exterior&familia=Estacas+M%C3%B3viles", image: "https://s3.coresagroup.com/MACROLED/250/estacas-led-integrado.png" },
      { ...category("Guirnaldas", "guirnaldas"), href: "https://www.macroled.com.ar/productos?macrofamilia=Artefactos+para+L%C3%A1mparas&familia=Guirnaldas", image: "https://d1zltvqju4u8ql.cloudfront.net/fit-in/250x250/filters:format(png)/MACROLED/1000/7428325574946a.png" }
    ],
    proyectos: [
      { ...category("Luz de calle\nStandard", "proyectos-luz-calle-standard"), href: "https://www.macroled.com.ar/productos?macrofamilia=Luminarias+de+Proyecto&familia=Luz+de+Calle&subfamilia=Standard", image: "https://d1zltvqju4u8ql.cloudfront.net/fit-in/250x250/MACROLED/WEB/SLG2-100W-757-CW_FRONT.webp", badge: "Nuevo" },
      { ...category("Highbay PRO", "proyectos-highbay-pro"), href: "https://www.macroled.com.ar/productos?macrofamilia=Luminarias+de+Proyecto&familia=Galponeras&subfamilia=Highbay+PRO+2026", image: "https://s3.coresagroup.com/MACROLED/250/PHB-200W-90D-857-CW.png" },
      { ...category("Reflectores PRO", "proyectos-reflectores-pro"), href: "https://www.macroled.com.ar/productos?macrofamilia=Luminarias+Exterior&familia=Reflectores&subfamilia=Reflectores+PRO+2026", image: "https://d1zltvqju4u8ql.cloudfront.net/fit-in/250x250//MACROLED/WEB/PFL-400W-030D-857-CW_FRONT.webp" },
      { ...category("Olimpus", "proyectos-olimpus"), href: "https://www.macroled.com.ar/productos?macrofamilia=Luminarias+de+Proyecto&familia=Reflectores&subfamilia=OLIMPUS", image: "https://s3.coresagroup.com/MACROLED/250/olimpus.png" },
      { ...category("Highbay Standard", "proyectos-highbay-standard"), href: "https://www.macroled.com.ar/productos?macrofamilia=Luminarias+de+Proyecto&familia=Galponeras&subfamilia=Highbay+Standard", image: "https://s3.coresagroup.com/MACROLED/250/SHB-200W.png" },
      { ...category("Focus", "proyectos-focus"), href: "https://www.macroled.com.ar/productos?macrofamilia=Luminarias+de+Proyecto&familia=Reflectores&subfamilia=Focus", image: "https://s3.coresagroup.com/MACROLED/250/focus.png" }
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
      queryBy: "nombre_typesense,descripcion"
    },
    tabs: {
      interior: {
        title: "Productos para crear ambientes funcionales y únicos",
        subtitle: "",
        cta: { label: "Ver productos", href: "#" },
        categories: MANUAL_CATEGORIES.interior,
        featuredLines: [
          {
            ...line("Línea Mónaco", "Módulos y tomas diseñados con un enfoque en estética, funcionalidad y seguridad. Una propuesta versátil con armadas, conexiones y componentes pensados para adaptarse a instalaciones eléctricas contemporáneas.", "#e9ecef", "#101820", "image-left"),
            id: "monaco",
            image: "https://cdn.prod.website-files.com/65f1fdd7248b6709fdebe904/69a977bb0fe12ec5b81b7e9b_monaco-cover%20copia.webp",
            imageFit: "contain",
            href: "https://www.macroled.com.ar/productos?macrofamilia=Interruptores+y+Tomas&familia=Monaco",
            catalogHref: "https://s3.coresagroup.com/MACROLED/catalogos/Macroled_Monaco.pdf",
            titleEmphasis: "Mónaco",
            content: { mode: "static", categoryGroup: "monaco" }
          },
          {
            ...line("Reflectores PRO", "La combinación ideal entre rendimiento y practicidad. Reflectores para exterior pensados para iluminar accesos, fachadas, patios y áreas abiertas con una instalación versátil y una luz confiable.", "#16283a", "#e4ebf0", "image-right"),
            image: "https://cdn.prod.website-files.com/65f1fdd7248b6709fdebe904/699cb28af6cdd53e774759f0_FAMILIA%20REFLECTORES%20PRO.webp",
            imageFit: "contain-right",
            href: "https://www.macroled.com.ar/productos?macrofamilia=Luminarias+Exterior&familia=Reflectores&subfamilia=Reflectores+PRO+2026",
            titleEmphasis: "PRO",
            content: {
              mode: "typesense",
              query: {
                typesenseFilters: [
                  { field: "macrofamilia", value: "Luminarias Exterior" },
                  { field: "familia", value: "Reflectores" },
                  { field: "subfamilia", value: "Reflectores PRO 2026" }
                ],
                productCount: 4,
                fetchCount: 80,
                randomizeBy: "nombre_typesense"
              }
            }
          },
          {
            ...line("Luminarias Skyline", "Iluminación arquitectónica con rieles magnéticos de 48V que combinan seguridad, versatilidad y estética premium. Luminarias con opciones Smart de blancos dinámicos y automatización.", "#07090c", "#e4ebf0", "image-left"),
            image: "https://s3.coresagroup.com/MACROLED/250/skyline.png",
            imageFit: "contain-centered",
            visualTheme: "silver-dark",
            href: "https://www.macroled.com.ar/productos?macrofamilia=Skyline&familia=Luminarias",
            catalogHref: "https://s3.coresagroup.com/MACROLED/catalogos/Macroled_Skyline.pdf",
            titleEmphasis: "Skyline",
            titleEmphasisWeight: 600,
            content: {
              mode: "typesense",
              query: {
                typesenseFilters: [
                  { field: "macrofamilia", value: "Skyline" },
                  { field: "familia", value: "Luminarias" }
                ],
                productCount: 4,
                fetchCount: 100,
                randomizeBy: "nombre_typesense"
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
        labelActiveMobile: "Iluminación proyectos",
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
        href: "/novedades/casa-foa-2026-pocito",
        image: "https://cdn.prod.website-files.com/66298c6904f627b9b69307c7/6a79f74fcfa63a1d3bc495b9_Espacio-13-Casa-FOA-2026-Juan-Cruz-Paredes-1.webp",
        hoverImage: "https://cdn.prod.website-files.com/66298c6904f627b9b69307c7/6a79f7562c2172c4662fdc88_Espacio-26-Casa-FOA-2026-Juan-Cruz-Paredes-1.webp"
      },
      {
        title: "Expo Construir",
        description: "Presentamos nuestros últimos lanzamientos: las líneas Mónaco, Lima, Macroled ARQ, Skyline, Kyo, Taö y Höshi, pensadas para proyectos arquitectónicos.",
        href: "/novedades/expo-construir",
        image: "https://s3.coresagroup.com/MACROLED/WEB/HOME/expo.jpg",
        hoverImage: "https://s3.coresagroup.com/MACROLED/WEB/HOME/expo_hover.jpg",
        zoomDefaultImage: true
      },
      {
        title: "Biel Light 2025",
        description: "Durante cuatro días presentamos nuevas tecnologías, lanzamientos y demostraciones técnicas, con asesoramiento personalizado para distribuidores, instaladores y profesionales del sector.",
        href: "/novedades/biel-light-2025",
        image: "https://cdn.prod.website-files.com/690a24d6bf8e2592b2f29d1f/69bc53bc8148c948726225fa_691b4529bb6b28848a915f53_015.coresa-p-2600-p-2000.webp",
        hoverImage: "https://s3.coresagroup.com/MACROLED/WEB/HOME/biel_hover.jpg"
      }
    ],
    faq: [
      {
        question: "¿Dónde encuentro la información técnica de los productos?",
        answer: "En la ficha de cada producto vas a encontrar todas sus especificaciones técnicas, junto con los archivos disponibles para descargar. También podés consultar la sección Descargas, donde reunimos catálogos y material técnico de nuestros productos. Y si necesitás resolver una consulta puntual, podés usar nuestro Asistente de Productos para encontrar la información que buscás.",
        emphasis: ["ficha de cada producto", "sección Descargas", "Asistente de Productos"]
      },
      {
        question: "¿Cómo puedo comparar distintas alternativas?",
        answer: "Desde nuestra sección de productos podés seleccionar hasta 3 productos y compararlos especificación por especificación. También podés elegir mostrar solo las diferencias para identificar rápidamente qué cambia entre modelos similares.",
        emphasis: ["sección de productos"]
      },
      {
        question: "¿Macroled tiene luminarias para proyectos profesionales?",
        answer: "Sí, contamos con una amplia gama de soluciones destinadas a proyectos lumínicos profesionales. Completá el formulario de contacto y nuestro equipo técnico te va a acompañar en la selección de los productos más adecuados para tu proyecto.",
        emphasis: ["formulario de contacto"]
      },
      {
        question: "¿Macroled vende a profesionales y también a consumidores finales?",
        answer: "Comercializamos nuestros productos a través de una amplia red de distribuidores en todo el país y también contamos con tienda oficial en Mercado Libre, donde podés realizar tus compras como consumidor final.",
        emphasis: ["red de distribuidores", "Mercado Libre"]
      },
      {
        question: "¿Los productos tienen garantía?",
        answer: "Sí, nuestros productos cuentan con garantía ante fallas de fabricación. Para conocer las condiciones y el período de cobertura, consultá la documentación correspondiente o contactanos."
      },
      {
        question: "¿Cómo puedo recibir asesoramiento para un proyecto?",
        answer: "Si estás trabajando en un proyecto y necesitás definir productos, cantidades o alternativas, podés completar el formulario de contacto. Nuestro equipo técnico puede orientarte según las necesidades de cada proyecto.",
        emphasis: ["formulario de contacto"]
      }
    ]
  };
})(window);

/* Source: home/js/products.js */
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
  function isProductNuevo(doc){
    const raw=doc.nuevo;
    if(raw===true||raw===1) return true;
    const value=String(raw??"").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
    return value==="si"||value==="true"||value==="1"||value==="yes"||value==="nuevo";
  }
  function buildNuevoBadge(doc){
    return isProductNuevo(doc)?'<span class="badge ml-highlight-badge" aria-label="Producto nuevo">NUEVO</span>':"";
  }
  const ICON_WIFI='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>';
  function buildSmartBadge(doc){
    const directSmart=doc.smart===true||doc.es_smart===true||[doc.smart,doc.es_smart].some(value=>/^(si|sí|true|1|smart)$/i.test(String(value||"").trim()));
    return directSmart||rawSpecs(doc).some(isSmartSpec)?`<span class="smart-badge" aria-label="Producto Smart">${ICON_WIFI}SMART</span>`:"";
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
    const name=doc.nombre_typesense||"Producto sin nombre";
    const specsHtml=specs.length
      ?specs.map(spec=>`<div class="spec"><span class="spec-label">${escapeHTML(spec.label)}</span><span class="val">${escapeHTML(spec.value)}</span></div>`).join("")
      :"";
    const image=imgs.length
      ?`<img src="${escapeHTML(imgs[0])}" alt="${escapeHTML(name)}" loading="lazy" width="400" height="400">`
      :'<span class="ml-product-card__note">Sin imagen</span>';
    const smart=buildSmartBadge(doc);
    const temp=buildTempBadge(doc);
    const linkAttrs=link?` href="${escapeHTML(link)}" data-href="${escapeHTML(link)}"`:"";
    return `<${tag} class="ml-product-card${link?"":" ml-product-card--disabled"}"${linkAttrs} data-id="${escapeHTML(doc.id||doc.sku||"")}"><div class="media"><div class="media-frame">${buildNuevoBadge(doc)}${smart?`<div class="media-badges-left">${smart}</div>`:""}${image}</div>${temp?`<div class="card-overlays">${temp}</div>`:""}</div><div class="card-content"><div class="ml-card-body"><div class="card-title" title="${escapeHTML(name)}">${escapeHTML(name)}</div>${specsHtml?`<div class="specs">${specsHtml}</div>`:""}</div></div></${tag}>`;
  }
  function loadingSkeletons(count=5){
    const total=Math.max(1,Number(count)||5);
    return `<span class="ml-product-loading-label">Cargando productos…</span>${Array.from({length:total},(_,index)=>`<div class="ml-product-skeleton" aria-hidden="true" style="--skeleton-order:${index}"><div class="ml-product-skeleton__media"></div><div class="ml-product-skeleton__line ml-product-skeleton__line--title"></div><div class="ml-product-skeleton__attrs"><span></span><span></span></div></div>`).join("")}`;
  }
  function wireCarousels(grid){
    grid.querySelectorAll(".ml-product-card .media").forEach(media=>{const img=media.querySelector("img[data-images]");if(!img)return;let images=[];try{images=JSON.parse(img.dataset.images)}catch(_){return}const move=direction=>{let index=Number(img.dataset.index||0);index=(index+direction+images.length)%images.length;img.dataset.index=String(index);img.src=images[index]};media.querySelector(".ml-product-card__nav--prev")?.addEventListener("click",event=>{event.preventDefault();event.stopPropagation();move(-1)});media.querySelector(".ml-product-card__nav--next")?.addEventListener("click",event=>{event.preventDefault();event.stopPropagation();move(1)})});
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

/* Source: home/js/featured.js */
(function (window) {
  "use strict";

  const FEATURED_FIELD = "destacados_en";
  const FEATURED_GROUPS = ["1", "2", "3", "4", "5"];
  const FEATURED_COUNT = 250;
  let currentSpace = null;
  let isFetching = false;

  async function fetchFeatured(space) {
    const cfg = window.MACROLED_HOME_CONFIG.typesense;
    const params = new URLSearchParams({
      q: "*",
      query_by: cfg.queryBy || "nombre_typesense,descripcion",
      filter_by: `${FEATURED_FIELD}:=[${FEATURED_GROUPS.join(",")}]`,
      per_page: String(FEATURED_COUNT),
      page: "1"
    });
    const url = `${cfg.host}/collections/${encodeURIComponent(cfg.collection)}/documents/search?${params}`;
    const response = await fetch(url, { headers: { "X-TYPESENSE-API-KEY": cfg.apiKey } });
    if (!response.ok) throw new Error(`Typesense ${response.status}: ${await response.text()}`);
    return response.json();
  }

  function featuredGroup(document) {
    const raw = document?.[FEATURED_FIELD];
    const values = Array.isArray(raw) ? raw : [raw];
    return values
      .map(value => Number.parseInt(String(value ?? "").trim(), 10))
      .filter(Number.isFinite)
      .map(String)
      .find(value => FEATURED_GROUPS.includes(value)) || "";
  }

  function orderFeatured(hits) {
    return FEATURED_GROUPS.flatMap(group => {
      const groupHits = hits.filter(hit => featuredGroup(hit.document) === group);
      return window.MacroledProducts.pickRandomByField(
        groupHits,
        "nombre_typesense",
        groupHits.length
      );
    });
  }

  function setupTrackControls(root, track, options = {}) {
    const controls = root.querySelector(".ml-featured-products__controls");
    const progressBar = root.querySelector(".ml-featured-products__progress");
    const progress = root.querySelector("[data-featured-progress]");
    const prev = root.querySelector("[data-featured-prev]");
    const next = root.querySelector("[data-featured-next]");
    const arrows = root.querySelector(".ml-featured-products__arrows");
    const viewport = root.querySelector(".ml-featured-products__viewport");
    const cardSelector = options.cardSelector || ".ml-product-card";
    const mobile = matchMedia("(max-width: 640px)");
    if (!controls || !progressBar || !progress || !prev || !next || !arrows) return;

    const getCards = () => [...track.querySelectorAll(cardSelector)];

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
      const cards = getCards();
      if (!cards.length) return;
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
    let dragStartY = 0;
    let dragStartScroll = 0;
    let dragged = false;
    let dragAxis = null;
    let activePointerId = null;

    track.onpointerdown = event => {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      dragStartX = event.clientX;
      dragStartY = event.clientY;
      dragStartScroll = track.scrollLeft;
      dragged = false;
      dragAxis = null;
      activePointerId = event.pointerId;
    };
    track.onpointermove = event => {
      if (event.pointerId !== activePointerId) return;
      const distanceX = event.clientX - dragStartX;
      const distanceY = event.clientY - dragStartY;
      if (!dragAxis && Math.max(Math.abs(distanceX), Math.abs(distanceY)) > 7) {
        dragAxis = Math.abs(distanceX) > Math.abs(distanceY) * 1.15 ? "x" : "y";
        if (dragAxis === "y") {
          activePointerId = null;
          return;
        }
      }
      if (dragAxis !== "x") return;
      if (!dragged) {
        dragged = true;
        track.classList.add("is-dragging");
        track.setPointerCapture(event.pointerId);
      }
      event.preventDefault();
      track.scrollLeft = dragStartScroll - distanceX;
    };
    const stopDragging = event => {
      if (event.pointerId !== activePointerId) return;
      if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
      activePointerId = null;
      dragAxis = null;
      track.classList.remove("is-dragging");
    };
    track.onpointerup = stopDragging;
    track.onpointercancel = event => {
      stopDragging(event);
      dragged = false;
    };

    track.removeEventListener("touchstart", track._featuredTouchStart);
    track.removeEventListener("touchmove", track._featuredTouchMove);
    track.removeEventListener("touchend", track._featuredTouchEnd);
    track.removeEventListener("touchcancel", track._featuredTouchEnd);
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartScroll = 0;
    let touchAxis = null;
    let touchLastX = 0;
    let touchLastTime = 0;
    let touchVelocityX = 0;
    track._featuredTouchStart = event => {
      if (event.touches.length !== 1) return;
      const touch = event.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchStartScroll = track.scrollLeft;
      touchLastX = touch.clientX;
      touchLastTime = event.timeStamp;
      touchVelocityX = 0;
      touchAxis = null;
      dragged = false;
    };
    track._featuredTouchMove = event => {
      if (event.touches.length !== 1) return;
      const touch = event.touches[0];
      const distanceX = touch.clientX - touchStartX;
      const distanceY = touch.clientY - touchStartY;
      if (!touchAxis && Math.max(Math.abs(distanceX), Math.abs(distanceY)) > 7) {
        touchAxis = Math.abs(distanceX) > Math.abs(distanceY) * 1.15 ? "x" : "y";
      }
      if (touchAxis !== "x") return;
      event.preventDefault();
      dragged = true;
      track.classList.add("is-dragging");
      track.style.scrollBehavior = "auto";
      track.style.scrollSnapType = "none";
      track.scrollLeft = touchStartScroll - distanceX;
      const elapsed = Math.max(1, event.timeStamp - touchLastTime);
      touchVelocityX = (touch.clientX - touchLastX) / elapsed;
      touchLastX = touch.clientX;
      touchLastTime = event.timeStamp;
    };
    track._featuredTouchEnd = () => {
      const wasHorizontal = touchAxis === "x";
      touchAxis = null;
      track.classList.remove("is-dragging");
      track.style.scrollBehavior = "";
      track.style.scrollSnapType = "";
      if (wasHorizontal && Math.abs(touchVelocityX) > 0.08) {
        track.scrollTo({
          left: track.scrollLeft - touchVelocityX * 180,
          behavior: "smooth"
        });
      }
    };
    track.addEventListener("touchstart", track._featuredTouchStart, { passive: true });
    track.addEventListener("touchmove", track._featuredTouchMove, { passive: false });
    track.addEventListener("touchend", track._featuredTouchEnd, { passive: true });
    track.addEventListener("touchcancel", track._featuredTouchEnd, { passive: true });

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
    track.innerHTML = window.MacroledProducts.loadingSkeletons(5);

    try {
      const data = await fetchFeatured(space);
      if (!data.hits?.length) {
        track.innerHTML = '<div class="ml-featured-products__state">Todavía no hay productos destacados cargados.</div>';
        return;
      }
      track.innerHTML = orderFeatured(data.hits).map(hit => window.MacroledProducts.cardTemplate(hit.document)).join("");
      window.MacroledProducts.wireCarousels(track);
      track.scrollLeft = 0;
      setupTrackControls(root, track);
    } catch (error) {
      const filter = `${FEATURED_FIELD} en ${FEATURED_GROUPS.join(", ")}`;
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
      productImage: "https://d1zltvqju4u8ql.cloudfront.net/fit-in/1000x1000/MACROLED/WEB/SLG2-200W-757-NM3-CW_FRONT.webp",
      ambientImage: "https://s3.coresagroup.com/MACROLED/WEB/HOME/streetlight_ambient.png",
      href: "https://www.macroled.com.ar/productos?macrofamilia=Luminarias+de+Proyecto&familia=Luz+de+Calle&subfamilia=Standard"
    },
    {
      id: "invictus",
      title: "Invictus",
      subtitle: "Para grandes áreas, fachadas y espacios deportivos.",
      productImage: "https://s3.coresagroup.com/MACROLED/WEB/HOME/invictus.png?v=20260821-1",
      ambientImage: "https://s3.coresagroup.com/MACROLED/WEB/HOME/invictus_ambient.png",
      href: "https://www.macroled.com.ar/productos?macrofamilia=Luminarias+de+Proyecto&familia=Reflectores&subfamilia=Invictus"
    },
    {
      id: "highbay",
      title: "Highbay PRO",
      subtitle: "Para naves industriales y espacios de gran altura.",
      productImage: "https://d1zltvqju4u8ql.cloudfront.net/fit-in/1000x1000/MACROLED/WEB/PHB-100W-90D-857-CW_FRONT.webp",
      ambientImage: "https://s3.coresagroup.com/MACROLED/WEB/HOME/highbay_ambient.png",
      href: "https://www.macroled.com.ar/productos?macrofamilia=Luminarias+de+Proyecto&familia=Galponeras&subfamilia=Highbay+PRO+2026"
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
        <div class="ml-project-lines-concept__cta-wrap" aria-hidden="true">
          <span class="ml-project-lines-concept__cta ml-project-lines-concept__cta--outline">Ver productos</span>
        </div>
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

  const initializedRoots = new WeakSet();

  function initializeHome() {
    const config = window.MACROLED_HOME_CONFIG;
    const root = document.getElementById("macroled-home");
    if (!config || !root || initializedRoots.has(root)) return false;

    initializedRoots.add(root);
    bootHome(root, config);
    return true;
  }

  function bootHome(root, config) {

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
    return `<a class="ml-category-card" href="${esc(item.href)}" data-editorial-id="${esc(item.id)}"><h3>${esc(item.title)}</h3>${badge}<div class="ml-category-card__media"><img src="${esc(item.image)}" alt="" loading="lazy" width="800" height="800"></div><div class="ml-category-card__cta-wrap" aria-hidden="true"><span class="ml-category-card__cta">Ver productos</span></div></a>`;
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
    const skeletons = window.MacroledProducts?.loadingSkeletons(5) || "";
    return `<div class="ml-products-block"><div class="ml-product-grid" data-products-field="${esc(query.typesenseField)}" data-products-value="${esc(query.typesenseValue)}" data-products-filters="${esc(filters)}" data-products-count="${Number(query.productCount || 4)}" data-products-fetch-count="${Number(query.fetchCount || query.productCount || 4)}" data-products-randomize-by="${esc(query.randomizeBy || "")}">${skeletons}</div>${productControlsTemplate()}</div>`;
  }

  function lineTemplate(item) {
    const mode = item.content?.mode || "typesense";
    const lineId = item.id ? ` data-line="${esc(item.id)}"` : "";
    const catalogLink = item.catalogHref
      ? `<a class="ml-button--tertiary ml-featured__resource-link" href="${esc(item.catalogHref)}" target="_blank" rel="noopener noreferrer">Ver catálogo <span aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></span></a>`
      : "";
    return `<article class="ml-featured ml-shell"${lineId} data-theme="${esc(item.theme)}" data-visual-theme="${esc(item.visualTheme || "solid")}" data-layout="${esc(item.layout)}" data-image-fit="${esc(item.imageFit || "cover")}" data-description-lines="${Number(item.descriptionLines || 0)}" data-button-tone="${buttonTone(item.textColor)}" data-content-mode="${esc(mode)}" style="--line-bg:${esc(item.theme)};--line-color:${esc(item.textColor)};--title-emphasis-weight:${Number(item.titleEmphasisWeight || 600)}"><div class="ml-featured__story"><div class="ml-featured__media"><img src="${esc(item.image)}" alt="" loading="lazy" width="1600" height="1000"></div><div class="ml-featured__copy"><h3>${emphasize(item.title, item.titleEmphasis)}</h3><p>${emphasize(item.description, item.descriptionEmphasis)}</p><div class="ml-featured__actions"><a class="ml-button ml-button--primary" href="${esc(item.href)}">Ver productos</a>${catalogLink}</div></div></div>${lineContentTemplate(item)}</article>`;
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
    const foa = root.querySelector("[data-foa]");
    if (!featuredProducts || !foa) return;
    foa.insertAdjacentElement("beforebegin", featuredProducts);
  }

  function initExpandBanners() {
    const banners = [...root.querySelectorAll("[data-expand-banner]")];
    if (!banners.length) return;

    if (
      matchMedia("(max-width: 640px)").matches ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      banners.forEach(banner => banner.style.setProperty("--ml-expand-progress", "1"));
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const viewportHeight = window.innerHeight || 1;
      const start = viewportHeight * 0.88;
      banners.forEach(banner => {
        const rect = banner.getBoundingClientRect();
        const end = banner.matches(".ml-newsletter-banner")
          ? Math.max(viewportHeight * 0.26, viewportHeight - rect.height)
          : viewportHeight * 0.26;
        const raw = (start - rect.top) / Math.max(1, start - end);
        const clamped = Math.max(0, Math.min(1, raw));
        const progress = clamped * clamped * (3 - 2 * clamped);
        banner.style.setProperty("--ml-expand-progress", progress.toFixed(4));
      });
    };
    const requestUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    update();
  }

  function placePrimarySections() {
    /* Categories now live inside solutions banners. */
  }

  function initSolutionsBanner() {
    /* Fixed product image set in HTML. */
  }

  function renderCategoriesTest() {
    const sections = [...root.querySelectorAll("[data-categories-test]")];
    const entries = Object.entries(config.categoriesTest || {});
    if (!sections.length || !entries.length) return;

    sections.forEach((section, sectionIndex) => {
      const tabs = section.querySelector("[data-categories-test-tabs]");
      const grid = section.querySelector("[data-categories-test-grid]");
      if (!tabs || !grid) return;

      const panelId = `ml-categories-test-panel-${sectionIndex}`;
      const compactCategoryLabels = matchMedia("(max-width: 640px)");
      const activeLabel = item => compactCategoryLabels.matches && item.labelActiveMobile
        ? item.labelActiveMobile
        : item.labelActive;
      grid.id = panelId;
      tabs.innerHTML = entries.map(([key, item], index) => `
      <button class="ml-categories-test__tab ml-featured-products__tab${index === 0 ? " is-active" : ""}"
        id="ml-categories-test-tab-${sectionIndex}-${esc(key)}"
        type="button"
        role="tab"
        aria-controls="${panelId}"
        aria-selected="${index === 0}"
        tabindex="${index === 0 ? "0" : "-1"}"
        data-categories-test-tab="${esc(key)}">${esc(index === 0 ? activeLabel(item) : item.labelInactive)}</button>
    `).join("");

      const activate = key => {
        const item = config.categoriesTest[key];
        if (!item) return;
        const sliderRoot = section.querySelector("[data-categories-slider]") || section;
        section.dataset.activeCategory = key;
        section.style.setProperty("--categories-test-color", item.color);
        section.style.setProperty("--categories-test-text", item.textColor);
        grid.innerHTML = item.categories.map(categoryTemplate).join("");
        grid.scrollLeft = 0;
        grid.setAttribute("aria-labelledby", `ml-categories-test-tab-${sectionIndex}-${key}`);
        tabs.querySelectorAll("[data-categories-test-tab]").forEach(button => {
          const active = button.dataset.categoriesTestTab === key;
          const buttonConfig = config.categoriesTest[button.dataset.categoriesTestTab];
          button.classList.toggle("is-active", active);
          button.setAttribute("aria-selected", String(active));
          button.tabIndex = active ? 0 : -1;
          button.textContent = active ? activeLabel(buttonConfig) : buttonConfig.labelInactive;
        });
        window.MacroledFeatured?.setupTrackControls(sliderRoot, grid, {
          cardSelector: ".ml-category-card"
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
    });
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
          ? "radial-gradient(circle at 18% 10%, rgba(214, 220, 226, 0.08), transparent 30%), linear-gradient(180deg, #16283a 0%, #0c1218 42%, #07090c 100%)"
          : line.dataset.theme;
        if (background === activeBackground) return;
        if (activeBackground) {
          list.style.background = activeBackground;
          list.style.setProperty("--ml-panel-underlay", activeBackground);
        }
        activeBackground = background;
        const previousLayer = activeLayer;
        const layer = document.createElement("div");
        layer.className = "ml-line-theme-layer";
        if (line && (line.dataset.visualTheme === "silver-dark" || buttonTone(line.dataset.theme) === "dark")) {
          layer.classList.add("ml-line-theme-layer--dark");
        }
        layer.setAttribute("aria-hidden", "true");
        layer.style.setProperty("--ml-layer-background", background);
        list.append(layer);
        activeLayer = layer;
        requestAnimationFrame(() => {
          layer.classList.add("is-visible");
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
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        let integratedLine = lines[0];
        lines.forEach(line => {
          const copy = line.querySelector(".ml-featured__copy");
          const lineBounds = line.getBoundingClientRect();
          const copyBounds = copy?.getBoundingClientRect();
          const isReading = Boolean(
            copyBounds &&
            copyBounds.top < viewportHeight * 0.58 &&
            copyBounds.bottom > viewportHeight * 0.22
          );
          line.classList.toggle("is-story-integrated", isReading);
          /* Keep each line's theme through its cards and bottom padding.
             Falling back to Monaco here was flashing white between Reflectores and Skyline. */
          if (lineBounds.top < viewportHeight * 0.78) integratedLine = line;
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
    const newsTrack = root.querySelector("[data-news]");
    newsTrack.innerHTML = config.news.map(item => {
      const tag = item.href ? "a" : "article";
      const href = item.href ? ` href="${esc(item.href)}"` : "";
      const hoverImage = item.hoverImage || item.image;
      const defaultImageClass = item.zoomDefaultImage ? " ml-news-card__image--zoomed" : "";
      return `<${tag} class="ml-news-card"${href}><div class="ml-news-card__media"><img class="ml-news-card__image ml-news-card__image--default${defaultImageClass}" src="${esc(item.image)}" alt="${esc(item.title)}" loading="lazy" width="700" height="560"><img class="ml-news-card__image ml-news-card__image--hover" src="${esc(hoverImage)}" alt="" aria-hidden="true" loading="lazy" width="700" height="560"></div><h3><span>${esc(item.title)}</span><span class="ml-news-card__arrow" aria-hidden="true">&rarr;</span></h3><p>${esc(item.description)}</p></${tag}>`;
    }).join("");
    const newsSection = newsTrack.closest(".ml-news");
    window.MacroledFeatured?.setupTrackControls(newsSection, newsTrack, {
      cardSelector: ".ml-news-card",
      mobileOnly: true
    });
    root.querySelector("[data-faq]").innerHTML = config.faq.map((item, index) => {
      const answer = esc(item.answer);
      const emphasis = Array.isArray(item.emphasis) ? item.emphasis : item.emphasis ? [item.emphasis] : [];
      const answerHtml = emphasis.reduce((html, phrase) => {
        const escapedPhrase = esc(phrase);
        return html.replace(escapedPhrase, `<strong>${escapedPhrase}</strong>`);
      }, answer);
      return `<div class="ml-faq__item"><button class="ml-faq__trigger" type="button" aria-expanded="false" aria-controls="ml-faq-answer-${index}"><span>${esc(item.question)}</span><span class="ml-faq__icon" aria-hidden="true">＋</span></button><div class="ml-faq__answer" id="ml-faq-answer-${index}"><div><p>${answerHtml}</p></div></div></div>`;
    }).join("");
    root.querySelectorAll(".ml-faq__trigger").forEach(button => button.addEventListener("click", () => {
      button.setAttribute("aria-expanded", String(button.getAttribute("aria-expanded") !== "true"));
    }));
  }

  function initHeroLuminariasRise() {
    const hero = root.querySelector(".ml-hero");
    const luminarias = root.querySelector(".ml-project-lines-concept");
    if (!hero || !luminarias) return;

    /* On touch layouts the project cards scroll horizontally. Keeping the
       window-level swipe transition active makes that gesture jump back to
       the hero when the finger drifts slightly on the vertical axis. */
    if (matchMedia("(max-width: 990px)").matches) return;

    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    let animating = false;
    let touchStartY = 0;

    const coverThreshold = () => Math.max(48, (hero.offsetHeight || window.innerHeight) * 0.12);

    const isOnCover = () => window.scrollY < coverThreshold();

    const riseTarget = () => {
      const top = luminarias.getBoundingClientRect().top + window.scrollY;
      return Math.max(0, Math.round(top));
    };

    const isReadyToFall = () => {
      const y = window.scrollY;
      return y > coverThreshold() && y <= riseTarget() + 64;
    };

    const animateScrollTo = (toY, duration) => {
      const fromY = window.scrollY;
      const distance = toY - fromY;
      if (Math.abs(distance) < 2) return Promise.resolve();

      const start = performance.now();
      const easeOutQuart = t => 1 - Math.pow(1 - t, 4);

      return new Promise(resolve => {
        const step = now => {
          const t = Math.min(1, (now - start) / duration);
          window.scrollTo(0, fromY + distance * easeOutQuart(t));
          if (t < 1) requestAnimationFrame(step);
          else resolve();
        };
        requestAnimationFrame(step);
      });
    };

    const goTo = target => {
      if (animating || reducedMotion.matches) return;
      if (Math.abs(target - window.scrollY) < 8) return;
      animating = true;
      animateScrollTo(target, 880).finally(() => {
        animating = false;
      });
    };

    const rise = () => goTo(riseTarget());
    const fall = () => goTo(0);

    window.addEventListener("wheel", event => {
      if (reducedMotion.matches) return;
      if (animating) {
        event.preventDefault();
        return;
      }
      if (event.deltaY > 0 && isOnCover()) {
        event.preventDefault();
        rise();
        return;
      }
      if (event.deltaY < 0 && isReadyToFall()) {
        event.preventDefault();
        fall();
      }
    }, { passive: false });

    window.addEventListener("touchstart", event => {
      touchStartY = event.touches[0]?.clientY || 0;
    }, { passive: true });

    window.addEventListener("touchmove", event => {
      if (reducedMotion.matches) return;
      if (animating) {
        event.preventDefault();
        return;
      }
      const currentY = event.touches[0]?.clientY || 0;
      const swipe = touchStartY - currentY;
      if (swipe > 14 && isOnCover()) {
        event.preventDefault();
        rise();
        return;
      }
      if (swipe < -14 && isReadyToFall()) {
        event.preventDefault();
        fall();
      }
    }, { passive: false });

    window.addEventListener("keydown", event => {
      if (reducedMotion.matches || event.altKey || event.ctrlKey || event.metaKey) return;
      if (animating) {
        if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", " "].includes(event.key)) {
          event.preventDefault();
        }
        return;
      }
      const scrollingDown = ["ArrowDown", "PageDown"].includes(event.key) || (event.key === " " && !event.shiftKey);
      const scrollingUp = ["ArrowUp", "PageUp"].includes(event.key) || (event.key === " " && event.shiftKey);
      if (scrollingDown && isOnCover()) {
        event.preventDefault();
        rise();
        return;
      }
      if (scrollingUp && isReadyToFall()) {
        event.preventDefault();
        fall();
      }
    });
  }

  function handleVideo() {
    const video = root.querySelector(".ml-hero__video");
    const revealHome = () => root.classList.remove("is-video-loading");
    if (!video) {
      revealHome();
      return;
    }
    video.poster = matchMedia("(max-width: 640px)").matches
      ? video.dataset.posterMobile
      : video.dataset.posterDesktop;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

    if (reducedMotion.matches) {
      video.pause();
      video.hidden = true;
      revealHome();
      return;
    }

    const revealVideo = () => {
      video.removeEventListener("canplay", revealVideo);
      video.removeEventListener("error", revealVideo);
      revealHome();
    };

    video.addEventListener("canplay", revealVideo, { once: true });
    video.addEventListener("error", revealVideo, { once: true });

    if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) revealVideo();
    video.play().catch(revealVideo);

    const restMs = 10000;
    const reverseSpeed = 8;
    let reverseFrame = 0;
    let restTimer = 0;
    let lastTick = 0;

    const stopReverse = () => {
      cancelAnimationFrame(reverseFrame);
      reverseFrame = 0;
    };

    const playForward = () => {
      stopReverse();
      video.currentTime = 0;
      video.play().catch(() => {});
    };

    const playReverse = () => {
      video.pause();
      lastTick = performance.now();
      const step = now => {
        const elapsed = ((now - lastTick) / 1000) * reverseSpeed;
        lastTick = now;
        const nextTime = video.currentTime - elapsed;
        if (nextTime <= 0.04) {
          video.currentTime = 0;
          stopReverse();
          playForward();
          return;
        }
        video.currentTime = nextTime;
        reverseFrame = requestAnimationFrame(step);
      };
      reverseFrame = requestAnimationFrame(step);
    };

    video.addEventListener("ended", () => {
      restTimer = window.setTimeout(playReverse, restMs);
    });

    reducedMotion.addEventListener("change", event => {
      if (!event.matches) return;
      window.clearTimeout(restTimer);
      stopReverse();
      video.pause();
      video.hidden = true;
    });
  }

  function animateHeroTitle() {
    const title = root.querySelector("#ml-hero-title");
    if (!title || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ariaText = title.innerText.replace(/\s+/g, " ").trim();
    title.setAttribute("aria-label", ariaText);

    const chunks = [...title.childNodes].flatMap(node => {
      if (node.nodeName === "BR") {
        return [{ type: "br", className: node.className }];
      }
      const text = node.textContent;
      return text ? [{ type: "text", value: text }] : [];
    });

    title.textContent = "";
    let letterIndex = 0;
    chunks.forEach(chunk => {
      if (chunk.type === "br") {
        const br = document.createElement("br");
        if (chunk.className) br.className = chunk.className;
        title.appendChild(br);
        return;
      }

      chunk.value.split(/(\s+)/).forEach(part => {
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
          letter.style.setProperty("--letter-delay", `${letterIndex * 52}ms`);
          letter.textContent = character;
          word.appendChild(letter);
          letterIndex += 1;
        });
        title.appendChild(word);
      });
    });
    requestAnimationFrame(() => title.classList.add("is-illuminating"));
  }

  function animateCategoriesTitle() {
    const titles = [...root.querySelectorAll(".ml-categories-test__title")];
    if (!titles.length || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    titles.forEach(title => {
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
    });
  }

  function initSectionMotion() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const isMobile = matchMedia("(max-width: 640px)").matches;

    const solutionsSection = root.querySelector("[data-solutions-banner]");
    const projectSection = root.querySelector("[data-project-lines-concept]");
    const featuredSection = root.querySelector("#productos-destacados");
    const newsSection = root.querySelector(".ml-news");
    const conversionSection = root.querySelector(".ml-conversion");
    const newsletterSection = root.querySelector("[data-newsletter]");
    const categoriesSections = [...root.querySelectorAll("[data-categories-test]")];
    const featuredTrack = featuredSection?.querySelector("[data-featured-track]");
    const newsGrid = newsSection?.querySelector("[data-news]");
    const faqList = conversionSection?.querySelector("[data-faq]");
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
        }, section === projectSection ? 1800 : 1500);
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

    if (solutionsSection) {
      const solutionsGrid = solutionsSection.querySelector("[data-categories-test-grid]");
      let solutionsPending = false;
      solutionsSection.classList.add("ml-solutions-motion-ready");
      prepareCards(solutionsGrid, ".ml-category-card");

      const showSolutions = () => {
        prepareCards(solutionsGrid, ".ml-category-card");
        clearTimeout(solutionsSection._motionSettleTimer);
        solutionsSection.classList.remove("is-motion-settled", "is-motion-visible");
        solutionsGrid?.classList.remove("is-cards-refreshing", "is-cards-visible");
        /* Force a fresh transition cycle when re-entering. */
        void solutionsSection.offsetWidth;
        requestAnimationFrame(() => {
          solutionsSection.classList.add("is-motion-visible");
          solutionsSection._motionSettleTimer = setTimeout(() => {
            solutionsSection.classList.add("is-motion-settled");
          }, 3600);
        });
      };

      const hideSolutions = () => {
        clearTimeout(solutionsSection._motionSettleTimer);
        solutionsPending = false;
        solutionsSection.classList.remove("is-motion-visible", "is-motion-settled");
        solutionsGrid?.classList.remove("is-cards-refreshing", "is-cards-visible");
      };

      const armSolutions = () => {
        if (!solutionsPending) return;
        solutionsPending = false;
        showSolutions();
      };

      window.addEventListener("wheel", armSolutions, { passive: true });
      window.addEventListener("touchmove", armSolutions, { passive: true });
      window.addEventListener("keydown", event => {
        if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) {
          armSolutions();
        }
      });

      const observer = new IntersectionObserver(entries => {
        const entry = entries[0];
        if (!entry) return;
        if (!entry.isIntersecting) {
          hideSolutions();
          return;
        }
        if (motionArmed) showSolutions();
        else solutionsPending = true;
      }, { threshold: 0.22, rootMargin: "0px 0px -10% 0px" });
      observer.observe(solutionsSection);

      if (solutionsGrid) {
        new MutationObserver(() => {
          prepareCards(solutionsGrid, ".ml-category-card");
          if (!solutionsSection.classList.contains("is-motion-visible")) return;
          clearTimeout(solutionsGrid._cardsMotionTimer);
          solutionsGrid.classList.remove("is-cards-visible");
          solutionsGrid.classList.add("is-cards-refreshing");
          requestAnimationFrame(() => requestAnimationFrame(() => {
            solutionsGrid.classList.add("is-cards-visible");
            solutionsGrid._cardsMotionTimer = setTimeout(() => {
              solutionsGrid.classList.remove("is-cards-refreshing", "is-cards-visible");
            }, 2200);
          }));
        }).observe(solutionsGrid, { childList: true });
      }
    }

    if (projectSection) {
      let projectsPending = false;
      projectSection.classList.add("ml-motion-ready");
      prepareCards(projectSection, ".ml-project-lines-concept__card");

      const showProjects = () => {
        prepareCards(projectSection, ".ml-project-lines-concept__card");
        clearTimeout(projectSection._motionSettleTimer);
        projectSection.classList.remove("is-motion-settled", "is-motion-visible");
        void projectSection.offsetWidth;
        requestAnimationFrame(() => {
          projectSection.classList.add("is-motion-visible");
          projectSection._motionSettleTimer = setTimeout(() => {
            projectSection.classList.add("is-motion-settled");
          }, 2400);
        });
      };

      const hideProjects = () => {
        clearTimeout(projectSection._motionSettleTimer);
        projectsPending = false;
        projectSection.classList.remove("is-motion-visible", "is-motion-settled");
      };

      const armProjects = () => {
        if (!projectsPending) return;
        projectsPending = false;
        showProjects();
      };

      window.addEventListener("wheel", armProjects, { passive: true });
      window.addEventListener("touchmove", armProjects, { passive: true });
      window.addEventListener("keydown", event => {
        if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) {
          armProjects();
        }
      });

      const observer = new IntersectionObserver(entries => {
        const entry = entries[0];
        if (!entry) return;
        if (!entry.isIntersecting) {
          hideProjects();
          return;
        }
        if (motionArmed) showProjects();
        else projectsPending = true;
      }, { threshold: 0.13, rootMargin: "0px 0px -8% 0px" });
      observer.observe(projectSection);
    }

    /* Line sections keep their own content motion + background playbook. */
    root.querySelectorAll(".ml-featured[data-content-mode]").forEach(line => {
      const cardSelector = line.dataset.contentMode === "static"
        ? ".ml-category-card"
        : ".ml-product-card";
      const content = line.querySelector(
        line.dataset.contentMode === "static"
          ? ".ml-line-content--static"
          : ".ml-product-grid"
      );
      let linePending = false;
      line.classList.add("ml-content-motion-ready");
      prepareCards(line, cardSelector);

      const showLine = () => {
        prepareCards(line, cardSelector);
        clearTimeout(line._motionSettleTimer);
        line.classList.remove("is-motion-settled", "is-motion-visible");
        void line.offsetWidth;
        requestAnimationFrame(() => {
          line.classList.add("is-motion-visible");
          line._motionSettleTimer = setTimeout(() => {
            line.classList.add("is-motion-settled");
          }, 1800);
        });
      };

      const hideLine = () => {
        clearTimeout(line._motionSettleTimer);
        linePending = false;
        line.classList.remove("is-motion-visible", "is-motion-settled");
      };

      const armLine = () => {
        if (!linePending) return;
        linePending = false;
        showLine();
      };

      window.addEventListener("wheel", armLine, { passive: true });
      window.addEventListener("touchmove", armLine, { passive: true });
      window.addEventListener("keydown", event => {
        if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) {
          armLine();
        }
      });

      const observer = new IntersectionObserver(entries => {
        const entry = entries[0];
        if (!entry) return;
        if (!entry.isIntersecting) {
          hideLine();
          return;
        }
        if (motionArmed) showLine();
        else linePending = true;
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

    /* Featured products: same replayable entrance as soluciones. */
    if (featuredSection) {
      let featuredPending = false;
      featuredSection.classList.add("ml-featured-products-motion-ready");
      prepareCards(featuredTrack, ".ml-product-card");

      const showFeatured = () => {
        prepareCards(featuredTrack, ".ml-product-card");
        clearTimeout(featuredSection._motionSettleTimer);
        featuredSection.classList.remove("is-motion-settled", "is-motion-visible");
        void featuredSection.offsetWidth;
        requestAnimationFrame(() => {
          featuredSection.classList.add("is-motion-visible");
          featuredSection._motionSettleTimer = setTimeout(() => {
            featuredSection.classList.add("is-motion-settled");
          }, 3600);
        });
      };

      const hideFeatured = () => {
        clearTimeout(featuredSection._motionSettleTimer);
        featuredPending = false;
        featuredSection.classList.remove("is-motion-visible", "is-motion-settled");
      };

      const armFeatured = () => {
        if (!featuredPending) return;
        featuredPending = false;
        showFeatured();
      };

      window.addEventListener("wheel", armFeatured, { passive: true });
      window.addEventListener("touchmove", armFeatured, { passive: true });
      window.addEventListener("keydown", event => {
        if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) {
          armFeatured();
        }
      });

      const observer = new IntersectionObserver(entries => {
        const entry = entries[0];
        if (!entry) return;
        if (!entry.isIntersecting) {
          hideFeatured();
          return;
        }
        if (motionArmed) showFeatured();
        else featuredPending = true;
      }, { threshold: 0.22, rootMargin: "0px 0px -10% 0px" });
      observer.observe(featuredSection);

      if (featuredTrack) {
        new MutationObserver(() => {
          prepareCards(featuredTrack, ".ml-product-card");
          if (!featuredSection.classList.contains("is-motion-visible")) return;
          featuredSection.classList.remove("is-motion-visible");
          requestAnimationFrame(() => requestAnimationFrame(() => {
            featuredSection.classList.add("is-motion-visible");
          }));
        }).observe(featuredTrack, { childList: true });
      }
    }

    if (newsSection) {
      let newsPending = false;
      newsSection.classList.add("ml-news-motion-ready");
      prepareCards(newsGrid, ".ml-news-card");

      const showNews = () => {
        prepareCards(newsGrid, ".ml-news-card");
        clearTimeout(newsSection._motionSettleTimer);
        newsSection.classList.remove("is-motion-settled", "is-motion-visible");
        void newsSection.offsetWidth;
        requestAnimationFrame(() => {
          newsSection.classList.add("is-motion-visible");
          newsSection._motionSettleTimer = setTimeout(() => {
            newsSection.classList.add("is-motion-settled");
          }, 3600);
        });
      };

      const hideNews = () => {
        clearTimeout(newsSection._motionSettleTimer);
        newsPending = false;
        newsSection.classList.remove("is-motion-visible", "is-motion-settled");
      };

      const armNews = () => {
        if (!newsPending) return;
        newsPending = false;
        showNews();
      };

      window.addEventListener("wheel", armNews, { passive: true });
      window.addEventListener("touchmove", armNews, { passive: true });
      window.addEventListener("keydown", event => {
        if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) {
          armNews();
        }
      });

      const observer = new IntersectionObserver(entries => {
        const entry = entries[0];
        if (!entry) return;
        if (!entry.isIntersecting) {
          hideNews();
          return;
        }
        if (motionArmed) showNews();
        else newsPending = true;
      }, { threshold: 0.22, rootMargin: "0px 0px -10% 0px" });
      observer.observe(newsSection);

      if (newsGrid) {
        new MutationObserver(() => {
          prepareCards(newsGrid, ".ml-news-card");
          if (!newsSection.classList.contains("is-motion-visible")) return;
          newsSection.classList.remove("is-motion-visible");
          requestAnimationFrame(() => requestAnimationFrame(() => {
            newsSection.classList.add("is-motion-visible");
          }));
        }).observe(newsGrid, { childList: true });
      }
    }

    if (conversionSection) {
      let faqPending = false;
      conversionSection.classList.add("ml-faq-motion-ready");
      prepareCards(faqList, ".ml-faq__item");

      const showFaq = () => {
        prepareCards(faqList, ".ml-faq__item");
        clearTimeout(conversionSection._motionSettleTimer);
        conversionSection.classList.remove("is-motion-settled", "is-motion-visible");
        void conversionSection.offsetWidth;
        requestAnimationFrame(() => {
          conversionSection.classList.add("is-motion-visible");
          conversionSection._motionSettleTimer = setTimeout(() => {
            conversionSection.classList.add("is-motion-settled");
          }, 3600);
        });
      };

      const hideFaq = () => {
        clearTimeout(conversionSection._motionSettleTimer);
        faqPending = false;
        conversionSection.classList.remove("is-motion-visible", "is-motion-settled");
      };

      const armFaq = () => {
        if (!faqPending) return;
        faqPending = false;
        showFaq();
      };

      window.addEventListener("wheel", armFaq, { passive: true });
      window.addEventListener("touchmove", armFaq, { passive: true });
      window.addEventListener("keydown", event => {
        if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) {
          armFaq();
        }
      });

      const observer = new IntersectionObserver(entries => {
        const entry = entries[0];
        if (!entry) return;
        if (!entry.isIntersecting) {
          hideFaq();
          return;
        }
        if (motionArmed) showFaq();
        else faqPending = true;
      }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
      observer.observe(conversionSection);
    }

    if (newsletterSection && !isMobile) {
      let newsletterPending = false;
      newsletterSection.classList.add("ml-newsletter-motion-ready");

      const showNewsletter = () => {
        clearTimeout(newsletterSection._motionSettleTimer);
        newsletterSection.classList.remove("is-motion-settled", "is-motion-visible");
        void newsletterSection.offsetWidth;
        requestAnimationFrame(() => {
          newsletterSection.classList.add("is-motion-visible");
          newsletterSection._motionSettleTimer = setTimeout(() => {
            newsletterSection.classList.add("is-motion-settled");
          }, 2200);
        });
      };

      const hideNewsletter = () => {
        clearTimeout(newsletterSection._motionSettleTimer);
        newsletterPending = false;
        newsletterSection.classList.remove("is-motion-visible", "is-motion-settled");
      };

      const armNewsletter = () => {
        if (!newsletterPending) return;
        newsletterPending = false;
        showNewsletter();
      };

      window.addEventListener("wheel", armNewsletter, { passive: true });
      window.addEventListener("touchmove", armNewsletter, { passive: true });
      window.addEventListener("keydown", event => {
        if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) {
          armNewsletter();
        }
      });

      const observer = new IntersectionObserver(entries => {
        const entry = entries[0];
        if (!entry) return;
        if (!entry.isIntersecting) {
          hideNewsletter();
          return;
        }
        if (motionArmed) showNewsletter();
        else newsletterPending = true;
      }, { threshold: 0.22, rootMargin: "0px 0px -10% 0px" });
      observer.observe(newsletterSection);
    }

    const refreshDynamicCards = (container, selector) => {
      if (!container) return;
      new MutationObserver(() => {
        prepareCards(container, selector);
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

    categoriesSections.forEach(section => {
      if (solutionsSection?.contains(section) || section === solutionsSection) return;
      refreshDynamicCards(
        section.querySelector("[data-categories-test-grid]"),
        ".ml-category-card"
      );
    });
  }

  renderSections();
  placePrimarySections();
  placeFeaturedProducts();
  renderCategoriesTest();
  initCategoryCarousels();
  initLineBackgrounds();
  initSolutionsBanner();
  renderCommon();
  window.MacroledProducts.init(root);
  window.MacroledFeatured.init(root);
  window.MacroledProjectLinesConcept.init(root);
  handleVideo();
  animateHeroTitle();
  animateCategoriesTitle();
  initHeroLuminariasRise();
  initSectionMotion();
  initExpandBanners();
  }

  if (initializeHome()) return;

  const observer = new MutationObserver(() => {
    if (!initializeHome()) return;
    observer.disconnect();
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener("DOMContentLoaded", () => {
    if (!initializeHome()) return;
    observer.disconnect();
  }, { once: true });
})(window);


/* ===== Newsletter popup (merged from js/newsletter.js) ===== */

(function () {
  "use strict";

  if (window.__ML_NEWSLETTER_INIT__) return;
  window.__ML_NEWSLETTER_INIT__ = true;

  const DEFAULT_ENDPOINT = "https://n8n.coresagroup.com/webhook/newsletter-macroled";

  const INTEREST_HUBSPOT_MAP = {
    residencial: "residencial",
    proyectos: "obras_y_proyectos",
    arquitectura: "arquitectura"
  };

  function initNewsletter() {
    const popup = document.getElementById("nlPopup");
    const backdrop = document.getElementById("nlBackdrop");
    const form = document.getElementById("nlForm");
    const closeBtn = document.getElementById("nlClose");
    const success = document.getElementById("nlSuccess");
    const errorEl = document.getElementById("nlError");
    const submitBtn = form ? form.querySelector(".nl-submit") : null;
    const interestTabs = form ? form.querySelector("[data-interest-tabs]") : null;

    if (!popup || !form) return;

    let lastTrigger = null;
    let submitting = false;

    const getSelectedInterests = () => {
      if (!interestTabs) return [];
      return Array.prototype.map
        .call(interestTabs.querySelectorAll('.nl-interest-tab[aria-pressed="true"]'), tab => INTEREST_HUBSPOT_MAP[tab.dataset.interest])
        .filter(Boolean);
    };

    const clearInterestTabs = () => {
      if (!interestTabs) return;
      interestTabs.querySelectorAll(".nl-interest-tab").forEach(tab => {
        tab.setAttribute("aria-pressed", "false");
        tab.classList.remove("is-active");
      });
    };

    if (interestTabs) {
      interestTabs.addEventListener("click", event => {
        const tab = event.target.closest(".nl-interest-tab");
        if (!tab || !interestTabs.contains(tab)) return;

        const next = tab.getAttribute("aria-pressed") !== "true";
        tab.setAttribute("aria-pressed", next ? "true" : "false");
        tab.classList.toggle("is-active", next);
        clearError();
      });
    }

    const clearError = () => {
      if (!errorEl) return;
      errorEl.hidden = true;
      errorEl.textContent = "";
    };

    const showError = message => {
      if (!errorEl) return;
      errorEl.textContent = message;
      errorEl.hidden = false;
      errorEl.removeAttribute("hidden");
    };

    const setSubmitting = active => {
      submitting = active;
      if (!submitBtn) return;
      submitBtn.disabled = active;
      submitBtn.classList.toggle("is-loading", active);
      submitBtn.textContent = active ? "Enviando…" : "Suscribirme";
    };

    const showSuccess = () => {
      form.hidden = true;
      popup.classList.add("is-success");
      if (success) {
        success.hidden = false;
        success.removeAttribute("hidden");
      }
    };

    const openPopup = trigger => {
      lastTrigger = trigger || document.activeElement;
      popup.classList.remove("is-success");
      clearError();
      setSubmitting(false);
      if (success) success.hidden = true;
      form.hidden = false;
      if (backdrop) {
        backdrop.hidden = false;
        backdrop.removeAttribute("hidden");
      }
      popup.hidden = false;
      popup.removeAttribute("hidden");
      document.body.classList.add("newsletter-open");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          popup.classList.add("is-open");
          if (backdrop) backdrop.classList.add("is-open");
        });
      });
      const first = popup.querySelector("#nl-nombre");
      if (first) first.focus();
    };

    const closePopup = () => {
      if (submitting) return;
      popup.classList.remove("is-open");
      if (backdrop) backdrop.classList.remove("is-open");
      document.body.classList.remove("newsletter-open");
      const finish = () => {
        popup.hidden = true;
        if (backdrop) backdrop.hidden = true;
        if (lastTrigger && typeof lastTrigger.focus === "function") lastTrigger.focus();
      };
      window.setTimeout(finish, 280);
    };

    document.addEventListener("click", event => {
      const button = event.target.closest("[data-newsletter-open]");
      if (!button) return;

      event.preventDefault();
      openPopup(button);
    });

    if (closeBtn) closeBtn.addEventListener("click", closePopup);
    if (backdrop) backdrop.addEventListener("click", closePopup);

    document.addEventListener("keydown", event => {
      if (event.key !== "Escape") return;
      if (popup.classList.contains("is-open")) closePopup();
    });

    form.addEventListener("submit", async event => {
      event.preventDefault();
      if (submitting) return;

      clearError();

      const emailInput = form.querySelector("#nl-email");
      const consent = form.querySelector("#nl-acepta");
      const email = (emailInput && emailInput.value ? emailInput.value : "").trim();
      const intereses = getSelectedInterests();

      if (!email || (emailInput && typeof emailInput.checkValidity === "function" && !emailInput.checkValidity())) {
        showError("Ingresá un email válido.");
        if (emailInput) emailInput.focus();
        return;
      }

      if (!intereses.length) {
        showError("Seleccioná al menos un área de interés.");
        interestTabs?.querySelector(".nl-interest-tab")?.focus();
        return;
      }

      if (!consent || !consent.checked) {
        showError("Tenés que aceptar recibir el newsletter para continuar.");
        if (consent) consent.focus();
        return;
      }

      const endpoint =
        form.getAttribute("data-newsletter-endpoint") ||
        (window.MACROLED_HOME_CONFIG && window.MACROLED_HOME_CONFIG.newsletterEndpoint) ||
        DEFAULT_ENDPOINT;

      const payload = {
        email,
        intereses,
        acepta_newsletter: true
      };

      setSubmitting(true);

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          let message = "No pudimos completar la suscripción. Intentá de nuevo.";
          try {
            const data = await res.json();
            if (data && data.error) message = data.error;
          } catch (_) {
            /* ignore non-JSON error bodies */
          }
          showError(message);
          setSubmitting(false);
          return;
        }

        form.reset();
        clearInterestTabs();
        setSubmitting(false);
        showSuccess();
      } catch (_) {
        showError("No pudimos conectar con el servidor. Intentá de nuevo.");
        setSubmitting(false);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNewsletter, { once: true });
  } else {
    initNewsletter();
  }
})();

/* Source: home/js/asistente.js */
(function (window) {
  "use strict";

  window.state = window.state || {
    query: "",
    selected: {
      macrofamilia: new Set(),
      familia: new Set(),
      subfamilia: new Set(),
      categoria: new Set(),
      variante_temperatura_filtro: new Set(),
      color: new Set(),
      dimerizable: new Set()
    }
  };

  function newSessionId() {
    return window.crypto && window.crypto.randomUUID
      ? window.crypto.randomUUID()
      : `sid-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  window.MacroledSessionId = window.MacroledSessionId || newSessionId();

  const N8N_WEBHOOK_URL = "https://n8n.coresagroup.com/webhook/macroled-ia";
  const AI_TIMEOUT_MS = 12000;

  function defaultFallbackHtml() {
    return "No pude encontrar información sobre esa consulta en este momento.";
  }

  function init(options) {
    options = options || {};
    const getPayload = typeof options.getPayload === "function" ? options.getPayload : (q) => ({ pregunta: q });
    const localAnswer = typeof options.localAnswer === "function" ? options.localAnswer : null;
    const getSuggestions = typeof options.suggestions === "function" ? options.suggestions : () => [];
    const fallbackHtml = typeof options.fallbackHtml === "function" ? options.fallbackHtml : defaultFallbackHtml;
    const greeting = options.greeting || "Hola, soy el asistente de <b>productos Macroled</b>.";

    const aiLaunch = document.getElementById("aiLaunch");
    const aiPanel = document.getElementById("aiPanel");
    const aiBackdrop = document.getElementById("aiBackdrop");
    const aiMessages = document.getElementById("aiMessages");
    const aiTyping = document.getElementById("aiTyping");
    const aiSuggestions = document.getElementById("aiSuggestions");
    const aiForm = document.getElementById("aiForm");
    const aiInput = document.getElementById("aiInput");
    const aiClose = document.getElementById("aiClose");
    const openFromCta = document.getElementById("openAssistantFromCta");

    if (!aiPanel || !aiForm || !aiMessages) {
      console.warn("[asistente] Faltan elementos del widget en el DOM.");
      return;
    }

    let aiBusy = false;
    let aiLastTrigger = null;
    const usedSuggestions = new Set();
    let askedCount = 0;

    function openAssistant(trigger) {
      aiLastTrigger = trigger || document.activeElement;
      if (aiBackdrop) {
        aiBackdrop.hidden = false;
        aiBackdrop.removeAttribute("hidden");
      }
      aiPanel.hidden = false;
      aiPanel.removeAttribute("hidden");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          aiPanel.classList.add("is-open");
          if (aiBackdrop) aiBackdrop.classList.add("is-open");
        });
      });
      document.body.classList.add("assistant-open");
      try {
        const isTouchUi =
          window.matchMedia("(max-width: 640px)").matches ||
          window.matchMedia("(hover: none) and (pointer: coarse)").matches;
        if (aiInput) {
          if (isTouchUi) aiInput.blur();
          else aiInput.focus();
        }
      } catch (_) {}
    }

    function closeAssistant() {
      aiPanel.classList.remove("is-open");
      if (aiBackdrop) aiBackdrop.classList.remove("is-open");
      document.body.classList.remove("assistant-open");
      setTimeout(() => {
        aiPanel.hidden = true;
        if (aiBackdrop) aiBackdrop.hidden = true;
        if (aiLastTrigger && typeof aiLastTrigger.focus === "function") aiLastTrigger.focus();
      }, 280);
    }

    function linkifyHtml(html) {
      const wrap = document.createElement("div");
      wrap.innerHTML = html;
      function walk(node) {
        if (node.nodeType === 3) {
          const text = node.nodeValue;
          const re = /\b((?:https?:\/\/|www\.)[^\s<]+)/gi;
          if (!re.test(text)) return;
          re.lastIndex = 0;
          const frag = document.createDocumentFragment();
          let last = 0;
          let match;
          while ((match = re.exec(text))) {
            if (match.index > last) {
              frag.appendChild(document.createTextNode(text.slice(last, match.index)));
            }
            let raw = match[1];
            const punct = raw.match(/[),.;:!?]+$/);
            let hrefSrc = raw;
            let extra = "";
            if (punct) {
              hrefSrc = raw.slice(0, -punct[0].length);
              extra = punct[0];
            }
            const a = document.createElement("a");
            a.href = /^https?:\/\//i.test(hrefSrc) ? hrefSrc : "https://" + hrefSrc;
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            a.textContent = hrefSrc;
            frag.appendChild(a);
            if (extra) frag.appendChild(document.createTextNode(extra));
            last = match.index + raw.length;
          }
          if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
          node.parentNode.replaceChild(frag, node);
        } else if (node.nodeType === 1) {
          if (node.tagName === "A") {
            node.setAttribute("target", "_blank");
            node.setAttribute("rel", "noopener noreferrer");
            return;
          }
          Array.prototype.slice.call(node.childNodes).forEach(walk);
        }
      }
      Array.prototype.slice.call(wrap.childNodes).forEach(walk);
      return wrap.innerHTML;
    }

    function addMsg(role, html) {
      const el = document.createElement("div");
      el.className = `ai-msg ${role}`;
      el.innerHTML = `<div class="ai-bubble">${role === "bot" ? linkifyHtml(html) : html}</div>`;
      aiMessages.appendChild(el);
      aiMessages.scrollTop = aiMessages.scrollHeight;
    }

    function renderSuggestions() {
      if (!aiSuggestions) return;
      if (askedCount >= 2) {
        aiSuggestions.innerHTML = "";
        return;
      }
      aiSuggestions.innerHTML = getSuggestions()
        .filter((s) => !usedSuggestions.has(s))
        .map((s) => `<button type="button" class="ai-chip">${s}</button>`)
        .join("");
    }

    async function askAI(question) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
      try {
        const res = await fetch(N8N_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            ...getPayload(question),
            sessionId: window.MacroledSessionId,
          }),
        });
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const item = Array.isArray(data) ? data[0] : data;
        if (item && item.resetSession) window.MacroledSessionId = newSessionId();
        const texto = item && (item.respuesta || item.output || item.answer);
        if (!texto) throw new Error("Respuesta vacía del agente");
        return String(texto).replace(/\n/g, "<br>");
      } catch (err) {
        clearTimeout(timeoutId);
        console.warn("[asistente] error consultando IA:", err);
        return fallbackHtml();
      }
    }

    async function ask(question) {
      const q = question.trim();
      if (!q || aiBusy) return;
      aiBusy = true;
      if (getSuggestions().includes(q)) usedSuggestions.add(q);
      askedCount += 1;
      if (aiSuggestions) aiSuggestions.innerHTML = "";
      addMsg("user", q.replace(/</g, "&lt;"));
      aiTyping.classList.add("is-on");
      aiForm.querySelector(".ai-send").disabled = true;

      let respuesta = localAnswer ? localAnswer(q) : null;
      if (respuesta) {
        await new Promise((r) => setTimeout(r, 300 + Math.random() * 250));
      } else {
        respuesta = await askAI(q);
      }

      aiTyping.classList.remove("is-on");
      addMsg("bot", respuesta);
      renderSuggestions();
      aiForm.querySelector(".ai-send").disabled = false;
      aiBusy = false;
    }

    if (aiLaunch) aiLaunch.addEventListener("click", (e) => openAssistant(e.currentTarget));
    if (openFromCta) openFromCta.addEventListener("click", (e) => openAssistant(e.currentTarget));
    if (aiClose) aiClose.addEventListener("click", closeAssistant);
    if (aiBackdrop) aiBackdrop.addEventListener("click", closeAssistant);

    if (aiSuggestions) {
      aiSuggestions.addEventListener("click", (e) => {
        const chip = e.target.closest(".ai-chip");
        if (chip) ask(chip.textContent);
      });
    }
    aiForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = aiInput.value;
      aiInput.value = "";
      ask(q);
    });

    function getFocusableEls() {
      const selector =
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
      return Array.from(aiPanel.querySelectorAll(selector)).filter(
        (el) => el.offsetParent !== null
      );
    }

    document.addEventListener("keydown", (e) => {
      if (!aiPanel.classList.contains("is-open")) return;
      if (e.key === "Escape") {
        closeAssistant();
        return;
      }
      if (e.key === "Tab") {
        const focusable = getFocusableEls();
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (!aiPanel.contains(document.activeElement)) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    addMsg("bot", greeting);
    renderSuggestions();
    window.MacroledAssistantOpen = openAssistant;
    return { openAssistant, closeAssistant, renderSuggestions, ask };
  }

  window.MacroledAssistant = { init };
})(window);

(function () {
  "use strict";
  if (!window.MacroledAssistant) return;

  function getPayload(question) {
    const s = window.state || {};
    const selected = s.selected || {};
    const filtros = {};
    ["macrofamilia", "familia", "subfamilia", "categoria", "variante_temperatura_filtro", "color", "dimerizable"].forEach((field) => {
      if (selected[field] && selected[field].size) filtros[field] = [...selected[field]];
    });
    return {
      pregunta: question,
      contexto: "asistente-home",
      busqueda: s.query || "",
      filtros,
      sessionId: window.MacroledSessionId,
    };
  }

  window.MacroledAssistant.init({
    greeting: `Hola, soy el asistente de <b>productos Macroled</b>. Preguntame por un producto, SKU o característica y te ayudo a encontrarlo.`,
    getPayload,
    fallbackHtml: () => `No pude encontrar información sobre esa consulta. Probá con otra pregunta o explorá el catálogo.`,
  });

  const launch = document.getElementById("aiLaunch");
  const hero = document.querySelector(".ml-hero");
  if (launch && hero) {
    const syncLaunch = () => {
      const pastCover = window.scrollY > Math.max(80, hero.offsetHeight * 0.38);
      launch.classList.toggle("is-visible", pastCover);
      launch.toggleAttribute("inert", !pastCover);
      launch.setAttribute("aria-hidden", pastCover ? "false" : "true");
    };
    window.addEventListener("scroll", syncLaunch, { passive: true });
    window.addEventListener("resize", syncLaunch);
    syncLaunch();
  }
})();

