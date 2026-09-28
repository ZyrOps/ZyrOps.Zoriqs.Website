(function () {
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  window.scrollTo(0, 0);

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const desktopMotion = window.matchMedia("(min-width: 1025px)");
  let lenis = null;

  function setVisible() {
    document.querySelectorAll(".reveal, .split-line").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
      el.style.clipPath = "none";
    });
    document.querySelectorAll(".word-reveal span").forEach((word) => {
      word.style.setProperty("--word-fill", "100%");
    });
  }

  function splitLines(el) {
    if (!el) return [];
    if (el.dataset.splitReady === "true") return Array.from(el.querySelectorAll(".split-line"));
    const parts = el.innerHTML.trim().split(/<br\s*\/?>/i);
    el.innerHTML = parts
      .map((part) => `<span class="split-line-wrap"><span class="split-line">${part.trim()}</span></span>`)
      .join("");
    el.dataset.splitReady = "true";
    return Array.from(el.querySelectorAll(".split-line"));
  }

  function initLenis() {
    if (reduceMotion || !window.Lenis || !desktopMotion.matches) return null;
    const instance = new Lenis({
      duration: 0.55,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: "vertical",
      orientation: "vertical",
      gestureDirection: "vertical",
      gestureOrientation: "vertical",
      smooth: true,
      smoothWheel: true,
      smoothTouch: false,
      syncTouch: false,
      wheelMultiplier: 1.65,
      touchMultiplier: 2.5,
      infinite: false
    });

    instance.scrollTo(0, { immediate: true });

    if (window.gsap) {
      gsap.ticker.add((time) => instance.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (time) => {
        instance.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
    }

    if (window.ScrollTrigger && instance.on) {
      instance.on("scroll", ScrollTrigger.update);
    }

    window.__lenis = instance;
    return instance;
  }

  function initPageLoad(hasScrollTrigger) {
    const nav = document.querySelector(".site-nav");
    const heroRoot = document.querySelector(".hero, .page-hero, .case-hero");
    if (!heroRoot) return;

    const headline = heroRoot.querySelector(".display, h1");
    const headlineLines = splitLines(headline);
    const subheadline = heroRoot.querySelector(".hero-sub, p:not(.eyebrow)");
    const buttons = heroRoot.querySelectorAll(".hero-actions .button, .button");
    const device = heroRoot.querySelector(".hero-device");
    const eyebrow = heroRoot.querySelector(".eyebrow");

    gsap.set([headline, subheadline, eyebrow, device].filter(Boolean), { opacity: 1, y: 0 });
    gsap.set(headlineLines, { y: 80, opacity: 0, clipPath: "inset(0 0 100% 0)" });

    const tl = gsap.timeline({ delay: 0.2 });
    if (nav) {
      tl.fromTo(nav, { y: -100, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" });
    }
    if (eyebrow) {
      tl.fromTo(eyebrow, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: "power2.out" }, "-=0.45");
    }
    if (headlineLines.length) {
      tl.to(
        headlineLines,
        {
          y: 0,
          opacity: 1,
          clipPath: "inset(0 0 0% 0)",
          duration: 1,
          ease: "power4.out",
          stagger: 0.12
        },
        "-=0.35"
      );
    }
    if (subheadline) {
      tl.fromTo(subheadline, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, "-=0.6");
    }
    if (buttons.length) {
      tl.fromTo(buttons, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power2.out", stagger: 0.15 }, "-=0.5");
    }
    if (device) {
      tl.fromTo(device, { y: 35, opacity: 0, scale: 0.98 }, { y: 0, opacity: 1, scale: 1, duration: 0.9, ease: "power3.out" }, "-=0.35");
    }

    if (device && hasScrollTrigger) {
      gsap.to(device, {
        y: 110,
        rotateX: 5,
        ease: "none",
        scrollTrigger: {
          trigger: heroRoot,
          start: "top top",
          end: "bottom top",
          scrub: 1.5
        }
      });
    }
  }

  function animateSectionHeadings(hasScrollTrigger) {
    if (!hasScrollTrigger) return;
    document.querySelectorAll(".section-heading").forEach((sectionHeading) => {
      const section = sectionHeading.closest("section") || sectionHeading.parentElement;
      if (!section || section.closest(".hero, .page-hero, .case-hero")) return;
      const label = sectionHeading.querySelector(".eyebrow");
      const heading = sectionHeading.querySelector("h1, h2");
      const subtext = sectionHeading.querySelector("p:not(.eyebrow)");
      const lines = splitLines(heading);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 75%",
          end: "top 30%",
          toggleActions: "play none none none",
          once: true
        }
      });

      if (label) {
        tl.fromTo(
          label,
          { y: 20, opacity: 0, letterSpacing: "0.3em" },
          { y: 0, opacity: 1, letterSpacing: "0.1em", duration: 0.6, ease: "power2.out", overwrite: "auto" }
        );
      }
      if (lines.length) {
        tl.fromTo(
          lines,
          { y: 60, opacity: 0, clipPath: "inset(0 0 100% 0)" },
          { y: 0, opacity: 1, clipPath: "inset(0 0 0% 0)", duration: 0.9, ease: "power4.out", overwrite: "auto", stagger: 0.1 },
          "-=0.2"
        );
      }
      if (subtext) {
        tl.fromTo(subtext, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power2.out", overwrite: "auto" }, "-=0.5");
      }
    });
  }

  function animateWordReveal(hasScrollTrigger) {
    if (!hasScrollTrigger) return;
    const section = document.querySelector(".big-statement");
    const words = gsap.utils.toArray(".word-reveal .word");
    if (!section || !words.length) return;

    section.classList.add("gsap-loading");
    gsap.set(words, { "--word-fill": "0%" });
    const groups = [];
    for (let index = 0; index < words.length; index += 3) {
      groups.push(words.slice(index, index + 3));
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => {
          const totalWords = section.querySelectorAll(".word").length;
          return `+=${Math.max(totalWords * 80, window.innerHeight * 1.2)}`;
        },
        scrub: 0.3,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        refreshPriority: 2,
        invalidateOnRefresh: true,
        onLeave: () => {
          gsap.set(words, { "--word-fill": "100%", color: "", immediateRender: true });
        },
        onEnterBack: () => {},
        onLeaveBack: () => {
          gsap.set(words, { "--word-fill": "0%", color: "", immediateRender: true });
        }
      }
    });

    const st = tl.scrollTrigger;
    if (st) {
      const currentProgress = st.progress;
      const totalWords = words.length;
      words.forEach((word, index) => {
        const wordProgress = totalWords > 1 ? index / (totalWords - 1) : 1;
        gsap.set(word, {
          "--word-fill": wordProgress <= currentProgress ? "100%" : "0%",
          color: wordProgress <= currentProgress ? "#0d0d0d" : "",
          immediateRender: true
        });
      });

      if (currentProgress >= 1) {
        gsap.set(words, { "--word-fill": "100%", color: "#0d0d0d", immediateRender: true });
      }

      if (currentProgress <= 0) {
        gsap.set(words, { "--word-fill": "0%", color: "", immediateRender: true });
      }
    }

    groups.forEach((group, index) => {
      tl.to(group, { "--word-fill": "100%", duration: 0.3, ease: "none", overwrite: "auto" }, index * 0.22);
    });

    requestAnimationFrame(() => {
      section.classList.remove("gsap-loading");
    });
  }

  function initHorizontalServices(hasScrollTrigger) {
    if (!hasScrollTrigger) return;
    const section = document.querySelector(".process-section");
    const track = section?.querySelector(".process-track");
    const cards = track ? gsap.utils.toArray(track.querySelectorAll(".feature-card")) : [];
    if (!section || !track || cards.length < 2) return;
    const setLogoCursor = (active) => document.body.classList.toggle("is-logo-cursor", active);
    if (!desktopMotion.matches) {
      section.classList.remove("is-native-scroll", "is-logo-handoff");
      setLogoCursor(false);
      section.classList.add("is-mobile-horizontal");
      const getMobileScrollAmount = () => Math.max(0, track.scrollWidth - window.innerWidth);

      gsap.set(track, { x: 0, y: 0, clearProps: "backgroundColor" });
      gsap.set(cards, { opacity: 1, y: 0, scale: 1, visibility: "visible", clearProps: "backgroundColor,borderRadius,boxShadow,minHeight,justifyContent" });

      gsap.to(track, {
        x: () => -getMobileScrollAmount(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => "+=" + Math.max(getMobileScrollAmount() * 0.72 + window.innerHeight * 0.12, window.innerHeight * 0.52),
          pin: true,
          scrub: true,
          anticipatePin: 0.8,
          refreshPriority: 1,
          invalidateOnRefresh: true,
          onLeave: () => setLogoCursor(false),
          onLeaveBack: () => {
            setLogoCursor(false);
            gsap.set(track, { x: 0 });
          }
        }
      });
      return;
    }

    // Calculate how far we need to scroll horizontally
    const getScrollAmount = () => track.scrollWidth - window.innerWidth;

    const lastCard = cards[cards.length - 1];
    const initialCards = cards.slice(0, 2);
    const revealCards = cards.slice(2, -1);

    gsap.set(initialCards, { opacity: 1, y: 0, scale: 1 });
    gsap.set(revealCards, { opacity: 0, y: 60, scale: 0.92 });
    gsap.set(lastCard, { opacity: 1, y: 0, scale: 1, visibility: "visible" });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => "+=" + (getScrollAmount() * 0.72 + window.innerHeight * 0.55),
        pin: true,
        scrub: true,
        anticipatePin: 1,
        refreshPriority: 1,
        invalidateOnRefresh: true,
        onLeave: () => setLogoCursor(false),
        onLeaveBack: () => setLogoCursor(false),
        onRefreshInit: () => setLogoCursor(false)
      }
    });

    revealCards.forEach((card, index) => {
      const startPos = (index + 2) / cards.length;
      const revealDuration = 0.15; // portion of timeline each card takes to reveal
      tl.fromTo(
        card,
        { opacity: 0, y: 60, scale: 0.92 },
        { opacity: 1, y: 0, scale: 1, duration: revealDuration * 0.7, ease: "power3.out" },
        startPos * 0.6 // stagger start so cards overlap slightly
      );
    });

    // Horizontal scroll of the track across the first part of timeline
    tl.to(track, {
      x: () => -getScrollAmount(),
      ease: "none",
      duration: 1
    }, 0);

    // Final logo handoff into the Client stories section.
    const otherCards = cards.slice(0, cards.length - 1);
    const logoImg = lastCard.querySelector(".logo-transition-img");
    const logoStage = section.querySelector(".process-logo-stage");
    const stageLogo = logoStage?.querySelector("img");
    const darkBg = getComputedStyle(document.documentElement).getPropertyValue("--ink-dark").trim() || "#0a0d12";

    tl.call(() => {
      section.classList.add("is-logo-handoff");
      setLogoCursor(true);
    }, null, 1.14);
    tl.call(() => {
      section.classList.remove("is-logo-handoff");
      setLogoCursor(false);
    }, null, 1.04);

    tl.to(otherCards, {
      opacity: 0,
      scale: 0.94,
      visibility: "hidden",
      duration: 0.24,
      ease: "power2.out"
    }, 1.15);

    tl.to(lastCard, {
      backgroundColor: darkBg,
      boxShadow: "none",
      borderRadius: 0,
      duration: 0.24,
      ease: "power2.inOut"
    }, 1.15);

    tl.to(section, {
      backgroundColor: darkBg,
      duration: 0.24,
      ease: "power2.inOut"
    }, 1.15);

    tl.to(track, {
      backgroundColor: darkBg,
      duration: 0.24,
      ease: "power2.inOut"
    }, 1.15);

    if (logoStage) {
      tl.fromTo(logoStage, {
        opacity: 0
      }, {
        opacity: 1,
        duration: 0.16,
        ease: "power2.out"
      }, 1.15);
    }

    if (stageLogo) {
      tl.fromTo(stageLogo, {
        y: 0,
        scale: 0.72,
        opacity: 0
      }, {
        y: 0,
        opacity: 1,
        scale: 1.12,
        duration: 0.2,
        ease: "power3.out"
      }, 1.16);

      tl.to(stageLogo, {
        y: -180,
        opacity: 0,
        scale: 1.08,
        duration: 0.28,
        ease: "none"
      }, 1.48);
    }

    if (logoImg) {
      tl.to(lastCard, {
        minHeight: () => `${window.innerHeight}px`,
        justifyContent: "center",
        duration: 0.24,
        ease: "power2.inOut"
      }, 1.15);

      tl.to(track, {
        y: () => -Math.max(window.innerHeight * 0.16, 96),
        duration: 0.28,
        ease: "none"
      }, 1.5);

      tl.set(logoImg, { opacity: 1 }, 0);
    }
  }

  function animateCards(hasScrollTrigger) {
    const storyAndWork = gsap.utils.toArray(".story-card, .work-card");
    storyAndWork.forEach((card, index) => {
      gsap.fromTo(
        card,
        { y: 80, opacity: 0, scale: 0.96 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.9,
          ease: "power3.out",
          overwrite: "auto",
          delay: (index % 2) * 0.15,
          scrollTrigger: hasScrollTrigger ? { trigger: card, start: "top 85%", toggleActions: "play none none none", once: true } : null
        }
      );

      const media = card.querySelector("img, video");
      if (media) {
        card.addEventListener("mouseenter", () => gsap.to(media, { scale: 1.05, duration: 0.5, ease: "power2.out" }));
        card.addEventListener("mouseleave", () => gsap.to(media, { scale: 1, duration: 0.5, ease: "power2.out" }));
      }
    });

    gsap.utils.toArray(".feature-card").forEach((card, index) => {
      if (hasScrollTrigger && card.closest(".process-section")) return;
      gsap.fromTo(
        card,
        { y: 50, opacity: 0, scale: 0.97 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "power3.out",
          overwrite: "auto",
          delay: index * 0.08,
          scrollTrigger: hasScrollTrigger ? { trigger: card, start: "top 86%", toggleActions: "play none none none", once: true } : null
        }
      );
    });

    gsap.utils.toArray(".service-card").forEach((card, index) => {
      const row = Math.floor(index / 3);
      const col = index % 3;
      gsap.fromTo(
        card,
        { y: 60, opacity: 0, scale: 0.97 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.7,
          ease: "power3.out",
          overwrite: "auto",
          delay: col * 0.1 + row * 0.05,
          scrollTrigger: hasScrollTrigger ? { trigger: card, start: "top 88%", toggleActions: "play none none none", once: true } : null
        }
      );
      card.addEventListener("mouseenter", () =>
        gsap.to(card, { y: -6, boxShadow: "0 20px 40px rgba(0,0,0,0.12)", duration: 0.3, ease: "power2.out" })
      );
      card.addEventListener("mouseleave", () =>
        gsap.to(card, { y: 0, boxShadow: "0 1px 0 rgba(10, 13, 18, 0.08)", duration: 0.3, ease: "power2.out" })
      );
    });
  }

  function animatePricing(hasScrollTrigger) {
    const cards = document.querySelectorAll(".price-card");
    if (!cards.length) return;
    const tl = gsap.timeline({
      scrollTrigger: hasScrollTrigger ? { trigger: cards[0].closest("section") || cards[0], start: "top 70%", toggleActions: "play none none none" } : null
    });
    tl.fromTo(cards, { y: 70, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", stagger: { amount: 0.4, from: "center" } });
    tl.fromTo(
      ".price-card li",
      { x: -20, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.4, ease: "power2.out", stagger: 0.06 },
      "-=0.3"
    );
  }

  function animateTestimonials(hasScrollTrigger) {
    gsap.utils.toArray(".quote-card").forEach((card, index) => {
      gsap.fromTo(
        card,
        { y: 50, opacity: 0, rotateX: 5 },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: 0.8,
          ease: "power3.out",
          overwrite: "auto",
          delay: (index % 3) * 0.12,
          scrollTrigger: hasScrollTrigger ? { trigger: card, start: "top 90%", toggleActions: "play none none none", once: true } : null
        }
      );
    });
  }

  function initFaq(hasScrollTrigger) {
    document.querySelectorAll(".faq-list article").forEach((item, index) => {
      const question = item.querySelector("button");
      const answer = item.querySelector("div");
      const icon = item.querySelector("button span");
      if (!question || !answer) return;

      gsap.set(answer, { height: 0, opacity: 0, overflow: "hidden", maxHeight: "none" });
      if (index === 0) {
        item.classList.add("is-open");
        gsap.set(answer, { height: "auto", opacity: 1 });
        gsap.set(icon, { rotation: 45 });
      }

      question.addEventListener("click", () => {
        const isOpen = item.classList.contains("is-open");
        document.querySelectorAll(".faq-list article.is-open").forEach((openItem) => {
          openItem.classList.remove("is-open");
          gsap.to(openItem.querySelector("div"), { height: 0, opacity: 0, duration: 0.4, ease: "power2.inOut" });
          gsap.to(openItem.querySelector("button span"), { rotation: 0, duration: 0.3, ease: "power2.inOut" });
        });

        if (!isOpen) {
          item.classList.add("is-open");
          gsap.set(answer, { height: "auto" });
          const autoHeight = answer.offsetHeight;
          gsap.fromTo(answer, { height: 0, opacity: 0 }, { height: autoHeight, opacity: 1, duration: 0.5, ease: "power3.out" });
          gsap.to(icon, { rotation: 45, duration: 0.3, ease: "back.out(1.5)" });
        }
      });

      gsap.fromTo(
        item,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power2.out",
          overwrite: "auto",
          delay: index * 0.07,
          scrollTrigger: hasScrollTrigger ? { trigger: item, start: "top 88%", toggleActions: "play none none none", once: true } : null
        }
      );
    });
  }

  function animateAboutAndCta(hasScrollTrigger) {
    const founder = document.querySelector(".founder-section, .about-split");
    if (founder) {
      const photo = founder.querySelector(".founder-media, .about-media");
      const text = founder.querySelector(".founder-copy, .about-copy");
      const tl = gsap.timeline({
        scrollTrigger: hasScrollTrigger ? { trigger: founder, start: "top 65%", toggleActions: "play none none none", once: true } : null
      });
      if (photo) tl.fromTo(photo, { x: -60, opacity: 0, scale: 0.97 }, { x: 0, opacity: 1, scale: 1, duration: 1, ease: "power3.out", overwrite: "auto" });
      if (text) {
        tl.fromTo(text.children, { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, ease: "power3.out", overwrite: "auto", stagger: 0.1 }, "-=0.7");
      }
    }

    document.querySelectorAll(".final-cta").forEach((cta) => {
      const lines = splitLines(cta.querySelector("h2"));
      const button = cta.querySelector(".button");
      const tl = gsap.timeline({
        scrollTrigger: hasScrollTrigger ? { trigger: cta, start: "top 70%", toggleActions: "play none none none", once: true } : null
      });
      if (lines.length) {
        tl.fromTo(
          lines,
          { y: 50, opacity: 0, clipPath: "inset(0 0 100% 0)" },
          { y: 0, opacity: 1, clipPath: "inset(0 0 0% 0)", duration: 0.9, ease: "power4.out", stagger: 0.12 }
        );
      }
      if (button) {
        tl.fromTo(button, { y: 30, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" }, "-=0.4");
      }
    });
  }

  function initParallaxAndCounters(hasScrollTrigger) {
    if (!hasScrollTrigger) return;
    gsap.utils.toArray(".story-card video, .work-card img, .gallery-band img").forEach((img) => {
      const trigger = img.closest(".story-card, .work-card, figure") || img;
      gsap.fromTo(img, { y: -30 }, { y: 30, ease: "none", scrollTrigger: { trigger, start: "top bottom", end: "bottom top", scrub: true } });
    });

    gsap.utils.toArray(".metric strong").forEach((stat) => {
      const text = stat.textContent.trim();
      const match = text.match(/^([^0-9]*)([0-9]+)(.*)$/);
      if (!match) return;
      const [, prefix, rawNumber, suffix] = match;
      const target = parseInt(rawNumber, 10);
      gsap.fromTo(
        { val: 0 },
        { val: target },
        {
          val: target,
          duration: 2,
          ease: "power2.out",
          scrollTrigger: { trigger: stat, start: "top 80%", toggleActions: "play none none none" },
          onUpdate() {
            stat.textContent = `${prefix}${Math.round(this.targets()[0].val)}${suffix}`;
          }
        }
      );
    });
  }

  function initMarquees() {
    document.querySelectorAll(".marquee-track, .logo-marquee div").forEach((track) => {
      const distance = track.scrollWidth / 2 || track.offsetWidth / 2;
      if (!distance) return;
      const tween = gsap.to(track, {
        x: -distance,
        duration: 35,
        ease: "none",
        repeat: -1,
        modifiers: {
          x: gsap.utils.unitize((x) => parseFloat(x) % distance)
        }
      });
      track.addEventListener("mouseenter", () => tween.pause());
      track.addEventListener("mouseleave", () => tween.resume());
    });
  }

  function initFooter(hasScrollTrigger) {
    document.querySelectorAll(".site-footer").forEach((footer) => {
      const logo = footer.querySelector("img");
      const links = footer.querySelectorAll("nav a");
      const copyright = footer.querySelector("p");
      const tl = gsap.timeline({
        scrollTrigger: hasScrollTrigger ? { trigger: footer, start: "top 85%", toggleActions: "play none none none" } : null
      });
      if (logo) tl.fromTo(logo, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" });
      if (links.length) tl.fromTo(links, { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out", stagger: 0.07 }, "-=0.3");
      if (copyright) tl.fromTo(copyright, { opacity: 0 }, { opacity: 1, duration: 0.5 }, "-=0.2");
    });
  }

  function initCursor() {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const dot = document.querySelector(".cursor-dot");
    const ring = document.querySelector(".cursor-ring");
    if (!dot || !ring) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    gsap.set(dot, { xPercent: 0, yPercent: 0 });
    gsap.set(ring, { xPercent: 0, yPercent: 0 });
    window.addEventListener("mousemove", (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      gsap.to(dot, { x: mouseX, y: mouseY, duration: 0.05, ease: "none" });
    });

    gsap.ticker.add(() => {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      gsap.set(ring, { x: ringX, y: ringY });
    });

    document.querySelectorAll("a, button, .story-card, .work-card, .faq-list button").forEach((el) => {
      el.addEventListener("mouseenter", () => gsap.to(dot, { scale: 1.08, duration: 0.18, ease: "power2.out" }));
      el.addEventListener("mouseleave", () => gsap.to(dot, { scale: 1, duration: 0.18, ease: "power2.out" }));
    });

    document.querySelectorAll("[data-copy-email]").forEach((emailButton) => {
      const email = emailButton.getAttribute("data-copy-email") || emailButton.textContent.trim();

      emailButton.addEventListener("mouseenter", () => {
        ring.dataset.cursorLabel = "Copy email ID";
        ring.classList.add("has-label");
        gsap.to(ring, { opacity: 1, duration: 0.18, ease: "power2.out" });
        gsap.to(dot, { scale: 1.08, duration: 0.18, ease: "power2.out" });
      });

      emailButton.addEventListener("mouseleave", () => {
        ring.classList.remove("has-label");
        ring.dataset.cursorLabel = "";
        emailButton.classList.remove("is-copied");
        gsap.to(ring, { opacity: 0, duration: 0.18, ease: "power2.out" });
        gsap.to(dot, { scale: 1, duration: 0.18, ease: "power2.out" });
      });

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
        ring.dataset.cursorLabel = "Copied";
      });
    });
  }

  function clearStuckRevealStates(scope = document) {
    scope.querySelectorAll(".reveal, .split-line").forEach((el) => {
      const style = getComputedStyle(el);
      const opacity = Number(style.opacity || 1);
      const rect = el.getBoundingClientRect();
      const isNearViewport = rect.bottom > -window.innerHeight * 0.35 && rect.top < window.innerHeight * 1.35;
      if (!isNearViewport || opacity > 0.12) return;
      el.style.opacity = "1";
      el.style.transform = "none";
      el.style.clipPath = "none";
    });
  }

  function initPageTransitions() {
    const overlay = document.createElement("div");
    overlay.className = "page-transition-overlay";
    document.body.appendChild(overlay);
    gsap.fromTo(overlay, { scaleY: 1, transformOrigin: "top center" }, { scaleY: 0, duration: 0.6, ease: "power3.inOut", delay: 0.1 });

    document.querySelectorAll("a[href]").forEach((link) => {
      link.addEventListener("click", (event) => {
        const rawHref = link.getAttribute("href");
        if (!rawHref || rawHref.startsWith("#") || link.target || link.hasAttribute("download")) return;
        const url = new URL(rawHref, window.location.href);
        if (url.origin !== window.location.origin || url.href === window.location.href) return;
        event.preventDefault();
        gsap.to(overlay, {
          scaleY: 1,
          transformOrigin: "bottom center",
          duration: 0.5,
          ease: "power3.inOut",
          onComplete: () => {
            window.location.href = url.href;
          }
        });
      });
    });
  }

  function initFallbackReveals() {
    if (window.gsap && !reduceMotion) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.style.opacity = 1;
          entry.target.style.transform = "translateY(0)";
          entry.target.style.transition = "opacity 0.65s ease, transform 0.65s ease";
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.18 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
  }

  function initAnimations() {
    lenis = initLenis();
    if (reduceMotion) {
      if (window.ScrollTrigger) ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      if (lenis && lenis.destroy) lenis.destroy();
      setVisible();
      return;
    }

    if (!window.gsap) {
      initFallbackReveals();
      return;
    }

    const hasScrollTrigger = Boolean(window.ScrollTrigger);
    if (hasScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.config({
        ignoreMobileResize: true,
        autoRefreshEvents: "visibilitychange,DOMContentLoaded,load"
      });
    }

    initPageTransitions();
    initPageLoad(hasScrollTrigger);
    animateSectionHeadings(hasScrollTrigger);
    animateWordReveal(hasScrollTrigger);
    initHorizontalServices(hasScrollTrigger);
    animateCards(hasScrollTrigger);
    animatePricing(hasScrollTrigger);
    animateTestimonials(hasScrollTrigger);
    initFaq(hasScrollTrigger);
    animateAboutAndCta(hasScrollTrigger);
    initParallaxAndCounters(hasScrollTrigger);
    initMarquees();
    initFooter(hasScrollTrigger);
    initCursor();

    if (hasScrollTrigger) {
      const refresh = () => ScrollTrigger.refresh(true);
      ScrollTrigger.refresh();

      window.setTimeout(refresh, 350);
      window.setTimeout(refresh, 1200);
      window.setTimeout(() => clearStuckRevealStates(), 2200);
      window.addEventListener("scrollend", () => clearStuckRevealStates(), { passive: true });
      let revealSettleTimer = null;
      window.addEventListener(
        "scroll",
        () => {
          window.clearTimeout(revealSettleTimer);
          revealSettleTimer = window.setTimeout(() => clearStuckRevealStates(), 180);
        },
        { passive: true }
      );

      document.querySelectorAll("img, video").forEach((media) => {
        const isReady = media.tagName === "IMG" ? media.complete : media.readyState >= 2;
        if (isReady) return;
        media.addEventListener("load", refresh, { once: true });
        media.addEventListener("loadedmetadata", refresh, { once: true });
        media.addEventListener("loadeddata", refresh, { once: true });
      });
    }
  }

  let animationsStarted = false;

  function startAnimationsOnce() {
    if (animationsStarted) return;
    animationsStarted = true;
    window.scrollTo(0, 0);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        try {
          initAnimations();
          if (window.ScrollTrigger) ScrollTrigger.refresh(true);
        } catch (error) {
          console.error("Animation startup failed", error);
          setVisible();
        }
      });
    });
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      if (document.readyState === "complete") {
        startAnimationsOnce();
      } else {
        window.addEventListener("load", startAnimationsOnce, { once: true });
      }
    });
  } else if (document.readyState === "complete") {
    startAnimationsOnce();
  } else {
    window.addEventListener("load", startAnimationsOnce, { once: true });
  }

  window.addEventListener("load", () => {
    startAnimationsOnce();
    if (window.ScrollTrigger) {
      window.setTimeout(() => ScrollTrigger.refresh(true), 150);
      window.setTimeout(() => ScrollTrigger.refresh(true), 800);
    }
  });
})();
