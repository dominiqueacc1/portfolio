/**
 * Maximilien Duchamp site scripts:
 *  - Load the hero background video only on large screens (mobile keeps the
 *    static CSS background image, so the heavy video is never downloaded).
 *  - Mobile hamburger menu.
 *  - EN / FR language switch (persisted in localStorage across pages).
 */
(function () {
  "use strict";

  var LARGE_SCREEN = window.matchMedia("(min-width: 769px)");
  var bg = document.getElementById("hero-bg");
  var video = null;

  function addVideo() {
    if (video) return;
    video = document.createElement("video");
    video.src = "assets/video.mp4";
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute("playsinline", ""); // iOS Safari
    video.setAttribute("aria-hidden", "true");

    // Fade the video in only once it's actually rendering frames, so the dark
    // background shows until then instead of a half-loaded flash.
    function reveal() {
      video.classList.add("is-ready");
    }
    video.addEventListener("playing", reveal);
    video.addEventListener("canplay", reveal);

    bg.appendChild(video);
    // Some browsers need an explicit play() call after autoplay policies.
    var p = video.play();
    if (p && typeof p.catch === "function") {
      p.catch(function () {});
    }
  }

  function removeVideo() {
    if (!video) return;
    video.pause();
    video.removeAttribute("src");
    video.load();
    bg.removeChild(video);
    video = null;
  }

  function sync(mq) {
    if (mq.matches) {
      addVideo();
    } else {
      removeVideo();
    }
  }

  // Only wire up the background video when a video target exists.
  // Pages without #hero-bg (e.g. the contact page) keep the static image.
  if (bg) {
    // Initial state
    sync(LARGE_SCREEN);

    // React to viewport changes (rotation / resize)
    if (typeof LARGE_SCREEN.addEventListener === "function") {
      LARGE_SCREEN.addEventListener("change", sync);
    } else {
      LARGE_SCREEN.addListener(sync); // older Safari
    }
  }

  /* Mobile menu: toggle the black dropdown panel. */
  var menuToggle = document.querySelector(".menu-toggle");
  var nav = document.querySelector(".nav");

  function setMenu(open) {
    document.body.classList.toggle("menu-open", open);
    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      setMenu(!document.body.classList.contains("menu-open"));
    });
  }

  // Close the menu after tapping a link.
  if (nav) {
    nav.addEventListener("click", function (e) {
      if (e.target.closest(".nav__link")) setMenu(false);
    });
  }

  // Reset the menu when returning to large screens.
  if (typeof LARGE_SCREEN.addEventListener === "function") {
    LARGE_SCREEN.addEventListener("change", function (mq) {
      if (mq.matches) setMenu(false);
    });
  }

  /* ---------- Language switch (EN / FR) ---------- */
  var STORAGE_KEY = "maximilien-duchamp-lang";

  // Each flag SVG represents the language you switch TO. No <clipPath> ids are
  // used, so the markup is safe to inject into several buttons at once.
  var FLAGS = {
    fr:
      '<svg class="lang-switch__flag" viewBox="0 0 3 2" aria-hidden="true">' +
      '<rect width="3" height="2" fill="#fff"/>' +
      '<rect width="1" height="2" fill="#0055A4"/>' +
      '<rect x="2" width="1" height="2" fill="#EF4135"/></svg>',
    en:
      '<svg class="lang-switch__flag" viewBox="0 0 60 30" aria-hidden="true">' +
      '<rect width="60" height="30" fill="#012169"/>' +
      '<path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6"/>' +
      '<path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" stroke-width="4"/>' +
      '<rect x="25" width="10" height="30" fill="#fff"/>' +
      '<rect y="10" width="60" height="10" fill="#fff"/>' +
      '<rect x="27" width="6" height="30" fill="#C8102E"/>' +
      '<rect y="12" width="60" height="6" fill="#C8102E"/></svg>'
  };

  var current = "en";
  try {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "fr" || saved === "en") current = saved;
  } catch (e) {}

  function applyLang(lang) {
    current = lang === "fr" ? "fr" : "en";
    var other = current === "en" ? "fr" : "en";
    document.documentElement.setAttribute("lang", current);

    // Swap text content (elements carry data-en / data-fr).
    var textEls = document.querySelectorAll("[data-en]");
    for (var i = 0; i < textEls.length; i++) {
      var v = textEls[i].getAttribute("data-" + current);
      if (v !== null) textEls[i].textContent = v;
    }

    // Swap placeholders (data-en-placeholder / data-fr-placeholder).
    var phEls = document.querySelectorAll("[data-en-placeholder]");
    for (var j = 0; j < phEls.length; j++) {
      var pv = phEls[j].getAttribute("data-" + current + "-placeholder");
      if (pv !== null) phEls[j].setAttribute("placeholder", pv);
    }

    // Update every language button to show the OTHER language's flag.
    var switches = document.querySelectorAll("[data-lang-switch]");
    for (var k = 0; k < switches.length; k++) {
      switches[k].innerHTML =
        FLAGS[other] +
        '<span class="lang-switch__code">' + other.toUpperCase() + "</span>";
      switches[k].setAttribute(
        "aria-label",
        current === "en" ? "Passer le site en français" : "Switch the site to English"
      );
    }

    try {
      localStorage.setItem(STORAGE_KEY, current);
    } catch (e) {}
  }

  // Any element with [data-lang-switch] toggles the language.
  document.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest("[data-lang-switch]") : null;
    if (!btn) return;
    applyLang(current === "en" ? "fr" : "en");
  });

  // Apply the saved / default language on load.
  applyLang(current);
})();
