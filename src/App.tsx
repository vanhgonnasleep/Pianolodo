import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  BridgeCandidate,
  GroovePatternId,
  Language,
  PresetProgression,
  ProgressionOption,
  SpiceLevel,
  VibeId,
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
import { CurriculumView } from './components/CurriculumView';
import { PresetsView } from './components/PresetsView';
import { FocusMusicView } from './components/FocusMusicView';
import { MidiSettingsView } from './components/MidiSettingsView';
import { useHoverPreview } from './hooks/useHoverPreview';
import { ShieldCheck, Command } from 'lucide-react';

export const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('vi');
  const [activeTab, setActiveTab] = useState<NavTabId>('studio');
  const [rawInput, setRawInput] = useState<string>('2 - 5 - 1');
  const [keyRoot, setKeyRoot] = useState<string>('C');
  const [vibe, setVibe] = useState<VibeId>('pop-ballad');
  const [spiceLevel, setSpiceLevel] = useState<SpiceLevel>(1);
  const [activeChordIndex, setActiveChordIndex] = useState<number>(0);

  // Playback, Groove & Loop State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [playingMode, setPlayingMode] = useState<'original' | 'reharmonized' | null>(null);
  const [groove, setGroove] = useState<GroovePatternId>('ballad-arpeggio');
  const [bpm, setBpm] = useState<number>(85);
  const [instrumentTone, setInstrumentTone] = useState<InstrumentToneType>('grand-piano');
  const [isLooping, setIsLooping] = useState<boolean>(false);

  // Modals
  const [isCurriculumDrawerOpen, setIsCurriculumDrawerOpen] = useState<boolean>(false);
  const [isFocusModalOpen, setIsFocusModalOpen] = useState<boolean>(false);

  // Hover Preview & Live Audition State
  const {
    previewState,
    hoverScrubEnabled,
    startHover,
    endHover,
    setAuditionPreview,
    toggleHoverScrub,
  } = useHoverPreview();

  // Computed Progression State
  const [customState, setCustomState] = useState<ReturnType<typeof buildProgressionState> | null>(null);

  const progressionState = useMemo(() => {
    if (
      customState &&
      customState.rawInput === rawInput &&
      customState.vibe === vibe &&
      customState.spiceLevel === spiceLevel &&
      customState.keyRoot === keyRoot
    ) {
      return customState;
    }
    return buildProgressionState(rawInput, vibe, spiceLevel, keyRoot);
  }, [rawInput, vibe, spiceLevel, keyRoot, customState]);

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
      (note) => {
        console.log('MIDI Note On:', note);
      },
      (note) => {
        console.log('MIDI Note Off:', note);
      }
    );
  }, []);

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

  // Keyboard Shortcuts (Space: Play/Stop, ArrowLeft/Right: Step chords)
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

  const currentVibeProfile = VIBE_PROFILES[vibe];
  const vibeName = lang === 'vi' ? currentVibeProfile.nameVi : currentVibeProfile.nameEn;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917] flex font-sans selection:bg-[#FDE68A] selection:text-[#78350F]">
      {/* 1. Left Clarion Docked Sidebar */}
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
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
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
        />

        {/* Tab Content Router */}
        <main className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* TAB 1: STUDIO */}
          {activeTab === 'studio' && (
            <div className="space-y-5">
              {/* Compact Editorial Studio Header Strip */}
              <div className="p-3.5 md:p-4 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD7] shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#D97706] font-bold text-sm shadow-xs font-serif">
                    88
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base md:text-lg font-bold text-[#1C1917] tracking-tight font-serif">
                        Pianolodo Studio
                      </h2>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#FAF8F5] text-[#D97706] border border-[#E5DFD7]">
                        Tone {keyRoot}
                      </span>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#FAF8F5] text-[#10B981] border border-[#E5DFD7]">
                        {avgSmoothness}% {lang === 'vi' ? 'Độ mượt' : 'Smoothness'}
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-[#78716C] hidden sm:block">
                      {vibeName} • {progressionState.reharmonizedChords.length} {lang === 'vi' ? 'hợp âm' : 'chords'} • Deterministic Voice-Leading
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="hidden lg:flex items-center gap-1.5 text-xs text-[#78716C] bg-[#FAF8F5] px-3 py-1.5 rounded-xl border border-[#E5DFD7]">
                    <Command className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>
                      <kbd className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#E5DFD7] text-xs">Space</kbd> Play ·{' '}
                      <kbd className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#E5DFD7] text-xs">←</kbd>
                      <kbd className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#E5DFD7] text-xs">→</kbd> Step ·{' '}
                      <kbd className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#E5DFD7] text-xs">H</kbd> Scrub
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-[#FAF8F5] px-3 py-1.5 rounded-xl border border-[#E5DFD7] text-xs font-mono text-[#065F46] font-semibold">
                    <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                    <span>On-Device</span>
                  </div>
                </div>
              </div>

              {/* Progression Control & Unified Harmonic Assistant Workbench */}
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
                instrumentTone={instrumentTone}
                onInstrumentChange={handleInstrumentChange}
                onSelectPreset={handleSelectPreset}
                onOpenCurriculum={() => setIsCurriculumDrawerOpen(true)}
                onOpenFocusMusic={() => setIsFocusModalOpen(true)}
                lang={lang}
                onToggleLang={setLang}
                progressionOptions={progressionOptions}
                onSelectProgressionOption={handleSelectProgressionOption}
                onHoverChord={startHover}
                onLeaveHover={endHover}
                onAuditionChord={setAuditionPreview}
                hoverScrubEnabled={hoverScrubEnabled}
                onToggleHoverScrub={toggleHoverScrub}
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

              {/* 88-Key Split-Hand Piano Keyboard with Ghost Voicing & Voice-Leading Arcs */}
              <Piano88Keyboard
                activeChord={activeChord}
                previewChord={previewState?.chord}
                previewSource={previewState?.source}
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

          {/* TAB 2: CURRICULUM */}
          {activeTab === 'curriculum' && (
            <CurriculumView
              lang={lang}
              onSelectFormula={(formula) => {
                handleInputChange(formula);
                setActiveTab('studio');
              }}
            />
          )}

          {/* TAB 3: FOCUS MUSIC */}
          {activeTab === 'focus' && (
            <FocusMusicView
              keyRoot={keyRoot}
              progressionChordsStr={progressionChordsStr}
              lang={lang}
            />
          )}

          {/* TAB 4: PRESETS */}
          {activeTab === 'presets' && (
            <PresetsView
              lang={lang}
              onSelectPreset={(preset) => {
                handleSelectPreset(preset);
                setActiveTab('studio');
              }}
              activeRawInput={rawInput}
            />
          )}

          {/* TAB 5: MIDI & SOUND */}
          {activeTab === 'midi' && (
            <MidiSettingsView
              instrumentTone={instrumentTone}
              onInstrumentChange={handleInstrumentChange}
              lang={lang}
            />
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

        {/* Executive Footer */}
        <footer className="mt-auto py-5 px-6 md:px-8 border-t border-[#E5DFD7] bg-[#F7F4EE] text-xs text-[#78716C] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981] pulse-dot" />
            <span>{t('footerLeft', lang)}</span>
          </div>
          <div className="text-[11px] text-[#A8A29E] font-mono">
            {t('footerRight', lang)}
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
