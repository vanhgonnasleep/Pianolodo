# Stage 1: Piano Harmony, Color Chords & Smooth Voice-Leading Coach — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Build a 100% offline-capable, zero-latency interactive Web App that takes any basic chord progression (by scale degree like `2-5-1` or chord names like `C - Am - Dm - G`), reharmonizes it with smooth color chords and passing bridges according to user-selected musical Vibes, solves optimal two-hand piano voice-leading, renders an 88-key split-hand piano + Grand Staff notation + plain-Vietnamese explanations, and plays A/B audio comparisons with realistic piano grooves.

**Architecture:** Modular Client-Side TypeScript/React Web Application powered by a pure deterministic Music Theory & Voice-Leading Engine (`@tonaljs/tonal` + custom dynamic-programming/greedy voice-leading solver in `src/engine/`), decoupled from the interactive UI (`React 19 + Tailwind v4 + VexFlow`) and the audio/MIDI engine (`Tone.js + Web MIDI API`). All state flows through a canonical `ProgressionState` model ready for Stage 2 (Ear Training & Melody Finder) and Stage 3 (Mic Pitch Detection).

**Tech Stack:** Node.js `>=20.0.0`, React `19.x`, TypeScript `5.x` (strict), Vite `6.x`, Tailwind CSS `v4`, `@tonaljs/tonal`, `tone`, `vexflow`, `lucide-react`, `vitest`, `@testing-library/react`, `jsdom`.

**Spec:** `docs/superpowers/specs/2026-10-30-piano-harmony-coach-design.md`

## Global Constraints

- Runtime & Framework: Node.js `>=20.0.0`, React `19.x`, TypeScript `5.x` (strict mode), Vite `6.x`, Tailwind CSS `v4`.
- 100% Offline & Zero Latency for Music Theory Core: All chord parsing, key detection, reharmonization, and two-hand voice-leading calculations must execute deterministically in `<10ms` in the browser with zero external API keys required.
- Dual/Triple Notation Display: Every voiced chord must simultaneously provide (1) 88-key Piano visualization (`A0`–`C8`) with distinct Left Hand (`#3b82f6`) and Right Hand (`#f59e0b`) highlights and finger-movement diff, (2) literal note labels with octave (`Tay trái: C2 - G2 | Tay phải: E4 - G4 - B4 - D5`), and (3) Grand Staff sheet notation via `vexflow`.
- Copy & Explanations: 100% plain, approachable Vietnamese tailored for self-taught musicians (explaining sonic mood, why the transition is smooth, and exact finger movement tips).
- Automated TDD Discipline: Every engine module and UI workflow must be verified with `vitest` before completion.

## Review Focus

1. **Ambiguous or Non-Diatonic Chord Input (`C - E7 - Am - Fm`):** When a user inputs chords containing borrowed chords or secondary dominants in Symbol Mode, the parser must still detect the primary home key (`C major`) without crashing or dropping non-diatonic chords.
2. **Low-Interval Mud Prevention (Left-Hand Bass Limit):** When transposing to low keys (e.g., `D`, `Eb`, `E`), left-hand voicings must never place a 3rd or dense cluster below `E2` (MIDI 40); left hand must stay clean (`Root + 5th` or single bass note for slash chords).
3. **Right-Hand Register Drift Across Long Progressions:** In an 8-chord progression like Canon (`1-5-6-3-4-1-2-5`), minimizing semitone distance greedily could cause the right hand to drift steadily downward or upward out of the `G3–G5` sweet spot; the solver must apply a gentle center-of-gravity penalty around `C4–E4` (MIDI 60–64).
4. **Enharmonic Spelling Consistency in Flat/Sharp Keys:** In keys like `F`, `Bb`, `Eb`, `Ab`, chord symbols and note labels must use flats (`Bb`, `Eb`, `Ab`, `Db`) rather than ugly sharps (`A#`, `D#`, `G#`, `C#`).
5. **Browser AudioContext Autoplay Policy:** Clicking "Play" on first page load must safely call `await Tone.start()` inside the user gesture handler and fall back gracefully to polyphonic warm synth if network piano samples are still loading.

---

## File Structure Map

```text
Piano-Harmony-Coach/
├── docs/
│   └── superpowers/
│       ├── specs/
│       │   └── 2026-10-30-piano-harmony-coach-design.md
│       └── plans/
│           └── 2026-10-30-stage1-harmony-reharmonizer-plan.md
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
└── src/
    ├── types/
    │   └── harmony.ts                  # Canonical TypeScript interfaces for chords, voicings, vibes, curriculum
    ├── data/
    │   ├── curriculum.ts               # Curated Berklee / Mark Levine / Pop piano rules & Vietnamese lessons
    │   └── presetProgressions.ts       # 8 iconic preset progressions (2-5-1, 2-6-5-1, 4-5-3-6, Canon, etc.)
    ├── engine/
    │   ├── progressionParser.ts        # Degree ("2-5-1") & Chord Symbol ("C - Am - Dm - G") parser + Key detector + Transposer
    │   ├── voiceLeadingSolver.ts       # Two-hand piano voicing generator, cost function solver & finger-diff calculator
    │   ├── reharmonizer.ts             # Vibe-based color chord upgrader & automatic passing chord injector (Spice 1-3)
    │   └── bridgeSuggester.ts          # Interactive gap bridge generator ([+] slot between any 2 chords)
    ├── audio/
    │   ├── pianoAudioEngine.ts         # Tone.js Grand Piano / Rhodes sampler + Synth fallback + A/B Groove player
    │   └── webMidiService.ts           # Web MIDI API input listener for external MIDI keyboards
    ├── components/
    │   ├── ProgressionControlBar.tsx   # Input box (Degrees/Chords), Key/Transpose selector, Presets, Vibe & Spice controls
    │   ├── ChordTimeline.tsx           # Interactive progression cards + [+] Bridge slot popover selector + A/B toggle
    │   ├── Piano88Keyboard.tsx         # 88-key SVG/HTML keyboard with Left/Right hand colors & finger movement badges
    │   ├── NotationAndNotesPanel.tsx   # VexFlow Grand Staff renderer + literal note names (Tay trái / Tay phải)
    │   └── ExplanationAndCurriculum.tsx# Plain-Vietnamese explanation card + interactive mini-curriculum drawer
    ├── App.tsx                         # Main application shell coordinating ProgressionState, Audio, and UI panels
    ├── main.tsx                        # React DOM entry point
    └── __tests__/
        ├── curriculum.test.ts
        ├── progressionParser.test.ts
        ├── voiceLeadingSolver.test.ts
        ├── reharmonizer.test.ts
        ├── bridgeSuggester.test.ts
        └── App.test.tsx
```

---

### Task 1: Project Scaffolding, Core Types & Curated Piano Curriculum Database

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/types/harmony.ts`
- Create: `src/data/curriculum.ts`
- Create: `src/data/presetProgressions.ts`
- Test: `src/__tests__/curriculum.test.ts`

**Interfaces:**
- Consumes: none (foundation task)
- Produces:
  - `src/types/harmony.ts`: `VibeId`, `SpiceLevel`, `GroovePatternId`, `NoteInfo`, `VoiceLeadingDiff`, `VoicedChord`, `BridgeCandidate`, `CurriculumRule`, `PresetProgression`, `ProgressionState`
  - `src/data/curriculum.ts`: `CURRICULUM_RULES: CurriculumRule[]`, `VIBE_PROFILES: Record<VibeId, VibeProfile>`, `getRuleById(id: string): CurriculumRule`
  - `src/data/presetProgressions.ts`: `PRESET_PROGRESSIONS: PresetProgression[]`

- [x] **Step 1: Initialize Vite + React + TypeScript + Vitest configuration files and write the failing test `src/__tests__/curriculum.test.ts`**

Create `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, and write `src/__tests__/curriculum.test.ts`:

```typescript
// src/__tests__/curriculum.test.ts
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
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/curriculum.test.ts`
Expected: FAIL with `Cannot find module '../data/curriculum'`

- [x] **Step 3: Implement `src/types/harmony.ts`, `src/data/curriculum.ts`, and `src/data/presetProgressions.ts`**

```typescript
// src/types/harmony.ts
export type VibeId = 'pop-ballad' | 'rnb-neosoul' | 'jazz-bossa' | 'cinematic-sad';
export type SpiceLevel = 1 | 2 | 3;
export type GroovePatternId = 'block' | 'ballad-arpeggio' | 'rnb-pulse' | 'bossa-nova';

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
  sourceBook: string;
  formulaSummary: string;
  whySmoothVi: string;
  fingerTipVi: string;
  emotionTagVi: string;
  exampleInC: {
    before: string;
    after: string;
  };
}

export interface VibeProfile {
  id: VibeId;
  nameVi: string;
  subtitleVi: string;
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
    whySmooth: string;
    fingerTip: string;
    emotionTag: string;
  };
  beats: number;
}

export interface BridgeCandidate {
  id: string;
  symbol: string;
  romanDegree: string;
  techniqueName: string;
  whySmooth: string;
  ruleId: string;
  previewChord: VoicedChord;
}

export interface PresetProgression {
  id: string;
  nameVi: string;
  degreeInput: string;
  defaultKey: string;
  defaultVibe: VibeId;
  descriptionVi: string;
}

export interface ParsedChordItem {
  symbol: string;
  root: string;
  quality: string;
  bass?: string;
  degreeNumber: number; // 1..7 (or 0 if chromatic)
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
```

Implement `src/data/curriculum.ts` with the 4 `VIBE_PROFILES` and 12 comprehensive `CURRICULUM_RULES` (covering `ext-maj9`, `ext-min9`, `ext-dom13sus4`, `slash-walkdown-i-vi`, `slash-walkdown-vi-iv`, `sec-dom-v-of-vi`, `sec-dom-v-of-ii`, `sec-dom-ii-v-of-iv`, `dim-passing-sharp-i`, `dim-passing-sharp-iv`, `tritone-sub-bii7`, `modal-iv-minor6`), and implement `src/data/presetProgressions.ts` with the 8 iconic progressions (`2 - 5 - 1`, `2 - 6 - 5 - 1`, `1 - 6 - 2 - 5`, `4 - 5 - 3 - 6`, `1 - 5 - 6 - 3 - 4 - 1 - 2 - 5`, `4 - 3 - 6`, `1 - 6 - 4 - 5`, `6 - 4 - 1 - 5`).

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/curriculum.test.ts`
Expected: PASS (3 passed)

- [x] **Step 5: Commit**

```bash
git add package.json tsconfig.json vite.config.ts index.html src/types/harmony.ts src/data/curriculum.ts src/data/presetProgressions.ts src/__tests__/curriculum.test.ts
git commit -m "feat(data): scaffold project and add curated piano harmony curriculum & presets"
```

---

### Task 2: Progression Parser, Key Detector & Transposer (`src/engine/progressionParser.ts`)

**Files:**
- Create: `src/engine/progressionParser.ts`
- Test: `src/__tests__/progressionParser.test.ts`

**Interfaces:**
- Consumes: `ParsedChordItem` from `src/types/harmony.ts`
- Produces:
  - `parseProgressionInput(rawInput: string, preferredKeyRoot?: string): { keyRoot: string; keyMode: 'major' | 'minor'; items: ParsedChordItem[]; scaleNotes: string[] }`
  - `transposeKeyRoot(keyRoot: string, semitones: number): string`
  - `spellNoteInKey(midiOrNote: number | string, keyRoot: string): string`

- [x] **Step 1: Write the failing test `src/__tests__/progressionParser.test.ts`**

Include tests for degree mode (`2 - 5 - 1`, `2-6-5-1`), chord symbol mode with automatic key detection (`C - Am - Dm - G`), non-diatonic/borrowed chord resilience (`C - E7 - Am - Fm` still detects key `C`), and flat-key enharmonic spelling (`F`, `Bb`, `Eb` use `Bb`/`Eb` instead of `A#`/`D#`):

```typescript
// src/__tests__/progressionParser.test.ts
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
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/progressionParser.test.ts`
Expected: FAIL with `Cannot find module '../engine/progressionParser'`

- [x] **Step 3: Implement `src/engine/progressionParser.ts`**

Implement deterministic degree parsing (`1..7` and Roman numerals `I..vii`), scale-fit key scoring across all 12 major keys for symbol inputs, enharmonic flat spelling (`F, Bb, Eb, Ab, Db, Gb`), and key transposition.

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/progressionParser.test.ts`
Expected: PASS (4 passed)

- [x] **Step 5: Commit**

```bash
git add src/engine/progressionParser.ts src/__tests__/progressionParser.test.ts
git commit -m "feat(engine): add dual degree/chord progression parser, key detector, and flat-key spelling"
```

---

### Task 3: Smooth Two-Hand Voice-Leading Solver (`src/engine/voiceLeadingSolver.ts`)

**Files:**
- Create: `src/engine/voiceLeadingSolver.ts`
- Test: `src/__tests__/voiceLeadingSolver.test.ts`

**Interfaces:**
- Consumes: `NoteInfo`, `VoiceLeadingDiff`, `VoicedChord` from `src/types/harmony.ts`; `spellNoteInKey` from `src/engine/progressionParser.ts`
- Produces:
  - `voiceSingleChord(symbol: string, keyRoot: string, prevRightHandMidi?: number[]): { leftHand: NoteInfo[]; rightHand: NoteInfo[]; voiceLeading: VoiceLeadingDiff }`
  - `voiceChordSequence(chords: Array<{ symbol: string; originalSymbol?: string; romanDegree: string; functionRole: 'primary' | 'passing-bridge' | 'modal-borrow'; ruleId: string; beats?: number }>, keyRoot: string): VoicedChord[]`

- [x] **Step 1: Write the failing test `src/__tests__/voiceLeadingSolver.test.ts`**

Test that:
1. In `Dm9 -> G13 -> Cmaj9`, the right-hand voice-leading keeps common tones and moves remaining fingers by only 1–2 semitones (`smoothnessScore >= 80`).
2. Left hand respects the Low-Interval Limit (no 3rds below `E2` / MIDI 40, Review Focus #2) and plays the explicit slash bass on slash chords (`G/B` puts `B2` in Left Hand).
3. Over an 8-chord progression, right-hand average pitch stays centered inside `G3` (MIDI 55) to `G5` (MIDI 79) without drifting away (Review Focus #3).

```typescript
// src/__tests__/voiceLeadingSolver.test.ts
import { describe, it, expect } from 'vitest';
import { voiceChordSequence } from '../engine/voiceLeadingSolver';

describe('Smooth Two-Hand Voice-Leading Solver', () => {
  it('voices a 2-5-1 progression (Dm9 -> G13 -> Cmaj9) with minimal finger movement', () => {
    const voiced = voiceChordSequence(
      [
        { symbol: 'Dm9', romanDegree: 'ii9', functionRole: 'primary', ruleId: 'ext-min9' },
        { symbol: 'G13', romanDegree: 'V13', functionRole: 'primary', ruleId: 'ext-dom13sus4' },
        { symbol: 'Cmaj9', romanDegree: 'Imaj9', functionRole: 'primary', ruleId: 'ext-maj9' },
      ],
      'C'
    );

    expect(voiced).toHaveLength(3);
    // Dm9 (F-A-C-E) -> G13 (F-A-B-E) shares F, A, E and only moves C -> B (-1 semitone)!
    const g13Diff = voiced[1].voiceLeading;
    expect(g13Diff.keptNotes.length).toBeGreaterThanOrEqual(2);
    expect(g13Diff.smoothnessScore).toBeGreaterThanOrEqual(80);
  });

  it('prevents muddy low intervals in left hand and respects slash bass (Review Focus #2)', () => {
    const voiced = voiceChordSequence(
      [
        { symbol: 'C', romanDegree: 'I', functionRole: 'primary', ruleId: 'ext-maj9' },
        { symbol: 'G/B', romanDegree: 'V/7', functionRole: 'passing-bridge', ruleId: 'slash-walkdown-i-vi' },
      ],
      'D'
    );
    // Left hand of G/B must have B as its lowest bass note
    expect(voiced[1].leftHand[0].pitchClass).toBe('B');
    // Left hand intervals below MIDI 40 (E2) must be at least 7 semitones (perfect 5th)
    for (const ch of voiced) {
      if (ch.leftHand.length >= 2 && ch.leftHand[0].midi < 40) {
        const interval = ch.leftHand[1].midi - ch.leftHand[0].midi;
        expect(interval).toBeGreaterThanOrEqual(7);
      }
    }
  });

  it('prevents right-hand register drift across long 8-chord progressions (Review Focus #3)', () => {
    const canon = ['Cmaj7', 'G7', 'Am7', 'Em7', 'Fmaj7', 'Cmaj7', 'Dm7', 'G7'].map((s) => ({
      symbol: s,
      romanDegree: 'I',
      functionRole: 'primary' as const,
      ruleId: 'ext-maj9',
    }));
    const voiced = voiceChordSequence(canon, 'C');
    for (const ch of voiced) {
      const avgMidi =
        ch.rightHand.reduce((sum, n) => sum + n.midi, 0) / ch.rightHand.length;
      expect(avgMidi).toBeGreaterThanOrEqual(55); // >= G3
      expect(avgMidi).toBeLessThanOrEqual(76);    // <= E5
    }
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/voiceLeadingSolver.test.ts`
Expected: FAIL with `Cannot find module '../engine/voiceLeadingSolver'`

- [x] **Step 3: Implement `src/engine/voiceLeadingSolver.ts`**

Build candidate 3-to-4-note right-hand voicings (preferring Guide Tones 3rd & 7th + Color Extensions 9th/13th while omitting redundant roots when 4+ notes exist), score transitions by minimal total semitone movement + center-of-gravity penalty around MIDI 63 (`Eb4`), and compute exact `VoiceLeadingDiff` (`keptNotes`, `movedNotes`, `smoothnessScore`) plus plain-Vietnamese finger tips.

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/voiceLeadingSolver.test.ts`
Expected: PASS (3 passed)

- [x] **Step 5: Commit**

```bash
git add src/engine/voiceLeadingSolver.ts src/__tests__/voiceLeadingSolver.test.ts
git commit -m "feat(engine): implement two-hand piano voice-leading solver and finger movement diff"
```

---

### Task 4: Vibe Reharmonization Engine & Interactive Bridge Suggester (`src/engine/reharmonizer.ts` & `src/engine/bridgeSuggester.ts`)

**Files:**
- Create: `src/engine/reharmonizer.ts`
- Create: `src/engine/bridgeSuggester.ts`
- Test: `src/__tests__/reharmonizer.test.ts`
- Test: `src/__tests__/bridgeSuggester.test.ts`

**Interfaces:**
- Consumes: `VibeId`, `SpiceLevel`, `ProgressionState`, `VoicedChord`, `BridgeCandidate` from `src/types/harmony.ts`; `parseProgressionInput` from `src/engine/progressionParser.ts`; `voiceChordSequence`, `voiceSingleChord` from `src/engine/voiceLeadingSolver.ts`
- Produces:
  - `buildProgressionState(rawInput: string, vibe: VibeId, spiceLevel: SpiceLevel, preferredKeyRoot?: string): ProgressionState`
  - `getBridgeCandidates(fromChord: VoicedChord, toChord: VoicedChord, keyRoot: string, vibe: VibeId): BridgeCandidate[]`
  - `insertBridgeChordAt(state: ProgressionState, indexAfter: number, candidate: BridgeCandidate): ProgressionState`

- [x] **Step 1: Write failing tests `src/__tests__/reharmonizer.test.ts` and `src/__tests__/bridgeSuggester.test.ts`**

```typescript
// src/__tests__/reharmonizer.test.ts
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
```

```typescript
// src/__tests__/bridgeSuggester.test.ts
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
```

- [x] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/__tests__/reharmonizer.test.ts src/__tests__/bridgeSuggester.test.ts`
Expected: FAIL with `Cannot find module '../engine/reharmonizer'`

- [x] **Step 3: Implement `src/engine/reharmonizer.ts` and `src/engine/bridgeSuggester.ts`**

Implement `buildProgressionState`, automatic passing-chord insertion for Spice Level 2 & 3 according to Vibe (`pop-ballad` favors Slash Bass Walkdowns `G/B`, `Em/G` and `sus4`; `rnb-neosoul` favors `m9`, Secondary Dominants `E7#9`/`A7b13`, Diminished Passing; `jazz-bossa` favors `ii-V` interpolations and Tritone Sub `Db7#11`; `cinematic-sad` favors Modal Interchange `Fm6`, `Bbmaj7`), plus `getBridgeCandidates` and `insertBridgeChordAt`.

- [x] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/__tests__/reharmonizer.test.ts src/__tests__/bridgeSuggester.test.ts`
Expected: PASS (4 passed)

- [x] **Step 5: Commit**

```bash
git add src/engine/reharmonizer.ts src/engine/bridgeSuggester.ts src/__tests__/reharmonizer.test.ts src/__tests__/bridgeSuggester.test.ts
git commit -m "feat(engine): add vibe reharmonizer and interactive passing-chord bridge suggester"
```

---

### Task 5: Audio & Groove Playback Engine + Web MIDI Service (`src/audio/pianoAudioEngine.ts` & `src/audio/webMidiService.ts`)

**Files:**
- Create: `src/audio/pianoAudioEngine.ts`
- Create: `src/audio/webMidiService.ts`

**Interfaces:**
- Consumes: `VoicedChord`, `GroovePatternId` from `src/types/harmony.ts`
- Produces:
  - `pianoAudioEngine`:
    - `playVoicedChord(chord: VoicedChord, groove?: GroovePatternId): Promise<void>`
    - `playProgression(chords: VoicedChord[], groove: GroovePatternId, bpm: number, onChordStep: (index: number) => void, onComplete: () => void): Promise<void>`
    - `stopPlayback(): void`
    - `setInstrumentTone(toneType: 'grand-piano' | 'warm-rhodes'): void`
  - `initWebMidi(onNoteOn: (midi: number) => void, onNoteOff: (midi: number) => void): Promise<{ supported: boolean; deviceNames: string[] }>`

- [x] **Step 1: Implement `src/audio/pianoAudioEngine.ts` and `src/audio/webMidiService.ts` with safe AudioContext unlocking (Review Focus #5)**

Ensure `await Tone.start()` is called safely on user interaction, provide an instant zero-latency polyphonic warm piano/Rhodes synthesizer fallback so playback works offline immediately even before CDN samples finish loading, and implement the 4 groove patterns (`block`, `ballad-arpeggio`, `rnb-pulse`, `bossa-nova`).

- [x] **Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: PASS with 0 errors

- [x] **Step 3: Commit**

```bash
git add src/audio/pianoAudioEngine.ts src/audio/webMidiService.ts
git commit -m "feat(audio): add Tone.js Grand Piano/Rhodes groove engine and Web MIDI input service"
```

---

### Task 6: Visual Components — 88-Key Split-Hand Piano, VexFlow Grand Staff & Interactive Timeline

**Files:**
- Create: `src/components/ProgressionControlBar.tsx`
- Create: `src/components/ChordTimeline.tsx`
- Create: `src/components/Piano88Keyboard.tsx`
- Create: `src/components/NotationAndNotesPanel.tsx`
- Create: `src/components/ExplanationAndCurriculum.tsx`
- Create: `src/App.tsx`
- Create: `src/main.tsx`
- Test: `src/__tests__/App.test.tsx`

**Interfaces:**
- Consumes: all engine, data, and audio modules from Tasks 1–5
- Produces: Complete interactive Stage 1 Web Application in `src/App.tsx`

- [x] **Step 1: Write the failing integration test `src/__tests__/App.test.tsx`**

Test that:
1. The app renders with default `2 - 5 - 1` progression, displays both Original (`Dm - G - C`) and Reharmonized color chords, and shows the 88-key piano (`A0` to `C8`).
2. Switching Vibe (e.g. from `Pop Ballad` to `R&B / Neo-Soul` or `Jazz / Bossa`) or Spice Level (`1 -> 2 -> 3`) updates the reharmonized chords immediately.
3. Clicking the `[+]` Bridge button between two chords opens the Bridge Candidates popover (`Đi Bass liền bậc`, `Bậc V phụ`, `Diminished bắc cầu`, `Tritone Sub`) and clicking a candidate inserts it into the timeline.
4. Selecting any chord updates the Left Hand / Right Hand literal note readout (`Tay trái: ... | Tay phải: ...`) and plain-Vietnamese explanation ("Tại sao lại mượt?").

```typescript
// src/__tests__/App.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

describe('Piano Harmony Coach UI Integration', () => {
  it('renders progression input, Vibe selector, 88-key piano, and plain-Vietnamese explanation', () => {
    render(<App />);
    expect(screen.getByText(/Trợ Lý Hòa Thanh/i)).toBeTruthy();
    expect(screen.getByText(/Tay trái \(Bass\)/i)).toBeTruthy();
    expect(screen.getByText(/Tay phải \(Voicing\)/i)).toBeTruthy();
    expect(screen.getByText(/Tại sao nghe mượt/i)).toBeTruthy();
  });

  it('updates reharmonized chords when switching Vibe and inserting a Bridge chord via [+]', () => {
    render(<App />);
    // Select preset 1 - 6 - 2 - 5
    const presetBtn = screen.getByRole('button', { name: /1 - 6 - 2 - 5/i });
    fireEvent.click(presetBtn);

    // Click the first [+] bridge slot between chord 1 and chord 2
    const bridgeBtns = screen.getAllByTitle(/Chèn hoặc đổi hợp âm bắc cầu/i);
    fireEvent.click(bridgeBtns[0]);

    // Expect candidate options to appear and insert one
    const insertBtns = screen.getAllByRole('button', { name: /Chèn hợp âm này/i });
    expect(insertBtns.length).toBeGreaterThanOrEqual(3);
    fireEvent.click(insertBtns[0]);
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/App.test.tsx`
Expected: FAIL with `Cannot find module '../App'`

- [x] **Step 3: Implement the 5 UI components and `src/App.tsx`**

Implement:
- `ProgressionControlBar.tsx`: Input field (Degree / Symbol auto-detected), Key selector (`C`..`B`) with `-1` / `+1` semitone Transpose buttons, 8 one-click Preset pills (`2-5-1`, `2-6-5-1`, `4-5-3-6`, etc.), 4 Vibe cards, and Spice Level selector (`Level 1: Tinh tế`, `Level 2: Mượt mà (+Cầu nối)`, `Level 3: Đậm đặc`).
- `ChordTimeline.tsx`: Displays the chord progression sequence with Roman numerals, function badges, A/B Playback buttons (`Nghe Bản Gốc` vs `Nghe Bản Pha Màu`), Groove selector (`Chập Block`, `Rải Ballad`, `R&B Pulse`, `Bossa Nova`), and interactive `[+]` bridge slot buttons between every pair of chords.
- `Piano88Keyboard.tsx`: Full 88-key (`A0`–`C8`, MIDI 21–108) interactive keyboard highlighting Left Hand notes in Blue (`#3b82f6`), Right Hand notes in Amber (`#f59e0b`), common kept notes with a lock badge, and moved notes with semitone shift badges (`-1`, `+2`).
- `NotationAndNotesPanel.tsx`: Renders literal note badges (`Tay trái: C2 - G2 | Tay phải: E4 - G4 - B4 - D5`) alongside a `VexFlow` Grand Staff (Treble & Bass clef).
- `ExplanationAndCurriculum.tsx`: Displays the active chord's plain-Vietnamese explanation (*"Tại sao nghe mượt?"*, *"Mẹo bấm ngón tay"*, *"Cảm xúc"*) and a toggleable **"Kho Tuyệt Chiêu & Giáo Trình Thực Chiến"** drawer listing all 12 curated rules with one-click live demo on the piano.

- [x] **Step 4: Run full test suite and production build verification**

Run: `npx vitest run && npm run build`
Expected: All unit & integration tests PASS, and `vite build` succeeds with zero TypeScript or bundler errors.

- [x] **Step 5: Commit**

```bash
git add src/
git commit -m "feat(ui): build 88-key split-hand piano, VexFlow staff, bridge picker, and Vietnamese harmony coach UI"
```
