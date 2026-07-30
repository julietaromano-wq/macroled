(function (window) {
  "use strict";

  const config = window.MACROLED_HOME_CONFIG;
  const root = document.getElementById("macroled-home");
  if (!config || !root) return;

  const esc = value => String(value ?? "").replace(/[&<>'"]/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  })[character]);

  const emphasize = (value, term) => {
    const safe = esc(value);
    if (!term) return safe;
    const safeTerm = esc(term);
    return safe.replace(safeTerm, `<strong>${safeTerm}</strong>`);
  };

  const buttonTone = color => {
    const hex = String(color || "").trim().replace(/^#/, "");
    if (!/^[\da-f]{3}$|^[\da-f]{6}$/i.test(hex)) return "dark";
    const normalized = hex.length === 3
      ? hex.split("").map(character => character + character).join("")
      : hex;
    const [red, green, blue] = [0, 2, 4].map(index => parseInt(normalized.slice(index, index + 2), 16));
    const luminance = (red * 0.299 + green * 0.587 + blue * 0.114) / 255;
    return luminance > 0.55 ? "light" : "dark";
  };

  function categoryTemplate(item) {
    const badge = item.badge ? `<span class="ml-category-card__badge">${esc(item.badge)}</span>` : "";
    return `<a class="ml-category-card" href="${esc(item.href)}" data-editorial-id="${esc(item.id)}"><h3>${esc(item.title)}</h3>${badge}<div class="ml-category-card__media"><img src="${esc(item.image)}" alt="" loading="lazy" width="800" height="800"></div></a>`;
  }

  function productControlsTemplate() {
    return `<div class="ml-featured-products__controls ml-product-grid__controls" data-product-controls hidden><div class="ml-featured-products__arrows"><button class="ml-featured-products__nav" type="button" data-featured-prev aria-label="Producto anterior"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m6-6-6 6 6 6"/></svg></button><button class="ml-featured-products__nav" type="button" data-featured-next aria-label="Producto siguiente"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></button></div><div class="ml-featured-products__progress" aria-hidden="true"><span data-featured-progress></span></div></div>`;
  }

  function lineContentTemplate(item) {
    const content = item.content || {};

    if (content.mode === "static") {
      const categories = config.manualCategories?.[content.categoryGroup] || content.items || [];
      return `<div class="ml-line-content ml-line-content--static"><div class="ml-categories ml-line-subfamilies">${categories.map(categoryTemplate).join("")}</div></div>`;
    }

    const query = content.query || item;
    const filters = Array.isArray(query.typesenseFilters) ? JSON.stringify(query.typesenseFilters) : "";
    return `<div class="ml-products-block"><div class="ml-product-grid" data-products-field="${esc(query.typesenseField)}" data-products-value="${esc(query.typesenseValue)}" data-products-filters="${esc(filters)}" data-products-count="${Number(query.productCount || 4)}"><div class="ml-product-state">Cargando productos…</div></div>${productControlsTemplate()}</div>`;
  }

  function lineTemplate(item) {
    const mode = item.content?.mode || "typesense";
    return `<article class="ml-featured ml-shell" data-theme="${esc(item.theme)}" data-visual-theme="${esc(item.visualTheme || "solid")}" data-layout="${esc(item.layout)}" data-image-fit="${esc(item.imageFit || "cover")}" data-description-lines="${Number(item.descriptionLines || 0)}" data-button-tone="${buttonTone(item.textColor)}" data-content-mode="${esc(mode)}" style="--line-bg:${esc(item.theme)};--line-color:${esc(item.textColor)};--title-emphasis-weight:${Number(item.titleEmphasisWeight || 600)}"><div class="ml-featured__story"><div class="ml-featured__media"><img src="${esc(item.image)}" alt="" loading="lazy" width="1600" height="1000"></div><div class="ml-featured__copy"><h3>${emphasize(item.title, item.titleEmphasis)}</h3><p>${emphasize(item.description, item.descriptionEmphasis)}</p><div class="ml-featured__actions"><a class="ml-button ml-button--primary" href="${esc(item.href)}">Ver productos</a><a class="ml-button--tertiary" href="${esc(item.catalogHref || "#")}">Ver catálogo <span aria-hidden="true">→</span></a></div></div></div>${lineContentTemplate(item)}</article>`;
  }

  function renderSections() {
    const container = root.querySelector("[data-home-sections]");
    container.innerHTML = Object.entries(config.tabs).map(([key, data]) => {
      const hasCarousel = data.categories.length > 4;
      const cards = data.categories.map(categoryTemplate).join("");
      const categories = hasCarousel
        ? `<div class="ml-category-carousel ml-shell"><button type="button" class="ml-category-arrow ml-category-arrow--prev" data-category-direction="prev" aria-label="Ver categorías anteriores"><span aria-hidden="true">←</span></button><div class="ml-categories ml-categories--scroll">${cards}</div><button type="button" class="ml-category-arrow ml-category-arrow--next" data-category-direction="next" aria-label="Ver más categorías"><span aria-hidden="true">→</span></button></div>`
        : `<div class="ml-categories ml-shell">${cards}</div>`;
      const subtitle = data.subtitle ? `<p class="ml-panel__subtitle">${esc(data.subtitle)}</p>` : "";
      const cta = data.cta
        ? `<a class="ml-button ml-button--primary ml-panel__cta" href="${esc(data.cta.href)}">${esc(data.cta.label)}</a>`
        : "";
      return `<section class="ml-home-section" data-section="${esc(key)}" aria-label="${esc(data.title)}"><div class="ml-featured-list">${data.featuredLines.map(lineTemplate).join("")}</div></section>`;
    }).join("");
  }

  function placeFeaturedProducts() {
    const featuredProducts = root.querySelector("#productos-destacados");
    const professionalLighting = root.querySelector("[data-project-lines-concept]");
    if (!featuredProducts || !professionalLighting) return;
    professionalLighting.insertAdjacentElement("afterend", featuredProducts);
  }

  function placePrimarySections() {
    const professionalLighting = root.querySelector("[data-project-lines-concept]");
    const categoriesTest = root.querySelector("[data-categories-test]");
    if (!professionalLighting || !categoriesTest) return;
    professionalLighting.insertAdjacentElement("afterend", categoriesTest);
  }

  function renderCategoriesTest() {
    const section = root.querySelector("[data-categories-test]");
    const tabs = section?.querySelector("[data-categories-test-tabs]");
    const grid = section?.querySelector("[data-categories-test-grid]");
    const entries = Object.entries(config.categoriesTest || {});
    if (!section || !tabs || !grid || !entries.length) return;

    grid.id = "ml-categories-test-panel";
    tabs.innerHTML = entries.map(([key, item], index) => `
      <button class="ml-categories-test__tab ml-featured-products__tab${index === 0 ? " is-active" : ""}"
        id="ml-categories-test-tab-${esc(key)}"
        type="button"
        role="tab"
        aria-controls="${grid.id}"
        aria-selected="${index === 0}"
        tabindex="${index === 0 ? "0" : "-1"}"
        data-categories-test-tab="${esc(key)}">${esc(index === 0 ? item.labelActive : item.labelInactive)}</button>
    `).join("");
    const activate = key => {
      const item = config.categoriesTest[key];
      if (!item) return;
      section.dataset.activeCategory = key;
      section.style.setProperty("--categories-test-color", item.color);
      section.style.setProperty("--categories-test-text", item.textColor);
      grid.innerHTML = item.categories.map(categoryTemplate).join("");
      grid.setAttribute("aria-labelledby", `ml-categories-test-tab-${key}`);
      tabs.querySelectorAll("[data-categories-test-tab]").forEach(button => {
        const active = button.dataset.categoriesTestTab === key;
        const buttonConfig = config.categoriesTest[button.dataset.categoriesTestTab];
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-selected", String(active));
        button.tabIndex = active ? 0 : -1;
        button.textContent = active ? buttonConfig.labelActive : buttonConfig.labelInactive;
      });
    };

    tabs.addEventListener("click", event => {
      const button = event.target.closest("[data-categories-test-tab]");
      if (button) activate(button.dataset.categoriesTestTab);
    });
    tabs.addEventListener("keydown", event => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      const buttons = [...tabs.querySelectorAll("[data-categories-test-tab]")];
      const current = buttons.indexOf(document.activeElement);
      if (current < 0) return;
      event.preventDefault();
      const next = event.key === "Home"
        ? 0
        : event.key === "End"
          ? buttons.length - 1
          : (current + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length;
      buttons[next].focus();
      activate(buttons[next].dataset.categoriesTestTab);
    });

    activate(entries[0][0]);
  }

  function initCategoryCarousels() {
    root.querySelectorAll(".ml-category-carousel").forEach(carousel => {
      const track = carousel.querySelector(".ml-categories--scroll");
      carousel.querySelectorAll("[data-category-direction]").forEach(button => button.addEventListener("click", () => {
        const card = track.querySelector(".ml-category-card");
        const gap = parseFloat(getComputedStyle(track).gap) || 0;
        const amount = (card?.getBoundingClientRect().width || track.clientWidth) + gap;
        track.scrollBy({
          left: button.dataset.categoryDirection === "next" ? amount : -amount,
          behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
        });
      }));
    });
  }

  function initLineBackgrounds() {
    root.querySelectorAll(".ml-featured-list").forEach(list => {
      const lines = [...list.querySelectorAll(".ml-featured[data-theme]")];
      if (!lines.length) return;
      const section = list.closest(".ml-home-section");
      let activeBackground = "";
      let activeLayer = null;

      const setBackground = line => {
        const background = !line
          ? "#fff"
          : line.dataset.visualTheme === "silver-dark"
          ? "radial-gradient(circle at 16% 12%, rgba(214, 220, 226, 0.24), transparent 34%), linear-gradient(125deg, #030405 0%, #101318 56%, #3d444b 100%)"
          : line.dataset.theme;
        if (background === activeBackground) return;
        activeBackground = background;
        const previousLayer = activeLayer;
        const layer = document.createElement("div");
        layer.className = "ml-line-theme-layer";
        layer.setAttribute("aria-hidden", "true");
        layer.style.setProperty("--ml-layer-background", background);
        list.prepend(layer);
        activeLayer = layer;
        requestAnimationFrame(() => {
          layer.classList.add("is-visible");
          previousLayer?.classList.remove("is-visible");
        });
        if (previousLayer) {
          const removePrevious = () => previousLayer.remove();
          previousLayer.addEventListener("transitionend", removePrevious, { once: true });
          setTimeout(removePrevious, 2900);
        }
        const theme = line?.dataset.theme || "#fff";
        list.style.setProperty("--ml-panel-theme", theme);
        list.style.setProperty("--ml-panel-background", background);
        section?.style.setProperty("--ml-section-theme", theme);
        section?.style.setProperty("--ml-section-background", background);
      };
      /* Start with Monaco's theme so the categories gradient and the first
         editorial line meet on the exact same surface color. */
      setBackground(lines[0]);

      if (!("IntersectionObserver" in window)) return;
      const sectionObserver = new IntersectionObserver(entries => {
        section?.classList.toggle("is-line-theme-active", entries[0]?.isIntersecting === true);
      }, {
        rootMargin: "-35% 0px -35% 0px",
        threshold: 0
      });
      sectionObserver.observe(list);

      let scrollFrame = 0;
      const updateStoryIntegration = () => {
        scrollFrame = 0;
        const viewportBottom = window.innerHeight || document.documentElement.clientHeight;
        let integratedLine = lines[0];
        lines.forEach(line => {
          const story = line.querySelector(".ml-featured__story");
          if (!story) return;
          const bounds = story.getBoundingClientRect();
          const visibleProgress = Math.min(
            1,
            Math.max(0, (viewportBottom - bounds.top) / Math.max(bounds.height, 1))
          );
          const isIntegrated = visibleProgress >= 0.06;
          line.classList.toggle("is-story-integrated", isIntegrated);
          if (isIntegrated) integratedLine = line;
        });
        setBackground(integratedLine);
      };
      const requestStoryUpdate = () => {
        if (!scrollFrame) scrollFrame = requestAnimationFrame(updateStoryIntegration);
      };
      window.addEventListener("scroll", requestStoryUpdate, { passive: true });
      window.addEventListener("resize", requestStoryUpdate);
      updateStoryIntegration();
    });
  }

  function renderCommon() {
    root.querySelector("[data-news]").innerHTML = config.news.map(item => {
      const tag = item.href ? "a" : "article";
      const href = item.href ? ` href="${esc(item.href)}"` : "";
      const hoverImage = item.hoverImage || item.image;
      const defaultImageClass = item.zoomDefaultImage ? " ml-news-card__image--zoomed" : "";
      return `<${tag} class="ml-news-card"${href}><div class="ml-news-card__media"><img class="ml-news-card__image ml-news-card__image--default${defaultImageClass}" src="${esc(item.image)}" alt="${esc(item.title)}" loading="lazy" width="700" height="560"><img class="ml-news-card__image ml-news-card__image--hover" src="${esc(hoverImage)}" alt="" aria-hidden="true" loading="lazy" width="700" height="560"></div><h3>${esc(item.title)}</h3><p>${esc(item.description)}</p></${tag}>`;
    }).join("");
    root.querySelector("[data-faq]").innerHTML = config.faq.map((item, index) => `<div class="ml-faq__item"><button class="ml-faq__trigger" type="button" aria-expanded="false" aria-controls="ml-faq-answer-${index}"><span>${esc(item.question)}</span><span class="ml-faq__icon" aria-hidden="true">＋</span></button><div class="ml-faq__answer" id="ml-faq-answer-${index}"><div><p>${esc(item.answer)}</p></div></div></div>`).join("");
    root.querySelectorAll(".ml-faq__trigger").forEach(button => button.addEventListener("click", () => {
      button.setAttribute("aria-expanded", String(button.getAttribute("aria-expanded") !== "true"));
    }));
  }

  function handleVideo() {
    const video = root.querySelector(".ml-hero__video");
    if (!video) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.pause();
      video.hidden = true;
      return;
    }
    video.play().catch(() => { video.hidden = true; });
  }

  function animateHeroTitle() {
    const title = root.querySelector("#ml-hero-title");
    if (!title || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const text = title.textContent.trim();
    title.setAttribute("aria-label", text);
    title.textContent = "";
    let letterIndex = 0;
    text.split(/(\s+)/).forEach(part => {
      if (/^\s+$/.test(part)) {
        title.appendChild(document.createTextNode(" "));
        return;
      }

      const word = document.createElement("span");
      word.className = "ml-hero__word";
      word.setAttribute("aria-hidden", "true");
      [...part].forEach(character => {
        const letter = document.createElement("span");
        letter.className = "ml-hero__letter";
        letter.style.setProperty("--letter-delay", `${letterIndex * 28}ms`);
        letter.textContent = character;
        word.appendChild(letter);
        letterIndex += 1;
      });
      title.appendChild(word);
    });
    requestAnimationFrame(() => title.classList.add("is-illuminating"));
  }

  function animateCategoriesTitle() {
    const title = root.querySelector("#ml-categories-test-title");
    if (!title || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const text = title.textContent.trim();
    title.setAttribute("aria-label", text);
    title.textContent = "";
    let letterIndex = 0;
    const letterCount = [...text.replace(/\s/g, "")].length;

    text.split(/(\s+)/).forEach(part => {
      if (/^\s+$/.test(part)) {
        title.appendChild(document.createTextNode(" "));
        return;
      }

      const word = document.createElement("span");
      word.className = "ml-categories-title__word";
      word.setAttribute("aria-hidden", "true");
      [...part].forEach(character => {
        const letter = document.createElement("span");
        letter.className = "ml-categories-title__letter";
        letter.style.setProperty("--letter-delay", `${letterIndex * 24}ms`);
        const progress = letterCount > 1
          ? Math.round((letterIndex / (letterCount - 1)) * 100)
          : 100;
        letter.style.setProperty(
          "--letter-color",
          `color-mix(in srgb, var(--ml-light-blue-500) ${100 - progress}%, var(--ml-dark-blue-700) ${progress}%)`
        );
        letter.textContent = character;
        word.appendChild(letter);
        letterIndex += 1;
      });
      title.appendChild(word);
    });

    const illuminate = () => title.classList.add("is-illuminating");
    if (!("IntersectionObserver" in window)) {
      requestAnimationFrame(illuminate);
      return;
    }

    const observer = new IntersectionObserver(entries => {
      if (!entries[0]?.isIntersecting) return;
      illuminate();
      observer.disconnect();
    }, { threshold: 0.35, rootMargin: "0px 0px -8% 0px" });
    observer.observe(title);
  }

  function initSectionMotion() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const projectSection = root.querySelector("[data-project-lines-concept]");
    const featuredSection = root.querySelector("#productos-destacados");
    const categoriesSection = root.querySelector("[data-categories-test]");
    const foaSection = root.querySelector("[data-foa]");
    const newsletterBanner = root.querySelector(".ml-newsletter-banner");
    const featuredTrack = featuredSection?.querySelector("[data-featured-track]");
    const categoriesGrid = categoriesSection?.querySelector("[data-categories-test-grid]");
    const pendingSections = new Set();
    let motionArmed = false;

    const prepareCards = (container, selector) => {
      if (!container) return;
      [...container.querySelectorAll(selector)].forEach((card, index) => {
        card.style.setProperty("--motion-order", index);
      });
    };

    const reveal = section => {
      prepareCards(
        section,
        section === projectSection
          ? ".ml-project-lines-concept__card"
          : section === featuredSection
            ? ".ml-product-card"
            : section.matches(".ml-featured")
              ? section.dataset.contentMode === "static"
                ? ".ml-category-card"
                : ".ml-product-card"
              : ".ml-category-card"
      );
      clearTimeout(section._motionSettleTimer);
      section.classList.remove("is-motion-settled");
      requestAnimationFrame(() => {
        section.classList.add("is-motion-visible");
        section._motionSettleTimer = setTimeout(() => {
          section.classList.add("is-motion-settled");
        }, 1500);
      });
    };

    const revealPendingSections = () => {
      if (!motionArmed) return;
      pendingSections.forEach(section => reveal(section));
      pendingSections.clear();
    };

    const armMotion = () => {
      if (motionArmed) return;
      motionArmed = true;
      revealPendingSections();
    };

    window.addEventListener("wheel", armMotion, { passive: true, once: true });
    window.addEventListener("touchmove", armMotion, { passive: true, once: true });
    window.addEventListener("keydown", event => {
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) {
        armMotion();
      }
    });

    [projectSection, featuredSection, categoriesSection, foaSection, newsletterBanner].forEach(section => {
      if (!section) return;
      section.classList.add("ml-motion-ready");
      const observer = new IntersectionObserver(entries => {
        if (!entries[0]?.isIntersecting) return;
        if (motionArmed) reveal(section);
        else pendingSections.add(section);
        observer.disconnect();
      }, { threshold: 0.13, rootMargin: "0px 0px -8% 0px" });
      observer.observe(section);
    });

    root.querySelectorAll(".ml-featured[data-content-mode]").forEach(line => {
      const cardSelector = line.dataset.contentMode === "static"
        ? ".ml-category-card"
        : ".ml-product-card";
      const content = line.querySelector(
        line.dataset.contentMode === "static"
          ? ".ml-line-content--static"
          : ".ml-product-grid"
      );
      line.classList.add("ml-content-motion-ready");
      prepareCards(line, cardSelector);

      const observer = new IntersectionObserver(entries => {
        if (!entries[0]?.isIntersecting) return;
        if (motionArmed) reveal(line);
        else pendingSections.add(line);
        observer.disconnect();
      }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
      observer.observe(line);

      if (content) {
        new MutationObserver(() => {
          prepareCards(line, cardSelector);
          if (!line.classList.contains("is-motion-visible")) return;
          line.classList.remove("is-motion-visible");
          requestAnimationFrame(() => requestAnimationFrame(() => line.classList.add("is-motion-visible")));
        }).observe(content, { childList: true });
      }
    });

    const refreshDynamicCards = (section, container, selector) => {
      if (!section || !container) return;
      new MutationObserver(() => {
        prepareCards(container, selector);
        if (!section.classList.contains("is-motion-visible")) return;
        clearTimeout(container._cardsMotionTimer);
        container.classList.remove("is-cards-visible");
        container.classList.add("is-cards-refreshing");
        requestAnimationFrame(() => requestAnimationFrame(() => {
          container.classList.add("is-cards-visible");
          container._cardsMotionTimer = setTimeout(() => {
            container.classList.remove("is-cards-refreshing", "is-cards-visible");
          }, 1000);
        }));
      }).observe(container, { childList: true });
    };

    refreshDynamicCards(featuredSection, featuredTrack, ".ml-product-card");
    refreshDynamicCards(categoriesSection, categoriesGrid, ".ml-category-card");
  }

  renderSections();
  placePrimarySections();
  placeFeaturedProducts();
  renderCategoriesTest();
  initCategoryCarousels();
  initLineBackgrounds();
  renderCommon();
  window.MacroledProducts.init(root);
  window.MacroledFeatured.init(root);
  window.MacroledProjectLinesConcept.init(root);
  handleVideo();
  animateHeroTitle();
  animateCategoriesTitle();
  initSectionMotion();
})(window);
