/**
 * Wheel Core Module
 * Handles canvas rendering and spin animation
 */

const WheelCore = (function() {
  // Colors for wheel sectors
  const COLORS = ["royalblue", "salmon", "palegreen", "wheat", "plum"];

  // State
  let canvas = null;
  let ctx = null;
  let names = [];
  let sectorColors = [];
  let angle = 0;
  let isSpinning = false;
  let hiddenIndices = [];
  let onSpinEnd = null;

  /**
   * Initialize wheel
   */
  function init(canvasElement, initialNames, options = {}) {
    canvas = canvasElement;
    ctx = canvas.getContext('2d');

    names = initialNames || [];
    sectorColors = names.map((_, i) => COLORS[i % COLORS.length]);
    angle = 0;
    isSpinning = false;
    hiddenIndices = options.hiddenIndices || [];
    onSpinEnd = options.onSpinEnd || null;

    // Setup canvas size with retina support
    setupCanvasSize();

    // Initial draw
    draw();

    // Add click handler
    canvas.addEventListener('click', handleCanvasClick);
  }

  /**
   * Setup canvas size with device pixel ratio for retina displays
   */
  function setupCanvasSize() {
    if (!canvas) return;

    const wrapper = canvas.parentElement;
    const cssSize = wrapper.clientWidth;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.round(cssSize * dpr);
    canvas.height = Math.round(cssSize * dpr);
    canvas.style.width = `${cssSize}px`;
    canvas.style.height = `${cssSize}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /**
   * Draw wheel on canvas
   */
  function draw() {
    if (!canvas || !ctx) return;

    const wrapper = canvas.parentElement;
    const size = wrapper.clientWidth;
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Filter out hidden names
    const visibleNames = names.filter((_, i) => !hiddenIndices.includes(i));

    if (visibleNames.length === 0) {
      drawEmptyState(size, cx, cy);
      return;
    }

    const N = visibleNames.length;
    const step = (Math.PI * 2) / N;

    // Draw sectors
    visibleNames.forEach((name, i) => {
      const start = angle + i * step;
      const end = start + step;

      // Draw sector
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill();

      // Border
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw text along radius
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + step / 2);

      ctx.textAlign = "right";
      ctx.fillStyle = "white";
      ctx.font = "bold 28px Arial";
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      // Extract emoji if present
      const emojiMatch = name.match(/^(\p{Emoji}\u200d?)+\s*/u);
      let text = name;
      let emoji = '';

      if (emojiMatch) {
        emoji = emojiMatch[0];
        text = name.slice(emoji.length);
      }

      // Draw emoji
      if (emoji) {
        ctx.font = '16px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
        ctx.fillText(emoji.trim(), r - 50, 0);
      }

      // Draw text
      if (text) {
        ctx.font = "bold 14px Arial";
        const maxLen = 18;
        const displayText = text.trim().length > maxLen
          ? text.trim().substring(0, maxLen) + '...'
          : text.trim();

        const textX = emoji ? r - 75 : r - 20;
        ctx.fillText(displayText, textX, 5);
      }

      ctx.restore();
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(cx, cy, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#2C3E50';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
  }

  /**
   * Draw empty state
   */
  function drawEmptyState(size, cx, cy) {
    const r = size / 2;

    ctx.fillStyle = '#e0e0e0';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = '#666';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Добавьте элементы', cx, cy);
  }

  /**
   * Handle canvas click
   */
  function handleCanvasClick() {
    if (!isSpinning && names.length > 0) {
      spin();
    }
  }

  /**
   * Spin the wheel
   */
  function spin() {
    if (isSpinning || names.length < 2) return;

    isSpinning = true;
    hideOverlay();

    const spinDuration = 4000 + Math.random() * 2000;
    const spinRotations = 5 + Math.random() * 5;
    const targetAngle = angle + spinRotations * 2 * Math.PI;
    const startTime = performance.now();
    const startAngle = angle;

    // Apply CSS transition
    canvas.style.transition = `transform ${spinDuration}ms cubic-bezier(0.6, 0, 0, 1)`;
    canvas.style.transform = `rotate(${targetAngle}rad)`;

    // Animate angle for canvas redraw
    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);

      // Easing
      const easeOut = 1 - Math.pow(1 - progress, 3);
      angle = startAngle + (targetAngle - startAngle) * easeOut;

      draw();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Determine result
        const visibleNames = names.filter((_, i) => !hiddenIndices.includes(i));
        const N = visibleNames.length;
        const step = (Math.PI * 2) / N;
        const normalizedRotation = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        const pointerAngle = (3 * Math.PI / 2 - normalizedRotation + 2 * Math.PI) % (2 * Math.PI);
        const winningIndex = Math.floor(pointerAngle / step);

        isSpinning = false;

        if (onSpinEnd) {
          onSpinEnd(winningIndex, visibleNames[winningIndex]);
        }

        showOverlay();
      }
    }

    requestAnimationFrame(animate);
  }

  /**
   * Update names
   */
  function setNames(newNames) {
    names = newNames || [];
    sectorColors = names.map((_, i) => COLORS[i % COLORS.length]);
    angle = 0;
    canvas.style.transition = 'none';
    canvas.style.transform = 'rotate(0deg)';
    draw();
  }

  /**
   * Reset wheel
   */
  function reset() {
    angle = 0;
    hiddenIndices = [];
    canvas.style.transition = 'none';
    canvas.style.transform = 'rotate(0deg)';
    draw();
    showOverlay();
  }

  /**
   * Hide selected item
   */
  function hideSelected(selectedIndex) {
    if (hiddenIndices.includes(selectedIndex)) return;
    hiddenIndices.push(selectedIndex);
    draw();
  }

  /**
   * Show overlay
   */
  function showOverlay() {
    const overlay = document.getElementById('pls-click');
    if (overlay) {
      overlay.style.display = 'inline-block';
    }
  }

  /**
   * Hide overlay
   */
  function hideOverlay() {
    const overlay = document.getElementById('pls-click');
    if (overlay) {
      overlay.style.display = 'none';
    }
  }

  /**
   * Get current names
   */
  function getNames() {
    return names;
  }

  /**
   * Get visible names (excluding hidden)
   */
  function getVisibleNames() {
    return names.filter((_, i) => !hiddenIndices.includes(i));
  }

  // Public API
  return {
    init,
    spin,
    reset,
    setNames,
    hideSelected,
    showOverlay,
    hideOverlay,
    getNames,
    getVisibleNames,
    isSpinning: () => isSpinning
  };
})();
