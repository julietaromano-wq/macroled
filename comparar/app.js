// Resguardo: si por lo que sea comparar.js no cargó (nombre de archivo
// distinto, 404, etc.), esto evita que la página se rompa — funciona en
// memoria para la sesión actual (sin persistencia entre recargas) y avisa
// por consola cuál es el problema real.
if(!window.MacroledCompare){
  console.warn('[comparar] comparar.js no cargó (revisá que el archivo esté en la misma carpeta/URL que este HTML, con ese nombre exacto, y mirá la pestaña Network del navegador por un 404). Usando un modo de emergencia SIN persistencia entre recargas.');
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
    isInCompare: (sku) => _fallbackList.some(p => p.sku === sku || p.variantSku === sku),
    setCompareVariant: (principalSku, variantSku, img) => {
      const item = _fallbackList.find(p => p.sku === principalSku);
      if(item){
        item.variantSku = variantSku;
        if(img) item.img = img;
      }
      return _fallbackList.slice();
    }
  };
}

/* =========================================================
   ESQUEMA DE SPECS PARA LA COMPARATIVA
   Cada fila apunta a un campo real de Typesense (ver FIELD_MAP más abajo).
   Si un producto no tiene dato en ese campo, la fila directamente no se
   muestra (ver buildRows) — no hace falta borrar filas a mano.
   ========================================================= */
const ICON_BOLT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>';
const ICON_SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
const ICON_BOX = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.3 7L12 12l8.7-5M12 22V12"/></svg>';
const ICON_TAG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7" cy="7" r="1.2" fill="currentColor" stroke="none"/></svg>';

const SPEC_SCHEMA = [
  { categoria: "Características eléctricas", icon: ICON_BOLT, filas: [
    { label: "Potencia", key: "potencia", tip: "Consumo eléctrico, en vatios (W)." },
    { label: "Factor de potencia", key: "factor_potencia", tip: "Qué tan eficiente es el uso de la energía. Más cerca de 1 es mejor." },
    { label: "Corriente", key: "corriente", tip: "Corriente eléctrica que consume o entrega el producto." },
    { label: "Tensión", key: "tension", tip: "Voltaje de alimentación del producto (AC o DC)." },
    { label: "Frecuencia", key: "frecuencia", tip: "Frecuencia de la red eléctrica, en hertz (Hz)." },
    { label: "Anti high volt", key: "anti_high_volt", tip: "Protección contra picos de tensión en la red eléctrica." },
    { label: "Driver", key: "driver", tip: "Tipo de driver o fuente que alimenta el LED (integrado, externo, etc.)." },
    { label: "Conector", key: "conector", tip: "Tipo de conector eléctrico o de instalación." },
    { label: "Base / Conector", key: "base_conector", tip: "Tipo de base o conector de la lámpara (por ejemplo E27, GU10)." },
    { label: "Conductores", key: "conductores", tip: "Cantidad o tipo de conductores del cable." },
    { label: "Conexión", key: "conexion", tip: "Tipo de conexión del accesorio o luminaria." },
    { label: "Conectividad", key: "conectividad", tip: "Tipo de conectividad del producto (Wi‑Fi, RF, Bluetooth, etc.)." },
    { label: "Clase", key: "clase", tip: "Clase de aislamiento eléctrico del producto (I, II o III)." },
    { label: "Panel solar", key: "panel_solar", tip: "Indica si el producto incluye o es compatible con panel solar." },
    { label: "Autonomía", key: "autonomia", tip: "Tiempo de uso con batería, según intensidad." }
  ]},
  { categoria: "Características lumínicas", icon: ICON_SUN, filas: [
    { label: "Lm/W", key: "lumenes_w", tip: "Eficiencia lumínica: lúmenes que produce por cada vatio consumido." },
    { label: "Flujo luminoso", key: "flujo_luminoso", tip: "Cantidad total de luz emitida, en lúmenes (lm)." },
    { label: "Temperatura de color", key: "rango_temperatura", tip: "Tono de la luz en Kelvin: más bajo es más cálida, más alto es más fría." },
    { label: "Ángulo de apertura", key: "angulo_apertura", tip: "Ángulo en el que se distribuye la luz." },
    { label: "CRI", key: "cri", tip: "Fidelidad de color bajo esta luz, en una escala de 0 a 100." },
    { label: "Tipo de LED", key: "tipo_led", tip: "Tecnología o encapsulado del LED utilizado." },
    { label: "Eficiencia energética", key: "eficiencia_energetica", tip: "Clasificación energética del producto según su consumo." },
    { label: "Cantidad de luces", key: "cantidad_luces", tip: "Cantidad de LEDs o puntos de luz." },
    { label: "Dimerizable", key: "dimerizable", tip: "Si permite regular la intensidad de la luz." }
  ]},
  { categoria: "Características materiales", icon: ICON_BOX, filas: [
    { label: "Color", key: "color", tip: "Color de la carcasa / cuerpo del producto." },
    { label: "Material del cuerpo", key: "material_cuerpo", tip: "Material principal de la carcasa o estructura." },
    { label: "Material del lente", key: "material_lente", tip: "Material del difusor u óptica." },
    { label: "Protección IP", key: "ip", tip: "Grado de protección contra polvo y agua." },
    { label: "Protección IK", key: "ik", tip: "Grado de protección contra impactos mecánicos." },
    { label: "Temperatura de operación", key: "temperatura_operacion", tip: "Rango de temperatura ambiente de uso." },
    { label: "Compatibilidad", key: "compatibilidad", tip: "Líneas o productos con los que es compatible." },
    { label: "Vida útil", key: "vida_util", tip: "Vida estimada del LED en horas de uso." }
  ]},
  { categoria: "Características comerciales", icon: ICON_TAG, filas: [
    { label: "Garantía", key: "garantia_tiempo", tip: "Período de cobertura de garantía oficial Macroled." },
    { label: "SKU", key: "sku", tip: "Código único de identificación del producto (Stock Keeping Unit)." }
  ]}
];

// Arranca vacío: los productos vienen de localStorage (compare.js), resueltos
// contra Typesense en resolveProductsFromStorage() más abajo.
let comparedProducts = [];

const TS_HOST = "https://typesense.coresagroup.com";
const TS_API_KEY = "g0oiNYY8THGuU9jnCsvqIH1X9HtvYRCR";
const COLLECTION = "Macroled_Prueba";

// El documento real de Typesense tiene campos nombrados directo (no un array
// `atributos`). Este mapa conecta cada key de SPEC_SCHEMA con el nombre real
// del campo en Typesense.
const FIELD_MAP = {
  potencia: "potencia",
  factor_potencia: "factor_potencia",
  corriente: "corriente",
  tension: "tension",
  frecuencia: "frecuencia",
  anti_high_volt: "anti_high_volt",
  driver: "driver",
  conector: "conector",
  base_conector: "base_conector",
  conductores: "conductores",
  conexion: "conexion",
  conectividad: "conectividad",
  clase: "clase",
  panel_solar: "panel_solar",
  autonomia: "autonomia",
  lumenes_w: "lumenes_w",
  flujo_luminoso: "flujo_luminoso",
  rango_temperatura: "rango_temperatura",
  angulo_apertura: "angulo_apertura",
  cri: "cri",
  tipo_led: "tipo_led",
  eficiencia_energetica: "eficiencia_energetica",
  cantidad_luces: "cantidad_luces",
  dimerizable: "dimerizable",
  color: "color",
  material_cuerpo: "material_cuerpo",
  material_lente: "material_lente",
  ip: "ip",
  ik: "ik",
  temperatura_operacion: "temperatura_operacion",
  compatibilidad: "compatibilidad",
  vida_util: "vida_util",
  garantia_tiempo: "garantia_tiempo",
  sku: "sku"
};

// Campos que Typesense necesita devolver en cada búsqueda/resolución (además
// de query_by): tienen index:false en el schema, así que si no se piden a
// mano en include_fields, Typesense no los trae aunque estén store:true.
const COMPARE_FIELDS = "nombre_typesense,sku,descripcion,macrofamilia,familia,multiimagen,ficha_tecnica,link_ficha_web,variantes_sku,nombre_attr_variantes,attr_variantes,es_principal,potencia,factor_potencia,corriente,tension,frecuencia,anti_high_volt,driver,conector,base_conector,conductores,conexion,conectividad,clase,panel_solar,autonomia,lumenes_w,flujo_luminoso,rango_temperatura,angulo_apertura,cri,tipo_led,eficiencia_energetica,cantidad_luces,dimerizable,color,material_cuerpo,material_lente,ip,ik,temperatura_operacion,compatibilidad,vida_util,garantia_tiempo";
const BASE_FILTER = "tipo_registro:=producto && es_principal:true";

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

function sourceImg(url){
  const u = String(url || "").trim();
  if(!u) return "";
  const m = u.match(/cloudfront\.net\/(?:fit-in\/[^/]+\/)?(?:filters:[^/]+\/)?(.+)$/i);
  return m ? `https://s3.coresagroup.com/${m[1]}` : u;
}

function parseSkuList(raw){
  if(!raw) return [];
  const list = Array.isArray(raw)
    ? raw.map(s => String(s).trim())
    : String(raw).split(/[,;|]/).map(s => s.trim());
  return [...new Set(list.filter(Boolean))];
}

const COLOR_HEX = {
  blanco: "#f4f4f4", negro: "#1c1c1c", gris: "#9e9e9e",
  transparente: "repeating-linear-gradient(45deg,#eef2f6 0 4px,#fff 4px 8px)",
  aluminio: "#c5c9ce", ambar: "#ffbf00", platil: "#c0c0c0",
  bronce: "#b08d57", cobre: "#b87333", cromo: "#cfd4d8",
  verde: "#2e7d32", azul: "#1565c0", rojo: "#c62828", acero: "#8a9399"
};
const COLOR_LABELS = {
  blanco: "Blanco", negro: "Negro", gris: "Gris", transparente: "Transparente",
  aluminio: "Aluminio", ambar: "Ámbar", platil: "Platil", bronce: "Bronce",
  cobre: "Cobre", cromo: "Cromo", verde: "Verde", azul: "Azul", rojo: "Rojo", acero: "Acero"
};
const COLOR_LIGHT = new Set(["blanco", "transparente", "aluminio", "platil", "cromo", "ambar", "acero"]);
const TEMP_TONES = {
  calido: { color: "#fff79b", label: "Cálido" },
  neutro: { color: "#d9d9d9", label: "Neutro" },
  frio:   { color: "#bce4fa", label: "Frío" }
};

function foldText(value){
  return String(value || "").trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function canonicalizeColorPart(part){
  let p = foldText(part).replace(/\b(satinado|texturado|brillante|oscuro|claro|mate|metalizado)\b/g, " ").replace(/\s+/g, " ").trim();
  if(!p) return "";
  if(/^blanc/.test(p)) return "blanco";
  if(/^negr/.test(p)) return "negro";
  if(/^(gris|gray|grey)/.test(p) || /\bgris\b/.test(p)) return "gris";
  if(/transparent/.test(p)) return "transparente";
  if(/aluminio/.test(p)) return "aluminio";
  if(/ambar/.test(p)) return "ambar";
  if(/platil|platead|plata/.test(p)) return "platil";
  if(/bronce/.test(p)) return "bronce";
  if(/cobre/.test(p)) return "cobre";
  if(/cromo|cromado/.test(p)) return "cromo";
  if(/^verd/.test(p)) return "verde";
  if(/^azul/.test(p)) return "azul";
  if(/^roj/.test(p)) return "rojo";
  if(/acero/.test(p)) return "acero";
  return p.replace(/\s+/g, "-");
}

function normalizeColorKey(raw){
  const v = foldText(raw);
  if(!v) return "";
  const parts = v.split(/\s*[-/]\s*|\s+y\s+|\s+con\s+/).map(canonicalizeColorPart).filter(Boolean);
  const uniq = [];
  parts.forEach(p => { if(!uniq.includes(p)) uniq.push(p); });
  return uniq.join("-");
}

function colorLabel(key){
  if(!key) return "";
  if(COLOR_LABELS[key]) return COLOR_LABELS[key];
  return key.split("-").map(p => COLOR_LABELS[p] || (p.charAt(0).toUpperCase() + p.slice(1))).join(" / ");
}

function colorSwatchBg(key){
  const parts = String(key || "").split("-").filter(Boolean);
  if(!parts.length) return "#c3cad6";
  if(parts.length === 1) return COLOR_HEX[parts[0]] || "#c3cad6";
  const colors = parts.map(p => {
    const bg = COLOR_HEX[p] || "#c3cad6";
    return bg.includes("gradient") ? "#e8eef3" : bg;
  });
  if(colors.length === 2) return `linear-gradient(135deg, ${colors[0]} 50%, ${colors[1]} 50%)`;
  const step = 100 / colors.length;
  return `linear-gradient(135deg, ${colors.map((c, i) => `${c} ${i * step}% ${(i + 1) * step}%`).join(", ")})`;
}

function isLightColorKey(key){
  return String(key || "").split("-").some(p => COLOR_LIGHT.has(p));
}

function tempCategoryKey(value){
  const raw = foldText(value);
  if(/calido/.test(raw) || /\bww\b/.test(raw)) return "calido";
  if(/neutro/.test(raw) || /\bnw\b/.test(raw)) return "neutro";
  if(/frio/.test(raw) || /\bcw\b/.test(raw)) return "frio";
  const k = parseInt(value, 10);
  if(Number.isNaN(k)) return null;
  if(k <= 3000) return "calido";
  if(k <= 4500) return "neutro";
  return "frio";
}

function parseWattsValue(str){
  const m = String(str || "").match(/(\d+(?:[.,]\d+)?)\s*w\b/i);
  if(!m) return null;
  const n = parseFloat(m[1].replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function colorFromDoc(doc){
  return normalizeColorKey(doc && doc.color);
}

function potenciaFromDoc(doc){
  if(!doc) return null;
  const fromField = parseWattsValue(doc.potencia);
  if(fromField != null){
    const raw = String(doc.potencia).trim();
    return { key: String(fromField), watts: fromField, label: /w/i.test(raw) ? raw.replace(/\s+/g, "") : `${fromField}W` };
  }
  const fromSku = parseWattsValue(doc.sku);
  if(fromSku != null) return { key: String(fromSku), watts: fromSku, label: `${fromSku}W` };
  return null;
}

function kelvinFromText(value){
  const m = String(value || "").match(/(\d{4})\s*k\b/i) || String(value || "").match(/\b(2000|2200|2700|3000|3500|4000|4500|5000|5700|6500)\b/);
  if(!m) return null;
  const k = parseInt(m[1], 10);
  return Number.isFinite(k) && k >= 1800 && k <= 8000 ? k : null;
}

function kelvinFromSku(sku){
  const s = String(sku || "");
  const direct = kelvinFromText(s);
  if(direct) return direct;
  // Código lámpara 827/830/840/850/857/865 → CRI + CCT
  const code = s.match(/\b[89]([23456][057])\b/);
  if(!code) return null;
  const k = parseInt(code[1], 10) * 100;
  return k >= 2000 && k <= 6500 ? k : null;
}

function skuTempSuffix(sku){
  const s = String(sku || "");
  if(/\bWW\b/i.test(s)) return "calido";
  if(/\bNW\b/i.test(s)) return "neutro";
  if(/\bCW\b/i.test(s)) return "frio";
  return null;
}

function tempInfoFromDoc(doc){
  if(!doc) return { kelvin: null, tone: null };
  const suffixTone = skuTempSuffix(doc.sku);
  const declaredTone = tempCategoryKey(doc.attr_variantes);
  const tone = suffixTone || declaredTone || tempCategoryKey(doc.rango_temperatura);
  let kelvin = kelvinFromText(doc.rango_temperatura)
    || kelvinFromText(doc.attr_variantes)
    || kelvinFromSku(doc.sku);
  if(tone && kelvin && tempCategoryKey(String(kelvin)) !== tone){
    kelvin = null;
  }
  return { kelvin, tone: tone || (kelvin ? tempCategoryKey(String(kelvin)) : null) };
}

function tempFromDoc(doc){
  const info = tempInfoFromDoc(doc);
  if(info.kelvin) return `${info.kelvin}K`;
  return info.tone || "";
}

function anguloFromDoc(doc){
  const field = String(doc && doc.angulo_apertura || "").trim();
  if(field){
    const n = parseInt(field.replace(",", "."), 10);
    if(Number.isFinite(n)) return `${n}°`;
    return field;
  }
  const m = String(doc && doc.sku || "").match(/(\d+)\s*D\b/i);
  return m ? `${m[1]}°` : "";
}

function resolvedKelvin(doc, docs){
  const info = tempInfoFromDoc(doc);
  if(info.kelvin) return info.kelvin;
  if(!info.tone) return null;
  const ks = [...new Set((docs || []).map(tempInfoFromDoc)
    .filter(i => i.tone === info.tone && i.kelvin)
    .map(i => i.kelvin))];
  return ks.length === 1 ? ks[0] : null;
}

function tempAxisKey(doc, docs){
  const info = tempInfoFromDoc(doc);
  if(info.tone) return info.tone;
  const k = resolvedKelvin(doc, docs);
  return k ? String(k) : "";
}

function variantOptionLabel(doc){
  if(!doc) return "";
  const declared = String(doc.attr_variantes || "").trim();
  if(declared) return declared;
  const name = foldText(doc.nombre_attr_variantes);
  if(/luz|temp/.test(name) && doc.rango_temperatura) return String(doc.rango_temperatura).trim();
  if(/angulo/.test(name) && doc.angulo_apertura) return String(doc.angulo_apertura).trim();
  if(/color/.test(name) && doc.color) return String(doc.color).trim();
  if(/potenc/.test(name) && doc.potencia) return String(doc.potencia).trim();
  const pot = potenciaFromDoc(doc);
  if(pot) return pot.label;
  return "";
}

function axisValue(doc, axis){
  if(axis === "color") return colorFromDoc(doc);
  if(axis === "potencia"){
    const pot = potenciaFromDoc(doc);
    return pot ? pot.key : "";
  }
  if(axis === "temp") return tempFromDoc(doc);
  if(axis === "angulo") return anguloFromDoc(doc);
  return variantOptionLabel(doc) || (doc && doc.sku) || "";
}

function valuesDiffer(docs, getter){
  const vals = [...new Set((docs || []).map(getter).filter(v => v != null && v !== ""))];
  return vals.length > 1;
}

function detectVariantAxes(docs){
  const list = docs || [];
  const axes = [];
  if(valuesDiffer(list, colorFromDoc)) axes.push("color");
  if(valuesDiffer(list, d => { const p = potenciaFromDoc(d); return p ? p.key : ""; })) axes.push("potencia");
  if(valuesDiffer(list, d => tempAxisKey(d, list))) axes.push("temp");
  if(valuesDiffer(list, anguloFromDoc)) axes.push("angulo");
  if(axes.length) return axes;
  if(valuesDiffer(list, d => variantOptionLabel(d) || d.sku)) return ["otro"];
  return [];
}

function axisTitle(axis){
  if(axis === "color") return "Color";
  if(axis === "potencia") return "Potencia";
  if(axis === "temp") return "Temperatura";
  if(axis === "angulo") return "Ángulo";
  return "Variante";
}

function tempChipMeta(value){
  const info = { kelvin: kelvinFromText(value), tone: tempCategoryKey(value) };
  const tone = info.tone ? TEMP_TONES[info.tone] : null;
  const k = info.kelvin;
  if(tone && k) return { color: tone.color, label: `${tone.label} ${k}K`, title: `${tone.label} ${k}K` };
  if(k) return { color: "#d9d9d9", label: `${k}K`, title: `${k}K` };
  if(tone) return { color: tone.color, label: tone.label, title: tone.label };
  return { color: "#d9d9d9", label: String(value || "").trim(), title: String(value || "").trim() };
}

function variantFriendlyLabel(doc, axes, docs){
  const bits = (axes || []).map(axis => {
    if(axis === "color") return colorLabel(colorFromDoc(doc));
    if(axis === "potencia"){
      const pot = potenciaFromDoc(doc);
      return pot ? pot.label : "";
    }
    if(axis === "temp"){
      const info = tempInfoFromDoc(doc);
      const tone = info.tone && TEMP_TONES[info.tone];
      const k = info.kelvin || resolvedKelvin(doc, docs);
      if(tone && k) return `${tone.label} ${k}K`;
      if(tone) return tone.label;
      return tempChipMeta(k ? `${k}K` : tempFromDoc(doc)).label;
    }
    if(axis === "angulo") return anguloFromDoc(doc);
    return variantOptionLabel(doc);
  }).filter(Boolean);
  const unique = [...new Set(bits)];
  return unique.join(" · ") || (doc && doc.sku ? String(doc.sku).trim() : "");
}

function sortVariantDocs(docs, axes){
  return [...(docs || [])].sort((a, b) => {
    if((axes || []).includes("potencia")){
      const wa = (potenciaFromDoc(a) || {}).watts || 0;
      const wb = (potenciaFromDoc(b) || {}).watts || 0;
      if(wa !== wb) return wa - wb;
    }
    if((axes || []).includes("temp")){
      const order = { calido: 1, neutro: 2, frio: 3 };
      const ia = tempInfoFromDoc(a);
      const ib = tempInfoFromDoc(b);
      const ta = order[ia.tone] || 9;
      const tb = order[ib.tone] || 9;
      if(ta !== tb) return ta - tb;
      const ka = ia.kelvin || parseInt(tempFromDoc(a), 10) || 0;
      const kb = ib.kelvin || parseInt(tempFromDoc(b), 10) || 0;
      if(ka !== kb) return ka - kb;
    }
    return variantFriendlyLabel(a, axes, docs).localeCompare(variantFriendlyLabel(b, axes, docs), "es");
  });
}

function pickerTitle(){
  return "Variante";
}

function productThumbHtml(p){
  const ph = `<span class="thumb-ph" aria-hidden="true">${ICON_BULB}</span>`;
  const img = sourceImg(p.img);
  if(!img) return `<div class="thumb is-empty">${ph}</div>`;
  return `<div class="thumb">${ph}<img src="${escAttr(img)}" alt="" onerror="this.parentNode.classList.add('is-empty');this.remove()"></div>`;
}

function buildVariantOptions(docs){
  const list = (docs || []).filter(d => d && d.sku);
  const axes = detectVariantAxes(list);
  return list.map(d => ({
    sku: d.sku,
    label: variantFriendlyLabel(d, axes, list) || d.sku,
    doc: d,
    axes
  }));
}

function mapDocToCompared(doc, extras){
  extras = extras || {};
  const imgs = parseImages(doc);
  let img = imgs[0] || sourceImg(extras.img) || "";
  if(!img && extras.variants && extras.variants.length){
    const principal = extras.variants.find(v => v.doc && v.sku === (extras.principalSku || doc.sku));
    img = principal ? (parseImages(principal.doc)[0] || "") : parseImages(extras.variants[0].doc)[0] || "";
  }
  const variants = extras.variants || [];
  const axes = extras.axes || (variants[0] && variants[0].axes) || detectVariantAxes(variants.map(v => v.doc));
  return {
    id: extras.principalSku || doc.sku,
    principalSku: extras.principalSku || doc.sku,
    sku: doc.sku,
    family: doc.familia || doc.macrofamilia || "",
    name: doc.nombre_typesense || extras.nombre || "Producto sin nombre",
    img,
    ficha: doc.link_ficha_web || "#",
    ficha_pdf: doc.ficha_tecnica || "#",
    specs: mapAtributosToSpecs(doc),
    variants,
    axes
  };
}

function currentVariantSummary(p){
  if(!p || !p.variants || p.variants.length < 2) return p ? `SKU: ${p.sku}` : "";
  const current = p.variants.find(v => v.sku === p.sku);
  const doc = current ? current.doc : null;
  if(!doc) return `SKU: ${p.sku}`;
  return variantFriendlyLabel(doc, p.axes, p.variants.map(v => v.doc)) || `SKU: ${p.sku}`;
}

function applyVariantToProduct(product, sku){
  const opt = (product.variants || []).find(v => v.sku === sku);
  if(!opt) return product;
  return mapDocToCompared(opt.doc, { principalSku: product.principalSku, variants: product.variants, axes: product.axes });
}

function uniqueLabeledDocs(docs, axes, preferredSku){
  const ordered = sortVariantDocs(docs, axes);
  const byLabel = new Map();
  ordered.forEach(doc => {
    const label = variantFriendlyLabel(doc, axes, docs);
    const prev = byLabel.get(label);
    if(!prev || doc.sku === preferredSku) byLabel.set(label, doc);
  });
  return [...byLabel.values()];
}

function variantPickerHtml(p){
  if(!p.variants || p.variants.length < 2) return "";
  const docs = p.variants.map(v => v.doc);
  const axes = (p.axes && p.axes.length) ? p.axes : detectVariantAxes(docs);
  const ordered = sortVariantDocs(docs, axes);
  const title = pickerTitle();
  const opts = ordered.map(doc => {
    const label = variantFriendlyLabel(doc, axes, docs);
    return `<option value="${escAttr(doc.sku)}"${doc.sku === p.sku ? " selected" : ""}>${escAttr(label)}</option>`;
  }).join("");
  return `<label class="pvariant">
    <span class="pvariant-label">${escAttr(title)}</span>
    <select data-principal="${escAttr(p.principalSku)}" aria-label="${escAttr("Elegir " + title)}">${opts}</select>
  </label>`;
}

async function fetchDocsBySkus(skus){
  const unique = [...new Set((skus || []).map(s => String(s).trim()).filter(Boolean))];
  if(!unique.length) return [];
  const escaped = unique.map(s => `\`${s.replace(/`/g, "")}\``).join(",");
  const params = new URLSearchParams({
    q: "*",
    query_by: "nombre_typesense,sku",
    filter_by: `sku:=[${escaped}]`,
    include_fields: COMPARE_FIELDS,
    per_page: String(Math.min(Math.max(unique.length, 1), 50))
  });
  const res = await fetch(`${TS_HOST}/collections/${COLLECTION}/documents/search?${params.toString()}`, {
    headers: { "X-TYPESENSE-API-KEY": TS_API_KEY }
  });
  if(!res.ok) throw new Error(`Typesense ${res.status}`);
  const data = await res.json();
  const bySku = {};
  (data.hits || []).forEach(h => { if(h.document && h.document.sku) bySku[h.document.sku] = h.document; });
  return unique.map(s => bySku[s]).filter(Boolean);
}

async function hydrateComparedProduct(doc, variantSku, extras){
  extras = extras || {};
  const skuSet = new Set(parseSkuList(doc.variantes_sku));
  skuSet.add(doc.sku);
  if(variantSku) skuSet.add(variantSku);
  let sibs = [doc];
  if(skuSet.size > 1){
    try{
      const fetched = await fetchDocsBySkus([...skuSet]);
      const bySku = {};
      fetched.forEach(d => { bySku[d.sku] = d; });
      bySku[doc.sku] = bySku[doc.sku] || doc;
      sibs = Object.values(bySku);
    }catch(err){
      console.warn("No se pudieron cargar las variantes:", err);
    }
  }
  const variants = sibs.length > 1 ? buildVariantOptions(sibs) : [];
  const active = (variantSku && sibs.find(d => d.sku === variantSku)) || doc;
  return mapDocToCompared(active, {
    principalSku: extras.principalSku || doc.sku,
    nombre: extras.nombre,
    img: extras.img,
    variants
  });
}

function mapAtributosToSpecs(doc){
  const specs = {};
  for(const key in FIELD_MAP){
    const raw = doc[FIELD_MAP[key]];
    if(raw !== undefined && raw !== null && raw !== ""){
      specs[key] = raw.toString();
    }
  }
  if(!specs.sku && doc.sku) specs.sku = doc.sku;
  return specs;
}

function escAttr(s){
  return (s || "").toString().replace(/"/g, "&quot;");
}

async function searchTypesenseModal(query){
  const params = new URLSearchParams({
    q: query && query.trim() ? query.trim() : "*",
    query_by: "nombre_typesense,sku,descripcion",
    filter_by: BASE_FILTER,
    include_fields: COMPARE_FIELDS,
    per_page: "20",
    page: "1"
  });
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

const COMPARE_MAX = 3;
const ICON_CHECK = `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
const ICON_LINK = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;
const ICON_DOWNLOAD = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;
const ICON_BULB = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.9V17h8v-2.1A7 7 0 0 0 12 2z"/></svg>`;
const SPEC_TIP_MARK = `<svg class="spec-tip__mark" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6.25" stroke="currentColor" stroke-width="1.4"/><path d="M8 7.2v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="8" cy="5.1" r="0.9" fill="currentColor"/></svg>`;

let showOnlyDiffs = false;
let tipBubble = null;
let tipOpenFor = null;

function ensureTipBubble(){
  if(!tipBubble){
    tipBubble = document.createElement("div");
    tipBubble.className = "tip-bubble";
    tipBubble.setAttribute("role", "tooltip");
    tipBubble.innerHTML = '<span class="tip-bubble__title"></span><span class="tip-bubble__body"></span>';
    document.body.appendChild(tipBubble);
  }
  return tipBubble;
}

function showTip(el){
  const bubble = ensureTipBubble();
  const titleEl = bubble.querySelector(".tip-bubble__title");
  const bodyEl = bubble.querySelector(".tip-bubble__body");
  const title = el.getAttribute("data-tip-title") || el.querySelector(".spec-tip__label")?.textContent?.trim() || el.textContent.trim();
  const body = el.dataset.tip || "";
  if(titleEl) titleEl.textContent = title;
  if(bodyEl) bodyEl.textContent = body;

  bubble.classList.remove("is-below");
  bubble.style.left = "-9999px";
  bubble.style.top = "-9999px";
  bubble.classList.add("show");
  el.classList.add("is-open");

  const anchor = el.getBoundingClientRect();
  const br = bubble.getBoundingClientRect();
  let left = anchor.left + anchor.width / 2 - br.width / 2;
  left = Math.max(10, Math.min(left, window.innerWidth - br.width - 10));

  let top = anchor.top - br.height - 12;
  let below = false;
  if(top < 10){
    top = anchor.bottom + 12;
    below = true;
  }
  bubble.classList.toggle("is-below", below);
  bubble.style.left = `${left}px`;
  bubble.style.top = `${top}px`;

  const arrowX = anchor.left + anchor.width / 2 - left;
  bubble.style.setProperty("--tip-arrow-x", `${Math.max(14, Math.min(arrowX, br.width - 14))}px`);
}

function hideTip(){
  if(tipBubble) tipBubble.classList.remove("show");
  document.querySelectorAll(".spec-tip.is-open").forEach(el => el.classList.remove("is-open"));
  tipOpenFor = null;
}

function wireTooltips(container){
  container.querySelectorAll(".spec-tip").forEach(el => {
    if(el.dataset.tipWired === "1") return;
    el.dataset.tipWired = "1";
    el.addEventListener("mouseenter", () => showTip(el));
    el.addEventListener("mouseleave", hideTip);
    el.addEventListener("focus", () => showTip(el));
    el.addEventListener("blur", hideTip);
    el.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isSameOpen = tipOpenFor === el;
      hideTip();
      if(!isSameOpen){
        showTip(el);
        tipOpenFor = el;
      }
    });
  });
}
document.addEventListener("click", () => hideTip());

/* =========================================================
   RENDER
   ========================================================= */
function buildRows(){
  const rows = [];
  SPEC_SCHEMA.forEach(section => {
    const filas = section.filas.filter(f => {
      // si ningún producto comparado tiene dato cargado en esta spec, la fila
      // no aporta nada — se oculta siempre, sin importar el toggle de diffs
      const vals = comparedProducts.map(p => p.specs[f.key]);
      const hasAnyValue = vals.some(v => v !== undefined && v !== null && v !== "");
      if(!hasAnyValue) return false;

      if(!showOnlyDiffs) return true;
      const compareVals = comparedProducts.map(p => p.specs[f.key] ?? "—");
      return !compareVals.every(v => v === compareVals[0]);
    });
    if(!filas.length) return; // sin filas con dato → tampoco mostramos el título de la sección
    rows.push({ type: "section", label: section.categoria, icon: section.icon || "" });
    filas.forEach(f => rows.push({ type: "row", label: f.label, key: f.key, tip: f.tip }));
  });
  return rows;
}

function render(){
  const grid = document.getElementById("compareGrid");
  const rows = buildRows();

  document.getElementById("countLabel").textContent =
    `${comparedProducts.length} producto${comparedProducts.length === 1 ? "" : "s"}`;

  // la pista de "deslizá para comparar" solo tiene sentido si hay más de un
  // producto para desplazarse a ver (si no, no hay nada que deslizar)
  document.getElementById("swipeHint").classList.toggle("show", comparedProducts.length > 1);
  document.getElementById("swipeHint").classList.remove("hidden");

  // Fila de encabezado: primera celda tiene el toggle de diferencias adentro,
  // seguida siempre de 3 columnas (producto o slot "Agregar")
  let html = `
    <div class="cell label header-label" style="border-bottom:1px solid #edeff2;">
      <label class="diff-toggle">
        <span class="switch" id="diffSwitch"><input type="checkbox" id="diffCheckbox"><span class="knob"></span></span>
        <span class="dt-full">Mostrar solo las diferencias</span>
        <span class="dt-short">Solo diferencias</span>
      </label>
    </div>`;

  for(let i = 0; i < COMPARE_MAX; i++){
    const p = comparedProducts[i];
    if(p){
      html += `
        <div class="cell product-head coldata">
          <button class="remove" data-remove="${p.id}" title="Quitar de la comparación">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          ${productThumbHtml(p)}
          <div class="pname">${p.name}</div>
          <div class="psku">${escAttr(p.sku)}</div>
          ${variantPickerHtml(p)}
          <div class="phead-btns">
            <a class="btn btn-primary" href="${p.ficha}">${ICON_LINK} Ver producto</a>
            <a class="btn btn-ghost" href="${p.ficha_pdf}" target="_blank" rel="noopener">${ICON_DOWNLOAD} Ficha técnica</a>
          </div>
        </div>`;
    }else{
      html += `
        <div class="cell add-slot coldata">
          <div class="box" data-open-modal="1">
            <span class="plus">+</span>
            <span class="lbl">Agregar</span>
          </div>
        </div>`;
    }
  }

  html += `<div id="headerSentinel" style="grid-column:1/-1;height:1px;"></div>`;

  // Filas de specs: misma lógica de 3 columnas fijas, celda vacía si no hay producto ahí
  rows.forEach(row => {
    if(row.type === "section"){
      html += `<div class="cell section"><span class="section-title">${row.icon || ""}<span class="section-title-text">${row.label}</span></span></div>`;
      return;
    }
    const labelCell = row.tip
      ? `<button type="button" class="spec-tip" data-tip-title="${escAttr(row.label)}" data-tip="${escAttr(row.tip)}" aria-label="${escAttr(row.label)}: más información"><span class="spec-tip__label">${row.label}</span>${SPEC_TIP_MARK}</button>`
      : row.label;
    html += `<div class="cell label">${labelCell}</div>`;
    for(let i = 0; i < COMPARE_MAX; i++){
      const p = comparedProducts[i];
      if(p){
        const val = p.specs[row.key];
        html += `<div class="cell value coldata">${val ? val : '<span class="dash">—</span>'}</div>`;
      }else{
        html += `<div class="cell value empty-col coldata"></div>`;
      }
    }
  });

  grid.innerHTML = html;
  grid.setAttribute("aria-busy", "false");

  grid.querySelectorAll("[data-remove]").forEach(btn => {
    btn.addEventListener("click", () => {
      comparedProducts = comparedProducts.filter(p => p.id !== btn.dataset.remove);
      window.MacroledCompare.removeFromCompare(btn.dataset.remove);
      render();
    });
  });
  grid.querySelectorAll(".pvariant select").forEach(sel => {
    sel.addEventListener("change", () => {
      const principalSku = sel.dataset.principal;
      const sku = sel.value;
      comparedProducts = comparedProducts.map(p =>
        p.principalSku === principalSku ? applyVariantToProduct(p, sku) : p
      );
      const updated = comparedProducts.find(p => p.principalSku === principalSku);
      if(window.MacroledCompare.setCompareVariant){
        window.MacroledCompare.setCompareVariant(principalSku, sku, updated && updated.img);
      }
      render();
    });
  });
  grid.querySelectorAll("[data-open-modal]").forEach(el => el.addEventListener("click", openModal));
  wireTooltips(grid);

  // el toggle se recrea en cada render (vive dentro de la celda de encabezado),
  // así que hay que re-conectar su listener y re-sincronizar su estado visual
  document.getElementById("diffCheckbox").addEventListener("change", (e) => {
    showOnlyDiffs = e.target.checked;
    document.getElementById("diffSwitch").classList.toggle("on", showOnlyDiffs);
    render();
  });
  if(showOnlyDiffs){
    document.getElementById("diffCheckbox").checked = true;
    document.getElementById("diffSwitch").classList.add("on");
  }

  updateMiniHeader();
  observeHeaderSentinel();
}

/* =========================================================
   MODAL "Buscar producto para comparar"
   ========================================================= */
let modalSearchTimer = null;
let modalCurrentDocs = [];

async function renderModalList(query){
  const list = document.getElementById("modalList");
  list.innerHTML = `<div class="modal-empty">Buscando…</div>`;

  const docs = await searchTypesenseModal(query);

  if(docs === null){
    list.innerHTML = `<div class="modal-empty">No se pudo conectar con Typesense. Revisá la consola para más detalle.</div>`;
    return;
  }
  modalCurrentDocs = docs;

  if(!docs.length){
    list.innerHTML = `<div class="modal-empty">No encontramos productos con ese criterio.</div>`;
    return;
  }

  list.innerHTML = docs.map(doc => {
    const img = parseImages(doc)[0] || "";
    const sku = doc.sku || doc.id || "";
    const already = comparedProducts.some(cp => cp.principalSku === sku || cp.sku === sku);
    const disabledAtLimit = !already && comparedProducts.length >= COMPARE_MAX;
    const action = already
      ? `<span class="added">Ya agregado</span>`
      : `<button class="add-btn" data-sku="${escAttr(sku)}" ${disabledAtLimit ? "disabled" : ""}>+ Agregar</button>`;
    return `
      <div class="modal-item">
        <div class="mi-thumb">${img ? `<img src="${escAttr(img)}" alt="" loading="lazy" onerror="this.remove()">` : ""}</div>
        <div class="mi-info">
          <div class="mi-name">${doc.nombre_typesense || "Producto sin nombre"}</div>
          <div class="mi-sku">${sku}</div>
        </div>
        ${action}
      </div>`;
  }).join("");

  list.querySelectorAll("[data-sku]").forEach(btn => {
    btn.addEventListener("click", async () => {
      if(comparedProducts.length >= COMPARE_MAX) return;
      const doc = modalCurrentDocs.find(d => (d.sku || d.id) === btn.dataset.sku);
      if(!doc) return;
      const sku = doc.sku || doc.id || "";
      const imgs = parseImages(doc);
      const hydrated = await hydrateComparedProduct(doc, sku, { principalSku: sku });
      comparedProducts.push(hydrated);
      window.MacroledCompare.addToCompare({ sku, nombre: hydrated.name || "", img: hydrated.img || imgs[0] || "" });
      closeModal();
      render();
    });
  });
}

function openModal(){
  document.getElementById("modalOverlay").classList.add("open");
  document.getElementById("modalSearchInput").value = "";
  renderModalList("");
  document.getElementById("modalSearchInput").focus();
}
function closeModal(){
  document.getElementById("modalOverlay").classList.remove("open");
}

document.getElementById("modalClose").addEventListener("click", closeModal);
document.getElementById("modalOverlay").addEventListener("click", (e) => {
  if(e.target.id === "modalOverlay") closeModal();
});
document.getElementById("modalSearchInput").addEventListener("input", (e) => {
  clearTimeout(modalSearchTimer);
  const val = e.target.value;
  modalSearchTimer = setTimeout(() => renderModalList(val), 250);
});
document.getElementById("viewAllLink").addEventListener("click", () => {
  document.getElementById("modalSearchInput").value = "";
  renderModalList("");
});

/* =========================================================
   TOOLBAR — imprimir
   ========================================================= */
function prepareComparePrint(){
  const shell = document.getElementById("compareShell");
  if(shell) shell.scrollLeft = 0;
  document.documentElement.style.setProperty("--mini-scroll-x", "0px");

  document.body.classList.remove("assistant-open", "print-cols-1", "print-cols-2", "print-cols-3");
  const n = Math.max(1, Math.min(3, (comparedProducts && comparedProducts.length) || 1));
  document.body.classList.add("print-cols-" + n);

  const panel = document.getElementById("aiPanel");
  const backdrop = document.getElementById("aiBackdrop");
  if(panel){ panel.classList.remove("is-open"); panel.hidden = true; }
  if(backdrop){ backdrop.classList.remove("is-open"); backdrop.hidden = true; }
  const modal = document.getElementById("modalOverlay");
  if(modal) modal.classList.remove("open");
}

function cleanupComparePrint(){
  document.body.classList.remove("print-cols-1", "print-cols-2", "print-cols-3");
}

document.getElementById("printBtn").addEventListener("click", () => {
  prepareComparePrint();
  requestAnimationFrame(() => window.print());
});
window.addEventListener("beforeprint", prepareComparePrint);
window.addEventListener("afterprint", cleanupComparePrint);

/* =========================================================
   BOTÓN "VOLVER" DINÁMICO
   Prioridad:
   1) si el catálogo linkeó hasta acá con ?from=<url> (y opcionalmente
      &fromLabel=<texto>), volvemos exactamente a esa URL — esto es lo único
      100% confiable, porque conserva cualquier filtro/macrofamilia/búsqueda
      que el usuario tenía aplicado en el catálogo, sin depender del historial
      del navegador (que puede fallar si abrió el link en pestaña nueva, si
      hubo un redirect en el medio, etc.)
   2) si no vino ese parámetro, probamos history.back() (funciona bien en la
      mayoría de los casos dentro de la misma pestaña)
   3) como último recurso, mandamos al catálogo general
   NOTA: para que el punto 1 funcione, hay que sumar ese query param del lado
   del catálogo cuando arma el link/redirect hacia comparar.html, ej.:
   `comparar.html?from=${encodeURIComponent(location.href)}&fromLabel=${encodeURIComponent(macrofamiliaNombre)}`
   ========================================================= */
const PRODUCTS_PAGE_FALLBACK = "https://macroled.webflow.io/home-nuevo";
const urlParams = new URLSearchParams(location.search);
const fromUrl = urlParams.get("from");
const fromLabel = urlParams.get("fromLabel");

if(fromLabel){
  document.getElementById("backLinkText").textContent = `Volver a ${fromLabel}`;
}

document.getElementById("backLink").addEventListener("click", () => {
  if(fromUrl){
    location.href = fromUrl;
  }else if(document.referrer){
    window.history.back();
  }else{
    location.href = PRODUCTS_PAGE_FALLBACK;
  }
});

// una vez que el usuario deslizó, ocultamos el banner
document.getElementById("compareShell").addEventListener("scroll", function onFirstScroll(){
  if(this.scrollLeft > 12){
    document.getElementById("swipeHint").classList.add("hidden");
    this.removeEventListener("scroll", onFirstScroll);
  }
}, { passive: true });

/* =========================================================
   MINI-HEADER STICKY — aparece pegado arriba cuando la fila real de
   productos (con foto, nombre y botones) ya scrolleó fuera de vista, para
   no perder de vista qué columna es cada producto. Funciona en mobile y
   desktop por igual.
   ========================================================= */
let headerObserver = null;

function updateMiniHeader(){
  const miniGrid = document.getElementById("miniGrid");
  let html = `<div class="mini-cell"></div>`; // columna vacía, espeja la de labels
  for(let i = 0; i < COMPARE_MAX; i++){
    const p = comparedProducts[i];
    html += p
      ? `<div class="mini-cell"><div class="thumb">${p.img ? `<img src="${escAttr(p.img)}" alt="">` : ""}</div><div class="mini-info"><div class="name">${p.name}</div><div class="sku">${escAttr(currentVariantSummary(p))}</div></div></div>`
      : `<div class="mini-cell"></div>`;
  }
  miniGrid.innerHTML = html;
}

function observeHeaderSentinel(){
  const sentinel = document.getElementById("headerSentinel");
  if(!sentinel) return;
  if(headerObserver) headerObserver.disconnect();
  headerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // se activa apenas la fila de productos (arriba del sentinel) sale
      // por encima de la pantalla — no cuando todavía no llegamos a ella
      const scrolledPast = entry.boundingClientRect.top < 0;
      document.getElementById("miniHeader").classList.toggle("show", scrolledPast);
    });
  }, { threshold: 0 });
  headerObserver.observe(sentinel);
}

// el mini-header no scrollea solo: espeja el scroll horizontal de la tabla
// real vía una variable CSS, así ambos quedan siempre alineados
document.getElementById("compareShell").addEventListener("scroll", function(){
  document.documentElement.style.setProperty("--mini-scroll-x", `${-this.scrollLeft}px`);
}, { passive: true });

/* =========================================================
   CARGA INICIAL — resuelve los SKUs guardados en localStorage
   (compare.js) contra Typesense para traer los datos completos
   ========================================================= */
async function resolveProductsFromStorage(){
  const stored = window.MacroledCompare.getCompareList(); // [{sku, nombre, img, variantSku}]

  if(!stored.length){
    comparedProducts = [];
    render();
    return;
  }

  try{
    const principalDocs = await fetchDocsBySkus(stored.map(p => p.sku));
    const bySku = {};
    principalDocs.forEach(d => { bySku[d.sku] = d; });

    const siblingSkus = [];
    stored.forEach(p => {
      const doc = bySku[p.sku];
      if(doc) parseSkuList(doc.variantes_sku).forEach(s => siblingSkus.push(s));
      if(p.variantSku) siblingSkus.push(p.variantSku);
    });
    if(siblingSkus.length){
      (await fetchDocsBySkus(siblingSkus)).forEach(d => { bySku[d.sku] = d; });
    }

    comparedProducts = stored.map(p => {
      const principal = bySku[p.sku];
      if(!principal){
        return { id: p.sku, principalSku: p.sku, sku: p.sku, family: "", name: p.nombre || p.sku, img: p.img || "", ficha: "#", ficha_pdf: "#", specs: {}, variants: [] };
      }
      const skuSet = new Set(parseSkuList(principal.variantes_sku));
      skuSet.add(principal.sku);
      const sibs = [...skuSet].map(s => bySku[s]).filter(Boolean);
      if(!sibs.some(d => d.sku === principal.sku)) sibs.unshift(principal);
      const variants = sibs.length > 1 ? buildVariantOptions(sibs) : [];
      const activeSku = (p.variantSku && bySku[p.variantSku]) ? p.variantSku : principal.sku;
      return mapDocToCompared(bySku[activeSku] || principal, {
        principalSku: p.sku,
        nombre: p.nombre,
        img: p.img,
        variants
      });
    });
  }catch(err){
    console.error("No se pudieron resolver los productos guardados contra Typesense:", err);
    comparedProducts = stored.map(p => ({ id: p.sku, principalSku: p.sku, sku: p.sku, family: "", name: p.nombre || p.sku, img: p.img || "", ficha: "#", ficha_pdf: "#", specs: {}, variants: [] }));
  }
  render();
}

// Si desde otra pestaña (el catálogo) se agrega/saca un producto, refrescamos.
window.addEventListener("storage", (e) => { if(e.key === "macroled_compare") resolveProductsFromStorage(); });

resolveProductsFromStorage();

/* =========================================================
   ASISTENTE — mismo núcleo que en productos/ficha
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

  function buildCompareSuggestions() {
    return [
      "¿Cuál de estos productos me conviene?",
      "¿Cuáles son las diferencias principales?",
    ];
  }

  function getComparePayload(question) {
    const productos = (typeof comparedProducts !== "undefined" ? comparedProducts : []).map((p) => ({
      sku: p.sku,
      nombre: p.name,
      specs: p.specs || {},
    }));
    return {
      pregunta: question,
      contexto: "comparar",
      productos,
      skus: productos.map((p) => p.sku).filter(Boolean),
      sessionId: window.MacroledSessionId,
    };
  }

  function compareFallbackHtml() {
    return `No pude encontrar información sobre esa consulta. Revisá la tabla de comparación o probá con otra pregunta.`;
  }

  try {
    window.MacroledAssistant.init({
      greeting: `Hola, soy el asistente de <b>productos Macroled</b>. Podés consultarme sobre las diferencias entre los productos que estás comparando.`,
      suggestions: buildCompareSuggestions,
      getPayload: getComparePayload,
      fallbackHtml: compareFallbackHtml,
    });
  } catch (err) {
    console.error("[asistente-comparar] no se pudo inicializar:", err);
  }
})();
