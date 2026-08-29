(function () {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);

  var section = document.querySelector(".projects");
  if (!section) return;

  var pinHeight = section.querySelector(".projects__pin-height");
  var viewport = section.querySelector(".projects__viewport");
  var images = gsap.utils.toArray(".projects__image");
  var leftTag = section.querySelector(".projects__tag--left span");
  var rightTag = section.querySelector(".projects__tag--right span");
  if (!images.length) return;

  // One full screen of scroll per project to move to the next.
  pinHeight.style.height = images.length * 100 + "vh";

  var currentIndex = 0;
  images[0].classList.add("is-active");
  if (leftTag) leftTag.textContent = images[0].dataset.left || "";
  if (rightTag) rightTag.textContent = images[0].dataset.right || "";

  // "Text swap sliding text" — the old tag slides up and fades, then the new
  // one slides up into place from below.
  function swapTag(el, text) {
    if (!el) return;
    gsap.to(el, {
      y: -14,
      opacity: 0,
      duration: 0.25,
      ease: "power2.in",
      onComplete: function () {
        el.textContent = text;
        gsap.fromTo(el, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: "power2.out" });
      }
    });
  }

  function goTo(index) {
    if (index === currentIndex) return;
    currentIndex = index;

    images.forEach(function (img, i) {
      img.classList.toggle("is-active", i === index);
    });

    var active = images[index];
    swapTag(leftTag, active.dataset.left || "");
    swapTag(rightTag, active.dataset.right || "");
  }

  ScrollTrigger.create({
    trigger: pinHeight,
    start: "top top",
    end: "bottom bottom",
    pin: viewport,
    onUpdate: function (self) {
      var index = Math.min(images.length - 1, Math.floor(self.progress * images.length));
      goTo(index);
    }
  });

  window.addEventListener("load", function () {
    ScrollTrigger.refresh();
  });
})();
