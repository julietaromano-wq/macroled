(() => {
  "use strict";

  // Misma lógica/barra que index.html, adaptada a la ficha.
  const COMPARE_PAGE_URL = "https://macroled.webflow.io/nuevo-comparativa";
  const COMPARE_MAX = (window.MacroledCompare && window.MacroledCompare.MAX) || 3;
  const ICON_COMPARE = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 3 21 3 21 7"/><line x1="21" y1="3" x2="10" y2="14"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5"/></svg>`;

  // Resguardo idéntico al de index.html si comparar.js no cargó.
  if (!window.MacroledCompare) {
    console.warn(
      "[ficha] comparar.js no cargó. Usando fallback en memoria SIN persistencia entre recargas."
    );
    const _fallbackList = [];
    window.MacroledCompare = {
      MAX: 3,
      getCompareList: () => _fallbackList.slice(),
      addToCompare: (product) => {
        if (!product || !product.sku) return _fallbackList.slice();
        if (_fallbackList.some((p) => p.sku === product.sku))
          return _fallbackList.slice();
        if (_fallbackList.length >= 3) return _fallbackList.slice();
        _fallbackList.push({
          sku: product.sku,
          nombre: product.nombre || "",
          img: product.img || "",
        });
        return _fallbackList.slice();
      },
      removeFromCompare: (sku) => {
        const idx = _fallbackList.findIndex((p) => p.sku === sku);
        if (idx >= 0) _fallbackList.splice(idx, 1);
        return _fallbackList.slice();
      },
      clearCompare: () => {
        _fallbackList.length = 0;
      },
      isInCompare: (sku) => _fallbackList.some((p) => p.sku === sku),
    };
  }

  const cb = document.getElementById("compareCheck");
  const row = document.getElementById("compareRow");
  const msg = document.getElementById("compareMsg");
  const bar = document.getElementById("compareBar");
  if (!cb || !bar) return;

  let compareCollapsed = false;
  let compareBarPrevCount = 0;
  let changeBound = false;

  function showMsg(text) {
    if (!msg) return;
    msg.textContent = text || "";
    msg.classList.toggle("is-visible", !!text);
  }

  function readSku() {
    return (document.getElementById("ficha-sku")?.textContent || "").trim();
  }

  function readProductFromDom() {
    const sku = readSku();
    if (!sku) return null;
    const nombre =
      (document.getElementById("ficha-name")?.textContent || "").trim() || sku;
    const img =
      document.getElementById("stageImg")?.currentSrc ||
      document.getElementById("stageImg")?.src ||
      "";
    return { sku, nombre, img };
  }

  function setCheckboxProduct(product) {
    if (!product) {
      cb.dataset.sku = "";
      cb.dataset.nombre = "";
      cb.dataset.img = "";
      cb.disabled = true;
      return;
    }
    cb.dataset.sku = product.sku;
    cb.dataset.nombre = product.nombre || "";
    cb.dataset.img = product.img || "";
    cb.disabled = false;
  }

  function buildCompareUrl() {
    const label =
      cb.dataset.nombre ||
      (document.getElementById("ficha-name")?.textContent || "").trim() ||
      "ficha de producto";
    return `${COMPARE_PAGE_URL}?from=${encodeURIComponent(
      location.href
    )}&fromLabel=${encodeURIComponent(label)}`;
  }

  function updateComparePadding() {
    if (getComputedStyle(bar).display === "none") {
      document.body.style.paddingBottom = "";
      document.body.style.removeProperty("--compare-bar-offset");
      document.body.classList.remove("has-compare-bar");
      return;
    }
    const offset = bar.offsetHeight + 28;
    document.body.style.paddingBottom = `${offset}px`;
    document.body.style.setProperty("--compare-bar-offset", `${offset}px`);
    document.body.classList.add("has-compare-bar");
  }

  function renderCompareBar() {
    const body = document.getElementById("compareBarBody");
    const countEl = document.getElementById("compareCount");
    const list = window.MacroledCompare.getCompareList();

    if (!list.length) {
      bar.style.display = "none";
      compareBarPrevCount = 0;
      updateComparePadding();
      return;
    }

    if (
      compareBarPrevCount === 0 &&
      window.matchMedia("(max-width:900px)").matches
    ) {
      compareCollapsed = true;
    }
    compareBarPrevCount = list.length;

    bar.style.display = "block";
    bar.classList.toggle("collapsed", compareCollapsed);
    countEl.textContent = list.length;

    const chips = list
      .map(
        (p) => `
      <div class="compare-chip">
        <button type="button" class="compare-chip-remove" data-remove="${p.sku}" aria-label="Quitar">×</button>
        <div class="compare-chip-thumb">${p.img ? `<img src="${p.img}" alt="" loading="lazy">` : ""}</div>
        <div class="compare-chip-info">
          <span class="compare-chip-name">${p.nombre}</span>
          ${p.sku ? `<span class="compare-chip-sku">${p.sku}</span>` : ""}
        </div>
      </div>`
      )
      .join("");

    const emptySlots = Array.from({
      length: Math.max(0, COMPARE_MAX - list.length),
    })
      .map(() => `<div class="compare-slot-empty">+</div>`)
      .join("");

    const ctaDisabled = list.length < 2;
    body.innerHTML = `
      <div class="compare-items">${chips}${emptySlots}</div>
      <a href="${buildCompareUrl()}" class="compare-cta${ctaDisabled ? " disabled" : ""}"
         title="${ctaDisabled ? "Agregá al menos 2 productos para comparar" : ""}">
        ${ICON_COMPARE} Comparar productos
      </a>
    `;

    body.querySelectorAll("[data-remove]").forEach((btn) => {
      btn.addEventListener("click", () => {
        window.MacroledCompare.removeFromCompare(btn.dataset.remove);
        renderCompareBar();
        syncCompareCheckboxes();
      });
    });

    updateComparePadding();
  }

  function syncCompareCheckboxes() {
    const list = window.MacroledCompare.getCompareList();
    const atLimit = list.length >= COMPARE_MAX;
    document.querySelectorAll(".compare-checkbox").forEach((input) => {
      const sku = input.dataset.sku;
      const isSelected = !!sku && list.some((p) => p.sku === sku);
      input.checked = isSelected;
      input.disabled = !sku || (atLimit && !isSelected);
      const label = input.closest(".compare-row");
      if (label) {
        label.title = input.disabled
          ? `Máximo ${COMPARE_MAX} productos para comparar`
          : "";
        label.classList.toggle("row-disabled", input.disabled);
      }
    });
  }

  function wireCompareCheckbox() {
    if (changeBound) return;
    changeBound = true;
    cb.addEventListener("change", () => {
      const { sku, nombre, img } = cb.dataset;
      if (!sku) {
        cb.checked = false;
        return;
      }
      if (cb.checked) {
        const updated = window.MacroledCompare.addToCompare({
          sku,
          nombre,
          img,
        });
        if (!updated.some((p) => p.sku === sku)) {
          cb.checked = false;
          showMsg(`Máximo ${COMPARE_MAX} productos para comparar`);
        } else {
          showMsg("");
        }
      } else {
        window.MacroledCompare.removeFromCompare(sku);
        showMsg("");
      }
      renderCompareBar();
      syncCompareCheckboxes();
    });
  }

  function bindCurrentProduct() {
    const product = readProductFromDom();
    if (!product) {
      setCheckboxProduct(null);
      showMsg("No se encontró el SKU del producto.");
      syncCompareCheckboxes();
      return;
    }
    setCheckboxProduct(product);
    showMsg("");
    wireCompareCheckbox();
    syncCompareCheckboxes();
  }

  function init() {
    bindCurrentProduct();
    renderCompareBar();
    syncCompareCheckboxes();

    document.getElementById("compareBarHeader")?.addEventListener("click", () => {
      compareCollapsed = !compareCollapsed;
      bar.classList.toggle("collapsed", compareCollapsed);
      updateComparePadding();
    });

    window.addEventListener("macroled-compare-changed", () => {
      renderCompareBar();
      syncCompareCheckboxes();
    });
    window.addEventListener("macroled-assistant-toggle", () => {
      requestAnimationFrame(updateComparePadding);
      setTimeout(updateComparePadding, 320);
    });
    window.addEventListener("storage", (e) => {
      if (e.key === "macroled_compare") {
        renderCompareBar();
        syncCompareCheckboxes();
      }
    });

    const skuEl = document.getElementById("ficha-sku");
    if (skuEl) {
      let lastSku = readSku();
      const mo = new MutationObserver(() => {
        const next = readSku();
        if (!next || next === lastSku) return;
        lastSku = next;
        bindCurrentProduct();
      });
      mo.observe(skuEl, {
        characterData: true,
        childList: true,
        subtree: true,
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      requestAnimationFrame(init);
    });
  } else {
    requestAnimationFrame(() => requestAnimationFrame(init));
  }
})();
