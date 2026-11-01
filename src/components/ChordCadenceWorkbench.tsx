import React, { useState, useMemo } from 'react';
import { CadenceOption, Language, VoicedChord } from '../types/harmony';
import {
  generateCadenceOptions,
  splitInputTokens,
  joinInputTokens,
} from '../engine/cadenceGenerator';
import { buildProgressionState } from '../engine/reharmonizer';
import { pianoAudioEngine } from '../audio/pianoAudioEngine';
import { MiniPianoPopover } from './MiniPianoPopover';
import {
  Play,
  Square,
  Plus,
  X,
  Undo2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Target,
  Wand2,
} from 'lucide-react';

interface ChordCadenceWorkbenchProps {
  rawInput: string;
  onInputChange: (newInput: string) => void;
  keyRoot: string;
  lang: Language;
  onHoverChord?: (chord: VoicedChord, multiChords?: VoicedChord[], label?: string) => void;
  onLeaveHover?: () => void;
  onAuditionChord?: (chord: VoicedChord | null, multiChords?: VoicedChord[]) => void;
}

export const ChordCadenceWorkbench: React.FC<ChordCadenceWorkbenchProps> = ({
  rawInput,
  onInputChange,
  keyRoot,
  lang,
  onHoverChord,
  onLeaveHover,
  onAuditionChord,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [selectedChordIndex, setSelectedChordIndex] = useState<number>(0);
  const [newChordText, setNewChordText] = useState<string>('');
  const [undoHistory, setUndoHistory] = useState<string[]>([]);
  const [auditioningId, setAuditioningId] = useState<string | null>(null);

  // Local state for tracking hover popovers
  const [hoveredTokenIdx, setHoveredTokenIdx] = useState<number | null>(null);
  const [hoveredCadenceId, setHoveredCadenceId] = useState<string | null>(null);

  const tokens = splitInputTokens(rawInput);
  const safeIndex =
    tokens.length > 0 ? Math.max(0, Math.min(selectedChordIndex, tokens.length - 1)) : 0;
  const activeTargetToken = tokens[safeIndex] || '1';

  // Compute voiced chords for each input token for instant previewing
  const tokenVoicedMap = useMemo(() => {
    const map = new Map<number, VoicedChord>();
    tokens.forEach((t, i) => {
      try {
        const state = buildProgressionState(t, 'pop-ballad', 1, keyRoot);
        if (state.reharmonizedChords[0]) {
          map.set(i, state.reharmonizedChords[0]);
        }
      } catch {
        // Fallback gracefully
      }
    });
    return map;
  }, [tokens, keyRoot]);

  // Compute cadence options for current target index
  const cadenceOptions = useMemo(
    () => generateCadenceOptions(rawInput, safeIndex, keyRoot),
    [rawInput, safeIndex, keyRoot]
  );

  const handleApplyAction = (newFormula: string) => {
    pianoAudioEngine.stopPlayback();
    setAuditioningId(null);
    onAuditionChord?.(null);
    setUndoHistory((prev) => [...prev, rawInput]);
    onInputChange(newFormula);
  };

  const handleUndo = () => {
    if (undoHistory.length === 0) return;
    const previous = undoHistory[undoHistory.length - 1];
    setUndoHistory((prev) => prev.slice(0, -1));
    onInputChange(previous);
  };

  const handleAddChord = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newChordText.trim();
    if (!trimmed) return;
    const newTokens = [...tokens, trimmed];
    setUndoHistory((prev) => [...prev, rawInput]);
    onInputChange(joinInputTokens(newTokens));
    setNewChordText('');
    setSelectedChordIndex(newTokens.length - 1);
  };

  const handleRemoveChord = (idxToRemove: number) => {
    if (tokens.length <= 1) return;
    const newTokens = tokens.filter((_, idx) => idx !== idxToRemove);
    setUndoHistory((prev) => [...prev, rawInput]);
    onInputChange(joinInputTokens(newTokens));
    if (safeIndex >= newTokens.length) {
      setSelectedChordIndex(Math.max(0, newTokens.length - 1));
    }
  };

  const handleAudition = (opt: CadenceOption) => {
    if (auditioningId === opt.id) {
      pianoAudioEngine.stopPlayback();
      setAuditioningId(null);
      onAuditionChord?.(null);
      return;
    }

    setAuditioningId(opt.id);
    onAuditionChord?.(opt.previewChords[0], opt.previewChords);

    pianoAudioEngine.playProgression(
      opt.previewChords,
      'ballad-arpeggio',
      85,
      (idx) => {
        if (opt.previewChords[idx]) {
          onAuditionChord?.(opt.previewChords[idx], opt.previewChords);
        }
      },
      () => {
        setAuditioningId(null);
        onAuditionChord?.(null);
      }
    );
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#E5DFD7] rounded-2xl shadow-sm overflow-visible transition-all duration-200">
      {/* Workbench Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3.5 md:p-4.5 flex items-center justify-between cursor-pointer select-none bg-gradient-to-r from-[#FAF8F5] to-[#FFFFFF] hover:bg-[#FAF8F5] border-b border-[#F5F1EB] transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#D97706] shadow-xs">
            <Wand2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs md:text-sm font-bold text-[#1C1917] tracking-tight flex items-center gap-1.5 font-serif">
                <span>
                  {lang === 'vi'
                    ? 'Liệt Kê Hợp Âm & Áp Dụng 2-5-1 / Hòa Thanh Vào Input'
                    : 'Interactive Chord List & Apply 2-5-1 Cadences to Input'}
                </span>
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                {tokens.length} {lang === 'vi' ? 'Hợp âm' : 'Chords'}
              </span>
            </div>
            <p className="text-[11px] text-[#78716C] mt-0.5 hidden sm:block">
              {lang === 'vi'
                ? 'Rê chuột để xem trước thế bấm; bấm chọn hợp âm bất kỳ để tính toán và chèn các vòng 2-5-1, Tritone Sub, Backdoor.'
                : 'Hover to preview voicings; click any chord to compute and inject 2-5-1, Tritone Sub, and Backdoor cadences.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {undoHistory.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleUndo();
              }}
              className="pressable flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#F5F1EB] text-xs font-semibold text-[#B45309] border border-[#FDE68A] shadow-xs"
              title={lang === 'vi' ? 'Hoàn tác thay đổi vừa áp dụng' : 'Undo last applied change'}
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>{lang === 'vi' ? 'Hoàn tác' : 'Undo'}</span>
            </button>
          )}

          <button
            type="button"
            className="pressable flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF8F5] text-xs font-semibold text-[#1C1917] border border-[#E5DFD7] shadow-xs"
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 md:p-5 bg-[#FAF8F5] space-y-4">
          {/* 1. Interactive Chord Chips Bar */}
          <div className="bg-[#FFFFFF] p-3 md:p-4 rounded-xl border border-[#E5DFD7] shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[#D97706]" />
                <span>
                  {lang === 'vi'
                    ? '1. Danh sách hợp âm trong Input (Click để chọn đích dẫn lối, Rê chuột để soi phím):'
                    : '1. Input Chords List (Click to select target destination, Hover to preview):'}
                </span>
              </span>
              <span className="text-[11px] font-medium text-[#78716C]">
                {lang === 'vi' ? 'Đích hiện tại:' : 'Active Target:'}{' '}
                <strong className="text-[#D97706] font-mono">[{activeTargetToken}]</strong>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {tokens.map((token, idx) => {
                const isSelected = idx === safeIndex;
                const voiced = tokenVoicedMap.get(idx);
                const isHovered = hoveredTokenIdx === idx;

                return (
                  <div
                    key={`${token}-${idx}`}
                    onClick={() => setSelectedChordIndex(idx)}
                    onMouseEnter={() => {
                      setHoveredTokenIdx(idx);
                      if (voiced) {
                        onHoverChord?.(voiced, undefined, token);
                      }
                    }}
                    onMouseLeave={() => {
                      setHoveredTokenIdx(null);
                      onLeaveHover?.();
                    }}
                    className={`pressable group relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl border cursor-pointer select-none transition ${
                      isSelected
                        ? 'bg-[#FEF3C7] border-[#D97706] text-[#92400E] shadow-xs ring-2 ring-[#D97706]/30 font-bold'
                        : 'bg-[#FAF8F5] border-[#E5DFD7] text-[#1C1917] hover:border-[#D1C8BD]'
                    }`}
                  >
                    <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-black/5 text-[#78716C]">
                      #{idx + 1}
                    </span>
                    <span className="text-xs md:text-sm font-extrabold font-mono tracking-wide">
                      {token}
                    </span>

                    {/* Mini Piano Hover Popover */}
                    {isHovered && voiced && (
                      <MiniPianoPopover chord={voiced} align="top" className="left-0" />
                    )}

                    {/* Remove button */}
                    {tokens.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveChord(idx);
                        }}
                        title={lang === 'vi' ? 'Xóa hợp âm này' : 'Remove chord'}
                        className="opacity-40 group-hover:opacity-100 hover:text-[#DC2626] p-0.5 rounded transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Quick Add Form */}
              <form onSubmit={handleAddChord} className="flex items-center gap-1.5 ml-auto sm:ml-2">
                <input
                  type="text"
                  value={newChordText}
                  onChange={(e) => setNewChordText(e.target.value)}
                  placeholder={lang === 'vi' ? '+ Thêm hợp âm...' : '+ Add chord...'}
                  className="w-28 sm:w-32 bg-[#FAF8F5] border border-[#E5DFD7] rounded-xl px-2.5 py-1.2 text-xs font-mono font-semibold text-[#1C1917] focus:outline-none focus:border-[#D97706]"
                />
                <button
                  type="submit"
                  disabled={!newChordText.trim()}
                  className="pressable px-2.5 py-1.2 rounded-xl bg-[#FAF8F5] hover:bg-[#F5F1EB] disabled:opacity-40 text-xs font-bold text-[#1C1917] border border-[#E5DFD7] flex items-center gap-1 transition"
                >
                  <Plus className="w-3 h-3 text-[#D97706]" />
                  <span>{lang === 'vi' ? 'Thêm' : 'Add'}</span>
                </button>
              </form>
            </div>
          </div>

          {/* 2. Calculated 2-5-1 & Harmonic Cadence Options */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-[#D97706]" />
                <span>
                  {lang === 'vi'
                    ? `2. Các Phương Án 2-5-1 & Hòa Thanh Dẫn Về [ ${activeTargetToken} ]:`
                    : `2. 2-5-1 & Cadence Approaches Leading to [ ${activeTargetToken} ]:`}
                </span>
              </span>
              <span className="text-[11px] text-[#78716C]">
                {cadenceOptions.length} {lang === 'vi' ? 'lựa chọn' : 'options'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {cadenceOptions.map((opt) => {
                const isAuditioning = auditioningId === opt.id;
                const isHovered = hoveredCadenceId === opt.id;
                const title = lang === 'vi' ? opt.titleVi : opt.titleEn;
                const badge = lang === 'vi' ? opt.badgeVi : opt.badgeEn;
                const rationale = lang === 'vi' ? opt.rationaleVi : opt.rationaleEn;

                return (
                  <div
                    key={opt.id}
                    onMouseEnter={() => {
                      setHoveredCadenceId(opt.id);
                      if (opt.previewChords[0]) {
                        onHoverChord?.(opt.previewChords[0], opt.previewChords, title);
                      }
                    }}
                    onMouseLeave={() => {
                      setHoveredCadenceId(null);
                      onLeaveHover?.();
                    }}
                    className="relative p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E5DFD7] hover:border-[#D97706]/40 shadow-xs flex flex-col justify-between gap-3 transition"
                  >
                    {/* Hover Multi-Chord Popover */}
                    {isHovered && opt.previewChords[0] && (
                      <MiniPianoPopover
                        chord={opt.previewChords[0]}
                        multiChords={opt.previewChords}
                        align="top"
                        className="left-0"
                      />
                    )}

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
                          {badge}
                        </span>
                        <span className="text-[10px] font-medium text-[#78716C] font-mono">
                          {opt.insertedFormula}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-[#1C1917] leading-snug line-clamp-1 font-serif">
                        {title}
                      </h4>

                      <div className="p-2 rounded-lg bg-[#FAF8F5] border border-[#F5F1EB] space-y-1">
                        <div className="text-[10px] font-semibold text-[#78716C]">
                          {lang === 'vi' ? 'Chuỗi sau khi áp dụng:' : 'Resulting progression:'}
                        </div>
                        <div className="text-xs font-mono font-bold text-[#D97706] truncate">
                          {opt.resultingFormula}
                        </div>
                      </div>

                      <p className="text-[11px] text-[#78716C] leading-relaxed line-clamp-2">
                        {rationale}
                      </p>
                    </div>

                    {/* Actions Row */}
                    <div className="pt-2 border-t border-[#F5F1EB] flex items-center justify-between gap-2">
                      {/* Audition Button */}
                      <button
                        type="button"
                        onClick={() => handleAudition(opt)}
                        className={`pressable flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
                          isAuditioning
                            ? 'bg-[#DC2626] text-white border-[#DC2626]'
                            : 'bg-[#FAF8F5] hover:bg-[#F5F1EB] text-[#1C1917] border-[#E5DFD7]'
                        }`}
                        title={lang === 'vi' ? 'Nghe thử hòa thanh' : 'Audition chord cadence'}
                      >
                        {isAuditioning ? (
                          <>
                            <Square className="w-3 h-3 fill-current" />
                            <span>{lang === 'vi' ? 'Dừng' : 'Stop'}</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 fill-current text-[#D97706]" />
                            <span>{lang === 'vi' ? 'Nghe' : 'Play'}</span>
                          </>
                        )}
                      </button>

                      {/* Primary Apply Button */}
                      <button
                        type="button"
                        onClick={() => handleApplyAction(opt.resultingFormula)}
                        className="pressable flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold shadow-xs transition"
                      >
                        <span>
                          {opt.actionType === 'insert-before'
                            ? lang === 'vi'
                              ? `Chèn trước [${activeTargetToken}]`
                              : `Insert before [${activeTargetToken}]`
                            : opt.actionType === 'replace-target'
                            ? lang === 'vi'
                              ? `Thay thế [${activeTargetToken}]`
                              : `Replace [${activeTargetToken}]`
                            : opt.actionType === 'append'
                            ? lang === 'vi'
                              ? 'Nối vào cuối'
                              : 'Append to end'
                            : lang === 'vi'
                            ? 'Áp dụng toàn bộ'
                            : 'Apply all'}
                        </span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
