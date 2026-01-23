/**
 * Custom scripts extracted from imaaicha.com
 * These are the inline scripts that power animations, loaders, and interactions
 */

// ============================================
// 1. LOADER ANIMATION (GSAP)
// ============================================
let customEase =
  "M0,0,C0,0,0.13,0.34,0.238,0.442,0.305,0.506,0.322,0.514,0.396,0.54,0.478,0.568,0.468,0.56,0.522,0.584,0.572,0.606,0.61,0.719,0.714,0.826,0.798,0.912,1,1,1,1";
let counter = {
  value: 0
};
let loaderDuration = 8;

// If not a first time visit in this tab
if (sessionStorage.getItem("visited") !== null) {
  loaderDuration = 2;
  counter = {
    value: 75
  };
}
sessionStorage.setItem("visited", "true");

function updateLoaderText() {
  let progress = Math.round(counter.value);
  $(".loader_number").text(progress);
}
function endLoaderAnimation() {
  $(".trigger").click();
}

let tl = gsap.timeline({
  onComplete: endLoaderAnimation
});
tl.to(counter, {
  value: 100,
  onUpdate: updateLoaderText,
  duration: loaderDuration,
  ease: CustomEase.create("custom", customEase)
});
tl.to(".loader_progress", {
    width: "100%",
    duration: loaderDuration,
    ease: CustomEase.create("custom", customEase)
}, 0);


// ============================================
// 2. SWIPER SLIDER INITIALIZATION
// ============================================
$(".slider-main_component").each(function (index) {
  let loopMode = false;
  if ($(this).attr("loop-mode") === "true") {
    loopMode = true;
  }
  let sliderDuration = 300;
  if ($(this).attr("slider-duration") !== undefined) {
    sliderDuration = +$(this).attr("slider-duration");
  }
  const swiper = new Swiper($(this).find(".swiper")[0], {
    speed: sliderDuration,
    loop: loopMode,
    autoHeight: false,
    centeredSlides: loopMode,
    followFinger: true,
    freeMode: false,
    slideToClickedSlide: false,
    slidesPerView: 1,
    spaceBetween: "1%",
    rewind: false,
    mousewheel: {
      forceToAxis: true
    },
    keyboard: {
      enabled: true,
      onlyInViewport: true
    },
    breakpoints: {
      // mobile landscape
      480: {
        slidesPerView: 1,
        spaceBetween: "2%"
      },
      // tablet
      768: {
        slidesPerView: 2,
        spaceBetween: "2%"
      },
      // desktop
      992: {
        slidesPerView: 3,
        spaceBetween: "0.5%"
      }
    },
    pagination: {
      el: $(this).find(".swiper-bullet-wrapper")[0],
      bulletActiveClass: "is-active",
      bulletClass: "swiper-bullet",
      bulletElement: "button",
      clickable: true
    },
    navigation: {
      nextEl: $(this).find(".swiper-next")[0],
      prevEl: $(this).find(".swiper-prev")[0],
      disabledClass: "is-disabled"
    },
    scrollbar: {
      el: $(this).find(".swiper-drag-wrapper")[0],
      draggable: true,
      dragClass: "swiper-drag",
      snapOnRelease: true
    },
    slideActiveClass: "is-active",
    slideDuplicateActiveClass: "is-active"
  });
});


// ============================================
// 3. LENIS SMOOTH SCROLL
// ============================================
let lenis;
if (Webflow.env("editor") === undefined) {
  lenis = new Lenis({
    lerp: 0.1,
    wheelMultiplier: 0.7,
    gestureOrientation: "vertical",
    normalizeWheel: false,
    smoothTouch: false
  });
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}
$("[data-lenis-start]").on("click", function () {
  lenis.start();
});
$("[data-lenis-stop]").on("click", function () {
  lenis.stop();
});
$("[data-lenis-toggle]").on("click", function () {
  $(this).toggleClass("stop-scroll");
  if ($(this).hasClass("stop-scroll")) {
    lenis.stop();
  } else {
    lenis.start();
  }
});


// ============================================
// 4. FLOWBASE SLIDER (Testimonials)
// ============================================
var Webflow = Webflow || [];
Webflow.push(function() {
  var l = $('#flowbaseSlider .w-slider-arrow-left');
  var r = $('#flowbaseSlider .w-slider-arrow-right');
  $('#flowbaseSlider')
    .on('click', '.back-button', function() {
      l.trigger('tap');
    })
    .on('click', '.next-button', function() {
      r.trigger('tap');
    });
});


// ============================================
// 5. DEV GRID TOGGLE (Shift+F)
// ============================================
$(document).keydown(function (e) {
  if (e.shiftKey && e.key === "F") {
    $(".grid-wrap").toggleClass("hide-grid");
  }
});
