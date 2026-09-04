/* =========================================================
   CONFIG
   ========================================================= */
const TS_HOST = "https://typesense.coresagroup.com";
const TS_API_KEY = "g0oiNYY8THGuU9jnCsvqIH1X9HtvYRCR";
const COLLECTION = "Macroled_Prueba";
const PER_PAGE = 18;
const TYPESENSE_PAGE_SIZE = 250;
const TYPESENSE_PAGE_CONCURRENCY = 4;
const DOWNLOADS_CACHE_KEY = "macroled-descargas-v2";
const DOWNLOADS_CACHE_TTL_MS = 5 * 60 * 1000;

// Qué campo del documento de producto corresponde a cada tipo de descarga.
// Si en el futuro sumás páginas/MB por SKU, agregá esos campos acá.
const PRODUCT_DOWNLOAD_FIELDS = [
  { field: "ficha_tecnica", tipo_descarga: "Ficha técnica", tipo_archivo: "PDF" },
  { field: "garantia_link", tipo_descarga: "Garantía",       tipo_archivo: "PDF" },
  { field: "manual",        tipo_descarga: "Manual",         tipo_archivo: "PDF", aliases: ["manual_link", "manuales"] },
  { field: "ies_link",      tipo_descarga: "IES",            tipo_archivo: "IES" },
];

const TIPO_DESCARGA_CATALOGO = "Catálogo";
const CATALOG_QUERY_BY = "nombre_typesense,descripcion,sku";
// Evita transferir todas las especificaciones técnicas de cada producto.
// Esta página sólo necesita estos campos para construir sus cards y filtros.
const PRODUCT_INCLUDE_FIELDS = [
  "id", "nombre_typesense", "descripcion", "sku", "macrofamilia", "subfamilia",
  "variantes_sku", "es_principal", "nuevo", "tipo_registro", "tipo_descarga",
  "multiimagen", "multiimage", "imagen", "imagen_portada",
  "ficha_tecnica", "garantia_link", "manual", "manual_link", "manuales", "ies_link"
].join(",");
const CATALOG_INCLUDE_FIELDS = [
  "id", "nombre_typesense", "nombre", "descripcion", "sku",
  "macrofamilia", "subfamilia", "nuevo", "tipo_registro", "tipo_descarga", "tipo_archivo",
  "archivo", "catalogo", "catalogo_link", "ficha_tecnica", "pdf", "url", "link",
  "paginas", "mb", "multiimagen", "multiimage", "imagen", "imagen_portada"
].join(",");
const TIPO_DESCARGA_ORDER = ["Catálogo", "Ficha técnica", "Manual", "Garantía", "IES"];

const ICON_CHECK = `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
const ICON_DOWNLOAD = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;
const ICON_FILE = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;
const ICON_GRID = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>`;
const ICON_CHEVRON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;
const ICON_FACET_CHEV = `<svg xmlns="http://www.w3.org/2000/svg" height="10" viewBox="0 -960 960 960" width="14" fill="currentColor" aria-hidden="true"><path d="m321-80-71-71 329-329-329-329 71-71 400 400L321-80Z"/></svg>`;

/* Mismo pipeline que productos/comparar: multiimagen a veces viene como JSON
   anidado, a veces como objetos {url}, y el primer ítem puede ser un video.
   Las URLs de CloudFront con fit-in/filters se reescriben a S3 (el archivo
   real) y después se vuelven a pasar por el CDN para el thumbnail. */
const CDN_HOST = "https://d1zltvqju4u8ql.cloudfront.net";

function escAttr(s){
  return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function encodeS3Path(path){
  return String(path || "").split("/").map(seg => {
    try { return encodeURIComponent(decodeURIComponent(seg)); }
    catch(_) { return encodeURIComponent(seg); }
  }).join("/");
}

function sourceImg(url){
  const u = String(url || "").trim();
  if(!u) return "";
  const m = u.match(/cloudfront\.net\/(?:fit-in\/[^/]+\/)?(?:filters:[^/]+\/)?(.+)$/i);
  return m ? `https://s3.coresagroup.com/${m[1]}` : u;
}

function optimizeImg(url, size = "500x500"){
  if(!url) return url;
  if(url.includes("cloudfront.net")) return url;
  const match = url.match(/^https?:\/\/s3\.coresagroup\.com\/(.+)$/);
  if(!match) return url;
  return `${CDN_HOST}/fit-in/${size}/filters:format(webp)/${encodeS3Path(match[1])}`;
}

function imageUrlFromItem(item){
  if(item && typeof item === "object"){
    item = item.url || item.src || item.imagen || item.image || item.href || "";
  }
  let u = String(item || "").trim().replace(/^["'\[]+|["'\]]+$/g, "").trim();
  if(!u || /^null$/i.test(u) || u === "#") return "";
  if(/\.(mp4|webm|mov|m3u8)(\?|#|$)/i.test(u)) return "";
  if(u.startsWith("//")) u = "https:" + u;
  if(!/^https?:\/\//i.test(u)) return "";
  return sourceImg(u);
}

function parseImages(doc){
  if(!doc) return [];
  let raw = doc.multiimagen || doc.multiimage || doc.imagen || doc.imagen_portada;
  for(let i = 0; i < 3 && typeof raw === "string"; i++){
    const t = raw.trim();
    if(!(t.startsWith("[") || t.startsWith("{") || t.startsWith('"'))) break;
    try { raw = JSON.parse(t); } catch(_){ break; }
  }
  let items = [];
  if(Array.isArray(raw)) items = raw;
  else if(raw && typeof raw === "object") items = [raw];
  else if(typeof raw === "string" && raw.trim()){
    items = raw.split(/[;,|]/).map(s => s.trim()).filter(Boolean);
  }
  const urls = [];
  items.forEach(item => {
    const u = imageUrlFromItem(item);
    if(u && !urls.includes(u)) urls.push(u);
  });
  return urls;
}

let allItems = []; // productos + catálogos, ya expandidos a nivel "un descargable = un ítem"

const FACET_FIELDS_UI = ["tipo_descarga", "tipo_archivo", "macrofamilia"];
const FACET_LABELS_UI = { tipo_descarga: "Tipo de descarga", tipo_archivo: "Tipo de archivo", macrofamilia: "Macrofamilia" };
const FACET_ICONS_UI = { tipo_descarga: ICON_DOWNLOAD, tipo_archivo: ICON_FILE, macrofamilia: ICON_GRID };

function isCatalogoTipo(value){
  return /^cat[aá]logos?$/i.test(String(value || "").trim());
}

function isCatalogoItem(it){
  if(!it) return false;
  if(it.origen === "catalogo") return true;
  return (it.descargas || []).some(d => isCatalogoTipo(d.tipo_descarga));
}

function isGeneralItem(it){
  const macro = String((it && it.macrofamilia) || "").trim();
  const nombre = String((it && it.nombre) || "").trim();
  return /^general$/i.test(macro) || /\bgeneral\b/i.test(nombre);
}

const CATALOGO_ORDER = [
  "general", "proyectos", "skyline", "lineales pro", "interruptores y tomas",
  "monaco", "lima", "tiras y perfiles", "inalambricas"
];

function normalizedOrderText(value){
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function catalogoOrderIndex(it){
  const searchable = `${normalizedOrderText(it?.macrofamilia)} ${normalizedOrderText(it?.nombre)}`;
  const index = CATALOGO_ORDER.findIndex(label => searchable.includes(label));
  return index === -1 ? CATALOGO_ORDER.length : index;
}

function isCatalogDoc(doc){
  if(!doc) return false;
  const registro = String(doc.tipo_registro || "").trim().toLowerCase();
  if(registro === "catalogo" || registro === "catálogo") return true;
  const tipo = doc.tipo_descarga;
  if(Array.isArray(tipo)) return tipo.some(isCatalogoTipo);
  return isCatalogoTipo(tipo);
}

function catalogFileUrl(doc){
  const candidates = [
    doc.archivo, doc.catalogo, doc.catalogo_link, doc.ficha_tecnica,
    doc.pdf, doc.url, doc.link
  ];
  for(const raw of candidates){
    const url = String(raw || "").trim();
    if(url && url !== "#" && url.toLowerCase() !== "null") return url;
  }
  return "";
}

function fileTypeFromUrl(url, fallback){
  const m = String(url || "").toLowerCase().match(/\.([a-z0-9]+)(?:\?|#|$)/);
  if(!m) return fallback || "PDF";
  if(m[1] === "ies") return "IES";
  if(m[1] === "pdf") return "PDF";
  return m[1].toUpperCase();
}

function compareDescargables(a, b){
  const ac = isCatalogoItem(a) ? 0 : 1;
  const bc = isCatalogoItem(b) ? 0 : 1;
  if(ac !== bc) return ac - bc;
  if(ac === 0){
    const orderDiff = catalogoOrderIndex(a) - catalogoOrderIndex(b);
    if(orderDiff) return orderDiff;
    return String(a.nombre || "").localeCompare(String(b.nombre || ""), "es", { sensitivity: "base" });
  }
  return 0;
}

function sortDescargables(list){
  return [...list].sort(compareDescargables);
}

function sortFacetEntries(field, entries){
  if(field === "tipo_descarga"){
    return entries.sort((a, b) => {
      const ia = TIPO_DESCARGA_ORDER.indexOf(a[0]);
      const ib = TIPO_DESCARGA_ORDER.indexOf(b[0]);
      const da = ia === -1 ? 99 : ia;
      const db = ib === -1 ? 99 : ib;
      if(da !== db) return da - db;
      return b[1] - a[1];
    });
  }
  if(field === "macrofamilia"){
    return entries.sort((a, b) => {
      const ag = /^general$/i.test(a[0]) ? 0 : 1;
      const bg = /^general$/i.test(b[0]) ? 0 : 1;
      if(ag !== bg) return ag - bg;
      return b[1] - a[1];
    });
  }
  return entries.sort((a, b) => b[1] - a[1]);
}

function mergeUniqueDocs(groups){
  const seen = new Set();
  const out = [];
  groups.flat().forEach(doc => {
    if(!doc) return;
    const id = String(doc.id || doc.sku || doc.nombre_typesense || JSON.stringify(doc));
    if(seen.has(id)) return;
    seen.add(id);
    out.push(doc);
  });
  return out;
}

const state = {
  query: "",
  selected: { tipo_descarga: new Set(), tipo_archivo: new Set(), macrofamilia: new Set() },
  pending: { tipo_descarga: new Set(), tipo_archivo: new Set(), macrofamilia: new Set() },
  pendingSortBy: "",
  sortBy: "",
  view: "grid",
  page: 1,
  facetOpen: { tipo_descarga: true, tipo_archivo: false, macrofamilia: false }
};

function typesenseSearchParams(filterBy, queryBy, includeFields, page){
  const params = {
    q: "*",
    query_by: queryBy,
    filter_by: filterBy,
    per_page: String(TYPESENSE_PAGE_SIZE),
    page: String(page)
  };
  if(includeFields) params.include_fields = includeFields;
  return params;
}

async function fetchDocsPage(filterBy, queryBy, includeFields, page){
  const params = typesenseSearchParams(filterBy, queryBy, includeFields, page);
  const res = await fetch(`${TS_HOST}/collections/${COLLECTION}/documents/search?` + new URLSearchParams(params), {
    headers: { "X-TYPESENSE-API-KEY": TS_API_KEY }
  });
  if(!res.ok) throw new Error(`Typesense (${filterBy}) página ${page}: ${res.status}`);
  return res.json();
}

// Trae todos los documentos, pero después de conocer el total descarga las
// páginas restantes en paralelo (con concurrencia acotada para no saturar API).
async function fetchAllDocs(filterBy, queryBy, includeFields){
  const first = await fetchDocsPage(filterBy, queryBy, includeFields, 1);
  const totalPages = Math.ceil((Number(first.found) || 0) / TYPESENSE_PAGE_SIZE);
  const pages = new Array(totalPages);
  pages[0] = (first.hits || []).map(hit => hit.document);
  if(totalPages <= 1) return pages[0] || [];

  let nextPage = 2;
  async function worker(){
    while(nextPage <= totalPages){
      const page = nextPage++;
      const data = await fetchDocsPage(filterBy, queryBy, includeFields, page);
      pages[page - 1] = (data.hits || []).map(hit => hit.document);
    }
  }
  const workers = Math.min(TYPESENSE_PAGE_CONCURRENCY, totalPages - 1);
  await Promise.all(Array.from({ length: workers }, () => worker()));
  return pages.flat();
}

async function fetchAllDocsSafe(filterBy, queryBy, includeFields){
  try{
    return await fetchAllDocs(filterBy, queryBy, includeFields);
  }catch(err){
    if(includeFields){
      try{ return await fetchAllDocs(filterBy, queryBy); }
      catch(_){ /* sigue al warn de abajo */ }
    }
    console.warn("Descargas: no se pudo cargar", filterBy, err);
    return [];
  }
}

let initialPreloadDone = false;
function finishInitialPreload(){
  if(initialPreloadDone) return;
  initialPreloadDone = true;
  if(window.MacroledPreload) window.MacroledPreload.done();
}

function readDownloadsCache(){
  try{
    const cached = JSON.parse(sessionStorage.getItem(DOWNLOADS_CACHE_KEY) || "null");
    if(!cached || !Array.isArray(cached.items) || Date.now() - cached.savedAt > DOWNLOADS_CACHE_TTL_MS) return null;
    return cached.items;
  }catch(_){
    return null;
  }
}

function writeDownloadsCache(items){
  try{
    sessionStorage.setItem(DOWNLOADS_CACHE_KEY, JSON.stringify({ savedAt: Date.now(), items }));
  }catch(_){
    // La carga sigue funcionando aunque el navegador bloquee o llene el storage.
  }
}

async function loadAllDescargables(){
  document.getElementById("showingLabel").textContent = "Cargando…";
  const cachedItems = readDownloadsCache();
  if(cachedItems){
    allItems = cachedItems;
    render();
    finishInitialPreload();
    return;
  }
  try{
    const [productosRaw, porTipo] = await Promise.all([
      fetchAllDocs("tipo_registro:=producto", "nombre_typesense,descripcion,sku", PRODUCT_INCLUDE_FIELDS),
      fetchAllDocsSafe(`tipo_descarga:=${TIPO_DESCARGA_CATALOGO}`, CATALOG_QUERY_BY, CATALOG_INCLUDE_FIELDS)
    ]);

    const catalogos = mergeUniqueDocs([
      porTipo,
      productosRaw.filter(isCatalogDoc)
    ]);
    const productos = productosRaw.filter(doc => !isCatalogDoc(doc));

    allItems = sortDescargables([
      ...expandCatalogos(catalogos),
      ...expandProductos(productos)
    ]);
    writeDownloadsCache(allItems);
    render();
  }catch(err){
    console.error("Error cargando descargables:", err);
    document.getElementById("grid").innerHTML = `<div class="state-msg">No se pudo conectar con Typesense. ${err.message}</div>`;
    document.getElementById("grid").setAttribute("aria-busy", "false");
    document.getElementById("showingLabel").textContent = "Error al cargar";
  }finally{
    finishInitialPreload();
  }
}

function parseVariantesSku(raw, ownSku){
  if(!raw) return [];
  const arr = Array.isArray(raw) ? raw : String(raw).split(/[;,]/);
  return arr.map(s => (s || "").trim()).filter(s => s && s !== ownSku);
}

function agruparPorVariantes(items){
  const bySku = new Map(items.map(it => [it.sku, it]));
  const visitados = new Set();
  const grupos = [];

  items.forEach(it => {
    if(!it.sku || visitados.has(it.sku)) return;
    const skusDelGrupo = new Set();
    const stack = [it.sku];
    while(stack.length){
      const s = stack.pop();
      if(skusDelGrupo.has(s)) continue;
      skusDelGrupo.add(s);
      const doc = bySku.get(s);
      if(doc) (doc.variantesSku || []).forEach(v => stack.push(v));
    }
    skusDelGrupo.forEach(s => visitados.add(s));
    grupos.push([...skusDelGrupo].map(s => bySku.get(s)).filter(Boolean));
  });

  return grupos.map(fusionarGrupoDeVariantes);
}

function fusionarGrupoDeVariantes(docs){
  if(docs.length === 1) return docs[0];

  const base = docs[0];
  const todosSku = docs.map(d => d.sku).filter(Boolean);

  const descargasPorTipo = {};
  docs.forEach(doc => {
    doc.descargas.forEach(d => {
      if(!descargasPorTipo[d.tipo_descarga]) descargasPorTipo[d.tipo_descarga] = d;
    });
  });

  const ordenados = [...docs].sort((a, b) => (b.esPrincipal ? 1 : 0) - (a.esPrincipal ? 1 : 0));
  const imagenes = [];
  ordenados.forEach(doc => {
    (doc.imagenes || (doc.imagen ? [doc.imagen] : [])).forEach(u => {
      if(u && !imagenes.includes(u)) imagenes.push(u);
    });
  });

  return {
    origen: "producto",
    nombre: base.nombre,
    descripcion: base.descripcion,
    sku: base.sku,
    variantesSku: todosSku.filter(s => s !== base.sku),
    macrofamilia: base.macrofamilia,
    subfamilia: base.subfamilia,
    nuevo: docs.some(d => d.nuevo),
    imagen: imagenes[0] || null,
    imagenes,
    descargas: Object.values(descargasPorTipo),
    _active: 0
  };
}

// Cada producto es UNA card con todas sus descargas disponibles adentro
// (no una card por tipo). "descargas" guarda solo los tipos que tienen URL cargada.
function expandProductos(productos){
  const items = productos.map(doc => {
    const descargas = PRODUCT_DOWNLOAD_FIELDS
      .map(({ field, aliases, tipo_descarga, tipo_archivo }) => {
        const raw = doc[field] || (aliases || []).map(a => doc[a]).find(Boolean) || "";
        const url = String(raw).trim();
        if(!url || url === "#" || url.toLowerCase() === "null") return null;
        return { tipo_descarga, tipo_archivo, url, paginas: null, mb: null };
      })
      .filter(Boolean);

    const imgs = parseImages(doc);

    return {
      origen: "producto",
      nombre: doc.nombre_typesense, descripcion: doc.descripcion || "",
      sku: doc.sku, macrofamilia: doc.macrofamilia, subfamilia: doc.subfamilia || null,
      variantesSku: parseVariantesSku(doc.variantes_sku, doc.sku),
      esPrincipal: doc.es_principal === true || doc.es_principal === "true",
      nuevo: !!doc.nuevo,
      imagen: imgs[0] || null,
      imagenes: imgs,
      descargas,
      _active: 0
    };
  });

  return agruparPorVariantes(items).filter(it => it.descargas.length > 0);
}

// NOTA: los documentos de catálogo se identifican por tipo_descarga = Catálogo
// o tipo_registro = catalogo. El archivo puede venir en varios campos (archivo,
// catalogo, ficha_tecnica, etc.) según cómo esté mapeado Airtable → Typesense.
function expandCatalogos(catalogos){
  return catalogos.map(doc => {
    const url = catalogFileUrl(doc);
    if(!url) return null;
    const imgs = parseImages(doc);
    const portada = imageUrlFromItem(doc.imagen_portada);
    const imagenes = [portada, ...imgs].filter((u, i, arr) => u && arr.indexOf(u) === i);
    const tipo = Array.isArray(doc.tipo_descarga)
      ? (doc.tipo_descarga.find(isCatalogoTipo) || doc.tipo_descarga[0])
      : doc.tipo_descarga;
    return {
      origen: "catalogo",
      nombre: doc.nombre_typesense || doc.nombre || "Catálogo",
      descripcion: doc.descripcion || "",
      sku: doc.sku || null,
      macrofamilia: doc.macrofamilia || "General",
      subfamilia: doc.subfamilia || null,
      nuevo: !!doc.nuevo,
      imagen: imagenes[0] || null,
      imagenes,
      descargas: [{
        tipo_descarga: (isCatalogoTipo(tipo) || !tipo) ? TIPO_DESCARGA_CATALOGO : String(tipo).trim(),
        tipo_archivo: doc.tipo_archivo || fileTypeFromUrl(url, "PDF"),
        url,
        paginas: doc.paginas || null,
        mb: doc.mb || null
      }],
      _active: 0
    };
  }).filter(Boolean);
}

function getSearchFilteredItems(){
  let list = allItems;
  if(!state.query.trim()) return list;

  const q = state.query.trim().toLowerCase();
  const directMatches = list.filter(it =>
    (it.nombre || "").toLowerCase().includes(q) ||
    (it.sku || "").toLowerCase().includes(q) ||
    (it.variantesSku || []).some(v => v.toLowerCase().includes(q)) ||
    (it.descripcion || "").toLowerCase().includes(q)
  );

  const macrosEncontradas = new Set(directMatches.filter(it => it.origen === "producto").map(it => it.macrofamilia));
  const subfamsEncontradas = new Set(directMatches.filter(it => it.origen === "producto" && it.subfamilia).map(it => it.subfamilia));

  const catalogosRelacionados = allItems.filter(it =>
    isCatalogoItem(it) &&
    isCatalogoTipo((it.descargas[0] || {}).tipo_descarga) &&
    !isGeneralItem(it) &&
    macrosEncontradas.has(it.macrofamilia)
  );
  const macrosConSubfamMatch = new Set(
    catalogosRelacionados.filter(c => c.subfamilia && subfamsEncontradas.has(c.subfamilia)).map(c => c.macrofamilia)
  );
  const catalogosFinales = catalogosRelacionados.filter(c =>
    (c.subfamilia && subfamsEncontradas.has(c.subfamilia)) ||
    (!c.subfamilia && !macrosConSubfamMatch.has(c.macrofamilia))
  );

  return [...directMatches, ...catalogosFinales];
}

function applyFacetFilters(list, excludeField, selectedObj){
  const sel = selectedObj || state.selected;
  if(excludeField !== "tipo_descarga" && sel.tipo_descarga.size){
    list = list.filter(it => it.descargas.some(d => sel.tipo_descarga.has(d.tipo_descarga)));
  }
  if(excludeField !== "tipo_archivo" && sel.tipo_archivo.size){
    list = list.filter(it => it.descargas.some(d => sel.tipo_archivo.has(d.tipo_archivo)));
  }
  if(excludeField !== "macrofamilia" && sel.macrofamilia.size){
    list = list.filter(it => sel.macrofamilia.has(it.macrofamilia));
  }
  return list;
}

function getFilteredItems(){
  let list = state.query.trim()
    ? getSearchFilteredItems()
    : applyFacetFilters(getSearchFilteredItems(), null);

  if(state.sortBy === "nuevo"){
    list = [...list].sort((a, b) => {
      const newestDiff = (b.nuevo ? 1 : 0) - (a.nuevo ? 1 : 0);
      if(newestDiff) return newestDiff;
      return compareDescargables(a, b);
    });
  }else{
    list = sortDescargables(list);
  }

  return list;
}

function computeFacetCounts(field, baseList){
  const counts = {};
  const isDescargaField = field === "tipo_descarga" || field === "tipo_archivo";
  baseList.forEach(it => {
    if(isDescargaField){
      const seen = new Set();
      it.descargas.forEach(d => {
        const v = d[field];
        if(!v || seen.has(v)) return;
        seen.add(v);
        counts[v] = (counts[v] || 0) + 1;
      });
    }else{
      const v = it[field];
      if(!v) return;
      counts[v] = (counts[v] || 0) + 1;
    }
  });
  return sortFacetEntries(field, Object.entries(counts));
}

function renderFacets(searchFilteredList){
  const panel = document.getElementById("filtersPanel");
  panel.innerHTML = "";

  const groups = [
    { field: "tipo_descarga", label: "Tipo de descarga", icon: ICON_DOWNLOAD },
    { field: "tipo_archivo",  label: "Tipo de archivo",  icon: ICON_FILE },
    { field: "macrofamilia",  label: "Macrofamilia",     icon: ICON_GRID },
  ];

  groups.forEach(({ field, label, icon }) => {
    const baseParaEsteGrupo = applyFacetFilters(searchFilteredList, field);
    const counts = computeFacetCounts(field, baseParaEsteGrupo);
    const isOpen = state.facetOpen[field] !== false;

    const group = document.createElement("div");
    group.className = "facet-group" + (isOpen ? "" : " collapsed");

    const rowsHtml = counts.map(([value, count]) => {
      const checked = state.selected[field].has(value) ? "checked" : "";
      return `
        <label class="facet-row${state.selected[field].has(value) ? " active" : ""}">
          <span class="cb-wrap">
            <input type="checkbox" data-field="${field}" data-value="${value}" ${checked}>
            <span class="box">${ICON_CHECK}</span>
          </span>
          <span class="facet-label">${value}</span><span class="count">${count}</span>
        </label>
      `;
    }).join("");

    group.innerHTML = `
      <div class="facet-title" data-field="${field}">
        <span class="ft-label">${icon}<span>${label}</span></span><span class="chev">${ICON_FACET_CHEV}</span>
      </div>
      <div class="facet-body">${rowsHtml}</div>
    `;
    panel.appendChild(group);
  });

  panel.querySelectorAll(".facet-title").forEach(title => {
    title.addEventListener("click", () => {
      const field = title.dataset.field;
      state.facetOpen[field] = !(state.facetOpen[field] !== false);
      render();
    });
  });

  panel.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener("click", (e) => e.stopPropagation());
    cb.addEventListener("change", () => {
      const { field, value } = cb.dataset;
      if(cb.checked) state.selected[field].add(value); else state.selected[field].delete(value);
      state.page = 1;
      render();
    });
  });
}

function renderChips(){
  renderFiltersCount();
  const bar = document.getElementById("chipsBar");
  const chips = [];
  ["tipo_descarga", "tipo_archivo", "macrofamilia"].forEach(field => {
    state.selected[field].forEach(v => chips.push({ field, value: v }));
  });
  // La búsqueda no es un filtro aplicado: no debe crear una fila vacía ni
  // mostrar "Borrar filtros" cuando no hay facets seleccionados.
  if(!chips.length){ bar.style.display = "none"; bar.innerHTML = ""; return; }
  bar.style.display = "flex";
  bar.innerHTML = `<div class="chips-row">` +
    chips.map(c => `<span class="chip" data-field="${c.field}" data-value="${c.value}">${c.value}<button type="button" aria-label="Quitar filtro">×</button></span>`).join("") +
    `</div><button type="button" class="clear-btn" id="clearAll">Borrar filtros</button>`;

  bar.querySelectorAll(".chip button").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      state.selected[chip.dataset.field].delete(chip.dataset.value);
      state.page = 1;
      render();
    });
  });
  document.getElementById("clearAll").addEventListener("click", clearAllFilters);
}

function renderFiltersCount(){
  const badge = document.getElementById("filtersCount");
  if(!badge) return;
  const count = FACET_FIELDS_UI.reduce((total, field) => total + state.selected[field].size, 0);
  badge.textContent = String(count);
  badge.hidden = count === 0;
  const label = count ? `Filtros, ${count} aplicado${count === 1 ? "" : "s"}` : "Filtros";
  filtersToggle?.setAttribute("aria-label", label);
  filtersToggle?.setAttribute("title", label);
}

function clearAllFilters(){
  ["tipo_descarga", "tipo_archivo", "macrofamilia"].forEach(f => state.selected[f].clear());
  state.query = "";
  document.getElementById("searchInput").value = "";
  state.page = 1;
  render();
}

let currentPageItems = [];

function cardTemplate(it, idx){
  let activeIdx = it._active || 0;
  if(state.selected.tipo_descarga.size){
    const preferido = it.descargas.findIndex(d => state.selected.tipo_descarga.has(d.tipo_descarga));
    if(preferido !== -1) activeIdx = preferido;
  }
  const activa = it.descargas[activeIdx] || it.descargas[0];

  const seccionTipo = it.descargas.length > 1
    ? `<div class="type-tabs">${it.descargas.map((d, i) =>
        `<button type="button" class="type-tab${i === activeIdx ? " active" : ""}" data-tab="${i}">${escAttr(d.tipo_descarga)}</button>`
      ).join("")}</div>`
    : "";

  const origs = it.imagenes && it.imagenes.length ? it.imagenes : (it.imagen ? [it.imagen] : []);
  const thumb = origs[0] ? optimizeImg(origs[0]) : "";
  const esCatalogo = isCatalogoItem(it);
  const desc = esCatalogo ? String(it.descripcion || "").trim() : "";
  const descHtml = desc && desc.toLowerCase() !== String(it.nombre || "").trim().toLowerCase()
    ? `<p class="card-desc">${escAttr(desc)}</p>`
    : "";

  return `
    <div class="card${esCatalogo ? " card-catalogo" : ""}" data-idx="${idx}">
      <div class="media">
        ${it.nuevo ? `<span class="badge-nuevo">NUEVO</span>` : ""}
        ${thumb
          ? `<img src="${escAttr(thumb)}" alt="${escAttr(it.nombre)}" loading="lazy" decoding="async" data-idx="0" data-origs="${escAttr(JSON.stringify(origs))}">`
          : `<span class="file-icon">${ICON_FILE}</span>`}
      </div>
      <div class="card-body">
        <div class="card-info">
          <div class="card-title">${escAttr(it.nombre)}</div>
          ${!esCatalogo && it.sku ? `<div class="card-sku">SKU: ${escAttr(it.sku)}</div>` : ""}
          ${descHtml}
          ${seccionTipo}
        </div>
        <a class="btn-download" href="${escAttr(activa.url)}" target="_blank" rel="noopener"><span class="btn-icon">${ICON_DOWNLOAD}</span> ${esCatalogo ? "Descargar" : `Descargar ${escAttr(activa.tipo_archivo)}`}</a>
      </div>
    </div>
  `;
}

function renderCards(list){
  const grid = document.getElementById("grid");
  const totalPages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  state.page = Math.min(state.page, totalPages);
  const start = (state.page - 1) * PER_PAGE;
  const pageItems = list.slice(start, start + PER_PAGE);
  currentPageItems = pageItems;

  if(!pageItems.length){
    grid.innerHTML = `<div class="state-msg">No encontramos descargables con estos filtros.</div>`;
    grid.setAttribute("aria-busy", "false");
    return;
  }
  grid.innerHTML = pageItems.map((it, i) => cardTemplate(it, i)).join("");
  grid.querySelectorAll(".media img").forEach(bindImgFallback);
  grid.setAttribute("aria-busy", "false");
  requestAnimationFrame(alignGridTypeTabsByRow);
}

function alignGridTypeTabsByRow(){
  const grid = document.getElementById("grid");
  if(!grid) return;
  const tabs = [...grid.querySelectorAll(".card:not(.card-skel) .type-tabs")];
  tabs.forEach(tab => tab.style.removeProperty("--type-tabs-row-height"));
  if(grid.classList.contains("list")) return;

  const rows = new Map();
  tabs.forEach(tab => {
    const card = tab.closest(".card");
    const rowTop = Math.round(card.offsetTop);
    if(!rows.has(rowTop)) rows.set(rowTop, []);
    rows.get(rowTop).push(tab);
  });

  rows.forEach(rowTabs => {
    const requiredHeight = Math.max(...rowTabs.map(tab => tab.scrollHeight));
    rowTabs.forEach(tab => tab.style.setProperty("--type-tabs-row-height", `${requiredHeight}px`));
  });
}

let alignGridTabsFrame = 0;
window.addEventListener("resize", () => {
  cancelAnimationFrame(alignGridTabsFrame);
  alignGridTabsFrame = requestAnimationFrame(alignGridTypeTabsByRow);
});

function bindImgFallback(img){
  if(!img || img.dataset.fbBound) return;
  img.dataset.fbBound = "1";

  const showFileIcon = () => {
    const icon = document.createElement("span");
    icon.className = "file-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.innerHTML = ICON_FILE;
    img.replaceWith(icon);
  };

  const fail = () => {
    let origs = [];
    try { origs = JSON.parse(img.dataset.origs || "[]"); } catch(_){ origs = []; }
    let idx = Number(img.dataset.idx || 0);
    if(img.dataset.usingOrig !== "1"){
      const orig = origs[idx];
      if(orig && orig !== img.getAttribute("src")){
        img.dataset.usingOrig = "1";
        img.src = orig;
        return;
      }
    }
    idx += 1;
    if(idx < origs.length){
      img.dataset.idx = String(idx);
      img.dataset.usingOrig = "0";
      img.src = optimizeImg(origs[idx]) || origs[idx];
      return;
    }
    showFileIcon();
  };

  img.addEventListener("error", fail);
  if(img.complete && img.naturalWidth === 0 && img.getAttribute("src")) fail();
}

function updateCardActiveTab(cardEl, item){
  const activeIdx = item._active || 0;
  cardEl.querySelectorAll(".type-tab").forEach((btn, i) => btn.classList.toggle("active", i === activeIdx));
  const d = item.descargas[activeIdx];
  const btn = cardEl.querySelector(".btn-download");
  btn.href = d.url;
  btn.innerHTML = `<span class="btn-icon">${ICON_DOWNLOAD}</span> ${isCatalogoItem(item) ? "Descargar" : `Descargar ${d.tipo_archivo}`}`;
}

document.getElementById("grid").addEventListener("click", (e) => {
  const tab = e.target.closest(".type-tab");
  if(!tab) return;
  const cardEl = tab.closest(".card");
  const item = currentPageItems[Number(cardEl.dataset.idx)];
  if(!item) return;
  item._active = Number(tab.dataset.tab);
  updateCardActiveTab(cardEl, item);
});

function buildPageList(current, total){
  const delta = 1;
  const range = [];
  for(let i = 1; i <= total; i++){
    if(i === 1 || i === total || (i >= current - delta && i <= current + delta)) range.push(i);
  }
  const withDots = [];
  let last = 0;
  range.forEach(i => {
    if(last){
      if(i - last === 2) withDots.push(last + 1);
      else if(i - last > 2) withDots.push("...");
    }
    withDots.push(i);
    last = i;
  });
  return withDots;
}

function renderPagination(list){
  const totalPages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const el = document.getElementById("pagination");
  if(totalPages <= 1){ el.innerHTML = ""; return; }

  let html = `<button ${state.page === 1 ? "disabled" : ""} data-p="${state.page - 1}">‹ Anterior</button>`;
  buildPageList(state.page, totalPages).forEach(p => {
    html += p === "..."
      ? `<span class="pagination-dots">…</span>`
      : `<button class="${p === state.page ? "active" : ""}" data-p="${p}">${p}</button>`;
  });
  html += `<button ${state.page === totalPages ? "disabled" : ""} data-p="${state.page + 1}">Siguiente ›</button>`;
  el.innerHTML = html;
  el.querySelectorAll("button[data-p]").forEach(btn => {
    btn.addEventListener("click", () => { state.page = Number(btn.dataset.p); render(); });
  });
}

function render(){
  const list = getFilteredItems();
  renderFacets(getSearchFilteredItems());
  renderChips();
  renderCards(list);
  renderPagination(list);
  const shown = Math.min(PER_PAGE, list.length - (state.page - 1) * PER_PAGE);
  document.getElementById("showingLabel").textContent =
    `${shown} de ${list.length} descargables`;
}

let searchDebounce;
const downloadSearchInput = document.getElementById("searchInput");
const downloadSearchClear = document.getElementById("searchClear");
function syncDownloadSearchClear(){
  if(downloadSearchClear) downloadSearchClear.hidden = !downloadSearchInput.value;
}
downloadSearchInput.addEventListener("input", (e) => {
  syncDownloadSearchClear();
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    state.query = e.target.value;
    state.page = 1;
    render();
  }, 200);
});
downloadSearchClear?.addEventListener("click", () => {
  clearTimeout(searchDebounce);
  downloadSearchInput.value = "";
  state.query = "";
  state.page = 1;
  syncDownloadSearchClear();
  render();
  downloadSearchInput.focus();
});
syncDownloadSearchClear();

document.getElementById("sortSelect").addEventListener("change", (e) => {
  state.sortBy = e.target.value;
  syncSortControl();
  render();
});

const sortDropdown = document.getElementById("sortDropdown");
const sortTrigger = document.getElementById("sortTrigger");
const sortMenu = document.getElementById("sortMenu");
const sortSelect = document.getElementById("sortSelect");

function syncSortControl(){
  if(!sortSelect) return;
  const selectedOption = [...sortSelect.options].find(option => option.value === sortSelect.value);
  document.getElementById("sortCurrent").textContent = sortSelect.value
    ? (selectedOption?.textContent || "Ordenar por")
    : "Ordenar por";
  sortMenu?.querySelectorAll(".sort-option").forEach(option => {
    const active = option.dataset.sort === sortSelect.value;
    option.classList.toggle("active", active);
    option.setAttribute("aria-selected", String(active));
  });
}

function closeSortMenu(){
  sortDropdown?.classList.remove("open");
  if(sortMenu) sortMenu.hidden = true;
  sortTrigger?.setAttribute("aria-expanded", "false");
}

sortTrigger?.addEventListener("click", () => {
  const willOpen = !sortDropdown.classList.contains("open");
  closeSortMenu();
  if(willOpen){
    sortDropdown.classList.add("open");
    sortMenu.hidden = false;
    sortTrigger.setAttribute("aria-expanded", "true");
  }
});
sortMenu?.addEventListener("click", (e) => {
  const option = e.target.closest(".sort-option");
  if(!option) return;
  sortSelect.value = option.dataset.sort;
  sortSelect.dispatchEvent(new Event("change", { bubbles:true }));
  closeSortMenu();
});
document.addEventListener("click", (e) => {
  if(sortDropdown && !sortDropdown.contains(e.target)) closeSortMenu();
});
document.addEventListener("keydown", (e) => {
  if(e.key === "Escape") closeSortMenu();
});
syncSortControl();
function applyDownloadsView(view){
  state.view = view === "list" ? "list" : "grid";
  document.getElementById("grid").classList.toggle("list", state.view === "list");
  document.getElementById("btnGrid").classList.toggle("active", state.view === "grid");
  document.getElementById("btnList").classList.toggle("active", state.view === "list");
  if(state.view === "grid") requestAnimationFrame(alignGridTypeTabsByRow);
}
document.getElementById("btnGrid").addEventListener("click", () => applyDownloadsView("grid"));
document.getElementById("btnList").addEventListener("click", () => applyDownloadsView("list"));

const filtersAside = document.getElementById("filtersAside");
const filtersBackdrop = document.getElementById("filtersBackdrop");
const filtersToggle = document.getElementById("filtersToggle");
const filtersClose = document.getElementById("filtersClose");
const filtersApply = document.getElementById("filtersApply");
const filtersCollapseBtn = document.getElementById("filtersCollapseBtn");
const filtersExpandBtn = document.getElementById("filtersExpandBtn");
const layoutEl = document.getElementById("layout") || document.querySelector(".layout");
const FILTERS_COLLAPSED_KEY = "macroled-descargas-filters-collapsed";

function setFiltersCollapsed(collapsed){
  if(!layoutEl) return;
  layoutEl.classList.toggle("filters-collapsed", !!collapsed);
  try{ localStorage.setItem(FILTERS_COLLAPSED_KEY, collapsed ? "1" : "0"); }catch(_){}
}
function initFiltersCollapsed(){
  setFiltersCollapsed(false);
}

function syncPendingFromCommitted(){
  FACET_FIELDS_UI.forEach(f => { state.pending[f] = new Set(state.selected[f]); });
  state.pendingSortBy = state.sortBy;
}

function openFiltersDrawer(){
  syncPendingFromCommitted();
  filtersAside.classList.add("open");
  filtersAside.setAttribute("aria-hidden", "false");
  filtersBackdrop.classList.add("open");
  document.body.style.overflow = "hidden";
  goToListScreen();
  renderMobileFilters();
  updatePendingResultsCount();
}
function closeFiltersDrawer(){
  filtersAside.classList.remove("open");
  filtersAside.setAttribute("aria-hidden", "true");
  filtersBackdrop.classList.remove("open");
  document.body.style.overflow = "";
}
filtersToggle.addEventListener("click", openFiltersDrawer);
filtersClose.addEventListener("click", closeFiltersDrawer);
filtersBackdrop.addEventListener("click", closeFiltersDrawer);
if(filtersCollapseBtn){
  filtersCollapseBtn.addEventListener("click", () => setFiltersCollapsed(true));
}
if(filtersExpandBtn){
  filtersExpandBtn.addEventListener("click", () => setFiltersCollapsed(false));
}
initFiltersCollapsed();
filtersApply.addEventListener("click", () => {
  FACET_FIELDS_UI.forEach(f => { state.selected[f] = new Set(state.pending[f]); });
  state.sortBy = state.pendingSortBy;
  document.getElementById("sortSelect").value = state.sortBy;
  syncSortControl();
  state.page = 1;
  render();
  closeFiltersDrawer();
});
document.getElementById("fmnBack").addEventListener("click", goToListScreen);

function goToListScreen(){
  document.getElementById("fmnDetail").classList.remove("active");
  document.getElementById("fmnList").classList.add("active");
}

function fmnSummary(field){
  const set = state.pending[field];
  if(!set || !set.size) return "";
  return [...set].join(", ");
}

function currentSortLabel(){
  const select = document.getElementById("sortSelect");
  const opt = [...select.options].find(o => o.value === state.pendingSortBy);
  return opt ? opt.textContent : "Predeterminado";
}

function renderMobileFilters(){
  const listEl = document.getElementById("fmnList");
  const searchFiltered = getSearchFilteredItems();

  const rows = [];

  FACET_FIELDS_UI.forEach(field => {
    const baseParaEsteGrupo = applyFacetFilters(searchFiltered, field, state.pending);
    const counts = computeFacetCounts(field, baseParaEsteGrupo);
    rows.push({ field, label: FACET_LABELS_UI[field], summary: fmnSummary(field), counts, type: "filter" });
  });

  rows.push(
    { field: "sort", label: "Ordenar por", summary: currentSortLabel(), type: "secondary", secondaryStart: true },
    { field: "view", label: "Tipo de vista", summary: state.view === "list" ? "Lista" : "Grilla", type: "secondary" }
  );

  listEl.innerHTML = rows.map(r => `
    <div class="fmn-row${r.type === "secondary" ? " fmn-secondary-row" : ""}${r.secondaryStart ? " fmn-secondary-start" : ""}" data-field="${r.field}">
      <span class="fmn-row-label">${r.type === "filter" ? FACET_ICONS_UI[r.field] : ""}<span>${r.label}${r.type === "filter" && state.pending[r.field].size ? `<span class="fmn-active-count">(${state.pending[r.field].size})</span>` : ""}</span></span>
      <span class="fmn-row-meta">${r.summary ? `<span>${r.summary}</span>` : ""}<span class="fmn-chev">${ICON_CHEVRON}</span></span>
    </div>
  `).join("");

  listEl.querySelectorAll(".fmn-row").forEach(row => {
    row.addEventListener("click", () => openDetailScreen(row.dataset.field));
  });
}

function openDetailScreen(field){
  const titleEl = document.getElementById("fmnDetailTitle");
  const bodyEl = document.getElementById("fmnDetailBody");

  if(field === "view"){
    titleEl.textContent = "Tipo de vista";
    const options = [
      { value: "grid", label: "Grilla", icon: "▦" },
      { value: "list", label: "Lista", icon: "☰" }
    ];
    bodyEl.innerHTML = options.map(o => `
      <div class="fmn-option-row${state.view === o.value ? " active" : ""}" data-value="${o.value}">
        <span class="fmn-radio"></span><span>${o.label}</span>
        <span class="fmn-view-option-icon" aria-hidden="true">${o.icon}</span>
      </div>
    `).join("");
    bodyEl.querySelectorAll(".fmn-option-row").forEach(row => {
      row.addEventListener("click", () => {
        applyDownloadsView(row.dataset.value);
        closeFiltersDrawer();
      });
    });
    document.getElementById("fmnList").classList.remove("active");
    document.getElementById("fmnDetail").classList.add("active");
    return;
  }

  if(field === "sort"){
    titleEl.textContent = "Ordenar por";
    const select = document.getElementById("sortSelect");
    const options = [...select.options];
    bodyEl.innerHTML = options.map(o => `
      <div class="fmn-option-row${state.pendingSortBy === o.value ? " active" : ""}" data-value="${o.value}">
        <span class="fmn-radio"></span><span>${o.textContent}</span>
      </div>
    `).join("");
    bodyEl.querySelectorAll(".fmn-option-row").forEach(row => {
      row.addEventListener("click", () => {
        const val = row.dataset.value;
        state.pendingSortBy = val;
        select.value = val;
        select.dispatchEvent(new Event("change", { bubbles:true }));
        closeFiltersDrawer();
      });
    });
    document.getElementById("fmnList").classList.remove("active");
    document.getElementById("fmnDetail").classList.add("active");
    return;
  }

  titleEl.textContent = FACET_LABELS_UI[field];
  const searchFiltered = getSearchFilteredItems();
  const baseParaEsteGrupo = applyFacetFilters(searchFiltered, field, state.pending);
  const counts = computeFacetCounts(field, baseParaEsteGrupo);

  bodyEl.innerHTML = counts.map(([value, count]) => {
    const checked = state.pending[field].has(value);
    return `
      <div class="fmn-option-row${checked ? " active" : ""}" data-value="${value}">
        <span class="fmn-checkbox">${checked ? ICON_CHECK : ""}</span>
        <span>${value}</span><span class="fmn-count">${count}</span>
      </div>
    `;
  }).join("");

  bodyEl.querySelectorAll(".fmn-option-row").forEach(row => {
    row.addEventListener("click", () => {
      const val = row.dataset.value;
      if(state.pending[field].has(val)) state.pending[field].delete(val);
      else state.pending[field].add(val);
      renderMobileFilters();
      openDetailScreen(field);
      updatePendingResultsCount();
    });
  });

  document.getElementById("fmnList").classList.remove("active");
  document.getElementById("fmnDetail").classList.add("active");
}

function updatePendingResultsCount(){
  const filtered = applyFacetFilters(getSearchFilteredItems(), null, state.pending);
  filtersApply.textContent = `Ver ${filtered.length} resultado${filtered.length === 1 ? "" : "s"}`;
}

loadAllDescargables();

/* =========================================================
   ASISTENTE — mismo motor que el home/catálogo
   ========================================================= */
(function () {
  "use strict";

  const N8N_WEBHOOK_URL = "https://n8n.coresagroup.com/webhook/macroled-ia";
  const AI_TIMEOUT_MS = 12000;

  /* Id de sesión: uno por carga de página, solo en memoria. Al refrescar
     arranca conversación nueva. Si el webhook responde resetSession,
     se genera uno nuevo al toque. */
  function newSessionId() {
    return window.crypto && window.crypto.randomUUID
      ? window.crypto.randomUUID()
      : `sid-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  window.MacroledSessionId = window.MacroledSessionId || newSessionId();

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

    if (!aiPanel || !aiForm || !aiMessages) {
      console.warn("[asistente] Faltan elementos del widget en el DOM — no se inicializa.");
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
})();

(function () {
  "use strict";
  if (!window.MacroledAssistant) return;

  function getPayload(question) {
    const s = typeof state !== "undefined" ? state : {};
    const selected = s.selected || {};
    const filtros = {};
    ["tipo_descarga", "tipo_archivo", "macrofamilia"].forEach((field) => {
      if (selected[field] && selected[field].size) filtros[field] = [...selected[field]];
    });
    return {
      pregunta: question,
      contexto: "descargas",
      busqueda: s.query || "",
      filtros,
      sessionId: window.MacroledSessionId,
    };
  }

  try {
    window.MacroledAssistant.init({
      greeting: `Hola, soy el asistente de <b>productos Macroled</b>. Preguntame por un producto o su documentación técnica.`,
      getPayload,
      fallbackHtml: () =>
        `No pude responder esa consulta técnica. Probá reformular la pregunta o revisá la ficha / manual del producto.`,
    });
  } catch (err) {
    console.error("[asistente-descargas] no se pudo inicializar:", err);
  }
})();
