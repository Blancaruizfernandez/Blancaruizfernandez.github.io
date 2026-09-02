(function () {
  function scrollToContact() {
    var contact = document.querySelector(".skills__contact");
    var pinHeight = document.getElementById("skillsPinHeight");
    if (!contact) return;

    // Mobile (and any state where Skills isn't scroll-pinned): the contact
    // row sits in normal flow, so a direct scrollIntoView lands on it.
    if (window.innerWidth <= 768 || !pinHeight) {
      contact.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // Desktop: Skills is pinned for the whole height of #skillsPinHeight,
    // showing the same fixed viewport (pills + this contact row) across
    // that entire scroll range — scrollIntoView on the row itself would
    // target its true (mostly irrelevant) document position instead of
    // where the pin actually reveals it. Landing partway through the pin's
    // range — past the pills' reveal animation, inside the held/settled
    // part — puts the visitor exactly on the already-fully-visible section.
    var rect = pinHeight.getBoundingClientRect();
    var docTop = window.scrollY + rect.top;
    window.scrollTo({ top: docTop + rect.height * 0.85, behavior: "smooth" });
  }

  // Arriving fresh from another page via "about.html#contact".
  if (location.hash === "#contact") {
    window.addEventListener("load", function () {
      setTimeout(scrollToContact, 50);
    });
  }

  // Already on this page: intercept the nav click instead of letting the
  // browser try (and fail) to jump to a literal "#contact" element.
  document.querySelectorAll('a[href$="#contact"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      scrollToContact();
    });
  });
})();
