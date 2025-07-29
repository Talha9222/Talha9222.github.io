// Smooth Scroll for Internal Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth"
    });
  });
});

// Initialize AOS (Animate on Scroll)
document.addEventListener("DOMContentLoaded", () => {
  AOS.init({
    duration: 1000,       // Animation duration in ms
    offset: 100,          // Offset from top to trigger animation
    once: true            // Only animate once
  });
});

console.log("🚀 Portfolio script loaded!");

