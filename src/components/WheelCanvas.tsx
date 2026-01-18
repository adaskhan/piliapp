import { useRef, useEffect, useCallback, useState } from 'react';
import { getColor } from '../utils/wheelColors';

interface WheelCanvasProps {
  items: string[];
  angle: number;
  isSpinning: boolean;
  onSpin: () => void;
  onSpinStart?: () => void;
}

const WHEEL_SIZE = 540;
const CENTER = WHEEL_SIZE / 2;
const RADIUS = WHEEL_SIZE / 2 - 10;

export function WheelCanvas({ items, angle, isSpinning, onSpin, onSpinStart }: WheelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showOverlay, setShowOverlay] = useState(true);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, WHEEL_SIZE, WHEEL_SIZE);

    if (items.length === 0) {
      // Draw empty state
      ctx.fillStyle = '#e0e0e0';
      ctx.beginPath();
      ctx.arc(CENTER, CENTER, RADIUS, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = '#666';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Добавьте элементы', CENTER, CENTER);
      return;
    }

    const sectorAngle = (2 * Math.PI) / items.length;

    // Draw sectors
    items.forEach((item, index) => {
      const startAngle = angle + index * sectorAngle - Math.PI / 2;
      const endAngle = startAngle + sectorAngle;

      // Draw sector
      ctx.beginPath();
      ctx.moveTo(CENTER, CENTER);
      ctx.arc(CENTER, CENTER, RADIUS, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = getColor(index);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw text (emoji + text)
      ctx.save();
      ctx.translate(CENTER, CENTER);
      ctx.rotate(startAngle + sectorAngle / 2);

      // Extract emoji if present
      const emojiMatch = item.match(/^(\p{Emoji}\u200d?)+\s*/u);
      let text = item;
      let emoji = '';

      if (emojiMatch) {
        emoji = emojiMatch[0];
        text = item.slice(emoji.length);
      }

      // Draw emoji
      if (emoji) {
        ctx.font = '16px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(emoji.trim(), RADIUS - 50, 0);
      }

      // Draw text
      if (text) {
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial, sans-serif';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        const maxTextLength = 18;
        const displayText = text.trim().length > maxTextLength
          ? text.trim().substring(0, maxTextLength) + '...'
          : text.trim();

        const textX = emoji ? RADIUS - 75 : RADIUS - 20;
        ctx.fillText(displayText, textX, 0);
      }

      ctx.restore();
    });

    // Draw center circle (semi-transparent overlay effect)
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#2C3E50';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw center dot
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();

    // Draw outer ring
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, RADIUS, 0, 2 * Math.PI);
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 3;
    ctx.stroke();
  }, [items, angle]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleClick = useCallback(() => {
    if (!isSpinning && items.length > 0) {
      setShowOverlay(false);
      onSpinStart?.();
      onSpin();
    }
  }, [isSpinning, items.length, onSpin, onSpinStart]);

  const handleMouseEnter = useCallback(() => {
    if (!isSpinning) {
      setShowOverlay(false);
    }
  }, [isSpinning]);

  const handleMouseLeave = useCallback(() => {
    if (!isSpinning) {
      setShowOverlay(true);
    }
  }, [isSpinning]);

  // Prepare data attributes for canvas
  const dataNames = JSON.stringify(items.map(String));
  const colorNames = ['royalblue', 'salmon', 'palegreen', 'wheat', 'plum'];
  const dataColors = JSON.stringify(items.map((_, i) => colorNames[i % colorNames.length]));

  return (
    <div id="results" className="col-12 col-xl-6 offset-xl-3">
      <div id="wheel-wrapper" className="">
        {/* Overlay text */}
        {!isSpinning && showOverlay && items.length > 0 && (
          <div id="pls-click">
            нажмите, чтобы крутить
          </div>
        )}

        <span id="test-text" style={{ fontSize: '12px' }}></span>
        <div id="wheel-bg"></div>

        <canvas
          ref={canvasRef}
          id="wheel"
          width={WHEEL_SIZE}
          height={WHEEL_SIZE}
          data-names={dataNames}
          data-colors={dataColors}
          style={{
            transform: `rotate(${angle}rad)`,
            transitionDuration: isSpinning ? '10s' : '0s',
            transitionTimingFunction: 'cubic-bezier(0.6, 0, 0, 1)'
          }}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />

        <span id="wheel-center"></span>
        <span id="wheel-pin">▼</span>
      </div>
    </div>
  );
}
