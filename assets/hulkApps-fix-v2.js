/******/ (() => { // webpackBootstrap
/*!************************************!*\
  !*** ./scripts/hulkApps-fix-v2.js ***!
  \************************************/
// Non-destructive HulkApps price and discount display fix
(function () {
  // Add CSS to improve HulkApps appearance
  function addHulkAppsCSS() {
    if (document.getElementById('hulk-apps-css')) return;
    var style = document.createElement('style');
    style.id = 'hulk-apps-css';
    style.textContent = "\n      .hulkapps-price {\n        font-weight: bold !important;\n        color: #0000fd !important;\n        font-size: 14px !important;\n        line-height: 1.4 !important;\n      }\n\n      .hulkapps-price .money {\n        font-weight: bold !important;\n        color: #0000fd !important;\n      }\n\n      .hulk-offer-text {\n        display: inline !important;\n        font-weight: normal !important;\n        color: #fd0000 !important;\n      }\n\n      /* Clean up the display without breaking functionality */\n      .hulkapps-volumes .hulkapps-table td {\n        white-space: nowrap !important;\n      }\n\n      /* Make sure parentheses and \"Each\" text is properly styled */\n      .hulkapps-price {\n        display: inline-block !important;\n        margin: 0 !important;\n      }\n    ";
    document.head.appendChild(style);
    console.log('📝 Added HulkApps CSS improvements');
  }

  // Monitor for HulkApps elements and ensure proper display
  function monitorHulkApps() {
    var root = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document;
    var hulkappsElements = root.querySelectorAll('.hulkapps-price');
    hulkappsElements.forEach(function (el) {
      if (el.dataset.hulkMonitored) return;

      // Set up observer to watch for changes to this element
      var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          if (mutation.type === 'childList' || mutation.type === 'characterData') {
            // HulkApps updated content, ensure our styles are applied
            ensureProperDisplay(el);
          }
        });
      });
      observer.observe(el, {
        childList: true,
        subtree: true,
        characterData: true
      });
      el.dataset.hulkMonitored = 'true';
      ensureProperDisplay(el);
    });
    console.log("\uD83D\uDD0D Monitoring ".concat(hulkappsElements.length, " HulkApps elements"));
  }
  function ensureProperDisplay(el) {
    // Ensure all text content is visible and properly styled
    var textNodes = [];
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
    var node;
    while (node = walker.nextNode()) {
      if (node.textContent.trim()) {
        textNodes.push(node);
      }
    }

    // Make sure .hulk-offer-text elements are visible
    var offerTexts = el.querySelectorAll('.hulk-offer-text');
    offerTexts.forEach(function (offerEl) {
      if (offerEl.style.display === 'none') {
        offerEl.style.display = 'inline';
      }
    });

    // Ensure money elements are visible
    var moneyElements = el.querySelectorAll('.money');
    moneyElements.forEach(function (moneyEl) {
      if (moneyEl.style.display === 'none') {
        moneyEl.style.display = 'inline';
      }
    });
  }

  // Enhanced initialization
  function initHulkAppsMonitor() {
    console.log('🚀 Initializing non-destructive HulkApps monitor...');

    // Add CSS improvements
    addHulkAppsCSS();

    // Initial monitoring
    monitorHulkApps();

    // Monitor with delays to catch HulkApps loading
    setTimeout(function () {
      console.log('⏰ Running delayed monitoring (500ms)...');
      monitorHulkApps();
    }, 500);
    setTimeout(function () {
      console.log('⏰ Running delayed monitoring (1500ms)...');
      monitorHulkApps();
    }, 1500);
    setTimeout(function () {
      console.log('⏰ Running delayed monitoring (3000ms)...');
      monitorHulkApps();
    }, 3000);
  }

  // Initial setup
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHulkAppsMonitor);
  } else {
    initHulkAppsMonitor();
  }

  // Enhanced mutation observer for new HulkApps elements
  var globalObserver = new MutationObserver(function (muts) {
    var shouldMonitor = false;
    muts.forEach(function (m) {
      m.addedNodes && m.addedNodes.forEach(function (n) {
        if (n.nodeType === 1) {
          // Check if this node or its children contain HulkApps elements
          var hulkSelectors = ['.hulkapps-price', '.hulkapps-volumes', '.bulk-discount'];
          var matchesHulk = hulkSelectors.some(function (selector) {
            try {
              return n.matches && n.matches(selector) || n.querySelector(selector);
            } catch (e) {
              return false;
            }
          });
          if (matchesHulk) {
            shouldMonitor = true;
          }
        }
      });
    });
    if (shouldMonitor) {
      console.log('🔄 New HulkApps elements detected - starting monitoring...');
      setTimeout(function () {
        return monitorHulkApps();
      }, 200);
    }
  });
  globalObserver.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  // Shopify theme events
  document.addEventListener('shopify:section:load', function (e) {
    console.log('🎯 Shopify section loaded - monitoring HulkApps...');
    setTimeout(function () {
      return monitorHulkApps(e.target);
    }, 200);
  });
  document.addEventListener('shopify:section:select', function (e) {
    console.log('🎯 Shopify section selected - monitoring HulkApps...');
    setTimeout(function () {
      return monitorHulkApps(e.target);
    }, 200);
  });

  // Variant change events
  document.addEventListener('variant:change', function () {
    console.log('🔄 Variant changed - monitoring HulkApps...');
    setTimeout(function () {
      return monitorHulkApps();
    }, 300);
  });

  // Make function available globally for testing
  window.monitorHulkApps = monitorHulkApps;
  console.log('🎉 Non-destructive HulkApps monitor initialized!');
})();
/******/ })()
;