/* Glue del asistente en Home.
   El núcleo vive en ../global/asistente.js — cargar ese script antes. */
(function () {
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

  if (!window.MacroledAssistant) {
    console.warn("[asistente-home] global/asistente.js no cargó — no se inicializa.");
    return;
  }

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
