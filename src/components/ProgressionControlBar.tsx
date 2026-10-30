import React from 'react';
import { InstrumentToneType } from '../audio/pianoAudioEngine';
import { PRESET_PROGRESSIONS } from '../data/presetProgressions';
import { PresetProgression, SpiceLevel, VibeId } from '../types/harmony';
import { BookOpen, Sparkles, Volume2 } from 'lucide-react';

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
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 p-4 md:p-6 shadow-xl space-y-5">
      {/* Top row: Title, Tone Switcher, Curriculum Button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 font-bold text-slate-950 text-xl">
            🎹
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Trợ Lý Hòa Thanh & Hợp Âm Màu Piano
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Stage 1 • TDD Verified
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Nâng cấp hợp âm màu • Tự động xếp ngón tay mượt mà (Smooth Voice-Leading) • 100% Offline
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Instrument Sound Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => onInstrumentChange('grand-piano')}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                instrumentTone === 'grand-piano'
                  ? 'bg-amber-500 text-slate-950 shadow font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              Grand Piano
            </button>
            <button
              onClick={() => onInstrumentChange('warm-rhodes')}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                instrumentTone === 'warm-rhodes'
                  ? 'bg-amber-500 text-slate-950 shadow font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Warm Rhodes
            </button>
          </div>

          {/* Curriculum Drawer Button */}
          <button
            onClick={onOpenCurriculum}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition shadow-sm hover:border-slate-600"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            Giáo Trình Thực Chiến
          </button>
        </div>
      </div>

      {/* Second row: Progression Input & Key/Transpose controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Input box */}
        <div className="md:col-span-7 flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-400 flex items-center justify-between">
            <span>Nhập Vòng Hợp Âm (Hỗ trợ cả Bậc số & Tên hợp âm):</span>
            <span className="text-[11px] text-amber-400/80">VD: 2-5-1, 2-6-5-1 hoặc C - Am - Dm - G</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={rawInput}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder="VD: 2 - 5 - 1 hoặc C - Am - Dm - G"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm md:text-base font-semibold text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition shadow-inner font-mono tracking-wider"
            />
          </div>
        </div>

        {/* Key and Transpose */}
        <div className="md:col-span-5 flex flex-wrap items-center gap-2">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-semibold text-slate-400">Giọng Chủ (Key Tone):</label>
            <div className="flex items-center gap-1.5">
              <select
                value={keyRoot}
                onChange={(e) => onKeyChange(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-amber-400 focus:outline-none focus:border-amber-500 flex-1"
              >
                {ALL_KEYS.map((k) => (
                  <option key={k} value={k}>
                    Tone {k} Major
                  </option>
                ))}
              </select>

              <button
                onClick={() => onTranspose(-1)}
                title="Dịch giọng xuống 1/2 cung (-1 semitone)"
                className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono font-bold text-xs transition"
              >
                -1
              </button>
              <button
                onClick={() => onTranspose(1)}
                title="Dịch giọng lên 1/2 cung (+1 semitone)"
                className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono font-bold text-xs transition"
              >
                +1
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Third row: 8 One-Click Presets */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Vòng Hòa Thanh Mẫu Nổi Tiếng:
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {PRESET_PROGRESSIONS.map((preset) => {
            const isSelected = rawInput.trim() === preset.degreeInput.trim();
            return (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition border flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/50 shadow-sm font-semibold'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                <span>{preset.nameVi}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fourth row: Vibe Selector & Spice Level */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center pt-1 border-t border-slate-800/60">
        {/* Vibe cards */}
        <div className="lg:col-span-8 flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-slate-400">Chọn Màu Sắc Cảm Xúc (Vibe):</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'pop-ballad', label: 'Pop Ballad', desc: 'Dịu dàng, trong sáng' },
              { id: 'rnb-neosoul', label: 'R&B / Neo-Soul', desc: 'Ấm áp, dày dặn, mượt' },
              { id: 'jazz-bossa', label: 'Jazz & Bossa', desc: 'Sang trọng, hoa mỹ' },
              { id: 'cinematic-sad', label: 'Cinematic / Sad', desc: 'U uất, xé lòng' },
            ].map((v) => {
              const active = vibe === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => onVibeChange(v.id as VibeId)}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    active
                      ? 'bg-amber-500/10 border-amber-500 text-white shadow-md shadow-amber-500/5'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className={`text-xs font-bold ${active ? 'text-amber-400' : 'text-slate-300'}`}>
                    {v.label}
                  </div>
                  <div className="text-[10px] text-slate-400 line-clamp-1">{v.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Spice Level */}
        <div className="lg:col-span-4 flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-slate-400">Độ Pha Màu (Spice Level):</span>
          <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            {[
              { level: 1 as SpiceLevel, label: 'Level 1', desc: 'Tinh tế' },
              { level: 2 as SpiceLevel, label: 'Level 2', desc: 'Mượt (+Cầu)' },
              { level: 3 as SpiceLevel, label: 'Level 3', desc: 'Đậm đặc' },
            ].map((s) => {
              const active = spiceLevel === s.level;
              return (
                <button
                  key={s.level}
                  onClick={() => onSpiceChange(s.level)}
                  className={`py-2 px-1.5 rounded-lg text-center transition ${
                    active
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-white'
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
    </header>
  );
};
