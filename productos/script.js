// Resguardo: si por lo que sea comparar.js no cargó (nombre de archivo
// distinto, 404, etc.), esto evita que el checkbox "Comparar" quede roto —
// en vez de un stub que no hace nada (y por eso el checkbox se destildaba
// solo al instante), este fallback funciona en memoria para la sesión
// actual, aunque no persista entre recargas. Avisa por consola cuál es el
// problema real para que se pueda corregir la ruta del archivo.
if(!window.MacroledCompare){
  console.warn('[catalogo] comparar.js no cargó (revisá que el archivo esté en la misma carpeta/URL que este HTML, con ese nombre exacto, y mirá la pestaña Network del navegador por un 404). Usando un modo de emergencia SIN persistencia entre recargas.');
  const _fallbackList = [];
  window.MacroledCompare = {
    MAX: 3,
    getCompareList: () => _fallbackList.slice(),
    addToCompare: (product) => {
      if(!product || !product.sku) return _fallbackList.slice();
      if(_fallbackList.some(p => p.sku === product.sku)) return _fallbackList.slice();
      if(_fallbackList.length >= 3) return _fallbackList.slice();
      _fallbackList.push({ sku: product.sku, nombre: product.nombre || "", img: product.img || "" });
      return _fallbackList.slice();
    },
    removeFromCompare: (sku) => {
      const idx = _fallbackList.findIndex(p => p.sku === sku);
      if(idx >= 0) _fallbackList.splice(idx, 1);
      return _fallbackList.slice();
    },
    clearCompare: () => { _fallbackList.length = 0; },
    isInCompare: (sku) => _fallbackList.some(p => p.sku === sku)
  };
}

/* =========================================================
   CONFIG
   ========================================================= */
const TS_HOST = "https://typesense.coresagroup.com";
const TS_API_KEY = "g0oiNYY8THGuU9jnCsvqIH1X9HtvYRCR";
const COLLECTION = "Macroled_Prueba";
const PER_PAGE = 18;

const FACET_FIELDS = ["macrofamilia", "rango_temperatura", "color", "rango_potencia"];
const SUBFAMILIA_FIELD = "subfamilia";
const FAMILIA_FIELD = "familia";

const FACET_LABELS = {
  macrofamilia: "Macrofamilias",
  rango_temperatura: "Temperatura color",
  color: "Color",
  rango_potencia: "Potencia",
  familia: "Familia"
};

const SUBFAMILIA_IMAGES = {
  "Línea Opal": "https://s3.coresagroup.com/MACROLED/250/bulbosnew.png",
  "Dicroicas": "https://s3.coresagroup.com/MACROLED/250/dricoicasnewn.png",
  "AR111": "https://s3.coresagroup.com/MACROLED/250/ar111new.png",
  "Bipin": "https://s3.coresagroup.com/MACROLED/250/bipinnewn.png",
  "Tubos": "https://s3.coresagroup.com/MACROLED/250/par-lednewn.png",
  "PAR": "https://s3.coresagroup.com/MACROLED/250/par-lednewn.png",
  "Filamento": "https://s3.coresagroup.com/MACROLED/250/filamentonewn.png"
};

const CCT_DOT = {
  "2000K": "#ff8a00", "2700K": "#ffab40", "3000K": "#ffb84d",
  "4000K": "#cfe8ff", "4500K": "#bfe3ff", "5000K": "#5ec8f2",
  "5700K": "#29b6f6", "6500K": "#3b82f6"
};

const ICON_SIZE = 'width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
const FACET_ICONS = {
  macrofamilia: `<svg ${ICON_SIZE}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,
  rango_temperatura: `<svg ${ICON_SIZE}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`,
  color: `<svg ${ICON_SIZE}><path d="M12 2a10 10 0 1 0 0 20 3 3 0 0 0 0-6h-1a2 2 0 0 1 0-4h3a2 2 0 0 0 2-2 10 10 0 0 0-4-8z"/><circle cx="7.5" cy="10.5" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="7" r="1" fill="currentColor" stroke="none"/><circle cx="16.5" cy="10.5" r="1" fill="currentColor" stroke="none"/></svg>`,
  rango_potencia: `<svg ${ICON_SIZE}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`
};
const ICON_ANGULO = `<svg ${ICON_SIZE}><path d="M4 20h16"/><path d="M4 20V4"/><path d="M4 20L18 6"/></svg>`;
const ICON_FLUJO = `<svg ${ICON_SIZE}><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V17h6v-.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z"/></svg>`;
const ICON_LINK = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;
const ICON_DOC = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;
const ICON_CHECK = `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
const ICON_COMPARE = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 3 21 3 21 7"/><line x1="21" y1="3" x2="10" y2="14"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5"/></svg>`;
const ICON_CHEVRON_LEFT = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`;
const ICON_CHEVRON_RIGHT = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;
const ICON_WIFI = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>`;

/* =========================================================
   STATE
   ========================================================= */
const state = {
  selected: { macrofamilia: new Set(), rango_temperatura: new Set(), color: new Set(), rango_potencia: new Set(), subfamilia: new Set(), familia: new Set() },
  pending: { macrofamilia: new Set(), rango_temperatura: new Set(), color: new Set(), rango_potencia: new Set(), subfamilia: new Set(), familia: new Set() },
  pendingSortBy: "",
  page: 1,
  sortBy: "",
  query: "",
  view: "grid",
  collapsed: { rango_temperatura: true, color: true, rango_potencia: true, familia: false },
  compareCollapsed: false
};
let currentSearchController = null;   // ← agregar esta línea
const COMPARE_MAX = window.MacroledCompare ? window.MacroledCompare.MAX : 3;

// Lista completa de macrofamilias, cacheada una sola vez al cargar la
// página, independiente de cualquier filtro aplicado
let macrofamiliaOptions = [];
async function loadMacrofamiliaOptions(){
  const params = new URLSearchParams({
    q: "*", query_by: "nombre,sku,descripcion",
    facet_by: "macrofamilia",
    filter_by: "tipo_descarga:!=Catálogo",
    per_page: "1"
  });
  try{
    const res = await fetch(`${TS_HOST}/collections/${COLLECTION}/documents/search?${params.toString()}`, {
      headers: { "X-TYPESENSE-API-KEY": TS_API_KEY }
    });
    if(!res.ok) return;
    const data = await res.json();
    const facet = (data.facet_counts || []).find(f => f.field_name === "macrofamilia");
    macrofamiliaOptions = facet ? facet.counts : [];
  }catch(err){
    console.error("No se pudo cargar la lista completa de macrofamilias:", err);
  }
}

/* =========================================================
   TYPESENSE FETCH
   ========================================================= */
async function searchTypesense(){
  // Si hay una búsqueda anterior todavía en vuelo, la cancelamos: su
  // respuesta ya no nos importa y evita que pise el estado más reciente
  // (ej. clickear dos filtros rápido y que la respuesta más vieja llegue
  // después y muestre resultados que no corresponden a la selección actual)
  if(currentSearchController) currentSearchController.abort();
  currentSearchController = new AbortController();
  const { signal } = currentSearchController;

  const activeMacro = [...state.selected.macrofamilia][0];
  const facetFields = activeMacro ? [...FACET_FIELDS, SUBFAMILIA_FIELD, FAMILIA_FIELD] : FACET_FIELDS;

  const filterParts = ["tipo_descarga:!=Catálogo"];
  for(const field of FACET_FIELDS){
    const vals = [...state.selected[field]];
    if(vals.length){
      const escaped = vals.map(v => `\`${v}\``).join(",");
      filterParts.push(`${field}:=[${escaped}]`);
    }
  }
  if(activeMacro && state.selected.subfamilia.size){
    const escaped = [...state.selected.subfamilia].map(v => `\`${v}\``).join(",");
    filterParts.push(`${SUBFAMILIA_FIELD}:=[${escaped}]`);
  }
  if(activeMacro && state.selected.familia.size){
    const escaped = [...state.selected.familia].map(v => `\`${v}\``).join(",");
    filterParts.push(`${FAMILIA_FIELD}:=[${escaped}]`);
  }
  const params = new URLSearchParams({
    q: state.query || "*",
    query_by: "nombre,sku,descripcion",
    facet_by: facetFields.join(","),
    per_page: String(PER_PAGE),
    page: String(state.page)
  });
  if(filterParts.length) params.set("filter_by", filterParts.join(" && "));
  if(state.sortBy) params.set("sort_by", state.sortBy);

  const url = `${TS_HOST}/collections/${COLLECTION}/documents/search?${params.toString()}`;

  try{
    const res = await fetch(url, { headers: { "X-TYPESENSE-API-KEY": TS_API_KEY }, signal });
    if(!res.ok){
      if(activeMacro && (facetFields.includes(SUBFAMILIA_FIELD) || facetFields.includes(FAMILIA_FIELD))){
        console.warn("Facet 'subfamilia' o 'familia' no disponible en Typesense todavía, reintentando sin ellas.");
        params.set("facet_by", FACET_FIELDS.join(","));
        const retryUrl = `${TS_HOST}/collections/${COLLECTION}/documents/search?${params.toString()}`;
        const retryRes = await fetch(retryUrl, { headers: { "X-TYPESENSE-API-KEY": TS_API_KEY }, signal });
        if(retryRes.ok) return await retryRes.json();
      }
      const errText = await res.text();
      throw new Error(`Typesense ${res.status}: ${errText}`);
    }
    return await res.json();
  }catch(err){
    // AbortError es esperado (cancelamos nosotros mismos la request vieja),
    // no es un error real ni hay que mostrar el mensaje de "no se pudo conectar"
    if(err.name === "AbortError") return null;

    console.error("Error consultando Typesense:", err);
    document.getElementById("grid").innerHTML =
      `<div class="state-msg">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>
        <span class="state-title">No se pudo conectar con Typesense</span>
        <span style="font-size:12px">${err.message}</span>
      </div>`;
    document.getElementById("showingLabel").textContent = "Error al cargar productos";
    return null;
  }
}

/* =========================================================
   RENDER: SIDEBAR FACETS
   ========================================================= */
function renderFacets(facetCounts){
  const panel = document.getElementById("filtersPanel");
  panel.innerHTML = "";
  const activeMacro = [...state.selected.macrofamilia][0];

  if(activeMacro){
    const familiaData = (facetCounts || []).find(f => f.field_name === FAMILIA_FIELD);
    const familiaCounts = familiaData ? familiaData.counts : [];

    const familiaGroup = document.createElement("div");
    familiaGroup.className = "facet-group" + (state.collapsed.familia ? " collapsed" : "");
    familiaGroup.innerHTML = `
      <div class="facet-title" data-field="${FAMILIA_FIELD}">
        <span class="ft-label">${FACET_ICONS.macrofamilia}<span>${FACET_LABELS.familia}</span></span><span class="chev">⌃</span>
      </div>
      <div class="facet-body"></div>
    `;
    const familiaBody = familiaGroup.querySelector(".facet-body");
    familiaCounts.forEach(c => {
      const row = document.createElement("label");
      row.className = "facet-row";
      const checked = state.selected.familia.has(c.value) ? "checked" : "";
      row.innerHTML = `
        <span class="cb-wrap">
          <input type="checkbox" data-field="${FAMILIA_FIELD}" data-value="${c.value}" ${checked}>
          <span class="box">${ICON_CHECK}</span>
        </span>
        <span>${c.value}</span><span class="count">${c.count}</span>
      `;
      familiaBody.appendChild(row);
    });
    if(!familiaCounts.length){
      familiaBody.innerHTML = `<span class="soon-note">Sin valores disponibles.</span>`;
    }
    panel.appendChild(familiaGroup);
  }

  for(const field of FACET_FIELDS){
    if(field === "macrofamilia" && activeMacro) continue;

    const facetData = (facetCounts || []).find(f => f.field_name === field);
    const counts = facetData ? facetData.counts : [];

    const group = document.createElement("div");
    group.className = "facet-group" + (state.collapsed[field] ? " collapsed" : "");
    group.innerHTML = `
      <div class="facet-title" data-field="${field}">
        <span class="ft-label">${FACET_ICONS[field] || ""}<span>${FACET_LABELS[field]}</span></span><span class="chev">⌃</span>
      </div>
      <div class="facet-body"></div>
    `;
    const body = group.querySelector(".facet-body");

    counts.forEach(c => {
      if(field === "macrofamilia"){
        const row = document.createElement("div");
        row.className = "macro-row";
        row.dataset.macro = c.value;
        row.innerHTML = `<span>${c.value}</span><span class="count">${c.count}</span>`;
        body.appendChild(row);
        return;
      }
      const row = document.createElement("label");
      row.className = "facet-row";
      const checked = state.selected[field].has(c.value) ? "checked" : "";
      const dot = field === "rango_temperatura"
        ? `<span class="dot" style="background:${CCT_DOT[c.value] || '#ccc'}"></span>` : "";
      row.innerHTML = `
        <span class="cb-wrap">
          <input type="checkbox" data-field="${field}" data-value="${c.value}" ${checked}>
          <span class="box">${ICON_CHECK}</span>
        </span>
        ${dot}<span>${c.value}</span><span class="count">${c.count}</span>
      `;
      body.appendChild(row);
    });

    if(!counts.length){
      body.innerHTML = `<span class="soon-note">Sin valores disponibles.</span>`;
    }

    panel.appendChild(group);
  }

  [["Angulo iluminación", ICON_ANGULO], ["Flujo lumínico", ICON_FLUJO]].forEach(([label, icon]) => {
    const group = document.createElement("div");
    group.className = "facet-group collapsed";
    group.innerHTML = `
      <div class="facet-title"><span class="ft-label">${icon}<span>${label}</span></span><span class="chev">⌃</span></div>
      <div class="facet-body"><span class="soon-note">Falta un campo facetable dedicado en Typesense para este filtro.</span></div>
    `;
    panel.appendChild(group);
  });

  panel.querySelectorAll(".facet-title").forEach(title => {
    title.addEventListener("click", () => {
      const field = title.dataset.field;
      title.parentElement.classList.toggle("collapsed");
      if(field) state.collapsed[field] = title.parentElement.classList.contains("collapsed");
    });
  });

  panel.querySelectorAll('.macro-row[data-macro]').forEach(row => {
    row.addEventListener("click", () => {
      const val = row.dataset.macro;
      const already = state.selected.macrofamilia.has(val);
      state.selected.macrofamilia.clear();
      state.selected.subfamilia.clear();
      state.selected.familia.clear();
      if(!already) state.selected.macrofamilia.add(val);
      state.page = 1;
      loadAndRender();
    });
  });

  panel.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener("change", () => {
      const { field, value } = cb.dataset;
      if(cb.checked) state.selected[field].add(value); else state.selected[field].delete(value);
      state.page = 1;
      loadAndRender();
    });
  });
}

/* =========================================================
   RENDER: APPLIED FILTER CHIPS
   ========================================================= */
function renderChips(){
  const bar = document.getElementById("chipsBar");
  const CHIP_FIELDS = FACET_FIELDS.filter(f => f !== "macrofamilia");
  const chips = [];
  for(const field of CHIP_FIELDS){
    state.selected[field].forEach(v => chips.push({ field, value: v }));
  }
  state.selected.subfamilia.forEach(v => chips.push({ field: "subfamilia", value: v }));
  state.selected.familia.forEach(v => chips.push({ field: "familia", value: v }));
  if(!chips.length){ bar.style.display = "none"; return; }
  bar.style.display = "flex";
  bar.innerHTML = `<span class="label">Filtros aplicados</span>` +
    chips.map(c => `<span class="chip" data-field="${c.field}" data-value="${c.value}">${c.value}<button>×</button></span>`).join("") +
    `<button class="clear-btn" id="clearAll">Borrar filtros</button>`;

  bar.querySelectorAll(".chip button").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      state.selected[chip.dataset.field].delete(chip.dataset.value);
      state.page = 1;
      loadAndRender();
    });
  });
  document.getElementById("clearAll").addEventListener("click", () => {
    CHIP_FIELDS.forEach(f => state.selected[f].clear());
    state.selected.subfamilia.clear();
    state.selected.familia.clear();
    state.page = 1;
    loadAndRender();
  });
}

/* =========================================================
   RENDER: CARDS
   ========================================================= */
function parseImages(doc){
  let imgs = [];
  const raw = doc.multiimage;
  if(Array.isArray(raw)){
    imgs = raw;
  }else if(typeof raw === "string" && raw.trim()){
    try{
      const parsed = JSON.parse(raw);
      imgs = Array.isArray(parsed) ? parsed : [parsed].filter(Boolean);
    }catch(_){
      imgs = raw.split(/[,;|]/).map(s => s.trim()).filter(Boolean);
    }
  }
  return [...new Set(imgs.filter(Boolean))];
}

// Hasta 3 atributos dinámicos, igual que cards-gaby:
// 1) array `atributos` si viene cargado
// 2) si no, pares nombre_attrN / attr_N
// Si hay variantes, se fusionan valores extra de `atributo_variante`.
function mergeVariantValue(doc, name, baseValue){
  const base = String(baseValue ?? "");
  if(!Array.isArray(doc.atributo_variante)) return base;

  const existing = base.split(";").map(item => item.trim());
  const extras = doc.atributo_variante
    .filter(item =>
      String(item.nombre || "").toLowerCase() === String(name || "").toLowerCase()
      && item.valor
      && !existing.includes(String(item.valor))
    )
    .map(item => String(item.valor));

  return extras.length ? [base, ...extras].filter(Boolean).join(" ; ") : base;
}

function buildSpecs(doc){
  const isTemperature = attribute => /temperatura|luz|kelvin|\bcct\b/i.test(String(attribute.label || "")) || /\b\d{4}\s*k\b/i.test(String(attribute.value || ""));
  const isSmart = attribute => /^smart$/i.test(String(attribute.value || "").trim()) || /\bsmart\b/i.test(String(attribute.label || ""));
  let attributes;
  if(Array.isArray(doc.atributos) && doc.atributos.length){
    attributes = doc.atributos.map(attribute => ({
      label: attribute.nombre,
      value: mergeVariantValue(doc, attribute.nombre, attribute.valor)
    }));
  }else{
    attributes = [
      { label: doc.nombre_attr1, value: doc.attr_1 },
      { label: doc.nombre_attr2, value: doc.attr_2 },
      { label: doc.nombre_attr3, value: doc.attr_3 }
    ]
      .filter(attribute => attribute.label && attribute.value)
      .map(attribute => ({
        label: attribute.label,
        value: mergeVariantValue(doc, attribute.label, attribute.value)
      }));
  }
  const variant = doc.nombre_attr_variantes && doc.attr_variantes
    ? { label: doc.nombre_attr_variantes, value: doc.attr_variantes }
    : null;
  const variantLabel = String(variant?.label || "").trim().toLowerCase();
  const specs = attributes.filter(attribute =>
    String(attribute.label || "").trim().toLowerCase() !== variantLabel
    && !isTemperature(attribute)
    && !isSmart(attribute)
  );
  if(variant && !isTemperature(variant) && !isSmart(variant)) specs.unshift(variant);
  return specs.slice(0, 2);
}

// Nombre real del campo de Typesense para las variantes de tono
// (ej. "6500K ; 4500K ; 3000K..." como en la captura) — reemplazar por el
// nombre exacto de la columna apenas esté confirmado.
const ATTR_VARIANTES_FIELD = "attr_variantes";

// Nombre real del campo de Typesense para "Cant variantes" — reemplazar
// por el nombre exacto de la columna apenas esté confirmado.
const CANT_VARIANTES_FIELD = "cant_variantes";

// Tag "N variantes" arriba a la izquierda cuando el producto tiene dato
// cargado en ese campo (distinto del conteo por `variantes_sku` que ya usa
// el badge de arriba a la derecha)
function buildVariantesBadge(doc){
  const raw = doc[CANT_VARIANTES_FIELD];
  if(raw === undefined || raw === null || raw === "") return "";
  const num = parseInt(raw, 10);
  if(!num || num <= 0) return "";
  return `<span class="count-badge">${num} variantes</span>`;
}

// Tag "SMART" arriba a la izquierda cuando ATTR 2 dice "Smart"
function buildSmartBadge(doc){
  const val = (doc.attr_2 || "").toString().trim().toLowerCase();
  if(val !== "smart") return "";
  return `<span class="smart-badge">${ICON_WIFI}SMART</span>`;
}

// Paleta simplificada de 3 categorías para el tag de temperatura (distinta
// del mapa CCT_DOT detallado por Kelvin que usa el filtro del sidebar)
function tempCategoryColor(kelvinStr){
  const k = parseInt(kelvinStr, 10);
  if(k <= 3000) return "#fff79b"; // cálido
  if(k <= 4500) return "#d9d9d9"; // neutro
  return "#bce4fa"; // frío
}

function buildTempBadge(doc){
  // ATTR_Variantes solo aporta tonos cuando nombre_attr_variantes indica
  // temperatura; en otros productos puede contener ángulos u otra variante.
  const attributeSources = [
    { label: doc.nombre_attr1, value: doc.attr_1 },
    { label: doc.nombre_attr2, value: doc.attr_2 },
    { label: doc.nombre_attr3, value: doc.attr_3 }
  ].filter(attribute => /temperatura|luz|kelvin|\bcct\b/i.test(String(attribute.label || "")));
  const sources = [
    ...attributeSources.map(attribute => attribute.value),
    doc.rango_temperatura,
    doc.temperatura_filtro
  ];
  if(/temperatura|luz|kelvin|\bcct\b/i.test(String(doc.nombre_attr_variantes || ""))){
    sources.unshift(doc[ATTR_VARIANTES_FIELD]);
  }

  // Aceptamos cualquier temperatura Kelvin válida. El color se calcula por
  // categoría, así que no hace falta que cada valor exista en CCT_DOT.
  const tones = [...new Set(
    sources.flatMap(source => String(source || "").match(/\d{4}\s*K/gi) || [])
      .map(t => t.replace(/\s+/g, "").toUpperCase())
  )];

  if(!tones.length) return "";

  const sorted = [...tones].sort((a, b) => parseInt(a) - parseInt(b));

  if(tones.length === 1){
    return `<span class="temp-badge">${tones[0]}<span class="dot" style="background:${tempCategoryColor(tones[0])}"></span></span>`;
  }

  // Varios tonos: texto en rango (min–max) para que el pill nunca se agrande
  // sin importar cuántos tonos tenga el producto. El círculo solo se parte
  // si el rango cruza más de una categoría (cálido/neutro/frío) — si los
  // tonos caen todos en la misma categoría, se ve sólido igual que con uno solo
  const rangeLabel = `${sorted[0]}–${sorted[sorted.length - 1]}`;
  const categories = [...new Set(sorted.map(tempCategoryColor))];

  if(categories.length === 1){
    return `<span class="temp-badge">${rangeLabel}<span class="dot" style="background:${categories[0]}"></span></span>`;
  }

  // Corte horizontal en franjas iguales (de frío arriba a cálido abajo, ya
  // que categories sigue el orden ascendente de Kelvin de `sorted`)
  const step = 100 / categories.length;
  const stops = categories.map((c, i) => `${c} ${i * step}%, ${c} ${(i + 1) * step}%`).join(", ");

  return `<span class="temp-badge">${rangeLabel}<span class="dot split" style="background:linear-gradient(to bottom, ${stops})"></span></span>`;
}

function cardTemplate(doc){
  const imgs = parseImages(doc);
  const nVariants = Array.isArray(doc.variantes_sku) ? doc.variantes_sku.length : 0;

  const specs = buildSpecs(doc);
  const specsHtml = specs.length
    ? specs.map(s => {
        const isLuz = /luz|temperatura/i.test(s.label);
        const firstToken = String(s.value || "").split(";")[0].trim();
        const dot = isLuz && CCT_DOT[firstToken] ? `<span class="dot" style="background:${CCT_DOT[firstToken]}"></span>` : "";
        return `<div class="spec"><b>${s.label}</b><span class="val">${dot}${s.value}</span></div>`;
      }).join("")
    : `<div class="spec" style="flex:none"><span class="soon-note">Sin atributos cargados</span></div>`;

    const productHref = doc.link_ficha_web || "";
const verProductoBtn = productHref
  ? `<a class="btn primary" href="${productHref}">${ICON_LINK} Ver producto</a>`
  : `<span class="btn disabled" title="Falta cargar link_ficha_web">${ICON_LINK} Ver producto</span>`;

const fichaBtn = doc.ficha_tecnica
  ? `<a class="btn outline btn-ficha" href="${doc.ficha_tecnica}" target="_blank">${ICON_DOC} Descargar ficha</a>`
  : `<span class="btn disabled btn-ficha" title="Sin ficha técnica cargada">${ICON_DOC} Descargar ficha</span>`;


  const sku = (doc.sku || doc.id || "").toString();
  const escAttr = (s) => (s || "").toString().replace(/"/g, "&quot;");

  return `
    <div class="card" data-sku="${escAttr(sku)}"${productHref ? ` data-href="${escAttr(productHref)}"` : ""}>
      <div class="media">
        <div class="media-badges-left">
          ${buildSmartBadge(doc)}
          ${buildVariantesBadge(doc)}
        </div>
        ${nVariants > 1 ? `<span class="badge">${nVariants} variantes</span>` : ""}
        ${buildTempBadge(doc)}
        ${imgs.length ? `<img src="${imgs[0]}" alt="${doc.nombre || ""}" data-idx="0" data-imgs='${JSON.stringify(imgs)}'>` : `<span style="color:#c3c9d1;font-size:12px">Sin imagen</span>`}
        ${imgs.length > 1 ? `<div class="nav-arrow prev">${ICON_CHEVRON_LEFT}</div><div class="nav-arrow next">${ICON_CHEVRON_RIGHT}</div>` : ""}
      </div>
      <div class="card-body">
        <div class="card-title">${doc.nombre || "Producto sin nombre"}</div>
        <div class="specs">${specsHtml}</div>
        <div class="btn-row">${verProductoBtn}${fichaBtn}</div>
      </div>
      <label class="compare-row">
        <span class="cb-wrap">
          <input type="checkbox" class="compare-checkbox"
            data-sku="${escAttr(sku)}"
            data-nombre="${escAttr(doc.nombre || "Producto sin nombre")}"
            data-img="${escAttr(imgs[0] || "")}">
          <span class="box">${ICON_CHECK}</span>
        </span> Comparar
      </label>
    </div>
  `;
}

function wireCardLinks(){
  const isMobile = () => window.matchMedia("(max-width:900px)").matches;
  document.querySelectorAll(".card[data-href]").forEach(card => {
    card.addEventListener("click", (e) => {
      if(!isMobile()) return;
      if(e.target.closest(".compare-row, .nav-arrow, .btn-row, a, button, input, label")) return;
      const href = card.dataset.href;
      if(href) window.open(href, "_blank");
    });
  });
}

function wireCarousels(){
  document.querySelectorAll(".card .media").forEach(media => {
    const img = media.querySelector("img");
    if(!img) return;
    const imgs = JSON.parse(img.dataset.imgs || "[]");
    if(imgs.length < 2) return;

    let idx = 0;
    // La imagen 0 ya está cargada (es la que se ve por defecto en la card)
    const loadedSet = new Set([0]);
    const prev = media.querySelector(".prev");
    const next = media.querySelector(".next");

    // Precarga en cadena: solo la próxima imagen, no todas de una.
    // Cubre el caso más común (un click a la vez) sin gastar ancho de
    // banda en imágenes que el usuario quizás nunca llega a ver.
    const preload = (i) => {
      if(loadedSet.has(i)) return;
      const pre = new Image();
      pre.onload = () => loadedSet.add(i);
      pre.src = imgs[i];
    };

    media.addEventListener("mouseenter", () => {
      preload((idx + 1) % imgs.length);
    });

    const goTo = (newIdx) => {
      idx = (newIdx + imgs.length) % imgs.length;
      const targetIdx = idx;
      const target = imgs[targetIdx];

      if(loadedSet.has(targetIdx)){
        img.style.opacity = "1";
        img.src = target;
      } else {
        // Todavía no está en caché: bajamos la opacidad para que se vea
        // que está cargando, en vez de que el click no muestre nada.
        img.style.opacity = "0.4";
        const pre = new Image();
        pre.onload = () => {
          loadedSet.add(targetIdx);
          // Solo aplicamos si el usuario no siguió clickeando mientras tanto
          // (evita que una carga vieja pise una más nueva)
          if(idx === targetIdx){
            img.src = target;
            img.style.opacity = "1";
          }
        };
        pre.src = target;
      }

      // Encadenamos la precarga de la próxima
      preload((targetIdx + 1) % imgs.length);
    };

    if(prev){
      prev.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); goTo(idx - 1); });
    }
    if(next){
      next.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); goTo(idx + 1); });
    }

    media.closest(".card").addEventListener("mouseleave", () => goTo(0));
  });
}

/* =========================================================
   COMPARAR: link con contexto de origen
   ========================================================= */
// URL real (staging) de la página de comparación en Webflow
const COMPARE_PAGE_URL = "https://macroled.webflow.io/nuevo-comparativa";

// Arma la URL a la página de comparación con dos query params:
// - from: la URL actual completa (con macrofamilia/búsqueda aplicados)
// - fromLabel: texto corto de dónde viene, para el botón "Volver a productos"
function buildCompareUrl(){
  const macrofamiliaActual = [...state.selected.macrofamilia][0];
  const fromLabel = state.query
    ? `Resultados para "${state.query}"`
    : (macrofamiliaActual || "productos");
  return `${COMPARE_PAGE_URL}?from=${encodeURIComponent(location.href)}&fromLabel=${encodeURIComponent(fromLabel)}`;
}

/* =========================================================
   BARRA DE COMPARACIÓN (hasta 3 productos) — leída/escrita en
   localStorage vía compare.js, compartida con comparar.html
   ========================================================= */
let compareBarPrevCount = 0;
function updateComparePadding(){
  const bar = document.getElementById("compareBar");
  if(getComputedStyle(bar).display === "none"){
    document.body.style.paddingBottom = "";
    return;
  }
  document.body.style.paddingBottom = (bar.offsetHeight + 28) + "px";
}
function renderCompareBar(){
  const bar = document.getElementById("compareBar");
  const body = document.getElementById("compareBarBody");
  const countEl = document.getElementById("compareCount");
  const list = window.MacroledCompare.getCompareList();

  if(!list.length){
    bar.style.display = "none";
    compareBarPrevCount = 0;
    updateComparePadding();
    return;
  }
  // Al agregar el primer producto en mobile, arranca cerrada para no
  // taparle la pantalla al usuario; en desktop se mantiene como estaba.
  if(compareBarPrevCount === 0 && window.matchMedia("(max-width:900px)").matches){
    state.compareCollapsed = true;
  }
  compareBarPrevCount = list.length;

  bar.style.display = "block";
  bar.classList.toggle("collapsed", state.compareCollapsed);
  countEl.textContent = list.length;

  const chips = list.map(p => `
    <div class="compare-chip">
      <button type="button" class="compare-chip-remove" data-remove="${p.sku}" aria-label="Quitar">×</button>
      <div class="thumb">${p.img ? `<img src="${p.img}" alt="">` : ""}</div>
      <div class="info">
        <span class="name">${p.nombre}</span>
        ${p.sku ? `<span class="sku">${p.sku}</span>` : ""}
      </div>
    </div>
  `).join("");

  const emptySlots = Array.from({ length: Math.max(0, COMPARE_MAX - list.length) })
    .map(() => `<div class="compare-slot-empty">+</div>`).join("");

  const ctaDisabled = list.length < 2;
  body.innerHTML = `
    <div class="compare-items">${chips}${emptySlots}</div>
    <a href="${buildCompareUrl()}" class="compare-cta${ctaDisabled ? " disabled" : ""}"
       title="${ctaDisabled ? "Agregá al menos 2 productos para comparar" : ""}">
      ${ICON_COMPARE} Comparar productos
    </a>
  `;

  body.querySelectorAll("[data-remove]").forEach(btn => {
    btn.addEventListener("click", () => {
      window.MacroledCompare.removeFromCompare(btn.dataset.remove);
      renderCompareBar();
      syncCompareCheckboxes();
    });
  });

  updateComparePadding();
}

function syncCompareCheckboxes(){
  const list = window.MacroledCompare.getCompareList();
  const atLimit = list.length >= COMPARE_MAX;
  document.querySelectorAll(".compare-checkbox").forEach(cb => {
    const sku = cb.dataset.sku;
    const isSelected = list.some(p => p.sku === sku);
    cb.checked = isSelected;
    cb.disabled = atLimit && !isSelected;
    const row = cb.closest(".compare-row");
    if(row){
      row.title = cb.disabled ? `Máximo ${COMPARE_MAX} productos para comparar` : "";
      row.classList.toggle("row-disabled", cb.disabled);
    }
  });
}

function wireCompareCheckboxes(){
  document.querySelectorAll(".compare-checkbox").forEach(cb => {
    cb.addEventListener("change", () => {
      const { sku, nombre, img } = cb.dataset;
      if(cb.checked){
        const updated = window.MacroledCompare.addToCompare({ sku, nombre, img });
        if(!updated.some(p => p.sku === sku)) cb.checked = false; // ya estaba en el máximo
      } else {
        window.MacroledCompare.removeFromCompare(sku);
      }
      renderCompareBar();
      syncCompareCheckboxes();
    });
  });
}

// Si se agrega/saca un producto desde otra pestaña (ej. comparar.html abierta
// al lado) o desde este mismo catálogo, refrescamos la barra sin recargar.
window.addEventListener("macroled-compare-changed", () => { renderCompareBar(); syncCompareCheckboxes(); });
window.addEventListener("storage", (e) => { if(e.key === "macroled_compare"){ renderCompareBar(); syncCompareCheckboxes(); } });


function renderCards(hits, found){
  const grid = document.getElementById("grid");
  if(!hits || !hits.length){
    grid.innerHTML = `<div class="state-msg">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <span class="state-title">No encontramos productos</span>
      <span>Probá sacando algún filtro para ver más resultados.</span>
    </div>`;
    return;
  }
  grid.innerHTML = hits.map(h => cardTemplate(h.document)).join("");
  wireCarousels();
  wireCardLinks();
  wireCompareCheckboxes();
  syncCompareCheckboxes();
}

function renderPagination(found){
  const totalPages = Math.max(1, Math.ceil(found / PER_PAGE));
  const el = document.getElementById("pagination");
  if(totalPages <= 1){ el.innerHTML = ""; return; }
  let html = `<button ${state.page === 1 ? "disabled" : ""} data-p="${state.page - 1}">‹ Anterior</button>`;
  for(let p = 1; p <= totalPages; p++){
    if(p === 1 || p === totalPages || Math.abs(p - state.page) <= 1){
      html += `<button class="${p === state.page ? "active" : ""}" data-p="${p}">${p}</button>`;
    }else if(p === state.page - 2 || p === state.page + 2){
      html += `<span style="align-self:center">…</span>`;
    }
  }
  html += `<button ${state.page === totalPages ? "disabled" : ""} data-p="${state.page + 1}">Siguiente ›</button>`;
  el.innerHTML = html;
  el.querySelectorAll("button[data-p]").forEach(btn => {
    btn.addEventListener("click", () => { state.page = Number(btn.dataset.p); loadAndRender(); });
  });
}

/* =========================================================
   RENDER: FILA DE SUBFAMILIAS (slider, multi-select)
   ========================================================= */
function renderSubfamiliaRow(facetCounts){
  const holder = document.getElementById("subfamiliaRow");
  const activeMacro = [...state.selected.macrofamilia][0];

  if(!activeMacro){
    holder.style.display = "none";
    holder.innerHTML = "";
    return;
  }

  const facetData = (facetCounts || []).find(f => f.field_name === SUBFAMILIA_FIELD);
  let items = facetData ? facetData.counts : null;

  if(!items || !items.length){
    const known = Object.keys(SUBFAMILIA_IMAGES);
    if(!known.length){
      holder.style.display = "none";
      holder.innerHTML = "";
      return;
    }
    items = known.map(v => ({ value: v, count: null }));
  }

  holder.style.display = "block";
  holder.innerHTML = `
    <div class="subfam-track">
      ${items.map(it => {
        const img = SUBFAMILIA_IMAGES[it.value];
        const active = state.selected.subfamilia.has(it.value) ? " active" : "";
        return `
          <div class="subfam-card${active}" data-subfam="${it.value}">
            ${active ? `<span class="subfam-check">${ICON_CHECK}</span>` : ""}
            <div class="subfam-media">${img ? `<img src="${img}" alt="${it.value}">` : ""}</div>
            <div class="subfam-label">${it.value}</div>
          </div>
        `;
      }).join("")}
    </div>
    <button class="subfam-nav prev" aria-label="Anterior">‹</button>
    <button class="subfam-nav next" aria-label="Siguiente">›</button>
  `;

  holder.querySelectorAll(".subfam-card").forEach(card => {
    card.addEventListener("click", () => {
      const v = card.dataset.subfam;
      if(state.selected.subfamilia.has(v)) state.selected.subfamilia.delete(v);
      else state.selected.subfamilia.add(v);
      state.page = 1;
      loadAndRender();
    });
  });

  const track = holder.querySelector(".subfam-track");
  holder.querySelector(".prev").addEventListener("click", () => track.scrollBy({ left: -320, behavior: "smooth" }));
  holder.querySelector(".next").addEventListener("click", () => track.scrollBy({ left: 320, behavior: "smooth" }));
}

/* =========================================================
   RENDER: BREADCRUMB (Inicio > Productos > Macrofamilia / búsqueda)
   ========================================================= */
function renderBreadcrumb(){
  const holder = document.getElementById("breadcrumb");
  const active = [...state.selected.macrofamilia][0];

  if(state.query){
    holder.innerHTML = `Inicio &nbsp;›&nbsp; <a id="crumbProductos">Productos</a> &nbsp;›&nbsp; <b class="crumb-active">Resultados para "${state.query}"</b>`;
    document.getElementById("crumbProductos").addEventListener("click", () => {
      state.query = "";
      state.selected.macrofamilia.clear();
      state.selected.subfamilia.clear();
      state.selected.familia.clear();
      state.page = 1;
      history.pushState({}, "", location.pathname);
      loadAndRender();
    });
    return;
  }

  if(!active){
    holder.innerHTML = `Inicio &nbsp;›&nbsp; <b>Productos</b>`;
    return;
  }
  holder.innerHTML = `Inicio &nbsp;›&nbsp; <a id="crumbProductos">Productos</a> &nbsp;›&nbsp; <b class="crumb-active">${active}</b>`;
  document.getElementById("crumbProductos").addEventListener("click", () => {
    state.selected.macrofamilia.clear();
    state.selected.subfamilia.clear();
    state.selected.familia.clear();
    state.page = 1;
    loadAndRender();
  });
}

/* =========================================================
   RENDER: ENCABEZADO DE MACROFAMILIA SELECCIONADA / BÚSQUEDA
   ========================================================= */
function renderCategoryHeading(found){
  const holder = document.getElementById("categoryHeading");
  const mobileHolder = document.getElementById("mobileCategoryHeading");
  const active = [...state.selected.macrofamilia][0];

  if(state.query){
    const html = `<h1>Resultados para "${state.query}"</h1><div class="count">${found} resultados</div>`;
    holder.style.display = "block";
    holder.innerHTML = html;
    mobileHolder.classList.add("active");
    mobileHolder.innerHTML = html;
    return;
  }

  if(!active){
    holder.style.display = "none";
    holder.innerHTML = "";
    mobileHolder.classList.remove("active");
    mobileHolder.innerHTML = "";
    return;
  }
  const html = `<h1>${active}</h1><div class="count">${found} resultados</div>`;
  holder.style.display = "block";
  holder.innerHTML = html;
  mobileHolder.classList.add("active");
  mobileHolder.innerHTML = html;
}

/* =========================================================
   MAIN LOAD
   ========================================================= */
async function loadAndRender(){
  document.getElementById("showingLabel").textContent = "Cargando productos…";
  const data = await searchTypesense();
  if(!data) return;

  renderFacets(data.facet_counts);
  renderMobileFilters(data.facet_counts);
  renderBreadcrumb();
  renderCategoryHeading(data.found);
  renderSubfamiliaRow(data.facet_counts);
  renderChips();
  renderCards(data.hits, data.found);
  renderPagination(data.found);
  renderCompareBar();

  const from = data.hits.length ? (state.page - 1) * PER_PAGE + 1 : 0;
  const to = (state.page - 1) * PER_PAGE + data.hits.length;
  document.getElementById("showingLabel").textContent = `${to} de ${data.found} productos`;

  const applyBtn = document.getElementById("filtersApply");
  if(applyBtn) applyBtn.textContent = `Ver ${data.found} resultado${data.found === 1 ? "" : "s"}`;
}

/* =========================================================
   TOOLBAR EVENTS
   ========================================================= */
document.getElementById("sortSelect").addEventListener("change", (e) => {
  state.sortBy = e.target.value;
  state.page = 1;
  loadAndRender();
});
document.getElementById("btnGrid").addEventListener("click", () => {
  state.view = "grid";
  document.getElementById("grid").classList.remove("list");
  document.getElementById("btnGrid").classList.add("active");
  document.getElementById("btnList").classList.remove("active");
});
document.getElementById("btnList").addEventListener("click", () => {
  state.view = "list";
  document.getElementById("grid").classList.add("list");
  document.getElementById("btnList").classList.add("active");
  document.getElementById("btnGrid").classList.remove("active");
});

document.getElementById("compareBarHeader").addEventListener("click", () => {
  state.compareCollapsed = !state.compareCollapsed;
  document.getElementById("compareBar").classList.toggle("collapsed", state.compareCollapsed);
  updateComparePadding();
});

/* =========================================================
   DRAWER DE FILTROS (tablet/mobile) — el mismo panel de facets
   se muestra como bottom-sheet en vez de sidebar fijo
   ========================================================= */
const filtersAside = document.getElementById("filtersAside");
const filtersBackdrop = document.getElementById("filtersBackdrop");
const filtersToggle = document.getElementById("filtersToggle");
const filtersClose = document.getElementById("filtersClose");
const filtersApply = document.getElementById("filtersApply");

function openFiltersDrawer(){
  syncPendingFromCommitted();
  filtersAside.classList.add("open");
  filtersBackdrop.classList.add("open");
  document.body.style.overflow = "hidden";
  goToListScreen();
  renderMobileFilters(lastFacetCounts);
  updatePendingResultsCount();
}
function closeFiltersDrawer(){
  filtersAside.classList.remove("open");
  filtersBackdrop.classList.remove("open");
  document.body.style.overflow = "";
}
filtersToggle.addEventListener("click", openFiltersDrawer);
filtersClose.addEventListener("click", closeFiltersDrawer);
filtersBackdrop.addEventListener("click", closeFiltersDrawer);
filtersApply.addEventListener("click", async () => {
  // Recién acá se aplican de verdad los filtros elegidos en el drawer
  Object.keys(state.pending).forEach(f => { state.selected[f] = new Set(state.pending[f]); });
  state.sortBy = state.pendingSortBy;
  document.getElementById("sortSelect").value = state.sortBy;
  state.page = 1;
  await loadAndRender();
  closeFiltersDrawer();
});
document.getElementById("fmnBack").addEventListener("click", goToListScreen);

/* ---- Navegación de dos niveles del drawer mobile: lista de filtros
   cerrados -> detalle (radio para "Ordenar por", checkbox para el resto,
   con Macrofamilia forzada a selección única). Todo lo que se toca queda
   en state.pending / state.pendingSortBy y recién se aplica de verdad
   (loadAndRender) al tocar "Ver resultados" — nada filtra antes. ---- */
let lastFacetCounts = [];
const FMN_ORDER = ["macrofamilia", "familia", "subfamilia", "rango_temperatura", "color", "rango_potencia"];
const FMN_LABELS = {
  macrofamilia: "Macrofamilias",
  familia: "Familia",
  subfamilia: "Subfamilia",
  rango_temperatura: "Temperatura color",
  color: "Color",
  rango_potencia: "Potencia"
};

function syncPendingFromCommitted(){
  Object.keys(state.pending).forEach(f => { state.pending[f] = new Set(state.selected[f]); });
  state.pendingSortBy = state.sortBy;
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

function goToListScreen(){
  document.getElementById("fmnDetail").classList.remove("active");
  document.getElementById("fmnList").classList.add("active");
}

function renderMobileFilters(facetCounts){
  lastFacetCounts = facetCounts || lastFacetCounts;
  const listEl = document.getElementById("fmnList");
  const activeMacro = [...state.pending.macrofamilia][0];

  const rows = [{ field: "sort", label: "Ordenar por", summary: currentSortLabel() }];

  FMN_ORDER.forEach(field => {
    if((field === "familia" || field === "subfamilia") && !activeMacro) return;
    const data = lastFacetCounts.find(f => f.field_name === field);
    const counts = field === "subfamilia"
      ? (data && data.counts.length ? data.counts : Object.keys(SUBFAMILIA_IMAGES).map(v => ({ value: v, count: null })))
      : (data ? data.counts : []);
    if(field !== "macrofamilia" && !counts.length) return;
    rows.push({ field, label: FMN_LABELS[field], summary: fmnSummary(field), counts });
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

function fmnCheckboxRowHtml(field, c){
  const checked = state.pending[field].has(c.value);
  return `
    <div class="fmn-option-row${checked ? " active" : ""}" data-value="${c.value}">
      <span class="fmn-checkbox">${checked ? ICON_CHECK : ""}</span>
      <span>${c.value}</span>
      ${c.count !== null && c.count !== undefined ? `<span class="fmn-count">${c.count}</span>` : ""}
    </div>
  `;
}

// Selección múltiple: solo marca/desmarca en state.pending, sin tocar el
// servidor — se re-renderiza la misma pantalla para reflejar el tilde.
function fmnWireCheckboxRows(bodyEl, field){
  bodyEl.querySelectorAll(".fmn-option-row").forEach(row => {
    row.addEventListener("click", () => {
      const val = row.dataset.value;
      if(state.pending[field].has(val)) state.pending[field].delete(val);
      else state.pending[field].add(val);
      renderMobileFilters(lastFacetCounts);
      openDetailScreen(field);
      updatePendingResultsCount();
    });
  });
}

// Conteo en vivo de "Ver resultados": suma todos los filtros pendientes
// (sin tocar la grilla real) para que el botón siempre refleje cuántos
// productos van a aparecer si se confirma la selección actual.
async function updatePendingResultsCount(){
  const filterParts = ["tipo_descarga:!=Catálogo"];
  for(const field of FACET_FIELDS){
    const vals = [...state.pending[field]];
    if(vals.length){
      const escaped = vals.map(v => `\`${v}\``).join(",");
      filterParts.push(`${field}:=[${escaped}]`);
    }
  }
  const activeMacro = [...state.pending.macrofamilia][0];
  if(activeMacro && state.pending.subfamilia.size){
    const escaped = [...state.pending.subfamilia].map(v => `\`${v}\``).join(",");
    filterParts.push(`${SUBFAMILIA_FIELD}:=[${escaped}]`);
  }
  if(activeMacro && state.pending.familia.size){
    const escaped = [...state.pending.familia].map(v => `\`${v}\``).join(",");
    filterParts.push(`${FAMILIA_FIELD}:=[${escaped}]`);
  }
  const params = new URLSearchParams({ q: state.query || "*", query_by: "nombre,sku,descripcion", per_page: "1", page: "1" });
  if(filterParts.length) params.set("filter_by", filterParts.join(" && "));
  const url = `${TS_HOST}/collections/${COLLECTION}/documents/search?${params.toString()}`;
  try{
    const res = await fetch(url, { headers: { "X-TYPESENSE-API-KEY": TS_API_KEY } });
    if(!res.ok) return;
    const data = await res.json();
    if(filtersApply) filtersApply.textContent = `Ver ${data.found} resultado${data.found === 1 ? "" : "s"}`;
  }catch(err){
    console.error("Error consultando el conteo pendiente:", err);
  }
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
        renderMobileFilters(lastFacetCounts);
        openDetailScreen("sort");
      });
    });
  } else if(field === "macrofamilia"){
    // Selección única: al elegir una, las demás quedan deshabilitadas
    // (no se navega afuera de la pantalla, el usuario vuelve cuando quiera)
    titleEl.textContent = FMN_LABELS.macrofamilia;
    // Lista completa cacheada (no la filtrada) para que sigan apareciendo
    // todas las macrofamilias aunque ya haya una seleccionada
    const cached = macrofamiliaOptions.length
      ? macrofamiliaOptions
      : (lastFacetCounts.find(f => f.field_name === "macrofamilia") || {}).counts || [];
    const counts = cached;
    const hasSelection = state.pending.macrofamilia.size > 0;
    bodyEl.innerHTML = counts.map(c => {
      const checked = state.pending.macrofamilia.has(c.value);
      const disabled = hasSelection && !checked;
      return `
        <div class="fmn-option-row${checked ? " active" : ""}${disabled ? " disabled" : ""}" data-value="${c.value}">
          <span class="fmn-checkbox">${checked ? ICON_CHECK : ""}</span>
          <span>${c.value}</span><span class="fmn-count">${c.count}</span>
        </div>
      `;
    }).join("");
    bodyEl.querySelectorAll(".fmn-option-row").forEach(row => {
      row.addEventListener("click", () => {
        const val = row.dataset.value;
        const already = state.pending.macrofamilia.has(val);
        if(hasSelection && !already) return; // deshabilitada, no hace nada
        state.pending.macrofamilia.clear();
        state.pending.subfamilia.clear();
        state.pending.familia.clear();
        if(!already) state.pending.macrofamilia.add(val);
        renderMobileFilters(lastFacetCounts);
        openDetailScreen("macrofamilia");
        updatePendingResultsCount();
      });
    });
  } else if(field === "subfamilia"){
    titleEl.textContent = "Subfamilia";
    const data = lastFacetCounts.find(f => f.field_name === "subfamilia");
    const counts = data && data.counts.length ? data.counts : Object.keys(SUBFAMILIA_IMAGES).map(v => ({ value: v, count: null }));
    bodyEl.innerHTML = counts.map(c => fmnCheckboxRowHtml("subfamilia", c)).join("");
    fmnWireCheckboxRows(bodyEl, "subfamilia");
  } else {
    titleEl.textContent = FMN_LABELS[field];
    const data = lastFacetCounts.find(f => f.field_name === field);
    const counts = data ? data.counts : [];
    bodyEl.innerHTML = counts.map(c => fmnCheckboxRowHtml(field, c)).join("");
    fmnWireCheckboxRows(bodyEl, field);
  }

  document.getElementById("fmnList").classList.remove("active");
  document.getElementById("fmnDetail").classList.add("active");
}

/* =========================================================
   BÚSQUEDA GENERAL (?q=) — leída desde la URL al cargar, la
   pusiste desde el buscador del menú (ts-search-input) con
   PRODUCTS_PAGE_URL + "?q=" + encodeURIComponent(query)
   ========================================================= */
function initSearchQueryFromURL(){
  const params = new URLSearchParams(location.search);
  const q = params.get("q");
  if(q && q.trim()){
    state.query = q.trim();
    // Si entra por búsqueda, no arranca con una macrofamilia ya filtrada
    state.selected.macrofamilia.clear();
    state.selected.subfamilia.clear();
    state.selected.familia.clear();
  }
}

initSearchQueryFromURL();
loadMacrofamiliaOptions();
loadAndRender();
