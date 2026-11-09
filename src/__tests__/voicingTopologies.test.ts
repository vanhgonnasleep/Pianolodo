import { describe, it, expect } from 'vitest';
import { voiceChordSequence, getRightHandPitchClasses } from '../engine/voiceLeadingSolver';

describe('Advanced Voicing Topologies (Pianolodo 3.0)', () => {
  it('generates Bill Evans Rootless Type A voicings with 3rd at bottom', () => {
    // Dm7 rootless A: F - A - C - E (3 - 5 - 7 - 9)
    const dmPcs = getRightHandPitchClasses('Dm9', 'rootless-a');
    expect(dmPcs[0]).toBe('F'); // 3rd of Dm
    expect(dmPcs).toContain('C'); // 7th
    expect(dmPcs).toContain('E'); // 9th

    // G7 rootless A: B - E - F - A (3 - 13 - 7 - 9)
    const gPcs = getRightHandPitchClasses('G13', 'rootless-a');
    expect(gPcs[0]).toBe('B'); // 3rd of G
    expect(gPcs).toContain('F'); // 7th
  });

  it('generates Bill Evans Rootless Type B voicings with 7th at bottom', () => {
    // Dm7 rootless B: C - E - F - A (7 - 9 - 3 - 5)
    const dmPcs = getRightHandPitchClasses('Dm9', 'rootless-b');
    expect(dmPcs[0]).toBe('C'); // 7th of Dm
    expect(dmPcs).toContain('F'); // 3rd
    expect(dmPcs).toContain('E'); // 9th

    // G7 rootless B: F - A - B - E (7 - 9 - 3 - 13)
    const gPcs = getRightHandPitchClasses('G13', 'rootless-b');
    expect(gPcs[0]).toBe('F'); // 7th of G
    expect(gPcs).toContain('B'); // 3rd
  });

  it('generates McCoy Tyner Quartal stacked 4ths', () => {
    // Dm quartal: stacked 4ths
    const quartalPcs = getRightHandPitchClasses('Dm7', 'quartal');
    expect(quartalPcs).toHaveLength(4);
  });

  it('voices complete 2-5-1 sequence using Drop-2 topology', () => {
    const sequence = [
      { symbol: 'Dm7', romanDegree: 'ii', functionRole: 'primary' as const, ruleId: 'ext-min9' },
      { symbol: 'G7', romanDegree: 'V', functionRole: 'primary' as const, ruleId: 'ext-dom13sus4' },
      { symbol: 'Cmaj7', romanDegree: 'I', functionRole: 'primary' as const, ruleId: 'ext-maj9' },
    ];
    const voiced = voiceChordSequence(sequence, 'C', 'drop-2');
    expect(voiced).toHaveLength(3);
    for (const ch of voiced) {
      expect(ch.rightHand.length).toBeGreaterThanOrEqual(3);
      expect(ch.leftHand.length).toBeGreaterThanOrEqual(1);
    }
  });
});
