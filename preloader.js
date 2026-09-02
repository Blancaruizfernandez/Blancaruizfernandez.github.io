(function () {
  var el = document.getElementById("preloader");
  if (!el) return;

  var mark = el.querySelector(".preloader__mark");
  var sides = el.querySelectorAll(".preloader__side");

  function remove() {
    if (el.parentNode) el.parentNode.removeChild(el);
  }

  // GSAP failed to load — just cut it out rather than leaving the page
  // permanently covered by an opaque, un-animated block.
  if (typeof gsap === "undefined") {
    remove();
    return;
  }

  var tl = gsap.timeline({ onComplete: remove });

  // The (B) mark rises in first...
  tl.to(mark, { opacity: 1, y: 0, duration: 0.6, ease: "back.out(1.7)" }, 0);
  // ...then the side labels fade in while it holds...
  tl.to(sides, { opacity: 1, duration: 0.5, ease: "power2.out", stagger: 0.1 }, 0.45);
  // ...then the whole thing fades out, handing off to the page underneath.
  tl.to(el, { opacity: 0, duration: 0.6, ease: "power2.inOut" }, "+=0.4");
})();
