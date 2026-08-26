/******/ (() => { // webpackBootstrap
/*!********************************************!*\
  !*** ./scripts/product-thumbnail-hover.js ***!
  \********************************************/
// Product Media Gallery Thumbnail Hover Functionality
(function () {
  'use strict';

  var originalActiveSlide = null;
  var originalActiveButton = null;
  function initThumbnailHover() {
    var context = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document;
    // IMPORTANT: This function should ONLY work on PDP, NOT in quick-add modal
    // The modal has its own hover handling in quick-add.js

    var thumbnailSlider;
    var mainSlider;

    // Only look for NON-MODAL thumbnail sliders
    // Always exclude .show-on-quick-add to prevent conflicts with modal
    thumbnailSlider = document.querySelector('.thumbnail-slider:not(.show-on-quick-add)');
    if (!thumbnailSlider) {
      return;
    }

    // Make sure we're not inside a modal
    var isInsideModal = thumbnailSlider.closest('quick-add-modal');
    if (isInsideModal) {
      return;
    }
    mainSlider = document.querySelector('.slider-main');
    if (!mainSlider) {
      return;
    }

    // Double check mainSlider is not in a modal either
    if (mainSlider.closest('quick-add-modal')) {
      return;
    }

    // Look for both regular and modal thumbnail lists
    var thumbnailButtons = thumbnailSlider.querySelectorAll('.thumbnail-list__item button');
    var mainSlides = mainSlider.querySelectorAll('.product__media-item');
    if (thumbnailButtons.length === 0 || mainSlides.length === 0) {
      return;
    }

    // Store the originally selected slide and button
    function storeOriginalSelection() {
      originalActiveSlide = mainSlider.querySelector('.product__media-item.is-active');
      originalActiveButton = thumbnailSlider.querySelector('button[aria-current="true"]');
    }

    // Restore the originally selected slide and button
    function restoreOriginalSelection() {
      if (!originalActiveSlide || !originalActiveButton) return;

      // Remove active state from all slides and buttons
      mainSlides.forEach(function (slide) {
        return slide.classList.remove('is-active');
      });
      thumbnailButtons.forEach(function (btn) {
        btn.removeAttribute('aria-current');
        btn.closest('.thumbnail-list__item').classList.remove('slider__slide--current');
      });

      // Restore original active states
      originalActiveSlide.classList.add('is-active');
      originalActiveButton.setAttribute('aria-current', 'true');
      originalActiveButton.closest('.thumbnail-list__item').classList.add('slider__slide--current');
    }

    // Store the initial selection
    storeOriginalSelection();
    thumbnailButtons.forEach(function (button, index) {
      var thumbnailItem = button.closest('.thumbnail-list__item');
      var targetId = thumbnailItem.getAttribute('data-target');
      if (!targetId) {
        return;
      }

      // Mouse enter event - show corresponding main image
      button.addEventListener('mouseenter', function () {
        var targetSlide = mainSlider.querySelector("[data-media-id=\"".concat(targetId, "\"]"));
        if (!targetSlide) {
          return;
        }

        // Remove active class from all main slides
        mainSlides.forEach(function (slide) {
          slide.classList.remove('is-active');
        });

        // Remove active state from all thumbnail buttons (but don't change stored selection)
        thumbnailButtons.forEach(function (btn) {
          btn.removeAttribute('aria-current');
          btn.closest('.thumbnail-list__item').classList.remove('slider__slide--current');
        });

        // Add active class to target slide with smooth transition
        targetSlide.classList.add('is-active');

        // Add active state to current thumbnail
        button.setAttribute('aria-current', 'true');
        thumbnailItem.classList.add('slider__slide--current');
      });

      // Mouse leave event - restore original selection
      button.addEventListener('mouseleave', function () {
        restoreOriginalSelection();
      });

      // Click handler - update the original selection
      button.addEventListener('click', function (e) {
        // Update the stored original selection to the clicked one
        setTimeout(function () {
          storeOriginalSelection();
        }, 100);
      });
    });

    // Also add hover restoration when leaving the entire thumbnail area
    thumbnailSlider.addEventListener('mouseleave', function () {
      restoreOriginalSelection();
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThumbnailHover);
  } else {
    initThumbnailHover();
  }

  // Re-initialize on Shopify section events (for theme editor)
  document.addEventListener('shopify:section:load', function (e) {
    if (e.target.querySelector('.thumbnail-slider')) {
      setTimeout(initThumbnailHover, 100);
    }
  });

  // Re-initialize on variant change
  document.addEventListener('variant:change', function () {
    setTimeout(function () {
      initThumbnailHover();
    }, 200);
  });

  // Make available globally for quick-add modal and testing
  window.initThumbnailHover = initThumbnailHover;
})();
/******/ })()
;