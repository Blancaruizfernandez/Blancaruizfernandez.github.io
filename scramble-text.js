(function () {
  if (typeof gsap === "undefined" || !gsap.plugins || !gsap.plugins.scrambleText) {
    if (typeof gsap !== "undefined" && typeof ScrambleTextPlugin !== "undefined") {
      gsap.registerPlugin(ScrambleTextPlugin);
    } else {
      return;
    }
  }

  var links = document.querySelectorAll(".nav-links .nav-link");

  links.forEach(function (link) {
    var originalText = link.textContent;

    link.addEventListener("mouseenter", function () {
      gsap.to(link, {
        duration: 0.8,
        scrambleText: {
          text: originalText,
          chars: "lowerCase",
          revealDelay: 0.25,
          speed: 0.35
        },
        ease: "none"
      });
    });
  });
})();
