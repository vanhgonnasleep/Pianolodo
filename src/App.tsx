import React, { useState, useMemo, useEffect, useCallback, Suspense, lazy } from 'react';
import {
  BridgeCandidate,
  GroovePatternId,
  Language,
  PresetProgression,
  ProgressionOption,
  SpiceLevel,
  VibeId,
  VoicingTopology,
} from './types/harmony';
import { buildProgressionState } from './engine/reharmonizer';
import { insertBridgeChordAt } from './engine/bridgeSuggester';
import { transposeKeyRoot } from './engine/progressionParser';
import { generateProgressionOptions } from './engine/progressionSuggester';
import { InstrumentToneType, pianoAudioEngine } from './audio/pianoAudioEngine';
import { initWebMidi } from './audio/webMidiService';
import { VIBE_PROFILES } from './data/curriculum';
import { t } from './i18n/translations';
import { ClarionSidebar, NavTabId } from './components/ClarionSidebar';
import { ClarionTopNav } from './components/ClarionTopNav';
import { ProgressionControlBar } from './components/ProgressionControlBar';
import { ChordTimeline } from './components/ChordTimeline';
import { Piano88Keyboard } from './components/Piano88Keyboard';
import { NotationAndNotesPanel } from './components/NotationAndNotesPanel';
import { ExplanationAndCurriculum } from './components/ExplanationAndCurriculum';
import { FocusMusicModal } from './components/FocusMusicModal';
import { SongChordAnalyzerModal } from './components/SongChordAnalyzerModal';
import { useHoverPreview } from './hooks/useHoverPreview';
import { useQwertyPiano } from './hooks/useQwertyPiano';
import { downloadMidiFile } from './engine/midiExporter';
import { serializeStudioStateToUrl, parseStudioStateFromUrl } from './engine/urlStateSync';
import { Check } from 'lucide-react';
import { Note } from '@tonaljs/tonal';

// Code-split Lazy Secondary Views for Optimized Bundle Size
const CurriculumView = lazy(() => import('./components/CurriculumView'));
const PresetsView = lazy(() => import('./components/PresetsView'));
const FocusMusicView = lazy(() => import('./components/FocusMusicView'));
const MidiSettingsView = lazy(() => import('./components/MidiSettingsView'));
const PracticeGymView = lazy(() => import('./components/PracticeGymView'));

export const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('vi');
  const [activeTab, setActiveTab] = useState<NavTabId>('studio');
  const [rawInput, setRawInput] = useState<string>('2 - 5 - 1');
  const [keyRoot, setKeyRoot] = useState<string>('C');
  const [vibe, setVibe] = useState<VibeId>('pop-ballad');
  const [spiceLevel, setSpiceLevel] = useState<SpiceLevel>(1);
  const [voicingTopology, setVoicingTopology] = useState<VoicingTopology>('ergonomic-split');
  const [theoryDepth, setTheoryDepth] = useState<'beginner' | 'pro'>('pro');
  const [activeChordIndex, setActiveChordIndex] = useState<number>(0);

  // Midnight Synth Studio Default Theme
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pianolodo_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    }
    return 'dark'; // Midnight Synth Studio as the primary flagship experience
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
      }
      localStorage.setItem('pianolodo_theme', theme);
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleToggleTheoryDepth = () => {
    setTheoryDepth((prev) => (prev === 'beginner' ? 'pro' : 'beginner'));
  };

  // Playback, Groove & Loop State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [playingMode, setPlayingMode] = useState<'original' | 'reharmonized' | null>(null);
  const [groove, setGroove] = useState<GroovePatternId>('ballad-arpeggio');
  const [bpm, setBpm] = useState<number>(85);
  const [instrumentTone, setInstrumentTone] = useState<InstrumentToneType>('grand-piano');
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isCurriculumDrawerOpen, setIsCurriculumDrawerOpen] = useState<boolean>(false);
  const [isFocusModalOpen, setIsFocusModalOpen] = useState<boolean>(false);
  const [isSongAnalyzerOpen, setIsSongAnalyzerOpen] = useState<boolean>(false);

  // QWERTY Computer Keyboard Live Play & Reverse Chord Detector
  const {
    activeMidis: qwertyMidis,
    detectedChord,
  } = useQwertyPiano({ enabled: true });

  // Hover Preview & Live Audition State
  const {
    previewState,
    hoverScrubEnabled,
    startHover,
    endHover,
    setAuditionPreview,
    toggleHoverScrub,
  } = useHoverPreview();

  // Read URL query parameters on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const parsed = parseStudioStateFromUrl(new URLSearchParams(window.location.search));
      if (parsed.key) setKeyRoot(parsed.key);
      if (parsed.input) setRawInput(parsed.input);
      if (parsed.vibe) setVibe(parsed.vibe);
      if (parsed.spice) setSpiceLevel(parsed.spice);
      if (parsed.bpm) setBpm(parsed.bpm);
      if (parsed.groove) setGroove(parsed.groove);
      if (parsed.voicing) setVoicingTopology(parsed.voicing);
    }
  }, []);

  // Computed Progression State
  const [customState, setCustomState] = useState<ReturnType<typeof buildProgressionState> | null>(null);

  const progressionState = useMemo(() => {
    if (
      customState &&
      customState.rawInput === rawInput &&
      customState.vibe === vibe &&
      customState.spiceLevel === spiceLevel &&
      customState.keyRoot === keyRoot &&
      customState.voicingTopology === voicingTopology
    ) {
      return customState;
    }
    return buildProgressionState(rawInput, vibe, spiceLevel, keyRoot, voicingTopology);
  }, [rawInput, vibe, spiceLevel, keyRoot, voicingTopology, customState]);

  useEffect(() => {
    if (progressionState.keyRoot && progressionState.keyRoot !== keyRoot) {
      setKeyRoot(progressionState.keyRoot);
    }
  }, [progressionState.keyRoot, keyRoot]);

  useEffect(() => {
    if (activeChordIndex >= progressionState.reharmonizedChords.length) {
      setActiveChordIndex(Math.max(0, progressionState.reharmonizedChords.length - 1));
    }
  }, [activeChordIndex, progressionState.reharmonizedChords.length]);

  useEffect(() => {
    initWebMidi(
      (noteMidi) => {
        pianoAudioEngine.playNote(Note.fromMidi(noteMidi), '4n');
      },
      () => {}
    );
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleInputChange = (val: string) => {
    setCustomState(null);
    setRawInput(val);
  };

  const handleKeyChange = (newKey: string) => {
    setCustomState(null);
    setKeyRoot(newKey);
  };

  const handleTranspose = (semitones: number) => {
    setCustomState(null);
    const newKey = transposeKeyRoot(keyRoot, semitones);
    setKeyRoot(newKey);
  };

  const handleVibeChange = (newVibe: VibeId) => {
    setCustomState(null);
    setVibe(newVibe);
    setGroove(VIBE_PROFILES[newVibe].defaultGroove);
  };

  const handleSpiceChange = (newSpice: SpiceLevel) => {
    setCustomState(null);
    setSpiceLevel(newSpice);
  };

  const handleVoicingTopologyChange = (newTopology: VoicingTopology) => {
    setCustomState(null);
    setVoicingTopology(newTopology);
  };

  const handleSelectPreset = (preset: PresetProgression) => {
    setCustomState(null);
    setRawInput(preset.degreeInput);
    setKeyRoot(preset.defaultKey);
    setVibe(preset.defaultVibe);
    setGroove(VIBE_PROFILES[preset.defaultVibe].defaultGroove);
    setActiveChordIndex(0);
  };

  const progressionOptions = useMemo(() => {
    return generateProgressionOptions(rawInput, keyRoot);
  }, [rawInput, keyRoot]);

  const handleSelectProgressionOption = (opt: ProgressionOption) => {
    setCustomState(opt.progressionState);
    setRawInput(opt.formula);
    setVibe(opt.vibe);
    setSpiceLevel(opt.spiceLevel);
    setActiveChordIndex(0);
  };

  const handleInstrumentChange = (tone: InstrumentToneType) => {
    setInstrumentTone(tone);
    pianoAudioEngine.setInstrumentTone(tone);
  };

  const handlePlayOriginal = useCallback(() => {
    if (progressionState.originalChords.length === 0) return;
    setIsPlaying(true);
    setPlayingMode('original');

    pianoAudioEngine.playProgression(
      progressionState.originalChords,
      groove,
      bpm,
      (idx) => {
        setPlayingIndex(idx);
        setActiveChordIndex(idx);
      },
      () => {
        setIsPlaying(false);
        setPlayingIndex(null);
        setPlayingMode(null);
      },
      isLooping
    );
  }, [progressionState.originalChords, groove, bpm, isLooping]);

  const handlePlayReharmonized = useCallback(() => {
    if (progressionState.reharmonizedChords.length === 0) return;
    setIsPlaying(true);
    setPlayingMode('reharmonized');

    pianoAudioEngine.playProgression(
      progressionState.reharmonizedChords,
      groove,
      bpm,
      (idx) => {
        setPlayingIndex(idx);
        setActiveChordIndex(idx);
      },
      () => {
        setIsPlaying(false);
        setPlayingIndex(null);
        setPlayingMode(null);
      },
      isLooping
    );
  }, [progressionState.reharmonizedChords, groove, bpm, isLooping]);

  const handleStop = useCallback(() => {
    pianoAudioEngine.stopPlayback();
    setIsPlaying(false);
    setPlayingIndex(null);
    setPlayingMode(null);
  }, []);

  const handleSelectChord = (idx: number) => {
    setActiveChordIndex(idx);
    const chord = progressionState.reharmonizedChords[idx];
    if (chord) {
      pianoAudioEngine.playVoicedChord(chord, 'block');
    }
  };

  const handleInsertBridge = (indexAfter: number, candidate: BridgeCandidate) => {
    const updated = insertBridgeChordAt(progressionState, indexAfter, candidate);
    setCustomState(updated);
  };

  const handleExportMidi = () => {
    const filename = `pianolodo-${keyRoot}-${rawInput.replace(/[^a-zA-Z0-9]/g, '_')}.mid`;
    downloadMidiFile(progressionState.reharmonizedChords, bpm, filename);
    showToast(t('exportedMidiToast', lang));
  };

  const handleShareUrl = () => {
    const url = serializeStudioStateToUrl({
      key: keyRoot,
      input: rawInput,
      vibe,
      spice: spiceLevel,
      bpm,
      groove,
      voicing: voicingTopology,
    });
    navigator.clipboard.writeText(url);
    showToast(t('sharedUrlToast', lang));
  };

  const handleAppendDetectedChord = (chordSymbol: string) => {
    const nextInput = rawInput.trim() ? `${rawInput.trim()} - ${chordSymbol}` : chordSymbol;
    handleInputChange(nextInput);
  };

  // Keyboard Shortcuts (Space: Play/Stop, ArrowLeft/Right: Step chords, H: Scrub)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (isPlaying) {
          handleStop();
        } else {
          handlePlayReharmonized();
        }
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setActiveChordIndex((prev) => {
          const next = Math.max(0, prev - 1);
          const ch = progressionState.reharmonizedChords[next];
          if (ch) pianoAudioEngine.playVoicedChord(ch, 'block');
          return next;
        });
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setActiveChordIndex((prev) => {
          const next = Math.min(progressionState.reharmonizedChords.length - 1, prev + 1);
          const ch = progressionState.reharmonizedChords[next];
          if (ch) pianoAudioEngine.playVoicedChord(ch, 'block');
          return next;
        });
      } else if (e.code === 'KeyH') {
        e.preventDefault();
        toggleHoverScrub();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, handleStop, handlePlayReharmonized, progressionState.reharmonizedChords, toggleHoverScrub]);

  const activeChord = progressionState.reharmonizedChords[activeChordIndex] || null;
  const progressionChordsStr = progressionState.reharmonizedChords.map((c) => c.symbol).join(' - ');

  // Compute average voice-leading smoothness score
  const avgSmoothness = useMemo(() => {
    const chords = progressionState.reharmonizedChords;
    if (chords.length <= 1) return 100;
    const scores = chords.slice(1).map((c) => c.voiceLeading?.smoothnessScore ?? 85);
    const sum = scores.reduce((a, b) => a + b, 0);
    return Math.round(sum / scores.length);
  }, [progressionState.reharmonizedChords]);

  const handleApplySongAccompaniment = (formula: string, newKey: string, newVibe: VibeId) => {
    setRawInput(formula);
    setKeyRoot(newKey);
    setVibe(newVibe);
    setToastMessage(
      lang === 'vi'
        ? `Đã nạp chuỗi hợp âm ${formula} (Tone ${newKey}) lên Studio!`
        : `Loaded progression ${formula} (Key ${newKey}) into Studio!`
    );
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="min-h-screen relative bg-[#FAF8F5] dark:bg-[#16192E] dark:bg-[linear-gradient(145deg,#16192E_0%,#1C203B_50%,#231E3D_100%)] text-[#1C1917] dark:text-[#F8FAFC] flex font-sans selection:bg-[#FDE68A] selection:text-[#78350F] dark:selection:bg-[#F59E0B] dark:selection:text-[#09090B] transition-colors overflow-x-hidden">
      {/* 3 Luminous Ambient Mesh Gradient Orbs (Non-intrusive backdrop) */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        {/* Top-Left Aurora Orb: Violet/Lavender */}
        <div
          className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] rounded-full blur-[110px] opacity-70 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.28) 0%, transparent 65%)',
          }}
        />
        {/* Top-Right Aurora Orb: Cyan/Sky */}
        <div
          className="absolute -top-[10%] -right-[10%] w-[50vw] h-[50vw] rounded-full blur-[110px] opacity-70 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.22) 0%, transparent 65%)',
          }}
        />
        {/* Bottom-Center Warm Orb: Amber/Champagne */}
        <div
          className="absolute -bottom-[20%] left-[25%] w-[60vw] h-[60vw] rounded-full blur-[130px] opacity-60 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(251, 191, 36, 0.18) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* 1. Left Clarion Docked Sidebar */}
      <div className="relative z-10 flex-shrink-0">
        <ClarionSidebar
          currentTab={activeTab}
          onSelectTab={setActiveTab}
          lang={lang}
          onToggleLang={setLang}
          activeProgressionSummary={{
            rawInput,
            keyRoot,
            chordCount: progressionState.reharmonizedChords.length,
            avgSmoothness,
          }}
          onOpenSongAnalyzer={() => setIsSongAnalyzerOpen(true)}
        />
      </div>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto relative z-10">
        {/* Clarion Top Nav */}
        <ClarionTopNav
          keyRoot={keyRoot}
          onTranspose={handleTranspose}
          instrumentTone={instrumentTone}
          onInstrumentChange={handleInstrumentChange}
          isPlaying={isPlaying}
          playingMode={playingMode}
          onPlayOriginal={handlePlayOriginal}
          onPlayReharmonized={handlePlayReharmonized}
          onStop={handleStop}
          groove={groove}
          onGrooveChange={setGroove}
          bpm={bpm}
          onBpmChange={setBpm}
          isLooping={isLooping}
          onToggleLoop={() => setIsLooping((prev) => !prev)}
          lang={lang}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          theoryDepth={theoryDepth}
          onToggleTheoryDepth={handleToggleTheoryDepth}
          onExportMidi={handleExportMidi}
          onShareUrl={handleShareUrl}
          onOpenSongAnalyzer={() => setIsSongAnalyzerOpen(true)}
        />

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 bg-[#1C1917] dark:bg-[#1C203B] text-white dark:text-[#F8FAFC] px-4 py-2.5 rounded-xl shadow-lg border border-[#E5DFD7] dark:border-white/15 text-xs font-bold flex items-center gap-2 animate-bounce glow-amber">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Tab Content Router */}
        <main className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* TAB 1: STUDIO */}
          {activeTab === 'studio' && (
            <div className="space-y-5">
              {/* Progression Control & Harmonic Workbench */}
              <ProgressionControlBar
                rawInput={rawInput}
                onInputChange={handleInputChange}
                keyRoot={keyRoot}
                onKeyChange={handleKeyChange}
                onTranspose={handleTranspose}
                vibe={vibe}
                onVibeChange={handleVibeChange}
                spiceLevel={spiceLevel}
                onSpiceChange={handleSpiceChange}
                voicingTopology={voicingTopology}
                onVoicingTopologyChange={handleVoicingTopologyChange}
                instrumentTone={instrumentTone}
                onInstrumentChange={handleInstrumentChange}
                onSelectPreset={handleSelectPreset}
                onOpenCurriculum={() => setIsCurriculumDrawerOpen(true)}
                onOpenFocusMusic={() => setIsFocusModalOpen(true)}
                onOpenSongAnalyzer={() => setIsSongAnalyzerOpen(true)}
                avgSmoothness={avgSmoothness}
                lang={lang}
                onToggleLang={setLang}
                progressionOptions={progressionOptions}
                onSelectProgressionOption={handleSelectProgressionOption}
                onHoverChord={startHover}
                onLeaveHover={endHover}
                onAuditionChord={setAuditionPreview}
                hoverScrubEnabled={hoverScrubEnabled}
                onToggleHoverScrub={toggleHoverScrub}
                detectedChord={detectedChord}
                onAppendDetectedChord={handleAppendDetectedChord}
              />

              {/* Interactive Chord Timeline with Live Hover Preview */}
              <ChordTimeline
                originalChords={progressionState.originalChords}
                reharmonizedChords={progressionState.reharmonizedChords}
                activeChordIndex={activeChordIndex}
                onSelectChord={handleSelectChord}
                isPlaying={isPlaying}
                playingIndex={playingIndex}
                playingMode={playingMode}
                onPlayOriginal={handlePlayOriginal}
                onPlayReharmonized={handlePlayReharmonized}
                onStop={handleStop}
                groove={groove}
                onGrooveChange={setGroove}
                bpm={bpm}
                onBpmChange={setBpm}
                onInsertBridge={handleInsertBridge}
                keyRoot={keyRoot}
                vibe={vibe}
                lang={lang}
                onHoverChord={startHover}
                onLeaveHover={endHover}
              />

              {/* 88-Key Split-Hand Piano Keyboard with Ghost Voicing, 3D tactile keys & Live QWERTY highlights */}
              <Piano88Keyboard
                activeChord={activeChord}
                previewChord={previewState?.chord}
                previewSource={previewState?.source}
                liveMidis={qwertyMidis}
                lang={lang}
              />

              {/* Notation & Literal Notes Panel */}
              <NotationAndNotesPanel activeChord={activeChord} lang={lang} />

              {/* Plain-Vietnamese / English Explanations & Curriculum Drawer */}
              <ExplanationAndCurriculum
                activeChord={activeChord}
                isCurriculumOpen={isCurriculumDrawerOpen}
                onCloseCurriculum={() => setIsCurriculumDrawerOpen(false)}
                onSelectProgressionFormula={(formula) => handleInputChange(formula)}
                lang={lang}
              />
            </div>
          )}

          {/* TAB 2: PRACTICE GYM & EAR TRAINING */}
          {activeTab === 'practice' && (
            <Suspense fallback={<div className="p-12 text-center text-sm text-[#78716C] dark:text-[#A8A29E]">Loading Practice Gym...</div>}>
              <PracticeGymView
                chords={progressionState.reharmonizedChords}
                keyRoot={keyRoot}
                lang={lang}
              />
            </Suspense>
          )}

          {/* TAB 3: CURRICULUM */}
          {activeTab === 'curriculum' && (
            <Suspense fallback={<div className="p-12 text-center text-sm text-[#78716C] dark:text-[#A8A29E]">Loading Curriculum...</div>}>
              <CurriculumView
                lang={lang}
                onSelectFormula={(formula) => {
                  handleInputChange(formula);
                  setActiveTab('studio');
                }}
              />
            </Suspense>
          )}

          {/* TAB 4: FOCUS MUSIC */}
          {activeTab === 'focus' && (
            <Suspense fallback={<div className="p-12 text-center text-sm text-[#78716C] dark:text-[#A8A29E]">Loading Focus Music...</div>}>
              <FocusMusicView
                keyRoot={keyRoot}
                progressionChordsStr={progressionChordsStr}
                lang={lang}
              />
            </Suspense>
          )}

          {/* TAB 5: PRESETS */}
          {activeTab === 'presets' && (
            <Suspense fallback={<div className="p-12 text-center text-sm text-[#78716C] dark:text-[#A8A29E]">Loading Presets...</div>}>
              <PresetsView
                lang={lang}
                onSelectPreset={(preset) => {
                  handleSelectPreset(preset);
                  setActiveTab('studio');
                }}
                activeRawInput={rawInput}
              />
            </Suspense>
          )}

          {/* TAB 6: MIDI & SOUND */}
          {activeTab === 'midi' && (
            <Suspense fallback={<div className="p-12 text-center text-sm text-[#78716C] dark:text-[#A8A29E]">Loading MIDI Settings...</div>}>
              <MidiSettingsView
                instrumentTone={instrumentTone}
                onInstrumentChange={handleInstrumentChange}
                lang={lang}
              />
            </Suspense>
          )}
        </main>

        {/* Modal: Focus Music Architect Modal */}
        <FocusMusicModal
          isOpen={isFocusModalOpen}
          onClose={() => setIsFocusModalOpen(false)}
          keyRoot={keyRoot}
          progressionChordsStr={progressionChordsStr}
          lang={lang}
        />

        {/* Modal: Audio & Melody Song Analyzer Modal */}
        <SongChordAnalyzerModal
          isOpen={isSongAnalyzerOpen}
          onClose={() => setIsSongAnalyzerOpen(false)}
          onApplyProgression={handleApplySongAccompaniment}
          lang={lang}
        />

        {/* Executive Footer */}
        <footer className="mt-auto py-5 px-6 md:px-8 border-t border-[#E5DFD7] dark:border-white/10 bg-[#F7F4EE]/90 dark:bg-[#15192C]/80 backdrop-blur-md text-xs text-[#78716C] dark:text-[#CBD5E1] flex flex-wrap items-center justify-between gap-4 transition-colors">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981] pulse-dot shadow-[0_0_8px_#10B981]" />
            <span className="dark:text-[#F8FAFC]">{t('footerLeft', lang)}</span>
          </div>
          <div className="text-[11px] text-[#A8A29E] dark:text-[#9494A8] font-mono">
            {t('footerRight', lang)}
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
