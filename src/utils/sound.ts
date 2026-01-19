// Audio engine for wheel - Web Audio API (no audio files)
let audioCtx: AudioContext | null = null;

export function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

export async function resumeAudio() {
  const ctx = initAudio();
  if (ctx.state === "suspended") {
    await ctx.resume();
  }
}

function createClick({
  freq = 220,
  type = "triangle",
  gain = 0.14,
  duration = 0.06,
}: {
  freq?: number;
  type?: OscillatorType;
  gain?: number;
  duration?: number;
}) {
  const ctx = initAudio();
  const osc = ctx.createOscillator();
  const g = ctx.createGain();

  osc.type = type;
  osc.frequency.value = freq;

  g.gain.setValueAtTime(gain, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(g);
  g.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + duration);
}

/**
 * Play tick sound - piliapp-like soft click when sector boundary crosses pointer
 */
export function playTickSound() {
  if (!audioCtx) initAudio();
  // piliapp-like мягкий щелчок
  createClick({
    freq: 200 + Math.random() * 40,
    type: "triangle",
    gain: 0.12,
    duration: 0.07,
  });
}

/**
 * Play win sound - short "ding" on stop
 */
export function playWinSound() {
  const ctx = initAudio();

  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const g = ctx.createGain();

  osc1.type = "sine";
  osc2.type = "triangle";
  osc1.frequency.value = 880;
  osc2.frequency.value = 1320;

  g.gain.setValueAtTime(0.18, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

  osc1.connect(g);
  osc2.connect(g);
  g.connect(ctx.destination);

  osc1.start();
  osc2.start();
  osc1.stop(ctx.currentTime + 0.22);
  osc2.stop(ctx.currentTime + 0.22);
}
