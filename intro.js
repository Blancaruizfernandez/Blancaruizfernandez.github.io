(function () {
  var words = document.querySelectorAll(".logo, .nav-links .nav-link");
  var deBlanca = document.querySelector(".de-blanca");

  if (typeof gsap === "undefined") {
    // GSAP failed to load — reveal everything immediately rather than
    // leaving the header stuck at opacity:0.
    words.forEach(function (el) { el.style.opacity = 1; });
    if (deBlanca) deBlanca.style.opacity = 1;
    return;
  }

  gsap.set(words, { y: -28 });

  var tl = gsap.timeline();

  // Header words drop in one by one with a real bounce. Opacity fades in on
  // its own quick ramp — bounce.out isn't monotonic, so tying opacity to it
  // directly makes the text flicker/dim on every mid-bounce dip.
  tl.to(words, { opacity: 1, duration: 0.35, ease: "power1.out", stagger: 0.15 }, 0);
  tl.to(words, { y: 0, duration: 0.9, ease: "bounce.out", stagger: 0.15 }, 0);

  // "De ( )" only shows up once the header has settled in.
  if (deBlanca) {
    tl.to(deBlanca, { opacity: 1, duration: 0.8, ease: "power2.out" }, ">0.1");
  }
})();
