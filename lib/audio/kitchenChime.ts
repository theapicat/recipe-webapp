// Syntetiserer et behagelig "pling" via nettleserens Web Audio API uten eksterne lydfiler. Brukt av kokkemodusens
// stegtimere (components/recipes-siden app/(user)/user/recipes/[id]/cook/page.tsx).
export const playKitchenChime = () => {
  try {
    const AudioContext =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;

    const audioCtx = new AudioContext();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    // Gli fra D5 (587.33Hz) til A5 (880Hz) for et rent, lyst "pling"
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.8);
  } catch (e) {
    console.error("Kunne ikke spille av lyd:", e);
  }
};
