import { describe, it, expect } from 'vitest';
import { generateProgressionOptions } from '../engine/progressionSuggester';

describe('AI Progression Options Suggester Engine', () => {
  it('generates multiple diverse reharmonization options for standard progression input', () => {
    const options = generateProgressionOptions('2 - 5 - 1', 'C');

    expect(options.length).toBeGreaterThanOrEqual(4);

    // Option 1: Pop Ballad
    const popOption = options.find((o) => o.vibe === 'pop-ballad');
    expect(popOption).toBeDefined();
    expect(popOption?.chordsSummary).toContain('Dm');
    expect(popOption?.smoothnessScore).toBeGreaterThanOrEqual(80);

    // Option 2: Neo-Soul
    const soulOption = options.find((o) => o.vibe === 'rnb-neosoul');
    expect(soulOption).toBeDefined();
    expect(soulOption?.chordsSummary).toContain('Dm');

    // Option 3: Jazz / Tritone sub
    const jazzOption = options.find((o) => o.vibe === 'jazz-bossa');
    expect(jazzOption).toBeDefined();

    // Option 4: Cinematic
    const cinematicOption = options.find((o) => o.vibe === 'cinematic-sad');
    expect(cinematicOption).toBeDefined();
  });

  it('suggests harmonic completions for incomplete inputs like 1 - 6 or 2 - 5', () => {
    const options = generateProgressionOptions('1 - 6', 'C');
    expect(options.length).toBeGreaterThanOrEqual(4);

    // At least one option should complete the progression (e.g. 1 - 6 - 2 - 5 or 1 - 6 - 4 - 5)
    const hasExtendedProgression = options.some(
      (o) => o.progressionState.reharmonizedChords.length >= 4
    );
    expect(hasExtendedProgression).toBe(true);
  });

  it('each option has valid left/right hand notes and non-empty rationales', () => {
    const options = generateProgressionOptions('C - G - Am - F', 'C');
    expect(options.length).toBeGreaterThanOrEqual(4);

    for (const opt of options) {
      expect(opt.rationaleVi.length).toBeGreaterThan(10);
      expect(opt.rationaleEn.length).toBeGreaterThan(10);
      expect(opt.progressionState.reharmonizedChords.length).toBeGreaterThan(0);

      const firstChord = opt.progressionState.reharmonizedChords[0];
      expect(firstChord.leftHand.length).toBeGreaterThanOrEqual(1);
      expect(firstChord.rightHand.length).toBeGreaterThanOrEqual(1);
    }
  });
});
