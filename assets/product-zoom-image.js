/******/ (() => { // webpackBootstrap
/*!***************************************!*\
  !*** ./scripts/product-zoom-image.js ***!
  \***************************************/
// Global flag to prevent multiple document event listeners
var lightboxDocumentListenerAttached = false;
function initializeLightbox() {
  // Drag functionality for zoomed images
  function enableDrag(element) {
    var isDragging = false;
    var hasDragged = false;
    var startX, startY;
    var currentX = 0,
      currentY = 0;

    // Store references to functions so they can be removed later
    element._dragHandlers = {
      startDrag: function startDrag(e) {
        e.preventDefault();
        isDragging = true;
        hasDragged = false;
        element.classList.add('dragging');
        element.style.cursor = 'grabbing';
        startX = e.clientX - currentX;
        startY = e.clientY - currentY;

        // Add listeners to document to handle drag outside element
        document.addEventListener('mousemove', element._dragHandlers.drag);
        document.addEventListener('mouseup', element._dragHandlers.stopDrag);
      },
      drag: function drag(e) {
        if (!isDragging) return;
        e.preventDefault();

        // Mark that we've actually dragged
        hasDragged = true;
        var scale = 2;
        var rect = element.getBoundingClientRect();
        var container = element.parentElement.getBoundingClientRect();

        // Calculate new position
        var newX = e.clientX - startX;
        var newY = e.clientY - startY;

        // Calculate boundaries
        // When scaled, the image is larger, so we need to constrain movement
        var scaledWidth = rect.width / scale * 2;
        var scaledHeight = rect.height / scale * 2;

        // Maximum allowed translation (in the scaled coordinate system)
        // Divide by scale because translate happens before scale in transform
        var maxX = (scaledWidth - container.width) / 2 / scale;
        var maxY = (scaledHeight - container.height) / 2 / scale;

        // Constrain X
        if (maxX > 0) {
          newX = Math.max(-maxX, Math.min(maxX, newX));
        } else {
          newX = 0;
        }

        // Constrain Y
        if (maxY > 0) {
          newY = Math.max(-maxY, Math.min(maxY, newY));
        } else {
          newY = 0;
        }
        currentX = newX;
        currentY = newY;
        element.style.transform = "scale(2) translate(".concat(currentX, "px, ").concat(currentY, "px)");
      },
      stopDrag: function stopDrag() {
        isDragging = false;
        element.classList.remove('dragging');
        element.style.cursor = 'grab';

        // Remove document listeners
        document.removeEventListener('mousemove', element._dragHandlers.drag);
        document.removeEventListener('mouseup', element._dragHandlers.stopDrag);

        // If we dragged, prevent the click event
        if (hasDragged) {
          element._preventClick = true;
          setTimeout(function () {
            element._preventClick = false;
          }, 10);
        }
      }
    };

    // Reset position when enabling drag
    currentX = 0;
    currentY = 0;
    element.addEventListener('mousedown', element._dragHandlers.startDrag);
  }
  function disableDrag(element) {
    if (element._dragHandlers) {
      element.removeEventListener('mousedown', element._dragHandlers.startDrag);
      document.removeEventListener('mousemove', element._dragHandlers.drag);
      document.removeEventListener('mouseup', element._dragHandlers.stopDrag);
      element._dragHandlers = null;
    }
    element.classList.remove('dragging');
    element.style.transform = 'scale(1)';
  }

  // Elements
  var lightboxOverlay = document.querySelector('.lightbox-overlay');
  if (!lightboxOverlay) return; // Exit if lightbox doesn't exist

  var closeBtn = document.querySelector('.lightbox-container .close-btn');
  var tabBtns = document.querySelectorAll('.tab-btn');
  var tabContents = document.querySelectorAll('.tab-content');

  // Helper function to load image with loader
  function loadImageWithLoader(src, mainImage, loader) {
    // Show loader
    if (loader) {
      loader.classList.remove('hidden');
    }
    mainImage.style.opacity = '0';
    mainImage.style.minHeight = '400px'; // Set min height to prevent collapse

    // Create new image to preload
    var newImage = new Image();
    newImage.onload = function () {
      mainImage.src = src;
      mainImage.style.transform = 'scale(1)';
      mainImage.style.cursor = 'zoom-in';
      mainImage.style.opacity = '1';
      mainImage.style.minHeight = ''; // Remove min height once loaded

      // Hide loader
      if (loader) {
        loader.classList.add('hidden');
      }
    };
    newImage.onerror = function () {
      // Hide loader even on error
      if (loader) {
        loader.classList.add('hidden');
      }
      mainImage.style.opacity = '1';
      mainImage.style.minHeight = ''; // Remove min height on error
    };

    // Start loading
    newImage.src = src;
  }

  // Helper function to update arrow visibility based on item count
  function updateArrowVisibility() {
    var lightboxOverlay = document.querySelector('.lightbox-overlay');
    if (!lightboxOverlay || lightboxOverlay.style.display !== 'flex') return;
    var activeTab = document.querySelector('.tab-btn.active');
    if (!activeTab) return;
    var tabId = activeTab.dataset.tab;
    var thumbnails = document.querySelectorAll("#".concat(tabId, " .thumbnail"));
    var arrows = document.querySelectorAll("#".concat(tabId, " .lightbox-arrow"));

    // Show arrows only if there are more than 1 items
    if (thumbnails.length > 1) {
      arrows.forEach(function (arrow) {
        arrow.style.display = 'flex';
      });
    } else {
      arrows.forEach(function (arrow) {
        arrow.style.display = 'none';
      });
    }
  }

  // Arrow navigation helper
  function navigateImages(direction) {
    var lightboxOverlay = document.querySelector('.lightbox-overlay');
    if (!lightboxOverlay || lightboxOverlay.style.display !== 'flex') return;
    var activeTab = document.querySelector('.tab-btn.active');
    if (!activeTab) return;
    var tabId = activeTab.dataset.tab;
    var thumbnails = Array.from(document.querySelectorAll("#".concat(tabId, " .thumbnail")));
    var activeThumbnail = thumbnails.find(function (t) {
      return t.classList.contains('active');
    });
    if (!activeThumbnail) {
      if (thumbnails[0]) {
        thumbnails[0].click();
      }
      return;
    }
    var currentIndex = thumbnails.indexOf(activeThumbnail);
    var newIndex;
    if (direction === 'next') {
      newIndex = currentIndex + 1 >= thumbnails.length ? 0 : currentIndex + 1;
    } else {
      newIndex = currentIndex - 1 < 0 ? thumbnails.length - 1 : currentIndex - 1;
    }
    if (thumbnails[newIndex]) {
      thumbnails[newIndex].click();
    }
  }

  // ALL event delegation - attach once to body
  if (!lightboxDocumentListenerAttached) {
    document.body.addEventListener('click', function (e) {
      // Check if clicking on video thumbnail FIRST (before general lightbox trigger)
      var videoThumbnailWithTrigger = e.target.closest('.thumbnail-list__item[data-video-tab="true"]');
      if (videoThumbnailWithTrigger) {
        e.preventDefault();
        e.stopPropagation();

        // Open lightbox with Videos tab active
        setTimeout(function () {
          var lightboxOverlay = document.querySelector('.lightbox-overlay');
          var tabBtns = document.querySelectorAll('.tab-btn');
          var tabContents = document.querySelectorAll('.tab-content');

          // Show lightbox with animation
          lightboxOverlay.style.display = 'flex';
          setTimeout(function () {
            lightboxOverlay.classList.add('show');
          }, 10);
          document.body.style.overflow = 'hidden';
          document.body.classList.add('lightbox-open');

          // Switch to Videos tab
          var tabId = 'videos';

          // Update tabs
          tabBtns.forEach(function (btn) {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
          });

          // Update tab contents
          tabContents.forEach(function (content) {
            content.classList.toggle('active', content.id === tabId);
          });

          // Activate the first video thumbnail to load the video
          setTimeout(function () {
            var firstVideoThumb = document.querySelector('#videos .thumbnail');
            if (firstVideoThumb) {
              firstVideoThumb.click();
            }

            // Update arrow visibility
            updateArrowVisibility();
          }, 100);
        }, 30);
        return;
      }

      // Check if clicking on 4th thumbnail with lightbox trigger (but NOT video thumbnail)
      var thumbnailWithTrigger = e.target.closest('.thumbnail-list__item[data-lightbox-trigger="true"]');
      if (thumbnailWithTrigger && !thumbnailWithTrigger.hasAttribute('data-video-tab')) {
        e.preventDefault();
        e.stopPropagation();

        // Open lightbox with current active slide
        setTimeout(function () {
          var item = document.querySelector('.slider-main li.is-active');
          if (!item) return;
          var type = item.dataset.type;
          var src = item.dataset.src;
          var lightboxOverlay = document.querySelector('.lightbox-overlay');
          var tabBtns = document.querySelectorAll('.tab-btn');
          var tabContents = document.querySelectorAll('.tab-content');

          // Show lightbox with animation
          lightboxOverlay.style.display = 'flex';
          setTimeout(function () {
            lightboxOverlay.classList.add('show');
          }, 10);
          document.body.style.overflow = 'hidden';
          document.body.classList.add('lightbox-open');

          // Switch to appropriate tab
          var tabId = type === 'video' ? 'videos' : 'images';

          // Update tabs
          tabBtns.forEach(function (btn) {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
          });

          // Update tab contents
          tabContents.forEach(function (content) {
            content.classList.toggle('active', content.id === tabId);
          });

          // Update content
          if (type === 'video') {
            var mainVideo = document.querySelector('.main-video video');
            mainVideo.src = src;
          } else {
            var mainImage = document.querySelector('.main-image');
            var loader = document.querySelector('.lightbox-loader');
            loadImageWithLoader(src, mainImage, loader);

            // Add click event for zoom functionality with drag support
            mainImage.onclick = function (e) {
              // Prevent zoom toggle if we just finished dragging
              if (this._preventClick) {
                e.preventDefault();
                return;
              }
              if (this.style.transform === 'scale(1)' || this.style.transform === '') {
                this.style.transform = 'scale(2)';
                this.style.cursor = 'grab';
                enableDrag(this);
              } else {
                this.style.transform = 'scale(1)';
                this.style.cursor = 'zoom-in';
                disableDrag(this);
              }
            };
          }

          // Update thumbnails
          var thumbnails = document.querySelectorAll("#".concat(tabId, " .thumbnail"));
          thumbnails.forEach(function (thumb) {
            thumb.classList.toggle('active', thumb.dataset.src === src);
          });

          // Update arrow visibility
          updateArrowVisibility();
        }, 30);
        return;
      }

      // Open lightbox from slider
      var sliderItem = e.target.closest('.slider-main .slider__slide');
      if (sliderItem) {
        var type = sliderItem.dataset.type;
        var src = sliderItem.dataset.src;
        var _lightboxOverlay = document.querySelector('.lightbox-overlay');
        if (!_lightboxOverlay) return;
        var _tabBtns = document.querySelectorAll('.tab-btn');
        var _tabContents = document.querySelectorAll('.tab-content');

        // Show lightbox with animation
        _lightboxOverlay.style.display = 'flex';
        setTimeout(function () {
          _lightboxOverlay.classList.add('show');
        }, 10);
        document.body.style.overflow = 'hidden';
        document.body.classList.add('lightbox-open');

        // Switch to appropriate tab
        var tabId = type === 'video' ? 'videos' : 'images';

        // Update tabs
        _tabBtns.forEach(function (btn) {
          btn.classList.toggle('active', btn.dataset.tab === tabId);
        });

        // Update tab contents
        _tabContents.forEach(function (content) {
          content.classList.toggle('active', content.id === tabId);
        });

        // Update content
        if (type === 'video') {
          var mainVideo = document.querySelector('.main-video video');
          mainVideo.src = src;
        } else {
          var mainImage = document.querySelector('.main-image');
          var loader = document.querySelector('.lightbox-loader');
          loadImageWithLoader(src, mainImage, loader);

          // Add click event for zoom functionality with drag support
          mainImage.onclick = function (e) {
            // Prevent zoom toggle if we just finished dragging
            if (this._preventClick) {
              e.preventDefault();
              return;
            }
            if (this.style.transform === 'scale(1)' || this.style.transform === '') {
              this.style.transform = 'scale(2)';
              this.style.cursor = 'grab';
              enableDrag(this);
            } else {
              this.style.transform = 'scale(1)';
              this.style.cursor = 'zoom-in';
              disableDrag(this);
            }
          };
        }

        // Update thumbnails
        var thumbnails = document.querySelectorAll("#".concat(tabId, " .thumbnail"));
        thumbnails.forEach(function (thumb) {
          thumb.classList.toggle('active', thumb.dataset.src == src);
        });

        // Update arrow visibility
        updateArrowVisibility();
        return;
      }

      // Open lightbox from trigger button
      var lightboxTrigger = e.target.closest('.product-lightbox-trigger');
      if (lightboxTrigger) {
        setTimeout(function () {
          var item = document.querySelector('.slider-main li.is-active');
          if (!item) return;
          var type = item.dataset.type;
          var src = item.dataset.src;
          var label = item.dataset.label;
          var lightboxOverlay = document.querySelector('.lightbox-overlay');
          var tabBtns = document.querySelectorAll('.tab-btn');
          var tabContents = document.querySelectorAll('.tab-content');

          // Show lightbox with animation
          lightboxOverlay.style.display = 'flex';
          setTimeout(function () {
            lightboxOverlay.classList.add('show');
          }, 10);
          document.body.style.overflow = 'hidden';
          document.body.classList.add('lightbox-open');

          // Switch to appropriate tab
          var tabId = type === 'video' ? 'videos' : 'images';

          // Update tabs
          tabBtns.forEach(function (btn) {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
          });

          // Update tab contents
          tabContents.forEach(function (content) {
            content.classList.toggle('active', content.id === tabId);
          });

          // Update content
          if (type === 'video') {
            var _mainVideo = document.querySelector('.main-video video');
            _mainVideo.src = src;
          } else {
            var _mainImage = document.querySelector('.main-image');
            var _loader = document.querySelector('.lightbox-loader');
            loadImageWithLoader(src, _mainImage, _loader);

            // Add click event for zoom functionality with drag support
            _mainImage.onclick = function (e) {
              // Prevent zoom toggle if we just finished dragging
              if (this._preventClick) {
                e.preventDefault();
                return;
              }
              if (this.style.transform === 'scale(1)' || this.style.transform === '') {
                this.style.transform = 'scale(2)';
                this.style.cursor = 'grab';
                enableDrag(this);
              } else {
                this.style.transform = 'scale(1)';
                this.style.cursor = 'zoom-in';
                disableDrag(this);
              }
            };
          }

          // Update thumbnails
          var thumbnails = document.querySelectorAll("#".concat(tabId, " .thumbnail"));
          thumbnails.forEach(function (thumb) {
            thumb.classList.toggle('active', thumb.dataset.src === src);
          });

          // Update arrow visibility
          updateArrowVisibility();
        }, 30);
        return;
      }

      // Close button
      if (e.target.closest('.lightbox-container .close-btn')) {
        closeLightbox();
        return;
      }

      // Close on overlay click (outside content)
      if (e.target.classList.contains('lightbox-overlay')) {
        closeLightbox();
        return;
      }

      // Arrow navigation
      var arrowButton = e.target.closest('button.lightbox-arrow');
      if (arrowButton) {
        e.preventDefault();
        e.stopPropagation();
        if (arrowButton.classList.contains('lightbox-arrow--prev')) {
          navigateImages('prev');
        } else if (arrowButton.classList.contains('lightbox-arrow--next')) {
          navigateImages('next');
        }
        return;
      }

      // Tab switching
      var tabBtn = e.target.closest('.tab-btn');
      if (tabBtn) {
        var _tabId = tabBtn.dataset.tab;
        var _tabBtns2 = document.querySelectorAll('.tab-btn');
        var _tabContents2 = document.querySelectorAll('.tab-content');

        // Pause all videos when switching tabs
        var _lightboxOverlay2 = document.querySelector('.lightbox-overlay');
        if (_lightboxOverlay2) {
          var videoElements = _lightboxOverlay2.querySelectorAll('video');
          videoElements.forEach(function (video) {
            video.pause();
            video.muted = true;
          });
          var iframes = _lightboxOverlay2.querySelectorAll('iframe');
          iframes.forEach(function (iframe) {
            if (iframe.src.includes('youtube.com')) {
              iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
            } else if (iframe.src.includes('vimeo.com')) {
              iframe.contentWindow.postMessage('{"method":"pause"}', '*');
            }
          });
        }

        // Update tabs
        _tabBtns2.forEach(function (b) {
          return b.classList.toggle('active', b === tabBtn);
        });

        // Update tab contents
        _tabContents2.forEach(function (content) {
          content.classList.toggle('active', content.id === _tabId);
        });

        // Update content
        var _thumbnails = document.querySelectorAll("#".concat(_tabId, " .thumbnail"));
        _thumbnails.forEach(function (thumb, index) {
          thumb.classList.toggle('active', index === 0);
        });
        var firstThumb = _thumbnails[0];
        if (!firstThumb) return;
        var dataSrc = firstThumb.dataset.src;
        if (_tabId === 'videos') {
          var _mainVideo2 = document.querySelector('.main-video video');
          _mainVideo2.src = dataSrc;
        } else {
          var _mainImage2 = document.querySelector('.main-image');
          var _loader2 = document.querySelector('.lightbox-loader');
          loadImageWithLoader(dataSrc, _mainImage2, _loader2);

          // Add click event for zoom functionality with drag support
          _mainImage2.onclick = function (e) {
            // Prevent zoom toggle if we just finished dragging
            if (this._preventClick) {
              e.preventDefault();
              return;
            }
            if (this.style.transform === 'scale(1)' || this.style.transform === '') {
              this.style.transform = 'scale(2)';
              this.style.cursor = 'grab';
              enableDrag(this);
            } else {
              this.style.transform = 'scale(1)';
              this.style.cursor = 'zoom-in';
              disableDrag(this);
            }
          };
        }

        // Update arrow visibility
        updateArrowVisibility();
        return;
      }

      // Thumbnail clicks
      var thumb = e.target.closest('.thumbnail');
      if (thumb) {
        // Make sure it's inside the lightbox
        var _lightboxOverlay3 = thumb.closest('.lightbox-overlay');
        if (!_lightboxOverlay3) return;
        var container = thumb.closest('.main-content');
        var _thumbnails2 = container.querySelectorAll('.thumbnail');
        var _dataSrc = thumb.dataset.src;
        var dataType = thumb.dataset.label;
        var dataPoster = thumb.dataset.poster;

        // Update thumbnails
        _thumbnails2.forEach(function (t) {
          return t.classList.toggle('active', t === thumb);
        });

        // Update content
        if (container.querySelector('.main-image-container')) {
          var _mainImage3 = container.querySelector('.main-image');
          var _loader3 = container.querySelector('.lightbox-loader');
          loadImageWithLoader(_dataSrc, _mainImage3, _loader3);

          // Add click event for zoom functionality with drag support
          _mainImage3.onclick = function (e) {
            // Prevent zoom toggle if we just finished dragging
            if (this._preventClick) {
              e.preventDefault();
              return;
            }
            if (this.style.transform === 'scale(1)' || this.style.transform === '') {
              this.style.transform = 'scale(2)';
              this.style.cursor = 'grab';
              enableDrag(this);
            } else {
              this.style.transform = 'scale(1)';
              this.style.cursor = 'zoom-in';
              disableDrag(this);
            }
          };
        } else {
          var _mainVideo3 = container.querySelector('.main-video video');
          _mainVideo3.src = _dataSrc;
          if (dataType == 'Direct') {
            var innerVideo = "<video playsinline autoplay loop preload=\"none\" muted\n                      poster=\"".concat(dataPoster, "\" data-video=\"0\">\n                      <source src=\"").concat(_dataSrc, "\" type=\"video/mp4\">\n                      <img alt=\"20 FT\" src=\"").concat(dataPoster, "\">\n                      </video>");
            _mainVideo3.innerHTML = innerVideo;
          } else if (dataType == 'Youtube') {
            var _innerVideo = "<iframe frameborder=\"0\"\n                      allow=\"accelerometer; autoplay; encrypted-media; gyroscope;\n                      picture-in-picture\"\n                      allowfullscreen=\"allowfullscreen\"\n                      class=\"js-youtube\"\n                      loading=\"lazy\"\n                      src=\"https://www.youtube.com/embed/".concat(_dataSrc, "?autoplay=1&amp;controls=0&amp;enablejsapi=1&amp;loop=1&amp;modestbranding=1&amp;origin=https%3A%2F%2Fmaximmcable.com&amp;playlist=").concat(_dataSrc, "&amp;playsinline=1&amp;rel=0\">\n                      </iframe>");
            _mainVideo3.innerHTML = _innerVideo;
          } else if (dataType == 'Vimeo') {
            var _innerVideo2 = "<iframe frameborder=\"0\" allow=\"accelerometer; autoplay;\n                      encrypted-media; gyroscope; picture-in-picture\" allowfullscreen=\"allowfullscreen\"\n                      class=\"js-vimeo\"\n                      loading=\"lazy\"\n                      src=\"https://player.vimeo.com/video/".concat(_dataSrc, "?autoplay=1&amp;byline=0&amp;controls=0&amp;loop=1&amp;playsinline=1&amp;title=0\">\n                      </iframe>");
            _mainVideo3.innerHTML = _innerVideo2;
          }
        }
        return;
      }
    });

    // Keyboard events
    document.addEventListener('keydown', function (e) {
      var lightboxOverlay = document.querySelector('.lightbox-overlay');
      if (lightboxOverlay && lightboxOverlay.style.display === 'flex') {
        if (e.key === 'Escape') {
          closeLightbox();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          navigateImages('next');
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          navigateImages('prev');
        }
      }
    });

    // Mark as attached
    lightboxDocumentListenerAttached = true;
  }

  // Close lightbox
  function closeLightbox() {
    var lightboxOverlay = document.querySelector('.lightbox-overlay');
    if (!lightboxOverlay) return;

    // Stop all videos before closing - just pause and mute, don't remove
    var videoElements = lightboxOverlay.querySelectorAll('video');
    videoElements.forEach(function (video) {
      video.pause();
      video.muted = true;
    });

    // Stop iframe videos by pausing them (YouTube API)
    var iframes = lightboxOverlay.querySelectorAll('iframe');
    iframes.forEach(function (iframe) {
      // Send pause command to YouTube/Vimeo iframes
      if (iframe.src.includes('youtube.com')) {
        iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      } else if (iframe.src.includes('vimeo.com')) {
        iframe.contentWindow.postMessage('{"method":"pause"}', '*');
      }
    });
    lightboxOverlay.classList.remove('show');
    lightboxOverlay.classList.add('hide');
    setTimeout(function () {
      lightboxOverlay.style.display = 'none';
      lightboxOverlay.classList.remove('hide');
      document.body.style.overflow = '';
      document.body.classList.remove('lightbox-open');
      var mainImage = document.querySelector('.main-image');
      if (mainImage) {
        mainImage.style.transform = 'scale(1)';
        mainImage.style.cursor = 'zoom-in';
        disableDrag(mainImage);
      }
    }, 300); // Wait for animation to complete
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initializeLightbox);
/******/ })()
;