(function () {
  const body = document.body;
  const nav = document.querySelector("[data-nav]");
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector("[data-mobile-menu]");
  const progress = document.querySelector("[data-scroll-progress]");
  const rotator = document.querySelector("[data-rotator]");
  const navCta = document.querySelector(".nav-cta");
  const serviceSection = document.querySelector(".process-section");
  const serviceCards = Array.from(document.querySelectorAll(".process-track .feature-card"));
  const serviceDots = Array.from(document.querySelectorAll(".service-nav-progress span"));
  const words = ["Mobile App", "SaaS", "Website", "Software", "Landing Pages", "Brand", "Product", "Flows"];
  const desktopNav = window.matchMedia("(min-width: 1025px)");
  const defaultCtaText = navCta?.textContent || "";
  let wordIndex = 0;
  let lastScroll = window.scrollY;
  let visibleTimer = null;
  let rippleTimer = null;

  let serviceTrigger = null;
  let trackTravel = 0;

  function readServiceTrigger() {
    if (serviceTrigger && Number.isFinite(serviceTrigger.start) && serviceTrigger.trigger === serviceSection) {
      return serviceTrigger;
    }
    const triggers = window.ScrollTrigger?.getAll?.() || [];
    serviceTrigger = triggers.find((trigger) => trigger.trigger === serviceSection) || null;
    return serviceTrigger;
  }

  function getServiceTrackProgress() {
    const track = document.querySelector(".process-track");
    if (!track) return 0;
    const transform = track.style.transform || "";
    const translate = transform.match(/translate3d\(\s*(-?[\d.]+)px/i) || transform.match(/translate\(\s*(-?[\d.]+)px/i);
    let x = translate ? Number.parseFloat(translate[1]) : 0;
    if (!translate) {
      const matrix = transform.match(/matrix.*\((.+)\)/);
      const values = matrix ? matrix[1].split(",").map((value) => Number.parseFloat(value.trim())) : [];
      x = values.length >= 6 ? values[4] : 0;
    }
    if (!trackTravel) {
      const span = track.scrollWidth - window.innerWidth;
      if (span > 8) trackTravel = span;
    }
    return Math.min(1, Math.max(0, Math.abs(x) / (trackTravel || 1)));
  }

  function getServicesProgress(y) {
    if (!serviceSection) return { active: false, progress: 0 };

    const trigger = readServiceTrigger();
    if (trigger && Number.isFinite(trigger.start) && Number.isFinite(trigger.end)) {
      const span = Math.max(1, trigger.end - trigger.start);
      return {
        active: y >= trigger.start && y <= trigger.end,
        progress: Math.min(1, Math.max(0, (y - trigger.start) / span))
      };
    }

    const top = serviceSection.offsetTop;
    const span = Math.max(1, serviceSection.offsetHeight - window.innerHeight);
    return {
      active: y >= top && y <= top + serviceSection.offsetHeight,
      progress: Math.min(1, Math.max(0, (y - top) / span))
    };
  }

  function updateServiceNav(y, isDesktop) {
    if (!nav) return;
    const serviceState = getServicesProgress(y);
    const active = isDesktop && serviceState.active;
    nav.classList.toggle("is-service-mode", active);

    if (navCta) navCta.textContent = active ? "Book a call" : defaultCtaText;
    if (active) nav.classList.remove("is-hidden");

    if (!serviceDots.length) return;
    const cardCount = Math.max(1, serviceCards.length - 1);
    const activeIndex = active
      ? Math.min(serviceDots.length - 1, Math.round(getServiceTrackProgress() * cardCount))
      : 0;
    serviceDots.forEach((dot, index) => dot.classList.toggle("is-active", index === activeIndex));
  }

  function onScroll() {
    const y = window.scrollY;
    const max = Math.max(1, window.__lenis?.limit || document.documentElement.scrollHeight - window.innerHeight);
    const delta = y - lastScroll;
    const isDesktop = desktopNav.matches;

    nav?.classList.toggle("is-scrolled", y > (isDesktop ? 80 : 60));
    updateServiceNav(y, isDesktop);

    if (nav && Math.abs(delta) > 8) {
      const shouldHide =
        y > lastScroll &&
        y > (isDesktop ? 140 : 180) &&
        !nav.classList.contains("is-service-mode") &&
        !body.classList.contains("menu-open");
      nav.classList.toggle("is-hidden", shouldHide);

      if (isDesktop && delta < 0 && nav.classList.contains("is-scrolled")) {
        nav.classList.add("is-visible");
        clearTimeout(visibleTimer);
        visibleTimer = setTimeout(() => nav.classList.remove("is-visible"), 620);
      } else if (!shouldHide) {
        nav.classList.remove("is-visible");
      }

      lastScroll = y;
    }
    if (progress) progress.style.transform = `scaleX(${Math.min(1, y / max)})`;
  }

  window.__updateDynamicNav = onScroll;

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    trackTravel = 0;
    serviceTrigger = null;
    onScroll();
  }, { passive: true });
  desktopNav.addEventListener?.("change", () => {
    nav?.classList.remove("is-hidden", "is-visible", "is-rippling");
    lastScroll = window.scrollY;
    serviceTrigger = null;
    trackTravel = 0;
    onScroll();
  });
  onScroll();

  if (nav) {
    nav.addEventListener("click", () => {
      if (!desktopNav.matches || !nav.classList.contains("is-scrolled")) return;
      nav.classList.add("is-rippling");
      clearTimeout(rippleTimer);
      rippleTimer = setTimeout(() => nav.classList.remove("is-rippling"), 430);
    });
  }

  if (menuToggle && mobileMenu) {
    const setMenuOpen = (open) => {
      menuToggle.classList.toggle("is-open", open);
      mobileMenu.classList.toggle("is-open", open);
      body.classList.toggle("menu-open", open);
      menuToggle.setAttribute("aria-expanded", String(open));
      mobileMenu.setAttribute("aria-hidden", String(!open));
    };

    menuToggle.addEventListener("click", () => {
      const open = !menuToggle.classList.contains("is-open");
      setMenuOpen(open);
    });

    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        setMenuOpen(false);
      });
    });

    mobileMenu.addEventListener("click", (event) => {
      if (event.target === mobileMenu) setMenuOpen(false);
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && mobileMenu.classList.contains("is-open")) {
        setMenuOpen(false);
        menuToggle.focus();
      }
    });
  }

  if (rotator) {
    setInterval(() => {
      wordIndex = (wordIndex + 1) % words.length;
      rotator.textContent = words[wordIndex];
      rotator.animate(
        [{ opacity: 0.55, transform: "translateY(6px)" }, { opacity: 1, transform: "translateY(0)" }],
        { duration: 260, easing: "ease", fill: "forwards" }
      );
    }, 1500);
  }

  if (!window.gsap) {
    document.querySelectorAll("[data-accordion]").forEach((accordion) => {
      accordion.querySelectorAll("article").forEach((item, index) => {
        const button = item.querySelector("button");
        const panel = item.querySelector("div");
        if (index === 0) {
          item.classList.add("is-open");
          panel.style.maxHeight = `${panel.scrollHeight}px`;
        }
        button.addEventListener("click", () => {
          const isOpen = item.classList.contains("is-open");
          accordion.querySelectorAll("article").forEach((other) => {
            other.classList.remove("is-open");
            const otherPanel = other.querySelector("div");
            if (otherPanel) otherPanel.style.maxHeight = "0px";
          });
          if (!isOpen) {
            item.classList.add("is-open");
            panel.style.maxHeight = `${panel.scrollHeight}px`;
          }
        });
      });
    });
  }

  document.querySelectorAll("[data-billing-toggle]").forEach((toggle) => {
    const buttons = toggle.querySelectorAll("button");
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        buttons.forEach((btn) => btn.classList.remove("is-active"));
        button.classList.add("is-active");
        const plan = button.dataset.plan;
        const prices = Array.from(document.querySelectorAll("[data-monthly]"));
        const updatePrices = () => {
          prices.forEach((price) => {
            const next = price.dataset[plan] || price.dataset.monthly;
            price.textContent = next;
          });
        };
        if (window.gsap) {
          gsap.killTweensOf(prices);
          gsap.to(prices, {
            y: -20,
            opacity: 0,
            duration: 0.2,
            ease: "power2.in",
            onComplete: () => {
              updatePrices();
              gsap.set(prices, { y: 20, opacity: 0 });
              gsap.to(prices, { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" });
            }
          });
          window.setTimeout(updatePrices, 260);
        } else {
          updatePrices();
        }
      });
    });
  });

  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      document.querySelectorAll("[data-filter]").forEach((btn) => btn.classList.remove("is-active"));
      button.classList.add("is-active");
      document.querySelectorAll("[data-category]").forEach((card) => {
        const show = filter === "all" || card.dataset.category.includes(filter);
        card.hidden = !show;
        if (show) {
          card.animate(
            [{ opacity: 0, transform: "translateY(16px)" }, { opacity: 1, transform: "translateY(0)" }],
            { duration: 260, easing: "ease-out" }
          );
        }
      });
    });
  });

  document.querySelectorAll("[data-contact-form]").forEach((form) => {
    const button = form.querySelector("button[type='submit']");
    const success = form.parentElement.querySelector(".form-success");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      button.classList.add("is-loading");
      button.textContent = "Sending...";
      setTimeout(() => {
        button.classList.remove("is-loading");
        button.textContent = "Message sent";
        success?.classList.add("is-visible");
        form.reset();
      }, 850);
    });
  });

  const motionVideos = Array.from(document.querySelectorAll("video"));
  const playMotionVideo = (video) => {
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    const playPromise = video.play();
    if (playPromise?.catch) playPromise.catch(() => {});
  };

  if ("IntersectionObserver" in window && motionVideos.length) {
    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) playMotionVideo(entry.target);
          else entry.target.pause();
        });
      },
      { rootMargin: "180px 0px", threshold: 0.01 }
    );
    motionVideos.forEach((video) => videoObserver.observe(video));
  } else {
    motionVideos.forEach((video) => playMotionVideo(video));
  }

  document.querySelectorAll("[data-copy-email]").forEach((emailButton) => {
    const email = emailButton.getAttribute("data-copy-email") || emailButton.textContent.trim();
    emailButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(email);
      } catch (error) {
        const textarea = document.createElement("textarea");
        textarea.value = email;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
      }
      emailButton.classList.add("is-copied");
      window.setTimeout(() => emailButton.classList.remove("is-copied"), 1200);
    });
  });

  const dot = document.querySelector(".cursor-dot");
  const ring = document.querySelector(".cursor-ring");
  if (dot && ring && matchMedia("(pointer: fine)").matches && !window.gsap) {
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let rx = x;
    let ry = y;

    window.addEventListener("mousemove", (event) => {
      x = event.clientX;
      y = event.clientY;
      dot.style.left = `${x}px`;
      dot.style.top = `${y}px`;
    });

    function frame() {
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      ring.style.left = `${rx}px`;
      ring.style.top = `${ry}px`;
      requestAnimationFrame(frame);
    }
    frame();

    document.querySelectorAll("a, button, .story-card, .work-card").forEach((el) => {
      el.addEventListener("mouseenter", () => {
        const isEmail = el.matches("[data-copy-email]");
        dot.style.transform = "translate(0, 0) scale(1.08)";
        if (isEmail) {
          ring.dataset.cursorLabel = "Copy email ID";
          ring.classList.add("has-label");
          ring.style.opacity = "1";
        }
      });
      el.addEventListener("mouseleave", () => {
        dot.style.transform = "translate(0, 0) scale(1)";
        ring.dataset.cursorLabel = "";
        ring.classList.remove("has-label");
        ring.style.opacity = "0";
      });
    });
  }
})();
