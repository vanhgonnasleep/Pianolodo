import { describe, it, expect } from 'vitest';
import {
  FOCUS_PROFILES,
  generateFocusMusicPrompt,
  getFocusProfileById,
} from '../audio/focusSoundscapeEngine';

describe('Focus Music Architect & Neuroacoustic Soundscape Engine', () => {
  it('provides the 4 core cognitive flow profiles calibrated by BPM and noise textures', () => {
    expect(FOCUS_PROFILES).toHaveLength(4);
    const coding = getFocusProfileById('deep-coding');
    expect(coding.targetBpm).toBe(78);
    expect(coding.noiseType).toBe('vinyl');

    const analytical = getFocusProfileById('analytical-felt');
    expect(analytical.targetBpm).toBe(65);

    const sprint = getFocusProfileById('chillsynth-sprint');
    expect(sprint.targetBpm).toBe(95);

    const reset = getFocusProfileById('alpha-reset');
    expect(reset.hasAlphaWave).toBe(true);
  });

  it('generates production-grade AI music prompts strictly enforcing the Zero-Vocal Guard', () => {
    const promptData = generateFocusMusicPrompt(
      'deep-coding',
      'C',
      'Dm9 - G13 - Cmaj9',
      'en'
    );

    // Enforces Zero-Vocal Guard
    expect(promptData.positivePrompt.toLowerCase()).toContain('[instrumental]');
    expect(promptData.positivePrompt.toLowerCase()).toContain('no vocals');
    expect(promptData.negativePrompt.toLowerCase()).toContain('no vocals');
    expect(promptData.negativePrompt.toLowerCase()).toContain('no singing');
    expect(promptData.negativePrompt.toLowerCase()).toContain('strictly instrumental');

    // Injects active chord progression and key
    expect(promptData.positivePrompt).toContain('Dm9 - G13 - Cmaj9');
    expect(promptData.positivePrompt).toContain('C');
  });

  it('supports Vietnamese output for prompt explanations and soundscape controls', () => {
    const promptDataVi = generateFocusMusicPrompt(
      'deep-coding',
      'C',
      'Dm9 - G13 - Cmaj9',
      'vi'
    );
    expect(promptDataVi.genreTitle).toContain('Lo-Fi');
    expect(promptDataVi.workflowTipVi.length).toBeGreaterThan(20);
  });
});
