import React from 'react';
import { InstrumentToneType } from '../audio/pianoAudioEngine';
import { PRESET_PROGRESSIONS } from '../data/presetProgressions';
import { Language, PresetProgression, SpiceLevel, VibeId } from '../types/harmony';
import { VIBE_PROFILES } from '../data/curriculum';
import { t } from '../i18n/translations';
import { BookOpen, Headphones, Sparkles, Volume2, Globe, Music2 } from 'lucide-react';

const ALL_KEYS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

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
}) => {
  return (
    <div className="bg-[#FFFFFF] border border-[#E5DFD7] rounded-2xl p-4 md:p-6 shadow-sm space-y-5">
      {/* Top row: Title, Tone Switcher, Language Switcher, Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F5F1EB] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center shadow-xs font-bold text-[#D97706] text-xl">
            <Music2 className="w-5 h-5 text-[#D97706]" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-extrabold tracking-tight text-[#1C1917] flex items-center gap-2">
              <span>{t('appTitle', lang)}</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#D97706]/15 text-[#B45309] border border-[#D97706]/30">
                {t('badgeStage1', lang)}
              </span>
            </h1>
            <p className="text-xs text-[#78716C]">
              {t('appSubtitle', lang)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Language Switcher Pill */}
          <div className="flex items-center bg-[#FAF8F5] p-1 rounded-xl border border-[#E5DFD7] text-xs">
            <button
              onClick={() => onToggleLang('vi')}
              className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                lang === 'vi'
                  ? 'bg-[#FFFFFF] text-[#1C1917] shadow-xs'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              🇻🇳 VI
            </button>
            <button
              onClick={() => onToggleLang('en')}
              className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                lang === 'en'
                  ? 'bg-[#FFFFFF] text-[#1C1917] shadow-xs'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              <Globe className="w-3 h-3" />
              EN
            </button>
          </div>

          {/* Instrument Sound Switcher */}
          <div className="flex items-center bg-[#FAF8F5] p-1 rounded-xl border border-[#E5DFD7] text-xs">
            <button
              onClick={() => onInstrumentChange('grand-piano')}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                instrumentTone === 'grand-piano'
                  ? 'bg-[#D97706] text-white shadow-xs font-bold'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              {t('grandPiano', lang)}
            </button>
            <button
              onClick={() => onInstrumentChange('warm-rhodes')}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                instrumentTone === 'warm-rhodes'
                  ? 'bg-[#D97706] text-white shadow-xs font-bold'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {t('warmRhodes', lang)}
            </button>
          </div>

          {/* Focus Music Mode Button */}
          <button
            onClick={onOpenFocusMusic}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0] text-xs font-semibold transition shadow-xs"
          >
            <Headphones className="w-4 h-4 text-[#16A34A]" />
            <span>{lang === 'vi' ? 'Focus Music (Nhạc Tập Trung)' : 'Deep Focus Mode'}</span>
          </button>

          {/* Curriculum Drawer Button */}
          <button
            onClick={onOpenCurriculum}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F5F1EB] text-[#1C1917] border border-[#E5DFD7] text-xs font-semibold transition shadow-xs"
          >
            <BookOpen className="w-4 h-4 text-[#D97706]" />
            {t('curriculumBtn', lang)}
          </button>
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
              className="w-full bg-[#FAF8F5] border border-[#E5DFD7] rounded-xl px-4 py-2.5 text-sm md:text-base font-semibold text-[#1C1917] focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] transition shadow-inner font-mono tracking-wider"
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
                className="bg-[#FAF8F5] border border-[#E5DFD7] rounded-xl px-3 py-2 text-sm font-bold text-[#D97706] focus:outline-none focus:border-[#D97706] flex-1 cursor-pointer"
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
                className="px-2.5 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#EDE8E1] text-[#1C1917] border border-[#E5DFD7] font-mono font-bold text-xs transition"
              >
                -1
              </button>
              <button
                onClick={() => onTranspose(1)}
                title="Transpose up 1 semitone"
                className="px-2.5 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#EDE8E1] text-[#1C1917] border border-[#E5DFD7] font-mono font-bold text-xs transition"
              >
                +1
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Third row: 8 One-Click Presets */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-semibold text-[#78716C] uppercase tracking-wider">
          {t('presetsLabel', lang)}
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {PRESET_PROGRESSIONS.map((preset) => {
            const isSelected = rawInput.trim() === preset.degreeInput.trim();
            const displayName = lang === 'vi' ? preset.nameVi : preset.nameEn;
            return (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition border flex items-center gap-1.5 ${
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
      </div>

      {/* Fourth row: Vibe Selector & Spice Level */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center pt-2 border-t border-[#F5F1EB]">
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
                  className={`p-2.5 rounded-xl border text-left transition ${
                    active
                      ? 'bg-[#FEF3C7] border-[#D97706] text-[#1C1917] shadow-xs'
                      : 'bg-[#FAF8F5] border-[#E5DFD7] text-[#78716C] hover:border-[#D1C8BD] hover:text-[#1C1917]'
                  }`}
                >
                  <div className={`text-xs font-bold ${active ? 'text-[#B45309]' : 'text-[#1C1917]'}`}>
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
          <div className="grid grid-cols-3 gap-1.5 bg-[#FAF8F5] p-1.5 rounded-xl border border-[#E5DFD7]">
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
                  className={`py-2 px-1.5 rounded-lg text-center transition ${
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
  );
};
