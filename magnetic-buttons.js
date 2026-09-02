(function () {
  if (typeof gsap === "undefined") return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  var targets = document.querySelectorAll(".skills__pill, .project-detail__tag");
  if (!targets.length) return;

  // Magnetic hover, à la gsap.com/demos/magnetic-button-overwrite-modes: the
  // pill drifts toward the cursor as it moves inside it, then springs back
  // to rest on leave. overwrite:"auto" is what keeps this smooth — every
  // mousemove starts a new tween before the last one finishes, and "auto"
  // only kills the specific x/y properties that actually conflict instead
  // of the whole tween, so fast, repeated moves never fight each other or
  // stutter.
  var STRENGTH = 0.4;

  targets.forEach(function (el) {
    el.addEventListener("mousemove", function (e) {
      var rect = el.getBoundingClientRect();
      var relX = e.clientX - (rect.left + rect.width / 2);
      var relY = e.clientY - (rect.top + rect.height / 2);
      gsap.to(el, {
        x: relX * STRENGTH,
        y: relY * STRENGTH,
        duration: 0.6,
        ease: "power3.out",
        overwrite: "auto"
      });
    });

    el.addEventListener("mouseleave", function () {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.3)",
        overwrite: "auto"
      });
    });
  });
})();
