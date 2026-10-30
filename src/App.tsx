import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  BridgeCandidate,
  GroovePatternId,
  Language,
  PresetProgression,
  SpiceLevel,
  VibeId,
} from './types/harmony';
import { buildProgressionState } from './engine/reharmonizer';
import { insertBridgeChordAt } from './engine/bridgeSuggester';
import { transposeKeyRoot } from './engine/progressionParser';
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
import { ShieldCheck } from 'lucide-react';

export const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('vi');
  const [activeTab, setActiveTab] = useState<NavTabId>('studio');
  const [rawInput, setRawInput] = useState<string>('2 - 5 - 1');
  const [keyRoot, setKeyRoot] = useState<string>('C');
  const [vibe, setVibe] = useState<VibeId>('pop-ballad');
  const [spiceLevel, setSpiceLevel] = useState<SpiceLevel>(1);
  const [activeChordIndex, setActiveChordIndex] = useState<number>(0);

  // Playback & Groove State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [playingMode, setPlayingMode] = useState<'original' | 'reharmonized' | null>(null);
  const [groove, setGroove] = useState<GroovePatternId>('ballad-arpeggio');
  const [bpm, setBpm] = useState<number>(85);
  const [instrumentTone, setInstrumentTone] = useState<InstrumentToneType>('grand-piano');

  // Modals
  const [isCurriculumDrawerOpen, setIsCurriculumDrawerOpen] = useState<boolean>(false);
  const [isFocusModalOpen, setIsFocusModalOpen] = useState<boolean>(false);

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
      }
    );
  }, [progressionState.originalChords, groove, bpm]);

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
      }
    );
  }, [progressionState.reharmonizedChords, groove, bpm]);

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
    <div className="min-h-screen bg-[#0a0f16] text-[#f0f6fc] flex font-sans selection:bg-[#2dd4bf] selection:text-[#042f2e]">
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
          lang={lang}
        />

        {/* Tab Content Router */}
        <main className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* TAB 1: STUDIO */}
          {activeTab === 'studio' && (
            <div className="space-y-6">
              {/* Clarion Executive Hero Banner (Overview Start) */}
              <div className="p-6 md:p-8 rounded-2xl bg-[#111a24] border border-[#233547] relative overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between gap-6">
                  <div className="space-y-2 relative pl-14">
                    {/* Audio wave marks */}
                    <span
                      className="absolute left-0 top-1 h-12 flex items-center gap-1 text-[#2dd4bf]"
                      aria-hidden="true"
                    >
                      <i className="w-1 bg-current rounded-full wave-bar-1 block" />
                      <i className="w-1 bg-current rounded-full wave-bar-2 block" />
                      <i className="w-1 bg-current rounded-full wave-bar-3 block" />
                      <i className="w-1 bg-current rounded-full wave-bar-4 block" />
                    </span>

                    <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
                      {lang === 'vi'
                        ? 'Trợ Lý Hòa Thanh Piano AI & Voicing Studio'
                        : 'Piano Harmony AI & Voicing Studio'}
                    </h2>
                    <p className="text-xs md:text-sm text-[#8b9eb0] max-w-2xl leading-relaxed">
                      {lang === 'vi'
                        ? 'Lõi giải thuật Voice-Leading thông minh, tách tay trái/phải công thái học, hợp âm bắc cầu và nhạc nền tập trung chuyên sâu.'
                        : 'Deterministic voice-leading solver, ergonomic split-hand voicings, passing bridge chords, and zero-vocal deep focus soundscapes.'}
                    </p>
                  </div>

                  <div className="hidden lg:flex items-center gap-2 bg-[#0a0f16] px-3.5 py-2 rounded-xl border border-[#233547] text-xs font-mono text-[#2dd4bf]">
                    <ShieldCheck className="w-4 h-4 text-[#2dd4bf]" />
                    <span>100% On-Device • Zero Latency</span>
                  </div>
                </div>

                {/* 4 Executive Metric Tiles */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#1b2b3a]">
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-[#8b9eb0] uppercase tracking-wider">
                      {lang === 'vi' ? 'Số Hợp Âm' : 'Chords Count'}
                    </span>
                    <div className="text-2xl font-extrabold font-mono text-white">
                      {progressionState.reharmonizedChords.length}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-[#8b9eb0] uppercase tracking-wider">
                      {lang === 'vi' ? 'Độ Mượt Giọng' : 'Smoothness Score'}
                    </span>
                    <div className="text-2xl font-extrabold font-mono text-[#2dd4bf]">
                      {avgSmoothness}%
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-[#8b9eb0] uppercase tracking-wider">
                      {lang === 'vi' ? 'Giọng Chủ' : 'Key Root'}
                    </span>
                    <div className="text-2xl font-extrabold font-mono text-[#f59e0b]">
                      Tone {keyRoot}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-[#8b9eb0] uppercase tracking-wider">
                      {lang === 'vi' ? 'Phong Cách' : 'Active Vibe'}
                    </span>
                    <div className="text-base font-extrabold text-white truncate">
                      {vibeName}
                    </div>
                  </div>
                </div>
              </div>

              {/* Progression Control & Formulation Bar */}
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
              />

              {/* Interactive Chord Timeline */}
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
              />

              {/* 88-Key Split-Hand Piano Keyboard */}
              <Piano88Keyboard activeChord={activeChord} lang={lang} />

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
        <footer className="mt-auto py-5 px-6 md:px-8 border-t border-[#1b2b3a] bg-[#0d1620] text-xs text-[#8b9eb0] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2dd4bf] pulse-dot" />
            <span>{t('footerLeft', lang)}</span>
          </div>
          <div className="text-[11px] text-[#627a8f] font-mono">
            {t('footerRight', lang)}
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
