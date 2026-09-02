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
const BASE_FILTER = "tipo_registro:=producto && es_principal:true";
const PER_PAGE = 18;
const PER_PAGE_WIDE = 18;

function getPerPage(){
  return window.matchMedia("(min-width:1600px)").matches ? PER_PAGE_WIDE : PER_PAGE;
}

const FACET_FIELDS = ["macrofamilia", "variante_temperatura_filtro", "color", "dimerizable"];
const SUBFAMILIA_FIELD = "subfamilia";
const FAMILIA_FIELD = "familia";
// Categoría solo se muestra/filtra cuando ya hay una Subfamilia elegida.
const CATEGORIA_FIELD = "categoria";
const POTENCIA_RAW_FIELD = "potencia";
const EXTRA_FACET_FIELDS = [CATEGORIA_FIELD];

const FACET_LABELS = {
  macrofamilia: "Macrofamilia",
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

function sourceImg(url){
  const u = String(url || "").trim();
  if(!u) return "";
  const m = u.match(/cloudfront\.net\/(?:fit-in\/[^/]+\/)?(?:filters:[^/]+\/)?(.+)$/i);
  return m ? `https://s3.coresagroup.com/${m[1]}` : u;
}

function escAttr(s){
  return (s || "").toString().replace(/"/g, "&quot;");
}

/* ---------------------------------------------------------
   BANNERS DE PORTADA — arriba de la grilla de productos.
   Prioridad: familia > macrofamilia. Sin match = sin banner.
   "video" opcional; si no hay, usa "poster"; si tampoco, no hay media.
   --------------------------------------------------------- */
const MACROFAMILIA_BANNERS = {
  // "Tiras LED": {
  //   video: "https://s3.coresagroup.com/MACROLED/videos/tiras-led-banner.mp4",
  //   poster: `${CDN_HOST}/fit-in/1600x500/filters:format(webp)/MACROLED/WEB/banner-tiras-led.jpg`,
  // },
};

const HIGHBAY_PRO_BANNER = {
  video: "https://s3.coresagroup.com/MACROLED/video/productos/HIGHBAYPRO_HORIZONTAL_EXPORT.mp4",
  poster: `${CDN_HOST}/fit-in/1600x500/filters:format(webp)/MACROLED/250/PHB-200W-90D-857-CW.png`,
};
const FAMILIA_BANNERS = {
};
const SUBFAMILIA_BANNERS = {
  "Highbay PRO 2026": HIGHBAY_PRO_BANNER,
  "HIGHBAY PRO 2026": HIGHBAY_PRO_BANNER,
};

const BANNER_ICON_PAUSE = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>`;
const BANNER_ICON_PLAY = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>`;
let _activeBannerKey = "";
const _bannerVideoPrefetch = Object.create(null);

function allBannerVideoUrls(){
  const urls = [];
  [FAMILIA_BANNERS, SUBFAMILIA_BANNERS, MACROFAMILIA_BANNERS].forEach(map => {
    Object.keys(map).forEach(k => {
      if(map[k] && map[k].video) urls.push(map[k].video);
    });
  });
  return urls;
}

/* Calienta caché del navegador para que al filtrar el video arranque más rápido. */
function prefetchBannerVideo(url){
  if(!url || _bannerVideoPrefetch[url]) return;
  _bannerVideoPrefetch[url] = true;

  const link = document.createElement("link");
  link.rel = "prefetch";
  link.as = "fetch";
  link.href = url;
  link.crossOrigin = "anonymous";
  document.head.appendChild(link);

  const warm = document.createElement("video");
  warm.preload = "auto";
  warm.muted = true;
  warm.playsInline = true;
  warm.setAttribute("playsinline", "");
  warm.src = url;
  warm.load();
  _bannerVideoPrefetch[url + ":el"] = warm;
}

function prefetchAllBannerVideos(){
  allBannerVideoUrls().forEach(prefetchBannerVideo);
}

function normalizeBannerKey(value){
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isHighbayPro2026(name){
  const n = normalizeBannerKey(name);
  return n.includes("highbay") && n.includes("pro") && n.includes("2026");
}

function isHighbayProFamilia(name){
  const n = normalizeBannerKey(name);
  return n.includes("highbay") && n.includes("pro") && !n.includes("standard") && !n.includes("classic");
}

function lookupBannerKey(map, name){
  if(!name || !map) return "";
  if(map[name]) return name;
  const nName = normalizeBannerKey(name);
  return Object.keys(map).find(k => normalizeBannerKey(k) === nName) || "";
}

function lookupBannerData(familia, macro, subfamilias){
  const subList = [...(subfamilias || [])];
  if(subList.length === 1){
    const sub = subList[0];
    const subKey = lookupBannerKey(SUBFAMILIA_BANNERS, sub);
    if(subKey) return SUBFAMILIA_BANNERS[subKey];
  }
  const famKey = lookupBannerKey(FAMILIA_BANNERS, familia);
  if(famKey) return FAMILIA_BANNERS[famKey];
  const macroKey = lookupBannerKey(MACROFAMILIA_BANNERS, macro);
  if(macroKey) return MACROFAMILIA_BANNERS[macroKey];
  return null;
}

function wireBannerVideoControls(holder){
  const video = holder.querySelector(".category-banner__media");
  const playBtn = holder.querySelector(".category-banner__toggle");
  if(!video || !(video instanceof HTMLVideoElement)) return;

  const syncPlayBtn = () => {
    if(!playBtn) return;
    const paused = video.paused;
    playBtn.setAttribute("aria-label", paused ? "Reproducir video" : "Pausar video");
    playBtn.title = paused ? "Reproducir" : "Pausar";
    playBtn.classList.toggle("is-paused", paused);
    playBtn.innerHTML = paused ? BANNER_ICON_PLAY : BANNER_ICON_PAUSE;
  };

  const tryPlay = () => {
    video.play().catch(() => {});
  };

  if(video.readyState >= 2) tryPlay();
  else video.addEventListener("canplay", tryPlay, { once: true });

  holder.addEventListener("click", () => {
    if(video.paused) tryPlay();
    else video.pause();
  });
  video.addEventListener("play", syncPlayBtn);
  video.addEventListener("pause", syncPlayBtn);
  syncPlayBtn();
}

function renderCategoryBanner(){
  const holder = document.getElementById("categoryBanner");
  if(!holder) return;
  const activeMacro = [...state.selected.macrofamilia][0];
  const activeFamilia = [...state.selected.familia][0];
  const activeSubfamilias = [...state.selected.subfamilia];
  const data = lookupBannerData(activeFamilia, activeMacro, activeSubfamilias);
  const bannerKey = data
    ? `${activeFamilia || ""}|${activeSubfamilias.sort().join(",")}|${activeMacro || ""}|${data.video || data.poster || ""}`
    : "";

  /* Si ya eligió familia/subfamilia relacionada, anticipar descarga del video. */
  if(isHighbayProFamilia(activeFamilia) || activeSubfamilias.some(isHighbayPro2026)){
    prefetchBannerVideo(HIGHBAY_PRO_BANNER.video);
  }

  if(!data){
    _activeBannerKey = "";
    holder.hidden = true;
    holder.innerHTML = "";
    holder.classList.remove("has-video", "is-loading");
    return;
  }

  if(bannerKey === _activeBannerKey && !holder.hidden) return;
  _activeBannerKey = bannerKey;

  let mediaHtml = "";
  if(data.video){
    prefetchBannerVideo(data.video);
    mediaHtml = `
      <video class="category-banner__media" src="${data.video}" autoplay muted loop playsinline preload="auto"
        ${data.poster ? `poster="${data.poster}"` : ""}>
      </video>
      <button type="button" class="category-banner__toggle" aria-label="Pausar video" title="Pausar">
        ${BANNER_ICON_PAUSE}
      </button>`;
  } else if(data.poster){
    mediaHtml = `<img class="category-banner__media" src="${data.poster}" alt="">`;
  }

  holder.hidden = false;
  holder.classList.toggle("has-video", !!data.video);
  holder.classList.add("is-loading");
  holder.innerHTML = mediaHtml;
  if(data.video){
    const video = holder.querySelector(".category-banner__media");
    if(video){
      const clearLoading = () => holder.classList.remove("is-loading");
      video.addEventListener("canplay", clearLoading, { once: true });
      video.addEventListener("playing", clearLoading, { once: true });
    }
    wireBannerVideoControls(holder);
  } else {
    holder.classList.remove("is-loading");
  }
}

const CCT_DOT = {
  "2000K": "#fff79b", "2700K": "#fff79b", "3000K": "#fff79b",
  "4000K": "#d9d9d9", "4500K": "#d9d9d9", "5000K": "#bce4fa",
  "5700K": "#bce4fa", "6500K": "#bce4fa"
};

const ICON_SIZE = 'width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
const ICON_DIMMER_VB = 'viewBox="0 0 17.91 14.17" fill="currentColor"';
const ICON_DIMMER_INNER = `<path d="M17.08,14.17H.82c-.31,0-.58-.16-.73-.43-.14-.26-.13-.56.04-.81L8.26.38c.15-.24.42-.38.7-.38.28,0,.54.14.69.38l8.13,12.55c.16.24.17.55.03.81-.14.27-.42.43-.73.43M8.95.58s-.15.01-.21.11L.62,13.25c-.07.1-.03.19-.01.22.04.08.12.13.22.13h16.26c.1,0,.18-.05.22-.13.02-.04.05-.13,0-.22L9.17.69c-.07-.1-.17-.11-.21-.11"/><path d="M8.96,12.69c-2.23,0-4.05-1.76-4.05-3.93s1.82-3.93,4.05-3.93,4.05,1.76,4.05,3.93-1.82,3.93-4.05,3.93M8.96,5.39c-1.92,0-3.48,1.51-3.48,3.36s1.56,3.36,3.48,3.36,3.48-1.51,3.48-3.36-1.56-3.36-3.48-3.36"/><path d="M10.96,8.75c.03-.51-.17-1.04-.55-1.42-.37-.39-.9-.63-1.46-.65-.55-.02-1.13.17-1.56.55-.43.37-.71.94-.73,1.53-.03-.59.21-1.2.63-1.63.42-.44,1.03-.71,1.66-.73.63-.03,1.27.19,1.76.63.49.42.8,1.07.82,1.74h-.58Z"/>`;
const FACET_ICONS = {
  macrofamilia: `<svg ${ICON_SIZE}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,
  familia: `<svg ${ICON_SIZE}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>`,
  subfamilia: `<svg ${ICON_SIZE}><rect x="3" y="8.5" width="7" height="7" rx="1.5"/><rect x="14" y="8.5" width="7" height="7" rx="1.5"/></svg>`,
  variante_temperatura_filtro: `<svg ${ICON_SIZE}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`,
  color: `<svg ${ICON_SIZE}><path d="M12 2a10 10 0 1 0 0 20 3 3 0 0 0 0-6h-1a2 2 0 0 1 0-4h3a2 2 0 0 0 2-2 10 10 0 0 0-4-8z"/><circle cx="7.5" cy="10.5" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="7" r="1" fill="currentColor" stroke="none"/><circle cx="16.5" cy="10.5" r="1" fill="currentColor" stroke="none"/></svg>`,
  potencia: `<svg ${ICON_SIZE}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  dimerizable: `<svg width="16" height="16" ${ICON_DIMMER_VB} aria-hidden="true">${ICON_DIMMER_INNER}</svg>`,
  smart: `<svg ${ICON_SIZE}><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>`,
  categoria: `<svg ${ICON_SIZE}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,
  view: `<svg ${ICON_SIZE}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M10 4v16M10 10h11"/></svg>`,
  sort: `<svg ${ICON_SIZE}><path d="M8 6h12M8 12h9M8 18h6"/><path d="M4 4v16M2 18l2 2 2-2"/></svg>`
};
const ICON_CHECK = `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
const ICON_COMPARE = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 3 21 3 21 7"/><line x1="21" y1="3" x2="10" y2="14"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5"/></svg>`;
const ICON_CHEVRON_LEFT = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`;
const ICON_CHEVRON_RIGHT = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;
const ICON_FACET_CHEV = `<svg xmlns="http://www.w3.org/2000/svg" height="10" viewBox="0 -960 960 960" width="14" fill="currentColor" aria-hidden="true"><path d="m321-80-71-71 329-329-329-329 71-71 400 400L321-80Z"/></svg>`;
const CHEV_HTML = `<span class="chev">${ICON_FACET_CHEV}</span>`;
const ICON_WIFI = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>`;
const ICON_DIMERIZABLE = `<svg ${ICON_DIMMER_VB} aria-hidden="true">${ICON_DIMMER_INNER}</svg>`;
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
const ICON_SPEC_DIM = `<svg width="14" height="14" ${ICON_DIMMER_VB} aria-hidden="true">${ICON_DIMMER_INNER}</svg>`;
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
  smartOnly: false,
  pendingSmartOnly: false,
  page: 1,
  sortBy: "",
  query: "",
  view: "grid",
  collapsed: { macrofamilia: false, variante_temperatura_filtro: true, color: true, potencia: false, dimerizable: true, familia: false, subfamilia: false, categoria: true },
  compareCollapsed: true
};
/* Subfamilia queda siempre abierta; Productos y Familia se pueden cerrar. */
const ALWAYS_OPEN_FACETS = new Set(["subfamilia"]);
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

/* SKUs Smart: el campo `smart` se guarda en el documento (la pastilla lo lee)
   pero no está en el índice filtrable de Typesense (`smart:=Si` da 0). */
let smartSkuOptions = [];
let smartSkuPromise = null;
let smartProductContexts = [];
let smartIndexLoaded = false;

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

function isSmartYesValue(value){
  if(value === true || value === 1) return true;
  const v = String(value == null ? "" : value).trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return v === "si" || v === "true" || v === "1" || v === "yes" || v === "smart";
}

function isProductSmart(doc){
  if(!doc) return false;
  if(isSmartYesValue(doc.smart) || isSmartYesValue(doc.es_smart)) return true;
  return isSmartYesValue(doc.attr2);
}

function smartContextValues(value){
  if(Array.isArray(value)) return value.map(v => String(v).trim()).filter(Boolean);
  return value == null || value === "" ? [] : [String(value).trim()];
}

/* En el catálogo general el switch siempre está disponible. Al navegar la
   jerarquía, sólo se muestra si el contexto contiene algún producto Smart. */
function hasSmartProductsInContext(selected, searching, smartEnabled){
  if(smartEnabled || searching || !smartIndexLoaded) return true;
  const active = ["macrofamilia", "familia", "subfamilia", "categoria"]
    .map(field => [field, [...(selected[field] || [])]])
    .filter(([, values]) => values.length);
  if(!active.length) return true;
  return smartProductContexts.some(context => active.every(([field, values]) =>
    values.some(value => context[field].includes(String(value).trim()))
  ));
}

function filterSmartHierarchyCounts(counts, field, selected, smartEnabled){
  if(!smartEnabled || !smartIndexLoaded) return counts;
  return (counts || []).filter(count => {
    const contextSelection = { ...selected, [field]: new Set([count.value]) };
    const active = ["macrofamilia", "familia", "subfamilia", "categoria"]
      .map(contextField => [contextField, [...(contextSelection[contextField] || [])]])
      .filter(([, values]) => values.length);
    return smartProductContexts.some(context => active.every(([contextField, values]) =>
      values.some(value => context[contextField].includes(String(value).trim()))
    ));
  });
}

function isProductNuevo(doc){
  if(!doc) return false;
  const raw = doc.nuevo;
  if(raw === true || raw === 1) return true;
  const v = String(raw == null ? "" : raw).trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return v === "si" || v === "true" || v === "1" || v === "yes" || v === "nuevo";
}

function smartFilterClause(enabled){
  if(!enabled) return null;
  if(!smartSkuOptions.length) return `sku:=[\`__sin_resultados_smart__\`]`;
  const escaped = smartSkuOptions.map(v => `\`${String(v).replace(/`/g, "")}\``).join(",");
  return `sku:=[${escaped}]`;
}

async function loadSmartSkuOptions(){
  if(smartSkuPromise) return smartSkuPromise;
  smartSkuPromise = (async () => {
    const skus = [];
    const contexts = [];
    const perPage = 250;
    let page = 1;
    let found = Infinity;
    try{
      while((page - 1) * perPage < found && page <= 50){
        const params = new URLSearchParams({
          q: "*",
          query_by: "nombre_typesense,sku,descripcion",
          filter_by: BASE_FILTER,
          per_page: String(perPage),
          page: String(page),
          include_fields: "sku,smart,es_smart,attr2,macrofamilia,familia,subfamilia,categoria"
        });
        const res = await fetch(`${TS_HOST}/collections/${COLLECTION}/documents/search?${params.toString()}`, {
          headers: { "X-TYPESENSE-API-KEY": TS_API_KEY }
        });
        if(!res.ok) break;
        const data = await res.json();
        found = Number(data.found) || 0;
        (data.hits || []).forEach(hit => {
          const doc = hit.document || {};
          if(doc.sku && isProductSmart(doc)){
            skus.push(String(doc.sku));
            contexts.push({
              macrofamilia: smartContextValues(doc.macrofamilia),
              familia: smartContextValues(doc.familia),
              subfamilia: smartContextValues(doc.subfamilia),
              categoria: smartContextValues(doc.categoria)
            });
          }
        });
        if(!(data.hits || []).length) break;
        page++;
      }
      smartSkuOptions = skus;
      smartProductContexts = contexts;
    }catch(err){
      console.error("No se pudo armar el índice Smart:", err);
      smartSkuOptions = [];
      smartProductContexts = [];
    }finally{
      smartIndexLoaded = true;
    }
  })();
  return smartSkuPromise;
}

function smartSwitchHtml(checked, ariaLabel, activeCount = 0){
  const on = !!checked;
  return `
    <span class="ft-label">${FACET_ICONS.smart}<span>Smart${activeCount ? `<span class="fmn-active-count">(${activeCount})</span>` : ""}</span></span>
    <span class="switch-ui">
      <input type="checkbox" class="smart-switch-input" role="switch" aria-label="${ariaLabel || "Filtrar productos Smart"}" aria-checked="${on ? "true" : "false"}"${on ? " checked" : ""}>
      <span class="switch-track" aria-hidden="true"><span class="switch-thumb"></span></span>
    </span>
  `;
}

function wireSmartSwitch(input, pending){
  if(!input) return;
  input.addEventListener("change", () => {
    const next = input.checked;
    input.setAttribute("aria-checked", next ? "true" : "false");
    if(pending){
      state.pendingSmartOnly = next;
      updatePendingResultsCount();
      return;
    }
    state.smartOnly = next;
    state.pendingSmartOnly = next;
    state.page = 1;
    loadAndRender();
  });
}

function appendSmartSwitchFacet(panel){
  const group = document.createElement("div");
  group.className = "facet-group facet-switch-group is-pinned";
  group.innerHTML = `<label class="facet-switch">${smartSwitchHtml(state.smartOnly)}</label>`;
  wireSmartSwitch(group.querySelector(".smart-switch-input"), false);
  panel.appendChild(group);
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
    filter_by: BASE_FILTER,
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

/* Orden alfabético (es) de opciones de facet. Usa el texto visible. */
function sortFacetCounts(counts, labelFn){
  const getLabel = labelFn || (v => String(v || "").trim());
  return [...(counts || [])].sort((a, b) =>
    getLabel(a.value).localeCompare(getLabel(b.value), "es", { sensitivity: "base", numeric: true })
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
    filter_by: BASE_FILTER,
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
const TS_FILTER_GET_MAX = 1800;

async function typesenseDocumentsSearch(params, signal){
  const headers = { "X-TYPESENSE-API-KEY": TS_API_KEY };
  const filterBy = params.get("filter_by") || "";
  if(filterBy.length <= TS_FILTER_GET_MAX){
    const url = `${TS_HOST}/collections/${COLLECTION}/documents/search?${params.toString()}`;
    return fetch(url, { headers, signal });
  }
  const search = {};
  params.forEach((value, key) => { search[key] = value; });
  const res = await fetch(`${TS_HOST}/multi_search`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    signal,
    body: JSON.stringify({ searches: [{ collection: COLLECTION, ...search }] })
  });
  const payload = await res.json().catch(() => ({}));
  const inner = (payload && payload.results && payload.results[0]) || payload || {};
  const ok = res.ok && !inner.error;
  return {
    ok,
    status: inner.code || res.status,
    json: async () => inner,
    text: async () => inner.error || JSON.stringify(inner)
  };
}

async function buildAlphabeticalResults(firstPage, params, signal){
  const allHits = [...(firstPage.hits || [])];
  const batchSize = Number(params.get("per_page")) || 250;
  const totalPages = Math.ceil((Number(firstPage.found) || 0) / batchSize);

  for(let page = 2; page <= totalPages; page++){
    const pageParams = new URLSearchParams(params);
    pageParams.set("page", String(page));
    const res = await typesenseDocumentsSearch(pageParams, signal);
    if(!res.ok) throw new Error(`Typesense ${res.status}: ${await res.text()}`);
    const data = await res.json();
    allHits.push(...(data.hits || []));
  }

  const productName = hit => {
    const doc = hit.document || {};
    return String(doc.nombre_typesense || doc.nombre || doc.descripcion || doc.sku || "").trim();
  };
  allHits.sort((a, b) => productName(a).localeCompare(productName(b), "es", {
    sensitivity: "base", numeric: true
  }));

  const visiblePerPage = getPerPage();
  const from = (state.page - 1) * visiblePerPage;
  return { ...firstPage, hits: allHits.slice(from, from + visiblePerPage), page: state.page };
}

async function searchTypesense(){
  // Si hay una búsqueda anterior todavía en vuelo, la cancelamos: su
  // respuesta ya no nos importa y evita que pise el estado más reciente
  // (ej. clickear dos filtros rápido y que la respuesta más vieja llegue
  // después y muestre resultados que no corresponden a la selección actual)
  if(currentSearchController) currentSearchController.abort();
  currentSearchController = new AbortController();
  const { signal } = currentSearchController;

  if(state.smartOnly) await loadSmartSkuOptions();

  const activeMacro = [...state.selected.macrofamilia][0];
  const activeFamilia = state.selected.familia.size > 0;
  const searchingAll = Boolean(state.query);
  const facetFields = searchingAll
    ? FACET_FIELDS
    : (activeMacro
      ? [...FACET_FIELDS, FAMILIA_FIELD, ...(activeFamilia ? [SUBFAMILIA_FIELD, ...(state.selected.subfamilia.size ? EXTRA_FACET_FIELDS : [])] : [])]
      : FACET_FIELDS);

  const filterParts = [BASE_FILTER];
  const ownFacetClauses = new Map();
  const prevColorFacet = (typeof lastFacetCounts !== "undefined" ? lastFacetCounts : []).find(f => f.field_name === "color");
  if(prevColorFacet) mergeColorFacetCounts(prevColorFacet.counts);
  coerceColorSelection(state.selected.color);
  // En búsqueda: filtros de inicio (macrofamilias + atributos), sin familia/subfamilia.
  for(const field of FACET_FIELDS){
    const vals = field === "color"
      ? expandColorFilterValues(state.selected.color)
      : [...state.selected[field]];
    if(vals.length){
      const escaped = vals.map(v => `\`${v}\``).join(",");
      const clause = `${field}:=[${escaped}]`;
      filterParts.push(clause);
      ownFacetClauses.set(field, clause);
    }
  }
  if(!searchingAll){
    if(activeMacro && state.selected.familia.size){
      const escaped = [...state.selected.familia].map(v => `\`${v}\``).join(",");
      const clause = `${FAMILIA_FIELD}:=[${escaped}]`;
      filterParts.push(clause);
    }
    if(activeMacro && activeFamilia && state.selected.subfamilia.size){
      const escaped = [...state.selected.subfamilia].map(v => `\`${v}\``).join(",");
      const clause = `${SUBFAMILIA_FIELD}:=[${escaped}]`;
      filterParts.push(clause);
    }
    if(activeFamilia && state.selected.subfamilia.size){
      for(const field of EXTRA_FACET_FIELDS){
        const vals = [...state.selected[field]];
        if(vals.length){
          const escaped = vals.map(v => `\`${v}\``).join(",");
          const clause = `${field}:=[${escaped}]`;
          filterParts.push(clause);
          ownFacetClauses.set(field, clause);
        }
      }
    }
  }
  const potClause = potenciaFilterClause(state.potenciaMin, state.potenciaMax);
  if(potClause){
    filterParts.push(potClause);
  }
  const smartClause = smartFilterClause(state.smartOnly);
  if(smartClause){
    filterParts.push(smartClause);
  }
  const params = new URLSearchParams({
    q: state.query || "*",
    query_by: "nombre_typesense,sku,descripcion",
    facet_by: facetFields.join(","),
    max_facet_values: "100",
    per_page: String(getPerPage()),
    page: String(state.page)
  });
  if(filterParts.length) params.set("filter_by", filterParts.join(" && "));
  const alphabetical = state.sortBy === "alpha:asc";
  if(alphabetical){
    params.set("per_page", "250");
    params.set("page", "1");
    // La recopilación previa al orden alfabético necesita un orden estable
    // para no repetir u omitir documentos al avanzar entre páginas.
    params.set("sort_by", "order:asc");
  }else if(state.sortBy === "nuevo:desc"){
    params.set("sort_by", "nuevo:desc");
  }else{
    // "Predeterminado": `ORDER` en la fuente se normaliza como `order` en el
    // esquema de Typesense. Los valores menores deben aparecer primero.
    params.set("sort_by", "order:asc");
  }

  try{
    const res = await typesenseDocumentsSearch(params, signal);
    if(!res.ok){
      if(activeMacro && (facetFields.includes(SUBFAMILIA_FIELD) || facetFields.includes(FAMILIA_FIELD))){
        console.warn("Facet 'subfamilia' o 'familia' no disponible en Typesense todavía, reintentando sin ellas.");
        params.set("facet_by", FACET_FIELDS.join(","));
        const retryRes = await typesenseDocumentsSearch(params, signal);
        if(retryRes.ok){
          const retryData = await retryRes.json();
          return alphabetical ? await buildAlphabeticalResults(retryData, params, signal) : retryData;
        }
      }
      const errText = await res.text();
      throw new Error(`Typesense ${res.status}: ${errText}`);
    }
    const data = await res.json();
    // Facets disyuntivos: cada grupo con checkbox calcula sus opciones sin
    // aplicarse a sí mismo, pero conserva todos los demás filtros activos.
    // Así las alternativas compatibles mantienen su conteo real y se pueden
    // combinar, en lugar de desaparecer o quedar artificialmente en cero.
    const checkboxFacetFields = [
      ...FACET_FIELDS.filter(field => field !== "macrofamilia"),
      ...EXTRA_FACET_FIELDS
    ];
    const activeCheckboxFacets = checkboxFacetFields.filter(field => ownFacetClauses.has(field));
    const disjunctiveFacets = await Promise.all(activeCheckboxFacets.map(async field => {
      const ownClause = ownFacetClauses.get(field);
      const facetParams = new URLSearchParams({
        q: state.query || "*",
        query_by: "nombre_typesense,sku,descripcion",
        facet_by: field,
        max_facet_values: "100",
        per_page: "1",
        page: "1",
        filter_by: filterParts.filter(clause => clause !== ownClause).join(" && ")
      });
      const response = await typesenseDocumentsSearch(facetParams, signal);
      if(!response.ok) return null;
      const facetData = await response.json();
      return (facetData.facet_counts || []).find(facet => facet.field_name === field) || null;
    }));
    const refreshedFields = new Set(disjunctiveFacets.filter(Boolean).map(facet => facet.field_name));
    if(refreshedFields.size){
      data.facet_counts = (data.facet_counts || []).filter(facet => !refreshedFields.has(facet.field_name));
      data.facet_counts.push(...disjunctiveFacets.filter(Boolean));
    }
    return alphabetical ? await buildAlphabeticalResults(data, params, signal) : data;
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
  const searching = Boolean(state.query);
  const activeMacro = searching ? "" : [...state.selected.macrofamilia][0];
  const hasFamilia = !searching && state.selected.familia.size > 0;
  const familiaKey = [...state.selected.familia].sort().join(",");
  const showSmartSwitch = hasSmartProductsInContext(state.selected, searching, state.smartOnly);

  if(activeMacro && !hasFamilia){
    /* Familia — solo mientras no haya una elegida */
    const familiaCounts = filterSmartHierarchyCounts(
      resolveFamiliaCounts(facetCounts, activeMacro, state.selected.familia),
      FAMILIA_FIELD,
      state.selected,
      state.smartOnly
    );

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
        row.innerHTML = `
          <span>${c.value}</span>${c.count !== null && c.count !== undefined ? `<span class="count">${c.count}</span>` : ""}
        `;
        famBody.appendChild(row);
      });
      panel.appendChild(famGroup);
    }
  }

  if(activeMacro && hasFamilia){
    /* Subfamilia — aparece al elegir Familia (selección múltiple) */
    let subfamCounts = filterSmartHierarchyCounts(
      resolveSubfamiliaCounts(facetCounts, activeMacro, familiaKey, state.selected.subfamilia),
      SUBFAMILIA_FIELD,
      state.selected,
      state.smartOnly
    );

    if(subfamCounts.length){
      const subfamGroup = document.createElement("div");
      const subfamPinned = ALWAYS_OPEN_FACETS.has(SUBFAMILIA_FIELD);
      subfamGroup.className = "facet-group" + (subfamPinned ? " is-pinned" : state.collapsed.subfamilia ? " collapsed" : "");
      subfamGroup.innerHTML = `
        <div class="facet-title" data-field="${SUBFAMILIA_FIELD}">
          <span class="ft-label">${FACET_ICONS.macrofamilia}<span>Subfamilia</span></span>${subfamPinned ? "" : CHEV_HTML}
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

    /* Categoría — aparece al elegir Subfamilia */
    if(!state.selected.subfamilia.size){
      state.selected.categoria.clear();
    }
    if(state.selected.subfamilia.size){
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
  }

  let smartSwitchInserted = false;
  const ensureSmartSwitch = () => {
    if(smartSwitchInserted || !showSmartSwitch) return;
    appendSmartSwitchFacet(panel);
    smartSwitchInserted = true;
  };

  for(const field of FACET_FIELDS){
    if(field === "macrofamilia" && activeMacro) continue;
    if(field !== "macrofamilia") ensureSmartSwitch();
    if(field === "dimerizable"){
      appendPotenciaRangeFacet(panel, false);
      if(!shouldShowDimerizable(facetCounts)){
        state.selected.dimerizable.clear();
        continue;
      }
    }

    const facetData = (facetCounts || []).find(f => f.field_name === field);
    let counts = sortFacetCounts(facetData ? facetData.counts : []);
    if(field === "variante_temperatura_filtro") counts = filterTemperatureCounts(counts);
    if(field === "macrofamilia" && searching && macrofamiliaOptions.length){
      const byVal = {};
      counts.forEach(c => { byVal[c.value] = c.count; });
      counts = macrofamiliaOptions.map(c => ({
        value: c.value,
        count: byVal[c.value] != null ? byVal[c.value] : 0
      }));
    }
    if(field === "macrofamilia"){
      counts = filterSmartHierarchyCounts(counts, field, state.selected, state.smartOnly);
      if(searching) counts = counts.filter(c => Number(c.count) > 0);
    }

    const group = document.createElement("div");
    const pinned = ALWAYS_OPEN_FACETS.has(field);
    group.className = "facet-group" + (pinned ? " is-pinned" : state.collapsed[field] ? " collapsed" : "");
    group.innerHTML = `
      <div class="facet-title" data-field="${field}">
        <span class="ft-label">${FACET_ICONS[field] || ""}<span>${FACET_LABELS[field]}</span></span>${pinned ? "" : CHEV_HTML}
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
        row.className = "macro-row" + (state.selected.macrofamilia.has(c.value) ? " active" : "");
        row.dataset.macro = c.value;
        row.innerHTML = `<span>${c.value}</span><span class="count">${c.count}</span>`;
        body.appendChild(row);
        return;
      }
      const row = document.createElement("label");
      const checked = state.selected[field].has(c.value) ? "checked" : "";
      const mutedOption = state.selected[field]?.size && !checked;
      row.className = "facet-row" + (mutedOption ? " is-muted" : "");
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
  if(!smartSwitchInserted && showSmartSwitch) appendSmartSwitchFacet(panel);

  panel.querySelectorAll(".facet-title").forEach(title => {
    title.addEventListener("click", () => {
      const field = title.dataset.field;
      if(ALWAYS_OPEN_FACETS.has(field)) return;
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

  panel.querySelectorAll('input[type="checkbox"][data-field]').forEach(cb => {
    cb.addEventListener("change", () => {
      const { field, value } = cb.dataset;
      if(cb.checked) state.selected[field].add(value); else state.selected[field].delete(value);
      if(field === "subfamilia" && !state.selected.subfamilia.size){
        state.selected.categoria.clear();
      }
      state.page = 1;
      loadAndRender();
    });
  });
}

/* =========================================================
   FAMILIA — cache de opciones (sidebar)
   ========================================================= */
/* Lista completa de familias por macrofamilia — se guarda cuando aún no
   hay filtro de familia, así al elegir una las demás siguen visibles. */
const familiaOptionsCache = Object.create(null);
/* Lista completa de subfamilias por familia — se guarda la versión más
   amplia (antes de filtrar) para poder marcar varias a la vez. */
const subfamiliaOptionsCache = Object.create(null);

function mergeFacetCounts(fresh, cached, selectedSet){
  const liveByVal = {};
  (fresh || []).forEach(c => { liveByVal[c.value] = c.count; });
  const seen = new Set();
  const merged = (cached || fresh || []).map(c => {
    seen.add(c.value);
    const live = liveByVal[c.value];
    return { value: c.value, count: live != null ? live : c.count };
  });
  (selectedSet || new Set()).forEach(v => {
    if(seen.has(v)) return;
    merged.push({ value: v, count: liveByVal[v] != null ? liveByVal[v] : null });
  });
  return sortFacetCounts(merged);
}

function resolveFamiliaCounts(facetCounts, macro, selectedSet){
  const key = macro || "";
  const facetData = (facetCounts || []).find(f => f.field_name === FAMILIA_FIELD);
  const fresh = sortFacetCounts(facetData ? facetData.counts : []);
  const cached = familiaOptionsCache[key];
  if(fresh.length && (!cached || fresh.length > cached.length)){
    familiaOptionsCache[key] = fresh;
  }
  return mergeFacetCounts(fresh, familiaOptionsCache[key] || fresh, selectedSet);
}

function resolveSubfamiliaCounts(facetCounts, macro, familia, selectedSet){
  const key = `${macro || ""}|${familia || ""}`;
  const facetData = (facetCounts || []).find(f => f.field_name === SUBFAMILIA_FIELD);
  const fresh = sortFacetCounts(facetData ? facetData.counts : []);
  const cached = subfamiliaOptionsCache[key];
  if(fresh.length && (!cached || fresh.length > cached.length)){
    subfamiliaOptionsCache[key] = fresh;
  }
  return mergeFacetCounts(fresh, subfamiliaOptionsCache[key] || fresh, selectedSet);
}

/* =========================================================
   RENDER: APPLIED FILTER CHIPS
   ========================================================= */
function appliedFiltersCount(){
  const navigationFields = new Set(["macrofamilia", "familia", "subfamilia"]);
  const selectedCount = Object.entries(state.selected)
    .reduce((total, [field, values]) => (
      navigationFields.has(field) ? total : total + values.size
    ), 0);
  return selectedCount
    + (isPotenciaRangeActive(state.potenciaMin, state.potenciaMax) ? 1 : 0)
    + (state.smartOnly ? 1 : 0);
}

function renderFiltersExpandLabel(){
  if(!layoutEl || !filtersExpandBtn) return;
  const collapsed = layoutEl.classList.contains("filters-collapsed");
  const count = appliedFiltersCount();
  const label = collapsed ? `Mostrar filtros${count ? ` (${count})` : ""}` : "Ocultar filtros";
  if(filtersExpandLabel) filtersExpandLabel.textContent = label;
  filtersExpandBtn.title = label;
  filtersExpandBtn.setAttribute("aria-label", label);
}

function renderFiltersCount(){
  const badge = document.getElementById("filtersCount");
  const toggle = document.getElementById("filtersToggle");
  if(!badge || !toggle) return;
  const count = appliedFiltersCount();
  badge.textContent = String(count);
  badge.hidden = count === 0;
  const label = count
    ? `Filtros, ${count} filtro${count === 1 ? "" : "s"} aplicado${count === 1 ? "" : "s"}`
    : "Filtros";
  toggle.title = label;
  toggle.setAttribute("aria-label", label);
}

function renderChips(){
  renderFiltersCount();
  renderFiltersExpandLabel();
  const bar = document.getElementById("chipsBar");
  const CHIP_FIELDS = FACET_FIELDS.filter(f => f !== "macrofamilia");
  const chips = [];
  for(const field of CHIP_FIELDS){
    state.selected[field].forEach(v => chips.push({ field, value: v }));
  }
  // Subfamilia no tiene chip: el título y el filtro del sidebar ya lo muestran
  // Familia no tiene chip: se sale volviendo desde el breadcrumb / título
  state.selected.categoria.forEach(v => chips.push({ field: "categoria", value: v }));
  if(isPotenciaRangeActive(state.potenciaMin, state.potenciaMax)){
    chips.push({ field: "potencia_range", value: `${state.potenciaMin}W – ${state.potenciaMax}W` });
  }
  if(state.smartOnly){
    chips.push({ field: "smart", value: "Smart" });
  }
  if(!chips.length){ bar.style.display = "none"; bar.innerHTML = ""; return; }
  bar.style.display = "flex";
  bar.innerHTML = `<div class="chips-row">` +
    chips.map(c => {
      const label = c.field === "color" ? colorLabel(c.value) : c.value;
      const safeVal = String(c.value).replace(/"/g, "&quot;");
      return `<span class="chip" data-field="${c.field}" data-value="${safeVal}">${label}<button type="button" aria-label="Quitar filtro">×</button></span>`;
    }).join("") +
    `</div>` +
    `<button type="button" class="clear-btn">Borrar filtros</button>`;
}

function clearAppliedFilters(){
  const CHIP_FIELDS = FACET_FIELDS.filter(f => f !== "macrofamilia");
  CHIP_FIELDS.forEach(f => state.selected[f].clear());
  state.selected.subfamilia.clear();
  state.selected.familia.clear();
  state.selected.categoria.clear();
  resetPotenciaRange();
  state.smartOnly = false;
  state.pendingSmartOnly = false;
  syncPendingFromCommitted();
  state.page = 1;
  loadAndRender();
}

const chipsBarEl = document.getElementById("chipsBar");
if(chipsBarEl){
  chipsBarEl.addEventListener("click", (e) => {
    const clearBtn = e.target.closest(".clear-btn");
    if(clearBtn && chipsBarEl.contains(clearBtn)){
      e.preventDefault();
      e.stopPropagation();
      clearAppliedFilters();
      return;
    }
    const chipBtn = e.target.closest(".chip button");
    if(!chipBtn) return;
    const chip = chipBtn.closest(".chip");
    if(!chip) return;
    e.preventDefault();
    if(chip.dataset.field === "potencia_range"){
      resetPotenciaRange();
    } else if(chip.dataset.field === "smart"){
      state.smartOnly = false;
      state.pendingSmartOnly = false;
    } else {
      state.selected[chip.dataset.field].delete(chip.dataset.value);
      if(chip.dataset.field === "subfamilia" && !state.selected.subfamilia.size){
        state.selected.categoria.clear();
      }
    }
    syncPendingFromCommitted();
    state.page = 1;
    loadAndRender();
  });
}

/* =========================================================
   RENDER: CARDS
   ========================================================= */
function imageUrlFromItem(item){
  if(item && typeof item === "object"){
    item = item.url || item.src || item.imagen || item.image || item.href || "";
  }
  let u = String(item || "").trim().replace(/^["'\[]+|["'\]]+$/g, "").trim();
  if(!u || /^null$/i.test(u) || u === "#") return "";
  if(/\.(mp4|webm|mov|m3u8)(\?|#|$)/i.test(u)) return "";
  if(u.startsWith("//")) u = "https:" + u;
  if(!/^https?:\/\//i.test(u)) return "";
  return u;
}

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
    const u = imageUrlFromItem(item);
    if(u && !urls.includes(u)) urls.push(u);
  });
  return urls;
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

// Tag "Nuevo" arriba a la izquierda cuando el campo nuevo es Sí/true
function buildNuevoBadge(doc){
  if(!isProductNuevo(doc)) return "";
  return `<span class="badge" aria-label="Producto nuevo">NUEVO</span>`;
}

// Tag "SMART" arriba a la derecha cuando el campo smart es Sí/Si
function buildSmartBadge(doc){
  if(!isProductSmart(doc)) return "";
  return `<span class="smart-badge">${ICON_WIFI}SMART</span>`;
}

// Lista blanca de colores de luz. Cualquier otro valor del facet se excluye.
const TEMP_TONES = {
  calido:     { color: "#fff79b", label: "Cálido", order: 100 },
  neutro:     { color: "#d9d9d9", label: "Neutro", order: 200 },
  frio:       { color: "#bce4fa", label: "Frío", order: 300 },
  rgb:        { color: "linear-gradient(135deg,#e74c3c 0%,#f1c40f 33%,#2ecc71 66%,#3498db 100%)", label: "RGB", order: 400 },
  rgbw:       { color: "linear-gradient(135deg,#e74c3c 0%,#f1c40f 25%,#2ecc71 50%,#3498db 75%,#f5f5f5 100%)", label: "RGB+W", order: 410 },
  frio_ambar: { color: "linear-gradient(135deg,#bce4fa 50%,#ffbf00 50%)", label: "Frío + Ámbar", order: 420 },
  azul:       { color: "#1565c0", label: "Azul", order: 500 },
  amarillo:   { color: "#fdd835", label: "Amarillo", order: 510 },
  rojo:       { color: "#c62828", label: "Rojo", order: 520 },
  verde:      { color: "#2e7d32", label: "Verde", order: 530 },
  ambar:      { color: "#ffbf00", label: "Ámbar", order: 540 }
};

function normalizeTempText(value){
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function tempCategoryKey(value){
  const raw = String(value || "").trim();
  const norm = normalizeTempText(raw);
  if(!norm) return null;

  const kelvin = /^\d{3,5}\s*k?$/i.test(raw) ? Number.parseInt(raw, 10) : NaN;
  if(Number.isFinite(kelvin)){
    if(kelvin <= 3000) return "calido";
    if(kelvin <= 4500) return "neutro";
    return "frio";
  }

  if(/^rgb\s*\+\s*w$|^rgbw$/.test(norm)) return "rgbw";
  if(/^rgb$/.test(norm)) return "rgb";
  if(/^frio\s*\+\s*ambar$/.test(norm)) return "frio_ambar";
  if(/^calido$/.test(norm)) return "calido";
  if(/^neutro$/.test(norm)) return "neutro";
  if(/^frio$/.test(norm)) return "frio";
  if(/^azul$/.test(norm)) return "azul";
  if(/^amarillo$/.test(norm)) return "amarillo";
  if(/^rojo$/.test(norm)) return "rojo";
  if(/^verde$/.test(norm)) return "verde";
  if(/^ambar$/.test(norm)) return "ambar";
  return null;
}

function filterTemperatureCounts(counts){
  return (counts || [])
    .filter(item => Boolean(tempCategoryKey(item.value)))
    .sort((a, b) => TEMP_TONES[tempCategoryKey(a.value)].order - TEMP_TONES[tempCategoryKey(b.value)].order);
}

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
  return sortFacetCounts([...map.values()], colorLabel);
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
  return sortFacetCounts(keys.map(value => ({
    value,
    count: current.has(value) ? current.get(value) : 0
  })), colorLabel);
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
    const isSelected = selectedSet.has(c.value);
    const isMuted = selectedSet.size > 0 && !isSelected;
    row.className = "facet-row"
      + (isMuted ? " is-muted" : "")
      + (!c.count && !isSelected ? " is-empty" : "");
    const checked = isSelected ? "checked" : "";
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
  const temperatureVariants = Array.isArray(doc.variante_temperatura_filtro)
    ? doc.variante_temperatura_filtro.join(";")
    : doc.variante_temperatura_filtro;
  const keys = buildLuzCategoryKeys({}, temperatureVariants);
  if(!keys.length) return "";

  const collapsed = keys.length >= 2 ? " is-collapsed" : "";
  const rows = keys.map(key => {
    const { color, label } = TEMP_TONES[key];
    return `<span class="temp-dots-row"><span class="temp-dots-label">${label}</span><span class="dot luz-dot" style="background:${color}" title="${label}" aria-label="${label}"></span></span>`;
  }).join("");

  return `<span class="temp-dots${collapsed}" tabindex="0" aria-label="Temperatura de luz"><span class="temp-dots-icon" aria-hidden="true">${ICON_BULB}</span>${rows}</span>`;
}

function isDimerizableProduct(doc){
  const raw = doc && doc.dimerizable;
  if(raw == null || raw === "") return false;
  const values = Array.isArray(raw) ? raw : String(raw).split(/[;,|]/);
  return values.some(v => String(v).trim() && !isDimerizableNoValue(v));
}

function buildDimBadge(doc){
  if(!isDimerizableProduct(doc)) return "";
  return `<span class="dim-badge" title="Dimerizable" aria-label="Dimerizable">${ICON_DIMERIZABLE}<span class="dim-badge-label">DIM</span></span>`;
}

function cardTemplate(doc){
  const imgs = parseImages(doc);
  const firstImg = imgs[0] || "";
  const optimizedImgs = imgs.map(i => optimizeImg(i, "500x500"));

  const specs = buildSpecs(doc);
  const specsHtml = specs.length
    ? specs.map(s =>
        `<div class="spec"><span class="spec-label">${s.label}</span><span class="val">${s.value}</span></div>`
      ).join("")
    : "";

  const productHref = doc.link_ficha_web || "";
  const sku = (doc.sku || doc.id || "").toString();
  const escAttr = (s) => (s || "").toString().replace(/"/g, "&quot;");
  const tempHtml = buildLuzMediaDots(doc);
  const metaInner = tempHtml;

  return `
    <div class="card"${productHref ? ` role="link" tabindex="0"` : ""} data-sku="${escAttr(sku)}"${productHref ? ` data-href="${escAttr(productHref)}"` : ""}>
      <div class="media">
        <div class="media-frame${firstImg ? " is-loading" : ""}">
          ${buildNuevoBadge(doc)}
          <div class="media-badges-left">
            ${buildSmartBadge(doc)}
          </div>
          ${firstImg ? `<img src="${escAttr(optimizedImgs[0] || firstImg)}" alt="${escAttr(doc.nombre_typesense || "")}" data-idx="0" data-imgs='${JSON.stringify(optimizedImgs)}' data-origs='${JSON.stringify(imgs)}' loading="lazy" decoding="async">` : `<span style="color:#c3c9d1;font-size:12px">Sin imagen</span>`}
          ${optimizedImgs.length > 1 ? `<div class="nav-arrow prev">${ICON_CHEVRON_LEFT}</div><div class="nav-arrow next">${ICON_CHEVRON_RIGHT}</div>` : ""}
          ${buildDimBadge(doc)}
        </div>
        ${metaInner ? `<div class="card-overlays">${metaInner}</div>` : ""}
      </div>
      <div class="card-content">
        <div class="ml-card-body">
          ${metaInner ? `<div class="card-meta">${metaInner}</div>` : ""}
          <div class="card-title">${doc.nombre_typesense || "Producto sin nombre"}</div>
          ${specsHtml ? `<div class="specs">${specsHtml}</div>` : ""}
        </div>
        <div class="compare-row">
          <label class="compare-action">
            <span class="cb-wrap">
              <input type="checkbox" class="compare-checkbox"
                data-sku="${escAttr(sku)}"
                data-nombre="${escAttr(doc.nombre_typesense || "Producto sin nombre")}"
                data-img="${escAttr(firstImg)}">
              <span class="box">${ICON_CHECK}</span>
            </span>
            <span class="compare-label">Comparar</span>
          </label>
        </div>
      </div>
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
      // Franja inferior: nunca abre la ficha (solo Comparar selecciona)
      if(e.target.closest(".compare-row, .nav-arrow, .temp-dots, a, button, input, label")){
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

function bindImageLoading(img){
  const frame = img.closest(".media-frame");
  if(!frame || img.dataset.loadBound) return;
  img.dataset.loadBound = "1";
  const stop = () => frame.classList.remove("is-loading");
  const start = () => {
    if(img.complete) stop();
    else frame.classList.add("is-loading");
  };
  start();
  img.addEventListener("load", stop);
  img.addEventListener("error", stop);
}

function bindImgFallback(img){
  if(!img || img.dataset.fbBound) return;
  img.dataset.fbBound = "1";
  img.addEventListener("error", () => {
    const origs = JSON.parse(img.dataset.origs || "[]");
    const idx = Number(img.dataset.idx || 0);
    const orig = origs[idx];
    if(orig && img.src !== orig) img.src = orig;
  });
}

function wireCarousels(){
  document.querySelectorAll(".card .media").forEach(media => {
    const img = media.querySelector("img");
    if(!img) return;
    bindImageLoading(img);
    bindImgFallback(img);
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

    const origs = JSON.parse(img.dataset.origs || "[]");
    const srcAt = (i) => imgs[i] || origs[i] || "";

    const goTo = (newIdx) => {
      idx = (newIdx + imgs.length) % imgs.length;
      const targetIdx = idx;
      const target = srcAt(targetIdx);
      const frame = img.closest(".media-frame");
      img.dataset.idx = String(targetIdx);
      if(!target) return;

      if(loadedSet.has(targetIdx)){
        frame?.classList.remove("is-loading");
        img.style.opacity = "1";
        img.src = target;
      } else {
        frame?.classList.add("is-loading");
        img.style.opacity = "0";
        const pre = new Image();
        pre.onload = () => {
          loadedSet.add(targetIdx);
          if(idx === targetIdx){
            img.src = target;
            img.style.opacity = "1";
            frame?.classList.remove("is-loading");
          }
        };
        pre.onerror = () => {
          const orig = origs[targetIdx];
          if(orig && orig !== target){
            loadedSet.add(targetIdx);
            if(idx === targetIdx){
              img.src = orig;
              img.style.opacity = "1";
              frame?.classList.remove("is-loading");
            }
          } else {
            frame?.classList.remove("is-loading");
            img.style.opacity = "1";
          }
        };
        pre.src = target;
      }

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
/* Página de comparación en Webflow: /nuevo-comparativa
   - En prototipo local archivos_finales/productos/: ../../comparar/ */
const COMPARE_PAGE_URL = (() => {
  try{
    const path = (location.pathname || "").replace(/\\/g, "/");
    if(/\/archivos_finales\/productos(\/|$)/i.test(path)) return "../../comparar/";
  }catch(_){}
  return "/nuevo-comparativa";
})();

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
let compareBoundaryFrame = 0;

function isExpandedMobileCompare(bar){
  return window.matchMedia("(max-width: 640px)").matches && !bar.classList.contains("collapsed");
}

function updateCompareBoundary(){
  compareBoundaryFrame = 0;
  const root = document.getElementById("macroled-productos");
  const bar = document.getElementById("compareBar");
  if(!root || !bar || getComputedStyle(bar).display === "none"){
    if(root) root.style.removeProperty("--compare-boundary-lift");
    return;
  }

  // En mobile, abierto funciona como un modal superpuesto. No se ancla a la
  // paginación ni empuja el contenido; para verla, el usuario lo contrae.
  if(isExpandedMobileCompare(bar)){
    root.style.setProperty("--compare-boundary-lift", "0px");
    return;
  }

  // El límite es el elemento más bajo del catálogo, no sólo la paginación.
  // Webflow puede dejar que el sidebar desborde la altura del grid, por eso
  // también medimos explícitamente filtros y resultados en el estado vacío.
  const barGap = parseFloat(getComputedStyle(bar).getPropertyValue("--compare-bar-gap")) || 0;
  const fixedTop = window.innerHeight - barGap - bar.offsetHeight;
  const boundaryBottom = [
    root,
    root.querySelector(".filters-rail"),
    root.querySelector("#filtersPanel"),
    root.querySelector(".results-body")
  ].filter(Boolean).reduce((bottom, element) =>
    Math.max(bottom, element.getBoundingClientRect().bottom),
    root.getBoundingClientRect().bottom
  );
  const restingTop = boundaryBottom - barGap - bar.offsetHeight;
  const lift = Math.max(0, fixedTop - restingTop);
  root.style.setProperty("--compare-boundary-lift", lift + "px");
}

function scheduleCompareBoundaryUpdate(){
  if(compareBoundaryFrame) return;
  compareBoundaryFrame = requestAnimationFrame(updateCompareBoundary);
}

function updateComparePadding(){
  const root = document.getElementById("macroled-productos");
  const bar = document.getElementById("compareBar");
  if(getComputedStyle(bar).display === "none"){
    root.style.removeProperty("--compare-bar-offset");
    root.style.removeProperty("--compare-boundary-lift");
    document.body.classList.remove("has-compare-bar");
    return;
  }
  if(isExpandedMobileCompare(bar)){
    root.style.setProperty("--compare-bar-offset", "0px");
    root.style.setProperty("--compare-boundary-lift", "0px");
    document.body.classList.add("has-compare-bar");
    return;
  }
  const pagination = document.getElementById("pagination");
  const rootStyle = getComputedStyle(root);
  const currentPadding = parseFloat(rootStyle.paddingBottom) || 0;
  const trailingSpace = Math.max(0,
    root.getBoundingClientRect().bottom - currentPadding - pagination.getBoundingClientRect().bottom
  );
  const barGap = parseFloat(getComputedStyle(bar).getPropertyValue("--compare-bar-gap")) || 0;
  const paginationGap = 32; // 2rem entre la paginación y el comparador
  const offset = Math.max(0, bar.offsetHeight + barGap + paginationGap - trailingSpace);
  root.style.setProperty("--compare-bar-offset", offset + "px");
  document.body.classList.add("has-compare-bar");
  scheduleCompareBoundaryUpdate();
}

window.addEventListener("scroll", scheduleCompareBoundaryUpdate, { passive:true });
window.addEventListener("resize", () => {
  updateComparePadding();
  scheduleCompareBoundaryUpdate();
});
if("ResizeObserver" in window){
  const compareBoundaryObserver = new ResizeObserver(scheduleCompareBoundaryUpdate);
  compareBoundaryObserver.observe(document.getElementById("macroled-productos"));
  compareBoundaryObserver.observe(document.getElementById("compareBar"));
}
function renderCompareBar(){
  const bar = document.getElementById("compareBar");
  const body = document.getElementById("compareBarBody");
  const countEl = document.getElementById("compareCount");
  const list = window.MacroledCompare.getCompareList();

  if(!list.length){
    bar.style.display = "none";
    compareBarPrevCount = 0;
    state.compareCollapsed = true;
    updateComparePadding();
    return;
  }
  // Al agregar un producto, la barra se abre para mostrar la selección.
  if(list.length > compareBarPrevCount){
    state.compareCollapsed = false;
  }
  compareBarPrevCount = list.length;

  bar.style.display = "block";
  bar.classList.toggle("collapsed", state.compareCollapsed);
  countEl.textContent = list.length;

  const chips = list.map(p => {
    const img = sourceImg(p.img);
    return `
    <div class="compare-chip">
      <button type="button" class="compare-chip-remove" data-remove="${p.sku}" aria-label="Quitar">×</button>
      <div class="compare-chip-thumb">${img ? `<img src="${escAttr(img)}" alt="" loading="lazy" onerror="this.remove()">` : ""}</div>
      <div class="compare-chip-info">
        <span class="compare-chip-name">${p.nombre}</span>
        ${p.sku ? `<span class="compare-chip-sku">${p.sku}</span>` : ""}
      </div>
    </div>
  `;
  }).join("");

  const emptySlots = Array.from({ length: Math.max(0, COMPARE_MAX - list.length) })
    .map(() => `<div class="compare-slot-empty">+</div>`).join("");

  const ctaDisabled = list.length < 2;
  body.innerHTML = `
    <div class="compare-items">${chips}${emptySlots}</div>
    <div class="compare-actions">
      <a href="${buildCompareUrl()}" class="compare-cta${ctaDisabled ? " disabled" : ""}"
         title="${ctaDisabled ? "Agregá al menos 2 productos para comparar" : ""}">
        ${ICON_COMPARE} Comparar
      </a>
      <button type="button" class="compare-clear" id="compareClear" aria-label="Borrar todos los productos seleccionados">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
        Borrar
      </button>
    </div>
  `;

  body.querySelectorAll("[data-remove]").forEach(btn => {
    btn.addEventListener("click", () => {
      window.MacroledCompare.removeFromCompare(btn.dataset.remove);
      renderCompareBar();
      syncCompareCheckboxes();
    });
  });

  document.getElementById("compareClear").addEventListener("click", () => {
    window.MacroledCompare.clearCompare();
    renderCompareBar();
    syncCompareCheckboxes();
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
    const action = cb.closest(".compare-action");
    const tip = cb.disabled ? `Máximo ${COMPARE_MAX} productos para comparar` : "";
    if(row){
      row.title = tip;
      row.classList.toggle("row-disabled", cb.disabled);
    }
    if(action){
      action.title = tip;
      action.classList.toggle("is-disabled", cb.disabled);
    }
  });
}

function wireCompareCheckboxes(){
  document.querySelectorAll(".compare-row").forEach(row => {
    const cb = row.querySelector(".compare-checkbox");
    const action = row.querySelector(".compare-action");
    if(!cb || cb.dataset.wired === "1") return;
    cb.dataset.wired = "1";

    const applyCompareState = () => {
      const { sku, nombre, img } = cb.dataset;
      if(cb.checked){
        const updated = window.MacroledCompare.addToCompare({ sku, nombre, img: sourceImg(img) });
        if(!updated.some(p => p.sku === sku)) cb.checked = false;
      } else {
        window.MacroledCompare.removeFromCompare(sku);
      }
      renderCompareBar();
      syncCompareCheckboxes();
    };

    // El resto de la franja no navega ni selecciona
    row.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });

    // Solo checkbox + texto "Comparar" activan la selección
    if(action){
      action.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if(cb.disabled) return;
        cb.checked = !cb.checked;
        applyCompareState();
      });
    }
    cb.addEventListener("change", applyCompareState);
  });
}

// Si se agrega/saca un producto desde otra pestaña (ej. comparar.html abierta
// al lado) o desde este mismo catálogo, refrescamos la barra sin recargar.
window.addEventListener("macroled-compare-changed", () => { renderCompareBar(); syncCompareCheckboxes(); });
window.addEventListener("storage", (e) => { if(e.key === "macroled_compare"){ renderCompareBar(); syncCompareCheckboxes(); } });


/* En Highbay PRO 2026: luminarias/galponeras primero, accesorios después. */
function isHighbayAccessory(doc){
  if(!doc) return false;
  const cat = String(doc.categoria || "").toLowerCase();
  if(/sensor|control remoto|brazo/.test(cat)) return true;
  const sku = String(doc.sku || "");
  if(/^PHB-(SEN|CONTROL|BR)/i.test(sku)) return true;
  const name = String(doc.nombre_typesense || "").toLowerCase();
  if(/sensor|control remoto|brazo/.test(name) && !/galponera/.test(name)) return true;
  return false;
}

function prioritizeHighbayHits(hits){
  const fromSub = [...state.selected.subfamilia].some(isHighbayPro2026);
  const fromFam = [...state.selected.familia].some(isHighbayProFamilia);
  if(!fromSub && !fromFam) return hits;
  if(!hits || hits.length < 2) return hits;
  return [...hits].sort((a, b) => {
    const aAcc = isHighbayAccessory(a.document) ? 1 : 0;
    const bAcc = isHighbayAccessory(b.document) ? 1 : 0;
    return aAcc - bAcc;
  });
}

function renderCards(hits, found){
  const grid = document.getElementById("grid");
  const orderedHits = prioritizeHighbayHits(hits);
  if(!orderedHits || !orderedHits.length){
    grid.innerHTML = `<div class="state-msg">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <span class="state-title">No encontramos productos</span>
      <span>Probá sacando algún filtro para ver más resultados.</span>
    </div>`;
    grid.setAttribute("aria-busy", "false");
    return;
  }
  grid.innerHTML = orderedHits.map(h => cardTemplate(h.document)).join("");
  grid.setAttribute("aria-busy", "false");
  wireCarousels();
  wireCardLinks();
  wireCompareCheckboxes();
  syncCompareCheckboxes();
}

function renderPagination(found){
  const totalPages = Math.max(1, Math.ceil(found / getPerPage()));
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
    syncSearchInputFromState();
    state.selected.macrofamilia.clear();
    state.selected.subfamilia.clear();
    state.selected.familia.clear();
    state.selected.categoria.clear();
    state.selected.color.clear();
    state.selected.variante_temperatura_filtro.clear();
    state.selected.dimerizable.clear();
    resetPotenciaRange();
    state.smartOnly = false;
    state.pendingSmartOnly = false;
    const sortSelect = document.getElementById("sortSelect");
    if(sortSelect){
      sortSelect.value = "";
      syncSortDropdown();
    }
    state.sortBy = "";
    state.page = 1;
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
function renderCategoryHeading(){
  const holder = document.getElementById("categoryHeading");
  const active = [...state.selected.macrofamilia][0];
  const activeFamilia = [...state.selected.familia][0];
  const subfamilias = [...state.selected.subfamilia];
  let title = "Productos";
  if(state.query) title = `Resultados para "${state.query}"`;
  else if(subfamilias.length === 1) title = subfamilias[0];
  else if(subfamilias.length >= 2) title = active || activeFamilia || "Productos";
  else if(activeFamilia) title = activeFamilia;
  else if(active) title = active;

  holder.hidden = false;
  let h1 = holder.querySelector("h1");
  if(!h1){
    h1 = document.createElement("h1");
    holder.prepend(h1);
  }
  h1.textContent = title;
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

let gridLoadingPositionFrame = 0;
function updateGridLoadingPosition(){
  gridLoadingPositionFrame = 0;
  const gridShell = document.getElementById("gridShell");
  if(!gridShell?.classList.contains("is-filtering")) return;

  const rect = gridShell.getBoundingClientRect();
  const visibleTop = Math.max(0, rect.top);
  const visibleBottom = Math.min(window.innerHeight, rect.bottom);
  const centerY = visibleBottom > visibleTop
    ? (visibleTop + visibleBottom) / 2
    : Math.min(window.innerHeight, Math.max(0, rect.top + rect.height / 2));

  // El indicador vive dentro de gridShell: convertir el centro visible del
  // viewport a coordenadas locales evita que un ancestro altere position:fixed.
  gridShell.style.setProperty("--grid-loading-x", `${rect.width / 2}px`);
  gridShell.style.setProperty("--grid-loading-y", `${centerY - rect.top}px`);
}

function scheduleGridLoadingPosition(){
  if(gridLoadingPositionFrame) return;
  gridLoadingPositionFrame = requestAnimationFrame(updateGridLoadingPosition);
}

window.addEventListener("scroll", scheduleGridLoadingPosition, { passive: true });
window.addEventListener("resize", scheduleGridLoadingPosition);

async function loadAndRender(){
  const gridShell = document.getElementById("gridShell");
  const showingLabel = document.getElementById("showingLabel");
  const isRefilter = initialPreloadDone;

  if(isRefilter && gridShell){
    gridShell.classList.add("is-filtering");
    gridShell.setAttribute("aria-busy", "true");
    updateGridLoadingPosition();
    scheduleCompareBoundaryUpdate();
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
    renderFacets(data.facet_counts);
    renderMobileFilters(data.facet_counts);
    renderBreadcrumb();
    renderCategoryHeading(data.found);
    renderCategoryBanner();
    renderChips();
    renderCards(data.hits, data.found);
    renderPagination(data.found);
    renderCompareBar();

    const perPage = getPerPage();
    const from = data.hits.length ? (state.page - 1) * perPage + 1 : 0;
    const to = (state.page - 1) * perPage + data.hits.length;
    showingLabel.textContent = `${to} de ${data.found} productos`;

    const applyBtn = document.getElementById("filtersApply");
    if(applyBtn) applyBtn.textContent = `Ver ${data.found} resultado${data.found === 1 ? "" : "s"}`;

    syncFiltersToURL();
    finishInitialPreload();
  }finally{
    if(gridShell){
      gridShell.classList.remove("is-filtering");
      gridShell.setAttribute("aria-busy", "false");
      scheduleCompareBoundaryUpdate();
    }
  }
}

/* =========================================================
   TOOLBAR EVENTS
   ========================================================= */
const sortSelect = document.getElementById("sortSelect");
const sortDropdown = document.getElementById("sortDropdown");
const sortTrigger = document.getElementById("sortTrigger");
const sortMenu = document.getElementById("sortMenu");
const sortCurrent = document.getElementById("sortCurrent");
let sortHasBeenChosen = false;

function syncSortDropdown(){
  const selectedOption = [...sortSelect.options].find(option => option.value === sortSelect.value);
  sortCurrent.textContent = (sortHasBeenChosen || sortSelect.value)
    ? selectedOption?.textContent || "Predeterminado"
    : "Ordenar por";
  sortMenu.querySelectorAll(".sort-option").forEach(option => {
    const active = option.dataset.sort === sortSelect.value;
    option.classList.toggle("active", active);
    option.setAttribute("aria-selected", String(active));
  });
}

function closeSortDropdown(){
  sortDropdown.classList.remove("open");
  sortTrigger.setAttribute("aria-expanded", "false");
  sortMenu.hidden = true;
}

sortTrigger.addEventListener("click", () => {
  const willOpen = !sortDropdown.classList.contains("open");
  sortDropdown.classList.toggle("open", willOpen);
  sortTrigger.setAttribute("aria-expanded", String(willOpen));
  sortMenu.hidden = !willOpen;
});

sortMenu.querySelectorAll(".sort-option").forEach(option => {
  option.addEventListener("click", () => {
    sortHasBeenChosen = true;
    sortSelect.value = option.dataset.sort;
    syncSortDropdown();
    closeSortDropdown();
    sortSelect.dispatchEvent(new Event("change", { bubbles:true }));
  });
});

document.addEventListener("click", (event) => {
  if(!sortDropdown.contains(event.target)) closeSortDropdown();
});
document.addEventListener("keydown", (event) => {
  if(event.key === "Escape") closeSortDropdown();
});

sortSelect.addEventListener("change", (e) => {
  sortHasBeenChosen = true;
  syncSortDropdown();
  state.sortBy = e.target.value;
  state.page = 1;
  loadAndRender();
});
syncSortDropdown();

function applySearchQuery(raw){
  const next = String(raw || "").trim();
  const wasSearching = Boolean(state.query);
  const nowSearching = Boolean(next);
  if(nowSearching && !wasSearching){
    // Al pasar al buscador, el filtro vuelve al inicio (macrofamilias).
    state.selected.macrofamilia.clear();
    state.selected.familia.clear();
    state.selected.subfamilia.clear();
    state.selected.categoria.clear();
    syncPendingFromCommitted();
  } else if(nowSearching){
    const hadDrillDown = state.selected.familia.size || state.selected.subfamilia.size || state.selected.categoria.size;
    state.selected.familia.clear();
    state.selected.subfamilia.clear();
    state.selected.categoria.clear();
    if(hadDrillDown) syncPendingFromCommitted();
  }
  state.query = next;
  state.page = 1;
}

function syncSearchInputFromState(){
  const el = document.getElementById("searchInput");
  if(!el) return;
  if(el.value !== state.query) el.value = state.query;
}

let searchDebounce;
const searchInput = document.getElementById("searchInput");
if(searchInput){
  let searchTouched = false;
  searchInput.addEventListener("focus", () => { searchTouched = true; });
  searchInput.addEventListener("input", (e) => {
    // Autofill / restore del browser no tiene que filtrar el index al cargar.
    if(!searchTouched){
      syncSearchInputFromState();
      return;
    }
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      applySearchQuery(e.target.value);
      loadAndRender();
    }, 250);
  });
  searchInput.addEventListener("keydown", (e) => {
    if(e.key !== "Enter") return;
    e.preventDefault();
    clearTimeout(searchDebounce);
    applySearchQuery(e.target.value);
    loadAndRender();
  });
}
function applyCatalogView(view){
  const next = view === "list" ? "list" : "grid";
  state.view = next;
  const grid = document.getElementById("grid");
  if(grid) grid.classList.toggle("list", next === "list");
  const btnGrid = document.getElementById("btnGrid");
  const btnList = document.getElementById("btnList");
  if(btnGrid) btnGrid.classList.toggle("active", next === "grid");
  if(btnList) btnList.classList.toggle("active", next === "list");
}

document.getElementById("btnGrid").addEventListener("click", () => applyCatalogView("grid"));
document.getElementById("btnList").addEventListener("click", () => applyCatalogView("list"));

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
const filtersClear = document.getElementById("filtersClear");
const filtersCollapseBtn = document.getElementById("filtersCollapseBtn");
const filtersExpandBtn = document.getElementById("filtersExpandBtn");
const filtersExpandLabel = document.getElementById("filtersExpandLabel");
const layoutEl = document.querySelector(".layout");
const FILTERS_COLLAPSED_KEY = "macroled-filters-collapsed";

function setFiltersCollapsed(collapsed){
  if(!layoutEl) return;
  const isCollapsed = !!collapsed;
  layoutEl.classList.toggle("filters-collapsed", isCollapsed);
  renderFiltersExpandLabel();
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
  filtersAside.setAttribute("aria-hidden", "false");
  filtersBackdrop.classList.add("open");
  document.body.classList.add("filters-open");
  document.body.style.overflow = "hidden";
  goToListScreen();
  renderMobileFilters(lastFacetCounts);
  updatePendingResultsCount();
}
function closeFiltersDrawer(){
  filtersAside.classList.remove("open");
  filtersAside.setAttribute("aria-hidden", "true");
  filtersBackdrop.classList.remove("open");
  document.body.classList.remove("filters-open");
  document.body.style.overflow = "";
}
filtersToggle.addEventListener("click", openFiltersDrawer);
filtersClose.addEventListener("click", closeFiltersDrawer);
filtersBackdrop.addEventListener("click", closeFiltersDrawer);
const filtersDesktopHeading = document.querySelector(".filters-desktop-heading");
if(filtersCollapseBtn){
  filtersCollapseBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    setFiltersCollapsed(true);
  });
} else if(filtersDesktopHeading){
  filtersDesktopHeading.addEventListener("click", () => setFiltersCollapsed(true));
}
if(filtersExpandBtn){
  filtersExpandBtn.addEventListener("click", () => {
    setFiltersCollapsed(!layoutEl.classList.contains("filters-collapsed"));
  });
}
initFiltersCollapsed();

const catalogControlsRow = document.querySelector(".catalog-controls-row");
let catalogControlsFrame = 0;
function syncCatalogControlsStickyState(){
  catalogControlsFrame = 0;
  if(!catalogControlsRow) return;
  const isStuck = window.scrollY > 0 && catalogControlsRow.getBoundingClientRect().top <= 1;
  catalogControlsRow.classList.toggle("is-stuck", isStuck);
}
function scheduleCatalogControlsStickyState(){
  if(catalogControlsFrame) return;
  catalogControlsFrame = requestAnimationFrame(syncCatalogControlsStickyState);
}
window.addEventListener("scroll", scheduleCatalogControlsStickyState, { passive:true });
window.addEventListener("resize", scheduleCatalogControlsStickyState);
syncCatalogControlsStickyState();

filtersApply.addEventListener("click", async () => {
  // Recién acá se aplican de verdad los filtros elegidos en el drawer
  Object.keys(state.pending).forEach(f => { state.selected[f] = new Set(state.pending[f]); });
  state.sortBy = state.pendingSortBy;
  state.potenciaMin = state.pendingPotenciaMin;
  state.potenciaMax = state.pendingPotenciaMax;
  state.smartOnly = state.pendingSmartOnly;
  document.getElementById("sortSelect").value = state.sortBy;
  syncSortDropdown();
  state.page = 1;
  await loadAndRender();
  closeFiltersDrawer();
});
if(filtersClear){
  filtersClear.addEventListener("click", async () => {
    Object.values(state.selected).forEach(values => values.clear());
    Object.values(state.pending).forEach(values => values.clear());
    resetPotenciaRange();
    state.smartOnly = false;
    state.pendingSmartOnly = false;
    state.page = 1;
    closeFiltersDrawer();
    await loadAndRender();
  });
}
document.getElementById("fmnBack").addEventListener("click", goToListScreen);

/* ---- Navegación de dos niveles del drawer mobile: lista de filtros
   cerrados -> detalle (radio para "Ordenar por", checkbox para el resto,
   con Macrofamilia forzada a selección única). Todo lo que se toca queda
   en state.pending / state.pendingSortBy y recién se aplica de verdad
   (loadAndRender) al tocar "Ver resultados" — nada filtra antes. ---- */
let lastFacetCounts = [];
const FMN_ORDER = ["macrofamilia", "familia", "subfamilia", "categoria", "variante_temperatura_filtro", "color", "potencia", "dimerizable"];
const FMN_LABELS = {
  macrofamilia: "Macrofamilia",
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
  state.pendingSmartOnly = state.smartOnly;
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
  return opt ? opt.textContent : "Predeterminado";
}

function goToListScreen(){
  document.getElementById("fmnDetail").classList.remove("active");
  document.getElementById("fmnList").classList.add("active");
}

function renderMobileFilters(facetCounts){
  lastFacetCounts = facetCounts || lastFacetCounts;
  const listEl = document.getElementById("fmnList");
  const activeMacro = [...state.pending.macrofamilia][0];
  const hierarchyFields = new Set(["macrofamilia", "familia", "subfamilia"]);

  const searching = Boolean(state.query);
  const rows = [];

  FMN_ORDER.forEach(field => {
    const hasFamilia = state.pending.familia.size > 0;
    if(searching && (field === "familia" || field === "subfamilia" || field === "categoria")) return;
    // La jerarquía elegida siempre queda visible para poder cambiarla:
    // Macrofamilia -> Familia -> Subfamilia.
    if(field === "familia" && !activeMacro) return;
    if(field === "subfamilia" && !hasFamilia) return;
    if(field === "categoria" && (!hasFamilia || !state.pending.subfamilia.size)) return;
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
    let counts = sortFacetCounts(data ? data.counts : []);
    if(field === "variante_temperatura_filtro") counts = filterTemperatureCounts(counts);
    if(field !== "macrofamilia" && !counts.length) return;
    rows.push({ field, label: FMN_LABELS[field], summary: fmnSummary(field), counts });
  });

  if(hasSmartProductsInContext(state.pending, searching, state.pendingSmartOnly)){
    rows.push({ field: "smart", type: "switch", label: "Smart" });
  }
  rows.forEach(row => {
    if(hierarchyFields.has(row.field)){
      row.activeCount = 0;
    } else if(row.field === "potencia"){
      row.activeCount = isPotenciaRangeActive(state.pendingPotenciaMin, state.pendingPotenciaMax) ? 1 : 0;
    } else if(row.field === "smart"){
      row.activeCount = 0;
    } else {
      row.activeCount = state.pending[row.field]?.size || 0;
    }
  });
  const firstFilterRow = rows.find(row => !hierarchyFields.has(row.field));
  if(firstFilterRow) firstFilterRow.filtersStart = true;
  const hierarchyRows = rows.filter(row => hierarchyFields.has(row.field));
  const filterRows = rows.filter(row => !hierarchyFields.has(row.field));
  if(hierarchyRows.length) hierarchyRows[hierarchyRows.length - 1].sectionEnd = true;
  if(filterRows.length) filterRows[filterRows.length - 1].sectionEnd = true;
  rows.push(
    { field: "view", type: "secondary", label: "Tipo de vista", summary: state.view === "list" ? "Lista" : "Grilla" },
    { field: "sort", type: "secondary", label: "Ordenar", summary: currentSortLabel(), sectionEnd: true }
  );

  listEl.innerHTML = rows.map(r => {
    if(r.type === "switch"){
      return `<label class="fmn-row fmn-switch-row${r.filtersStart ? " fmn-filters-start" : ""}${r.sectionEnd ? " fmn-section-end" : ""}">${smartSwitchHtml(state.pendingSmartOnly, undefined, r.activeCount)}</label>`;
    }
    return `
    <div class="fmn-row${r.type === "secondary" ? " fmn-secondary-row" : ""}${r.filtersStart ? " fmn-filters-start" : ""}${r.field === "view" ? " fmn-secondary-start" : ""}${r.sectionEnd ? " fmn-section-end" : ""}" data-field="${r.field}">
      <span class="fmn-row-label">${r.type === "secondary" ? "" : (FACET_ICONS[r.field] || "")}<span>${r.label}${r.type !== "secondary" && r.activeCount ? `<span class="fmn-active-count">(${r.activeCount})</span>` : ""}</span></span>
      <span class="fmn-row-meta">${r.summary ? `<span>${r.summary}</span>` : ""}<span class="fmn-chev" aria-hidden="true">${ICON_FACET_CHEV}</span></span>
    </div>
  `;
  }).join("");

  listEl.querySelectorAll(".fmn-row[data-field]").forEach(row => {
    row.addEventListener("click", () => openDetailScreen(row.dataset.field));
  });
  wireSmartSwitch(listEl.querySelector(".smart-switch-input"), true);
}

function fmnCheckboxRowHtml(field, c){
  const checked = state.pending[field].has(c.value);
  const mutedOption = state.pending[field]?.size && !checked;
  const tempDot = field === "variante_temperatura_filtro"
    ? `<span class="dot temp-dot" style="background:${tempDotColor(c.value)}" title="${tempCategoryLabel(c.value) || c.value}"></span>` : "";
  const colorDot = field === "color"
    ? `<span class="dot color-dot${isLightColorKey(c.value) ? " light" : ""}" style="background:${colorSwatchBg(c.value)}" title="${colorLabel(c.value)}"></span>` : "";
  const label = field === "color" ? colorLabel(c.value) : c.value;
  return `
    <div class="fmn-option-row${checked ? " active" : ""}${mutedOption ? " is-muted" : ""}${field === "color" && !c.count && !checked ? " is-empty" : ""}" data-value="${c.value}">
      <span class="fmn-checkbox">${checked ? ICON_CHECK : ""}</span>
      ${tempDot}${colorDot}<span>${label}</span>
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
      if(field === "subfamilia" && !state.pending.subfamilia.size){
        state.pending.categoria.clear();
      }
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
  const filterParts = [BASE_FILTER];
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
  if(activeMacro && state.pending.familia.size && state.pending.subfamilia.size){
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
  if(state.pendingSmartOnly) await loadSmartSkuOptions();
  const smartClause = smartFilterClause(state.pendingSmartOnly);
  if(smartClause) filterParts.push(smartClause);
  const params = new URLSearchParams({ q: state.query || "*", query_by: "nombre_typesense,sku,descripcion", per_page: "1", page: "1" });
  if(filterParts.length) params.set("filter_by", filterParts.join(" && "));
  try{
    const res = await typesenseDocumentsSearch(params);
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

  if(field === "view"){
    titleEl.textContent = "Tipo de vista";
    bodyEl.classList.remove("fmn-color-swatches");
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
        applyCatalogView(row.dataset.value);
        closeFiltersDrawer();
      });
    });
  } else if(field === "sort"){
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
  } else if(field === "macrofamilia"){
    // Selección única y navegación inmediata, igual que vista/orden.
    titleEl.textContent = FMN_LABELS.macrofamilia;
    // Lista completa cacheada (no la filtrada) para que sigan apareciendo
    // todas las macrofamilias aunque ya haya una seleccionada
    const cached = macrofamiliaOptions.length
      ? macrofamiliaOptions
      : (lastFacetCounts.find(f => f.field_name === "macrofamilia") || {}).counts || [];
    const live = (lastFacetCounts.find(f => f.field_name === "macrofamilia") || {}).counts || [];
    const liveByVal = {};
    live.forEach(c => { liveByVal[c.value] = c.count; });
    let counts = sortFacetCounts(
      Boolean(state.query) && cached.length
        ? cached.map(c => ({ value: c.value, count: liveByVal[c.value] != null ? liveByVal[c.value] : 0 }))
        : cached
    );
    counts = filterSmartHierarchyCounts(counts, "macrofamilia", state.pending, state.pendingSmartOnly);
    if(state.query) counts = counts.filter(c => Number(c.count) > 0);
    bodyEl.innerHTML = counts.map(c => {
      const checked = state.pending.macrofamilia.has(c.value);
      return `
        <div class="fmn-option-row${checked ? " active" : ""}" data-value="${c.value}">
          <span class="fmn-radio"></span>
          <span>${c.value}</span><span class="fmn-count">${c.count}</span>
        </div>
      `;
    }).join("");
    bodyEl.querySelectorAll(".fmn-option-row").forEach(row => {
      row.addEventListener("click", async () => {
        const val = row.dataset.value;
        // Elegir una macrofamilia entra en su navegación jerárquica y deja
        // atrás una búsqueda de texto previa, igual que un cambio de página.
        state.query = "";
        syncSearchInputFromState();
        state.selected.macrofamilia.clear();
        state.selected.macrofamilia.add(val);
        state.selected.familia.clear();
        state.selected.subfamilia.clear();
        state.selected.categoria.clear();

        state.pending.macrofamilia.clear();
        state.pending.macrofamilia.add(val);
        state.pending.subfamilia.clear();
        state.pending.familia.clear();
        state.pending.categoria.clear();

        state.page = 1;
        closeFiltersDrawer();
        await loadAndRender();
      });
    });
  } else if(field === "familia"){
    titleEl.textContent = FMN_LABELS.familia;
    const activeMacro = [...state.pending.macrofamilia][0];
    const counts = filterSmartHierarchyCounts(
      resolveFamiliaCounts(lastFacetCounts, activeMacro, state.pending.familia),
      FAMILIA_FIELD,
      state.pending,
      state.pendingSmartOnly
    );
    bodyEl.innerHTML = counts.map(c => {
      const checked = state.pending.familia.has(c.value);
      return `
        <div class="fmn-option-row${checked ? " active" : ""}" data-value="${c.value}">
          <span class="fmn-radio"></span>
          <span>${c.value}</span>
          ${c.count !== null && c.count !== undefined ? `<span class="fmn-count">${c.count}</span>` : ""}
        </div>
      `;
    }).join("");
    bodyEl.querySelectorAll(".fmn-option-row").forEach(row => {
      row.addEventListener("click", async () => {
        const val = row.dataset.value;
        state.selected.familia.clear();
        state.selected.familia.add(val);
        state.selected.subfamilia.clear();
        state.selected.categoria.clear();

        state.pending.familia.clear();
        state.pending.familia.add(val);
        state.pending.subfamilia.clear();
        state.pending.categoria.clear();

        state.page = 1;
        closeFiltersDrawer();
        await loadAndRender();
      });
    });
  } else if(field === "subfamilia"){
    titleEl.textContent = "Subfamilia";
    const activeMacro = [...state.pending.macrofamilia][0];
    const familiaKey = [...state.pending.familia].sort().join(",");
    const counts = filterSmartHierarchyCounts(
      resolveSubfamiliaCounts(lastFacetCounts, activeMacro, familiaKey, state.pending.subfamilia),
      SUBFAMILIA_FIELD,
      state.pending,
      state.pendingSmartOnly
    );
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
    let counts = sortFacetCounts(data ? data.counts : []);
    if(field === "variante_temperatura_filtro") counts = filterTemperatureCounts(counts);
    if(field === "categoria"){
      counts = filterSmartHierarchyCounts(counts, field, state.pending, state.pendingSmartOnly);
    }
    bodyEl.innerHTML = counts.map(c => fmnCheckboxRowHtml(field, c)).join("");
    fmnWireCheckboxRows(bodyEl, field);
  }

  document.getElementById("fmnList").classList.remove("active");
  document.getElementById("fmnDetail").classList.add("active");
}

/* =========================================================
   URL ↔ FILTROS
   Permite enlazar catálogo filtrado, p.ej.:
   ?macrofamilia=Luminarias%20de%20Proyecto&familia=Highbay%20PRO%202026
   También sigue funcionando ?q= desde el buscador del menú.
   ========================================================= */
const URL_FILTER_KEYS = [
  ["macrofamilia", "macrofamilia"],
  ["familia", "familia"],
  ["subfamilia", "subfamilia"],
  ["categoria", "categoria"],
  ["color", "color"],
  ["temperatura", "variante_temperatura_filtro"],
  ["dimerizable", "dimerizable"]
];
let skipUrlSync = false;
let pendingUrlPotencia = null; // { min, max } hasta que carguen los bounds

function clearSelectedFilters(){
  Object.keys(state.selected).forEach(k => state.selected[k].clear());
}

function expandUrlParamValues(params, key){
  return params.getAll(key).flatMap(v =>
    String(v).split("|").map(s => s.trim()).filter(Boolean)
  );
}

function applyStateFromURL(){
  let search = location.search;
  const urlParams = new URLSearchParams(location.search);
  const hasUrlFilter = URL_FILTER_KEYS.some(([param]) => urlParams.has(param)) || urlParams.has("q");
  if(!hasUrlFilter){
    try {
      const saved = sessionStorage.getItem("macroled_catalog_qs");
      if(saved){
        search = saved.charAt(0) === "?" ? saved : `?${saved}`;
        sessionStorage.removeItem("macroled_catalog_qs");
        history.replaceState({}, "", `${location.pathname}${search}`);
      }
    } catch (_) {}
  } else {
    try { sessionStorage.removeItem("macroled_catalog_qs"); } catch (_) {}
  }
  const params = new URLSearchParams(search.charAt(0) === "?" ? search.slice(1) : search);
  clearSelectedFilters();
  // No usar resetPotenciaRange() acá: los bounds todavía pueden ser el
  // placeholder 0–1800 y eso deja el slider “activo” al cargar el index.
  state.potenciaMin = null;
  state.potenciaMax = null;
  state.pendingPotenciaMin = null;
  state.pendingPotenciaMax = null;
  pendingUrlPotencia = null;
  state.smartOnly = false;
  state.pendingSmartOnly = false;

  const q = (params.get("q") || "").trim();
  state.query = q;
  syncSearchInputFromState();

  URL_FILTER_KEYS.forEach(([param, field]) => {
    expandUrlParamValues(params, param).forEach(v => state.selected[field].add(v));
  });

  // Si entra solo por búsqueda del menú, no mezclar con filtros viejos
  if(q && !params.has("macrofamilia") && !params.has("familia")){
    state.selected.macrofamilia.clear();
    state.selected.subfamilia.clear();
    state.selected.familia.clear();
    state.selected.categoria.clear();
  }

  const page = parseInt(params.get("page") || "1", 10);
  state.page = Number.isFinite(page) && page > 0 ? page : 1;

  const sortParam = params.get("sort") || "";
  const sort = ["nuevo:desc", "alpha:asc"].includes(sortParam) ? sortParam : "";
  state.sortBy = sort;
  const sortSelect = document.getElementById("sortSelect");
  if(sortSelect){
    sortSelect.value = sort;
    syncSortDropdown();
  }

  const potMin = params.get("pot_min");
  const potMax = params.get("pot_max");
  if(potMin != null || potMax != null){
    const min = potMin != null ? Number(potMin) : null;
    const max = potMax != null ? Number(potMax) : null;
    pendingUrlPotencia = {
      min: Number.isFinite(min) ? min : null,
      max: Number.isFinite(max) ? max : null
    };
    if(pendingUrlPotencia.min != null) state.potenciaMin = pendingUrlPotencia.min;
    if(pendingUrlPotencia.max != null) state.potenciaMax = pendingUrlPotencia.max;
  }

  const smartParam = (params.get("smart") || "").trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  state.smartOnly = smartParam === "1" || smartParam === "si" || smartParam === "true" || smartParam === "yes";
  state.pendingSmartOnly = state.smartOnly;
}

function applyPendingUrlPotencia(){
  if(!pendingUrlPotencia) return false;
  ensurePotenciaSelectionDefaults();
  if(pendingUrlPotencia.min != null){
    state.potenciaMin = Math.max(potenciaBounds.min, Math.min(potenciaBounds.max, pendingUrlPotencia.min));
  }
  if(pendingUrlPotencia.max != null){
    state.potenciaMax = Math.max(potenciaBounds.min, Math.min(potenciaBounds.max, pendingUrlPotencia.max));
  }
  if(state.potenciaMin > state.potenciaMax){
    const t = state.potenciaMin;
    state.potenciaMin = state.potenciaMax;
    state.potenciaMax = t;
  }
  state.pendingPotenciaMin = state.potenciaMin;
  state.pendingPotenciaMax = state.potenciaMax;
  pendingUrlPotencia = null;
  return true;
}

function syncFiltersToURL(){
  if(skipUrlSync) return;
  const params = new URLSearchParams();

  if(state.query) params.set("q", state.query);

  URL_FILTER_KEYS.forEach(([param, field]) => {
    [...state.selected[field]].forEach(v => params.append(param, v));
  });

  if(isPotenciaRangeActive(state.potenciaMin, state.potenciaMax)){
    params.set("pot_min", String(state.potenciaMin));
    params.set("pot_max", String(state.potenciaMax));
  }
  if(state.smartOnly) params.set("smart", "1");
  if(state.sortBy) params.set("sort", state.sortBy);
  if(state.page > 1) params.set("page", String(state.page));

  const qs = params.toString();
  const next = qs ? `${location.pathname}?${qs}` : location.pathname;
  const current = `${location.pathname}${location.search}`;
  if(next === current) return;
  history.replaceState({}, "", next);
}

applyStateFromURL();
loadMacrofamiliaOptions();
loadSmartSkuOptions().then(() => {
  /* La primera grilla puede terminar antes que el índice auxiliar Smart.
     Actualizamos sólo los paneles para aplicar la visibilidad correcta. */
  if(document.getElementById("filtersPanel")?.children.length){
    renderFacets(lastFacetCounts);
    renderMobileFilters(lastFacetCounts);
  }
});
loadPotenciaOptions().then(() => {
  const appliedPot = applyPendingUrlPotencia();
  if(!appliedPot) resetPotenciaRange();
  // Re-render facets si ya cargó el catálogo, para que el slider tenga bounds reales
  if(document.getElementById("filtersPanel")?.children.length){
    renderFacets(lastFacetCounts);
    renderChips();
  }
  if(appliedPot && initialPreloadDone) loadAndRender();
});
loadAndRender();

window.addEventListener("popstate", () => {
  skipUrlSync = true;
  applyStateFromURL();
  applyPendingUrlPotencia();
  loadAndRender().finally(() => { skipUrlSync = false; });
});

/* Precarga videos de banners en idle para que no se sientan lentos al filtrar. */
if(typeof requestIdleCallback === "function"){
  requestIdleCallback(() => prefetchAllBannerVideos(), { timeout: 2500 });
} else {
  setTimeout(prefetchAllBannerVideos, 1200);
}

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
    const openFromCta = document.getElementById("openAssistantFromCta"); // opcional, solo en ficha

    if (!aiPanel || !aiForm || !aiMessages) {
      console.warn("[asistente] Faltan elementos del widget en el DOM de esta página — no se inicializa.");
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
        // El "Respond to Webhook" de n8n a veces envuelve el resultado en
        // un array de 1 item ([{ respuesta: "..." }]) y a veces manda el
        // objeto suelto ({ respuesta: "..." }) — aceptamos las dos formas.
        const item = Array.isArray(data) ? data[0] : data;
        if (item && item.resetSession) window.MacroledSessionId = newSessionId();
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
      askedCount += 1;
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

  /* Sin sugerencias guía: el asistente se usa para buscar un producto concreto.
     Le manda al webhook la pregunta + los filtros/búsqueda activos. */
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
      sessionId: window.MacroledSessionId,
    };
  }

  function catalogFallbackHtml() {
    return `No pude encontrar información sobre esa consulta. Podés seguir explorando el catálogo con los filtros de la izquierda, o probar con otra pregunta.`;
  }

  try {
    window.MacroledAssistant.init({
      greeting: `Hola, soy el asistente de <b>productos Macroled</b>. Preguntame por un producto, SKU o característica y te ayudo a encontrarlo.`,
      getPayload: getCatalogPayload,
      fallbackHtml: catalogFallbackHtml,
      // Sin "localAnswer": esta página siempre va directo a la Capa 2.
    });
  } catch (err) {
    console.error("[asistente-catalogo] no se pudo inicializar:", err);
  }
})();
