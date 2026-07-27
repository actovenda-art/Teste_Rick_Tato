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

  const animatePrice = (element) => {
    if (reducedMotion || !window.anime?.animate) return;
    window.anime.animate(element, {
      opacity: [0, 1],
      translateY: [8, 0],
      duration: 420,
      easing: "easeOutCubic",
    });
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
        price.textContent = price.dataset[currency];
        const note = price.parentElement?.querySelector(".price-note");
        if (note) note.textContent = note.dataset[`${currency}Note`];
        animatePrice(price);
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

    const heroImage = document.querySelector(".hero-media img");
    if (heroImage) {
      gsap.to(heroImage, {
        yPercent: 7,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: 0.7,
        },
      });
    }
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
