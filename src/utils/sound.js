// Helper function to play sound
export const playSound = (path, volume = 1.0) => {
  try {
    const audio = new Audio(`/sounds/${path}`);
    audio.volume = volume;
    audio.play().catch(e => console.log("Audio play error:", e));
    return audio;
  } catch (e) {
    console.error("Error playing sound:", e);
    return null;
  }
};