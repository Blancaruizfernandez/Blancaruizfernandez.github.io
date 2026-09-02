(function () {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);

  var pinHeight = document.getElementById("skillsPinHeight");
  var viewport = document.getElementById("skillsViewport");
  var pills = gsap.utils.toArray(".skills__pill");
  if (!pinHeight || !viewport || !pills.length) return;

  gsap.set(pills, { y: 70, opacity: 0 });

  // Mobile: no pin — scroll-jacking a fixed viewport fights touch
  // scrolling — but the pills still rise in, just triggered once as the
  // section scrolls into view instead of scrubbed to a held scroll range.
  if (window.innerWidth <= 768) {
    gsap.to(pills, {
      y: 0,
      opacity: 1,
      duration: 0.6,
      ease: "power3.out",
      stagger: { each: 0.06, from: "random" },
      scrollTrigger: {
        trigger: viewport,
        start: "top 85%",
        once: true
      }
    });
    return;
  }

  // Pinned the same way as the About text: .skills__viewport (100vh,
  // centered, opaque) stays fixed dead-center on screen for this whole
  // scroll stretch, so About is fully covered/gone the instant Skills
  // takes over instead of just peeking in at the edges. The pills rise in
  // over the first part of that stretch (real seconds, same technique as
  // about-reveal.js — stagger adds time beyond the base duration, so it has
  // to be counted explicitly), then the pinned, fully-revealed view holds
  // for a while — "stays centered until you scroll down further" — before
  // releasing on to the end of the page.
  var PILL_STAGGER = 0.06;
  var PILL_DURATION = 0.7;
  var revealSeconds = (pills.length - 1) * PILL_STAGGER + PILL_DURATION;
  var holdSeconds = revealSeconds * 1.6;
  var totalSeconds = revealSeconds + holdSeconds;

  pinHeight.style.height = Math.round(totalSeconds * 300) + "px";

  var tl = gsap.timeline({
    scrollTrigger: {
      trigger: pinHeight,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.6,
      pin: viewport
    }
  });

  tl.to(pills, {
    y: 0,
    opacity: 1,
    duration: PILL_DURATION,
    stagger: { each: PILL_STAGGER, from: "random" }
  }, 0);
})();
