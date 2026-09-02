(function () {
  document.querySelectorAll(".project-detail__more").forEach(function (btn) {
    var extra = btn.previousElementSibling;
    if (!extra || !extra.classList.contains("project-detail__extra")) return;

    btn.addEventListener("click", function () {
      var isOpen = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!isOpen));
      btn.textContent = isOpen ? "+" : "−";
      extra.hidden = isOpen;
    });
  });
})();
