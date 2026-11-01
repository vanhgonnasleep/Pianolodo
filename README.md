# 🎹 Pianolodo • Studio Cockpit AI Piano Voicing & Harmonic Workbench

> **Pianolodo** is a modern, studio-grade piano harmony coach, reharmonization engine, and ergonomic voice-leading workbench. Engineered for composers, music producers, songwriters, and self-taught pianists seeking seamless chord transitions, intelligent 2-5-1 cadence generation, and zero-mental-load visual auditioning.

[![Vitest](https://img.shields.io/badge/Vitest-34%20passed-10b981?style=for-the-badge&logo=vitest&logoColor=white)](https://github.com/vanhgonnasleep/Pianolodo)
[![React 19](https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind%20CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Web Audio API](https://img.shields.io/badge/Web%20Audio-Tone.js-F59E0B?style=for-the-badge&logo=tone&logoColor=white)](https://tonejs.github.io)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

---

## 🌐 Live Web Demo & Zero-Setup Access

Experience Pianolodo live online without running any local servers or installing dependencies:

* **Official Live URL (GitHub Pages):** [https://vanhgonnasleep.github.io/Pianolodo/](https://vanhgonnasleep.github.io/Pianolodo/)
* **1-Click Free Domain Deploy (Vercel):**  
  [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvanhgonnasleep%2FPianolodo)

### ⚡ Run Locally Without `npm run dev` (1-Click Launch)
If you already have the repository on your computer and want to run it instantly without keeping a terminal dev server open:
1. **Windows 1-Click:** Double-click [`start-pianolodo.bat`](./start-pianolodo.bat) in the root folder. It serves the optimized production build and immediately opens your browser at `http://localhost:4173`.
2. **Terminal Production Command:** Run `npm start` or `npm run preview`.

---

## 🌟 Key Architecture & Capabilities

### 1. 🪄 Interactive Chord Token List & 2-5-1 Cadence Workbench
- **Granular Tokenization:** Deconstructs any progression input into ordered, individually manageable chord tokens (`#1 C`, `#2 Am`, `#3 Dm`, `#4 G`), with single-click removal (`✕`) and inline token additions (`+`).
- **Target-Aware Cadence Resolution:** Select any token in the progression to act as the harmonic resolution target.
- **Automated Cadence Calculations:**
  - **Minor Secondary 2-5-1:** Targets minor chords (e.g., target `Am` $\rightarrow$ produces `Bm7b5 ➔ E7 ➔ Am` $[ii^{\varnothing} - V^7 - i]$).
  - **Standard Major 2-5-1:** Targets major chords (e.g., target `C` $\rightarrow$ produces `Dm7 ➔ G7 ➔ C` $[ii^7 - V^7 - I]$).
  - **Tritone Substitution (Sub 2-5):** Introduces chromatic half-step bass descent (`Dm7 ➔ Db7 ➔ C` or `Bm7b5 ➔ Bb7 ➔ Am`).
  - **Backdoor Cadence:** Borrowed from the parallel minor (`Fm7 ➔ Bb7 ➔ C` $[iv^7 - \flat VII^7 - I]$) for lush resolution.
  - **Chromatic Passing Diminished:** Leading-tone diminished 7th approach (e.g., `G#dim7 ➔ Am`).
  - **Turnaround Loops:** Classic `1 - 6 - 2 - 5` and Asian Ballad `2 - 6 - 5 - 1` progressions for cyclical turnaround endings.
- **Non-Destructive Actions:**
  - *Insert Before [Target]*
  - *Replace [Target]*
  - *Append to End*
  - *1-Click Audition Playback*
  - *Instant Undo Engine:* Revert modifications immediately without losing previous input states.

### 2. ✨ AI 5-Style Progression Suggester
- **Universal Input Parsing:** Supports Roman numeral degree notation (`1 - 6 - 2 - 5`, `4 - 5 - 3 - 6`, `2 - 5 - 1`) as well as concrete chord symbols (`C - Am - Dm - G`, `Fmaj7 - Em7 - Dm7 - C`).
- **5 Autonomous Stylistic Reharmonizations:**
  1. **Romantic Pop Ballad:** Elegant 9th extensions (`maj9`, `m9`) with gentle scalar bass motion (`V/7`).
  2. **Warm R&B / Neo-Soul:** Rootless voicings with rich 11th and 13th color tones and tight secondary dominant anchors.
  3. **Sophisticated Jazz & Bossa Nova:** Half-step chromatic glide via Tritone Substitutions ($\flat II^7$) and altered upper structures.
  4. **Cinematic & Melancholic:** Parallel modal interchange borrowing subdominant minor colors ($\flat VI$, $\flat VII$, $iv^7$).
  5. **Altered Neo-Soul Tension ($7^{\sharp 9}$):** Artful harmonic friction that resolves gracefully into the tonic.
- **Audio-Visual Auditioning:** Hover preview strips with single-click chord progression preview and 1-click global application.

### 3. ⚡ Zero-Latency Mini-Piano Hover Preview & Audio Scrubbing
- **Instant Subsequent Tooltips (Emil Kowalski Design Discipline):**
  - *Initial Hover:* 120ms gentle warmup debounce prevents flickering during fast cursor transit.
  - *Subsequent Switches:* Transitions immediately (0ms delay) between adjacent chords for fluid exploration.
- **Embedded SVG Keyboard Popover:** Renders an accurate 2-to-3 octave piano diagram displaying left-hand (Amber) and right-hand (Cobalt) fingerings with note labels.
- **Multi-Chord Cadence Preview Strips:** Visualizes entire progressions side-by-side with directional flow indicators.
- **Audio Scrubbing Mode (<kbd>H</kbd>):** Toggle audio preview on hover to immediately audition voicings without clicking.

### 4. 🎼 Ergonomic Voice-Leading Engine & Ghost Voicing
- **Dual-Register Hand Separation:**
  - **Left Hand (Bass):** Roots, fifths, and tenths with wide register spacing to eliminate muddiness caused by the **Low-Interval Limit (LIL)**.
  - **Right Hand (Voicing):** Guide tones (3rd & 7th) combined with rich extensions (9th, 11th, 13th) focused strictly within the comfortable listening register ($C_3$ to $C_5$).
- **Minimal Finger Movement Optimization:** Evaluates chord inversions to minimize total voice movement distance across voice transitions ($\le 2$ semitones), calculating an accurate **Smoothness Score (%)**.
- **Ghost Voicing on 88-Key Piano:** Semi-transparent pulsing ghost keys project preview voicings onto the primary 88-key piano canvas without disturbing the currently active chord.
- **Voice-Leading Vector Arcs:** Dynamic SVG Bezier curves connect source and destination pitches across the top rail of the piano keyboard to reveal melodic movement.

### 5. 🌉 Interactive Bridge Chords (`[+]`)
- Click the **`[+]`** connector between any two chords on the timeline to explore 4 transition families:
  - *Passing Bass (Slash Chords & Inversions)*
  - *Secondary Dominants ($V/ii$, $V/V$, $V/vi$)*
  - *Chromatic Passing Diminished 7ths*
  - *Tritone Substitutions*

### 6. 🎧 Real-time Focus Music & Binaural Soundscapes
- Built with the Web Audio API and Tone.js to provide an uninterrupted deep practice state:
  - **10Hz Alpha Waves:** Binaural beats configured to stimulate relaxed focus and deep learning.
  - **Lofi Tape Warmth:** Synthesized pink noise with wow/flutter tape modulation.
  - **Warm Vinyl Rain:** Algorithmic rain textures layered with organic vinyl surface noise.

### 7. 🎨 Warm Ivory & Studio Paper Aesthetic
- Styled around tactile recording studio manuscripts: Warm Ivory background (`#FAF8F5`), crisp Studio Paper panels (`#FFFFFF`), warm borders (`#E5DFD7`), Amber accent accents (`#D97706`), and Deep Cobalt accents (`#2563EB`).
- Full bilingual localization: **English 🇬🇧** & **Vietnamese 🇻🇳**.
- Ergonomic keyboard shortcuts:
  - <kbd>Space</kbd>: Play / Stop progression playback
  - <kbd>←</kbd> / <kbd>→</kbd>: Step through individual chords
  - <kbd>H</kbd>: Toggle instant hover audio scrubbing
  - <kbd>1-Click Copy</kbd>: Export formatted voicings directly to clipboard

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- **Node.js:** v18.0.0 or higher
- **Modern Browser:** Chrome, Chromium Edge, Safari, or Firefox with Web Audio API and Web MIDI API support.

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/vanhgonnasleep/Pianolodo.git
cd Pianolodo

# 2. Install dependencies
npm install

# 3. Start the local Vite development server
npm run dev

# 4. Run automated test suites
npm test

# 5. Build optimized production bundle
npm run build
```

---

## 🏛️ Project Directory Structure

```
src/
├── audio/
│   ├── pianoAudioEngine.ts       # Tone.js sampler, synth engine, velocity & groove playback
│   ├── soundscapeGenerators.ts   # Real-time Web Audio generators (10Hz Alpha Waves, Lofi Tape, Vinyl)
│   └── webMidiService.ts         # Hardware digital piano integration via Web MIDI API
├── components/
│   ├── ChordCadenceWorkbench.tsx # Interactive chord token manager & 2-5-1 cadence workbench
│   ├── AiProgressionSuggester.tsx # Multi-style AI progression recommendation cards
│   ├── MiniPianoPopover.tsx      # SVG mini piano popover for hover previews & multi-chord strips
│   ├── ClarionSidebar.tsx        # Docked studio navigation sidebar
│   ├── ClarionTopNav.tsx         # Global transport controls (Key, Tempo, Groove, Playback, Loop)
│   ├── ProgressionControlBar.tsx # Studio Cockpit segmented control bar & parameter controls
│   ├── ChordTimeline.tsx         # Interactive chord timeline with [+] bridge chord popovers
│   ├── Piano88Keyboard.tsx       # Full 88-key SVG/CSS piano with ghost voicing & vector arcs
│   ├── NotationAndNotesPanel.tsx # VexFlow dual-clef stave notation & pitch badges
│   ├── ExplanationAndCurriculum.tsx # Plain-language harmonic breakdown & practice recommendations
│   ├── CurriculumView.tsx        # Practical 8-Vibe chord voicing curriculum
│   ├── PresetsView.tsx           # Curated library of iconic progressions (Pop, R&B, Jazz, Soul)
│   └── FocusMusicView.tsx        # Synthesized background soundscape studio
├── engine/
│   ├── cadenceGenerator.ts       # 2-5-1, Tritone Sub, Backdoor & token replacement logic
│   ├── progressionParser.ts      # Roman numeral degree & chord symbol parsing engine
│   ├── reharmonizer.ts           # Core harmonic colorization & Spice Level matrix
│   ├── progressionSuggester.ts   # 5-Style AI progression recommendation engine
│   ├── voiceLeadingSolver.ts     # Minimal voice movement & inversion optimization solver
│   └── bridgeSuggester.ts        # Passing bass & secondary dominant transition generator
├── hooks/
│   └── useHoverPreview.ts        # Emil Kowalski instant subsequent tooltip & scrub controller
├── i18n/
│   └── translations.ts           # Dual-language dictionary (English & Vietnamese)
└── types/
    └── harmony.ts                # TypeScript domain models and music theory interfaces
```

---

## 🧪 Quality & Verification Suite

The repository maintains an automated Vitest test suite ensuring zero regressions across all core music theory and UI interaction modules:

```bash
✓ src/__tests__/curriculum.test.ts (3 tests)
✓ src/__tests__/i18n.test.ts (5 tests)
✓ src/__tests__/progressionParser.test.ts (4 tests)
✓ src/__tests__/reharmonizer.test.ts (2 tests)
✓ src/__tests__/voiceLeadingSolver.test.ts (3 tests)
✓ src/__tests__/bridgeSuggester.test.ts (2 tests)
✓ src/__tests__/progressionSuggester.test.ts (3 tests)
✓ src/__tests__/cadenceGenerator.test.ts (5 tests)
✓ src/__tests__/focusSoundscape.test.ts (3 tests)
✓ src/__tests__/App.test.tsx (4 tests)

Test Files: 10 passed (10) | Tests: 34 passed (34)
```

- **`cadenceGenerator.test.ts`**: Verifies major/minor targets, tritone substitutions, backdoor cadences, and token mutations.
- **`progressionParser.test.ts`**: Verifies Roman numeral conversions (`1 - 6 - 2 - 5`, `bVII`, `IV/5`) and root key detection.
- **`voiceLeadingSolver.test.ts`**: Validates inversion distance optimization and smoothness scoring heuristics.
- **`reharmonizer.test.ts`**: Asserts correct harmonic extension assignment across Spice Levels 1 through 3.
- **`App.test.tsx`**: Validates end-to-end user interactions, tab switching, workbench insertion, and playback triggers.

---

## 🛠️ Technology Stack

| Category | Technologies |
| :--- | :--- |
| **Framework & Core** | [React 19](https://react.dev/), [TypeScript 5.7](https://www.typescriptlang.org/), [Vite 7](https://vitejs.dev/) |
| **Styling & Motion** | [Tailwind CSS v4](https://tailwindcss.com/), CSS Custom Properties, Cubic-Bezier Spring Primitives |
| **Music Theory & Audio** | [@tonaljs/tonal](https://github.com/tonaljs/tonal), [Tone.js](https://tonejs.github.io/), Web Audio API, Web MIDI API |
| **Sheet Music Engraving** | [VexFlow 5](https://www.vexflow.com/) |
| **Icons & Visuals** | [Lucide React](https://lucide.dev/) |
| **Testing** | [Vitest](https://vitest.dev/), [@testing-library/react](https://testing-library.com/) |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).  
Crafted with passion for music theory, human-centered UI design, and artificial intelligence.
