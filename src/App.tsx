import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { BridgeCandidate, GroovePatternId, Language, PresetProgression, SpiceLevel, VibeId } from './types/harmony';
import { buildProgressionState } from './engine/reharmonizer';
import { insertBridgeChordAt } from './engine/bridgeSuggester';
import { transposeKeyRoot } from './engine/progressionParser';
import { InstrumentToneType, pianoAudioEngine } from './audio/pianoAudioEngine';
import { initWebMidi } from './audio/webMidiService';
import { VIBE_PROFILES } from './data/curriculum';
import { t } from './i18n/translations';
import { ProgressionControlBar } from './components/ProgressionControlBar';
import { ChordTimeline } from './components/ChordTimeline';
import { Piano88Keyboard } from './components/Piano88Keyboard';
import { NotationAndNotesPanel } from './components/NotationAndNotesPanel';
import { ExplanationAndCurriculum } from './components/ExplanationAndCurriculum';
import { FocusMusicModal } from './components/FocusMusicModal';

export const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('vi');
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
  const [isCurriculumOpen, setIsCurriculumOpen] = useState<boolean>(false);
  const [isFocusModalOpen, setIsFocusModalOpen] = useState<boolean>(false);

  // Computed Progression State
  const [customState, setCustomState] = useState<ReturnType<typeof buildProgressionState> | null>(null);

  const progressionState = useMemo(() => {
    if (customState && customState.rawInput === rawInput && customState.vibe === vibe && customState.spiceLevel === spiceLevel && customState.keyRoot === keyRoot) {
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* 1. Header & Progression Input Bar */}
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
        onOpenCurriculum={() => setIsCurriculumOpen(true)}
        onOpenFocusMusic={() => setIsFocusModalOpen(true)}
        lang={lang}
        onToggleLang={setLang}
      />

      {/* 2. Interactive Chord Timeline */}
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

      {/* 3. 88-Key Split-Hand Piano Keyboard */}
      <Piano88Keyboard activeChord={activeChord} lang={lang} />

      {/* 4. Notation & Literal Notes Panel */}
      <NotationAndNotesPanel activeChord={activeChord} lang={lang} />

      {/* 5. Plain-Vietnamese Explanations & Curriculum Drawer */}
      <ExplanationAndCurriculum
        activeChord={activeChord}
        isCurriculumOpen={isCurriculumOpen}
        onCloseCurriculum={() => setIsCurriculumOpen(false)}
        onSelectProgressionFormula={(formula) => handleInputChange(formula)}
        lang={lang}
      />

      {/* 6. Focus Music Architect Modal */}
      <FocusMusicModal
        isOpen={isFocusModalOpen}
        onClose={() => setIsFocusModalOpen(false)}
        keyRoot={keyRoot}
        progressionChordsStr={progressionChordsStr}
        lang={lang}
      />

      {/* Footer */}
      <footer className="mt-auto py-4 px-6 border-t border-slate-900 text-center text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
        <div>
          {t('footerLeft', lang)}
        </div>
        <div className="text-[11px] text-slate-400">
          {t('footerRight', lang)}
        </div>
      </footer>
    </div>
  );
};

export default App;
