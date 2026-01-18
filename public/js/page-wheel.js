/**
 * Page Wheel Script
 * Main script for wheel pages
 */

(function() {
  'use strict';

  // State
  let currentPageKey = null;
  let currentPreset = null;
  let currentNames = [];
  let selectedValue = null;
  let settings = { soundEnabled: false, autoHide: false };

  /**
   * Initialize page
   */
  function init() {
    // Get current page preset
    currentPageKey = getCurrentPresetKey();
    currentPreset = getPreset(currentPageKey);

    // Load settings
    settings = Storage.loadSettings();

    // Load saved or default names
    const savedNames = Storage.loadItems(currentPageKey);
    const savedTitle = Storage.loadTitle(currentPageKey);

    currentNames = savedNames || currentPreset.names;

    // Set title
    const title = savedTitle || currentPreset.title;
    document.title = title + ' — Колесо фортуны';
    updateTitleElement(title);

    // Initialize wheel
    const canvas = document.getElementById('wheel');
    if (canvas) {
      WheelCore.init(canvas, currentNames, {
        onSpinEnd: handleSpinEnd
      });
    }

    // Initialize textarea
    const textarea = document.getElementById('names-list');
    if (textarea) {
      textarea.value = currentNames.join('\n');
      textarea.addEventListener('input', handleTextareaChange);
    }

    // Initialize buttons
    setupButtons();

    // Setup hotkeys
    setupHotkeys();

    // Update active category in footer
    updateActiveCategory();

    // Hide overlay on wheel hover
    setupOverlayHandlers();
  }

  /**
   * Update title element
   */
  function updateTitleElement(title) {
    const titleEl = document.querySelector('.pili-page-title');
    if (titleEl) {
      titleEl.textContent = title;
      titleEl.addEventListener('click', handleTitleClick);
    }
  }

  /**
   * Setup buttons
   */
  function setupButtons() {
    // Reset button
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', handleReset);
    }

    // Edit button
    const editBtn = document.getElementById('edit-btn');
    if (editBtn) {
      editBtn.addEventListener('click', handleEdit);
    }

    // Done button
    const doneBtn = document.getElementById('done-btn');
    if (doneBtn) {
      doneBtn.addEventListener('click', handleDone);
    }

    // Restore button
    const restoreBtn = document.getElementById('restore-btn');
    if (restoreBtn) {
      restoreBtn.addEventListener('click', handleRestore);
    }
  }

  /**
   * Setup hotkeys
   */
  function setupHotkeys() {
    document.addEventListener('keydown', function(e) {
      // Ignore if in textarea
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') {
        if (e.key === 'Escape') {
          e.target.blur();
        }
        return;
      }

      switch(e.key) {
        case ' ':
          e.preventDefault();
          WheelCore.spin();
          break;
        case 'r':
        case 'R':
          if (confirm('Вы хотите сбросить настройки?')) {
            handleReset();
          }
          break;
        case 'e':
        case 'E':
          handleEdit();
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 's':
        case 'S':
          if (selectedValue) {
            // Hide selected
            const index = currentNames.indexOf(selectedValue);
            if (index !== -1) {
              WheelCore.hideSelected(index);
              hideResult();
            }
          }
          break;
        case 'Escape':
          hideResult();
          break;
      }
    });
  }

  /**
   * Setup overlay handlers
   */
  function setupOverlayHandlers() {
    const wrapper = document.getElementById('wheel-wrapper');
    if (!wrapper) return;

    const overlay = document.getElementById('pls-click');
    if (!overlay) return;

    wrapper.addEventListener('mouseenter', () => {
      if (!WheelCore.isSpinning()) {
        WheelCore.hideOverlay();
      }
    });

    wrapper.addEventListener('mouseleave', () => {
      if (!WheelCore.isSpinning()) {
        WheelCore.showOverlay();
      }
    });

    overlay.addEventListener('click', () => {
      WheelCore.spin();
    });

    // Also bind click to wheel center and pin
    const center = document.getElementById('wheel-center');
    const pin = document.getElementById('wheel-pin');

    if (center) center.addEventListener('click', () => WheelCore.spin());
    if (pin) pin.addEventListener('click', () => WheelCore.spin());
  }

  /**
   * Handle spin end
   */
  function handleSpinEnd(index, value) {
    selectedValue = value;
    showResult(value);

    // Auto-hide if enabled
    if (settings.autoHide) {
      setTimeout(() => {
        WheelCore.hideSelected(index);
        hideResult();
      }, 2000);
    }

    // Save current state
    Storage.saveItems(currentPageKey, currentNames);
  }

  /**
   * Show result
   */
  function showResult(value) {
    // Hide title, show result banner
    const titleEl = document.querySelector('.pili-page-title');
    const resultBanner = document.getElementById('result-banner');
    const resultValue = document.getElementById('result-value');

    if (titleEl) titleEl.style.display = 'none';
    if (resultBanner) {
      resultBanner.style.display = 'block';
      resultBanner.className = 'pili-result-alert';
    }
    if (resultValue) {
      resultValue.textContent = `🎉 ${value}!`;
    }

    // Update hide button
    const hideBtn = document.getElementById('hide-result-btn');
    if (hideBtn) {
      hideBtn.onclick = () => {
        WheelCore.hideSelected(currentNames.indexOf(value));
        hideResult();
      };
    }

    // Update close button
    const closeBtn = document.getElementById('close-result-btn');
    if (closeBtn) {
      closeBtn.onclick = hideResult;
    }
  }

  /**
   * Hide result
   */
  function hideResult() {
    const titleEl = document.querySelector('.pili-page-title');
    const resultBanner = document.getElementById('result-banner');

    if (titleEl) titleEl.style.display = '';
    if (resultBanner) resultBanner.style.display = 'none';

    selectedValue = null;
  }

  /**
   * Handle textarea change
   */
  function handleTextareaChange(e) {
    const text = e.target.value;
    currentNames = text.split('\n').filter(line => line.trim() !== '');

    // Update wheel
    WheelCore.setNames(currentNames);

    // Save to storage
    Storage.saveItems(currentPageKey, currentNames);
  }

  /**
   * Handle reset
   */
  function handleReset() {
    WheelCore.reset();
    hideResult();

    // Clear hidden
    currentNames = currentPreset.names;

    // Update textarea
    const textarea = document.getElementById('names-list');
    if (textarea) {
      textarea.value = currentNames.join('\n');
    }

    // Update wheel
    WheelCore.setNames(currentNames);

    // Clear storage
    Storage.clearPage(currentPageKey);
  }

  /**
   * Handle edit
   */
  function handleEdit() {
    const textarea = document.getElementById('names-list');
    const editBar = document.getElementById('edit-bar');

    if (textarea) {
      textarea.disabled = false;
      textarea.focus();
    }

    if (editBar) {
      editBar.classList.add('editing');
    }
  }

  /**
   * Handle done
   */
  function handleDone() {
    const textarea = document.getElementById('names-list');
    const editBar = document.getElementById('edit-bar');

    if (textarea) {
      textarea.disabled = true;
    }

    if (editBar) {
      editBar.classList.remove('editing');
    }
  }

  /**
   * Handle restore
   */
  function handleRestore() {
    currentNames = [...currentPreset.names];

    // Update textarea
    const textarea = document.getElementById('names-list');
    if (textarea) {
      textarea.value = currentNames.join('\n');
    }

    // Update wheel
    WheelCore.setNames(currentNames);

    // Save
    Storage.saveItems(currentPageKey, currentNames);
  }

  /**
   * Handle title click
   */
  function handleTitleClick() {
    const newTitle = prompt('Введите новый заголовок:', currentPreset.title);
    if (newTitle && newTitle.trim()) {
      updateTitleElement(newTitle.trim());
      document.title = newTitle.trim() + ' — Колесо фортуны';
      Storage.saveTitle(currentPageKey, newTitle.trim());
    }
  }

  /**
   * Toggle fullscreen
   */
  function toggleFullscreen() {
    if (!document.documentElement.requestFullscreen) {
      return;
    }

    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  /**
   * Update active category in footer
   */
  function updateActiveCategory() {
    const links = document.querySelectorAll('.pili-category-btn');
    links.forEach(link => {
      if (link.getAttribute('href') === currentPreset.url) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
