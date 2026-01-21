import { useEffect, useMemo, useRef, useState } from "react";
import { playTick, playWin } from "../utils/audio";
import "../styles/piliapp-wheel.css";

// Helper: get which sector is under the pointer (right side, angle 0)
function getSectorAtPointer(angleRad: number, itemCount: number): number {
  const sectorAngle = (2 * Math.PI) / itemCount;
  const normalized = ((angleRad % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

  // drawWheel starts at (Math.PI - 0.4), so we need this offset
  const startOffset = Math.PI - 0.4;

  // Transfer angle so "sector 0" aligns with wheel start
  const rel = (startOffset + normalized) % (2 * Math.PI);

  // Pointer is at right side (angle 0)
  const pointer = 0;

  let fromStart = (pointer - rel) % (2 * Math.PI);
  if (fromStart < 0) fromStart += 2 * Math.PI;

  return Math.floor(fromStart / sectorAngle) % itemCount;
}

const COLORS = [
  "#98FB98", // Pale Green
  "#FA8072", // Salmon
  "#4169E1", // Royal Blue
  "#F5DEB3", // Wheat
  "#DDA0DD", // Plum
];

// Special colors for default wheel (12 elements: "1".."12") - matches piliapp exactly
const DEFAULT_WHEEL_COLORS = [
  "#98FB98", // 1: Pale Green
  "#FA8072", // 2: Salmon
  "#4169E1", // 3: Royal Blue
  "#F5DEB3", // 4: Wheat
  "#DDA0DD", // 5: Plum
  "#98FB98", // 6: Pale Green
  "#FA8072", // 7: Salmon
  "#4169E1", // 8: Royal Blue
  "#F5DEB3", // 9: Wheat
  "#DDA0DD", // 10: Plum
  "#4169E1", // 11: Royal Blue
  "#F5DEB3", // 12: Wheat
];

// Cubic bezier easing function matching CSS cubic-bezier(0.6, 0, 0, 1)
function cubicBezier(t: number, x1: number, y1: number, x2: number, y2: number): number {
  // Solve for t using Newton's method
  let x = t;
  for (let i = 0; i < 8; i++) {
    const f = 3 * (1 - x) * (1 - x) * x * x1 + 3 * (1 - x) * x * x * x2 + x * x * x - t;
    const df = 3 * (1 - x) * (1 - x) * x1 + 6 * (1 - x) * x * (x2 - x1) + 3 * x * x * (1 - x2);
    const dx = f / df;
    x -= dx;
    if (Math.abs(dx) < 1e-6) break;
  }
  // Calculate y at the solved x
  const y = 3 * (1 - x) * (1 - x) * x * y1 + 3 * (1 - x) * x * x * y2 + x * x * x;
  return y;
}

// Get eased progress at time t (0 to duration) using cubic-bezier(0.6, 0, 0, 1)
function getEasedProgress(elapsed: number, duration: number): number {
  const t = Math.min(elapsed / duration, 1);
  return cubicBezier(t, 0.6, 0, 0, 1);
}

interface WheelBlockProps {
  items: string[];
  title?: string;
  selectedIndex?: number;
  setSelectedIndex?: (index: number) => void;
  setSelectedValue?: (value: string) => void;
  setSelectedColor?: (color: string) => void;
  setShowResultAlert?: (show: boolean) => void;
  hiddenIndices?: number[];
  onHiddenIndicesChange?: (indices: number[]) => void;
  onSpinningChange?: (isSpinning: boolean) => void;
  soundEnabled?: boolean;
  spinMode?: 'random' | 'selected';
  selectedWinnerIndex?: number | null;
}

export default function WheelBlock({
  items,
  title = "Колесо",
  selectedIndex,
  setSelectedIndex,
  setSelectedValue,
  setSelectedColor,
  setShowResultAlert,
  hiddenIndices = [],
  onHiddenIndicesChange,
  onSpinningChange,
  soundEnabled = true,
  spinMode = 'random',
  selectedWinnerIndex = null,
}: WheelBlockProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [angle, setAngle] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const lastSectorRef = useRef<number>(-1);
  const lastTickTimeRef = useRef<number>(0);

  // Notify parent when spinning state changes
  useEffect(() => {
    onSpinningChange?.(isSpinning);
  }, [isSpinning, onSpinningChange]);

  // Filter out hidden items
  const visibleItems = items.filter((_, index) => !hiddenIndices.includes(index));

  const sectorColors = useMemo(() => {
    // Check if this is the default wheel (12 elements: "1".."12")
    const isDefaultWheel = visibleItems.length === 12 &&
      visibleItems.every((item, index) => item === String(index + 1));

    if (isDefaultWheel) {
      return DEFAULT_WHEEL_COLORS;
    }

    // Otherwise, use the general algorithm
    const colors: string[] = [];
    const numColors = COLORS.length;

    // 1. Базовая очередь - раскрашиваем по циклу
    for (let i = 0; i < visibleItems.length; i++) {
      colors.push(COLORS[i % numColors]);
    }

    // 2. Пост-фикс: убираем соседние повторы (последовательно)
    for (let i = 1; i < colors.length; i++) {
      let attempts = 0;
      while (colors[i] === colors[i - 1] && attempts < numColors) {
        const currentIndex = COLORS.indexOf(colors[i]);
        colors[i] = COLORS[(currentIndex + 1) % numColors];
        attempts++;
      }
    }

    // 3. Круговая стыковка: последний ≠ первый
    if (colors.length > 1) {
      let attempts = 0;
      while (colors[colors.length - 1] === colors[0] && attempts < numColors) {
        const lastIndex = colors.length - 1;
        const currentColorIndex = COLORS.indexOf(colors[lastIndex]);
        colors[lastIndex] = COLORS[(currentColorIndex + 1) % numColors];
        attempts++;
      }
    }

    return colors;
  }, [visibleItems]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const wrapper = canvas.parentElement;
    if (!wrapper) return;

    const cssSize = wrapper.clientWidth;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.round(cssSize * dpr);
    canvas.height = Math.round(cssSize * dpr);
    canvas.style.width = `${cssSize}px`;
    canvas.style.height = `${cssSize}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    drawWheel(ctx, cssSize, visibleItems, sectorColors);
  }, [visibleItems, sectorColors]);

  // Function to get the selected index based on final angle
  function getSelectedIndex(finalAngleDeg: number, itemCount: number): number {
    const stepDeg = 360 / itemCount;

    // drawWheel uses: start = i * step + Math.PI - 0.4
    const startOffsetRad = Math.PI - 0.4;
    const startOffsetDeg = startOffsetRad * 180 / Math.PI; // ≈ 157.08°

    // Pointer is at right side (3 o'clock, angle 0)
    const pointerDeg = 0;

    // Effective wheel angle after CSS rotation
    const wheelDeg = (startOffsetDeg + finalAngleDeg) % 360;

    // Angle from wheel start to pointer
    let angleFromStart = (pointerDeg - wheelDeg) % 360;
    if (angleFromStart < 0) angleFromStart += 360;

    // Which sector is under pointer
    return Math.floor(angleFromStart / stepDeg) % itemCount;
  }

  // Calculate the base angle (0-360) needed to position targetIndex at pointer
  function calcTargetBaseAngle(targetIndex: number, itemCount: number): number {
    const sectorAngle = 360 / itemCount;
    const startOffsetDeg = (Math.PI - 0.4) * 180 / Math.PI; // ≈ 157.08°

    // Sector center position (where pointer should land)
    const sectorCenterPos = (startOffsetDeg + targetIndex * sectorAngle + sectorAngle / 2) % 360;

    // To position sectorCenterPos at pointer (0deg), we need:
    // (sectorCenterPos + finalAngle) % 360 = 0
    // finalAngle % 360 = -sectorCenterPos % 360
    const targetAngle = (-sectorCenterPos) % 360;
    return targetAngle >= 0 ? targetAngle : targetAngle + 360;
  }

  // Map items index to visibleItems index (supports duplicates)
  function getVisibleIndex(itemsIndex: number): number | null {
    if (itemsIndex < 0 || itemsIndex >= items.length) return null;

    // Create mapping: for each visible item, store its original index
    const visibleMapping: number[] = [];
    items.forEach((_item, idx) => {
      if (!hiddenIndices.includes(idx)) {
        visibleMapping.push(idx);
      }
    });

    // Find the visibleIndex where original index matches itemsIndex
    const visibleIndex = visibleMapping.indexOf(itemsIndex);
    return visibleIndex !== -1 ? visibleIndex : null;
  }

  const spin = () => {
    if (isSpinning) return; // Prevent spinning while already spinning

    // Close result banner when spinning starts
    if (setShowResultAlert) setShowResultAlert(false);

    const N = visibleItems.length;
    if (N === 0) return;

    // Calculate rotation based on mode
    let targetIndex: number;

    if (spinMode === 'selected' && selectedWinnerIndex !== null) {
      // S mode: use pre-selected winner
      const visibleIdx = getVisibleIndex(selectedWinnerIndex);

      if (visibleIdx !== null) {
        targetIndex = visibleIdx;
      } else {
        // Selected item is hidden, fall back to random
        targetIndex = Math.floor(Math.random() * N);
      }
    } else {
      // R mode: random winner
      targetIndex = Math.floor(Math.random() * N);
    }

    // Calculate final angle using proper formula with long spin UX
    const targetBaseAngle = calcTargetBaseAngle(targetIndex, N);
    const currentAngleMod = angle % 360;

    // Calculate delta to reach target (0-360)
    let delta = (targetBaseAngle - currentAngleMod) % 360;
    if (delta < 0) delta += 360;

    // Add 8-12 full rotations for UX (like piliapp)
    const rotations = 360 * (8 + Math.floor(Math.random() * 5));

    const newAngle = angle + delta + rotations;
    const startAngle = angle;
    const deg = newAngle - startAngle;

    setAngle(newAngle);
    setIsSpinning(true);
    lastSectorRef.current = getSectorAtPointer((startAngle * Math.PI) / 180, N);
    lastTickTimeRef.current = 0; // Reset tick timer

    const duration = 10000; // 10 seconds
    const startTime = performance.now();

    // Synchronized tick sounds with wheel rotation - by sector!
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;

      if (elapsed >= duration) {
        // Spin complete - play win sound and show result
        if (soundEnabled) {
          playWin();
        }

        // Calculate selected index using the proper function
        const finalAngleDeg = newAngle % 360;
        const selectedIndex = getSelectedIndex(finalAngleDeg, N);

        if (setSelectedIndex) setSelectedIndex(selectedIndex);
        if (setSelectedValue) setSelectedValue(visibleItems[selectedIndex]);
        if (setSelectedColor) setSelectedColor(sectorColors[selectedIndex]);
        if (setShowResultAlert) setShowResultAlert(true);
        setIsSpinning(false);
        return;
      }

      // Calculate current rotation angle using the same easing as CSS
      const progress = getEasedProgress(elapsed, duration);
      const currentAngle = startAngle + (deg * progress);
      const currentAngleRad = (currentAngle * Math.PI) / 180;

      // Play tick sound when sector boundary crosses pointer
      // Throttled to avoid too many ticks during fast rotation
      if (soundEnabled) {
        const sectorIndex = getSectorAtPointer(currentAngleRad, N);
        const now = currentTime;
        const minTickInterval = 80; // minimum 80ms between ticks

        if (sectorIndex !== lastSectorRef.current) {
          if (now - lastTickTimeRef.current >= minTickInterval) {
            playTick();
            lastTickTimeRef.current = now;
          }
          lastSectorRef.current = sectorIndex;
        }
      }

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  };

  // Listen for spin-wheel event from Controls component
  useEffect(() => {
    const handleSpinEvent = () => spin();
    window.addEventListener('spin-wheel', handleSpinEvent);
    return () => window.removeEventListener('spin-wheel', handleSpinEvent);
  }, [visibleItems, angle, isSpinning, soundEnabled, spinMode, selectedWinnerIndex, setSelectedIndex, setSelectedValue, setShowResultAlert]);

  // Show warning when no items
  if (visibleItems.length === 0) {
    return (
      <div id="wheel-wrapper" className="warning">
        <div className="warning-text" style={{ display: 'none' }}>
          В списке слишком много элементов. Не может превышать 100 элементов.
        </div>
        <div className="warning-text" style={{}}>
          Пожалуйста, войдите в список
          <div className="arrow-to-list d-none d-xl-block">→ → → </div>
          <div className="arrow-to-list d-block d-xl-none">↓ ↓ ↓</div>
        </div>
        <div className="warning-text" style={{ display: 'none' }}>
          Вы хотите сбросить настройки?
          <br />
          <input type="button" value="Сбросить" className="btn btn-danger btn-lg" />
        </div>
        <div id="pls-click" style={{ display: 'none' }}>
          нажмите, чтобы крутить
        </div>
        <span id="test-text" style={{ fontSize: '12px' }}></span>
        <div id="wheel-bg" style={{ display: 'none' }}></div>
        <canvas
          id="wheel"
          ref={canvasRef}
          data-names={JSON.stringify(items)}
          data-colors={JSON.stringify(sectorColors)}
          style={{
            transform: `rotate(${angle}deg)`,
            transitionDuration: "10s",
            transitionTimingFunction: "cubic-bezier(0.6, 0, 0, 1)",
            display: 'none',
          }}
        />
        <span id="wheel-center" style={{ display: 'none' }}></span>
        <span id="wheel-pin" style={{ display: 'none' }}>▼</span>
      </div>
    );
  }

  return (
    <>
      <div id="wheel-wrapper">
          <div id="pls-click" onClick={spin} style={{ display: isSpinning ? 'none' : 'block' }}>нажмите, чтобы крутить</div>
          <span id="test-text" style={{ fontSize: 12 }} />
          <div id="wheel-bg" />
          <canvas
            id="wheel"
            ref={canvasRef}
            style={{
              transform: `rotate(${angle}deg)`,
              transitionDuration: "10s",
              transitionTimingFunction: "cubic-bezier(0.6, 0, 0, 1)",
            }}
            onClick={spin}
          />
          <span id="wheel-center" onClick={spin} />
          <span id="wheel-pin" onClick={spin}>▼</span>
        </div>
    </>
  );
}

function drawWheel(
  ctx: CanvasRenderingContext2D,
  size: number,
  names: string[],
  colors: string[]
) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2;

  ctx.clearRect(0, 0, size, size);

  const N = names.length;
  const step = (Math.PI * 2) / N;

  // Находим самый длинный текст
  const maxLength = Math.max(...names.map(n => n.length));

  // Определяем отступ от края для текста (динамический: чем больше элементов, тем меньше отступ)
  let textMargin = 20;
  if (N <= 6) textMargin = 25;
  else if (N <= 10) textMargin = 20;
  else if (N <= 15) textMargin = 18;
  else if (N <= 20) textMargin = 15;
  else if (N <= 30) textMargin = 13;
  else if (N <= 50) textMargin = 10;
  else textMargin = 8;

  // Определяем является ли колесо полностью цифровым (для размера шрифта)
  const isAllNumbers = N > 0 && names.every(n => /^\d+$/.test(n));

  // Динамический размер шрифта в зависимости от количества элементов И длины текста
  let fontSize = 48;

  if (N > 100) fontSize = 7;
  else if (N > 80) fontSize = 8;
  else if (N > 60) fontSize = 9;
  else if (N > 50) fontSize = 10;
  else if (N > 40) fontSize = 11;
  else if (N > 30) fontSize = 15;
  else if (N > 20) {
    // 21-30 элементов
    fontSize = maxLength > 20 ? 9 : 11;
  }
  else if (N > 15) {
    // 16-20 элементов
    if (maxLength > 30) fontSize = 12;
    else if (maxLength > 20) fontSize = 14;
    else fontSize = 16;
  }
  else if (N > 6) {
    // 7-15 элементов (УВЕЛИЧЕНО)
    if (maxLength > 40) fontSize = 14;
    else if (maxLength > 30) fontSize = 16;
    else if (maxLength > 20) fontSize = 18;
    else if (maxLength > 5) fontSize = 20;
    else fontSize = window.innerWidth < 992 ? 36 : 50;
  }
  else {
    // 2-6 элементов (мало элементов, проверяем длину текста)
    if (maxLength > 50) fontSize = 18;
    else if (maxLength > 40) fontSize = 24;
    else if (maxLength > 30) fontSize = 32;
    else if (maxLength > 20) fontSize = 42;
    else fontSize = 56;
  }

  // Для цифровых колёс увеличиваем размер шрифта (с учетом длины цифр)
  if (isAllNumbers) {
    if (N <= 2) {
      // 2-6 элементов - большие цифры
      if (maxLength <= 2) fontSize = 130;  // короткие цифры (1-99)
      else if (maxLength <= 3) fontSize = 90;  // средние цифры (100-999)
      else if (maxLength <= 4) fontSize = 70;  // длинные цифры (1000-9999)
    }
    else if (N <= 3) {
      // 2-6 элементов - большие цифры
      if (maxLength <= 2) fontSize = 90;  // короткие цифры (1-99)
      else if (maxLength <= 3) fontSize = 80;  // средние цифры (100-999)
      else if (maxLength <= 4) fontSize = 70;  // длинные цифры (1000-9999)
    }
    else if (N <= 6) {
      // 2-6 элементов - большие цифры
      if (maxLength <= 2) fontSize = 80;  // короткие цифры (1-99)
      else if (maxLength <= 3) fontSize = 70;  // средние цифры (100-999)
      else if (maxLength <= 4) fontSize = 60;  // длинные цифры (1000-9999)
    }
    else if (N <= 15) {
      // 7-15 элементов
      if (maxLength <= 2) fontSize = 65;
      else if (maxLength <= 3) fontSize = 58;
      else if (maxLength <= 4) fontSize = 52;
    }
    else if (N <= 20) {
      // 16-20 элементов
      if (maxLength <= 2) fontSize = 40;
      else if (maxLength <= 3) fontSize = 35;
    }
  }

  for (let i = 0; i < N; i++) {
    const start = i * step + Math.PI - 0.4; // Start from 9 o'clock (left side)
    const end = start + step;

    // сектор
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, end);
    ctx.closePath();
    ctx.fillStyle = colors[i];
    ctx.fill();

    // текст по радиусу
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(start + step / 2);

    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "black";
    ctx.font = `${fontSize}px Arial`;

    // Обрезка текста с многоточием если не вмещается в доступное пространство
    const maxTextWidth = r - 30; // максимальная ширина текста (от края с отступом)
    const textWidth = ctx.measureText(names[i]).width;
    let textToDraw = names[i];

    if (textWidth > maxTextWidth) {
      // Постепенно укорачиваем текст пока не влезет
      while (textToDraw.length > 0 && ctx.measureText(textToDraw + '...').width > maxTextWidth) {
        textToDraw = textToDraw.slice(0, -1);
      }
      textToDraw += '...';
    }

    ctx.fillText(textToDraw, r - textMargin, 0);

    ctx.restore();
  }
}
