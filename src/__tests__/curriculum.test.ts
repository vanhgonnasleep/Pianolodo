import { describe, it, expect } from 'vitest';
import { CURRICULUM_RULES, VIBE_PROFILES, getRuleById } from '../data/curriculum';
import { PRESET_PROGRESSIONS } from '../data/presetProgressions';

describe('Curated Piano Curriculum & Preset Progressions', () => {
  it('contains all 4 Vibe profiles with Vietnamese descriptions', () => {
    expect(Object.keys(VIBE_PROFILES)).toEqual([
      'pop-ballad',
      'rnb-neosoul',
      'jazz-bossa',
      'cinematic-sad',
    ]);
    expect(VIBE_PROFILES['pop-ballad'].nameVi).toContain('Pop Ballad');
    expect(VIBE_PROFILES['rnb-neosoul'].nameVi).toContain('R&B');
  });

  it('includes core harmony rules for extensions, slash bass, secondary dominants, tritone sub, and modal interchange', () => {
    const categories = new Set(CURRICULUM_RULES.map((r) => r.category));
    expect(categories.has('extension')).toBe(true);
    expect(categories.has('slash-bass')).toBe(true);
    expect(categories.has('secondary-dominant')).toBe(true);
    expect(categories.has('diminished-passing')).toBe(true);
    expect(categories.has('tritone-sub')).toBe(true);
    expect(categories.has('modal-interchange')).toBe(true);

    const rule = getRuleById('sec-dom-v-of-vi');
    expect(rule.titleVi).toBeTruthy();
    expect(rule.whySmoothVi.length).toBeGreaterThan(20);
  });

  it('provides at least 8 iconic preset progressions including 2-5-1 and 2-6-5-1', () => {
    expect(PRESET_PROGRESSIONS.length).toBeGreaterThanOrEqual(8);
    const degrees = PRESET_PROGRESSIONS.map((p) => p.degreeInput);
    expect(degrees).toContain('2 - 5 - 1');
    expect(degrees).toContain('2 - 6 - 5 - 1');
    expect(degrees).toContain('4 - 5 - 3 - 6');
  });
});
