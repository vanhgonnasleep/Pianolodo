import { describe, it, expect } from 'vitest';
import {
  cosineSimilarity,
  matchChromaToChord,
  detectKeyFromChromaSum,
  calculateRomanDegree,
  generateAccompanimentOptions,
  createFallbackDemoResult,
  extractThreeLayerNotesFromPcm,
} from '../core/audioChordAnalyzer';

describe('Audio & Melody-to-Chord Analyzer DSP Engine', () => {
  it('calculates cosine similarity correctly for orthogonal and parallel vectors', () => {
    const vecA = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const vecB = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const vecC = [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    expect(cosineSimilarity(vecA, vecB)).toBeCloseTo(1.0, 4);
    expect(cosineSimilarity(vecA, vecC)).toBeCloseTo(0.0, 4);
  });

  it('accurately identifies C Major and A Minor from synthetic chromagram vectors', () => {
    const cMajorChroma = new Array(12).fill(0);
    cMajorChroma[0] = 1.0;
    cMajorChroma[4] = 0.8;
    cMajorChroma[7] = 0.8;

    const matchC = matchChromaToChord(cMajorChroma);
    expect(matchC.symbol).toBe('C');
    expect(matchC.confidence).toBeGreaterThan(80);

    const aMinorChroma = new Array(12).fill(0);
    aMinorChroma[9] = 1.0;
    aMinorChroma[0] = 0.8;
    aMinorChroma[4] = 0.8;

    const matchAm = matchChromaToChord(aMinorChroma);
    expect(matchAm.symbol).toBe('Am');
    expect(matchAm.confidence).toBeGreaterThan(80);
  });

  it('determines the global musical key from aggregate chroma distribution', () => {
    const cMajorPieceChroma = [
      1.0, 0.1, 0.6, 0.1, 0.8, 0.7, 0.1, 0.9, 0.1, 0.6, 0.1, 0.5,
    ];

    const detectedKey = detectKeyFromChromaSum(cMajorPieceChroma);
    expect(detectedKey).toBe('C');
  });

  it('correctly maps chord symbols (including slash inversions) to Roman numeral degrees', () => {
    expect(calculateRomanDegree('C', 'C')).toBe('I');
    expect(calculateRomanDegree('C/E', 'C')).toBe('I');
    expect(calculateRomanDegree('Dm', 'C')).toBe('ii');
    expect(calculateRomanDegree('F', 'C')).toBe('IV');
    expect(calculateRomanDegree('G', 'C')).toBe('V');
    expect(calculateRomanDegree('Am', 'C')).toBe('vi');
    expect(calculateRomanDegree('Db7', 'C')).toBe('bII');
  });

  it('generates 3 distinct rich accompaniment variations (Ballad, R&B, Jazz)', () => {
    const rawChords = ['C', 'Am', 'F', 'G'];
    const options = generateAccompanimentOptions(rawChords, 'C');

    expect(options).toHaveLength(3);

    const [ballad, rnb, jazz] = options;

    expect(ballad.id).toBe('pop-ballad');
    expect(ballad.chordSymbols[0]).toContain('add9');
    expect(ballad.titleVi).toContain('Ballad');

    expect(rnb.id).toBe('rnb-neosoul');
    expect(rnb.chordSymbols.some((c) => c.includes('maj9') || c.includes('m11') || c.includes('m9'))).toBe(true);
    expect(rnb.titleVi).toContain('R&B');

    expect(jazz.id).toBe('jazz-lounge');
    expect(jazz.chordSymbols.some((c) => c.includes('7') || c.includes('9'))).toBe(true);
    expect(jazz.titleVi).toContain('Jazz');
  });

  it('extracts 3-layer notes (Bass, Right-Hand Arpeggio sequence, Vocal Melody, and Slash Inversion) from synthetic PCM', () => {
    const sampleRate = 22050;
    const durationSec = 1.2;
    const numSamples = Math.floor(sampleRate * durationSec);
    const pcm = new Float32Array(numSamples);

    // Synthesize E2 Bass (82.41 Hz = MIDI 40) + C4 (261.63 Hz = MIDI 60) -> G4 (392.00 Hz = MIDI 67)
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const bassE2 = Math.sin(2 * Math.PI * 82.41 * t) * 0.6;
      const midNote =
        i < numSamples / 2
          ? Math.sin(2 * Math.PI * 261.63 * t) * 0.45 // C4 in first half
          : Math.sin(2 * Math.PI * 392.0 * t) * 0.45; // G4 in second half
      pcm[i] = bassE2 + midNote;
    }

    const layers = extractThreeLayerNotesFromPcm(pcm, sampleRate, 0, numSamples, 0, 'C');

    expect(layers.bassNote).toBe('E2');
    expect(layers.slashChordSymbol).toBe('C/E');
    expect(layers.arpeggioSequence[0]).toBe('E2');
    expect(layers.arpeggioSequence).toContain('C4');
    expect(layers.arpeggioSequence).toContain('G4');
    expect(layers.noteEvents.length).toBeGreaterThanOrEqual(3);
  });

  it('provides a deterministic fallback demo result with 3-layer notes and synced lyrics', () => {
    const demo = createFallbackDemoResult('C', 85);
    expect(demo.detectedKey).toBe('C');
    expect(demo.detectedBpm).toBe(85);
    expect(demo.segments).toHaveLength(4);
    expect(demo.segments[0].bassNote).toBe('C2');
    expect(demo.segments[0].arpeggioSequence.length).toBeGreaterThanOrEqual(4);
    expect(demo.segments[0].vocalMelodyNotes.length).toBeGreaterThanOrEqual(1);
    expect(demo.lyricLines).toHaveLength(4);
  });
});
