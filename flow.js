(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.querySelector("[data-header]");
  const menuToggle = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".nav-menu");

  const refreshHeader = () => {
    header?.classList.toggle("scrolled", window.scrollY > 18);
  };

  const closeMenu = () => {
    navigation?.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  };

  refreshHeader();
  window.addEventListener("scroll", refreshHeader, { passive: true });

  menuToggle?.addEventListener("click", () => {
    const willOpen = !navigation?.classList.contains("open");
    navigation?.classList.toggle("open", willOpen);
    menuToggle.setAttribute("aria-expanded", String(willOpen));
    document.body.classList.toggle("menu-open", willOpen);
  });

  navigation?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  document.querySelectorAll(".comparison-slider").forEach((slider) => {
    let dragging = false;
    const preventImageSelection = (event) => event.preventDefault();

    slider.addEventListener("dragstart", preventImageSelection);
    slider.addEventListener("selectstart", preventImageSelection);

    const setPosition = (position) => {
      const safePosition = Math.max(0, Math.min(100, position));
      slider.style.setProperty("--position", `${safePosition}%`);
      slider.setAttribute("aria-valuenow", String(Math.round(safePosition)));
    };

    const positionFromPointer = (clientX) => {
      const bounds = slider.getBoundingClientRect();
      setPosition(((clientX - bounds.left) / bounds.width) * 100);
    };

    slider.addEventListener("pointerdown", (event) => {
      dragging = true;
      slider.setPointerCapture?.(event.pointerId);
      positionFromPointer(event.clientX);
    });

    slider.addEventListener("pointermove", (event) => {
      if (dragging) positionFromPointer(event.clientX);
    });

    const stopDragging = (event) => {
      if (!dragging) return;
      dragging = false;
      if (slider.hasPointerCapture?.(event.pointerId)) {
        slider.releasePointerCapture(event.pointerId);
      }
    };

    slider.addEventListener("pointerup", stopDragging);
    slider.addEventListener("pointercancel", stopDragging);

    slider.addEventListener("keydown", (event) => {
      const current = Number(slider.getAttribute("aria-valuenow") || 50);
      const keyboardPositions = {
        ArrowLeft: current - 2,
        ArrowDown: current - 2,
        ArrowRight: current + 2,
        ArrowUp: current + 2,
        Home: 0,
        End: 100,
      };

      if (!(event.key in keyboardPositions)) return;
      event.preventDefault();
      setPosition(keyboardPositions[event.key]);
    });
  });

  const currencyButtons = document.querySelectorAll("[data-currency]");
  const prices = document.querySelectorAll("[data-eur][data-usd]");
  const priceAnimations = new WeakMap();
  const currencyFormat = {
    eur: { symbol: "€", locale: "de-DE" },
    usd: { symbol: "$", locale: "de-DE" },
  };

  const getNumericPrice = (value) => Number(value.replace(/\D/g, ""));

  const formatPrice = (value, currency) => {
    const config = currencyFormat[currency];
    return `${config.symbol}${Math.round(value).toLocaleString(config.locale)}`;
  };

  const animatePrice = (element, currency) => {
    const previousAnimation = priceAnimations.get(element);
    if (previousAnimation) cancelAnimationFrame(previousAnimation);

    const startValue = Number(element.dataset.currentValue || getNumericPrice(element.textContent));
    const endValue = getNumericPrice(element.dataset[currency]);

    if (reducedMotion || startValue === endValue) {
      element.textContent = formatPrice(endValue, currency);
      element.dataset.currentValue = String(endValue);
      return;
    }

    const duration = 760;
    const startedAt = performance.now();

    const updatePrice = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (endValue - startValue) * easedProgress;

      element.textContent = formatPrice(currentValue, currency);
      element.dataset.currentValue = String(currentValue);

      if (progress < 1) {
        priceAnimations.set(element, requestAnimationFrame(updatePrice));
      } else {
        element.textContent = formatPrice(endValue, currency);
        element.dataset.currentValue = String(endValue);
        priceAnimations.delete(element);
      }
    };

    priceAnimations.set(element, requestAnimationFrame(updatePrice));
  };

  currencyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const currency = button.dataset.currency;

      currencyButtons.forEach((item) => {
        const isActive = item === button;
        item.classList.toggle("active", isActive);
        item.setAttribute("aria-pressed", String(isActive));
      });

      prices.forEach((price) => {
        const note = price.parentElement?.querySelector(".price-note");
        if (note) note.textContent = note.dataset[`${currency}Note`];
        animatePrice(price, currency);
      });
    });
  });

  document.querySelector("[data-contact-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    window.alert("Thank you! Your project brief is ready. We'll be in touch shortly.");
    event.currentTarget.reset();
  });

  window.lucide?.createIcons?.({
    attrs: {
      "stroke-width": 1.8,
    },
  });

  if (!reducedMotion && window.gsap && window.ScrollTrigger) {
    const gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);

    document.querySelectorAll(".reveal-item").forEach((item) => {
      gsap.fromTo(
        item,
        { autoAlpha: 0, y: 42 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: {
            trigger: item,
            start: "top 91%",
            end: "bottom 9%",
            toggleActions: "restart reverse restart reverse",
          },
        },
      );
    });

    document.querySelectorAll(".reveal-group").forEach((group) => {
      const children = Array.from(group.children);
      if (!children.length) return;

      gsap.fromTo(
        children,
        { autoAlpha: 0, y: 48 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: group,
            start: "top 88%",
            end: "bottom 12%",
            toggleActions: "restart reverse restart reverse",
          },
        },
      );
    });

    document.querySelectorAll(".fade-item").forEach((item) => {
      gsap.fromTo(
        item,
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: item,
            start: "top 91%",
            end: "bottom 9%",
            toggleActions: "restart reverse restart reverse",
          },
        },
      );
    });

  }

  const supportsMagneticHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (!reducedMotion && supportsMagneticHover) {
    document.querySelectorAll(".button, .nav-cta").forEach((button) => {
      button.addEventListener("pointermove", (event) => {
        const bounds = button.getBoundingClientRect();
        const offsetX = event.clientX - bounds.left - bounds.width / 2;
        const offsetY = event.clientY - bounds.top - bounds.height / 2;

        button.style.transform = `translate(${offsetX * 0.25}px, ${offsetY * 0.25}px)`;
      });

      button.addEventListener("pointerleave", () => {
        button.style.transform = "translate(0, 0)";
      });

      button.addEventListener("blur", () => {
        button.style.transform = "translate(0, 0)";
      });
    });
  }

  document.querySelectorAll(".icon-box").forEach((icon) => {
    icon.addEventListener("pointerenter", () => {
      if (reducedMotion || !window.anime?.animate) return;
      window.anime.animate(icon, {
        scale: [1, 1.08],
        rotate: [0, -4],
        duration: 360,
        easing: "easeOutBack",
      });
    });

    icon.addEventListener("pointerleave", () => {
      if (reducedMotion || !window.anime?.animate) return;
      window.anime.animate(icon, {
        scale: 1,
        rotate: 0,
        duration: 260,
        easing: "easeOutCubic",
      });
    });
  });
})();
