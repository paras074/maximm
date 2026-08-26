/******/ (() => { // webpackBootstrap
/*!********************************************!*\
  !*** ./scripts/hulkApps-offer-text-fix.js ***!
  \********************************************/
// HulkApps hulk-offer-text population fix
(function () {
  function populateOfferText() {
    console.log('🔍 Looking for empty hulk-offer-text elements...');
    var offerTextElements = document.querySelectorAll('.hulk-offer-text');
    var populatedCount = 0;
    offerTextElements.forEach(function (offerEl) {
      // Skip if already has content
      if (offerEl.textContent.trim()) {
        console.log('✓ hulk-offer-text already has content:', offerEl.textContent);
        return;
      }

      // Find the parent row to get context
      var parentRow = offerEl.closest('tr');
      if (!parentRow) return;

      // Look for the discount information in the same row
      var hulkappsPrice = parentRow.querySelector('.hulkapps-price');
      if (!hulkappsPrice) return;
      var priceText = hulkappsPrice.textContent || '';
      console.log('📋 Analyzing price text:', priceText);

      // Extract discount percentage
      var percentMatch = priceText.match(/(\d+)%/);
      if (percentMatch) {
        var discountPercent = percentMatch[1];

        // Generate offer text based on discount
        var offerText = '';
        if (parseInt(discountPercent) >= 15) {
          offerText = 'Best Value!';
        } else if (parseInt(discountPercent) >= 10) {
          offerText = 'Great Deal!';
        } else if (parseInt(discountPercent) >= 5) {
          offerText = 'Save More!';
        }
        if (offerText) {
          offerEl.textContent = offerText;
          offerEl.style.cssText = "\n            color: #fd0000 !important;\n            font-weight: bold !important;\n            font-size: 11px !important;\n            display: inline !important;\n            visibility: visible !important;\n            opacity: 1 !important;\n            margin-left: 4px !important;\n          ";
          populatedCount++;
          console.log("\u2705 Populated hulk-offer-text with \"".concat(offerText, "\" for ").concat(discountPercent, "% discount"));
        }
      }
    });
    if (populatedCount > 0) {
      console.log("\uD83C\uDF89 Successfully populated ".concat(populatedCount, " hulk-offer-text elements"));
    } else if (offerTextElements.length === 0) {
      console.log('❌ No hulk-offer-text elements found');
    } else {
      console.log('ℹ️ All hulk-offer-text elements already have content or no discount found');
    }
    return populatedCount;
  }

  // Alternative approach: Check if HulkApps has specific offer text logic
  function checkHulkAppsConfig() {
    // Look for HulkApps configuration or data
    var hulkConfig = window.hulkapps_volume_breaks || window.hulkVolumeBreaks || {};
    console.log('🔧 HulkApps config found:', Object.keys(hulkConfig).length > 0 ? hulkConfig : 'No config found');

    // Check if there's product-specific data
    var productData = window.product || {};
    if (productData.id) {
      console.log('📦 Product ID:', productData.id);
    }
    return hulkConfig;
  }

  // Enhanced population with HulkApps data
  function populateWithHulkData() {
    var config = checkHulkAppsConfig();

    // Look for volume break data in various places
    var volumeData = config.volume_breaks || config.breaks || [];
    if (volumeData.length > 0) {
      console.log('📊 Found volume break data:', volumeData);
      volumeData.forEach(function (breakData, index) {
        var offerTextEl = document.querySelector(".hulk-offer-text:nth-of-type(".concat(index + 1, ")"));
        if (offerTextEl && !offerTextEl.textContent.trim()) {
          var offerText = breakData.offer_text || breakData.message || "".concat(breakData.discount, "% Off");
          offerTextEl.textContent = offerText;
          console.log("\u2705 Set offer text from data: \"".concat(offerText, "\""));
        }
      });
    } else {
      // Fallback to our discount-based approach
      return populateOfferText();
    }
  }

  // Main initialization function
  function init() {
    console.log('🚀 Initializing hulk-offer-text fix...');

    // Try multiple approaches with delays
    var delays = [100, 500, 1000, 2000, 3000, 5000];
    delays.forEach(function (delay) {
      setTimeout(function () {
        console.log("\u23F0 Running hulk-offer-text fix at ".concat(delay, "ms..."));

        // First try with HulkApps data
        var populated = populateWithHulkData();

        // If that didn't work, try our fallback
        if (!populated) {
          populateOfferText();
        }
      }, delay);
    });

    // Continuous monitoring
    setInterval(function () {
      var emptyElements = document.querySelectorAll('.hulk-offer-text:empty, .hulk-offer-text[data-empty="true"]');
      if (emptyElements.length > 0) {
        console.log("\uD83D\uDD04 Found ".concat(emptyElements.length, " empty hulk-offer-text elements, attempting to populate..."));
        populateOfferText();
      }
    }, 3000);
  }

  // DOM ready initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Watch for HulkApps mutations
  var observer = new MutationObserver(function (mutations) {
    var shouldCheck = false;
    mutations.forEach(function (mutation) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType === 1) {
            if (node.matches && (node.matches('.hulk-offer-text') || node.querySelector('.hulk-offer-text'))) {
              shouldCheck = true;
            }
          }
        });
      }
    });
    if (shouldCheck) {
      console.log('🔄 New hulk-offer-text elements detected');
      setTimeout(populateOfferText, 100);
    }
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  // Shopify events
  document.addEventListener('shopify:section:load', function () {
    setTimeout(populateOfferText, 200);
  });
  document.addEventListener('variant:change', function () {
    setTimeout(populateOfferText, 300);
  });

  // Global access for testing
  window.populateHulkOfferText = populateOfferText;
  window.checkHulkAppsConfig = checkHulkAppsConfig;
  console.log('🎉 hulk-offer-text fix initialized!');
  console.log('💡 Use window.populateHulkOfferText() to run manually');
  console.log('🔧 Use window.checkHulkAppsConfig() to inspect HulkApps data');
})();
/******/ })()
;