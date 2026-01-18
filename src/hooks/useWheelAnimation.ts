import { useState, useRef, useCallback } from 'react';
import { calculateFinalAngle, getAngleAtTime, getRandomDuration } from '../utils/wheelPhysics';

interface UseWheelAnimationProps {
  itemCount: number;
  soundEnabled: boolean;
  onSpinEnd: (selectedIndex: number) => void;
}

export function useWheelAnimation({ itemCount, soundEnabled, onSpinEnd }: UseWheelAnimationProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentAngle, setCurrentAngle] = useState(0);
  const animationRef = useRef<number | null>(null);
  const lastSectorRef = useRef<number>(-1);

  const spin = useCallback(() => {
    if (isSpinning || itemCount === 0) return;

    setIsSpinning(true);
    lastSectorRef.current = -1;

    const startAngle = currentAngle % (2 * Math.PI);
    const { finalAngle, selectedIndex } = calculateFinalAngle(currentAngle, itemCount);
    const totalAngle = finalAngle - currentAngle;
    const duration = getRandomDuration();
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const angle = getAngleAtTime(startAngle, totalAngle, startTime, currentTime, duration);
      setCurrentAngle(angle);

      if (currentTime - startTime < duration) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        setCurrentAngle(finalAngle);
        onSpinEnd(selectedIndex);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [isSpinning, itemCount, currentAngle, onSpinEnd]);

  const reset = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsSpinning(false);
    setCurrentAngle(0);
    lastSectorRef.current = -1;
  }, []);

  return {
    isSpinning,
    currentAngle,
    spin,
    reset,
  };
}
