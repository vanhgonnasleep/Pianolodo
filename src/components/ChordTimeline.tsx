import React, { useState } from 'react';
import { BridgeCandidate, GroovePatternId, Language, VibeId, VoicedChord } from '../types/harmony';
import { getBridgeCandidates } from '../engine/bridgeSuggester';
import { t } from '../i18n/translations';
import { MiniPianoPopover } from './MiniPianoPopover';
import { Play, Square, Plus, ShieldCheck, Sparkles, X } from 'lucide-react';

interface ChordTimelineProps {
  originalChords: VoicedChord[];
  reharmonizedChords: VoicedChord[];
  activeChordIndex: number;
  onSelectChord: (index: number) => void;
  isPlaying: boolean;
  playingIndex: number | null;
  playingMode: 'original' | 'reharmonized' | null;
  onPlayOriginal: () => void;
  onPlayReharmonized: () => void;
  onStop: () => void;
  groove: GroovePatternId;
  onGrooveChange: (g: GroovePatternId) => void;
  bpm: number;
  onBpmChange: (bpm: number) => void;
  onInsertBridge: (indexAfter: number, candidate: BridgeCandidate) => void;
  keyRoot: string;
  vibe: VibeId;
  lang: Language;
  onHoverChord?: (chord: VoicedChord, multiChords?: VoicedChord[], label?: string) => void;
  onLeaveHover?: () => void;
}

export const ChordTimeline: React.FC<ChordTimelineProps> = ({
  originalChords,
  reharmonizedChords,
  activeChordIndex,
  onSelectChord,
  isPlaying,
  playingIndex,
  playingMode,
  onPlayOriginal,
  onPlayReharmonized,
  onStop,
  groove,
  onGrooveChange,
  bpm,
  onBpmChange,
  onInsertBridge,
  keyRoot,
  vibe,
  lang,
  onHoverChord,
  onLeaveHover,
}) => {
  const [selectedBridgeSlot, setSelectedBridgeSlot] = useState<number | null>(null);
  const [hoveredTimelineIdx, setHoveredTimelineIdx] = useState<number | null>(null);

  const openBridgeModal = (idx: number) => {
    setSelectedBridgeSlot(idx);
  };

  const closeBridgeModal = () => {
    setSelectedBridgeSlot(null);
    onLeaveHover?.();
  };

  const bridgeCandidates: BridgeCandidate[] =
    selectedBridgeSlot !== null && selectedBridgeSlot < reharmonizedChords.length - 1
      ? getBridgeCandidates(
          reharmonizedChords[selectedBridgeSlot],
          reharmonizedChords[selectedBridgeSlot + 1],
          keyRoot,
          vibe
        )
      : [];

  return (
    <div className="bg-[#FFFFFF] border border-[#E5DFD7] rounded-2xl p-4 md:p-6 shadow-sm space-y-4 overflow-visible">
      {/* Top playback row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F5F1EB] pb-3">
        {/* Playback A/B Buttons */}
        <div className="flex items-center gap-2">
          {isPlaying ? (
            <button
              onClick={onStop}
              className="pressable flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs md:text-sm shadow-md shadow-rose-600/20 transition"
            >
              <Square className="w-4 h-4 fill-current" />
              {t('stopPlayback', lang)}
            </button>
          ) : (
            <>
              <button
                onClick={onPlayOriginal}
                className="pressable flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#EDE8E1] text-[#1C1917] border border-[#E5DFD7] text-xs md:text-sm font-semibold transition"
              >
                <Play className="w-3.5 h-3.5 text-[#78716C]" />
                {t('playOriginal', lang)}
              </button>
              <button
                onClick={onPlayReharmonized}
                className="pressable flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D97706] to-[#B45309] hover:from-[#F59E0B] hover:to-[#D97706] text-white font-bold text-xs md:text-sm shadow-md shadow-[#D97706]/20 transition"
              >
                <Sparkles className="w-4 h-4 fill-white" />
                {t('playReharmonized', lang)}
              </button>
            </>
          )}

          {isPlaying && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] animate-pulse">
              {playingMode === 'original'
                ? t('playingOriginalBadge', lang)
                : t('playingReharmonizedBadge', lang)}
            </span>
          )}
        </div>

        {/* Groove & BPM Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#78716C] font-medium">{t('grooveLabel', lang)}</span>
            <select
              value={groove}
              onChange={(e) => onGrooveChange(e.target.value as GroovePatternId)}
              className="bg-[#FAF8F5] border border-[#E5DFD7] rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#1C1917] focus:outline-none focus:border-[#D97706] cursor-pointer"
            >
              <option value="block">{t('grooveBlock', lang)}</option>
              <option value="ballad-arpeggio">{t('grooveBallad', lang)}</option>
              <option value="rnb-pulse">{t('grooveRnb', lang)}</option>
              <option value="bossa-nova">{t('grooveBossa', lang)}</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#78716C] font-medium">{t('tempoLabel', lang)}</span>
            <span className="text-xs font-mono font-bold text-[#D97706] w-8">{bpm}</span>
            <input
              type="range"
              min="50"
              max="140"
              value={bpm}
              onChange={(e) => onBpmChange(Number(e.target.value))}
              className="w-20 md:w-28 accent-[#D97706]"
            />
          </div>
        </div>
      </div>

      {/* Chord Timeline Sequence */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-thin pt-1">
        {reharmonizedChords.map((chord, idx) => {
          const isActive = activeChordIndex === idx;
          const isChordPlaying = isPlaying && playingIndex === idx;
          const isBridge = chord.functionRole === 'passing-bridge';
          const original = originalChords[idx]?.symbol || chord.originalSymbol || '';
          const isHovered = hoveredTimelineIdx === idx;

          return (
            <React.Fragment key={chord.id || idx}>
              {/* Chord Card */}
              <div
                onClick={() => onSelectChord(idx)}
                onMouseEnter={() => {
                  setHoveredTimelineIdx(idx);
                  onHoverChord?.(chord, undefined, chord.symbol);
                }}
                onMouseLeave={() => {
                  setHoveredTimelineIdx(null);
                  onLeaveHover?.();
                }}
                className={`pressable relative flex-shrink-0 cursor-pointer rounded-2xl p-3 md:p-4 border transition-all duration-200 select-none min-w-[120px] md:min-w-[140px] ${
                  isChordPlaying
                    ? 'ring-2 ring-[#D97706] bg-[#FEF3C7] border-[#D97706] shadow-md'
                    : isActive
                    ? 'bg-[#FEF3C7] border-[#D97706] text-[#1C1917] shadow-sm'
                    : 'bg-[#FAF8F5] border-[#E5DFD7] hover:border-[#D1C8BD] text-[#1C1917]'
                }`}
              >
                {/* Hover Mini-Piano Popover */}
                {isHovered && !isActive && (
                  <MiniPianoPopover chord={chord} align="top" className="left-0" />
                )}

                {/* Header: Roman degree + Badge */}
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-xs font-mono font-bold text-[#D97706]">
                    {chord.romanDegree}
                  </span>
                  {isBridge && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {t('bridgeBadge', lang)}
                    </span>
                  )}
                </div>

                {/* Main Chord Symbol */}
                <div className="text-lg md:text-xl font-extrabold text-[#1C1917] tracking-tight font-serif">
                  {chord.symbol}
                </div>

                {/* Original comparison */}
                {original && original !== chord.symbol && (
                  <div className="text-[11px] text-[#A8A29E] line-through font-mono">
                    {t('originalComparison', lang)}: {original}
                  </div>
                )}

                {/* Smoothness badge */}
                <div className="mt-2 pt-1.5 border-t border-[#E5DFD7]/60 flex items-center justify-between text-[11px] text-[#78716C]">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-[#10B981]" />
                    {t('smoothScore', lang)}
                  </span>
                  <span className="font-mono font-semibold text-[#10B981]">
                    {chord.voiceLeading.smoothnessScore}%
                  </span>
                </div>
              </div>

              {/* [+] Bridge Slot between chords */}
              {idx < reharmonizedChords.length - 1 && (
                <button
                  onClick={() => openBridgeModal(idx)}
                  title={t('bridgeTooltip', lang)}
                  className="pressable flex-shrink-0 w-7 h-7 rounded-full bg-[#FAF8F5] hover:bg-[#FEF3C7] hover:text-[#B45309] hover:border-[#D97706] text-[#78716C] border border-[#E5DFD7] flex items-center justify-center transition shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Origin-Aware Popover: Bridge Candidates Picker */}
      {selectedBridgeSlot !== null && (
        <div className="p-4 md:p-5 rounded-2xl bg-[#FAF8F5] border border-[#D97706]/40 shadow-md space-y-4 popover-spring">
          <div className="flex items-center justify-between border-b border-[#E5DFD7] pb-3">
            <div>
              <h3 className="text-sm md:text-base font-bold text-[#1C1917] flex items-center gap-2 font-serif">
                <Sparkles className="w-4 h-4 text-[#D97706]" />
                {t('bridgeModalTitle', lang)}
              </h3>
              <p className="text-xs text-[#78716C]">
                {t('bridgeModalDesc', lang)}:{' '}
                <span className="text-[#D97706] font-bold font-mono">
                  {reharmonizedChords[selectedBridgeSlot]?.symbol}
                </span>{' '}
                &rarr;{' '}
                <span className="text-[#D97706] font-bold font-mono">
                  {reharmonizedChords[selectedBridgeSlot + 1]?.symbol}
                </span>{' '}
                <span className="text-[11px] text-[#A8A29E] hidden sm:inline">
                  (Rê chuột vào ứng viên để soi phím đàn bên dưới)
                </span>
              </p>
            </div>
            <button
              onClick={closeBridgeModal}
              className="pressable p-1 rounded-lg text-[#78716C] hover:text-[#1C1917] hover:bg-[#EDE8E1]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-1">
            {bridgeCandidates.map((cand) => (
              <div
                key={cand.id}
                onMouseEnter={() => {
                  onHoverChord?.(cand.previewChord, undefined, cand.symbol);
                }}
                onMouseLeave={() => {
                  onLeaveHover?.();
                }}
                className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E5DFD7] hover:border-[#D97706] shadow-xs transition flex flex-col justify-between gap-2"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold text-[#D97706] font-serif">
                        {cand.symbol}
                      </span>
                      <span className="text-xs font-mono font-semibold text-[#78716C]">
                        ({cand.romanDegree})
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
                      {lang === 'vi' ? cand.techniqueName : cand.techniqueNameEn}
                    </span>
                  </div>

                  <p className="text-xs text-[#57534E] leading-relaxed line-clamp-2">
                    {lang === 'vi' ? cand.whySmooth : cand.whySmoothEn}
                  </p>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      onInsertBridge(selectedBridgeSlot, cand);
                      closeBridgeModal();
                    }}
                    className="pressable px-3 py-1.5 rounded-lg bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold transition shadow-xs"
                  >
                    {t('insertBridgeBtn', lang)}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
