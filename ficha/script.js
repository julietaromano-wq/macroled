(function () {
  "use strict";

  /* Salvavidas por si este mismo archivo queda incluido dos veces en la
     página (dos <script src> apuntando al mismo bundle). Esto NO soluciona
     el caso de tener el script VIEJO todavía pegado en otro lado — para eso
     hay que sacarlo a mano de Webflow (Page Settings / Embeds). */
  if (window.__mlFichaScriptLoaded) return;
  window.__mlFichaScriptLoaded = true;

  /* —— Gallery —— */
  let GALLERY = [];
  let activeIndex = 0;
  const thumbsEl = document.getElementById("thumbs");
  const stageWrap = document.getElementById("stageWrap");
  const stageEl = document.getElementById("stage");
  const stageImg = document.getElementById("stageImg");
  const zoomLens = document.getElementById("zoomLens");
  const zoomPane = document.getElementById("zoomPane");
  const canHoverZoom = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const FANCY_OPTS = {
    Images: { zoom: true, wheel: "zoom" },
    Toolbar: {
      display: {
        left: ["infobar"],
        middle: [],
        right: ["zoomIn", "zoomOut", "slideshow", "thumbs", "close"],
      },
    },
  };

  function urlsToGallery(urls, altBase) {
    const seen = new Set();
    return (urls || [])
      .map((u) => String(u || "").trim())
      .filter((u) => {
        if (!u || u.length < 5) return false;
        if (/\/(250|1000)\//.test(u)) return false;
        if (seen.has(u)) return false;
        seen.add(u);
        return true;
      })
      .map((url, i) => ({
        alt: altBase ? `${altBase} — vista ${i + 1}` : `Vista ${i + 1}`,
        thumb: url,
        display: url,
        full: url,
      }));
  }

  function renderThumbs() {
    if (!thumbsEl) return;
    thumbsEl.hidden = GALLERY.length <= 1;
    thumbsEl.innerHTML = GALLERY.map((g, i) => `
      <button type="button" class="thumb${i === activeIndex ? " is-active" : ""}" role="option" data-index="${i}" aria-label="${g.alt}" aria-selected="${i === activeIndex}">
        <img src="${g.thumb}" alt="" loading="lazy">
      </button>`).join("");
  }

  function syncZoomBg() {
    const g = GALLERY[activeIndex];
    if (!g || !zoomPane) return;
    zoomPane.style.backgroundImage = `url("${g.full}")`;
  }

  function setActive(i) {
    if (!GALLERY.length || !stageImg) return;
    activeIndex = (i + GALLERY.length) % GALLERY.length;
    const g = GALLERY[activeIndex];
    stageImg.src = g.display;
    stageImg.alt = g.alt;
    syncZoomBg();
    renderThumbs();
  }

  function setGallery(urls, altBase) {
    GALLERY = urlsToGallery(urls, altBase);
    if (!GALLERY.length) {
      const fallback = document.querySelector(".cms-product-item")?.getAttribute("data-image");
      if (fallback) GALLERY = urlsToGallery([fallback], altBase);
    }
    activeIndex = 0;
    setActive(0);
    const aiImg = document.getElementById("aiProductImg");
    if (aiImg && GALLERY[0]) aiImg.src = GALLERY[0].thumb;
  }

  function openFancy(index) {
    if (!GALLERY.length || typeof Fancybox === "undefined") return;
    Fancybox.show(
      GALLERY.map((g) => ({ src: g.full, type: "image", caption: g.alt })),
      { ...FANCY_OPTS, startIndex: index }
    );
  }

  function stopZoom() {
    stageWrap.classList.remove("is-zooming");
  }

  function updateZoom(e) {
    if (!canHoverZoom) return;
    const rect = stageEl.getBoundingClientRect();
    const viewportMargin = 24;
    const spaceRight = window.innerWidth - rect.right - 14 - viewportMargin;
    const preferredPane = Math.min(440, window.innerWidth * 0.46);
    const fitsBeside = spaceRight >= 260;

    zoomPane.classList.toggle("is-below", !fitsBeside);

    let paneW, paneH;
    if (fitsBeside) {
      paneW = Math.max(260, Math.min(preferredPane, spaceRight));
      zoomPane.style.width = `${paneW}px`;
      zoomPane.style.removeProperty("top");
      paneH = zoomPane.offsetHeight || paneW;
    } else {
      zoomPane.style.width = "";
      paneW = zoomPane.offsetWidth || rect.width;
      paneH = zoomPane.offsetHeight || paneW * 0.625;
    }

    const zoomFactor = 2.35;
    const lensW = Math.min(rect.width * 0.55, Math.max(100, paneW / zoomFactor));
    const lensH = Math.min(rect.height * 0.55, Math.max(100, paneH / zoomFactor));
    zoomLens.style.width = `${lensW}px`;
    zoomLens.style.height = `${lensH}px`;

    let x = e.clientX - rect.left - lensW / 2;
    let y = e.clientY - rect.top - lensH / 2;
    x = Math.max(0, Math.min(x, rect.width - lensW));
    y = Math.max(0, Math.min(y, rect.height - lensH));
    zoomLens.style.left = `${x}px`;
    zoomLens.style.top = `${y}px`;

    const bgW = (rect.width / lensW) * paneW;
    const bgH = (rect.height / lensH) * paneH;
    zoomPane.style.backgroundSize = `${bgW}px ${bgH}px`;
    zoomPane.style.backgroundPosition = `${-(x * (bgW / rect.width))}px ${-(y * (bgH / rect.height))}px`;
  }

  thumbsEl.addEventListener("mouseover", (e) => {
    const btn = e.target.closest(".thumb");
    if (!btn || !canHoverZoom) return;
    const i = Number(btn.dataset.index);
    if (i !== activeIndex) setActive(i);
  });
  thumbsEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".thumb");
    if (!btn) return;
    setActive(Number(btn.dataset.index));
  });

  if (canHoverZoom) {
    stageEl.addEventListener("mouseenter", (e) => {
      if (e.target.closest(".zoom-btn")) return;
      syncZoomBg();
      stageWrap.classList.add("is-zooming");
      updateZoom(e);
    });
    stageEl.addEventListener("mousemove", (e) => {
      if (!stageWrap.classList.contains("is-zooming")) return;
      if (e.target.closest(".zoom-btn")) {
        stopZoom();
        return;
      }
      updateZoom(e);
    });
    stageEl.addEventListener("mouseleave", stopZoom);
  }

  function onOpenGallery(e) {
    e.preventDefault();
    e.stopPropagation();
    stopZoom();
    openFancy(activeIndex);
  }
  stageEl.addEventListener("click", (e) => {
    if (e.target.closest(".zoom-btn")) return;
    onOpenGallery(e);
  });
  document.getElementById("openLightboxBtn").addEventListener("click", onOpenGallery);

  window.MacroledFicha = { setGallery, setActive, getGallery: () => GALLERY };

  /* —— Tabs —— */
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((t) => {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      const panels = {
        specs: document.getElementById("panel-specs"),
        commercial: document.getElementById("panel-commercial"),
        files: document.getElementById("panel-files"),
      };
      Object.entries(panels).forEach(([key, panel]) => {
        if (!panel) return;
        const on = key === tab.dataset.tab;
        panel.classList.toggle("is-active", on);
        panel.hidden = !on;
      });
      requestAnimationFrame(syncAccordionHeights);
    });
  });

  /* —— Spec schema + tooltips + hide empty —— */
  const ICON_BOLT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>';
  const ICON_SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  const ICON_BOX = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.3 7L12 12l8.7-5M12 22V12"/></svg>';
  const ICON_WIFI = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5a9.5 9.5 0 0 1 14 0"/><path d="M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="19.5" r="1.2" fill="currentColor" stroke="none"/></svg>';
  const ICON_REMOTE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 18h6"/></svg>';

  const SPEC_GROUPS = [
    {
      title: "Características eléctricas",
      icon: ICON_BOLT,
      rows: [
        { key: "Tensión", tip: "Voltaje de alimentación del producto (AC o DC)." },
        { key: "Tipo de energía", tip: "Fuente de energía con la que opera (red, batería, USB, etc.)." },
        { key: "Frecuencia", tip: "Frecuencia de la red eléctrica, en hertz (Hz)." },
        { key: "Corriente", tip: "Corriente eléctrica que consume o entrega el producto." },
        { key: "Corriente entrada", tip: "Corriente de entrada nominal del equipo." },
        { key: "Potencia", tip: "Consumo eléctrico, en vatios (W)." },
        { key: "Tipo de driver", tip: "Tipo de fuente/driver que alimenta el LED." },
        { key: "Compatible con sensor", tip: "Indica si admite sensores externos (movimiento, luz, etc.)." },
        { key: "Sensor incluido", tip: "Si el producto trae sensor de fábrica." },
        { key: "Factor de Potencia (FP)", tip: "Qué tan eficiente es el uso de la energía. Más cerca de 1 es mejor." },
        { key: "THD", tip: "Distorsión armónica de la corriente. Cuanto más bajo, mejor calidad eléctrica." },
        { key: "Dimerizable", tip: "Si permite regular la intensidad de la luz." },
        { key: "Canales", tip: "Cantidad de canales de control o salida." },
        { key: "Indicador luminoso", tip: "Señalización LED de estado en el equipo." },
        { key: "Tomacorriente", tip: "Si incluye toma de corriente integrada." },
        { key: "Conector USB", tip: "Puerto USB disponible (carga o datos)." },
        { key: "Capacitor", tip: "Capacidad del capacitor integrado, cuando aplica." },
        { key: "EMC", tip: "Cumplimiento de compatibilidad electromagnética." },
        { key: "SDCM", tip: "Uniformidad de color entre unidades. Más bajo es más consistente." },
        { key: "Anti-High-Volt", tip: "Protección contra picos de tensión en la red eléctrica." },
        { key: "ON-OFF Switch", tip: "Interruptor de encendido/apagado o ciclos On-Off soportados." },
        { key: "Protector SPD", tip: "Protección contra sobretensiones (Surge Protection Device)." },
        { key: "No Flicker - sin parpadeo", tip: "Diseño sin parpadeo perceptible (flicker-free)." },
        { key: "Corriente de Irrupción (Inrush)", tip: "Pico de corriente al encender el equipo." },
        { key: "Tiempo de irrupción Th50", tip: "Duración del pico de irrupción hasta el 50%." },
        { key: "Clase de protección", tip: "Clase de aislamiento eléctrico (I, II, III)." },
        { key: "Max. n° de lum. freno de circuito B16 A", tip: "Máximo de luminarias por breaker tipo B 16 A." },
        { key: "Max. n° de lum. freno de circuito C10 A", tip: "Máximo de luminarias por breaker tipo C 10 A." },
        { key: "Max. n° de lum. freno de circuito C16 A", tip: "Máximo de luminarias por breaker tipo C 16 A." },
        { key: "Tipo de carga", tip: "Método de carga de la batería (USB-C, magnética, etc.)." },
        { key: "Tiempo de carga", tip: "Tiempo aproximado para cargar la batería al completo." },
        { key: "Autonomía", tip: "Tiempo de uso con batería, según intensidad." },
      ],
    },
    {
      title: "Características lumínicas",
      icon: ICON_SUN,
      rows: [
        { key: "Lúmenes/W", tip: "Eficiencia lumínica: lúmenes por cada vatio consumido." },
        { key: "Flujo luminoso", tip: "Cantidad total de luz emitida, en lúmenes (lm)." },
        { key: "Temperatura del color", tip: "Tono de la luz en Kelvin: más bajo es más cálida, más alto es más fría." },
        { key: "Tipo de luz", tip: "Clasificación del tono (cálido, neutro, frío) o modo de luz." },
        { key: "Ángulo de apertura", tip: "Ángulo en el que se distribuye la luz." },
        { key: "CRI", tip: "Fidelidad de color bajo esta luz, en una escala de 0 a 100." },
        { key: "Tipo de LED", tip: "Tecnología o encapsulado del LED utilizado." },
        { key: "Tiempo de arranque", tip: "Tiempo hasta alcanzar el flujo luminoso nominal." },
        { key: "Vida útil", tip: "Vida estimada del LED en horas de uso." },
        { key: "UGR", tip: "Nivel de deslumbramiento molesto que puede causar la luminaria." },
        { key: "LM80", tip: "Ensayo que certifica cuánto se deprecia la luz del LED con el tiempo." },
        { key: "Desviación estándar de igualación de colores", tip: "Consistencia de color entre unidades (relacionado con SDCM)." },
        { key: "Grupo de seguridad fotobiológica acc. EN62778", tip: "Clasificación de riesgo fotobiológico según normativa EN62778." },
      ],
    },
    {
      title: "Características materiales",
      icon: ICON_BOX,
      rows: [
        { key: "Dimensiones", tip: "Medidas exteriores del producto." },
        { key: "Tamaño", tip: "Dimensiones o formato general del producto." },
        { key: "Peso", tip: "Peso neto del producto." },
        { key: "Material del cuerpo", tip: "Material principal de la carcasa o estructura." },
        { key: "Material de tapa", tip: "Material de la tapa o cubierta." },
        { key: "Material del lente", tip: "Material del difusor u óptica." },
        { key: "Conector", tip: "Tipo de conector eléctrico o de instalación." },
        { key: "Conexión", tip: "Tipo de conexión del accesorio o luminaria." },
        { key: "Compatibilidad", tip: "Líneas o productos con los que es compatible." },
        { key: "Color del cuerpo", tip: "Color de la carcasa / cuerpo del producto." },
        { key: "Color de carcasa", tip: "Color exterior de la carcasa." },
        { key: "Panel táctil", tip: "Indica si el producto incluye panel táctil de control." },
        { key: "Largo del cable", tip: "Longitud del cable incluido." },
        { key: "Dimensiones del cable", tip: "Sección o medidas del cable incluido." },
        { key: "Largo del rollo", tip: "Longitud total del rollo de tira." },
        { key: "Distancia corte", tip: "Distancia entre puntos de corte de la tira." },
        { key: "Cantidad de luces", tip: "Cantidad de LEDs o puntos de luz." },
        { key: "Tipo de montaje", tip: "Forma de instalación (sobreponer, empotrar, pie, etc.)." },
        { key: "Temperatura de operación", tip: "Rango de temperatura ambiente de uso." },
        { key: "Protección IP", tip: "Grado de protección contra polvo y agua." },
        { key: "Protección IK", tip: "Grado de protección contra impactos mecánicos." },
      ],
    },
    {
      title: "Características de conectividad",
      icon: ICON_WIFI,
      rows: [
        { key: "Modo de conectividad", tip: "Protocolo o medio de conexión (Wi‑Fi, RF, Bluetooth, etc.)." },
        { key: "Conectividad", tip: "Tipo de conectividad del producto." },
        { key: "Frecuencia de operación", tip: "Frecuencia de radio o red en la que opera." },
        { key: "Chip", tip: "Chipset de conectividad integrado." },
        { key: "Tipo de red", tip: "Tipo de red compatible (2.4 GHz, Zigbee, etc.)." },
        { key: "Sistemas operativos soportados", tip: "SO móviles o de escritorio compatibles con la app." },
        { key: "Distancia de alcance RF en exterior", tip: "Alcance de radiofrecuencia en exteriores." },
        { key: "Distancia de alcance RF en interior", tip: "Alcance de radiofrecuencia en interiores." },
        { key: "Compatible con asistentes", tip: "Asistentes de voz o ecosistemas compatibles." },
        { key: "Funciones", tip: "Funciones inteligentes o de control disponibles." },
        { key: "APP", tip: "Aplicación móvil asociada al producto." },
        { key: "Conductores", tip: "Cantidad o tipo de conductores del cable." },
      ],
    },
    {
      title: "Características eléctricas de la controladora",
      icon: ICON_BOLT,
      rows: [
        { key: "Tensión controladora", tip: "Tensión de alimentación de la controladora." },
        { key: "Potencia controladora", tip: "Potencia máxima de la controladora." },
        { key: "Corriente por canal", tip: "Corriente máxima entregada por cada canal." },
      ],
    },
    {
      title: "Características del control remoto",
      icon: ICON_REMOTE,
      rows: [
        { key: "Alimentación remoto", tip: "Tipo de batería o alimentación del control remoto." },
        { key: "Dimensiones remoto", tip: "Medidas del control remoto." },
        { key: "Cantidad de botones", tip: "Número de botones del control remoto." },
        { key: "Alcance", tip: "Distancia máxima de operación del control remoto." },
      ],
    },
    {
      title: "Características de la controladora",
      icon: ICON_BOX,
      rows: [
        { key: "Dimensiones controladora", tip: "Medidas de la controladora." },
        { key: "Material del cuerpo controladora", tip: "Material de la carcasa de la controladora." },
        { key: "Conector controladora", tip: "Tipo de conector de la controladora." },
        { key: "Color de carcasa controladora", tip: "Color exterior de la controladora." },
        { key: "Largo del cable controladora", tip: "Longitud del cable de la controladora." },
        { key: "Garantía controladora", tip: "Garantía específica de la controladora." },
        { key: "Temperatura de operación controladora", tip: "Rango térmico de uso de la controladora." },
        { key: "Protección IP controladora", tip: "Grado IP de la controladora." },
      ],
    },
  ];

  /* Aliases CMS / labels → key canónica del schema */
  const SPEC_KEY_ALIASES = {
    Tension: "Tensión",
    Tensión: "Tensión",
    "Tipo de Energia": "Tipo de energía",
    "Tipo de Energía": "Tipo de energía",
    Dimeable: "Dimerizable",
    Dimerizable: "Dimerizable",
    "Lumenes Lm/w": "Lúmenes/W",
    "Lúmenes Lm/w": "Lúmenes/W",
    "Lm/W": "Lúmenes/W",
    "Flujo Luminoso": "Flujo luminoso",
    "Temperatura de color": "Temperatura del color",
    "Temperatura Color": "Temperatura del color",
    "Angulo de Apertura": "Ángulo de apertura",
    "Ángulo de Apertura": "Ángulo de apertura",
    "tipo de led": "Tipo de LED",
    "Tipo de led": "Tipo de LED",
    "Vida util": "Vida útil",
    "Certificado LM80": "LM80",
    LM80: "LM80",
    "Color de carcasa": "Color de carcasa",
    "Color del cuerpo": "Color del cuerpo",
    COLOR: "Color del cuerpo",
    Color: "Color del cuerpo",
    Material: "Material del cuerpo",
    "Material cuerpo": "Material del cuerpo",
    "MATERIAL CUERPO": "Material del cuerpo",
    Tamaño: "Tamaño",
    Dimensiones: "Dimensiones",
    DIMENSIONES: "Dimensiones",
    "Proteccion IP": "Protección IP",
    "Protección IP": "Protección IP",
    IP: "Protección IP",
    "Proteccion IK": "Protección IK",
    "Protección IK": "Protección IK",
    Garantia: "Garantía",
    Garantía: "Garantía",
    "GARANTIA TIEMPO": "Garantía",
    "Garantia tiempo": "Garantía",
    "Garantía tiempo": "Garantía",
    "Garantia Macroled": "Garantía Macroled",
    "Garantia de fabrica": "Garantía de fábrica",
    "Garantía de fabrica": "Garantía de fábrica",
    "Temperatura de operacion": "Temperatura de operación",
    "TEMPERATURA DE OPERACION": "Temperatura de operación",
    "TEMPERATURA COLOR": "Temperatura del color",
    "FLUJO LUMINOSO": "Flujo luminoso",
    "ANGULO DE APERTURA": "Ángulo de apertura",
    "LUMENES/W": "Lúmenes/W",
    FRECUENCIA: "Frecuencia",
    Frecuencia: "Frecuencia",
    AUTONOMÍA: "Autonomía",
    Autonomia: "Autonomía",
    CLASE: "Clase de protección",
    Clase: "Clase de protección",
    Cri: "CRI",
    CRI: "CRI",
    "PANEL TACTIL": "Panel táctil",
    "Panel tactil": "Panel táctil",
    "Panel táctil": "Panel táctil",
    "Control remoto": "Control remoto",
    "CONTROL REMOTO": "Control remoto",
    FUNCIONES: "Funciones",
    POTENCIA: "Potencia",
    TENSIÓN: "Tensión",
    "TIPO DE CARGA": "Tipo de carga",
    "Tipo de carga": "Tipo de carga",
    "TIEMPO DE CARGA": "Tiempo de carga",
    "Tiempo de carga": "Tiempo de carga",
    "TIPO DE LED": "Tipo de LED",
    "TIPO DE LUZ": "Tipo de luz",
    DIMERIZABLE: "Dimerizable",
    Smart: "Smart",
    Sdcm: "SDCM",
    SDCM: "SDCM",
    "Frecuencia de Operacion": "Frecuencia de operación",
    "Clase de proteccion": "Clase de protección",
    "Factor de Potencia (FP)": "Factor de Potencia (FP)",
    "Factor de potencia": "Factor de Potencia (FP)",
    "Anti high volt": "Anti-High-Volt",
    "Anti High Volt": "Anti-High-Volt",
    "On-Off": "ON-OFF Switch",
    "On/Off Switch": "ON-OFF Switch",
    "ON / OFF switch": "ON-OFF Switch",
  };

  /**
   * Atributos sueltos del CMS Webflow → key canónica.
   * En Designer: Custom Attribute name = "data-flujo-luminoso", value = campo CMS.
   * Si el valor viene vacío, no se muestra la fila.
   */
  const CMS_SPEC_ATTRS = {
    "data-autonomia": "Autonomía",
    "data-angulo-de-apertura": "Ángulo de apertura",
    "data-clase": "Clase de protección",
    "data-color": "Color del cuerpo",
    "data-cri": "CRI",
    "data-dimensiones": "Dimensiones",
    "data-funciones": "Funciones",
    "data-flujo-luminoso": "Flujo luminoso",
    "data-frecuencia": "Frecuencia",
    "data-garantia-tiempo": "Garantía",
    "data-ip": "Protección IP",
    "data-lumenes-w": "Lúmenes/W",
    "data-material-cuerpo": "Material del cuerpo",
    "data-panel-tactil": "Panel táctil",
    "data-peso": "Peso",
    "data-potencia": "Potencia",
    "data-temperatura-color": "Temperatura del color",
    "data-temperatura-de-operacion": "Temperatura de operación",
    "data-tension": "Tensión",
    "data-tiempo-de-carga": "Tiempo de carga",
    "data-tipo-de-carga": "Tipo de carga",
    "data-tipo-de-led": "Tipo de LED",
    "data-tipo-de-luz": "Tipo de luz",
    "data-dimerizable": "Dimerizable",
    "data-smart": "Smart",
    "data-control-remoto": "Control remoto",
  };

  function normalizeSpecKey(key) {
    if (!key) return "";
    if (SPEC_KEY_ALIASES[key]) return SPEC_KEY_ALIASES[key];
    return key;
  }

  function hasSpecValue(v) {
    if (v == null) return false;
    const s = String(v).trim();
    if (!s) return false;
    if (/^(-+|n\/?a|null|undefined|sin dato)$/i.test(s)) return false;
    return true;
  }

  function isTruthyFlag(v) {
    return /^(si|sí|true|1|yes|smart)$/i.test(String(v == null ? "" : v).trim());
  }

  /* Orden de jerarquía. Solo se muestran hasta TRUST_MAX visibles. */
  const TRUST_PRIORITY = [
    "garantia",
    "certificado",
    "ahorro",
    "cri",
    "dimerizable",
    "smart",
    "panel-tactil",
    "control-remoto",
    "angulo",
    "ip-ik",
    "material",
  ];
  const TRUST_MAX = 4;

  function syncTrustPriority() {
    const root = document.querySelector(".trust");
    if (!root) return;
    const byKey = {};
    root.querySelectorAll(".trust-item[data-trust]").forEach((el) => {
      byKey[el.getAttribute("data-trust")] = el;
    });
    let shown = 0;
    TRUST_PRIORITY.forEach((key) => {
      const el = byKey[key];
      if (!el) return;
      const eligible = el.getAttribute("data-trust-eligible") === "1";
      if (eligible && shown < TRUST_MAX) {
        el.hidden = false;
        shown++;
      } else {
        el.hidden = true;
      }
    });
  }

  function setTrustEligible(key, on) {
    const el = document.querySelector(`.trust-item[data-trust="${key}"]`);
    if (!el) return null;
    el.setAttribute("data-trust-eligible", on ? "1" : "0");
    return el;
  }

  function lookupSpec(map, key) {
    if (hasSpecValue(map[key])) return String(map[key]).trim();
    for (const [alias, canonical] of Object.entries(SPEC_KEY_ALIASES)) {
      if (canonical === key && hasSpecValue(map[alias])) return String(map[alias]).trim();
    }
    return "";
  }

  let tipBubble = null;
  let tipOpenFor = null;

  const SPEC_TIP_MARK =
    '<svg class="spec-tip__mark" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6.25" stroke="currentColor" stroke-width="1.4"/><path d="M8 7.2v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="8" cy="5.1" r="0.9" fill="currentColor"/></svg>';

  function ensureTipBubble() {
    if (!tipBubble) {
      tipBubble = document.createElement("div");
      tipBubble.className = "tip-bubble";
      tipBubble.setAttribute("role", "tooltip");
      tipBubble.innerHTML = '<span class="tip-bubble__title"></span><span class="tip-bubble__body"></span>';
      document.body.appendChild(tipBubble);
    }
    return tipBubble;
  }

  function showTip(el) {
    const bubble = ensureTipBubble();
    const titleEl = bubble.querySelector(".tip-bubble__title");
    const bodyEl = bubble.querySelector(".tip-bubble__body");
    const title = el.getAttribute("data-tip-title") || el.querySelector(".spec-tip__label")?.textContent?.trim() || el.textContent.trim();
    const body = el.dataset.tip || "";
    if (titleEl) titleEl.textContent = title;
    if (bodyEl) bodyEl.textContent = body;

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
    if (top < 10) {
      top = anchor.bottom + 12;
      below = true;
    }
    bubble.classList.toggle("is-below", below);
    bubble.style.left = `${left}px`;
    bubble.style.top = `${top}px`;

    const arrowX = anchor.left + anchor.width / 2 - left;
    bubble.style.setProperty("--tip-arrow-x", `${Math.max(14, Math.min(arrowX, br.width - 14))}px`);
  }

  function hideTip() {
    if (tipBubble) tipBubble.classList.remove("show");
    document.querySelectorAll(".spec-tip.is-open").forEach((el) => el.classList.remove("is-open"));
    tipOpenFor = null;
  }

  function wireTooltips(container) {
    container.querySelectorAll(".spec-tip").forEach((el) => {
      if (el.dataset.tipWired === "1") return;
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
        if (!isSameOpen) {
          showTip(el);
          tipOpenFor = el;
        }
      });
    });
  }
  document.addEventListener("click", () => hideTip());

  function syncAccordionHeights() {
    document.querySelectorAll(".spec-group.is-open .spec-body").forEach((body) => {
      body.style.maxHeight = body.scrollHeight + "px";
    });
  }

  function renderSpecGroups(specs) {
    const root = document.getElementById("specGroups");
    if (!root) return;
    const map = specs || {};
    let html = "";

    SPEC_GROUPS.forEach((group, gi) => {
      const visibleRows = group.rows
        .map((row) => {
          const val = lookupSpec(map, row.key);
          return val ? { ...row, val } : null;
        })
        .filter(Boolean);

      /* Evitar duplicar Dimerizable si ya salió en eléctricas y también está en lumínicas */
      const seenKeys = new Set();
      const uniqueRows = visibleRows.filter((r) => {
        if (seenKeys.has(r.key)) return false;
        seenKeys.add(r.key);
        return true;
      });

      if (!uniqueRows.length) return;

      const open = gi < 3;
      html += `
        <div class="spec-group${open ? " is-open" : ""}">
          <button type="button" class="spec-group-head" aria-expanded="${open ? "true" : "false"}">
            <span class="sg-title">${group.icon}<span class="sg-title-text">${escapeHtml(group.title)}</span></span>
            <span class="sg-toggle" aria-hidden="true">${open ? "\u2212" : "+"}</span>
          </button>
          <div class="spec-body" style="max-height:${open ? "none" : "0px"}">
            ${uniqueRows
              .map(
                (r) => `
              <div class="spec-row" data-spec-key="${escapeHtml(r.key)}">
                <span class="k">${
                  r.tip
                    ? `<button type="button" class="spec-tip" data-tip-title="${escapeHtml(r.key)}" data-tip="${escapeHtml(r.tip)}" aria-label="${escapeHtml(r.key)}: más información"><span class="spec-tip__label">${escapeHtml(r.key)}</span>${SPEC_TIP_MARK}</button>`
                    : escapeHtml(r.key)
                }</span>
                <span class="v" data-spec-val>${escapeHtml(r.val)}</span>
              </div>`
              )
              .join("")}
          </div>
        </div>`;
    });

    root.innerHTML = html || `<p class="soon-note" style="color:var(--muted);font-size:14px;padding:12px 0">Sin especificaciones cargadas.</p>`;

    /* Deduplicar Dimerizable entre grupos: si aparece en eléctricas, quitar de lumínicas */
    const electricGroup = [...root.querySelectorAll(".spec-group")].find((g) =>
      g.querySelector(".sg-title-text")?.textContent?.includes("eléctricas")
    );
    const luminicGroup = [...root.querySelectorAll(".spec-group")].find((g) =>
      g.querySelector(".sg-title-text")?.textContent?.includes("lumínicas")
    );
    if (electricGroup && luminicGroup) {
      const hasDimE = electricGroup.querySelector('[data-spec-key="Dimerizable"]');
      const dimL = luminicGroup.querySelector('[data-spec-key="Dimerizable"]');
      if (hasDimE && dimL) dimL.remove();
      if (!luminicGroup.querySelector(".spec-row")) luminicGroup.hidden = true;
    }

    wireTooltips(root);
    requestAnimationFrame(syncAccordionHeights);
  }

  const specGroupsRoot = document.getElementById("specGroups");
  const commercialGroupsRoot = document.getElementById("commercialGroups");

  function onSpecAccordionClick(e) {
    const head = e.target.closest(".spec-group-head");
    if (!head || e.target.closest(".spec-tip")) return;
    const group = head.closest(".spec-group");
    const body = group.querySelector(".spec-body");
    const toggle = head.querySelector(".sg-toggle");
    group.classList.toggle("is-open");
    const open = group.classList.contains("is-open");
    head.setAttribute("aria-expanded", open ? "true" : "false");
    body.style.maxHeight = open ? body.scrollHeight + "px" : "0px";
    toggle.textContent = open ? "\u2212" : "+";
  }

  if (specGroupsRoot) specGroupsRoot.addEventListener("click", onSpecAccordionClick);
  if (commercialGroupsRoot) commercialGroupsRoot.addEventListener("click", onSpecAccordionClick);
  window.addEventListener("resize", syncAccordionHeights);

  function syncQuickSpecs(specs) {
    const root = document.querySelector(".quick-specs");
    if (!root) return;
    let visible = 0;
    root.querySelectorAll(".qspec").forEach((block) => {
      const key = normalizeSpecKey(block.getAttribute("data-spec-key"));
      const valEl = block.querySelector("[data-spec-val]");
      let val = lookupSpec(specs, key);
      /* En "Luz" mostramos la categoría (Cálido/Neutro/Frío/RGB): el Kelvin exacto
         ya aparece en el chip de variante y en la tabla de especificaciones. */
      if (key === "Temperatura del color") {
        const tipo = lookupSpec(specs, "Tipo de luz");
        const cat = tempCategory(tipo) || tempCategory(val);
        val = (cat && TEMP_LABELS[cat]) || tipo || val;
      }
      if (valEl) valEl.textContent = val || "";
      const on = hasSpecValue(val);
      block.hidden = !on;
      if (on) visible++;
    });
    root.setAttribute("data-count", String(visible));
    root.hidden = visible === 0;
  }

  function syncCommercialTable(specs, extra) {
    const map = Object.assign({}, specs, extra || {});
    const table = document.getElementById("commercialTable");
    const group = document.getElementById("commercialGroup");
    let visible = 0;
    document.querySelectorAll("#panel-commercial [data-spec-key]").forEach((block) => {
      const key = block.getAttribute("data-spec-key");
      const valEl = block.querySelector("[data-spec-val]");
      let val = "";
      if (key === "SKU") val = map.SKU || "";
      else if (key === "EAN13") val = map.EAN13 || "";
      else if (key === "Familia") val = map.Familia || "";
      else if (key === "Macrofamilia") val = map.Macrofamilia || "";
      else val = lookupSpec(map, key);
      if (valEl && val) valEl.textContent = val;
      const on = hasSpecValue(val);
      block.hidden = !on;
      if (on) visible++;
    });
    if (group) group.hidden = visible === 0;
    if (table) {
      wireTooltips(table);
      if (group && group.classList.contains("is-open")) {
        table.style.maxHeight = table.scrollHeight + "px";
      }
    }
  }

  function updateSpecVals(specs, extra) {
    const map = Object.assign({}, specs, extra || {});
    renderSpecGroups(map);
    syncQuickSpecs(map);
    syncCommercialTable(map, extra);
  }

  function refreshOpenAccordions() {
    syncAccordionHeights();
  }

  /* —— Compatible (reemplazado por destacados.js / Typesense) —— */

  /* —— Variants (CMS siblings) —— */

  /**
   * "Nombre ATTR_Variantes" del CMS → claves de spec que pueden contener ese valor.
   * Las claves del objeto van normalizadas (sin acentos, minúsculas) porque el CMS
   * trae variaciones como "Ángulo ", "angulo" o "Temperatura de color".
   */
  const DIM_LABEL_CANDIDATES = {
    color: ["Color del cuerpo", "Color"],
    "color del cuerpo": ["Color del cuerpo", "Color"],
    luz: ["Temperatura del color", "Tipo de luz"],
    "tipo de luz": ["Tipo de luz", "Temperatura del color"],
    temperatura: ["Temperatura del color", "Tipo de luz"],
    "temperatura de color": ["Temperatura del color", "Tipo de luz"],
    "temperatura del color": ["Temperatura del color", "Tipo de luz"],
    cct: ["Temperatura del color", "Tipo de luz"],
    angulo: ["Ángulo de apertura"],
    "angulo de apertura": ["Ángulo de apertura"],
    apertura: ["Ángulo de apertura"],
    potencia: ["Potencia"],
    conector: ["Conector", "Conexión"],
    conexion: ["Conexión", "Conector"],
    ip: ["Protección IP"],
    "proteccion ip": ["Protección IP"],
    medida: ["Dimensiones"],
    medidas: ["Dimensiones"],
    dimensiones: ["Dimensiones"],
    tension: ["Tensión"],
    material: ["Material del cuerpo"],
    "material del cuerpo": ["Material del cuerpo"],
    "flujo luminoso": ["Flujo luminoso"],
    "cantidad de luces": ["Cantidad de luces"],
  };

  /* Identificadores y datos comerciales: nunca son el eje de una variante. */
  const NON_DIM_KEYS = new Set([
    "SKU",
    "EAN13",
    "Familia",
    "Macrofamilia",
    "Subfamilia",
    "Garantía",
  ]);

  /* Orden de preferencia cuando el CMS no declara "Nombre ATTR_Variantes". */
  const DIM_AUTODETECT_PRIORITY = [
    "Color del cuerpo",
    "Temperatura del color",
    "Tipo de luz",
    "Ángulo de apertura",
    "Potencia",
    "Conector",
    "Conexión",
    "Protección IP",
    "Dimensiones",
  ];

  const COLOR_SWATCH = {
    blanco: "#f4f4f4",
    negro: "#1a1a1a",
    rojo: "#c62828",
    verde: "#2e7d32",
    azul: "#1565c0",
    amarillo: "#f9a825",
    gris: "#9e9e9e",
    bronce: "#b08d57",
    cobre: "#b87333",
    dorado: "#c9a227",
    plata: "#c0c0c0",
    plateado: "#c0c0c0",
    platil: "#c0c0c0",
    cromo: "#cfd4d8",
    niquel: "#b6b6b6",
    madera: "#a97142",
  };

  function normKey(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  /* Specs que describen el color de la luz (no el del cuerpo del artefacto). */
  const TEMP_SPEC_KEYS = new Set(["Temperatura del color", "Tipo de luz"]);

  const TEMP_LABELS = {
    calido: "Cálido",
    neutro: "Neutro",
    frio: "Frío",
    cct: "CCT",
    rgb: "RGB",
    rgbw: "RGB+W",
  };

  /* Mismos tonos que los badges de las cards (destacados.js). */
  const RGB_WHEEL = "#ff3b30,#ffcc00,#34c759,#00bcd4,#5856d6,#ff2d55,#ff3b30";
  const TEMP_SWATCH = {
    calido: "#fff79b",
    neutro: "#d9d9d9",
    frio: "#bce4fa",
    cct: "linear-gradient(90deg,#fff79b,#d9d9d9,#bce4fa)",
    rgb: `conic-gradient(${RGB_WHEEL})`,
    rgbw: `conic-gradient(#ffffff 0 25%,${RGB_WHEEL})`,
  };

  /**
   * "2700K" → calido, "6500K" → frio, "RGB+W" → rgbw,
   * "2700K a 6500K" → cct (sintonizable, no es un tono fijo).
   */
  function kelvinsIn(value) {
    return normKey(value).match(/\d{4}/g) || [];
  }

  function tempCategory(value) {
    const v = normKey(value);
    if (!v) return null;
    if (v.indexOf("rgb") !== -1) return /rgb\s*\+?\s*w|rgbw/.test(v) ? "rgbw" : "rgb";
    if (/calid|warm/.test(v)) return "calido";
    if (/neutr/.test(v)) return "neutro";
    if (/frio|cool/.test(v)) return "frio";

    const kelvins = kelvinsIn(value);
    if (!kelvins.length) return null;
    if (kelvins.length > 1) return "cct";
    const k = parseInt(kelvins[0], 10);
    if (k <= 3500) return "calido";
    if (k <= 5000) return "neutro";
    return "frio";
  }

  /* Cálido → neutro → frío → CCT → RGB → RGB+W, y dentro del blanco por Kelvin. */
  function tempSort(a, b) {
    const TIER = { cct: 2, rgb: 3, rgbw: 4 };
    const catA = tempCategory(a);
    const catB = tempCategory(b);
    const tierA = TIER[catA] || 1;
    const tierB = TIER[catB] || 1;
    if (tierA !== tierB) return tierA - tierB;

    if (tierA === 1) {
      const ka = kelvinsIn(a);
      const kb = kelvinsIn(b);
      if (ka.length === 1 && kb.length === 1) {
        const diff = parseInt(ka[0], 10) - parseInt(kb[0], 10);
        if (diff) return diff;
      }
      const BLANCOS = ["calido", "neutro", "frio"];
      const ia = BLANCOS.indexOf(catA);
      const ib = BLANCOS.indexOf(catB);
      if (ia !== ib) return ia - ib;
    }

    return String(a).localeCompare(String(b), "es");
  }

  const variantsTarget = document.getElementById("product-variants") || document.querySelector(".container_variants");

  function parseList(raw) {
    return String(raw || "")
      .split(/[;|]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function parseSpecs(el) {
    const out = {};

    /* 1) data-specs JSON opcional (legacy / fallback) */
    try {
      let rawJson = el.getAttribute("data-specs");
      if (rawJson) {
        /* Webflow a veces deja espacios/newlines; limpiar comas colgantes leves */
        rawJson = String(rawJson)
          .replace(/,\s*([}\]])/g, "$1")
          .trim();
        const parsed = JSON.parse(rawJson) || {};
        Object.keys(parsed).forEach((k) => {
          if (!hasSpecValue(parsed[k])) return;
          out[normalizeSpecKey(k)] = String(parsed[k]).trim();
        });
      }
    } catch (e) {
      console.warn("JSON inválido en data-specs de", el.getAttribute("data-sku"), e);
    }

    /* 2) Campos CMS individuales (ganan sobre JSON si ambos existen) */
    Object.keys(CMS_SPEC_ATTRS).forEach((attr) => {
      const raw = el.getAttribute(attr);
      if (!hasSpecValue(raw)) return;
      out[CMS_SPEC_ATTRS[attr]] = String(raw).trim();
    });

    return out;
  }

  function slugify(str) {
    return String(str)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function variantSort(a, b) {
    const colorOrder = ["blanco", "negro", "gris", "plata", "platil", "rojo", "verde", "azul", "bronce", "cobre"];
    const ia = colorOrder.indexOf(normKey(a));
    const ib = colorOrder.indexOf(normKey(b));
    if (ia !== -1 || ib !== -1) {
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    }
    const na = parseFloat(String(a).replace(",", ".").replace(/[^\d.]/g, "")) || 0;
    const nb = parseFloat(String(b).replace(",", ".").replace(/[^\d.]/g, "")) || 0;
    if (na !== nb) return na - nb;
    return String(a).localeCompare(String(b), "es");
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function setText(sel, value) {
    const el = typeof sel === "string" ? document.querySelector(sel) : sel;
    if (el && value != null && value !== "") el.textContent = value;
  }

  function setHref(sel, url) {
    const el = typeof sel === "string" ? document.querySelector(sel) : sel;
    if (el && url) el.href = url;
  }

  function syncFileCards(files) {
    const map = {
      ficha: files && files.ficha,
      garantia: files && files.garantia,
      manual: files && files.manual,
      catalogo: files && files.catalogo,
      ies: files && files.ies,
    };
    document.querySelectorAll("#files-list .dl-card").forEach((card) => {
      const key = card.getAttribute("data-file");
      const url = (map[key] || "").trim();
      if (url && url !== "#") {
        card.href = url;
        card.hidden = false;
      } else {
        card.removeAttribute("href");
        card.hidden = true;
      }
    });
  }

  let heroItem = null;
  let siblings = [];
  let dimensionKeys = [];

  /**
   * Las hermanas salen de la Collection List atada a Variantes_Multireference:
   * todo lo que esa lista renderiza ES una variante del producto actual, así que
   * alcanza con marcarlas con data-variant-item. El campo de texto
   * data-variantes-sku queda solo como fallback para el mock local.
   */
  function collectSiblings(current) {
    const currentSku = (current.getAttribute("data-sku") || "").trim();
    const bySku = new Map();
    const push = (el) => {
      const sku = (el.getAttribute("data-sku") || "").trim();
      if (!sku || bySku.has(sku)) return;
      bySku.set(sku, el);
    };

    /* El héroe primero: si el multi-reference se incluye a sí mismo, gana el embed
       del héroe, que es el que trae la ficha completa. */
    push(current);
    document.querySelectorAll(".cms-product-item[data-variant-item]").forEach(push);

    if (bySku.size <= 1) {
      const wanted = new Set(parseList(current.getAttribute("data-variantes-sku")));
      document.querySelectorAll(".cms-product-item").forEach((el) => {
        const sku = (el.getAttribute("data-sku") || "").trim();
        if (wanted.has(sku) || parseList(el.getAttribute("data-variantes-sku")).indexOf(currentSku) !== -1) {
          push(el);
        }
      });
    }

    return Array.from(bySku.values());
  }

  function specValues(sibs, key) {
    const values = new Set();
    sibs.forEach((el) => {
      const value = (parseSpecs(el)[key] || "").trim();
      if (value) values.add(value);
    });
    return values;
  }

  function allSpecKeys(sibs) {
    const keys = new Set();
    sibs.forEach((el) => Object.keys(parseSpecs(el)).forEach((key) => keys.add(key)));
    return Array.from(keys);
  }

  /**
   * Devuelve la clave de spec que diferencia a las variantes, o [] si ninguna lo
   * hace (en ese caso los chips se etiquetan por nombre/SKU).
   */
  function resolveDimensions(current, sibs) {
    const declaredRaw = (current.getAttribute("data-nombre-attr-variantes") || "").trim();
    const declared = normKey(declaredRaw);
    const differs = (key) => !NON_DIM_KEYS.has(key) && specValues(sibs, key).size > 1;

    if (declared) {
      const candidates = (DIM_LABEL_CANDIDATES[declared] || []).concat(
        allSpecKeys(sibs).filter((key) => normKey(key) === declared)
      );
      const hit = candidates.find(differs);
      if (hit) return [hit];
      console.warn(
        `[variantes] el CMS declara "${declaredRaw}" pero ningún campo con ese valor difiere entre las variantes. Autodetectando…`
      );
    }

    const auto = DIM_AUTODETECT_PRIORITY.find(differs) || allSpecKeys(sibs).find(differs);
    return auto ? [auto] : [];
  }

  const CHIP_LABELS = {
    "Color del cuerpo": "Color",
    "Temperatura del color": "Temperatura",
    "Ángulo de apertura": "Ángulo",
    "Protección IP": "Protección",
  };

  function renderChipGroup(label, groupName, entries, activeValue) {
    let html =
      `<div class="variant-group"><span class="variant-label">${escapeHtml(label)}</span>` +
      `<div class="variant-chips" role="radiogroup" aria-label="${escapeHtml(label)}">`;
    entries.forEach((entry) => {
      const isActive = entry.value === activeValue;
      const inputId = groupName + "--" + slugify(entry.value);
      const swatch = entry.swatch
        ? `<span class="variant-swatch" style="background:${entry.swatch}" aria-hidden="true"></span>`
        : "";
      html +=
        `<label for="${inputId}" class="variant-chip${isActive ? " active" : ""}">` +
        `<input type="radio" class="variant-chip-radio" id="${inputId}" name="${groupName}"` +
        ` data-dim="${escapeHtml(entry.dim || "")}" data-val="${escapeHtml(entry.value)}"` +
        (entry.sku ? ` data-sku="${escapeHtml(entry.sku)}"` : "") +
        (isActive ? " checked" : "") +
        `>` +
        swatch +
        escapeHtml(entry.value) +
        `</label>`;
    });
    return html + "</div></div>";
  }

  /* "PAR16-AL-6.5W-DIM-12D-WW" → "12D-WW": se recorta el tramo que comparten todos. */
  function stripCommonSkuPrefix(skus) {
    if (skus.length < 2) return skus.slice();
    const parts = skus.map((sku) => sku.split("-"));
    const min = Math.min(...parts.map((p) => p.length));
    let common = 0;
    while (common < min - 1 && parts.every((p) => p[common] === parts[0][common])) common += 1;
    const short = parts.map((p) => p.slice(common).join("-"));
    return new Set(short).size === skus.length ? short : skus.slice();
  }

  /* Sin spec que las distinga, se etiqueta por nombre; si los nombres se repiten, por SKU. */
  function fallbackChipEntries(sibs) {
    const skus = sibs.map((el) => (el.getAttribute("data-sku") || "").trim());
    const names = sibs.map((el) => (el.getAttribute("data-name") || "").trim());
    const useName = new Set(names.filter(Boolean)).size === sibs.length;
    const shortSkus = stripCommonSkuPrefix(skus);
    return sibs
      .map((el, i) => ({
        sku: skus[i],
        value: (useName ? names[i] : shortSkus[i]) || skus[i],
        swatch: "",
      }))
      .sort((a, b) => variantSort(a.value, b.value));
  }

  function buildChipsHtml() {
    if (!variantsTarget || !heroItem) return "";
    const currentSpecs = parseSpecs(heroItem);
    let html = "";

    if (dimensionKeys.length) {
      dimensionKeys.forEach((key) => {
        /* "Temperatura del color" contiene "color", así que se chequea primero. */
        const isTempDim = TEMP_SPEC_KEYS.has(key);
        const isBodyColorDim = !isTempDim && normKey(key).indexOf("color") !== -1;
        const values = [...specValues(siblings, key)].sort(isTempDim ? tempSort : variantSort);
        if (values.length <= 1) return;
        const swatchFor = (value) => {
          if (isTempDim) return TEMP_SWATCH[tempCategory(value)] || "";
          if (isBodyColorDim) return COLOR_SWATCH[normKey(value)] || "";
          return "";
        };
        html += renderChipGroup(
          CHIP_LABELS[key] || key,
          "variant-" + slugify(key),
          values.map((value) => ({ value, dim: key, swatch: swatchFor(value) })),
          (currentSpecs[key] || "").trim()
        );
      });
    } else if (siblings.length > 1) {
      const declared = (heroItem.getAttribute("data-nombre-attr-variantes") || "").trim();
      const heroSku = (heroItem.getAttribute("data-sku") || "").trim();
      const entries = fallbackChipEntries(siblings);
      const active = entries.find((entry) => entry.sku === heroSku);
      html += renderChipGroup(
        declared || "Variante",
        "variant-fallback",
        entries,
        active ? active.value : ""
      );
    }

    variantsTarget.hidden = !html;
    variantsTarget.style.display = html ? "flex" : "none";
    return html;
  }

  function findMatchForInput(input) {
    const sku = (input.getAttribute("data-sku") || "").trim();
    if (sku) {
      return siblings.find((el) => (el.getAttribute("data-sku") || "").trim() === sku) || null;
    }
    return findBestMatch(input.getAttribute("data-dim"), input.getAttribute("data-val"));
  }

  function findBestMatch(desiredKey, desiredVal) {
    const currentSpecs = parseSpecs(heroItem);
    const candidates = siblings.filter(
      (el) => (parseSpecs(el)[desiredKey] || "").trim() === desiredVal
    );
    if (!candidates.length) return null;
    if (candidates.length === 1) return candidates[0];

    let best = candidates[0];
    let bestScore = -1;
    candidates.forEach((el) => {
      const specs = parseSpecs(el);
      let score = 0;
      dimensionKeys.forEach((k) => {
        if (k !== desiredKey && (specs[k] || "").trim() === (currentSpecs[k] || "").trim()) score++;
      });
      if (score > bestScore) {
        bestScore = score;
        best = el;
      }
    });
    return best;
  }

  function applyProduct(el, opts) {
    opts = opts || {};
    const specs = parseSpecs(el);
    const sku = (el.getAttribute("data-sku") || "").trim();
    const name = (el.getAttribute("data-name") || "").trim();
    const link = (el.getAttribute("data-product-url") || el.getAttribute("data-link") || "").trim();
    const ean13 = (el.getAttribute("data-ean13") || "").trim();
    const multiimage = parseList(el.getAttribute("data-multiimage"));
    const image = (el.getAttribute("data-image") || "").trim();
    const description = (el.getAttribute("data-descripcion") || "").trim();
    const family = (el.getAttribute("data-family") || "").trim();
    const macro = (el.getAttribute("data-macrofamilia") || "").trim();
    const fichaUrl = (el.getAttribute("data-ficha") || "").trim();
    const garantiaUrl = (el.getAttribute("data-garantia") || "").trim();
    const catalogoUrl = (el.getAttribute("data-catalogo") || "").trim();
    const manualUrl = (el.getAttribute("data-manual") || "").trim();
    const iesUrl = (el.getAttribute("data-ies") || "").trim();

    setText("#ficha-name", name);
    setText(".info h1", name);
    setText("#crumb-name", name);
    setText("#ficha-sku", sku);
    setText("#ficha-ean", ean13);
    setText("#ficha-lead", description);
    if (macro || family) {
      setText("#ficha-eyebrow", [macro, family].filter(Boolean).join(" · "));
    }
    setText("#crumb-family", family);
    setText("#aiProductName", name);
    setText("#aiProductMeta", `SKU ${sku}${macro ? " · " + macro : ""}`);

    document.title = `${name} — MACROLED`;

    setGallery(multiimage.length ? multiimage : [image], name);

    const nuevoRaw = (el.getAttribute("data-nuevo") || "").trim().toLowerCase();
    const isNuevo = ["true", "1", "si", "sí", "yes"].includes(nuevoRaw);
    const stageBadge = document.getElementById("stage-badge");
    if (stageBadge) {
      stageBadge.textContent = "Nuevo";
      stageBadge.hidden = !isNuevo;
    }

    setHref("#btn-ficha", fichaUrl);
    syncFileCards({
      ficha: fichaUrl,
      garantia: garantiaUrl,
      manual: manualUrl,
      catalogo: catalogoUrl,
      ies: iesUrl,
    });
    const btnCat = document.getElementById("btn-catalogo");
    if (btnCat) {
      const second = manualUrl || catalogoUrl;
      if (second) btnCat.href = second;
    }

    updateSpecVals(specs, {
      SKU: sku,
      EAN13: ean13,
      Familia: family,
      Macrofamilia: macro,
    });

    const ipVal = (specs["Protección IP"] || "").trim();
    const ikVal = (specs["Protección IK"] || "").trim();
    const trustIp = document.querySelector("[data-trust-ip]");
    const trustIk = document.querySelector("[data-trust-ik]");
    if (trustIp) {
      trustIp.textContent = ipVal;
      trustIp.hidden = !ipVal;
    }
    if (trustIk) {
      trustIk.textContent = ikVal;
      trustIk.hidden = !ikVal;
    }
    setTrustEligible("ip-ik", !!(ipVal || ikVal));

    const garVal = (specs["Garantía"] || "").trim();
    const trustGarEl = document.querySelector("[data-trust-garantia]");
    if (trustGarEl) trustGarEl.textContent = garVal;
    setTrustEligible("garantia", !!garVal);

    /* Sellos fijos de marca: siempre visibles (si entran en el top 4) */
    setTrustEligible("certificado", true);
    setTrustEligible("ahorro", true);

    const potVal = (specs["Potencia"] || "").trim();
    const tenVal = (specs["Tensión"] || "").trim();

    const criVal = (specs["CRI"] || "").trim();
    const trustCriEl = document.querySelector("[data-trust-cri]");
    if (trustCriEl) trustCriEl.textContent = criVal;
    setTrustEligible("cri", !!criVal);

    const dimVal = specs["Dimerizable"];
    setTrustEligible("dimerizable", isTruthyFlag(dimVal));

    const smartRaw = specs["Smart"] || el.getAttribute("data-smart");
    setTrustEligible("smart", isTruthyFlag(smartRaw));

    const panelRaw = specs["Panel táctil"] || el.getAttribute("data-panel-tactil");
    setTrustEligible("panel-tactil", hasSpecValue(panelRaw) && !/^(no|false|0)$/i.test(String(panelRaw).trim()));

    const remoteRaw = specs["Control remoto"] || el.getAttribute("data-control-remoto");
    setTrustEligible(
      "control-remoto",
      hasSpecValue(remoteRaw) && !/^(no|false|0)$/i.test(String(remoteRaw).trim())
    );

    const angVal = (specs["Ángulo de apertura"] || "").trim();
    const trustAngEl = document.querySelector("[data-trust-angulo]");
    if (trustAngEl) trustAngEl.textContent = angVal;
    setTrustEligible("angulo", !!angVal);

    const matVal = (
      specs["Material del cuerpo"] ||
      specs["Material"] ||
      specs["Material de tapa"] ||
      ""
    ).trim();
    const trustMatEl = document.querySelector("[data-trust-material]");
    if (trustMatEl) trustMatEl.textContent = matVal;
    setTrustEligible("material", !!matVal);

    syncTrustPriority();

    const PRODUCT_CTX = window.__mlProductCtx || (window.__mlProductCtx = {});
    PRODUCT_CTX.name = name;
    PRODUCT_CTX.sku = sku;
    PRODUCT_CTX.power = potVal;
    PRODUCT_CTX.voltage = tenVal;
    PRODUCT_CTX.warranty = garVal;
    PRODUCT_CTX.ficha = fichaUrl;
    PRODUCT_CTX.manual = manualUrl || garantiaUrl;
    /* —— Capa 1 / Capa 2: contexto ampliado para el asistente ——
       Se suman SKU/EAN/Familia/Macrofamilia al mapa de specs para que la
       búsqueda genérica (genericSpecMatch) también los pueda encontrar. */
    PRODUCT_CTX.specs = Object.assign({}, specs, {
      SKU: sku,
      EAN13: ean13,
      Familia: family,
      Macrofamilia: macro,
    });
    PRODUCT_CTX.ean13 = ean13;
    PRODUCT_CTX.family = family;
    PRODUCT_CTX.macro = macro;
    PRODUCT_CTX.description = description;
    PRODUCT_CTX.contactoUrl = CONTACTO_URL;

    if (typeof renderSuggestions === "function") renderSuggestions();

    heroItem = el;
    if (variantsTarget) variantsTarget.innerHTML = buildChipsHtml();
    refreshOpenAccordions();

    if (!opts.skipHistory && link && link !== "#") {
      const path = link.startsWith("/") ? link : "/" + link;
      if (window.location.pathname !== path) {
        window.history.pushState({ sku }, "", path);
      }
    }

    window.dispatchEvent(new CustomEvent("ml-product-changed", { detail: { sku } }));
  }

  /**
   * El embed del héroe y los de la Collection List de variantes se montan en
   * cualquier orden, así que no alcanza con tomar el primero del DOM.
   */
  function pickHeroItem() {
    const all = Array.prototype.slice.call(document.querySelectorAll(".cms-product-item"));
    if (!all.length) return null;

    const explicit = all.find((el) => el.hasAttribute("data-hero"));
    if (explicit) return explicit;

    const nonVariant = all.filter((el) => !el.hasAttribute("data-variant-item"));
    if (nonVariant.length === 1) return nonVariant[0];

    const initialSku = (document.getElementById("ficha-sku")?.textContent || "").trim();
    const bySku = (list) => list.find((el) => (el.getAttribute("data-sku") || "").trim() === initialSku);
    return (initialSku && (bySku(nonVariant) || bySku(all))) || nonVariant[0] || all[0];
  }

  let variantsBound = false;
  let lastVariantSignature = "";
  let userPickedVariant = false;

  function initVariants() {
    if (!variantsTarget) return;

    heroItem = pickHeroItem();
    if (!heroItem) {
      variantsTarget.hidden = true;
      console.warn("[variantes] no hay ningún .cms-product-item en el DOM.");
      return;
    }

    siblings = collectSiblings(heroItem);
    const signature = siblings.map((el) => (el.getAttribute("data-sku") || "").trim()).join("|");
    if (lastVariantSignature && signature === lastVariantSignature) return;
    lastVariantSignature = signature;

    siblings.forEach((el) => {
      parseList(el.getAttribute("data-multiimage")).forEach((src) => {
        if (!src) return;
        const img = new Image();
        img.src = src;
      });
    });

    dimensionKeys = resolveDimensions(heroItem, siblings);

    console.log("[variantes]", {
      hero: (heroItem.getAttribute("data-sku") || "").trim(),
      hermanas: siblings.length,
      skus: siblings.map((el) => (el.getAttribute("data-sku") || "").trim()),
      atributoDeclarado: (heroItem.getAttribute("data-nombre-attr-variantes") || "").trim() || "(vacío)",
      dimension: dimensionKeys[0] || "(fallback por nombre/SKU)",
    });

    if (siblings.length <= 1) {
      variantsTarget.hidden = true;
      console.warn(
        "[variantes] solo se encontró el producto actual. Falta la Collection List atada a " +
          "Variantes_Multireference: cada item tiene que imprimir un .cms-product-item con data-variant-item. " +
          "Ver variantes-embed.html."
      );
      applyProduct(heroItem, { skipHistory: true });
      return;
    }

    applyProduct(heroItem, { skipHistory: true });

    if (variantsBound) return;
    variantsBound = true;

    variantsTarget.addEventListener("change", (e) => {
      const input = e.target;
      if (!input.classList || !input.classList.contains("variant-chip-radio")) return;
      const match = findMatchForInput(input);
      if (!match) return;
      userPickedVariant = true;
      applyProduct(match);
    });

    window.addEventListener("popstate", () => {
      const slug = (location.pathname || "").replace(/^\//, "");
      const match =
        siblings.find((el) => {
          const link = (el.getAttribute("data-link") || el.getAttribute("data-product-url") || "").replace(/^\//, "");
          return link === slug;
        }) ||
        siblings.find((el) => (el.getAttribute("data-sku") || "") === (history.state && history.state.sku));
      if (match) applyProduct(match, { skipHistory: true });
    });
  }

  /* —— AI assistant —— */
  const CONTACTO_URL = "https://macroled.com.ar/contacto"; // TODO: reemplazar por la URL real de contacto

  const PRODUCT_CTX = (window.__mlProductCtx = {
    name: "Space Blanca",
    sku: "SPACE-B",
    voltage: "DC 5V",
    power: "1.6W",
    warranty: "1 año",
    ficha: "https://s3.coresagroup.com/MACROLED/DS/SPACE-B.pdf",
    manual: "https://s3.coresagroup.com/MACROLED/Garantias/SPACE-B.pdf",
    specs: {},
    contactoUrl: CONTACTO_URL,
  });

  /**
   * Capa 1 — reglas locales. Cada regla intenta resolver la pregunta con
   * datos que YA están cargados en la página (PRODUCT_CTX.specs), sin
   * llamar a la IA. Se evalúan en orden; gana la primera que matchea Y
   * tiene dato disponible para este SKU.
   *
   * key      -> nombre exacto del spec en PRODUCT_CTX.specs
   * tpl(v)   -> cómo redactar la respuesta con ese valor
   * special  -> casos que no son un spec simple (ficha, sku, precio, etc.)
   */
  /* Qué significa cada código IP habitual en iluminación (para enriquecer
     la respuesta sin inventar datos que no están en la ficha). */
  const IP_MEANINGS = {
    ip20: "uso en interiores, sin protección contra líquidos",
    ip44: "resistente a salpicaduras, apto para exteriores protegidos",
    ip54: "protegido contra polvo y salpicaduras de agua",
    ip65: "protegido contra chorros de agua, apto para exteriores",
    ip66: "protegido contra chorros de agua potentes",
    ip67: "resistente a inmersión temporal en agua",
    ip68: "resistente a inmersión prolongada en agua",
  };

  const REGLAS_LOCALES = [
    { test: /autonom[ií]a|dura la bater[ií]a|cu[aá]ntas horas/i, key: "Autonomía",
      tpl: (v) => `La autonomía es de <b>${v}</b>.` },

    { test: /tiempo de carga|cu[aá]nto tarda en cargar/i, key: "Tiempo de carga",
      tpl: (v) => `Se carga por completo en <b>${v}</b>.` },

    { test: /\bip\d{0,2}\b|resiste el? agua|humedad|exterior|lluvia|intemperie/i, key: "Protección IP",
      tpl: (v) => {
        const meaning = IP_MEANINGS[normKey(v).replace(/\s+/g, "")];
        return meaning
          ? `Sí, tiene protección <b>${v}</b>: ${meaning}.`
          : `Sí, tiene protección <b>${v}</b>.`;
      } },

    { test: /\bik\d{0,2}\b|resiste golpes|impacto/i, key: "Protección IK",
      tpl: (v) => `Tiene protección contra impactos <b>${v}</b>.` },

    { test: /potenc|watt|consumo/i, key: "Potencia",
      tpl: (v, specs) => {
        const volt = (specs["Tensión"] || "").trim();
        return volt
          ? `La potencia es de <b>${v}</b>, con alimentación <b>${volt}</b>.`
          : `La potencia es de <b>${v}</b>.`;
      } },

    { test: /tensi[oó]n|voltaje|alimentaci[oó]n|220v|12v|24v/i, key: "Tensión",
      tpl: (v) => `Funciona con <b>${v}</b>.` },

    { test: /garant[ií]a/i, key: "Garantía",
      tpl: (v) => `La garantía oficial es de <b>${v}</b>.` },

    { test: /lumen|flujo lumin/i, key: "Flujo luminoso",
      tpl: (v) => `El flujo luminoso es de <b>${v}</b>.` },

    { test: /temperatura.*color|kelvin|c[aá]lid[oa]|neutr[oa]|fr[ií]a|\bcct\b/i, key: "Temperatura del color",
      tpl: (v) => `La temperatura de color es <b>${v}</b>.` },

    { test: /\bcri\b|fidelidad de color/i, key: "CRI",
      tpl: (v) => `El CRI es <b>${v}</b>.` },

    { test: /dimeriz|dimmable|regular la intensidad/i, key: "Dimerizable",
      tpl: (v) => isTruthyFlag(v)
        ? `Sí, este modelo es <b>dimerizable</b>.`
        : `No, este modelo no es dimerizable.` },

    { test: /[aá]ngulo|apertura del haz/i, key: "Ángulo de apertura",
      tpl: (v) => `El ángulo de apertura es de <b>${v}</b>.` },

    { test: /material|de qu[eé] est[aá] hecho|cuerpo/i, key: "Material del cuerpo",
      tpl: (v) => `El cuerpo es de <b>${v}</b>.` },

    { test: /dimension|medida|tama[ñn]o|mide/i, key: "Dimensiones",
      tpl: (v) => `Las dimensiones son <b>${v}</b>.` },

    { test: /\bpeso\b|cu[aá]nto pesa/i, key: "Peso",
      tpl: (v) => `El peso es <b>${v}</b>.` },

    { test: /\bsmart\b|app|control por celular/i, key: "Smart",
      tpl: (v) => isTruthyFlag(v)
        ? `Sí, tiene función <b>Smart</b> (control por app).`
        : `No tiene función Smart.` },

    { test: /control remoto|viene con remoto/i, key: "Control remoto",
      tpl: () => `Sí, este modelo incluye <b>control remoto</b>.` },

    { test: /panel t[aá]ctil|t[aá]ctil/i, key: "Panel táctil",
      tpl: () => `Sí, cuenta con <b>panel táctil</b>.` },

    { test: /vida [uú]til|horas de vida|cu[aá]nto dura el led/i, key: "Vida útil",
      tpl: (v) => `La vida útil estimada es de <b>${v}</b>.` },

    { test: /cantidad de luces|cu[aá]ntas luces/i, key: "Cantidad de luces",
      tpl: (v) => `Tiene <b>${v}</b>.` },

    /* —— Casos especiales (no son un spec directo) —— */
    { test: /ficha t[eé]cnica|\bpdf\b|descargar la ficha|datasheet/i, special: "ficha" },
    { test: /manual|instalaci[oó]n|c[oó]mo se instala|montaje/i, special: "manual" },
    { test: /\bsku\b|c[oó]digo de producto|referencia/i, special: "sku" },
    { test: /\bean\b|c[oó]digo de barras/i, special: "ean" },
    { test: /precio|costo|cu[aá]nto sale|cu[aá]nto cuesta|vale/i, special: "precio" },
    { test: /\bstock\b|\bdisponibilidad\b|\bdisponibles?\b|\bqueda(n)? (alguno|unidades|stock)\b/i, special: "stock" },
    { test: /colore?s?\b|variante|viene en otro color/i, special: "variantes" },
    { test: /compatible|se puede usar con|anda con/i, special: "compatible" },
    { test: /qu[eé] (tipo de )?protecci[oó]n (tiene|posee|ofrece)|nivel de protecci[oó]n/i, special: "proteccion" },
  ];

  function specialAnswer(kind, question) {
    const ctx = window.__mlProductCtx || PRODUCT_CTX;
    switch (kind) {
      case "ficha":
        return ctx.ficha
          ? `Podés descargar la <a href="${ctx.ficha}" target="_blank" rel="noopener">ficha técnica (PDF)</a> desde esta misma página.`
          : null;
      case "manual":
        return ctx.manual
          ? `Acá tenés el <a href="${ctx.manual}" target="_blank" rel="noopener">manual / guía de instalación</a>.`
          : null;
      case "sku":
        return ctx.sku ? `El SKU de este producto es <b>${ctx.sku}</b>.` : null;
      case "ean":
        return ctx.ean13 ? `El código EAN-13 es <b>${ctx.ean13}</b>.` : null;
      case "precio":
      case "stock":
        return `Para precio y disponibilidad te recomiendo escribirnos desde <a href="${CONTACTO_URL}" target="_blank" rel="noopener">nuestro formulario de contacto</a>, así te asesoran con el dato actualizado.`;
      case "variantes": {
        // Antes agarraba TODOS los .variant-chip de la página sin filtrar,
        // así que si el producto tenía variantes de Color Y de Temperatura
        // las mezclaba en una sola lista (ej: "Azul, 2200K, 2700K..."). Ahora
        // apuntamos al grupo de variante correcto según lo que preguntaron.
        const groups = Array.from(document.querySelectorAll(".variant-group"));
        if (!groups.length) return null;

        const wantsColor = /color/i.test(question);
        let target = groups[0];
        if (wantsColor) {
          const colorGroup = groups.find((g) => /color/i.test(g.querySelector(".variant-label")?.textContent || ""));
          if (colorGroup) target = colorGroup;
        }

        const chips = target.querySelectorAll(".variant-chip");
        if (!chips.length) return null;
        const valores = Array.from(chips).map((c) => c.textContent.trim());
        const labelText = (target.querySelector(".variant-label")?.textContent || "Variante").trim();
        return `Este modelo tiene estas opciones de ${labelText.toLowerCase()} disponibles: <b>${valores.join(", ")}</b>. Podés cambiarlas arriba, en la ficha.`;
      }
      case "compatible":
        return null; // sin dato local confiable -> que lo resuelva la Capa 2
      case "proteccion": {
        // Pregunta genérica ("¿qué protección tiene?"): combina IP e IK si
        // el producto tiene los dos cargados, no solo uno. Las preguntas
        // puntuales ("¿es IP44?" / "¿resiste golpes?") siguen matcheando
        // las reglas de arriba y responden solo lo que preguntaron.
        const ip = (ctx.specs["Protección IP"] || "").trim();
        const ik = (ctx.specs["Protección IK"] || "").trim();
        const partes = [];
        if (hasSpecValue(ip)) {
          const meaning = IP_MEANINGS[normKey(ip).replace(/\s+/g, "")];
          partes.push(`protección <b>${ip}</b>${meaning ? ` (${meaning})` : ""}`);
        }
        if (hasSpecValue(ik)) partes.push(`protección contra impactos <b>${ik}</b>`);
        if (!partes.length) return null;
        return `Este producto tiene ${partes.join(" y ")}.`;
      }
      default:
        return null;
    }
  }

  /* —— "No aplica para este tipo de producto" ——
     Antes de rendirnos con genericSpecMatch, chequeamos si la pregunta
     apunta a una CATEGORÍA completa de specs (eléctricas, lumínicas,
     conectividad) que este producto ni siquiera tiene cargada — típico
     de accesorios (artefactos para lámparas, portalámparas) o sensores,
     que no tienen ficha eléctrica/lumínica propia. En ese caso avisamos
     que no aplica, en vez de sonar como que nos falta el dato.
     Se apoya en SPEC_GROUPS, que ya define esas categorías más arriba. */
  const GROUP_INTENT_TESTS = [
    { test: /el[eé]ctric|voltaje|tensi[oó]n|potenc|watt|amper|driver|corriente|frecuencia\b/i,
      groupTitle: "Características eléctricas" },
    { test: /lumin|lumen|\bluz\b|kelvin|\bcri\b|\bled\b|apertura|[aá]ngulo|vida [uú]til/i,
      groupTitle: "Características lumínicas" },
    { test: /conectividad|wifi|wi-fi|bluetooth|zigbee|\brf\b|\bapp\b|\bsmart\b|asistente de voz/i,
      groupTitle: "Características de conectividad" },
  ];

  function groupHasAnyValue(groupTitle, specs) {
    const group = SPEC_GROUPS.find((g) => g.title === groupTitle);
    if (!group) return true; // si no reconocemos el grupo, no bloqueamos la respuesta
    return group.rows.some((row) => hasSpecValue(lookupSpec(specs, row.key)));
  }

  function categoryFallback(question, specs) {
    for (const g of GROUP_INTENT_TESTS) {
      if (!g.test.test(question)) continue;
      if (groupHasAnyValue(g.groupTitle, specs)) continue; // sí tiene datos de esa categoría, no es esto
      return noDataFallbackMsg();
    }
    return null;
  }

  /* —— Búsqueda genérica sobre TODOS los specs cargados en la ficha ——
     Cuando ninguna regla curada matchea (o matchea pero no hay dato),
     probamos encontrar el spec correcto por superposición de palabras
     clave, en vez de rendirnos directo a "no tengo esa info". */
  const SPEC_STOPWORDS = new Set([
    "el", "la", "los", "las", "de", "del", "que", "es", "son", "tiene",
    "tienen", "cual", "cuales", "como", "con", "para", "por", "este",
    "esta", "estos", "estas", "producto", "modelo", "me", "podes", "podés",
    "decime", "dato", "datos", "info", "informacion", "información", "un",
    "una", "unos", "unas", "y", "o", "en", "se", "puede", "pueden", "sabes",
    "sabés", "vos", "cuánto", "cuanto", "cuánta", "cuanta", "qué", "que",
    /* Conectores que aparecen en decenas de nombres de spec ("Tipo de X",
       "Color de X") y por sí solos no distinguen nada — si los dejamos,
       cualquier pregunta con "tipo" matchea el primer spec que empiece
       con "Tipo de ...", aunque no tenga relación real con la pregunta. */
    "tipo", "tipos", "usa", "usan", "usás", "usas", "utiliza", "utilizan",
    "viene", "vienen", "trae", "incluye", "incluyen",
  ]);

  function normalizeForSearch(s) {
    return normKey(s).replace(/[^a-z0-9\s]/g, " ").trim();
  }

  /* Misma limpieza para la pregunta Y para el nombre del spec, así "tipo"
     o "de" no cuentan como coincidencia real en ninguno de los dos lados. */
  function meaningfulTokens(s) {
    return normalizeForSearch(s)
      .split(/\s+/)
      .filter((t) => t.length > 2 && !SPEC_STOPWORDS.has(t));
  }

  function questionTokens(q) {
    return meaningfulTokens(q);
  }

  function genericSpecMatch(question) {
    const ctx = window.__mlProductCtx || PRODUCT_CTX;
    const specs = ctx.specs || {};
    const qTokens = questionTokens(question);
    if (!qTokens.length) return null;

    let best = null;
    let bestScore = 0;

    Object.keys(specs).forEach((key) => {
      const val = (specs[key] || "").trim();
      if (!hasSpecValue(val)) return;
      const keyTokens = meaningfulTokens(key);
      if (!keyTokens.length) return; // la key quedó vacía tras sacar conectores -> no comparable
      let score = 0;
      qTokens.forEach((qt) => {
        if (keyTokens.some((kt) => kt === qt || kt.startsWith(qt) || qt.startsWith(kt))) score++;
      });
      if (score > bestScore) {
        bestScore = score;
        best = { key, val };
      }
    });

    return best ? `<b>${best.key}</b>: ${best.val}.` : null;
  }

  /**
   * Intenta responder SOLO con datos locales. Devuelve HTML de respuesta,
   * o null si no encontramos nada (ni en las reglas curadas ni en la
   * búsqueda genérica), así el flujo principal sabe que tiene que ir a
   * la Capa 2.
   */
  function localAnswer(question) {
    const ctx = window.__mlProductCtx || PRODUCT_CTX;
    const specs = ctx.specs || {};

    for (const regla of REGLAS_LOCALES) {
      if (!regla.test.test(question)) continue;

      if (regla.special) {
        const resp = specialAnswer(regla.special, question);
        if (resp) return resp;
        continue; // esta regla matcheó pero no hay dato -> seguir probando otras
      }

      const val = (specs[regla.key] || "").trim();
      if (hasSpecValue(val)) return regla.tpl(val, specs);
      // matcheó la intención pero no hay dato cargado para este SKU -> seguir
    }

    // Antes de rendirnos: ¿la pregunta apunta a una categoría entera
    // (eléctricas / lumínicas / conectividad) que este producto no tiene?
    const categoria = categoryFallback(question, specs);
    if (categoria) return categoria;

    // Ninguna regla curada respondió: buscamos en TODOS los specs de la
    // ficha antes de rendirnos y pasar a la Capa 2.
    return genericSpecMatch(question);
  }

  /* —— Capa 2: agente con IA sobre el catálogo completo (n8n) —— */
  const N8N_WEBHOOK_URL = "https://n8n.coresagroup.com/webhook/macroled-ia";
  const AI_TIMEOUT_MS = 12000;

  /**
   * Se usa SOLO cuando la Capa 2 no pudo responder por un problema técnico
   * (timeout, red caída, webhook no disponible todavía) — no es un "no sé
   * la respuesta". Por eso invita a revisar la ficha técnica en vez de
   * mandar directo a contacto: ese salto a contacto queda reservado para
   * precio/stock, o para lo que el propio agente de la Capa 2 decida
   * cuando esté conectado de verdad.
   */
  function noDataFallbackMsg() {
    const ctx = window.__mlProductCtx || PRODUCT_CTX;
    if (ctx.ficha) {
      return `No pude encontrar información sobre esa característica para este producto. Te recomendamos revisar la <a href="${ctx.ficha}" target="_blank" rel="noopener">ficha técnica (PDF)</a>, donde puede estar especificada con mayor detalle.`;
    }
    return `No pude encontrar información sobre esa característica para este producto.`;
  }

  async function askAI(question) {
    const ctx = window.__mlProductCtx || PRODUCT_CTX;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

    try {
      const res = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          pregunta: question,
          sku: ctx.sku || "",
          nombre: ctx.name || "",
          macrofamilia: ctx.macro || "",
          familia: ctx.family || "",
        }),
      });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      // El n8n "Respond to Webhook" a veces envuelve el resultado en un
      // array de 1 item ([{ respuesta: "..." }]) y a veces manda el
      // objeto suelto ({ respuesta: "..." }) — aceptamos las dos formas.
      const item = Array.isArray(data) ? data[0] : data;
      const texto = item && (item.respuesta || item.output || item.answer);
      if (!texto) throw new Error("Respuesta vacía del agente");

      // El \n del agente -> <br> para que se vea bien en el chat
      return String(texto).replace(/\n/g, "<br>");
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn("[asistente] error consultando IA:", err);
      return noDataFallbackMsg();
    }
  }

  /* —— Sugerencias dinámicas ——
     Antes eran 4 fijas para todos los productos (autonomía, IP44, ficha,
     potencia), así que en un producto sin batería o sin datos eléctricos
     sugerían preguntas que no tenían respuesta. Ahora se arman según los
     specs que el producto actual realmente tiene cargados. */
  const SUGGESTION_CANDIDATES = [
    { key: "Autonomía", q: "¿Cuál es la autonomía?" },
    { key: "Potencia", q: "¿Qué potencia tiene?" },
    { key: "Tensión", q: "¿Con qué tensión funciona?" },
    { key: "Flujo luminoso", q: "¿Cuántos lúmenes tiene?" },
    { key: "Temperatura del color", q: "¿Qué temperatura de color tiene?" },
    { key: "Dimerizable", q: "¿Es dimerizable?" },
    { key: "Tiempo de carga", q: "¿Cuánto tarda en cargar?" },
    { key: "Ángulo de apertura", q: "¿Cuál es el ángulo de apertura?" },
    { key: "Material del cuerpo", q: "¿De qué material es?" },
    { key: "Garantía", q: "¿Cuánto dura la garantía?" },
  ];

  const UNIVERSAL_SUGGESTIONS = [
    "¿Dónde bajo la ficha técnica?",
    "¿En qué colores viene?",
  ];

  function buildSuggestions() {
    const ctx = window.__mlProductCtx || PRODUCT_CTX;
    const specs = ctx.specs || {};
    const picks = [];

    // La protección (IP/IK) va primero y como pregunta genérica, no atada
    // a un código puntual como "IP44" (que puede no aplicar a otro SKU).
    if (hasSpecValue(specs["Protección IP"]) || hasSpecValue(specs["Protección IK"])) {
      picks.push("¿Qué protección tiene?");
    }

    SUGGESTION_CANDIDATES.forEach((c) => {
      if (picks.length >= 4) return;
      if (hasSpecValue(specs[c.key])) picks.push(c.q);
    });

    let i = 0;
    while (picks.length < 4 && i < UNIVERSAL_SUGGESTIONS.length) {
      if (picks.indexOf(UNIVERSAL_SUGGESTIONS[i]) === -1) picks.push(UNIVERSAL_SUGGESTIONS[i]);
      i++;
    }

    return picks.slice(0, 4);
  }

  const aiPanel = document.getElementById("aiPanel");
  const aiBackdrop = document.getElementById("aiBackdrop");
  const aiMessages = document.getElementById("aiMessages");
  const aiTyping = document.getElementById("aiTyping");
  const aiSuggestions = document.getElementById("aiSuggestions");
  const aiForm = document.getElementById("aiForm");
  const aiInput = document.getElementById("aiInput");
  let aiBusy = false;
  let aiLastTrigger = null;

  function openAssistant(trigger) {
    aiLastTrigger = trigger || document.activeElement;
    aiPanel.hidden = false;
    aiBackdrop.hidden = false;
    requestAnimationFrame(() => {
      aiPanel.classList.add("is-open");
      aiBackdrop.classList.add("is-open");
    });
    document.body.classList.add("assistant-open");
    aiInput.focus();
  }
  function closeAssistant() {
    aiPanel.classList.remove("is-open");
    aiBackdrop.classList.remove("is-open");
    document.body.classList.remove("assistant-open");
    setTimeout(() => {
      aiPanel.hidden = true;
      aiBackdrop.hidden = true;
      if (aiLastTrigger && typeof aiLastTrigger.focus === "function") aiLastTrigger.focus();
    }, 280);
  }

  document.getElementById("aiLaunch").addEventListener("click", (e) => openAssistant(e.currentTarget));
  document.getElementById("openAssistantFromCta").addEventListener("click", (e) => openAssistant(e.currentTarget));
  document.getElementById("aiClose").addEventListener("click", closeAssistant);
  aiBackdrop.addEventListener("click", closeAssistant);

  function addMsg(role, html) {
    const el = document.createElement("div");
    el.className = `ai-msg ${role}`;
    el.innerHTML = `<div class="ai-bubble">${html}</div>`;
    aiMessages.appendChild(el);
    aiMessages.scrollTop = aiMessages.scrollHeight;
  }

  function renderSuggestions() {
    aiSuggestions.innerHTML = buildSuggestions().map(
      (s) => `<button type="button" class="ai-chip">${s}</button>`
    ).join("");
  }

  /**
   * Flujo principal: Capa 1 (reglas locales, gratis e instantánea) primero;
   * si no hay dato local para lo que preguntaron, recién ahí se llama a la
   * Capa 2 (agente con IA sobre el catálogo completo).
   */
  async function ask(question) {
    const q = question.trim();
    if (!q || aiBusy) return;
    aiBusy = true;
    aiSuggestions.innerHTML = "";
    addMsg("user", q.replace(/</g, "&lt;"));
    aiTyping.classList.add("is-on");
    aiForm.querySelector(".ai-send").disabled = true;

    let respuesta = localAnswer(q);

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

  aiSuggestions.addEventListener("click", (e) => {
    const chip = e.target.closest(".ai-chip");
    if (chip) ask(chip.textContent);
  });
  aiForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = aiInput.value;
    aiInput.value = "";
    ask(q);
  });

  addMsg("bot", `Hola. Soy el asistente de <b>${PRODUCT_CTX.name}</b>. Preguntame por specs, IP o descargas.`);
  renderSuggestions();

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && aiPanel.classList.contains("is-open")) closeAssistant();
  });

  /* —— Share —— */
  const shareBtn = document.getElementById("shareBtn");
  const shareMenu = document.getElementById("shareMenu");
  const shareToast = document.getElementById("shareToast");
  const shareNativeOpt = document.getElementById("shareNativeOpt");
  const canNativeShare = typeof navigator.share === "function";

  function sharePayload() {
    const sku = (document.getElementById("ficha-sku") || {}).textContent || "SPACE-B";
    const title = document.querySelector(".info h1")?.textContent?.trim() || "Producto Macroled";
    const url = location.href.split("#")[0];
    const text = `${title} (${sku.trim()}) — Macroled`;
    return { title, text, url };
  }

  function setShareLinks() {
    const { title, text, url } = sharePayload();
    shareMenu.querySelector('[data-share="whatsapp"]').href = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
    shareMenu.querySelector('[data-share="linkedin"]').href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    shareMenu.querySelector('[data-share="email"]').href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`;
  }

  function openShareMenu() {
    setShareLinks();
    if (canNativeShare) shareNativeOpt.hidden = false;
    shareMenu.hidden = false;
    shareBtn.setAttribute("aria-expanded", "true");
  }
  function closeShareMenu() {
    shareMenu.hidden = true;
    shareBtn.setAttribute("aria-expanded", "false");
  }

  function showShareToast(msg) {
    shareToast.textContent = msg;
    shareToast.classList.add("is-on");
    clearTimeout(showShareToast._t);
    showShareToast._t = setTimeout(() => shareToast.classList.remove("is-on"), 2200);
  }

  async function copyShareLink() {
    const { url } = sharePayload();
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    showShareToast("Link copiado");
  }

  async function nativeShare() {
    const p = sharePayload();
    try {
      await navigator.share({ title: p.title, text: p.text, url: p.url });
    } catch (err) {
      if (err && err.name !== "AbortError") copyShareLink();
    }
  }

  shareBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (shareMenu.hidden) openShareMenu();
    else closeShareMenu();
  });
  shareMenu.addEventListener("click", async (e) => {
    const opt = e.target.closest("[data-share]");
    if (!opt) return;
    const type = opt.getAttribute("data-share");
    if (type === "copy") {
      e.preventDefault();
      await copyShareLink();
      closeShareMenu();
    } else if (type === "native") {
      e.preventDefault();
      closeShareMenu();
      await nativeShare();
    } else {
      closeShareMenu();
    }
  });
  document.addEventListener("click", (e) => {
    if (!shareMenu.hidden && !e.target.closest(".share-wrap")) closeShareMenu();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !shareMenu.hidden) closeShareMenu();
  });

  /* Scroll / entrance reveals */
  function initReveals() {
    const nodes = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
    if (!nodes.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach((el) => el.classList.add("is-in"));
      return;
    }
    if (!("IntersectionObserver" in window)) {
      nodes.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    nodes.forEach((el) => io.observe(el));
  }

  /**
   * En Webflow el Custom Code a veces corre ANTES del Embed CMS.
   * Esperamos a que exista .cms-product-item (o al DOM listo) y reintentamos.
   */
  /**
   * La Collection List de variantes puede montarse después del embed del héroe,
   * así que seguimos mirando si aparecen más .cms-product-item.
   */
  function watchForLateVariants() {
    let lastCount = document.querySelectorAll(".cms-product-item").length;
    let checks = 0;
    const tick = () => {
      if (userPickedVariant) return;
      const count = document.querySelectorAll(".cms-product-item").length;
      if (count !== lastCount) {
        lastCount = count;
        initVariants();
      }
      checks += 1;
      if (checks < 50) setTimeout(tick, 200); /* ~10s */
    };
    setTimeout(tick, 200);
  }

  function bootFicha() {
    initVariants();
    watchForLateVariants();
    initReveals();
  }

  function waitForCmsAndBoot() {
    let tries = 0;
    const maxTries = 40; /* ~4s */
    const tick = () => {
      const hasCms = !!document.querySelector(".cms-product-item");
      if (hasCms || tries >= maxTries) {
        bootFicha();
        return;
      }
      tries += 1;
      setTimeout(tick, 100);
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", tick);
    } else {
      tick();
    }
  }

  waitForCmsAndBoot();
})();