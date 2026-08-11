(function () {
  "use strict";

  document.body.classList.remove("no-js");

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Menu mobile ---- */
  var navToggle = document.querySelector(".nav-toggle");
  var mobileNav = document.getElementById("mobile-nav");

  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!isOpen));
      if (isOpen) {
        mobileNav.setAttribute("hidden", "");
      } else {
        mobileNav.removeAttribute("hidden");
      }
    });

    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navToggle.setAttribute("aria-expanded", "false");
        mobileNav.setAttribute("hidden", "");
      });
    });
  }

  /* ---- Reveal on scroll ---- */
  var revealEls = document.querySelectorAll(".reveal");
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
  }

  /* ---- Carrossel de depoimentos ---- */
  var track = document.getElementById("testimonial-track");
  if (track) {
    var slides = Array.prototype.slice.call(track.querySelectorAll(".testimonial-slide"));
    var dotsContainer = document.getElementById("carouselDots");
    var prevBtn = document.getElementById("prevSlide");
    var nextBtn = document.getElementById("nextSlide");
    var current = 0;
    var autoplayId = null;

    slides.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.className = "carousel-dot";
      dot.type = "button";
      dot.setAttribute("aria-label", "Ir para depoimento " + (i + 1));
      dot.addEventListener("click", function () { goTo(i, true); });
      dotsContainer.appendChild(dot);
    });
    var dots = Array.prototype.slice.call(dotsContainer.children);

    function render() {
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.setAttribute("aria-current", i === current ? "true" : "false");
      });
    }

    function goTo(index, userInitiated) {
      current = (index + slides.length) % slides.length;
      render();
      if (userInitiated) restartAutoplay();
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    prevBtn.addEventListener("click", function () { prev(); restartAutoplay(); });
    nextBtn.addEventListener("click", function () { next(); restartAutoplay(); });

    function startAutoplay() {
      if (prefersReducedMotion) return;
      autoplayId = window.setInterval(next, 6000);
    }
    function restartAutoplay() {
      if (autoplayId) window.clearInterval(autoplayId);
      startAutoplay();
    }

    render();
    startAutoplay();

    track.addEventListener("mouseenter", function () { if (autoplayId) window.clearInterval(autoplayId); });
    track.addEventListener("mouseleave", startAutoplay);
  }

  /* ---- Formulário de contato ----
     Ainda não está ligado a nenhum backend (ver TODO em contato.html).
     Por enquanto só evita o reload de página e avisa o usuário. */
  var contactForm = document.getElementById("contactForm");
  var formNote = document.getElementById("formNote");
  if (contactForm && formNote) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      formNote.hidden = false;
      formNote.scrollIntoView({ block: "nearest", behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  /* ---- Carrosséis (vídeos, galeria, antes-e-depois) ----
     Arrastar/deslizar já funciona nativo (overflow-x + scroll-snap,
     tratado pelo navegador em touch e trackpad). As setas só precisam
     rolar a faixa por um "slide" de cada vez. */
  function setupCarousel(trackId, prevId, nextId, slideSelector) {
    var track = document.getElementById(trackId);
    var prev = document.getElementById(prevId);
    var next = document.getElementById(nextId);
    if (!track || !prev || !next) return;
    var step = function () {
      var slide = track.querySelector(slideSelector);
      if (!slide) return track.clientWidth;
      var style = window.getComputedStyle(track);
      var gap = parseFloat(style.columnGap || style.gap || "0") || 0;
      return slide.getBoundingClientRect().width + gap;
    };
    prev.addEventListener("click", function () {
      track.scrollBy({ left: -step(), behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
    next.addEventListener("click", function () {
      track.scrollBy({ left: step(), behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }
  setupCarousel("videoTrack", "videoPrev", "videoNext", ".video-slide");
  setupCarousel("galleryTrack", "galleryPrev", "galleryNext", ".gallery-slide");
  setupCarousel("baTrack", "baPrev", "baNext", ".ba-slide");

  /* ---- Lightbox da galeria ---- */
  var galleryImgs = document.querySelectorAll(".gallery-slide img");
  if (galleryImgs.length) {
    var overlay = document.createElement("div");
    overlay.className = "lightbox-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Imagem ampliada");
    overlay.innerHTML =
      '<button type="button" class="lightbox-close" aria-label="Fechar imagem">×</button>' +
      '<img class="lightbox-image" alt="">';
    document.body.appendChild(overlay);

    var lbImage = overlay.querySelector(".lightbox-image");
    var lbClose = overlay.querySelector(".lightbox-close");
    var lastFocused = null;

    function openLightbox(img) {
      lastFocused = document.activeElement;
      lbImage.src = img.currentSrc || img.src;
      lbImage.alt = img.alt || "";
      overlay.classList.add("is-open");
      document.body.style.overflow = "hidden";
      lbClose.focus();
    }

    function closeLightbox() {
      overlay.classList.remove("is-open");
      document.body.style.overflow = "";
      lbImage.src = "";
      if (lastFocused) lastFocused.focus();
    }

    galleryImgs.forEach(function (img) {
      img.setAttribute("tabindex", "0");
      img.setAttribute("role", "button");
      img.setAttribute("aria-label", "Ampliar imagem" + (img.alt ? ": " + img.alt : ""));
      img.addEventListener("click", function () { openLightbox(img); });
      img.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openLightbox(img);
        }
      });
    });

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeLightbox();
    });
    lbClose.addEventListener("click", closeLightbox);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay.classList.contains("is-open")) closeLightbox();
    });
  }

  /* ---- Lightbox de antes-e-depois: abre o par junto, ampliado ---- */
  var baCompares = document.querySelectorAll(".ba-compare");
  if (baCompares.length) {
    var baOverlay = document.createElement("div");
    baOverlay.className = "lightbox-overlay lightbox-overlay--pair";
    baOverlay.setAttribute("role", "dialog");
    baOverlay.setAttribute("aria-modal", "true");
    baOverlay.setAttribute("aria-label", "Comparação ampliada");
    baOverlay.innerHTML =
      '<button type="button" class="lightbox-close" aria-label="Fechar comparação">×</button>' +
      '<div class="lightbox-compare">' +
        '<figure class="ba-before"><span class="ba-tag">Antes</span><img alt=""></figure>' +
        '<figure class="ba-after"><span class="ba-tag ba-tag--after">Depois</span><img alt=""></figure>' +
      '</div>';
    document.body.appendChild(baOverlay);

    var baImgs = baOverlay.querySelectorAll(".lightbox-compare img");
    var baClose = baOverlay.querySelector(".lightbox-close");
    var baLastFocused = null;

    function openBaLightbox(compare) {
      var srcImgs = compare.querySelectorAll("img");
      baImgs[0].src = srcImgs[0].currentSrc || srcImgs[0].src;
      baImgs[0].alt = srcImgs[0].alt || "";
      baImgs[1].src = srcImgs[1].currentSrc || srcImgs[1].src;
      baImgs[1].alt = srcImgs[1].alt || "";
      baLastFocused = document.activeElement;
      baOverlay.classList.add("is-open");
      document.body.style.overflow = "hidden";
      baClose.focus();
    }

    function closeBaLightbox() {
      baOverlay.classList.remove("is-open");
      document.body.style.overflow = "";
      baImgs[0].src = "";
      baImgs[1].src = "";
      if (baLastFocused) baLastFocused.focus();
    }

    baCompares.forEach(function (compare) {
      compare.setAttribute("tabindex", "0");
      compare.setAttribute("role", "button");
      compare.setAttribute("aria-label", "Ampliar comparação de antes e depois");
      compare.addEventListener("click", function () { openBaLightbox(compare); });
      compare.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openBaLightbox(compare);
        }
      });
    });

    baOverlay.addEventListener("click", function (e) {
      if (e.target === baOverlay) closeBaLightbox();
    });
    baClose.addEventListener("click", closeBaLightbox);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && baOverlay.classList.contains("is-open")) closeBaLightbox();
    });
  }
})();
