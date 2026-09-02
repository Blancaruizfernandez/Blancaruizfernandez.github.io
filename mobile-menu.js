(function () {
  // The hamburger button lives inside <header>, which is
  // mix-blend-mode:difference + isolation:isolate (so the logo/nav text
  // always contrasts against whatever scrolls behind it). A descendant can
  // never opt out of that — the whole header subtree is composited as one
  // unit and blended against the page. That's fine for text meant to
  // invert against any backdrop, but it means the hamburger's three lines
  // can never just be "black in light mode, white in dark mode" as long as
  // they're in there. Moving the button itself out to be a sibling of
  // <header> is what lets it show a plain --ink-based color instead —
  // Bootstrap's collapse toggle is wired by a delegated document-level
  // listener keyed off data-bs-toggle/data-bs-target, so relocating the
  // element doesn't break it.
  var toggler = document.querySelector(".navbar-toggler");
  var header = document.querySelector(".site-header");
  if (toggler && header && header.parentNode) {
    header.parentNode.insertBefore(toggler, header.nextSibling);
  }

  if (typeof bootstrap === "undefined") return;

  var menu = document.getElementById("mobileMenu");
  if (!menu) return;

  // Tapping a link inside the mobile menu should close the panel — but
  // unlike the close (x) button, these links must NOT use
  // data-bs-toggle="collapse": Bootstrap's collapse plugin calls
  // preventDefault() on any <a> that has it, which silently blocked
  // navigation entirely. Hiding the collapse here instead lets the
  // link's own default action (navigate, or contact-scroll.js's smooth
  // scroll) proceed normally.
  menu.querySelectorAll(".mobile-menu__link").forEach(function (link) {
    link.addEventListener("click", function () {
      var instance = bootstrap.Collapse.getInstance(menu);
      if (instance) instance.hide();
    });
  });
})();
