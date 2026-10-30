import React, { useState } from 'react';
import { Language, ProgressionOption } from '../types/harmony';
import { Sparkles, Play, Square, Check, ChevronDown, ChevronUp, ShieldCheck, Heart, ArrowRight } from 'lucide-react';
import { pianoAudioEngine } from '../audio/pianoAudioEngine';

interface AiProgressionSuggesterProps {
  options: ProgressionOption[];
  onSelectOption: (option: ProgressionOption) => void;
  lang: Language;
  currentRawInput: string;
}

export const AiProgressionSuggester: React.FC<AiProgressionSuggesterProps> = ({
  options,
  onSelectOption,
  lang,
  currentRawInput,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [auditioningId, setAuditioningId] = useState<string | null>(null);

  if (!options || options.length === 0) return null;

  const handleAudition = (opt: ProgressionOption) => {
    if (auditioningId === opt.id) {
      pianoAudioEngine.stopPlayback();
      setAuditioningId(null);
      return;
    }

    setAuditioningId(opt.id);
    pianoAudioEngine.playProgression(
      opt.progressionState.reharmonizedChords,
      'ballad-arpeggio',
      85,
      () => {},
      () => {
        setAuditioningId(null);
      }
    );
  };

  const handleApply = (opt: ProgressionOption) => {
    pianoAudioEngine.stopPlayback();
    setAuditioningId(null);
    onSelectOption(opt);
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#E5DFD7] rounded-2xl shadow-sm overflow-hidden transition-all duration-200">
      {/* Header Banner */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 md:p-5 flex items-center justify-between cursor-pointer select-none bg-gradient-to-r from-[#FAF8F5] to-[#FFFFFF] hover:bg-[#FAF8F5] transition border-b border-[#F5F1EB]"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#D97706] shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm md:text-base font-extrabold text-[#1C1917] tracking-tight">
                {lang === 'vi'
                  ? '✨ AI Đề Xuất Các Phương Án Hòa Thanh (AI Progression Options)'
                  : '✨ AI Harmonic Reharmonization & Progression Options'}
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
                {options.length} {lang === 'vi' ? 'Phương Án' : 'Options'}
              </span>
            </div>
            <p className="text-xs text-[#78716C] mt-0.5 hidden sm:block">
              {lang === 'vi'
                ? 'Dựa trên chuỗi hợp âm bạn vừa nhập, AI tính toán sẵn các phương án reharmonize theo từng phong cách âm nhạc:'
                : 'Based on your chord input, AI computed diverse reharmonizations across musical styles:'}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F5F1EB] text-xs font-semibold text-[#1C1917] border border-[#E5DFD7] transition shadow-xs"
        >
          <span>{isExpanded ? (lang === 'vi' ? 'Thu gọn' : 'Collapse') : (lang === 'vi' ? 'Mở rộng' : 'Expand')}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expandable Options Cards Grid */}
      {isExpanded && (
        <div className="p-4 md:p-6 bg-[#FAF8F5] space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {options.map((opt) => {
              const isAuditioning = auditioningId === opt.id;
              const isCurrentlyActive = currentRawInput.trim() === opt.formula.trim();
              const title = lang === 'vi' ? opt.titleVi : opt.titleEn;
              const badge = lang === 'vi' ? opt.badgeVi : opt.badgeEn;
              const rationale = lang === 'vi' ? opt.rationaleVi : opt.rationaleEn;
              const emotion = lang === 'vi' ? opt.emotionTagVi : opt.emotionTagEn;

              return (
                <div
                  key={opt.id}
                  className={`p-4 md:p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-3.5 shadow-xs ${
                    isCurrentlyActive
                      ? 'bg-[#FEF3C7]/40 border-[#D97706] shadow-sm'
                      : 'bg-[#FFFFFF] border-[#E5DFD7] hover:border-[#D1C8BD]'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top Row: Genre Badge + Smoothness Score */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FAF8F5] border border-[#E5DFD7] text-[#D97706]">
                        {badge}
                      </span>

                      <div className="flex items-center gap-1 text-[11px] font-semibold text-[#10B981]">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{opt.smoothnessScore}% {lang === 'vi' ? 'Mượt' : 'Smooth'}</span>
                      </div>
                    </div>

                    {/* Option Title */}
                    <h4 className="text-sm font-bold text-[#1C1917] tracking-tight">
                      {title}
                    </h4>

                    {/* Chord Flow Display */}
                    <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DFD7] font-mono text-xs font-bold text-[#D97706] tracking-wide break-words">
                      {opt.chordsSummary}
                    </div>

                    {/* Roman Degrees formula */}
                    <div className="text-[11px] font-mono text-[#78716C] flex items-center justify-between">
                      <span>Bậc / Degree: <strong className="text-[#1C1917]">{opt.formula}</strong></span>
                      <span className="text-rose-600 flex items-center gap-1">
                        <Heart className="w-3 h-3 fill-current" />
                        <span>{emotion}</span>
                      </span>
                    </div>

                    {/* Rationale explanation */}
                    <p className="text-xs text-[#57534E] leading-relaxed line-clamp-3">
                      {rationale}
                    </p>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-[#F5F1EB] flex items-center justify-between gap-2">
                    {/* Audition Button */}
                    <button
                      type="button"
                      onClick={() => handleAudition(opt)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                        isAuditioning
                          ? 'bg-rose-600 text-white shadow-xs animate-pulse'
                          : 'bg-[#FAF8F5] hover:bg-[#F5F1EB] text-[#1C1917] border border-[#E5DFD7]'
                      }`}
                    >
                      {isAuditioning ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-current" />
                          <span>{lang === 'vi' ? 'Dừng' : 'Stop'}</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 text-[#D97706]" />
                          <span>{lang === 'vi' ? 'Nghe thử' : 'Audition'}</span>
                        </>
                      )}
                    </button>

                    {/* Apply Button */}
                    <button
                      type="button"
                      onClick={() => handleApply(opt)}
                      disabled={isCurrentlyActive}
                      className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
                        isCurrentlyActive
                          ? 'bg-[#E5DFD7] text-[#78716C] cursor-default'
                          : 'bg-[#D97706] hover:bg-[#B45309] text-white shadow-md shadow-[#D97706]/20'
                      }`}
                    >
                      {isCurrentlyActive ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>{lang === 'vi' ? 'Đang chọn' : 'Active'}</span>
                        </>
                      ) : (
                        <>
                          <span>{lang === 'vi' ? 'Áp dụng' : 'Apply'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
