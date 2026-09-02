(function () {
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
