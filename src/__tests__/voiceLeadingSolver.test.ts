import { describe, it, expect } from 'vitest';
import { voiceChordSequence } from '../engine/voiceLeadingSolver';

describe('Smooth Two-Hand Voice-Leading Solver', () => {
  it('voices a 2-5-1 progression (Dm9 -> G13 -> Cmaj9) with minimal finger movement', () => {
    const voiced = voiceChordSequence(
      [
        { symbol: 'Dm9', romanDegree: 'ii9', functionRole: 'primary', ruleId: 'ext-min9' },
        { symbol: 'G13', romanDegree: 'V13', functionRole: 'primary', ruleId: 'ext-dom13sus4' },
        { symbol: 'Cmaj9', romanDegree: 'Imaj9', functionRole: 'primary', ruleId: 'ext-maj9' },
      ],
      'C'
    );

    expect(voiced).toHaveLength(3);
    // Dm9 (F-A-C-E) -> G13 (F-A-B-E) shares F, A, E and only moves C -> B (-1 semitone)!
    const g13Diff = voiced[1].voiceLeading;
    expect(g13Diff.keptNotes.length).toBeGreaterThanOrEqual(2);
    expect(g13Diff.smoothnessScore).toBeGreaterThanOrEqual(80);
  });

  it('prevents muddy low intervals in left hand and respects slash bass (Review Focus #2)', () => {
    const voiced = voiceChordSequence(
      [
        { symbol: 'C', romanDegree: 'I', functionRole: 'primary', ruleId: 'ext-maj9' },
        { symbol: 'G/B', romanDegree: 'V/7', functionRole: 'passing-bridge', ruleId: 'slash-walkdown-i-vi' },
      ],
      'D'
    );
    // Left hand of G/B must have B as its lowest bass note
    expect(voiced[1].leftHand[0].pitchClass).toBe('B');
    // Left hand intervals below MIDI 40 (E2) must be at least 7 semitones (perfect 5th)
    for (const ch of voiced) {
      if (ch.leftHand.length >= 2 && ch.leftHand[0].midi < 40) {
        const interval = ch.leftHand[1].midi - ch.leftHand[0].midi;
        expect(interval).toBeGreaterThanOrEqual(7);
      }
    }
  });

  it('prevents right-hand register drift across long 8-chord progressions (Review Focus #3)', () => {
    const canon = ['Cmaj7', 'G7', 'Am7', 'Em7', 'Fmaj7', 'Cmaj7', 'Dm7', 'G7'].map((s) => ({
      symbol: s,
      romanDegree: 'I',
      functionRole: 'primary' as const,
      ruleId: 'ext-maj9',
    }));
    const voiced = voiceChordSequence(canon, 'C');
    for (const ch of voiced) {
      const avgMidi =
        ch.rightHand.reduce((sum, n) => sum + n.midi, 0) / ch.rightHand.length;
      expect(avgMidi).toBeGreaterThanOrEqual(55); // >= G3
      expect(avgMidi).toBeLessThanOrEqual(76);    // <= E5
    }
  });

  it('correctly voices diminished and half-diminished chords with a diminished 5th in LH instead of perfect 5th (Audit Finding B1)', () => {
    const voiced = voiceChordSequence(
      [
        { symbol: 'Bm7b5', romanDegree: 'viiø7', functionRole: 'primary', ruleId: 'ext-min9' },
        { symbol: 'C#dim7', romanDegree: 'vii°7', functionRole: 'primary', ruleId: 'dim-passing' },
      ],
      'C'
    );
    // For Bm7b5 (B, D, F, A): Left hand must play B and F (diminished 5th = 6 semitones), NOT F# (7 semitones)
    const bm7b5LH = voiced[0].leftHand;
    expect(bm7b5LH).toHaveLength(2);
    expect(bm7b5LH[0].pitchClass).toBe('B');
    expect(bm7b5LH[1].pitchClass).toBe('F');
    expect(bm7b5LH[1].midi - bm7b5LH[0].midi).toBe(6);

    // For C#dim7 (C#, E, G, Bb): Left hand must play C# and G (diminished 5th = 6 semitones), NOT G# (7 semitones)
    const cSharpDimLH = voiced[1].leftHand;
    expect(cSharpDimLH[1].midi - cSharpDimLH[0].midi).toBe(6);
  });
});
