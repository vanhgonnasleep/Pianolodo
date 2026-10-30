import * as Tone from 'tone';
import { FocusProfileId, FocusSoundscapeProfile, Language } from '../types/harmony';

export const FOCUS_PROFILES: FocusSoundscapeProfile[] = [
  {
    id: 'deep-coding',
    nameVi: 'Lập Trình Chuyên Sâu (Lo-Fi Chillhop • 78 BPM)',
    nameEn: 'Sustainable Coding Flow (Lo-Fi Chillhop • 78 BPM)',
    targetBpm: 78,
    descriptionVi: 'Hợp âm Rhodes ấm áp, tiếng rè đĩa than vinyl bụi bặm, nhịp boom-bap nảy nhẹ giúp duy trì trạng thái tập trung sâu.',
    descriptionEn: 'Warm Rhodes electric piano, subtle dusty vinyl crackle, gentle swing groove anchoring continuous coding flow.',
    noiseType: 'vinyl',
    hasAlphaWave: false,
  },
  {
    id: 'analytical-felt',
    nameVi: 'Tư Duy Kiến Trúc & Phân Tích (Felt Piano • 65 BPM)',
    nameEn: 'Deep Analytical & Architecture (Felt Piano • 65 BPM)',
    targetBpm: 65,
    descriptionVi: 'Tiếng đàn Felt Piano phủ dạ mộc mạc, không gian âm thanh rộng rãi tĩnh lặng, không có tiếng trống gõ gây xao nhãng.',
    descriptionEn: 'Intimate felt-damped acoustic piano, spacious room reverb, contemplative cyclical arpeggios, zero percussion.',
    noiseType: 'brown',
    hasAlphaWave: false,
  },
  {
    id: 'chillsynth-sprint',
    nameVi: 'Nước Rút & Tốc Độ Cao (Chillsynth • 95 BPM)',
    nameEn: 'High-Velocity Execution & Sprinting (Chillsynth • 95 BPM)',
    targetBpm: 95,
    descriptionVi: 'Chuỗi hợp âm Synth 16th nốt đều đặn, nhịp bass analog 80s thúc đẩy tốc độ hoàn thành task.',
    descriptionEn: 'Hypnotic 16th-note analog arpeggiator, warm driving saw bassline, steady focus groove for sprinting.',
    noiseType: 'drone',
    hasAlphaWave: false,
  },
  {
    id: 'alpha-reset',
    nameVi: 'Thiền Định & Xả Căng Thẳng (Sóng Não Alpha 10Hz + Brown Noise)',
    nameEn: 'Hyper-Distraction Reset (10Hz Alpha Waves + Brown Noise)',
    targetBpm: 60,
    descriptionVi: 'Tiếng ồn Brown Noise trầm ấm kết hợp tần số sóng não Alpha 10Hz (binaural beat) giúp xoa dịu não bộ quá tải.',
    descriptionEn: 'Pure deep Brownian noise combined with 10Hz alpha wave binaural frequency, soothing cognitive fatigue.',
    noiseType: 'brown',
    hasAlphaWave: true,
  },
];

export function getFocusProfileById(id: FocusProfileId): FocusSoundscapeProfile {
  return FOCUS_PROFILES.find((p) => p.id === id) || FOCUS_PROFILES[0];
}

export interface FocusMusicPromptResult {
  profileId: FocusProfileId;
  genreTitle: string;
  positivePrompt: string;
  negativePrompt: string;
  workflowTipVi: string;
  workflowTipEn: string;
}

export function generateFocusMusicPrompt(
  profileId: FocusProfileId,
  keyRoot: string,
  progressionStr: string,
  _lang: Language = 'vi'
): FocusMusicPromptResult {
  const profile = getFocusProfileById(profileId);

  let positivePrompt = '';
  let negativePrompt =
    'vocals, singing, voice, speech, choir, vocal chops, voiceovers, dramatic drops, aggressive leads, harsh highs, heavy distortion, strictly instrumental, no vocals, no singing';

  const baseNegative =
    'no vocals, no singing, no speech, strictly instrumental, no choir, no vocal samples';

  if (profileId === 'deep-coding') {
    positivePrompt = `[Instrumental] Relaxed ${profile.targetBpm} bpm lo-fi hip hop, key of ${keyRoot} major, following chord progression: ${progressionStr}, dusty vinyl crackle, warm rhodes electric piano chords, mellow upright bassline, gentle boom-bap drum groove, subtle tape flutter, cozy rainy evening coffee shop ambiance, study beats, ${baseNegative}, seamless loop`;
  } else if (profileId === 'analytical-felt') {
    positivePrompt = `[Instrumental] Intimate neo-classical minimalist felt piano, key of ${keyRoot} major, playing progression: ${progressionStr}, warm acoustic dampening, gentle expressive cello and string quartet, spacious ambient room reverb, delicate cyclical arpeggios, emotionally grounding, contemplative, no drums, no percussion, ${baseNegative}, ${profile.targetBpm} bpm, seamless loop`;
    negativePrompt += ', drums, percussion, electronic synths, harsh attacks';
  } else if (profileId === 'chillsynth-sprint') {
    positivePrompt = `[Instrumental] Melodic chillsynth, ambient retrowave in ${keyRoot} major, progression: ${progressionStr}, hypnotic 16th-note analog arpeggiator, warm driving saw bassline, clean tape-delayed electric keys, nostalgic synthesizers, steady ${profile.targetBpm} bpm focus groove, programming flow state, ${baseNegative}, seamless loop`;
    negativePrompt += ', aggressive build-ups, EDM drops, screaming leads';
  } else {
    positivePrompt = `[Instrumental] Pure deep brownian noise blended with 10Hz alpha wave binaural frequency, soft key of ${keyRoot} ambient drone playing: ${progressionStr}, soothing rain on window textures, soft warm sub-bass hum, ultra-deep concentration soundscape, steady non-fatiguing mask for cognitive fatigue, zero percussion, ${baseNegative}, seamless loop`;
    negativePrompt += ', rhythm, fast tempo, loud transients, percussion';
  }

  return {
    profileId,
    genreTitle: profile.nameVi,
    positivePrompt,
    negativePrompt,
    workflowTipVi:
      'Tuyệt đối tuân thủ Zero-Vocal Guard: Không chứa bất kỳ âm thanh giọng nói nào để vùng ngôn ngữ não bộ hoàn toàn tự do giải quyết logic bài toán.',
    workflowTipEn:
      'Strict Zero-Vocal Guard enforced: Zero spoken words or vocal chops, allowing cognitive language centers to focus entirely on programming and logic.',
  };
}

class FocusSoundscapeEngine {
  private noiseNode: Tone.Noise | null = null;
  private noiseFilter: Tone.Filter | null = null;
  private droneSynth: Tone.Synth | null = null;
  private alphaLeft: Tone.Oscillator | null = null;
  private alphaRight: Tone.Oscillator | null = null;

  private isRunning = false;
  private activeProfileId: FocusProfileId | null = null;

  public async startSoundscape(profileId: FocusProfileId, keyRoot: string): Promise<void> {
    if (Tone.getContext().state !== 'running') {
      await Tone.start();
    }
    this.stopSoundscape();

    const profile = getFocusProfileById(profileId);
    this.activeProfileId = profileId;

    // 1. Noise Layer (Vinyl / Brown noise)
    const noiseType = profile.noiseType === 'vinyl' ? 'pink' : 'brown';
    this.noiseNode = new Tone.Noise(noiseType);
    this.noiseFilter = new Tone.Filter({
      frequency: profile.noiseType === 'vinyl' ? 1200 : 400,
      type: 'lowpass',
      rolloff: -24,
    });
    this.noiseNode.volume.value = -28;
    this.noiseNode.connect(this.noiseFilter);
    this.noiseFilter.toDestination();
    this.noiseNode.start();

    // 2. Low Drone Pad (Anchors tonic)
    this.droneSynth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: {
        attack: 2,
        decay: 3,
        sustain: 0.8,
        release: 3,
      },
      volume: -24,
    }).toDestination();
    this.droneSynth.triggerAttack(`${keyRoot}2`);

    // 3. Alpha Wave (10Hz Binaural Beat)
    if (profile.hasAlphaWave) {
      this.alphaLeft = new Tone.Oscillator(200, 'sine').toDestination();
      this.alphaRight = new Tone.Oscillator(210, 'sine').toDestination();
      this.alphaLeft.volume.value = -32;
      this.alphaRight.volume.value = -32;
      this.alphaLeft.start();
      this.alphaRight.start();
    }

    this.isRunning = true;
  }

  public stopSoundscape(): void {
    if (this.noiseNode) {
      this.noiseNode.stop();
      this.noiseNode.dispose();
      this.noiseNode = null;
    }
    if (this.noiseFilter) {
      this.noiseFilter.dispose();
      this.noiseFilter = null;
    }
    if (this.droneSynth) {
      this.droneSynth.triggerRelease();
      this.droneSynth.dispose();
      this.droneSynth = null;
    }
    if (this.alphaLeft) {
      this.alphaLeft.stop();
      this.alphaLeft.dispose();
      this.alphaLeft = null;
    }
    if (this.alphaRight) {
      this.alphaRight.stop();
      this.alphaRight.dispose();
      this.alphaRight = null;
    }
    this.isRunning = false;
    this.activeProfileId = null;
  }

  public getStatus() {
    return {
      isRunning: this.isRunning,
      activeProfileId: this.activeProfileId,
    };
  }
}

export const focusSoundscapeEngine = new FocusSoundscapeEngine();
