import { describe, it, expect } from 'vitest';
import { t, I18N_DICTIONARY } from '../i18n/translations';
import { VIBE_PROFILES, CURRICULUM_RULES } from '../data/curriculum';
import { PRESET_PROGRESSIONS } from '../data/presetProgressions';

describe('Bilingual i18n Translation & Localization', () => {
  it('translates core UI keys in both Vietnamese and English', () => {
    expect(t('appTitle', 'vi')).toContain('Trợ Lý Hòa Thanh');
    expect(t('appTitle', 'en')).toContain('Piano Harmony Coach');

    expect(t('leftHand', 'vi')).toBe('Tay trái (Bass)');
    expect(t('leftHand', 'en')).toBe('Left Hand (Bass)');

    expect(t('rightHand', 'vi')).toBe('Tay phải (Voicing)');
    expect(t('rightHand', 'en')).toBe('Right Hand (Voicing)');

    expect(t('whySmooth', 'vi')).toContain('Tại sao nghe mượt');
    expect(t('whySmooth', 'en')).toContain('Why It Sounds Smooth');
  });

  it('guarantees complete translation dictionary parity without missing keys', () => {
    const viKeys = Object.keys(I18N_DICTIONARY.vi);
    const enKeys = Object.keys(I18N_DICTIONARY.en);
    expect(viKeys.sort()).toEqual(enKeys.sort());
  });

  it('provides bilingual metadata for all 4 Vibes', () => {
    for (const vibe of Object.values(VIBE_PROFILES)) {
      expect(vibe.nameVi.length).toBeGreaterThan(3);
      expect(vibe.nameEn.length).toBeGreaterThan(3);
      expect(vibe.subtitleVi.length).toBeGreaterThan(10);
      expect(vibe.subtitleEn.length).toBeGreaterThan(10);
    }
  });

  it('provides bilingual lessons for all 12 curriculum rules', () => {
    for (const rule of CURRICULUM_RULES) {
      expect(rule.titleVi).toBeTruthy();
      expect(rule.titleEn).toBeTruthy();
      expect(rule.whySmoothVi.length).toBeGreaterThan(20);
      expect(rule.whySmoothEn.length).toBeGreaterThan(20);
      expect(rule.fingerTipVi.length).toBeGreaterThan(15);
      expect(rule.fingerTipEn.length).toBeGreaterThan(15);
    }
  });

  it('provides bilingual descriptions for all preset progressions', () => {
    for (const preset of PRESET_PROGRESSIONS) {
      expect(preset.nameVi).toBeTruthy();
      expect(preset.nameEn).toBeTruthy();
      expect(preset.descriptionVi).toBeTruthy();
      expect(preset.descriptionEn).toBeTruthy();
    }
  });
});
