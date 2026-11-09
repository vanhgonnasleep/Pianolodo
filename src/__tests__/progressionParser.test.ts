import { describe, it, expect } from 'vitest';
import {
  parseProgressionInput,
  transposeKeyRoot,
  spellNoteInKey,
} from '../engine/progressionParser';

describe('Progression Parser & Key Detector', () => {
  it('parses numeric degree progressions like 2 - 5 - 1 and 2 - 6 - 5 - 1 in C major', () => {
    const res251 = parseProgressionInput('2 - 5 - 1', 'C');
    expect(res251.keyRoot).toBe('C');
    expect(res251.items.map((i) => i.symbol)).toEqual(['Dm', 'G', 'C']);
    expect(res251.items.map((i) => i.romanDegree)).toEqual(['ii', 'V', 'I']);

    const res2651 = parseProgressionInput('2 - 6 - 5 - 1', 'F');
    expect(res2651.keyRoot).toBe('F');
    expect(res2651.items.map((i) => i.symbol)).toEqual(['Gm', 'Dm', 'C', 'F']);
  });

  it('auto-detects key when given chord symbols directly', () => {
    const res = parseProgressionInput('Fmaj7 - G7 - Em7 - Am7');
    expect(res.keyRoot).toBe('C');
    expect(res.items.map((i) => i.degreeNumber)).toEqual([4, 5, 3, 6]);
  });

  it('handles non-diatonic secondary dominants and borrowed chords without losing home key (Review Focus #1)', () => {
    const res = parseProgressionInput('C - E7 - Am - Fm');
    expect(res.keyRoot).toBe('C');
    expect(res.items.map((i) => i.symbol)).toEqual(['C', 'E7', 'Am', 'Fm']);
  });

  it('spells notes with flats in flat keys like F, Bb, Eb (Review Focus #4)', () => {
    expect(spellNoteInKey('A#4', 'F')).toBe('Bb4');
    expect(spellNoteInKey('D#4', 'Bb')).toBe('Eb4');
    expect(transposeKeyRoot('C', 5)).toBe('F');
    expect(transposeKeyRoot('F', -2)).toBe('Eb');
  });

  it('correctly spells notes in flat chord contexts even when home key is C (Audit Finding B2)', () => {
    // Db7 (bII7 tritone sub in C) has notes Db, F, Ab, Cb/B
    expect(spellNoteInKey(61, 'C', 'Db7')).toBe('Db4');
    expect(spellNoteInKey(68, 'C', 'Fm')).toBe('Ab4');
    expect(spellNoteInKey(70, 'C', 'Bbm')).toBe('Bb4');
  });
});
