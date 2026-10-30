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
    <div className="bg-[#111a24] border border-[#233547] rounded-2xl p-4 md:p-6 shadow-2xl space-y-5">
      {/* Top row: Title, Tone Switcher, Language Switcher, Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1b2b3a] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#162f36] border border-[#234d54] flex items-center justify-center shadow-lg shadow-[#2dd4bf]/10 font-bold text-[#2dd4bf] text-xl">
            <Music2 className="w-5 h-5 text-[#2dd4bf]" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <span>{t('appTitle', lang)}</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#2dd4bf]/20 text-[#2dd4bf] border border-[#2dd4bf]/30">
                {t('badgeStage1', lang)}
              </span>
            </h1>
            <p className="text-xs text-[#8b9eb0]">
              {t('appSubtitle', lang)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Language Switcher Pill */}
          <div className="flex items-center bg-[#0a0f16] p-1 rounded-xl border border-[#233547] text-xs">
            <button
              onClick={() => onToggleLang('vi')}
              className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                lang === 'vi'
                  ? 'bg-[#2dd4bf] text-[#042f2e] shadow'
                  : 'text-[#8b9eb0] hover:text-white'
              }`}
            >
              🇻🇳 VI
            </button>
            <button
              onClick={() => onToggleLang('en')}
              className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                lang === 'en'
                  ? 'bg-[#2dd4bf] text-[#042f2e] shadow'
                  : 'text-[#8b9eb0] hover:text-white'
              }`}
            >
              <Globe className="w-3 h-3" />
              EN
            </button>
          </div>

          {/* Instrument Sound Switcher */}
          <div className="flex items-center bg-[#0a0f16] p-1 rounded-xl border border-[#233547] text-xs">
            <button
              onClick={() => onInstrumentChange('grand-piano')}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                instrumentTone === 'grand-piano'
                  ? 'bg-[#2dd4bf] text-[#042f2e] shadow font-bold'
                  : 'text-[#8b9eb0] hover:text-white'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              {t('grandPiano', lang)}
            </button>
            <button
              onClick={() => onInstrumentChange('warm-rhodes')}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                instrumentTone === 'warm-rhodes'
                  ? 'bg-[#2dd4bf] text-[#042f2e] shadow font-bold'
                  : 'text-[#8b9eb0] hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {t('warmRhodes', lang)}
            </button>
          </div>

          {/* Focus Music Mode Button */}
          <button
            onClick={onOpenFocusMusic}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/50 text-xs font-semibold transition shadow-sm"
          >
            <Headphones className="w-4 h-4 text-indigo-400" />
            <span>{lang === 'vi' ? 'Focus Music (Nhạc Tập Trung)' : 'Deep Focus Mode'}</span>
          </button>

          {/* Curriculum Drawer Button */}
          <button
            onClick={onOpenCurriculum}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#162230] hover:bg-[#1a2d3b] text-slate-200 border border-[#233547] text-xs font-semibold transition shadow-sm hover:border-[#334d66]"
          >
            <BookOpen className="w-4 h-4 text-[#f59e0b]" />
            {t('curriculumBtn', lang)}
          </button>
        </div>
      </div>

      {/* Second row: Progression Input & Key/Transpose controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Input box */}
        <div className="md:col-span-7 flex flex-col gap-1">
          <label className="text-xs font-semibold text-[#8b9eb0] flex items-center justify-between">
            <span>{t('inputLabel', lang)}</span>
            <span className="text-[11px] text-[#2dd4bf]/80">{t('inputHint', lang)}</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={rawInput}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder={t('inputPlaceholder', lang)}
              className="w-full bg-[#0a0f16] border border-[#233547] rounded-xl px-4 py-2.5 text-sm md:text-base font-semibold text-white focus:outline-none focus:border-[#2dd4bf] focus:ring-1 focus:ring-[#2dd4bf] transition shadow-inner font-mono tracking-wider"
            />
          </div>
        </div>

        {/* Key and Transpose */}
        <div className="md:col-span-5 flex flex-wrap items-center gap-2">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-semibold text-[#8b9eb0]">{t('keyRootLabel', lang)}</label>
            <div className="flex items-center gap-1.5">
              <select
                value={keyRoot}
                onChange={(e) => onKeyChange(e.target.value)}
                className="bg-[#0a0f16] border border-[#233547] rounded-xl px-3 py-2 text-sm font-bold text-[#f59e0b] focus:outline-none focus:border-[#2dd4bf] flex-1"
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
                className="px-2.5 py-2 rounded-xl bg-[#162230] hover:bg-[#1a2d3b] text-slate-200 border border-[#233547] font-mono font-bold text-xs transition"
              >
                -1
              </button>
              <button
                onClick={() => onTranspose(1)}
                title="Transpose up 1 semitone"
                className="px-2.5 py-2 rounded-xl bg-[#162230] hover:bg-[#1a2d3b] text-slate-200 border border-[#233547] font-mono font-bold text-xs transition"
              >
                +1
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Third row: 8 One-Click Presets */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-semibold text-[#8b9eb0] uppercase tracking-wider">
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
                    ? 'bg-[#162f36] text-[#2dd4bf] border-[#2dd4bf] shadow-sm font-semibold'
                    : 'bg-[#0a0f16] text-[#8b9eb0] border-[#233547] hover:border-[#334d66] hover:text-white'
                }`}
              >
                <span>{displayName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fourth row: Vibe Selector & Spice Level */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center pt-2 border-t border-[#1b2b3a]">
        {/* Vibe cards */}
        <div className="lg:col-span-8 flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-[#8b9eb0]">{t('vibeLabel', lang)}</span>
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
                      ? 'bg-[#162f36] border-[#2dd4bf] text-white shadow-md shadow-[#2dd4bf]/10'
                      : 'bg-[#0a0f16] border-[#233547] text-[#8b9eb0] hover:border-[#334d66] hover:text-slate-200'
                  }`}
                >
                  <div className={`text-xs font-bold ${active ? 'text-[#2dd4bf]' : 'text-[#8b9eb0]'}`}>
                    {name}
                  </div>
                  <div className="text-[10px] text-[#627a8f] line-clamp-1">{desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Spice Level */}
        <div className="lg:col-span-4 flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-[#8b9eb0]">{t('spiceLevelLabel', lang)}</span>
          <div className="grid grid-cols-3 gap-1.5 bg-[#0a0f16] p-1.5 rounded-xl border border-[#233547]">
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
                      ? 'bg-[#2dd4bf] text-[#042f2e] font-bold shadow'
                      : 'text-[#8b9eb0] hover:text-white'
                  }`}
                >
                  <div className="text-xs font-semibold">{s.label}</div>
                  <div className="text-[10px] opacity-80">{s.desc}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
