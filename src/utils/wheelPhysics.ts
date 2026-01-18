// Easing function for realistic deceleration
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

// Calculate spin duration (4-7 seconds random)
export function getRandomDuration(): number {
  return 4000 + Math.random() * 3000;
}

// Helper: Calculate which sector is at the pointer (right side, angle 0)
// for a given wheel angle
function getSectorAtPointer(angle: number, itemCount: number): number {
  const sectorAngle = (2 * Math.PI) / itemCount;

  // Normalize angle to [0, 2*PI)
  const normalizedAngle = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

  // In WheelCanvas, sector i starts at: angle + i * sectorAngle - PI/2
  // We need to find i such that the pointer (angle 0) is in sector i
  // So: angle + i * sectorAngle - PI/2 <= 0 < angle + (i+1) * sectorAngle - PI/2
  // Solving for i when pointer is at 0:
  // i * sectorAngle <= PI/2 - angle < (i+1) * sectorAngle
  // i = floor((PI/2 - normalizedAngle) / sectorAngle)

  let sectorIndex = Math.floor((Math.PI / 2 - normalizedAngle) / sectorAngle);

  // Handle wrap-around
  if (sectorIndex < 0) {
    sectorIndex += itemCount;
  }

  return sectorIndex % itemCount;
}

// Calculate final angle with random spin
export function calculateFinalAngle(
  currentAngle: number,
  itemCount: number
): { finalAngle: number; selectedIndex: number } {
  // Random number of full rotations (5-10)
  const rotations = 5 + Math.floor(Math.random() * 5);
  const sectorAngle = (2 * Math.PI) / itemCount;

  // Random final sector
  const targetIndex = Math.floor(Math.random() * itemCount);

  // Calculate the final angle needed to position targetIndex at the pointer
  // The pointer is at angle 0 (right side)
  // Sector i is at angle: currentAngle + i * sectorAngle - PI/2
  //
  // We want: finalAngle + targetIndex * sectorAngle - PI/2 = -sectorAngle/2
  // (center of sector at pointer)
  //
  // This gives us: finalAngle = PI/2 - targetIndex * sectorAngle - sectorAngle/2

  // Calculate target angle (where targetIndex sector should be at pointer)
  const targetAngle = Math.PI / 2 - (targetIndex * sectorAngle + sectorAngle / 2);

  // Add full rotations
  const finalAngle = targetAngle + rotations * 2 * Math.PI;

  // Calculate which sector is actually at the pointer at finalAngle
  const selectedIndex = getSectorAtPointer(finalAngle, itemCount);

  return {
    finalAngle: currentAngle + (finalAngle - currentAngle % (2 * Math.PI)),
    selectedIndex,
  };
}

// Get current angle at time during animation
export function getAngleAtTime(
  startAngle: number,
  totalAngle: number,
  startTime: number,
  currentTime: number,
  duration: number
): number {
  const elapsed = currentTime - startTime;
  const progress = Math.min(elapsed / duration, 1);
  const easedProgress = easeOutQuart(progress);

  return startAngle + totalAngle * easedProgress;
}
