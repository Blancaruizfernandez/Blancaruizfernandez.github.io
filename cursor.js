(function () {
  var isFinePointer = window.matchMedia && window.matchMedia("(pointer: fine)").matches;
  if (!isFinePointer) return;

  var cursor = document.getElementById("glassCursor");
  if (!cursor) return;

  document.documentElement.classList.add("has-glass-cursor");

  var deBlanca = document.querySelector(".de-blanca");

  var targetX = window.innerWidth / 2;
  var targetY = window.innerHeight / 2;
  var currentX = targetX;
  var currentY = targetY;
  var revealed = false;

  window.addEventListener(
    "mousemove",
    function (e) {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!revealed) {
        revealed = true;
        currentX = targetX;
        currentY = targetY;
        cursor.style.opacity = "1";
      }

      // "De ( )" has pointer-events:none (so it never blocks the scroll
      // section beneath it), so hover has to be checked by hand here.
      if (deBlanca) {
        var rect = deBlanca.getBoundingClientRect();
        var inside =
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom;
        cursor.classList.toggle("is-scroll", inside);
      }
    },
    { passive: true }
  );

  document.addEventListener("mouseleave", function () {
    cursor.style.opacity = "0";
  });
  document.addEventListener("mouseenter", function () {
    if (revealed) cursor.style.opacity = "1";
  });

  // Slight lag/smoothing gives the glass circle a soft, fluid follow.
  function tick() {
    currentX += (targetX - currentX) * 0.22;
    currentY += (targetY - currentY) * 0.22;
    cursor.style.transform = "translate3d(" + currentX + "px," + currentY + "px,0) translate(-50%,-50%)";
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  var interactiveSelector = "a, button, .status-badge, [role='button']";
  document.addEventListener(
    "mouseover",
    function (e) {
      if (e.target.closest && e.target.closest(interactiveSelector)) {
        cursor.classList.add("is-active");
      }
    },
    true
  );
  document.addEventListener(
    "mouseout",
    function (e) {
      if (e.target.closest && e.target.closest(interactiveSelector)) {
        cursor.classList.remove("is-active");
      }
    },
    true
  );
})();
