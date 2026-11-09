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
      <div className="p-6 md:p-8 rounded-2xl bg-[#FFFFFF] dark:bg-[#121217] border border-[#E5DFD7] dark:border-[#272736] relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D97706]/5 dark:bg-[#F59E0B]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[#FEF3C7] dark:bg-[#251A10] border border-[#FDE68A] dark:border-[#F59E0B]/30 flex items-center justify-center text-[#D97706] dark:text-[#F59E0B]">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#D97706] dark:text-[#F59E0B]">
              Pianolodo Iconic Progressions • 8 Presets
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1C1917] dark:text-[#F4F4F6] tracking-tight">
            {lang === 'vi'
              ? 'Kho Vòng Hợp Âm Mẫu Bất Hủ (Iconic Progressions Library)'
              : 'Iconic Chord Progressions & Hit Song Library'}
          </h1>
          <p className="text-xs md:text-sm text-[#78716C] dark:text-[#9494A6] leading-relaxed">
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
              className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-4 shadow-sm ${
                isSelected
                  ? 'bg-[#FEF3C7]/40 dark:bg-[#1E1B2A] border-[#D97706] dark:border-[#F59E0B] shadow-md shadow-[#D97706]/10 glow-amber'
                  : 'bg-[#FFFFFF] dark:bg-[#161622] border-[#E5DFD7] dark:border-[#272736] hover:border-[#D1C8BD] dark:hover:border-[#38384D]'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#FAF8F5] dark:bg-[#0C0C10] border border-[#E5DFD7] dark:border-[#272736] flex items-center justify-center text-[#D97706] dark:text-[#F59E0B]">
                      <Music className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-xs font-mono font-bold text-[#78716C] dark:text-[#9494A6]">
                      Tone {preset.defaultKey}
                    </span>
                  </div>

                  {isSelected && (
                    <span className="px-2 py-0.5 rounded-full bg-[#FEF3C7] dark:bg-[#251A10] text-[#B45309] dark:text-[#F59E0B] border border-[#FDE68A] dark:border-[#F59E0B]/30 text-[10px] font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      {lang === 'vi' ? 'Đang chọn' : 'Active'}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#1C1917] dark:text-[#F4F4F6] tracking-tight">
                    {name}
                  </h3>
                  <div className="mt-1 font-mono text-sm font-extrabold text-[#D97706] dark:text-[#F59E0B] bg-[#FAF8F5] dark:bg-[#0C0C10] px-3 py-1.5 rounded-lg border border-[#E5DFD7] dark:border-[#272736] inline-block">
                    {preset.degreeInput}
                  </div>
                </div>

                <p className="text-xs text-[#57534E] dark:text-[#9494A6] leading-relaxed line-clamp-3">
                  {desc}
                </p>
              </div>

              <div className="pt-3 border-t border-[#F5F1EB] dark:border-[#272736] flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#A8A29E] dark:text-[#63637E] uppercase">
                  Vibe: {preset.defaultVibe}
                </span>

                <button
                  onClick={() => onSelectPreset(preset)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    isSelected
                      ? 'bg-[#D97706] dark:bg-[#F59E0B] text-white dark:text-[#09090B] shadow-xs'
                      : 'bg-[#FAF8F5] dark:bg-[#181824] hover:bg-[#F5F1EB] dark:hover:bg-[#222232] text-[#1C1917] dark:text-[#F4F4F6] border border-[#E5DFD7] dark:border-[#272736]'
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

export default PresetsView;
