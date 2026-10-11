/**
 * Browsers record in different formats (Chrome WebM, Safari MP4, Firefox Ogg). The server
 * takes WAV, so every recording is decoded here and re-encoded as 16 kHz mono 16-bit PCM:
 * enough for speech, about 32 KB per second.
 */
const SAMPLE_RATE = 16_000;

/** Below this loudness (about -50 dBFS) the microphone heard nothing; matches the server's check. */
export const SILENCE_RMS = 0.003;

/** The recording as WAV, plus its loudness so silent recordings are never sent. */
export async function toWav(
  recording: Blob,
): Promise<{ wav: Blob; rms: number }> {
  const AudioContextClass =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  const context = new AudioContextClass();
  try {
    const decoded = await context.decodeAudioData(
      await recording.arrayBuffer(),
    );
    // Rendering into a 1-channel context at 16 kHz downmixes and resamples in one step.
    const offline = new OfflineAudioContext(
      1,
      Math.max(1, Math.ceil(decoded.duration * SAMPLE_RATE)),
      SAMPLE_RATE,
    );
    const source = offline.createBufferSource();
    source.buffer = decoded;
    source.connect(offline.destination);
    source.start();
    const rendered = await offline.startRendering();
    const samples = rendered.getChannelData(0);
    let sum = 0;
    for (const sample of samples) sum += sample * sample;
    return { wav: encodeWav(samples), rms: Math.sqrt(sum / samples.length) };
  } finally {
    void context.close();
  }
}

function encodeWav(samples: Float32Array): Blob {
  const dataBytes = samples.length * 2;
  const view = new DataView(new ArrayBuffer(44 + dataBytes));
  const text = (offset: number, value: string) =>
    [...value].forEach((char, index) =>
      view.setUint8(offset + index, char.charCodeAt(0)),
    );

  text(0, "RIFF");
  view.setUint32(4, 36 + dataBytes, true);
  text(8, "WAVE");
  text(12, "fmt ");
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * 2, true); // bytes per second
  view.setUint16(32, 2, true); // bytes per frame
  view.setUint16(34, 16, true); // bits per sample
  text(36, "data");
  view.setUint32(40, dataBytes, true);
  samples.forEach((sample, index) => {
    const clamped = Math.max(-1, Math.min(1, sample));
    view.setInt16(
      44 + index * 2,
      clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff,
      true,
    );
  });
  return new Blob([view], { type: "audio/wav" });
}
