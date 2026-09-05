/**
 * Shraddha Tayade — Portfolio Script
 * Modular vanilla JS: nav, scroll, filters, copy email, animations
 */

(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------------------------------
   * Utilities
   * --------------------------------- */
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* ---------------------------------
   * 1. Current year
   * --------------------------------- */
  function initYear() {
    const el = qs("#current-year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* ---------------------------------
   * 2. Scroll progress indicator
   * --------------------------------- */
  function initScrollProgress() {
    const bar = qs("#scroll-progress");
    if (!bar) return;

    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = `${progress}%`;
    };

    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  /* ---------------------------------
   * 3. Navbar scroll effect
   * --------------------------------- */
  function initNavbarScroll() {
    const navbar = qs("#navbar");
    if (!navbar) return;

    const update = () => {
      navbar.classList.toggle("scrolled", window.scrollY > 40);
    };

    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  /* ---------------------------------
   * 4. Mobile hamburger menu
   * --------------------------------- */
  function initMobileMenu() {
    const toggle = qs("#nav-toggle");
    const menu = qs("#nav-menu");
    if (!toggle || !menu) return;

    const closeMenu = () => {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open navigation menu");
      menu.classList.remove("open");
      document.body.classList.remove("menu-open");
    };

    const openMenu = () => {
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close navigation menu");
      menu.classList.add("open");
      document.body.classList.add("menu-open");
    };

    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      if (isOpen) closeMenu();
      else openMenu();
    });

    // Close on nav link click
    qsa(".nav-link", menu).forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });

    // Close when resizing to desktop
    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) closeMenu();
    });
  }

  /* ---------------------------------
   * 5. Smooth scroll (native + offset)
   * --------------------------------- */
  function initSmoothScroll() {
    qsa('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        const hash = anchor.getAttribute("href");
        if (!hash || hash === "#") return;

        const target = qs(hash);
        if (!target) return;

        e.preventDefault();
        target.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start",
        });

        // Update URL without jump
        history.pushState(null, "", hash);
      });
    });
  }

  /* ---------------------------------
   * 6. Active navigation (IntersectionObserver)
   * --------------------------------- */
  function initActiveNav() {
    const sections = qsa("main section[id]");
    const links = qsa(".nav-link[data-section]");
    if (!sections.length || !links.length) return;

    const setActive = (id) => {
      links.forEach((link) => {
        const match = link.dataset.section === id;
        link.classList.toggle("active", match);
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-40% 0px -50% 0px",
        threshold: 0,
      }
    );

    sections.forEach((section) => observer.observe(section));
  }

  /* ---------------------------------
   * 7. Scroll reveal animations
   * --------------------------------- */
  function initReveal() {
    const items = qsa(".reveal");
    if (!items.length) return;

    if (prefersReducedMotion) {
      items.forEach((el) => el.classList.add("visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    items.forEach((el) => observer.observe(el));
  }

  /* ---------------------------------
   * 8. Project filtering
   * --------------------------------- */
  function initProjectFilters() {
    const buttons = qsa(".filter-btn");
    const cards = qsa(".project-card");
    if (!buttons.length || !cards.length) return;

    const FILTER_MAP = {
      all: null,
      java: "java",
      spring: "spring",
      fullstack: "fullstack",
      aiml: "aiml",
    };

    const applyFilter = (filterKey) => {
      const category = FILTER_MAP[filterKey];

      cards.forEach((card) => {
        const cats = (card.dataset.categories || "").split(/\s+/);
        const match = !category || cats.includes(category);

        // Cancel any pending hide timeout from a previous filter click
        if (card._filterTimer) {
          window.clearTimeout(card._filterTimer);
          card._filterTimer = null;
        }

        if (prefersReducedMotion) {
          card.classList.toggle("is-hidden", !match);
          card.classList.remove("filtering-out");
          return;
        }

        if (match) {
          card.classList.remove("is-hidden", "filtering-out");
        } else {
          card.classList.add("filtering-out");
          card._filterTimer = window.setTimeout(() => {
            card.classList.add("is-hidden");
            card.classList.remove("filtering-out");
            card._filterTimer = null;
          }, 280);
        }
      });
    };

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        applyFilter(btn.dataset.filter || "all");
      });
    });
  }

  /* ---------------------------------
   * 9. Copy email
   * --------------------------------- */
  function initCopyEmail() {
    const btn = qs("#copy-email");
    const feedback = qs("#copy-feedback");
    if (!btn) return;

    const email = btn.dataset.email || "tayadeshra0203@gmail.com";

    const showFeedback = (msg) => {
      if (!feedback) return;
      feedback.textContent = msg;
      window.setTimeout(() => {
        feedback.textContent = "";
      }, 2500);
    };

    btn.addEventListener("click", async () => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(email);
        } else {
          // Fallback for file:// context
          const ta = document.createElement("textarea");
          ta.value = email;
          ta.setAttribute("readonly", "");
          ta.style.position = "absolute";
          ta.style.left = "-9999px";
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
        }
        showFeedback("Email copied to clipboard.");
        btn.textContent = "Copied!";
        window.setTimeout(() => {
          btn.textContent = "Copy Email";
        }, 2000);
      } catch {
        showFeedback("Could not copy. Please copy manually: " + email);
      }
    });
  }

  /* ---------------------------------
   * 10. Back to top
   * --------------------------------- */
  function initBackToTop() {
    const btn = qs("#back-to-top");
    if (!btn) return;

    const update = () => {
      btn.classList.toggle("visible", window.scrollY > 500);
    };

    window.addEventListener("scroll", update, { passive: true });
    update();

    btn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    });
  }

  /* ---------------------------------
   * 11. Subtle typing animation (hero title)
   * --------------------------------- */
  function initTyping() {
    const target = qs("#typing-target");
    if (!target) return;

    const fullText = "Java Full Stack Developer";
    target.textContent = prefersReducedMotion ? fullText : "";

    if (prefersReducedMotion) return;

    let i = 0;
    const typeNext = () => {
      if (i <= fullText.length) {
        target.textContent = fullText.slice(0, i);
        i += 1;
        window.setTimeout(typeNext, 55);
      }
    };

    // Slight delay so hero feels intentional
    window.setTimeout(typeNext, 400);
  }

  /* ---------------------------------
   * 12. Hero 3D mouse parallax
   * --------------------------------- */
  function initHeroParallax() {
    const scene = qs("#hero-3d-scene");
    const visual = qs("#hero-visual");
    if (!scene || !visual || prefersReducedMotion) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let raf = null;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const render = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      scene.style.transform = `rotateY(${currentX}deg) rotateX(${currentY}deg)`;
      raf = requestAnimationFrame(render);
    };

    visual.addEventListener("mousemove", (e) => {
      const rect = visual.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = px * 14;
      targetY = -py * 10;
    });

    visual.addEventListener("mouseleave", () => {
      targetX = 0;
      targetY = 0;
    });

    raf = requestAnimationFrame(render);
  }

  /* ---------------------------------
   * 13. Card 3D tilt on hover
   * --------------------------------- */
  function initCardTilt() {
    if (prefersReducedMotion) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const cards = qsa(
      ".skill-card, .project-card, .achievement-card, .snapshot-card, .timeline-card.glass"
    );

    cards.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const rotateY = (x - 0.5) * 12;
        const rotateX = (0.5 - y) * 10;
        card.classList.add("tilt-active");
        card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
      });

      card.addEventListener("mouseleave", () => {
        card.classList.remove("tilt-active");
        card.style.transform = "";
      });
    });
  }

  /* ---------------------------------
   * Init all modules
   * --------------------------------- */
  function init() {
    initYear();
    initScrollProgress();
    initNavbarScroll();
    initMobileMenu();
    initSmoothScroll();
    initActiveNav();
    initReveal();
    initProjectFilters();
    initCopyEmail();
    initBackToTop();
    initTyping();
    initHeroParallax();
    initCardTilt();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
