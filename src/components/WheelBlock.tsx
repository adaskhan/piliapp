import { useEffect, useMemo, useRef, useState } from "react";
import { playTickSound, playWinSound } from "../utils/sound";
import "../styles/piliapp-wheel.css";

const COLORS = [
  "#2F6BFF", // синий / royalblue
  "#FF7B6E", // красно-коралловый / salmon
  "#7CFF7A", // салатовый/зелёный / palegreen
  "#E6B9FF", // сиреневый / plum
  "#F6E7B2", // бежевый/песочный / wheat
];

// Special colors for default wheel (12 elements: "1".."12") - matches piliapp exactly
const DEFAULT_WHEEL_COLORS = [
  "#2F6BFF", // 1: royalblue
  "#FF7B6E", // 2: salmon
  "#7CFF7A", // 3: palegreen
  "#F6E7B2", // 4: wheat
  "#E6B9FF", // 5: plum
  "#2F6BFF", // 6: royalblue
  "#FF7B6E", // 7: salmon
  "#7CFF7A", // 8: palegreen
  "#F6E7B2", // 9: wheat
  "#E6B9FF", // 10: plum
  "#7CFF7A", // 11: palegreen
  "#F6E7B2", // 12: wheat
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
  setShowResultAlert?: (show: boolean) => void;
  hiddenIndices?: number[];
  onHiddenIndicesChange?: (indices: number[]) => void;
  onSpinningChange?: (isSpinning: boolean) => void;
}

export default function WheelBlock({
  items,
  title = "Колесо",
  selectedIndex,
  setSelectedIndex,
  setSelectedValue,
  setShowResultAlert,
  hiddenIndices = [],
  onHiddenIndicesChange,
  onSpinningChange,
}: WheelBlockProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [angle, setAngle] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

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

  const spin = () => {
    if (isSpinning) return; // Prevent spinning while already spinning

    // Close result banner when spinning starts
    if (setShowResultAlert) setShowResultAlert(false);

    const N = visibleItems.length;
    if (N === 0) return;

    const deg = 360 * (8 + Math.random() * 4) + Math.random() * 360;
    const startAngle = angle;
    const newAngle = angle + deg;
    const sectorAngle = 360 / N;

    setAngle(newAngle);
    setIsSpinning(true);

    const duration = 10000; // 10 seconds
    const startTime = performance.now();
    let lastTickAngle = startAngle;

    // Synchronized tick sounds with wheel rotation
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;

      if (elapsed >= duration) {
        // Spin complete - play win sound and show result
        playWinSound();

        // Normalize angle to 0-360 range
        const normalizedAngle = newAngle % 360;

        // Wheel start angle in degrees: Math.PI - 0.4 radians = 180° - 22.92° ≈ 157.08°
        const wheelStartAngle = 180 - (0.4 * 180 / Math.PI);
        const pointerAngle = 270; // Top position

        // Effective wheel angle after rotation
        const wheelAngle = (wheelStartAngle + normalizedAngle) % 360;

        // Angle from wheel start to pointer
        let angleFromStart = (pointerAngle - wheelAngle) % 360;
        if (angleFromStart < 0) angleFromStart += 360;

        // Calculate which sector is at the pointer
        let selectedIndex = Math.floor(angleFromStart / sectorAngle) % N;

        // Apply offset correction to match visual wheel
        selectedIndex = (selectedIndex + 2) % N;

        if (setSelectedIndex) setSelectedIndex(selectedIndex);
        if (setSelectedValue) setSelectedValue(visibleItems[selectedIndex]);
        if (setShowResultAlert) setShowResultAlert(true);
        setIsSpinning(false);
        return;
      }

      // Calculate current rotation angle using the same easing as CSS
      const progress = getEasedProgress(elapsed, duration);
      const currentAngle = startAngle + (deg * progress);

      // Check if a sector boundary has crossed the top pointer (270 degrees)
      // Play tick every 90 degrees to avoid too many ticks at start
      const tickAngle = 90;
      const angleDiff = currentAngle - lastTickAngle;
      if (angleDiff >= tickAngle) {
        playTickSound();
        lastTickAngle = currentAngle - (currentAngle % tickAngle);
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
  }, [visibleItems, angle, isSpinning, setSelectedIndex, setSelectedValue, setShowResultAlert]);

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

  // Определяем отступ от края для текста (для Да/Нет и Колеса По Умолчанию - больше отступ)
  const isYesNo = N === 10 && names.every(n => n === 'Да' || n === 'Нет');
  const isDefaultWheel = N === 12 && names.every(n => /^\d+$/.test(n));
  const textMargin = (isYesNo || isDefaultWheel) ? 20 : 8;

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
