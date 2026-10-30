import { describe, it, expect } from 'vitest';
import {
  splitInputTokens,
  joinInputTokens,
  applyCadenceAction,
  generateCadenceOptions,
} from '../engine/cadenceGenerator';

describe('Cadence Generator & Token Actions', () => {
  it('tokenizes and joins degree and chord progressions cleanly', () => {
    expect(splitInputTokens('1 - 6 - 4 - 5')).toEqual(['1', '6', '4', '5']);
    expect(splitInputTokens('C, Am, Dm, G')).toEqual(['C', 'Am', 'Dm', 'G']);
    expect(splitInputTokens('Dm7 -> G7 -> Cmaj7')).toEqual(['Dm7', 'G7', 'Cmaj7']);
    expect(joinInputTokens(['C', 'Am', 'F', 'G'])).toBe('C - Am - F - G');
  });

  it('correctly applies insert-before, replace-target, append, and replace-all actions', () => {
    const tokens = ['C', 'Am', 'F', 'G'];

    // 1. Insert Before target 'Am' (index 1)
    const insertedBefore = applyCadenceAction(tokens, 1, 'Bm7b5 - E7', 'insert-before');
    expect(insertedBefore).toBe('C - Bm7b5 - E7 - Am - F - G');

    // 2. Replace Target 'G' (index 3) with 'Dm7 - G7'
    const replaced = applyCadenceAction(tokens, 3, 'Dm7 - G7', 'replace-target');
    expect(replaced).toBe('C - Am - F - Dm7 - G7');

    // 3. Append to end
    const appended = applyCadenceAction(tokens, 0, '1 - 6 - 2 - 5', 'append');
    expect(appended).toBe('C - Am - F - G - 1 - 6 - 2 - 5');

    // 4. Replace all
    const replacedAll = applyCadenceAction(tokens, 0, '2 - 5 - 1', 'replace-all');
    expect(replacedAll).toBe('2 - 5 - 1');
  });

  it('generates rich 2-5-1 and cadence options for degree input (e.g. 1 - 6 - 4 - 5)', () => {
    const options = generateCadenceOptions('1 - 6 - 4 - 5', 3, 'C');
    expect(options.length).toBeGreaterThanOrEqual(4);

    const has25 = options.some((o) => o.category === 'target-251');
    const hasTritone = options.some((o) => o.category === 'tritone-sub');
    const hasTurnaround = options.some((o) => o.category === 'turnaround');

    expect(has25).toBe(true);
    expect(hasTritone).toBe(true);
    expect(hasTurnaround).toBe(true);

    // Verify preview chords exist
    expect(options[0].previewChords.length).toBeGreaterThan(0);
    expect(options[0].previewChords[0].leftHand.length).toBeGreaterThan(0);
  });

  it('generates secondary 2-5 options specifically tailored to target minor chords (e.g. Am)', () => {
    const options = generateCadenceOptions('C - Am - F - G', 1, 'C'); // Target index 1 is 'Am'
    expect(options.length).toBeGreaterThanOrEqual(4);

    const secondary25 = options.find((o) => o.category === 'target-251');
    expect(secondary25).toBeDefined();
    // For Am (minor), ii is Bm7b5 and V is E7
    expect(secondary25?.insertedFormula).toContain('Bm7b5');
    expect(secondary25?.insertedFormula).toContain('E7');
  });

  it('generates backdoor cadence for major target chords (e.g. C)', () => {
    const options = generateCadenceOptions('C - Am - F - G', 0, 'C'); // Target index 0 is 'C'
    const backdoor = options.find((o) => o.category === 'backdoor');
    expect(backdoor).toBeDefined();
    // For C major, iv7 is Fm7 and bVII7 is Bb7
    expect(backdoor?.insertedFormula).toContain('Fm7');
    expect(backdoor?.insertedFormula).toContain('Bb7');
  });
});
