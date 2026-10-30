import { describe, it, expect } from 'vitest';
import { buildProgressionState } from '../engine/reharmonizer';
import { getBridgeCandidates, insertBridgeChordAt } from '../engine/bridgeSuggester';

describe('Interactive Bridge Suggester ([+] Slot)', () => {
  it('returns 3-4 distinct bridge candidates (Slash Bass, Secondary Dominant, Diminished, Tritone) between Cmaj9 and Am7', () => {
    const state = buildProgressionState('1 - 6 - 2 - 5', 'pop-ballad', 1, 'C');
    const cChord = state.reharmonizedChords[0];
    const amChord = state.reharmonizedChords[1];

    const candidates = getBridgeCandidates(cChord, amChord, 'C', 'pop-ballad');
    expect(candidates.length).toBeGreaterThanOrEqual(3);
    const symbols = candidates.map((c) => c.symbol);
    // Between C and Am, should offer G/B (slash walkdown), E7 or E7b9 (V7/vi), and G#dim7
    expect(symbols.some((s) => s.startsWith('G/B') || s.startsWith('Em/B'))).toBe(true);
    expect(symbols.some((s) => s.startsWith('E7'))).toBe(true);
    expect(symbols.some((s) => s.includes('dim7'))).toBe(true);
  });

  it('inserts a chosen bridge candidate into the progression and re-solves smooth voice-leading', () => {
    const state = buildProgressionState('1 - 6 - 2 - 5', 'pop-ballad', 1, 'C');
    const candidates = getBridgeCandidates(
      state.reharmonizedChords[0],
      state.reharmonizedChords[1],
      'C',
      'pop-ballad'
    );
    const updated = insertBridgeChordAt(state, 0, candidates[0]);
    expect(updated.reharmonizedChords.length).toBe(state.reharmonizedChords.length + 1);
    expect(updated.reharmonizedChords[1].symbol).toBe(candidates[0].symbol);
  });
});
