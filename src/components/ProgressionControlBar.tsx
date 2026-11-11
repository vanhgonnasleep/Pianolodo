import React, { useState } from 'react';
import { InstrumentToneType } from '../audio/pianoAudioEngine';
import { PRESET_PROGRESSIONS } from '../data/presetProgressions';
import {
  Language,
  PresetProgression,
  ProgressionOption,
  SpiceLevel,
  VibeId,
  VoicedChord,
  VoicingTopology,
} from '../types/harmony';
import { VIBE_PROFILES } from '../data/curriculum';
import { t } from '../i18n/translations';
import {
  BookOpen,
  Headphones,
  Sparkles,
  Volume2,
  Music2,
  Wand2,
  Sliders,
  ChevronDown,
  ChevronUp,
  Compass,
  Layers,
  Keyboard,
  Plus,
  Command,
  ShieldCheck,
} from 'lucide-react';
import { ChordCadenceWorkbench } from './ChordCadenceWorkbench';
import { AiProgressionSuggester } from './AiProgressionSuggester';
import { CircleOfFifths } from './CircleOfFifths';
import { DetectedChordResult } from '../engine/reverseChordDetector';

export type WorkbenchTabId = 'cadence-251' | 'compass-fifths' | 'ai-suggester' | 'vibe-spice';

interface ProgressionControlBarProps {
  rawInput: string;
  onInputChange: (val: string) => void;
  keyRoot: string;
  onKeyChange: (key: string) => void;
  onTranspose: (semitones: number) => void;
  vibe: VibeId;
  onVibeChange: (vibe: VibeId) => void;
  spiceLevel: SpiceLevel;
  onSpiceChange: (level: SpiceLevel) => void;
  voicingTopology?: VoicingTopology;
  onVoicingTopologyChange?: (topology: VoicingTopology) => void;
  instrumentTone: InstrumentToneType;
  onInstrumentChange: (tone: InstrumentToneType) => void;
  onSelectPreset: (preset: PresetProgression) => void;
  onOpenCurriculum: () => void;
  onOpenFocusMusic: () => void;
  lang: Language;
  onToggleLang: (newLang: Language) => void;

  // Studio Cockpit Props
  progressionOptions: ProgressionOption[];
  onSelectProgressionOption: (opt: ProgressionOption) => void;
  onHoverChord?: (chord: VoicedChord, multiChords?: VoicedChord[], label?: string) => void;
  onLeaveHover?: () => void;
  onAuditionChord?: (chord: VoicedChord | null, multiChords?: VoicedChord[]) => void;
  hoverScrubEnabled?: boolean;
  onToggleHoverScrub?: () => void;

  // QWERTY Live Piano Integration
  detectedChord?: DetectedChordResult | null;
  onAppendDetectedChord?: (chordSymbol: string) => void;
  octaveShift?: number;
  onShiftOctave?: (delta: number) => void;
  isQwertyActive?: boolean;

  // Audio / Song Analyzer & Status Props
  onOpenSongAnalyzer?: () => void;
  avgSmoothness?: number;
}

export const ProgressionControlBar: React.FC<ProgressionControlBarProps> = ({
  rawInput,
  onInputChange,
  keyRoot,
  onKeyChange,
  vibe,
  onVibeChange,
  spiceLevel,
  onSpiceChange,
  voicingTopology = 'ergonomic-split',
  onVoicingTopologyChange,
  onSelectPreset,
  onOpenCurriculum,
  lang,
  progressionOptions,
  onSelectProgressionOption,
  onHoverChord,
  onLeaveHover,
  onAuditionChord,
  hoverScrubEnabled = false,
  onToggleHoverScrub,
  detectedChord,
  onAppendDetectedChord,
  onOpenSongAnalyzer,
  avgSmoothness = 88,
}) => {
  const [activeWorkbenchTab, setActiveWorkbenchTab] = useState<WorkbenchTabId>('cadence-251');
  const [isWorkbenchOpen, setIsWorkbenchOpen] = useState<boolean>(true);

  return (
    <div className="bg-[#FFFFFF]/90 dark:bg-[#16192E]/80 backdrop-blur-xl border border-[#E5DFD7] dark:border-white/12 rounded-3xl p-4 md:p-6 shadow-sm space-y-4 transition-colors">
      {/* Top row: Brand & Status Badges & Quick Tools Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F5F1EB] dark:border-white/10 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] dark:from-[#38BDF8]/20 dark:to-[#818CF8]/20 border border-[#FDE68A] dark:border-[#38BDF8]/40 flex items-center justify-center shadow-xs font-bold text-[#D97706] dark:text-[#38BDF8] text-lg glow-amber">
            <Music2 className="w-5 h-5" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-base md:text-lg font-bold tracking-tight text-[#1C1917] dark:text-[#F8FAFC] flex items-center gap-2 font-serif">
              <span>{t('appTitle', lang)}</span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#FEF3C7] dark:bg-[#F59E0B]/20 text-[#92400E] dark:text-[#FBBF24] border border-[#FDE68A] dark:border-[#F59E0B]/40">
                Pianolodo 3.0
              </span>
            </h1>

            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#FAF8F5] dark:bg-[#15192C] text-[#10B981] dark:text-[#34D399] border border-[#E5DFD7] dark:border-white/10">
              {avgSmoothness}% {lang === 'vi' ? 'Độ mượt' : 'Smooth'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Keyboard shortcut hint */}
          <div className="hidden xl:flex items-center gap-1.5 text-xs text-[#78716C] dark:text-[#CBD5E1] bg-[#FAF8F5] dark:bg-[#15192C] px-2.5 py-1.5 rounded-xl border border-[#E5DFD7] dark:border-white/10">
            <Command className="w-3.5 h-3.5 text-[#D97706] dark:text-[#F59E0B]" />
            <span>
              <kbd className="font-mono bg-white dark:bg-[#1C203B] dark:text-[#F8FAFC] px-1 py-0.5 rounded text-[11px]">Space</kbd> Play ·{' '}
              <kbd className="font-mono bg-white dark:bg-[#1C203B] dark:text-[#F8FAFC] px-1 py-0.5 rounded text-[11px]">QWERTY</kbd>
            </span>
          </div>

          {/* On-Device Shield Badge */}
          <div className="flex items-center gap-1.5 bg-[#FAF8F5] dark:bg-[#15192C] px-2.5 py-1.5 rounded-xl border border-[#E5DFD7] dark:border-white/10 text-xs font-mono text-[#065F46] dark:text-[#34D399] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10B981] dark:text-[#34D399]" />
            <span>On-Device</span>
          </div>

          {/* Hover Audio Scrub Toggle */}
          {onToggleHoverScrub && (
            <button
              type="button"
              onClick={onToggleHoverScrub}
              className={`pressable flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-xs transition ${
                hoverScrubEnabled
                  ? 'bg-[#FEF3C7] dark:bg-[#F59E0B]/20 text-[#B45309] dark:text-[#FBBF24] border-[#D97706] dark:border-[#F59E0B] ring-1 ring-[#D97706] dark:ring-[#F59E0B] glow-amber'
                  : 'bg-[#FAF8F5] dark:bg-[#1C203B] text-[#78716C] dark:text-[#CBD5E1] border-[#E5DFD7] dark:border-white/10 hover:text-[#1C1917] dark:hover:text-[#F8FAFC]'
              }`}
              title={lang === 'vi' ? 'Bật/tắt phát âm nhẹ khi rê chuột qua hợp âm' : 'Toggle audio preview on hover'}
            >
              <Volume2 className={`w-3.5 h-3.5 ${hoverScrubEnabled ? 'text-[#D97706] dark:text-[#F59E0B]' : 'text-[#78716C] dark:text-[#CBD5E1]'}`} />
              <span>{lang === 'vi' ? 'Rê Chuột Nghe Thử' : 'Hover Scrub'}</span>
            </button>
          )}

          {/* Practical Curriculum Button */}
          <button
            onClick={onOpenCurriculum}
            className="pressable flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF8F5] dark:bg-[#1C203B] text-[#1C1917] dark:text-[#F8FAFC] border border-[#E5DFD7] dark:border-white/10 hover:bg-[#EDE8E1] dark:hover:bg-[#232946] text-xs font-semibold shadow-xs transition"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#D97706] dark:text-[#F59E0B]" />
            <span>{t('curriculumBtn', lang)}</span>
          </button>
        </div>
      </div>

      {/* Prominent Music & Audio Input Callout Banner */}
      {onOpenSongAnalyzer && (
        <div className="p-3.5 md:p-4 rounded-2xl bg-gradient-to-r from-[#2563EB]/15 via-[#38BDF8]/15 to-[#8B5CF6]/15 dark:from-[#2563EB]/25 dark:via-[#38BDF8]/25 dark:to-[#8B5CF6]/25 border border-[#38BDF8]/40 dark:border-[#38BDF8]/50 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#38BDF8] to-[#2563EB] flex items-center justify-center text-white shadow-md shadow-[#38BDF8]/30 shrink-0">
              <Headphones className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-[#1C1917] dark:text-[#F8FAFC]">
                  {lang === 'vi' ? 'Input Nhạc Vào: AI Dò & Phối Hợp Âm Đệm Tự Động' : 'Audio Input: AI Chord Accompaniment Analyzer'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#38BDF8]/20 text-[#0284C7] dark:text-[#38BDF8] text-[10px] font-mono font-extrabold border border-[#38BDF8]/40">
                  AI DSP
                </span>
              </div>
              <p className="text-xs text-[#78716C] dark:text-[#CBD5E1] mt-0.5">
                {lang === 'vi'
                  ? 'Kéo thả file nhạc (.MP3 / .WAV / .MID), ngân nga qua Mic, hoặc bấm nghe thử bản Demo để AI tự dò Tone và ném ra 3 bản phối đệm piano!'
                  : 'Drop audio files (.MP3 / .WAV / .MID), hum into Mic, or test instant demo to automatically extract piano accompaniment chords!'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenSongAnalyzer}
            className="pressable px-4 py-2 rounded-xl bg-gradient-to-r from-[#38BDF8] via-[#2563EB] to-[#8B5CF6] hover:from-[#60A5FA] hover:to-[#A78BFA] text-white font-extrabold text-xs shadow-md shadow-[#38BDF8]/30 flex items-center justify-center gap-2 transition shrink-0"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>{lang === 'vi' ? '🎧 Tách Nhạc / Mic Ngay' : '🎧 Analyze Song / Mic'}</span>
          </button>
        </div>
      )}

      {/* Second row: Progression Input + Voicing Topology + Song Analyzer Quick Trigger */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Progression Input Bar */}
        <div className="md:col-span-6 flex flex-col gap-1">
          <label className="text-sm font-semibold text-[#1C1917] dark:text-[#F8FAFC] flex items-center justify-between">
            <span>{t('inputLabel', lang)}</span>
            <span className="text-xs text-[#D97706] dark:text-[#F59E0B] font-medium">{t('inputHint', lang)}</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={rawInput}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder={t('inputPlaceholder', lang)}
              className="w-full bg-[#FAF8F5] dark:bg-[#15192C] border border-[#E5DFD7] dark:border-white/10 rounded-xl pl-4 pr-32 py-2 text-base md:text-lg font-bold text-[#1C1917] dark:text-[#F8FAFC] focus:outline-none focus:border-[#D97706] dark:focus:border-[#38BDF8] focus:ring-1 focus:ring-[#D97706] dark:focus:ring-[#38BDF8] transition shadow-inner font-mono tracking-wider"
            />
            {onOpenSongAnalyzer && (
              <button
                type="button"
                onClick={onOpenSongAnalyzer}
                title={lang === 'vi' ? 'Input file nhạc hoặc thu âm mic' : 'Input audio file or record mic'}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-[#38BDF8]/15 hover:bg-[#38BDF8]/25 text-[#0284C7] dark:text-[#38BDF8] border border-[#38BDF8]/30 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>{lang === 'vi' ? 'Tách Nhạc' : 'Audio Input'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Voicing Topology Selector */}
        {onVoicingTopologyChange && (
          <div className="md:col-span-3 flex flex-col gap-1">
            <label className="text-sm font-semibold text-[#78716C] dark:text-[#CBD5E1] flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-[#D97706] dark:text-[#F59E0B]" />
              <span>{lang === 'vi' ? 'Thế Bấm (Voicing)' : 'Voicing Style'}</span>
            </label>
            <select
              value={voicingTopology}
              onChange={(e) => onVoicingTopologyChange(e.target.value as VoicingTopology)}
              className="bg-[#FAF8F5] dark:bg-[#15192C] border border-[#E5DFD7] dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-[#1C1917] dark:text-[#F8FAFC] focus:outline-none focus:border-[#D97706] dark:focus:border-[#38BDF8] cursor-pointer"
            >
              <option value="ergonomic-split" className="dark:bg-[#16192E]">{lang === 'vi' ? 'Ergonomic Split (Mặc định)' : 'Ergonomic Split (Default)'}</option>
              <option value="rootless-a" className="dark:bg-[#16192E]">Bill Evans Type A (3-5-7-9)</option>
              <option value="rootless-b" className="dark:bg-[#16192E]">Bill Evans Type B (7-9-3-5)</option>
              <option value="drop-2" className="dark:bg-[#16192E]">Drop-2 Lush Harmony</option>
              <option value="quartal" className="dark:bg-[#16192E]">Quartal 4ths (McCoy Tyner)</option>
            </select>
          </div>
        )}

        {/* Audio / Melody Song Analyzer Quick-Trigger Button (Replaces redundant duplicate Key Root control) */}
        <div className="md:col-span-3 flex flex-col gap-1">
          <label className="text-sm font-semibold text-[#78716C] dark:text-[#CBD5E1] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>{lang === 'vi' ? 'Trợ Lý Tách Âm (AI DSP)' : 'Song Analyzer (AI DSP)'}</span>
          </label>
          <button
            type="button"
            onClick={onOpenSongAnalyzer}
            className="pressable w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#2563EB]/25 via-[#38BDF8]/25 to-[#A78BFA]/25 hover:from-[#2563EB]/40 hover:via-[#38BDF8]/40 hover:to-[#A78BFA]/40 border border-[#38BDF8]/40 text-[#0284C7] dark:text-[#38BDF8] text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition"
          >
            <Headphones className="w-4 h-4 text-[#38BDF8] shrink-0" />
            <span className="truncate">{lang === 'vi' ? '🎧 Tách Hợp Âm Từ Nhạc/Mic' : '🎧 Song -> Chords'}</span>
          </button>
        </div>
      </div>

      {/* QWERTY Live Keyboard Detection Strip */}
      {detectedChord && (
        <div className="p-2.5 rounded-xl bg-[#FEF3C7] dark:bg-[#1F2442] border border-[#FDE68A] dark:border-[#38BDF8]/40 flex flex-wrap items-center justify-between gap-3 animate-fadeIn glow-amber">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-[#D97706] dark:text-[#F59E0B]" />
            <span className="text-xs font-semibold text-[#92400E] dark:text-[#FBBF24]">
              {lang === 'vi' ? 'Hợp âm vừa bấm (QWERTY / MIDI):' : 'Live Detected Chord:'}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white dark:bg-[#15192C] font-mono font-extrabold text-sm text-[#D97706] dark:text-[#F59E0B] shadow-xs border border-transparent dark:border-white/10">
              {detectedChord.chordSymbol}
            </span>
            <span className="text-[11px] text-[#78716C] dark:text-[#CBD5E1]">
              ({detectedChord.notes.join(' - ')})
            </span>
          </div>

          {onAppendDetectedChord && (
            <button
              onClick={() => onAppendDetectedChord(detectedChord.chordSymbol)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#D97706] dark:bg-[#F59E0B] text-white dark:text-black text-xs font-bold hover:bg-[#B45309] shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{lang === 'vi' ? '+ Thêm vào vòng' : '+ Append to Progression'}</span>
            </button>
          )}
        </div>
      )}

      {/* Presets Wrap Strip (Task 2.2: flex flex-wrap gap-2, zero horizontal scrollbar, zero double colon) */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs font-bold text-[#78716C] dark:text-[#CBD5E1] uppercase tracking-wider whitespace-nowrap mr-1">
          {t('presetsLabel', lang)}
        </span>
        {PRESET_PROGRESSIONS.map((preset) => {
          const isSelected = rawInput.trim() === preset.degreeInput.trim();
          const displayName = lang === 'vi' ? preset.nameVi : preset.nameEn;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`pressable px-3 py-1.5 rounded-xl text-xs md:text-sm font-medium transition border flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#FEF3C7] dark:bg-[#F59E0B]/20 text-[#B45309] dark:text-[#FBBF24] border-[#D97706] dark:border-[#F59E0B] shadow-xs font-bold glow-amber'
                  : 'bg-[#FAF8F5] dark:bg-[#1C203B] text-[#57534E] dark:text-[#CBD5E1] border-[#E5DFD7] dark:border-white/10 hover:border-[#D1C8BD] dark:hover:border-white/25 hover:text-[#1C1917] dark:hover:text-[#F8FAFC]'
              }`}
            >
              <span>{displayName}</span>
            </button>
          );
        })}
      </div>

      {/* Studio Workbench Header: Segmented Control Tabs */}
      <div className="pt-2 border-t border-[#F5F1EB] dark:border-white/10 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center bg-[#FAF8F5] dark:bg-[#15192C] p-1 rounded-xl border border-[#E5DFD7] dark:border-white/10 text-xs font-semibold gap-1">
          <button
            onClick={() => {
              setActiveWorkbenchTab('cadence-251');
              setIsWorkbenchOpen(true);
            }}
            className={`pressable px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              isWorkbenchOpen && activeWorkbenchTab === 'cadence-251'
                ? 'bg-[#FFFFFF] dark:bg-[#232946] text-[#92400E] dark:text-[#F59E0B] shadow-xs font-bold border border-[#E5DFD7] dark:border-white/15'
                : 'text-[#78716C] dark:text-[#CBD5E1] hover:text-[#1C1917] dark:hover:text-[#F8FAFC]'
            }`}
          >
            <Wand2 className="w-4 h-4 text-[#D97706] dark:text-[#F59E0B]" />
            <span>{lang === 'vi' ? 'Chèn 2-5-1 & Dãy Hợp Âm' : '2-5-1 Cadence Inserter'}</span>
          </button>

          <button
            onClick={() => {
              setActiveWorkbenchTab('compass-fifths');
              setIsWorkbenchOpen(true);
            }}
            className={`pressable px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              isWorkbenchOpen && activeWorkbenchTab === 'compass-fifths'
                ? 'bg-[#FFFFFF] dark:bg-[#232946] text-[#92400E] dark:text-[#F59E0B] shadow-xs font-bold border border-[#E5DFD7] dark:border-white/15'
                : 'text-[#78716C] dark:text-[#CBD5E1] hover:text-[#1C1917] dark:hover:text-[#F8FAFC]'
            }`}
          >
            <Compass className="w-4 h-4 text-[#D97706] dark:text-[#F59E0B]" />
            <span>{lang === 'vi' ? 'Vòng Bậc 5 (Compass)' : 'Circle of 5ths'}</span>
          </button>

          <button
            onClick={() => {
              setActiveWorkbenchTab('ai-suggester');
              setIsWorkbenchOpen(true);
            }}
            className={`pressable px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              isWorkbenchOpen && activeWorkbenchTab === 'ai-suggester'
                ? 'bg-[#FFFFFF] dark:bg-[#232946] text-[#92400E] dark:text-[#F59E0B] shadow-xs font-bold border border-[#E5DFD7] dark:border-white/15'
                : 'text-[#78716C] dark:text-[#CBD5E1] hover:text-[#1C1917] dark:hover:text-[#F8FAFC]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#D97706] dark:text-[#F59E0B]" />
            <span>{lang === 'vi' ? 'AI 5 Phong Cách' : 'AI 5-Style Options'}</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#FEF3C7] dark:bg-[#F59E0B]/20 text-[#B45309] dark:text-[#FBBF24]">
              {progressionOptions.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveWorkbenchTab('vibe-spice');
              setIsWorkbenchOpen(true);
            }}
            className={`pressable px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              isWorkbenchOpen && activeWorkbenchTab === 'vibe-spice'
                ? 'bg-[#FFFFFF] dark:bg-[#232946] text-[#92400E] dark:text-[#F59E0B] shadow-xs font-bold border border-[#E5DFD7] dark:border-white/15'
                : 'text-[#78716C] dark:text-[#CBD5E1] hover:text-[#1C1917] dark:hover:text-[#F8FAFC]'
            }`}
          >
            <Sliders className="w-4 h-4 text-[#D97706] dark:text-[#F59E0B]" />
            <span>{lang === 'vi' ? 'Phong Cách & Gia Vị' : 'Vibe & Spice'}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsWorkbenchOpen((prev) => !prev)}
          className="pressable flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF8F5] dark:bg-[#1C203B] text-xs font-semibold text-[#78716C] dark:text-[#CBD5E1] hover:text-[#1C1917] dark:hover:text-[#F8FAFC] border border-[#E5DFD7] dark:border-white/10"
        >
          <span>{isWorkbenchOpen ? (lang === 'vi' ? 'Thu gọn' : 'Collapse') : (lang === 'vi' ? 'Mở rộng' : 'Expand')}</span>
          {isWorkbenchOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Unified Workbench Dynamic Content Container */}
      {isWorkbenchOpen && (
        <div className="pt-1">
          {/* TAB 1: Cadence & 2-5-1 Workbench */}
          {activeWorkbenchTab === 'cadence-251' && (
            <ChordCadenceWorkbench
              rawInput={rawInput}
              onInputChange={onInputChange}
              keyRoot={keyRoot}
              lang={lang}
              onHoverChord={onHoverChord}
              onLeaveHover={onLeaveHover}
              onAuditionChord={onAuditionChord}
            />
          )}

          {/* TAB 2: Circle of Fifths Compass */}
          {activeWorkbenchTab === 'compass-fifths' && (
            <CircleOfFifths
              currentKey={keyRoot}
              onSelectKey={onKeyChange}
              lang={lang}
            />
          )}

          {/* TAB 3: AI 5-Style Options */}
          {activeWorkbenchTab === 'ai-suggester' && (
            <AiProgressionSuggester
              options={progressionOptions}
              onSelectOption={onSelectProgressionOption}
              lang={lang}
              currentRawInput={rawInput}
              onHoverChord={onHoverChord}
              onLeaveHover={onLeaveHover}
              onAuditionChord={onAuditionChord}
            />
          )}

          {/* TAB 4: Vibe Selector & Spice Level */}
          {activeWorkbenchTab === 'vibe-spice' && (
            <div className="p-4 md:p-5 rounded-2xl bg-[#FAF8F5] dark:bg-[#1C203B]/80 border border-[#E5DFD7] dark:border-white/10 shadow-xs space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
                {/* Vibe cards */}
                <div className="lg:col-span-8 flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-[#78716C] dark:text-[#CBD5E1]">{t('vibeLabel', lang)}</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['pop-ballad', 'rnb-neosoul', 'jazz-bossa', 'cinematic-sad'] as VibeId[]).map((vId) => {
                      const profile = VIBE_PROFILES[vId];
                      const active = vibe === vId;
                      const name = lang === 'vi' ? profile.nameVi : profile.nameEn;
                      const desc = lang === 'vi' ? profile.subtitleVi : profile.subtitleEn;

                      return (
                        <button
                          key={vId}
                          onClick={() => onVibeChange(vId)}
                          className={`pressable p-3 rounded-xl border text-left transition ${
                            active
                              ? 'bg-[#FEF3C7] dark:bg-[#1F2442] border-[#D97706] dark:border-[#F59E0B] text-[#1C1917] dark:text-[#F8FAFC] shadow-xs glow-amber'
                              : 'bg-[#FFFFFF] dark:bg-[#15192C] border-[#E5DFD7] dark:border-white/10 text-[#78716C] dark:text-[#CBD5E1] hover:border-[#D1C8BD] dark:hover:border-white/20 hover:text-[#1C1917] dark:hover:text-[#F8FAFC]'
                          }`}
                        >
                          <div className={`text-sm font-bold font-serif ${active ? 'text-[#B45309] dark:text-[#FBBF24]' : 'text-[#1C1917] dark:text-[#F8FAFC]'}`}>
                            {name}
                          </div>
                          <div className="text-xs text-[#78716C] dark:text-[#9494A6] line-clamp-1">{desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Spice Level */}
                <div className="lg:col-span-4 flex flex-col gap-1.5">
                  <span className="text-sm font-semibold text-[#78716C] dark:text-[#CBD5E1]">{t('spiceLevelLabel', lang)}</span>
                  <div className="grid grid-cols-3 gap-1.5 bg-[#FFFFFF] dark:bg-[#15192C] p-1.5 rounded-xl border border-[#E5DFD7] dark:border-white/10">
                    {[
                      { level: 1 as SpiceLevel, label: t('spice1Label', lang), desc: t('spice1Desc', lang) },
                      { level: 2 as SpiceLevel, label: t('spice2Label', lang), desc: t('spice2Desc', lang) },
                      { level: 3 as SpiceLevel, label: t('spice3Label', lang), desc: t('spice3Desc', lang) },
                    ].map((s) => {
                      const active = spiceLevel === s.level;
                      return (
                        <button
                          key={s.level}
                          onClick={() => onSpiceChange(s.level)}
                          className={`pressable py-2 px-1.5 rounded-lg text-center transition ${
                            active
                              ? 'bg-[#D97706] dark:bg-[#F59E0B] text-white dark:text-black font-extrabold shadow-xs dark:shadow-[0_0_12px_rgba(245,158,11,0.35)]'
                              : 'text-[#78716C] dark:text-[#CBD5E1] hover:text-[#1C1917] dark:hover:text-[#F8FAFC]'
                          }`}
                        >
                          <div className="text-sm font-semibold">{s.label}</div>
                          <div className="text-xs opacity-90">{s.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
