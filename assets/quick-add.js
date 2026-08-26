if (!customElements.get('quick-add-modal')) {
  customElements.define(
    'quick-add-modal',
    class QuickAddModal extends ModalDialog {
      constructor() {
        super();
        this.modalContent = this.querySelector('[id^="QuickAddInfo-"]');
      }

      hide(preventFocus = false) {
        const cartNotification = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
        if (cartNotification) cartNotification.setActiveElement(this.openedBy);

        // Clean up all event handlers
        if (this._thumbnailMouseEnterHandler) {
          document.body.removeEventListener('mouseenter', this._thumbnailMouseEnterHandler, true);
          this._thumbnailMouseEnterHandler = null;
        }

        if (this._thumbnailMouseLeaveHandler) {
          document.body.removeEventListener('mouseleave', this._thumbnailMouseLeaveHandler, true);
          this._thumbnailMouseLeaveHandler = null;
        }

        if (this._thumbnailClickHandler) {
          document.body.removeEventListener('click', this._thumbnailClickHandler, true);
          this._thumbnailClickHandler = null;
        }

        // Reset initialization flags
        this._thumbnailClickInitialized = false;

        this.modalContent.innerHTML = '';

        if (preventFocus) this.openedBy = null;
        super.hide();
      }

      show(opener) {
        opener.setAttribute('aria-disabled', true);
        opener.classList.add('loading');
        opener.querySelector('.loading__spinner').classList.remove('hidden');

        fetch(opener.getAttribute('data-product-url'))
          .then((response) => response.text())
          .then((responseText) => {
            const responseHTML = new DOMParser().parseFromString(responseText, 'text/html');
            this.productElement = responseHTML.querySelector('product-info[id^="MainProduct-"]');
            this.productElement.classList.forEach((classApplied) => {
              if (classApplied.startsWith('color-') || classApplied === 'gradient')
                this.modalContent.classList.add(classApplied);
            });
            this.preventDuplicatedIDs();
            this.removeDOMElements();
            this.setInnerHTML(this.modalContent, this.productElement.innerHTML);

            if (window.Shopify && Shopify.PaymentButton) {
              Shopify.PaymentButton.init();
            }

            if (window.ProductModel) window.ProductModel.loadShopifyXR();

            this.removeGalleryListSemantic();
            this.updateImageSizes();
            this.preventVariantURLSwitching();
            this.initModalThumbnailHover();
            this.observeVariantChanges();
            super.show(opener);
          })
          .finally(() => {
            opener.removeAttribute('aria-disabled');
            opener.classList.remove('loading');
            opener.querySelector('.loading__spinner').classList.add('hidden');
          });
      }

      setInnerHTML(element, html) {
        element.innerHTML = html;

        // Reinjects the script tags to allow execution. By default, scripts are disabled when using element.innerHTML.
        element.querySelectorAll('script').forEach((oldScriptTag) => {
          const newScriptTag = document.createElement('script');
          Array.from(oldScriptTag.attributes).forEach((attribute) => {
            newScriptTag.setAttribute(attribute.name, attribute.value);
          });
          newScriptTag.appendChild(document.createTextNode(oldScriptTag.innerHTML));
          oldScriptTag.parentNode.replaceChild(newScriptTag, oldScriptTag);
        });
      }

      preventVariantURLSwitching() {
        const variantPicker = this.modalContent.querySelector('variant-selects');
        if (!variantPicker) return;

        variantPicker.setAttribute('data-update-url', 'false');
      }

      removeDOMElements() {
        const pickupAvailability = this.productElement.querySelector('pickup-availability');
        if (pickupAvailability) pickupAvailability.remove();

        const productModal = this.productElement.querySelector('product-modal');
        if (productModal) productModal.remove();

        const modalDialog = this.productElement.querySelectorAll('modal-dialog');
        if (modalDialog) modalDialog.forEach((modal) => modal.remove());
      }

      preventDuplicatedIDs() {
        const sectionId = this.productElement.dataset.section;
        this.productElement.innerHTML = this.productElement.innerHTML.replaceAll(sectionId, `quickadd-${sectionId}`);
        this.productElement.querySelectorAll('variant-selects, product-info').forEach((element) => {
          element.dataset.originalSection = sectionId;
        });
      }

      removeGalleryListSemantic() {
        const galleryList = this.modalContent.querySelector('[id^="Slider-Gallery"]');
        if (!galleryList) return;

        galleryList.setAttribute('role', 'presentation');
        galleryList.querySelectorAll('[id^="Slide-"]').forEach((li) => li.setAttribute('role', 'presentation'));
      }

      updateImageSizes() {
        const product = this.modalContent.querySelector('.product');
        const desktopColumns = product.classList.contains('product--columns');
        if (!desktopColumns) return;

        const mediaImages = product.querySelectorAll('.product__media img');
        if (!mediaImages.length) return;

        let mediaImageSizes =
          '(min-width: 1000px) 715px, (min-width: 750px) calc((100vw - 11.5rem) / 2), calc(100vw - 4rem)';

        if (product.classList.contains('product--medium')) {
          mediaImageSizes = mediaImageSizes.replace('715px', '605px');
        } else if (product.classList.contains('product--small')) {
          mediaImageSizes = mediaImageSizes.replace('715px', '495px');
        }

        mediaImages.forEach((img) => img.setAttribute('sizes', mediaImageSizes));
      }

      initModalThumbnailHover() {
        // Hover AND click functionality using body-level event delegation
        // This works even after variant changes (DOM updates)

        if (this._thumbnailClickInitialized) {
          return;
        }

        // Check if modal content exists
        if (!this.modalContent) {
          return;
        }

        this._thumbnailClickInitialized = true;

        // Store reference to modal
        const modal = this;

        // Store the original (clicked) selection - this persists across hovers
        let storedOriginalSelection = null;

        // Helper function to get current active elements from DOM
        const getCurrentSelection = () => {
          const mainSlider = modal.modalContent?.querySelector('.slider-main');
          const thumbnailSlider = modal.modalContent?.querySelector('.thumbnail-slider.show-on-quick-add');

          if (!mainSlider || !thumbnailSlider) return null;

          return {
            slide: mainSlider.querySelector('.product__media-item.is-active'),
            button: thumbnailSlider.querySelector('button[aria-current="true"]'),
            mainSlider: mainSlider,
            thumbnailSlider: thumbnailSlider
          };
        };

        // Initialize stored selection
        storedOriginalSelection = getCurrentSelection();

        // Helper function to restore to stored original (after hover leaves)
        const restoreOriginalSelection = () => {
          // Re-query the stored selection in case DOM changed (variant change)
          const current = getCurrentSelection();
          if (!current) return;

          // Get the current "aria-current" button (the clicked one)
          const originalButton = current.thumbnailSlider.querySelector('button[aria-current="true"]');
          if (!originalButton) return;

          const originalThumbnailItem = originalButton.closest('.thumbnail-list__item');
          if (!originalThumbnailItem) return;

          const originalTargetId = originalThumbnailItem.getAttribute('data-target');
          if (!originalTargetId) return;

          const originalSlide = current.mainSlider.querySelector(`[data-media-id="${originalTargetId}"]`);
          if (!originalSlide) return;

          // Restore ONLY the main image (not thumbnail states)
          const mainSlides = current.mainSlider.querySelectorAll('.product__media-item');
          mainSlides.forEach((slide) => slide.classList.remove('is-active'));
          originalSlide.classList.add('is-active');
        };

        // Helper function to preview thumbnail on hover (temporary)
        const previewThumbnail = (button, thumbnailItem) => {
          const thumbnailSlider = thumbnailItem.closest('.thumbnail-slider.show-on-quick-add');
          if (!thumbnailSlider) return false;

          if (!modal.modalContent.contains(thumbnailSlider)) return false;

          const mainSlider = modal.modalContent.querySelector('.slider-main');
          if (!mainSlider) return false;

          const targetId = thumbnailItem.getAttribute('data-target');
          if (!targetId) return false;

          const targetSlide = mainSlider.querySelector(`[data-media-id="${targetId}"]`);
          if (!targetSlide) return false;

          // Update ONLY main slides (not thumbnail states - keep aria-current on clicked one)
          const mainSlides = mainSlider.querySelectorAll('.product__media-item');
          mainSlides.forEach((slide) => slide.classList.remove('is-active'));
          targetSlide.classList.add('is-active');

          return true;
        };

        // Helper function to permanently select thumbnail on click
        const selectThumbnail = (button, thumbnailItem) => {
          const thumbnailSlider = thumbnailItem.closest('.thumbnail-slider.show-on-quick-add');
          if (!thumbnailSlider) return false;

          if (!modal.modalContent.contains(thumbnailSlider)) return false;

          const mainSlider = modal.modalContent.querySelector('.slider-main');
          if (!mainSlider) return false;

          const targetId = thumbnailItem.getAttribute('data-target');
          if (!targetId) return false;

          const targetSlide = mainSlider.querySelector(`[data-media-id="${targetId}"]`);
          if (!targetSlide) return false;

          // Update main slides
          const mainSlides = mainSlider.querySelectorAll('.product__media-item');
          mainSlides.forEach((slide) => slide.classList.remove('is-active'));
          targetSlide.classList.add('is-active');

          // Update thumbnail buttons (this makes it permanent)
          const thumbnailButtons = thumbnailSlider.querySelectorAll('.thumbnail-list__item button');
          thumbnailButtons.forEach((btn) => {
            btn.removeAttribute('aria-current');
            btn.closest('.thumbnail-list__item')?.classList.remove('slider__slide--current');
          });

          button.setAttribute('aria-current', 'true');
          thumbnailItem.classList.add('slider__slide--current');

          // Update stored selection
          storedOriginalSelection = getCurrentSelection();

          return true;
        };

        // MOUSEENTER handler - show TEMPORARY preview on hover
        const handleThumbnailMouseEnter = (e) => {
          // Only handle in THIS modal
          if (!modal.hasAttribute('open') || !modal.contains(e.target)) {
            return;
          }

          const button = e.target.closest('button');
          if (!button) return;

          const thumbnailItem = button.closest('.thumbnail-list__item');
          if (!thumbnailItem) return;

          const thumbnailSlider = thumbnailItem.closest('.thumbnail-slider.show-on-quick-add');
          if (!thumbnailSlider) return;

          // Preview this thumbnail (TEMPORARY - only changes main image)
          previewThumbnail(button, thumbnailItem);
        };

        // MOUSELEAVE handler - restore clicked selection
        const handleThumbnailMouseLeave = (e) => {
          // Only handle in THIS modal
          if (!modal.hasAttribute('open') || !modal.contains(e.target)) {
            return;
          }

          const button = e.target.closest('button');
          if (!button) return;

          const thumbnailItem = button.closest('.thumbnail-list__item');
          if (!thumbnailItem) return;

          const thumbnailSlider = thumbnailItem.closest('.thumbnail-slider.show-on-quick-add');
          if (!thumbnailSlider) return;

          // Restore back to the clicked (permanent) selection
          restoreOriginalSelection();
        };

        // CLICK handler - make selection PERMANENT
        const handleThumbnailClick = (e) => {
          // Only handle clicks in THIS modal
          if (!modal.hasAttribute('open') || !modal.contains(e.target)) {
            return;
          }

          const button = e.target.closest('button');
          if (!button) return;

          const thumbnailItem = button.closest('.thumbnail-list__item');
          if (!thumbnailItem) return;

          const thumbnailSlider = thumbnailItem.closest('.thumbnail-slider.show-on-quick-add');
          if (!thumbnailSlider) return;

          if (!modal.modalContent.contains(thumbnailSlider)) return;

          // Prevent default to avoid any unwanted behavior
          e.preventDefault();
          e.stopPropagation();

          // Select this thumbnail PERMANENTLY (updates aria-current and stored selection)
          selectThumbnail(button, thumbnailItem);
        };

        // Attach all handlers to body with capture phase
        document.body.addEventListener('mouseenter', handleThumbnailMouseEnter, true);
        document.body.addEventListener('mouseleave', handleThumbnailMouseLeave, true);
        document.body.addEventListener('click', handleThumbnailClick, true);

        // Store handlers for cleanup
        this._thumbnailMouseEnterHandler = handleThumbnailMouseEnter;
        this._thumbnailMouseLeaveHandler = handleThumbnailMouseLeave;
        this._thumbnailClickHandler = handleThumbnailClick;
      }

      updateModalThumbnailSelection() {
        // Not needed with body-level delegation
        return;
      }

      observeVariantChanges() {
        // Not needed with body-level delegation
        return;
      }
    }
  );
}
