// Smooth scroll for in-page anchors
document.addEventListener("click", (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const target = document.querySelector(a.getAttribute("href"));
  if (target) {
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth" });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  // Initialize AOS (if library loaded)
  if (window.AOS) {
    AOS.init({ duration: 1000, offset: 100, once: true });
  }

  // Pause autoplay videos when off-screen (saves CPU)
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(({ isIntersecting, target }) => {
      const vid = target;
      if (vid.hasAttribute("autoplay")) {
        if (isIntersecting) vid.play().catch(() => {});
        else vid.pause();
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(".media-box video").forEach(v => observer.observe(v));

  // --- Maximize (fullscreen) for Game Dev videos only ---
  const gameDevVideos = document.querySelectorAll("#game-dev .media-box video");
  if (gameDevVideos.length) {
    const reqFS = (el) =>
      (el.requestFullscreen ||
       el.webkitRequestFullscreen ||
       el.webkitEnterFullscreen || // iOS Safari video
       el.msRequestFullscreen ||
       el.mozRequestFullScreen)?.call(el);

    const exitFS = () =>
      (document.exitFullscreen ||
       document.webkitExitFullscreen ||
       document.msExitFullscreen ||
       document.mozCancelFullScreen)?.call(document);

    const toggleFullscreen = (video) => {
      // If native iOS method exists (webkitEnterFullscreen) and no fullscreenElement,
      // just call it (exits via system controls)
      if (!document.fullscreenElement && video.webkitEnterFullscreen) {
        try { video.webkitEnterFullscreen(); } catch(_) {}
        return;
      }
      if (!document.fullscreenElement) reqFS(video);
      else exitFS();
    };

    gameDevVideos.forEach((video) => {
      const box = video.closest(".media-box");
      if (!box) return;

      // Inject expand button
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "expand-btn";
      btn.setAttribute("aria-label", "Maximize video");
      btn.setAttribute("title", "Maximize");
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor"
            d="M9 3H3v6h2V6.41l4.29 4.3 1.42-1.42L6.41 5H9V3zm6 0v2h2.59l-4.3 4.29 1.42 1.42L19 6.41V9h2V3h-6zm-6 12-1.42 1.42L9.59 21H7v2h6v-6h-2v2.59L9 15zM19 15l-4.29 4.29 1.42 1.42L19 18.41V21h2v-6h-6v2h2.59L19 15z"/>
        </svg>
      `;
      box.appendChild(btn);

      // Button click -> fullscreen
      btn.addEventListener("click", () => toggleFullscreen(video));

      // Double-click video -> fullscreen
      video.addEventListener("dblclick", () => toggleFullscreen(video));
    });
  }
});

console.log("🚀 Portfolio script loaded!");
