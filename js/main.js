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

  /* ---- Carrossel de vídeos ----
     Arrastar/deslizar já funciona nativo (overflow-x + scroll-snap,
     tratado pelo navegador em touch e trackpad). As setas só precisam
     rolar a faixa por um "slide" de cada vez. */
  var videoTrack = document.getElementById("videoTrack");
  var videoPrev = document.getElementById("videoPrev");
  var videoNext = document.getElementById("videoNext");
  if (videoTrack && videoPrev && videoNext) {
    var videoStep = function () {
      var slide = videoTrack.querySelector(".video-slide");
      if (!slide) return videoTrack.clientWidth;
      var style = window.getComputedStyle(videoTrack);
      var gap = parseFloat(style.columnGap || style.gap || "0") || 0;
      return slide.getBoundingClientRect().width + gap;
    };
    videoPrev.addEventListener("click", function () {
      videoTrack.scrollBy({ left: -videoStep(), behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
    videoNext.addEventListener("click", function () {
      videoTrack.scrollBy({ left: videoStep(), behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  /* ---- Carrossel da galeria (mesmo padrão do de vídeos) ---- */
  var galleryTrack = document.getElementById("galleryTrack");
  var galleryPrev = document.getElementById("galleryPrev");
  var galleryNext = document.getElementById("galleryNext");
  if (galleryTrack && galleryPrev && galleryNext) {
    var galleryStep = function () {
      var slide = galleryTrack.querySelector(".gallery-slide");
      if (!slide) return galleryTrack.clientWidth;
      var style = window.getComputedStyle(galleryTrack);
      var gap = parseFloat(style.columnGap || style.gap || "0") || 0;
      return slide.getBoundingClientRect().width + gap;
    };
    galleryPrev.addEventListener("click", function () {
      galleryTrack.scrollBy({ left: -galleryStep(), behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
    galleryNext.addEventListener("click", function () {
      galleryTrack.scrollBy({ left: galleryStep(), behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

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
})();
