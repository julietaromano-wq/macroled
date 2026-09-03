/* Anclaje global de la barra comparativa para embeds dentro de Webflow. */
(function () {
  "use strict";

  function initCompareBarAnchor() {
    var bar = document.getElementById("compareBar");
    if (!bar || bar.dataset.compareAnchorBound === "1") return;
    bar.dataset.compareAnchorBound = "1";

    // El cálculo de posición lo centraliza floating-ui.js para que barra y pill
    // usen exactamente el mismo límite. Este archivo conserva el portal a body.
    if (bar.parentElement !== document.body) document.body.appendChild(bar);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCompareBarAnchor, { once: true });
  } else {
    initCompareBarAnchor();
  }
})();
