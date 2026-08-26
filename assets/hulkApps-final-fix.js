/******/ (() => { // webpackBootstrap
/*!***************************************!*\
  !*** ./scripts/hulkApps-final-fix.js ***!
  \***************************************/
// Final HulkApps fix - addresses blinking and hulk-offer-text issues
(function () {
  // Add CSS to prevent blinking and improve appearance
  function addHulkAppsCSS() {
    if (document.getElementById('hulk-apps-final-css')) return;
    var style = document.createElement('style');
    style.id = 'hulk-apps-final-css';
    style.textContent = "\n      /* Prevent blinking and smooth transitions */\n      .hulkapps-price {\n        transition: none !important;\n        animation: none !important;\n      }\n\n      .hulkapps-price .money {\n        font-weight: bold !important;\n        color: #0000fd !important;\n      }\n\n      /* Ensure hulk-offer-text is always visible */\n      .hulk-offer-text {\n        display: inline !important;\n        visibility: visible !important;\n        opacity: 1 !important;\n        color: #fd0000 !important;\n        font-weight: normal !important;\n      }\n\n      /* Style the price display */\n      .hulkapps-price {\n        font-weight: bold !important;\n        color: #0000fd !important;\n        font-size: 14px !important;\n      }\n\n      /* Prevent any hiding of content */\n      .hulkapps-volumes * {\n        display: initial !important;\n      }\n\n      .hulkapps-volumes .hulk-offer-text {\n        display: inline !important;\n      }\n    ";
    document.head.appendChild(style);
    console.log('📝 Added final HulkApps CSS fixes');
  }

  // Restore any hidden hulk-offer-text elements
  function restoreHulkOfferText() {
    var offerTexts = document.querySelectorAll('.hulk-offer-text');
    var restoredCount = 0;
    offerTexts.forEach(function (el) {
      if (!el.textContent.trim() || el.style.display === 'none' || el.style.visibility === 'hidden') {
        // Try to restore content or make visible
        el.style.display = 'inline';
        el.style.visibility = 'visible';
        el.style.opacity = '1';
        restoredCount++;
      }
    });
    if (restoredCount > 0) {
      console.log("\uD83D\uDD27 Restored ".concat(restoredCount, " hulk-offer-text elements"));
    }
  }

  // Main monitoring function that runs periodically
  function monitorAndFix() {
    addHulkAppsCSS();
    restoreHulkOfferText();

    // Check for any elements that were modified and need restoration
    var hulkappsElements = document.querySelectorAll('.hulkapps-price');
    var fixedCount = 0;
    hulkappsElements.forEach(function (el) {
      // If element was previously cleaned but is now broken, don't re-process
      if (el.dataset.cleaned === "1" && !el.textContent.includes('Each')) {
        console.log('🚫 Preventing re-processing of cleaned element');
        return;
      }

      // Ensure child elements are visible
      var moneyEl = el.querySelector('.money');
      if (moneyEl && moneyEl.style.display === 'none') {
        moneyEl.style.display = 'inline';
        fixedCount++;
      }
      var offerEl = el.querySelector('.hulk-offer-text');
      if (offerEl && (offerEl.style.display === 'none' || !offerEl.textContent.trim())) {
        offerEl.style.display = 'inline';
        fixedCount++;
      }
    });
    if (fixedCount > 0) {
      console.log("\u2705 Fixed ".concat(fixedCount, " HulkApps display issues"));
    }
  }

  // Initialize with multiple timing strategies
  function init() {
    console.log('🚀 Initializing final HulkApps fix...');

    // Immediate fix
    monitorAndFix();

    // Delayed fixes to catch HulkApps loading
    [100, 300, 500, 1000, 1500, 2000, 3000, 5000].forEach(function (delay) {
      setTimeout(function () {
        console.log("\u23F0 Running fix at ".concat(delay, "ms..."));
        monitorAndFix();
      }, delay);
    });

    // Periodic monitoring to catch dynamic updates
    setInterval(function () {
      monitorAndFix();
    }, 2000);
  }

  // DOM ready initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Mutation observer to catch HulkApps re-renders
  var observer = new MutationObserver(function () {
    // Debounce the fixes to prevent excessive processing
    clearTimeout(window.hulkAppsFixer);
    window.hulkAppsFixer = setTimeout(monitorAndFix, 100);
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class']
  });

  // Shopify events
  document.addEventListener('shopify:section:load', function () {
    setTimeout(monitorAndFix, 200);
  });
  document.addEventListener('shopify:section:select', function () {
    setTimeout(monitorAndFix, 200);
  });
  document.addEventListener('variant:change', function () {
    setTimeout(monitorAndFix, 300);
  });

  // Global access for manual testing
  window.hulkAppsFinalFix = monitorAndFix;
  console.log('🎉 Final HulkApps fix initialized! Use window.hulkAppsFinalFix() to run manually.');
})();
/******/ })()
;