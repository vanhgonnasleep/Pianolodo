import { VoicedChord } from '../types/harmony';

function encodeVLQ(value: number): number[] {
  const bytes: number[] = [];
  bytes.push(value & 0x7f);
  value >>= 7;
  while (value > 0) {
    bytes.unshift((value & 0x7f) | 0x80);
    value >>= 7;
  }
  return bytes;
}

export function exportProgressionToMidi(
  chords: VoicedChord[],
  bpm: number = 85,
  ppq: number = 480
): Uint8Array {
  const trackBytes: number[] = [];

  // 1. Time Signature: 4/4 (0xFF 0x58 0x04 0x04 0x02 0x18 0x08)
  trackBytes.push(0x00, 0xff, 0x58, 0x04, 0x04, 0x02, 0x18, 0x08);

  // 2. Set Tempo: microseconds per quarter note = Math.round(60,000,000 / bpm)
  const mpqn = Math.round(60000000 / Math.max(20, Math.min(300, bpm)));
  trackBytes.push(
    0x00,
    0xff,
    0x51,
    0x03,
    (mpqn >> 16) & 0xff,
    (mpqn >> 8) & 0xff,
    mpqn & 0xff
  );

  // 3. Track Name Meta Event
  const trackName = 'Pianolodo Reharmonized Progression';
  const nameBytes = Array.from(trackName).map((c) => c.charCodeAt(0));
  trackBytes.push(0x00, 0xff, 0x03, nameBytes.length, ...nameBytes);

  // 4. Encode Chords as Note-On / Note-Off pairs
  for (let cIdx = 0; cIdx < chords.length; cIdx++) {
    const chord = chords[cIdx];
    const durationTicks = Math.round((chord.beats || 4) * ppq);

    // Left hand + Right hand notes
    const lhMidis = chord.leftHand.map((n) => Math.max(0, Math.min(127, n.midi)));
    const rhMidis = chord.rightHand.map((n) => Math.max(0, Math.min(127, n.midi)));

    const allNotes: Array<{ midi: number; vel: number; ch: number }> = [
      ...lhMidis.map((m) => ({ midi: m, vel: 84, ch: 0 })),
      ...rhMidis.map((m) => ({ midi: m, vel: 92, ch: 0 })),
    ];

    if (allNotes.length === 0) continue;

    // All Note-On events at delta time 0
    allNotes.forEach((n) => {
      trackBytes.push(0x00, 0x90 | n.ch, n.midi, n.vel);
    });

    // First Note-Off has delta time = durationTicks
    allNotes.forEach((n, idx) => {
      if (idx === 0) {
        trackBytes.push(...encodeVLQ(durationTicks), 0x80 | n.ch, n.midi, 0x40);
      } else {
        trackBytes.push(0x00, 0x80 | n.ch, n.midi, 0x40);
      }
    });
  }

  // 5. End of Track: 0x00 0xFF 0x2F 0x00
  trackBytes.push(0x00, 0xff, 0x2f, 0x00);

  // Header Chunk: "MThd" (4 bytes) + Length 6 (4 bytes) + Format 0 (2 bytes) + 1 Track (2 bytes) + PPQ (2 bytes)
  const headerBytes = [
    0x4d,
    0x54,
    0x68,
    0x64, // "MThd"
    0x00,
    0x00,
    0x00,
    0x06, // length 6
    0x00,
    0x00, // Format 0 (single multichannel track)
    0x00,
    0x01, // 1 track
    (ppq >> 8) & 0xff,
    ppq & 0xff, // PPQ
  ];

  // Track Chunk: "MTrk" (4 bytes) + Length (4 bytes big-endian) + trackBytes
  const trackLen = trackBytes.length;
  const trackHeader = [
    0x4d,
    0x54,
    0x72,
    0x6b, // "MTrk"
    (trackLen >> 24) & 0xff,
    (trackLen >> 16) & 0xff,
    (trackLen >> 8) & 0xff,
    trackLen & 0xff,
  ];

  const fullFile = new Uint8Array(headerBytes.length + trackHeader.length + trackBytes.length);
  fullFile.set(headerBytes, 0);
  fullFile.set(trackHeader, headerBytes.length);
  fullFile.set(trackBytes, headerBytes.length + trackHeader.length);

  return fullFile;
}

export function downloadMidiFile(
  chords: VoicedChord[],
  bpm: number = 85,
  filename: string = 'pianolodo-progression.mid'
): void {
  const bytes = exportProgressionToMidi(chords, bpm);
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'audio/midi' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.mid') ? filename : `${filename}.mid`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
