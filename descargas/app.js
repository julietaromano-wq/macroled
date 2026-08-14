/* =========================================================
   CONFIG
   ========================================================= */
const TS_HOST = "https://typesense.coresagroup.com";
const TS_API_KEY = "g0oiNYY8THGuU9jnCsvqIH1X9HtvYRCR";
const COLLECTION = "Macroled_Prueba";
const PER_PAGE = 18;

// Qué campo del documento de producto corresponde a cada tipo de descarga.
// Si en el futuro sumás páginas/MB por SKU, agregá esos campos acá.
const PRODUCT_DOWNLOAD_FIELDS = [
  { field: "ficha_tecnica", tipo_descarga: "Ficha técnica", tipo_archivo: "PDF" },
  { field: "garantia_link", tipo_descarga: "Garantía",       tipo_archivo: "PDF" },
  { field: "manual",        tipo_descarga: "Manual",         tipo_archivo: "PDF", aliases: ["manual_link", "manuales"] },
  { field: "ies_link",      tipo_descarga: "IES",            tipo_archivo: "IES" },
];

// Valor real de tipo_registro para los documentos de catálogos/manuales
// (todavía sin subir a Typesense — hoy esta rama no trae resultados, pero
// queda lista para cuando existan esos documentos).
const TIPO_REGISTRO_CATALOGO = "catalogo";

const ICON_CHECK = `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
const ICON_DOWNLOAD = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;
const ICON_FILE = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;
const ICON_GRID = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>`;
const ICON_CHEVRON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;

let allItems = []; // productos + catálogos, ya expandidos a nivel "un descargable = un ítem"

const FACET_FIELDS_UI = ["tipo_descarga", "tipo_archivo", "macrofamilia"];
const FACET_LABELS_UI = { tipo_descarga: "Tipo de descarga", tipo_archivo: "Tipo de archivo", macrofamilia: "Macrofamilia" };

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

// Trae TODOS los documentos que matcheen el filtro, paginando automáticamente.
async function fetchAllDocs(filterBy, queryBy){
  const perPage = 250;
  let page = 1;
  let allDocs = [];
  while(true){
    const res = await fetch(`${TS_HOST}/collections/${COLLECTION}/documents/search?` + new URLSearchParams({
      q: "*",
      query_by: queryBy,
      filter_by: filterBy,
      per_page: String(perPage),
      page: String(page)
    }), { headers: { "X-TYPESENSE-API-KEY": TS_API_KEY } });

    if(!res.ok) throw new Error(`Typesense (${filterBy}) página ${page}: ${res.status}`);
    const data = await res.json();
    const docs = data.hits.map(h => h.document);
    allDocs = allDocs.concat(docs);

    if(docs.length < perPage) break;
    page++;
  }
  return allDocs;
}

async function loadAllDescargables(){
  document.getElementById("showingLabel").textContent = "Cargando…";
  try{
    const [productos, catalogos] = await Promise.all([
      fetchAllDocs("tipo_registro:=producto", "nombre_typesense,descripcion,sku"),
      fetchAllDocs(`tipo_registro:=${TIPO_REGISTRO_CATALOGO}`, "nombre_typesense")
    ]);

    allItems = [...expandCatalogos(catalogos), ...expandProductos(productos)];
    render();
  }catch(err){
    console.error("Error cargando descargables:", err);
    document.getElementById("grid").innerHTML = `<div class="state-msg">No se pudo conectar con Typesense. ${err.message}</div>`;
    document.getElementById("showingLabel").textContent = "Error al cargar";
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

  return {
    origen: "producto",
    nombre: base.nombre,
    descripcion: base.descripcion,
    sku: base.sku,
    variantesSku: todosSku.filter(s => s !== base.sku),
    macrofamilia: base.macrofamilia,
    subfamilia: base.subfamilia,
    nuevo: docs.some(d => d.nuevo),
    imagen: base.imagen,
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

    // multiimagen es un string con un array JSON adentro (o una lista separada
    // por comas/pipes) — no hay campo "imagen" suelto en el schema.
    let imgs = [];
    if(doc.multiimagen){
      try{
        const parsed = JSON.parse(doc.multiimagen);
        if(Array.isArray(parsed)) imgs = parsed;
      }catch(_){
        imgs = doc.multiimagen.split(/[,|]/).map(s => s.trim()).filter(Boolean);
      }
    }

    return {
      origen: "producto",
      nombre: doc.nombre_typesense, descripcion: doc.descripcion || "",
      sku: doc.sku, macrofamilia: doc.macrofamilia, subfamilia: doc.subfamilia || null,
      variantesSku: parseVariantesSku(doc.variantes_sku, doc.sku),
      nuevo: !!doc.nuevo,
      imagen: imgs[0] || null,
      descargas,
      _active: 0
    };
  });

  return agruparPorVariantes(items).filter(it => it.descargas.length > 0);
}

// NOTA: los documentos de catálogos/manuales todavía no están en Typesense.
// Los nombres de campo de abajo (imagen_portada, tipo_descarga, tipo_archivo,
// archivo, paginas, mb) son un supuesto de diseño, sin confirmar contra un
// schema real — hay que revisarlos junto con el mapeo Airtable → Typesense
// cuando se suba esa hoja, antes de asumir que van a funcionar tal cual.
function expandCatalogos(catalogos){
  return catalogos.map(doc => ({
    origen: "catalogo",
    nombre: doc.nombre_typesense, descripcion: doc.descripcion || "",
    sku: null, macrofamilia: doc.macrofamilia, subfamilia: doc.subfamilia || null,
    nuevo: !!doc.nuevo,
    imagen: doc.imagen_portada || null,
    descargas: [{
      tipo_descarga: doc.tipo_descarga,
      tipo_archivo: doc.tipo_archivo || "PDF",
      url: doc.archivo,
      paginas: doc.paginas || null,
      mb: doc.mb || null
    }],
    _active: 0
  }));
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
    it.origen === "catalogo" &&
    it.descargas[0].tipo_descarga === "Catálogo" &&
    it.macrofamilia !== "General" &&
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
  let list = applyFacetFilters(getSearchFilteredItems(), null);

  if(state.sortBy === "nuevo"){
    list = [...list].sort((a, b) => (b.nuevo ? 1 : 0) - (a.nuevo ? 1 : 0));
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
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
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
        <span class="ft-label">${icon}<span>${label}</span></span><span class="chev">⌃</span>
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
  const bar = document.getElementById("chipsBar");
  const chips = [];
  ["tipo_descarga", "tipo_archivo", "macrofamilia"].forEach(field => {
    state.selected[field].forEach(v => chips.push({ field, value: v }));
  });
  if(!chips.length && !state.query){ bar.style.display = "none"; return; }
  bar.style.display = "flex";
  bar.innerHTML = `<span class="label">Filtros activados</span>` +
    chips.map(c => `<span class="chip" data-field="${c.field}" data-value="${c.value}">${c.value}<button>×</button></span>`).join("") +
    `<button class="clear-btn" id="clearAll">Limpiar filtros</button>`;

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
        `<button type="button" class="type-tab${i === activeIdx ? " active" : ""}" data-tab="${i}">${d.tipo_descarga}</button>`
      ).join("")}</div>`
    : "";

  return `
    <div class="card" data-idx="${idx}">
      <div class="media">
        ${it.nuevo ? `<span class="badge-nuevo">NUEVO</span>` : ""}
        ${it.imagen ? `<img src="${it.imagen}" alt="${it.nombre}">` : `<span class="file-icon">${ICON_FILE}</span>`}
      </div>
      <div class="card-body">
        <div class="card-info">
          <div class="card-title">${it.nombre}</div>
          ${seccionTipo}
        </div>
        <a class="btn-download" href="${activa.url}" target="_blank"><span class="btn-icon">${ICON_DOWNLOAD}</span> Descargar ${activa.tipo_archivo}</a>
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
    return;
  }
  grid.innerHTML = pageItems.map((it, i) => cardTemplate(it, i)).join("");
}

function updateCardActiveTab(cardEl, item){
  const activeIdx = item._active || 0;
  cardEl.querySelectorAll(".type-tab").forEach((btn, i) => btn.classList.toggle("active", i === activeIdx));
  const d = item.descargas[activeIdx];
  const btn = cardEl.querySelector(".btn-download");
  btn.href = d.url;
  btn.innerHTML = `<span class="btn-icon">${ICON_DOWNLOAD}</span> Descargar ${d.tipo_archivo}`;
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

function renderMobileCategoryHeading(count){
  const holder = document.getElementById("mobileCategoryHeading");
  const activeMacro = [...state.selected.macrofamilia][0];
  const activeTipo = [...state.selected.tipo_descarga][0];
  const titulo = state.query ? `Resultados para "${state.query}"` : (activeMacro || activeTipo || "");

  if(!titulo){
    holder.classList.remove("active");
    holder.innerHTML = "";
    return;
  }
  holder.classList.add("active");
  holder.innerHTML = `<h1>${titulo}</h1><div class="count">${count} resultados</div>`;
}

function render(){
  const list = getFilteredItems();
  renderFacets(getSearchFilteredItems());
  renderChips();
  renderCards(list);
  renderPagination(list);
  renderMobileCategoryHeading(list.length);
  const shown = Math.min(PER_PAGE, list.length - (state.page - 1) * PER_PAGE);
  document.getElementById("showingLabel").innerHTML =
    `<span class="showing-full">Mostrando </span>${shown} de ${list.length} descargables`;
}

let searchDebounce;
document.getElementById("searchInput").addEventListener("input", (e) => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    state.query = e.target.value;
    state.page = 1;
    render();
  }, 200);
});

document.getElementById("sortSelect").addEventListener("change", (e) => {
  state.sortBy = e.target.value;
  render();
});
document.getElementById("btnGrid").addEventListener("click", () => {
  document.getElementById("grid").classList.remove("list");
  document.getElementById("btnGrid").classList.add("active");
  document.getElementById("btnList").classList.remove("active");
});
document.getElementById("btnList").addEventListener("click", () => {
  document.getElementById("grid").classList.add("list");
  document.getElementById("btnList").classList.add("active");
  document.getElementById("btnGrid").classList.remove("active");
});

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
  let collapsed = false;
  try{ collapsed = localStorage.getItem(FILTERS_COLLAPSED_KEY) === "1"; }catch(_){}
  // En mobile el collapse de escritorio no aplica; evitamos estados raros
  if(window.matchMedia("(max-width:900px)").matches) collapsed = false;
  setFiltersCollapsed(collapsed);
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
  return opt && opt.value ? opt.textContent : "";
}

function renderMobileFilters(){
  const listEl = document.getElementById("fmnList");
  const searchFiltered = getSearchFilteredItems();

  const rows = [{ field: "sort", label: "Ordenar por", summary: currentSortLabel() }];

  FACET_FIELDS_UI.forEach(field => {
    const baseParaEsteGrupo = applyFacetFilters(searchFiltered, field, state.pending);
    const counts = computeFacetCounts(field, baseParaEsteGrupo);
    rows.push({ field, label: FACET_LABELS_UI[field], summary: fmnSummary(field), counts });
  });

  listEl.innerHTML = rows.map(r => `
    <div class="fmn-row" data-field="${r.field}">
      <span>${r.label}</span>
      <span class="fmn-row-meta">${r.summary ? `<span>${r.summary}</span>` : ""}<span>›</span></span>
    </div>
  `).join("");

  listEl.querySelectorAll(".fmn-row").forEach(row => {
    row.addEventListener("click", () => openDetailScreen(row.dataset.field));
  });
}

function openDetailScreen(field){
  const titleEl = document.getElementById("fmnDetailTitle");
  const bodyEl = document.getElementById("fmnDetailBody");

  if(field === "sort"){
    titleEl.textContent = "Ordenar por";
    const select = document.getElementById("sortSelect");
    const options = [...select.options].filter(o => o.value !== "");
    bodyEl.innerHTML = options.map(o => `
      <div class="fmn-option-row${state.pendingSortBy === o.value ? " active" : ""}" data-value="${o.value}">
        <span class="fmn-radio"></span><span>${o.textContent}</span>
      </div>
    `).join("");
    bodyEl.querySelectorAll(".fmn-option-row").forEach(row => {
      row.addEventListener("click", () => {
        const val = row.dataset.value;
        state.pendingSortBy = state.pendingSortBy === val ? "" : val;
        renderMobileFilters();
        openDetailScreen("sort");
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

  /* Id de sesión: uno por carga de página, se manda en cada request al webhook
     para que n8n pueda mantener memoria de la conversación (nodo Memory con
     Session Key = {{ $json.body.sessionId }}). */
  window.MacroledSessionId =
    window.MacroledSessionId ||
    (window.crypto && crypto.randomUUID
      ? crypto.randomUUID()
      : `sid-${Date.now()}-${Math.random().toString(36).slice(2)}`);

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

    function addMsg(role, html) {
      const el = document.createElement("div");
      el.className = `ai-msg ${role}`;
      el.innerHTML = `<div class="ai-bubble">${html}</div>`;
      aiMessages.appendChild(el);
      aiMessages.scrollTop = aiMessages.scrollHeight;
    }

    function renderSuggestions() {
      if (!aiSuggestions) return;
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
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && aiPanel.classList.contains("is-open")) closeAssistant();
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

  function buildSuggestions() {
    return [
      "¿Qué información trae una ficha técnica?",
      "¿Para qué sirve el archivo IES?",
    ];
  }

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
      greeting: `Hola, soy el asistente de <b>Macroled</b>. Puedo ayudarte con información técnica sobre productos y su documentación.`,
      suggestions: buildSuggestions,
      getPayload,
      fallbackHtml: () =>
        `No pude responder esa consulta técnica. Probá reformular la pregunta o revisá la ficha / manual del producto.`,
    });
  } catch (err) {
    console.error("[asistente-descargas] no se pudo inicializar:", err);
  }
})();
