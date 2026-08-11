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

const FACET_FIELDS = ["macrofamilia", "variante_temperatura_filtro", "color", "dimerizable"];
const SUBFAMILIA_FIELD = "subfamilia";
const FAMILIA_FIELD = "familia";
// Categoría solo se muestra/filtra cuando ya hay una Familia elegida.
const CATEGORIA_FIELD = "categoria";
const POTENCIA_RAW_FIELD = "potencia";
const EXTRA_FACET_FIELDS = [CATEGORIA_FIELD];

const FACET_LABELS = {
  macrofamilia: "Productos",
  variante_temperatura_filtro: "Temperatura color",
  color: "Color",
  potencia: "Potencia",
  dimerizable: "Dimerizable",
  familia: "Familia",
  categoria: "Categoría"
};

/* ---------------------------------------------------------
   OPTIMIZACIÓN DE IMÁGENES
   Todo lo que vive en el bucket s3.coresagroup.com se re-escribe para
   pasar por CloudFront con resize + conversión a webp. Lo que ya viene
   de cloudfront (o de cualquier otro host) se deja intacto.
   --------------------------------------------------------- */
const CDN_HOST = "https://d1zltvqju4u8ql.cloudfront.net";
function optimizeImg(url, size = "400x400"){
  if(!url) return url;
  if(url.includes("cloudfront.net")) return url;
  const match = url.match(/^https?:\/\/s3\.coresagroup\.com\/(.+)$/);
  if(!match) return url;
  return `${CDN_HOST}/fit-in/${size}/filters:format(webp)/${match[1]}`;
}

/* ---------------------------------------------------------
   IMÁGENES DE SUBFAMILIA, agrupadas por macrofamilia.
   Ojo: nombres de subfamilia como "Solar", "COB", "Sensores", "Smart" o
   "Accesorios" se repiten en varias macrofamilias con fotos distintas —
   por eso el mapa está anidado por macrofamilia y no es un objeto plano.
   Los nombres de macrofamilia de acá abajo son los que se ven en el sitio
   público; si en Typesense el campo `macrofamilia` viene con otra
   grafía (mayúsculas, sin tilde, etc.) hay que ajustarlos para que
   matcheen — la consola tira un warning si alguno no encuentra imágenes.
   --------------------------------------------------------- */
const SUBFAMILIA_IMAGES = {
  "Lámparas": {
    "Bulbos": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/bulbosnew.png`,
    "Bulbones": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/bulbonesnew.png`,
    "Filamento": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/filamentonewn.png`,
    "Bipin": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/bipinnewn.png`,
    "AR111": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/ar111new.png`,
    "Dicroicas": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/dricoicasnewn.png`,
    "Par LED": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/par-lednewn.png`,
    "PAR": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/par-lednewn.png`,
    "Tubos LED": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/tubos.png`,
    "Tubos": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/tubos.png`,
    "Smart": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/smartnew.png`
  },
  "Artefactos para Lámparas": {
    "Embutir Dicroica": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/policarbonato-embutir-dicroica.png`,
    "Embutir AR111": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/policarbonato-embutir-ar111.png`,
    "Aplicar Dicroica": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/policarbonato-aplicar-dicroica.png`,
    "Exterior Dicroica": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/policarbonato-exterior-dicroica.png`,
    "Aplicar AR111": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/acero-aplicar-ar111.png`,
    "Estacas Móviles": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/estacas-moviles.png`,
    "Guirnaldas": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/guirnaldas.png`,
    "Portalámparas": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/portalamparas.png`,
    "Artefactos Tubos": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/artefactos-tubos.png`
  },
  "Lineales PRO": {
    "Lineales": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/WEB/PORTADA-LINEALES-PRO.webp`,
    "Conectores": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/WEB/PORTADA-CONECTORES-LINEALES-PRO.webp`,
    "Lentes Difusor": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/WEB/PORTADA-DIFUSORES-LINEALES-PRO.webp`,
    "Accesorios": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/WEB/LP-SUSP_PERS.webp`,
    "Driver": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/WEB/PORTADA-DRIVERS-LINEALES-PRO.webp`
  },
  "Luminaria interior": {
    "de Pie": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/veladores-de-pie.png`,
    "de Mesa": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/veladores2.png`,
    "Inalámbricas": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/veladores-inalambricos.png`,
    "Emergencia": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/emergencia.png`,
    "Listones": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/liston-led.png`
  },
  "Skyline": {
    "Rieles y Accesorios": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/skyline-rieles.png`,
    "Luminarias": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/skyline.png`,
    "Fuentes": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/skyline-fuentes.png`
  },
  "Luminaria exterior": {
    "Solar": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/solar.png`,
    "Tortugas": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/tortugas.png`,
    "Lineales": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/lineales.png`,
    "Estacas": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/estacas-led-integrado.png`
  },
  "Luminarias de Proyecto": {
    "INVICTUS": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/INVICTUS-1500W-10D-857.png`,
    "TITAN": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/titan.png`,
    "FOCUS": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/focus.png`,
    "OLIMPUS": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/olimpus.png`,
    "INDUSTRIAL": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/industrial.png`,
    "HIGHBAY PRO": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/PHB-200W-90D-857-CW.png`,
    "HIGHBAY STANDARD": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/SHB-200W.png`,
    "HIGHBAY CLASSIC": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/galponeras-eco.webp`,
    "LUZ DE CALLE STANDARD": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/WEB/SLG2-100W-757-CW_FRONT.webp`,
    "LUMAX": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/lumax.png`,
    "PÚBLICA": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/luz-de-calle.png`,
    "Solar Proyecto": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/proyectoSolar.png`,
    "Farolas PRO": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/farolas.png`
  },
  "Paneles LED": {
    "Embutir Blanco": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/embutir-blanco.png`,
    "Embutir Negro": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/embutir-negro.png`,
    "Plafón Blanco": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/plafon-blanco.png`,
    "Plafón Negro": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/plafon-negro.png`,
    "Plafón Platil": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/plafon-platil.png`,
    "Gran Formato 40W": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/WEB/GRAN-FORMATO-P40.webp`,
    "Gran Formato 48W": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/WEB/GRAN-FORMATO-P48.webp`,
    "Gran Formato Backlight": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/WEB/GRAN-FORMATO-BACKLIGHT.webp`,
    "6 a 36 Backlight CCT": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/1000/backlight.png`,
    "Móviles": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/moviles.png`,
    "COB": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/premium.png`,
    "Drivers": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/WEB/DRIVERS.webp`,
    "Accesorios": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/accesorios-paneles.png`
  },
  "Reflectores LED": {
    "PRO 2026": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/WEB/REFLECTORES-PRO.webp`,
    "PRO 2025": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/reflectores-pro.png`,
    "PRO Smart": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/reflectores-smart.png`,
    "Standard": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/WEB/REFLECTORES-STANDARD.webp`,
    "Classic": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/WEB/REFLECTORES-CLASSIC.webp`,
    "Solar": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/reflector-solar.png`
  },
  "Interruptores y Tomas": {
    "LIMA": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/lima.webp`,
    "MONACO Armadas": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/milan.png`,
    "MONACO Bastidor + Módulos": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/milan-bastidores.png`,
    "MONACO Tapas": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/milan-tapas.png`,
    "MONACO Luz de pasillo": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/WEB/portada_luz_pasillo.webp`,
    "MONACO Tapas exterior": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/WEB/M-CR-EXT-B_FRONT.webp`,
    "ROMA": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/roma.png`,
    "TOKIO": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/tokio.png`,
    "KINETIC": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/kinetic.png`
  },
  "Tiras LED": {
    "2835": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/smd2835.png`,
    "5050": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/smd5050a.png`,
    "2216": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/smd2216.png`,
    "COB": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/cob.png`,
    "NEON": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/neon.png`,
    "Perfilería": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/perfileria.png`,
    "Sensores": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/sensores.png`,
    "Accesorios": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/conectores-tiras-LED-2.png`,
    "Controladoras": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/controladoras.png`,
    "Fuentes": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/fuentes.png`
  },
  "Sensores": {
    "Smart": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/sensores-smart.png`,
    "Sensores": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/sensores-y-fotocelulas.png`,
    "Fotocélulas": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/250/fotocelulas.png`
  },
  "Luces de Autos": {
    "Lámparas Principales": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/WEB/luces-auto/principales/principales_portada.png`,
    "Lámparas Auxiliares": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/WEB/luces-auto/auxiliares/auxiliares-portada.png`,
    "Faros y Barras": `${CDN_HOST}/fit-in/100x100/filters:format(webp)/MACROLED/WEB/luces-auto/farosybarras/portada_faros.png`
  }
};

/* ---------------------------------------------------------
   BANNERS DE PORTADA por macrofamilia — reemplaza al slider de
   subfamilias en la parte de arriba de los resultados. Si una
   macrofamilia no tiene entrada acá, simplemente no se muestra banner
   (no rompe nada). Completar con los datos reales cuando estén.
   "video" es opcional: si no está, se muestra solo "poster" como
   imagen fija; si tampoco hay poster, no se muestra media (solo texto).
   --------------------------------------------------------- */
const MACROFAMILIA_BANNERS = {
  // "Tiras LED": {
  //   video: "https://s3.coresagroup.com/MACROLED/videos/tiras-led-banner.mp4",
  //   poster: `${CDN_HOST}/fit-in/1600x500/filters:format(webp)/MACROLED/WEB/banner-tiras-led.jpg`,
  //   title: "Tiras LED",
  //   description: "Flexibilidad y luz continua para cualquier proyecto, en la medida exacta que necesites.",
  // },
};

function renderCategoryBanner(){
  const holder = document.getElementById("categoryBanner");
  if(!holder) return;
  const activeMacro = [...state.selected.macrofamilia][0];
  const data = activeMacro && MACROFAMILIA_BANNERS[activeMacro];

  if(!activeMacro || !data){
    holder.hidden = true;
    holder.innerHTML = "";
    return;
  }

  let mediaHtml = "";
  if(data.video){
    mediaHtml = `
      <video class="category-banner__media" autoplay muted loop playsinline
        ${data.poster ? `poster="${data.poster}"` : ""}>
        <source src="${data.video}" type="video/mp4">
      </video>`;
  } else if(data.poster){
    mediaHtml = `<img class="category-banner__media" src="${data.poster}" alt="${data.title || activeMacro}">`;
  }

  holder.hidden = false;
  holder.innerHTML = `
    ${mediaHtml}
    <div class="category-banner__body">
      <h2 class="category-banner__title">${data.title || activeMacro}</h2>
      ${data.description ? `<p class="category-banner__desc">${data.description}</p>` : ""}
    </div>
  `;
}

const CCT_DOT = {
  "2000K": "#fff79b", "2700K": "#fff79b", "3000K": "#fff79b",
  "4000K": "#d9d9d9", "4500K": "#d9d9d9", "5000K": "#bce4fa",
  "5700K": "#bce4fa", "6500K": "#bce4fa"
};

const ICON_SIZE = 'width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
const FACET_ICONS = {
  macrofamilia: `<svg ${ICON_SIZE}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,
  variante_temperatura_filtro: `<svg ${ICON_SIZE}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`,
  color: `<svg ${ICON_SIZE}><path d="M12 2a10 10 0 1 0 0 20 3 3 0 0 0 0-6h-1a2 2 0 0 1 0-4h3a2 2 0 0 0 2-2 10 10 0 0 0-4-8z"/><circle cx="7.5" cy="10.5" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="7" r="1" fill="currentColor" stroke="none"/><circle cx="16.5" cy="10.5" r="1" fill="currentColor" stroke="none"/></svg>`,
  potencia: `<svg ${ICON_SIZE}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  dimerizable: `<svg ${ICON_SIZE}><rect x="2" y="9" width="20" height="6" rx="3"/><circle cx="16" cy="12" r="2" fill="currentColor" stroke="none"/></svg>`,
  categoria: `<svg ${ICON_SIZE}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`
};
const ICON_CHECK = `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
const ICON_COMPARE = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 3 21 3 21 7"/><line x1="21" y1="3" x2="10" y2="14"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5"/></svg>`;
const ICON_CHEVRON_LEFT = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`;
const ICON_CHEVRON_RIGHT = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;
const ICON_FACET_CHEV = `<svg xmlns="http://www.w3.org/2000/svg" height="10" viewBox="0 -960 960 960" width="14" fill="currentColor" aria-hidden="true"><path d="m321-80-71-71 329-329-329-329 71-71 400 400L321-80Z"/></svg>`;
const CHEV_HTML = `<span class="chev">${ICON_FACET_CHEV}</span>`;
const ICON_WIFI = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>`;
const ICON_BULB = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V17h6v-.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z"/></svg>`;
const ICON_ANGLE = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 20H3"/><path d="M3 20 15 4"/><path d="M9.5 14.5a6 6 0 0 1 5 5"/></svg>`;
const ICON_COLOR = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 0 20 3 3 0 0 0 0-6h-1a2 2 0 0 1 0-4h3a2 2 0 0 0 2-2 10 10 0 0 0-4-8z"/><circle cx="7.5" cy="10.5" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="7" r="1" fill="currentColor" stroke="none"/><circle cx="16.5" cy="10.5" r="1" fill="currentColor" stroke="none"/></svg>`;

const SPEC_ICON_ATTR = 'width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
const ICON_SPEC_BOLT = `<svg ${SPEC_ICON_ATTR}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`;
const ICON_SPEC_ZAP = `<svg ${SPEC_ICON_ATTR}><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/></svg>`;
const ICON_SPEC_COLOR = `<svg ${SPEC_ICON_ATTR}><path d="M12 2a10 10 0 1 0 0 20 3 3 0 0 0 0-6h-1a2 2 0 0 1 0-4h3a2 2 0 0 0 2-2 10 10 0 0 0-4-8z"/><circle cx="7.5" cy="10.5" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="7" r="1" fill="currentColor" stroke="none"/><circle cx="16.5" cy="10.5" r="1" fill="currentColor" stroke="none"/></svg>`;
const ICON_SPEC_ANGLE = `<svg ${SPEC_ICON_ATTR}><path d="M21 20H3"/><path d="M3 20 15 4"/><path d="M9.5 14.5a6 6 0 0 1 5 5"/></svg>`;
const ICON_SPEC_BULB = `<svg ${SPEC_ICON_ATTR}><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V17h6v-.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z"/></svg>`;
const ICON_SPEC_SHIELD = `<svg ${SPEC_ICON_ATTR}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
const ICON_SPEC_WARRANTY = `<svg ${SPEC_ICON_ATTR}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>`;
const ICON_SPEC_DIM = `<svg ${SPEC_ICON_ATTR}><rect x="2" y="9" width="20" height="6" rx="3"/><circle cx="16" cy="12" r="2" fill="currentColor" stroke="none"/></svg>`;
const ICON_SPEC_SUN = `<svg ${SPEC_ICON_ATTR}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`;
const ICON_SPEC_DROP = `<svg ${SPEC_ICON_ATTR}><path d="M12 2.7c.3 0 6 6.2 6 10.3a6 6 0 1 1-12 0C6 8.9 11.7 2.7 12 2.7z"/></svg>`;
const ICON_SPEC_CLOCK = `<svg ${SPEC_ICON_ATTR}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`;
const ICON_SPEC_RULER = `<svg ${SPEC_ICON_ATTR}><path d="M2 16 16 2l6 6L8 22 2 16z"/><path d="m14 4 2 2M11 7l2 2M8 10l2 2M5 13l2 2"/></svg>`;
const ICON_SPEC_TAG = `<svg ${SPEC_ICON_ATTR}><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" stroke="none"/></svg>`;
const ICON_SPEC_WIFI = `<svg ${SPEC_ICON_ATTR}><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>`;
const ICON_SPEC_BOX = `<svg ${SPEC_ICON_ATTR}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.3 7 12 12l8.7-5M12 22V12"/></svg>`;

function normalizeAttrKey(nombreAttr){
  return String(nombreAttr || "").trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function attrSpecIcon(nombreAttr){
  const key = normalizeAttrKey(nombreAttr);
  if(!key) return ICON_SPEC_TAG;
  if(/garant/.test(key)) return ICON_SPEC_WARRANTY;
  if(/tension|voltaje|voltage/.test(key)) return ICON_SPEC_ZAP;
  if(/potencia|watt/.test(key)) return ICON_SPEC_BOLT;
  if(/^color$|acabado|ral/.test(key)) return ICON_SPEC_COLOR;
  if(/angulo|apertura|haz|beam/.test(key)) return ICON_SPEC_ANGLE;
  if(/^luz$|temperatura|cct|kelvin/.test(key)) return ICON_SPEC_BULB;
  if(/\bip\b|proteccion|ingress/.test(key)) return ICON_SPEC_SHIELD;
  if(/dimer|dimm|regulab/.test(key)) return ICON_SPEC_DIM;
  if(/lumen|flujo|eficacia|lm\b/.test(key)) return ICON_SPEC_SUN;
  if(/agua|humedad|ik\b/.test(key)) return ICON_SPEC_DROP;
  if(/vida|hora|duracion/.test(key)) return ICON_SPEC_CLOCK;
  if(/medida|dimension|tamano|diametro|largo|alto/.test(key)) return ICON_SPEC_RULER;
  if(/smart|wifi|conect/.test(key)) return ICON_SPEC_WIFI;
  if(/material|cuerpo|carcasa/.test(key)) return ICON_SPEC_BOX;
  return ICON_SPEC_TAG;
}

function variantAttrIcon(nombreAttr){
  const key = normalizeAttrKey(nombreAttr);
  if(key === "luz") return ICON_BULB;
  if(key === "angulo") return ICON_ANGLE;
  if(key === "color") return ICON_COLOR;
  return "";
}

/* =========================================================
   STATE
   ========================================================= */
const state = {
  selected: { macrofamilia: new Set(), variante_temperatura_filtro: new Set(), color: new Set(), dimerizable: new Set(), subfamilia: new Set(), familia: new Set(), categoria: new Set() },
  pending: { macrofamilia: new Set(), variante_temperatura_filtro: new Set(), color: new Set(), dimerizable: new Set(), subfamilia: new Set(), familia: new Set(), categoria: new Set() },
  pendingSortBy: "",
  potenciaMin: null,
  potenciaMax: null,
  pendingPotenciaMin: null,
  pendingPotenciaMax: null,
  page: 1,
  sortBy: "",
  query: "",
  view: "grid",
  collapsed: { macrofamilia: true, variante_temperatura_filtro: true, color: true, potencia: false, dimerizable: true, familia: true, subfamilia: true, categoria: true },
  compareCollapsed: false
};
window.state = state;
let currentSearchController = null;   // ← agregar esta línea
const COMPARE_MAX = window.MacroledCompare ? window.MacroledCompare.MAX : 3;

// Lista completa de macrofamilias, cacheada una sola vez al cargar la
// página, independiente de cualquier filtro aplicado
let macrofamiliaOptions = [];

/* Índice de potencia (campo string "12W", "200W máx", …) → watts numéricos */
let potenciaOptions = []; // { value, watts }
let potenciaBounds = { min: 0, max: 1800 };
let potenciaRangeTimer = null;

function parseWatts(str){
  if(str == null || str === "") return null;
  const m = String(str).match(/(\d+(?:[.,]\d+)?)/);
  if(!m) return null;
  const n = parseFloat(m[1].replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function isPotenciaRangeActive(min, max){
  if(min == null || max == null) return false;
  return min > potenciaBounds.min || max < potenciaBounds.max;
}

function potenciaFilterClause(min, max){
  if(!isPotenciaRangeActive(min, max)) return null;
  const matched = potenciaOptions
    .filter(o => o.watts >= min && o.watts <= max)
    .map(o => o.value);
  if(!matched.length) return `sku:=[\`__sin_resultados_potencia__\`]`;
  const escaped = matched.map(v => `\`${String(v).replace(/`/g, "")}\``).join(",");
  return `${POTENCIA_RAW_FIELD}:=[${escaped}]`;
}

function ensurePotenciaSelectionDefaults(){
  if(state.potenciaMin == null) state.potenciaMin = potenciaBounds.min;
  if(state.potenciaMax == null) state.potenciaMax = potenciaBounds.max;
  if(state.pendingPotenciaMin == null) state.pendingPotenciaMin = state.potenciaMin;
  if(state.pendingPotenciaMax == null) state.pendingPotenciaMax = state.potenciaMax;
}

function resetPotenciaRange(){
  state.potenciaMin = potenciaBounds.min;
  state.potenciaMax = potenciaBounds.max;
  state.pendingPotenciaMin = potenciaBounds.min;
  state.pendingPotenciaMax = potenciaBounds.max;
}

async function loadPotenciaOptions(){
  const params = new URLSearchParams({
    q: "*", query_by: "nombre_typesense,sku,descripcion",
    facet_by: POTENCIA_RAW_FIELD,
    max_facet_values: "250",
    filter_by: "tipo_registro:=producto",
    per_page: "1"
  });
  try{
    const res = await fetch(`${TS_HOST}/collections/${COLLECTION}/documents/search?${params.toString()}`, {
      headers: { "X-TYPESENSE-API-KEY": TS_API_KEY }
    });
    if(!res.ok) return;
    const data = await res.json();
    const facet = (data.facet_counts || []).find(f => f.field_name === POTENCIA_RAW_FIELD);
    const counts = facet ? facet.counts : [];
    const opts = [];
    counts.forEach(c => {
      const watts = parseWatts(c.value);
      if(watts == null) return;
      opts.push({ value: c.value, watts });
    });
    opts.sort((a, b) => a.watts - b.watts || String(a.value).localeCompare(String(b.value), "es"));
    potenciaOptions = opts;
    if(opts.length){
      const max = Math.max(...opts.map(o => o.watts));
      // Mínimo en 0; máximo = mayor potencia del catálogo + 100 W
      potenciaBounds = { min: 0, max: Math.ceil(max) + 100 };
    }
    ensurePotenciaSelectionDefaults();
  }catch(err){
    console.error("No se pudo cargar el rango de potencias:", err);
  }
}

/* Orden alfabético (es) de opciones de facet por value */
function sortFacetCounts(counts){
  return [...(counts || [])].sort((a, b) =>
    String(a.value || "").localeCompare(String(b.value || ""), "es", { sensitivity: "base" })
  );
}

/* Dimerizable: solo mostrar el filtro si hay alguna opción distinta de "No"
   (Sí, Con smartphone, etc.) en el contexto actual de facets. */
function isDimerizableNoValue(value){
  const v = String(value || "").trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return v === "no" || v === "n" || v === "false" || v === "0" || v === "ninguno";
}

function shouldShowDimerizable(facetCounts){
  const data = (facetCounts || []).find(f => f.field_name === "dimerizable");
  const counts = (data && data.counts) || [];
  if(!counts.length) return false;
  return counts.some(c => !isDimerizableNoValue(c.value) && (c.count == null || c.count > 0));
}

async function loadMacrofamiliaOptions(){
  const params = new URLSearchParams({
    q: "*", query_by: "nombre_typesense,sku,descripcion",
    facet_by: "macrofamilia",
    max_facet_values: "100",
    filter_by: "tipo_registro:=producto",
    per_page: "1"
  });
  try{
    const res = await fetch(`${TS_HOST}/collections/${COLLECTION}/documents/search?${params.toString()}`, {
      headers: { "X-TYPESENSE-API-KEY": TS_API_KEY }
    });
    if(!res.ok) return;
    const data = await res.json();
    const facet = (data.facet_counts || []).find(f => f.field_name === "macrofamilia");
    macrofamiliaOptions = sortFacetCounts(facet ? facet.counts : []);
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
  const activeFamilia = state.selected.familia.size > 0;
  const facetFields = activeMacro
    ? [...FACET_FIELDS, FAMILIA_FIELD, ...(activeFamilia ? [SUBFAMILIA_FIELD, ...EXTRA_FACET_FIELDS] : [])]
    : FACET_FIELDS;

  const filterParts = ["tipo_registro:=producto"];
  // Rehidrata aliases de color desde el último facet (por si aún no se re-renderizó)
  const prevColorFacet = (typeof lastFacetCounts !== "undefined" ? lastFacetCounts : []).find(f => f.field_name === "color");
  if(prevColorFacet) mergeColorFacetCounts(prevColorFacet.counts);
  coerceColorSelection(state.selected.color);
  for(const field of FACET_FIELDS){
    const vals = field === "color"
      ? expandColorFilterValues(state.selected.color)
      : [...state.selected[field]];
    if(vals.length){
      const escaped = vals.map(v => `\`${v}\``).join(",");
      filterParts.push(`${field}:=[${escaped}]`);
    }
  }
  if(activeMacro && state.selected.familia.size){
    const escaped = [...state.selected.familia].map(v => `\`${v}\``).join(",");
    filterParts.push(`${FAMILIA_FIELD}:=[${escaped}]`);
  }
  if(activeMacro && activeFamilia && state.selected.subfamilia.size){
    const escaped = [...state.selected.subfamilia].map(v => `\`${v}\``).join(",");
    filterParts.push(`${SUBFAMILIA_FIELD}:=[${escaped}]`);
  }
  if(activeFamilia){
    for(const field of EXTRA_FACET_FIELDS){
      const vals = [...state.selected[field]];
      if(vals.length){
        const escaped = vals.map(v => `\`${v}\``).join(",");
        filterParts.push(`${field}:=[${escaped}]`);
      }
    }
  }
  const potClause = potenciaFilterClause(state.potenciaMin, state.potenciaMax);
  if(potClause) filterParts.push(potClause);
  const params = new URLSearchParams({
    q: state.query || "*",
    query_by: "nombre_typesense,sku,descripcion",
    facet_by: facetFields.join(","),
    max_facet_values: "100",
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
function potenciaRangeHtml(minVal, maxVal){
  const absMin = potenciaBounds.min;
  const absMax = potenciaBounds.max;
  const span = Math.max(absMax - absMin, 1);
  const left = ((minVal - absMin) / span) * 100;
  const right = ((absMax - maxVal) / span) * 100;
  return `
    <div class="potencia-range" data-abs-min="${absMin}" data-abs-max="${absMax}">
      <div class="potencia-slider">
        <div class="potencia-track"><div class="potencia-fill" style="left:${left}%;right:${right}%"></div></div>
        <input type="range" class="pot-min" min="${absMin}" max="${absMax}" step="1" value="${minVal}" aria-label="Potencia mínima">
        <input type="range" class="pot-max" min="${absMin}" max="${absMax}" step="1" value="${maxVal}" aria-label="Potencia máxima">
      </div>
      <div class="potencia-inputs">
        <label class="potencia-field"><input type="number" class="pot-min-input" min="${absMin}" max="${absMax}" value="${minVal}"><span>W</span></label>
        <label class="potencia-field"><input type="number" class="pot-max-input" min="${absMin}" max="${absMax}" value="${maxVal}"><span>W</span></label>
      </div>
    </div>
  `;
}

function wirePotenciaRange(root, { pending, onCommit }){
  if(!root) return;
  const minRange = root.querySelector(".pot-min");
  const maxRange = root.querySelector(".pot-max");
  const minInput = root.querySelector(".pot-min-input");
  const maxInput = root.querySelector(".pot-max-input");
  const fill = root.querySelector(".potencia-fill");
  const absMin = potenciaBounds.min;
  const absMax = potenciaBounds.max;

  function paint(min, max){
    minRange.value = min;
    maxRange.value = max;
    minInput.value = min;
    maxInput.value = max;
    const span = Math.max(absMax - absMin, 1);
    fill.style.left = `${((min - absMin) / span) * 100}%`;
    fill.style.right = `${((absMax - max) / span) * 100}%`;
    // El thumb activo queda arriba para poder arrastrar ambos
    const minPercent = (min - absMin) / span;
    const maxPercent = (max - absMin) / span;
    minRange.style.zIndex = minPercent > maxPercent - 0.05 ? 3 : 2;
    maxRange.style.zIndex = 2;
  }

  function read(){
    let min = Number(minRange.value);
    let max = Number(maxRange.value);
    if(min > max){ const t = min; min = max; max = t; }
    return { min, max };
  }

  function apply(min, max, commit){
    min = Math.max(absMin, Math.min(absMax, Math.round(min)));
    max = Math.max(absMin, Math.min(absMax, Math.round(max)));
    if(min > max){ const t = min; min = max; max = t; }
    paint(min, max);
    if(pending){
      state.pendingPotenciaMin = min;
      state.pendingPotenciaMax = max;
    } else {
      state.potenciaMin = min;
      state.potenciaMax = max;
    }
    if(commit) onCommit();
  }

  minRange.addEventListener("input", () => {
    let min = Number(minRange.value);
    let max = Number(maxRange.value);
    if(min > max) min = max;
    apply(min, max, !pending);
  });
  maxRange.addEventListener("input", () => {
    let min = Number(minRange.value);
    let max = Number(maxRange.value);
    if(max < min) max = min;
    apply(min, max, !pending);
  });
  const commitFromSlider = () => {
    const { min, max } = read();
    apply(min, max, true);
  };
  minRange.addEventListener("change", commitFromSlider);
  maxRange.addEventListener("change", commitFromSlider);

  function commitFromInputs(){
    let min = Number(minInput.value);
    let max = Number(maxInput.value);
    if(!Number.isFinite(min)) min = absMin;
    if(!Number.isFinite(max)) max = absMax;
    apply(min, max, true);
  }
  minInput.addEventListener("change", commitFromInputs);
  maxInput.addEventListener("change", commitFromInputs);
  minInput.addEventListener("keydown", e => { if(e.key === "Enter") commitFromInputs(); });
  maxInput.addEventListener("keydown", e => { if(e.key === "Enter") commitFromInputs(); });
}

function appendPotenciaRangeFacet(panel, pending){
  ensurePotenciaSelectionDefaults();
  const minVal = pending ? state.pendingPotenciaMin : state.potenciaMin;
  const maxVal = pending ? state.pendingPotenciaMax : state.potenciaMax;
  const group = document.createElement("div");
  group.className = "facet-group" + (state.collapsed.potencia ? " collapsed" : "");
  group.innerHTML = `
    <div class="facet-title" data-field="potencia">
      <span class="ft-label">${FACET_ICONS.potencia || ""}<span>Potencia</span></span>${CHEV_HTML}
    </div>
    <div class="facet-body">${potenciaRangeHtml(minVal, maxVal)}</div>
  `;
  panel.appendChild(group);
  wirePotenciaRange(group.querySelector(".potencia-range"), {
    pending,
    onCommit: () => {
      if(pending){
        updatePendingResultsCount();
        return;
      }
      state.page = 1;
      clearTimeout(potenciaRangeTimer);
      potenciaRangeTimer = setTimeout(() => loadAndRender(), 180);
    }
  });
}

function renderFacets(facetCounts){
  const panel = document.getElementById("filtersPanel");
  panel.innerHTML = "";
  const activeMacro = [...state.selected.macrofamilia][0];
  const activeFamilia = [...state.selected.familia][0];

  if(activeMacro && !activeFamilia){
    cacheFamiliaImagesFromHits(window._lastHits || []);

    /* Familia — solo mientras no haya una elegida */
    const familiaData = (facetCounts || []).find(f => f.field_name === FAMILIA_FIELD);
    const freshFamilia = sortFacetCounts(familiaData ? familiaData.counts : []);
    if(freshFamilia.length){
      familiaOptionsCache[activeMacro] = freshFamilia;
    }
    const familiaCounts = familiaOptionsCache[activeMacro] || freshFamilia;

    if(familiaCounts.length){
      const famGroup = document.createElement("div");
      famGroup.className = "facet-group" + (state.collapsed.familia ? " collapsed" : "");
      famGroup.innerHTML = `
        <div class="facet-title" data-field="${FAMILIA_FIELD}">
          <span class="ft-label">${FACET_ICONS.macrofamilia}<span>Familia</span></span>${CHEV_HTML}
        </div>
        <div class="facet-body"></div>
      `;
      const famBody = famGroup.querySelector(".facet-body");
      familiaCounts.forEach(c => {
        const row = document.createElement("div");
        row.className = "facet-row familia-row";
        row.dataset.familia = c.value;
        const img = getFamiliaImage(activeMacro, c.value);
        row.innerHTML = `
          ${img ? `<img class="facet-thumb" src="${img}" alt="">` : ""}
          <span>${c.value}</span>${c.count !== null && c.count !== undefined ? `<span class="count">${c.count}</span>` : ""}
        `;
        famBody.appendChild(row);
      });
      panel.appendChild(famGroup);
    }
  }

  if(activeMacro && activeFamilia){
    /* Subfamilia — aparece al elegir Familia */
    const subfamData = (facetCounts || []).find(f => f.field_name === SUBFAMILIA_FIELD);
    let subfamCounts = sortFacetCounts(subfamData ? subfamData.counts : []);

    if(subfamCounts.length){
      const subfamGroup = document.createElement("div");
      subfamGroup.className = "facet-group" + (state.collapsed.subfamilia ? " collapsed" : "");
      subfamGroup.innerHTML = `
        <div class="facet-title" data-field="${SUBFAMILIA_FIELD}">
          <span class="ft-label">${FACET_ICONS.macrofamilia}<span>Subfamilia</span></span>${CHEV_HTML}
        </div>
        <div class="facet-body"></div>
      `;
      const subfamBody = subfamGroup.querySelector(".facet-body");
      subfamCounts.forEach(c => {
        const row = document.createElement("label");
        row.className = "facet-row";
        const checked = state.selected.subfamilia.has(c.value) ? "checked" : "";
        row.innerHTML = `
          <span class="cb-wrap">
            <input type="checkbox" data-field="${SUBFAMILIA_FIELD}" data-value="${c.value}" ${checked}>
            <span class="box">${ICON_CHECK}</span>
          </span>
          <span>${c.value}</span>${c.count !== null && c.count !== undefined ? `<span class="count">${c.count}</span>` : ""}
        `;
        subfamBody.appendChild(row);
      });
      panel.appendChild(subfamGroup);
    }

    /* Categoría — solo con Familia filtrada */
    for(const field of EXTRA_FACET_FIELDS){
      const facetData = (facetCounts || []).find(f => f.field_name === field);
      const counts = sortFacetCounts(facetData ? facetData.counts : []);
      if(!counts.length) continue;

      const group = document.createElement("div");
      group.className = "facet-group" + (state.collapsed[field] ? " collapsed" : "");
      group.innerHTML = `
        <div class="facet-title" data-field="${field}">
          <span class="ft-label">${FACET_ICONS[field] || ""}<span>${FACET_LABELS[field]}</span></span>${CHEV_HTML}
        </div>
        <div class="facet-body"></div>
      `;
      const body = group.querySelector(".facet-body");
      counts.forEach(c => {
        const row = document.createElement("label");
        row.className = "facet-row";
        const checked = state.selected[field].has(c.value) ? "checked" : "";
        row.innerHTML = `
          <span class="cb-wrap">
            <input type="checkbox" data-field="${field}" data-value="${c.value}" ${checked}>
            <span class="box">${ICON_CHECK}</span>
          </span>
          <span>${c.value}</span><span class="count">${c.count}</span>
        `;
        body.appendChild(row);
      });
      panel.appendChild(group);
    }
  }

  for(const field of FACET_FIELDS){
    if(field === "macrofamilia" && activeMacro) continue;
    if(field === "dimerizable"){
      appendPotenciaRangeFacet(panel, false);
      if(!shouldShowDimerizable(facetCounts)){
        state.selected.dimerizable.clear();
        continue;
      }
    }

    const facetData = (facetCounts || []).find(f => f.field_name === field);
    const counts = sortFacetCounts(facetData ? facetData.counts : []);

    const group = document.createElement("div");
    group.className = "facet-group" + (state.collapsed[field] ? " collapsed" : "");
    group.innerHTML = `
      <div class="facet-title" data-field="${field}">
        <span class="ft-label">${FACET_ICONS[field] || ""}<span>${FACET_LABELS[field]}</span></span>${CHEV_HTML}
      </div>
      <div class="facet-body"></div>
    `;
    const body = group.querySelector(".facet-body");

    if(field === "color"){
      coerceColorSelection(state.selected.color);
      appendColorSwatches(body, counts, state.selected.color);
      panel.appendChild(group);
      continue;
    }

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
      const dot = field === "variante_temperatura_filtro"
        ? `<span class="dot temp-dot" style="background:${tempDotColor(c.value)}" title="${tempCategoryLabel(c.value) || c.value}"></span>` : "";
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

  // Si no llegó a dimerizable (lista vacía rara), igual mostramos Potencia
  if(!panel.querySelector("[data-field=\"potencia\"]")){
    appendPotenciaRangeFacet(panel, false);
  }

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
      state.selected.categoria.clear();
      if(!already) state.selected.macrofamilia.add(val);
      state.page = 1;
      loadAndRender();
    });
  });

  panel.querySelectorAll('.familia-row[data-familia]').forEach(row => {
    row.addEventListener("click", () => {
      const val = row.dataset.familia;
      state.selected.familia.clear();
      state.selected.subfamilia.clear();
      state.selected.categoria.clear();
      state.selected.familia.add(val);
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
   FAMILIA — imágenes + cache de opciones (sidebar)
   ========================================================= */
const familiaImageCache = Object.create(null);
/* Lista completa de familias por macrofamilia — se guarda cuando aún no
   hay filtro de familia, así al elegir una las demás siguen visibles. */
const familiaOptionsCache = Object.create(null);

function getFamiliaImage(macro, familiaName){
  if(!familiaName) return "";
  if(familiaImageCache[familiaName]) return familiaImageCache[familiaName];

  const macroImages = (macro && SUBFAMILIA_IMAGES[macro]) || {};
  if(macroImages[familiaName]){
    familiaImageCache[familiaName] = macroImages[familiaName];
    return familiaImageCache[familiaName];
  }

  // Typesense a veces manda "Titan" y el mapa tiene "TITAN"
  const key = Object.keys(macroImages).find(k => k.toLowerCase() === String(familiaName).toLowerCase());
  if(key){
    familiaImageCache[familiaName] = macroImages[key];
    return familiaImageCache[familiaName];
  }
  return "";
}

function cacheFamiliaImagesFromHits(hits){
  (hits || []).forEach(hit => {
    const doc = hit.document || hit;
    const familia = doc.familia;
    const names = Array.isArray(familia) ? familia : (familia ? [familia] : []);
    names.forEach(name => {
      if(!name || familiaImageCache[name]) return;
      const imgs = parseImages(doc);
      if(imgs[0]) familiaImageCache[name] = optimizeImg(imgs[0], "120x120");
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
  // Familia no tiene chip: se sale volviendo desde el breadcrumb / título
  state.selected.categoria.forEach(v => chips.push({ field: "categoria", value: v }));
  if(isPotenciaRangeActive(state.potenciaMin, state.potenciaMax)){
    chips.push({ field: "potencia_range", value: `${state.potenciaMin}W – ${state.potenciaMax}W` });
  }
  if(!chips.length){ bar.style.display = "none"; return; }
  bar.style.display = "flex";
  bar.innerHTML = `<span class="label">Filtros aplicados</span>` +
    chips.map(c => {
      const label = c.field === "color" ? colorLabel(c.value) : c.value;
      return `<span class="chip" data-field="${c.field}" data-value="${c.value}">${label}<button>×</button></span>`;
    }).join("") +
    `<button class="clear-btn" id="clearAll">Borrar filtros</button>`;

  bar.querySelectorAll(".chip button").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if(chip.dataset.field === "potencia_range"){
        resetPotenciaRange();
      } else {
        state.selected[chip.dataset.field].delete(chip.dataset.value);
      }
      state.page = 1;
      loadAndRender();
    });
  });
  document.getElementById("clearAll").addEventListener("click", () => {
    CHIP_FIELDS.forEach(f => state.selected[f].clear());
    state.selected.subfamilia.clear();
    state.selected.familia.clear();
    state.selected.categoria.clear();
    resetPotenciaRange();
    state.page = 1;
    loadAndRender();
  });
}

/* =========================================================
   RENDER: CARDS
   ========================================================= */
function parseImages(doc){
  let imgs = [];
  const raw = doc.multiimagen;
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

// Specs en la card: attr1 + attr2 (misma estructura que relacionados)
function buildSpecs(doc){
  const isLuzLike = (label) => /^(luz|temperatura)/i.test(String(label || "").trim());
  return [
    { label: doc.nombre_attr1, value: doc.attr1 },
    { label: doc.nombre_attr2, value: doc.attr2 }
  ]
    .filter(attribute => attribute.label && attribute.value && !isLuzLike(attribute.label))
    .map(attribute => ({
      label: attribute.label,
      value: mergeVariantValue(doc, attribute.label, attribute.value)
    }))
    .slice(0, 2);
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
  const val = (doc.attr2 || "").toString().trim().toLowerCase();
  if(val !== "smart") return "";
  return `<span class="smart-badge">${ICON_WIFI}SMART</span>`;
}

// Paleta suave de temperatura (cálido / neutro / frío) — misma para specs y filtros
const TEMP_TONES = {
  calido: { color: "#fff79b", label: "Cálido" },
  neutro: { color: "#d9d9d9", label: "Neutro" },
  frio:   { color: "#bce4fa", label: "Frío" }
};

/* =========================================================
   COLOR FACET — círculos + unificación de variantes
   ========================================================= */
const COLOR_HEX = {
  blanco: "#f4f4f4",
  negro: "#1c1c1c",
  gris: "#9e9e9e",
  transparente: "repeating-linear-gradient(45deg,#eef2f6 0 4px,#fff 4px 8px)",
  aluminio: "#c5c9ce",
  ambar: "#ffbf00",
  platil: "#c0c0c0",
  bronce: "#b08d57",
  cobre: "#b87333",
  cromo: "#cfd4d8",
  verde: "#2e7d32",
  azul: "#1565c0",
  rojo: "#c62828",
  acero: "#8a9399"
};
const COLOR_LABELS = {
  blanco: "Blanco",
  negro: "Negro",
  gris: "Gris",
  transparente: "Transparente",
  aluminio: "Aluminio",
  ambar: "Ámbar",
  platil: "Platil",
  bronce: "Bronce",
  cobre: "Cobre",
  cromo: "Cromo",
  verde: "Verde",
  azul: "Azul",
  rojo: "Rojo",
  acero: "Acero"
};
const COLOR_LIGHT = new Set(["blanco", "transparente", "aluminio", "platil", "cromo", "ambar", "acero"]);
let colorRawByKey = new Map();
let colorFacetBaseline = []; // mantiene todos los tonos aunque haya un color seleccionado

function normColorText(value){
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function canonicalizeColorPart(part){
  let p = normColorText(part);
  if(!p) return "";
  // quita adjetivos de acabado que no cambian el color base
  p = p.replace(/\b(satinado|texturado|brillante|oscuro|claro|mate|metalizado)\b/g, " ").replace(/\s+/g, " ").trim() || p;
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
  const v = normColorText(raw);
  if(!v) return "";
  const parts = v
    .split(/\s*[-/]\s*|\s+y\s+|\s+con\s+/)
    .map(canonicalizeColorPart)
    .filter(Boolean);
  const uniq = [];
  parts.forEach(p => { if(!uniq.includes(p)) uniq.push(p); });
  return uniq.join("-") || "otros";
}

function colorLabel(key){
  if(!key) return "";
  if(COLOR_LABELS[key]) return COLOR_LABELS[key];
  return key.split("-").map(p => COLOR_LABELS[p] || (p.charAt(0).toUpperCase() + p.slice(1))).join(" / ");
}

function colorSwatchBg(key){
  const parts = String(key || "").split("-").filter(Boolean);
  if(!parts.length) return "#ccc";
  if(parts.length === 1) return COLOR_HEX[parts[0]] || "#c3cad6";
  const colors = parts.map(p => {
    const bg = COLOR_HEX[p] || "#c3cad6";
    return bg.includes("gradient") ? "#e8eef3" : bg;
  });
  if(colors.length === 2){
    return `linear-gradient(135deg, ${colors[0]} 50%, ${colors[1]} 50%)`;
  }
  const step = 100 / colors.length;
  const stops = colors.map((c, i) => `${c} ${i * step}% ${(i + 1) * step}%`).join(", ");
  return `linear-gradient(135deg, ${stops})`;
}

function isLightColorKey(key){
  return String(key || "").split("-").some(p => COLOR_LIGHT.has(p));
}

function mergeColorFacetCounts(counts){
  const map = new Map();
  (counts || []).forEach(c => {
    const key = normalizeColorKey(c.value);
    if(!key) return;
    if(!map.has(key)) map.set(key, { value: key, count: 0 });
    map.get(key).count += c.count || 0;
    if(!colorRawByKey.has(key)) colorRawByKey.set(key, new Set());
    colorRawByKey.get(key).add(c.value);
  });
  return [...map.values()].sort((a, b) => b.count - a.count || colorLabel(a.value).localeCompare(colorLabel(b.value), "es"));
}

function resolveColorFacetList(counts){
  const merged = mergeColorFacetCounts(counts);
  const colorFilterActive = state.selected.color.size > 0;
  if(!colorFilterActive){
    colorFacetBaseline = merged.map(c => ({ value: c.value, count: c.count }));
    return colorFacetBaseline.slice();
  }
  if(!colorFacetBaseline.length){
    colorFacetBaseline = merged.map(c => ({ value: c.value, count: c.count }));
  }
  const current = new Map(merged.map(c => [c.value, c.count]));
  const keys = [];
  colorFacetBaseline.forEach(c => { if(!keys.includes(c.value)) keys.push(c.value); });
  merged.forEach(c => { if(!keys.includes(c.value)) keys.push(c.value); });
  state.selected.color.forEach(k => { if(k && !keys.includes(k)) keys.push(k); });
  if(state.pending && state.pending.color){
    state.pending.color.forEach(k => { if(k && !keys.includes(k)) keys.push(k); });
  }
  return keys.map(value => ({
    value,
    count: current.has(value) ? current.get(value) : 0
  }));
}

function expandColorFilterValues(selected){
  const raw = new Set();
  [...selected].forEach(key => {
    const set = colorRawByKey.get(key);
    if(set && set.size) set.forEach(v => raw.add(v));
    else {
      raw.add(colorLabel(key));
      raw.add(key);
    }
  });
  return [...raw];
}

function coerceColorSelection(set){
  if(!set || !set.size) return;
  const next = new Set([...set].map(normalizeColorKey).filter(Boolean));
  set.clear();
  next.forEach(v => set.add(v));
}

function appendColorSwatches(container, counts, selectedSet, onToggle){
  const list = resolveColorFacetList(counts);
  if(!list.length){
    container.innerHTML = `<span class="soon-note">Sin valores disponibles.</span>`;
    return;
  }
  list.forEach(c => {
    const label = colorLabel(c.value);
    const row = document.createElement("label");
    row.className = "facet-row" + (!c.count && !selectedSet.has(c.value) ? " is-empty" : "");
    const checked = selectedSet.has(c.value) ? "checked" : "";
    const light = isLightColorKey(c.value) ? " light" : "";
    row.innerHTML = `
      <span class="cb-wrap">
        <input type="checkbox" data-field="color" data-value="${c.value}" ${checked}>
        <span class="box">${ICON_CHECK}</span>
      </span>
      <span class="dot color-dot${light}" style="background:${colorSwatchBg(c.value)}" title="${label}"></span>
      <span>${label}</span>
      <span class="count">${c.count}</span>
    `;
    if(typeof onToggle === "function"){
      row.querySelector("input").addEventListener("click", (e) => e.stopPropagation());
      row.addEventListener("click", (e) => {
        e.preventDefault();
        onToggle(c.value);
      });
    }
    container.appendChild(row);
  });
}

function tempCategoryKey(value){
  const raw = String(value || "").trim().toLowerCase();
  if(/c[aá]lido/.test(raw)) return "calido";
  if(/neutro/.test(raw)) return "neutro";
  if(/fr[ií]o/.test(raw)) return "frio";
  const k = parseInt(value, 10);
  if(Number.isNaN(k)) return null;
  if(k <= 3000) return "calido";
  if(k <= 4500) return "neutro";
  return "frio";
}

function tempCategoryColor(value){
  const key = tempCategoryKey(value);
  return key ? TEMP_TONES[key].color : null;
}

function tempCategoryLabel(value){
  const key = tempCategoryKey(value);
  return key ? TEMP_TONES[key].label : "";
}

function tempDotColor(value){
  return tempCategoryColor(value) || CCT_DOT[value] || "#ccc";
}

function getLuzToneSource(doc, fallbackValue){
  const isVariantLuz = String(doc.nombre_attr_variantes || "").trim().toLowerCase() === "luz" && doc.attr_variantes;
  return isVariantLuz ? doc.attr_variantes : fallbackValue;
}

function buildLuzCategoryKeys(doc, fallbackValue){
  const source = getLuzToneSource(doc, fallbackValue);
  if(!source) return [];

  const tones = String(source).split(";").map(t => t.trim()).filter(Boolean);
  const bestKelvinByKey = new Map();
  tones.forEach(t => {
    const key = tempCategoryKey(t);
    if(!key) return;
    const k = parseInt(t, 10);
    const sortK = Number.isNaN(k) ? (key === "calido" ? 2700 : key === "neutro" ? 4000 : 6500) : k;
    if(!bestKelvinByKey.has(key) || sortK < bestKelvinByKey.get(key)){
      bestKelvinByKey.set(key, sortK);
    }
  });

  return [...bestKelvinByKey.entries()]
    .sort((a, b) => a[1] - b[1])
    .map(([key]) => key);
}

function buildLuzCategoryLabel(doc, fallbackValue){
  const keys = buildLuzCategoryKeys(doc, fallbackValue);
  if(!keys.length) return "";
  return keys.map(key => TEMP_TONES[key].label).join(" · ");
}

function buildLuzDots(doc, fallbackValue){
  const keys = buildLuzCategoryKeys(doc, fallbackValue);
  if(!keys.length) return "";
  return keys.map(key => {
    const { color, label } = TEMP_TONES[key];
    return `<span class="dot luz-dot" style="background:${color}" title="${label}" aria-label="${label}"></span>`;
  }).join("");
}

// Pill en la foto (abajo derecha): solo círculos; al hover se deslizan los nombres
function buildLuzMediaDots(doc){
  const isVariantLuz = String(doc.nombre_attr_variantes || "").trim().toLowerCase() === "luz";
  const fallback = isVariantLuz
    ? (doc.attr_variantes || doc.attr3 || "")
    : (doc.attr3 || "");
  const keys = buildLuzCategoryKeys(doc, fallback);
  if(!keys.length) return "";

  const collapsed = keys.length >= 2 ? " is-collapsed" : "";
  const rows = keys.map(key => {
    const { color, label } = TEMP_TONES[key];
    return `<span class="temp-dots-row"><span class="temp-dots-label">${label}</span><span class="dot luz-dot" style="background:${color}" title="${label}" aria-label="${label}"></span></span>`;
  }).join("");

  return `<span class="temp-dots${collapsed}" tabindex="0" aria-label="Temperatura de luz">${rows}</span>`;
}

function cardTemplate(doc){
  const imgs = parseImages(doc);
  // Todas las imágenes de la card se re-escriben hacia CloudFront/webp
  const optimizedImgs = imgs.map(i => optimizeImg(i, "500x500"));
  const nVariants = Array.isArray(doc.variantes_sku) ? doc.variantes_sku.length : 0;
  const variantIcon = variantAttrIcon(doc.nombre_attr_variantes);

  const specs = buildSpecs(doc);
  const specsHtml = specs.length
    ? specs.map(s =>
        `<div class="spec"><span class="spec-label">${s.label}</span><span class="val">${s.value}</span></div>`
      ).join("")
    : "";

  const productHref = doc.link_ficha_web || "";
  const sku = (doc.sku || doc.id || "").toString();
  const escAttr = (s) => (s || "").toString().replace(/"/g, "&quot;");
  const overlaysHtml = [
    nVariants > 1 ? `<span class="badge">${variantIcon}${nVariants} variantes</span>` : "",
    buildLuzMediaDots(doc)
  ].filter(Boolean).join("");

  return `
    <div class="card"${productHref ? ` role="link" tabindex="0"` : ""} data-sku="${escAttr(sku)}"${productHref ? ` data-href="${escAttr(productHref)}"` : ""}>
      <div class="media">
        <div class="media-frame">
          <div class="media-badges-left">
            ${buildSmartBadge(doc)}
          </div>
          ${optimizedImgs.length ? `<img src="${optimizedImgs[0]}" alt="${doc.nombre_typesense || ""}" data-idx="0" data-imgs='${JSON.stringify(optimizedImgs)}' loading="lazy" decoding="async">` : `<span style="color:#c3c9d1;font-size:12px">Sin imagen</span>`}
          ${optimizedImgs.length > 1 ? `<div class="nav-arrow prev">${ICON_CHEVRON_LEFT}</div><div class="nav-arrow next">${ICON_CHEVRON_RIGHT}</div>` : ""}
        </div>
        ${overlaysHtml ? `<div class="card-overlays">${overlaysHtml}</div>` : ""}
      </div>
      <div class="card-body">
        <div class="card-title">${doc.nombre_typesense || "Producto sin nombre"}</div>
        ${specsHtml ? `<div class="specs">${specsHtml}</div>` : ""}
      </div>
      <label class="compare-row">
        <span class="cb-wrap">
          <input type="checkbox" class="compare-checkbox"
            data-sku="${escAttr(sku)}"
            data-nombre="${escAttr(doc.nombre_typesense || "Producto sin nombre")}"
            data-img="${escAttr(optimizeImg(imgs[0], "150x150") || "")}">
          <span class="box">${ICON_CHECK}</span>
        </span> Comparar
      </label>
    </div>
  `;
}

function wireCardLinks(){
  document.querySelectorAll(".card[data-href]").forEach(card => {
    const go = () => {
      const href = card.dataset.href;
      if(href) window.location.href = href;
    };
    card.addEventListener("click", (e) => {
      if(e.target.closest(".compare-row, .nav-arrow, .temp-dots, a, button, input, label")){
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      go();
    });
    card.addEventListener("keydown", (e) => {
      if(e.key !== "Enter" && e.key !== " ") return;
      if(e.target.closest(".compare-row, .nav-arrow, .temp-dots, a, button, input, label")) return;
      e.preventDefault();
      go();
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
    document.body.style.removeProperty("--compare-bar-offset");
    document.body.classList.remove("has-compare-bar");
    return;
  }
  const offset = bar.offsetHeight + 28;
  document.body.style.paddingBottom = offset + "px";
  document.body.style.setProperty("--compare-bar-offset", offset + "px");
  document.body.classList.add("has-compare-bar");
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
      <div class="thumb">${p.img ? `<img src="${p.img}" alt="" loading="lazy">` : ""}</div>
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
  document.querySelectorAll(".compare-row").forEach(row => {
    const cb = row.querySelector(".compare-checkbox");
    if(!cb || cb.dataset.wired === "1") return;
    cb.dataset.wired = "1";

    const applyCompareState = () => {
      const { sku, nombre, img } = cb.dataset;
      if(cb.checked){
        const updated = window.MacroledCompare.addToCompare({ sku, nombre, img });
        if(!updated.some(p => p.sku === sku)) cb.checked = false; // ya estaba en el máximo
      } else {
        window.MacroledCompare.removeFromCompare(sku);
      }
      renderCompareBar();
      syncCompareCheckboxes();
    };

    // Toda la franja inferior de la card selecciona comparar (no navega a la ficha)
    row.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if(cb.disabled) return;
      cb.checked = !cb.checked;
      applyCompareState();
    });
    cb.addEventListener("change", applyCompareState);
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
  const cards = grid.querySelectorAll(".card");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  cards.forEach((card, i) => {
    if(reduceMotion) return;
    card.classList.add("is-entering");
    card.style.setProperty("--stagger", String(Math.min(i, 14)));
    const clear = () => {
      card.classList.remove("is-entering");
      card.style.removeProperty("--stagger");
      card.removeEventListener("animationend", clear);
    };
    card.addEventListener("animationend", clear);
  });
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
   RENDER: BREADCRUMB (Inicio > Productos > Macrofamilia / búsqueda)
   ========================================================= */
function renderBreadcrumb(){
  const holder = document.getElementById("breadcrumb");
  const active = [...state.selected.macrofamilia][0];
  const activeFamilia = [...state.selected.familia][0];

  function clearToProductos(){
    state.query = "";
    state.selected.macrofamilia.clear();
    state.selected.subfamilia.clear();
    state.selected.familia.clear();
    state.selected.categoria.clear();
    state.page = 1;
    history.pushState({}, "", location.pathname);
    loadAndRender();
  }

  function clearToMacro(){
    state.selected.subfamilia.clear();
    state.selected.familia.clear();
    state.selected.categoria.clear();
    state.page = 1;
    loadAndRender();
  }

  if(state.query){
    holder.innerHTML = `Inicio &nbsp;›&nbsp; <a id="crumbProductos">Productos</a> &nbsp;›&nbsp; <b class="crumb-active">Resultados para "${state.query}"</b>`;
    document.getElementById("crumbProductos").addEventListener("click", clearToProductos);
    return;
  }

  if(!active){
    holder.innerHTML = `Inicio &nbsp;›&nbsp; <b>Productos</b>`;
    return;
  }

  if(activeFamilia){
    holder.innerHTML = `Inicio &nbsp;›&nbsp; <a id="crumbProductos">Productos</a> &nbsp;›&nbsp; <a id="crumbMacro">${active}</a> &nbsp;›&nbsp; <b class="crumb-active">${activeFamilia}</b>`;
    document.getElementById("crumbProductos").addEventListener("click", clearToProductos);
    document.getElementById("crumbMacro").addEventListener("click", clearToMacro);
    return;
  }

  holder.innerHTML = `Inicio &nbsp;›&nbsp; <a id="crumbProductos">Productos</a> &nbsp;›&nbsp; <b class="crumb-active">${active}</b>`;
  document.getElementById("crumbProductos").addEventListener("click", clearToProductos);
}

/* =========================================================
   RENDER: ENCABEZADO DE MACROFAMILIA / FAMILIA / BÚSQUEDA
   ========================================================= */
function renderCategoryHeading(found){
  const holder = document.getElementById("categoryHeading");
  const active = [...state.selected.macrofamilia][0];
  const activeFamilia = [...state.selected.familia][0];

  if(state.query){
    holder.hidden = false;
    holder.innerHTML = `<h1>Resultados para "${state.query}"</h1><div class="count">${found} resultados</div>`;
    return;
  }

  if(activeFamilia){
    holder.hidden = false;
    holder.innerHTML = `<h1>${activeFamilia}</h1><div class="count">${found} resultados</div>`;
    return;
  }

  if(!active){
    holder.hidden = false;
    holder.innerHTML = `<h1>Productos</h1><div class="count">${found} productos</div>`;
    return;
  }
  holder.hidden = false;
  holder.innerHTML = `<h1>${active}</h1><div class="count">${found} resultados</div>`;
}

/* =========================================================
   MAIN LOAD
   ========================================================= */
let initialPreloadDone = false;
function finishInitialPreload(){
  if(initialPreloadDone) return;
  initialPreloadDone = true;
  if(window.MacroledPreload) window.MacroledPreload.done();
}

async function loadAndRender(){
  const gridShell = document.getElementById("gridShell");
  const showingLabel = document.getElementById("showingLabel");
  const isRefilter = initialPreloadDone;

  if(isRefilter && gridShell){
    gridShell.classList.add("is-filtering");
    gridShell.setAttribute("aria-busy", "true");
  } else {
    showingLabel.textContent = "Cargando productos…";
  }

  try{
    const data = await searchTypesense();
    if(!data){
      finishInitialPreload();
      return;
    }

    window._lastHits = data.hits;
    cacheFamiliaImagesFromHits(data.hits);
    renderFacets(data.facet_counts);
    renderMobileFilters(data.facet_counts);
    renderBreadcrumb();
    renderCategoryHeading(data.found);
    renderCategoryBanner();
    renderChips();
    renderCards(data.hits, data.found);
    renderPagination(data.found);
    renderCompareBar();

    const from = data.hits.length ? (state.page - 1) * PER_PAGE + 1 : 0;
    const to = (state.page - 1) * PER_PAGE + data.hits.length;
    showingLabel.textContent = `${to} de ${data.found} productos`;

    const applyBtn = document.getElementById("filtersApply");
    if(applyBtn) applyBtn.textContent = `Ver ${data.found} resultado${data.found === 1 ? "" : "s"}`;

    finishInitialPreload();
  }finally{
    if(gridShell){
      gridShell.classList.remove("is-filtering");
      gridShell.setAttribute("aria-busy", "false");
    }
  }
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
const filtersCollapseBtn = document.getElementById("filtersCollapseBtn");
const filtersExpandBtn = document.getElementById("filtersExpandBtn");
const layoutEl = document.querySelector(".layout");
const FILTERS_COLLAPSED_KEY = "macroled-filters-collapsed";

function setFiltersCollapsed(collapsed){
  if(!layoutEl) return;
  layoutEl.classList.toggle("filters-collapsed", !!collapsed);
  try{ localStorage.setItem(FILTERS_COLLAPSED_KEY, collapsed ? "1" : "0"); }catch(_){}
}

function initFiltersCollapsed(){
  let collapsed = false;
  try{ collapsed = localStorage.getItem(FILTERS_COLLAPSED_KEY) === "1"; }catch(_){}
  setFiltersCollapsed(collapsed);
}

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
const filtersDesktopHeading = document.querySelector(".filters-desktop-heading");
if(filtersDesktopHeading){
  filtersDesktopHeading.addEventListener("click", () => setFiltersCollapsed(true));
} else if(filtersCollapseBtn){
  filtersCollapseBtn.addEventListener("click", () => setFiltersCollapsed(true));
}
if(filtersExpandBtn){
  filtersExpandBtn.addEventListener("click", () => setFiltersCollapsed(false));
}
initFiltersCollapsed();
filtersApply.addEventListener("click", async () => {
  // Recién acá se aplican de verdad los filtros elegidos en el drawer
  Object.keys(state.pending).forEach(f => { state.selected[f] = new Set(state.pending[f]); });
  state.sortBy = state.pendingSortBy;
  state.potenciaMin = state.pendingPotenciaMin;
  state.potenciaMax = state.pendingPotenciaMax;
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
const FMN_ORDER = ["macrofamilia", "familia", "subfamilia", "categoria", "variante_temperatura_filtro", "color", "potencia", "dimerizable"];
const FMN_LABELS = {
  macrofamilia: "Productos",
  familia: "Familia",
  subfamilia: "Subfamilia",
  categoria: "Categoría",
  variante_temperatura_filtro: "Temperatura color",
  color: "Color",
  potencia: "Potencia",
  dimerizable: "Dimerizable"
};

function syncPendingFromCommitted(){
  Object.keys(state.pending).forEach(f => { state.pending[f] = new Set(state.selected[f]); });
  coerceColorSelection(state.pending.color);
  state.pendingSortBy = state.sortBy;
  ensurePotenciaSelectionDefaults();
  state.pendingPotenciaMin = state.potenciaMin;
  state.pendingPotenciaMax = state.potenciaMax;
}

function fmnSummary(field){
  if(field === "potencia"){
    if(!isPotenciaRangeActive(state.pendingPotenciaMin, state.pendingPotenciaMax)) return "";
    return `${state.pendingPotenciaMin}W – ${state.pendingPotenciaMax}W`;
  }
  const set = state.pending[field];
  if(!set || !set.size) return "";
  if(field === "color") return [...set].map(colorLabel).join(", ");
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
    const hasFamilia = state.pending.familia.size > 0;
    if(field === "familia" && (!activeMacro || hasFamilia)) return;
    if(field === "subfamilia" && !hasFamilia) return;
    if(field === "categoria" && !hasFamilia) return;
    if((field === "familia" || field === "subfamilia" || field === "categoria") && !activeMacro) return;
    if(field === "potencia"){
      rows.push({ field, label: FMN_LABELS[field], summary: fmnSummary(field), counts: [] });
      return;
    }
    if(field === "dimerizable"){
      if(!shouldShowDimerizable(lastFacetCounts)){
        state.pending.dimerizable.clear();
        return;
      }
    }
    const data = lastFacetCounts.find(f => f.field_name === field);
    const counts = sortFacetCounts(data ? data.counts : []);
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
  const tempDot = field === "variante_temperatura_filtro"
    ? `<span class="dot temp-dot" style="background:${tempDotColor(c.value)}" title="${tempCategoryLabel(c.value) || c.value}"></span>` : "";
  const colorDot = field === "color"
    ? `<span class="dot color-dot${isLightColorKey(c.value) ? " light" : ""}" style="background:${colorSwatchBg(c.value)}" title="${colorLabel(c.value)}"></span>` : "";
  const label = field === "color" ? colorLabel(c.value) : c.value;
  const activeMacro = [...state.pending.macrofamilia][0];
  const thumb = field === "familia" && activeMacro
    ? (() => { const src = getFamiliaImage(activeMacro, c.value); return src ? `<img class="facet-thumb" src="${src}" alt="">` : ""; })()
    : "";
  if(field === "familia"){
    return `
      <div class="fmn-option-row${checked ? " active" : ""}" data-value="${c.value}">
        ${thumb}<span>${label}</span>
        ${c.count !== null && c.count !== undefined ? `<span class="fmn-count">${c.count}</span>` : ""}
      </div>
    `;
  }
  return `
    <div class="fmn-option-row${checked ? " active" : ""}${field === "color" && !c.count && !checked ? " is-empty" : ""}" data-value="${c.value}">
      <span class="fmn-checkbox">${checked ? ICON_CHECK : ""}</span>
      ${thumb}${tempDot}${colorDot}<span>${label}</span>
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
  const filterParts = ["tipo_registro:=producto"];
  for(const field of FACET_FIELDS){
    const vals = field === "color"
      ? expandColorFilterValues(state.pending.color)
      : [...state.pending[field]];
    if(vals.length){
      const escaped = vals.map(v => `\`${v}\``).join(",");
      filterParts.push(`${field}:=[${escaped}]`);
    }
  }
  const activeMacro = [...state.pending.macrofamilia][0];
  if(activeMacro && state.pending.familia.size){
    const escaped = [...state.pending.familia].map(v => `\`${v}\``).join(",");
    filterParts.push(`${FAMILIA_FIELD}:=[${escaped}]`);
  }
  if(activeMacro && state.pending.familia.size && state.pending.subfamilia.size){
    const escaped = [...state.pending.subfamilia].map(v => `\`${v}\``).join(",");
    filterParts.push(`${SUBFAMILIA_FIELD}:=[${escaped}]`);
  }
  if(activeMacro && state.pending.familia.size){
    for(const field of EXTRA_FACET_FIELDS){
      const vals = [...state.pending[field]];
      if(vals.length){
        const escaped = vals.map(v => `\`${v}\``).join(",");
        filterParts.push(`${field}:=[${escaped}]`);
      }
    }
  }
  const potClause = potenciaFilterClause(state.pendingPotenciaMin, state.pendingPotenciaMax);
  if(potClause) filterParts.push(potClause);
  const params = new URLSearchParams({ q: state.query || "*", query_by: "nombre_typesense,sku,descripcion", per_page: "1", page: "1" });
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
    const counts = sortFacetCounts(cached);
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
        state.pending.categoria.clear();
        if(!already) state.pending.macrofamilia.add(val);
        renderMobileFilters(lastFacetCounts);
        openDetailScreen("macrofamilia");
        updatePendingResultsCount();
      });
    });
  } else if(field === "familia"){
    titleEl.textContent = FMN_LABELS.familia;
    const activeMacro = [...state.pending.macrofamilia][0];
    const data = lastFacetCounts.find(f => f.field_name === "familia");
    let counts = sortFacetCounts(data ? data.counts : []);
    if(activeMacro && familiaOptionsCache[activeMacro]){
      counts = familiaOptionsCache[activeMacro];
    }
    bodyEl.innerHTML = counts.map(c => fmnCheckboxRowHtml("familia", c)).join("");
    bodyEl.querySelectorAll(".fmn-option-row").forEach(row => {
      row.addEventListener("click", () => {
        const val = row.dataset.value;
        state.pending.familia.clear();
        state.pending.subfamilia.clear();
        state.pending.categoria.clear();
        state.pending.familia.add(val);
        renderMobileFilters(lastFacetCounts);
        goToListScreen();
        updatePendingResultsCount();
      });
    });
  } else if(field === "subfamilia"){
    titleEl.textContent = "Subfamilia";
    const data = lastFacetCounts.find(f => f.field_name === "subfamilia");
    const counts = sortFacetCounts(data ? data.counts : []);
    bodyEl.innerHTML = counts.map(c => fmnCheckboxRowHtml("subfamilia", c)).join("");
    fmnWireCheckboxRows(bodyEl, "subfamilia");
  } else if(field === "potencia"){
    titleEl.textContent = "Potencia";
    ensurePotenciaSelectionDefaults();
    bodyEl.innerHTML = potenciaRangeHtml(state.pendingPotenciaMin, state.pendingPotenciaMax);
    wirePotenciaRange(bodyEl.querySelector(".potencia-range"), {
      pending: true,
      onCommit: () => {
        renderMobileFilters(lastFacetCounts);
        updatePendingResultsCount();
      }
    });
  } else if(field === "color"){
    titleEl.textContent = FMN_LABELS.color;
    coerceColorSelection(state.pending.color);
    const data = lastFacetCounts.find(f => f.field_name === "color");
    const counts = resolveColorFacetList(data ? data.counts : []);
    bodyEl.classList.remove("fmn-color-swatches");
    bodyEl.innerHTML = counts.map(c => fmnCheckboxRowHtml("color", c)).join("");
    fmnWireCheckboxRows(bodyEl, "color");
  } else {
    titleEl.textContent = FMN_LABELS[field];
    bodyEl.classList.remove("fmn-color-swatches");
    const data = lastFacetCounts.find(f => f.field_name === field);
    const counts = sortFacetCounts(data ? data.counts : []);
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
    state.selected.categoria.clear();
  }
}

initSearchQueryFromURL();
loadMacrofamiliaOptions();
loadPotenciaOptions().then(() => {
  // Re-render facets si ya cargó el catálogo, para que el slider tenga bounds reales
  if(document.getElementById("filtersPanel")?.children.length){
    renderFacets(lastFacetCounts);
  }
});
loadAndRender();

/* === Asistente === */
/**
 * asistente.js — Motor compartido del asistente de producto Macroled.
 *
 * Contiene TODO lo que es igual sin importar la página: abrir/cerrar el
 * panel, mandar mensajes, mostrar "escribiendo", pintar las sugerencias,
 * y el flujo ask() que intenta Capa 1 (si la página se la da) antes de
 * pasar a Capa 2 (el agente de IA en n8n).
 *
 * Lo que cambia por página (specs locales o no, qué mandarle al webhook,
 * qué sugerencias mostrar, el saludo inicial) se pasa como configuración
 * desde el script propio de esa página — ver ejemplos al final del archivo.
 *
 * USO:
 *   window.MacroledAssistant.init({
 *     greeting: "Hola...",
 *     getPayload: (pregunta) => ({ pregunta, sku: "...", ... }),
 *     localAnswer: (pregunta) => "..." | null,   // opcional — si no se
 *                                                  // pasa, siempre va a IA
 *     suggestions: () => ["...", "..."],          // opcional
 *     fallbackHtml: () => "...",                  // opcional
 *   });
 *
 * Requiere que el HTML de la página tenga el mismo markup del widget que
 * ya usa la ficha (#aiLaunch, #aiPanel, #aiBackdrop, #aiMessages,
 * #aiTyping, #aiSuggestions, #aiForm, #aiInput, #aiClose). El botón
 * #openAssistantFromCta es opcional (solo existe en la ficha).
 */
(function () {
  "use strict";

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
    const openFromCta = document.getElementById("openAssistantFromCta"); // opcional, solo en ficha

    if (!aiPanel || !aiForm || !aiMessages) {
      console.warn("[asistente] Faltan elementos del widget en el DOM de esta página — no se inicializa.");
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
      // Doble rAF para que el browser pinte el estado cerrado antes de animar
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
          body: JSON.stringify(getPayload(question)),
        });
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        // El "Respond to Webhook" de n8n a veces envuelve el resultado en
        // un array de 1 item ([{ respuesta: "..." }]) y a veces manda el
        // objeto suelto ({ respuesta: "..." }) — aceptamos las dos formas.
        const item = Array.isArray(data) ? data[0] : data;
        const texto = item && (item.respuesta || item.output || item.answer);
        if (!texto) throw new Error("Respuesta vacía del agente");

        // El \n del agente -> <br> para que se vea bien en el chat
        return String(texto).replace(/\n/g, "<br>");
      } catch (err) {
        clearTimeout(timeoutId);
        console.warn("[asistente] error consultando IA:", err);
        return fallbackHtml();
      }
    }

    /**
     * Flujo principal: si la página dio un localAnswer (Capa 1, gratis e
     * instantánea), se prueba primero; si no hay dato o la página no la
     * definió (ej. catálogo, sin un producto puntual), va directo a la
     * Capa 2 (agente con IA sobre el catálogo completo).
     */
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
        // Capa 1: gratis e instantánea, pero dejamos un pequeño delay
        // para que no se sienta robótico / demasiado abrupto.
        await new Promise((r) => setTimeout(r, 300 + Math.random() * 250));
      } else {
        // Capa 2: agente con IA sobre el catálogo completo
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

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && aiPanel.classList.contains("is-open")) closeAssistant();
    });

    addMsg("bot", greeting);
    renderSuggestions();

    // Se expone por si la página necesita refrescar las sugerencias desde
    // afuera (ej. la ficha, cuando el usuario cambia de variante/color y
    // los specs disponibles cambian).
    window.MacroledAssistantOpen = openAssistant;
    return { openAssistant, closeAssistant, renderSuggestions, ask };
  }

  window.MacroledAssistant = { init };
})();

/**
 * asistente-catalogo.js — Glue específico de la página de catálogo/búsqueda.
 *
 * A diferencia de la ficha, acá NO hay un producto puntual ni specs
 * cargados en el DOM (los resultados salen dinámicos de Typesense), así
 * que no tiene sentido una Capa 1 de reglas locales: se pasa directo a la
 * Capa 2 (el agente de n8n con el tool de búsqueda sobre el catálogo
 * completo). Por eso no se define "localAnswer" al llamar a init().
 *
 * Requiere:
 * - Que "asistente.js" esté cargado ANTES que este archivo.
 * - Que el HTML de esta página tenga el mismo markup del widget que usa
 *   la ficha (#aiLaunch, #aiPanel, etc.) — ver nota al pie de este archivo.
 * - Que exista el objeto global "state" (ya lo tiene catalogo.js, con los
 *   filtros activos: state.selected.{macrofamilia,color,...} y
 *   state.query).
 */
(function () {
  "use strict";

  if (!window.MacroledAssistant) {
    console.warn("[asistente-catalogo] asistente.js no cargó — revisá el orden de los scripts en el HTML.");
    return;
  }

  /* Solo dos sugerencias fijas; al elegir una, el widget la saca de la lista. */
  function buildCatalogSuggestions() {
    return [
      "¿Qué luz me conviene para un living?",
      "Busco algo para iluminar un local comercial",
    ];
  }

  /* Le manda al webhook la pregunta + los filtros/búsqueda activos en ese
     momento, para que el agente tenga contexto de qué está mirando el
     usuario (aunque el tool de búsqueda del agente ya resuelve bastante
     esto solo, buscando en todo el catálogo). */
  function getCatalogPayload(question) {
    const s = window.state || {};
    const selected = s.selected || {};
    const filtros = {};
    ["macrofamilia", "familia", "subfamilia", "categoria", "variante_temperatura_filtro", "color", "dimerizable"].forEach((field) => {
      if (selected[field] && selected[field].size) {
        filtros[field] = [...selected[field]];
      }
    });
    return {
      pregunta: question,
      contexto: "catalogo",
      busqueda: s.query || "",
      filtros,
    };
  }

  function catalogFallbackHtml() {
    return `No pude encontrar información sobre esa consulta. Podés seguir explorando el catálogo con los filtros de la izquierda, o probar con otra pregunta.`;
  }

  try {
    window.MacroledAssistant.init({
      greeting: `Hola, soy el asistente de <b>productos Macroled</b>. Estoy para ayudarte a encontrar productos y soluciones según tus necesidades de iluminación.`,
      suggestions: buildCatalogSuggestions,
      getPayload: getCatalogPayload,
      fallbackHtml: catalogFallbackHtml,
      // Sin "localAnswer": esta página siempre va directo a la Capa 2.
    });
  } catch (err) {
    console.error("[asistente-catalogo] no se pudo inicializar:", err);
  }
})();
