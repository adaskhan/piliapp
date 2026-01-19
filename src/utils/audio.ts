// Audio engine using real MP3 files (like piliapp)
// tick sound: disconnect.mp3
// win sound: bell_ring.mp3

let enabled = true;

const tick = new Audio("/sounds/disconnect.mp3");
const win = new Audio("/sounds/bell_ring.mp3");

tick.preload = "auto";
win.preload = "auto";

// Volume controls (0.0 to 1.0)
tick.volume = 0.5;   // tick sound at 50% volume
win.volume = 0.6;    // win sound at 60% volume

export function setSoundEnabled(v: boolean) {
  enabled = v;
}

export function isSoundEnabled(): boolean {
  return enabled;
}

export function playTick() {
  if (!enabled) return;
  tick.currentTime = 0;
  tick.play().catch(() => {});
}

export function playWin() {
  if (!enabled) return;
  win.currentTime = 0;
  win.play().catch(() => {});
}
