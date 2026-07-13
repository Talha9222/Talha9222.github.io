/* =========================================================
   TALHA AHMAD — PORTFOLIO
   No external deps. Native APIs only.
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Footer year ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Scroll reveal ---------- */
  const revealables = document.querySelectorAll(".reveal");
  if (reduceMotion) {
    revealables.forEach((el) => el.classList.add("is-in"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    revealables.forEach((el) => revealObserver.observe(el));
  }

  /* ---------- Animated stat counter ---------- */
  document.querySelectorAll(".count").forEach((el) => {
    const target = Number(el.dataset.to || 0);
    if (reduceMotion) {
      el.textContent = target;
      return;
    }
    const counter = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        counter.disconnect();
        const duration = 1100;
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.5 }
    );
    counter.observe(el);
  });

  /* ---------- Nav: stuck state + scroll progress ---------- */
  const nav = document.getElementById("nav");
  const progress = document.getElementById("navProgress");

  const onScroll = () => {
    if (nav) nav.classList.toggle("is-stuck", window.scrollY > 12);
    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      progress.style.width = `${pct}%`;
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Nav: mobile toggle ---------- */
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    navLinks.addEventListener("click", (e) => {
      if (e.target.tagName === "A") {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Nav: scroll spy ---------- */
  const sections = ["work", "games", "art", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const linkFor = (id) => document.querySelector(`.nav__links a[href="#${id}"]`);

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = linkFor(entry.target.id);
        if (!link) return;
        if (entry.isIntersecting) {
          document.querySelectorAll(".nav__links a").forEach((a) => a.classList.remove("is-active"));
          link.classList.add("is-active");
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => spy.observe(s));

  /* ---------- Project filters ---------- */
  const chips = document.querySelectorAll(".chip");
  const gameCards = document.querySelectorAll("#gameGrid .card");

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const filter = chip.dataset.filter;

      chips.forEach((c) => {
        c.classList.remove("is-active");
        c.setAttribute("aria-selected", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-selected", "true");

      gameCards.forEach((card) => {
        const tags = (card.dataset.tags || "").split(/\s+/);
        const show = filter === "all" || tags.includes(filter);
        card.classList.toggle("is-hidden", !show);
      });
    });
  });

  /* ---------- Videos: play on hover / in-view, pause otherwise ----------
     Autoplaying 12 videos at once is what makes portfolio pages feel heavy.
     Cards only play while hovered (desktop) or while centered in view (touch). */
  const isTouch = window.matchMedia("(hover: none)").matches;
  const cardVideos = document.querySelectorAll(".card__media video");

  const safePlay = (v) => v.play().catch(() => {});

  /* ---------- Poster replacement: self-generated first frame ----------
     No .webp posters. Instead each video seeks to ~0.1s so it paints a real
     frame while paused. A shimmer covers the media until that frame is ready,
     so a card can never sit as an empty black box. */
  const markReady = (video) => {
    video.closest(".card__media")?.classList.add("is-ready");
  };

  /* preload="metadata" often isn't enough data to paint a frame. Upgrade a
     video to full preload only once it's near the viewport — so we get real
     thumbnails without downloading all 12 files on page load. */
  const hydrate = new IntersectionObserver(
    (entries) => {
      entries.forEach(({ isIntersecting, target }) => {
        if (!isIntersecting) return;
        hydrate.unobserve(target);
        if (target.preload !== "auto") {
          target.preload = "auto";
          target.load();
        }
      });
    },
    { rootMargin: "300px 0px" }
  );
  cardVideos.forEach((v) => hydrate.observe(v));

  cardVideos.forEach((video) => {
    // Nudge off frame 0 — many encodes render black at exactly 0.
    const seekToFirstFrame = () => {
      if (video.currentTime === 0 && video.duration > 0.2) {
        try { video.currentTime = 0.1; } catch (_) {}
      }
    };

    if (video.readyState >= 2) {
      seekToFirstFrame();
      markReady(video);
    } else {
      video.addEventListener("loadeddata", () => {
        seekToFirstFrame();
        markReady(video);
      }, { once: true });
    }

    // Seeking to a frame counts as ready too.
    video.addEventListener("seeked", () => markReady(video), { once: true });

    // If a video fails to load entirely, drop the shimmer rather than
    // leaving it pulsing forever.
    video.addEventListener("error", () => markReady(video), { once: true });
  });

  // Images (stills) have no shimmer wrapper, but art cards do.
  document.querySelectorAll(".card__media img").forEach((img) => {
    const done = () => img.closest(".card__media")?.classList.add("is-ready");
    img.complete ? done() : img.addEventListener("load", done, { once: true });
    img.addEventListener("error", done, { once: true });
  });

  if (isTouch) {
    const vidObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ isIntersecting, target }) => {
          isIntersecting ? safePlay(target) : target.pause();
        });
      },
      { threshold: 0.55 }
    );
    cardVideos.forEach((v) => vidObserver.observe(v));
  } else {
    cardVideos.forEach((video) => {
      const card = video.closest(".card");
      if (!card) return;
      card.addEventListener("mouseenter", () => safePlay(video));
      card.addEventListener("mouseleave", () => {
        video.pause();
        // Rewind to the painted first frame, not 0 (which can render black).
        try { video.currentTime = 0.1; } catch (_) {}
      });
    });
  }

  /* ---------- Lightbox ---------- */
  const lightbox = document.getElementById("lightbox");
  const stage = document.getElementById("lightboxStage");
  const closeBtn = document.getElementById("lightboxClose");
  let lastFocused = null;

  const openLightbox = (src) => {
    if (!lightbox || !stage || !src) return;
    lastFocused = document.activeElement;
    stage.innerHTML = "";

    if (/\.(mp4|webm|mov)$/i.test(src)) {
      const v = document.createElement("video");
      v.src = src;
      v.controls = true;
      v.autoplay = true;
      v.loop = true;
      v.playsInline = true;
      stage.appendChild(v);
    } else {
      const img = document.createElement("img");
      img.src = src;
      img.alt = "";
      stage.appendChild(img);
    }

    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    closeBtn?.focus();
  };

  const closeLightbox = () => {
    if (!lightbox || !stage) return;
    lightbox.hidden = true;
    stage.innerHTML = "";
    document.body.style.overflow = "";
    lastFocused?.focus();
  };

  // Expand buttons on cards
  document.querySelectorAll(".card__expand").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const src = btn.closest("[data-media]")?.dataset.media;
      openLightbox(src);
    });
  });

  // Whole-card click (skip real links)
  document.querySelectorAll(".card[data-media], .still[data-media]").forEach((el) => {
    el.addEventListener("click", (e) => {
      if (e.target.closest("a") || e.target.closest("button")) return;
      openLightbox(el.dataset.media);
    });
  });

  closeBtn?.addEventListener("click", closeLightbox);
  lightbox?.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox && !lightbox.hidden) closeLightbox();
  });
});
