(function () {
  var badge = document.querySelector(".status-badge");
  if (!badge) return;

  badge.setAttribute("role", "button");
  badge.setAttribute("tabindex", "0");
  badge.setAttribute("aria-pressed", "false");

  function toggle() {
    var isDark = document.body.classList.toggle("dark-mode");
    badge.setAttribute("aria-pressed", String(isDark));
  }

  badge.addEventListener("click", toggle);
  badge.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  });
})();
