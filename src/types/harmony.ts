export type VibeId = 'pop-ballad' | 'rnb-neosoul' | 'jazz-bossa' | 'cinematic-sad';
export type SpiceLevel = 1 | 2 | 3;
export type GroovePatternId = 'block' | 'ballad-arpeggio' | 'rnb-pulse' | 'bossa-nova';
export type Language = 'vi' | 'en';

export type RuleCategory =
  | 'extension'
  | 'slash-bass'
  | 'secondary-dominant'
  | 'diminished-passing'
  | 'tritone-sub'
  | 'modal-interchange';

export interface CurriculumRule {
  id: string;
  category: RuleCategory;
  titleVi: string;
  titleEn: string;
  sourceBook: string;
  formulaSummary: string;
  whySmoothVi: string;
  whySmoothEn: string;
  fingerTipVi: string;
  fingerTipEn: string;
  emotionTagVi: string;
  emotionTagEn: string;
  exampleInC: {
    before: string;
    after: string;
  };
}

export interface VibeProfile {
  id: VibeId;
  nameVi: string;
  nameEn: string;
  subtitleVi: string;
  subtitleEn: string;
  preferredMajorI: string;
  preferredMajorIV: string;
  preferredMinorII: string;
  preferredMinorIII: string;
  preferredMinorVI: string;
  preferredDomV: string;
  defaultGroove: GroovePatternId;
}

export interface NoteInfo {
  noteName: string;
  pitchClass: string;
  midi: number;
  hand: 'left' | 'right';
  role: 'root' | 'fifth' | 'seventh' | 'third' | 'extension' | 'guide';
}

export interface VoiceLeadingDiff {
  keptNotes: string[];
  movedNotes: Array<{
    fromNote: string;
    toNote: string;
    semitones: number;
  }>;
  smoothnessScore: number;
}

export interface VoicedChord {
  id: string;
  symbol: string;
  originalSymbol?: string;
  romanDegree: string;
  functionRole: 'primary' | 'passing-bridge' | 'modal-borrow';
  leftHand: NoteInfo[];
  rightHand: NoteInfo[];
  voiceLeading: VoiceLeadingDiff;
  explanation: {
    ruleId: string;
    title: string;
    titleEn: string;
    whySmooth: string;
    whySmoothEn: string;
    fingerTip: string;
    fingerTipEn: string;
    emotionTag: string;
    emotionTagEn: string;
  };
  beats: number;
}

export interface BridgeCandidate {
  id: string;
  symbol: string;
  romanDegree: string;
  techniqueName: string;
  techniqueNameEn: string;
  whySmooth: string;
  whySmoothEn: string;
  ruleId: string;
  previewChord: VoicedChord;
}

export interface PresetProgression {
  id: string;
  nameVi: string;
  nameEn: string;
  degreeInput: string;
  defaultKey: string;
  defaultVibe: VibeId;
  descriptionVi: string;
  descriptionEn: string;
}

export interface ParsedChordItem {
  symbol: string;
  root: string;
  quality: string;
  bass?: string;
  degreeNumber: number; // 1..7 (hoặc 0 nếu chromatic)
  romanDegree: string;
}

export interface ProgressionState {
  keyRoot: string;
  keyMode: 'major' | 'minor';
  rawInput: string;
  vibe: VibeId;
  spiceLevel: SpiceLevel;
  originalChords: VoicedChord[];
  reharmonizedChords: VoicedChord[];
  scaleNotes: string[];
}

export type FocusProfileId =
  | 'deep-coding'
  | 'analytical-felt'
  | 'chillsynth-sprint'
  | 'alpha-reset';

export interface FocusSoundscapeProfile {
  id: FocusProfileId;
  nameVi: string;
  nameEn: string;
  targetBpm: number;
  descriptionVi: string;
  descriptionEn: string;
  noiseType: 'vinyl' | 'brown' | 'rain' | 'drone';
  hasAlphaWave: boolean;
}
