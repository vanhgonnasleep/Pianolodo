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
} from '../types/harmony';
import { VIBE_PROFILES } from '../data/curriculum';
import { t } from '../i18n/translations';
import {
  BookOpen,
  Headphones,
  Sparkles,
  Volume2,
  Globe,
  Music2,
  Wand2,
  Sliders,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ChordCadenceWorkbench } from './ChordCadenceWorkbench';
import { AiProgressionSuggester } from './AiProgressionSuggester';

const ALL_KEYS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

export type WorkbenchTabId = 'cadence-251' | 'ai-suggester' | 'vibe-spice';

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
  instrumentTone,
  onInstrumentChange,
  onSelectPreset,
  onOpenCurriculum,
  onOpenFocusMusic,
  lang,
  onToggleLang,
  progressionOptions,
  onSelectProgressionOption,
  onHoverChord,
  onLeaveHover,
  onAuditionChord,
  hoverScrubEnabled = false,
  onToggleHoverScrub,
}) => {
  const [activeWorkbenchTab, setActiveWorkbenchTab] = useState<WorkbenchTabId>('cadence-251');
  const [isWorkbenchOpen, setIsWorkbenchOpen] = useState<boolean>(true);

  return (
    <div className="bg-[#FFFFFF] border border-[#E5DFD7] rounded-2xl p-4 md:p-6 shadow-sm space-y-4">
      {/* Top row: Brand & Studio Tools Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F5F1EB] pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center shadow-xs font-bold text-[#D97706] text-lg">
            <Music2 className="w-4.5 h-4.5 text-[#D97706]" />
          </div>
          <div>
            <h1 className="text-base md:text-lg font-bold tracking-tight text-[#1C1917] flex items-center gap-2 font-serif">
              <span>{t('appTitle', lang)}</span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                Studio 2.0
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
                  ? 'bg-[#FEF3C7] text-[#B45309] border-[#D97706] ring-1 ring-[#D97706]'
                  : 'bg-[#FAF8F5] text-[#78716C] border-[#E5DFD7] hover:text-[#1C1917]'
              }`}
              title={lang === 'vi' ? 'Bật/tắt phát âm nhẹ khi rê chuột qua hợp âm' : 'Toggle audio preview on hover'}
            >
              <Volume2 className={`w-3.5 h-3.5 ${hoverScrubEnabled ? 'text-[#D97706]' : 'text-[#78716C]'}`} />
              <span>{lang === 'vi' ? 'Chạm Nghe' : 'Hover Scrub'}</span>
              <span className={`text-[9px] font-mono font-bold px-1 rounded ${hoverScrubEnabled ? 'bg-[#D97706] text-white' : 'bg-black/5 text-[#78716C]'}`}>
                {hoverScrubEnabled ? 'ON' : 'OFF'}
              </span>
            </button>
          )}

          {/* Instrument Sound Switcher */}
          <div className="flex items-center bg-[#FAF8F5] p-1 rounded-xl border border-[#E5DFD7] text-xs">
            <button
              onClick={() => onInstrumentChange('grand-piano')}
              className={`pressable px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 ${
                instrumentTone === 'grand-piano'
                  ? 'bg-[#D97706] text-white shadow-xs font-bold'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              <Volume2 className="w-3 h-3" />
              {t('grandPiano', lang)}
            </button>
            <button
              onClick={() => onInstrumentChange('warm-rhodes')}
              className={`pressable px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 ${
                instrumentTone === 'warm-rhodes'
                  ? 'bg-[#D97706] text-white shadow-xs font-bold'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              {t('warmRhodes', lang)}
            </button>
          </div>

          {/* Focus Music Mode Button */}
          <button
            onClick={onOpenFocusMusic}
            className="pressable flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0] text-xs font-semibold shadow-xs"
          >
            <Headphones className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Focus Music</span>
          </button>

          {/* Curriculum Drawer Button */}
          <button
            onClick={onOpenCurriculum}
            className="pressable flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F5F1EB] text-[#1C1917] border border-[#E5DFD7] text-xs font-semibold shadow-xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#D97706]" />
            {t('curriculumBtn', lang)}
          </button>

          {/* Language Switcher Pill */}
          <div className="flex items-center bg-[#FAF8F5] p-0.5 rounded-xl border border-[#E5DFD7] text-xs">
            <button
              onClick={() => onToggleLang('vi')}
              className={`px-2 py-0.5 rounded-lg font-bold transition ${
                lang === 'vi' ? 'bg-[#FFFFFF] text-[#1C1917] shadow-xs' : 'text-[#78716C]'
              }`}
            >
              VI
            </button>
            <button
              onClick={() => onToggleLang('en')}
              className={`px-2 py-0.5 rounded-lg font-bold transition flex items-center gap-0.5 ${
                lang === 'en' ? 'bg-[#FFFFFF] text-[#1C1917] shadow-xs' : 'text-[#78716C]'
              }`}
            >
              <Globe className="w-3 h-3" />
              EN
            </button>
          </div>
        </div>
      </div>

      {/* Second row: Progression Input & Key/Transpose controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Input box */}
        <div className="md:col-span-7 flex flex-col gap-1">
          <label className="text-xs font-semibold text-[#78716C] flex items-center justify-between">
            <span>{t('inputLabel', lang)}</span>
            <span className="text-[11px] text-[#D97706] font-medium">{t('inputHint', lang)}</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={rawInput}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder={t('inputPlaceholder', lang)}
              className="w-full bg-[#FAF8F5] border border-[#E5DFD7] rounded-xl px-4 py-2 text-sm md:text-base font-semibold text-[#1C1917] focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] transition shadow-inner font-mono tracking-wider"
            />
          </div>
        </div>

        {/* Key and Transpose */}
        <div className="md:col-span-5 flex flex-wrap items-center gap-2">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-semibold text-[#78716C]">{t('keyRootLabel', lang)}</label>
            <div className="flex items-center gap-1.5">
              <select
                value={keyRoot}
                onChange={(e) => onKeyChange(e.target.value)}
                className="bg-[#FAF8F5] border border-[#E5DFD7] rounded-xl px-3 py-1.5 text-sm font-bold text-[#D97706] focus:outline-none focus:border-[#D97706] flex-1 cursor-pointer font-serif"
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
                className="pressable px-2.5 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#EDE8E1] text-[#1C1917] border border-[#E5DFD7] font-mono font-bold text-xs shadow-xs"
              >
                -1
              </button>
              <button
                onClick={() => onTranspose(1)}
                title="Transpose up 1 semitone"
                className="pressable px-2.5 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#EDE8E1] text-[#1C1917] border border-[#E5DFD7] font-mono font-bold text-xs shadow-xs"
              >
                +1
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Third row: Quick Presets Scroll Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider whitespace-nowrap mr-1">
          {t('presetsLabel', lang)}:
        </span>
        {PRESET_PROGRESSIONS.map((preset) => {
          const isSelected = rawInput.trim() === preset.degreeInput.trim();
          const displayName = lang === 'vi' ? preset.nameVi : preset.nameEn;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`pressable whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-medium transition border flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#FEF3C7] text-[#B45309] border-[#D97706] shadow-xs font-semibold'
                  : 'bg-[#FAF8F5] text-[#57534E] border-[#E5DFD7] hover:border-[#D1C8BD] hover:text-[#1C1917]'
              }`}
            >
              <span>{displayName}</span>
            </button>
          );
        })}
      </div>

      {/* Studio Workbench Header: Segmented Control Tabs */}
      <div className="pt-2 border-t border-[#F5F1EB] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center bg-[#FAF8F5] p-1 rounded-xl border border-[#E5DFD7] text-xs font-semibold gap-1">
          <button
            onClick={() => {
              setActiveWorkbenchTab('cadence-251');
              setIsWorkbenchOpen(true);
            }}
            className={`pressable px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              isWorkbenchOpen && activeWorkbenchTab === 'cadence-251'
                ? 'bg-[#FFFFFF] text-[#92400E] shadow-xs font-bold border border-[#E5DFD7]'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5 text-[#D97706]" />
            <span>{lang === 'vi' ? 'Chèn 2-5-1 & Dãy Hợp Âm' : '2-5-1 Cadence Inserter'}</span>
          </button>

          <button
            onClick={() => {
              setActiveWorkbenchTab('ai-suggester');
              setIsWorkbenchOpen(true);
            }}
            className={`pressable px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              isWorkbenchOpen && activeWorkbenchTab === 'ai-suggester'
                ? 'bg-[#FFFFFF] text-[#92400E] shadow-xs font-bold border border-[#E5DFD7]'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
            <span>{lang === 'vi' ? 'AI 5 Phong Cách' : 'AI 5-Style Options'}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#FEF3C7] text-[#B45309]">
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
                ? 'bg-[#FFFFFF] text-[#92400E] shadow-xs font-bold border border-[#E5DFD7]'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-[#D97706]" />
            <span>{lang === 'vi' ? 'Phong Cách & Gia Vị' : 'Vibe & Spice'}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsWorkbenchOpen((prev) => !prev)}
          className="pressable flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#FAF8F5] text-xs font-semibold text-[#78716C] hover:text-[#1C1917] border border-[#E5DFD7]"
        >
          <span>{isWorkbenchOpen ? (lang === 'vi' ? 'Thu gọn khung công cụ' : 'Collapse workbench') : (lang === 'vi' ? 'Mở khung công cụ' : 'Open workbench')}</span>
          {isWorkbenchOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
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

          {/* TAB 2: AI 5-Style Options */}
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

          {/* TAB 3: Vibe Selector & Spice Level */}
          {activeWorkbenchTab === 'vibe-spice' && (
            <div className="p-4 md:p-5 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD7] shadow-xs space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
                {/* Vibe cards */}
                <div className="lg:col-span-8 flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-[#78716C]">{t('vibeLabel', lang)}</span>
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
                          className={`pressable p-2.5 rounded-xl border text-left transition ${
                            active
                              ? 'bg-[#FEF3C7] border-[#D97706] text-[#1C1917] shadow-xs'
                              : 'bg-[#FFFFFF] border-[#E5DFD7] text-[#78716C] hover:border-[#D1C8BD] hover:text-[#1C1917]'
                          }`}
                        >
                          <div className={`text-xs font-bold font-serif ${active ? 'text-[#B45309]' : 'text-[#1C1917]'}`}>
                            {name}
                          </div>
                          <div className="text-[10px] text-[#78716C] line-clamp-1">{desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Spice Level */}
                <div className="lg:col-span-4 flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-[#78716C]">{t('spiceLevelLabel', lang)}</span>
                  <div className="grid grid-cols-3 gap-1.5 bg-[#FFFFFF] p-1.5 rounded-xl border border-[#E5DFD7]">
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
                              ? 'bg-[#D97706] text-white font-bold shadow-xs'
                              : 'text-[#78716C] hover:text-[#1C1917]'
                          }`}
                        >
                          <div className="text-xs font-semibold">{s.label}</div>
                          <div className="text-[10px] opacity-85">{s.desc}</div>
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
