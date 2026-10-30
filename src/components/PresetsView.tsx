import React from 'react';
import { Language, PresetProgression } from '../types/harmony';
import { PRESET_PROGRESSIONS } from '../data/presetProgressions';
import { Sparkles, Music, ArrowRight, Check } from 'lucide-react';

interface PresetsViewProps {
  lang: Language;
  onSelectPreset: (preset: PresetProgression) => void;
  activeRawInput?: string;
}

export const PresetsView: React.FC<PresetsViewProps> = ({
  lang,
  onSelectPreset,
  activeRawInput = '',
}) => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-[#111a24] border border-[#233547] relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#f59e0b]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[#2b2413] border border-[#4d3c19] flex items-center justify-center text-[#f59e0b]">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#f59e0b]">
              Iconic Harmonic Progressions • 8 Presets
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            {lang === 'vi'
              ? 'Kho Vòng Hợp Âm Mẫu Bất Hủ (Iconic Progressions Library)'
              : 'Iconic Chord Progressions & Hit Song Library'}
          </h1>
          <p className="text-xs md:text-sm text-[#8b9eb0] leading-relaxed">
            {lang === 'vi'
              ? 'Bộ sưu tập 8 vòng hợp âm kinh điển kiến tạo nên các kiệt tác âm nhạc thế giới từ Canon của Pachelbel, Jazz Standards đến V-Pop, R&B và Anime J-Pop.'
              : 'Curated 8 timeless harmonic loops powering global masterpieces from Pachelbel’s Canon and Jazz standards to Billboard hits, Asian Pop, and Anime soundtracks.'}
          </p>
        </div>
      </div>

      {/* 8 Preset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {PRESET_PROGRESSIONS.map((preset) => {
          const isSelected = activeRawInput.trim() === preset.degreeInput.trim();
          const name = lang === 'vi' ? preset.nameVi : preset.nameEn;
          const desc = lang === 'vi' ? preset.descriptionVi : preset.descriptionEn;

          return (
            <div
              key={preset.id}
              className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-4 shadow-xl ${
                isSelected
                  ? 'bg-[#152533] border-[#2dd4bf] shadow-lg shadow-[#2dd4bf]/10'
                  : 'bg-[#111a24] border-[#233547] hover:border-[#334d66]'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#162230] border border-[#233547] flex items-center justify-center text-[#f59e0b]">
                      <Music className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-xs font-mono font-bold text-[#8b9eb0]">
                      Tone {preset.defaultKey}
                    </span>
                  </div>

                  {isSelected && (
                    <span className="px-2 py-0.5 rounded-full bg-[#2dd4bf]/20 text-[#2dd4bf] border border-[#2dd4bf]/40 text-[10px] font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      {lang === 'vi' ? 'Đang chọn' : 'Active'}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {name}
                  </h3>
                  <div className="mt-1 font-mono text-sm font-extrabold text-[#2dd4bf] bg-[#0a0f16] px-3 py-1.5 rounded-lg border border-[#1b2b3a] inline-block">
                    {preset.degreeInput}
                  </div>
                </div>

                <p className="text-xs text-[#8b9eb0] leading-relaxed line-clamp-3">
                  {desc}
                </p>
              </div>

              <div className="pt-3 border-t border-[#1b2b3a] flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#627a8f] uppercase">
                  Vibe: {preset.defaultVibe}
                </span>

                <button
                  onClick={() => onSelectPreset(preset)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    isSelected
                      ? 'bg-[#2dd4bf] text-[#042f2e] shadow-md'
                      : 'bg-[#162230] hover:bg-[#1a2d3b] text-[#d0dee9] hover:text-white border border-[#233547]'
                  }`}
                >
                  <span>{lang === 'vi' ? 'Nạp vào Studio' : 'Load into Studio'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
