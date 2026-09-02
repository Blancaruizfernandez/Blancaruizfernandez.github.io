(function () {
  var section = document.querySelector(".projects");
  var viewport = document.getElementById("projectsViewport");
  var track = document.getElementById("projectsTrack");
  var tagLeft = document.getElementById("projectsTagLeft");
  var tagRight = document.getElementById("projectsTagRight");
  if (!section || !viewport || !track) return;

  var slides = Array.prototype.slice.call(track.querySelectorAll(".projects__slide"));
  var count = slides.length;
  if (!count) return;

  // Splits text into per-character spans and animates them in with a
  // stagger that starts at the middle character and ripples outward to
  // both ends — GSAP's "from: center" stagger does exactly that.
  function rollText(el, text) {
    if (!el) return;
    el.innerHTML = text
      .split("")
      .map(function (ch) {
        return '<span class="char">' + (ch === " " ? "&nbsp;" : ch) + "</span>";
      })
      .join("");
    var chars = el.querySelectorAll(".char");
    if (typeof gsap === "undefined") return;
    gsap.fromTo(
      chars,
      { opacity: 0, rotateX: -100, y: "40%" },
      {
        opacity: 1,
        rotateX: 0,
        y: "0%",
        duration: 0.5,
        ease: "power3.out",
        stagger: { each: 0.025, from: "center" }
      }
    );
  }

  function updateTags(index) {
    var active = slides[index];
    rollText(tagLeft, active.dataset.left || "");
    rollText(tagRight, active.dataset.right || "");
  }

  // Mobile: no infinite loop, no cylinder — but the stack still follows
  // the finger 1:1 while dragging (like a native vertical carousel)
  // instead of only reacting once a swipe crosses a distance threshold.
  if (window.innerWidth <= 768) {
    var stage = document.querySelector(".projects__stage");
    if (!stage) return;

    var mobileIndex = 0;
    var dragY = 0;
    var isTouching = false;
    var touchStartY = 0;
    var stageHeight = 0;

    function mod(n, m) {
      return ((n % m) + m) % m;
    }

    function measureMobile() {
      stageHeight = stage.getBoundingClientRect().height;
    }

    // Only the active slide plus its immediate neighbors are ever shown —
    // keeps at most 3 autoplaying videos in the DOM at once instead of all
    // of them, same spirit as the old single-slide-visible approach.
    function layoutMobile() {
      slides.forEach(function (slide, i) {
        var diff = i - mobileIndex;
        if (diff > count / 2) diff -= count;
        if (diff < -count / 2) diff += count;
        var within = Math.abs(diff) <= 1;
        slide.style.display = within ? "block" : "none";
        if (within) {
          slide.style.transform = "translateY(" + (diff * stageHeight + dragY) + "px)";
          slide.style.opacity = diff === 0 ? "1" : "0.35";
        }
      });
    }

    measureMobile();
    layoutMobile();
    updateTags(mobileIndex);

    stage.addEventListener(
      "touchstart",
      function (e) {
        isTouching = true;
        touchStartY = e.touches[0].clientY;
        dragY = 0;
        slides.forEach(function (s) {
          s.style.transition = "none";
        });
      },
      { passive: true }
    );

    stage.addEventListener(
      "touchmove",
      function (e) {
        if (!isTouching) return;
        dragY = e.touches[0].clientY - touchStartY;
        layoutMobile();
      },
      { passive: true }
    );

    stage.addEventListener(
      "touchend",
      function () {
        isTouching = false;
        slides.forEach(function (s) {
          s.style.transition = "transform 0.35s ease, opacity 0.35s ease";
        });

        var threshold = stageHeight * 0.18;
        if (Math.abs(dragY) > threshold) {
          mobileIndex = mod(mobileIndex + (dragY < 0 ? 1 : -1), count);
          updateTags(mobileIndex);
        }
        dragY = 0;
        layoutMobile();
      },
      { passive: true }
    );

    window.addEventListener("resize", function () {
      measureMobile();
      layoutMobile();
    });

    return;
  }

  // --- Desktop: infinite vertical loop + cylinder rotation ---

  var step = 0; // pixel distance from one slide's top to the next
  var current = 0; // smoothed scroll position (unbounded, wraps visually)
  var target = 0; // raw input accumulation (also unbounded)
  var lastActiveIndex = -1;
  var rafId = null;
  var isDragging = false;
  var dragStartY = 0;
  var dragStartTarget = 0;
  var dragMoved = 0;
  var idleTimeout = null;

  var RADIUS = 620; // px — cylinder radius; bigger = flatter/slower curve
  var ANGLE_PER_STEP = 34; // deg — rotation between two adjacent projects
  var MAX_VISIBLE_ANGLE = 95; // beyond this the card is edge-on/behind and hidden

  function mod(n, m) {
    return ((n % m) + m) % m;
  }

  function measure() {
    step = slides[0].getBoundingClientRect().height;
  }

  // Each slide is a card on the surface of a cylinder: the active one faces
  // the viewer flat (angle 0), and as the scroll position moves it rotates
  // out of frame on the X axis while receding in Z — that curling-away
  // motion is what reads as "cylindrical" rather than a straight scroll.
  function layout() {
    var totalHeight = step * count;
    slides.forEach(function (slide, i) {
      var raw = i * step - current;
      var wrapped = mod(raw + totalHeight / 2, totalHeight) - totalHeight / 2;
      var angle = (wrapped / step) * ANGLE_PER_STEP;
      var visible = Math.abs(angle) < MAX_VISIBLE_ANGLE;
      slide.style.transform =
        "translate(-50%, -50%) rotateX(" + -angle + "deg) translateZ(" + RADIUS + "px)";
      slide.style.left = "50%";
      slide.style.top = "50%";
      slide.style.opacity = visible ? String(Math.max(0, 1 - Math.abs(angle) / MAX_VISIBLE_ANGLE)) : "0";
      slide.style.pointerEvents = visible ? "auto" : "none";
      slide.style.zIndex = String(1000 - Math.round(Math.abs(angle)));
    });
  }

  function activeIndex() {
    return mod(Math.round(current / step), count);
  }

  function checkActiveChange() {
    var idx = activeIndex();
    if (idx !== lastActiveIndex) {
      lastActiveIndex = idx;
      updateTags(idx);
    }
  }

  function snapToNearest() {
    target = Math.round(target / step) * step;
  }

  function startLoop() {
    if (rafId === null) rafId = requestAnimationFrame(tick);
  }

  function tick() {
    var velocity = target - current;
    current += velocity * 0.14;

    layout();
    checkActiveChange();

    if (Math.abs(velocity) > 0.05) {
      rafId = requestAnimationFrame(tick);
    } else {
      current = target;
      layout();
      rafId = null;
    }
  }

  // Drag to navigate.
  viewport.addEventListener("pointerdown", function (e) {
    isDragging = true;
    dragMoved = 0;
    dragStartY = e.clientY;
    dragStartTarget = target;
    viewport.setPointerCapture(e.pointerId);
  });

  viewport.addEventListener("pointermove", function (e) {
    if (!isDragging) return;
    var delta = e.clientY - dragStartY;
    dragMoved = Math.max(dragMoved, Math.abs(delta));
    target = dragStartTarget - delta;
    startLoop();
  });

  function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    snapToNearest();
    startLoop();
  }

  // setPointerCapture (above) re-targets the click that follows a pointerup
  // to the viewport itself in some browsers, so the <a>'s own click never
  // fires there — navigation is done here by hand instead, using
  // elementFromPoint (unaffected by capture) to find the real target.
  viewport.addEventListener("pointerup", function (e) {
    var wasClick = isDragging && dragMoved <= 6;
    endDrag();
    if (wasClick) {
      var el = document.elementFromPoint(e.clientX, e.clientY);
      var slideEl = el && el.closest && el.closest(".projects__slide");
      if (slideEl) window.location.href = slideEl.getAttribute("href");
    }
  });
  viewport.addEventListener("pointercancel", endDrag);

  // The native click is only ever a leftover of the above — always
  // suppress it so a slide never navigates twice.
  slides.forEach(function (slide) {
    slide.addEventListener("click", function (e) {
      e.preventDefault();
    });
  });

  // The slider fully owns vertical scroll on this page — wheel input always
  // moves it, it never falls through to the browser's own page scroll.
  // Leaving the section happens through the nav links, not by scrolling.
  window.addEventListener(
    "wheel",
    function (e) {
      e.preventDefault();
      target += e.deltaY;
      startLoop();

      clearTimeout(idleTimeout);
      idleTimeout = setTimeout(function () {
        snapToNearest();
        startLoop();
      }, 150);
    },
    { passive: false }
  );

  window.addEventListener("resize", function () {
    measure();
  });

  measure();
  layout();
  lastActiveIndex = activeIndex();
  updateTags(lastActiveIndex);
})();
