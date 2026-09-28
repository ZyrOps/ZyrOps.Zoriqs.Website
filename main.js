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
  let observedScroll = window.scrollY;
  let visibleTimer = null;
  let rippleTimer = null;

  function getServiceTrackProgress() {
    const track = document.querySelector(".process-track");
    if (!track) return 0;
    const transform = getComputedStyle(track).transform;
    const match = transform && transform !== "none" ? transform.match(/matrix.*\((.+)\)/) : null;
    const values = match ? match[1].split(",").map((value) => Number.parseFloat(value.trim())) : [];
    const x = values.length >= 6 ? values[4] : 0;
    const max = Math.max(1, track.scrollWidth - window.innerWidth);
    return Math.min(1, Math.max(0, Math.abs(x) / max));
  }

  function getServicesProgress(y) {
    if (!serviceSection) return { active: false, progress: 0 };

    const rect = serviceSection.getBoundingClientRect();
    const geometryActive = rect.top <= 96 && rect.bottom >= window.innerHeight * 0.35;
    const geometrySpan = Math.max(1, rect.height - window.innerHeight);
    const trackProgress = getServiceTrackProgress();
    const geometryProgress = trackProgress || Math.min(1, Math.max(0, -rect.top / geometrySpan));

    const triggers = window.ScrollTrigger?.getAll?.() || [];
    const serviceTrigger = triggers.find(
      (trigger) => trigger.trigger === serviceSection || trigger.trigger?.classList?.contains("process-section")
    );
    if (serviceTrigger && Number.isFinite(serviceTrigger.start) && Number.isFinite(serviceTrigger.end)) {
      const triggerActive = y >= serviceTrigger.start && y <= serviceTrigger.end;
      const span = Math.max(1, serviceTrigger.end - serviceTrigger.start);
      const triggerProgress = Math.min(1, Math.max(0, (y - serviceTrigger.start) / span));
      return {
        active: triggerActive || geometryActive,
        progress: trackProgress || (triggerActive ? triggerProgress : geometryProgress)
      };
    }

    return { active: geometryActive, progress: geometryProgress };
  }

  function getVisibleServiceIndex() {
    if (!serviceCards.length) return 0;

    const viewportCenter = window.innerWidth / 2;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;
    let hasVisibleCard = false;

    serviceCards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const visibleWidth = Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0);
      if (visibleWidth <= 0) return;
      hasVisibleCard = true;

      const cardCenter = rect.left + rect.width / 2;
      const distance = Math.abs(cardCenter - viewportCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    return hasVisibleCard ? closestIndex : Number.NaN;
  }

  function updateServiceNav(y, isDesktop) {
    if (!nav) return;
    const serviceState = getServicesProgress(y);
    const active = isDesktop && serviceState.active;
    nav.classList.toggle("is-service-mode", active);

    if (navCta) navCta.textContent = active ? "Book a call" : defaultCtaText;
    if (active) nav.classList.remove("is-hidden");

    if (!serviceDots.length) return;
    const fallbackIndex = Math.min(serviceDots.length - 1, Math.floor(serviceState.progress * serviceDots.length));
    const visibleIndex = getVisibleServiceIndex();
    const activeIndex = active ? Math.min(serviceDots.length - 1, Number.isFinite(visibleIndex) ? visibleIndex : fallbackIndex) : 0;
    serviceDots.forEach((dot, index) => dot.classList.toggle("is-active", index === activeIndex));
  }

  function onScroll() {
    const y = window.scrollY;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
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
    observedScroll = y;
  }

  window.__updateDynamicNav = onScroll;

  window.addEventListener("scroll", onScroll, { passive: true });
  desktopNav.addEventListener?.("change", () => {
    nav?.classList.remove("is-hidden", "is-visible", "is-rippling");
    lastScroll = window.scrollY;
    onScroll();
  });
  onScroll();

  function watchScrollPosition() {
    const y = window.scrollY;
    if (Math.abs(y - observedScroll) > 1) onScroll();
    if (nav?.classList.contains("is-service-mode")) updateServiceNav(y, desktopNav.matches);
    requestAnimationFrame(watchScrollPosition);
  }
  requestAnimationFrame(watchScrollPosition);
  window.setInterval(() => {
    if (Math.abs(window.scrollY - observedScroll) > 1) onScroll();
  }, 80);

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

  const serviceVideos = Array.from(document.querySelectorAll(".service-video"));
  const playServiceVideo = (video) => {
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    const playPromise = video.play();
    if (playPromise?.catch) playPromise.catch(() => {});
  };

  serviceVideos.forEach((video) => {
    if (video.readyState >= 2) playServiceVideo(video);
    video.addEventListener("loadeddata", () => playServiceVideo(video), { once: true });
  });

  if ("IntersectionObserver" in window && serviceVideos.length) {
    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) playServiceVideo(entry.target);
        });
      },
      { threshold: 0.18 }
    );
    serviceVideos.forEach((video) => videoObserver.observe(video));
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
