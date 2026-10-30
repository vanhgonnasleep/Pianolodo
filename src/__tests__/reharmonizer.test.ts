import { describe, it, expect } from 'vitest';
import { buildProgressionState } from '../engine/reharmonizer';

describe('Vibe Reharmonization Engine', () => {
  it('upgrades basic 2 - 5 - 1 into different color chords depending on selected Vibe', () => {
    const popState = buildProgressionState('2 - 5 - 1', 'pop-ballad', 1, 'C');
    const rnbState = buildProgressionState('2 - 5 - 1', 'rnb-neosoul', 1, 'C');
    const jazzState = buildProgressionState('2 - 5 - 1', 'jazz-bossa', 3, 'C');

    expect(popState.originalChords.map((c) => c.symbol)).toEqual(['Dm', 'G', 'C']);
    expect(popState.reharmonizedChords[0].symbol).toBe('Dm7');
    expect(rnbState.reharmonizedChords[0].symbol).toBe('Dm9');
    // At spiceLevel 3 in Jazz/R&B, V->I or passing chords introduce rich substitutions
    expect(jazzState.reharmonizedChords.some((c) => c.symbol.includes('Db') || c.symbol.includes('13') || c.symbol.includes('b9'))).toBe(true);
  });

  it('injects smooth passing chords at Spice Level 2 and 3 for 1 - 6 - 2 - 5 (C - Am - Dm - G)', () => {
    const state = buildProgressionState('C - Am - Dm - G', 'rnb-neosoul', 2, 'C');
    expect(state.reharmonizedChords.length).toBeGreaterThan(state.originalChords.length);
    const passing = state.reharmonizedChords.filter((c) => c.functionRole !== 'primary');
    expect(passing.length).toBeGreaterThanOrEqual(1);
  });
});
