(function () {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);

  var pinHeight = document.getElementById("aboutPinHeight");
  var viewport = document.querySelector(".about__viewport");
  var stage = document.getElementById("aboutStage");
  var paragraphs = gsap.utils.toArray(".about__paragraph");
  if (!pinHeight || !viewport || !stage || !paragraphs.length) return;

  // Splits each paragraph into individual letters, each wrapped in its own
  // overflow-hidden mask — the mask clips the reveal, the inner span is
  // what GSAP rotates up into view. Letters are grouped word-by-word inside
  // an inline-block wrapper: without that grouping, adjacent inline-block
  // char-masks are free break points for the browser's line wrapper, so a
  // long word could get split mid-word onto two lines. Wrapping each word
  // as one atomic inline-block keeps line breaks at real word boundaries.
  paragraphs.forEach(function (p) {
    var text = p.textContent;
    p.textContent = "";
    var words = text.split(" ");
    words.forEach(function (word, wi) {
      var wordSpan = document.createElement("span");
      wordSpan.className = "about__word";
      word.split("").forEach(function (ch) {
        var mask = document.createElement("span");
        mask.className = "about__char-mask";
        var inner = document.createElement("span");
        inner.className = "about__char";
        inner.textContent = ch;
        mask.appendChild(inner);
        wordSpan.appendChild(mask);
      });
      p.appendChild(wordSpan);
      if (wi < words.length - 1) p.appendChild(document.createTextNode(" "));
    });
  });

  // Mobile: no pinning/scrubbing/stacking — that needs real page scroll
  // hijacked for a fixed viewport, which fights touch scrolling. Paragraphs
  // just stack normally in flow, but each still gets its per-letter
  // rotate-in, triggered independently as it scrolls into view.
  if (window.innerWidth <= 768) {
    gsap.set(paragraphs, { position: "static", opacity: 1 });
    stage.style.display = "flex";
    stage.style.flexDirection = "column";
    stage.style.gap = "1.5rem";

    paragraphs.forEach(function (p) {
      var chars = p.querySelectorAll(".about__char");
      gsap.fromTo(
        chars,
        { rotateX: -90, opacity: 0 },
        {
          rotateX: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.015,
          scrollTrigger: {
            trigger: p,
            start: "top 88%",
            once: true
          }
        }
      );
    });
    return;
  }

  // Desktop: stack every paragraph in the same spot; each rises into place
  // with a per-letter rotate-in, then (except the last) keeps rising and
  // fades out as the next one takes over.
  gsap.set(paragraphs, { position: "absolute", top: 0, left: 0, width: "100%", yPercent: 30, opacity: 0 });

  var CHAR_STAGGER = 0.015;
  var IN_DURATION = 0.4;
  var OUT_DURATION = 0.5;
  var GAP = 0.3;

  // A long paragraph's letters take longer to finish staggering in than a
  // short one's — each paragraph needs its own slice of timeline time
  // proportional to its own character count, or a later paragraph's
  // animations start (and even collide with) an earlier one's before its
  // letters have actually finished appearing.
  var revealSpans = paragraphs.map(function (p) {
    return p.querySelectorAll(".about__char").length * CHAR_STAGGER + IN_DURATION;
  });

  var totalSeconds = 0;
  revealSpans.forEach(function (span, i) {
    totalSeconds += span;
    if (i < paragraphs.length - 1) totalSeconds += OUT_DURATION + GAP;
  });

  // Scroll pixels per "second" of timeline time — keeps the pin length
  // proportional to how much is actually happening, instead of a flat
  // per-paragraph height that's too short for the long ones. Higher than it
  // looks like it needs to be: a low value here is what made the sequence
  // feel hair-trigger — a small scroll nudge would blow straight through
  // several paragraphs at once instead of settling on one at a time.
  pinHeight.style.height = Math.round(totalSeconds * 320) + "px";

  var tl = gsap.timeline({
    scrollTrigger: {
      trigger: pinHeight,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.6,
      pin: viewport
    }
  });

  var cursor = 0;
  paragraphs.forEach(function (p, i) {
    var chars = p.querySelectorAll(".about__char");
    var isLast = i === paragraphs.length - 1;

    tl.to(p, { yPercent: 0, opacity: 1, duration: IN_DURATION }, cursor);
    tl.fromTo(
      chars,
      { rotateX: -90, opacity: 0 },
      { rotateX: 0, opacity: 1, stagger: CHAR_STAGGER, duration: IN_DURATION },
      cursor
    );

    cursor += revealSpans[i];

    if (!isLast) {
      tl.to(p, { yPercent: -30, opacity: 0, duration: OUT_DURATION }, cursor);
      cursor += OUT_DURATION + GAP;
    }
  });
})();
