(function (window) {
  "use strict";

  const initializedRoots = new WeakSet();

  function initializeHome() {
    const config = window.MACROLED_HOME_CONFIG;
    const root = document.getElementById("macroled-home");
    if (!config || !root || initializedRoots.has(root)) return false;

    initializedRoots.add(root);
    bootHome(root, config);
    return true;
  }

  function bootHome(root, config) {

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
    const badge = item.badge ? `<span class="ml-highlight-badge ml-category-card__badge">${esc(item.badge)}</span>` : "";
    return `<a class="ml-category-card" href="${esc(item.href)}" data-editorial-id="${esc(item.id)}"><h3>${esc(item.title)}</h3>${badge}<div class="ml-category-card__media"><img src="${esc(item.image)}" alt="" loading="lazy" width="800" height="800"></div><div class="ml-category-card__cta-wrap" aria-hidden="true"><span class="ml-category-card__cta">Ver productos</span></div></a>`;
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
    return `<div class="ml-products-block"><div class="ml-product-grid" data-products-field="${esc(query.typesenseField)}" data-products-value="${esc(query.typesenseValue)}" data-products-filters="${esc(filters)}" data-products-count="${Number(query.productCount || 4)}" data-products-fetch-count="${Number(query.fetchCount || query.productCount || 4)}" data-products-randomize-by="${esc(query.randomizeBy || "")}"><div class="ml-product-state">Cargando productos…</div></div>${productControlsTemplate()}</div>`;
  }

  function lineTemplate(item) {
    const mode = item.content?.mode || "typesense";
    const lineId = item.id ? ` data-line="${esc(item.id)}"` : "";
    return `<article class="ml-featured ml-shell"${lineId} data-theme="${esc(item.theme)}" data-visual-theme="${esc(item.visualTheme || "solid")}" data-layout="${esc(item.layout)}" data-image-fit="${esc(item.imageFit || "cover")}" data-description-lines="${Number(item.descriptionLines || 0)}" data-button-tone="${buttonTone(item.textColor)}" data-content-mode="${esc(mode)}" style="--line-bg:${esc(item.theme)};--line-color:${esc(item.textColor)};--title-emphasis-weight:${Number(item.titleEmphasisWeight || 600)}"><div class="ml-featured__story"><div class="ml-featured__media"><img src="${esc(item.image)}" alt="" loading="lazy" width="1600" height="1000"></div><div class="ml-featured__copy"><h3>${emphasize(item.title, item.titleEmphasis)}</h3><p>${emphasize(item.description, item.descriptionEmphasis)}</p><div class="ml-featured__actions"><a class="ml-button ml-button--primary" href="${esc(item.href)}">Ver productos</a><a class="ml-button--tertiary" href="${esc(item.catalogHref || "#")}">Ver catálogo <span aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></span></a></div></div></div>${lineContentTemplate(item)}</article>`;
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
    const foa = root.querySelector("[data-foa]");
    if (!featuredProducts || !foa) return;
    foa.insertAdjacentElement("beforebegin", featuredProducts);
  }

  function initExpandBanners() {
    const banners = [...root.querySelectorAll("[data-expand-banner]")];
    if (!banners.length) return;

    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      banners.forEach(banner => banner.style.setProperty("--ml-expand-progress", "1"));
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const viewportHeight = window.innerHeight || 1;
      const start = viewportHeight * 0.88;
      banners.forEach(banner => {
        const rect = banner.getBoundingClientRect();
        const end = banner.matches(".ml-newsletter-banner")
          ? Math.max(viewportHeight * 0.26, viewportHeight - rect.height)
          : viewportHeight * 0.26;
        const raw = (start - rect.top) / Math.max(1, start - end);
        const clamped = Math.max(0, Math.min(1, raw));
        const progress = clamped * clamped * (3 - 2 * clamped);
        banner.style.setProperty("--ml-expand-progress", progress.toFixed(4));
      });
    };
    const requestUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    update();
  }

  function placePrimarySections() {
    /* Categories now live inside solutions banners. */
  }

  function initSolutionsBanner() {
    /* Fixed product image set in HTML. */
  }

  function renderCategoriesTest() {
    const sections = [...root.querySelectorAll("[data-categories-test]")];
    const entries = Object.entries(config.categoriesTest || {});
    if (!sections.length || !entries.length) return;

    sections.forEach((section, sectionIndex) => {
      const tabs = section.querySelector("[data-categories-test-tabs]");
      const grid = section.querySelector("[data-categories-test-grid]");
      if (!tabs || !grid) return;

      const panelId = `ml-categories-test-panel-${sectionIndex}`;
      const compactCategoryLabels = matchMedia("(max-width: 640px)");
      const activeLabel = item => compactCategoryLabels.matches && item.labelActiveMobile
        ? item.labelActiveMobile
        : item.labelActive;
      grid.id = panelId;
      tabs.innerHTML = entries.map(([key, item], index) => `
      <button class="ml-categories-test__tab ml-featured-products__tab${index === 0 ? " is-active" : ""}"
        id="ml-categories-test-tab-${sectionIndex}-${esc(key)}"
        type="button"
        role="tab"
        aria-controls="${panelId}"
        aria-selected="${index === 0}"
        tabindex="${index === 0 ? "0" : "-1"}"
        data-categories-test-tab="${esc(key)}">${esc(index === 0 ? activeLabel(item) : item.labelInactive)}</button>
    `).join("");

      const activate = key => {
        const item = config.categoriesTest[key];
        if (!item) return;
        const sliderRoot = section.querySelector("[data-categories-slider]") || section;
        section.dataset.activeCategory = key;
        section.style.setProperty("--categories-test-color", item.color);
        section.style.setProperty("--categories-test-text", item.textColor);
        grid.innerHTML = item.categories.map(categoryTemplate).join("");
        grid.scrollLeft = 0;
        grid.setAttribute("aria-labelledby", `ml-categories-test-tab-${sectionIndex}-${key}`);
        tabs.querySelectorAll("[data-categories-test-tab]").forEach(button => {
          const active = button.dataset.categoriesTestTab === key;
          const buttonConfig = config.categoriesTest[button.dataset.categoriesTestTab];
          button.classList.toggle("is-active", active);
          button.setAttribute("aria-selected", String(active));
          button.tabIndex = active ? 0 : -1;
          button.textContent = active ? activeLabel(buttonConfig) : buttonConfig.labelInactive;
        });
        window.MacroledFeatured?.setupTrackControls(sliderRoot, grid, {
          cardSelector: ".ml-category-card"
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
    });
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
          ? "radial-gradient(circle at 18% 10%, rgba(214, 220, 226, 0.08), transparent 30%), linear-gradient(180deg, #16283a 0%, #0c1218 42%, #07090c 100%)"
          : line.dataset.theme;
        if (background === activeBackground) return;
        if (activeBackground) {
          list.style.background = activeBackground;
          list.style.setProperty("--ml-panel-underlay", activeBackground);
        }
        activeBackground = background;
        const previousLayer = activeLayer;
        const layer = document.createElement("div");
        layer.className = "ml-line-theme-layer";
        if (line && (line.dataset.visualTheme === "silver-dark" || buttonTone(line.dataset.theme) === "dark")) {
          layer.classList.add("ml-line-theme-layer--dark");
        }
        layer.setAttribute("aria-hidden", "true");
        layer.style.setProperty("--ml-layer-background", background);
        list.append(layer);
        activeLayer = layer;
        requestAnimationFrame(() => {
          layer.classList.add("is-visible");
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
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        let integratedLine = lines[0];
        lines.forEach(line => {
          const copy = line.querySelector(".ml-featured__copy");
          const lineBounds = line.getBoundingClientRect();
          const copyBounds = copy?.getBoundingClientRect();
          const isReading = Boolean(
            copyBounds &&
            copyBounds.top < viewportHeight * 0.58 &&
            copyBounds.bottom > viewportHeight * 0.22
          );
          line.classList.toggle("is-story-integrated", isReading);
          /* Keep each line's theme through its cards and bottom padding.
             Falling back to Monaco here was flashing white between Reflectores and Skyline. */
          if (lineBounds.top < viewportHeight * 0.78) integratedLine = line;
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

  function initHeroLuminariasRise() {
    const hero = root.querySelector(".ml-hero");
    const luminarias = root.querySelector(".ml-project-lines-concept");
    if (!hero || !luminarias) return;

    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    let animating = false;
    let touchStartY = 0;

    const coverThreshold = () => Math.max(48, (hero.offsetHeight || window.innerHeight) * 0.12);

    const isOnCover = () => window.scrollY < coverThreshold();

    const riseTarget = () => {
      const top = luminarias.getBoundingClientRect().top + window.scrollY;
      return Math.max(0, Math.round(top));
    };

    const isReadyToFall = () => {
      const y = window.scrollY;
      return y > coverThreshold() && y <= riseTarget() + 64;
    };

    const animateScrollTo = (toY, duration) => {
      const fromY = window.scrollY;
      const distance = toY - fromY;
      if (Math.abs(distance) < 2) return Promise.resolve();

      const start = performance.now();
      const easeOutQuart = t => 1 - Math.pow(1 - t, 4);

      return new Promise(resolve => {
        const step = now => {
          const t = Math.min(1, (now - start) / duration);
          window.scrollTo(0, fromY + distance * easeOutQuart(t));
          if (t < 1) requestAnimationFrame(step);
          else resolve();
        };
        requestAnimationFrame(step);
      });
    };

    const goTo = target => {
      if (animating || reducedMotion.matches) return;
      if (Math.abs(target - window.scrollY) < 8) return;
      animating = true;
      animateScrollTo(target, 880).finally(() => {
        animating = false;
      });
    };

    const rise = () => goTo(riseTarget());
    const fall = () => goTo(0);

    window.addEventListener("wheel", event => {
      if (reducedMotion.matches) return;
      if (animating) {
        event.preventDefault();
        return;
      }
      if (event.deltaY > 0 && isOnCover()) {
        event.preventDefault();
        rise();
        return;
      }
      if (event.deltaY < 0 && isReadyToFall()) {
        event.preventDefault();
        fall();
      }
    }, { passive: false });

    window.addEventListener("touchstart", event => {
      touchStartY = event.touches[0]?.clientY || 0;
    }, { passive: true });

    window.addEventListener("touchmove", event => {
      if (reducedMotion.matches) return;
      if (animating) {
        event.preventDefault();
        return;
      }
      const currentY = event.touches[0]?.clientY || 0;
      const swipe = touchStartY - currentY;
      if (swipe > 14 && isOnCover()) {
        event.preventDefault();
        rise();
        return;
      }
      if (swipe < -14 && isReadyToFall()) {
        event.preventDefault();
        fall();
      }
    }, { passive: false });

    window.addEventListener("keydown", event => {
      if (reducedMotion.matches || event.altKey || event.ctrlKey || event.metaKey) return;
      if (animating) {
        if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", " "].includes(event.key)) {
          event.preventDefault();
        }
        return;
      }
      const scrollingDown = ["ArrowDown", "PageDown"].includes(event.key) || (event.key === " " && !event.shiftKey);
      const scrollingUp = ["ArrowUp", "PageUp"].includes(event.key) || (event.key === " " && event.shiftKey);
      if (scrollingDown && isOnCover()) {
        event.preventDefault();
        rise();
        return;
      }
      if (scrollingUp && isReadyToFall()) {
        event.preventDefault();
        fall();
      }
    });
  }

  function handleVideo() {
    const video = root.querySelector(".ml-hero__video");
    const revealHome = () => root.classList.remove("is-video-loading");
    if (!video) {
      revealHome();
      return;
    }
    video.poster = matchMedia("(max-width: 640px)").matches
      ? video.dataset.posterMobile
      : video.dataset.posterDesktop;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

    if (reducedMotion.matches) {
      video.pause();
      video.hidden = true;
      revealHome();
      return;
    }

    const revealVideo = () => {
      video.removeEventListener("canplay", revealVideo);
      video.removeEventListener("error", revealVideo);
      revealHome();
    };

    video.addEventListener("canplay", revealVideo, { once: true });
    video.addEventListener("error", revealVideo, { once: true });

    if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) revealVideo();
    video.play().catch(revealVideo);

    const restMs = 10000;
    const reverseSpeed = 8;
    let reverseFrame = 0;
    let restTimer = 0;
    let lastTick = 0;

    const stopReverse = () => {
      cancelAnimationFrame(reverseFrame);
      reverseFrame = 0;
    };

    const playForward = () => {
      stopReverse();
      video.currentTime = 0;
      video.play().catch(() => {});
    };

    const playReverse = () => {
      video.pause();
      lastTick = performance.now();
      const step = now => {
        const elapsed = ((now - lastTick) / 1000) * reverseSpeed;
        lastTick = now;
        const nextTime = video.currentTime - elapsed;
        if (nextTime <= 0.04) {
          video.currentTime = 0;
          stopReverse();
          playForward();
          return;
        }
        video.currentTime = nextTime;
        reverseFrame = requestAnimationFrame(step);
      };
      reverseFrame = requestAnimationFrame(step);
    };

    video.addEventListener("ended", () => {
      restTimer = window.setTimeout(playReverse, restMs);
    });

    reducedMotion.addEventListener("change", event => {
      if (!event.matches) return;
      window.clearTimeout(restTimer);
      stopReverse();
      video.pause();
      video.hidden = true;
    });
  }

  function animateHeroTitle() {
    const title = root.querySelector("#ml-hero-title");
    if (!title || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ariaText = title.innerText.replace(/\s+/g, " ").trim();
    title.setAttribute("aria-label", ariaText);

    const chunks = [...title.childNodes].flatMap(node => {
      if (node.nodeName === "BR") {
        return [{ type: "br", className: node.className }];
      }
      const text = node.textContent;
      return text ? [{ type: "text", value: text }] : [];
    });

    title.textContent = "";
    let letterIndex = 0;
    chunks.forEach(chunk => {
      if (chunk.type === "br") {
        const br = document.createElement("br");
        if (chunk.className) br.className = chunk.className;
        title.appendChild(br);
        return;
      }

      chunk.value.split(/(\s+)/).forEach(part => {
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
          letter.style.setProperty("--letter-delay", `${letterIndex * 52}ms`);
          letter.textContent = character;
          word.appendChild(letter);
          letterIndex += 1;
        });
        title.appendChild(word);
      });
    });
    requestAnimationFrame(() => title.classList.add("is-illuminating"));
  }

  function animateCategoriesTitle() {
    const titles = [...root.querySelectorAll(".ml-categories-test__title")];
    if (!titles.length || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    titles.forEach(title => {
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
    });
  }

  function initSectionMotion() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const solutionsSection = root.querySelector("[data-solutions-banner]");
    const projectSection = root.querySelector("[data-project-lines-concept]");
    const featuredSection = root.querySelector("#productos-destacados");
    const newsSection = root.querySelector(".ml-news");
    const conversionSection = root.querySelector(".ml-conversion");
    const newsletterSection = root.querySelector("[data-newsletter]");
    const categoriesSections = [...root.querySelectorAll("[data-categories-test]")];
    const featuredTrack = featuredSection?.querySelector("[data-featured-track]");
    const newsGrid = newsSection?.querySelector("[data-news]");
    const faqList = conversionSection?.querySelector("[data-faq]");
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
        }, section === projectSection ? 1800 : 1500);
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

    if (solutionsSection) {
      const solutionsGrid = solutionsSection.querySelector("[data-categories-test-grid]");
      let solutionsPending = false;
      solutionsSection.classList.add("ml-solutions-motion-ready");
      prepareCards(solutionsGrid, ".ml-category-card");

      const showSolutions = () => {
        prepareCards(solutionsGrid, ".ml-category-card");
        clearTimeout(solutionsSection._motionSettleTimer);
        solutionsSection.classList.remove("is-motion-settled", "is-motion-visible");
        solutionsGrid?.classList.remove("is-cards-refreshing", "is-cards-visible");
        /* Force a fresh transition cycle when re-entering. */
        void solutionsSection.offsetWidth;
        requestAnimationFrame(() => {
          solutionsSection.classList.add("is-motion-visible");
          solutionsSection._motionSettleTimer = setTimeout(() => {
            solutionsSection.classList.add("is-motion-settled");
          }, 3600);
        });
      };

      const hideSolutions = () => {
        clearTimeout(solutionsSection._motionSettleTimer);
        solutionsPending = false;
        solutionsSection.classList.remove("is-motion-visible", "is-motion-settled");
        solutionsGrid?.classList.remove("is-cards-refreshing", "is-cards-visible");
      };

      const armSolutions = () => {
        if (!solutionsPending) return;
        solutionsPending = false;
        showSolutions();
      };

      window.addEventListener("wheel", armSolutions, { passive: true });
      window.addEventListener("touchmove", armSolutions, { passive: true });
      window.addEventListener("keydown", event => {
        if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) {
          armSolutions();
        }
      });

      const observer = new IntersectionObserver(entries => {
        const entry = entries[0];
        if (!entry) return;
        if (!entry.isIntersecting) {
          hideSolutions();
          return;
        }
        if (motionArmed) showSolutions();
        else solutionsPending = true;
      }, { threshold: 0.22, rootMargin: "0px 0px -10% 0px" });
      observer.observe(solutionsSection);

      if (solutionsGrid) {
        new MutationObserver(() => {
          prepareCards(solutionsGrid, ".ml-category-card");
          if (!solutionsSection.classList.contains("is-motion-visible")) return;
          clearTimeout(solutionsGrid._cardsMotionTimer);
          solutionsGrid.classList.remove("is-cards-visible");
          solutionsGrid.classList.add("is-cards-refreshing");
          requestAnimationFrame(() => requestAnimationFrame(() => {
            solutionsGrid.classList.add("is-cards-visible");
            solutionsGrid._cardsMotionTimer = setTimeout(() => {
              solutionsGrid.classList.remove("is-cards-refreshing", "is-cards-visible");
            }, 2200);
          }));
        }).observe(solutionsGrid, { childList: true });
      }
    }

    if (projectSection) {
      let projectsPending = false;
      projectSection.classList.add("ml-motion-ready");
      prepareCards(projectSection, ".ml-project-lines-concept__card");

      const showProjects = () => {
        prepareCards(projectSection, ".ml-project-lines-concept__card");
        clearTimeout(projectSection._motionSettleTimer);
        projectSection.classList.remove("is-motion-settled", "is-motion-visible");
        void projectSection.offsetWidth;
        requestAnimationFrame(() => {
          projectSection.classList.add("is-motion-visible");
          projectSection._motionSettleTimer = setTimeout(() => {
            projectSection.classList.add("is-motion-settled");
          }, 2400);
        });
      };

      const hideProjects = () => {
        clearTimeout(projectSection._motionSettleTimer);
        projectsPending = false;
        projectSection.classList.remove("is-motion-visible", "is-motion-settled");
      };

      const armProjects = () => {
        if (!projectsPending) return;
        projectsPending = false;
        showProjects();
      };

      window.addEventListener("wheel", armProjects, { passive: true });
      window.addEventListener("touchmove", armProjects, { passive: true });
      window.addEventListener("keydown", event => {
        if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) {
          armProjects();
        }
      });

      const observer = new IntersectionObserver(entries => {
        const entry = entries[0];
        if (!entry) return;
        if (!entry.isIntersecting) {
          hideProjects();
          return;
        }
        if (motionArmed) showProjects();
        else projectsPending = true;
      }, { threshold: 0.13, rootMargin: "0px 0px -8% 0px" });
      observer.observe(projectSection);
    }

    /* Line sections keep their own content motion + background playbook. */
    root.querySelectorAll(".ml-featured[data-content-mode]").forEach(line => {
      const cardSelector = line.dataset.contentMode === "static"
        ? ".ml-category-card"
        : ".ml-product-card";
      const content = line.querySelector(
        line.dataset.contentMode === "static"
          ? ".ml-line-content--static"
          : ".ml-product-grid"
      );
      let linePending = false;
      line.classList.add("ml-content-motion-ready");
      prepareCards(line, cardSelector);

      const showLine = () => {
        prepareCards(line, cardSelector);
        clearTimeout(line._motionSettleTimer);
        line.classList.remove("is-motion-settled", "is-motion-visible");
        void line.offsetWidth;
        requestAnimationFrame(() => {
          line.classList.add("is-motion-visible");
          line._motionSettleTimer = setTimeout(() => {
            line.classList.add("is-motion-settled");
          }, 1800);
        });
      };

      const hideLine = () => {
        clearTimeout(line._motionSettleTimer);
        linePending = false;
        line.classList.remove("is-motion-visible", "is-motion-settled");
      };

      const armLine = () => {
        if (!linePending) return;
        linePending = false;
        showLine();
      };

      window.addEventListener("wheel", armLine, { passive: true });
      window.addEventListener("touchmove", armLine, { passive: true });
      window.addEventListener("keydown", event => {
        if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) {
          armLine();
        }
      });

      const observer = new IntersectionObserver(entries => {
        const entry = entries[0];
        if (!entry) return;
        if (!entry.isIntersecting) {
          hideLine();
          return;
        }
        if (motionArmed) showLine();
        else linePending = true;
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

    /* Featured products: same replayable entrance as soluciones. */
    if (featuredSection) {
      let featuredPending = false;
      featuredSection.classList.add("ml-featured-products-motion-ready");
      prepareCards(featuredTrack, ".ml-product-card");

      const showFeatured = () => {
        prepareCards(featuredTrack, ".ml-product-card");
        clearTimeout(featuredSection._motionSettleTimer);
        featuredSection.classList.remove("is-motion-settled", "is-motion-visible");
        void featuredSection.offsetWidth;
        requestAnimationFrame(() => {
          featuredSection.classList.add("is-motion-visible");
          featuredSection._motionSettleTimer = setTimeout(() => {
            featuredSection.classList.add("is-motion-settled");
          }, 3600);
        });
      };

      const hideFeatured = () => {
        clearTimeout(featuredSection._motionSettleTimer);
        featuredPending = false;
        featuredSection.classList.remove("is-motion-visible", "is-motion-settled");
      };

      const armFeatured = () => {
        if (!featuredPending) return;
        featuredPending = false;
        showFeatured();
      };

      window.addEventListener("wheel", armFeatured, { passive: true });
      window.addEventListener("touchmove", armFeatured, { passive: true });
      window.addEventListener("keydown", event => {
        if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) {
          armFeatured();
        }
      });

      const observer = new IntersectionObserver(entries => {
        const entry = entries[0];
        if (!entry) return;
        if (!entry.isIntersecting) {
          hideFeatured();
          return;
        }
        if (motionArmed) showFeatured();
        else featuredPending = true;
      }, { threshold: 0.22, rootMargin: "0px 0px -10% 0px" });
      observer.observe(featuredSection);

      if (featuredTrack) {
        new MutationObserver(() => {
          prepareCards(featuredTrack, ".ml-product-card");
          if (!featuredSection.classList.contains("is-motion-visible")) return;
          featuredSection.classList.remove("is-motion-visible");
          requestAnimationFrame(() => requestAnimationFrame(() => {
            featuredSection.classList.add("is-motion-visible");
          }));
        }).observe(featuredTrack, { childList: true });
      }
    }

    if (newsSection) {
      let newsPending = false;
      newsSection.classList.add("ml-news-motion-ready");
      prepareCards(newsGrid, ".ml-news-card");

      const showNews = () => {
        prepareCards(newsGrid, ".ml-news-card");
        clearTimeout(newsSection._motionSettleTimer);
        newsSection.classList.remove("is-motion-settled", "is-motion-visible");
        void newsSection.offsetWidth;
        requestAnimationFrame(() => {
          newsSection.classList.add("is-motion-visible");
          newsSection._motionSettleTimer = setTimeout(() => {
            newsSection.classList.add("is-motion-settled");
          }, 3600);
        });
      };

      const hideNews = () => {
        clearTimeout(newsSection._motionSettleTimer);
        newsPending = false;
        newsSection.classList.remove("is-motion-visible", "is-motion-settled");
      };

      const armNews = () => {
        if (!newsPending) return;
        newsPending = false;
        showNews();
      };

      window.addEventListener("wheel", armNews, { passive: true });
      window.addEventListener("touchmove", armNews, { passive: true });
      window.addEventListener("keydown", event => {
        if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) {
          armNews();
        }
      });

      const observer = new IntersectionObserver(entries => {
        const entry = entries[0];
        if (!entry) return;
        if (!entry.isIntersecting) {
          hideNews();
          return;
        }
        if (motionArmed) showNews();
        else newsPending = true;
      }, { threshold: 0.22, rootMargin: "0px 0px -10% 0px" });
      observer.observe(newsSection);

      if (newsGrid) {
        new MutationObserver(() => {
          prepareCards(newsGrid, ".ml-news-card");
          if (!newsSection.classList.contains("is-motion-visible")) return;
          newsSection.classList.remove("is-motion-visible");
          requestAnimationFrame(() => requestAnimationFrame(() => {
            newsSection.classList.add("is-motion-visible");
          }));
        }).observe(newsGrid, { childList: true });
      }
    }

    if (conversionSection) {
      let faqPending = false;
      conversionSection.classList.add("ml-faq-motion-ready");
      prepareCards(faqList, ".ml-faq__item");

      const showFaq = () => {
        prepareCards(faqList, ".ml-faq__item");
        clearTimeout(conversionSection._motionSettleTimer);
        conversionSection.classList.remove("is-motion-settled", "is-motion-visible");
        void conversionSection.offsetWidth;
        requestAnimationFrame(() => {
          conversionSection.classList.add("is-motion-visible");
          conversionSection._motionSettleTimer = setTimeout(() => {
            conversionSection.classList.add("is-motion-settled");
          }, 3600);
        });
      };

      const hideFaq = () => {
        clearTimeout(conversionSection._motionSettleTimer);
        faqPending = false;
        conversionSection.classList.remove("is-motion-visible", "is-motion-settled");
      };

      const armFaq = () => {
        if (!faqPending) return;
        faqPending = false;
        showFaq();
      };

      window.addEventListener("wheel", armFaq, { passive: true });
      window.addEventListener("touchmove", armFaq, { passive: true });
      window.addEventListener("keydown", event => {
        if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) {
          armFaq();
        }
      });

      const observer = new IntersectionObserver(entries => {
        const entry = entries[0];
        if (!entry) return;
        if (!entry.isIntersecting) {
          hideFaq();
          return;
        }
        if (motionArmed) showFaq();
        else faqPending = true;
      }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
      observer.observe(conversionSection);
    }

    if (newsletterSection) {
      let newsletterPending = false;
      newsletterSection.classList.add("ml-newsletter-motion-ready");

      const showNewsletter = () => {
        clearTimeout(newsletterSection._motionSettleTimer);
        newsletterSection.classList.remove("is-motion-settled", "is-motion-visible");
        void newsletterSection.offsetWidth;
        requestAnimationFrame(() => {
          newsletterSection.classList.add("is-motion-visible");
          newsletterSection._motionSettleTimer = setTimeout(() => {
            newsletterSection.classList.add("is-motion-settled");
          }, 2200);
        });
      };

      const hideNewsletter = () => {
        clearTimeout(newsletterSection._motionSettleTimer);
        newsletterPending = false;
        newsletterSection.classList.remove("is-motion-visible", "is-motion-settled");
      };

      const armNewsletter = () => {
        if (!newsletterPending) return;
        newsletterPending = false;
        showNewsletter();
      };

      window.addEventListener("wheel", armNewsletter, { passive: true });
      window.addEventListener("touchmove", armNewsletter, { passive: true });
      window.addEventListener("keydown", event => {
        if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) {
          armNewsletter();
        }
      });

      const observer = new IntersectionObserver(entries => {
        const entry = entries[0];
        if (!entry) return;
        if (!entry.isIntersecting) {
          hideNewsletter();
          return;
        }
        if (motionArmed) showNewsletter();
        else newsletterPending = true;
      }, { threshold: 0.22, rootMargin: "0px 0px -10% 0px" });
      observer.observe(newsletterSection);
    }

    const refreshDynamicCards = (container, selector) => {
      if (!container) return;
      new MutationObserver(() => {
        prepareCards(container, selector);
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

    categoriesSections.forEach(section => {
      if (solutionsSection?.contains(section) || section === solutionsSection) return;
      refreshDynamicCards(
        section.querySelector("[data-categories-test-grid]"),
        ".ml-category-card"
      );
    });
  }

  renderSections();
  placePrimarySections();
  placeFeaturedProducts();
  renderCategoriesTest();
  initCategoryCarousels();
  initLineBackgrounds();
  initSolutionsBanner();
  renderCommon();
  window.MacroledProducts.init(root);
  window.MacroledFeatured.init(root);
  window.MacroledProjectLinesConcept.init(root);
  handleVideo();
  animateHeroTitle();
  animateCategoriesTitle();
  initHeroLuminariasRise();
  initSectionMotion();
  initExpandBanners();
  }

  if (initializeHome()) return;

  const observer = new MutationObserver(() => {
    if (!initializeHome()) return;
    observer.disconnect();
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener("DOMContentLoaded", () => {
    if (!initializeHome()) return;
    observer.disconnect();
  }, { once: true });
})(window);
