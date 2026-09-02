(function () {
  document.querySelectorAll(".project-detail__sound-toggle").forEach(function (btn) {
    var wrap = btn.closest(".project-detail__video-wrap");
    var video = wrap && wrap.querySelector("video");
    if (!video) return;

    btn.addEventListener("click", function () {
      video.muted = !video.muted;
      btn.setAttribute("aria-pressed", String(!video.muted));
      btn.setAttribute("aria-label", video.muted ? "Activar sonido" : "Silenciar");
    });
  });
})();
