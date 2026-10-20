let audioContext: AudioContext | null = null;

function getAudioContext() {
    if (typeof window === "undefined") return null;
    audioContext ??= new AudioContext();
    if (audioContext.state === "suspended") void audioContext.resume();
    return audioContext;
}

function note(frequency: number, start: number, duration: number, volume = 0.09, type: OscillatorType = "sine") {
    const context = getAudioContext();
    if (!context) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, context.currentTime + start);
    gain.gain.setValueAtTime(0.001, context.currentTime + start);
    gain.gain.exponentialRampToValueAtTime(volume, context.currentTime + start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + start + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(context.currentTime + start);
    oscillator.stop(context.currentTime + start + duration + 0.03);
}

export function playShuffleSound() {
    [0, 0.08, 0.16, 0.24, 0.32, 0.4].forEach((time, index) => {
        note(210 + index * 46, time, 0.075, 0.055, "triangle");
    });
}

export function playWinSound() {
    [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
        note(frequency, index * 0.13, 0.55, 0.12, "sine");
    });
    setTimeout(() => {
        [659.25, 783.99, 1046.5, 1318.5].forEach((frequency, index) => {
            note(frequency, index * 0.08, 0.7, 0.08, "triangle");
        });
    }, 450);
}
