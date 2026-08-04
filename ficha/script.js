(function () {
  "use strict";

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
        { key: "Color del cuerpo", tip: "Color de la carcasa / cuerpo del producto." },
        { key: "Color de carcasa", tip: "Color exterior de la carcasa." },
        { key: "Panel táctil", tip: "Indica si el producto incluye panel táctil de control." },
        { key: "Largo del cable", tip: "Longitud del cable incluido." },
        { key: "Dimensiones del cable", tip: "Sección o medidas del cable incluido." },
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
        { key: "Frecuencia de operación", tip: "Frecuencia de radio o red en la que opera." },
        { key: "Chip", tip: "Chipset de conectividad integrado." },
        { key: "Tipo de red", tip: "Tipo de red compatible (2.4 GHz, Zigbee, etc.)." },
        { key: "Sistemas operativos soportados", tip: "SO móviles o de escritorio compatibles con la app." },
        { key: "Distancia de alcance RF en exterior", tip: "Alcance de radiofrecuencia en exteriores." },
        { key: "Distancia de alcance RF en interior", tip: "Alcance de radiofrecuencia en interiores." },
        { key: "Compatible con asistentes", tip: "Asistentes de voz o ecosistemas compatibles." },
        { key: "Funciones", tip: "Funciones inteligentes o de control disponibles." },
        { key: "APP", tip: "Aplicación móvil asociada al producto." },
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
      const val = lookupSpec(specs, key);
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
  const ALLOWED_DIM_KEYS = [
    "Color del cuerpo",
    "Ángulo de apertura",
    "Tipo de luz",
    "Protección IP",
    "Potencia",
    "Temperatura del color",
  ];
  const DIM_ALIASES = {
    Ángulo: "Ángulo de apertura",
    Color: "Color del cuerpo",
    Temperatura: "Tipo de luz",
    Luz: "Tipo de luz",
    Potencia: "Potencia",
    IP: "Protección IP",
  };
  const COLOR_SWATCH = {
    Blanco: "#f4f4f4",
    Negro: "#1a1a1a",
    Rojo: "#c62828",
    Verde: "#2e7d32",
    Bronce: "#b08d57",
    Cobre: "#b87333",
  };

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
      const rawJson = el.getAttribute("data-specs");
      if (rawJson) {
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
    const colorOrder = ["Blanco", "Negro", "Rojo", "Verde", "Bronce", "Cobre"];
    const ia = colorOrder.indexOf(a);
    const ib = colorOrder.indexOf(b);
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

  function collectSiblings(current) {
    const currentSku = (current.getAttribute("data-sku") || "").trim();
    let allItems = Array.prototype.slice.call(document.querySelectorAll(".cms-product-item"));
    const seenSku = new Set();
    allItems = allItems.filter((el) => {
      const sku = (el.getAttribute("data-sku") || "").trim();
      if (!sku || seenSku.has(sku)) return false;
      seenSku.add(sku);
      return true;
    });

    const selfVariantesSku = parseList(current.getAttribute("data-variantes-sku"));
    const siblingSkuSet = new Set(selfVariantesSku);
    siblingSkuSet.add(currentSku);
    allItems.forEach((el) => {
      const sku = (el.getAttribute("data-sku") || "").trim();
      const vs = parseList(el.getAttribute("data-variantes-sku"));
      if (vs.indexOf(currentSku) !== -1) siblingSkuSet.add(sku);
    });

    return allItems.filter((el) => siblingSkuSet.has((el.getAttribute("data-sku") || "").trim()));
  }

  function resolveDimensions(current, sibs) {
    const declaredDimRaw = (current.getAttribute("data-nombre-attr-variantes") || "").trim();
    const declaredDim = DIM_ALIASES[declaredDimRaw] || declaredDimRaw;
    const keys = [];
    ALLOWED_DIM_KEYS.forEach((key) => {
      const values = new Set(sibs.map((el) => (parseSpecs(el)[key] || "").trim()));
      values.delete("");
      if (values.size > 1) keys.push(key);
    });
    if (declaredDim && ALLOWED_DIM_KEYS.indexOf(declaredDim) !== -1 && keys.indexOf(declaredDim) === -1) {
      keys.unshift(declaredDim);
    }
    keys.sort((a, b) => (a === declaredDim ? -1 : b === declaredDim ? 1 : 0));
    return keys;
  }

  function buildChipsHtml() {
    if (!variantsTarget || !heroItem) return "";
    const currentSpecs = parseSpecs(heroItem);
    let html = "";
    dimensionKeys.forEach((key) => {
      const values = [
        ...new Set(
          siblings
            .map((el) => (parseSpecs(el)[key] || "").trim())
            .filter(Boolean)
        ),
      ].sort(variantSort);
      if (values.length <= 1) return;

      const curVal = (currentSpecs[key] || "").trim();
      const groupName = "variant-" + slugify(key);
      const label = key === "Color del cuerpo" ? "Color" : key;
      html += `<div class="variant-group"><span class="variant-label">${escapeHtml(label)}</span><div class="variant-chips" role="radiogroup" aria-label="${escapeHtml(label)}">`;
      values.forEach((v) => {
        const isActive = v === curVal;
        const inputId = groupName + "--" + slugify(v);
        const swatch = COLOR_SWATCH[v]
          ? `<span class="variant-swatch" style="background:${COLOR_SWATCH[v]}" aria-hidden="true"></span>`
          : "";
        html +=
          `<label for="${inputId}" class="variant-chip${isActive ? " active" : ""}">` +
          `<input type="radio" class="variant-chip-radio" id="${inputId}" name="${groupName}"` +
          ` data-dim="${escapeHtml(key)}" data-val="${escapeHtml(v)}"` +
          (isActive ? " checked" : "") +
          `>` +
          swatch +
          escapeHtml(v) +
          `</label>`;
      });
      html += "</div></div>";
    });
    variantsTarget.hidden = !html;
    variantsTarget.style.display = html ? "flex" : "none";
    return html;
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

  function initVariants() {
    if (!variantsTarget) return;

    const initialSku = (document.getElementById("ficha-sku")?.textContent || "").trim();
    const all = Array.prototype.slice.call(document.querySelectorAll(".cms-product-item"));
    heroItem =
      all.find((el) => (el.getAttribute("data-sku") || "").trim() === initialSku) ||
      all[0] ||
      null;
    if (!heroItem) {
      variantsTarget.hidden = true;
      return;
    }

    siblings = collectSiblings(heroItem);
    siblings.forEach((el) => {
      parseList(el.getAttribute("data-multiimage")).forEach((src) => {
        if (!src) return;
        const img = new Image();
        img.src = src;
      });
    });

    dimensionKeys = resolveDimensions(heroItem, siblings);

    if (siblings.length <= 1) {
      variantsTarget.hidden = true;
      applyProduct(heroItem, { skipHistory: true });
      return;
    }

    applyProduct(heroItem, { skipHistory: true });

    variantsTarget.addEventListener("change", (e) => {
      const input = e.target;
      if (!input.classList || !input.classList.contains("variant-chip-radio")) return;
      const match = findBestMatch(input.getAttribute("data-dim"), input.getAttribute("data-val"));
      if (match) applyProduct(match);
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

  /* —— AI assistant (demo) —— */
  const PRODUCT_CTX = (window.__mlProductCtx = {
    name: "Space Blanca",
    sku: "SPACE-B",
    voltage: "DC 5V",
    power: "1.6W",
    warranty: "1 año",
    ficha: "https://s3.coresagroup.com/MACROLED/DS/SPACE-B.pdf",
    manual: "https://s3.coresagroup.com/MACROLED/Garantias/SPACE-B.pdf",
    compatible: ["Tower", "Umbrella", "Bell", "Fungus"],
  });

  const SUGGESTIONS = [
    "¿Cuál es la autonomía?",
    "¿Es IP44?",
    "¿Dónde bajo la ficha técnica?",
    "¿Qué potencia tiene?",
  ];

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

  function mockAnswer(q) {
    const t = q.toLowerCase();
    const ctx = window.__mlProductCtx || PRODUCT_CTX;
    if (/autonom|bater|hs|hora/.test(t)) {
      return `La autonomía máxima de <b>${ctx.name}</b> es de <b>8hs</b> (según uso). Carga por USB-C en aprox. 4hs.`;
    }
    if (/ip|agua|exterior/.test(t)) {
      return `Sí. Este modelo tiene <b>IP44</b>: resistente a salpicaduras, apto uso en exteriores protegidos.`;
    }
    if (/ficha|pdf|manual|descarg/.test(t)) {
      return `Podés descargar la <a href="${ctx.ficha}" target="_blank" rel="noopener">ficha técnica (PDF)</a> desde esta misma página.`;
    }
    if (/potenc|watt|1\.6/.test(t)) {
      return `La potencia es <b>${ctx.power}</b>, alimentación ${ctx.voltage}.`;
    }
    if (/garanti/.test(t)) {
      return `La garantía oficial es de <b>${ctx.warranty}</b>.`;
    }
    if (/color|variante|rojo|verde|negro|blanco/.test(t)) {
      return `Space viene en 4 colores de cuerpo: Blanco, Negro, Rojo y Verde. Cambiá el chip de Color arriba para ver cada SKU.`;
    }
    return `Sobre <b>${ctx.sku}</b> puedo ayudarte con autonomía, IP, potencia o descargas. Probá una de las sugerencias.<br><br><span style="color:#6a7380;font-size:12px">Demo local: sin API todavía.</span>`;
  }

  function renderSuggestions() {
    aiSuggestions.innerHTML = SUGGESTIONS.map(
      (s) => `<button type="button" class="ai-chip">${s}</button>`
    ).join("");
  }

  async function ask(question) {
    const q = question.trim();
    if (!q || aiBusy) return;
    aiBusy = true;
    aiSuggestions.innerHTML = "";
    addMsg("user", q.replace(/</g, "&lt;"));
    aiTyping.classList.add("is-on");
    aiForm.querySelector(".ai-send").disabled = true;
    await new Promise((r) => setTimeout(r, 550 + Math.random() * 400));
    aiTyping.classList.remove("is-on");
    addMsg("bot", mockAnswer(q));
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

  initVariants();

  /* Scroll / entrance reveals */
  (function initReveals() {
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
  })();
})();
