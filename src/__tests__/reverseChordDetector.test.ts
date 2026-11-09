import { describe, it, expect } from 'vitest';
import { detectChordFromMidis } from '../engine/reverseChordDetector';

describe('Real-Time Reverse Chord Detector (Pianolodo 3.0)', () => {
  it('detects C major triad from [60, 64, 67]', () => {
    const result = detectChordFromMidis([60, 64, 67]);
    expect(result).not.toBeNull();
    expect(result?.chordSymbol).toBe('C');
    expect(result?.root).toBe('C');
  });

  it('detects Dm9 from [62, 65, 69, 72, 76] (D, F, A, C, E)', () => {
    const result = detectChordFromMidis([62, 65, 69, 72, 76]);
    expect(result).not.toBeNull();
    expect(result?.chordSymbol).toMatch(/Dm9|D-9/);
  });

  it('detects slash chord when bass note is distinct', () => {
    // C major with G in bass: [55, 60, 64, 67]
    const result = detectChordFromMidis([55, 60, 64, 67]);
    expect(result).not.toBeNull();
    expect(result?.chordSymbol).toMatch(/C\/G|G.*sus/);
  });

  it('returns null when less than 2 distinct notes are provided', () => {
    expect(detectChordFromMidis([])).toBeNull();
    expect(detectChordFromMidis([60])).toBeNull();
  });
});
