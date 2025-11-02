// Smooth Scroll for in-page anchors
document.addEventListener("click", (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const target = document.querySelector(a.getAttribute("href"));
  if (target) {
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth" });
  }
});

// Initialize AOS
document.addEventListener("DOMContentLoaded", () => {
  if (window.AOS) {
    AOS.init({ duration: 1000, offset: 100, once: true });
  }
});

// Click any video to toggle fullscreen
document.addEventListener("click", (e) => {
  const v = e.target.closest(".media-box video");
  if (!v) return;
  if (!document.fullscreenElement) {
    v.requestFullscreen?.().catch(() => {});
  } else {
    document.exitFullscreen?.();
  }
});

// Optional: pause autoplaying videos when off-screen (saves CPU)
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

console.log("🚀 Portfolio script loaded!");
