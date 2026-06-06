/**
 * Tiny synthesized notification chime via the Web Audio API — no audio asset
 * (so nothing to download, and no licensing). A short, soft two-note blip that
 * varies by toast kind. Audio is gesture-gated by browsers; since toasts
 * usually follow a click, the context resumes fine. All failures are ignored.
 */

let ctx;

function getCtx() {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

function blip(ac, freq, startOffset, duration, peak = 0.06, type = "sine") {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(ac.destination);

  const t = ac.currentTime + startOffset;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(peak, t + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.start(t);
  osc.stop(t + duration + 0.03);
}

export function playNotificationSound(kind = "info") {
  try {
    const ac = getCtx();
    if (!ac) return;
    if (kind === "error") {
      // gentle descending two-tone
      blip(ac, 440, 0, 0.16, 0.06, "triangle");
      blip(ac, 330, 0.1, 0.2, 0.06, "triangle");
    } else if (kind === "success") {
      // bright ascending blip (D5 → A5)
      blip(ac, 587.33, 0, 0.14, 0.055);
      blip(ac, 880, 0.09, 0.18, 0.055);
    } else {
      // neutral soft ping
      blip(ac, 660, 0, 0.13, 0.05);
      blip(ac, 990, 0.08, 0.16, 0.05);
    }
  } catch {
    /* ignore — audio is non-critical */
  }
}
