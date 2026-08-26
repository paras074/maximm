/******/ (() => { // webpackBootstrap
/*!*********************************!*\
  !*** ./scripts/hulkApps-fix.js ***!
  \*********************************/
// Enhanced HulkApps price and discount display fix
(function () {
  function cleanHulkPrice(el) {
    if (!el || el.dataset.cleaned === "1") return;

    // Get the full text content
    var fullText = el.textContent || '';
    console.log('Processing HulkApps element:', fullText);

    // Grab price from inner .money element
    var moneyEl = el.querySelector('.money');
    var price = ((moneyEl === null || moneyEl === void 0 ? void 0 : moneyEl.textContent) || '').trim();

    // Extract discount percentage using better regex patterns
    var discount = '';

    // Pattern 1: "5% Off" or "10% Off"
    var percentMatch = fullText.match(/(\d+%\s*[Oo]ff)/i);
    if (percentMatch) {
      discount = percentMatch[1];
    }
    // Pattern 2: Just percentage like "5%" or "10%"
    else {
      var percentOnlyMatch = fullText.match(/(\d+%)/);
      if (percentOnlyMatch) {
        discount = percentOnlyMatch[1] + ' Off';
      }
    }
    console.log('Extracted - Discount:', discount, 'Price:', price);

    // Rebuild the markup with better structure
    if (price && discount) {
      el.innerHTML = "\n        <span class=\"vb-discount\" style=\"font-weight: bold; color: #0000fd;\">".concat(discount, "</span>\n        <span class=\"vb-price\" style=\"font-weight: bold; color: #0000fd;\">").concat(price, " Each</span>\n      ");
      el.dataset.cleaned = "1";
      console.log('✅ Cleaned with both discount and price');
    }
    // If we only have price, still show it
    else if (price) {
      el.innerHTML = "<span class=\"vb-price\" style=\"font-weight: bold; color: #0000fd;\">".concat(price, " Each</span>");
      el.dataset.cleaned = "1";
      console.log('✅ Cleaned with price only');
    }
    // If we only have discount, show it
    else if (discount) {
      el.innerHTML = "<span class=\"vb-discount\" style=\"font-weight: bold; color: #0000fd;\">".concat(discount, "</span>");
      el.dataset.cleaned = "1";
      console.log('✅ Cleaned with discount only');
    } else {
      console.log('❌ No price or discount found');
    }
  }
  function cleanAll() {
    var root = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document;
    console.log('🔍 Scanning for HulkApps elements...');

    // Multiple selectors for different HulkApps structures
    var selectors = ['.hulkapps-price', '.hulk-price', '.hulkapps-volumes .hulkapps-price', '.bulk-discount .hulkapps-price', '.hulkapps-volume-discount-tiers .hulkapps-price'];
    var foundElements = 0;
    selectors.forEach(function (selector) {
      try {
        var elements = root.querySelectorAll(selector);
        foundElements += elements.length;
        console.log("Found ".concat(elements.length, " elements with selector: ").concat(selector));
        elements.forEach(cleanHulkPrice);
      } catch (e) {
        console.warn('HulkApps selector error:', selector, e);
      }
    });
    console.log("\uD83D\uDCCA Total HulkApps elements found: ".concat(foundElements));
  }

  // Enhanced initialization
  function initHulkApps() {
    console.log('🚀 Initializing HulkApps price cleaner...');
    cleanAll();

    // HulkApps often loads after initial DOM ready, so add delays
    setTimeout(function () {
      console.log('⏰ Running delayed cleanup (500ms)...');
      cleanAll();
    }, 500);
    setTimeout(function () {
      console.log('⏰ Running delayed cleanup (1500ms)...');
      cleanAll();
    }, 1500);
    setTimeout(function () {
      console.log('⏰ Running delayed cleanup (3000ms)...');
      cleanAll();
    }, 3000);
  }

  // Initial setup
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHulkApps);
  } else {
    initHulkApps();
  }

  // Enhanced mutation observer
  var mo = new MutationObserver(function (muts) {
    var shouldClean = false;
    muts.forEach(function (m) {
      m.addedNodes && m.addedNodes.forEach(function (n) {
        if (n.nodeType === 1) {
          // Check if this node or its children contain HulkApps elements
          var hulkSelectors = ['.hulkapps-price', '.hulk-price', '.hulkapps-volumes', '.bulk-discount'];
          var matchesHulk = hulkSelectors.some(function (selector) {
            try {
              return n.matches && n.matches(selector) || n.querySelector(selector);
            } catch (e) {
              return false;
            }
          });
          if (matchesHulk) {
            shouldClean = true;
          }
        }
      });
    });
    if (shouldClean) {
      console.log('🔄 DOM changed - running HulkApps cleanup...');
      setTimeout(function () {
        return cleanAll();
      }, 200);
    }
  });
  mo.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'style']
  });

  // Shopify theme events
  document.addEventListener('shopify:section:load', function (e) {
    console.log('🎯 Shopify section loaded - cleaning HulkApps...');
    setTimeout(function () {
      return cleanAll(e.target);
    }, 200);
  });
  document.addEventListener('shopify:section:select', function (e) {
    console.log('🎯 Shopify section selected - cleaning HulkApps...');
    setTimeout(function () {
      return cleanAll(e.target);
    }, 200);
  });

  // Variant change events
  document.addEventListener('variant:change', function () {
    console.log('🔄 Variant changed - cleaning HulkApps...');
    setTimeout(cleanAll, 300);
  });

  // Periodic cleanup for persistent issues
  setInterval(function () {
    var uncleaned = document.querySelectorAll('.hulkapps-price:not([data-cleaned="1"])');
    if (uncleaned.length > 0) {
      console.log("\uD83D\uDD27 Found ".concat(uncleaned.length, " uncleaned HulkApps elements - running cleanup..."));
      cleanAll();
    }
  }, 3000);

  // Make function available globally for manual testing
  window.cleanHulkApps = cleanAll;
  console.log('🎉 HulkApps price cleaner initialized! Use window.cleanHulkApps() to run manually.');
})();
/******/ })()
;