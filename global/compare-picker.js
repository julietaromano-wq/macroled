/* Buscador compartido por la ficha y la pantalla de comparación. */
(function () {
  "use strict";
  let modal, input, list, options, opener, timer, request = 0, busy = false;
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

  const TS_HOST = "https://typesense.coresagroup.com";
const TS_API_KEY = "g0oiNYY8THGuU9jnCsvqIH1X9HtvYRCR";
const COLLECTION = "Macroled_Prueba";
function parseImages(doc){
  if(!doc) return [];
  let raw = doc.multiimagen || doc.multiimage;
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
    let u = item;
    if(u && typeof u === "object") u = u.url || u.src || u.imagen || u.image || u.href || "";
    u = String(u || "").trim().replace(/^["'\[]+|["'\]]+$/g, "").trim();
    if(!u || /^null$/i.test(u) || u === "#") return;
    if(/\.(mp4|webm|mov|m3u8)(\?|#|$)/i.test(u)) return;
    if(u.startsWith("//")) u = "https:" + u;
    if(!/^https?:\/\//i.test(u)) return;
    const cdn = u.match(/cloudfront\.net\/(?:fit-in\/[^/]+\/)?(?:filters:[^/]+\/)?(.+)$/i);
    if(cdn) u = `https://s3.coresagroup.com/${cdn[1]}`;
    if(!urls.includes(u)) urls.push(u);
  });
  return urls;
}
const referenceCache = new Map();
const filterValue = value => "`" + String(value).replace(/\\/g, "\\\\").replace(/`/g, "\\`") + "`";

// La selección persistida guarda SKU, nombre e imagen. Resolvemos la taxonomía
// real del primer SKU (también para selecciones guardadas antes de este cambio).
async function getReference() {
  const first = window.MacroledCompare?.getCompareList()[0];
  const sku = first?.sku;
  if (!sku) return null;
  if (!referenceCache.has(sku)) {
    const pending = (async () => {
      const params = new URLSearchParams({
        q: "*", query_by: "sku", filter_by: `sku:=${filterValue(sku)}`,
        include_fields: "sku,macrofamilia,familia", per_page: "1"
      });
      const response = await fetch(`${TS_HOST}/collections/${COLLECTION}/documents/search?${params}`, {
        headers: { "X-TYPESENSE-API-KEY": TS_API_KEY }
      });
      if (!response.ok) throw new Error(`Typesense ${response.status}`);
      const data = await response.json();
      return data.hits?.[0]?.document || null;
    })();
    referenceCache.set(sku, pending);
  }
  try { return await referenceCache.get(sku); }
  catch (error) { referenceCache.delete(sku); throw error; }
}

function catalogUrl(reference) {
  const params = new URLSearchParams();
  if (reference?.macrofamilia) params.set("macrofamilia", reference.macrofamilia);
  return "/productos" + (params.size ? "?" + params.toString() : "");
}

async function search(query, { fields = "nombre_typesense,sku,descripcion,macrofamilia,familia,multiimagen" } = {}){
  const reference = await getReference();
  const params = new URLSearchParams({
    q: query && query.trim() ? query.trim() : "*",
    query_by: "nombre_typesense,sku,descripcion",
    filter_by: "tipo_registro:=producto && es_principal:true",
    include_fields: fields,
    per_page: "20",
    page: "1"
  });

  // Priorización en el servidor, antes de limitar los resultados a 20.
  // Una sola macrofamilia de referencia: la del primer producto seleccionado.
  const scores = [];
  const macro = reference?.macrofamilia ? `macrofamilia:=${filterValue(reference.macrofamilia)}` : "";
  if (reference?.familia) {
    const family = `familia:=${filterValue(reference.familia)}`;
    scores.push(`(${macro ? macro + " && " : ""}${family}):3`);
  }
  if (macro) scores.push(`(${macro}):1`);
  if (scores.length) {
    params.set("sort_by", `_eval([${scores.join(",")}]):desc,_text_match:desc`);
  }

  const url = `${TS_HOST}/collections/${COLLECTION}/documents/search?${params.toString()}`;
  try{
    const res = await fetch(url, { headers: { "X-TYPESENSE-API-KEY": TS_API_KEY } });
    if(!res.ok) throw new Error(`Typesense ${res.status}`);
    const data = await res.json();
    return (data.hits || []).map(h => h.document);
  }catch(err){
    console.error("Error buscando en Typesense:", err);
    return null; // null = error de conexión, distinto de [] = sin resultados
  }
}

  function mount() {
    if (modal) return;
    modal = document.getElementById("modalOverlay");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "modalOverlay";
      modal.className = "modal-overlay";
      modal.innerHTML = `<div class="modal-card"><div class="modal-head"><h3>Buscar producto para comparar</h3><button type="button" class="close" id="modalClose" aria-label="Cerrar buscador">×</button></div><div class="modal-search"><input type="search" id="modalSearchInput" placeholder="Buscar por nombre, SKU o descripción…"></div><div class="modal-list" id="modalList"></div><div class="modal-foot"><button type="button" id="viewAllLink">Ver todos los productos →</button></div></div>`;
    }
    document.body.appendChild(modal);
    modal.classList.add("macroled-compare-picker");
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "comparePickerTitle");
    modal.setAttribute("aria-hidden", "true");
    modal.querySelector("h3").id = "comparePickerTitle";
    input = modal.querySelector("#modalSearchInput");
    input.setAttribute("aria-label", "Buscar por nombre, SKU o descripción");
    list = modal.querySelector("#modalList");
    list.setAttribute("aria-live", "polite");
    const closeButton = modal.querySelector("#modalClose");
    closeButton.setAttribute("aria-label", "Cerrar buscador");
    closeButton.onclick = close;
    modal.addEventListener("click", e => { if (e.target === modal) close(); });
    input.addEventListener("input", () => {
      clearTimeout(timer);
      request++;
      list.textContent = "Buscando…";
      timer = setTimeout(renderResults, 250);
    });
    const oldViewAll = modal.querySelector("#viewAllLink");
    const viewAll = document.createElement("a");
    viewAll.id = "viewAllLink";
    viewAll.textContent = "Ver todos los productos →";
    viewAll.href = catalogUrl(null);
    oldViewAll.replaceWith(viewAll);
    modal.addEventListener("keydown", e => {
      if (e.key === "Escape") { e.preventDefault(); close(); }
      if (e.key !== "Tab") return;
      const targets = [...modal.querySelectorAll('button:not(:disabled), input, a[href], [tabindex="0"]')];
      const first = targets[0], last = targets[targets.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  async function renderResults() {
    const id = ++request;
    const current = options;
    list.innerHTML = '<div class="modal-empty">Buscando…</div>';
    try {
      const docs = await current.search(input.value);
      if (id !== request || !modal.classList.contains("open")) return;
      if (!docs) throw new Error("Search unavailable");
      if (!docs.length) { list.innerHTML = '<div class="modal-empty">No encontramos productos con ese criterio.</div>'; return; }
      list.innerHTML = docs.map((doc, index) => {
        const sku = doc.sku || doc.id || "";
        const img = parseImages(doc)[0];
        return `<div class="modal-item"><div class="mi-thumb">${img ? `<img src="${esc(img)}" alt="" loading="lazy">` : ""}</div><div class="mi-info"><div class="mi-name">${esc(doc.nombre_typesense || "Producto sin nombre")}</div><div class="mi-sku">${esc(sku)}</div></div>${current.isSelected(sku) ? '<span class="added">Ya agregado</span>' : `<button type="button" class="add-btn" data-index="${index}" ${current.atLimit() || !sku ? "disabled" : ""}>+ Agregar</button>`}</div>`;
      }).join("");
      list.querySelectorAll("img").forEach(img => img.addEventListener("error", () => img.remove()));
      list.querySelectorAll("[data-index]").forEach(button => button.addEventListener("click", async () => {
        const doc = docs[Number(button.dataset.index)];
        if (busy || current.atLimit() || current.isSelected(doc.sku || doc.id)) return;
        busy = true;
        button.disabled = true;
        button.textContent = "Agregando…";
        try {
          await current.add(doc);
          if (options === current) close();
        } catch (_) {
          button.disabled = false;
          button.textContent = "Reintentar";
        } finally { busy = false; }
      }));
    } catch (_) {
      if (id === request) list.innerHTML = '<div class="modal-empty">No pudimos cargar los productos. Volvé a intentar la búsqueda.</div>';
    }
  }

  function open(config) {
    mount();
    options = config;
    opener = document.activeElement;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("compare-picker-open");
    input.value = "";
    input.focus();
    const current = options;
    const viewAll = modal.querySelector("#viewAllLink");
    viewAll.href = catalogUrl(null);
    getReference().then(reference => {
      if (options === current) viewAll.href = catalogUrl(reference);
    }).catch(() => { /* El catálogo general sigue disponible si falla la consulta. */ });
    renderResults();
  }
  function close() {
    if (!modal) return;
    clearTimeout(timer);
    request++;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("compare-picker-open");
    const target = opener?.isConnected ? opener : document.querySelector("#compareBar [data-compare-add], #compareToggle, [data-open-modal]");
    target?.focus();
  }
  window.MacroledComparePicker = { open, close, search, parseImages };
})();
