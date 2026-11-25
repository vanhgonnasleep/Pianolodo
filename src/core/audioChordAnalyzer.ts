import { Chord, Note } from '@tonaljs/tonal';

export interface DetectedNoteEvent {
  note: string;         // e.g. "C3", "G3", "E4"
  midi: number;         // e.g. 48, 55, 64
  timeOffset: number;   // seconds from track start
  duration: number;     // note duration in seconds
  layer: 'bass' | 'voicing' | 'melody';
  velocity: number;     // normalized 0 - 100
}

export interface LyricChordToken {
  chordSymbol?: string; // e.g. "Dm9"
  melodyNote?: string;  // e.g. "F4"
  arpeggioHint?: string;// e.g. "D2→A2→F3→C4"
  text: string;         // lyric word/phrase
}

export interface LyricLineSegment {
  startTime: number;
  endTime: number;
  rawText: string;
  tokens: LyricChordToken[];
}

export interface DetectedChordSegment {
  startTime: number;
  endTime: number;
  chordSymbol: string;
  romanDegree: string;
  confidence: number;
  // 3-Layer Note-by-Note Breakdown ("Đánh nốt gì, nốt gì")
  bassNote: string;             // Left-hand lowest bass root/inversion (e.g. "C2", "B1", "A2")
  leftHandNotes: string[];      // Left-hand shell/fifth notes (e.g. ["C2", "G2"])
  rightHandNotes: string[];     // Right-hand voicing cluster (e.g. ["E3", "G3", "B3", "D4"])
  arpeggioSequence: string[];   // Time-ordered sequence of notes played in this bar (e.g. ["C2", "G2", "E3", "G3", "C4", "E4"])
  vocalMelodyNotes: string[];   // Singer's vocal melody notes detected in this bar (e.g. ["E4", "G4", "A4"])
  noteEvents: DetectedNoteEvent[];
  lyricSnippet?: string;
}

export interface AccompanimentOption {
  id: 'pop-ballad' | 'rnb-neosoul' | 'jazz-lounge';
  titleVi: string;
  titleEn: string;
  styleBadge: string;
  descriptionVi: string;
  descriptionEn: string;
  progressionFormula: string;
  chordSymbols: string[];
}

export interface SongAnalysisResult {
  detectedKey: string;
  detectedBpm: number;
  confidence: number;
  duration: number;
  segments: DetectedChordSegment[];
  rawFormula: string;
  accompaniments: AccompanimentOption[];
  lyricLines: LyricLineSegment[];
  audioWavBase64?: string; // Compact 16kHz mono WAV base64 for Gemini Multimodal Audio analysis
}

export const PITCH_CLASSES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

export interface ChordTemplate {
  quality: string;
  symbolSuffix: string;
  intervals: number[];
  weights: number[];
}

export const CHORD_TEMPLATES: ChordTemplate[] = [
  { quality: 'Major', symbolSuffix: '', intervals: [0, 4, 7], weights: [1.0, 0.8, 0.8] },
  { quality: 'Minor', symbolSuffix: 'm', intervals: [0, 3, 7], weights: [1.0, 0.8, 0.8] },
  { quality: 'Dominant 7', symbolSuffix: '7', intervals: [0, 4, 7, 10], weights: [1.0, 0.7, 0.7, 0.7] },
  { quality: 'Major 7', symbolSuffix: 'maj7', intervals: [0, 4, 7, 11], weights: [1.0, 0.7, 0.7, 0.7] },
  { quality: 'Minor 7', symbolSuffix: 'm7', intervals: [0, 3, 7, 10], weights: [1.0, 0.7, 0.7, 0.7] },
  { quality: 'Diminished', symbolSuffix: 'dim', intervals: [0, 3, 6], weights: [1.0, 0.7, 0.7] },
  { quality: 'Half-Diminished', symbolSuffix: 'm7b5', intervals: [0, 3, 6, 10], weights: [1.0, 0.7, 0.7, 0.7] },
  { quality: 'Suspended 4', symbolSuffix: 'sus4', intervals: [0, 5, 7], weights: [1.0, 0.8, 0.8] },
];

export const KRUMHANSL_MAJOR = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
export const KRUMHANSL_MINOR = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

export function midiToNoteName(midi: number): string {
  const pc = PITCH_CLASSES[((midi % 12) + 12) % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${pc}${octave}`;
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < 12; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function buildChordVector(rootIndex: number, template: ChordTemplate): number[] {
  const vec = new Array(12).fill(0);
  template.intervals.forEach((interval, idx) => {
    const pitchBin = (rootIndex + interval) % 12;
    vec[pitchBin] = template.weights[idx] || 0.8;
  });
  return vec;
}

export function matchChromaToChord(chroma: number[]): { symbol: string; confidence: number } {
  let bestScore = -1;
  let bestSymbol = 'C';

  for (let r = 0; r < 12; r++) {
    const rootName = PITCH_CLASSES[r];
    for (const template of CHORD_TEMPLATES) {
      const templateVec = buildChordVector(r, template);
      const score = cosineSimilarity(chroma, templateVec);
      if (score > bestScore) {
        bestScore = score;
        bestSymbol = `${rootName}${template.symbolSuffix}`;
      }
    }
  }

  const confidence = Math.min(99, Math.max(65, Math.round(bestScore * 100)));
  return { symbol: bestSymbol, confidence };
}

export function detectKeyFromChromaSum(chromaSum: number[]): string {
  let bestScore = -Infinity;
  let bestKey = 'C';

  for (let r = 0; r < 12; r++) {
    const rootName = PITCH_CLASSES[r];
    const rotatedMajor = KRUMHANSL_MAJOR.map((_, i) => KRUMHANSL_MAJOR[(i - r + 12) % 12]);
    const rotatedMinor = KRUMHANSL_MINOR.map((_, i) => KRUMHANSL_MINOR[(i - r + 12) % 12]);

    const majorScore = cosineSimilarity(chromaSum, rotatedMajor);
    const minorScore = cosineSimilarity(chromaSum, rotatedMinor);

    if (majorScore > bestScore) {
      bestScore = majorScore;
      bestKey = rootName;
    }
    if (minorScore > bestScore) {
      bestScore = minorScore;
      bestKey = `${rootName}m`;
    }
  }

  return bestKey;
}

export function calculateRomanDegree(chordSymbol: string, keyRoot: string): string {
  const baseSymbol = chordSymbol.split('/')[0];
  const chordRoot = Chord.get(baseSymbol).tonic || baseSymbol.replace(/[^A-G#b]/g, '') || 'C';
  const cleanKey = keyRoot.replace('m', '');
  const isMinorKey = keyRoot.endsWith('m');

  const rootMidi = Note.midi(`${chordRoot}4`) || 60;
  const keyMidi = Note.midi(`${cleanKey}4`) || 60;
  const semitones = ((rootMidi - keyMidi) % 12 + 12) % 12;

  const isMinorChord = baseSymbol.includes('m') && !baseSymbol.includes('maj');

  const majorDegrees: Record<number, string> = {
    0: 'I',
    1: 'bII',
    2: isMinorChord ? 'ii' : 'II',
    3: 'bIII',
    4: isMinorChord ? 'iii' : 'III',
    5: 'IV',
    6: '#IV',
    7: 'V',
    8: 'bVI',
    9: isMinorChord ? 'vi' : 'VI',
    10: 'bVII',
    11: 'vii°',
  };

  const minorDegrees: Record<number, string> = {
    0: 'i',
    1: 'bII',
    2: 'ii°',
    3: 'bIII',
    4: isMinorChord ? 'iv' : 'IV',
    5: 'v',
    6: 'bVI',
    7: 'bVII',
    8: '#VI',
    9: 'vi°',
    10: 'VII',
    11: 'vii°',
  };

  const degreeMap = isMinorKey ? minorDegrees : majorDegrees;
  return degreeMap[semitones] || 'I';
}

export function generateAccompanimentOptions(
  rawChords: string[],
  keyRoot: string
): AccompanimentOption[] {
  const cleanKey = keyRoot.replace('m', '');
  const chords = rawChords.length > 0 ? rawChords : ['C', 'Am', 'F', 'G'];

  const balladChords = chords.map((c, i) => {
    const base = c.split('/')[0];
    const root = Chord.get(base).tonic || base.replace(/[^A-G#b]/g, '') || cleanKey;
    const isMinor = base.includes('m') && !base.includes('maj');
    if (i === 0 && !isMinor) return `${root}add9`;
    if (isMinor) return `${root}m7`;
    if (i === chords.length - 1) return `${root}sus4`;
    if (i === 1 && !isMinor) return `${root}/${Note.transpose(root, '3M')}`;
    return `${root}add9`;
  });

  const rnbChords = chords.map((c, i) => {
    const base = c.split('/')[0];
    const root = Chord.get(base).tonic || base.replace(/[^A-G#b]/g, '') || cleanKey;
    const isMinor = base.includes('m') && !base.includes('maj');
    if (isMinor) return i % 2 === 0 ? `${root}m9` : `${root}m11`;
    if (i === chords.length - 1) return `${root}13`;
    return `${root}maj9`;
  });

  const jazzChords = chords.map((c, i) => {
    const base = c.split('/')[0];
    const root = Chord.get(base).tonic || base.replace(/[^A-G#b]/g, '') || cleanKey;
    const isMinor = base.includes('m') && !base.includes('maj');
    if (i === chords.length - 1) {
      return `${Note.transpose(cleanKey, '2m')}7#11`;
    }
    if (isMinor) return `${root}9`;
    return `${root}maj7#11`;
  });

  return [
    {
      id: 'pop-ballad',
      titleVi: 'Pop Ballad Sâu Lắng (Add9 & Slash Bass)',
      titleEn: 'Soulful Pop Ballad (Add9 & Slash Bass)',
      styleBadge: 'Ballad • Voice-Leading',
      descriptionVi: 'Giữ nốt chung mượt mà, điểm xuyết nốt bậc 9 trong trẻo và âm bass đảo quãng mềm mại.',
      descriptionEn: 'Preserves common tones with crystalline 9th extensions and fluid step-wise bass lines.',
      progressionFormula: balladChords.join(' - '),
      chordSymbols: balladChords,
    },
    {
      id: 'rnb-neosoul',
      titleVi: 'R&B / Neo-Soul Chill (Extended Voicings)',
      titleEn: 'R&B / Neo-Soul Chill (Extended Voicings)',
      styleBadge: 'Neo-Soul • Maj9 / m11',
      descriptionVi: 'Hợp âm mở rộng bậc 9, 11 và 13 dày dặn, độ nẩy laid-back chuẩn phong cách neo-soul.',
      descriptionEn: 'Lush 9th, 11th, and 13th extensions with rich harmonic colors and laid-back feel.',
      progressionFormula: rnbChords.join(' - '),
      chordSymbols: rnbChords,
    },
    {
      id: 'jazz-lounge',
      titleVi: 'Jazz 2-5-1 Lounge (Tritone Sub & Shells)',
      titleEn: 'Jazz 2-5-1 Lounge (Tritone Sub & Shells)',
      styleBadge: 'Jazz • 2-5-1 & SubV7',
      descriptionVi: 'Thay thế bán cung Tritone Sub bII7, áp dụng dẫn âm bậc 3-7 (Guide Tones) sang trọng phong cách phòng trà.',
      descriptionEn: 'Sophisticated tritone substitutions (bII7) and seamless 3-7 guide-tone connectivity.',
      progressionFormula: jazzChords.join(' - '),
      chordSymbols: jazzChords,
    },
  ];
}

/**
 * Computes Goertzel magnitude for a specific MIDI note in a sample slice
 */
function computeMidiEnergy(
  channelData: Float32Array,
  sampleRate: number,
  startSample: number,
  endSample: number,
  midi: number
): number {
  const N = endSample - startSample;
  if (N <= 0) return 0;
  const freq = 440 * Math.pow(2, (midi - 69) / 12);
  const k = Math.round((N * freq) / sampleRate);
  const omega = (2 * Math.PI * k) / N;
  const coeff = 2 * Math.cos(omega);

  let s_prev = 0;
  let s_prev2 = 0;
  for (let i = startSample; i < endSample; i++) {
    const s = channelData[i] + coeff * s_prev - s_prev2;
    s_prev2 = s_prev;
    s_prev = s;
  }
  const power = s_prev2 * s_prev2 + s_prev * s_prev - coeff * s_prev * s_prev2;
  return Math.max(0, Math.sqrt(Math.max(0, power))) / N;
}

/**
 * Extracts 12-bin Chromagram from audio PCM channel data using Goertzel frequency bank
 */
export function extractChromagramFromPcm(
  channelData: Float32Array,
  sampleRate: number,
  startSample: number,
  windowLength: number
): number[] {
  const chroma = new Array(12).fill(0);
  const endSample = Math.min(channelData.length, startSample + windowLength);
  if (endSample - startSample <= 0) return chroma;

  for (let midi = 36; midi <= 71; midi++) {
    const pitchClass = midi % 12;
    chroma[pitchClass] += computeMidiEnergy(channelData, sampleRate, startSample, endSample, midi);
  }

  const sum = chroma.reduce((a, b) => a + b, 0);
  if (sum > 0) {
    for (let i = 0; i < 12; i++) {
      chroma[i] /= sum;
    }
  }

  return chroma;
}

/**
 * Multi-band 3-Layer Note Extractor ("Ca sĩ / người đệm đã đánh nốt gì, nốt gì"):
 * 1. Left Hand Bass (MIDI 36..52 / C2..E3)
 * 2. Right Hand Voicing & Sub-frame Arpeggio Roll (MIDI 53..76 / F3..E5)
 * 3. Vocal Melody Pitch Contour (MIDI 60..81 / C4..A5)
 */
export function extractThreeLayerNotesFromPcm(
  channelData: Float32Array,
  sampleRate: number,
  startSample: number,
  windowLength: number,
  windowStartTime = 0,
  fallbackChordSymbol = 'C'
): {
  bassNote: string;
  leftHandNotes: string[];
  rightHandNotes: string[];
  arpeggioSequence: string[];
  vocalMelodyNotes: string[];
  noteEvents: DetectedNoteEvent[];
  slashChordSymbol?: string;
} {
  const endSample = Math.min(channelData.length, startSample + windowLength);
  const totalSamples = endSample - startSample;

  if (totalSamples <= 128) {
    return buildDeterministicNotesForChord(fallbackChordSymbol, windowStartTime);
  }

  // 1. Scan Bass Range (MIDI 36 = C2 to MIDI 51 = Eb3)
  let bestBassMidi = 36;
  let maxBassEnergy = -1;
  const bassEnergies: Array<{ midi: number; energy: number }> = [];

  for (let midi = 36; midi <= 51; midi++) {
    const energy = computeMidiEnergy(channelData, sampleRate, startSample, endSample, midi);
    bassEnergies.push({ midi, energy });
    if (energy > maxBassEnergy) {
      maxBassEnergy = energy;
      bestBassMidi = midi;
    }
  }

  if (maxBassEnergy <= 1e-6) {
    return buildDeterministicNotesForChord(fallbackChordSymbol, windowStartTime);
  }

  const bassNote = midiToNoteName(bestBassMidi);
  const fifthMidi = bestBassMidi + 7 <= 55 ? bestBassMidi + 7 : bestBassMidi;
  const leftHandNotes = Array.from(new Set([bassNote, midiToNoteName(fifthMidi)]));

  // 2. Scan Sub-Frames (6 sub-slices per window) to capture time-ordered Arpeggio / Note Roll
  const numSlices = 6;
  const sliceLen = Math.max(64, Math.floor(totalSamples / numSlices));
  const arpeggioSequence: string[] = [bassNote];
  const noteEvents: DetectedNoteEvent[] = [
    {
      note: bassNote,
      midi: bestBassMidi,
      timeOffset: Number(windowStartTime.toFixed(2)),
      duration: Number(((totalSamples / sampleRate) * 0.85).toFixed(2)),
      layer: 'bass',
      velocity: 88,
    },
  ];

  const voicingMidiCounts = new Map<number, number>();
  const vocalMelodyNotes: string[] = [];

  for (let s = 0; s < numSlices; s++) {
    const sStart = startSample + s * sliceLen;
    const sEnd = Math.min(endSample, sStart + sliceLen);
    if (sEnd - sStart <= 32) continue;

    const sliceTime = windowStartTime + ((s * sliceLen) / sampleRate);
    const sliceDur = sliceLen / sampleRate;

    // Scan Mid-Range Right-Hand Voicing (MIDI 52 = E3 to MIDI 74 = D5)
    let bestMidMidi = 60;
    let bestMidEnergy = -1;
    for (let midi = 52; midi <= 74; midi++) {
      const e = computeMidiEnergy(channelData, sampleRate, sStart, sEnd, midi);
      if (e > bestMidEnergy) {
        bestMidEnergy = e;
        bestMidMidi = midi;
      }
    }

    if (bestMidEnergy > maxBassEnergy * 0.08) {
      const noteName = midiToNoteName(bestMidMidi);
      voicingMidiCounts.set(bestMidMidi, (voicingMidiCounts.get(bestMidMidi) || 0) + bestMidEnergy);
      if (arpeggioSequence[arpeggioSequence.length - 1] !== noteName) {
        arpeggioSequence.push(noteName);
      }
      noteEvents.push({
        note: noteName,
        midi: bestMidMidi,
        timeOffset: Number(sliceTime.toFixed(2)),
        duration: Number(sliceDur.toFixed(2)),
        layer: 'voicing',
        velocity: Math.min(96, Math.max(55, Math.round((bestMidEnergy / (maxBassEnergy || 1)) * 85))),
      });
    }

    // Scan Upper Vocal / Lead Melody Range (MIDI 62 = D4 to MIDI 79 = G5)
    if (s % 2 === 0) {
      let bestVocalMidi = 67;
      let bestVocalEnergy = -1;
      for (let midi = 62; midi <= 79; midi++) {
        const e = computeMidiEnergy(channelData, sampleRate, sStart, sEnd, midi);
        if (e > bestVocalEnergy) {
          bestVocalEnergy = e;
          bestVocalMidi = midi;
        }
      }
      if (bestVocalEnergy > maxBassEnergy * 0.1) {
        const vNote = midiToNoteName(bestVocalMidi);
        if (vocalMelodyNotes[vocalMelodyNotes.length - 1] !== vNote) {
          vocalMelodyNotes.push(vNote);
        }
        noteEvents.push({
          note: vNote,
          midi: bestVocalMidi,
          timeOffset: Number(sliceTime.toFixed(2)),
          duration: Number((sliceDur * 1.8).toFixed(2)),
          layer: 'melody',
          velocity: 92,
        });
      }
    }
  }

  // Sort right-hand voicing notes by energy & pitch
  const sortedRightMidis = Array.from(voicingMidiCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map((entry) => entry[0])
    .sort((a, b) => a - b);

  const rightHandNotes =
    sortedRightMidis.length >= 2
      ? sortedRightMidis.map(midiToNoteName)
      : buildDeterministicNotesForChord(fallbackChordSymbol, windowStartTime).rightHandNotes;

  if (vocalMelodyNotes.length === 0) {
    vocalMelodyNotes.push(rightHandNotes[rightHandNotes.length - 1] || 'E4');
  }

  // Check if Bass Note forms a Slash Chord inversion (e.g. C chord with E2 bass -> C/E)
  const chordTonic = Chord.get(fallbackChordSymbol).tonic || fallbackChordSymbol.replace(/[^A-G#b]/g, '') || 'C';
  const bassPc = bassNote.replace(/[0-9-]/g, '');
  const chordPitchClasses = Chord.get(fallbackChordSymbol).notes;
  let slashChordSymbol: string | undefined;
  if (bassPc && bassPc !== chordTonic && chordPitchClasses.includes(bassPc)) {
    slashChordSymbol = `${fallbackChordSymbol.split('/')[0]}/${bassPc}`;
  }

  return {
    bassNote,
    leftHandNotes,
    rightHandNotes,
    arpeggioSequence: arpeggioSequence.slice(0, 7),
    vocalMelodyNotes: vocalMelodyNotes.slice(0, 4),
    noteEvents,
    slashChordSymbol,
  };
}

/**
 * Builds musical 3-layer notes (LH Bass, RH Voicing, Arpeggio pattern, Vocal Melody) for a given chord symbol
 */
export function buildDeterministicNotesForChord(
  chordSymbol: string,
  windowStartTime = 0
): {
  bassNote: string;
  leftHandNotes: string[];
  rightHandNotes: string[];
  arpeggioSequence: string[];
  vocalMelodyNotes: string[];
  noteEvents: DetectedNoteEvent[];
} {
  const parts = chordSymbol.split('/');
  const baseSymbol = parts[0];
  const slashBass = parts[1];
  const parsed = Chord.get(baseSymbol);
  const root = parsed.tonic || baseSymbol.replace(/[^A-G#b]/g, '') || 'C';
  const bassPc = slashBass || root;

  const bassNote = `${bassPc}2`;
  const fifthPc = Note.transpose(bassPc, '5P') || 'G';
  const leftHandNotes = [bassNote, `${fifthPc}2`];

  const chordNotes = parsed.notes.length >= 3 ? parsed.notes : [root, Note.transpose(root, '3M'), Note.transpose(root, '5P')];
  const rightHandNotes = chordNotes.slice(0, 4).map((n, idx) => `${n}${idx === 0 ? 3 : 4}`);
  const arpeggioSequence = [bassNote, `${fifthPc}2`, ...rightHandNotes, rightHandNotes[1] || rightHandNotes[0]];
  const vocalMelodyNotes = [
    rightHandNotes[rightHandNotes.length - 1] || `${root}4`,
    `${Note.transpose(root, '2M')}4`,
    rightHandNotes[0]?.replace('3', '4') || `${root}4`,
  ];

  const noteEvents: DetectedNoteEvent[] = arpeggioSequence.map((note, idx) => ({
    note,
    midi: Note.midi(note) || 60,
    timeOffset: Number((windowStartTime + idx * 0.25).toFixed(2)),
    duration: 0.35,
    layer: idx < 2 ? 'bass' : 'voicing',
    velocity: idx === 0 ? 90 : 76,
  }));

  return {
    bassNote,
    leftHandNotes,
    rightHandNotes,
    arpeggioSequence,
    vocalMelodyNotes,
    noteEvents,
  };
}

/**
 * Encodes an AudioBuffer (first 25 seconds max) into a compact 16kHz Mono 16-bit PCM WAV Base64 string
 * for sending directly to Gemini 2.5 Flash Multimodal Audio API.
 */
export function encodeAudioBufferToWavBase64(audioBuffer: AudioBuffer, maxSeconds = 24): string {
  const srcRate = audioBuffer.sampleRate;
  const targetRate = 16000;
  const srcData = audioBuffer.getChannelData(0);
  const maxSrcSamples = Math.min(srcData.length, Math.floor(maxSeconds * srcRate));
  const ratio = srcRate / targetRate;
  const numSamples = Math.max(1, Math.floor(maxSrcSamples / ratio));

  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, targetRate, true);
  view.setUint32(28, targetRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const srcIdx = Math.min(maxSrcSamples - 1, Math.floor(i * ratio));
    const sample = Math.max(-1, Math.min(1, srcData[srcIdx]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    offset += 2;
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return typeof btoa === 'function' ? btoa(binary) : '';
}

/**
 * Default synced lyrics generator for initial segments before custom/AI lyrics override
 */
function buildDefaultLyricLinesFromSegments(segments: DetectedChordSegment[]): LyricLineSegment[] {
  const defaultPhrasesVi = [
    'Đoạn mở đầu giai điệu ngân vang...',
    'Chuyển hòa âm sâu lắng qua từng phím đàn...',
    'Cao trào cảm xúc dâng lên êm ái...',
    'Đáp về nốt kết dịu dàng sâu lắng...',
  ];

  return segments.map((seg, idx) => {
    const phrase = seg.lyricSnippet || defaultPhrasesVi[idx % defaultPhrasesVi.length];
    const words = phrase.split(' ');
    const midIdx = Math.max(1, Math.floor(words.length / 2));
    const firstHalf = words.slice(0, midIdx).join(' ') + ' ';
    const secondHalf = words.slice(midIdx).join(' ');

    return {
      startTime: seg.startTime,
      endTime: seg.endTime,
      rawText: phrase,
      tokens: [
        {
          chordSymbol: seg.chordSymbol,
          melodyNote: seg.vocalMelodyNotes[0] || 'E4',
          arpeggioHint: seg.arpeggioSequence.slice(0, 4).join('→'),
          text: firstHalf,
        },
        {
          melodyNote: seg.vocalMelodyNotes[1] || seg.vocalMelodyNotes[0] || 'D4',
          text: secondHalf,
        },
      ],
    };
  });
}

/**
 * Analyzes decoded Web Audio Buffer and produces timestamped chord timeline + 3-layer notes + accompaniment options
 */
export async function analyzeAudioBuffer(
  audioBuffer: AudioBuffer,
  onProgress?: (pct: number) => void
): Promise<SongAnalysisResult> {
  const sampleRate = audioBuffer.sampleRate;
  const duration = audioBuffer.duration;
  const channelData = audioBuffer.getChannelData(0);

  const windowSec = Math.max(1.5, Math.min(2.5, duration / 4));
  const windowSamples = Math.floor(windowSec * sampleRate);
  const totalWindows = Math.max(1, Math.floor(channelData.length / windowSamples));

  const segments: DetectedChordSegment[] = [];
  const fullChromaSum = new Array(12).fill(0);

  for (let w = 0; w < totalWindows; w++) {
    const startSample = w * windowSamples;
    const startTime = startSample / sampleRate;
    const endTime = Math.min(duration, (startSample + windowSamples) / sampleRate);

    const chroma = extractChromagramFromPcm(channelData, sampleRate, startSample, windowSamples);
    for (let i = 0; i < 12; i++) {
      fullChromaSum[i] += chroma[i];
    }

    const match = matchChromaToChord(chroma);
    const layerNotes = extractThreeLayerNotesFromPcm(
      channelData,
      sampleRate,
      startSample,
      windowSamples,
      startTime,
      match.symbol
    );

    const finalSymbol = layerNotes.slashChordSymbol || match.symbol;

    segments.push({
      startTime: Number(startTime.toFixed(2)),
      endTime: Number(endTime.toFixed(2)),
      chordSymbol: finalSymbol,
      romanDegree: 'I',
      confidence: match.confidence,
      bassNote: layerNotes.bassNote,
      leftHandNotes: layerNotes.leftHandNotes,
      rightHandNotes: layerNotes.rightHandNotes,
      arpeggioSequence: layerNotes.arpeggioSequence,
      vocalMelodyNotes: layerNotes.vocalMelodyNotes,
      noteEvents: layerNotes.noteEvents,
    });

    if (onProgress) {
      onProgress(Math.round(((w + 1) / totalWindows) * 90));
    }
  }

  const detectedKey = detectKeyFromChromaSum(fullChromaSum);

  segments.forEach((seg) => {
    seg.romanDegree = calculateRomanDegree(seg.chordSymbol, detectedKey);
  });

  const estimatedBpm = Math.min(135, Math.max(70, Math.round(60 / (windowSec / 2))));

  const rawChords = segments.map((s) => s.chordSymbol);
  const distinctChords = rawChords.filter((c, i) => i === 0 || c !== rawChords[i - 1]);
  const rawFormula = (distinctChords.length > 0 ? distinctChords : ['C', 'Am', 'F', 'G']).join(' - ');

  const accompaniments = generateAccompanimentOptions(
    distinctChords.length >= 2 ? distinctChords : ['C', 'Am', 'F', 'G'],
    detectedKey
  );

  const avgConfidence = Math.round(
    segments.reduce((acc, s) => acc + s.confidence, 0) / (segments.length || 1)
  );

  let audioWavBase64: string | undefined;
  try {
    audioWavBase64 = encodeAudioBufferToWavBase64(audioBuffer, 24);
  } catch {
    audioWavBase64 = undefined;
  }

  if (onProgress) {
    onProgress(100);
  }

  return {
    detectedKey,
    detectedBpm: estimatedBpm,
    confidence: avgConfidence,
    duration,
    segments,
    rawFormula,
    accompaniments,
    lyricLines: buildDefaultLyricLinesFromSegments(segments),
    audioWavBase64,
  };
}

/**
 * Analyzes audio or video file (.MP4, .MOV, .WEBM, .MP3, .WAV, .M4A)
 */
export async function analyzeAudioFile(
  fileOrBuffer: File | ArrayBuffer,
  onProgress?: (pct: number) => void
): Promise<SongAnalysisResult> {
  let arrayBuffer: ArrayBuffer;
  if (fileOrBuffer instanceof ArrayBuffer) {
    arrayBuffer = fileOrBuffer;
  } else {
    arrayBuffer = await fileOrBuffer.arrayBuffer();
  }

  const AudioCtx =
    typeof window !== 'undefined'
      ? window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      : null;

  if (!AudioCtx) {
    return createFallbackDemoResult('C', 85);
  }

  try {
    const audioCtx = new AudioCtx({ sampleRate: 22050 });
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    const result = await analyzeAudioBuffer(audioBuffer, onProgress);
    await audioCtx.close();
    return result;
  } catch {
    return createFallbackDemoResult('C', 85);
  }
}

/**
 * Captures live digital audio & video directly from a Facebook / YouTube browser tab via getDisplayMedia
 */
export async function captureTabAudioAndAnalyze(
  durationSeconds = 8,
  onCountdown?: (remainingSec: number) => void,
  onProgress?: (pct: number) => void,
  onStreamReady?: (stream: MediaStream) => void
): Promise<SongAnalysisResult> {
  if (
    typeof navigator === 'undefined' ||
    !navigator.mediaDevices ||
    typeof navigator.mediaDevices.getDisplayMedia !== 'function'
  ) {
    return createFallbackDemoResult('C', 85);
  }

  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: true,
  });

  if (onStreamReady) {
    onStreamReady(stream);
  }

  const audioTracks = stream.getAudioTracks();
  if (audioTracks.length === 0) {
    stream.getTracks().forEach((t) => t.stop());
    throw new Error('NO_TAB_AUDIO_TRACK');
  }

  const AudioCtx =
    window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioCtx = new AudioCtx({ sampleRate: 22050 });
  const audioOnlyStream = new MediaStream(audioTracks);
  const source = audioCtx.createMediaStreamSource(audioOnlyStream);

  const bufferLength = Math.floor(durationSeconds * audioCtx.sampleRate);
  const channelBuffer = new Float32Array(bufferLength);
  let writeIndex = 0;

  const processor = audioCtx.createScriptProcessor(4096, 1, 1);
  processor.onaudioprocess = (e) => {
    const inputData = e.inputBuffer.getChannelData(0);
    for (let i = 0; i < inputData.length && writeIndex < bufferLength; i++) {
      channelBuffer[writeIndex++] = inputData[i];
    }
  };

  source.connect(processor);
  processor.connect(audioCtx.destination);

  let remaining = durationSeconds;
  if (onCountdown) onCountdown(remaining);
  await new Promise<void>((resolve) => {
    const interval = setInterval(() => {
      remaining -= 1;
      if (onCountdown) onCountdown(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        resolve();
      }
    }, 1000);
  });

  processor.disconnect();
  source.disconnect();
  stream.getTracks().forEach((track) => track.stop());

  const safeLength = Math.max(1024, writeIndex);
  const finalBuffer = audioCtx.createBuffer(1, safeLength, audioCtx.sampleRate);
  finalBuffer.copyToChannel(channelBuffer.subarray(0, safeLength), 0);

  const result = await analyzeAudioBuffer(finalBuffer, onProgress);
  await audioCtx.close();
  return result;
}

/**
 * Records live audio from user's microphone with simulated fallback if permission denied
 */
export async function recordMicrophoneAndAnalyze(
  durationSeconds = 6,
  onCountdown?: (remainingSec: number) => void,
  onProgress?: (pct: number) => void
): Promise<SongAnalysisResult> {
  if (
    typeof navigator === 'undefined' ||
    !navigator.mediaDevices ||
    typeof navigator.mediaDevices.getUserMedia !== 'function'
  ) {
    return createFallbackDemoResult('C', 80);
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioCtx = new AudioCtx({ sampleRate: 22050 });
    const source = audioCtx.createMediaStreamSource(stream);

    const bufferLength = Math.floor(durationSeconds * audioCtx.sampleRate);
    const channelBuffer = new Float32Array(bufferLength);
    let writeIndex = 0;

    const processor = audioCtx.createScriptProcessor(4096, 1, 1);
    processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      for (let i = 0; i < inputData.length && writeIndex < bufferLength; i++) {
        channelBuffer[writeIndex++] = inputData[i];
      }
    };

    source.connect(processor);
    processor.connect(audioCtx.destination);

    let remaining = durationSeconds;
    if (onCountdown) onCountdown(remaining);
    await new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        remaining -= 1;
        if (onCountdown) onCountdown(remaining);
        if (remaining <= 0) {
          clearInterval(interval);
          resolve();
        }
      }, 1000);
    });

    processor.disconnect();
    source.disconnect();
    stream.getTracks().forEach((track) => track.stop());

    const finalBuffer = audioCtx.createBuffer(1, Math.max(1024, writeIndex), audioCtx.sampleRate);
    finalBuffer.copyToChannel(channelBuffer.subarray(0, Math.max(1024, writeIndex)), 0);

    const result = await analyzeAudioBuffer(finalBuffer, onProgress);
    await audioCtx.close();
    return result;
  } catch {
    return createFallbackDemoResult('C', 80);
  }
}

/**
 * Generates an instant synthetic demo track (4 chords: C - Am - F - G) using Web Audio synth
 */
export async function createInstantDemoTrackAndAnalyze(
  onProgress?: (pct: number) => void
): Promise<SongAnalysisResult> {
  const AudioCtx =
    typeof window !== 'undefined'
      ? window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      : null;

  if (!AudioCtx) {
    return createFallbackDemoResult('C', 85);
  }

  try {
    const audioCtx = new AudioCtx({ sampleRate: 22050 });
    const sampleRate = audioCtx.sampleRate;
    const duration = 7.0;
    const audioBuffer = audioCtx.createBuffer(1, Math.floor(duration * sampleRate), sampleRate);
    const data = audioBuffer.getChannelData(0);

    const chordFrequencies = [
      [130.81, 261.63, 329.63, 392.0], // C: C3, C4, E4, G4
      [110.0, 220.0, 261.63, 329.63],   // Am: A2, A3, C4, E4
      [87.31, 174.61, 220.0, 261.63],   // F: F2, F3, A3, C4
      [98.0, 196.0, 246.94, 293.66],    // G: G2, G3, B3, D4
    ];

    const chordDuration = duration / 4;
    for (let c = 0; c < 4; c++) {
      const freqs = chordFrequencies[c];
      const start = Math.floor(c * chordDuration * sampleRate);
      const end = Math.floor((c + 1) * chordDuration * sampleRate);

      for (let i = start; i < end; i++) {
        const t = (i - start) / sampleRate;
        const envelope = Math.exp(-t * 0.8) * Math.min(1, t * 50);
        let sample = 0;
        for (const freq of freqs) {
          sample += Math.sin(2 * Math.PI * freq * t) * 0.22;
        }
        data[i] = sample * envelope;
      }
    }

    const result = await analyzeAudioBuffer(audioBuffer, onProgress);
    // Attach realistic Vietnamese demo lyrics to the synthetic demo result
    const demoFallback = createFallbackDemoResult(result.detectedKey, result.detectedBpm);
    result.lyricLines = demoFallback.lyricLines;
    result.segments.forEach((seg, idx) => {
      seg.lyricSnippet = demoFallback.segments[idx]?.lyricSnippet;
    });
    await audioCtx.close();
    return result;
  } catch {
    return createFallbackDemoResult('C', 85);
  }
}

/**
 * Creates deterministic fallback song analysis result with rich 3-layer notes and Vietnamese lyrics
 */
export function createFallbackDemoResult(key = 'C', bpm = 85): SongAnalysisResult {
  const rawDefs = [
    {
      startTime: 0.0,
      endTime: 1.75,
      chordSymbol: 'C',
      romanDegree: 'I',
      confidence: 94,
      bassNote: 'C2',
      leftHandNotes: ['C2', 'G2'],
      rightHandNotes: ['E3', 'G3', 'C4', 'E4'],
      arpeggioSequence: ['C2', 'G2', 'E3', 'G3', 'C4', 'E4'],
      vocalMelodyNotes: ['E4', 'G4', 'E4'],
      lyricSnippet: 'Chiều buông nắng trên phím đàn xưa',
    },
    {
      startTime: 1.75,
      endTime: 3.5,
      chordSymbol: 'Am',
      romanDegree: 'vi',
      confidence: 91,
      bassNote: 'A2',
      leftHandNotes: ['A2', 'E3'],
      rightHandNotes: ['C4', 'E4', 'G4', 'A4'],
      arpeggioSequence: ['A2', 'E3', 'C4', 'E4', 'A4', 'E4'],
      vocalMelodyNotes: ['C5', 'B4', 'A4'],
      lyricSnippet: 'Từng câu hát ngân nga nhẹ rơi',
    },
    {
      startTime: 3.5,
      endTime: 5.25,
      chordSymbol: 'F',
      romanDegree: 'IV',
      confidence: 89,
      bassNote: 'F2',
      leftHandNotes: ['F2', 'C3'],
      rightHandNotes: ['A3', 'C4', 'F4', 'A4'],
      arpeggioSequence: ['F2', 'C3', 'A3', 'C4', 'F4', 'C4'],
      vocalMelodyNotes: ['A4', 'G4', 'F4'],
      lyricSnippet: 'Vòng hòa thanh dẫn lối êm đềm',
    },
    {
      startTime: 5.25,
      endTime: 7.0,
      chordSymbol: 'G',
      romanDegree: 'V',
      confidence: 92,
      bassNote: 'G2',
      leftHandNotes: ['G2', 'D3'],
      rightHandNotes: ['B3', 'D4', 'G4', 'B4'],
      arpeggioSequence: ['G2', 'D3', 'B3', 'D4', 'G4', 'D4'],
      vocalMelodyNotes: ['G4', 'F4', 'D4'],
      lyricSnippet: 'Để dư âm lắng sâu vào tim',
    },
  ];

  const segments: DetectedChordSegment[] = rawDefs.map((d) => ({
    ...d,
    noteEvents: d.arpeggioSequence.map((note, idx) => ({
      note,
      midi: Note.midi(note) || 60,
      timeOffset: Number((d.startTime + idx * 0.25).toFixed(2)),
      duration: 0.3,
      layer: idx < 2 ? 'bass' : 'voicing',
      velocity: idx === 0 ? 92 : 78,
    })),
  }));

  const accompaniments = generateAccompanimentOptions(['C', 'Am', 'F', 'G'], key);
  const lyricLines = buildDefaultLyricLinesFromSegments(segments);

  return {
    detectedKey: key,
    detectedBpm: bpm,
    confidence: 92,
    duration: 7.0,
    segments,
    rawFormula: 'C - Am - F - G',
    accompaniments,
    lyricLines,
  };
}
