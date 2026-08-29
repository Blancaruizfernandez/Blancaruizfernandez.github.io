(function () {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);

  var section = document.querySelector(".image-flow");
  if (!section) return;

  var pinHeight = section.querySelector(".image-flow__pin-height");
  var container = section.querySelector(".image-flow__container");
  var slot = section.querySelector(".de-blanca__slot");
  var blancaText = section.querySelector(".de-blanca__blanca");
  var mediaEls = gsap.utils.toArray(".image-flow__media");
  if (!mediaEls.length) return;

  var narrow = window.innerWidth < 576;
  var SLOT_REST_WIDTH = narrow ? 10 : 14;
  var SLOT_OPEN_WIDTH = narrow ? 260 : 520;
  var SLOT_CLOSED_WIDTH = narrow ? 195 : 290;

  // Slight fanned rotation per card, like a loose stack of photos.
  var rotations = [-7, 5, -4, 6, -9, 3];

  gsap.set(mediaEls, {
    xPercent: -50,
    yPercent: -50,
    scale: 0,
    opacity: 0,
    rotation: function (i) {
      return rotations[i % rotations.length];
    }
  });

  var tl = gsap.timeline({
    scrollTrigger: {
      trigger: pinHeight,
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
      pin: container
    }
  });

  // "De (" and ")" start closed together — open up right as the images
  // start stacking in, giving the whole sequence a "De (...)" frame.
  gsap.set(slot, { width: SLOT_REST_WIDTH });
  gsap.set(blancaText, { xPercent: -50, yPercent: -50, opacity: 0, y: 10 });
  tl.to(slot, { width: SLOT_OPEN_WIDTH, duration: 0.8, ease: "power2.out" }, 0);

  var ENTRANCE_STAGGER = 0.7;
  var ENTRANCE_DURATION = 1;
  var EXIT_STAGGER = 0.5;
  var EXIT_DURATION = 2.4;
  // Exit of the first card begins as soon as the 6th one shows up, so the
  // early cards are already marching upward while a second wave keeps
  // stacking on top — a continuous flow instead of two separate phases.
  var EXIT_BASE = 5 * ENTRANCE_STAGGER;

  // Phase 1 — each image bounces in and stacks on top of the last.
  mediaEls.forEach(function (el, i) {
    tl.fromTo(
      el,
      { y: 120, scale: 0, opacity: 0 },
      { y: 0, scale: 1, opacity: 1, duration: ENTRANCE_DURATION, ease: "back.out(2)" },
      i * ENTRANCE_STAGGER
    );
  });

  // Phase 2 — images leave upward with a shrinking, suction-like pull.
  // Long overlapping durations keep several cards visible at once, strung
  // out in a shrinking line as they rise off the top of the screen. Opacity
  // stays high for most of the trip and only fades right at the very end,
  // so the shrinking queue actually reads as visible cards, not a blur.
  mediaEls.forEach(function (el, i) {
    var start = EXIT_BASE + i * EXIT_STAGGER;
    tl.to(
      el,
      { y: "-140vh", scale: 0.1, rotation: "+=10", duration: EXIT_DURATION, ease: "power1.in" },
      start
    );
    tl.to(
      el,
      { opacity: 0, duration: EXIT_DURATION * 0.2, ease: "power1.in" },
      start + EXIT_DURATION * 0.8
    );
  });

  // As the last image finishes fading out, the parens close back down and
  // "Blanca" bounces into the gap — mirrors the opening move for symmetry.
  var lastExitStart = EXIT_BASE + (mediaEls.length - 1) * EXIT_STAGGER;
  var closeStart = lastExitStart + EXIT_DURATION * 0.9;
  tl.to(slot, { width: SLOT_CLOSED_WIDTH, duration: 0.8, ease: "power2.inOut" }, closeStart);
  tl.to(blancaText, { opacity: 1, y: 0, duration: 0.6, ease: "back.out(1.7)" }, closeStart + 0.3);

  // Images finish decoding after this script runs, which can shift layout —
  // refresh once everything (fonts, images) has actually loaded.
  window.addEventListener("load", function () {
    ScrollTrigger.refresh();
  });
})();
