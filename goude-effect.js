(function () {
  var root = document.getElementById("goudeEffect");
  var zone = document.getElementById("goudeZone");
  if (!root || !zone) return;

  var src = root.dataset.src;
  var imgNativeW = parseFloat(root.dataset.imgW);
  var imgNativeH = parseFloat(root.dataset.imgH);
  var zoneCenterPct = parseFloat(root.dataset.zoneCenter);
  var sourceHeightPct = parseFloat(root.dataset.zoneSourceHeight);
  var hCenterPct = root.dataset.hCenter ? parseFloat(root.dataset.hCenter) : 50;
  var vCenterPct = root.dataset.vCenter ? parseFloat(root.dataset.vCenter) : 50;
  var zoom = root.dataset.zoom ? parseFloat(root.dataset.zoom) : 1;
  var stripGap = parseFloat(root.dataset.stripGap);
  var restCount = parseInt(root.dataset.restCount, 10);
  var hoverCount = parseInt(root.dataset.hoverCount, 10);

  var base = root.querySelector(".goude__base");
  base.style.backgroundImage = "url('" + src + "')";

  // Shows everything from where the repeated zone ends back down to the
  // bottom of the photo (shoe, stool) — but pushed further down than its
  // real position by however tall the zone currently is. That's what makes
  // this an insert instead of a simple overlay: the zone doesn't just
  // replace the sliver of photo it's covering, it makes the leg genuinely
  // longer by shoving everything below it further down the frame.
  var bottom = document.createElement("div");
  bottom.className = "goude__bottom";
  bottom.style.backgroundImage = "url('" + src + "')";
  root.appendChild(bottom);

  var strips = [];
  for (var i = 0; i < hoverCount; i++) {
    var strip = document.createElement("div");
    strip.className = "goude__strip";
    strip.style.backgroundImage = "url('" + src + "')";
    zone.appendChild(strip);
    strips.push(strip);
  }

  var restHeight, hoverHeight, zoneTopContainer, sourceBottomPx, offsetX, renderW, renderH;

  // The container's own box (set in CSS) no longer matches the photo's
  // native ratio — it's deliberately taller, for the elongated-body look —
  // so the photo has to be cover-cropped into it rather than just stretched
  // 1:1. renderW/renderH is the size the FULL image is drawn at once scaled
  // to cover the box; offsetX/offsetY is how far that overflows the box on
  // each axis (negative = cropped off). Every strip reuses that exact same
  // render size, so a strip's crop of the ankle band lines up pixel-for-
  // pixel with where that band sits in the top layer above it.
  function layout() {
    var containerW = root.getBoundingClientRect().width;
    var containerH = root.getBoundingClientRect().height;
    var containerRatio = containerW / containerH;
    var imgRatio = imgNativeW / imgNativeH;

    if (containerRatio > imgRatio) {
      renderW = containerW;
      renderH = containerW / imgRatio;
    } else {
      renderH = containerH;
      renderW = containerH * imgRatio;
    }
    // zoom scales past the minimum cover size — at zoom 1 this container's
    // ratio already shows the photo's full height with nothing but empty
    // background above her head to spare, so there's no room left below the
    // fold zone for both several strips AND a visible bit of untouched photo
    // underneath. Zooming in and biasing the crop down (vCenterPct) trims
    // that dead space off the top instead, freeing real room at the bottom.
    renderW *= zoom;
    renderH *= zoom;

    // Centering the crop on the image's exact middle isn't right on either
    // axis here: the subject sits right-of-center with the raised leg
    // reaching well to the left (hCenterPct), and there's dead space above
    // her head we'd rather trade for room at the bottom (vCenterPct) — these
    // are the points (as % of image width/height) that should land in the
    // middle of the box instead of the true 50/50 center.
    offsetX = containerW / 2 - (hCenterPct / 100) * renderW;
    var offsetY = containerH / 2 - (vCenterPct / 100) * renderH;

    var stripHeight = (sourceHeightPct / 100) * renderH;
    var centerPx = (zoneCenterPct / 100) * renderH;
    var sourceTopPx = centerPx - stripHeight / 2;
    sourceBottomPx = sourceTopPx + stripHeight;

    zoneTopContainer = offsetY + sourceTopPx;

    // Top layer: the photo exactly as it normally sits, but clipped to only
    // the slice above the zone — same background-position as a plain full
    // cover fit would use, just cropped short instead of spanning the whole
    // container.
    base.style.top = "0px";
    base.style.height = Math.max(0, zoneTopContainer) + "px";
    base.style.backgroundSize = renderW + "px " + renderH + "px";
    base.style.backgroundPosition = offsetX + "px " + offsetY + "px";

    strips.forEach(function (strip, i) {
      strip.style.height = stripHeight + "px";
      strip.style.top = i * (stripHeight + stripGap) + "px";
      strip.style.backgroundSize = renderW + "px " + renderH + "px";
      strip.style.backgroundPosition = offsetX + "px " + -sourceTopPx + "px";
    });

    restHeight = restCount * stripHeight + (restCount - 1) * stripGap;
    hoverHeight = hoverCount * stripHeight + (hoverCount - 1) * stripGap;
    zone.style.top = zoneTopContainer + "px";

    bottom.style.height = containerH + "px";
    bottom.style.backgroundSize = renderW + "px " + renderH + "px";
    bottom.style.backgroundPosition = offsetX + "px " + -sourceBottomPx + "px";

    setZoneHeight(root.matches(":hover") ? hoverHeight : restHeight);
  }

  // Zone height and the bottom layer's position move together — the bottom
  // layer always starts exactly where the zone currently ends, so growing
  // the zone pushes it down in lockstep instead of leaving a gap or an
  // overlap.
  function setZoneHeight(h) {
    zone.style.height = h + "px";
    bottom.style.top = zoneTopContainer + h + "px";
  }

  layout();
  window.addEventListener("resize", layout);

  root.addEventListener("mouseenter", function () {
    setZoneHeight(hoverHeight);
  });
  root.addEventListener("mouseleave", function () {
    setZoneHeight(restHeight);
  });
})();
