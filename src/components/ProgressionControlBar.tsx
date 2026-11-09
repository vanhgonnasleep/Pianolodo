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
} from 'lucide-react';
import { ChordCadenceWorkbench } from './ChordCadenceWorkbench';
import { AiProgressionSuggester } from './AiProgressionSuggester';
import { CircleOfFifths } from './CircleOfFifths';
import { DetectedChordResult } from '../engine/reverseChordDetector';

const ALL_KEYS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

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

  // New Studio Cockpit Props
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
}

export const ProgressionControlBar: React.FC<ProgressionControlBarProps> = ({
  rawInput,
  onInputChange,
  keyRoot,
  onKeyChange,
  onTranspose,
  vibe,
  onVibeChange,
  spiceLevel,
  onSpiceChange,
  voicingTopology = 'ergonomic-split',
  onVoicingTopologyChange,
  onSelectPreset,
  onOpenCurriculum,
  onOpenFocusMusic,
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
}) => {
  const [activeWorkbenchTab, setActiveWorkbenchTab] = useState<WorkbenchTabId>('cadence-251');
  const [isWorkbenchOpen, setIsWorkbenchOpen] = useState<boolean>(true);

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#1C1917] border border-[#E5DFD7] dark:border-[#292524] rounded-2xl p-4 md:p-6 shadow-sm space-y-4 transition-colors">
      {/* Top row: Brand & Studio Tools Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F5F1EB] dark:border-[#292524] pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FEF3C7] dark:bg-[#78350F]/40 border border-[#FDE68A] dark:border-[#D97706]/40 flex items-center justify-center shadow-xs font-bold text-[#D97706] dark:text-[#F59E0B] text-lg">
            <Music2 className="w-4.5 h-4.5 text-[#D97706] dark:text-[#F59E0B]" />
          </div>
          <div>
            <h1 className="text-base md:text-lg font-bold tracking-tight text-[#1C1917] dark:text-[#F5F5F4] flex items-center gap-2 font-serif">
              <span>{t('appTitle', lang)}</span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#FEF3C7] dark:bg-[#78350F]/40 text-[#92400E] dark:text-[#FDE68A] border border-[#FDE68A] dark:border-[#D97706]/40">
                Pianolodo 3.0
              </span>
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Hover Audio Scrub Toggle */}
          {onToggleHoverScrub && (
            <button
              type="button"
              onClick={onToggleHoverScrub}
              className={`pressable flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-xs transition ${
                hoverScrubEnabled
                  ? 'bg-[#FEF3C7] dark:bg-[#78350F]/50 text-[#B45309] dark:text-[#FDE68A] border-[#D97706] ring-1 ring-[#D97706]'
                  : 'bg-[#FAF8F5] dark:bg-[#12100E] text-[#78716C] dark:text-[#A8A29E] border-[#E5DFD7] dark:border-[#292524] hover:text-[#1C1917] dark:hover:text-[#F5F5F4]'
              }`}
              title={lang === 'vi' ? 'Bật/tắt phát âm nhẹ khi rê chuột qua hợp âm' : 'Toggle audio preview on hover'}
            >
              <Volume2 className={`w-3.5 h-3.5 ${hoverScrubEnabled ? 'text-[#D97706] dark:text-[#F59E0B]' : 'text-[#78716C] dark:text-[#A8A29E]'}`} />
              <span>{lang === 'vi' ? 'Rê Chuột Nghe Thử' : 'Hover Scrub'}</span>
            </button>
          )}

          {/* Practical Curriculum Button */}
          <button
            onClick={onOpenCurriculum}
            className="pressable flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF8F5] dark:bg-[#12100E] text-[#1C1917] dark:text-[#F5F5F4] border border-[#E5DFD7] dark:border-[#292524] hover:bg-[#EDE8E1] dark:hover:bg-[#292524] text-xs font-semibold shadow-xs transition"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#D97706] dark:text-[#F59E0B]" />
            <span>{t('curriculumBtn', lang)}</span>
          </button>

          {/* Deep Focus Music Generator Modal */}
          <button
            onClick={onOpenFocusMusic}
            className="pressable flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF8F5] dark:bg-[#12100E] text-[#1C1917] dark:text-[#F5F5F4] border border-[#E5DFD7] dark:border-[#292524] hover:bg-[#EDE8E1] dark:hover:bg-[#292524] text-xs font-semibold shadow-xs transition"
          >
            <Headphones className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA]" />
            <span>{t('focusMusicBtn', lang)}</span>
          </button>
        </div>
      </div>

      {/* Second row: Input bar + Voicing Topology + Key Root */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Progression Input Bar */}
        <div className="md:col-span-6 flex flex-col gap-1">
          <label className="text-sm font-semibold text-[#1C1917] dark:text-[#F5F5F4] flex items-center justify-between">
            <span>{t('inputLabel', lang)}</span>
            <span className="text-xs text-[#D97706] dark:text-[#F59E0B] font-medium">{t('inputHint', lang)}</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={rawInput}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder={t('inputPlaceholder', lang)}
              className="w-full bg-[#FAF8F5] dark:bg-[#12100E] border border-[#E5DFD7] dark:border-[#292524] rounded-xl px-4 py-2 text-base md:text-lg font-bold text-[#1C1917] dark:text-[#F5F5F4] focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] transition shadow-inner font-mono tracking-wider"
            />
          </div>
        </div>

        {/* Voicing Topology Selector */}
        {onVoicingTopologyChange && (
          <div className="md:col-span-3 flex flex-col gap-1">
            <label className="text-sm font-semibold text-[#78716C] dark:text-[#A8A29E] flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-[#D97706] dark:text-[#F59E0B]" />
              <span>{lang === 'vi' ? 'Thế Bấm (Voicing)' : 'Voicing Style'}</span>
            </label>
            <select
              value={voicingTopology}
              onChange={(e) => onVoicingTopologyChange(e.target.value as VoicingTopology)}
              className="bg-[#FAF8F5] dark:bg-[#12100E] border border-[#E5DFD7] dark:border-[#292524] rounded-xl px-3 py-2 text-xs font-bold text-[#1C1917] dark:text-[#F5F5F4] focus:outline-none focus:border-[#D97706] cursor-pointer"
            >
              <option value="ergonomic-split">{lang === 'vi' ? 'Ergonomic Split (Mặc định)' : 'Ergonomic Split (Default)'}</option>
              <option value="rootless-a">Bill Evans Type A (3-5-7-9)</option>
              <option value="rootless-b">Bill Evans Type B (7-9-3-5)</option>
              <option value="drop-2">Drop-2 Lush Harmony</option>
              <option value="quartal">Quartal 4ths (McCoy Tyner)</option>
            </select>
          </div>
        )}

        {/* Key and Transpose */}
        <div className="md:col-span-3 flex flex-col gap-1">
          <label className="text-sm font-semibold text-[#78716C] dark:text-[#A8A29E]">{t('keyRootLabel', lang)}</label>
          <div className="flex items-center gap-1.5">
            <select
              value={keyRoot}
              onChange={(e) => onKeyChange(e.target.value)}
              className="bg-[#FAF8F5] dark:bg-[#12100E] border border-[#E5DFD7] dark:border-[#292524] rounded-xl px-3 py-1.5 text-base font-bold text-[#D97706] dark:text-[#F59E0B] focus:outline-none focus:border-[#D97706] flex-1 cursor-pointer font-serif"
            >
              {ALL_KEYS.map((k) => (
                <option key={k} value={k}>
                  Tone {k} Major
                </option>
              ))}
            </select>

            <button
              onClick={() => onTranspose(-1)}
              title="Transpose down 1 semitone"
              className="pressable px-2.5 py-1.5 rounded-xl bg-[#FAF8F5] dark:bg-[#12100E] hover:bg-[#EDE8E1] dark:hover:bg-[#292524] text-[#1C1917] dark:text-[#F5F5F4] border border-[#E5DFD7] dark:border-[#292524] font-mono font-bold text-sm shadow-xs"
            >
              -1
            </button>
            <button
              onClick={() => onTranspose(1)}
              title="Transpose up 1 semitone"
              className="pressable px-2.5 py-1.5 rounded-xl bg-[#FAF8F5] dark:bg-[#12100E] hover:bg-[#EDE8E1] dark:hover:bg-[#292524] text-[#1C1917] dark:text-[#F5F5F4] border border-[#E5DFD7] dark:border-[#292524] font-mono font-bold text-sm shadow-xs"
            >
              +1
            </button>
          </div>
        </div>
      </div>

      {/* QWERTY Live Keyboard Detection Strip */}
      {detectedChord && (
        <div className="p-2.5 rounded-xl bg-[#FEF3C7] dark:bg-[#78350F]/40 border border-[#FDE68A] dark:border-[#D97706]/40 flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-[#D97706] dark:text-[#F59E0B]" />
            <span className="text-xs font-semibold text-[#92400E] dark:text-[#FDE68A]">
              {lang === 'vi' ? 'Hợp âm vừa bấm (QWERTY / MIDI):' : 'Live Detected Chord:'}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white dark:bg-black font-mono font-extrabold text-sm text-[#D97706] dark:text-[#F59E0B] shadow-xs">
              {detectedChord.chordSymbol}
            </span>
            <span className="text-[11px] text-[#78716C] dark:text-[#A8A29E]">
              ({detectedChord.notes.join(' - ')})
            </span>
          </div>

          {onAppendDetectedChord && (
            <button
              onClick={() => onAppendDetectedChord(detectedChord.chordSymbol)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#D97706] dark:bg-[#F59E0B] text-white text-xs font-bold hover:bg-[#B45309] shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{lang === 'vi' ? '+ Thêm vào vòng' : '+ Append to Progression'}</span>
            </button>
          )}
        </div>
      )}

      {/* Third row: Quick Presets Scroll Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        <span className="text-xs font-bold text-[#78716C] dark:text-[#A8A29E] uppercase tracking-wider whitespace-nowrap mr-1">
          {t('presetsLabel', lang)}:
        </span>
        {PRESET_PROGRESSIONS.map((preset) => {
          const isSelected = rawInput.trim() === preset.degreeInput.trim();
          const displayName = lang === 'vi' ? preset.nameVi : preset.nameEn;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`pressable whitespace-nowrap px-3 py-1.5 rounded-lg text-sm font-medium transition border flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#FEF3C7] dark:bg-[#78350F]/50 text-[#B45309] dark:text-[#FDE68A] border-[#D97706] shadow-xs font-bold'
                  : 'bg-[#FAF8F5] dark:bg-[#12100E] text-[#57534E] dark:text-[#A8A29E] border-[#E5DFD7] dark:border-[#292524] hover:border-[#D1C8BD] hover:text-[#1C1917] dark:hover:text-[#F5F5F4]'
              }`}
            >
              <span>{displayName}</span>
            </button>
          );
        })}
      </div>

      {/* Studio Workbench Header: Segmented Control Tabs */}
      <div className="pt-2 border-t border-[#F5F1EB] dark:border-[#292524] flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center bg-[#FAF8F5] dark:bg-[#12100E] p-1 rounded-xl border border-[#E5DFD7] dark:border-[#292524] text-xs font-semibold gap-1">
          <button
            onClick={() => {
              setActiveWorkbenchTab('cadence-251');
              setIsWorkbenchOpen(true);
            }}
            className={`pressable px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              isWorkbenchOpen && activeWorkbenchTab === 'cadence-251'
                ? 'bg-[#FFFFFF] dark:bg-[#1C1917] text-[#92400E] dark:text-[#F59E0B] shadow-xs font-bold border border-[#E5DFD7] dark:border-[#292524]'
                : 'text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F5F4]'
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
                ? 'bg-[#FFFFFF] dark:bg-[#1C1917] text-[#92400E] dark:text-[#F59E0B] shadow-xs font-bold border border-[#E5DFD7] dark:border-[#292524]'
                : 'text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F5F4]'
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
                ? 'bg-[#FFFFFF] dark:bg-[#1C1917] text-[#92400E] dark:text-[#F59E0B] shadow-xs font-bold border border-[#E5DFD7] dark:border-[#292524]'
                : 'text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F5F4]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#D97706] dark:text-[#F59E0B]" />
            <span>{lang === 'vi' ? 'AI 5 Phong Cách' : 'AI 5-Style Options'}</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#FEF3C7] dark:bg-[#78350F]/50 text-[#B45309] dark:text-[#FDE68A]">
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
                ? 'bg-[#FFFFFF] dark:bg-[#1C1917] text-[#92400E] dark:text-[#F59E0B] shadow-xs font-bold border border-[#E5DFD7] dark:border-[#292524]'
                : 'text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F5F4]'
            }`}
          >
            <Sliders className="w-4 h-4 text-[#D97706] dark:text-[#F59E0B]" />
            <span>{lang === 'vi' ? 'Phong Cách & Gia Vị' : 'Vibe & Spice'}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsWorkbenchOpen((prev) => !prev)}
          className="pressable flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF8F5] dark:bg-[#12100E] text-xs font-semibold text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F5F4] border border-[#E5DFD7] dark:border-[#292524]"
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
            <div className="p-4 md:p-5 rounded-2xl bg-[#FAF8F5] dark:bg-[#12100E] border border-[#E5DFD7] dark:border-[#292524] shadow-xs space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
                {/* Vibe cards */}
                <div className="lg:col-span-8 flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-[#78716C] dark:text-[#A8A29E]">{t('vibeLabel', lang)}</span>
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
                              ? 'bg-[#FEF3C7] dark:bg-[#78350F]/50 border-[#D97706] text-[#1C1917] dark:text-[#F5F5F4] shadow-xs'
                              : 'bg-[#FFFFFF] dark:bg-[#1C1917] border-[#E5DFD7] dark:border-[#292524] text-[#78716C] dark:text-[#A8A29E] hover:border-[#D1C8BD] hover:text-[#1C1917] dark:hover:text-[#F5F5F4]'
                          }`}
                        >
                          <div className={`text-sm font-bold font-serif ${active ? 'text-[#B45309] dark:text-[#FDE68A]' : 'text-[#1C1917] dark:text-[#F5F5F4]'}`}>
                            {name}
                          </div>
                          <div className="text-xs text-[#78716C] dark:text-[#A8A29E] line-clamp-1">{desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Spice Level */}
                <div className="lg:col-span-4 flex flex-col gap-1.5">
                  <span className="text-sm font-semibold text-[#78716C] dark:text-[#A8A29E]">{t('spiceLevelLabel', lang)}</span>
                  <div className="grid grid-cols-3 gap-1.5 bg-[#FFFFFF] dark:bg-[#1C1917] p-1.5 rounded-xl border border-[#E5DFD7] dark:border-[#292524]">
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
                              ? 'bg-[#D97706] dark:bg-[#F59E0B] text-white font-bold shadow-xs'
                              : 'text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F5F4]'
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
