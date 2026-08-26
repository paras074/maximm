/******/ (() => { // webpackBootstrap
/*!*******************************!*\
  !*** ./scripts/hulk-debug.js ***!
  \*******************************/
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
// Debug script for HulkApps hulk-offer-text issues
(function () {
  function debugHulkOfferText() {
    console.log('🔍 === HulkApps DEBUG ANALYSIS ===');

    // Find all hulk-offer-text elements
    var offerElements = document.querySelectorAll('.hulk-offer-text');
    console.log("\uD83D\uDCCA Found ".concat(offerElements.length, " hulk-offer-text elements"));
    offerElements.forEach(function (el, index) {
      console.log("\n\uD83C\uDFF7\uFE0F  Element ".concat(index + 1, ":"));
      console.log('   Content:', "\"".concat(el.textContent, "\""));
      console.log('   innerHTML:', "\"".concat(el.innerHTML, "\""));
      console.log('   Display:', window.getComputedStyle(el).display);
      console.log('   Visibility:', window.getComputedStyle(el).visibility);
      console.log('   Opacity:', window.getComputedStyle(el).opacity);

      // Check parent context
      var parentRow = el.closest('tr');
      if (parentRow) {
        var _parentRow$cells$, _parentRow$cells$2;
        var quantityText = ((_parentRow$cells$ = parentRow.cells[0]) === null || _parentRow$cells$ === void 0 ? void 0 : _parentRow$cells$.textContent) || 'N/A';
        var discountText = ((_parentRow$cells$2 = parentRow.cells[1]) === null || _parentRow$cells$2 === void 0 ? void 0 : _parentRow$cells$2.textContent) || 'N/A';
        console.log('   Row context - Qty:', quantityText, '| Discount:', discountText);
      }
    });

    // Check for HulkApps global variables
    console.log('\n🌐 Global HulkApps variables:');
    console.log('   window.hulkapps_volume_breaks:', _typeof(window.hulkapps_volume_breaks));
    console.log('   window.hulkVolumeBreaks:', _typeof(window.hulkVolumeBreaks));
    console.log('   window.hulkapps_config:', _typeof(window.hulkapps_config));
    console.log('   window.HULKAPPS:', _typeof(window.HULKAPPS));

    // Check for HulkApps scripts
    var hulkScripts = Array.from(document.querySelectorAll('script')).filter(function (script) {
      return script.src.includes('hulk') || script.textContent.includes('hulk');
    });
    console.log("\n\uD83D\uDCDC Found ".concat(hulkScripts.length, " HulkApps-related scripts"));

    // Check CSS that might be hiding elements
    var hiddenOffers = Array.from(offerElements).filter(function (el) {
      var styles = window.getComputedStyle(el);
      return styles.display === 'none' || styles.visibility === 'hidden' || styles.opacity === '0';
    });
    if (hiddenOffers.length > 0) {
      console.log("\n\uD83D\uDE48 ".concat(hiddenOffers.length, " hulk-offer-text elements are hidden by CSS"));
    }

    // Check for mutation observers
    console.log('\n👁️  MutationObserver count on document:', document._observers ? document._observers.length : 'Unknown');
    console.log('\n✅ Debug analysis complete!');
  }

  // Run debug immediately and on delays
  debugHulkOfferText();
  setTimeout(function () {
    console.log('\n⏰ Running debug after 2 seconds...');
    debugHulkOfferText();
  }, 2000);
  setTimeout(function () {
    console.log('\n⏰ Running debug after 5 seconds...');
    debugHulkOfferText();
  }, 5000);

  // Make available globally
  window.debugHulkOfferText = debugHulkOfferText;
  console.log('🐛 HulkApps debug script loaded! Use window.debugHulkOfferText() anytime.');
})();
/******/ })()
;