// Basic sound generator for wheel
let audioContext: AudioContext | null = null;

// Initialize audio context (required for Web Audio API)
function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
}

/**
 * Play tick sound - simple click
 */
export function playTickSound(): void {
  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = 'square';
  oscillator.frequency.value = 200;

  gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.02);
}

/**
 * Play win sound - celebrates when wheel stops
 */
export function playWinSound(): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const playNote = (freq: number, startTime: number, duration: number, type: OscillatorType = 'sine') => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, startTime);

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  };

  // Play a cheerful major chord arpeggio
  playNote(261.63, now, 0.3, 'sine');           // C4
  playNote(329.63, now + 0.15, 0.3, 'sine');     // E4
  playNote(392.00, now + 0.3, 0.4, 'sine');     // G4
  playNote(523.25, now + 0.5, 0.5, 'sine');     // C5
}
