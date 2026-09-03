/* Monta los flotantes fuera de los embeds de Webflow y los detiene antes del footer. */
(function () {
  "use strict";

  function initFloatingUi() {
    var launch = document.getElementById("aiLaunch");
    var bar = document.getElementById("compareBar");
    var reference = launch || bar;
    if (!reference || document.documentElement.dataset.floatingUiBound === "1") return;
    document.documentElement.dataset.floatingUiBound = "1";

    var boundary = reference.closest("[data-floating-boundary], [data-compare-boundary], #macroled-productos, main");
    var footer = document.querySelector("[data-floating-footer], footer, .footer_component, .footer-wrapper, .footer");

    [bar, launch, document.getElementById("aiBackdrop"), document.getElementById("aiPanel")].forEach(function (element) {
      if (element && element.parentElement !== document.body) document.body.appendChild(element);
    });

    var frame = 0;
    function updatePosition() {
      frame = 0;
      var stopTop = null;
      if (footer && footer.isConnected) stopTop = footer.getBoundingClientRect().top;
      else if (boundary && boundary.isConnected) stopTop = boundary.getBoundingClientRect().bottom;

      var lift = stopTop === null ? 0 : Math.max(0, window.innerHeight - stopTop);
      if (launch) launch.style.setProperty("--floating-ui-lift", lift + "px");
    }

    function schedulePosition() {
      if (!frame) frame = requestAnimationFrame(updatePosition);
    }

    window.addEventListener("scroll", schedulePosition, { passive: true });
    window.addEventListener("resize", schedulePosition);
    if ("ResizeObserver" in window) {
      var observer = new ResizeObserver(schedulePosition);
      if (boundary) observer.observe(boundary);
      if (footer) observer.observe(footer);
      if (launch) observer.observe(launch);
    }
    schedulePosition();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFloatingUi, { once: true });
  } else {
    initFloatingUi();
  }
})();
