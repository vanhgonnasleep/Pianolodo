import React, { useState } from 'react';
import { Language, ProgressionOption, VoicedChord } from '../types/harmony';
import { Sparkles, Play, Square, Check, ChevronDown, ChevronUp, ShieldCheck, Heart, ArrowRight } from 'lucide-react';
import { pianoAudioEngine } from '../audio/pianoAudioEngine';
import { MiniPianoPopover } from './MiniPianoPopover';

interface AiProgressionSuggesterProps {
  options: ProgressionOption[];
  onSelectOption: (option: ProgressionOption) => void;
  lang: Language;
  currentRawInput: string;
  onHoverChord?: (chord: VoicedChord, multiChords?: VoicedChord[], label?: string) => void;
  onLeaveHover?: () => void;
  onAuditionChord?: (chord: VoicedChord | null, multiChords?: VoicedChord[]) => void;
}

export const AiProgressionSuggester: React.FC<AiProgressionSuggesterProps> = ({
  options,
  onSelectOption,
  lang,
  currentRawInput,
  onHoverChord,
  onLeaveHover,
  onAuditionChord,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [auditioningId, setAuditioningId] = useState<string | null>(null);
  const [hoveredOptId, setHoveredOptId] = useState<string | null>(null);

  if (!options || options.length === 0) return null;

  const handleAudition = (opt: ProgressionOption) => {
    if (auditioningId === opt.id) {
      pianoAudioEngine.stopPlayback();
      setAuditioningId(null);
      onAuditionChord?.(null);
      return;
    }

    setAuditioningId(opt.id);
    const chords = opt.progressionState.reharmonizedChords;
    if (chords[0]) {
      onAuditionChord?.(chords[0], chords);
    }

    pianoAudioEngine.playProgression(
      chords,
      'ballad-arpeggio',
      85,
      (idx) => {
        if (chords[idx]) {
          onAuditionChord?.(chords[idx], chords);
        }
      },
      () => {
        setAuditioningId(null);
        onAuditionChord?.(null);
      }
    );
  };

  const handleApply = (opt: ProgressionOption) => {
    pianoAudioEngine.stopPlayback();
    setAuditioningId(null);
    onAuditionChord?.(null);
    onSelectOption(opt);
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#E5DFD7] rounded-2xl shadow-sm overflow-visible transition-all duration-200">
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
              <h3 className="text-sm md:text-base font-bold text-[#1C1917] tracking-tight font-serif">
                {lang === 'vi'
                  ? 'AI Đề Xuất Các Phương Án Hòa Thanh (AI Progression Options)'
                  : 'AI Harmonic Reharmonization & Progression Options'}
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
                {options.length} {lang === 'vi' ? 'Phương Án' : 'Options'}
              </span>
            </div>
            <p className="text-xs text-[#78716C] mt-0.5 hidden sm:block">
              {lang === 'vi'
                ? 'Rê chuột để soi phím đàn; AI tự động tính toán các phương án reharmonize theo từng phong cách âm nhạc:'
                : 'Hover to preview voicings; AI computed diverse reharmonizations across musical styles:'}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="pressable flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F5F1EB] text-xs font-semibold text-[#1C1917] border border-[#E5DFD7] shadow-xs"
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
              const isHovered = hoveredOptId === opt.id;
              const title = lang === 'vi' ? opt.titleVi : opt.titleEn;
              const badge = lang === 'vi' ? opt.badgeVi : opt.badgeEn;
              const rationale = lang === 'vi' ? opt.rationaleVi : opt.rationaleEn;
              const emotion = lang === 'vi' ? opt.emotionTagVi : opt.emotionTagEn;
              const firstChord = opt.progressionState.reharmonizedChords[0];

              return (
                <div
                  key={opt.id}
                  onMouseEnter={() => {
                    setHoveredOptId(opt.id);
                    if (firstChord) {
                      onHoverChord?.(firstChord, opt.progressionState.reharmonizedChords, title);
                    }
                  }}
                  onMouseLeave={() => {
                    setHoveredOptId(null);
                    onLeaveHover?.();
                  }}
                  className={`relative rounded-2xl p-4 md:p-5 border transition-all duration-200 flex flex-col justify-between gap-4 ${
                    isCurrentlyActive
                      ? 'bg-[#FEF3C7] border-[#D97706] shadow-md ring-2 ring-[#D97706]/30'
                      : 'bg-[#FFFFFF] border-[#E5DFD7] hover:border-[#D97706]/50 shadow-xs'
                  }`}
                >
                  {/* Hover Multi-Chord Popover */}
                  {isHovered && firstChord && (
                    <MiniPianoPopover
                      chord={firstChord}
                      multiChords={opt.progressionState.reharmonizedChords}
                      align="top"
                      className="left-0"
                    />
                  )}

                  {/* Card Header: Style Badge + Smoothness */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#FAF8F5] text-[#D97706] border border-[#E5DFD7]">
                        {badge}
                      </span>
                      <div className="flex items-center gap-1 text-xs font-mono font-bold text-[#10B981]">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{opt.smoothnessScore}%</span>
                      </div>
                    </div>

                    <h4 className="text-base font-bold text-[#1C1917] tracking-tight font-serif">
                      {title}
                    </h4>

                    {/* Progression Summary Flow */}
                    <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#F5F1EB] space-y-1">
                      <div className="text-xs font-semibold text-[#78716C] uppercase tracking-wider">
                        {lang === 'vi' ? 'Chuỗi Hợp Âm Thực Tế:' : 'Voiced Progression:'}
                      </div>
                      <div className="text-sm font-mono font-bold text-[#D97706] truncate">
                        {opt.chordsSummary}
                      </div>
                      <div className="text-xs font-mono text-[#A8A29E]">
                        ({opt.formula})
                      </div>
                    </div>

                    {/* Musical Rationale */}
                    <p className="text-xs md:text-sm text-[#57534E] leading-relaxed line-clamp-3">
                      {rationale}
                    </p>

                    {/* Emotion Tag */}
                    <div className="flex items-center gap-1.5 text-xs text-[#78716C] font-medium pt-1">
                      <Heart className="w-3.5 h-3.5 text-[#D97706]" />
                      <span>{emotion}</span>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="pt-3 border-t border-[#F5F1EB] flex items-center justify-between gap-2">
                    {/* Audition Button */}
                    <button
                      type="button"
                      onClick={() => handleAudition(opt)}
                      className={`pressable flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs md:text-sm font-semibold border transition ${
                        isAuditioning
                          ? 'bg-[#DC2626] text-white border-[#DC2626] shadow-xs'
                          : 'bg-[#FAF8F5] hover:bg-[#F5F1EB] text-[#1C1917] border-[#E5DFD7]'
                      }`}
                      title={lang === 'vi' ? 'Nghe thử vòng hòa thanh' : 'Audition chord progression'}
                    >
                      {isAuditioning ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-current" />
                          <span>{lang === 'vi' ? 'Dừng' : 'Stop'}</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current text-[#D97706]" />
                          <span>{lang === 'vi' ? 'Nghe' : 'Play'}</span>
                        </>
                      )}
                    </button>

                    {/* Apply Button */}
                    <button
                      type="button"
                      disabled={isCurrentlyActive}
                      onClick={() => handleApply(opt)}
                      className={`pressable flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs md:text-sm font-bold transition shadow-xs ${
                        isCurrentlyActive
                          ? 'bg-[#10B981] text-white cursor-default'
                          : 'bg-[#D97706] hover:bg-[#B45309] text-white'
                      }`}
                    >
                      {isCurrentlyActive ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>{lang === 'vi' ? 'Đang áp dụng' : 'Active in Studio'}</span>
                        </>
                      ) : (
                        <>
                          <span>{lang === 'vi' ? 'Áp Dụng' : 'Apply to Studio'}</span>
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
