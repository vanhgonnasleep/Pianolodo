import { describe, it, expect } from 'vitest';
import {
  cosineSimilarity,
  matchChromaToChord,
  detectKeyFromChromaSum,
  calculateRomanDegree,
  generateAccompanimentOptions,
  createFallbackDemoResult,
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
    // C Major template: C (0), E (4), G (7)
    const cMajorChroma = new Array(12).fill(0);
    cMajorChroma[0] = 1.0;
    cMajorChroma[4] = 0.8;
    cMajorChroma[7] = 0.8;

    const matchC = matchChromaToChord(cMajorChroma);
    expect(matchC.symbol).toBe('C');
    expect(matchC.confidence).toBeGreaterThan(80);

    // A Minor template: A (9), C (0), E (4)
    const aMinorChroma = new Array(12).fill(0);
    aMinorChroma[9] = 1.0;
    aMinorChroma[0] = 0.8;
    aMinorChroma[4] = 0.8;

    const matchAm = matchChromaToChord(aMinorChroma);
    expect(matchAm.symbol).toBe('Am');
    expect(matchAm.confidence).toBeGreaterThan(80);
  });

  it('determines the global musical key from aggregate chroma distribution', () => {
    // Synthetic C Major piece chroma: C, D, E, F, G, A, B energy
    const cMajorPieceChroma = [
      1.0, // C
      0.1, // C#
      0.6, // D
      0.1, // D#
      0.8, // E
      0.7, // F
      0.1, // F#
      0.9, // G
      0.1, // G#
      0.6, // A
      0.1, // A#
      0.5, // B
    ];

    const detectedKey = detectKeyFromChromaSum(cMajorPieceChroma);
    expect(detectedKey).toBe('C');
  });

  it('correctly maps chord symbols to Roman numeral degrees', () => {
    expect(calculateRomanDegree('C', 'C')).toBe('I');
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

    // Pop Ballad
    expect(ballad.id).toBe('pop-ballad');
    expect(ballad.chordSymbols[0]).toContain('add9');
    expect(ballad.titleVi).toContain('Ballad');

    // R&B / Neo-Soul
    expect(rnb.id).toBe('rnb-neosoul');
    expect(rnb.chordSymbols.some((c) => c.includes('maj9') || c.includes('m11') || c.includes('m9'))).toBe(true);
    expect(rnb.titleVi).toContain('R&B');

    // Jazz 2-5-1 Lounge
    expect(jazz.id).toBe('jazz-lounge');
    expect(jazz.chordSymbols.some((c) => c.includes('7') || c.includes('9'))).toBe(true);
    expect(jazz.titleVi).toContain('Jazz');
  });

  it('provides a deterministic fallback demo result with 4 measure segments', () => {
    const demo = createFallbackDemoResult('C', 85);
    expect(demo.detectedKey).toBe('C');
    expect(demo.detectedBpm).toBe(85);
    expect(demo.segments).toHaveLength(4);
    expect(demo.rawFormula).toBe('C - Am - F - G');
    expect(demo.accompaniments).toHaveLength(3);
  });
});
